import { ArrowRight } from 'lucide-react'

type Size = { width: number; height: number }
type View = { scale: number; x: number; y: number }

// 图片在视口里露出不到这么多就提示，留一小块边角也算「找不到了」
const LOST_BELOW = 0.2

/**
 * 画布拖得太远、图片几乎看不见时，在底部给一个「回到画面」，箭头指向图片所在方向。
 * 适应窗口原本只有快捷键 0 和双击空白处，拖丢了的人通常不知道。
 */
export default function OffscreenFinder({
  canvas,
  view,
  viewport,
  onFind,
}: {
  canvas: Size
  view: View
  viewport: Size
  onFind: () => void
}) {
  if (!viewport.width || !viewport.height) return null

  const left = view.x
  const top = view.y
  const width = canvas.width * view.scale
  const height = canvas.height * view.scale
  const overlapX = Math.max(0, Math.min(left + width, viewport.width) - Math.max(left, 0))
  const overlapY = Math.max(0, Math.min(top + height, viewport.height) - Math.max(top, 0))
  // 以较小的一方为分母：放大到图片盖满视口时也算完全可见
  const base = Math.min(width * height, viewport.width * viewport.height)
  if (base <= 0 || (overlapX * overlapY) / base >= LOST_BELOW) return null

  const angle = Math.atan2(
    top + height / 2 - viewport.height / 2,
    left + width / 2 - viewport.width / 2,
  )

  return (
    <button
      type="button"
      onClick={onFind}
      title="适应窗口 · 按 0，画布空白处双击同样生效"
      className="bg-ink text-paper shadow-print rounded-control animate-pop absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 px-3 py-2 text-xs font-semibold transition-[translate] active:translate-y-px"
    >
      <ArrowRight
        className="text-accent size-4 transition-transform duration-150"
        style={{ transform: `rotate(${angle}rad)` }}
        aria-hidden
      />
      图片在这边 · 回到画面
      <kbd className="border-paper/30 rounded-chip border px-1 font-mono text-[10px]">0</kbd>
    </button>
  )
}
