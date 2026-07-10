import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SavedLocation } from "@/types/db";
import { useAuth } from "./useAuth";

export function useLocations() {
  const { session } = useAuth();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("locations").select("*").order("created_at");
    setLocations((data ?? []) as SavedLocation[]);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (label: string, address: string, isDefault = false) => {
    if (!session) return;
    if (isDefault) await supabase.from("locations").update({ is_default: false }).eq("is_default", true);
    const { error } = await supabase.from("locations").insert({
      user_id: session.user.id, label, address, is_default: isDefault,
    });
    if (error) throw error;
    await refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const setDefault = async (id: string) => {
    await supabase.from("locations").update({ is_default: false }).eq("is_default", true);
    await supabase.from("locations").update({ is_default: true }).eq("id", id);
    await refresh();
  };

  return { locations, loading, add, remove, setDefault, refresh };
}
