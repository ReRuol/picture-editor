import { Link } from 'react-router-dom'

export default function StartBanner({ label, to }: { label: string; to: string }) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div className="bg-brand rounded-panel shadow-card relative isolate overflow-hidden px-8 py-14 text-center">
        {/* 角落一枚粉色网点圆，与首屏的套印装饰呼应 */}
        <span
          className="text-accent bg-halftone absolute -right-16 -bottom-24 size-72 rounded-full opacity-90 mix-blend-multiply"
          aria-hidden
        />

        <div className="relative">
          <h2 className="font-display text-paper text-3xl sm:text-4xl">把商品图交给智能体</h2>
          <p className="text-paper/75 mx-auto mt-3 max-w-md text-sm leading-relaxed">
            登录即可开始，第一句需求就能拿到可上架的候选图。
          </p>

          <Link
            to={to}
            className="bg-paper text-brand rounded-control mt-8 inline-flex px-6 py-3 text-sm font-semibold shadow-[3px_3px_0_var(--color-accent)] transition-[translate] active:translate-px"
          >
            {label}
          </Link>
        </div>
      </div>
    </section>
  )
}
