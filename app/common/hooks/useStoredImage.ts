import { useEffect, useRef, useState } from "react";
import { extractPrizeImageId, isPrizeImagePath, readPrizeImage } from "~/common/utils/imageStorage";

/**
 * 賞品画像の保存先に応じて表示用 URL を解決するフックです。
 *
 * - 副作用: IndexedDB から画像 Blob を読み込み、`URL.createObjectURL` を生成します。
 * - 入力制約: `imagePath` が `idb:` 形式の場合は IndexedDB に該当キーが存在する必要があります。
 * - 戻り値: 表示用 URL（または null）を返します。
 * - Chrome DevTools MCP: Application > IndexedDB で画像が登録され、画面に表示されることを確認します。
 */
export const useStoredImage = (imagePath: string | null): string | null => {
  const [resolvedPath, setResolvedPath] = useState<string | null>(() => {
    if (!imagePath) {
      return null;
    }
    if (!isPrizeImagePath(imagePath)) {
      return imagePath;
    }
    return null;
  });
  const createdUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let disposed = false;
    if (createdUrlRef.current) {
      URL.revokeObjectURL(createdUrlRef.current);
      createdUrlRef.current = null;
    }

    if (!imagePath) {
      setResolvedPath(null);
      return () => {};
    }

    if (!isPrizeImagePath(imagePath)) {
      setResolvedPath(imagePath);
      return () => {};
    }

    setResolvedPath(null);
    const prizeId = extractPrizeImageId(imagePath);
    readPrizeImage(prizeId)
      .then((blob) => {
        if (disposed) {
          return;
        }
        if (!blob) {
          setResolvedPath(null);
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        createdUrlRef.current = objectUrl;
        setResolvedPath(objectUrl);
      })
      .catch(() => {
        if (!disposed) {
          setResolvedPath(null);
        }
      });

    return () => {
      disposed = true;
      if (createdUrlRef.current) {
        URL.revokeObjectURL(createdUrlRef.current);
        createdUrlRef.current = null;
      }
    };
  }, [imagePath]);

  return resolvedPath;
};
