import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import { definitionCatalog } from "../src/data/definitionCatalog";
import { exampleRevisionCatalog } from "../src/data/exampleRevisionCatalog";
import { getWordExamples } from "../src/data/exampleResolver";
import { phraseCatalog } from "../src/data/phraseCatalog";
import { phraseExampleCatalog } from "../src/data/phraseExampleCatalog";
import { phraseMeaningCatalog } from "../src/data/phraseMeaningCatalog";
import { pronunciationCatalog } from "../src/data/pronunciationCatalog";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal] as unknown as VocabularyEntry[];
const placeholderPattern = /The word ".*" is useful in context\.|This example shows how to use the word/i;
const stopWords = new Set("a an the and or but if to of in on at for from with by as is are was were be been being this that these those it its they them their he she his her we our you your i me my do does did can could will would should may might must have has had than then very about into after before during over under up down out not no so who which what where when how all any each both more most some such only own new one two several".split(" "));

function contentTokens(text: string, lemma: string): string[] {
  const lemmaStem = lemma.toLowerCase().replace(/(ing|ed|es|s)$/i, "");
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).filter((word) => {
    const stem = word.replace(/(ing|ed|es|s)$/i, "");
    return !stopWords.has(word) && word !== lemma.toLowerCase() && stem !== lemmaStem;
  }))];
}

function similarity(left: string, right: string, lemma: string): number {
  const leftTokens = contentTokens(left, lemma);
  const rightTokens = contentTokens(right, lemma);
  const shared = leftTokens.filter((word) => rightTokens.includes(word));
  return shared.length / Math.max(1, Math.min(leftTokens.length, rightTokens.length));
}

describe("content rules", () => {
  it("keeps every word's rendered examples complete and non-placeholder", () => {
    expect(Object.keys(exampleRevisionCatalog).every((lemma) => entries.some((entry) => entry.lemma === lemma))).toBe(true);
    for (const entry of entries) {
      const examples = getWordExamples(entry);
      expect(examples.length, entry.lemma).toBeGreaterThanOrEqual(2);
      expect(new Set(examples.map((example) => example.english)).size, entry.lemma).toBe(examples.length);
      for (const example of examples) {
        expect(example.english.trim(), entry.lemma).not.toBe("");
        expect(example.japanese.trim(), entry.lemma).not.toBe("");
        expect(example.english, entry.lemma).not.toMatch(placeholderPattern);
        if (example.clozeTarget) expect(example.english.toLowerCase(), entry.lemma).toContain(example.clozeTarget.toLowerCase());
      }
    }
  });

  it("keeps multiple examples meaningfully different", () => {
    const violations = entries.flatMap((entry) => {
      const examples = getWordExamples(entry);
      const pairs: string[] = [];
      for (let i = 0; i < examples.length; i += 1) for (let j = i + 1; j < examples.length; j += 1) {
        if (similarity(examples[i].english, examples[j].english, entry.lemma) >= 0.9) pairs.push(`${examples[i].english} / ${examples[j].english}`);
      }
      return pairs.length ? [`${entry.lemma}: ${pairs.join(" | ")}`] : [];
    });
    expect(violations).toEqual([]);
  });

  it("keeps every definition and pronunciation covered", () => {
    expect(entries).toHaveLength(500);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(500);
    expect(new Set(entries.map((entry) => entry.lemma)).size).toBe(500);
    expect(entries.every((entry) => entry.senses[0]?.meaningEn || definitionCatalog[entry.lemma])).toBe(true);
    expect(entries.every((entry) => entry.pronunciation || pronunciationCatalog[entry.lemma])).toBe(true);
  });

  it("keeps all phrase questions structurally valid", () => {
    expect(phraseCatalog).toHaveLength(60);
    expect(new Set(phraseCatalog.map((seed) => seed.id)).size).toBe(60);
    expect(Object.keys(phraseExampleCatalog)).toHaveLength(60);
    for (const seed of phraseCatalog) {
      expect((seed.prompt.match(/_____/g) ?? []).length, seed.id).toBe(1);
      expect(seed.expression).toContain(seed.answer);
      expect(seed.definitionEn.trim(), seed.id).not.toBe("");
      expect(seed.exampleEnglish.trim(), seed.id).not.toBe("");
      expect(seed.exampleJapanese.trim(), seed.id).not.toBe("");
      expect(seed.choices, seed.id).toHaveLength(4);
      expect(new Set(seed.choices.map((choice) => choice.text)).size, seed.id).toBe(4);
      const meanings = phraseMeaningCatalog[seed.expression];
      expect(meanings, seed.id).toBeDefined();
      for (const choice of seed.choices) expect(meanings[choice.text] ?? choice.meaningJa, `${seed.id}:${choice.text}`).toBeTruthy();
      const additional = phraseExampleCatalog[seed.id];
      expect(additional?.length, seed.id).toBeGreaterThanOrEqual(1);
      for (const example of additional ?? []) {
        expect((example.prompt?.match(/_____/g) ?? []).length, seed.id).toBe(1);
        expect(example.english).not.toBe(seed.exampleEnglish);
        expect(example.japanese).not.toBe(seed.exampleJapanese);
      }
    }
  });
});
