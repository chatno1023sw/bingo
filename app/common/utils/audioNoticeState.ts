const AUDIO_NOTICE_ACK_KEY = "bingo.v1.audioNoticeAck";

const getSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage ?? null;
};

export const hasAudioNoticeAcknowledged = (): boolean => {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }
  return storage.getItem(AUDIO_NOTICE_ACK_KEY) === "1";
};

export const markAudioNoticeAcknowledged = (): void => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  storage.setItem(AUDIO_NOTICE_ACK_KEY, "1");
};
