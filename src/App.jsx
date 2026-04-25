import { Analytics } from "@vercel/analytics/next"
import { useState, useEffect } from "react";

/*
 * RACKLE v4 — Correct ROLLOR Charleston
 * R(3) → O(3) → L(blind 0-3) → ask continue
 * L(3) → O(3) → R(blind 0-3) → ask courtesy
 * Courtesy Pass (0-3) → Hand selection → Coaching
 */

// ── TILES ──────────────────────────────────────────────

function buildDeck(){
  const d=[];
  ["bam","crak","dot"].forEach(s=>{for(let n=1;n<=9;n++)for(let i=0;i<4;i++)d.push({t:"s",s,n});});
  ["N","E","W","S"].forEach(v=>{for(let i=0;i<4;i++)d.push({t:"w",v});});
  ["Red","Grn","Soap"].forEach(v=>{for(let i=0;i<4;i++)d.push({t:"d",v});});
  for(let i=0;i<8;i++)d.push({t:"f"});
  for(let i=0;i<8;i++)d.push({t:"j"});
  return d;
}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function seededShuffle(a,seed){const b=[...a];let s=seed;for(let i=b.length-1;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
function sortVal(t){
  const o={s:0,f:1,w:2,d:3,j:4},so={bam:0,crak:1,dot:2};
  if(t.t==="s")return o.s*1000+so[t.s]*100+t.n;
  if(t.t==="f")return 1000;if(t.t==="w")return 2000+"NEWS".indexOf(t.v);
  if(t.t==="d")return 3000+["Red","Grn","Soap"].indexOf(t.v);return 4000;
}
function sortHand(t){return[...t].sort((a,b)=>sortVal(a)-sortVal(b));}
function tLabel(t){if(t.t==="j")return"🃏";if(t.t==="f")return"🌸";if(t.t==="w")return t.v;if(t.t==="d")return t.v==="Red"?"中":t.v==="Grn"?"發":"白";return`${t.n}`;}
function tSub(t){if(t.t==="j")return"Joker";if(t.t==="f")return"Flower";if(t.t==="w")return"Wind";if(t.t==="d")return t.v==="Soap"?"Soap":t.v==="Red"?"Red":"Green";return{bam:"Bam",crak:"Crk",dot:"Dot"}[t.s];}
function tColor(t){if(t.t==="j")return"#B8943F";if(t.t==="f")return"#C75B8E";if(t.t==="w")return"#5C5247";if(t.t==="d")return t.v==="Red"?"#C83838":t.v==="Grn"?"#1D8A56":"#6B6560";return{bam:"#1D8A56",crak:"#C83838",dot:"#2B6CB0"}[t.s];}
function isJoker(t){return t.t==="j";}

function Tile({t,sel,isNew,onClick,dim}){
  const c=tColor(t);
  return(<button onClick={onClick} style={{
    width:38,height:52,borderRadius:7,cursor:onClick?"pointer":"default",
    background:sel?c+"14":isNew?"#FFFBE7":"linear-gradient(145deg,#fff,#F8F5F0)",
    border:`2px solid ${sel?c:isNew?"#B8943F":"#D5CFC5"}`,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    padding:0,flexShrink:0,position:"relative",overflow:"hidden",
    boxShadow:sel?`0 4px 14px ${c}30`:`0 2px 4px rgba(0,0,0,0.06)`,
    transform:sel?"translateY(-5px) scale(1.05)":"none",
    transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",opacity:dim?0.4:1,
  }}>
    <span style={{fontSize:t.t==="f"||t.t==="j"?15:t.t==="d"?14:17,fontWeight:800,color:c,lineHeight:1,fontFamily:F.d}}>{tLabel(t)}</span>
    <span style={{fontSize:7,color:c,opacity:0.55,fontWeight:700,marginTop:1}}>{tSub(t)}</span>
    {sel&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c}}/>}
  </button>);
}

// ── SECTIONS ───────────────────────────────────────────

