import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, useRef, useCallback } from "react";
// RACKLE — Daily Charleston + Practice. The Daily Mahjong Workout. 2026 NMJL.
// v2.0 — Full Charleston IQ Scoring Engine, IQScorecard, ScorecardScreen

// DESIGN
const C={bg:"#FAF7F1",bg2:"#F1ECE3",ink:"#221E1A",mut:"#6B6560",jade:"#1B7D4E",gold:"#B08A35",cinn:"#B83232",bdr:"#E3DDD3",
  // IQ hero palette
  hero1:"#083D22",hero2:"#0F5535",hero3:"#072E19",gilt:"#C9A84C",
  // card accents
  sage:"#F0F7F2",sageB:"#4A7A5E",amber:"#FDF6E3",amberB:"#7A5C1E",parch:"#FAF7F0",
};
const F={d:"'Fraunces',Georgia,serif",b:"'Nunito','Segoe UI',sans-serif"};
const CSS=`
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#D5CFC5}
@keyframes rkIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.rk-in{animation:rkIn .25s ease}
@keyframes rkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.rk-float{animation:rkFloat 3s ease-in-out infinite}
@keyframes rkPop{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
.rk-pop{animation:rkPop 0.5s cubic-bezier(0.34,1.56,0.64,1)}
button:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline:2px solid #1B7D4E;outline-offset:2px;border-radius:4px}
@media(min-width:600px){
  .rk-outer{padding:24px 0!important}
  .rk-app{border-radius:20px!important;min-height:auto!important;box-shadow:0 8px 60px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.04)!important;border:none!important;margin-top:16px}
  .rk-pg{padding:20px 32px 44px!important}
}
@keyframes rkFlip{0%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0deg);opacity:1}}
.rk-flip{animation:rkFlip 0.35s ease forwards}
@keyframes rkBar{from{width:0}to{width:var(--w)}}
.rk-bar{animation:rkBar 1s ease forwards}
`;
const S={
  outer:{background:"#D5CFC5",minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"flex-start"},
  app:{fontFamily:F.b,background:C.bg,minHeight:"100vh",color:C.ink,width:"100%",maxWidth:560,borderLeft:`1px solid ${C.bdr}`,borderRight:`1px solid ${C.bdr}`},
  pg:{padding:"10px 16px",paddingBottom:36},
  pill:{background:C.bg2,borderRadius:12,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  card:{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:12,padding:14,marginBottom:8},
  dot:{width:20,height:20,borderRadius:10,background:C.jade+"12",border:`1.5px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.jade,flexShrink:0},
  passBtn:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.cinn},#9A2828)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,minHeight:48},
  greenBtn:{padding:"12px 0",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,cursor:"pointer",minHeight:48},
  oBtn:{padding:"10px 0",background:"#F5F1EB",color:C.ink,border:`1px solid ${C.bdr}`,borderRadius:12,fontSize:13,cursor:"pointer",minHeight:44,fontWeight:600},
  back:{background:"none",border:"none",color:C.jade,fontSize:12,cursor:"pointer",fontWeight:700,padding:0,minHeight:44,display:"flex",alignItems:"center"},
  sortBtn:{background:"none",border:`1px solid ${C.bdr}`,borderRadius:6,padding:"4px 8px",fontSize:9,color:C.mut,cursor:"pointer",fontWeight:600,minHeight:32},
  shareCard:{background:"linear-gradient(145deg,#FFFFF5,#F4EFE3)",border:`1.5px solid ${C.jade}20`,borderRadius:18,padding:"16px 20px",textAlign:"center",marginTop:8,boxShadow:"0 4px 18px rgba(0,0,0,0.04)"},
};

// ─── HTML2CANVAS LOADER ───────────────────────────────────────────────────────
let h2cLoaded=false;
function loadHtml2Canvas(){
  if(h2cLoaded||document.getElementById("h2c-script"))return Promise.resolve();
  return new Promise(res=>{
    const s=document.createElement("script");
    s.id="h2c-script";
    s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload=()=>{h2cLoaded=true;res();};
    document.head.appendChild(s);
  });
}

// ─── SHARE CARD IMAGE — visible card + save button ───────────────────────────
function ShareCardImage({iq,dayNum,section,streak,mode,passInsights}){
  const [saving,setSaving]=useState(false);
  const [done,setDone]=useState(false);
  const cardRef=useRef(null);
  const profile=getProfile();
  const club=profile?.clubCode?CLUBS[profile.clubCode]:null;
  const playerName=profile?.nickname||null;

  // Text-only pass indicators — emoji are unreliable in html2canvas
  const passRow=(passInsights||[]).map(p=>p.quality==="strong"?"●":p.quality==="weak"?"○":"◐").join(" ");
  const passEmoji=(passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");

  const save=async()=>{
    if(!cardRef.current)return;
    setSaving(true);
    await loadHtml2Canvas();
    try{
      const canvas=await window.html2canvas(cardRef.current,{
        scale:3,useCORS:false,allowTaint:true,
        backgroundColor:"#061F12",logging:false,
        removeContainer:true,
      });
      const blob=await new Promise(r=>canvas.toBlob(r,"image/png"));
      // Try native share (iOS/Android) first
      if(navigator.share&&navigator.canShare&&blob){
        try{
          await navigator.share({
            files:[new File([blob],`rackle-day${dayNum}.png`,{type:"image/png"})],
            title:`Rackle #${dayNum} · IQ ${iq.totalScore}`,
            text:`${iq.level} · playrackle.com`,
          });
          setDone(true);setTimeout(()=>setDone(false),3000);
          setSaving(false);return;
        }catch(e){}
      }
      // Desktop fallback — download
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download=`rackle-day${dayNum}.png`;a.click();
      URL.revokeObjectURL(url);
      setDone(true);setTimeout(()=>setDone(false),3000);
    }catch(e){console.error(e);}
    setSaving(false);
  };

  if(!iq)return null;

  // Level colour
  const lvlCol=iq.totalScore>=90?"#C9A84C":iq.totalScore>=80?"#4CD987":iq.totalScore>=70?"#60B4FA":iq.totalScore>=60?"#F5C842":"#F87171";

  // subscore bars
  const bars=[
    {label:"DIR",v:iq.directionScore,max:40},
    {label:"PASS",v:iq.passQualityScore,max:25},
    {label:"TILE",v:iq.tileStrengthScore,max:25},
    {label:"TIME",v:iq.timingScore,max:10},
  ];

  // All inline styles use web-safe / system fonts so html2canvas renders correctly
  const SERIF="Georgia,'Times New Roman',serif";
  const SANS="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
  const MONO="'Courier New',Courier,monospace";

  return(
    <div>
      {/* ── VISIBLE CARD — captured directly by html2canvas ── */}
      <div ref={cardRef} style={{
        background:"#061F12",
        borderRadius:14,
        overflow:"hidden",
        padding:"18px 16px 14px",
        fontFamily:SANS,
        color:"#fff",
        position:"relative",
      }}>

        {/* Subtle tile watermark — pure CSS, no image */}
        <div aria-hidden style={{position:"absolute",right:12,bottom:10,fontSize:64,opacity:0.04,lineHeight:1,userSelect:"none",pointerEvents:"none"}}>🀄</div>

        {/* ── TOP ROW — logo + day badge ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          {/* Logo: tile glyph + wordmark */}
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:28,height:28,borderRadius:6,background:"#1B7D4E",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:15,lineHeight:1}}>🀄</span>
            </div>
            <div>
              <div style={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:"#fff",letterSpacing:-0.3,lineHeight:1}}>Rackle</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",letterSpacing:1.5,fontFamily:SANS,fontWeight:700,marginTop:1}}>CHARLESTON IQ</div>
            </div>
          </div>
          {/* Day badge */}
          {mode==="daily"&&<div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"3px 10px"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:2,fontWeight:700,fontFamily:SANS}}>DAY #{dayNum}</span>
          </div>}
        </div>

        {/* ── IQ SCORE + LEVEL ── */}
        <div style={{display:"flex",alignItems:"flex-end",gap:10,marginBottom:4}}>
          <div style={{fontFamily:SERIF,fontSize:56,fontWeight:700,color:lvlCol,lineHeight:1,letterSpacing:-2}}>{iq.totalScore}</div>
          <div style={{paddingBottom:6}}>
            <div style={{fontFamily:SERIF,fontSize:14,fontWeight:700,color:"#fff",lineHeight:1.2}}>{iq.level}</div>
            {playerName&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:SANS,marginTop:3}}>{playerName}</div>}
          </div>
        </div>

        {/* ── PASS DOTS ROW (text-based, reliable in canvas) ── */}
        {passRow&&<div style={{fontFamily:MONO,fontSize:11,letterSpacing:4,color:lvlCol,marginBottom:12,opacity:0.8}}>{passRow}</div>}

        {/* ── DIVIDER ── */}
        <div style={{height:"0.5px",background:"rgba(255,255,255,0.1)",marginBottom:12}}/>

        {/* ── STATS ROW ── */}
        <div style={{display:"flex",gap:0,marginBottom:12}}>
          {section&&<div style={{flex:2,paddingRight:12,borderRight:"0.5px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:7,color:"rgba(255,255,255,0.35)",letterSpacing:1.5,fontFamily:SANS,fontWeight:700,marginBottom:3}}>SECTION</div>
            <div style={{fontSize:11,fontWeight:700,fontFamily:SANS,color:"#fff",lineHeight:1.2}}>{section}</div>
          </div>}
          {streak>0&&<div style={{flex:1,paddingLeft:12,paddingRight:12,borderRight:"0.5px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:7,color:"rgba(255,255,255,0.35)",letterSpacing:1.5,fontFamily:SANS,fontWeight:700,marginBottom:3}}>STREAK</div>
            <div style={{fontSize:11,fontWeight:700,fontFamily:SANS,color:"#fff"}}>{streak}d</div>
          </div>}
          {iq.totalTime>0&&<div style={{flex:1,paddingLeft:12}}>
            <div style={{fontSize:7,color:"rgba(255,255,255,0.35)",letterSpacing:1.5,fontFamily:SANS,fontWeight:700,marginBottom:3}}>TIME</div>
            <div style={{fontSize:11,fontWeight:700,fontFamily:SANS,color:"#fff"}}>{fT(iq.totalTime)}</div>
          </div>}
        </div>

        {/* ── SUBSCORE BARS ── */}
        <div style={{display:"flex",gap:5,marginBottom:12}}>
          {bars.map(b=>{
            const pct=Math.round(b.v/b.max*100);
            return(
              <div key={b.label} style={{flex:1}}>
                <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.08)",overflow:"hidden",marginBottom:4}}>
                  <div style={{height:"100%",borderRadius:2,background:lvlCol,width:`${pct}%`}}/>
                </div>
                <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",letterSpacing:1,fontFamily:SANS,fontWeight:700}}>{b.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── FOOTER — club + clickable URL ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:SANS}}>
            {club?`🀄 ${club.name}`:"🀄 American Mahjong"}
          </div>
          <a href="https://playrackle.com" target="_blank" rel="noreferrer"
            style={{fontSize:9,color:"#1B7D4E",fontFamily:SANS,fontWeight:700,textDecoration:"none",letterSpacing:0.5}}>
            playrackle.com ↗
          </a>
        </div>
      </div>

      {/* ── SHARE BUTTON ── */}
      <button onClick={save} disabled={saving} style={{
        width:"100%",marginTop:8,borderRadius:12,
        background:`linear-gradient(135deg,${C.jade},#156B42)`,
        border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",gap:10,
        padding:"12px 16px",textAlign:"left",
        opacity:saving?0.7:1,transition:"opacity 0.15s",
      }}>
        <div style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
          {done?"✓":saving?"⏳":"📤"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:"#fff",lineHeight:1.2}}>
            {done?"Card saved!":saving?"Saving…":"Save & Share"}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.3}}>
            {done?"Drop it in your group chat ↗":"Save as image · share anywhere"}
          </div>
        </div>
        <span style={{fontSize:16,color:"rgba(255,255,255,0.5)",flexShrink:0}}>{done?"":"›"}</span>
      </button>

      {/* Emoji row shown below for copy — doesn't go into canvas */}
      {passEmoji&&<div style={{textAlign:"center",marginTop:6,fontSize:12,letterSpacing:2,color:C.mut}}>{passEmoji}</div>}
    </div>
  );
}

// ─── CARD SEASON BANNER — shown once when new NMJL card year detected ─────────
// ─── URL PARAM HELPERS — for club deep-links ─────────────────────────────────
function getUrlParam(key){
  try{return new URLSearchParams(window.location.search).get(key);}catch{return null;}
}

// ─── TILE UTILITIES ───────────────────────────────────────────────────────────
const SUITS=["bam","crak","dot"],SN={bam:"Bam",crak:"Crk",dot:"Dot"},SC={bam:"#1B7D4E",crak:"#B83232",dot:"#2460A8"};
function buildDeck(){const d=[];SUITS.forEach(s=>{for(let n=1;n<=9;n++)for(let i=0;i<4;i++)d.push({t:"s",s,n});});["N","E","W","S"].forEach(v=>{for(let i=0;i<4;i++)d.push({t:"w",v});});["Red","Grn","Soap"].forEach(v=>{for(let i=0;i<4;i++)d.push({t:"d",v});});for(let i=0;i<8;i++)d.push({t:"f"});for(let i=0;i<8;i++)d.push({t:"j"});return d;}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function seededShuffle(a,seed){const b=[...a];let s=seed;for(let i=b.length-1;i>0;i--){s=(s*16807)%2147483647;[b[i],b[s%(i+1)]]=[b[s%(i+1)],b[i]];}return b;}
function sortVal(t){if(t.t==="s")return{bam:0,crak:1,dot:2}[t.s]*100+t.n;if(t.t==="f")return 1000;if(t.t==="w")return 2000+"NEWS".indexOf(t.v);if(t.t==="d")return 3000+["Red","Grn","Soap"].indexOf(t.v);return 4000;}
function sortHand(t){return[...t].sort((a,b)=>sortVal(a)-sortVal(b));}
function tL(t){if(t.t==="j")return"🃏";if(t.t==="f")return"🌸";if(t.t==="w")return t.v;if(t.t==="d")return t.v==="Red"?"中":t.v==="Grn"?"發":"白";return`${t.n}`;}
function tS(t){if(t.t==="j")return"Joker";if(t.t==="f")return"Flower";if(t.t==="w")return"Wind";if(t.t==="d")return t.v==="Soap"?"Soap":t.v==="Red"?"Red":"Green";return SN[t.s];}
function tC(t){if(t.t==="j")return"#B08A35";if(t.t==="f")return"#B54E7A";if(t.t==="w")return"#5C5247";if(t.t==="d")return t.v==="Red"?"#B83232":t.v==="Grn"?"#1B7D4E":"#6B6560";return SC[t.s];}
function fT(s){if(!s&&s!==0)return"—";return`${Math.floor(s/60)}:${(s%60<10?"0":"")+(s%60)}`;}
function tAria(t){if(t.t==="j")return"Joker tile";if(t.t==="f")return"Flower tile";if(t.t==="w")return`${t.v} Wind tile`;if(t.t==="d")return`${tS(t)} Dragon tile`;return`${t.n} ${SN[t.s]} tile`;}
function tLabel(t){if(t.t==="j")return"Joker";if(t.t==="f")return"Flower";if(t.t==="w")return`${t.v} Wind`;if(t.t==="d")return`${tS(t)} Dragon`;return`${t.n} ${SN[t.s]}`;}

// ─── SECTION DEFINITIONS ─────────────────────────────────────────────────────
function cg(h,fn){const v=h.filter(fn),jk=h.filter(t=>t.t==="j").length,c={};v.forEach(t=>{const k=`${t.t}-${t.s||""}-${t.n||""}-${t.v||""}`;c[k]=(c[k]||0)+1;});const ct=Object.values(c);let kg=0,pg=0,pr=0;ct.forEach(n=>{if(n>=4)kg++;else if(n>=3)pg++;else if(n>=2)pr++;});return{v:v.length,jk,kg,pg,pr};}
const SECS=[
{id:"2026",name:"2026",color:"#B54E7A",icon:"📅",desc:"Year tiles — 2s, Soap, 6s",hold:"2s, 6s, Soap, Flowers",pass:"1s, 9s, odds, Winds",combos:"The 2 and 6 appear together in most hands — prioritise pairing them across suits.",joker:null,hands:6,
  ck:h=>{const g=cg(h,t=>(t.t==="s"&&[2,6].includes(t.n))||(t.t==="d"&&t.v==="Soap"));const off=h.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length+h.filter(t=>t.t==="w").length;const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04;const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.5,1));}},
{id:"2468",name:"2468",color:"#B83232",icon:"🔴",desc:"Even numbers (2, 4, 6, 8)",hold:"2s, 4s, 6s, 8s, Flowers, Jokers",pass:"All odds, Winds",combos:"The largest section on the card — 2 and 6 appear in the most hands, prioritise those.",joker:null,hands:10,
  ck:h=>{const g=cg(h,t=>t.t==="s"&&t.n%2===0);const off=h.filter(t=>t.t==="s"&&t.n%2===1).length+h.filter(t=>t.t==="w").length;const b=h.some(t=>t.t==="s"&&t.n===2)&&h.some(t=>t.t==="s"&&t.n===6);const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04+(b?0.06:0);const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.2,1));}},
{id:"369",name:"369",color:"#B84A72",icon:"💗",desc:"Multiples of 3 (3, 6, 9)",hold:"3s, 6s, 9s, Flowers",pass:"Non-multiples of 3, Winds",combos:"6 appears in almost every hand — it's your anchor tile. Never pass a 6.",joker:null,hands:8,
  ck:h=>{const g=cg(h,t=>t.t==="s"&&t.n%3===0);const off=h.filter(t=>t.t==="s"&&t.n%3!==0).length+h.filter(t=>t.t==="w").length;const b=h.some(t=>t.t==="s"&&t.n===6);const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04+(b?0.06:0);const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.5,1));}},
{id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",desc:"Odd numbers (1, 3, 5, 7, 9)",hold:"Odds, Winds can pair",pass:"All evens",combos:"5 is the most versatile odd — it appears in the most hands. Winds pair well here.",joker:null,hands:9,
  ck:h=>{const g=cg(h,t=>t.t==="s"&&t.n%2===1);const off=h.filter(t=>t.t==="s"&&t.n%2===0).length;const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04+h.filter(t=>t.t==="w").length*0.02;const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.2,1));}},
{id:"cr",name:"Consec. Run",color:"#1B7D4E",icon:"🟢",desc:"Sequential tiles across suits",hold:"Consecutive numbers, Flowers",pass:"Isolated numbers, honors",combos:"Runs across 2+ suits give you the most hand options. Don't split a run to chase a pung.",joker:null,hands:11,
  ck:h=>{const bs={};h.filter(t=>t.t==="s").forEach(t=>{if(!bs[t.s])bs[t.s]=new Set();bs[t.s].add(t.n);});let mr=0;Object.values(bs).forEach(s=>{const a=[...s].sort((a,b)=>a-b);let r=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)r++;else{mr=Math.max(mr,r);r=1;}}mr=Math.max(mr,r);});const su=Object.keys(bs).length;const jk=h.filter(t=>t.t==="j").length;const hon=h.filter(t=>t.t==="w"||t.t==="d").length;return Math.max(0,Math.min((mr>=5?0.4:mr>=4?0.3:mr>=3?0.2:mr*0.04)+su*0.04+jk*0.03-hon*0.04,1));}},
{id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",desc:"Honor tiles",hold:"Winds, Dragons",pass:"Number tiles",combos:"You need 5+ honor tiles to make this work. Pass all number tiles aggressively.",joker:null,hands:7,
  ck:h=>{const g=cg(h,t=>t.t==="w"||t.t==="d");const off=h.filter(t=>t.t==="s").length;const s=(g.kg*0.14+g.pg*0.1+g.pr*0.06)+g.jk*0.04;const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.5,1));}},
{id:"aln",name:"Like Numbers",color:"#2460A8",icon:"🔵",desc:"Same number, all suits",hold:"4+ of one number, Flowers, Jokers",pass:"Scattered numbers",combos:"Pick one or two numbers early and commit. Spreading across too many numbers kills this hand.",joker:null,hands:6,
  ck:h=>{const c={};h.filter(t=>t.t==="s").forEach(t=>{c[t.n]=(c[t.n]||0)+1;});const v=Object.values(c);const mx=v.length?Math.max(...v):0;const jk=h.filter(t=>t.t==="j").length;const fl=h.filter(t=>t.t==="f").length;return Math.max(0,Math.min((mx>=4?mx*0.08:mx*0.04)+jk*0.04+fl*0.02-Math.max(0,Object.keys(c).length-2)*0.06,1));}},
{id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",desc:"Five of a kind",hold:"Jokers, 3-4 of a tile",pass:"Scattered tiles",combos:"You need at least 2 Jokers to complete a quint. Without them, abandon this section early.",joker:null,hands:4,
  ck:h=>{const jk=h.filter(t=>t.t==="j").length;const c={};h.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}${t.n}`;c[k]=(c[k]||0)+1;});const v=Object.values(c);const mx=v.length?Math.max(...v):0;if(mx+jk>=5)return Math.min(0.5+jk*0.05,0.85);if(jk>=2&&mx>=3)return 0.35;return Math.max(0,(mx+jk)*0.03-0.1);}},
{id:"sp",name:"Singles & Pairs",color:"#2E9485",icon:"🩵",desc:"Only singles and pairs",hold:"Pairs, Flowers",pass:"Triples+",combos:"This hand is fully concealed — no Jokers allowed. Focus on building clean pairs.",joker:"Jokers can never be used as a single or in a pair, so they have no value when playing this section. You'll have to toss them eventually.",hands:5,
  ck:h=>{const c={};h.forEach(t=>{const k=JSON.stringify(t);c[k]=(c[k]||0)+1;});const pr=Object.values(c).filter(v=>v===2).length;const tr=Object.values(c).filter(v=>v>=3).length;return Math.max(0,Math.min(pr*0.07+h.filter(t=>t.t==="j").length*0.02-tr*0.2,1));}},
];

// Section metadata for IQ scoring
const SECTION_META={
  "2026":{strongNums:[2,6],weakNums:[1,3,5,7,9],riskyPass:[2,6],strongTypes:[],weakTypes:["w"],wantsFlowers:true,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  "2468":{strongNums:[2,4,6,8],weakNums:[1,3,5,7,9],riskyPass:[2,6],strongTypes:[],weakTypes:["w"],wantsFlowers:true,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  "369":{strongNums:[3,6,9],weakNums:[1,2,4,5,7,8],riskyPass:[6],strongTypes:[],weakTypes:["w"],wantsFlowers:true,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  "13579":{strongNums:[1,3,5,7,9],weakNums:[2,4,6,8],riskyPass:[5],strongTypes:["w"],weakTypes:[],wantsFlowers:true,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  "cr":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:["w","d"],wantsFlowers:true,wantsJokers:true,pairBonus:false,runBased:true,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  "wd":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:["w","d"],weakTypes:["s"],wantsFlowers:false,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  "aln":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:[],wantsFlowers:true,wantsJokers:true,pairBonus:false,runBased:false,likeNumbers:true,quintsNeeded:false,pairsOnly:false},
  "q":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:[],wantsFlowers:false,wantsJokers:true,pairBonus:false,runBased:false,likeNumbers:false,quintsNeeded:true,pairsOnly:false},
  "sp":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:[],wantsFlowers:true,wantsJokers:false,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:true},
};

// ─── CHARLESTON IQ SCORING ENGINE ────────────────────────────────────────────

function iqCountGroups(rack){
  const c={};
  rack.forEach(t=>{
    const k=t.t==="s"?`s-${t.s}-${t.n}`:t.t==="w"?`w-${t.v}`:t.t==="d"?`d-${t.v}`:`${t.t}`;
    c[k]=(c[k]||0)+1;
  });
  return c;
}

function iqLongestRun(rack){
  const bs={};
  rack.filter(t=>t.t==="s").forEach(t=>{if(!bs[t.s])bs[t.s]=new Set();bs[t.s].add(t.n);});
  let mr=0;
  Object.values(bs).forEach(s=>{const a=[...s].sort((a,b)=>a-b);let r=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)r++;else{mr=Math.max(mr,r);r=1;}}mr=Math.max(mr,r);});
  return mr;
}

function iqDirection(finalRack,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const jk=finalRack.filter(t=>t.t==="j").length;
  const fl=finalRack.filter(t=>t.t==="f").length;
  let directionScore=0,directionExplanation="";

  if(sectionId==="cr"){
    const runLen=iqLongestRun(finalRack);
    const honors=finalRack.filter(t=>t.t==="w"||t.t==="d").length;
    directionScore=runLen>=5?40:runLen>=4?30:runLen>=3?20:runLen*4;
    if(honors>1)directionScore=Math.max(0,directionScore-honors*3);
    directionExplanation=runLen>=5?`Your longest run was ${runLen} tiles — strong sequential structure.`:runLen>=4?`You built a ${runLen}-tile run. One more tile would have sharpened this significantly.`:runLen>=3?`A ${runLen}-tile run is a start, but Consecutive Run needs 5+ to be viable.`:"No significant run formed. This section needs sequential tiles across suits.";
  } else if(sectionId==="wd"){
    const honors=finalRack.filter(t=>t.t==="w"||t.t==="d").length;
    const nums=finalRack.filter(t=>t.t==="s").length;
    const ratio=honors/Math.max(finalRack.length,1);
    directionScore=ratio>=0.55&&nums<=2?40:ratio>=0.45?30:ratio>=0.35?20:ratio>=0.2?12:6;
    directionExplanation=ratio>=0.55?`${honors} honor tiles — a committed Winds & Dragons rack.`:ratio>=0.4?`${honors} honors is decent but ${nums} number tiles are still diluting the rack.`:`Only ${honors} honor tiles. Winds & Dragons needs 7+ honors to be viable.`;
  } else if(sectionId==="aln"){
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{c[t.n]=(c[t.n]||0)+1;});
    const vals=Object.values(c),mx=vals.length?Math.max(...vals):0,spread=Object.keys(c).length;
    directionScore=mx>=6&&spread<=2?40:mx>=5&&spread<=3?32:mx>=4&&spread<=3?24:mx>=3?16:mx*4;
    directionExplanation=mx>=6?`${mx} tiles of the same number — excellent consolidation.`:mx>=4?`${mx} of a number is a solid nucleus. Keep tightening.`:`Only ${mx} of any single number. Like Numbers needs 6+ of one tile to be strong.`;
  } else if(sectionId==="sp"){
    const grps=iqCountGroups(finalRack);const pairs=Object.values(grps).filter(v=>v===2).length;const triples=Object.values(grps).filter(v=>v>=3).length;
    directionScore=pairs>=5&&triples===0?40:pairs>=4&&triples===0?32:pairs>=3&&triples<=1?22:pairs>=2?14:pairs*5;
    directionExplanation=pairs>=5?`${pairs} pairs with no triples — textbook Singles & Pairs structure.`:pairs>=3?`${pairs} pairs is reasonable. Avoid any triples.`:`Only ${pairs} pairs. Singles & Pairs needs 5+ clean pairs to work.`;
  } else if(sectionId==="q"){
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}${t.n}`;c[k]=(c[k]||0)+1;});
    const mx=Object.values(c).length?Math.max(...Object.values(c)):0;
    directionScore=jk>=2&&mx>=3?40:jk>=2&&mx>=2?28:jk>=1&&mx>=3?22:jk>=1?14:(mx>=3?12:mx*3);
    directionExplanation=jk>=2&&mx>=3?`${jk} jokers and ${mx} of a tile — well positioned for a quint.`:jk>=1?`${jk} joker with ${mx} of one tile. You need at least 2 jokers for a viable quint.`:"No jokers. Quints is nearly impossible without at least 2 jokers.";
  } else {
    // numbered sections: 2026, 2468, 369, 13579
    // Score is RELATIVE to section difficulty — how rare is this many strong tiles?
    // Based on hypergeometric distribution of strong tiles in 144-tile deck, 13 drawn.
    // 369 (36 strong): mean=3.3 → 6 strong = top 5% → score ~38
    // 2026 (24 strong): mean=2.2 → 6 strong = top 2% → score ~39
    // 2468 (48 strong): mean=4.3 → 6 strong = top 36% → score ~26
    // 13579 (60 strong): mean=5.4 → 6 strong = top 50% → score ~20
    const strongNums=meta.strongNums||[];
    const weakNums=meta.weakNums||[];
    const strongTiles=finalRack.filter(t=>t.t==="s"&&strongNums.includes(t.n)).length;
    const weakTiles=finalRack.filter(t=>t.t==="s"&&weakNums.includes(t.n)).length;
    const weakRatio=weakTiles/Math.max(finalRack.length,1);

    // Difficulty factor: fewer strong tiles in deck = harder section = higher reward per tile
    // 369/2026 hardest (3 nums = 36/24 tiles), 2468 medium (4 nums = 48), 13579 easiest (5 nums = 60)
    const deckStrong={
      "369":36,"2026":24,"2468":48,"13579":60
    }[sectionId]||48;
    // Expected strong tiles dealt = 13 * deckStrong/144
    const expectedDealt=Math.round(13*deckStrong/144*10)/10;
    // Score relative to section difficulty — how many strong tiles vs expected?
    // Base starts at 20 (not 15) so average play lands in Getting There, not Rookie
    // Each tile above expected = +5 pts, below = -4 pts (asymmetric — punish less)
    const aboveExpected=strongTiles-expectedDealt;
    const base=Math.max(4,Math.min(40,Math.round(20+(aboveExpected>=0?aboveExpected*5:aboveExpected*4))));
    // Weak tile penalty — scaled so it's meaningful but not crushing
    const weakPenalty=weakRatio>=0.4?8:weakRatio>=0.3?5:weakRatio>=0.2?3:weakRatio>=0.1?1:0;
    directionScore=Math.max(2,base-weakPenalty);

    const secName=SECS.find(s=>s.id===sectionId)?.name||sectionId;
    const aboveStr=aboveExpected>0?`${strongTiles} strong tiles — ${(aboveExpected).toFixed(1)} above average for ${secName}.`:
      aboveExpected<-1?`Only ${strongTiles} strong tiles for ${secName} — a tough deal.`:
      `${strongTiles} strong tiles for ${secName} — about average for this section.`;
    directionExplanation=weakTiles>=4?aboveStr+` ${weakTiles} off-direction tiles are diluting the rack.`:aboveStr;
  }
  return{directionScore:Math.max(0,Math.min(40,Math.round(directionScore))),directionExplanation};
}

