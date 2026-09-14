# DealSphere DM — Setup Guide

This is your private chat website. Follow these steps in order — don't skip any.

## Step 1 — Create your Supabase project

1. Go to https://supabase.com and sign up (free).
2. Click **New Project**. Give it a name like "dealsphere-dm".
3. Set a database password and save it somewhere safe.
4. Wait for the project to finish setting up (about 2 minutes).

## Step 2 — Run the database setup

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from this project, copy ALL of it, and paste it into the SQL Editor.
4. Click **Run**. You should see "Success. No rows returned."
5. Repeat steps 2–4 with `supabase/storage.sql`.

## Step 3 — Get your API keys

1. In Supabase, click **Settings** (gear icon) → **API**.
2. You'll see:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" to see it)
3. Keep this tab open — you'll need these in Step 5.

## Step 4 — Put the project on GitHub

1. Go to https://github.com and sign up if you don't have an account.
2. Create a new repository (e.g. "dealsphere-dm").
3. Upload all the files from this project into that repository.

## Step 5 — Deploy to Vercel

1. Go to https://vercel.com and sign up using your GitHub account.
2. Click **Add New Project** and select your "dealsphere-dm" repository.
3. Before clicking Deploy, open **Environment Variables** and add these three:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste your Project URL from Step 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste your anon public key from Step 3
   - `SUPABASE_SERVICE_ROLE_KEY` → paste your service_role key from Step 3
4. Click **Deploy**. Wait a minute or two.
5. Vercel gives you a live web address (like `dealsphere-dm.vercel.app`) — this is your live site.

## Step 6 — Turn off email confirmation (so signup is instant)

By default, Supabase asks new users to click a confirmation email before they can log in. Since your signup flow should go straight into the chat, turn this off:

1. In Supabase, go to **Authentication** → **Providers** → **Email**.
2. Turn OFF "Confirm email".
3. Save.

## Step 7 — Create your admin (team) accounts

Each team member who will reply to visitors needs to:

1. Go to your live website and sign up normally, exactly like a visitor would (email + Instagram username + 6-digit password). It's fine to use a placeholder Instagram username like `@dealsphere-team`.
2. Then, in Supabase, go to **SQL Editor** and run this (replace the email with theirs):

```sql
update public.profiles
set role = 'admin'
where email = 'teammate@example.com';
```

3. Repeat for every team member.
4. From now on, when that person logs in, they'll be sent to `/admin` instead of the regular chat.

Your admin dashboard lives at: `https://your-site.vercel.app/admin`

## How it all works, in plain terms

- **Visitors** sign up with email + Instagram username + a 6-digit code, and land directly in their own private chat with DealSphere.
- **Team members** log in with the same kind of account, but because you marked them "admin" in the database, they land in the admin dashboard instead — where they can see every visitor and reply to any of them.
- Every visitor's conversation is locked down at the database level (this is called "Row Level Security") — a visitor can only ever see their own messages, never anyone else's.
- Photos are stored in a private Supabase "bucket" — they're never publicly accessible, only visible to that visitor and to admins.
- Messages appear instantly for both sides thanks to Supabase Realtime — no refreshing needed.

## Local development (optional, if you want to test on your own computer first)

1. Install Node.js from https://nodejs.org if you don't have it.
2. Open a terminal in this project folder and run:
   ```
   npm install
   ```
3. Copy `.env.example` to a new file named `.env.local`, and fill in your three Supabase values from Step 3.
4. Run:
   ```
   npm run dev
   ```
5. Open http://localhost:3000 in your browser.

## What's included vs. what you may want to add later

Included: signup/login, private 1-to-1 chat, photo sharing, link sharing with clickable links, admin dashboard with a user list and unread counts, real-time messages, read receipts, row-level security.

Not included yet (mentioned as "optional" in the original spec): browser push notifications, and rich link preview cards (title/thumbnail scraping) — links currently show as clean clickable text, which is safe and simple. Ask if you'd like either of these added.
