"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBookmark(chatMessageId: number) {
  try {
    const supabase = await createClient();

    // 認証されたユーザーの情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("認証が必要です");
    }

    // 既にブックマークされているかチェック
    const { data: existingBookmark, error: checkError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("chat_message_id", chatMessageId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116は「見つからない」エラーなので、それ以外のエラーの場合は投げる
      throw checkError;
    }

    if (existingBookmark) {
      throw new Error("このメッセージは既にブックマークされています");
    }

    // ブックマークを追加
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        chat_message_id: chatMessageId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    revalidatePath("/bookmarks");
    return { success: true, data };
  } catch (error) {
    console.error("ブックマーク追加エラー:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "ブックマークの追加に失敗しました",
    };
  }
}

export async function removeBookmark(chatMessageId: number) {
  try {
    const supabase = await createClient();

    // 認証されたユーザーの情報を取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("認証が必要です");
    }

    // ブックマークを削除
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("chat_message_id", chatMessageId);

    if (error) {
      throw error;
    }

    revalidatePath("/bookmarks");
    return { success: true };
  } catch (error) {
    console.error("ブックマーク削除エラー:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "ブックマークの削除に失敗しました",
    };
  }
}

export async function getBookmarks(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select(
        `
        id,
        created_at,
        chat_message_id,
        chat_messages!inner (
          id,
          message,
          role,
          created_at,
          chat_group_id,
          chat_groups!inner (
            title
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("ブックマーク取得エラー:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "ブックマークの取得に失敗しました",
    };
  }
}

export async function getBookmarksWithPagination(
  userId: string,
  page: number = 1,
  limit: number = 1
) {
  try {
    const supabase = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 総件数を取得
    const { count, error: countError } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw countError;
    }

    // ページネーション付きでデータを取得
    const { data, error } = await supabase
      .from("bookmarks")
      .select(
        `
        id,
        created_at,
        chat_message_id,
        chat_messages (
          id,
          message,
          role,
          created_at,
          chat_group_id,
          chat_groups (
            title
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    console.log("取得データ:", JSON.stringify(data, null, 2));

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("ブックマーク取得エラー:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "ブックマークの取得に失敗しました",
    };
  }
}

export async function checkBookmarkStatus(
  chatMessageId: number,
  userId: string
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("chat_message_id", chatMessageId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return { success: true, isBookmarked: !!data };
  } catch (error) {
    console.error("ブックマーク状態チェックエラー:", error);
    return { success: false, isBookmarked: false };
  }
}
