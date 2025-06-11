"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/auth/actions";
import Link from "next/link";

type ResetPasswordState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetPassword, null);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        パスワードの再設定
      </h2>

      <p className="text-sm text-gray-600 text-center mb-6">
        登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
      </p>

      {state?.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            placeholder="example@email.com"
            disabled={isPending || state?.success}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || state?.success}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              送信中...
            </div>
          ) : (
            "再設定メールを送信"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/signin"
          className="text-blue-600 hover:text-blue-500 font-medium text-sm"
        >
          ← ログイン画面に戻る
        </Link>
      </div>
    </div>
  );
}
