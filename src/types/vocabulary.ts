export type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "preposition" | "conjunction" | "pronoun" | "determiner" | "interjection" | "other";
export interface VocabularySense { id: string; partOfSpeech: PartOfSpeech; meaningJa: string; meaningEn?: string; note?: string; priority?: number; }
export interface ExampleSentence { id: string; english: string; japanese: string; senseId?: string; difficulty?: number; sourceType?: "original" | "generated" | "reviewed"; clozeTarget?: string; }
export interface Collocation { id: string; expression: string; meaningJa?: string; target?: string; pattern?: string; exampleEnglish?: string; exampleJapanese?: string; }
export interface Idiom { id: string; expression: string; meaningJa: string; exampleEnglish?: string; exampleJapanese?: string; }
export interface RelatedWord { word: string; meaningJa?: string; relation?: string; }
export interface VocabularyEntry { id: string; lemma: string; pronunciation?: string; level: number; frequency?: number; examPriority?: number; senses: VocabularySense[]; collocations?: Collocation[]; idioms?: Idiom[]; derivatives?: RelatedWord[]; synonyms?: RelatedWord[]; antonyms?: RelatedWord[]; confusables?: RelatedWord[]; examples?: ExampleSentence[]; tags?: string[]; }
export const POS_LABELS: Record<PartOfSpeech, string> = { noun:"名詞", verb:"動詞", adjective:"形容詞", adverb:"副詞", preposition:"前置詞", conjunction:"接続詞", pronoun:"代名詞", determiner:"限定詞", interjection:"間投詞", other:"その他" };
