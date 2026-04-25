import { useState, useEffect, useMemo } from "react";

/*
 * RACKLE v3 — Master Your Charleston
 * 2026 NMJL Card Edition
 *
 * CORRECT CHARLESTON ORDER:
 * First Charleston:  Right → Across → Left
 * Second Charleston (optional, vote): Left → Across → Right
 * Courtesy Pass (optional): Trade 0-3 tiles with player across
 *
 * Fixes: no reveal screens, instant swap, card reference,
 * proper dragons (Red/Green/Soap), sort toggle, tight grading
 */

// ── TILE SYSTEM ────────────────────────────────────────

function buildDeck() {
  const d = [];
  ["bam","crak","dot"].forEach(s => { for (let n = 1; n <= 9; n++) for (let i = 0; i < 4; i++) d.push({ t:"s", s, n }); });
  ["N","E","W","S"].forEach(v => { for (let i = 0; i < 4; i++) d.push({ t:"w", v }); });
  // Dragons: Red (中), Green (發), Soap/White (□)
  ["Red","Green","Soap"].forEach(v => { for (let i = 0; i < 4; i++) d.push({ t:"d", v }); });
  for (let i = 0; i < 8; i++) d.push({ t:"f" }); // flowers
  for (let i = 0; i < 8; i++) d.push({ t:"j" }); // jokers
  return d; // 152 tiles
}

function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

function seededShuffle(arr, seed) {
  const a=[...arr]; let s=seed;
  for(let i=a.length-1;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function autoSort(tiles) {
  const o={s:0,f:1,w:2,d:3,j:4};
  const so={bam:0,crak:1,dot:2};
  const dro={Red:0,Green:1,Soap:2};
  return [...tiles].sort((a,b) => {
    if(o[a.t]!==o[b.t]) return o[a.t]-o[b.t];
    if(a.t==="s"){if(a.s!==b.s)return so[a.s]-so[b.s]; return a.n-b.n;}
    if(a.t==="d") return (dro[a.v]||0)-(dro[b.v]||0);
    return 0;
  });
}

function tLabel(t) {
  if(t.t==="j") return "🃏";
  if(t.t==="f") return "🌸";
  if(t.t==="w") return t.v;
  if(t.t==="d") return t.v==="Red"?"中":t.v==="Green"?"發":"□";
  return `${t.n}`;
}
function tSub(t) {
  if(t.t==="j") return "Joker";
  if(t.t==="f") return "Flower";
  if(t.t==="w") return "Wind";
  if(t.t==="d") return t.v==="Soap"?"Soap":t.v;
  return {bam:"Bam",crak:"Crk",dot:"Dot"}[t.s];
}
function tColor(t) {
  if(t.t==="j") return "#B8943F";
  if(t.t==="f") return "#C75B8E";
  if(t.t==="w") return "#5C5247";
  if(t.t==="d") return t.v==="Red"?"#C83838":t.v==="Green"?"#1D8A56":"#7A7570";
  return {bam:"#1D8A56",crak:"#C83838",dot:"#2B6CB0"}[t.s];
}
function tBg(t) {
  if(t.t==="j") return "linear-gradient(145deg,#FFF9E8,#FFF3D0)";
  if(t.t==="f") return "linear-gradient(145deg,#FFF5F9,#FFE8F0)";
  if(t.t==="d"&&t.v==="Soap") return "linear-gradient(145deg,#F8F8F8,#EEEEEE)";
  return "linear-gradient(145deg,#FFFFFF,#F8F6F2)";
}
function tImp(t) {
  if(t.t==="j") return 10;
  if(t.t==="f") return 9;
  if(t.t==="s"&&t.n===6) return 8;
  if(t.t==="s"&&t.n===2) return 7;
  if(t.t==="d"&&t.v==="Soap") return 7;
  if(t.t==="d") return 6;
  if(t.t==="s"&&[3,5,7,9].includes(t.n)) return 5;
  if(t.t==="s"&&[4,8].includes(t.n)) return 5;
  if(t.t==="w") return 4;
  if(t.t==="s"&&t.n===1) return 2;
  return 3;
}

// ── TILE COMPONENT ─────────────────────────────────────

function MjTile({t,sel,isNew,onClick,heat,dealing,idx}) {
  const c=tColor(t); const imp=tImp(t);
  const hC=heat?(imp>=8?"#1D8A56":imp>=5?"#B8943F":"#C8383855"):null;
  return (
    <button onClick={onClick} className={dealing?"tile-deal":""} style={{
      width:38,height:52,borderRadius:7,cursor:onClick?"pointer":"default",
      background:sel?`linear-gradient(145deg,${c}15,${c}08)`:isNew?"linear-gradient(145deg,#FFFBE8,#FFF6D4)":tBg(t),
      border:`2px solid ${sel?c:isNew?"#B8943F":hC||"#D5CFC5"}`,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:0,flexShrink:0,position:"relative",overflow:"hidden",
      boxShadow:sel?`0 4px 14px ${c}30,inset 0 1px 0 rgba(255,255,255,0.8)`:isNew?`0 3px 10px rgba(184,148,63,0.2)`:`0 2px 4px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,0.9)`,
      transform:sel?"translateY(-6px) scale(1.06)":"none",
      transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
      animationDelay:dealing?`${(idx||0)*60}ms`:undefined,
    }}>
      {t.t==="s"&&<span style={{position:"absolute",top:1,right:3,fontSize:7,color:c,opacity:0.2,fontWeight:700}}>
        {{bam:"竹",crak:"萬",dot:"筒"}[t.s]}
      </span>}
      <span style={{fontSize:t.t==="f"||t.t==="j"?16:t.t==="d"?14:17,fontWeight:800,color:c,lineHeight:1,fontFamily:t.t==="d"?"serif":F.d}}>{tLabel(t)}</span>
      <span style={{fontSize:7,color:c,opacity:0.55,fontWeight:700,marginTop:1,letterSpacing:0.5}}>{tSub(t)}</span>
      {sel&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c}}/>}
    </button>
  );
}

