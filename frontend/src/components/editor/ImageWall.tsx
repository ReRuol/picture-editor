import type { Asset, AssetKind } from '@/api/assets'

const KIND_LABELS: Record<AssetKind, string> = {
  original: '原图',
  generated: '生成',
  subject: '主体',
  background: '背景',
  mask: '遮罩',
  marketing: '营销',
  export: '导出',
}

/**
 * 会话内全部图片，含未采用的候选。点击切换画布当前图，不覆盖任何已有结果。
 * 只有一张时就是画布本身，整条不显示，把高度让给画布。
 */
export default function ImageWall({
  assets,
  currentId,
  disabled,
  onPick,
}: {
  assets: Asset[]
  currentId: string
  disabled: boolean
  onPick: (assetId: string) => void
}) {
  const shown = assets
    .filter((asset) => asset.kind !== 'mask')
    .filter(
      (asset) =>
        asset.id === currentId || (asset.kind !== 'subject' && asset.kind !== 'background'),
    )
  if (shown.length <= 1) return null

  return (
    <div className="border-line bg-paper animate-fade-in shrink-0 border-t">
      <div className="scrollbar-slim flex scroll-px-4 items-start gap-3 overflow-x-auto px-4 pt-2.5 pb-2">
        {shown.map((asset) => {
          const active = asset.id === currentId
          return (
            <button
              key={asset.id}
              type="button"
              disabled={disabled || active}
              onClick={() => onPick(asset.id)}
              title={
                active
                  ? `当前画布 · ${KIND_LABELS[asset.kind]}`
                  : `采用这张 · ${KIND_LABELS[asset.kind]} ${asset.width}×${asset.height}`
              }
              className="group flex shrink-0 flex-col items-center gap-1 disabled:cursor-default"
            >
              <span
                className={`bg-stage rounded-chip block size-12 overflow-hidden border-2 transition-[border-color,box-shadow,translate] duration-150 ${
                  active
                    ? 'border-brand shadow-print'
                    : 'border-line group-hover:border-brand group-active:translate-px'
                }`}
              >
                <img src={asset.url} alt="" loading="lazy" className="size-full object-contain" />
              </span>
              <span
                className={`text-[10px] leading-none ${active ? 'text-brand font-semibold' : 'text-faint'}`}
              >
                {KIND_LABELS[asset.kind]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
