const crypto = require("crypto");

module.exports = (req, res) => {
  const token = (req.headers.cookie || "")
    .split(";")
    .map(x => x.trim())
    .find(x => x.startsWith("tpc_session="))
    ?.slice(12);

  const password = process.env.SITE_PASSWORD;
  if (!token || !password) return res.status(401).json({ authenticated: false });

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return res.status(401).json({ authenticated: false });

  const secret = crypto.createHmac("sha256", password).update("TRADER_PRO_CHEMLAL_SESSION_V1").digest();
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!Number.isFinite(data.exp) || data.exp < Date.now()) {
      return res.status(401).json({ authenticated: false });
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ authenticated: true });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
};
