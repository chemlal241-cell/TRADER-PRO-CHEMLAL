(()=> {
const css=document.createElement("style");
css.textContent=".module-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.module-card{background:linear-gradient(160deg,#151a23,#10141b);border:1px solid #29313e;border-radius:17px;padding:18px}.module-card h2{font-size:15px;margin:0 0 15px;color:#f1d18a}.module-card input,.module-card select,.module-card textarea{width:100%;margin:5px 0 12px;border:1px solid #29313e;background:#171d27;color:#fff;border-radius:10px;padding:10px}.module-card label{display:block;color:#93a0b2;font-size:12px}.module-card button{border:0;border-radius:10px;padding:10px 14px;background:linear-gradient(135deg,#f0d18e,#b98731);color:#17120a;font-weight:800}.module-result{margin-top:12px;padding:13px;border:1px solid #69552d;border-radius:12px;color:#f1d18a;background:#201b11}.module-table{width:100%;border-collapse:collapse;font-size:13px}.module-table td,.module-table th{padding:8px;border-bottom:1px solid #29313e;text-align:left}.module-muted{font-size:12px;color:#93a0b2;line-height:1.6}@media(max-width:850px){.module-grid{grid-template-columns:1fr}};#topGoldPrice,#xausPrice,#aiLivePrice{transition:color .18s ease,opacity .18s ease;font-variant-numeric:tabular-nums}";
document.head.append(css);
const nav=document.querySelector(".tabs"),defs=[["risklab","🛡 Risk Lab"],["journal","📓 Trade Journal"],["backtest","📈 Backtest Lab"]];
defs.forEach(([id,label])=>{const b=document.createElement("button");b.className="tab";b.dataset.tab=id;b.textContent=label;nav.append(b)});
const make=(id,html)=>{const s=document.createElement("section");s.id=id;s.className="module-grid hidden";s.innerHTML=html;document.querySelector("#app").append(s)};
make("risklab",'<article class="module-card"><h2>Risk / Reward Calculator</h2><label>Direction</label><select id="rrSide"><option value="buy">BUY / Long</option><option value="sell">SELL / Short</option></select><label>Entry price</label><input id="rrEntry" type="number" step="any"><label>Stop loss price</label><input id="rrStop" type="number" step="any"><label>Take profit price</label><input id="rrTarget" type="number" step="any"><button id="rrCalc">Calculate R:R</button><div id="rrOut" class="module-result">Enter prices to calculate.</div><p class="module-muted">Price-distance calculation only; broker costs and contract rules are not verified.</p></article><article class="module-card"><h2>Risk Checklist</h2><div id="riskChecks"></div><div id="riskCheckOut" class="module-result">0 of 5 checks completed.</div></article>');
make("journal",'<article class="module-card"><h2>Trade Journal</h2><label>Symbol</label><input id="jSymbol" value="XAUUSD"><label>Side</label><select id="jSide"><option>BUY</option><option>SELL</option><option>WAIT</option></select><label>Entry</label><input id="jEntry" type="number" step="any"><label>Exit</label><input id="jExit" type="number" step="any"><label>Result (R multiple)</label><input id="jR" type="number" step="any"><label>Notes</label><textarea id="jNotes" rows="3"></textarea><button id="jAdd">Save journal entry</button><div id="jMsg" class="module-result">Stored only in this browser.</div></article><article class="module-card"><h2>Saved Trades</h2><div id="jList"></div><button id="jExport" style="margin-top:12px">Export CSV</button><button id="jClear" style="margin:12px 0 0 8px;background:#6c3333;color:white">Clear journal</button><p class="module-muted">Entries stay on this device and are not synced.</p></article>');
make("backtest",'<article class="module-card"><h2>Backtest Results Calculator</h2><label>Enter historical trade outcomes in R units, separated by commas (e.g. 1.5, -1, 2, -1)</label><textarea id="btValues" rows="5" placeholder="1.5, -1, 2, -1, 0.5"></textarea><button id="btCalc">Calculate statistics</button><div id="btOut" class="module-result">No results calculated.</div><p class="module-muted">This only analyzes results you provide. It does not fetch historical XAUUSD candles.</p></article><article class="module-card"><h2>Statistics guide</h2><div class="module-muted"><p><b>Win rate:</b> percentage of positive-R trades.</p><p><b>Expectancy:</b> average R per trade.</p><p><b>Profit factor:</b> winning R divided by absolute losing R.</p><p><b>Max drawdown:</b> largest peak-to-trough decline in cumulative R.</p></div><div class="module-result">Use representative samples and account for fees and slippage.</div></article>');
const ids=["overview","tools","analysis","strategy","risklab","journal","backtest","news"];
function activate(id){ids.forEach(x=>document.getElementById(x)?.classList.toggle("hidden",x!==id));document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===id))}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>activate(b.dataset.tab)));
document.querySelector("#rrCalc").onclick=()=>{const e=Number(document.querySelector("#rrEntry").value),s=Number(document.querySelector("#rrStop").value),t=Number(document.querySelector("#rrTarget").value),side=document.querySelector("#rrSide").value,risk=side==="buy"?e-s:s-e,reward=side==="buy"?t-e:e-t,out=document.querySelector("#rrOut");if(![e,s,t].every(Number.isFinite)||risk<=0||reward<=0){out.textContent="Invalid setup: stop and target must be on the correct sides of entry.";return}out.textContent="Risk distance: "+risk.toFixed(4)+" | Reward distance: "+reward.toFixed(4)+" | Risk:Reward = 1:"+(reward/risk).toFixed(2)};
const checks=["Setup and entry trigger are written down","Stop loss is defined before entry","Risk is within my personal limit","Major event risk was checked","Position size and broker contract value were verified"],checksEl=document.querySelector("#riskChecks");
checks.forEach((s,i)=>{const l=document.createElement("label"),c=document.createElement("input");c.type="checkbox";c.style.width="auto";c.addEventListener("change",()=>{const n=checksEl.querySelectorAll("input:checked").length;document.querySelector("#riskCheckOut").textContent=n+" of 5 checks completed."});l.append(c,document.createTextNode(" "+s));checksEl.append(l)});
const key="tpc_trade_journal_v1",get=()=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return []}},save=a=>localStorage.setItem(key,JSON.stringify(a));
function render(){const root=document.querySelector("#jList"),a=get();root.innerHTML="";if(!a.length){root.textContent="No saved trades yet.";return}const table=document.createElement("table");table.className="module-table";table.innerHTML="<thead><tr><th>Date</th><th>Symbol</th><th>Side</th><th>R</th></tr></thead>";const body=document.createElement("tbody");a.slice().reverse().forEach(x=>{const tr=document.createElement("tr");[x.date,x.symbol,x.side,x.r].forEach(v=>{const td=document.createElement("td");td.textContent=String(v);tr.append(td)});body.append(tr)});table.append(body);root.append(table)}
document.querySelector("#jAdd").onclick=()=>{const symbol=document.querySelector("#jSymbol").value.trim(),r=Number(document.querySelector("#jR").value);if(!symbol||!Number.isFinite(r)){document.querySelector("#jMsg").textContent="Enter a symbol and valid R result.";return}const a=get();a.push({date:new Date().toISOString().slice(0,10),symbol,side:document.querySelector("#jSide").value,entry:document.querySelector("#jEntry").value,exit:document.querySelector("#jExit").value,r,notes:document.querySelector("#jNotes").value});save(a);document.querySelector("#jMsg").textContent="Entry saved on this device.";render()};
document.querySelector("#jClear").onclick=()=>{if(confirm("Delete all locally saved journal entries?")){save([]);render()}};
document.querySelector("#jExport").onclick=()=>{const a=get();if(!a.length)return;const cols=["date","symbol","side","entry","exit","r","notes"],esc=v=>'"'+String(v??"").replace(/"/g,'""')+'"',csv=[cols.join(","),...a.map(x=>cols.map(k=>esc(x[k])).join(","))].join("\n"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv"})),link=document.createElement("a");link.href=url;link.download="trader-pro-journal.csv";link.click();URL.revokeObjectURL(url)};
document.querySelector("#btCalc").onclick=()=>{const vals=document.querySelector("#btValues").value.split(/[,\s;]+/).filter(Boolean).map(Number),out=document.querySelector("#btOut");if(!vals.length||vals.some(x=>!Number.isFinite(x))){out.textContent="Enter valid numeric R results separated by commas.";return}let equity=0,peak=0,dd=0,wins=0,gw=0,gl=0;vals.forEach(x=>{equity+=x;peak=Math.max(peak,equity);dd=Math.max(dd,peak-equity);if(x>0){wins++;gw+=x}else if(x<0)gl+=Math.abs(x)});out.textContent="Trades: "+vals.length+" | Win rate: "+(wins/vals.length*100).toFixed(1)+"% | Net: "+equity.toFixed(2)+"R | Expectancy: "+(equity/vals.length).toFixed(2)+"R/trade | Profit factor: "+(gl?(gw/gl).toFixed(2):"∞ (no losses)")+" | Max drawdown: "+dd.toFixed(2)+"R"};

/* XAUS real XAU/USD spot feed — indicative mid-market, not broker execution price */
(function(){
 const overview=document.querySelector("#overview");
 if(!overview)return;
 const card=document.createElement("article");
 card.className="module-card wide";
 card.style.marginBottom="16px";
 card.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><h2 style="margin:0">XAU/USD · REFERENCE CHART</h2><span id="xmChartBadge" style="color:#e5a84b;font-weight:700">● INDEPENDENT CHART</span></div><div id="xmChartWrap" style="margin:12px 0;border:1px solid #303640;border-radius:12px;overflow:hidden;background:#0b1117;position:relative"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 14px;border-bottom:1px solid #27313d"><strong id="xmChartPrice" style="font-size:20px;color:#f1d18a">—</strong><span id="xmChartState" style="font-size:12px;color:#e5a84b">REFERENCE DATA</span></div><canvas id="xmLiveChart" aria-label="XAUUSD historical reference candlestick chart" style="display:block;width:100%;height:420px"></canvas><div id="xmChartFoot" style="padding:8px 14px;border-top:1px solid #27313d;color:#9aa8b8;font-size:11px">Loading independent 5-minute reference candles…</div></div><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><strong style="color:#f1d18a">XAUS reference quote for signal engine</strong><span id="xausState" class="module-muted">Connecting…</span></div><div style="display:flex;gap:18px;align-items:baseline;flex-wrap:wrap;margin:8px 0"><strong id="xausPrice" style="font-size:clamp(24px,4vw,34px);color:#f1d18a">—</strong><span id="xausUnit" class="module-muted">USD / troy ounce</span></div><div class="module-muted" id="xausMeta">Waiting for reference quote…</div><p class="module-muted" style="margin-bottom:0">The chart is independent from the live price panels. Gold prices above continue updating separately.</p>';
 overview.insertBefore(card,overview.firstChild);
 const $=id=>card.querySelector("#"+id);
 const fmt=n=>Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
 function stateLabel(status,age){const lang=document.querySelector("#lang")?.value||"en";const words={en:{fresh:"LIVE · FRESH",stale:"STALE · LAST REAL QUOTE",unavailable:"UNAVAILABLE · NO PRICE"},ar:{fresh:"مباشر · حديث",stale:"قديم · آخر سعر حقيقي",unavailable:"غير متاح · لا يوجد سعر"},fr:{fresh:"DIRECT · À JOUR",stale:"ANCIEN · DERNIER COURS RÉEL",unavailable:"INDISPONIBLE"},es:{fresh:"EN VIVO · ACTUALIZADO",stale:"ANTIGUO · ÚLTIMO PRECIO REAL",unavailable:"NO DISPONIBLE"}};return (words[lang]||words.en)[status]||status.toUpperCase()}
 async function loadSpot(){
  try{
   try{
    const xr=await fetch("/api/xm-quote",{cache:"no-store"}),xq=await xr.json();
    if(xr.ok&&xq.ok&&Number.isFinite(Number(xq.price))&&Number(xq.age)<=20){
     const p="$"+fmt(xq.price),topPrice=document.querySelector("#topGoldPrice"),topState=document.querySelector("#topGoldState");
     $("xausPrice").textContent=p;if(topPrice)topPrice.textContent=p;if(topState)topState.textContent="● LIVE · XM MT5";
     $("xausState").textContent="XM MT5 · LIVE";$("xausState").style.color="#35c98a";
     $("xausMeta").textContent="XM "+xq.symbol+" · Bid "+fmt(xq.bid)+" · Ask "+fmt(xq.ask)+" · received "+Math.round(xq.age)+"s ago";
     return;
    }
   }catch(_){}
   const res=await fetch("https://xaus.com/api/v1/spot?compact=1",{cache:"no-store"});
   const data=await res.json();
   const generated=Date.parse(data.price_as_of||data.data_state?.as_of||data.updated_at||"");
   const age=Number.isFinite(generated)?Math.max(0,(Date.now()-generated)/1000):Infinity;
   const status=data?.data_state?.status;
   const fresh=status==="fresh"&&age<=180&&Number.isFinite(Number(data.spot_usd_oz));
   const stale=status==="stale"&&Number.isFinite(Number(data.spot_usd_oz))&&age<=300;
   if(!res.ok||(!fresh&&!stale)){
    $("xausPrice").textContent="—";
    const topPrice=document.querySelector("#topGoldPrice"),topState=document.querySelector("#topGoldState");if(topPrice)topPrice.textContent="—";if(topState)topState.textContent="● NO VERIFIED PRICE";
    $("xausState").textContent=stateLabel("unavailable");
    $("xausMeta").textContent="No verified recent quote. Trading signal: WAIT.";
    return;
   }
   $("xausPrice").textContent="$"+fmt(data.spot_usd_oz);
   const topPrice=document.querySelector("#topGoldPrice"),topState=document.querySelector("#topGoldState");if(topPrice)topPrice.textContent="$"+fmt(data.spot_usd_oz);if(topState)topState.textContent=fresh?"● LIVE · VERIFIED":"● STALE · WAIT";
   $("xausState").textContent=stateLabel(fresh?"fresh":"stale");
   $("xausState").style.color=fresh?"#35c98a":"#f1d18a";
   const asOf=data.price_as_of||data.data_state?.as_of||data.updated_at;
   $("xausMeta").textContent="Price time: "+new Date(asOf).toLocaleString()+" UTC · API age: "+Math.round(age)+"s · "+(data.price_source||"xaus.com")+(fresh?"":" · Signal: WAIT");
  }catch(e){
   $("xausPrice").textContent="—";const topPrice=document.querySelector("#topGoldPrice"),topState=document.querySelector("#topGoldState");if(topPrice)topPrice.textContent="—";if(topState)topState.textContent="● FEED UNAVAILABLE";$("xausState").textContent=stateLabel("unavailable");$("xausMeta").textContent="XAUS connection failed. No price displayed; signal remains WAIT.";
  }
 }
 loadSpot(); // The main live quote loop below updates this panel; avoid a second polling loop.
 document.querySelector("#lang")?.addEventListener("change",()=>{loadSpot()});
})(); 

/* SMC Workbench — primary methodology; RSI/MACD/EMA are confirmation factors only */
(function(){
 const root=document.querySelector("#strategy");if(!root)return;
 const card=document.createElement("article");card.className="card wide";
 card.innerHTML='<h2>SMC Workbench · XAU/USD</h2><p class="notice">Primary method: Smart Money Concepts. RSI, MACD and EMA are secondary confirmations, never standalone strategies.</p><div class="module-grid" style="margin-top:12px">'+
 '<div class="module-card"><h2>SMC setup</h2>'+
 '<label>Market structure</label><select id="smcStructure"><option value="0">Not confirmed</option><option value="1">Bullish BOS / CHoCH</option><option value="-1">Bearish BOS / CHoCH</option></select>'+
 '<label>Liquidity event</label><select id="smcLiquidity"><option value="0">Not confirmed</option><option value="1">Sell-side sweep + reclaim</option><option value="-1">Buy-side sweep + rejection</option></select>'+
 '<label>Institutional zone</label><select id="smcZone"><option value="0">Not confirmed</option><option value="1">Bullish OB / demand / FVG</option><option value="-1">Bearish OB / supply / FVG</option></select>'+
 '<label>Premium / Discount</label><select id="smcValue"><option value="0">Not checked</option><option value="1">Discount for long</option><option value="-1">Premium for short</option></select>'+
 '<label>Closed-candle entry trigger</label><select id="smcTrigger"><option value="0">Not confirmed</option><option value="1">Bullish rejection / reclaim</option><option value="-1">Bearish rejection / reclaim</option></select></div>'+
 '<div class="module-card"><h2>Secondary confirmations</h2>'+
 '<label>EMA alignment</label><select id="smcEma"><option value="0">Not checked</option><option value="1">Bullish EMA alignment</option><option value="-1">Bearish EMA alignment</option></select>'+
 '<label>RSI confirmation</label><select id="smcRsi"><option value="0">Not checked</option><option value="1">Bullish momentum</option><option value="-1">Bearish momentum</option></select>'+
 '<label>MACD confirmation</label><select id="smcMacd"><option value="0">Not checked</option><option value="1">Bullish momentum</option><option value="-1">Bearish momentum</option></select>'+
 '<div id="smcManualResult" class="module-result">Manual checklist only; it does not create a live order.</div><button id="smcManualCalc" style="margin-top:10px">Evaluate SMC checklist</button>'+
 '<p class="module-muted">Use 85% as confluence, not win probability. A live signal still requires fresh validated OHLC, a valid price, structure and risk checks.</p></div></div>';
 root.append(card);
 card.querySelector("#smcManualCalc").addEventListener("click",()=>{
  const ids=["smcStructure","smcLiquidity","smcZone","smcValue","smcTrigger"],confirm=["smcEma","smcRsi","smcMacd"];
  const vals=ids.map(id=>Number(card.querySelector("#"+id).value)),cv=confirm.map(id=>Number(card.querySelector("#"+id).value));
  const long=vals.filter(x=>x===1).length+cv.filter(x=>x===1).length,short=vals.filter(x=>x===-1).length+cv.filter(x=>x===-1).length,total=8,score=Math.max(long,short),pct=score/total*100;
  const structure=Number(card.querySelector("#smcStructure").value),trigger=Number(card.querySelector("#smcTrigger").value);
  const valid=score>=Math.ceil(total*.85)&&Math.abs(long-short)>=3&&((long>short&&structure===1&&trigger===1)||(short>long&&structure===-1&&trigger===-1));
  card.querySelector("#smcManualResult").textContent=(valid?(long>short?"SMC BUY SETUP CANDIDATE":"SMC SELL SETUP CANDIDATE"):"WAIT")+" · confluence "+score+"/"+total+" ("+pct.toFixed(1)+"%) · RSI/MACD/EMA confirmations included · not a live price signal.";
 });
})(); 

/* Historical OHLC engine: real candles + deterministic indicators; stays WAIT until validated */
(function(){
 const root=document.querySelector("#overview");
 if(!root)return;
 const panel=document.createElement("article");
 panel.className="module-card wide";
 panel.style.marginTop="16px";
 panel.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><h2 style="margin:0">XAU/USD · Live Signal Engine</h2><span id="candleStatus" class="module-muted">NOT CHECKED</span></div>'+
 '<p class="module-muted">XAUS OHLC candles · 5m / 15m / 1h · EMA 20/50, RSI 14, MACD 12/26/9, ATR 14. A directional bias is analysis only, not a trade signal.</p>'+
 '<div class="module-grid" style="margin-top:12px">'+
 '<div class="module-card"><h2>Multi-timeframe analysis</h2><div id="candleRows" class="module-muted">Press refresh to load real candle data.</div><button id="candleRefresh" style="margin-top:12px">Load / refresh candles</button><p id="candleMeta" class="module-muted">Source: XAUS chart API · Yahoo Finance proxy · XAUUSD reference series.</p></div>'+
 '<div class="module-card"><h2>Signal gate</h2><div id="candleBias" class="module-result">WAIT · candle data not checked</div><div id="candleReason" class="module-muted" style="margin-top:10px">No BUY/SELL signal is enabled until a separate out-of-sample backtest passes.</div><div id="candleQuality" class="module-muted" style="margin-top:10px"></div></div></div>';
 root.append(panel);
 const candleHistoryCard=panel.querySelector("#candleRows")?.closest(".module-card");
 if(candleHistoryCard)candleHistoryCard.style.display="none";
 const candleQuality=panel.querySelector("#candleQuality");if(candleQuality)candleQuality.style.display="none";
 const $=id=>panel.querySelector("#"+id);
 panel.innerHTML+='<div class="module-card" style="margin-top:14px"><h2>AI SIGNALS · Multi-Strategy Confluence Engine</h2><p class="module-muted">AI SIGNALS combines weighted SMC (70%) with coded technical confirmations (30%): structure, BOS/CHoCH, liquidity, OB, FVG, premium/discount, EMA, RSI, MACD, ADX, Stochastic, Bollinger, Ichimoku, SuperTrend, VWAP, divergence, candle patterns and Fibonacci/OTE. DXY, scheduled macro events and visual chart patterns remain external/manual checks until a verified source or detector is connected.</p><div id="advancedStatus" class="module-result">WAIT · awaiting verified candles</div><div id="advancedRows" class="module-muted" style="margin-top:10px">Advanced analysis will appear after candle validation.</div><div id="advancedPlan" class="module-result" style="margin-top:12px">Entry / SL / TP: WAIT until enough independent confluences are present and the strategy passes out-of-sample validation.</div><p class="module-muted" style="margin-top:10px">DXY, official BLS/Federal Reserve event calendar, COMEX futures volume/VWAP proxy and Gemini review are required for a live AI-reviewed candidate. Missing/stale macro data, missing volume or active event risk forces WAIT.</p></div>';
 let activeSignalPlan=null,latestSpotQuote=null,latestConfluence=0,previousValidSpotPrice=null;
 function renderSignalStrength(){
  const card=root.querySelector(".ai-signal-card");if(!card)return;
  const plan=activeSignalPlan;
  const base=plan&&plan.total>0?Math.max(0,Math.min(100,plan.score/plan.total*100)):latestConfluence;
  const quoteAge=latestSpotQuote&&Number.isFinite(latestSpotQuote.asOf)?Math.max(0,(Date.now()-latestSpotQuote.asOf)/1000):Infinity;
  const freshness=latestSpotQuote&&latestSpotQuote.ok?Math.max(0,100-Math.min(100,quoteAge/1.8)):0;
  const priceFit=plan&&latestSpotQuote&&latestSpotQuote.ok&&Number.isFinite(plan.atr)&&plan.atr>0?Math.max(0,100-Math.abs(latestSpotQuote.price-plan.entry)/plan.atr*100):0;
  const score=Math.round(Math.max(0,Math.min(100,base*.70+freshness*.20+priceFit*.10)));
  const value=card.querySelector("#aiConfidenceValue"),bar=card.querySelector("#aiConfidenceBar"),label=card.querySelector("#aiConfidenceLabel");
  if(value)value.textContent=score+"%";
  if(bar){bar.style.width=score+"%";bar.dataset.strength=score<40?"low":score<70?"medium":"high";}
  if(label)label.textContent="Strategy confluence · "+(score<40?"WEAK":score<70?"MODERATE":"STRONG")+" · not win probability";
 }
 function updateLivePanel(signal,description,biasLabel,plan){
  activeSignalPlan=plan||null;
  const card=root.querySelector(".ai-signal-card");
  if(card){
   const side=plan?plan.side:(String(signal).includes("SELL")?"SELL":String(signal).includes("BUY")?"BUY":"WAIT");
   card.classList.toggle("is-buy",side==="BUY");card.classList.toggle("is-sell",side==="SELL");
   const set=(id,value)=>{const el=card.querySelector("#"+id);if(el)el.textContent=value};
   set("aiSignalSide",side==="BUY"?(plan&&plan.score/plan.total>=.75?"📈 STRONG BUY":"📈 BUY"):side==="SELL"?(plan&&plan.score/plan.total>=.75?"📉 STRONG SELL":"📉 SELL"):"WAIT");
   set("aiSignalLive",String(signal).includes("UNAVAILABLE")?"● DATA UNAVAILABLE":"● DATA CHECKED");
   set("aiSignalDescription",description||"Waiting for a confirmed setup.");
   const values=plan?[plan.entry,plan.sl,plan.tp1,plan.tp2,plan.tp3]:[null,null,null,null,null];
   ["aiEntry","aiStop","aiTp1","aiTp2","aiTp3"].forEach((id,i)=>set(id,Number.isFinite(values[i])?"$"+fmt(values[i]):"—"));
   const pct=plan&&Number.isFinite(plan.score)&&Number.isFinite(plan.total)&&plan.total>0?Math.max(0,Math.min(100,plan.score/plan.total*100)):0;
   set("aiConfidenceValue",plan?pct.toFixed(1)+"%":"—");
   set("aiConfidenceLabel",plan?"Multi-strategy confluence · not win probability":"No confirmed entry · WAIT");
   const bar=card.querySelector("#aiConfidenceBar");if(bar)bar.style.width=pct+"%";
    renderSignalStrength();
  }
  const context=root.querySelectorAll(".card")[1];
  if(context){
   const rows=context.querySelectorAll(".list b");
   if(rows[0])rows[0].textContent=biasLabel||"—";
   if(rows[3])rows[3].textContent=plan?(plan.score+"/"+plan.total+" · "+(plan.score/plan.total*100).toFixed(1)+"% confluence · paper only"):"WAIT · no qualifying setup";
  }
 }
 async function getFreshSpot(){
  try{
   let quote=null;
   try{
    const xmResponse=await fetch("/api/xm-quote",{cache:"no-store"});
    const xm=await xmResponse.json();
    if(xmResponse.ok&&xm.ok&&Number.isFinite(Number(xm.price))&&Number(xm.age)<=20){
     quote={ok:true,price:Number(xm.price),bid:Number(xm.bid),ask:Number(xm.ask),age:Number(xm.age),asOf:Date.parse(xm.received_at),source:"XM MT5"};
    }
   }catch(_){}
   if(!quote){
    const response=await fetch("https://xaus.com/api/v1/spot?compact=1",{cache:"no-store"});
    const data=await response.json();
    const stamp=Date.parse(data.price_as_of||data.data_state?.as_of||data.updated_at||"");
    const age=Number.isFinite(stamp)?Math.max(0,(Date.now()-stamp)/1000):Infinity;
    const ok=response.ok&&data.data_state?.status==="fresh"&&age<=180&&Number.isFinite(Number(data.spot_usd_oz));
    quote={ok,price:Number(data.spot_usd_oz),age,asOf:stamp,source:"XAUS"};
   }
   latestSpotQuote=quote;
   // Keep every visible gold price synchronized to this single quote response.
   const panelPrice=quote.ok?"$"+Number(quote.price).toFixed(2):"—";
   const topPrice=document.querySelector("#topGoldPrice"),topState=document.querySelector("#topGoldState");
   const panelSpot=document.querySelector("#xausPrice"),panelState=document.querySelector("#xausState"),panelMeta=document.querySelector("#xausMeta");
   if(topPrice)topPrice.textContent=panelPrice;
   if(topState)topState.textContent=quote.ok?"● LIVE · "+(quote.source||"MARKET DATA"):"● NO FRESH PRICE";
   if(panelSpot)panelSpot.textContent=panelPrice;
   if(panelState){panelState.textContent=quote.ok?(quote.source||"LIVE")+" · LIVE":"UNAVAILABLE";panelState.style.color=quote.ok?"#35c98a":"#e59b45";}
   if(panelMeta)panelMeta.textContent=quote.ok?(quote.source||"Market")+" · "+(quote.symbol||"XAUUSD")+(quote.bid?" · Bid "+Number(quote.bid).toFixed(2)+" · Ask "+Number(quote.ask).toFixed(2):"")+" · "+Math.round(quote.age||0)+"s ago":"No fresh quote · WAIT";
   const priceEl=root.querySelector("#aiLivePrice"),ageEl=root.querySelector("#aiPriceAge"),moveEl=root.querySelector("#aiPriceMove");
   if(priceEl)priceEl.textContent=quote.ok?"$"+quote.price.toFixed(2):"Unavailable";
   if(ageEl)ageEl.textContent=quote.ok?quote.source+" · "+Math.round(quote.age)+"s"+(quote.bid?" · Bid "+quote.bid.toFixed(2)+" / Ask "+quote.ask.toFixed(2):""):"No fresh source quote";
   if(moveEl){if(!quote.ok){moveEl.textContent="● FEED STALE";moveEl.dataset.move="stale";}else if(previousValidSpotPrice===null){moveEl.textContent="● TRACKING";moveEl.dataset.move="flat";}else{const delta=quote.price-previousValidSpotPrice,pct=previousValidSpotPrice?delta/previousValidSpotPrice*100:0;moveEl.textContent=(delta>0?"▲ +":delta<0?"▼ ":"• ")+(delta===0?"0.00":delta.toFixed(2))+" ("+(delta>0?"+":"")+pct.toFixed(3)+"%)";moveEl.dataset.move=delta>0?"up":delta<0?"down":"flat";}if(quote.ok)previousValidSpotPrice=quote.price;}
   renderSignalStrength();
   return quote;
  }catch(_){return {ok:false}}
 }
 const intervals=[{name:"5m",range:"5d",minutes:5},{name:"15m",range:"1mo",minutes:15},{name:"1h",range:"3mo",minutes:60}];
 let refreshTimer=null,loading=false;
 const finite=n=>Number.isFinite(n);
 function normalize(raw){
  const rows=Array.isArray(raw)?raw:(raw?.points||raw?.candles||raw?.data||[]);
  return rows.map(x=>{
   const rawTime=x.t??x.time??x.timestamp??"",numericTime=Number(rawTime);
   const t=finite(numericTime)?(numericTime<1e12?numericTime*1000:numericTime):Date.parse(rawTime);
   return {t,o:Number(x.o??x.open),h:Number(x.h??x.high),l:Number(x.l??x.low),c:Number(x.c??x.close),v:Number(x.v??x.volume??0)};
  }).filter(x=>finite(x.t)&&[x.o,x.h,x.l,x.c].every(finite)&&x.o>0&&x.c>0&&x.h>=Math.max(x.o,x.c,x.l)&&x.l<=Math.min(x.o,x.c,x.h))
   .sort((a,b)=>a.t-b.t).filter((x,i,a)=>i===0||x.t!==a[i-1].t);
 }
 function ema(values,period){
  if(values.length<period)return null;
  const k=2/(period+1);let v=values.slice(0,period).reduce((a,b)=>a+b,0)/period;
  for(let i=period;i<values.length;i++)v=values[i]*k+v*(1-k);
  return v;
 }
 function rsi(values,period=14){
  if(values.length<=period)return null;
  let gain=0,loss=0;
  for(let i=1;i<=period;i++){const d=values[i]-values[i-1];gain+=Math.max(0,d);loss+=Math.max(0,-d)}
  let ag=gain/period,al=loss/period;
  for(let i=period+1;i<values.length;i++){const d=values[i]-values[i-1];ag=(ag*(period-1)+Math.max(0,d))/period;al=(al*(period-1)+Math.max(0,-d))/period}
  return al===0?100:100-100/(1+ag/al);
 }
 function atr(rows,period=14){
  if(rows.length<=period)return null;
  const tr=[];
  for(let i=1;i<rows.length;i++){const p=rows[i-1].c,x=rows[i];tr.push(Math.max(x.h-x.l,Math.abs(x.h-p),Math.abs(x.l-p)))}
  let v=tr.slice(0,period).reduce((a,b)=>a+b,0)/period;
  for(let i=period;i<tr.length;i++)v=(v*(period-1)+tr[i])/period;
  return v;
 }
 function macd(values){
  if(values.length<40)return null;
  const k12=2/13,k26=2/27;let e12=values[0],e26=values[0];const line=[];
  for(let i=1;i<values.length;i++){e12=values[i]*k12+e12*(1-k12);e26=values[i]*k26+e26*(1-k26);line.push(e12-e26)}
  const signal=ema(line,9),last=line[line.length-1];
  return {line:last,signal,hist:last-signal};
 }
 const fmt=n=>finite(n)?n.toFixed(2):"—";
 function pivots(rows,left=2,right=2){
  const highs=[],lows=[];
  for(let i=left;i<rows.length-right;i++){
   let hi=true,lo=true;
   for(let j=i-left;j<=i+right;j++){if(j===i)continue;if(rows[j].h>=rows[i].h)hi=false;if(rows[j].l<=rows[i].l)lo=false}
   if(hi)highs.push({i,p:rows[i].h,t:rows[i].t});
   if(lo)lows.push({i,p:rows[i].l,t:rows[i].t});
  }
  return {highs,lows};
 }
 function adx(rows,n=14){
  if(rows.length<n*2+1)return null;
  const tr=[],plus=[],minus=[];
  for(let i=1;i<rows.length;i++){
   const a=rows[i],p=rows[i-1],up=a.h-p.h,dn=p.l-a.l;
   tr.push(Math.max(a.h-a.l,Math.abs(a.h-p.c),Math.abs(a.l-p.c)));
   plus.push(up>dn&&up>0?up:0);minus.push(dn>up&&dn>0?dn:0);
  }
  let smTR=tr.slice(0,n).reduce((a,b)=>a+b,0),sp=plus.slice(0,n).reduce((a,b)=>a+b,0),sm=minus.slice(0,n).reduce((a,b)=>a+b,0),dx=[];
  for(let i=n;i<tr.length;i++){
   if(i>n){smTR=smTR-smTR/n+tr[i];sp=sp-sp/n+plus[i];sm=sm-sm/n+minus[i]}
   const pdi=smTR?100*sp/smTR:0,mdi=smTR?100*sm/smTR:0;
   dx.push(pdi+mdi?100*Math.abs(pdi-mdi)/(pdi+mdi):0);
  }
  return dx.length>=n?dx.slice(-n).reduce((a,b)=>a+b,0)/n:null;
 }
 function stochastic(rows,n=14){
  if(rows.length<n)return null;const a=rows.slice(-n),hi=Math.max(...a.map(x=>x.h)),lo=Math.min(...a.map(x=>x.l)),c=a[a.length-1].c;
  return hi===lo?50:100*(c-lo)/(hi-lo);
 }
 function bollinger(values,n=20){
  if(values.length<n)return null;const a=values.slice(-n),m=a.reduce((x,y)=>x+y,0)/n,v=a.reduce((x,y)=>x+(y-m)**2,0)/n,d=Math.sqrt(v);
  return {mid:m,upper:m+2*d,lower:m-2*d};
 }
 function ichimoku(rows){
  if(rows.length<52)return null;
  const mid=n=>{const a=rows.slice(-n),h=Math.max(...a.map(x=>x.h)),l=Math.min(...a.map(x=>x.l));return (h+l)/2};
  return {tenkan:mid(9),kijun:mid(26),spanA:(mid(9)+mid(26))/2,spanB:mid(52)};
 }
 function supertrend(rows,n=10,mult=3){
  if(rows.length<n+2)return null;
  const a=atr(rows,n);if(!a)return null;const x=rows[rows.length-1],mid=(x.h+x.l)/2,upper=mid+mult*a,lower=mid-mult*a;
  return {direction:x.c>upper?"BULLISH":x.c<lower?"BEARISH":"NEUTRAL",upper,lower,atr:a};
 }
 function candlePattern(rows){
  if(rows.length<3)return "غير واضح";
  const a=rows[rows.length-1],p=rows[rows.length-2],body=Math.abs(a.c-a.o),range=a.h-a.l||1,upper=a.h-Math.max(a.o,a.c),lower=Math.min(a.o,a.c)-a.l;
  if(a.c>p.o&&a.o<p.c&&a.c>a.o&&p.c<p.o)return "Bullish Engulfing";
  if(a.c<p.o&&a.o>p.c&&a.c<a.o&&p.c>p.o)return "Bearish Engulfing";
  if(body/range<.1)return "Doji";
  if(lower>body*2&&upper<body)return "Hammer / bullish pin";
  if(upper>body*2&&lower<body)return "Shooting Star / bearish pin";
  if(rows.length>=3){
   const x=rows.slice(-3),b=x.map(z=>Math.abs(z.c-z.o)),r=x.map(z=>z.h-z.l||1);
   if(x.every(z=>z.c>z.o)&&x[1].c>x[0].c&&x[2].c>x[1].c&&b.every((v,i)=>v/r[i]>.5))return "Three White Soldiers";
   if(x.every(z=>z.c<z.o)&&x[1].c<x[0].c&&x[2].c<x[1].c&&b.every((v,i)=>v/r[i]>.5))return "Three Black Crows";
   if(x[0].c<x[0].o&&b[0]/r[0]>.5&&b[1]/r[1]<.35&&x[2].c>x[2].o&&x[2].c>(x[0].o+x[0].c)/2)return "Morning Star candidate";
   if(x[0].c>x[0].o&&b[0]/r[0]>.5&&b[1]/r[1]<.35&&x[2].c<x[2].o&&x[2].c<(x[0].o+x[0].c)/2)return "Evening Star candidate";
  }
  if(body/range>.85)return "Marubozu-like";
  return "No strong candle pattern";
 }
 function detectChartPattern(rows,p,atrNow){
  const hs=p.highs.slice(-3),ls=p.lows.slice(-3),near=Math.max(atrNow*.9,rows[rows.length-1].c*.00025),last=rows[rows.length-1];
  const slope=a=>a.length<2?0:(a[a.length-1].p-a[0].p)/(a[a.length-1].i-a[0].i||1);
  const hSlope=slope(hs),lSlope=slope(ls),out={label:"No pattern detected",direction:null};
  if(hs.length===3&&ls.length>=2){
   const shoulder=Math.abs(hs[0].p-hs[2].p)<=near,neck=(ls[ls.length-1].p+ls[ls.length-2].p)/2;
   if(hs[1].p>hs[0].p+near*.5&&hs[1].p>hs[2].p+near*.5&&shoulder)return {label:last.c<neck?"Head & Shoulders · neckline broken":"Head & Shoulders candidate · awaiting neckline break",direction:last.c<neck?"BEARISH":null};
   if(hs[1].p<hs[0].p-near*.5&&hs[1].p<hs[2].p-near*.5&&shoulder){const cap=(hs[0].p+hs[2].p)/2;return {label:last.c>cap?"Inverse Head & Shoulders · neckline broken":"Inverse Head & Shoulders candidate · awaiting neckline break",direction:last.c>cap?"BULLISH":null}}
  }
  if(hs.length===3&&ls.length===3){
   const upper=hs[2].p,lower=ls[2].p;
   if(hs[2].p<hs[0].p-near*.2&&ls[2].p>ls[0].p+near*.2)return {label:last.c>upper?"Symmetrical Triangle · upside breakout":last.c<lower?"Symmetrical Triangle · downside breakout":"Symmetrical Triangle candidate · awaiting breakout",direction:last.c>upper?"BULLISH":last.c<lower?"BEARISH":null};
   const narrowing=Math.abs(hs[2].p-ls[2].p)<Math.abs(hs[0].p-ls[0].p);
   if(narrowing&&hSlope<0&&lSlope<0)return {label:last.c>upper?"Falling Wedge · upside breakout":"Falling Wedge candidate · awaiting breakout",direction:last.c>upper?"BULLISH":null};
   if(narrowing&&hSlope>0&&lSlope>0)return {label:last.c<lower?"Rising Wedge · downside breakout":"Rising Wedge candidate · awaiting breakout",direction:last.c<lower?"BEARISH":null};
   if(Math.abs(hSlope)<near/rows.length&&lSlope>0)return {label:last.c>upper?"Ascending Triangle · breakout":"Ascending Triangle candidate · awaiting breakout",direction:last.c>upper?"BULLISH":null};
   if(Math.abs(lSlope)<near/rows.length&&hSlope<0)return {label:last.c<lower?"Descending Triangle · breakdown":"Descending Triangle candidate · awaiting breakdown",direction:last.c<lower?"BEARISH":null};
  }
  const pole=rows.slice(-12,-6),flag=rows.slice(-6,-1);
  if(pole.length===6&&flag.length===5){
   const move=pole[5].c-pole[0].o,flagRange=Math.max(...flag.map(x=>x.h))-Math.min(...flag.map(x=>x.l)),drift=flag[4].c-flag[0].o;
   const bull=move>atrNow*2.2&&flagRange<Math.abs(move)*.7&&drift<0&&last.c>Math.max(...flag.map(x=>x.h));
   const bear=move< -atrNow*2.2&&flagRange<Math.abs(move)*.7&&drift>0&&last.c<Math.min(...flag.map(x=>x.l));
   if(bull||bear)return {label:bull?"Bull Flag · upside breakout":"Bear Flag · downside breakout",direction:bull?"BULLISH":"BEARISH"};
   if(Math.abs(move)>atrNow*2.2&&flagRange<Math.abs(move)*.7&&Math.sign(drift)!==Math.sign(move))return {label:"Flag candidate · awaiting breakout",direction:null};
  }
  return out;
 }
 function analyzeAdvanced(results,macro){
  const h=results.find(x=>x.tf==="1h"),m=results.find(x=>x.tf==="15m"),l=results.find(x=>x.tf==="5m");
  if(!h||!m||!l)return;
  const rows=m.rows,cl=rows.map(x=>x.c),last=rows[rows.length-1],p=pivots(rows),ph=p.highs.slice(-2),pl=p.lows.slice(-2),atrNow=atr(rows,14)||0;
  const hhhl=ph.length===2&&pl.length===2&&ph[1].p>ph[0].p&&pl[1].p>pl[0].p;
  const lhll=ph.length===2&&pl.length===2&&ph[1].p<ph[0].p&&pl[1].p<pl[0].p;
  const priorH=p.highs.length?p.highs[p.highs.length-1]:null,priorL=p.lows.length?p.lows[p.lows.length-1]:null;
  const bosUp=!!priorH&&last.c>priorH.p,bosDown=!!priorL&&last.c<priorL.p;
  const chochUp=bosUp&&lhll,chochDown=bosDown&&hhhl;
  const tolerance=Math.max(atrNow*.12,last.c*.00015);
  const srFlipUp=!!priorH&&last.l<=priorH.p+tolerance&&last.c>priorH.p;
  const srFlipDown=!!priorL&&last.h>=priorL.p-tolerance&&last.c<priorL.p;
  const roundBase=Math.round(last.c/50)*50,roundLevels=[roundBase-50,roundBase,roundBase+50];
  const eqh=ph.length===2&&Math.abs(ph[1].p-ph[0].p)<=tolerance,eql=pl.length===2&&Math.abs(pl[1].p-pl[0].p)<=tolerance;
  const sweepHigh=!!priorH&&last.h>priorH.p&&last.c<priorH.p,sweepLow=!!priorL&&last.l<priorL.p&&last.c>priorL.p;
  const rangeRows=rows.slice(-50),rangeHigh=Math.max(...rangeRows.map(x=>x.h)),rangeLow=Math.min(...rangeRows.map(x=>x.l)),midpoint=(rangeHigh+rangeLow)/2;
  const zone=last.c<midpoint?"DISCOUNT":last.c>midpoint?"PREMIUM":"EQUILIBRIUM";
  const swingHigh=ph[ph.length-1],swingLow=pl[pl.length-1];
  const bullishLeg=!!(swingHigh&&swingLow&&swingLow.i<swingHigh.i&&swingHigh.p>swingLow.p);
  const bearishLeg=!!(swingHigh&&swingLow&&swingHigh.i<swingLow.i&&swingHigh.p>swingLow.p);
  const fib=bullishLeg?{direction:"bullish",r50:swingHigh.p-(swingHigh.p-swingLow.p)*.50,r618:swingHigh.p-(swingHigh.p-swingLow.p)*.618,r705:swingHigh.p-(swingHigh.p-swingLow.p)*.705,r786:swingHigh.p-(swingHigh.p-swingLow.p)*.786,e1272:swingLow.p+(swingHigh.p-swingLow.p)*1.272,e1618:swingLow.p+(swingHigh.p-swingLow.p)*1.618}:bearishLeg?{direction:"bearish",r50:swingLow.p+(swingHigh.p-swingLow.p)*.50,r618:swingLow.p+(swingHigh.p-swingLow.p)*.618,r705:swingLow.p+(swingHigh.p-swingLow.p)*.705,r786:swingLow.p+(swingHigh.p-swingLow.p)*.786,e1272:swingHigh.p-(swingHigh.p-swingLow.p)*.272,e1618:swingHigh.p-(swingHigh.p-swingLow.p)*.618}:null;
  let fvg="None",fvgLevel=null;
  for(let i=rows.length-1;i>=2;i--){if(rows[i].l>rows[i-2].h){fvg="Bullish FVG";fvgLevel=[rows[i-2].h,rows[i].l];break}if(rows[i].h<rows[i-2].l){fvg="Bearish FVG";fvgLevel=[rows[i].h,rows[i-2].l];break}}
  let ob="None",obLevel=null;
  for(let i=rows.length-2;i>=Math.max(1,rows.length-20);i--){
   const c=rows[i],next=rows[i+1],impulse=Math.abs(next.c-next.o)>Math.max(atrNow*.8,0);
   if(impulse&&next.c>c.h&&c.c<c.o){ob="Potential Bullish OB";obLevel=[c.l,c.h];break}
   if(impulse&&next.c<c.l&&c.c>c.o){ob="Potential Bearish OB";obLevel=[c.l,c.h];break}
  }
  const closes=cl,ema9=ema(closes,9),ema21=ema(closes,21),ema50=ema(closes,50),ema200=ema(closes,200),adxVal=adx(rows),stoch=stochastic(rows),bb=bollinger(closes),ichi=ichimoku(rows),st=supertrend(rows),pat=candlePattern(rows);
  const chartPattern=detectChartPattern(rows,p,atrNow),dxy=macro?.dxy?.data,futures=macro?.goldFutures?.data,macroReady=!!(macro?.calendar?.ok&&macro?.dxy?.ok&&macro?.goldFutures?.ok),eventRisk=macro?.calendar?.activeRisk||null,dxyFresh=!!(dxy&&macro?.dxy?.ok&&dxy.ageSeconds<=1800),dxyBull=dxyFresh&&dxy.changePct<=-.10,dxyBear=dxyFresh&&dxy.changePct>=.10,futuresFresh=!!(futures&&macro?.goldFutures?.ok&&futures.ageSeconds<=1800),volumeConfirmed=futuresFresh&&Number(futures.volumeRatio)>=1.2,futuresVwapBull=futuresFresh&&Number(futures.futuresPrice)>Number(futures.vwap),futuresVwapBear=futuresFresh&&Number(futures.futuresPrice)<Number(futures.vwap);
  const rsiVal=rsi(closes),macdVal=macd(closes);
  const vwap=null,hasVolume=false,volBase=0;
  const bullDiv=p.lows.length>=2&&rsiVal!==null&&p.lows[p.lows.length-1].p<p.lows[p.lows.length-2].p&&rsi(closes.slice(0,p.lows[p.lows.length-1].i+1))>rsi(closes.slice(0,p.lows[p.lows.length-2].i+1));
  const bearDiv=p.highs.length>=2&&rsiVal!==null&&p.highs[p.highs.length-1].p>p.highs[p.highs.length-2].p&&rsi(closes.slice(0,p.highs[p.highs.length-1].i+1))<rsi(closes.slice(0,p.highs[p.highs.length-2].i+1));
  const upTrend=hhhl||bosUp||ema9>ema21&&ema21>ema50,downTrend=lhll||bosDown||ema9<ema21&&ema21<ema50;
  const bullSweepShift=sweepLow&&chochUp&&last.c>last.o;
  const bearSweepShift=sweepHigh&&chochDown&&last.c<last.o;
  const adxStrong=Number.isFinite(adxVal)&&adxVal>=20;
  const vwapBull=vwap!==null&&last.c>vwap,vwapBear=vwap!==null&&last.c<vwap;
  const bbStretchBull=!!bb&&last.c<bb.lower,bbStretchBear=!!bb&&last.c>bb.upper;
  /* Full-site confluence: SMC core (70%) + every coded technical filter (30%). */
  const trending=adxStrong||hhhl||lhll;
  const weights=trending
   ?{structure:14,break:11,liquidity:10,zone:7,fvg:6,sweep:8,value:4,ema:3,rsi:3,macd:4}
   :{structure:11,break:8,liquidity:11,zone:8,fvg:7,sweep:10,value:7,ema:3,rsi:2,macd:3};
  const patternBull=/Bullish|Hammer|Morning Star|Three White Soldiers/i.test(pat);
  const patternBear=/Bearish|Shooting Star|Evening Star|Three Black Crows/i.test(pat);
  const fibBull=!!fib&&/bull/i.test(fib.direction);
  const fibBear=!!fib&&/bear/i.test(fib.direction);
  const bullTech=[
   [adxStrong&&upTrend,4],[stoch!==null&&stoch>50,2],[bbStretchBull,2],
   [!!ichi&&last.c>Math.max(ichi.spanA,ichi.spanB)&&ichi.tenkan>ichi.kijun,4],
   [!!st&&st.direction==="BULLISH",4],[futuresVwapBull,2],[bullDiv,3],[patternBull,1],[fibBull,1],[chartPattern.direction==="BULLISH",2],[dxyBull,2],[volumeConfirmed&&futuresVwapBull,3]
  ];
  const bearTech=[
   [adxStrong&&downTrend,4],[stoch!==null&&stoch<50,2],[bbStretchBear,2],
   [!!ichi&&last.c<Math.min(ichi.spanA,ichi.spanB)&&ichi.tenkan<ichi.kijun,4],
   [!!st&&st.direction==="BEARISH",4],[futuresVwapBear,2],[bearDiv,3],[patternBear,1],[fibBear,1],[chartPattern.direction==="BEARISH",2],[dxyBear,2],[volumeConfirmed&&futuresVwapBear,3]
  ];
  const bullFactors=[
   [hhhl,weights.structure],[bosUp||chochUp,weights.break],[sweepLow,weights.liquidity],
   [ob==="Potential Bullish OB",weights.zone],[fvg==="Bullish FVG",weights.fvg],
   [bullSweepShift,weights.sweep],[zone==="DISCOUNT",weights.value],
   [ema9>ema21,weights.ema],[rsiVal>50,weights.rsi],[macdVal?.hist>0,weights.macd],
   ...bullTech
  ];
  const bearFactors=[
   [lhll,weights.structure],[bosDown||chochDown,weights.break],[sweepHigh,weights.liquidity],
   [ob==="Potential Bearish OB",weights.zone],[fvg==="Bearish FVG",weights.fvg],
   [bearSweepShift,weights.sweep],[zone==="PREMIUM",weights.value],
   [ema9<ema21,weights.ema],[rsiVal<50,weights.rsi],[macdVal?.hist<0,weights.macd],
   ...bearTech
  ];
  const totalWeight=100;
  const bullish=bullFactors.reduce((n,x)=>n+(x[0]?x[1]:0),0);
  const bearish=bearFactors.reduce((n,x)=>n+(x[0]?x[1]:0),0);
  const direction=bullish>bearish?"BUY BIAS":bearish>bullish?"SELL BIAS":"MIXED";
  const score=Math.max(bullish,bearish),total=totalWeight,confluencePct=score/totalWeight*100;
  latestConfluence=confluencePct;
  const separation=Math.abs(bullish-bearish);
  const side=bullish>bearish?"BUY":bearish>bullish?"SELL":null;
  const entry=last.c,invalid=side==="BUY"?(priorL?.p??last.l-atrNow):(priorH?.p??last.h+atrNow);
  const risk=side?Math.abs(entry-invalid):0;
  const sl=side?(side==="BUY"?invalid-atrNow*.15:invalid+atrNow*.15):null;
  const r=Math.abs(entry-sl||0);
  const tp1=side?(side==="BUY"?entry+r:entry-r):null,tp2=side?(side==="BUY"?entry+2*r:entry-2*r):null,tp3=side?(side==="BUY"?entry+3*r:entry-3*r):null;
  const london=new Date().toLocaleString("en-GB",{timeZone:"Europe/London",hour:"2-digit",minute:"2-digit",hour12:false});
  const ny=new Date().toLocaleString("en-US",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",hour12:false});
  const londonMin=Number(london.split(":")[0])*60+Number(london.split(":")[1]),nyMin=Number(ny.split(":")[0])*60+Number(ny.split(":")[1]);
  const londonOn=londonMin>=480&&londonMin<1020,nyOn=nyMin>=570&&nyMin<960;
  const patternText=pat+" · Double top/bottom candidates: "+(eqh||eql?"possible equal swing levels":"not confirmed")+" · Triangle/wedge/flag: visual confirmation required";
  const nextEvent=macro?.calendar?.events?.find(e=>e.time>Date.now());
  const lines=[
   ["Market structure","HH / HL bullish: "+(hhhl?"yes":"no")+" · LH / LL bearish: "+(lhll?"yes":"no"),"BOS "+(bosUp?"up":bosDown?"down":"none")+" · CHoCH "+(chochUp?"bullish":chochDown?"bearish":"none")],
   ["Liquidity","EQH "+(eqh?"yes":"no")+" / EQL "+(eql?"yes":"no"),"Sweep "+(sweepLow?"sell-side reclaimed":sweepHigh?"buy-side rejected":"none confirmed")],
   ["Order Blocks / Supply & Demand",ob,obLevel?fmt(obLevel[0])+" – "+fmt(obLevel[1]):"No qualified recent displacement zone"],
   ["Fair Value Gap",fvg,fvgLevel?fmt(fvgLevel[0])+" – "+fmt(fvgLevel[1]):"No three-candle gap"],
   ["Premium / Discount",zone,"50% dealing-range midpoint "+fmt(midpoint)],
   ["OTE / Fibonacci",fib?fib.direction+" · 0.50 "+fmt(fib.r50)+" · 0.618 "+fmt(fib.r618)+" · 0.705 "+fmt(fib.r705)+" · 0.786 "+fmt(fib.r786):"No confirmed swing leg","Extensions 1.272 "+fmt(fib?.e1272)+" · 1.618 "+fmt(fib?.e1618)],
   ["Sweep + reclaim + structure shift",bullSweepShift?"Bullish sweep → reclaim → CHoCH":bearSweepShift?"Bearish sweep → rejection → CHoCH":"No complete SMC trigger","A liquidity sweep alone is not an entry"],
   ["EMA confirmation","EMA9 "+fmt(ema9)+" · EMA21 "+fmt(ema21)+" · EMA50 "+fmt(ema50)+" · EMA200 "+fmt(ema200),"Bullish alignment "+(ema9>ema21&&ema21>ema50?"yes":"no")+" · bearish alignment "+(ema9<ema21&&ema21<ema50?"yes":"no")],
   ["Trend indicators","ADX "+fmt(adxVal)+" · SuperTrend "+(st?.direction||"—")+" · Ichimoku "+(ichi?(last.c>Math.max(ichi.spanA,ichi.spanB)?"above cloud":last.c<Math.min(ichi.spanA,ichi.spanB)?"below cloud":"inside cloud"):"—"),"EMA 9/21/50/200 alignment is included in the weighted score"],
   ["RSI / MACD confirmations","RSI14 "+fmt(rsiVal)+" · MACD histogram "+fmt(macdVal?.hist),"Bullish confirmation "+(rsiVal>50&&macdVal?.hist>0?"yes":"no")+" · bearish confirmation "+(rsiVal<50&&macdVal?.hist<0?"yes":"no")],
   ["Momentum","RSI "+fmt(rsiVal)+" · MACD hist "+fmt(macdVal?.hist)+" · Stochastic "+fmt(stoch),"Bullish / bearish divergence: "+(bullDiv?"bullish":bearDiv?"bearish":"none confirmed")],
   ["Volatility · VWAP · Volume","Bollinger "+(bb?(last.c>bb.upper?"above upper band":last.c<bb.lower?"below lower band":"inside bands"):"—")+" · VWAP "+fmt(vwap),"Volume "+(hasVolume?(volumeConfirmed?"above 1.2× 20-bar average":"not confirmed"):"unavailable / not supplied")],
   ["Closed-candle trigger",pat,"Pattern must occur at a meaningful SMC zone and be confirmed on candle close"],
   ["Support / Resistance","Flip "+(srFlipUp?"resistance → support":srFlipDown?"support → resistance":"not confirmed"),"Round levels "+roundLevels.map(fmt).join(" / ")],
   ["Chart patterns",patternText,"Double top/bottom candidates use equal swings; triangle, wedge, flag and head & shoulders require visual confirmation"],
   ["Automated chart patterns",chartPattern.label+" · "+(chartPattern.direction||"neutral / wait"),"H&S, inverse H&S, triangles, wedges and flags are algorithmic candidates; confirm breakout on chart"],
   ["DXY · US Dollar Index",dxyFresh?fmt(dxy.price)+" · "+(dxy.changePct>0?"+":"")+fmt(dxy.changePct)+"% day":"DXY unavailable / stale","Inverse gold context: "+(dxyBull?"USD weakness supports gold":dxyBear?"USD strength pressures gold":"neutral / no directional edge")],
   ["COMEX volume · futures VWAP",futuresFresh?"Volume ratio "+fmt(futures.volumeRatio)+"× · futures VWAP "+fmt(futures.vwap):"COMEX volume unavailable / stale","GC=F real futures volume proxy, not XAU spot volume. Confirmation "+(volumeConfirmed?"passed":"not passed")],
   ["Official event risk",eventRisk?eventRisk.type+" · "+eventRisk.title:nextEvent? "Next: "+nextEvent.type+" · "+nextEvent.title+" · "+new Date(nextEvent.time).toLocaleString():"No upcoming CPI/NFP/FOMC event found","Calendar "+(macro?.calendar?.ok?"BLS + Federal Reserve verified":"not verified")+" · "+(macro?.updatedAt||"source unavailable")],
   ["Sessions","London "+(londonOn?"OPEN":"closed")+" · New York "+(nyOn?"OPEN":"closed"),"Sessions are context only; event blackout overrides technical setups"]
  ];
  const host=$("advancedRows");host.innerHTML="";
  const table=document.createElement("table");table.className="module-table";
  const body=document.createElement("tbody");
  lines.forEach(a=>{const tr=document.createElement("tr");a.forEach((v,i)=>{const td=document.createElement("td");td.textContent=v;tr.append(td)});body.append(tr)});
  table.append(body);host.append(table);
  $("advancedStatus").textContent="ANALYSIS UPDATED · "+direction+" · weighted confluence "+confluencePct.toFixed(1)+"% · "+(adxStrong?"ADX trend strength confirmed":"ADX trend strength weak/unknown")+" (not probability)";
  const structureTrigger=side==="BUY"?(bullSweepShift||bosUp||srFlipUp):(bearSweepShift||bosDown||srFlipDown);
  const h1Bull=h.ema20>h.ema50,m15Bull=m.ema20>m.ema50&&m.macd?.hist>0&&m.rsi>50;
  const h1Bear=h.ema20<h.ema50,m15Bear=m.ema20<m.ema50&&m.macd?.hist<0&&m.rsi<50;
  const aligned=side==="BUY"?(h1Bull&&m15Bull):(h1Bear&&m15Bear);
  const candleBull=last.c>last.o&&last.c>last.l+(last.h-last.l)*.65;
  const candleBear=last.c<last.o&&last.c<last.l+(last.h-last.l)*.35;
  const zoneConfirmed=side==="BUY"
   ?(zone==="DISCOUNT"||fvgLevel&&fvg==="Bullish FVG"&&last.c>=fvgLevel[0]&&last.c<=fvgLevel[1]||obLevel&&ob==="Potential Bullish OB"&&last.c>=obLevel[0]&&last.c<=obLevel[1])
   :(zone==="PREMIUM"||fvgLevel&&fvg==="Bearish FVG"&&last.c>=fvgLevel[0]&&last.c<=fvgLevel[1]||obLevel&&ob==="Potential Bearish OB"&&last.c>=obLevel[0]&&last.c<=obLevel[1]);
  const entryConfirmed=!!(side&&structureTrigger&&zoneConfirmed&&(side==="BUY"?candleBull:candleBear));
  const candidate=!!(side&&entryConfirmed&&confluencePct>=60&&separation>=12&&aligned&&macroReady&&!eventRisk&&volumeConfirmed&&dxyFresh&&risk>0&&atrNow>0&&[entry,sl,tp1,tp2,tp3].every(Number.isFinite));
  $("advancedPlan").textContent=candidate?"PAPER-ONLY "+side+" · ENTRY CONFIRMED · Entry "+fmt(entry)+" · SL "+fmt(sl)+" · TP1 "+fmt(tp1)+" · TP2 "+fmt(tp2)+" · TP3 "+fmt(tp3)+" · Dynamic confluence "+confluencePct.toFixed(1)+"% · SMC trigger + zone + closed candle + 1h/15m alignment + ≥60% confluence · R:R 1:1 / 1:2 / 1:3 · Win rate not validated.":"WAIT · dynamic confluence "+confluencePct.toFixed(1)+"% · waiting for structure, SMC zone, closed-candle trigger, 1h/15m alignment, verified DXY + official calendar, fresh COMEX volume/VWAP, no event blackout and clear risk.";
  return candidate?{side,entry,sl,tp1,tp2,tp3,score:Math.round(score),total:totalWeight,atr:atrNow,time:m.last?.t||last.t,macro:{dxy:dxy.price,dxyChangePct:dxy.changePct,volumeRatio:futures.volumeRatio,futuresVwap:futures.vwap,chartPattern:chartPattern.label}}:null;
 }

 function showRows(items){
  $("candleRows").innerHTML="";
  const table=document.createElement("table");table.className="module-table";
  table.innerHTML="<thead><tr><th>TF</th><th>Bars</th><th>EMA20 / 50</th><th>RSI14</th><th>MACD hist</th><th>ATR14</th></tr></thead>";
  const body=document.createElement("tbody");
  items.forEach(x=>{const tr=document.createElement("tr");[x.tf,x.count,x.ema20&&x.ema50?fmt(x.ema20)+" / "+fmt(x.ema50):"—",fmt(x.rsi),fmt(x.macd?.hist),fmt(x.atr)].forEach(v=>{const td=document.createElement("td");td.textContent=String(v);tr.append(td)});body.append(tr)});
  table.append(body);$("candleRows").append(table);
 }
 async function load(){
  if(loading)return;loading=true;
  $("candleStatus").textContent="LOADING REAL CANDLES…";
  $("candleBias").textContent="WAIT · loading market data";
  $("candleReason").textContent="Checking candle coverage, timestamps and indicator inputs.";
  $("candleQuality").textContent="";
  try{
   const macroPromise=fetch("/api/market-context",{cache:"no-store"}).then(r=>r.json()).catch(()=>null);
   const aiConfigPromise=fetch("/api/ai-review",{cache:"no-store"}).then(r=>r.json()).catch(()=>({configured:false}));
   const results=await Promise.all(intervals.map(async tf=>{
    const url="https://xaus.com/api/v1/chart?symbol=xau&range="+tf.range+"&interval="+tf.name;
    const response=await fetch(url,{cache:"no-store"});
    if(!response.ok)throw new Error(tf.name+" endpoint returned HTTP "+response.status);
    const json=await response.json(),rows=normalize(json);
    if(rows.length<60)throw new Error(tf.name+" has only "+rows.length+" valid OHLC bars; at least 60 are required");
    const closed=rows.slice(0,-1),last=closed[closed.length-1],age=Date.now()-last.t;
    const maxAge=tf.minutes*60*1000*3;
    if(age<0||age>maxAge)throw new Error(tf.name+" candles are stale ("+Math.round(age/60000)+" minutes since last closed bar)");
    const closes=closed.map(x=>x.c),m=macd(closes);
    return {tf:tf.name,count:closed.length,last,age,ema20:ema(closes,20),ema50:ema(closes,50),rsi:rsi(closes),macd:m,atr:atr(closed),rows:closed};
   }));
   showRows(results);
   const macro=await macroPromise,aiConfig=await aiConfigPromise;
   const aiBadge=root.querySelector("#aiSignalLive");if(aiBadge)aiBadge.textContent=aiConfig.configured?"● GEMINI AI READY":"● GEMINI API KEY REQUIRED";
   if(!aiConfig.configured)$("advancedPlan").textContent="WAIT · Gemini AI review is not configured. Add GEMINI_API_KEY to Vercel environment variables; no BUY/SELL signal can pass without AI approval.";
   const candidate=analyzeAdvanced(results,macro);
   if(!candidate){const blockers=[];if(!macro?.calendar?.ok)blockers.push("official BLS/Fed calendar unavailable");if(!macro?.dxy?.ok)blockers.push("DXY missing or stale");if(!macro?.goldFutures?.ok)blockers.push("COMEX volume/VWAP missing or stale");if(macro?.calendar?.activeRisk)blockers.push("high-impact event blackout active");if(macro?.goldFutures?.data&&Number(macro.goldFutures.data.volumeRatio)<1.2)blockers.push("volume confirmation below 1.2×");if(!aiConfig.configured)blockers.push("Gemini API key not configured");$("advancedPlan").textContent="WAIT · "+(blockers.length?blockers.join(" · "):"technical entry conditions not met")+". No trade signal until all required checks pass."}
   const h=results.find(x=>x.tf==="1h"),m=results.find(x=>x.tf==="15m"),l=results.find(x=>x.tf==="5m");
   if(!h||!m||!l||!m.macd)throw new Error("Required timeframes or indicator history are incomplete");
   const up=h.ema20>h.ema50,down=h.ema20<h.ema50;
   const momUp=m.macd.hist>0&&m.rsi>50,momDown=m.macd.hist<0&&m.rsi<50;
   const bias=up&&momUp?"BULLISH":down&&momDown?"BEARISH":"MIXED";
   const candleAge=Math.max(...results.map(x=>x.age));
   $("candleStatus").textContent="CANDLES VERIFIED · "+results.map(x=>x.tf).join(" / ");
   $("candleStatus").style.color="#35c98a";
   $("candleBias").textContent="WAIT · "+bias+" BIAS";
   $("candleReason").textContent="1h EMA20/50: "+(up?"bullish":down?"bearish":"flat")+". 15m MACD/RSI: "+(momUp?"bullish momentum":momDown?"bearish momentum":"mixed momentum")+". 5m last closed candle: "+new Date(l.last.t).toLocaleString()+".";
   $("candleQuality").textContent="Valid bars: 5m "+l.count+" · 15m "+m.count+" · 1h "+h.count+" | Oldest last-closed age: "+Math.round(candleAge/60000)+" min. Confluence is not a probability.";
   const spot=await getFreshSpot();
   const spotNearCandidate=!!(candidate&&spot.ok&&Math.abs(spot.price-candidate.entry)<=Math.max(candidate.atr*.5,spot.price*.0005));
   if(spotNearCandidate){
    const aiResponse=await fetch("/api/ai-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({analysis:{symbol:"XAUUSD",side:candidate.side,entry:candidate.entry,stopLoss:candidate.sl,targets:[candidate.tp1,candidate.tp2,candidate.tp3],confluence:candidate.score+"/"+candidate.total,timeframes:["5m","15m","1h"],macro:candidate.macro,calendarVerified:!!macro?.calendar?.ok,eventRisk:!!macro?.calendar?.activeRisk,volumeSource:"COMEX GC=F futures volume proxy",volumeConfirmed:!!macro?.goldFutures?.ok}})});
    const aiData=await aiResponse.json().catch(()=>({ok:false,error:"Invalid AI response"}));
    if(!aiResponse.ok||!aiData.ok||!aiData.review?.approved){
     const aiStatus=root.querySelector("#aiSignalLive");if(aiStatus)aiStatus.textContent=aiData.configured?"● AI REVIEW BLOCKED":"● AI KEY REQUIRED";
     updateLivePanel("WAIT · AI REVIEW REQUIRED",aiData.error||aiData.review?.summary||"AI review did not approve this setup. No BUY/SELL signal.",bias);
     $("advancedPlan").textContent="WAIT · AI review "+(aiData.configured?"rejected or unavailable":"not configured")+". "+(aiData.error||aiData.review?.summary||"Add GEMINI_API_KEY in Vercel to activate the AI review gate.");
     return;
    }
    const aiStatus=root.querySelector("#aiSignalLive");if(aiStatus)aiStatus.textContent="● GEMINI REVIEW PASSED · PAPER ONLY";
    updateLivePanel(candidate.side+" · AI REVIEWED",candidate.side+" setup passed deterministic rules and Gemini risk review. Fresh spot $"+spot.price.toFixed(2)+" USD/oz. Paper-test only.",bias,candidate);
   }else if(candidate){
    updateLivePanel("WAIT · PRICE MOVED","A "+candidate.side+" SMC setup was detected, but current spot is too far from its candle entry. Wait for a new closed-candle setup; no chasing.",bias);
   }else if(spot.ok){
    updateLivePanel("WAIT · "+bias+" BIAS","Fresh XAUS spot $"+spot.price.toFixed(2)+" USD/oz and verified 5m/15m/1h candles. SMC entry conditions are not confirmed.",bias);
   }else{
    updateLivePanel("WAIT","Candles are verified, but no fresh XAUS spot quote is confirmed. No trade recommendation.","UNAVAILABLE");
   }
   renderSignalStrength();
   const aiStatus=root.querySelector("#aiSignalLive");if(aiStatus)aiStatus.textContent=spot.ok?"● SMC DATA CHECKED":"● DATA UNAVAILABLE";
   $("candleMeta").textContent="Source: XAUS /api/v1/chart (XAU series via Yahoo Finance proxy). Refreshed: "+new Date().toLocaleString()+". Last forming candle excluded from indicators.";
  }catch(error){
   $("candleStatus").textContent="DATA UNAVAILABLE / STALE";
   $("candleStatus").style.color="#f16e72";
   $("candleBias").textContent="WAIT · NO VALID SIGNAL";
   $("candleReason").textContent=String(error.message||error)+". No fallback or simulated candles are used.";
   $("candleQuality").textContent="A valid, fresh OHLC history is required before analysis can continue.";
   updateLivePanel("WAIT","No verified candle set is available. Live Signals is held in WAIT; no trade recommendation.", "UNAVAILABLE");
   $("candleRows").textContent="Candle validation failed.";
  }finally{loading=false}
 }
 $("candleRefresh").addEventListener("click",()=>load());
 // Spot quote and strength bar refresh every 5 seconds; closed-candle strategy analysis refreshes every 2 minutes / new candle.
 load();
 refreshTimer=setInterval(()=>{if(!document.hidden){renderSignalStrength();getFreshSpot()}},5000);
 setInterval(()=>{if(!document.hidden&&!loading)load()},120000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden){getFreshSpot();load()}});
})();

render();
})();

