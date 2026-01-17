# 景品ルーレット結果リセット調査

## 再現手順
1. Game 画面で任意の抽選番号を「抽選を開始！」ボタンで決定する。
2. 右パネルで「景品ルーレット」を押し、抽選が完了するまで待つ。
3. 結果ダイアログを開いたまま、再度「抽選を開始！」で番号抽選を行う。
4. 再び「景品ルーレット」を押す。
   - 期待値: 新しい景品抽選が始まるまでは 2. の結果が表示されたままになる。
   - 実際: 4. でボタンを押した瞬間に結果ダイアログが閉じ、2. の当選結果がリセットされる。

## 原因
- Game コンテンツは `useGameSession` で `session` ステートを保持し（`app/common/hooks/useGameSession.ts:40-73`）、Prize サイドパネルは `PrizeContext` が保持する `prizes` ステートを参照している。両者は連携しておらず、`PrizeContext` で当選状態を更新しても `session.prizes` には反映されない。
- 番号抽選で `performDraw` が呼ばれると、`session` に残っている古い `prizes` を含んだまま `persistSessionState` へ保存してしまう（`useGameSession.ts:51-62`）。`persistSessionState` は `storageKeys.prizes` を丸ごと上書きするため（`app/common/services/sessionService.ts:124-142`）、最新の当選状態が失われる。
- localStorage の `prizes` が書き換わると、`PrizeContext` の storage リスナーが `refresh()` を実行し、右ペインの `prizes` が復元前の状態へ戻る。その結果、景品ルーレット結果ダイアログで保持していた当選情報も再レンダリングで消えてしまう。

## あるべき実装
- 番号抽選やリセットなど、Game 側が `persistSessionState` を呼ぶ際には、常に最新の景品一覧を保存対象に含めるべきである。
- `PrizeContext` が更新した state を Game 側でも再利用できるよう、保存直前に `getPrizes()` で現在の localStorage 内容を読み取り、`GameStateEnvelope` に差し替えてから保存する構造にする。

## 対応方針
- `useGameSession` の `performDraw` / `handleReset` で `persistSessionState` を呼ぶ前に `getPrizes()` を読み込み、`updatedEnvelope.prizes` を必ず最新一覧へ差し替える。
- これにより Game 側で抽選やリセットを行っても `prizes` の選出状態が巻き戻されず、景品ルーレット結果ダイアログの表示内容もリセットされなくなる。
