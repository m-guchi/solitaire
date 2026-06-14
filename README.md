# Solitaire

ブラウザで遊べる Klondike ソリティア（PWA 対応）。

## ローカル開発

```bash
npm run dev
```

ブラウザで [http://localhost:8080](http://localhost:8080) を開いて確認できます。

## 環境変数の設定（1Password）

デプロイ用の秘密情報は **1Password** で管理します。リポジトリに含まれる `.github/deploy.env.tpl` に secret reference が定義されています。

### 1. 1Password にシークレットを登録

`apps` ボールトに以下のアイテムを作成し、フィールドを登録してください。

| アイテム | フィールド名 | 説明 |
| :--- | :--- | :--- |
| `solitaire` | `DEPLOY_PATH` | 静的ファイルの配置先（例: `/var/www/html/solitaire`） |
| `githubaction-sshkey` | `PRIVATE_KEY` | SSH 秘密鍵（デプロイ用・他アプリと共通） |
| `Server` | `host` | デプロイ先サーバーのホスト名または IP |
| `Server` | `username` | SSH 接続ユーザー名 |
| `Server` | `ssh-port` | SSH ポート番号（例: `22`） |

`Server` と `githubaction-sshkey` は [portfolio](https://github.com/m-guchi/portfolio) などと共通のものを使えます。ボールト名やアイテム名を変更した場合は、`.github/deploy.env.tpl` 内の `op://` 参照も合わせて更新してください。

### 2. GitHub Actions（CI/CD）

GitHub リポジトリには **1つだけ** シークレットを登録します。

| Secret Name | 説明 |
| :--- | :--- |
| `OP_SERVICE_ACCOUNT_TOKEN` | 1Password Service Account のトークン（`apps` ボールトへの読み取り権限） |

`main` ブランチへのプッシュで、ビルド → SSH デプロイが自動実行されます。デプロイに必要な SSH 情報はすべて 1Password から取得されます。

### 3. サーバー側の準備

1. `DEPLOY_PATH` のディレクトリを作成し、Web サーバーから読み取り可能にする
2. Apache の場合、`DEPLOY_PATH` を DocumentRoot または Alias で公開する

**本番（推奨）:** サブドメイン直下に公開する場合（例: `https://klondike.game.gucchii.com/`）、`DEPLOY_PATH` をその VirtualHost の DocumentRoot に設定します。

```apache
<VirtualHost *:443>
  ServerName klondike.game.gucchii.com
  DocumentRoot /var/www/klondike.game.gucchii.com
  <Directory /var/www/klondike.game.gucchii.com>
    Options -Indexes
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
```

**別パターン:** 既存サイトのサブパス（例: `/solitaire/`）で公開する場合:

```apache
Alias /solitaire /var/www/html/solitaire
<Directory /var/www/html/solitaire>
  Options -Indexes
  AllowOverride All
  Require all granted
</Directory>
```

**注意:** サーバー側で `/icons` に Alias 等が設定されていると、アイコンだけ 404 になることがあります（`js/` や `styles.css` は正常）。本リポジトリではアイコンを `assets/` に配置しています。

## デプロイの流れ

1. `npm run build` で `package.json` のバージョンを `js/changelog.js` に同期
2. 静的ファイル（`index.html`, `styles.css`, `js/`, `assets/` など）を `dist/` にまとめる
3. rsync でサーバーの `DEPLOY_PATH` へ転送（`--delete` で古いファイルを削除）

## スクリプト

| コマンド | 説明 |
| :--- | :--- |
| `npm run dev` | ローカル開発サーバー（ポート 8080） |
| `npm run build` | バージョン同期（CI / デプロイ前） |
| `npm run icons` | `assets/icon.svg` から favicon / PWA アイコンを生成 |
