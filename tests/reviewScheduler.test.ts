import { describe, expect, it } from "vitest";
import { getNextReviewAt, getReviewIntervalDays } from "../src/review/reviewScheduler";
import type { VocabularyLearningState } from "../src/types/learning";
const state:VocabularyLearningState={vocabularyId:"x",seenCount:2,correctCount:1,wrongCount:1,streak:0,mastery:2,skills:{recognition:2,production:2,context:2,collocation:2,wordFormation:2}};
describe("reviewScheduler",()=>{it("schedules wrong answers for the next day",()=>expect(getReviewIntervalDays(state,false)).toBe(1));it("extends intervals for repeated success",()=>expect(getReviewIntervalDays({...state,streak:3},true)).toBe(14));it("returns a future ISO timestamp",()=>expect(new Date(getNextReviewAt(state,false)).getTime()).toBeGreaterThan(Date.now()));});
