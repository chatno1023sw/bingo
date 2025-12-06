import { useState } from "react";
import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { useNavigation, useSubmit } from "react-router";
import { startSession, resumeSession } from "~/common/services/sessionService";
import { StartMenu } from "~/components/start/StartMenu";
import { ContinueDialog } from "~/components/start/ContinueDialog";

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

export default function StartRoute() {
  const [continueDialogOpen, setContinueDialogOpen] = useState(false);
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-6 py-10">
      <StartMenu
        onStart={handleStart}
        onResumeRequest={() => setContinueDialogOpen(true)}
        onNavigateSetting={handleSetting}
        isSubmitting={isSubmitting}
      />
      <ContinueDialog
        open={continueDialogOpen}
        onConfirm={handleResumeConfirm}
        onCancel={() => setContinueDialogOpen(false)}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
