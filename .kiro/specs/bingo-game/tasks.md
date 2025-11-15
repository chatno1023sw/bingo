# 実装タスクリスト（TDD方式 + ブランチ戦略）

## 概要

このタスクリストは、新年会用Bingo抽選アプリケーションをテスト駆動開発（TDD）で実装するためのものです。各ドメインごとに専用ブランチを作成し、細分化されたタスクごとにコミットします。

## TDD実装方針

- **テストファースト**: 各機能の実装前に必ずテストを作成
- **Chrome DevTools MCPでテスト**: ユニットテストの代わりにChrome DevTools MCPを使用してブラウザ上で実際の動作をテスト
- **Context7でライブラリ情報取得**: ライブラリインストール時はContext7 MCPで最新のドキュメントとAPIを確認
- **ブランチ戦略**: 各ドメインで専用ブランチを作成（例: `feature/domain-01-setup`）
- **タスクごとにコミット**: 細分化されたタスク完了時に即座にコミット
- **ドメイン完了時にマージ**: ドメイン全体が完了したらmainブランチへマージ
- **最小限のテスト**: コア機能に焦点を当てた必要最小限のテスト

## Git ワークフロー

各ドメインで以下の流れを実行:
1. `git checkout -b feature/domain-XX-name` でブランチ作成
2. 各タスク完了時に `git commit -m "message"` でコミット
3. ドメイン完了時に `git checkout main && git merge feature/domain-XX-name` でマージ

## タスク

### ドメイン1: プロジェクトセットアップ
**ブランチ**: `feature/domain-01-setup`

- [ ] 1.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-01-setup`

- [ ] 1.2 依存パッケージのインストール
  - Context7 MCPで各ライブラリの最新情報を取得
  - React Router v7の最新ドキュメントを確認
  - react-custom-rouletteの使用方法を確認
  - @mui/icons-materialのアイコン一覧を確認
  - @dnd-kit/coreのAPI仕様を確認
  - 確認後、必要なパッケージをインストール
  - 要件: 技術スタック全般
  - コマンド: `npm install` または `pnpm install`
  - コミット: "chore: 依存パッケージをインストール"

- [ ] 1.3 TypeScript型定義 - GameState
  - GameState型を定義
  - 要件: 3.1, 7.1
  - ファイル: `app/common/types/game.ts`
  - コミット: "feat: GameState型定義を追加"

- [ ] 1.4 TypeScript型定義 - Prize
  - Prize型を定義
  - 要件: 5.1, 5.2
  - ファイル: `app/common/types/prize.ts`
  - コミット: "feat: Prize型定義を追加"

- [ ] 1.5 TypeScript型定義 - BGMSettings
  - BGMSettings型を定義
  - 要件: 2.3
  - ファイル: `app/common/types/index.ts`
  - コミット: "feat: BGMSettings型定義を追加"

- [ ] 1.6 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-01-setup`


### ドメイン2: ユーティリティ層（TDD）
**ブランチ**: `feature/domain-02-utils`

- [ ] 2.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-02-utils`

- [ ] 2.2 bingoEngineテストシナリオ作成
  - Chrome DevTools MCPで検証するテストシナリオを定義
  - getAvailableNumbers、drawRandomNumber、isAllNumbersDrawnの動作確認項目を記載
  - 要件: 3.2, 3.3
  - ファイル: テストシナリオをコメントまたはドキュメントとして記載
  - コミット: "test: bingoEngineのテストシナリオを追加"

- [ ] 2.3 bingoEngine実装
  - テストをパスする実装
  - 要件: 3.2, 3.3
  - ファイル: `app/common/utils/bingoEngine.ts`
  - コミット: "feat: bingoEngineを実装"

- [ ] 2.4 csvParserテストシナリオ作成
  - Chrome DevTools MCPで検証するテストシナリオを定義
  - parseCSV、exportCSV、バリデーションの動作確認項目を記載
  - 要件: 6.6
  - ファイル: テストシナリオをコメントまたはドキュメントとして記載
  - コミット: "test: csvParserのテストシナリオを追加"

- [ ] 2.5 csvParser実装
  - テストをパスする実装
  - 要件: 6.6
  - ファイル: `app/common/utils/csvParser.ts`
  - コミット: "feat: csvParserを実装"

- [ ] 2.6 storageテストシナリオ作成
  - Chrome DevTools MCPで検証するテストシナリオを定義
  - saveToLocalStorage、loadFromLocalStorage、removeFromLocalStorageの動作確認項目を記載
  - 要件: 7.5
  - ファイル: テストシナリオをコメントまたはドキュメントとして記載
  - コミット: "test: storageのテストシナリオを追加"

- [ ] 2.7 storage実装
  - テストをパスする実装
  - 要件: 7.5
  - ファイル: `app/common/utils/storage.ts`
  - コミット: "feat: storageを実装"

- [ ] 2.8 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-02-utils`


