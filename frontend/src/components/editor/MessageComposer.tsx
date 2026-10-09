import Button from '@/components/ui/Button'

/** 草稿由外层持有，空状态里的示例指令点一下就能填进来 */
export default function MessageComposer({
  value: text,
  onChange: setText,
  pending,
  error,
  placeholder = '说说要怎么改',
  onSend,
}: {
  value: string
  onChange: (text: string) => void
  pending: boolean
  error?: string | null
  placeholder?: string
  onSend: (text: string) => void
}) {
  const canSend = text.trim().length > 0 && !pending

  const submit = () => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="border-line shrink-0 border-t p-3">
      <textarea
        rows={2}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        aria-label="修图指令"
        className="border-line bg-paper text-ink placeholder:text-faint rounded-control focus:border-brand w-full resize-none border px-3 py-2 text-xs leading-relaxed outline-none transition-colors"
      />
      <Button variant="solid" block className="mt-2 py-2" disabled={!canSend} onClick={submit}>
        {pending ? '思考中…' : '发送 ↵'}
      </Button>
      {error && <p className="text-danger mt-2 text-[11px] leading-relaxed">{error}</p>}
    </div>
  )
}
