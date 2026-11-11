// Official macro calendar + US Dollar Index + COMEX gold-futures volume context.
const BLS_ICS="https://www.bls.gov/schedule/news_release/bls.ics";
const FED_CAL="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";
const YAHOO="https://query1.finance.yahoo.com/v8/finance/chart/";
const MONTHS={January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11};
function send(res,status,data){res.status(status).setHeader("Cache-Control","s-maxage=60, stale-while-revalidate=120").json(data)}
async function get(url){const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 TRADER-PRO-CHEMLAL/1.0","Accept":"text/calendar,text/html,application/json,*/*"},signal:AbortSignal.timeout(9000)});if(!r.ok)throw new Error("HTTP "+r.status+" for "+url);return r}
async function yahoo(symbol){
 const r=await get(YAHOO+encodeURIComponent(symbol)+"?range=1d&interval=5m");
 const j=await r.json(),x=j?.chart?.result?.[0];if(!x)throw new Error("Yahoo chart data unavailable for "+symbol);
 const q=x.indicators?.quote?.[0]||{},ts=x.timestamp||[],cl=q.close||[],vol=q.volume||[];
 const bars=ts.map((t,i)=>({time:t*1000,close:Number(cl[i]),volume:Number(vol[i]||0)})).filter(b=>Number.isFinite(b.close)&&b.close>0);
 if(!bars.length)throw new Error("No recent bars for "+symbol);
 return {meta:x.meta||{},bars};
}
function easternToUtc(y,mo,d,h,mi){
 const guess=Date.UTC(y,mo,d,h,mi);
 const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",timeZoneName:"shortOffset",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date(guess));
 const z=parts.find(p=>p.type==="timeZoneName")?.value||"GMT-5",m=z.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
 const offset=m?(m[1]==="-"?-1:1)*(Number(m[2])*60+Number(m[3]||0)):-300;
 return guess-offset*60000;
}
function parseIcsDate(line){
 const m=line.match(/(?:DTSTART)(?:;TZID=([^:;]+))?(?:;VALUE=DATE)?:(\d{8})(?:T(\d{6})Z?)?/);if(!m)return null;
 const zone=m[1]||"",d=m[2],t=m[3]||"000000",y=+d.slice(0,4),mo=+d.slice(4,6)-1,day=+d.slice(6,8),h=+t.slice(0,2),mi=+t.slice(2,4),s=+t.slice(4,6);
 if(/Z$/.test(line))return Date.UTC(y,mo,day,h,mi,s);
 if(zone==="America/New_York")return easternToUtc(y,mo,day,h,mi)+s*1000;
 return Date.UTC(y,mo,day,h,mi,s);
}
function parseBls(ics){
 const unfolded=ics.replace(/\r?\n[ \t]/g,"").split(/\r?\n/),events=[];let cur=null;
 for(const line of unfolded){
  if(line==="BEGIN:VEVENT")cur={};
  else if(line==="END:VEVENT"&&cur){
   const title=String(cur.title||"");
   if(/Consumer Price Index|Employment Situation/i.test(title)&&cur.time){
    events.push({type:/Consumer Price Index/i.test(title)?"CPI":"NFP",title,time:cur.time,source:"BLS",url:"https://www.bls.gov/schedule/news_release/bls.ics"});
   }cur=null;
  }else if(cur){
   if(line.startsWith("DTSTART"))cur.time=parseIcsDate(line);
   if(line.startsWith("SUMMARY:"))cur.title=line.slice(8).replace(/\\,/g,",").replace(/\\;/g,";");
  }
 }
 return events;
}
function parseFed(html,year){
 const text=html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ");
 const re=new RegExp(year+" FOMC Meetings([\\s\\S]*?)(?="+(year-1)+" FOMC Meetings|"+(year+1)+" FOMC Meetings|$)","i");
 const section=text.match(re)?.[1]||"";
 const events=[],months=Object.keys(MONTHS),rx=new RegExp("\\b("+months.join("|")+")\\s+(\\d{1,2})\\s*[-–]\\s*(\\d{1,2})\\*?","g");let m;
 while((m=rx.exec(section))!==null){
  const month=MONTHS[m[1]],day=Number(m[3]),time=easternToUtc(year,month,day,14,0);
  events.push({type:"FOMC",title:"FOMC rate decision / statement (meeting day 2)",time,source:"Federal Reserve",url: FED_CAL});
 }
 return events;
}
module.exports=async function(req,res){
 if(req.method!=="GET"){res.setHeader("Allow","GET");return send(res,405,{ok:false,error:"GET only"})}
 const year=new Date().getUTCFullYear();
 const tasks=await Promise.allSettled([
  (async()=>{const [ics,html]=await Promise.all([get(BLS_ICS).then(r=>r.text()),get(FED_CAL).then(r=>r.text())]);return [...parseBls(ics),...parseFed(html,year)]})(),
  yahoo("DX-Y.NYB"),
  yahoo("GC=F")
 ]);
 const now=Date.now(),calendar=tasks[0].status==="fulfilled"?tasks[0].value:[],dxy=tasks[1].status==="fulfilled"?tasks[1].value:null,gold=tasks[2].status==="fulfilled"?tasks[2].value:null;
 const events=calendar.filter(e=>e.time>=now-60*60*1000&&e.time<=now+14*86400000).sort((a,b)=>a.time-b.time);
 const event=events.find(e=>now>=e.time-15*60000&&now<=e.time+10*60000)||null;
 let dxyData=null;
 if(dxy){const bars=dxy.bars,latest=bars[bars.length-1],meta=dxy.meta,prev=Number(meta.chartPreviousClose||meta.previousClose),pct=prev>0?(latest.close-prev)/prev*100:null,age=Math.max(0,(now-latest.time)/1000);dxyData={symbol:"DX-Y.NYB",name:"US Dollar Index",price:latest.close,previousClose:prev||null,changePct:pct,asOf:new Date(latest.time).toISOString(),ageSeconds:age,fresh:age<=1800,source:"Yahoo Finance · ICE DXY"}}
 let volume=null;
 if(gold){const bars=gold.bars.filter(x=>x.volume>0),last=bars[bars.length-1],recent=bars.slice(-21),base=recent.length>1?recent.slice(0,-1).reduce((a,b)=>a+b.volume,0)/(recent.length-1):0,vwapDen=recent.reduce((a,b)=>a+b.volume,0),vwap=vwapDen?recent.reduce((a,b)=>a+b.close*b.volume,0)/vwapDen:null;volume=last?{symbol:"GC=F",name:"COMEX Gold Futures",lastVolume:last.volume,averageVolume:base,volumeRatio:base?last.volume/base:null,futuresPrice:last.close,vwap,asOf:new Date(last.time).toISOString(),ageSeconds:Math.max(0,(now-last.time)/1000),fresh:now-last.time<=30*60000,source:"Yahoo Finance · COMEX futures volume proxy"}:null}
 const calendarOk=tasks[0].status==="fulfilled";
 return send(res,200,{ok:true,updatedAt:new Date().toISOString(),calendar:{ok:calendarOk,events,activeRisk:event,source:"BLS official release calendar + Federal Reserve FOMC calendar",error:tasks[0].status==="rejected"?String(tasks[0].reason?.message||tasks[0].reason):null},dxy:{ok:!!dxyData&&dxyData.fresh,data:dxyData,error:tasks[1].status==="rejected"?String(tasks[1].reason?.message||tasks[1].reason):null},goldFutures:{ok:!!volume&&volume.fresh&&volume.vwap!==null,data:volume,error:tasks[2].status==="rejected"?String(tasks[2].reason?.message||tasks[2].reason):null}});
};
