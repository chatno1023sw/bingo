import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  hasStoredDrawHistory,
  hasStoredGameState,
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

  const handleStartRequest = () => {
    if (isSubmitting) {
      return;
    }
    if (hasStoredDrawHistory()) {
      setStartOverDialogOpen(true);
      return;
    }
    void handleStart();
  };

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