function iqTileStrength(finalRack,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const jk=finalRack.filter(t=>t.t==="j").length;
  const fl=finalRack.filter(t=>t.t==="f").length;
  const grps=iqCountGroups(finalRack);
  const vals=Object.values(grps);
  const pairs=vals.filter(v=>v===2).length;
  const triples=vals.filter(v=>v>=3).length;
  let raw=0; // target: 0–25 directly, no division

  if(meta.pairsOnly){
    // Singles & Pairs — pairs are everything, triples and jokers are poison
    raw+=pairs>=6?22:pairs>=5?18:pairs>=4?13:pairs>=3?9:pairs>=2?5:pairs*2;
    raw-=triples*6;
    raw-=jk>0?4:0; // jokers worthless here
    raw+=fl>=2?2:fl>=1?1:0;
  } else if(meta.runBased){
    const run=iqLongestRun(finalRack);
    const suits=new Set(finalRack.filter(t=>t.t==="s").map(t=>t.s)).size;
    raw+=run>=6?18:run>=5?14:run>=4?10:run>=3?6:run*2;
    raw+=suits>=2?3:0; // cross-suit bonus
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=2?2:fl>=1?1:0;
    raw-=finalRack.filter(t=>t.t==="w"||t.t==="d").length*2; // honors hurt run hands
  } else if(meta.likeNumbers){
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{c[t.n]=(c[t.n]||0)+1;});
    const vals2=Object.values(c);
    const mx=vals2.length?Math.max(...vals2):0;
    const spread=Object.keys(c).length;
    raw+=mx>=8?20:mx>=6?15:mx>=5?11:mx>=4?7:mx>=3?4:mx*1;
    raw-=Math.max(0,spread-2)*3; // penalise spreading across numbers
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=1?2:0;
  } else if(meta.quintsNeeded){
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}${t.n}`;c[k]=(c[k]||0)+1;});
    const mx=Object.values(c).length?Math.max(...Object.values(c)):0;
    raw+=jk>=2?12:jk>=1?6:0;
    raw+=mx>=4?10:mx>=3?6:mx>=2?3:0;
  } else if(meta.strongTypes&&meta.strongTypes.length){
    // Winds & Dragons
    const honors=finalRack.filter(t=>meta.strongTypes.includes(t.t)).length;
    raw+=honors>=9?18:honors>=7?14:honors>=5?10:honors>=3?6:honors*1;
    raw+=pairs>=4?6:pairs>=3?4:pairs>=2?2:pairs>=1?1:0;
    raw+=jk>=2?3:jk>=1?1:0;
    raw-=finalRack.filter(t=>t.t==="s").length*1.5; // number tiles hurt
  } else {
    // Numbered sections — difficulty-aware (harder sections reward more per strong tile)
    const strongNums=meta.strongNums||[];
    const weakNums=meta.weakNums||[];
    const strong=finalRack.filter(t=>t.t==="s"&&strongNums.includes(t.n)).length;
    const weak=finalRack.filter(t=>t.t==="s"&&weakNums.includes(t.n)).length;
    // Sections with fewer strong tiles in deck are harder → more credit per tile
    const deckStrong={"369":36,"2026":24,"2468":48,"13579":60}[sectionId]||48;
    const diffMult=deckStrong<=24?1.4:deckStrong<=36?1.2:deckStrong<=48?1.0:0.85;
    const strongBase=strong>=10?18:strong>=8?14:strong>=6?10:strong>=4?6:strong>=2?3:strong;
    raw+=Math.round(strongBase*diffMult);
    // Strong pairs bonus
    const strongPairs=Object.entries(iqCountGroups(finalRack))
      .filter(([k,v])=>{const parts=k.split("-");return parts[0]==="s"&&v>=2&&strongNums.includes(Number(parts[2]));}).length;
    raw+=strongPairs>=3?4:strongPairs>=2?2:strongPairs>=1?1:0;
    raw+=jk>=2?3:jk>=1?1:0;
    raw+=fl>=2&&meta.wantsFlowers?2:fl>=1&&meta.wantsFlowers?1:0;
    raw-=weak>=6?5:weak>=4?3:weak>=2?1:0;
    // Tile versatility bonus — crossover tiles that serve multiple sections
    const TILE_SECTIONS={2:["2026","2468"],4:["2468"],6:["2026","2468","369"],8:["2468"],3:["369","13579"],9:["369","13579"],5:["13579"],7:["13579"],1:["13579"]};
    let versatileCount=0;
    finalRack.filter(t=>t.t==="s").forEach(t=>{const sects=TILE_SECTIONS[t.n]||[];if(sects.length>=2&&sects.includes(sectionId))versatileCount++;});
    raw+=versatileCount>=4?2:versatileCount>=2?1:0;
  }

  raw=Math.max(0,Math.min(25,Math.round(raw)));
  return{tileStrengthScore:raw};
}

function iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId){
  if(!passedTilesByRound||passedTilesByRound.length===0)return{passQualityScore:10,passInsights:[]};
  const meta=SECTION_META[sectionId]||{};
  const strongNums=meta.strongNums||[];
  const weakNums=meta.weakNums||[];
  const strongTypes=meta.strongTypes||[];
  const weakTypes=meta.weakTypes||[];

  const isStrongTile=(t)=>{
    if(t.t==="j")return true;
    if(t.t==="f"&&meta.wantsFlowers)return true;
    if(strongTypes.includes(t.t))return true;
    if(t.t==="s"&&strongNums.includes(t.n))return true;
    return false;
  };
  const isWeakTile=(t)=>{
    if(weakTypes.includes(t.t))return true;
    if(t.t==="s"&&weakNums.includes(t.n))return true;
    return false;
  };

  // Detect broken pairs
  const startGroups=iqCountGroups(startingRack);
  const finalGroups=iqCountGroups(finalRack);
  let brokenPairsTotal=0;
  const brokenPairKeys=[];
  Object.keys(startGroups).forEach(k=>{
    if(startGroups[k]>=2&&(!finalGroups[k]||finalGroups[k]<2)){
      brokenPairsTotal++;brokenPairKeys.push(k);
    }
  });

  // FIX 1: AVAILABILITY-AWARE — measure weak clearance rate
  const totalWeakInStart=startingRack.filter(t=>isWeakTile(t)).length;
  const allPassed=passedTilesByRound.flatMap(p=>p.out||[]);
  const totalWeakPassed=allPassed.filter(t=>isWeakTile(t)).length;
  const weakClearRate=totalWeakInStart>0?totalWeakPassed/totalWeakInStart:1;

  // FIX 2: BLIND PASS LENIENCY — halve the strong-tile penalty on blind passes
  let totalRoundScore=0;
  const passInsights=passedTilesByRound.map(p=>{
    const tiles=p.out||[];
    if(tiles.length===0)return{roundName:p.label||p.roundName||"Pass",passedTiles:[],quality:"neutral",insight:"No tiles passed this round."};
    const isBlind=p.blind||false;
    let weakPassed=0,strongPassed=0,neutralPassed=0;
    tiles.forEach(t=>{
      if(isStrongTile(t))strongPassed++;
      else if(isWeakTile(t))weakPassed++;
      else neutralPassed++;
    });
    // Blind pass: strong-tile penalty halved — less information available
    const strongPenalty=isBlind?2:4;
    let roundScore=10+(weakPassed*3)-(strongPassed*strongPenalty)+(neutralPassed*0.5);
    roundScore=Math.max(0,Math.min(15,roundScore));
    totalRoundScore+=roundScore;

    let quality="neutral",insight="";
    if(strongPassed>0&&weakPassed===0){
      quality="weak";
      insight=isBlind
        ?`Passed ${strongPassed} useful tile${strongPassed>1?"s":""} — a tough spot on a blind pass.`
        :`Passed ${strongPassed} tile${strongPassed>1?"s":""} your section wanted to keep.`;
    } else if(weakPassed>0&&strongPassed===0){
      quality="strong";
      insight=`Passed ${weakPassed} off-direction tile${weakPassed>1?"s":""} — clean${isBlind?" blind":""} round.`;
    } else if(strongPassed>0&&weakPassed>0){
      quality="mixed";
      insight=isBlind?"Mixed blind pass — gave away a useful tile but cleared some weak ones too.":"Mixed round — passed some useful tiles alongside the weaker ones.";
    } else{
      quality="neutral";
      insight=`Neutral${isBlind?" blind":""} pass — tiles were neither clearly strong nor weak for your section.`;
    }
    return{roundName:p.label||p.roundName||"Pass",passedTiles:tiles,quality,insight};
  });

  const roundCount=Math.max(passedTilesByRound.length,1);
  const avgRound=totalRoundScore/roundCount;
  let raw=(avgRound/15)*25;
  // Availability bonus: clearing most of your weak tiles is disciplined play
  if(totalWeakInStart>=4){
    raw+=weakClearRate>=0.75?3:weakClearRate>=0.5?1:weakClearRate<=0.2?-2:0;
  }
  raw-=brokenPairsTotal*3;
  raw=Math.max(0,Math.min(25,raw));

  raw=Math.max(0,Math.min(25,Math.round(raw)));
  return{passQualityScore:raw,passInsights,brokenPairsCount:brokenPairsTotal,brokenPairKeys};
}

function iqTiming(totalTime,roundCount){
  const rc=Math.max(roundCount,1);
  const avg=totalTime/rc;
  let timingScore,timingInsight;
  // Tight sweet spot: 8–12s per pass. Falls off sharply outside it.
  if(avg>=8&&avg<=12){timingScore=10;timingInsight="Elite pace — you read the rack and committed. That's the sweet spot.";}
  else if(avg>12&&avg<=16){timingScore=8;timingInsight="Solid pace. A touch deliberate — sharper players aim for 8–12s per pass.";}
  else if(avg>16&&avg<=22){timingScore=6;timingInsight="Slower than ideal. You have the time, but experienced players commit faster.";}
  else if(avg>22&&avg<=35){timingScore=4;timingInsight="Quite deliberate — try naming your section before your first tile move.";}
  else if(avg>35){timingScore=Math.max(2,Math.round(3-((avg-35)/30)));timingInsight="Very slow. Commit to a section first, then pass — don't deliberate mid-rack.";}
  else if(avg>=5&&avg<8){timingScore=7;timingInsight="Slightly quick — 8+ seconds per pass gives you time to catch a better move.";}
  else if(avg>=3&&avg<5){timingScore=4;timingInsight="Moving fast. Slow down — give each pass at least 8 seconds of thought.";}
  else{timingScore=2;timingInsight="Very fast passing. Each decision shapes your whole hand — take more time.";}
  return{timingScore:Math.max(2,Math.min(10,timingScore)),timingInsight};
}

function iqScoreLevel(score,directionScore,tileStrengthScore,passQualityScore,timingScore){
  // Ratios make subscores comparable across their different maxes
  const dr=directionScore/40,tr=tileStrengthScore/25,pr=passQualityScore/25,tmr=timingScore/10;
  const best=[{k:"direction",r:dr},{k:"tiles",r:tr},{k:"passes",r:pr},{k:"timing",r:tmr}].sort((a,b)=>b.r-a.r)[0].k;
  const worst=[{k:"direction",r:dr},{k:"tiles",r:tr},{k:"passes",r:pr},{k:"timing",r:tmr}].sort((a,b)=>a.r-b.r)[0].k;

  let level,levelExplanation;

  if(score>=90){
    level="Mahjong Master";
    if(best==="direction")levelExplanation="Your section read was locked in early and your passes protected it all the way through.";
    else if(best==="passes")levelExplanation="Disciplined passing throughout — you gave away the right tiles and kept what mattered.";
    else if(best==="tiles")levelExplanation="Your final rack had real structural strength — pungs, pairs, and key tiles all in the right place.";
    else levelExplanation="Sharp decision-making at pace — you read the rack quickly and executed cleanly.";
  } else if(score>=80){
    level="Skilled Player";
    if(worst==="passes")levelExplanation="Strong direction and tile read, but one or two passing decisions cost you tiles you needed.";
    else if(worst==="direction")levelExplanation="Good passing and structure, but your rack still hedged across two sections rather than committing fully.";
    else if(worst==="tiles")levelExplanation="Clear direction and clean passes — your final rack just needed a bit more structural punch.";
    else levelExplanation="Almost there — your reads were good but your pace worked against you on a couple of passes.";
  } else if(score>=70){
    level="Game Ready";
    if(worst==="passes")levelExplanation="Your direction was on point, but passing decisions gave away tiles that would have strengthened your rack.";
    else if(worst==="direction")levelExplanation="Your passing was disciplined, but the rack didn't fully commit — pick your section before the first pass next time.";
    else if(worst==="tiles")levelExplanation="Right idea, right section — but the tiles you kept didn't pull together into a strong structure.";
    else levelExplanation="Solid instincts overall, but rushing through passes meant you missed a couple of better options.";
  } else if(score>=60){
    level="Getting There";
    if(worst==="direction")levelExplanation="Your rack pulled in too many directions. Try naming your target section before you touch a single tile.";
    else if(worst==="passes")levelExplanation="You had the right tiles but passed too many of them away. Slow down and ask: does this tile connect to what I'm keeping?";
    else if(worst==="tiles")levelExplanation="The section was right but the tiles you held didn't support each other. Look for pairs and runs, not just individual tiles.";
    else levelExplanation="Moving too quickly through passes — give yourself 8–20 seconds each round to properly read your rack.";
  } else {
    level="Keep Going, Rookie";
    if(worst==="direction")levelExplanation="No clear section emerged. Before your next game, pick one group of tiles and build everything around it.";
    else if(worst==="passes")levelExplanation="Several strong tiles left your hand that shouldn't have. Before passing, ask: is this tile useful to me or not?";
    else if(worst==="tiles")levelExplanation="Your final rack lacked structure. Aim to hold pairs or runs rather than isolated individual tiles.";
    else levelExplanation="Very fast passing left little time to read the rack. Slow down — each pass decision shapes your whole hand.";
  }

  return{level,levelExplanation};
}

function iqDistanceToOptimal(finalRack,startingRack,passedTilesByRound,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const strongNums=meta.strongNums||[];
  const strongTypes=meta.strongTypes||[];

  // Missing strong tile types
  const missingStrongTiles=[];
  if(strongNums.length){
    strongNums.forEach(n=>{
      const has=finalRack.some(t=>t.t==="s"&&t.n===n);
      if(!has)missingStrongTiles.push(`${n} (any suit)`);
    });
  }
  if(strongTypes.length){
    strongTypes.forEach(ty=>{
      const has=finalRack.some(t=>t.t===ty);
      if(!has)missingStrongTiles.push(ty==="w"?"Wind tile":"Dragon tile");
    });
  }

  // Off-direction tiles in final rack
  const offDir=[];
  if(meta.weakTypes&&meta.weakTypes.length){
    finalRack.forEach(t=>{if(meta.weakTypes.includes(t.t)&&t.t!=="j")offDir.push(tLabel(t));});
  }
  if(meta.weakNums&&meta.weakNums.length){
    finalRack.filter(t=>t.t==="s"&&meta.weakNums.includes(t.n)).forEach(t=>offDir.push(tLabel(t)));
  }
  const offDirectionTiles=offDir.slice(0,5);

  // Key mistake round
  let keyMistakeRound=null;let worstAdj=-99;
  (passedTilesByRound||[]).forEach(p=>{
    const tiles=p.out||[];
    const strongPassed=tiles.filter(t=>{
      if(t.t==="j")return true;
      if(strongTypes.includes(t.t))return true;
      if(t.t==="s"&&strongNums.includes(t.n))return true;
      return false;
    }).length;
    if(strongPassed>worstAdj){worstAdj=strongPassed;keyMistakeRound=p.label||p.roundName||null;}
  });
  if(worstAdj<=0)keyMistakeRound=null;

  // Broken pairs
  const startGroups=iqCountGroups(startingRack);
  const finalGroups=iqCountGroups(finalRack);
  const brokenPairs=[];
  Object.keys(startGroups).forEach(k=>{
    if(startGroups[k]>=2&&(!finalGroups[k]||finalGroups[k]<2)&&brokenPairs.length<2){
      const parts=k.split("-");
      let label="Pair";
      if(parts[0]==="s")label=`${parts[2]} ${SN[parts[1]]||parts[1]} pair`;
      else if(parts[0]==="w")label=`${parts[1]} Wind pair`;
      else if(parts[0]==="d")label=`${parts[1]} Dragon pair`;
      else if(parts[0]==="f")label="Flower pair";
      brokenPairs.push(label);
    }
  });

  // Run gap for consecutive run
  let runGap=0;
  if(sectionId==="cr"){const run=iqLongestRun(finalRack);runGap=Math.max(0,5-run);}

  const distanceCount=Math.min(missingStrongTiles.length,3)+Math.min(offDirectionTiles.length,2)+runGap+brokenPairs.length;

  let explanation="Your final rack was well-optimised for your target direction.";
  if(runGap>0)explanation=`Your longest run was ${5-runGap} tiles — you needed ${runGap} more to fully unlock Consecutive Run.`;
  else if(brokenPairs.length>0)explanation=`You broke ${brokenPairs.length} pair${brokenPairs.length>1?"s":""} (${brokenPairs.join(", ")}) during the Charleston.`;
  else if(missingStrongTiles.length>0)explanation=`Your rack was missing ${missingStrongTiles.slice(0,2).join(" and ")} — key tiles for this section.`;
  else if(offDirectionTiles.length>0)explanation=`${offDirectionTiles.length} off-direction tile${offDirectionTiles.length>1?"s":""} stayed in your rack.`;

  return{missingStrongTiles,offDirectionTiles,keyMistakeRound,brokenPairs,distanceCount,explanation};
}

function iqTileInsights(finalRack,startingRack,passedTilesByRound,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const strongNums=meta.strongNums||[];
  const strongTypes=meta.strongTypes||[];
  const allPassed=(passedTilesByRound||[]).flatMap(p=>p.out||[]);

  const protectedTiles=[];
  finalRack.forEach(t=>{
    if(t.t==="j")protectedTiles.push(tLabel(t));
    else if(t.t==="f"&&meta.wantsFlowers)protectedTiles.push(tLabel(t));
    else if(strongTypes.includes(t.t))protectedTiles.push(tLabel(t));
    else if(t.t==="s"&&strongNums.includes(t.n))protectedTiles.push(tLabel(t));
  });

  const missedTiles=allPassed.filter(t=>{
    if(t.t==="j")return true;
    if(strongTypes.includes(t.t))return true;
    if(t.t==="s"&&strongNums.includes(t.n))return true;
    return false;
  }).map(t=>tLabel(t));

  const weakNums=meta.weakNums||[];
  const weakTypes=meta.weakTypes||[];
  const weakKept=finalRack.filter(t=>{
    if(weakTypes.includes(t.t)&&t.t!=="j")return true;
    if(t.t==="s"&&weakNums.includes(t.n))return true;
    return false;
  }).map(t=>tLabel(t));

  const riskyPassed=allPassed.filter(t=>{
    if(t.t==="j")return true;
    if(t.t==="f"&&meta.wantsFlowers)return true;
    return false;
  }).map(t=>tLabel(t));

  const missedOpportunities=[];
  const startGroups=iqCountGroups(startingRack);
  const finalGroups=iqCountGroups(finalRack);
  Object.keys(startGroups).forEach(k=>{
    if(startGroups[k]>=2&&(!finalGroups[k]||finalGroups[k]<2)&&missedOpportunities.length<4){
      const parts=k.split("-");
      let label="";
      if(parts[0]==="s")label=`Broke your ${parts[2]} ${SN[parts[1]]||parts[1]} pair`;
      else if(parts[0]==="w")label=`Broke your ${parts[1]} Wind pair`;
      missedOpportunities.push(label);
    }
  });
  if(sectionId==="cr"){const run=iqLongestRun(finalRack);if(run<4&&missedTiles.length>0)missedOpportunities.push("Passed tiles that could have extended a consecutive run");}
  if(weakKept.length>=3)missedOpportunities.push(`Held ${weakKept.length} off-direction tiles that could have been passed`);

  return{
    protectedTiles:protectedTiles.slice(0,5),
    missedTiles:missedTiles.slice(0,4),
    weakKept:weakKept.slice(0,4),
    riskyPassed:riskyPassed.slice(0,3),
    missedOpportunities:missedOpportunities.slice(0,4),
  };
}

function iqFeedback(directionScore,tileStrengthScore,passQualityScore,timingScore,brokenPairsCount,sectionId){
  const strengths=[],weaknesses=[];
  if(directionScore>=35)strengths.push("Committed to your section early and built around it.");
  if(tileStrengthScore>=20)strengths.push("Your final rack had strong structural tiles.");
  if(passQualityScore>=20)strengths.push("Clean passing decisions throughout the Charleston.");
  if(timingScore>=9)strengths.push("Good decision-making pace — not too fast, not too slow.");

  if(directionScore<20)weaknesses.push("Your rack stayed scattered without committing to one section.");
  if(tileStrengthScore<=10)weaknesses.push("Weak structure in the final rack — tiles didn't support each other well.");
  if(passQualityScore<=12)weaknesses.push("Some risky passing decisions gave away tiles your section needed.");
  if(brokenPairsCount>0)weaknesses.push(`Broke ${brokenPairsCount} pair${brokenPairsCount>1?"s":""} during the Charleston — protect your pairs.`);
  if(timingScore<=5)weaknesses.push("Pace was off — try to spend 8–20 seconds per pass.");

  const uniqueStr=[...new Set(strengths)].slice(0,2);
  const uniqueWk=[...new Set(weaknesses)].slice(0,2);

  let coachNote="";
  let tryNextTime="";

  if(directionScore<20&&passQualityScore<=12){
    coachNote="Your passing and direction both need attention. The key habit: identify your strongest group before your very first pass, then protect it ruthlessly.";
  } else if(passQualityScore<=12){
    coachNote="You were pointing in the right direction, but your passing decisions cost you. Focus on what leaves your hand, not just what stays.";
  } else if(directionScore<20){
    coachNote="Your passing was disciplined, but the rack didn't commit to a clear path. Try to name your section by the second pass and filter from there.";
  } else if(brokenPairsCount>0){
    coachNote="Watch your pairs. A pair broken early often can't be rebuilt — they're structural anchors for most hands.";
  } else {
    coachNote="Push higher by paying attention to your middle tiles — the ones that could serve two sections. Committing early to one path unlocks a sharper Charleston.";
  }

  const scores=[
    {name:"direction",ratio:directionScore/40,tip:"Before your first pass, identify the section your rack most favors. Everything else follows from that read."},
    {name:"tiles",ratio:tileStrengthScore/25,tip:"Before passing any tile, ask: does it support my main group, a pair, or a sequential path? If no to all three, it goes."},
    {name:"passes",ratio:passQualityScore/25,tip:"Before each pass, check: does this tile connect to anything I'm keeping? Tiles that connect to nothing are the ones to pass."},
    {name:"timing",ratio:timingScore/10,tip:"Aim for 8–20 seconds per pass. That's enough time to read the rack without second-guessing."},
  ];
  const worst=scores.sort((a,b)=>a.ratio-b.ratio)[0];
  tryNextTime=worst.tip;

  return{strengths:uniqueStr,weaknesses:uniqueWk,coachNote,tryNextTime};
}

function calculateCharlestonIQ(gameState,puzzleId,isDaily,dayNum){
  const{startingRack,finalRack,passedTilesByRound,totalTime,sectionId}=gameState;
  if(!startingRack||!finalRack||!sectionId)return null;

  const roundCount=Math.max((passedTilesByRound||[]).length,1);
  let{directionScore,directionExplanation}=iqDirection(finalRack,sectionId);
  let{tileStrengthScore}=iqTileStrength(finalRack,sectionId);
  const{passQualityScore,passInsights,brokenPairsCount}=iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId);
  const{timingScore,timingInsight}=iqTiming(totalTime||0,roundCount);

  // ── DEAL QUALITY FLOOR ──────────────────────────────────────────────────────
  const meta=SECTION_META[sectionId]||{};
  const strongNums=meta.strongNums||[];
  const strongTypes=meta.strongTypes||[];
  const dealStrong=startingRack.filter(t=>{
    if(strongTypes.includes(t.t))return true;
    if(t.t==="s"&&strongNums.includes(t.n))return true;
    if(t.t==="j")return true;
    return false;
  }).length;
  const finalStrong=finalRack.filter(t=>{
    if(strongTypes.includes(t.t))return true;
    if(t.t==="s"&&strongNums.includes(t.n))return true;
    if(t.t==="j")return true;
    return false;
  }).length;
  const retentionRate=dealStrong>0?finalStrong/dealStrong:0;
  // Retention bonus capped at +2 (was +4) — prevents stacking inflation
  if(retentionRate>=0.85&&dealStrong>=5){
    directionScore=Math.min(40,directionScore+2);
    tileStrengthScore=Math.min(25,tileStrengthScore+(tileStrengthScore<20?3:0));
  } else if(retentionRate>=0.7&&dealStrong>=5){
    directionScore=Math.min(40,directionScore+1);
  }
  // Poor deal floor — only if truly starved (≤2 strong tiles dealt)
  if(dealStrong<=2){
    directionScore=Math.max(directionScore,16);
    tileStrengthScore=Math.max(tileStrengthScore,10);
  }

  // ── SECTION DOMINANCE BONUS ─────────────────────────────────────────────────
  // Capped at +2 total (was +4) — direction should be earned, not awarded
  const allSectionScores=SECS.map(s=>s.ck(finalRack));
  const chosenIdx=SECS.findIndex(s=>s.id===sectionId);
  const chosenScore=chosenIdx>=0?allSectionScores[chosenIdx]:0;
  const otherScores=allSectionScores.filter((_,i)=>i!==chosenIdx);
  const bestOther=otherScores.length?Math.max(...otherScores):0;
  if(chosenScore>=0.2&&chosenScore>=bestOther*2.5){
    directionScore=Math.min(40,directionScore+2);
    directionExplanation+=" Your rack had nowhere else to go — that's a decisive deal.";
  } else if(chosenScore>=0.2&&chosenScore>=bestOther*1.8){
    directionScore=Math.min(40,directionScore+1);
  }

  const totalScore=Math.max(0,Math.min(100,directionScore+tileStrengthScore+passQualityScore+timingScore));
  const{level,levelExplanation}=iqScoreLevel(totalScore,directionScore,tileStrengthScore,passQualityScore,timingScore);

  const dist=iqDistanceToOptimal(finalRack,startingRack,passedTilesByRound,sectionId);
  const tileIns=iqTileInsights(finalRack,startingRack,passedTilesByRound,sectionId);
  const{strengths,weaknesses,coachNote,tryNextTime}=iqFeedback(directionScore,tileStrengthScore,passQualityScore,timingScore,brokenPairsCount||0,sectionId);

  const dn=dayNum||getDayNum();
  // Build emoji pass row: 🟢=strong 🟡=mixed/neutral 🔴=weak
  const passEmoji=(passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");
  const _prof=getProfile();
  const _club=_prof?.clubCode?CLUBS[_prof.clubCode]:null;
  const clubLine=_club?`${_club.name}\n`:"";
  const shareText=`🀄 RACKLE${isDaily?` #${dn}`:""}\nCharleston IQ: ${totalScore} · ${level}\nSection: ${sectionId?SECS.find(s=>s.id===sectionId)?.name||"":""}\nPasses: ${passEmoji}\nTime: ${fT(totalTime||0)}\n${clubLine}playrackle.com`;

  return{
    puzzleId,totalScore,level,levelExplanation,
    directionScore,tileStrengthScore,passQualityScore,timingScore,
    directionExplanation,
    distanceToOptimal:{...dist},
    strengths,weaknesses,
    tileInsights:tileIns,
    passInsights,
    timingInsight,coachNote,tryNextTime,
    totalTime,shareText,
  };
}

// ─── SECTION HELPERS ─────────────────────────────────────────────────────────
function ev(h){return SECS.map(s=>({...s,score:s.ck(h)})).sort((a,b)=>b.score-a.score);}
function adv(hand,cid){
  const e=ev(hand),ch=e.find(s=>s.id===cid),top=e[0],alts=e.filter(s=>s.id!==cid&&s.score>0.03).slice(0,2);
  let v="Not optimal",em="😬";
  if(ch&&ch.score>=0.02){if(ch.id===top.id||ch.score>=top.score*0.85){v="Strong choice";em="💪";}else if(ch.score>=top.score*0.55){v="Playable but risky";em="🤔";}}
  const p=ch?(ch.score*100).toFixed(0):"0";
  const topPct=(top.score*100).toFixed(0);
  let r;
  if(v==="Strong choice"){r=`${p}% fit — your tiles aligned well with ${ch?.name}. Solid passing instincts.`;}
  else if(v==="Playable but risky"){r=`${p}% fit for ${ch?.name}, but your tiles leaned more toward ${top.name} (${topPct}%). A pivot earlier could have paid off.`;}
  else{r=`Only ${p}% fit for ${ch?.name}. Your tiles were a much better match for ${top.name} (${topPct}%) — worth practicing that read.`;}
  return{verdict:v,emoji:em,reason:r,alts,top,chosen:ch};
}

// ─── STORAGE & STATE ─────────────────────────────────────────────────────────
const mem={};
const ST={
  get(k,d){try{const v=JSON.parse(localStorage.getItem("rk-"+k));return v!==null?v:d;}catch{return mem[k]!==undefined?mem[k]:d;}},
  set(k,v){try{localStorage.setItem("rk-"+k,JSON.stringify(v));}catch(e){mem[k]=v;if(e.name==="QuotaExceededError")console.warn("localStorage full");}}
};
function getDailySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function getDayNum(){return Math.floor((new Date()-new Date(2026,3,25))/86400000)+1;}

const STREAK_BADGES=[
  {days:3,badge:"🔥",title:"On Fire",desc:"3-day streak"},
  {days:7,badge:"🏆",title:"Week Warrior",desc:"7-day streak"},
  {days:14,badge:"👑",title:"Fortnight Legend",desc:"14-day streak"},
  {days:30,badge:"💎",title:"Monthly Master",desc:"30-day streak"},
];
function getStreakBadge(s){return [...STREAK_BADGES].reverse().find(b=>s>=b.days)||null;}

const RATS=["Mahjong Master","Sharp Player","Solid Hands","Getting There","Keep Going, Rookie","Tough Deal"];
const REMO=["🌟","🏆","💪","👏","👍","🎲"];
const RCOL=["#1B7D4E","#1B7D4E","#2460A8","#2460A8","#B08A35","#B83232"];
function gri(s){return s>=0.4?0:s>=0.3?1:s>=0.2?2:s>=0.12?3:s>=0.05?4:5;}
const F1C=[{dir:"Right",icon:"👉",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Left",icon:"👈",req:0,blind:true,max:3}];
const S2C=[{dir:"Left",icon:"👈",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Right",icon:"👉",req:0,blind:true,max:3}];

function addHist(e){
  const h=ST.get("hist",[]);
  h.push({...e,ts:Date.now()});
  ST.set("hist",h.slice(-100));
  const pid=ST.get("playerId",null);
  if(pid)pushGameHistory({...e,ts:Date.now()},pid);
}
function getHist(){return ST.get("hist",[]);}
function getStats(){
  const h=getHist();if(!h.length)return null;
  const avg=h.reduce((a,e)=>a+e.gi,0)/h.length,best=Math.min(...h.map(e=>e.gi));
  const sc={},sn={};h.forEach(e=>{const s=e.sid||"";sc[s]=(sc[s]||0)+e.gi;sn[s]=(sn[s]||0)+1;});
  const mastery=SECS.map(s=>({...s,avg:sn[s.id]?sc[s.id]/sn[s.id]:null,cnt:sn[s.id]||0}));
  const r5=h.slice(-5),p5=h.slice(-10,-5);
  const ra=r5.length?r5.reduce((a,e)=>a+e.gi,0)/r5.length:null;
  const pa=p5.length?p5.reduce((a,e)=>a+e.gi,0)/p5.length:null;
  const trend=ra!==null&&pa!==null?pa-ra:null;
  const ts=h.filter(e=>e.time>0).map(e=>e.time);
  return{total:h.length,avg,best,mastery,trend,ra,fastest:ts.length?Math.min(...ts):null};
}
function getYesterday(){
  const h=getHist(),y=new Date();y.setDate(y.getDate()-1);
  const ys=y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate();
  return h.find(e=>{const d=new Date(e.ts);return(d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate())===ys;})||null;
}
function getWeekly(){const w=Math.floor((Date.now()-new Date(2026,0,1))/604800000);const ids=["2468","13579","369","cr","wd","aln","sp","2026","q"];return SECS.find(s=>s.id===ids[w%ids.length]);}

// ─── CLUB LEADERBOARD ─────────────────────────────────────────────────────────
// ─── CLUBS — fetched from Supabase, falls back to seed ───────────────────────
const CLUBS_SEED={"1873":{name:"Apex Mahjong Club",emoji:"",location:"Apex, NC"}};
let CLUBS=CLUBS_SEED;
async function fetchClubs(){
  try{
    const res=await fetch(`${SB_URL}/rest/v1/clubs?select=code,name,location,emoji&order=name.asc`,{headers:SB_HEADERS});
    if(!res.ok)return;
    const rows=await res.json();
    if(!rows.length)return;
    const map={};
    rows.forEach(r=>{map[r.code]={name:r.name,location:r.location||"",emoji:r.emoji||""};});
    CLUBS=map;
  }catch{}
}

// ─── STATS SYNC — push game history to Supabase ───────────────────────────────
async function pushGameHistory(entry,playerId){
  if(!playerId)return;
  try{
    await fetch(`${SB_URL}/rest/v1/game_history`,{
      method:"POST",
      headers:{...SB_HEADERS,"Prefer":"resolution=ignore-duplicates"},
      body:JSON.stringify({
        player_id:playerId,
        played_at:new Date(entry.ts||Date.now()).toISOString(),
        mode:entry.mode||"free",
        section_id:entry.sid||null,
        iq_score:entry.iqScore||null,
        rating:entry.rating||null,
        time_secs:entry.time||null,
        day_seed:entry.mode==="daily"?getDailySeed():null,
      }),
    });
  }catch{}
}

async function pullGameHistory(playerId){
  try{
    const res=await fetch(
      `${SB_URL}/rest/v1/game_history?player_id=eq.${playerId}&order=played_at.desc&limit=100`,
      {headers:SB_HEADERS}
    );
    if(!res.ok)return null;
    const rows=await res.json();
    return rows.map(r=>({
      ts:new Date(r.played_at).getTime(),
      mode:r.mode,sid:r.section_id,
      iqScore:r.iq_score,rating:r.rating,
      time:r.time_secs,gi:0,
    }));
  }catch{return null;}
}

function getClubCode(){return ST.get("clubCode",null);}
function setClubCode(c){ST.set("clubCode",c);}
function getClubName(){return ST.get("clubName",null);}
function setClubName(n){ST.set("clubName",n);}

// ─── PROFILE SYSTEM ───────────────────────────────────────────────────────────
function getProfile(){return ST.get("profile",null);}
function setProfile(p){ST.set("profile",p);}

// Upsert profile to Supabase — single source of truth for all profile writes
async function upsertProfile(profile){
  try{
    const body={
      player_id:profile.playerId,
      nickname:profile.nickname,
      club_code:profile.clubCode||null,
      streak:profile.streak||0,
      rounds_played:profile.roundsPlayed||0,
      best_iq:profile.bestIQ||null,
      updated_at:new Date().toISOString(),
    };
    if(profile.passwordHash!==undefined)body.password_hash=profile.passwordHash;
    if(profile.avatarUrl!==undefined)body.avatar_url=profile.avatarUrl;
    if(profile.email!==undefined)body.email=profile.email;
    const res=await fetch(`${SB_URL}/rest/v1/profiles`,{
      method:"POST",
      headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates"},
      body:JSON.stringify(body),
    });
    return res.ok||res.status===201;
  }catch{return false;}
}

// Generate a stable player ID from localStorage
function getOrCreatePlayerId(){
  let id=ST.get("playerId",null);
  if(!id){id="P"+Math.random().toString(36).slice(2,10).toUpperCase();ST.set("playerId",id);}
  return id;
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
async function hashPassword(pw){
  const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function getStoredHash(){return ST.get("profileHash",null);}
function setStoredHash(h){ST.set("profileHash",h);}

async function fetchPasswordHash(playerId){
  try{
    const res=await fetch(`${SB_URL}/rest/v1/profiles?player_id=eq.${playerId}&select=password_hash`,{headers:SB_HEADERS});
    if(!res.ok)return null;
    const rows=await res.json();
    return rows[0]?.password_hash||null;
  }catch{return null;}
}

// Fetch full profile row by email — used for cross-device login
async function fetchProfileByEmail(email){
  try{
    const res=await fetch(`${SB_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,{headers:SB_HEADERS});
    if(!res.ok)return null;
    const rows=await res.json();
    if(!rows.length)return null;
    const r=rows[0];
    return{
      playerId:r.player_id,nickname:r.nickname,clubCode:r.club_code||"",
      avatarUrl:r.avatar_url||"",email:r.email||"",
      streak:r.streak||0,roundsPlayed:r.rounds_played||0,
      bestIQ:r.best_iq||null,passwordHash:r.password_hash||null,
    };
  }catch{return null;}
}

