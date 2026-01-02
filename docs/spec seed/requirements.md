# 要件定義書

## 0. ドキュメント概要

| 項目 | 内容 |
| --- | --- |
| システム名 | 新年会用 Bingo 抽選アプリケーション |
| 開発スタイル | 仕様書駆動開発（Spec-Driven Development）＋ テスト駆動開発（TDD） |
| 想定開発者 | MCP 対応 AI エージェント（Chrome DevTools MCP, GitMCP, CONTEXT7 MCP, MCP serena 等を利用） |
| 想定利用シーン | 社内新年会などのイベントで、景品付き Bingo 抽選を進行するためのツール |
| ドキュメント言語 | 日本語（TSDoc・コメント・各種ドキュメントを含めてすべて日本語） |

---

## 1. システム概要

| 項目 | 内容 |
| --- | --- |
| 目的 | 新年会などのイベントで使用する、ローカル環境完結型の Bingo 抽選アプリを実装する。景品情報は CSV で管理し、抽選演出はルーレット（react-custom-roulette）で行う。 |
| 対象プラットフォーム | デスクトップ PC 上の Web ブラウザ（主に Chrome 最新版） |
| オフライン要件 | 最終的にはネットワークに依存せず、ローカル環境だけで利用可能とする（npm 依存の取得は開発時のみ）。 |
| 利用者 | 新年会の司会・進行役（操作は 1 人を想定） |
| 想定規模 | 参加者数は 10〜数百人を想定。画面はプロジェクタ投影 or 大型ディスプレイ表示。 |
| ビンゴ番号範囲 | デフォルト：1〜75（将来変更可能なように定数・設定で管理） |

---

### 1.1 テスト証跡・ログ運用

- すべてのテストログ／スクリーンショットは `docs/result/001-editorconfig-biome/<task-id>/` に保存し、ファイル名を `YYYYMMDD-HHMM_<tool>.log` または `.png` の形式に揃える。`<tool>` は `chromedevtools` / `playwright` / `biome-lint` など実行した MCP や CLI を明示する。
- Chrome DevTools MCP を主要検証ツールとし、ブラウザ操作や Console ログを取得したら即時に前述のパスへアップロードする。UI 操作が自動化が必要な場合は Playwright MCP (Chromium) を併用し、取得したスクリーンショット／動画を同一タスク配下へ格納する。
- `npm run lint` / `npm run format` / `npm run format:check` の結果ログも証跡として保存し、PR では各タスク ID ごとの証跡パスを記載する。証跡運用の詳細手順は `docs/result/001-editorconfig-biome/README.md` を参照すること。
- 各タスク実行前後で `npm run typecheck` を必ず実行し、結果を `docs/result/<branch>/<task>/YYYYMMDD-HHMM_typecheck.log` という形式で保存する。失敗した場合もログを残し、原因と再実行計画を PR で共有する。

### 1.3 EditorConfig 運用と git diff 証跡

- `.editorconfig` に定義した 2 スペース / LF / UTF-8 / 末尾スペース削除 / 最終行改行ルールは、VSCode (EditorConfig 拡張) と CLI (`npm run format:check`) の両方で必ず検証する。
- フォーマット修正後は `npm run typecheck` を即時に実行し、整形差分で副作用が無いことを `docs/result/<branch>/<task>/YYYYMMDD-HHMM_typecheck.log` で証跡化する。
- Chrome DevTools MCP で `git status` / `git diff` を確認したスクリーンショットを `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_chromedevtools.png` として保存し、EditorConfig 変更に伴う差分のみであることを保証する。

---

## 2. 技術スタックと外部ライブラリ

| 区分 | 要件 |
| --- | --- |
| フレームワーク | React + React Router v7 を使用する。ルーティング記述は v7 の推奨スタイルに従う。 |
| ルーティング | `start`, `game`, `setting` の 3 画面を基本としたシングルページ構成。 |
| 抽選演出 | `react-custom-roulette` を使用して、抽選中のアニメーションと当選番号決定を行う。 |
| UI アイコン | `@mui/icons-material` を使用する（例：BGM のオン／オフアイコンなど）。 |
| DnD | 賞品並び替えには `DNDContext`（例：`@dnd-kit/core`）を使用する。 |
| フォーム制御 | 入力フィールドが 3 以上、バリデーションが複数、非同期送信がある場合は `react-hook-form` を採用し、FormAdoptionChecklist の score >=3 で必須、=2 で推奨、<=1 で任意とする。評価結果は `docs/result/001-editorconfig-biome/<task>/` に証跡保存する。 |

