# Route — AI Design Companion

A small AI prototype for mobility/delivery product teams. You describe a screen or feature, and Route:

1. **Brainstorms layouts** — three distinct structural directions for the screen
2. **Generates UI copy** — two variants for each key text element (titles, buttons, states)
3. **Summarizes usability feedback** — paste raw test notes / reviews / support tickets, get a prioritized, severity-tagged action list

Built as part of a design challenge exercise, framed around ride-hailing/delivery UX.

**Live demo:** `https://YOUR-PROJECT.vercel.app`

## Why it's structured this way

The AI call never happens in the browser. The frontend (`index.html`) calls a serverless
function (`api/generate.js`), which holds the API key server-side as an environment variable
and calls the Gemini API on the frontend's behalf. This means the key is never visible in
browser dev tools, page source, or the deployed static files — the correct pattern for any
project that ships a real API key.

```
index.html  →  POST /api/generate  →  api/generate.js (server, has the key)  →  Gemini API
```

## Stack

- **Frontend:** plain HTML/CSS/JS, no framework, no build step
- **Backend:** one Vercel Serverless Function (`api/generate.js`)
- **AI:** [Google Gemini API](https://ai.google.dev/) — free tier (Flash model), chosen because
  it's genuinely free for prototyping (no credit card, no expiry), just rate-limited
- **Hosting:** Vercel (free/hobby tier)

## Run it locally

```bash
npm install -g vercel      # if you don't have it
git clone https://github.com/YOUR_USERNAME/design-companion.git
cd design-companion
cp .env.example .env.local
# edit .env.local and paste a free key from https://aistudio.google.com/apikey
vercel dev
```

Open the local URL it prints (usually `http://localhost:3000`).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo.
3. Before the first deploy, add an environment variable:
   **Settings → Environment Variables** → `GEMINI_API_KEY` = *your key* (all environments).
4. Deploy. Vercel auto-detects `index.html` as the static site and `api/generate.js` as a
   serverless function — no extra config needed.

## Notes

- Free-tier Gemini rate limits are low (roughly 10–15 requests/minute) — plenty for a single
  person demoing this, not meant for production traffic.
- This is a prompt-orchestration prototype: it calls a general-purpose model (Gemini Flash)
  with structured system prompts. As a next step, once I understand a team's real design
  patterns and content style, the natural evolution is fine-tuning a smaller model on that
  team's actual design system, tone of voice, and feedback history, then swapping the API
  call in `api/generate.js` for a self-hosted / fine-tuned endpoint instead of a general model.

## License

MIT — built for a design challenge submission.
