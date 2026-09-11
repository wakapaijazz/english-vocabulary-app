import { useState } from "react";
import { phraseExampleCatalog } from "../data/phraseExampleCatalog";
import type { PhraseQuestionSeed } from "../data/phraseCatalog";
import { SpeakButton } from "./SpeakButton";

interface PhraseCardProps { phrase: PhraseQuestionSeed; isFavorite: boolean; onToggleFavorite: () => void; }

export function PhraseCard({ phrase, isFavorite, onToggleFavorite }: PhraseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const examples = [{ english: phrase.exampleEnglish, japanese: phrase.exampleJapanese }, ...(phraseExampleCatalog[phrase.id] ?? [])];
  const detailToggleStyle = { display: "grid", placeItems: "center", width: "32px", height: "32px", borderRadius: "10px", color: "var(--teal-dark)", background: expanded ? "#e7f1ea" : "transparent", transition: "background .2s ease" } as const;
  const chevronStyle = { width: "8px", height: "8px", borderRight: "1.5px solid currentColor", borderBottom: "1.5px solid currentColor", transform: expanded ? "rotate(225deg)" : "rotate(45deg)", marginTop: expanded ? "4px" : "-4px", transition: "transform .2s ease, margin .2s ease" } as const;

  return <article className="word-card phrase-card">
    <div className="word-card-top"><div><h3>{phrase.expression}</h3></div><div style={{ display: "flex", gap: "7px" }}>
      <button type="button" className="icon-button" aria-label={isFavorite ? "お気に入りから外す" : "お気に入りに追加"} aria-pressed={isFavorite} title={isFavorite ? "お気に入りから外す" : "お気に入りに追加"} onClick={onToggleFavorite} style={{ color: isFavorite ? "var(--orange)" : undefined }}>{isFavorite ? "★" : "☆"}</button>
      <button className="icon-button" aria-label={expanded ? "詳細を閉じる" : "詳細を表示"} aria-expanded={expanded} title={expanded ? "詳細を閉じる" : "詳細を表示"} onClick={() => setExpanded((value) => !value)} style={detailToggleStyle}><span aria-hidden="true" style={chevronStyle} /></button>
    </div></div>
    {expanded && <><div className="word-meta"><span className="level-pill">PHRASE</span><span>{phrase.word}</span></div><div className="sense-list"><div className="sense-row"><span>JP</span><p>{phrase.meaningJa}</p></div></div><div className="word-details" style={{ display: "block" }}><div className="detail-group"><span className="detail-label">ENGLISH DEFINITION</span><p>{phrase.definitionEn}</p></div><div className="example-box"><span className="detail-label">EXAMPLES</span>{examples.map((example, index) => <div key={`${phrase.id}-example-${index}`} style={{ position: "relative", paddingRight: "42px" }}><span className="detail-label" style={{ marginBottom: "4px" }}>例文{index + 1}</span><p className="example-en">{example.english}</p><p className="example-ja">{example.japanese}</p><SpeakButton text={example.english} label={`${phrase.expression}の例文${index + 1}を再生`} /></div>)}</div></div></>}
  </article>;
}
