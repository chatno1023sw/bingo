import { useState } from "react";
import { useNavigate } from "react-router";
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

  if (activeView === views.start) {
    return (
      <StartView
        onShowGame={() => setActiveView(views.game)}
        onNavigateSetting={() => navigate("/setting")}
      />
    );
  }

  return (
    <SoundProvider enabled>
      <GameContent onNavigateStart={() => setActiveView(views.start)} />
    </SoundProvider>
  );
}
