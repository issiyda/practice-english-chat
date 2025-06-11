import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            認証エラー
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            認証処理中にエラーが発生しました。
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                認証に失敗しました
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  メール内のリンクが無効か、期限切れの可能性があります。
                  再度ログインを試すか、新しい確認メールを送信してください。
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ログイン画面に戻る
          </Link>
          <Link
            href="/auth/signup"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}
