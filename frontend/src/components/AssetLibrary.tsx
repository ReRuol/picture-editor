import { useState } from 'react'

import type { LibraryGroup } from '@/api/assets'
import AssetCard from '@/components/AssetCard'
import { formatDateTime } from '@/lib/format'

export default function AssetLibrary({
  groups,
  onOpenSession,
  onOpenAsset,
}: {
  groups: LibraryGroup[]
  onOpenSession: (sessionId: string) => void
  onOpenAsset: (assetId: string) => void
}) {
  return (
    // 网格卡片：只有一条历史时也是一张缩略图，而不是一条拉满整行的列表
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {groups.map((group) => (
        <LibraryGroupCard
          key={group.session_id ?? 'orphan'}
          group={group}
          onOpenSession={onOpenSession}
          onOpenAsset={onOpenAsset}
        />
      ))}
    </ul>
  )
}

function LibraryGroupCard({
  group,
  onOpenSession,
  onOpenAsset,
}: {
  group: LibraryGroup
  onOpenSession: (sessionId: string) => void
  onOpenAsset: (assetId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const openGroup = () => {
    if (group.session_id) onOpenSession(group.session_id)
    else onOpenAsset(group.cover.id)
  }

  return (
    <>
    <li className="group">
      <button
        type="button"
        onClick={openGroup}
        className="border-line bg-paper rounded-card group-hover:border-ink group-hover:shadow-card block w-full overflow-hidden border text-left transition-[border-color,box-shadow] duration-200"
      >
        <span className="bg-stage block aspect-square">
          <img src={group.cover.url} alt="" className="size-full object-contain" />
        </span>
        <span className="border-line block border-t px-3 py-2.5">
          <span className="text-ink block truncate text-sm font-semibold">{group.title}</span>
          <span className="text-faint block font-mono text-[10px]">
            {group.assets.length} 张 · {formatDateTime(group.updated_at)}
          </span>
        </span>
      </button>
      {group.assets.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="text-muted hover:text-brand mt-1.5 text-xs"
        >
          {open ? '收起全部' : `看全部 ${group.assets.length} 张`}
        </button>
      )}
    </li>
      {open && (
        <li className="border-line bg-paper rounded-card col-span-full grid grid-cols-2 gap-3 border p-3 sm:grid-cols-3 lg:grid-cols-4">
          {group.assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onSelect={() =>
                group.session_id ? onOpenSession(group.session_id) : onOpenAsset(asset.id)
              }
            />
          ))}
        </li>
      )}
    </>
  )
}
