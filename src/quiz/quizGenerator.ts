import { definitionCatalog } from "../data/definitionCatalog";
import { exampleCatalog } from "../data/exampleCatalog";
import { getWordExamples } from "../data/exampleResolver";
import { allPhraseCatalog } from "../data/phraseCatalogAll";
import { getPhraseExamples } from "../data/phraseResolver";
import { phraseMeaningCatalog } from "../data/phraseMeaningCatalog";
import { phraseMeaningExpansion } from "../data/phraseMeaningExpansion";
import type { LearningHistory } from "../types/learning";
import type { QuizChoice, QuizExample, QuizQuestion, QuizType } from "../types/quiz";
import type { VocabularyEntry, VocabularySense } from "../types/vocabulary";
import { isDue } from "../review/reviewScheduler";
import { isWeak } from "../review/masteryCalculator";
import { createChoices } from "./distractorGenerator";

export type QuizMode = "all" | "new" | "review" | "mistakes" | "weak";
type QuestionType = Exclude<QuizType, "mixed">;
const mixedTypes: QuestionType[] = ["en-to-ja", "ja-to-en", "en-to-en", "cloze", "collocation"];
interface PreparedExample extends QuizExample { target: string; }
interface PreparedExamples { all: QuizExample[]; cloze: PreparedExample[]; }
function shuffle<T>(items: T[]): T[] { return [...items].sort(() => Math.random() - 0.5); }
function pick<T>(items: T[]): T { return items[Math.floor(Math.random() * items.length)]; }
function primarySense(entry: VocabularyEntry): VocabularySense { return entry.senses[0] ?? { id: `${entry.id}-sense`, partOfSpeech: "other", meaningJa: "意味未登録" }; }
function getMeaning(entry: VocabularyEntry): string { return primarySense(entry).meaningJa.trim(); }
function getDefinition(entry: VocabularyEntry): string { return primarySense(entry).meaningEn?.trim() || definitionCatalog[entry.lemma] || "to have a particular meaning or use"; }
function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function findClozeTarget(lemma: string, english: string, preferred?: string): string | undefined {
  const candidates = [preferred, lemma, lemma.endsWith("y") ? `${lemma.slice(0, -1)}ied` : undefined, lemma.endsWith("y") ? `${lemma.slice(0, -1)}ies` : undefined, lemma.endsWith("e") ? `${lemma}d` : `${lemma}ed`, `${lemma}s`, `${lemma}es`, `${lemma}ing`].filter((candidate): candidate is string => Boolean(candidate));
  return candidates.find((candidate) => new RegExp(`\\b${escapeRegExp(candidate)}\\b`, "i").test(english));
}
function fallbackExample(lemma: string): PreparedExample { return { english: `The word "${lemma}" is useful in context.`, japanese: `「${lemma}」は文脈の中で役立つ語です。`, target: lemma }; }
function prepareExamples(entry: VocabularyEntry): PreparedExamples {
  const direct = getWordExamples(entry).map(({ english, japanese, clozeTarget }) => ({ english, japanese, clozeTarget })).filter((example) => example.english.trim() && example.japanese.trim());
  if (direct.length) {
    const cloze = direct.map((example) => ({ english: example.english, japanese: example.japanese, target: findClozeTarget(entry.lemma, example.english, example.clozeTarget) })).filter((example): example is PreparedExample => Boolean(example.target));
    return { all: direct.map(({ english, japanese }) => ({ english, japanese })), cloze: cloze.length ? cloze : [fallbackExample(entry.lemma)] };
  }
  const catalog = exampleCatalog[entry.lemma];
  if (catalog) {
    const target = findClozeTarget(entry.lemma, catalog.english);
    if (target) { const example = { english: catalog.english, japanese: catalog.japanese }; return { all: [example], cloze: [{ ...example, target }] }; }
  }
  const example = fallbackExample(entry.lemma);
  return { all: [{ english: example.english, japanese: example.japanese }], cloze: [example] };
}
function baseQuestion(entry: VocabularyEntry, type: QuestionType, index: number, selectedExample: QuizExample, examples: QuizExample[]): QuizQuestion {
  return { id: `${entry.id}-${type}-${index}`, vocabularyId: entry.id, senseId: primarySense(entry).id, type, skill: type === "ja-to-en" ? "production" : type === "cloze" ? "context" : "recognition", prompt: "", choices: [], correctChoiceId: "", explanation: selectedExample.japanese, details: { word: entry.lemma, meaningJa: getMeaning(entry), definitionEn: getDefinition(entry), exampleEnglish: selectedExample.english, exampleJapanese: selectedExample.japanese, examples } };
}
function articleFor(word: string): "a" | "an" { const lower = word.toLowerCase(); const anSound = new Set(["honest", "honor", "honour", "hour", "heir", "herb"]); const aSound = new Set(["european", "ewe", "unicorn", "unique", "unit", "unified", "university", "utility", "user", "usual", "useful", "one"]); if (anSound.has(lower)) return "an"; if (aSound.has(lower)) return "a"; return /^[aeiou]/i.test(word) ? "an" : "a"; }
function createWordQuestion(entry: VocabularyEntry, entries: VocabularyEntry[], type: QuestionType, index: number): QuizQuestion {
  const prepared = prepareExamples(entry); const selectedExample = type === "cloze" ? pick(prepared.cloze) : pick(prepared.all); const question = baseQuestion(entry, type, index, selectedExample, prepared.all); const meaningJa = getMeaning(entry); const definitionEn = getDefinition(entry); const correctChoiceId = `choice-correct-${entry.id}-${type}-${index}`;
  if (type === "en-to-ja") { question.prompt = entry.lemma; question.choices = createChoices(entry, entries, meaningJa, "meaning").map((choice) => choice.text === meaningJa ? { ...choice, id: correctChoiceId } : choice); }
  else if (type === "en-to-en") { question.prompt = definitionEn; question.choices = createChoices(entry, entries, entry.lemma, "lemma").map((choice) => choice.text === entry.lemma ? { ...choice, id: correctChoiceId } : choice); }
  else if (type === "ja-to-en") { question.prompt = meaningJa; question.choices = createChoices(entry, entries, entry.lemma, "lemma").map((choice) => choice.text === entry.lemma ? { ...choice, id: correctChoiceId } : choice); }
  else {
    const clozeExample = selectedExample as PreparedExample; const articleMatch = new RegExp(`\\b(a|an)\\s+${escapeRegExp(clozeExample.target)}\\b`, "i").exec(clozeExample.english); const targetPattern = new RegExp(escapeRegExp(clozeExample.target), "i"); const prompt = (articleMatch ? clozeExample.english.replace(articleMatch[0], "_____") : clozeExample.english.replace(targetPattern, "_____" )).replace(/\s+([,.!?])/g, "$1"); const rawChoices = createChoices(entry, entries, entry.lemma, "lemma"); question.prompt = prompt; question.choices = rawChoices.map((choice) => { const text = articleMatch ? `${articleFor(choice.text)} ${choice.text}` : choice.text; return choice.text === entry.lemma ? { ...choice, text, id: correctChoiceId } : { ...choice, text }; });
  }
  question.correctChoiceId = correctChoiceId; return question;
}
function createPhraseQuestion(seed: (typeof allPhraseCatalog)[number], index: number, entries: VocabularyEntry[]): QuizQuestion {
  const relatedEntry = entries.find((entry) => entry.lemma === seed.word); const meanings = { ...(phraseMeaningCatalog[seed.expression] ?? {}), ...(phraseMeaningExpansion[seed.expression] ?? {}) }; const correctChoiceId = `phrase-choice-${seed.id}-correct`; const availableExamples = getPhraseExamples(seed); const selectedExample = pick(availableExamples);
  return { id: `phrase-${seed.id}-${index}`, vocabularyId: relatedEntry?.id ?? seed.id, senseId: relatedEntry?.senses[0]?.id, type: "collocation", skill: "collocation", prompt: selectedExample.prompt ?? seed.prompt, choices: seed.choices.map((choice, choiceIndex) => ({ id: choice.text === seed.answer ? correctChoiceId : `phrase-choice-${seed.id}-${choiceIndex}`, text: choice.text, meaningJa: meanings[choice.text] ?? choice.meaningJa })), correctChoiceId, explanation: selectedExample.japanese, details: { word: seed.expression, meaningJa: seed.meaningJa, definitionEn: seed.definitionEn, exampleEnglish: selectedExample.english, exampleJapanese: selectedExample.japanese, examples: availableExamples.map(({ english, japanese }) => ({ english, japanese })) } };
}
function eligibleEntries(entries: VocabularyEntry[], mode: QuizMode, history: LearningHistory = {}, level?: number): VocabularyEntry[] { const byLevel = entries.filter((entry) => level === undefined || entry.level === level); const filtered = byLevel.filter((entry) => { const state = history[entry.id]; if (mode === "new") return !state?.seenCount; if (mode === "review") return Boolean(state && isDue(state)); if (mode === "mistakes") return Boolean(state?.wrongCount); if (mode === "weak") return Boolean(state && isWeak(state)); return true; }); return filtered.length ? filtered : byLevel; }
export function generateQuizQuestions(entries: VocabularyEntry[], options: { type: QuizType; count: number; mode?: QuizMode; history?: LearningHistory; level?: number }): QuizQuestion[] { const pool = shuffle(eligibleEntries(entries, options.mode ?? "all", options.history, options.level)); if (!pool.length || options.count <= 0) return []; const phrasePool = shuffle(allPhraseCatalog); let phraseIndex = 0; return Array.from({ length: options.count }, (_, index) => { const entry = pool[index % pool.length]; const type = options.type === "mixed" ? mixedTypes[index % mixedTypes.length] : options.type; if (type === "collocation") { const seed = phrasePool[phraseIndex % phrasePool.length]; phraseIndex += 1; return createPhraseQuestion(seed, index, entries); } return createWordQuestion(entry, entries, type, index); }); }
export function validateQuizQuestion(question: QuizQuestion): boolean { const choiceIds = new Set(question.choices.map((choice) => choice.id)); return question.choices.length === 4 && choiceIds.size === 4 && question.choices.some((choice) => choice.id === question.correctChoiceId) && Boolean(question.prompt.trim()); }
export type { QuizChoice };
