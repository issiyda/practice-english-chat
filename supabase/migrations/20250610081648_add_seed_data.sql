-- シードデータの追加
-- AI チャット英語学習システムのサンプルデータをマイグレーションとして追加

-- テスト用のユーザーUUIDを定義
-- 実際の本番環境では、auth.usersテーブルに存在するUUIDを使用する必要があります
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- もう一人のテストユーザー
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'authenticated',
    'authenticated',
    'user2@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- プロフィールデータ（トリガーで自動作成されるが、明示的に更新）
UPDATE public.profiles 
SET name = 'テストユーザー1' 
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

UPDATE public.profiles 
SET name = 'テストユーザー2' 
WHERE id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

-- チャットメッセージのサンプルデータ
INSERT INTO public.chat_messages (user_id, role, message) VALUES
-- 最初の会話
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user', '今日の天気について話したいです。'),
(NULL, 'ai', 'もちろんです！天気について英語で話しましょう。今日の天気はいかがですか？以下のような表現を使って答えてみてください：

"Today is sunny." - 今日は晴れです。
"It''s cloudy today." - 今日は曇りです。  
"It''s raining outside." - 外は雨が降っています。'),

-- 2番目の会話
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user', 'レストランで注文する方法を教えてください。'),
(NULL, 'ai', 'レストランでの注文方法について説明しますね！以下のような表現が役立ちます：

"I''d like to order..." - 注文したいのですが...
"Can I have the menu, please?" - メニューをいただけますか？
"What do you recommend?" - おすすめは何ですか？'),

-- 3番目の会話（別のユーザー）
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'user', '自己紹介の仕方を知りたいです。'),
(NULL, 'ai', '自己紹介の基本的な表現をご紹介します：

"My name is..." - 私の名前は...です。
"I''m from Japan." - 日本出身です。
"Nice to meet you." - はじめまして。');

-- suggestionsのサンプルデータ（AIメッセージに対応）
INSERT INTO public.suggestions (chat_message_id, english_sentence, japanese_translation) VALUES
-- 天気に関するAIメッセージ（ID: 2）の提案
(2, 'Today is sunny.', '今日は晴れです。'),
(2, 'It''s cloudy today.', '今日は曇りです。'),
(2, 'It''s raining outside.', '外は雨が降っています。'),
(2, 'The weather is nice today.', '今日は天気がいいです。'),

-- レストランに関するAIメッセージ（ID: 4）の提案
(4, 'I''d like to order the pasta, please.', 'パスタを注文したいのですが。'),
(4, 'Can I have the menu, please?', 'メニューをいただけますか？'),
(4, 'What do you recommend?', 'おすすめは何ですか？'),
(4, 'Could I get the check, please?', 'お会計をお願いします。'),

-- 自己紹介に関するAIメッセージ（ID: 6）の提案
(6, 'My name is Taro.', '私の名前は太郎です。'),
(6, 'I''m from Japan.', '日本出身です。'),
(6, 'Nice to meet you.', 'はじめまして。'),
(6, 'I work as a software engineer.', 'ソフトウェアエンジニアとして働いています。');

-- ブックマークのサンプルデータ
INSERT INTO public.bookmarks (user_id, suggestion_id) VALUES
-- ユーザー1のブックマーク
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1), -- "Today is sunny."
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4), -- "The weather is nice today."
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5), -- "I'd like to order the pasta, please."
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 7), -- "What do you recommend?"

-- ユーザー2のブックマーク
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 9), -- "My name is Taro."
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 11), -- "Nice to meet you."
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 12); -- "I work as a software engineer."
