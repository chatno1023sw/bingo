declare module "papaparse" {
  /**
   * CSV 解析時のエラー情報。
   */
  export type ParseError = {
    /** エラー種別 */
    type: string;
    /** エラーコード */
    code: string;
    /** エラーメッセージ */
    message: string;
    /** 対象行番号 */
    row: number;
  };

  /**
   * CSV 解析結果。
   */
  export type ParseResult<T> = {
    /** 解析済みデータ */
    data: T[];
    /** エラー一覧 */
    errors: ParseError[];
    /** 解析時のメタ情報 */
    meta: {
      /** 区切り文字 */
      delimiter: string;
      /** 改行コード */
      linebreak: string;
      /** 中断フラグ */
      aborted: boolean;
      /** 途中打ち切りフラグ */
      truncated: boolean;
      /** 読み取り位置 */
      cursor: number;
      /** ヘッダー一覧 */
      fields?: string[];
    };
  };

  /**
   * CSV 解析設定。
   */
  export type ParseConfig<_T> = {
    /** ヘッダー行を有効化するかどうか */
    header?: boolean;
    /** 空行をスキップするかどうか */
    skipEmptyLines?: boolean;
  };

  export const parse: <T>(input: string, config: ParseConfig<T>) => ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
