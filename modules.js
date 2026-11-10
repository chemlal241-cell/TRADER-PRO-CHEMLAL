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
 card.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><h2 style="margin:0">XAU/USD · XAUS SPOT</h2><span id="xausState" class="module-muted">Connecting to XAUS…</span></div><div style="display:flex;gap:24px;align-items:baseline;flex-wrap:wrap;margin:16px 0"><strong id="xausPrice" style="font-size:clamp(30px,5vw,46px);color:#f1d18a">—</strong><span id="xausUnit" class="module-muted">USD / troy ounce</span></div><div class="module-muted" id="xausMeta">Waiting for a verified quote…</div><div style="margin-top:14px;border:1px solid #29313e;border-radius:12px;overflow:hidden;background:#0b1017"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 12px;background:#111720"><b style="color:#f1d18a">TradingView · OANDA:XAUUSD</b><span class="module-muted">Interactive chart</span></div><iframe title="TradingView OANDA XAUUSD live chart" src="https://www.tradingview.com/widgetembed/?frameElementId=tradingview_xauusd&symbol=OANDA%3AXAUUSD&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=111720&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en" style="display:block;width:100%;height:520px;border:0" loading="lazy" allowtransparency="true" allowfullscreen></iframe></div><p class="module-muted" style="margin-bottom:0">Chart source: TradingView · OANDA:XAUUSD. Choose timeframes and chart tools inside the widget. The separate XAUS quote above is indicative spot data; broker prices may differ. The chart does not itself validate or generate BUY/SELL signals.</p>';
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
 loadSpot();setInterval(loadSpot,60000);
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
 panel.innerHTML+='<div class="module-card" style="margin-top:14px"><h2>Smart Money Concepts · Advanced Strategy Matrix</h2><p class="module-muted">Computed from the same validated closed OHLC candles. These are rule-based observations, not guaranteed setups or a validated trading edge.</p><div id="advancedStatus" class="module-result">WAIT · awaiting verified candles</div><div id="advancedRows" class="module-muted" style="margin-top:10px">Advanced analysis will appear after candle validation.</div><div id="advancedPlan" class="module-result" style="margin-top:12px">Entry / SL / TP: WAIT until enough independent confluences are present and the strategy passes out-of-sample validation.</div><p class="module-muted" style="margin-top:10px">News calendar and DXY are not connected. Do not trade through CPI, NFP or FOMC without checking a reliable live calendar. Volume/VWAP are omitted when source volume is missing or synthetic.</p></div>';
 function updateLivePanel(signal,description,biasLabel,plan){
  const strong=root.querySelector(".card .signal strong");
  const desc=root.querySelector('.card .signal [data-i="waitDesc"]');
  if(strong){strong.textContent=signal;strong.style.color=plan?(plan.side==="BUY"?"#35dc85":"#ff777d"):"#f3d99d";}
  if(desc)desc.textContent=description;
  const levels=root.querySelectorAll(".card .metrics .metric b");
  const values=plan?[plan.entry,plan.sl,plan.tp1,plan.tp2,plan.tp3]:["—","—","—","—","—"];
  levels.forEach((el,i)=>{if(el)el.textContent=plan&&Number.isFinite(values[i])?"$"+fmt(values[i]):"—"});
  const context=root.querySelectorAll(".card")[1];
  if(context){
   const rows=context.querySelectorAll(".list b");
   if(rows[0])rows[0].textContent=biasLabel||"—";
   if(rows[3])rows[3].textContent=plan?"PAPER CANDIDATE · NOT VALIDATED":"NOT VALIDATED";
  }
 }
 async function getFreshSpot(){
  try{
   const response=await fetch("https://xaus.com/api/v1/spot?compact=1",{cache:"no-store"});
   const data=await response.json();
   const stamp=Date.parse(data.price_as_of||data.data_state?.as_of||data.updated_at||"");
   const age=Number.isFinite(stamp)?Math.max(0,(Date.now()-stamp)/1000):Infinity;
   const ok=response.ok&&data.data_state?.status==="fresh"&&age<=180&&Number.isFinite(Number(data.spot_usd_oz));
   return {ok,price:Number(data.spot_usd_oz),age};
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
 function analyzeAdvanced(results){
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
  const rsiVal=rsi(closes),macdVal=macd(closes);
  const vwapRows=rows.slice(-48),hasVolume=vwapRows.some(x=>x.v>0),vwap=hasVolume?vwapRows.reduce((a,x)=>a+((x.h+x.l+x.c)/3)*x.v,0)/vwapRows.reduce((a,x)=>a+x.v,0):null;
  const bullDiv=p.lows.length>=2&&rsiVal!==null&&p.lows[p.lows.length-1].p<p.lows[p.lows.length-2].p&&rsi(closes.slice(0,p.lows[p.lows.length-1].i+1))>rsi(closes.slice(0,p.lows[p.lows.length-2].i+1));
  const bearDiv=p.highs.length>=2&&rsiVal!==null&&p.highs[p.highs.length-1].p>p.highs[p.highs.length-2].p&&rsi(closes.slice(0,p.highs[p.highs.length-1].i+1))<rsi(closes.slice(0,p.highs[p.highs.length-2].i+1));
  const upTrend=hhhl||bosUp||ema9>ema21&&ema21>ema50,downTrend=lhll||bosDown||ema9<ema21&&ema21<ema50;
  const bullSweepShift=sweepLow&&chochUp&&last.c>last.o;
  const bearSweepShift=sweepHigh&&chochDown&&last.c<last.o;
  const adxStrong=Number.isFinite(adxVal)&&adxVal>=20;
  const vwapBull=vwap!==null&&last.c>vwap,vwapBear=vwap!==null&&last.c<vwap;
  const bbStretchBull=!!bb&&last.c<bb.lower,bbStretchBear=!!bb&&last.c>bb.upper;
  const bullish=[hhhl,bosUp,chochUp,sweepLow,zone==="DISCOUNT",fvg==="Bullish FVG",ob==="Potential Bullish OB",ema9>ema21,rsiVal>50,macdVal?.hist>0,bullDiv,bullSweepShift,vwapBull,adxStrong].filter(Boolean).length;
  const bearish=[lhll,bosDown,chochDown,sweepHigh,zone==="PREMIUM",fvg==="Bearish FVG",ob==="Potential Bearish OB",ema9<ema21,rsiVal<50,macdVal?.hist<0,bearDiv,bearSweepShift,vwapBear,adxStrong].filter(Boolean).length;
  const direction=bullish>bearish?"BUY BIAS":bearish>bullish?"SELL BIAS":"MIXED";
  const score=Math.max(bullish,bearish),total=14,confluencePct=score/total*100,rrReady=confluencePct>=85&&Math.abs(bullish-bearish)>=4;
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
  const lines=[
   ["Structure",hhhl?"HH / HL bullish":lhll?"LH / LL bearish":"Range / mixed", "BOS "+(bosUp?"up":bosDown?"down":"none")+" · CHoCH "+(chochUp?"bullish":chochDown?"bearish":"none")],
   ["Liquidity", "EQH "+(eqh?"yes":"no")+" / EQL "+(eql?"yes":"no"),"Sweep "+(sweepLow?"sell-side reclaimed":sweepHigh?"buy-side rejected":"none confirmed")],
   ["S/R flip + round levels","Resistance→support "+(srFlipUp?"candidate":"no")+" · Support→resistance "+(srFlipDown?"candidate":"no"),"Nearest $50 levels: "+roundLevels.map(fmt).join(" / ")],
   ["Order blocks / S&D",ob,obLevel?fmt(obLevel[0])+" – "+fmt(obLevel[1]):"No qualified recent displacement zone"],
   ["Fair Value Gap",fvg,fvgLevel?fmt(fvgLevel[0])+" – "+fmt(fvgLevel[1]):"No 3-candle gap"],
   ["Premium / Discount",zone,"50% range "+fmt(midpoint)+" · "+(zone==="DISCOUNT"?"discount buys preferred":zone==="PREMIUM"?"premium sells preferred":"mid-range")],
   ["Fibonacci / OTE",fib?fib.direction+" · 0.50 "+fmt(fib.r50)+" · 0.618 "+fmt(fib.r618)+" · 0.705 "+fmt(fib.r705)+" · 0.786 "+fmt(fib.r786):"No chronological confirmed swing leg","Extensions 1.272 "+fmt(fib?.e1272)+" · 1.618 "+fmt(fib?.e1618)],
   ["Sweep + reclaim + CHoCH",bullSweepShift?"Bullish sell-side sweep → reclaim → CHoCH":bearSweepShift?"Bearish buy-side sweep → rejection → CHoCH":"No complete sweep/reclaim + CHoCH trigger","A liquidity sweep alone is not an entry trigger"],
   ["Trend indicators","EMA9 "+fmt(ema9)+" · EMA21 "+fmt(ema21)+" · EMA50 "+fmt(ema50)+" · EMA200 "+fmt(ema200),"SuperTrend "+(st?.direction||"n/a")+" · ADX "+fmt(adxVal)],
   ["Ichimoku / Momentum","Tenkan "+fmt(ichi?.tenkan)+" · Kijun "+fmt(ichi?.kijun),"RSI "+fmt(rsiVal)+" · MACD hist "+fmt(macdVal?.hist)+" · Stoch "+fmt(stoch)],
   ["Bollinger / VWAP","BB "+(bb?"L "+fmt(bb.lower)+" / U "+fmt(bb.upper):"n/a")+" · stretch "+(bbStretchBull?"below lower":bbStretchBear?"above upper":"no outer-band stretch"),"VWAP "+(vwap!==null?fmt(vwap)+" · control "+(vwapBull?"buyers above VWAP":vwapBear?"sellers below VWAP":"at VWAP"):"not shown: volume absent/unverified")],
   ["Candles / patterns",patternText,"Divergence "+(bullDiv?"bullish":bearDiv?"bearish":"none confirmed")],
   ["Sessions","London "+(londonOn?"OPEN":"closed")+" · New York "+(nyOn?"OPEN":"closed"),"Times from live timezone clock; session overlap only when both open"],
   ["Trendlines / channels / formations","Swing highs: "+(ph.length===2?(ph[1].p>ph[0].p?"rising":ph[1].p<ph[0].p?"falling":"flat"):"insufficient pivots")+" · swing lows: "+(pl.length===2?(pl[1].p>pl[0].p?"rising":pl[1].p<pl[0].p?"falling":"flat"):"insufficient pivots"),"Double tops/bottoms, H&S, triangles, wedges and flags require chart-level visual confirmation"],
   ["News / DXY","Investing.com headlines feed linked in News panel; not an event-risk filter","Economic calendar/CPI/NFP/FOMC schedule and DXY live series are not connected; avoid entries around high-impact releases"]
  ];
  const host=$("advancedRows");host.innerHTML="";
  const table=document.createElement("table");table.className="module-table";
  const body=document.createElement("tbody");
  lines.forEach(a=>{const tr=document.createElement("tr");a.forEach((v,i)=>{const td=document.createElement("td");td.textContent=v;tr.append(td)});body.append(tr)});
  table.append(body);host.append(table);
  $("advancedStatus").textContent="ANALYSIS UPDATED · "+direction+" · confluence "+score+"/"+total+" · "+(adxStrong?"ADX trend strength confirmed":"ADX trend strength weak/unknown")+" (not probability)";
  const structureTrigger=side==="BUY"?(bullSweepShift||bosUp||srFlipUp):(bearSweepShift||bosDown||srFlipDown);
  const h1Bull=h.ema20>h.ema50,m15Bull=m.ema20>m.ema50&&m.macd?.hist>0&&m.rsi>50;
  const h1Bear=h.ema20<h.ema50,m15Bear=m.ema20<m.ema50&&m.macd?.hist<0&&m.rsi<50;
  const aligned=side==="BUY"?(h1Bull&&m15Bull):(h1Bear&&m15Bear);
  const candidate=!!(side&&rrReady&&risk>0&&atrNow>0&&structureTrigger&&aligned&&[entry,sl,tp1,tp2,tp3].every(Number.isFinite));
  $("advancedPlan").textContent=candidate?"PAPER-ONLY "+side+" SETUP · Entry "+fmt(entry)+" · SL "+fmt(sl)+" · TP1 "+fmt(tp1)+" · TP2 "+fmt(tp2)+" · TP3 "+fmt(tp3)+" · confluence "+score+"/"+total+" ("+confluencePct.toFixed(1)+"%) · 1h/15m aligned · Historical win rate: N/A (no validated strategy backtest yet) · NOT VALIDATED; paper-only.":"WAIT · requires at least 85% confluence (12/14 factors), 4-point directional separation, confirmed structure, 1h/15m alignment and valid risk levels.";
  return candidate?{side,entry,sl,tp1,tp2,tp3,score,total,atr:atrNow,time:m.last?.t||last.t}:null;
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
   const candidate=analyzeAdvanced(results);
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
    updateLivePanel(candidate.side+" CANDIDATE · PAPER ONLY",candidate.side+" setup from closed candles; fresh XAUS spot $"+spot.price.toFixed(2)+" USD/oz. Entry/SL/TP are technical estimates, not validated trade instructions. Historical strategy win rate: N/A (no validated backtest sample). Paper-test only.",bias,candidate);
   }else if(candidate){
    updateLivePanel("WAIT · PRICE MOVED","A "+candidate.side+" setup was detected, but current spot is too far from its candle entry. Wait for a new closed-candle setup; no chasing.",bias);
   }else if(spot.ok){
    updateLivePanel("WAIT · "+bias+" BIAS","Fresh XAUS spot $"+spot.price.toFixed(2)+" USD/oz and verified 5m/15m/1h candles. Strategy conditions are not sufficiently aligned for a BUY/SELL candidate.",bias);
   }else{
    updateLivePanel("WAIT","Candles are verified, but no fresh XAUS spot quote is confirmed. No trade recommendation.",bias);
   }
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
 // Start automatically when Live Signals initializes; refresh every 2 minutes.
 load();
 refreshTimer=setInterval(()=>{if(!document.hidden)load()},120000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)load()});
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


