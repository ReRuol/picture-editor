import { useRef, useState } from 'react'

import PromptComposer from './PromptComposer'

const SCENARIOS = [
  {
    label: '商品主图',
    prompt: '把这件商品放在纯白背景上，居中构图，柔和顶光，边缘干净，输出 1:1 主图。',
  },
  {
    label: '场景氛围图',
    prompt: '把商品放到温暖的木质桌面场景，侧逆光、浅景深，保留商品原有材质与颜色。',
  },
  {
    label: '模特上身',
    prompt: '生成模特手持该商品的半身展示图，简洁室内背景、自然光，商品细节清晰可辨。',
  },
  {
    label: '促销海报',
    prompt: '做一张大促海报：主标题「新品首发」，副标题「限时 8 折」，突出商品，右侧留出文字区。',
  },
  {
    label: '多尺寸物料',
    prompt: '基于这张商品图输出一套投放物料，包含 1:1、4:5、9:16 三个尺寸，主体不被裁切。',
  },
]

const FACTS = ['无需设计经验', '支持 JPG / PNG / WebP', '1:1 / 4:5 / 9:16 一次导出']

export default function LandingHero({
  initialPrompt,
  submitLabel,
  onStart,
}: {
  initialPrompt: string
  submitLabel: string
  onStart: (prompt: string) => void
}) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const pick = (text: string) => {
    setPrompt(text)
    inputRef.current?.focus()
  }

  return (
    <section className="relative isolate overflow-hidden">
      <OverprintDots />

      <div className="relative mx-auto max-w-5xl px-6 pt-14 pb-16 sm:pt-20">
        <p
          className="text-accent-strong animate-rise font-mono text-xs tracking-[0.2em]"
          style={{ animationDelay: '40ms' }}
        >
          FOR 电商运营 · 内容创作者
        </p>

        <h1
          className="font-display text-print animate-rise mt-5 max-w-3xl text-[2.6rem] leading-[1.08] text-balance sm:text-[3.6rem] lg:text-[4.4rem]"
          style={{ animationDelay: '120ms' }}
        >
          一句话，
          <br />
          交付<span className="mark-print whitespace-nowrap">可上架</span>的商品物料
        </h1>

        <p
          className="text-muted animate-rise mt-6 max-w-xl leading-relaxed"
          style={{ animationDelay: '200ms' }}
        >
          描述需求即可从零生成，也可上传商品图继续编辑。抠图、换背景、局部精修、扩图、图层拆分与多尺寸导出，全部由智能体自动编排。
        </p>

        <div className="animate-rise mt-9 max-w-3xl" style={{ animationDelay: '280ms' }}>
          <PromptComposer
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => onStart(prompt)}
            onAttach={() => onStart(prompt)}
            submitLabel={submitLabel}
            placeholder="描述你想要的商品图，例：把这双跑鞋放到清晨的城市街道，侧逆光，输出 1:1 主图与 9:16 竖版…"
            inputRef={inputRef}
          />
        </div>

        <div
          className="animate-rise mt-4 flex max-w-3xl flex-wrap gap-2"
          style={{ animationDelay: '360ms' }}
        >
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.label}
              type="button"
              onClick={() => pick(scenario.prompt)}
              className="border-line bg-paper text-ink hover:border-accent hover:text-accent-strong rounded-chip border px-3 py-1.5 text-xs transition-colors active:translate-px"
            >
              {scenario.label}
            </button>
          ))}
        </div>

        <ul
          className="text-faint animate-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px]"
          style={{ animationDelay: '440ms' }}
        >
          {FACTS.map((fact, index) => (
            <li key={fact}>
              <span className="text-accent-strong mr-1.5">0{index + 1}</span>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** 右上角的套印装饰：粉色实心圆叠一枚蓝色网点圆，multiply 混合出第三色 */
function OverprintDots() {
  return (
    <div
      className="pointer-events-none absolute top-8 -right-24 hidden size-[460px] md:block lg:right-[-40px]"
      aria-hidden
    >
      <span className="bg-accent absolute top-0 left-0 size-[340px] rounded-full opacity-80 mix-blend-multiply" />
      <span className="text-brand bg-halftone absolute top-[110px] left-[110px] size-[340px] rounded-full mix-blend-multiply" />
    </div>
  )
}
