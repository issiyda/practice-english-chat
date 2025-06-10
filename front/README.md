# Practice English Chat

英語チャット練習アプリです。Supabase 認証機能を実装しており、新規登録機能を提供します。

## 機能

- ✅ 新規登録機能（Server Actions 使用）
- 🔐 Supabase 認証統合
- 🛡️ セキュアな API キー管理

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**環境変数の取得方法：**

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. Project Settings > API から以下を取得：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. 依存関係のインストール

```bash
yarn install
```

### 3. 開発サーバーの起動

```bash
yarn dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

### 4. 新規登録ページ

[http://localhost:3000/auth/signup](http://localhost:3000/auth/signup) で新規登録ページにアクセスできます。

## アーキテクチャ

### セキュリティ機能

- **Server Actions**: API キーがクライアントサイドに露出しない
- **環境変数分離**: クライアント用とサーバー用のキーを適切に分離
- **フォームバリデーション**: サーバーサイドでの入力検証

### ファイル構成

```
lib/
├── auth/
│   └── actions.ts          # Server Actions (認証処理)
├── supabase.ts             # Supabase設定
components/
├── auth/
│   └── SignUpForm.tsx      # 新規登録フォーム
app/
├── auth/
│   └── signup/
│       └── page.tsx        # 新規登録ページ
```

## 今後の拡張予定

- [ ] ログイン機能
- [ ] パスワードリセット
- [ ] プロフィール管理
- [ ] セッション管理

---

## Original Next.js Documentation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
