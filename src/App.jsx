import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, useRef, useCallback } from "react";
// RACKLE — Daily Charleston + Practice. Rack & Roll. 2026 NMJL.
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
    const strongNums=meta.strongNums||[];
    const weakNums=meta.weakNums||[];
    const strongTiles=finalRack.filter(t=>t.t==="s"&&strongNums.includes(t.n)).length;
    const weakTiles=finalRack.filter(t=>t.t==="s"&&weakNums.includes(t.n)).length;
    const total=finalRack.length;
    const strongRatio=strongTiles/Math.max(total,1);
    const weakRatio=weakTiles/Math.max(total,1);
    directionScore=strongRatio>=0.55&&weakRatio<=0.1?40:strongRatio>=0.45&&weakRatio<=0.2?32:strongRatio>=0.35?22:strongRatio>=0.2?14:strongRatio>=0.1?8:4;
    const secName=SECS.find(s=>s.id===sectionId)?.name||sectionId;
    directionExplanation=strongRatio>=0.55?`${strongTiles} strong tiles for ${secName} — your rack pointed clearly in the right direction.`:strongRatio>=0.35?`${strongTiles} strong tiles for ${secName}. Getting there, but ${weakTiles} off-direction tiles are costing you.`:`Only ${strongTiles} tiles align with ${secName}. Your rack needed stronger commitment earlier.`;
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
  let raw=0;

  if(meta.pairsOnly){
    // Singles & Pairs
    raw+=pairs>=5?12:pairs>=4?10:pairs>=3?7:pairs>=2?4:pairs*2;
    raw-=triples*5;
    if(jk>0)raw-=3; // jokers worthless here
  } else if(meta.runBased){
    const run=iqLongestRun(finalRack);
    raw+=run>=5?12:run>=4?9:run>=3?6:run*2;
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=2?2:fl>=1?1:0;
  } else if(meta.likeNumbers){
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{c[t.n]=(c[t.n]||0)+1;});
    const mx=Object.values(c).length?Math.max(...Object.values(c)):0;
    raw+=mx>=6?12:mx>=5?9:mx>=4?6:mx>=3?3:mx;
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=1?2:0;
  } else if(meta.quintsNeeded){
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}${t.n}`;c[k]=(c[k]||0)+1;});
    const mx=Object.values(c).length?Math.max(...Object.values(c)):0;
    raw+=jk>=2?8:jk>=1?4:0;
    raw+=mx>=4?6:mx>=3?4:mx>=2?2:0;
  } else if(meta.strongTypes&&meta.strongTypes.length){
    // Winds & Dragons
    const honors=finalRack.filter(t=>meta.strongTypes.includes(t.t)).length;
    raw+=honors>=8?12:honors>=6?9:honors>=4?6:honors>=2?3:0;
    raw+=pairs>=3?6:pairs>=2?4:pairs>=1?2:0;
    raw+=jk>=2?4:jk>=1?2:0;
  } else {
    // numbered sections
    const strongNums=meta.strongNums||[];
    const weakNums=meta.weakNums||[];
    const strong=finalRack.filter(t=>t.t==="s"&&strongNums.includes(t.n)).length;
    const weak=finalRack.filter(t=>t.t==="s"&&weakNums.includes(t.n)).length;
    raw+=strong>=8?10:strong>=6?8:strong>=4?5:strong>=2?3:0;
    if(meta.pairBonus){raw+=pairs>=4?5:pairs>=3?4:pairs>=2?3:pairs>=1?1:0;}
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=2&&meta.wantsFlowers?2:fl>=1&&meta.wantsFlowers?1:0;
    if(weak>=4)raw-=4;else if(weak>=2)raw-=2;
  }

  const score=raw/1.8;
  let bucketed=10;
  if(score>=12)bucketed=25;
  else if(score>=9)bucketed=20;
  else if(score>=6)bucketed=15;
  return{tileStrengthScore:bucketed};
}

function iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId){
  if(!passedTilesByRound||passedTilesByRound.length===0)return{passQualityScore:10,passInsights:[]};
  const meta=SECTION_META[sectionId]||{};
  const strongNums=meta.strongNums||[];
  const weakNums=meta.weakNums||[];
  const strongTypes=meta.strongTypes||[];
  const weakTypes=meta.weakTypes||[];
  const riskyPass=meta.riskyPass||[];

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
      brokenPairsTotal++;
      brokenPairKeys.push(k);
    }
  });

  let adj=0;
  const passInsights=passedTilesByRound.map(p=>{
    const tiles=p.out||[];
    if(tiles.length===0)return{roundName:p.label||p.roundName||"Pass",passedTiles:[],quality:"neutral",insight:"No tiles passed this round."};
    let weakPassed=0,strongPassed=0;
    tiles.forEach(t=>{
      if(isStrongTile(t)){strongPassed++;adj=Math.max(adj-2,-8);}
      else if(isWeakTile(t)){weakPassed++;adj=Math.min(adj+1.5,8);}
    });
    let quality="neutral",insight="";
    if(strongPassed>0&&weakPassed===0){quality="weak";insight=`Passed ${strongPassed} tile${strongPassed>1?"s":""} your section wanted to keep.`;}
    else if(weakPassed>0&&strongPassed===0){quality="strong";insight=`Passed ${weakPassed} off-direction tile${weakPassed>1?"s":""} — clean round.`;}
    else if(strongPassed>0&&weakPassed>0){quality="mixed";insight=`Mixed round — passed some useful tiles alongside the weaker ones.`;}
    else{quality="neutral";insight="Neutral pass — tiles were neither clearly strong nor weak for your section.";}
    return{roundName:p.label||p.roundName||"Pass",passedTiles:tiles,quality,insight};
  });

  adj=Math.max(-8,Math.min(8,adj));
  adj-=Math.min(brokenPairsTotal*2,6);
  const raw=10+adj;
  let bucketed=10;
  if(raw>=22)bucketed=25;
  else if(raw>=16)bucketed=20;
  else if(raw>=11)bucketed=15;
  return{passQualityScore:bucketed,passInsights,brokenPairsCount:brokenPairsTotal,brokenPairKeys};
}

function iqTiming(totalTime,roundCount){
  const rc=Math.max(roundCount,1);
  const avg=totalTime/rc;
  let timingScore=10,timingInsight="";
  if(avg>=8&&avg<=20){timingScore=10;timingInsight="Good pace. You took enough time without overthinking.";}
  else if(avg>=4&&avg<8){timingScore=6;timingInsight="Slightly fast — give yourself a few more seconds per round.";}
  else if(avg<4){timingScore=4;timingInsight="You moved very quickly — the rack may have needed another look.";}
  else if(avg>20&&avg<=30){timingScore=8;timingInsight="Slightly deliberate, but still within a reasonable window.";}
  else if(avg>30&&avg<=45){timingScore=6;timingInsight="You took your time. Try to recognise your strongest group faster.";}
  else{timingScore=4;timingInsight="Very slow pace — trust your instincts more.";}
  return{timingScore,timingInsight};
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
  const{directionScore,directionExplanation}=iqDirection(finalRack,sectionId);
  const{tileStrengthScore}=iqTileStrength(finalRack,sectionId);
  const{passQualityScore,passInsights,brokenPairsCount}=iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId);
  const{timingScore,timingInsight}=iqTiming(totalTime||0,roundCount);

  const totalScore=Math.max(0,Math.min(100,directionScore+tileStrengthScore+passQualityScore+timingScore));
  const{level,levelExplanation}=iqScoreLevel(totalScore,directionScore,tileStrengthScore,passQualityScore,timingScore);

  const dist=iqDistanceToOptimal(finalRack,startingRack,passedTilesByRound,sectionId);
  const tileIns=iqTileInsights(finalRack,startingRack,passedTilesByRound,sectionId);
  const{strengths,weaknesses,coachNote,tryNextTime}=iqFeedback(directionScore,tileStrengthScore,passQualityScore,timingScore,brokenPairsCount||0,sectionId);

  const dn=dayNum||getDayNum();
  const shareText=`RACKLE${isDaily?` #${dn}`:""}\n\nCharleston IQ: ${totalScore}\nLevel: ${level}\nTime: ${fT(totalTime||0)}\n\nTest your skills:\nplayrackle.com`;

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
function getWeekly(){const w=Math.floor((Date.now()-new Date(2026,0,1))/604800000);const ids=["2468","13579","369","cr","wd","aln","sp","2026","q"];return SECS.find(s=>s.id===ids[w%ids.length]);}

// ─── CLUB LEADERBOARD ─────────────────────────────────────────────────────────
const CLUBS={
  "1873":{name:"Apex Mahjong Club",emoji:"🀄",location:"Apex, NC"},
};

function getClubCode(){return ST.get("clubCode",null);}
function setClubCode(c){ST.set("clubCode",c);}
function getClubName(){return ST.get("clubName",null);}
function setClubName(n){ST.set("clubName",n);}

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
const DEFAULT_SETTINGS={tileSize:"normal",haptic:true,showTimer:true};

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
  return(
    <div style={{borderRadius:20,overflow:"hidden",background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"28px 20px 24px",textAlign:"center",boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,fontWeight:700,marginBottom:16}}>
        {isDaily?`DAILY RACKLE · #${dayNum}`:"PRACTICE · CHARLESTON IQ"}
      </div>
      {/* CHARLESTON IQ label + score */}
      <div style={{fontSize:9,color:C.gilt,letterSpacing:3,fontWeight:700,marginBottom:8}}>CHARLESTON IQ</div>
      <div style={{fontFamily:F.d,fontSize:64,fontWeight:900,color:C.gilt,lineHeight:1,letterSpacing:-2,
        textShadow:`0 2px 12px rgba(176,138,53,0.4)`,marginBottom:4}}>{iq.totalScore}</div>
      {/* gold gilt rule */}
      <div style={{width:48,height:1.5,background:`linear-gradient(90deg,transparent,${C.gilt},transparent)`,margin:"12px auto 14px"}}/>
      {/* level */}
      <div style={{fontFamily:F.d,fontSize:21,fontWeight:900,color:"#fff",letterSpacing:-0.3,marginBottom:6}}>{iq.level}</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.5,marginBottom:16,maxWidth:240,marginLeft:"auto",marginRight:"auto"}}>{iq.levelExplanation}</div>
      {/* stat columns */}
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
};
function ShareButton({text,label,small,variant="goldpill"}){
  const openSMS=()=>{window.open(`sms:?&body=${encodeURIComponent(text)}`,"_self");};
  const v=SHARE_VARIANTS[variant]||SHARE_VARIANTS.red;
  return(
    <button onClick={openSMS} style={{width:"100%",padding:small?"11px 0":"13px 0",borderRadius:12,
      border:v.border||"none",background:v.bg,color:v.color,
      fontSize:small?13:14,fontFamily:F.d,fontWeight:600,
      cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,
      letterSpacing:0.1,boxShadow:`0 3px 12px ${v.shadow}`,
      transition:"opacity 0.15s"}}>
      <span style={{fontSize:small?14:16}}>📲</span>
      <span>{label||"Share with your Mahj group"}</span>
    </button>
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
function DailyIQScorecard({iq,hand,passLog,dayNum,section,onHome,onPractice}){
  const [passOpen,setPassOpen]=useState(false);
  if(!iq)return null;
  const shareText=iq.shareText||`RACKLE #${dayNum}\n\nCharleston IQ: ${iq.totalScore}\nLevel: ${iq.level}\nTime: ${fT(iq.totalTime||0)}\n\nplayrackle.com`;
  return(
    <div>
      <div style={{marginBottom:10}}><ShareButton text={shareText} small/></div>
      <div style={{marginBottom:10}}><IQHero iq={iq} isDaily dayNum={dayNum} section={section} totalTime={iq.totalTime||0}/></div>
      {hand&&hand.length>0&&<div style={{...S.card,marginBottom:8}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>FINAL RACK</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Ti key={i} t={t}/>)}</div>
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
      {/* COACHING TIP */}
      {iq.tryNextTime&&<div style={{background:C.gold+"08",border:`1px solid ${C.gold}25`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:16,flexShrink:0}}>💡</span>
        <div>
          <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:4}}>TRY NEXT TIME</div>
          <p style={{fontSize:12,color:C.ink,margin:0,lineHeight:1.6,fontStyle:"italic"}}>{iq.tryNextTime}</p>
        </div>
      </div>}

      {/* PRACTICE MODE CTA */}
      <button onClick={onPractice} style={{width:"100%",borderRadius:12,background:`linear-gradient(135deg,${C.cinn}08,${C.cinn}04)`,border:`1px solid ${C.cinn}20`,cursor:"pointer",display:"flex",alignItems:"center",gap:12,padding:"14px 14px",marginBottom:8,textAlign:"left"}}>
        <div style={{width:38,height:38,borderRadius:10,background:`${C.cinn}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🀄</div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.ink,lineHeight:1.2}}>Keep Practising</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.4}}>Unlimited hands — sharpen what you just learned</div>
        </div>
        <span style={{fontSize:16,color:C.cinn,fontWeight:700,flexShrink:0}}>›</span>
      </button>

      <div style={{...S.card,marginBottom:10}}>
        <div style={{fontFamily:"monospace",fontSize:10,color:C.ink,lineHeight:1.8,whiteSpace:"pre",background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center"}}>{shareText}</div>
        <ShareButton text={shareText}/>
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

        {/* To Work On */}
        {iq.weaknesses&&iq.weaknesses.length>0&&<div style={{background:C.parch,border:`1px solid ${C.amberB}20`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.amberB,letterSpacing:2,fontWeight:700,marginBottom:8}}>TO WORK ON</div>
          {iq.weaknesses.map((w,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:i<iq.weaknesses.length-1?6:0}}>
              <span style={{fontSize:12,color:C.amberB,fontWeight:900,flexShrink:0,marginTop:0}}>›</span>
              <span style={{fontSize:12,color:C.ink,lineHeight:1.5}}>{w}</span>
            </div>
          ))}
        </div>}

        {/* Coach Note */}
        <div style={{background:"#FEFDF7",border:`1px solid ${C.gold}30`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:6}}>COACH NOTE</div>
          <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"0 0 10px"}}>{iq.coachNote}</p>
          {iq.tryNextTime&&<><div style={{height:1,background:C.bdr,marginBottom:8}}/>
          <div style={{fontSize:9,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>TRY NEXT TIME</div>
          <p style={{fontSize:11,color:C.mut,lineHeight:1.6,margin:0,fontStyle:"italic"}}>{iq.tryNextTime}</p></>}
        </div>

        {/* Timing */}
        <div style={{background:C.parch,border:`1px solid ${C.bdr}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:4}}>TIMING</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:C.ink}}>{iq.timingInsight}</span>
            <span style={{fontFamily:F.d,fontSize:18,fontWeight:800,color:C.jade}}>{iq.timingScore}<span style={{fontSize:10,color:C.mut,fontWeight:400}}>/10</span></span>
          </div>
        </div>

        {/* Share */}
        <div style={{...S.card,marginBottom:8}}>
          <div style={{fontFamily:"monospace",fontSize:10,color:C.ink,lineHeight:1.8,whiteSpace:"pre",background:C.bg2,borderRadius:8,padding:"10px 12px",marginBottom:10,textAlign:"center"}}>{iq.shareText}</div>
          <ShareButton text={iq.shareText}/>
        </div>
      </div>}

      {/* TAB 1 — PASSES */}
      {tab===1&&<div className="rk-in">
        {iq.passInsights&&iq.passInsights.length>0?iq.passInsights.map((p,i)=>{
          const qBg={strong:C.sage,weak:"#FDF0E8",mixed:C.amber,neutral:"#fff"};
          return(
            <div key={i} style={{...S.card,background:qBg[p.quality]||"#fff",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:10,color:C.mut,fontWeight:700,letterSpacing:1}}>{(p.roundName||"Pass").toUpperCase()}</span>
                <QualityPip quality={p.quality}/>
              </div>
              {p.passedTiles&&p.passedTiles.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>
                {p.passedTiles.map((t,j)=><Ti key={j} t={t}/>)}
              </div>}
              <p style={{fontSize:12,color:C.ink,margin:0,lineHeight:1.5}}>{p.insight}</p>
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
        {/* Deal Again shortcut */}
        <button onClick={onDealAgain} style={{...S.greenBtn,width:"100%",marginBottom:10,fontSize:13,letterSpacing:0.3,fontFamily:F.b,fontWeight:700}}>🀄 Deal Again</button>
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
        <button onClick={onDealAgain} style={{...S.greenBtn,flex:1}}>Deal Again</button>
      </div>
    </div>
  );
}

// IQScorecard router — daily gets simplified, practice gets tabbed
function IQScorecard({iq,hand,passLog,isDaily,dayNum,section,chosenSec,allSections,onHome,onDealAgain,onPractice}){
  if(isDaily)return <DailyIQScorecard iq={iq} hand={hand} passLog={passLog} dayNum={dayNum} section={section} onHome={onHome} onPractice={onPractice}/>;
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
      <DailyIQScorecard iq={res.iq} hand={res.finalRack||[]} passLog={res.passLog||[]} dayNum={dayNum} section={res.section} onHome={home} onPractice={onPractice}/>
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
        <div style={{fontFamily:F.d,fontSize:10,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>Rack & Roll.</div>
      </div>
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

// ─── CLUB LEADERBOARD ENTRY — collapsible dropdown ────────────────────────────
function ClubCodeEntry({setScreen}){
  const [open,setOpen]=useState(false);
  const [code,setCode]=useState("");
  const [err,setErr]=useState("");
  const savedCode=getClubCode();
  const savedClub=savedCode?CLUBS[savedCode]:null;

  const join=()=>{
    const trimmed=code.trim();
    if(!trimmed){setErr("Enter a 4-digit club code.");return;}
    if(!CLUBS[trimmed]){setErr("Code not recognised. Check with your club organiser.");return;}
    setClubCode(trimmed);setErr("");setCode("");
    setScreen("leaderboard");
  };

  const addClubEmail="mailto:hello@playrackle.com?subject=Add%20my%20club%20to%20Rackle&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20";

  return(
    <div style={{marginBottom:8}}>
      {/* Collapsed trigger */}
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderRadius:open?"12px 12px 0 0":12,background:C.jade+"06",border:`1px solid ${C.jade+"25"}`,cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{savedClub?savedClub.emoji:"🏆"}</span>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.ink,fontFamily:F.d}}>{savedClub?savedClub.name:"Your Club Leaderboard"}</div>
            <div style={{fontSize:10,color:C.jade,opacity:0.8}}>{savedClub?"View today's standings":"Play with your Mahj club"}</div>
          </div>
        </div>
        <span style={{fontSize:11,color:C.jade,opacity:0.7}}>{open?"▴":"▾"}</span>
      </button>

      {open&&<div className="rk-in" style={{background:"#fff",border:`1px solid ${C.jade+"25"}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"14px 16px"}}>
        {savedClub?(
          <button onClick={()=>setScreen("leaderboard")} style={{width:"100%",padding:"11px 0",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:13,fontFamily:F.d,fontWeight:700,cursor:"pointer",marginBottom:10}}>
            View {savedClub.name} Leaderboard →
          </button>
        ):(
          <>
            <p style={{fontSize:11,color:C.mut,margin:"0 0 10px",lineHeight:1.55,textAlign:"center"}}>Enter your club's 4-digit code to see today's leaderboard.</p>
            {/* Centred compact input row */}
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
        {/* Add your club link */}
        <div style={{textAlign:"center",paddingTop:savedClub?0:4,borderTop:savedClub?`1px solid ${C.bdr}`:"none",marginTop:savedClub?10:0}}>
          <a href={addClubEmail} style={{fontSize:11,color:C.mut,textDecoration:"none",opacity:0.7}}>
            + Add your club to Rackle
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
  const [showNameForm,setShowNameForm]=useState(false);

  const iq=dRes?.iq;
  const myName=getClubName();

  // Load entries on mount and check if already submitted
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

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home}/>

      {/* CLUB HERO */}
      <div style={{borderRadius:20,overflow:"hidden",marginBottom:12,background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"24px 20px 20px",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:3,fontWeight:700,marginBottom:10}}>DAILY LEADERBOARD · #{dn}</div>
        <div style={{fontSize:32,marginBottom:6}}>{club.emoji}</div>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:900,color:"#fff",letterSpacing:-0.5,marginBottom:4}}>{club.name}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:16}}>{club.location}</div>
        <div style={{width:"100%",height:0.5,background:"rgba(255,255,255,0.08)",marginBottom:14}}/>
        {loading?(
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Loading today's scores…</div>
        ):(
          <div style={{display:"flex",justifyContent:"center",gap:24}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.gilt}}>{entries.length}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontWeight:700,marginTop:2}}>PLAYERS TODAY</div>
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

      {/* SUBMIT YOUR SCORE */}
      {iq&&!submitted&&!showNameForm&&<button onClick={()=>setShowNameForm(true)} style={{width:"100%",padding:"13px 16px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",gap:10,textAlign:"left",boxShadow:`0 4px 16px rgba(27,125,78,0.3)`}}>
        <span style={{fontSize:20,flexShrink:0}}>📊</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,lineHeight:1,marginBottom:2}}>Add your score to the board</div>
          <div style={{fontSize:11,opacity:0.8}}>IQ {iq.totalScore} · {iq.level}</div>
        </div>
        <span style={{fontSize:14,fontWeight:700}}>›</span>
      </button>}

      {iq&&!submitted&&showNameForm&&<div style={{...S.card,marginBottom:10}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>YOUR NAME ON THE BOARD</div>
        <div style={{background:C.sage,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:C.sageB}}>Your score today</div>
          <div style={{fontSize:11,color:C.mut,marginTop:2}}>IQ {iq.totalScore} · {iq.level} · ⏱ {fT(dRes?.time||0)}{streak>1?` · 🔥 ${streak}-day streak`:""}</div>
        </div>
        <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Your name or nickname" maxLength={20} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${nameErr?C.cinn:C.bdr}`,fontSize:13,fontFamily:F.b,color:C.ink,outline:"none",marginBottom:6,boxSizing:"border-box"}}/>
        {nameErr&&<div style={{fontSize:11,color:C.cinn,marginBottom:6}}>{nameErr}</div>}
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setShowNameForm(false)} style={{...S.oBtn,flex:1,fontSize:12}}>Cancel</button>
          <button onClick={submit} disabled={submitting} style={{...S.greenBtn,flex:2,fontSize:13,letterSpacing:0.2,fontFamily:F.b,fontWeight:700,opacity:submitting?0.7:1}}>
            {submitting?"Posting…":"Submit score"}
          </button>
        </div>
      </div>}

      {submitted&&myEntry&&<div style={{...S.card,marginBottom:10,background:C.sage,borderColor:C.sageB+"20"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>✓</span>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:C.sageB,fontFamily:F.d}}>Score posted!</div>
            <div style={{fontSize:11,color:C.mut,marginTop:1}}>You're #{myRank} on the board today · IQ {myEntry.iqScore}</div>
          </div>
        </div>
      </div>}

      {!iq&&!submitted&&<div style={{...S.card,marginBottom:10,background:C.amber,borderColor:C.amberB+"20"}}>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.6}}>🎯 <strong>Complete today's Daily Rackle</strong> to add your score to the leaderboard.</div>
      </div>}

      {/* LEADERBOARD TABLE */}
      {loading?(
        <div style={{...S.card,textAlign:"center",padding:"28px 14px",marginBottom:8}}>
          <div style={{fontSize:24,marginBottom:8,opacity:0.4}}>⏳</div>
          <div style={{fontSize:12,color:C.mut}}>Loading scores…</div>
        </div>
      ):entries.length>0?(
        <div style={{...S.card,padding:0,overflow:"hidden",marginBottom:8}}>
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
                <div style={{fontSize:13,textAlign:"left"}}>{medal||<span style={{fontFamily:F.d,fontSize:12,fontWeight:700,color:C.mut}}>{i+1}</span>}</div>
                <div style={{fontFamily:F.d,fontSize:13,fontWeight:isMe?800:600,color:isMe?C.jade:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}{isMe?" (you)":""}</div>
                <div style={{textAlign:"center"}}>
                  <span style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn}}>{e.iqScore}</span>
                </div>
                <div style={{textAlign:"center",fontSize:11,color:C.mut,fontFamily:F.d,fontWeight:600}}>{e.time?fT(e.time):"—"}</div>
                <div style={{textAlign:"center",fontSize:11,color:C.cinn}}>{e.streak>1?e.streak:""}</div>
              </div>
            );
          })}
        </div>
      ):(
        <div style={{...S.card,textAlign:"center",padding:"32px 14px",marginBottom:8}}>
          <div style={{fontSize:28,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.ink,marginBottom:4}}>No scores yet today</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.6}}>Be the first to post your score. Complete today's Daily Rackle and add your name above.</div>
        </div>
      )}

      <div style={{fontSize:10,color:C.mut,textAlign:"center",lineHeight:1.5,opacity:0.7,marginBottom:12}}>Leaderboard resets daily at midnight · Code: {code}</div>
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={home} style={{...S.oBtn,flex:1}}>← Home</button>
        <LeaveClubButton onLeave={home}/>
      </div>
    </div>
  );
}

