import { describe, expect, it } from "vitest";
import { calculateMastery, isWeak } from "../src/review/masteryCalculator";
import type { VocabularyLearningState } from "../src/types/learning";
describe("masteryCalculator",()=>{it("calculates average skill mastery",()=>expect(calculateMastery({recognition:5,production:4,context:3,collocation:2,wordFormation:1})).toBe(3));it("marks low accuracy words as weak",()=>{const state:VocabularyLearningState={vocabularyId:"x",seenCount:4,correctCount:1,wrongCount:3,streak:0,mastery:1,skills:{recognition:1,production:1,context:1,collocation:1,wordFormation:1}};expect(isWeak(state)).toBe(true);});});
