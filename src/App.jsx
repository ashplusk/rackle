import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect } from "react";

/*
 * RACKLE — Daily Charleston + Free Play
 * Rack & Roll. 2026 NMJL Edition.
 * Daily: same deal for everyone, one attempt, shareable
 * Free: unlimited practice rounds
 * ROLLOR: R(3) O(3) L(blind 0-3) then optional LOR + courtesy
 */

// ── TILES ──────────────────────────────────────

const SUITS=["bam","crak","dot"];
const SN={bam:"Bam",crak:"Crk",dot:"Dot"};
const SCLR={bam:"#1B7D4E",crak:"#B83232",dot:"#2460A8"};

function buildDeck(){
  const d=[];
  SUITS.forEach(s=>{for(let n=1;n<=9;n++)for(let i=0;i<4;i++)d.push({t:"s",s,n});});
  ["N","E","W","S"].forEach(v=>{for(let i=0;i<4;i++)d.push({t:"w",v});});
  ["Red","Grn","Soap"].forEach(v=>{for(let i=0;i<4;i++)d.push({t:"d",v});});
  for(let i=0;i<8;i++)d.push({t:"f"});
  for(let i=0;i<8;i++)d.push({t:"j"});
  return d;
}

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function seededShuffle(a,seed){const b=[...a];let s=seed;for(let i=b.length-1;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}

function sortVal(t){if(t.t==="s")return{bam:0,crak:1,dot:2}[t.s]*100+t.n;if(t.t==="f")return 1000;if(t.t==="w")return 2000+"NEWS".indexOf(t.v);if(t.t==="d")return 3000+["Red","Grn","Soap"].indexOf(t.v);return 4000;}
function sortHand(t){return[...t].sort((a,b)=>sortVal(a)-sortVal(b));}

function tLabel(t){if(t.t==="j")return"🃏";if(t.t==="f")return"🌸";if(t.t==="w")return t.v;if(t.t==="d")return t.v==="Red"?"中":t.v==="Grn"?"發":"白";return`${t.n}`;}
function tSub(t){if(t.t==="j")return"Joker";if(t.t==="f")return"Flower";if(t.t==="w")return"Wind";if(t.t==="d")return t.v==="Soap"?"Soap":t.v==="Red"?"Red":"Green";return SN[t.s];}
function tColor(t){if(t.t==="j")return"#B08A35";if(t.t==="f")return"#B54E7A";if(t.t==="w")return"#5C5247";if(t.t==="d")return t.v==="Red"?"#B83232":t.v==="Grn"?"#1B7D4E":"#6B6560";return SCLR[t.s];}
function isJoker(t){return t.t==="j";}

function MTile({t,sel,isNew,onClick,dim}){
  const c=tColor(t);
  return(<div onClick={onClick} role={onClick?"button":undefined} style={{
    width:37,height:50,borderRadius:7,cursor:onClick?"pointer":"default",userSelect:"none",
    background:sel?c+"14":isNew?"#FFFBE7":"linear-gradient(145deg,#fff,#F7F4EE)",
    border:`2px solid ${sel?c:isNew?"#B08A35":"#D5CFC5"}`,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    padding:0,flexShrink:0,position:"relative",overflow:"hidden",
    boxShadow:sel?`0 4px 12px ${c}28`:"0 1px 4px rgba(0,0,0,0.06)",
    transform:sel?"translateY(-4px) scale(1.05)":"none",
    transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",opacity:dim?0.35:1,
  }}>
    <span style={{fontSize:15,fontWeight:800,color:c,lineHeight:1,fontFamily:F.d}}>{tLabel(t)}</span>
    <span style={{fontSize:7,color:c,opacity:0.5,fontWeight:700,marginTop:1}}>{tSub(t)}</span>
    {sel&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c}}/>}
  </div>);
}

// ── SECTIONS ───────────────────────────────────

