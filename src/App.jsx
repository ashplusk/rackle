import { Analytics } from "@vercel/analytics/next"
import { useState, useEffect } from "react";

/*
 * RACKLE v5
 * ROLLOR Charleston trainer · 2026 NMJL
 * All feedback incorporated
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
function sortVal(t){const o={s:0,f:1,w:2,d:3,j:4},so={bam:0,crak:1,dot:2};if(t.t==="s")return so[t.s]*100+t.n;if(t.t==="f")return 1000;if(t.t==="w")return 2000+"NEWS".indexOf(t.v);if(t.t==="d")return 3000+["Red","Grn","Soap"].indexOf(t.v);return 4000;}
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
  {id:"2026",name:"2026",color:"#C75B8E",icon:"📅",desc:"Year tiles — 2s, 0s (Soap), 6s",
    hold:"2s, 6s, Soap (White Dragon), Flowers",pass:"1s, 9s, odd numbers, Winds",combos:"2+0+2+6 patterns across suits. Soap = the 0.",hands:6,diff:3,
    check:h=>{const s=h.filter(x=>x.t==="s");const t2=s.filter(x=>x.n===2).length;const t6=s.filter(x=>x.n===6).length;const soap=h.filter(x=>x.t==="d"&&x.v==="Soap").length;const irr=s.filter(x=>![2,6].includes(x.n)).length;const hon=h.filter(x=>x.t==="w").length;return Math.max(0,Math.min(t2*0.06+t6*0.06+soap*0.08-irr*0.05-hon*0.03,1));}},
  {id:"2468",name:"2468",color:"#C83838",icon:"🔴",desc:"Even numbers (2, 4, 6, 8)",
    hold:"2s, 4s, 6s, 8s across multiple suits, Flowers, Jokers",pass:"All odd numbers (1,3,5,7,9), Winds",combos:"2+6 is the strongest pairing — 110 hands. Build kongs of evens.",hands:10,diff:2,
    check:h=>{const s=h.filter(x=>x.t==="s");const ev=s.filter(x=>x.n%2===0);const od=s.filter(x=>x.n%2===1);const hon=h.filter(x=>x.t==="w").length;return Math.max(0,Math.min(ev.length*0.055+(ev.some(x=>x.n===2)&&ev.some(x=>x.n===6)?0.08:0)-od.length*0.06-hon*0.03,1));}},
  {id:"369",name:"369",color:"#CC5C87",icon:"💗",desc:"Multiples of 3 (3, 6, 9)",
    hold:"3s, 6s, 9s across all three suits, Flowers",pass:"Non-multiples of 3, Winds",combos:"6 is the linchpin. 3+9 pairing = 102 hands.",hands:8,diff:3,
    check:h=>{const s=h.filter(x=>x.t==="s");const m=s.filter(x=>x.n%3===0);const nm=s.filter(x=>x.n%3!==0);return Math.max(0,Math.min(m.length*0.06+(m.some(x=>x.n===6)?0.06:0)-nm.length*0.05,1));}},
  {id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",desc:"Odd numbers (1, 3, 5, 7, 9)",
    hold:"1s, 3s, 5s, 7s, 9s across suits, Winds can help",pass:"All even numbers (2,4,6,8)",combos:"5 is most versatile. Winds pair well with odds.",hands:9,diff:2,
    check:h=>{const s=h.filter(x=>x.t==="s");const od=s.filter(x=>x.n%2===1);const ev=s.filter(x=>x.n%2===0);return Math.max(0,Math.min(od.length*0.055-ev.length*0.06,1));}},
  {id:"cr",name:"Consec. Run",color:"#1D8A56",icon:"🟢",desc:"Sequential tiles across suits",
    hold:"Consecutive numbers in same suit (1-2-3, 4-5-6), Flowers",pass:"Isolated numbers, honors tiles",combos:"Runs in 2-3 suits opens the most hands. Most flexible section.",hands:11,diff:3,
    check:h=>{const bs={};h.filter(x=>x.t==="s").forEach(x=>{if(!bs[x.s])bs[x.s]=new Set();bs[x.s].add(x.n);});let mr=0;Object.values(bs).forEach(s=>{const a=[...s].sort((a,b)=>a-b);let r=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)r++;else{mr=Math.max(mr,r);r=1;}}mr=Math.max(mr,r);});const hon=h.filter(x=>x.t==="w"||x.t==="d").length;const scattered=Object.keys(bs).length;return Math.max(0,Math.min((mr>=4?mr*0.1:mr>=3?mr*0.08:mr*0.03)+scattered*0.02-hon*0.04,1));}},
  {id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",desc:"Wind and Dragon tiles",
    hold:"Winds (N,E,W,S), Dragons (Red,Green,Soap), pairs of honors",pass:"Number tiles that don't pair with honors",combos:"Need 5+ honor tiles. Wind-anchor hands share 12+ tiles — easy pivots.",hands:7,diff:4,
    check:h=>{const wi=h.filter(x=>x.t==="w").length;const dr=h.filter(x=>x.t==="d").length;const su=h.filter(x=>x.t==="s").length;return Math.max(0,Math.min((wi+dr)*0.06-su*0.04,1));}},
  {id:"aln",name:"Like Numbers",color:"#2B6CB0",icon:"🔵",desc:"Same number across all suits",
    hold:"Multiple tiles of the same number, Flowers, Jokers",pass:"Numbers you only have 1-2 of, honors",combos:"Need 4+ of one number. Good fallback section.",hands:6,diff:3,
    check:h=>{const c={};h.filter(x=>x.t==="s").forEach(x=>{c[x.n]=(c[x.n]||0)+1;});const vals=Object.values(c);const mx=vals.length?Math.max(...vals):0;const tn=Object.keys(c).length;return Math.max(0,Math.min((mx>=4?mx*0.08:mx*0.03)-Math.max(0,tn-3)*0.05,1));}},
  {id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",desc:"Five of a kind (needs jokers)",
    hold:"Jokers (essential), any tile you have 3-4 of, Flowers",pass:"Tiles you have only 1-2 of",combos:"Need 5 of same tile — requires 2+ Jokers. Highest risk.",hands:4,diff:5,
    check:h=>{const jk=h.filter(x=>x.t==="j").length;const c={};h.filter(x=>x.t==="s").forEach(x=>{const k=`${x.s}${x.n}`;c[k]=(c[k]||0)+1;});const vals=Object.values(c);const mx=vals.length?Math.max(...vals):0;if(mx+jk>=5)return Math.min(0.5+jk*0.03,0.8);if(jk>=2&&mx>=3)return 0.35;return Math.max(0,(mx+jk)*0.04-0.12);}},
  {id:"sp",name:"Singles & Pairs",color:"#3AA89A",icon:"🩵",desc:"Only singles and pairs",
    hold:"Pairs of tiles, diverse singles, Flowers",pass:"Tiles you have 3+ of (can't use triples)",combos:"Entirely concealed — opponents can't read you. Pass triples immediately.",hands:5,diff:2,
    check:h=>{const c={};h.forEach(x=>{const k=JSON.stringify(x);c[k]=(c[k]||0)+1;});const pr=Object.values(c).filter(v=>v===2).length;const tr=Object.values(c).filter(v=>v>=3).length;return Math.max(0,Math.min(pr*0.06-tr*0.12,1));}},
];

function evaluate(h){return SECS.map(s=>({...s,score:s.check(h)})).sort((a,b)=>b.score-a.score);}

function getAdvice(hand,chosenId){
  const ev=evaluate(hand);const chosen=ev.find(s=>s.id===chosenId);const top=ev[0];
  const alts=ev.filter(s=>s.id!==chosenId&&s.score>0.08).slice(0,2);
  let verdict,emoji;
  if(!chosen||chosen.score<0.05){verdict="Not optimal";emoji="😬";}
  else if(chosen.id===top.id||chosen.score>=top.score*0.9){verdict="Strong choice";emoji="💪";}
  else if(chosen.score>=top.score*0.65){verdict="Playable but risky";emoji="🤔";}
  else{verdict="Not optimal";emoji="😬";}
  let reason="";
  if(chosen){const p=(chosen.score*100).toFixed(0);
    if(verdict==="Strong choice")reason=`${p}% fit for ${chosen.name}. Your tiles are well-aligned for this section.`;
    else if(verdict==="Playable but risky")reason=`${p}% fit — possible, but your tiles also lean toward ${top.name} (${(top.score*100).toFixed(0)}%).`;
    else reason=`Only ${p}% fit. Your tiles point more toward ${top.name} (${(top.score*100).toFixed(0)}%).`;
  }
  return{verdict,emoji,reason,alts,top,chosen};
}

function getDailySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function getDayNum(){return Math.floor((new Date()-new Date(2026,3,25))/86400000)+1;}

const mem={};
const ST={
  get(k,d){try{return JSON.parse(localStorage.getItem("rk5-"+k))||d;}catch{return mem[k]??d;}},
  set(k,v){try{localStorage.setItem("rk5-"+k,JSON.stringify(v));}catch{mem[k]=v;}},
};

const FIRST_C=[{dir:"Right",icon:"👉",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Left",icon:"👈",req:0,blind:true,max:3}];
const SECOND_C=[{dir:"Left",icon:"👈",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Right",icon:"👉",req:0,blind:true,max:3}];

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

  return(<div style={S.outer}><div style={S.app}><style>{CSS}</style>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800;9..144,900&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
    {screen==="home"&&<HomeScreen go={m=>{setMode(m);setScreen("play");}} {...{streak,rounds,dailyDone,dailyResult,showHelp,setShowHelp}}/>}
    {screen==="play"&&<PlayScreen mode={mode} home={()=>setScreen("home")} onDone={onDone}/>}
  </div></div>);
}

// ── HOME ───────────────────────────────────────────────

function HomeScreen({go,streak,rounds,dailyDone,dailyResult,showHelp,setShowHelp}){
  const [copied,setCopied]=useState(false);
  const dn=getDayNum();
  const shareTxt=dailyResult?`🀄 Rackle #${dn}\nGrade: ${dailyResult.grade}\n${dailyResult.section}\nplayrackle.com`:"";
  const copy=()=>{if(shareTxt){navigator.clipboard?.writeText(shareTxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}};

  return(<div style={S.pg}>
    {/* Hero */}
    <div style={{textAlign:"center",paddingTop:24,marginBottom:6}}>
      <div className="rk-float" style={{fontSize:38,marginBottom:8}}>🀄</div>
      <h1 style={{fontFamily:F.d,fontSize:40,color:C.ink,margin:0,fontWeight:900,letterSpacing:-1.5}}>Rackle</h1>
      <p style={{fontFamily:F.d,fontSize:18,color:C.jade,margin:"4px 0 0",fontWeight:600,fontStyle:"italic"}}>Rack & Roll.</p>
    </div>

    {/* Tagline */}
    <div style={{textAlign:"center",marginBottom:18}}>
      <p style={{fontSize:14,color:C.ink,fontWeight:600,margin:"8px 0 3px",lineHeight:1.4}}>The daily Charleston challenge for<br/>American Mahjong players.</p>
      <p style={{fontSize:12,color:C.mut,margin:0}}>Practice your passes. Sharpen your strategy. Share your grade.</p>
    </div>

    {/* Daily Challenge — hero CTA */}
    {!dailyDone?(
      <button onClick={()=>go("daily")} style={{
        width:"100%",padding:"20px 18px",borderRadius:16,border:"none",cursor:"pointer",marginBottom:8,
        background:"linear-gradient(135deg,#C83838,#A82E2E)",color:"#fff",
        display:"flex",alignItems:"center",gap:14,textAlign:"left",
        boxShadow:"0 6px 24px rgba(200,56,56,0.25)",
      }}>
        <div style={{width:48,height:48,borderRadius:14,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📅</div>
        <div>
          <div style={{fontFamily:F.d,fontSize:18,fontWeight:800}}>Daily Rackle #{dn}</div>
          <div style={{fontSize:12,opacity:0.9,marginTop:2}}>Same deal for every player. One shot today.</div>
        </div>
      </button>
    ):(
      <div style={{...S.card,borderColor:C.jade+"30",background:C.jade+"04",textAlign:"center",padding:18}}>
        <div style={{fontSize:28,marginBottom:4}}>✅</div>
        <div style={{fontFamily:F.d,fontSize:16,fontWeight:700,color:C.ink}}>Daily Rackle #{dn} Complete!</div>
        <div style={{fontSize:13,color:C.jade,fontWeight:600,marginTop:2}}>Grade: {dailyResult?.grade}</div>
        
        {/* Share prompt */}
        <div style={{marginTop:12,padding:12,background:C.bg2,borderRadius:10,border:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:11,color:C.ink,fontWeight:600,marginBottom:6}}>Share your score 👇</div>
          <div style={{fontFamily:"monospace",fontSize:12,color:C.ink,lineHeight:1.6,whiteSpace:"pre",background:"#fff",borderRadius:8,padding:10,border:`1px solid ${C.bdr}`,textAlign:"left"}}>
{shareTxt}
          </div>
          <button onClick={copy} style={{...S.greenBtn,width:"100%",marginTop:8,fontSize:12,padding:"10px 0"}}>
            {copied?"✓ Copied!":"📋 Copy & share on Instagram / group chat"}
          </button>
        </div>

        <div style={{marginTop:10,fontSize:12,color:C.mut}}>
          🔥 Come back tomorrow for Rackle #{dn+1}
        </div>
      </div>
    )}

    {/* Stats */}
    {rounds>0&&<div style={{display:"flex",gap:6,marginBottom:8}}>
      <SPill icon="🎲" val={rounds} label="PLAYED"/>
      <SPill icon="🔥" val={streak} label="DAY STREAK" hl={streak>0}/>
    </div>}

    {/* Free Play */}
    <button onClick={()=>go("free")} style={{
      ...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
      background:"#fff",borderColor:C.bdr,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:16}}>🎲</span>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:14,fontWeight:600,color:C.ink}}>Free Play</div>
          <div style={{fontSize:11,color:C.mut}}>Unlimited rounds. Practice anytime.</div>
        </div>
      </div>
      <span style={{fontSize:13,color:C.mut}}>→</span>
    </button>

    {/* How to Play */}
    <button onClick={()=>setShowHelp(!showHelp)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:2}}>
      <span style={{fontSize:13,fontWeight:600,color:C.ink}}>📖 How to Play</span>
      <span style={{color:C.mut}}>{showHelp?"▾":"▸"}</span>
    </button>
    {showHelp&&<div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30"}} className="rk-in">
      {["You're dealt 13 tiles from a full mahjong set.",
        "Pass tiles: Right (3), Over (3), Left (0-3 blind). Jokers can't be passed.",
        "Optionally do a second Charleston (LOR) and a Courtesy Pass.",
        "Choose which card section you'd play — Rackle grades your strategy.",
      ].map((s,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:7}}><div style={S.dot}>{i+1}</div><span style={{fontSize:12,color:C.mut,lineHeight:1.6}}>{s}</span></div>))}
    </div>}

    {/* Social proof / virality nudge */}
    <div style={{textAlign:"center",padding:"16px 0",marginTop:8}}>
      <div style={{fontSize:12,color:C.mut,lineHeight:1.8}}>
        🀄 New daily challenge every day<br/>
        📋 Copy your score and share it<br/>
        🔥 Build your streak
      </div>
    </div>

    {/* 2026 card tip */}
    <div style={{...S.card,background:C.jade+"05",borderColor:C.jade+"12"}}>
      <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:3}}>💡 2026 CARD</div>
      <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}><strong>6 appears in 40% of hands.</strong> Flowers in 35%. Hold both. Pass 1s freely.</p>
    </div>

    {/* Footer */}
    <div style={{textAlign:"center",padding:"14px 0 4px",borderTop:`1px solid ${C.bdr}`,marginTop:10}}>
      <div style={{fontFamily:F.d,fontSize:14,color:C.ink,fontWeight:700}}>playrackle.com</div>
      <div style={{fontSize:10,color:C.mut,marginTop:3}}>The daily Charleston game for mahjong players</div>
    </div>
  </div>);
}

