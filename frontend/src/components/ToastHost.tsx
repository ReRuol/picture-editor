import { useToasts } from '@/stores/toasts'

export default function ToastHost() {
  const items = useToasts((state) => state.items)
  const dismiss = useToasts((state) => state.dismiss)

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`shadow-print rounded-control pointer-events-auto flex items-center gap-1.5 text-xs font-medium ${
            item.action ? 'py-1 pr-1 pl-3.5' : 'px-3.5 py-1.5'
          } ${item.leaving ? 'animate-fade-out' : 'animate-pop'} ${
            item.tone === 'danger' ? 'bg-danger text-paper' : 'bg-ink text-paper'
          }`}
        >
          <button type="button" onClick={() => dismiss(item.id)} className="text-left">
            {item.text}
          </button>
          {item.action && (
            <button
              type="button"
              onClick={() => {
                item.action?.run()
                dismiss(item.id)
              }}
              className="bg-accent text-ink rounded-chip px-2.5 py-1 font-semibold transition-colors duration-150 hover:bg-accent-soft active:translate-px"
            >
              {item.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
