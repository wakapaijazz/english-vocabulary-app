import { useState } from "react";
import { getWordExamples } from "../data/exampleResolver";
import { allPhraseCatalog } from "../data/phraseCatalogAll";
import { getPhraseExamples } from "../data/phraseResolver";
import type { VocabularyEntry } from "../types/vocabulary";
import { POS_LABELS } from "../types/vocabulary";
import { SpeakButton } from "./SpeakButton";

interface WordCardProps { entry: VocabularyEntry; compact?: boolean; isFavorite?: boolean; onToggleFavorite?: () => void; }

export function WordCard({ entry, compact = false, isFavorite = false, onToggleFavorite }: WordCardProps) {
  const [expanded, setExpanded] = useState(false);
  const mainSense = entry.senses[0];
  const existingExpressions = new Set([
    ...(entry.collocations ?? []).map((item) => item.expression.toLowerCase()),
    ...(entry.idioms ?? []).map((item) => item.expression.toLowerCase()),
  ]);
  const catalogPhrases = allPhraseCatalog.filter((seed) => seed.word.toLowerCase() === entry.lemma.toLowerCase() && !existingExpressions.has(seed.expression.toLowerCase()));
  const examples = getWordExamples(entry);
  const detailToggleStyle = { display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "10px", color: "var(--teal-dark)", background: expanded ? "#e7f1ea" : "transparent", transition: "background .2s ease" } as const;
  const chevronStyle = { width: "8px", height: "8px", borderRight: "1.5px solid currentColor", borderBottom: "1.5px solid currentColor", transform: expanded ? "rotate(225deg)" : "rotate(45deg)", marginTop: expanded ? "4px" : "-4px", transition: "transform .2s ease, margin .2s ease" } as const;

  return (
    <article className={`word-card ${compact ? "compact" : ""}`}>
      <div className="word-card-top"><div><h3>{entry.lemma}</h3></div><div style={{ display: "flex", gap: "7px" }}>
        {onToggleFavorite && <button type="button" className="icon-button" aria-label={isFavorite ? "お気に入りから外す" : "お気に入りに追加"} aria-pressed={isFavorite} title={isFavorite ? "お気に入りから外す" : "お気に入りに追加"} onClick={onToggleFavorite} style={{ color: isFavorite ? "var(--orange)" : undefined }}>{isFavorite ? "★" : "☆"}</button>}
        <button className="icon-button" aria-label={expanded ? "詳細を閉じる" : "詳細を表示"} aria-expanded={expanded} title={expanded ? "詳細を閉じる" : "詳細を表示"} onClick={() => setExpanded((value) => !value)} style={detailToggleStyle}><span aria-hidden="true" style={chevronStyle} /></button>
      </div></div>
      {expanded && <div>
        <div className="word-meta"><span className="level-pill">LEVEL {entry.level}</span><span>{POS_LABELS[mainSense.partOfSpeech]}</span></div>
        {entry.pronunciation && <p className="pronunciation">{entry.pronunciation}</p>}
        <div className="sense-list">{entry.senses.map((sense, index) => <div className="sense-row" key={sense.id}><span>{index + 1}</span><p>{sense.meaningJa}</p></div>)}</div>
        <div className="word-details" style={{ display: "block" }}>
          {entry.collocations?.length ? <div className="detail-group"><span className="detail-label">COLLOCATIONS</span>{entry.collocations.map((item) => <p key={item.id}><strong>{item.expression}</strong>{item.meaningJa && <em>{item.meaningJa}</em>}</p>)}</div> : null}
          {entry.idioms?.length ? <div className="detail-group"><span className="detail-label">IDIOMS</span>{entry.idioms.map((item) => <p key={item.id}><strong>{item.expression}</strong><em>{item.meaningJa}</em></p>)}</div> : null}
          {catalogPhrases.length ? <div className="detail-group"><span className="detail-label">PHRASES IN QUIZ</span>{catalogPhrases.map((seed) => { const phraseExamples = getPhraseExamples(seed); return <div key={seed.id} style={{ marginBottom: "10px" }}><p><strong>{seed.expression}</strong><em>{seed.meaningJa}</em></p>{phraseExamples.map((example, index) => <div key={`${seed.id}-example-${index}`} style={{ position: "relative", paddingRight: "42px" }}><span className="detail-label" style={{ marginBottom: "4px" }}>例文{index + 1}</span><p className="example-en">{example.english}</p><p className="example-ja">{example.japanese}</p><SpeakButton text={example.english} label={`${seed.expression}の例文${index + 1}を再生`} /></div>)}</div>; })}</div> : null}
          {entry.tags?.length ? <div className="detail-group"><span className="detail-label">TAGS</span><p className="tag-list">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</p></div> : null}
          {entry.derivatives?.length || entry.synonyms?.length ? <div className="detail-group"><span className="detail-label">RELATED WORDS</span><p className="tag-list">{[...(entry.derivatives ?? []), ...(entry.synonyms ?? [])].map((word) => <span key={word.word}>{word.word}</span>)}</p></div> : null}
          {examples.length ? <div className="example-box"><span className="detail-label">EXAMPLES</span>{examples.map((example, index) => <div key={example.id} style={{ position: "relative", paddingRight: "42px" }}><span className="detail-label" style={{ marginBottom: "4px" }}>例文{index + 1}</span><p className="example-en">{example.english}</p><p className="example-ja">{example.japanese}</p><SpeakButton text={example.english} label={`${entry.lemma}の例文${index + 1}を再生`} /></div>)}</div> : null}
        </div>
      </div>}
    </article>
  );
}
