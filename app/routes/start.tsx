import type { LoaderFunctionArgs, ActionFunctionArgs } from "@react-router/node";
import { json, redirect } from "@react-router/node";
import { startSession, resumeSession } from "~/common/services/sessionService";

export const loader = async () => {
  return json({});
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

  return json({ error: "unsupported-intent" }, { status: 400 });
};

export default function StartRoute() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Start</h1>
        <div className="space-x-4">
          <form method="post">
            <button
              className="rounded bg-blue-600 px-4 py-2 font-semibold text-white"
              name="intent"
              value="start"
              type="submit"
            >
              はじめから
            </button>
          </form>
          <form method="post">
            <button
              className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white"
              name="intent"
              value="resume"
              type="submit"
            >
              続きから
            </button>
          </form>
          <form method="post">
            <button
              className="rounded bg-slate-600 px-4 py-2 font-semibold text-white"
              name="intent"
              value="setting"
              type="submit"
            >
              設定
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
