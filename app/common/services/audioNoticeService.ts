const AUDIO_NOTICE_COOKIE_NAME = "bingo.v1.audioNotice";
const AUDIO_NOTICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const isBrowser = (): boolean => typeof document !== "undefined";

const getCookieValue = (): string | null => {
  if (!isBrowser()) {
    return null;
  }
  const entries = document.cookie.split(";").map((entry) => entry.trim());
  const target = entries.find((entry) => entry.startsWith(`${AUDIO_NOTICE_COOKIE_NAME}=`));
  if (!target) {
    return null;
  }
  const [, value = ""] = target.split("=");
  return decodeURIComponent(value);
};

const ensureCookieNotExpired = (value: string | null): boolean => {
  if (!value) {
    return false;
  }
  const acknowledgedAt = new Date(value);
  if (!Number.isFinite(acknowledgedAt.getTime())) {
    return false;
  }
  const elapsedMs = Date.now() - acknowledgedAt.getTime();
  return elapsedMs < AUDIO_NOTICE_COOKIE_MAX_AGE_SECONDS * 1000;
};

/**
 * 音量注意ダイアログを表示する必要があるか判定します。
 *
 * - 副作用: ありません。
 * - 入力制約: ブラウザ環境であることを想定します。
 * - 戻り値: Cookie が期限切れ、または存在しない場合に true を返します。
 * - Chrome DevTools MCP では document.cookie を書き換えて判定結果を確認します。
 */
export const shouldShowAudioNotice = (): boolean => {
  if (!isBrowser()) {
    return false;
  }
  return !ensureCookieNotExpired(getCookieValue());
};

/**
 * 音量注意ダイアログを確認済みとして記録します。
 *
 * - 副作用: document.cookie に 1 週間で失効する値を書き込みます。
 * - 入力制約: ブラウザ環境で呼び出してください。
 * - 戻り値: ありません。
 * - Chrome DevTools MCP では Cookie の値と max-age を確認します。
 */
export const markAudioNoticeAcknowledged = (): void => {
  if (!isBrowser()) {
    return;
  }
  const value = encodeURIComponent(new Date().toISOString());
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie API 設定を行うために直接代入します。
  document.cookie = `${AUDIO_NOTICE_COOKIE_NAME}=${value}; path=/; max-age=${AUDIO_NOTICE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
};
