import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "パスワード更新 - AI チャット英語学習システム",
  description: "新しいパスワードを設定してアカウントを更新しましょう。",
};

function LoadingComponent() {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="h-4 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<LoadingComponent />}>
          <UpdatePasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
