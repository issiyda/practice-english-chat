# Practice English Chat 🗨️

**AI 駆動による英語学習チャットシステム**

<!-- Devin verification: Repository access confirmed -->

## 📖 このプロジェクトについて

Practice English Chat は、AI との自然な対話を通じて英語を学習できる革新的なチャットアプリケーションです。従来の教材ベースの学習ではなく、**あなたが今知りたい英語表現**を AI に質問し、実際の会話で使える表現を学ぶことができます。

### ✨ 主な特徴

- 🤖 **複数の AI エンジン対応**: OpenAI GPT、Anthropic Claude、Google Gemini
- 💬 **リアルタイム対話**: ストリーミングで自然な会話体験
- 📚 **実践的な学習**: 実際の場面で使える英語表現を学習
- 🔖 **ブックマーク機能**: 重要な表現を保存して後で復習
- 📱 **レスポンシブデザイン**: PC・スマートフォン対応

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

## 🚀 クイックスタート

### 必要な環境

- **Node.js** 18+ (推奨: 20+)
- **Yarn** 1.22+ または **npm** 8+
- **Supabase アカウント** (無料)

### 1️⃣ リポジトリのクローン

```bash
git clone https://github.com/issiyda/practice-english-chat.git
cd practice-english-chat
```

### 2️⃣ 依存関係のインストール

```bash
cd front
yarn install
```

### 3️⃣ Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com) でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクト設定で以下の情報を取得：
   - Project URL
   - API Keys (anon key)

### 4️⃣ 環境変数の設定

`front/.env.local` ファイルを作成：

```env
# Supabase 設定
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys（いずれか1つ以上必要）
OPENAI_API_KEY=your_openai_api_key          # GPT-4/3.5用
ANTHROPIC_API_KEY=your_anthropic_api_key    # Claude用
GOOGLE_API_KEY=your_google_api_key          # Gemini用
```

> ⚠️ **重要**: APIキーは絶対にコミットしないでください

### 5️⃣ データベースのセットアップ

```bash
# Supabaseプロジェクトのマイグレーション実行
cd front
yarn update-types  # TypeScript型定義を生成
```

### 6️⃣ 開発サーバーの起動

```bash
yarn dev
```

🎉 **完了！** `http://localhost:3000` でアプリケーションが起動します。

## 🎯 主要機能

### 💬 インテリジェントな AI チャット
- **リアルタイムストリーミング**: 回答が段階的に表示され、自然な会話体験
- **複数の AI モデル**: OpenAI GPT、Claude、Gemini から選択可能
- **学習特化プロンプト**: 英語学習に最適化された AI 応答

### 👤 簡単なユーザー管理
- **セキュアな認証**: Supabase Auth による安全なログイン/登録
- **自動プロフィール作成**: 登録時に学習プロフィールを自動生成
- **セッション管理**: ログイン状態の自動維持

### 📁 会話の整理・管理
- **チャットグループ**: トピック別に会話を整理
- **履歴保存**: 過去の学習内容をいつでも確認可能
- **自動タイトル生成**: 会話内容に基づいて適切なタイトルを付与

### 🔖 学習コンテンツの保存
- **ワンクリックブックマーク**: 重要な英語表現を簡単保存
- **復習機能**: 保存した表現をまとめて確認
- **音声再生**: 正しい発音を何度でも確認

### 📱 どこでも学習
- **完全レスポンシブ**: スマートフォン・タブレット・PC 対応
- **モダン UI**: 直感的で使いやすいインターフェース

## 🛠️ 開発者向けガイド

### 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
yarn dev

# プロダクションビルド
yarn build

# プロダクションサーバー起動
yarn start

# コード品質チェック
yarn lint

# Supabase型定義更新
yarn update-types
```

### 重要な開発ルール

#### Supabase クライアント使用規則
⚠️ **必須**: 新しい Supabase クライアントを作成せず、既存のクライアントを使用

```typescript
// ✅ 正しい方法
import { supabase } from "@/lib/supabase";
const { data, error } = await supabase.from("chat_messages").select("*");

// ❌ 間違った方法
const newSupabase = createClient(); // 作成しない
```

#### AI 統合ベストプラクティス
- `@ai-sdk/react` フックの活用
- エラーハンドリングとフォールバック応答の実装
- レスポンス品質の監視とログ記録

#### コードスタイル
- **TypeScript**: 型安全性を最大限活用
- **ESLint**: 設定されたルールに従った開発
- **Zod**: ランタイムバリデーションの実装

### プロジェクト構成
```
front/
├── app/                 # Next.js App Router
│   ├── actions/        # Server Actions
│   ├── api/           # API Routes
│   ├── auth/          # 認証関連ページ
│   └── ...
├── components/         # Reactコンポーネント
├── lib/               # ユーティリティ・設定
└── utils/             # ヘルパー関数
```

## 📚 使い方の例

### 💡 学習シナリオ例

1. **ビジネス英語を学びたい**
   ```
   ユーザー: "会議で使える丁寧な英語表現を教えて"
   AI: 3つの実用的な表現を提案（例文・発音・使用場面付き）
   ```

2. **日常会話を練習したい**
   ```
   ユーザー: "レストランで注文するときの英語"
   AI: シチュエーション別の自然な表現を提案
   ```

3. **特定の表現を知りたい**
   ```
   ユーザー: "「お疲れ様」は英語でなんて言うの？"
   AI: 文脈に応じた複数の表現を解説
   ```

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 貢献の流れ
1. このリポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチをプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

### 開発に参加する前に
- [要件定義書](./documents/要件定義書.md)でプロジェクトの目的を確認
- [開発テンプレート](./create-page-and-action.md)でコーディング規約を確認
- 既存のイシューを確認し、重複を避ける

## 📄 関連ドキュメント

- **設計書類**: [`documents/`](./documents/) フォルダに要件定義・画面設計・DB設計・API設計書を配置
- **開発ガイド**: [`create-page-and-action.md`](./create-page-and-action.md)に詳細な開発テンプレート
- **プロンプト作成**: [`documents/プロンプト書き方.md`](./documents/プロンプト書き方.md)

## 🔗 技術資料

- [Next.js Documentation](https://nextjs.org/docs) - Reactフレームワーク
- [Supabase Documentation](https://supabase.com/docs) - バックエンドサービス
- [AI SDK Documentation](https://sdk.vercel.ai/docs) - AI統合ライブラリ
- [Tailwind CSS](https://tailwindcss.com/docs) - CSSフレームワーク

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

💬 **質問やフィードバックがありましたら、[Issue](https://github.com/issiyda/practice-english-chat/issues) を作成してください！**
