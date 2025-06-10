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

// パスワードリセット（メール送信）用のServer Action
export async function sendPasswordResetEmail(
  prevState: any,
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      error: "メールアドレスを入力してください。",
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL}/auth/reset-password/callback`,
    });

    if (error) {
      return {
        error: "パスワードリセットメールの送信に失敗しました。",
      };
    }

    return {
      success: true,
      message:
        "パスワードリセット用のメールを送信しました。メールをご確認ください。",
    };
  } catch (error) {
    console.error("Password reset email error:", error);
    return {
      error: "パスワードリセットメールの送信中にエラーが発生しました。",
    };
  }
}

// パスワード更新用のServer Action
export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  console.log("パスワード更新開始:", {
    password: !!password,
    confirmPassword: !!confirmPassword,
  });

  if (!password || !confirmPassword) {
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

  try {
    // クッキーからトークンを取得
    const cookieStore = await cookies();
    const authToken = cookieStore.get("supabase-auth-token");
    const refreshToken = cookieStore.get("supabase-refresh-token");

    console.log("認証トークン確認:", {
      authTokenExists: !!authToken,
      refreshTokenExists: !!refreshToken,
    });

    if (!authToken || !refreshToken) {
      return {
        error: "認証が必要です。もう一度リセットリンクをクリックしてください。",
      };
    }

    // Supabaseクライアントを作成（セッション設定用）
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // セッションを設定
    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: authToken.value,
        refresh_token: refreshToken.value,
      });

    console.log("セッション設定結果:", {
      success: !!sessionData.session,
      hasUser: !!sessionData.user,
      error: sessionError?.message,
    });

    if (sessionError) {
      console.error("Session setup error:", sessionError);
      return {
        error: "認証が無効です。もう一度リセットリンクをクリックしてください。",
      };
    }

    if (!sessionData.session || !sessionData.user) {
      return {
        error: "セッションの設定に失敗しました。",
      };
    }

    // パスワード更新を実行
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    console.log("パスワード更新結果:", { error: updateError?.message });

    if (updateError) {
      console.error("Password update error:", updateError);
      return {
        error: `パスワードの更新に失敗しました: ${updateError.message}`,
      };
    }

    // 更新完了後、認証クッキーを削除
    cookieStore.delete("supabase-auth-token");
    cookieStore.delete("supabase-refresh-token");

    console.log("パスワード更新完了");

    return {
      success: true,
      message: "パスワードが正常に更新されました。",
    };
  } catch (error) {
    console.error("Password update error:", error);
    return {
      error: "パスワード更新中にエラーが発生しました。",
    };
  }
}

// パスワードリセットコールバック処理用のServer Action
export async function handlePasswordResetCallback(
  prevState: any,
  formData: FormData
) {
  const accessToken = formData.get("access_token") as string;
  const refreshToken = formData.get("refresh_token") as string;
  const type = formData.get("type") as string;

  if (!accessToken || !refreshToken || type !== "recovery") {
    return {
      error: "無効なリセットリンクです。",
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    // セッションを設定
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Session setup error:", error);
      return {
        error: "認証に失敗しました。もう一度お試しください。",
      };
    }

    if (data.session) {
      // セッション情報をクッキーに保存
      const cookieStore = await cookies();
      cookieStore.set("supabase-auth-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1時間（パスワードリセット用の短い期間）
      });

      // リフレッシュトークンも保存
      cookieStore.set("supabase-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1時間（パスワードリセット用の短い期間）
      });

      console.log("セッション保存完了:", {
        accessToken: !!data.session.access_token,
        refreshToken: !!data.session.refresh_token,
      });

      return {
        success: true,
        message: "認証が完了しました。",
      };
    } else {
      return {
        error: "セッションの作成に失敗しました。",
      };
    }
  } catch (error) {
    console.error("Password reset callback error:", error);
    return {
      error: "処理中にエラーが発生しました。",
    };
  }
}