// ─── STATS PILL — collapsed by default, tap to expand ────────────────────────
function Statspill({streak,rounds,bestIQ,streakBadge}){
  const [open,setOpen]=useState(false);
  const hasAny=streak>0||rounds>0||bestIQ;

  // Collapsed pill — shows most prominent stat
  const icon=streak>0?(streakBadge?streakBadge.badge:"🔥"):bestIQ?"⭐":"🎲";
  const value=streak>0?streak:bestIQ?bestIQ.score:rounds;
  const label=streak>0?"streak":bestIQ?"best IQ":"rounds";
  const color=streak>0?C.cinn:bestIQ?C.gold:C.mut;
  const bg=streak>0?C.cinn+"08":bestIQ?C.gold+"08":C.bg2;
  const border=streak>0?`1px solid ${C.cinn}20`:bestIQ?`1px solid ${C.gold}20`:`1px solid ${C.bdr}`;

  if(!hasAny)return(
    <div style={{display:"flex",alignItems:"center",gap:5,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 12px"}}>
      <span style={{fontSize:12}}>🔥</span>
      <span style={{fontSize:11,color:C.mut,fontWeight:600}}>Play daily to build your streak</span>
    </div>
  );

  return(
    <div>
      {/* Collapsed pill */}
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:5,background:bg,border,borderRadius:20,padding:"4px 12px",cursor:"pointer"}}>
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
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.cinn,lineHeight:1}}>{streak}-day streak</div>
            {streakBadge&&<div style={{fontSize:10,color:C.mut,marginTop:2}}>{streakBadge.title}</div>}
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

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({streak,rounds,dDone,dRes,showHelp,setShowHelp,go,showStats,showSettings,showTutorial,showCardGuide,settings,showScorecard,setScreen}){
  const dn=getDayNum(),wk=getWeekly(),yd=getYesterday();
  const streakBadge=getStreakBadge(streak);
  const iq=dRes?.iq;
  const bestIQ=getBestIQ();
  const nudge=shouldShowNudge(dDone);
  const [nudgeDismissed,setNudgeDismissed]=useState(ST.get("nudgeDismissed",null)===getDailySeed());
  const dismissNudge=()=>{ST.set("nudgeDismissed",getDailySeed());setNudgeDismissed(true);};

  // Build share text fresh every render
  const shareText=iq
    ?`RACKLE #${dn}\n\nCharleston IQ: ${iq.totalScore}\nLevel: ${iq.level}\nTime: ${fT(iq.totalTime||0)}\n\nTest your skills:\nplayrackle.com`
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
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:0}}>
        <Statspill streak={streak} rounds={rounds} bestIQ={bestIQ} streakBadge={streakBadge}/>
        <button onClick={showSettings} aria-label="Open settings" style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:20,padding:"4px 14px",cursor:"pointer",fontSize:12,fontWeight:600,color:C.mut,fontFamily:F.b}}>Settings</button>
      </div>

      {/* HERO */}
      <div style={{textAlign:"center",padding:"18px 0 10px"}}>
        <div className="rk-float" style={{fontSize:40,marginBottom:10,lineHeight:1}}>🀄</div>
        <h1 style={{fontFamily:F.d,fontSize:48,color:C.ink,margin:"0 0 6px",fontWeight:900,letterSpacing:-2.5,lineHeight:1}}>Rackle</h1>
        <p style={{fontFamily:F.d,fontSize:16,color:C.jade,margin:"0 0 10px",fontWeight:600,fontStyle:"italic",letterSpacing:0.3}}>Rack & Roll.</p>
        <p style={{fontSize:11,color:C.mut,margin:"0 0 2px",lineHeight:1.6}}>Rate your Charleston. Track your improvement.</p>
        <p style={{fontSize:11,color:C.mut,margin:0,lineHeight:1.6,fontWeight:600}}>Share with your Mahj club. 🀄</p>
      </div>

      {streak>0&&streakBadge&&<div style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8,marginTop:8,background:C.gold+"06",borderColor:C.gold+"25"}}>
        <span style={{fontSize:24}}>{streakBadge.badge}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:C.ink,fontFamily:F.d}}>{streakBadge.title}</div>
          <div style={{fontSize:11,color:C.mut,marginTop:1}}>{streak}-day streak — {streakBadge.desc}</div>
        </div>
      </div>}

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
                  <div style={{fontSize:11,color:C.sageB,lineHeight:1.3}}>Score breakdown · Pass breakdown</div>
                </div>
                <span style={{fontSize:14,color:C.sageB,fontWeight:700,flexShrink:0}}>›</span>
              </button>
              <p style={{fontSize:10,color:C.mut,textAlign:"center",margin:0,lineHeight:1.5,fontStyle:"italic",opacity:0.8}}>No spoilers — it's the same hand for everyone.</p>
            </div>
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
        <div style={{flex:1,height:1,background:C.bdr}}/><span style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>LEARN & EXPLORE</span><div style={{flex:1,height:1,background:C.bdr}}/>
      </div>

      <button onClick={()=>setShowHelp(!showHelp)} aria-expanded={showHelp} style={{width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:8,borderRadius:16,padding:"18px 16px",textAlign:"left",background:C.gold+"06",border:`1px solid ${showHelp?C.gold+"40":C.gold+"25"}`}}>
        <div style={{width:44,height:44,borderRadius:13,background:C.gold+"10",border:`1px solid ${C.gold}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📖</div>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:5}}>LEARN</div>
          <div style={{fontFamily:F.d,fontSize:16,fontWeight:800,color:C.ink,marginBottom:5}}>How to Play</div>
          <div style={{fontSize:12,color:C.mut}}>Charleston rules & all 9 sections explained.</div>
        </div>
        <span aria-hidden="true" style={{fontSize:14,color:C.mut,fontWeight:600}}>{showHelp?"▾":"›"}</span>
      </button>

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

      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={showTutorial} style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${C.jade}25`,background:C.jade+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>🀄</span>
          <div style={{fontSize:10,color:C.jade,letterSpacing:1.5,fontWeight:700}}>WALKTHROUGH</div>
          <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2}}>Interactive Tutorial</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.4}}>Learn the Charleston step by step</div>
        </button>
        <button onClick={showCardGuide} style={{flex:1,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"14px 10px",borderRadius:16,border:`1px solid ${C.gold}25`,background:C.gold+"06",textAlign:"center"}}>
          <span style={{fontSize:22}}>📋</span>
          <div style={{fontSize:10,color:C.gold,letterSpacing:1.5,fontWeight:700}}>2026 NMJL CARD</div>
          <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2}}>Card Guide</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.4}}>Hold & pass tips for all 9 sections</div>
        </button>
      </div>

      <EmailSignup/>
      <ClubCodeEntry onJoin={()=>setScreen("leaderboard")} setScreen={setScreen}/>

      <div style={{textAlign:"center",padding:"22px 0 8px",marginTop:8}}>
        <div aria-hidden="true" style={{width:40,height:1,background:C.bdr,margin:"0 auto 16px"}}/>
        <div style={{fontSize:12,color:C.jade,fontFamily:F.d,fontStyle:"italic"}}>Rack & Roll 🀄</div>
        <div style={{fontSize:11,color:C.mut,marginTop:8,lineHeight:1.6}}>Made for the American Mahjong community</div>
        <div style={{marginTop:12}}><a href="https://playrackle.com" target="_blank" rel="noopener noreferrer" style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,letterSpacing:-0.3,textDecoration:"none"}}>Rackle</a></div>
        <div style={{marginTop:10,display:"flex",justifyContent:"center",alignItems:"center",gap:8}}>
          <a href="https://instagram.com/playrackle" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.ink,textDecoration:"none",fontWeight:600,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 14px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5.5" stroke={C.ink} strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="4.5" stroke={C.ink} strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1" fill={C.ink}/></svg>
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

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats({home,onShowScorecard,dRes}){
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
          <button onClick={onShowScorecard} style={{width:"100%",padding:"12px 16px",borderRadius:12,background:C.sage,border:`1px solid ${C.sageB}25`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:"#1A3D28",lineHeight:1,marginBottom:2}}>View Full Scorecard</div><div style={{fontSize:11,color:C.sageB}}>Coach notes · Pass breakdown · Tile analysis</div></div>
            <span style={{background:"#2E6B48",color:"#fff",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700}}>›</span>
          </button>
        </div>
      </div>}
      {!stats?(
        <div style={{textAlign:"center",padding:"40px 0"}}><div aria-hidden="true" style={{fontSize:32}}>📊</div><div style={{fontSize:14,color:C.mut,marginTop:8}}>Play a few rounds first!</div></div>
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
    </div>
  );
}

