/**
 * 音声アセットの相対パス一覧です。
 *
 * - 副作用: なし。
 * - 入力制約: なし。
 * - 戻り値: BGM/SE/番号音声の相対パスを返します。
 * - Chrome DevTools MCP では該当パスの音声が再生されることを確認します。
 */
export const audioPaths = {
  bgm: {
    start: "bgm/start.mp3",
    game: "bgm/game.mp3",
  },
  se: {
    drumroll: "se/drumroll.mp3",
    cymbal: "se/cymbal.mp3",
    button: "se/button-se.mp3",
    buttonCancel: "se/button-cancel-se.mp3",
    hover: "se/hover-se.mp3",
  },
  number: {
    dir: "number",
    ext: "wav",
  },
} as const;

/**
 * 音声再生に関する設定値です。
 *
 * - 副作用: なし。
 * - 入力制約: なし。
 * - 戻り値: 音量や遅延などの設定値を返します。
 * - Chrome DevTools MCP では音量バランスと再生タイミングを確認します。
 */
const DEFAULT_BGM_PLAYBACK_SCALE = 0.5;

type SliderRange = {
  min: number;
  max: number;
};

const sliderMedian = (range: SliderRange): number => (range.min + range.max) / 2;

const VOLUME_RANGE: SliderRange = { min: 0, max: 1 };
const DETAIL_RANGE: SliderRange = { min: 0, max: 2 };

export const audioSettings = {
  bgm: {
    volumeRange: VOLUME_RANGE,
    defaultVolume: sliderMedian(VOLUME_RANGE),
    startDefaultVolume: sliderMedian(VOLUME_RANGE),
    startVolumeScale: DEFAULT_BGM_PLAYBACK_SCALE,
    gameVolumeScale: DEFAULT_BGM_PLAYBACK_SCALE,
  },
  se: {
    volumeRange: VOLUME_RANGE,
    defaultVolume: sliderMedian(VOLUME_RANGE),
    /** スライダーで調整される音量の最大値 */
    baseVolumeScale: 0.9,
    drumrollRange: DETAIL_RANGE,
    drumrollVolumeScale: sliderMedian(DETAIL_RANGE),
    cymbalRange: DETAIL_RANGE,
    cymbalVolumeScale: sliderMedian(DETAIL_RANGE),
    fallbackWaitMs: 5000,
  },
  number: {
    voiceRange: VOLUME_RANGE,
    voiceVolume: sliderMedian(VOLUME_RANGE),
    /** 番号再生開始を早める秒数 */
    announceDelayMs: 350,
  },
} as const;

/**
 * 音声パスに BASE_URL を付与します。
 *
 * - 副作用: なし。
 * - 入力制約: `path` は `audioPaths` の値を渡してください。
 * - 戻り値: BASE_URL 付きの音声パスを返します。
 * - Chrome DevTools MCP ではパスが正しく解決されることを確認します。
 */
export const resolveAudioPath = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

/**
 * 番号音声の相対パスを生成します。
 *
 * - 副作用: なし。
 * - 入力制約: `number` は 1〜75 の範囲で渡してください。
 * - 戻り値: 番号音声の相対パスを返します。
 * - Chrome DevTools MCP では指定番号の音声が再生されることを確認します。
 */
export const buildNumberVoicePath = (number: number): string =>
  `${audioPaths.number.dir}/${number}.${audioPaths.number.ext}`;
