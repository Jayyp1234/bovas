# Supabase

This app is wired for Supabase Auth + Postgres. Without env vars it still runs on mock data.

## 1. Create a project

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon public** key from **Project Settings → API**
3. Copy `.env.local.example` → `.env.local` and paste the values

## 2. Apply schema + seed

In the Supabase SQL Editor, run in order:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

## 3. Create a demo user

**Authentication → Users → Add user** (email + password).

Optionally set metadata so the profile trigger picks up name/role:

```json
{ "full_name": "Olateju Oyetoke", "role": "logistics" }
```

Or update after create:

```sql
update public.profiles
set full_name = 'Olateju Oyetoke', role = 'logistics'
where id = '<user-uuid>';
```

Roles: `logistics` | `admin` | `dispatch` | `safety`

## 4. Run the app

```bash
npm run dev
```

Sign in at `/`. Logistics home loads tickets/charts from Supabase when configured.
