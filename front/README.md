# Frontend Application

このディレクトリは、Practice English Chat のフロントエンドアプリケーション（Next.js）を含んでいます。

> 📖 **メインドキュメント**: プロジェクト全体の詳細については [../README.md](../README.md) をご覧ください。

## 🏗️ アーキテクチャ概要

### 技術スタック
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (認証・データベース)
- **AI SDK** (AI統合)

### セキュリティ設計
- **Server Actions**: APIキーのクライアント露出を防止
- **環境変数分離**: セキュアなキー管理
- **RLS (Row Level Security)**: データベースレベルでのアクセス制御

## 📁 プロジェクト構成

```
front/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions（サーバー処理）
│   ├── api/              # API Routes
│   ├── auth/             # 認証関連ページ
│   ├── bookmarks/        # ブックマーク管理ページ
│   ├── chat/             # チャット機能ページ
│   └── settings/         # 設定ページ
├── components/            # Reactコンポーネント
│   ├── auth/             # 認証関連コンポーネント
│   ├── AuthProvider.tsx  # 認証プロバイダ
│   └── Sidebar.tsx       # サイドバーナビゲーション
├── lib/                  # ユーティリティ・設定
│   ├── auth/             # 認証ロジック
│   ├── database.types.ts # Supabase型定義
│   └── supabase.ts       # Supabaseクライアント
└── utils/                # ヘルパー関数
    └── supabase/         # Supabaseユーティリティ
```

## 🚀 クイック開発

### 環境変数設定

`.env.local` ファイルを作成：

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI APIs (いずれか必要)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
```

### 開発コマンド

```bash
# 依存関係インストール
yarn install

# 開発サーバー起動
yarn dev

# ビルド
yarn build

# 型チェック
yarn typecheck

# リンター実行
yarn lint

# Supabase型定義更新
yarn update-types
```

## 🔧 開発ガイドライン

### Supabaseクライアント使用規則

⚠️ **重要**: 新しいSupabaseクライアントを作成せず、既存のインスタンスを使用してください

```typescript
// ✅ 推奨
import { supabase } from "@/lib/supabase";

// ❌ 避ける
const newClient = createClient(); // 作成禁止
```

### Server Actions パターン

```typescript
// app/actions/example.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function exampleAction() {
  const supabase = await createClient();
  // 処理...
}
```

### コンポーネント設計

```typescript
// components/Example.tsx
"use client";

import { useAuth } from "@/components/AuthProvider";

export default function Example() {
  const { user } = useAuth();
  // コンポーネント実装...
}
```

## 📋 開発時の注意点

- **型安全性**: TypeScriptの型定義を最大限活用
- **エラーハンドリング**: すべての非同期処理でエラーハンドリングを実装
- **認証チェック**: ユーザー認証が必要なページでは適切にチェック
- **セキュリティ**: APIキーやシークレットをクライアントサイドに露出させない

## 🔗 関連リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)

---

📖 **詳細なセットアップガイドやプロジェクト概要** については [メインREADME](../README.md) をご確認ください。
