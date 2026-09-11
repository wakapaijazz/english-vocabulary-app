import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import vocabularyExpansion from "../src/data/vocabulary-expansion.json";
import vocabularyExpansion2 from "../src/data/vocabulary-expansion-2.json";
import vocabularyExpansion3 from "../src/data/vocabulary-expansion-3.json";
import { clozeChoiceOverrides } from "../src/data/clozeChoiceOverrides";
import { phraseChoiceOverrides } from "../src/data/phraseChoiceOverrides";
import { allPhraseCatalog } from "../src/data/phraseCatalogAll";
import { generateQuizQuestions } from "../src/quiz/quizGenerator";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal, ...vocabularyExpansion, ...vocabularyExpansion2, ...vocabularyExpansion3] as unknown as VocabularyEntry[];

describe("cloze answer uniqueness", () => {
  it("uses exactly the reviewed distractors for ambiguous word clozes", () => {
    const questions = generateQuizQuestions(entries, { type: "cloze", count: entries.length });
    for (const [lemma, distractors] of Object.entries(clozeChoiceOverrides)) {
      const question = questions.find((candidate) => candidate.details.word === lemma);
      expect(question, lemma).toBeDefined();
      expect(distractors).toHaveLength(3);
      expect(new Set(distractors).size).toBe(3);
      expect(new Set(question!.choices.map((choice) => choice.text))).toEqual(new Set([lemma, ...distractors]));
    }
  });

  it("makes the past tense explicit for absorb", () => {
    const questions = generateQuizQuestions(entries, { type: "cloze", count: entries.length });
    const question = questions.find((candidate) => candidate.details.word === "absorb");
    expect(question?.prompt).toContain("yesterday");
    expect(question?.prompt).toContain("missed her stop");
    expect(question?.choices.map((choice) => choice.text)).toEqual(expect.arrayContaining(["absorb", "assign", "inspect", "publish"]));
  });
  it("uses reviewed phrase choices that contain only one answer", () => {
    for (const [id, choices] of Object.entries(phraseChoiceOverrides)) {
      const seed = allPhraseCatalog.find((candidate) => candidate.id === id);
      expect(seed, id).toBeDefined();
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map((choice) => choice.text)).size).toBe(4);
      expect(choices.filter((choice) => choice.text === seed!.answer)).toHaveLength(1);
      expect(seed!.choices.map((choice) => choice.text)).toEqual(choices.map((choice) => choice.text));
    }
  });
});