const SECS=[
  {id:"2026",name:"2026",color:"#C75B8E",icon:"📅",desc:"Year tiles — 2s, 0s (Soap), 6s",tip:"Hold 2s, 6s, Soap. Pass 1s and 9s.",
    hold:"2s, 6s, Soap (White Dragon), Flowers",pass:"1s, 9s, odd numbers, Winds",combos:"2+0+2+6 patterns across suits. Soap = the 0 in 2026.",hands:6,diff:3,
    check:h=>{const s=h.filter(x=>x.t==="s");return Math.max(0,Math.min(s.filter(x=>x.n===2).length*0.08+s.filter(x=>x.n===6).length*0.08+h.filter(x=>x.t==="d"&&x.v==="Soap").length*0.1-s.filter(x=>![2,6].includes(x.n)).length*0.04,1));}},
  {id:"2468",name:"2468",color:"#C83838",icon:"🔴",desc:"Even numbers (2, 4, 6, 8)",tip:"2+6 strongest pair. Build kongs of evens.",
    hold:"2s, 4s, 6s, 8s across multiple suits, Flowers, Jokers",pass:"All odd numbers (1,3,5,7,9), Winds",combos:"2+6 is the strongest pairing — used in 110 hands. Build kongs (4 of a kind) of even numbers.",hands:10,diff:2,
    check:h=>{const s=h.filter(x=>x.t==="s");const ev=s.filter(x=>x.n%2===0);return Math.max(0,Math.min(ev.length*0.07+(ev.some(x=>x.n===2)&&ev.some(x=>x.n===6)?0.1:0)-s.filter(x=>x.n%2===1).length*0.05,1));}},
  {id:"369",name:"369",color:"#CC5C87",icon:"💗",desc:"Multiples of 3 (3, 6, 9)",tip:"6 connects everything. 3+9 = 102 hands.",
    hold:"3s, 6s, 9s across all three suits, Flowers",pass:"Numbers that aren't multiples of 3, Winds",combos:"6 is the linchpin — every 369 hand uses it. 3+9 pairing appears in 102 hands. Look for clusters across suits.",hands:8,diff:3,
    check:h=>{const s=h.filter(x=>x.t==="s");return Math.max(0,Math.min(s.filter(x=>x.n%3===0).length*0.08+(s.some(x=>x.n===6)?0.08:0)-s.filter(x=>x.n%3!==0).length*0.04,1));}},
  {id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",desc:"Odd numbers (1, 3, 5, 7, 9)",tip:"5 is most versatile. Commit early.",
    hold:"1s, 3s, 5s, 7s, 9s across suits, Winds can help",pass:"All even numbers (2,4,6,8)",combos:"5 is the most versatile odd — keep it over 1. Winds pair well with odd-number hands.",hands:9,diff:2,
    check:h=>{const s=h.filter(x=>x.t==="s");return Math.max(0,Math.min(s.filter(x=>x.n%2===1).length*0.07-s.filter(x=>x.n%2===0).length*0.05,1));}},
  {id:"cr",name:"Consec. Run",color:"#1D8A56",icon:"🟢",desc:"Sequential tiles across suits",tip:"Runs in 2+ suits = many hands open.",
    hold:"Consecutive numbers in same suit (1-2-3, 4-5-6, etc.), Flowers",pass:"Isolated numbers with no neighbors, honors tiles",combos:"Look for 3+ tiles in a row in one suit. Having runs in 2-3 suits opens the most hands. Most flexible section on the card.",hands:11,diff:3,
    check:h=>{const bs={};h.filter(x=>x.t==="s").forEach(x=>{if(!bs[x.s])bs[x.s]=new Set();bs[x.s].add(x.n);});let mr=0;Object.values(bs).forEach(s=>{const a=[...s].sort((a,b)=>a-b);let r=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)r++;else{mr=Math.max(mr,r);r=1;}}mr=Math.max(mr,r);});return Math.max(0,Math.min((mr>=3?mr*0.12:mr*0.05)+Object.keys(bs).length*0.03-h.filter(x=>x.t==="w"||x.t==="d").length*0.03,1));}},
  {id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",desc:"Wind and Dragon tiles",tip:"Need 5+ honors. Tight pivots.",
    hold:"Winds (N,E,W,S), Dragons (Red,Green,Soap), pairs/pungs of honors",pass:"Number tiles that don't pair with your honors",combos:"Need 5+ honor tiles to be viable. Wind-anchor hands share 12+ tiles with each other — easy to pivot between them.",hands:7,diff:4,
    check:h=>{const wi=h.filter(x=>x.t==="w").length+h.filter(x=>x.t==="d").length;return Math.max(0,Math.min(wi*0.08-h.filter(x=>x.t==="s").length*0.03,1));}},
  {id:"aln",name:"Like Numbers",color:"#2B6CB0",icon:"🔵",desc:"Same number across all suits",tip:"Need 4+ of one number.",
    hold:"Multiple tiles of the same number (e.g. four 7s), Flowers, Jokers",pass:"Numbers you only have 1-2 of, honors",combos:"Look for any number you have 3-4 of across different suits. Jokers fill gaps. Good fallback when nothing else forms.",hands:6,diff:3,
    check:h=>{const c={};h.filter(x=>x.t==="s").forEach(x=>{c[x.n]=(c[x.n]||0)+1;});const mx=Math.max(0,...Object.values(c));return Math.max(0,Math.min((mx>=4?mx*0.1:mx*0.04)-Math.max(0,Object.keys(c).length-3)*0.04,1));}},
  {id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",desc:"Five of a kind (needs jokers)",tip:"2+ jokers AND 3+ of a tile.",
    hold:"Jokers (essential), any tile you have 3-4 of, Flowers",pass:"Tiles you have only 1-2 of (unless they're Jokers)",combos:"You need 5 of the same tile — only 4 exist, so Jokers are mandatory. Without 2+ Jokers, don't attempt this.",hands:4,diff:5,
    check:h=>{const jk=h.filter(x=>x.t==="j").length;const c={};h.filter(x=>x.t==="s").forEach(x=>{const k=`${x.s}${x.n}`;c[k]=(c[k]||0)+1;});const mx=Math.max(0,...Object.values(c));if(mx+jk>=5)return Math.min(0.6+jk*0.04,1);if(jk>=2&&mx>=3)return 0.4;return Math.max(0,(mx+jk)*0.05-0.1);}},
  {id:"sp",name:"Singles & Pairs",color:"#3AA89A",icon:"🩵",desc:"Only singles and pairs",tip:"All concealed. Charleston matters most.",
    hold:"Pairs of tiles, diverse singles, Flowers",pass:"Tiles you have 3+ of (can't use triples here)",combos:"Entirely concealed — opponents can't read your hand. Best for scattered hands. Pass away any triples immediately.",hands:5,diff:2,
    check:h=>{const c={};h.forEach(x=>{const k=JSON.stringify(x);c[k]=(c[k]||0)+1;});return Math.max(0,Math.min(Object.values(c).filter(v=>v===2).length*0.08-Object.values(c).filter(v=>v>=3).length*0.1,1));}},
];

function evaluate(h){return SECS.map(s=>({...s,score:s.check(h)})).sort((a,b)=>b.score-a.score);}

function getAdvice(hand,chosenId){
  const ev=evaluate(hand);const chosen=ev.find(s=>s.id===chosenId);const top=ev[0];
  const alts=ev.filter(s=>s.id!==chosenId&&s.score>0.12).slice(0,2);
  let verdict,emoji;
  if(!chosen||chosen.score<0.08){verdict="Not optimal";emoji="😬";}
  else if(chosen.id===top.id||chosen.score>=top.score*0.85){verdict="Strong choice";emoji="💪";}
  else if(chosen.score>=top.score*0.6){verdict="Playable but risky";emoji="🤔";}
  else{verdict="Not optimal";emoji="😬";}
  let reason="";
  if(chosen){const p=(chosen.score*100).toFixed(0);
    if(verdict==="Strong choice")reason=`${p}% fit for ${chosen.name}. Your tiles are well-aligned.`;
    else if(verdict==="Playable but risky")reason=`${p}% fit — possible, but tiles also lean toward ${top.name} (${(top.score*100).toFixed(0)}%).`;
    else reason=`Only ${p}% fit. Tiles lean toward ${top.name} (${(top.score*100).toFixed(0)}%).`;
  }
  return{verdict,emoji,reason,alts,top,chosen};
}