/* Investing.com news bridge — RSS is fetched server-side to avoid browser CORS issues */
(function(){
 const app=document.querySelector("#app"),nav=document.querySelector(".tabs");
 if(!app||!nav)return;
 const root=document.createElement("section");root.id="news";root.className="module-grid hidden";app.append(root);
 const tab=document.createElement("button");tab.type="button";tab.className="tab";tab.dataset.tab="news";tab.textContent="News";nav.append(tab);
 tab.addEventListener("click",()=>{app.querySelectorAll(":scope > section").forEach(x=>x.classList.toggle("hidden",x.id!=="news"));nav.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===tab))});
 const card=document.createElement("article");
 card.className="module-card wide";
 card.style.marginTop="0";
 card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><h2 style="margin:0">Investing.com · Market News</h2><span id="investingNewsStatus" class="module-muted">Connecting…</span></div>'+
 '<p class="module-muted" style="margin:8px 0 12px">Gold, commodities, forex and macroeconomic headlines · source links open on Investing.com.</p>'+
 '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button type="button" data-news-filter="all">All</button><button type="button" data-news-filter="gold">Commodities</button><button type="button" data-news-filter="forex">Forex</button><button type="button" data-news-filter="macro">Economic</button><button type="button" id="investingNewsRefresh">Refresh</button></div>'+
 '<div id="investingNewsList" class="module-muted" aria-live="polite">Loading Investing.com headlines…</div>'+
 '<p class="module-muted" style="margin:12px 0 0">News is informational, may be delayed, and is not a trading signal. Economic calendar events are not included in this news feed.</p>'+
 '<div style="margin-top:8px"><a href="https://www.investing.com/news/" target="_blank" rel="noopener noreferrer">Open Investing.com News</a> · <a href="https://www.investing.com/economic-calendar/" target="_blank" rel="noopener noreferrer">Economic Calendar</a></div>';
 root.append(card);
 const $=id=>card.querySelector("#"+id);
 let items=[],filter="all",busy=false;
 const labels={en:{loading:"Updating headlines…",ok:"UPDATED",partial:"PARTIAL FEED",none:"FEED UNAVAILABLE",empty:"No headlines returned. Use the Investing.com links below.",error:"Could not load the news feed. Direct links remain available.",all:"All",gold:"Commodities",forex:"Forex",macro:"Economic",refresh:"Refresh"},ar:{loading:"جارٍ تحديث الأخبار…",ok:"تم التحديث",partial:"تحديث جزئي",none:"المصدر غير متاح",empty:"لا توجد عناوين حالياً. استخدم روابط Investing.com أدناه.",error:"تعذر تحميل الأخبار. الروابط المباشرة ما زالت متاحة.",all:"الكل",gold:"السلع والذهب",forex:"الفوركس",macro:"اقتصاد",refresh:"تحديث"},fr:{loading:"Mise à jour…",ok:"MIS À JOUR",partial:"FLUX PARTIEL",none:"INDISPONIBLE",empty:"Aucun titre. Consultez les liens Investing.com.",error:"Flux indisponible. Les liens directs restent disponibles.",all:"Tout",gold:"Matières premières",forex:"Forex",macro:"Économie",refresh:"Actualiser"},es:{loading:"Actualizando…",ok:"ACTUALIZADO",partial:"FUENTE PARCIAL",none:"NO DISPONIBLE",empty:"No hay titulares. Usa los enlaces de Investing.com.",error:"No se pudo cargar el feed. Los enlaces directos siguen disponibles.",all:"Todo",gold:"Materias primas",forex:"Forex",macro:"Economía",refresh:"Actualizar"}};
 function words(){return labels[document.querySelector("#lang")?.value||"en"]||labels.en}
 function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function render(){
  const list=$("investingNewsList");
  const shown=items.filter(x=>filter==="all"||x.category===filter);
  if(!shown.length){list.textContent=words().empty;return}
  list.innerHTML=shown.map(x=>{
   const level=["high","medium","low"].includes(x.severity)?x.severity:"low";
   const colors={high:{bg:"#3b171b",fg:"#ff6b72",border:"#a8323c"},medium:{bg:"#3a2a12",fg:"#ffc45c",border:"#9a6b22"},low:{bg:"#123323",fg:"#64d995",border:"#26764a"}};
   const c=colors[level];
   const severityLabels={en:{high:"HIGH RISK",medium:"MEDIUM RISK",low:"LOW RISK"},ar:{high:"خطورة عالية",medium:"خطورة متوسطة",low:"خطورة منخفضة"},fr:{high:"RISQUE ÉLEVÉ",medium:"RISQUE MOYEN",low:"RISQUE FAIBLE"},es:{high:"RIESGO ALTO",medium:"RIESGO MEDIO",low:"RIESGO BAJO"}};
   const lang=document.querySelector("#lang")?.value||"en";
   const risk=(severityLabels[lang]||severityLabels.en)[level];
   let when="Time unavailable";
   if(x.published){const d=new Date(x.published);if(!Number.isNaN(d.getTime()))when=new Intl.DateTimeFormat(lang==="ar"?"ar-MA":"en-GB",{timeZone:"Africa/Casablanca",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).format(d)+" · Morocco time";}
   else if(x.publishedRaw)when=x.publishedRaw+" · source time";
   return '<div style="padding:12px 0;border-bottom:1px solid #29313e"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px"><span style="display:inline-block;padding:4px 8px;border-radius:5px;background:'+c.bg+';color:'+c.fg+';border:1px solid '+c.border+';font-size:11px;font-weight:800">'+risk+'</span><span class="module-muted" style="font-size:12px">'+esc(x.categoryLabel)+'</span></div><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer" style="color:#f1d18a;font-weight:650;text-decoration:none">'+esc(x.title)+'</a><div class="module-muted" style="font-size:12px;margin-top:6px">🕒 '+esc(when)+' · Investing.com</div></div>';
  }).join("");
 }
 async function load(){
  if(busy)return;busy=true;$("investingNewsStatus").textContent=words().loading;
  try{
   const res=await fetch("/api/news",{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"HTTP "+res.status);
   items=Array.isArray(data.items)?data.items:[];
   $("investingNewsStatus").textContent=items.length?(data.partial?words().partial:words().ok):words().none;
   render();
  }catch(e){$("investingNewsStatus").textContent=words().none;$("investingNewsList").textContent=words().error}
  finally{busy=false}
 }
 card.querySelectorAll("[data-news-filter]").forEach(btn=>btn.addEventListener("click",()=>{filter=btn.dataset.newsFilter;render()}));
 $("investingNewsRefresh").addEventListener("click",load);
 document.querySelector("#lang")?.addEventListener("change",()=>{render();$("investingNewsStatus").textContent=items.length?words().ok:words().none});
 load();setInterval(()=>{if(!document.hidden)load()},300000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)load()});
})(); 


