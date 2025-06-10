import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Practice English Chat
          </h1>
          <p className="text-lg text-gray-600">
            英語チャット練習アプリにようこそ
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            始めましょう
          </h2>
          <p className="text-gray-600 mb-6">
            アカウントを作成して英語チャット練習を開始しましょう
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/signup"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 block"
            >
              新規登録
            </Link>

            <Link
              href="/auth/signin"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 block"
            >
              ログイン
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row text-sm">
          <div className="bg-green-50 border border-green-200 p-3 rounded-md">
            <span className="text-green-800 font-medium">✅ 新規登録機能</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
            <span className="text-blue-800 font-medium">🔐 Supabase認証</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-3 rounded-md">
            <span className="text-purple-800 font-medium">🛡️ セキュア</span>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-500">
        <span>Powered by Next.js & Supabase</span>
      </footer>
    </div>
  );
}
