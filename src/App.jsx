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
@media(prefers-reduced-motion:reduce){
  .rk-in,.rk-float,.rk-pop{animation:none!important;transition:none!important}
}
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
{id:"2026",name:"2026",color:"#B54E7A",icon:"📅",desc:"Year tiles — 2s, Soap, 6s",hold:"2s, 6s, Soap, Flowers",pass:"1s, 9s, odds, Winds",combos:"The 2 and 6 appear together in most hands — prioritise pairing them across suits.",example:"FF 22 2026 66 Soap",joker:"Jokers help but aren't essential — focus on tile pairs first.",level:"Intermediate",hands:6,diff:3,
  ck:h=>{const g=cg(h,t=>(t.t==="s"&&[2,6].includes(t.n))||(t.t==="d"&&t.v==="Soap"));const off=h.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length+h.filter(t=>t.t==="w").length;const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04;const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.5,1));}},
{id:"2468",name:"2468",color:"#B83232",icon:"🔴",desc:"Even numbers (2, 4, 6, 8)",hold:"2s, 4s, 6s, 8s, Flowers, Jokers",pass:"All odds, Winds",combos:"The largest section on the card — 2 and 6 appear in the most hands, prioritise those.",example:"FF 2222 44 666 88",joker:"Jokers are very useful here — hold all of them.",level:"Beginner friendly",hands:10,diff:2,
  ck:h=>{const g=cg(h,t=>t.t==="s"&&t.n%2===0);const off=h.filter(t=>t.t==="s"&&t.n%2===1).length+h.filter(t=>t.t==="w").length;const b=h.some(t=>t.t==="s"&&t.n===2)&&h.some(t=>t.t==="s"&&t.n===6);const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04+(b?0.06:0);const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.2,1));}},
{id:"369",name:"369",color:"#B84A72",icon:"💗",desc:"Multiples of 3 (3, 6, 9)",hold:"3s, 6s, 9s, Flowers",pass:"Non-multiples of 3, Winds",combos:"6 appears in almost every hand — it's your anchor tile. Never pass a 6.",example:"FF 333 66 999 33",joker:"Jokers are helpful for completing pungs and kongs.",level:"Intermediate",hands:8,diff:3,
  ck:h=>{const g=cg(h,t=>t.t==="s"&&t.n%3===0);const off=h.filter(t=>t.t==="s"&&t.n%3!==0).length+h.filter(t=>t.t==="w").length;const b=h.some(t=>t.t==="s"&&t.n===6);const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04+(b?0.06:0);const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.5,1));}},
{id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",desc:"Odd numbers (1, 3, 5, 7, 9)",hold:"Odds, Winds can pair",pass:"All evens",combos:"5 is the most versatile odd — it appears in the most hands. Winds pair well here.",example:"FF 111 33 5555 99",joker:"Jokers substitute well for any odd tile — keep them.",level:"Beginner friendly",hands:9,diff:2,
  ck:h=>{const g=cg(h,t=>t.t==="s"&&t.n%2===1);const off=h.filter(t=>t.t==="s"&&t.n%2===0).length;const s=(g.kg*0.12+g.pg*0.09+g.pr*0.05)+g.jk*0.04+h.filter(t=>t.t==="w").length*0.02;const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.2,1));}},
{id:"cr",name:"Consec. Run",color:"#1B7D4E",icon:"🟢",desc:"Sequential tiles across suits",hold:"Consecutive numbers, Flowers",pass:"Isolated numbers, honors",combos:"Runs across 2+ suits give you the most hand options. Don't split a run to chase a pung.",example:"FF 123 456 789 Bam",joker:"Jokers fill gaps in runs — extremely valuable here.",level:"Intermediate",hands:11,diff:3,
  ck:h=>{const bs={};h.filter(t=>t.t==="s").forEach(t=>{if(!bs[t.s])bs[t.s]=new Set();bs[t.s].add(t.n);});let mr=0;Object.values(bs).forEach(s=>{const a=[...s].sort((a,b)=>a-b);let r=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)r++;else{mr=Math.max(mr,r);r=1;}}mr=Math.max(mr,r);});const su=Object.keys(bs).length;const jk=h.filter(t=>t.t==="j").length;const hon=h.filter(t=>t.t==="w"||t.t==="d").length;return Math.max(0,Math.min((mr>=5?0.4:mr>=4?0.3:mr>=3?0.2:mr*0.04)+su*0.04+jk*0.03-hon*0.04,1));}},
{id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",desc:"Honor tiles",hold:"Winds, Dragons",pass:"Number tiles",combos:"You need 5+ honor tiles to make this work. Pass all number tiles aggressively.",example:"NN EE WW SS 中中 發發",joker:"Jokers can stand in for any Wind or Dragon — keep them.",level:"Advanced",hands:7,diff:4,
  ck:h=>{const g=cg(h,t=>t.t==="w"||t.t==="d");const off=h.filter(t=>t.t==="s").length;const s=(g.kg*0.14+g.pg*0.1+g.pr*0.06)+g.jk*0.04;const fr=g.v/Math.max(g.v+off,1);return Math.max(0,Math.min(s*fr*2.5,1));}},
{id:"aln",name:"Like Numbers",color:"#2460A8",icon:"🔵",desc:"Same number, all suits",hold:"4+ of one number, Flowers, Jokers",pass:"Scattered numbers",combos:"Pick one or two numbers early and commit. Spreading across too many numbers kills this hand.",example:"FF 6666 6666 66 Bam Crak",joker:"Jokers are essential — they let you reach kongs on your key number.",level:"Intermediate",hands:6,diff:3,
  ck:h=>{const c={};h.filter(t=>t.t==="s").forEach(t=>{c[t.n]=(c[t.n]||0)+1;});const v=Object.values(c);const mx=v.length?Math.max(...v):0;const jk=h.filter(t=>t.t==="j").length;const fl=h.filter(t=>t.t==="f").length;return Math.max(0,Math.min((mx>=4?mx*0.08:mx*0.04)+jk*0.04+fl*0.02-Math.max(0,Object.keys(c).length-2)*0.06,1));}},
{id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",desc:"Five of a kind",hold:"Jokers, 3-4 of a tile",pass:"Scattered tiles",combos:"You need at least 2 Jokers to complete a quint. Without them, abandon this section early.",example:"JJJJ 11111 Bam",joker:"Jokers are mandatory — this hand cannot be made without them.",level:"Advanced",hands:4,diff:5,
  ck:h=>{const jk=h.filter(t=>t.t==="j").length;const c={};h.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}${t.n}`;c[k]=(c[k]||0)+1;});const v=Object.values(c);const mx=v.length?Math.max(...v):0;if(mx+jk>=5)return Math.min(0.5+jk*0.05,0.85);if(jk>=2&&mx>=3)return 0.35;return Math.max(0,(mx+jk)*0.03-0.1);}},
{id:"sp",name:"Singles & Pairs",color:"#2E9485",icon:"🩵",desc:"Only singles and pairs",hold:"Pairs, Flowers",pass:"Triples+",combos:"This hand is fully concealed — no Jokers allowed. Focus on building clean pairs.",example:"FF AA BB CC DD EE GG",joker:"Jokers cannot be used in Singles & Pairs — pass them all.",level:"Beginner friendly",hands:5,diff:2,
  ck:h=>{const c={};h.forEach(t=>{const k=JSON.stringify(t);c[k]=(c[k]||0)+1;});const pr=Object.values(c).filter(v=>v===2).length;const tr=Object.values(c).filter(v=>v>=3).length;return Math.max(0,Math.min(pr*0.07+h.filter(t=>t.t==="j").length*0.02-tr*0.2,1));}},
];

function ev(h){return SECS.map(s=>({...s,score:s.ck(h)})).sort((a,b)=>b.score-a.score);}
function adv(hand,cid){
  const e=ev(hand),ch=e.find(s=>s.id===cid),top=e[0],alts=e.filter(s=>s.id!==cid&&s.score>0.03).slice(0,2);
  let v="Not optimal",em="😬";
  if(ch&&ch.score>=0.02){if(ch.id===top.id||ch.score>=top.score*0.85){v="Strong choice";em="💪";}else if(ch.score>=top.score*0.55){v="Playable but risky";em="🤔";}}
  const p=ch?(ch.score*100).toFixed(0):"0";
  const r=v==="Strong choice"?`${p}% fit. Tiles are well-aligned for ${ch?.name}.`:v==="Playable but risky"?`${p}% fit — tiles also lean toward ${top.name} (${(top.score*100).toFixed(0)}%).`:`Only ${p}% fit. Tiles point toward ${top.name} (${(top.score*100).toFixed(0)}%).`;
  return{verdict:v,emoji:em,reason:r,alts,top,chosen:ch};
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

const RATS=["Mahjong Master","Sharp Player","Solid Hands","Getting There","Keep Practicing","Tough Deal"];
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
    detail:"The Charleston is the tile-passing ritual before play. Better passing = better hands. This takes about 2 minutes to learn.",
    icon:"🀄",
    tip:null,
  },
  {
    title:"Your Rack",
    body:"You're dealt 13 tiles. Each tile belongs to a category: Bam, Crak, Dot, Winds, Dragons, Flowers, or Jokers.",
    detail:"Tap any tile to learn about it. The goal is to end the Charleston with tiles that fit a winning hand pattern.",
    icon:"🎴",
    tip:"Tap a tile below to see its name",
    showTiles:true,
  },
  {
    title:"The Charleston",
    body:"You pass tiles in 3 rounds — Right (3 tiles), Over (3 tiles), Left (0–3 tiles, blind).",
    detail:"'Blind' means you pass before seeing what you receive. Pass your worst tiles. Keep your best.",
    icon:"👉",
    tip:"Jokers can NEVER be passed — they're too valuable!",
  },
  {
    title:"Pick Your Section",
    body:"After passing, choose which hand category (section) you're targeting — like 2468, 369, or Consecutive Run.",
    detail:"Rackle then scores how well your final rack fits that section. It's like a Charleston performance review.",
    icon:"🎯",
    tip:"There are 9 sections. The 2026 Card Guide in-game shows hold/pass tips for each.",
  },
  {
    title:"Get Rated",
    body:"Your rack is scored from Mahjong Master down to Tough Deal. Higher = your tiles fit your chosen section better.",
    detail:"You get feedback on whether your pick was optimal, and what the best section for your tiles was.",
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
        <Row label="Export My Data" sub="Download your history as JSON">
          <button onClick={exportData} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.bdr}`,background:"#fff",fontSize:11,cursor:"pointer",fontWeight:600,color:C.ink}}>Export</button>
        </Row>
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
          <div style={{fontSize:10,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8,textAlign:"center"}}>TAP A TILE TO SEE ITS NAME</div>
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
            {screen==="home"&&<Home {...{streak,rounds,dDone,dRes,showHelp,setShowHelp,go,settings}} showStats={()=>setScreen("stats")} showSettings={()=>setScreen("settings")} showTutorial={()=>setScreen("tutorial")} showCardGuide={()=>setScreen("cardguide")} showScorecard={()=>setScreen("scorecard")}/>}
            {screen==="tutorial"&&<Tutorial onDone={()=>{ST.set("tutDone",true);setScreen("home");}} onBack={()=>setScreen("home")}/>}
            {screen==="cardguide"&&<CardGuideScreen home={()=>setScreen("home")}/>}
            {screen==="play"&&<Game mode={mode} home={()=>setScreen("home")} onDone={onDone} settings={settings}/>}
            {screen==="stats"&&<Stats home={()=>setScreen("home")} showScorecard={dRes?.iq?()=>setScreen("scorecard"):null} dRes={dRes}/>}
            {screen==="settings"&&<Settings home={()=>setScreen("home")} settings={settings} setSettings={setSettings} showTutorial={()=>setScreen("tutorial")}/>}
            {screen==="scorecard"&&dRes?.iq&&<ScorecardScreen scorecard={dRes.iq} home={()=>setScreen("home")} dayNum={getDayNum()}/>}          </>
      }
    </AppShell>
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
  const levelColor=(l)=>l==="Beginner friendly"?C.jade:l==="Intermediate"?C.gold:C.cinn;
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>2026 Card Guide</div>
        <p style={{fontSize:12,color:C.mut,margin:"0 0 10px",lineHeight:1.6}}>Hold and pass tips for all 9 hand sections on the 2026 NMJL card. Tap any section to study it.</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Beginner friendly","Intermediate","Advanced"].map(l=>{const c=levelColor(l);return(
            <span key={l} style={{fontSize:10,color:c,fontWeight:700,background:c+"10",border:`1px solid ${c}25`,borderRadius:20,padding:"2px 10px"}}>{l}</span>
          );})}
        </div>
      </div>
      {SECS.map(s=>{const o=exp===s.id;const lc=levelColor(s.level);return(
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
              <span style={{fontSize:10,color:lc,fontWeight:700,background:lc+"10",borderRadius:20,padding:"2px 8px"}}>{s.level}</span>
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
            <div style={{background:C.gold+"06",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>💡 STRATEGY</div>
              <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{s.combos}</div>
            </div>
            <div style={{background:"#FFF9E6",borderRadius:8,padding:"8px 10px",marginBottom:8,border:`1px solid ${C.gold}20`}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>🃏 JOKERS</div>
              <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{s.joker}</div>
            </div>
            <div style={{background:C.bg2,borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>EXAMPLE HAND STRUCTURE</div>
              <div style={{fontFamily:"monospace",fontSize:12,color:C.ink,letterSpacing:1}}>{s.example}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}>
              <span style={{fontSize:11,color:C.mut}}>{"★".repeat(s.diff)}{"☆".repeat(5-s.diff)}</span>
              <span style={{fontSize:11,color:C.mut}}>·</span>
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

// STANDALONE SCORECARD SCREEN (accessed from home after daily)
function ScorecardScreen({scorecard,home,dayNum}){
  const [copied,setCopied]=useState(false);
  // Reconstruct a minimal "passed" array and hand from the scorecard for display
  // IQScorecard needs hand/passed but we don't have them here — show read-only version
  return(
    <div style={S.pg} className="rk-pg">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.bdr}`}}>
        <button onClick={home} style={S.back} aria-label="Back to home">← Home</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,letterSpacing:-0.3}}>Rackle #{dayNum}</div>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>CHARLESTON IQ</div>
        </div>
        <div style={{width:60}}/>
      </div>

      {/* HERO */}
      <div style={{borderRadius:20,overflow:"hidden",marginBottom:10,background:"linear-gradient(160deg,#083D22,#0F5535,#072E19)",padding:"28px 20px 22px",textAlign:"center",boxShadow:"0 8px 40px rgba(8,61,34,0.5)"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:3,fontWeight:700,marginBottom:16}}>DAILY RACKLE · #{dayNum}</div>
        <div style={{fontSize:9,color:"#C9A84C",letterSpacing:2.5,fontWeight:700,marginBottom:6}}>CHARLESTON IQ</div>
        <div style={{fontFamily:F.d,fontSize:56,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:10,textShadow:"0 2px 12px rgba(176,138,53,0.4)"}}>{scorecard.totalScore}</div>
        <div style={{width:48,height:1.5,background:"linear-gradient(90deg,transparent,#C9A84C,transparent)",margin:"0 auto 12px"}}/>
        <div style={{fontFamily:F.d,fontSize:21,fontWeight:900,color:"rgba(255,255,255,0.9)",letterSpacing:-0.3,lineHeight:1,marginBottom:6}}>{scorecard.level}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",maxWidth:260,margin:"0 auto 16px",lineHeight:1.5}}>{scorecard.levelExplanation}</div>
        {scorecard.totalTime>0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600}}>⏱ {fT(scorecard.totalTime)}</div>}
      </div>

      {/* TAB CONTENT — inline, no tile/pass display since we don't have the rack data */}
      {/* SCORE BARS */}
      <div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>SCORE BREAKDOWN</div>
        <ScoreBar label="Direction" value={scorecard.directionScore} max={40} color="#1B7D4E"/>
        <ScoreBar label="Tile Strength" value={scorecard.tileStrengthScore} max={25} color="#1B7D4E"/>
        <ScoreBar label="Pass Quality" value={scorecard.passQualityScore} max={25} color="#1B7D4E"/>
        <ScoreBar label="Timing" value={scorecard.timingScore} max={10} color="#1B7D4E"/>
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:C.mut,letterSpacing:0.3}}>CHARLESTON IQ</span>
          <span style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink}}>{scorecard.totalScore}</span>
        </div>
      </div>

      {/* DIRECTION */}
      {scorecard.directionExplanation&&<div style={{...S.card,background:"#F3F5F8",borderColor:"#D0D8E4"}}>
        <div style={{fontSize:9,color:"#4A6080",letterSpacing:2,fontWeight:700,marginBottom:5}}>🧭 DIRECTION READ</div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:0}}>{scorecard.directionExplanation}</p>
      </div>}

      {/* DISTANCE */}
      {scorecard.distanceToOptimal&&<div style={{...S.card,background:"#FBF8F2",borderColor:"#E8DCC4"}}>
        <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700,marginBottom:5}}>📏 DISTANCE TO OPTIMAL</div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"0 0 6px"}}>{scorecard.distanceToOptimal.explanation}</p>
        {scorecard.distanceToOptimal.keyMistakeRound&&<div style={{fontSize:11,color:"#8A6A1E",fontWeight:600,background:"rgba(138,106,30,0.08)",borderRadius:6,padding:"4px 8px",display:"inline-block"}}>Key moment: {scorecard.distanceToOptimal.keyMistakeRound}</div>}
      </div>}

      {/* STRENGTHS */}
      {scorecard.strengths?.length>0&&<div style={{...S.card,background:"#F4FAF6",borderColor:"#C8E2D0"}}>
        <div style={{fontSize:9,color:"#2E6B48",letterSpacing:2,fontWeight:700,marginBottom:8}}>WHAT WENT WELL</div>
        {scorecard.strengths.map((s,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:i<scorecard.strengths.length-1?8:0,alignItems:"flex-start"}}>
            <div style={{width:18,height:18,borderRadius:9,background:"#2E6B48",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontSize:9,color:"#fff",fontWeight:800}}>✓</span></div>
            <span style={{fontSize:12,color:"#1A3D28",lineHeight:1.6}}>{s}</span>
          </div>
        ))}
      </div>}

      {/* WEAKNESSES */}
      {scorecard.weaknesses?.length>0&&<div style={{...S.card,background:"#F8F5F0",borderColor:"#DDD0BC"}}>
        <div style={{fontSize:9,color:"#6B5430",letterSpacing:2,fontWeight:700,marginBottom:8}}>TO WORK ON</div>
        {scorecard.weaknesses.map((w,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:i<scorecard.weaknesses.length-1?8:0,alignItems:"flex-start"}}>
            <div style={{width:18,height:18,borderRadius:9,background:"#8A6A1E",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontSize:9,color:"#fff",fontWeight:800}}>→</span></div>
            <span style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{w}</span>
          </div>
        ))}
      </div>}

      {/* COACH NOTE */}
      {scorecard.coachNote&&<div style={{...S.card,background:"#FDFAF3",borderColor:"#E8D9A8",borderWidth:1.5}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <span style={{fontSize:14}}>💬</span>
          <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700}}>COACH NOTE</div>
        </div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.75,margin:"0 0 10px"}}>{scorecard.coachNote}</p>
        <div style={{borderTop:"1px solid #E8D9A8",paddingTop:10}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:5}}>TRY NEXT TIME</div>
          <p style={{fontSize:12,color:"#5C4A2A",lineHeight:1.65,margin:0}}>{scorecard.tryNextTime}</p>
        </div>
      </div>}

      {/* PASS INSIGHTS */}
      {scorecard.passInsights?.length>0&&<>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,margin:"4px 0 8px"}}>PASS BREAKDOWN</div>
        {scorecard.passInsights.map((r,i)=>{
          const qBg=r.quality==="strong"?"#F4FAF6":r.quality==="weak"?"#FBF5F0":r.quality==="mixed"?"#FBF8F2":C.bg;
          const qBorder=r.quality==="strong"?"#C8E2D0":r.quality==="weak"?"#E5CCBB":r.quality==="mixed"?"#E8DCC4":C.bdr;
          return(
            <div key={i} style={{...S.card,marginBottom:6,background:qBg,borderColor:qBorder}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{r.roundName}</span>
                <QualityPip quality={r.quality}/>
              </div>
              {r.passedTiles.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
                {r.passedTiles.map((tl,j)=><span key={j} style={{fontSize:10,background:"rgba(255,255,255,0.7)",border:`1px solid ${qBorder}`,borderRadius:6,padding:"2px 7px",color:C.ink,fontWeight:600}}>{tl}</span>)}
              </div>}
              <p style={{fontSize:12,color:"#5C4A3A",lineHeight:1.6,margin:0}}>{r.insight}</p>
            </div>
          );
        })}
      </>}

      {/* TIMING */}
      {scorecard.timingInsight&&<div style={{...S.card,background:C.bg2,borderColor:C.bdr}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:5}}>⏱ TIMING</div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}>{scorecard.timingInsight}</p>
      </div>}

      {/* TILE INSIGHTS */}
      {scorecard.tileInsights?.missedOpportunities?.length>0&&<div style={S.card}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>MISSED OPPORTUNITIES</div>
        {scorecard.tileInsights.missedOpportunities.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:i<scorecard.tileInsights.missedOpportunities.length-1?8:0,alignItems:"flex-start"}}>
            <span style={{color:"#8A6A1E",fontSize:14,flexShrink:0,lineHeight:1.4}}>›</span>
            <span style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{m}</span>
          </div>
        ))}
      </div>}

      {/* SHARE */}
      {scorecard.totalScore!=null&&(()=>{
        const freshShare=[`RACKLE #${dayNum}`,``,`Charleston IQ: ${scorecard.totalScore}`,`Level: ${scorecard.level}`,scorecard.totalTime?`Time: ${fT(scorecard.totalTime)}`:"",``,`Test your skills:`,`playrackle.com`].filter((l,i,a)=>!(l===""&&(i===0||a[i-1]===""||i===a.length-1))).join("\n");
        return(
        <div style={{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:14,overflow:"hidden",marginTop:4,marginBottom:8}}>
          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>SHARE YOUR RESULT</div>
            <div style={{fontFamily:"monospace",fontSize:10,color:C.ink,lineHeight:1.85,whiteSpace:"pre-wrap",background:C.bg2,borderRadius:8,padding:"11px 13px",marginBottom:10,border:`1px solid ${C.bdr}`,textAlign:"left"}}>{freshShare}</div>
            <ShareButton onClick={()=>{navigator.clipboard?.writeText(freshShare).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}} copied={copied}/>
          </div>
        </div>
        );
      })()}

      <button onClick={home} style={{...S.oBtn,width:"100%",marginTop:4}} aria-label="Back to home">← Back to Home</button>
    </div>
  );
}


function Home({streak,rounds,dDone,dRes,showHelp,setShowHelp,go,showStats,showSettings,showTutorial,showCardGuide,settings,showScorecard}){
  const [copied,setCopied]=useState(false);
  const dn=getDayNum(),wk=getWeekly(),yd=getYesterday(),stats=getStats();
  const streakBadge=getStreakBadge(streak);
  const expandSec=(s="")=>s.replace("Consec. Run","Consecutive Run").replace("Aln","Like Numbers");
  const iq=dRes?.iq;
  // Always build share text fresh from IQ fields — never trust cached shareText string
  const stxt=iq
    ?[`RACKLE #${dn}`,``,`Charleston IQ: ${iq.totalScore}`,`Level: ${iq.level}`,iq.totalTime?`Time: ${fT(iq.totalTime)}`:"",``,`Test your skills:`,`playrackle.com`].filter((_,i,a)=>!(a[i]===""&&a[i-1]==="")).join("\n")
    :dRes?`🀄 Rackle #${dn} · ${dRes.rating} ${dRes.emoji}\n${dRes.section?expandSec(dRes.section):""} · ${dRes.score!=null?(dRes.score*100).toFixed(0)+"% fit":""}${dRes.time?` · ⏱ ${fT(dRes.time)}`:""}\nplayrackle.com`
    :"";
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
      <div style={{textAlign:"center",padding:"18px 0 22px",borderBottom:`1px solid ${C.bdr}`,marginBottom:20}}>
        <div className="rk-float" style={{fontSize:40,marginBottom:10,lineHeight:1}}>🀄</div>
        <h1 style={{fontFamily:F.d,fontSize:48,color:C.ink,margin:"0 0 6px",fontWeight:900,letterSpacing:-2.5,lineHeight:1}}>Rackle</h1>
        <p style={{fontFamily:F.d,fontSize:16,color:C.jade,margin:"0 0 10px",fontWeight:600,fontStyle:"italic",letterSpacing:0.3}}>Rack & Roll.</p>
        <p style={{fontSize:12,color:C.mut,margin:"0 0 6px",lineHeight:1.6,maxWidth:260,marginLeft:"auto",marginRight:"auto"}}>Rate your Charleston. Track your improvement.</p>
        <p style={{fontSize:11,color:C.mut,margin:"0 0 12px",lineHeight:1.5,maxWidth:240,marginLeft:"auto",marginRight:"auto",opacity:0.8}}>The passing ritual before every American Mahjong game.</p>
        <span style={{display:"inline-block",fontSize:10,color:C.gold,fontWeight:700,letterSpacing:1.5,background:C.gold+"10",border:`1px solid ${C.gold}30`,borderRadius:20,padding:"3px 12px"}}>2026 NMJL CARD</span>
      </div>
      {streak>0&&streakBadge&&<div style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8,background:C.gold+"06",borderColor:C.gold+"25"}}>
        <span style={{fontSize:24}}>{streakBadge.badge}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:C.ink,fontFamily:F.d}}>{streakBadge.title}</div>
          <div style={{fontSize:11,color:C.mut,marginTop:1}}>{streak}-day streak — {streakBadge.desc}</div>
        </div>
      </div>}

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
        const ydComp=yd&&dRes?(dRes.gi<yd.gi?{label:"Better than yesterday",icon:"⬆️"}:dRes.gi===yd.gi?{label:"Same as yesterday",icon:"➡️"}:{label:"Yesterday was stronger",icon:"⬇️"}):null;
        return(
        <div style={{borderRadius:20,overflow:"hidden",marginBottom:8,boxShadow:"0 8px 32px rgba(27,125,78,0.25)"}}>
          {/* JADE HERO */}
          <div style={{background:"linear-gradient(160deg,#083D22,#0F5535,#072E19)",padding:"22px 20px 18px",textAlign:"center"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:3,fontWeight:700,marginBottom:14}}>TODAY'S DAILY · #{dn}</div>
            {iq?(
              <>
                <div style={{fontSize:9,color:"#C9A84C",letterSpacing:2.5,fontWeight:700,marginBottom:4}}>CHARLESTON IQ</div>
                <div style={{fontFamily:F.d,fontSize:48,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:8,textShadow:"0 2px 12px rgba(176,138,53,0.4)"}}>{iq.totalScore}</div>
                <div style={{width:40,height:1.5,background:"linear-gradient(90deg,transparent,#C9A84C,transparent)",margin:"0 auto 10px"}}/>
                <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:"rgba(255,255,255,0.9)",letterSpacing:-0.3,marginBottom:4}}>{iq.level}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:14,lineHeight:1.5,maxWidth:220,margin:"0 auto 14px"}}>{iq.levelExplanation}</div>
                <div style={{width:32,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",margin:"0 auto 12px"}}/>
                <div style={{display:"flex",justifyContent:"center",gap:0}}>
                  {dRes.section&&<div style={{textAlign:"center",padding:"0 12px"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:3}}>SECTION</div>
                    <div style={{fontSize:12,color:"#fff",fontWeight:700}}>{dRes.section}</div>
                  </div>}
                  {dRes.time>0&&<><div style={{width:1,background:"rgba(255,255,255,0.15)"}}/>
                  <div style={{textAlign:"center",padding:"0 12px"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:3}}>TIME</div>
                    <div style={{fontSize:12,color:"#fff",fontWeight:700}}>⏱ {fT(dRes.time)}</div>
                  </div></>}
                </div>
              </>
            ):(
              /* Legacy fallback for results without IQ */
              <>
                <div style={{fontSize:36,marginBottom:8,lineHeight:1}}>{dRes?.emoji}</div>
                <div style={{fontFamily:F.d,fontSize:26,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1,marginBottom:12}}>{dRes?.rating}</div>
                <div style={{width:36,height:1.5,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",margin:"0 auto 14px"}}/>
                {dRes&&<div style={{display:"flex",justifyContent:"center",gap:20}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:3}}>SECTION</div><div style={{fontSize:12,color:"#fff",fontWeight:700}}>{dRes.section}</div></div>
                  {dRes.score!=null&&<><div style={{width:1,background:"rgba(255,255,255,0.15)"}}/><div style={{textAlign:"center"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:3}}>FIT</div><div style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:800}}>{(dRes.score*100).toFixed(0)}% fit</div></div></>}
                  {dRes.time&&<><div style={{width:1,background:"rgba(255,255,255,0.15)"}}/><div style={{textAlign:"center"}}><div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:3}}>TIME</div><div style={{fontSize:12,color:"#fff",fontWeight:700}}>⏱ {fT(dRes.time)}</div></div></>}
                </div>}
              </>
            )}
            {ydComp&&<div style={{marginTop:14,display:"flex",justifyContent:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"4px 12px"}}>
                <span style={{fontSize:11}}>{ydComp.icon}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.8)",fontWeight:600}}>{ydComp.label}</span>
              </div>
            </div>}
          </div>
          {/* ACTION ROW — scorecard button + share */}
          <div style={{background:C.bg,borderTop:`1px solid ${C.bdr}`}}>
            {iq&&showScorecard&&(
              <button onClick={showScorecard} style={{width:"100%",padding:"14px 18px",background:"#F4FAF6",border:"none",borderBottom:`1px solid #C8E2D0`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div style={{textAlign:"left"}}>
                  <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:"#1A3D28",letterSpacing:-0.2,marginBottom:2}}>View Full Scorecard</div>
                  <div style={{fontSize:11,color:"#4A7A5E",fontWeight:500,letterSpacing:0.1}}>Coach notes · Pass breakdown · Tile analysis</div>
                </div>
                <div style={{width:28,height:28,borderRadius:8,background:"#2E6B48",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:13,color:"#fff",fontWeight:800,lineHeight:1}}>›</span>
                </div>
              </button>
            )}
            <div style={{padding:"14px 16px"}}>
              <div style={{fontFamily:"monospace",fontSize:10,color:C.ink,lineHeight:1.8,whiteSpace:"pre-wrap",textAlign:"left",background:"#fff",borderRadius:9,border:`1px solid ${C.bdr}`,padding:"9px 12px",marginBottom:10}}>{stxt}</div>
              <ShareButton onClick={cp} copied={copied}/>
              <p style={{fontSize:11,color:C.mut,textAlign:"center",margin:"10px 0 0",lineHeight:1.5}}>Same deal for everyone — safe to share, no spoilers.</p>
            </div>
          </div>
        </div>
        );
      })()}

      {dDone&&<MidnightCountdown dn={dn}/>}

      <button onClick={()=>go("free")} aria-label="Play Practice Mode" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:16,marginBottom:20,borderRadius:16,padding:"18px 18px",textAlign:"left",background:"#F1ECE3",border:`1px solid ${C.bdr}`,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:5}}>UNLIMITED PLAY</div>
          <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-0.3,marginBottom:5}}>Practice Mode</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.4}}>Unlimited hands. Build instincts for every section.</div>
        </div>
        <div style={{width:36,height:36,borderRadius:10,background:"#fff",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:16,color:C.ink,fontWeight:800,lineHeight:1}}>›</span>
        </div>
      </button>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{flex:1,height:1,background:C.bdr}}/>
        <span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>LEARN & EXPLORE</span>
        <div style={{flex:1,height:1,background:C.bdr}}/>
      </div>

      {/* HOW TO PLAY — full-width expandable */}
      <button onClick={()=>setShowHelp(!showHelp)} aria-expanded={showHelp} aria-controls="help-panel"
        style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:showHelp?0:8,borderRadius:showHelp?"14px 14px 0 0":14,padding:"15px 16px",textAlign:"left",background:showHelp?"#FDFAF3":"#fff",border:`1px solid ${showHelp?"#E8D9A8":C.bdr}`,borderBottom:showHelp?"none":""}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:10,background:showHelp?"#F5EEC8":"#F5F1EB",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:"#8A6A1E"}}>{showHelp?"–":"?"}</span>
          </div>
          <div>
            <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,letterSpacing:-0.2}}>How to Play</div>
            <div style={{fontSize:11,color:C.mut,marginTop:1}}>Rules, scoring & all 9 sections</div>
          </div>
        </div>
        <div style={{width:28,height:28,borderRadius:8,background:showHelp?"#E8D9A8":"#F1ECE3",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:"#8A6A1E",fontWeight:800}}>{showHelp?"▾":"›"}</span>
        </div>
      </button>

      {showHelp&&<div id="help-panel" style={{...S.card,background:"#FDFAF3",borderColor:"#E8D9A8",borderRadius:"0 0 14px 14px",marginBottom:8,borderTop:"none"}} className="rk-in">
        <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700,marginBottom:10}}>HOW IT WORKS</div>
        {["You're dealt 13 tiles. A timer starts.","Pass Right (3), Over (3), Left (0–3, blind). Jokers can't be passed.","Optionally continue with a second Charleston and a Courtesy Pass.","Choose your target section — Rackle scores your Charleston decisions."].map((s,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={S.dot} aria-hidden="true">{i+1}</div><span style={{fontSize:12,color:C.mut,lineHeight:1.6}}>{s}</span></div>))}
        <div style={{borderTop:`1px solid #E8D9A8`,margin:"12px 0 10px"}}/>
        <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700,marginBottom:10}}>CHARLESTON IQ SCORE</div>
        <div style={{fontSize:12,color:C.mut,lineHeight:1.7,marginBottom:10}}>Your score is out of 100, built from four components:</div>
        {[
          ["🧭","Direction (40 pts)","Did your passes move you toward a viable hand pattern?"],
          ["🀄","Tile Strength (25 pts)","Did you keep structurally useful tiles — pairs, anchors, key numbers?"],
          ["🔄","Pass Quality (25 pts)","Did you pass weak tiles and avoid giving away useful ones?"],
          ["⏱","Timing (10 pts)","Did you make decisions at a thoughtful pace?"],
        ].map(([icon,label,desc],i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
            <span style={{fontSize:15,flexShrink:0,marginTop:1}}>{icon}</span>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.ink,marginBottom:2}}>{label}</div>
              <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>{desc}</div>
            </div>
          </div>
        ))}
        <div style={{background:"rgba(138,106,30,0.06)",borderRadius:8,padding:"8px 10px",marginTop:4,marginBottom:12,border:"1px solid #E8D9A8"}}>
          <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700,marginBottom:6}}>SCORE LEVELS</div>
          {[["90–100","Mahjong Master"],["80–89","Skilled Player"],["70–79","Game Ready"],["60–69","Getting There"],["< 60","Keep Going, Rookie"]].map(([range,label])=>(
            <div key={range} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
              <span style={{color:C.mut}}>{range}</span>
              <span style={{fontWeight:700,color:C.ink}}>{label}</span>
            </div>
          ))}
        </div>
        <button onClick={showTutorial} style={{background:"none",border:"1px solid #E8D9A8",borderRadius:8,padding:"6px 12px",fontSize:11,color:"#8A6A1E",cursor:"pointer",fontWeight:600}}>Full interactive tutorial →</button>
      </div>}

      {/* TUTORIAL + CARD GUIDE — full width rows with context */}
      <button onClick={showTutorial} aria-label="Take the interactive tutorial" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"15px 16px",marginBottom:6,borderRadius:14,border:`1px solid ${C.bdr}`,background:"#fff",textAlign:"left"}}>
        <div style={{width:40,height:40,borderRadius:11,background:C.jade+"10",border:`1px solid ${C.jade}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:C.jade}}>→</span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:C.ink,marginBottom:2}}>Interactive Tutorial</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>New to the Charleston? Walk through tiles, passing, and strategy in 5 guided steps.</div>
        </div>
        <div style={{width:26,height:26,borderRadius:7,background:C.jade+"10",border:`1px solid ${C.jade}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:C.jade,fontWeight:800}}>›</span>
        </div>
      </button>

      <button onClick={showCardGuide} aria-label="View the 2026 card guide" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"15px 16px",marginBottom:8,borderRadius:14,border:`1px solid ${C.bdr}`,background:"#fff",textAlign:"left"}}>
        <div style={{width:40,height:40,borderRadius:11,background:C.gold+"10",border:`1px solid ${C.gold}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:F.d,fontSize:11,fontWeight:900,color:C.gold,letterSpacing:-0.5}}>2026</span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:C.ink,marginBottom:2}}>2026 Card Guide</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>Which tiles to hold and pass for all 9 hand sections — plus joker strategy and examples.</div>
        </div>
        <div style={{width:26,height:26,borderRadius:7,background:C.gold+"10",border:`1px solid ${C.gold}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:C.gold,fontWeight:800}}>›</span>
        </div>
      </button>

      {/* MY STATS — compact, only after 3+ rounds */}
      {rounds>=3&&<button onClick={showStats} aria-label="View my stats" style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"13px 16px",marginBottom:8,borderRadius:14,border:`1px solid ${C.bdr}`,background:"#fff",textAlign:"left"}}>
        <div style={{width:40,height:40,borderRadius:11,background:"#F3F5F8",border:"1px solid #D0D8E4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:"#4A6080"}}>↗</span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:C.ink,marginBottom:2}}>My Stats</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5}}>Section mastery, streak history, and rating trends.</div>
        </div>
        <div style={{width:26,height:26,borderRadius:7,background:"#F3F5F8",border:"1px solid #D0D8E4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:12,color:"#4A6080",fontWeight:800}}>›</span>
        </div>
      </button>}

      <div style={{textAlign:"center",padding:"16px 0 8px",marginTop:4}}>
        <p style={{fontSize:11,color:C.mut,margin:0,lineHeight:1.6}}>Made for the American Mahjong community 🀄</p>
      </div>


      <div style={{textAlign:"center",padding:"22px 0 8px",marginTop:8}}>
        <div aria-hidden="true" style={{width:40,height:1,background:C.bdr,margin:"0 auto 16px"}}/>
        <div style={{fontSize:12,color:C.jade,fontFamily:F.d,fontStyle:"italic"}}>Rack & Roll 🀄</div>
        <div style={{fontSize:9,color:C.mut,marginTop:8,letterSpacing:2}}>2026 NMJL EDITION</div>
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
      </div>
    </div>
  );
}
function Pill({i,v,l,hl}){return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}} aria-label={`${l}: ${v}`}><span aria-hidden="true" style={{fontSize:12}}>{i}</span><div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{v}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{l}</div></div></div>);}

