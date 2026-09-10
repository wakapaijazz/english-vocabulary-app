/**
 * 既存の語句問題に追加例文を登録するためのカタログです。
 *
 * 例文は phraseCatalog の1問に対して複数登録できます。prompt を指定すると、
 * その例文を問題文として使えます。未指定の場合は元の問題文を使います。
 */
export interface PhraseExample {
  english: string;
  japanese: string;
  prompt?: string;
}

export const phraseExampleCatalog: Record<string, PhraseExample[]> = {};
