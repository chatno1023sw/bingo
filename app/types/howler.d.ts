declare module "howler" {
  /**
   * 再生終了時に呼び出されるコールバックです。
   */
  export type HowlCallback = () => void;

  /**
   * Howl の初期化オプションです。
   */
  export type HowlOptions = {
    /** 音声ソース */
    src: string[];
    /** 事前読み込みフラグ */
    preload?: boolean;
    /** 再生終了時の処理 */
    onend?: HowlCallback;
    /** 読み込み失敗時の処理 */
    onloaderror?: HowlCallback;
    /** 再生失敗時の処理 */
    onplayerror?: HowlCallback;
  };

  /**
   * Howler の音声再生クラスです。
   */
  export class Howl {
    constructor(options: HowlOptions);
    play(): number;
    stop(): void;
    seek(seek?: number): number;
    volume(value: number): number;
    unload(): void;
  }
}