// STATS
function Stats({home,showScorecard,dRes}){
  const stats=getStats(),wk=getWeekly();
  const iq=dRes?.iq;
  const dn=getDayNum();
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
          {/* TODAY'S IQ — shown at top if daily was played */}
          {iq&&(
            <div style={{borderRadius:18,overflow:"hidden",marginBottom:12,boxShadow:"0 6px 24px rgba(8,61,34,0.3)"}}>
              <div style={{background:"linear-gradient(160deg,#083D22,#0F5535,#072E19)",padding:"20px 20px 16px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:3,fontWeight:700,marginBottom:10}}>TODAY'S DAILY · #{dn}</div>
                <div style={{fontSize:9,color:"#C9A84C",letterSpacing:2.5,fontWeight:700,marginBottom:4}}>CHARLESTON IQ</div>
                <div style={{fontFamily:F.d,fontSize:44,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:8,textShadow:"0 2px 12px rgba(176,138,53,0.4)"}}>{iq.totalScore}</div>
                <div style={{width:36,height:1.5,background:"linear-gradient(90deg,transparent,#C9A84C,transparent)",margin:"0 auto 10px"}}/>
                <div style={{fontFamily:F.d,fontSize:17,fontWeight:900,color:"rgba(255,255,255,0.9)",marginBottom:4}}>{iq.level}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.5,maxWidth:220,margin:"0 auto"}}>{iq.levelExplanation}</div>
              </div>
              {showScorecard&&(
                <button onClick={showScorecard} style={{width:"100%",padding:"14px 18px",background:"#F4FAF6",border:"none",borderTop:`1px solid #C8E2D0`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:"#1A3D28",letterSpacing:-0.2,marginBottom:2}}>View Full Scorecard</div>
                    <div style={{fontSize:11,color:"#4A7A5E",fontWeight:500,letterSpacing:0.1}}>Coach notes · Pass breakdown · Tile analysis</div>
                  </div>
                  <div style={{width:28,height:28,borderRadius:8,background:"#2E6B48",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:13,color:"#fff",fontWeight:800,lineHeight:1}}>›</span>
                  </div>
                </button>
              )}
            </div>
          )}

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

// ============================================================
// CHARLESTON IQ SCORING ENGINE
// ============================================================
const SECTION_META={
  "2026":{direction:"Like Numbers",strongNums:[2,6],strongTypes:["d"],strongDragon:"Soap",acceptNums:[],weakNums:[1,3,4,5,7,8,9],riskyPass:[2,6],wantsFlowers:true,wantsJokers:true,pairBonus:true},
  "2468":{direction:"Even Numbers",strongNums:[2,4,6,8],strongTypes:[],acceptNums:[],weakNums:[1,3,5,7,9],riskyPass:[2,6],wantsFlowers:true,wantsJokers:true,pairBonus:true},
  "369":{direction:"Multiples of Three",strongNums:[3,6,9],strongTypes:[],acceptNums:[],weakNums:[1,2,4,5,7,8],riskyPass:[6],wantsFlowers:true,wantsJokers:true,pairBonus:true},
  "13579":{direction:"Odd Numbers",strongNums:[1,3,5,7,9],strongTypes:["w"],acceptNums:[],weakNums:[2,4,6,8],riskyPass:[5],wantsFlowers:true,wantsJokers:true,pairBonus:true},
  "cr":{direction:"Consecutive Run",strongNums:null,runBased:true,weakTypes:["w","d"],riskyPass:null,wantsFlowers:true,wantsJokers:true,pairBonus:false},
  "wd":{direction:"Honors / Dragons",strongNums:[],strongTypes:["w","d"],weakNums:[1,2,3,4,5,6,7,8,9],weakTypes:["s"],riskyPass:null,wantsFlowers:false,wantsJokers:true,pairBonus:true},
  "aln":{direction:"Like Numbers",strongNums:null,likeNumbers:true,weakTypes:[],riskyPass:null,wantsFlowers:true,wantsJokers:true,pairBonus:false},
  "q":{direction:"Quints",strongNums:null,quintsNeeded:true,wantsJokers:true,wantsFlowers:false,riskyPass:null,pairBonus:false},
  "sp":{direction:"Pair-heavy",pairsOnly:true,wantsJokers:false,wantsFlowers:true,riskyPass:null,pairBonus:true},
};
function iqTileKey(t){if(t.t==="s")return`${t.s}-${t.n}`;if(t.t==="w")return`w-${t.v}`;if(t.t==="d")return`d-${t.v}`;if(t.t==="f")return"f";if(t.t==="j")return"j";return"?";}
function iqTileLabel(t){if(t.t==="j")return"Joker";if(t.t==="f")return"Flower";if(t.t==="w")return`${t.v} Wind`;if(t.t==="d")return t.v==="Soap"?"Soap Dragon":`${t.v} Dragon`;const sn={bam:"Bam",crak:"Crk",dot:"Dot"};return`${t.n} ${sn[t.s]}`;}
function iqCountGroups(tiles){const c={};tiles.forEach(t=>{const k=iqTileKey(t);c[k]=(c[k]||0)+1;});return c;}
function iqCountPairs(tiles){return Object.values(iqCountGroups(tiles)).filter(v=>v>=2).length;}
function iqLongestRun(tiles){const bs={};tiles.filter(t=>t.t==="s").forEach(t=>{if(!bs[t.s])bs[t.s]=new Set();bs[t.s].add(t.n);});let best=0,bestSuit=null;Object.entries(bs).forEach(([suit,nums])=>{const a=[...nums].sort((a,b)=>a-b);let run=1,max=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)run++;else run=1;max=Math.max(max,run);}if(max>best){best=max;bestSuit=suit;}});return{length:best,suit:bestSuit};}
function iqDomNum(tiles){const c={};tiles.filter(t=>t.t==="s").forEach(t=>{c[t.n]=(c[t.n]||0)+1;});let best=0,bestNum=null;Object.entries(c).forEach(([n,cnt])=>{if(cnt>best){best=cnt;bestNum=parseInt(n);}});return{num:bestNum,count:best};}

