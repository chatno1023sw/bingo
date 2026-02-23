# テスト戦略マトリクス（再構築版）

| チケットID | 対象/目的 | 主担当 | 実装/観測の配置 | CI頻度 | 現在ステータス |
| --- | --- | --- | --- | --- | --- |
| T-01 | 抽選（乱数/重複なし/範囲） | Vitest | `app/common/utils/__tests__/bingoEngine.test.ts` | PR必須 | 実装済 |
| T-02 | ビンゴ判定（縦横斜め/フリー） | Vitest | 対象ロジック未実装（追加時に `app/common/utils/__tests__`） | PR必須 | 未着手（ロジック待ち） |
| T-03 | ゲーム状態（reducer/状態遷移） | Vitest | `app/common/services/__tests__/sessionService.test.ts` + `app/routes/__tests__/game-route.test.tsx` | PR必須 | 一部実装済 |
| T-04 | CSVパース/バリデーション | Vitest | `app/common/utils/__tests__/csvParser.test.ts` | PR必須 | 実装済 |
| T-05 | ルートloader/actionの入出力 | Vitest + Playwright | `app/routes/__tests__/*` / `tests/e2e/start-and-setting.spec.ts` | PR推奨 | 一部実装済 |
| T-06 | 管理画面：CSV取込→参加者反映 | Vitest + Playwright + DevTools | `csvParser` 単体 + `tests/e2e/setting-csv-import.spec.ts` + DevTools観測 | PR必須 | 構成追加済（E2E未実行） |
| T-07 | 抽選導線（実ユーザー操作） | Playwright + DevTools | `tests/e2e/game-draw-smoke.spec.ts` + DevTools console観測 | PR必須（スモーク） | 構成追加済（未実行） |
| T-08 | 当選/勝者表示（演出含む） | Vitest + Playwright + DevTools | ルーレット/結果ダイアログ周辺（今後追加） | nightly推奨 | 未着手 |
| T-09 | リセット/再試合 | Vitest + Playwright + DevTools | `useGameSession`/Game導線（今後追加） | nightly推奨 | 未着手 |
| T-10 | 永続化（localStorage等） | Vitest | `app/common/utils/__tests__/storage.test.ts`, `sessionService.test.ts` | PR推奨 | 実装済（主要部） |
| T-11 | 音声/BGM | Vitest + Playwright + DevTools | 現在はモック中心、実ブラウザ観測は nightly 追加 | nightly推奨 | 未着手（実ブラウザ） |
| T-12 | a11y/操作性（最低限） | Playwright | キーボード導線 spec（今後追加） | PR推奨 | 未着手 |
| T-13 | 性能：初回表示の劣化検知 | DevTools MCP | トレース/LCP/TTFB 観測手順を文書化 | nightly/週次 | 構成追加済（手順書） |
| T-14 | ネットワーク：配信最適化監視 | DevTools MCP | request 一覧/サイズ/キャッシュ確認手順 | 週次 | 構成追加済（手順書） |
| T-15 | デバッグ回収：失敗時の証拠集め | Playwright + DevTools MCP | trace/screenshot + console/network stack 収集手順 | 失敗時自動 | 構成追加済（手順書） |
| T-16 | UI見た目回帰（任意） | Playwright | VRT 導入余地（未設定） | nightly | 未着手 |
| T-17 | コンポーネント実ブラウザ確認（任意） | Vitest Browser Mode | `vitest --browser` 導入余地（未設定） | PR推奨 | 未着手 |
| T-18 | ログイン/権限境界（任意） | Vitest + Playwright + DevTools | 認証機能追加時に適用 | PR必須 | 対象外（現状認証なし） |

## 運用方針

| レイヤー | 目的 | 判定基準 |
| --- | --- | --- |
| Vitest | 純関数/永続化/ルートUIの回帰を高速検知 | PR必須・最短で失敗原因を特定 |
| Playwright | 実ユーザー導線の破綻検知 | 主要導線のスモークを PR で実行 |
| Chrome DevTools MCP | console/network/perf/debug の証跡収集 | 失敗解析・劣化監視・週次観測 |