- **FormAdoptionChecklist テンプレート**: `docs/spec seed/requirements/form-adoption-checklist.md` を複製し、Start/Game/Setting 各フォームの `form_id`・score・`recommendation` を記録する。
- **evidence_path 命名規則**: Checklist JSON には `evidence_path="docs/result/<branch>/<task>/YYYYMMDD-HHMM_form-<form-id>.json"` を記載し、Chrome DevTools MCP / Playwright MCP のスクリーンショットも同ディレクトリに保存する。
- **Typecheck 連動**: react-hook-form を導入する／評価を更新するたびに `npm run typecheck` を実行し、結果を `docs/result/<branch>/<task>/YYYYMMDD-HHMM_typecheck.log` へ追記する。Checklist の `typecheck_log` プロパティにもこのパスを記述する。
| データ管理 | マスターデータ（景品情報など）は CSV ファイルで管理する。ゲーム進行状態はブラウザローカル（例：localStorage）で管理する。 |
| 重複コード検出 | `npm run similarity` で `mizchi/similarity`（similarity-ts）を実行し、`app` と `docs` 配下の重複コードを検出する。バイナリは `cargo install --path vendor/mizchi-similarity/crates/similarity-ts --locked --force` で構築するか、`SIMILARITY_BIN` 環境変数に外部パスを指定する。 |
| 開発補助（MCP） | - Chrome DevTools MCP：ブラウザ上での動作確認・テスト実行- GitMCP（github-mcp-server）：ドメイン単位の実装完了ごとにコミット- CONTEXT7 MCP：利用ライブラリの最新版確認と導入- MCP serena：高精度なコード生成・リファクタリング |

---

## 3. 画面構成とルーティング

### 3.1 画面一覧

| 画面 ID | パス例 | 役割 | 備考 |
| --- | --- | --- | --- |
| start | `/` または `/start` | アプリ起動時のメインメニュー画面。「はじめから」「続きから」「設定」ボタンと BGM トグルを表示。 | 最初に表示される画面。 |
| game | `/game` | Bingo 抽選を実施するメイン画面。抽選ルーレット・当選番号表示・抽選履歴・景品リスト表示を行う。 | 実際に進行役が操作し、会場に投影する画面。 |
| setting | `/setting` | 景品情報などの設定画面。CSV 管理を前提とした景品マスタの編集・並び替え・一括操作を行う。 | HTML の `<table>` タグ禁止。Grid / Flex で「テーブル風」レイアウトを実現する。 |

### 3.2 React Router v7 でのルーティング要件

| 項目 | 内容 |
| --- | --- |
| ルート定義 | React Router v7 の推奨スタイルに従い、`route.tsx`（または相当ファイル）ごとに `loader`, `action`, `default export component` のみを記述する。 |
| 画面コンポーネント | 画面固有の JSX / ロジックは、ルートから呼び出す専用コンポーネント（`components` など）に切り出す。 |
| ルートファイルの責務 | データ取得（loader）、フォーム処理（action）、ルートコンポーネントのマウントのみを担当し、それ以外のロジックは `components` / `common` 配下へ分離する。 |

---

## 4. 各画面の詳細仕様

### 4.1 Start 画面

| 項目 | 内容 |
| --- | --- |
| 概要 | アプリ起動時に表示されるメニュー画面。新規ゲーム開始・前回の続き・設定画面遷移を行う。右上に BGM のオン／オフ切り替えアイコンを表示する。 |
| ボタン：はじめから | 押下時に現在のゲーム状態を初期化し、`/game` に遷移する。初期化内容には「これまでの当選番号」「景品の選出状態」などを含める。 |
| ボタン：続きから | ブラウザローカル（例：localStorage）に保存された最新のゲーム状態を読み込み、`/game` に遷移する。保存データがない場合の挙動（新規開始など）は別途定義。 |
| ボタン：設定 | `setting` 画面（`/setting`）に遷移する。 |
| BGM オン／オフ | 右上に BGM トグルアイコンを表示する。`@mui/icons-material` の音量系アイコンを利用し、オン／オフ状態を視覚的に区別する。 |
| BGM 設定の保存 | BGM のオン／オフ状態はブラウザローカルに保存し、アプリ再訪問時にも状態を復元する。 |

#### Start 画面 - FormAdoptionChecklist

- 入力要素はボタン＋BGM トグルのみでクロスフィールド依存も無いため、Checklist の score は 1 以下（`recommendation=optional`）。
- `FormAdoptionChecklist` に `form_id=start`, `input_fields_count=1`, `validation_complexity=none`, `async_submission=false` を記録し、`evidence_path="docs/result/001-editorconfig-biome/<task-id>/start-checklist.json"` を明記する。更新後は `npm run typecheck` を実行し、`typecheck_log` に `docs/result/.../YYYYMMDD-HHMM_typecheck.log` を保存する。
- react-hook-form を導入する必要は現時点で無いが、フィールドが 3 つ以上に増えた場合は再評価し、score が 2 以上なら移行タスクを起票する。

#### Start 画面 - Chrome DevTools MCP テストシナリオ

1. **SF-START-001: 「はじめから」で localStorage を初期化**  
   - 準備: Chrome DevTools MCP で `localStorage.clear()` を実行し、`bingo.v1.*` が存在しない状態にする。  
   - 手順: `npm run dev` → Start 画面で「はじめから」を押下。Game 画面に遷移後、DevTools Console で `localStorage.getItem("bingo.v1.gameState")` を確認し、`drawHistory` が空配列・`currentNumber=null` になっていることを failure-first で確認（初回は任意に壊した JSON をセットしてから再実行）。  
   - 期待値: Game 画面中央は「--」や未確定表示になり、右ペインの景品は全件 `selected=false` で描画される。Start に戻ると BGM トグルは直前の状態（デフォルト ON）を維持する。