// ── 2026 SECTIONS ──────────────────────────────────────

const SECS = [
  { id:"2026",name:"2026",color:"#C75B8E",icon:"📅",
    desc:"Year hands using 2s, 0s (Soap), 2s, 6s",
    tip:"Hold 2s, 6s, and Soap. Pass 1s and 9s.",
    check:h=>{const s=h.filter(x=>x.t==="s");const t2=s.filter(x=>x.n===2).length;const t6=s.filter(x=>x.n===6).length;
      const soap=h.filter(x=>x.t==="d"&&x.v==="Soap").length;const fl=h.filter(x=>x.t==="f").length;const jk=h.filter(x=>x.t==="j").length;
      const irr=s.filter(x=>![2,6].includes(x.n)).length;
      return Math.max(0,Math.min((t2*0.08+t6*0.08+soap*0.1+fl*0.02+jk*0.02)-irr*0.04,1));}},
  { id:"2468",name:"2468",color:"#C83838",icon:"🔴",
    desc:"Even numbers only: 2, 4, 6, 8",
    tip:"Richest section. 2+6 strongest pairing (110 hands). Build kongs of evens.",
    check:h=>{const s=h.filter(x=>x.t==="s");const ev=s.filter(x=>x.n%2===0);const od=s.filter(x=>x.n%2===1);
      const fl=h.filter(x=>x.t==="f").length;const jk=h.filter(x=>x.t==="j").length;const h26=ev.some(x=>x.n===2)&&ev.some(x=>x.n===6);
      return Math.max(0,Math.min(ev.length*0.07+(h26?0.1:0)+fl*0.02+jk*0.02-od.length*0.05-h.filter(x=>x.t==="w").length*0.03,1));}},
  { id:"369",name:"369",color:"#CC5C87",icon:"💗",
    desc:"Multiples of 3 only: 3, 6, 9",
    tip:"Every hand uses 6s. 3+9 = 102 hands. Cluster 3/6/9 across suits.",
    check:h=>{const s=h.filter(x=>x.t==="s");const m3=s.filter(x=>x.n%3===0);const non=s.filter(x=>x.n%3!==0);
      const fl=h.filter(x=>x.t==="f").length;const jk=h.filter(x=>x.t==="j").length;
      return Math.max(0,Math.min(m3.length*0.08+(m3.some(x=>x.n===6)?0.08:0)+fl*0.02+jk*0.02-non.length*0.04,1));}},
  { id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",
    desc:"Odd numbers only: 1, 3, 5, 7, 9",
    tip:"5 is most versatile. Commit to odds early. Save 5 over 1.",
    check:h=>{const s=h.filter(x=>x.t==="s");const od=s.filter(x=>x.n%2===1);const ev=s.filter(x=>x.n%2===0);
      const jk=h.filter(x=>x.t==="j").length;
      return Math.max(0,Math.min(od.length*0.07+h.filter(x=>x.t==="w").length*0.02+jk*0.02-ev.length*0.05,1));}},
  { id:"cr",name:"Consec. Run",color:"#1D8A56",icon:"🟢",
    desc:"Sequential tiles: 1-2-3, 4-5-6, 7-8-9 across suits",
    tip:"Most expansive section. Consecutive numbers in 2+ suits opens many hands.",
    check:h=>{const bs={};h.filter(x=>x.t==="s").forEach(x=>{if(!bs[x.s])bs[x.s]=new Set();bs[x.s].add(x.n);});
      let mr=0;Object.values(bs).forEach(s=>{const a=[...s].sort((a,b)=>a-b);let r=1;for(let i=1;i<a.length;i++){if(a[i]===a[i-1]+1)r++;else{mr=Math.max(mr,r);r=1;}}mr=Math.max(mr,r);});
      const fl=h.filter(x=>x.t==="f").length;const jk=h.filter(x=>x.t==="j").length;const hon=h.filter(x=>x.t==="w"||x.t==="d").length;
      return Math.max(0,Math.min((mr>=3?mr*0.12:mr*0.05)+Object.keys(bs).length*0.03+fl*0.02+jk*0.02-hon*0.03,1));}},
  { id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",
    desc:"Wind tiles (N/E/W/S) and Dragon tiles (Red/Green/Soap)",
    tip:"Need 5+ honors. If no path by draw 5, winds become safe throws.",
    check:h=>{const wi=h.filter(x=>x.t==="w").length;const dr=h.filter(x=>x.t==="d").length;const fl=h.filter(x=>x.t==="f").length;
      const jk=h.filter(x=>x.t==="j").length;const suits=h.filter(x=>x.t==="s").length;
      return Math.max(0,Math.min((wi+dr)*0.08+fl*0.02+jk*0.02-suits*0.03,1));}},
  { id:"aln",name:"Like Numbers",color:"#2B6CB0",icon:"🔵",
    desc:"All number tiles share the same value across suits",
    tip:"Need 4+ of one number. Refuge when nothing materializes.",
    check:h=>{const n=h.filter(x=>x.t==="s");const c={};n.forEach(x=>{c[x.n]=(c[x.n]||0)+1;});
      const mx=Math.max(0,...Object.values(c));const tot=Object.keys(c).length;const fl=h.filter(x=>x.t==="f").length;const jk=h.filter(x=>x.t==="j").length;
      return Math.max(0,Math.min((mx>=4?mx*0.1:mx*0.04)+fl*0.02+jk*0.02-Math.max(0,tot-3)*0.04,1));}},
  { id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",
    desc:"Five of the same tile (requires jokers)",
    tip:"Need 2+ jokers minimum. Most tile-intensive section.",
    check:h=>{const jk=h.filter(x=>x.t==="j").length;const n=h.filter(x=>x.t==="s");const c={};
      n.forEach(x=>{const k=`${x.s}${x.n}`;c[k]=(c[k]||0)+1;});const mx=Math.max(0,...Object.values(c));const tot=mx+jk;
      if(tot>=5)return Math.min(0.65+jk*0.04,1);if(jk>=2&&mx>=3)return 0.45;return Math.max(0,tot*0.06-0.1);}},
  { id:"sp",name:"Singles & Pairs",color:"#3AA89A",icon:"🩵",
    desc:"Only singles and pairs — no 3-of-a-kind or more",
    tip:"All concealed. Charleston matters most. No rescue from claims.",
    check:h=>{const c={};h.forEach(x=>{const k=JSON.stringify(x);c[k]=(c[k]||0)+1;});
      const pr=Object.values(c).filter(v=>v===2).length;const tr=Object.values(c).filter(v=>v>=3).length;const fl=h.filter(x=>x.t==="f").length;
      return Math.max(0,Math.min(pr*0.08+fl*0.02-tr*0.1,1));}},
];

