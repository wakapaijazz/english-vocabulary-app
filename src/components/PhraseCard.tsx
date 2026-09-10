import { useState } from "react";
import { phraseExampleCatalog } from "../data/phraseExampleCatalog";
import type { PhraseQuestionSeed } from "../data/phraseCatalog";
import { SpeakButton } from "./SpeakButton";

interface PhraseCardProps {
  phrase: PhraseQuestionSeed;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function PhraseCard({ phrase, isFavorite, onToggleFavorite }: PhraseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const examples = [{ english: phrase.exampleEnglish, japanese: phrase.exampleJapanese }, ...(phraseExampleCatalog[phrase.id] ?? [])];

  return (
    <article className="word-card phrase-card">
      <div className="word-card-top">
        <div>
          <h3>{phrase.expression}</h3>
        </div>
        <div style={{ display: "flex", gap: "7px" }}>
          <button
            type="button"
            className="icon-button"
            aria-label={isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
            aria-pressed={isFavorite}
            title={isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
            onClick={onToggleFavorite}
            style={{ color: isFavorite ? "var(--orange)" : undefined }}
          >
            {isFavorite ? "★" : "☆"}
          </button>
          <button className="icon-button" aria-label={expanded ? "詳細を閉じる" : "詳細を表示"} title={expanded ? "詳細を閉じる" : "詳細を表示"} onClick={() => setExpanded((value) => !value)}>{expanded ? "⌃" : "⌄"}</button>
        </div>
      </div>
      {expanded && <>
        <div className="word-meta"><span className="level-pill">PHRASE</span><span>{phrase.word}</span></div>
        <div className="sense-list">
          <div className="sense-row"><span>JP</span><p>{phrase.meaningJa}</p></div>
        </div>
        <div className="word-details">
          <div className="detail-group">
            <span className="detail-label">ENGLISH DEFINITION</span>
            <p>{phrase.definitionEn}</p>
          </div>
          <div className="example-box">
            <span className="detail-label">EXAMPLES</span>
            {examples.map((example, index) => (
              <div key={`${phrase.id}-example-${index}`} style={{ position: "relative", paddingRight: "42px" }}>
                <p className="example-en">{example.english}</p>
                <p className="example-ja">{example.japanese}</p>
                <SpeakButton text={example.english} label={`${phrase.expression}の例文${index + 1}を再生`} />
              </div>
            ))}
          </div>
        </div>
      </>}
    </article>
  );
}
