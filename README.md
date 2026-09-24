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

## Razorpay billing setup

The billing flow is ready for Razorpay test mode or live mode. Add these server-only variables to `.env.local` and to your deployment provider's environment settings:

```bash
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

Run the SQL files in `supabase/migrations/` for an existing Supabase database. Create invoices from **Admin → Invoices**. A client sees only their own invoices on `/billing`; selecting **Pay securely** opens Razorpay checkout. The server verifies Razorpay's signature before it writes a successful payment and changes the invoice to `paid`.

Use test credentials first, then replace both values with live credentials when you are ready to accept real payments. Never commit the secret key or prefix it with `NEXT_PUBLIC_`.

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

## Documents, messages, and meetings

The Documents page uploads admin-selected files directly to the private Supabase Storage `documents` bucket. Apply `supabase/migrations/20260924232129_document_storage_bucket.sql` to another Supabase project before using uploads there. Files are limited to 20 MB and PDF, Word, Excel, text, CSV, PNG, JPEG, or WebP. The selected project's client can download the file through a short-lived signed URL. The migration has already been applied to the `client-dashboard` Supabase project.

Messages use the `conversations` and `direct_messages` tables and Supabase Realtime. A client must have an assigned admin in `profiles.assigned_admin_id`; the admin assignment creates or heals the private conversation. The live project has existing messages and the message insert policy was checked in a rolled-back transaction.

Meetings use Google Calendar to send invitations for all three video platforms. Set `TOKEN_ENCRYPTION_KEY` to a long random value in every deployment environment and keep the same value when redeploying, since changing it invalidates stored OAuth tokens. The local `.env.local` has a generated key. Configure these OAuth apps and add their client IDs, client secrets, and callback URLs to `.env.local` and the deployment environment:

| Provider | Required environment variables | Callback URL suffix | API permission |
| --- | --- | --- | --- |
| Google Calendar / Meet | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | `/api/integrations/google/callback` | Calendar API, `calendar.events` |
| Zoom | `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`, `ZOOM_REDIRECT_URI` | `/api/integrations/zoom/callback` | Create/update/delete meetings (`meeting:write:meeting`; add read scope if required by the Zoom app type) |
| Microsoft Teams | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, optionally `MICROSOFT_TENANT_ID` | `/api/integrations/microsoft/callback` | Delegated `OnlineMeetings.ReadWrite` and `User.Read`; use a work or school Teams account |

The redirect URI must match the exact app URL, including `http://localhost:8000` for local development or the production domain. After adding the credentials, sign in to the dashboard and connect Google, Zoom, and Microsoft under **Settings → Integrations**. Each person scheduling meetings connects their own provider accounts. Google must be connected even when choosing Zoom or Teams because this implementation sends every invitation through Google Calendar.