function evaluate(h){return SECS.map(s=>({...s,score:s.check(h)})).sort((a,b)=>b.score-a.score);}

// ── HELPERS ────────────────────────────────────────────

function getDailySeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function getDayNum(){return Math.floor((Date.now()-new Date(2026,3,24).getTime())/86400000)+1;}

function buildShare(ps,grade,dayNum,isDaily,top){
  const blk=v=>v>=0.7?"🟩":v>=0.4?"🟨":"⬜";
  const blocks=ps.map(blk).join("");
  const pre=isDaily?`🀄 Rackle #${dayNum}`:"🀄 Rackle";
  const sec=top?`→ ${top.name} (${(top.score*100).toFixed(0)}%)`:"";
  return `${pre}\n${blocks}  ${grade}\n${sec}\nplayrackle.com`;
}

const mem={};
const ST={
  get(k,d){try{const v=localStorage.getItem("rk3-"+k);return v?JSON.parse(v):d;}catch{return mem[k]!==undefined?mem[k]:d;}},
  set(k,v){try{localStorage.setItem("rk3-"+k,JSON.stringify(v));}catch{mem[k]=v;}},
};

// ── APP ────────────────────────────────────────────────

export default function Rackle(){
  const [screen,setScreen]=useState("home");
  const [mode,setMode]=useState("free");
  const [rounds,setRounds]=useState(ST.get("rds",0));
  const [bestG,setBestG]=useState(ST.get("bg",null));
  const [streak,setStreak]=useState(ST.get("sk",0));
  const [lastDay,setLastDay]=useState(ST.get("ld",null));
  const [dailyDone,setDailyDone]=useState(ST.get("dd",null)===getDailySeed());
  const [dailyGrade,setDailyGrade]=useState(ST.get("dg",null));
  const [dailyShare,setDailyShare]=useState(ST.get("ds",null));

  const onFinish=(gi,ps,isDaily,top)=>{
    const grades=["A+","A","B+","B","C","D"];
    const g=grades[gi]||"C";
    setRounds(r=>{const n=r+1;ST.set("rds",n);return n;});
    if(bestG===null||gi<bestG){setBestG(gi);ST.set("bg",gi);}
    const today=getDailySeed();
    if(lastDay!==today){
      const y=new Date();y.setDate(y.getDate()-1);
      const yS=y.getFullYear()*10000+(y.getMonth()+1)*100+y.getDate();
      const ns=lastDay===yS?streak+1:1;
      setStreak(ns);setLastDay(today);ST.set("sk",ns);ST.set("ld",today);
    }
    if(isDaily){setDailyDone(true);ST.set("dd",today);setDailyGrade(g);ST.set("dg",g);
      const sh=buildShare(ps,g,getDayNum(),true,top);setDailyShare(sh);ST.set("ds",sh);}
  };

  return(
    <div className="rackle-outer" style={S.app}>
      <div className="rackle-inner">
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800;9..144,900&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      {screen==="home"&&<Home go={m=>{setMode(m);setScreen("play");}} rounds={rounds} bestG={bestG} streak={streak} dailyDone={dailyDone} dailyGrade={dailyGrade} dailyShare={dailyShare}/>}
      {screen==="play"&&<Play mode={mode} home={()=>setScreen("home")} onFinish={onFinish}/>}
      </div>
    </div>
  );
}

// ── HOME ───────────────────────────────────────────────

