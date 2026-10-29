# ShiftPilot

> **Case study:** a plain-English walkthrough of how this works, step by step, with the key code: https://abdulakeem-adebayo.vercel.app/#shiftpilot

Every shift. Every agency. On time.

One Expo (React Native + TypeScript) codebase that ships to **iOS, Android, and the web**, backed by **Supabase**. This scaffold includes auth, the full data model, shift CRUD with conflict detection, shift templates, multi-location starting points, the AI email-parsing pipeline, and the live-traffic **leave-by alert engine**.

---

## 1. What's in the box

```
app/                        Expo Router screens
  (auth)/                   sign-in, sign-up
  (tabs)/                   Today (leave-by countdown), Shifts, Templates, Settings
  shift/new.tsx             add shift (manual or from template) + conflict warning
  shift/[id].tsx            detail + confirm flow for email-detected shifts
src/
  theme/tokens.ts           design system ("pre-dawn dashboard": ink blue + amber)
  lib/                      supabase client, notifications, maps links, conflicts
  hooks/                    useAuth, useShifts (realtime), useLocations, useTemplates
  components/               Button, Field, ShiftCard, LeaveByBanner
supabase/
  migrations/0001_schema.sql   full schema + RLS + conflict-check function
  functions/leave-by-engine/   cron: live traffic → leave_by → Expo push
  functions/parse-shift-email/ inbound email webhook → Claude extraction → pending shift
```

## 2. First run (15 minutes)

1. **Install** (Node 20+):
   ```bash
   npm install
   ```
2. **Create a Supabase project** at supabase.com (free tier). In the SQL editor, paste and run `supabase/migrations/0001_schema.sql`.
3. **Env:** copy `.env.example` → `.env`, fill in your project URL and anon key from Supabase → Settings → API.
4. **Run it:**
   ```bash
   npm run web        # browser, instant
   npm start          # then scan the QR with Expo Go on your phone
   ```
   Sign up, add a starting point in Settings, add a shift. Realtime sync, conflict warnings, and reminders work out of the box.

## 3. Wire up the leave-by engine

1. Get a **Google Maps Platform** key with Directions + Geocoding APIs enabled.
2. Install the Supabase CLI, then:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set GOOGLE_MAPS_API_KEY=...
   supabase functions deploy leave-by-engine --no-verify-jwt
   ```
3. Schedule it every 5 minutes — in the SQL editor (enable the `pg_cron` and `pg_net` extensions first):
   ```sql
   select cron.schedule('leave-by', '*/5 * * * *',
     $$ select net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/leave-by-engine',
          headers := '{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
        ) $$);
   ```
Shifts with a geocoded venue + a default starting point now get a live `leave_by_at`, and the user receives a "Leave now" push at exactly the right moment. The Today screen's countdown reads the same fields.

## 4. Wire up AI email parsing

1. Get an **Anthropic API key** (console.anthropic.com).
2. Deploy:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=...
   supabase functions deploy parse-shift-email --no-verify-jwt
   ```
3. Sign up for **Postmark** (or SendGrid Inbound Parse), add an inbound domain like `in.yourdomain.com` (MX record), and set the inbound webhook to:
   `https://YOUR_PROJECT_REF.supabase.co/functions/v1/parse-shift-email`
4. Update `INBOUND_DOMAIN` in `app/(tabs)/settings.tsx`.

Each user's Settings screen shows their private forwarding address (`<token>@in.yourdomain.com`). Forward any agency confirmation → Claude extracts the fields → shift lands as **pending review** → push notification → one tap to confirm. No regex templates to maintain; it handles any agency's email format.

## 5. Going live

**Web (days):** `npm run build:web`, deploy `dist/` to Vercel/Netlify, point your domain. No store review.

**Android (~1 week):** create an [Expo EAS](https://expo.dev) account, then `npx eas build -p android` and `npx eas submit -p android`. Google Play: $25 one-time, review usually < 2 days.

**iOS (~2–3 weeks):** Apple Developer ($99/yr), `npx eas build -p ios`, `npx eas submit -p ios`. In App Review notes, explain location use: travel-time calculation and arrival check-in reminders, both user-facing. Expect one revision cycle.

## 6. Costs at launch

Supabase free tier → $25/mo at scale · Google Maps $200/mo free credit · Anthropic ~$0.003 per parsed email (Sonnet) · Postmark free dev tier → $15/mo · Apple $99/yr · Google $25 once.

## 7. Roadmap (v1.1+)

Geofence check-in reminders (expo-location geofencing is already permissioned in `app.json`) · expense & earnings reports with CSV export · free/busy iCal share link · iCal feed import · offline-first local cache (expo-sqlite) · agency-side B2B dashboard.
