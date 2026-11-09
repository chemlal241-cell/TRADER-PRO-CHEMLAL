const crypto = require("crypto");
module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { password } = req.body || {};
  const expected = process.env.APP_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret) return res.status(503).json({ error: "Set APP_PASSWORD and SESSION_SECRET" });
  const a = Buffer.from(String(password || ""));
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: "Invalid password" });
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  res.setHeader("Set-Cookie", `tpc_session=${payload}.${sig}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`);
  return res.status(200).json({ ok: true });
};
