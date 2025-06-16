"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import {
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  deleteUserAccount,
} from "@/app/actions/user-profile";
import type { Database } from "@/lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const SettingsPage = () => {
  const { user, handleSignOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
  });

  // プロフィールデータを読み込み
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const profileData = await getUserProfile(user.id);
        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError(
          error instanceof Error
            ? error.message
            : "プロフィールの読み込みに失敗しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  // プロフィール更新処理
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    try {
      setIsUpdating(true);
      setError(null);

      const result = await updateUserProfile(user.id, {
        name: formData.name.trim() || undefined,
      });

      if (result.success) {
        setProfile(result.data);
        alert("プロフィールを更新しました");
      } else {
        setError(result.error || null);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("プロフィールの更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  // アカウント削除処理
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    try {
      setIsDeleting(true);
      const result = await deleteUserAccount(user.id);

      if (result.success) {
        alert("アカウントを削除しました");
        await handleSignOut();
        router.push("/");
      } else {
        setError(result.error || null);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      setError("アカウントの削除に失敗しました");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">設定</h1>
          <p className="text-gray-600 text-sm mt-1">
            アカウント情報とプロフィールの管理
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* アカウント情報セクション */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                アカウント情報
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
                    {user?.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    メールアドレスは変更できません
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    アカウント作成日
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("ja-JP")
                      : "不明"}
                  </div>
                </div>
              </div>
            </div>

            {/* プロフィール設定セクション */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                プロフィール設定
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    表示名
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="例：田中太郎"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isUpdating}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    チャットやプロフィールに表示される名前です
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "更新中..." : "更新"}
                  </button>
                </div>
              </form>
            </div>

            {/* 危険な操作セクション */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-700 mb-4">
                危険な操作
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    アカウントを削除
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    アカウントを削除すると、すべてのチャット履歴、ブックマーク、プロフィール情報が完全に削除されます。この操作は取り消すことができません。
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    アカウントを削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* アカウント削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                アカウント削除の確認
              </h3>
              <p className="text-gray-700 mb-6">
                本当にアカウントを削除しますか？この操作は取り消すことができません。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "削除中..." : "削除"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
