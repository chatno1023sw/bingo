# Data Model: Bingo抽選アプリ仕様整備

## Overview

- すべての状態はローカルブラウザで完結し、localStorage キー `bingo.v1.*` と CSV ファイルで永続化する。
- Start/Game/Setting 画面は同じ `GameState`・`Prize` コレクションを共有し、UI はこれらのビューを参照する。
- データ構造は spec seed 5.2/5.3 と本 feature spec の Functional Requirements をもとに確定した。

## Entities

### GameState
| フィールド | 型 | 説明 | 制約 / バリデーション |
| --- | --- | --- | --- |
| `currentNumber` | `number \| null` | 現在の当選番号（抽選確定後に設定） | `null` 許容、範囲 1〜75、抽選済みリストと整合必須 |
| `drawHistory` | `DrawHistoryEntry[]` | これまでの当選番号一覧 | 重複禁止、最大 75 件、直近 10 件をサブビューに利用 |
| `isDrawing` | `boolean` | ルーレット演出中か | true の間は追加の draw 操作を拒否 |
| `createdAt` | `string (ISO8601)` | ゲーム開始時刻 | Start「はじめから」で更新 |
| `updatedAt` | `string (ISO8601)` | 最終更新時刻 | 抽選・景品操作ごとに更新 |

**関係**: `GameState.drawHistory[*].number` は `Prize` とは直接結合しないが、進行画面で prize 状態と組み合わせて表示。

**状態遷移**:
1. `Start` → 「はじめから」: `currentNumber=null`, `drawHistory=[]`, `isDrawing=false`。
2. 「抽選開始」: `isDrawing=true`。演出停止後 `isDrawing=false`, `currentNumber=newNumber`, `drawHistory` に push。
3. 「続きから」: localStorage から読み込んだ `GameState` をそのまま適用。

### DrawHistoryEntry
| フィールド | 型 | 説明 | 制約 |
| --- | --- | --- | --- |
| `number` | `number` | 当選番号 | 1〜75、`GameState.drawHistory` 内でユニーク |
| `sequence` | `number` | 抽選順（1 origin） | 自動採番。履歴ソートに利用 |
| `drawnAt` | `string (ISO8601)` | 抽選日時 | 中央表示のサブ情報・履歴モーダルで利用 |

**ビュー**: 直近表示は `drawHistory.slice(-10).reverse()`、モーダルは全件。

### Prize
| フィールド | 型 | 説明 | 制約 |
| --- | --- | --- | --- |
| `id` | `string` | 景品 ID | CSV でユニーク、UUID か連番文字列 |
| `order` | `number` | 表示順 | DnD 後に 0..n-1 へ再採番 |
| `prizeName` | `string` | 賞名 | 空文字禁止 |
| `itemName` | `string` | 商品名 | 空文字禁止 |
| `imagePath` | `string \| null` | 画像パス（任意） | 指定時は `public/` 配下相対パス |
| `selected` | `boolean` | 当選済みか | Game 右ペインで切り替え |
| `memo` | `string \| null` | 備考 | 200 文字以内（UI 都合） |

**関係**: Game 画面右ペインは `Prize[]` を order 昇順で描画。Setting 画面は CRUD + import/export を提供。

### BGMPreference
| フィールド | 型 | 説明 | 制約 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | BGM がオンか | Start 右上トグルを直反映 |
| `volume` | `number` | 0〜1 の小数 | デフォルト 0.6、スライダー UI があれば更新 |
| `updatedAt` | `string (ISO8601)` | 変更日時 | Start 描画時に読み込み |

**保存**: localStorage `bingo.v1.bgm` に JSON で保存。復元時に無い場合はデフォルトを設定。

### CSVImportJob
| フィールド | 型 | 説明 | 制約 |
| --- | --- | --- | --- |
| `sourceName` | `string` | アップロードファイル名 | UI で完了通知に表示 |
| `addedCount` | `number` | 追加された景品数 | 0 以上 |
| `skipped` | `{ id: string; reason: string; }[]` | 重複・不正により追加されなかった項目 | reason は i18n 対応のキー or 日本語文 |
| `processedAt` | `string (ISO8601)` | 実行日時 | ログ表示に使用 |

**関係**: Setting 画面で import 実行時に生成され、toaster/モーダルで結果を提示する。

### Derived Views / Helpers
- **RecentHistory**: `DrawHistoryEntry[]` の派生（最新 10 件）。UI で常に降順表示。
- **PrizeSummary**: `Prize` を `selected` でグループ化し、未選出/当選済みカウントを Start 画面や Setting のヘッダーに表示。
- **RouletteWheelData**: 未抽選番号 + カラー情報の配列。`GameState` から算出され `react-custom-roulette` に渡す。

## Persistence & Keys
- `localStorage` キー: `bingo.v1.gameState`, `bingo.v1.prizes`, `bingo.v1.bgm`。将来 breaking change があれば `v2` へ移行し、初回アクセス時にマイグレーションを実行。
- CSV ファイル: `data/prizes.csv`（リポジトリにはダミーのみ）。カラム: `id,order,prizeName,itemName,imagePath,selected,memo`。UTF-8 BOM なし、改行 LF。

## Validation Rules
- 抽選: `GameState.drawHistory` が 75 件に達した場合、抽選ボタンを無効化しエラー表示。
- CSV import: すべての必須列が揃っていない場合はジョブを拒否し `skipped` に理由を書く。
- localStorage 整合性: 読み込み時に JSON パース失敗・キー欠落があれば初期値をセットし、Start 画面で「保存を初期化しました」を表示。

## State Transitions Summary
1. **Start → Game (new)**: `GameState` 再初期化、`Prize.selected=false`、BGM 設定を維持。
2. **Start → Game (resume)**: localStorage 全体を読み込み、存在しなければ新規開始案内。
3. **Game draw**: `isDrawing=true` → ルーレット停止 → `currentNumber` 更新 → `DrawHistoryEntry` 追加 → localStorage 保存。
4. **Game prize toggle**: `Prize.selected` 更新 → localStorage 保存 → 履歴表示に取消線を反映。
5. **Setting reorder/import/delete**: `Prize[]` 更新 → CSV へエクスポート可 → Game 画面へ即時反映。
6. **BGM toggle**: `BGMPreference.enabled` 変更 → localStorage 保存 → Start, Game で再利用。
