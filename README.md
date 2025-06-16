# Practice English Chat 🗨️

**AI を活用した次世代英語学習プラットフォーム**

<!-- Devin verification: Repository access confirmed -->

## 📖 プロジェクトについて

Practice English Chat は、**AI との自然な会話を通じて英語力を向上させる**ことを目的としたWebアプリケーションです。

### 🎯 こんな方におすすめ
- 英語で自然な会話を練習したい方
- AI との対話で英語学習を楽しみたい方
- 自分のペースで英語スキルを向上させたい方
- 24時間いつでも英語学習をしたい方

### ✨ 特徴
- **複数のAI搭載**: OpenAI GPT、Anthropic Claude、Google Gemini から選択可能
- **リアルタイム会話**: ストリーミングレスポンスによる自然な対話体験
- **学習履歴管理**: 過去の会話を振り返りながら学習を継続
- **ブックマーク機能**: 重要な表現や学習ポイントを保存
- **レスポンシブデザイン**: スマートフォンでもパソコンでも快適に利用可能

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

## 🛠️ セットアップガイド

### 📋 必要な環境

開始する前に、以下がインストールされていることを確認してください：

- **Node.js** 18 以上（推奨: 20 以上）
  - [Node.js 公式サイト](https://nodejs.org/)からダウンロード
- **Yarn** 1.22 以上または **npm** 8 以上
- **Git**（リポジトリのクローンに必要）

### 🚀 クイックスタート

#### 1. リポジトリのクローン

```bash
git clone https://github.com/issiyda/practice-english-chat.git
cd practice-english-chat
```

#### 2. フロントエンドの依存関係をインストール

```bash
cd front
yarn install
# または npm install
```

#### 3. 環境変数の設定

`front/.env.local` ファイルを作成し、以下を設定してください：

```env
# Supabase 設定
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API キー（使用したいAIサービスのキーを設定）
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
```

> ⚠️ **重要**: API キーは絶対にコミットしないでください。`.env.local` ファイルは Git で無視されます。

#### 4. データベースのセットアップ

Supabase プロジェクトをセットアップした後：

```bash
cd front
yarn update-types  # TypeScript の型定義を生成
```

#### 5. 開発サーバーの起動

```bash
cd front
yarn dev
```

🎉 **完了！** ブラウザで `http://localhost:3000` を開いてアプリケーションを確認してください。

### 🔧 詳細な設定手順

#### Supabase の設定

1. [Supabase](https://supabase.com/) でアカウントを作成
2. 新しいプロジェクトを作成
3. データベースの SQL エディタで以下のテーブルを作成：

```sql
-- プロフィールテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- チャットグループテーブル
CREATE TABLE chat_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- チャットメッセージテーブル
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_group_id UUID REFERENCES chat_groups ON DELETE CASCADE,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ブックマークテーブル
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  chat_message_id UUID REFERENCES chat_messages ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

4. Row Level Security (RLS) を有効化
5. 適切な RLS ポリシーを設定

#### AI API キーの取得

- **OpenAI**: [OpenAI プラットフォーム](https://platform.openai.com/)
- **Anthropic**: [Anthropic Console](https://console.anthropic.com/)
- **Google**: [Google AI Studio](https://makersuite.google.com/)

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

## 📱 使用方法

### 基本的な使い方

1. **アカウント作成・ログイン**
   - アプリケーションにアクセスしてアカウントを作成
   - メールアドレスとパスワードでログイン

2. **新しいチャットを開始**
   - 「新しいチャット」ボタンをクリック
   - 使用したい AI モデルを選択（GPT-4、Claude、Gemini）

3. **英語で会話**
   - 英語でメッセージを入力
   - AI が英語で返答し、自然な会話を楽しめます

4. **学習の管理**
   - 重要な表現やフレーズをブックマーク
   - 過去の会話履歴を振り返って復習

### 🎯 効果的な学習のコツ

- **具体的なシチュエーションを設定**: 「レストランでの注文」「面接の練習」など
- **間違いを恐れない**: AI は間違いを優しく訂正してくれます
- **継続的な学習**: 毎日少しずつでも続けることが重要
- **ブックマーク活用**: 覚えたい表現は必ずブックマークして後で復習

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

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. 開発サーバーが起動しない

**症状**: `yarn dev` でエラーが発生する

**解決方法**:
```bash
# Node modules を削除して再インストール
rm -rf node_modules
yarn install

# または npm を使用している場合
rm -rf node_modules
npm install
```

#### 2. API キーエラー

**症状**: AI との会話でエラーが発生する

**解決方法**:
- `.env.local` ファイルが正しく作成されているか確認
- API キーが正しく設定されているか確認
- API キーに十分なクレジットがあるか確認

#### 3. データベース接続エラー

**症状**: Supabase への接続でエラーが発生する

**解決方法**:
- Supabase プロジェクトの URL と Anon Key が正しいか確認
- RLS ポリシーが正しく設定されているか確認
- テーブルが正しく作成されているか確認

#### 4. 型エラーが発生する

**症状**: TypeScript の型エラーが表示される

**解決方法**:
```bash
# Supabase の型定義を更新
yarn update-types
```

### サポートが必要な場合

問題が解決しない場合は、以下の情報を含めて Issue を作成してください：

- エラーメッセージの詳細
- 使用している環境（Node.js バージョン、OS など）
- 実行したコマンドとその結果

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

