import { Image, ImageIcon } from "lucide-react";
import type { ChangeEvent, FC } from "react";
import { useId, useRef } from "react";
import { useStoredImage } from "~/common/hooks/useStoredImage";
import type { Prize } from "~/common/types";
import { buildPrizeImagePath, deletePrizeImage, savePrizeImage } from "~/common/utils/imageStorage";
import { Button } from "~/components/common/Button";
import { cn } from "~/lib/utils";

export type PrizeImagePickerProps = {
  /** 景品 ID */
  id: string;
  /** 賞名 */
  name: string;
  /** 画像参照パス */
  imagePath: string | null;
  /** 操作無効フラグ */
  disabled?: boolean;
  /** 更新操作 */
  onUpdate?: (patch: Partial<Prize>) => void;
};

/**
 * 景品カードの画像選択ブロックです。
 *
 * - 副作用: 画像の保存/削除で IndexedDB を更新します。
 * - 入力制約: `id` は一意な値を渡してください。
 * - 戻り値: 画像表示と選択 UI を返します。
 * - Chrome DevTools MCP では画像追加/削除を確認します。
 */
export const PrizeImagePicker: FC<PrizeImagePickerProps> = ({
  id,
  name,
  imagePath,
  disabled,
  onUpdate,
}) => {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resolvedImagePath = useStoredImage(imagePath);

  /**
   * 画像選択の入力を開きます。
   *
   * - 副作用: file input をクリックします。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP ではファイル選択が開くことを確認します。
   */
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 画像ファイル選択時の処理です。
   *
   * - 副作用: IndexedDB 保存と `onUpdate` を実行します。
   * - 入力制約: 画像ファイルのみを受け付けます。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では画像反映を確認します。
   */
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      return;
    }
    void savePrizeImage(id, file)
      .then(() => {
        onUpdate?.({ imagePath: buildPrizeImagePath(id) });
      })
      .catch(() => {
        /* IndexedDB 保存エラー時は表示更新を行いません */
      });
  };

  /**
   * 画像を削除します。
   *
   * - 副作用: IndexedDB の削除と `onUpdate` を実行します。
   * - 入力制約: `imagePath` が存在する必要があります。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では画像削除を確認します。
   */
  const handleImageDelete = () => {
    if (!imagePath) {
      return;
    }
    void deletePrizeImage(id)
      .then(() => {
        onUpdate?.({ imagePath: null });
      })
      .catch(() => {
        /* IndexedDB 削除エラー時は表示更新を行いません */
      });
  };

  return (
    <>
      <Button
        type="button"
        className={cn(
          "flex h-32 w-full items-center justify-center rounded bg-background! p-0! text-foreground text-lg",
          resolvedImagePath || "border-2 border-border",
        )}
        onClick={handleImageClick}
        disabled={disabled}
      >
        {resolvedImagePath ? (
          <>
            <img
              src={resolvedImagePath}
              alt={`${name || "景品"} 画像`}
              className="h-32 w-64.5 rounded object-cover object-center"
            />
            <Button
              type="button"
              className="absolute top-28 right-8 z-60 h-8! bg-secondary px-2! py-1! text-xs"
              onClick={handleImageDelete}
              disabled={disabled || !imagePath}
            >
              <div className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span>削除</span>
              </div>
            </Button>
          </>
        ) : (
          <div className="flex h-32 w-64.5 flex-col items-center gap-1 pt-2 text-muted-foreground">
            <Image className="h-20 w-20 text-muted-foreground" />
            <span>クリックで画像を追加</span>
          </div>
        )}
      </Button>
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleImageChange}
        disabled={disabled}
      />
    </>
  );
};