async function uploadAvatar(playerId,file){
  const ext=file.name.split(".").pop()||"jpg";
  const path=`${playerId}.${ext}`;
  const res=await fetch(`${SB_URL}/storage/v1/object/avatars/${path}`,{
    method:"POST",
    headers:{"apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`,"Content-Type":file.type,"x-upsert":"true"},
    body:file,
  });
  if(!res.ok)return null;
  return`${SB_URL}/storage/v1/object/public/avatars/${path}`;
}

function Avatar({url,initial,size=56,fontSize=22,border="2px solid rgba(255,255,255,0.2)"}){
  if(url){
    return<img src={url} alt="Profile photo" style={{width:size,height:size,borderRadius:size/2,objectFit:"cover",border,display:"block",margin:"0 auto"}}/>;
  }
  return(
    <div style={{width:size,height:size,borderRadius:size/2,background:C.jade+"20",border,display:"flex",alignItems:"center",justifyContent:"center",fontSize,fontWeight:700,color:C.jade,flexShrink:0,margin:"0 auto"}}>
      {(initial||"?").charAt(0).toUpperCase()}
    </div>
  );
}

function ProfileScreen({home,streak,rounds,dRes,setScreen}){
  const existingProfile=getProfile();
  const hasProfile=!!(existingProfile&&existingProfile.nickname);
  const hasLocalHash=!!getStoredHash();

  const [mode,setMode]=useState(()=>{
    if(hasProfile)return"view";
    const goto=sessionStorage.getItem("rk-goto");
    if(goto==="signin"){sessionStorage.removeItem("rk-goto");return"signin";}
    return"setup";
  });
  const [profile,setProfileState]=useState(()=>{
    const base=existingProfile||{nickname:"",clubCode:"",avatarUrl:"",email:""};
    const urlClub=getUrlParam("club");
    if(urlClub&&CLUBS[urlClub]&&!base.clubCode)return{...base,clubCode:urlClub};
    return base;
  });
  const [pwInput,setPwInput]=useState("");
  const [pwConfirm,setPwConfirm]=useState("");
  const [pwErr,setPwErr]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [showPwConfirm,setShowPwConfirm]=useState(false);
  const [firstName,setFirstName]=useState(()=>existingProfile?.nickname?existingProfile.nickname.split(" ")[0]:"");
  const [lastName,setLastName]=useState(()=>existingProfile?.nickname?existingProfile.nickname.split(" ").slice(1).join(" "):"");
  const [unlocked,setUnlocked]=useState(!hasLocalHash||!hasProfile);
  const [saving,setSaving]=useState(false);
  const [uploadingPhoto,setUploadingPhoto]=useState(false);
  const [inviting,setInviting]=useState(false);
  const fileInputRef=useRef(null);
  // Sign-in state
  const [loginEmail,setLoginEmail]=useState("");
  const [loginPw,setLoginPw]=useState("");
  const [loginErr,setLoginErr]=useState("");
  const [loginLoading,setLoginLoading]=useState(false);
  const [showLoginPw,setShowLoginPw]=useState(false);

  const bestIQ=getBestIQ();
  const streakBadge=getStreakBadge(streak);
  const myClub=CLUBS[profile.clubCode];
  const hist=getHist().filter(e=>e.iqScore!=null);
  const avgIQ=hist.length?Math.round(hist.reduce((a,e)=>a+e.iqScore,0)/hist.length):null;
  const recentSections=getHist().slice(-5).map(e=>e.section).filter(Boolean);
  const sectionCounts={};
  recentSections.forEach(s=>{const key=s.replace(/^[^\s]+\s/,"").trim();sectionCounts[key]=(sectionCounts[key]||0)+1;});
  const favSection=Object.keys(sectionCounts).sort((a,b)=>sectionCounts[b]-sectionCounts[a])[0]||null;
  const inputStyle={width:"100%",padding:"11px 12px",borderRadius:10,border:`1.5px solid ${C.bdr}`,fontSize:13,fontFamily:F.b,color:C.ink,outline:"none",boxSizing:"border-box",background:"#fff"};

  const saveProfile=async(pw)=>{
    const composedName=(firstName.trim()+(lastName.trim()?" "+lastName.trim():"")).trim();
    if(!composedName)return;
    setSaving(true);
    const pid=getOrCreatePlayerId();
    let pwHash=getStoredHash();
    if(pw){pwHash=await hashPassword(pw);setStoredHash(pwHash);}
    const p={...profile,playerId:pid,nickname:composedName,streak,roundsPlayed:rounds,bestIQ:bestIQ?.score||null};
    setProfile(p);setProfileState(p);
    if(p.clubCode)setClubCode(p.clubCode);else setClubCode(null);
    if(p.nickname)setClubName(p.nickname);
    await upsertProfile({...p,passwordHash:pwHash});
    setSaving(false);setMode("view");setUnlocked(true);
  };

  const tryLogin=async()=>{
    setPwErr("");
    const pid=getOrCreatePlayerId();
    const hash=await hashPassword(pwInput);
    let localHash=getStoredHash();
    if(!localHash){localHash=await fetchPasswordHash(pid);if(localHash)setStoredHash(localHash);}
    if(hash===localHash){setUnlocked(true);setMode("view");setPwInput("");}
    else{setPwErr("Incorrect password. Try again.");}
  };

  const signIn=async()=>{
    setLoginErr("");
    if(!loginEmail.trim()||!loginPw){setLoginErr("Please enter your email and password.");return;}
    setLoginLoading(true);
    const remote=await fetchProfileByEmail(loginEmail.trim().toLowerCase());
    if(!remote){setLoginErr("No account found with that email.");setLoginLoading(false);return;}
    const hash=await hashPassword(loginPw);
    if(hash!==remote.passwordHash){setLoginErr("Incorrect password. Try again.");setLoginLoading(false);return;}
    // Restore profile locally
    const restored={
      nickname:remote.nickname,clubCode:remote.clubCode,
      avatarUrl:remote.avatarUrl,email:remote.email,
      playerId:remote.playerId,
    };
    setProfile(restored);setProfileState(restored);
    setStoredHash(remote.passwordHash);
    ST.set("playerId",remote.playerId);
    if(restored.clubCode)setClubCode(restored.clubCode);
    if(restored.nickname)setClubName(restored.nickname);
    // Pull game history from Supabase to restore stats on new device
    const remoteHist=await pullGameHistory(remote.playerId);
    if(remoteHist&&remoteHist.length){
      const localHist=ST.get("hist",[]);
      const merged=[...localHist,...remoteHist]
        .sort((a,b)=>a.ts-b.ts)
        .filter((e,i,arr)=>i===0||e.ts!==arr[i-1].ts);
      ST.set("hist",merged.slice(-100));
      // Restore streak and rounds from remote profile
      if(remote.streak>ST.get("str",0))ST.set("str",remote.streak);
      if(remote.roundsPlayed>ST.get("rnd",0))ST.set("rnd",remote.roundsPlayed);
    }
    setUnlocked(true);setMode("view");
    setLoginEmail("");setLoginPw("");
    setLoginLoading(false);
  };

  const handlePhotoChange=async(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>5*1024*1024){setPwErr("Photo must be under 5 MB.");return;}
    setUploadingPhoto(true);
    const pid=getOrCreatePlayerId();
    const url=await uploadAvatar(pid,file);
    if(url){
      const updated={...profile,avatarUrl:url};
      setProfileState(updated);setProfile(updated);
      await fetch(`${SB_URL}/rest/v1/profiles?player_id=eq.${pid}`,{
        method:"PATCH",
        headers:{...SB_HEADERS,"Prefer":"return=minimal"},
        body:JSON.stringify({avatar_url:url,updated_at:new Date().toISOString()}),
      });
    }
    setUploadingPhoto(false);
  };

  const invite=()=>{
    const code=profile.clubCode;const club=CLUBS[code];
    const url=code?`playrackle.com?club=${code}`:"playrackle.com";
    const text=`🀄 Play Rackle with me — the daily Charleston IQ trainer for American Mahjong!\n\nJoin ${club?club.name:"our club"} on the leaderboard:\n${url}${code?"\n\nYour club is pre-filled — just tap and join!":""}`;
    window.location.href=`sms:?&body=${encodeURIComponent(text)}`;
    setInviting(true);setTimeout(()=>setInviting(false),3000);
  };

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if(mode==="setup"){
    const pwScore=(()=>{
      let s=0;
      if(pwInput.length>=6)s++;
      if(pwInput.length>=10)s++;
      if(/[A-Z]/.test(pwInput))s++;
      if(/[0-9]/.test(pwInput))s++;
      if(/[^A-Za-z0-9]/.test(pwInput))s++;
      return s;
    })();
    const pwStrong=pwScore>=2&&pwInput.length>=6;
    const pwMeta=pwScore<=1?{label:"Too weak",color:C.cinn,bars:1}:pwScore<=2?{label:"Fair",color:C.gold,bars:2}:pwScore<=3?{label:"Good",color:"#2460A8",bars:3}:{label:"Strong",color:C.jade,bars:4};
    const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email||"");
    const composedName=(firstName.trim()+(lastName.trim()?" "+lastName.trim():"")).trim();
    const canSave=composedName.length>0&&emailValid&&pwStrong&&pwInput===pwConfirm;
    return(
      <div style={S.pg} className="rk-pg">
        <RackleHeader onBack={hasProfile?()=>setMode("view"):home}/>
        <div style={{textAlign:"center",padding:"20px 0 16px"}}>
          <div style={{fontSize:36,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,marginBottom:6}}>Create your Rackle profile</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.6}}>Set a name and password to track your progress and appear on club leaderboards.</div>
        </div>
        <div style={S.card}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>YOUR DETAILS</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Name <span style={{color:C.mut,fontWeight:400}}>(shown on leaderboard)</span></div>
            <div style={{display:"flex",gap:8}}>
              <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First" maxLength={15} style={{...inputStyle,flex:1}}/>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last" maxLength={15} style={{...inputStyle,flex:1}}/>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Email <span style={{color:C.mut,fontWeight:400}}>(private — for account recovery)</span></div>
            <input type="email" value={profile.email||""} onChange={e=>setProfileState(p=>({...p,email:e.target.value}))} placeholder="your@email.com" style={{...inputStyle,border:`1.5px solid ${profile.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)?C.cinn:C.bdr}`}}/>
            {profile.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)&&<div style={{fontSize:10,color:C.cinn,marginTop:4}}>Enter a valid email address.</div>}
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Your Club</div>
            <select value={profile.clubCode} onChange={e=>setProfileState(p=>({...p,clubCode:e.target.value}))} style={{...inputStyle}}>
              <option value="">No club yet</option>
              {Object.entries(CLUBS).map(([code,club])=>(<option key={code} value={code}>{club.name} — {club.location}</option>))}
            </select>
          </div>
          <div style={{height:1,background:C.bdr,margin:"14px 0"}}/>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>SET A PASSWORD</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5,marginBottom:10}}>At least 6 characters. Stored securely — lets you log in on any device.</div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Password</div>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={pwInput} onChange={e=>setPwInput(e.target.value)} placeholder="Min. 6 characters" style={{...inputStyle,paddingRight:40}}/>
              <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:C.mut}}>{showPw?"🙈":"👁"}</button>
            </div>
            {pwInput.length>0&&<div style={{marginTop:8}}>
              <div style={{display:"flex",gap:4,marginBottom:5}}>
                {[1,2,3,4].map(i=>(
                  <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=pwMeta.bars?pwMeta.color:C.bdr,transition:"background 0.2s"}}/>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:700,color:pwMeta.color}}>{pwMeta.label}</span>
                <span style={{fontSize:10,color:C.mut}}>
                  {pwInput.length<6?"Add more characters":!/[A-Z]/.test(pwInput)?"Try a capital letter":!/[0-9]/.test(pwInput)?"Add a number":"Looks good ✓"}
                </span>
              </div>
            </div>}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Confirm Password</div>
            <div style={{position:"relative"}}>
              <input type={showPwConfirm?"text":"password"} value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)} placeholder="Re-enter password" style={{...inputStyle,paddingRight:40,border:`1.5px solid ${pwConfirm.length>0&&pwConfirm!==pwInput?C.cinn:C.bdr}`}}/>
              <button onClick={()=>setShowPwConfirm(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:C.mut}}>{showPwConfirm?"🙈":"👁"}</button>
            </div>
            {pwConfirm.length>0&&pwConfirm!==pwInput&&<div style={{fontSize:11,color:C.cinn,marginTop:4}}>Passwords don't match.</div>}
          </div>
          <button onClick={()=>saveProfile(pwInput)} disabled={!canSave||saving} style={{...S.greenBtn,width:"100%",opacity:canSave?1:0.35}}>
            {saving?"Joining…":"Join Rackle →"}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:16,marginBottom:8}}>
          <span style={{fontSize:12,color:C.mut}}>Already have an account? </span>
          <button onClick={()=>{setMode("signin");setPwInput("");setPwErr("");}} style={{fontSize:12,color:C.jade,fontWeight:700,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Log in</button>
        </div>
        <Footer/>
      </div>
    );
  }

  // ── SIGN IN — existing account, new device ────────────────────────────────
  if(mode==="signin"){
    const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail);
    return(
      <div style={S.pg} className="rk-pg">
        <RackleHeader onBack={home}/>
        <div style={{textAlign:"center",padding:"24px 0 16px"}}>
          <div style={{fontSize:36,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,marginBottom:6}}>Welcome back, Rackler</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.6}}>Pick up where you left off — your streak, IQ history, and club ranking are waiting.</div>
        </div>
        <div style={S.card}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>YOUR ACCOUNT</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Email</div>
            <input type="email" value={loginEmail} onChange={e=>{setLoginEmail(e.target.value);setLoginErr("");}} onKeyDown={e=>e.key==="Enter"&&signIn()} placeholder="your@email.com" autoFocus style={{...inputStyle,border:`1.5px solid ${loginEmail&&!emailValid?C.cinn:C.bdr}`}}/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Password</div>
            <div style={{position:"relative"}}>
              <input type={showLoginPw?"text":"password"} value={loginPw} onChange={e=>{setLoginPw(e.target.value);setLoginErr("");}} onKeyDown={e=>e.key==="Enter"&&signIn()} placeholder="Your password" style={{...inputStyle,paddingRight:40}}/>
              <button onClick={()=>setShowLoginPw(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:C.mut}}>{showLoginPw?"🙈":"👁"}</button>
            </div>
          </div>
          {loginErr&&<div style={{fontSize:12,color:C.cinn,textAlign:"center",marginBottom:10,fontWeight:600}}>{loginErr}</div>}
          <button onClick={signIn} disabled={!emailValid||!loginPw||loginLoading} style={{...S.greenBtn,width:"100%",opacity:emailValid&&loginPw?1:0.35}}>
            {loginLoading?"Checking…":"Log In →"}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:16}}>
          <span style={{fontSize:12,color:C.mut}}>New to Rackle? </span>
          <button onClick={()=>setMode("setup")} style={{fontSize:12,color:C.jade,fontWeight:700,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Create an account</button>
        </div>
        <Footer/>
      </div>
    );
  }

  // ── LOGIN VIEW (reused for mode=login and locked profile) ─────────────────
  if(mode==="login"||(hasProfile&&hasLocalHash&&!unlocked)){
    return(
      <div style={S.pg} className="rk-pg">
        <RackleHeader onBack={home}/>
        <div style={{textAlign:"center",padding:"24px 0 16px"}}>
          <div style={{marginBottom:12}}><Avatar url={profile.avatarUrl} initial={profile.nickname} size={64} border={`2px solid ${C.jade}30`}/></div>
          <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,marginBottom:4}}>Welcome back, {profile.nickname.split(" ")[0]}!</div>
          <div style={{fontSize:12,color:C.mut}}>Enter your password to unlock your profile.</div>
        </div>
        <div style={S.card}>
          <div style={{position:"relative",marginBottom:pwErr?8:14}}>
            <input type={showPw?"text":"password"} value={pwInput} onChange={e=>{setPwInput(e.target.value);setPwErr("");}} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="Your password" autoFocus style={{...inputStyle,paddingRight:40}}/>
            <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,color:C.mut}}>{showPw?"🙈":"👁"}</button>
          </div>
          {pwErr&&<div style={{fontSize:11,color:C.cinn,textAlign:"center",marginBottom:10}}>{pwErr}</div>}
          <button onClick={tryLogin} disabled={!pwInput} style={{...S.greenBtn,width:"100%",opacity:pwInput?1:0.35}}>Unlock →</button>
        </div>
        <div style={{textAlign:"center",marginTop:8}}>
          <button onClick={()=>{setStoredHash(null);setProfile(null);setProfileState({nickname:"",clubCode:"",avatarUrl:"",email:""});setMode("setup");setPwInput("");}} style={{fontSize:11,color:C.mut,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Forgot password? Reset profile</button>
        </div>
        <Footer/>
      </div>
    );
  }

  // ── VIEW PROFILE ───────────────────────────────────────────────────────────
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={{borderRadius:20,overflow:"hidden",background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"24px 20px 20px",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)",marginBottom:12}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:3,fontWeight:700,marginBottom:12}}>PLAYER PROFILE</div>
        <div style={{position:"relative",display:"inline-block",marginBottom:10}}>
          <Avatar url={profile.avatarUrl} initial={profile.nickname} size={72} fontSize={28} border="3px solid rgba(255,255,255,0.25)"/>
          <button onClick={()=>fileInputRef.current?.click()} title="Change photo" style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:13,background:C.jade,border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,lineHeight:1}}>
            {uploadingPhoto?"…":"📷"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{display:"none"}}/>
        </div>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:"#fff",letterSpacing:-0.3,marginBottom:2}}>{profile.nickname}</div>
        {myClub&&<div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:12}}>{myClub.name}</div>}
        <div style={{width:"100%",height:0.5,background:"rgba(255,255,255,0.08)",margin:"12px 0"}}/>
        <div style={{display:"flex",justifyContent:"center",gap:24}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{streak}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>STREAK</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{rounds}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>ROUNDS</div>
          </div>
          {bestIQ&&<><div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{bestIQ.score}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>BEST IQ</div>
          </div></>}
          {avgIQ&&<><div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{avgIQ}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>AVG IQ</div>
          </div></>}
        </div>
        {streakBadge&&<div style={{marginTop:12,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 14px"}}>
          <span style={{fontSize:14}}>{streakBadge.badge}</span>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.8)",fontWeight:700}}>{streakBadge.title}</span>
        </div>}
        {favSection&&<div style={{marginTop:8,fontSize:10,color:"rgba(255,255,255,0.4)"}}>Recent favourite: <span style={{color:"rgba(255,255,255,0.7)",fontWeight:600}}>{favSection}</span></div>}
      </div>

      {hist.length>0&&<div style={{...S.card,marginBottom:12}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>YOUR STATS AT A GLANCE</div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {avgIQ&&<div style={{flex:1,background:C.bg2,borderRadius:10,padding:"10px",textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.jade}}>{avgIQ}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>AVG IQ</div>
          </div>}
          {bestIQ&&<div style={{flex:1,background:C.gold+"08",borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${C.gold}15`}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.gold}}>{bestIQ.score}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>BEST IQ</div>
          </div>}
          <div style={{flex:1,background:C.cinn+"06",borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${C.cinn}15`}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.cinn}}>{streak}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>STREAK</div>
          </div>
        </div>
        <button onClick={()=>setScreen("stats")} style={{width:"100%",background:"none",border:`1px solid ${C.bdr}`,borderRadius:10,padding:"8px 12px",fontSize:12,color:C.jade,cursor:"pointer",fontWeight:600,textAlign:"center"}}>View Full Stats & Progress →</button>
      </div>}

      <div style={{...S.card,marginBottom:8,background:C.jade+"06",borderColor:C.jade+"25"}}>
        <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:8}}>INVITE FRIENDS TO RACKLE</div>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.6,marginBottom:10}}>
          {profile.clubCode?<>Challenge your club — share code <strong>{profile.clubCode}</strong> and get everyone on the leaderboard.</>:"Share Rackle with your mahjong friends and build your club community."}
        </div>
        <button onClick={invite} style={{...S.greenBtn,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span>📲</span><span>{inviting?"Opening Messages…":"Invite via Text"}</span>
        </button>
      </div>

      <div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>YOUR DETAILS</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
          <span style={{fontSize:12,color:C.mut,fontWeight:600}}>Name</span>
          <span style={{fontSize:13,fontWeight:700,color:C.ink}}>{profile.nickname}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
          <span style={{fontSize:12,color:C.mut,fontWeight:600}}>Email</span>
          <span style={{fontSize:13,fontWeight:700,color:C.ink}}>{profile.email||"—"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",marginBottom:10}}>
          <span style={{fontSize:12,color:C.mut,fontWeight:600}}>Club</span>
          <span style={{fontSize:13,fontWeight:700,color:C.ink}}>{myClub?myClub.name:"None"}</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setMode("setup")} style={{...S.oBtn,flex:1}}>Edit Profile</button>
          <button onClick={()=>{setPwInput("");setMode("login");}} style={{...S.oBtn,flex:1}}>Change Password</button>
        </div>
      </div>

      <button onClick={()=>setScreen("settings")} style={{...S.oBtn,width:"100%",marginBottom:8,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <span>⚙</span><span>Settings →</span>
      </button>
      {myClub&&<button onClick={()=>setScreen("leaderboard")} style={{...S.oBtn,width:"100%",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <span>🏆</span><span>View {myClub.name} Leaderboard →</span>
      </button>}
      {getWeeklyRecapData()&&<button onClick={()=>setScreen("recap")} style={{...S.oBtn,width:"100%",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <span>📊</span><span>View Weekly Recap →</span>
      </button>}
      <Footer/>
    </div>
  );
}

// ─── PROFILE PILL ─────────────────────────────────────────────────────────────
function ProfilePill({rounds,streak,setScreen}){
  const profile=getProfile();
  const streakBadge=getStreakBadge(streak);
  const hasProfile=!!(profile&&profile.nickname);
  if(!hasProfile){
    return(
      <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 8px"}}>
        <button onClick={()=>{sessionStorage.setItem("rk-goto","signin");setScreen("profile");}} style={{fontSize:11,color:C.mut,fontWeight:600,background:"none",border:"none",padding:"4px 6px",cursor:"pointer"}}>Log in</button>
        <button onClick={()=>{sessionStorage.removeItem("rk-goto");setScreen("profile");}} style={{fontSize:11,color:C.jade,fontWeight:700,background:"none",border:"none",padding:"4px 6px",cursor:"pointer"}}>Join Rackle</button>
      </div>
    );
  }
  return(
    <button onClick={()=>setScreen("profile")} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",padding:"4px 12px",cursor:"pointer"}}>
      {profile.avatarUrl
        ?<img src={profile.avatarUrl} alt="" style={{width:22,height:22,borderRadius:11,objectFit:"cover",border:`1.5px solid ${C.bdr}`}}/>
        :<span style={{fontSize:11}}>{streakBadge?streakBadge.badge:"👤"}</span>
      }
      <span style={{fontSize:11,color:C.ink,fontWeight:700}}>{profile.nickname.split(" ")[0]}</span>
    </button>
  );
}

// ─── SUPABASE LEADERBOARD ─────────────────────────────────────────────────────
const SB_URL="https://kkyhrwryhebpnbbffmfq.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreWhyd3J5aGVicG5iYmZmbWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1OTM0MjAsImV4cCI6MjA5MzE2OTQyMH0.h_aEOEGfhh8h9iPGwkwzOzh6H7BCAefM6g20gW6IhWE";
const SB_HEADERS={"Content-Type":"application/json","apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`};

async function fetchLBEntries(code){
  try{
    const res=await fetch(
      `${SB_URL}/rest/v1/leaderboard?club_code=eq.${code}&day_seed=eq.${getDailySeed()}&order=iq_score.desc&limit=50`,
      {headers:SB_HEADERS}
    );
    if(!res.ok)return[];
    const rows=await res.json();
    return rows.map(r=>({name:r.name,iqScore:r.iq_score,time:r.time_secs,streak:r.streak,ts:new Date(r.updated_at).getTime()}));
  }catch{return[];}
}

async function fetchPeriodEntries(code,period){
  // period: "weekly" | "monthly" | "alltime"
  const view=`leaderboard_${period}`;
  try{
    const res=await fetch(
      `${SB_URL}/rest/v1/${view}?club_code=eq.${code}&order=iq_score.desc&limit=50`,
      {headers:SB_HEADERS}
    );
    if(!res.ok)return[];
    const rows=await res.json();
    return rows.map(r=>({name:r.name,iqScore:r.iq_score,streak:r.streak,ts:new Date(r.updated_at).getTime()}));
  }catch{return[];}
}

async function fetchYesterdayEntries(code){
  const d=new Date();d.setDate(d.getDate()-1);
  const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  try{
    const res=await fetch(
      `${SB_URL}/rest/v1/leaderboard?club_code=eq.${code}&day_seed=eq.${seed}&order=iq_score.desc&limit=50`,
      {headers:SB_HEADERS}
    );
    if(!res.ok)return[];
    const rows=await res.json();
    return rows.map(r=>({name:r.name,iqScore:r.iq_score,time:r.time_secs,streak:r.streak,ts:new Date(r.updated_at).getTime()}));
  }catch{return[];}
}

async function upsertLBEntry(code,name,iqScore,time,streak){
  try{
    const res=await fetch(`${SB_URL}/rest/v1/leaderboard`,{
      method:"POST",
      headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates"},
      body:JSON.stringify({
        club_code:code,day_seed:getDailySeed(),
        name,iq_score:iqScore,time_secs:time||0,streak:streak||0,
        updated_at:new Date().toISOString(),
      }),
    });
    return res.ok||res.status===201;
  }catch{return false;}
}

async function deleteLBEntry(code,name){
  try{
    await fetch(
      `${SB_URL}/rest/v1/leaderboard?club_code=eq.${code}&day_seed=eq.${getDailySeed()}&name=eq.${encodeURIComponent(name)}`,
      {method:"DELETE",headers:SB_HEADERS}
    );
  }catch{}
}

// Fetch global daily stats — total players + avg IQ across all clubs today
async function fetchDailyStats(){
  try{
    const res=await fetch(
      `${SB_URL}/rest/v1/leaderboard?day_seed=eq.${getDailySeed()}&select=iq_score`,
      {headers:SB_HEADERS}
    );
    if(!res.ok)return null;
    const rows=await res.json();
    if(!rows.length)return null;
    const total=rows.length;
    const avg=Math.round(rows.reduce((s,r)=>s+r.iq_score,0)/total);
    return{total,avg};
  }catch{return null;}
}

// Personal best IQ — scans history for highest iqScore
function getBestIQ(){
  const h=getHist();
  if(!h.length)return null;
  const entries=h.filter(e=>e.iqScore!=null);
  if(!entries.length)return null;
  const best=entries.reduce((a,b)=>b.iqScore>a.iqScore?b:a);
  const daysAgo=Math.floor((Date.now()-best.ts)/86400000);
  return{score:best.iqScore,daysAgo,ts:best.ts};
}

// Nudge — shown after noon if daily not done and user has played before
function shouldShowNudge(dDone){
  if(dDone)return false;
  if(new Date().getHours()<12)return false;
  if(!ST.get("hadFirstDaily",false))return false;
  if(ST.get("nudgeDismissed",null)===getDailySeed())return false;
  return true;
}
const DEFAULT_SETTINGS={tileSize:"normal",haptic:true,showTimer:true,hideStreak:false};

// ─── SMALL UI COMPONENTS ─────────────────────────────────────────────────────
function Ti({t,sel,isNew,onClick,dim,large}){
  const c=tC(t);
  const sz=large?{w:44,h:60,fs:18,fs2:8}:{w:37,h:50,fs:15,fs2:7};
  return(
  <div onClick={onClick} role={onClick?"checkbox":undefined} aria-checked={onClick?sel:undefined}
    aria-label={onClick?`${sel?"Deselect":"Select"} ${tAria(t)}`:tAria(t)} tabIndex={onClick?0:undefined}
    onKeyDown={onClick?(e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();onClick();}})  :undefined}
    style={{width:sz.w,height:sz.h,borderRadius:7,cursor:onClick?"pointer":"default",userSelect:"none",
      background:sel?c+"14":isNew?"#FFFBE7":"linear-gradient(145deg,#fff,#F7F4EE)",
      border:`2px solid ${sel?c:isNew?"#B08A35":"#D5CFC5"}`,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,position:"relative",overflow:"hidden",
      boxShadow:sel?`0 4px 12px ${c}28`:"0 1px 3px rgba(0,0,0,0.06)",
      transform:sel?"translateY(-4px) scale(1.05)":"none",transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      opacity:dim?0.35:1,outline:"none"}}>
    <span aria-hidden="true" style={{fontSize:sz.fs,fontWeight:800,color:c,lineHeight:1,fontFamily:F.d}}>{tL(t)}</span>
    <span aria-hidden="true" style={{fontSize:sz.fs2,color:c,opacity:0.5,fontWeight:700,marginTop:1}}>{tS(t)}</span>
    {sel&&<div aria-hidden="true" style={{position:"absolute",top:0,left:0,right:0,height:2,background:c}}/>}
  </div>);}

// IQ HERO — shared dark jade gradient hero card used in scorecard + home
function IQHero({iq,isDaily,dayNum,section,totalTime}){
  if(!iq)return null;
  const [displayScore,setDisplayScore]=useState(0);
  const [isPB,setIsPB]=useState(false);
  useEffect(()=>{
    // Check personal best before animating
    const hist=getHist().filter(e=>e.iqScore!=null);
    const prevBest=hist.length>1?Math.max(...hist.slice(0,-1).map(e=>e.iqScore)):0;
    if(iq.totalScore>prevBest&&hist.length>0)setIsPB(true);
    // Count-up animation
    const target=iq.totalScore;
    const duration=800;
    const steps=40;
    const interval=duration/steps;
    let step=0;
    const timer=setInterval(()=>{
      step++;
      const progress=step/steps;
      const eased=1-Math.pow(1-progress,3); // ease-out cubic
      setDisplayScore(Math.round(eased*target));
      if(step>=steps){clearInterval(timer);setDisplayScore(target);}
    },interval);
    return()=>clearInterval(timer);
  },[iq.totalScore]);
  return(
    <div style={{borderRadius:20,overflow:"hidden",background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"28px 20px 24px",textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,fontWeight:700,marginBottom:16}}>
        {isDaily?`DAILY RACKLE · #${dayNum}`:"PRACTICE · CHARLESTON IQ"}
      </div>
      <div style={{fontSize:9,color:C.gilt,letterSpacing:3,fontWeight:700,marginBottom:8}}>CHARLESTON IQ</div>
      <div style={{fontFamily:F.d,fontSize:64,fontWeight:900,color:C.gilt,lineHeight:1,letterSpacing:-2,
        textShadow:`0 2px 12px rgba(176,138,53,0.4)`,marginBottom:4}}>{displayScore}</div>
      {isPB&&<div className="rk-pop" style={{display:"inline-flex",alignItems:"center",gap:5,background:C.gilt+"22",border:`1px solid ${C.gilt}40`,borderRadius:20,padding:"4px 12px",marginBottom:8}}>
        <span style={{fontSize:13}}>🏆</span>
        <span style={{fontSize:10,fontWeight:800,color:C.gilt,letterSpacing:1}}>NEW PERSONAL BEST!</span>
      </div>}
      <div style={{width:48,height:1.5,background:`linear-gradient(90deg,transparent,${C.gilt},transparent)`,margin:`${isPB?8:12}px auto 14px`}}/>
      <div style={{fontFamily:F.d,fontSize:21,fontWeight:900,color:"#fff",letterSpacing:-0.3,marginBottom:6}}>{iq.level}</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.5,marginBottom:16,maxWidth:240,marginLeft:"auto",marginRight:"auto"}}>{iq.levelExplanation}</div>
      <div style={{width:"100%",height:0.5,background:"rgba(255,255,255,0.1)",marginBottom:14}}/>
      <div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
        {section&&<div style={{textAlign:"center"}}>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>SECTION</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{section}</div>
        </div>}
        {totalTime>0&&<><div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>TIME</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>⏱ {fT(totalTime)}</div>
        </div></>}
      </div>
    </div>
  );
}

const SHARE_VARIANTS={
  navy:{bg:"linear-gradient(135deg,#1E3A5F,#152A45)",shadow:"rgba(21,42,69,0.32)",color:"#fff"},
  slate:{bg:"linear-gradient(135deg,#3D3530,#2A2420)",shadow:"rgba(42,36,32,0.30)",color:"#fff"},
  gold:{bg:"linear-gradient(135deg,#8A6820,#6B5018)",shadow:"rgba(107,80,24,0.30)",color:"#fff"},
  red:{bg:"linear-gradient(135deg,#9A2828,#7A1E1E)",shadow:"rgba(122,30,30,0.30)",color:"#fff"},
  green:{bg:"linear-gradient(135deg,#2E6B48,#1B5035)",shadow:"rgba(27,80,53,0.28)",color:"#fff"},
  jadepill:{bg:"#1B7D4E0F",shadow:"rgba(27,125,78,0.10)",color:"#1B7D4E",border:`1.5px solid #1B7D4E25`},
  goldpill:{bg:"#B08A350F",shadow:"rgba(176,138,53,0.10)",color:"#221E1A",border:`1.5px solid #B08A3525`},
  card:{bg:"#ffffff",shadow:"rgba(0,0,0,0.06)",color:"#221E1A",border:`1px solid #E3DDD3`},
};
function ShareButton({text,label,sublabel,variant="goldpill"}){
  const [copied,setCopied]=useState(false);
  const share=()=>{
    const smsUrl=`sms:?&body=${encodeURIComponent(text)}`;
    // Try SMS deep-link first; fall back to clipboard
    const a=document.createElement("a");a.href=smsUrl;
    try{
      // On mobile this opens Messages; on desktop it typically fails silently
      window.location.href=smsUrl;
      // After a short delay, if we're still here, offer clipboard
      setTimeout(()=>{
        if(document.hasFocus()&&navigator.clipboard){
          navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);}).catch(()=>{});
        }
      },600);
    }catch{
      if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);}).catch(()=>{});
    }
  };
  const v=SHARE_VARIANTS[variant]||SHARE_VARIANTS.goldpill;
  const isLight=variant==="goldpill"||variant==="jadepill"||variant==="card";
  const iconBg=isLight?`${C.gold}25`:"rgba(255,255,255,0.15)";
  const titleColor=isLight?C.ink:"#fff";
  const subColor=isLight?C.amberB:"rgba(255,255,255,0.7)";
  const arrowColor=isLight?C.amberB:"rgba(255,255,255,0.6)";
  return(
    <div style={{position:"relative"}}>
      <button onClick={share} style={{width:"100%",borderRadius:12,
        background:v.bg,border:v.border||"none",
        cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",
        textAlign:"left",boxShadow:`0 3px 12px ${v.shadow}`,transition:"opacity 0.15s"}}>
        <div style={{width:32,height:32,borderRadius:8,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{copied?"✓":"📲"}</div>
        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:2}}>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:titleColor,lineHeight:1.2}}>{copied?"Copied to clipboard!":label||"Share with your Mahj Club"}</div>
          <div style={{fontSize:11,color:subColor,lineHeight:1.3}}>{copied?"Paste it into your group chat":sublabel||"Challenge your friends · Whose tiles are sharper?"}</div>
        </div>
        <span style={{fontSize:14,color:arrowColor,fontWeight:700,flexShrink:0}}>{copied?"":"›"}</span>
      </button>
    </div>
  );
}

