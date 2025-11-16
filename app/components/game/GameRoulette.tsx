import { useEffect, useMemo, useState } from "react";
import { Wheel } from "react-custom-roulette";

export type GameRouletteProps = {
  numbers: number[];
  currentNumber: number | null;
  spinning: boolean;
};

/**
 * Game 画面中央のルーレット演出。
 * react-custom-roulette は `mustStartSpinning` が true → false に遷移するときのみ回転するため、
 * 親コンポーネントからの `spinning` を監視して内部状態を更新する。
 */
export const GameRoulette = ({ numbers, currentNumber, spinning }: GameRouletteProps) => {
  const [mustSpin, setMustSpin] = useState(false);

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
          backgroundColor: value % 2 === 0 ? "#4338CA" : "#312E81",
          textColor: "#F8FAFC",
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

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/70 p-6 shadow-2xl">
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeIndex}
        data={data}
        spinDuration={0.8}
        outerBorderColor="#818CF8"
        outerBorderWidth={8}
        radiusLineColor="#312E81"
        textDistance={80}
        onStopSpinning={() => {
          setMustSpin(false);
        }}
      />
    </div>
  );
};