2. **SF-START-002: 「続きから」で保存済み状態を復元**  
   - 準備: Game 画面で 2 回抽選 → 景品 1 件を当選処理 → Start へ戻る（ブラウザバックまたはメニュー）。  
   - 手順: Start 画面で「続きから」を押下。遷移直後に DevTools Console で `JSON.parse(localStorage.getItem("bingo.v1.gameState")!)` を取得し、`drawHistory.length === 2` と `currentNumber` が最後の番号であることを確認。`bingo.v1.prizes` の対象 ID が `selected=true` になっているかも合わせて確認。  
   - 期待値: Game 画面ロード後に中央表示へ最後の番号が表示され、右ペインでは当選済み景品に取消線が入る。`updatedAt` が復元前と同一であることを Chrome DevTools MCP のコンソールで比較する。

3. **SF-START-003: 保存データが無い状態で「続きから」を押下した際のフォールバック**  
   - 準備: DevTools Console で `localStorage.removeItem("bingo.v1.gameState")` `localStorage.removeItem("bingo.v1.prizes")` を実行し、`bingo.v1.bgm` のみ残した状態を作る。  
   - 手順: Start 画面で「続きから」を押下。レスポンスが 204 相当であると仮定し、Start と同等の初期化が走るまで待つ。  
   - 期待値: Game 画面へ遷移しても履歴 0 件・景品未選出の状態となり、Start 画面に戻るとトースト／バナーで「保存データが無いため新規開始しました」といった案内が表示される（failure-first では案内が無いことを確認してから実装で追加）。BGM トグルは `bingo.v1.bgm` の状態を維持し、`localStorage` へ新しい `bingo.v1.gameState` が作成される。

---

### 4.2 Game 画面

| 項目 | 内容 |
| --- | --- |
| 概要 | Bingo 抽選を行うメイン画面。左に直近当選番号の履歴、中央に抽選エリア、右に景品リストを表示する。 |
| ビンゴ番号範囲 | デフォルト 1〜75 の整数。既に出た番号は再度抽選しない。 |
| 抽選ロジック | 未抽選の番号集合から 1 つをランダムに選択し、その結果を「現在の当選番号」として表示・履歴保存する。 |
| 抽選演出 | `react-custom-roulette` を利用し、抽選開始時にルーレットアニメーションを表示し、停止時に最終的な当選番号を決定する。中央の数字表示コンポーネントに結果を反映する。 |
| 中央表示エリア | 正方形の枠内に現在の当選番号を大きく表示する。抽選中は数字が高速に切り替わるアニメーション表現とし、抽選確定時に最終番号を強調表示する。 |
| 抽選ボタン | 「抽選開始」「抽選ストップ」等、1 つまたはトグル式のボタンで抽選制御を行う。抽選中のみ再度押下可能など、誤操作防止を考慮した状態管理を行う。 |
| 左ペイン：前回のビンゴ番号 | 直近 10 件の当選番号を新しい順に表示する（例：最新が最上段）。10 件を超える場合は古い番号から非表示にする。 |
| 左ペイン：全当選番号ポップアップ | 左ペイン下部に「これまでの当選番号を見る」リンク（またはボタン）を配置し、クリックでモーダル／ポップアップを表示する。ポップアップ内にはこれまで出た全ての番号を一覧表示する。 |
| 右ペイン：今回の景品一覧 | 現在の新年会で使用する景品を一覧表示する。各行には少なくとも「賞名」「商品名または画像サムネイル」「当選済みかのステータス」を表示する。 |
| 景品の取消線表示 | 当選済みの景品は行全体またはテキストに取消線を表示し、一目で配布済みとわかるようにする。 |
| 景品の当選管理 | 右ペインの各行に「当選」／「戻す」ボタンやトグルを設け、進行役が手動で当選状態を切り替えられるようにする。当選状態はゲーム状態としてブラウザローカルに保存する。 |

#### Game 画面 - FormAdoptionChecklist

- Game 画面で入力を伴う UI は抽選ボタンと景品管理パネルのトグル群。景品管理は `input_fields_count=3+`, `cross_field_dependencies=true`（サマリー更新有り）で score=2（推奨）。
- 抽選ボタンは単体動作のため別フォームとして score=1（任意）を記録。複数フィールドをまとめるユースケースが増えた場合は react-hook-form へ移行。
- 各評価結果は `form_id=game-prize-controls` などで checklist に追記し、`evidence_path` を `docs/result/001-editorconfig-biome/<task-id>/game-checklist.json` として記録する。Game 画面のフォーム仕様を更新した場合も `npm run typecheck` を再実行し、`typecheck_log` に最新パスを記載する。

#### Game 画面 - Chrome DevTools MCP テストシナリオ

