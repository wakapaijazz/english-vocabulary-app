import { phraseCatalog } from "./phraseCatalog";
import { phraseCatalogExpansion } from "./phraseCatalogExpansion";
import { phraseCatalogExpansion2 } from "./phraseCatalogExpansion2";
import { phraseCatalogExpansion3 } from "./phraseCatalogExpansion3";
import { phraseCatalogExpansion4 } from "./phraseCatalogExpansion4";
import { phraseCatalogExpansion5 } from "./phraseCatalogExpansion5";
import { phraseChoiceOverrides } from "./phraseChoiceOverrides";

export const allPhraseCatalog = [...phraseCatalog, ...phraseCatalogExpansion, ...phraseCatalogExpansion2, ...phraseCatalogExpansion3, ...phraseCatalogExpansion4, ...phraseCatalogExpansion5].map((seed) => ({
  ...seed,
  choices: phraseChoiceOverrides[seed.id] ?? seed.choices,
}));
