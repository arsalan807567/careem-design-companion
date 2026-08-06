// Vercel Serverless Function — runs on the server, never in the browser.
// The Gemini API key lives only here, read from an environment variable.
// The frontend (public site) never sees it.

const MODEL = "gemini-2.5-flash-lite"; // active free-tier model
                                   // for the current free-tier model id if this one is retired.

const IDEAS_SYSTEM = `You are a senior product design partner for a ride-hailing / delivery super-app (like Careem). Given a screen brief, respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "layouts": [
    {"title": "short direction name", "description": "2-3 sentences on the layout approach and why it fits the brief"},
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."}
  ],
  "copy": [
    {"element": "name of the UI element, e.g. Screen title", "variant_a": "short copy option", "variant_b": "short copy option"},
    {"element": "...", "variant_a": "...", "variant_b": "..."},
    {"element": "...", "variant_a": "...", "variant_b": "..."}
  ]
}
Give exactly 3 layout directions and exactly 3 copy elements (pick the most important UI text: title, primary button, empty/error state, etc). Keep copy in active voice, sentence case, specific rather than clever.`;

const FEEDBACK_SYSTEM = `You are a UX researcher. Given raw, messy usability feedback notes, respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
{
  "actionItems": [
    {"issue": "short description of the problem, in plain language", "severity": "high|medium|low", "fix": "one concrete, specific suggested fix"}
  ]
}
Extract 3-6 distinct action items. Merge duplicate observations. Severity reflects how much it blocks or frustrates users, not how often it was mentioned alone.`;

async function callGemini(apiKey, systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
      maxOutputTokens: 1024
    }
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`Gemini API error ${r.status}: ${errText}`);
  }

  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "{}";
  return JSON.parse(text);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server is missing GEMINI_API_KEY. Set it in your Vercel project's Environment Variables."
    });
  }

  const { mode, brief, feedback } = req.body || {};

  try {
    if (mode === "ideas") {
      if (!brief || !brief.trim()) {
        return res.status(400).json({ error: "\"brief\" is required for mode=ideas" });
      }
      const result = await callGemini(apiKey, IDEAS_SYSTEM, `Screen brief: ${brief}`);
      return res.status(200).json(result);
    }

    if (mode === "feedback") {
      if (!feedback || !feedback.trim()) {
        return res.status(400).json({ error: "\"feedback\" is required for mode=feedback" });
      }
      const result = await callGemini(apiKey, FEEDBACK_SYSTEM, `Feedback notes:\n${feedback}`);
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "\"mode\" must be \"ideas\" or \"feedback\"" });
  } catch (err) {
    console.error("generate.js error:", err);
    return res.status(502).json({ error: "Upstream AI call failed", detail: String(err.message || err) });
  }
}
