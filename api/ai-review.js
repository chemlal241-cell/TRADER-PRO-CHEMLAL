// Optional AI cross-check. Deterministic strategy rules remain the only source of prices and risk levels.
function send(res,status,data){res.status(status).setHeader("Cache-Control","no-store").json(data)}
module.exports=async function(req,res){
 const key=process.env.GEMINI_API_KEY;
 if(req.method==="GET")return send(res,200,{ok:true,configured:!!key,model:"gemini-2.5-flash"});
 if(req.method!=="POST"){res.setHeader("Allow","GET, POST");return send(res,405,{ok:false,error:"GET or POST only"})}
 if(!key)return send(res,503,{ok:false,configured:false,error:"GEMINI_API_KEY is not configured"});
 const body=req.body||{};const payload=body.analysis;
 if(!payload||typeof payload!=="object"||JSON.stringify(payload).length>12000)return send(res,400,{ok:false,error:"Invalid or oversized analysis payload"});
 const prompt="You are an independent risk-review assistant for a gold trading signal engine. Review ONLY the supplied structured market facts. Do not invent data, prices, news, DXY direction, chart patterns, or event times. You are not allowed to create or change BUY/SELL, entry, stop-loss, targets, or position size. If critical data is missing, stale, contradictory, high-impact event risk is active, or volume confirmation is absent, set approved=false. Otherwise approve only if the supplied technical and macro evidence is internally consistent. Return JSON only: {approved:boolean, riskLevel:'LOW'|'MEDIUM'|'HIGH', summary:string, conflicts:string[], missing:string[]}. Be conservative. This review is not a guarantee or financial advice.\nMARKET FACTS:\n"+JSON.stringify(payload);
 try{
  const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+encodeURIComponent(key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.1,maxOutputTokens:500,responseMimeType:"application/json"}}),signal:AbortSignal.timeout(12000)});
  const data=await r.json();if(!r.ok)throw new Error(data?.error?.message||"Gemini API HTTP "+r.status);
  const text=data?.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"";
  const parsed=JSON.parse(text.replace(/^```json\s*/i,"").replace(/\s*```$/,""));
  if(typeof parsed.approved!=="boolean")throw new Error("AI response did not include an approval decision");
  return send(res,200,{ok:true,configured:true,model:"gemini-2.5-flash",review:{approved:parsed.approved,riskLevel:["LOW","MEDIUM","HIGH"].includes(parsed.riskLevel)?parsed.riskLevel:"HIGH",summary:String(parsed.summary||"").slice(0,500),conflicts:Array.isArray(parsed.conflicts)?parsed.conflicts.slice(0,8).map(String):[],missing:Array.isArray(parsed.missing)?parsed.missing.slice(0,8).map(String):[]},updatedAt:new Date().toISOString()});
 }catch(e){return send(res,502,{ok:false,configured:true,error:String(e.message||e)})}
};
