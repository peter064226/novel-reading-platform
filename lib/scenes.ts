import { supabase } from "./supabase";
import type { Scene } from "@/types";

/**
 * Fetch all scenes for a novel in reading order (scene_order ASC).
 * Used by the Story Reader server page.
 */
export async function getScenesByNovelId(novelId: string): Promise<Scene[]> {
  const { data, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("novel_id", novelId)
    .order("scene_order", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch scenes (novel_id=${novelId}): ${error.message}`
    );
  }

  return data as Scene[];
}
