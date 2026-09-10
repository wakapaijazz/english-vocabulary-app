import { useState } from "react";
import { phraseCatalog } from "../data/phraseCatalog";
import type { VocabularyEntry } from "../types/vocabulary";
import { POS_LABELS } from "../types/vocabulary";

export function WordCard({ entry, compact = false }: { entry: VocabularyEntry; compact?: boolean }) {
  const [expanded, setExpanded] = useState(!compact);
  const mainSense = entry.senses[0];
  const existingExpressions = new Set([
    ...(entry.collocations ?? []).map((item) => item.expression.toLowerCase()),
    ...(entry.idioms ?? []).map((item) => item.expression.toLowerCase()),
  ]);
  const catalogPhrases = phraseCatalog.filter(
    (seed) => seed.word.toLowerCase() === entry.lemma.toLowerCase() && !existingExpressions.has(seed.expression.toLowerCase()),
  );
  const examples = entry.examples ?? [];

  return (
    <article className={`word-card ${compact ? "compact" : ""}`}>
      <div className="word-card-top">
        <div>
          <div className="word-meta"><span className="level-pill">LEVEL {entry.level}</span><span>{POS_LABELS[mainSense.partOfSpeech]}</span></div>
          <h3>{entry.lemma}</h3>
          {entry.pronunciation && <p className="pronunciation">{entry.pronunciation}</p>}
        </div>
        <button className="icon-button" aria-label={expanded ? "詳細を閉じる" : "詳細を表示"} onClick={() => setExpanded((value) => !value)}>{expanded ? "−" : "+"}</button>
      </div>
      <div className="sense-list">
        {entry.senses.map((sense, index) => <div className="sense-row" key={sense.id}><span>{index + 1}</span><p>{sense.meaningJa}</p></div>)}
      </div>
      {expanded && (
        <div className="word-details">
          {entry.collocations?.length ? <div className="detail-group"><span className="detail-label">COLLOCATIONS</span>{entry.collocations.map((item) => <p key={item.id}><strong>{item.expression}</strong>{item.meaningJa && <em>{item.meaningJa}</em>}</p>)}</div> : null}
          {entry.idioms?.length ? <div className="detail-group"><span className="detail-label">IDIOMS</span>{entry.idioms.map((item) => <p key={item.id}><strong>{item.expression}</strong><em>{item.meaningJa}</em></p>)}</div> : null}
          {catalogPhrases.length ? <div className="detail-group"><span className="detail-label">PHRASES IN QUIZ</span>{catalogPhrases.map((seed) => <div key={seed.id} style={{ marginBottom: "10px" }}><p><strong>{seed.expression}</strong><em>{seed.meaningJa}</em></p><p className="example-en">{seed.exampleEnglish}</p><p className="example-ja">{seed.exampleJapanese}</p></div>)}</div> : null}
          {entry.derivatives?.length || entry.synonyms?.length ? <div className="detail-group"><span className="detail-label">RELATED WORDS</span><p className="tag-list">{[...(entry.derivatives ?? []), ...(entry.synonyms ?? [])].map((word) => <span key={word.word}>{word.word}</span>)}</p></div> : null}
          {examples.length ? <div className="example-box"><span className="detail-label">EXAMPLES</span>{examples.map((example) => <div key={example.id}><p className="example-en">{example.english}</p><p className="example-ja">{example.japanese}</p></div>)}</div> : null}
        </div>
      )}
    </article>
  );
}
