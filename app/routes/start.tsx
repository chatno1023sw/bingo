import { useState } from "react";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useNavigation, useSubmit } from "react-router";
import { startSession, resumeSession } from "~/common/services/sessionService";
import { StartMenu } from "~/components/start/StartMenu";
import { ContinueDialog } from "~/components/start/ContinueDialog";
import { BgmToggle } from "~/components/common/BgmToggle";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";

export const loader = async (_args: LoaderFunctionArgs) => {
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "start") {
    await startSession();
    return redirect("/game");
  }

  if (intent === "resume") {
    const resumed = await resumeSession();
    if (resumed) {
      return redirect("/game");
    }
    await startSession();
    return redirect("/game");
  }

  if (intent === "setting") {
    return redirect("/setting");
  }

  return Response.json({ error: "unsupported-intent" }, { status: 400 });
};

/**
 * Start 画面のルートコンポーネント。
 *
 * - Chrome DevTools MCP の SF-START-001〜003 を想定し、BGM トグル状態を localStorage と同期します。
 * - loader / action から得られるサーバーイベントは useSubmit 経由で発火し、画面や音声の初期化を統制します。
 */
export default function StartRoute() {
  const [continueDialogOpen, setContinueDialogOpen] = useState(false);
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";
  const { preference, isReady: isBgmReady, toggle: toggleBgm, error: bgmError } = useBgmPreference();
  const bgmDisabled = !isBgmReady || isSubmitting;

  const handleStart = () => {
    submit(
      { intent: "start" },
      {
        method: "post",
      },
    );
  };

  const handleResumeConfirm = () => {
    submit(
      { intent: "resume" },
      {
        method: "post",
      },
    );
    setContinueDialogOpen(false);
  };

  const handleSetting = () => {
    submit(
      { intent: "setting" },
      {
        method: "post",
      },
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10 text-slate-900">
      <div className="absolute right-8 top-8">
        <BgmToggle enabled={preference.enabled} onToggle={() => toggleBgm()} disabled={bgmDisabled} />
      </div>
      {bgmError ? (
        <p className="absolute right-6 top-20 text-xs text-rose-500">BGM 設定の保存に失敗しました</p>
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