/* Strategy Library catalogue — structured templates for XAUUSD; educational, not trade calls */
(function(){
 const root=document.querySelector("#strategy");
 if(!root||root.dataset.catalogReady)return;
 root.dataset.catalogReady="1";
 const intro=root.querySelector(":scope > .card");
 if(intro)intro.innerHTML='<h2>Strategy library · XAU/USD</h2><p class="notice">19 structured strategy templates across Smart Money Concepts, trend & momentum, price action, and market context. Each template explains its method, confirmation and invalidation. Select a category to explore.</p><div class="module-muted">Important: indicator observations are calculated only when validated candles are available; chart formations and event context may require manual confirmation. No template independently authorizes a live BUY/SELL.</div>';
 const panel=document.createElement("article");
 panel.className="module-card wide";
 panel.style.marginTop="14px";
 panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="margin:0">Strategy Library · 19 setups</h2><span class="module-muted">XAU/USD · educational playbook</span></div>'+
 '<div id="slFilters" style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0"></div>'+
 '<div id="slCount" class="module-muted" style="margin-bottom:10px"></div>'+
 '<div id="slCards" class="module-grid"></div>'+
 '<p class="module-muted" style="margin:14px 0 0">Risk rule: define invalidation and position size before entry. Avoid trading during unverified high-impact events. Backtest with spread/slippage and forward-test on demo before considering any strategy.</p>';
 root.prepend(panel);
 const strategies=[
  {cat:"smc",name:"Market Structure · BOS / CHoCH",status:"Candle engine",method:"Track confirmed swing highs/lows; BOS is a break in the prevailing swing, while CHoCH is an early structural shift.",confirm:"Wait for a closed candle beyond the relevant swing, then assess retest and higher-timeframe alignment.",invalid:"A close back through the broken structure or a fresh opposing swing invalidates the idea.",tf:"15m / 1h / 4h"},
  {cat:"smc",name:"Liquidity Sweep & Reclaim",status:"Candle engine · candidate",method:"Mark equal highs/lows and prior session extremes; watch for a wick through liquidity followed by a close back inside.",confirm:"Require reclaim plus a subsequent CHoCH/BOS and clear risk location; sweep alone is not an entry.",invalid:"Price accepts beyond the swept level or fails to reclaim it.",tf:"5m / 15m with 1h context"},
  {cat:"smc",name:"Order Blocks · Supply & Demand",status:"Candle engine · potential zones",method:"Identify the last opposing candle before a strong displacement that breaks a meaningful level; treat the candle range as a potential zone.",confirm:"Look for return to zone, rejection, structure shift and acceptable reward-to-risk.",invalid:"A decisive close through the zone; zones are candidates, not guaranteed institutional orders.",tf:"15m / 1h / 4h"},
  {cat:"smc",name:"Fair Value Gap · 3-candle imbalance",status:"Candle engine",method:"Detect a three-candle gap where candle 1 high/low does not overlap candle 3 low/high.",confirm:"Prefer a retrace into the gap aligned with trend, structure and a rejection trigger.",invalid:"Full close-through or opposing structure break; not every gap must fill.",tf:"5m / 15m / 1h"},
  {cat:"smc",name:"Premium / Discount",status:"Candle engine",method:"Use the midpoint of a defined dealing range; below midpoint is discount, above midpoint is premium.",confirm:"Seek longs in discount or shorts in premium only with structure and a valid trigger.",invalid:"The dealing range changes after a new confirmed swing; never use midpoint alone.",tf:"15m / 1h / 4h"},
  {cat:"smc",name:"Fibonacci OTE & Extensions",status:"Candle engine · swing dependent",method:"Anchor Fibonacci to a confirmed chronological swing leg; monitor 0.50, 0.618, 0.705 and 0.786 retracements, plus 1.272/1.618 extensions.",confirm:"Require confluence with structure, OB/FVG or liquidity and a candle trigger inside the zone.",invalid:"The swing anchor is broken or the assumed impulse structure fails.",tf:"15m / 1h / 4h"},
  {cat:"smc",name:"S/R Flip & Round Numbers",status:"Candle engine · candidate",method:"Track prior support/resistance after a break and retest; note nearby $50 round-number levels as attention zones.",confirm:"Require a close through the level and a successful retest/rejection; combine with trend context.",invalid:"Price reclaims the old side and closes back through the level.",tf:"5m / 15m / 1h"},
  {cat:"trend",name:"EMA Trend Stack · 9 / 21 / 50 / 200",status:"Candle engine",method:"Use EMA alignment and slope to classify trend and pullback context; 200 EMA is a broad regime reference.",confirm:"Look for aligned stack, pullback toward 9/21 or 50, then a closed-candle continuation trigger.",invalid:"EMA stack collapses or price closes through the structural swing against the position.",tf:"15m / 1h / 4h"},
  {cat:"trend",name:"SuperTrend + ADX Filter",status:"Candle engine · approximation",method:"Use SuperTrend direction as a trend-following guide and ADX as trend-strength context; ADX does not indicate direction.",confirm:"Trade only with directional agreement and adequate ADX strength, then wait for a pullback/continuation trigger.",invalid:"SuperTrend flips or price invalidates the latest swing; avoid low-ADX chop.",tf:"15m / 1h"},
  {cat:"trend",name:"Ichimoku Cloud",status:"Candle engine",method:"Compare price with Kumo and Tenkan/Kijun alignment to assess trend, balance and dynamic support/resistance.",confirm:"Prefer price above cloud with Tenkan above Kijun for bullish continuation, or inverse for bearish; wait for close.",invalid:"Price returns into/through cloud and Tenkan/Kijun alignment reverses.",tf:"1h / 4h"},
  {cat:"trend",name:"RSI + MACD + Stochastic",status:"Candle engine",method:"Use RSI for momentum regime, MACD histogram/line for momentum change, and Stochastic for timing in ranges.",confirm:"Require agreement with structure; use oscillator extremes only as context, never as a standalone reversal signal.",invalid:"Momentum diverges against the setup or structure breaks.",tf:"5m / 15m / 1h"},
  {cat:"trend",name:"Bollinger Bands · Volatility",status:"Candle engine",method:"Use band expansion/contraction and closes outside bands to assess volatility; outer-band touches can persist in strong trends.",confirm:"For mean reversion, require rejection and range context; for breakout, require expansion and retest.",invalid:"Band-walk/strong trend invalidates fading an outer-band touch; breakout failure returns inside range.",tf:"5m / 15m / 1h"},
  {cat:"trend",name:"VWAP + Volume Context",status:"Conditional · volume required",method:"Compare price with session/rolling VWAP only when source volume is valid and meaningful.",confirm:"Use VWAP reclaim/rejection with structure and genuine volume confirmation.",invalid:"Price accepts on the opposite side; if volume is missing or synthetic, do not use VWAP.",tf:"5m / 15m"},
  {cat:"price",name:"Candlestick Price Action",status:"Candle engine · candidates",method:"Recognize engulfing, pin bar/hammer, shooting star, doji, marubozu and multi-candle reversal candidates at meaningful levels.",confirm:"Pattern must close, occur at a pre-marked zone and have follow-through/structure confirmation.",invalid:"Pattern extreme is broken or next candles show no follow-through.",tf:"5m / 15m / 1h"},
  {cat:"price",name:"RSI Divergence",status:"Candle engine · candidate",method:"Compare confirmed price swing highs/lows with RSI swings for regular bullish/bearish divergence candidates.",confirm:"Wait for a structure shift or break of a local trigger; divergence alone can persist for a long time.",invalid:"Price makes a fresh continuation extreme and momentum resumes with trend.",tf:"15m / 1h"},
  {cat:"price",name:"Trendlines & Channels",status:"Manual chart confirmation",method:"Connect at least two meaningful swing points and treat a third touch as a possible test, not proof.",confirm:"Require a closed break and retest or a clear rejection at channel boundary.",invalid:"Line is redrawn by new structure or price accepts back inside after breakout.",tf:"15m / 1h / 4h"},
  {cat:"price",name:"Chart Patterns · Double Top/Bottom, H&S, Triangles, Wedges, Flags",status:"Visual confirmation required",method:"Identify pattern geometry and neckline/boundary from the actual chart; the engine does not certify these formations automatically.",confirm:"Wait for neckline/boundary close, retest and volume/volatility context where available.",invalid:"Pattern boundary fails or price breaks the opposite side.",tf:"15m / 1h / 4h"},
  {cat:"context",name:"London & New York Sessions",status:"Session clock",method:"Use London and New York session times and overlap as liquidity/context windows, accounting for daylight-saving changes.",confirm:"Trade only when a separate technical setup is present; session open is not a signal.",invalid:"Liquidity is thin, spread widens, or market is range-bound.",tf:"Intraday"},
  {cat:"context",name:"News · Economic Calendar · DXY Filter",status:"Partially connected / manual",method:"Investing.com headlines are shown in the News panel; the live economic calendar event filter and DXY live series are not connected.",confirm:"Manually verify CPI, NFP, FOMC and high-impact USD events from a trusted calendar; stand aside around unpredictable releases.",invalid:"Event risk is unknown or feed is stale; treat the filter as unavailable.",tf:"Before every session"}
 ];
 const cats=[["all","All strategies"],["smc","Smart Money Concepts"],["trend","Trend & indicators"],["price","Price action"],["context","Sessions & news"]];
 const filters=panel.querySelector("#slFilters"),cards=panel.querySelector("#slCards"),count=panel.querySelector("#slCount");
 let active="all";
 function render(){
  filters.innerHTML="";
  cats.forEach(([id,label])=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.style.background=active===id?"#d8ad53":"#171d27";b.style.color=active===id?"#17120a":"#eef1f5";b.style.border=active===id?"1px solid #f1d18a":"1px solid #29313e";b.addEventListener("click",()=>{active=id;render()});filters.append(b)});
  const shown=strategies.filter(x=>active==="all"||x.cat===active);
  count.textContent=shown.length+" strategy templates · statuses distinguish calculated observations from manual checks and unavailable data.";
  cards.innerHTML="";
  shown.forEach(x=>{
   const article=document.createElement("article");article.className="module-card";
   const h=document.createElement("h2");h.textContent=x.name;h.style.marginBottom="8px";
   const badge=document.createElement("div");badge.className="module-muted";badge.textContent="STATUS · "+x.status;badge.style.color="#d8ad53";badge.style.marginBottom="10px";
   article.append(h,badge);
   [["Method",x.method],["Confirmation",x.confirm],["Invalidation",x.invalid],["Typical timeframes",x.tf]].forEach(([label,value])=>{
    const p=document.createElement("p");p.className="module-muted";p.style.margin="7px 0";const strong=document.createElement("b");strong.textContent=label+": ";strong.style.color="#eef1f5";p.append(strong,document.createTextNode(value));article.append(p);
   });
   cards.append(article);
  });
 }
 render();
})();


