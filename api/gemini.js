// Gemini AI review endpoint. The API key is read only from Vercel environment variables.
const MODEL = "gemini-2.5-flash-lite";
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "Gemini is not configured. Add GEMINI_API_KEY in Vercel." });
  try {
    const snapshot = req.body && req.body.snapshot;
    if (!snapshot || typeof snapshot !== "object") return res.status(400).json({ error: "Missing market snapshot" });
    const serialized = JSON.stringify(snapshot);
    if (serialized.length > 12000) return res.status(413).json({ error: "Snapshot too large" });
    const prompt = [
      "You are a cautious XAUUSD market-analysis assistant. Review only the supplied verified market snapshot.",
      "The deterministic SMC engine is the authority for entry, stop loss and targets. Never invent or change prices or levels.",
      "Never turn WAIT into BUY or SELL. If the SMC candidate is absent, return WAIT.",
      "Return decision BUY, SELL or WAIT. If a candidate exists, only confirm its side when the market context agrees; otherwise WAIT.",
      "Set riskLevel to HIGH, MEDIUM or LOW. Mark HIGH for conflicting timeframes, stale/uncertain inputs, event risk explicitly provided, or unclear structure.",
      "Do not claim certainty, win probability, guaranteed profit, or real-time information beyond the supplied snapshot.",
      "Return concise JSON only with keys: decision, riskLevel, alignment (0-100 integer; confluence score, NOT probability), summary, reasons (array of max 3 short strings).",
      "Market snapshot JSON: " + serialized
    ].join("\n");
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 220 }
      })
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      const message = data && data.error && data.error.message ? data.error.message : "Gemini request failed";
      return res.status(upstream.status === 429 ? 429 : 502).json({ error: message });
    }
    const raw = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    if (!raw) return res.status(502).json({ error: "Gemini returned no analysis" });
    const parsed = JSON.parse(raw);
    const decision = ["BUY", "SELL", "WAIT"].includes(parsed.decision) ? parsed.decision : "WAIT";
    const riskLevel = ["HIGH", "MEDIUM", "LOW"].includes(parsed.riskLevel) ? parsed.riskLevel : "HIGH";
    const alignment = Number.isFinite(Number(parsed.alignment)) ? Math.max(0, Math.min(100, Math.round(Number(parsed.alignment)))) : 0;
    const clean = value => String(value || "").replace(/[<>]/g, "").slice(0, 180);
    return res.status(200).json({
      model: MODEL,
      decision,
      riskLevel,
      alignment,
      summary: clean(parsed.summary),
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3).map(clean) : []
    });
  } catch (error) {
    return res.status(500).json({ error: "Gemini analysis could not be completed" });
  }
};
