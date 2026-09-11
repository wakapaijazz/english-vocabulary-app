import type { LearningHistory } from "../types/learning";
import type { VocabularyEntry } from "../types/vocabulary";
import type { PageKey } from "../components/Navigation";
import { ProgressBar } from "../components/ProgressBar";
import { StatCard } from "../components/StatCard";
import { isDue } from "../review/reviewScheduler";
import { isWeak } from "../review/masteryCalculator";

interface HomePageProps { entries: VocabularyEntry[]; history: LearningHistory; onNavigate: (page: PageKey) => void; onStartQuiz: (type: "mixed", mode?: "all" | "review" | "weak") => void; }

export function HomePage({ entries, history, onNavigate, onStartQuiz }: HomePageProps) {
  const states = Object.values(history);
  const learned = states.filter((state) => state.seenCount > 0).length;
  const mastered = states.filter((state) => state.mastery >= 4).length;
  const due = entries.filter((entry) => history[entry.id] && isDue(history[entry.id])).length;
  const weak = states.filter(isWeak).length;
  const totalAnswers = states.reduce((sum, state) => sum + state.seenCount, 0);
  const correctAnswers = states.reduce((sum, state) => sum + state.correctCount, 0);
  const accuracy = totalAnswers ? Math.round(correctAnswers / totalAnswers * 100) : 0;
  const levelProgress = [1, 2, 3, 4, 5, 6, 7, 8].map((level) => {
    const levelEntries = entries.filter((entry) => entry.level === level);
    const levelLearned = levelEntries.filter((entry) => history[entry.id]?.mastery >= 4).length;
    return { level, progress: levelEntries.length ? levelLearned / levelEntries.length * 100 : 0 };
  });

  return <div className="page home-page"><section className="welcome-card"><div><span className="eyebrow">YOUR VOCABULARY JOURNEY</span><h1>今日も一歩、<br/><em>ことばの森</em>へ。</h1><p>知っているを、使えるに変えていこう。</p></div><div className="welcome-mark" aria-hidden="true">Aa</div></section><div className="section-heading"><div><span className="eyebrow">TODAY</span><h2>今日の進捗</h2></div><span className="date-label">{new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "short" }).format(new Date())}</span></div><div className="stats-grid"><StatCard label="学習済み" value={learned} caption={`/ ${entries.length} 語`} tone="teal"/><StatCard label="復習待ち" value={due} caption="今日取り組む" tone="orange"/><StatCard label="正答率" value={`${accuracy}%`} caption={`${totalAnswers} 問回答`} tone="purple"/><StatCard label="苦手語" value={weak} caption="もう一度確認" tone="ink"/></div><div className="home-columns"><section className="panel level-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR LEVELS</span><h2>レベル別の定着度</h2></div><span className="mastery-count">{mastered} <small>MASTERED</small></span></div>{levelProgress.map((item) => <ProgressBar key={item.level} label={`Level ${item.level}`} value={item.progress} tone={item.level % 2 === 0 ? "orange" : "teal"}/>)}</section><section className="panel action-panel"><span className="eyebrow">START LEARNING</span><h2>何から始める？</h2><button className="primary-button" onClick={() => onNavigate("dictionary")}>辞書を開く <span>→</span></button><button className="secondary-button" onClick={() => onStartQuiz("mixed")}>10問クイッククイズ <span>✦</span></button><button className="text-button" onClick={() => onNavigate("review")}>今日の復習を見る →</button></section></div><section className="quote-strip"><span>“</span><p>少しずつでも、毎日続けたことばは裏切らない。</p><span>”</span></section></div>;
}
