/**
 * Curated distractors for cloze items whose ordinary level-based choices
 * could otherwise create a second grammatically possible answer.
 */
export const clozeChoiceOverrides: Record<string, string[]> = {
  absorb: ["assign", "inspect", "publish"],
  visible: ["academic", "abrupt", "caustic"],
  attain: ["occur", "belong", "arise"],
  claim: ["inspect", "occur", "belong"],
  pioneer: ["occur", "belong", "arise"],
  create: ["occur", "belong", "arise"],
  substantial: ["abstract", "abrupt", "caustic"],
  decrease: ["maintain", "occur", "publish"],
  develop: ["occur", "belong", "arise"],
  prepare: ["occur", "belong", "arise"],
  caustic: ["abstract", "abrupt", "absurd"],
  quantity: ["attitude", "evidence", "domain"],
  refrain: ["abide", "occur", "publish"],
  grant: ["occur", "belong", "inspect"],
};