const SECS=[
  {id:"2026",name:"2026",color:"#B54E7A",icon:"📅",desc:"Year tiles — 2s, Soap, 6s",hold:"2s, 6s, Soap, Flowers",pass:"1s, 9s, odds, Winds",combos:"2+0+2+6 across suits.",hands:6,diff:3,
    check:h=>{const s=h.filter(x=>x.t==="s");const on=s.filter(x=>[2,6].includes(x.n)).length;const off=s.filter(x=>![2,6].includes(x.n)).length;const soap=h.filter(x=>x.t==="d"&&x.v==="Soap").length;return Math.max(0,Math.min(s.length>0?(on+soap)/(on+off+soap+0.1)*0.5-0.1:0,1));}},
  {id:"2468",name:"2468",color:"#B83232",icon:"🔴",desc:"Even numbers (2, 4, 6, 8)",hold:"2s, 4s, 6s, 8s, Flowers, Jokers",pass:"All odds, Winds",combos:"2+6 strongest pair.",hands:10,diff:2,
    check:h=>{const s=h.filter(x=>x.t==="s");const ev=s.filter(x=>x.n%2===0).length;const od=s.filter(x=>x.n%2===1).length;return Math.max(0,Math.min(s.length>0?ev/(ev+od+0.1)*0.55-0.15:0,1));}},
  {id:"369",name:"369",color:"#B84A72",icon:"💗",desc:"Multiples of 3 (3, 6, 9)",hold:"3s, 6s, 9s, Flowers",pass:"Non-multiples of 3, Winds",combos:"6 is the linchpin.",hands:8,diff:3,
    check:h=>{const s=h.filter(x=>x.t==="s");const m=s.filter(x=>x.n%3===0).length;const nm=s.filter(x=>x.n%3!==0).length;return Math.max(0,Math.min(s.length>0?m/(m+nm+0.1)*0.55-0.15:0,1));}},
  {id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",desc:"Odd numbers (1, 3, 5, 7, 9)",hold:"Odds, Winds",pass:"All evens",combos:"5 is most versatile.",hands:9,diff:2,
    check:h=>{const s=h.filter(x=>x.t==="s");const od=s.filter(x=>x.n%2===1).length;const ev=s.filter(x=>x.n%2===0).length;return Math.max(0,Math.min(s.length>0?od/(od+ev+0.1)*0.55-0.15:0,1));}},
  {id:"cr",name:"Consec. Run",color:"#1B7D4E",icon:"🟢",desc:"Sequential tiles across suits",hold:"Consecutive numbers, Flowers",pass:"Isolated numbers, honors",combos:"Runs in 2+ suits.",hands:11,diff:3,
    check:h=>{const bs={};h.filter(x=>x.t==="s").forEach(x=>{if(!bs[x.s])bs[x.s]=new Set();bs[x.s].add(x.n);});let mr=0;Object.values(bs).forEach(s=>{const a=[...s].sort((a,b)=>a-b);let r=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)r++;else{mr=Math.max(mr,r);r=1;}}mr=Math.max(mr,r);});const hon=h.filter(x=>x.t==="w"||x.t==="d").length;return Math.max(0,Math.min((mr>=4?0.35:mr>=3?0.2:mr*0.04)-hon*0.04-0.1,1));}},
  {id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",desc:"Honor tiles",hold:"Winds, Dragons",pass:"Number tiles",combos:"Need 5+ honors.",hands:7,diff:4,
    check:h=>{const hon=h.filter(x=>x.t==="w"||x.t==="d").length;const su=h.filter(x=>x.t==="s").length;return Math.max(0,Math.min(hon>0?hon/(hon+su)*0.55-0.1:0,1));}},
  {id:"aln",name:"Like Numbers",color:"#2460A8",icon:"🔵",desc:"Same number, all suits",hold:"4+ of one number, Flowers, Jokers",pass:"Scattered numbers",combos:"Good fallback.",hands:6,diff:3,
    check:h=>{const c={};h.filter(x=>x.t==="s").forEach(x=>{c[x.n]=(c[x.n]||0)+1;});const v=Object.values(c);const mx=v.length?Math.max(...v):0;const tn=Object.keys(c).length;return Math.max(0,Math.min((mx>=4?0.3:mx*0.05)-Math.max(0,tn-2)*0.06-0.1,1));}},
  {id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",desc:"Five of a kind",hold:"Jokers, 3-4 of a tile",pass:"Scattered tiles",combos:"Requires 2+ Jokers.",hands:4,diff:5,
    check:h=>{const jk=h.filter(x=>x.t==="j").length;const c={};h.filter(x=>x.t==="s").forEach(x=>{const k=`${x.s}${x.n}`;c[k]=(c[k]||0)+1;});const v=Object.values(c);const mx=v.length?Math.max(...v):0;if(mx+jk>=5)return Math.min(0.4+jk*0.03,0.65);if(jk>=2&&mx>=3)return 0.25;return Math.max(0,(mx+jk)*0.03-0.15);}},
  {id:"sp",name:"Singles & Pairs",color:"#2E9485",icon:"🩵",desc:"Only singles and pairs",hold:"Pairs, Flowers",pass:"Triples+",combos:"All concealed.",hands:5,diff:2,
    check:h=>{const c={};h.forEach(x=>{const k=JSON.stringify(x);c[k]=(c[k]||0)+1;});const pr=Object.values(c).filter(v=>v===2).length;const tr=Object.values(c).filter(v=>v>=3).length;return Math.max(0,Math.min(pr*0.04-tr*0.15-0.05,1));}},
];

function evaluate(h){return SECS.map(s=>({...s,score:s.check(h)})).sort((a,b)=>b.score-a.score);}
function getAdvice(hand,cid){
  const ev=evaluate(hand);const ch=ev.find(s=>s.id===cid);const top=ev[0];
  const alts=ev.filter(s=>s.id!==cid&&s.score>0.03).slice(0,2);
  let v,e;
  if(!ch||ch.score<0.02){v="Not optimal";e="😬";}
  else if(ch.id===top.id||ch.score>=top.score*0.9){v="Strong choice";e="💪";}
  else if(ch.score>=top.score*0.6){v="Playable but risky";e="🤔";}
  else{v="Not optimal";e="😬";}
  const p=ch?(ch.score*100).toFixed(0):"0";
  const r=v==="Strong choice"?`${p}% fit. Your tiles are well-aligned for ${ch?.name}.`
    :v==="Playable but risky"?`${p}% fit — tiles also lean toward ${top.name} (${(top.score*100).toFixed(0)}%).`
    :`Only ${p}% fit. Tiles point toward ${top.name} (${(top.score*100).toFixed(0)}%).`;
  return{verdict:v,emoji:e,reason:r,alts,top,chosen:ch};
}

// ── STORAGE & DAILY ────────────────────────────

const mem={};
const ST={get(k,d){try{return JSON.parse(localStorage.getItem("rk8-"+k))||d;}catch{return mem[k]??d;}},set(k,v){try{localStorage.setItem("rk8-"+k,JSON.stringify(v));}catch{mem[k]=v;}}};
function getDailySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function getDayNum(){return Math.floor((new Date()-new Date(2026,3,25))/86400000)+1;}

