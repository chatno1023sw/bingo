import { useState } from "react";
import { useNavigate } from "react-router";
import { startSession, resumeSession } from "~/common/services/sessionService";
import { StartMenu } from "~/components/start/StartMenu";
import { ContinueDialog } from "~/components/start/ContinueDialog";
import { BgmToggle } from "~/components/common/BgmToggle";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";

/**
 * Start 画面のルートコンポーネント。
 *
 * - Chrome DevTools MCP の SF-START-001〜003 を想定し、BGM トグル状態を localStorage と同期します。
 * - 画面遷移の前に localStorage を更新し、ブラウザ完結のフローで開始状態を整えます。
 */
export default function StartRoute() {
  const [continueDialogOpen, setContinueDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const {
    preference,
    isReady: isBgmReady,
    toggle: toggleBgm,
    error: bgmError,
  } = useBgmPreference();
  const bgmDisabled = !isBgmReady || isSubmitting;

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

  const handleResumeConfirm = async () => {
    setIsSubmitting(true);
    try {
      const resumed = await resumeSession();
      if (!resumed) {
        await startSession();
      }
      setIsSubmitting(false);
      setContinueDialogOpen(false);
      navigate("/game");
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleSetting = () => {
    navigate("/setting");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10 text-slate-900">
      <div className="absolute right-8 top-8">
        <BgmToggle
          enabled={preference.enabled}
          onToggle={() => toggleBgm()}
          disabled={bgmDisabled}
        />
      </div>
      {bgmError ? (
        <p className="absolute right-6 top-20 text-xs text-rose-500">
          BGM 設定の保存に失敗しました
        </p>
      ) : null}
      <div className="flex min-h-[360px] items-center justify-center">
        <StartMenu
          onStart={handleStart}
          onResumeRequest={() => setContinueDialogOpen(true)}
          onNavigateSetting={handleSetting}
          isSubmitting={isSubmitting}
        />
      </div>
      <ContinueDialog
        open={continueDialogOpen}
        onConfirm={handleResumeConfirm}
        onCancel={() => setContinueDialogOpen(false)}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