// QUALITY PIP
function QualityPip({quality}){
  const map={strong:{bg:"#1A3D28",color:"#fff",label:"Strong"},weak:{bg:"#4A2A10",color:"#fff",label:"Weak"},mixed:{bg:"#4A3A10",color:"#fff",label:"Mixed"},neutral:{bg:C.bg2,color:C.mut,label:"Neutral"}};
  const m=map[quality]||map.neutral;
  return <span style={{fontSize:9,fontWeight:700,background:m.bg,color:m.color,borderRadius:20,padding:"2px 8px",letterSpacing:1}}>{m.label.toUpperCase()}</span>;
}

// SCORE BAR (all jade)
function ScoreBar({label,score,max,note}){
  const pct=Math.round(score/max*100);
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
        <span style={{fontSize:12,fontWeight:700,color:C.ink}}>{label}</span>
        <span style={{fontSize:12,fontWeight:800,color:C.jade,fontFamily:F.d}}>{score}<span style={{fontSize:9,color:C.mut,fontWeight:400}}>/{max}</span></span>
      </div>
      <div style={{height:6,borderRadius:3,background:C.bdr,overflow:"hidden",marginBottom:note?3:0}}>
        <div className="rk-bar" style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.jade},#22A865)`,
          "--w":`${pct}%`,width:`${pct}%`}}/>
      </div>
      {note&&<div style={{fontSize:10,color:C.mut,lineHeight:1.4}}>{note}</div>}
    </div>
  );
}

// CHIP
function Chip({label,type}){
  const map={
    protect:{bg:C.sage,color:C.sageB,border:`1px solid ${C.sageB}20`},
    weak:{bg:C.amber,color:C.amberB,border:`1px solid ${C.amberB}20`},
    bad:{bg:"#F5EDE6",color:"#5C3010",border:"1px solid rgba(92,48,16,0.15)"},
    neutral:{bg:C.bg2,color:C.mut,border:`1px solid ${C.bdr}`},
  };
  const m=map[type]||map.neutral;
  return <span style={{fontSize:10,fontWeight:600,background:m.bg,color:m.color,border:m.border,borderRadius:20,padding:"3px 10px",display:"inline-block",margin:"2px 3px"}}>{label}</span>;
}

// ─── DAILY SCORECARD — simplified, no tabs, no coach note ─────────────────────
function DailyIQScorecard({iq,hand,passLog,dayNum,section,chosenSec,allSections,onHome,onPractice}){
  const [passOpen,setPassOpen]=useState(false);
  const [dailyStats,setDailyStats]=useState(null);
  if(!iq)return null;
  const shareText=iq.shareText||`🀄 RACKLE #${dayNum}\nCharleston IQ: ${iq.totalScore} · ${iq.level}\nplayrackle.com`;
  useEffect(()=>{fetchDailyStats().then(s=>{if(s&&s.total>1)setDailyStats(s);});},[]);

  // Build section comparison: what they chose vs what they should have
  const chosenSecObj=chosenSec&&SECS.find(s=>s.id===chosenSec);
  const sortedSecs=allSections?[...allSections].sort((a,b)=>b.score-a.score):[];
  const bestFitSec=sortedSecs[0];
  const chosenFit=chosenSec&&allSections?allSections.find(s=>s.id===chosenSec):null;
  const chosenPct=chosenFit?Math.round(chosenFit.score*100):null;
  const bestPct=bestFitSec?Math.round(bestFitSec.score*100):null;
  const sectionMatch=chosenSec===bestFitSec?.id;

  // Concrete coaching feedback (generated from data, no API needed)
  const concreteFeedback=(()=>{
    if(!iq||!passLog)return[];
    const tips=[];
    // 1. Strong tiles passed away
    const meta=SECTION_META[chosenSec]||{};
    const strongNums=meta.strongNums||[];
    const strongTypes=meta.strongTypes||[];
    const allPassedTiles=(passLog||[]).flatMap(p=>p.out||[]);
    const strongPassed=allPassedTiles.filter(t=>{
      if(t.t==="j")return true;
      if(t.t==="f"&&meta.wantsFlowers)return true;
      if(strongTypes.includes(t.t))return true;
      if(t.t==="s"&&strongNums.includes(t.n))return true;
      return false;
    });
    if(strongPassed.length>0){
      const names=[...new Set(strongPassed.map(t=>tLabel(t)))];
      tips.push(`⚠️ You passed ${strongPassed.length} strong tile${strongPassed.length>1?"s":""} (${names.slice(0,3).join(", ")}) — those hurt your ${chosenSecObj?.name||"target"} hand.`);
    }
    // 2. Improvement from passing
    const startingStrong=(iq.distanceToOptimal||{}).distanceCount!==undefined
      ?Math.round(iq.passQualityScore/25*100)
      :null;
    if(startingStrong!==null&&iq.passQualityScore>=18){
      tips.push(`✅ Your pass quality score was ${iq.passQualityScore}/25 — you cleared weak tiles efficiently and improved your rack.`);
    }
    // 3. Section fit delta
    if(!sectionMatch&&bestFitSec&&chosenFit&&bestPct>chosenPct+10){
      tips.push(`💡 Your tiles were a stronger match for ${bestFitSec.icon} ${bestFitSec.name} (${bestPct}%) than ${chosenSecObj?.icon||""} ${chosenSecObj?.name||"your pick"} (${chosenPct}%). Consider switching earlier next time.`);
    }
    // 4. Broken pairs
    if((iq.distanceToOptimal?.brokenPairs||[]).length>0){
      const bp=iq.distanceToOptimal.brokenPairs.slice(0,2);
      tips.push(`🔍 You broke ${bp.length===1?"a pair":"pairs"} (${bp.join(", ")}) during the Charleston — pairs are structural anchors, try to protect them.`);
    }
    // 5. Timing tip
    if(iq.timingScore<=4){
      tips.push(`⏱ You passed very quickly (avg ${Math.round((iq.totalTime||0)/Math.max((passLog||[]).length,1))}s per pass). Give yourself 8–12s to read the rack before each pass.`);
    } else if(iq.timingScore>=9){
      tips.push(`⏱ Excellent pace — ${Math.round((iq.totalTime||0)/Math.max((passLog||[]).length,1))}s per pass average. That's the sweet spot.`);
    }
    return tips.slice(0,3);
  })();
  return(
    <div>
      <div style={{marginBottom:10}}><IQHero iq={iq} isDaily dayNum={dayNum} section={section} totalTime={iq.totalTime||0}/></div>
      {dailyStats&&(()=>{
        const isFirst=!ST.get("hadFirstDaily",false)||ST.get("rnd",0)<=1;
        const profile=getProfile();
        const club=profile?.clubCode?CLUBS[profile.clubCode]:null;
        return(
          <div className="rk-in" style={{display:"flex",alignItems:"center",gap:10,background:C.jade+"08",border:`1px solid ${C.jade}20`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
            <span style={{fontSize:18,flexShrink:0}}>🀄</span>
            <div style={{flex:1}}>
              {isFirst
                ?<div style={{fontSize:12,fontWeight:700,color:C.jade,fontFamily:F.d}}>Welcome to Rackle! You're player #{dailyStats.total} today.</div>
                :<div style={{fontSize:12,fontWeight:700,color:C.jade,fontFamily:F.d}}>{dailyStats.total} players have played today</div>
              }
              <div style={{fontSize:11,color:C.mut,marginTop:1}}>
                Avg IQ: <strong style={{color:C.ink}}>{dailyStats.avg}</strong> · You scored <strong style={{color:iq.totalScore>=dailyStats.avg?C.jade:C.cinn}}>{iq.totalScore>=dailyStats.avg?"above":"below"} average</strong>
                {club&&<span> · {club.name}</span>}
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{...S.card,marginBottom:8}}>
        <div style={{fontFamily:"monospace",fontSize:10,color:C.mut,lineHeight:1.9,whiteSpace:"pre",background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center",borderBottom:`1px solid ${C.bdr}`}}>{shareText}</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <ShareButton text={shareText}/>
          <ShareButton
            text={`🎯 Can you beat my Rackle IQ?\n\nI scored ${iq.totalScore} on Daily #${dayNum} — ${iq.level}.\n\nChallenge link:\nplayrackle.com?challenge=${iq.totalScore}&day=${dayNum}`}
            label="Challenge a Friend"
            sublabel={`Dare them to beat your ${iq.totalScore} IQ`}
            variant="goldpill"
          />
        </div>
      </div>

      {hand&&hand.length>0&&<div style={{...S.card,marginBottom:8}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>FINAL RACK</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t}/>)}</div>
      </div>}

      {/* SECTION CHOSEN VS OPTIMAL */}
      {chosenSecObj&&<div style={{...S.card,marginBottom:8,padding:"12px 14px"}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>SECTION READ</div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,borderRadius:10,padding:"10px",background:sectionMatch?C.jade+"08":"#FFF0E8",border:`1.5px solid ${sectionMatch?C.jade+"30":"#C0602025"}`}}>
            <div style={{fontSize:8,color:sectionMatch?C.jade:"#8A3010",letterSpacing:1.5,fontWeight:700,marginBottom:4}}>YOU CHOSE</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:16}}>{chosenSecObj.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:C.ink}}>{chosenSecObj.name}</div>
                {chosenPct!=null&&<div style={{fontSize:10,color:C.mut}}>{chosenPct}% fit</div>}
              </div>
            </div>
          </div>
          <div style={{flex:1,borderRadius:10,padding:"10px",background:sectionMatch?C.jade+"08":C.sage,border:`1.5px solid ${sectionMatch?C.jade+"30":C.sageB+"30"}`}}>
            <div style={{fontSize:8,color:sectionMatch?C.jade:C.sageB,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>{sectionMatch?"✓ BEST FIT TOO":"BEST FIT WAS"}</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:16}}>{bestFitSec?.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:C.ink}}>{bestFitSec?.name}</div>
                {bestPct!=null&&<div style={{fontSize:10,color:C.mut}}>{bestPct}% fit</div>}
              </div>
            </div>
          </div>
        </div>
        {!sectionMatch&&<div style={{marginTop:8,fontSize:11,color:"#8A3010",lineHeight:1.5,background:"#FFF5F0",borderRadius:8,padding:"7px 10px"}}>💡 Your tiles leaned more toward {bestFitSec?.icon} {bestFitSec?.name}. An earlier pivot could have scored higher.</div>}
        {sectionMatch&&<div style={{marginTop:8,fontSize:11,color:C.jade,lineHeight:1.5,background:C.jade+"08",borderRadius:8,padding:"7px 10px"}}>✓ Great read — your section pick matched your best hand fit.</div>}
      </div>}

      {/* CONCRETE COACHING FEEDBACK */}
      {concreteFeedback.length>0&&<div style={{...S.card,marginBottom:8,background:"linear-gradient(145deg,#FFFFF8,#F8F4EB)",borderColor:C.gold+"30"}}>
        <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:10}}>YOUR HAND BREAKDOWN</div>
        {concreteFeedback.map((tip,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:i<concreteFeedback.length-1?10:0,paddingBottom:i<concreteFeedback.length-1?10:0,borderBottom:i<concreteFeedback.length-1?`1px solid ${C.bdr}`:"none"}}>
            <span style={{fontSize:13,lineHeight:1.4,color:C.ink}}>{tip}</span>
          </div>
        ))}
      </div>}
      <div style={{...S.card,marginBottom:8}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:14}}>SCORE BREAKDOWN</div>
        <ScoreBar label="Direction" score={iq.directionScore} max={40} note={iq.directionExplanation}/>
        <ScoreBar label="Tile Strength" score={iq.tileStrengthScore} max={25}/>
        <ScoreBar label="Pass Quality" score={iq.passQualityScore} max={25}/>
        <ScoreBar label="Timing" score={iq.timingScore} max={10} note={iq.timingInsight}/>
      </div>
      {iq.passInsights&&iq.passInsights.length>0&&<div style={{...S.card,padding:0,overflow:"hidden",marginBottom:8}}>
        <button onClick={()=>setPassOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
          <span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>PASS BREAKDOWN</span>
          <span style={{fontSize:13,color:C.mut}}>{passOpen?"▾":"▸"}</span>
        </button>
        {passOpen&&<div style={{borderTop:`1px solid ${C.bdr}`}} className="rk-in">
          {iq.passInsights.map((p,i)=>{
            const qBg={strong:C.sage,weak:"#FDF0E8",mixed:C.amber,neutral:"#fff"};
            return(<div key={i} style={{background:qBg[p.quality]||"#fff",padding:"10px 14px",borderBottom:i<iq.passInsights.length-1?`1px solid ${C.bdr}`:undefined}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:9,color:C.mut,fontWeight:700,letterSpacing:1}}>{(p.roundName||"Pass").toUpperCase()}</span><QualityPip quality={p.quality}/></div>
              {p.passedTiles&&p.passedTiles.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:6}}>{p.passedTiles.map((t,j)=><Ti key={j} t={t}/>)}</div>}
              <p style={{fontSize:11,color:C.ink,margin:0,lineHeight:1.5}}>{p.insight}</p>
            </div>);
          })}
        </div>}
      </div>}
      {/* PRACTICE MODE CTA — context-aware */}
      {(()=>{
        const lowDir=iq.directionScore<24;
        const lowPass=iq.passQualityScore<15;
        const wrongSec=!sectionMatch&&bestFitSec;
        const lowScore=iq.totalScore<65;
        let headline="Another Round?";
        let sub="Unlimited hands · Build real instincts";
        if(wrongSec){
          headline=`Try ${bestFitSec.name} Next Time`;
          sub=`Your tiles were a better fit — practice reading it faster`;
        } else if(lowDir){
          headline="Work on your Section Read";
          sub="Direction is worth 40pts — it's where IQ is won or lost";
        } else if(lowPass){
          headline="Sharpen Your Passes";
          sub="Practice makes the Charleston feel automatic";
        } else if(lowScore){
          headline="Another Round?";
          sub="Every hand makes your instincts sharper";
        }
        return(
          <button onClick={onPractice} style={{width:"100%",borderRadius:14,background:C.sage,border:`1.5px solid ${C.sageB}30`,cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",marginBottom:8,textAlign:"left"}}>
            <div style={{width:40,height:40,borderRadius:11,background:C.sageB+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🀄</div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
              <div style={{fontSize:8,color:C.sageB,letterSpacing:2,fontWeight:700,marginBottom:1}}>KEEP PRACTISING</div>
              <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:"#1A3D28",lineHeight:1.3}}>{headline}</div>
              <div style={{fontSize:11,color:C.sageB,lineHeight:1.5,marginTop:1}}>{sub}</div>
            </div>
            <span style={{fontSize:14,color:C.sageB,fontWeight:700,flexShrink:0}}>›</span>
          </button>
        );
      })()}

      <MidnightCountdown dn={dayNum}/>

      <div style={{marginBottom:8}}>
        <ShareButton
          text={shareText}
          label="Share with your Mahj Club"
          sublabel={`IQ ${iq.totalScore} · ${iq.level} · Challenge your friends`}
          variant="card"
        />
      </div>
      <button onClick={onHome} style={{...S.oBtn,width:"100%"}}>← Home</button>
    </div>
  );
}

