import { X } from "lucide-react";
import type { FC, ReactNode } from "react";
import { Button } from "~/components/common/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

export type CommonDialogProps = {
  /** ダイアログの表示状態 */
  open: boolean;
  /** 閉じる操作 */
  onClose: () => void;
  /** タイトル要素 */
  title?: ReactNode;
  /** 説明要素 */
  description?: ReactNode;
  /** 本文要素 */
  children?: ReactNode;
  /** フッター要素 */
  footer?: ReactNode;
  /** コンテンツの追加クラス */
  contentClassName?: string;
  /** ヘッダーの追加クラス */
  headerClassName?: string;
  /** タイトルの追加クラス */
  titleClassName?: string;
  /** 説明文の追加クラス */
  descriptionClassName?: string;
  /** フッターの追加クラス */
  footerClassName?: string;
  /** 閉じるボタンを表示するかどうか */
  showCloseButton?: boolean;
  /** 閉じるボタンの aria-label */
  closeButtonAriaLabel?: string;
  /** 閉じるボタンの無効化 */
  closeDisabled?: boolean;
  /** オーバーレイ操作で閉じるのを無効化するかどうか */
  preventOutsideClose?: boolean;
};

/**
 * 画面共通で使えるダイアログのフレームです。
 *
 * - 入力制約: `open` が false の場合は描画せず、`onClose` は必須です。
 * - 副作用: Radix Dialog の Portal により `document.body` へ描画します。
 * - 戻り値: ダイアログの React 要素、または `null` を返します。
 * - Chrome DevTools MCP では背景の暗転と閉じる操作が反映されることを確認します。
 */
export const CommonDialog: FC<CommonDialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  contentClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
  showCloseButton = false,
  closeButtonAriaLabel = "閉じる",
  closeDisabled = false,
  preventOutsideClose = false,
}) => {
  if (!open) {
    return null;
  }
  if (typeof document === "undefined") {
    return null;
  }

  const hasHeader = title || description;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        className={contentClassName}
        onInteractOutside={
          preventOutsideClose
            ? (event) => {
                event.preventDefault();
              }
            : undefined
        }
      >
        {showCloseButton ? (
          <DialogClose asChild>
            <Button
              type="button"
              className={cn(
                "absolute top-4 right-4 rounded-full bg-transparent text-muted-foreground",
                "hover:bg-transparent hover:text-foreground focus:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              aria-label={closeButtonAriaLabel}
              disabled={closeDisabled}
            >
              <X className="h-10 w-10" />
            </Button>
          </DialogClose>
        ) : null}
        {hasHeader ? (
          <DialogHeader className={headerClassName}>
            {title ? <DialogTitle className={titleClassName}>{title}</DialogTitle> : null}
            {description ? (
              <DialogDescription className={descriptionClassName}>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
        ) : null}
        {children}
        {footer ? <DialogFooter className={footerClassName}>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
};
