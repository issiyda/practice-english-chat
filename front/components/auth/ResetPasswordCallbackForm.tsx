"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handlePasswordResetCallback } from "@/lib/auth/actions";

type CallbackState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

export default function ResetPasswordCallbackForm() {
  const [state, formAction, isPending] = useActionState<
    CallbackState,
    FormData
  >(handlePasswordResetCallback, null);
  const [processingStatus, setProcessingStatus] = useState<
    "loading" | "processing" | "invalid" | "error"
  >("loading");
  const [tokens, setTokens] = useState<{
    access_token: string;
    refresh_token: string;
    type: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // URLハッシュフラグメントからトークン情報を取得
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    console.log("パスワードリセットトークン情報:", {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      type,
    });

    if (!accessToken || !refreshToken || type !== "recovery") {
      console.log("無効なトークン情報");
      setProcessingStatus("invalid");
      return;
    }

    const tokenData = {
      access_token: accessToken,
      refresh_token: refreshToken,
      type: type,
    };

    setTokens(tokenData);
    setProcessingStatus("processing");

    // Server Actionを実行
    const executeCallback = async () => {
      try {
        const formData = new FormData();
        formData.append("access_token", accessToken);
        formData.append("refresh_token", refreshToken);
        formData.append("type", type);

        console.log("Server Actionを実行中...");
        await formAction(formData);
      } catch (error) {
        console.error("Server Action実行エラー:", error);
        setProcessingStatus("error");
      }
    };

    executeCallback();
  }, [formAction]);

  // 認証成功時はパスワード更新画面にリダイレクト
  useEffect(() => {
    if (state?.success) {
      console.log("認証成功、パスワード更新画面にリダイレクト");
      router.push("/auth/reset-password/confirm");
    } else if (state?.error) {
      console.log("認証エラー:", state.error);
      setProcessingStatus("error");
    }
  }, [state, router]);

  // 無効なリセットリンクの場合
  if (processingStatus === "invalid") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              無効なリセットリンク
            </h2>
            <p className="text-gray-600 mb-6">
              パスワードリセットリンクが無効です。リンクの有効期限が切れているか、既に使用済みの可能性があります。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth/reset-password")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                パスワードリセットに戻る
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
              >
                ログイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラーが発生した場合
  if (processingStatus === "error" || state?.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              認証エラー
            </h2>
            <p className="text-gray-600 mb-6">
              {state?.error ||
                "パスワードリセットの認証中にエラーが発生しました。"}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth/reset-password")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                パスワードリセットに戻る
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
              >
                ログイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 認証処理中の場合
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-4">
            <svg
              className="animate-spin mx-auto h-12 w-12 text-blue-600"
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
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            認証中...
          </h2>
          <p className="text-gray-600">
            パスワードリセットの認証を行っています。しばらくお待ちください。
          </p>

          {/* デバッグ情報（開発環境のみ） */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-left">
              <p>
                <strong>処理状況:</strong> {processingStatus}
              </p>
              <p>
                <strong>トークン取得:</strong> {tokens ? "成功" : "待機中"}
              </p>
              <p>
                <strong>Server Action:</strong>{" "}
                {isPending ? "実行中" : "待機中"}
              </p>
              {state && (
                <p>
                  <strong>結果:</strong> {JSON.stringify(state)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
