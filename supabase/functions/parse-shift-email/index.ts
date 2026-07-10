// ============================================================
// ShiftPilot — parse-shift-email
// Webhook target for Postmark Inbound (or SendGrid Inbound Parse).
// Each user forwards agency confirmations to:  <inbound_token>@in.yourdomain.com
//
// Flow: find user by token → Claude extracts structured fields from the
// raw email → geocode the venue → insert shift as 'pending_review' →
// push: "New shift detected — tap to confirm".
//
// Deploy:  supabase functions deploy parse-shift-email --no-verify-jwt
// Secrets: supabase secrets set ANTHROPIC_API_KEY=... GOOGLE_MAPS_API_KEY=...
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type Extracted = {
  is_shift_confirmation: boolean;
  company: string | null;
  venue_name: string | null;
  address: string | null;
  date: string | null;        // YYYY-MM-DD
  start_time: string | null;  // HH:MM 24h
  end_time: string | null;    // HH:MM 24h
  notes: string | null;
};

async function extractWithClaude(emailText: string): Promise<Extracted | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system:
        "You extract shift booking details from staffing-agency emails. " +
        "Respond with ONLY a JSON object, no markdown fences, with keys: " +
        "is_shift_confirmation (boolean), company, venue_name, address, " +
        "date (YYYY-MM-DD), start_time (HH:MM 24h), end_time (HH:MM 24h), notes. " +
        "Use null for anything not present. If the email is not a shift " +
        "confirmation, set is_shift_confirmation to false. Today's date is " +
        new Date().toISOString().slice(0, 10) + " — resolve relative dates against it.",
      messages: [{ role: "user", content: emailText.slice(0, 12_000) }],
    }),
  });
  const data = await res.json();
  const text = data?.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

async function geocode(address: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", Deno.env.get("GOOGLE_MAPS_API_KEY")!);
  const json = await (await fetch(url)).json();
  const loc = json?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : { lat: null, lng: null };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const payload = await req.json();

  // Postmark fields; SendGrid Inbound Parse uses similar (to/text/subject)
  const toAddress: string = payload.OriginalRecipient ?? payload.To ?? payload.to ?? "";
  const body: string = payload.TextBody ?? payload.text ?? "";
  const subject: string = payload.Subject ?? payload.subject ?? "";

  const token = toAddress.split("@")[0]?.trim().toLowerCase();
  if (!token) return new Response("no recipient", { status: 400 });

  const { data: profile } = await supabase
    .from("profiles").select("id, default_buffer_mins, default_travel_mode")
    .eq("inbound_token", token).single();
  if (!profile) return new Response("unknown token", { status: 200 }); // 200 so the provider stops retrying

  const extracted = await extractWithClaude(`Subject: ${subject}\n\n${body}`);
  if (!extracted?.is_shift_confirmation || !extracted.date || !extracted.start_time) {
    return Response.json({ ok: true, skipped: "not a shift confirmation" });
  }

  const startsAt = new Date(`${extracted.date}T${extracted.start_time}:00`);
  const endsAt = extracted.end_time
    ? new Date(`${extracted.date}T${extracted.end_time}:00`)
    : new Date(startsAt.getTime() + 8 * 3_600_000); // default 8h if missing
  if (endsAt <= startsAt) endsAt.setDate(endsAt.getDate() + 1); // overnight shift

  const geo = extracted.address ? await geocode(extracted.address) : { lat: null, lng: null };

  // Default origin = user's default saved location
  const { data: home } = await supabase
    .from("locations").select("id").eq("user_id", profile.id)
    .eq("is_default", true).maybeSingle();

  const { data: shift, error } = await supabase.from("shifts").insert({
    user_id: profile.id,
    company: extracted.company ?? "Unknown agency",
    venue_name: extracted.venue_name ?? extracted.address ?? "Unknown venue",
    address: extracted.address ?? "",
    lat: geo.lat, lng: geo.lng,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    notes: extracted.notes,
    origin_location_id: home?.id ?? null,
    travel_mode: profile.default_travel_mode,
    buffer_mins: profile.default_buffer_mins,
    status: "pending_review",
    source: "email",
    raw_email: body.slice(0, 20_000),
  }).select("id").single();

  if (error) return new Response(error.message, { status: 500 });

  // Notify the user to confirm
  const { data: tokens } = await supabase
    .from("push_tokens").select("expo_push_token").eq("user_id", profile.id);
  if (tokens?.length) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokens.map((t) => ({
        to: t.expo_push_token,
        title: "New shift detected",
        body: `${extracted.venue_name ?? "Venue"} · ${extracted.date} ${extracted.start_time}. Tap to confirm.`,
        data: { shiftId: shift.id },
      }))),
    });
  }

  return Response.json({ ok: true, shiftId: shift.id });
});