function Home({go,rounds,bestG,streak,dailyDone,dailyGrade,dailyShare}){
  const grades=["A+","A","B+","B","C","D"];
  const [copied,setCopied]=useState(false);
  const copy=()=>{if(dailyShare)navigator.clipboard?.writeText(dailyShare).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  return(
    <div style={S.pg}>
      <div style={{textAlign:"center",paddingTop:20,marginBottom:18}}>
        <div className="tile-float" style={{fontSize:38,marginBottom:6}}>🀄</div>
        <h1 className="rk-title" style={{fontFamily:F.d,fontSize:36,color:C.ink,margin:0,fontWeight:900,letterSpacing:-1}}>Rackle</h1>
        <div style={{display:"inline-block",padding:"3px 12px",borderRadius:20,background:C.jade+"12",border:`1px solid ${C.jade}30`,marginTop:6}}>
          <span style={{fontSize:10,color:C.jade,fontWeight:700,letterSpacing:3}}>2026 NMJL EDITION</span>
        </div>
        <p style={{color:C.mut,fontSize:13,marginTop:8,lineHeight:1.5}}>Practice the Charleston. Get graded. Share your score.</p>
      </div>

      {rounds>0&&(
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <SPill icon="🎲" val={rounds} label="PLAYED"/>
          <SPill icon="🔥" val={streak} label="STREAK" hl={streak>0}/>
          {bestG!==null&&<SPill icon="🏆" val={grades[bestG]} label="BEST"/>}
        </div>
      )}

      <button onClick={()=>!dailyDone&&go("daily")} disabled={dailyDone}
        style={{...S.card,width:"100%",cursor:dailyDone?"default":"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:dailyDone?C.jade+"30":C.gold+"40",background:dailyDone?C.jade+"04":"linear-gradient(135deg,#FFFDF6,#FFF8E8)"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{fontSize:14}}>📅</span>
            <span style={{fontFamily:F.d,fontSize:16,fontWeight:700,color:C.ink}}>Daily Rackle #{getDayNum()}</span>
          </div>
          <div style={{fontSize:11,color:C.mut}}>{dailyDone?`Done! Grade: ${dailyGrade}`:"Same hand for everyone. One shot."}</div>
        </div>
        {dailyDone?<span style={{fontSize:20}}>✅</span>:<span style={{fontSize:13,color:C.gold,fontWeight:700}}>Play →</span>}
      </button>

      {dailyDone&&dailyShare&&<button onClick={copy} style={{...S.oBtn,width:"100%",fontSize:11,marginBottom:6}}>{copied?"✓ Copied!":"📋 Copy result to share"}</button>}

      <button onClick={()=>go("free")} style={S.bigBtn}>
        <span style={{fontSize:20}}>🎲</span>
        <div style={{textAlign:"left"}}><div style={{fontFamily:F.d,fontSize:17,fontWeight:700}}>Free Play</div><div style={{fontSize:11,opacity:0.85,marginTop:1}}>Random deal. Practice anytime.</div></div>
      </button>

      <div style={{...S.card,background:C.jade+"05",borderColor:C.jade+"15",marginTop:4}}>
        <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:4}}>💡 2026 CARD</div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:0}}><strong>6 appears in 40% of all hands.</strong> Flowers in 35%. Hold both. Pass 1s freely.</p>
      </div>

      {rounds===0&&(
        <div style={S.card}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>THE CHARLESTON</div>
          {["Pass 3 tiles → Right","Pass 3 tiles ↕ Across","Pass 3 tiles ← Left","Optional: Do a 2nd Charleston (reverse order)","Optional: Courtesy trade (0-3 tiles across)"].map((s,i)=>
            <div key={i} style={{display:"flex",gap:8,marginBottom:5}}><div style={S.dot}>{i+1}</div><span style={{fontSize:12,color:C.mut}}>{s}</span></div>
          )}
        </div>
      )}

      <div style={{textAlign:"center",padding:"16px 0 4px",borderTop:`1px solid ${C.bdr}`,marginTop:12}}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2}}>POWERED BY</div>
        <div style={{fontFamily:F.d,fontSize:12,color:C.jade,letterSpacing:2,marginTop:2}}>TILETRACKER</div>
      </div>
    </div>
  );
}

