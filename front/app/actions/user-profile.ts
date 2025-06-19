"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// ユーザープロフィールを取得
export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("認証が必要です");
    }

    // リクエストしたユーザーIDと認証されたユーザーIDが一致するかチェック
    if (user.id !== userId) {
      throw new Error("アクセス権限がありません");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("プロフィール取得エラー:", error);
      throw new Error("プロフィールの取得に失敗しました");
    }

    return data;
  } catch (error) {
    console.error("getUserProfile エラー:", error);
    throw error;
  }
}

// ユーザープロフィールを更新
export async function updateUserProfile(
  userId: string,
  updateData: { name?: string }
) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("認証が必要です");
    }

    // リクエストしたユーザーIDと認証されたユーザーIDが一致するかチェック
    if (user.id !== userId) {
      throw new Error("アクセス権限がありません");
    }

    // 既存のプロフィールの存在確認
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingProfile) {
      throw new Error("プロフィールが見つかりません");
    }

    const profileUpdate: ProfileUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("プロフィール更新エラー:", error);
      throw new Error("プロフィールの更新に失敗しました");
    }

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("updateUserProfile エラー:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "プロフィールの更新に失敗しました",
    };
  }
}

// プロフィールを作成（存在しない場合）
export async function createUserProfile(userId: string, name?: string) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("認証が必要です");
    }

    if (user.id !== userId) {
      throw new Error("アクセス権限がありません");
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        name: name || null,
      })
      .select()
      .single();

    if (error) {
      console.error("プロフィール作成エラー:", error);
      throw new Error("プロフィールの作成に失敗しました");
    }

    revalidatePath("/settings");
    return { success: true, data };
  } catch (error) {
    console.error("createUserProfile エラー:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "プロフィールの作成に失敗しました",
    };
  }
}

// ユーザーアカウントを削除
export async function deleteUserAccount(userId: string) {
  try {
    const supabase = await createClient();

    // 認証チェック
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("認証が必要です");
    }

    if (user.id !== userId) {
      throw new Error("アクセス権限がありません");
    }

    // 関連データの削除（外部キー制約に従って順番に削除）

    // 1. ブックマークを削除
    const { error: bookmarksError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId);

    if (bookmarksError) {
      console.error("ブックマーク削除エラー:", bookmarksError);
      throw new Error("ブックマークの削除に失敗しました");
    }

    // 2. チャットメッセージを削除
    const { data: chatGroups } = await supabase
      .from("chat_groups")
      .select("id")
      .eq("user_id", userId);

    if (chatGroups && chatGroups.length > 0) {
      const groupIds = chatGroups.map((group) => group.id);

      for (const groupId of groupIds) {
        const { error: messagesError } = await supabase
          .from("chat_messages")
          .delete()
          .eq("chat_group_id", groupId);

        if (messagesError) {
          console.error("チャットメッセージ削除エラー:", messagesError);
          throw new Error("チャットメッセージの削除に失敗しました");
        }
      }
    }

    // 3. チャットグループを削除
    const { error: chatGroupsError } = await supabase
      .from("chat_groups")
      .delete()
      .eq("user_id", userId);

    if (chatGroupsError) {
      console.error("チャットグループ削除エラー:", chatGroupsError);
      throw new Error("チャットグループの削除に失敗しました");
    }

    // 4. プロフィールを削除
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      console.error("プロフィール削除エラー:", profileError);
      throw new Error("プロフィールの削除に失敗しました");
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("deleteUserAccount エラー:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "アカウントの削除に失敗しました",
    };
  }
}
