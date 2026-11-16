# Remix Closet

Remix Closet helps people make new outfits from clothes they already own instead of buying more. Add your pieces with a photo, mix and match a top, a middle and shoes, and let an AI stylist dress you for the day's weather and plans. Share the looks you come up with in a community feed.

It installs to your phone's home screen like an app and works offline.

## Features

* **Mix and match.** Three rows (top, middle, shoes) with arrows or swipes. Lock a row and shuffle the rest.
* **AI stylist.** Pick an occasion and Claude chooses an outfit from your closet based on the weather, your sizes, Fall 2026 trends, and what you haven't worn lately. A built-in stylist takes over offline.
* **Photo and tag reading.** Snap a piece and Claude fills in its name, type, color and fabric. Snap the tag and it reads brand, size and care.
* **Remix score.** Every outfit is scored on weather, fit, color matching and trends, with a one-tap swap to hit a trend.
* **Fit alerts.** Change your sizes and anything that no longer fits gets flagged.
* **Outfit diary and money kept.** Log what you wore, watch cost per wear drop, and see what you didn't spend.
* **Community feed.** Share looks, like other people's, report anything off. Women's, men's or both trend sets.
* **Installable, offline, private.** Closets stay on your phone. Download a backup to move to a new one.

## How it's built

```
Phone or browser                 Cloudflare Worker (this repo)                 Anthropic
┌────────────────┐   /           ┌──────────────────────────────────┐
│ index.html     │ ────────────▶ │ serves the files in /public      │
│ app.js         │               │                                  │   key stays   ┌────────┐
│ service worker │   /api/style  │ checks origin + rate limits      │ ────────────▶ │ Claude │
│ closet saved   │   /api/read-* │ builds the prompt, cleans answer │   here        └────────┘
│ on the phone   │   /api/feed   │ shared feed in Cloudflare D1     │
└────────────────┘               └──────────────────────────────────┘
```

* `public/` is the app: plain HTML, CSS and JavaScript with no framework and no build step.
* `src/worker.js` serves the app and runs the API routes.
* The feed lives in a Cloudflare D1 (SQLite) database that Cloudflare creates on the first deploy. The Worker makes its tables itself.

### Security and privacy decisions

* **The API key never reaches the browser.** It's an encrypted Worker secret, not in the code or the repo.
* **No open proxy.** Prompts are built on the server. Visitors can only send closet data or a photo, so nobody can use the endpoint as free general purpose Claude.
* **Rate limits per visitor:** 8 AI requests, 3 posts, 30 likes or reports, and 60 feed refreshes per minute.
* **Spend cap.** The API key lives in its own Claude Console workspace with a monthly spend limit.
* **Photos stay private.** Closets and photos never leave the phone. Shared looks show each piece as a drawing in its color. Photos sent to Claude for reading are never stored or logged.
* **Moderation.** Posts can't contain links. A post is hidden after 3 reports from different devices. Authors can delete their own posts with a secret token saved on their phone, and the site owner can delete anything with `ADMIN_KEY`.
* **Validation everywhere.** Every field is type checked, trimmed and length limited on the server, and again in the app before it's shown.
* **Prompt injection.** User notes and tag text are marked as data, and the model's answer is parsed as JSON and checked against the closet before it's used.
* **Content Security Policy** only allows scripts from the site itself, plus `X-Frame-Options`, `nosniff` and a strict referrer policy in `public/_headers`.

## Deploy it (about 10 minutes)

### 1. Make an API key with a spend limit

1. In the [Claude Console](https://platform.claude.com), go to **Settings > Workspaces** and create a workspace called `Remix`.
2. Open it, click **Spend limits**, and under **Monthly limit** click **Change limit**. $5 is plenty to start.
3. Create an API key inside that workspace and copy it.

### 2. Connect this repo to Cloudflare

1. In the Cloudflare dashboard, go to **Workers & Pages > Create > Import a repository**.
2. Pick `remix-closet`. Leave the build settings as they are (the deploy command is `npx wrangler deploy`) and click **Deploy**.
3. The first deploy also creates the feed database. Your app is live at `https://remix-closet.<your-subdomain>.workers.dev`.

### 3. Add the secrets

In **Workers & Pages > remix-closet > Settings > Variables and Secrets**, add two of type **Secret**:

* `ANTHROPIC_API_KEY`: the key from step 1.
* `ADMIN_KEY`: a long random password you make up (at least 16 characters). Only you need it.

Reload the site and the AI stylist and photo reading turn on.

### 4. Put it on your phone

* **iPhone:** open the link in Safari, tap **Share**, then **Add to Home Screen**.
* **Android:** open it in Chrome and tap **Install** in the header.

## Running the site

**Shipping updates.** Push to `main` and Cloudflare redeploys. After changing `index.html`, `app.js` or `app.css`, bump `VERSION` at the top of `public/sw.js` (for example `remix-v2`) so installed copies pick up the change.

**Removing a post.** Copy the post's id from `https://<your site>/api/feed`, then run:

```bash
curl -X POST https://<your site>/api/admin/delete \
  -H "content-type: application/json" -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{"post":"POST_ID"}'
```

**Seeing hidden posts.** In the Cloudflare dashboard, open **Storage & Databases > D1 > remix-closet-feed > Console** and run `SELECT * FROM posts WHERE hidden = 1;`.

**If the database isn't created automatically.** Run `npx wrangler d1 create remix-closet-feed`, paste the `database_id` it prints into the `[[d1_databases]]` block in `wrangler.toml`, and push.

**Run it on your computer:**

```bash
npm install
cp .dev.vars.example .dev.vars   # paste your key into .dev.vars
npm run dev                      # http://localhost:8787
```

## What it costs

* **Cloudflare:** free. App files are free and unlimited, the free plan includes 100,000 API requests a day, and D1's free tier easily covers the feed.
* **Claude:** with Claude Haiku 5.5, a stylist pick or photo read costs a fraction of a cent. The workspace spend limit caps the total.

## Next steps

* Accounts and sync across devices (each closet is saved only on its own phone today).
* Live weather from the phone's location.
* An App Store version that wraps this same code with Capacitor.
