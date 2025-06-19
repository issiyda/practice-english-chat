"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";

type ChatMessageInsert =
  Database["public"]["Tables"]["chat_messages"]["Insert"];

export async function getChatMessages(chatGroupId: number, userId: string) {
  const supabase = await createClient();

  // まず、チャットグループが指定されたユーザーのものかを確認
  const { data: group, error: groupError } = await supabase
    .from("chat_groups")
    .select("user_id")
    .eq("id", chatGroupId)
    .single();

  if (groupError || !group || group.user_id !== userId) {
    throw new Error("Unauthorized or group not found");
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_group_id", chatGroupId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    throw new Error("Failed to fetch chat messages");
  }

  return data || [];
}

// 最適化: チャットメッセージとブックマーク状態を同時に取得
export async function getChatMessagesWithBookmarks(chatGroupId: number, userId: string) {
  const supabase = await createClient();

  // まず、チャットグループが指定されたユーザーのものかを確認
  const { data: group, error: groupError } = await supabase
    .from("chat_groups")
    .select("user_id")
    .eq("id", chatGroupId)
    .single();

  if (groupError || !group || group.user_id !== userId) {
    throw new Error("Unauthorized or group not found");
  }

  // メッセージとブックマーク情報を一度で取得
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select(`
      *,
      bookmarks!left (
        id,
        user_id
      )
    `)
    .eq("chat_group_id", chatGroupId)
    .eq("bookmarks.user_id", userId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching chat messages with bookmarks:", messagesError);
    throw new Error("Failed to fetch chat messages");
  }

  // メッセージにブックマーク状態を追加
  const messagesWithBookmarks = (messages || []).map(message => ({
    ...message,
    isBookmarked: message.role === "ai" && Array.isArray(message.bookmarks) && message.bookmarks.length > 0
  }));

  return messagesWithBookmarks;
}

export async function saveChatMessage(
  chatGroupId: number,
  role: "user" | "ai",
  content: string,
  userId: string
) {
  const supabase = await createClient();

  // まず、チャットグループが指定されたユーザーのものかを確認
  const { data: group, error: groupError } = await supabase
    .from("chat_groups")
    .select("user_id")
    .eq("id", chatGroupId)
    .single();

  if (groupError || !group || group.user_id !== userId) {
    throw new Error("Unauthorized or group not found");
  }

  const messageData: ChatMessageInsert = {
    chat_group_id: chatGroupId,
    role,
    message: content,
  };

  const { data, error } = await supabase
    .from("chat_messages")
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error("Error saving chat message:", error);
    throw new Error("Failed to save chat message");
  }

  // チャットグループのupdated_atを更新
  await supabase
    .from("chat_groups")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatGroupId);

  revalidatePath(`/chat/${chatGroupId}`);
  return data;
}

export async function getChatGroup(chatGroupId: number, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_groups")
    .select("*")
    .eq("id", chatGroupId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching chat group:", error);
    return null;
  }

  return data;
}