function iqDirection(finalRack,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const numTiles=finalRack.filter(t=>t.t==="s");
  const honorTiles=finalRack.filter(t=>t.t==="w"||t.t==="d");
  const jokers=finalRack.filter(t=>t.t==="j");
  let score=0,explanation="";
  if(sectionId==="cr"){
    const run=iqLongestRun(finalRack);const off=honorTiles.length;
    if(run.length>=5&&off<=1){score=40;explanation="Strong run built across suits.";}
    else if(run.length>=4&&off<=3){score=30;explanation="Good run foundation, a few off-direction tiles remain.";}
    else if(run.length>=3){score=20;explanation="Run started but not fully developed.";}
    else{score=10;explanation="Few connected tiles — the run direction wasn't committed to.";}
  } else if(sectionId==="wd"){
    const ratio=honorTiles.length/Math.max(finalRack.length,1);const numOff=numTiles.length;
    if(ratio>=0.55&&numOff<=2){score=40;explanation="Rack dominated by honor tiles.";}
    else if(ratio>=0.4&&numOff<=4){score=30;explanation="Good honor concentration, some numbers remain.";}
    else if(ratio>=0.25){score=20;explanation="Some honors kept, number tiles still present.";}
    else{score=10;explanation="Rack skewed toward number tiles — hard to pursue Winds & Dragons.";}
  } else if(sectionId==="aln"){
    const dom=iqDomNum(finalRack);const groups=iqCountGroups(finalRack.filter(t=>t.t==="s"));const uniqueNums=Object.keys(groups).length;
    if(dom.count>=6&&uniqueNums<=2){score=40;explanation="Excellent concentration on a key number.";}
    else if(dom.count>=4&&uniqueNums<=3){score=30;explanation="Good like-numbers base, a few extra numbers present.";}
    else if(dom.count>=3){score=20;explanation="Started building like-numbers but spread too thin.";}
    else{score=10;explanation="Too many different numbers for Like Numbers.";}
  } else if(sectionId==="sp"){
    const pairs=iqCountPairs(finalRack);const groups=iqCountGroups(finalRack);const triples=Object.values(groups).filter(v=>v>=3).length;
    if(pairs>=5&&triples===0){score=40;explanation="Clean pairs rack — ideal for Singles & Pairs.";}
    else if(pairs>=4&&triples<=1){score=30;explanation="Good pair count, minor structure issues.";}
    else if(pairs>=3){score=20;explanation="Some pairs, rack isn't fully structured for S&P.";}
    else{score=10;explanation="Few pairs — hard to pursue Singles & Pairs.";}
  } else if(sectionId==="q"){
    const dom=iqDomNum(finalRack);const jk=jokers.length;
    if(jk>=2&&dom.count>=3){score=40;explanation="Strong quint base with 2+ jokers.";}
    else if(jk>=2){score=30;explanation="Jokers present but key tile count needs building.";}
    else if(jk>=1&&dom.count>=3){score=25;explanation="Tile group solid but only one joker.";}
    else{score=10;explanation="Quints require jokers — hard to pursue without them.";}
  } else {
    const sn=meta.strongNums||[];const wn=meta.weakNums||[];
    const sc=numTiles.filter(t=>sn.includes(t.n)).length;const wc=numTiles.filter(t=>wn.includes(t.n)).length;
    const total=finalRack.length;const sr=sc/Math.max(total,1);const wr=wc/Math.max(total,1);
    if(sr>=0.55&&wr<=0.1){score=40;explanation=`Strong concentration of ${sn.join("/")} tiles.`;}
    else if(sr>=0.4&&wr<=0.2){score=30;explanation="Good direction — most tiles align, a few weaker tiles remain.";}
    else if(sr>=0.25){score=20;explanation="Some useful tiles, rack still mixed.";}
    else{score=10;explanation="Rack has few tiles that support this section.";}
  }
  return{directionScore:score,directionExplanation:explanation};
}

