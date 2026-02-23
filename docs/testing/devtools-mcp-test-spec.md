# 観測テスト仕様書（Chrome DevTools MCP）

## 目的

| 項目 | 内容 |
| --- | --- |
| 主目的 | Playwright/Vitest だけでは見えない console / network / performance / source-map stack を証跡化 |
| 実行タイミング | PRレビュー時（必要時）、nightly/週次、失敗時の原因調査 |
| 実行主体 | MCP対応エージェント（Codex 等） |

## 観測シナリオ（表）

| DTM ID | 対応チケット | 対象画面/導線 | 観測項目 | 例（MCP観測） | 受入条件 |
| --- | --- | --- | --- | --- | --- |
| DTM-01 | T-05 | Start→Setting 遷移 | console error/warn | console message 収集 | 致命的エラー 0 |
| DTM-02 | T-06 | CSV取込→一覧反映 | network | request一覧、不要リクエスト確認 | 不要な外部通信なし |
| DTM-03 | T-07 | 抽選開始→履歴更新 | console + network | console収集、失敗request有無 | error 0 / 失敗request 0 |
| DTM-04 | T-08 | 景品ルーレット/結果表示 | long task / frame停滞兆候 | trace取得・タイムライン確認 | フリーズ/操作不能なし |
| DTM-05 | T-09 | リセット→再試合×3 | memory（簡易）+ console | 複数回操作後の観測 | 明確なリーク兆候なし |
| DTM-06 | T-11 | 音声/BGM操作 | console / autoplay例外 | 例外ログ確認 | UI復帰可能、例外で破綻しない |
| DTM-07 | T-13 | 初回表示性能 | trace + network | LCP/TTFB/重いresource特定 | 閾値超過時に改善候補列挙 |
| DTM-08 | T-14 | 配信最適化監視 | network/cache/compression | resource一覧とサイズ確認 | 重いJS/CSS/画像を特定 |
| DTM-09 | T-15 | 失敗再現時 | console + stack + trace | source map付きスタック/trace/スクショ | 再現手順+根拠が揃う |

## 実施テンプレート（表）

| 手順 | 内容 | 証跡として残すもの |
| --- | --- | --- |
| 1 | 対象ページを開く | URL、時刻 |
| 2 | 対象導線を操作 | 操作手順（箇条書き） |
| 3 | console を取得 | error/warn/info 件数と主要メッセージ |
| 4 | network を取得 | 失敗request、重いresource、不要通信 |
| 5 | 必要に応じ trace | LCP/TTFB/long task の要点 |
| 6 | 失敗時は source map stack | エラー箇所、再現条件 |
| 7 | docsへ転記 | `docs/testing/test-results-YYYY-MM-DD.md` |

## 運用ルール

| ルール | 内容 |
| --- | --- |
| PR時 | 変更導線に紐づく DTM を最低1件実施（推奨） |
| nightly | DTM-07/08 を定期観測し劣化差分を記録 |
| 失敗時 | Playwright trace + DevTools MCP 証跡をセットで残す |
