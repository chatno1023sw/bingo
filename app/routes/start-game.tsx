import { useState } from "react";
import { useNavigate } from "react-router";
import { AudioPreferenceProvider } from "~/common/contexts/AudioPreferenceContext";
import { AudioNoticeProvider } from "~/common/contexts/AudioNoticeContext";
import { SoundProvider } from "~/common/contexts/SoundContext";
import { GameContent } from "~/components/game/GameContent";
import { StartView } from "~/components/start/StartView";

const views = {
  start: "start",
  game: "game",
} as const;

type ActiveView = (typeof views)[keyof typeof views];

export default function StartGameRoute() {
  const [activeView, setActiveView] = useState<ActiveView>(views.start);
  const navigate = useNavigate();

  return (
    <AudioPreferenceProvider>
      <AudioNoticeProvider>
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
      </AudioNoticeProvider>
    </AudioPreferenceProvider>
  );
}
