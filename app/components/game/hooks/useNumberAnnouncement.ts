import { Howl } from "howler";
import { useCallback, useEffect, useRef } from "react";
import {
  audioSettings,
  buildLetterVoicePath,
  buildNumberVoicePath,
  resolveAudioPath,
} from "~/common/constants/audio";
import { bingoNumberRanges } from "~/common/constants/bingo";

export type UseNumberAnnouncementParams = {
  /** 読み上げ音量 */
  voiceVolume: number;
  /** 効果音音量 */
  soundVolume: number;
};

export type UseNumberAnnouncementResult = {
  /** 抽選開始時に呼び出し、読み上げを準備します */
  prepareAnnouncement: (shouldAnnounce: boolean) => void;
  /** 読み上げを取り消します */
  cancelAnnouncement: () => void;
  /** 表示番号の更新時に呼び出します */
  handleCurrentNumberChange: (currentNumber: number | null) => void;
};

/**
 * 番号読み上げのシーケンスを管理します。
 *
 * - 副作用: Howler のインスタンスを生成/破棄します。
 * - 入力制約: 音量は 0〜1 の範囲を想定します。
 * - 戻り値: 準備と番号更新のハンドラを返します。
 * - Chrome DevTools MCP では抽選後に番号読み上げが行われることを確認します。
 */
export const useNumberAnnouncement = ({
  voiceVolume,
  soundVolume,
}: UseNumberAnnouncementParams): UseNumberAnnouncementResult => {
  const numberVoiceRef = useRef<Howl | null>(null);
  const letterVoiceRef = useRef<Howl | null>(null);
  const pendingAnnounceRef = useRef(false);
  const pendingNumberRef = useRef<number | null>(null);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnnouncedRef = useRef<number | null>(null);
  const ANNOUNCE_DELAY_MS = audioSettings.number.announceDelayMs;

  const cleanupVoice = useCallback((voiceRef: React.MutableRefObject<Howl | null>) => {
    if (voiceRef.current) {
      voiceRef.current.stop();
      voiceRef.current.unload();
      voiceRef.current = null;
    }
  }, []);

  const playVoiceClip = useCallback(
    (src: string, targetRef: React.MutableRefObject<Howl | null>, onEnd?: () => void) => {
      cleanupVoice(targetRef);
      const voice = new Howl({
        src: [resolveAudioPath(src)],
        preload: true,
        volume: voiceVolume * audioSettings.number.voicePlaybackScale,
        onend: () => {
          voice.unload();
          if (targetRef.current === voice) {
            targetRef.current = null;
          }
          onEnd?.();
        },
        onloaderror: () => {
          onEnd?.();
        },
        onplayerror: () => {
          onEnd?.();
        },
      });
      targetRef.current = voice;
      voice.play();
    },
    [cleanupVoice, voiceVolume],
  );

  const playAnnouncementVoice = useCallback(
    (number: number) => {
      if (soundVolume <= 0 || voiceVolume <= 0) {
        return;
      }
      const letter = bingoNumberRanges.getLetter(number);
      const playNumber = () => {
        playVoiceClip(buildNumberVoicePath(number), numberVoiceRef);
      };
      if (!letter) {
        playNumber();
        return;
      }
      playVoiceClip(buildLetterVoicePath(letter), letterVoiceRef, playNumber);
    },
    [playVoiceClip, soundVolume, voiceVolume],
  );

  const tryAnnounceNumber = useCallback(() => {
    if (!pendingAnnounceRef.current) {
      return;
    }
    const number = pendingNumberRef.current;
    if (number === null) {
      return;
    }
    if (lastAnnouncedRef.current === number) {
      pendingAnnounceRef.current = false;
      pendingNumberRef.current = null;
      return;
    }
    const timerId = announceTimerRef.current;
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    announceTimerRef.current = setTimeout(() => {
      playAnnouncementVoice(number);
      lastAnnouncedRef.current = number;
      pendingAnnounceRef.current = false;
      pendingNumberRef.current = null;
      announceTimerRef.current = null;
    }, ANNOUNCE_DELAY_MS);
  }, [ANNOUNCE_DELAY_MS, playAnnouncementVoice]);

  const cancelAnnouncement = useCallback(() => {
    pendingAnnounceRef.current = false;
    pendingNumberRef.current = null;
    const timerId = announceTimerRef.current;
    if (timerId !== null) {
      clearTimeout(timerId);
      announceTimerRef.current = null;
    }
  }, []);

  const prepareAnnouncement = useCallback(
    (shouldAnnounce: boolean) => {
      pendingAnnounceRef.current = shouldAnnounce && soundVolume > 0;
      pendingNumberRef.current = null;
      if (!pendingAnnounceRef.current) {
        const timerId = announceTimerRef.current;
        if (timerId !== null) {
          clearTimeout(timerId);
          announceTimerRef.current = null;
        }
      }
    },
    [soundVolume],
  );

  const handleCurrentNumberChange = useCallback(
    (currentNumber: number | null) => {
      if (currentNumber === null) {
        return;
      }
      pendingNumberRef.current = currentNumber;
      tryAnnounceNumber();
    },
    [tryAnnounceNumber],
  );

  useEffect(
    () => () => {
      cleanupVoice(numberVoiceRef);
      cleanupVoice(letterVoiceRef);
      const timerId = announceTimerRef.current;
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    },
    [cleanupVoice],
  );

  return { prepareAnnouncement, cancelAnnouncement, handleCurrentNumberChange };
};
