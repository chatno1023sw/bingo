import { Howl } from "howler";
import type { FC, MouseEventHandler, ReactNode } from "react";
import { useSoundEnabled } from "~/common/contexts/SoundContext";
import { getSoundEffectPreference } from "~/common/services/soundEffectService";
import type { ButtonProps } from "~/components/ui/button";
import { Button as ShadcnButton } from "~/components/ui/button";
import { cn } from "~/lib/utils";

let primarySe: Howl | null = null;
let cancelSe: Howl | null = null;
let hoverSe: Howl | null = null;

const getPrimarySe = (): Howl => {
  if (!primarySe) {
    primarySe = new Howl({
      // maou_se_system23.mp3
      src: ["/button-se.mp3"],
      preload: true,
    });
  }
  return primarySe;
};

const getCancelSe = (): Howl => {
  if (!cancelSe) {
    cancelSe = new Howl({
      // maou_se_system18.mp3
      src: ["/button-cancel-se.mp3"],
      preload: true,
    });
  }
  return cancelSe;
};

const getHoverSe = (): Howl => {
  if (!hoverSe) {
    hoverSe = new Howl({
      // maou_se_system48.mp3
      src: ["/hover-se.mp3"],
      preload: true,
    });
  }
  return hoverSe;
};

const isCancelLabel = (label?: string): boolean => {
  if (!label) {
    return false;
  }
  return label.includes("キャンセル") || label.includes("閉じる") || label.includes("戻る");
};

const hasCancelText = (children: ReactNode): boolean => {
  if (typeof children === "string") {
    return isCancelLabel(children);
  }
  if (Array.isArray(children)) {
    return children.some((child) => hasCancelText(child));
  }
  return false;
};

const playButtonSe = (isCancel: boolean) => {
  if (typeof window === "undefined") {
    return;
  }
  const preference = getSoundEffectPreference();
  if (preference.volume <= 0) {
    return;
  }
  const sound = isCancel ? getCancelSe() : getPrimarySe();
  sound.volume(preference.volume);
  sound.stop();
  sound.play();
};

const playHoverSe = () => {
  if (typeof window === "undefined") {
    return;
  }
  const preference = getSoundEffectPreference();
  if (preference.volume <= 0) {
    return;
  }
  const sound = getHoverSe();
  sound.volume(preference.volume);
  sound.stop();
  sound.play();
};

/**
 * 画面全体で共通利用するボタンコンポーネントです。
 *
 * - 副作用: ありません。
 * - 入力制約: `type` が未指定の場合は `button` を採用します。
 * - 戻り値: `button` 要素を返します。
 * - Chrome DevTools MCP では任意の画面でボタンをクリックし、既存の UI が崩れないことを確認します。
 */
export const Button: FC<ButtonProps> = ({
  type = "button",
  className,
  style,
  onClick,
  onMouseEnter,
  children,
  disabled,
  ...rest
}) => {
  const { enabled: soundEnabled } = useSoundEnabled();
  const ariaLabel = rest["aria-label"];
  const isCancel = isCancelLabel(ariaLabel) || hasCancelText(children);
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!disabled && soundEnabled) {
      playButtonSe(isCancel);
    }
    onClick?.(event);
  };
  const handleMouseEnter: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!disabled && soundEnabled) {
      playHoverSe();
    }
    onMouseEnter?.(event);
  };
  return (
    <ShadcnButton
      className={cn(
        "font-bold text-lg",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        "focus:outline-none",
        className,
      )}
      style={{ WebkitTextStroke: "0.4px currentColor", ...style }}
      type={type}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      disabled={disabled}
      {...rest}
    >
      {children}
    </ShadcnButton>
  );
};
