# Feature Specification: 現行仕様書レビュー

**Feature Branch**: `001-spec-review`  
**Created**: 2025-11-17  
**Status**: Draft  
**Cipher MCP Entry**: TODO(CIPHER_ENTRY): byterover-cipher で本仕様の記録を作成後に ID と同期日を追記すること  
**Input**: User description: "現状の仕様書を確認してください"

> 憲章に従い、cipher MCP のメモリーが更新されていない仕様はレビューできません。必ず最新 ID を記載してください。

**Test Evidence Rules**  
- Chrome DevTools MCP をデフォルトの検証環境として設定し、Chrome DevTools で取得できない証跡は Playwright MCP（`apt install chromium-browser` で導入した Chromium）を利用する。  
- すべてのログ・スクリーンショット・動画を `docs/result/<ブランチ名>/<タスクID>/` 配下に保存する方針を本仕様に記述する。  
- 各ユーザーストーリーの完了条件に、上記フォルダーの証跡パスとコミット ID を紐付ける。

## Clarifications

### Session 2025-11-17

- Q: 仕様レビュー操作前に byterover-cipher のメモリー更新が未完了の場合の扱いは？ → A: byterover-cipher の最新更新がない操作はブロックし更新完了まで進めない

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ステークホルダーは仕様全体の整合を素早く把握できる (Priority: P1)

プロダクトオーナーとして、`docs/spec seed/requirements.md` と `docs/spec seed/design/design.md`、`docs/spec by kiro/.kiro/specs/bingo-game/*.md` を 1 画面で閲覧し、最新更新日や未同期セクションを即座に把握したい。

**Why this priority**: 仕様差異を把握できないと開発優先度が決められず、誤った前提で作業が進むリスクが最も高いため。

**Independent Test**: Chrome DevTools MCP でレビュー画面を開き、主要ドキュメントの要約リストと更新メタ情報が 1 ページ内で完結しているかを確認する。

**Acceptance Scenarios**:

1. **Given** 仕様レビュー画面を開いた状態、 **When** 利用者が spec seed と spec by kiro のパスを指定する、 **Then** 最新更新日・編集者・差分数がカード表示される。  
2. **Given** 仕様レビュー画面、 **When** 未同期セクションが存在する、 **Then** 「同期待ち」ラベルと影響セクション一覧が表示され、CSV へエクスポートできる。

---

### User Story 2 - リードエンジニアは仕様差分の原因を追跡できる (Priority: P2)

リードエンジニアとして、各セクションと Git ブランチの紐付け、仕様差分の原因、対応予定ブランチを照合したい。

**Why this priority**: 差分原因を残さないと手戻りが発生し、計画と実装のギャップが拡大するため。

**Independent Test**: Chrome DevTools MCP で差分詳細パネルを開き、セクションごとに関連ブランチと担当タスク ID が列挙されているか確認する。

**Acceptance Scenarios**:

1. **Given** 差分詳細パネル、 **When** 任意のセクションを選択する、 **Then** 関連するブランチ名とタスク ID、最新コミット ID、結果保存先 (`docs/result/<branch>/<task>/`) が表示される。  
2. **Given** 差分詳細パネル、 **When** 差分理由が登録済み、 **Then** 理由メモとリンクが表示され、リンク切れ時は警告が出る。

---

### User Story 3 - 品質管理担当はレビューパッケージをエクスポートできる (Priority: P3)

QA コーディネーターとして、現在の仕様と差分レポート、証跡リンクをまとめたレビューパッケージをダウンロードし、会議に持ち込みたい。

**Why this priority**: フィードバック会議で統一資料がないと議論が分散し、判断が遅れるため。

**Independent Test**: Playwright MCP でエクスポートボタンを押し、生成物がダウンロードされることを確認する（Chromium のスクリーンショットを docs/result 配下に保存）。

**Acceptance Scenarios**:

1. **Given** レビューパッケージ生成画面、 **When** フィルタ条件（対象ドキュメント、期間、関係ブランチ）を指定する、 **Then** ZIP 内に PDF サマリー・差分 CSV・証跡パス一覧が含まれる。  
2. **Given** エクスポート後、 **When** Chrome DevTools MCP でダウンロード履歴を確認する、 **Then** ファイル名に対象日付とブランチ名が含まれている。

