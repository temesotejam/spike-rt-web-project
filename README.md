# SPIKE-RT Web Project

`github.dev`でSPIKE-RTアプリを編集し、GitHub Actionsでコンパイルし、GitHub PagesからSPIKE Prime HubへWebUSB DFU書き込みするための公開プロジェクトです。

## github.devでこのリポジトリを開く方法

`github.dev`のトップページを直接開くだけでは、このリポジトリは読み込まれません。空のVS Code風画面が表示された場合は、いったん通常のGitHubへ戻ってください。

### 一番簡単な開き方

1. 通常のGitHubで、このリポジトリのトップページを開く
2. ブランチが`main`になっていることを確認する
3. その画面で、キーボードの`.`（ピリオド）キーを押す
4. 同じリポジトリが`github.dev`の編集画面で開く

ユーザー名やリポジトリ名をURLへ手入力する必要はありません。

### 編集したいファイルを直接開く方法

1. 通常のGitHubで`apps`フォルダを開く
2. 編集するアプリのフォルダを開く
3. 同名の`.c`ファイルを開く
4. そのファイルを表示した状態で`.`キーを押す

例えば最初に試すファイルは次です。

```text
apps/myapp/myapp.c
```

この方法では、`github.dev`が開いたときに対象ファイルも一緒に表示されます。

### 左側の一覧から開く場合

`github.dev`が開いたら、左端のエクスプローラーで次の順に展開します。

```text
apps
└─ myapp
   └─ myapp.c
```

別のアプリを編集するときは、`myapp`の代わりに`button`、`led`、`motor`などを選びます。

### URLを使う場合

通常のGitHubで対象リポジトリまたは対象ファイルを開いたあと、アドレスバーのドメイン部分だけを`github.com`から`github.dev`へ変更する方法もあります。それより後ろの部分は変更しません。

URLを最初から手入力したり、ユーザー名部分を置き換えたりしないでください。`.`キーを使う方法の方が間違いが起きにくいです。

## 編集内容をGitHubへ保存する方法

1. `.c`ファイルを編集する
2. 左端の枝分かれしたアイコン「ソース管理」を開く
3. 上部の入力欄へ変更内容を書く
4. `Commit & Push`を押す
5. `Commit`だけが表示された場合は、Commit後に`Sync Changes`または`Push`を押す

保存が完了すると、この全件ビルド版ではGitHub Actionsが自動的に始まります。

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