function SPill({icon,val,label,hl}){
  return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}}>
    <span style={{fontSize:12}}>{icon}</span>
    <div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{val}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{label}</div></div>
  </div>);
}

// ── PLAY ────────────────────────────────────────────────

function PlayScreen({mode,home,onDone}){
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
  const [showHint,setShowHint]=useState(false);
  const [hintExpanded,setHintExpanded]=useState(null);
  const [charNum,setCharNum]=useState(1);
  const [passIdx,setPassIdx]=useState(0);

  const curSeq=charNum===1?FIRST_C:SECOND_C;
  const curPass=curSeq[passIdx];

  useEffect(()=>{
    const deck=mode==="daily"?seededShuffle(buildDeck(),getDailySeed()):shuffle(buildDeck());
    setHand(deck.slice(0,13));setOrig([...deck.slice(0,13)]);setPool(deck.slice(13));
    setTimeout(()=>setPhase("pass"),600);
  },[]);

  const toggle=(i)=>{
    if(phase!=="pass"||newIdx.length>0)return;
    if(isJoker(hand[i])&&!sel.includes(i)){setJokerWarn(true);setTimeout(()=>setJokerWarn(false),1800);return;}
    const max=curPass.blind?(curPass.max||3):curPass.req;
    setSel(p=>p.includes(i)?p.filter(x=>x!==i):p.length>=max?p:[...p,i]);
  };

  const courtesyToggle=(i)=>{
    if(phase!=="courtesy")return;
    if(isJoker(hand[i])&&!sel.includes(i)){setJokerWarn(true);setTimeout(()=>setJokerWarn(false),1800);return;}
    setSel(p=>p.includes(i)?p.filter(x=>x!==i):p.length>=3?p:[...p,i]);
  };

  const executeTileSwap=(count)=>{
    const beforeScore=evaluate(hand)[0].score;
    const pt=sel.map(i=>hand[i]);
    setPassed(p=>[...p,...pt]);
    const remaining=hand.filter((_,i)=>!sel.includes(i));
    const nonJP=pool.filter(t=>t.t!=="j");
    const jP=pool.filter(t=>t.t==="j");
    const incoming=nonJP.slice(0,count);
    setPool([...nonJP.slice(count),...jP]);
    const combined=[...remaining,...incoming];
    const ni=[];for(let i=remaining.length;i<combined.length;i++)ni.push(i);
    setNewIdx(ni);setHand(combined);setSel([]);
    const afterScore=evaluate(combined)[0].score;
    const imp=afterScore-beforeScore;
    // Stricter pass scoring
    setPassScores(ps=>[...ps,imp>0.1?0.85:imp>0.03?0.5:imp>-0.02?0.3:0.1]);
  };

  const doPass=()=>{
    const min=curPass.blind?0:curPass.req;
    const max=curPass.blind?(curPass.max||3):curPass.req;
    if(sel.length<min||sel.length>max)return;
    if(sel.length===0){continueAfterPass();return;}
    executeTileSwap(sel.length);
  };

  const doCourtesyPass=()=>{
    if(sel.length===0){setSel([]);setNewIdx([]);setPhase("chooseHand");return;}
    if(sel.length>3)return;
    executeTileSwap(sel.length);
    setTimeout(()=>{setNewIdx([]);setSel([]);setPhase("chooseHand");},50);
  };

  const continueAfterPass=()=>{
    setNewIdx([]);setSel([]);setShowHint(false);setHintExpanded(null);
    if(passIdx<2){setPassIdx(passIdx+1);}
    else{setPhase(charNum===1?"askSecond":"askCourtesy");}
  };

  const confirmChoice=()=>{
    if(!chosenSec)return;
    const adv=getAdvice(hand,chosenSec);const ev=evaluate(hand);const top=ev[0];
    const gi=top.score>=0.45?0:top.score>=0.35?1:top.score>=0.25?2:top.score>=0.18?3:top.score>=0.1?4:5;
    const grades=["A+","A","B+","B","C","D"];
    const totalPasses=passed.length;
    onDone({grade:grades[gi],section:`${top.icon} ${top.name} (${(top.score*100).toFixed(0)}%)`,passes:totalPasses,advice:adv,gi});
    setPhase("result");
  };

  const restart=()=>{
    const deck=shuffle(buildDeck());
    setHand(deck.slice(0,13));setOrig([...deck.slice(0,13)]);setPool(deck.slice(13));
    setSel([]);setPassed([]);setNewIdx([]);setPassScores([]);
    setCharNum(1);setPassIdx(0);setChosenSec(null);setShowRef(false);setShowHint(false);setHintExpanded(null);
    setPhase("deal");setTimeout(()=>setPhase("pass"),600);
  };

  // ── RENDERS ─────────

  if(phase==="deal")return(<div style={S.pg}><div style={{textAlign:"center",paddingTop:60}}><div style={{fontSize:28,marginBottom:8}}>🎲</div><h2 style={{fontFamily:F.d,fontSize:18,color:C.ink}}>Dealing...</h2></div></div>);

  if(phase==="result")return<ResultScreen hand={hand} passed={passed} chosenSec={chosenSec} mode={mode} home={home} restart={restart}/>;

  if(phase==="askSecond"){
    return(<div style={S.pg}>
      <div style={{textAlign:"center",marginBottom:14,paddingTop:8}}><div style={{fontSize:24,marginBottom:6}}>🔄</div>
        <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px"}}>Continue Charleston?</h2>
        <p style={{fontSize:12,color:C.mut}}>Do another round (Left → Over → Right)?</p></div>
      <RackDisplay hand={hand} label="YOUR RACK"/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={()=>setPhase("askCourtesy")} style={{...S.oBtn,flex:1}}>No</button>
        <button onClick={()=>{setCharNum(2);setPassIdx(0);setSel([]);setNewIdx([]);setPhase("pass");}} style={{...S.greenBtn,flex:1}}>Yes, continue</button>
      </div>
    </div>);
  }

  if(phase==="askCourtesy"){
    return(<div style={S.pg}>
      <div style={{textAlign:"center",marginBottom:14,paddingTop:8}}><div style={{fontSize:24,marginBottom:6}}>🤝</div>
        <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 4px"}}>Courtesy Pass?</h2>
        <p style={{fontSize:12,color:C.mut}}>Pass 1-3 tiles across and receive the same back.</p></div>
      <RackDisplay hand={hand} label="YOUR RACK"/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={()=>{setSel([]);setNewIdx([]);setPhase("chooseHand");}} style={{...S.oBtn,flex:1}}>No thanks</button>
        <button onClick={()=>{setSel([]);setNewIdx([]);setPhase("courtesy");}} style={{...S.greenBtn,flex:1}}>Yes</button>
      </div>
    </div>);
  }

  if(phase==="courtesy"){
    return(<div style={S.pg}>
      <div style={{textAlign:"center",marginBottom:12}}><div style={{fontSize:22,marginBottom:2}}>🤝</div>
        <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"0 0 2px"}}>Courtesy Pass</h2>
        <p style={{fontSize:12,color:C.mut}}>Select 1-3 tiles to pass across</p></div>
      {jokerWarn&&<JokerWarn/>}
      <div style={S.card}>
        <RackHeader hand={hand} onSort={()=>setHand(sortHand(hand))}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
          {hand.map((t,i)=><Tile key={i} t={t} sel={sel.includes(i)} dim={isJoker(t)} onClick={()=>courtesyToggle(i)}/>)}
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"4px 0"}}>{sel.length}/3</div>
      <button onClick={doCourtesyPass} disabled={sel.length<1} style={{...S.passBtn,opacity:sel.length>=1?1:0.3}}>🔄 Pass {sel.length} tile{sel.length!==1?"s":""}</button>
    </div>);
  }

  if(phase==="chooseHand"){
    return(<div style={S.pg}>
      <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 3px"}}>What hand are you playing?</h2>
      <p style={{fontSize:12,color:C.mut,marginBottom:10}}>Pick the section you'd target.</p>
      <RackDisplay hand={hand} label="YOUR RACK" showSort onSort={()=>setHand(sortHand(hand))}/>
      <button onClick={()=>setShowRef(!showRef)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,background:showRef?C.gold+"06":"#fff",borderColor:showRef?C.gold+"30":C.bdr}}>
        <span style={{fontSize:12,fontWeight:600,color:showRef?C.gold:C.ink}}>📖 {showRef?"Hide":"Show"} 2026 Card Guide</span>
        <span style={{fontSize:12,color:C.mut}}>{showRef?"▾":"▸"}</span>
      </button>
      {showRef&&<CardGuide onClose={()=>setShowRef(false)}/>}
      <div style={{marginBottom:8}}>
        {SECS.map(s=>{const isSel=chosenSec===s.id;return(
          <button key={s.id} onClick={()=>setChosenSec(s.id)} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3,
            borderColor:isSel?s.color:C.bdr,background:isSel?s.color+"08":"#fff"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:13}}>{s.icon}</span><div>
              <div style={{fontSize:12,fontWeight:600,color:isSel?s.color:C.ink}}>{s.name}</div>
              <div style={{fontSize:10,color:C.mut}}>{s.desc}</div>
            </div></div>
            {isSel&&<span style={{fontSize:14,color:s.color}}>✓</span>}
          </button>);})}
      </div>
      <button onClick={confirmChoice} disabled={!chosenSec} style={{...S.greenBtn,width:"100%",opacity:chosenSec?1:0.3}}>See My Stats →</button>
    </div>);
  }

  // ── PASS PHASE ──────
  const isBlind=curPass.blind;
  const canPass=isBlind?(sel.length>=0&&sel.length<=(curPass.max||3)):(sel.length===curPass.req);
  const hasNewTiles=newIdx.length>0;
  const currentEval=evaluate(hand);
  const charLabel=charNum===1?"1st Charleston":"2nd Charleston";

  return(<div style={S.pg}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <button onClick={home} style={S.back}>✕</button>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {mode==="daily"&&<span style={{fontSize:9,color:C.gold,fontWeight:700,background:C.gold+"12",padding:"2px 6px",borderRadius:8}}>DAILY</span>}
        <span style={{fontSize:10,color:C.mut,fontWeight:600}}>{charLabel} · {passIdx+1}/3</span>
      </div>
    </div>

    <div style={{display:"flex",gap:3,marginBottom:10}}>
      {[0,1,2].map(i=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<passIdx?C.jade:i===passIdx?(hasNewTiles?C.jade:C.gold):C.bdr}}/>)}
    </div>

    <div style={{textAlign:"center",marginBottom:10}}>
      <span style={{fontSize:22}}>{curPass.icon}</span>
      <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"2px 0"}}>Pass {curPass.dir}{isBlind?" (Blind)":""}</h2>
      <p style={{fontSize:12,color:hasNewTiles?C.jade:C.mut,fontWeight:hasNewTiles?600:400}}>
        {hasNewTiles?`✓ ${newIdx.length} new tile${newIdx.length!==1?"s":""} received`
        :isBlind?`Select 0 to ${curPass.max||3} tiles`:`Select ${curPass.req} tiles to pass`}
      </p>
    </div>

    {jokerWarn&&<JokerWarn/>}

    <div style={S.card}>
      <RackHeader hand={hand} onSort={()=>setHand(sortHand(hand))} showRef={showRef} onRef={()=>setShowRef(!showRef)}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
        {hand.map((t,i)=><Tile key={i} t={t} sel={sel.includes(i)} isNew={newIdx.includes(i)} dim={isJoker(t)&&!hasNewTiles} onClick={!hasNewTiles?()=>toggle(i):undefined}/>)}
      </div>
    </div>

    {showRef&&<CardGuide onClose={()=>setShowRef(false)}/>}

    {/* Pass / Continue */}
    {!hasNewTiles?(
      <>
        <div style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"5px 0"}}>{sel.length}/{isBlind?(curPass.max||3):curPass.req}</div>
        <button onClick={doPass} disabled={!canPass&&!(isBlind&&sel.length===0)}
          style={{...S.passBtn,opacity:canPass||(isBlind&&sel.length===0)?1:0.3}}>
          🔄 {isBlind&&sel.length===0?"Skip (pass 0)":`Pass ${sel.length} tile${sel.length!==1?"s":""} ${curPass.dir}`}
        </button>
      </>
    ):(
      <button onClick={continueAfterPass} style={{...S.greenBtn,width:"100%",marginTop:4}}>
        Ready for next pass →
      </button>
    )}

    {/* Hint (toggle, default hidden) */}
    {!hasNewTiles&&(
      <div style={{marginTop:8}}>
        <button onClick={()=>setShowHint(!showHint)} style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:8,padding:"6px 12px",fontSize:11,color:showHint?C.jade:C.mut,cursor:"pointer",fontWeight:600,width:"100%"}}>
          {showHint?"Hide Hint":"💡 Hint"}
        </button>
        {showHint&&(
          <div style={{marginTop:6}} className="rk-in">
            {currentEval.slice(0,4).map(s=>(
              <div key={s.id}>
                <button onClick={()=>setHintExpanded(hintExpanded===s.id?null:s.id)}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"6px 10px",marginBottom:2,borderRadius:8,
                    background:s.score>0.12?s.color+"08":C.bg2,border:`1px solid ${s.score>0.12?s.color+"20":C.bdr}`,cursor:"pointer"}}>
                  <span style={{fontSize:11,color:s.score>0.12?s.color:C.mut,fontWeight:600}}>{s.icon} {s.name} {(s.score*100).toFixed(0)}%</span>
                  <span style={{fontSize:10,color:C.mut}}>{hintExpanded===s.id?"▾":"▸"}</span>
                </button>
                {hintExpanded===s.id&&(
                  <div style={{padding:"6px 10px",marginBottom:4,fontSize:11,color:C.ink,lineHeight:1.6,background:"#fff",borderRadius:6,border:`1px solid ${C.bdr}`}} className="rk-in">
                    <div><span style={{color:C.jade,fontWeight:700}}>Hold:</span> {s.hold}</div>
                    <div><span style={{color:C.cinn,fontWeight:700}}>Pass:</span> {s.pass}</div>
                    <div style={{marginTop:2,fontSize:10,color:C.mut}}>{s.combos}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>);
}

function JokerWarn(){return(<div className="rk-in" style={{padding:"6px 10px",background:C.cinn+"08",borderRadius:8,border:`1px solid ${C.cinn}15`,textAlign:"center",marginBottom:6}}>
  <span style={{fontSize:11,color:C.cinn,fontWeight:600}}>🃏 Jokers cannot be passed!</span>
</div>);}

function RackHeader({hand,onSort,showRef,onRef}){
  return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
    <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK ({hand.length})</span>
    <div style={{display:"flex",gap:4}}>
      <button onClick={onSort} style={S.sortBtn}>Sort</button>
      {onRef&&<button onClick={onRef} style={{...S.sortBtn,background:showRef?C.jade+"10":"none",color:showRef?C.jade:C.mut,borderColor:showRef?C.jade+"30":C.bdr}}>📖 2026 Card</button>}
    </div>
  </div>);
}

// ── CARD GUIDE ─────────────────────────────────────────

function CardGuide({onClose}){
  const [exp,setExp]=useState(null);
  return(<div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30",maxHeight:400,overflowY:"auto"}} className="rk-in">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,position:"sticky",top:0,background:"#FFFFF8",paddingBottom:3,zIndex:1}}>
      <span style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700}}>📖 2026 CARD GUIDE</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer"}}>✕</button>
    </div>
    {SECS.map(s=>{const open=exp===s.id;return(<div key={s.id} style={{borderBottom:`1px solid ${C.bdr}`}}>
      <button onClick={()=>setExp(open?null:s.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"7px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:12}}>{s.icon}</span>
          <span style={{fontSize:11,fontWeight:600,color:C.ink}}>{s.name}</span>
          <span style={{fontSize:10,color:C.mut}}>— {s.desc}</span>
        </div>
        <span style={{fontSize:11,color:C.mut}}>{open?"▾":"▸"}</span>
      </button>
      {open&&(<div style={{paddingLeft:22,paddingBottom:8}} className="rk-in">
        <div style={{fontSize:9,color:C.mut,marginBottom:3}}>{"★".repeat(s.diff)}{"☆".repeat(5-s.diff)} · {s.hands} hands</div>
        <div style={{fontSize:11,lineHeight:1.7,color:C.ink}}>
          <div><span style={{color:C.jade,fontWeight:700}}>✓ Hold:</span> {s.hold}</div>
          <div><span style={{color:C.cinn,fontWeight:700}}>✗ Pass:</span> {s.pass}</div>
          <div><span style={{color:C.gold,fontWeight:700}}>💡 Key:</span> {s.combos}</div>
        </div>
      </div>)}
    </div>);})}
  </div>);
}

// ── RACK DISPLAY ───────────────────────────────────────

function RackDisplay({hand,label,showSort,onSort}){
  return(<div style={S.card}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>{label}</span>
      {showSort&&<button onClick={onSort} style={S.sortBtn}>Sort</button>}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><Tile key={i} t={t}/>)}</div>
  </div>);
}

