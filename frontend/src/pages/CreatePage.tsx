import { useNavigate } from 'react-router-dom'

import AssetLibrary from '@/components/AssetLibrary'
import GenerateForm from '@/components/GenerateForm'
import { errorMessage } from '@/hooks/useAuth'
import { useAssetLibrary, useUploadAsset } from '@/hooks/useAssets'
import { useGenerate } from '@/hooks/useRun'
import { useCreateSession } from '@/hooks/useSessions'
import { readPromptDraft, savePromptDraft } from '@/lib/promptDraft'

export default function CreatePage() {
  const navigate = useNavigate()
  const { data: groups = [], isPending } = useAssetLibrary()
  const upload = useUploadAsset()
  const generate = useGenerate()
  const createSession = useCreateSession()

  const openEditor = (assetId: string) =>
    createSession.mutate(
      { current_asset_id: assetId },
      { onSuccess: (session) => navigate(`/editor/${session.id}`) },
    )

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-display text-print text-4xl">创作</h1>
      <p className="text-muted mt-2 mb-7 text-sm">写一句描述生成候选图，或者上传已有的商品图直接编辑。</p>

      <GenerateForm
        defaultPrompt={readPromptDraft()}
        pending={generate.isPending}
        uploading={upload.isPending || createSession.isPending}
        onFile={(file) => upload.mutate(file, { onSuccess: (asset) => openEditor(asset.id) })}
        onSubmit={(input) =>
          generate.mutate(input, {
            onSuccess: (run) => {
              savePromptDraft('')
              navigate(`/candidates/${run.id}`)
            },
          })
        }
      />
      {generate.isError && (
        <p className="text-danger mt-2 text-sm">{errorMessage(generate.error)}</p>
      )}

      {upload.isError && (
        <p className="text-danger mt-2 text-sm">{errorMessage(upload.error)}</p>
      )}

      <section className="mt-10">
        <h2 className="text-ink mb-4 flex items-center gap-1.5 text-sm font-semibold">
          <span className="bg-accent size-1.5" aria-hidden />
          历史素材
        </h2>

        {isPending ? (
          <p className="text-faint text-sm">加载中…</p>
        ) : groups.length === 0 ? (
          <p className="text-faint border-line rounded-card border border-dashed px-6 py-10 text-center text-sm">还没有素材。写一句描述，或把图拖进上面的卡片。</p>
        ) : (
          <AssetLibrary
            groups={groups}
            onOpenSession={(sessionId) => navigate(`/editor/${sessionId}`)}
            onOpenAsset={openEditor}
          />
        )}
      </section>
    </div>
  )
}
