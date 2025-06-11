import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    // 最新のメッセージ内容を取得
    const userMessage = messages[messages.length - 1].content;
    // システムプロンプト：英語学習に特化した応答を生成
    const systemPrompt = `あなたは英語学習をサポートするAIアシスタントです。ユーザーから英語表現の要求があった場合、以下のルールに従って回答してください：

1. 常に3つの異なる英語表現を提供する
2. 各表現は実用的で、要求されたシチュエーションで実際に使用できるものにする
3. 初級者から上級者まで使えるよう、難易度の異なる表現を含める
4. 回答は英語で行う
5. 分だけで余計な解説はしない

例：
"会議で使えるフレーズ"と要求された場合：

1. "Let's move on to the next agenda item."

2. "I'd like to table this discussion for now."

3. "Let's move on to the next agenda item."
`;

    console.log("AIモデル呼び出し開始");

    const result = await streamText({
      model: google("gemini-1.5-flash"), // より安定したモデルに変更
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const response = result.toDataStreamResponse();

    return response;
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
