import { phraseCatalog } from "./phraseCatalog";
import { phraseCatalogExpansion } from "./phraseCatalogExpansion";
import { phraseCatalogExpansion2 } from "./phraseCatalogExpansion2";
import { phraseCatalogExpansion3 } from "./phraseCatalogExpansion3";
import { phraseChoiceOverrides } from "./phraseChoiceOverrides";

export const allPhraseCatalog = [...phraseCatalog, ...phraseCatalogExpansion, ...phraseCatalogExpansion2, ...phraseCatalogExpansion3].map((seed) => ({
  ...seed,
  choices: phraseChoiceOverrides[seed.id] ?? seed.choices,
}));
