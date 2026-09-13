import { definitionCatalog } from "./definitionCatalog";
import type { VocabularyEntry } from "../types/vocabulary";

export const FALLBACK_DEFINITION = "to have a particular meaning or use";

/** Resolve the English definition shown consistently in quizzes and the dictionary. */
export function getWordDefinition(entry: VocabularyEntry): string {
  return entry.senses[0]?.meaningEn?.trim()
    || definitionCatalog[entry.lemma]
    || FALLBACK_DEFINITION;
}