---

### Edge Cases

- 対象ディレクトリに複数のバージョン行が存在し、日付形式が崩れている場合でも最終成功記録を表示できるか。  
- spec seed と spec by kiro の対応節が片方欠落している場合に「欠落」マークで提示し、ダッシュボードが崩れないか。  
- `docs/result/<branch>/<task>/` が未作成のタスクが差分リストに含まれた際に警告と補完手順を提示できるか。  
- エクスポート対象ファイル量が大きく ZIP サイズが 200 MB を超える場合に圧縮ジョブを分割できるか。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 仕様レビュー画面は `docs/spec seed/requirements.md` と `docs/spec seed/design/design.md`, `docs/spec by kiro/.kiro/specs/bingo-game/*.md` を読み取り、各文書の最終更新日・編集者・章数をカード表示する。  
- **FR-002**: 差分判定ロジックは章タイトル単位で spec seed と spec by kiro の差異を算出し、結果を一覧テーブルと CSV ダウンロードに提供する。  
- **FR-003**: 各差分行には対応ブランチ（例: `feature/domain-XX-*`）、関連タスク ID、`docs/result/<branch>/<task>/` の証跡リンクをひも付け、未登録の場合は「証跡待ち」と明示する。  
- **FR-004**: レビューパッケージ生成機能は選択した文書・期間・差分結果・証跡パス一覧を一つの ZIP にまとめ、生成完了時にダウンロードリンクとハッシュ値を提示する。  
- **FR-005**: 画面上の操作ログ（閲覧・エクスポート・差分再計算）は Chrome DevTools MCP からコピーできる形式で表示し、byterover-cipher へのメモ更新チェックリストを同画面に表示する。  
- **FR-006**: すべての表示データは 30 秒以内に再計算でき、最新状態を保持するためにリロード操作なしで手動更新ボタンを提供する。  
- **FR-007**: エッジケース時の警告（欠落節、証跡不足、ZIP サイズ超過）は UI と通知ログの両方に出力し、推奨対応手順を含む。
- **FR-008**: byterover-cipher への最新メモ更新が確認できない場合は差分再計算・エクスポート・操作ログ出力をブロックし、更新完了後にのみ処理を継続できるよう強制する。

### Key Entities

- **SpecificationDocument**: 仕様ファイル（spec seed, design, spec by kiro, README など）のメタ情報（パス、更新日時、編集者、対応セクション ID、差分状態）を保持。  
- **DiffRecord**: 対応する SpecificationDocument セクション間の差分と関連タスク/ブランチ/証跡パスを管理。状態（同期済み/差分あり/証跡待ち）とリスクメモを含む。  
- **ReviewPackage**: エクスポート要求時に生成される ZIP の構成要素（PDF サマリー、CSV、証跡リスト、ハッシュ）を記録し、再ダウンロード可否を制御。  
- **EvidenceReference**: `docs/result/<branch>/<task>/` 配下のファイルや MCP 実行ログを索引化し、DiffRecord や ReviewPackage から参照される。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 仕様レビュー画面で主要 3 文書の更新情報が 2 クリック以内・5 秒以内に表示される。  
- **SC-002**: 差分一覧の再計算を実行してから 30 秒以内に最新結果が描画され、結果が 200 行以内の場合は 5 秒以内。  
- **SC-003**: レビューパッケージ生成が 95% のケースで 60 秒以内に完了し、ダウンロード成功率 100% を維持する。  
- **SC-004**: 仕様差分に対する不明点チケット数を月次で 50% 以上削減し、レビュー会議前日の準備時間を 30 分以内に抑える。

## Assumptions

- 仕様ファイルは UTF-8 で保存され、章タイトルの表記ゆれは既存ルール（全角数字＋記号）に従う。  
- 差分計算対象は `docs/spec seed/*` と `docs/spec by kiro/.kiro/specs/bingo-game/*` に限定し、他ドキュメントはメタ情報参照のみとする。  
- `docs/result/<branch>/<task>/` フォルダーはタスク完了時に必ず生成され、少なくとも 1 件のスクリーンショットかログファイルが存在する。  
- byterover-cipher へのメモ更新はレビュー画面からリンクするボタンで行うことを想定している。
