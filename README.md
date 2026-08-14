# StickyStack

A 3D sticky-note task tracker. Add tasks to a To-Do sidebar (one sticky-note color per week),
edit them inline, and mark them done to spear them onto a virtual receipt-spike — a running,
color-coded record of what you've finished.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema migrations**: open the SQL editor in your Supabase project and run the
   contents of each file in [`supabase/migrations/`](supabase/migrations/) in order
   (`0001_init.sql`, then `0002_add_username.sql`).
3. **Disable email confirmation** (optional, recommended for local dev): in Supabase dashboard →
   Authentication → Providers → Email, turn off "Confirm email" so sign-up logs you in
   immediately without needing to click a confirmation link.
4. **Allow the password-reset redirect**: in Supabase dashboard → Authentication → URL
   Configuration → Redirect URLs, add `http://localhost:5173/reset-password` (and your deployed
   site's `/reset-password` URL, once you have one) — Supabase rejects `resetPasswordForEmail`
   redirects that aren't on this allow-list.
5. **Copy your API credentials**: in Supabase dashboard → Project Settings → API, copy the
   Project URL and `anon` public key into a `.env` file at the repo root (copy `.env.example` as
   a starting point):
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. **Install dependencies and run**:
   ```
   npm install
   npm run dev
   ```

## Stack

- Vite + React + TypeScript
- React Three Fiber + drei (Three.js) for the 3D spike scene
- Supabase (Postgres + Auth) for data and authentication
- React Query for server state
- GSAP for the spear/settle/tear-away animations

## Notes

- Weeks run Monday–Sunday. A new week is created automatically (client-side, based on the
  browser's local date) the first time you load the app during that week, and you'll be prompted
  to pick a color for it before you can add notes.
- Archiving is a single global setting (Settings page): weeks older than N months (1–4, default
  2) are hidden from the active view. This is computed client-side from each week's start date —
  nothing is deleted.
- The 4 handwriting fonts used for note text (`public/fonts/*.ttf`) are self-hosted TTFs required
  by the 3D text renderer (troika-three-text via drei's `<Text>`), separate from the
  `@fontsource/*` packages used for ordinary CSS/HTML text.