function iqTileStrength(finalRack,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const pairs=iqCountPairs(finalRack);const jokers=finalRack.filter(t=>t.t==="j").length;
  const flowers=finalRack.filter(t=>t.t==="f").length;const numTiles=finalRack.filter(t=>t.t==="s");
  const groups=iqCountGroups(finalRack);const triples=Object.values(groups).filter(v=>v>=3).length;
  let pts=0;
  if(sectionId!=="sp"&&jokers>=2)pts+=4;else if(sectionId!=="sp"&&jokers===1)pts+=2;
  if(meta.wantsFlowers&&flowers>=2)pts+=2;else if(meta.wantsFlowers&&flowers===1)pts+=1;
  if(meta.pairBonus){if(pairs>=4)pts+=5;else if(pairs>=3)pts+=4;else if(pairs>=2)pts+=3;else if(pairs===1)pts+=1;}
  if(sectionId!=="sp"){if(triples>=2)pts+=4;else if(triples===1)pts+=2;}
  if(sectionId==="cr"){const run=iqLongestRun(finalRack);if(run.length>=5)pts+=5;else if(run.length>=4)pts+=4;else if(run.length>=3)pts+=2;}
  else if(sectionId==="wd"){const h=finalRack.filter(t=>t.t==="w"||t.t==="d").length;if(h>=8)pts+=5;else if(h>=6)pts+=4;else if(h>=4)pts+=2;}
  else if(sectionId==="aln"){const dom=iqDomNum(finalRack);if(dom.count>=6)pts+=5;else if(dom.count>=4)pts+=4;else if(dom.count>=3)pts+=2;}
  else if(sectionId==="sp"){if(pairs>=6)pts+=6;else if(pairs>=5)pts+=5;else if(pairs>=4)pts+=3;pts-=triples*2;}
  else{const sn=meta.strongNums||[];const sc=numTiles.filter(t=>sn.includes(t.n)).length;if(sc>=6)pts+=5;else if(sc>=4)pts+=4;else if(sc>=2)pts+=2;}
  if(meta.weakNums){const wc=numTiles.filter(t=>meta.weakNums.includes(t.n)).length;if(wc>=4)pts-=4;else if(wc>=2)pts-=2;}
  const raw=Math.max(0,Math.min(25,Math.round(pts/1.8)));
  const bucket=raw>=22?25:raw>=17?20:raw>=12?15:10;
  return{tileStrengthScore:bucket};
}

function iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId){
  const meta=SECTION_META[sectionId]||{};
  const sn=meta.strongNums||[];const wn=meta.weakNums||[];
  const allPassed=passedTilesByRound.flatMap(r=>r.tiles);
  let pts=10;
  const passedWeak=allPassed.filter(t=>t.t==="s"&&wn.includes(t.n)).length;
  const passedStrong=allPassed.filter(t=>{if(t.t==="s"&&sn.includes(t.n))return true;if(t.t==="f"&&meta.wantsFlowers)return true;return false;}).length;
  const sg=iqCountGroups(startingRack);const spk=Object.entries(sg).filter(([,v])=>v>=2).map(([k])=>k);
  const eg=iqCountGroups(finalRack);const brokenPairs=spk.filter(k=>!eg[k]||eg[k]<2).length;
  pts+=Math.min(passedWeak*1.5,8);pts-=Math.min(passedStrong*2,8);pts-=Math.min(brokenPairs*2,6);
  const roundInsights=passedTilesByRound.map(round=>{
    const rt=round.tiles;const rWeak=rt.filter(t=>t.t==="s"&&wn.includes(t.n)).length;const rStrong=rt.filter(t=>t.t==="s"&&sn.includes(t.n)).length;
    let quality,insight;
    if(rt.length===0){quality="neutral";insight="No tiles passed this round.";}
    else if(rStrong>0){quality="weak";insight=`Passed ${rStrong} tile(s) that supported your target direction.`;}
    else if(rWeak>=rt.length-1){quality="strong";insight="Clean pass — moved low-value tiles out of the rack.";}
    else{quality="mixed";insight="Mixed pass — some weak tiles moved, one tile was usable.";}
    return{roundName:round.roundName,passedTiles:rt.map(iqTileLabel),quality,insight};
  });
  const raw=Math.max(0,Math.min(25,Math.round(pts)));
  const bucket=raw>=22?25:raw>=17?20:raw>=12?15:10;
  return{passQualityScore:bucket,passInsights:roundInsights,brokenPairs,passedStrongCount:passedStrong};
}

function iqTiming(timePerRound,totalTime){
  const rc=timePerRound.filter(t=>t>0).length||1;const avg=totalTime/rc;
  let score,insight;
  if(avg>=8&&avg<=20){score=10;insight="Good pace. You took enough time without overthinking.";}
  else if(avg<4){score=4;insight="You moved very quickly — the rack may have needed another look.";}
  else if(avg<8){score=6;insight="Slightly fast — give yourself a few more seconds per round.";}
  else if(avg<=30){score=8;insight="Slightly deliberate, but still within a reasonable window.";}
  else if(avg<=45){score=6;insight="You took your time. Try to recognize your strongest group faster.";}
  else{score=4;insight="Very slow pace — trust your instincts more.";}
  return{timingScore:score,timingInsight:insight};
}

