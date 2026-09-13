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
  const isFavorite = activeGroupIds.length > 0;

  return <details className="favorite-group-menu">
    <summary className={isFavorite ? "favorite-group-summary active" : "favorite-group-summary"} aria-label={`${itemLabel}のお気に入りグループ`} title="お気に入りグループを選択">
      {isFavorite ? "★" : "☆"}
    </summary>
    <div className="favorite-group-popover" onClick={(event) => event.stopPropagation()}>
      <strong>お気に入りグループ</strong>
      <span className="favorite-group-help">チェックして登録・解除</span>
      <div className="favorite-group-options">
        {groups.map((group) => <div className="favorite-group-option" key={group.id}>
          <label><input type="checkbox" checked={activeGroupIds.includes(group.id)} onChange={() => onToggleGroup(group.id)} /><span>{group.name}</span><small>{group.itemIds.length}</small></label>
          <button type="button" aria-label={`${group.name}の名前を変更`} title="名前を変更" onClick={() => onRenameGroup(group)}>✎</button>
          <button type="button" aria-label={`${group.name}を削除`} title="削除" disabled={groups.length <= 1} onClick={() => onDeleteGroup(group)}>×</button>
        </div>)}
      </div>
      <button type="button" className="favorite-group-add-button" onClick={onCreateGroup}>＋ 新しいグループ</button>
    </div>
  </details>;
}
