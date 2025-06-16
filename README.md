# Practice English Chat 🗨️

AI 駆動による英語学習チャットシステム

<!-- Devin verification: Repository access confirmed -->

## 概要

Practice English Chat は、AI（OpenAI、Anthropic、Google）を活用した英語学習プラットフォームです。リアルタイムで AI との会話を通じて、自然な英語学習体験を提供します。

## 🚀 技術スタック

### フロントエンド

- **Next.js 15** - React フレームワーク（Turbopack 対応）
- **React 19** - UI ライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファースト CSS
- **AI SDK** - AI 統合ライブラリ

### バックエンド・データベース

- **Supabase** - バックエンドサービス（PostgreSQL, 認証, リアルタイム）
- **Row Level Security (RLS)** - データセキュリティ

### AI 統合

- **OpenAI API** - GPT-4/3.5
- **Anthropic Claude** - Claude-3
- **Google Gemini** - Gemini Pro
- **AI SDK** - ストリーミングレスポンス対応

### バリデーション・その他

- **Zod** - スキーマバリデーション
- **ESLint** - コード品質管理

## 📊 データベース構造

```sql
-- ユーザープロフィール
profiles (id, user_id, name, created_at, updated_at)

-- チャットグループ（会話セッション）
chat_groups (id, user_id, title, created_at, updated_at)

-- チャットメッセージ
chat_messages (id, chat_group_id, role, message, created_at, updated_at)

-- ブックマーク機能
bookmarks (id, user_id, chat_message_id, created_at, updated_at)
```

### データベース設定

**RLS (Row Level Security) ポリシー:**

- 各テーブルでユーザー固有のデータへのアクセス制御
- `user_id` を基準とした行レベルセキュリティ

**必要な権限設定:**

- `anon` ロール: 認証前のアクセス
- `authenticated` ロール: 認証後の CRUD 操作

**初期設定手順:**

1. Supabase プロジェクトで上記テーブルを作成
2. RLS ポリシーを有効化
3. 適切な権限をロールに設定

## 🛠️ セットアップ

### 必要な環境

- Node.js 18+ (推奨: 20+)
- Yarn 1.22+ または npm 8+

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd practice-english-chat
```

### 2. フロントエンドのセットアップ

```bash
cd front
yarn install
```

### 3. 環境変数の設定

`front/.env.local` を作成し、以下を設定：

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys
# ⚠️ 実際の本番環境では .env.local に設定し、決してコミットしないでください
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
```

### 4. データベースのマイグレーション

```bash
# Supabaseプロジェクトをセットアップ済みの場合
cd front
yarn update-types  # TypeScript型定義を生成
```

### 5. 開発サーバーの起動

```bash
cd front
yarn dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 🎯 主要機能

### 💬 AI チャット機能

- リアルタイムストリーミングレスポンス
- 複数の AI プロバイダー対応
- 英語学習に特化したプロンプト設計

### 👤 ユーザー認証

- Supabase Auth による安全な認証
- 自動セッション管理
- プロフィール自動作成

### 📁 チャット管理

- グループ化された会話セッション
- 会話履歴の永続化
- タイトル自動生成

### 🔖 ブックマーク機能

- 重要なメッセージの保存
- ユーザー別ブックマーク管理

### 📱 レスポンシブデザイン

- モバイル・デスクトップ対応
- モダンな UI/UX

## 🔧 開発ガイドライン

### Supabase 使用規則

⚠️ **重要**: 新しい Supabase クライアントを作成せず、必ず `front/lib/supabase.ts` のクライアントを使用してください。

```typescript
import { supabase } from "@/lib/supabase";

// ✅ 正しい使用方法
const { data, error } = await supabase.from("chat_messages").select("*");
```

### AI 統合のベストプラクティス

- `@ai-sdk/react` のフックを活用
- エラーハンドリングでフォールバック応答を実装
- レスポンス品質の監視とログ記録

### コードスタイル

- TypeScript の型安全性を最大限活用
- ESLint ルールに従った開発
- Zod によるランタイムバリデーション

## 📝 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
yarn dev

# プロダクションビルド
yarn build

# プロダクションサーバー起動
yarn start

# リンタ実行
yarn lint

# Supabase型定義更新
yarn update-types
```

## 🤝 コントリビューション

1. フィーチャーブランチを作成
2. 変更をコミット
3. プルリクエストを作成

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🔗 関連リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
