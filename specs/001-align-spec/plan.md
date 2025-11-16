# Implementation Plan: Bingo抽選アプリ仕様整備

**Branch**: `[001-align-spec]` | **Date**: 2025-11-16 | **Spec**: specs/001-align-spec/spec.md
**Input**: Feature specification from `/specs/001-align-spec/spec.md`

**Note**: 本計画は `/speckit.plan` の各フェーズに合わせて更新される。

## Summary

- Start/Game/Setting 3 画面で抽選・履歴・景品・CSV 操作を司会 1 人で完結させ、spec の成功指標（抽選 3 秒以内、状態復元 100%、CSV 反映 30 秒以内）を満たす。
- ルート責務分離・localStorage 永続化・Tailwind UI の要件を TDD + オフライン検証で守るため、Phase0 で調査し Phase1 でデータ・契約・手順に落とし込む。
- テストスタックは `npm run typecheck` + Vitest/React Testing Library + Chrome DevTools MCP で統一し、抽選ロジック・CSV I/O・UI 操作を failure-first で検証する。
- ユーザーストーリー実行順は US1（Start）→ US3（抽選/履歴）→ US4（景品管理）→ US2（BGM）→ US5（Setting）を基本とし、US2 は US1 完了後であれば並列進行可とする。

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19（React Router v7、Vite）  
**Primary Dependencies**: React Router v7、Tailwind CSS、react-custom-roulette、@mui/icons-material、@dnd-kit/core、mizchi/similarity、Vite、Chrome DevTools MCP  
**Storage**: ブラウザ localStorage（バージョン付きキー）＋ CSV ファイル（`data/prizes.csv` 想定）  
**Testing**: `npm run typecheck`（react-router typegen → tsc）、Chrome DevTools MCP でのユーザーフロー確認、Vitest + React Testing Library + `@react-router/test`  
**Target Platform**: Chrome 最新版を用いたデスクトップ投影（オンライン依存なし）  
**Project Type**: Web SPA（Start/Game/Setting ルートを持つ React Router アプリ）  
**Performance Goals**: 抽選結果確定 3 秒以内、Start 操作 5 秒以内、CSV 反映 30 秒以内、重複抽選 0 件（spec 成功指標より）  
**Constraints**: 完全オフライン、Tailwind でモック遵守、Setting 画面 `<table>` 禁止、BGM/効果音/アイコンを `public/` にバンドル  
**Scale/Scope**: 参加者 10〜数百名、景品は数十件、ブラウザ操作者 1 名、Game/Start/Setting の 3 画面＋モーダル数種

## Constitution Check

*GATE: Phase0 着手前に必ず PASS を確認。Phase1 後に再評価。*

- **Dual-Spec Japanese Delivery**: spec seed/design と spec by kiro の両方を参照し、日本語のみで計画＋成果物を作成する → PASS
- **Route-Scoped Implementation Boundaries**: ルートファイルでは loader/action/画面マウントのみを扱い、ロジックは `app/common`・`app/components` へ集約する → PASS
- **Test-First Offline Reliability**: `docs/spec seed/requirements.md` へテストシナリオを追記後に実装し、`npm run typecheck`・Chrome DevTools MCP をマージ条件に設定 → PASS
- **Prize Data Stewardship**: 景品 CSV はダミーデータのみをリポジトリに置き、localStorage キーへバージョン付与・個人情報排除を必須化 → PASS
- **Experience-Parity UI & Audio**: Tailwind でモック通りの UI、`react-custom-roulette`、BGM トグルを再現し、`public/` に音源を格納する → PASS

Phase1 時点の再評価: 上記方針に基づきデータモデル・API 契約・Quickstart を策定済みのため、引き続き **PASS**。

## Project Structure

### Documentation (this feature)

```text
specs/001-align-spec/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md  # /speckit.tasks で作成予定
```

### Source Code (repository root)

```text
app/
├── root.tsx
├── routes/
│   ├── start.tsx
│   ├── game.tsx
│   └── setting.tsx
├── components/
│   ├── layout/
│   ├── ui/
│   └── modals/
└── common/
    ├── hooks/
    ├── contexts/
    ├── utils/
    └── types/

docs/
├── spec seed/
└── spec by kiro/

public/
├── audio/
└── images/

.specify/
├── templates/
└── scripts/
```

**Structure Decision**: React Router v7 + Vite の単一フロントエンド構成を維持し、業務ロジックは `app/common`、画面固有 UI は `app/components` で分離、仕様ドキュメントは `docs/`、MCP 設定は `.specify/` に集約する。

## Complexity Tracking

（現時点で憲章違反は無いため記載不要）
