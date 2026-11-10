# TRADER PRO CHEMLAL — V1

A multilingual (English, Arabic, French, Spanish) XAU/USD analysis dashboard.

## Included
- Password gate backed by server-side environment variables and signed HttpOnly session cookie.
- Responsive dark/metallic-gold dashboard.
- XAUS spot quote panel with explicit freshness handling.
- Historical XAU/USD OHLC candle loader using XAUS `/api/v1/chart` (5m, 15m, 1h).
- Candle validation (OHLC integrity, minimum history, duplicate removal, last-forming-candle exclusion and stale-data rejection).
- Deterministic EMA 20/50, RSI 14, MACD 12/26/9 and ATR 14 calculations.
- Multi-timeframe directional bias display. The final signal deliberately remains WAIT until an independent out-of-sample backtest and forward validation are implemented and pass.
- Risk Lab, browser-local Trade Journal, manual Risk Checklist and user-entered R-multiple statistics calculator.

## Deploy
1. Import this repository into Vercel.
2. In Vercel → Project → Settings → Environment Variables, set `APP_PASSWORD` and `SESSION_SECRET` (at least 32 random characters).
3. Redeploy after environment changes.

## Candle data source
The candle engine requests:
- `https://xaus.com/api/v1/chart?symbol=xau&range=5d&interval=5m`
- `https://xaus.com/api/v1/chart?symbol=xau&range=1mo&interval=15m`
- `https://xaus.com/api/v1/chart?symbol=xau&range=3mo&interval=1h`

XAUS documents this as a multi-asset OHLCV endpoint backed by a Yahoo Finance proxy. Treat it as a reference XAU/USD series, not the exact quote or execution price of a particular broker. The browser must be able to reach the public endpoint. If any timeframe is missing, invalid or stale, the analysis returns WAIT.

## Important limitations
- The directional bias is a technical summary, not a probability or proven trading edge.
- No automatic BUY/SELL recommendation is enabled yet. A separate walk-forward / out-of-sample backtest, realistic spread/slippage assumptions and forward paper testing are required before enabling actionable signals.
- XAU/USD spot has no single consolidated exchange volume; volume values must not be treated as authoritative market-wide volume.
- No broker connection or order execution is included.
- The chart image analyzer and AI assistant are not connected to an AI model.
- News and economic-calendar feeds are not connected.
- The position-size calculator is an estimate; verify contract size, tick value, account currency and broker lot rules.
- Trade Journal data remains in the current browser and is not synced.

## Next validation milestone
Implement a reproducible candle-based strategy backtest with no look-ahead bias, separated training/validation windows, conservative same-bar stop/target handling, spread/slippage assumptions, and metrics (trade count, win rate, expectancy, profit factor, max drawdown). Only enable BUY/SELL if the out-of-sample test passes explicit minimum criteria; otherwise keep WAIT.


## Advanced strategy matrix
The Live Signals candle engine also calculates rule-based observations from validated closed OHLC candles:
- Market structure: swing HH/HL, LH/LL, BOS and CHoCH candidates.
- Smart Money Concepts: potential order blocks, three-candle fair-value gaps, equal highs/lows, liquidity sweeps, premium/discount and Fibonacci retracement zones.
- Indicators: EMA 9/21/50/200, RSI, MACD, ATR, ADX, SuperTrend approximation, Ichimoku levels, Stochastic and Bollinger Bands.
- Context: candlestick pattern candidates, RSI divergence candidates, London/New York session clock, and VWAP only when usable volume is present.
- Candidate Entry/SL/TP levels are informational only and remain gated by confluence. No BUY/SELL signal is enabled until independent out-of-sample backtesting and forward paper validation pass.
- DXY and live economic news are not connected; users must independently verify CPI, NFP and FOMC risk. Chart patterns such as triangles, wedges, flags and head-and-shoulders still require visual confirmation.