// ── DAILY ──────────────────────────────────────────────

function getDailySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function getDayNum(){return Math.floor((new Date()-new Date(2026,3,25))/86400000)+1;}

// ── STORAGE ────────────────────────────────────────────

const mem={};
const ST={
  get(k,d){try{return JSON.parse(localStorage.getItem("rk4-"+k))||d;}catch{return mem[k]??d;}},
  set(k,v){try{localStorage.setItem("rk4-"+k,JSON.stringify(v));}catch{mem[k]=v;}},
};

// ── CHARLESTON SEQUENCE DEFINITION ─────────────────────

// First Charleston:  R(3 required) → O(3 required) → L(blind, 0-3)
// Second Charleston: L(3 required) → O(3 required) → R(blind, 0-3)
// Courtesy Pass: 0-3

const FIRST_CHARLESTON = [
  { dir: "Right", icon: "👉", required: 3, blind: false },
  { dir: "Over",  icon: "↕️", required: 3, blind: false },
  { dir: "Left",  icon: "👈", required: 0, blind: true, max: 3 },
];
const SECOND_CHARLESTON = [
  { dir: "Left",  icon: "👈", required: 3, blind: false },
  { dir: "Over",  icon: "↕️", required: 3, blind: false },
  { dir: "Right", icon: "👉", required: 0, blind: true, max: 3 },
];

// ── APP ────────────────────────────────────────────────

export default function Rackle(){
  const [screen,setScreen]=useState("home");
  const [mode,setMode]=useState("free");
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

  return(<div style={S.app}><style>{CSS}</style>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800;9..144,900&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
    {screen==="home"&&<HomeScreen go={m=>{setMode(m);setScreen("play");}} {...{streak,rounds,dailyDone,dailyResult,showHelp,setShowHelp}}/>}
    {screen==="play"&&<PlayScreen mode={mode} home={()=>setScreen("home")} onDone={onDone}/>}
  </div>);
}

// ── HOME ───────────────────────────────────────────────

function HomeScreen({go,streak,rounds,dailyDone,dailyResult,showHelp,setShowHelp}){
  const [copied,setCopied]=useState(false);
  const dn=getDayNum();
  const copy=()=>{if(dailyResult){navigator.clipboard?.writeText(`🀄 Rackle #${dn}\n${dailyResult.blocks}  ${dailyResult.grade}\n→ ${dailyResult.section}\nplayrackle.com`).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}};

  return(<div style={S.pg}>
    <div style={{textAlign:"center",paddingTop:20,marginBottom:14}}>
      <div className="rk-float" style={{fontSize:34,marginBottom:6}}>🀄</div>
      <h1 style={{fontFamily:F.d,fontSize:36,color:C.ink,margin:0,fontWeight:900,letterSpacing:-1}}>Rackle</h1>
      <div style={{display:"inline-block",padding:"3px 10px",borderRadius:20,background:C.jade+"10",border:`1px solid ${C.jade}22`,marginTop:5}}>
        <span style={{fontSize:9,color:C.jade,fontWeight:700,letterSpacing:3}}>2026 NMJL EDITION</span>
      </div>
      <p style={{fontSize:14,color:C.ink,fontWeight:600,margin:"10px 0 2px"}}>Practice your Charleston passing.</p>
      <p style={{fontSize:12,color:C.mut}}>Get dealt. Pass strategically. Get coached.</p>
    </div>

    <button onClick={()=>setShowHelp(!showHelp)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,fontWeight:600,color:C.ink}}>📖 How to Play</span>
      <span style={{color:C.mut}}>{showHelp?"▾":"▸"}</span>
    </button>
    {showHelp&&(<div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30"}} className="rk-in">
      {["Deal 13 tiles. Look for patterns — which section could you build toward?",
        "Pass tiles in the ROLLOR sequence: Right (3), Over (3), Left (0-3 blind).",
        "Optionally do a second Charleston (LOR) and a Courtesy Pass.",
        "Choose your target section. Rackle coaches you on your decision.",
      ].map((s,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:7}}><div style={S.dot}>{i+1}</div><span style={{fontSize:12,color:C.mut,lineHeight:1.6}}>{s}</span></div>))}
      <div style={{marginTop:6,padding:8,background:C.jade+"06",borderRadius:8,border:`1px solid ${C.jade}12`}}>
        <span style={{fontSize:11,color:C.ink}}>🃏 <strong>Jokers cannot be passed</strong> during any Charleston round.</span>
      </div>
    </div>)}

    {rounds>0&&<div style={{display:"flex",gap:6,marginBottom:10}}>
      <SPill icon="🎲" val={rounds} label="PLAYED"/>
      <SPill icon="🔥" val={streak} label="STREAK" hl={streak>0}/>
    </div>}

    <button onClick={()=>!dailyDone&&go("daily")} disabled={dailyDone}
      style={{...S.card,width:"100%",cursor:dailyDone?"default":"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
      borderColor:dailyDone?C.jade+"30":C.gold+"35",background:dailyDone?C.jade+"04":"linear-gradient(135deg,#FFFDF6,#FFF8E8)"}}>
      <div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{fontSize:13}}>📅</span><span style={{fontFamily:F.d,fontSize:15,fontWeight:700,color:C.ink}}>Daily Rackle #{dn}</span></div>
        <div style={{fontSize:11,color:C.mut}}>{dailyDone?`Done! ${dailyResult?.grade||""}`:"Same deal for everyone."}</div></div>
      {dailyDone?<span style={{fontSize:18}}>✅</span>:<span style={{fontSize:12,color:C.gold,fontWeight:700}}>Play →</span>}
    </button>
    {dailyDone&&dailyResult&&<button onClick={copy} style={{...S.oBtn,width:"100%",fontSize:12,marginBottom:6}}>{copied?"✓ Copied!":"📋 Copy result"}</button>}

    <button onClick={()=>go("free")} style={S.bigBtn}><span style={{fontSize:18}}>🎲</span><div style={{textAlign:"left"}}><div style={{fontFamily:F.d,fontSize:16,fontWeight:700}}>Free Play</div><div style={{fontSize:11,opacity:0.85}}>Unlimited practice rounds</div></div></button>

    <div style={{...S.card,background:C.jade+"05",borderColor:C.jade+"12",marginTop:3}}>
      <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:3}}>💡 2026 CARD</div>
      <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}><strong>6 appears in 40% of hands.</strong> Flowers in 35%. Hold both. Pass 1s freely.</p>
    </div>

    <div style={{textAlign:"center",padding:"14px 0 4px",borderTop:`1px solid ${C.bdr}`,marginTop:12}}>
      <div style={{fontSize:8,color:C.mut,letterSpacing:2}}>POWERED BY</div>
      <div style={{fontFamily:F.d,fontSize:11,color:C.jade,letterSpacing:2,marginTop:2}}>TILETRACKER</div>
    </div>
  </div>);
}

