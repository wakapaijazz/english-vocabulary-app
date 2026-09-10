import type { AppSettings, LearningHistory, VocabularyLearningState } from "../types/learning";
import { DEFAULT_SETTINGS, DEFAULT_SKILLS } from "../types/learning";
export const STORAGE_KEYS = { history:"vocab-app-learning-history", settings:"vocab-app-settings", favorites:"vocab-app-favorites" } as const;
function canUseStorage(){ return typeof window !== "undefined" && typeof window.localStorage !== "undefined"; }
export function createEmptyLearningState(vocabularyId:string):VocabularyLearningState { return { vocabularyId, seenCount:0, correctCount:0, wrongCount:0, streak:0, mastery:0, skills:{...DEFAULT_SKILLS} }; }
export function loadLearningHistory():LearningHistory { if(!canUseStorage()) return {}; try { const raw=window.localStorage.getItem(STORAGE_KEYS.history); return raw ? JSON.parse(raw) as LearningHistory : {}; } catch { return {}; } }
export function saveLearningHistory(history:LearningHistory){ if(canUseStorage()) window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history)); }
export function loadSettings():AppSettings { if(!canUseStorage()) return {...DEFAULT_SETTINGS}; try { const raw=window.localStorage.getItem(STORAGE_KEYS.settings); return raw ? {...DEFAULT_SETTINGS,...JSON.parse(raw) as Partial<AppSettings>} : {...DEFAULT_SETTINGS}; } catch { return {...DEFAULT_SETTINGS}; } }
export function saveSettings(settings:AppSettings){ if(canUseStorage()) window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)); }
export function getStoredFavorites():string[]{ if(!canUseStorage()) return []; try { const raw=window.localStorage.getItem(STORAGE_KEYS.favorites); return raw ? JSON.parse(raw) as string[] : []; } catch { return []; } }
export function updateFavorites(ids:string[]){ if(canUseStorage()) window.localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids)); }