function SPill({icon,val,label,hl}){
  return <div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}}>
    <span style={{fontSize:14}}>{icon}</span>
    <div><div style={{fontSize:16,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{val}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{label}</div></div>
  </div>;
}

// ── PLAY ───────────────────────────────────────────────

/*
 * Phases:
 * c1-right, c1-across, c1-left     (1st Charleston)
 * vote                              (do 2nd Charleston?)
 * c2-left, c2-across, c2-right     (2nd Charleston, reversed)
 * courtesy                          (optional 0-3 trade across)
 * result
 */

const PHASE_INFO = {
  "c1-right":  {n:1,total:3,ch:1,label:"Pass Right →",icon:"👉",tip:"Scan your hand. What section could form? Pass outliers — tiles that don't match any pattern."},
  "c1-across": {n:2,total:3,ch:1,label:"↕ Pass Across",icon:"↕️",tip:"You've seen 3 new tiles. Is a section emerging? Pass tiles that fight your direction."},
  "c1-left":   {n:3,total:3,ch:1,label:"← Pass Left",icon:"👈",tip:"Last pass of the first Charleston. Commit to your strongest section now."},
  "c2-left":   {n:1,total:3,ch:2,label:"← Pass Left",icon:"👈",tip:"Second Charleston — passes go in reverse. Refine your hand further."},
  "c2-across": {n:2,total:3,ch:2,label:"↕ Pass Across",icon:"↕️",tip:"Keep sharpening. Pass anything that doesn't serve your target section."},
  "c2-right":  {n:3,total:3,ch:2,label:"Pass Right →",icon:"👉",tip:"Final pass of the second Charleston. Your hand should be nearly focused."},
};

function Play({mode,home,onFinish}){
  const [phase,setPhase]=useState("deal");
  const [hand,setHand]=useState([]);
  const [orig,setOrig]=useState([]);
  const [pool,setPool]=useState([]);
  const [sel,setSel]=useState([]);
  const [passed,setPassed]=useState([]);
  const [newIdx,setNewIdx]=useState([]);
  const [heat,setHeat]=useState(false);
  const [passScores,setPassScores]=useState([]);
  const [showRef,setShowRef]=useState(false);
  const [courtesyCount,setCourtesyCount]=useState(null);

  useEffect(()=>{
    const deck=mode==="daily"?seededShuffle(buildDeck(),getDailySeed()):shuffle(buildDeck());
    const dealt=autoSort(deck.slice(0,13));
    setHand(dealt);setOrig([...dealt]);setPool(deck.slice(13));
    setTimeout(()=>setPhase("c1-right"),700);
  },[]);

  const toggle=(i)=>{
    if(!PHASE_INFO[phase]&&phase!=="courtesy") return;
    const max=phase==="courtesy"?(courtesyCount||0):3;
    setSel(p=>p.includes(i)?p.filter(x=>x!==i):p.length>=max?p:[...p,i]);
  };

  const doPass=()=>{
    if(phase==="courtesy"){
      if(sel.length===0){setPhase("result");return;}
      // Trade selected tiles across
      const pt=sel.map(i=>hand[i]);
      setPassed(p=>[...p,...pt]);
      const remaining=hand.filter((_,i)=>!sel.includes(i));
      const incoming=pool.slice(0,sel.length);
      const np=pool.slice(sel.length);
      setPool(np);
      const combined=autoSort([...remaining,...incoming]);
      recordPassQuality(hand,combined);
      setHand(combined);setSel([]);setNewIdx([]);
      setPhase("result");
      return;
    }
    if(sel.length!==3) return;
    const pt=sel.map(i=>hand[i]);
    setPassed(p=>[...p,...pt]);
    const remaining=hand.filter((_,i)=>!sel.includes(i));
    const incoming=pool.slice(0,3);
    const np=pool.slice(3);
    setPool(np);
    const combined=autoSort([...remaining,...incoming]);
    // Find new tiles
    const temp=[...remaining];const ni=[];
    combined.forEach((t,i)=>{const idx=temp.findIndex(r=>JSON.stringify(r)===JSON.stringify(t));if(idx===-1)ni.push(i);else temp.splice(idx,1);});
    recordPassQuality(hand,combined);
    setNewIdx(ni);setHand(combined);setSel([]);
    // Advance phase
    const next={"c1-right":"c1-across","c1-across":"c1-left","c1-left":"vote","c2-left":"c2-across","c2-across":"c2-right","c2-right":"courtesy"};
    setPhase(next[phase]||"result");
  };

  const recordPassQuality=(before,after)=>{
    const bs=evaluate(before)[0].score;const as=evaluate(after)[0].score;
    const imp=as-bs;
    const q=imp>0.08?0.85:imp>0?0.5:imp>-0.05?0.3:0.1;
    setPassScores(ps=>[...ps,q]);
  };

  const doSort=()=>{setHand(autoSort(hand));setNewIdx([]);setSel([]);};

  const restart=()=>{
    const deck=shuffle(buildDeck());const dealt=autoSort(deck.slice(0,13));
    setHand(dealt);setOrig([...dealt]);setPool(deck.slice(13));
    setSel([]);setPassed([]);setNewIdx([]);setHeat(false);setPassScores([]);setCourtesyCount(null);
    setPhase("deal");setTimeout(()=>setPhase("c1-right"),700);
  };

  if(phase==="deal"){
    return <div style={S.pg}><div style={{textAlign:"center",paddingTop:50}}>
      <div style={{fontSize:32,marginBottom:10}}>🎲</div>
      <h2 style={{fontFamily:F.d,fontSize:20,color:C.ink}}>Dealing tiles...</h2>
      <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center",marginTop:16}}>
        {hand.map((t,i)=><MjTile key={i} t={t} idx={i} dealing/>)}
      </div>
    </div></div>;
  }

  if(phase==="result"){
    return <Result hand={hand} orig={orig} passed={passed} passScores={passScores} mode={mode} home={home} restart={restart} onFinish={onFinish}/>;
  }

  // Vote screen
  if(phase==="vote"){
    return(
      <div style={S.pg}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <button onClick={home} style={S.back}>✕</button>
          <span style={{fontSize:11,color:C.mut,fontWeight:600}}>1st Charleston complete</span>
        </div>
        <div style={{textAlign:"center",paddingTop:16}}>
          <div style={{fontSize:28,marginBottom:6}}>🤔</div>
          <h2 style={{fontFamily:F.d,fontSize:22,color:C.ink,margin:"0 0 6px"}}>Second Charleston?</h2>
          <p style={{color:C.mut,fontSize:13,lineHeight:1.5,marginBottom:16}}>In real play, all 4 players vote. If anyone says no, you skip to the courtesy pass. Here, it's your choice.</p>
          <div style={{...S.card,padding:12,marginBottom:10}}>
            <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:6}}>YOUR HAND</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
              {hand.map((t,i)=><MjTile key={i} t={t}/>)}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setPhase("courtesy")} style={{...S.oBtn,flex:1}}>Skip → Courtesy</button>
            <button onClick={()=>setPhase("c2-left")} style={{...S.greenBtn,flex:1}}>Yes, do 2nd</button>
          </div>
        </div>
      </div>
    );
  }

  // Courtesy pass
  if(phase==="courtesy"){
    return(
      <div style={S.pg}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <button onClick={home} style={S.back}>✕</button>
          <span style={{fontSize:11,color:C.mut,fontWeight:600}}>Courtesy Pass</span>
        </div>
        <div style={{textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:24,marginBottom:4}}>🤝</div>
          <h2 style={{fontFamily:F.d,fontSize:20,color:C.ink,margin:"0 0 4px"}}>Courtesy Pass</h2>
          <p style={{color:C.mut,fontSize:12}}>Trade 0, 1, 2, or 3 tiles with the player across.</p>
        </div>

        {courtesyCount===null?(
          <div>
            <p style={{fontSize:13,color:C.ink,textAlign:"center",marginBottom:12}}>How many tiles do you want to trade?</p>
            <div style={{display:"flex",gap:6}}>
              {[0,1,2,3].map(n=>
                <button key={n} onClick={()=>{if(n===0){setPhase("result");}else{setCourtesyCount(n);setSel([]);}}}
                  style={{...S.card,flex:1,cursor:"pointer",textAlign:"center",padding:14}}>
                  <div style={{fontFamily:F.d,fontSize:22,color:n===0?C.mut:C.ink,fontWeight:700}}>{n}</div>
                  <div style={{fontSize:10,color:C.mut}}>{n===0?"Skip":"tile"+(n>1?"s":"")}</div>
                </button>
              )}
            </div>
          </div>
        ):(
          <div>
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700}}>SELECT {courtesyCount} TILE{courtesyCount>1?"S":""}</span>
                <button onClick={doSort} style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:6,padding:"2px 8px",fontSize:9,color:C.mut,cursor:"pointer",fontWeight:600}}>Sort</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
                {hand.map((t,i)=><MjTile key={i} t={t} sel={sel.includes(i)} onClick={()=>toggle(i)}/>)}
              </div>
            </div>
            <div style={{textAlign:"center",fontSize:13,color:sel.length===courtesyCount?C.jade:C.mut,fontWeight:600,margin:"6px 0"}}>{sel.length}/{courtesyCount}</div>
            <button onClick={doPass} disabled={sel.length!==courtesyCount}
              style={{...S.passBtn,opacity:sel.length===courtesyCount?1:0.3}}>🔄 Trade</button>
          </div>
        )}
      </div>
    );
  }

  // Pass phases
  const pi=PHASE_INFO[phase]||{};
  const curEval=evaluate(hand);

  return(
    <div style={S.pg}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <button onClick={home} style={S.back}>✕</button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {mode==="daily"&&<span style={{fontSize:9,color:C.gold,fontWeight:700,background:C.gold+"12",padding:"2px 7px",borderRadius:10}}>DAILY</span>}
          <span style={{fontSize:11,color:C.mut,fontWeight:600}}>{pi.ch===2?"2nd ":""}Pass {pi.n}/{pi.total}</span>
        </div>
      </div>

      <div style={{display:"flex",gap:3,marginBottom:10}}>
        {Array.from({length:pi.total}).map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<pi.n-1?C.jade:i===pi.n-1?C.gold:C.bdr}}/>)}
      </div>

      <div style={{textAlign:"center",marginBottom:10}}>
        <span style={{fontSize:22}}>{pi.icon}</span>
        <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"2px 0"}}>{pi.label}</h2>
        {pi.ch===2&&<div style={{fontSize:10,color:C.cinn,fontWeight:600}}>Second Charleston</div>}
        <p style={{fontSize:12,color:C.mut}}>Tap 3 tiles to pass</p>
      </div>

      {/* Hand */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK</span>
          <div style={{display:"flex",gap:4}}>
            <button onClick={doSort} style={{background:"none",border:`1px solid ${C.bdr}`,borderRadius:6,padding:"2px 8px",fontSize:9,color:C.mut,cursor:"pointer",fontWeight:600}}>Sort</button>
            <button onClick={()=>setHeat(!heat)} style={{background:heat?C.jade+"10":"none",border:`1px solid ${heat?C.jade+"30":C.bdr}`,borderRadius:6,padding:"2px 8px",fontSize:9,color:heat?C.jade:C.mut,cursor:"pointer",fontWeight:600}}>
              {heat?"🔥":"Heat"}
            </button>
            <button onClick={()=>setShowRef(!showRef)} style={{background:showRef?C.gold+"10":"none",border:`1px solid ${showRef?C.gold+"30":C.bdr}`,borderRadius:6,padding:"2px 8px",fontSize:9,color:showRef?C.gold:C.mut,cursor:"pointer",fontWeight:600}}>
              📋
            </button>
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
          {hand.map((t,i)=><MjTile key={i} t={t} sel={sel.includes(i)} isNew={newIdx.includes(i)} onClick={()=>toggle(i)} heat={heat}/>)}
        </div>
        {heat&&<div style={{display:"flex",gap:8,justifyContent:"center",marginTop:5,fontSize:8,color:C.mut}}>
          <span>🟢 Keep</span><span>🟡 Flex</span><span>🔴 Pass</span>
        </div>}
      </div>

      {/* Card reference panel */}
      {showRef&&(
        <div style={{...S.card,background:"#FFFFF8",borderColor:C.gold+"30"}} className="tt-in">
          <div style={{fontSize:8,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:6}}>📋 2026 CARD SECTIONS</div>
          {SECS.map(s=>(
            <div key={s.id} style={{display:"flex",gap:6,alignItems:"flex-start",padding:"5px 0",borderBottom:`1px solid ${C.bdr}`}}>
              <span style={{fontSize:12}}>{s.icon}</span>
              <div><span style={{fontSize:11,fontWeight:600,color:C.ink}}>{s.name}</span><span style={{fontSize:10,color:C.mut}}> — {s.desc}</span></div>
            </div>
          ))}
        </div>
      )}

      <div style={{textAlign:"center",fontSize:13,color:sel.length===3?C.jade:C.mut,fontWeight:700,margin:"6px 0"}}>{sel.length}/3 selected</div>

      <button onClick={doPass} disabled={sel.length!==3}
        style={{...S.passBtn,opacity:sel.length===3?1:0.3}}>
        🔄 Pass {sel.length===3?"tiles":`(${3-sel.length} more)`}
      </button>

      {/* Section fit */}
      <div style={{marginTop:8}}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:4}}>CURRENT FIT</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
          {curEval.slice(0,4).map(s=>(
            <div key={s.id} style={{fontSize:9,padding:"3px 7px",borderRadius:6,background:s.score>0.2?s.color+"10":C.bg2,border:`1px solid ${s.score>0.2?s.color+"28":C.bdr}`,color:s.score>0.2?s.color:C.mut,fontWeight:600}}>
              {s.icon} {s.name} {(s.score*100).toFixed(0)}%
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:8,padding:10,background:C.jade+"05",borderRadius:8,border:`1px solid ${C.jade}10`}}>
        <div style={{fontSize:9,color:C.jade,fontWeight:700,letterSpacing:1}}>💡 TIP</div>
        <div style={{fontSize:11,color:C.mut,lineHeight:1.5,marginTop:2}}>{pi.tip}</div>
      </div>
    </div>
  );
}

