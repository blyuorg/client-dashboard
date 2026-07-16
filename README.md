# Blyu Client Portal

A production-ready client portal built with Next.js 15, Supabase, and shadcn/ui.

## What's already wired up

- Full folder structure: `(auth)`, `(dashboard)`, `(admin)` route groups
- Supabase browser + server clients (`src/lib/supabase`)
- Middleware-based session refresh + route protection (`src/middleware.ts`)
- Auth pages: login, register, forgot password, reset password — all calling real Supabase Auth methods
- Dashboard shell: sidebar, topbar, theme toggle, dark/light mode via `next-themes`
- Admin shell with server-side role check (redirects non-admins)
- Dashboard home page that queries live `projects` and `invoices` tables
- Placeholder pages for every remaining route (project, billing, documents, messages, notifications, profile, settings, and admin sub-pages) — ready for you to build out
- Core shadcn/ui components: Button, Card, Input, Label
- Zod validation schemas for all auth forms
- Full Postgres schema with RLS in `supabase/schema.sql`
- TypeScript types matching the schema in `src/types/database.ts` (placeholder — swap for generated types once your project is live)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a Supabase project at [supabase.com](https://supabase.com), then run `supabase/schema.sql` in the SQL editor.

3. Copy the env template and fill in your project's values:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. (Optional) Generate real TypeScript types once your schema is live:
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
   ```

6. Add remaining shadcn components as you need them:
   ```bash
   npx shadcn@latest add dialog dropdown-menu avatar badge separator sheet toast skeleton table tabs
   ```

## First admin user

New signups default to `role = 'client'`. To make yourself an admin, run this in the Supabase SQL editor after registering:

```sql
update public.profiles set role = 'admin' where email = 'you@yourcompany.com';
```

## Folder structure

```
src/
  app/
    (auth)/         — login, register, forgot/reset password
    (dashboard)/    — client-facing portal (protected, role: client)
    (admin)/        — admin panel (protected, role: admin)
  components/
    ui/             — shadcn primitives
    dashboard/      — sidebar, topbar
    layout/         — theme provider/toggle
  lib/
    supabase/       — browser client, server client, middleware helper
    validations/    — zod schemas
  types/            — database types
supabase/
  schema.sql        — full DB schema + RLS policies
```

## Next steps

Continue building step by step — task management, milestones, billing UI, document upload to Supabase Storage, realtime messaging, and the admin CRUD panels are all scaffolded but not yet built out.
