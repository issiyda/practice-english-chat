"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase";

export async function createChatGroup(formData: FormData) {
  const title = formData.get("title") as string;
  const userId = formData.get("userId") as string;

  if (!title || !userId) {
    throw new Error("Title and userId are required");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_groups")
    .insert({
      title: title.trim(),
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat group:", error);
    throw new Error("Failed to create chat group");
  }

  revalidatePath("/");
  return data;
}

export async function getChatGroups(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_groups")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching chat groups:", error);
    throw new Error("Failed to fetch chat groups");
  }

  return data || [];
}

export async function deleteChatGroup(groupId: number, userId: string) {
  const supabase = await createClient();

  // まず、そのグループが指定されたユーザーのものかを確認
  const { data: group, error: fetchError } = await supabase
    .from("chat_groups")
    .select("user_id")
    .eq("id", groupId)
    .single();

  if (fetchError || !group || group.user_id !== userId) {
    throw new Error("Unauthorized or group not found");
  }

  // チャットメッセージを先に削除（外部キー制約のため）
  const { error: messagesError } = await supabase
    .from("chat_messages")
    .delete()
    .eq("chat_group_id", groupId);

  if (messagesError) {
    console.error("Error deleting chat messages:", messagesError);
    throw new Error("Failed to delete chat messages");
  }

  // チャットグループを削除
  const { error: deleteError } = await supabase
    .from("chat_groups")
    .delete()
    .eq("id", groupId);

  if (deleteError) {
    console.error("Error deleting chat group:", deleteError);
    throw new Error("Failed to delete chat group");
  }

  revalidatePath("/");
}

export async function updateChatGroup(
  groupId: number,
  title: string,
  userId: string
) {
  const supabase = await createClient();

  // まず、そのグループが指定されたユーザーのものかを確認
  const { data: group, error: fetchError } = await supabase
    .from("chat_groups")
    .select("user_id")
    .eq("id", groupId)
    .single();

  if (fetchError || !group || group.user_id !== userId) {
    throw new Error("Unauthorized or group not found");
  }

  const { data, error } = await supabase
    .from("chat_groups")
    .update({
      title: title.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId)
    .select()
    .single();

  if (error) {
    console.error("Error updating chat group:", error);
    throw new Error("Failed to update chat group");
  }

  revalidatePath("/");
  return data;
}
