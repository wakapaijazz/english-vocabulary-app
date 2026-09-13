import { useMemo, useState, type FormEvent } from "react";
import { allPhraseCatalog } from "../data/phraseCatalogAll";
import { PhraseCard } from "../components/PhraseCard";
import { WordCard } from "../components/WordCard";
import { getStoredFavoriteGroups, updateFavoriteGroups } from "../services/storageService";
import { getFavoriteIds, toggleFavoriteInGroup } from "../services/favoriteGroups";
import type { FavoriteGroup } from "../types/favorites";
import type { PartOfSpeech, VocabularyEntry } from "../types/vocabulary";
import { POS_LABELS } from "../types/vocabulary";

type SortOrder = "asc" | "desc";
type LibraryMode = "words" | "phrases";

export function DictionaryPage({ entries }: { entries: VocabularyEntry[] }) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [level, setLevel] = useState<number | "all">("all");
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech | "all">("all");
  const [tag, setTag] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteGroupId, setFavoriteGroupId] = useState("all");
  const [groupByTag, setGroupByTag] = useState(false);
  const [libraryMode, setLibraryMode] = useState<LibraryMode>("words");
  const [favoriteGroups, setFavoriteGroups] = useState<FavoriteGroup[]>(() => getStoredFavoriteGroups());
  const [manageFavoriteGroups, setManageFavoriteGroups] = useState(false);
  const [newFavoriteGroupName, setNewFavoriteGroupName] = useState("");
  const [editingFavoriteGroupId, setEditingFavoriteGroupId] = useState<string | null>(null);
  const [editingFavoriteGroupName, setEditingFavoriteGroupName] = useState("");

  const favoriteIds = useMemo(() => getFavoriteIds(favoriteGroups), [favoriteGroups]);
  const matchesFavoriteFilter = (id: string) => {
    if (favoriteGroupId !== "all") return Boolean(favoriteGroups.find((group) => group.id === favoriteGroupId)?.itemIds.includes(id));
    return !favoritesOnly || favoriteIds.includes(id);
  };
  const isFavoriteInSelectedGroup = (id: string) => {
    const targetGroupId = favoriteGroupId === "all" ? favoriteGroups[0]?.id : favoriteGroupId;
    return Boolean(favoriteGroups.find((group) => group.id === targetGroupId)?.itemIds.includes(id));
  };

  const tags = useMemo(() => [...new Set(entries.flatMap((entry) => entry.tags ?? []))].sort((a, b) => a.localeCompare(b)), [entries]);
  const value = query.trim().toLowerCase();

  const wordResults = useMemo(() => entries
    .filter((entry) => {
      const matchesQuery = !value || entry.lemma.toLowerCase().includes(value) || entry.senses.some((sense) => sense.meaningJa.toLowerCase().includes(value));
      const matchesLevel = level === "all" || entry.level === level;
      const matchesPartOfSpeech = partOfSpeech === "all" || entry.senses.some((sense) => sense.partOfSpeech === partOfSpeech);
      const matchesTag = tag === "all" || entry.tags?.includes(tag);
      const matchesFavorite = matchesFavoriteFilter(entry.id);
      return matchesQuery && matchesLevel && matchesPartOfSpeech && matchesTag && matchesFavorite;
    })
    .sort((a, b) => sortOrder === "asc" ? a.lemma.localeCompare(b.lemma, "en") : b.lemma.localeCompare(a.lemma, "en")),
  [entries, value, level, partOfSpeech, tag, favoritesOnly, favoriteGroupId, favoriteGroups, favoriteIds, sortOrder]);

  const phraseResults = useMemo(() => allPhraseCatalog
    .filter((phrase) => {
      const searchable = [phrase.expression, phrase.word, phrase.meaningJa, phrase.definitionEn, phrase.exampleEnglish].join(" ").toLowerCase();
      const matchesQuery = !value || searchable.includes(value);
      const matchesFavorite = matchesFavoriteFilter(`phrase:${phrase.id}`);
      return matchesQuery && matchesFavorite;
    })
    .sort((a, b) => sortOrder === "asc" ? a.expression.localeCompare(b.expression, "en") : b.expression.localeCompare(a.expression, "en")),
  [value, favoritesOnly, favoriteGroupId, favoriteGroups, favoriteIds, sortOrder]);

  const wordGroups = useMemo(() => {
    if (!groupByTag) return [{ label: "", entries: wordResults }];
    const groups = new Map<string, VocabularyEntry[]>();
    wordResults.forEach((entry) => {
      const label = entry.tags?.[0] ?? "untagged";
      groups.set(label, [...(groups.get(label) ?? []), entry]);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, groupedEntries]) => ({ label, entries: groupedEntries }));
  }, [groupByTag, wordResults]);

  const toggleFavorite = (id: string) => {
    const targetGroupId = favoriteGroupId === "all" ? favoriteGroups[0]?.id : favoriteGroupId;
    if (!targetGroupId) return;
    setFavoriteGroups((current) => {
      const next = toggleFavoriteInGroup(current, targetGroupId, id);
      updateFavoriteGroups(next);
      return next;
    });
  };

  const addFavoriteGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newFavoriteGroupName.trim();
    if (!name) return;
    setFavoriteGroups((current) => {
      const next = [...current, { id: "favorite-" + Date.now(), name, itemIds: [] }];
      updateFavoriteGroups(next);
      return next;
    });
    setNewFavoriteGroupName("");
  };

  const beginRenameFavoriteGroup = (group: FavoriteGroup) => {
    setEditingFavoriteGroupId(group.id);
    setEditingFavoriteGroupName(group.name);
  };

  const saveFavoriteGroupName = (event: FormEvent<HTMLFormElement>, groupId: string) => {
    event.preventDefault();
    const name = editingFavoriteGroupName.trim();
    if (!name) return;
    setFavoriteGroups((current) => {
      const next = current.map((group) => group.id === groupId ? { ...group, name } : group);
      updateFavoriteGroups(next);
      return next;
    });
    setEditingFavoriteGroupId(null);
  };

  const deleteFavoriteGroup = (group: FavoriteGroup) => {
    if (favoriteGroups.length <= 1 || !window.confirm("「" + group.name + "」を削除しますか？このグループ内の分類だけが削除されます。")) return;
    setFavoriteGroups((current) => {
      const next = current.filter((candidate) => candidate.id !== group.id);
      updateFavoriteGroups(next);
      return next;
    });
    if (favoriteGroupId === group.id) setFavoriteGroupId("all");
  };

  const visibleCount = libraryMode === "words" ? wordResults.length : phraseResults.length;
  const totalCount = libraryMode === "words" ? entries.length : allPhraseCatalog.length;

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">WORD LIBRARY</span>
          <h1>辞書</h1>
          <p>単語{entries.length}語と語句{allPhraseCatalog.length}個を、検索・タグ・お気に入りで整理できます。</p>
        </div>
        <span className="search-count">{visibleCount} / {totalCount} {libraryMode === "words" ? "WORDS" : "PHRASES"}</span>
      </div>

      <div className="quiz-switcher" role="tablist" aria-label="辞書の種類" style={{ width: "fit-content", marginBottom: "18px" }}>
        <button className={libraryMode === "words" ? "active" : ""} onClick={() => setLibraryMode("words")} role="tab" aria-selected={libraryMode === "words"}>単語 {entries.length}</button>
        <button className={libraryMode === "phrases" ? "active" : ""} onClick={() => setLibraryMode("phrases")} role="tab" aria-selected={libraryMode === "phrases"}>語句 {allPhraseCatalog.length}</button>
      </div>

      <div className="search-box">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={libraryMode === "words" ? "英単語や日本語訳で検索" : "語句・意味・英文で検索"} aria-label="辞書を検索" />
        {query && <button onClick={() => setQuery("")} aria-label="検索をクリア">×</button>}
      </div>

      <div className="filter-bar dictionary-filters">
        <label>並び順<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="asc">A → Z</option><option value="desc">Z → A</option></select></label>
        {libraryMode === "words" && <>
          <label>LEVEL<select value={level} onChange={(event) => setLevel(event.target.value === "all" ? "all" : Number(event.target.value))}><option value="all">すべて</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <option key={item} value={item}>Level {item}</option>)}</select></label>
          <label>品詞<select value={partOfSpeech} onChange={(event) => setPartOfSpeech(event.target.value as PartOfSpeech | "all")}><option value="all">すべて</option>{Object.entries(POS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label>タグ<select value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">すべて</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        </>}
        <label>お気に入りグループ<select value={favoriteGroupId} onChange={(event) => setFavoriteGroupId(event.target.value)}><option value="all">すべて</option>{favoriteGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
        <label className="toggle-label"><input type="checkbox" checked={favoritesOnly} onChange={(event) => setFavoritesOnly(event.target.checked)} /><span className="toggle" />お気に入りのみ</label>
        {libraryMode === "words" && <label className="toggle-label"><input type="checkbox" checked={groupByTag} onChange={(event) => setGroupByTag(event.target.checked)} /><span className="toggle" />タグ別に表示</label>}
        <button type="button" className="group-manage-button" onClick={() => setManageFavoriteGroups((current) => !current)}>{manageFavoriteGroups ? "管理を閉じる" : "グループを管理"}</button>
        <span className="filter-count">{visibleCount} 件</span>
      </div>

      {manageFavoriteGroups && <section className="favorite-groups-panel"><div className="favorite-groups-heading"><div><span className="eyebrow">FAVORITE GROUPS</span><h2>お気に入りを整理</h2><p>グループを選んでから星を押すと、そのグループに登録・解除できます。1つの項目を複数グループに登録することもできます。</p></div></div><div className="favorite-group-list">{favoriteGroups.map((group) => <div className="favorite-group-row" key={group.id}>{editingFavoriteGroupId === group.id ? <form onSubmit={(event) => saveFavoriteGroupName(event, group.id)}><input value={editingFavoriteGroupName} onChange={(event) => setEditingFavoriteGroupName(event.target.value)} aria-label={group.name + "の新しい名前"} autoFocus /><button type="submit" className="small-button primary-button">保存</button><button type="button" className="small-button outline-button" onClick={() => setEditingFavoriteGroupId(null)}>取消</button></form> : <><span><strong>{group.name}</strong><small>{group.itemIds.length}件</small></span><button type="button" className="text-button" onClick={() => beginRenameFavoriteGroup(group)}>名前を変更</button><button type="button" className="text-button danger-text-button" disabled={favoriteGroups.length <= 1} onClick={() => deleteFavoriteGroup(group)}>削除</button></>}</div>)}</div><form className="favorite-group-add" onSubmit={addFavoriteGroup}><input value={newFavoriteGroupName} onChange={(event) => setNewFavoriteGroupName(event.target.value)} placeholder="新しいグループ名" aria-label="新しいお気に入りグループ名" /><button type="submit" className="primary-button small-button">グループを追加</button></form></section>}

      {libraryMode === "words" ? wordGroups.map((group) => <section key={group.label || "all"}>
        {groupByTag && <div className="section-heading" style={{ margin: "26px 0 14px" }}><div><span className="eyebrow">TAG GROUP</span><h2>{group.label} <small style={{ color: "var(--muted)", font: "11px DM Mono, monospace" }}>({group.entries.length})</small></h2></div></div>}
        <div className="dictionary-grid">
          {group.entries.map((entry) => <WordCard key={entry.id} entry={entry} compact isFavorite={isFavoriteInSelectedGroup(entry.id)} onToggleFavorite={() => toggleFavorite(entry.id)} />)}
        </div>
      </section>) : <div className="dictionary-grid">
        {phraseResults.map((phrase) => <PhraseCard key={phrase.id} phrase={phrase} isFavorite={isFavoriteInSelectedGroup(`phrase:${phrase.id}`)} onToggleFavorite={() => toggleFavorite(`phrase:${phrase.id}`)} />)}
      </div>}

      {!visibleCount && <div className="empty-state"><span>⌕</span><h2>見つかりませんでした</h2><p>検索条件やお気に入り設定を変えてみてください。</p></div>}
    </div>
  );
}
