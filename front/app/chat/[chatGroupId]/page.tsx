"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import {
  getChatMessages,
  saveChatMessage,
  getChatGroup,
} from "@/app/actions/chat-messages";
import type { Database } from "@/lib/supabase";

type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
type ChatGroup = Database["public"]["Tables"]["chat_groups"]["Row"];

interface MessageWithStreamIndex extends ChatMessage {
  streamIndex?: number;
  isStreaming?: boolean;
}

export default function ChatGroupPage() {
  const params = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatGroupId = params.chatGroupId
    ? parseInt(params.chatGroupId as string)
    : null;

  const [chatGroup, setChatGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<MessageWithStreamIndex[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // メッセージの最下部にスクロールする関数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadData = async () => {
      if (!chatGroupId || !user?.id) return;

      try {
        setIsLoadingData(true);
        const [groupData, messagesData] = await Promise.all([
          getChatGroup(chatGroupId, user.id),
          getChatMessages(chatGroupId, user.id),
        ]);

        if (!groupData) {
          setError("チャットグループが見つかりません");
          return;
        }

        setChatGroup(groupData);
        setMessages(
          messagesData.map((msg) => ({
            ...msg,
            streamIndex: undefined,
            isStreaming: false,
          }))
        );

        if (messagesData.length === 0) {
          const welcomeMessage: MessageWithStreamIndex = {
            id: -1,
            chat_group_id: chatGroupId,
            role: "assistant",
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
  const handleSendMessage = async () => {
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
        role: "assistant",
        message: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, tempAiMessage]);

      // APIに送信
      const chatMessages = [
        ...messages.filter((msg) => msg.id !== -1), // ウェルカムメッセージを除外
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
              } catch (e) {
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
          const updatedMessages = await getChatMessages(chatGroupId, user.id);
          setMessages(
            updatedMessages.map((msg) => ({
              ...msg,
              streamIndex: undefined,
              isStreaming: false,
            }))
          );
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
  };

  // Enterキーでメッセージ送信
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chatGroupId) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">無効なチャットグループIDです</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingData) {
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