function SPill({icon,val,label,hl}){
  return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}}>
    <span style={{fontSize:12}}>{icon}</span>
    <div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{val}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{label}</div></div>
  </div>);
}

// ── PLAY SCREEN ────────────────────────────────────────

function PlayScreen({mode,home,onDone}){
  /*
   * Flow states:
   * deal → pass → askSecond → pass (second) → askCourtesy → courtesy → chooseHand → result
   * 
   * passIndex tracks position within current charleston sequence
   * charlestonNum: 1 = first (ROL), 2 = second (LOR)
   */
  const [phase,setPhase]=useState("deal");
  const [hand,setHand]=useState([]);
  const [orig,setOrig]=useState([]);
  const [pool,setPool]=useState([]);
  const [sel,setSel]=useState([]);
  const [passed,setPassed]=useState([]);
  const [newIdx,setNewIdx]=useState([]);
  const [passScores,setPassScores]=useState([]);
  const [jokerWarn,setJokerWarn]=useState(false);
  const [chosenSec,setChosenSec]=useState(null);
  const [showRef,setShowRef]=useState(false);

  // Charleston tracking
  const [charlestonNum,setCharlestonNum]=useState(1); // 1 or 2
  const [passIndex,setPassIndex]=useState(0); // 0,1,2 within current charleston

  const currentSeq=charlestonNum===1?FIRST_CHARLESTON:SECOND_CHARLESTON;
  const currentPass=currentSeq[passIndex];

  // Deal
  useEffect(()=>{
    const deck=mode==="daily"?seededShuffle(buildDeck(),getDailySeed()):shuffle(buildDeck());
    setHand(deck.slice(0,13));setOrig([...deck.slice(0,13)]);setPool(deck.slice(13));
    setTimeout(()=>setPhase("pass"),600);
  },[]);

  const toggle=(i)=>{
    if(phase!=="pass"&&phase!=="courtesy") return;
    if(newIdx.length>0) return; // Can't select while viewing new tiles
    if(isJoker(hand[i])&&!sel.includes(i)){setJokerWarn(true);setTimeout(()=>setJokerWarn(false),1800);return;}
    setSel(p=>p.includes(i)?p.filter(x=>x!==i):p.length>=(currentPass?.max||currentPass?.required||3)?p:[...p,i]);
  };

  const courtesyToggle=(i)=>{
    if(phase!=="courtesy") return;
    if(isJoker(hand[i])&&!sel.includes(i)){setJokerWarn(true);setTimeout(()=>setJokerWarn(false),1800);return;}
    setSel(p=>p.includes(i)?p.filter(x=>x!==i):p.length>=3?p:[...p,i]);
  };

  const doPass=()=>{
    const minRequired=currentPass.blind?0:currentPass.required;
    const maxAllowed=currentPass.blind?(currentPass.max||3):currentPass.required;
    if(sel.length<minRequired||sel.length>maxAllowed) return;

    if(sel.length===0){
      // Blind pass with 0 — skip, no tiles exchanged, advance immediately
      continueAfterPass();
      return;
    }

    executeTileSwap(sel.length);
    // After swap, newIdx will be set — user sees new tiles and taps Continue
  };

  const doCourtesyPass=()=>{
    if(sel.length===0){finishCharleston();return;}
    if(sel.length>3)return;
    executeTileSwap(sel.length);
    // Go straight to chooseHand after courtesy
    setTimeout(()=>{setNewIdx([]);setSel([]);setPhase("chooseHand");},50);
  };

  const executeTileSwap=(count)=>{
    const beforeScore=evaluate(hand)[0].score;
    const pt=sel.map(i=>hand[i]);
    setPassed(p=>[...p,...pt]);
    const remaining=hand.filter((_,i)=>!sel.includes(i));
    // Filter jokers out of the pool for incoming tiles — jokers can't be passed
    const nonJokerPool=pool.filter(t=>t.t!=="j");
    const jokerPool=pool.filter(t=>t.t==="j");
    const incoming=nonJokerPool.slice(0,count);
    const newPool=[...nonJokerPool.slice(count),...jokerPool];
    setPool(newPool);
    const combined=[...remaining,...incoming];
    const ni=[];for(let i=remaining.length;i<combined.length;i++)ni.push(i);
    setNewIdx(ni);setHand(combined);setSel([]);

    const afterScore=evaluate(combined)[0].score;
    const imp=afterScore-beforeScore;
    setPassScores(ps=>[...ps,imp>0.08?0.85:imp>0?0.5:imp>-0.05?0.3:0.1]);
  };

  // No auto-advance — user taps Continue after seeing new tiles

  const startSecondCharleston=()=>{setCharlestonNum(2);setPassIndex(0);setSel([]);setNewIdx([]);setPhase("pass");};
  const skipSecondCharleston=()=>{setPhase("askCourtesy");};
  const startCourtesyPass=()=>{setSel([]);setNewIdx([]);setPhase("courtesy");};
  const skipCourtesy=()=>{finishCharleston();};
  const finishCharleston=()=>{setSel([]);setNewIdx([]);setPhase("chooseHand");};

  // Continue after seeing new tiles
  const continueAfterPass=()=>{
    setNewIdx([]);setSel([]);
    if(passIndex<2){
      setPassIndex(passIndex+1);
    } else {
      if(charlestonNum===1){setPhase("askSecond");return;}
      else{setPhase("askCourtesy");return;}
    }
  };

  const restart=()=>{
    const deck=shuffle(buildDeck());
    setHand(deck.slice(0,13));setOrig([...deck.slice(0,13)]);setPool(deck.slice(13));
    setSel([]);setPassed([]);setNewIdx([]);setPassScores([]);
    setCharlestonNum(1);setPassIndex(0);setChosenSec(null);setShowRef(false);
    setPhase("deal");setTimeout(()=>setPhase("pass"),600);
  };

  const confirmChoice=()=>{
    if(!chosenSec)return;
    const adv=getAdvice(hand,chosenSec);const ev=evaluate(hand);const top=ev[0];
    const gi=top.score>=0.55?0:top.score>=0.45?1:top.score>=0.35?2:top.score>=0.25?3:top.score>=0.15?4:5;
    const grades=["A+","A","B+","B","C","D"];
    const toB=v=>v>=0.7?"🟩":v>=0.4?"🟨":"⬜";
    onDone({grade:grades[gi],blocks:passScores.map(toB).join(""),section:`${top.icon} ${top.name} (${(top.score*100).toFixed(0)}%)`,advice:adv,gi});
    setPhase("result");
  };

  // ── RENDERS ─────────────────────────────────────────

  if(phase==="deal")return(<div style={S.pg}><div style={{textAlign:"center",paddingTop:60}}><div style={{fontSize:28,marginBottom:8}}>🎲</div><h2 style={{fontFamily:F.d,fontSize:18,color:C.ink}}>Dealing...</h2></div></div>);

  if(phase==="result")return<ResultScreen hand={hand} passed={passed} passScores={passScores} chosenSec={chosenSec} mode={mode} home={home} restart={restart}/>;

  if(phase==="askSecond"){
    return(<div style={S.pg}>
      <div style={{textAlign:"center",marginBottom:14,paddingTop:8}}>
        <div style={{fontSize:24,marginBottom:6}}>🔄</div>
        <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px"}}>Continue Charleston?</h2>
        <p style={{fontSize:12,color:C.mut}}>Do another round of passes (Left → Over → Right)?</p>
      </div>
      <RackDisplay hand={hand} label="YOUR RACK"/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={skipSecondCharleston} style={{...S.oBtn,flex:1}}>No, stop here</button>
        <button onClick={startSecondCharleston} style={{...S.greenBtn,flex:1}}>Yes, continue</button>
      </div>
    </div>);
  }

  if(phase==="askCourtesy"){
    return(<div style={S.pg}>
      <div style={{textAlign:"center",marginBottom:14,paddingTop:8}}>
        <div style={{fontSize:24,marginBottom:6}}>🤝</div>
        <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px"}}>Courtesy Pass?</h2>
        <p style={{fontSize:12,color:C.mut,lineHeight:1.5}}>Pass 1-3 tiles across and receive the same number back.</p>
      </div>
      <RackDisplay hand={hand} label="YOUR RACK"/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={skipCourtesy} style={{...S.oBtn,flex:1}}>No thanks</button>
        <button onClick={startCourtesyPass} style={{...S.greenBtn,flex:1}}>Yes, courtesy pass</button>
      </div>
    </div>);
  }

  if(phase==="courtesy"){
    return(<div style={S.pg}>
      <div style={{textAlign:"center",marginBottom:12}}>
        <div style={{fontSize:22,marginBottom:2}}>🤝</div>
        <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"0 0 2px"}}>Courtesy Pass</h2>
        <p style={{fontSize:12,color:C.mut}}>Select 1-3 tiles to pass across</p>
      </div>
      {jokerWarn&&<div className="rk-in" style={{padding:"6px 10px",background:C.cinn+"08",borderRadius:8,border:`1px solid ${C.cinn}15`,textAlign:"center",marginBottom:6}}>
        <span style={{fontSize:11,color:C.cinn,fontWeight:600}}>🃏 Jokers cannot be passed!</span>
      </div>}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK</span>
          <button onClick={()=>setHand(sortHand(hand))} style={S.sortBtn}>Sort</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
          {hand.map((t,i)=><Tile key={i} t={t} sel={sel.includes(i)} dim={isJoker(t)} onClick={()=>courtesyToggle(i)}/>)}
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"4px 0"}}>{sel.length}/3 selected</div>
      <button onClick={doCourtesyPass} disabled={sel.length<1} style={{...S.passBtn,opacity:sel.length>=1?1:0.3}}>
        🔄 Pass {sel.length} tile{sel.length!==1?"s":""}
      </button>
    </div>);
  }

  if(phase==="chooseHand"){
    const ev=evaluate(hand);
    return(<div style={S.pg}>
      <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 3px"}}>What hand are you playing?</h2>
      <p style={{fontSize:12,color:C.mut,marginBottom:10}}>Pick the section you'd target with this rack.</p>
      <RackDisplay hand={hand} label="YOUR RACK" showSort onSort={()=>setHand(sortHand(hand))}/>

      {/* Card Guide toggle */}
      <button onClick={()=>setShowRef(!showRef)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,background:showRef?C.gold+"06":"#fff",borderColor:showRef?C.gold+"30":C.bdr}}>
        <span style={{fontSize:12,fontWeight:600,color:showRef?C.gold:C.ink}}>📖 {showRef?"Hide":"Show"} Card Guide</span>
        <span style={{fontSize:12,color:C.mut}}>{showRef?"▾":"▸"}</span>
      </button>
      {showRef&&<CardGuide onClose={()=>setShowRef(false)}/>}

      <div style={{marginBottom:8,marginTop:4}}>
        {SECS.map(s=>{const isSel=chosenSec===s.id;return(
          <button key={s.id} onClick={()=>setChosenSec(s.id)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3,
            borderColor:isSel?s.color:C.bdr,background:isSel?s.color+"08":"#fff"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:13}}>{s.icon}</span><div>
              <div style={{fontSize:12,fontWeight:600,color:isSel?s.color:C.ink}}>{s.name}</div>
              <div style={{fontSize:10,color:C.mut}}>{s.desc}</div>
            </div></div>
            {isSel&&<span style={{fontSize:14,color:s.color}}>✓</span>}
          </button>);
        })}
      </div>
      <button onClick={confirmChoice} disabled={!chosenSec} style={{...S.greenBtn,width:"100%",opacity:chosenSec?1:0.3}}>Get My Coaching →</button>
    </div>);
  }

  // ── PASS PHASE ──────────────────────────────────────

  const isBlind=currentPass.blind;
  const minReq=isBlind?0:currentPass.required;
  const maxReq=isBlind?(currentPass.max||3):currentPass.required;
  const totalPasses=charlestonNum===1?3:(passIndex+4);
  const currentPassNum=charlestonNum===1?passIndex+1:passIndex+4;
  const charLabel=charlestonNum===1?"1st Charleston":"2nd Charleston";

  const canPass=isBlind?(sel.length>=0&&sel.length<=maxReq):(sel.length===minReq);

  return(<div style={S.pg}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <button onClick={home} style={S.back}>✕</button>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {mode==="daily"&&<span style={{fontSize:9,color:C.gold,fontWeight:700,background:C.gold+"12",padding:"2px 6px",borderRadius:8}}>DAILY</span>}
        <span style={{fontSize:10,color:C.mut,fontWeight:600}}>{charLabel} · Pass {passIndex+1}/3</span>
      </div>
    </div>

    {/* Progress */}
    <div style={{display:"flex",gap:3,marginBottom:10}}>
      {[0,1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<passIndex?C.jade:i===passIndex?C.gold:C.bdr}}/>)}
    </div>

    {/* Phase header */}
    <div style={{textAlign:"center",marginBottom:10}}>
      <span style={{fontSize:22}}>{currentPass.icon}</span>
      <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>
        Pass {currentPass.dir} {isBlind?"(Blind)":""}
      </h2>
      <p style={{fontSize:12,color:C.mut}}>
        {isBlind?`Select 0 to ${maxReq} tiles. You won't see what's coming.`:`Select ${currentPass.required} tile${currentPass.required!==1?"s":""} to pass.`}
      </p>
    </div>

    {/* Joker warning */}
    {jokerWarn&&<div className="rk-in" style={{padding:"6px 10px",background:C.cinn+"08",borderRadius:8,border:`1px solid ${C.cinn}15`,textAlign:"center",marginBottom:6}}>
      <span style={{fontSize:11,color:C.cinn,fontWeight:600}}>🃏 Jokers cannot be passed!</span>
    </div>}

    {/* Rack */}
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK ({hand.length})</span>
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>setHand(sortHand(hand))} style={S.sortBtn}>Sort</button>
          <button onClick={()=>setShowRef(!showRef)} style={{...S.sortBtn,background:showRef?C.jade+"10":"none",color:showRef?C.jade:C.mut,borderColor:showRef?C.jade+"30":C.bdr}}>{showRef?"Hide":"📖 Ref"}</button>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
        {hand.map((t,i)=><Tile key={i} t={t} sel={sel.includes(i)} isNew={newIdx.includes(i)} dim={isJoker(t)&&phase==="pass"} onClick={()=>toggle(i)}/>)}
      </div>
    </div>

    {/* Card Guide */}
    {showRef&&<CardGuide onClose={()=>setShowRef(false)}/>}

    {/* Selection / Continue */}
    {newIdx.length===0?(
      <>
        <div style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"5px 0"}}>
          {sel.length}/{isBlind?maxReq:currentPass.required} selected
        </div>
        <button onClick={doPass} disabled={!canPass&&!(isBlind&&sel.length===0)}
          style={{...S.passBtn,opacity:canPass||(isBlind&&sel.length===0)?1:0.3}}>
          🔄 {isBlind&&sel.length===0?"Skip (pass 0)":`Pass ${sel.length} tile${sel.length!==1?"s":""} ${currentPass.dir}`}
        </button>
      </>
    ):(
      <>
        <div style={{textAlign:"center",fontSize:12,color:C.jade,fontWeight:600,margin:"6px 0"}}>
          ✓ {newIdx.length} new tile{newIdx.length!==1?"s":""} received (gold border)
        </div>
        <button onClick={continueAfterPass} style={{...S.greenBtn,width:"100%"}}>
          Continue →
        </button>
      </>
    )}

    {/* Tip */}
    <div style={{marginTop:8,padding:8,background:C.jade+"05",borderRadius:8,border:`1px solid ${C.jade}10`}}>
      <div style={{fontSize:9,color:C.jade,fontWeight:700,letterSpacing:1}}>💡 TIP</div>
      <div style={{fontSize:11,color:C.mut,lineHeight:1.5,marginTop:2}}>
        {passIndex===0&&charlestonNum===1?"Scan your tiles. See a section forming? Pass outliers. Hold 6s and Flowers."
        :passIndex===1?"Commit to a direction. Pass tiles that compete with your chosen section."
        :"Last pass this round. Go all-in on your strongest read."}
      </div>
    </div>

    {/* Live fit */}
    <div style={{marginTop:6}}>
      <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:3}}>CURRENT FIT</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
        {evaluate(hand).slice(0,4).map(s=>(
          <div key={s.id} style={{fontSize:9,padding:"2px 6px",borderRadius:6,background:s.score>0.15?s.color+"10":C.bg2,border:`1px solid ${s.score>0.15?s.color+"22":C.bdr}`,color:s.score>0.15?s.color:C.mut,fontWeight:600}}>
            {s.icon} {s.name} {(s.score*100).toFixed(0)}%
          </div>
        ))}
      </div>
    </div>
  </div>);
}

