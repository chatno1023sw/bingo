# 実装タスクリスト

## 概要

このタスクリストは、新年会用Bingo抽選アプリケーションの実装を段階的に進めるためのものです。各タスクは要件定義とデザイン文書に基づいており、コード生成LLMが実装できる具体的な作業単位になっています。

## タスク

- [ ] 1. 依存パッケージのインストール
  - React Router v7の最新版を確認してインストールする
  - react-custom-rouletteをインストールする
  - @mui/icons-materialをインストールする
  - @dnd-kit/coreをインストールする
  - mizchi/similarityをインストールする（コード類似度検出用）
  - 開発依存パッケージ（Vitest、React Testing Library等）をインストールする
  - 要件: 2章（技術スタックと外部ライブラリ）
  - コマンド: `npm install` または `pnpm install`

- [ ] 2. プロジェクト基盤とデータ型定義
  - TypeScript型定義ファイル（GameState、Prize、BGMSettings）を作成する
  - 要件: 3.1, 5.1, 5.2, 7.1
  - ファイル: `app/common/types/game.ts`, `app/common/types/prize.ts`, `app/common/types/index.ts`

- [ ] 3. ユーティリティ関数の実装
  - localStorageの読み書き関数を実装する
  - ビンゴ抽選エンジンのロジックを実装する（重複防止、ランダム選択）
  - CSVパーサーとバリデーション関数を実装する
  - 要件: 3.2, 3.3, 6.6, 7.5
  - ファイル: `app/common/utils/storage.ts`, `app/common/utils/bingoEngine.ts`, `app/common/utils/csvParser.ts`

- [ ] 4. カスタムフックの実装
  - useLocalStorageフックを実装する
  - useBingoEngineフックを実装する
  - useBGMフックを実装する
  - 要件: 2.3, 2.4, 3.6, 7.5
  - ファイル: `app/common/hooks/useLocalStorage.ts`, `app/common/hooks/useBingoEngine.ts`, `app/common/hooks/useBGM.ts`

- [ ] 5. Context Providerの実装
  - GameContextとGameProviderを実装する
  - PrizeContextとPrizeProviderを実装する
  - BGMContextとBGMProviderを実装する
  - 要件: 1.2, 1.3, 2.2, 2.3, 3.2, 3.6, 5.5, 7.1, 7.2, 7.3, 7.4
  - ファイル: `app/common/contexts/GameContext.tsx`, `app/common/contexts/PrizeContext.tsx`, `app/common/contexts/BGMContext.tsx`

- [ ] 6. 共通UIコンポーネントの実装
  - Modalコンポーネントを実装する
  - Buttonコンポーネントを実装する
  - ConfirmDialogコンポーネントを実装する
  - 要件: 4.4, 6.7, 10.2
  - ファイル: `app/components/common/Modal.tsx`, `app/components/common/Button.tsx`, `app/components/common/ConfirmDialog.tsx`

- [ ] 7. Start画面の実装
  - BGMToggleコンポーネントを実装する（@mui/icons-materialのアイコン使用）
  - StartMenuコンポーネントを実装する（3つのボタンと状態管理）
  - Start画面のルート（_index.tsx）を実装する
  - 「はじめから」ボタンクリック時の確認ダイアログを実装する
  - 要件: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 8.2
  - ファイル: `app/components/start/BGMToggle.tsx`, `app/components/start/StartMenu.tsx`, `app/routes/_index.tsx`

- [ ] 8. Game画面 - 抽選機能の実装
  - BingoBoardコンポーネントを実装する（中央の番号表示と抽選ボタン）
  - RouletteWheelコンポーネントを実装する（react-custom-roulette使用）
  - 抽選ボタンのクリックハンドラーと状態管理を実装する
  - 抽選中のボタン無効化を実装する
  - 要件: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 10.3
  - ファイル: `app/components/game/BingoBoard.tsx`, `app/components/game/RouletteWheel.tsx`

- [ ] 9. Game画面 - 履歴表示機能の実装
  - NumberHistoryコンポーネントを実装する（直近10件表示）
  - AllNumbersModalコンポーネントを実装する（全番号一覧）
  - 「これまでの当選番号を見る」リンクとモーダル開閉を実装する
  - 要件: 4.1, 4.2, 4.3, 4.4
  - ファイル: `app/components/game/NumberHistory.tsx`, `app/components/game/AllNumbersModal.tsx`

- [ ] 10. Game画面 - 景品管理機能の実装
  - PrizeListコンポーネントを実装する（景品一覧表示）
  - 景品の当選状態切り替えボタンを実装する
  - 当選済み景品の取消線表示を実装する
  - Game画面のルート（game.tsx）を実装する
  - 要件: 5.1, 5.2, 5.3, 5.4, 5.5, 8.3
  - ファイル: `app/components/game/PrizeList.tsx`, `app/routes/game.tsx`

