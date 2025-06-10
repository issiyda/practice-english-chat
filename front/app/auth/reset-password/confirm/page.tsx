import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

export default function ConfirmResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "パスワード更新 - AI チャット英語学習システム",
  description: "新しいパスワードを設定してください。",
};
