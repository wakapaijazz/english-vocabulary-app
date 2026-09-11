import { phraseCatalog } from "./phraseCatalog";
import { phraseCatalogExpansion } from "./phraseCatalogExpansion";
import { phraseCatalogExpansion2 } from "./phraseCatalogExpansion2";
import { phraseChoiceOverrides } from "./phraseChoiceOverrides";

export const allPhraseCatalog = [...phraseCatalog, ...phraseCatalogExpansion, ...phraseCatalogExpansion2].map((seed) => ({
  ...seed,
  choices: phraseChoiceOverrides[seed.id] ?? seed.choices,
}));
