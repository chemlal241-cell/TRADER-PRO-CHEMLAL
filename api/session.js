const crypto = require("crypto");
module.exports = (req, res) => {
  const token = (req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith("tpc_session="))?.slice(12);
  if (!token || !process.env.SESSION_SECRET) return res.status(401).json({ authenticated: false });
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return res.status(401).json({ authenticated: false });
  const expected = crypto.createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({ authenticated: false });
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp < Date.now()) return res.status(401).json({ authenticated: false });
    return res.status(200).json({ authenticated: true });
  } catch { return res.status(401).json({ authenticated: false }); }
};