1. **SF-GAME-001: 抽選ボタンで履歴と `localStorage` が同期される**  
   - 準備: DevTools Console で `localStorage.setItem("bingo.v1.gameState", JSON.stringify({ currentNumber: null, drawHistory: [], isDrawing: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }))` を実行し、未抽選状態にリセットする。  
   - 手順: `npm run dev` → Game 画面を表示 → 「抽選開始」→「抽選ストップ」を 1 回実行。演出終了直後に DevTools から `JSON.parse(localStorage.getItem("bingo.v1.gameState")!)` を取得し、`drawHistory.length` が 1 増えて `currentNumber` と最後の履歴エントリの `number` が一致するか確認する。  
   - 期待値: `isDrawing` は抽選開始時に `true`、停止後は `false` に戻り、`updatedAt` が現在時刻へ更新される。Recent 履歴リストと中央表示が同じ当選番号を示す。

2. **SF-GAME-002: 重複抽選を拒否する失敗先行テスト**  
   - 準備: DevTools で `drawHistory` を 3 件ほど手動挿入し（例: 5, 10, 15）、`currentNumber` にも同じ番号を設定した JSON を `bingo.v1.gameState` へ保存する。  
   - 手順: Game 画面で抽選を 5 回繰り返し、各回の `localStorage` を監視する。抽選ごとに `drawHistory` の `number` が一意になっているか、既存番号が再度選ばれていないかを failure-first（先に重複を意図的に入れてから修正）で確認する。`drawHistory.length` が 75 に達した場合は抽選ボタンが無効化され、`/draws` 相当で 409 エラー扱いになることも合わせて確認する。  
   - 期待値: 未抽選番号セットが都度再計算され、重複は発生しない。全番号抽選後はボタンに「抽選済み」のメッセージやトーストを表示して追加抽選を防止する。

3. **SF-GAME-003: 履歴モーダルと直近 10 件ビューを検証**  
   - 準備: DevTools Console で `drawHistory` に 12 件以上のダミーデータを注入する（`sequence` 1 origin、`drawnAt` は ISO8601）。  
   - 手順: Game 画面左ペインで直近履歴を確認し、最新 10 件のみが降順で表示されているかチェック。その後「これまでの当選番号を見る」を開き、モーダル内で 12 件すべてが昇順/sequence 順に表示されているかを確認する。failure-first として `drawHistory` が `sequence` 順になっていないデータを入れて UI が崩れることを観察してから、historyService 実装で整列する。  
   - 期待値: Recent ビューは `drawHistory.slice(-10).reverse()` の結果と一致し、モーダルは `sequence` 昇順ですべてのエントリを表示する。`bingo.v1.gameState` の内容が UI と乖離しない。

#### 景品管理 - Chrome DevTools MCP / Playwright MCP テストシナリオ

1. **SF-PRIZE-001: トグル操作で localStorage と UI が同期**  
   - 準備: Game 画面を開き、`bingo.v1.prizes` にダミー景品（最低 3 件）を投入してからリロード。Chrome DevTools MCP の Console で `JSON.parse(localStorage.getItem("bingo.v1.prizes")!)` を確認し、`selected=false` の景品が含まれている状態を failure-first で作る。  
   - 手順: 右ペインで任意の景品の「当選」をクリック → 取消線表示とサマリー（総数/当選済み/残り）のカウント更新を確認 → DevTools Console で該当 ID の `selected` が `true` に変わったかを確認。  
   - 期待値: UI と localStorage が即時同期し、残りカウントが 1 減る。Chrome DevTools MCP で UI 操作が難しい場合は Playwright MCP を用いて同手順を自動化しても良い（結果ログは requirements.md に貼り付ける）。

2. **SF-PRIZE-002: 「戻す」で当選状態を解除**  
   - 準備: `selected=true` の景品を含む状態を作り、`bingo.v1.prizes` に `selected:true` が記録されていることを Console で確認。  
   - 手順: 右ペインで当選済み景品の「戻す」を押下し、取消線が解除されるまで待つ。続けてブラウザをリロードし、状態が保持されているか確認。Chrome DevTools MCP で連続リロードが負荷になる場合は Playwright MCP の `page.reload()` を利用しても良い。  
   - 期待値: 戻す操作で `selected=false` が保存され、リロード後も UI が未当選状態で描画される。

3. **SF-PRIZE-003: 再読み込みボタンで最新データを取得**  
   - 準備: DevTools Console から `localStorage.setItem("bingo.v1.prizes", ...)` を使い別タブ想定の変更を反映させる。  
   - 手順: Game 画面右上の「再読み込み」をクリック。Chrome DevTools MCP で UI が更新されない場合は Playwright MCP から同ボタンをクリックしてログを採取する。  
   - 期待値: `PrizeContext` が最新の JSON を読み込み、カウンターとリスト表示に即時反映される。失敗時はエラーメッセージを表示し、requirements.md に再現ログを追記する。

---

### 4.3 Setting 画面

