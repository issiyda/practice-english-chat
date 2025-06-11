import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン - AI チャット英語学習システム",
  description: "アカウントにログインして、AI チャット英語学習を始めましょう。",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignInForm />
      </div>
    </div>
  );
}
