# 001-editorconfig-biome 証跡運用ガイド

## 保存ルール
- パス: `docs/result/001-editorconfig-biome/<task-id>/`
- ファイル名: `YYYYMMDD-HHMM_<tool>.log` / `YYYYMMDD-HHMM_<tool>.png`
  - `<tool>`: `chromedevtools`, `playwright`, `biome-lint`, `biome-format`, など実行ツールを表記
- タスクごとにサブディレクトリを作成し、Chrome DevTools MCP / Playwright MCP / Biome CLI の生ログやスクリーンショットを格納する

## 証跡取得フロー
1. タスク実行直後に Chrome DevTools MCP でログ・操作履歴を取得し、上記ルールで保存する
2. 追加の UI 証跡が必要な場合は Playwright MCP (Chromium) でスクリーンショットを取得し、同フォルダーへ配置する
3. `npm run lint` / `npm run format` / `npm run format:check` 実行結果を `*.log` として保存する
4. PR 作成時は各タスクの証跡パスをコミットメッセージと PR テンプレートに記載し、コミットはすべて github-mcp-server を通じて実行する

## 命名例
```
docs/result/001-editorconfig-biome/T005/20250211-1530_biome-format.log
docs/result/001-editorconfig-biome/T005/20250211-1532_chromedevtools.png
```

## リマインダー
- 証跡は Git 管理対象。不要な個人情報を含めない
- 失敗ログも保存し、再実行ごとに時刻を更新して残す