const FC=[{dir:"Right",icon:"👉",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Left",icon:"👈",req:0,blind:true,max:3}];
const SC=[{dir:"Left",icon:"👈",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Right",icon:"👉",req:0,blind:true,max:3}];

// ── APP ────────────────────────────────────────

export default function Rackle(){
  const [screen,setScreen]=useState("home");
  const [mode,setMode]=useState("free"); // "daily" | "free"
  const [streak,setStreak]=useState(ST.get("str",0));
  const [rounds,setRounds]=useState(ST.get("rnd",0));
  const [dailyDone,setDailyDone]=useState(ST.get("dd",null)===getDailySeed());
  const [dailyResult,setDailyResult]=useState(ST.get("dres",null));
  const [showHelp,setShowHelp]=useState(false);

  const onDone=(result)=>{
    setRounds(r=>{const n=r+1;ST.set("rnd",n);return n;});
    const today=getDailySeed();
    if(ST.get("ld",null)!==today){
      const y=new Date();y.setDate(y.getDate()-1);
      const yS=y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate();
      const ns=ST.get("ld",null)===yS?streak+1:1;
      setStreak(ns);ST.set("str",ns);ST.set("ld",today);
    }
    if(mode==="daily"){setDailyDone(true);ST.set("dd",today);setDailyResult(result);ST.set("dres",result);}
  };

  const go=(m)=>{setMode(m);setScreen("play");};

  return(<div style={S.outer}><div style={S.app}><style>{CSS}</style>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800;9..144,900&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
    {screen==="home"&&<HomeScreen {...{streak,rounds,dailyDone,dailyResult,showHelp,setShowHelp}} go={go}/>}
    {screen==="play"&&<GameScreen mode={mode} home={()=>setScreen("home")} onDone={onDone}/>}
  </div></div>);
}

// ── HOME ───────────────────────────────────────

function HomeScreen({streak,rounds,dailyDone,dailyResult,showHelp,setShowHelp,go}){
  const [copied,setCopied]=useState(false);
  const dn=getDayNum();
  const shareTxt=dailyResult?`🀄 Rackle #${dn}\n${dailyResult.rating} ${dailyResult.emoji}\nSection: ${dailyResult.section}\nplayrackle.com`:"";
  const copy=()=>{navigator.clipboard?.writeText(shareTxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  return(<div style={S.pg}>
    {/* Hero */}
    <div style={{textAlign:"center",paddingTop:32,marginBottom:10}}>
      <div className="rk-float" style={{fontSize:44,marginBottom:10}}>🀄</div>
      <h1 style={{fontFamily:F.d,fontSize:46,color:C.ink,margin:0,fontWeight:900,letterSpacing:-2}}>Rackle</h1>
      <p style={{fontFamily:F.d,fontSize:22,color:C.jade,margin:"6px 0 0",fontWeight:600,fontStyle:"italic",letterSpacing:0.5}}>Rack & Roll.</p>
    </div>

    {/* Subtitle */}
    <div style={{textAlign:"center",marginBottom:18}}>
      <p style={{fontSize:14,color:C.ink,fontWeight:600,margin:"0 0 4px",lineHeight:1.5}}>The daily Charleston challenge.</p>
      <p style={{fontSize:13,color:C.mut,margin:0}}>For American Mahjong players who want to get better.</p>
    </div>

    {/* Value props — visually distinct from buttons */}
    <div style={{background:"linear-gradient(145deg, #F5F2EB, #EDE8DF)",borderRadius:16,padding:"16px 14px",marginBottom:16,border:`1px solid ${C.bdr}`}}>
      <div style={{display:"flex",gap:10}}>
        {[
          {icon:"🀄",label:"Daily challenge",sub:"New puzzle every day"},
          {icon:"📋",label:"Share your result",sub:"Screenshot & post"},
          {icon:"🔥",label:"Build streaks",sub:"Come back daily"},
        ].map((v,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:6}}>{v.icon}</div>
            <div style={{fontSize:11,fontFamily:F.d,fontWeight:700,color:C.ink,lineHeight:1.2}}>{v.label}</div>
            <div style={{fontSize:9,color:C.mut,marginTop:3,lineHeight:1.3}}>{v.sub}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Stats */}
    {(rounds>0||streak>0)&&<div style={{display:"flex",gap:6,marginBottom:12}}>
      {streak>0&&<SPill icon="🔥" val={streak} label="DAY STREAK" hl/>}
      <SPill icon="🎲" val={rounds} label="ROUNDS PLAYED"/>
    </div>}

    {/* ── Daily Rackle ── */}
    {!dailyDone?(
      <button onClick={()=>go("daily")} style={{
        width:"100%",padding:"22px 20px",borderRadius:18,border:"none",cursor:"pointer",marginBottom:10,
        background:"linear-gradient(135deg,#1B7D4E 0%,#156B42 50%,#0F5535 100%)",color:"#fff",
        display:"flex",alignItems:"center",gap:16,textAlign:"left",
        boxShadow:"0 8px 32px rgba(27,125,78,0.3), 0 2px 8px rgba(0,0,0,0.1)",
      }}>
        <div style={{width:52,height:52,borderRadius:15,background:"rgba(255,255,255,0.12)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,border:"1px solid rgba(255,255,255,0.15)"}}>📅</div>
        <div>
          <div style={{fontSize:11,opacity:0.75,letterSpacing:2,fontWeight:700,marginBottom:3}}>TODAY'S CHALLENGE</div>
          <div style={{fontFamily:F.d,fontSize:22,fontWeight:800}}>Daily Rackle #{dn}</div>
          <div style={{fontSize:12,opacity:0.85,marginTop:3}}>Same deal for every player. One shot.</div>
        </div>
      </button>
    ):(
      <div style={{...S.card,borderColor:C.jade+"35",background:"linear-gradient(145deg, #F0FAF5, #FAF7F1)",padding:20,borderRadius:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:800,color:C.ink}}>Daily Rackle #{dn}</div>
            <div style={{fontSize:13,color:C.jade,fontWeight:600,marginTop:3}}>{dailyResult?.rating} {dailyResult?.emoji}</div>
            <div style={{fontSize:11,color:C.mut,marginTop:2}}>{dailyResult?.section}</div>
          </div>
          <div style={{padding:"6px 12px",borderRadius:10,background:C.jade+"12",border:`2px solid ${C.jade}30`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:F.d,fontSize:12,fontWeight:800,color:C.jade}}>{dailyResult?.rating}</span>
          </div>
        </div>

        {/* Share preview */}
        <div style={{padding:12,background:"#fff",borderRadius:10,border:`1px solid ${C.bdr}`,marginBottom:10}}>
          <div style={{fontFamily:"monospace",fontSize:12,color:C.ink,lineHeight:1.7,whiteSpace:"pre"}}>{shareTxt}</div>
        </div>
        <button onClick={copy} style={{...S.greenBtn,width:"100%",fontSize:13,padding:"12px 0"}}>
          {copied?"✓ Copied!":"📋 Copy & share with your mahj group"}
        </button>
        <div style={{textAlign:"center",marginTop:10,padding:"8px 0",background:C.bg2,borderRadius:8,border:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:12,color:C.ink,fontWeight:600}}>🔥 Come back tomorrow</div>
          <div style={{fontSize:11,color:C.mut,marginTop:2}}>Rackle #{dn+1} drops at midnight</div>
        </div>
      </div>
    )}

    {/* Free Play */}
    <button onClick={()=>go("free")} style={{
      width:"100%",cursor:"pointer",display:"flex",alignItems:"center",gap:14,
      marginTop:8,borderRadius:16,padding:"18px 18px",textAlign:"left",
      background:"linear-gradient(145deg, #FFF8F6, #FDF5F2)",
      border:`1.5px solid ${C.cinn}18`,
      boxShadow:"0 3px 12px rgba(184,50,50,0.06)",
    }}>
      <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg, ${C.cinn}12, ${C.cinn}06)`,border:`1.5px solid ${C.cinn}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🀄</div>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:700,color:C.ink}}>Practice Mode</div>
        <div style={{fontSize:11,color:C.mut,lineHeight:1.5,marginTop:2}}>Unlimited rounds. Random deals. No pressure — just sharpen your Charleston strategy at your own pace.</div>
      </div>
      <span style={{fontSize:16,color:C.cinn,flexShrink:0}}>→</span>
    </button>

    {/* How to Play */}
    <button onClick={()=>setShowHelp(!showHelp)} style={{width:"100%",cursor:"pointer",display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginTop:8,padding:"8px 0",background:"none",border:"none",borderRadius:0}}>
      <span style={{fontSize:13,fontWeight:600,color:C.mut}}>📖 How to Play</span>
      <span style={{color:C.mut,fontSize:12}}>{showHelp?"▾":"▸"}</span>
    </button>
    {showHelp&&<div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",borderRadius:14}} className="rk-in">
      {["You're dealt 13 tiles from a full 152-tile mahjong set.",
        "Pass tiles in the ROLLOR sequence: Right (3), Over (3), Left (0-3 blind). Jokers can't be passed.",
        "Optionally do a second Charleston (LOR) and a Courtesy Pass.",
        "Choose which 2026 card section you'd play — Rackle rates your strategy.",
      ].map((s,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:8}}><div style={S.dot}>{i+1}</div><span style={{fontSize:12,color:C.mut,lineHeight:1.6}}>{s}</span></div>))}
    </div>}

    {/* 2026 Card tip */}
    <div style={{...S.card,background:C.jade+"04",borderColor:C.jade+"12",marginTop:6,borderRadius:14}}>
      <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:4}}>💡 2026 NMJL CARD</div>
      <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}><strong>6 appears in 40% of all hands.</strong> Flowers show up in 35%. Hold both. Pass 1s freely — they're the least connected number this year.</p>
    </div>

    {/* Social nudge for new users */}
    {rounds===0&&(
      <div style={{textAlign:"center",padding:"18px 16px",marginTop:10,background:"linear-gradient(145deg, #FFFFF8, #F8F4EB)",borderRadius:16,border:`1px solid ${C.gold}20`}}>
        <div style={{fontSize:22,marginBottom:8}}>🀄</div>
        <div style={{fontSize:14,fontFamily:F.d,fontWeight:700,color:C.ink,marginBottom:6}}>Join mahjong players<br/>across the country</div>
        <div style={{fontSize:12,color:C.mut,lineHeight:1.7}}>Play the daily challenge. Share your result.<br/>See who in your club gets the best rating.</div>
      </div>
    )}

    {/* Footer */}
    <div style={{textAlign:"center",padding:"22px 0 8px",marginTop:16}}>
      <div style={{width:40,height:1,background:C.bdr,margin:"0 auto 16px"}}/>
      <div style={{fontFamily:F.d,fontSize:18,color:C.ink,fontWeight:800,letterSpacing:-0.5}}>playrackle.com</div>
      <div style={{fontSize:12,color:C.jade,marginTop:4,fontFamily:F.d,fontStyle:"italic"}}>Rack & Roll 🀄</div>
      <div style={{fontSize:9,color:C.mut,marginTop:8,letterSpacing:2}}>2026 NMJL EDITION</div>
    </div>
  </div>);
}