// ─── PRACTICE SCORECARD — full tabbed ─────────────────────────────────────────
function PracticeIQScorecard({iq,hand,passLog,section,chosenSec,allSections,onHome,onDealAgain}){
  const [tab,setTab]=useState(0);
  if(!iq)return null;
  const dist=iq.distanceToOptimal||{};
  const tins=iq.tileInsights||{};

  const tabs=["Overview","Passes","Tiles"];
  return(
    <div>
      <div style={{marginBottom:10}}><IQHero iq={iq} isDaily={false} section={section} totalTime={iq.totalTime||0}/></div>
      <div style={{display:"flex",gap:4,marginBottom:12,background:C.bg2,borderRadius:10,padding:3}}>
        {tabs.map((t,i)=>(<button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:tab===i?"#fff":"transparent",color:tab===i?C.ink:C.mut,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:tab===i?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{t}</button>))}
      </div>

      {/* TAB 0 — OVERVIEW */}
      {tab===0&&<div className="rk-in">
        {/* Final Rack — shown first */}
        {hand&&hand.length>0&&<div style={{...S.card,marginBottom:8}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>FINAL RACK</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t}/>)}</div>
        </div>}

        {/* Score bars */}
        <div style={{...S.card,marginBottom:8}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:14}}>SCORE BREAKDOWN</div>
          <ScoreBar label="Direction" score={iq.directionScore} max={40} note={iq.directionExplanation}/>
          <ScoreBar label="Tile Strength" score={iq.tileStrengthScore} max={25}/>
          <ScoreBar label="Pass Quality" score={iq.passQualityScore} max={25}/>
          <ScoreBar label="Timing" score={iq.timingScore} max={10} note={iq.timingInsight}/>
        </div>

        {/* Distance to Optimal */}
        {dist.distanceCount>0&&<div style={{background:C.amber,border:`1px solid ${C.amberB}25`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.amberB,letterSpacing:2,fontWeight:700,marginBottom:6}}>DISTANCE TO OPTIMAL</div>
          <p style={{fontSize:12,color:C.ink,margin:0,lineHeight:1.6}}>{dist.explanation}</p>
          {dist.keyMistakeRound&&<div style={{fontSize:11,color:C.amberB,marginTop:5,fontWeight:600}}>Key round: {dist.keyMistakeRound}</div>}
        </div>}

        {/* Section comparison */}
        {allSections&&allSections.length>0&&<div style={{...S.card,marginBottom:8}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>SECTION FIT</div>
          {allSections.slice(0,5).map((s,i)=>{
            const isChosen=s.id===chosenSec;const isTop=i===0;
            const pct=Math.round(s.score*100);
            return(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<4?8:0}}>
                <span style={{fontSize:13,flexShrink:0}}>{s.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:isChosen?700:500,color:isChosen?C.ink:C.mut}}>{s.name}{isChosen?" · your pick":""}{isTop&&!isChosen?" · best fit":""}</span>
                    <span style={{fontSize:11,fontWeight:700,color:isChosen?C.jade:C.mut,fontFamily:F.d}}>{pct}%</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:C.bdr,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:isChosen?C.jade:isTop&&!isChosen?C.gold:C.bdr2||"#D5CFC5"}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}

        {/* What Went Well */}
        {iq.strengths&&iq.strengths.length>0&&<div style={{background:C.sage,border:`1px solid ${C.sageB}20`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.sageB,letterSpacing:2,fontWeight:700,marginBottom:8}}>WHAT WENT WELL</div>
          {iq.strengths.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:i<iq.strengths.length-1?6:0}}>
              <span style={{width:16,height:16,borderRadius:8,background:C.sageB,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:900,flexShrink:0,marginTop:1}}>✓</span>
              <span style={{fontSize:12,color:C.ink,lineHeight:1.5}}>{s}</span>
            </div>
          ))}
        </div>}

        {/* Timing */}
        {(()=>{const totalSec=iq.totalTime||0;const rc=3;const avg=Math.round(totalSec/rc);const pace=iq.timingScore>=9?"Elite":iq.timingScore>=7?"Solid":iq.timingScore>=5?"Slow":iq.timingScore>=3?"Deliberate":"Too fast";const paceColor=iq.timingScore>=9?C.jade:iq.timingScore>=7?"#2460A8":iq.timingScore>=5?C.gold:C.cinn;return(
        <div style={{background:C.parch,border:`1px solid ${C.bdr}`,borderRadius:12,padding:"14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>TIMING</div>
            <div style={{display:"flex",alignItems:"baseline",gap:3}}>
              <span style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:paceColor,lineHeight:1}}>{iq.timingScore}</span>
              <span style={{fontSize:10,color:C.mut,fontWeight:400}}>/10</span>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <div style={{flex:1,background:"#fff",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.bdr}`}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>TOTAL TIME</div>
              <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink}}>{fT(totalSec)}</div>
            </div>
            <div style={{flex:1,background:"#fff",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.bdr}`}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>AVG PER PASS</div>
              <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink}}>{avg}s</div>
            </div>
            <div style={{flex:1,background:paceColor+"12",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1.5px solid ${paceColor}30`}}>
              <div style={{fontSize:8,color:paceColor,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>PACE</div>
              <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:paceColor}}>{pace}</div>
            </div>
          </div>
          <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{iq.timingInsight}</div>
          <div style={{marginTop:6,fontSize:10,color:C.mut,lineHeight:1.4}}>Target: <strong style={{color:C.jade}}>8–12s per pass</strong> — decisive, not rushed.</div>
        </div>
        );})()}

        {/* Share */}
        <div style={{...S.card,marginBottom:8}}>
          <div style={{fontFamily:"monospace",fontSize:10,color:C.mut,lineHeight:1.9,whiteSpace:"pre",background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center",borderBottom:`1px solid ${C.bdr}`}}>{iq.shareText}</div>
          <ShareButton text={iq.shareText}/>
        </div>
      </div>}

      {/* TAB 1 — PASSES */}
      {tab===1&&<div className="rk-in">
        {/* Pass summary header */}
        {iq.passInsights&&iq.passInsights.length>0&&(()=>{
          const allPassed=iq.passInsights.flatMap(p=>p.passedTiles||[]);
          const qualCounts={strong:0,mixed:0,weak:0,neutral:0};
          iq.passInsights.forEach(p=>{qualCounts[p.quality]=(qualCounts[p.quality]||0)+1;});
          const cleanRounds=qualCounts.strong;
          const riskyCount=allPassed.filter(t=>t.t==="j"||t.t==="f").length;
          return(
          <div style={{...S.card,background:"linear-gradient(135deg,#F8F4EB,#FBF9F4)",marginBottom:10,borderColor:C.gold+"25"}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>PASS SUMMARY</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{flex:1,background:"#fff",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.bdr}`}}>
                <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>TILES PASSED</div>
                <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink}}>{allPassed.length}</div>
              </div>
              <div style={{flex:1,background:C.sage,borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.sageB}20`}}>
                <div style={{fontSize:8,color:C.sageB,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>CLEAN ROUNDS</div>
                <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.sageB}}>{cleanRounds}/{iq.passInsights.length}</div>
              </div>
              <div style={{flex:1,background:riskyCount>0?"#FDF0E8":C.sage,borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${riskyCount>0?"#8A301020":C.sageB+"20"}`}}>
                <div style={{fontSize:8,color:riskyCount>0?"#8A3010":C.sageB,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>VALUABLES PASSED</div>
                <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:riskyCount>0?"#8A3010":C.sageB}}>{riskyCount}</div>
              </div>
            </div>
            <div style={{fontSize:10,color:C.mut,lineHeight:1.5}}>Pass score: <strong style={{color:iq.passQualityScore>=20?C.jade:iq.passQualityScore>=14?C.ink:C.cinn,fontFamily:F.d}}>{iq.passQualityScore}/25</strong></div>
          </div>
          );
        })()}

        {iq.passInsights&&iq.passInsights.length>0?iq.passInsights.map((p,i)=>{
          const qBg={strong:C.sage,weak:"#FDF0E8",mixed:C.amber,neutral:"#fff"};
          const qColor={strong:C.sageB,weak:"#8A3010",mixed:C.amberB,neutral:C.mut};
          const qIcon={strong:"✓",weak:"✗",mixed:"≈",neutral:"·"};
          const passedStrong=(p.passedTiles||[]).filter(t=>t.t==="j"||t.t==="f").length;
          const passedCount=(p.passedTiles||[]).length;
          return(
            <div key={i} style={{...S.card,background:qBg[p.quality]||"#fff",marginBottom:8,padding:0,overflow:"hidden"}}>
              {/* Header row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px 8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:22,height:22,borderRadius:11,background:qColor[p.quality]||C.mut,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:900,flexShrink:0}}>{qIcon[p.quality]||"·"}</div>
                  <span style={{fontSize:12,color:C.ink,fontWeight:700}}>{p.roundName||"Pass"}</span>
                </div>
                <QualityPip quality={p.quality}/>
              </div>
              {/* Tiles passed */}
              {p.passedTiles&&p.passedTiles.length>0&&<div style={{padding:"0 14px 10px"}}>
                <div style={{fontSize:8,color:qColor[p.quality]||C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>{passedCount} TILE{passedCount!==1?"S":""} PASSED</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>{p.passedTiles.map((t,j)=><Ti key={j} t={t}/>)}</div>
                {/* Tile value tags */}
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:2}}>
                  {p.passedTiles.map((t,j)=>{
                    const isJoker=t.t==="j";const isFlower=t.t==="f";
                    const bg=isJoker?"#5C3010":isFlower?"#7A2A60":"#1A3D28";
                    return <span key={j} style={{fontSize:9,fontWeight:700,borderRadius:20,padding:"2px 8px",background:bg,color:"#fff"}}>{tLabel(t)}{isJoker?" 🃏":isFlower?" 🌸":""}</span>;
                  })}
                </div>
                {passedStrong>0&&<div style={{marginTop:7,fontSize:10,color:"#8A3010",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  <span>⚠️</span><span>{passedStrong} high-value tile{passedStrong>1?"s":""} left your rack</span>
                </div>}
              </div>}
              {/* Insight */}
              <div style={{borderTop:`1px solid ${qColor[p.quality]||C.bdr}25`,padding:"8px 14px"}}>
                <p style={{fontSize:11,color:C.ink,margin:0,lineHeight:1.55}}>{p.insight}</p>
              </div>
            </div>
          );
        }):<div style={{...S.card,textAlign:"center",padding:"24px 14px"}}>
          <div style={{fontSize:11,color:C.mut}}>No pass data recorded for this round.</div>
        </div>}

        {/* All passed tiles summary */}
        {passLog&&passLog.length>0&&<div style={S.card}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>ALL TILES PASSED</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {passLog.flatMap(p=>p.out||[]).map((t,i)=><Ti key={i} t={t}/>)}
          </div>
        </div>}
      </div>}

      {/* TAB 2 — TILES */}
      {tab===2&&<div className="rk-in">
        {/* Deal Again shortcut — premium look */}
        <button onClick={onDealAgain} style={{width:"100%",marginBottom:10,padding:"15px 0",borderRadius:14,border:"none",cursor:"pointer",
          background:`linear-gradient(135deg,${C.jade},#0F5535)`,color:"#fff",
          fontSize:15,fontFamily:F.d,fontWeight:800,letterSpacing:0.8,
          boxShadow:`0 6px 24px rgba(27,125,78,0.35)`,
          display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:18}}>🀄</span>
          <span>Deal Again</span>
          <span style={{fontSize:13,opacity:0.7,fontFamily:F.b,fontWeight:600,letterSpacing:0}}>→</span>
        </button>
        {/* Final rack */}
        {hand&&<div style={S.card}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>FINAL RACK</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t}/>)}</div>
        </div>}

        {tins.protectedTiles&&tins.protectedTiles.length>0&&<div style={{background:C.sage,border:`1px solid ${C.sageB}20`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.sageB,letterSpacing:2,fontWeight:700,marginBottom:6}}>PROTECTED TILES</div>
          <div style={{display:"flex",flexWrap:"wrap"}}>{tins.protectedTiles.map((l,i)=><Chip key={i} label={l} type="protect"/>)}</div>
        </div>}

        {tins.weakKept&&tins.weakKept.length>0&&<div style={{background:C.amber,border:`1px solid ${C.amberB}20`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.amberB,letterSpacing:2,fontWeight:700,marginBottom:6}}>OFF-DIRECTION TILES KEPT</div>
          <div style={{display:"flex",flexWrap:"wrap"}}>{tins.weakKept.map((l,i)=><Chip key={i} label={l} type="weak"/>)}</div>
        </div>}

        {tins.missedTiles&&tins.missedTiles.length>0&&<div style={{background:"#F5EDE6",border:"1px solid rgba(92,48,16,0.12)",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:"#5C3010",letterSpacing:2,fontWeight:700,marginBottom:6}}>USEFUL TILES PASSED</div>
          <div style={{display:"flex",flexWrap:"wrap"}}>{tins.missedTiles.map((l,i)=><Chip key={i} label={l} type="bad"/>)}</div>
        </div>}

        {tins.missedOpportunities&&tins.missedOpportunities.length>0&&<div style={{background:C.amber,border:`1px solid ${C.amberB}20`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.amberB,letterSpacing:2,fontWeight:700,marginBottom:6}}>MISSED OPPORTUNITIES</div>
          {tins.missedOpportunities.map((m,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:i<tins.missedOpportunities.length-1?4:0}}>
              <span style={{color:C.amberB,fontWeight:900,fontSize:12}}>›</span>
              <span style={{fontSize:12,color:C.ink,lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>}
      </div>}

      {/* ACTIONS */}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={onHome} style={{...S.oBtn,flex:1}}>← Home</button>
        <button onClick={onDealAgain} style={{flex:2,padding:"13px 0",background:`linear-gradient(135deg,${C.jade},#0F5535)`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:0.5,cursor:"pointer",boxShadow:`0 4px 16px rgba(27,125,78,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48}}>
          <span>🀄</span><span>Deal Again</span>
        </button>
      </div>
    </div>
  );
}

// IQScorecard router — daily gets simplified, practice gets tabbed
function IQScorecard({iq,hand,passLog,isDaily,dayNum,section,chosenSec,allSections,onHome,onDealAgain,onPractice}){
  if(isDaily)return <DailyIQScorecard iq={iq} hand={hand} passLog={passLog} dayNum={dayNum} section={section} chosenSec={chosenSec} allSections={allSections} onHome={onHome} onPractice={onPractice}/>;
  return <PracticeIQScorecard iq={iq} hand={hand} passLog={passLog} section={section} chosenSec={chosenSec} allSections={allSections} onHome={onHome} onDealAgain={onDealAgain}/>;
}

// ─── STANDALONE SCORECARD SCREEN ─────────────────────────────────────────────
function ScorecardScreen({res,home,dayNum,onPractice}){
  if(!res||!res.iq)return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={{textAlign:"center",padding:"40px 0",color:C.mut}}>No scorecard data available.</div>
    </div>
  );
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <DailyIQScorecard iq={res.iq} hand={res.finalRack||[]} passLog={res.passLog||[]} dayNum={dayNum} section={res.section} chosenSec={res.chosenSec} allSections={res.allSections||[]} onHome={home} onPractice={onPractice}/>
      <Footer/>
    </div>
  );
}

// ─── TUTORIAL STEPS ───────────────────────────────────────────────────────────
const TUTORIAL_STEPS=[
  {title:"Welcome to Rackle! 🀄",body:"Rackle trains your Charleston strategy for American Mahjong (NMJL 2026 card).",detail:"The Charleston is the tile-passing ritual before play. Better passing = better hands. Quick to learn — let's go.",icon:"🀄",tip:null},
  {title:"Your Rack",body:"You're dealt 13 tiles. Each tile belongs to a category: Bam, Crak, Dot, Winds, Dragons, Flowers, or Jokers.",detail:"The goal is to end the Charleston with tiles that align to and can be flexible within a section.",icon:"🎴",tip:null,showTiles:true},
  {title:"The Charleston",body:"You pass tiles in 3 rounds — Right (3 tiles), Over (3 tiles), Left (0–3 tiles, blind).",detail:"'Blind' means you pass before seeing what you receive. Pass your worst tiles. Keep your best.",icon:"👉",tip:"Jokers can NEVER be passed. And why would you want to? They're too valuable!"},
  {title:"Pick Your Section",body:"After passing, choose which hand category (section) you're targeting — like 2468, 369, or Consecutive Run.",detail:"Rackle then scores how well your final rack fits that section. It's like a Charleston performance review.",icon:"🎯",tip:"The 2026 Card in-game guide shows tips for each section."},
  {title:"Get Rated",body:"Your Charleston IQ is a 0–100 score built from Direction, Tile Strength, Pass Quality, and Timing.",detail:"Get a full breakdown with coach notes and per-pass analysis — and share with your Mahj besties!",icon:"🏆",tip:"Play the Daily for a fresh deal every day shared by all players."},
];

// ─── LEAVE MODAL ──────────────────────────────────────────────────────────────
function LeaveModal({onStay,onLeave}){
  return(
    <div role="dialog" aria-modal="true" aria-labelledby="leave-title" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
      <div style={{background:"#fff",borderRadius:20,padding:24,maxWidth:320,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>⚠️</div>
        <h2 id="leave-title" style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 8px",fontWeight:800}}>Leave this game?</h2>
        <p style={{fontSize:13,color:C.mut,margin:"0 0 18px",lineHeight:1.6}}>Your progress and timer will be lost. Return to try again.</p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onStay} autoFocus style={{flex:1,padding:"12px 0",borderRadius:12,border:`1px solid ${C.bdr}`,background:"#fff",cursor:"pointer",fontSize:13,color:C.ink,fontWeight:600}}>Stay</button>
          <button onClick={onLeave} style={{flex:1,padding:"12px 0",borderRadius:12,border:"none",background:C.cinn,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>Leave</button>
        </div>
      </div>
    </div>
  );
}

function StreakBadgeToast({badge,onDismiss}){
  useEffect(()=>{const t=setTimeout(onDismiss,4000);return()=>clearTimeout(t);},[]);
  return(
    <div role="status" aria-live="polite" className="rk-in" style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#fff",borderRadius:16,padding:"12px 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:`2px solid ${C.gold}30`,zIndex:200,display:"flex",alignItems:"center",gap:10,maxWidth:280}}>
      <span style={{fontSize:28}}>{badge.badge}</span>
      <div>
        <div style={{fontSize:13,fontWeight:800,color:C.ink,fontFamily:F.d}}>{badge.title}!</div>
        <div style={{fontSize:11,color:C.mut}}>{badge.desc} streak unlocked</div>
      </div>
    </div>
  );
}

function RackleHeader({onBack}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginBottom:16,paddingTop:2}}>
      <button onClick={onBack} style={{...S.back,position:"absolute",left:0}} aria-label="Back to home">← Back</button>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div>
        <div style={{fontFamily:F.d,fontSize:10,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>The Daily Mahjong Workout.</div>
      </div>
    </div>
  );
}

function Footer(){
  return(
    <div style={{textAlign:"center",padding:"22px 0 8px",marginTop:8}}>
      <div aria-hidden="true" style={{width:40,height:1,background:C.bdr,margin:"0 auto 16px"}}/>
      <div style={{fontSize:12,color:C.jade,fontFamily:F.d,fontStyle:"italic"}}>The Daily Mahjong Workout 🀄</div>
      <div style={{fontSize:11,color:C.mut,marginTop:8,lineHeight:1.6}}>Made for the American Mahjong community</div>
      <div style={{marginTop:12}}><a href="https://playrackle.com" target="_blank" rel="noopener noreferrer" style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,letterSpacing:-0.3,textDecoration:"none"}}>Rackle</a></div>
      <div style={{marginTop:10,display:"flex",justifyContent:"center",alignItems:"center",gap:8}}>
        <a href="https://instagram.com/playrackle" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.ink,textDecoration:"none",fontWeight:600,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 14px"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5.5" stroke={C.ink} strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="4.5" stroke={C.ink} strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1" fill={C.ink}/></svg>
          @playrackle
        </a>
        <a href="mailto:hello@playrackle.com" style={{display:"flex",alignItems:"center",fontSize:12,color:C.ink,textDecoration:"none",fontWeight:600,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 14px"}}>Contact</a>
      </div>
      <div style={{fontSize:10,color:C.mut,marginTop:14,opacity:0.7}}>© {new Date().getFullYear()} <a href="https://playrackle.com" target="_blank" rel="noopener noreferrer" style={{color:C.mut,textDecoration:"none"}}>playrackle.com</a> · All rights reserved</div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function Settings({home,settings,setSettings,showTutorial}){
  const [confirmClear,setConfirmClear]=useState(false);
  const clearHistory=()=>{
    ST.set("hist",[]);ST.set("str",0);ST.set("rnd",0);ST.set("ld",null);ST.set("dd",null);ST.set("dres",null);
    const code=getClubCode();const name=getClubName();
    if(code&&name)deleteLBEntry(code,name);
    ST.set("clubName",null);
    setConfirmClear(false);window.location.reload();
  };
  const Row=({label,sub,children})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.bdr}`}}><div><div style={{fontSize:13,fontWeight:600,color:C.ink}}>{label}</div>{sub&&<div style={{fontSize:11,color:C.mut,marginTop:2}}>{sub}</div>}</div>{children}</div>);
  const Toggle=({val,onChange,label})=>(<button role="switch" aria-checked={val} aria-label={label} onClick={()=>onChange(!val)} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:val?C.jade:"#D5CFC5",position:"relative",transition:"background 0.2s",flexShrink:0}}><span aria-hidden="true" style={{position:"absolute",top:2,left:val?22:2,width:20,height:20,borderRadius:10,background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></button>);
  const upd=(k,v)=>{const n={...settings,[k]:v};setSettings(n);ST.set("settings",n);};
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>DISPLAY</div>
        <Row label="Show Timer" sub="Track how long each Charleston takes"><Toggle val={settings.showTimer} onChange={v=>upd("showTimer",v)} label="Toggle show timer"/></Row>
        <Row label="Show Streak on Home" sub="Display your daily streak card on the home screen"><Toggle val={!settings.hideStreak} onChange={v=>upd("hideStreak",!v)} label="Toggle streak visibility"/></Row>
        <Row label="Tile Size" sub="Larger tiles for easier tapping">
          <div style={{display:"flex",gap:4}}>{["normal","large"].map(sz=>(<button key={sz} onClick={()=>upd("tileSize",sz)} aria-pressed={settings.tileSize===sz} style={{padding:"4px 10px",borderRadius:8,border:`1.5px solid ${settings.tileSize===sz?C.jade:C.bdr}`,background:settings.tileSize===sz?C.jade+"10":"#fff",fontSize:11,fontWeight:600,color:settings.tileSize===sz?C.jade:C.mut,cursor:"pointer",textTransform:"capitalize"}}>{sz}</button>))}</div>
        </Row>
        <Row label="Haptic Feedback" sub="Vibrate on tile selection (mobile)"><Toggle val={settings.haptic} onChange={v=>upd("haptic",v)} label="Toggle haptic feedback"/></Row>
      </div>
      <div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>DATA</div>
        <Row label="Clear History" sub="Reset all stats and streaks">
          {!confirmClear
            ? <button onClick={()=>setConfirmClear(true)} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.cinn}30`,background:C.cinn+"08",fontSize:11,cursor:"pointer",fontWeight:600,color:C.cinn}}>Clear</button>
            : <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,color:C.cinn,fontWeight:600}}>Sure?</span>
                <button onClick={()=>setConfirmClear(false)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.bdr}`,background:"#fff",fontSize:11,cursor:"pointer",fontWeight:600,color:C.ink}}>No</button>
                <button onClick={clearHistory} style={{padding:"5px 10px",borderRadius:8,border:"none",background:C.cinn,fontSize:11,cursor:"pointer",fontWeight:700,color:"#fff"}}>Yes, clear</button>
              </div>}
        </Row>
      </div>
      <div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>ABOUT</div>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.7}}>
          <div><span style={{fontWeight:700}}>Rackle</span> v2.0 · 2026 NMJL Edition</div>
          <div style={{color:C.mut,marginTop:4}}>Daily Charleston strategy trainer. Same deal for every player, every day. Train your game.</div>
          <div style={{marginTop:8}}><a href="https://playrackle.com" style={{color:C.jade,fontWeight:600,textDecoration:"none"}}>playrackle.com</a></div>
        </div>
      </div>
      <div style={{textAlign:"center",padding:"12px 0",marginTop:4}}>
        <button onClick={showTutorial} style={{background:"none",border:"none",color:C.mut,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Replay Tutorial</button>
      </div>
      <Footer/>
    </div>
  );
}

// ─── TUTORIAL ─────────────────────────────────────────────────────────────────
function Tutorial({onDone,onBack}){
  const [step,setStep]=useState(0);const [tapTile,setTapTile]=useState(null);
  const st=TUTORIAL_STEPS[step];const isLast=step===TUTORIAL_STEPS.length-1;
  const sampleTiles=[{t:"s",s:"bam",n:6},{t:"s",s:"crak",n:2},{t:"d",v:"Soap"},{t:"j"},{t:"f"},{t:"w",v:"N"},{t:"s",s:"dot",n:9}];
  return(
    <div style={S.pg} className="rk-pg">
      {onBack&&<RackleHeader onBack={onBack}/>}
      <div style={{textAlign:"center",paddingTop:8,marginBottom:20}}>
        <div className="rk-float" style={{fontSize:36,marginBottom:6}}>{st.icon}</div>
        <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:14}}>
          {TUTORIAL_STEPS.map((_,i)=>(<div key={i} aria-hidden="true" style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?C.jade:i<step?C.jade+"50":C.bdr,transition:"all 0.3s"}}/>))}
        </div>
        <h2 style={{fontFamily:F.d,fontSize:20,color:C.ink,margin:"0 0 10px",fontWeight:800}}>{st.title}</h2>
        <p style={{fontSize:14,color:C.ink,lineHeight:1.7,margin:"0 0 8px",fontWeight:500}}>{st.body}</p>
        <p style={{fontSize:12,color:C.mut,lineHeight:1.7,margin:0}}>{st.detail}</p>
      </div>
      {st.showTiles&&(<div style={{...S.card,marginBottom:16}}><div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>{sampleTiles.map((t,i)=>(<div key={i}><Ti t={t} onClick={()=>setTapTile(tapTile===i?null:i)} sel={tapTile===i}/>{tapTile===i&&<div className="rk-in" style={{textAlign:"center",fontSize:10,color:tC(t),fontWeight:700,marginTop:3}}>{tAria(t)}</div>}</div>))}</div></div>)}
      {st.tip&&(<div style={{background:C.gold+"08",borderRadius:12,padding:"10px 14px",border:`1px solid ${C.gold}25`,marginBottom:16}}><span style={{fontSize:12,color:C.gold,fontWeight:600}}>💡 {st.tip}</span></div>)}
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{...S.oBtn,flex:1}}>← Back</button>}
        {!isLast?(<button onClick={()=>setStep(s=>s+1)} style={{...S.greenBtn,flex:1}}>Next →</button>):(<button onClick={onDone} style={{...S.greenBtn,flex:1}}>Start Playing →</button>)}
      </div>
      <div style={{textAlign:"center",marginTop:12}}><button onClick={onBack||onDone} style={{background:"none",border:"none",color:C.mut,fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Skip tutorial</button></div>
      <Footer/>
    </div>
  );
}

// ─── CARD GUIDE ──────────────────────────────────────────────────────────────
function CardGuideScreen({home}){
  const [exp,setExp]=useState(null);
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>2026 Card Guide</div>
        <p style={{fontSize:12,color:C.mut,margin:"0 0 10px",lineHeight:1.6}}>Hold and pass tips for all 9 hand sections. Tap any section to study it.</p>
      </div>
      {SECS.map(s=>{const o=exp===s.id;return(
        <div key={s.id} style={{...S.card,padding:0,overflow:"hidden",marginBottom:8}}>
          <button onClick={()=>setExp(o?null:s.id)} aria-expanded={o} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:s.color+"12",border:`1px solid ${s.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
              <div><div style={{fontSize:13,fontWeight:800,color:C.ink,marginBottom:2}}>{s.name}</div><div style={{fontSize:11,color:C.mut}}>{s.desc}</div></div>
            </div>
            <span style={{fontSize:13,color:C.mut}}>{o?"▾":"▸"}</span>
          </button>
          {o&&<div style={{padding:"0 16px 14px",borderTop:`1px solid ${C.bdr}`}} className="rk-in">
            <div style={{display:"flex",gap:6,margin:"12px 0 10px"}}>
              <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>✓ HOLD</div><div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.hold}</div></div>
              <div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:8,color:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>✗ PASS</div><div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.pass}</div></div>
            </div>
            <div style={{background:C.gold+"06",borderRadius:8,padding:"8px 10px",marginBottom:s.joker?8:0}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>💡 STRATEGY</div>
              <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{s.combos}</div>
            </div>
            {s.joker&&<div style={{background:"#FFF9E6",borderRadius:8,padding:"8px 10px",border:`1px solid ${C.gold}20`}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>🃏 JOKER TIP</div>
              <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{s.joker}</div>
            </div>}
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}><span style={{fontSize:11,color:C.mut}}>{s.hands} possible hands</span></div>
          </div>}
        </div>);})}
      <Footer/>
    </div>
  );
}

// ─── MIDNIGHT COUNTDOWN ───────────────────────────────────────────────────────
function MidnightCountdown({dn}){
  const [timeLeft,setTimeLeft]=useState("");
  useEffect(()=>{
    const tick=()=>{const now=new Date(),midnight=new Date();midnight.setHours(24,0,0,0);const diff=Math.max(0,midnight-now);const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);setTimeLeft(`${h}h ${m.toString().padStart(2,"0")}m ${s.toString().padStart(2,"0")}s`);};
    tick();const iv=setInterval(tick,1000);return()=>clearInterval(iv);
  },[]);
  return(
    <div style={{textAlign:"center",padding:"20px 0",borderTop:`1px solid ${C.bdr}`,borderBottom:`1px solid ${C.bdr}`,margin:"8px 0"}}>
      <div style={{fontSize:9,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:6}}>NEXT DAILY · #{dn+1}</div>
      <div style={{fontFamily:F.d,fontSize:22,fontWeight:800,color:C.ink,letterSpacing:-0.5,marginBottom:6}}>{timeLeft}</div>
      <div style={{fontSize:11,color:C.mut,fontWeight:500}}>5 minutes a day sharpens your passing strategy.</div>
    </div>
  );
}

function EmailSignup(){
  const [email,setEmail]=useState("");const [done,setDone]=useState(false);const [err,setErr]=useState("");
  const submit=async()=>{
    if(!email.includes("@")){setErr("Please enter a valid email.");return;}
    try{const res=await fetch("https://formspree.io/f/mgodekdb",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});if(!res.ok)throw new Error();setDone(true);setErr("");}
    catch{setErr("Something went wrong. Try again.");}
  };
  return(
    <div style={{...S.card,background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",borderColor:C.jade+"25",marginBottom:8}}>
      <div style={{fontSize:10,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>STAY IN THE LOOP</div>
      {done?(<div style={{textAlign:"center",padding:"8px 0"}}><div style={{fontSize:18,marginBottom:4}}>🀄</div><div style={{fontSize:13,fontWeight:700,color:C.jade}}>You're on the list!</div><div style={{fontSize:11,color:C.mut,marginTop:3}}>We'll let you know when we drop updates.</div></div>):(
        <>
          <p style={{fontSize:12,color:C.mut,margin:"0 0 10px",lineHeight:1.5}}>Get notified about new features, updates, and more.</p>
          <div style={{display:"flex",gap:6}}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="your@email.com" aria-label="Email address for updates" style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${err?C.cinn:C.bdr}`,fontSize:12,fontFamily:F.b,background:"#fff",color:C.ink,outline:"none"}}/>
            <button onClick={submit} style={{padding:"10px 16px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b,whiteSpace:"nowrap"}}>Notify me</button>
          </div>
          {err&&<div style={{fontSize:11,color:C.cinn,marginTop:5}}>{err}</div>}
        </>
      )}
    </div>
  );
}

function ClubCodeEntry({setScreen}){
  const [open,setOpen]=useState(false);
  const [code,setCode]=useState("");
  const [err,setErr]=useState("");

  // Only show club info if there's an active profile
  const profile=getProfile();
  const hasProfile=!!(profile&&profile.nickname);
  const savedCode=hasProfile?getClubCode():null;
  const savedClub=savedCode?CLUBS[savedCode]:null;

  const join=()=>{
    const trimmed=code.trim();
    if(!trimmed){setErr("Enter a 4-digit club code.");return;}
    if(!CLUBS[trimmed]){setErr("Code not recognised. Check with your club organiser.");return;}
    setClubCode(trimmed);setErr("");setCode("");
    setScreen("leaderboard");
  };

  const addClubEmail="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20";

  return(
    <div style={{marginBottom:8}}>
      {/* Collapsed trigger */}
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:open?"12px 12px 0 0":12,background:C.jade+"06",border:`1px solid ${C.jade+"25"}`,cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:6,flex:1}}>
          <div style={{fontSize:10,color:C.jade,letterSpacing:1.5,fontWeight:700}}>COMMUNITY</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,lineHeight:1.2}}>Club Leaderboards</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.4}}>{savedClub?"Climb your club rankings. Win your next game.":"Play with your Mahj club · Post your score. Own the board."}</div>
        </div>
        <span style={{fontSize:11,color:C.jade,opacity:0.7,marginLeft:8}}>{open?"▴":"▾"}</span>
      </button>

      {open&&<div className="rk-in" style={{background:"#fff",border:`1px solid ${C.jade+"25"}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"14px 16px"}}>
        {savedClub?(
          <button onClick={()=>setScreen("leaderboard")} style={{width:"100%",borderRadius:12,background:"#fff",border:`1px solid ${C.bdr}`,cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:10,textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,lineHeight:1.2,marginBottom:4}}>{savedClub.name}</div>
              <div style={{fontSize:11,color:C.mut}}>{savedClub.location}</div>
            </div>
            <button style={{padding:"10px 16px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b,whiteSpace:"nowrap",flexShrink:0}}>Open →</button>
          </button>
        ):(
          <>
            <p style={{fontSize:11,color:C.mut,margin:"0 0 10px",lineHeight:1.55,textAlign:"center"}}>Enter your club's 4-digit code to see today's leaderboard.</p>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:6}}>
              <input
                value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,4))}
                onKeyDown={e=>e.key==="Enter"&&join()}
                placeholder="----"
                maxLength={4}
                style={{width:90,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${err?C.cinn:C.bdr}`,fontSize:14,fontFamily:F.d,fontWeight:700,color:C.ink,outline:"none",textAlign:"center",letterSpacing:3}}
              />
              <button onClick={join} style={{padding:"9px 18px",borderRadius:10,border:`1px solid ${C.bdr}`,background:C.bg2,color:C.ink,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b,whiteSpace:"nowrap"}}>Join</button>
            </div>
            {err&&<div style={{fontSize:11,color:C.cinn,textAlign:"center",marginBottom:6}}>{err}</div>}
          </>
        )}
        <div style={{textAlign:"center",paddingTop:savedClub?0:4,borderTop:savedClub?`1px solid ${C.bdr}`:"none",marginTop:savedClub?10:0}}>
          <a href={addClubEmail} style={{fontSize:11,color:C.mut,textDecoration:"none",opacity:0.7}}>
            + Start your Rackle club leaderboard
          </a>
        </div>
      </div>}
    </div>
  );
}

