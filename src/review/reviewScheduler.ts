import type { VocabularyLearningState } from "../types/learning";
export function getReviewIntervalDays(state:VocabularyLearningState,isCorrect:boolean){ if(!isCorrect) return 1; if(state.mastery>=5) return 30; if(state.streak>=3) return 14; if(state.streak>=1) return 7; return 3; }
export function getNextReviewAt(state:VocabularyLearningState,isCorrect:boolean,now=new Date()){ const next=new Date(now); next.setDate(next.getDate()+getReviewIntervalDays(state,isCorrect)); return next.toISOString(); }
export function isDue(state:VocabularyLearningState,now=new Date()){ return Boolean(state.nextReviewAt && new Date(state.nextReviewAt).getTime()<=now.getTime()); }
