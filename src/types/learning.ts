import type { QuizType } from "./quiz";
export type SkillKey = "recognition" | "production" | "context" | "collocation" | "wordFormation";
export interface VocabularySkillState { recognition:number; production:number; context:number; collocation:number; wordFormation:number; }
export interface VocabularyLearningState { vocabularyId:string; seenCount:number; correctCount:number; wrongCount:number; streak:number; mastery:number; firstSeenAt?:string; lastSeenAt?:string; lastCorrectAt?:string; nextReviewAt?:string; skills:VocabularySkillState; }
export type LearningHistory = Record<string, VocabularyLearningState>;
export interface QuizResult { questionId:string; vocabularyId:string; quizType:QuizType; isCorrect:boolean; answeredAt:string; selectedChoiceId?:string; responseTimeMs?:number; }
export interface AppSettings { questionsPerSet:number; showJapanese:boolean; }
export const DEFAULT_SKILLS:VocabularySkillState = { recognition:0, production:0, context:0, collocation:0, wordFormation:0 };
export const DEFAULT_SETTINGS:AppSettings = { questionsPerSet:10, showJapanese:true };
