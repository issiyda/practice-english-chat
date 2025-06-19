# 🔧 フロントエンド開発ガイド

Practice English Chat のフロントエンド部分の開発者向けドキュメントです。

## 🚀 開発環境のセットアップ

### 必要な環境
- Node.js 18+ (推奨: 20+)
- Yarn または npm

### インストール & 起動

```bash
# 依存関係のインストール
yarn install

# 開発サーバー起動
yarn dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## 🔑 環境変数

`.env.local` ファイルを作成し、以下の環境変数を設定：

```bash
# Supabase（必須）
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI APIキー（少なくとも1つは必須）
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
```

### 🔗 APIキー取得先
- **Supabase**: [Settings > API](https://supabase.com/dashboard) から取得
- **OpenAI**: [Platform](https://platform.openai.com/api-keys)
- **Anthropic**: [Console](https://console.anthropic.com/)
- **Google**: [AI Studio](https://makersuite.google.com/app/apikey)

## 📁 ディレクトリ構造

```
app/
├── (routes)/          # ページルート
│   ├── auth/          # 認証関連ページ
│   ├── chat/          # チャット機能
│   ├── bookmarks/     # ブックマーク
│   └── settings/      # 設定
├── api/               # API ルート
├── actions/           # Server Actions
└── globals.css        # グローバルスタイル

components/
├── auth/              # 認証関連コンポーネント
├── AuthProvider.tsx   # 認証プロバイダ
├── Sidebar.tsx        # サイドバー
└── ...

lib/
├── auth/              # 認証ユーティリティ
├── supabase.ts        # Supabase設定（重要！）
└── database.types.ts  # DB型定義

utils/
└── supabase/          # Supabaseクライアント
```

## 🔧 開発コマンド

```bash
yarn dev              # 開発サーバー起動（Turbopack使用）
yarn build            # プロダクションビルド
yarn start            # プロダクションサーバー
yarn lint             # ESLint実行
yarn update-types     # Supabase型定義更新
```

## 🛡️ 重要な開発ルール

### Supabaseクライアントの使用

**⚠️ 必ず `lib/supabase.ts` のクライアントを使用してください**

```typescript
// ✅ 正しい使用方法
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from("chat_messages")
  .select("*");
```

### Server Actions

API キーは Server Actions 内でのみ使用し、クライアントサイドに露出させないでください：

```typescript
// app/actions/example.ts
"use server";

export async function serverAction() {
  // APIキーはここで安全に使用
  const apiKey = process.env.OPENAI_API_KEY;
}
```

## 🎯 主要機能の実装

### 認証
- `components/auth/` - 認証フォーム
- `lib/auth/actions.ts` - Server Actions
- `components/AuthProvider.tsx` - 認証状態管理

### チャット
- `app/chat/` - チャットページ
- `app/api/chat/route.ts` - ストリーミングAPI
- AI SDK使用でリアルタイム会話

### ブックマーク
- `app/bookmarks/` - ブックマーク一覧
- `app/actions/bookmarks.ts` - ブックマーク操作

## 🐛 よくある問題

### 型エラー
```bash
# Supabase型定義を更新
yarn update-types
```

### 環境変数が読み込まれない
- ファイル名が `.env.local` か確認
- 変数名にタイポがないか確認
- サーバーを再起動

### ビルドエラー
```bash
# 依存関係をクリーンインストール
rm -rf node_modules yarn.lock
yarn install
```

## 📚 参考リソース

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [AI SDK](https://sdk.vercel.ai/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

📝 詳細なプロジェクト情報は [プロジェクトルートのREADME](../README.md) を参照してください。
