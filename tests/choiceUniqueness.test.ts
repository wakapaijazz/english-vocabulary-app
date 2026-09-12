import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import vocabularyExpansion from "../src/data/vocabulary-expansion.json";
import vocabularyExpansion2 from "../src/data/vocabulary-expansion-2.json";
import vocabularyExpansion3 from "../src/data/vocabulary-expansion-3.json";
import { clozeChoiceOverrides } from "../src/data/clozeChoiceOverrides";
import { meaningChoiceOverrides } from "../src/data/meaningChoiceOverrides";
import { generateQuizQuestions } from "../src/quiz/quizGenerator";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal, ...vocabularyExpansion, ...vocabularyExpansion2, ...vocabularyExpansion3] as unknown as VocabularyEntry[];

function meaningParts(meaning: string): string[] {
  return meaning.split(/[、,，・/／]/).map((part) => part.trim()).filter((part) => part.length >= 2);
}

function sharedMeaningParts(left: string, right: string): string[] {
  const rightParts = new Set(meaningParts(right));
  return meaningParts(left).filter((part) => rightParts.has(part));
}

describe("quiz choice uniqueness", () => {
  it("does not reuse a Japanese sense component in word-question distractors", () => {
    const violations: string[] = [];
    for (const type of ["en-to-ja", "ja-to-en", "cloze"] as const) {
      const questions = generateQuizQuestions(entries, { type, count: entries.length });
      expect(questions).toHaveLength(entries.length);
      for (const question of questions) {
        const answerMeaning = question.details.meaningJa;
        for (const choice of question.choices) {
          if (choice.id === question.correctChoiceId) continue;
          const choiceMeaning = type === "en-to-ja"
            ? choice.text
            : choice.meaningJa ?? "";
          const shared = sharedMeaningParts(answerMeaning, choiceMeaning);
          if (shared.length) violations.push(`${type}:${question.details.word}:${shared.join("/")}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps English-definition choices in the answer's primary part of speech", () => {
    const questions = generateQuizQuestions(entries, { type: "en-to-en", count: entries.length });
    const byLemma = new Map(entries.map((entry) => [entry.lemma, entry]));
    for (const question of questions) {
      const target = byLemma.get(question.details.word);
      expect(target, question.details.word).toBeDefined();
      const partOfSpeech = target!.senses[0]?.partOfSpeech;
      const samePartOfSpeechCount = entries.filter((entry) => entry.senses[0]?.partOfSpeech === partOfSpeech).length;
      for (const choice of question.choices) {
        const entry = byLemma.get(choice.text);
        expect(entry, `${question.details.word}:${choice.text}`).toBeDefined();
        if (samePartOfSpeechCount >= 4) expect(entry!.senses[0]?.partOfSpeech, `${question.details.word}:${choice.text}`).toBe(partOfSpeech);
      }
    }
  });

  it("keeps every reviewed override backed by real, same-form vocabulary", () => {
    const byLemma = new Map(entries.map((entry) => [entry.lemma, entry]));
    for (const [answer, distractors] of Object.entries({ ...clozeChoiceOverrides, ...meaningChoiceOverrides })) {
      expect(byLemma.has(answer), answer).toBe(true);
      expect(distractors).toHaveLength(3);
      expect(new Set(distractors).size, answer).toBe(3);
      for (const distractor of distractors) expect(byLemma.has(distractor), `${answer}:${distractor}`).toBe(true);
    }
  });
});
