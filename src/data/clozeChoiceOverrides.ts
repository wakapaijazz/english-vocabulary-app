/**
 * Curated distractors for cloze items whose ordinary level-based choices
 * could otherwise create a second grammatically possible answer.
 */
export const clozeChoiceOverrides: Record<string, string[]> = {
  pioneer: ["occur", "belong", "arise"],
  create: ["occur", "belong", "arise"],
  develop: ["occur", "belong", "arise"],
  prepare: ["occur", "belong", "arise"],
};
