# Supabase setup

One-time:

1. Open https://supabase.com/dashboard/project/hwqzherwgyauyekhnnee/sql/new
2. Paste the contents of `schema.sql` and click **Run**.
3. In **Authentication ▸ Providers**, enable **Email** (already on by default).
   For local dev, turn **off** "Confirm email" so signups land in immediately.
4. (Optional) In **Authentication ▸ URL Configuration**, add `http://127.0.0.1:5173`
   to **Site URL** and **Redirect URLs** so magic-link callbacks return to dev.
5. (Production) Add your real domain to the same fields.

After that, sign up in the app — `rota_seed_for_user(auth.uid())` is called on
first login and populates Oakwood + workers + this week's shifts for that account.
