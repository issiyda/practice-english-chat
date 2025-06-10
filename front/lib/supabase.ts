import { createClient } from "@supabase/supabase-js";

// Supabaseプロジェクトの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// TypeScriptの型定義（後でデータベーススキーマに基づいて更新）
export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          english_text: string;
          japanese_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          english_text: string;
          japanese_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          english_text?: string;
          japanese_text?: string;
          created_at?: string;
        };
      };
    };
  };
};
