import { phraseExampleCatalog, type PhraseExample } from "./phraseExampleCatalog";
import { phraseExampleExpansion } from "./phraseExampleExpansion";
import { phraseExampleRevision } from "./phraseExampleRevision";
import type { PhraseQuestionSeed } from "./phraseCatalog";

const supplementalExamples = { ...phraseExampleCatalog, ...phraseExampleExpansion, ...phraseExampleRevision };

/** Returns the base example and the reviewed additional example for a phrase. */
export function getPhraseExamples(seed: PhraseQuestionSeed): PhraseExample[] {
  return [
    { english: seed.exampleEnglish, japanese: seed.exampleJapanese },
    ...(supplementalExamples[seed.id] ?? []),
  ].filter((example) => example.english.trim() && example.japanese.trim());
}
