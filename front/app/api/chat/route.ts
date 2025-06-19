import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";

// メッセージの型定義
interface MessageInput {
  role: string;
  content?: string;
  message?: string;
}

interface ConvertedMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      chatGroupId,
    }: { messages: MessageInput[]; chatGroupId: number } = await req.json();

    // chatGroupIdが必要
    if (!chatGroupId) {
      return new Response(
        JSON.stringify({ error: "Chat group ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 最新のメッセージ内容を取得
    const userMessage = messages[messages.length - 1].content;
    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: "Message content is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // サーバーサイドSupabaseクライアントを作成
    const supabase = await createClient();

    // 認証されたユーザーの情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("認証エラー:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // チャットグループがユーザーのものかを確認
    const { data: chatGroup, error: groupError } = await supabase
      .from("chat_groups")
      .select("user_id")
      .eq("id", chatGroupId)
      .eq("user_id", user.id)
      .single();

    if (groupError || !chatGroup) {
      console.error("チャットグループエラー:", groupError);
      return new Response(
        JSON.stringify({ error: "Chat group not found or unauthorized" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ユーザーメッセージをchat_messagesテーブルに保存
    const { error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        chat_group_id: chatGroupId,
        role: "user",
        message: userMessage,
      });

    if (messageError) {
      console.error("メッセージ保存エラー:", messageError);
      return new Response(JSON.stringify({ error: "Failed to save message" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // メッセージをAI SDK用の形式に変換
    const convertedMessages: ConvertedMessage[] = messages.map(
      (msg: MessageInput) => ({
        role:
          msg.role === "ai"
            ? "assistant"
            : (msg.role as "user" | "assistant" | "system"),
        content: msg.content || msg.message || "",
      })
    );

    // システムプロンプト：英語学習に特化した応答を生成
    const systemPrompt = `あなたは英語学習をサポートするAIアシスタントです。ユーザーから英語表現の要求があった場合、以下のルールに従って回答してください：

1. 常に3つの異なる英語表現を提供する
2. 各表現は実用的で、要求されたシチュエーションで実際に使用できるものにする
3. 初級者から上級者まで使えるよう、難易度の異なる表現を含める
4. 回答は英語で行う
5. 文だけで余計な解説はしない

例：
"会議で使えるフレーズ"と要求された場合：

1. "Let's move on to the next agenda item."

2. "I'd like to table this discussion for now."

3. "Could we circle back to this issue later?"
`;

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages: convertedMessages,
      temperature: 0.7,
      maxTokens: 1000,
      onFinish: async (result) => {
        // AIの応答が完了したらchat_messagesテーブルに保存
        try {
          // トランザクションを使用してAIメッセージの保存とグループ更新を同時実行
          const { error: aiMessageError } = await supabase
            .from("chat_messages")
            .insert({
              chat_group_id: chatGroupId,
              role: "ai",
              message: result.text,
            });

          if (aiMessageError) {
            console.error("AI応答保存エラー:", aiMessageError);
            return;
          }

          // チャットグループのupdated_atを更新
          const { error: updateError } = await supabase
            .from("chat_groups")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", chatGroupId);

          if (updateError) {
            console.error("チャットグループ更新エラー:", updateError);
          }
        } catch (error) {
          console.error("AI応答保存中の予期しないエラー:", error);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("API エラー:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