// ─── LEAVE CLUB BUTTON ────────────────────────────────────────────────────────
function LeaveClubButton({onLeave}){
  const [confirm,setConfirm]=useState(false);
  const leave=()=>{
    setClubCode(null);setClubName(null);
    setConfirm(false);
    if(onLeave)onLeave();
  };
  if(confirm)return(
    <div style={{flex:1,display:"flex",gap:6,alignItems:"center"}}>
      <span style={{fontSize:11,color:C.mut,whiteSpace:"nowrap"}}>Leave club?</span>
      <button onClick={()=>setConfirm(false)} style={{flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${C.bdr}`,background:"#fff",fontSize:12,fontWeight:600,color:C.ink,cursor:"pointer"}}>No</button>
      <button onClick={leave} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",background:C.cinn,fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>Leave</button>
    </div>
  );
  return(
    <button onClick={()=>setConfirm(true)} style={{flex:1,padding:"10px 0",borderRadius:12,border:`1px solid ${C.bdr}`,background:"#fff",fontSize:12,fontWeight:600,color:C.mut,cursor:"pointer"}}>Leave club</button>
  );
}

// ─── PERIOD LEADERBOARD TABLE ─────────────────────────────────────────────────
function PeriodTable({code,period,myName,showTime,fetchFn}){
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    setLoading(true);
    const fn=fetchFn?fetchFn(code):fetchPeriodEntries(code,period);
    fn.then(rows=>{setEntries(rows);setLoading(false);});
  },[code,period]);

  if(loading)return(
    <div style={{textAlign:"center",padding:"24px 14px"}}>
      <div style={{fontSize:20,opacity:0.3,marginBottom:6}}>⏳</div>
      <div style={{fontSize:11,color:C.mut}}>Loading…</div>
    </div>
  );

  if(!entries.length)return(
    <div style={{textAlign:"center",padding:"28px 14px"}}>
      <div style={{fontSize:26,marginBottom:8}}>🀄</div>
      <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,marginBottom:4}}>{period==="yesterday"?"No scores yesterday":"No scores yet"}</div>
      <div style={{fontSize:11,color:C.mut,lineHeight:1.6}}>{period==="yesterday"?"Looks like nobody played yesterday — don't let that happen today.":"Be the first to post a score for this period."}</div>
    </div>
  );

  const cols=showTime
    ?{template:"28px 1fr 44px 44px 36px",headers:["#","Name","IQ","Time","🔥"]}
    :{template:"28px 1fr 52px 36px",headers:["#","Name","IQ","🔥"]};

  return(
    <>
      <div style={{display:"grid",gridTemplateColumns:cols.template,gap:0,padding:"8px 14px",background:C.bg2,borderBottom:`1px solid ${C.bdr}`}}>
        {cols.headers.map((h,i)=>(
          <div key={i} style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,textAlign:i>1?"center":"left"}}>{h}</div>
        ))}
      </div>
      {entries.map((e,i)=>{
        const isMe=myName&&e.name.toLowerCase()===myName.toLowerCase();
        const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
        return(
          <div key={i} style={{display:"grid",gridTemplateColumns:cols.template,gap:0,padding:"11px 14px",background:isMe?C.jade+"06":"#fff",borderBottom:i<entries.length-1?`1px solid ${C.bdr}`:"none",alignItems:"center"}}>
            <div style={{fontSize:13}}>{medal||<span style={{fontFamily:F.d,fontSize:12,fontWeight:700,color:C.mut}}>{i+1}</span>}</div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:isMe?800:600,color:isMe?C.jade:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}{isMe?" (you)":""}</div>
            <div style={{textAlign:"center"}}><span style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn}}>{e.iqScore}</span></div>
            {showTime&&<div style={{textAlign:"center",fontSize:11,color:C.mut,fontFamily:F.d,fontWeight:600}}>{e.time?fT(e.time):"—"}</div>}
            <div style={{textAlign:"center",fontSize:11,color:C.cinn}}>{e.streak>1?e.streak:""}</div>
          </div>
        );
      })}
    </>
  );
}

// ─── LEADERBOARD SHARE CARD ───────────────────────────────────────────────────
function LeaderboardShareCard({code,club,entries,dn}){
  const [saving,setSaving]=useState(false);
  const [done,setDone]=useState(false);
  const cardRef=useRef(null);
  const SANS="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
  const top=entries.slice(0,5);
  const playerCount=entries.length;
  const avgIQ=playerCount>0?Math.round(entries.reduce((s,e)=>s+e.iqScore,0)/playerCount):0;
  const topIQ=entries[0]?.iqScore||0;
  const today=new Date();
  const dateStr=today.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const medal=["🥇","🥈","🥉"];

  const save=async()=>{
    if(!cardRef.current||saving)return;
    setSaving(true);
    await loadHtml2Canvas();
    try{
      const canvas=await window.html2canvas(cardRef.current,{
        scale:3,useCORS:false,allowTaint:true,
        backgroundColor:"#FAF7F1",logging:false,removeContainer:true,
      });
      const blob=await new Promise(r=>canvas.toBlob(r,"image/png"));
      const filename=`rackle-${code}-day${dn}.png`;
      if(navigator.share&&navigator.canShare&&blob){
        try{
          await navigator.share({
            files:[new File([blob],filename,{type:"image/png"})],
            title:`${club.name} · Rackle Day #${dn}`,
            text:`Today's leaderboard for ${club.name} · playrackle.com`,
          });
          setDone(true);setTimeout(()=>setDone(false),3000);
          setSaving(false);return;
        }catch(e){}
      }
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download=filename;a.click();
      URL.revokeObjectURL(url);
      setDone(true);setTimeout(()=>setDone(false),3000);
    }catch(e){console.error(e);}
    setSaving(false);
  };

  if(!entries.length)return null;

  return(
    <div style={{marginBottom:10}}>
      <div ref={cardRef} style={{background:"#FAF7F1",border:"1.5px solid #E3DDD3",borderRadius:16,overflow:"hidden",fontFamily:SANS}}>
        {/* Jade header */}
        <div style={{background:"linear-gradient(135deg,#083D22,#1B7D4E)",padding:"16px 18px 14px"}}>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:3,fontWeight:700,marginBottom:6}}>
            {club.name.toUpperCase()} · DAY #{dn}
          </div>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:17,fontWeight:700,color:"#fff"}}>Today's Board</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{dateStr}</div>
          </div>
          <div style={{display:"flex",gap:20,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
            {[{val:playerCount,label:"PLAYERS"},{val:avgIQ,label:"AVG IQ"},{val:topIQ,label:"TOP IQ"}].map(s=>(
              <div key={s.label}>
                <div style={{fontSize:16,fontWeight:700,color:"#C9A84C",lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:1.5,fontWeight:700,marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Rows */}
        <div style={{padding:"4px 0"}}>
          {top.map((e,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"28px 1fr 44px",padding:"9px 16px",alignItems:"center",background:i%2===0?"#FAF7F1":"#F4F0E8",borderBottom:i<top.length-1?"1px solid #E3DDD3":"none"}}>
              <div style={{fontSize:i<3?15:12,fontWeight:700,color:"#6B6560"}}>{i<3?medal[i]:i+1}</div>
              <div style={{fontSize:13,fontWeight:i===0?700:600,color:"#221E1A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div>
              <div style={{textAlign:"right",fontSize:i===0?17:15,fontWeight:700,color:i===0?"#1B7D4E":"#6B6560"}}>{e.iqScore}</div>
            </div>
          ))}
          {entries.length>5&&(
            <div style={{padding:"8px 16px",fontSize:11,color:"#6B6560",textAlign:"center"}}>+ {entries.length-5} more players</div>
          )}
        </div>
        {/* Footer */}
        <div style={{padding:"10px 16px",borderTop:"1px solid #E3DDD3",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F4F0E8"}}>
          <div style={{fontSize:10,color:"#6B6560"}}>playrackle.com</div>
          <div style={{fontSize:10,fontWeight:700,color:"#1B7D4E",letterSpacing:0.5}}>Code: {code}</div>
        </div>
      </div>
      {/* Share button — outside card, not captured */}
      <button onClick={save} disabled={saving} style={{width:"100%",marginTop:8,padding:"12px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:13,fontWeight:700,cursor:saving?"default":"pointer",opacity:saving?0.7:1,letterSpacing:0.3}}>
        {done?"✓ Saved! Drop it in your group chat":saving?"Saving…":"📸 Share Leaderboard"}
      </button>
    </div>
  );
}

// ─── LEADERBOARD SCREEN ────────────────────────────────────────────────────────
function LeaderboardScreen({home,dRes,streak}){
  const code=getClubCode();
  const club=code?CLUBS[code]:null;
  const dn=getDayNum();
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [nameInput,setNameInput]=useState(getClubName()||"");
  const [submitted,setSubmitted]=useState(false);
  const [nameErr,setNameErr]=useState("");
  const [period,setPeriod]=useState("today");

  const iq=dRes?.iq;
  const myName=getClubName();

  useEffect(()=>{
    if(!code)return;
    setLoading(true);
    fetchLBEntries(code).then(rows=>{
      setEntries(rows);
      if(myName&&rows.some(e=>e.name.toLowerCase()===myName.toLowerCase()))setSubmitted(true);
      setLoading(false);
    });
  },[code]);

  const submit=async()=>{
    if(!nameInput.trim()){setNameErr("Enter your name.");return;}
    if(!iq){setNameErr("Complete today's Daily Rackle first.");return;}
    setSubmitting(true);setNameErr("");
    const name=nameInput.trim();
    setClubName(name);
    const ok=await upsertLBEntry(code,name,iq.totalScore,dRes?.time||0,streak);
    if(ok){
      const updated=await fetchLBEntries(code);
      setEntries(updated);setSubmitted(true);setShowNameForm(false);
    } else {
      setNameErr("Couldn't post score — check your connection and try again.");
    }
    setSubmitting(false);
  };

  if(!club)return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={{textAlign:"center",padding:"40px 0",color:C.mut,fontSize:13}}>No club found. Go back and enter a valid code.</div>
    </div>
  );

  const myEntry=entries.find(e=>myName&&e.name.toLowerCase()===myName.toLowerCase());
  const myRank=myEntry?entries.indexOf(myEntry)+1:null;

  const PERIODS=[
    {id:"yesterday",label:"Yesterday"},
    {id:"today",label:"Today"},
    {id:"weekly",label:"This Week"},
    {id:"monthly",label:"Month"},
    {id:"alltime",label:"All Time"},
  ];

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>

      {/* CLUB HERO */}
      <div style={{borderRadius:20,overflow:"hidden",marginBottom:12,background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"24px 20px 20px",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:3,fontWeight:700,marginBottom:10}}>CLUB LEADERBOARD · #{dn}</div>
        <div style={{fontSize:32,marginBottom:6}}>🀄</div>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:900,color:"#fff",letterSpacing:-0.5,marginBottom:4}}>{club.name}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:16}}>{club.location}</div>
        <div style={{width:"100%",height:0.5,background:"rgba(255,255,255,0.08)",marginBottom:14}}/>
        {loading?(
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Loading today's scores…</div>
        ):(
          <div style={{display:"flex",justifyContent:"center",gap:24}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.gilt}}>{entries.length}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontWeight:700,marginTop:2}}>TODAY</div>
            </div>
            {entries.length>0&&<><div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.gilt}}>{entries[0].iqScore}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontWeight:700,marginTop:2}}>TOP IQ TODAY</div>
            </div></>}
            {myRank&&<><div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.gilt}}>#{myRank}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontWeight:700,marginTop:2}}>YOUR RANK</div>
            </div></>}
          </div>
        )}
      </div>

      {/* SUBMIT YOUR SCORE — always visible inline card when daily done */}
      {iq&&!submitted&&(
        <div style={{borderRadius:16,overflow:"hidden",marginBottom:10,border:`1px solid ${C.bdr}`,background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          {/* Score preview banner */}
          <div style={{background:`linear-gradient(135deg,#2C2420,#1A1612)`,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,255,255,0.15)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:"#fff",lineHeight:1}}>{iq.totalScore}</div>
              <div style={{fontSize:8,color:"rgba(255,255,255,0.7)",fontWeight:700,letterSpacing:0.5}}>IQ</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:"#fff",lineHeight:1,marginBottom:3}}>Post your score</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.4}}>{iq.level} · ⏱ {fT(dRes?.time||0)}{streak>1?` · 🔥 ${streak}d streak`:""}</div>
            </div>
          </div>
          {/* Name + submit inline */}
          <div style={{padding:"12px 14px"}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>YOUR NAME ON THE BOARD</div>
            <div style={{display:"flex",gap:6}}>
              <input
                value={nameInput}
                onChange={e=>setNameInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&submit()}
                placeholder={getClubName()||"Your name or nickname"}
                maxLength={20}
                style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${nameErr?C.cinn:C.bdr}`,fontSize:13,fontFamily:F.b,color:C.ink,outline:"none",minWidth:0}}
              />
              <button
                onClick={submit}
                disabled={submitting||!nameInput.trim()}
                style={{padding:"10px 18px",borderRadius:10,border:"none",background:nameInput.trim()?`linear-gradient(135deg,${C.jade},#156B42)`:"#D5CFC5",color:"#fff",fontSize:13,fontFamily:F.d,fontWeight:800,cursor:nameInput.trim()?"pointer":"default",whiteSpace:"nowrap",transition:"background 0.2s",flexShrink:0}}
              >
                {submitting?"…":"Post"}
              </button>
            </div>
            {nameErr&&<div style={{fontSize:11,color:C.cinn,marginTop:5}}>{nameErr}</div>}
          </div>
        </div>
      )}

      {submitted&&myEntry&&<div style={{borderRadius:14,overflow:"hidden",marginBottom:10,border:`1.5px solid ${C.sageB}25`,background:C.sage}}>
        <div style={{background:`linear-gradient(135deg,${C.sageB},#3A6B52)`,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✓</div>
          <div>
            <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:"#fff",lineHeight:1,marginBottom:2}}>Score posted!</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>You're #{myRank} today · IQ {myEntry.iqScore}</div>
          </div>
        </div>
        {/* Invite your club prompt */}
        <div style={{padding:"12px 14px"}}>
          <div style={{fontSize:11,color:C.sageB,marginBottom:8,lineHeight:1.5}}>📣 Not everyone in your club is on the board yet — invite them to play today.</div>
          {(()=>{
            const smsText=encodeURIComponent(`🀄 I scored ${myEntry?.iqScore} on today's Rackle — #${myRank} in ${club?.name||"our club"}.\nThink you can beat me?\nplayrackle.com · Club code: ${code}`);
            return(
              <a
                href={`sms:?&body=${smsText}`}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"11px 0",borderRadius:12,background:`linear-gradient(135deg,${C.sageB},#3A6B52)`,color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none",boxSizing:"border-box"}}
              >
                💬 Challenge your club via text
              </a>
            );
          })()}
        </div>
      </div>}

      {!iq&&!submitted&&<div style={{...S.card,marginBottom:10,background:C.amber,borderColor:C.amberB+"20"}}>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>🎯 <strong>Complete today's Daily Rackle</strong> to add your score to the leaderboard.</div>
      </div>}

      {/* SHARE LEADERBOARD CARD */}
      {entries.length>0&&<LeaderboardShareCard code={code} club={club} entries={entries} dn={dn}/>}

      {/* PERIOD TABS */}
      <div style={{display:"flex",gap:4,marginBottom:8,background:C.bg2,borderRadius:10,padding:3}}>
        {PERIODS.map(p=>(
          <button key={p.id} onClick={()=>setPeriod(p.id)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",
            background:period===p.id?"#fff":"transparent",
            color:period===p.id?C.ink:C.mut,
            fontSize:11,fontWeight:700,cursor:"pointer",
            transition:"all 0.2s",
            boxShadow:period===p.id?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>
            {p.label}
          </button>
        ))}
      </div>

      {/* LEADERBOARD TABLE */}
      <div style={{...S.card,padding:0,overflow:"hidden",marginBottom:8}}>
        {period==="today"?(
          loading?(
            <div style={{textAlign:"center",padding:"24px 14px"}}>
              <div style={{fontSize:20,opacity:0.3,marginBottom:6}}>⏳</div>
              <div style={{fontSize:11,color:C.mut}}>Loading scores…</div>
            </div>
          ):entries.length>0?(
            <>
              <div style={{display:"grid",gridTemplateColumns:"28px 1fr 44px 44px 36px",gap:0,padding:"8px 14px",background:C.bg2,borderBottom:`1px solid ${C.bdr}`}}>
                {["#","Name","IQ","Time","🔥"].map((h,i)=>(
                  <div key={i} style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,textAlign:i>1?"center":"left"}}>{h}</div>
                ))}
              </div>
              {entries.map((e,i)=>{
                const isMe=myName&&e.name.toLowerCase()===myName.toLowerCase();
                const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
                return(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"28px 1fr 44px 44px 36px",gap:0,padding:"11px 14px",background:isMe?C.jade+"06":"#fff",borderBottom:i<entries.length-1?`1px solid ${C.bdr}`:"none",alignItems:"center"}}>
                    <div style={{fontSize:13}}>{medal||<span style={{fontFamily:F.d,fontSize:12,fontWeight:700,color:C.mut}}>{i+1}</span>}</div>
                    <div style={{fontFamily:F.d,fontSize:13,fontWeight:isMe?800:600,color:isMe?C.jade:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}{isMe?" (you)":""}</div>
                    <div style={{textAlign:"center"}}><span style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn}}>{e.iqScore}</span></div>
                    <div style={{textAlign:"center",fontSize:11,color:C.mut,fontFamily:F.d,fontWeight:600}}>{e.time?fT(e.time):"—"}</div>
                    <div style={{textAlign:"center",fontSize:11,color:C.cinn}}>{e.streak>1?e.streak:""}</div>
                  </div>
                );
              })}
            </>
          ):(
            <div style={{textAlign:"center",padding:"28px 20px"}}>
              <div style={{fontSize:30,marginBottom:10}}>🥇</div>
              <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.ink,marginBottom:6}}>Be first on the board today</div>
              <div style={{fontSize:12,color:C.mut,lineHeight:1.7,maxWidth:240,margin:"0 auto"}}>No one from {club?.name||"your club"} has posted yet — play the Daily and claim the top spot.</div>
            </div>
          )
        ):period==="yesterday"?(
          <PeriodTable code={code} period="yesterday" myName={myName} showTime fetchFn={fetchYesterdayEntries}/>
        ):(
          <PeriodTable code={code} period={period} myName={myName} showTime={false}/>
        )}
      </div>

      <div style={{fontSize:10,color:C.mut,textAlign:"center",lineHeight:1.5,opacity:0.7,marginBottom:12}}>
        {period==="yesterday"?"Yesterday's final board":period==="today"?"Resets daily at midnight":period==="weekly"?"Best score per player · Mon–Sun":period==="monthly"?"Best score per player · this month":"Best score per player · all time"} · Code: {code}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={home} style={{...S.oBtn,flex:1}}>← Home</button>
        <LeaveClubButton onLeave={home}/>
      </div>
      <Footer/>
    </div>
  );
}

// ─── STATS PILL — collapsed by default, tap to expand ────────────────────────
function Statspill({streak,rounds,bestIQ,streakBadge}){
  const [open,setOpen]=useState(false);
  const hasAny=streak>0||rounds>0||bestIQ;

  // Collapsed pill — shows most prominent stat
  const icon=streak>0?(streakBadge?streakBadge.badge:"🔥"):bestIQ?"⭐":"🎲";
  const value=streak>0?`${streak}-day`:bestIQ?bestIQ.score:rounds;
  const label=streak>0?"streak":bestIQ?"best IQ":"rounds";
  const color=streak>0?C.cinn:bestIQ?C.gold:C.mut;
  const bg=streak>0?C.cinn+"08":bestIQ?C.gold+"08":C.bg2;
  const border=streak>0?`1px solid ${C.cinn}20`:bestIQ?`1px solid ${C.gold}20`:`1px solid ${C.bdr}`;

  if(!hasAny)return null;

  return(
    <div>
      {/* Collapsed pill */}
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:5,background:bg,border,borderRadius:8,padding:"4px 12px",cursor:"pointer"}}>
        <span style={{fontSize:11}}>{icon}</span>
        <span style={{fontFamily:F.d,fontSize:12,fontWeight:800,color}}>{value}</span>
        <span style={{fontSize:11,color,fontWeight:600,opacity:0.8}}>{label}</span>
        <span style={{fontSize:9,color,opacity:0.5,marginLeft:1}}>{open?"▴":"▾"}</span>
      </button>

      {/* Expanded panel */}
      {open&&<div className="rk-in" style={{marginTop:6,background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:14,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",minWidth:180}}>
        {streak>0&&<div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:8,borderBottom:rounds>0||bestIQ?`1px solid ${C.bdr}`:"none",marginBottom:rounds>0||bestIQ?8:0}}>
          <span style={{fontSize:16}}>{streakBadge?streakBadge.badge:"🔥"}</span>
          <div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.cinn,lineHeight:1}}>{streak}-day streak{streakBadge?` · ${streakBadge.title}`:""}</div>
            <div style={{fontSize:10,color:C.mut,marginTop:2}}>{streakBadge?streakBadge.desc:"Keep playing daily!"}</div>
          </div>
        </div>}
        {rounds>0&&<div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:bestIQ?8:0,borderBottom:bestIQ?`1px solid ${C.bdr}`:"none",marginBottom:bestIQ?8:0}}>
          <span style={{fontSize:16}}>🎲</span>
          <div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1}}>{rounds} rounds played</div>
            <div style={{fontSize:10,color:C.mut,marginTop:2}}>All time</div>
          </div>
        </div>}
        {bestIQ&&<div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>⭐</span>
          <div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.gold,lineHeight:1}}>IQ {bestIQ.score} · Personal best</div>
            <div style={{fontSize:10,color:C.mut,marginTop:2}}>{bestIQ.daysAgo===0?"Set today":bestIQ.daysAgo===1?"Set yesterday":`Set ${bestIQ.daysAgo} days ago`}</div>
          </div>
        </div>}
      </div>}
    </div>
  );
}

// ─── IQ SPARKLINE — last 7 scored games ──────────────────────────────────────
// ─── STREAK + SPARKLINE CARD — collapsible, merged ───────────────────────────
function getStreakNudge(streak,pct,daysLeft,nextBadge,bestIQ,clubName){
  const seed=(getDayNum()+streak)%7;
  const closePool=daysLeft===1?[
    `One more day — ${nextBadge?.title} is yours.`,
    `Tomorrow it's official. Don't break now.`,
    `You're one tile away from glory.`,
  ]:daysLeft<=2?[
    `${nextBadge?.title} is right there. Keep showing up.`,
    `Almost — don't let the tiles cool off now.`,
    `Two days. You've got this.`,
  ]:[];
  const highPctPool=pct>=70?[
    `You're in the home stretch — most players quit before this point.`,
    `Consistency is its own skill. You're proving it.`,
    `${clubName?`${clubName} is watching. `:""}Keep the streak alive.`,
  ]:[];
  const bestIQPool=bestIQ&&bestIQ.score>=80?[
    `Strong IQ, strong streak — you're playing serious Mahj.`,
    `Your tiles know what they're doing. Keep it up.`,
  ]:bestIQ&&bestIQ.score>=60?[
    `Your game is improving — the streak is how you get there.`,
    `Daily practice is exactly how IQ goes up.`,
  ]:[];
  const generalPool=[
    `Every day you play, your Charleston gets sharper.`,
    `Consistency beats talent. You're building it.`,
    `${clubName?`The ${clubName} leaderboard respects a streak.`:"The leaderboard respects a streak."}`,
    `Most players never make it past ${streak} days. You have.`,
    `Show up tomorrow and the tiles will follow.`,
    `Streaks compound. So does Charleston IQ.`,
    `The best players aren't more talented — they just play every day.`,
  ];
  const pool=[...closePool,...highPctPool,...bestIQPool,...generalPool];
  return pool[seed%pool.length];
}

