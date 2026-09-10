import { describe, expect, it } from "vitest";
import baseData from "../src/data/vocabulary.json";
import extraData from "../src/data/vocabulary-extra.json";
import moreData from "../src/data/vocabulary-more.json";
import finalData from "../src/data/vocabulary-final.json";
import { generateQuizQuestions, validateQuizQuestion } from "../src/quiz/quizGenerator";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...baseData, ...extraData, ...moreData, ...finalData] as unknown as VocabularyEntry[];

describe("English to English quiz", () => {
  it("loads 500 vocabulary entries", () => expect(entries).toHaveLength(500));
  it("uses an English definition and provides four choices", () => {
    const questions = generateQuizQuestions(entries, { type: "en-to-en", count: 10 });
    expect(questions).toHaveLength(10);
    questions.forEach((question) => { expect(question.type).toBe("en-to-en"); expect(question.prompt).toMatch(/[a-z]/i); expect(validateQuizQuestion(question)).toBe(true); });
  });
});
