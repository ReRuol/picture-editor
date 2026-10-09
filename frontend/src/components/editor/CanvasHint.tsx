export default function CanvasHint({ mode, text }: { mode: string; text: string | null }) {
  if (!text) return null

  return (
    <p
      // 按模式换 key：切模式重播入场动画，同一模式内刷新百分比不打断
      key={mode}
      className="bg-ink text-paper shadow-print rounded-chip animate-pop pointer-events-none absolute top-3 left-3 z-10 px-2.5 py-1 text-[11px]"
    >
      {text}
    </p>
  )
}
