import { clozeChoiceOverrides } from "../data/clozeChoiceOverrides";
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
  const override = field === "lemma" ? clozeChoiceOverrides[target.lemma] : undefined;
  const candidateEntries = override?.length === 3
    ? [target, ...override.map((lemma) => entries.find((entry) => entry.lemma === lemma)).filter((entry): entry is VocabularyEntry => Boolean(entry))]
    : entries;
  const meaningByLemma = new Map(
    candidateEntries.map((entry) => [entry.lemma, primarySense(entry).meaningJa.trim()]),
  );
  const candidates = candidateEntries
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
