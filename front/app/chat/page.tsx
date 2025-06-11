"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streamIndex?: number; // AIメッセージの場合のストリーム番号（0, 1, 2）
  isStreaming?: boolean;
}

interface MessageCardProps {
  message: ChatMessage;
  onPlayAudio: (text: string) => void;
  onBookmark: (englishText: string, japaneseText?: string) => void;
  isStreaming?: boolean;
}

// メッセージカードコンポーネント
const MessageCard = ({
  message,
  onPlayAudio,
  onBookmark,
  isStreaming = false,
}: MessageCardProps) => {
  const isUser = message.role === "user";

  // AIの応答から英語表現を抽出する関数
  const extractEnglishPhrases = (content: string) => {
    const phrases: { english: string; japanese: string }[] = [];
    // "文章"（翻訳）のパターンを抽出
    const matches = content.match(/"([^"]+)"\s*（([^）]+)）/g);
    if (matches) {
      matches.forEach((match) => {
        const parts = match.match(/"([^"]+)"\s*（([^）]+)）/);
        if (parts) {
          phrases.push({
            english: parts[1],
            japanese: parts[2],
          });
        }
      });
    }
    return phrases;
  };

  const englishPhrases = !isUser ? extractEnglishPhrases(message.content) : [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-2xl px-4 py-3 rounded-lg relative ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
        } ${isStreaming ? "animate-pulse" : ""}`}
      >
        {/* AIメッセージの場合、ストリーム番号を表示 */}
        {!isUser && message.streamIndex !== undefined && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            #{message.streamIndex + 1}
          </div>
        )}

        {/* AIメッセージの場合、吹き出し内の右上に音声再生とブックマークアイコンを表示 */}
        {!isUser && !isStreaming && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={() => onPlayAudio(message.content)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="音声再生"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
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
              </svg>
            </button>
            <button
              onClick={() => {
                // 英語表現が抽出できた場合はそれを使用、そうでなければメッセージ全体をブックマーク
                if (englishPhrases.length > 0) {
                  onBookmark(
                    englishPhrases[0].english,
                    englishPhrases[0].japanese
                  );
                } else {
                  onBookmark(message.content);
                }
              }}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="ブックマーク"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
              >
                <path
                  d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="whitespace-pre-wrap break-words pr-12 pl-8">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse">
              |
            </span>
          )}
        </div>

        {/* 個別の英語表現に対する追加アクション（オプション） */}
        {!isUser && englishPhrases.length > 1 && !isStreaming && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-1 w-full">個別の表現:</div>
            {englishPhrases.map((phrase, index) => (
              <div key={index} className="flex space-x-1">
                <button
                  onClick={() => onPlayAudio(phrase.english)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title={`"${phrase.english}"を音声再生`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
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
                  </svg>
                </button>
                <button
                  onClick={() => onBookmark(phrase.english, phrase.japanese)}
                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                  title={`"${phrase.english}"をブックマーク`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                  >
                    <path
                      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <span className="text-xs text-gray-600 self-center">
                  {phrase.english}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "こんにちは！英語学習のお手伝いをします。どのようなシチュエーションの英語表現を学びたいですか？\n\n例：「会議で使えるフレーズ」「レストランでの注文」「自己紹介」など、具体的にお聞かせください。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkMessage, setBookmarkMessage] = useState<string>("");

  // 3つの並行ストリーミングリクエストを処理する関数
  const handleMultipleStreams = async (userMessage: string) => {
    setIsLoading(true);
    setError(null);

    // ユーザーメッセージを追加
    const userMessageObj: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMessageObj]);

    // 3つのAI応答メッセージのプレースホルダーを作成
    const aiMessageIds = Array.from(
      { length: 3 },
      (_, i) => `ai-${Date.now()}-${i}`
    );
    const initialAiMessages: ChatMessage[] = aiMessageIds.map((id, index) => ({
      id,
      role: "assistant" as const,
      content: "",
      streamIndex: index,
      isStreaming: true,
    }));

    setMessages((prev) => [...prev, ...initialAiMessages]);

    // 各ストリームの状態を管理
    const streamStates = Array.from({ length: 3 }, () => ({
      content: "",
      completed: false,
    }));

    try {
      // 3つの並行リクエストを実行（それぞれ異なるプロンプトバリエーション）
      const streamPromises = Array.from(
        { length: 3 },
        async (_, streamIndex) => {
          console.log(`Stream ${streamIndex + 1} starting...`);

          // 各ストリームで異なるプロンプトを追加して多様性を確保
          const variations = [
            "（フォーマル・ビジネス向けの表現を重視してください）",
            "（カジュアル・日常会話向けの表現を重視してください）",
            "（実用的で覚えやすい表現を重視してください）",
          ];

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                ...messages
                  .filter((m) => m.role === "user")
                  .map((m) => ({ role: m.role, content: m.content })),
                {
                  role: "user",
                  content: userMessage + " " + variations[streamIndex],
                },
              ],
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Stream ${streamIndex + 1} failed: ${response.statusText}`
            );
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error(
              `No reader available for stream ${streamIndex + 1}`
            );
          }

          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log(`Stream ${streamIndex + 1} completed`);
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              console.log(`Stream ${streamIndex + 1} raw chunk:`, chunk);

              buffer += chunk;
              const lines = buffer.split("\n");
              buffer = lines.pop() || ""; // 最後の不完全な行を保持

              for (const line of lines) {
                if (line.trim() === "") continue;

                console.log(`Stream ${streamIndex + 1} processing line:`, line);

                // AI SDK v4の形式: 0:"text"
                if (line.startsWith("0:")) {
                  try {
                    const jsonString = line.slice(2);
                    const textContent = JSON.parse(jsonString);

                    if (typeof textContent === "string") {
                      streamStates[streamIndex].content += textContent;
                      console.log(
                        `Stream ${streamIndex + 1} added text:`,
                        textContent
                      );

                      // UIを更新
                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === aiMessageIds[streamIndex]
                            ? {
                                ...msg,
                                content: streamStates[streamIndex].content,
                              }
                            : msg
                        )
                      );
                    }
                  } catch (e) {
                    console.error(
                      `Stream ${streamIndex + 1} parse error:`,
                      e,
                      "Line:",
                      line
                    );
                  }
                }
                // 完了シグナル: d:{...}
                else if (line.startsWith("d:")) {
                  console.log(
                    `Stream ${streamIndex + 1} received completion signal:`,
                    line
                  );
                  break;
                }
                // その他のメタデータ: 1:{...}, 8:[...] など
                else if (/^\d+:/.test(line)) {
                  console.log(`Stream ${streamIndex + 1} metadata:`, line);
                }
                // レガシー形式のサポート
                else if (line.startsWith("data: ")) {
                  try {
                    const jsonStr = line.slice(6);
                    if (jsonStr === "[DONE]") {
                      console.log(
                        `Stream ${streamIndex + 1} received DONE signal`
                      );
                      break;
                    }

                    const parsed = JSON.parse(jsonStr);
                    console.log(
                      `Stream ${streamIndex + 1} legacy data:`,
                      parsed
                    );

                    if (parsed.choices?.[0]?.delta?.content) {
                      const textDelta = parsed.choices[0].delta.content;
                      streamStates[streamIndex].content += textDelta;

                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === aiMessageIds[streamIndex]
                            ? {
                                ...msg,
                                content: streamStates[streamIndex].content,
                              }
                            : msg
                        )
                      );
                    }
                  } catch (e) {
                    console.error(
                      `Stream ${streamIndex + 1} legacy parse error:`,
                      e
                    );
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          // ストリーミング完了をマーク
          console.log(`Stream ${streamIndex + 1} marking as completed`);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageIds[streamIndex]
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        }
      );

      // すべてのストリームの完了を待つ
      await Promise.all(streamPromises);
      console.log("All streams completed");
    } catch (err) {
      console.error("Multiple stream error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");

      // エラー時は未完了のストリーミングメッセージを削除
      setMessages((prev) => prev.filter((msg) => !msg.isStreaming));
    } finally {
      setIsLoading(false);
    }
  };

  // 自動スクロール機能
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePlayAudio = (text: string) => {
    // 音声再生の実装
    console.log("音声再生:", text);
    if ("speechSynthesis" in window) {
      // 既存の音声を停止
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9; // 少し遅めに再生
      speechSynthesis.speak(utterance);
    }
  };

  const handleBookmark = (englishText: string, japaneseText?: string) => {
    // ブックマーク機能の実装（後でSupabaseと連携予定）
    console.log("ブックマーク保存:", { englishText, japaneseText });
    setBookmarkMessage(`"${englishText}" をブックマークに保存しました！`);

    // 3秒後にメッセージを消す
    setTimeout(() => {
      setBookmarkMessage("");
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && input.trim()) {
      const userMessage = input.trim();
      setInput("");
      handleMultipleStreams(userMessage);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー (C-01) */}
      <Sidebar />

      {/* メインコンテンツ */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            AI英語学習チャット（3ストリーム）
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            AIと対話しながら実用的な英語表現を学習しましょう（3つの異なる応答を同時に生成）
          </p>
        </div>

        {/* チャットログエリア */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onPlayAudio={handlePlayAudio}
                onBookmark={handleBookmark}
                isStreaming={message.isStreaming}
              />
            ))}

            {/* エラー表示 */}
            {error && (
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg max-w-md">
                  <p className="text-sm">エラーが発生しました: {error}</p>
                </div>
              </div>
            )}

            {/* 自動スクロール用の要素 */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ブックマーク通知 */}
        {bookmarkMessage && (
          <div className="mx-6 mb-2">
            <div className="max-w-4xl mx-auto">
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm">
                {bookmarkMessage}
              </div>
            </div>
          </div>
        )}

        {/* 入力エリア */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="（例）会議で使えるフレーズ、レストランでの注文、自己紹介..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !isLoading &&
                    input.trim()
                  ) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? "3つの応答を生成中..." : "送信"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
