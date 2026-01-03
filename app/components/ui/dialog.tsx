import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * ダイアログの開閉状態を管理するルートコンポーネントです。
 *
 * - 入力制約: `open` と `onOpenChange` を渡す場合は制御コンポーネントとして扱います。
 * - 副作用: ありません。
 * - 戻り値: Radix Dialog のルート要素を返します。
 * - Chrome DevTools MCP ではモーダルの表示/非表示が意図通り切り替わることを確認します。
 */
export const Dialog = DialogPrimitive.Root;

/**
 * ダイアログを開くためのトリガーコンポーネントです。
 *
 * - 入力制約: `asChild` を利用する場合は子要素が単一であることを確認します。
 * - 副作用: ありません。
 * - 戻り値: トリガー要素を返します。
 * - Chrome DevTools MCP ではクリックでダイアログが開くことを確認します。
 */
export const DialogTrigger = DialogPrimitive.Trigger;

/**
 * ダイアログのポータル配置を制御するコンポーネントです。
 *
 * - 入力制約: ありません。
 * - 副作用: Portal により `document.body` へ描画されます。
 * - 戻り値: ポータル要素を返します。
 * - Chrome DevTools MCP では DOM の `body` 配下に要素が追加されることを確認します。
 */
export const DialogPortal = DialogPrimitive.Portal;

/**
 * ダイアログを閉じるためのコンポーネントです。
 *
 * - 入力制約: `asChild` の場合は子要素が単一であることを確認します。
 * - 副作用: クリック時に `onOpenChange(false)` が発火します。
 * - 戻り値: クローズ用の要素を返します。
 * - Chrome DevTools MCP ではクリックでモーダルが閉じることを確認します。
 */
export const DialogClose = DialogPrimitive.Close;

/**
 * ダイアログ背景のオーバーレイコンポーネントです。
 *
 * - 入力制約: ありません。
 * - 副作用: 背景全体を覆うための DOM 要素を描画します。
 * - 戻り値: オーバーレイ要素を返します。
 * - Chrome DevTools MCP では背景の暗転が適用されることを確認します。
 */
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-foreground/60", className)}
      {...props}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

/**
 * ダイアログ本文を描画するコンポーネントです。
 *
 * - 入力制約: `Dialog` の子として利用します。
 * - 副作用: Portal 経由で DOM に描画されます。
 * - 戻り値: ダイアログ本体の要素を返します。
 * - Chrome DevTools MCP では中央配置とサイズが想定通りであることを確認します。
 */
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 min-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-8 text-card-foreground shadow-2xl outline-none",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = "DialogContent";

/**
 * ダイアログのヘッダー領域をまとめるコンポーネントです。
 *
 * - 入力制約: ありません。
 * - 副作用: ありません。
 * - 戻り値: 見出し用のラッパー要素を返します。
 * - Chrome DevTools MCP では見出し周りの余白が維持されることを確認します。
 */
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("space-y-3", className)} {...props} />;
};

/**
 * ダイアログのフッター領域をまとめるコンポーネントです。
 *
 * - 入力制約: ありません。
 * - 副作用: ありません。
 * - 戻り値: 操作ボタン用のラッパー要素を返します。
 * - Chrome DevTools MCP ではボタン群のレイアウトが崩れないことを確認します。
 */
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("mt-8 flex flex-col gap-3 md:flex-row", className)} {...props} />;
};

/**
 * ダイアログのタイトルを描画するコンポーネントです。
 *
 * - 入力制約: ありません。
 * - 副作用: ありません。
 * - 戻り値: タイトル要素を返します。
 * - Chrome DevTools MCP ではタイトルの見た目が想定通りであることを確認します。
 */
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("font-bold text-2xl text-foreground", className)}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

/**
 * ダイアログの説明文を描画するコンポーネントです。
 *
 * - 入力制約: ありません。
 * - 副作用: ありません。
 * - 戻り値: 説明文要素を返します。
 * - Chrome DevTools MCP では説明文の色と余白が想定通りであることを確認します。
 */
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";
