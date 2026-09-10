import { useState } from "react";
import { exampleSupplementCatalog } from "../data/exampleSupplementCatalog";
import { phraseCatalog } from "../data/phraseCatalog";
import { phraseExampleCatalog } from "../data/phraseExampleCatalog";
import type { VocabularyEntry } from "../types/vocabulary";
import { POS_LABELS } from "../types/vocabulary";
import { SpeakButton } from "./SpeakButton";

interface WordCardProps {
  entry: VocabularyEntry;
  compact?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function WordCard({ entry, compact = false, isFavorite = false, onToggleFavorite }: WordCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const mainSense = entry.senses[0];
  const existingExpressions = new Set([
    ...(entry.collocations ?? []).map((item) => item.expression.toLowerCase()),
    ...(entry.idioms ?? []).map((item) => item.expression.toLowerCase()),
  ]);
  const catalogPhrases = phraseCatalog.filter(
    (seed) => seed.word.toLowerCase() === entry.lemma.toLowerCase() && !existingExpressions.has(seed.expression.toLowerCase()),
  );
  const supplement = exampleSupplementCatalog[entry.lemma];
  const examples = [...(entry.examples ?? []), ...(supplement ? [supplement] : [])];

  return (
    <article className={`word-card ${compact ? "compact" : ""}`}>
      <div className="word-card-top">
        <div>
          <div className="word-meta"><span className="level-pill">LEVEL {entry.level}</span><span>{POS_LABELS[mainSense.partOfSpeech]}</span></div>
          <h3>{entry.lemma}</h3>
          {entry.pronunciation && <p className="pronunciation">{entry.pronunciation}</p>}
        </div>
        <div style={{ display: "flex", gap: "7px" }}>
          {onToggleFavorite && <button
            type="button"
            className="icon-button"
            aria-label={isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
            aria-pressed={isFavorite}
            title={isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
            onClick={onToggleFavorite}
            style={{ color: isFavorite ? "var(--orange)" : undefined }}
          >{isFavorite ? "★" : "☆"}</button>}
          <button className="icon-button" aria-label={expanded ? "詳細を閉じる" : "詳細を表示"} onClick={() => setExpanded((value) => !value)}>{expanded ? "−" : "+"}</button>
        </div>
      </div>
      <div className="sense-list">
        {entry.senses.map((sense, index) => <div className="sense-row" key={sense.id}><span>{index + 1}</span><p>{sense.meaningJa}</p></div>)}
      </div>
      {expanded && (
        <div className="word-details" style={compact ? { display: "block" } : undefined}>
          {entry.collocations?.length ? <div className="detail-group"><span className="detail-label">COLLOCATIONS</span>{entry.collocations.map((item) => <p key={item.id}><strong>{item.expression}</strong>{item.meaningJa && <em>{item.meaningJa}</em>}</p>)}</div> : null}
          {entry.idioms?.length ? <div className="detail-group"><span className="detail-label">IDIOMS</span>{entry.idioms.map((item) => <p key={item.id}><strong>{item.expression}</strong><em>{item.meaningJa}</em></p>)}</div> : null}
          {catalogPhrases.length ? <div className="detail-group"><span className="detail-label">PHRASES IN QUIZ</span>{catalogPhrases.map((seed) => {
            const phraseExamples = [{ english: seed.exampleEnglish, japanese: seed.exampleJapanese }, ...(phraseExampleCatalog[seed.id] ?? [])];
            return <div key={seed.id} style={{ marginBottom: "10px" }}><p><strong>{seed.expression}</strong><em>{seed.meaningJa}</em></p>{phraseExamples.map((example, index) => <div key={`${seed.id}-example-${index}`} style={{ position: "relative", paddingRight: "42px" }}><p className="example-en">{example.english}</p><p className="example-ja">{example.japanese}</p><SpeakButton text={example.english} label={`${seed.expression}の例文${index + 1}を再生`} /></div>)}</div>;
          })}</div> : null}
          {entry.tags?.length ? <div className="detail-group"><span className="detail-label">TAGS</span><p className="tag-list">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</p></div> : null}
          {entry.derivatives?.length || entry.synonyms?.length ? <div className="detail-group"><span className="detail-label">RELATED WORDS</span><p className="tag-list">{[...(entry.derivatives ?? []), ...(entry.synonyms ?? [])].map((word) => <span key={word.word}>{word.word}</span>)}</p></div> : null}
          {examples.length ? <div className="example-box"><span className="detail-label">EXAMPLES</span>{examples.map((example, index) => <div key={example.id} style={{ position: "relative", paddingRight: "42px" }}><p className="example-en">{example.english}</p><p className="example-ja">{example.japanese}</p><SpeakButton text={example.english} label={`${entry.lemma}の例文${index + 1}を再生`} /></div>)}</div> : null}
        </div>
      )}
    </article>
  );
}
