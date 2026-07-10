// ============================================================
// ShiftPilot — leave-by engine
// Runs every 5 minutes (Supabase cron). For every confirmed shift
// starting within the next 2 hours it:
//   1. fetches live travel time from Google Directions (with traffic)
//   2. computes leave_by = starts_at − travel − buffer
//   3. sends an Expo push the moment now >= leave_by (once)
//
// Deploy:  supabase functions deploy leave-by-engine --no-verify-jwt
// Secrets: supabase secrets set GOOGLE_MAPS_API_KEY=...
// Cron (SQL editor):
//   select cron.schedule('leave-by', '*/5 * * * *',
//     $$ select net.http_post(
//          url := 'https://YOUR-PROJECT.supabase.co/functions/v1/leave-by-engine',
//          headers := '{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
//        ) $$);
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const MAPS_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY")!;

const LOOKAHEAD_MS = 2 * 60 * 60 * 1000; // start checking 2h before a shift

async function travelSeconds(
  originLat: number, originLng: number,
  destLat: number, destLng: number,
  mode: string,
): Promise<number | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${originLat},${originLng}`);
  url.searchParams.set("destination", `${destLat},${destLng}`);
  url.searchParams.set("mode", mode);
  url.searchParams.set("departure_time", "now"); // enables duration_in_traffic
  url.searchParams.set("key", MAPS_KEY);

  const res = await fetch(url);
  const json = await res.json();
  const leg = json?.routes?.[0]?.legs?.[0];
  if (!leg) return null;
  return leg.duration_in_traffic?.value ?? leg.duration?.value ?? null;
}

async function sendPush(userId: string, title: string, body: string, shiftId: string) {
  const { data: tokens } = await supabase
    .from("push_tokens").select("expo_push_token").eq("user_id", userId);
  if (!tokens?.length) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens.map((t) => ({
      to: t.expo_push_token,
      title,
      body,
      sound: "default",
      priority: "high",
      data: { shiftId },
    }))),
  });
}

Deno.serve(async () => {
  const now = new Date();
  const horizon = new Date(now.getTime() + LOOKAHEAD_MS);

  const { data: shifts, error } = await supabase
    .from("shifts")
    .select("*, origin:locations!shifts_origin_location_id_fkey(lat,lng,label)")
    .eq("status", "confirmed")
    .eq("leave_alert_sent", false)
    .gte("starts_at", now.toISOString())
    .lte("starts_at", horizon.toISOString());

  if (error) return new Response(error.message, { status: 500 });

  let checked = 0, alerted = 0;

  for (const shift of shifts ?? []) {
    const origin = shift.origin;
    if (!origin?.lat || !shift.lat) continue; // needs geocoded origin + venue

    const secs = await travelSeconds(
      origin.lat, origin.lng, shift.lat, shift.lng, shift.travel_mode,
    );
    if (secs == null) continue;
    checked++;

    const startsAt = new Date(shift.starts_at).getTime();
    const leaveBy = new Date(startsAt - secs * 1000 - shift.buffer_mins * 60_000);

    const update: Record<string, unknown> = {
      travel_duration_secs: secs,
      leave_by_at: leaveBy.toISOString(),
      traffic_checked_at: now.toISOString(),
    };

    // Fire the alert if it's time (or already past time — traffic got worse)
    if (now.getTime() >= leaveBy.getTime()) {
      const mins = Math.round(secs / 60);
      await sendPush(
        shift.user_id,
        "Leave now",
        `${mins} min ${shift.travel_mode} to ${shift.venue_name} (${shift.company}). ` +
        `Shift starts ${new Date(startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.`,
        shift.id,
      );
      update.leave_alert_sent = true;
      alerted++;
    }

    await supabase.from("shifts").update(update).eq("id", shift.id);
  }

  return Response.json({ ok: true, checked, alerted, at: now.toISOString() });
});
