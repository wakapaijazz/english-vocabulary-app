import type { MouseEvent } from "react";
import type { FavoriteGroup } from "../types/favorites";

interface FavoriteGroupFilterProps {
  groups: FavoriteGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (group: FavoriteGroup) => void;
  onDelete: (group: FavoriteGroup) => void;
}

export function FavoriteGroupFilter({ groups, selectedId, onSelect, onCreate, onRename, onDelete }: FavoriteGroupFilterProps) {
  const selected = groups.find((group) => group.id === selectedId);

  const selectAndClose = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    onSelect(id);
    const menu = event.currentTarget.closest("details");
    if (menu) menu.open = false;
  };

  return <details className="favorite-group-filter-menu">
    <summary className="favorite-group-filter-trigger">
      {selected && <span aria-hidden="true" style={{ color: selected.color }}>★</span>}
      <span>{selected?.name ?? "すべて"}</span>
      <span className="favorite-group-filter-caret" aria-hidden="true" />
    </summary>
    <div className="favorite-group-filter-popover">
      <div className="favorite-group-filter-row">
        <button type="button" className={selectedId === "all" ? "selected" : ""} onClick={(event) => selectAndClose(event, "all")}>
          <span className="favorite-group-filter-star">☆</span><span>すべて</span>
        </button>
      </div>
      {groups.map((group) => <div className="favorite-group-filter-row" key={group.id}>
        <button type="button" className={selectedId === group.id ? "selected" : ""} onClick={(event) => selectAndClose(event, group.id)}>
          <span className="favorite-group-filter-star" style={{ color: group.color }}>★</span><span>{group.name}</span><small>{group.itemIds.length}</small>
        </button>
        <button type="button" className="favorite-group-filter-edit" aria-label={`${group.name}の名前を変更`} title="名前を変更" onClick={() => onRename(group)}>✎</button>
        <button type="button" className="favorite-group-filter-edit" aria-label={`${group.name}を削除`} title="削除" disabled={groups.length <= 1} onClick={() => onDelete(group)}>×</button>
      </div>)}
      <button type="button" className="favorite-group-filter-add" onClick={onCreate}>＋ 新しいグループを追加</button>
    </div>
  </details>;
}
