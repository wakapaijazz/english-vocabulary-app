import type { QuizResult, SkillKey, VocabularyLearningState, VocabularySkillState } from "../types/learning";
import { getNextReviewAt } from "./reviewScheduler";

export function calculateMastery(skills: VocabularySkillState) {
  const values = Object.values(skills);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function isWeak(state: VocabularyLearningState) {
  if (state.seenCount === 0) return false;
  return state.wrongCount >= 2 || state.correctCount / state.seenCount < 0.7 || state.mastery <= 2;
}

export function skillForQuizType(type: string): SkillKey {
  if (type === "ja-to-en") return "production";
  if (type === "cloze") return "context";
  if (type === "collocation") return "collocation";
  if (type === "word-formation") return "wordFormation";
  return "recognition";
}

export function recordQuizResult(state: VocabularyLearningState, result: QuizResult, now = new Date()): VocabularyLearningState {
  const skill = skillForQuizType(result.quizType);
  const nextSkills = { ...state.skills, [skill]: Math.max(0, Math.min(5, state.skills[skill] + (result.isCorrect ? 1 : -1))) };
  const nextStreak = result.isCorrect ? state.streak + 1 : 0;
  const nextMastery = calculateMastery(nextSkills);
  const reviewBase = { ...state, mastery: nextMastery, streak: nextStreak };
  return {
    ...state,
    seenCount: state.seenCount + 1,
    correctCount: state.correctCount + (result.isCorrect ? 1 : 0),
    wrongCount: state.wrongCount + (result.isCorrect ? 0 : 1),
    streak: nextStreak,
    mastery: nextMastery,
    skills: nextSkills,
    firstSeenAt: state.firstSeenAt ?? result.answeredAt,
    lastSeenAt: result.answeredAt,
    lastCorrectAt: result.isCorrect ? result.answeredAt : state.lastCorrectAt,
    nextReviewAt: getNextReviewAt(reviewBase, result.isCorrect, now),
  };
}
