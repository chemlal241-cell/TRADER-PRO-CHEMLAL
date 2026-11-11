const crypto = require("crypto");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return res.status(503).json({ error: "Site password is not configured" });

  const supplied = Buffer.from(String(password || ""));
  const configured = Buffer.from(expected);
  if (supplied.length !== configured.length || !crypto.timingSafeEqual(supplied, configured)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  // Derive the session-signing key from the single server-side SITE_PASSWORD.
  const secret = crypto.createHmac("sha256", expected).update("TRADER_PRO_CHEMLAL_SESSION_V1").digest();
  const payload = Buffer.from(JSON.stringify({
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", `tpc_session=${payload}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`);
  return res.status(200).json({ ok: true });
};
