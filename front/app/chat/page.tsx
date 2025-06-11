const ChatPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI英語学習チャット</h1>
        <p className="text-gray-600 mt-2">
          AIと対話しながら英語表現を学習しましょう
        </p>
      </div>

      {/* チャットエリア */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 mb-4 p-4 overflow-y-auto">
        {/* サンプルメッセージ */}
        <div className="space-y-4">
          {/* システムメッセージ */}
          <div className="flex justify-start">
            <div className="bg-blue-50 text-blue-900 px-4 py-2 rounded-lg max-w-xs">
              <p>
                こんにちは！英語学習のお手伝いをします。どのようなシチュエーションの英語表現を学びたいですか？
              </p>
            </div>
          </div>

          {/* ユーザーメッセージ */}
          <div className="flex justify-end">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg max-w-xs">
              <p>会議で使えるフレーズを教えてください</p>
            </div>
          </div>

          {/* AIの応答 */}
          <div className="flex justify-start">
            <div className="bg-blue-50 text-blue-900 px-4 py-2 rounded-lg max-w-md">
              <p className="mb-2">
                "I'd like to schedule a follow-up meeting."
              </p>
              <p className="text-sm text-blue-700">
                （フォローアップミーティングを予定したいと思います）
              </p>
              <div className="flex space-x-2 mt-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  🔊
                </button>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  📌
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 入力エリア */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="（例）会議で使えるフレーズ"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
            送信
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
