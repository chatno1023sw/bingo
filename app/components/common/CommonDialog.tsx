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

export type CommonDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  footerClassName?: string;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  closeDisabled?: boolean;
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
      <DialogContent className={contentClassName}>
        {showCloseButton ? (
          <DialogClose asChild>
            <Button
              type="button"
              className="absolute top-4 right-4 rounded-full text-slate-500 transition"
              aria-label={closeButtonAriaLabel}
              disabled={closeDisabled}
            >
              <X className="h-10 w-10 hover:text-slate-400" />
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