/* Forex session clock — all displayed session hours converted to Morocco time */
(function(){
 const root=document.querySelector("#overview");
 if(!root||root.querySelector("#marketSessions"))return;
 const panel=document.createElement("article");
 panel.id="marketSessions";panel.className="module-card wide";panel.style.marginTop="16px";
 panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h2 style="margin:0">Global Trading Sessions</h2><span id="sessionMoroccoTime" class="module-muted">توقيت المغرب · —</span></div><p class="module-muted" style="margin:8px 0 14px">جميع أوقات الافتتاح والإغلاق بتوقيت المغرب (Africa/Casablanca). الأخضر = الجلسة مفتوحة · الرمادي = مغلقة. تتغير الأوقات تلقائياً مع التوقيت الصيفي في البلدان المعنية.</p><div id="sessionCards" class="module-grid"></div>';
 root.append(panel);
 const sessions=[
  {name:"Asia · Tokyo",tz:"Asia/Tokyo",start:9,end:18},
  {name:"London",tz:"Europe/London",start:8,end:17},
  {name:"New York",tz:"America/New_York",start:8,end:17}
 ];
 const $=id=>panel.querySelector("#"+id);
 const formatter=(tz)=>new Intl.DateTimeFormat("en-GB",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short",hourCycle:"h23"});
 const parts=(date,tz)=>Object.fromEntries(formatter(tz).formatToParts(date).map(p=>[p.type,p.value]));
 function zonedDate(y,m,d,h,tz){
  const target=Date.UTC(y,m-1,d,h,0,0);let guess=target;
  for(let n=0;n<3;n++){
   const p=parts(new Date(guess),tz);
   const represented=Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute),0);
   guess+=target-represented;
  }
  return new Date(guess);
 }
 const moroccoTime=d=>new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Casablanca",hour:"2-digit",minute:"2-digit",hour12:false}).format(d);
 function render(){
  const now=new Date(),morocco=new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Casablanca",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
  $("sessionMoroccoTime").textContent="توقيت المغرب · "+morocco;
  $("sessionCards").innerHTML=sessions.map(s=>{
   const p=parts(now,s.tz),weekday=["Mon","Tue","Wed","Thu","Fri"].includes(p.weekday);
   const y=Number(p.year),m=Number(p.month),d=Number(p.day);
   const startUtc=zonedDate(y,m,d,s.start,s.tz),endUtc=zonedDate(y,m,d,s.end,s.tz);
   const open=weekday&&now>=startUtc&&now<endUtc;
   const status=open?"الجلسة مفتوحة الآن":"الجلسة مغلقة";
   const color=open?"#35c98a":"#9aa3ad",bg=open?"#103323":"#20252d",border=open?"#26764a":"#4a515b";
   return '<div class="module-card" style="border-color:'+border+'"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h2 style="margin:0;color:#f1d18a">'+s.name+'</h2><span style="padding:5px 9px;border-radius:20px;background:'+bg+';color:'+color+';font-size:11px;font-weight:800">● '+status+'</span></div><div style="font-size:25px;font-weight:800;color:#fff;margin:13px 0 5px">'+moroccoTime(startUtc)+' – '+moroccoTime(endUtc)+'</div><div class="module-muted">موعد الجلسة بتوقيت المغرب</div><div class="module-muted" style="margin-top:5px">'+(weekday?"جدول أيام العمل":"عطلة نهاية الأسبوع · مغلقة عادةً")+'</div></div>';
  }).join("");
 }
 render();setInterval(render,15000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)render()});
})();
