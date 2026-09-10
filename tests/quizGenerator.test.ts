import { describe, expect, it } from "vitest";
import data from "../src/data/vocabulary.json";
import { generateQuizQuestions, validateQuizQuestion } from "../src/quiz/quizGenerator";
import type { VocabularyEntry } from "../src/types/vocabulary";
const entries=data as VocabularyEntry[];
describe("quizGenerator",()=>{it("generates four unique choices with one correct answer",()=>{for(const type of ["en-to-ja","ja-to-en","cloze"] as const){const questions=generateQuizQuestions(entries,{type,count:8});expect(questions).toHaveLength(8);questions.forEach(question=>expect(validateQuizQuestion(question)).toBe(true));}});it("supports mixed quizzes and new-word filtering",()=>{const questions=generateQuizQuestions(entries,{type:"mixed",count:10,mode:"new",history:{}});expect(questions).toHaveLength(10);expect(new Set(questions.map(question=>question.type)).size).toBeGreaterThan(1);});});
