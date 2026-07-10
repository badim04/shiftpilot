import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { scheduleShiftReminder, cancelShiftReminder } from "@/lib/notifications";
import type { Shift } from "@/types/db";
import { useAuth } from "./useAuth";

export function useShifts() {
  const { session } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const refresh = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("shifts")
        .select("*")
        .in("status", ["pending_review", "confirmed"])
        .gte("ends_at", new Date().toISOString())
        .order("starts_at", { ascending: true });
      if (fetchError) throw fetchError;
      setShifts((data ?? []) as Shift[]);
    } catch (e: any) {
      setError(e.message ?? "Failed to load shifts");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refresh();
    if (!session) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`shifts-live-${session.user.id}-${Date.now()}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "shifts", filter: `user_id=eq.${session.user.id}` },
        () => { refresh(); })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [refresh, session?.user?.id]);

  return { shifts, loading, error, refresh };
}

export async function createShift(input: Partial<Shift> & {
  user_id: string; company: string; venue_name: string; address: string;
  starts_at: string; ends_at: string;
}) {
  const { data, error } = await supabase.from("shifts").insert(input).select().single();
  if (error) throw error;
  const shift = data as Shift;
  await scheduleShiftReminder({
    shiftId: shift.id, venue: shift.venue_name, company: shift.company,
    startsAt: new Date(shift.starts_at), offsetMins: shift.reminder_offset_mins,
  });
  return shift;
}

export async function updateShift(id: string, patch: Partial<Shift>) {
  const { data, error } = await supabase.from("shifts").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as Shift;
}

export async function confirmShift(id: string) {
  return updateShift(id, { status: "confirmed" });
}

export async function cancelShift(id: string) {
  await cancelShiftReminder(id);
  return updateShift(id, { status: "cancelled" });
}