/* SMC-only Strategy Library — indicators retained only as confirmations */
(function(){
 const root=document.querySelector("#strategy");if(!root||root.dataset.catalogReady)return;root.dataset.catalogReady="1";
 const intro=root.querySelector(":scope > .card");
 if(intro)intro.innerHTML='<h2>SMC Strategy Library · XAU/USD</h2><p class="notice">AI SIGNALS uses the live weighted confluence engine: SMC structure/liquidity/zones plus coded trend, momentum, volatility, VWAP, divergence, candle-pattern and Fibonacci filters. DXY/news and visual chart patterns are shown as external/manual confirmation until verified data and detection are connected.</p>';
 const panel=document.createElement("article");panel.className="module-card wide";panel.style.marginTop="14px";
 panel.innerHTML='<h2>Smart Money Concepts · Core setups</h2><div id="smcLibrary" class="module-grid"></div><p class="module-muted" style="margin-top:12px">Educational rule definitions. A detected zone or pattern is not proof of institutional activity and does not independently authorize an order.</p>';
 root.prepend(panel);
 const items=[
 ["Market Structure · HH/HL & LH/LL","Classify confirmed swing sequences. Bullish structure uses higher highs/higher lows; bearish structure uses lower highs/lower lows.","Require confirmed pivots and a closed-candle break or reaction; avoid judging an unfinished candle."],
 ["BOS & CHoCH","BOS is a close beyond a meaningful swing; CHoCH is a possible shift against the prior structure.","Wait for close, then retest/reclaim where possible. A wick alone is not confirmation."],
 ["Liquidity · EQH/EQL & Sweep","Mark equal highs/lows and prior session extremes. Watch for a sweep and reclaim/rejection.","Require close back through the swept level plus structure confirmation; sweep alone is not an entry."],
 ["Order Blocks","Potential last opposing candle before displacement that breaks a meaningful swing.","Treat as a candidate zone; wait for revisit, rejection and risk-defined entry."],
 ["Supply & Demand","Map origin zones of strong displacement and distinguish fresh from repeatedly tested zones.","Require a reaction and structure confirmation; invalidate on decisive acceptance through zone."],
 ["Fair Value Gap / Imbalance","Identify three-candle non-overlap gaps and monitor retracement into the imbalance.","Prefer confluence with structure, liquidity and a closed-candle trigger; not every gap fills."],
 ["Premium / Discount & OTE","Use a confirmed dealing range midpoint and retracement levels such as 0.50, 0.618, 0.705 and 0.786.","Long ideas are preferred in discount and short ideas in premium, only with structure and trigger."],
 ["Entry models · Reclaim / Retest","Use displacement, break-and-retest, sweep-and-reclaim, or limit entry at a validated zone.","Choose market, stop or limit order only when its trigger and invalidation are explicit."]
 ];
 const host=panel.querySelector("#smcLibrary");
 items.forEach(([name,method,confirm])=>{const card=document.createElement("article");card.className="module-card";const h=document.createElement("h2");h.textContent=name;const p=document.createElement("p");p.className="module-muted";p.textContent=method;const q=document.createElement("p");q.className="module-muted";q.textContent="Confirmation: "+confirm;card.append(h,p,q);host.append(card)});
})(); 


