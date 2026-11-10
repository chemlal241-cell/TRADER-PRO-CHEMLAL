(()=> {
const css=document.createElement("style");
css.textContent=".module-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.module-card{background:linear-gradient(160deg,#151a23,#10141b);border:1px solid #29313e;border-radius:17px;padding:18px}.module-card h2{font-size:15px;margin:0 0 15px;color:#f1d18a}.module-card input,.module-card select,.module-card textarea{width:100%;margin:5px 0 12px;border:1px solid #29313e;background:#171d27;color:#fff;border-radius:10px;padding:10px}.module-card label{display:block;color:#93a0b2;font-size:12px}.module-card button{border:0;border-radius:10px;padding:10px 14px;background:linear-gradient(135deg,#f0d18e,#b98731);color:#17120a;font-weight:800}.module-result{margin-top:12px;padding:13px;border:1px solid #69552d;border-radius:12px;color:#f1d18a;background:#201b11}.module-table{width:100%;border-collapse:collapse;font-size:13px}.module-table td,.module-table th{padding:8px;border-bottom:1px solid #29313e;text-align:left}.module-muted{font-size:12px;color:#93a0b2;line-height:1.6}@media(max-width:850px){.module-grid{grid-template-columns:1fr}}";
document.head.append(css);
const nav=document.querySelector(".tabs"),defs=[["risklab","Risk Lab"],["journal","Trade Journal"],["backtest","Backtest Lab"]];
defs.forEach(([id,label])=>{const b=document.createElement("button");b.className="tab";b.dataset.tab=id;b.textContent=label;nav.append(b)});
const make=(id,html)=>{const s=document.createElement("section");s.id=id;s.className="module-grid hidden";s.innerHTML=html;document.querySelector("#app").append(s)};
make("risklab",'<article class="module-card"><h2>Risk / Reward Calculator</h2><label>Direction</label><select id="rrSide"><option value="buy">BUY / Long</option><option value="sell">SELL / Short</option></select><label>Entry price</label><input id="rrEntry" type="number" step="any"><label>Stop loss price</label><input id="rrStop" type="number" step="any"><label>Take profit price</label><input id="rrTarget" type="number" step="any"><button id="rrCalc">Calculate R:R</button><div id="rrOut" class="module-result">Enter prices to calculate.</div><p class="module-muted">Price-distance calculation only; broker costs and contract rules are not verified.</p></article><article class="module-card"><h2>Risk Checklist</h2><div id="riskChecks"></div><div id="riskCheckOut" class="module-result">0 of 5 checks completed.</div></article>');
make("journal",'<article class="module-card"><h2>Trade Journal</h2><label>Symbol</label><input id="jSymbol" value="XAUUSD"><label>Side</label><select id="jSide"><option>BUY</option><option>SELL</option><option>WAIT</option></select><label>Entry</label><input id="jEntry" type="number" step="any"><label>Exit</label><input id="jExit" type="number" step="any"><label>Result (R multiple)</label><input id="jR" type="number" step="any"><label>Notes</label><textarea id="jNotes" rows="3"></textarea><button id="jAdd">Save journal entry</button><div id="jMsg" class="module-result">Stored only in this browser.</div></article><article class="module-card"><h2>Saved Trades</h2><div id="jList"></div><button id="jExport" style="margin-top:12px">Export CSV</button><button id="jClear" style="margin:12px 0 0 8px;background:#6c3333;color:white">Clear journal</button><p class="module-muted">Entries stay on this device and are not synced.</p></article>');
make("backtest",'<article class="module-card"><h2>Backtest Results Calculator</h2><label>Enter historical trade outcomes in R units, separated by commas (e.g. 1.5, -1, 2, -1)</label><textarea id="btValues" rows="5" placeholder="1.5, -1, 2, -1, 0.5"></textarea><button id="btCalc">Calculate statistics</button><div id="btOut" class="module-result">No results calculated.</div><p class="module-muted">This only analyzes results you provide. It does not fetch historical XAUUSD candles.</p></article><article class="module-card"><h2>Statistics guide</h2><div class="module-muted"><p><b>Win rate:</b> percentage of positive-R trades.</p><p><b>Expectancy:</b> average R per trade.</p><p><b>Profit factor:</b> winning R divided by absolute losing R.</p><p><b>Max drawdown:</b> largest peak-to-trough decline in cumulative R.</p></div><div class="module-result">Use representative samples and account for fees and slippage.</div></article>');
const ids=["overview","tools","analysis","strategy","risklab","journal","backtest"];
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
 card.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><h2 style="margin:0">XAU/USD · XAUS SPOT</h2><span id="xausState" class="module-muted">Connecting to XAUS…</span></div><div style="display:flex;gap:24px;align-items:baseline;flex-wrap:wrap;margin:16px 0"><strong id="xausPrice" style="font-size:clamp(30px,5vw,46px);color:#f1d18a">—</strong><span id="xausUnit" class="module-muted">USD / troy ounce</span></div><div class="module-muted" id="xausMeta">Waiting for a verified quote…</div><div id="xausChart" style="height:150px;margin-top:14px;border:1px solid #29313e;border-radius:10px;background:#0b1017;display:grid;place-items:center;color:#93a0b2">Intraday history loading…</div><p class="module-muted" style="margin-bottom:0">Source: XAUS · Indicative spot mid-price, not a tradable broker quote. Updates are cached for up to 60 seconds. Signals remain WAIT until a separate validated signal engine is available.</p>';
 overview.insertBefore(card,overview.firstChild);
 const $=id=>card.querySelector("#"+id);
 const fmt=n=>Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
 function stateLabel(status,age){const lang=document.querySelector("#lang")?.value||"en";const words={en:{fresh:"LIVE · FRESH",stale:"STALE · LAST REAL QUOTE",unavailable:"UNAVAILABLE · NO PRICE"},ar:{fresh:"مباشر · حديث",stale:"قديم · آخر سعر حقيقي",unavailable:"غير متاح · لا يوجد سعر"},fr:{fresh:"DIRECT · À JOUR",stale:"ANCIEN · DERNIER COURS RÉEL",unavailable:"INDISPONIBLE"},es:{fresh:"EN VIVO · ACTUALIZADO",stale:"ANTIGUO · ÚLTIMO PRECIO REAL",unavailable:"NO DISPONIBLE"}};return (words[lang]||words.en)[status]||status.toUpperCase()}
 async function loadSpot(){
  try{
   const res=await fetch("https://xaus.com/api/v1/spot?compact=1",{cache:"no-store"});
   const data=await res.json();
   const generated=Date.parse(data.price_as_of||data.data_state?.as_of||data.updated_at||"");
   const age=Number.isFinite(generated)?Math.max(0,(Date.now()-generated)/1000):Infinity;
   const status=data?.data_state?.status;
   const fresh=status==="fresh"&&age<=180&&Number.isFinite(Number(data.spot_usd_oz));
   const stale=status==="stale"&&Number.isFinite(Number(data.spot_usd_oz))&&age<=300;
   if(!res.ok||(!fresh&&!stale)){
    $("xausPrice").textContent="—";
    $("xausState").textContent=stateLabel("unavailable");
    $("xausMeta").textContent="No verified recent quote. Trading signal: WAIT.";
    return;
   }
   $("xausPrice").textContent="$"+fmt(data.spot_usd_oz);
   $("xausState").textContent=stateLabel(fresh?"fresh":"stale");
   $("xausState").style.color=fresh?"#35c98a":"#f1d18a";
   const asOf=data.price_as_of||data.data_state?.as_of||data.updated_at;
   $("xausMeta").textContent="Price time: "+new Date(asOf).toLocaleString()+" UTC · API age: "+Math.round(age)+"s · "+(data.price_source||"xaus.com")+(fresh?"":" · Signal: WAIT");
  }catch(e){
   $("xausPrice").textContent="—";$("xausState").textContent=stateLabel("unavailable");$("xausMeta").textContent="XAUS connection failed. No price displayed; signal remains WAIT.";
  }
 }
 async function loadIntraday(){
  try{
   const res=await fetch("https://xaus.com/api/v1/intraday?symbol=xau&hours=24",{cache:"no-store"});
   const data=await res.json();
   if(!res.ok||data?.data_state?.status==="unavailable"||!Array.isArray(data.points)||data.points.length<2){$("xausChart").textContent="Intraday history not available yet.";return}
   const pts=data.points.filter(p=>Number.isFinite(Number(p.p))&&Number.isFinite(Number(p.t)));
   if(pts.length<2){$("xausChart").textContent="Not enough verified history yet.";return}
   const w=900,h=140,pad=12,vals=pts.map(p=>Number(p.p)),min=Math.min(...vals),max=Math.max(...vals),span=max-min||1;
   const path=pts.map((p,i)=>(i?"L":"M")+(pad+i/(pts.length-1)*(w-2*pad)).toFixed(1)+","+(h-pad-(Number(p.p)-min)/span*(h-2*pad)).toFixed(1)).join(" ");
   const svg='<svg viewBox="0 0 '+w+' '+h+'" width="100%" height="100%" preserveAspectRatio="none" role="img" aria-label="XAUS recorded XAUUSD intraday price history"><path d="'+path+'" fill="none" stroke="#d8ad53" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>';
   $("xausChart").innerHTML=svg;
   $("xausChart").title="XAUS first-party recorded spot observations · "+pts.length+" points · state: "+(data.data_state?.status||"unknown");
  }catch(e){$("xausChart").textContent="Could not load XAUS intraday history."}
 }
 loadSpot();loadIntraday();setInterval(loadSpot,60000);setInterval(loadIntraday,300000);
 document.querySelector("#lang")?.addEventListener("change",()=>{loadSpot()});
})(); 

