// XM MT5 quote bridge. Configure XM_BRIDGE_TOKEN, SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.
const MAX_AGE_SECONDS = 20;
function send(res, status, body) {
  res.status(status).setHeader("Cache-Control", "no-store, max-age=0").json(body);
}
module.exports = async function handler(req, res) {
  const token = process.env.XM_BRIDGE_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !supabaseUrl || !serviceKey) {
    return send(res, 503, { ok: false, error: "XM bridge is not configured" });
  }
  if (req.method === "POST") {
    const supplied = String(req.headers["x-bridge-token"] || "");
    if (supplied.length !== token.length ||
        !require("crypto").timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) {
      return send(res, 401, { ok: false, error: "Unauthorized" });
    }
    const b = req.body || {};
    const symbol = String(b.symbol || "").toUpperCase();
    const bid = Number(b.bid), ask = Number(b.ask), time = Number(b.time);
    if (!/^(XAUUSD|GOLD)[a-zA-Z0-9._-]*$/.test(symbol) ||
        !Number.isFinite(bid) || !Number.isFinite(ask) ||
        bid <= 0 || ask < bid || !Number.isFinite(time) ||
        Math.abs(Date.now() - time) > 60000) {
      return send(res, 400, { ok: false, error: "Invalid quote payload" });
    }
    const row = { id: 1, symbol, bid, ask, price: (bid + ask) / 2,
      broker_time: new Date(time).toISOString(), received_at: new Date().toISOString() };
    const url = supabaseUrl.replace(/\/$/, "") + "/rest/v1/xm_quotes?on_conflict=id";
    const saved = await fetch(url, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: "Bearer " + serviceKey,
        "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(row)
    });
    if (!saved.ok) return send(res, 502, { ok: false, error: "Quote storage failed" });
    return send(res, 200, { ok: true });
  }
  if (req.method === "GET") {
    const url = supabaseUrl.replace(/\/$/, "") +
      "/rest/v1/xm_quotes?select=symbol,bid,ask,price,broker_time,received_at&id=eq.1&limit=1";
    const response = await fetch(url, { headers: { apikey: serviceKey,
      Authorization: "Bearer " + serviceKey } });
    if (!response.ok) return send(res, 502, { ok: false, error: "Quote lookup failed" });
    const rows = await response.json();
    const q = rows[0];
    if (!q) return send(res, 404, { ok: false, error: "No XM quote received yet" });
    const age = (Date.now() - Date.parse(q.received_at)) / 1000;
    if (!Number.isFinite(age) || age < -5 || age > MAX_AGE_SECONDS)
      return send(res, 200, { ok: false, stale: true, age });
    return send(res, 200, { ok: true, ...q, age });
  }
  res.setHeader("Allow", "GET, POST");
  return send(res, 405, { ok: false, error: "Method not allowed" });
};
