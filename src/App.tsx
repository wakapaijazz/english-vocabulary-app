import { useMemo, useState } from "react";
import vocabularyData from "./data/vocabulary.json";
import vocabularyExtra from "./data/vocabulary-extra.json";
import vocabularyMore from "./data/vocabulary-more.json";
import vocabularyFinal from "./data/vocabulary-final.json";
import vocabularyExpansion from "./data/vocabulary-expansion.json";
import vocabularyExpansion2 from "./data/vocabulary-expansion-2.json";
import { pronunciationCatalog } from "./data/pronunciationCatalog";
import { Navigation, type PageKey } from "./components/Navigation";
import { HomePage } from "./pages/HomePage";
import { QuizPage } from "./pages/QuizPage";
import { ReviewPage } from "./pages/ReviewPage";
import { MistakesPage } from "./pages/MistakesPage";
import { DictionaryPage } from "./pages/DictionaryPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { AppSettings, LearningHistory, QuizResult } from "./types/learning";
import type { QuizType } from "./types/quiz";
import type { VocabularyEntry } from "./types/vocabulary";
import { createEmptyLearningState, loadLearningHistory, loadSettings, saveLearningHistory, saveSettings } from "./services/storageService";
import { recordQuizResult } from "./review/masteryCalculator";

const rawEntries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal, ...vocabularyExpansion, ...vocabularyExpansion2] as unknown as VocabularyEntry[];
const entries = rawEntries.map((entry) => ({
  ...entry,
  pronunciation: entry.pronunciation ?? pronunciationCatalog[entry.lemma],
  senses: entry.senses.map((sense) => ({ ...sense, meaningJa: sense.meaningJa.trim() })),
})) as VocabularyEntry[];

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [history, setHistory] = useState<LearningHistory>(() => loadLearningHistory());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [quizConfig, setQuizConfig] = useState<{ type: QuizType; mode: "all" | "new" | "review" | "mistakes" | "weak" }>({ type: "mixed", mode: "all" });
  const learnedCount = useMemo(() => Object.values(history).filter((state) => state.seenCount > 0).length, [history]);

  const updateHistory = (result: QuizResult) => {
    setHistory((current) => {
      const previous = current[result.vocabularyId] ?? createEmptyLearningState(result.vocabularyId);
      const updated = { ...current, [result.vocabularyId]: recordQuizResult(previous, result) };
      saveLearningHistory(updated);
      return updated;
    });
  };
  const openQuiz = (type: QuizType = "mixed", mode: "all" | "new" | "review" | "mistakes" | "weak" = "all") => { setQuizConfig({ type, mode }); setActivePage("quiz"); };
  const saveAppSettings = (next: AppSettings) => { setSettings(next); saveSettings(next); };

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">W</span><div><strong>wordly</strong><small>VOCABULARY GARDEN</small></div></div><Navigation activePage={activePage} onNavigate={setActivePage}/><div className="sidebar-footer"><span className="eyebrow">YOUR PROGRESS</span><strong>{learnedCount} <small>/ {entries.length} words</small></strong><div className="mini-track"><span style={{ width: `${entries.length ? learnedCount / entries.length * 100 : 0}%` }}/></div></div></aside>
    <header className="mobile-header"><div className="brand"><span className="brand-mark">W</span><strong>wordly</strong></div><span className="mobile-progress">{learnedCount}/{entries.length} WORDS</span></header>
    <main className="main-content">
      {activePage === "home" && <HomePage entries={entries} history={history} onNavigate={setActivePage} onStartQuiz={openQuiz}/>} 
      {activePage === "quiz" && <QuizPage entries={entries} history={history} questionCount={settings.questionsPerSet} config={{ type: quizConfig.type, mode: quizConfig.mode }} onAnswer={updateHistory} onExit={() => setActivePage("home")} onConfigChange={(type) => setQuizConfig((current) => ({ ...current, type }))}/>} 
      {activePage === "review" && <ReviewPage entries={entries} history={history} onStart={() => openQuiz("mixed", "review")} onNavigate={setActivePage}/>} 
      {activePage === "mistakes" && <MistakesPage entries={entries} history={history} onStart={() => openQuiz("mixed", "mistakes")}/>} 
      {activePage === "dictionary" && <DictionaryPage entries={entries}/>} 
      {activePage === "statistics" && <StatisticsPage entries={entries} history={history}/>} 
      {activePage === "settings" && <SettingsPage settings={settings} onSave={saveAppSettings}/>} 
    </main>
    <div className="mobile-nav"><Navigation activePage={activePage} onNavigate={setActivePage} mobile /></div>
  </div>;
}