- [ ] 11. Setting画面 - 景品テーブル表示の実装
  - PrizeRowコンポーネントを実装する（個別の景品行）
  - PrizeTableコンポーネントを実装する（CSS Grid/Flexboxレイアウト）
  - 削除ボタンの実装
  - 要件: 6.1, 6.2, 6.3
  - ファイル: `app/components/setting/PrizeRow.tsx`, `app/components/setting/PrizeTable.tsx`

- [ ] 12. Setting画面 - DnD並び替え機能の実装
  - @dnd-kit/coreを使用したドラッグ＆ドロップ機能を実装する
  - ドラッグハンドルの表示を実装する
  - 並び替え後のlocalStorage保存を実装する
  - 要件: 6.4, 6.5
  - ファイル: `app/components/setting/PrizeTable.tsx`

- [ ] 13. Setting画面 - CSV管理機能の実装
  - CSVUploaderコンポーネントを実装する（ファイル選択とアップロード）
  - CSV一括追加機能を実装する
  - 一括削除ボタンと確認ダイアログを実装する
  - Setting画面のルート（setting.tsx）を実装する
  - 要件: 6.6, 6.7, 6.8, 8.4
  - ファイル: `app/components/setting/CSVUploader.tsx`, `app/routes/setting.tsx`

- [ ] 14. ルーティングとナビゲーションの統合
  - React Router v7の設定を確認・調整する
  - 各画面間の遷移を実装する
  - root.tsxにContext Providerを統合する
  - 要件: 8.1, 8.2, 8.3, 8.4, 8.5
  - ファイル: `app/root.tsx`, `app/routes.ts`

- [ ] 15. スタイリングとデザインの実装
  - docs/design配下のデザイン画像に基づいてCSSを実装する
  - Start画面のスタイリング
  - Game画面の3カラムレイアウト
  - Setting画面のテーブルレイアウト
  - レスポンシブ対応（デスクトップ優先）
  - 要件: 10.1, 10.4
  - ファイル: `app/app.css`, 各コンポーネントのCSSファイル

- [ ] 16. BGM機能の統合
  - BGM音源ファイルの配置
  - BGMの自動再生とループ処理
  - 音量調整機能
  - ブラウザの自動再生ポリシー対応
  - 要件: 2.1, 2.2, 2.3, 2.4, 2.5
  - ファイル: `public/audio/bgm.mp3`, BGM関連コンポーネント

- [ ] 17. エラーハンドリングの実装
  - localStorage関連エラーのハンドリング
  - CSV読み込みエラーのハンドリング
  - 抽選エンジンエラーのハンドリング
  - BGM再生エラーのハンドリング
  - ユーザーへのエラーメッセージ表示
  - 要件: 全般
  - ファイル: 各コンポーネントとユーティリティ関数

- [ ] 18. サンプルデータの作成
  - 景品マスタのサンプルCSVファイルを作成する
  - 初期表示用のデフォルトデータを設定する
  - 要件: 6.6
  - ファイル: `app/data/prizes.csv`

- [ ]* 19. テストの実装
  - ユーティリティ関数のユニットテストを作成する
  - 主要コンポーネントのコンポーネントテストを作成する
  - E2Eテストシナリオを実装する
  - 要件: 全般
  - ファイル: `__tests__/` 配下

- [ ] 20. パフォーマンス最適化
  - 高頻度再レンダリングコンポーネントのメモ化
  - 計算コストの高い処理のuseMemo適用
  - モーダルコンポーネントの遅延ローディング
  - 要件: 全般
  - ファイル: 各コンポーネント

- [ ] 21. 最終統合とデバッグ
  - すべての機能を統合して動作確認
  - ブラウザでの実際の動作テスト
  - localStorage永続化の確認
  - 画面遷移の確認
  - BGM再生の確認
  - 要件: 全般

## 実装の進め方

1. **タスク1**: 依存パッケージのインストール
2. **タスク2-5**: 基盤となる型定義、ユーティリティ、フック、Contextを実装
3. **タスク6**: 共通UIコンポーネントを実装
4. **タスク7**: Start画面を実装
5. **タスク8-10**: Game画面の各機能を段階的に実装
6. **タスク11-13**: Setting画面の各機能を段階的に実装
7. **タスク14**: ルーティングを統合
8. **タスク15-16**: スタイリングとBGM機能を追加
9. **タスク17-18**: エラーハンドリングとサンプルデータを追加
10. **タスク19-20**: テストと最適化（オプション）
11. **タスク21**: 最終統合とデバッグ

## 注意事項

- 各タスクは前のタスクの成果物に依存する場合があるため、順番に実装することを推奨
- `*`マークのタスクはオプションであり、コア機能の実装後に実施可能
- すべてのコードにはTSDocコメントを日本語で記述すること
- React Router v7の推奨スタイルに従い、route.tsxファイルにはloader、action、default export componentのみを記述すること
