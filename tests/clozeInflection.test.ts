import { describe, expect, it } from "vitest";
import { getInflectionCandidates, getInflectionKind, inflectLike, inflectPast, inflectProgressive, inflectThirdPerson } from "../src/quiz/inflection";

describe("cloze inflection", () => {
  it("converts every choice to the target's grammatical form", () => {
    expect(inflectLike("absorb", "absorb", "absorbed")).toBe("absorbed");
    expect(inflectLike("assign", "absorb", "absorbed")).toBe("assigned");
    expect(inflectLike("provide", "provide", "provides")).toBe("provides");
    expect(inflectLike("study", "study", "studying")).toBe("studying");
  });

  it("handles regular spelling changes and irregular verbs", () => {
    expect(inflectPast("occur")).toBe("occurred");
    expect(inflectPast("arise")).toBe("arose");
    expect(inflectPast("withdraw")).toBe("withdrew");
    expect(inflectThirdPerson("vary")).toBe("varies");
    expect(inflectProgressive("modify")).toBe("modifying");
    expect(inflectProgressive("run")).toBe("running");
  });

  it("recognizes every generated surface form", () => {
    for (const lemma of ["absorb", "occur", "vary", "modify", "arise"]) {
      const candidates = getInflectionCandidates(lemma);
      for (const candidate of candidates) expect(getInflectionKind(lemma, candidate)).toBeDefined();
    }
  });
});
