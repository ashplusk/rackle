import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, useRef, useCallback } from "react";
// RACKLE — Daily Charleston + Practice. The Daily Mahjong Workout. 2026 NMJL. v93.1
// v2.0 — Full Charleston IQ Scoring Engine, IQScorecard, ScorecardScreen

// DESIGN
const C={bg:"#F8F4EE",bg2:"#EDE7DA",ink:"#1A1410",mut:"#6B6157",jade:"#176B42",gold:"#A07828",cinn:"#B02A2A",bdr:"#DDD6C8",
  // IQ hero palette
  hero1:"#062B18",hero2:"#0D4A2E",hero3:"#051F11",gilt:"#C9A84C",
  // card accents
  sage:"#EDF5F0",sageB:"#3D6E52",amber:"#FBF3E2",amberB:"#7A5010",parch:"#F8F4EE",
};
const F={d:"'Fraunces',Georgia,serif",b:"'Nunito','Segoe UI',sans-serif"};
const CSS=`
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#F8F4EE}
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
@keyframes rkBannerIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.rk-banner-in{animation:rkBannerIn 0.4s ease}

.rk-pulse{animation:rkPulse 2s ease-in-out infinite}
@keyframes rkTickIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.rk-tick{animation:rkTickIn 0.15s ease}
`;
const S={
  outer:{background:"#F8F4EE",minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"flex-start"},
  app:{fontFamily:F.b,background:C.bg,minHeight:"100vh",color:C.ink,width:"100%",maxWidth:560,borderLeft:`1px solid ${C.bdr}`,borderRight:`1px solid ${C.bdr}`},
  pg:{padding:"10px 16px",paddingBottom:36},
  pill:{background:C.bg2,borderRadius:12,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  card:{background:"#FDFAF6",border:`1px solid ${C.bdr}`,borderRadius:12,padding:14,marginBottom:8},
  dot:{width:20,height:20,borderRadius:10,background:C.jade+"12",border:`1.5px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.jade,flexShrink:0},
  passBtn:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.cinn},#8A2020)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,minHeight:48},
  greenBtn:{padding:"12px 0",background:`linear-gradient(135deg,${C.jade},#115C38)`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,cursor:"pointer",minHeight:48},
  oBtn:{padding:"10px 0",background:"#F0EAE0",color:C.ink,border:`1px solid ${C.bdr}`,borderRadius:12,fontSize:13,cursor:"pointer",minHeight:44,fontWeight:600},
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
            title:`Daily Rackle #${dayNum} · IQ ${iq.totalScore}`,
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
function toSlug(name){return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function clubBySlug(slug){return Object.entries(CLUBS).find(([,c])=>toSlug(c.name)===slug)||null;}

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
// 2026 NMJL Card — validated against all 3 card images.
// Scoring philosophy derived from hand-count analysis per section:
//   2026: 4 hands | 2468: 8 hands | ALN: 3 hands | QUINTS: 3 hands
//   CR: 8 hands   | 13579: 9 hands  | W/D: 8 hands | 369: 6 hands | S&P: 6 hands
// Key 2026-card tile weights (frequency across all hands):
//   6 → highest (appears in 2026, 2468, 369, W/D concealed) — NEVER pass a 6
//   Flowers → appear in majority of hands across all numeric sections
//   1 → lowest utility (fewest hands), 9 → low utility (only 13579, CR)
//   Soap/0 → only 2026 section; very specific but free to any suit
//   Winds → appear only in 13579 (NN/SS) and W/D; pass from all other sections
function cg(h,fn){const v=h.filter(fn),jk=h.filter(t=>t.t==="j").length,c={};v.forEach(t=>{const k=`${t.t}-${t.s||""}-${t.n||""}-${t.v||""}`;c[k]=(c[k]||0)+1;});const ct=Object.values(c);let kg=0,pg=0,pr=0;ct.forEach(n=>{if(n>=4)kg++;else if(n>=3)pg++;else if(n>=2)pr++;});return{v:v.length,jk,kg,pg,pr};}

// Consecutive Run scoring — window-based group depth.
// The 2026 CR hands are NOT about long runs of singles. They are about
// having pungs/kongs/pairs of numbers that fall within a tight 3–5 number window.
// e.g. 111 222 3333 4444 → window [1,2,3,4], groups: 3+3+4+4 = 14 tiles, very deep.
// e.g. 11 222 33 444 5555 → window [1,2,3,4,5], groups: 2+3+2+3+4 = 14 tiles, 5-wide.
// Scorer: find the best N-wide window where GROUPED tiles is maximised.
// Singles (lone tiles) give 0 group credit — CR needs pungs/kongs, not lone stragglers.
// Steeper width penalties (5-wide=2, 4-wide=1) vs old (1.5/0.5) to tighten requirement.
function crWindowScore(h){
  // CR hands are SAME-SUIT sequences. Score per suit, take the best.
  // Pooling across suits is wrong — 3Bam + 3Crk + 3Dot is NOT a CR group.
  const suits=["bam","crak","dot"];
  let best={score:0,window:0,depth:0,windowNums:[],groupDepth:0,distinctPresent:0,groupCount:0,suit:null};

  for(const suit of suits){
    const gc={};
    h.filter(t=>t.t==="s"&&t.s===suit).forEach(t=>{gc[t.n]=(gc[t.n]||0)+1;});
    if(Object.keys(gc).length<2)continue;

    for(let w=3;w<=5;w++){
      for(let start=1;start<=9-(w-1);start++){
        const wNums=[];
        for(let i=0;i<w;i++)wNums.push(start+i);
        const distinctPresent=wNums.filter(n=>(gc[n]||0)>=1).length;
        if(distinctPresent<2)continue;
        // Singles (cnt===1) give 0 — CR needs actual groups (pairs/pungs/kongs)
        const groupDepth=wNums.reduce((sum,n)=>{
          const cnt=Math.min(gc[n]||0,4);
          return sum+(cnt>=4?4:cnt>=3?3:cnt>=2?2:0);
        },0);
        const groupCount=wNums.filter(n=>(gc[n]||0)>=2).length;
        // Steeper width penalties — 3-wide has the most hand options
        const widthPenalty=w===5?2:w===4?1:0;
        const score=groupDepth*2+groupCount-widthPenalty;
        if(score>best.score){
          best={score,window:w,depth:groupDepth,windowNums:wNums,groupDepth,distinctPresent,groupCount,suit};
        }
      }
    }
  }
  return best;
}

const SECS=[
// ── 2026 (4 hands) ───────────────────────────────────────────────────────────
// Hands: 222 000 2222 6666 | 2026 DDD 2222 DDD | FFF 2026 222 6666 | 22 00 222 666 NEWS
// Key: 2 and 6 always together. Soap (0/White Dragon) acts as wild. 1 NEWS hand needs all 4 winds.
// Flowers appear in hand 3. Dragons appear in hands 1,2,3. 6 is required in all 4 hands.
{id:"2026",name:"2026",color:"#B54E7A",icon:"📅",desc:"Year tiles — 2s, 0 (Soap), 6s",hold:"2s, 6s, Soap (White Dragon) — highest priority. Red & Green Dragons. Flowers only if you have 2+",pass:"All odd numbers (1,3,5,7,9), 4s, 8s — Winds only if building the NEWS hand",combos:"6 appears in all 4 hands — it is your most critical tile. Soap (White Dragon) is uniquely valuable here: it is suit-wild, meaning it counts as any suit's 0. Red and Green Dragons also appear. Flowers only appear in 1 of 4 hands — don't hold a lone Flower for this section.",joker:null,hands:4,
  ck:h=>{
    const twos=h.filter(t=>t.t==="s"&&t.n===2).length;
    const sixes=h.filter(t=>t.t==="s"&&t.n===6).length;
    // Both anchors required — missing either is a strong signal against 2026
    if(!twos||!sixes)return 0.01;
    const soap=h.filter(t=>t.t==="d"&&t.v==="Soap").length;
    const anyDragon=h.filter(t=>t.t==="d").length;
    const flowers=h.filter(t=>t.t==="f").length;
    const winds=h.filter(t=>t.t==="w").length;
    const jk=h.filter(t=>t.t==="j").length;
    const offNums=h.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length;
    // Group quality for 2s and 6s — scale with count
    const twoScore=twos>=4?0.24:twos>=3?0.18:twos>=2?0.12:0.06;
    const sixScore=sixes>=4?0.28:sixes>=3?0.20:sixes>=2?0.13:0.07;
    const support=soap*0.08+anyDragon*0.025+flowers*0.02+jk*0.05;
    const windBonus=winds>=3?0.04:winds>=2?0.02:0;
    const penalty=Math.min(offNums*0.035,0.18);
    return Math.max(0,Math.min(twoScore+sixScore+support+windBonus-penalty,1));
  }},

// ── 2468 (8 hands) ───────────────────────────────────────────────────────────
// Hands: 222 444 6666 8888 | FF 2222 44 66 8888 | EE 22 444 666 88 WW |
//        2222 DDD 8888 DDD | FFF 22 44 666 8888 | 2468 2222 D 2222 D |
//        FFF 2468 FFF 2222 | FF 246 888 246 888
// Key: 6 is in 7/8 hands. 2 in 7/8. 8 in 7/8. 4 in 6/8. Flowers in 5/8. Dragons in 4/8.
// East+West winds in 1 hand only (EE/WW). 8 hands = largest section after CR.
{id:"2468",name:"2468",color:"#B83232",icon:"🔴",desc:"Even numbers — 2, 4, 6, 8",hold:"2s, 4s, 6s, 8s, Flowers, Jokers, any Dragon",pass:"All odds (1,3,5,7,9), North/South Winds",combos:"6 is in 7 of 8 hands — never pass it. 2 is next most common (7/8), then 8 (6/8), then 4 (6/8). The last hand (FF 246 888 246 888) is concealed — no jokers allowed.",joker:null,hands:8,
  ck:h=>{
    const evens=h.filter(t=>t.t==="s"&&t.n%2===0);
    const c={};evens.forEach(t=>{c[t.n]=(c[t.n]||0)+1;});
    const distinctEvens=Object.keys(c).length;
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    const ew=h.filter(t=>t.t==="w"&&(t.v==="E"||t.v==="W")).length;
    const jk=h.filter(t=>t.t==="j").length;
    const odds=h.filter(t=>t.t==="s"&&t.n%2===1).length;
    const nsWinds=h.filter(t=>t.t==="w"&&(t.v==="N"||t.v==="S")).length;
    // Group depth in even tiles — singles give 0 credit
    const evenGroupDepth=Object.values(c).reduce((a,n)=>a+(n>=4?4:n>=3?3:n>=2?2:0),0);
    const groupScore=evenGroupDepth>=10?0.40:evenGroupDepth>=8?0.32:evenGroupDepth>=6?0.24:evenGroupDepth>=4?0.16:evenGroupDepth>=2?0.08:evens.length*0.012;
    const sixBonus=(c[6]||0)>=3?0.12:(c[6]||0)>=2?0.08:(c[6]||0)>=1?0.04:0;
    const divBonus=distinctEvens>=4?0.07:distinctEvens>=3?0.04:distinctEvens>=2?0.02:0;
    const support=flowers*0.025+dragons*0.015+ew*0.015+jk*0.05;
    const penalty=(odds*0.03)+(nsWinds*0.02);
    return Math.max(0,Math.min(groupScore+sixBonus+divBonus+support-penalty,1));
  }},

// ── 369 (6 hands) ─────────────────────────────────────────────────────────────
// Hands: 333 666 6666 9999 | 33 66 333 666 9999 | FFF 33 666 99 DDDD |
//        33 66 666 999 NEWS | FF 3369 3333 3333 | FF 333 666 999 369
// Key: 6 in 6/6 hands (100%). 3 and 9 in 5/6. Flowers in 3/6. Dragons in 2/6. 1 NEWS hand.
// Last hand (FF 333 666 999 369) is CONCEALED.
{id:"369",name:"369",color:"#B84A72",icon:"💗",desc:"Multiples of 3 — 3, 6, 9",hold:"3s, 6s, 9s, any Dragon — Flowers only if you have 2+ (appear in 3/6 hands)",pass:"1s, 2s, 4s, 5s, 7s, 8s, lone Flowers, Winds (unless building NEWS hand)",combos:"6 is in every single 369 hand — the most locked-in anchor on the entire card. Never pass a 6 if you're considering this section. Dragons appear in 2 hands. The final hand (FF 333 666 999 369) is fully concealed — no exposures allowed.",joker:null,hands:6,
  ck:h=>{
    const threes=h.filter(t=>t.t==="s"&&t.n===3).length;
    const sixes=h.filter(t=>t.t==="s"&&t.n===6).length;
    const nines=h.filter(t=>t.t==="s"&&t.n===9).length;
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    const winds=h.filter(t=>t.t==="w").length;
    const jk=h.filter(t=>t.t==="j").length;
    const offNums=h.filter(t=>t.t==="s"&&![3,6,9].includes(t.n)).length;
    // Group depth for 369 tiles — singles give 0 credit
    const dep369=[threes,sixes,nines].reduce((a,n)=>a+(n>=4?4:n>=3?3:n>=2?2:0),0);
    const groupScore=dep369>=9?0.44:dep369>=7?0.34:dep369>=5?0.25:dep369>=3?0.16:dep369>=1?0.08:(threes+sixes+nines)*0.015;
    const sixBonus=sixes>=3?0.10:sixes>=2?0.07:sixes>=1?0.04:0;
    const spreadBonus=(threes>=1&&nines>=1)?0.05:0;
    const support=flowers*0.02+dragons*0.02+jk*0.05;
    const windBonus=winds>=3?0.03:0;
    const penalty=offNums*0.035;
    return Math.max(0,Math.min(groupScore+sixBonus+spreadBonus+support+windBonus-penalty,1));
  }},

// ── 13579 (10 hands) ─────────────────────────────────────────────────────────
// Hands: 11 333 55 777 9999 | 111 333 3333 5555 | NN 1111 33 5555 SS |
//        113579 1111 1111 | FFF 11 33 555 DDDD | 11 33 111 333 5555 |
//        1111 33 55 77 9999 | FF 11 33 55 111 111 | FF 135 777 999 DDD
// Key: 5 in 9/10 hands. 3 in 9/10. 1 in 8/10. Flowers in 4/10. Winds (N,S) in 2/10.
// Dragons in 4/10. 9 in 4/10. 7 in 4/10. 1 is the least flexible odd.
{id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",desc:"Odd numbers — 1, 3, 5, 7, 9",hold:"5s and 3s (top priority), 1s, 7s, 9s, N/S Winds, Flowers, Dragons",pass:"All evens, E/W Winds",combos:"5 and 3 are the most-used odds — appear in 9 of 10 hands. North and South Winds appear in 2 hands (pass East/West freely). Dragons appear in 4 hands — worth holding a pair. Two hands use Dragon kongs: one needs a MATCHING Dragon, one needs an OPPOSITE Dragon. Flowers appear in 4 of 10 hands.",joker:null,hands:10,
  ck:h=>{
    const odds=h.filter(t=>t.t==="s"&&t.n%2===1);
    const c={};odds.forEach(t=>{c[t.n]=(c[t.n]||0)+1;});
    const distinctOdds=Object.keys(c).length;
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    const ns=h.filter(t=>t.t==="w"&&(t.v==="N"||t.v==="S")).length;
    const ew=h.filter(t=>t.t==="w"&&(t.v==="E"||t.v==="W")).length;
    const jk=h.filter(t=>t.t==="j").length;
    const evens=h.filter(t=>t.t==="s"&&t.n%2===0).length;
    // Group depth in odd tiles — singles give 0 credit
    const oddGroupDepth=Object.values(c).reduce((a,n)=>a+(n>=4?4:n>=3?3:n>=2?2:0),0);
    const groupScore=oddGroupDepth>=10?0.38:oddGroupDepth>=8?0.30:oddGroupDepth>=6?0.22:oddGroupDepth>=4?0.15:oddGroupDepth>=2?0.08:odds.length*0.01;
    // 5 and 3 are the heaviest anchors
    const fiveBonus=(c[5]||0)>=3?0.10:(c[5]||0)>=2?0.07:(c[5]||0)>=1?0.04:0;
    const threeBonus=(c[3]||0)>=3?0.08:(c[3]||0)>=2?0.05:(c[3]||0)>=1?0.02:0;
    const divBonus=distinctOdds>=4?0.05:distinctOdds>=3?0.02:0;
    const support=flowers*0.015+dragons*0.01+ns*0.02+jk*0.05;
    const penalty=evens*0.03+ew*0.015;
    return Math.max(0,Math.min(groupScore+fiveBonus+threeBonus+divBonus+support-penalty,1));
  }},

// ── Consecutive Run (9 hands) ─────────────────────────────────────────────────
// Hands: 11 222 33 444 5555 | FFF 1111 234 5555 | 11 22 111 222 3333 |
//        111 222 3333 4444 | FFF 11 22 333 DDDD | 1111 FFFFFF 2222 |
//        FF 1111 2222 3333 | 1 22 333 1 22 333 44 (C) | 55 666 77 888 9999
// Key insight: CR is about GROUP DEPTH within a 3–5 number window, NOT run length.
// 111 222 3333 4444 (4-wide window, kongs+pungs) beats 1 2 3 4 5 6 7 (7 singles).
// The FFFFFF sextette appears in hand 6 — flowers are critical here.
// One hand (FFF 11 22 333 DDDD) uses a Dragon kong — any dragon.
// Concealed hand: 1 22 333 1 22 333 44.
{id:"cr",name:"Consec. Run",color:"#1B7D4E",icon:"🟢",desc:"Sequential numbers — pungs & kongs in a 3–5 number window",hold:"Groups (pungs/kongs) of consecutive numbers, all Flowers, Jokers",pass:"Isolated singles outside your run window, all Winds, scattered numbers",combos:"You need pungs or kongs of 3–4 consecutive numbers — not a long string of singles. One hand uses 6 Flowers as a group. One hand uses a Dragon kong — the Dragon must match the MIDDLE number of your run.",joker:null,hands:8,
  ck:h=>{
    const ws=crWindowScore(h);
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    const jk=h.filter(t=>t.t==="j").length;
    const hon=h.filter(t=>t.t==="w").length;
    // Gate: need at least 2 groups (pairs/pungs/kongs) AND groupDepth>=4
    // Without real group structure, CR is not a viable path
    if(ws.groupCount<2||ws.groupDepth<4){
      return Math.min(ws.groupDepth*0.015+flowers*0.01+jk*0.01,0.08);
    }
    // Normalise window score — max realistic score ~32 with 13 tiles
    const windowVal=Math.min(ws.score/32,1);
    // presentBonus only awarded when group structure is already meaningful
    const presentBonus=ws.groupDepth>=6?(ws.distinctPresent>=4?0.05:ws.distinctPresent>=3?0.02:0):0;
    const flBonus=flowers>=4?0.10:flowers>=2?0.05:flowers>=1?0.02:0;
    const drBonus=dragons>=2?0.03:dragons>=1?0.01:0;
    const jkBonus=jk*0.04;
    const windPenalty=hon*0.04;
    return Math.max(0,Math.min(windowVal+presentBonus+flBonus+drBonus+jkBonus-windPenalty,1));
  }},

// ── Winds & Dragons (8 hands) ─────────────────────────────────────────────────
// Hands: NNNN EEE WWW SSSS | 1234 DDD DDD DDDD | NNN 1111 1111 SSS |
//        EEE 2222 2222 WWW | FFF NNNN FFF DDDD | 1 N 2 EE 3 WWW 4 SSSS |
//        FF NNNN SSSS DD DD | NN EEE 2026 WWW SS (C)
// Key: Winds in 7/8 hands. Dragons in 5/8. Numbers appear in 5/8 (!) but usually as kongs.
// Hand 2: 1234 with 3 dragon groups (very specific consecutive). Hand 3/4: like-number kongs.
// Hand 6: specific 1N 2EE 3WWW 4SSSS (1 suit, specific numbers). Flowers in 2/8.
{id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",desc:"Winds, Dragons — and specific number kongs",hold:"All Winds, all Dragons, Jokers — number kongs of 1–4 if you have 4+ of one value",pass:"Most number tiles, Flowers (appear in only 2 of 8 hands — don't hold a lone Flower)",combos:"Winds appear in 7 of 8 hands — they are your most important tiles here. Dragons appear in 5 of 8. Two hands use kongs of like numbers (1s or 2s), so 4-of-a-kind number tiles can fit. Flowers appear in only 2 hands — only hold them if you're stacking multiple.",joker:null,hands:8,
  ck:h=>{
    const winds=h.filter(t=>t.t==="w");
    const dragons=h.filter(t=>t.t==="d");
    const wc={};winds.forEach(t=>{wc[t.v]=(wc[t.v]||0)+1;});
    const dc={};dragons.forEach(t=>{dc[t.v]=(dc[t.v]||0)+1;});
    const honorTotal=winds.length+dragons.length;
    const flowers=h.filter(t=>t.t==="f").length;
    const jk=h.filter(t=>t.t==="j").length;
    const numKongs=h.filter(t=>t.t==="s"&&[1,2,3,4].includes(t.n));
    const nkc={};numKongs.forEach(t=>{nkc[t.n]=(nkc[t.n]||0)+1;});
    const hasKong=Object.values(nkc).some(v=>v>=4);
    const nums=h.filter(t=>t.t==="s").length;
    // Honor group depth — singles give 0 credit
    const windGroupDepth=Object.values(wc).reduce((a,n)=>a+(n>=4?4:n>=3?3:n>=2?2:0),0);
    const dragonGroupDepth=Object.values(dc).reduce((a,n)=>a+(n>=4?4:n>=3?3:n>=2?2:0),0);
    const honorDepth=windGroupDepth+dragonGroupDepth;
    // Honor density bonus (raw tile count still matters for building toward groups)
    const honorDens=honorTotal>=10?0.15:honorTotal>=8?0.10:honorTotal>=6?0.06:honorTotal>=4?0.03:0;
    const groupScore=honorDepth>=10?0.42:honorDepth>=8?0.32:honorDepth>=6?0.23:honorDepth>=4?0.15:honorDepth>=2?0.08:0;
    const support=flowers*0.02+jk*0.05+(hasKong?0.07:0);
    const offNums=h.filter(t=>t.t==="s"&&![1,2,3,4].includes(t.n)).length;
    const penalty=offNums*0.045+(nums-numKongs.length)*0.02;
    return Math.max(0,Math.min(groupScore+honorDens+support-penalty,1));
  }},

// ── Any Like Numbers (3 hands) ────────────────────────────────────────────────
// Hands: 1111 FFFFFF 1111 | 1111 D 111 D 1111 D | FF 1111 11 1111 DD
// Key: "1" here = any one number. All 3 hands use the SAME number throughout.
// Flowers appear in hands 1 and 3 (as pairs or sextette of 6). Dragons in hands 2 and 3.
// Critical: you must pick ONE number and mass all its copies.
{id:"aln",name:"Like Numbers",color:"#2460A8",icon:"🔵",desc:"All one number — kongs & pairs of the same number",hold:"4+ of one number, Flowers, Jokers, Dragons",pass:"All other numbers — spread is your enemy. Pass any number that isn't your target immediately",combos:"Pick your number by round 1 and commit hard — spreading across two numbers kills your score. Flowers are critical: one hand uses a sextette of 6 Flowers (1111 FFFFFF 1111). Dragons appear in 2 of 3 hands. You need 8–12 tiles of a single number, so Jokers are essential.",joker:null,hands:3,
  ck:h=>{
    const nc={};h.filter(t=>t.t==="s").forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
    const vals=Object.values(nc);
    const best=vals.length?Math.max(...vals):0;
    const spread=vals.length;
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    const jk=h.filter(t=>t.t==="j").length;
    const winds=h.filter(t=>t.t==="w").length;
    // Concentration scoring — must have deep stacks of ONE number
    const dens=best>=7?0.52:best>=6?0.42:best>=5?0.32:best>=4?0.22:best>=3?0.13:best>=2?0.06:0;
    const flBonus=flowers>=4?0.12:flowers>=2?0.06:flowers>=1?0.03:0;
    const support=dragons*0.03+jk*0.07;
    // Spreading across numbers is lethal
    const spreadPenalty=Math.max(0,spread-1)*0.06;
    const windPenalty=winds*0.03;
    return Math.max(0,Math.min(dens+flBonus+support-spreadPenalty-windPenalty,1));
  }},

// ── Quints (3 hands) ──────────────────────────────────────────────────────────
// Hands: 11111 1111 11111 (3 suits, any like nos.) |
//        FF 11111 22 33333 (1 suit, any 3 consec. nos.) |
//        11111 44444 DDDD (2 nos. in 1 suit w opp. dragon)
// Key: Only 3 hands. Quints require 5 of a single tile — impossible without 2+ Jokers.
// Two Jokers are the MINIMUM entry requirement. Without them, abandon immediately.
{id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",desc:"Five of a kind — requires 2+ Jokers",hold:"Jokers (mandatory — need 2+), 3–4 of any tile, Flowers",pass:"Everything else if you don't have 2 Jokers — pivot immediately",combos:"Without 2 Jokers, this section is unreachable — abandon it in round 1. With 2+ Jokers and 3–4 of a specific tile, commit to stacking that tile. Flowers appear in hand 2 (FF 11111 22 33333). The third hand requires the OPPOSITE Dragon (not matching) — hold both dragon types if you have them.",joker:null,hands:3,
  ck:h=>{
    const jk=h.filter(t=>t.t==="j").length;
    // Without 2 jokers, quints are nearly impossible — hard floor
    if(jk<2)return Math.max(0,(jk*0.04));
    const c={};
    h.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}|${t.n}`;c[k]=(c[k]||0)+1;});
    const vals=Object.values(c);
    const best=vals.length?Math.max(...vals):0;
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    // With 2 jokers, scoring is joker-first then tile depth
    const base=jk>=3?0.22:0.14;
    const tileBonus=best>=4?0.26:best>=3?0.18:best>=2?0.08:0;
    const support=flowers*0.02+dragons*0.02;
    return Math.max(0,Math.min(base+tileBonus+support,1));
  }},

// ── Singles & Pairs (6 hands) — CONCEALED ONLY, NO JOKERS ───────────────────
// Hands: NN EE WW SS 1D 1D 1D | 2 4 66 88 2 4 66 88 88 |
//        FF 3369 3669 3699 | 11 22 33 44 55 66 77 (1 suit, any 7 consec.) |
//        11 357 99 11 357 99 | FF 2026 2026 2026
// CONCEALED_ONLY: no exposures. JOKERS_PROHIBITED: jokers cannot be used in singles or pairs.
// Key: All pairs and singles. Flowers appear in 3/6 hands. Specific number pairs.
// The 7-consecutive hand (11 22 33 44 55 66 77) is very specific.
{id:"sp",name:"Singles & Pairs",color:"#2E9485",icon:"🩵",desc:"Only singles and pairs — fully concealed, no Jokers",hold:"Pairs (especially 2026 tiles, 369 tiles, consecutive same-suit pairs), Flowers",pass:"Triples and quads — any group of 3+ is structurally wrong here",combos:"Fully concealed — no exposures allowed. Jokers are completely useless (cannot be a single or in a pair) and cannot be passed in the Charleston, so you're stuck with any you're dealt. Build pairs of matching tiles across all three suits. Flowers count as natural pairs (FF together). One hand uses 7 consecutive same-suit pairs — if you see a run of paired numbers in one suit, protect them.",joker:"Jokers CANNOT be used in Singles & Pairs — not as a single, not in a pair. They have zero value here and cannot be passed away during the Charleston. If you're dealt Jokers and commit to S&P, you're playing shorthanded — factor this in before choosing this section.",hands:6,
  ck:h=>{
    // For S&P: group by exact tile identity
    const c={};
    h.forEach(t=>{
      const k=t.t==="s"?`s-${t.s}-${t.n}`:t.t==="w"?`w-${t.v}`:t.t==="d"?`d-${t.v}`:t.t==="f"?"f":"j";
      c[k]=(c[k]||0)+1;
    });
    const pairs=Object.values(c).filter(v=>v===2).length;
    const triples=Object.values(c).filter(v=>v>=3).length;
    const jk=h.filter(t=>t.t==="j").length;
    const flowers=h.filter(t=>t.t==="f").length;
    // Jokers are anti-tiles for this section
    const jkPenalty=jk*0.08;
    // Triples are structurally wrong — hard penalty
    const triplePenalty=triples*0.10;
    // Pairs are the primary signal — boosted scale
    const pairScore=pairs>=7?0.58:pairs>=6?0.48:pairs>=5?0.37:pairs>=4?0.26:pairs>=3?0.16:pairs>=2?0.08:pairs*0.03;
    // Flowers act as pairs in S&P (they count as natural pairs)
    const flBonus=flowers>=2?0.05:flowers>=1?0.025:0;
    // ── 7-consecutive same-suit pair bonus (11 22 33 44 55 66 77 hand) ──────────
    let consecPairBonus=0;
    for(const suit of ["b","c","d"]){
      const pairedNums=[];
      for(let n=1;n<=9;n++){
        if((c[`s-${suit}-${n}`]||0)===2)pairedNums.push(n);
      }
      let maxRun=0,run=0,prev=null;
      for(const n of pairedNums){
        if(prev!==null&&n===prev+1){run++;} else {run=1;}
        if(run>maxRun)maxRun=run;
        prev=n;
      }
      const runBonus=maxRun>=7?0.22:maxRun>=6?0.16:maxRun>=5?0.11:maxRun>=4?0.07:maxRun>=3?0.03:0;
      if(runBonus>consecPairBonus)consecPairBonus=runBonus;
    }
    return Math.max(0,Math.min(pairScore+flBonus+consecPairBonus-jkPenalty-triplePenalty,1));
  }},
];

// Section metadata for IQ scoring — calibrated to 2026 NMJL card hand analysis
// strongNums: numbers appearing in majority of section's hands (hold priority)
// weakNums: numbers that never or rarely appear in this section (pass immediately)
// riskyPass: numbers so valuable they cost points if accidentally passed
// wantsFlowers: true if flowers appear in 50%+ of section's hands
const SECTION_META={
  // 2026: 2 and 6 in all 4 hands. Soap in 3/4. Flowers in 1/4 (FFF hand only). Winds only for NEWS hand.
  "2026":{strongNums:[2,6],weakNums:[1,3,5,7,9],riskyPass:[2,6],strongTypes:["d"],weakTypes:["w"],wantsFlowers:false,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false,soapCritical:true},
  // 2468: 6 in 7/8, 2+8 in 7/8, 4 in 6/8. Flowers in 5/8. E/W winds in 1 hand.
  "2468":{strongNums:[2,6,8,4],weakNums:[1,3,5,7,9],riskyPass:[6,2,8],strongTypes:[],weakTypes:["w"],wantsFlowers:true,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  // 369: 6 in 6/6 (100%). 3+9 in 5/6. Flowers in 2/6 (FFF hand and FF hand).
  "369":{strongNums:[6,3,9],weakNums:[1,2,4,5,7,8],riskyPass:[6,3,9],strongTypes:[],weakTypes:["w"],wantsFlowers:false,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  // 13579: 5+3 in 9/9 hands. N/S winds in 1/9 hand. Flowers in 4/9. E/W winds NEVER used.
  "13579":{strongNums:[5,3,1,7,9],weakNums:[2,4,6,8],riskyPass:[5,3],strongTypes:["w"],weakTypes:[],wantsFlowers:true,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  // CR: no specific number anchors; run continuity is everything. Flowers critical (sextette).
  "cr":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:["w","d"],wantsFlowers:true,wantsJokers:true,pairBonus:false,runBased:true,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  // W/D: winds in 7/8 hands. Dragons in 5/8. Numbers 1-4 appear in 5/8 hands (kongs of 1s, kongs of 2s, 1234 run, 1N2EE3WWW4SSSS, 2026 concealed).
  "wd":{strongNums:[1,2,3,4],weakNums:[5,6,7,8,9],riskyPass:[],strongTypes:["w","d"],weakTypes:["s"],wantsFlowers:false,wantsJokers:true,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:false},
  // ALN: all hands use same number throughout. Flowers sextette exists. No winds.
  "aln":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:["w"],wantsFlowers:true,wantsJokers:true,pairBonus:false,runBased:false,likeNumbers:true,quintsNeeded:false,pairsOnly:false},
  // Quints: jokers mandatory (need 2+). Without 2 jokers, abandon immediately.
  "q":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:["w"],wantsFlowers:true,wantsJokers:true,pairBonus:false,runBased:false,likeNumbers:false,quintsNeeded:true,pairsOnly:false},
  // S&P: jokers banned. Concealed only. Pairs + singles only. Flowers count.
  "sp":{strongNums:[],weakNums:[],riskyPass:[],strongTypes:[],weakTypes:[],wantsFlowers:true,wantsJokers:false,pairBonus:true,runBased:false,likeNumbers:false,quintsNeeded:false,pairsOnly:true},
};

// ─── 2026 NMJL HAND CATALOG ─────────────────────────────────────────────────
// Every hand on the 2026 card, structured for rack-fit scoring.
// Each hand has: label, section, tiles (what you need to complete it),
// concealed flag, value, and a fit() function that scores the rack 0-1.
// fit() counts tiles already in rack vs tiles needed.
// Jokers are wild for pungs/kongs (not singles/pairs/flowers).
//
// CONSTRAINT ENFORCEMENT — all card parentheticals are now modeled:
//  • "Any 1 Suit"      → countNumSuit per suit, Math.max over suits
//  • "Any 2 Suits"     → try all 3 suit-pair combos, Math.max
//  • "Any 3 Suits"     → requires tiles spread across all 3 suits
//  • "Matching Dragon" → dragon color must match primary suit
//                        bam→Grn, crak→Red, dot→Soap (closest match / wild)
//  • "Opp Dragon"      → dragon color must differ from primary suit
//  • "North/South Only"→ only N/S wind tiles counted (E/W get 0)
//  • "East/West Only"  → only E/W wind tiles counted
//  • "These Nos. Only" → fixed pattern hands (implicit from specific countNum calls)
//  • "Kong X or Y"     → explicit number filters already in countNum calls
//  • Concealed hands   → jokerPool=0, all groups noJoker:true

function mkHand(label,sec,value,concealed,fit){return{label,sec,value,concealed,fit};}

function countTile(rack,fn){return rack.filter(fn).length;}
function countNum(rack,n){return countTile(rack,t=>t.t==="s"&&t.n===n);}
function countNumSuit(rack,n,s){return countTile(rack,t=>t.t==="s"&&t.n===n&&t.s===s);}
function countSuit(rack,s){return countTile(rack,t=>t.t==="s"&&t.s===s);}
function jokers(rack){return countTile(rack,t=>t.t==="j");}
function flowers(rack){return countTile(rack,t=>t.t==="f");}
function winds(rack,v){return v?countTile(rack,t=>t.t==="w"&&t.v===v):countTile(rack,t=>t.t==="w");}
function dragons(rack,v){return v?countTile(rack,t=>t.t==="d"&&t.v===v):countTile(rack,t=>t.t==="d");}

// Dragon matching convention (2026 card):
//   bam  → matching=Grn,  opposite=Red  (Soap counts as matching for any suit)
//   crak → matching=Red,  opposite=Grn
//   dot  → matching=Soap, opposite=Red or Grn (Soap is the "white/dot" dragon)
// For scoring: matchingDragon(r,suit) = count of dragons that legally match
//              oppDragon(r,suit)      = count of dragons that are legally opposite
function matchingDragon(rack,suit){
  if(suit==="bam") return dragons(rack,"Grn")+dragons(rack,"Soap");
  if(suit==="crak")return dragons(rack,"Red")+dragons(rack,"Soap");
  return dragons(rack,"Soap")+dragons(rack,"Grn")+dragons(rack,"Red"); // dot — Soap matches, others ok
}
function oppDragon(rack,suit){
  if(suit==="bam") return dragons(rack,"Red")+dragons(rack,"Soap");
  if(suit==="crak")return dragons(rack,"Grn")+dragons(rack,"Soap");
  return dragons(rack,"Red")+dragons(rack,"Grn"); // dot opp = Red or Grn
}

// Score how many "slots" of a group a rack can fill (with joker assist for pungs/kongs)
function groupFit(have,jokerPool,need){
  const natural=Math.min(have,need);
  const rem=need-natural;
  const jk=Math.min(rem,jokerPool);
  return{natural,jk,total:natural+jk,complete:natural+jk>=need};
}

// Score a hand's fit: returns 0–1 (fraction of hand slots filled by rack)
// groups = array of {have, need} where have = tiles in rack, need = tiles required
// jokerPool = jokers available (jokers can sub for pungs/kongs but not singles/pairs/flowers)
function handFitScore(groups,jokerPool,totalSlots){
  let filled=0,jkLeft=jokerPool;
  for(const g of groups){
    if(g.noJoker){
      filled+=Math.min(g.have,g.need);
    } else {
      const natural=Math.min(g.have,g.need);
      const rem=g.need-natural;
      const jkUsed=Math.min(rem,jkLeft);
      filled+=natural+jkUsed;
      jkLeft-=jkUsed;
    }
  }
  return Math.min(filled/totalSlots,1);
}

// Try all 2-suit combinations and return the best fit score
const SUIT_PAIRS=[["bam","crak"],["bam","dot"],["crak","dot"]];
const ALL_SUITS=["bam","crak","dot"];

const HAND_CATALOG=[
  // ════════════════════════════════════════════════════════════════
  // 2026 SECTION
  // ════════════════════════════════════════════════════════════════

  // 222 000 2222 6666 — Any 2 Suits
  // 2s from one suit, Soap (0) from any, 2s from same/other suit, 6s from a suit
  // Enforce: 2s and 6s must come from at most 2 suits combined
  mkHand("222 000 2222 6666","2026",25,false,r=>{
    const jk=jokers(r);const soap=dragons(r,"Soap");
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t2=countNumSuit(r,2,s1)+countNumSuit(r,2,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      // 2s needed: pung(3) + kong(4) = 7 total; 000 = 3 Soap; 6666 = kong 6
      return handFitScore([{have:t2,need:7},{have:soap,need:3},{have:t6,need:4}],jk,14);
    }));
  }),

  // 2026 DDD 2222 DDD — Any 2 Suits w Matching Dragons, Kong 2 or 6
  // Singles: 2-soap-2-6 (the "2026" sequence); DDD = pung matching dragon; 2222 = kong 2; DDD = pung matching dragon
  // "Kong 2 or 6" means the kong group is 2s OR 6s (try both)
  mkHand("2026 DDD 2222 DDD","2026",25,false,r=>{
    const jk=jokers(r);const soap=dragons(r,"Soap");
    let best=0;
    for(const [s1,s2] of SUIT_PAIRS){
      for(const kongNum of [2,6]){
        const t2s1=countNumSuit(r,2,s1),t2s2=countNumSuit(r,2,s2);
        const t6s1=countNumSuit(r,6,s1),t6s2=countNumSuit(r,6,s2);
        const t2=t2s1+t2s2,t6=t6s1+t6s2;
        const kongTile=kongNum===2?t2:t6;
        // "2026" singles: need one 2, one Soap(0), one 2, one 6 — all noJoker
        // Matching dragon = best matching dragon across s1/s2
        const md=Math.max(matchingDragon(r,s1),matchingDragon(r,s2));
        const sc=handFitScore([
          {have:t2,need:1,noJoker:true},{have:soap,need:1,noJoker:true},
          {have:t2,need:1,noJoker:true},{have:t6,need:1,noJoker:true},
          {have:md,need:3},{have:kongTile,need:4},{have:md,need:3}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FFF 2026 222 6666 — Any 3 Suits
  // Flowers(3) + 2026 singles (one each: 2,0,2,6) + pung 2 + kong 6
  // "Any 3 Suits" means the number tiles should come from 3 different suits
  mkHand("FFF 2026 222 6666","2026",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);const soap=dragons(r,"Soap");
    // Score best 3-suit allocation: pick suit for 2s pung, suit for 6s kong, use all suits
    let best=0;
    for(const s1 of ALL_SUITS)for(const s2 of ALL_SUITS){if(s1===s2)continue;
      const t2=countNumSuit(r,2,s1);const t6=countNumSuit(r,6,s2);
      const sc=handFitScore([
        {have:fl,need:3,noJoker:true},
        {have:t2,need:1,noJoker:true},{have:soap,need:1,noJoker:true},
        {have:t2,need:1,noJoker:true},{have:t6,need:1,noJoker:true},
        {have:t2,need:3},{have:t6,need:4}
      ],jk,15);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // 22 00 222 666 NEWS — Any 2 Suits
  // Pair 2 + pair Soap + pung 2 + pung 6 + NEWS (all 4 winds, one each)
  mkHand("22 00 222 666 NEWS","2026",30,false,r=>{
    const jk=jokers(r);const soap=dragons(r,"Soap");const w=winds(r);
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t2=countNumSuit(r,2,s1)+countNumSuit(r,2,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      return handFitScore([
        {have:t2,need:2,noJoker:true},{have:soap,need:2,noJoker:true},
        {have:t2,need:3},{have:t6,need:3},{have:w,need:4,noJoker:true}
      ],jk,14);
    }));
  }),

  // ════════════════════════════════════════════════════════════════
  // 2468 SECTION
  // ════════════════════════════════════════════════════════════════

  // 222 444 6666 8888 — Any 1 or 2 Suits
  // Try 1-suit (per suit) and 2-suit combos, take best
  mkHand("222 444 6666 8888","2468",25,false,r=>{
    const jk=jokers(r);
    const single=Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:countNumSuit(r,2,s),need:3},{have:countNumSuit(r,4,s),need:3},
      {have:countNumSuit(r,6,s),need:4},{have:countNumSuit(r,8,s),need:4}
    ],jk,14)));
    const double=Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t2=countNumSuit(r,2,s1)+countNumSuit(r,2,s2);
      const t4=countNumSuit(r,4,s1)+countNumSuit(r,4,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      const t8=countNumSuit(r,8,s1)+countNumSuit(r,8,s2);
      return handFitScore([{have:t2,need:3},{have:t4,need:3},{have:t6,need:4},{have:t8,need:4}],jk,14);
    }));
    return Math.max(single,double);
  }),

  // FF 2222 44 66 8888 — Any 2 Suits
  // Flowers(2) + kong 2 + pair 4 + pair 6 + kong 8 — pairs are noJoker
  mkHand("FF 2222 44 66 8888","2468",30,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t2=countNumSuit(r,2,s1)+countNumSuit(r,2,s2);
      const t4=countNumSuit(r,4,s1)+countNumSuit(r,4,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      const t8=countNumSuit(r,8,s1)+countNumSuit(r,8,s2);
      return handFitScore([
        {have:fl,need:2,noJoker:true},{have:t2,need:4},
        {have:t4,need:2,noJoker:true},{have:t6,need:2,noJoker:true},{have:t8,need:4}
      ],jk,14);
    }));
  }),

  // EE 22 444 666 88 WW — Any 1 Suit, East and West Only
  // All number tiles must be same suit; winds must be E and W only
  mkHand("EE 22 444 666 88 WW","2468",30,false,r=>{
    const jk=jokers(r);
    const e=winds(r,"E"),w=winds(r,"W");
    return Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:e,need:2,noJoker:true},{have:countNumSuit(r,2,s),need:2,noJoker:true},
      {have:countNumSuit(r,4,s),need:3},{have:countNumSuit(r,6,s),need:3},
      {have:countNumSuit(r,8,s),need:2,noJoker:true},{have:w,need:2,noJoker:true}
    ],jk,14)));
  }),

  // 2222 DDD 8888 DDD — Any 2 Suits w Matching Dragons, These Nos. Only (2 and 8)
  // Two kongs of 2 and 8; two pungs of matching dragons
  mkHand("2222 DDD 8888 DDD","2468",25,false,r=>{
    const jk=jokers(r);
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t2=countNumSuit(r,2,s1)+countNumSuit(r,2,s2);
      const t8=countNumSuit(r,8,s1)+countNumSuit(r,8,s2);
      const md=Math.max(matchingDragon(r,s1),matchingDragon(r,s2));
      return handFitScore([{have:t2,need:4},{have:md,need:3},{have:t8,need:4},{have:md,need:3}],jk,14);
    }));
  }),

  // FFF 22 44 666 8888 — Any 1 Suit
  // Flowers(3) + pair 2 + pair 4 + pung 6 + kong 8
  mkHand("FFF 22 44 666 8888","2468",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    return Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:fl,need:3,noJoker:true},
      {have:countNumSuit(r,2,s),need:2,noJoker:true},
      {have:countNumSuit(r,4,s),need:2,noJoker:true},
      {have:countNumSuit(r,6,s),need:3},{have:countNumSuit(r,8,s),need:4}
    ],jk,14)));
  }),

  // 2468 2222 D 2222 D — Any 3 Suits, Like Kongs 2,4,6 or 8 w Matching Dragon
  // Singles of 2,4,6,8 (each from any suit), then two groups: kong of same number + matching dragon single
  // "Kong 2,4,6 or 8" = the repeated kong number is one of these evens
  mkHand("2468 2222 D 2222 D","2468",25,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(const kongNum of [2,4,6,8]){
      // Singles 2,4,6,8 from any suits (cross-suit OK for singles row)
      const t2=countNum(r,2),t4=countNum(r,4),t6=countNum(r,6),t8=countNum(r,8);
      const kongTile=kongNum===2?t2:kongNum===4?t4:kongNum===6?t6:t8;
      // Matching dragon — try each suit for the kong group
      for(const s of ALL_SUITS){
        const md=matchingDragon(r,s);
        const sc=handFitScore([
          {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},
          {have:t6,need:1,noJoker:true},{have:t8,need:1,noJoker:true},
          {have:countNumSuit(r,kongNum,s),need:4},{have:md,need:1,noJoker:true},
          {have:countNumSuit(r,kongNum,s),need:4},{have:md,need:1,noJoker:true}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FFF 2468 FFF 2222 — Any 2 Suits, Kong 2,4,6 or 8
  // Flowers(3) + singles 2,4,6,8 + Flowers(3) + kong of one even number
  mkHand("FFF 2468 FFF 2222","2468",30,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(const kongNum of [2,4,6,8]){
      for(const [s1,s2] of SUIT_PAIRS){
        const t2=countNumSuit(r,2,s1)+countNumSuit(r,2,s2);
        const t4=countNumSuit(r,4,s1)+countNumSuit(r,4,s2);
        const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
        const t8=countNumSuit(r,8,s1)+countNumSuit(r,8,s2);
        const kongTile=kongNum===2?t2:kongNum===4?t4:kongNum===6?t6:t8;
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},
          {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},
          {have:t6,need:1,noJoker:true},{have:t8,need:1,noJoker:true},
          {have:fl,need:3,noJoker:true},{have:kongTile,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FF 246 888 246 888 — Any 2 Suits — CONCEALED
  // Two identical groups of singles(2,4,6)+pung(8), each from same 2 suits
  mkHand("FF 246 888 246 888","2468",30,true,r=>{
    const fl=flowers(r);
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t2=countNumSuit(r,2,s1)+countNumSuit(r,2,s2);
      const t4=countNumSuit(r,4,s1)+countNumSuit(r,4,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      const t8=countNumSuit(r,8,s1)+countNumSuit(r,8,s2);
      return handFitScore([
        {have:fl,need:2,noJoker:true},
        {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},{have:t6,need:1,noJoker:true},{have:t8,need:3,noJoker:true},
        {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},{have:t6,need:1,noJoker:true},{have:t8,need:3,noJoker:true}
      ],0,14);
    }));
  }),

  // ════════════════════════════════════════════════════════════════
  // 369 SECTION
  // ════════════════════════════════════════════════════════════════

  // 333 666 6666 9999 — Any 2 or 3 Suits
  mkHand("333 666 6666 9999","369",25,false,r=>{
    const jk=jokers(r);
    const two=Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t3=countNumSuit(r,3,s1)+countNumSuit(r,3,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      const t9=countNumSuit(r,9,s1)+countNumSuit(r,9,s2);
      return handFitScore([{have:t3,need:3},{have:t6,need:3},{have:t6,need:4},{have:t9,need:4}],jk,14);
    }));
    // Also try 3 suits (pool all tiles)
    const t3=countNum(r,3),t6=countNum(r,6),t9=countNum(r,9);
    const three=handFitScore([{have:t3,need:3},{have:t6,need:3},{have:t6,need:4},{have:t9,need:4}],jk,14);
    return Math.max(two,three);
  }),

  // 33 66 333 666 9999 — Any 3 Suits
  mkHand("33 66 333 666 9999","369",25,false,r=>{
    const jk=jokers(r);
    const t3=countNum(r,3),t6=countNum(r,6),t9=countNum(r,9);
    return handFitScore([
      {have:t3,need:2,noJoker:true},{have:t6,need:2,noJoker:true},
      {have:t3,need:3},{have:t6,need:3},{have:t9,need:4}
    ],jk,14);
  }),

  // FFF 33 666 99 DDDD — 1 Suit w Matching or Opp Dragon
  // Try both matching and opposite dragon for each suit
  mkHand("FFF 33 666 99 DDDD","369",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(const s of ALL_SUITS){
      const t3=countNumSuit(r,3,s),t6=countNumSuit(r,6,s),t9=countNumSuit(r,9,s);
      const md=matchingDragon(r,s),od=oppDragon(r,s);
      for(const dr of [md,od]){
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},{have:t3,need:2,noJoker:true},
          {have:t6,need:3},{have:t9,need:2,noJoker:true},{have:dr,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 33 66 666 999 NEWS — Any 2 Suits
  mkHand("33 66 666 999 NEWS","369",30,false,r=>{
    const jk=jokers(r);const w=winds(r);
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t3=countNumSuit(r,3,s1)+countNumSuit(r,3,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      const t9=countNumSuit(r,9,s1)+countNumSuit(r,9,s2);
      return handFitScore([
        {have:t3,need:2,noJoker:true},{have:t6,need:2,noJoker:true},
        {have:t6,need:3},{have:t9,need:3},{have:w,need:4,noJoker:true}
      ],jk,14);
    }));
  }),

  // FF 3369 3333 3333 — Any 3 Suits, Pair 3,6, or 9, Kongs Match Pair
  // FF + singles(pairNum, pairNum, other1, other2) + kong pairNum (suit A) + kong pairNum (suit B)
  // "Pair 3,6 or 9" = pairNum can be 3, 6, or 9; the other two singles are the remaining two of {3,6,9}
  mkHand("FF 3369 3333 3333","369",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(const pairNum of [3,6,9]){
      const others=[3,6,9].filter(n=>n!==pairNum);
      const tP=countNum(r,pairNum);
      const tO1=countNum(r,others[0]),tO2=countNum(r,others[1]);
      // Kongs of pairNum across any 2 of 3 suits
      for(const [s1,s2] of SUIT_PAIRS){
        const k1=countNumSuit(r,pairNum,s1),k2=countNumSuit(r,pairNum,s2);
        const sc=handFitScore([
          {have:fl,need:2,noJoker:true},
          {have:tP,need:2,noJoker:true},{have:tO1,need:1,noJoker:true},{have:tO2,need:1,noJoker:true},
          {have:k1,need:4},{have:k2,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FF 333 666 999 369 — Any 2 Suits — CONCEALED
  mkHand("FF 333 666 999 369","369",30,true,r=>{
    const fl=flowers(r);
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t3=countNumSuit(r,3,s1)+countNumSuit(r,3,s2);
      const t6=countNumSuit(r,6,s1)+countNumSuit(r,6,s2);
      const t9=countNumSuit(r,9,s1)+countNumSuit(r,9,s2);
      return handFitScore([
        {have:fl,need:2,noJoker:true},
        {have:t3,need:3,noJoker:true},{have:t6,need:3,noJoker:true},{have:t9,need:3,noJoker:true},
        {have:t3,need:1,noJoker:true},{have:t6,need:1,noJoker:true},{have:t9,need:1,noJoker:true}
      ],0,14);
    }));
  }),

  // ════════════════════════════════════════════════════════════════
  // 13579 SECTION
  // ════════════════════════════════════════════════════════════════

  // 11 333 55 777 9999 — Any 1 or 3 Suits
  mkHand("11 333 55 777 9999","13579",25,false,r=>{
    const jk=jokers(r);
    const single=Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:countNumSuit(r,1,s),need:2,noJoker:true},{have:countNumSuit(r,3,s),need:3},
      {have:countNumSuit(r,5,s),need:2,noJoker:true},{have:countNumSuit(r,7,s),need:3},{have:countNumSuit(r,9,s),need:4}
    ],jk,14)));
    const t1=countNum(r,1),t3=countNum(r,3),t5=countNum(r,5),t7=countNum(r,7),t9=countNum(r,9);
    const three=handFitScore([
      {have:t1,need:2,noJoker:true},{have:t3,need:3},
      {have:t5,need:2,noJoker:true},{have:t7,need:3},{have:t9,need:4}
    ],jk,14);
    return Math.max(single,three);
  }),

  // 111 333 3333 5555 -or- 555 777 7777 9999 — Any 2 Suits
  // Pattern: pung(A) + pung(B) + kong(B) + kong(C) where A,B,C are consecutive odd nos.
  // Card shows 1,3,5 and 5,7,9 as examples; all consecutive odd triples are valid.
  mkHand("111 333 3333 5555","13579",25,false,r=>{
    const jk=jokers(r);
    const oddTriples=[[1,3,5],[3,5,7],[5,7,9]];
    let best=0;
    for(const [a,b,c] of oddTriples){
      for(const [s1,s2] of SUIT_PAIRS){
        const tA=countNumSuit(r,a,s1)+countNumSuit(r,a,s2);
        const tB=countNumSuit(r,b,s1)+countNumSuit(r,b,s2);
        const tC=countNumSuit(r,c,s1)+countNumSuit(r,c,s2);
        const sc=handFitScore([{have:tA,need:3},{have:tB,need:3},{have:tB,need:4},{have:tC,need:4}],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // NN 1111 33 5555 SS -or- NN 5555 77 9999 SS — Any 1 Suit, North and South Only
  // Pattern: NN + kong(A) + pair(B) + kong(C) + SS where A,B,C are consecutive odds.
  mkHand("NN 1111 33 5555 SS","13579",30,false,r=>{
    const jk=jokers(r);const n=winds(r,"N"),s=winds(r,"S");
    const oddTriples=[[1,3,5],[5,7,9]];
    let best=0;
    for(const [a,b,c] of oddTriples){
      for(const su of ALL_SUITS){
        const sc=handFitScore([
          {have:n,need:2,noJoker:true},{have:countNumSuit(r,a,su),need:4},
          {have:countNumSuit(r,b,su),need:2,noJoker:true},{have:countNumSuit(r,c,su),need:4},
          {have:s,need:2,noJoker:true}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 113579 1111 1111 — Any 3 Suits, Pair Any Odd No., Kongs Match Pair
  // Singles: 1,1,3,5,7,9; then two kongs of the same odd number (matching pair)
  // 113579 1111 1111 — Any 3 Suits, Pair Any Odd No., Kongs Match Pair
  // Singles: pairNum pairNum 3 5 7 9 (with pairNum appearing twice, others once each)
  // Kongs: two kongs of pairNum, one per suit (in 2 of the 3 suits)
  mkHand("113579 1111 1111","13579",25,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(const pairNum of [1,3,5,7,9]){
      const tP=countNum(r,pairNum);
      // Singles row: pairNum x2, then the other four odds x1 each
      const others=[1,3,5,7,9].filter(n=>n!==pairNum);
      const tO=others.map(n=>countNum(r,n));
      for(const [s1,s2] of SUIT_PAIRS){
        const k1=countNumSuit(r,pairNum,s1),k2=countNumSuit(r,pairNum,s2);
        const sc=handFitScore([
          {have:tP,need:1,noJoker:true},{have:tP,need:1,noJoker:true},
          {have:tO[0],need:1,noJoker:true},{have:tO[1],need:1,noJoker:true},
          {have:tO[2],need:1,noJoker:true},{have:tO[3],need:1,noJoker:true},
          {have:k1,need:4},{have:k2,need:4}
        ],jk,15);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FFF 11 33 555 DDDD -or- FFF 55 77 999 DDDD — Any 1 Suit w Matching Dragon
  // Pattern: FFF + pair(A) + pair(B) + pung(C) + dragon kong, A,B,C consecutive odds
  mkHand("FFF 11 33 555 DDDD","13579",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    const oddTriples=[[1,3,5],[5,7,9]];
    let best=0;
    for(const [a,b,c] of oddTriples){
      for(const s of ALL_SUITS){
        const md=matchingDragon(r,s);
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},
          {have:countNumSuit(r,a,s),need:2,noJoker:true},{have:countNumSuit(r,b,s),need:2,noJoker:true},
          {have:countNumSuit(r,c,s),need:3},{have:md,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 11 33 111 333 5555 -or- 55 77 555 777 9999 — Any 3 Suits
  // Pattern: pair(A) + pair(B) + pung(A) + pung(B) + kong(C), A,B,C consecutive odds
  mkHand("11 33 111 333 5555","13579",25,false,r=>{
    const jk=jokers(r);
    const oddTriples=[[1,3,5],[5,7,9]];
    let best=0;
    for(const [a,b,c] of oddTriples){
      const tA=countNum(r,a),tB=countNum(r,b),tC=countNum(r,c);
      const sc=handFitScore([
        {have:tA,need:2,noJoker:true},{have:tB,need:2,noJoker:true},
        {have:tA,need:3},{have:tB,need:3},{have:tC,need:4}
      ],jk,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // 1111 33 55 77 9999 — Any 1 or 2 Suits
  mkHand("1111 33 55 77 9999","13579",30,false,r=>{
    const jk=jokers(r);
    const single=Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:countNumSuit(r,1,s),need:4},
      {have:countNumSuit(r,3,s),need:2,noJoker:true},{have:countNumSuit(r,5,s),need:2,noJoker:true},
      {have:countNumSuit(r,7,s),need:2,noJoker:true},{have:countNumSuit(r,9,s),need:4}
    ],jk,14)));
    const double=Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t1=countNumSuit(r,1,s1)+countNumSuit(r,1,s2);
      const t3=countNumSuit(r,3,s1)+countNumSuit(r,3,s2);
      const t5=countNumSuit(r,5,s1)+countNumSuit(r,5,s2);
      const t7=countNumSuit(r,7,s1)+countNumSuit(r,7,s2);
      const t9=countNumSuit(r,9,s1)+countNumSuit(r,9,s2);
      return handFitScore([
        {have:t1,need:4},{have:t3,need:2,noJoker:true},{have:t5,need:2,noJoker:true},
        {have:t7,need:2,noJoker:true},{have:t9,need:4}
      ],jk,14);
    }));
    return Math.max(single,double);
  }),

  // FF 11 33 55 111 111 -or- FF 55 77 99 555 555 — Any 3 Suits, These Nos. Only — CONCEALED
  // Pattern: FF + pair(A) + pair(B) + pair(C) + pung(A,s1) + pung(A,s2), all 3 consecutive odds
  // "These Nos. Only" = A,B,C must be 1,3,5 or 5,7,9
  mkHand("FF 11 33 55 111 111","13579",35,true,r=>{
    const fl=flowers(r);
    const oddTriples=[[1,3,5],[5,7,9]];
    let best=0;
    for(const [a,b,c] of oddTriples){
      const tA=countNum(r,a),tB=countNum(r,b),tC=countNum(r,c);
      for(const [s1,s2] of SUIT_PAIRS){
        const pAs1=countNumSuit(r,a,s1),pAs2=countNumSuit(r,a,s2);
        const sc=handFitScore([
          {have:fl,need:2,noJoker:true},
          {have:tA,need:2,noJoker:true},{have:tB,need:2,noJoker:true},{have:tC,need:2,noJoker:true},
          {have:pAs1,need:3,noJoker:true},{have:pAs2,need:3,noJoker:true}
        ],0,16);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FF 135 777 999 DDD — Any 1 Suit w Opp Dragon — CONCEALED
  mkHand("FF 135 777 999 DDD","13579",30,true,r=>{
    const fl=flowers(r);
    let best=0;
    for(const s of ALL_SUITS){
      const od=oppDragon(r,s);
      const sc=handFitScore([
        {have:fl,need:2,noJoker:true},
        {have:countNumSuit(r,1,s),need:1,noJoker:true},{have:countNumSuit(r,3,s),need:1,noJoker:true},{have:countNumSuit(r,5,s),need:1,noJoker:true},
        {have:countNumSuit(r,7,s),need:3,noJoker:true},{have:countNumSuit(r,9,s),need:3,noJoker:true},{have:od,need:3,noJoker:true}
      ],0,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // ════════════════════════════════════════════════════════════════
  // CONSECUTIVE RUN SECTION
  // ════════════════════════════════════════════════════════════════

  // 11 222 33 444 5555 — Any 1 Suit, These Nos. Only
  mkHand("11 222 33 444 5555","cr",25,false,r=>{
    const jk=jokers(r);
    return Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:countNumSuit(r,1,s),need:2,noJoker:true},{have:countNumSuit(r,2,s),need:3},
      {have:countNumSuit(r,3,s),need:2,noJoker:true},{have:countNumSuit(r,4,s),need:3},{have:countNumSuit(r,5,s),need:4}
    ],jk,14)));
  }),

  // 55 666 77 888 9999 — Any 1 Suit, These Nos. Only
  mkHand("55 666 77 888 9999","cr",25,false,r=>{
    const jk=jokers(r);
    return Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:countNumSuit(r,5,s),need:2,noJoker:true},{have:countNumSuit(r,6,s),need:3},
      {have:countNumSuit(r,7,s),need:2,noJoker:true},{have:countNumSuit(r,8,s),need:3},{have:countNumSuit(r,9,s),need:4}
    ],jk,14)));
  }),

  // FFF 1111 234 5555 — Any 1 or 2 Suits, Any 5 Consec Nos.
  mkHand("FFF 1111 234 5555","cr",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(let start=1;start<=5;start++){
      const [a,b,c,d,e]=[start,start+1,start+2,start+3,start+4];
      // 1 suit version
      for(const s of ALL_SUITS){
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},{have:countNumSuit(r,a,s),need:4},
          {have:countNumSuit(r,b,s),need:1,noJoker:true},{have:countNumSuit(r,c,s),need:1,noJoker:true},
          {have:countNumSuit(r,d,s),need:1,noJoker:true},{have:countNumSuit(r,e,s),need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
      // 2 suit version
      for(const [s1,s2] of SUIT_PAIRS){
        const t={};
        for(const n of [a,b,c,d,e])t[n]=countNumSuit(r,n,s1)+countNumSuit(r,n,s2);
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},{have:t[a],need:4},
          {have:t[b],need:1,noJoker:true},{have:t[c],need:1,noJoker:true},
          {have:t[d],need:1,noJoker:true},{have:t[e],need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 11 22 111 222 3333 — Any 1 or 3 Suits, Any 3 Consec Nos.
  mkHand("11 22 111 222 3333","cr",25,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(let start=1;start<=7;start++){
      const [a,b,c]=[start,start+1,start+2];
      // 1 suit
      for(const s of ALL_SUITS){
        const sc=handFitScore([
          {have:countNumSuit(r,a,s),need:2,noJoker:true},{have:countNumSuit(r,b,s),need:2,noJoker:true},
          {have:countNumSuit(r,a,s),need:3},{have:countNumSuit(r,b,s),need:3},{have:countNumSuit(r,c,s),need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
      // 3 suits (pool)
      const ta=countNum(r,a),tb=countNum(r,b),tc=countNum(r,c);
      const sc3=handFitScore([
        {have:ta,need:2,noJoker:true},{have:tb,need:2,noJoker:true},
        {have:ta,need:3},{have:tb,need:3},{have:tc,need:4}
      ],jk,14);
      if(sc3>best)best=sc3;
    }
    return best;
  }),

  // 111 222 3333 4444 — Any 1 or 2 Suits, Any 4 Consec Nos.
  mkHand("111 222 3333 4444","cr",25,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(let start=1;start<=6;start++){
      const [a,b,c,d]=[start,start+1,start+2,start+3];
      for(const s of ALL_SUITS){
        const sc=handFitScore([
          {have:countNumSuit(r,a,s),need:3},{have:countNumSuit(r,b,s),need:3},
          {have:countNumSuit(r,c,s),need:4},{have:countNumSuit(r,d,s),need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
      for(const [s1,s2] of SUIT_PAIRS){
        const ta=countNumSuit(r,a,s1)+countNumSuit(r,a,s2);
        const tb=countNumSuit(r,b,s1)+countNumSuit(r,b,s2);
        const tc=countNumSuit(r,c,s1)+countNumSuit(r,c,s2);
        const td=countNumSuit(r,d,s1)+countNumSuit(r,d,s2);
        const sc=handFitScore([{have:ta,need:3},{have:tb,need:3},{have:tc,need:4},{have:td,need:4}],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FFF 11 22 333 DDDD — 1 or 2 Suits, Any Run, Dragons Match Middle No.
  // "Ds Match Middle No." = dragon matches suit of the MIDDLE number in the run
  mkHand("FFF 11 22 333 DDDD","cr",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(let start=1;start<=7;start++){
      const [a,b,c]=[start,start+1,start+2]; // b = middle
      for(const s of ALL_SUITS){
        const md=matchingDragon(r,s); // dragon matches suit of middle number
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},
          {have:countNumSuit(r,a,s),need:2,noJoker:true},{have:countNumSuit(r,b,s),need:2,noJoker:true},
          {have:countNumSuit(r,c,s),need:3},{have:md,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
      // 2-suit variant
      for(const [s1,s2] of SUIT_PAIRS){
        const ta=countNumSuit(r,a,s1)+countNumSuit(r,a,s2);
        const tb=countNumSuit(r,b,s1)+countNumSuit(r,b,s2);
        const tc=countNumSuit(r,c,s1)+countNumSuit(r,c,s2);
        const md=Math.max(matchingDragon(r,s1),matchingDragon(r,s2));
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},
          {have:ta,need:2,noJoker:true},{have:tb,need:2,noJoker:true},
          {have:tc,need:3},{have:md,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 1111 FFFFFF 2222 — Any 1 Suit, Any 2 Consec Nos.
  mkHand("1111 FFFFFF 2222","cr",30,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(let n=1;n<=8;n++){
      for(const s of ALL_SUITS){
        const sc=handFitScore([
          {have:countNumSuit(r,n,s),need:4},{have:fl,need:6,noJoker:true},{have:countNumSuit(r,n+1,s),need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FF 1111 2222 3333 — Any 1 or 3 Suits, Any 3 Consec Nos.
  mkHand("FF 1111 2222 3333","cr",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(let start=1;start<=7;start++){
      const [a,b,c]=[start,start+1,start+2];
      for(const s of ALL_SUITS){
        const sc=handFitScore([
          {have:fl,need:2,noJoker:true},{have:countNumSuit(r,a,s),need:4},
          {have:countNumSuit(r,b,s),need:4},{have:countNumSuit(r,c,s),need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
      // 3-suit pool
      const sc3=handFitScore([
        {have:fl,need:2,noJoker:true},{have:countNum(r,a),need:4},
        {have:countNum(r,b),need:4},{have:countNum(r,c),need:4}
      ],jk,14);
      if(sc3>best)best=sc3;
    }
    return best;
  }),

  // 1 22 333 1 22 333 44 — Any 3 Suits, Any 4 Consec Nos. — CONCEALED
  mkHand("1 22 333 1 22 333 44","cr",35,true,r=>{
    let best=0;
    for(let start=1;start<=6;start++){
      const [a,b,c,d]=[start,start+1,start+2,start+3];
      // Use pooled (any 3 suits) tile counts — concealed, no jokers
      const ta=countNum(r,a),tb=countNum(r,b),tc=countNum(r,c),td=countNum(r,d);
      const sc=handFitScore([
        {have:ta,need:1,noJoker:true},{have:tb,need:2,noJoker:true},{have:tc,need:3,noJoker:true},
        {have:ta,need:1,noJoker:true},{have:tb,need:2,noJoker:true},{have:tc,need:3,noJoker:true},
        {have:td,need:2,noJoker:true}
      ],0,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // ════════════════════════════════════════════════════════════════
  // WINDS & DRAGONS SECTION
  // ════════════════════════════════════════════════════════════════

  // NNNN EEE WWW SSSS / NNN EEEE WWWW SSS — (both forms, Any Winds)
  mkHand("NNNN EEE WWW SSSS","wd",25,false,r=>{
    const jk=jokers(r);
    const n=winds(r,"N"),e=winds(r,"E"),w=winds(r,"W"),s=winds(r,"S");
    return handFitScore([{have:n,need:4},{have:e,need:3},{have:w,need:3},{have:s,need:4}],jk,14);
  }),
  mkHand("NNN EEEE WWWW SSS","wd",25,false,r=>{
    const jk=jokers(r);
    const n=winds(r,"N"),e=winds(r,"E"),w=winds(r,"W"),s=winds(r,"S");
    return handFitScore([{have:n,need:3},{have:e,need:4},{have:w,need:4},{have:s,need:3}],jk,14);
  }),

  // 1234 DDD DDD DDDD — Any 4 Consec Nos. in Any 1 Suit, Any 3 Dragons
  // Singles: 4 consecutive number tiles (same suit). Dragon groups: pung Red + pung Grn + kong Soap (or any permutation of 3 dragon types)
  // "Any 3 Dragons" = one group of each of the 3 dragon types (pung+pung+kong = 3+3+4=10)
  mkHand("1234 DDD DDD DDDD","wd",25,false,r=>{
    const jk=jokers(r);
    const red=dragons(r,"Red"),grn=dragons(r,"Grn"),soap=dragons(r,"Soap");
    let best=0;
    // Try all permutations of which dragon type gets the kong (4) vs pungs (3)
    for(const [kongD,p1D,p2D] of [
      ["Red","Grn","Soap"],["Grn","Red","Soap"],["Soap","Red","Grn"]
    ]){
      const dk=dragons(r,kongD),dp1=dragons(r,p1D),dp2=dragons(r,p2D);
      for(let start=1;start<=6;start++){
        for(const s of ALL_SUITS){
          const sc=handFitScore([
            {have:countNumSuit(r,start,s),need:1,noJoker:true},
            {have:countNumSuit(r,start+1,s),need:1,noJoker:true},
            {have:countNumSuit(r,start+2,s),need:1,noJoker:true},
            {have:countNumSuit(r,start+3,s),need:1,noJoker:true},
            {have:dp1,need:3},{have:dp2,need:3},{have:dk,need:4}
          ],jk,14);
          if(sc>best)best=sc;
        }
      }
    }
    return best;
  }),

  // NNN 1111 1111 SSS — Any Like Odd Nos. in Any 2 Suits
  mkHand("NNN 1111 1111 SSS","wd",25,false,r=>{
    const jk=jokers(r);const n=winds(r,"N"),s=winds(r,"S");
    let best=0;
    for(const oddNum of [1,3,5,7,9]){
      for(const [s1,s2] of SUIT_PAIRS){
        const k1=countNumSuit(r,oddNum,s1),k2=countNumSuit(r,oddNum,s2);
        const sc=handFitScore([{have:n,need:3},{have:k1,need:4},{have:k2,need:4},{have:s,need:3}],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // EEE 2222 2222 WWW — Any Like Even Nos. in Any 2 Suits
  mkHand("EEE 2222 2222 WWW","wd",25,false,r=>{
    const jk=jokers(r);const e=winds(r,"E"),w=winds(r,"W");
    let best=0;
    for(const evenNum of [2,4,6,8]){
      for(const [s1,s2] of SUIT_PAIRS){
        const k1=countNumSuit(r,evenNum,s1),k2=countNumSuit(r,evenNum,s2);
        const sc=handFitScore([{have:e,need:3},{have:k1,need:4},{have:k2,need:4},{have:w,need:3}],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FFF NNNN FFF DDDD — Any Wind, Any Dragon
  // Try each wind type for the kong, and each dragon type for the dragon kong
  mkHand("FFF NNNN FFF DDDD","wd",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(const windVal of ["N","E","W","S"]){
      const wt=winds(r,windVal);
      for(const drType of ["Red","Grn","Soap"]){
        const dt=dragons(r,drType);
        const sc=handFitScore([
          {have:fl,need:3,noJoker:true},{have:wt,need:4},
          {have:fl,need:3,noJoker:true},{have:dt,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 1 N 2 EE 3 WWW 4 SSSS — Any 1 Suit, These Nos. Only
  mkHand("1 N 2 EE 3 WWW 4 SSSS","wd",25,false,r=>{
    const jk=jokers(r);
    const n=winds(r,"N"),e=winds(r,"E"),w=winds(r,"W"),s=winds(r,"S");
    return Math.max(...ALL_SUITS.map(su=>handFitScore([
      {have:countNumSuit(r,1,su),need:1,noJoker:true},{have:n,need:1,noJoker:true},
      {have:countNumSuit(r,2,su),need:1,noJoker:true},{have:e,need:2,noJoker:true},
      {have:countNumSuit(r,3,su),need:1,noJoker:true},{have:w,need:3,noJoker:true},
      {have:countNumSuit(r,4,su),need:1,noJoker:true},{have:s,need:4,noJoker:true}
    ],jk,14)));
  }),

  // FF NNNN SSSS DD DD -or- FF EEEE WWWW DD DD — Any 2 Dragons
  // Two flowers + kong of one wind pair + two pairs of ANY two dragon types (can be same or different)
  mkHand("FF NNNN SSSS DD DD","wd",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    const n=winds(r,"N"),s=winds(r,"S"),e=winds(r,"E"),w=winds(r,"W");
    let best=0;
    const drTypes=["Red","Grn","Soap"];
    // Try both wind variants (N+S or E+W)
    for(const [wa,wb] of [[n,s],[e,w]]){
      // "Any 2 Dragons" — two pairs; try all ordered combos of dragon types
      for(const d1 of drTypes){
        const dr1=dragons(r,d1);
        // Same dragon type for both pairs (4 of same dragon split as 2+2)
        const scSame=handFitScore([
          {have:fl,need:2,noJoker:true},{have:wa,need:4},{have:wb,need:4},
          {have:dr1,need:2,noJoker:true},{have:dr1,need:2,noJoker:true}
        ],jk,14);
        if(scSame>best)best=scSame;
        // Two different dragon types
        for(const d2 of drTypes){if(d2===d1)continue;
          const dr2=dragons(r,d2);
          const scDiff=handFitScore([
            {have:fl,need:2,noJoker:true},{have:wa,need:4},{have:wb,need:4},
            {have:dr1,need:2,noJoker:true},{have:dr2,need:2,noJoker:true}
          ],jk,14);
          if(scDiff>best)best=scDiff;
        }
      }
    }
    return best;
  }),

  // NN EEE 2026 WWW SS — 2026 Any 1 Suit — CONCEALED
  mkHand("NN EEE 2026 WWW SS","wd",30,true,r=>{
    const soap=dragons(r,"Soap");
    const n=winds(r,"N"),e=winds(r,"E"),w=winds(r,"W"),s=winds(r,"S");
    return Math.max(...ALL_SUITS.map(su=>handFitScore([
      {have:n,need:2,noJoker:true},{have:e,need:3,noJoker:true},
      {have:countNumSuit(r,2,su),need:1,noJoker:true},{have:soap,need:1,noJoker:true},
      {have:countNumSuit(r,2,su),need:1,noJoker:true},{have:countNumSuit(r,6,su),need:1,noJoker:true},
      {have:w,need:3,noJoker:true},{have:s,need:2,noJoker:true}
    ],0,14)));
  }),

  // ════════════════════════════════════════════════════════════════
  // ANY LIKE NUMBERS SECTION
  // ════════════════════════════════════════════════════════════════

  // 1111 FFFFFF 1111 — Any 2 Suits
  mkHand("1111 FFFFFF 1111","aln",30,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(let n=1;n<=9;n++){
      for(const [s1,s2] of SUIT_PAIRS){
        const k1=countNumSuit(r,n,s1),k2=countNumSuit(r,n,s2);
        const sc=handFitScore([{have:k1,need:4},{have:fl,need:6,noJoker:true},{have:k2,need:4}],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 1111 D 111 D 1111 D — Any 3 Suits w Matching Dragon
  // Three groups of same number across all 3 suits, each group has a matching dragon single.
  // "Matching Dragon" = the dragon color matches its adjacent suit group.
  // For scoring: use the best matching dragon for the dominant suit spread.
  mkHand("1111 D 111 D 1111 D","aln",25,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(let n=1;n<=9;n++){
      const perSuit=ALL_SUITS.map(s=>({s,c:countNumSuit(r,n,s)})).sort((a,b)=>b.c-a.c);
      // Use all 3 suits; the "matching dragon" for each suit must match that suit's dragon
      // Score: for each suit ordering, use its own matchingDragon
      const md0=matchingDragon(r,perSuit[0].s);
      const md1=matchingDragon(r,perSuit[1].s);
      const md2=matchingDragon(r,perSuit[2].s);
      // We need 3 dragon singles total — one matching each suit group (noJoker)
      // Best approximation: use the dragon pool that best covers all 3
      const sc=handFitScore([
        {have:perSuit[0].c,need:4},{have:md0,need:1,noJoker:true},
        {have:perSuit[1].c,need:3},{have:md1,need:1,noJoker:true},
        {have:perSuit[2].c,need:4},{have:md2,need:1,noJoker:true}
      ],jk,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // FF 1111 11 1111 DD — Any 3 Suits w Any Dragon
  mkHand("FF 1111 11 1111 DD","aln",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);const dr=dragons(r);
    let best=0;
    for(let n=1;n<=9;n++){
      const counts=ALL_SUITS.map(s=>countNumSuit(r,n,s)).sort((a,b)=>b-a);
      const sc=handFitScore([
        {have:fl,need:2,noJoker:true},
        {have:counts[0],need:4},{have:counts[1],need:2,noJoker:true},{have:counts[2],need:4},
        {have:dr,need:2}
      ],jk,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // ════════════════════════════════════════════════════════════════
  // QUINTS SECTION
  // ════════════════════════════════════════════════════════════════

  // 11111 1111 11111 — Any 3 Suits, Any Like Nos.
  // Quint (5) in suit A, Kong (4) in suit B, Quint (5) in suit C — same number
  mkHand("11111 1111 11111","q",40,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(let n=1;n<=9;n++){
      const counts=ALL_SUITS.map(s=>countNumSuit(r,n,s)).sort((a,b)=>b-a);
      const sc=handFitScore([{have:counts[0],need:5},{have:counts[1],need:4},{have:counts[2],need:5}],jk,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // FF 11111 22 33333 — Any 1 Suit, Any 3 Consec Nos.
  mkHand("FF 11111 22 33333","q",45,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    let best=0;
    for(let start=1;start<=7;start++){
      const [a,b,c]=[start,start+1,start+2];
      for(const s of ALL_SUITS){
        const sc=handFitScore([
          {have:fl,need:2,noJoker:true},{have:countNumSuit(r,a,s),need:5},
          {have:countNumSuit(r,b,s),need:2,noJoker:true},{have:countNumSuit(r,c,s),need:5}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 11111 44444 DDDD — Any 2 Nos. in Any 1 Suit w Opp Dragon
  mkHand("11111 44444 DDDD","q",40,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(let n1=1;n1<=9;n1++)for(let n2=n1+1;n2<=9;n2++){
      for(const s of ALL_SUITS){
        const od=oppDragon(r,s);
        const sc=handFitScore([
          {have:countNumSuit(r,n1,s),need:5},{have:countNumSuit(r,n2,s),need:5},{have:od,need:4}
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // ════════════════════════════════════════════════════════════════
  // SINGLES & PAIRS SECTION — CONCEALED, NO JOKERS
  // ════════════════════════════════════════════════════════════════

  // NN EE WW SS 1D 1D 1D — Any 3 Suits, Any Like No. w Matching Dragon
  mkHand("NN EE WW SS 1D 1D 1D","sp",50,true,r=>{
    let best=0;
    const n=winds(r,"N"),e=winds(r,"E"),w=winds(r,"W"),s=winds(r,"S");
    for(let num=1;num<=9;num++){
      // "Matching Dragon" — try each suit for the number tiles
      for(const su of ALL_SUITS){
        const t=countNumSuit(r,num,su);
        const md=matchingDragon(r,su);
        const sc=handFitScore([
          {have:n,need:2,noJoker:true},{have:e,need:2,noJoker:true},
          {have:w,need:2,noJoker:true},{have:s,need:2,noJoker:true},
          {have:t,need:1,noJoker:true},{have:md,need:1,noJoker:true},
          {have:t,need:1,noJoker:true},{have:md,need:1,noJoker:true},
          {have:t,need:1,noJoker:true},{have:md,need:1,noJoker:true}
        ],0,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // 2 4 66 88 2 4 66 88 88 — Any 3 Suits, These Nos. Only
  // All tiles are singles or pairs from 2,4,6,8 spread across 3 suits
  mkHand("2 4 66 88 2 4 66 88 88","sp",50,true,r=>{
    const t2=countNum(r,2),t4=countNum(r,4),t6=countNum(r,6),t8=countNum(r,8);
    return handFitScore([
      {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},
      {have:t6,need:2,noJoker:true},{have:t8,need:2,noJoker:true},
      {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},
      {have:t6,need:2,noJoker:true},{have:t8,need:2,noJoker:true},
      {have:t8,need:2,noJoker:true}
    ],0,16);
  }),

  // FF 3369 3669 3699 — Any 3 Suits
  mkHand("FF 3369 3669 3699","sp",50,true,r=>{
    const fl=flowers(r),t3=countNum(r,3),t6=countNum(r,6),t9=countNum(r,9);
    return handFitScore([
      {have:fl,need:2,noJoker:true},
      {have:t3,need:2,noJoker:true},{have:t6,need:1,noJoker:true},{have:t9,need:1,noJoker:true},
      {have:t3,need:1,noJoker:true},{have:t6,need:2,noJoker:true},{have:t9,need:1,noJoker:true},
      {have:t3,need:1,noJoker:true},{have:t6,need:1,noJoker:true},{have:t9,need:2,noJoker:true}
    ],0,14);
  }),

  // 11 22 33 44 55 66 77 — Any 1 Suit, Any 7 Consec Nos.
  mkHand("11 22 33 44 55 66 77","sp",50,true,r=>{
    let best=0;
    for(const s of ALL_SUITS)for(let start=1;start<=3;start++){
      const tiles=[0,1,2,3,4,5,6].map(i=>countNumSuit(r,start+i,s));
      const sc=handFitScore(tiles.map(have=>({have,need:2,noJoker:true})),0,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // 11 357 99 11 357 99 — Any 2 Suits
  mkHand("11 357 99 11 357 99","sp",50,true,r=>{
    return Math.max(...SUIT_PAIRS.map(([s1,s2])=>{
      const t1=countNumSuit(r,1,s1)+countNumSuit(r,1,s2);
      const t3=countNumSuit(r,3,s1)+countNumSuit(r,3,s2);
      const t5=countNumSuit(r,5,s1)+countNumSuit(r,5,s2);
      const t7=countNumSuit(r,7,s1)+countNumSuit(r,7,s2);
      const t9=countNumSuit(r,9,s1)+countNumSuit(r,9,s2);
      return handFitScore([
        {have:t1,need:2,noJoker:true},{have:t3,need:1,noJoker:true},{have:t5,need:1,noJoker:true},
        {have:t7,need:1,noJoker:true},{have:t9,need:2,noJoker:true},
        {have:t1,need:2,noJoker:true},{have:t3,need:1,noJoker:true},{have:t5,need:1,noJoker:true},
        {have:t7,need:1,noJoker:true},{have:t9,need:2,noJoker:true}
      ],0,14);
    }));
  }),

  // FF 2026 2026 2026 — Any 3 Suits
  // Three repetitions of the 2026 pattern (2, Soap, 2, 6) across 3 suits
  mkHand("FF 2026 2026 2026","sp",75,true,r=>{
    const fl=flowers(r),t2=countNum(r,2),t6=countNum(r,6),soap=dragons(r,"Soap");
    return handFitScore([
      {have:fl,need:2,noJoker:true},
      {have:t2,need:1,noJoker:true},{have:soap,need:1,noJoker:true},{have:t2,need:1,noJoker:true},{have:t6,need:1,noJoker:true},
      {have:t2,need:1,noJoker:true},{have:soap,need:1,noJoker:true},{have:t2,need:1,noJoker:true},{have:t6,need:1,noJoker:true},
      {have:t2,need:1,noJoker:true},{have:soap,need:1,noJoker:true},{have:t2,need:1,noJoker:true},{have:t6,need:1,noJoker:true}
    ],0,14);
  }),
];

// Return top 1-2 specific hands for a section, scored against the rack
function recommendSpecificHands(rack,sectionId){
  if(!rack||!sectionId)return[];
  const hands=HAND_CATALOG.filter(h=>h.sec===sectionId);
  const scored=hands.map(h=>({...h,fit:h.fit(rack)})).sort((a,b)=>b.fit-a.fit);
  return scored.slice(0,3).filter(h=>h.fit>0.05);
}

// ─── HAND FAMILIES ───────────────────────────────────────────────────────────
// Groups sections into strategic families for the scorecard "Best Hand Family" block.
// Each section belongs to exactly one family. Family determines coaching language.
const HAND_FAMILIES={
  "Power":  {label:"Power Hand",emoji:"💪",color:"#7B5CB0",bg:"#F4EFFC",border:"#C4A8E8",
    desc:"Built on jokers and set stacking. Your strength is raw tile depth — pungs and kongs.",
    sections:["q","aln"]},
  "Run":    {label:"Consecutive Run",emoji:"🟢",color:"#1B7D4E",bg:"#EDF7F1",border:"#8FC9A8",
    desc:"Built on connected number sequences. Pungs and kongs within a tight 3–4 number window.",
    sections:["cr"]},
  "Number Pattern":{label:"Number Pattern",emoji:"🔢",color:"#B83232",bg:"#FEF0F0",border:"#E8A8A8",
    desc:"Built on a specific number family — odds, evens, or multiples of 3.",
    sections:["13579","2468","369"]},
  "Year":   {label:"Year Hand (2026)",emoji:"📅",color:"#B54E7A",bg:"#FDF0F6",border:"#E8A8CC",
    desc:"Built on 2s, 6s, and Soap. Highly specific — needs both anchors from the start.",
    sections:["2026"]},
  "Honor":  {label:"Winds & Dragons",emoji:"🌀",color:"#5C5247",bg:"#F3F1EF",border:"#C0B8B0",
    desc:"Built on honor tiles. Pass all number tiles early and stack winds and dragons.",
    sections:["wd"]},
  "Pairs":  {label:"Singles & Pairs",emoji:"🩵",color:"#2E9485",bg:"#EDF8F6",border:"#8ECCC5",
    desc:"Fully concealed. No jokers. Seven natural pairs win this section.",
    sections:["sp"]},
};

function getHandFamily(sectionId){
  return Object.entries(HAND_FAMILIES).find(([,f])=>f.sections.includes(sectionId))?.[1]||null;
}

// ─── CONCRETE PATH GENERATOR ──────────────────────────────────────────────────
// Produces 1–2 specific, tile-grounded paths for the scorecard.
// Uses the actual finalRack tile counts — never generic advice.
function generateHandPaths(finalRack,sortedSections,chosenSecId){
  if(!finalRack||!sortedSections||sortedSections.length===0)return{primary:null,secondary:null};

  const grps={}; // key → count
  finalRack.forEach(t=>{
    const k=t.t==="s"?`${t.n}${t.s[0].toUpperCase()}`:t.t==="w"?`${t.v}W`:t.t==="d"?`${t.v}D`:t.t==="f"?"FL":"JK";
    grps[k]=(grps[k]||0)+1;
  });
  const jokers=finalRack.filter(t=>t.t==="j").length;
  const flowers=finalRack.filter(t=>t.t==="f").length;
  const winds=finalRack.filter(t=>t.t==="w");
  const dragons=finalRack.filter(t=>t.t==="d");

  // Count helpers
  const countOf=(fn)=>finalRack.filter(fn).length;
  const pairsOf=(fn)=>{
    const c={};finalRack.filter(fn).forEach(t=>{
      const k=t.t==="s"?`${t.n}${t.s}`:t.t==="w"?t.v:t.t==="d"?t.v:"f";
      c[k]=(c[k]||0)+1;
    });
    return Object.entries(c).filter(([,v])=>v>=2).map(([k,v])=>({key:k,count:v}));
  };

  // Number count map
  const numCounts={};
  finalRack.filter(t=>t.t==="s").forEach(t=>{numCounts[t.n]=(numCounts[t.n]||0)+1;});

  // Best number for ALN
  const bestNum=Object.entries(numCounts).sort((a,b)=>b[1]-a[1])[0];

  // Even/odd/369 counts
  const evens=Object.entries(numCounts).filter(([n])=>[2,4,6,8].includes(+n)).map(([n,c])=>({n:+n,c}));
  const odds=Object.entries(numCounts).filter(([n])=>[1,3,5,7,9].includes(+n)).map(([n,c])=>({n:+n,c}));
  const t369=Object.entries(numCounts).filter(([n])=>[3,6,9].includes(+n)).map(([n,c])=>({n:+n,c}));
  const twos=numCounts[2]||0,sixes=numCounts[6]||0;
  const soap=countOf(t=>t.t==="d"&&t.v==="Soap");

  // CR window analysis — find the best 4-wide window
  const crWindow=(()=>{
    const suitsPresent=["bam","crak","dot"];
    let bestW=null,bestDepth=0;
    suitsPresent.forEach(s=>{
      const nums=finalRack.filter(t=>t.t==="s"&&t.s===s);
      const byN={};nums.forEach(t=>{byN[t.n]=(byN[t.n]||0)+1;});
      for(let w=1;w<=6;w++){
        const window=[w,w+1,w+2,w+3];
        const depth=window.reduce((sum,n)=>sum+(byN[n]>=2?byN[n]:0),0);
        if(depth>bestDepth){bestDepth=depth;bestW={suit:s,nums:window,depth,byN};}
      }
    });
    return bestW;
  })();

  const top2=sortedSections.filter(s=>s.score>0.05).slice(0,3);
  const primary=top2[0];
  const secondary=top2.find(s=>s.id!==primary?.id&&s.score>0.05);

  // Format a fit % as a readable label (kept for potential future use)
  function fitLabel(fit){const p=Math.round(fit*100);return p>=80?"🔥 "+p+"%":p>=60?"✓ "+p+"%":p>=40?"~ "+p+"%":""+p+"%";}

  function pathForSection(sec){
    if(!sec)return null;
    const id=sec.id;
    const pct=Math.round(sec.score*100);
    let anchor="",why=[],keep=[],pivot="";

    if(id==="q"){
      anchor=jokers>=2?`${jokers} Jokers + ${bestNum?`${bestNum[1]}× ${bestNum[0]}`:"your best tile group"}`:"Jokers (need 2+)";
      why=[jokers>=2?`${jokers} jokers let you build a quint around any tile you stack.`:"You're short on jokers — quints require 2+.",bestNum&&bestNum[1]>=3?`${bestNum[1]}× ${bestNum[0]} is already near-quint depth — stack it.`:"Identify your deepest tile group and commit to it now."];
      keep=jokers>=2?["All Jokers",bestNum?`${bestNum[0]}s (your deepest group)`:"Your best tile group","Flowers"]:[`Need ${2-jokers} more joker(s) to make Quints viable`];
      pivot="If you don't draw another joker in the first 2 turns, pivot to Any Like Numbers.";
    } else if(id==="aln"){
      anchor=bestNum?`${bestNum[1]}× ${bestNum[0]}`:"Your deepest number";
      why=[bestNum?`${bestNum[1]} of ${bestNum[0]} is your current best stack — ALN needs 8–12 of one number.`:"Identify one number to commit to immediately.",jokers>=1?`${jokers} joker${jokers>1?"s":""} help fill out kongs quickly.`:"No jokers — you'll need to draw your number consistently.",flowers>=2?`${flowers} flowers cover the sextette hand (1111 FFFFFF 1111).`:""];
      why=why.filter(Boolean);
      keep=[bestNum?`All ${bestNum[0]}s`:"Your target number","All Jokers","All Flowers"];
      pivot="If another player keeps drawing your number, shift to Any Like Numbers with the next best stack.";
    } else if(id==="cr"){
      const w=crWindow;
      anchor=w?`${w.suit[0].toUpperCase()}${w.suit.slice(1)} ${w.nums[0]}–${w.nums[3]} window`:"Best consecutive window";
      why=[w?`Your ${w.suit} suit has the strongest consecutive grouping (depth ${w.depth}) — that's your CR window.`:"No deep window yet — look for 3-4 numbers with multiple tiles in one suit.",flowers>=2?`${flowers} flowers help — one CR hand uses a flower sextette.`:"",jokers>=1?`${jokers} joker${jokers>1?"s":""} can plug gaps in your window.`:""];
      why=why.filter(Boolean);
      keep=w?[`All ${w.suit} tiles in the ${w.nums[0]}–${w.nums[3]} range`,"All Flowers","All Jokers"]:["Identify your 4-number window before next discard","All Jokers","All Flowers"];
      pivot="If your window stays shallow after 2 draws, pivot to 2468 or 13579 depending on your number parity.";
    } else if(id==="2468"){
      const sixStr=sixes>0?`${sixes}× 6`:"missing 6s";
      const total=evens.reduce((s,e)=>s+e.c,0);
      anchor=`${total} even tiles — ${sixStr} (your anchor)`;
      const deepest=[...evens].sort((a,b)=>b.c-a.c)[0];
      why=[sixes>=2?`${sixes} sixes are a strong anchor — 6 appears in 7 of 8 hands.`:"You need 6s — they appear in 7 of 8 hands. Draw priority.",deepest&&deepest.c>=2?`${deepest.c}× ${deepest.n} is your next deepest group — build on it.`:"Start pairing your even numbers.",flowers>=2?`${flowers} flowers support this section well.`:""];
      why=why.filter(Boolean);
      keep=[sixes>0?"All 6s (never pass)":null,evens.filter(e=>e.c>=2).map(e=>`${e.n}s (${e.c} tiles)`),"All Flowers","All Jokers"].flat().filter(Boolean);
      pivot="If evens stay thin after 3 draws, check if 369 fits better — 6s serve both sections.";
    } else if(id==="369"){
      const total=t369.reduce((s,e)=>s+e.c,0);
      anchor=`${total} tiles of 3/6/9${sixes>0?` — ${sixes}× 6 (anchor)`:""} `;
      why=[sixes>=1?`${sixes} six${sixes>1?"es":""} — 6 is in 100% of 369 hands. It's your core.`:"Missing 6s — they appear in every 369 hand. Draw priority.",t369.filter(e=>e.c>=2).length>0?`You have pairs in ${t369.filter(e=>e.c>=2).map(e=>e.n).join("/")} — protect them.`:"Stack 3s and 9s to pair with your 6s.",flowers>=2?`${flowers} flowers support this section.`:""];
      why=why.filter(Boolean);
      keep=["All 6s (never pass)","All 3s and 9s","All Flowers","All Jokers"].filter(Boolean);
      pivot="If you hold both 6s and 2s, 2468 is your backup — they share the same anchor.";
    } else if(id==="13579"){
      const total=odds.reduce((s,e)=>s+e.c,0);
      const threes=numCounts[3]||0,fives=numCounts[5]||0;
      anchor=`${total} odd tiles — ${threes>0?`${threes}× 3`:""}${fives>0?`, ${fives}× 5`:""}`;
      why=[threes>=2||fives>=2?`${threes}× 3 and ${fives}× 5 — these appear in 9 of 10 hands. Core anchors.`:"Prioritize drawing 3s and 5s — they appear in 9 of 10 hands.",odds.filter(e=>e.c>=2).length>0?`Pairs in ${odds.filter(e=>e.c>=2).map(e=>e.n).join("/")} — protect these.`:"Build pairs in your odd numbers before the game starts.",winds.length>=2?`${winds.length} winds present — some 13579 hands use N/S winds.`:""];
      why=why.filter(Boolean);
      keep=["All 3s and 5s (top priority)","All other odds","All Flowers","All Jokers"];
      pivot="If odds stay thin, check if 369 works — 3s and 9s cross both sections.";
    } else if(id==="2026"){
      anchor=`${twos}× 2, ${sixes}× 6${soap>0?`, ${soap}× Soap`:""}`;
      why=[twos>=1&&sixes>=1?`${twos}× 2 and ${sixes}× 6 — both appear in all 4 hands. Core anchors established.`:twos>=1?`You have ${twos}× 2 but need 6s — both are required in every hand.`:`You have ${sixes}× 6 but need 2s — both are required in every hand.`,soap>=1?`${soap} Soap — suit-wild, covers any 0 position. Very strong for this section.`:"Draw Soap (White Dragon) — it's suit-flexible and appears in 3 of 4 hands.",dragons.length>1?`${dragons.length} dragons support the hand options further.`:""];
      why=why.filter(Boolean);
      keep=["All 2s","All 6s","Soap (White Dragon)","All Dragons","All Jokers"];
      pivot="If you can't find 6s in the first 3 draws, pivot to 2468 — your 2s still contribute.";
    } else if(id==="wd"){
      const honorCount=winds.length+dragons.length;
      anchor=`${winds.length} Winds + ${dragons.length} Dragons (${honorCount} honors)`;
      const windGroups=pairsOf(t=>t.t==="w");
      why=[honorCount>=6?`${honorCount} honor tiles is a deep W&D rack — keep passing number tiles.`:`${honorCount} honors — W&D needs 7+. Pass all number tiles without hesitation.`,windGroups.length>0?`Pairs in ${windGroups.map(g=>g.key).join("/")} Wind — protect these.`:"Stack your most common wind for the best grouping.",dragons.length>=2?`${dragons.length} dragons add flexibility across the 5 hands that use them.`:""];
      why=why.filter(Boolean);
      keep=["All Winds","All Dragons","All Jokers"];
      pivot="If honor tiles stop coming, pivot to Any Like Numbers using any number groups you've kept.";
    } else if(id==="sp"){
      const prs=pairsOf(t=>t.t!=="j");
      anchor=`${prs.length} natural pair${prs.length!==1?"s":""} + ${flowers>=2?`${Math.floor(flowers/2)} flower pair${Math.floor(flowers/2)>1?"s":""}`:""}`;
      why=[prs.length>=4?`${prs.length} natural pairs — that's strong S&P territory. Protect every pair.`:prs.length>=2?`${prs.length} pairs so far — keep building. S&P needs 6–7 pairs to win.`:"Very few pairs — S&P needs 6-7. Consider whether another section fits better.",jokers>0?`${jokers} joker${jokers>1?"s":""} are dead weight in S&P — you can't pass them and they can't be pairs. Factor this in.`:"No jokers — that's perfect for S&P.",flowers>=2?`${flowers} flowers count as natural pairs here.`:""];
      why=why.filter(Boolean);
      keep=["All natural pairs (never break)","Flowers (count as pairs)"];
      pivot=jokers>0?`With ${jokers} joker${jokers>1?"s":""} stuck in your hand, consider switching — jokers cannot form pairs and cannot be passed.`:"If you can't get to 6 pairs by mid-game, pivot to any section where jokers help.";
    }

    return{id,name:sec.name,icon:sec.icon,pct,anchor,why,keep,pivot,family:getHandFamily(id)};
  }

  return{
    primary:pathForSection(primary),
    secondary:secondary?pathForSection(secondary):null,
  };
}

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

function iqDirection(finalRack,sectionId,chosenHandObj){
  // If a specific hand was chosen, score direction as fit against that exact hand
  if(chosenHandObj){
    const fit=chosenHandObj.fit(finalRack); // 0–1
    const pct=Math.round(fit*100);
    const directionScore=Math.round(fit*40); // scale to 0–40
    const directionExplanation=
      pct>=85?`${pct}% fit for ${chosenHandObj.label} — your rack is almost complete for this hand.`:
      pct>=65?`${pct}% fit for ${chosenHandObj.label} — solid foundation, a few key tiles still needed.`:
      pct>=45?`${pct}% fit for ${chosenHandObj.label} — partial match. More tiles needed to commit to this hand.`:
      pct>=25?`${pct}% fit for ${chosenHandObj.label} — low fit. This hand needed a different tile distribution.`:
      `${pct}% fit for ${chosenHandObj.label} — very low fit. The tiles you held don't support this hand well.`;
    return{directionScore:Math.max(2,Math.min(40,directionScore)),directionExplanation};
  }
  const meta=SECTION_META[sectionId]||{};
  const jk=finalRack.filter(t=>t.t==="j").length;
  const fl=finalRack.filter(t=>t.t==="f").length;
  let directionScore=0,directionExplanation="";

  if(sectionId==="cr"){
    const ws=crWindowScore(finalRack);
    const gd=ws.groupDepth||0;
    directionScore=gd>=12?40:gd>=9?34:gd>=7?28:gd>=5?20:gd>=3?13:gd>=1?7:2;
    if(fl>=4)directionScore=Math.min(40,directionScore+5);
    else if(fl>=2)directionScore=Math.min(40,directionScore+2);
    directionScore=Math.max(2,directionScore-finalRack.filter(t=>t.t==="w").length*2);
    const suitNames={bam:"Bam",crak:"Crk",dot:"Dot"};const suitStr=ws.suit?` (${suitNames[ws.suit]||ws.suit})`:"";const wStr=ws.windowNums&&ws.windowNums.length?` within [${ws.windowNums[0]}–${ws.windowNums[ws.windowNums.length-1]}]${suitStr}`:"";
    directionExplanation=gd>=12?`Strong group depth${wStr} — pungs and kongs locked in a tight window.`:gd>=7?`Decent group depth${wStr}. Keep consolidating within your number window.`:gd>=4?`Some grouped tiles${wStr}, but you need pungs/kongs — singles don't win CR hands.`:`Shallow structure. CR rewards pungs & kongs of 3–4 consecutive numbers, not long single runs.`;

  } else if(sectionId==="wd"){
    // Winds in 7/8 hands, Dragons in 5/8. Numbers 1-4 are valid as kongs (3 hands). 5-9 never valid.
    const winds=finalRack.filter(t=>t.t==="w").length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    const honors=winds+dragons;
    const validNums=finalRack.filter(t=>t.t==="s"&&[1,2,3,4].includes(t.n)).length;
    const badNums=finalRack.filter(t=>t.t==="s"&&![1,2,3,4].includes(t.n)).length;
    const windScore=winds>=6?16:winds>=4?12:winds>=3?8:winds>=2?5:winds*2;
    const dragonScore=dragons>=4?10:dragons>=3?7:dragons>=2?4:dragons*1;
    const numKongBonus=validNums>=4?5:validNums>=2?2:0;
    directionScore=Math.min(40,Math.max(2,windScore+dragonScore+numKongBonus-(badNums*4)));
    directionExplanation=honors>=9?`${winds} Winds + ${dragons} Dragons — a deep honor rack.`:honors>=6?`${honors} honor tiles is a solid W&D foundation. Keep passing number tiles.`:honors>=4?`${honors} honors is a start, but W&D needs 7+ to be viable.`:`Only ${honors} honor tiles. Pass all number tiles aggressively.`;

  } else if(sectionId==="aln"){
    // ALN: all 3 hands are kongs of one number + flowers/dragons. Concentration is everything.
    const nc={};finalRack.filter(t=>t.t==="s").forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
    const vals=Object.values(nc),mx=vals.length?Math.max(...vals):0,spread=Object.keys(nc).length;
    // Flowers act as tile-fillers in hand 1 (1111 FFFFFF 1111) — count them as supporting
    const flBonus=fl>=4?6:fl>=2?3:fl>=1?1:0;
    const baseScore=mx>=7?36:mx>=6?30:mx>=5?24:mx>=4?18:mx>=3?10:mx*3;
    const spreadPenalty=Math.max(0,spread-1)*5; // spreading across numbers is fatal
    directionScore=Math.min(40,Math.max(2,baseScore+flBonus-spreadPenalty));
    directionExplanation=mx>=6?`${mx} of one number — excellent consolidation. That's ALN territory.`:mx>=4?`${mx} of a number is a solid nucleus. Pass everything else ruthlessly.`:`Only ${mx} of any single number. Pick one number immediately and consolidate hard.`;

  } else if(sectionId==="sp"){
    // S&P: all 6 hands are singles and pairs. Count flowers correctly (each flower = 1 tile, pairs if 2+).
    // iqCountGroups maps all flowers to key "f" — so 2 flowers = count 2 = 1 pair. That's correct.
    const grps=iqCountGroups(finalRack);
    const allVals=Object.values(grps);
    const pairs=allVals.filter(v=>v===2).length;
    const triples=allVals.filter(v=>v>=3).length;
    const jkCount=finalRack.filter(t=>t.t==="j").length;
    // Jokers count as triples structurally — they can't be singles or pairs, so they break the pattern
    directionScore=pairs>=6&&triples===0&&jkCount===0?40:pairs>=5&&triples===0?34:pairs>=4&&triples===0?26:pairs>=3&&triples<=1?18:pairs>=2?10:pairs*4;
    directionExplanation=pairs>=6&&jkCount===0?`${pairs} pairs, no triples, no jokers — textbook S&P structure.`:pairs>=4?`${pairs} pairs is strong. Avoid any triples and get rid of those jokers.`:pairs>=2?`${pairs} pairs is a start. You need 6+ pairs to win — build more.`:`Only ${pairs} pairs. Singles & Pairs needs 6 clean pairs to complete.`;

  } else if(sectionId==="q"){
    // Quints: 5 of one tile. Max natural is 4 (one of each suit) — always needs 1+ joker per quint.
    // Hand 1: 11111 1111 11111 = 3 different quints = needs 2 jokers minimum for 2 of the 3 quints.
    // Hand 2: FF 11111 22 33333 = 1 suit, 2 quints over 3 consec numbers + FF.
    // Hand 3: 11111 44444 DDDD = 2 quints + dragon kong, 1 suit.
    // Key metric: do you have 2 jokers + deep tile stacks?
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}|${t.n}`;c[k]=(c[k]||0)+1;});
    const mx=Object.values(c).length?Math.max(...Object.values(c)):0;
    // Check for consecutive pairs (hand 2 needs 3 consec numbers in same suit)
    const suitNums={};finalRack.filter(t=>t.t==="s").forEach(t=>{if(!suitNums[t.s])suitNums[t.s]=new Set();suitNums[t.s].add(t.n);});
    let hasConsecSuit=false;Object.values(suitNums).forEach(ns=>{const a=[...ns].sort((a,b)=>a-b);for(let i=0;i<a.length-1;i++){if(a[i+1]===a[i]+1)hasConsecSuit=true;}});
    directionScore=jk>=2&&mx>=3?40:jk>=2&&mx>=2?30:jk>=2?20:jk>=1&&mx>=3?22:jk>=1?12:(mx>=3?8:mx*2);
    if(jk>=2&&hasConsecSuit)directionScore=Math.min(40,directionScore+4);
    directionExplanation=jk>=2&&mx>=3?`${jk} jokers and ${mx} of a tile — well positioned for a quint.`:jk>=2?`${jk} jokers is the entry requirement — now build tile depth (need 3-4 of one tile).`:jk>=1?`Only ${jk} joker. Quints needs at least 2 — this section is risky without more.`:"No jokers. Quints is unreachable without at least 2 jokers.";

  } else if(sectionId==="2026"){
    // 2026: count 2s, 6s, Soap, and dragons — this section's "strong tiles" span tile types.
    // Treat Soap + any Dragon as supporting since they appear in 3/4 hands.
    const twos=finalRack.filter(t=>t.t==="s"&&t.n===2).length;
    const sixes=finalRack.filter(t=>t.t==="s"&&t.n===6).length;
    const soap=finalRack.filter(t=>t.t==="d"&&t.v==="Soap").length;
    const otherDragons=finalRack.filter(t=>t.t==="d"&&t.v!=="Soap").length;
    const winds=finalRack.filter(t=>t.t==="w").length;
    const offNums=finalRack.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length;
    // 6 is in all 4 hands, 2 is in all 4 hands — both required
    const sixScore=sixes>=3?16:sixes>=2?12:sixes>=1?6:0;
    const twoScore=twos>=3?12:twos>=2?8:twos>=1?4:0;
    const soapBonus=soap>=1?5:0;
    const dragonBonus=otherDragons>=2?3:otherDragons>=1?1:0;
    const windBonus=winds>=3?3:winds>=2?1:0; // NEWS hand needs all 4 winds
    const flBonus=fl>=1?2:0;
    const offPenalty=Math.min(offNums*4,20);
    directionScore=Math.min(40,Math.max(2,sixScore+twoScore+soapBonus+dragonBonus+windBonus+flBonus-offPenalty));
    const coreStr=sixes>0&&twos>0?`${twos} Twos + ${sixes} Sixes — the 2026 core is there.`:sixes>0?`${sixes} Sixes but missing 2s — you need both for every 2026 hand.`:`${twos} Twos but missing 6s — 6 appears in all 4 hands, it's critical.`;
    directionExplanation=offNums>=4?coreStr+` But ${offNums} off-direction tiles are diluting the rack.`:coreStr;

  } else if(sectionId==="2468"){
    // 2468: count all even tiles. 6 is most critical (7/8 hands), then 2 and 8 (7/8), then 4 (6/8).
    const ec={};finalRack.filter(t=>t.t==="s"&&t.n%2===0).forEach(t=>{ec[t.n]=(ec[t.n]||0)+1;});
    const totalEvens=Object.values(ec).reduce((a,b)=>a+b,0);
    const distinctEvens=Object.keys(ec).length;
    const odds=finalRack.filter(t=>t.t==="s"&&t.n%2===1).length;
    const nsWinds=finalRack.filter(t=>t.t==="w"&&(t.v==="N"||t.v==="S")).length;
    // 6 anchor bonus
    const sixBonus=(ec[6]||0)>=2?8:(ec[6]||0)>=1?4:0;
    const densScore=totalEvens>=9?24:totalEvens>=7?18:totalEvens>=5?13:totalEvens>=3?8:totalEvens*2;
    const divBonus=distinctEvens>=4?4:distinctEvens>=3?2:0;
    const flBonus=fl>=2?3:fl>=1?1:0;
    const offPenalty=(odds*3)+(nsWinds*2);
    directionScore=Math.min(40,Math.max(2,densScore+sixBonus+divBonus+flBonus-offPenalty));
    directionExplanation=totalEvens>=8?`${totalEvens} even tiles across ${distinctEvens} values — strong 2468 rack.`:totalEvens>=5?`${totalEvens} even tiles. Focus on deepening groups, not spreading across more values.`:totalEvens>=3?`${totalEvens} even tiles — viable but needs more depth. Pass odds aggressively.`:`Only ${totalEvens} even tiles. Pass all odd tiles immediately.`;

  } else if(sectionId==="369"){
    // 369: 3, 6, 9 only. 6 in 100% of hands — most critical tile on the entire card for this section.
    const threes=finalRack.filter(t=>t.t==="s"&&t.n===3).length;
    const sixes=finalRack.filter(t=>t.t==="s"&&t.n===6).length;
    const nines=finalRack.filter(t=>t.t==="s"&&t.n===9).length;
    const total=threes+sixes+nines;
    const offNums=finalRack.filter(t=>t.t==="s"&&![3,6,9].includes(t.n)).length;
    const winds=finalRack.filter(t=>t.t==="w").length;
    // 6 is the absolute anchor
    const sixScore=sixes>=3?18:sixes>=2?13:sixes>=1?7:0;
    const spreadBonus=(threes>=1&&nines>=1)?4:(threes>=1||nines>=1)?2:0;
    const densScore=total>=8?20:total>=6?14:total>=4?9:total>=2?4:total*1;
    const flBonus=fl>=2?2:fl>=1?1:0;
    const offPenalty=(offNums*4)+(winds>=3?0:winds*2); // winds only ok if NEWS hand possible
    directionScore=Math.min(40,Math.max(2,densScore+sixScore+spreadBonus+flBonus-offPenalty));
    directionExplanation=sixes===0?`No 6s — 6 appears in every 369 hand. This section needs 6s urgently.`:total>=8?`${total} tiles across 3/6/9 — strong structure.`:total>=5?`${total} tiles of 3/6/9. Keep building and pass non-multiples of 3 first.`:`Only ${total} tiles of 3/6/9 — pass all other numbers immediately.`;

  } else if(sectionId==="13579"){
    // 13579: 10 hands — 5 and 3 in 9/10, N+S winds in 2 hands, flowers in 4/10, dragons in 4/10.
    const oc={};finalRack.filter(t=>t.t==="s"&&t.n%2===1).forEach(t=>{oc[t.n]=(oc[t.n]||0)+1;});
    const totalOdds=Object.values(oc).reduce((a,b)=>a+b,0);
    const distinctOdds=Object.keys(oc).length;
    const evens=finalRack.filter(t=>t.t==="s"&&t.n%2===0).length;
    const ns=finalRack.filter(t=>t.t==="w"&&(t.v==="N"||t.v==="S")).length;
    const ew=finalRack.filter(t=>t.t==="w"&&(t.v==="E"||t.v==="W")).length;
    // 5 and 3 are the primary anchors
    const fiveBonus=(oc[5]||0)>=2?8:(oc[5]||0)>=1?4:0;
    const threeBonus=(oc[3]||0)>=2?6:(oc[3]||0)>=1?3:0;
    const densScore=totalOdds>=9?22:totalOdds>=7?16:totalOdds>=5?11:totalOdds>=3?6:totalOdds*1;
    const divBonus=distinctOdds>=4?3:distinctOdds>=3?1:0;
    const nsBonus=ns>=2?3:ns>=1?1:0; // N+S winds valid in 2 hands
    const flBonus=fl>=2?2:fl>=1?1:0;
    const offPenalty=(evens*3)+(ew*2);
    directionScore=Math.min(40,Math.max(2,densScore+fiveBonus+threeBonus+divBonus+nsBonus+flBonus-offPenalty));
    directionExplanation=totalOdds>=8?`${totalOdds} odd tiles — a committed 13579 rack.`:totalOdds>=5?`${totalOdds} odd tiles. Focus on 5s and 3s — they appear in every hand.`:totalOdds>=3?`${totalOdds} odds — pass all even tiles immediately.`:`Only ${totalOdds} odd tiles. 13579 needs 8+ odds to be competitive.`;
  }

  return{directionScore:Math.max(0,Math.min(40,Math.round(directionScore))),directionExplanation};
}

function iqTileStrength(finalRack,sectionId,chosenHandObj){
  // If a specific hand was chosen, tile strength = how well the rack supports that hand's groups
  if(chosenHandObj){
    const fit=chosenHandObj.fit(finalRack);
    const pct=Math.round(fit*100);
    // Scale fit to 0–25, with a slight curve to reward high fits
    const raw=pct>=90?25:pct>=80?22:pct>=70?18:pct>=60?14:pct>=50?11:pct>=40?8:pct>=25?5:Math.round(fit*20);
    return{tileStrengthScore:Math.max(0,Math.min(25,raw))};
  }
  const meta=SECTION_META[sectionId]||{};
  const jk=finalRack.filter(t=>t.t==="j").length;
  const fl=finalRack.filter(t=>t.t==="f").length;
  const grps=iqCountGroups(finalRack);
  const allVals=Object.values(grps);
  const pairs=allVals.filter(v=>v===2).length;
  const pungs=allVals.filter(v=>v===3).length;
  const kongs=allVals.filter(v=>v>=4).length;
  let raw=0;

  if(sectionId==="sp"){
    // S&P — CONCEALED, NO JOKERS. Pairs only (no pungs/kongs). Flowers count as pairs.
    // 6 hands: need 6 pairs + 1 single OR 7 pairs (depending on hand).
    // Flowers: iqCountGroups maps all flowers to "f", so 2 flowers = pair. Correct.
    const jkCount=finalRack.filter(t=>t.t==="j").length;
    raw+=pairs>=7?25:pairs>=6?22:pairs>=5?17:pairs>=4?12:pairs>=3?7:pairs>=2?4:pairs*1;
    raw-=(pungs+kongs)*8; // pungs/kongs structurally break S&P
    raw-=jkCount*8;       // jokers cannot be singles or pairs — poison
    raw=Math.max(0,raw);

  } else if(sectionId==="cr"){
    // CR — window depth is the primary signal
    const ws=crWindowScore(finalRack);
    const gd=ws.groupDepth||0;
    const dp=ws.distinctPresent||0;
    raw+=gd>=12?22:gd>=9?17:gd>=7?13:gd>=5?9:gd>=3?5:gd*1;
    raw+=dp>=4?3:dp>=3?1:0;
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=4?5:fl>=2?3:fl>=1?1:0; // sextette hand
    raw-=finalRack.filter(t=>t.t==="w").length*2;

  } else if(sectionId==="wd"){
    // W/D — winds and dragons. Number kongs of 1-4 are valid (3 hands). 5-9 never valid.
    // Pairs of winds/dragons matter a lot (multiple hands use pairs of honor tiles).
    const winds=finalRack.filter(t=>t.t==="w").length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    const honors=winds+dragons;
    const validNums=finalRack.filter(t=>t.t==="s"&&[1,2,3,4].includes(t.n)).length;
    const badNums=finalRack.filter(t=>t.t==="s"&&![1,2,3,4].includes(t.n)).length;
    // Honor groups — kongs and pungs are the backbone
    const wc={};finalRack.filter(t=>t.t==="w").forEach(t=>{wc[t.v]=(wc[t.v]||0)+1;});
    const dc={};finalRack.filter(t=>t.t==="d").forEach(t=>{dc[t.v]=(dc[t.v]||0)+1;});
    const windGroupScore=Object.values(wc).reduce((a,n)=>a+(n>=4?8:n>=3?6:n>=2?3:1),0);
    const dragonGroupScore=Object.values(dc).reduce((a,n)=>a+(n>=4?6:n>=3?4:n>=2?2:0),0);
    raw+=windGroupScore+dragonGroupScore;
    raw+=jk>=2?3:jk>=1?1:0;
    raw+=fl>=2?2:fl>=1?1:0;  // flowers in 2 hands
    raw+=validNums>=4?3:0;    // valid number kong bonus
    raw-=badNums*3;           // 5-9 tiles are poison

  } else if(sectionId==="aln"){
    // ALN — all 3 hands use kongs of ONE number. Flowers fill one hand (sextette).
    // Need 8-12 tiles of the same number (with joker help). Spreading = fatal.
    const nc={};finalRack.filter(t=>t.t==="s").forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
    const vals2=Object.values(nc);
    const mx=vals2.length?Math.max(...vals2):0;
    const spread=Object.keys(nc).length;
    raw+=mx>=8?22:mx>=6?17:mx>=5?13:mx>=4?9:mx>=3?5:mx*1;
    raw+=fl>=4?6:fl>=2?3:fl>=1?1:0; // flowers fill the sextette hand
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=finalRack.filter(t=>t.t==="d").length>=1?1:0; // dragons appear in 2/3 hands
    raw-=Math.max(0,spread-1)*5; // every extra distinct number is dilution

  } else if(sectionId==="q"){
    // Quints — 3 hands. 2 jokers minimum. Stack one tile type deep.
    // Hand 3 (11111 44444 DDDD) uses a dragon kong — dragons have minor value.
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}|${t.n}`;c[k]=(c[k]||0)+1;});
    const mx=Object.values(c).length?Math.max(...Object.values(c)):0;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    if(jk<2){raw=jk*3;}  // hard floor — quints without 2 jokers is nearly impossible
    else{
      raw+=jk>=3?14:12;  // 2 jokers = entry, 3 = great
      raw+=mx>=4?10:mx>=3?7:mx>=2?4:0;
      raw+=dragons>=3?2:0; // dragon kong in hand 3
      raw+=fl>=2?2:0;      // FF in hand 2
    }

  } else if(sectionId==="2026"){
    // 2026 — 4 hands. Count 2s, 6s, Soap, other dragons, winds (NEWS hand), flowers.
    const twos=finalRack.filter(t=>t.t==="s"&&t.n===2).length;
    const sixes=finalRack.filter(t=>t.t==="s"&&t.n===6).length;
    const soap=finalRack.filter(t=>t.t==="d"&&t.v==="Soap").length;
    const otherD=finalRack.filter(t=>t.t==="d"&&t.v!=="Soap").length;
    const winds=finalRack.filter(t=>t.t==="w").length;
    const offNums=finalRack.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length;
    // Group quality for 2s and 6s — kongs and pungs are used in all hands
    const twoGrp=twos>=4?10:twos>=3?7:twos>=2?4:twos*1;
    const sixGrp=sixes>=4?12:sixes>=3?8:sixes>=2?5:sixes*1;
    raw+=twoGrp+sixGrp;
    raw+=soap>=1?4:0;       // Soap = wild suit zero = critical
    raw+=otherD>=2?2:otherD>=1?1:0;
    raw+=winds>=3?2:0;      // NEWS hand needs all 4 winds
    raw+=fl>=1?2:0;         // flowers in 1 hand (FFF)
    raw+=jk>=2?3:jk>=1?1:0;
    raw-=offNums*3;

  } else if(sectionId==="2468"){
    // 2468 — 8 hands. 6 in 7/8, 2+8 in 7/8, 4 in 6/8. Flowers in 5/8. Dragons in 4/8.
    // E+W winds in 1 hand only. Last hand (FF 246 888 246 888) is concealed — pairs.
    const ec={};finalRack.filter(t=>t.t==="s"&&t.n%2===0).forEach(t=>{ec[t.n]=(ec[t.n]||0)+1;});
    const totalEvens=Object.values(ec).reduce((a,b)=>a+b,0);
    const distinctEvens=Object.keys(ec).length;
    const odds=finalRack.filter(t=>t.t==="s"&&t.n%2===1).length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    const ew=finalRack.filter(t=>t.t==="w"&&(t.v==="E"||t.v==="W")).length;
    const nsW=finalRack.filter(t=>t.t==="w"&&(t.v==="N"||t.v==="S")).length;
    // Group depth within even tiles
    const evenGroupScore=Object.values(ec).reduce((a,n)=>a+(n>=4?8:n>=3?5:n>=2?3:n>=1?1:0),0);
    // 6 anchor bonus
    const sixBonus=(ec[6]||0)>=2?4:(ec[6]||0)>=1?2:0;
    raw+=evenGroupScore+sixBonus;
    raw+=distinctEvens>=4?3:distinctEvens>=3?1:0; // more distinct values = more hand options
    raw+=fl>=2?3:fl>=1?1:0;    // flowers in 5/8 hands
    raw+=dragons>=2?2:dragons>=1?1:0;
    raw+=ew>=2?2:ew>=1?1:0;    // E+W valid in 1 hand
    raw+=jk>=2?3:jk>=1?1:0;
    raw-=odds*3+nsW*2;

  } else if(sectionId==="369"){
    // 369 — 6 hands. 6 in all 6. 3+9 in 5/6. Flowers in 3/6. Dragons in 2/6.
    // Last hand concealed. NEWS hand needs all 4 winds.
    const threes=finalRack.filter(t=>t.t==="s"&&t.n===3).length;
    const sixes=finalRack.filter(t=>t.t==="s"&&t.n===6).length;
    const nines=finalRack.filter(t=>t.t==="s"&&t.n===9).length;
    const offNums=finalRack.filter(t=>t.t==="s"&&![3,6,9].includes(t.n)).length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    const winds=finalRack.filter(t=>t.t==="w").length;
    // Group quality — kongs and pungs of 3/6/9
    const threeGrp=threes>=4?8:threes>=3?5:threes>=2?3:threes*1;
    const sixGrp=sixes>=4?10:sixes>=3?7:sixes>=2?4:sixes*1; // 6 = highest value
    const nineGrp=nines>=4?8:nines>=3?5:nines>=2?3:nines*1;
    raw+=threeGrp+sixGrp+nineGrp;
    raw+=fl>=2?3:fl>=1?1:0;
    raw+=dragons>=3?3:dragons>=1?1:0;
    raw+=winds>=3?2:0; // NEWS hand
    raw+=jk>=2?3:jk>=1?1:0;
    raw-=offNums*3;

  } else if(sectionId==="13579"){
    // 13579 — 9 hands. 5+3 in 9/9. N+S winds in 2/10. Flowers in 4/10. Dragons in 4/10.
    // 1, 7, 9 each appear in ~4/10 hands. E+W winds never used.
    const oc={};finalRack.filter(t=>t.t==="s"&&t.n%2===1).forEach(t=>{oc[t.n]=(oc[t.n]||0)+1;});
    const totalOdds=Object.values(oc).reduce((a,b)=>a+b,0);
    const distinctOdds=Object.keys(oc).length;
    const evens=finalRack.filter(t=>t.t==="s"&&t.n%2===0).length;
    const ns=finalRack.filter(t=>t.t==="w"&&(t.v==="N"||t.v==="S")).length;
    const ew=finalRack.filter(t=>t.t==="w"&&(t.v==="E"||t.v==="W")).length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    // Group depth in odd tiles — weight 5 and 3 higher (appear in 9/10 hands)
    const fiveGrp=(oc[5]||0)>=4?10:(oc[5]||0)>=3?7:(oc[5]||0)>=2?4:(oc[5]||0)*1;
    const threeGrp=(oc[3]||0)>=4?8:(oc[3]||0)>=3?6:(oc[3]||0)>=2?3:(oc[3]||0)*1;
    const otherOddGrp=Object.entries(oc).filter(([n])=>![3,5].includes(Number(n)))
      .reduce((a,[,n])=>a+(n>=4?6:n>=3?4:n>=2?2:n>=1?0.5:0),0);
    raw+=fiveGrp+threeGrp+Math.round(otherOddGrp);
    raw+=distinctOdds>=4?3:distinctOdds>=3?1:0;
    raw+=ns>=2?3:ns>=1?1:0;   // N+S winds valid in 2 hands
    raw+=fl>=2?2:fl>=1?1:0;   // flowers in 4/10 hands
    raw+=dragons>=3?2:dragons>=1?1:0;
    raw+=jk>=2?3:jk>=1?1:0;
    raw-=evens*3+ew*2;
  }

  raw=Math.max(0,Math.min(25,Math.round(raw)));
  return{tileStrengthScore:raw};
}

function iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId,chosenHandObj){
  if(!passedTilesByRound||passedTilesByRound.length===0)return{passQualityScore:10,passInsights:[]};

  // Hand-specific strong/weak tile definitions
  const isStrongTile=(t)=>{
    if(chosenHandObj){
      if(t.t==="j"&&!chosenHandObj.concealed)return true;
      if(t.t==="f"&&chosenHandObj.label.includes("F"))return true;
      if(t.t==="d"){const dl=chosenHandObj.label;return dl.includes("DDD")||dl.includes("DD")||dl.includes("Soap");}
      if(t.t==="w"){const wl=chosenHandObj.label;return wl.includes("N")||wl.includes("E")||wl.includes("W")||wl.includes("S")||wl.includes("NEWS");}
      if(t.t==="s"){
        const nums=[...new Set((chosenHandObj.label.match(/\d/g)||[]).map(Number).filter(n=>n>=1&&n<=9))];
        return nums.includes(t.n);
      }
      return false;
    }
    // Fallback to section meta
    const meta=SECTION_META[sectionId]||{};
    if(t.t==="j"&&sectionId!=="sp")return true;
    if(t.t==="f"&&meta.wantsFlowers)return true;
    if((meta.strongTypes||[]).includes(t.t))return true;
    if(t.t==="s"&&(meta.strongNums||[]).includes(t.n))return true;
    if(sectionId==="2026"&&t.t==="d"&&t.v==="Soap")return true;
    return false;
  };

  const isWeakTile=(t)=>{
    if(chosenHandObj){
      if(sectionId==="sp"&&t.t==="j")return true;
      if(chosenHandObj.concealed&&t.t==="j")return true;
      // A tile is weak if it doesn't appear in the hand at all
      if(t.t==="s"){
        const nums=[...new Set((chosenHandObj.label.match(/\d/g)||[]).map(Number).filter(n=>n>=1&&n<=9))];
        return !nums.includes(t.n);
      }
      if(t.t==="f"&&!chosenHandObj.label.includes("F"))return true;
      if(t.t==="w"){const wl=chosenHandObj.label;return!(wl.includes("N")||wl.includes("E")||wl.includes("W")||wl.includes("S")||wl.includes("NEWS"));}
      if(t.t==="d"){const dl=chosenHandObj.label;return!(dl.includes("DDD")||dl.includes("DD")||dl.includes("Soap"));}
      return false;
    }
    // Fallback to section meta
    const meta=SECTION_META[sectionId]||{};
    if(sectionId==="sp"&&t.t==="j")return true;
    if((meta.weakTypes||[]).includes(t.t)&&t.t!=="j")return true;
    if(t.t==="s"&&(meta.weakNums||[]).includes(t.n))return true;
    if(sectionId==="wd"&&t.t==="s"&&![1,2,3,4].includes(t.n))return true;
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

function iqTiming(totalTime,roundCount,passLog){
  // Use per-pass times if available, otherwise fall back to total/count average
  const passTimes=(passLog||[]).map(p=>p.secs).filter(s=>typeof s==="number"&&s>0);
  const rc=Math.max(roundCount,1);
  const avg=passTimes.length>0
    ?passTimes.reduce((a,b)=>a+b,0)/passTimes.length
    :totalTime/rc;

  // Per-pass analysis when we have the data
  const slowPasses=passTimes.filter(s=>s>35).length;
  const fastPasses=passTimes.filter(s=>s<6).length;
  const goodPasses=passTimes.filter(s=>s>=10&&s<=25).length;
  const hasMixedBag=slowPasses>0&&fastPasses>0;

  let timingScore,timingInsight;

  // Real-world average decision time in a Charleston: 16.7s per pass.
  // Sweet spot: 10–25s per pass. Below 6s = reflexive. Above 35s = second-guessing.
  const slowPasses_=passTimes.filter(s=>s>35).length;
  const fastPasses_=passTimes.filter(s=>s<6).length;
  if(avg>=10&&avg<=25){
    timingScore=10;
    if(hasMixedBag){
      timingInsight=`Good overall pace (avg ${Math.round(avg)}s). ${slowPasses_} pass${slowPasses_>1?"es were":"was"} slow — trust your first read on those.`;
    } else {
      timingInsight=`Excellent pace — avg ${Math.round(avg)}s per pass. Deliberate without second-guessing. Right in the zone.`;
    }
  } else if(avg>25&&avg<=35){
    timingScore=8;
    if(slowPasses_>=2){
      timingInsight=`${slowPasses_} passes took over 35s — once you see a clear discard, commit to it.`;
    } else {
      timingInsight=`A touch deliberate (avg ${Math.round(avg)}s), but not by much. Try committing to your section read by pass 1.`;
    }
  } else if(avg>35&&avg<=50){
    timingScore=6;
    timingInsight=slowPasses_>=2
      ?`${slowPasses_} passes took a long time. Name your target section before touching any tiles — it speeds up every decision after that.`
      :"Taking longer than ideal. Lock in your section before the first pass and the rest follows faster.";
  } else if(avg>50){
    timingScore=Math.max(2,Math.round(4-((avg-50)/25)));
    timingInsight="Very long pauses between passes. Commit to a section before you start — once you know what you're building, the right tiles become obvious.";
  } else if(avg>=6&&avg<10){
    timingScore=8;
    timingInsight=`Slightly quick (avg ${Math.round(avg)}s) — a few more seconds per pass lets you catch a better option before committing.`;
  } else if(avg>=3&&avg<6){
    timingScore=5;
    timingInsight=fastPasses_>=2
      ?`${fastPasses_} passes went very fast. Each one shapes your whole hand — give yourself at least 10 seconds.`
      :"Moving a bit fast. Give yourself a breath before each pass — your instincts are good, but a moment to confirm helps.";
  } else {
    timingScore=2;
    timingInsight="Passing reflexively — slow down and read the rack before each discard. Speed doesn't score points here.";
  }

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
    else levelExplanation="Good instincts overall, but rushing through passes meant you missed a couple of better options. Aim for around 15–20s per pass.";
  } else if(score>=60){
    level="Getting There";
    if(worst==="direction")levelExplanation="Your rack pulled in too many directions. Try naming your target section before you touch a single tile.";
    else if(worst==="passes")levelExplanation="You had the right tiles but passed too many of them away. Slow down and ask: does this tile connect to what I'm keeping?";
    else if(worst==="tiles")levelExplanation="The section was right but the tiles you held didn't support each other. Look for pairs and runs, not just individual tiles.";
    else levelExplanation="Moving too quickly through passes — real players take around 17s each round to properly read their rack.";
  } else {
    level="Keep Going, Rookie";
    if(worst==="direction")levelExplanation="No clear section emerged. Before your next game, pick one group of tiles and build everything around it.";
    else if(worst==="passes")levelExplanation="Several strong tiles left your hand that shouldn't have. Before passing, ask: is this tile useful to me or not?";
    else if(worst==="tiles")levelExplanation="Your final rack lacked structure. Aim to hold pairs or runs rather than isolated individual tiles.";
    else levelExplanation="Very fast passing left little time to read the rack. Slow down — each pass takes real players about 17 seconds on average.";
  }

  return{level,levelExplanation};
}

function iqDistanceToOptimal(finalRack,startingRack,passedTilesByRound,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const strongNums=meta.strongNums||[];
  const strongTypes=meta.strongTypes||[];

  // Section-aware strong tile check (mirrors isStrongTile in passQuality)
  const isStrong=(t)=>{
    if(t.t==="j"&&sectionId!=="sp")return true;
    if(t.t==="f"&&meta.wantsFlowers)return true;
    if(strongTypes.includes(t.t))return true;
    if(t.t==="s"&&strongNums.includes(t.n))return true;
    if(sectionId==="2026"&&t.t==="d"&&t.v==="Soap")return true;
    return false;
  };
  const isWeak=(t)=>{
    if(sectionId==="sp"&&t.t==="j")return true;
    if((meta.weakTypes||[]).includes(t.t)&&t.t!=="j")return true;
    if(t.t==="s"&&(meta.weakNums||[]).includes(t.n))return true;
    if(sectionId==="wd"&&t.t==="s"&&![1,2,3,4].includes(t.n))return true;
    return false;
  };

  // Missing strong tile types in final rack
  const missingStrongTiles=[];
  if(strongNums.length){
    strongNums.slice(0,3).forEach(n=>{
      if(!finalRack.some(t=>t.t==="s"&&t.n===n))missingStrongTiles.push(`${n} (any suit)`);
    });
  }
  if(strongTypes.length){
    strongTypes.forEach(ty=>{
      if(!finalRack.some(t=>t.t===ty))missingStrongTiles.push(ty==="w"?"Wind tile":"Dragon tile");
    });
  }
  // Section-specific missing tile checks
  if(sectionId==="2026"){
    if(!finalRack.some(t=>t.t==="s"&&t.n===6))missingStrongTiles.push("6 (any suit)");
    if(!finalRack.some(t=>t.t==="s"&&t.n===2))missingStrongTiles.push("2 (any suit)");
  }

  // Off-direction tiles in final rack
  const offDir=[];
  finalRack.forEach(t=>{if(isWeak(t))offDir.push(tLabel(t));});
  const offDirectionTiles=offDir.slice(0,5);

  // Key mistake round — which pass gave away the most useful tiles
  let keyMistakeRound=null;let worstAdj=-99;
  (passedTilesByRound||[]).forEach(p=>{
    const tiles=p.out||[];
    const strongPassed=tiles.filter(t=>isStrong(t)).length;
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

  // Depth gap for CR — window depth based
  let runGap=0;
  if(sectionId==="cr"){const ws=crWindowScore(finalRack);runGap=Math.max(0,Math.round(7-(ws.groupDepth||0)));}

  const distanceCount=Math.min(missingStrongTiles.length,3)+Math.min(offDirectionTiles.length,2)+runGap+brokenPairs.length;

  let explanation="Your final rack was well-optimised for your target direction.";
  if(runGap>4)explanation="Your number tiles didn't consolidate into groups — CR needs pungs and kongs within a 3–4 number window, not singles.";
  else if(runGap>0)explanation="You had the right number window but needed deeper groups — aim for pungs/kongs rather than singles.";
  else if(brokenPairs.length>0)explanation=`You broke ${brokenPairs.length} pair${brokenPairs.length>1?"s":""} (${brokenPairs.join(", ")}) during the Charleston.`;
  else if(missingStrongTiles.length>0)explanation=`Your rack was missing ${missingStrongTiles.slice(0,2).join(" and ")} — key tiles for this section.`;
  else if(offDirectionTiles.length>0)explanation=`${offDirectionTiles.length} off-direction tile${offDirectionTiles.length>1?"s":""} stayed in your rack.`;

  return{missingStrongTiles,offDirectionTiles,keyMistakeRound,brokenPairs,distanceCount,explanation};
}

function iqTileInsights(finalRack,startingRack,passedTilesByRound,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const strongNums=meta.strongNums||[];
  const strongTypes=meta.strongTypes||[];
  const weakNums=meta.weakNums||[];
  const weakTypes=meta.weakTypes||[];
  const allPassed=(passedTilesByRound||[]).flatMap(p=>p.out||[]);

  // Section-aware strong/weak (mirrors iqPassQuality logic)
  const isStrong=(t)=>{
    if(t.t==="j"&&sectionId!=="sp")return true;
    if(t.t==="f"&&meta.wantsFlowers)return true;
    if(strongTypes.includes(t.t))return true;
    if(t.t==="s"&&strongNums.includes(t.n))return true;
    if(sectionId==="2026"&&t.t==="d"&&t.v==="Soap")return true;
    return false;
  };
  const isWeak=(t)=>{
    if(sectionId==="sp"&&t.t==="j")return true;
    if(weakTypes.includes(t.t)&&t.t!=="j")return true;
    if(t.t==="s"&&weakNums.includes(t.n))return true;
    if(sectionId==="wd"&&t.t==="s"&&![1,2,3,4].includes(t.n))return true;
    return false;
  };

  const protectedTiles=finalRack.filter(t=>isStrong(t)).map(t=>tLabel(t));
  const missedTiles=allPassed.filter(t=>isStrong(t)).map(t=>tLabel(t));
  const weakKept=finalRack.filter(t=>isWeak(t)).map(t=>tLabel(t));
  // Risky passed = jokers or flowers (when wanted) that left the rack
  const riskyPassed=allPassed.filter(t=>(t.t==="j"&&sectionId!=="sp")||(t.t==="f"&&meta.wantsFlowers)).map(t=>tLabel(t));

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
  if(sectionId==="cr"){const ws=crWindowScore(finalRack);if((ws.groupDepth||0)<5&&missedTiles.length>0)missedOpportunities.push("Passed tiles that could have deepened your number window groups");}
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
  // Section-specific pair feedback — in S&P, breaking triples into pairs is good
  if(brokenPairsCount>0&&sectionId!=="sp"){
    weaknesses.push(`Broke ${brokenPairsCount} pair${brokenPairsCount>1?"s":""} during the Charleston — protect your pairs.`);
  }
  if(timingScore<=5)weaknesses.push("Pace was off — aim for 10–25 seconds per pass. Either too fast (not enough analysis) or too slow (second-guessing a good first read).");

  const uniqueStr=[...new Set(strengths)].slice(0,2);
  const uniqueWk=[...new Set(weaknesses)].slice(0,2);

  let coachNote="";
  let tryNextTime="";

  // Section-specific coach notes
  if(sectionId==="sp"){
    if(directionScore<20&&passQualityScore<=12)coachNote="S&P is fully concealed — you can't expose tiles. Focus on building pairs and getting rid of jokers and triples early.";
    else if(passQualityScore<=12)coachNote="You were playing S&P, but passed tiles that would have been good pairs. For S&P: hold pairs, pass jokers, pass triples.";
    else if(directionScore<20)coachNote="Your rack had too many singles. S&P needs 6+ clean pairs to win — consolidate toward fewer, deeper pairs.";
    else coachNote="S&P is a discipline game. Keep holding pairs, keep releasing jokers, and you'll complete it.";
  } else if(sectionId==="q"){
    if(directionScore<20)coachNote="Quints without 2 jokers is nearly impossible. Identify joker count in deal — if you have fewer than 2, pivot immediately.";
    else coachNote="With 2 jokers, focus entirely on stacking 3-4 of one specific tile. Spread is your enemy in Quints.";
  } else if(sectionId==="cr"){
    if(directionScore<20)coachNote="Consecutive Run isn't about long strings of singles — it's pungs and kongs within a 3-4 number window. Identify your window by pass 1.";
    else if(tileStrengthScore<=10)coachNote="You had the right window, but not enough group depth. Pass tiles outside the window ruthlessly to deepen groups within it.";
    else coachNote="Good CR instincts. Next level: pick the tightest window possible (3-wide > 5-wide) for more hand options.";
  } else if(sectionId==="wd"){
    if(directionScore<20)coachNote="W&D needs 7+ honor tiles. Pass all number tiles in round 1 unless you have a complete kong of 1-4.";
    else coachNote="Winds are your backbone — 7 of 8 hands use them. Stack same-wind groups before dragons.";
  } else if(sectionId==="2026"){
    if(directionScore<20)coachNote="2026 needs both 2s and 6s — they appear in all 4 hands. Soap (White Dragon) is wild-suit zero. These three tiles are your filter.";
    else coachNote="Strong 2026 read. Soap (White Dragon) makes it easier — it plays as any suit, so hold it whenever you're building this section.";
  } else if(directionScore<20&&passQualityScore<=12){
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

  // Section-specific tryNextTime tips
  const secTips={
    "2026":"Hold every 2, 6, and Soap you see. In round 1, pass all odd numbers except via a Soap or Dragon connection.",
    "2468":"Pass odds immediately in round 1. Your 6s are the anchor — never pass a 6 in any round.",
    "369":"6 is in every 369 hand — never pass it. Round 1: pass everything except 3s, 6s, 9s, jokers, and flowers.",
    "13579":"5 and 3 appear in every 13579 hand — prioritize them above all other odds. Pass all even tiles in round 1 without hesitation.",
    "cr":"Identify your 3-4 number window by your first pass. Then pass every tile outside that window, even if it hurts.",
    "wd":"Pass every number tile round 1 unless you have 4 of one number (1-4 only). Winds first, then dragons.",
    "aln":"Pick your number immediately. Pass everything else — every round — until you have 8+ of that one number.",
    "q":"Count jokers first. If you have 2+, pick your target tile and stack it. If fewer than 2, pivot to another section.",
    "sp":"Pass jokers immediately — they're worthless here. Hold every pair. Break no pairs to chase anything.",
  };
  const scores=[
    {name:"direction",ratio:directionScore/40,tip:secTips[sectionId]||"Before your first pass, identify the section your rack most favors. Everything else follows from that read."},
    {name:"tiles",ratio:tileStrengthScore/25,tip:"Before passing any tile, ask: does it support my main group, a pair, or a window? If no to all three, it goes."},
    {name:"passes",ratio:passQualityScore/25,tip:"Before each pass, check: does this tile connect to anything I'm keeping? Tiles that connect to nothing are the ones to pass."},
    {name:"timing",ratio:timingScore/10,tip:"Aim for 10–25 seconds per pass — the real-world average is about 17s. Enough to read the rack without second-guessing your first instinct."},
  ];
  const worst=scores.sort((a,b)=>a.ratio-b.ratio)[0];
  tryNextTime=worst.tip;

  return{strengths:uniqueStr,weaknesses:uniqueWk,coachNote,tryNextTime};
}

function calculateCharlestonIQ(gameState,puzzleId,isDaily,dayNum){
  const{startingRack,finalRack,passedTilesByRound,totalTime,sectionId,chosenHand}=gameState;
  if(!startingRack||!finalRack||!sectionId)return null;

  // Resolve the specific chosen hand from the catalog
  const chosenHandObj=chosenHand
    ?HAND_CATALOG.find(h=>h.sec===sectionId&&h.label===chosenHand)
    :null;

  const roundCount=Math.max((passedTilesByRound||[]).length,1);

  // ── DIRECTION SCORE: now based on fit against the specific hand ──────────────
  let{directionScore,directionExplanation}=iqDirection(finalRack,sectionId,chosenHandObj);

  // ── TILE STRENGTH: also hand-aware ───────────────────────────────────────────
  let{tileStrengthScore}=iqTileStrength(finalRack,sectionId,chosenHandObj);

  // ── PASS QUALITY: hand-aware strong/weak tile determination ──────────────────
  const{passQualityScore,passInsights,brokenPairsCount}=iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId,chosenHandObj);
  const{timingScore,timingInsight}=iqTiming(totalTime||0,roundCount,passedTilesByRound);

  // ── DEAL QUALITY FLOOR ──────────────────────────────────────────────────────
  // Use hand-specific tile value if we have a chosen hand, else fall back to section meta
  const isStrongForHand=(t)=>{
    if(chosenHandObj){
      // A tile is strong for this hand if it appears in the hand label or is a structural support tile
      if(t.t==="j"&&!chosenHandObj.concealed)return true;
      if(t.t==="f"&&chosenHandObj.label.includes("F"))return true;
      if(t.t==="d"&&chosenHandObj.label.match(/D{2,}|Soap/))return true;
      if(t.t==="w"&&chosenHandObj.label.match(/[NESW]{2,}|NEWS/))return true;
      if(t.t==="s"){
        const nums=[...new Set((chosenHandObj.label.match(/\d/g)||[]).map(Number).filter(n=>n>=1&&n<=9))];
        return nums.includes(t.n);
      }
      return false;
    }
    // Fallback to section meta
    const meta=SECTION_META[sectionId]||{};
    if(t.t==="j"&&sectionId!=="sp")return true;
    if(t.t==="f"&&meta.wantsFlowers)return true;
    if((meta.strongTypes||[]).includes(t.t))return true;
    if(t.t==="s"&&(meta.strongNums||[]).includes(t.n))return true;
    if(sectionId==="2026"&&t.t==="d"&&t.v==="Soap")return true;
    return false;
  };

  const dealStrong=startingRack.filter(t=>isStrongForHand(t)).length;
  const finalStrong=finalRack.filter(t=>isStrongForHand(t)).length;
  const retentionRate=dealStrong>0?finalStrong/dealStrong:0;
  if(retentionRate>=0.85&&dealStrong>=5){
    directionScore=Math.min(40,directionScore+2);
    tileStrengthScore=Math.min(25,tileStrengthScore+(tileStrengthScore<20?3:0));
  } else if(retentionRate>=0.7&&dealStrong>=5){
    directionScore=Math.min(40,directionScore+1);
  }
  if(dealStrong<=2){
    directionScore=Math.max(directionScore,16);
    tileStrengthScore=Math.max(tileStrengthScore,10);
  }

  // ── SECTION DOMINANCE BONUS ─────────────────────────────────────────────────
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
  const shareText=isDaily
    ?`🀄 Daily Rackle #${dn} · IQ ${totalScore} · ${level}\n${passEmoji?`Passes: ${passEmoji}\n`:""}Think you can beat it?\nplayrackle.com`
    :`🀄 Rackle Practice · IQ ${totalScore} · ${level}\n${passEmoji?`Passes: ${passEmoji}\n`:""}Play the daily Charleston challenge!\nplayrackle.com`;

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
  {days:3,badge:"⚡",title:"Sparked",desc:"3-day streak"},
  {days:5,badge:"🎲",title:"Feeling Lucky",desc:"5-day streak"},
  {days:7,badge:"🎯",title:"Week Warrior",desc:"7-day streak"},
  {days:9,badge:"🌱",title:"Taking Root",desc:"9-day streak"},
  {days:11,badge:"🎸",title:"On A Roll",desc:"11-day streak"},
  {days:14,badge:"🧠",title:"Sharp Mind",desc:"14-day streak"},
  {days:16,badge:"🏄",title:"Riding It",desc:"16-day streak"},
  {days:18,badge:"🎪",title:"Show Off",desc:"18-day streak"},
  {days:21,badge:"🌙",title:"Three Weeks",desc:"21-day streak"},
  {days:23,badge:"🦊",title:"Sly & Consistent",desc:"23-day streak"},
  {days:25,badge:"🎖️",title:"Quarter Century",desc:"25-day streak"},
  {days:27,badge:"🧩",title:"Piece By Piece",desc:"27-day streak"},
  {days:30,badge:"💎",title:"Monthly Master",desc:"30-day streak"},
  {days:32,badge:"🚀",title:"Into Orbit",desc:"32-day streak"},
  {days:35,badge:"🦋",title:"Transformed",desc:"35-day streak"},
  {days:37,badge:"🎻",title:"Finding Your Rhythm",desc:"37-day streak"},
  {days:40,badge:"🦅",title:"Soaring",desc:"40-day streak"},
  {days:42,badge:"🧲",title:"Magnetic",desc:"42-day streak"},
  {days:45,badge:"🌊",title:"In The Flow",desc:"45-day streak"},
  {days:47,badge:"🎠",title:"Keep Spinning",desc:"47-day streak"},
  {days:50,badge:"🌟",title:"Half Century",desc:"50-day streak"},
  {days:52,badge:"🦁",title:"Lionheart",desc:"52-day streak"},
  {days:55,badge:"🔭",title:"Long View",desc:"55-day streak"},
  {days:57,badge:"🎋",title:"Deeply Rooted",desc:"57-day streak"},
  {days:60,badge:"🏯",title:"The Regular",desc:"60-day streak"},
  {days:62,badge:"🌺",title:"In Full Bloom",desc:"62-day streak"},
  {days:65,badge:"🎩",title:"Class Act",desc:"65-day streak"},
  {days:67,badge:"🦚",title:"Peacock Energy",desc:"67-day streak"},
  {days:70,badge:"🎖️",title:"Decorated",desc:"70-day streak"},
  {days:72,badge:"🧊",title:"Ice Cold",desc:"72-day streak"},
  {days:75,badge:"🏹",title:"Dead Accurate",desc:"75-day streak"},
  {days:77,badge:"🎆",title:"Making A Scene",desc:"77-day streak"},
  {days:80,badge:"🔮",title:"Tile Whisperer",desc:"80-day streak"},
  {days:82,badge:"🦉",title:"Wise One",desc:"82-day streak"},
  {days:85,badge:"⚓",title:"Anchored",desc:"85-day streak"},
  {days:87,badge:"🎑",title:"Serene",desc:"87-day streak"},
  {days:90,badge:"🧬",title:"In The DNA",desc:"90-day streak"},
  {days:92,badge:"🌍",title:"World Class",desc:"92-day streak"},
  {days:95,badge:"🏔️",title:"Summit Seeker",desc:"95-day streak"},
  {days:97,badge:"🎇",title:"Blazing",desc:"97-day streak"},
  {days:100,badge:"🏆",title:"Century",desc:"100-day streak"},
  {days:105,badge:"🦄",title:"Mythical",desc:"105-day streak"},
  {days:110,badge:"🌠",title:"Shooting Star",desc:"110-day streak"},
  {days:115,badge:"🎭",title:"Dedicated",desc:"115-day streak"},
  {days:120,badge:"🧿",title:"Untouchable",desc:"120-day streak"},
  {days:125,badge:"🦋",title:"Fully Emerged",desc:"125-day streak"},
  {days:130,badge:"🌋",title:"Unstoppable Force",desc:"130-day streak"},
  {days:135,badge:"🎪",title:"Main Event",desc:"135-day streak"},
  {days:140,badge:"🔱",title:"Elite",desc:"140-day streak"},
  {days:145,badge:"🌌",title:"Otherworldly",desc:"145-day streak"},
  {days:150,badge:"👑",title:"Royalty",desc:"150-day streak"},
  {days:155,badge:"🏛️",title:"Institution",desc:"155-day streak"},
  {days:160,badge:"⚜️",title:"Distinguished",desc:"160-day streak"},
  {days:165,badge:"🌈",title:"Legendary",desc:"165-day streak"},
  {days:170,badge:"🎰",title:"All In",desc:"170-day streak"},
  {days:175,badge:"🧙",title:"Tile Wizard",desc:"175-day streak"},
  {days:180,badge:"🌞",title:"Six Months",desc:"180-day streak"},
  {days:185,badge:"💫",title:"Radiant",desc:"185-day streak"},
  {days:190,badge:"🔥",title:"Inferno",desc:"190-day streak"},
  {days:195,badge:"🫀",title:"Heartbeat",desc:"195-day streak"},
  {days:200,badge:"🐐",title:"Greatest",desc:"200-day streak"},
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
        <RackleHeader onBack={hasProfile?()=>setMode("view"):home} setScreen={setScreen}/>
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
        <RackleHeader onBack={home} setScreen={setScreen}/>
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
        <RackleHeader onBack={home} setScreen={setScreen}/>
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
          <button onClick={()=>{setStoredHash(null);setProfile(null);setProfileState({nickname:"",clubCode:"",avatarUrl:"",email:""});ST.set("clubName",null);ST.set("clubCode",null);setMode("setup");setPwInput("");}} style={{fontSize:11,color:C.mut,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Forgot password? Reset profile</button>
        </div>
        <Footer/>
      </div>
    );
  }

  // ── VIEW PROFILE ───────────────────────────────────────────────────────────
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
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
        :<div style={{width:22,height:22,borderRadius:11,background:C.jade+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.jade,flexShrink:0}}>{(profile.nickname||"?").charAt(0).toUpperCase()}</div>
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

// Fetch global daily stats — total unique players + avg IQ across all clubs today
// Reuses fetchGlobalEntries to guarantee the count matches the global leaderboard exactly
async function fetchDailyStats(){
  try{
    const entries=await fetchGlobalEntries();
    if(!entries.length)return null;
    const scores=entries.map(e=>e.iqScore);
    const total=scores.length;
    const avg=Math.round(scores.reduce((s,v)=>s+v,0)/total);
    const max=Math.max(...scores);
    return{total,avg,max};
  }catch{return null;}
}

// Generate a stable anonymous player name for users without accounts
function getOrCreateAnonymousName(){
  let n=ST.get("anonName",null);
  if(!n){
    const num=100+Math.floor(Math.random()*900);
    n=`Player ${num}`;
    ST.set("anonName",n);
  }
  return n;
}

// Post to global leaderboard table (no club filter)
async function upsertGlobalEntry(name,iqScore,time,streak,clubCode){
  // Uses the existing `leaderboard` table — same table as club leaderboards.
  // club_code stores the player's actual club (or null). Queried globally by omitting club_code filter.
  // Deduplication key: name + day_seed (same as club LB).
  try{
    const daySeed=getDailySeed();
    // If player has a club, their score is already submitted via upsertLBEntry.
    // For players without a club, write a global-only entry with club_code=null.
    if(clubCode){
      // Already submitted to club table — no duplicate needed.
      return true;
    }
    const res=await fetch(`${SB_URL}/rest/v1/leaderboard`,{
      method:"POST",
      headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates"},
      body:JSON.stringify({
        club_code:"__global__",
        day_seed:daySeed,
        name,iq_score:iqScore,time_secs:time||0,streak:streak||0,
        updated_at:new Date().toISOString(),
      }),
    });
    if(!res.ok&&res.status!==201&&res.status!==204){
      res.text().then(t=>console.warn("Global LB upsert failed:",res.status,t));
      return false;
    }
    return true;
  }catch(err){
    console.warn("Global LB upsert error:",err);
    return false;
  }
}

// Fetch global leaderboard — all scores today from the leaderboard table, no club filter
async function fetchGlobalEntries(){
  try{
    const seed=getDailySeed();
    // Query the main leaderboard table without club_code filter to get everyone.
    // Deduplicate by name (take highest score per name) since players may appear
    // in both their club row and a __global__ row.
    const url=`${SB_URL}/rest/v1/leaderboard?day_seed=eq.${seed}&order=iq_score.desc&limit=200`;
    const res=await fetch(url,{headers:SB_HEADERS});
    if(!res.ok){
      const errText=await res.text();
      console.warn("[GlobalLB] fetch failed:",res.status,errText);
      return[];
    }
    const rows=await res.json();
    // Deduplicate by name — keep highest score
    const seen={};
    const deduped=[];
    rows.forEach(r=>{
      const key=r.name.toLowerCase();
      if(!seen[key]||r.iq_score>seen[key]){
        seen[key]=r.iq_score;
        // Remove previous entry for this name and add new one
        const idx=deduped.findIndex(e=>e.name.toLowerCase()===key);
        if(idx>=0)deduped.splice(idx,1);
        deduped.push(r);
      }
    });
    // Re-sort after dedup
    deduped.sort((a,b)=>b.iq_score-a.iq_score);
    return deduped.map(r=>({name:r.name,iqScore:r.iq_score,time:r.time_secs,streak:r.streak,clubCode:r.club_code==="__global__"?null:r.club_code}));
  }catch(err){
    console.warn("[GlobalLB] fetch error:",err);
    return[];
  }
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
function IQHero({iq,isDaily,dayNum,section,totalTime,chosenSec,allSections}){
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
          {(()=>{
            // Determine if the player's chosen section was the best fit
            const bestFitId=allSections?[...allSections].sort((a,b)=>b.score-a.score)[0]?.id:null;
            const matched=chosenSec&&bestFitId&&chosenSec===bestFitId;
            const hasChoice=!!chosenSec&&!!bestFitId;
            return(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{section}</div>
                {hasChoice&&<span style={{fontSize:11,fontWeight:800,color:matched?"#6EE7A0":"#F87171",lineHeight:1}}>{matched?"✓":"✗"}</span>}
              </div>
            );
          })()}
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
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:titleColor,lineHeight:1.2}}>{copied?"Copied to clipboard!":label||"Challenge Your Club"}</div>
          <div style={{fontSize:11,color:subColor,lineHeight:1.3}}>{copied?"Paste it into your group chat":sublabel||"Tap to copy · drop it in your group chat"}</div>
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

// ─── SPECIFIC HAND RECOMMENDER CARD ─────────────────────────────────────────
function SpecificHandCard({finalRack,sectionId,defaultOpen=false,label:overrideLabel,pinnedHandLabel}){
  const [open,setOpen]=useState(defaultOpen);
  if(!finalRack||!sectionId)return null;
  // Get all scored hands for section, sorted by fit
  const allHands=HAND_CATALOG.filter(h=>h.sec===sectionId)
    .map(h=>({...h,fit:h.fit(finalRack)}))
    .sort((a,b)=>b.fit-a.fit);
  // If a pinned hand is specified, put it first
  let hands=allHands;
  if(pinnedHandLabel){
    const pinned=allHands.find(h=>h.label===pinnedHandLabel);
    const rest=allHands.filter(h=>h.label!==pinnedHandLabel).filter(h=>h.fit>0.05).slice(0,2);
    hands=pinned?[pinned,...rest]:allHands.slice(0,3).filter(h=>h.fit>0.05);
  } else {
    hands=allHands.slice(0,3).filter(h=>h.fit>0.05);
  }
  if(!hands||hands.length===0)return null;
  const sec=SECS.find(s=>s.id===sectionId);
  const fam=getHandFamily(sectionId);
  const hColor=fam?fam.color:(sec?.color||C.jade);
  const hBg=fam?fam.bg:(sec?.color+"08"||C.jade+"08");
  const hBorder=fam?fam.border:(sec?.color+"40"||C.jade+"40");
  const hEmoji=fam?fam.emoji:(sec?.icon||"🀄");
  const hLabel=fam?fam.label:(sec?.name||"Hand Targets");
  const hDesc=fam?fam.desc:"";

  return(
    <div style={{...S.card,marginBottom:8,padding:0,overflow:"hidden",borderColor:hBorder}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 14px",background:hBg,border:"none",cursor:"pointer",textAlign:"left",borderBottom:open?`1px solid ${hBorder}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>{hEmoji}</span>
          <div>
            <div style={{fontSize:8,color:hColor,letterSpacing:2,fontWeight:700,marginBottom:2}}>HAND TARGETS · 2026 NMJL</div>
            <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:hColor,lineHeight:1.2}}>{overrideLabel||hLabel}</div>
            {hDesc&&<div style={{fontSize:11,color:hColor,opacity:0.7,lineHeight:1.3,marginTop:1}}>{hDesc}</div>}
          </div>
        </div>
        <span style={{fontSize:12,color:hColor,flexShrink:0,opacity:0.7}}>{open?"▾":"▸"}</span>
      </button>

      {open&&<div className="rk-in">
        {hands.map((hand,i)=>{
          const pct=Math.round(hand.fit*100);
          const barColor=pct>=70?C.jade:pct>=45?C.gold:C.cinn;
          const verdict=pct>=80?"Very close — you could win this hand":pct>=60?"Good foundation — a few key tiles away":pct>=40?"Partial fit — possible with better passing":"Low fit — this hand needed different tiles";
          const verdictColor=pct>=80?C.jade:pct>=60?C.gold:pct>=40?C.amberB:C.cinn;

          // Tile analysis
          const jk=jokers(finalRack);
          const fl=flowers(finalRack);
          const numCounts={};
          finalRack.filter(t=>t.t==="s").forEach(t=>{numCounts[t.n]=(numCounts[t.n]||0)+1;});
          const wCounts={};finalRack.filter(t=>t.t==="w").forEach(t=>{wCounts[t.v]=(wCounts[t.v]||0)+1;});
          const dCounts={};finalRack.filter(t=>t.t==="d").forEach(t=>{dCounts[t.v]=(dCounts[t.v]||0)+1;});
          const label=hand.label;
          const numRefs=[...new Set((label.match(/\d+/g)||[]).map(Number).filter(n=>n>=1&&n<=9))];
          const strengths=[];const gaps=[];

          if(jk>=2&&!hand.concealed)strengths.push(`${jk} jokers — can fill any gap`);
          else if(jk===1&&!hand.concealed)strengths.push(`1 joker — use it on your weakest group`);
          if(hand.concealed&&jk>0)gaps.push(`Concealed hand — jokers can't be used`);

          numRefs.forEach(n=>{
            const have=numCounts[n]||0;
            const appearances=(label.match(new RegExp(n,'g'))||[]).length;
            const approxNeed=Math.min(appearances,4);
            if(have>=approxNeed&&have>=2)strengths.push(`${have}× ${n} ✓`);
            else if(have>0&&have<approxNeed)gaps.push(`Need ${approxNeed-have} more ${n}s (have ${have})`);
            else if(have===0&&approxNeed>=2)gaps.push(`Missing ${n}s — critical for this hand`);
          });
          if(label.includes("NEWS")||label.match(/[NEWS]{2,}/)){
            const w=Object.values(wCounts).reduce((a,b)=>a+b,0);
            if(w>=4)strengths.push(`${w} winds ✓`);
            else gaps.push(`Need ${4-w} more winds`);
          }
          if(label.includes("DDD")||label.includes("DDDD")){
            const d=Object.values(dCounts).reduce((a,b)=>a+b,0);
            const need=label.includes("DDDD")?4:3;
            if(d>=need)strengths.push(`${d} dragons ✓`);
            else gaps.push(`Need ${need-d} more dragons (have ${d})`);
          }
          if(label.includes("FFF")||label.includes("FFFFFF")){
            const need=label.includes("FFFFFF")?6:3;
            if(fl>=need)strengths.push(`${fl} flowers ✓`);
            else gaps.push(`Need ${need-fl} more flowers (have ${fl})`);
          }
          if(label.includes("FF")&&!label.includes("FFF")){
            if(fl>=2)strengths.push(`${fl} flowers ✓`);
            else gaps.push(`Need ${2-fl} more flower${fl===1?"":"s"}`);
          }

          // Tiles still needed count
          const tilesNeeded=gaps.length;
          const passAdvice=pct>=70
            ?"Hold everything — this rack is nearly there."
            :gaps.length>0
            ?`Pass tiles not in this hand. Priority: keep ${strengths.length>0?strengths[0].split(" ✓")[0]:"your strongest groups"}.`
            :"Focus on protecting your existing groups.";

          return(
            <div key={i} style={{padding:"14px 14px",borderBottom:i<hands.length-1?`1px solid ${C.bdr}`:"none"}}>
              {/* Hand label + fit score */}
              <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                    <span style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,letterSpacing:0.3}}>{label}</span>
                    {pinnedHandLabel&&hand.label===pinnedHandLabel&&<span style={{fontSize:9,fontWeight:700,background:C.jade+"20",color:C.jade,borderRadius:10,padding:"2px 7px",letterSpacing:0.5}}>YOUR HAND</span>}
                    {hand.concealed&&<span style={{fontSize:9,fontWeight:700,background:"#2460A820",color:"#2460A8",borderRadius:10,padding:"2px 7px",letterSpacing:0.5}}>CONCEALED</span>}
                    <span style={{fontSize:9,fontWeight:700,background:"#00000009",color:C.mut,borderRadius:10,padding:"2px 7px"}}>×{hand.value}</span>
                  </div>
                  <div style={{fontSize:11,color:verdictColor,fontWeight:600}}>{verdict}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:barColor,lineHeight:1}}>{pct}<span style={{fontSize:10,fontWeight:400,color:C.mut}}>%</span></div>
                  <div style={{fontSize:9,color:C.mut}}>rack fit</div>
                </div>
              </div>

              {/* Fit bar */}
              <div style={{height:5,borderRadius:3,background:C.bdr,overflow:"hidden",marginBottom:12}}>
                <div className="rk-bar" style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${barColor},${barColor}CC)`,width:`${pct}%`,"--w":`${pct}%`}}/>
              </div>

              {/* Have / Need panels */}
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {strengths.length>0&&<div style={{flex:1,background:C.sage,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.sageB}20`}}>
                  <div style={{fontSize:8,color:C.sageB,fontWeight:700,letterSpacing:1,marginBottom:5}}>YOU HAVE ✓</div>
                  {strengths.slice(0,4).map((s,i)=><div key={i} style={{fontSize:10,color:C.ink,lineHeight:1.6}}>✓ {s}</div>)}
                </div>}
                {gaps.length>0&&<div style={{flex:1,background:"#FEF0E8",borderRadius:8,padding:"8px 10px",border:"1px solid rgba(138,64,16,0.12)"}}>
                  <div style={{fontSize:8,color:"#8A4010",fontWeight:700,letterSpacing:1,marginBottom:5}}>STILL NEED →</div>
                  {gaps.slice(0,4).map((g,i)=><div key={i} style={{fontSize:10,color:"#5C2808",lineHeight:1.6}}>→ {g}</div>)}
                </div>}
              </div>

            </div>
          );
        })}
      </div>}
    </div>
  );
}