| 項目 | 内容 |
| --- | --- |
| 概要 | 景品情報などを編集・並び替えする画面。マスターデータは CSV 管理としつつ、画面上では編集や一括操作を行う。 |
| レイアウト | 見た目はテーブル形式だが、HTML の `<table>` 要素は使用せず、CSS Grid または Flexbox で列を表現する。 |
| 行の項目 | 1 行あたり、以下の項目を持つ：・賞名・画像／商品名（画像パスまたは商品名。必要に応じて両方）・選出済みか（現在の当選状態の表示）・削除ボタン |
| DnD での並び替え | `DNDContext` を用いて、景品行をドラッグ＆ドロップで並び替え可能にする。行左端にドラッグハンドルを配置し、直感的な並び替え操作を提供する。 |
| 一括追加ボタン | CSV ファイルなどから複数の景品を一括で登録できるボタン。UI 上でファイル選択 or テキスト入力など。詳細仕様は後述の CSV 仕様に準拠。 |
| 一括削除ボタン | 現在表示している景品を一括削除するボタン。誤操作防止のため確認ダイアログを表示する。 |
| 選出済みかの扱い | 原則として「ゲーム側で決まった当選状態の参照欄」とする。必要に応じてリセット機能（すべて未選出にする等）を提供する。 |
| デザイン | `docs/design` 配下にあるデザイン画像のレイアウト・カラー・余白・タイポグラフィに合わせて実装する（言語化が難しい部分は画像優先とする）。 |

#### Setting 画面 - FormAdoptionChecklist

- `form_id=setting-prize-editor`。入力要素が 6+（テキスト、ファイル選択、DnD、チェックボックス等）、`validation_complexity=advanced`、`async_submission=true`（CSV import）で score>=3 のため react-hook-form を必須採用とする。
- Checklist には `cross_field_dependencies=true`（CSV 取り込み→一覧表示→Game 反映）のワークフローを記録し、`evidence_path="docs/result/001-editorconfig-biome/<task-id>/setting-checklist.json"` を記載する。UI 操作とあわせて `npm run typecheck` のログ (`..._typecheck.log`) を EvidenceArtifact として保存する。
- 既存フォームからの移行タスクを作成する際は Checklist の `evidence_path` に `docs/result/...` を記録し、PR テンプレートでもリンクする。

#### Setting 画面 - Chrome DevTools MCP / Playwright MCP テストシナリオ

1. **SF-SET-001: CSV インポートで景品を追加**  
   - 準備: `data/prizes.csv` 形式に従ったダミー CSV（3 件以上）を用意。Chrome DevTools MCP のアップロードが困難な場合は Playwright MCP を利用して `page.setInputFiles` 経由でアップロードする。  
   - 手順: Setting 画面の「CSV 取り込み」→ ファイル選択 → 成功トーストとプレビュー更新を確認。直後に `localStorage.getItem("bingo.v1.prizes")` を取得し、`order` が 0..n-1 に再採番されているかチェック。  
   - 期待値: すべてのレコードが UI に反映され、Game 画面へ移動しても同じ順序で表示される。

2. **SF-SET-002: DnD 並び替えと再描画**  
   - 準備: 5 件以上の景品を登録しておく。Playwright MCP でドラッグ操作を自動化する場合は `locator.dragTo` を使用し、スクリーンショットを保存。  
   - 手順: 行左端のハンドルを掴んで 2 行目と 4 行目を入れ替える → 並び順が UI に反映 → `localStorage` の `order` が昇順で更新されているか確認。  
   - 期待値: 並び替え後に Game 画面の右ペインへ遷移しても新しい順序が維持される。

3. **SF-SET-003: 一括削除とフォールバック**  
   - 準備: 3 件以上ある状態を作り、`bingo.v1.prizes` にも同じ数があることを確認。  
   - 手順: 一括削除ボタン → 確認ダイアログで承認 → 空状態表示を確認 → Game 画面へ移動し、景品パネルも空であることを確認。Chrome DevTools MCP で確認が困難な場合は Playwright MCP でナビゲーションを自動化。  
   - 期待値: localStorage が空配列になり、以降の CSV インポートで再び初期化できる。

4. **SF-SET-004: Setting → Game 状態同期**  
   - 準備: Playwright MCP で `npm run dev` を開き、Setting 画面で CSV 取り込み→並び替え（SF-SET-001〜002）を実行する。  
   - 手順: Playwright MCP で Game 画面へ遷移し、右ペインの先頭景品名や件数が直前の Setting 操作と一致するか `expect` で検証。`performance.now()` を使って「CSV 取り込み開始→Game DOM 反映」までの時間を 3 回記録し、`docs/spec seed/requirements.md#SC-004` へ追記する。  
   - 実測: 2025-11-16 (Chromium via Playwright MCP) で平均 4.1 秒（最大 4.4 秒）。要件「30 秒以内」を満たす。  
   - 期待値: Game 画面ロード直後に PrizeContext が最新の `bingo.v1.prizes` を読み込み、抽選 UI に影響を与えず右ペインのみ更新される。