// ── CARD GUIDE (expandable section reference) ────────

function CardGuide({onClose}){
  const [expanded,setExpanded]=useState(null);
  return(
    <div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",maxHeight:420,overflowY:"auto",position:"relative"}} className="rk-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,position:"sticky",top:0,background:"#FFFFF8",paddingBottom:4,zIndex:1}}>
        <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700}}>📖 2026 CARD GUIDE</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer",padding:0}}>✕</button>
      </div>
      {SECS.map(s=>{
        const isOpen=expanded===s.id;
        return(<div key={s.id} style={{borderBottom:`1px solid ${C.bdr}`,paddingBottom:isOpen?10:0}}>
          <button onClick={()=>setExpanded(isOpen?null:s.id)} style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"8px 0",
            background:"none",border:"none",cursor:"pointer",textAlign:"left",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13}}>{s.icon}</span>
              <div>
                <span style={{fontSize:12,fontWeight:600,color:C.ink}}>{s.name}</span>
                <span style={{fontSize:10,color:C.mut,marginLeft:6}}>{s.desc}</span>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:9,color:C.mut}}>{s.hands}h</span>
              <span style={{fontSize:12,color:C.mut}}>{isOpen?"▾":"▸"}</span>
            </div>
          </button>
          {isOpen&&(
            <div style={{paddingLeft:24,paddingRight:4}} className="rk-in">
              <div style={{fontSize:9,color:C.mut,letterSpacing:1,fontWeight:700,marginBottom:3}}>
                DIFFICULTY {"★".repeat(s.diff)}{"☆".repeat(5-s.diff)} · {s.hands} HANDS
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",gap:4,marginBottom:4}}>
                  <span style={{fontSize:10,color:C.jade,fontWeight:700,minWidth:38}}>✓ Hold</span>
                  <span style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.hold}</span>
                </div>
                <div style={{display:"flex",gap:4,marginBottom:4}}>
                  <span style={{fontSize:10,color:C.cinn,fontWeight:700,minWidth:38}}>✗ Pass</span>
                  <span style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.pass}</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <span style={{fontSize:10,color:C.gold,fontWeight:700,minWidth:38}}>💡 Key</span>
                  <span style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{s.combos}</span>
                </div>
              </div>
            </div>
          )}
        </div>);
      })}
    </div>
  );
}

