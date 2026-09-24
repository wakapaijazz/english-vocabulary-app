import type { FavoriteGroup } from "../types/favorites";

interface FavoriteGroupMenuProps {
  groups: FavoriteGroup[];
  activeGroupIds: string[];
  itemLabel: string;
  onToggleGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onRenameGroup: (group: FavoriteGroup) => void;
  onDeleteGroup: (group: FavoriteGroup) => void;
}

export function FavoriteGroupMenu({ groups, activeGroupIds, itemLabel, onToggleGroup, onCreateGroup, onRenameGroup, onDeleteGroup }: FavoriteGroupMenuProps) {
  const activeGroups = groups.filter((group) => activeGroupIds.includes(group.id));
  const isFavorite = activeGroups.length > 0;

  return <details className="favorite-group-menu">
    <summary className={isFavorite ? "favorite-group-summary active" : "favorite-group-summary"} aria-label={`${itemLabel}のお気に入りグループ`} title="お気に入りグループを選択">
      <span style={{ color: activeGroups[0]?.color ?? "var(--muted)" }}>{isFavorite ? "★" : "☆"}</span>
      {activeGroups.length > 1 && <span className="favorite-group-summary-dots" aria-hidden="true">{activeGroups.map((group) => <i key={group.id} style={{ background: group.color }} />)}</span>}
    </summary>
    <div className="favorite-group-popover" onClick={(event) => event.stopPropagation()}>
      <strong>お気に入りグループ</strong>
      <span className="favorite-group-help">チェックして登録・解除</span>
      <div className="favorite-group-options">
        {groups.map((group) => <div className="favorite-group-option" key={group.id}>
          <label><input type="checkbox" checked={activeGroupIds.includes(group.id)} onChange={() => onToggleGroup(group.id)} /><span className="favorite-group-option-star" style={{ color: group.color }}>{activeGroupIds.includes(group.id) ? "★" : "☆"}</span><span>{group.name}</span><small>{group.itemIds.length}</small></label>
          <button type="button" aria-label={`${group.name}の名前を変更`} title="名前を変更" onClick={() => onRenameGroup(group)}>✎</button>
          <button type="button" aria-label={`${group.name}を削除`} title="削除" disabled={groups.length <= 1} onClick={() => onDeleteGroup(group)}>×</button>
        </div>)}
      </div>
      <button type="button" className="favorite-group-add-button" onClick={onCreateGroup}>＋ 新しいグループ</button>
    </div>
  </details>;
}
