# TRADER PRO CHEMLAL — V1 Starter

A multilingual (English, Arabic, French, Spanish) gold-trading signals dashboard starter.

## Included
- Password gate backed by server-side environment variables and signed HttpOnly session cookie.
- Responsive dark/metallic-gold dashboard.
- XAUUSD signal panel that safely remains `WAIT` until real market data and a validated signal engine are connected.
- Position-size calculator.
- Chart image preview (not AI analysis yet).
- Strategy templates and multilingual UI.

## Deploy free-tier
1. Create a GitHub repository and upload these files.
2. Import the repository into Vercel.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `APP_PASSWORD`: your own long unique password.
   - `SESSION_SECRET`: a random secret with at least 32 characters.
4. Redeploy after setting variables.
5. Open the deployed URL and sign in.

## Important status
This is a starter UI, not a finished live trading product. It does **not** fetch live XAUUSD prices, generate validated BUY/SELL signals, fetch news/calendar, or call an AI model yet. Those require a market-data provider and backend signal/AI integrations. The interface intentionally shows WAIT rather than fabricating market data or trade calls.

The calculator is a rough sizing estimate. Verify contract size, tick value, account currency, and broker lot rules. No broker connection or order execution is included. Keep any future provider keys server-side only.

## Next implementation milestones
1. Add a reliable XAUUSD quote/candlestick provider and stale-data checks.
2. Implement deterministic, testable signal rules across timeframes with entry/SL/TP and risk/reward.
3. Add economic calendar/news sources and citations/timestamps.
4. Add server-side AI chart analysis and chat with rate limits.
5. Add backtesting, audit logs, and monitoring before considering any live use.
