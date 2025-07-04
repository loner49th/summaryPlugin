# Today Summary

Obsidianで今日更新されたノートをOpenAI APIを使って要約するプラグインです。

## 機能

- 今日（日本時間）に更新されたマークダウンファイルを自動検出
- 複数のノートを結合してOpenAI APIで要約
- 長いテキストは自動的にチャンクに分割して処理
- 要約結果をモーダルウィンドウで表示
- **📋 ワンクリックコピー機能**: 要約内容をクリップボードに簡単コピー
- **📄 更新ファイル一覧表示**: どのファイルが要約されたかを表示
- リボンアイコンとコマンドパレットからアクセス可能

## インストール

1. このリポジトリをObsidianのプラグインフォルダにクローンまたはダウンロード
2. プラグインフォルダで`npm install`を実行
3. `npm run build`でプラグインをビルド
4. Obsidianの設定からプラグインを有効化

## 設定

プラグインを使用する前に以下の設定が必要です：

1. **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com)でAPIキーを取得
2. **要約プロンプト**: 要約に使用するプロンプトをカスタマイズ可能（デフォルト: "以下のメモを日本語で要約してください:\n{{text}}"）

## 使い方

1. Obsidianの左サイドバーのカレンダーアイコンをクリック
2. または、コマンドパレット（Ctrl/Cmd + P）から「今日更新ノートを要約」を実行
3. 今日更新されたノートがある場合、自動的に要約が生成されます
4. 要約結果がモーダルウィンドウで表示されます
5. **「コピー」ボタンをクリック**して要約内容をクリップボードにコピー

## 技術仕様

- **対象ファイル**: 今日（JST）に更新されたマークダウンファイル
- **AI モデル**: OpenAI GPT-4.1（最新の高性能モデル）
- **チャンクサイズ**: 100,000文字（大容量対応）
- **最大トークン数**: 16,000トークン（長文要約対応）
- **リトライ機能**: API呼び出し失敗時の自動リトライ（最大3回）
- **クリップボード対応**: 最新のClipboard APIとフォールバック機能

## 新機能

### v1.1.0 の新機能
- ✨ **GPT-4.1対応**: より正確で詳細な要約が可能
- 📋 **コピー機能追加**: 要約内容をワンクリックでコピー
- 📄 **ファイル名表示**: 要約対象のファイル一覧を表示
- 🎨 **UI改善**: モダンで使いやすいインターフェース
- ⚡ **大容量対応**: より大きなテキストの処理が可能

## 開発

```bash
# 依存関係のインストール
npm install

# 開発モード（ファイル監視）
npm run dev

# プロダクションビルド
npm run build
```

## セキュリティ

- OpenAI APIキーはローカルに保存されます
- 通信はHTTPSで暗号化されています
- エラー情報の詳細表示を制限しています

## トラブルシューティング

### よくある問題

1. **「OpenAI API keyが設定されていません」**
   - プラグイン設定でAPIキーを入力してください

2. **「本日更新されたノートはありません」**
   - 今日編集したマークダウンファイルがない場合に表示されます

3. **要約エラーが発生する場合**
   - APIキーが正しいかどうか確認してください
   - OpenAIの利用制限に達していないか確認してください

## ライセンス

MIT License

## 作者

YourName