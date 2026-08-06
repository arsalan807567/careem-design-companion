# Route: AI Design Companion

A small AI prototype for mobility and delivery product teams. You describe a screen or feature, and Route:

1. **Brainstorms layouts**: three distinct structural directions for the screen
2. **Generates UI copy**: two variants for each key text element (titles, buttons, states)
3. **Summarizes usability feedback**: paste raw test notes, reviews, or support tickets, get a prioritized, severity-tagged action list

Built as part of a design challenge exercise, framed around ride-hailing and delivery UX.

**Live demo:** `https://careem-design-companion-ten.vercel.app`

## Why it's structured this way

The AI call never happens in the browser. The frontend (`index.html`) calls a serverless
function (`api/generate.js`), which holds the API key server-side as an environment variable
and calls the Gemini API on the frontend's behalf. This means the key is never visible in
browser dev tools, page source, or the deployed static files. This is the correct pattern for
any project that ships a real API key.

```
index.html  ->  POST /api/generate  ->  api/generate.js (server, has the key)  ->  Gemini API
```

## Stack

- **Frontend:** plain HTML, CSS, and JS. No framework, no build step.
- **Backend:** one Vercel Serverless Function (`api/generate.js`)
- **AI:** [Google Gemini API](https://ai.google.dev/), free tier, `gemini-3.5-flash-lite` model.
  Chosen because it is genuinely free for prototyping (no credit card, no expiry), just rate-limited.
- **Hosting:** Vercel (free/hobby tier)

## Run it locally

```bash
npm install -g vercel      # if you do not have it
git clone https://github.com/arsalan807567/careem-design-companion.git
cd careem-design-companion
cp .env.example .env.local
# edit .env.local and paste a free key from https://aistudio.google.com/apikey
vercel dev
```

Open the local URL it prints (usually `http://localhost:3000`).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), click Add New Project, and import the GitHub repo.
3. Before the first deploy, add an environment variable:
   Settings, then Environment Variables, then add `GEMINI_API_KEY` = your key (all environments).
4. Deploy. Vercel auto-detects `index.html` as the static site and `api/generate.js` as a
   serverless function, no extra config needed.

## A note on the model name

Google retires and restricts Gemini model names often. This project has already moved through
three model names in active development (`gemini-2.0-flash`, then `gemini-2.5-flash-lite`, now
`gemini-3.5-flash-lite`) as older ones were shut down or blocked for new API keys. The model
name lives in one place, `MODEL` at the top of `api/generate.js`, so it is a one-line change
if it needs updating again. Check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
for the current list if the API starts returning 404 or 429 errors.

## Notes

- Free-tier Gemini rate limits are low, roughly 10 to 15 requests per minute. Plenty for a
  single person demoing this, not meant for production traffic.
- This is a prompt-orchestration prototype: it calls a general-purpose model with structured
  system prompts. As a next step, once I understand a team's real design patterns and content
  style, the natural evolution is fine-tuning a smaller model on that team's actual design
  system, tone of voice, and feedback history, then swapping the API call in `api/generate.js`
  for a self-hosted or fine-tuned endpoint instead of a general model.

## License

MIT. Built for a design challenge submission.