function StreakCard({streak,streakBadge,bestIQ,clubName,onStats,firstName}){
  const [collapsed,setCollapsed]=useState(false);
  const nextBadge=STREAK_BADGES.find(b=>b.days>streak);
  const pct=nextBadge?Math.round((streak/nextBadge.days)*100):100;
  const daysLeft=nextBadge?nextBadge.days-streak:0;
  const nudge=nextBadge?getStreakNudge(streak,pct,daysLeft,nextBadge,bestIQ,clubName):null;

  // Sparkline data
  const hist=getHist().filter(e=>e.iqScore!=null).slice(-7);
  const hasSparkline=hist.length>=3;
  const scores=hist.map(e=>e.iqScore);
  const spkMin=hasSparkline?Math.max(0,Math.min(...scores)-10):0;
  const spkMax=hasSparkline?Math.min(100,Math.max(...scores)+10):100;
  const spkRange=spkMax-spkMin||1;
  const W=260,H=34,pad=4;
  const iW=hasSparkline?(W-pad*2)/(scores.length-1):0;
  const pts=hasSparkline?scores.map((s,i)=>[pad+i*iW, H-pad-((s-spkMin)/spkRange)*(H-pad*2)]):[];
  const polyline=pts.map(([x,y])=>`${x},${y}`).join(" ");
  const latest=hasSparkline?scores[scores.length-1]:null;
  const prev=hasSparkline?scores[scores.length-2]:null;
  const delta=hasSparkline?latest-prev:0;
  const trendCol=delta>0?C.jade:delta<0?C.cinn:C.mut;
  const avg=hasSparkline?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
  const improving=hasSparkline&&scores[scores.length-1]>scores[0];

  return(
    <div style={{...S.card,padding:0,marginBottom:8,marginTop:8,background:C.gold+"06",borderColor:C.gold+"25",overflow:"hidden"}}>

      {/* Header row — always visible, tappable */}
      <button
        onClick={()=>setCollapsed(c=>!c)}
        aria-label={collapsed?"Expand streak card":"Collapse streak card"}
        style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}
      >
        <span style={{fontSize:22,flexShrink:0}}>{streakBadge?streakBadge.badge:"🔥"}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:800,color:C.ink,fontFamily:F.d,lineHeight:1.2}}>
            {streak}-day streak{streakBadge?(firstName?` · You're on fire, ${firstName}!`:` · ${streakBadge.title}`):""}
          </div>
        </div>
        <span style={{fontSize:12,color:C.mut,opacity:0.5,flexShrink:0,transition:"transform 0.2s",transform:collapsed?"rotate(0deg)":"rotate(180deg)"}}>▾</span>
      </button>

      {/* Expandable body */}
      {!collapsed&&(
        <div style={{padding:"0 14px 12px"}}>

          {/* Streak progress */}
          {nextBadge?(
            <>
              <div style={{fontSize:11,color:C.mut,marginBottom:6}}>
                {daysLeft} more day{daysLeft!==1?"s":""} to unlock {nextBadge.badge} <strong style={{color:C.ink}}>{nextBadge.title}</strong>
              </div>
              <div style={{height:5,borderRadius:3,background:C.bdr,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.gold},#C99F3A)`,width:`${pct}%`,transition:"width 0.6s ease"}}/>
              </div>
              <div style={{fontSize:10,color:C.mut,marginTop:4,opacity:0.7,lineHeight:1.5}}>
                {pct}% of the way there{nudge&&<> · <span style={{fontStyle:"italic"}}>{nudge}</span></>}
              </div>
            </>
          ):(
            <div style={{fontSize:11,color:C.mut,marginBottom:6}}>You've unlocked every badge — keep the streak alive! 💎</div>
          )}

          {/* Sparkline — only if enough history */}
          {hasSparkline&&(
            <div style={{margin:"10px -14px -12px",background:"#fff",borderTop:`1px solid ${C.bdr}`,padding:"10px 14px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>LAST {scores.length} GAMES</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:9,color:C.mut}}>avg <strong style={{color:C.ink}}>{avg}</strong></span>
                  <span style={{fontSize:9,fontWeight:700,color:trendCol}}>{delta!==0?(delta>0?`+${delta}`:`${delta}`):"—"}</span>
                </div>
              </div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible",display:"block"}}>
                <defs>
                  <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.jade} stopOpacity="0.12"/>
                    <stop offset="100%" stopColor={C.jade} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <polygon points={`${pts[0][0]},${H} ${polyline} ${pts[pts.length-1][0]},${H}`} fill="url(#spkGrad)"/>
                <polyline points={polyline} fill="none" stroke={C.jade} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round"/>
                {pts.map(([x,y],i)=>{
                  const isLatest=i===pts.length-1;
                  const s=scores[i];
                  const col=s>=80?C.jade:s>=60?C.gold:C.cinn;
                  return(
                    <g key={i}>
                      <circle cx={x} cy={y} r={isLatest?3:2} fill={isLatest?col:"#fff"} stroke={col} strokeWidth={isLatest?0:1}/>
                      {isLatest&&<text x={x} y={y-6} textAnchor="middle" fontSize="6" fontWeight="700" fill={col}>{s}</text>}
                    </g>
                  );
                })}
              </svg>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                <div style={{fontSize:9,color:C.mut,fontStyle:"italic",opacity:0.8}}>
                  {improving?"Trending up — keep the momentum.":"Consistency wins. Keep showing up daily."}
                </div>
                {onStats&&<button onClick={onStats} style={{background:"none",border:"none",fontSize:9,color:C.jade,fontWeight:700,cursor:"pointer",padding:0,flexShrink:0,marginLeft:8}}>Full stats →</button>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({streak,rounds,dDone,dRes,showHelp,setShowHelp,go,showStats,showSettings,showTutorial,showCardGuide,settings,showScorecard,setScreen}){
  const dn=getDayNum(),wk=getWeekly(),yd=getYesterday();
  const streakBadge=getStreakBadge(streak);
  const iq=dRes?.iq;
  const bestIQ=getBestIQ();
  const profile=getProfile();
  const club=profile?.clubCode?CLUBS[profile.clubCode]:null;
  const nudge=shouldShowNudge(dDone);
  const [nudgeDismissed,setNudgeDismissed]=useState(ST.get("nudgeDismissed",null)===getDailySeed());
  const dismissNudge=()=>{ST.set("nudgeDismissed",getDailySeed());setNudgeDismissed(true);};

  // Build share text fresh every render
  const passEmoji=(iq?.passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");
  const shareText=iq
    ?`🀄 RACKLE #${dn}\nCharleston IQ: ${iq.totalScore} · ${iq.level}\n${passEmoji?`Passes: ${passEmoji}\n`:""}Time: ${fT(iq.totalTime||0)}\nplayrackle.com`
    :dRes?`🀄 Rackle #${dn} · ${dRes.rating} ${dRes.emoji}\n${dRes.section||""}\nplayrackle.com`:"";

  return(
    <div style={S.pg} className="rk-pg">
      {/* NUDGE BANNER — shown after noon if daily not done */}
      {nudge&&!nudgeDismissed&&<div className="rk-in" style={{display:"flex",alignItems:"center",gap:10,background:`linear-gradient(135deg,${C.jade}12,${C.jade}06)`,border:`1px solid ${C.jade}25`,borderRadius:14,padding:"10px 14px",marginBottom:10,marginTop:8}}>
        <span style={{fontSize:20,flexShrink:0}}>⏰</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:C.jade,fontFamily:F.d}}>Don't forget your Daily!</div>
          <div style={{fontSize:11,color:C.mut,marginTop:1}}>Today's Rackle is waiting — same hand for every player.</div>
        </div>
        <button onClick={dismissNudge} style={{background:"none",border:"none",color:C.mut,fontSize:16,cursor:"pointer",padding:"2px 4px",lineHeight:1,flexShrink:0}}>✕</button>
      </div>}

      {/* TOP BAR */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"flex-end",marginBottom:0,marginTop:8}}>
        <div style={{flex:1}}><Statspill streak={streak} rounds={rounds} bestIQ={bestIQ} streakBadge={streakBadge}/></div>
        <div style={{display:"flex",alignItems:"center",background:streak>0?C.cinn+"08":bestIQ?C.gold+"08":C.bg2,border:streak>0?`1px solid ${C.cinn}20`:bestIQ?`1px solid ${C.gold}20`:`1px solid ${C.bdr}`,borderRadius:8,overflow:"hidden",flexShrink:0}}>
          <ProfilePill rounds={rounds} streak={streak} setScreen={setScreen}/>
          <div style={{width:1,alignSelf:"stretch",background:C.bdr}}/>
          <button onClick={showSettings} aria-label="Open settings" style={{background:"none",border:"none",padding:"4px 12px",cursor:"pointer",fontSize:13,color:C.mut,display:"flex",alignItems:"center"}}>⚙</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{textAlign:"center",padding:"30px 0 10px"}}>
        <div className="rk-float" style={{fontSize:40,marginBottom:10,lineHeight:1}}>🀄</div>
        <h1 style={{fontFamily:F.d,fontSize:48,color:C.ink,margin:"0 0 6px",fontWeight:900,letterSpacing:-2.5,lineHeight:1}}>Rackle</h1>
        <p style={{fontFamily:F.d,fontSize:16,color:C.jade,margin:"0 0 10px",fontWeight:600,fontStyle:"italic",letterSpacing:0.3}}>The Daily Mahjong Workout.</p>
        <p style={{fontSize:11,color:C.mut,margin:"0 0 2px",lineHeight:1.6}}>Rate your Charleston. Track your improvement.</p>
        <p style={{fontSize:11,color:C.mut,margin:0,lineHeight:1.6,fontWeight:600}}>Share with your Mahj club.</p>
      </div>

      {streak>0&&!settings?.hideStreak&&<StreakCard streak={streak} streakBadge={streakBadge} bestIQ={bestIQ} clubName={club?.name||null} onStats={showStats} firstName={profile?.nickname?profile.nickname.split(" ")[0]:null}/>}

      {/* FIRST-VISIT TUTORIAL NUDGE */}
      {rounds===0&&!ST.get("tutorialDismissed",false)&&(()=>{
        const dismiss=()=>{ST.set("tutorialDismissed",true);};
        return(
          <div className="rk-in" style={{display:"flex",alignItems:"center",gap:10,background:`linear-gradient(135deg,${C.jade}10,${C.jade}05)`,border:`1px solid ${C.jade}25`,borderRadius:14,padding:"10px 14px",marginBottom:8,marginTop:12}}>
            <span style={{fontSize:18,flexShrink:0}}>👋</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:C.jade,fontFamily:F.d}}>New to Rackle?</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
              <button onClick={()=>{dismiss();showTutorial();}} style={{background:C.jade,border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>Quick intro →</button>
            </div>
            <button onClick={dismiss} aria-label="Dismiss" style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer",padding:"0 0 0 4px",lineHeight:1,flexShrink:0}}>✕</button>
          </div>
        );
      })()}

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,marginTop:16}}>
        <div style={{flex:1,height:1,background:C.bdr}}/><span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>PLAY</span><div style={{flex:1,height:1,background:C.bdr}}/>
      </div>

      {!dDone?(
        <button onClick={()=>go("daily")} aria-label={`Play Daily Rackle challenge number ${getDayNum()}`} style={{width:"100%",padding:"24px 20px",borderRadius:18,border:"none",cursor:"pointer",marginBottom:12,background:"linear-gradient(135deg,#1B7D4E,#0F5535)",color:"#fff",display:"flex",alignItems:"center",gap:16,textAlign:"left",boxShadow:"0 8px 32px rgba(27,125,78,0.3)"}}>
          <div aria-hidden="true" style={{width:52,height:52,borderRadius:15,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📅</div>
          <div>
            <div style={{fontSize:11,opacity:0.75,letterSpacing:2,fontWeight:700,marginBottom:5}}>TODAY'S CHALLENGE</div>
            <div style={{fontFamily:F.d,fontSize:22,fontWeight:800,marginBottom:6}}>Daily Rackle #{dn}</div>
            <div style={{fontSize:12,opacity:0.85}}>Same deal for every player. One shot.</div>
            <div style={{fontSize:11,opacity:0.65,marginTop:4}}>Compare your Charleston with your whole club.</div>
          </div>
        </button>
      ):(()=>{
        const ydComp=yd&&dRes&&iq&&yd.iq?(iq.totalScore>yd.iq.totalScore?{label:"Better than yesterday",icon:"⬆️"}:iq.totalScore===yd.iq.totalScore?{label:"Same as yesterday",icon:"➡️"}:{label:"Yesterday was stronger",icon:"⬇️"}):null;
        return(
          <div style={{borderRadius:20,overflow:"hidden",marginBottom:8,boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
            {/* IQ HERO */}
            <div style={{background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"24px 20px 20px",textAlign:"center"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:3,fontWeight:700,marginBottom:14}}>TODAY'S DAILY · #{dn}</div>
              {iq&&<>
                <div style={{fontSize:8,color:C.gilt,letterSpacing:3,fontWeight:700,marginBottom:8}}>CHARLESTON IQ</div>
                <div style={{fontFamily:F.d,fontSize:52,fontWeight:900,color:C.gilt,lineHeight:1,letterSpacing:-2,textShadow:`0 2px 16px rgba(176,138,53,0.45)`,marginBottom:6}}>{iq.totalScore}</div>
                <div style={{width:40,height:1.5,background:`linear-gradient(90deg,transparent,${C.gilt},transparent)`,margin:"12px auto 12px"}}/>
                <div style={{fontFamily:F.d,fontSize:19,fontWeight:900,color:"#fff",marginBottom:6,letterSpacing:-0.3}}>{iq.level}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:16,lineHeight:1.55,maxWidth:260,margin:"0 auto 16px"}}>{iq.levelExplanation}</div>
              </>}
              {!iq&&dRes&&<>
                <div style={{fontSize:36,marginBottom:8,lineHeight:1}}>{dRes.emoji}</div>
                <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:"#fff",marginBottom:12}}>{dRes.rating}</div>
              </>}
              <div style={{width:"100%",height:0.5,background:"rgba(255,255,255,0.08)",margin:"0 0 14px"}}/>
              {dRes&&<div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
                {dRes.section&&<div style={{textAlign:"center"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontWeight:700,marginBottom:4}}>SECTION</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{dRes.section}</div>
                </div>}
                {dRes.time>0&&<><div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontWeight:700,marginBottom:4}}>TIME</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>⏱ {fT(dRes.time)}</div>
                </div></>}
              </div>}
              {/* ydComp + streak in one row if both present, otherwise separate */}
              {(ydComp||streak>1)&&<div style={{marginTop:14,display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
                {ydComp&&<div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px"}}>
                  <span style={{fontSize:11}}>{ydComp.icon}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:600}}>{ydComp.label}</span>
                </div>}
                {streak>1&&<div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px"}}>
                  <span style={{fontSize:11}}>{streakBadge?streakBadge.badge:"🔥"}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:600}}>{streak}-day streak{streakBadge?` · ${streakBadge.title}`:""}</span>
                </div>}
              </div>}
            </div>
            {/* ACTIONS */}
            <div style={{background:C.bg,padding:"14px 16px 12px",borderTop:`1px solid ${C.bdr}`}}>
              <div style={{marginBottom:8}}><ShareButton text={shareText}/></div>
              <button onClick={showScorecard} style={{width:"100%",borderRadius:12,background:C.sage,border:`1px solid ${C.sageB}20`,cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",marginBottom:6,textAlign:"left"}}>
                <div style={{width:32,height:32,borderRadius:8,background:C.sageB+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>📊</div>
                <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:2}}>
                  <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:"#1A3D28",lineHeight:1.2}}>View Full Scorecard</div>
                  <div style={{fontSize:11,color:C.sageB,lineHeight:1.3}}>Score analysis · Pass breakdown</div>
                </div>
                <span style={{fontSize:14,color:C.sageB,fontWeight:700,flexShrink:0}}>›</span>
              </button>
              <p style={{fontSize:10,color:C.mut,textAlign:"center",margin:0,lineHeight:1.5,fontStyle:"italic",opacity:0.8}}>No spoilers — it's the same hand for everyone.</p>
            </div>
          </div>
        );
      })()}

      {dDone&&<MidnightCountdown dn={dn}/>}

      <button onClick={()=>go("free")} aria-label="Play Practice Mode" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:20,borderRadius:16,padding:"14px 16px",textAlign:"left",background:`linear-gradient(135deg,${C.cinn}05,#fff)`,border:`1px solid ${C.cinn}20`}}>
        <div aria-hidden="true" style={{width:44,height:44,borderRadius:13,background:`linear-gradient(135deg,${C.cinn}20,${C.cinn}10)`,border:`1px solid ${C.cinn}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🀄</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:C.cinn,letterSpacing:2,fontWeight:700,marginBottom:2}}>UNLIMITED PLAY</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:2}}>Practice Mode</div>
          <div style={{fontSize:12,color:C.mut}}>Unlimited hands. No timer pressure. Build instincts for every section.</div>
        </div>
        <span aria-hidden="true" style={{fontSize:14,color:C.mut,fontWeight:600}}>›</span>
      </button>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,marginTop:4}}>
        <div style={{flex:1,height:1,background:C.bdr}}/><span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>RACKLE COMMUNITY</span><div style={{flex:1,height:1,background:C.bdr}}/>
      </div>

      <ClubCodeEntry onJoin={()=>setScreen("leaderboard")} setScreen={setScreen}/>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,marginTop:20}}>
        <div style={{flex:1,height:1,background:C.bdr}}/><span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>LEARN & EXPLORE</span><div style={{flex:1,height:1,background:C.bdr}}/>
      </div>

      <button onClick={showStats} style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:8,borderRadius:16,padding:"14px 16px",textAlign:"left",background:"#2460A806",border:`1px solid #2460A825`}}>
        <div style={{width:44,height:44,borderRadius:13,background:"#2460A810",border:`1px solid #2460A820`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📊</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:"#2460A8",letterSpacing:2,fontWeight:700,marginBottom:2}}>YOUR STATS</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:2}}>Progress & Trends</div>
          <div style={{fontSize:12,color:C.mut}}>Last 5 scores · Tendencies & section mastery</div>
        </div>
        <span aria-hidden="true" style={{fontSize:14,color:C.mut,fontWeight:600}}>›</span>
      </button>

      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={showTutorial} style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${C.jade}25`,background:C.jade+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>🀄</span>
          <div style={{fontSize:10,color:C.jade,letterSpacing:1.5,fontWeight:700}}>WALKTHROUGH</div>
          <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2}}>Interactive Tutorial</div>
          <div style={{fontSize:10,color:C.mut,lineHeight:1.35,marginTop:1}}>Learn Rackle step by step</div>
        </button>
        <button onClick={showCardGuide} style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${C.gold}25`,background:C.gold+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>📋</span>
          <div style={{fontSize:10,color:C.gold,letterSpacing:1.5,fontWeight:700}}>2026 NMJL</div>
          <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2}}>Card Guide</div>
          <div style={{fontSize:10,color:C.mut,lineHeight:1.35,marginTop:1}}>Hold & pass tips</div>
        </button>
        <button onClick={()=>setShowHelp(!showHelp)} aria-expanded={showHelp} style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${showHelp?C.gold+"40":C.gold+"25"}`,background:C.gold+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>📖</span>
          <div style={{fontSize:10,color:C.gold,letterSpacing:1.5,fontWeight:700}}>LEARN</div>
          <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2}}>How to Play</div>
          <div style={{fontSize:10,color:C.mut,lineHeight:1.35,marginTop:1}}>Rules & scoring</div>
        </button>
      </div>

      {showHelp&&<div style={{background:"#FFFFF8",border:`1px solid ${C.gold}25`,borderRadius:16,marginBottom:8,overflow:"hidden"}} className="rk-in">

        {/* HOW TO PLAY steps */}
        <div style={{padding:"16px 16px 12px"}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:12}}>HOW TO PLAY</div>
          {["You're dealt 13 tiles. A timer starts.","Pass Right (3), Over (3), Left (0–3, blind). Jokers can't be passed.","Option to continue with a second Charleston and a Courtesy Pass.","Choose your target section — Rackle rates how well your tiles fit."].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<3?12:0,alignItems:"flex-start"}}>
              <div style={{width:22,height:22,borderRadius:11,background:C.jade+"15",border:`1.5px solid ${C.jade}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.jade,flexShrink:0,marginTop:1}}>{i+1}</div>
              <span style={{fontSize:12,color:C.ink,lineHeight:1.65}}>{s}</span>
            </div>
          ))}
        </div>

        {/* CHARLESTON IQ section */}
        <div style={{background:C.gold+"06",borderTop:`1px solid ${C.gold}20`,borderBottom:`1px solid ${C.gold}20`,padding:"14px 16px"}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:14}}>CHARLESTON IQ · HOW IT'S SCORED</div>
          {[
            {label:"Direction",max:40,icon:"🧭",desc:"Did your tiles commit to one section? The biggest slice — good reads early pay off most."},
            {label:"Tile Strength",max:25,icon:"💪",desc:"How structurally strong was your final rack? Pairs, pungs, jokers, and flowers all count."},
            {label:"Pass Quality",max:25,icon:"🔄",desc:"Did you pass the right tiles? Passing strong tiles or breaking pairs costs you here."},
            {label:"Timing",max:10,icon:"⏱",desc:"8–20 seconds per pass is the sweet spot. Too fast or too slow both drop your score."},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:12,marginBottom:i<3?14:0,alignItems:"flex-start"}}>
              <div style={{width:34,height:34,borderRadius:9,background:"#fff",border:`1px solid ${C.gold}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.ink,fontFamily:F.d}}>{item.label}</span>
                  <span style={{fontSize:10,color:C.gold,fontWeight:700,background:C.gold+"12",borderRadius:20,padding:"2px 8px"}}>/{item.max} pts</span>
                </div>
                <div style={{height:2,borderRadius:1,background:C.bdr,marginBottom:5}}/>
                <span style={{fontSize:11,color:C.mut,lineHeight:1.55}}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* IQ LEVELS section */}
        <div style={{padding:"14px 16px 16px"}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:6}}>IQ LEVELS</div>
          <p style={{fontSize:11,color:C.mut,lineHeight:1.55,margin:"0 0 12px"}}>Each level includes a personalised note based on your strongest and weakest subscores.</p>
          {[
            {range:"90–100",level:"Mahjong Master",color:C.jade,bg:C.jade+"10"},
            {range:"80–89",level:"Skilled Player",color:C.jade,bg:C.jade+"08"},
            {range:"70–79",level:"Game Ready",color:"#2460A8",bg:"#2460A810"},
            {range:"60–69",level:"Getting There",color:C.gold,bg:C.gold+"10"},
            {range:"<60",level:"Keep Going, Rookie",color:C.cinn,bg:C.cinn+"08"},
          ].map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:8,background:l.bg,marginBottom:i<4?4:0}}>
              <span style={{fontSize:12,fontWeight:700,color:l.color,fontFamily:F.d}}>{l.level}</span>
              <span style={{fontSize:10,color:l.color,fontWeight:700,opacity:0.8}}>{l.range}</span>
            </div>
          ))}
          <button onClick={showTutorial} style={{marginTop:14,width:"100%",background:"none",border:`1px solid ${C.gold}30`,borderRadius:10,padding:"9px 12px",fontSize:12,color:C.gold,cursor:"pointer",fontWeight:600,fontFamily:F.d}}>📖 Full interactive tutorial →</button>
        </div>

      </div>}

      <EmailSignup/>

      <Footer/>
    </div>
  );
}

function Pill({i,v,l,hl}){return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}} aria-label={`${l}: ${v}`}><span aria-hidden="true" style={{fontSize:12}}>{i}</span><div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{v}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{l}</div></div></div>);}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats({home,onShowScorecard,onRecap,dRes}){
  const stats=getStats(),wk=getWeekly();
  const dn=getDayNum();
  const tt=stats?(stats.trend>0.5?"Improving 📈":stats.trend<-0.5?"Slipping 📉":"Steady ➡️"):null;
  const iq=dRes?.iq;
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      {/* If today's daily is done, show IQ hero at top */}
      {iq&&<div style={{marginBottom:12}}>
        <IQHero iq={iq} isDaily dayNum={dn} section={dRes.section} totalTime={iq.totalTime||0}/>
        <div style={{marginTop:8}}>
          <button onClick={onShowScorecard} style={{width:"100%",padding:"12px 16px",borderRadius:12,background:C.sage,border:`1px solid ${C.sageB}25`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-start"}}>
            <div style={{textAlign:"left"}}><div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:"#1A3D28",lineHeight:1,marginBottom:2}}>View Full Scorecard</div><div style={{fontSize:11,color:C.sageB}}>Coach notes · Pass breakdown · Tile analysis</div></div>
            <span style={{background:"#2E6B48",color:"#fff",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,marginLeft:"auto"}}>›</span>
          </button>
        </div>
      </div>}
      {!stats?(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <div aria-hidden="true" style={{fontSize:32,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:6}}>No games yet</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.6}}>Play a Daily or Practice round to start tracking your improvement.</div>
        </div>
      ):(
        <>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <Pill i="🎲" v={stats.total} l="ROUNDS"/>
            {stats.fastest&&<Pill i="⏱" v={fT(stats.fastest)} l="FASTEST"/>}
          </div>

          {/* IQ Sparkline */}
          {(()=>{
            const h=getHist().filter(e=>e.iqScore!=null).slice(-10);
            if(h.length<2)return null;
            const scores=h.map(e=>e.iqScore);
            const min=Math.min(...scores,0);const max=Math.max(...scores,100);
            const range=Math.max(max-min,20);
            const W=260,H=52,pad=4;
            const pts=scores.map((s,i)=>({
              x:pad+(i/(scores.length-1))*(W-pad*2),
              y:H-pad-((s-min)/range)*(H-pad*2)
            }));
            const pathD=pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
            const fillD=`${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
            const last=scores[scores.length-1];
            const prev=scores[scores.length-2];
            const trend=last>prev?"↑":last<prev?"↓":"→";
            const trendCol=last>prev?C.jade:last<prev?C.cinn:C.gold;
            return(
              <div style={{...S.card,marginBottom:12,padding:"14px 14px 10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
                  <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>IQ HISTORY · LAST {scores.length} GAMES</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                    <span style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.jade}}>{last}</span>
                    <span style={{fontSize:12,fontWeight:700,color:trendCol}}>{trend}</span>
                  </div>
                </div>
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",overflow:"visible"}}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.jade} stopOpacity="0.15"/>
                      <stop offset="100%" stopColor={C.jade} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d={fillD} fill="url(#sparkGrad)"/>
                  <path d={pathD} fill="none" stroke={C.jade} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                  {pts.map((p,i)=>(
                    <circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?4:2.5}
                      fill={i===pts.length-1?C.jade:"#fff"}
                      stroke={C.jade} strokeWidth="1.5"/>
                  ))}
                </svg>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:9,color:C.mut}}>{scores.length} games ago</span>
                  <span style={{fontSize:9,color:C.mut}}>latest</span>
                </div>
              </div>
            );
          })()}

          {/* LAST 5 SCORES */}
          {(()=>{
            const h=getHist().filter(e=>e.iqScore!=null).slice(-5);
            if(h.length<2)return null;
            const avgIQ=Math.round(h.reduce((a,e)=>a+e.iqScore,0)/h.length);
            const best=Math.max(...h.map(e=>e.iqScore));
            const worst=Math.min(...h.map(e=>e.iqScore));
            return(
              <div style={{...S.card,marginBottom:10,padding:"14px"}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>LAST 5 SCORES</div>
                <div style={{display:"flex",gap:4,marginBottom:10,justifyContent:"center"}}>
                  {h.map((e,i)=>{
                    const col=e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn;
                    const emoji=e.iqScore>=80?"🟢":e.iqScore>=60?"🟡":"🔴";
                    return(
                      <div key={i} style={{flex:1,textAlign:"center",background:col+"08",borderRadius:8,padding:"8px 4px",border:`1px solid ${col}20`}}>
                        <div style={{fontSize:11}}>{emoji}</div>
                        <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:col,lineHeight:1,marginTop:2}}>{e.iqScore}</div>
                        <div style={{fontSize:8,color:C.mut,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(e.section||"").replace(/^[^\s]+\s/,"").slice(0,6)}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                  <div style={{flex:1,background:C.bg2,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:C.mut,letterSpacing:1,fontWeight:700}}>AVG</div>
                    <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink}}>{avgIQ}</div>
                  </div>
                  <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:C.jade,letterSpacing:1,fontWeight:700}}>BEST</div>
                    <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.jade}}>{best}</div>
                  </div>
                  <div style={{flex:1,background:C.cinn+"08",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:C.cinn,letterSpacing:1,fontWeight:700}}>WORST</div>
                    <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.cinn}}>{worst}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* COMMON PATTERNS / TENDENCIES */}
          {(()=>{
            const h=getHist().filter(e=>e.iq).slice(-10);
            if(h.length<3)return null;
            const avgDir=Math.round(h.reduce((a,e)=>a+(e.iq.directionScore||0),0)/h.length);
            const avgPass=Math.round(h.reduce((a,e)=>a+(e.iq.passQualityScore||0),0)/h.length);
            const avgTile=Math.round(h.reduce((a,e)=>a+(e.iq.tileStrengthScore||0),0)/h.length);
            const avgTime=Math.round(h.reduce((a,e)=>a+(e.iq.timingScore||0),0)/h.length);
            const subs=[
              {label:"Direction",score:avgDir,max:40,pct:Math.round(avgDir/40*100)},
              {label:"Pass Quality",score:avgPass,max:25,pct:Math.round(avgPass/25*100)},
              {label:"Tile Strength",score:avgTile,max:25,pct:Math.round(avgTile/25*100)},
              {label:"Timing",score:avgTime,max:10,pct:Math.round(avgTime/10*100)},
            ];
            const weakest=subs.sort((a,b)=>a.pct-b.pct)[0];
            const tips={
              "Direction":"You're often not committing to a section early enough. Pick your strongest 3 tiles before your first pass and build from there.",
              "Pass Quality":"You tend to pass tiles your section needs. Before passing, ask: 'Is this tile useful for my target section?' If yes — keep it.",
              "Tile Strength":"Your final rack is lacking structure. Prioritise keeping pairs and pungs over isolated individual tiles.",
              "Timing":"Your pace is off the sweet spot. Aim for 8–12 seconds per pass — enough to read the rack without second-guessing.",
            };
            return(
              <div style={{...S.card,marginBottom:10}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>YOUR TENDENCIES · LAST {h.length} GAMES</div>
                {subs.sort((a,b)=>b.pct-a.pct).map((sub,i)=>{
                  const col=sub.pct>=75?C.jade:sub.pct>=55?"#2460A8":sub.pct>=40?C.gold:C.cinn;
                  return(
                    <div key={sub.label} style={{marginBottom:i<3?10:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
                        <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{sub.label}</span>
                        <span style={{fontSize:11,fontWeight:800,color:col,fontFamily:F.d}}>{sub.pct}%</span>
                      </div>
                      <div style={{height:5,borderRadius:3,background:C.bdr,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:3,background:col,width:`${sub.pct}%`}}/>
                      </div>
                    </div>
                  );
                })}
                <div style={{marginTop:12,background:C.amber,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.amberB}20`}}>
                  <div style={{fontSize:8,color:C.amberB,letterSpacing:1.5,fontWeight:700,marginBottom:5}}>FOCUS AREA</div>
                  <div style={{fontSize:12,color:C.ink,lineHeight:1.6,fontWeight:600}}>{weakest.label}</div>
                  <div style={{fontSize:11,color:C.ink,lineHeight:1.6,marginTop:3}}>{tips[weakest.label]}</div>
                </div>
              </div>
            );
          })()}

          {stats.trend!==null&&<div style={{...S.card,textAlign:"center",padding:12}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:4}}>RECENT TREND</div>
            <div style={{fontSize:16,fontWeight:700,color:stats.trend>0.5?C.jade:stats.trend<-0.5?C.cinn:C.gold}}>{tt}</div>
            <div style={{fontSize:11,color:C.mut,marginTop:4}}>Last 5 avg: {RATS[Math.round(stats.ra)]}</div>
          </div>}

          {/* PROGRESS OVERVIEW — Daily vs Practice IQ comparison */}
          {(()=>{
            const allHist=getHist().filter(e=>e.iqScore!=null);
            if(allHist.length<2)return null;
            const dailyHist=allHist.filter(e=>e.mode==="daily");
            const practiceHist=allHist.filter(e=>e.mode!=="daily");
            // Last 5-10 hands bar chart
            const last10=allHist.slice(-10);
            const maxScore=Math.max(...last10.map(e=>e.iqScore),100);
            return(
              <div style={{...S.card,marginBottom:10}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>OVERALL PROGRESS · LAST {last10.length} HANDS</div>
                {/* Bar chart for last 10 hands */}
                <div style={{display:"flex",gap:3,alignItems:"flex-end",height:64,marginBottom:8}}>
                  {last10.map((e,i)=>{
                    const pct=Math.round((e.iqScore/maxScore)*100);
                    const col=e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn;
                    const isDaily=e.mode==="daily";
                    return(
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <div style={{fontSize:8,color:col,fontWeight:700,fontFamily:F.d,lineHeight:1}}>{e.iqScore}</div>
                        <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:col+(isDaily?"":"60"),height:`${Math.max(pct*0.52,6)}px`,border:isDaily?`1px solid ${col}40`:"none"}}/>
                        <div style={{width:4,height:4,borderRadius:2,background:isDaily?C.jade:C.cinn,opacity:0.5}}/>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:12,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:2,background:C.jade}}/><span style={{fontSize:10,color:C.mut}}>Daily</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:2,background:C.cinn+"60"}}/><span style={{fontSize:10,color:C.mut}}>Practice</span></div>
                </div>
                {/* Summary row */}
                <div style={{display:"flex",gap:6}}>
                  {dailyHist.length>0&&<div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.jade}15`}}>
                    <div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>DAILY AVG</div>
                    <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.jade}}>{Math.round(dailyHist.reduce((a,e)=>a+e.iqScore,0)/dailyHist.length)}</div>
                  </div>}
                  {practiceHist.length>0&&<div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${C.cinn}15`}}>
                    <div style={{fontSize:8,color:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>PRACTICE AVG</div>
                    <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.cinn}}>{Math.round(practiceHist.reduce((a,e)=>a+e.iqScore,0)/practiceHist.length)}</div>
                  </div>}
                  {allHist.length>=3&&(()=>{
                    const recent=allHist.slice(-3).reduce((a,e)=>a+e.iqScore,0)/3;
                    const older=allHist.slice(0,Math.max(3,allHist.length-3)).reduce((a,e)=>a+e.iqScore,0)/Math.max(3,allHist.length-3);
                    const delta=Math.round(recent-older);
                    return<div style={{flex:1,background:delta>=0?C.jade+"06":C.cinn+"06",borderRadius:8,padding:"8px 10px",textAlign:"center",border:`1px solid ${delta>=0?C.jade:C.cinn}15`}}>
                      <div style={{fontSize:8,color:delta>=0?C.jade:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>TRAJECTORY</div>
                      <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:delta>=0?C.jade:C.cinn}}>{delta>=0?"+":""}{delta}</div>
                    </div>;
                  })()}
                </div>
              </div>
            );
          })()}

          {/* SCIENTIFIC SECTION FOCUS — smarter recommendation */}
          {(()=>{
            const allH=getHist().filter(e=>e.iq&&e.sid).slice(-15);
            if(allH.length<3)return null;
            // Count section frequency
            const secFreq={};allH.forEach(e=>{secFreq[e.sid]=(secFreq[e.sid]||0)+1;});
            // Average IQ per section
            const secIQ={};const secCnt={};
            allH.forEach(e=>{secIQ[e.sid]=(secIQ[e.sid]||0)+e.iqScore;secCnt[e.sid]=(secCnt[e.sid]||0)+1;});
            const secAvgIQ=Object.fromEntries(Object.keys(secIQ).map(k=>[k,Math.round(secIQ[k]/secCnt[k])]));
            // Find least-tried sections with room to grow
            const allSectionIds=SECS.map(s=>s.id);
            const untried=allSectionIds.filter(id=>!secFreq[id]);
            const tried=allSectionIds.filter(id=>secFreq[id]);
            // Find overplayed section (highest frequency)
            const mostPlayed=tried.sort((a,b)=>(secFreq[b]||0)-(secFreq[a]||0))[0];
            const mostPlayedSec=SECS.find(s=>s.id===mostPlayed);
            // Find section with worst IQ among tried ones
            const worstSection=tried.sort((a,b)=>(secAvgIQ[a]||100)-(secAvgIQ[b]||100))[0];
            const worstSec=SECS.find(s=>s.id===worstSection);
            const worstAvg=secAvgIQ[worstSection]||0;
            // Pick a recommendation
            let rec=null,recReason="";
            if(untried.length>0){
              const suggest=untried[Math.floor(Math.random()*Math.min(untried.length,3))];
              const suggestSec=SECS.find(s=>s.id===suggest);
              if(suggestSec){rec=suggestSec;recReason=`You haven't tried ${suggestSec.name} yet — unexplored sections often reveal hidden strengths.`;}
            } else if(worstSec&&worstAvg<70){
              rec=worstSec;recReason=`Your avg IQ in ${worstSec.name} is ${worstAvg} — your weakest section. Focused practice here will lift your overall score the fastest.`;
            } else if(mostPlayedSec){
              const alternative=tried.filter(id=>id!==mostPlayed).sort((a,b)=>(secAvgIQ[b]||0)-(secAvgIQ[a]||0))[0];
              const altSec=alternative?SECS.find(s=>s.id===alternative):null;
              if(altSec){rec=altSec;recReason=`You've been leaning heavily on ${mostPlayedSec.name}. Try ${altSec.name} — you score well there and variety builds adaptability.`;}
            }
            if(!rec)return null;
            // Also suggest a tile focus
            const tileHints={"Flowers":"Practice protecting your Flowers — pass them last in any section that wants them.","Jokers":"Work on Joker discipline — they're only worth holding in Quints, Runs, and pungs.","Dragons":"Dragons pair well with Winds in honors-heavy hands (Winds & Dragons section).","Evens":"Even tiles (2,4,6,8) appear in the most hands — if you see a 6, hold it.","Odds":"Odd tiles (1,3,5,7,9) anchor the 13579 section — 5 is the most versatile."};
            const tileHintKeys=Object.keys(tileHints);
            const tileHint=tileHints[tileHintKeys[dn%tileHintKeys.length]];
            return(
              <div style={{...S.card,marginBottom:10,background:"linear-gradient(145deg,#FFFFF8,#F8F4EB)",borderColor:C.gold+"25"}}>
                <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:10}}>🎯 YOUR FOCUS AREAS</div>
                {/* Section recommendation */}
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.bdr}`}}>
                  <div style={{width:36,height:36,borderRadius:10,background:rec.color+"12",border:`1px solid ${rec.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{rec.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:800,color:C.ink,marginBottom:3}}>Try next: {rec.name}</div>
                    <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>{recReason}</div>
                  </div>
                </div>
                {/* Tile tip of the day */}
                <div style={{background:C.jade+"06",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>💡 TILE TIP</div>
                  <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{tileHint}</div>
                </div>
              </div>
            );
          })()}

          <div style={S.card}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>SECTION MASTERY</div>
            {stats.mastery.map(s=>{
              const isW=wk&&s.id===wk.id;
              let lv,lc,lb;
              if(s.cnt===0){lv="Try it!";lc=C.mut;lb=C.bg2;}
              else if(s.avg<=1){lv="Strong";lc=C.jade;lb=C.jade+"12";}
              else if(s.avg<=2.5){lv="Solid";lc="#2460A8";lb="#2460A812";}
              else if(s.avg<=3.5){lv="Learning";lc=C.gold;lb=C.gold+"12";}
              else{lv="Needs work";lc=C.cinn;lb=C.cinn+"10";}
              return(
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.bdr}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span aria-hidden="true" style={{fontSize:16}}>{s.icon}</span>
                    <div><div style={{fontSize:12,fontWeight:600,color:C.ink}}>{s.name}{isW?" ⭐":""}</div><div style={{fontSize:10,color:C.mut,marginTop:1}}>{s.cnt} round{s.cnt!==1?"s":""}</div></div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span style={{fontSize:10,fontWeight:700,color:lc,background:lb,border:`1px solid ${lc}25`,borderRadius:20,padding:"2px 10px"}}>{lv}</span>
                    {s.cnt>0&&<div aria-hidden="true" style={{width:48,height:3,borderRadius:2,background:C.bdr}}><div style={{height:"100%",borderRadius:2,background:lc,width:`${Math.max(8,100-s.avg*20)}%`}}/></div>}
                  </div>
                </div>);
            })}
          </div>
        </>
      )}
      {onRecap&&getWeeklyRecapData()&&(
        <button onClick={onRecap} style={{...S.oBtn,width:"100%",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <span>📊</span><span>View Weekly Recap →</span>
        </button>
      )}
      <Footer/>
    </div>
  );
}

// ─── GAME ─────────────────────────────────────────────────────────────────────
function ReadyOverlay({mode,dayNum,onReady,onHome}){
  const challengeIQ=getUrlParam("challenge");
  const challengeDay=getUrlParam("day");
  const isChallenge=mode==="daily"&&challengeIQ&&challengeDay===String(dayNum);
  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50,padding:"0 20px",background:"rgba(250,247,241,0.75)",backdropFilter:"blur(6px)"}}>
      <div className="rk-in" style={{width:"100%",maxWidth:400,background:"#fff",borderRadius:24,border:`1.5px solid ${C.bdr}`,boxShadow:"0 20px 60px rgba(0,0,0,0.12)",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#0F2016,#1B3A28)",padding:"24px 24px 20px",textAlign:"center"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,fontWeight:700,marginBottom:10}}>{mode==="daily"?`DAILY RACKLE · #${dayNum}`:"PRACTICE MODE"}</div>
          <div style={{fontFamily:F.d,fontSize:30,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1,marginBottom:4}}>Ready to Rackle?</div>
          <div style={{width:32,height:1.5,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"12px auto 12px"}}/>
          {isChallenge
            ?<div style={{fontSize:13,color:C.gilt,fontWeight:700,lineHeight:1.6}}>🎯 Beat their IQ of {challengeIQ} to win the challenge!</div>
            :<div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>{mode==="daily"?"Same deal for every player. One shot.":"Unlimited hands. Build your instincts."}</div>
          }
        </div>
        {isChallenge&&<div style={{background:C.gilt+"15",borderBottom:`1px solid ${C.gilt}30`,padding:"10px 20px",textAlign:"center"}}>
          <span style={{fontSize:11,color:C.gold,fontWeight:700}}>Target: {challengeIQ} IQ · Day #{challengeDay}</span>
        </div>}
        <div style={{padding:"16px 20px 20px",display:"flex",gap:10,background:C.bg}}>
          <button onClick={onHome} style={{flex:1,padding:"13px 0",borderRadius:12,border:`1px solid ${C.bdr}`,background:"#fff",color:C.mut,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.b}}>← Home</button>
          <button onClick={onReady} style={{flex:2,padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:0.3,cursor:"pointer",boxShadow:`0 4px 14px rgba(27,125,78,0.35)`}}>{isChallenge?"Accept Challenge →":"Yes! Let's Play →"}</button>
        </div>
      </div>
    </div>
  );
}