// ── RESULT ─────────────────────────────────────────────

function Result({hand,orig,passed,passScores,mode,home,restart,onFinish}){
  const fe=evaluate(hand);const oe=evaluate(orig);
  const top=fe[0];const topO=oe[0];
  const improved=top.score>topO.score;
  const strong=fe.filter(s=>s.score>0.15).slice(0,3);

  const sc=top.score;
  const gi=sc>=0.55?0:sc>=0.45?1:sc>=0.35?2:sc>=0.25?3:sc>=0.15?4:5;
  const grades=["A+","A","B+","B","C","D"];
  const emojis=["🌟","🏆","💪","👏","👍","🎲"];
  const gColors=[C.jade,C.jade,"#2B6CB0","#2B6CB0",C.gold,C.cinn];
  const g=grades[gi];const gc=gColors[gi];
  const isDaily=mode==="daily";

  useEffect(()=>{onFinish(gi,passScores,isDaily,top);},[]);

  const warnings=[];
  passed.forEach(t=>{
    if(t.t==="f")warnings.push({t,r:"Flowers in 35% of 2026 hands"});
    else if(t.t==="j")warnings.push({t,r:"Jokers are always precious"});
    else if(t.t==="s"&&t.n===6)warnings.push({t,r:"6 is in 40% of 2026 hands"});
  });

  const shareText=buildShare(passScores,g,getDayNum(),isDaily,top);
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard?.writeText(shareText).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};

  return(
    <div style={S.pg}>
      <div style={{textAlign:"center",paddingTop:6,marginBottom:10}}>
        <div className={gi<=1?"confetti":""} style={{fontSize:40,marginBottom:2}}>{emojis[gi]}</div>
        <h2 style={{fontFamily:F.d,fontSize:24,color:C.ink,margin:0,fontWeight:800}}>{isDaily?`Daily #${getDayNum()}`:"Charleston Complete!"}</h2>
      </div>

      <div style={{textAlign:"center",marginBottom:12}}>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:58,height:58,borderRadius:16,background:gc+"12",border:`3px solid ${gc}40`,boxShadow:`0 4px 18px ${gc}18`}}>
          <span style={{fontFamily:F.d,fontSize:28,fontWeight:900,color:gc}}>{g}</span>
        </div>
        <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:8}}>
          {passScores.map((ps,i)=><div key={i} style={{width:24,height:24,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,background:ps>=0.7?C.jade+"15":ps>=0.4?C.gold+"15":"#f5f0e8",border:`1px solid ${ps>=0.7?C.jade+"30":ps>=0.4?C.gold+"30":C.bdr}`}}>{ps>=0.7?"🟩":ps>=0.4?"🟨":"⬜"}</div>)}
        </div>
        <div style={{fontSize:8,color:C.mut,marginTop:3}}>{passScores.length<=3?"1st Charleston":"1st + 2nd Charleston"}{passScores.length%3!==0?" + Courtesy":""}</div>
      </div>

      <div style={S.card}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:6}}>FINAL RACK</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{hand.map((t,i)=><MjTile key={i} t={t}/>)}</div>
      </div>

      <div style={S.card}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:8}}>2026 CARD FIT</div>
        {strong.length===0?<p style={{fontSize:12,color:C.mut}}>No strong fit. Tough draw!</p>:
          strong.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.bdr}`}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:12}}>{s.icon}</span>
                <div><div style={{fontSize:12,fontWeight:600,color:C.ink}}>{s.name}</div><div style={{fontSize:9,color:C.mut}}>{s.tip.split(".")[0]}.</div></div>
              </div>
              <div style={{width:42,height:5,background:C.bdr,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(s.score*100,100)}%`,background:s.color,borderRadius:3}}/></div>
            </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:6}}>BEFORE → AFTER</div>
        <div style={{display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.mut}}>DEALT</div><div style={{fontSize:12,color:topO.color,fontWeight:600,marginTop:2}}>{topO.icon} {topO.name}</div><div style={{fontSize:11,color:C.mut}}>{(topO.score*100).toFixed(0)}%</div></div>
          <div style={{fontSize:16,color:improved?C.jade:C.cinn}}>{improved?"→ ✓":"→ ✗"}</div>
          <div style={{textAlign:"center"}}><div style={{fontSize:9,color:C.mut}}>AFTER</div><div style={{fontSize:12,color:top.color,fontWeight:600,marginTop:2}}>{top.icon} {top.name}</div><div style={{fontSize:11,color:improved?C.jade:C.cinn}}>{(top.score*100).toFixed(0)}% {improved?"↑":"↓"}</div></div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700,marginBottom:6}}>PASSED ({passed.length})</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>{passed.map((t,i)=><MjTile key={i} t={t}/>)}</div>
        {warnings.length>0?(
          <div style={{marginTop:8,padding:8,background:C.cinn+"05",borderRadius:7,border:`1px solid ${C.cinn}10`}}>
            <div style={{fontSize:10,color:C.cinn,fontWeight:700,marginBottom:3}}>⚠️ High-value tiles passed:</div>
            {warnings.slice(0,3).map((w,i)=><div key={i} style={{fontSize:11,color:C.mut,lineHeight:1.5}}><strong style={{color:C.ink}}>{tLabel(w.t)} {tSub(w.t)}</strong> — {w.r}</div>)}
          </div>
        ):<p style={{fontSize:11,color:C.jade,marginTop:6,fontWeight:600}}>✓ Smart passes! No high-value tiles wasted.</p>}
      </div>

      <div style={S.shareCard}>
        <div style={{fontSize:8,color:C.jade,letterSpacing:4,fontWeight:700}}>RACKLE</div>
        <div style={{fontFamily:F.d,fontSize:20,color:C.ink,margin:"4px 0",fontWeight:800}}>{isDaily?`#${getDayNum()} `:" "}{g} {emojis[gi]}</div>
        <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:3}}>
          {passScores.map((ps,i)=><span key={i} style={{fontSize:14}}>{ps>=0.7?"🟩":ps>=0.4?"🟨":"⬜"}</span>)}
        </div>
        <div style={{fontSize:11,color:C.mut,marginTop:5}}>Best: {top.icon} {top.name}</div>
        <div style={{fontSize:10,color:C.jade,marginTop:5,fontWeight:600}}>How's your Charleston?</div>
        <div style={{fontSize:8,color:C.mut,marginTop:3,letterSpacing:2}}>PLAYRACKLE.COM</div>
      </div>

      <button onClick={copy} style={{...S.oBtn,width:"100%",marginTop:8,fontSize:11}}>{copied?"✓ Copied!":"📋 Copy result"}</button>

      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={home} style={{...S.oBtn,flex:1}}>Home</button>
        {!isDaily&&<button onClick={restart} style={{...S.greenBtn,flex:1}}>Deal Again</button>}
      </div>
    </div>
  );
}

