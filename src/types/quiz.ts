import type { SkillKey } from "../types/learning";

export type QuizType = "mixed" | "en-to-ja" | "ja-to-en" | "en-to-en" | "cloze" | "collocation";

export interface QuizChoice {
  id: string;
  text: string;
  meaningJa?: string;
}

export interface QuizExplanation {
  word: string;
  meaningJa: string;
  definitionEn: string;
  exampleEnglish: string;
  exampleJapanese: string;
}

export interface QuizQuestion {
  id: string;
  vocabularyId: string;
  senseId?: string;
  type: Exclude<QuizType, "mixed">;
  skill: SkillKey;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
  details: QuizExplanation;
}
