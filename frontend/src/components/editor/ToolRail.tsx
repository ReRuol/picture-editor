import {
  Brush,
  Crop,
  Expand,
  FlipHorizontal2,
  FlipVertical2,
  ImageUpscale,
  Layers2,
  MousePointerClick,
  Scissors,
  SlidersHorizontal,
  Wallpaper,
  type LucideIcon,
} from 'lucide-react'

import type { SessionDetail } from '@/api/sessions'
import type { SessionTools } from '@/hooks/useSessions'
import { wallOnly } from '@/lib/layers'
import { useEditorUi } from '@/stores/editorUi'

type Tool = {
  key: string
  label: string
  title: string
  icon: LucideIcon
  /** 走模型的工具，右上角标一枚粉色方块 */
  ai?: boolean
  active?: boolean
  disabled?: boolean
  progress?: number | null
  onClick: () => void
}

/**
 * 竖排工具栏，按「构图 / AI / 调整 / 选区」分组。
 * 工具一字排在顶栏时 1440 宽就放不下，竖排后任何宽度都不会溢出。
 */
export default function ToolRail({ session, tools }: { session: SessionDetail; tools: SessionTools }) {
  const ui = useEditorUi()
  const busy = tools.busy

  const running = (tool: string, match?: (params: Record<string, unknown>) => boolean) =>
    tools.isRunning(tool, match) ? tools.pendingProgress : null

  const togglePanel = (panel: 'background' | 'expand' | 'adjust') =>
    ui.setPanel(ui.panel === panel ? null : panel)

  const groups: Tool[][] = [
    [
      {
        key: 'crop',
        label: '裁剪',
        title: '按比例裁剪画布',
        icon: Crop,
        active: ui.cropOpen,
        disabled: busy,
        onClick: () => (ui.cropOpen ? ui.closeCrop() : ui.openCrop(session.document)),
      },
      {
        key: 'flip-h',
        label: '水平',
        title: '左右翻转当前图层',
        icon: FlipHorizontal2,
        disabled: busy,
        progress: running('flip_layer', (params) => params.direction === 'horizontal'),
        onClick: () =>
          tools.invoke('flip_layer', { direction: 'horizontal', layer_id: ui.selectedLayerId }),
      },
      {
        key: 'flip-v',
        label: '垂直',
        title: '上下翻转当前图层',
        icon: FlipVertical2,
        disabled: busy,
        progress: running('flip_layer', (params) => params.direction === 'vertical'),
        onClick: () =>
          tools.invoke('flip_layer', { direction: 'vertical', layer_id: ui.selectedLayerId }),
      },
    ],
    [
      {
        key: 'remove-bg',
        label: '去背景',
        title: '抠出主体，背景变透明',
        icon: Scissors,
        ai: true,
        disabled: busy,
        progress: running('remove_background'),
        onClick: () => tools.invoke('remove_background', { layer_id: ui.selectedLayerId }),
      },
      {
        key: 'background',
        label: '换背景',
        title: '按描述替换背景',
        icon: Wallpaper,
        ai: true,
        active: ui.panel === 'background',
        disabled: busy,
        onClick: () => togglePanel('background'),
      },
      {
        key: 'expand',
        label: '扩图',
        title: '扩展画布到新比例',
        icon: Expand,
        ai: true,
        active: ui.panel === 'expand',
        disabled: busy,
        onClick: () => togglePanel('expand'),
      },
      {
        key: 'upscale',
        label: '超分',
        title: wallOnly(session.document)
          ? '放大到两倍，已拆层所以结果只进图片墙'
          : '把当前画布放大到两倍',
        icon: ImageUpscale,
        ai: true,
        disabled: busy,
        progress: running('upscale_image'),
        onClick: () => tools.invoke('upscale_image', { scale: 2 }),
      },
      {
        key: 'split',
        label: '拆层',
        title: '拆成背景和主体，文字需在图层面板勾选，可撤销',
        icon: Layers2,
        ai: true,
        disabled: busy,
        progress: running('split_layers'),
        onClick: () => tools.invoke('split_layers', { include_text: ui.splitIncludeText }),
      },
    ],
    [
      {
        key: 'adjust',
        label: '调色',
        title: '调整亮度、对比度和色彩',
        icon: SlidersHorizontal,
        active: ui.panel === 'adjust',
        onClick: () => togglePanel('adjust'),
      },
    ],
    [
      {
        key: 'point',
        label: '点选',
        title: '点击物体建立选区',
        icon: MousePointerClick,
        ai: true,
        active: ui.selectMode === 'point',
        disabled: busy,
        onClick: () => ui.setSelectMode(ui.selectMode === 'point' ? null : 'point'),
      },
      {
        key: 'brush',
        label: '笔刷',
        title: '圈出要改的区域建立选区',
        icon: Brush,
        active: ui.selectMode === 'brush',
        disabled: busy,
        onClick: () => ui.setSelectMode(ui.selectMode === 'brush' ? null : 'brush'),
      },
    ],
  ]

  return (
    <nav
      aria-label="修图工具"
      className="border-line bg-paper scrollbar-slim flex w-16 shrink-0 flex-col items-center overflow-y-auto border-r py-2"
    >
      {groups.map((group, index) => (
        <div
          key={index}
          className="border-line flex w-full flex-col items-center gap-0.5 border-b py-1.5 last:border-b-0"
        >
          {group.map((tool) => (
            <RailButton key={tool.key} tool={tool} />
          ))}
        </div>
      ))}
    </nav>
  )
}

function RailButton({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  const running = tool.progress != null
  const filled = Math.max(6, Math.min(100, tool.progress ?? 0))

  return (
    <button
      type="button"
      title={tool.title}
      disabled={tool.disabled}
      aria-pressed={tool.active}
      aria-busy={running || undefined}
      onClick={tool.onClick}
      className={`rounded-control relative flex h-12 w-12 flex-col items-center justify-center gap-1 overflow-hidden transition-[background-color,color,box-shadow,translate] duration-150 active:translate-px disabled:cursor-not-allowed disabled:opacity-35 ${
        tool.active || running
          ? 'bg-brand text-paper shadow-print'
          : 'text-muted hover:bg-soft hover:text-ink'
      }`}
    >
      {running && (
        // 进度用粉色网点从下往上铺，像油墨一层层印上去
        <span
          className="text-accent bg-halftone absolute inset-x-0 bottom-0 opacity-70"
          style={{ height: `${filled}%` }}
          aria-hidden
        />
      )}
      {tool.ai && !tool.active && !running && (
        <span className="bg-accent absolute top-1.5 right-1.5 size-1.5" aria-hidden />
      )}
      <Icon className="relative size-[18px]" strokeWidth={1.75} aria-hidden />
      <span className="relative text-[10px] leading-none">{tool.label}</span>
    </button>
  )
}