### ドメイン3: カスタムフック層（TDD）
**ブランチ**: `feature/domain-03-hooks`

- [ ] 3.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-03-hooks`

- [ ] 3.2 useLocalStorageテスト作成
  - 状態管理、localStorage同期のテスト
  - 要件: 7.5
  - ファイル: `app/common/hooks/__tests__/useLocalStorage.test.ts`
  - コミット: "test: useLocalStorageのテストを追加"

- [ ] 3.3 useLocalStorage実装
  - テストをパスする実装
  - 要件: 7.5
  - ファイル: `app/common/hooks/useLocalStorage.ts`
  - コミット: "feat: useLocalStorageを実装"

- [ ] 3.4 useBingoEngineテスト作成
  - 抽選実行、利用可能番号取得のテスト
  - 要件: 3.2, 3.6
  - ファイル: `app/common/hooks/__tests__/useBingoEngine.test.ts`
  - コミット: "test: useBingoEngineのテストを追加"

- [ ] 3.5 useBingoEngine実装
  - テストをパスする実装
  - 要件: 3.2, 3.6
  - ファイル: `app/common/hooks/useBingoEngine.ts`
  - コミット: "feat: useBingoEngineを実装"

- [ ] 3.6 useBGMテスト作成
  - 再生/停止、音量調整のテスト
  - 要件: 2.3, 2.4
  - ファイル: `app/common/hooks/__tests__/useBGM.test.ts`
  - コミット: "test: useBGMのテストを追加"

- [ ] 3.7 useBGM実装
  - テストをパスする実装
  - 要件: 2.3, 2.4
  - ファイル: `app/common/hooks/useBGM.ts`
  - コミット: "feat: useBGMを実装"

- [ ] 3.8 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-03-hooks`


### ドメイン4: Context層（TDD）
**ブランチ**: `feature/domain-04-contexts`

- [ ] 4.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-04-contexts`

- [ ] 4.2 GameContextテスト作成
  - ゲーム状態管理、抽選実行、リセットのテスト
  - 要件: 1.2, 1.3, 3.2, 3.6, 7.1, 7.2
  - ファイル: `app/common/contexts/__tests__/GameContext.test.tsx`
  - コミット: "test: GameContextのテストを追加"

- [ ] 4.3 GameContext実装
  - GameContextとGameProviderを実装
  - 要件: 1.2, 1.3, 3.2, 3.6, 7.1, 7.2
  - ファイル: `app/common/contexts/GameContext.tsx`
  - コミット: "feat: GameContextを実装"

- [ ] 4.4 PrizeContextテスト作成
  - 景品管理、当選状態切替、並び替えのテスト
  - 要件: 5.5, 7.3
  - ファイル: `app/common/contexts/__tests__/PrizeContext.test.tsx`
  - コミット: "test: PrizeContextのテストを追加"

- [ ] 4.5 PrizeContext実装
  - PrizeContextとPrizeProviderを実装
  - 要件: 5.5, 7.3
  - ファイル: `app/common/contexts/PrizeContext.tsx`
  - コミット: "feat: PrizeContextを実装"

- [ ] 4.6 BGMContextテスト作成
  - BGM制御、設定保存のテスト
  - 要件: 2.2, 2.3, 7.4
  - ファイル: `app/common/contexts/__tests__/BGMContext.test.tsx`
  - コミット: "test: BGMContextのテストを追加"

- [ ] 4.7 BGMContext実装
  - BGMContextとBGMProviderを実装
  - 要件: 2.2, 2.3, 7.4
  - ファイル: `app/common/contexts/BGMContext.tsx`
  - コミット: "feat: BGMContextを実装"

- [ ] 4.8 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-04-contexts`


