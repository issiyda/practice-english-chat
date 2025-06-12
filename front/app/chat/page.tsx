"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { getChatGroups } from "@/app/actions/chat-groups";
import type { Database } from "@/lib/supabase";

type ChatGroup = Database["public"]["Tables"]["chat_groups"]["Row"];

const ChatPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChatGroups = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const groups = await getChatGroups(user.id);
        setChatGroups(groups);

        // チャットグループが1つしかない場合、自動的にそのグループに遷移
        if (groups.length === 1) {
          router.push(`/chat/${groups[0].id}`);
        }
      } catch (error) {
        console.error("Failed to load chat groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatGroups();
  }, [user?.id, router]);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー (C-01) */}
      <Sidebar />

      {/* メインコンテンツ */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            AI英語学習チャット
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            チャットグループを選択して学習を開始しましょう
          </p>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <div className="max-w-2xl mx-auto text-center">
            {chatGroups.length === 0 ? (
              // チャットグループがない場合
              <div className="space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-blue-600"
                  >
                    <path
                      d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.89 20 9.84 19.79 8.88 19.41L3 21L4.59 15.12C4.21 14.16 4 13.11 4 12C4 7.582 8.03 4 12 4C16.97 4 21 7.582 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    チャットグループを作成しましょう
                  </h2>
                  <p className="text-gray-600 mb-6">
                    まだチャットグループがありません。左側のサイドバーの「+」ボタンから新しいグループを作成して、AI英語学習を始めましょう。
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    💡 使い方のヒント
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 text-left">
                    <li>
                      •
                      テーマ別にグループを作成（例：「会議で使える表現」「レストランでの注文」）
                    </li>
                    <li>• AIが3つの異なる表現を同時に提案します</li>
                    <li>• 音声再生やブックマーク機能で効率的に学習</li>
                  </ul>
                </div>
              </div>
            ) : (
              // チャットグループがある場合
              <div className="space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-green-600"
                  >
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.418 16.97 20 12 20C10.89 20 9.84 19.79 8.88 19.41L3 21L4.59 15.12C4.21 14.16 4 13.11 4 12C4 7.582 8.03 4 12 4C16.97 4 21 7.582 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    チャットグループを選択してください
                  </h2>
                  <p className="text-gray-600 mb-6">
                    左側のサイドバーからチャットグループを選択して、AI英語学習を続けましょう。
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    現在のチャットグループ
                  </h3>
                  <div className="space-y-2">
                    {chatGroups.slice(0, 3).map((group) => (
                      <button
                        key={group.id}
                        onClick={() => router.push(`/chat/${group.id}`)}
                        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">
                            {group.title || "無題のグループ"}
                          </span>
                        </div>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-gray-400"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ))}
                    {chatGroups.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        その他 {chatGroups.length - 3} 個のグループ
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
