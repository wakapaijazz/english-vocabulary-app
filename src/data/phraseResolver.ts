import { phraseExampleCatalog, type PhraseExample } from "./phraseExampleCatalog";
import { phraseExampleExpansion } from "./phraseExampleExpansion";
import { phraseExampleRevision } from "./phraseExampleRevision";
import { phraseExampleRevision2 } from "./phraseExampleRevision2";
import { phraseExampleExpansion2 } from "./phraseExampleExpansion2";
import { phraseExampleExpansion3 } from "./phraseExampleExpansion3";
import type { PhraseQuestionSeed } from "./phraseCatalog";

const supplementalExamples = { ...phraseExampleCatalog, ...phraseExampleExpansion, ...phraseExampleExpansion2, ...phraseExampleExpansion3, ...phraseExampleRevision, ...phraseExampleRevision2 };

/** Returns the base example and the reviewed additional example for a phrase. */
export function getPhraseExamples(seed: PhraseQuestionSeed): PhraseExample[] {
  return [
    { english: seed.exampleEnglish, japanese: seed.exampleJapanese },
    ...(supplementalExamples[seed.id] ?? []),
  ].filter((example) => example.english.trim() && example.japanese.trim());
}





