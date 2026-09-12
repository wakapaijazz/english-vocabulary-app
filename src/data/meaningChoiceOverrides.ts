/**
 * Reviewed Japanese-meaning choices. These are required when the ordinary
 * level-based candidates share a Japanese sense with the answer.
 */
export const meaningChoiceOverrides: Record<string, string[]> = {
  attain: ["inspect", "publish", "retain"],
  visible: ["academic", "abrupt", "caustic"],
  claim: ["inspect", "occur", "belong"],
  substantial: ["abstract", "abrupt", "caustic"],
  decrease: ["maintain", "occur", "publish"],
  caustic: ["abstract", "abrupt", "absurd"],
  grant: ["occur", "belong", "inspect"],
  refrain: ["abide", "occur", "publish"],
};