/* Strategy Workbench — manual confluence and discipline checklist; never fabricates live signals */
(function(){
 const root=document.querySelector("#strategy");
 if(!root)return;
 const card=document.createElement("article");
 card.className="card wide";
 card.innerHTML='<h2>Multi-Strategy Workbench · XAU/USD</h2><p class="notice">Record what you actually see on your chart. This tool scores checklist confluence only; it does not read candles or generate a live BUY/SELL signal.</p><div class="module-grid" style="margin-top:12px">'+
 '<div class="module-card"><h2>Technical confluence</h2>'+
 '<label>Higher-timeframe trend</label><select id="swTrend"><option value="0">Not checked</option><option value="2">Bullish alignment</option><option value="2">Bearish alignment</option><option value="0">Sideways / mixed</option></select>'+
 '<label>Market structure</label><select id="swStructure"><option value="0">Not checked</option><option value="2">BOS confirmed</option><option value="2">CHOCH confirmed</option><option value="0">No clear structure</option></select>'+
 '<label>Key zone</label><select id="swZone"><option value="0">Not checked</option><option value="2">Support / demand reaction</option><option value="2">Resistance / supply reaction</option><option value="2">FVG / order-block confluence</option><option value="0">No clear zone</option></select>'+
 '<label>Entry confirmation</label><select id="swEntry"><option value="0">Not checked</option><option value="2">Engulfing / pin bar confirmed</option><option value="2">Breakout and retest confirmed</option><option value="2">Liquidity sweep and reclaim</option><option value="0">No confirmation</option></select>'+
 '<label>Momentum</label><select id="swMomentum"><option value="0">Not checked</option><option value="1">RSI / MACD supports setup</option><option value="0">Divergent or conflicting</option></select>'+
 '<label>Volatility and news</label><select id="swRisk"><option value="0">Not checked</option><option value="1">No major event / volatility risk</option><option value="0">Major event or abnormal volatility</option></select></div>'+
 '<div class="module-card"><h2>Psychology & execution</h2>'+
 '<label>Emotional state</label><select id="swEmotion"><option value="0">Not checked</option><option value="1">Calm and patient</option><option value="0">Fear, FOMO, anger or revenge</option></select>'+
 '<label>Trading discipline</label><select id="swDiscipline"><option value="0">Not checked</option><option value="1">Following written plan</option><option value="0">Outside the plan</option></select>'+
 '<label>Risk plan</label><select id="swRiskPlan"><option value="0">Not checked</option><option value="1">Stop and position risk defined</option><option value="0">Stop / size not verified</option></select>'+
 '<label>Reward-to-risk</label><select id="swRR"><option value="0">Not checked</option><option value="1">At least 1:2</option><option value="0">Below 1:2 / unclear</option></select>'+
 '<label>Market session</label><select id="swSession"><option value="0">Not checked</option><option value="1">Liquid session with clear movement</option><option value="0">Quiet / uncertain conditions</option></select>'+
 '<div id="swResult" class="module-result" aria-live="polite">Complete the checklist, then calculate confluence.</div><button id="swCalc" style="margin-top:10px">Calculate checklist score</button><p class="module-muted">Maximum 15 points. A high score is not proof of profitability; verify every setup with historical and forward testing.</p></div></div>';
 root.append(card);
 card.querySelector("#swCalc").addEventListener("click",()=>{
  const ids=["swTrend","swStructure","swZone","swEntry","swMomentum","swRisk","swEmotion","swDiscipline","swRiskPlan","swRR","swSession"];
  const score=ids.reduce((n,id)=>n+Number(card.querySelector("#"+id).value||0),0);
  const technical=ids.slice(0,6).reduce((n,id)=>n+Number(card.querySelector("#"+id).value||0),0);
  const psychology=ids.slice(6).reduce((n,id)=>n+Number(card.querySelector("#"+id).value||0),0);
  const blocked=["swRisk","swEmotion","swDiscipline","swRiskPlan"].some(id=>card.querySelector("#"+id).value==="0");
  const out=card.querySelector("#swResult");
  out.textContent="Checklist: "+score+"/15 · Technical: "+technical+"/10 · Psychology & execution: "+psychology+"/5. "+(blocked?"WAIT — one or more safety/discipline checks are incomplete or adverse.":"Checklist recorded. This is not a live signal; confirm candles, levels, spread and backtest before any decision.");
 });
})();