### ドメイン5: 共通UIコンポーネント（TDD）
**ブランチ**: `feature/domain-05-common-ui`

- [ ] 5.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-05-common-ui`

- [ ] 5.2 Modalテスト作成
  - 開閉、コンテンツ表示のテスト
  - 要件: 4.4
  - ファイル: `app/components/common/__tests__/Modal.test.tsx`
  - コミット: "test: Modalのテストを追加"

- [ ] 5.3 Modal実装
  - テストをパスする実装
  - 要件: 4.4
  - ファイル: `app/components/common/Modal.tsx`
  - コミット: "feat: Modalを実装"

- [ ] 5.4 Buttonテスト作成
  - クリック、無効化のテスト
  - 要件: 10.2
  - ファイル: `app/components/common/__tests__/Button.test.tsx`
  - コミット: "test: Buttonのテストを追加"

- [ ] 5.5 Button実装
  - テストをパスする実装
  - 要件: 10.2
  - ファイル: `app/components/common/Button.tsx`
  - コミット: "feat: Buttonを実装"

- [ ] 5.6 ConfirmDialogテスト作成
  - 確認/キャンセル動作のテスト
  - 要件: 6.7, 10.2
  - ファイル: `app/components/common/__tests__/ConfirmDialog.test.tsx`
  - コミット: "test: ConfirmDialogのテストを追加"

- [ ] 5.7 ConfirmDialog実装
  - テストをパスする実装
  - 要件: 6.7, 10.2
  - ファイル: `app/components/common/ConfirmDialog.tsx`
  - コミット: "feat: ConfirmDialogを実装"

- [ ] 5.8 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-05-common-ui`


### ドメイン6: Start画面（TDD）
**ブランチ**: `feature/domain-06-start-screen`

- [ ] 6.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-06-start-screen`

- [ ] 6.2 BGMToggleテスト作成
  - アイコン切替、状態管理のテスト
  - 要件: 2.1, 2.2
  - ファイル: `app/components/start/__tests__/BGMToggle.test.tsx`
  - コミット: "test: BGMToggleのテストを追加"

- [ ] 6.3 BGMToggle実装
  - @mui/icons-materialを使用して実装
  - 要件: 2.1, 2.2
  - ファイル: `app/components/start/BGMToggle.tsx`
  - コミット: "feat: BGMToggleを実装"

- [ ] 6.4 StartMenuテスト作成
  - ボタンクリック、画面遷移、保存状態確認のテスト
  - 要件: 1.1-1.5
  - ファイル: `app/components/start/__tests__/StartMenu.test.tsx`
  - コミット: "test: StartMenuのテストを追加"

- [ ] 6.5 StartMenu実装
  - 3つのボタンと状態管理を実装
  - 要件: 1.1-1.5
  - ファイル: `app/components/start/StartMenu.tsx`
  - コミット: "feat: StartMenuを実装"

- [ ] 6.6 Start画面ルート実装
  - _index.tsxを実装
  - 要件: 8.2
  - ファイル: `app/routes/_index.tsx`
  - コミット: "feat: Start画面ルートを実装"

- [ ] 6.7 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-06-start-screen`


### ドメイン7: Game画面 - 抽選機能（TDD）
**ブランチ**: `feature/domain-07-game-draw`