// ── RACK DISPLAY (reusable) ────────────────────────────

function RackDisplay({hand,label,showSort,onSort}){
  return(<div style={S.card}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>{label}</span>
      {showSort&&<button onClick={onSort} style={S.sortBtn}>Sort</button>}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
      {hand.map((t,i)=><Tile key={i} t={t}/>)}
    </div>
  </div>);
}

// ── RESULT ─────────────────────────────────────────────

function ResultScreen({hand,passed,passScores,chosenSec,mode,home,restart}){
  const ev=evaluate(hand);const top=ev[0];const adv=getAdvice(hand,chosenSec);
  const chosenData=SECS.find(s=>s.id===chosenSec);
  const gi=top.score>=0.55?0:top.score>=0.45?1:top.score>=0.35?2:top.score>=0.25?3:top.score>=0.15?4:5;
  const grades=["A+","A","B+","B","C","D"];
  const emojis=["🌟","🏆","💪","👏","👍","🎲"];
  const gColors=[C.jade,C.jade,"#2B6CB0","#2B6CB0",C.gold,C.cinn];
  const g=grades[gi];const gc=gColors[gi];
  const toB=v=>v>=0.7?"🟩":v>=0.4?"🟨":"⬜";
  const blocks=passScores.map(toB).join("");
  const isDaily=mode==="daily";const dn=getDayNum();

  const [copied,setCopied]=useState(false);
  const shareTxt=`🀄 Rackle ${isDaily?"#"+dn:""}\n${blocks}  ${g}\n→ ${top.icon} ${top.name} (${(top.score*100).toFixed(0)}%)\nplayrackle.com`;
  const copy=()=>{navigator.clipboard?.writeText(shareTxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  return(<div style={S.pg}>
    <div style={{textAlign:"center",paddingTop:6,marginBottom:10}}>
      <div className={gi<=1?"rk-pop":""} style={{fontSize:38,marginBottom:3}}>{emojis[gi]}</div>
      <h2 style={{fontFamily:F.d,fontSize:22,color:C.ink,margin:0,fontWeight:800}}>{isDaily?`Daily Rackle #${dn}`:"Charleston Complete!"}</h2>
    </div>

    {/* Grade */}
    <div style={{textAlign:"center",marginBottom:12}}>
      <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,borderRadius:16,background:gc+"12",border:`3px solid ${gc}35`,boxShadow:`0 4px 16px ${gc}15`}}>
        <span style={{fontFamily:F.d,fontSize:26,fontWeight:900,color:gc}}>{g}</span>
      </div>
      <div style={{display:"flex",gap:4,justifyContent:"center",marginTop:6}}>
        {passScores.map((ps,i)=><div key={i} style={{width:24,height:24,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,
          background:ps>=0.7?C.jade+"12":ps>=0.4?C.gold+"12":"#f5f0e8",border:`1px solid ${ps>=0.7?C.jade+"25":ps>=0.4?C.gold+"25":C.bdr}`}}>{toB(ps)}</div>)}
      </div>
      <div style={{fontSize:9,color:C.mut,marginTop:3}}>Each block = one pass</div>
    </div>

    {/* Coaching */}
    <div style={{...S.card,borderColor:adv.verdict==="Strong choice"?C.jade+"28":adv.verdict==="Playable but risky"?C.gold+"28":C.cinn+"25",
      background:adv.verdict==="Strong choice"?C.jade+"04":adv.verdict==="Playable but risky"?C.gold+"04":C.cinn+"04"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
        <span style={{fontSize:18}}>{adv.emoji}</span>
        <div><div style={{fontSize:13,fontWeight:700,color:C.ink}}>{adv.verdict}</div>
          <div style={{fontSize:11,color:C.mut}}>You chose: {chosenData?.icon} {chosenData?.name}</div></div>
      </div>
      <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"4px 0 0"}}>{adv.reason}</p>
      {adv.alts.length>0&&(<div style={{marginTop:8,paddingTop:6,borderTop:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:9,color:C.mut,fontWeight:700,marginBottom:3}}>YOU COULD ALSO CONSIDER:</div>
        {adv.alts.map(a=>(<div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
          <span style={{fontSize:11,color:C.ink}}>{a.icon} {a.name}</span>
          <span style={{fontSize:10,color:a.color,fontWeight:600}}>{(a.score*100).toFixed(0)}%</span>
        </div>))}
      </div>)}
    </div>

    <RackDisplay hand={hand} label="FINAL RACK"/>

    {passed.length>0&&<div style={S.card}>
      <div style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:5}}>TILES PASSED ({passed.length})</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{passed.map((t,i)=><Tile key={i} t={t}/>)}</div>
      {passed.some(t=>t.t==="f"||(t.t==="s"&&t.n===6))&&<div style={{marginTop:5,padding:5,background:C.cinn+"05",borderRadius:6,fontSize:10,color:C.cinn}}>⚠️ You passed high-value tiles (6s or Flowers)</div>}
    </div>}

    {/* Share */}
    <div style={S.shareCard}>
      <div style={{fontSize:8,color:C.jade,letterSpacing:4,fontWeight:700}}>RACKLE</div>
      <div style={{fontFamily:F.d,fontSize:20,color:C.ink,margin:"3px 0",fontWeight:800}}>{isDaily?"#"+dn+" ":""}{g} {emojis[gi]}</div>
      <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:3}}>{passScores.map((ps,i)=><span key={i} style={{fontSize:14}}>{toB(ps)}</span>)}</div>
      <div style={{fontSize:11,color:C.mut,marginTop:5}}>→ {top.icon} {top.name}</div>
      <div style={{fontSize:10,color:C.jade,marginTop:5,fontWeight:600}}>How's your Charleston?</div>
      <div style={{fontSize:8,color:C.mut,marginTop:3,letterSpacing:2}}>PLAYRACKLE.COM</div>
    </div>
    <button onClick={copy} style={{...S.oBtn,width:"100%",marginTop:6,fontSize:11}}>{copied?"✓ Copied!":"📋 Copy result"}</button>
    <div style={{display:"flex",gap:8,marginTop:8}}>
      <button onClick={home} style={{...S.oBtn,flex:1}}>Home</button>
      {!isDaily&&<button onClick={restart} style={{...S.greenBtn,flex:1}}>Deal Again</button>}
    </div>
  </div>);
}

