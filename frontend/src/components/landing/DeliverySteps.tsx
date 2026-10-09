const STEPS = [
  { title: '描述需求', desc: '一句话说清商品、场景与尺寸。' },
  { title: '挑选方向', desc: '从 4 个候选里选中最合适的一张。' },
  { title: '局部精修', desc: '点选主体下指令，反复改到满意。' },
  { title: '导出物料', desc: '按投放渠道一次导出全部尺寸。' },
]

export default function DeliverySteps() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <p className="text-accent-strong mb-4 font-mono text-xs tracking-[0.2em]">02 / 流程</p>
      <ol className="border-ink bg-paper rounded-card divide-ink grid divide-y-2 border-2 sm:grid-cols-4 sm:divide-x-2 sm:divide-y-0">
        {STEPS.map((step, index) => (
          <li key={step.title} className="p-6">
            <span className="bg-brand text-paper shadow-print rounded-chip font-mono grid size-7 place-items-center text-xs font-semibold">
              {index + 1}
            </span>
            <h3 className="text-ink mt-4 text-sm font-semibold">{step.title}</h3>
            <p className="text-muted mt-1.5 text-sm leading-relaxed">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
