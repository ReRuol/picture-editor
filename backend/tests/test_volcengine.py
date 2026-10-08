import base64
import io
import json

import httpx
import pytest
from PIL import Image

from app.agent.llm import PlannerUnavailable, planner
from app.config import get_settings
from app.providers import EditRequest, GenerateRequest
from app.providers.base import ProviderError
from app.providers.volcengine import VolcengineImageProvider, fit_size


def _png(width: int = 64, height: int = 48) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (width, height), (200, 80, 40)).save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.fixture
def volcengine(monkeypatch):
    """装上假的方舟接口，返回 (provider, 收到的请求体列表)。"""
    monkeypatch.setattr(get_settings(), "volcengine_api_key", "test-key")
    calls: list[dict] = []
    result = base64.b64encode(_png()).decode()

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/images/generations")
        assert request.headers["authorization"] == "Bearer test-key"
        calls.append(json.loads(request.content))
        return httpx.Response(200, json={"data": [{"b64_json": result}]})

    provider = VolcengineImageProvider()
    provider._client = httpx.AsyncClient(
        base_url="https://ark.test/api/v3",
        headers=provider._client.headers,
        transport=httpx.MockTransport(handler),
    )
    return provider, calls


async def test_generate_requests_one_image_per_candidate(volcengine):
    provider, calls = volcengine

    images = await provider.generate(
        GenerateRequest(prompt="海边日落", width=1024, height=1024, count=4, negative_prompt="文字")
    )

    assert len(images) == 4
    assert Image.open(io.BytesIO(images[0])).size == (64, 48)
    assert len(calls) == 4
    body = calls[0]
    assert body["response_format"] == "b64_json"
    assert body["watermark"] is False
    assert "image" not in body
    assert "避免：文字" in body["prompt"]
    width, height = map(int, body["size"].split("x"))
    assert width == height and width * height >= 1280 * 720


async def test_edit_inlines_source_image(volcengine):
    provider, calls = volcengine

    await provider.edit(EditRequest(prompt="换成海滩背景", image=_png(800, 600)))

    body = calls[0]
    assert body["image"].startswith("data:image/png;base64,")
    width, height = map(int, body["size"].split("x"))
    assert abs(width / height - 800 / 600) < 0.01


async def test_upscale_returns_single_image(volcengine):
    provider, calls = volcengine

    result = await provider.upscale(_png(), 2)

    assert isinstance(result, bytes)
    assert len(calls) == 1


async def test_api_error_becomes_provider_error(monkeypatch):
    monkeypatch.setattr(get_settings(), "volcengine_api_key", "test-key")
    provider = VolcengineImageProvider()
    provider._client = httpx.AsyncClient(
        base_url="https://ark.test/api/v3",
        transport=httpx.MockTransport(
            lambda _: httpx.Response(
                400, json={"error": {"code": "InvalidParameter", "message": "size 不合法"}}
            )
        ),
    )

    with pytest.raises(ProviderError, match="size 不合法"):
        await provider.generate(GenerateRequest(prompt="x", width=512, height=512))


def test_missing_api_key_is_refused(monkeypatch):
    monkeypatch.setattr(get_settings(), "volcengine_api_key", "")

    with pytest.raises(ProviderError, match="VOLCENGINE_API_KEY"):
        VolcengineImageProvider()


def test_size_stays_within_model_limits():
    small = fit_size(426, 240)
    assert small[0] * small[1] >= 1280 * 720
    assert max(fit_size(8000, 4000)) <= 4096
    assert fit_size(2048, 2048) == (2048, 2048)


def test_planner_uses_volcengine_when_selected(monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "planner_provider", "volcengine")
    monkeypatch.setattr(settings, "volcengine_api_key", "")
    planner.cache_clear()
    try:
        with pytest.raises(PlannerUnavailable, match="VOLCENGINE_API_KEY"):
            planner()

        monkeypatch.setattr(settings, "volcengine_api_key", "test-key")
        planner.cache_clear()
        bound = planner()
        assert bound.bound.openai_api_base == settings.volcengine_base_url
        assert bound.bound.model_name == settings.volcengine_planner_model
    finally:
        planner.cache_clear()
