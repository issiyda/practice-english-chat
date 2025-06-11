"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type SignUpState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

type SignInState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

type ResetPasswordState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

type UpdatePasswordState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

// 新規登録用のServer Action
export async function signUp(
  prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
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
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.SITE_URL}/auth/callback`,
      },
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

// サインイン用のServer Action
export async function signIn(
  prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error:
          "ログインに失敗しました。メールアドレスとパスワードを確認してください。",
      };
    }

    // 成功時はrevalidateとredirect
    revalidatePath("/", "layout");
    redirect("/");
  } catch (error) {
    // NEXT_REDIRECTエラーは再スローする（これは正常なリダイレクト動作）
    if (
      error instanceof Error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("SignIn error:", error);
    return {
      error: "ログイン中にエラーが発生しました。",
    };
  }
}

// Googleログイン用のServer Action
export async function signInWithGoogle() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google sign-in error:", error);
      redirect("/auth/signin?error=google_signin_failed");
    }

    if (data.url) {
      redirect(data.url);
    }
  } catch (error) {
    // NEXT_REDIRECTエラーは再スローする（これは正常なリダイレクト動作）
    if (
      error instanceof Error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Google sign-in error:", error);
    redirect("/auth/signin?error=google_signin_failed");
  }
}

// Appleログイン用のServer Action
export async function signInWithApple() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${process.env.SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Apple sign-in error:", error);
      redirect("/auth/signin?error=apple_signin_failed");
    }

    if (data.url) {
      redirect(data.url);
    }
  } catch (error) {
    // NEXT_REDIRECTエラーは再スローする（これは正常なリダイレクト動作）
    if (
      error instanceof Error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Apple sign-in error:", error);
    redirect("/auth/signin?error=apple_signin_failed");
  }
}

// サインアウト用のServer Action
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/signin");
}

// パスワードリセット用のServer Action
export async function resetPassword(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const email = formData.get("email") as string;

  // バリデーション
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
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL}/auth/reset-password/confirm`,
    });

    if (error) {
      return {
        error: "パスワードリセットメールの送信に失敗しました。",
      };
    }

    return {
      success: true,
      message:
        "パスワードリセットのメールを送信しました。メールを確認してリンクをクリックしてください。",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      error: "パスワードリセット処理中にエラーが発生しました。",
    };
  }
}

// パスワード更新用のServer Action
export async function updatePassword(
  prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const code = formData.get("code") as string;

  // バリデーション
  if (!password || !confirmPassword) {
    return {
      error: "すべてのフィールドを入力してください。",
    };
  }

  if (!code) {
    return {
      error:
        "パスワードリセットコードが無効です。再度リセットを行ってください。",
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
    const supabase = await createClient();

    // codeを使ってセッションを確立
    const { data, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("Code exchange error:", sessionError);
      return {
        error:
          "パスワードリセットコードが無効です。再度リセットを行ってください。",
      };
    }

    if (!data.session || !data.user) {
      return {
        error: "セッションの確立に失敗しました。再度リセットを行ってください。",
      };
    }

    // パスワード更新
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Password update error:", error);
      return {
        error: "パスワードの更新に失敗しました。",
      };
    }

    // 成功時はサインアウトしてログインページにリダイレクト
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/auth/signin?message=password_updated");
  } catch (error) {
    // NEXT_REDIRECTエラーは再スローする（これは正常なリダイレクト動作）
    if (
      error instanceof Error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Update password error:", error);
    return {
      error: "パスワード更新中にエラーが発生しました。",
    };
  }
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