// ── TOKENS & STYLES ────────────────────────────────────

const C={bg:"#FAF7F2",bg2:"#F2EDE5",ink:"#231F1B",mut:"#878075",jade:"#1D8A56",gold:"#B8943F",cinn:"#C83838",bdr:"#E5DFD5"};
const F={d:"'Fraunces',Georgia,serif",b:"'Nunito','Segoe UI',sans-serif"};
const CSS=`*{box-sizing:border-box}@keyframes rkIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}.rk-in{animation:rkIn .25s ease}@keyframes rkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}.rk-float{animation:rkFloat 3s ease-in-out infinite}@keyframes rkPop{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}.rk-pop{animation:rkPop 0.5s cubic-bezier(0.34,1.56,0.64,1)}`;

const S={
  app:{fontFamily:F.b,background:C.bg,minHeight:"100vh",color:C.ink,maxWidth:440,margin:"0 auto"},
  pg:{padding:"10px 14px",paddingBottom:36},
  pill:{background:C.bg2,borderRadius:12,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  card:{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:12,padding:14,marginBottom:8},
  dot:{width:20,height:20,borderRadius:10,background:C.jade+"12",border:`1.5px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.jade,flexShrink:0},
  bigBtn:{width:"100%",padding:"14px 16px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,#C83838,#A82E2E)`,color:"#fff",display:"flex",alignItems:"center",gap:12,boxShadow:`0 4px 16px ${C.cinn}20`,marginBottom:8},
  passBtn:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,#C83838,#A82E2E)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1},
  greenBtn:{padding:"12px 0",background:`linear-gradient(135deg,${C.jade},#167A48)`,color:"#fff",border:"none",borderRadius:11,fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,cursor:"pointer"},
  oBtn:{padding:"10px 0",background:"none",color:C.mut,border:`1px solid ${C.bdr}`,borderRadius:11,fontSize:13,cursor:"pointer"},
  back:{background:"none",border:`1px solid ${C.bdr}`,color:C.mut,fontSize:11,padding:"4px 10px",borderRadius:8,cursor:"pointer",fontWeight:600},
  sortBtn:{background:"none",border:`1px solid ${C.bdr}`,borderRadius:6,padding:"2px 7px",fontSize:9,color:C.mut,cursor:"pointer",fontWeight:600},
  shareCard:{background:"linear-gradient(145deg,#FFFFF6,#F5F0E4)",border:`1.5px solid ${C.jade}20`,borderRadius:18,padding:"16px 20px",textAlign:"center",marginTop:8,boxShadow:"0 4px 18px rgba(0,0,0,0.04)"},
};