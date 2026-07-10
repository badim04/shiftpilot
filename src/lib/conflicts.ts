import { supabase } from "./supabase";
import type { Shift } from "@/types/db";

/** Warn-don't-block overlap check, backed by the find_conflicts SQL function. */
export async function findConflicts(
  userId: string,
  startsAt: Date,
  endsAt: Date,
  excludeId?: string,
): Promise<Shift[]> {
  const { data, error } = await supabase.rpc("find_conflicts", {
    p_user: userId,
    p_start: startsAt.toISOString(),
    p_end: endsAt.toISOString(),
    p_exclude: excludeId ?? null,
  });
  if (error) throw error;
  return (data ?? []) as Shift[];
}
