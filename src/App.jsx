import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, useRef, useCallback } from "react";
// RACKLE — Daily Charleston + Practice. Rack & Roll. 2026 NMJL.
// v1.1 — Tutorial, Settings, A11y, Error Handling, Streak Milestones, Better UX

// DESIGN — defined first so all components can reference C, F, S
const C={bg:"#FAF7F1",bg2:"#F1ECE3",ink:"#221E1A",mut:"#6B6560",jade:"#1B7D4E",gold:"#B08A35",cinn:"#B83232",bdr:"#E3DDD3"};
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

// TILE
function Ti({t,sel,isNew,onClick,dim,large}){
  const c=tC(t);
  const sz=large?{w:44,h:60,fs:18,fs2:8}:{w:37,h:50,fs:15,fs2:7};
  return(
  <div
    onClick={onClick}
    role={onClick?"checkbox":undefined}
    aria-checked={onClick?sel:undefined}
    aria-label={onClick?`${sel?"Deselect":"Select"} ${tAria(t)}`:tAria(t)}
    tabIndex={onClick?0:undefined}
    onKeyDown={onClick?(e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();onClick();}})  :undefined}
    style={{width:sz.w,height:sz.h,borderRadius:7,cursor:onClick?"pointer":"default",userSelect:"none",background:sel?c+"14":isNew?"#FFFBE7":"linear-gradient(145deg,#fff,#F7F4EE)",border:`2px solid ${sel?c:isNew?"#B08A35":"#D5CFC5"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,position:"relative",overflow:"hidden",boxShadow:sel?`0 4px 12px ${c}28`:"0 1px 3px rgba(0,0,0,0.06)",transform:sel?"translateY(-4px) scale(1.05)":"none",transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",opacity:dim?0.35:1,outline:"none"}}
  >
    <span aria-hidden="true" style={{fontSize:sz.fs,fontWeight:800,color:c,lineHeight:1,fontFamily:F.d}}>{tL(t)}</span>
    <span aria-hidden="true" style={{fontSize:sz.fs2,color:c,opacity:0.5,fontWeight:700,marginTop:1}}>{tS(t)}</span>
    {sel&&<div aria-hidden="true" style={{position:"absolute",top:0,left:0,right:0,height:2,background:c}}/>}
  </div>);}

// SECTIONS
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

function ev(h){return SECS.map(s=>({...s,score:s.ck(h)})).sort((a,b)=>b.score-a.score);}
function adv(hand,cid){
  const e=ev(hand),ch=e.find(s=>s.id===cid),top=e[0],alts=e.filter(s=>s.id!==cid&&s.score>0.03).slice(0,2);
  let v="Not optimal",em="😬";
  if(ch&&ch.score>=0.02){if(ch.id===top.id||ch.score>=top.score*0.85){v="Strong choice";em="💪";}else if(ch.score>=top.score*0.55){v="Playable but risky";em="🤔";}}
  const p=ch?(ch.score*100).toFixed(0):"0";
  const topPct=(top.score*100).toFixed(0);
  let r;
  if(v==="Strong choice"){
    r=`${p}% fit — your tiles aligned well with ${ch?.name}. Solid passing instincts.`;
  } else if(v==="Playable but risky"){
    r=`${p}% fit for ${ch?.name}, but your tiles leaned more toward ${top.name} (${topPct}%). A pivot earlier could have paid off.`;
  } else {
    r=`Only ${p}% fit for ${ch?.name}. Your tiles were a much better match for ${top.name} (${topPct}%) — worth practicing that read.`;
  }
  return{verdict:v,emoji:em,reason:r,alts,top,chosen:ch};
}



// CHARLESTON IQ — scores the quality of the passing decisions
function charlestonIQ(passLog,finalHand){
  if(!passLog||passLog.length===0)return null;
  // Score each pass: reward passing low-value tiles, penalise passing jokers/flowers/useful tiles
  let totalScore=0,maxScore=0;
  const passScores=passLog.map(p=>{
    let ps=0,ms=p.out.length*10;
    p.out.forEach(t=>{
      if(t.t==="j"){ps-=20;}       // never pass a joker
      else if(t.t==="f"){ps+=2;}   // flowers OK to pass early
      else if(t.t==="w"){ps+=6;}   // winds are usually passable
      else if(t.t==="d"){ps+=4;}   // dragons mid
      else{ps+=5;}                  // number tiles — neutral pass
    });
    // Bonus: tiles received that align with top section of final hand
    const topSec=ev(finalHand)[0];
    p.in.forEach(t=>{
      const val=topSec.ck([t]);
      ps+=val>0?4:0;
    });
    const pct=Math.max(0,Math.min(100,Math.round((ps/Math.max(ms,1))*100)));
    totalScore+=ps;maxScore+=ms;
    return{...p,ps,pct};
  });
  const iq=Math.max(0,Math.min(100,Math.round((totalScore/Math.max(maxScore,1))*100)));
  return{passScores,iq};
}

// WEEKLY
function getWeekly(){const w=Math.floor((Date.now()-new Date(2026,0,1))/604800000);const ids=["2468","13579","369","cr","wd","aln","sp","2026","q"];return SECS.find(s=>s.id===ids[w%ids.length]);}

// STORAGE
const mem={};
const ST={
  get(k,d){try{const v=JSON.parse(localStorage.getItem("rk-"+k));return v!==null?v:d;}catch{return mem[k]!==undefined?mem[k]:d;}},
  set(k,v){try{localStorage.setItem("rk-"+k,JSON.stringify(v));}catch(e){mem[k]=v;if(e.name==="QuotaExceededError"){console.warn("localStorage full, using memory");}}}
};
function getDailySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function getDayNum(){return Math.floor((new Date()-new Date(2026,3,25))/86400000)+1;}

// STREAK BADGES
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

// HISTORY
function addHist(e){const h=ST.get("hist",[]);h.push({...e,ts:Date.now()});ST.set("hist",h.slice(-100));}
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

// DEFAULT SETTINGS
const DEFAULT_SETTINGS={tileSize:"normal",haptic:true,showTimer:true};

// TUTORIAL STEPS
const TUTORIAL_STEPS=[
  {
    title:"Welcome to Rackle! 🀄",
    body:"Rackle trains your Charleston strategy for American Mahjong (NMJL 2026 card).",
    detail:"The Charleston is the tile-passing ritual before play. Better passing = better hands. Quick to learn — let's go.",
    icon:"🀄",
    tip:null,
  },
  {
    title:"Your Rack",
    body:"You're dealt 13 tiles. Each tile belongs to a category: Bam, Crak, Dot, Winds, Dragons, Flowers, or Jokers.",
    detail:"The goal is to end the Charleston with tiles that align to and can be flexible within a section.",
    icon:"🎴",
    tip:null,
    showTiles:true,
  },
  {
    title:"The Charleston",
    body:"You pass tiles in 3 rounds — Right (3 tiles), Over (3 tiles), Left (0–3 tiles, blind).",
    detail:"'Blind' means you pass before seeing what you receive. Pass your worst tiles. Keep your best.",
    icon:"👉",
    tip:"Jokers can NEVER be passed. And why would you want to? They're too valuable!",
  },
  {
    title:"Pick Your Section",
    body:"After passing, choose which hand category (section) you're targeting — like 2468, 369, or Consecutive Run.",
    detail:"Rackle then scores how well your final rack fits that section. It's like a Charleston performance review.",
    icon:"🎯",
    tip:"The 2026 Card in-game guide shows tips for each section.",
  },
  {
    title:"Get Rated",
    body:"Your rack is scored from Mahjong Master to Keep Going, Rookie.",
    detail:"Get your Charleston IQ and a full score breakdown — and don't forget to share with your Mahj besties!",
    icon:"🏆",
    tip:"Play the Daily for a fresh deal every day shared by all players.",
  },
];

// LEAVE GAME MODAL
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

// STREAK BADGE TOAST
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

// SHARED HEADER — used on all non-home screens
function RackleHeader({onBack}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",position:"relative",marginBottom:16,paddingTop:2}}>
      <button onClick={onBack} style={{...S.back,position:"absolute",left:0}} aria-label="Back to home">← Back</button>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div>
        <div style={{fontFamily:F.d,fontSize:10,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>Rack & Roll.</div>
      </div>
    </div>
  );
}

// SETTINGS SCREEN
function Settings({home,settings,setSettings,showTutorial}){
  const [confirmClear,setConfirmClear]=useState(false);
  const clearHistory=()=>{
    ST.set("hist",[]);ST.set("str",0);ST.set("rnd",0);ST.set("ld",null);ST.set("dd",null);ST.set("dres",null);
    setConfirmClear(false);
    window.location.reload();
  };
  const exportData=()=>{
    const data={history:getHist(),streak:ST.get("str",0),rounds:ST.get("rnd",0)};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="rackle-data.json";a.click();
    URL.revokeObjectURL(url);
  };
  const Row=({label,sub,children})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.bdr}`}}>
      <div><div style={{fontSize:13,fontWeight:600,color:C.ink}}>{label}</div>{sub&&<div style={{fontSize:11,color:C.mut,marginTop:2}}>{sub}</div>}</div>
      {children}
    </div>
  );
  const Toggle=({val,onChange,label})=>(
    <button
      role="switch"
      aria-checked={val}
      aria-label={label}
      onClick={()=>onChange(!val)}
      style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:val?C.jade:"#D5CFC5",position:"relative",transition:"background 0.2s",flexShrink:0}}
    >
      <span aria-hidden="true" style={{position:"absolute",top:2,left:val?22:2,width:20,height:20,borderRadius:10,background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
    </button>
  );
  const upd=(k,v)=>{const n={...settings,[k]:v};setSettings(n);ST.set("settings",n);};
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>DISPLAY</div>
        <Row label="Show Timer" sub="Track how long each Charleston takes">
          <Toggle val={settings.showTimer} onChange={v=>upd("showTimer",v)} label="Toggle show timer"/>
        </Row>
        <Row label="Tile Size" sub="Larger tiles for easier tapping">
          <div style={{display:"flex",gap:4}}>
            {["normal","large"].map(sz=>(
              <button key={sz} onClick={()=>upd("tileSize",sz)} aria-pressed={settings.tileSize===sz} style={{padding:"4px 10px",borderRadius:8,border:`1.5px solid ${settings.tileSize===sz?C.jade:C.bdr}`,background:settings.tileSize===sz?C.jade+"10":"#fff",fontSize:11,fontWeight:600,color:settings.tileSize===sz?C.jade:C.mut,cursor:"pointer",textTransform:"capitalize"}}>{sz}</button>
            ))}
          </div>
        </Row>
        <Row label="Haptic Feedback" sub="Vibrate on tile selection (mobile)">
          <Toggle val={settings.haptic} onChange={v=>upd("haptic",v)} label="Toggle haptic feedback"/>
        </Row>
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
              </div>
          }
        </Row>
      </div>
      <div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>ABOUT</div>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.7}}>
          <div><span style={{fontWeight:700}}>Rackle</span> v1.1 · 2026 NMJL Edition</div>
          <div style={{color:C.mut,marginTop:4}}>Daily Charleston strategy trainer. Same deal for every player, every day. Train your game.</div>
          <div style={{marginTop:8}}><a href="https://playrackle.com" style={{color:C.jade,fontWeight:600,textDecoration:"none"}}>playrackle.com</a></div>
        </div>
      </div>
      <div style={{textAlign:"center",padding:"12px 0",marginTop:4}}>
        <button onClick={showTutorial} style={{background:"none",border:"none",color:C.mut,fontSize:12,cursor:"pointer",textDecoration:"underline"}}>Replay Tutorial</button>
      </div>
    </div>
  );
}

