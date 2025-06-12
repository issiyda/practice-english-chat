import { createClient } from "@supabase/supabase-js";

// Supabaseプロジェクトの設定
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

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

// TypeScriptの型定義（データベーススキーマに基づいて更新）
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_groups: {
        Row: {
          id: number;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: number;
          chat_group_id: number;
          role: string;
          message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          chat_group_id: number;
          role: string;
          message: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          chat_group_id?: number;
          role?: string;
          message?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: number;
          user_id: string;
          chat_message_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          chat_message_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          chat_message_id?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