/* Reference-style live header controls and Morocco session chips */
(function(){
 const clock=document.querySelector("#moroccoClock");
 const refresh=document.querySelector("#topRefresh");
 const fmtClock=()=>{if(clock)clock.textContent="🇲🇦 "+new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Casablanca",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date())};
 fmtClock();setInterval(fmtClock,1000);
 if(refresh)refresh.addEventListener("click",()=>{const c=document.querySelector("#candleRefresh");if(c)c.click();else location.reload();});
 const sessions=[
  {id:"chipTokyo",tz:"Asia/Tokyo",start:9,end:18},
  {id:"chipLondon",tz:"Europe/London",start:8,end:17},
  {id:"chipNewYork",tz:"America/New_York",start:8,end:17}
 ];
 function renderChips(){
  sessions.forEach(x=>{
   const el=document.getElementById(x.id);if(!el)return;
   const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:x.tz,weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).map(v=>[v.type,v.value]));
   const mins=Number(p.hour)*60+Number(p.minute),weekday=["Mon","Tue","Wed","Thu","Fri"].includes(p.weekday),open=weekday&&mins>=x.start*60&&mins<x.end*60;
   el.classList.toggle("open",open);el.textContent="● "+x.tz.split("/").pop().toUpperCase()+" · "+(open?"OPEN":"CLOSED");
  });
 }
 renderChips();setInterval(renderChips,15000);
})();


