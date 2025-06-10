import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "ログイン - AI チャット英語学習システム",
  description: "アカウントにログインして、AI チャット英語学習を始めましょう。",
};
