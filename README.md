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

- 500語の静的語彙マスターデータ（Level 3〜5中心）
- 辞書のA→Z / Z→A並び替え、レベル別・品詞別フィルター、検索
- 単語カード（多義語・品詞・発音記号・例文・コロケーション・関連語）
- 英語→日本語、日本語→英語、英語→英語、Cloze、Mixedクイズ
- コロケーション・イディオムの空欄補充クイズ（look at / take part in / contribute to など）
- 正誤履歴と復習予定のlocalStorage保存
- 苦手語の自動抽出、今日の復習、統計
- スマートフォン対応のレスポンシブUI

語彙マスターは `src/data/vocabulary.json`、`src/data/vocabulary-extra.json`、`src/data/vocabulary-more.json`、`src/data/vocabulary-final.json` に分けて管理しています。語句問題は `src/data/phraseCatalog.ts` に定義しています。
