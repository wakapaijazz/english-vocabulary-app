import { SpeakButton } from "./SpeakButton";
import type { QuizChoice, QuizExample, QuizQuestion } from "../types/quiz";

interface QuizCardProps { question: QuizQuestion; selectedChoiceId?: string; answered: boolean; onSelect: (choice: QuizChoice) => void; isFavorite?: boolean; onToggleFavorite?: () => void; }

export function QuizCard({ question, selectedChoiceId, answered, onSelect, isFavorite = false, onToggleFavorite }: QuizCardProps) {
  const correct = selectedChoiceId === question.correctChoiceId;
  const isCloze = question.type === "cloze";
  const isPhrase = question.type === "collocation";
  const formatClozeChoice = (choice: QuizChoice) => {
    if (!choice.baseText || !choice.inflectedText || choice.baseText.toLowerCase() === choice.inflectedText.toLowerCase()) return choice.text;
    return `${choice.text}（原形: ${choice.baseText}）`;
  };
  const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);
  const correctChoiceText = correctChoice ? (isCloze && answered ? formatClozeChoice(correctChoice) : correctChoice.text) : question.details.word;
  const completePhrase = (choiceText: string) => question.details.word.replace(/\S+$/, choiceText);
  const correctText = isPhrase ? completePhrase(correctChoiceText) : correctChoiceText;
  const canSpeakPrompt = question.type === "en-to-ja" || question.type === "en-to-en";
  const choicesAreEnglish = question.type !== "en-to-ja";
  const pronunciationUnlocked = answered;
  const examples: QuizExample[] = question.details.examples?.length ? question.details.examples : [{ english: question.details.exampleEnglish, japanese: question.details.exampleJapanese }];

  return <section className="quiz-card">
    <div className="quiz-card-header"><span className="quiz-type-label">{isPhrase ? "FIXED PHRASE CLOZE" : isCloze ? "FILL IN THE BLANK" : question.type === "en-to-en" ? "ENGLISH DEFINITION" : "VOCABULARY CHECK"}</span>{onToggleFavorite && <button type="button" className={isFavorite ? "quiz-favorite-button active" : "quiz-favorite-button"} aria-label={isFavorite ? "お気に入りから外す" : "お気に入りに追加"} aria-pressed={isFavorite} title={isFavorite ? "お気に入りから外す" : "お気に入りに追加"} onClick={onToggleFavorite}>{isFavorite ? "★" : "☆"}</button>}</div>
    <div style={{ position: "relative" }}><h2 className="quiz-prompt" style={{ padding: pronunciationUnlocked && canSpeakPrompt ? "0 42px" : undefined }}>{question.prompt}</h2>{pronunciationUnlocked && canSpeakPrompt && <SpeakButton text={question.prompt} label="問題の英語を再生" />}</div>
    <div className="choice-grid">{question.choices.map((choice, index) => { const isSelected = selectedChoiceId === choice.id; const isCorrect = choice.id === question.correctChoiceId; const spokenText = pronunciationUnlocked && isPhrase ? completePhrase(choice.text) : choice.text; const displayText = isCloze && answered ? formatClozeChoice(choice) : spokenText; const showChoiceAudio = pronunciationUnlocked && choicesAreEnglish; return <div key={choice.id} style={{ position: "relative" }}><button className={`choice-button ${answered && isCorrect ? "correct" : ""} ${answered && isSelected && !isCorrect ? "incorrect" : ""}`} disabled={answered} onClick={() => onSelect(choice)} style={{ width: "100%", paddingRight: showChoiceAudio ? "54px" : undefined }}><span>{String.fromCharCode(65 + index)}</span><div style={{ display: "flex", flexDirection: "column", gap: "3px", textAlign: "left" }}><strong>{displayText}</strong>{answered && choice.meaningJa && <small style={{ color: "var(--muted)", fontSize: "11px", fontWeight: 500 }}>{choice.meaningJa}</small>}</div></button>{showChoiceAudio && <SpeakButton text={spokenText} label={`選択肢${String.fromCharCode(65 + index)}の英語を再生`} />}</div>; })}</div>
    {answered && <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`}><strong>{correct ? "正解！" : "不正解"}</strong>{!correct && <p>正解は「{correctText}」です。</p>}<div className="detail-group answer-details">{isCloze && <p><strong>補充した単語</strong>{correctChoice ? formatClozeChoice(correctChoice) : question.details.answerForm ?? question.details.word}</p>}{isPhrase && <><p><strong>空欄の答え</strong>{correctChoiceText}</p><p><strong>完成した表現</strong>{correctText}</p></>}<p><strong>日本語訳</strong>{question.details.meaningJa}</p><div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}><strong>英語説明</strong><span style={{ flex: 1 }}>{question.details.definitionEn}</span><span style={{ position: "relative", width: "48px", height: "36px", flex: "0 0 48px" }}><SpeakButton text={question.details.definitionEn} label="英語説明を再生" /></span></div>{examples.map((example, index) => <div key={`${question.id}-example-${index}`} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}><strong>例文{index + 1}</strong><span style={{ flex: 1 }}><span style={{ display: "block" }}>{example.english}</span><span style={{ display: "block", color: "var(--muted)", marginTop: "3px" }}>（{example.japanese}）</span></span><span style={{ position: "relative", width: "48px", height: "36px", flex: "0 0 48px" }}><SpeakButton text={example.english} label={`例文${index + 1}を再生`} /></span></div>)}</div></div>}
  </section>;
}