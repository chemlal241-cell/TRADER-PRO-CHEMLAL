// Server-side Investing.com RSS aggregator. No API key required.
const FEEDS = [
  { category: "gold", label: "Commodities", url: "https://www.investing.com/rss/news_11.rss" },
  { category: "forex", label: "Forex", url: "https://www.investing.com/rss/news_1.rss" },
  { category: "macro", label: "Economic", url: "https://www.investing.com/rss/news_14.rss" },
  { category: "macro", label: "Economic indicators", url: "https://www.investing.com/rss/news_95.rss" }
];

function decodeEntities(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function tag(xml, name) {
  const match = xml.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + "\\s*>", "i"));
  return match ? decodeEntities(match[1]).replace(/<[^>]*>/g, "").trim() : "";
}
function severityFor(title, category) {
  const text = String(title || "").toLowerCase();
  // High is reserved for clearly identifiable, market-moving US releases/decisions.
  const high = /\\b(cpi|consumer price index|core pce|pce price index|nonfarm payrolls|non-farm payrolls|nfp|fomc|federal reserve rate decision|fed rate decision|interest rate decision|fed funds rate)\\b/i.test(text);
  if (high) return { severity: "high", severityLabel: "High" };
  const medium = category === "macro" || /\\b(federal reserve|fed |powell|inflation|unemployment|jobless claims|gdp|retail sales|ism|manufacturing|central bank|treasury yields)\\b/i.test(text);
  return medium ? { severity: "medium", severityLabel: "Medium" } : { severity: "low", severityLabel: "Low" };
}
function parseFeed(xml, feed) {
  const entries = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item\s*>/gi) || [];
  return entries.map(entry => {
    const title = tag(entry, "title");
    const rawLink = tag(entry, "link");
    const rawDate = tag(entry, "pubDate") || tag(entry, "dc:date");
    let url = "";
    try {
      const parsed = new URL(rawLink);
      if (parsed.protocol === "https:" && (parsed.hostname === "investing.com" || parsed.hostname.endsWith(".investing.com"))) url = parsed.href;
    } catch (_) {}
    const timestamp = Date.parse(rawDate);
    if (!title || !url) return null;
    const severity = severityFor(title, feed.category);
    return { title, url, category: feed.category, categoryLabel: feed.label,
      published: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "",
      publishedRaw: Number.isFinite(timestamp) ? "" : rawDate,
      severity: severity.severity, severityLabel: severity.severityLabel };
  }).filter(Boolean);
}
module.exports = async function (req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ error: "Method not allowed" }); }
  const results = await Promise.allSettled(FEEDS.map(async feed => {
    const response = await fetch(feed.url, {
      headers: { "User-Agent": "TRADER-PRO-CHEMLAL/1.0 (market news reader)", "Accept": "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(9000)
    });
    if (!response.ok) throw new Error("Investing.com RSS HTTP " + response.status);
    const xml = await response.text();
    if (!xml.includes("<rss") && !xml.includes("<feed")) throw new Error("Unexpected RSS response");
    return parseFeed(xml, feed);
  }));
  const items = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
  const failed = results.filter(result => result.status === "rejected").length;
  const unique = [...new Map(items.map(item => [item.url, item])).values()]
    .sort((a, b) => (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0))
    .slice(0, 24);
  if (!unique.length) return res.status(502).json({ error: "Investing.com news feeds are temporarily unavailable", items: [], partial: true });
  return res.status(200).json({ source: "Investing.com RSS", updatedAt: new Date().toISOString(), partial: failed > 0, items: unique });
};
