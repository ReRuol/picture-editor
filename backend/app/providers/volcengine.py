import asyncio
import base64
import io
import math

import httpx
from PIL import Image

from app.config import get_settings
from app.providers.base import (
    EditRequest,
    GenerateRequest,
    ImageProvider,
    ProgressCallback,
    ProviderError,
)

_GENERATE_PATH = "/images/generations"
_TIMEOUT = 180.0
# Seedream 4.0：总像素 [1280*720, 4096*4096]，单边不超过 4096
_MIN_PIXELS = 1280 * 720
_MAX_EDGE = 4096


class VolcengineImageProvider(ImageProvider):
    """火山引擎方舟 Seedream 图像模型。

    文生图和图像编辑共用 /images/generations，传 image 即为编辑，同步返回。
    接口一次只稳定返回一张独立图片，count 张通过并发请求实现。
    """

    name = "volcengine"

    def __init__(self) -> None:
        settings = get_settings()
        if not settings.volcengine_api_key:
            raise ProviderError("未配置 VOLCENGINE_API_KEY")
        self._model = settings.volcengine_image_model
        self._client = httpx.AsyncClient(
            base_url=settings.volcengine_base_url,
            headers={"Authorization": f"Bearer {settings.volcengine_api_key}"},
            timeout=_TIMEOUT,
        )

    async def generate(
        self, request: GenerateRequest, on_progress: ProgressCallback | None = None
    ) -> list[bytes]:
        payload = self._payload(
            _with_negative(request.prompt, request.negative_prompt),
            fit_size(request.width, request.height),
            [_data_uri(raw) for raw in request.references],
        )
        return await self._run(payload, request.count, on_progress)

    async def edit(
        self, request: EditRequest, on_progress: ProgressCallback | None = None
    ) -> list[bytes]:
        if request.width and request.height:
            size = fit_size(request.width, request.height)
        else:
            source = Image.open(io.BytesIO(request.image))
            size = fit_size(source.width, source.height)
        payload = self._payload(
            _with_negative(request.prompt, request.negative_prompt),
            size,
            [_data_uri(request.image)],
        )
        return await self._run(payload, request.count, on_progress)

    async def upscale(
        self, image: bytes, scale: int, on_progress: ProgressCallback | None = None
    ) -> bytes:
        source = Image.open(io.BytesIO(image))
        results = await self.edit(
            EditRequest(
                prompt="提高清晰度，保持主体、构图和颜色不变，不要添加新元素。",
                image=image,
                width=source.width * scale,
                height=source.height * scale,
            ),
            on_progress,
        )
        return results[0]

    def _payload(self, prompt: str, size: tuple[int, int], images: list[str]) -> dict:
        payload: dict = {
            "model": self._model,
            "prompt": prompt,
            "size": f"{size[0]}x{size[1]}",
            "response_format": "b64_json",
            "watermark": False,
            "sequential_image_generation": "disabled",
        }
        if images:
            payload["image"] = images[0] if len(images) == 1 else images
        return payload

    async def _run(
        self, payload: dict, count: int, on_progress: ProgressCallback | None
    ) -> list[bytes]:
        if on_progress:
            await on_progress(20, "提交生成")
        done = 0

        async def one() -> bytes:
            nonlocal done
            result = await self._request(payload)
            done += 1
            if on_progress:
                await on_progress(20 + int(done / count * 70), f"完成 {done} / {count} 张")
            return result

        return list(await asyncio.gather(*(one() for _ in range(count))))

    async def _request(self, payload: dict) -> bytes:
        try:
            response = await self._client.post(_GENERATE_PATH, json=payload)
        except httpx.HTTPError as exc:
            raise ProviderError(f"火山引擎请求失败：{exc}") from exc
        body = _parse(response)
        items = body.get("data") or []
        encoded = next((item.get("b64_json") for item in items if item.get("b64_json")), None)
        if not encoded:
            raise ProviderError("生成任务成功但未返回图片")
        return base64.b64decode(encoded)


def _parse(response: httpx.Response) -> dict:
    try:
        body = response.json()
    except ValueError as exc:
        raise ProviderError(f"模型服务返回非 JSON 响应（HTTP {response.status_code}）") from exc

    error = body.get("error")
    if response.status_code != httpx.codes.OK or error:
        message = (error or {}).get("message") if isinstance(error, dict) else None
        raise ProviderError(message or f"模型服务错误 HTTP {response.status_code}")
    return body


def _data_uri(raw: bytes) -> str:
    # 本地对象存储无法被模型服务访问，图片一律以 base64 内联
    return f"data:image/png;base64,{base64.b64encode(raw).decode()}"


def _with_negative(prompt: str, negative: str | None) -> str:
    # Seedream 没有 negative_prompt 参数，并入提示词
    return f"{prompt}\n避免：{negative}" if negative else prompt


def fit_size(width: int, height: int) -> tuple[int, int]:
    """保持比例，把画幅缩放到 Seedream 允许的像素范围内。"""
    scale = 1.0
    if width * height < _MIN_PIXELS:
        scale = math.sqrt(_MIN_PIXELS / (width * height))
    long_edge = max(width, height) * scale
    if long_edge > _MAX_EDGE:
        scale *= _MAX_EDGE / long_edge
    # 向上取整保住最小像素，再夹住浮点误差可能顶出的上限
    return (
        min(_MAX_EDGE, max(1, math.ceil(width * scale))),
        min(_MAX_EDGE, max(1, math.ceil(height * scale))),
    )
