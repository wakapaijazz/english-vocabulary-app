import { clozeChoiceOverrides } from "../data/clozeChoiceOverrides";
import { meaningChoiceOverrides } from "../data/meaningChoiceOverrides";
import type { QuizChoice } from "../types/quiz";
import type { VocabularyEntry, VocabularySense } from "../types/vocabulary";

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function primarySense(entry: VocabularyEntry): VocabularySense {
  return entry.senses[0] ?? { id: `${entry.id}-sense`, partOfSpeech: "other", meaningJa: "意味未登録" };
}

export function createChoices(
  target: VocabularyEntry,
  entries: VocabularyEntry[],
  answer: string,
  field: "lemma" | "meaning",
  count = 4,
): QuizChoice[] {
  const override = field === "lemma"
    ? clozeChoiceOverrides[target.lemma]
    : meaningChoiceOverrides[target.lemma];
  const candidateEntries = override?.length === 3
    ? [target, ...override.map((lemma) => entries.find((entry) => entry.lemma === lemma)).filter((entry): entry is VocabularyEntry => Boolean(entry))]
    : entries;
  const targetPartOfSpeech = primarySense(target).partOfSpeech;
  const compatibleEntries = field === "lemma"
    ? candidateEntries.filter((entry) => entry.id === target.id || primarySense(entry).partOfSpeech === targetPartOfSpeech)
    : candidateEntries;
  const choicePool = compatibleEntries.length >= count ? compatibleEntries : candidateEntries;
  const meaningByLemma = new Map(
    choicePool.map((entry) => [entry.lemma, primarySense(entry).meaningJa.trim()]),
  );
  const candidates = choicePool
    .filter((entry) => entry.id !== target.id)
    .map((entry) => ({ entry, sense: primarySense(entry) }))
    .sort((a, b) => Math.abs(a.entry.level - target.level) - Math.abs(b.entry.level - target.level))
    .map(({ entry, sense }) => field === "lemma" ? entry.lemma : sense.meaningJa.trim())
    .filter((text, index, all) => text !== answer && all.indexOf(text) === index);

  return shuffle([answer, ...candidates.slice(0, Math.max(0, count - 1))]).map((text, index) => ({
    id: `choice-${index}-${text}`,
    text,
    ...(field === "lemma" ? { meaningJa: meaningByLemma.get(text) } : {}),
  }));
}
