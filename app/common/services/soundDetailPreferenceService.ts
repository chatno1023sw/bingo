import { audioSettings } from "~/common/constants/audio";
import { readStorageJson, storageKeys, writeStorageJson } from "~/common/utils/storage";

export type SoundDetailPreference = {
  /** 番号読み上げ音量 */
  voiceVolume: number;
  /** ドラムロール音量スケール */
  drumrollVolumeScale: number;
  /** シンバル音量スケール */
  cymbalVolumeScale: number;
};

const DEFAULT_SOUND_DETAIL_PREFERENCE: SoundDetailPreference = {
  voiceVolume: audioSettings.number.voiceVolume,
  drumrollVolumeScale: audioSettings.se.drumrollVolumeScale,
  cymbalVolumeScale: audioSettings.se.cymbalVolumeScale,
};

const MUTED_SOUND_DETAIL_PREFERENCE: SoundDetailPreference = {
  voiceVolume: 0,
  drumrollVolumeScale: 0,
  cymbalVolumeScale: 0,
};

/**
 * 効果音や音声読み上げの詳細設定を取得します。
 *
 * - 副作用: localStorage を読み取ります。
 * - 入力制約: ありません。
 * - 戻り値: 保存済みの設定またはデフォルト値を返します。
 * - Chrome DevTools MCP では localStorage の `bingo.v1.soundDetail` を確認します。
 */
export const getSoundDetailPreference = (): SoundDetailPreference => {
  return readStorageJson<SoundDetailPreference>(storageKeys.soundDetail, {
    ...DEFAULT_SOUND_DETAIL_PREFERENCE,
  });
};

/**
 * 効果音や音声読み上げの詳細設定を保存します。
 *
 * - 副作用: localStorage に書き込みます。
 * - 入力制約: それぞれ 0 以上の数値を渡してください。
 * - 戻り値: ありません。
 * - Chrome DevTools MCP では localStorage の更新内容を確認します。
 */
export const saveSoundDetailPreference = (preference: SoundDetailPreference): void => {
  writeStorageJson(storageKeys.soundDetail, preference);
};

/**
 * 詳細設定をデフォルト値で初期化します。
 *
 * - 副作用: localStorage を上書きします。
 * - 入力制約: ありません。
 * - 戻り値: デフォルト値を返します。
 * - Chrome DevTools MCP では保存後に値が戻ることを確認します。
 */
export const resetSoundDetailPreference = (): SoundDetailPreference => {
  saveSoundDetailPreference(DEFAULT_SOUND_DETAIL_PREFERENCE);
  return DEFAULT_SOUND_DETAIL_PREFERENCE;
};

/**
 * 詳細設定をミュート状態で初期化します。
 *
 * - 副作用: localStorage を上書きします。
 * - 入力制約: ありません。
 * - 戻り値: ミュート状態の値を返します。
 * - Chrome DevTools MCP では値が 0 になることを確認します。
 */
export const muteSoundDetailPreference = (): SoundDetailPreference => {
  saveSoundDetailPreference(MUTED_SOUND_DETAIL_PREFERENCE);
  return MUTED_SOUND_DETAIL_PREFERENCE;
};
