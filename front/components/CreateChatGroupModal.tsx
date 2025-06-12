"use client";

import { useState, useTransition } from "react";
import { createChatGroup } from "@/app/actions/chat-groups";
import { useAuth } from "./AuthProvider";

interface CreateChatGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateChatGroupModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateChatGroupModalProps) => {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !user?.id) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("userId", user.id);

        await createChatGroup(formData);
        setTitle("");
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Failed to create chat group:", error);
        alert("チャットグループの作成に失敗しました");
      }
    });
  };

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            新しいチャットグループを作成
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isPending}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* モーダルコンテンツ */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="groupTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              グループ名
            </label>
            <input
              type="text"
              id="groupTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：英会話練習、ビジネス英語"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isPending}
              required
              maxLength={255}
            />
          </div>

          {/* モーダルフッター */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              disabled={isPending}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "作成中..." : "作成"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatGroupModal;