- [ ] 7.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-07-game-draw`

- [ ] 7.2 BingoBoardテスト作成
  - 番号表示、ボタン制御、抽選実行のテスト
  - 要件: 3.1-3.6, 10.3
  - ファイル: `app/components/game/__tests__/BingoBoard.test.tsx`
  - コミット: "test: BingoBoardのテストを追加"

- [ ] 7.3 BingoBoard実装
  - 中央の番号表示と抽選ボタンを実装
  - 要件: 3.1-3.6, 10.3
  - ファイル: `app/components/game/BingoBoard.tsx`
  - コミット: "feat: BingoBoardを実装"

- [ ] 7.4 RouletteWheelテスト作成
  - ルーレット演出、結果通知のテスト
  - 要件: 3.4, 3.5
  - ファイル: `app/components/game/__tests__/RouletteWheel.test.tsx`
  - コミット: "test: RouletteWheelのテストを追加"

- [ ] 7.5 RouletteWheel実装
  - react-custom-rouletteを使用して実装
  - 要件: 3.4, 3.5
  - ファイル: `app/components/game/RouletteWheel.tsx`
  - コミット: "feat: RouletteWheelを実装"

- [ ] 7.6 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-07-game-draw`


### ドメイン8: Game画面 - 履歴表示機能（TDD）
**ブランチ**: `feature/domain-08-game-history`

- [ ] 8.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-08-game-history`

- [ ] 8.2 NumberHistoryテスト作成
  - 直近10件表示、リンク表示のテスト
  - 要件: 4.1-4.3
  - ファイル: `app/components/game/__tests__/NumberHistory.test.tsx`
  - コミット: "test: NumberHistoryのテストを追加"

- [ ] 8.3 NumberHistory実装
  - 直近10件の当選番号表示を実装
  - 要件: 4.1-4.3
  - ファイル: `app/components/game/NumberHistory.tsx`
  - コミット: "feat: NumberHistoryを実装"

- [ ] 8.4 AllNumbersModalテスト作成
  - 全番号表示、モーダル開閉のテスト
  - 要件: 4.4
  - ファイル: `app/components/game/__tests__/AllNumbersModal.test.tsx`
  - コミット: "test: AllNumbersModalのテストを追加"

- [ ] 8.5 AllNumbersModal実装
  - すべての当選番号一覧を実装
  - 要件: 4.4
  - ファイル: `app/components/game/AllNumbersModal.tsx`
  - コミット: "feat: AllNumbersModalを実装"

- [ ] 8.6 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-08-game-history`


### ドメイン9: Game画面 - 景品管理機能（TDD）
**ブランチ**: `feature/domain-09-game-prizes`

- [ ] 9.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-09-game-prizes`

- [ ] 9.2 PrizeListテスト作成
  - 景品一覧表示、当選状態切替、取消線表示のテスト
  - 要件: 5.1-5.5
  - ファイル: `app/components/game/__tests__/PrizeList.test.tsx`
  - コミット: "test: PrizeListのテストを追加"

- [ ] 9.3 PrizeList実装
  - 景品一覧と当選状態管理を実装
  - 要件: 5.1-5.5
  - ファイル: `app/components/game/PrizeList.tsx`
  - コミット: "feat: PrizeListを実装"

- [ ] 9.4 Game画面ルート実装
  - game.tsxを実装（3カラムレイアウト）
  - 要件: 8.3
  - ファイル: `app/routes/game.tsx`
  - コミット: "feat: Game画面ルートを実装"

- [ ] 9.5 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-09-game-prizes`


### ドメイン10: Setting画面 - 景品テーブル（TDD）
**ブランチ**: `feature/domain-10-setting-table`

- [ ] 10.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-10-setting-table`

- [ ] 10.2 PrizeRowテスト作成
  - 景品行表示、削除ボタンのテスト
  - 要件: 6.3
  - ファイル: `app/components/setting/__tests__/PrizeRow.test.tsx`
  - コミット: "test: PrizeRowのテストを追加"

- [ ] 10.3 PrizeRow実装
  - 個別の景品行を実装
  - 要件: 6.3
  - ファイル: `app/components/setting/PrizeRow.tsx`
  - コミット: "feat: PrizeRowを実装"

- [ ] 10.4 PrizeTableテスト作成
  - テーブル表示、削除操作のテスト
  - 要件: 6.1, 6.2
  - ファイル: `app/components/setting/__tests__/PrizeTable.test.tsx`
  - コミット: "test: PrizeTableのテストを追加"

- [ ] 10.5 PrizeTable実装
  - CSS Grid/Flexboxレイアウトで実装
  - 要件: 6.1, 6.2
  - ファイル: `app/components/setting/PrizeTable.tsx`
  - コミット: "feat: PrizeTableを実装"

- [ ] 10.6 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-10-setting-table`


