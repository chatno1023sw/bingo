import { type ReactNode, useEffect, useMemo, useState } from "react";

/**
 * react-custom-roulette の Wheel コンポーネント型。
 */
type WheelComponentType = typeof import("react-custom-roulette")["Wheel"];

export type GameRouletteProps = {
  /** ルーレットに表示する番号一覧 */
  numbers: number[];
  /** 現在の当選番号 */
  currentNumber: number | null;
  /** 回転状態 */
  spinning: boolean;
  /** ラッパーの追加クラス */
  className?: string;
  /** 代替表示の要素 */
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
          backgroundColor: value % 2 === 0 ? "hsl(var(--muted))" : "hsl(var(--background))",
          textColor: "hsl(var(--foreground))",
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

  const wrapperClassName = className ?? "rounded-3xl border border-border bg-card p-6 shadow-2xl";

  return (
    <div className={wrapperClassName}>
      {WheelComponent ? (
        <WheelComponent
          mustStartSpinning={mustSpin}
          prizeNumber={prizeIndex}
          data={data}
          spinDuration={0.8}
          outerBorderColor="hsl(var(--border))"
          outerBorderWidth={4}
          radiusLineColor="hsl(var(--muted))"
          textDistance={70}
          onStopSpinning={() => {
            setMustSpin(false);
          }}
        />
      ) : (
        (placeholder ?? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-sm">ルーレットを読み込み中...</span>
            <span className="text-xs">ブラウザが準備でき次第、演出を表示します</span>
          </div>
        ))
      )}
    </div>
  );
};
