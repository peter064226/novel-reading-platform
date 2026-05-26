import { supabase } from "./supabase";
import type { Novel } from "@/types";

/**
 * Fetch all novels ordered by creation date (newest first).
 * Used by the Homepage server component.
 */
export async function getAllNovels(): Promise<Novel[]> {
  const { data, error } = await supabase
    .from("novels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch novels: ${error.message}`);
  }

  return data as Novel[];
}

/**
 * Fetch a single novel by its UUID.
 * Returns null when no matching row is found (caller should call notFound()).
 */
export async function getNovelById(id: string): Promise<Novel | null> {
  const { data, error } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch novel (id=${id}): ${error.message}`);
  }

  return data as Novel | null;
}
