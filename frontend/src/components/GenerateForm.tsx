import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'

import { ACCEPTED_TYPES } from '@/api/assets'
import { RATIO_LABELS, type GenerateInput, type Ratio } from '@/api/runs'
import { checkFile } from '@/hooks/useAssets'

const RATIOS = Object.keys(RATIO_LABELS) as Ratio[]
const COUNTS = [1, 2, 4, 6]

/**
 * 创作入口：写描述生成，或者直接上传已有图片进编辑。
 * 上传收在同一张卡片里（与首页输入框一致），整张卡片都能拖图进来。
 */
export default function GenerateForm({
  onSubmit,
  pending,
  defaultPrompt = '',
  onFile,
  uploading = false,
}: {
  onSubmit: (input: GenerateInput) => void
  pending: boolean
  defaultPrompt?: string
  onFile: (file: File) => void
  uploading?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const accept = (file: File | undefined) => {
    if (!file || uploading) return
    const problem = checkFile(file)
    setFileError(problem)
    if (!problem) onFile(file)
  }

  const [prompt, setPrompt] = useState(defaultPrompt)
  const [ratio, setRatio] = useState<Ratio>('1:1')
  const [count, setCount] = useState(4)
  const [negative, setNegative] = useState('')
  const [advanced, setAdvanced] = useState(false)

  const canSubmit = prompt.trim().length > 0 && !pending

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        onSubmit({
          prompt: prompt.trim(),
          ratio,
          count,
          negative_prompt: negative.trim() || undefined,
        })
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        accept(event.dataTransfer.files[0])
      }}
      className={`bg-paper shadow-card rounded-panel relative border-2 p-2 transition-colors ${
        dragging ? 'border-accent bg-accent-soft' : 'border-ink focus-within:border-brand'
      }`}
    >
      {dragging && (
        <p className="text-accent-strong pointer-events-none absolute inset-0 z-10 grid place-items-center text-sm font-semibold">
          松手上传，直接进编辑
        </p>
      )}
      <textarea
        rows={3}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }
        }}
        placeholder="描述你想要的画面，例如：白色陶瓷马克杯放在浅木色桌面，晨光从左侧照入"
        aria-label="画面描述"
        className="text-ink placeholder:text-faint w-full resize-none bg-transparent px-4 pt-3 pb-1 text-[15px] leading-relaxed outline-none"
      />

      <div className="flex flex-wrap items-center gap-2 px-2 pb-1">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          title="JPG / PNG / WebP，单张不超过 20 MB"
          className="border-line text-ink hover:border-brand hover:text-brand rounded-control flex h-8 items-center gap-1.5 border px-2.5 text-[13px] transition-colors disabled:opacity-50"
        >
          <ImagePlus className="size-4" aria-hidden />
          {uploading ? '上传中…' : '上传已有图'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          hidden
          onChange={(event) => {
            accept(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <Segmented
          label="比例"
          options={RATIOS.map((value) => ({ value, label: value }))}
          value={ratio}
          onChange={setRatio}
        />
        <Segmented
          label="数量"
          options={COUNTS.map((value) => ({ value, label: String(value) }))}
          value={count}
          onChange={setCount}
        />

        <button
          type="button"
          onClick={() => setAdvanced((open) => !open)}
          aria-expanded={advanced}
          className={`rounded-control flex h-8 items-center border px-2.5 text-[13px] transition-colors ${
            advanced ? 'border-brand text-brand' : 'border-line text-muted hover:text-ink'
          }`}
        >
          {advanced ? '收起排除项' : '排除项'}
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-brand hover:bg-brand-strong text-paper shadow-print rounded-control ml-auto h-9 px-5 text-sm font-semibold transition-[background-color,translate] duration-150 active:translate-px disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-none"
        >
          {pending ? '提交中…' : '生成'}
        </button>
      </div>
      <p className="text-faint px-3 pt-1 pb-2 font-mono text-[11px]">
        {pending ? '任务已提交，稍后会跳到候选页' : 'Enter 生成 · Shift+Enter 换行 · 也可以把图拖进来'}
      </p>
      {fileError && <p className="text-danger px-3 pb-2 text-xs">{fileError}</p>}

      {advanced && (
        <div className="border-line animate-fade-in mt-1 border-t px-4 py-3">
          <input
            value={negative}
            onChange={(event) => setNegative(event.target.value)}
            placeholder="不希望出现的内容，例如：文字、水印、多余的手"
            aria-label="排除项"
            className="text-ink placeholder:text-faint w-full bg-transparent text-sm outline-none"
          />
        </div>
      )}
    </form>
  )
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="border-line rounded-control flex h-8 items-center gap-0.5 border p-0.5">
      <span className="text-faint px-1.5 text-[13px]">{label}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={`rounded-chip h-full min-w-7 px-2 font-mono text-xs transition-colors duration-150 ${
            option.value === value ? 'bg-brand text-paper' : 'text-muted hover:bg-soft hover:text-ink'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
