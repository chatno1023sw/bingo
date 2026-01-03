declare module "react-custom-roulette" {
  import type { ComponentType } from "react";

  /**
   * ルーレット表示データの 1 つ分。
   */
  export type WheelDataItem = {
    /** 表示ラベル */
    option: string;
    /** セグメントの表示スタイル */
    style?: {
      /** 背景色 */
      backgroundColor?: string;
      /** 文字色 */
      textColor?: string;
    };
  };

  /**
   * ルーレットコンポーネントのプロパティ。
   */
  export type WheelProps = {
    /** 回転開始フラグ */
    mustStartSpinning: boolean;
    /** 当選セグメントのインデックス */
    prizeNumber: number;
    /** セグメントデータ */
    data: WheelDataItem[];
    /** 回転時間（秒） */
    spinDuration?: number;
    /** 外枠の色 */
    outerBorderColor?: string;
    /** 外枠の太さ */
    outerBorderWidth?: number;
    /** 放射線の色 */
    radiusLineColor?: string;
    /** 文字の距離 */
    textDistance?: number;
    /** 回転完了時のコールバック */
    onStopSpinning?: () => void;
  };

  export const Wheel: ComponentType<WheelProps>;
}
