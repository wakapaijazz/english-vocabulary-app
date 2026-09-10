import { useEffect, useState } from "react";
import type { LearningHistory, QuizResult } from "../types/learning";
import type { QuizQuestion, QuizType } from "../types/quiz";
import type { VocabularyEntry } from "../types/vocabulary";
import { ProgressBar } from "../components/ProgressBar";
import { QuizCard } from "../components/QuizCard";
import { generateQuizQuestions, type QuizMode } from "../quiz/quizGenerator";

interface QuizPageProps { entries: VocabularyEntry[]; history: LearningHistory; questionCount: number; config: { type: QuizType; mode: QuizMode; level?: number }; onAnswer: (result: QuizResult) => void; onExit: () => void; onConfigChange: (type: QuizType) => void; }

export function QuizPage({ entries, history, questionCount, config, onAnswer, onExit, onConfigChange }: QuizPageProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>();
  const [startedAt, setStartedAt] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setQuestions(generateQuizQuestions(entries, { ...config, count: questionCount, history }));
    setCurrentIndex(0); setSelectedChoiceId(undefined); setFinished(false); setScore(0); setStartedAt(Date.now());
  }, [entries, questionCount, config.type, config.mode, config.level]);

  const question = questions[currentIndex];
  const handleSelect = (choice: { id: string }) => {
    if (!question || selectedChoiceId) return;
    const isCorrect = choice.id === question.correctChoiceId;
    setSelectedChoiceId(choice.id);
    if (isCorrect) setScore((value) => value + 1);
    onAnswer({ questionId: question.id, vocabularyId: question.vocabularyId, quizType: question.type, isCorrect, answeredAt: new Date().toISOString(), selectedChoiceId: choice.id, responseTimeMs: Date.now() - startedAt });
  };
  const next = () => {
    if (currentIndex + 1 >= questions.length) setFinished(true);
    else { setCurrentIndex((value) => value + 1); setSelectedChoiceId(undefined); setStartedAt(Date.now()); }
  };
  const restart = () => {
    setQuestions(generateQuizQuestions(entries, { ...config, count: questionCount, history }));
    setCurrentIndex(0); setSelectedChoiceId(undefined); setFinished(false); setScore(0); setStartedAt(Date.now());
  };

  if (finished) return <div className="page result-page"><div className="result-mark">✦</div><span className="eyebrow">QUIZ COMPLETE</span><h1>おつかれさまでした。</h1><p className="result-score"><strong>{score}</strong> / {questions.length} 問正解</p><ProgressBar value={questions.length ? score / questions.length * 100 : 0} label="今回の正答率" tone="teal"/><div className="result-actions"><button className="primary-button" onClick={restart}>もう一度挑戦</button><button className="outline-button" onClick={onExit}>ホームへ戻る</button></div></div>;

  return <div className="page quiz-page"><div className="quiz-toolbar"><button className="back-button" onClick={onExit}>← 戻る</button><div className="quiz-switcher"><button className={config.type === "mixed" ? "active" : ""} onClick={() => onConfigChange("mixed")}>MIXED</button><button className={config.type === "en-to-ja" ? "active" : ""} onClick={() => onConfigChange("en-to-ja")}>英→日</button><button className={config.type === "ja-to-en" ? "active" : ""} onClick={() => onConfigChange("ja-to-en")}>日→英</button><button className={config.type === "en-to-en" ? "active" : ""} onClick={() => onConfigChange("en-to-en")}>英→英</button><button className={config.type === "cloze" ? "active" : ""} onClick={() => onConfigChange("cloze")}>CLOZE</button><button className={config.type === "collocation" ? "active" : ""} onClick={() => onConfigChange("collocation")}>語句</button></div></div>{question ? <><div className="quiz-progress-row"><span>QUESTION <strong>{String(currentIndex + 1).padStart(2, "0")}</strong> / {String(questions.length).padStart(2, "0")}</span><span>{score} correct</span></div><ProgressBar value={currentIndex / Math.max(questions.length, 1) * 100}/><QuizCard question={question} selectedChoiceId={selectedChoiceId} answered={Boolean(selectedChoiceId)} onSelect={handleSelect}/>{selectedChoiceId && <div className="quiz-next-wrap"><button className="primary-button" onClick={next}>{currentIndex + 1 === questions.length ? "結果を見る" : "次の問題へ"} <span>→</span></button></div>}</> : <div className="empty-state"><span>◌</span><h2>出題できる単語がありません</h2><p>辞書を確認したり、条件を変更してみてください。</p></div>}</div>;
}