/* XM MT5 live-linked candlestick chart: historical reference candles + XM live ticks */
(function(){
 const canvas=document.getElementById("xmLiveChart"),wrap=document.getElementById("xmChartWrap");
 if(!canvas||!wrap)return;
 const ctx=canvas.getContext("2d"),priceEl=document.getElementById("xmChartPrice"),stateEl=document.getElementById("xmChartState"),footEl=document.getElementById("xmChartFoot"),badge=document.getElementById("xmChartBadge");
 let candles=[],live=null,lastPrice=null,loading=false,lastDraw=0;
 const finite=n=>Number.isFinite(n);
 function normalize(raw){
  const rows=Array.isArray(raw)?raw:(raw?.points||raw?.candles||raw?.data||[]);
  return rows.map(x=>{
   const v=x.t??x.time??x.timestamp??"",n=Number(v),t=finite(n)?(n<1e12?n*1000:n):Date.parse(v);
   return {time:Math.floor(t/1000),open:Number(x.o??x.open),high:Number(x.h??x.high),low:Number(x.l??x.low),close:Number(x.c??x.close)};
  }).filter(x=>finite(x.time)&&[x.open,x.high,x.low,x.close].every(finite)&&x.low>0&&x.high>=Math.max(x.open,x.close)&&x.low<=Math.min(x.open,x.close))
   .sort((a,b)=>a.time-b.time).filter((x,i,a)=>!i||x.time!==a[i-1].time);
 }
 async function loadHistory(){
  if(loading)return;loading=true;
  try{
   const r=await fetch("https://xaus.com/api/v1/chart?symbol=xau&range=5d&interval=5m",{cache:"no-store"});
   if(!r.ok)throw new Error("HTTP "+r.status);
   const j=await r.json(),rows=normalize(j);
   if(rows.length<20)throw new Error("Not enough candles");
   candles=rows.slice(-180);draw();
   footEl.textContent="5m historical candles loaded · Waiting for XM MT5 ticks to update the live candle.";
  }catch(e){stateEl.textContent="HISTORICAL DATA UNAVAILABLE";footEl.textContent="Could not load historical candles. Live price will still be shown when XM MT5 is connected."}
  finally{loading=false}
 }
 function applyTick(q){
  const now=Date.now(),bucket=Math.floor(now/300000)*300;
  if(!live||live.time!==bucket){
   const prev=live?live.close:(candles.length?candles[candles.length-1].close:q.price);
   live={time:bucket,open:prev,high:q.price,low:q.price,close:q.price};
  }else{
   live.high=Math.max(live.high,q.price);live.low=Math.min(live.low,q.price);live.close=q.price;
  }
  const base=candles.filter(c=>c.time!==bucket);
  if(!base.length||base[base.length-1].time<bucket){candles=base.concat([live]).slice(-180)}
  else {candles=base.map(c=>c.time===bucket?live:c)}
  lastPrice=q.price;draw();
 }
 function onQuote(event){
  const q=event.detail||{};
  if(!q.ok||!finite(Number(q.price))){
   stateEl.textContent="WAITING FOR FRESH XM MT5 TICK";stateEl.style.color="#e5a84b";
   if(badge)badge.textContent="● XM MT5 NOT FRESH";
   if(footEl)footEl.textContent="Historical chart remains visible; live candle waits for a fresh XM MT5 quote.";
   return;
  }
  const price=Number(q.price);
  priceEl.textContent="$"+price.toFixed(2);stateEl.textContent="● "+(q.source||"LIVE")+" · "+Math.max(0,Math.round(Number(q.age)||0))+"s";stateEl.style.color="#35c98a";
  if(badge)badge.textContent="● LIVE · "+(q.source||"MARKET DATA");
  applyTick({price,bid:Number(q.bid),ask:Number(q.ask)});
  if(footEl)footEl.textContent="Live candle + price line: "+(q.source||"market feed")+" · Historical 5m candles: XAUS reference · XAUUSD · Bid "+(finite(Number(q.bid))?Number(q.bid).toFixed(2):"—")+" / Ask "+(finite(Number(q.ask))?Number(q.ask).toFixed(2):"—");
 }
 function draw(){
  const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,window.devicePixelRatio||1),w=Math.max(320,rect.width),h=Math.max(260,rect.height||420);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);ctx.fillStyle="#0b1117";ctx.fillRect(0,0,w,h);
  if(!candles.length){ctx.fillStyle="#9aa8b8";ctx.font="13px sans-serif";ctx.fillText("Waiting for historical candles…",18,32);return}
  const data=candles.slice(-90),left=14,right=82,top=18,bottom=28,plotW=w-left-right,plotH=h-top-bottom;
  let min=Math.min(...data.map(x=>x.low)),max=Math.max(...data.map(x=>x.high));
  if(lastPrice&&finite(lastPrice)){min=Math.min(min,lastPrice);max=Math.max(max,lastPrice)}
  const pad=(max-min)*.08||1;min-=pad;max+=pad;
  const y=v=>top+(max-v)/(max-min)*plotH;
  ctx.strokeStyle="#24313d";ctx.lineWidth=1;ctx.fillStyle="#8d9aaa";ctx.font="10px sans-serif";
  for(let i=0;i<=5;i++){const yy=top+plotH*i/5,val=max-(max-min)*i/5;ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(w-right,yy);ctx.stroke();ctx.fillText(val.toFixed(2),w-right+7,yy+3)}
  const step=plotW/data.length,cw=Math.max(2,Math.min(9,step*.62));
  data.forEach((c,i)=>{
   const x=left+i*step+step/2,up=c.close>=c.open,color=up?"#29c98a":"#ef6262";
   ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(x,y(c.high));ctx.lineTo(x,y(c.low));ctx.stroke();
   const yy=Math.min(y(c.open),y(c.close)),hh=Math.max(1,Math.abs(y(c.open)-y(c.close)));
   ctx.fillRect(x-cw/2,yy,cw,hh);
  });
  if(lastPrice&&finite(lastPrice)){
   const yy=y(lastPrice);ctx.setLineDash([5,4]);ctx.strokeStyle="#f1d18a";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(w-right,yy);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle="#f1d18a";ctx.fillRect(w-right+3,yy-9,right-7,18);ctx.fillStyle="#111820";ctx.font="bold 10px sans-serif";ctx.fillText(lastPrice.toFixed(2),w-right+7,yy+3);
  }
  ctx.fillStyle="#718092";ctx.font="10px sans-serif";ctx.fillText("5m",left,h-8);ctx.fillText("XAUUSD · "+data.length+" bars",Math.max(left+45,w-right-130),h-8);
 }
 if(window.ResizeObserver)new ResizeObserver(draw).observe(wrap);
 window.addEventListener("resize",draw);
 loadHistory();setInterval(loadHistory,300000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)poll()});
})();
