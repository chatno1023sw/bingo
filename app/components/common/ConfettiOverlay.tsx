import { type CSSProperties, memo, useMemo } from "react";
import { confettiColors, confettiConstants } from "~/common/constants/confetti";
import "./confetti.css";

type ConfettiPieceConfig = {
  id: string;
  style: Record<string, string>;
  isRibbon?: boolean;
};

type ConfettiOverlayProps = {
  active: boolean;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const generateSize = () => {
  const isRibbon = Math.random() < confettiConstants.ribbonProbability;
  if (isRibbon) {
    return {
      isRibbon,
      w: rand(6, 10),
      h: rand(34, 70),
      flutterDur: `${Math.round(rand(800, 1400))}ms`,
    };
  }
  const isLong = Math.random() < confettiConstants.longPieceProbability;
  return {
    isRibbon,
    w: rand(4, 8),
    h: isLong ? rand(14, 22) : rand(9, 14),
    flutterDur: `${Math.round(rand(900, 1500))}ms`,
  };
};

const generateRainPieces = (): ConfettiPieceConfig[] => {
  const [minRainDelay, maxRainDelay] = confettiConstants.rainAnimationDelayRangeMs;
  const [minRainDuration, maxRainDuration] = confettiConstants.rainDurationRangeMs;
  return Array.from({ length: confettiConstants.rainCount }).map((_, index) => {
    const size = generateSize();
    const fallDuration = Math.round(rand(minRainDuration, maxRainDuration));
    const delay = Math.max(
      0,
      Math.round(rand(minRainDelay, maxRainDelay)) - confettiConstants.rainDelayAdvanceMs,
    );
    return {
      id: `rain-${index}`,
      isRibbon: size.isRibbon,
      style: {
        "--c": pick(confettiColors),
        "--x": `${rand(0, 100)}vw`,
        "--drift": `${rand(-12, 12)}vw`,
        "--spin": `${rand(720, 1600)}deg`,
        "--dur": `${fallDuration}ms`,
        "--delay": `${delay}ms`,
        "--w": `${size.w.toFixed(1)}px`,
        "--h": `${size.h.toFixed(1)}px`,
        "--s": `${rand(0.7, 1.2).toFixed(2)}`,
        "--flutterDur": size.flutterDur,
      },
    };
  });
};

export const ConfettiOverlay = memo(({ active }: ConfettiOverlayProps) => {
  const rainPieces = useMemo(() => generateRainPieces(), []);

  if (!active) {
    return null;
  }

  const renderPieces = (pieces: ConfettiPieceConfig[]) =>
    pieces.map((piece) => (
      <span
        key={piece.id}
        className={piece.isRibbon ? "confetti-piece ribbon" : "confetti-piece"}
        style={piece.style as CSSProperties}
      />
    ));

  return (
    <div className="confetti-overlay" aria-hidden>
      <div className="confetti-overlay__layer">{renderPieces(rainPieces)}</div>
    </div>
  );
});
ConfettiOverlay.displayName = "ConfettiOverlay";
