"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// サーバーサイドでのSupabaseクライアント作成
function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// 新規登録用のServer Action
export async function signUp(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // バリデーション
  if (!email || !password || !confirmPassword) {
    return {
      error: "すべてのフィールドを入力してください。",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "パスワードが一致しません。",
    };
  }

  if (password.length < 6) {
    return {
      error: "パスワードは6文字以上で入力してください。",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: "有効なメールアドレスを入力してください。",
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    // 成功時の処理
    return {
      success: true,
      message:
        "アカウントが正常に作成されました。確認メールをチェックしてください。",
    };
  } catch (error) {
    console.error("SignUp error:", error);
    return {
      error: "アカウント作成中にエラーが発生しました。",
    };
  }
}

// サインイン用のServer Action（将来の実装用）
export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error:
          "ログインに失敗しました。メールアドレスとパスワードを確認してください。",
      };
    }

    // セッションをクッキーに保存
    const cookieStore = await cookies();

    if (data.session) {
      cookieStore.set("supabase-auth-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7日
      });
    }

    return {
      success: true,
      message: "ログインしました。",
    };
  } catch (error) {
    console.error("SignIn error:", error);
    return {
      error: "ログイン中にエラーが発生しました。",
    };
  }
}

// サインアウト用のServer Action
export async function signOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("supabase-auth-token");

    return {
      success: true,
      message: "ログアウトしました。",
    };
  } catch (error) {
    console.error("SignOut error:", error);
    return {
      error: "ログアウト中にエラーが発生しました。",
    };
  }
}
