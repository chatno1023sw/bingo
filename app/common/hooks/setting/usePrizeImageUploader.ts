import { useCallback, useState } from "react";
import type { PrizeList } from "~/common/types";
import { buildPrizeImagePath, savePrizeImage } from "~/common/utils/imageStorage";
import { normalizeKeyText } from "~/common/utils/text";

export type UsePrizeImageUploaderParams = {
  draftPrizes: PrizeList;
  setDraftPrizes: React.Dispatch<React.SetStateAction<PrizeList>>;
  setLocalError: (message: string | null) => void;
};

/**
 * 景品画像アップロードロジックを Setting ドメイン向けに切り出します。
 *
 * - 副作用: IndexedDB と状態を更新します。
 * - 入力制約: `draftPrizes` は order 昇順を前提とします。
 * - 戻り値: 画像追加に必要なハンドラ群を返します。
 * - Chrome DevTools MCP では画像取り込み後にプレビューが更新されることを確認します。
 */
export const usePrizeImageUploader = ({
  draftPrizes,
  setDraftPrizes,
  setLocalError,
}: UsePrizeImageUploaderParams) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUploadClick = useCallback(() => {
    const input = document.getElementById("image-import-simple");
    if (input instanceof HTMLInputElement) {
      input.click();
    }
  }, []);

  const handleUploadImages = useCallback(
    async (files: FileList) => {
      if (files.length === 0) {
        return;
      }
      setIsUploading(true);
      try {
        const mappings = Array.from(files)
          .filter((file) => file.type.startsWith("image/"))
          .map((file) => ({ name: file.name, file }));
        const normalizeFileName = (value: string) =>
          normalizeKeyText(value).replace(/\.[^/.]+$/, "");
        const grouped = mappings.reduce<Record<string, { name: string; file: File }[]>>(
          (acc, entry) => {
            const key = normalizeFileName(entry.name);
            if (!key) {
              return acc;
            }
            acc[key] = acc[key] ? [...acc[key], entry] : [entry];
            return acc;
          },
          {},
        );
        const keys = Object.keys(grouped);
        const remaining = mappings.slice();
        const next: PrizeList = [];
        for (const prize of draftPrizes) {
          const candidates = [prize.itemName, prize.prizeName]
            .map((value) => normalizeKeyText(value))
            .filter((value) => value.length > 0);
          const matchedKey =
            candidates.find((candidate) => grouped[candidate]?.length) ??
            keys.find((key) => candidates.some((candidate) => key.includes(candidate)));
          if (!matchedKey && candidates.length === 0) {
            const fallback = remaining.shift();
            if (!fallback) {
              next.push(prize);
              continue;
            }
            await savePrizeImage(prize.id, fallback.file);
            next.push({
              ...prize,
              imagePath: buildPrizeImagePath(prize.id),
            });
            continue;
          }
          if (!matchedKey) {
            next.push(prize);
            continue;
          }
          const images = grouped[matchedKey];
          if (!images || images.length === 0) {
            next.push(prize);
            continue;
          }
          const nextImage = images.shift();
          if (!nextImage) {
            next.push(prize);
            continue;
          }
          const usedIndex = remaining.findIndex((entry) => entry.name === nextImage.name);
          if (usedIndex >= 0) {
            remaining.splice(usedIndex, 1);
          }
          await savePrizeImage(prize.id, nextImage.file);
          next.push({
            ...prize,
            imagePath: buildPrizeImagePath(prize.id),
          });
        }
        setDraftPrizes(next);
        setLocalError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "image-upload-error";
        setLocalError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [draftPrizes, setDraftPrizes, setLocalError],
  );

  return { isUploading, handleImageUploadClick, handleUploadImages };
};