// ── RESULT ─────────────────────────────────────────────

function ResultScreen({hand,passed,chosenSec,mode,home,restart}){
  const ev=evaluate(hand);const top=ev[0];const adv=getAdvice(hand,chosenSec);
  const chosenData=SECS.find(s=>s.id===chosenSec);
  const gi=top.score>=0.45?0:top.score>=0.35?1:top.score>=0.25?2:top.score>=0.18?3:top.score>=0.1?4:5;
  const grades=["A+","A","B+","B","C","D"];
  const emojis=["🌟","🏆","💪","👏","👍","🎲"];
  const gColors=[C.jade,C.jade,"#2B6CB0","#2B6CB0",C.gold,C.cinn];
  const g=grades[gi];const gc=gColors[gi];
  const isDaily=mode==="daily";const dn=getDayNum();

  const [copied,setCopied]=useState(false);
  const shareTxt=`🀄 Rackle ${isDaily?"#"+dn:""}\nGrade: ${g} ${emojis[gi]}\nSection: ${top.icon} ${top.name}\nplayrackle.com`;
  const copy=()=>{navigator.clipboard?.writeText(shareTxt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  return(<div style={S.pg}>
    <div style={{textAlign:"center",paddingTop:6,marginBottom:10}}>
      <div className={gi<=1?"rk-pop":""} style={{fontSize:38,marginBottom:3}}>{emojis[gi]}</div>
      <h2 style={{fontFamily:F.d,fontSize:22,color:C.ink,margin:0,fontWeight:800}}>{isDaily?`Daily Rackle #${dn}`:"Charleston Complete!"}</h2>
    </div>

    {/* Grade + Section */}
    <div style={{textAlign:"center",marginBottom:14}}>
      <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,borderRadius:18,background:gc+"12",border:`3px solid ${gc}35`,boxShadow:`0 4px 16px ${gc}15`}}>
        <span style={{fontFamily:F.d,fontSize:30,fontWeight:900,color:gc}}>{g}</span>
      </div>
      <div style={{marginTop:8}}>
        <div style={{fontSize:14,color:C.ink,fontWeight:600}}>Best fit: {top.icon} {top.name}</div>
        <div style={{fontSize:12,color:C.mut,marginTop:2}}>{(top.score*100).toFixed(0)}% section match · {passed.length} tiles passed</div>
      </div>
    </div>

    {/* Stats */}
    <div style={{...S.card,borderColor:adv.verdict==="Strong choice"?C.jade+"28":adv.verdict==="Playable but risky"?C.gold+"28":C.cinn+"25",
      background:adv.verdict==="Strong choice"?C.jade+"04":adv.verdict==="Playable but risky"?C.gold+"04":C.cinn+"04"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
        <span style={{fontSize:18}}>{adv.emoji}</span>
        <div><div style={{fontSize:13,fontWeight:700,color:C.ink}}>{adv.verdict}</div>
          <div style={{fontSize:11,color:C.mut}}>You chose: {chosenData?.icon} {chosenData?.name}</div></div>
      </div>
      <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"4px 0 0"}}>{adv.reason}</p>
      {adv.alts.length>0&&(<div style={{marginTop:8,paddingTop:6,borderTop:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:9,color:C.mut,fontWeight:700,marginBottom:3}}>ALSO CONSIDER:</div>
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

    {/* Share card */}
    <div style={S.shareCard}>
      <div style={{fontSize:8,color:C.jade,letterSpacing:4,fontWeight:700}}>RACKLE</div>
      <div style={{fontFamily:F.d,fontSize:24,color:C.ink,margin:"4px 0",fontWeight:900}}>{isDaily?"#"+dn+" ":""}{g}</div>
      <div style={{fontSize:13,color:C.mut}}>Section: {top.icon} {top.name}</div>
      <div style={{fontSize:12,color:C.jade,marginTop:8,fontWeight:600}}>How's your Charleston?</div>
      <div style={{fontSize:9,color:C.mut,marginTop:4,letterSpacing:2}}>PLAYRACKLE.COM</div>
    </div>
    <button onClick={copy} style={{...S.oBtn,width:"100%",marginTop:6,fontSize:11}}>{copied?"✓ Copied!":"📋 Copy & share"}</button>
    <div style={{display:"flex",gap:8,marginTop:8}}>
      <button onClick={home} style={{...S.oBtn,flex:1}}>Home</button>
      {!isDaily&&<button onClick={restart} style={{...S.greenBtn,flex:1}}>Deal Again</button>}
    </div>
  </div>);
}

// ── TOKENS ─────────────────────────────────────────────

const C={bg:"#FAF7F2",bg2:"#F2EDE5",ink:"#231F1B",mut:"#878075",jade:"#1D8A56",gold:"#B8943F",cinn:"#C83838",bdr:"#E5DFD5"};
const F={d:"'Fraunces',Georgia,serif",b:"'Nunito','Segoe UI',sans-serif"};

const CSS=`
*{box-sizing:border-box}
body{margin:0;background:#E8E2D8}
@keyframes rkIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}.rk-in{animation:rkIn .25s ease}
@keyframes rkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}.rk-float{animation:rkFloat 3s ease-in-out infinite}
@keyframes rkPop{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}.rk-pop{animation:rkPop 0.5s cubic-bezier(0.34,1.56,0.64,1)}
`;

const S={
  outer:{background:"#E8E2D8",minHeight:"100vh",display:"flex",justifyContent:"center"},
  app:{fontFamily:F.b,background:C.bg,minHeight:"100vh",color:C.ink,width:"100%",maxWidth:480,boxShadow:"0 0 40px rgba(0,0,0,0.08)"},
  pg:{padding:"10px 16px",paddingBottom:36},
  pill:{background:C.bg2,borderRadius:12,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  card:{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:12,padding:14,marginBottom:8},
  dot:{width:20,height:20,borderRadius:10,background:C.jade+"12",border:`1.5px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.jade,flexShrink:0},
  bigBtn:{width:"100%",padding:"14px 16px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,#C83838,#A82E2E)`,color:"#fff",display:"flex",alignItems:"center",gap:12,boxShadow:`0 4px 16px ${C.cinn}22`,marginBottom:8},
  passBtn:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,#C83838,#A82E2E)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1},
  greenBtn:{padding:"12px 0",background:`linear-gradient(135deg,${C.jade},#167A48)`,color:"#fff",border:"none",borderRadius:11,fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,cursor:"pointer"},
  oBtn:{padding:"10px 0",background:"none",color:C.mut,border:`1px solid ${C.bdr}`,borderRadius:11,fontSize:13,cursor:"pointer"},
  back:{background:"none",border:`1px solid ${C.bdr}`,color:C.mut,fontSize:11,padding:"4px 10px",borderRadius:8,cursor:"pointer",fontWeight:600},
  sortBtn:{background:"none",border:`1px solid ${C.bdr}`,borderRadius:6,padding:"2px 7px",fontSize:9,color:C.mut,cursor:"pointer",fontWeight:600},
  shareCard:{background:"linear-gradient(145deg,#FFFFF6,#F5F0E4)",border:`1.5px solid ${C.jade}20`,borderRadius:18,padding:"16px 20px",textAlign:"center",marginTop:8,boxShadow:"0 4px 18px rgba(0,0,0,0.04)"},
};