function SPill({icon,val,label,hl}){
  return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}}>
    <span style={{fontSize:12}}>{icon}</span>
    <div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{val}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{label}</div></div>
  </div>);
}

// ── GAME (Charleston) ──────────────────────────

function GameScreen({mode,home,onDone}){
  const [phase,setPhase]=useState("deal");
  const [hand,setHand]=useState([]);const [pool,setPool]=useState([]);
  const [sel,setSel]=useState([]);const [passed,setPassed]=useState([]);
  const [newIdx,setNewIdx]=useState([]);const [jw,setJw]=useState(false);
  const [chosenSec,setChosenSec]=useState(null);const [showRef,setShowRef]=useState(false);
  const [showHint,setShowHint]=useState(false);const [hintExp,setHintExp]=useState(null);
  const [cn,setCn]=useState(1);const [pi,setPi]=useState(0);

  const cs=cn===1?FC:SC;const cp=cs[pi];

  // Deal — jokers REMOVED from pool so they can never be received
  useEffect(()=>{
    const d=mode==="daily"?seededShuffle(buildDeck(),getDailySeed()):shuffle(buildDeck());
    setHand(d.slice(0,13));
    setPool(d.slice(13).filter(t=>t.t!=="j"));
    setTimeout(()=>setPhase("pass"),500);
  },[]);

  const toggle=(i)=>{
    if(phase!=="pass"||newIdx.length>0)return;
    if(isJoker(hand[i])&&!sel.includes(i)){setJw(true);setTimeout(()=>setJw(false),1800);return;}
    const max=cp.blind?(cp.max||3):cp.req;
    setSel(p=>p.includes(i)?p.filter(x=>x!==i):p.length>=max?p:[...p,i]);
  };

  const cToggle=(i)=>{
    if(isJoker(hand[i])&&!sel.includes(i)){setJw(true);setTimeout(()=>setJw(false),1800);return;}
    setSel(p=>p.includes(i)?p.filter(x=>x!==i):p.length>=3?p:[...p,i]);
  };

  // Swap tiles — auto-advances after 600ms flash
  const doSwap=(count)=>{
    const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);
    const rem=hand.filter((_,i)=>!sel.includes(i));
    // Pool already has no jokers (filtered at deal), but double-guard
    const safe=pool.filter(t=>t.t!=="j");
    const inc=safe.slice(0,count);setPool(safe.slice(count));
    const comb=[...rem,...inc];
    const ni=[];for(let i=rem.length;i<comb.length;i++)ni.push(i);
    setNewIdx(ni);setHand(comb);setSel([]);
    // Auto-advance after brief flash showing new tiles
    setTimeout(()=>{
      setNewIdx([]);setShowHint(false);setHintExp(null);
      if(pi<2){setPi(p=>p+1);}
      else{setPhase(cn===1?"askSecond":"askCourtesy");}
    },600);
  };

  const doPass=()=>{
    const min=cp.blind?0:cp.req;const max=cp.blind?(cp.max||3):cp.req;
    if(sel.length<min||sel.length>max)return;
    if(sel.length===0){
      // Blind pass skip
      setShowHint(false);setHintExp(null);
      if(pi<2){setPi(p=>p+1);}
      else{setPhase(cn===1?"askSecond":"askCourtesy");}
      return;
    }
    doSwap(sel.length);
  };

  const confirm=()=>{
    if(!chosenSec)return;
    const adv=getAdvice(hand,chosenSec);const ev=evaluate(hand);const top=ev[0];
    const gi=top.score>=0.4?0:top.score>=0.3?1:top.score>=0.2?2:top.score>=0.12?3:top.score>=0.05?4:5;
    const ratings=["Mahjong Master","Sharp Player","Solid Hands","Getting There","Keep Practicing","Tough Deal"];
    const emojis=["🌟","🏆","💪","👏","👍","🎲"];
    const r=ratings[gi];
    onDone({rating:r,emoji:emojis[gi],section:`${top.icon} ${top.name} (${(top.score*100).toFixed(0)}%)`,advice:adv,gi});
    setPhase("result");
  };

  const restart=()=>{
    const d=shuffle(buildDeck());
    setHand(d.slice(0,13));setPool(d.slice(13).filter(t=>t.t!=="j"));
    setSel([]);setPassed([]);setNewIdx([]);setCn(1);setPi(0);
    setChosenSec(null);setShowRef(false);setShowHint(false);setHintExp(null);
    setPhase("deal");setTimeout(()=>setPhase("pass"),500);
  };

  // ── RENDERS ──────────────────────────────────

  if(phase==="deal")return<div style={S.pg}><div style={{textAlign:"center",paddingTop:60}}><div style={{fontSize:28}}>🎲</div><h2 style={{fontFamily:F.d,fontSize:18,color:C.ink}}>Dealing...</h2></div></div>;

  if(phase==="result"){
    const adv=getAdvice(hand,chosenSec);const ev=evaluate(hand);const top=ev[0];
    const gi=top.score>=0.4?0:top.score>=0.3?1:top.score>=0.2?2:top.score>=0.12?3:top.score>=0.05?4:5;
    const ratings=["Mahjong Master","Sharp Player","Solid Hands","Getting There","Keep Practicing","Tough Deal"];
    const emojis=["🌟","🏆","💪","👏","👍","🎲"];
    const gColors=[C.jade,C.jade,"#2460A8","#2460A8",C.gold,C.cinn];
    const r=ratings[gi];const gc=gColors[gi];const cd=SECS.find(s=>s.id===chosenSec);
    const isDaily=mode==="daily";const dn=getDayNum();
    const shareTxt=`🀄 Rackle ${isDaily?"#"+dn:""}\n${r} ${emojis[gi]}\nSection: ${top.icon} ${top.name}\nplayrackle.com`;
    const [cp2,setCp2]=useState(false);
    const copy2=()=>{navigator.clipboard?.writeText(shareTxt).then(()=>{setCp2(true);setTimeout(()=>setCp2(false),2000);});};

    return(<div style={S.pg}>
      <div style={{textAlign:"center",paddingTop:6,marginBottom:10}}>
        <div className={gi<=1?"rk-pop":""} style={{fontSize:38,marginBottom:3}}>{emojis[gi]}</div>
        <h2 style={{fontFamily:F.d,fontSize:22,color:C.ink,margin:0,fontWeight:800}}>{isDaily?`Daily Rackle #${dn}`:"Charleston Complete!"}</h2>
      </div>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{display:"inline-block",padding:"8px 20px",borderRadius:14,background:gc+"12",border:`2px solid ${gc}30`}}>
          <span style={{fontFamily:F.d,fontSize:18,fontWeight:800,color:gc}}>{r}</span>
        </div>
        <div style={{marginTop:8}}>
          <div style={{fontSize:14,color:C.ink,fontWeight:600}}>Best fit: {top.icon} {top.name}</div>
          <div style={{fontSize:12,color:C.mut,marginTop:2}}>{(top.score*100).toFixed(0)}% match · {passed.length} tiles passed</div>
        </div>
      </div>
      {/* Stats */}
      <div style={{...S.card,borderColor:adv.verdict==="Strong choice"?C.jade+"28":adv.verdict==="Playable but risky"?C.gold+"28":C.cinn+"25",
        background:adv.verdict==="Strong choice"?C.jade+"04":adv.verdict==="Playable but risky"?C.gold+"04":C.cinn+"04"}}>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{fontSize:18}}>{adv.emoji}</span>
          <div><div style={{fontSize:13,fontWeight:700,color:C.ink}}>{adv.verdict}</div><div style={{fontSize:11,color:C.mut}}>You chose: {cd?.icon} {cd?.name}</div></div>
        </div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"4px 0 0"}}>{adv.reason}</p>
        {adv.alts.length>0&&<div style={{marginTop:8,paddingTop:6,borderTop:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:9,color:C.mut,fontWeight:700,marginBottom:3}}>ALSO CONSIDER:</div>
          {adv.alts.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:11,color:C.ink}}>{a.icon} {a.name}</span><span style={{fontSize:10,color:a.color,fontWeight:600}}>{(a.score*100).toFixed(0)}%</span></div>)}
        </div>}
      </div>
      <RackDisplay hand={hand} label="FINAL RACK"/>
      {passed.length>0&&<div style={S.card}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:5}}>TILES PASSED ({passed.length})</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{passed.map((t,i)=><MTile key={i} t={t}/>)}</div>
      </div>}
      {/* Share */}
      <div style={S.shareCard}>
        <div style={{fontSize:8,color:C.jade,letterSpacing:4,fontWeight:700}}>RACKLE</div>
        <div style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"6px 0",fontWeight:800}}>{isDaily?"#"+dn+" · ":""}{r} {emojis[gi]}</div>
        <div style={{fontSize:13,color:C.mut}}>Section: {top.icon} {top.name}</div>
        <div style={{fontSize:12,color:C.jade,marginTop:8,fontWeight:600}}>How's your Charleston?</div>
        <div style={{fontSize:9,color:C.mut,marginTop:4,letterSpacing:2}}>PLAYRACKLE.COM</div>
      </div>
      <button onClick={copy2} style={{...S.oBtn,width:"100%",marginTop:6,fontSize:11}}>{cp2?"✓ Copied!":"📋 Copy & share"}</button>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={home} style={{...S.oBtn,flex:1}}>Home</button>
        {!isDaily&&<button onClick={restart} style={{...S.greenBtn,flex:1}}>Deal Again</button>}
      </div>
    </div>);
  }

  if(phase==="askSecond") return <AskScreen icon="🔄" title="Continue Charleston?" desc="Another round: Left → Over → Right?" hand={hand} onSort={()=>setHand(sortHand(hand))} onNo={()=>setPhase("askCourtesy")} onYes={()=>{setCn(2);setPi(0);setSel([]);setNewIdx([]);setPhase("pass");}}/>;
  if(phase==="askCourtesy") return <AskScreen icon="🤝" title="Courtesy Pass?" desc="Pass 1-3 tiles across and receive the same back." hand={hand} onSort={()=>setHand(sortHand(hand))} onNo={()=>{setSel([]);setNewIdx([]);setPhase("chooseHand");}} onYes={()=>{setSel([]);setNewIdx([]);setPhase("courtesy");}}/>;

  if(phase==="courtesy"){
    return(<div style={S.pg}>
      <div style={{textAlign:"center",marginBottom:10}}><span style={{fontSize:22}}>🤝</span><h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>Courtesy Pass</h2><p style={{fontSize:12,color:C.mut}}>Select 1-3 tiles</p></div>
      {jw&&<JW/>}
      <div style={S.card}><RH hand={hand} onSort={()=>setHand(sortHand(hand))}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><MTile key={i} t={t} sel={sel.includes(i)} dim={isJoker(t)} onClick={()=>cToggle(i)}/>)}</div></div>
      <div style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"4px 0"}}>{sel.length}/3</div>
      <button onClick={()=>{if(sel.length<1)return;
        const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);
        const rem=hand.filter((_,i)=>!sel.includes(i));
        const safe=pool.filter(t=>t.t!=="j");
        const inc=safe.slice(0,sel.length);setPool(safe.slice(sel.length));
        setHand([...rem,...inc]);setSel([]);setNewIdx([]);setPhase("chooseHand");
      }} disabled={sel.length<1} style={{...S.passBtn,opacity:sel.length>=1?1:0.3}}>🔄 Pass {sel.length}</button>
    </div>);
  }

  if(phase==="chooseHand"){
    return(<div style={S.pg}>
      <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 3px"}}>What hand are you playing?</h2>
      <p style={{fontSize:12,color:C.mut,marginBottom:8}}>Pick your target section.</p>
      <RackDisplay hand={hand} label="YOUR RACK" showSort onSort={()=>setHand(sortHand(hand))}/>
      <button onClick={()=>setShowRef(!showRef)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,background:showRef?C.gold+"06":"#fff"}}>
        <span style={{fontSize:12,fontWeight:600,color:showRef?C.gold:C.ink}}>📖 {showRef?"Hide":"Show"} 2026 Card Guide</span><span style={{color:C.mut}}>{showRef?"▾":"▸"}</span>
      </button>
      {showRef&&<CardGuide onClose={()=>setShowRef(false)}/>}
      {SECS.map(s=>{const isSel=chosenSec===s.id;return(
        <button key={s.id} onClick={()=>setChosenSec(s.id)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3,borderColor:isSel?s.color:C.bdr,background:isSel?s.color+"08":"#fff"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12}}>{s.icon}</span><div><div style={{fontSize:12,fontWeight:600,color:isSel?s.color:C.ink}}>{s.name}</div><div style={{fontSize:10,color:C.mut}}>{s.desc}</div></div></div>
          {isSel&&<span style={{fontSize:14,color:s.color}}>✓</span>}
        </button>);})}
      <button onClick={confirm} disabled={!chosenSec} style={{...S.greenBtn,width:"100%",marginTop:4,opacity:chosenSec?1:0.3}}>See My Stats →</button>
    </div>);
  }

  // ── PASS PHASE ──
  const isBlind=cp.blind;const canPass=isBlind?sel.length<=(cp.max||3):sel.length===cp.req;const hasNew=newIdx.length>0;

  return(<div style={S.pg}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <button onClick={home} style={S.back}>← Back</button>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {mode==="daily"&&<span style={{fontSize:9,color:C.jade,fontWeight:700,background:C.jade+"12",padding:"2px 6px",borderRadius:8}}>DAILY #{getDayNum()}</span>}
        <span style={{fontSize:10,color:C.mut,fontWeight:600}}>{cn===1?"1st":"2nd"} Charleston · {pi+1}/3</span>
      </div>
    </div>
    <div style={{display:"flex",gap:3,marginBottom:10}}>{[0,1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<pi?C.jade:i===pi?(hasNew?C.jade:C.gold):C.bdr}}/>)}</div>
    <div style={{textAlign:"center",marginBottom:10}}>
      <span style={{fontSize:22}}>{cp.icon}</span>
      <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>Pass {cp.dir}{isBlind?" (Blind)":""}</h2>
      <p style={{fontSize:12,color:hasNew?C.jade:C.mut,fontWeight:hasNew?600:400}}>
        {hasNew?`✓ ${newIdx.length} new tiles received`:isBlind?`Select 0-${cp.max||3} tiles`:`Select ${cp.req} tiles`}
      </p>
    </div>
    {jw&&<JW/>}
    <div style={S.card}><RH hand={hand} onSort={()=>setHand(sortHand(hand))} showRef={showRef} onRef={()=>setShowRef(!showRef)}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><MTile key={i} t={t} sel={sel.includes(i)} isNew={newIdx.includes(i)} dim={isJoker(t)&&!hasNew} onClick={!hasNew?()=>toggle(i):undefined}/>)}</div>
    </div>
    {showRef&&<CardGuide onClose={()=>setShowRef(false)}/>}
    {!hasNew&&(<>
      <div style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"5px 0"}}>{sel.length}/{isBlind?(cp.max||3):cp.req}</div>
      <button onClick={doPass} disabled={!canPass&&!(isBlind&&sel.length===0)} style={{...S.passBtn,opacity:canPass||(isBlind&&sel.length===0)?1:0.3}}>
        🔄 {isBlind&&sel.length===0?"Skip (pass 0)":`Pass ${sel.length} ${cp.dir}`}
      </button>
    </>)}
    {!hasNew&&<div style={{marginTop:8}}>
      <button onClick={()=>setShowHint(!showHint)} style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:8,padding:"6px 12px",fontSize:11,color:showHint?C.jade:C.mut,cursor:"pointer",fontWeight:600,width:"100%"}}>{showHint?"Hide Hint":"💡 Hint"}</button>
      {showHint&&<div style={{marginTop:6}} className="rk-in">
        {evaluate(hand).slice(0,4).map(s=>(<div key={s.id}>
          <button onClick={()=>setHintExp(hintExp===s.id?null:s.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"5px 8px",marginBottom:2,borderRadius:8,background:s.score>0.05?s.color+"08":C.bg2,border:`1px solid ${s.score>0.05?s.color+"20":C.bdr}`,cursor:"pointer"}}>
            <span style={{fontSize:10,color:s.score>0.05?s.color:C.mut,fontWeight:600}}>{s.icon} {s.name} {(s.score*100).toFixed(0)}%</span><span style={{fontSize:10,color:C.mut}}>{hintExp===s.id?"▾":"▸"}</span>
          </button>
          {hintExp===s.id&&<div style={{padding:"5px 8px",marginBottom:3,fontSize:10,color:C.ink,lineHeight:1.6,background:"#fff",borderRadius:6,border:`1px solid ${C.bdr}`}} className="rk-in">
            <div><span style={{color:C.jade,fontWeight:700}}>Hold:</span> {s.hold}</div><div><span style={{color:C.cinn,fontWeight:700}}>Pass:</span> {s.pass}</div>
          </div>}
        </div>))}
      </div>}
    </div>}
  </div>);
}