5. **SF-SET-005: Playwright MCP でのスクリーンショット取得**  
   - 準備: Setting 画面で景品 3 件以上と CSV パネルが表示されている状態を作る。  
   - 手順: Playwright MCP で `page.setViewportSize({ width: 1280, height: 720 })` → `page.screenshot({ path: "docs/spec seed/design/setting-playwright.png", fullPage: true })` を実行し、PR に添付。  
   - 期待値: スクリーンショットのレイアウトと配色が `docs/spec seed/design/design.md` のモックと一致し、Experience-Parity を満たす。

---

## 5. データ要件（CSV・状態管理）

### 5.1 CSV ファイル管理方針

| 項目 | 内容 |
| --- | --- |
| 管理対象 | 景品マスタ（賞名・商品名・画像パス等）。必要に応じて他の設定（例：ビンゴ番号範囲）も CSV または別設定ファイルで管理する。 |
| 保存場所 | プロジェクト内の `data` ディレクトリ等（例：`data/prizes.csv`）。 |
| 読み込みタイミング | アプリ起動時または Setting 画面表示時に読み込む。 |
| 更新タイミング | Setting 画面で編集後、ブラウザローカル保存（localStorage など）を行い、必要に応じて CSV 形式でエクスポートできるようにする。 |

### 5.2 景品 CSV のカラム定義（案）

| カラム名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | 必須 | 景品の一意な ID。UUID または連番文字列。 |
| order | number | 必須 | 表示順。Setting 画面での DnD 結果を反映。 |
| prizeName | string | 必須 | 賞名（例：一等、特別賞など）。 |
| itemName | string | 必須 | 商品名（例：Nintendo Switch、商品券など）。 |
| imagePath | string | 任意 | 商品画像ファイルへのパスまたは URL（ローカル運用を前提）。 |
| selected | boolean | 必須 | 当選済みかどうか。ゲーム状態と同期する。 |
| memo | string | 任意 | 備考欄。 |

※ 実際に AI に渡す際は、上記定義に基づいたサンプル CSV を数件分用意しておく。

### 5.3 ゲーム状態管理

| 項目 | 内容 |
| --- | --- |
| 管理方法 | ブラウザの localStorage（または同等のクライアントサイドストレージ）を使用し、完全ローカルで完結する。 |
| 保存内容 | ・既に抽選されたビンゴ番号一覧・直近 10 件の当選番号（履歴表示用）・景品ごとの `selected` 状態・BGM オン／オフ設定 |
| 保存タイミング | 抽選確定時、景品の当選状態変更時、BGM トグル変更時などに即時保存する。 |
| 「続きから」動作 | Start 画面の「続きから」押下時に localStorage から前回状態を読み込み、Game 画面に復元した状態で遷移する。保存が無い場合は「はじめから」と同等の挙動にフォールバックする。 |

### 5.4 FormAdoptionChecklist スコアリング

| score | 条件例 | 推奨度 | 証跡 |
| --- | --- | --- | --- |
| 0-1 | 入力 1〜2 件、バリデーションなし、同期送信のみ | 任意 | Checklist に `recommendation=optional` を記載し、`evidence_path` を `docs/result/001-editorconfig-biome/<task-id>/start-checklist.json` などに設定する。 |
| 2 | 入力 3 件以上、単純なバリデーション or カウンター連動 | 推奨 | `recommendation=recommended`。Game 画面などで将来の移行を検討し、`typecheck_log` に同タスクの `YYYYMMDD-HHMM_typecheck.log` を記録して PR に添付。 |
| 3+ | 入力 3 件以上 + クロスフィールド依存 or 非同期送信 or CSV アップロード | 必須 | `recommendation=required`。Setting 画面などで react-hook-form を導入し、Chrome DevTools MCP ログ＋Playwright MCP スクショを evidence_path 先へ保存する。 |

Checklist の評価は `docs/spec seed/requirements/form-adoption-checklist.md` のテンプレートに従い、Start/Game/Setting で最新スコアを記録する。各チェックの JSON には `evidence_path` と `typecheck_log` を必須フィールドとして追加し、PR テンプレートでも参照する。

---

## 6. コーディング規約・ディレクトリ構成

### 6.1 ディレクトリ構成の基本方針

| ディレクトリ | 役割 |
| --- | --- |
| `src/routes` | React Router v7 のルートモジュールを配置。各 `route.tsx` ファイルには `loader`, `action`, `default export component` のみ記載する。 |
| `src/components` | 画面共通で利用する UI コンポーネント（ボタン、モーダル、レイアウトコンポーネントなど）を配置する。共通コンポーネントは必ずここに置く。 |
| `src/common` | 共通ロジック・ユーティリティ（カスタムフック、ドメインロジック、バリデーション、定数など）を配置する。共通コンポーネント以外の共通部品は必ずここに置く。 |
| `data` | CSV や設定ファイルなどの静的データを配置する。 |
| `docs/design` | 画面デザインの画像ファイルを配置する。UI 実装の際はこのディレクトリ内の画像を優先的に参照する。 |

