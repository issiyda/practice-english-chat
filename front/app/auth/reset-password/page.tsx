import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "パスワードリセット - AI チャット英語学習システム",
  description: "パスワードを忘れた方はこちらからリセットできます。",
};
