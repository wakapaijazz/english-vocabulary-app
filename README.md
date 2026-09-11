# Wordly — English Vocabulary App

仕様書 v0.1 に基づく、React + TypeScript + Vite製の英単語学習アプリMVPです。

## 起動

PowerShellでは、実行ポリシーによる問題を避けるため `npm.cmd` を使えます。

```powershell
npm.cmd install
npm.cmd run dev
```

本番ビルドは `npm.cmd run build`、ユニットテストは `npm.cmd run test` で実行できます。

## 主な機能

- 1000語の静的語彙マスターデータ（Level 1〜8）
- 辞書のA→Z / Z→A並び替え、レベル別・品詞別フィルター、検索
- 単語カード（多義語・品詞・発音記号・例文・コロケーション・関連語）
- 英語→日本語、日本語→英語、英語→英語、Cloze、Mixedクイズ
- 200語句のコロケーション・イディオム空欄補充クイズ（look at / take part in / contribute to など）
- 活用形を含む空所補充では、4選択肢を同じ語形にそろえ、回答後に必要な選択肢だけ原形を表示
- 正誤履歴と復習予定のlocalStorage保存
- 苦手語の自動抽出、今日の復習、統計
- スマートフォン対応のレスポンシブUI

語彙マスターは `src/data/vocabulary.json`、`src/data/vocabulary-extra.json`、`src/data/vocabulary-more.json`、`src/data/vocabulary-final.json`、`src/data/vocabulary-expansion.json`、`src/data/vocabulary-expansion-2.json`、`src/data/vocabulary-expansion-3.json` に分けて管理しています。語句問題は4つのフレーズカタログを統合して200問を管理しています。コンテンツ追加・修正ルールは `CONTENT_RULES.md` に定義しています。
