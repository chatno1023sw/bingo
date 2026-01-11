import { Howl } from "howler";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { audioPaths, audioSettings, resolveAudioPath } from "~/common/constants/audio";
import { useBgmPreference } from "~/common/hooks/useBgmPreference";
import { useBgmPlayers } from "~/common/hooks/useBgmPlayers";
import type { Prize } from "~/common/types";
import { CommonDialog } from "~/components/common/CommonDialog";
import { cn } from "~/lib/utils";

export type PrizeRouletteDialogProps = {
  /** ダイアログの表示状態 */
  open: boolean;
  /** 抽選対象の景品一覧 */
  prizes: Prize[];
  /** 閉じる操作 */
  onClose: () => void;
  /** 抽選完了時の通知 */
  onComplete: (prize: Prize) => void;
};

/**
 * 景品ルーレットの抽選ダイアログ。
 *
 * - 開始から 5 秒間、賞名カードのハイライトを切り替え続けます。
 * - 5 秒後に当選カードを 2 回点滅させ、完了時に `onComplete` を呼び出します。
 * - Chrome DevTools MCP では「景品ルーレット」押下でダイアログが表示されることを確認します。
 */
export const PrizeRouletteDialog: FC<PrizeRouletteDialogProps> = ({
  open,
  prizes,
  onClose,
  onComplete,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectableRef = useRef<{ prize: Prize; index: number }[]>([]);
  const prizesRef = useRef<Prize[]>([]);
  const onCompleteRef = useRef<(prize: Prize) => void>(() => undefined);
  const { preference } = useBgmPreference();
  const prizeVoiceRef = useRef<Howl | null>(null);
  const prizeVoiceEndHandlerRef = useRef<() => void>(() => undefined);
  const hasCompletedRef = useRef(false);
  const pendingPrizeRef = useRef<Prize | null>(null);
  const isPrizeVoicePlayingRef = useRef(false);

  const initializeSelectable = useCallback(() => {
    const entries = prizesRef.current.slice(0, 25);
    const selectable = entries
      .map((prize, index) => ({ prize, index }))
      .filter(({ prize }) => !prize.selected);
    selectableRef.current = selectable;
    if (selectable.length === 0) {
      return false;
    }
    setActiveIndex(selectable[0].index);
    setWinnerIndex(null);
    return true;
  }, []);
  const completeRoulette = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const selectable = selectableRef.current;
    if (selectable.length === 0) {
      return;
    }
    const winnerIndex = selectable[Math.floor(Math.random() * selectable.length)].index;
    hasCompletedRef.current = true;
    pendingPrizeRef.current = prizesRef.current[winnerIndex] ?? null;
    setActiveIndex(winnerIndex);
    setWinnerIndex(winnerIndex);
  }, []);

  const stopPrizeVoice = useCallback(() => {
    const prizeVoice = prizeVoiceRef.current;
    if (!prizeVoice) {
      return;
    }
    isPrizeVoicePlayingRef.current = false;
    prizeVoiceEndHandlerRef.current = () => undefined;
    prizeVoice.stop();
  }, []);

  const handlePrizeVoiceEnd = useCallback(() => {
    if (isPrizeVoicePlayingRef.current) {
      stopPrizeVoice();
    }
    const prize = pendingPrizeRef.current;
    pendingPrizeRef.current = null;
    if (prize) {
      onCompleteRef.current(prize);
    }
  }, [stopPrizeVoice]);

  const playPrizeVoice = useCallback(() => {
    const prizeVoice = prizeVoiceRef.current;
    if (!prizeVoice || !pendingPrizeRef.current || preference.volume <= 0) {
      handlePrizeVoiceEnd();
      return;
    }
    const baseVolume = Math.min(
      1,
      Math.max(0, preference.volume * audioSettings.se.baseVolumeScale),
    );
    prizeVoice.volume(baseVolume);
    prizeVoice.stop();
    prizeVoice.seek(0);
    prizeVoiceEndHandlerRef.current = handlePrizeVoiceEnd;
    isPrizeVoicePlayingRef.current = true;
    prizeVoice.play();
  }, [handlePrizeVoiceEnd, preference.volume]);

  const handleCymbalEnd = useCallback(() => {
    if (!pendingPrizeRef.current) {
      return;
    }
    playPrizeVoice();
  }, [playPrizeVoice]);

  const { playDrumroll, stopDrumroll } = useBgmPlayers({
    onDrumrollEnd: completeRoulette,
    onCymbalEnd: handleCymbalEnd,
    enabled: preference.volume > 0,
    volume: preference.volume,
  });

  useEffect(() => {
    const prizeVoice = new Howl({
      src: [resolveAudioPath(audioPaths.se.prizeRoulette)],
      preload: true,
      onend: () => prizeVoiceEndHandlerRef.current(),
      onloaderror: () => prizeVoiceEndHandlerRef.current(),
      onplayerror: () => prizeVoiceEndHandlerRef.current(),
    });
    prizeVoiceRef.current = prizeVoice;
    return () => {
      prizeVoice.stop();
      prizeVoice.unload();
      prizeVoiceRef.current = null;
    };
  }, []);

  useEffect(() => {
    prizesRef.current = prizes;
  }, [prizes]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!open) {
      if (!hasCompletedRef.current) {
        pendingPrizeRef.current = null;
        stopPrizeVoice();
      }
      stopDrumroll();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    hasCompletedRef.current = false;
    if (!initializeSelectable()) {
      pendingPrizeRef.current = null;
      stopPrizeVoice();
      stopDrumroll();
      return;
    }

    playDrumroll();

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const selectable = selectableRef.current;
        if (selectable.length === 0) {
          return prev;
        }
        if (selectable.length === 1) {
          return selectable[0].index;
        }
        let next = selectable[Math.floor(Math.random() * selectable.length)].index;
        if (next === prev) {
          next =
            selectable[
              (Math.floor(Math.random() * (selectable.length - 1)) + 1) % selectable.length
            ].index;
        }
        return next;
      });
    }, 120);

    return () => {
      pendingPrizeRef.current = null;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopPrizeVoice();
      stopDrumroll();
    };
  }, [initializeSelectable, open, playDrumroll, stopDrumroll, stopPrizeVoice]);

  const entries = prizes.slice(0, 25);
  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="景品ルーレット"
      titleClassName="text-xl"
      contentClassName="w-2xl"
    >
      <div className="mt-6 grid grid-cols-5 gap-1.25">
        {entries.map((prize, index) => {
          const isActive = index === activeIndex;
          const isWinner = index === winnerIndex;
          const isDisabled = prize.selected;
          return (
            <div key={prize.id} className="aspect-square">
              <div
                className={cn(
                  "roulette-card flex h-full w-full items-center justify-center text-3xl",
                  isDisabled && "roulette-card--disabled",
                  isActive && !isDisabled && "roulette-card--active",
                  isWinner && !isDisabled && "roulette-card--winner",
                )}
              >
                {prize.prizeName || "賞名未設定"}
              </div>
            </div>
          );
        })}
      </div>
    </CommonDialog>
  );
};
