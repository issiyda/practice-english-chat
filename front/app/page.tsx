import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Practice English Chat
          </h1>
          <p className="text-xl text-slate-700 font-medium">
            英語チャット練習アプリにようこそ
          </p>
        </div>

        {user ? (
          // ログイン済みの場合
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-slate-200">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-white text-2xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                ようこそ！
              </h2>
              <p className="text-slate-700 mb-3 text-lg">
                <strong className="text-slate-800">メール:</strong> {user.email}
              </p>
              {user.user_metadata?.full_name && (
                <p className="text-slate-700 mb-3 text-lg">
                  <strong className="text-slate-800">名前:</strong>{" "}
                  {user.user_metadata.full_name}
                </p>
              )}
              <p className="text-slate-600 font-medium">
                ログイン日時:{" "}
                {new Date(user.last_sign_in_at || "").toLocaleString("ja-JP")}
              </p>
            </div>

            <div className="space-y-4">
              <button
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-3 focus:ring-green-400 focus:ring-offset-2 transition duration-200 font-semibold text-lg shadow-md"
                disabled
              >
                チャット開始（準備中）
              </button>

              <form action={signOut} className="w-full">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-3 focus:ring-red-400 focus:ring-offset-2 transition duration-200 font-semibold text-lg shadow-md"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        ) : (
          // 未ログインの場合
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              始めましょう
            </h2>
            <p className="text-slate-700 mb-8 text-lg">
              アカウントを作成して英語チャット練習を開始しましょう
            </p>

            <div className="space-y-4">
              <Link
                href="/auth/signup"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:ring-offset-2 transition duration-200 block font-semibold text-lg shadow-md"
              >
                新規登録
              </Link>

              <Link
                href="/auth/signin"
                className="w-full bg-slate-700 text-white py-4 px-6 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-3 focus:ring-slate-400 focus:ring-offset-2 transition duration-200 block font-semibold text-lg shadow-md"
              >
                ログイン
              </Link>
            </div>
          </div>
        )}

        <div className="flex gap-4 items-center flex-col sm:flex-row text-sm">
          <div className="bg-green-100 border border-green-300 p-4 rounded-lg shadow-sm">
            <span className="text-green-900 font-bold">
              ✅ {user ? "ログイン済み" : "新規登録機能"}
            </span>
          </div>
          <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg shadow-sm">
            <span className="text-blue-900 font-bold">🔐 Supabase認証</span>
          </div>
          <div className="bg-purple-100 border border-purple-300 p-4 rounded-lg shadow-sm">
            <span className="text-purple-900 font-bold">🛡️ セキュア</span>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-slate-700 font-medium">
        <span>Powered by Next.js & Supabase</span>
      </footer>
    </div>
  );
}