function Game({mode,home,onDone,settings}){
  const [phase,setPhase]=useState("deal");
  const [ready,setReady]=useState(false);
  const [flipped,setFlipped]=useState([]);
  const [hand,setHand]=useState([]);const [pool,setPool]=useState([]);
  const [startingRack,setStartingRack]=useState([]);
  const [sel,setSel]=useState([]);const [passed,setPassed]=useState([]);
  const [passLog,setPassLog]=useState([]);
  const [newIdx,setNewIdx]=useState([]);const [jw,setJw]=useState(false);
  const [chosenSec,setChosenSec]=useState(null);const [showRef,setShowRef]=useState(false);
  const [showHint,setShowHint]=useState(false);const [hintExp,setHintExp]=useState(null);
  const [cn,setCn]=useState(1);const [pi,setPi]=useState(0);
  const [st,setSt]=useState(null);const [el,setEl]=useState(0);const [td,setTd]=useState(false);
  const [showLeave,setShowLeave]=useState(false);
  const [iqResult,setIqResult]=useState(null);
  const elRef=useRef(0);const stRef=useRef(null);
  const cs=cn===1?F1C:S2C;const cp=cs[pi];
  const large=settings?.tileSize==="large";

  const haptic=useCallback((ms=30)=>{if(settings?.haptic&&navigator.vibrate)navigator.vibrate(ms);},[settings?.haptic]);

  useEffect(()=>{
    const d=mode==="daily"?seededShuffle(buildDeck(),getDailySeed()):shuffle(buildDeck());
    const dealt=d.slice(0,13);setHand(dealt);setStartingRack(dealt);setPool(d.slice(13).filter(t=>t.t!=="j"));
  },[]);

  useEffect(()=>{
    if(!ready)return;
    hand.forEach((_,i)=>{setTimeout(()=>setFlipped(f=>[...f,i]),i*80);});
    setTimeout(()=>{setPhase("pass");stRef.current=Date.now();setSt(Date.now());},hand.length*80+600);
  },[ready]);

  useEffect(()=>{
    if(!st||td)return;
    const iv=setInterval(()=>{setEl(Math.floor((Date.now()-stRef.current+elRef.current)/1000));},1000);
    return()=>clearInterval(iv);
  },[st,td]);

  useEffect(()=>{
    const onVis=()=>{
      if(document.hidden){if(stRef.current){elRef.current+=Date.now()-stRef.current;stRef.current=null;setSt(null);}}
      else{if(!td)stRef.current=Date.now();setSt(Date.now());}
    };
    document.addEventListener("visibilitychange",onVis);return()=>document.removeEventListener("visibilitychange",onVis);
  },[td]);

  useEffect(()=>{
    if(phase==="deal"||phase==="result")return;
    const onPop=(e)=>{e.preventDefault();setShowLeave(true);window.history.pushState(null,"","");};
    window.history.pushState(null,"","");window.addEventListener("popstate",onPop);return()=>window.removeEventListener("popstate",onPop);
  },[phase]);

  const toggle=(i)=>{
    if(phase!=="pass"||newIdx.length>0)return;
    if(hand[i].t==="j"&&!sel.includes(i)){haptic(50);setJw(true);setTimeout(()=>setJw(false),1800);return;}
    const max=cp.blind?(cp.max||3):cp.req;
    setSel(p=>{const n=p.includes(i)?p.filter(x=>x!==i):p.length>=max?p:[...p,i];if(n.length!==p.length)haptic(20);return n;});
  };
  const cTog=(i)=>{
    if(hand[i].t==="j"&&!sel.includes(i)){haptic(50);setJw(true);setTimeout(()=>setJw(false),1800);return;}
    setSel(p=>{const n=p.includes(i)?p.filter(x=>x!==i):p.length>=3?p:[...p,i];if(n.length!==p.length)haptic(20);return n;});
  };

  const doSwap=(count)=>{
    haptic(40);
    const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);
    const rem=hand.filter((_,i)=>!sel.includes(i));const safe=pool.filter(t=>t.t!=="j");
    const inc=safe.slice(0,count);setPool(safe.slice(count));
    const comb=[...rem,...inc];const ni=[];for(let i=rem.length;i<comb.length;i++)ni.push(i);
    const roundName=cn===1
      ?(pi===0?"Pass Right":pi===1?"Pass Over":"Pass Left (Blind)")
      :(pi===0?"2nd Charleston · Pass Left":pi===1?"2nd Charleston · Pass Over":"2nd Charleston · Pass Right (Blind)");
    setPassLog(pl=>[...pl,{label:roundName,roundName,out:pt,in:inc,blind:cp.blind}]);
    setNewIdx(ni);setHand(comb);setSel([]);
    setTimeout(()=>{setNewIdx([]);setShowHint(false);setHintExp(null);if(pi<2){setPi(p=>p+1);}else{setPhase(cn===1?"askSecond":"askCourtesy");}},600);
  };
  const doPass=()=>{
    const min=cp.blind?0:cp.req;const max=cp.blind?(cp.max||3):cp.req;
    if(sel.length<min||sel.length>max)return;
    if(sel.length===0){setShowHint(false);setHintExp(null);if(pi<2){setPi(p=>p+1);}else{setPhase(cn===1?"askSecond":"askCourtesy");}return;}
    doSwap(sel.length);
  };

  const stopTimer=()=>{if(stRef.current){elRef.current+=Date.now()-stRef.current;stRef.current=null;}setTd(true);};

  const confirm=()=>{
    if(!chosenSec)return;setTd(true);
    const e=ev(hand),top=e[0],gi=gri(top.score);
    const totalEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);
    const dn=getDayNum();
    const isD=mode==="daily";

    // Run new IQ engine
    const iq=calculateCharlestonIQ({
      startingRack,finalRack:hand,passedTilesByRound:passLog,
      totalTime:totalEl,sectionId:chosenSec,
    },getDailySeed(),isD,dn);
    setIqResult(iq);

    const result={
      rating:RATS[gi],emoji:REMO[gi],section:`${top.icon} ${top.name}`,sid:top.id,
      score:top.score,time:totalEl,gi,iqScore:iq?iq.totalScore:null,iq,
      finalRack:hand,passLog,chosenSec,allSections:ev(hand),
    };
    onDone(result);
    setPhase("result");
  };

  const restart=()=>{
    const d=shuffle(buildDeck());const dealt=d.slice(0,13);
    setHand(dealt);setStartingRack(dealt);setPool(d.slice(13).filter(t=>t.t!=="j"));
    setSel([]);setPassed([]);setPassLog([]);setNewIdx([]);setCn(1);setPi(0);setChosenSec(null);
    setShowRef(false);setShowHint(false);setHintExp(null);setIqResult(null);
    setTd(false);elRef.current=0;stRef.current=null;setEl(0);setFlipped([]);setReady(false);
    setPhase("deal");
  };

  const getDisplayTime=()=>{if(!settings?.showTimer)return null;return fT(el);};
  const isBlind=cp.blind,canPass=isBlind?sel.length<=(cp.max||3):sel.length===cp.req,hasNew=newIdx.length>0;
  const dn=getDayNum();

  return(
    <div style={{...S.pg,position:"relative",minHeight:"100vh"}} className="rk-pg">
      {phase==="deal"&&hand.length>0&&(
        <>
          {!ready&&<ReadyOverlay mode={mode} dayNum={dn} onReady={()=>setReady(true)} onHome={home}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{...S.back,opacity:0,pointerEvents:"none"}}>← Back</div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div><div style={{fontFamily:F.d,fontSize:9,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>The Daily Mahjong Workout.</div></div>
            <span style={{fontSize:10,color:C.mut,fontWeight:700}}>{mode==="daily"?`Daily #${dn}`:"Practice"}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:10,color:C.mut,fontWeight:600}}>1st Charleston · Pass 1/3</span></div>
          <div style={{display:"flex",gap:3,marginBottom:10}}>{[0,1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i===0?C.gold:C.bdr}}/>)}</div>
          <div style={{textAlign:"center",marginBottom:10}}><span style={{fontSize:22}}>👉</span><h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>Pass Right</h2><p style={{fontSize:12,color:C.mut}}>Select exactly 3 tiles to pass</p></div>
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK (13 tiles)</span>
              <div style={{display:"flex",gap:4}}><button disabled style={{...S.sortBtn,opacity:0.25}}>Sort</button><button disabled style={{...S.sortBtn,opacity:0.25}}>📖 2026 Card</button></div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
              {hand.map((t,i)=>{const isFlipped=flipped.includes(i);return isFlipped?<div key={i} className="rk-flip"><Ti t={t} large={large}/></div>:<div key={i} style={{width:large?44:37,height:large?60:50,borderRadius:7,background:`linear-gradient(160deg,${C.jade}DD,#145C35)`,border:`1.5px solid ${C.jade}50`,flexShrink:0,boxShadow:`0 3px 10px rgba(27,125,78,0.3)`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,opacity:0.2}}>🀄</span></div>;})}
            </div>
          </div>
          <div style={{textAlign:"center",fontSize:13,color:C.mut,fontWeight:700,margin:"5px 0",opacity:0.25}}>0 of 3 selected</div>
          <button disabled style={{...S.passBtn,opacity:0.2}}>🔄 Pass 0 Right</button>
        </>
      )}

      {phase==="result"&&iqResult&&(
        <div className="rk-in">
          <RackleHeader onBack={home}/>
          <IQScorecard
            iq={iqResult}
            hand={hand}
            passLog={passLog}
            isDaily={mode==="daily"}
            dayNum={dn}
            section={`${ev(hand)[0].icon} ${ev(hand)[0].name}`}
            chosenSec={chosenSec}
            allSections={ev(hand)}
            onHome={home}
            onDealAgain={restart}
            onPractice={()=>{home();}}
          />
          <Footer/>
        </div>
      )}

      {phase==="askSecond"&&<Ask icon="🔄" title="Continue Charleston?" desc="Another round: Left → Over → Right?" hand={hand} timer={getDisplayTime()} onSort={()=>setHand(sortHand(hand))} onNo={()=>setPhase("askCourtesy")} onYes={()=>{setCn(2);setPi(0);setSel([]);setNewIdx([]);setPhase("pass");}} large={large}/>}
      {phase==="askCourtesy"&&<Ask icon="🤝" title="Courtesy Pass?" desc="Pass 1–3 tiles across." hand={hand} timer={getDisplayTime()} onSort={()=>setHand(sortHand(hand))} onNo={()=>{stopTimer();setSel([]);setNewIdx([]);setPhase("chooseHand");}} onYes={()=>{setSel([]);setNewIdx([]);setPhase("courtesy");}} large={large}/>}

      {phase==="courtesy"&&(
        <>
          <RackleHeader onBack={()=>setShowLeave(true)}/>
          {getDisplayTime()&&<div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span></div>}
          <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"0 0 2px",textAlign:"center"}}>Courtesy Pass</h2>
          <p style={{fontSize:12,color:C.mut,textAlign:"center",marginBottom:10}}>Select 1–3 tiles to pass across</p>
          {jw&&<JW/>}
          <div style={S.card}><RH hand={hand} onSort={()=>setHand(sortHand(hand))}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t} sel={sel.includes(i)} dim={t.t==="j"} onClick={()=>cTog(i)} large={large}/>)}</div></div>
          <div aria-live="polite" style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"4px 0"}}>{sel.length}/3 selected</div>
          <button onClick={()=>{if(sel.length<1)return;haptic(40);const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);const rem=hand.filter((_,i)=>!sel.includes(i));const safe=pool.filter(t=>t.t!=="j");const inc=safe.slice(0,sel.length);setPool(safe.slice(sel.length));setHand([...rem,...inc]);setPassLog(pl=>[...pl,{label:"Courtesy Pass",roundName:"Courtesy Pass",out:pt,in:inc,blind:false}]);setSel([]);setNewIdx([]);stopTimer();setPhase("chooseHand");}} disabled={sel.length<1} style={{...S.passBtn,opacity:sel.length>=1?1:0.3}}>🔄 {sel.length<1?"Skip (pass 0)":`Pass ${sel.length}`}</button>
        </>
      )}

      {phase==="chooseHand"&&(
        <>
          <RackleHeader onBack={()=>setShowLeave(true)}/>
          {getDisplayTime()&&<div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span></div>}
          <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 2px",textAlign:"center"}}>What hand are you playing?</h2>
          <p style={{fontSize:12,color:C.mut,marginBottom:10,textAlign:"center"}}>Pick your target section.</p>
          <Rack hand={hand} label="YOUR RACK" showSort onSort={()=>setHand(sortHand(hand))} large={large}/>
          <button onClick={()=>setShowRef(!showRef)} aria-expanded={showRef} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,background:showRef?C.gold+"06":"#fff"}}>
            <span style={{fontSize:12,fontWeight:600,color:showRef?C.gold:C.ink}}>📖 {showRef?"Hide":"Show"} 2026 Card Guide</span><span aria-hidden="true" style={{color:C.mut}}>{showRef?"▾":"▸"}</span>
          </button>
          {showRef&&<CG onClose={()=>setShowRef(false)}/>}
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>CHOOSE YOUR SECTION</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
            {SECS.map(s=>{const isSel=chosenSec===s.id;return(
              <button key={s.id} onClick={()=>{haptic(20);setChosenSec(s.id);}} role="radio" aria-checked={isSel} aria-label={`${s.name}: ${s.desc}`}
                style={{cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,
                  border:`1.5px solid ${isSel?s.color:C.bdr}`,
                  background:isSel?s.color+"0A":"#fff",
                  textAlign:"left",transition:"all 0.15s"}}>
                <div style={{width:34,height:34,borderRadius:9,background:isSel?s.color+"18":C.bg2,border:`1.5px solid ${isSel?s.color+"40":C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:isSel?s.color:C.ink,lineHeight:1.2,marginBottom:1}}>{s.name}</div>
                  <div style={{fontSize:11,color:C.mut,lineHeight:1.3}}>{s.desc}</div>
                </div>
                {isSel
                  ?<div style={{width:20,height:20,borderRadius:10,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:10,color:"#fff",fontWeight:900}}>✓</span></div>
                  :<div style={{width:20,height:20,borderRadius:10,border:`1.5px solid ${C.bdr}`,flexShrink:0}}/>}
              </button>);})}
          </div>
          <button onClick={confirm} disabled={!chosenSec} style={{...S.greenBtn,width:"100%",marginTop:4,opacity:chosenSec?1:0.3}}>Rate My Hand →</button>
        </>
      )}

      {phase==="pass"&&(
        <>
          {showLeave&&<LeaveModal onStay={()=>setShowLeave(false)} onLeave={()=>{setShowLeave(false);home();}}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <button onClick={()=>setShowLeave(true)} style={S.back}>← Back</button>
            <div style={{textAlign:"center"}}><div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div><div style={{fontFamily:F.d,fontSize:9,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>The Daily Mahjong Workout.</div></div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
              <span style={{fontSize:10,color:C.mut,fontWeight:700}}>{mode==="daily"?`Daily #${dn}`:"Practice"}</span>
              {getDisplayTime()&&<span style={{fontSize:11,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span>}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:10,color:C.mut,fontWeight:600}}>{cn===1?"1st":"2nd"} Charleston · Pass {pi+1}/3</span></div>
          <div role="progressbar" aria-valuenow={pi} aria-valuemin={0} aria-valuemax={3} style={{display:"flex",gap:3,marginBottom:10}}>{[0,1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<pi?C.jade:i===pi?(hasNew?C.jade:C.gold):C.bdr}}/>)}</div>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span aria-hidden="true" style={{fontSize:22}}>{cp.icon}</span>
            <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>Pass {cp.dir}{isBlind?" (Blind)":""}</h2>
            <p role="status" aria-live="polite" style={{fontSize:12,color:hasNew?C.jade:C.mut,fontWeight:hasNew?600:400}}>{hasNew?`✓ ${newIdx.length} new tile${newIdx.length!==1?"s":""} received`:isBlind?`Select 0–${cp.max||3} tiles to pass`:`Select exactly ${cp.req} tiles to pass`}</p>
          </div>
          {jw&&<JW/>}
          <div style={S.card}>
            <RH hand={hand} onSort={()=>setHand(sortHand(hand))} showRef={showRef} onRef={()=>setShowRef(!showRef)}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t} sel={sel.includes(i)} isNew={newIdx.includes(i)} dim={t.t==="j"&&!hasNew} onClick={!hasNew?()=>toggle(i):undefined} large={large}/>)}</div>
          </div>
          {showRef&&<CG onClose={()=>setShowRef(false)}/>}
          {!hasNew&&<>
            <div role="status" aria-live="polite" style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"5px 0"}}>{sel.length} of {isBlind?(cp.max||3):cp.req} selected</div>
            <button onClick={doPass} disabled={!canPass&&!(isBlind&&sel.length===0)} style={{...S.passBtn,opacity:canPass||(isBlind&&sel.length===0)?1:0.3}}>
              🔄 {isBlind&&sel.length===0?"Skip (pass 0)":`Pass ${sel.length} ${cp.dir}`}
            </button>
          </>}
          {!hasNew&&mode==="free"&&<div style={{marginTop:8}}>
            <button onClick={()=>setShowHint(!showHint)} aria-expanded={showHint} style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:8,padding:"6px 12px",fontSize:11,color:showHint?C.jade:C.mut,cursor:"pointer",fontWeight:600,width:"100%"}}>{showHint?"Hide Hint":"💡 Hint — Best sections for your rack"}</button>
            {showHint&&<div style={{marginTop:6}} className="rk-in">
              {ev(hand).slice(0,4).map(s=>(<div key={s.id}>
                <button onClick={()=>setHintExp(hintExp===s.id?null:s.id)} aria-expanded={hintExp===s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"5px 8px",marginBottom:2,borderRadius:8,background:s.score>0.05?s.color+"08":C.bg2,border:`1px solid ${s.score>0.05?s.color+"20":C.bdr}`,cursor:"pointer"}}>
                  <span style={{fontSize:10,color:s.score>0.05?s.color:C.mut,fontWeight:600}}>{s.icon} {s.name} — {(s.score*100).toFixed(0)}% fit</span><span style={{fontSize:10,color:C.mut}}>{hintExp===s.id?"▾":"▸"}</span>
                </button>
                {hintExp===s.id&&<div style={{padding:"5px 8px",marginBottom:3,fontSize:10,color:C.ink,lineHeight:1.6,background:"#fff",borderRadius:6,border:`1px solid ${C.bdr}`}} className="rk-in">
                  <div><span style={{color:C.jade,fontWeight:700}}>Hold:</span> {s.hold}</div>
                  <div><span style={{color:C.cinn,fontWeight:700}}>Pass:</span> {s.pass}</div>
                </div>}
              </div>))}
            </div>}
          </div>}
        </>
      )}
    </div>
  );
}

// ─── SHARED GAME COMPONENTS ────────────────────────────────────────────────────
function Ask({icon,title,desc,hand,timer,onNo,onYes,onSort,large}){
  return(<div style={S.pg} className="rk-pg"><RackleHeader onBack={onNo}/>{timer&&<div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {timer}</span></div>}<div style={{textAlign:"center",marginBottom:12}}><div aria-hidden="true" style={{fontSize:24,marginBottom:6}}>{icon}</div><h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px"}}>{title}</h2><p style={{fontSize:12,color:C.mut}}>{desc}</p></div><Rack hand={hand} label="YOUR RACK" showSort={!!onSort} onSort={onSort} large={large}/><div style={{display:"flex",gap:8,marginTop:12}}><button onClick={onNo} style={{...S.oBtn,flex:1}}>No, skip</button><button onClick={onYes} style={{...S.greenBtn,flex:2}}>Yes, continue →</button></div></div>);}
function JW(){return(<div role="alert" className="rk-in" style={{padding:"6px 10px",background:C.cinn+"08",borderRadius:8,border:`1px solid ${C.cinn}15`,textAlign:"center",marginBottom:6}}><span style={{fontSize:11,color:C.cinn,fontWeight:600}}>🃏 Jokers cannot be passed — they're too valuable!</span></div>);}
function RH({hand,onSort,showRef,onRef}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK ({hand.length} tiles)</span><div style={{display:"flex",gap:4}}><button onClick={onSort} style={S.sortBtn}>Sort</button>{onRef&&<button onClick={onRef} aria-expanded={showRef} style={{...S.sortBtn,background:showRef?C.jade+"10":"none",color:showRef?C.jade:C.mut,borderColor:showRef?C.jade+"30":C.bdr}}>📖 2026 Card</button>}</div></div>);}
function Rack({hand,label,showSort,onSort,large}){return(<div style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>{label}</span>{showSort&&<button onClick={onSort} style={S.sortBtn}>Sort</button>}</div><div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t} large={large}/>)}</div></div>);}
function CG({onClose}){
  const [exp,setExp]=useState(null);
  return(<div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",maxHeight:380,overflowY:"auto"}} className="rk-in" role="region" aria-label="2026 Card Guide">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,position:"sticky",top:0,background:"#FFFFF8",paddingBottom:3,zIndex:1}}><span style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700}}>📖 2026 CARD GUIDE</span><button onClick={onClose} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer"}}>✕</button></div>
    {SECS.map(s=>{const o=exp===s.id;return(
      <div key={s.id} style={{borderBottom:`1px solid ${C.bdr}`}}>
        <button onClick={()=>setExp(o?null:s.id)} aria-expanded={o} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"8px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span aria-hidden="true" style={{fontSize:13}}>{s.icon}</span><div><span style={{fontSize:12,fontWeight:700,color:C.ink}}>{s.name}</span><span style={{fontSize:10,color:C.mut,marginLeft:6}}>— {s.desc}</span></div></div>
          <span aria-hidden="true" style={{fontSize:11,color:C.mut,flexShrink:0,marginLeft:8}}>{o?"▾":"▸"}</span>
        </button>
        {o&&<div style={{paddingLeft:4,paddingBottom:10}} className="rk-in">
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"7px 9px"}}><div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>✓ HOLD</div><div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.hold}</div></div>
            <div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"7px 9px"}}><div style={{fontSize:8,color:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>✗ PASS</div><div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.pass}</div></div>
          </div>
          <div style={{background:C.gold+"06",borderRadius:8,padding:"7px 9px",marginBottom:s.joker?8:0}}><div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>💡 STRATEGY</div><div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.combos}</div></div>
          {s.joker&&<div style={{background:"#FFF9E6",borderRadius:8,padding:"7px 9px",border:`1px solid ${C.gold}20`}}><div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>🃏 JOKER TIP</div><div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.joker}</div></div>}
        </div>}
      </div>);})}
  </div>);
}

// ─── FIRST PAYOFF ─────────────────────────────────────────────────────────────
// ─── WEEKLY RECAP ─────────────────────────────────────────────────────────────
function getWeeklyRecapData(){
  const now=new Date();
  const dayOfWeek=now.getDay(); // 0=Sun
  const weekStart=new Date(now);
  weekStart.setDate(now.getDate()-dayOfWeek);
  weekStart.setHours(0,0,0,0);
  const h=getHist().filter(e=>e.iqScore!=null&&e.ts>=weekStart.getTime());
  if(!h.length)return null;
  const dailyH=h.filter(e=>e.mode==="daily");
  const avgIQ=Math.round(h.reduce((a,e)=>a+e.iqScore,0)/h.length);
  const bestEntry=h.reduce((a,b)=>b.iqScore>a.iqScore?b:a,h[0]);
  const daysPlayed=new Set(h.map(e=>{const d=new Date(e.ts);return`${d.getMonth()}-${d.getDate()}`;})).size;
  // Section most played this week
  const secCounts={};h.filter(e=>e.sid).forEach(e=>{secCounts[e.sid]=(secCounts[e.sid]||0)+1;});
  const topSecId=Object.keys(secCounts).sort((a,b)=>secCounts[b]-secCounts[a])[0]||null;
  const topSec=topSecId?SECS.find(s=>s.id===topSecId):null;
  // Trend vs prior week
  const prevWeekStart=new Date(weekStart);prevWeekStart.setDate(weekStart.getDate()-7);
  const prevH=getHist().filter(e=>e.iqScore!=null&&e.ts>=prevWeekStart.getTime()&&e.ts<weekStart.getTime());
  const prevAvg=prevH.length?Math.round(prevH.reduce((a,e)=>a+e.iqScore,0)/prevH.length):null;
  const delta=prevAvg!=null?avgIQ-prevAvg:null;
  return{h,dailyH,avgIQ,bestEntry,daysPlayed,topSec,delta,prevAvg,weekRounds:h.length};
}

function shouldShowWeeklyRecap(){
  const now=new Date();
  if(now.getDay()!==0)return false; // Sundays only
  const seed=`${now.getFullYear()}-W${Math.floor(now.getDate()/7)}`;
  return ST.get("weeklyRecapSeen",null)!==seed;
}
function dismissWeeklyRecap(){
  const now=new Date();
  const seed=`${now.getFullYear()}-W${Math.floor(now.getDate()/7)}`;
  ST.set("weeklyRecapSeen",seed);
}

function WeeklyRecapScreen({home,go}){
  const data=getWeeklyRecapData();
  const profile=getProfile();
  if(!data)return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={{textAlign:"center",padding:"48px 0"}}>
        <div style={{fontSize:32,marginBottom:12}}>🀄</div>
        <div style={{fontFamily:F.d,fontSize:18,fontWeight:800,color:C.ink,marginBottom:8}}>No games this week yet</div>
        <div style={{fontSize:13,color:C.mut,lineHeight:1.6,marginBottom:24}}>Play today's Daily to start your week on the leaderboard.</div>
        <button onClick={()=>go("daily")} style={{...S.greenBtn,padding:"13px 32px"}}>Play Today's Daily →</button>
      </div>
    </div>
  );

  const {avgIQ,bestEntry,daysPlayed,topSec,delta,weekRounds,dailyH}=data;
  const IQ_LEVELS=[
    {min:90,label:"Mahjong Master",color:C.gilt},
    {min:80,label:"Skilled Player",color:C.jade},
    {min:70,label:"Game Ready",color:"#2460A8"},
    {min:60,label:"Getting There",color:C.gold},
    {min:0,label:"Keep Going",color:C.cinn},
  ];
  const lvl=IQ_LEVELS.find(l=>avgIQ>=l.min)||IQ_LEVELS[IQ_LEVELS.length-1];

  const shareText=`🀄 My Rackle week:\n${avgIQ} avg IQ · ${daysPlayed}/7 days · ${weekRounds} hands\n${lvl.label}${topSec?` · Fave: ${topSec.icon} ${topSec.name}`:""}\nplayrackle.com`;

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>

      {/* Hero */}
      <div style={{borderRadius:20,background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"24px 20px 20px",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.2)",marginBottom:12}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:3,fontWeight:700,marginBottom:10}}>YOUR WEEK IN RACKLE</div>
        {profile?.nickname&&<div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:8}}>{profile.nickname}</div>}
        <div style={{fontFamily:F.d,fontSize:56,fontWeight:900,color:C.gilt,lineHeight:1,letterSpacing:-2,marginBottom:4}}>{avgIQ}</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:6}}>AVG CHARLESTON IQ</div>
        <div style={{fontFamily:F.d,fontSize:18,fontWeight:800,color:"#fff",marginBottom:16,lineHeight:1}}>{lvl.label}</div>
        <div style={{width:"100%",height:0.5,background:"rgba(255,255,255,0.08)",marginBottom:14}}/>
        <div style={{display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{daysPlayed}<span style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:F.b}}>/7</span></div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>DAYS</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{weekRounds}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>HANDS</div>
          </div>
          <div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{bestEntry.iqScore}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>BEST</div>
          </div>
          {delta!=null&&<><div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:delta>=0?C.jade:C.cinn}}>{delta>=0?"+":""}{delta}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>VS LAST WK</div>
          </div></>}
        </div>
      </div>

      {/* Insights */}
      <div style={{...S.card,marginBottom:8}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>THIS WEEK'S HIGHLIGHTS</div>
        {topSec&&<div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:10,marginBottom:10,borderBottom:`1px solid ${C.bdr}`}}>
          <div style={{width:36,height:36,borderRadius:10,background:topSec.color+"12",border:`1px solid ${topSec.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{topSec.icon}</div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.ink}}>Most played: {topSec.name}</div>
            <div style={{fontSize:10,color:C.mut,marginTop:1}}>Your go-to section this week</div>
          </div>
        </div>}
        <div style={{display:"flex",gap:6}}>
          <div style={{flex:1,background:C.jade+"08",borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${C.jade}15`}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.jade}}>{dailyH.length}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>DAILIES</div>
          </div>
          <div style={{flex:1,background:C.gold+"08",borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${C.gold}15`}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.gold}}>{bestEntry.iqScore}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>BEST IQ</div>
          </div>
          <div style={{flex:1,background:C.cinn+"06",borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${C.cinn}15`}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.cinn}}>{daysPlayed}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>DAYS PLAYED</div>
          </div>
        </div>
      </div>

      {/* Delta message */}
      {delta!=null&&<div style={{...S.card,marginBottom:8,background:delta>=0?C.jade+"06":C.cinn+"06",borderColor:delta>=0?C.jade+"25":C.cinn+"25"}}>
        <div style={{fontSize:12,color:delta>=0?C.jade:C.cinn,fontWeight:700,lineHeight:1.6}}>
          {delta>=0
            ?`↑ Up ${delta} IQ points from last week — you're improving. Keep the streak going.`
            :`↓ Down ${Math.abs(delta)} IQ points from last week. More practice sessions will turn this around.`}
        </div>
      </div>}

      {/* Share */}
      <div style={{...S.card,marginBottom:12}}>
        <div style={{fontFamily:"monospace",fontSize:10,color:C.mut,lineHeight:1.9,whiteSpace:"pre",background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center",borderBottom:`1px solid ${C.bdr}`}}>{shareText}</div>
        <ShareButton text={shareText} label="Share your week" sublabel="Post it to your group chat"/>
      </div>

      {/* CTA */}
      <button onClick={()=>go("daily")} style={{...S.greenBtn,width:"100%",marginBottom:8}}>Play This Week's Daily →</button>
      <button onClick={home} style={{...S.oBtn,width:"100%"}}>Back to Home</button>
      <Footer/>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function Rackle(){
  const [screen,setScreenRaw]=useState("home");
  const setScreen=(s)=>{window.scrollTo(0,0);setScreenRaw(s);};
  const [mode,setMode]=useState("free");
  const [streak,setStreak]=useState(ST.get("str",0));
  const [rounds,setRounds]=useState(ST.get("rnd",0));
  const [dDone,setDDone]=useState(ST.get("dd",null)===getDailySeed());
  const [dRes,setDRes]=useState(ST.get("dres",null));
  const [showHelp,setShowHelp]=useState(false);
  const [settings,setSettings]=useState({...DEFAULT_SETTINGS,...ST.get("settings",{})});
  const [badgeToast,setBadgeToast]=useState(null);
  const [showWeeklyNudge,setShowWeeklyNudge]=useState(shouldShowWeeklyRecap);
  const isFirstDaily=!ST.get("hadFirstDaily",false);

  // Fetch clubs from Supabase on load
  useEffect(()=>{fetchClubs();},[]);

  const onDone=(result)=>{
    setRounds(r=>{const n=r+1;ST.set("rnd",n);return n;});
    const today=getDailySeed();
    let newStreak=streak;
    if(ST.get("ld",null)!==today){
      const y=new Date();y.setDate(y.getDate()-1);
      const yS=y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate();
      newStreak=ST.get("ld",null)===yS?streak+1:1;
      setStreak(newStreak);ST.set("str",newStreak);ST.set("ld",today);
      const badge=getStreakBadge(newStreak);const prevBadge=getStreakBadge(newStreak-1);
      if(badge&&(!prevBadge||badge.days>prevBadge.days))setBadgeToast(badge);
    }
    if(mode==="daily"){
      setDDone(true);ST.set("dd",today);setDRes(result);ST.set("dres",result);
      if(isFirstDaily){ST.set("hadFirstDaily",true);}
    }
    addHist(result);
    // Auto-sync profile if it exists
    const prof=getProfile();
    if(prof&&prof.nickname){
      const pid=getOrCreatePlayerId();
      const bestIQNow=getBestIQ();
      upsertProfile({...prof,playerId:pid,streak:newStreak,roundsPlayed:ST.get("rnd",0),bestIQ:bestIQNow?.score||null});
    }
  };

  const go=(m)=>{setMode(m);setScreen("play");};

  return(
    <AppShell>
      {badgeToast&&<StreakBadgeToast badge={badgeToast} onDismiss={()=>setBadgeToast(null)}/>}
      {/* Sunday weekly recap nudge */}
      {screen==="home"&&showWeeklyNudge&&getWeeklyRecapData()&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={()=>{dismissWeeklyRecap();setShowWeeklyNudge(false);}}>
          <div style={{width:"100%",maxWidth:560,margin:"0 auto",padding:"16px"}} onClick={e=>e.stopPropagation()}>
            <div className="rk-in" style={{background:"#fff",borderRadius:20,padding:"20px 18px",boxShadow:"0 -4px 32px rgba(0,0,0,0.12)"}}>
              <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:8}}>SUNDAY · YOUR WEEK IN RACKLE</div>
              <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,marginBottom:6}}>Weekly Recap is ready 🀄</div>
              <div style={{fontSize:12,color:C.mut,lineHeight:1.6,marginBottom:14}}>See your avg IQ, best hand, consistency, and how you compare to last week.</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{dismissWeeklyRecap();setShowWeeklyNudge(false);setScreen("recap");}} style={{...S.greenBtn,flex:2}}>View My Recap →</button>
                <button onClick={()=>{dismissWeeklyRecap();setShowWeeklyNudge(false);}} style={{...S.oBtn,flex:1}}>Later</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <>
        {screen==="home"&&<Home {...{streak,rounds,dDone,dRes,showHelp,setShowHelp,go,settings,setScreen}} showStats={()=>setScreen("stats")} showSettings={()=>setScreen("settings")} showTutorial={()=>setScreen("tutorial")} showCardGuide={()=>setScreen("cardguide")} showScorecard={()=>setScreen("scorecard")}/>}
        {screen==="tutorial"&&<Tutorial onDone={()=>{ST.set("tutDone",true);setScreen("home");}} onBack={()=>setScreen("home")}/>}
        {screen==="cardguide"&&<CardGuideScreen home={()=>setScreen("home")}/>}
        {screen==="play"&&<Game mode={mode} home={()=>setScreen("home")} onDone={onDone} settings={settings}/>}
        {screen==="stats"&&<Stats home={()=>setScreen("home")} onShowScorecard={()=>setScreen("scorecard")} onRecap={()=>setScreen("recap")} dRes={dRes}/>}
        {screen==="settings"&&<Settings home={()=>setScreen("home")} settings={settings} setSettings={setSettings} showTutorial={()=>setScreen("tutorial")}/>}
        {screen==="scorecard"&&<ScorecardScreen res={dRes} home={()=>setScreen("home")} dayNum={getDayNum()} onPractice={()=>go("free")}/>}
        {screen==="leaderboard"&&<LeaderboardScreen home={()=>setScreen("home")} dRes={dRes} streak={streak}/>}
        {screen==="profile"&&<ProfileScreen home={()=>setScreen("home")} streak={streak} rounds={rounds} dRes={dRes} setScreen={setScreen}/>}
        {screen==="recap"&&<WeeklyRecapScreen home={()=>setScreen("home")} go={go}/>}
      </>
    </AppShell>
  );
}

function AppShell({children}){
  return(
    <div style={S.outer} className="rk-outer">
      <div style={S.app} className="rk-app">
        <style>{CSS}</style>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800;9..144,900&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
        {children}
        <Analytics />
      </div>
    </div>
  );
}