// TUTORIAL SCREEN
function Tutorial({onDone,onBack}){
  const [step,setStep]=useState(0);
  const [tapTile,setTapTile]=useState(null);
  const st=TUTORIAL_STEPS[step];
  const isLast=step===TUTORIAL_STEPS.length-1;
  const sampleTiles=[{t:"s",s:"bam",n:6},{t:"s",s:"crak",n:2},{t:"d",v:"Soap"},{t:"j"},{t:"f"},{t:"w",v:"N"},{t:"s",s:"dot",n:9}];
  return(
    <div style={S.pg} className="rk-pg">
      {onBack&&<RackleHeader onBack={onBack}/>}
      <div style={{textAlign:"center",paddingTop:8,marginBottom:20}}>
        <div className="rk-float" style={{fontSize:36,marginBottom:6}}>{st.icon}</div>
        <div style={{display:"flex",justifyContent:"center",gap:4,marginBottom:14}}>
          {TUTORIAL_STEPS.map((_,i)=>(
            <div key={i} aria-hidden="true" style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?C.jade:i<step?C.jade+"50":C.bdr,transition:"all 0.3s"}}/>
          ))}
        </div>
        <h2 style={{fontFamily:F.d,fontSize:20,color:C.ink,margin:"0 0 10px",fontWeight:800}}>{st.title}</h2>
        <p style={{fontSize:14,color:C.ink,lineHeight:1.7,margin:"0 0 8px",fontWeight:500}}>{st.body}</p>
        <p style={{fontSize:12,color:C.mut,lineHeight:1.7,margin:0}}>{st.detail}</p>
      </div>
      {st.showTiles&&(
        <div style={{...S.card,marginBottom:16}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
            {sampleTiles.map((t,i)=>(
              <div key={i}>
                <Ti t={t} onClick={()=>setTapTile(tapTile===i?null:i)} sel={tapTile===i}/>
                {tapTile===i&&<div className="rk-in" style={{textAlign:"center",fontSize:10,color:tC(t),fontWeight:700,marginTop:3}}>{tAria(t)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {st.tip&&(
        <div style={{background:C.gold+"08",borderRadius:12,padding:"10px 14px",border:`1px solid ${C.gold}25`,marginBottom:16}}>
          <span style={{fontSize:12,color:C.gold,fontWeight:600}}>💡 {st.tip}</span>
        </div>
      )}
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{...S.oBtn,flex:1}} aria-label="Previous tutorial step">← Back</button>}
        {!isLast?(
          <button onClick={()=>setStep(s=>s+1)} style={{...S.greenBtn,flex:1}} aria-label="Next tutorial step">Next →</button>
        ):(
          <button onClick={onDone} style={{...S.greenBtn,flex:1}} aria-label="Finish tutorial and start playing">Start Playing →</button>
        )}
      </div>
      <div style={{textAlign:"center",marginTop:12}}>
        <button onClick={onBack||onDone} style={{background:"none",border:"none",color:C.mut,fontSize:11,cursor:"pointer",textDecoration:"underline"}} aria-label="Skip tutorial">Skip tutorial</button>
      </div>
    </div>
  );
}

// FIRST-TIME PAYOFF SCREEN (shown after first daily)
function FirstPayoff({result,onPractice,onHome,dayNum}){
  const gi=result.gi,gc=RCOL[gi];
  const pct=result.score?(result.score*100).toFixed(0):"—";
  return(
    <div style={S.pg} className="rk-pg">
      <div style={{textAlign:"center",paddingTop:16,marginBottom:16}}>
        <div className="rk-pop" style={{fontSize:48,marginBottom:8}}>🎉</div>
        <h2 style={{fontFamily:F.d,fontSize:22,color:C.ink,margin:"0 0 4px",fontWeight:800}}>Nice Start!</h2>
        <p style={{fontSize:13,color:C.mut,margin:0}}>You just finished your first Rackle Daily.</p>
      </div>
      <div style={{...S.card,textAlign:"center",marginBottom:12}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>YOUR RESULT · DAILY #{dayNum}</div>
        <div style={{display:"inline-block",padding:"8px 20px",borderRadius:14,background:gc+"12",border:`2px solid ${gc}30`,marginBottom:8}}>
          <span style={{fontFamily:F.d,fontSize:18,fontWeight:800,color:gc}}>{result.rating} {result.emoji}</span>
        </div>
        <div style={{fontSize:12,color:C.mut}}>{result.section} · {pct}% fit</div>
      </div>
      <div style={{...S.card,background:"linear-gradient(145deg,#FFFFF8,#F8F4EB)",borderColor:C.gold+"30"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6}}>What happens next?</div>
        <div style={{fontSize:12,color:C.mut,lineHeight:1.8}}>
          <div>🔥 <strong>Come back tomorrow</strong> — new deal every day</div>
          <div>📊 <strong>Track your streak</strong> — daily consistency builds skill</div>
          <div>🀄 <strong>Practice Mode</strong> — unlimited hands to sharpen strategy</div>
          <div>📋 <strong>Share your result</strong> — challenge your mahj group</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={onHome} style={{...S.oBtn,flex:1}}>Home</button>
        <button onClick={onPractice} style={{...S.greenBtn,flex:1}}>Practice Mode →</button>
      </div>
      <div style={{textAlign:"center",marginTop:12,padding:"10px",background:C.jade+"06",borderRadius:12,border:`1px solid ${C.jade}15`}}>
        <div style={{fontSize:12,fontWeight:700,color:C.jade}}>🔥 Rackle #{dayNum+1} drops at midnight</div>
        <div style={{fontSize:11,color:C.mut,marginTop:2}}>Same deal. Every player. One shot.</div>
      </div>
    </div>
  );
}

// APP
export default function Rackle(){
  const [screen,setScreen]=useState("home");
  const [mode,setMode]=useState("free");
  const [streak,setStreak]=useState(ST.get("str",0));
  const [rounds,setRounds]=useState(ST.get("rnd",0));
  const [dDone,setDDone]=useState(ST.get("dd",null)===getDailySeed());
  const [dRes,setDRes]=useState(ST.get("dres",null));
  const [showHelp,setShowHelp]=useState(false);
  const [settings,setSettings]=useState({...DEFAULT_SETTINGS,...ST.get("settings",{})});
  const [badgeToast,setBadgeToast]=useState(null);
  const [showFirstPayoff,setShowFirstPayoff]=useState(false);
  const [firstPayoffRes,setFirstPayoffRes]=useState(null);
  const tutDone=ST.get("tutDone",false);
  const isFirstDaily=!ST.get("hadFirstDaily",false);

  const onDone=(result)=>{
    setRounds(r=>{const n=r+1;ST.set("rnd",n);return n;});
    const today=getDailySeed();
    if(ST.get("ld",null)!==today){
      const y=new Date();y.setDate(y.getDate()-1);
      const yS=y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate();
      const ns=ST.get("ld",null)===yS?streak+1:1;
      setStreak(ns);ST.set("str",ns);ST.set("ld",today);
      // Show streak badge if milestone hit
      const badge=getStreakBadge(ns);
      const prevBadge=getStreakBadge(ns-1);
      if(badge&&(!prevBadge||badge.days>prevBadge.days))setBadgeToast(badge);
    }
    if(mode==="daily"){
      setDDone(true);ST.set("dd",today);setDRes(result);ST.set("dres",result);
      if(isFirstDaily){
        ST.set("hadFirstDaily",true);
        setFirstPayoffRes(result);
        setShowFirstPayoff(true);
        return;
      }
    }
    addHist(result);
  };

  const go=(m)=>{setMode(m);setScreen("play");};

  return(
    <AppShell settings={settings}>
      {badgeToast&&<StreakBadgeToast badge={badgeToast} onDismiss={()=>setBadgeToast(null)}/>}
      {showFirstPayoff&&firstPayoffRes
        ? <FirstPayoff
            result={firstPayoffRes}
            dayNum={getDayNum()}
            onHome={()=>{addHist(firstPayoffRes);setShowFirstPayoff(false);setScreen("home");}}
            onPractice={()=>{addHist(firstPayoffRes);setShowFirstPayoff(false);go("free");}}
          />
        : <>
            {screen==="home"&&<Home {...{streak,rounds,dDone,dRes,showHelp,setShowHelp,go,settings}} showStats={()=>setScreen("stats")} showSettings={()=>setScreen("settings")} showTutorial={()=>setScreen("tutorial")} showCardGuide={()=>setScreen("cardguide")} showResult={()=>setScreen("dailyresult")}/>}
            {screen==="tutorial"&&<Tutorial onDone={()=>{ST.set("tutDone",true);setScreen("home");}} onBack={()=>setScreen("home")}/>}
            {screen==="cardguide"&&<CardGuideScreen home={()=>setScreen("home")}/>}
            {screen==="play"&&<Game mode={mode} home={()=>setScreen("home")} onDone={onDone} settings={settings}/>}
            {screen==="stats"&&<Stats home={()=>setScreen("home")}/>}
            {screen==="settings"&&<Settings home={()=>setScreen("home")} settings={settings} setSettings={setSettings} showTutorial={()=>setScreen("tutorial")}/>}
            {screen==="dailyresult"&&<DailyScorecard res={dRes} dn={getDayNum()} home={()=>setScreen("home")}/>}
          </>
      }
    </AppShell>
  );
}

// DAILY SCORECARD — read-only view of today's result, accessible from home
function DailyScorecard({res,dn,home}){
  const [copied,setCopied]=useState(false);
  if(!res)return null;
  const gc=RCOL[res.gi]||C.jade;
  const pct=res.score!=null?(res.score*100).toFixed(0):null;
  const secName=(res.section||"").replace("Consec. Run","Consecutive Run");
  const stxt=`🀄 Rackle #${dn} · ${res.rating} ${res.emoji}\n${secName} · ${pct?pct+"% fit":""}${res.iqScore!=null?` · IQ ${res.iqScore}`:""}\nplayrackle.com`;
  const cp=()=>{navigator.clipboard?.writeText(stxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      {/* hero */}
      <div style={{borderRadius:20,overflow:"hidden",marginBottom:10,background:"linear-gradient(160deg,#0F2016,#1B3A28,#0D1F13)",padding:"28px 20px 24px",textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.2)"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",letterSpacing:3,fontWeight:700,marginBottom:14}}>DAILY RACKLE · #{dn}</div>
        <div style={{fontSize:44,marginBottom:10,lineHeight:1}}>{res.emoji}</div>
        <div style={{fontFamily:F.d,fontSize:32,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1,marginBottom:6}}>{res.rating}</div>
        <div style={{width:40,height:2,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"14px auto 14px"}}/>
        <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>SECTION</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{res.section}</div>
          </div>
          {pct&&<><div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>FIT</div>
            <div style={{fontSize:13,color:C.gold,fontWeight:800}}>{pct}%</div>
          </div></>}
          {res.iqScore!=null&&<><div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>IQ</div>
            <div style={{fontSize:13,color:res.iqScore>=75?"#4ADE80":res.iqScore>=50?C.gold:C.cinn,fontWeight:800}}>{res.iqScore}</div>
          </div></>}
          {res.time&&<><div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>TIME</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",fontWeight:700}}>⏱ {fT(res.time)}</div>
          </div></>}
        </div>
        {res.iqScore!=null&&<div style={{marginTop:14,padding:"0 8px"}}>
          <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.1)",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:2,width:`${res.iqScore}%`,background:res.iqScore>=75?"#4ADE80":res.iqScore>=50?C.gold:C.cinn}}/>
          </div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginTop:4,letterSpacing:1}}>CHARLESTON IQ</div>
        </div>}
      </div>
      {/* Charleston IQ card */}
      {res.iqScore!=null&&<div style={{...S.card,marginBottom:8}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>CHARLESTON IQ</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
          <span style={{fontFamily:F.d,fontSize:28,fontWeight:900,color:res.iqScore>=75?C.jade:res.iqScore>=50?C.gold:C.cinn,lineHeight:1}}>{res.iqScore}</span>
          <span style={{fontSize:11,color:C.mut}}>/ 100</span>
        </div>
        <div style={{height:6,borderRadius:3,background:C.bdr,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",borderRadius:3,width:`${res.iqScore}%`,background:res.iqScore>=75?`linear-gradient(90deg,${C.jade},#1FA862)`:res.iqScore>=50?`linear-gradient(90deg,${C.gold},#C49A3C)`:C.cinn}}/>
        </div>
        <p style={{fontSize:12,color:C.mut,margin:0,lineHeight:1.6}}>
          {res.iqScore>=80?"Great passing discipline — your tile decisions were sharp.":res.iqScore>=60?"Solid passing instincts with room to sharpen your reads.":res.iqScore>=40?"Some good passes, but a few decisions cost you tile value.":"Tricky hand — your passing strategy needs some work."}
        </p>
      </div>}
      {/* share */}
      <div style={{...S.shareCard,padding:0,overflow:"hidden",marginBottom:8}}>
        <div style={{padding:"14px 20px"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:C.ink,lineHeight:1.8,whiteSpace:"pre",background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center"}}>{stxt}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={cp} style={{...S.greenBtn,flex:1,fontSize:12,padding:"11px 0",fontFamily:F.b,fontWeight:600}}>{copied?"✓ Copied!":"📋 Copy"}</button>
            <button onClick={()=>{const sms=`sms:?&body=${encodeURIComponent(stxt)}`;window.open(sms,"_self");}} style={{...S.greenBtn,flex:2,fontSize:12,padding:"11px 0",fontFamily:F.b,fontWeight:600,background:"linear-gradient(135deg,#2460A8,#1A4A8A)"}}>📲 Share with your Mahj club</button>
          </div>
        </div>
      </div>
      <button onClick={home} style={{...S.oBtn,width:"100%"}}>← Back to Home</button>
    </div>
  );
}

function AppShell({children,settings}){
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

// CARD GUIDE SCREEN
function CardGuideScreen({home}){
  const [exp,setExp]=useState(null);
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>2026 Card Guide</div>
        <p style={{fontSize:12,color:C.mut,margin:"0 0 10px",lineHeight:1.6}}>Hold and pass tips for all 9 hand sections on the 2026 NMJL card. Tap any section to study it.</p>
      </div>
      {SECS.map(s=>{const o=exp===s.id;return(
        <div key={s.id} style={{...S.card,padding:0,overflow:"hidden",marginBottom:8}}>
          <button onClick={()=>setExp(o?null:s.id)} aria-expanded={o} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:s.color+"12",border:`1px solid ${s.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:C.ink,marginBottom:2}}>{s.name}</div>
                <div style={{fontSize:11,color:C.mut}}>{s.desc}</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <span style={{fontSize:13,color:C.mut}}>{o?"▾":"▸"}</span>
            </div>
          </button>
          {o&&<div style={{padding:"0 16px 14px",borderTop:`1px solid ${C.bdr}`}} className="rk-in">
            <div style={{display:"flex",gap:6,margin:"12px 0 10px"}}>
              <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>✓ HOLD</div>
                <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.hold}</div>
              </div>
              <div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:8,color:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>✗ PASS</div>
                <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.pass}</div>
              </div>
            </div>
            <div style={{background:C.gold+"06",borderRadius:8,padding:"8px 10px",marginBottom:s.joker?8:0}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>💡 STRATEGY</div>
              <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{s.combos}</div>
            </div>
            {s.joker&&<div style={{background:"#FFF9E6",borderRadius:8,padding:"8px 10px",border:`1px solid ${C.gold}20`}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>🃏 JOKER TIP</div>
              <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{s.joker}</div>
            </div>}
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}>
              <span style={{fontSize:11,color:C.mut}}>{s.hands} possible hands</span>
            </div>
          </div>}
        </div>);})}
    </div>
  );
}

// MIDNIGHT COUNTDOWN
function MidnightCountdown({dn}){
  const [timeLeft,setTimeLeft]=useState("");
  useEffect(()=>{
    const tick=()=>{
      const now=new Date(),midnight=new Date();
      midnight.setHours(24,0,0,0);
      const diff=Math.max(0,midnight-now);
      const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
      setTimeLeft(`${h}h ${m.toString().padStart(2,"0")}m ${s.toString().padStart(2,"0")}s`);
    };
    tick();const iv=setInterval(tick,1000);return()=>clearInterval(iv);
  },[]);
  return(
    <div style={{textAlign:"center",padding:"20px 0",borderTop:`1px solid ${C.bdr}`,borderBottom:`1px solid ${C.bdr}`,margin:"8px 0 8px"}}>
      <div style={{fontSize:9,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:6}}>NEXT DAILY · #{dn+1}</div>
      <div style={{fontFamily:F.d,fontSize:22,fontWeight:800,color:C.ink,letterSpacing:-0.5,marginBottom:6}}>{timeLeft}</div>
      <div style={{fontSize:11,color:C.mut,fontWeight:500}}>5 minutes a day sharpens your passing strategy.</div>
    </div>
  );
}

// EMAIL SIGNUP
function EmailSignup(){
  const [email,setEmail]=useState("");
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const submit=async()=>{
    if(!email.includes("@")){setErr("Please enter a valid email.");return;}
    try{
      const res=await fetch("https://formspree.io/f/mgodekdb",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email})
      });
      if(!res.ok)throw new Error();
      setDone(true);setErr("");
    }catch{
      setErr("Something went wrong. Try again.");
    }
  };
  return(
    <div style={{...S.card,background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",borderColor:C.jade+"25",marginBottom:8}}>
      <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:6}}>STAY IN THE LOOP</div>
      {done?(
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:18,marginBottom:4}}>🀄</div>
          <div style={{fontSize:13,fontWeight:700,color:C.jade}}>You're on the list!</div>
          <div style={{fontSize:11,color:C.mut,marginTop:3}}>We'll let you know when we drop updates.</div>
        </div>
      ):(
        <>
          <p style={{fontSize:12,color:C.mut,margin:"0 0 10px",lineHeight:1.5}}>Get notified when new features and the 2027 card edition drops.</p>
          <div style={{display:"flex",gap:6}}>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()}
              placeholder="your@email.com"
              aria-label="Email address for updates"
              style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${err?C.cinn:C.bdr}`,fontSize:12,fontFamily:F.b,background:"#fff",color:C.ink,outline:"none"}}
            />
            <button onClick={submit} style={{padding:"10px 16px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b,whiteSpace:"nowrap"}}>Notify me</button>
          </div>
          {err&&<div style={{fontSize:11,color:C.cinn,marginTop:5}}>{err}</div>}
        </>
      )}
    </div>
  );
}

// HOME
function Home({streak,rounds,dDone,dRes,showHelp,setShowHelp,go,showStats,showSettings,showTutorial,showCardGuide,settings,showResult}){
  const [copied,setCopied]=useState(false);
  const dn=getDayNum(),wk=getWeekly(),yd=getYesterday(),stats=getStats();
  const streakBadge=getStreakBadge(streak);
  const expandSec=(s="")=>s.replace("Consec. Run","Consecutive Run").replace("Aln","Like Numbers");
  const stxt=dRes?`🀄 Rackle #${dn} · ${dRes.rating} ${dRes.emoji}\n${dRes.section?expandSec(dRes.section):""} · ${dRes.score!=null?(dRes.score*100).toFixed(0)+"% fit":""}${dRes.time?` · ⏱ ${fT(dRes.time)}`:""}\nplayrackle.com`:"";
  const cp=()=>{navigator.clipboard?.writeText(stxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  return(
    <div style={S.pg} className="rk-pg">
      {/* TOP UTILITY BAR */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:0}}>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {streak>0&&<div style={{display:"flex",alignItems:"center",gap:5,background:C.cinn+"08",border:`1px solid ${C.cinn}20`,borderRadius:20,padding:"4px 12px"}}>
            <span style={{fontSize:11}}>{streakBadge?streakBadge.badge:"🔥"}</span>
            <span style={{fontFamily:F.d,fontSize:12,fontWeight:800,color:C.cinn}}>{streak}</span>
            <span style={{fontSize:11,color:C.cinn,fontWeight:600,opacity:0.8}}>day streak</span>
          </div>}
          {rounds>0&&<div style={{display:"flex",alignItems:"center",gap:5,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 12px"}}>
            <span style={{fontSize:11}}>🎲</span>
            <span style={{fontFamily:F.d,fontSize:12,fontWeight:800,color:C.ink}}>{rounds}</span>
            <span style={{fontSize:11,color:C.mut,fontWeight:600}}>rounds played</span>
          </div>}
          {streak===0&&rounds===0&&<div style={{display:"flex",alignItems:"center",gap:5,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 12px"}}>
            <span style={{fontSize:12}}>🔥</span>
            <span style={{fontSize:12,color:C.mut,fontWeight:600}}>Play daily to build your streak</span>
          </div>}
        </div>
        <button onClick={showSettings} aria-label="Open settings" style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 14px",cursor:"pointer",fontSize:12,fontWeight:600,color:C.mut,fontFamily:F.b}}>Settings</button>
      </div>

      {/* HERO */}
      <div style={{textAlign:"center",padding:"18px 0 10px",marginBottom:0}}>
        <div className="rk-float" style={{fontSize:40,marginBottom:10,lineHeight:1}}>🀄</div>
        <h1 style={{fontFamily:F.d,fontSize:48,color:C.ink,margin:"0 0 6px",fontWeight:900,letterSpacing:-2.5,lineHeight:1}}>Rackle</h1>
        <p style={{fontFamily:F.d,fontSize:16,color:C.jade,margin:"0 0 10px",fontWeight:600,fontStyle:"italic",letterSpacing:0.3}}>Rack & Roll.</p>
        <p style={{fontSize:11,color:C.mut,margin:"0 0 4px",lineHeight:1.6,whiteSpace:"nowrap"}}>Rate your Charleston. Track your improvement. Share with your Mahj club.</p>
        <p style={{fontSize:11,color:C.mut,margin:0,lineHeight:1.5,maxWidth:240,marginLeft:"auto",marginRight:"auto",opacity:0.8}}>The passing ritual before every American Mahjong game.</p>
      </div>
      {streak>0&&streakBadge&&<div style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8,marginTop:16,background:C.gold+"06",borderColor:C.gold+"25"}}>
        <span style={{fontSize:24}}>{streakBadge.badge}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:C.ink,fontFamily:F.d}}>{streakBadge.title}</div>
          <div style={{fontSize:11,color:C.mut,marginTop:1}}>{streak}-day streak — {streakBadge.desc}</div>
        </div>
      </div>}

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,marginTop:16}}>
        <div style={{flex:1,height:1,background:C.bdr}}/>
        <span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>PLAY</span>
        <div style={{flex:1,height:1,background:C.bdr}}/>
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
        const ydComp=yd&&dRes?(dRes.gi<yd.gi?{label:"Better than yesterday",icon:"⬆️",c:C.jade}:dRes.gi===yd.gi?{label:"Same as yesterday",icon:"➡️",c:C.gold}:{label:"Yesterday was stronger",icon:"⬇️",c:C.cinn}):null;
        const gc=dRes?RCOL[dRes.gi]||C.jade:C.jade;
        return(
        <div style={{borderRadius:20,overflow:"hidden",marginBottom:8,boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
          {/* DARK HERO */}
          <div style={{background:"linear-gradient(160deg,#0F2016,#1B3A28,#0D1F13)",padding:"20px 20px 18px",textAlign:"center"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:3,fontWeight:700,marginBottom:12}}>TODAY'S DAILY · #{dn}</div>
            {dRes&&<>
              <div style={{fontSize:36,marginBottom:8,lineHeight:1}}>{dRes.emoji}</div>
              <div style={{fontFamily:F.d,fontSize:26,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1,marginBottom:12}}>{dRes.rating}</div>
            </>}
            <div style={{width:36,height:1.5,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"0 auto 14px"}}/>
            {dRes&&<div style={{display:"flex",justifyContent:"center",gap:20}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>SECTION</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{dRes.section}</div>
              </div>
              {dRes.score!=null&&<>
                <div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>FIT</div>
                  <div style={{fontSize:12,color:C.gold,fontWeight:800}}>{(dRes.score*100).toFixed(0)}% fit</div>
                </div>
              </>}
              {dRes.iqScore!=null&&<>
                <div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>IQ</div>
                  <div style={{fontSize:12,color:dRes.iqScore>=75?"#4ADE80":dRes.iqScore>=50?C.gold:C.cinn,fontWeight:800}}>{dRes.iqScore}</div>
                </div>
              </>}
              {dRes.time&&<>
                <div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>TIME</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>⏱ {fT(dRes.time)}</div>
                </div>
              </>}
            </div>}
            {/* Charleston IQ bar */}
            {dRes?.iqScore!=null&&<div style={{marginTop:14,padding:"0 8px"}}>
              <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.1)",overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:2,width:`${dRes.iqScore}%`,background:dRes.iqScore>=75?"#4ADE80":dRes.iqScore>=50?C.gold:C.cinn}}/>
              </div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginTop:4,letterSpacing:1}}>CHARLESTON IQ</div>
            </div>}
            {ydComp&&<div style={{marginTop:14,display:"flex",justifyContent:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 12px"}}>
                <span style={{fontSize:11}}>{ydComp.icon}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:600}}>{ydComp.label}</span>
              </div>
            </div>}
          </div>
          {/* ACTIONS + SHARE */}
          {dRes&&stxt&&<div style={{background:C.bg,padding:"12px 16px",borderTop:`1px solid ${C.bdr}`}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:C.ink,lineHeight:1.8,whiteSpace:"pre",textAlign:"center",background:"#fff",borderRadius:10,border:`1px solid ${C.bdr}`,padding:"10px 12px",marginBottom:10}}>{stxt}</div>
            <button onClick={cp} style={{...S.greenBtn,width:"100%",fontSize:13,padding:"12px 0",fontFamily:F.b,fontWeight:500,letterSpacing:0.2,marginBottom:8}}>{copied?"✓ Copied!":"📲 Share with your Mahj Group"}</button>
            <button onClick={showResult} style={{width:"100%",padding:"10px 0",borderRadius:12,border:`1px solid ${C.bdr}`,background:"#fff",fontSize:12,fontWeight:600,color:C.jade,cursor:"pointer",fontFamily:F.b}}>View full scorecard →</button>
            <p style={{fontSize:11,color:C.mut,textAlign:"center",margin:"8px 0 0",lineHeight:1.5}}>✓ Safe to share — everyone gets the same deal, no spoilers.</p>
          </div>}
        </div>
        );
      })()}

      {dDone&&<MidnightCountdown dn={dn}/>}

      <button onClick={()=>go("free")} aria-label="Play Practice Mode" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:20,borderRadius:16,padding:"18px 16px",textAlign:"left",background:`linear-gradient(135deg,${C.cinn}05,#fff)`,border:`1px solid ${C.cinn}20`}}>
        <div aria-hidden="true" style={{width:44,height:44,borderRadius:13,background:`linear-gradient(135deg,${C.cinn}20,${C.cinn}10)`,border:`1px solid ${C.cinn}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🀄</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:C.cinn,letterSpacing:2,fontWeight:700,marginBottom:5}}>UNLIMITED PLAY</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:5}}>Practice Mode</div>
          <div style={{fontSize:12,color:C.mut}}>Unlimited hands. No timer pressure. Build instincts for every section.</div>
        </div>
        <span aria-hidden="true" style={{fontSize:14,color:C.mut,fontWeight:600}}>›</span>
      </button>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{flex:1,height:1,background:C.bdr}}/>
        <span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>LEARN & EXPLORE</span>
        <div style={{flex:1,height:1,background:C.bdr}}/>
      </div>

      <button onClick={()=>setShowHelp(!showHelp)} aria-expanded={showHelp} aria-controls="help-panel"
        style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:8,borderRadius:16,padding:"18px 16px",textAlign:"left",background:showHelp?C.gold+"08":"#fff",border:`1px solid ${showHelp?C.gold+"30":C.bdr}`}}>
        <div style={{width:44,height:44,borderRadius:13,background:C.gold+"10",border:`1px solid ${C.gold}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📖</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:5}}>LEARN</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:5}}>How to Play</div>
          <div style={{fontSize:12,color:C.mut}}>Charleston rules & all 9 sections explained.</div>
        </div>
        <span aria-hidden="true" style={{fontSize:14,color:C.mut,fontWeight:600}}>{showHelp?"▾":"›"}</span>
      </button>

      {showHelp&&<div id="help-panel" style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",borderRadius:14,marginBottom:8}} className="rk-in">
        {["You're dealt 13 tiles. A timer starts.","Pass Right (3), Over (3), Left (0–3, blind). Jokers can't be passed.","Option to continue with a second Charleston and a Courtesy Pass.","Choose your target section — Rackle rates how well your tiles fit."].map((s,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={S.dot} aria-hidden="true">{i+1}</div><span style={{fontSize:12,color:C.mut,lineHeight:1.6}}>{s}</span></div>))}
        <button onClick={showTutorial} style={{marginTop:4,background:"none",border:`1px solid ${C.gold}30`,borderRadius:8,padding:"6px 12px",fontSize:11,color:C.gold,cursor:"pointer",fontWeight:600}}>📖 Full interactive tutorial →</button>
      </div>}

      {rounds>=3&&<button onClick={showStats} aria-label="View my stats and section mastery" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:8,borderRadius:16,padding:"18px 16px",textAlign:"left",background:"#fff",border:`1px solid ${C.bdr}`}}>
        <div style={{width:44,height:44,borderRadius:13,background:C.bg2,border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📊</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:5}}>YOUR HISTORY</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:5}}>My Stats</div>
          <div style={{fontSize:12,color:C.mut}}>Section Mastery · Ratings · Streak History</div>
        </div>
        <span style={{fontSize:14,color:C.mut,fontWeight:600}}>›</span>
      </button>}

      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={showTutorial} aria-label="Take the interactive tutorial" style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${C.jade}25`,background:C.jade+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>🀄</span>
          <div style={{fontSize:10,color:C.jade,letterSpacing:1.5,fontWeight:700}}>WALKTHROUGH</div>
          <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2}}>Interactive Tutorial</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.4}}>Learn the Charleston step by step</div>
        </button>
        <button onClick={showCardGuide} aria-label="View the 2026 card guide" style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${C.gold}25`,background:C.gold+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>📋</span>
          <div style={{fontSize:10,color:C.gold,letterSpacing:1.5,fontWeight:700}}>2026 NMJL CARD</div>
          <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2}}>Card Guide</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.4}}>Hold & pass tips for all 9 sections</div>
        </button>
      </div>

      <EmailSignup/>

      <div style={{textAlign:"center",padding:"22px 0 8px",marginTop:8}}>
        <div aria-hidden="true" style={{width:40,height:1,background:C.bdr,margin:"0 auto 16px"}}/>
        <div style={{fontSize:12,color:C.jade,fontFamily:F.d,fontStyle:"italic"}}>Rack & Roll 🀄</div>
        <div style={{fontSize:11,color:C.mut,marginTop:8,lineHeight:1.6}}>Made for the American Mahjong community</div>
        <div style={{marginTop:12}}>
          <a href="https://playrackle.com" target="_blank" rel="noopener noreferrer" style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,letterSpacing:-0.3,textDecoration:"none"}}>Rackle</a>
        </div>
        <div style={{marginTop:10,display:"flex",justifyContent:"center",alignItems:"center",gap:8}}>
          <a href="https://instagram.com/playrackle" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.ink,textDecoration:"none",fontWeight:600,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 14px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5.5" stroke={C.ink} strokeWidth="2" fill="none"/>
              <circle cx="12" cy="12" r="4.5" stroke={C.ink} strokeWidth="2" fill="none"/>
              <circle cx="17.5" cy="6.5" r="1" fill={C.ink}/>
            </svg>
            @playrackle
          </a>
          <a href="mailto:hello@playrackle.com" style={{display:"flex",alignItems:"center",fontSize:12,color:C.ink,textDecoration:"none",fontWeight:600,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 14px"}}>Contact</a>
        </div>
        <div style={{fontSize:10,color:C.mut,marginTop:14,opacity:0.7}}>© {new Date().getFullYear()} playrackle.com · All rights reserved</div>
      </div>
    </div>
  );
}
function Pill({i,v,l,hl}){return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}} aria-label={`${l}: ${v}`}><span aria-hidden="true" style={{fontSize:12}}>{i}</span><div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{v}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{l}</div></div></div>);}

