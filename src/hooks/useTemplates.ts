import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Template } from "@/types/db";
import { useAuth } from "./useAuth";

export function useTemplates() {
  const { session } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("templates").select("*").order("name");
    setTemplates((data ?? []) as Template[]);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => { refresh(); }, [refresh]);
  return { templates, loading, refresh };
}

export async function createTemplate(input: {
  user_id: string;
  name: string;
  company: string;
  venue_name: string;
  address: string;
  duration_mins: number;
  notes?: string | null;
}) {
  const { data, error } = await supabase.from("templates").insert(input).select().single();
  if (error) throw error;
  return data as Template;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw error;
}
