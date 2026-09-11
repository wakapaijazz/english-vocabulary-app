import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import { exampleSupplementCatalog } from "../src/data/exampleSupplementCatalog";
import { phraseCatalog } from "../src/data/phraseCatalog";
import { phraseExampleCatalog } from "../src/data/phraseExampleCatalog";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal] as unknown as VocabularyEntry[];

describe("example supplements", () => {
  it("adds one reviewed example to every original word", () => {
    expect(Object.keys(exampleSupplementCatalog)).toHaveLength(500);
    expect(new Set(Object.keys(exampleSupplementCatalog)).size).toBe(500);
    for (const entry of entries) {
      const example = exampleSupplementCatalog[entry.lemma];
      expect(example, entry.lemma).toBeDefined();
      expect(example.english, entry.lemma).not.toMatch(/The word ".*" is useful in context/);
      expect(example.japanese, entry.lemma).not.toBe("");
      expect(example.clozeTarget, entry.lemma).toBeTruthy();
      expect(example.english.toLowerCase()).toContain(example.clozeTarget.toLowerCase());
    }
  });

  it("adds a distinct cloze example to every original phrase question", () => {
    expect(Object.keys(phraseExampleCatalog)).toHaveLength(60);
    expect(new Set(Object.keys(phraseExampleCatalog)).size).toBe(60);
    for (const seed of phraseCatalog) {
      const examples = phraseExampleCatalog[seed.id];
      expect(examples, seed.id).toHaveLength(1);
      expect(examples[0].prompt, seed.id).toContain("_____");
      expect(examples[0].english, seed.id).not.toBe(seed.exampleEnglish);
      expect(examples[0].japanese, seed.id).not.toBe(seed.exampleJapanese);
    }
  });
});
