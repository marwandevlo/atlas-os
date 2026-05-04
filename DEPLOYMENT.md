# ZAFIRIX PRO — deployment guide

This document describes how to deploy **ZAFIRIX PRO** to Vercel with Supabase auth and admin features working in production.

---

## 1. Prerequisites

- A GitHub repository containing this project.
- A Supabase project (URL + anon key + service role key).
- A Vercel account.

---

## 2. Git readiness & GitHub

### Checks before you commit

- **Git initialized**: Run `git rev-parse --is-inside-work-tree`. If it prints `true`, the project is already a repository (skip `git init` in the command block below). If it errors, run `git init` once.
- **`.gitignore`**: The pattern `.env*` ignores `.env.local` and other local env files. The line `!.env.example` ensures **`.env.example`** (template only) can be committed—do not put real secrets in that file.
- **Secrets**: Never commit `.env.local` or any file containing real API keys. Use Vercel environment variables for production.

### Create the GitHub repository

Create a repository on GitHub (private recommended). Copy its clone URL—you will use it as `GITHUB_REPO_URL` below.

### Push **ZAFIRIX PRO** to GitHub

Run from the project root. If the directory is **already** a Git repository, **omit** `git init`.

```bash
git init
git add .
git commit -m "ZAFIRIX PRO production setup"
git branch -M main
git remote add origin <GITHUB_REPO_URL>
git push -u origin main
```

Replace `<GITHUB_REPO_URL>` with your repository URL (HTTPS or SSH).

- If **`origin` already exists**: use `git remote set-url origin <GITHUB_REPO_URL>` instead of `git remote add origin`.
- If **`git commit`** says there is nothing to commit: run `git status`; stage and commit when you have changes worth pushing.
- **Do not** add or commit `.env.local`.

---

## 3. Vercel

1. **Import** the GitHub repository in [Vercel](https://vercel.com) (**Add New…** → **Project**).
2. **Add environment variables** (see section 4)—required for Supabase and auth redirects.
3. **Deploy** (Vercel runs the build after import or when you trigger a deployment).

Framework: **Next.js** (auto-detected). **Root directory**: repository root unless this app is in a subfolder. **Build command**: `npm run build` (default).

Do not commit `.env.local`; use Vercel **Environment Variables** for hosted environments.

---

## 4. Environment variables in Vercel

In the Vercel project: **Settings** → **Environment Variables**, add (at minimum):

| Name | Environment | Notes |
|------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | **Server-only** — never `NEXT_PUBLIC_*` |
| `NEXT_PUBLIC_SITE_URL` | Production | Your live site origin, e.g. `https://YOUR_DOMAIN_HERE` |
| `NEXT_PUBLIC_SITE_URL` | Preview | Optional: your Vercel preview URL pattern if you use password reset on previews |

**Important**

- `SUPABASE_SERVICE_ROLE_KEY` must **only** exist in server-side context. It must not be prefixed with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SITE_URL` for **local** development should be `http://localhost:3000` (set in `.env.local`, not necessarily in Vercel).
- `NEXT_PUBLIC_SITE_URL` for **production** must be the exact public origin users open in the browser (your Vercel production domain or custom domain), **no trailing slash**.

Copy variable names and empty templates from `.env.example` in this repository.

If you already use other secrets (cron, webhooks, etc.), add them in Vercel the same way you use them locally — do not commit secret values to Git.

---

## 5. Deploy

1. After env vars are set, trigger **Deploy** (first deploy happens automatically after import when settings are saved).
2. Confirm the production URL loads.
3. Run a smoke test: sign in, open a non-admin page, then (as admin/owner) open `/admin`.

---

## 6. Supabase — Authentication URL configuration

Supabase must allow redirects to your app’s password reset route.

In the Supabase dashboard: **Authentication** → **URL Configuration**.

### Local development

**Site URL**

```text
http://localhost:3000
```

**Redirect URLs** (add each as a separate entry or use patterns your Supabase version supports)

```text
http://localhost:3000/*
http://localhost:3000/reset-password
```

### Production

Replace `YOUR_DOMAIN_HERE` with your real host (no path).

**Site URL**

```text
https://YOUR_DOMAIN_HERE
```

**Redirect URLs**

```text
https://YOUR_DOMAIN_HERE/*
https://YOUR_DOMAIN_HERE/reset-password
```

Save changes in Supabase after updating.

---

## 7. Password reset (production check)

The forgot-password flow uses `getAuthSiteUrl()` and sends users to:

```text
{NEXT_PUBLIC_SITE_URL}/reset-password
```

Ensure:

1. `NEXT_PUBLIC_SITE_URL` in **production** matches the URL users use (scheme + host, no trailing slash).
2. The Supabase redirect allowlist includes `https://YOUR_DOMAIN_HERE/reset-password` (see section 6).

There is no separate hardcoded production domain in that flow; local fallback in `getAuthSiteUrl()` applies only when the env var is unset and is mainly relevant for non-browser contexts — **always set `NEXT_PUBLIC_SITE_URL` on Vercel**.

---

## 8. Owner and admin access (verification)

After deploy:

1. **Owner** — The owner account is `maizimarouane1991@gmail.com` (see `app/lib/owner.ts`). That user must be able to open `/admin` and related routes.
2. **Admin** — Users with `app_metadata.role` or `profiles.role` of `admin` or `owner` can access `/admin/*` (middleware enforces this; owner email has a fast path).
3. **Normal users** — Should receive `/access-denied` (or equivalent redirect) when opening `/admin/*`.

If admin menu/API fails, confirm `SUPABASE_SERVICE_ROLE_KEY` is set on the server (Vercel) for routes that need a service client, and that JWT / `profiles` data matches your expectations.

---

## 9. Post-deploy checklist

- [ ] `npm run lint` and `npm run build` pass locally before each release.
- [ ] Vercel: all required env vars set for Production (and Preview if used).
- [ ] Supabase: Site URL + Redirect URLs updated for production.
- [ ] Password reset: request email from production, complete flow on `/reset-password`.
- [ ] Owner login + `/admin` smoke test.
- [ ] Non-admin user cannot open `/admin`.

---

## 10. Support

This guide does not perform deployment for you. If GitHub or Vercel access is not available in your environment, complete the steps above in the browser and CI you control.
