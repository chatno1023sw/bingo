# 景品ルーレット結果リセット調査

## 再現手順
1. Game 画面で任意の抽選番号を「抽選を開始！」ボタンで決定する。
2. 右パネルで「景品ルーレット」を押し、抽選が完了するまで待つ。
3. 結果ダイアログを開いたまま、再度「抽選を開始！」で番号抽選を行う。
4. 再び「景品ルーレット」を押す。
   - 期待値: 新しい景品抽選が始まるまでは 2. の結果が表示されたままになる。
   - 実際: 4. でボタンを押した瞬間に結果ダイアログが閉じ、2. の当選結果がリセットされる。

## 原因
- `PrizeResultDialog` では背景を暗くしないため `CommonDialog` の `overlayHidden` を有効化しているが、`preventOutsideClose` を指定していない（`app/components/game/PrizeResultDialog.tsx:82-113`）。
- `CommonDialog` が内部で利用している Radix Dialog は外側をクリックすると `onOpenChange(false)` が発火し、そのまま `onClose` が呼ばれてダイアログが閉じる（`app/components/common/CommonDialog.tsx:62-87`）。
- そのため、結果ダイアログ表示中に「抽選を開始！」ボタンや「景品ルーレット」ボタンをクリックすると、それだけで結果ダイアログが閉じて状態がリセットされてしまう。

## あるべき実装
- 景品ルーレットの当選結果は、ユーザが明示的に閉じるまで画面に残し続ける必要がある。
- `CommonDialog` には外側クリックを無効化する `preventOutsideClose` が用意されているため、`PrizeResultDialog` からこのフラグを有効化し、クローズは閉じるボタン（または Esc）操作に限定する。

## 対応方針
- `PrizeResultDialog` の `CommonDialog` 呼び出しに `preventOutsideClose` を追加し、外側クリックでは閉じないようにする。
- これにより結果ダイアログを表示したまま他の操作（抽選ルーレットや景品ルーレット）を実行しても、ユーザが手動で閉じるまで結果が保持される。
