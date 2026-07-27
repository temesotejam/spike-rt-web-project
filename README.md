# SPIKE-RT Web Project

公開1リポジトリで、SPIKE-RTアプリケーションの編集・コンパイル・ブラウザ書き込みを行うプロジェクトです。

1. `github.dev`で`app/`を編集
2. `main`へCommit & Push
3. GitHub ActionsがSPIKE-RTをコンパイル
4. `asp.bin`をArtifactとして保存
5. `web/`と最新`asp.bin`をGitHub Pagesへ公開
6. ChromeまたはEdgeからSPIKE Prime HubへUSB DFU書き込み

## 現在の機能

- SPIKE-RT `v0.2.0`を固定してビルド
- `app/myapp.*`から`asp.bin`を生成
- SHA-256、サイズ情報、ビルドログを生成
- Actions Artifactとして保存
- GitHub Pagesへ最新版を自動配置
- Pages上で最新版またはローカル`asp.bin`を読み込み
- WebUSBでVID `0694` / PID `0008`のDFU Hubだけを選択
- 書き込み先を`0x08008000`に固定
- 992 KiBを超えるファイルと範囲外書き込みを拒否
- 必要なフラッシュセクタだけを消去
- DfuSeで書き込み
- 全バイトをUSB DFUで読み戻して照合
- 検証成功後にHubの再起動を要求

## 実機検証状況

GitHub Actionsによるコンパイル、`asp.bin`生成、Pagesへのデプロイ、Pages上でのSHA-256確認までは動作確認済みです。

WebUSBによるHub接続・消去・書き込み・読み戻し検証・再起動は実装済みですが、このリポジトリではまだSPIKE Prime Hub実機による最終確認を行っていません。最初の試験では、復元手段を確保したHubと既知の正常な`asp.bin`を使用してください。

## 対応環境

- HTTPS上のGitHub Pages
- Google ChromeまたはMicrosoft Edgeなど、WebUSB対応のChromium系ブラウザ
- FirefoxおよびSafariはWebUSB非対応のため使用できません

### Windows

DFUモードの`LEGO Technic Large Hub in DFU Mode`へ、初回のみWinUSBドライバーを割り当てる必要がある場合があります。Zadigなどを使用する際は、必ずVID `0694` / PID `0008`のHubを選択してください。

### Linux

一般ユーザーからUSB DFUデバイスへアクセスできるよう、VID `0694` / PID `0008`に対するudevルールが必要になる場合があります。

## 書き込み手順

1. Pagesで「最新版を読み込む」を押す
2. Hubの電源を切りUSBを抜く
3. Bluetoothボタンを押したままUSBを接続する
4. 赤・緑・青に繰り返し点滅したらボタンを離す
5. 「Hubに接続」を押し、`LEGO Technic Large Hub in DFU Mode`を選ぶ
6. 安全確認へチェックする
7. 「書き込み開始」を押す
8. 消去、書き込み、読み戻し検証、再起動が完了するまでUSBを抜かない

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

- SPIKE-RTは固定タグから読み取るだけ
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

SPIKE-RT `v0.2.0`ではアプリ名と同名のCDLファイルも必要です。現在のWorkflowは公式`motor.cdl`をActions内だけで一時コピーしています。

## ローカル開発環境

必須ではありません。

- 編集: `github.dev`
- コンパイル: GitHub Actions
- 配布・書き込み: GitHub Pages

## 第三者コード

USB DFU / DfuSe実装は、Devan Lai氏の`devanlai/webdfu`を参照して再構成しています。ライセンス表記は[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)を参照してください。