function iqDistanceToOptimal(finalRack,startingRack,passedTilesByRound,sectionId){
  const meta=SECTION_META[sectionId]||{};const sn=meta.strongNums||[];const wn=meta.weakNums||[];
  const finalNums=new Set(finalRack.filter(t=>t.t==="s").map(t=>t.n));
  const missingStrongTiles=sn.filter(n=>!finalNums.has(n)).map(n=>`${n} (any suit)`);
  const offDirectionTiles=finalRack.filter(t=>{if(t.t==="s"&&wn.includes(t.n))return true;if(meta.weakTypes&&meta.weakTypes.includes(t.t))return true;return false;}).map(iqTileLabel);
  let runGap=null;if(sectionId==="cr"){const run=iqLongestRun(finalRack);if(run.length<5)runGap=5-run.length;}
  const sg=iqCountGroups(startingRack);const spk=Object.entries(sg).filter(([,v])=>v>=2).map(([k])=>k);const eg=iqCountGroups(finalRack);
  const brokenPairLabels=spk.filter(k=>!eg[k]||eg[k]<2).slice(0,2).map(k=>{const p=k.split("-");if(p[0]==="w")return`${p[1]} Wind`;if(p[0]==="d")return`${p[1]} Dragon`;if(p[0]==="f")return"Flower";const sn2={bam:"Bam",crak:"Crk",dot:"Dot"};return`${p[1]} ${sn2[p[0]]||p[0]}`;});
  let keyMistakeRound=null;const wr=[...passedTilesByRound].sort((a,b)=>b.tiles.filter(t=>t.t==="s"&&sn.includes(t.n)).length-a.tiles.filter(t=>t.t==="s"&&sn.includes(t.n)).length)[0];
  if(wr&&wr.tiles.filter(t=>t.t==="s"&&sn.includes(t.n)).length>0)keyMistakeRound=wr.roundName;
  const distanceCount=missingStrongTiles.length+Math.min(offDirectionTiles.length,3)+(runGap||0);
  let explanation;
  if(distanceCount===0)explanation="Your final rack was well-optimized for your target direction.";
  else if(sectionId==="cr"&&runGap)explanation=`You were ${runGap} tile${runGap>1?"s":""} away from a stronger consecutive run.`;
  else if(brokenPairLabels.length>0)explanation=`You broke ${brokenPairLabels.length>1?"pairs":"a pair"} during the Charleston — this cost structural strength.`;
  else if(missingStrongTiles.length>0)explanation=`Your final rack was missing ${missingStrongTiles.length} key tile type${missingStrongTiles.length>1?"s":""} for this direction.`;
  else explanation=`${offDirectionTiles.length} tile(s) in your final rack didn't support your closest direction.`;
  return{distanceCount,explanation,missingStrongTiles,offDirectionTiles:offDirectionTiles.slice(0,4),keyMistakeRound,brokenPairs:brokenPairLabels};
}

function iqTileInsights(finalRack,startingRack,passedTilesByRound,sectionId){
  const meta=SECTION_META[sectionId]||{};const sn=meta.strongNums||[];const wn=meta.weakNums||[];
  const allPassed=passedTilesByRound.flatMap(r=>r.tiles);
  const protectedTiles=[...new Set(finalRack.filter(t=>{if(t.t==="j")return true;if(t.t==="f"&&meta.wantsFlowers)return true;if(t.t==="s"&&sn.includes(t.n))return true;if(meta.strongTypes&&meta.strongTypes.includes(t.t)&&sectionId==="wd")return true;return false;}).map(iqTileLabel))].slice(0,5);
  const missedTiles=[...new Set(allPassed.filter(t=>{if(t.t==="s"&&sn.includes(t.n))return true;return false;}).map(iqTileLabel))].slice(0,4);
  const weakKept=[...new Set(finalRack.filter(t=>{if(t.t==="s"&&wn.includes(t.n))return true;if(meta.weakTypes&&meta.weakTypes.includes(t.t))return true;return false;}).map(iqTileLabel))].slice(0,4);
  const riskyPassed=[...new Set(allPassed.filter(t=>{if(t.t==="s"&&sn.includes(t.n))return true;if(t.t==="f"&&meta.wantsFlowers)return true;return false;}).map(iqTileLabel))].slice(0,3);
  const missedOpportunities=[];
  const sg=iqCountGroups(startingRack);const eg=iqCountGroups(finalRack);
  Object.entries(sg).filter(([,v])=>v>=2).forEach(([k])=>{if(!eg[k]||eg[k]<2){const p=k.split("-");const sn2={bam:"Bam",crak:"Crk",dot:"Dot"};const lbl=p[0]==="w"?`${p[1]} Wind`:p[0]==="d"?`${p[1]} Dragon`:p[0]==="f"?"Flower":`${p[1]} ${sn2[p[0]]||p[0]}`;missedOpportunities.push(`Broke a pair of ${lbl} during the Charleston.`);}});
  if(sectionId==="cr"&&iqLongestRun(finalRack).length<4&&missedTiles.length>0)missedOpportunities.push("Passed tiles that could have extended a consecutive run.");
  if(weakKept.length>=3)missedOpportunities.push(`Held ${weakKept.length} off-direction tiles that could have been passed.`);
  return{protectedTiles,missedTiles,weakKept,riskyPassed,missedOpportunities:missedOpportunities.slice(0,4)};
}

function iqScoreLevel(score){
  if(score>=90)return{level:"Mahjong Master",levelExplanation:"You built a clear path and protected it across every pass."};
  if(score>=80)return{level:"Skilled Player",levelExplanation:"You were close to a top-tier rack, with only a small mistake holding you back."};
  if(score>=70)return{level:"Game Ready",levelExplanation:"You had the right idea, but your rack still pulled in more than one direction."};
  if(score>=60)return{level:"Getting There",levelExplanation:"You showed moments of structure, but your rack didn't fully commit."};
  return{level:"Keep Going, Rookie",levelExplanation:"Your rack stayed scattered. Focus on finding one strong group early."};
}

function iqFeedback(ds,ts,ps,tm,brokenPairs,sectionId){
  const strengths=[],weaknesses=[];
  if(ds>=35)strengths.push("You committed to a clear direction early and held it.");
  else if(ds>=25)strengths.push("You generally moved toward a viable hand pattern.");
  else weaknesses.push("Your rack ended up scattered — try picking one direction after your first pass and committing.");
  if(ts>=20)strengths.push("Your final rack had strong structural tiles — pairs, anchors, or key numbers well represented.");
  else if(ts<=10)weaknesses.push("The tiles you kept didn't build strong structure. Look for pairs and groups before each pass.");
  if(ps>=20)strengths.push("Your passing decisions moved weak tiles out cleanly.");
  else if(ps<=12)weaknesses.push("Some passes included tiles that supported your best direction — pass isolated or off-suit tiles first.");
  if(brokenPairs>0)weaknesses.push(`You broke ${brokenPairs>1?"pairs":"a pair"} during the Charleston — pairs are anchors, protect them.`);
  if(tm>=9)strengths.push("Your pace was calm and deliberate without being slow.");
  else if(tm<=5)weaknesses.push("Your pace was too fast (or slow) — aim for 10–15 seconds per round.");
  const fs=[...new Set(strengths)].slice(0,2);const fw=[...new Set(weaknesses)].slice(0,2);
  let coachNote;
  if(ds<20&&ps<15)coachNote="Start each Charleston by identifying your best group — even one pair or two matching tiles. Everything else flows from that anchor.";
  else if(ps<15)coachNote="You saw the right general direction, but one or more passes weakened your ability to fully commit.";
  else if(ds<25)coachNote="Good passing instincts — now work on committing to a direction earlier. A tighter focus will push your score higher.";
  else if(brokenPairs>0)coachNote="Your strongest moments were when you protected your pairs. Watch for chances to keep both tiles of a pair.";
  else coachNote="Solid Charleston. To push higher, check whether your middle tiles — not just obvious weak ones — support your strongest group.";
  const worst=[{cat:"direction",sc:ds,mx:40},{cat:"tiles",sc:ts,mx:25},{cat:"passes",sc:ps,mx:25}].sort((a,b)=>(a.sc/a.mx)-(b.sc/b.mx))[0];
  let tryNextTime;
  if(worst.cat==="direction")tryNextTime="Before your first pass, identify your strongest group. Make every pass decision relative to that anchor.";
  else if(worst.cat==="tiles")tryNextTime="Before passing, ask: does this tile support my strongest group, build a pair, or open a second path? If no to all three, pass it.";
  else tryNextTime="Before each pass, check if any tile you're about to give away connects to something you're keeping.";
  return{strengths:fs,weaknesses:fw,coachNote,tryNextTime};
}

function calculateCharlestonIQ(gameState,puzzleId,isDaily,dayNum){
  const{startingRack,finalRack,passedTilesByRound,timePerRound,totalTime,sectionId}=gameState;
  const{directionScore,directionExplanation}=iqDirection(finalRack,sectionId);
  const{tileStrengthScore}=iqTileStrength(finalRack,sectionId);
  const{passQualityScore,passInsights,brokenPairs,passedStrongCount}=iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId);
  const{timingScore,timingInsight}=iqTiming(timePerRound,totalTime);
  const totalScore=Math.min(100,Math.max(0,directionScore+tileStrengthScore+passQualityScore+timingScore));
  const{level,levelExplanation}=iqScoreLevel(totalScore);
  const distanceToOptimal=iqDistanceToOptimal(finalRack,startingRack,passedTilesByRound,sectionId);
  const tileInsights=iqTileInsights(finalRack,startingRack,passedTilesByRound,sectionId);
  const{strengths,weaknesses,coachNote,tryNextTime}=iqFeedback(directionScore,tileStrengthScore,passQualityScore,timingScore,brokenPairs,sectionId);
  const sec=SECS.find(s=>s.id===sectionId);
  const shareText=[
    isDaily?`RACKLE #${dayNum}`:"RACKLE · Practice",
    "",
    `Charleston IQ: ${totalScore}`,
    `Level: ${level}`,
    totalTime?`Time: ${fT(totalTime)}`:"",
    "",
    "Test your skills:",
    "playrackle.com",
  ].filter(Boolean).join("\n");
  return{puzzleId,totalScore,level,levelExplanation,directionScore,tileStrengthScore,passQualityScore,timingScore,directionExplanation,distanceToOptimal,strengths,weaknesses,tileInsights,passInsights,timingInsight,coachNote,tryNextTime,totalTime,shareText};
}