### ドメイン11: Setting画面 - DnD機能（TDD）
**ブランチ**: `feature/domain-11-setting-dnd`

- [ ] 11.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-11-setting-dnd`

- [ ] 11.2 DnD機能テスト作成
  - ドラッグ＆ドロップ、並び替え、保存のテスト
  - 要件: 6.4, 6.5
  - ファイル: `app/components/setting/__tests__/PrizeTable.dnd.test.tsx`
  - コミット: "test: DnD機能のテストを追加"

- [ ] 11.3 DnD機能実装
  - @dnd-kit/coreを使用してPrizeTableにDnD機能を追加
  - 要件: 6.4, 6.5
  - ファイル: `app/components/setting/PrizeTable.tsx`（更新）
  - コミット: "feat: DnD機能を実装"

- [ ] 11.4 ドラッグハンドル実装
  - ドラッグハンドルの表示を追加
  - 要件: 6.4
  - ファイル: `app/components/setting/PrizeRow.tsx`（更新）
  - コミット: "feat: ドラッグハンドルを追加"

- [ ] 11.5 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-11-setting-dnd`


### ドメイン12: Setting画面 - CSV管理（TDD）
**ブランチ**: `feature/domain-12-setting-csv`

- [ ] 12.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-12-setting-csv`

- [ ] 12.2 CSVUploaderテスト作成
  - ファイル選択、アップロード、エラー処理のテスト
  - 要件: 6.6
  - ファイル: `app/components/setting/__tests__/CSVUploader.test.tsx`
  - コミット: "test: CSVUploaderのテストを追加"

- [ ] 12.3 CSVUploader実装
  - CSV一括追加機能を実装
  - 要件: 6.6
  - ファイル: `app/components/setting/CSVUploader.tsx`
  - コミット: "feat: CSVUploaderを実装"

- [ ] 12.4 一括削除機能実装
  - 確認ダイアログ付き一括削除を実装
  - 要件: 6.7, 6.8
  - ファイル: `app/components/setting/PrizeTable.tsx`（更新）
  - コミット: "feat: 一括削除機能を実装"

- [ ] 12.5 Setting画面ルート実装
  - setting.tsxを実装
  - 要件: 8.4
  - ファイル: `app/routes/setting.tsx`
  - コミット: "feat: Setting画面ルートを実装"

- [ ] 12.6 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-12-setting-csv`


### ドメイン13: ルーティングとナビゲーション
**ブランチ**: `feature/domain-13-routing`

- [ ] 13.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-13-routing`

- [ ] 13.2 ルーティングテスト作成
  - 画面遷移のテスト（Start→Game、Start→Setting）
  - 要件: 8.1-8.5
  - ファイル: `app/__tests__/routing.test.tsx`
  - コミット: "test: ルーティングのテストを追加"

- [ ] 13.3 React Router v7設定
  - routes.tsを設定
  - 要件: 8.1-8.5
  - ファイル: `app/routes.ts`
  - コミット: "feat: React Router v7を設定"

- [ ] 13.4 root.tsx実装
  - Context Providerを統合
  - 要件: 8.1-8.5
  - ファイル: `app/root.tsx`
  - コミット: "feat: root.tsxにContext Providerを統合"

- [ ] 13.5 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-13-routing`


### ドメイン14: スタイリングとデザイン
**ブランチ**: `feature/domain-14-styling`

