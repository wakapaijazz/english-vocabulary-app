import { useMemo, useState } from "react";
import type { PartOfSpeech, VocabularyEntry } from "../types/vocabulary";
import { POS_LABELS } from "../types/vocabulary";
import { WordCard } from "../components/WordCard";

type SortOrder = "asc" | "desc";

export function DictionaryPage({ entries }: { entries: VocabularyEntry[] }) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [level, setLevel] = useState<number | "all">("all");
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech | "all">("all");

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return entries
      .filter((entry) => {
        const matchesQuery = !value || entry.lemma.toLowerCase().includes(value) || entry.senses.some((sense) => sense.meaningJa.toLowerCase().includes(value));
        const matchesLevel = level === "all" || entry.level === level;
        const matchesPartOfSpeech = partOfSpeech === "all" || entry.senses.some((sense) => sense.partOfSpeech === partOfSpeech);
        return matchesQuery && matchesLevel && matchesPartOfSpeech;
      })
      .sort((a, b) => sortOrder === "asc" ? a.lemma.localeCompare(b.lemma, "en") : b.lemma.localeCompare(a.lemma, "en"));
  }, [entries, query, sortOrder, level, partOfSpeech]);

  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">WORD LIBRARY</span>
          <h1>辞書</h1>
          <p>並び順・レベル・品詞で、収録語を探せます。</p>
        </div>
        <span className="search-count">{results.length} / {entries.length} WORDS</span>
      </div>
      <div className="search-box">
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="英単語や日本語訳で検索" aria-label="単語を検索" />
        {query && <button onClick={() => setQuery("")} aria-label="検索をクリア">×</button>}
      </div>
      <div className="filter-bar dictionary-filters">
        <label>並び順<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="asc">A → Z</option><option value="desc">Z → A</option></select></label>
        <label>LEVEL<select value={level} onChange={(event) => setLevel(event.target.value === "all" ? "all" : Number(event.target.value))}><option value="all">すべて</option>{[1, 2, 3, 4, 5].map((item) => <option key={item} value={item}>Level {item}</option>)}</select></label>
        <label>品詞<select value={partOfSpeech} onChange={(event) => setPartOfSpeech(event.target.value as PartOfSpeech | "all")}><option value="all">すべて</option>{Object.entries(POS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <span className="filter-count">{results.length} 語</span>
      </div>
      <div className="dictionary-grid">
        {results.map((entry) => <WordCard key={entry.id} entry={entry} compact />)}
      </div>
      {!results.length && <div className="empty-state"><span>⌕</span><h2>見つかりませんでした</h2><p>検索条件を変えてみてください。</p></div>}
    </div>
  );
}