// ─── SORTABLE RACK — final rack display with sort button ──────────────────────
function SortableRack({hand:initialHand}){
  const [rack,setRack]=useState(initialHand);
  const [sorted,setSorted]=useState(false);
  const toggle=()=>{
    if(sorted){setRack(initialHand);setSorted(false);}
    else{setRack(sortHand(initialHand));setSorted(true);}
  };
  return(
    <div style={{...S.card,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>FINAL RACK</div>
        <button onClick={toggle} style={{...S.sortBtn,color:sorted?C.jade:C.mut,borderColor:sorted?C.jade+"40":C.bdr,background:sorted?C.jade+"08":"none"}}>{sorted?"Sorted":"Sort"}</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{rack.map((t,i)=><Ti key={i} t={t}/>)}</div>
    </div>
  );
}

// ─── DAILY SCORECARD — simplified, no tabs, no coach note ─────────────────────
function DailyIQScorecard({iq,hand,passLog,dayNum,section,chosenSec,allSections,onHome,onPractice,onCoachMode}){
  const [passOpen,setPassOpen]=useState(false);
  const [dailyStats,setDailyStats]=useState(null);
  if(!iq)return null;
  const passEmoji=(iq.passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");
  const shareText=`🀄 Daily Rackle #${dayNum} · IQ ${iq.totalScore} · ${iq.level}\n${passEmoji?`Passes: ${passEmoji}\n`:""}Think you can beat it?\nplayrackle.com`;
  useEffect(()=>{fetchDailyStats().then(s=>{
    if(s&&s.total>=1){
      setDailyStats(s);
    }
  });},[]);

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
      tips.push(`⏱ You passed very quickly (avg ${Math.round((iq.totalTime||0)/Math.max((passLog||[]).length,1))}s per pass). Give yourself at least 7s to read the rack before each pass.`);
    } else if(iq.timingScore>=9){
      tips.push(`⏱ Excellent pace — ${Math.round((iq.totalTime||0)/Math.max((passLog||[]).length,1))}s per pass average. That's the sweet spot.`);
    }
    return tips.slice(0,3);
  })();
  return(
    <div>
      <div style={{marginBottom:10}}><IQHero iq={iq} isDaily dayNum={dayNum} section={section} totalTime={iq.totalTime||0} chosenSec={chosenSec} allSections={allSections}/></div>

      <div style={{...S.card,marginBottom:8}}>
        <div style={{fontFamily:"monospace",fontSize:10,color:C.mut,background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center",borderBottom:`1px solid ${C.bdr}`}}>
          {shareText.split("\n").map((line,i)=>line===""?<div key={i} style={{height:8}}/>:<div key={i} style={{lineHeight:1.9}}>{line}</div>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <ShareButton text={shareText}/>
        </div>
      </div>

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

      {hand&&hand.length>0&&<SortableRack hand={hand}/>}

      {/* COACH MODE BUTTON */}
      {onCoachMode&&<button onClick={onCoachMode} style={{width:"100%",borderRadius:14,background:`linear-gradient(135deg,#1E3A5F08,#152A4508)`,border:`1.5px solid #1E3A5F25`,cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",marginBottom:8,textAlign:"left"}}>
        <div style={{width:40,height:40,borderRadius:11,background:"#1E3A5F15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🎓</div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
          <div style={{fontSize:8,color:"#1E3A5F",letterSpacing:2,fontWeight:700}}>FULL BREAKDOWN</div>
          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.ink,lineHeight:1.3}}>Coach Mode</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>Section read · Hand targets · Score breakdown · Pass analysis</div>
        </div>
        <span style={{fontSize:14,color:C.mut,fontWeight:700,flexShrink:0}}>›</span>
      </button>}

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

      <button onClick={onHome} style={{...S.oBtn,width:"100%"}}>← Home</button>
    </div>
  );
}

// ─── PRACTICE SCORECARD — full tabbed ─────────────────────────────────────────
function PracticeIQScorecard({iq,hand,passLog,section,chosenSec,allSections,onHome,onDealAgain}){
  const [tab,setTab]=useState(0);
  const [sfOpen,setSfOpen]=useState(false);
  if(!iq)return null;
  const passEmoji=(iq.passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");
  const freshShareText=`🀄 Rackle Practice · IQ ${iq.totalScore} · ${iq.level}\n${passEmoji?`Passes: ${passEmoji}\n`:""}Play the daily Charleston challenge!\nplayrackle.com`;
  const dist=iq.distanceToOptimal||{};
  const tins=iq.tileInsights||{};

  const tabs=["Overview","Passes","Tiles"];
  return(
    <div>
      <div style={{marginBottom:10}}><IQHero iq={iq} isDaily={false} section={section} totalTime={iq.totalTime||0} chosenSec={chosenSec} allSections={allSections}/></div>
      <div style={{display:"flex",gap:4,marginBottom:12,background:C.bg2,borderRadius:10,padding:3}}>
        {tabs.map((t,i)=>(<button key={i} onClick={()=>setTab(i)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:tab===i?"#fff":"transparent",color:tab===i?C.ink:C.mut,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:tab===i?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{t}</button>))}
      </div>

      {/* TAB 0 — OVERVIEW */}
      {tab===0&&<div className="rk-in">
        {/* Final Rack — shown first */}
        {hand&&hand.length>0&&<SortableRack hand={hand}/>}

        {/* Hand Targets */}
        {hand&&hand.length>0&&chosenSec&&<SpecificHandCard finalRack={hand} sectionId={chosenSec}/>}

        {/* Score bars */}
        <div style={{...S.card,marginBottom:8}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:14}}>SCORE BREAKDOWN</div>
          <ScoreBar label="Direction" score={iq.directionScore} max={40} note={iq.directionExplanation}/>
          <ScoreBar label="Tile Strength" score={iq.tileStrengthScore} max={25}/>
          <ScoreBar label="Pass Quality" score={iq.passQualityScore} max={25}/>
          <ScoreBar label="Timing" score={iq.timingScore} max={10} note={iq.timingInsight}/>
        </div>

        {/* Section comparison — collapsible */}
        {allSections&&allSections.length>0&&(()=>{
          const topSec=[...allSections].sort((a,b)=>b.score-a.score)[0];
          return(
            <div style={{...S.card,marginBottom:8,padding:0,overflow:"hidden"}}>
              <button onClick={()=>setSfOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 14px",background:"#fff",border:"none",cursor:"pointer",textAlign:"left",borderBottom:sfOpen?`1px solid ${C.bdr}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{topSec?.icon||"📊"}</span>
                  <div>
                    <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:2}}>SECTION FIT</div>
                    <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.ink,lineHeight:1.2}}>All sections ranked</div>
                  </div>
                </div>
                <span style={{fontSize:12,color:C.mut,flexShrink:0}}>{sfOpen?"▾":"▸"}</span>
              </button>
              {sfOpen&&<div style={{padding:"12px 14px"}} className="rk-in">
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
                          <div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:isChosen?C.jade:isTop&&!isChosen?C.gold:"#D5CFC5"}}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>}
            </div>
          );
        })()}

        {/* Share */}
        <div style={{...S.card,marginBottom:8}}>
          <div style={{fontFamily:"monospace",fontSize:10,color:C.mut,background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center",borderBottom:`1px solid ${C.bdr}`}}>
            {freshShareText.split("\n").map((line,i)=>line===""?<div key={i} style={{height:8}}/>:<div key={i} style={{lineHeight:1.9}}>{line}</div>)}
          </div>
          <ShareButton text={freshShareText}/>
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
          // Use pre-computed riskyPassed from tileInsights — already section-aware
          const riskyCount=(iq.tileInsights&&iq.tileInsights.riskyPassed)?iq.tileInsights.riskyPassed.length:allPassed.filter(t=>t.t==="j"||t.t==="f").length;
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
          // Section-aware: jokers are NOT risky in S&P; Soap IS risky in 2026
          const sid=section&&section.id?section.id:(chosenSec||"2026");
          const passedStrong=(p.passedTiles||[]).filter(t=>{
            if(t.t==="j"&&sid==="sp")return false; // jokers are weak/worthless in S&P
            if(t.t==="j")return true;
            if(t.t==="f")return true;
            if(sid==="2026"&&t.t==="d"&&t.v==="Soap")return true;
            return false;
          }).length;
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

        {/* Timing — moved here from Overview */}
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
        {hand&&<SortableRack hand={hand}/>}

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

// ─── COACH MODE SCREEN — deep analysis page ──────────────────────────────────
function CoachModeScreen({iq,hand,passLog,dayNum,section,chosenSec,chosenHand,allSections,onBack,setScreen}){
  const [passOpen,setPassOpen]=useState(false);
  const [sfOpen,setSfOpen]=useState(false);
  if(!iq)return null;

  const chosenSecObj=chosenSec&&SECS.find(s=>s.id===chosenSec);
  const chosenHandObj=chosenHand?HAND_CATALOG.find(h=>h.sec===chosenSec&&h.label===chosenHand):null;
  const sortedSecs=allSections?[...allSections].sort((a,b)=>b.score-a.score):[];
  const bestFitSec=sortedSecs[0];
  const chosenFit=chosenSec&&allSections?allSections.find(s=>s.id===chosenSec):null;
  const chosenPct=chosenFit?Math.round(chosenFit.score*100):null;
  const bestPct=bestFitSec?Math.round(bestFitSec.score*100):null;
  const sectionMatch=chosenSec===bestFitSec?.id;

  // Score bar colors
  const scoreColor=(v,max)=>v/max>=0.8?C.jade:v/max>=0.55?C.gold:C.cinn;

  return(
    <div style={S.pg} className="rk-pg">

      {/* Header */}
      <RackleHeader onBack={onBack} setScreen={setScreen}/>

      {/* Page title */}
      <div style={{marginBottom:16,marginTop:4,textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>Coach Mode</div>
        <div style={{fontSize:12,color:C.mut}}>Deep analysis of your Charleston · Day #{dayNum}</div>
      </div>

      {/* Final Rack */}
      {hand&&hand.length>0&&<SortableRack hand={hand}/>}

      {/* IQ at a glance — compact row */}
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[
          {label:"Direction",v:iq.directionScore,max:40},
          {label:"Tile Str.",v:iq.tileStrengthScore,max:25},
          {label:"Pass Qual.",v:iq.passQualityScore,max:25},
          {label:"Timing",v:iq.timingScore,max:10},
        ].map(({label,v,max})=>{
          const col=scoreColor(v,max);
          return(
            <div key={label} style={{flex:1,background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:17,fontWeight:900,color:col,lineHeight:1}}>{v}</div>
              <div style={{fontSize:7,color:C.mut,letterSpacing:1,fontWeight:700,marginTop:3,lineHeight:1.3}}>{label.toUpperCase()}</div>
              <div style={{fontSize:8,color:C.mut,opacity:0.6}}>/{max}</div>
            </div>
          );
        })}
      </div>

      {/* Direction note */}
      {iq.directionExplanation&&<div style={{fontSize:11,color:C.mut,lineHeight:1.55,background:C.bg2,borderRadius:10,padding:"9px 12px",marginBottom:10,borderLeft:`3px solid ${scoreColor(iq.directionScore,40)}`}}>{iq.directionExplanation}</div>}

      {/* Section + Hand Read */}
      {chosenSecObj&&<div style={{...S.card,marginBottom:10,padding:"12px 14px"}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>YOUR TARGET</div>
        {/* Chosen hand label */}
        {chosenHandObj&&<div style={{background:C.sage,borderRadius:10,padding:"10px 12px",marginBottom:8,border:`1px solid ${C.sageB}20`}}>
          <div style={{fontSize:8,color:C.sageB,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>CHOSEN HAND</div>
          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.ink,marginBottom:2}}>{chosenHandObj.label}</div>
          <div style={{fontSize:10,color:C.mut}}>{chosenHandObj.concealed?"Concealed · no jokers":"Open hand"} · {chosenHandObj.value} pts · {chosenSecObj.name}</div>
        </div>}
        <div style={{display:"flex",gap:8,marginBottom:sectionMatch?0:8}}>
          <div style={{flex:1,borderRadius:10,padding:"10px",background:sectionMatch?C.jade+"08":"#FFF0E8",border:`1.5px solid ${sectionMatch?C.jade+"30":"#C0602025"}`}}>
            <div style={{fontSize:8,color:sectionMatch?C.jade:"#8A3010",letterSpacing:1.5,fontWeight:700,marginBottom:4}}>YOU CHOSE</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:16}}>{chosenSecObj.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:C.ink}}>{chosenSecObj.name}</div>
                {chosenPct!=null&&<div style={{fontSize:10,color:C.mut}}>{chosenPct}% section fit</div>}
              </div>
            </div>
          </div>
          <div style={{flex:1,borderRadius:10,padding:"10px",background:sectionMatch?C.jade+"08":C.sage,border:`1.5px solid ${sectionMatch?C.jade+"30":C.sageB+"30"}`}}>
            <div style={{fontSize:8,color:sectionMatch?C.jade:C.sageB,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>{sectionMatch?"✓ BEST FIT":"BEST FIT WAS"}</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:16}}>{bestFitSec?.icon}</span>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:C.ink}}>{bestFitSec?.name}</div>
                {bestPct!=null&&<div style={{fontSize:10,color:C.mut}}>{bestPct}% section fit</div>}
              </div>
            </div>
          </div>
        </div>
        {!sectionMatch&&<div style={{fontSize:11,color:"#8A3010",lineHeight:1.55,background:"#FFF5F0",borderRadius:8,padding:"7px 10px"}}>💡 {bestFitSec?.icon} {bestFitSec?.name} was the stronger section fit. An earlier pivot could have scored higher.</div>}
      </div>}

      {/* Hand Targets — chosen hand pinned first, then alternatives */}
      {hand&&hand.length>0&&chosenSec&&(
        <SpecificHandCard finalRack={hand} sectionId={chosenSec} pinnedHandLabel={chosenHand} defaultOpen={true} label="Your Hand — Rack Analysis"/>
      )}

      {/* Hand Targets — best fit section (when different) */}
      {hand&&hand.length>0&&bestFitSec&&bestFitSec.id!==chosenSec&&(
        <SpecificHandCard finalRack={hand} sectionId={bestFitSec.id} defaultOpen={false} label={`${bestFitSec.name} — What Could Have Been`}/>
      )}

      {/* All sections — collapsed by default */}
      {allSections&&allSections.length>0&&(()=>{
        const topSec=[...allSections].sort((a,b)=>b.score-a.score)[0];
        return(
          <div style={{...S.card,marginBottom:10,padding:0,overflow:"hidden"}}>
            <button onClick={()=>setSfOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 14px",background:"#fff",border:"none",cursor:"pointer",textAlign:"left",borderBottom:sfOpen?`1px solid ${C.bdr}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{topSec?.icon||"📊"}</span>
                <div>
                  <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700}}>ALL SECTIONS RANKED</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.ink,marginTop:1}}>Section fit breakdown</div>
                </div>
              </div>
              <span style={{fontSize:12,color:C.mut}}>{sfOpen?"▾":"▸"}</span>
            </button>
            {sfOpen&&<div style={{padding:"10px 14px"}} className="rk-in">
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
                        <div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:isChosen?C.jade:isTop&&!isChosen?C.gold:"#D5CFC5"}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>}
          </div>
        );
      })()}

      {/* Pass Breakdown — collapsed */}
      {iq.passInsights&&iq.passInsights.length>0&&<div style={{...S.card,padding:0,overflow:"hidden",marginBottom:10}}>
        <button onClick={()=>setPassOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
          <div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700}}>PASS BREAKDOWN</div>
            <div style={{fontSize:12,fontWeight:700,color:C.ink,marginTop:1}}>Per-pass analysis</div>
          </div>
          <span style={{fontSize:12,color:C.mut}}>{passOpen?"▾":"▸"}</span>
        </button>
        {passOpen&&<div style={{borderTop:`1px solid ${C.bdr}`}} className="rk-in">
          {iq.passInsights.map((p,i)=>{
            const qBg={strong:C.sage,weak:"#FDF0E8",mixed:C.amber,neutral:"#fff"};
            const qColor={strong:C.sageB,weak:"#8A3010",mixed:C.amberB,neutral:C.mut};
            return(<div key={i} style={{background:qBg[p.quality]||"#fff",padding:"10px 14px",borderBottom:i<iq.passInsights.length-1?`1px solid ${C.bdr}`:undefined}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:10,color:qColor[p.quality]||C.mut,fontWeight:700}}>{p.roundName||"Pass"}</span>
                <QualityPip quality={p.quality}/>
              </div>
              {p.passedTiles&&p.passedTiles.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:6}}>{p.passedTiles.map((t,j)=><Ti key={j} t={t}/>)}</div>}
              <p style={{fontSize:11,color:C.ink,margin:0,lineHeight:1.55}}>{p.insight}</p>
            </div>);
          })}
        </div>}
      </div>}

      {/* Timing note */}
      {iq.timingInsight&&<div style={{fontSize:11,color:C.mut,lineHeight:1.55,background:C.bg2,borderRadius:10,padding:"9px 12px",marginBottom:10,borderLeft:`3px solid ${scoreColor(iq.timingScore,10)}`}}>⏱ {iq.timingInsight}</div>}

      <button onClick={onBack} style={{...S.oBtn,width:"100%",marginTop:4}}>← Back to Scorecard</button>
      <Footer/>
    </div>
  );
}