// ── TOKENS & STYLES ────────────────────────────────────

const C={bg:"#FAF7F2",bg2:"#F2EDE5",ink:"#231F1B",mut:"#878075",jade:"#1D8A56",gold:"#B8943F",cinn:"#C83838",bdr:"#E5DFD5"};
const F={d:"'Fraunces',Georgia,serif",b:"'Nunito','Segoe UI',sans-serif"};

const CSS=`*{box-sizing:border-box}
@keyframes tileIn{from{opacity:0;transform:translateY(10px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
.tile-deal{animation:tileIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.tile-float{animation:floatY 3s ease-in-out infinite}
@keyframes confP{0%{transform:scale(0.5);opacity:0}50%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
.confetti{animation:confP 0.5s cubic-bezier(0.34,1.56,0.64,1)}
@keyframes ttIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.tt-in{animation:ttIn .25s ease}

/* Desktop: mahjong table background with centered card */
@media(min-width:600px){
  .rackle-outer{background:#1A2E28 !important;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 20px;
    background-image:radial-gradient(ellipse at center,#1E352E 0%,#152520 70%) !important;}
  .rackle-inner{width:100%;max-width:480px;background:#FAF7F2;border-radius:24px;box-shadow:0 20px 80px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.05);overflow:hidden;min-height:auto;}
  .rackle-inner .rk-pg{padding:16px 24px 40px;}
  .rackle-inner .rk-card{padding:18px;border-radius:14px;}
  .rackle-inner .rk-tile{width:44px !important;height:58px !important;}
  .rackle-inner .rk-tile span:first-child{font-size:19px !important;}
  .rackle-inner .rk-title{font-size:42px !important;}
  .rackle-inner .rk-subtitle{font-size:14px !important;}
}
@media(max-width:599px){
  .rackle-outer{background:#FAF7F2;min-height:100vh;}
  .rackle-inner{max-width:100%;}
}
`;

