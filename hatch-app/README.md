# Hatch — YC startup discovery feed

Next.js (App Router) + TypeScript + Tailwind + shadcn-style UI + Prisma + Supabase Postgres/Storage.

A vertical, swipeable discovery feed for YC startups: scroll through cards, like/save/share, open a full
profile with founders and social links, all managed through an admin dashboard with real auth.

## 1. Install Node.js

You'll need Node 18.18+ (Next.js 14's minimum). Check with `node -v`.

## 2. Create a Supabase project

1. Go to supabase.com → New project.
2. **Database** → Project Settings → Database: copy the **pooled** connection string (port 6543) into
   `DATABASE_URL`, and the **direct** one (port 5432) into `DIRECT_URL`.
3. **Storage** → create three buckets, all set to **public**:
   - `startup-logos`
   - `startup-images`
   - `founder-images`
4. **API** → Project Settings → API: copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`, the anon key into
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`.
   The service role key is server-only — it's what lets the upload API bypass Storage RLS. Never expose it
   to the browser or commit it.

## 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the Supabase values from above, then:

```bash
# generate a session-signing secret
openssl rand -base64 32
```

Paste that into `AUTH_SECRET`. Optionally set `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the seed script uses these
to create your first admin login (defaults to `admin@hatch.dev` / `change-me-immediately` if you skip it).

## 4. Install, migrate, seed

```bash
npm install
npx prisma migrate dev --name init   # creates every table in Supabase
npm run seed                          # 10 categories, 1 admin user, 10 demo startups
```

The seed script prints your admin email/password at the end — **change that password immediately** by
signing up a real account and manually flipping its role to `ADMIN` in Supabase's table editor, or by
adding a "change password" flow (not included in this MVP — see **Extending it** below).

## 5. Run it

```bash
npm run dev
# http://localhost:3000        - the public feed
# http://localhost:3000/admin  - the admin dashboard (log in with the seeded admin account first)
```

## Architecture

| Layer | Where | Notes |
|---|---|---|
| Schema | `prisma/schema.prisma` | 8 models: User, Startup, Founder, Category, StartupCategory (join table), StartupImage, Like, SavedStartup, View, WebsiteClick |
| Auth | `lib/auth.ts`, `middleware.ts` | bcrypt password hashing, JWT session in an httpOnly cookie (`jose`, edge-compatible). `middleware.ts` gates `/admin/*` pages; every admin API route independently re-checks the session too — never trust the client |
| Storage | `lib/supabase.ts`, `app/api/upload/route.ts` | Service-role Supabase client, server-only. Validates file type/size with Zod before upload |
| Data access | `lib/services/*.ts` | Query/mutation functions shared by Server Components (direct calls, no HTTP round-trip) and API routes (client-side mutations) |
| Validation | `lib/validations/*.ts` | Zod schemas for auth, the startup form (incl. nested founders/images), and file uploads |
| Public feed | `app/page.tsx`, `components/startup/StartupFeed.tsx` | Scroll-snap column + `IntersectionObserver` for both the active-card rail and view tracking (60% visible for 500ms) |
| Detail page | `app/startup/[slug]/page.tsx` | Full profile with `generateMetadata` for per-page SEO/OG tags |
| Admin | `app/admin/**`, `components/admin/*.tsx` | Dashboard stats, startup table with publish/unpublish + delete confirmation, and the big multi-section form (`StartupForm.tsx`) with dynamic founders (`useFieldArray`) and drag-and-drop image upload |

## Simplifications from the original spec (and how to extend them)

This is a real, working MVP, but a few things were deliberately simplified to keep it shippable. All are
straightforward to build out further:

- **Cover Image vs. Main Product Screenshot** — the spec's Media section lists both, but the schema section
  only defines `logoUrl` + `coverImageUrl` (plus the separate `StartupImage` gallery). The form treats
  "Cover / main screenshot" as one field (`coverImageUrl`) and "Additional Screenshots" as the gallery. If
  you want a truly separate main-screenshot field, add a `mainScreenshotUrl` column to `Startup` and one
  more `ImageUploader` in the Media section.
- **Editing replaces founders/images/categories wholesale** (`lib/services/startups.ts`, `updateStartup`)
  rather than diffing each row. Simpler and correct for an admin form at this scale; if you need founder
  IDs to stay stable across edits (e.g. because something else references them), switch to a proper diff.
- **Image reordering** uses up/down arrow buttons, not drag-and-drop. Swap in `@dnd-kit/sortable` in
  `components/admin/ImageUploader.tsx` if you want true drag reordering.
- **The home feed loads its first 20 published startups up front**, not paginated. `/explore` already
  paginates properly since it's grid-based. For true infinite-scroll on the swipe feed, extend
  `StartupFeed.tsx` to fetch the next page from `/api/startups` as the user nears the last loaded card.
- **Share tracking isn't persisted** — `StartupActions.tsx` uses the Web Share API / clipboard fallback but
  there's no `Share` table. Add one (same shape as `View`/`WebsiteClick`) if you want "Most Shared" in the
  admin stats.
- **No password-reset flow.** There's signup/login/logout and that's it. Add a `PasswordResetToken` model
  and an email step (Resend, Postmark, etc.) when you need it.
- **Seed data uses placeholder links** — company/founder social URLs use `.example` domains or an
  `-example` suffix on real platforms (`linkedin.com/in/name-example`) specifically so nothing resolves to
  an unrelated real site or person. Replace with real links as you add real startups.

## Deploying

1. Push to GitHub, import into Vercel.
2. Add every variable from `.env` to Vercel's project settings.
3. Run `npx prisma migrate deploy` against your Supabase database once (locally, pointed at prod, or via a
   CI step) before the first deploy — Vercel's build only runs `prisma generate` (see `postinstall` in
   `package.json`), not migrations.
4. Deploy. Middleware and Route Handlers using `next/headers`/cookies run fine on Vercel's Edge/Node
   runtimes with no extra config.