// ─── GAME ─────────────────────────────────────────────────────────────────────
function ReadyOverlay({mode,dayNum,onReady,onHome}){
  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50,padding:"0 20px",background:"rgba(250,247,241,0.75)",backdropFilter:"blur(6px)"}}>
      <div className="rk-in" style={{width:"100%",maxWidth:400,background:"#fff",borderRadius:24,border:`1.5px solid ${C.bdr}`,boxShadow:"0 20px 60px rgba(0,0,0,0.12)",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#0F2016,#1B3A28)",padding:"24px 24px 20px",textAlign:"center"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:3,fontWeight:700,marginBottom:10}}>{mode==="daily"?`DAILY RACKLE · #${dayNum}`:"PRACTICE MODE"}</div>
          <div style={{fontFamily:F.d,fontSize:30,fontWeight:900,color:"#fff",letterSpacing:-0.5,lineHeight:1,marginBottom:4}}>Ready to Rackle?</div>
          <div style={{width:32,height:1.5,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"12px auto 12px"}}/>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.6}}>{mode==="daily"?"Same deal for every player. One shot.":"Unlimited hands. Build your instincts."}</div>
        </div>
        <div style={{padding:"16px 20px 20px",display:"flex",gap:10,background:C.bg}}>
          <button onClick={onHome} style={{flex:1,padding:"13px 0",borderRadius:12,border:`1px solid ${C.bdr}`,background:"#fff",color:C.mut,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.b}}>← Home</button>
          <button onClick={onReady} style={{flex:2,padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:0.3,cursor:"pointer",boxShadow:`0 4px 14px rgba(27,125,78,0.35)`}}>Yes! Let's Rack & Roll →</button>
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
      finalRack:hand,passLog,
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
            <div style={{textAlign:"center"}}><div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div><div style={{fontFamily:F.d,fontSize:9,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>Rack & Roll.</div></div>
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
          <button onClick={confirm} disabled={!chosenSec} style={{...S.greenBtn,width:"100%",marginTop:4,opacity:chosenSec?1:0.3}}>Rate My Hand →</button>
        </>
      )}

      {phase==="pass"&&(
        <>
          {showLeave&&<LeaveModal onStay={()=>setShowLeave(false)} onLeave={()=>{setShowLeave(false);home();}}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <button onClick={()=>setShowLeave(true)} style={S.back}>← Back</button>
            <div style={{textAlign:"center"}}><div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div><div style={{fontFamily:F.d,fontSize:9,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>Rack & Roll.</div></div>
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
function FirstPayoff({result,onPractice,onHome,dayNum}){
  const iq=result.iq;
  return(
    <div style={S.pg} className="rk-pg">
      <div style={{textAlign:"center",paddingTop:16,marginBottom:16}}>
        <div className="rk-pop" style={{fontSize:48,marginBottom:8}}>🎉</div>
        <h2 style={{fontFamily:F.d,fontSize:22,color:C.ink,margin:"0 0 4px",fontWeight:800}}>Nice Start!</h2>
        <p style={{fontSize:13,color:C.mut,margin:0}}>You just finished your first Rackle Daily.</p>
      </div>
      {iq&&<div style={{marginBottom:12}}><IQHero iq={iq} isDaily dayNum={dayNum} section={result.section} totalTime={iq.totalTime||0}/></div>}
      <div style={{...S.card,background:"linear-gradient(145deg,#FFFFF8,#F8F4EB)",borderColor:C.gold+"30",marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:6}}>What happens next?</div>
        <div style={{fontSize:12,color:C.mut,lineHeight:1.8}}>
          <div>🔥 <strong>Come back tomorrow</strong> — new deal every day</div>
          <div>📊 <strong>Track your streak</strong> — daily consistency builds skill</div>
          <div>🀄 <strong>Practice Mode</strong> — unlimited hands to sharpen strategy</div>
          <div>📋 <strong>Share your IQ</strong> — challenge your mahj group</div>
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

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
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
  const isFirstDaily=!ST.get("hadFirstDaily",false);

  const onDone=(result)=>{
    setRounds(r=>{const n=r+1;ST.set("rnd",n);return n;});
    const today=getDailySeed();
    if(ST.get("ld",null)!==today){
      const y=new Date();y.setDate(y.getDate()-1);
      const yS=y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate();
      const ns=ST.get("ld",null)===yS?streak+1:1;
      setStreak(ns);ST.set("str",ns);ST.set("ld",today);
      const badge=getStreakBadge(ns);const prevBadge=getStreakBadge(ns-1);
      if(badge&&(!prevBadge||badge.days>prevBadge.days))setBadgeToast(badge);
    }
    if(mode==="daily"){
      setDDone(true);ST.set("dd",today);setDRes(result);ST.set("dres",result);
      if(isFirstDaily){ST.set("hadFirstDaily",true);setFirstPayoffRes(result);setShowFirstPayoff(true);return;}
    }
    addHist(result);
  };

  const go=(m)=>{setMode(m);setScreen("play");};

  return(
    <AppShell>
      {badgeToast&&<StreakBadgeToast badge={badgeToast} onDismiss={()=>setBadgeToast(null)}/>}
      {showFirstPayoff&&firstPayoffRes
        ? <FirstPayoff result={firstPayoffRes} dayNum={getDayNum()} onHome={()=>{addHist(firstPayoffRes);setShowFirstPayoff(false);setScreen("home");}} onPractice={()=>{addHist(firstPayoffRes);setShowFirstPayoff(false);go("free");}}/>
        : <>
            {screen==="home"&&<Home {...{streak,rounds,dDone,dRes,showHelp,setShowHelp,go,settings,setScreen}} showStats={()=>setScreen("stats")} showSettings={()=>setScreen("settings")} showTutorial={()=>setScreen("tutorial")} showCardGuide={()=>setScreen("cardguide")} showScorecard={()=>setScreen("scorecard")}/>}
            {screen==="tutorial"&&<Tutorial onDone={()=>{ST.set("tutDone",true);setScreen("home");}} onBack={()=>setScreen("home")}/>}
            {screen==="cardguide"&&<CardGuideScreen home={()=>setScreen("home")}/>}
            {screen==="play"&&<Game mode={mode} home={()=>setScreen("home")} onDone={onDone} settings={settings}/>}
            {screen==="stats"&&<Stats home={()=>setScreen("home")} onShowScorecard={()=>setScreen("scorecard")} dRes={dRes}/>}
            {screen==="settings"&&<Settings home={()=>setScreen("home")} settings={settings} setSettings={setSettings} showTutorial={()=>setScreen("tutorial")}/>}
            {screen==="scorecard"&&<ScorecardScreen res={dRes} home={()=>setScreen("home")} dayNum={getDayNum()} onPractice={()=>go("free")}/>}
            {screen==="leaderboard"&&<LeaderboardScreen home={()=>setScreen("home")} dRes={dRes} streak={streak}/>}
          </>
      }
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
