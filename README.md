# SPIKE-RT Web Project

`github.dev`でSPIKE-RTアプリを編集し、GitHub Actionsでコンパイルし、GitHub PagesからSPIKE Prime HubへWebUSB DFU書き込みするための公開プロジェクトです。

## 現在の構成

```text
apps/
├─ myapp/
├─ button/
├─ led/
├─ motor/
├─ led_fast/
└─ led_countdown/
```

1回のWorkflowでSPIKE-RTカーネルを1回だけコンパイルし、そのカーネルを共用して`apps/`以下の全アプリを順番にビルドします。生成されたファームウェアはアプリ名別にPagesへ保存され、Web画面の選択欄から読み込めます。

## 収録アプリ

| ID | 内容 | 出典 |
|---|---|---|
| `myapp` | 起動ログ後に待機する最小アプリ | このリポジトリ |
| `button` | Hubボタン入力をUSBシリアルログへ表示 | SPIKE-RT v0.2.0公式 |
| `led` | a〜zを5×5表示へ順番に表示 | SPIKE-RT v0.2.0公式 |
| `motor` | ポートAのモーターを回転・停止 | SPIKE-RT v0.2.0公式 |
| `led_fast` | 0〜9を0.25秒ごとに表示 | 公式LED例から派生 |
| `led_countdown` | 9〜0を1秒ごとに表示 | 公式LED例から派生 |

`motor`は実機でモーターが自動的に動くため、Web画面にも警告を表示します。

## 編集から書き込みまで

```text
github.devでapps/<アプリID>/<アプリID>.cを編集
→ Commit & Push
→ GitHub Actionsがカーネル1回＋全アプリをビルド
→ Pagesへアプリ別asp.binを配置
→ Web画面でプログラムを選択
→ HubへDFU書き込み
```

## アプリの追加

最低限、次の2ファイルを追加します。

```text
apps/new_app/
├─ new_app.c
└─ project.json
```

フォルダ名、Cファイル名、`project.json`の`id`は同じにします。IDには英字、数字、アンダースコアを使用し、先頭は英字にしてください。

```json
{
  "id": "new_app",
  "name": "New App",
  "description": "画面に表示する説明",
  "warning": "",
  "origin": "自作"
}
```

`new_app.h`、`new_app.cfg`、`new_app.cdl`が無い場合、Workflowが標準構成を一時生成します。タスク構成を変更したい場合は、同名のファイルをアプリフォルダへ追加すると自動生成より優先されます。

## ビルド結果

Pagesには次のように配置されます。

```text
firmware/
├─ catalog.json
├─ myapp/
│  ├─ asp.bin
│  ├─ manifest.json
│  ├─ asp.bin.sha256
│  ├─ size.txt
│  └─ build.log
└─ ...
```

`catalog.json`からWeb画面が利用可能なアプリを自動検出します。アプリ追加時にWeb側の選択肢を手作業で更新する必要はありません。

## WebUSB書き込み

- 対象: LEGO SPIKE Prime Hub DFUモード
- USB VID: `0x0694`
- USB PID: `0x0008`
- 書き込み先: `0x08008000`
- 最大サイズ: 992 KiB
- 処理: 必要セクタ消去 → 分割書き込み → 全バイト読み戻し検証 → 再起動

WebUSB部分は実装済みで模擬DFUテストまで実施していますが、実機による最終確認はまだです。

## GitHub Pages設定

`Settings` → `Pages` → `Build and deployment` → `Source`を`GitHub Actions`に設定します。

## SPIKE-RT公式リポジトリへの安全対策

- SPIKE-RTは`v0.2.0`を一時チェックアウト
- `persist-credentials: false`
- SPIKE-RTのPush URLを`DISABLED`へ変更
- PAT、SSH秘密鍵、Deploy Keyを使用しない
- ビルドジョブの権限は`contents: read`
- Pagesデプロイジョブだけに`pages: write`と`id-token: write`
- SPIKE-RT側へPushする処理を持たない

Actions内のSPIKE-RTコピーと自動生成したヘッダー・設定ファイルは、ジョブ終了時に削除されます。

## ライセンス

このリポジトリのライセンスは`LICENSE`を、使用・派生した第三者コードについては`THIRD_PARTY_NOTICES.md`を参照してください。
