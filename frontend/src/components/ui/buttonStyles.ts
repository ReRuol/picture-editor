export type ButtonVariant = 'ghost' | 'solid' | 'outline' | 'icon'
export type ButtonSize = 'sm' | 'md'

// 按下时整块往阴影方向落 1px，像压在纸上；禁用时去掉套印阴影，只留淡色油墨
const BASE =
  'relative overflow-hidden font-medium transition-[background-color,color,border-color,box-shadow,translate] duration-150 active:translate-x-px active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-none'

const SHAPE: Record<ButtonSize, string> = {
  sm: 'rounded-chip px-2 py-1 text-[11px]',
  md: 'rounded-control px-2.5 py-1.5 text-xs',
}

const ICON_SHAPE: Record<ButtonSize, string> = {
  sm: 'rounded-chip grid size-7 place-items-center text-sm',
  md: 'rounded-control grid size-8 place-items-center text-sm',
}

const IDLE: Record<ButtonVariant, string> = {
  ghost: 'text-muted hover:bg-soft hover:text-ink',
  solid: 'bg-brand text-paper shadow-print hover:bg-brand-strong',
  outline: 'border-line text-ink hover:border-brand hover:text-brand border bg-paper',
  icon: 'text-muted hover:bg-soft hover:text-ink',
}

// 选中一律是实心蓝油墨，全站只有这一种选中态
const ON: Record<ButtonVariant, string> = {
  ghost: 'bg-brand text-paper',
  solid: 'bg-brand-strong text-paper shadow-print',
  outline: 'border-brand bg-brand text-paper border',
  icon: 'bg-brand text-paper',
}

export type ButtonLook = {
  variant?: ButtonVariant
  size?: ButtonSize
  active?: boolean
  block?: boolean
}

/** 供 Link 等非 button 元素复用同一套手感。 */
export function buttonClass({ variant = 'ghost', size = 'md', active, block }: ButtonLook = {}) {
  return [
    BASE,
    variant === 'icon' ? ICON_SHAPE[size] : SHAPE[size],
    active ? ON[variant] : IDLE[variant],
    block ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ')
}