### 6.2 コーディング規約

| 規約 | 内容 |
| --- | --- |
| TSDoc | すべての公開関数・コンポーネント・クラスには TSDoc を必ず記載する。説明文は日本語で記述する。 |
| コメント言語 | コード内のコメントはすべて日本語で記述する。 |
| ドキュメント言語 | README などのドキュメントも原則として日本語で作成する。 |
| ファイル行数 | 1 ファイルが 200 行を超える場合は、責務ごとに分割を検討すること。AI による自動リファクタリングも許可する。 |
| SRP | 単一責任原則（SRP）を意識し、コンポーネントや関数の責務をなるべく絞る。 |
| 一貫した実装 | 「同じ動作をする箇所は同じように実装する」こと。例：モーダル表示ロジック、ローディング状態管理などは共通フックまたは共通コンポーネントに切り出して統一する。 |
| 重複コード検出 | `npm run similarity`（内部で `mizchi/similarity` を実行）を定期的に流し、結果を `docs/spec seed/requirements.md` のテスト欄へ記録する。local バイナリが未配置の場合は `cargo install --path vendor/mizchi-similarity/crates/similarity-ts --locked` または `SIMILARITY_BIN` で経路を指定する。 |

---

## 7. 開発プロセス・MCP 利用方針

### 7.1 テスト駆動開発（TDD）

| 項目 | 内容 |
| --- | --- |
| スタイル | 新機能や変更を実装する際は、必ず先にテストコードを書き、そのテストが失敗することを確認してから実装に着手する。 |
| テスト対象 | ドメインロジック（ビンゴ番号抽選、履歴生成、景品状態管理など）を最優先でユニットテストする。その上で必要に応じてコンポーネントテスト・E2E テストを追加。 |
| テストツール（例） | ユニット・コンポーネントテスト：Vitest / Jest + React Testing Library 等（具体的な選定は CONTEXT7 MCP により最新版を確認）。 |

### 7.2 MCP ごとの役割

| MCP | 役割 |
| --- | --- |
| Chrome DevTools MCP | ブラウザ上でのアプリ実行、コンソールログ確認、ネットワーク通信確認、E2E テスト実行などに使用する。テスト結果を元にリファクタリングを行う。 |
| GitMCP（github-mcp-server） | ドメイン単位で機能実装が完了したタイミング（例：Start 画面の実装完了・Game 画面の抽選ロジック実装完了など）ごとにコミットを作成し、履歴を残す。コミットメッセージは日本語でわかりやすく記述する。 |
| CONTEXT7 MCP | React Router v7・react-custom-roulette・@mui/icons-material・DND 関連ライブラリなど、利用ライブラリの最新安定版を確認し、依存バージョンを決定する。必要に応じてアップデートを提案する。 |
| MCP serena | コード生成・リファクタリングの精度向上のために使用する。TSDoc の自動生成や共通化候補抽出、`mizchi/similarity` の結果を踏まえたリファクタリングに活用する。 |

---

## 8. テスト要件（概要）

| テスト種類 | 内容 |
| --- | --- |
| ユニットテスト | 抽選ロジック（未抽選からのランダム選択・重複防止）、履歴管理、景品選出状態管理、CSV パース処理など。 |
| コンポーネントテスト | Start / Game / Setting 各画面の主要コンポーネント（ボタン押下での遷移・状態変更・表示内容）をテストする。 |
| E2E テスト | 典型的な操作フロー：1. Start 画面で「はじめから」→ Game 画面で数回抽選→景品選出→ブラウザリロード→状態復元2. Setting 画面で CSV から一括追加→並び替え→Game 画面で反映確認。 |
| ブラウザ互換性 | 主に Chrome 最新版での動作確認を必須とする。他ブラウザは余裕があれば検証対象とする。 |

---

## 9. 非機能要件（抜粋）

| 項目 | 内容 |
| --- | --- |
| パフォーマンス | 抽選ボタン押下から当選番号確定まで、体感的にストレスのない速度で動作すること。 |
| 信頼性 | 抽選済み番号が再度選ばれないこと。ブラウザリロードや軽微なクラッシュ後でも localStorage に保存された状態から続行できること。 |
| UX | 司会が操作しやすく、進行を止めないシンプルな UI。誤操作防止のための確認ダイアログや無効状態のボタン表示を適切に行う。 |
| ログ | 開発時は必要に応じてコンソールログを出力するが、本番運用時は不要なログを残さない。 |

---

## 10. AI に事前に渡すべき追加情報

AI にこの要件定義書と **一緒に渡しておくと精度が上がる情報** を一覧化します。

