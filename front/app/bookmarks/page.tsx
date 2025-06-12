"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import {
  getBookmarksWithPagination,
  removeBookmark,
} from "@/app/actions/bookmarks";

// Supabaseから取得するブックマークデータの型定義（一時的にanyを使用してデバッグ）
interface BookmarkData {
  id: number;
  created_at: string;
  chat_message_id: number;
  chat_messages: any;
}

// 表示用のブックマークデータ型
interface DisplayBookmark {
  id: number;
  chatMessageId: number;
  englishText: string;
  chatGroupTitle: string;
  createdAt: string;
}

interface DeleteModalProps {
  isOpen: boolean;
  bookmarkText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// 削除確認モーダル
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
  bookmark: DisplayBookmark;
  onDelete: (id: number, chatMessageId: number) => void;
  onPlayAudio: (text: string) => void;
  isDeleting?: boolean;
}

// ブックマークカードコンポーネント
const BookmarkCard = ({
  bookmark,
  onDelete,
  onPlayAudio,
  isDeleting = false,
}: BookmarkCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-lg font-medium text-gray-900 mb-2">
            {bookmark.englishText}
          </p>
          <p className="text-gray-600 mb-3">
            チャットグループ: {bookmark.chatGroupTitle}
          </p>
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
            onClick={() => onDelete(bookmark.id, bookmark.chatMessageId)}
            disabled={isDeleting}
            className={`p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="削除"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
            ) : (
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
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ページネーションコンポーネント
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          hasPrevPage
            ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
        }`}
      >
        前へ
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            page === currentPage
              ? "text-white bg-blue-600 border border-blue-600"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          hasNextPage
            ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
        }`}
      >
        次へ
      </button>
    </div>
  );
};

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<DisplayBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    bookmarkId: number | null;
    chatMessageId: number | null;
    bookmarkText: string;
  }>({
    isOpen: false,
    bookmarkId: null,
    chatMessageId: null,
    bookmarkText: "",
  });

  // ブックマークデータを変換する関数
  const convertBookmarkData = (
    bookmarkData: BookmarkData[]
  ): DisplayBookmark[] => {
    return bookmarkData
      .filter(
        (item) =>
          item.chat_messages !== null && item.chat_messages !== undefined
      )
      .map((item) => {
        const chatMessage = item.chat_messages;
        let chatGroupTitle = "不明なグループ";
        let messageText = "";

        // データ構造を確認して適切に処理
        if (Array.isArray(chatMessage)) {
          // 配列の場合
          const message = chatMessage[0];
          messageText = message?.message || "";
          if (message?.chat_groups) {
            chatGroupTitle = Array.isArray(message.chat_groups)
              ? message.chat_groups[0]?.title || "不明なグループ"
              : message.chat_groups?.title || "不明なグループ";
          }
        } else if (chatMessage && typeof chatMessage === "object") {
          // オブジェクトの場合
          messageText = chatMessage.message || "";
          if (chatMessage.chat_groups) {
            chatGroupTitle = Array.isArray(chatMessage.chat_groups)
              ? chatMessage.chat_groups[0]?.title || "不明なグループ"
              : chatMessage.chat_groups?.title || "不明なグループ";
          }
        }

        return {
          id: item.id,
          chatMessageId: item.chat_message_id,
          englishText: messageText,
          chatGroupTitle: chatGroupTitle,
          createdAt: item.created_at,
        };
      });
  };

  // ブックマークを読み込む関数
  const loadBookmarks = async (page: number = 1) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getBookmarksWithPagination(user.id, page, 1);

      if (result.success && result.data && result.pagination) {
        const displayBookmarks = convertBookmarkData(result.data);
        setBookmarks(displayBookmarks);
        setPagination(result.pagination);
        setCurrentPage(page);
      } else {
        setError(result.error || "ブックマークの取得に失敗しました");
      }
    } catch (err) {
      console.error("ブックマーク取得エラー:", err);
      setError("ブックマークの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 初期読み込み
  useEffect(() => {
    loadBookmarks(1);
  }, [user?.id]);

  const handlePlayAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  const handleDeleteClick = (id: number, chatMessageId: number) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (bookmark) {
      setDeleteModal({
        isOpen: true,
        bookmarkId: id,
        chatMessageId: chatMessageId,
        bookmarkText: bookmark.englishText,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.chatMessageId && deleteModal.bookmarkId) {
      setDeletingId(deleteModal.bookmarkId);

      try {
        const result = await removeBookmark(deleteModal.chatMessageId);

        if (result.success) {
          // 削除成功時は現在のページを再読み込み
          await loadBookmarks(currentPage);
        } else {
          setError(result.error || "ブックマークの削除に失敗しました");
        }
      } catch (err) {
        console.error("ブックマーク削除エラー:", err);
        setError("ブックマークの削除に失敗しました");
      } finally {
        setDeletingId(null);
        setDeleteModal({
          isOpen: false,
          bookmarkId: null,
          chatMessageId: null,
          bookmarkText: "",
        });
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      bookmarkId: null,
      chatMessageId: null,
      bookmarkText: "",
    });
  };

  const handlePageChange = (page: number) => {
    loadBookmarks(page);
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">ログインが必要です</p>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => loadBookmarks(currentPage)}
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

      <div className="flex-1 ml-64 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              ブックマーク一覧
            </h1>
            <p className="text-gray-600 text-center mt-2">
              保存した英語表現を確認・管理できます
            </p>
          </div>

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
                    {pagination.totalCount}件のブックマーク
                    {pagination.totalPages > 1 && (
                      <span className="ml-2">
                        (ページ {pagination.currentPage} /{" "}
                        {pagination.totalPages})
                      </span>
                    )}
                  </p>
                </div>

                {bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onDelete={handleDeleteClick}
                    onPlayAudio={handlePlayAudio}
                    isDeleting={deletingId === bookmark.id}
                  />
                ))}

                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

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
