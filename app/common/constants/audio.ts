import type { BingoLetter } from "~/common/constants/bingo";

/**
 * 音声アセットの相対パス一覧です。
 *
 * - 副作用: なし。
 * - 入力制約: なし。
 * - 戻り値: BGM/SE/番号音声の相対パスを返します。
 * - Chrome DevTools MCP では該当パスの音声が再生されることを確認します。
 */
/**
 * 音声アセットの相対パス定義です。
 *
 * - 副作用: ありません。
 * - 入力制約: 既存ファイル構成に合わせたキーのみ追加してください。
 * - 戻り値: BGM・効果音・番号読み上げのファイルパスをまとめて返します。
 * - Chrome DevTools MCP では各音源が設定通り再生されることを確認します。
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
  letter: {
    dir: "roulette-letter",
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
const BUTTON_ATTENUATION = 0.1;
const BGM_ATTENUATION = 0.1;
const VOICE_BOOST = 1;
const DRUMROLL_BOOST = 2;
const CYMBAL_BOOST = 1;

type SliderRange = {
  min: number;
  max: number;
};

/**
 * スライダー範囲の中央値を算出します。
 *
 * - 副作用: ありません。
 * - 入力制約: `range.min <= range.max` を渡してください。
 * - 戻り値: `(min + max) / 2` を返します。
 * - Chrome DevTools MCP では音量スライダーの初期位置が中央値であることを確認します。
 */
const sliderMedian = (range: SliderRange): number => (range.min + range.max) / 2;

const VOLUME_RANGE: SliderRange = { min: 0, max: 1 };
const DETAIL_RANGE: SliderRange = { min: 0, max: 2 };
const MEDIAN_VOLUME = sliderMedian(VOLUME_RANGE);
const MEDIAN_DETAIL = sliderMedian(DETAIL_RANGE);

/**
 * 音量・再生スケールの設定値です。
 *
 * - 副作用: ありません。
 * - 入力制約: 各キーの値は 0〜1（または定義済み範囲）に収めてください。
 * - 戻り値: BGM/SE/読み上げ向けの設定オブジェクトを返します。
 * - Chrome DevTools MCP では設定変更が UI に反映されることを確認します。
 */
export const audioSettings = {
  bgm: {
    /** BGM スライダーの音量範囲です。 */
    volumeRange: VOLUME_RANGE,
    /** 全画面共通の BGM 初期音量です。 */
    defaultVolume: MEDIAN_VOLUME,
    /** Start 画面専用の BGM 初期音量です。 */
    startDefaultVolume: MEDIAN_VOLUME,
    /** Start BGM 再生時に掛ける減衰スケールです。 */
    startVolumeScale: DEFAULT_BGM_PLAYBACK_SCALE * BGM_ATTENUATION,
    /** Game BGM 再生時に掛ける減衰スケールです。 */
    gameVolumeScale: DEFAULT_BGM_PLAYBACK_SCALE * BGM_ATTENUATION,
  },
  se: {
    /** 効果音スライダーの音量範囲です。 */
    volumeRange: VOLUME_RANGE,
    /** 効果音スライダーの初期音量です。 */
    defaultVolume: MEDIAN_VOLUME,
    /** ボタン効果音の最大ゲインスケールです。 */
    baseVolumeScale: 0.9 * BUTTON_ATTENUATION,
    /** ドラムロール倍率の範囲です。 */
    drumrollRange: DETAIL_RANGE,
    /** ドラムロール倍率の初期値です。 */
    drumrollVolumeScale: MEDIAN_DETAIL,
    /** ドラムロールへ掛ける増幅倍率です。 */
    drumrollBoost: DRUMROLL_BOOST,
    /** シンバル倍率の範囲です。 */
    cymbalRange: DETAIL_RANGE,
    /** シンバル倍率の初期値です。 */
    cymbalVolumeScale: MEDIAN_DETAIL,
    /** シンバルへ掛ける増幅倍率です。 */
    cymbalBoost: CYMBAL_BOOST,
    /** 効果音フェイルオーバーまでの待機時間（ミリ秒）です。 */
    fallbackWaitMs: 5000,
  },
  number: {
    /** 読み上げ音声スライダーの音量範囲です。 */
    voiceRange: VOLUME_RANGE,
    /** 読み上げ音声の初期音量です。 */
    voiceVolume: MEDIAN_VOLUME,
    /** 読み上げ再生時に掛ける増幅スケールです。 */
    voicePlaybackScale: VOICE_BOOST,
    /** 番号再生を早める遅延短縮時間（ミリ秒）です。 */
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

/**
 * ルーレット文字音声の相対パスを生成します。
 *
 * - 副作用: なし。
 * - 入力制約: `letter` は BINGO のいずれかの文字を渡してください。
 * - 戻り値: BINGO 文字音声の相対パスを返します。
 * - Chrome DevTools MCP では指定文字の音声が再生されることを確認します。
 */
export const buildLetterVoicePath = (letter: BingoLetter): string =>
  `${audioPaths.letter.dir}/${letter}.${audioPaths.letter.ext}`;
