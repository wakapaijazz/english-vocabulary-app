import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import vocabularyExpansion from "../src/data/vocabulary-expansion.json";
import vocabularyExpansion2 from "../src/data/vocabulary-expansion-2.json";
import vocabularyExpansion3 from "../src/data/vocabulary-expansion-3.json";
import { definitionCatalog } from "../src/data/definitionCatalog";
import { allPhraseCatalog } from "../src/data/phraseCatalogAll";
import { pronunciationCatalog } from "../src/data/pronunciationCatalog";
import { generateQuizQuestions } from "../src/quiz/quizGenerator";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal, ...vocabularyExpansion, ...vocabularyExpansion2, ...vocabularyExpansion3] as unknown as VocabularyEntry[];

describe("vocabulary feature coverage", () => {
  it("provides 1000 unique words with pronunciation data", () => {
    const missing = entries.filter((entry) => !entry.pronunciation && !pronunciationCatalog[entry.lemma]);
    expect(entries).toHaveLength(1000);
    expect(new Set(entries.map((entry) => entry.lemma)).size).toBe(1000);
    expect(missing).toEqual([]);
  });

  it("provides a real English definition for every word", () => {
    const missing = entries.filter((entry) => !(entry.senses[0]?.meaningEn ?? definitionCatalog[entry.lemma]));
    expect(missing).toEqual([]);
    expect(definitionCatalog.yield).toBe("to produce something or give way");
  });

  it("uses natural direct examples and valid cloze targets", () => {
    const forbidden = [/The researchers tried to .* the problem\./, /The report examines the role of .*\./, /described the method as/, /recorded the results/];
    const examples = entries.flatMap((entry) => entry.examples ?? []);
    expect(entries.filter((entry) => entry.examples?.[0]).every((entry) => entry.examples![0].clozeTarget && entry.examples[0].english.toLowerCase().includes(entry.examples[0].clozeTarget.toLowerCase()))).toBe(true);
    expect(examples.filter((example) => forbidden.some((pattern) => pattern.test(example.english)))).toEqual([]);
  });

  it("adds Japanese meanings to English answer choices", () => {
    const questions = generateQuizQuestions(entries, { type: "ja-to-en", count: 5 });
    expect(questions).toHaveLength(5);
    expect(questions.flatMap((question) => question.choices).every((choice) => Boolean(choice.meaningJa))).toBe(true);
  });

  it("generates 200 collocation and idiom cloze questions", () => {
    expect(allPhraseCatalog).toHaveLength(200);
    expect(new Set(allPhraseCatalog.map((seed) => seed.id)).size).toBe(200);
    const questions = generateQuizQuestions(entries, { type: "collocation", count: 200 });
    expect(questions).toHaveLength(200);
    expect(questions.every((question) => question.type === "collocation" && question.prompt.includes("_____"))).toBe(true);
    expect(questions.flatMap((question) => question.choices).every((choice) => Boolean(choice.meaningJa))).toBe(true);
  });

  it("keeps a/an with every cloze target that follows an article", () => {
    const questions = generateQuizQuestions(entries, { type: "cloze", count: entries.length });
    const articleQuestions = questions.filter((question) => {
      const target = question.details.word.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
      return new RegExp(`\\b(a|an)\\s+${target}\\b`, "i").test(question.details.exampleEnglish);
    });
    expect(articleQuestions.length).toBeGreaterThan(0);
    expect(articleQuestions.every((question) => {
      const target = question.details.word.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
      const articlePattern = new RegExp(`\\b(a|an)\\s+${target}\\b`, "i");
      return !articlePattern.test(question.prompt) && question.choices.every((choice) => /^(a|an) /.test(choice.text));
    })).toBe(true);
  });

  it("creates a real blank for inflected fallback examples", () => {
    const questions = generateQuizQuestions(entries, { type: "cloze", count: entries.length });
    for (const lemma of ["modify", "deny", "occupy"]) {
      const question = questions.find((item) => item.details.word === lemma);
      expect(question?.prompt).toContain("_____");
    }
    expect(questions.every((question) => question.prompt.includes("_____"))).toBe(true);
  });

  it("assigns dictionary-compatible favorite IDs to reviewed questions", () => {
    const wordQuestion = generateQuizQuestions(entries, { type: "en-to-ja", count: 1 })[0];
    const phraseQuestion = generateQuizQuestions(entries, { type: "collocation", count: 1 })[0];
    expect(wordQuestion.favoriteId).toBe(wordQuestion.vocabularyId);
    expect(phraseQuestion.favoriteId).toMatch(/^phrase:/);
  });
});







