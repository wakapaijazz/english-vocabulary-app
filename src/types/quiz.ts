import type { SkillKey } from "../types/learning";

export type QuizType = "mixed" | "en-to-ja" | "ja-to-en" | "en-to-en" | "cloze" | "collocation";

export interface QuizChoice {
  id: string;
  text: string;
  meaningJa?: string;
  /** The dictionary headword used to create a cloze choice. */
  baseText?: string;
  /** The surface form shown before the article is added, if this is a cloze choice. */
  inflectedText?: string;
}

export interface QuizExample {
  english: string;
  japanese: string;
}

export interface QuizExplanation {
  word: string;
  /** The exact surface form removed from the selected cloze example. */
  answerForm?: string;
  meaningJa: string;
  definitionEn: string;
  exampleEnglish: string;
  exampleJapanese: string;
  examples: QuizExample[];
}

export interface QuizQuestion {
  id: string;
  vocabularyId: string;
  favoriteId?: string;
  senseId?: string;
  type: Exclude<QuizType, "mixed">;
  skill: SkillKey;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
  details: QuizExplanation;
}
