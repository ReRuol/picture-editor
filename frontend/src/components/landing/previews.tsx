/**
 * 能力卡片的示意图：全部用样式拼出产品界面，不依赖任何图片资源。
 * 均为装饰性内容，对辅助技术隐藏。
 */

// 两种油墨的浅调与叠印出的紫，是 Riso 两色印刷能出的全部色相
const TILES = ['bg-brand-soft', 'bg-accent-soft', 'bg-[#eadcf0]', 'bg-paper']

/** 一句话生成：四个候选方向，其中一个被选中。 */
export function CandidatesPreview() {
  return (
    <div className="grid aspect-square h-full grid-cols-2 gap-2 p-1" aria-hidden>
      {TILES.map((tone, index) => (
        <div
          key={tone}
          className={`relative grid place-items-center rounded-control ${tone} ${
            index === 1 ? 'border-brand shadow-print border-2' : 'border-line border'
          }`}
        >
          <span className="text-brand bg-halftone h-6 w-5" />
          {index === 1 && (
            <span className="bg-brand absolute top-1 right-1 grid size-3.5 place-items-center">
              <svg viewBox="0 0 24 24" fill="none" className="size-2">
                <path d="M5 13l4.5 4.5L19 7" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/** 主体级编辑：选区框住主体，指令只作用于框内。 */
export function SelectionPreview() {
  return (
    <div
      className="border-line bg-brand-soft relative aspect-[4/3] h-full max-h-full w-auto overflow-hidden rounded-control border"
      aria-hidden
    >
      <div className="border-brand absolute top-[18%] left-[22%] h-[54%] w-[38%] rounded-control border-2 border-dashed">
        <span className="bg-accent absolute inset-1.5 opacity-60 mix-blend-multiply" />
        {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos) => (
          <span key={pos} className={`bg-paper border-brand absolute size-2 border-2 ${pos}`} />
        ))}
      </div>
      <p className="bg-ink text-paper absolute bottom-2.5 left-2.5 rounded-chip px-2.5 py-1 text-[10px]">
        把背景换成米色亚麻
      </p>
    </div>
  )
}

const LAYERS = [
  { name: '文字 · 卖点标注', tone: 'bg-accent/70', indent: 'ml-0' },
  { name: '主体 · 商品', tone: 'bg-brand/60', indent: 'ml-3' },
  { name: '背景 · 场景', tone: 'bg-line-strong', indent: 'ml-6' },
]

/** 语义图层：主体、背景、文字自动分层。 */
export function LayersPreview() {
  return (
    <div className="w-full max-w-[210px] space-y-1.5" aria-hidden>
      {LAYERS.map((layer) => (
        <div
          key={layer.name}
          className={`border-line bg-paper shadow-control flex items-center gap-2.5 rounded-control border px-2.5 py-2 ${layer.indent}`}
        >
          <span className={`size-4 shrink-0 rounded-chip ${layer.tone}`} />
          <span className="text-muted flex-1 truncate text-[11px]">{layer.name}</span>
          <svg viewBox="0 0 24 24" fill="none" className="text-faint size-3.5">
            <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </div>
      ))}
    </div>
  )
}

const RATIOS = [
  { label: '1:1', frame: 'h-[62px] w-[62px]' },
  { label: '4:5', frame: 'h-[70px] w-[56px]' },
  { label: '9:16', frame: 'h-[78px] w-[44px]' },
]

/** 物料包交付：一次导出多个投放尺寸。 */
export function ExportsPreview() {
  return (
    <div className="flex items-end gap-3" aria-hidden>
      {RATIOS.map((ratio) => (
        <div key={ratio.label} className="flex flex-col items-center gap-1.5">
          <div
            className={`border-line bg-brand-soft grid place-items-center rounded-control border ${ratio.frame}`}
          >
            <span className="text-accent bg-halftone h-2/5 w-1/3" />
          </div>
          <span className="text-faint font-mono text-[10px]">{ratio.label}</span>
        </div>
      ))}
    </div>
  )
}
