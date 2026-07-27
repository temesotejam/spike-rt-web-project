# SPIKE-RT Web Project

公開1リポジトリで、次の流れを実現するための初期構成です。

1. `github.dev`で`app/`を編集
2. `main`へCommit & Push
3. GitHub ActionsがSPIKE-RTをコンパイル
4. `asp.bin`をArtifactとして保存
5. `web/`と最新`asp.bin`をGitHub Pagesへ公開
6. 次の段階でWebUSB DFU書き込みを追加

## 現在できること

- SPIKE-RT公式ソースを固定コミットで取得
- `app/myapp.*`をコンパイル
- `asp.bin`、SHA-256、サイズ情報、ビルドログを生成
- Artifactとして保存
- GitHub Pagesへ最新版を配置
- Pages上で最新版またはローカル`asp.bin`を読み込み、SHA-256を確認
- `asp.bin`をPCへ保存

## まだ実装していないこと

- SPIKE Prime HubへのWebUSB接続
- USB DFU / DfuSeによる消去・書き込み
- 読み戻し検証
- Hubの再起動

`web/dfu.js`と`web/dfuse.js`は、次の段階で実装するための枠です。

## リポジトリ設定

### GitHub Pages

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. `Source`を`GitHub Actions`に設定

### GitHub Actions

`Settings` → `Actions` → `General` → `Workflow permissions`で、読み取り権限を基本にしてください。

このWorkflowは、ビルドジョブでは`contents: read`だけを使用し、デプロイジョブだけに`pages: write`と`id-token: write`を与えます。

## SPIKE-RT公式リポジトリへの安全対策

- SPIKE-RTは固定コミットから読み取るだけ
- `persist-credentials: false`
- SPIKE-RTのPush URLを`DISABLED`へ変更
- PAT、SSH秘密鍵、Deploy Keyを使用しない
- `GITHUB_TOKEN`はこのリポジトリに限定
- SPIKE-RT側へPushする処理を持たない

GitHub Actions内で変更される`spike-rt/`は一時コピーで、ジョブ終了時に削除されます。

## アプリ名を変更する場合

`.github/workflows/build-and-deploy.yml`の`APP_NAME`を変更し、ファイル名も合わせます。

```text
app/
├─ 新しい名前.c
├─ 新しい名前.h
└─ 新しい名前.cfg
```

## ローカル開発環境

必須ではありません。

- 編集: `github.dev`
- コンパイル: GitHub Actions
- 配布: GitHub Pages
- 書き込み: 次段階のWebUSB実装
