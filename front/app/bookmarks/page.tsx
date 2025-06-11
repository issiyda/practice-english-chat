"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

// モックデータ
const mockBookmarks = [
  {
    id: 1,
    englishText: "I'd like to schedule a follow-up meeting.",
    japaneseText: "フォローアップミーティングを予定したいと思います。",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    englishText: "Could you please send me the agenda in advance?",
    japaneseText: "事前にアジェンダを送っていただけますか？",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    englishText: "Let's table this discussion for now.",
    japaneseText: "この議論は今のところ保留にしましょう。",
    createdAt: "2024-01-13",
  },
  {
    id: 4,
    englishText: "I appreciate your feedback on this matter.",
    japaneseText: "この件についてのご意見をいただき、ありがとうございます。",
    createdAt: "2024-01-12",
  },
  {
    id: 5,
    englishText: "Could you clarify what you mean by that?",
    japaneseText: "それはどういう意味か説明していただけますか？",
    createdAt: "2024-01-11",
  },
];

interface DeleteModalProps {
  isOpen: boolean;
  bookmarkText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// 削除確認モーダル (C-02)
const DeleteModal = ({
  isOpen,
  bookmarkText,
  onConfirm,
  onCancel,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ブックマークを削除
        </h3>
        <p className="text-gray-600 mb-2">このブックマークを削除しますか？</p>
        <div className="bg-gray-50 p-3 rounded-md mb-6">
          <p className="text-sm text-gray-700 font-medium">"{bookmarkText}"</p>
        </div>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
};

interface BookmarkCardProps {
  bookmark: {
    id: number;
    englishText: string;
    japaneseText: string;
    createdAt: string;
  };
  onDelete: (id: number) => void;
  onPlayAudio: (text: string) => void;
}

// ブックマークカードコンポーネント
const BookmarkCard = ({
  bookmark,
  onDelete,
  onPlayAudio,
}: BookmarkCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-lg font-medium text-gray-900 mb-2">
            {bookmark.englishText}
          </p>
          <p className="text-gray-600 mb-3">{bookmark.japaneseText}</p>
          <p className="text-sm text-gray-400">
            保存日: {new Date(bookmark.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          {/* 音声再生アイコン */}
          <button
            onClick={() => onPlayAudio(bookmark.englishText)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            title="音声を再生"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
            >
              <path
                d="M11 5L6 9H2V15H6L11 19V5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.07 4.93C20.9445 6.80448 21.9998 9.34785 21.9998 12C21.9998 14.6522 20.9445 17.1955 19.07 19.07"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 12C17.0039 13.3308 16.4774 14.6024 15.54 15.54"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 削除アイコン */}
          <button
            onClick={() => onDelete(bookmark.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            title="削除"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
            >
              <path
                d="M3 6H5H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 11V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState(mockBookmarks);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    bookmarkId: number | null;
    bookmarkText: string;
  }>({
    isOpen: false,
    bookmarkId: null,
    bookmarkText: "",
  });

  const handlePlayAudio = (text: string) => {
    // 音声再生の実装（後でAPIと繋ぎ込み予定）
    console.log("音声再生:", text);
    // モック実装：ブラウザの音声合成機能を使用
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  const handleDeleteClick = (id: number) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (bookmark) {
      setDeleteModal({
        isOpen: true,
        bookmarkId: id,
        bookmarkText: bookmark.englishText,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.bookmarkId) {
      setBookmarks((prev) =>
        prev.filter((b) => b.id !== deleteModal.bookmarkId)
      );
      setDeleteModal({
        isOpen: false,
        bookmarkId: null,
        bookmarkText: "",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      bookmarkId: null,
      bookmarkText: "",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー (C-01) */}
      <Sidebar />

      {/* メインコンテンツ */}
      <div className="flex-1 ml-64 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              ブックマーク一覧
            </h1>
            <p className="text-gray-600 text-center mt-2">
              保存した英語表現を確認・管理できます
            </p>
          </div>

          {/* コンテンツエリア */}
          <div className="space-y-4">
            {bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-gray-400"
                  >
                    <path
                      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ブックマークがありません
                </h3>
                <p className="text-gray-500 mb-4">
                  チャット画面で英語表現をブックマークして、ここで確認できます。
                </p>
                <button
                  onClick={() => (window.location.href = "/chat")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  チャットを開始
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    {bookmarks.length}件のブックマーク
                  </p>
                </div>

                {bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={handleDeleteClick}
                    onPlayAudio={handlePlayAudio}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 削除確認モーダル (C-02) */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        bookmarkText={deleteModal.bookmarkText}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default BookmarksPage;
