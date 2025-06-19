"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  getChatMessagesWithBookmarks,
  getChatGroup,
} from "@/app/actions/chat-messages";
import {
  addBookmark,
  removeBookmark,
} from "@/app/actions/bookmarks";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import type { Tables } from "@/lib/supabase";

type ChatMessage = Tables<"chat_messages">;
type ChatGroup = Tables<"chat_groups">;

interface MessageWithStreamIndex extends ChatMessage {
  streamIndex?: number;
  isStreaming?: boolean;
  isBookmarked?: boolean;
}

export default function ChatGroupPage() {
  const params = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatGroupId = useMemo(() => 
    params.chatGroupId ? parseInt(params.chatGroupId as string) : null, 
    [params.chatGroupId]
  );

  const [chatGroup, setChatGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<MessageWithStreamIndex[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null);

  // メッセージの最下部にスクロールする関数
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ブックマークの切り替え処理
  const toggleBookmark = useCallback(async (messageId: number) => {
    if (!user?.id || bookmarkLoading === messageId) return;

    setBookmarkLoading(messageId);

    try {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message) return;

      const result = message.isBookmarked
        ? await removeBookmark(messageId)
        : await addBookmark(messageId);

      if (result.success) {
        // メッセージのブックマーク状態を更新
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isBookmarked: !msg.isBookmarked }
              : msg
          )
        );
      } else {
        setError(result.error || "ブックマーク操作に失敗しました");
      }
    } catch (err) {
      console.error("ブックマーク操作エラー:", err);
      setError("ブックマーク操作に失敗しました");
    } finally {
      setBookmarkLoading(null);
    }
  }, [user?.id, bookmarkLoading, messages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const loadData = async () => {
      if (!chatGroupId || !user?.id) return;

      try {
        setIsLoadingData(true);
        const [groupData, messagesData] = await Promise.all([
          getChatGroup(chatGroupId, user.id),
          getChatMessagesWithBookmarks(chatGroupId, user.id),
        ]);

        if (!groupData) {
          setError("チャットグループが見つかりません");
          return;
        }

        setChatGroup(groupData);

        // メッセージの設定
        const messagesWithStreamProps = messagesData.map((msg) => ({
          ...msg,
          streamIndex: undefined,
          isStreaming: false,
        }));

        setMessages(messagesWithStreamProps);

        if (messagesData.length === 0) {
          const welcomeMessage: MessageWithStreamIndex = {
            id: -1,
            chat_group_id: chatGroupId,
            role: "ai",
            message: `こんにちは！「${groupData.title}」のチャットへようこそ。`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isStreaming: false,
          };
          setMessages([welcomeMessage]);
        }
      } catch (err) {
        console.error("データ読み込みエラー:", err);
        setError(
          err instanceof Error ? err.message : "データの読み込みに失敗しました"
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [chatGroupId, user?.id]);

  // メッセージ送信処理
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !chatGroupId || !user?.id || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // ユーザーメッセージを即座にUIに表示
      const newUserMessage: MessageWithStreamIndex = {
        id: Date.now(), // 一時的なID
        chat_group_id: chatGroupId,
        role: "user",
        message: userMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isStreaming: false,
      };

      setMessages((prev) => [...prev, newUserMessage]);

      // AI応答用の一時メッセージを作成
      const tempAiMessage: MessageWithStreamIndex = {
        id: Date.now() + 1,
        chat_group_id: chatGroupId,
        role: "ai",
        message: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, tempAiMessage]);

      // APIに送信用にメッセージを正しい形式に変換
      const chatMessages = [
        ...messages
          .filter((msg) => msg.id !== -1) // ウェルカムメッセージを除外
          .map((msg) => ({
            role: msg.role === "ai" ? "ai" : "user",
            content: msg.message,
          })),
        { role: "user", content: userMessage },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: chatMessages,
          chatGroupId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // ストリーミングレスポンスを処理
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let aiResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const jsonStr = line.slice(2);
                const data = JSON.parse(jsonStr);
                if (data && typeof data === "string") {
                  aiResponse += data;

                  // リアルタイムでメッセージを更新
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === tempAiMessage.id
                        ? { ...msg, message: aiResponse }
                        : msg
                    )
                  );
                }
              } catch {
                // JSON解析エラーは無視
              }
            }
          }
        }
      }

      // ストリーミング完了後、メッセージを最終的に更新
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiMessage.id ? { ...msg, isStreaming: false } : msg
        )
      );

      // データベースを更新するためにメッセージを再読み込み
      setTimeout(async () => {
        try {
          const updatedMessages = await getChatMessagesWithBookmarks(chatGroupId, user.id);
          const messagesWithStreamProps = updatedMessages.map((msg) => ({
            ...msg,
            streamIndex: undefined,
            isStreaming: false,
          }));
          setMessages(messagesWithStreamProps);
        } catch (err) {
          console.error("メッセージ再読み込みエラー:", err);
        }
      }, 1000);
    } catch (err) {
      console.error("メッセージ送信エラー:", err);
      setError(
        err instanceof Error ? err.message : "メッセージの送信に失敗しました"
      );

      // エラー時は追加したメッセージを削除
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setIsLoading(false);
    }
  }, [input, chatGroupId, user?.id, isLoading, messages]);

  // Enterキーでメッセージ送信
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  if (!chatGroupId) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage message="無効なチャットグループIDです" />
        </div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage message={error} onRetry={clearError} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {chatGroup?.title || "チャット"}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            チャットグループID: {chatGroupId}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    } ${message.isStreaming ? "animate-pulse" : ""}`}
                  >
                    {message.message}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-5 bg-gray-500 ml-1 animate-pulse">
                        |
                      </span>
                    )}
                  </div>

                  {/* AIメッセージの場合のみブックマークアイコンを表示 */}
                  {message.role === "ai" &&
                    message.id !== -1 &&
                    !message.isStreaming && (
                      <div className="mt-2 flex items-center">
                        <button
                          onClick={() => toggleBookmark(message.id)}
                          disabled={bookmarkLoading === message.id}
                          className={`p-2 rounded-full transition-colors ${
                            message.isBookmarked
                              ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                          } ${
                            bookmarkLoading === message.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={
                            message.isBookmarked
                              ? "ブックマークを削除"
                              : "ブックマークに追加"
                          }
                        >
                          {bookmarkLoading === message.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              fill={
                                message.isBookmarked ? "currentColor" : "none"
                              }
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? "送信中..." : "送信"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
