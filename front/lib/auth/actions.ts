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
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath("/", "layout");
    redirect("/auth/signin");
  } catch (error) {
    // NEXT_REDIRECTエラーは再スローする（これは正常なリダイレクト動作）
    if (
      error instanceof Error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("SignOut error:", error);
    redirect("/auth/signin");
  }
}
