/**
 * BGM 設定の永続化モデル。
 */
export type BgmPreference = {
  /** BGM の有効状態 */
  enabled: boolean;
  /** BGM の音量 */
  volume: number;
  /** 更新日時（ISO 8601 形式） */
  updatedAt: string;
};
