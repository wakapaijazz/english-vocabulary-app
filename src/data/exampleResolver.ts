import { exampleCatalog } from "./exampleCatalog";
import { exampleRevisionCatalog } from "./exampleRevisionCatalog";
import { exampleRevisionExtra } from "./exampleRevisionExtra";
import { exampleSupplementCatalog } from "./exampleSupplementCatalog";
import { exampleThirdCatalog } from "./exampleThirdCatalog";
import type { ExampleSentence, VocabularyEntry } from "../types/vocabulary";

const revisions = { ...exampleRevisionCatalog, ...exampleRevisionExtra };

/** Returns the complete, reviewed set of examples shown by the dictionary and quiz. */
export function getWordExamples(entry: VocabularyEntry): ExampleSentence[] {
  const revision = revisions[entry.lemma];
  const catalog = exampleCatalog[entry.lemma];
  const directExamples = entry.examples?.length
    ? entry.examples.map((example, index) => index === 0 && revision ? revision : example)
    : revision
      ? [revision]
      : catalog
        ? [{ id: `catalog-${entry.id}`, english: catalog.english, japanese: catalog.japanese }]
        : [];
  const supplement = exampleSupplementCatalog[entry.lemma];
  const third = exampleThirdCatalog[entry.lemma];

  return [...directExamples, ...(supplement ? [supplement] : []), ...(third ? [third] : [])]
    .filter((example) => example.english.trim() && example.japanese.trim());
}