// IQScorecard router — daily gets simplified, practice gets tabbed
function IQScorecard({iq,hand,passLog,isDaily,dayNum,section,chosenSec,allSections,onHome,onDealAgain,onPractice,setScreen}){
  const [coachMode,setCoachMode]=useState(false);
  if(isDaily&&coachMode)return(
    <CoachModeScreen iq={iq} hand={hand} passLog={passLog} dayNum={dayNum} section={section} chosenSec={chosenSec} chosenHand={chosenHand} allSections={allSections} onBack={()=>setCoachMode(false)} setScreen={setScreen}/>
  );
  if(isDaily)return <DailyIQScorecard iq={iq} hand={hand} passLog={passLog} dayNum={dayNum} section={section} chosenSec={chosenSec} chosenHand={chosenHand} allSections={allSections} onHome={onHome} onPractice={onPractice} onCoachMode={()=>setCoachMode(true)}/>;
  return <PracticeIQScorecard iq={iq} hand={hand} passLog={passLog} section={section} chosenSec={chosenSec} allSections={allSections} onHome={onHome} onDealAgain={onDealAgain}/>;
}

// ─── STANDALONE SCORECARD SCREEN ─────────────────────────────────────────────
function ScorecardScreen({res,home,dayNum,onPractice,setScreen}){
  const [coachMode,setCoachMode]=useState(false);
  if(!res||!res.iq)return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{textAlign:"center",padding:"40px 0",color:C.mut}}>No scorecard data available.</div>
    </div>
  );
  if(coachMode)return(
    <CoachModeScreen
      iq={res.iq} hand={res.finalRack||[]} passLog={res.passLog||[]}
      dayNum={dayNum} section={res.section} chosenSec={res.chosenSec}
      allSections={res.allSections||[]} onBack={()=>setCoachMode(false)} setScreen={setScreen}
    />
  );
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <DailyIQScorecard iq={res.iq} hand={res.finalRack||[]} passLog={res.passLog||[]} dayNum={dayNum} section={res.section} chosenSec={res.chosenSec} chosenHand={res.chosenHand} allSections={res.allSections||[]} onHome={home} onPractice={onPractice} onCoachMode={()=>setCoachMode(true)}/>
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

