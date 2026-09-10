import { exampleSupplementA } from "./exampleSupplementA";
import { exampleSupplementB } from "./exampleSupplementB";
import { exampleSupplementC } from "./exampleSupplementC";
import { exampleSupplementD } from "./exampleSupplementD";
import { exampleSupplementE } from "./exampleSupplementE";

export const exampleSupplementCatalog = {
  ...exampleSupplementA,
  ...exampleSupplementB,
  ...exampleSupplementC,
  ...exampleSupplementD,
  ...exampleSupplementE,
};