// STATS
function Stats({home}){
  const stats=getStats(),wk=getWeekly();
  const tt=stats?(stats.trend>0.5?"Improving 📈":stats.trend<-0.5?"Slipping 📉":"Steady ➡️"):null;
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      {!stats?(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <div aria-hidden="true" style={{fontSize:32}}>📊</div>
          <div style={{fontSize:14,color:C.mut,marginTop:8}}>Play a few rounds first!</div>
        </div>
      ):(
        <>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <Pill i="🎲" v={stats.total} l="ROUNDS"/>
            <Pill i={REMO[stats.best]} v={RATS[stats.best].split(" ")[0]} l="BEST RATING"/>
            {stats.fastest&&<Pill i="⏱" v={fT(stats.fastest)} l="FASTEST"/>}
          </div>
          {stats.trend!==null&&<div style={{...S.card,textAlign:"center",padding:12}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:4}}>RECENT TREND</div>
            <div style={{fontSize:16,fontWeight:700,color:stats.trend>0.5?C.jade:stats.trend<-0.5?C.cinn:C.gold}}>{tt}</div>
            <div style={{fontSize:11,color:C.mut,marginTop:4}}>Last 5 avg: {RATS[Math.round(stats.ra)]}</div>
          </div>}
          <div style={{...S.card,textAlign:"center",padding:12}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:6}}>AVERAGE RATING</div>
            <div style={{display:"inline-block",padding:"6px 16px",borderRadius:12,background:RCOL[Math.round(stats.avg)]+"12",border:`2px solid ${RCOL[Math.round(stats.avg)]}28`}}>
              <span style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:RCOL[Math.round(stats.avg)]}}>{RATS[Math.round(stats.avg)]}</span>
            </div>
          </div>
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
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.bdr}`}} aria-label={`${s.name}: ${s.cnt===0?"Not yet played":lv}, ${s.cnt} rounds played`}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span aria-hidden="true" style={{fontSize:16}}>{s.icon}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:C.ink}}>{s.name}{isW?" ⭐":""}</div>
                      <div style={{fontSize:10,color:C.mut,marginTop:1}}>{s.cnt} round{s.cnt!==1?"s":""}</div>
                    </div>
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
    </div>
  );
}

// PASS OVERVIEW (expandable with per-pass breakdown)
function PassOverview({passLog,passed,large}){
  const [open,setOpen]=useState(false);
  const hasLog=passLog&&passLog.length>0;
  return(
    <div style={{...S.card,padding:0,overflow:"hidden",marginBottom:8}}>
      <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div>
          <span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>PASS OVERVIEW</span>
          <span style={{fontSize:11,color:C.mut,marginLeft:8,fontWeight:500}}>{passed.length} tiles passed · {hasLog?passLog.length+" rounds":"—"}</span>
        </div>
        <span aria-hidden="true" style={{fontSize:13,color:C.mut}}>{open?"▾":"▸"}</span>
      </button>
      {open&&<div style={{borderTop:`1px solid ${C.bdr}`}} className="rk-in">
        {hasLog?passLog.map((p,i)=>(
          <div key={i} style={{padding:"10px 14px",borderBottom:i<passLog.length-1?`1px solid ${C.bdr}`:undefined}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>{p.label.toUpperCase()}{p.blind?" · BLIND":""}</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:C.cinn,letterSpacing:1,fontWeight:700,marginBottom:4}}>✗ PASSED OUT</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:2}}>{p.out.length>0?p.out.map((t,j)=><Ti key={j} t={t}/>):<span style={{fontSize:10,color:C.mut}}>None</span>}</div>
              </div>
              <div style={{width:1,background:C.bdr,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:C.jade,letterSpacing:1,fontWeight:700,marginBottom:4}}>✓ RECEIVED</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:2}}>{p.in.length>0?p.in.map((t,j)=><Ti key={j} t={t}/>):<span style={{fontSize:10,color:C.mut}}>None</span>}</div>
              </div>
            </div>
          </div>
        )):(
          <div style={{padding:"10px 14px"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{passed.map((t,i)=><Ti key={i} t={t} large={large}/>)}</div>
          </div>
        )}
      </div>}
    </div>
  );
}

// READY OVERLAY
function ReadyOverlay({mode,dayNum,onReady,onHome}){
  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50,padding:"0 20px",background:"rgba(250,247,241,0.75)",backdropFilter:"blur(6px)"}}>
      <div className="rk-in" style={{width:"100%",maxWidth:400,background:"#fff",borderRadius:24,border:`1.5px solid ${C.bdr}`,boxShadow:"0 20px 60px rgba(0,0,0,0.12),0 4px 16px rgba(0,0,0,0.06)",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#0F2016,#1B3A28)",padding:"24px 24px 20px",textAlign:"center"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,fontWeight:700,marginBottom:10}}>
            {mode==="daily"?`DAILY RACKLE · #${dayNum}`:"PRACTICE MODE"}
          </div>
          <div style={{fontFamily:F.d,fontSize:30,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1,marginBottom:4}}>Ready to Rackle?</div>
          <div style={{width:32,height:1.5,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"12px auto 12px"}}/>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>
            {mode==="daily"?"Same deal for every player. One shot.":"Unlimited hands. Build your instincts."}
          </div>
        </div>
        <div style={{padding:"16px 20px 20px",display:"flex",gap:10,background:C.bg}}>
          <button onClick={onHome} style={{flex:1,padding:"13px 0",borderRadius:12,border:`1px solid ${C.bdr}`,background:"#fff",color:C.mut,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.b}}>← Home</button>
          <button onClick={onReady} style={{flex:2,padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:0.3,cursor:"pointer",boxShadow:`0 4px 14px rgba(27,125,78,0.35)`}}>Yes, let's go →</button>
        </div>
      </div>
    </div>
  );
}

