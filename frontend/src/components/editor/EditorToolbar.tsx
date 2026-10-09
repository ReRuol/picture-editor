import { useState, type ReactNode } from 'react'
import { Columns2, Download, Layers, PanelLeftOpen, Redo2, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { SessionDetail } from '@/api/sessions'
import Button from '@/components/ui/Button'
import { buttonClass } from '@/components/ui/buttonStyles'
import type { SessionSelection } from '@/hooks/useSelection'
import type { SessionTools } from '@/hooks/useSessions'
import { ZOOM_STEP, useCanvasView } from '@/stores/canvasView'
import { useEditorUi, type CropRatio } from '@/stores/editorUi'

const CROP_RATIOS: { value: CropRatio; label: string }[] = [
  { value: 'free', label: '自由' },
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
]

const ICON = 'size-4'

/**
 * 顶部选项栏：左侧是会话和当前模式（裁剪、选区）的选项，右侧是全局操作。
 * 工具本身在左边的 ToolRail，这里不再平铺工具，宽度只随模式选项变化。
 */
export default function EditorToolbar({
  session,
  tools,
  picking,
  onRename,
}: {
  session: SessionDetail
  tools: SessionTools
  picking: SessionSelection
  onRename: (title: string) => void
}) {
  const scale = useCanvasView((state) => state.scale)
  const fit = useCanvasView((state) => state.fit)
  const stepZoom = useCanvasView((state) => state.stepZoom)
  const zoomTo = useCanvasView((state) => state.zoomTo)
  const ui = useEditorUi()

  const running = (tool: string) => (tools.isRunning(tool) ? tools.pendingProgress : null)

  const confirmCrop = () => {
    if (!ui.cropRect) return
    tools.invoke('crop_canvas', {
      rect: {
        x: ui.cropRect.x / session.document.width,
        y: ui.cropRect.y / session.document.height,
        width: ui.cropRect.width / session.document.width,
        height: ui.cropRect.height / session.document.height,
      },
    })
    ui.closeCrop()
  }

  const needSelection = picking.selection ? undefined : '先点选或圈出区域'

  return (
    <header className="border-line bg-paper flex h-12 shrink-0 items-center gap-2 border-b px-2">
      {!ui.chatOpen && (
        <Button variant="icon" title="展开对话" onClick={() => ui.setChatOpen(true)}>
          <PanelLeftOpen className={ICON} aria-hidden />
        </Button>
      )}

      <TitleField value={session.title} onCommit={onRename} />
      <span className="text-faint hidden shrink-0 font-mono text-[11px] lg:block">
        {session.document.width}×{session.document.height}
      </span>

      <div className="scrollbar-slim flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {ui.selectMode && (
          <Options label={ui.selectMode === 'point' ? '点选' : '笔刷'}>
            <Button
              disabled={tools.busy || picking.busy || !picking.selection}
              progress={running('erase_region')}
              title={needSelection ?? '消除选中区域'}
              onClick={() =>
                tools.invoke('erase_region', {
                  mask_asset_id: picking.selection?.maskId,
                  revision: session.revision,
                  layer_id: ui.selectedLayerId,
                })
              }
            >
              消除
            </Button>
            <Button
              disabled={!picking.selection}
              active={ui.panel === 'replace'}
              title={needSelection ?? '按描述替换选区'}
              onClick={() => ui.setPanel(ui.panel === 'replace' ? null : 'replace')}
            >
              替换
            </Button>
            <Button
              disabled={tools.busy || picking.busy || !picking.selection}
              progress={running('promote_object_to_layer')}
              title={needSelection ?? '把选区提升为独立图层，可撤销'}
              onClick={() =>
                tools.invoke('promote_object_to_layer', {
                  mask_asset_id: picking.selection?.maskId,
                  revision: session.revision,
                })
              }
            >
              成层
            </Button>
            <Button
              disabled={!picking.selection || picking.busy}
              title="清除当前选区"
              onClick={picking.clear}
            >
              清除
            </Button>
            <Button variant="outline" title="退出选择 Esc" onClick={() => ui.setSelectMode(null)}>
              完成
            </Button>
          </Options>
        )}

        {ui.cropOpen && (
          <Options label="裁剪">
            {CROP_RATIOS.map((item) => (
              <Button
                key={item.value}
                active={ui.cropRatio === item.value}
                title={item.value === 'free' ? '自由裁剪' : `按 ${item.label} 裁剪`}
                onClick={() => ui.setCropRatio(item.value, session.document)}
              >
                {item.label}
              </Button>
            ))}
            <Button variant="solid" title="按当前框裁剪画布，可撤销" onClick={confirmCrop}>
              确定
            </Button>
            <Button variant="outline" title="退出裁剪 Esc" onClick={ui.closeCrop}>
              取消
            </Button>
          </Options>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="icon"
          disabled={tools.busy || picking.busy || !(picking.canUndo || session.can_undo)}
          title={
            picking.canUndo
              ? '撤销选区 ⌘Z'
              : session.can_undo
                ? '撤销上一步 ⌘Z'
                : '没有可撤销的操作'
          }
          onClick={() => (picking.canUndo ? picking.undo() : tools.undo())}
        >
          <Undo2 className={ICON} aria-hidden />
        </Button>
        <Button
          variant="icon"
          disabled={tools.busy || picking.busy || !(picking.canRedo || session.can_redo)}
          title={
            picking.canRedo
              ? '重做选区 ⌘⇧Z'
              : session.can_redo
                ? '重做 ⌘⇧Z'
                : '没有可重做的操作'
          }
          onClick={() => (picking.canRedo ? picking.redo() : tools.redo())}
        >
          <Redo2 className={ICON} aria-hidden />
        </Button>
        <Button
          variant="icon"
          active={ui.compareOpen}
          disabled={!session.previous_document}
          title={session.previous_document ? '与上一版对比' : '还没有上一版'}
          onClick={() => ui.setCompareOpen(!ui.compareOpen)}
        >
          <Columns2 className={ICON} aria-hidden />
        </Button>

        <div className="border-line rounded-control mx-1 flex items-center border">
          <Button variant="icon" size="sm" title="缩小 -" onClick={() => stepZoom(1 / ZOOM_STEP)}>
            −
          </Button>
          <Button
            size="sm"
            title="实际像素 · 按 1"
            className="w-12 font-mono"
            onClick={() => zoomTo(1)}
          >
            {Math.round(scale * 100)}%
          </Button>
          <Button variant="icon" size="sm" title="放大 +" onClick={() => stepZoom(ZOOM_STEP)}>
            +
          </Button>
          <Button
            size="sm"
            title="适应窗口 · 按 0，画布内双击同样生效"
            onClick={() => fit(session.document)}
          >
            适应
          </Button>
        </div>

        <Button
          active={ui.panel === 'layers'}
          title="图层、变换和编辑记录"
          onClick={() => ui.setPanel(ui.panel === 'layers' ? null : 'layers')}
        >
          <span className="flex items-center gap-1.5">
            <Layers className={ICON} aria-hidden />
            图层
          </span>
        </Button>
        <Link
          to={`/marketing/${session.id}`}
          title="导出营销图和投放尺寸"
          className={`${buttonClass({ variant: 'solid' })} ml-1 flex items-center gap-1.5`}
        >
          <Download className={ICON} aria-hidden />
          导出
        </Link>
      </div>
    </header>
  )
}

function Options({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="animate-fade-in flex shrink-0 items-center gap-1">
      <span className="bg-ink text-paper rounded-chip mr-1 px-1.5 py-0.5 text-[10px] font-semibold">
        {label}
      </span>
      {children}
    </div>
  )
}

function TitleField({ value, onCommit }: { value: string; onCommit: (title: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    const next = draft?.trim()
    setDraft(null)
    if (next && next !== value) onCommit(next)
  }

  return (
    <input
      value={draft ?? value}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
        if (event.key === 'Escape') setDraft(null)
      }}
      aria-label="会话标题"
      className="text-ink hover:bg-soft focus:bg-soft rounded-chip w-28 shrink-0 px-2 py-1 text-sm font-semibold transition-colors duration-150 outline-none xl:w-40"
    />
  )
}
