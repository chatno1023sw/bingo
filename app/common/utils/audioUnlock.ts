const GAME_BGM_UNLOCK_KEY = "bingo.v1.gameBgmUnlocked";
const START_BGM_UNLOCK_KEY = "bingo.v1.startBgmUnlocked";

const getSessionStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage ?? null;
};

/**
 * Game 画面で BGM を解禁するためのフラグを保存します。
 */
export const markGameBgmUnlock = (): void => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  storage.setItem(GAME_BGM_UNLOCK_KEY, "1");
};

/**
 * Game 画面の BGM 解禁フラグを読み取り、消費します。
 */
export const consumeGameBgmUnlock = (): boolean => {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }
  const flag = storage.getItem(GAME_BGM_UNLOCK_KEY) === "1";
  if (flag) {
    storage.removeItem(GAME_BGM_UNLOCK_KEY);
  }
  return flag;
};

export const markStartBgmUnlock = (): void => {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }
  storage.setItem(START_BGM_UNLOCK_KEY, "1");
};

export const consumeStartBgmUnlock = (): boolean => {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }
  const flag = storage.getItem(START_BGM_UNLOCK_KEY) === "1";
  if (flag) {
    storage.removeItem(START_BGM_UNLOCK_KEY);
  }
  return flag;
};
