declare module "papaparse" {
  export type ParseError = {
    type: string;
    code: string;
    message: string;
    row: number;
  };

  export type ParseResult<T> = {
    data: T[];
    errors: ParseError[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
      fields?: string[];
    };
  };

  export type ParseConfig<T> = {
    header?: boolean;
    skipEmptyLines?: boolean;
  };

  export const parse: <T>(input: string, config: ParseConfig<T>) => ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
