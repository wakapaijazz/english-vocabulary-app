import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import { generateQuizQuestions } from "../src/quiz/quizGenerator";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal] as unknown as VocabularyEntry[];

describe("multiple example support", () => {
  it("uses one valid example for cloze and keeps every example in the explanation", () => {
    const fixture: VocabularyEntry = {
      ...entries[0],
      id: "fixture-anchor",
      lemma: "anchor",
      examples: [
        { id: "fixture-a", english: "The anchor held the boat in place.", japanese: "いかりが船をその場につないだ。", clozeTarget: "anchor" },
        { id: "fixture-b", english: "Her advice became an anchor during the crisis.", japanese: "危機の間、彼女の助言は心の支えになった。", clozeTarget: "anchor" },
      ],
    };
    const questions = generateQuizQuestions([fixture, ...entries.slice(1, 4)], { type: "cloze", count: 20 });
    const fixtureQuestions = questions.filter((question) => question.details.word === "anchor");

    expect(fixtureQuestions.length).toBeGreaterThan(0);
    expect(fixtureQuestions.every((question) => question.prompt.includes("_____"))).toBe(true);
    expect(fixtureQuestions.every((question) => Array.isArray(question.details.examples))).toBe(true);
    expect(fixtureQuestions.every((question) => question.details.examples.length === 2)).toBe(true);
    expect(fixtureQuestions.every((question) => ["The anchor held the boat in place.", "Her advice became an anchor during the crisis."].includes(question.details.exampleEnglish))).toBe(true);
  });
});