// ─── IQ SCORECARD COMPONENT ───────────────────────────────────
function ScoreBar({label,value,max,color}){
  const pct=Math.round((value/max)*100);
  return(
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
        <span style={{fontSize:11,color:C.mut,fontWeight:600}}>{label}</span>
        <span style={{fontSize:12,fontFamily:F.d,fontWeight:800,color}}>{value}<span style={{fontSize:9,color:C.mut,fontWeight:600}}>/{max}</span></span>
      </div>
      <div style={{height:6,borderRadius:3,background:C.bg2,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",borderRadius:3,background:color,transition:"width 0.6s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      </div>
    </div>
  );
}
function QualityPip({quality}){
  const cfg={
    strong:{bg:"#2E6B48",color:"#fff",label:"Strong"},
    weak:{bg:"#7A4A20",color:"#fff",label:"Weak"},
    mixed:{bg:"#8A6A1E",color:"#fff",label:"Mixed"},
    neutral:{bg:C.bg2,color:C.mut,label:"—"},
  }[quality]||{bg:C.bg2,color:C.mut,label:"—"};
  return<span style={{fontSize:9,color:cfg.color,fontWeight:700,background:cfg.bg,borderRadius:20,padding:"2px 8px"}}>{cfg.label}</span>;
}

function ShareButton({onClick,copied}){
  return(
    <button
      onClick={onClick}
      style={{width:"100%",minHeight:50,padding:"0 16px",borderRadius:12,border:"none",cursor:"pointer",background:copied?"#1A4D2E":"#2C2118",color:"#FAF7F1",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"background 0.2s"}}
      aria-label="Copy result to clipboard"
    >
      <span style={{fontSize:16,lineHeight:1}}>{copied?"✓":"🀄"}</span>
      <span style={{fontFamily:F.d,fontSize:15,fontWeight:800,letterSpacing:0.2,lineHeight:1}}>{copied?"Copied to clipboard":"Share with your Mahj group"}</span>
    </button>
  );
}
function IQScorecard({scorecard,hand,passed,large,mode,copied,setCopied,home,restart,chosenSec}){
  const[tab,setTab]=useState("overview");
  const sc=scorecard;
  const isD=mode==="daily";const dn=getDayNum();
  // IQ color: always a warm ink tone — never red on green
  const iqColor=sc.totalScore>=90?"#1B7D4E":sc.totalScore>=80?"#2460A8":sc.totalScore>=70?"#8A6A1E":sc.totalScore>=60?"#7A4A20":"#5C3A1E";
  const sec=SECS.find(s=>s.id===chosenSec);
  // Bar fill color — always jade, width communicates level
  const barColor="#1B7D4E";

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>

      {/* HERO — dark jade gradient */}
      <div role="status" aria-live="polite" style={{borderRadius:20,overflow:"hidden",marginBottom:10,background:"linear-gradient(160deg,#083D22,#0F5535,#072E19)",padding:"28px 20px 22px",textAlign:"center",boxShadow:"0 12px 40px rgba(8,61,34,0.5)"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:3,fontWeight:700,marginBottom:16}}>{isD?`DAILY RACKLE · #${dn}`:"PRACTICE MODE"}</div>
        <div style={{fontSize:9,color:"#C9A84C",letterSpacing:2.5,fontWeight:700,marginBottom:6}}>CHARLESTON IQ</div>
        <div style={{fontFamily:F.d,fontSize:56,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:10,textShadow:"0 2px 12px rgba(176,138,53,0.4)"}}>{sc.totalScore}</div>
        <div style={{width:48,height:1.5,background:"linear-gradient(90deg,transparent,#C9A84C,transparent)",margin:"0 auto 12px"}}/>
        <div style={{fontFamily:F.d,fontSize:21,fontWeight:900,color:"rgba(255,255,255,0.9)",letterSpacing:-0.3,lineHeight:1,marginBottom:6}}>{sc.level}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:16,lineHeight:1.5,maxWidth:260,margin:"0 auto 16px"}}>{sc.levelExplanation}</div>
        <div style={{width:36,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",margin:"0 auto 14px"}}/>
        <div style={{display:"flex",justifyContent:"center",gap:0,flexWrap:"wrap"}}>
          {sec&&<>
            <div style={{textAlign:"center",padding:"0 14px"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:3}}>SECTION</div>
              <div style={{fontSize:12,color:"#fff",fontWeight:700}}>{sec.icon} {sec.name}</div>
            </div>
            <div style={{width:1,background:"rgba(255,255,255,0.15)"}}/>
          </>}
          {sc.totalTime>0&&<div style={{textAlign:"center",padding:"0 14px"}}>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:3}}>TIME</div>
            <div style={{fontSize:12,color:"#fff",fontWeight:700}}>⏱ {fT(sc.totalTime)}</div>
          </div>}
        </div>
      </div>

      {/* TAB NAV */}
      <div style={{display:"flex",gap:3,marginBottom:10,background:C.bg2,borderRadius:12,padding:4,border:`1px solid ${C.bdr}`}}>
        {[["overview","Overview"],["passes","Passes"],["tiles","Tiles"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:tab===t?"#fff":C.bg2,color:tab===t?C.ink:C.mut,boxShadow:tab===t?"0 1px 4px rgba(0,0,0,0.07)":"none",transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab==="overview"&&(
        <div className="rk-in">
          {/* SCORE BREAKDOWN — always jade bars, neutral background */}
          <div style={S.card}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:12}}>SCORE BREAKDOWN</div>
            <ScoreBar label="Direction" value={sc.directionScore} max={40} color={barColor}/>
            <ScoreBar label="Tile Strength" value={sc.tileStrengthScore} max={25} color={barColor}/>
            <ScoreBar label="Pass Quality" value={sc.passQualityScore} max={25} color={barColor}/>
            <ScoreBar label="Timing" value={sc.timingScore} max={10} color={barColor}/>
            <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:C.mut,letterSpacing:0.3}}>CHARLESTON IQ</span>
              <span style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink}}>{sc.totalScore}</span>
            </div>
          </div>

          {/* DIRECTION NOTE — soft blue-grey, no color clash */}
          {sc.directionExplanation&&<div style={{...S.card,background:"#F3F5F8",borderColor:"#D0D8E4"}}>
            <div style={{fontSize:9,color:"#4A6080",letterSpacing:2,fontWeight:700,marginBottom:5}}>🧭 DIRECTION READ</div>
            <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:0}}>{sc.directionExplanation}</p>
          </div>}

          {/* DISTANCE NOTE — warm amber, no red */}
          {sc.distanceToOptimal&&<div style={{...S.card,background:"#FBF8F2",borderColor:"#E8DCC4"}}>
            <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700,marginBottom:5}}>📏 DISTANCE TO OPTIMAL</div>
            <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"0 0 6px"}}>{sc.distanceToOptimal.explanation}</p>
            {sc.distanceToOptimal.keyMistakeRound&&<div style={{fontSize:11,color:"#8A6A1E",fontWeight:600,background:"rgba(138,106,30,0.08)",borderRadius:6,padding:"4px 8px",display:"inline-block"}}>Key moment: {sc.distanceToOptimal.keyMistakeRound}</div>}
          </div>}

          {/* STRENGTHS — separate cards, never red on green */}
          {sc.strengths?.length>0&&<div style={{...S.card,background:"#F4FAF6",borderColor:"#C8E2D0"}}>
            <div style={{fontSize:9,color:"#2E6B48",letterSpacing:2,fontWeight:700,marginBottom:8}}>WHAT WENT WELL</div>
            {sc.strengths.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<sc.strengths.length-1?8:0,alignItems:"flex-start"}}>
                <div style={{width:18,height:18,borderRadius:9,background:"#2E6B48",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <span style={{fontSize:9,color:"#fff",fontWeight:800}}>✓</span>
                </div>
                <span style={{fontSize:12,color:"#1A3D28",lineHeight:1.6}}>{s}</span>
              </div>
            ))}
          </div>}

          {/* WEAKNESSES — separate card, warm slate, not red */}
          {sc.weaknesses?.length>0&&<div style={{...S.card,background:"#F8F5F0",borderColor:"#DDD0BC"}}>
            <div style={{fontSize:9,color:"#6B5430",letterSpacing:2,fontWeight:700,marginBottom:8}}>TO WORK ON</div>
            {sc.weaknesses.map((w,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<sc.weaknesses.length-1?8:0,alignItems:"flex-start"}}>
                <div style={{width:18,height:18,borderRadius:9,background:"#8A6A1E",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <span style={{fontSize:9,color:"#fff",fontWeight:800}}>→</span>
                </div>
                <span style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{w}</span>
              </div>
            ))}
          </div>}

          {/* COACH NOTE — warm cream, gold accent */}
          {sc.coachNote&&<div style={{...S.card,background:"#FDFAF3",borderColor:"#E8D9A8",borderWidth:1.5}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <span style={{fontSize:14}}>💬</span>
              <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700}}>COACH NOTE</div>
            </div>
            <p style={{fontSize:12,color:C.ink,lineHeight:1.75,margin:"0 0 10px"}}>{sc.coachNote}</p>
            <div style={{borderTop:"1px solid #E8D9A8",paddingTop:10}}>
              <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:5}}>TRY NEXT TIME</div>
              <p style={{fontSize:12,color:"#5C4A2A",lineHeight:1.65,margin:0}}>{sc.tryNextTime}</p>
            </div>
          </div>}

          {/* TIMING — plain neutral */}
          {sc.timingInsight&&<div style={{...S.card,background:C.bg2,borderColor:C.bdr}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:5}}>⏱ TIMING</div>
            <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}>{sc.timingInsight}</p>
          </div>}
        </div>
      )}

      {/* PASSES TAB */}
      {tab==="passes"&&(
        <div className="rk-in">
          {sc.passInsights?.length>0?(
            sc.passInsights.map((r,i)=>{
              const qBg=r.quality==="strong"?"#F4FAF6":r.quality==="weak"?"#FBF5F0":r.quality==="mixed"?"#FBF8F2":C.bg;
              const qBorder=r.quality==="strong"?"#C8E2D0":r.quality==="weak"?"#E5CCBB":r.quality==="mixed"?"#E8DCC4":C.bdr;
              return(
              <div key={i} style={{...S.card,marginBottom:8,background:qBg,borderColor:qBorder}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{r.roundName}</span>
                  <QualityPip quality={r.quality}/>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>
                  {r.passedTiles.length===0
                    ?<span style={{fontSize:11,color:C.mut,fontStyle:"italic"}}>No tiles passed</span>
                    :r.passedTiles.map((tl,j)=><span key={j} style={{fontSize:10,background:"rgba(255,255,255,0.7)",border:`1px solid ${qBorder}`,borderRadius:6,padding:"2px 7px",color:C.ink,fontWeight:600}}>{tl}</span>)
                  }
                </div>
                <p style={{fontSize:12,color:"#5C4A3A",lineHeight:1.6,margin:0}}>{r.insight}</p>
              </div>
            )})
          ):(
            <div style={{...S.card,textAlign:"center",padding:"24px 16px"}}>
              <div style={{fontSize:20,marginBottom:8}}>🔄</div>
              <div style={{fontSize:13,color:C.mut}}>No pass data recorded yet.</div>
            </div>
          )}
          {passed.length>0&&<div style={S.card}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>ALL PASSED TILES ({passed.length})</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{passed.map((t,i)=><Ti key={i} t={t} large={false}/>)}</div>
          </div>}
        </div>
      )}

      {/* TILES TAB */}
      {tab==="tiles"&&(
        <div className="rk-in">
          <Rack hand={hand} label="FINAL RACK" large={large}/>
          {sc.tileInsights?.protectedTiles?.length>0&&<div style={{...S.card,background:"#F4FAF6",borderColor:"#C8E2D0"}}>
            <div style={{fontSize:9,color:"#2E6B48",letterSpacing:2,fontWeight:700,marginBottom:8}}>TILES YOU PROTECTED</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {sc.tileInsights.protectedTiles.map((t,i)=><span key={i} style={{fontSize:10,color:"#2E6B48",background:"rgba(46,107,72,0.1)",border:"1px solid rgba(46,107,72,0.2)",borderRadius:6,padding:"3px 9px",fontWeight:700}}>{t}</span>)}
            </div>
          </div>}
          {sc.tileInsights?.weakKept?.length>0&&<div style={{...S.card,background:"#FBF8F2",borderColor:"#E8DCC4"}}>
            <div style={{fontSize:9,color:"#8A6A1E",letterSpacing:2,fontWeight:700,marginBottom:8}}>OFF-DIRECTION TILES KEPT</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {sc.tileInsights.weakKept.map((t,i)=><span key={i} style={{fontSize:10,color:"#8A6A1E",background:"rgba(138,106,30,0.1)",border:"1px solid rgba(138,106,30,0.2)",borderRadius:6,padding:"3px 9px",fontWeight:700}}>{t}</span>)}
            </div>
          </div>}
          {sc.tileInsights?.riskyPassed?.length>0&&<div style={{...S.card,background:"#F8F5F0",borderColor:"#DDD0BC"}}>
            <div style={{fontSize:9,color:"#6B5430",letterSpacing:2,fontWeight:700,marginBottom:8}}>USEFUL TILES YOU PASSED</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {sc.tileInsights.riskyPassed.map((t,i)=><span key={i} style={{fontSize:10,color:"#6B5430",background:"rgba(107,84,48,0.1)",border:"1px solid rgba(107,84,48,0.2)",borderRadius:6,padding:"3px 9px",fontWeight:700}}>{t}</span>)}
            </div>
          </div>}
          {sc.tileInsights?.missedOpportunities?.length>0&&<div style={S.card}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>MISSED OPPORTUNITIES</div>
            {sc.tileInsights.missedOpportunities.map((m,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:i<sc.tileInsights.missedOpportunities.length-1?8:0,alignItems:"flex-start"}}>
                <span style={{color:"#8A6A1E",fontSize:14,flexShrink:0,lineHeight:1.4}}>›</span>
                <span style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{m}</span>
              </div>
            ))}
          </div>}
          {sc.tileInsights?.missedTiles?.length>0&&<div style={{...S.card,background:C.bg2,borderColor:C.bdr}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>TILES THAT WOULD HAVE HELPED</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {sc.tileInsights.missedTiles.map((t,i)=><span key={i} style={{fontSize:10,color:C.mut,background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:6,padding:"3px 9px",fontWeight:600}}>{t}</span>)}
            </div>
          </div>}
        </div>
      )}

      {/* SHARE — ink/parchment, no green button */}
      {(()=>{
        const isD=mode==="daily";const dn=getDayNum();
        const freshShare=[isD?`RACKLE #${dn}`:"RACKLE · Practice",``,`Charleston IQ: ${sc.totalScore}`,`Level: ${sc.level}`,sc.totalTime?`Time: ${fT(sc.totalTime)}`:"",``,`Test your skills:`,`playrackle.com`].filter((l,i,a)=>!(l===""&&(i===0||a[i-1]===""||i===a.length-1))).join("\n");
        return(
        <div style={{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:14,overflow:"hidden",marginTop:10,marginBottom:8}}>
          <div style={{padding:"14px 16px"}}>
            <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>SHARE YOUR RESULT</div>
            <div style={{fontFamily:"monospace",fontSize:10,color:C.ink,lineHeight:1.85,whiteSpace:"pre-wrap",background:C.bg2,borderRadius:8,padding:"11px 13px",marginBottom:10,border:`1px solid ${C.bdr}`,textAlign:"left"}}>{freshShare}</div>
            <ShareButton onClick={()=>{navigator.clipboard?.writeText(freshShare).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}} copied={copied}/>
          </div>
        </div>
        );
      })()}

      {/* ACTIONS */}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <button onClick={home} style={{...S.oBtn,flex:1}} aria-label="Return to home screen">← Home</button>
        {!isD&&<button onClick={restart} style={{...S.greenBtn,flex:1}} aria-label="Deal a new hand">Deal Again →</button>}
      </div>
    </div>
  );
}

