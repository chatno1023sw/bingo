import { useEffect } from "react";
import { useBlocker } from "react-router";

export type UnsavedChangesGuardParams = {
  isDirty: boolean;
  allowNavigation: boolean;
  setAllowNavigation: (value: boolean) => void;
  setConfirmOpen: (open: boolean) => void;
};

export type UnsavedChangesGuardResult = {
  handleCancelConfirm: () => void;
  handleConfirmProceed: () => void;
};

/**
 * 未保存データのガードと beforeunload をまとめて扱います。
 *
 * - 副作用: React Router の blocker と window.beforeunload を制御します。
 * - 入力制約: `isDirty` が true の場合のみ guard を有効化します。
 * - 戻り値: ダイアログ操作用のハンドラを返します。
 * - Chrome DevTools MCP ではナビゲーションブロックを確認します。
 */
export const useUnsavedChangesGuard = ({
  isDirty,
  allowNavigation,
  setAllowNavigation,
  setConfirmOpen,
}: UnsavedChangesGuardParams): UnsavedChangesGuardResult => {
  const blocker = useBlocker(isDirty && !allowNavigation);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setConfirmOpen(true);
    }
  }, [blocker.state, setConfirmOpen]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [isDirty]);

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setAllowNavigation(false);
    blocker.reset?.();
  };

  const handleConfirmProceed = () => {
    setConfirmOpen(false);
    setAllowNavigation(true);
    blocker.proceed?.();
  };

  return {
    handleCancelConfirm,
    handleConfirmProceed,
  };
};
