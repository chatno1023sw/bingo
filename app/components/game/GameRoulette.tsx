import { useEffect, useMemo, useState, type ReactNode } from "react";

type WheelComponentType = typeof import("react-custom-roulette")["Wheel"];

export type GameRouletteProps = {
  numbers: number[];
  currentNumber: number | null;
  spinning: boolean;
  className?: string;
  placeholder?: ReactNode;
};

/**
 * Game 画面中央のルーレット演出。
 * react-custom-roulette は `mustStartSpinning` が true → false に遷移するときのみ回転するため、
 * 親コンポーネントからの `spinning` を監視して内部状態を更新する。
 */
export const GameRoulette = ({
  numbers,
  currentNumber,
  spinning,
  className,
  placeholder,
}: GameRouletteProps) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [WheelComponent, setWheelComponent] = useState<WheelComponentType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    let mounted = true;
    import("react-custom-roulette").then((module) => {
      if (mounted) {
        setWheelComponent(() => module.Wheel);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (spinning) {
      setMustSpin(true);
    }
  }, [spinning]);

  const data = useMemo(
    () =>
      numbers.map((value) => ({
        option: value.toString(),
        style: {
          backgroundColor: value % 2 === 0 ? "#E2E8F0" : "#F8FAFC",
          textColor: "#0F172A",
        },
      })),
    [numbers],
  );

  const prizeIndex = useMemo(() => {
    if (currentNumber == null) {
      return 0;
    }
    const index = numbers.indexOf(currentNumber);
    return index >= 0 ? index : 0;
  }, [currentNumber, numbers]);

  const wrapperClassName =
    className ?? "rounded-3xl border border-indigo-500/30 bg-slate-900/70 p-6 shadow-2xl";

  return (
    <div className={wrapperClassName}>
      {WheelComponent ? (
        <WheelComponent
          mustStartSpinning={mustSpin}
          prizeNumber={prizeIndex}
          data={data}
          spinDuration={0.8}
          outerBorderColor="#CBD5F5"
          outerBorderWidth={4}
          radiusLineColor="#E2E8F0"
          textDistance={70}
          onStopSpinning={() => {
            setMustSpin(false);
          }}
        />
      ) : (
        (placeholder ?? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-slate-600">
            <span className="font-semibold text-sm">ルーレットを読み込み中...</span>
            <span className="text-slate-400 text-xs">ブラウザが準備でき次第、演出を表示します</span>
          </div>
        ))
      )}
    </div>
  );
};
