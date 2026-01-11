import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AudioPreferenceProvider } from "~/common/contexts/AudioPreferenceContext";
import { AudioUnlockProvider } from "~/common/contexts/AudioUnlockContext";
import { AudioNoticeProvider } from "~/common/contexts/AudioNoticeContext";
import { SoundProvider } from "~/common/contexts/SoundContext";
import { GameContent } from "~/components/game/GameContent";
import { StartView } from "~/components/start/StartView";

const views = {
  start: "start",
  game: "game",
} as const;

type ActiveView = (typeof views)[keyof typeof views];

const ACTIVE_VIEW_STORAGE_KEY = "bingo.v1.activeView";

const getInitialActiveView = (): ActiveView => {
  if (typeof window === "undefined") {
    return views.start;
  }
  const storage = window.sessionStorage;
  if (!storage) {
    return views.start;
  }
  const stored = storage.getItem(ACTIVE_VIEW_STORAGE_KEY);
  if (stored === views.game) {
    return views.game;
  }
  return views.start;
};

export default function StartGameRoute() {
  const [activeView, setActiveView] = useState<ActiveView>(() => getInitialActiveView());
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storage = window.sessionStorage;
    storage?.setItem(ACTIVE_VIEW_STORAGE_KEY, activeView);
  }, [activeView]);

  return (
    <AudioPreferenceProvider>
      <AudioNoticeProvider>
        <AudioUnlockProvider>
          {activeView === views.start ? (
            <StartView
              onShowGame={() => setActiveView(views.game)}
              onNavigateSetting={() => navigate("/setting")}
            />
          ) : (
            <SoundProvider enabled>
              <GameContent onNavigateStart={() => setActiveView(views.start)} />
            </SoundProvider>
          )}
        </AudioUnlockProvider>
      </AudioNoticeProvider>
    </AudioPreferenceProvider>
  );
}