- [ ] 14.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-14-styling`

- [ ] 14.2 グローバルスタイル実装
  - app.cssを実装
  - 要件: 10.1
  - ファイル: `app/app.css`
  - コミット: "style: グローバルスタイルを追加"

- [ ] 14.3 Start画面スタイリング
  - Start画面のCSSを実装
  - 要件: 10.1, 10.4
  - ファイル: `app/components/start/*.css`
  - コミット: "style: Start画面のスタイリングを追加"

- [ ] 14.4 Game画面スタイリング
  - Game画面の3カラムレイアウトCSSを実装
  - 要件: 10.1, 10.4
  - ファイル: `app/components/game/*.css`
  - コミット: "style: Game画面のスタイリングを追加"

- [ ] 14.5 Setting画面スタイリング
  - Setting画面のテーブルレイアウトCSSを実装
  - 要件: 10.1, 10.4
  - ファイル: `app/components/setting/*.css`
  - コミット: "style: Setting画面のスタイリングを追加"

- [ ] 14.6 レスポンシブ対応
  - デスクトップ優先のレスポンシブCSSを追加
  - 要件: 10.4
  - ファイル: 各CSSファイル（更新）
  - コミット: "style: レスポンシブ対応を追加"

- [ ] 14.7 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-14-styling`


### ドメイン15: BGM機能
**ブランチ**: `feature/domain-15-bgm`

- [ ] 15.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-15-bgm`

- [ ] 15.2 BGM音源ファイル配置
  - public/audio/bgm.mp3を配置
  - 要件: 2.1
  - ファイル: `public/audio/bgm.mp3`
  - コミット: "feat: BGM音源ファイルを追加"

- [ ] 15.3 BGM自動再生実装
  - BGMContextに自動再生とループ処理を追加
  - 要件: 2.2, 2.3
  - ファイル: `app/common/contexts/BGMContext.tsx`（更新）
  - コミット: "feat: BGM自動再生とループを実装"

- [ ] 15.4 音量調整機能実装
  - 音量調整機能を追加
  - 要件: 2.4
  - ファイル: `app/common/contexts/BGMContext.tsx`（更新）
  - コミット: "feat: 音量調整機能を実装"

- [ ] 15.5 自動再生ポリシー対応
  - ブラウザの自動再生ポリシーに対応
  - 要件: 2.5
  - ファイル: `app/common/contexts/BGMContext.tsx`（更新）
  - コミット: "feat: 自動再生ポリシー対応を追加"

- [ ] 15.6 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-15-bgm`


### ドメイン16: エラーハンドリングとサンプルデータ
**ブランチ**: `feature/domain-16-error-handling`

- [ ] 16.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-16-error-handling`

- [ ] 16.2 localStorageエラーハンドリング
  - storage.tsにエラーハンドリングを追加
  - 要件: 全般
  - ファイル: `app/common/utils/storage.ts`（更新）
  - コミット: "feat: localStorageエラーハンドリングを追加"

- [ ] 16.3 CSV読み込みエラーハンドリング
  - csvParser.tsにエラーハンドリングを追加
  - 要件: 全般
  - ファイル: `app/common/utils/csvParser.ts`（更新）
  - コミット: "feat: CSV読み込みエラーハンドリングを追加"

- [ ] 16.4 抽選エンジンエラーハンドリング
  - bingoEngine.tsにエラーハンドリングを追加
  - 要件: 全般
  - ファイル: `app/common/utils/bingoEngine.ts`（更新）
  - コミット: "feat: 抽選エンジンエラーハンドリングを追加"

- [ ] 16.5 BGM再生エラーハンドリング
  - BGMContextにエラーハンドリングを追加
  - 要件: 全般
  - ファイル: `app/common/contexts/BGMContext.tsx`（更新）
  - コミット: "feat: BGM再生エラーハンドリングを追加"

- [ ] 16.6 エラーメッセージ表示実装
  - ユーザーへのエラーメッセージ表示を実装
  - 要件: 全般
  - ファイル: 各コンポーネント（更新）
  - コミット: "feat: エラーメッセージ表示を実装"

- [ ] 16.7 サンプルCSVデータ作成
  - 景品マスタのサンプルCSVを作成
  - 要件: 6.6
  - ファイル: `app/data/prizes.csv`
  - コミット: "feat: サンプルCSVデータを追加"

- [ ] 16.8 デフォルトデータ設定
  - 初期表示用デフォルトデータを設定
  - 要件: 6.6
  - ファイル: `app/common/contexts/PrizeContext.tsx`（更新）
  - コミット: "feat: デフォルトデータを設定"

- [ ] 16.9 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-16-error-handling`


### ドメイン17: 最終統合とデバッグ
**ブランチ**: `feature/domain-17-integration`

- [ ] 17.1 ブランチ作成
  - コマンド: `git checkout -b feature/domain-17-integration`

- [ ] 17.2 機能統合確認
  - すべての機能を統合して動作確認
  - 要件: 全般
  - コミット: "test: 機能統合確認完了"

- [ ] 17.3 ブラウザ動作テスト
  - ブラウザでの実際の動作テスト
  - 要件: 全般
  - コミット: "test: ブラウザ動作テスト完了"

- [ ] 17.4 localStorage永続化確認
  - localStorage永続化の確認
  - 要件: 7.1-7.5
  - コミット: "test: localStorage永続化確認完了"

- [ ] 17.5 画面遷移確認
  - 画面遷移の確認
  - 要件: 8.1-8.5
  - コミット: "test: 画面遷移確認完了"

- [ ] 17.6 BGM再生確認
  - BGM再生の確認
  - 要件: 2.1-2.5
  - コミット: "test: BGM再生確認完了"

- [ ] 17.7 最終デバッグ
  - バグ修正と最終調整
  - 要件: 全般
  - コミット: "fix: 最終デバッグ完了"

- [ ] 17.8 ドメイン完了 - mainへマージ
  - コマンド: `git checkout main && git merge feature/domain-17-integration`

## 実装の進め方

各ドメインで以下のサイクルを実行:

1. **ブランチ作成**: `git checkout -b feature/domain-XX-name`
2. **ライブラリ情報取得**: Context7 MCPで必要なライブラリの最新ドキュメントとAPIを確認
3. **テストシナリオ作成**: Chrome DevTools MCPで検証する項目を定義（Red）
4. **実装**: テストシナリオを満たす最小限の実装（Green）
5. **Chrome MCPで動作確認**: ブラウザ上で実際の動作をテスト
6. **コミット**: タスク完了時に即座にコミット
7. **リファクタリング**: 必要に応じてコードの品質向上（Refactor）
8. **マージ**: ドメイン完了時に `git checkout main && git merge feature/domain-XX-name`

## 注意事項

- **TDD原則を厳守**: 必ずテストシナリオを先に定義してから実装
- **Chrome DevTools MCPでテスト**: ユニットテストファイルは作成せず、Chrome MCPでブラウザ上の実際の動作を確認
- **Context7でライブラリ確認**: ライブラリインストール前に必ずContext7 MCPで最新情報を取得
- **タスクごとにコミット**: 各タスク完了時に必ずコミット
- **ブランチ戦略**: 各ドメインで専用ブランチを使用
- **最小限のテスト**: コア機能に焦点を当て、過度なテストは避ける
- **TSDocコメント**: すべてのコードに日本語でTSDocコメントを記述
- **React Router v7スタイル**: route.tsxファイルにはloader、action、default export componentのみ記述

## MCPツールの使用方法

### Context7 MCP
ライブラリのインストール前に使用:
1. `resolve-library-id`: ライブラリ名から正確なIDを取得
2. `get-library-docs`: 最新のドキュメント、API、使用例を取得

### Chrome DevTools MCP
実装後の動作確認に使用:
1. `new_page`: 開発サーバーのURLでページを開く
2. `take_snapshot`: ページの状態を確認
3. `click`, `fill`, `press_key`: ユーザー操作をシミュレート
4. `evaluate_script`: JavaScriptを実行して状態を検証
5. `get_console_message`: コンソールエラーを確認
