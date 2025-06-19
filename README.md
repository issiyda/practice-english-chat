# 🗨️ Practice English Chat

AIとの会話で楽しく英語を学習できるWebアプリケーション

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![AI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Claude%20%7C%20Gemini-orange)

## ✨ 特徴

🤖 **AIとリアルタイム会話** - OpenAI、Claude、Geminiとストリーミングで自然な会話  
📱 **レスポンシブデザイン** - PC・スマホどちらでも快適な学習体験  
� **会話履歴の保存** - 過去の学習内容をいつでも振り返り可能  
🔖 **重要な発言をブックマーク** - 学び直したい表現を簡単に保存  
🔐 **安全なユーザー管理** - Supabaseによる認証とデータ保護  

## � クイックスタート

### 必要な環境
- Node.js 18以上（推奨: 20以上）
- Yarn または npm

### 1. セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd practice-english-chat/front

# 依存関係をインストール
yarn install
```

### 2. 環境変数の設定

`front/.env.local` ファイルを作成：

```bash
# Supabase（必須）
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI APIキー（少なくとも1つは必須）
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
```

**📝 環境変数の取得方法:**
- **Supabase**: [公式サイト](https://supabase.com)でプロジェクト作成 → Settings > API
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: [Anthropic Console](https://console.anthropic.com/)
- **Google**: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. データベースセットアップ

Supabaseプロジェクトで以下のマイグレーションを実行：

```bash
# プロジェクトルートから
cd supabase
# マイグレーションファイルをSupabaseにアップロード
```

### 4. 開発サーバー起動

```bash
cd front
yarn dev
```

🎉 **完了！** `http://localhost:3000` でアプリケーションが起動します

## 📱 使い方

1. **新規登録/ログイン** - メールアドレスでアカウント作成
2. **チャット開始** - 新しい会話を開始してAIと英語で対話
3. **学習記録** - 会話は自動保存され、いつでも振り返り可能
4. **ブックマーク** - 重要な表現や間違いを記録
5. **継続学習** - 毎日の学習で英語力を向上

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15** - React フレームワーク（App Router + Turbopack）
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - モダンなスタイリング

### バックエンド
- **Supabase** - 認証・データベース・リアルタイム機能
- **PostgreSQL** - メインデータベース
- **Row Level Security** - データ保護

### AI統合
- **AI SDK** - ストリーミングレスポンス対応
- **OpenAI GPT-4/3.5** - 高品質な会話AI
- **Anthropic Claude** - 自然な対話AI
- **Google Gemini** - 多言語対応AI

## � データベース構造

```sql
profiles         -- ユーザープロフィール
chat_groups      -- 会話セッション
chat_messages    -- チャットメッセージ
bookmarks        -- ブックマーク機能
```

詳細な設計書は [`documents/`](./documents/) フォルダを参照してください。

## 🔧 開発者向け情報

### 重要なルール
⚠️ **Supabaseクライアント**: 必ず `front/lib/supabase.ts` のクライアントを使用

```typescript
import { supabase } from "@/lib/supabase";

// ✅ 正しい使用方法
const { data, error } = await supabase.from("chat_messages").select("*");
```

### 開発コマンド

```bash
yarn dev          # 開発サーバー起動
yarn build        # プロダクションビルド
yarn start        # プロダクションサーバー
yarn lint         # コード品質チェック
yarn update-types # Supabase型定義更新
```

### ファイル構造

```
front/
├── app/              # Next.js App Router
│   ├── auth/         # 認証ページ
│   ├── chat/         # チャット機能
│   └── api/          # API エンドポイント
├── components/       # 再利用可能コンポーネント
├── lib/              # ユーティリティ・設定
└── utils/            # Supabaseクライアント
```

## � トラブルシューティング

### よくある問題

**❌ Supabaseに接続できない**
- `.env.local` の環境変数を確認
- Supabaseプロジェクトの設定を確認

**❌ AIが応答しない**
- APIキーの有効性を確認
- 使用量制限に達していないか確認

**❌ ビルドエラー**
```bash
# 依存関係を再インストール
rm -rf node_modules yarn.lock
yarn install
```

**❌ TypeScriptエラー**
```bash
# Supabase型定義を更新
yarn update-types
```

## 📚 関連ドキュメント

- [要件定義書](./documents/要件定義書.md)
- [画面設計書](./documents/画面設計書.md)
- [API設計書](./documents/API設計書.md)
- [DB設計書](./documents/DB設計書.md)

## 🤝 コントリビューション

1. フィーチャーブランチを作成
2. 変更をコミット
3. プルリクエストを作成

詳細は [コントリビューションガイド](./documents/プロンプト書き方.md) を参照

## � ライセンス

MIT ライセンスで公開されています。

## 🔗 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**🚀 今すぐ始めて、AIとの英語学習を体験してみましょう！**
