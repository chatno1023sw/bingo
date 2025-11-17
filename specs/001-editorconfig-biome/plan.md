# Implementation Plan: コードスタイル指針とフォーム運用

**Branch**: `001-editorconfig-biome` | **Date**: 2025-11-17 | **Spec**: [specs/001-editorconfig-biome/spec.md](spec.md)  
**Cipher MCP Entry**: TODO(CIPHER_ENTRY): byterover-cipher への記録後に ID と同期日を追記  
**Input**: Feature specification from `/specs/001-editorconfig-biome/spec.md`

**Note**: This plan整備後、研究・設計成果物を `/specs/001-editorconfig-biome/` 配下に追記し、`docs/result/001-editorconfig-biome/<task>/` にテスト証跡を保存する。

## Summary

一貫したコードスタイルとフォーム実装基準を確立するため、(1) `.editorconfig` で VSCode/CLI 共通のフォーマットルールを定義、(2) Biome を公式 lint/format ツールとして設定し npm script + CI と連携、(3) react-hook-form を適用する判断基準とチェックリストを docs に追加する。成果物は README/requirements の更新、Biom e config と npm scripts、フォーム運用ガイド、証跡ログ格納ルールで構成する。

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19（Vite/React Router v7）  
**Primary Dependencies**: Biome CLI, react-hook-form, Chrome DevTools MCP, Playwright MCP, Node.js/npm  
**Storage**: Git リポジトリ上のソースコード・docs（設定ファイルのみ）  
**Testing**: `npm run lint`（Biome）、`npm run format`, Chrome DevTools MCP 操作ログ、Playwright MCP（Chromium スクショ）  
**Target Platform**: Web（Vite dev server, React Router SPA/SSR 対応）  
**Project Type**: 単一のフロントエンドアプリ（`app/` 配下 React Router 構造）  
**Performance Goals**: Biome lint/format が 10 秒以内に完了し、CI でタイムアウトしない  
**Constraints**: オフライン運用・Chrome DevTools MCP/Playwright MCP による検証、`docs/result/<branch>/<task>/` へ証跡保存  
**Scale/Scope**: リポジトリ全体のスタイル整備 + 主要フォーム群（start/game/setting）の運用ガイド

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Cipher MCP（byterover-cipher）メモリーに plan/spec/tasks 要約と該当 spec seed 節番号（requirements 1.3, 2, 4, 5 など）を記録し、エントリ ID を本プランに追記する（作成後に更新）。
- [x] Chrome DevTools MCP を主要テストとし、Playwright MCP（Chromium）による補完証跡の取得手順を Summary/Quickstart/Research で明記する。
- [x] `docs/result/001-editorconfig-biome/<task>/` へテスト証跡を保存する運用（証跡名: `YYYYMMDD-HHMM_<tool>.log/png`）を Quickstart/Functional Requirements に記述する。

> Phase 1 完了時にもう一度チェックし、Cipher MCP ID 追記後に完了へ更新する。

## Project Structure

### Documentation (this feature)

```text
specs/001-editorconfig-biome/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── formatting.md
└── tasks.md (during /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── routes/
├── common/
├── components/
docs/
├── spec seed/
├── spec by kiro/
└── requirements/design assets
scripts/
└── lint/check helpers
package.json
.editorconfig (new)
biome.json (new)
```

**Structure Decision**: React Router + TypeScript 単一リポジトリ全体に適用する基盤変更であり、追加モジュールは不要。設定ファイルはリポジトリ直下に配置し、docs 内にガイドラインを追記する。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| なし |  |  |