/* Historical OHLC engine: real candles + deterministic indicators; stays WAIT until validated */
(function(){
 const root=document.querySelector("#overview");
 if(!root)return;
 const panel=document.createElement("article");
 panel.className="module-card wide";
 panel.style.marginTop="16px";
 panel.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><h2 style="margin:0">XAU/USD · Historical Candle Engine</h2><span id="candleStatus" class="module-muted">NOT CHECKED</span></div>'+
 '<p class="module-muted">XAUS OHLC candles · 5m / 15m / 1h · EMA 20/50, RSI 14, MACD 12/26/9, ATR 14. A directional bias is analysis only, not a trade signal.</p>'+
 '<div class="module-grid" style="margin-top:12px">'+
 '<div class="module-card"><h2>Multi-timeframe analysis</h2><div id="candleRows" class="module-muted">Press refresh to load real candle data.</div><button id="candleRefresh" style="margin-top:12px">Load / refresh candles</button><p id="candleMeta" class="module-muted">Source: XAUS chart API · Yahoo Finance proxy · XAUUSD reference series.</p></div>'+
 '<div class="module-card"><h2>Signal gate</h2><div id="candleBias" class="module-result">WAIT · candle data not checked</div><div id="candleReason" class="module-muted" style="margin-top:10px">No BUY/SELL signal is enabled until a separate out-of-sample backtest passes.</div><div id="candleQuality" class="module-muted" style="margin-top:10px"></div></div></div>';
 root.append(panel);
 const $=id=>panel.querySelector("#"+id);
 const intervals=[{name:"5m",range:"5d",minutes:5},{name:"15m",range:"1mo",minutes:15},{name:"1h",range:"3mo",minutes:60}];
 const finite=n=>Number.isFinite(n);
 function normalize(raw){
  const rows=Array.isArray(raw)?raw:(raw?.points||raw?.candles||raw?.data||[]);
  return rows.map(x=>{
   const rawTime=x.t??x.time??x.timestamp??"",numericTime=Number(rawTime);\n  const t=finite(numericTime)?(numericTime<1e12?numericTime*1000:numericTime):Date.parse(rawTime);
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
  const line=[];
  for(let i=0;i<values.length;i++)line.push(ema(values.slice(0,i+1),12)-ema(values.slice(0,i+1),26));
  const valid=line.filter(finite),signal=ema(valid,9);
  return {line:valid[valid.length-1],signal,hist:valid[valid.length-1]-signal};
 }
 const fmt=n=>finite(n)?n.toFixed(2):"—";
 function showRows(items){
  $("candleRows").innerHTML="";
  const table=document.createElement("table");table.className="module-table";
  table.innerHTML="<thead><tr><th>TF</th><th>Bars</th><th>EMA20 / 50</th><th>RSI14</th><th>MACD hist</th><th>ATR14</th></tr></thead>";
  const body=document.createElement("tbody");
  items.forEach(x=>{const tr=document.createElement("tr");[x.tf,x.count,x.ema20&&x.ema50?fmt(x.ema20)+" / "+fmt(x.ema50):"—",fmt(x.rsi),fmt(x.macd?.hist),fmt(x.atr)].forEach(v=>{const td=document.createElement("td");td.textContent=String(v);tr.append(td)});body.append(tr)});
  table.append(body);$("candleRows").append(table);
 }
 async function load(){
  $("candleStatus").textContent="LOADING REAL CANDLES…";
  $("candleBias").textContent="WAIT · loading market data";
  $("candleReason").textContent="Checking candle coverage, timestamps and indicator inputs.";
  $("candleQuality").textContent="";
  try{
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
   $("candleMeta").textContent="Source: XAUS /api/v1/chart (XAU series via Yahoo Finance proxy). Refreshed: "+new Date().toLocaleString()+". Last forming candle excluded from indicators.";
  }catch(error){
   $("candleStatus").textContent="DATA UNAVAILABLE / STALE";
   $("candleStatus").style.color="#f16e72";
   $("candleBias").textContent="WAIT · NO VALID SIGNAL";
   $("candleReason").textContent=String(error.message||error)+". No fallback or simulated candles are used.";
   $("candleQuality").textContent="A valid, fresh OHLC history is required before analysis can continue.";
   $("candleRows").textContent="Candle validation failed.";
  }
 }
 $("candleRefresh").addEventListener("click",load);
})();

render();
})();