| カテゴリ | 内容 | 具体例 |
| --- | --- | --- |
| デザイン資料 | `docs/design` 配下の各画面デザイン画像と、そのファイル名と役割の対応表 | `docs/design/start.png`（Start 画面）など |
| CSV 仕様書 | 実際に使用する CSV カラム定義とサンプルデータ | `prizes.csv` のサンプル 5〜10 行分 |
| ビンゴルール | 使用するビンゴ番号範囲や、抽選済み番号の扱いなどのビジネスルールの詳細 | 例：1〜75 固定、同じ番号は二度と出さない など |
| 景品一覧の原案 | 実際の新年会で使用予定の景品一覧案 | 賞名・商品名・画像パス・数量など |
| BGM 素材情報 | 使用したい BGM ファイルのパス・形式（mp3 等）と、ループ再生の要否 | `public/audio/bgm.mp3` など |
| ルーティング詳細 | 実際に採用するルーティングとファイル構成の初期案 | `/`, `/game`, `/setting` と各 `route.tsx` の置き場所 |
| テストポリシー詳細 | 使用するテストフレームワーク名と、テストの優先順位・カバレッジ目標 | 例：Vitest + React Testing Library、ドメインロジックは 80% 以上など |
| Node / パッケージマネージャ | 使用する Node.js のバージョン、npm / pnpm / yarn などの指定 | Node 20 系、pnpm 使用など |
| 既存リポジトリ情報 | 既にリポジトリがある場合は Git URL や現在のディレクトリ構成 | AI が GitMCP で操作する前提 |
| 運用フロー | 新年会当日までの運用フロー（誰がいつ CSV を更新するか、動作確認のタイミングなど） | 例：前日までに景品 CSV 確定・当日リハーサル 1 回など |

---

## 11. コードスタイルとエディタポリシー

### FR-001: EditorConfigPolicy

- リポジトリ直下に配置した `.editorconfig` で全ファイル（`*.ts`, `*.tsx`, `*.json`, `*.md` など）へ 2 スペース / LF / UTF-8 / 末尾スペース削除 / 最終行改行を強制する。
- VSCode 以外の IDE（JetBrains, NeoVim 等）でも EditorConfig が有効なことを確認し、設定が有効でない場合は該当 IDE のプラグイン導入手順を記録する。
- ルール違反は `npm run format:check` で検出し、結果ログを `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_biome-format-check.log` として保存し、PR でリンクする。
- VSCode では「EditorConfig for VS Code」拡張を必須化し、CLI 実行後は `npm run typecheck` のログとセットで証跡化する。PR 説明には 1.3 節のパス命名ルールを転記する。

### FR-002: Multi-IDE Diff ガイドライン

- Chrome DevTools MCP で `git status` / `git diff` を確認し、EditorConfig 適用後に余計な差分（末尾スペース、インデント違反）が無いことを証跡化する。
- `docs/spec seed/requirements.md` を含むすべてのドキュメント編集時に、保存直後の diff スクリーンショットを `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_chromedevtools.png` として記録する。
- マルチ IDE メンバー向けに `.editorconfig` を参照する導線を README の「Code Quality Workflow」に統一し、タスク完了時は当該 README 節のリンクを PR 説明へ貼り付ける。
- `git diff` 証跡は typecheck ログと同じディレクトリに保存し、差分とログのタイムスタンプが一致していることを PR コメントで明記する。

### FR-003: BiomeRuleSet

- `biome.json` で `extends: ["biome", "biome/react"]` を指定し、`app/**/*.{ts,tsx}` および `docs/**/*.md` に 2 スペース + lineWidth 100 + import 並び替えを適用する。
- `files.ignore` で `node_modules`, `build`, `dist`, `docs/result/**` を除外する。
- import 重複や未使用変数は `linter.rules.correctness.noUnusedImports/noUnusedVariables = "error"` でブロックする。
- `npm run lint` / `npm run format` / `npm run format:check` を実装・レビュー前に順番に実行し、ログを `docs/result/001-editorconfig-biome/<task-id>/YYYYMMDD-HHMM_biome-*.log` として保存する。完了後に `npm run typecheck` を実行し、lint 未完了の状態で typecheck を進めない。

### FR-004: Biome コマンドと CI

- `npm run lint`（`biome lint --error-on-warnings`）を PR 前に必ず実行し、exit code 0 で完了したログを `docs/result/001-editorconfig-biome/<task-id>/..._biome-lint.log` に保存する。
- `npm run format` / `npm run format:check` を pre-commit / CI で実行し、未整形ファイルがある場合は push を拒否する。CI ログにも証跡リンクを出力する。
- CI では `npm run lint` → `npm run format:check` → `npm run typecheck` → `npm run build` の順で動かし、途中失敗時は EvidenceArtifact に失敗ログをそのまま保存する。

### FR-005: EvidenceArtifact 連携

- Biome コマンドの成功/失敗ログとスクリーンショットを EvidenceArtifact として `docs/result/001-editorconfig-biome/<task-id>/` に保存し、PR テンプレートのチェック項目で確認する。
- フォーマット違反修正後は `git status` のスクリーンショットを添付し、余計な差分が無いことを reviewers が確認できるようにする。
- Biome ログ (`_biome-lint.log`, `_biome-format.log`, `_biome-format-check.log`) と `YYYYMMDD-HHMM_typecheck.log` は同じタスクフォルダに配置し、PR ではこれらファイル名を evidence_path として列挙する。