const S={
  app:{fontFamily:F.b,color:C.ink},
  pg:{padding:"10px 14px",paddingBottom:36},
  pill:{background:C.bg2,borderRadius:12,padding:"8px 6px",textAlign:"center",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  card:{background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:12,padding:14,marginBottom:8},
  dot:{width:20,height:20,borderRadius:10,background:C.jade+"12",border:`1.5px solid ${C.jade}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:C.jade,flexShrink:0},
  bigBtn:{width:"100%",padding:"14px 16px",borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,#C83838,#A82E2E)`,color:"#fff",display:"flex",alignItems:"center",gap:12,boxShadow:`0 4px 16px ${C.cinn}25`,marginBottom:8},
  passBtn:{width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",background:`linear-gradient(135deg,#C83838,#A82E2E)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,boxShadow:`0 3px 12px ${C.cinn}20`},
  greenBtn:{padding:"12px 0",background:`linear-gradient(135deg,${C.jade},#167A48)`,color:"#fff",border:"none",borderRadius:11,fontSize:14,fontFamily:F.d,fontWeight:700,letterSpacing:1,cursor:"pointer",boxShadow:`0 3px 12px ${C.jade}20`},
  oBtn:{padding:"10px 0",background:"none",color:C.mut,border:`1px solid ${C.bdr}`,borderRadius:11,fontSize:13,cursor:"pointer"},
  back:{background:"none",border:`1px solid ${C.bdr}`,color:C.mut,fontSize:11,padding:"4px 10px",borderRadius:8,cursor:"pointer",fontWeight:600},
  shareCard:{background:`linear-gradient(145deg,#FFFFF6,#F5F0E4)`,border:`1.5px solid ${C.jade}25`,borderRadius:18,padding:"18px 22px",textAlign:"center",marginTop:10,boxShadow:`0 4px 20px rgba(0,0,0,0.04),0 0 0 1px ${C.jade}08`},
};