// ── SHARED COMPONENTS ──────────────────────────

function AskScreen({icon,title,desc,hand,onNo,onYes,onSort}){return(<div style={S.pg}><div style={{textAlign:"center",marginBottom:12,paddingTop:8}}><div style={{fontSize:24,marginBottom:6}}>{icon}</div><h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px"}}>{title}</h2><p style={{fontSize:12,color:C.mut}}>{desc}</p></div><RackDisplay hand={hand} label="YOUR RACK" showSort={!!onSort} onSort={onSort}/><div style={{display:"flex",gap:8,marginTop:12}}><button onClick={onNo} style={{...S.oBtn,flex:1}}>No</button><button onClick={onYes} style={{...S.greenBtn,flex:1}}>Yes</button></div></div>);}
function JW(){return(<div className="rk-in" style={{padding:"6px 10px",background:C.cinn+"08",borderRadius:8,border:`1px solid ${C.cinn}15`,textAlign:"center",marginBottom:6}}><span style={{fontSize:11,color:C.cinn,fontWeight:600}}>🃏 Jokers cannot be passed!</span></div>);}
function RH({hand,onSort,showRef,onRef}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK ({hand.length})</span><div style={{display:"flex",gap:4}}><button onClick={onSort} style={S.sortBtn}>Sort</button>{onRef&&<button onClick={onRef} style={{...S.sortBtn,background:showRef?C.jade+"10":"none",color:showRef?C.jade:C.mut,borderColor:showRef?C.jade+"30":C.bdr}}>📖 2026 Card</button>}</div></div>);}
function RackDisplay({hand,label,showSort,onSort}){return(<div style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>{label}</span>{showSort&&<button onClick={onSort} style={S.sortBtn}>Sort</button>}</div><div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><MTile key={i} t={t}/>)}</div></div>);}
function CardGuide({onClose}){const [exp,setExp]=useState(null);return(<div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",maxHeight:380,overflowY:"auto"}} className="rk-in"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,position:"sticky",top:0,background:"#FFFFF8",paddingBottom:3,zIndex:1}}><span style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700}}>📖 2026 CARD GUIDE</span><button onClick={onClose} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer"}}>✕</button></div>{SECS.map(s=>{const o=exp===s.id;return(<div key={s.id} style={{borderBottom:`1px solid ${C.bdr}`}}><button onClick={()=>setExp(o?null:s.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"6px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11}}>{s.icon}</span><span style={{fontSize:11,fontWeight:600,color:C.ink}}>{s.name}</span><span style={{fontSize:10,color:C.mut}}>— {s.desc}</span></div><span style={{fontSize:11,color:C.mut}}>{o?"▾":"▸"}</span></button>{o&&<div style={{paddingLeft:20,paddingBottom:6}} className="rk-in"><div style={{fontSize:9,color:C.mut,marginBottom:2}}>{"★".repeat(s.diff)}{"☆".repeat(5-s.diff)} · {s.hands} hands</div><div style={{fontSize:11,lineHeight:1.7,color:C.ink}}><div><span style={{color:C.jade,fontWeight:700}}>✓ Hold:</span> {s.hold}</div><div><span style={{color:C.cinn,fontWeight:700}}>✗ Pass:</span> {s.pass}</div><div><span style={{color:C.gold,fontWeight:700}}>💡 Key:</span> {s.combos}</div></div></div>}</div>);})}</div>);}

// ── DESIGN ─────────────────────────────────────

const C={bg:"#FAF7F1",bg2:"#F1ECE3",ink:"#221E1A",mut:"#858075",jade:"#1B7D4E",gold:"#B08A35",cinn:"#B83232",bdr:"#E3DDD3"};
const F={d:"'Fraunces',Georgia,serif",b:"'Nunito','Segoe UI',sans-serif"};
const CSS=`
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#D5CFC5}
@keyframes rkIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}.rk-in{animation:rkIn .25s ease}
@keyframes rkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}.rk-float{animation:rkFloat 3s ease-in-out infinite}
@keyframes rkPop{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}.rk-pop{animation:rkPop 0.5s cubic-bezier(0.34,1.56,0.64,1)}
`;
const S={
  outer:{background:"#D5CFC5",minHeight:"100vh",display:"flex",justifyContent:"center"},
  app:{fontFamily:F.b,background:C.bg,minHeight:"100vh",color:C.ink,width:"100%",maxWidth:480,boxShadow:"0 0 60px rgba(0,0,0,0.1)",borderLeft:`1px solid ${C.bdr}`,borderRight:`1px solid ${C.bdr}`},
  pg:{padding:"10px 16px",paddingBottom:36},
  pill:{background:C.bg2,borderRadius:12,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  card:{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:12,padding:14,marginBottom:8},
  dot:{width:20,height:20,borderRadius:10,background:C.jade+"12",border:`1.5px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.jade,flexShrink:0},
  passBtn:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.cinn},#9A2828)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1},
  greenBtn:{padding:"12px 0",background:`linear-gradient(135deg,${C.jade},#156B42)`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,cursor:"pointer"},
  oBtn:{padding:"10px 0",background:"none",color:C.mut,border:`1px solid ${C.bdr}`,borderRadius:12,fontSize:13,cursor:"pointer"},
  back:{background:"none",border:"none",color:C.jade,fontSize:12,cursor:"pointer",fontWeight:700,padding:0},
  sortBtn:{background:"none",border:`1px solid ${C.bdr}`,borderRadius:6,padding:"2px 7px",fontSize:9,color:C.mut,cursor:"pointer",fontWeight:600},
  shareCard:{background:"linear-gradient(145deg,#FFFFF5,#F4EFE3)",border:`1.5px solid ${C.jade}20`,borderRadius:18,padding:"16px 20px",textAlign:"center",marginTop:8,boxShadow:"0 4px 18px rgba(0,0,0,0.04)"},
};
