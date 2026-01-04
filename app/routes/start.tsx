import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  hasStoredDrawHistory,
  hasStoredGameState,
  hasStoredPrizeSelection,
  resumeSession,
  startSession,
} from "~/common/services/sessionService";
import { StartMenu } from "~/components/start/StartMenu";
import { StartOverDialog } from "~/components/start/StartOverDialog";

/**
 * Start 画面のルートコンポーネント。
 *
 * - Chrome DevTools MCP の SF-START-001〜003 を想定し、BGM トグル状態を localStorage と同期します。
 * - 画面遷移の前に localStorage を更新し、ブラウザ完結のフローで開始状態を整えます。
 */
export default function StartRoute() {
  const [startOverDialogOpen, setStartOverDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const navigate = useNavigate();
  // const {
  //   preference,
  //   isReady: isBgmReady,
  //   toggle: toggleBgm,
  //   error: bgmError,
  // } = useBgmPreference();
  // const bgmDisabled = !isBgmReady || isSubmitting;

  /**
   * セッション開始処理を実行します。
   *
   * - 副作用: セッション開始 API を呼び出し、画面遷移します。
   * - 入力制約: なし。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では Start→Game の遷移を確認します。
   */
  const handleStart = async () => {
    setIsSubmitting(true);
    try {
      await startSession();
      setIsSubmitting(false);
      navigate("/game");
    } catch {
      setIsSubmitting(false);
    }
  };

  /**
   * 「はじめから」押下時の処理です。
   *
   * - 副作用: 必要に応じて確認ダイアログを開きます。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では確認ダイアログの表示を確認します。
   */
  const handleStartRequest = () => {
    if (isSubmitting) {
      return;
    }
    if (hasStoredGameState() || hasStoredDrawHistory() || hasStoredPrizeSelection()) {
      setStartOverDialogOpen(true);
      return;
    }
    void handleStart();
  };

  /**
   * 「続きから」確定時の処理です。
   *
   * - 副作用: セッション復元/開始と画面遷移を行います。
   * - 入力制約: なし。
   * - 戻り値: Promise を返します。
   * - Chrome DevTools MCP では続きからの遷移を確認します。
   */
  const handleResumeConfirm = async () => {
    setIsSubmitting(true);
    try {
      const resumed = await resumeSession();
      if (!resumed) {
        await startSession();
      }
      setIsSubmitting(false);
      navigate("/game");
    } catch {
      setIsSubmitting(false);
    }
  };

  /**
   * 設定画面へ遷移します。
   *
   * - 副作用: 画面遷移を実行します。
   * - 入力制約: なし。
   * - 戻り値: なし。
   * - Chrome DevTools MCP では Setting 画面への遷移を確認します。
   */
  const handleSetting = () => {
    navigate("/setting");
  };

  useEffect(() => {
    setCanResume(hasStoredGameState());
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <div className="absolute top-8 right-8">
        {/* todo: あとで実装したい */}
        {/* <BgmToggle
          enabled={preference.enabled}
          onToggle={() => toggleBgm()}
          disabled={bgmDisabled}
        /> */}
      </div>
      <div className="flex min-h-90 items-center justify-center">
        <StartMenu
          onStart={handleStartRequest}
          onResumeRequest={() => void handleResumeConfirm()}
          onNavigateSetting={handleSetting}
          isSubmitting={isSubmitting}
          canResume={canResume}
        />
      </div>
      <StartOverDialog
        open={startOverDialogOpen}
        onClose={() => setStartOverDialogOpen(false)}
        onConfirm={() => {
          setStartOverDialogOpen(false);
          void handleStart();
        }}
        disabled={isSubmitting}
      />
    </main>
  );
}
