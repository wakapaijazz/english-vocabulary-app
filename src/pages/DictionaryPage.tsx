import { useMemo, useState } from "react";
import { allPhraseCatalog } from "../data/phraseCatalogAll";
import { PhraseCard } from "../components/PhraseCard";
import { FavoriteGroupFilter } from "../components/FavoriteGroupFilter";
import { WordCard } from "../components/WordCard";
import { getStoredFavoriteGroups, updateFavoriteGroups } from "../services/storageService";
import { getFavoriteGroupColor, getFavoriteGroupIds, getFavoriteIds, toggleFavoriteInGroup } from "../services/favoriteGroups";
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

  const toggleFavoriteGroup = (id: string, groupId: string) => {
    setFavoriteGroups((current) => {
      const next = toggleFavoriteInGroup(current, groupId, id);
      updateFavoriteGroups(next);
      return next;
    });
  };

  const createFavoriteGroup = () => {
    const name = window.prompt("新しいお気に入りグループ名", "");
    if (!name?.trim()) return;
    setFavoriteGroups((current) => {
      const id = "favorite-" + Date.now();
      const next = [...current, { id, name: name.trim(), itemIds: [], color: getFavoriteGroupColor(id, current.length) }];
      updateFavoriteGroups(next);
      return next;
    });
  };

  const renameFavoriteGroup = (group: FavoriteGroup) => {
    const name = window.prompt("お気に入りグループ名を変更", group.name);
    if (!name?.trim()) return;
    setFavoriteGroups((current) => {
      const next = current.map((candidate) => candidate.id === group.id ? { ...candidate, name: name.trim() } : candidate);
      updateFavoriteGroups(next);
      return next;
    });
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
        <div className="favorite-group-filter-label"><span>お気に入り</span><FavoriteGroupFilter groups={favoriteGroups} selectedId={favoriteGroupId} onSelect={setFavoriteGroupId} onCreate={createFavoriteGroup} onRename={renameFavoriteGroup} onDelete={deleteFavoriteGroup} /></div>
        <label className="toggle-label"><input type="checkbox" checked={favoritesOnly} onChange={(event) => setFavoritesOnly(event.target.checked)} /><span className="toggle" />お気に入りのみ</label>
        {libraryMode === "words" && <label className="toggle-label"><input type="checkbox" checked={groupByTag} onChange={(event) => setGroupByTag(event.target.checked)} /><span className="toggle" />タグ別に表示</label>}
        <span className="filter-count">{visibleCount} 件</span>
      </div>



      {libraryMode === "words" ? wordGroups.map((group) => <section key={group.label || "all"}>
        {groupByTag && <div className="section-heading" style={{ margin: "26px 0 14px" }}><div><span className="eyebrow">TAG GROUP</span><h2>{group.label} <small style={{ color: "var(--muted)", font: "11px DM Mono, monospace" }}>({group.entries.length})</small></h2></div></div>}
        <div className="dictionary-grid">
          {group.entries.map((entry) => <WordCard key={entry.id} entry={entry} compact isFavorite={isFavoriteInSelectedGroup(entry.id)} favoriteGroups={favoriteGroups} favoriteGroupIds={getFavoriteGroupIds(favoriteGroups, entry.id)} onToggleFavoriteGroup={(groupId) => toggleFavoriteGroup(entry.id, groupId)} onCreateFavoriteGroup={createFavoriteGroup} onRenameFavoriteGroup={renameFavoriteGroup} onDeleteFavoriteGroup={deleteFavoriteGroup} />)}
        </div>
      </section>) : <div className="dictionary-grid">
        {phraseResults.map((phrase) => <PhraseCard key={phrase.id} phrase={phrase} isFavorite={isFavoriteInSelectedGroup(`phrase:${phrase.id}`)} favoriteGroups={favoriteGroups} favoriteGroupIds={getFavoriteGroupIds(favoriteGroups, `phrase:${phrase.id}`)} onToggleFavoriteGroup={(groupId) => toggleFavoriteGroup(`phrase:${phrase.id}`, groupId)} onCreateFavoriteGroup={createFavoriteGroup} onRenameFavoriteGroup={renameFavoriteGroup} onDeleteFavoriteGroup={deleteFavoriteGroup} />)}
      </div>}

      {!visibleCount && <div className="empty-state"><span>⌕</span><h2>見つかりませんでした</h2><p>検索条件やお気に入り設定を変えてみてください。</p></div>}
    </div>
  );
}