// GAME
function Game({mode,home,onDone,settings}){
  const [phase,setPhase]=useState("deal");
  const [hand,setHand]=useState([]);const [pool,setPool]=useState([]);
  const [sel,setSel]=useState([]);const [passed,setPassed]=useState([]);
  const [newIdx,setNewIdx]=useState([]);const [jw,setJw]=useState(false);
  const [chosenSec,setChosenSec]=useState(null);const [showRef,setShowRef]=useState(false);
  const [showHint,setShowHint]=useState(false);const [hintExp,setHintExp]=useState(null);
  const [cn,setCn]=useState(1);const [pi,setPi]=useState(0);
  const [copied,setCopied]=useState(false);
  const [st,setSt]=useState(null);const [el,setEl]=useState(0);const [td,setTd]=useState(false);
  const [showLeave,setShowLeave]=useState(false);
  const [scorecard,setScorecard]=useState(null);
  // Pass tracking for Charleston IQ
  const [passHistory,setPassHistory]=useState([]);
  const [startingRack,setStartingRack]=useState([]);
  const [roundStartTime,setRoundStartTime]=useState(null);
  const [timePerRound,setTimePerRound]=useState([]);
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
    setStartingRack(dealt);setPassHistory([]);setTimePerRound([]);
    setTimeout(()=>{setPhase("pass");stRef.current=Date.now();setSt(Date.now());setRoundStartTime(Date.now());},500);
  },[]);

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
    const pt=sel.map(i=>hand[i]);
    // Record this round for Charleston IQ
    const roundNow=Date.now();
    const roundTime=roundStartTime?Math.round((roundNow-roundStartTime)/1000):0;
    const roundNames=["Pass Right","Pass Over","Pass Left (Blind)","2nd Pass Left","2nd Pass Over","2nd Pass Right","Courtesy Pass"];
    const roundIdx=passHistory.length;
    setPassHistory(prev=>[...prev,{roundName:roundNames[roundIdx]||`Round ${roundIdx+1}`,tiles:[...pt],time:roundTime}]);
    setTimePerRound(prev=>[...prev,roundTime]);
    setRoundStartTime(roundNow);
    setPassed(p=>[...p,...pt]);
    const rem=hand.filter((_,i)=>!sel.includes(i));const safe=pool.filter(t=>t.t!=="j");
    const inc=safe.slice(0,count);setPool(safe.slice(count));
    const comb=[...rem,...inc];const ni=[];for(let i=rem.length;i<comb.length;i++)ni.push(i);
    setNewIdx(ni);setHand(comb);setSel([]);
    setTimeout(()=>{setNewIdx([]);setShowHint(false);setHintExp(null);if(pi<2){setPi(p=>p+1);}else{setPhase(cn===1?"askSecond":"askCourtesy");}},600);  };
  const doPass=()=>{
    const min=cp.blind?0:cp.req;const max=cp.blind?(cp.max||3):cp.req;
    if(sel.length<min||sel.length>max)return;
    if(sel.length===0){setShowHint(false);setHintExp(null);if(pi<2){setPi(p=>p+1);}else{setPhase(cn===1?"askSecond":"askCourtesy");}return;}
    doSwap(sel.length);
  };

  const stopTimer=()=>{if(stRef.current){elRef.current+=Date.now()-stRef.current;stRef.current=null;}setTd(true);};

  const confirm=()=>{
    if(!chosenSec)return;setTd(true);
    const totalEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);
    // Legacy rating for history/streak/home display
    const a=adv(hand,chosenSec),e=ev(hand),top=e[0],gi=gri(top.score);
    // Charleston IQ
    const iq=calculateCharlestonIQ({
      startingRack,finalRack:hand,
      passedTilesByRound:passHistory,
      timePerRound,totalTime:totalEl,
      sectionId:chosenSec,
    },getDayNum(),mode==="daily",getDayNum());
    setScorecard(iq);
    onDone({rating:RATS[gi],emoji:REMO[gi],section:`${top.icon} ${top.name}`,sid:top.id,score:top.score,time:totalEl,gi,iq});
    setPhase("result");
  };

  const restart=()=>{
    const d=shuffle(buildDeck());const dealt=d.slice(0,13);
    setHand(dealt);setPool(d.slice(13).filter(t=>t.t!=="j"));
    setStartingRack(dealt);setPassHistory([]);setTimePerRound([]);setScorecard(null);
    setSel([]);setPassed([]);setNewIdx([]);setCn(1);setPi(0);setChosenSec(null);
    setShowRef(false);setShowHint(false);setHintExp(null);setCopied(false);
    setTd(false);elRef.current=0;stRef.current=null;setEl(0);
    setPhase("deal");
    setTimeout(()=>{setPhase("pass");stRef.current=Date.now();setSt(Date.now());setRoundStartTime(Date.now());},500);
  };

  const getDisplayTime=()=>{
    if(!settings?.showTimer)return null;
    return fT(el);
  };

  const isBlind=cp.blind,canPass=isBlind?sel.length<=(cp.max||3):sel.length===cp.req,hasNew=newIdx.length>0;

  return(
    <div style={S.pg} className="rk-pg">
      {phase==="deal"&&(
        <div style={{textAlign:"center",paddingTop:60}}>
          <div aria-hidden="true" style={{fontSize:28}}>🎲</div>
          <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink}}>Dealing...</h2>
        </div>
      )}

      {phase==="result"&&scorecard&&(
        <IQScorecard
          scorecard={scorecard}
          hand={hand}
          passed={passed}
          large={large}
          mode={mode}
          copied={copied}
          setCopied={setCopied}
          home={home}
          restart={restart}
          chosenSec={chosenSec}
        />
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
            onClick={()=>{if(sel.length<1)return;haptic(40);const pt=sel.map(i=>hand[i]);const roundNow=Date.now();const roundTime=roundStartTime?Math.round((roundNow-roundStartTime)/1000):0;setPassHistory(prev=>[...prev,{roundName:"Courtesy Pass",tiles:[...pt],time:roundTime}]);setTimePerRound(prev=>[...prev,roundTime]);setPassed(p=>[...p,...pt]);const rem=hand.filter((_,i)=>!sel.includes(i));const safe=pool.filter(t=>t.t!=="j");const inc=safe.slice(0,sel.length);setPool(safe.slice(sel.length));setHand([...rem,...inc]);setSel([]);setNewIdx([]);stopTimer();setPhase("chooseHand");}}
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
          {!hasNew&&<div style={{marginTop:8}}>
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
  const levelColor=(l)=>l==="Beginner friendly"?C.jade:l==="Intermediate"?C.gold:C.cinn;
  return(
    <div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",maxHeight:380,overflowY:"auto"}} className="rk-in" role="region" aria-label="2026 Card Guide">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,position:"sticky",top:0,background:"#FFFFF8",paddingBottom:3,zIndex:1}}>
        <span style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700}}>📖 2026 CARD GUIDE</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer"}} aria-label="Close card guide">✕</button>
      </div>
      {SECS.map(s=>{const o=exp===s.id;const lc=levelColor(s.level);return(
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
            {/* LEVEL + STATS ROW */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:10,color:lc,fontWeight:700,background:lc+"12",border:`1px solid ${lc}25`,borderRadius:20,padding:"2px 8px"}}>{s.level}</span>
              <span style={{fontSize:10,color:C.mut}}>{"★".repeat(s.diff)}{"☆".repeat(5-s.diff)}</span>
              <span style={{fontSize:10,color:C.mut}}>{s.hands} hands</span>
            </div>
            {/* HOLD / PASS */}
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
            {/* STRATEGY */}
            <div style={{background:C.gold+"06",borderRadius:8,padding:"7px 9px",marginBottom:8}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>💡 STRATEGY</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.combos}</div>
            </div>
            {/* JOKER NOTE */}
            <div style={{background:"#FFF9E6",borderRadius:8,padding:"7px 9px",marginBottom:8,border:`1px solid ${C.gold}20`}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>🃏 JOKERS</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{s.joker}</div>
            </div>
            {/* EXAMPLE */}
            <div style={{background:C.bg2,borderRadius:8,padding:"7px 9px"}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>EXAMPLE HAND STRUCTURE</div>
              <div style={{fontFamily:"monospace",fontSize:12,color:C.ink,letterSpacing:1}}>{s.example}</div>
            </div>
          </div>}
        </div>);})}
    </div>);
}


