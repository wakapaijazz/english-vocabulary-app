import { describe, expect, it } from "vitest";
import vocabularyData from "../src/data/vocabulary.json";
import vocabularyExtra from "../src/data/vocabulary-extra.json";
import vocabularyMore from "../src/data/vocabulary-more.json";
import vocabularyFinal from "../src/data/vocabulary-final.json";
import vocabularyExpansion from "../src/data/vocabulary-expansion.json";
import vocabularyExpansion2 from "../src/data/vocabulary-expansion-2.json";
import vocabularyExpansion3 from "../src/data/vocabulary-expansion-3.json";
import { generateQuizQuestions } from "../src/quiz/quizGenerator";
import { inflectLike } from "../src/quiz/inflection";
import type { VocabularyEntry } from "../src/types/vocabulary";

const entries = [...vocabularyData, ...vocabularyExtra, ...vocabularyMore, ...vocabularyFinal, ...vocabularyExpansion, ...vocabularyExpansion2, ...vocabularyExpansion3] as unknown as VocabularyEntry[];

describe("generated cloze inflection coverage", () => {
  it("keeps every generated choice in the selected example's grammatical form", () => {
    const questions = generateQuizQuestions(entries, { type: "cloze", count: entries.length });
    expect(questions).toHaveLength(entries.length);
    for (const question of questions) {
      const answerForm = question.details.answerForm;
      expect(answerForm, question.details.word).toBeTruthy();
      expect(question.prompt.match(/_____/g) ?? [], question.details.word).toHaveLength(1);
      for (const choice of question.choices) {
        expect(choice.baseText, question.details.word).toBeTruthy();
        expect(choice.inflectedText, question.details.word).toBe(inflectLike(choice.baseText!, question.details.word, answerForm!));
      }
      const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId);
      expect(correctChoice?.inflectedText?.toLowerCase(), question.details.word).toBe(answerForm!.toLowerCase());
    }
  });
});
