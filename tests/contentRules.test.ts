import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import vocabularyExpansion from "../src/data/vocabulary-expansion.json";
import vocabularyExpansion2 from "../src/data/vocabulary-expansion-2.json";
import { definitionCatalog } from "../src/data/definitionCatalog";
import { exampleRevisionCatalog } from "../src/data/exampleRevisionCatalog";
import { exampleRevisionExtra } from "../src/data/exampleRevisionExtra";
import { exampleThirdCatalog } from "../src/data/exampleThirdCatalog";
import { getWordExamples } from "../src/data/exampleResolver";
import { allPhraseCatalog } from "../src/data/phraseCatalogAll";
import { phraseExampleCatalog } from "../src/data/phraseExampleCatalog";
import { phraseExampleExpansion } from "../src/data/phraseExampleExpansion";
import { phraseExampleExpansion2 } from "../src/data/phraseExampleExpansion2";
import { getPhraseExamples } from "../src/data/phraseResolver";
import { phraseMeaningCatalog } from "../src/data/phraseMeaningCatalog";
import { phraseMeaningExpansion } from "../src/data/phraseMeaningExpansion";
import { phraseMeaningExpansion2 } from "../src/data/phraseMeaningExpansion2";
import { pronunciationCatalog } from "../src/data/pronunciationCatalog";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal, ...vocabularyExpansion, ...vocabularyExpansion2] as unknown as VocabularyEntry[];
const placeholderPattern = /The word ".*" is useful in context\.|This example shows how to use the word/i;
const stopWords = new Set("a an the and or but if to of in on at for from with by as is are was were be been being this that these those it its they them their he she his her we our you your i me my do does did can could will would should may might must have has had than then very about into after before during over under up down out not no so who which what where when how all any each both more most some such only own new one several".split(" "));

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

function normalizedWords(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
}

function targetLike(word: string, lemma: string): boolean {
  const lemmaStem = lemma.toLowerCase().replace(/(ing|ed|es|s)$/i, "");
  const wordStem = word.replace(/(ing|ed|es|s)$/i, "");
  return wordStem === lemmaStem;
}

function sentenceSkeleton(text: string, lemma: string): string[] {
  return normalizedWords(text).map((word) => {
    if (targetLike(word, lemma)) return "TARGET";
    if (stopWords.has(word)) return ["a", "an", "the", "any", "each", "both", "some", "one"].includes(word) ? "DET" : word;
    return "CONTENT";
  });
}

function sharedLiteralPrefix(left: string, right: string): string[] {
  const leftWords = normalizedWords(left);
  const rightWords = normalizedWords(right);
  const prefix: string[] = [];
  while (prefix.length < leftWords.length && prefix.length < rightWords.length && leftWords[prefix.length] === rightWords[prefix.length]) prefix.push(leftWords[prefix.length]);
  return prefix;
}

function sharedContextTokens(left: string, right: string, lemma: string): string[] {
  const leftTokens = contentTokens(left, lemma);
  const rightTokens = contentTokens(right, lemma);
  return [...new Set(leftTokens.filter((word) => rightTokens.includes(word)))];
}

describe("content rules", () => {
  it("keeps every word's rendered examples complete and non-placeholder", () => {
    expect(Object.keys({ ...exampleRevisionCatalog, ...exampleRevisionExtra }).every((lemma) => entries.some((entry) => entry.lemma === lemma))).toBe(true);
    for (const entry of entries) {
      const examples = getWordExamples(entry);
      expect(examples.length, entry.lemma).toBeGreaterThanOrEqual(2);
      if (entry.senses.length > 1) expect(examples.length, entry.lemma).toBeGreaterThanOrEqual(3);
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
        const sameStructure = sentenceSkeleton(examples[i].english, entry.lemma).join(" ") === sentenceSkeleton(examples[j].english, entry.lemma).join(" ");
        const sharedContext = sharedContextTokens(examples[i].english, examples[j].english, entry.lemma);
        const longSharedPrefix = sharedLiteralPrefix(examples[i].english, examples[j].english).length >= 4;
        if (similarity(examples[i].english, examples[j].english, entry.lemma) >= 0.9 || (sameStructure && sharedContext.length > 0) || longSharedPrefix) pairs.push(examples[i].english + " / " + examples[j].english);
      }
      return pairs.length ? [`${entry.lemma}: ${pairs.join(" | ")}`] : [];
    });
    expect(violations).toEqual([]);
  });

  it("keeps every definition and pronunciation covered", () => {
    expect(entries).toHaveLength(800);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(800);
    expect(new Set(entries.map((entry) => entry.lemma)).size).toBe(800);
    expect(entries.every((entry) => entry.senses[0]?.meaningEn || definitionCatalog[entry.lemma])).toBe(true);
    expect(entries.every((entry) => entry.pronunciation || pronunciationCatalog[entry.lemma])).toBe(true);
  });

  it("keeps all phrase questions structurally valid", () => {
    expect(allPhraseCatalog).toHaveLength(150);
    expect(new Set(allPhraseCatalog.map((seed) => seed.id)).size).toBe(150);
    expect(Object.keys(phraseExampleCatalog)).toHaveLength(60);
    expect(Object.keys(phraseExampleExpansion)).toHaveLength(40);
    expect(Object.keys(phraseExampleExpansion2)).toHaveLength(50);
    for (const seed of allPhraseCatalog) {
      expect((seed.prompt.match(/_____/g) ?? []).length, seed.id).toBe(1);
      expect(seed.expression).toContain(seed.answer);
      expect(seed.definitionEn.trim(), seed.id).not.toBe("");
      expect(seed.exampleEnglish.trim(), seed.id).not.toBe("");
      expect(seed.exampleJapanese.trim(), seed.id).not.toBe("");
      expect(seed.choices, seed.id).toHaveLength(4);
      expect(new Set(seed.choices.map((choice) => choice.text)).size, seed.id).toBe(4);
      const meanings = { ...(phraseMeaningCatalog[seed.expression] ?? {}), ...(phraseMeaningExpansion[seed.expression] ?? {}), ...(phraseMeaningExpansion2[seed.expression] ?? {}) };
      expect(Object.keys(meanings), seed.id).toHaveLength(4);
      for (const choice of seed.choices) expect(meanings[choice.text] ?? choice.meaningJa, `${seed.id}:${choice.text}`).toBeTruthy();
      const examples = getPhraseExamples(seed);
      expect(examples.length, seed.id).toBeGreaterThanOrEqual(2);
      expect(examples[1].english, seed.id).not.toBe(seed.exampleEnglish);
      expect(examples[1].japanese, seed.id).not.toBe(seed.exampleJapanese);
      for (const example of examples.slice(1)) expect((example.prompt?.match(/_____/g) ?? []).length, seed.id).toBe(1);
    }
  });

  it("keeps the reviewed third-example catalog aligned with legacy multi-sense words", () => {
    expect(Object.keys(exampleThirdCatalog)).toHaveLength(36);
    const legacyMultiSenseWords = entries.filter((entry) => Number(entry.id.slice(1)) <= 500 && entry.senses.length > 1).map((entry) => entry.lemma);
    expect(legacyMultiSenseWords.filter((lemma) => !exampleThirdCatalog[lemma])).toEqual([]);
  });
});