// GAME
function Game({mode,home,onDone,settings}){
  const [phase,setPhase]=useState("deal");
  const [ready,setReady]=useState(false);
  const [flipped,setFlipped]=useState([]);
  const [hand,setHand]=useState([]);const [pool,setPool]=useState([]);
  const [sel,setSel]=useState([]);const [passed,setPassed]=useState([]);
  const [passLog,setPassLog]=useState([]); // per-pass breakdown
  const [newIdx,setNewIdx]=useState([]);const [jw,setJw]=useState(false);
  const [chosenSec,setChosenSec]=useState(null);const [showRef,setShowRef]=useState(false);
  const [showHint,setShowHint]=useState(false);const [hintExp,setHintExp]=useState(null);
  const [cn,setCn]=useState(1);const [pi,setPi]=useState(0);
  const [copied,setCopied]=useState(false);
  const [st,setSt]=useState(null);const [el,setEl]=useState(0);const [td,setTd]=useState(false);
  const [showLeave,setShowLeave]=useState(false);
  const elRef=useRef(0);const stRef=useRef(null);
  const cs=cn===1?F1C:S2C;const cp=cs[pi];
  const large=settings?.tileSize==="large";

  // HAPTIC
  const haptic=useCallback((ms=30)=>{
    if(settings?.haptic&&navigator.vibrate)navigator.vibrate(ms);
  },[settings?.haptic]);

  useEffect(()=>{
    const d=mode==="daily"?seededShuffle(buildDeck(),getDailySeed()):shuffle(buildDeck());
    const dealt=d.slice(0,13);setHand(dealt);setPool(d.slice(13).filter(t=>t.t!=="j"));
  },[]);

  useEffect(()=>{
    if(!ready)return;
    // Flip tiles one by one with stagger
    hand.forEach((_,i)=>{
      setTimeout(()=>setFlipped(f=>[...f,i]),i*80);
    });
    // Wait for all flips + a beat, then switch to pass phase
    setTimeout(()=>{
      setPhase("pass");
      stRef.current=Date.now();
      setSt(Date.now());
    },hand.length*80+600);
  },[ready]);

  // TIMER — tick
  useEffect(()=>{
    if(!st||td)return;
    const iv=setInterval(()=>{
      const now=Date.now();
      const elapsed=Math.floor((now-stRef.current+elRef.current)/1000);
      setEl(elapsed);
    },1000);
    return()=>clearInterval(iv);
  },[st,td]);

  // PAUSE TIMER when tab hidden
  useEffect(()=>{
    const onVis=()=>{
      if(document.hidden){
        // Pause: save elapsed so far
        if(stRef.current){elRef.current+=Date.now()-stRef.current;stRef.current=null;setSt(null);}
      } else {
        // Resume
        if(!td&&!document.hidden){stRef.current=Date.now();setSt(Date.now());}
      }
    };
    document.addEventListener("visibilitychange",onVis);
    return()=>document.removeEventListener("visibilitychange",onVis);
  },[td]);

  // BACK BUTTON intercept
  useEffect(()=>{
    if(phase==="deal"||phase==="result")return;
    const onPop=(e)=>{e.preventDefault();setShowLeave(true);window.history.pushState(null,"","");};
    window.history.pushState(null,"","");
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[phase]);

  const toggle=(i)=>{
    if(phase!=="pass"||newIdx.length>0)return;
    if(hand[i].t==="j"&&!sel.includes(i)){haptic(50);setJw(true);setTimeout(()=>setJw(false),1800);return;}
    const max=cp.blind?(cp.max||3):cp.req;
    setSel(p=>{
      const n=p.includes(i)?p.filter(x=>x!==i):p.length>=max?p:[...p,i];
      if(n.length!==p.length)haptic(20);
      return n;
    });
  };
  const cTog=(i)=>{
    if(hand[i].t==="j"&&!sel.includes(i)){haptic(50);setJw(true);setTimeout(()=>setJw(false),1800);return;}
    setSel(p=>{
      const n=p.includes(i)?p.filter(x=>x!==i):p.length>=3?p:[...p,i];
      if(n.length!==p.length)haptic(20);
      return n;
    });
  };

  const doSwap=(count)=>{
    haptic(40);
    const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);
    const rem=hand.filter((_,i)=>!sel.includes(i));const safe=pool.filter(t=>t.t!=="j");
    const inc=safe.slice(0,count);setPool(safe.slice(count));
    const comb=[...rem,...inc];const ni=[];for(let i=rem.length;i<comb.length;i++)ni.push(i);
    // Log this pass
    const passLabel=cn===1
      ? (pi===0?"1st Charleston · Pass Right":pi===1?"1st Charleston · Pass Over":"1st Charleston · Pass Left (Blind)")
      : (pi===0?"2nd Charleston · Pass Left":pi===1?"2nd Charleston · Pass Over":"2nd Charleston · Pass Right (Blind)");
    setPassLog(pl=>[...pl,{label:passLabel,out:pt,in:inc,blind:cp.blind}]);
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
    const a=adv(hand,chosenSec),e=ev(hand),top=e[0],gi=gri(top.score);
    const totalEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);
    const iq=charlestonIQ(passLog,hand);
    const iqScore=iq?iq.iq:null;
    onDone({rating:RATS[gi],emoji:REMO[gi],section:`${top.icon} ${top.name}`,sid:top.id,score:top.score,time:totalEl,gi,iqScore});
    setPhase("result");
  };

  const restart=()=>{
    const d=shuffle(buildDeck());const dealt=d.slice(0,13);
    setHand(dealt);setPool(d.slice(13).filter(t=>t.t!=="j"));
    setSel([]);setPassed([]);setPassLog([]);setNewIdx([]);setCn(1);setPi(0);setChosenSec(null);
    setShowRef(false);setShowHint(false);setHintExp(null);setCopied(false);
    setTd(false);elRef.current=0;stRef.current=null;setEl(0);
    setPhase("deal");
    setTimeout(()=>{setPhase("pass");stRef.current=Date.now();setSt(Date.now());},500);
  };

  const getDisplayTime=()=>{
    if(!settings?.showTimer)return null;
    return fT(el);
  };

  const isBlind=cp.blind,canPass=isBlind?sel.length<=(cp.max||3):sel.length===cp.req,hasNew=newIdx.length>0;

  // Compute result data once so all phases can use it
  const resultData=(phase==="result"&&chosenSec)?()=>{
    const a=adv(hand,chosenSec),e=ev(hand),top=e[0],gi=gri(top.score);
    const r=RATS[gi],gc=RCOL[gi],cd=SECS.find(s=>s.id===chosenSec),pct=(top.score*100).toFixed(0);
    const isD=mode==="daily",dn=getDayNum();
    const totalEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);
    const secName=(top.name||"").replace("Consec. Run","Consecutive Run");
    const iq=charlestonIQ(passLog,hand);
    const iqScore=iq?iq.iq:null;
    const stxt=`🀄 Rackle${isD?" #"+dn:""} · ${r} ${REMO[gi]}\n${top.icon} ${secName} · ${pct}% fit${iqScore!==null?` · IQ ${iqScore}`:""}${totalEl?` · ⏱ ${fT(totalEl)}`:""}\nplayrackle.com`;
    return{a,top,gi,r,gc,cd,pct,isD,dn,totalEl,stxt,iq,iqScore};
  }:null;
  const rd=resultData?resultData():null;

  return(
    <div style={{...S.pg,position:"relative",minHeight:"100vh"}} className="rk-pg">
      {phase==="deal"&&hand.length>0&&(
        <>
          {!ready&&<ReadyOverlay mode={mode} dayNum={getDayNum()} onReady={()=>setReady(true)} onHome={home}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{...S.back,opacity:0,pointerEvents:"none"}}>← Back</div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div>
              <div style={{fontFamily:F.d,fontSize:9,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>Rack & Roll.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
              <span style={{fontSize:10,color:C.mut,fontWeight:700}}>{mode==="daily"?`Daily #${getDayNum()}`:"Practice"}</span>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:10,color:C.mut,fontWeight:600}}>1st Charleston · Pass 1/3</span>
          </div>
          <div style={{display:"flex",gap:3,marginBottom:10}}>{[0,1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i===0?C.gold:C.bdr}}/>)}</div>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span style={{fontSize:22}}>👉</span>
            <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>Pass Right</h2>
            <p style={{fontSize:12,color:C.mut}}>Select exactly 3 tiles to pass</p>
          </div>
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK (13 tiles)</span>
              <div style={{display:"flex",gap:4}}>
                <button disabled style={{...S.sortBtn,opacity:0.25}}>Sort</button>
                <button disabled style={{...S.sortBtn,opacity:0.25}}>📖 2026 Card</button>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
              {hand.map((t,i)=>{
                const isFlipped=flipped.includes(i);
                return isFlipped
                  ? <div key={i} className="rk-flip"><Ti t={t} large={large}/></div>
                  : <div key={i} style={{width:large?44:37,height:large?60:50,borderRadius:7,background:`linear-gradient(160deg,${C.jade}DD,#145C35)`,border:`1.5px solid ${C.jade}50`,flexShrink:0,boxShadow:`0 3px 10px rgba(27,125,78,0.3)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:14,opacity:0.2}}>🀄</span>
                    </div>
              })}
            </div>
          </div>
          <div style={{textAlign:"center",fontSize:13,color:C.mut,fontWeight:700,margin:"5px 0",opacity:0.25}}>0 of 3 selected</div>
          <button disabled style={{...S.passBtn,opacity:0.2}}>🔄 Pass 0 Right</button>
        </>
      )}

      {phase==="result"&&rd&&(
        <>
          <RackleHeader onBack={home}/>

          {/* SCORECARD HEADER */}
          <div role="status" aria-live="polite" style={{borderRadius:20,overflow:"hidden",marginBottom:10,background:`linear-gradient(160deg,#0F2016,#1B3A28,#0D1F13)`,padding:"28px 20px 24px",textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.2)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",letterSpacing:3,fontWeight:700,marginBottom:14}}>{rd.isD?`DAILY RACKLE · #${rd.dn}`:"PRACTICE MODE · SCORECARD"}</div>
            <div style={{fontSize:44,marginBottom:10,lineHeight:1}}>{REMO[rd.gi]}</div>
            <div style={{fontFamily:F.d,fontSize:32,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1,marginBottom:6}}>{rd.r}</div>
            <div style={{width:40,height:2,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"14px auto 14px"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:20}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>SECTION</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{rd.top.icon} {rd.top.name}</div>
              </div>
              <div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>FIT</div>
                <div style={{fontSize:13,color:C.gold,fontWeight:800}}>{rd.pct}%</div>
              </div>
              <div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:3}}>TIME</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{fT(rd.totalEl)}</div>
              </div>
            </div>
          </div>

          {/* FINAL RACK */}
          <Rack hand={hand} label="FINAL RACK" large={large}/>

          {/* SCORE BREAKDOWN — Charleston IQ */}
          <div style={{...S.card,borderColor:rd.a.verdict==="Strong choice"?C.jade+"30":rd.a.verdict==="Playable but risky"?C.gold+"30":C.cinn+"28",background:rd.a.verdict==="Strong choice"?C.jade+"04":rd.a.verdict==="Playable but risky"?C.gold+"04":C.cinn+"03",marginBottom:8}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>CHARLESTON IQ</div>
            {/* IQ score bar */}
            {rd.iqScore!==null&&<div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                <span style={{fontFamily:F.d,fontSize:28,fontWeight:900,color:rd.iqScore>=75?C.jade:rd.iqScore>=50?C.gold:C.cinn,lineHeight:1}}>{rd.iqScore}</span>
                <span style={{fontSize:11,color:C.mut,fontWeight:600}}>/ 100 Charleston IQ</span>
              </div>
              <div style={{height:6,borderRadius:3,background:C.bdr,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,width:`${rd.iqScore}%`,background:rd.iqScore>=75?`linear-gradient(90deg,${C.jade},#1FA862)`:rd.iqScore>=50?`linear-gradient(90deg,${C.gold},#C49A3C)`:C.cinn,transition:"width 1s ease"}}/>
              </div>
            </div>}
            {/* verdict + section pick */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingTop:rd.iqScore!==null?8:0,borderTop:rd.iqScore!==null?`1px solid ${C.bdr}`:undefined}}>
              <span style={{fontSize:20}}>{rd.a.emoji}</span>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:C.ink}}>{rd.a.verdict}</div>
                <div style={{fontSize:11,color:C.mut}}>Section picked: {rd.cd?.icon} {rd.cd?.name} · Best fit: {rd.top.icon} {rd.top.name}</div>
              </div>
            </div>
            <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"0 0 10px"}}>{rd.a.reason}</p>
            {rd.a.alts.length>0&&<div style={{paddingTop:8,borderTop:`1px solid ${C.bdr}`,marginBottom:10}}>
              <div style={{fontSize:9,color:C.mut,fontWeight:700,marginBottom:4}}>ALSO CONSIDER</div>
              {rd.a.alts.map(x=><div key={x.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0"}}>
                <span style={{fontSize:11,color:C.ink}}>{x.icon} {x.name}</span>
                <span style={{fontSize:11,color:x.color,fontWeight:700}}>{(x.score*100).toFixed(0)}% fit</span>
              </div>)}
            </div>}
            {/* share inside the card */}
            <button onClick={()=>{navigator.clipboard?.writeText(rd.stxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}} style={{width:"100%",padding:"10px 0",borderRadius:10,border:`1px solid ${C.bdr}`,background:"#fff",fontSize:12,fontWeight:600,color:C.ink,cursor:"pointer",fontFamily:F.b,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              {copied?"✓ Copied!":"📋 Copy score to share"}
            </button>
          </div>

          {/* PASS OVERVIEW — expandable with per-pass breakdown */}
          {(passLog.length>0||passed.length>0)&&<PassOverview passLog={passLog} passed={passed} large={large}/>}

          {/* SHARE BLOCK */}
          <div style={{...S.shareCard,padding:0,overflow:"hidden",marginBottom:8}}>
            <div style={{padding:"14px 20px"}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:C.ink,lineHeight:1.8,whiteSpace:"pre",background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center"}}>{rd.stxt}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{navigator.clipboard?.writeText(rd.stxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}} style={{...S.greenBtn,flex:1,fontSize:12,padding:"11px 0",fontFamily:F.b,fontWeight:600,letterSpacing:0.1}} aria-label="Copy result to clipboard">{copied?"✓ Copied!":"📋 Copy"}</button>
                <button onClick={()=>{const sms=`sms:?&body=${encodeURIComponent(rd.stxt)}`;window.open(sms,"_self");}} style={{...S.greenBtn,flex:2,fontSize:12,padding:"11px 0",fontFamily:F.b,fontWeight:600,letterSpacing:0.1,background:`linear-gradient(135deg,#2460A8,#1A4A8A)`}} aria-label="Share via SMS">📲 Share with your Mahj club</button>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={home} style={{...S.oBtn,flex:1}} aria-label="Return to home screen">← Home</button>
            {!rd.isD&&<button onClick={restart} style={{...S.greenBtn,flex:1}} aria-label="Deal a new hand">Deal Again</button>}
          </div>
        </>
      )}

      {phase==="askSecond"&&<Ask icon="🔄" title="Continue Charleston?" desc="Another round: Left → Over → Right?" hand={hand} timer={getDisplayTime()} onSort={()=>setHand(sortHand(hand))} onNo={()=>setPhase("askCourtesy")} onYes={()=>{setCn(2);setPi(0);setSel([]);setNewIdx([]);setPhase("pass");}} large={large}/>}
      {phase==="askCourtesy"&&<Ask icon="🤝" title="Courtesy Pass?" desc="Pass 1–3 tiles across." hand={hand} timer={getDisplayTime()} onSort={()=>setHand(sortHand(hand))} onNo={()=>{stopTimer();setSel([]);setNewIdx([]);setPhase("chooseHand");}} onYes={()=>{setSel([]);setNewIdx([]);setPhase("courtesy");}} large={large}/>}

      {phase==="courtesy"&&(
        <>
          <RackleHeader onBack={()=>setShowLeave(true)}/>
          {getDisplayTime()&&<div style={{textAlign:"center",marginBottom:4}}><span aria-label={`Time elapsed: ${getDisplayTime()}`} style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span></div>}
          <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"0 0 2px",textAlign:"center"}}>Courtesy Pass</h2>
          <p style={{fontSize:12,color:C.mut,textAlign:"center",marginBottom:10}}>Select 1–3 tiles to pass across</p>
          {jw&&<JW/>}
          <div style={S.card}><RH hand={hand} onSort={()=>setHand(sortHand(hand))}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t} sel={sel.includes(i)} dim={t.t==="j"} onClick={()=>cTog(i)} large={large}/>)}</div></div>
          <div aria-live="polite" style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"4px 0"}}>{sel.length}/3 selected</div>
          <button
            onClick={()=>{if(sel.length<1)return;haptic(40);const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);const rem=hand.filter((_,i)=>!sel.includes(i));const safe=pool.filter(t=>t.t!=="j");const inc=safe.slice(0,sel.length);setPool(safe.slice(sel.length));setHand([...rem,...inc]);setPassLog(pl=>[...pl,{label:"Courtesy Pass",out:pt,in:inc,blind:false}]);setSel([]);setNewIdx([]);stopTimer();setPhase("chooseHand");}}
            disabled={sel.length<1}
            aria-label={`Pass ${sel.length} tile${sel.length!==1?"s":""} across`}
            style={{...S.passBtn,opacity:sel.length>=1?1:0.3}}
          >🔄 {sel.length<1?"Skip (pass 0)":`Pass ${sel.length}`}</button>
        </>
      )}

      {phase==="chooseHand"&&(
        <>
          <RackleHeader onBack={()=>setShowLeave(true)}/>
          {getDisplayTime()&&<div style={{textAlign:"center",marginBottom:4}}><span aria-label={`Time elapsed: ${getDisplayTime()}`} style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span></div>}
          <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px",textAlign:"center"}}>What hand are you playing?</h2>
          <p style={{fontSize:12,color:C.mut,marginBottom:8,textAlign:"center"}}>Pick your target section.</p>
          <Rack hand={hand} label="YOUR RACK" showSort onSort={()=>setHand(sortHand(hand))} large={large}/>
          <button onClick={()=>setShowRef(!showRef)} aria-expanded={showRef} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,background:showRef?C.gold+"06":"#fff"}}>
            <span style={{fontSize:12,fontWeight:600,color:showRef?C.gold:C.ink}}>📖 {showRef?"Hide":"Show"} 2026 Card Guide</span><span aria-hidden="true" style={{color:C.mut}}>{showRef?"▾":"▸"}</span>
          </button>
          {showRef&&<CG onClose={()=>setShowRef(false)}/>}
          <fieldset style={{border:"none",padding:0,margin:0}}>
            <legend style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:6,padding:0}}>Choose your target section:</legend>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {SECS.map(s=>{const isSel=chosenSec===s.id;return(
                <button key={s.id} onClick={()=>{haptic(20);setChosenSec(s.id);}} role="radio" aria-checked={isSel} aria-label={`${s.name}: ${s.desc}`} style={{cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${isSel?s.color:C.bdr}`,background:isSel?s.color+"08":"#fff",textAlign:"left"}}>
                  <div style={{fontSize:12,fontWeight:700,color:isSel?s.color:C.ink,marginBottom:2}}><span aria-hidden="true" style={{marginRight:4}}>{s.icon}</span>{s.name}</div>
                  <div style={{fontSize:10,color:C.mut,lineHeight:1.3}}>{s.desc}</div>
                  {isSel&&<div style={{marginTop:5,fontSize:9,color:s.color,fontWeight:700,letterSpacing:0.5}}>✓ Selected</div>}
                </button>);})}
            </div>
          </fieldset>
          <button onClick={confirm} disabled={!chosenSec} aria-label="Confirm section and rate my hand" style={{...S.greenBtn,width:"100%",marginTop:4,opacity:chosenSec?1:0.3}}>Rate My Hand →</button>
        </>
      )}

      {phase==="pass"&&(
        <>
          {showLeave&&<LeaveModal onStay={()=>setShowLeave(false)} onLeave={()=>{setShowLeave(false);home();}}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <button onClick={()=>setShowLeave(true)} style={S.back} aria-label="Leave this game">← Back</button>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div>
              <div style={{fontFamily:F.d,fontSize:9,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>Rack & Roll.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
              <span style={{fontSize:10,color:C.mut,fontWeight:700}}>{mode==="daily"?`Daily #${getDayNum()}`:"Practice"}</span>
              {getDisplayTime()&&<span aria-label={`Time elapsed: ${getDisplayTime()}`} style={{fontSize:11,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span>}
            </div>
          </div>
          {pi===0&&cn===1&&!hasNew&&<div style={{marginBottom:4}}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:10,color:C.mut,fontWeight:600}}>{cn===1?"1st":"2nd"} Charleston · Pass {pi+1}/3</span>
          </div>
          <div role="progressbar" aria-valuenow={pi} aria-valuemin={0} aria-valuemax={3} aria-label={`Charleston progress: step ${pi+1} of 3`} style={{display:"flex",gap:3,marginBottom:10}}>{[0,1,2].map(i=><div key={i} aria-hidden="true" style={{flex:1,height:4,borderRadius:2,background:i<pi?C.jade:i===pi?(hasNew?C.jade:C.gold):C.bdr}}/>)}</div>
          <div style={{textAlign:"center",marginBottom:10}}>
            <span aria-hidden="true" style={{fontSize:22}}>{cp.icon}</span>
            <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>Pass {cp.dir}{isBlind?" (Blind)":""}</h2>
            <p role="status" aria-live="polite" style={{fontSize:12,color:hasNew?C.jade:C.mut,fontWeight:hasNew?600:400}}>
              {hasNew?`✓ ${newIdx.length} new tile${newIdx.length!==1?"s":""} received`:isBlind?`Select 0–${cp.max||3} tiles to pass`:`Select exactly ${cp.req} tiles to pass`}
            </p>
          </div>
          {jw&&<JW/>}
          <div style={S.card}>
            <RH hand={hand} onSort={()=>setHand(sortHand(hand))} showRef={showRef} onRef={()=>setShowRef(!showRef)}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t} sel={sel.includes(i)} isNew={newIdx.includes(i)} dim={t.t==="j"&&!hasNew} onClick={!hasNew?()=>toggle(i):undefined} large={large}/>)}</div>
          </div>
          {showRef&&<CG onClose={()=>setShowRef(false)}/>}
          {!hasNew&&<>
            <div role="status" aria-live="polite" style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"5px 0"}}>{sel.length} of {isBlind?(cp.max||3):cp.req} selected</div>
            <button
              onClick={doPass}
              disabled={!canPass&&!(isBlind&&sel.length===0)}
              aria-label={isBlind&&sel.length===0?`Skip — pass 0 tiles ${cp.dir}`:`Pass ${sel.length} tiles ${cp.dir}`}
              style={{...S.passBtn,opacity:canPass||(isBlind&&sel.length===0)?1:0.3}}
            >
              🔄 {isBlind&&sel.length===0?"Skip (pass 0)":`Pass ${sel.length} ${cp.dir}`}
            </button>
          </>}
          {!hasNew&&mode==="free"&&<div style={{marginTop:8}}>
            <button onClick={()=>setShowHint(!showHint)} aria-expanded={showHint} aria-controls="hint-panel" style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:8,padding:"6px 12px",fontSize:11,color:showHint?C.jade:C.mut,cursor:"pointer",fontWeight:600,width:"100%"}}>{showHint?"Hide Hint":"💡 Hint — Best sections for your rack"}</button>
            {showHint&&<div id="hint-panel" style={{marginTop:6}} className="rk-in">
              {ev(hand).slice(0,4).map(s=>(<div key={s.id}>
                <button onClick={()=>setHintExp(hintExp===s.id?null:s.id)} aria-expanded={hintExp===s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"5px 8px",marginBottom:2,borderRadius:8,background:s.score>0.05?s.color+"08":C.bg2,border:`1px solid ${s.score>0.05?s.color+"20":C.bdr}`,cursor:"pointer"}}>
                  <span style={{fontSize:10,color:s.score>0.05?s.color:C.mut,fontWeight:600}}>{s.icon} {s.name} — {(s.score*100).toFixed(0)}% fit</span><span aria-hidden="true" style={{fontSize:10,color:C.mut}}>{hintExp===s.id?"▾":"▸"}</span>
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

// SHARED
function Ask({icon,title,desc,hand,timer,onNo,onYes,onSort,large}){
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={onNo}/>
      {timer&&<div style={{textAlign:"center",marginBottom:4}}><span aria-label={`Time elapsed: ${timer}`} style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {timer}</span></div>}
      <div style={{textAlign:"center",marginBottom:12}}><div aria-hidden="true" style={{fontSize:24,marginBottom:6}}>{icon}</div><h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px"}}>{title}</h2><p style={{fontSize:12,color:C.mut}}>{desc}</p></div>
      <Rack hand={hand} label="YOUR RACK" showSort={!!onSort} onSort={onSort} large={large}/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={onNo} style={{...S.oBtn,flex:1}} aria-label={`No, skip ${title}`}>No, skip</button>
        <button onClick={onYes} style={{...S.greenBtn,flex:2}} aria-label={`Yes, ${title}`}>Yes, continue →</button>
      </div>
    </div>);
}
function JW(){return(<div role="alert" className="rk-in" style={{padding:"6px 10px",background:C.cinn+"08",borderRadius:8,border:`1px solid ${C.cinn}15`,textAlign:"center",marginBottom:6}}><span style={{fontSize:11,color:C.cinn,fontWeight:600}}>🃏 Jokers cannot be passed — they're too valuable!</span></div>);}
function RH({hand,onSort,showRef,onRef}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK ({hand.length} tiles)</span>
      <div style={{display:"flex",gap:4}}>
        <button onClick={onSort} style={S.sortBtn} aria-label="Sort tiles by suit and number">Sort</button>
        {onRef&&<button onClick={onRef} aria-expanded={showRef} style={{...S.sortBtn,background:showRef?C.jade+"10":"none",color:showRef?C.jade:C.mut,borderColor:showRef?C.jade+"30":C.bdr}} aria-label="Toggle 2026 Card Guide">📖 2026 Card</button>}
      </div>
    </div>);
}
function Rack({hand,label,showSort,onSort,large}){
  return(
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>{label}</span>
        {showSort&&<button onClick={onSort} style={S.sortBtn} aria-label="Sort tiles">Sort</button>}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t} large={large}/>)}</div>
    </div>);
}
function CG({onClose}){
  const [exp,setExp]=useState(null);
  return(
    <div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",maxHeight:380,overflowY:"auto"}} className="rk-in" role="region" aria-label="2026 Card Guide">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,position:"sticky",top:0,background:"#FFFFF8",paddingBottom:3,zIndex:1}}>
        <span style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700}}>📖 2026 CARD GUIDE</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer"}} aria-label="Close card guide">✕</button>
      </div>
      {SECS.map(s=>{const o=exp===s.id;return(
        <div key={s.id} style={{borderBottom:`1px solid ${C.bdr}`}}>
          <button onClick={()=>setExp(o?null:s.id)} aria-expanded={o} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"8px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span aria-hidden="true" style={{fontSize:13}}>{s.icon}</span>
              <div>
                <span style={{fontSize:12,fontWeight:700,color:C.ink}}>{s.name}</span>
                <span style={{fontSize:10,color:C.mut,marginLeft:6}}>— {s.desc}</span>
              </div>
            </div>
            <span aria-hidden="true" style={{fontSize:11,color:C.mut,flexShrink:0,marginLeft:8}}>{o?"▾":"▸"}</span>
          </button>
          {o&&<div style={{paddingLeft:4,paddingBottom:10}} className="rk-in">
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"7px 9px"}}>
                <div style={{fontSize:8,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>✓ HOLD</div>
                <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.hold}</div>
              </div>
              <div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"7px 9px"}}>
                <div style={{fontSize:8,color:C.cinn,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>✗ PASS</div>
                <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.pass}</div>
              </div>
            </div>
            <div style={{background:C.gold+"06",borderRadius:8,padding:"7px 9px",marginBottom:s.joker?8:0}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>💡 STRATEGY</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.combos}</div>
            </div>
            {s.joker&&<div style={{background:"#FFF9E6",borderRadius:8,padding:"7px 9px",border:`1px solid ${C.gold}20`}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>🃏 JOKER TIP</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.joker}</div>
            </div>}
          </div>}
        </div>);})}
    </div>);
}


