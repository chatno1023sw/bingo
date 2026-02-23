# 単体テスト仕様書（Vitest）

## 実行対象

| 項目 | 内容 |
| --- | --- |
| テストランナー | Vitest (`jsdom`) |
| 実行コマンド | `npm run test:unit` |
| 対象ディレクトリ | `app/**/*.test.{ts,tsx}` |
| 主な目的 | 純関数・永続化・ルートUI（モックベース）の回帰防止 |

## 仕様一覧（表）

| ID | 対応チケット | テスト対象 | 観点（境界） | 受入条件 |
| --- | --- | --- | --- | --- |
| UT-01 | T-01 | `bingoEngine.getAvailableNumbers` | 範囲内（1〜75）、抽選済み除外、昇順維持 | 重複番号が返らず、長さが期待通り |
| UT-02 | T-01 | `bingoEngine.drawNextNumber` | seed再現、`Math.random` 分岐、全件抽選済み例外 | 同seedで決定的、空き無しで例外 |
| UT-03 | T-04 | `csvParser.parsePrizesCsv` | 正常CSV、必須欠落、重複ID、数値bool | 不正行は `skipped` に集約し処理継続 |
| UT-04 | T-04 | `csvParser.generatePrizesCsv` | ヘッダ、クォート、カンマ含み文字列 | 再インポート可能なCSV文字列を生成 |
| UT-05 | T-10 | `storage` utilities | read/write/remove/壊れたJSON/clear prefix | 壊れたJSONでも例外化せず fallback |
| UT-06 | T-03/T-10 | `sessionService` | start/resume/persist、景品選択維持/初期化 | 不正遷移や意図しない上書きを防止 |
| UT-07 | T-05 | Start route flow | Start/Resume クリックの分岐 | セッションAPI呼び出しと画面遷移が発火 |
| UT-08 | T-05/T-07 | Game route flow | 初期描画/抽選実行のUI反映 | 残数表示更新、抽選処理が発火 |
| UT-09 | T-06 | Setting route flow | 保存済み景品一覧の描画 | 景品カードが初期表示される |

## 現時点の未カバー（次回候補）

| ID | 対応チケット | 不足点 | 追加候補 |
| --- | --- | --- | --- |
| GAP-01 | T-02 | ビンゴ判定ロジック自体が未見当 | 純関数化して `app/common/utils` に追加 |
| GAP-02 | T-09 | 再試合3回継続の長時間状態検証 | `useGameSession` の統合テスト拡張 |
| GAP-03 | T-11 | 音声/BGM 実ブラウザ挙動 | Playwright + DevTools MCP nightly 観測 |
| GAP-04 | T-12 | キーボード操作スモーク | Playwright の `keyboard` シナリオ追加 |
