import { useEffect, useRef, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import type { PlanStep, StepStatus, Turn } from '@/api/agent'
import { isTerminal } from '@/api/runs'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { usePlanActions, useTurns } from '@/hooks/useAgent'
import { useRun } from '@/hooks/useRun'

const STEP_LABEL: Record<StepStatus, string> = {
  pending: '等待中',
  waiting: '待确认',
  queued: '排队中',
  running: '进行中',
  succeeded: '已完成',
  failed: '未完成',
  canceled: '已取消',
}

const EXAMPLES = ['去背景再水平翻转', '背景换成浅木色桌面', '整体调亮一点，色温偏暖', '扩成 16:9 横图']

export default function AgentConversation({
  sessionId,
  onExample,
}: {
  sessionId: string
  onExample: (text: string) => void
}) {
  const { data: turns = [], isPending } = useTurns(sessionId)
  const end = useRef<HTMLDivElement>(null)
  const latest = turns.at(-1)

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [turns.length, latest?.status])

  if (isPending) {
    return <p className="text-faint min-h-0 flex-1 px-4 py-4 text-xs">加载中…</p>
  }

  if (turns.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <p className="text-print font-display text-2xl leading-tight">说一句，<br />我来改。</p>
        <p className="text-muted mt-2 text-xs leading-relaxed">多步的会先列出计划，你点头再执行。</p>
        <div className="mt-4 flex flex-col items-start gap-1.5">
          {EXAMPLES.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => onExample(text)}
              className="border-line bg-paper text-ink hover:border-accent hover:text-accent-strong rounded-chip border px-2.5 py-1.5 text-left text-xs transition-colors duration-150 active:translate-px"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
      {turns.map((turn) => (
        <TurnBlock key={turn.id} turn={turn} sessionId={sessionId} />
      ))}
      <div ref={end} />
    </div>
  )
}

function TurnBlock({ turn, sessionId }: { turn: Turn; sessionId: string }) {
  return (
    <div className="space-y-2">
      <p className="bg-brand text-paper shadow-print rounded-control ml-6 px-3 py-2 text-xs leading-relaxed">
        {turn.goal}
      </p>

      {turn.error ? (
        <p className="text-danger mr-6 text-xs leading-relaxed">{turn.error}</p>
      ) : (
        <p className="text-ink mr-6 text-xs leading-relaxed">{turn.reply}</p>
      )}

      {turn.steps.map((step, index) => (
        <StepCard key={step.id} index={index + 1} step={step} sessionId={sessionId} />
      ))}

      <PlanActions turn={turn} sessionId={sessionId} />
    </div>
  )
}

function PlanActions({ turn, sessionId }: { turn: Turn; sessionId: string }) {
  const actions = usePlanActions(sessionId)
  if (turn.status === 'queued') {
    return (
      <div className="mr-6 flex gap-1.5">
        <Action disabled={actions.busy} onClick={() => actions.confirm(turn.id)}>
          执行计划
        </Action>
        <Action disabled={actions.busy} onClick={() => actions.cancel(turn.id)}>
          取消
        </Action>
      </div>
    )
  }
  if (turn.status === 'running') {
    return (
      <div className="mr-6">
        <Action disabled={actions.busy} onClick={() => actions.cancel(turn.id)}>
          取消后续
        </Action>
      </div>
    )
  }
  if (turn.status === 'failed') {
    return (
      <div className="mr-6">
        <Action disabled={actions.busy} onClick={() => actions.retry(turn.id)}>
          重试失败步骤
        </Action>
      </div>
    )
  }
  return null
}

function Action({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button variant="outline" size="sm" disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}

function StepCard({
  index,
  step,
  sessionId,
}: {
  index: number
  step: PlanStep
  sessionId: string
}) {
  const queryClient = useQueryClient()
  const { status, progress, stage, error } = useRun(step.run_id)
  const watched = useRef(false)
  const current = status ?? step.status
  const running = current === 'queued' || current === 'running'

  useEffect(() => {
    if (status === 'queued' || status === 'running') watched.current = true
    if (!watched.current || !status || !isTerminal(status)) return
    watched.current = false
    void queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
    void queryClient.invalidateQueries({ queryKey: ['session', sessionId, 'history'] })
    void queryClient.invalidateQueries({ queryKey: ['session', sessionId, 'messages'] })
  }, [status, sessionId, queryClient])

  return (
    <div className="border-line mr-6 rounded-control border px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-ink text-xs font-medium">
          {index}. {step.label}
        </span>
        <span className="text-faint shrink-0 text-[10px] tabular-nums">
          {running ? `${progress}%` : STEP_LABEL[current]}
        </span>
      </div>

      {running && (
        <>
          <ProgressBar value={progress} tone="accent" className="mt-2 h-[3px]" />
          <p className="text-faint mt-1.5 text-[10px]">{stage}</p>
        </>
      )}

      {error && <p className="text-danger mt-1.5 text-[10px] leading-relaxed">{error}</p>}
    </div>
  )
}
