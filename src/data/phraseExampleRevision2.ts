import type { PhraseExample } from "./phraseExampleCatalog";

/** Final editorial corrections for a few expansion examples. */
export const phraseExampleRevision2: Record<string, PhraseExample[]> = {
  p104: [{ english: "The researchers finally broke through the technical barrier.", japanese: "研究者たちはついにその技術的な障壁を突破した。", prompt: "The researchers finally broke _____ the technical barrier." }],
  p121: [{ english: "The recipe goes back to a monastery in the seventeenth century.", japanese: "そのレシピは17世紀の修道院にまでさかのぼる。", prompt: "The recipe goes _____ a monastery in the seventeenth century." }],
  p140: [{ english: "The missing key finally showed up inside an old coat.", japanese: "なくなった鍵はついに古いコートの中から見つかった。", prompt: "The missing key finally showed _____ inside an old coat." }],
};