function ClubPostToast({toast,onDismiss}){
  useEffect(()=>{const t=setTimeout(onDismiss,4500);return()=>clearTimeout(t);},[]);
  return(
    <div role="status" aria-live="polite" className="rk-in" style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#fff",borderRadius:16,padding:"12px 18px",boxShadow:"0 8px 32px rgba(0,0,0,0.14)",border:`2px solid ${C.jade}25`,zIndex:200,display:"flex",alignItems:"center",gap:12,maxWidth:300,width:"calc(100% - 32px)"}}>
      <div style={{width:36,height:36,borderRadius:10,background:C.jade+"12",border:`1.5px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🀄</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.jade,lineHeight:1,marginBottom:3}}>Posted to {toast.clubName}</div>
        <div style={{fontSize:11,color:C.mut}}>IQ {toast.iqScore} is on the board</div>
      </div>
      <button onClick={onDismiss} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer",padding:0,lineHeight:1,flexShrink:0}}>✕</button>
    </div>
  );
}

function RackleHeader({onBack,setScreen}){
  const [menuOpen,setMenuOpen]=useState(false);
  const profile=getProfile();
  const hasProfile=!!(profile&&profile.nickname);
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",marginBottom:20,paddingTop:10,paddingBottom:12,borderBottom:`1px solid ${C.bdr}`}}>
      <button onClick={onBack} style={S.back} aria-label="Back to home">← Back</button>
      <div style={{textAlign:"center",position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div>
        <div style={{fontFamily:F.d,fontSize:10,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>The Daily Mahjong Workout.</div>
      </div>
      <div style={{position:"relative"}}>
        <button onClick={()=>setMenuOpen(o=>!o)} aria-label="Menu"
          style={{background:menuOpen?C.bg2:"none",border:`1px solid ${menuOpen?C.bdr:"transparent"}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
          <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
          <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
        </button>
        {menuOpen&&(
          <div className="rk-in" style={{position:"absolute",top:"100%",right:0,zIndex:50,background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:140,maxWidth:160,marginTop:6,overflow:"hidden"}}>
            {hasProfile?(
              <button onClick={()=>{setMenuOpen(false);setScreen&&setScreen("profile");}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",borderBottom:`1px solid ${C.bdr}`}}>
                <div style={{width:28,height:28,borderRadius:14,background:C.jade+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.jade,flexShrink:0}}>
                  {(profile.nickname||"?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink,lineHeight:1.2}}>{profile.nickname.split(" ")[0]}</div>
                  <div style={{fontSize:10,color:C.mut}}>View profile</div>
                </div>
              </button>
            ):(
              <button onClick={()=>{setMenuOpen(false);setScreen&&setScreen("profile");}} style={{width:"100%",padding:"12px 14px",background:C.jade+"08",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:700,color:C.jade,borderBottom:`1px solid ${C.bdr}`}}>Join Rackle →</button>
            )}
            <button onClick={()=>{setMenuOpen(false);setScreen&&setScreen("settings");}} style={{width:"100%",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:600,color:C.ink}}>⚙ Settings</button>
          </div>
        )}
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
function Settings({home,settings,setSettings,showTutorial,setScreen}){
  const [confirmClear,setConfirmClear]=useState(false);
  const clearHistory=()=>{
    ST.set("hist",[]);ST.set("str",0);ST.set("rnd",0);ST.set("ld",null);ST.set("dd",null);ST.set("dres",null);
    ST.set("tutorialDismissed",false);ST.set("hadFirstDaily",false);ST.set("tutDone",false);
    ST.set("clubCode",null);ST.set("clubName",null);ST.set("profile",null);
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
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{marginBottom:20,marginTop:4,textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>Settings</div>
        <div style={{fontSize:12,color:C.mut}}>Customise your Rackle experience.</div>
      </div>
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
function Tutorial({onDone,onBack,setScreen}){
  const [step,setStep]=useState(0);const [tapTile,setTapTile]=useState(null);
  const st=TUTORIAL_STEPS[step];const isLast=step===TUTORIAL_STEPS.length-1;
  const sampleTiles=[{t:"s",s:"bam",n:6},{t:"s",s:"crak",n:2},{t:"d",v:"Soap"},{t:"j"},{t:"f"},{t:"w",v:"N"},{t:"s",s:"dot",n:9}];
  return(
    <div style={S.pg} className="rk-pg">
      {onBack&&<RackleHeader onBack={onBack} setScreen={setScreen}/>}
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
function CardGuideScreen({home,setScreen}){
  const [exp,setExp]=useState(null);
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{marginBottom:20,marginTop:4}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>2026 Card Guide</div>
        <p style={{fontSize:12,color:C.mut,margin:0,lineHeight:1.6}}>Hold and pass tips for all 9 sections. Tap any to study it.</p>
      </div>
      {SECS.map(s=>{const o=exp===s.id;return(
        <div key={s.id} style={{background:"#FDFAF6",border:`1px solid ${o?s.color+"40":C.bdr}`,borderRadius:14,overflow:"hidden",marginBottom:8,transition:"border-color 0.15s"}}>
          <button onClick={()=>setExp(o?null:s.id)} aria-expanded={o} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:11,background:s.color+"14",border:`1px solid ${s.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:o?s.color:C.ink,marginBottom:3,transition:"color 0.15s"}}>{s.name}</div>
                <div style={{fontSize:11,color:C.mut,lineHeight:1.3}}>{s.desc}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <span style={{fontSize:9,color:C.mut,fontWeight:600}}>{s.hands} hands</span>
              <span style={{fontSize:13,color:o?s.color:C.mut,transition:"color 0.15s"}}>{o?"▾":"▸"}</span>
            </div>
          </button>
          {o&&<div style={{borderTop:`1px solid ${s.color}20`,background:`${s.color}04`}} className="rk-in">
            <div style={{display:"flex",gap:8,padding:"12px 16px 0"}}>
              <div style={{flex:1,background:"#fff",border:`1px solid ${C.jade}20`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>✓ HOLD</div>
                <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.hold}</div>
              </div>
              <div style={{flex:1,background:"#fff",border:`1px solid ${C.cinn}15`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:8,color:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>✗ PASS</div>
                <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.pass}</div>
              </div>
            </div>
            <div style={{padding:"10px 16px",margin:"10px 16px 0",background:"#fff",border:`1px solid ${C.gold}20`,borderRadius:10,marginBottom:s.joker?0:16}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>💡 STRATEGY</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.65}}>{s.combos}</div>
            </div>
            {s.joker&&<div style={{padding:"10px 16px",margin:"10px 16px 16px",background:"#fff",border:`1px solid ${C.gold}20`,borderRadius:10}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>🃏 JOKER TIP</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.65}}>{s.joker}</div>
            </div>}
            {!s.joker&&<div style={{height:4}}/>}
          </div>}
        </div>);})}
      <Footer/>
    </div>
  );
}

// ─── MIDNIGHT COUNTDOWN ───────────────────────────────────────────────────────
function MidnightCountdown({dn}){
  const [timeLeft,setTimeLeft]=useState("");
  const [h,setH]=useState(0);
  useEffect(()=>{
    const tick=()=>{
      const now=new Date(),midnight=new Date();
      midnight.setHours(24,0,0,0);
      const diff=Math.max(0,midnight-now);
      const hh=Math.floor(diff/3600000),mm=Math.floor((diff%3600000)/60000),ss=Math.floor((diff%60000)/1000);
      setH(hh);
      setTimeLeft(`${hh}h ${mm.toString().padStart(2,"0")}m ${ss.toString().padStart(2,"0")}s`);
    };
    tick();const iv=setInterval(tick,1000);return()=>clearInterval(iv);
  },[]);
  const taglines=[
    ["Same time tomorrow.", "A new hand. A better score."],
    ["Your club is coming back.", "Will you beat them?"],
    ["Tomorrow's deal is already shuffled.", "Be ready."],
    ["One shot. One hand.", "Don't let your streak die here."],
    ["The table remembers who shows up.", "Will you?"],
    ["Every great player shows up the next day.", "See you at midnight."],
    ["The Charleston doesn't care how tired you are.", "Neither does the leaderboard."],
    ["You already know what you passed too soon.", "Tomorrow, hold it."],
    ["Your best hand is still ahead of you.", "Prove it tomorrow."],
    ["Sleep on it.", "The tiles will be waiting."],
    ["The Daily resets. Your instincts don't.", "Use them."],
    ["Yesterday's rack is gone.", "Tomorrow's is already dealt."],
    ["A new day. A new deal.", "Same competition."],
    ["The best Mahjong players are the ones who come back.", "Come back."],
    ["Your streak is one day older.", "Keep it alive."],
    ["Some players quit after a bad hand.", "You're not one of them."],
    ["Tomorrow's rack doesn't know what happened today.", "Neither should you."],
    ["The tiles reset at midnight.", "Your streak doesn't have to."],
    ["Every pass is a decision.", "Tomorrow, make better ones."],
    ["Consistency beats talent.", "Show up again."],
    ["The deal is random.", "The skill isn't."],
    ["Your Charleston is a muscle.", "Train it daily."],
    ["No two hands are the same.", "That's the point."],
    ["Midnight is closer than you think.", "So is a better score."],
    ["The table is set.", "The question is who sits down."],
    ["One more day. One more shot.", "Same hand for every player — including the ones trying to beat you."],
  ];
  const tagline=taglines[dn%taglines.length];
  const urgent=h<2;
  const now2=new Date(),midnight2=new Date();
  midnight2.setHours(24,0,0,0);
  const diff2=Math.max(0,midnight2-now2);
  const hh2=Math.floor(diff2/3600000);
  const mm2=Math.floor((diff2%3600000)/60000);
  const ss2=Math.floor((diff2%60000)/1000);
  const pad=(n)=>n.toString().padStart(2,"0");
  const col=urgent?C.cinn:C.ink;
  const mutCol=urgent?C.cinn+"99":C.mut;
  return(
    <div style={{textAlign:"center",padding:"14px 0 12px",margin:"4px 0",position:"relative"}}>
      {/* Label pill */}
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:urgent?C.cinn+"12":C.bg2,border:`1px solid ${urgent?C.cinn+"40":C.bdr}`,borderRadius:20,padding:"5px 14px",marginBottom:12}}>
        {!urgent&&(
          <span className="rk-pulse" style={{width:5,height:5,borderRadius:"50%",background:C.jade,display:"inline-block",flexShrink:0}}/>
        )}
        <span style={{fontSize:9,color:mutCol,letterSpacing:2.5,fontWeight:700,fontFamily:F.b}}>
          {urgent?"⚠ LAST CHANCE":"NEXT DAILY RACKLE"}
        </span>
      </div>

      {/* Segmented clock */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:0,marginBottom:12}}>
        {[{v:pad(hh2),l:"HRS"},{v:pad(mm2),l:"MIN"},{v:pad(ss2),l:"SEC"}].map(({v,l},i)=>(
          <div key={l} style={{display:"flex",alignItems:"flex-start"}}>
            <div style={{textAlign:"center",minWidth:64}}>
              <div style={{fontFamily:F.d,fontSize:44,fontWeight:900,color:col,letterSpacing:-3,lineHeight:1}}>{v}</div>
              <div style={{fontSize:7,color:mutCol,letterSpacing:2.5,fontWeight:700,marginTop:5,fontFamily:F.b}}>{l}</div>
            </div>
            {i<2&&(
              <div style={{display:"flex",flexDirection:"column",gap:6,alignSelf:"center",margin:"0 6px",paddingBottom:18}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:C.bdr}}/>
                <div style={{width:4,height:4,borderRadius:"50%",background:C.bdr}}/>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tagline */}
      {urgent
        ?<div style={{fontSize:12,color:C.cinn,lineHeight:1.8,fontStyle:"italic",maxWidth:220,margin:"0 auto"}}>
            Last chance to practice<br/>before the next daily 🔥
          </div>
        :<div style={{maxWidth:260,margin:"0 auto"}}>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:700,color:C.ink,lineHeight:1.6,letterSpacing:0.1}}>{tagline[0]}</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.7,marginTop:1,fontStyle:"italic"}}>{tagline[1]}</div>
        </div>
      }

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

// ─── INLINE CODE ENTRY — "I have a code" pill on homepage ───────────────────
function InlineCodeEntry({setScreen}){
  const [open,setOpen]=useState(false);
  const [code,setCode]=useState("");
  const [err,setErr]=useState("");
  const join=()=>{
    const trimmed=code.trim();
    if(!trimmed){setErr("Enter your 4-digit club code.");return;}
    if(!CLUBS[trimmed]){setErr("Code not recognised. Check with your organiser.");return;}
    setClubCode(trimmed);setErr("");setCode("");
    setScreen("leaderboard");
  };
  return(
    <div style={{borderTop:`1px solid ${C.bdr}`,background:C.bg}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.jade+"15",border:`1px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🔑</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.jade,fontFamily:F.b}}>I have a club code</div>
            <div style={{fontSize:10,color:C.mut,marginTop:1}}>Enter it to join your club's leaderboard</div>
          </div>
        </div>
        <span style={{fontSize:12,color:C.jade,opacity:0.7,transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block"}}>▾</span>
      </button>
      {open&&(
        <div className="rk-in" style={{padding:"0 14px 14px"}}>
          <div style={{display:"flex",gap:8,width:"100%",boxSizing:"border-box"}}>
            <input
              value={code}
              onChange={e=>{setCode(e.target.value.replace(/\D/g,"").slice(0,4));setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&join()}
              placeholder="----"
              maxLength={4}
              autoFocus
              style={{flex:1,minWidth:0,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${err?C.cinn:C.jade+"40"}`,fontSize:20,fontFamily:F.d,fontWeight:700,color:C.ink,outline:"none",textAlign:"center",letterSpacing:5,background:"#fff"}}
            />
            <button onClick={join} style={{flexShrink:0,padding:"10px 16px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F.b}}>Join →</button>
          </div>
          {err&&<div style={{fontSize:11,color:C.cinn,marginTop:6}}>{err}</div>}
          <button onClick={()=>{setOpen(false);setScreen("clubs");}} style={{marginTop:10,width:"100%",background:"none",border:"none",fontSize:11,color:C.mut,cursor:"pointer",fontWeight:600,padding:0,textAlign:"center"}}>Don't have a code? Browse the club directory →</button>
        </div>
      )}
    </div>
  );
}

function ClubCodeEntry({setScreen}){
  const [open,setOpen]=useState(false);
  const [codeOpen,setCodeOpen]=useState(false);
  const [code,setCode]=useState("");
  const [err,setErr]=useState("");
  const [clubStats,setClubStats]=useState(null);

  const profile=getProfile();
  const hasProfile=!!(profile&&profile.nickname);
  const savedCode=hasProfile?getClubCode():null;
  const savedClub=savedCode?CLUBS[savedCode]:null;
  const myName=getClubName()||(profile?.nickname||null);

  // Eager fetch club stats if in a club
  useEffect(()=>{
    if(!savedCode)return;
    fetchLBEntries(savedCode).then(rows=>{
      if(!rows||!rows.length)return;
      const myRank=myName?rows.findIndex(e=>e.name.toLowerCase()===myName.toLowerCase())+1:0;
      const top=rows[0];
      setClubStats({total:rows.length,topName:top?.name,topIQ:top?.iqScore,myRank:myRank>0?myRank:null});
    });
  },[savedCode]);

  const join=()=>{
    const trimmed=code.trim();
    if(!trimmed){setErr("Enter a 4-digit club code.");return;}
    if(!CLUBS[trimmed]){setErr("Code not recognised. Check with your club organiser.");return;}
    setClubCode(trimmed);setErr("");setCode("");
    setScreen("leaderboard");
  };

  const addClubEmail="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20";
  const totalClubs=Object.keys(CLUBS).length;

  return(
    <div style={{marginBottom:0}}>
      <button onClick={()=>savedClub?setOpen(o=>!o):setScreen("clubs")} style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"16px 14px",borderRadius:open?"0":"0 0 12px 12px",background:C.jade+"06",border:"none",borderTop:`1px solid ${C.bdr}`,cursor:"pointer",textAlign:"left"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:9,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:8}}>{savedClub?"YOUR CLUB · TODAY":"JOIN YOUR CLUB"}</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:C.ink,lineHeight:1.2,marginBottom:10}}>{savedClub?savedClub.name:"Club Leaderboard"}</div>
          {/* Live stat pills for club members */}
          {savedClub&&clubStats?(
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:700,color:C.jade,background:C.jade+"12",borderRadius:20,padding:"2px 10px"}}>{clubStats.total} playing today</span>
              {clubStats.topIQ&&<span style={{fontSize:10,fontWeight:700,color:C.gold,background:C.gold+"15",borderRadius:20,padding:"2px 10px"}}>Top: {clubStats.topIQ} IQ</span>}
              {clubStats.myRank&&<span style={{fontSize:10,fontWeight:700,color:"#2460A8",background:"#2460A812",borderRadius:20,padding:"2px 10px"}}>You're #{clubStats.myRank}</span>}
            </div>
          ):savedClub?(
            <div style={{fontSize:11,color:C.mut}}>Who's top of {savedClub.name} right now?</div>
          ):(
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:700,color:C.jade,background:C.jade+"12",borderRadius:20,padding:"2px 10px"}}>{totalClubs} clubs active</span>
              <span style={{fontSize:10,fontWeight:600,color:C.mut,background:C.bg2,borderRadius:20,padding:"2px 10px"}}>Play with your Mahj club</span>
            </div>
          )}
        </div>
        <span style={{fontSize:11,color:C.jade,opacity:0.7,marginLeft:8,marginTop:2}}>{savedClub?(open?"▴":"▾"):"→"}</span>
      </button>

      {open&&<div className="rk-in" style={{background:"#fff",border:`1px solid ${C.jade+"25"}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"14px 16px"}}>
        {savedClub?(
          <button onClick={()=>setScreen("leaderboard")} style={{width:"100%",borderRadius:12,background:C.sage,border:`1px solid ${C.sageB}25`,cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:10,textAlign:"left"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:"#1A3D28",lineHeight:1.2,marginBottom:2}}>Open {savedClub.name}</div>
              <div style={{fontSize:11,color:C.sageB}}>See today's full board →</div>
            </div>
            <span style={{fontSize:20,flexShrink:0}}>🏆</span>
          </button>
        ):(
          <>
            <div style={{background:C.jade+"08",borderRadius:10,padding:"10px 12px",marginBottom:12,border:`1px solid ${C.jade}20`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.jade,marginBottom:3}}>Why join a club?</div>
              <div style={{fontSize:11,color:C.mut,lineHeight:1.6}}>Your score posts automatically after every Daily. See how you rank against your Mahj group — and give them something to beat.</div>
            </div>
            <button onClick={()=>setScreen("clubs")} style={{width:"100%",padding:"11px 0",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F.b,marginBottom:8}}>Browse Club Directory →</button>
            <button onClick={()=>{setCodeOpen(o=>!o);setErr("");setCode("");}} style={{width:"100%",padding:"9px 0",borderRadius:10,border:`1px solid ${C.bdr}`,background:codeOpen?C.bg2:"transparent",color:C.mut,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F.b,marginBottom:codeOpen?8:0}}>
              {codeOpen?"▴ Cancel":"I have a code"}
            </button>
            {codeOpen&&(
              <div className="rk-in">
                <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:6}}>
                  <input
                    value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,"").slice(0,4));setErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&join()}
                    placeholder="----"
                    maxLength={4}
                    autoFocus
                    style={{width:90,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${err?C.cinn:C.bdr}`,fontSize:16,fontFamily:F.d,fontWeight:700,color:C.ink,outline:"none",textAlign:"center",letterSpacing:4}}
                  />
                  <button onClick={join} style={{padding:"9px 18px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b,whiteSpace:"nowrap"}}>Join →</button>
                </div>
                {err&&<div style={{fontSize:11,color:C.cinn,textAlign:"center",marginBottom:6}}>{err}</div>}
              </div>
            )}
          </>
        )}
        <div style={{textAlign:"center",paddingTop:savedClub?0:4,borderTop:savedClub?`1px solid ${C.bdr}`:"none",marginTop:savedClub?10:0}}>
          <a href={addClubEmail} style={{fontSize:11,color:C.jade,textDecoration:"none",fontWeight:600}}>
            + Get your club on Rackle →
          </a>
        </div>
      </div>}
    </div>
  );
}

// ─── GLOBAL LEADERBOARD PILL ──────────────────────────────────────────────────
function GlobalLeaderboardPill({setScreen}){
  const [open,setOpen]=useState(false);
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(false);
  const [fetched,setFetched]=useState(false);
  const myName=getClubName()||(getProfile()?.nickname||null);
  const dn=getDayNum();

  // Eager fetch on mount so header shows live stats
  useEffect(()=>{
    setLoading(true);
    fetchGlobalEntries().then(rows=>{setEntries(rows);setLoading(false);setFetched(true);});
  },[]);

  const toggle=()=>{
    if(!open&&!fetched)fetchGlobalEntries().then(rows=>{setEntries(rows);setFetched(true);});
    setOpen(o=>!o);
  };
  const refresh=()=>{
    setLoading(true);
    fetchGlobalEntries().then(rows=>{setEntries(rows);setLoading(false);setFetched(true);});
  };

  const top5=entries.slice(0,5);
  const myRank=myName?entries.findIndex(e=>e.name.toLowerCase()===myName.toLowerCase())+1:0;
  const myEntry=myRank>0?entries[myRank-1]:null;
  const topIQ=entries.length>0?entries[0].iqScore:null;
  const hasData=entries.length>0;

  return(
    <div style={{marginBottom:0}}>
      <button onClick={toggle} style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"16px 14px",borderRadius:open?"12px 12px 0 0":"12px 12px 0 0",background:"#2460A806",border:"none",borderBottom:open?"none":`1px solid #2460A815`,cursor:"pointer",textAlign:"left"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:9,color:"#2460A8",letterSpacing:1.5,fontWeight:700,marginBottom:8}}>🌍 GLOBAL · DAY #{dn}</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:C.ink,lineHeight:1.2,marginBottom:10}}>Rackle Leaderboard</div>
          {/* Live stat pills */}
          {hasData?(
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:700,color:"#2460A8",background:"#2460A812",borderRadius:20,padding:"2px 10px"}}>{entries.length} players today</span>
              {topIQ&&<span style={{fontSize:10,fontWeight:700,color:C.jade,background:C.jade+"12",borderRadius:20,padding:"2px 10px"}}>Top IQ: {topIQ}</span>}
              {myRank>0&&<span style={{fontSize:10,fontWeight:700,color:C.gold,background:C.gold+"15",borderRadius:20,padding:"2px 10px"}}>You're #{myRank} 🔥</span>}
              {myRank===0&&myName&&<span style={{fontSize:10,fontWeight:600,color:C.mut,background:C.bg2,borderRadius:20,padding:"2px 10px"}}>Play Daily to rank</span>}
            </div>
          ):(
            <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>{loading?"Loading scores…":"The same hand. Every player. Who played it best?"}</div>
          )}
        </div>
        <span style={{fontSize:11,color:"#2460A8",opacity:0.7,marginLeft:8,marginTop:2}}>{open?"▴":"▾"}</span>
      </button>

      {open&&<div className="rk-in" style={{border:`1px solid #2460A825`,borderTop:"none",borderRadius:"0 0 0 0",overflow:"hidden",background:"#fff"}}>
        {myEntry&&(
          <div style={{background:`linear-gradient(135deg,#2460A810,#2460A806)`,borderBottom:`1px solid #2460A815`,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:8,background:"#2460A815",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#2460A8",fontFamily:F.d,flexShrink:0}}>#{myRank}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:F.d,fontSize:12,fontWeight:800,color:"#2460A8",lineHeight:1}}>You're #{myRank} globally today</div>
              <div style={{fontSize:10,color:C.mut,marginTop:2}}>IQ {myEntry.iqScore}{myEntry.streak>1?` · ${myEntry.streak}d streak`:""}</div>
            </div>
          </div>
        )}
        {loading?(
          <div style={{textAlign:"center",padding:"20px 14px"}}>
            <div style={{fontSize:18,opacity:0.25,marginBottom:6}}>⏳</div>
            <div style={{fontSize:11,color:C.mut}}>Loading global scores…</div>
          </div>
        ):top5.length===0?(
          <div style={{textAlign:"center",padding:"24px 14px"}}>
            <div style={{fontSize:26,marginBottom:8}}>🀄</div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,marginBottom:4}}>Board's empty — be first</div>
            <div style={{fontSize:11,color:C.mut,lineHeight:1.6,marginBottom:12}}>Play today's Daily and put your name at the top.</div>
            <button onClick={refresh} style={{fontSize:11,color:"#2460A8",fontWeight:700,background:"#2460A808",border:`1px solid #2460A825`,borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>↻ Refresh</button>
          </div>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"28px 1fr 44px 36px",gap:0,padding:"7px 14px",background:C.bg2,borderBottom:`1px solid ${C.bdr}`}}>
              {["#","Player","IQ","🔥"].map((h,i)=>(
                <div key={i} style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,textAlign:i>1?"center":"left"}}>{h}</div>
              ))}
            </div>
            {top5.map((e,i)=>{
              const isMe=myName&&e.name.toLowerCase()===myName.toLowerCase();
              const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
              const clubLabel=e.clubCode&&CLUBS[e.clubCode]?CLUBS[e.clubCode].name:null;
              return(
                <div key={i} style={{display:"grid",gridTemplateColumns:"28px 1fr 44px 36px",gap:0,padding:"10px 14px",background:isMe?"#2460A806":"#fff",borderBottom:i<top5.length-1?`1px solid ${C.bdr}`:"none",alignItems:"center"}}>
                  <div style={{fontSize:i<3?14:12}}>{medal||<span style={{fontFamily:F.d,fontSize:12,fontWeight:700,color:C.mut}}>{i+1}</span>}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontFamily:F.d,fontSize:12,fontWeight:isMe?800:600,color:isMe?"#2460A8":C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}{isMe?" (you)":""}</div>
                    {clubLabel&&<div style={{fontSize:9,color:C.mut,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clubLabel}</div>}
                  </div>
                  <div style={{textAlign:"center"}}><span style={{fontFamily:F.d,fontSize:13,fontWeight:900,color:e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn}}>{e.iqScore}</span></div>
                  <div style={{textAlign:"center",fontSize:11,color:C.cinn}}>{e.streak>1?e.streak:""}</div>
                </div>
              );
            })}
          </>
        )}
        <div style={{padding:"10px 14px",borderTop:`1px solid ${C.bdr}`,background:C.bg2}}>
          {entries.length>5&&setScreen&&(
            <button onClick={()=>setScreen("leaderboard")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"none",border:"none",cursor:"pointer",padding:"2px 0 8px",textAlign:"left"}}>
              <span style={{fontSize:11,fontWeight:700,color:"#2460A8"}}>See all {entries.length} scores</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:10,color:C.mut}}>+{entries.length-5} more</span>
                <span style={{fontSize:12,color:"#2460A8",fontWeight:700}}>→</span>
              </span>
            </button>
          )}
          <div style={{fontSize:10,color:C.mut,lineHeight:1.5,opacity:0.7,textAlign:"center"}}>Play the Daily to appear · Resets midnight</div>
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
// ─── LEADERBOARD SCREEN ────────────────────────────────────────────────────────
// ─── CLUB DIRECTORY ──────────────────────────────────────────────────────────
function ClubDirectoryScreen({home,setScreen}){
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState(null);
  const [code,setCode]=useState("");
  const [codeErr,setCodeErr]=useState("");
  const [pubEntries,setPubEntries]=useState([]);
  const [pubLoading,setPubLoading]=useState(false);
  const allClubs=Object.entries(CLUBS);

  // Pre-select from URL slug e.g. playrackle.com/clubs/apex-mahjong-club
  useEffect(()=>{
    const slug=getUrlParam("club");
    if(slug){const match=clubBySlug(slug);if(match)setSelected(match[0]);}
  },[]);

  // Fetch public leaderboard whenever a club is selected
  useEffect(()=>{
    if(!selected)return;
    setPubLoading(true);setPubEntries([]);
    fetchLBEntries(selected).then(rows=>{setPubEntries(rows);setPubLoading(false);});
  },[selected]);

  const filtered=query.trim()===""
    ?allClubs
    :allClubs.filter(([,c])=>
        c.name.toLowerCase().includes(query.toLowerCase())||
        c.location.toLowerCase().includes(query.toLowerCase())
      );

  const join=(clubCode)=>{
    const trimmed=code.trim();
    if(!trimmed){setCodeErr("Enter your club's 4-digit code.");return;}
    if(trimmed!==clubCode){setCodeErr("Code doesn't match. Check with your organiser.");return;}
    setClubCode(trimmed);setCode("");setCodeErr("");
    setScreen("leaderboard");
  };

  const clubUrl=(clubCode)=>{
    const c=CLUBS[clubCode];if(!c)return"";
    return`playrackle.com/clubs/${toSlug(c.name)}`;
  };

  const isMember=getClubCode()===selected;
  const dn=getDayNum();

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>

      {/* If a club is deep-linked, show its full public page */}
      {selected?(()=>{
        const club=CLUBS[selected];if(!club)return null;
        const todayEntries=pubEntries.filter(e=>{
          const d=new Date(e.created_at||0);
          return d.toDateString()===new Date().toDateString();
        });
        const showEntries=pubEntries.slice(0,20);
        return(
          <div>
            {/* Club header */}
            <div style={{textAlign:"center",marginBottom:20,marginTop:4}}>
              <div style={{fontSize:36,marginBottom:6}}>{club.emoji||"🀄"}</div>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>{club.name}</div>
              <div style={{fontSize:12,color:C.mut,marginBottom:12}}>{club.location}</div>
              {/* Share link */}
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.sage,borderRadius:10,padding:"7px 12px",border:`1px solid ${C.sageB}20`}}>
                <span style={{fontSize:11,color:C.sageB,fontWeight:600}}>{clubUrl(selected)}</span>
                <button onClick={()=>navigator.clipboard?.writeText(`https://${clubUrl(selected)}`)} style={{background:"none",border:`1px solid ${C.sageB}40`,borderRadius:6,padding:"3px 8px",fontSize:10,color:C.sageB,fontWeight:700,cursor:"pointer"}}>Copy</button>
              </div>
            </div>

            {/* Leaderboard — public, no code needed */}
            <div style={{...S.card,marginBottom:12,padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>TODAY'S LEADERBOARD</div>
                <div style={{fontSize:10,color:C.mut}}>Day #{dn}</div>
              </div>
              {pubLoading?(
                <div style={{padding:"24px",textAlign:"center",color:C.mut,fontSize:12}}>Loading scores…</div>
              ):showEntries.length===0?(
                <div style={{padding:"24px",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:8}}>🀄</div>
                  <div style={{fontSize:13,color:C.mut}}>No scores yet today.</div>
                  <div style={{fontSize:11,color:C.mut,marginTop:4}}>Be the first — play today's Daily Rackle and post your score.</div>
                </div>
              ):(
                <div>
                  {showEntries.map((e,i)=>{
                    const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderBottom:i<showEntries.length-1?`1px solid ${C.bdr}`:"none",background:i===0?"#FFFBF0":"#fff"}}>
                        <div style={{width:24,textAlign:"center",flexShrink:0}}>
                          {medal?<span style={{fontSize:16}}>{medal}</span>:<span style={{fontSize:12,color:C.mut,fontWeight:700}}>#{i+1}</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:C.ink,lineHeight:1.2}}>{e.name}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.jade}}>IQ {e.iqScore}</div>
                          {e.streak>1&&<div style={{fontSize:9,color:C.gold,fontWeight:700}}>🔥 {e.streak} day streak</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Code entry — only needed to post a score */}
            {!isMember&&(
              <div style={{...S.card,marginBottom:12,padding:"14px"}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>POST YOUR SCORE</div>
                <div style={{fontSize:12,color:C.mut,marginBottom:10,lineHeight:1.5}}>Enter your club's 4-digit code to join and post your IQ score to the leaderboard.</div>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <input
                    value={code}
                    onChange={e=>{setCode(e.target.value.replace(/\D/g,"").slice(0,4));setCodeErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&join(selected)}
                    placeholder="----"
                    maxLength={4}
                    style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${codeErr?C.cinn:C.bdr}`,fontSize:18,fontFamily:F.d,fontWeight:700,color:C.ink,outline:"none",textAlign:"center",letterSpacing:5,background:"#fff"}}
                  />
                  <button onClick={()=>join(selected)} style={{padding:"10px 20px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F.b,whiteSpace:"nowrap"}}>Join →</button>
                </div>
                {codeErr&&<div style={{fontSize:11,color:C.cinn}}>{codeErr}</div>}
                <div style={{fontSize:11,color:C.mut,marginTop:6}}>Don't have a code? Ask your club organiser.</div>
              </div>
            )}
            {isMember&&(
              <button onClick={()=>setScreen("leaderboard")} style={{...S.greenBtn,width:"100%",marginBottom:12}}>Go to My Club Leaderboard →</button>
            )}
            <button onClick={()=>setSelected(null)} style={{width:"100%",background:"none",border:`1.5px solid ${C.bdr}`,borderRadius:12,padding:"12px",fontSize:13,color:C.mut,fontWeight:600,cursor:"pointer"}}>← All Clubs</button>
          </div>
        );
      })():(
        <>
          {/* Page title */}
          <div style={{marginBottom:20,marginTop:4,textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>Club Directory</div>
            <div style={{fontSize:12,color:C.mut}}>Find your Mahjong club and join its leaderboard.</div>
          </div>

          {/* Search */}
          <div style={{position:"relative",marginBottom:14}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:C.mut,pointerEvents:"none"}}>🔍</span>
            <input
              value={query}
              onChange={e=>{setQuery(e.target.value);setCode("");setCodeErr("");}}
              placeholder="Search by club name or city…"
              style={{width:"100%",padding:"11px 12px 11px 36px",borderRadius:12,border:`1.5px solid ${C.bdr}`,fontSize:13,fontFamily:F.b,color:C.ink,outline:"none",background:"#fff"}}
            />
          </div>

          {/* Club list */}
          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"32px 0",color:C.mut,fontSize:13}}>
              <div style={{fontSize:28,marginBottom:8}}>🀄</div>
              No clubs found for "{query}".
              <div style={{marginTop:12}}>
                <a href="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20" style={{fontSize:12,color:C.jade,fontWeight:700,textDecoration:"none"}}>+ Get your club listed →</a>
              </div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {filtered.map(([clubCode,club])=>(
                <button key={clubCode}
                  onClick={()=>setSelected(clubCode)}
                  style={{cursor:"pointer",display:"flex",alignItems:"center",gap:12,borderRadius:14,padding:"14px 16px",border:`1.5px solid ${C.bdr}`,background:"#FDFAF6",textAlign:"left"}}>
                  <div style={{width:40,height:40,borderRadius:10,background:C.bg2,border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                    {club.emoji||"🀄"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,lineHeight:1.2,marginBottom:2}}>{club.name}</div>
                    <div style={{fontSize:11,color:C.mut}}>{club.location}</div>
                  </div>
                  <span style={{fontSize:14,color:C.mut,fontWeight:700,flexShrink:0}}>▸</span>
                </button>
              ))}
            </div>
          )}

          {/* Get listed CTA */}
          <div style={{textAlign:"center",padding:"16px 0",borderTop:`1px solid ${C.bdr}`,marginTop:4}}>
            <div style={{fontSize:12,color:C.mut,marginBottom:6}}>Don't see your club?</div>
            <a href="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20" style={{fontSize:13,color:C.jade,fontWeight:700,textDecoration:"none"}}>+ Get your club on Rackle →</a>
          </div>
        </>
      )}
      <Footer/>
    </div>
  );
}

function LeaderboardScreen({home,dRes,streak,setScreen}){
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
      setEntries(updated);setSubmitted(true);
    } else {
      setNameErr("Couldn't post score — check your connection and try again.");
    }
    setSubmitting(false);
  };

  if(!club)return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{textAlign:"center",padding:"48px 0 32px"}}>
        <div style={{fontSize:36,marginBottom:12}}>🀄</div>
        <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,marginBottom:8}}>No club selected</div>
        <div style={{fontSize:13,color:C.mut,lineHeight:1.6,maxWidth:260,margin:"0 auto 20px"}}>Browse the club directory to find your Mahjong group and join their leaderboard.</div>
        <button onClick={()=>setScreen("clubs")} style={{...S.greenBtn,padding:"13px 28px",display:"inline-block"}}>Browse Club Directory →</button>
      </div>
      <Footer/>
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
      <RackleHeader onBack={home} setScreen={setScreen}/>

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
              <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.4}}>{iq.level} · ⏱ {fT(dRes?.time||0)}{streak>1?` · ${streak}d streak`:""}</div>
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
                💬 Challenge your club
              </a>
            );
          })()}
        </div>
      </div>}

      {!iq&&!submitted&&<div style={{...S.card,marginBottom:10,background:C.amber,borderColor:C.amberB+"20"}}>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>🎯 <strong>Complete today's Daily Rackle</strong> to add your score to the leaderboard.</div>
      </div>}



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
  const icon=streak>0?(streakBadge?streakBadge.badge:"📅"):bestIQ?"⭐":"🎲";
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
        <span style={{fontFamily:F.d,fontSize:12,fontWeight:800,color}}>{value}</span>
        <span style={{fontSize:11,color,fontWeight:600,opacity:0.8}}>{label}</span>
        <span style={{fontSize:9,color,opacity:0.5,marginLeft:1}}>{open?"▴":"▾"}</span>
      </button>

      {/* Expanded panel */}
      {open&&<div className="rk-in" style={{marginTop:6,background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:14,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",minWidth:180}}>
        {streak>0&&<div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:8,borderBottom:rounds>0||bestIQ?`1px solid ${C.bdr}`:"none",marginBottom:rounds>0||bestIQ?8:0}}>
          <span style={{fontSize:16}}>{streakBadge?streakBadge.badge:"📅"}</span>
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
  const [collapsed,setCollapsed]=useState(true);
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
        <span style={{fontSize:22,flexShrink:0}}>{streakBadge?streakBadge.badge:"📅"}</span>
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
              <div style={{height:5,borderRadius:3,background:C.bdr,overflow:"hidden",marginBottom:12}}>
                <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.gold},#C99F3A)`,width:`${pct}%`,transition:"width 0.6s ease"}}/>
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


// ─── TOP BANNER ───────────────────────────────────────────────────────────────
function TopBanner(){
  const messages=[
    {label:"WELCOME",text:"The Daily Mahjong Workout. Same hand. Every player. Every day."},
    {label:"TIP",text:"Pick your section before your first pass — direction is worth 40 points."},
    {label:"TIP",text:"Jokers can never be passed. Hold them and build around them."},
    {label:"TIP",text:"Flowers appear in most winning hands. Don't throw them away early."},
    {label:"TIP",text:"6s are your most versatile tile — they appear in ~40% of hands."},
    {label:"TIP",text:"1s are the least useful tiles on the 2026 card. Pass them first."},
    {label:"TIP",text:"A blind left pass protects tiles you've committed to. Use it wisely."},
    {label:"TIP",text:"Your IQ is built from Direction, Tile Strength, Pass Quality, and Timing."},
    {label:"TIP",text:"Soap acts as a wild tile in the 2026 section only."},
    {label:"TIP",text:"Practice Mode is unlimited. Build instincts before the daily resets."},
    {label:"DID YOU KNOW",text:"Rackle scores every pass individually — not just your final rack."},
    {label:"DID YOU KNOW",text:"The daily deal is seeded — every player gets the exact same 13 tiles."},
    {label:"DID YOU KNOW",text:"Coach Mode shows you the optimal pass for every round."},
  ];
  const [idx,setIdx]=useState(0);
  const [fade,setFade]=useState(true);
  const [dismissed,setDismissed]=useState(false);

  useEffect(()=>{
    const iv=setInterval(()=>{
      setFade(false);
      setTimeout(()=>{setIdx(i=>(i+1)%messages.length);setFade(true);},400);
    },6000);
    return()=>clearInterval(iv);
  },[]);

  if(dismissed)return null;
  const msg=messages[idx];
  const isWelcome=msg.label==="WELCOME";

  return(
    <div style={{
      background:"linear-gradient(135deg,#0A0A0A 0%,#111827 100%)",
      borderBottom:"1px solid rgba(201,168,76,0.2)",
      borderRadius:"12px 12px 0 0",
      padding:"10px 16px 10px",
      display:"flex",alignItems:"center",gap:10,
      position:"relative",overflow:"hidden",
    }}>
      {/* Subtle tile watermark */}
      <div aria-hidden style={{position:"absolute",right:36,top:"50%",transform:"translateY(-50%)",fontSize:32,opacity:0.04,userSelect:"none",pointerEvents:"none",lineHeight:1}}>🀄</div>

      {/* Left: label text */}
      <span style={{fontSize:8,color:isWelcome?"#C9A84C":"rgba(255,255,255,0.45)",letterSpacing:1.5,fontWeight:800,fontFamily:F.b,flexShrink:0,whiteSpace:"nowrap",marginRight:4}}>{msg.label}</span>

      {/* Message */}
      <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
        <span style={{
          fontSize:11,
          color:fade?"rgba(255,255,255,0.8)":"rgba(255,255,255,0)",
          fontFamily:F.b,fontWeight:500,
          lineHeight:1.4,
          display:"block",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
          transition:"color 0.4s ease",
        }}>{msg.text}</span>
      </div>

      {/* Dismiss */}
      <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",fontSize:14,cursor:"pointer",padding:"0 0 0 4px",lineHeight:1,flexShrink:0}}>✕</button>
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
  const [leOpen,setLeOpen]=useState(false);
  const [whyOpen,setWhyOpen]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [streakOpen,setStreakOpen]=useState(false);
  const [ds,setDs]=useState(null);
  const [clubPlayers,setClubPlayers]=useState(null);
  const dismissNudge=()=>{ST.set("nudgeDismissed",getDailySeed());setNudgeDismissed(true);};
  useEffect(()=>{
    fetchDailyStats().then(s=>{if(s&&s.total>=1)setDs(s);});
    const code=getClubCode();
    if(code){fetchLBEntries(code).then(rows=>{if(rows&&rows.length>0)setClubPlayers(rows.length);});}
  },[]);

  // Build share text fresh every render
  const passEmoji=(iq?.passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");
  const shareText=iq
    ?`🀄 Daily Rackle #${dn} · IQ ${iq.totalScore} · ${iq.level}\n${passEmoji?`Passes: ${passEmoji}\n`:""}Think you can beat it?\nplayrackle.com`
    :dRes?`🀄 Rackle #${dn} · ${dRes.rating} ${dRes.emoji}\n${dRes.section||""}\nplayrackle.com`:"";

  const ydIQ=yd?.iq?.totalScore||null;
  const weekData=getWeeklyRecapData();
  const weekDelta=weekData?.delta||null;

  return(
    <>
    <TopBanner/>
    <div style={{...S.pg,paddingTop:0}} className="rk-pg">
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
      {(()=>{
        const profile=getProfile();
        const hasProfile=!!(profile&&profile.nickname);
        return(
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"flex-end",marginBottom:0,marginTop:8,position:"relative"}}>
            <div style={{flex:1}}><Statspill streak={streak} rounds={rounds} bestIQ={bestIQ} streakBadge={streakBadge}/></div>
            {/* Hamburger */}
            <button
              onClick={()=>setMenuOpen(o=>!o)}
              aria-label="Menu"
              style={{background:menuOpen?C.bg2:"none",border:`1px solid ${menuOpen?C.bdr:"transparent"}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}
            >
              <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
              <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
              <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
            </button>
            {/* Dropdown */}
            {menuOpen&&(
              <div className="rk-in" style={{position:"absolute",top:"100%",right:0,zIndex:50,background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:140,maxWidth:160,marginTop:6,overflow:"hidden"}}
                onBlur={()=>setMenuOpen(false)}>
                {hasProfile?(
                  <button onClick={()=>{setMenuOpen(false);setScreen("profile");}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",borderBottom:`1px solid ${C.bdr}`}}>
                    <div style={{width:28,height:28,borderRadius:14,background:C.jade+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.jade,flexShrink:0}}>
                      {profile.avatarUrl?<img src={profile.avatarUrl} alt="" style={{width:28,height:28,borderRadius:14,objectFit:"cover"}}/>:(profile.nickname||"?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.ink,lineHeight:1.2}}>{profile.nickname.split(" ")[0]}</div>
                      <div style={{fontSize:10,color:C.mut}}>View profile</div>
                    </div>
                  </button>
                ):(
                  <>
                    <button onClick={()=>{setMenuOpen(false);sessionStorage.setItem("rk-goto","signin");setScreen("profile");}} style={{width:"100%",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:600,color:C.mut,borderBottom:`1px solid ${C.bdr}`}}>Log in</button>
                    <button onClick={()=>{setMenuOpen(false);sessionStorage.removeItem("rk-goto");setScreen("profile");}} style={{width:"100%",padding:"12px 14px",background:C.jade+"08",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:700,color:C.jade,borderBottom:`1px solid ${C.bdr}`}}>Join Rackle →</button>
                  </>
                )}
                <button onClick={()=>{setMenuOpen(false);showSettings();}} style={{width:"100%",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:600,color:C.ink}}>⚙ Settings</button>
              </div>
            )}
          </div>
        );
      })()}

      {/* HERO */}
      {(()=>{
        const heroLines=rounds===0?["Rate your Charleston. Track your improvement.","Challenge your Mahj club."]:
          [["The tiles don't lie.","Show up and find out."],["One hand. One shot.","Better than yesterday?"],["Your Charleston is a muscle.","Today is a rep."],["Same deal. Every player.","What will you do with it?"],["The table is set.","Come back stronger."],["Your instincts are sharper today.","Prove it."],["Yesterday's rack is gone.","Today's is yours."],["Train. Score. Improve.","That's the whole game."],["Two minutes.","Your best Charleston yet?"],["Every pass is a choice.","Make good ones."]][getDayNum()%10];
        const [l1,l2]=Array.isArray(heroLines)?heroLines:heroLines;
        return(
          <div style={{textAlign:"center",padding:"30px 0 10px"}}>
            <div className="rk-float" style={{fontSize:40,marginBottom:10,lineHeight:1}}>🀄</div>
            <h1 style={{fontFamily:F.d,fontSize:48,color:C.ink,margin:"0 0 6px",fontWeight:900,letterSpacing:-2.5,lineHeight:1}}>Rackle</h1>
            <p style={{fontFamily:F.d,fontSize:16,color:C.jade,margin:"0 0 10px",fontWeight:600,fontStyle:"italic",letterSpacing:0.3}}>The Daily Mahjong Workout.</p>
            <p style={{fontSize:11,color:C.mut,margin:"0 0 2px",lineHeight:1.6}}>{l1}</p>
            <p style={{fontSize:11,color:C.mut,margin:0,lineHeight:1.6,fontWeight:600}}>{l2}</p>
          </div>
        );
      })()}

      {/* FIRST-VISIT — prominent start here card */}
      {rounds===0&&!ST.get("tutorialDismissed",false)&&(()=>{
        const dismiss=()=>{ST.set("tutorialDismissed",true);};
        return(
          <div className="rk-in" style={{borderRadius:20,overflow:"hidden",marginBottom:16,marginTop:4,boxShadow:"0 8px 32px rgba(27,125,78,0.12),0 2px 8px rgba(0,0,0,0.06)"}}>
            {/* Lighter hero panel */}
            <div style={{background:"linear-gradient(160deg,#1B7D4E 0%,#156B42 55%,#0F5535 100%)",padding:"28px 20px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              {/* Decorative tile watermark */}
              <div aria-hidden style={{position:"absolute",right:-18,top:-18,fontSize:110,opacity:0.06,lineHeight:1,userSelect:"none",transform:"rotate(12deg)"}}>🀄</div>
              <div aria-hidden style={{position:"absolute",left:-14,bottom:-10,fontSize:80,opacity:0.06,lineHeight:1,userSelect:"none",transform:"rotate(-8deg)"}}>🀄</div>

              {/* Badge */}
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 14px",marginBottom:18}}>
                <span style={{fontSize:9,color:"rgba(255,255,255,0.8)",letterSpacing:2,fontWeight:700}}>AMERICAN MAHJONG · 2026 NMJL</span>
              </div>

              <div style={{fontFamily:F.d,fontSize:28,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1.1,marginBottom:8}}>Train your Charleston.<br/><span style={{color:"#E8B84B"}}>Own the table.</span></div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",lineHeight:1.7,maxWidth:260,margin:"0 auto 24px"}}>Deal. Pass. Score your IQ. Compare with your club — and players across the country.</div>

              {/* Three features */}
              <div style={{display:"flex",gap:8,marginBottom:24}}>
                {[
                  {icon:"📅",label:"Fresh Deal",sub:"Same 13 tiles for every player. One shot, daily."},
                  {icon:"🧠",label:"IQ Scored",sub:"Every pass judged. Find out if you're actually good."},
                  {icon:"🏆",label:"Beat Your Club",sub:"Auto-posts your score. The leaderboard is live."},
                ].map((f,i)=>(
                  <div key={i} style={{flex:1,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:6}}>{f.icon}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.97)",fontWeight:800,lineHeight:1.25,marginBottom:5,fontFamily:F.d}}>{f.label}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontWeight:500,lineHeight:1.5}}>{f.sub}</div>
                  </div>
                ))}
              </div>

              {/* Primary CTA */}
              <button onClick={()=>{dismiss();go("daily");}}
                style={{width:"100%",padding:"15px 0",borderRadius:14,border:"none",cursor:"pointer",
                  background:"#fff",
                  fontFamily:F.d,fontSize:16,fontWeight:900,color:C.jade,
                  letterSpacing:0.3,marginBottom:10,
                  boxShadow:"0 4px 20px rgba(0,0,0,0.12)"}}>
                Play Today's Daily →
              </button>

              {/* Secondary CTA */}
              <button onClick={()=>{dismiss();showTutorial();}}
                style={{width:"100%",padding:"11px 0",borderRadius:12,cursor:"pointer",
                  background:"rgba(255,255,255,0.1)",
                  border:"1px solid rgba(255,255,255,0.2)",
                  fontFamily:F.b,fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>
                How does it work?
              </button>
            </div>

            {/* Light footer strip */}
            <div style={{background:C.bg,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <span style={{fontSize:10,color:C.mut}}>Free · Same hand for every player · Resets daily at midnight</span>
            </div>
          </div>
        );
      })()}

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,marginTop:16}}>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.bdr})`}}/>
        <div style={{display:"flex",alignItems:"center",gap:6,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 12px"}}>
          <span style={{fontSize:10}}>📅</span>
          <span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>PLAY</span>
        </div>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.bdr},transparent)`}}/>
      </div>

      {!dDone?(
        <>
        {/* Yesterday personalised nudge */}
        {ydIQ&&rounds>1&&<div style={{display:"flex",alignItems:"center",gap:8,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:10,padding:"8px 12px",marginBottom:8}}>
          <span style={{fontSize:14,flexShrink:0}}>{ydIQ>=80?"🔥":ydIQ>=60?"👊":"💪"}</span>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>
            Yesterday you scored <strong style={{color:C.ink}}>{ydIQ}</strong>
            {weekDelta!=null&&<span style={{color:weekDelta>=0?C.jade:C.cinn,fontWeight:700}}> · {weekDelta>=0?"↑":""}{weekDelta} vs last week</span>}
            <span style={{color:C.jade,fontWeight:600}}> — today's a chance to go higher.</span>
          </div>
        </div>}
        <div style={{borderRadius:18,overflow:"hidden",boxShadow:"0 8px 32px rgba(27,125,78,0.3)",marginBottom:12}}>
        <button onClick={()=>go("daily")} aria-label={`Play Daily Rackle challenge number ${getDayNum()}`} style={{width:"100%",padding:"24px 20px",border:"none",cursor:"pointer",marginBottom:0,background:"linear-gradient(135deg,#1B7D4E,#0F5535)",color:"#fff",display:"flex",alignItems:"center",gap:16,textAlign:"left"}}>
          <div aria-hidden="true" style={{width:52,height:52,borderRadius:15,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>📅</div>
          <div>
            <div style={{fontSize:11,opacity:0.75,letterSpacing:2,fontWeight:700,marginBottom:5}}>TODAY'S CHALLENGE</div>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:800,marginBottom:6}}>Daily Rackle #{dn}</div>
            <div style={{fontSize:12,opacity:0.85}}>Same deal for every player. One shot.</div>
            <div style={{fontSize:11,opacity:0.65,marginTop:4}}>Compare your Charleston with your whole club.</div>
          </div>
        </button>
        {/* Live daily stats strip */}
        {(()=>{
          if(!ds&&!clubPlayers)return null;
          const topIQ=ds?.max||null;
          const items=[
            ...(ds?[{label:"playing today",value:ds.total}]:[]),
            ...(topIQ?[{label:"top IQ",value:topIQ,highlight:true}]:[]),
            ...(ds?[{label:"avg IQ",value:ds.avg}]:[]),
          ];
          return(
            <div style={{overflow:"hidden"}}>
              {clubPlayers>0&&club&&<div style={{background:C.jade+"18",padding:"6px 14px",textAlign:"center"}}>
                <span style={{fontSize:10,fontWeight:700,color:C.jade}}>🀄 {clubPlayers} {clubPlayers===1?"player":"players"} from {club.name} {clubPlayers===1?"has":"have"} played today</span>
              </div>}
              {items.length>0&&<div style={{display:"flex",gap:0,background:C.jade+"10"}}>
                {items.map((item,i)=>(
                  <div key={i} style={{flex:1,padding:"7px 0",textAlign:"center",borderRight:i<items.length-1?`1px solid ${C.jade}15`:"none"}}>
                    <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:item.highlight?C.jade:C.ink,lineHeight:1}}>{item.value}</div>
                    <div style={{fontSize:9,color:C.mut,letterSpacing:1,fontWeight:600,marginTop:2}}>{item.label}</div>
                  </div>
                ))}
              </div>}
            </div>
          );
        })()}
        </div>
        </>
      ):(()=>{
        const ydComp=yd&&dRes&&iq&&yd.iq?(iq.totalScore>yd.iq.totalScore?{label:"Better than yesterday",icon:"⬆️"}:iq.totalScore===yd.iq.totalScore?{label:"Same as yesterday",icon:"➡️"}:{label:"Yesterday was stronger",icon:"⬇️"}):null;
        return(
          <div style={{borderRadius:20,overflow:"hidden",marginBottom:8,boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
            {/* STREAK HEADER — collapsible strip, light bg sits above dark hero */}
            {streak>0&&!settings?.hideStreak&&(()=>{
              const firstName=profile?.nickname?profile.nickname.split(" ")[0]:null;
              const nextBadge=STREAK_BADGES.find(b=>b.days>streak);
              const pct=nextBadge?Math.round((streak/nextBadge.days)*100):100;
              const daysLeft=nextBadge?nextBadge.days-streak:0;
              const hist=getHist().filter(e=>e.iqScore!=null).slice(-7);
              const hasSparkline=hist.length>=3;
              const scores=hist.map(e=>e.iqScore);
              const spkMin=hasSparkline?Math.max(0,Math.min(...scores)-10):0;
              const spkMax=hasSparkline?Math.min(100,Math.max(...scores)+10):100;
              const spkRange=spkMax-spkMin||1;
              const W=260,H=38,pad=4;
              const iW=hasSparkline?(W-pad*2)/(scores.length-1):0;
              const pts=hasSparkline?scores.map((s,i)=>[pad+i*iW,H-pad-((s-spkMin)/spkRange)*(H-pad*2)]):[];
              const polyline=pts.map(([x,y])=>`${x},${y}`).join(" ");
              const delta=hasSparkline&&scores.length>=2?scores[scores.length-1]-scores[scores.length-2]:0;
              const trendCol=delta>0?C.jade:delta<0?C.cinn:C.mut;
              const avg=hasSparkline?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
              const improving=hasSparkline&&scores[scores.length-1]>scores[0];
              return(
                <div style={{background:`#FDFAF6`,borderBottom:`1px solid ${C.bdr}`}}>
                  {/* Tappable header row */}
                  <button onClick={()=>setStreakOpen(o=>!o)} aria-expanded={streakOpen}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",minHeight:44}}>
                    <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.gold}30,${C.gold}18)`,border:`1px solid ${C.gold}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🔥</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#5C3D00",fontFamily:F.b,lineHeight:1.3}}>
                        {(()=>{
                          const n=firstName?` ${firstName}`:"";
                          if(streak===1){
                            const hadStreak=getHist().filter(e=>e.mode==="daily").length>1;
                            return hadStreak
                              ?`We go again${n}. Today is day one 🀄`
                              :`You showed up today${n}. That's how it starts. 🀄`;
                          }
                          if(streak===2)return`2 days in a row${n} — momentum is building 🔥`;
                          if(streak===3)return`3-day streak${n}! Hat trick. Keep going ›`;
                          if(streak<=6)return`${streak} days straight${n} — your tiles are getting sharper 🎯`;
                          if(streak===7)return`One full week${n}! You're a regular now 🏅`;
                          if(streak<=13)return`${streak}-day streak${n} — the Charleston is in your blood now`;
                          if(streak===14)return`Two weeks straight${n}. Seriously impressive 💪`;
                          if(streak<=29)return`${streak} days${n} — you're building something real here 🔥`;
                          if(streak===30)return`30 days${n}. One month. Actual legend behaviour 🏆`;
                          if(streak<=39)return`${streak} days${n} — most people quit by now. Not you 💎`;
                          if(streak===40)return`40 days${n}. You've crossed into habit territory now 🧠`;
                          if(streak<=49)return`${streak} days${n} — Rackle is part of your routine now 🀄`;
                          if(streak===50)return`50 days${n}. Half a century. Your tiles know what they're doing 🔥`;
                          if(streak<=59)return`${streak} days${n} — your Charleston reads are sharper than ever 🎯`;
                          if(streak===60)return`60 days${n}. Two months strong. The table respects you 🏅`;
                          if(streak<=69)return`${streak} days${n} — quietly unstoppable 💪`;
                          if(streak===70)return`70 days${n}. Seventy. We're in rarified air now 🌟`;
                          if(streak<=79)return`${streak} days${n} — your rack reads itself at this point 🀄`;
                          if(streak===80)return`80 days${n}. The Charleston runs through your veins 🔥`;
                          if(streak<=89)return`${streak} days${n} — legends are built one deal at a time 🏆`;
                          if(streak===90)return`90 days${n}. Three months. You are the Daily Rackle 💎`;
                          if(streak<=99)return`${streak} days${n} — so close to triple digits. Don't stop now 👀`;
                          if(streak===100)return`100 days${n}. One. Hundred. Days. That's all we can say 🏆🏆`;
                          if(streak<=149)return`${streak} days${n} — at this point Rackle should pay you 💎`;
                          if(streak===150)return`150 days${n}. Five months straight. You are an icon 🌟`;
                          if(streak<=199)return`${streak} days${n} — the tiles genuinely fear you now 🀄🔥`;
                          if(streak===200)return`200 days${n}. Two hundred. We've run out of words 🏆💎`;
                          return`${streak} days${n} · ${streakBadge?streakBadge.title:"All-time great"} 🐐`;
                        })()}
                      </div>
                      {!streakOpen&&nextBadge&&<div style={{marginTop:5,height:3,borderRadius:2,background:C.gold+"25",overflow:"hidden",maxWidth:120}}>
                        <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${C.gold},#C99F3A)`,width:`${pct}%`}}/>
                      </div>}
                    </div>
                    <span style={{fontSize:11,color:C.gold,opacity:0.8,flexShrink:0,display:"inline-block",transition:"transform 0.2s",transform:streakOpen?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
                  </button>

                  {/* Expanded body */}
                  {streakOpen&&(
                    <div style={{padding:"0 14px 14px"}} className="rk-in">
                      {nextBadge?(
                        <>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                            <div style={{fontSize:9,color:C.mut,letterSpacing:1.5,fontWeight:700}}>NEXT BADGE</div>
                            <div style={{fontSize:11,color:C.mut}}>{daysLeft} day{daysLeft!==1?"s":""} to {nextBadge.badge} <strong style={{color:C.ink}}>{nextBadge.title}</strong></div>
                          </div>
                          <div style={{height:5,borderRadius:3,background:C.bdr,overflow:"hidden",marginBottom:12,position:"relative"}}>
                            <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.gold},#C99F3A)`,width:`${pct}%`,transition:"width 0.6s ease"}}/>
                          </div>
                        </>
                      ):(
                        <div style={{fontSize:11,color:C.mut,marginBottom:10}}>Every badge unlocked — keep it alive! 💎</div>
                      )}

                      {hasSparkline&&(
                        <div style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.bdr}`}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>LAST {scores.length} GAMES</div>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{fontSize:9,color:C.mut}}>avg <strong style={{color:C.ink}}>{avg}</strong></span>
                              {delta!==0&&<span style={{fontSize:9,fontWeight:700,color:trendCol}}>{delta>0?`+${delta}`:`${delta}`}</span>}
                            </div>
                          </div>
                          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible",display:"block"}}>
                            <defs>
                              <linearGradient id="hSpkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={C.jade} stopOpacity="0.12"/>
                                <stop offset="100%" stopColor={C.jade} stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            <polygon points={`${pts[0][0]},${H} ${polyline} ${pts[pts.length-1][0]},${H}`} fill="url(#hSpkGrad)"/>
                            <polyline points={polyline} fill="none" stroke={C.jade} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
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
                            <div style={{fontSize:9,color:C.mut,fontStyle:"italic"}}>
                              {improving?"Trending up — keep the momentum.":"Consistency wins. Keep showing up daily."}
                            </div>
                            <button onClick={showStats} style={{background:"none",border:"none",fontSize:9,color:C.jade,fontWeight:700,cursor:"pointer",padding:0,flexShrink:0,marginLeft:8}}>Full stats →</button>
                          </div>
                          {weekDelta!=null&&<div style={{marginTop:8,padding:"6px 10px",borderRadius:8,background:weekDelta>=0?C.jade+"08":C.cinn+"06",border:`1px solid ${weekDelta>=0?C.jade+"20":C.cinn+"20"}`}}>
                            <span style={{fontSize:10,color:weekDelta>=0?C.jade:C.cinn,fontWeight:700}}>
                              {weekDelta>=0?`↑ Up ${weekDelta} IQ pts vs last week — you're improving`:`↓ Down ${Math.abs(weekDelta)} IQ pts vs last week — keep at it`}
                            </span>
                          </div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
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
              {/* ydComp shown alone now */}
              {ydComp&&<div style={{marginTop:14,display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"4px 12px"}}>
                  <span style={{fontSize:11}}>{ydComp.icon}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:600}}>{ydComp.label}</span>
                </div>
              </div>}
            </div>
            {/* ACTIONS */}
            <div style={{background:C.bg,padding:"14px 16px 16px",borderTop:`1px solid ${C.bdr}`}}>
              <div style={{marginBottom:10}}>
                <ShareButton text={shareText} variant="jadepill" label="Share My Score" sublabel="Tap to copy · drop it in your group chat"/>
              </div>
              <button onClick={showScorecard} style={{width:"100%",borderRadius:10,background:"none",border:`1px solid ${C.bdr}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",textAlign:"left"}}>
                <span style={{fontSize:11,fontWeight:600,color:C.mut,letterSpacing:0.2}}>View Full Scorecard · IQ breakdown · Coach Mode</span>
                <span style={{fontSize:13,color:C.mut,flexShrink:0}}>›</span>
              </button>
            </div>
          </div>
        );
      })()}

      {dDone&&<MidnightCountdown dn={dn}/>}

      {/* SOCIAL PROOF STRIP — always visible, before practice button */}
      {(ds||clubPlayers)&&(()=>{
        const parts=[];
        if(ds?.total)parts.push({icon:"🟢",text:`${ds.total} ${ds.total===1?"player":"players"} today`});
        if(ds?.avg)parts.push({icon:"📊",text:`Avg IQ ${ds.avg}`});
        if(clubPlayers&&club)parts.push({icon:"🀄",text:`${clubPlayers} from ${club.name}`,action:()=>setScreen("leaderboard")});
        if(parts.length===0)return null;
        return(
          <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:14,borderRadius:12,overflow:"hidden",border:`1px solid ${C.bdr}`,background:"#fff"}}>
            {parts.map((p,i)=>(
              <div key={i} onClick={p.action||undefined}
                style={{flex:1,padding:"9px 6px",textAlign:"center",borderRight:i<parts.length-1?`1px solid ${C.bdr}`:"none",cursor:p.action?"pointer":undefined,background:p.action?C.sage:"#fff"}}>
                <div style={{fontSize:10,fontWeight:700,color:p.action?C.sageB:C.ink,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  <span style={{marginRight:4}}>{p.icon}</span>{p.text}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <button onClick={()=>go("free")} aria-label="Play Practice Mode" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:20,borderRadius:16,padding:"14px 16px",textAlign:"left",background:dDone?`linear-gradient(135deg,${C.jade}18,${C.jade}08)`:`linear-gradient(135deg,${C.cinn}05,#fff)`,border:`1.5px solid ${dDone?C.jade+"40":C.cinn+"20"}`}}>
        <div aria-hidden="true" style={{width:48,height:48,borderRadius:14,background:dDone?`linear-gradient(135deg,${C.jade},#115C38)`:`linear-gradient(135deg,${C.cinn}20,${C.cinn}10)`,border:`1px solid ${dDone?C.jade+"60":C.cinn+"20"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:dDone?`0 4px 14px ${C.jade}30`:"none"}}>🀄</div>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:dDone?C.jade:C.cinn,letterSpacing:2,fontWeight:700,marginBottom:3}}>{dDone?"KEEP TRAINING · UNLIMITED":"UNLIMITED PLAY"}</div>
          <div style={{fontFamily:F.d,fontSize:17,fontWeight:900,color:dDone?C.jade:C.ink,marginBottom:3,lineHeight:1.1}}>{dDone?"Practice Mode":"Practice Mode"}</div>
          <div style={{fontSize:11,color:dDone?C.jade+"CC":C.mut,lineHeight:1.5}}>{dDone?"Another rep. Tomorrow you'll feel it.":"Unlimited hands. Build instincts for every section."}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}}>
          <span aria-hidden="true" style={{fontSize:16,color:dDone?C.jade:C.mut,fontWeight:700}}>›</span>
        </div>
      </button>

      <div style={{marginBottom:20}}/>

      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,marginTop:8}}>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.bdr})`}}/>
        <div style={{display:"flex",alignItems:"center",gap:6,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 12px"}}>
          <span style={{fontSize:10}}>🀄</span>
          <span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>COMMUNITY</span>
        </div>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.bdr},transparent)`}}/>
      </div>

      <div style={{marginBottom:8,borderRadius:12,overflow:"hidden",border:`1px solid ${C.bdr}`}}>
        <GlobalLeaderboardPill setScreen={setScreen}/>
        <ClubCodeEntry onJoin={()=>setScreen("leaderboard")} setScreen={setScreen}/>
        <InlineCodeEntry setScreen={setScreen}/>
      </div>

      {/* GET YOUR CLUB ON RACKLE — only shown to players not in a club */}
      {!getClubCode()&&(()=>{
        const addClubEmail="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20";
        return(
          <div style={{margin:"24px -32px 8px",background:"linear-gradient(135deg,#F2FAF6,#EAF5EF)",padding:"20px 32px 18px",borderTop:`1px solid ${C.jade}20`,borderBottom:`1px solid ${C.jade}20`}}>
            <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:6}}>FOR CLUB ORGANISERS</div>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,lineHeight:1.2,marginBottom:8}}>Your club should be on Rackle</div>
            <div style={{fontSize:12,color:C.mut,lineHeight:1.65,marginBottom:14}}>Your group is probably already playing. Get your club its own leaderboard — free, takes 2 minutes. Every member's score posts automatically after each Daily.</div>
            <div style={{display:"flex",gap:8}}>
              <a href={addClubEmail} style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",padding:"12px 0",borderRadius:11,background:`linear-gradient(135deg,${C.jade},#115C38)`,color:"#fff",fontSize:13,fontWeight:700,fontFamily:F.d,textDecoration:"none",letterSpacing:0.3}}>Add my club →</a>
              <button onClick={()=>setScreen("clubs")} style={{flex:1,padding:"12px 0",borderRadius:11,border:`1px solid ${C.jade}30`,background:"#fff",color:C.jade,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b}}>Join a club</button>
            </div>
          </div>
        );
      })()}

      <div style={{marginTop:20,marginBottom:8}}>
            <button onClick={()=>setLeOpen(o=>!o)} aria-expanded={leOpen}
              style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,background:leOpen?`linear-gradient(135deg,${C.jade}18,${C.jade}0C)`:`linear-gradient(135deg,${C.jade}10,${C.jade}06)`,border:`1.5px solid ${C.jade}30`,borderRadius:leOpen?"12px 12px 0 0":12,cursor:"pointer",padding:"12px 14px",textAlign:"left",transition:"background 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:C.jade+"20",border:`1px solid ${C.jade}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>📚</div>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:C.jade,fontFamily:F.b,letterSpacing:0.2}}>Learn & Explore</div>
                  {!leOpen&&<div style={{fontSize:10,color:C.jade,opacity:0.7,marginTop:1}}>Tutorial · Card guide · Stats · How to play</div>}
                </div>
              </div>
              <span style={{fontSize:13,color:C.jade,opacity:0.7,transition:"transform 0.2s",display:"inline-block",transform:leOpen?"rotate(180deg)":"rotate(0deg)",flexShrink:0}}>▾</span>
            </button>

            {leOpen&&<div className="rk-in" style={{border:`1.5px solid ${C.jade}30`,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",background:"#fff",padding:"12px 12px 4px"}}>
      <button onClick={showStats} style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:8,borderRadius:16,padding:"14px 16px",textAlign:"left",background:"#2460A806",border:`1px solid #2460A825`}}>
        <div style={{width:44,height:44,borderRadius:13,background:"#2460A810",border:`1px solid #2460A820`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📊</div>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:"#2460A8",letterSpacing:2,fontWeight:700,marginBottom:5}}>YOUR STATS</div>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,marginBottom:5}}>How Am I Doing?</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>Last 5 scores · Tendencies & section mastery</div>
        </div>
        <span aria-hidden="true" style={{fontSize:14,color:C.mut,fontWeight:600}}>›</span>
      </button>

      <button onClick={showTutorial} style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,border:`1px solid ${C.jade}25`,background:C.jade+"06",textAlign:"left",marginBottom:8}}>
        <div style={{width:44,height:44,borderRadius:13,background:C.jade+"12",border:`1px solid ${C.jade}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🎓</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:9,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:5}}>WALKTHROUGH</div>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,lineHeight:1.2,marginBottom:5}}>Interactive Tutorial</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>Learn Rackle step by step</div>
        </div>
        <span style={{fontSize:14,color:C.jade,fontWeight:700,flexShrink:0}}>›</span>
      </button>

      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={showCardGuide} style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${C.gold}25`,background:C.gold+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>📋</span>
          <div style={{fontSize:9,color:C.gold,letterSpacing:1.5,fontWeight:700}}>2026 NMJL</div>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,lineHeight:1.2}}>Card Guide</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.35,marginTop:1}}>Hold & pass tips</div>
        </button>
        <button onClick={()=>setShowHelp(!showHelp)} aria-expanded={showHelp} style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${showHelp?C.gold+"40":C.gold+"25"}`,background:C.gold+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>📖</span>
          <div style={{fontSize:9,color:C.gold,letterSpacing:1.5,fontWeight:700}}>LEARN</div>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,lineHeight:1.2}}>How to Play</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.35,marginTop:1}}>Rules & scoring</div>
        </button>
      </div>

      {/* WHY PLAY RACKLE — collapsible */}
      <div style={{borderRadius:16,border:`1px solid ${C.jade}25`,background:C.jade+"06",marginBottom:8,overflow:"hidden"}}>
            <button onClick={()=>setWhyOpen(o=>!o)} aria-expanded={whyOpen}
              style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:44,height:44,borderRadius:13,background:C.jade+"12",border:`1px solid ${C.jade}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🀄</div>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:7}}>THE CASE FOR RACKLE</div>
                <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:C.ink,lineHeight:1.2,marginBottom:6}}>Why play Rackle?</div>
                <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>The fastest way to get better at American Mahjong</div>
              </div>
              <span style={{fontSize:14,color:C.jade,fontWeight:700,flexShrink:0}}>{whyOpen?"▾":"›"}</span>
            </button>
            {whyOpen&&<div style={{background:"#FFFFF8",borderTop:`1px solid ${C.jade}15`,padding:"16px 16px 4px"}} className="rk-in">
              {[
                {icon:"🧠",title:"Build real instincts, not just rules",body:"Knowing the card and actually feeling what to pass are two different things. Rackle puts you through the Charleston over and over — the same decision-making muscle you use in live games — until the right move becomes automatic."},
                {icon:"📅",title:"Trained to the 2026 NMJL card",body:"Every hand, every section, every hold/pass recommendation is built directly from the 2026 card. When the card updates each year, Rackle updates with it. You're always practising the real thing."},
                {icon:"⏱️",title:"Two minutes between games",body:"You don't need a full four-player table. A Daily takes under two minutes — deal, pass, score, done. It's the rep you put in on the train, on your lunch break, or the night before game night."},
                {icon:"📈",title:"See yourself improve",body:"Your Charleston IQ score tracks across every Daily. You'll notice your Direction score climbing as you get faster at reading your rack, and your Pass Quality rising as you stop giving away tiles you needed."},
                {icon:"🏆",title:"Play with your club, not just against it",body:"The global and club leaderboards mean every Daily is a shared experience. Your friends are playing the exact same hand — compare scores, talk about what you passed, and learn from each other between real games."},
                {icon:"🌸",title:"Flowers, Jokers, Soap — no guessing",body:"Rackle's section coaching explains exactly why Flowers matter for 2468 but not 2026, why Jokers are worthless in Singles & Pairs, and why Soap is your most flexible tile in the year hand. Understanding the why sticks far longer than memorising the what."},
              ].map((b,i,arr)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:i<arr.length-1?20:16,paddingBottom:i<arr.length-1?20:0,borderBottom:i<arr.length-1?`1px solid ${C.jade}12`:"none",alignItems:"flex-start"}}>
                  <div style={{width:38,height:38,borderRadius:11,background:C.jade+"12",border:`1px solid ${C.jade}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,marginTop:1}}>{b.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:5,lineHeight:1.3}}>{b.title}</div>
                    <div style={{fontSize:11,color:C.mut,lineHeight:1.7}}>{b.body}</div>
                  </div>
                </div>
              ))}
            </div>}
          </div>
            </div>}
      </div>

      {showHelp&&<div style={{background:"#FFFFF8",border:`1px solid ${C.gold}25`,borderRadius:16,marginBottom:8,overflow:"hidden"}} className="rk-in">

        {/* HOW TO PLAY steps */}
        <div style={{padding:"16px 16px 4px"}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:12}}>THE CHARLESTON</div>
          {[
            {title:"You're dealt 13 tiles",body:"At the start of each round you receive 13 tiles — a mix of numbers (Bam, Crak, Dot), Winds, Dragons, Flowers, and possibly Jokers. A timer starts the moment your hand appears."},
            {title:"Pass Right — 3 tiles",body:"You must pass exactly 3 tiles to the player on your right. Pick your 3 weakest tiles for your target section. You cannot pass Jokers at any point in the Charleston."},
            {title:"Pass Across — 3 tiles",body:"Pass 3 tiles to the player directly opposite you. By now you've received 6 new tiles — reassess your section before deciding what to give away."},
            {title:"Pass Left — 1 to 3 tiles (blind optional)",body:"Pass 1–3 tiles to the player on your left. You can do a blind pass: place your tiles face-down before seeing what you receive. A strong blind pass protects tiles you've already committed to."},
            {title:"Second Charleston (optional)",body:"If all four players agree, a second Charleston can be played — another Right, Across, Left sequence. This is optional and any player can refuse it."},
            {title:"Courtesy Pass (optional)",body:"After the Charleston(s), each player may offer a single courtesy pass — offering 1–3 tiles face-down. The other player can take all, some, or none."},
            {title:"Pick your section & get scored",body:"After passing is complete, choose which hand section you were building toward (2468, 369, Consecutive Run, etc.). Rackle scores how well your final 13-tile rack fits that section."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<6?14:0,alignItems:"flex-start"}}>
              <div style={{width:22,height:22,borderRadius:11,background:C.jade+"15",border:`1.5px solid ${C.jade}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.jade,flexShrink:0,marginTop:1}}>{i+1}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.ink,marginBottom:3}}>{s.title}</div>
                <div style={{fontSize:11,color:C.mut,lineHeight:1.65}}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* KEY RULES */}
        <div style={{background:C.cinn+"05",borderTop:`1px solid ${C.cinn}15`,borderBottom:`1px solid ${C.cinn}15`,padding:"14px 16px"}}>
          <div style={{fontSize:9,color:C.cinn,letterSpacing:2,fontWeight:700,marginBottom:12}}>KEY RULES TO KNOW</div>
          {[
            {icon:"🃏",title:"Jokers cannot be passed",body:"Jokers are stuck in your hand for the entire Charleston. You can never pass them to another player. If you're dealt Jokers and targeting Singles & Pairs, they're dead weight — factor that in."},
            {icon:"🔒",title:"Concealed hands",body:"Some hands on the NMJL card are marked concealed — you cannot expose any tiles during the actual game. In Rackle, these hands score differently: your rack is judged on whether it fits a fully-concealed structure."},
            {icon:"🌸",title:"Flowers are not suit tiles",body:"Flowers are their own tile type — they're not Bam, Crak, or Dot. They can fill Flower slots in hands that call for them (FFF, FFFFFF, FF). They count as pairs in Singles & Pairs."},
            {icon:"🧼",title:"Soap (White Dragon) is suit-wild in 2026",body:"In the 2026 section, Soap acts as a wild tile across all three suits — it fills the '0' (zero) position in any suit. It is not interchangeable this way in other sections."},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<3?12:0,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:8,background:"#fff",border:`1px solid ${C.cinn}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{r.icon}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.ink,marginBottom:3}}>{r.title}</div>
                <div style={{fontSize:11,color:C.mut,lineHeight:1.6}}>{r.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* DAILY VS PRACTICE */}
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:12}}>DAILY vs PRACTICE</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:C.jade+"08",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.jade}15`}}>
              <div style={{fontSize:10,fontWeight:800,color:C.jade,marginBottom:5}}>Daily Rackle</div>
              <div style={{fontSize:11,color:C.mut,lineHeight:1.6}}>One hand per day. Every player receives the exact same 13 tiles — your score goes to the club leaderboard and global rankings. One shot only.</div>
            </div>
            <div style={{flex:1,background:C.cinn+"06",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.cinn}15`}}>
              <div style={{fontSize:10,fontWeight:800,color:C.cinn,marginBottom:5}}>Practice Mode</div>
              <div style={{fontSize:11,color:C.mut,lineHeight:1.6}}>Unlimited hands, any section, no pressure. Pick a specific section to drill, or go random. Great for building instincts before the daily.</div>
            </div>
          </div>
        </div>

        {/* CHARLESTON IQ section */}
        <div style={{background:C.gold+"06",borderTop:`1px solid ${C.gold}20`,borderBottom:`1px solid ${C.gold}20`,padding:"14px 16px"}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:14}}>CHARLESTON IQ · HOW IT'S SCORED</div>
          <p style={{fontSize:11,color:C.mut,lineHeight:1.55,margin:"0 0 14px"}}>Your Charleston IQ is scored out of 100 across four dimensions. Each game gives you a personalised coach note based on your strongest and weakest subscores.</p>
          {[
            {label:"Direction",max:40,icon:"🧭",desc:"The biggest slice — did your final rack commit to one section? Holding tiles scattered across multiple sections is the most common mistake. Picking your section early and passing against it pays off most here."},
            {label:"Tile Strength",max:25,icon:"💪",desc:"How structurally strong was your final rack? Pairs, pungs, kongs, Jokers, and Flowers in the right section all add strength. Isolated singles with no grouping potential drag this score down."},
            {label:"Pass Quality",max:25,icon:"🔄",desc:"Did you pass the right tiles? Passing a tile your section needs, or breaking a pair you should have protected, costs you here. Passing Jokers (which you can't do) or Flowers when your section wants them also count against you."},
            {label:"Timing",max:10,icon:"⏱",desc:"8–20 seconds per pass is the sweet spot — enough time to read your rack without overthinking. Passing in under 3 seconds suggests you're not fully evaluating options. Over 30 seconds per pass is too slow."},
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
          <p style={{fontSize:11,color:C.mut,lineHeight:1.55,margin:"0 0 12px"}}>Each result includes a personalised coach note based on your strongest and weakest subscores.</p>
          {[
            {range:"90–100",level:"Mahjong Master",color:C.jade,bg:C.jade+"10",note:"Elite read, clean passes, strong rack."},
            {range:"80–89",level:"Skilled Player",color:C.jade,bg:C.jade+"08",note:"Solid all-round with one area to sharpen."},
            {range:"70–79",level:"Game Ready",color:"#2460A8",bg:"#2460A810",note:"On the right track — execution needs tightening."},
            {range:"60–69",level:"Getting There",color:C.gold,bg:C.gold+"10",note:"Right instincts but one dimension is dragging the score."},
            {range:"<60",level:"Keep Going, Rookie",color:C.cinn,bg:C.cinn+"08",note:"Focus on picking a section before your first pass."},
          ].map((l,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:l.bg,marginBottom:i<4?4:0}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:l.color,fontFamily:F.d}}>{l.level}</div>
                <div style={{fontSize:10,color:l.color,opacity:0.75,marginTop:2}}>{l.note}</div>
              </div>
              <span style={{fontSize:10,color:l.color,fontWeight:700,opacity:0.8,flexShrink:0,marginLeft:8}}>{l.range}</span>
            </div>
          ))}
          <button onClick={showTutorial} style={{marginTop:14,width:"100%",background:"none",border:`1px solid ${C.gold}30`,borderRadius:10,padding:"9px 12px",fontSize:12,color:C.gold,cursor:"pointer",fontWeight:600,fontFamily:F.d}}>📖 Full interactive tutorial →</button>
        </div>

      </div>}

      <Footer/>
    </div>
    </>
  );
}

function Pill({i,v,l,hl}){return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}} aria-label={`${l}: ${v}`}><span aria-hidden="true" style={{fontSize:12}}>{i}</span><div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{v}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{l}</div></div></div>);}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats({home,onShowScorecard,onRecap,dRes,setScreen}){
  const [spOpen,setSpOpen]=useState(false);
  const [ckOpen,setCkOpen]=useState(false);
  const dn=getDayNum();
  const iq=dRes?.iq;
  const allHist=getHist().filter(e=>e.iqScore!=null);
  const hasData=allHist.length>0;

  // ── Derived data ──────────────────────────────────────────────────────────
  const dailyHist=allHist.filter(e=>e.mode==="daily");
  const practiceHist=allHist.filter(e=>e.mode!=="daily");
  const last10=allHist.slice(-10);
  const streak=ST.get("str",0);
  const bestIQ=allHist.length?Math.max(...allHist.map(e=>e.iqScore)):0;
  const dailyAvg=dailyHist.length?Math.round(dailyHist.reduce((a,e)=>a+e.iqScore,0)/dailyHist.length):null;
  const practiceAvg=practiceHist.length?Math.round(practiceHist.reduce((a,e)=>a+e.iqScore,0)/practiceHist.length):null;

  // Per-section stats
  const secData={};
  SECS.forEach(s=>{secData[s.id]={id:s.id,name:s.name,icon:s.icon,color:s.color,count:0,totalIQ:0,bestIQ:0,avgIQ:0,lastPlayed:null};});
  allHist.forEach(e=>{
    const sid=e.chosenSec||e.sid;
    if(sid&&secData[sid]){
      secData[sid].count++;
      secData[sid].totalIQ+=e.iqScore;
      if(e.iqScore>secData[sid].bestIQ)secData[sid].bestIQ=e.iqScore;
      if(!secData[sid].lastPlayed||e.ts>secData[sid].lastPlayed)secData[sid].lastPlayed=e.ts;
    }
  });
  Object.values(secData).forEach(s=>{if(s.count>0)s.avgIQ=Math.round(s.totalIQ/s.count);});
  const triedSections=Object.values(secData).filter(s=>s.count>0).sort((a,b)=>b.avgIQ-a.avgIQ);
  const untriedSections=Object.values(secData).filter(s=>s.count===0);

  // Sub-score trends (last 10 with iq data)
  const iqHist=allHist.filter(e=>e.iq).slice(-10);
  const avgDir=iqHist.length?Math.round(iqHist.reduce((a,e)=>a+(e.iq.directionScore||0),0)/iqHist.length):null;
  const avgPass=iqHist.length?Math.round(iqHist.reduce((a,e)=>a+(e.iq.passQualityScore||0),0)/iqHist.length):null;
  const avgTile=iqHist.length?Math.round(iqHist.reduce((a,e)=>a+(e.iq.tileStrengthScore||0),0)/iqHist.length):null;

  // Trajectory: last 3 vs prior
  const recent3=allHist.slice(-3);
  const prior=allHist.slice(0,Math.max(allHist.length-3,1));
  const recentAvg=recent3.length?recent3.reduce((a,e)=>a+e.iqScore,0)/recent3.length:null;
  const priorAvg=prior.length?prior.reduce((a,e)=>a+e.iqScore,0)/prior.length:null;
  const trajectory=recentAvg!=null&&priorAvg!=null?Math.round(recentAvg-priorAvg):null;

  // Focus area — data-driven weakest sub-score
  const focusTips={
    "Direction":"You're often not committing to a section early enough. Pick your strongest 3 tiles before your first pass and build from there.",
    "Pass Quality":"You tend to pass tiles your section needs. Before passing, ask: is this tile useful for my target section?",
    "Tile Strength":"Your final rack is lacking structure. Hold pairs and pungs over isolated singles.",
  };
  let focusLabel=null;
  if(avgDir!=null&&avgPass!=null&&avgTile!=null){
    const pcts={Direction:avgDir/40,["Pass Quality"]:avgPass/25,["Tile Strength"]:avgTile/25};
    focusLabel=Object.entries(pcts).sort((a,b)=>a[1]-b[1])[0][0];
  }

  // Best hand fit ever — scan history for highest allSections score per section
  const bestHandFits={};
  allHist.filter(e=>e.allSections&&e.allSections.length).forEach(e=>{
    e.allSections.forEach(s=>{
      if(!bestHandFits[s.id]||s.score>bestHandFits[s.id].score){
        bestHandFits[s.id]={score:s.score,ts:e.ts,iqScore:e.iqScore};
      }
    });
  });

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>

      {/* Page title */}
      <div style={{marginBottom:20,marginTop:20,textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1,marginBottom:6}}>How Am I Doing?</div>
        <div style={{fontSize:12,color:C.mut,marginTop:0}}>Your Charleston IQ over time</div>
      </div>

      {/* Today's daily hero — if played */}
      {iq&&<div style={{marginBottom:16}}>
        <IQHero iq={iq} isDaily dayNum={dn} section={dRes.section} totalTime={iq.totalTime||0} chosenSec={dRes.chosenSec} allSections={dRes.allSections}/>
        <button onClick={onShowScorecard} style={{width:"100%",marginTop:8,padding:"11px 16px",borderRadius:12,background:C.sage,border:`1px solid ${C.sageB}25`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"flex-start",gap:12}}>
          <div style={{width:34,height:34,borderRadius:9,background:C.sageB+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>📋</div>
          <div style={{textAlign:"left",flex:1}}>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:"#1A3D28",lineHeight:1,marginBottom:2}}>View Full Scorecard</div>
            <div style={{fontSize:11,color:C.sageB}}>IQ breakdown · Coach Mode</div>
          </div>
          <span style={{fontSize:14,color:C.sageB,fontWeight:700,flexShrink:0}}>›</span>
        </button>
      </div>}

      {!hasData?(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <div style={{fontSize:32,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:6}}>No games yet</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.6}}>Play a Daily or Practice round to start tracking your improvement.</div>
        </div>
      ):(
        <>
          {/* ── AT A GLANCE ── */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <div style={{flex:1,background:"#FDFAF6",border:`1px solid ${C.bdr}`,borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>GAMES</div>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,lineHeight:1}}>{allHist.length}</div>
            </div>
            <div style={{flex:1,background:C.jade+"08",border:`1px solid ${C.jade}20`,borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>BEST IQ</div>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.jade,lineHeight:1}}>{bestIQ}</div>
            </div>
            {streak>0&&<div style={{flex:1,background:C.gold+"08",border:`1px solid ${C.gold}20`,borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>STREAK</div>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.gold,lineHeight:1}}>{streak}d 🔥</div>
            </div>}
          </div>

          {/* ── IQ CHART ── */}
          {last10.length>=2&&(()=>{
            const scores=last10.map(e=>e.iqScore);
            const minS=Math.min(...scores,40);const maxS=Math.max(...scores,100);
            const range=Math.max(maxS-minS,20);
            const W=300,H=72,padX=8,padY=6;
            const pts=scores.map((s,i)=>({
              x:padX+(i/(scores.length-1))*(W-padX*2),
              y:H-padY-((s-minS)/range)*(H-padY*2),
              mode:last10[i].mode,score:s
            }));
            const dailyPts=pts.filter((_,i)=>last10[i].mode==="daily");
            const practPts=pts.filter((_,i)=>last10[i].mode!=="daily");
            const allPath=pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
            const fillPath=`${allPath} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
            const last=scores[scores.length-1];const prev=scores[scores.length-2];
            const trendCol=last>prev?C.jade:last<prev?C.cinn:C.gold;
            return(
              <div style={{...S.card,marginBottom:16,padding:"16px 14px 12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:6}}>IQ HISTORY · LAST {scores.length}</div>
                    <div style={{display:"flex",gap:10,marginTop:2}}>
                      {dailyAvg!=null&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:7,height:7,borderRadius:"50%",background:C.jade}}/><span style={{fontSize:10,color:C.ink,fontWeight:600}}>Daily {dailyAvg}</span></div>}
                      {practiceAvg!=null&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:7,height:7,borderRadius:"50%",background:C.cinn}}/><span style={{fontSize:10,color:C.ink,fontWeight:600}}>Practice {practiceAvg}</span></div>}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:F.d,fontSize:26,fontWeight:900,color:trendCol,lineHeight:1}}>{last}</div>
                    {trajectory!=null&&<div style={{fontSize:11,color:trendCol,fontWeight:700,marginTop:3}}>{trajectory>=0?`↑ +${trajectory}`:`↓ ${trajectory}`} vs avg</div>}
                    <div style={{fontSize:10,color:C.mut,marginTop:2}}>latest</div>
                  </div>
                </div>
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",overflow:"visible"}}>
                  <defs>
                    <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.jade} stopOpacity="0.08"/>
                      <stop offset="100%" stopColor={C.jade} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d={fillPath} fill="url(#sg2)"/>
                  <path d={allPath} fill="none" stroke={C.bdr} strokeWidth="1" strokeDasharray="2 2"/>
                  {pts.map((p,i)=>{
                    const isD=last10[i].mode==="daily";
                    const isLast=i===pts.length-1;
                    return(
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r={isLast?5:isD?3.5:2.5} fill={isD?C.jade:C.cinn} stroke="#fff" strokeWidth={isLast?2:1.5}/>
                        {isLast&&<text x={p.x} y={p.y-9} textAnchor="middle" fontSize="8" fontWeight="700" fill={trendCol}>{p.score}</text>}
                      </g>
                    );
                  })}
                  <text x={1} y={padY+4} fontSize="7" fill={C.mut} opacity="0.6">{maxS}</text>
                  <text x={1} y={H-2} fontSize="7" fill={C.mut} opacity="0.6">{minS}</text>
                </svg>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:9,color:C.mut}}>oldest</span>
                  <span style={{fontSize:9,color:C.mut}}>latest</span>
                </div>
              </div>
            );
          })()}

          {/* ── YOUR GAME ── */}
          {avgDir!=null&&<div style={{...S.card,marginBottom:16}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:14}}>YOUR GAME · LAST {iqHist.length} ROUNDS</div>
            {[
              {label:"Direction",score:avgDir,max:40,desc:"Committing to a section"},
              {label:"Pass Quality",score:avgPass,max:25,desc:"Passing the right tiles"},
              {label:"Tile Strength",score:avgTile,max:25,desc:"Structural rack quality"},
            ].map((sub,i,arr)=>{
              const pct=Math.round(sub.score/sub.max*100);
              const col=pct>=75?C.jade:pct>=55?"#2460A8":pct>=40?C.gold:C.cinn;
              const isFocus=focusLabel===sub.label;
              return(
                <div key={sub.label} style={{marginBottom:i<arr.length-1?16:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                    <div>
                      <span style={{fontSize:12,fontWeight:700,color:C.ink}}>{sub.label}</span>
                      {isFocus&&<span style={{fontSize:9,fontWeight:700,background:C.gold+"20",color:C.gold,borderRadius:8,padding:"1px 6px",marginLeft:6,letterSpacing:0.5}}>FOCUS</span>}
                      <div style={{fontSize:10,color:C.mut,marginTop:2}}>{sub.desc}</div>
                    </div>
                    <span style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:col}}>{sub.score}<span style={{fontSize:9,color:C.mut,fontWeight:400}}>/{sub.max}</span></span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:C.bdr,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:3,background:col,width:`${pct}%`,transition:"width 0.6s ease"}}/>
                  </div>
                </div>
              );
            })}
            {focusLabel&&<div style={{marginTop:16,background:C.amber,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.amberB}15`}}>
              <div style={{fontSize:8,color:C.amberB,letterSpacing:1.5,fontWeight:700,marginBottom:5}}>FOCUS AREA</div>
              <div style={{fontSize:12,color:C.ink,lineHeight:1.5,fontWeight:700,marginBottom:3}}>{focusLabel}</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{focusTips[focusLabel]}</div>
            </div>}
          </div>}

          {/* ── SECTION PERFORMANCE ── */}
          {(()=>{
            if(triedSections.length===0)return null;
            const maxAvg=Math.max(...triedSections.map(s=>s.avgIQ),1);
            return(
              <div style={{...S.card,marginBottom:16,padding:0,overflow:"hidden"}}>
                <button onClick={()=>setSpOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"16px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                  <div>
                    <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:5}}>SECTION PERFORMANCE</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink}}>Avg IQ by section · {triedSections.length} played</div>
                  </div>
                  <span style={{fontSize:12,color:C.mut}}>{spOpen?"▾":"▸"}</span>
                </button>
                {spOpen&&<div style={{borderTop:`1px solid ${C.bdr}`,padding:"12px 14px 14px"}} className="rk-in">
                  {triedSections.map((s,i)=>{
                    const barW=Math.round((s.avgIQ/maxAvg)*100);
                    const col=s.avgIQ>=80?C.jade:s.avgIQ>=65?"#2460A8":s.avgIQ>=50?C.gold:C.cinn;
                    return(
                      <div key={s.id} style={{marginBottom:i<triedSections.length-1?14:0}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{fontSize:15}}>{s.icon}</span>
                            <span style={{fontSize:12,fontWeight:700,color:C.ink}}>{s.name}</span>
                            <span style={{fontSize:10,color:C.mut}}>{s.count} round{s.count!==1?"s":""}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                            <span style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:col}}>{s.avgIQ}</span>
                            {s.bestIQ>s.avgIQ&&<span style={{fontSize:9,color:C.mut}}>↑{s.bestIQ}</span>}
                          </div>
                        </div>
                        <div style={{height:6,borderRadius:3,background:C.bdr,overflow:"hidden"}}>
                          <div style={{height:"100%",borderRadius:3,background:col,width:`${barW}%`}}/>
                        </div>
                      </div>
                    );
                  })}
                  {untriedSections.length>0&&<div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${C.bdr}`}}>
                    <div style={{fontSize:9,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:8}}>NOT YET TRIED ({untriedSections.length})</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {untriedSections.map(s=>(
                        <div key={s.id} style={{display:"flex",alignItems:"center",gap:5,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 10px"}}>
                          <span style={{fontSize:12}}>{s.icon}</span>
                          <span style={{fontSize:10,fontWeight:600,color:C.mut}}>{s.name}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:C.mut,marginTop:10,lineHeight:1.6}}>Practice these sections to find hidden strengths and improve your overall read speed.</div>
                  </div>}
                </div>}
              </div>
            );
          })()}

          {/* ── 2026 CARD KNOWLEDGE ── */}
          {(()=>{
            if(Object.keys(bestHandFits).length===0)return null;
            const coveredSecs=triedSections.slice(0,5);
            return(
              <div style={{...S.card,marginBottom:16,padding:0,overflow:"hidden"}}>
                <button onClick={()=>setCkOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"16px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                  <div>
                    <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:5}}>2026 CARD KNOWLEDGE</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink}}>Best rack fits per section</div>
                    <div style={{fontSize:10,color:C.mut,marginTop:3}}>How close your racks have come to real hands</div>
                  </div>
                  <span style={{fontSize:12,color:C.mut}}>{ckOpen?"▾":"▸"}</span>
                </button>
                {ckOpen&&<div style={{borderTop:`1px solid ${C.bdr}`,padding:"14px 14px"}} className="rk-in">
                  {coveredSecs.map((sec,si)=>{
                    const hands=HAND_CATALOG.filter(h=>h.sec===sec.id);
                    const bestFit=bestHandFits[sec.id];
                    const fitPct=bestFit?Math.round(bestFit.score*100):0;
                    const famColor=fitPct>=70?C.jade:fitPct>=45?C.gold:C.cinn;
                    const famLabel=fitPct>=70?"Strong fit":fitPct>=45?"Building":fitPct>=20?"Early stage":"Low exposure";
                    return(
                      <div key={sec.id} style={{marginBottom:si<coveredSecs.length-1?18:0,paddingBottom:si<coveredSecs.length-1?18:0,borderBottom:si<coveredSecs.length-1?`1px solid ${C.bdr}`:"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                          <span style={{fontSize:17}}>{sec.icon}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:800,color:C.ink}}>{sec.name}</div>
                            <div style={{fontSize:10,color:C.mut,marginTop:2}}>{hands.length} hands on the 2026 card · {sec.count} round{sec.count!==1?"s":""} played</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:9,fontWeight:700,color:famColor,letterSpacing:0.5}}>{famLabel}</div>
                            <div style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:famColor}}>{fitPct}%</div>
                          </div>
                        </div>
                        <div style={{height:5,borderRadius:3,background:C.bdr,overflow:"hidden",marginBottom:8}}>
                          <div style={{height:"100%",borderRadius:3,background:famColor,width:`${fitPct}%`}}/>
                        </div>
                        <div style={{fontSize:10,color:C.mut,lineHeight:1.6}}>
                          {fitPct>=70?`Your racks have come close to completing real ${sec.name} hands.`:
                           fitPct>=45?`Good foundation. Keep building depth in ${sec.name} — you're into realistic hand territory.`:
                           `Your ${sec.name} racks are still early stage. Focus on the section's anchor tiles.`}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{marginTop:14,background:C.jade+"06",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.jade}15`}}>
                    <div style={{fontSize:9,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:5}}>HOW THIS WORKS</div>
                    <div style={{fontSize:10,color:C.ink,lineHeight:1.6}}>Each % shows how close your best-ever rack came to completing a real hand from the 2026 NMJL card. 70%+ means you've built racks that were genuinely close to winning.</div>
                  </div>
                </div>}
              </div>
            );
          })()}

          {/* ── NEXT PRACTICE ── */}
          {(()=>{
            let rec=null,recReason="";
            const weakest=triedSections.length?[...triedSections].sort((a,b)=>a.avgIQ-b.avgIQ)[0]:null;
            if(untriedSections.length>0){
              rec=untriedSections[0];
              recReason=`You haven't practised ${rec.name} yet — blind spots are where the most improvement hides.`;
            } else if(weakest&&weakest.avgIQ<70){
              rec=SECS.find(s=>s.id===weakest.id);
              recReason=`Your avg IQ in ${weakest.name} is ${weakest.avgIQ} — your weakest section. Focused reps here will lift your overall read speed fastest.`;
            } else if(weakest){
              const best=triedSections[0];
              rec=SECS.find(s=>s.id===best.id);
              recReason=`${best.name} is your strongest section at avg IQ ${best.avgIQ}. Keep sharpening it — consistency at your ceiling matters.`;
            }
            if(!rec)return null;
            return(
              <div style={{...S.card,marginBottom:16,background:"linear-gradient(145deg,#FFFFF8,#F8F4EB)",borderColor:C.gold+"25"}}>
                <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:12}}>🎯 NEXT PRACTICE</div>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:rec.color+"12",border:`1px solid ${rec.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{rec.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:800,color:C.ink,marginBottom:6}}>{rec.name}</div>
                    <div style={{fontSize:11,color:C.mut,lineHeight:1.6}}>{recReason}</div>
                  </div>
                </div>
              </div>
            );
          })()}
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
        <div style={{padding:"16px 20px 20px",background:C.bg}}>
          <button onClick={onReady} style={{width:"100%",padding:"15px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:0.3,cursor:"pointer",boxShadow:`0 4px 14px rgba(27,125,78,0.35)`,marginBottom:10}}>{isChallenge?"Accept Challenge →":"Yes! Let's Play →"}</button>
          <button onClick={onHome} style={{width:"100%",padding:"9px 0",borderRadius:10,border:"none",background:"none",color:C.mut,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:F.b}}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}

function Game({mode,home,onDone,settings,setScreen}){
  const [phase,setPhase]=useState("deal");
  const [ready,setReady]=useState(false);
  const [flipped,setFlipped]=useState([]);
  const [hand,setHand]=useState([]);const [pool,setPool]=useState([]);
  const [startingRack,setStartingRack]=useState([]);
  const [sel,setSel]=useState([]);const [passed,setPassed]=useState([]);
  const [passLog,setPassLog]=useState([]);
  const [newIdx,setNewIdx]=useState([]);const [jw,setJw]=useState(false);
  const [chosenSec,setChosenSec]=useState(null);const [chosenHand,setChosenHand]=useState(null);const [showRef,setShowRef]=useState(false);
  const [showHint,setShowHint]=useState(false);const [hintExp,setHintExp]=useState(null);
  const [cn,setCn]=useState(1);const [pi,setPi]=useState(0);
  const [st,setSt]=useState(null);const [el,setEl]=useState(0);const [td,setTd]=useState(false);
  const [showLeave,setShowLeave]=useState(false);
  const [iqResult,setIqResult]=useState(null);
  const elRef=useRef(0);const stRef=useRef(null);const lastPassElRef=useRef(0);
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
    const nowEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);
    const passEl=nowEl-lastPassElRef.current;lastPassElRef.current=nowEl;
    setPassLog(pl=>[...pl,{label:roundName,roundName,out:pt,in:inc,blind:cp.blind,secs:passEl}]);
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
      totalTime:totalEl,sectionId:chosenSec,chosenHand,
    },getDailySeed(),isD,dn);
    setIqResult(iq);

    const result={
      rating:RATS[gi],emoji:REMO[gi],section:`${top.icon} ${top.name}`,sid:top.id,
      score:top.score,time:totalEl,gi,iqScore:iq?iq.totalScore:null,iq,
      finalRack:hand,passLog,chosenSec,chosenHand,allSections:ev(hand),
    };
    onDone(result);
    setPhase("result");
  };

  const restart=()=>{
    const d=shuffle(buildDeck());const dealt=d.slice(0,13);
    setHand(dealt);setStartingRack(dealt);setPool(d.slice(13).filter(t=>t.t!=="j"));
    setSel([]);setPassed([]);setPassLog([]);setNewIdx([]);setCn(1);setPi(0);setChosenSec(null);setChosenHand(null);
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
            setScreen={setScreen}
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
          <button onClick={()=>{if(sel.length<1)return;haptic(40);const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);const rem=hand.filter((_,i)=>!sel.includes(i));const safe=pool.filter(t=>t.t!=="j");const inc=safe.slice(0,sel.length);setPool(safe.slice(sel.length));setHand([...rem,...inc]);const cpNowEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);const cpPassEl=cpNowEl-lastPassElRef.current;lastPassElRef.current=cpNowEl;setPassLog(pl=>[...pl,{label:"Courtesy Pass",roundName:"Courtesy Pass",out:pt,in:inc,blind:false,secs:cpPassEl}]);setSel([]);setNewIdx([]);stopTimer();setPhase("chooseHand");}} disabled={sel.length<1} style={{...S.passBtn,opacity:sel.length>=1?1:0.3}}>🔄 {sel.length<1?"Skip (pass 0)":`Pass ${sel.length}`}</button>
        </>
      )}

      {phase==="chooseHand"&&(
        <>
          <RackleHeader onBack={()=>setShowLeave(true)}/>
          {getDisplayTime()&&<div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span></div>}
          <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 2px",textAlign:"center"}}>What hand are you playing?</h2>
          <p style={{fontSize:12,color:C.mut,marginBottom:10,textAlign:"center"}}>Pick the exact hand from your card.</p>
          <Rack hand={hand} label="YOUR RACK" showSort onSort={()=>setHand(sortHand(hand))} large={large}/>
          <button onClick={()=>setShowRef(!showRef)} aria-expanded={showRef} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,background:showRef?C.gold+"06":"#fff"}}>
            <span style={{fontSize:12,fontWeight:600,color:showRef?C.gold:C.ink}}>📖 {showRef?"Hide":"Show"} 2026 Card Guide</span><span aria-hidden="true" style={{color:C.mut}}>{showRef?"▾":"▸"}</span>
          </button>
          {showRef&&<CG onClose={()=>setShowRef(false)}/>}
          {(()=>{
            const scored=ev(hand);
            const ranked=SECS.map(s=>scored.find(e=>e.id===s.id)).filter(Boolean);
            const topPct=scored[0]?.score||0;

            // Step 1: pick section
            if(!chosenSec) return(
              <>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:6}}>STEP 1 — PICK YOUR SECTION</div>
                <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
                  {ranked.map((s,idx)=>{
                    const pct=Math.round(s.score*100);
                    const isTop=idx===0;
                    return(
                      <button key={s.id} onClick={()=>{haptic(20);setChosenSec(s.id);setChosenHand(null);}} aria-label={`${s.name}: ${s.desc}`}
                        style={{cursor:"pointer",display:"flex",alignItems:"center",gap:0,borderRadius:12,overflow:"hidden",
                          border:`1.5px solid ${isTop?s.color:C.bdr}`,
                          background:isTop?s.color+"08":"#fff",
                          textAlign:"left",transition:"all 0.15s"}}>
                        <div style={{width:4,alignSelf:"stretch",flexShrink:0,background:isTop?s.color:s.color+"40"}}/>
                        <div style={{width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,margin:"0 2px"}}>{s.icon}</div>
                        <div style={{flex:1,minWidth:0,padding:"10px 8px 10px 4px"}}>
                          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:2}}>
                            <span style={{fontSize:13,fontWeight:800,color:isTop?s.color:C.ink,lineHeight:1.2}}>{s.name}</span>
                            {isTop&&<span style={{fontSize:8,fontWeight:700,background:s.color+"20",color:s.color,borderRadius:8,padding:"1px 6px",letterSpacing:0.5}}>BEST FIT</span>}
                          </div>
                          <div style={{fontSize:10,color:C.mut,lineHeight:1.3}}>{s.desc}</div>
                        </div>
                        <div style={{padding:"0 12px",textAlign:"right",flexShrink:0}}>
                          <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:isTop?s.color:C.mut}}>{pct}%</div>
                          <div style={{fontSize:8,color:C.mut}}>fit</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            );

            // Step 2: pick specific hand from the chosen section
            const secHands=HAND_CATALOG.filter(h=>h.sec===chosenSec)
              .map(h=>({...h,fit:h.fit(hand)}))
              .sort((a,b)=>b.fit-a.fit);
            const secObj=SECS.find(s=>s.id===chosenSec);
            return(
              <>
                {/* Section header with back */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <button onClick={()=>{setChosenSec(null);setChosenHand(null);}} style={{...S.back,fontSize:11,padding:"4px 0"}}>← Sections</button>
                  <div style={{flex:1,textAlign:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,color:secObj?.color||C.jade}}>{secObj?.icon} {secObj?.name}</span>
                  </div>
                </div>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:6}}>STEP 2 — PICK YOUR EXACT HAND</div>
                <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                  {secHands.map((h,i)=>{
                    const isSel=chosenHand===h.label;
                    const pct=Math.round(h.fit*100);
                    const barColor=pct>=70?C.jade:pct>=45?C.gold:C.cinn;
                    return(
                      <button key={i} onClick={()=>{haptic(20);setChosenHand(h.label);}} aria-checked={isSel}
                        style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderRadius:12,padding:"10px 12px",
                          border:`1.5px solid ${isSel?(secObj?.color||C.jade):C.bdr}`,
                          background:isSel?(secObj?.color||C.jade)+"0C":"#fff",
                          textAlign:"left",transition:"all 0.15s",
                          boxShadow:isSel?`0 2px 12px ${secObj?.color||C.jade}20`:"none"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:isSel?(secObj?.color||C.jade):C.ink,lineHeight:1.3,marginBottom:2}}>{h.label}</div>
                          <div style={{fontSize:10,color:C.mut}}>{h.concealed?"Concealed · no jokers":"Open"} · {h.value} pts</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0,minWidth:44}}>
                          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:barColor,lineHeight:1}}>{pct}%</div>
                          <div style={{width:40,height:3,borderRadius:2,background:C.bdr,marginTop:3}}>
                            <div style={{width:`${pct}%`,height:"100%",borderRadius:2,background:barColor}}/>
                          </div>
                        </div>
                        <div style={{width:22,height:22,borderRadius:11,flexShrink:0,
                          background:isSel?(secObj?.color||C.jade):"none",
                          border:isSel?"none":`2px solid ${C.bdr}`,
                          display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {isSel&&<span style={{fontSize:11,color:"#fff",fontWeight:900}}>✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
          <button onClick={confirm} disabled={!chosenSec||!chosenHand} style={{...S.greenBtn,width:"100%",marginTop:4,opacity:(chosenSec&&chosenHand)?1:0.3}}>Rate My Hand →</button>
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
            {/* ── HINT PANEL ── */}
            <button onClick={()=>{setShowHint(!showHint);if(!showHint)setHintExp(null);}} aria-expanded={showHint}
              style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"10px 14px",borderRadius:12,cursor:"pointer",
                background:showHint?C.jade+"0C":"#fff",
                border:`1.5px solid ${showHint?C.jade+"40":C.bdr}`,
                transition:"all 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15}}>💡</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:800,color:showHint?C.jade:C.ink,lineHeight:1.2}}>Section Hint</div>
                  <div style={{fontSize:10,color:C.mut,lineHeight:1}}>Best fits for your current rack</div>
                </div>
              </div>
              <span style={{fontSize:11,color:showHint?C.jade:C.mut,fontWeight:700}}>{showHint?"▾":"▸"}</span>
            </button>

            {showHint&&(()=>{
              const ranked=ev(hand).slice(0,5);
              const top=ranked[0];
              return(
                <div style={{marginTop:6,background:"#fff",borderRadius:12,border:`1px solid ${C.bdr}`,overflow:"hidden"}} className="rk-in">
                  {/* Top match highlight */}
                  <div style={{padding:"10px 14px",background:`linear-gradient(135deg,${top.color}10,${top.color}06)`,borderBottom:`1px solid ${top.color}20`}}>
                    <div style={{fontSize:8,color:top.color,letterSpacing:2,fontWeight:700,marginBottom:4}}>BEST FIT RIGHT NOW</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{top.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:800,color:C.ink,lineHeight:1.2}}>{top.name}</div>
                        <div style={{fontSize:10,color:C.mut,lineHeight:1.3,marginTop:1}}>{top.desc}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:top.color,lineHeight:1}}>{Math.round(top.score*100)}<span style={{fontSize:10,color:C.mut,fontWeight:400}}>%</span></div>
                      </div>
                    </div>
                    {/* Fit bar */}
                    <div style={{height:3,borderRadius:2,background:top.color+"20",overflow:"hidden",marginTop:8}}>
                      <div style={{height:"100%",width:`${Math.round(top.score*100)}%`,background:top.color,borderRadius:2}}/>
                    </div>
                  </div>

                  {/* Hold / Pass chips for top section */}
                  <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.bdr}`,display:"flex",gap:8}}>
                    <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"7px 10px"}}>
                      <div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>✓ HOLD</div>
                      <div style={{fontSize:10,color:C.ink,lineHeight:1.5}}>{top.hold}</div>
                    </div>
                    <div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"7px 10px"}}>
                      <div style={{fontSize:8,color:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>✗ PASS</div>
                      <div style={{fontSize:10,color:C.ink,lineHeight:1.5}}>{top.pass}</div>
                    </div>
                  </div>

                  {/* Other sections ranked list */}
                  <div style={{padding:"6px 8px"}}>
                    <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,padding:"4px 6px 6px"}}>OTHER OPTIONS</div>
                    {ranked.slice(1).map((s,i)=>{
                      const pct=Math.round(s.score*100);
                      const viable=s.score>0.05;
                      const isExp=hintExp===s.id;
                      return(
                        <div key={s.id} style={{marginBottom:2}}>
                          <button onClick={()=>setHintExp(isExp?null:s.id)} aria-expanded={isExp}
                            style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"8px 8px",borderRadius:9,
                              background:isExp?s.color+"0A":"transparent",
                              border:`1px solid ${isExp?s.color+"30":"transparent"}`,cursor:"pointer",textAlign:"left",
                              transition:"all 0.12s"}}>
                            <span style={{fontSize:14,flexShrink:0}}>{s.icon}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:3}}>
                                <span style={{fontSize:11,fontWeight:700,color:viable?C.ink:C.mut}}>{s.name}</span>
                                <span style={{fontSize:10,fontWeight:700,color:viable?s.color:C.mut,fontFamily:F.d}}>{pct}%</span>
                              </div>
                              <div style={{height:3,borderRadius:2,background:C.bdr,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${pct}%`,background:viable?s.color:"#D5CFC5",borderRadius:2}}/>
                              </div>
                            </div>
                            <span style={{fontSize:10,color:C.mut,flexShrink:0}}>{isExp?"▾":"▸"}</span>
                          </button>
                          {isExp&&<div style={{margin:"2px 8px 6px",padding:"8px 10px",background:"#fff",borderRadius:8,border:`1px solid ${C.bdr}`}} className="rk-in">
                            <div style={{display:"flex",gap:8,marginBottom:viable?6:0}}>
                              <div style={{flex:1}}>
                                <div style={{fontSize:8,color:C.jade,letterSpacing:1,fontWeight:700,marginBottom:2}}>HOLD</div>
                                <div style={{fontSize:10,color:C.ink,lineHeight:1.5}}>{s.hold}</div>
                              </div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:8,color:C.cinn,letterSpacing:1,fontWeight:700,marginBottom:2}}>PASS</div>
                                <div style={{fontSize:10,color:C.ink,lineHeight:1.5}}>{s.pass}</div>
                              </div>
                            </div>
                            {!viable&&<div style={{fontSize:10,color:C.cinn,marginTop:4,fontStyle:"italic"}}>Low fit — your rack doesn't lean this way yet.</div>}
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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

function WeeklyRecapScreen({home,go,dDone,setScreen}){
  const data=getWeeklyRecapData();
  const profile=getProfile();
  const isSunday=new Date().getDay()===0;
  if(!data)return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{textAlign:"center",padding:"48px 20px"}}>
        <div style={{fontSize:32,marginBottom:12}}>🀄</div>
        <div style={{fontFamily:F.d,fontSize:18,fontWeight:800,color:C.ink,marginBottom:8}}>No games this week yet</div>
        <div style={{fontSize:13,color:C.mut,lineHeight:1.6,marginBottom:24}}>Play today's Daily to start building your week.</div>
        {dDone
          ?<div style={{fontSize:12,color:C.jade,fontWeight:700}}>✓ Today's Daily is done. See you tomorrow!</div>
          :<button onClick={()=>go("daily")} style={{...S.greenBtn,padding:"13px 32px"}}>Play Today's Daily →</button>
        }
      </div>
    </div>
  );
  // Week-in-progress banner — shown any day except Sunday
  const weekInProgress=!isSunday;

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
      <RackleHeader onBack={home} setScreen={setScreen}/>

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

      {/* Week-in-progress banner */}
      {weekInProgress&&<div style={{display:"flex",alignItems:"center",gap:10,background:C.gold+"08",border:`1px solid ${C.gold}25`,borderRadius:14,padding:"11px 14px",marginBottom:12}}>
        <span style={{fontSize:18,flexShrink:0}}>📅</span>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:F.d}}>Week in progress</div>
          <div style={{fontSize:11,color:C.mut,marginTop:2,lineHeight:1.5}}>Your recap updates as you play. Come back Sunday for the full picture.</div>
        </div>
      </div>}

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
        <div style={{fontFamily:"monospace",fontSize:10,color:C.mut,background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center",borderBottom:`1px solid ${C.bdr}`}}>
          {shareText.split("\n").map((line,i)=>line===""?<div key={i} style={{height:8}}/>:<div key={i} style={{lineHeight:1.9}}>{line}</div>)}
        </div>
        <ShareButton text={shareText} label="Share your week" sublabel="Post it to your group chat"/>
      </div>

      {/* CTA */}
      {dDone
        ?<div style={{...S.card,marginBottom:8,background:C.jade+"06",borderColor:C.jade+"20",textAlign:"center",padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.jade,fontWeight:700,marginBottom:2}}>✓ Today's Daily Complete</div>
          <div style={{fontSize:11,color:C.mut}}>Come back tomorrow for the next challenge.</div>
        </div>
        :<button onClick={()=>go("daily")} style={{...S.greenBtn,width:"100%",marginBottom:8}}>Play This Week's Daily →</button>
      }
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={()=>setScreen("stats")} style={{...S.oBtn,flex:1,fontSize:12}}>📊 My Stats</button>
        <button onClick={()=>setScreen("scorecard")} style={{...S.oBtn,flex:1,fontSize:12}}>📋 Scorecard</button>
      </div>
      <button onClick={home} style={{...S.oBtn,width:"100%"}}>Back to Home</button>
      <Footer/>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function Rackle(){
  const [screen,setScreenRaw]=useState("home");
  const setScreen=(s)=>{
    window.scrollTo(0,0);
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    setScreenRaw(s);
  };
  const [mode,setMode]=useState("free");
  const [streak,setStreak]=useState(ST.get("str",0));
  const [rounds,setRounds]=useState(ST.get("rnd",0));
  const [dDone,setDDone]=useState(ST.get("dd",null)===getDailySeed());
  const [dRes,setDRes]=useState(ST.get("dres",null));
  const [showHelp,setShowHelp]=useState(false);
  const [settings,setSettings]=useState({...DEFAULT_SETTINGS,...ST.get("settings",{})});
  const [badgeToast,setBadgeToast]=useState(null);
  const [clubPostToast,setClubPostToast]=useState(null);
  const [showWeeklyNudge,setShowWeeklyNudge]=useState(shouldShowWeeklyRecap);
  const isFirstDaily=!ST.get("hadFirstDaily",false);

  // Fetch clubs from Supabase on load
  useEffect(()=>{
    fetchClubs();
    // Handle /clubs/[slug] URL routing
    const path=window.location.pathname;
    const clubMatch=path.match(/\/clubs\/(.+)/);
    if(clubMatch)setScreen("clubs");
  },[]);

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
      // Auto-post to club leaderboard if player has a club + name
      const autoCode=getClubCode();
      const autoName=getClubName()||(getProfile()?.nickname||null);
      if(autoCode&&autoName&&result?.iq?.totalScore){
        upsertLBEntry(autoCode,autoName,result.iq.totalScore,result.time||0,newStreak).then(ok=>{
          if(ok)setClubPostToast({clubName:CLUBS[autoCode]?.name||"your club",iqScore:result.iq.totalScore});
        });
      }
      // Auto-post to GLOBAL leaderboard — always, even without an account
      if(result?.iq?.totalScore){
        const globalName=autoName||getOrCreateAnonymousName();
        upsertGlobalEntry(globalName,result.iq.totalScore,result.time||0,newStreak,autoCode||null);
      }
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
      {clubPostToast&&<ClubPostToast toast={clubPostToast} onDismiss={()=>setClubPostToast(null)}/>}
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
        {screen==="tutorial"&&<Tutorial onDone={()=>{ST.set("tutDone",true);setScreen("home");}} onBack={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="cardguide"&&<CardGuideScreen home={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="play"&&<Game mode={mode} home={()=>setScreen("home")} onDone={onDone} settings={settings} setScreen={setScreen}/>}
        {screen==="stats"&&<Stats home={()=>setScreen("home")} onShowScorecard={()=>setScreen("scorecard")} onRecap={()=>setScreen("recap")} dRes={dRes} setScreen={setScreen}/>}
        {screen==="settings"&&<Settings home={()=>setScreen("home")} settings={settings} setSettings={setSettings} showTutorial={()=>setScreen("tutorial")} setScreen={setScreen}/>}
        {screen==="scorecard"&&<ScorecardScreen res={dRes} home={()=>setScreen("home")} dayNum={getDayNum()} onPractice={()=>go("free")} setScreen={setScreen}/>}
        {screen==="leaderboard"&&<LeaderboardScreen home={()=>setScreen("home")} dRes={dRes} streak={streak} setScreen={setScreen}/>}
        {screen==="clubs"&&<ClubDirectoryScreen home={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="profile"&&<ProfileScreen home={()=>setScreen("home")} streak={streak} rounds={rounds} dRes={dRes} setScreen={setScreen}/>}
        {screen==="recap"&&<WeeklyRecapScreen home={()=>setScreen("home")} go={go} dDone={dDone} setScreen={setScreen}/>}
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
