import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, useRef, useCallback } from "react";
// RACKLE, Daily Charleston + Practice. The Daily Mahjong Workout. 2026 NMJL. v93.1
// vNext: App-wide premium club styling applied across homepage, game, scorecards, guides, settings, profile, and leaderboards
// v2.0, Full Rackle Score Scoring Engine, IQScorecard, ScorecardScreen

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
html,body{margin:0;padding:0;background:#F8F4EE;overflow-x:hidden}
#root{overflow-x:hidden}
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
  .rk-pg{padding:24px 34px 56px!important}
}
@keyframes rkFlip{0%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0deg);opacity:1}}
.rk-flip{animation:rkFlip 0.35s ease forwards}
@keyframes rkBannerIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.rk-banner-in{animation:rkBannerIn 0.4s ease}

.rk-pulse{animation:rkPulse 2s ease-in-out infinite}
@keyframes rkPulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(2.2);opacity:0}}
@keyframes rkTickIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.rk-tick{animation:rkTickIn 0.15s ease}
@keyframes rkStreakBreathe{0%,100%{transform:translateY(0);opacity:1}50%{transform:translateY(-1px);opacity:.94}}
.rk-streak-copy{animation:rkStreakBreathe 4s ease-in-out infinite}
@keyframes rkHeroDrift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.rk-hero-live{background-size:160% 160%!important;animation:rkHeroDrift 12s ease-in-out infinite}
@keyframes rkSoftGlow{0%,100%{box-shadow:0 0 0 rgba(201,168,76,0)}50%{box-shadow:0 0 28px rgba(201,168,76,.18)}}
.rk-soft-glow{animation:rkSoftGlow 4s ease-in-out infinite}
@keyframes rkCountLift{from{opacity:.45;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
.rk-count-live{animation:rkCountLift .35s ease-out both}

@keyframes rkLiveDot{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.32);opacity:1}}
.rk-live-dot{animation:rkLiveDot 2.6s ease-in-out infinite}
@keyframes rkLiveHalo{0%,100%{box-shadow:0 0 0 0 rgba(76,217,135,.24);transform:scale(1)}50%{box-shadow:0 0 0 7px rgba(76,217,135,0);transform:scale(1.08)}}
.rk-live-orb{animation:rkLiveHalo 2.4s ease-in-out infinite}
@keyframes rkHeroLift{0%,100%{filter:brightness(1)}50%{filter:brightness(1.08)}}
.rk-hero-bright{animation:rkHeroLift 8s ease-in-out infinite}
.rk-tap-card{transition:transform .18s ease, box-shadow .18s ease}
.rk-tap-card:active{transform:scale(.992)}
@keyframes rkGoldSweep{0%{transform:translateX(-120%);opacity:0}35%{opacity:.45}100%{transform:translateX(120%);opacity:0}}
.rk-sweep{position:relative;overflow:hidden}
.rk-sweep:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 0%,rgba(255,255,255,.14) 45%,transparent 60%);animation:rkGoldSweep 5.8s ease-in-out infinite;pointer-events:none}

@keyframes rkCopied{0%{transform:scale(.92);opacity:0}50%{transform:scale(1.04);opacity:1}100%{transform:scale(1);opacity:1}}
.rk-copied-state{animation:rkCopied .24s ease both}
.rk-hero-stack{padding-top:10px!important;padding-bottom:18px!important}
.rk-hero-tile{margin-bottom:6px!important}
.rk-hero-subtitle{margin-top:8px!important;margin-bottom:10px!important;line-height:1.35!important}
.rk-hero-status{margin-top:10px!important;color:#6B6157!important;font-size:13px!important;line-height:1.45!important}
.rk-daily-cta{background:linear-gradient(180deg,#F2EBDD 0%,#E9E0CF 100%)!important;border:1px solid rgba(23,107,66,.18)!important;box-shadow:0 3px 10px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.65)!important;border-radius:16px!important;min-height:52px!important;transition:transform .18s ease,box-shadow .18s ease,background .18s ease!important}
.rk-daily-cta:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.75)!important}
.rk-daily-cta:active{transform:scale(.985)}
.rk-share-card{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease!important;cursor:pointer}
.rk-share-card:hover{transform:translateY(-1px);border-color:rgba(23,107,66,.18)!important;box-shadow:0 8px 20px rgba(0,0,0,.05)!important}
.rk-share-card:active{transform:scale(.99)}
.rk-leaderboard-card{transition:transform .18s ease,border-color .18s ease!important}
.rk-leaderboard-card:hover{transform:translateY(-1px);border-color:rgba(23,107,66,.14)!important}
.rk-live-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:rgba(23,107,66,.06);border:1px solid rgba(23,107,66,.08);font-size:11px;color:#4A5B50}
.rk-mini-avatars{display:flex;align-items:center}
.rk-mini-avatar{width:18px;height:18px;border-radius:50%;border:2px solid #F8F4EE;margin-left:-6px;background:#D9D2C5}



.rk-mahjong-tile:hover{transform:translateY(-2px)!important;box-shadow:0 7px 14px rgba(26,20,16,.10),inset 0 1px 0 rgba(255,255,255,.9)!important}
.rk-rack-surface:before{content:"";position:absolute}
button{font-family:'Nunito','Segoe UI',sans-serif}

/* ─── APP-WIDE PREMIUM CLUB SYSTEM ─────────────────────────────────────────── */
.rk-pg{background:
  radial-gradient(circle at 50% -80px,rgba(255,255,255,.62),transparent 245px),
  linear-gradient(180deg,#F8F4EE 0%,#F6F0E6 100%);
}
.rk-screen-title{font-family:'Fraunces',Georgia,serif;font-size:23px;font-weight:900;letter-spacing:-.5px;color:#1A1410;line-height:1.05;margin:0 0 5px}
.rk-screen-kicker{font-size:8px;letter-spacing:2.6px;font-weight:900;color:#176B42;text-transform:uppercase;margin-bottom:7px}
.rk-screen-copy{font-size:12px;color:#6B6157;line-height:1.6;margin:0}
.rk-lux-card{background:linear-gradient(145deg,#FFFDF8 0%,#F8F1E6 100%)!important;border:1px solid rgba(26,20,16,.085)!important;border-radius:18px!important;box-shadow:0 6px 22px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.72)!important}
.rk-lux-card-dark{background:linear-gradient(155deg,#062B18 0%,#0D4A2E 52%,#051F11 100%)!important;border:1px solid rgba(201,168,76,.18)!important;border-radius:20px!important;box-shadow:0 16px 44px rgba(6,43,24,.22),inset 0 1px 0 rgba(255,255,255,.08)!important;color:#fff!important}
.rk-row-card{background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border:1px solid rgba(26,20,16,.075)!important;border-radius:16px!important;box-shadow:0 3px 13px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.75)!important;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease!important}
.rk-row-card:hover{transform:translateY(-1px);border-color:rgba(23,107,66,.18)!important;box-shadow:0 8px 22px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.85)!important}
.rk-tile-icon{background:linear-gradient(145deg,#FFFDF8,#EEE4D2)!important;border:1px solid rgba(26,20,16,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 4px 12px rgba(26,20,16,.05)!important}
.rk-primary-btn{background:linear-gradient(135deg,#176B42,#0F5432)!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:0 8px 18px rgba(23,107,66,.18),inset 0 1px 0 rgba(255,255,255,.18)!important}
.rk-secondary-btn{background:linear-gradient(180deg,#F2EBDD,#E9E0CF)!important;border:1px solid rgba(23,107,66,.12)!important;box-shadow:0 3px 10px rgba(0,0,0,.035),inset 0 1px 0 rgba(255,255,255,.65)!important}
.rk-soft-input{background:#FFFDF8!important;border:1px solid rgba(26,20,16,.10)!important;border-radius:14px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 2px 8px rgba(26,20,16,.025)!important}
.rk-section-hairline{height:1px;background:linear-gradient(90deg,transparent,rgba(160,120,40,.38),transparent)}
.rk-chip-premium{display:inline-flex;align-items:center;gap:5px;border-radius:999px;background:rgba(23,107,66,.07);border:1px solid rgba(23,107,66,.10);padding:5px 10px;color:#176B42;font-size:10px;font-weight:800;line-height:1}
.rk-table-talk{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 12px;color:rgba(255,255,255,.78);font-size:11px;line-height:1.45}
.rk-menu-surface{background:linear-gradient(145deg,#FFFDF8,#F6EFE4)!important;border:1px solid rgba(26,20,16,.10)!important;box-shadow:0 16px 44px rgba(26,20,16,.13),inset 0 1px 0 rgba(255,255,255,.76)!important}
.rk-modal-surface{background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border:1px solid rgba(26,20,16,.09)!important;box-shadow:0 22px 70px rgba(26,20,16,.14),inset 0 1px 0 rgba(255,255,255,.75)!important}









/* ─── vNext CLUBHOUSE HOMEPAGE OVERHAUL ─────────────────────────────────── */
.rk-clubhouse-v2{margin:28px 0 26px}
.rk-clubhouse-v2-divider{display:flex;align-items:center;gap:12px;margin:8px 0 16px}
.rk-clubhouse-v2-divider:before,.rk-clubhouse-v2-divider:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(160,120,40,.30))}
.rk-clubhouse-v2-divider:after{background:linear-gradient(90deg,rgba(160,120,40,.30),transparent)}
.rk-clubhouse-v2-label{display:inline-flex;align-items:center;gap:7px;padding:7px 15px;border-radius:999px;background:linear-gradient(145deg,#F5EFE4,#EDE3D3);border:1px solid rgba(160,120,40,.20);box-shadow:inset 0 1px 0 rgba(255,255,255,.72);font-size:9px;letter-spacing:2.5px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.56);white-space:nowrap}
.rk-clubhouse-v2-hero{position:relative;overflow:hidden;border-radius:26px;background:linear-gradient(150deg,#041F12 0%,#07331E 48%,#0A4328 72%,#03170D 100%);border:1px solid rgba(243,212,107,.20);box-shadow:0 18px 44px rgba(6,43,24,.18),inset 0 1px 0 rgba(255,255,255,.10);padding:20px 18px;color:#fff;margin-bottom:12px}
.rk-clubhouse-v2-hero:after{content:'🀄';position:absolute;right:-16px;bottom:-28px;font-size:118px;opacity:.045;transform:rotate(-8deg);pointer-events:none}
.rk-clubhouse-v2-top{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}
.rk-clubhouse-v2-kicker{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;font-weight:950;color:rgba(243,212,107,.82);margin-bottom:8px}
.rk-clubhouse-v2-title{font-family:'Fraunces',Georgia,serif;font-size:25px;line-height:1.02;font-weight:950;letter-spacing:-.75px;color:#fff;margin:0 0 6px}
.rk-clubhouse-v2-copy{font-size:12.5px;line-height:1.55;color:rgba(255,255,255,.68);font-weight:750;max-width:36ch;margin:0}
.rk-clubhouse-v2-live{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#F3D46B;font-size:10.5px;font-weight:950;white-space:nowrap;flex-shrink:0}
.rk-clubhouse-v2-live span:first-child{width:8px;height:8px;border-radius:999px;background:#4CD987;box-shadow:0 0 0 4px rgba(76,217,135,.12),0 0 14px rgba(76,217,135,.55);animation:rkLiveBreathe 2.4s ease-in-out infinite}
.rk-clubhouse-v2-metrics{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.rk-clubhouse-v2-metric{border-radius:18px;padding:13px 10px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);min-width:0}
.rk-clubhouse-v2-metric strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:22px;line-height:1;font-weight:950;color:#F3D46B;letter-spacing:-.5px;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-clubhouse-v2-metric span{display:block;font-size:8px;letter-spacing:1.65px;text-transform:uppercase;font-weight:950;color:rgba(255,255,255,.54);line-height:1.2}
.rk-clubhouse-v2-stack{border-radius:24px;overflow:hidden;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.075);box-shadow:0 12px 32px rgba(26,20,16,.05),inset 0 1px 0 rgba(255,255,255,.82);margin-bottom:16px}
.rk-clubhouse-v2-stack > div + div{border-top:1px solid rgba(26,20,16,.06)}
.rk-clubhouse-v2-stack .rk-quiet-board,.rk-clubhouse-v2-stack .rk-social-preview-board,.rk-clubhouse-v2-stack .rk-leaderboard-card{border:none!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;margin:0!important}
.rk-clubhouse-v2-stack .rk-quiet-board-head,.rk-clubhouse-v2-stack .rk-social-preview-head{padding-top:18px!important;padding-bottom:18px!important}
.rk-clubhouse-v2-stack .rk-quiet-title,.rk-clubhouse-v2-stack .rk-social-preview-title{font-size:20px!important;line-height:1.06!important;margin-bottom:6px!important}
.rk-clubhouse-v2-stack .rk-quiet-desc,.rk-clubhouse-v2-stack .rk-quiet-preview-line{font-size:12px!important;line-height:1.35!important;color:rgba(26,20,16,.58)!important;font-weight:750!important}
.rk-clubhouse-v2-stack .rk-connected-panel,.rk-clubhouse-v2-stack .rk-quiet-board-panel{border-radius:0!important;border-left:none!important;border-right:none!important;border-bottom:none!important;box-shadow:none!important;background:linear-gradient(180deg,#FFFDF8,#F5EFE3)!important}
.rk-clubhouse-v2-organizer{position:relative;overflow:hidden;border-radius:24px;background:linear-gradient(145deg,#F4FBF7,#EAF5EF);border:1.5px solid rgba(23,107,66,.14);box-shadow:0 10px 28px rgba(23,107,66,.07),inset 0 1px 0 rgba(255,255,255,.78);padding:20px;margin:16px 0 20px}
.rk-clubhouse-v2-organizer:after{content:'🏛️';position:absolute;right:-8px;bottom:-18px;font-size:94px;opacity:.055;transform:rotate(-6deg);pointer-events:none}
.rk-clubhouse-v2-organizer-head{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.rk-clubhouse-v2-organizer-kicker{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;font-weight:950;color:#176B42}
.rk-clubhouse-v2-organizer-pill{border-radius:999px;padding:7px 11px;background:rgba(201,168,76,.13);border:1px solid rgba(201,168,76,.20);color:#8A6820;font-size:10.5px;font-weight:950;white-space:nowrap}
.rk-clubhouse-v2-organizer-title{position:relative;z-index:1;font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1.02;font-weight:950;letter-spacing:-.65px;color:#1A1410;margin:0 0 9px}
.rk-clubhouse-v2-organizer-copy{position:relative;z-index:1;font-size:12.5px;line-height:1.55;color:#6B6157;font-weight:750;max-width:38ch;margin:0 0 14px}
.rk-clubhouse-v2-benefits{position:relative;z-index:1;display:grid;gap:8px;margin-bottom:15px}
.rk-clubhouse-v2-benefit{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:17px;background:rgba(255,255,255,.70);border:1px solid rgba(23,107,66,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.78)}
.rk-clubhouse-v2-benefit-dot{width:9px;height:9px;border-radius:999px;background:#176B42;box-shadow:0 0 0 4px rgba(23,107,66,.08);flex-shrink:0}
.rk-clubhouse-v2-benefit-text{font-size:12.5px;line-height:1.25;color:#1A1410;font-weight:900}
.rk-clubhouse-v2-actions{position:relative;z-index:1;display:grid;grid-template-columns:1.45fr .85fr;gap:9px}
.rk-clubhouse-v2-primary,.rk-clubhouse-v2-secondary{display:flex;align-items:center;justify-content:center;border-radius:16px;padding:13px 10px;font-family:'Fraunces',Georgia,serif;font-size:14px;font-weight:950;text-decoration:none;cursor:pointer}
.rk-clubhouse-v2-primary{border:1px solid rgba(255,255,255,.16);background:linear-gradient(135deg,#176B42,#0F5432);color:#fff;box-shadow:0 10px 22px rgba(23,107,66,.16),inset 0 1px 0 rgba(255,255,255,.16)}
.rk-clubhouse-v2-secondary{border:1px solid rgba(23,107,66,.18);background:rgba(255,255,255,.78);color:#176B42}
@media(max-width:390px){.rk-clubhouse-v2-title{font-size:23px}.rk-clubhouse-v2-metrics{grid-template-columns:1fr 1fr}.rk-clubhouse-v2-metric:last-child{grid-column:1/-1}.rk-clubhouse-v2-top{flex-direction:column}.rk-clubhouse-v2-actions{grid-template-columns:1fr}.rk-clubhouse-v2-copy{max-width:100%}}

/* ─── vNext AUTH SESSION + CLUBHOUSE MENU POLISH ───────────────────────── */
.rk-boot-splash{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#041F12 0%,#07331E 48%,#0A4328 72%,#03170D 100%);color:#fff;text-align:center;padding:28px;position:relative;overflow:hidden}
.rk-boot-splash:after{content:'🀄';position:absolute;right:-38px;bottom:-38px;font-size:190px;opacity:.045;transform:rotate(-8deg);pointer-events:none}
.rk-boot-tile{width:62px;height:62px;border-radius:22px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.08);border:1px solid rgba(243,212,107,.24);box-shadow:0 18px 44px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.12);font-size:32px;animation:rkFloat 3s ease-in-out infinite}
.rk-boot-logo{font-family:'Fraunces',Georgia,serif;font-size:40px;font-weight:950;letter-spacing:-1.8px;color:#F3D46B;line-height:1}
.rk-boot-copy{margin-top:8px;font-size:13px;color:rgba(255,255,255,.68);font-weight:800;letter-spacing:.2px}
.rk-boot-shimmer{width:150px;height:3px;border-radius:999px;margin:18px auto 0;background:linear-gradient(90deg,transparent,rgba(243,212,107,.78),transparent);animation:rkGoldSweep 1.8s ease-in-out infinite}
.rk-menu-backdrop{position:fixed;inset:0;z-index:260;background:rgba(11,9,7,.38);backdrop-filter:blur(9px);animation:rkMenuFade .18s ease both}
.rk-menu-drawer{position:fixed;top:10px;right:10px;bottom:10px;width:min(368px,calc(100vw - 20px));z-index:270;border-radius:28px;background:linear-gradient(145deg,#FFFDF8,#F6EFE4);border:1px solid rgba(26,20,16,.08);box-shadow:0 18px 50px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.82);overflow:hidden;display:flex;flex-direction:column;animation:rkDrawerIn .24s cubic-bezier(.2,.8,.2,1) both}
@keyframes rkMenuFade{from{opacity:0}to{opacity:1}}
@keyframes rkDrawerIn{from{opacity:0;transform:translateX(18px) scale(.985)}to{opacity:1;transform:translateX(0) scale(1)}}
.rk-menu-hero{position:relative;overflow:hidden;padding:22px 20px 18px;background:linear-gradient(150deg,#041F12 0%,#07331E 48%,#0A4328 72%,#03170D 100%);color:#fff;border-bottom:1px solid rgba(243,212,107,.24)}
.rk-menu-hero:after{content:'🀄';position:absolute;right:-18px;bottom:-30px;font-size:118px;opacity:.045;transform:rotate(-8deg);pointer-events:none}
.rk-menu-close{position:absolute;right:14px;top:14px;width:34px;height:34px;border-radius:13px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);color:#fff;font-size:16px;font-weight:900;cursor:pointer;z-index:2}
.rk-menu-avatar{width:58px;height:58px;border-radius:22px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(243,212,107,.38);box-shadow:0 8px 24px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;color:#176B42;font-family:'Fraunces',Georgia,serif;font-size:24px;font-weight:950;margin-bottom:12px;position:relative;z-index:1;overflow:hidden}
.rk-menu-name{font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1.03;font-weight:950;letter-spacing:-.7px;color:#fff;position:relative;z-index:1}
.rk-menu-club{font-size:12px;line-height:1.4;color:rgba(255,255,255,.68);font-weight:850;margin-top:5px;position:relative;z-index:1}
.rk-menu-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;position:relative;z-index:1}
.rk-menu-badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.13);color:#F3D46B;font-size:11px;font-weight:950;line-height:1}
.rk-menu-live-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:11px 13px;background:rgba(23,107,66,.055);border-bottom:1px solid rgba(26,20,16,.06)}
.rk-menu-live-stat{border-radius:15px;padding:10px 6px;background:rgba(255,255,255,.70);border:1px solid rgba(23,107,66,.075);text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.72)}
.rk-menu-live-stat strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:17px;line-height:1;color:#176B42;font-weight:950;letter-spacing:-.4px;margin-bottom:5px}
.rk-menu-live-stat span{display:flex;align-items:center;justify-content:center;gap:5px;font-size:8px;line-height:1.05;letter-spacing:1.1px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.50)}
.rk-menu-scroll{padding:13px;overflow:auto;flex:1}
.rk-menu-section{display:grid;gap:8px;margin-bottom:13px}
.rk-menu-section-title{font-size:9px;letter-spacing:2.2px;text-transform:uppercase;color:rgba(26,20,16,.42);font-weight:950;margin:5px 3px 0}
.rk-menu-row{width:100%;min-height:54px;border-radius:18px;border:1px solid rgba(26,20,16,.07);background:linear-gradient(145deg,#FFFDF8,#F7F0E5);box-shadow:0 4px 14px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.78);display:flex;align-items:center;gap:12px;padding:12px 13px;text-align:left;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease;color:#1A1410}
.rk-menu-row:hover{transform:translateY(-1px);border-color:rgba(23,107,66,.16);box-shadow:0 8px 22px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.85)}
.rk-menu-row:active{transform:scale(.992)}
.rk-menu-row-icon{width:36px;height:36px;border-radius:14px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(23,107,66,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 4px 10px rgba(26,20,16,.04);display:flex;align-items:center;justify-content:center;font-size:17px;line-height:1;flex-shrink:0;position:relative;overflow:hidden;transform:translateY(-.25px)}
.rk-menu-row-icon .rk-menu-emoji{width:100%;height:100%;display:flex;align-items:center;justify-content:center;line-height:1;transform:translateY(-.5px);font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
.rk-menu-play .rk-menu-row-icon{background:linear-gradient(145deg,#FFFDF8,#E9F3ED);border-color:rgba(23,107,66,.10)}
.rk-menu-community .rk-menu-row-icon{background:linear-gradient(145deg,#FFFDF8,#F6F0E2);border-color:rgba(201,168,76,.16)}
.rk-menu-learn .rk-menu-row-icon{background:linear-gradient(145deg,#FFFDF8,#EEF2F8);border-color:rgba(36,96,168,.10)}
.rk-menu-account .rk-menu-row-icon{background:linear-gradient(145deg,#FFFDF8,#F4F1EC);border-color:rgba(26,20,16,.075)}
.rk-menu-share .rk-menu-row-icon{background:linear-gradient(145deg,#FFFDF8,#F7EEDF);border-color:rgba(201,168,76,.16)}
.rk-menu-cta .rk-menu-row-icon{background:rgba(255,255,255,.13)!important;border-color:rgba(255,255,255,.18)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)!important}
.rk-menu-badge{line-height:1!important}.rk-menu-badge .rk-menu-inline-emoji{display:inline-flex;align-items:center;justify-content:center;line-height:1;transform:translateY(-.5px);margin-right:1px}
.rk-menu-live-stat span{line-height:1!important}.rk-menu-live-stat .rk-live-dot-dynamic{flex-shrink:0;transform:translateY(-.25px)}
.rk-menu-row strong{display:block;font-size:13px;line-height:1.1;font-weight:950;color:#1A1410}
.rk-menu-row span{display:block;font-size:10.5px;line-height:1.35;color:#6B6157;font-weight:750;margin-top:3px}
.rk-menu-cta{position:relative;overflow:hidden;border-color:rgba(23,107,66,.20)!important;background:linear-gradient(135deg,#176B42,#0F5432)!important;color:#fff!important;box-shadow:0 10px 24px rgba(23,107,66,.17),inset 0 1px 0 rgba(255,255,255,.16)!important}
.rk-menu-cta strong,.rk-menu-cta span{color:#fff!important}.rk-menu-cta span{opacity:.78}
.rk-menu-footer{padding:13px 15px 16px;border-top:1px solid rgba(26,20,16,.06);text-align:center;font-size:10.5px;line-height:1.5;color:#6B6157;font-weight:800;background:linear-gradient(180deg,rgba(255,255,255,.4),rgba(247,240,229,.75))}
@media(max-width:380px){.rk-menu-drawer{top:6px;right:6px;bottom:6px;width:calc(100vw - 12px);border-radius:24px}.rk-menu-live-strip{grid-template-columns:1fr}.rk-menu-hero{padding:19px 18px 16px}.rk-menu-name{font-size:22px}}

/* ─── WORDLE-LIKE DAILY SCORECARD SOCIAL POLISH ─────────────────────────── */
.rk-score-social-room{
  position:relative;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:13px 14px;
  margin:0 0 12px;
  border-radius:20px;
  background:linear-gradient(145deg,#FFFDF8,#F2EBDD);
  border:1px solid rgba(23,107,66,.10);
  box-shadow:0 6px 20px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.78);
}
.rk-score-social-room:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.58),transparent 36%);pointer-events:none}
.rk-score-social-left{position:relative;z-index:1;display:flex;align-items:center;gap:10px;min-width:0;text-align:left}
.rk-score-social-icon{width:40px;height:40px;border-radius:15px;display:flex;align-items:center;justify-content:center;background:rgba(23,107,66,.08);border:1px solid rgba(23,107,66,.10);font-size:18px;flex-shrink:0}
.rk-score-social-title{font-family:'Fraunces',Georgia,serif;font-size:15px;line-height:1.05;font-weight:950;color:#1A1410;letter-spacing:-.2px}
.rk-score-social-copy{font-size:11px;line-height:1.35;color:#6B6157;font-weight:750;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px}
.rk-score-avatar-stack{position:relative;z-index:1;display:flex;align-items:center;padding-left:8px;flex-shrink:0}
.rk-score-avatar-dot{width:24px;height:24px;margin-left:-7px;border-radius:999px;border:2px solid #FFFDF8;background:linear-gradient(145deg,#F3D46B,#FFF4C6);box-shadow:0 2px 7px rgba(26,20,16,.08)}
.rk-score-action-grid button{transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.rk-score-action-grid button:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.78)!important}
.rk-score-action-grid button:active{transform:scale(.99)}
.rk-score-rack-card{margin-top:2px}
@media(max-width:390px){.rk-score-social-copy{max-width:160px}.rk-score-social-room{padding:12px}.rk-score-action-grid{grid-template-columns:1fr!important}}


/* ─── HOMEPAGE SIMPLIFICATION PASS ─────────────────────────────────────── */
.rk-home-main-col{display:flex;flex-direction:column;gap:0}
.rk-home-main-col > *{scroll-margin-top:18px}
@media(max-width:599px){
  .rk-home-desktop-insights{display:none!important}
  .rk-organizer-card{margin-top:22px!important}
  .rk-clubhouse-stack{margin-bottom:22px!important}
  .rk-learn-shell{margin-top:26px!important}
}
@media(min-width:600px){
  .rk-home-desktop-insights{display:block!important}
}

/* ─── VIRAL-READY SCORECARD + HOMEPAGE SIMPLIFICATION ───────────────────── */
.rk-share-card{will-change:transform}
.rk-score-shell .rk-iq-hero{margin-bottom:12px!important}
.rk-score-action-grid button{min-height:46px!important}
@media(max-width:599px){
  .rk-home-side-col{display:flex;flex-direction:column}
  .rk-organizer-card{margin-top:18px!important}
  .rk-email-home{margin-top:16px!important}
  .rk-score-rack-card{margin-top:8px!important}
}

/* ─── FULL SCORECARD VISUAL REFRESH ───────────────────────────────────────── */
.rk-score-shell{
  background:radial-gradient(circle at top,rgba(255,255,255,.72),transparent 240px),linear-gradient(180deg,#F8F4EE 0%,#F5EEE2 100%);
  min-height:100vh;
}
.rk-editorial-header{display:flex;flex-direction:column;gap:4px;margin-top:20px;margin-bottom:12px}
.rk-editorial-kicker{font-size:10px;letter-spacing:2.1px;text-transform:uppercase;font-weight:800;color:rgba(23,107,66,.78)}
.rk-editorial-title{font-family:'Fraunces',Georgia,serif;font-size:19px;line-height:1.08;font-weight:900;letter-spacing:-.4px;color:#1A1410}
.rk-editorial-copy{font-size:12px;line-height:1.55;color:rgba(26,20,16,.58);font-weight:600}
.rk-score-divider{height:1px;margin:18px 0 4px;background:linear-gradient(90deg,transparent,rgba(160,120,40,.32),transparent)}
.rk-score-card{position:relative;overflow:hidden;background:linear-gradient(145deg,#FFFDF8 0%,#F7F0E5 100%);border:1px solid rgba(26,20,16,.07);border-radius:22px;padding:20px;margin-bottom:16px;box-shadow:0 6px 24px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.rk-score-card:hover{transform:translateY(-1px);border-color:rgba(23,107,66,.12);box-shadow:0 12px 30px rgba(26,20,16,.06),inset 0 1px 0 rgba(255,255,255,.82)}
.rk-score-card:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.52),transparent 34%);pointer-events:none}
.rk-iq-hero{position:relative;overflow:hidden;background:radial-gradient(circle at top,rgba(255,255,255,.08),transparent 40%),linear-gradient(155deg,#062B18 0%,#0D4A2E 52%,#051F11 100%);background-size:160% 160%;animation:rkHeroDrift 14s ease-in-out infinite;border-radius:28px;padding:30px 24px 24px;border:1px solid rgba(201,168,76,.14);box-shadow:0 18px 48px rgba(6,43,24,.24),inset 0 1px 0 rgba(255,255,255,.08);color:#fff}
.rk-iq-glow{position:absolute;width:240px;height:240px;border-radius:999px;background:radial-gradient(circle,rgba(201,168,76,.16),transparent 72%);top:-90px;left:50%;transform:translateX(-50%);pointer-events:none}
.rk-iq-score{position:relative;z-index:2;font-family:'Fraunces',Georgia,serif;font-size:78px;line-height:.92;letter-spacing:-3px;font-weight:900;text-align:center;margin-bottom:8px;color:#F4E7BE}
.rk-iq-label{text-align:center;font-size:11px;color:rgba(255,255,255,.58);letter-spacing:1.8px;text-transform:uppercase;font-weight:800}
.rk-iq-sub{text-align:center;font-family:'Fraunces',Georgia,serif;font-size:20px;font-weight:800;color:#F4E7BE;margin-top:6px}
.rk-iq-summary{max-width:270px;margin:12px auto 0;text-align:center;font-size:13px;line-height:1.7;color:rgba(255,255,255,.68)}
.rk-iq-meta{margin-top:18px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:11px;color:rgba(255,255,255,.56)}
.rk-breakdown-list{display:flex;flex-direction:column;gap:12px}
.rk-breakdown-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 15px;border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.84),rgba(247,240,229,.88));border:1px solid rgba(26,20,16,.05);box-shadow:0 4px 12px rgba(26,20,16,.03),inset 0 1px 0 rgba(255,255,255,.72)}
.rk-breakdown-left{flex:1}.rk-breakdown-title{font-size:14px;font-weight:800;color:#1A1410;margin-bottom:2px}.rk-breakdown-sub{font-size:11px;line-height:1.45;color:rgba(26,20,16,.52)}
.rk-breakdown-pill{flex-shrink:0;background:rgba(23,107,66,.08);border:1px solid rgba(23,107,66,.08);border-radius:999px;padding:6px 11px;font-size:12px;font-weight:800;color:#176B42}
.rk-coach-card{display:flex;align-items:flex-start;gap:14px;padding:18px;border-radius:20px;background:linear-gradient(145deg,#FFFDF8,#F5EFE3);border:1px solid rgba(26,20,16,.06);box-shadow:0 6px 18px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.72)}
.rk-coach-icon{width:38px;height:38px;flex-shrink:0;border-radius:999px;background:rgba(23,107,66,.08);border:1px solid rgba(23,107,66,.08);display:flex;align-items:center;justify-content:center;font-size:16px}.rk-coach-copy{font-size:15px;line-height:1.7;color:rgba(26,20,16,.78);font-weight:700}
.rk-practice-card{background:linear-gradient(145deg,#FFFDF8,#F7F1E7);border:1px solid rgba(26,20,16,.06);border-radius:20px;padding:16px;margin-bottom:14px;box-shadow:0 4px 16px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.72)}
.rk-practice-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.rk-practice-score{font-family:'Fraunces',Georgia,serif;font-size:38px;line-height:1;letter-spacing:-1.5px;color:#176B42}.rk-practice-meta{font-size:11px;color:rgba(26,20,16,.5);line-height:1.5}.rk-practice-coach{margin-top:12px;font-size:14px;line-height:1.7;color:rgba(26,20,16,.72);font-weight:700}
.rk-soft-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(23,107,66,.06);border:1px solid rgba(23,107,66,.08);color:#176B42;font-size:11px;font-weight:800}.rk-soft-pill-muted{background:rgba(26,20,16,.045);border:1px solid rgba(26,20,16,.05);color:rgba(26,20,16,.58)}



/* ─── SCORECARD HOMEPAGE MATCH OVERRIDES ───────────────────────────────── */
.rk-score-shell{padding:0 18px 52px;text-align:center}
.rk-score-shell .rk-editorial-header{align-items:center;text-align:center;margin-top:24px;margin-bottom:18px}
.rk-score-shell .rk-editorial-copy{max-width:320px;margin:0 auto}
.rk-score-shell .rk-score-divider{margin:20px 0 28px}
.rk-score-shell .rk-iq-hero{width:100%;border-radius:24px;padding:30px 20px 24px;text-align:center;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11)!important;box-shadow:0 14px 38px rgba(6,43,24,.22),inset 0 1px 0 rgba(255,255,255,.08)!important}
.rk-score-shell .rk-iq-label{font-size:10px;letter-spacing:3.5px;font-weight:900;color:rgba(255,255,255,.45);margin-bottom:12px;text-transform:uppercase}
.rk-score-shell .rk-iq-score{font-size:76px;line-height:.92;letter-spacing:-3.6px;color:#F4E7BE;margin:0 auto}
.rk-iq-rule{width:56px;height:2px;background:linear-gradient(90deg,transparent,#F4E7BE,transparent);margin:18px auto 16px;border-radius:2px}
.rk-score-shell .rk-iq-sub{font-size:24px;line-height:1.08;margin:0 0 14px;color:#fff}
.rk-iq-style-pill{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(244,231,190,.45);background:rgba(255,255,255,.08);border-radius:999px;padding:7px 14px;font-size:11px;font-weight:900;color:#EED89B;backdrop-filter:blur(10px);margin:0 auto 16px;width:fit-content}
.rk-score-shell .rk-iq-summary{font-size:13px;color:rgba(255,255,255,.76);line-height:1.5;max-width:280px;margin:0 auto;text-align:center}
.rk-score-shell .rk-iq-meta{margin-top:22px;justify-content:center;text-align:center;color:rgba(255,255,255,.62);font-size:13px}
.rk-score-shell .rk-score-card{text-align:center}
.rk-style-card{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;gap:10px!important}
.rk-style-card .rk-style-icon{width:44px!important;height:44px!important;border-radius:14px!important}
.rk-rank-grid-card{text-align:center!important}
.rk-rank-grid-card div{justify-content:center}



/* ─── SCORECARD NESTING + HOMEPAGE SCORE COLOR FIX ───────────────────────── */
.rk-score-shell{
  background:transparent!important;
  min-height:auto!important;
  padding:0 0 52px!important;
}
.rk-pg > .rk-score-shell,
.rk-pg > .rk-in > .rk-score-shell{
  margin:0!important;
}
.rk-score-shell .rk-iq-hero{
  margin-left:0!important;
  margin-right:0!important;
}
.rk-score-shell .rk-iq-score{
  color:#F3D46B!important;
}
.rk-score-shell .rk-iq-rule{
  background:linear-gradient(90deg,transparent,#F3D46B,transparent)!important;
}
.rk-score-shell .rk-iq-style-pill{
  color:#F3D46B!important;
  border-color:rgba(243,212,107,.42)!important;
}



/* ─── LEARN + HAND BROWSER POLISH ───────────────────────────────────────── */
.rk-learn-shell{margin-top:24px;margin-bottom:10px}
.rk-learn-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(145deg,#FFFDF8,#F3EFE6)!important;border:1px solid rgba(23,107,66,.13)!important;border-radius:18px!important;cursor:pointer;padding:14px 15px;text-align:left;box-shadow:0 7px 24px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.8)!important}
.rk-learn-panel{border:1px solid rgba(23,107,66,.13);border-top:none;border-radius:0 0 18px 18px;overflow:hidden;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);padding:12px;box-shadow:0 10px 28px rgba(26,20,16,.04)}
.rk-learn-grid{display:grid;grid-template-columns:1fr;gap:10px}
.rk-learn-item{width:100%;display:flex;align-items:center;gap:12px;padding:13px 12px;border:1px solid rgba(26,20,16,.07);border-radius:16px;background:linear-gradient(145deg,#FFFDF8,#F8F1E6);cursor:pointer;text-align:left;box-shadow:inset 0 1px 0 rgba(255,255,255,.75);transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.rk-learn-item:active{transform:scale(.992)}
.rk-learn-item:hover{border-color:rgba(23,107,66,.16);box-shadow:0 7px 18px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.82)}
.rk-browser-hero{background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11);border:1px solid rgba(201,168,76,.18);border-radius:24px;padding:22px 18px;color:#fff;box-shadow:0 15px 38px rgba(6,43,24,.20),inset 0 1px 0 rgba(255,255,255,.08);margin-bottom:14px;position:relative;overflow:hidden}
.rk-browser-hero:after{content:"🀄";position:absolute;right:14px;bottom:-12px;font-size:86px;opacity:.045;transform:rotate(-8deg)}
.rk-browser-search{width:100%;padding:13px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.18);font-size:14px;font-family:'Nunito','Segoe UI',sans-serif;color:#fff;outline:none;background:rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.09);margin-top:14px}
.rk-browser-search::placeholder{color:rgba(255,255,255,.58)}
.rk-section-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 14px}
.rk-section-card{border-radius:17px;border:1px solid rgba(26,20,16,.075);background:linear-gradient(145deg,#FFFDF8,#F7F0E5);padding:12px 11px;text-align:left;cursor:pointer;box-shadow:0 4px 14px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.75);transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
.rk-section-card:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.8)}
.rk-section-card-active{border-color:rgba(23,107,66,.30)!important;background:linear-gradient(145deg,#F3FBF6,#F8F1E6)!important}
.rk-hand-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0 12px}
.rk-small-toggle{border:1px solid rgba(26,20,16,.08);background:linear-gradient(180deg,#FFFDF8,#F1E9DB);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900;color:#6B6157;cursor:pointer}
.rk-hand-card{background:linear-gradient(145deg,#FFFDF8,#F8F1E6);border:1px solid rgba(26,20,16,.075);border-radius:18px;box-shadow:0 5px 18px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.75);overflow:hidden;margin-bottom:10px}
.rk-hand-card-open{border-color:rgba(23,107,66,.18);box-shadow:0 9px 26px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.8)}
.rk-howto-step{display:flex;gap:13px;padding:15px;border-radius:18px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.07);box-shadow:0 4px 16px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.76)}
.rk-howto-num{width:34px;height:34px;border-radius:14px;background:rgba(23,107,66,.08);border:1px solid rgba(23,107,66,.10);display:flex;align-items:center;justify-content:center;color:#176B42;font-weight:900;flex-shrink:0}



/* ─── vNext MOBILE PREMIUM POLISH: learning, leaderboards, stats, tutorial ── */
.rk-mobile-safe{max-width:100%;overflow-x:hidden}
.rk-premium-stack{display:flex;flex-direction:column;gap:12px}
.rk-premium-hero{position:relative;overflow:hidden;border-radius:24px;padding:22px 18px;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11);border:1px solid rgba(201,168,76,.18);box-shadow:0 16px 42px rgba(6,43,24,.20),inset 0 1px 0 rgba(255,255,255,.08);color:#fff;text-align:center}
.rk-premium-hero:after{content:'🀄';position:absolute;right:-16px;bottom:-22px;font-size:104px;opacity:.045;transform:rotate(-8deg);pointer-events:none}
.rk-premium-kicker{font-size:9px;letter-spacing:2.8px;text-transform:uppercase;font-weight:900;color:rgba(23,107,66,.82)}
.rk-premium-title{font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1.02;font-weight:900;letter-spacing:-.7px;color:#1A1410;margin:0}
.rk-premium-copy{font-size:13px;line-height:1.65;color:rgba(26,20,16,.62);font-weight:650;margin:0 auto;max-width:34ch;text-align:center}
.rk-premium-card{position:relative;overflow:hidden;background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border:1px solid rgba(26,20,16,.075)!important;border-radius:22px!important;box-shadow:0 8px 26px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)!important}
.rk-premium-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.56),transparent 34%);pointer-events:none}
.rk-premium-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;border-radius:18px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.065);box-shadow:0 4px 14px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.72)}
.rk-premium-icon{width:46px;height:46px;border-radius:16px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(26,20,16,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 4px 12px rgba(26,20,16,.05);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
.rk-premium-pill{display:inline-flex;align-items:center;justify-content:center;gap:6px;border-radius:999px;padding:7px 11px;background:rgba(23,107,66,.07);border:1px solid rgba(23,107,66,.10);color:#176B42;font-size:11px;font-weight:900;line-height:1;white-space:nowrap}
.rk-gold-pill{background:rgba(201,168,76,.12);border-color:rgba(201,168,76,.18);color:#8A6820}
.rk-blue-pill{background:rgba(36,96,168,.08);border-color:rgba(36,96,168,.12);color:#2460A8}
.rk-live-spark{width:8px;height:8px;border-radius:99px;background:#4CD987;display:inline-block;box-shadow:0 0 0 4px rgba(76,217,135,.10),0 0 12px rgba(76,217,135,.55)}

/* Homepage scorecard: more enticing, less report-like */
.rk-score-shell .rk-iq-hero,.rk-iq-hero{border-radius:26px!important;box-shadow:0 18px 46px rgba(6,43,24,.25),0 0 0 1px rgba(201,168,76,.14),inset 0 1px 0 rgba(255,255,255,.10)!important}
.rk-iq-hero .rk-iq-summary{font-weight:650!important;line-height:1.55!important}
.rk-home-score-cta{margin-top:16px;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.rk-home-score-cta span{font-size:11px;font-weight:900;border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.78)}

/* Slick leaderboard dropdowns */
.rk-leaderboard-card{background:linear-gradient(145deg,#FFFDF8,#F3EFE6)!important;border:1px solid rgba(26,20,16,.075)!important;border-radius:20px!important;box-shadow:0 8px 26px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)!important;margin-bottom:0!important}
#global-leaderboard>div,#global-leaderboard .rk-in{background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border:1px solid rgba(36,96,168,.16)!important;border-top:none!important;border-radius:0 0 20px 20px!important;box-shadow:0 10px 26px rgba(26,20,16,.045)!important}
.rk-leaderboard-card + .rk-in{background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border-radius:0 0 20px 20px!important;box-shadow:0 10px 26px rgba(26,20,16,.045)!important}
.rk-leaderboard-card span,.rk-leaderboard-card div{line-height:1.35}

/* Learn and Explore: mobile-first polish */
.rk-learn-shell{margin-top:26px!important;margin-bottom:12px!important}
.rk-learn-head{border-radius:22px!important;padding:16px!important;background:linear-gradient(145deg,#FFFDF8,#F3EFE6)!important;box-shadow:0 9px 28px rgba(26,20,16,.05),inset 0 1px 0 rgba(255,255,255,.82)!important}
.rk-learn-panel{border-radius:0 0 22px 22px!important;padding:14px!important;background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important}
.rk-learn-item{min-height:72px;border-radius:18px!important;padding:14px!important;background:linear-gradient(145deg,#FFFDF8,#F8F1E6)!important}
.rk-browser-hero{border-radius:26px!important;padding:24px 18px!important;text-align:center!important;margin-bottom:16px!important}
.rk-browser-search{height:48px!important;border-radius:17px!important;text-align:center!important;font-weight:750!important}
.rk-section-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}
.rk-section-card{min-height:105px;border-radius:19px!important;padding:13px 11px!important;text-align:center!important}
.rk-hand-toolbar{position:sticky;top:0;z-index:10;background:linear-gradient(180deg,#F8F4EE 78%,rgba(248,244,238,0));padding:10px 0;margin:4px 0 12px!important;align-items:center!important}
.rk-hand-card{border-radius:20px!important;margin-bottom:12px!important;box-shadow:0 7px 22px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)!important}
@media(max-width:390px){.rk-section-grid{grid-template-columns:1fr!important}.rk-hand-toolbar{flex-direction:column;align-items:stretch!important}.rk-hand-toolbar>div{width:100%}.rk-small-toggle{flex:1}.rk-iq-score{font-size:70px!important}}

/* Stats page polish */
.rk-stats-page{text-align:center;line-height:1.65}
.rk-stats-page .rk-stat-copy,.rk-stats-page p,.rk-stats-page div{line-height:1.55}
.rk-stat-grid-premium{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:14px 0 16px}
.rk-stat-metric{border-radius:18px;padding:14px 8px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.07);box-shadow:0 5px 16px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.76);text-align:center}
.rk-stat-metric strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:25px;line-height:1;font-weight:900;letter-spacing:-.8px;margin-bottom:7px}
.rk-stat-metric span{font-size:8px;letter-spacing:1.7px;text-transform:uppercase;font-weight:900;color:rgba(26,20,16,.48)}
@media(max-width:360px){.rk-stat-grid-premium{grid-template-columns:1fr}.rk-stat-metric{padding:13px 10px}}

/* Interactive tutorial overhaul */
.rk-tutorial-shell{text-align:center}
.rk-tutorial-stage{position:relative;overflow:hidden;border-radius:26px;padding:24px 18px;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11);color:#fff;border:1px solid rgba(201,168,76,.18);box-shadow:0 16px 42px rgba(6,43,24,.22),inset 0 1px 0 rgba(255,255,255,.08);margin-bottom:14px}
.rk-tutorial-stage:after{content:'🀄';position:absolute;right:-18px;bottom:-24px;font-size:108px;opacity:.05;transform:rotate(-8deg)}
.rk-tutorial-choice{width:100%;border:1px solid rgba(26,20,16,.075);background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border-radius:18px;padding:13px 14px;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer;box-shadow:0 4px 14px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.76)}
.rk-tutorial-choice strong{font-family:'Fraunces',Georgia,serif;color:#1A1410;font-size:14px}.rk-tutorial-choice span{font-size:12px;color:#6B6157;line-height:1.45}



/* ─── vNext DROPDOWN CONNECTIONS + HAND BROWSER + WEEKLY RECAP ───────────── */
.rk-clubhouse-stack{margin-bottom:18px;border:1px solid rgba(26,20,16,.08);border-radius:22px;overflow:hidden;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);box-shadow:0 10px 30px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)}
.rk-clubhouse-stack .rk-leaderboard-card{border-radius:0!important;margin:0!important;box-shadow:none!important;border-left:none!important;border-right:none!important;border-top:none!important;background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important}
.rk-clubhouse-stack > div:first-child .rk-leaderboard-card{border-radius:22px 22px 0 0!important}
.rk-clubhouse-stack > div:not(:last-child){border-bottom:1px solid rgba(26,20,16,.07)}
.rk-clubhouse-stack .rk-connected-panel{border-left:none!important;border-right:none!important;border-bottom:none!important;border-radius:0!important;background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.72)!important}
.rk-clubhouse-stack .rk-connected-panel:last-child{border-radius:0 0 22px 22px!important}
.rk-clubhouse-stack input{background:#FFFDF8!important}
.rk-connected-panel{background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border:1px solid rgba(26,20,16,.075)!important;border-top:none!important;border-radius:0 0 22px 22px!important;box-shadow:0 10px 26px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)!important}

.rk-browser-sticky{position:sticky;top:0;z-index:12;padding:10px 0 12px;background:linear-gradient(180deg,#F8F4EE 72%,rgba(248,244,238,0));backdrop-filter:blur(8px)}
.rk-browser-prompt{border-radius:22px;padding:18px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(23,107,66,.10);box-shadow:0 8px 24px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.78);text-align:center;margin:10px 0 14px}
.rk-browser-load{width:100%;border:1px solid rgba(23,107,66,.14);background:linear-gradient(180deg,#F2EBDD,#E9E0CF);color:#176B42;border-radius:16px;padding:13px 14px;font-weight:900;font-size:13px;cursor:pointer;box-shadow:0 5px 14px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.72)}
.rk-hand-count-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 10px;background:rgba(23,107,66,.07);border:1px solid rgba(23,107,66,.10);font-size:11px;font-weight:900;color:#176B42}
@media(max-width:420px){.rk-browser-hero{padding:21px 15px!important}.rk-section-card{min-height:92px!important}.rk-section-grid{gap:8px!important}.rk-hand-card{font-size:.96em}.rk-browser-search{text-align:left!important}}

.rk-recap-shell{text-align:center;padding-bottom:58px!important}
.rk-recap-hero{position:relative;overflow:hidden;border-radius:28px!important;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11)!important;border:1px solid rgba(201,168,76,.18)!important;box-shadow:0 18px 48px rgba(6,43,24,.22),inset 0 1px 0 rgba(255,255,255,.08)!important;padding:28px 20px 22px!important;margin-bottom:14px!important}
.rk-recap-hero:after{content:'🀄';position:absolute;right:-18px;bottom:-26px;font-size:112px;opacity:.045;transform:rotate(-8deg);pointer-events:none}
.rk-recap-card{background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border:1px solid rgba(26,20,16,.075)!important;border-radius:22px!important;box-shadow:0 8px 26px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)!important;text-align:center!important}
.rk-recap-metric-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}
.rk-recap-metric{border-radius:18px;padding:14px 8px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.07);box-shadow:0 5px 16px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.76);text-align:center}
.rk-recap-metric strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1;font-weight:900;margin-bottom:7px}
.rk-recap-metric span{font-size:8px;letter-spacing:1.6px;text-transform:uppercase;font-weight:900;color:rgba(26,20,16,.48)}


/* ─── vNext SOCIAL LEADERBOARDS + SCANNABLE HAND BROWSER ─────────────────── */
@keyframes rkLiveBreathe{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(76,217,135,.28),0 0 10px rgba(76,217,135,.42)}50%{transform:scale(1.08);box-shadow:0 0 0 7px rgba(76,217,135,0),0 0 18px rgba(76,217,135,.60)}}
@keyframes rkGiltEdge{0%,100%{border-color:rgba(243,212,107,.32);box-shadow:0 0 0 rgba(243,212,107,0), inset 0 1px 0 rgba(255,255,255,.12)}50%{border-color:rgba(243,212,107,.70);box-shadow:0 0 20px rgba(243,212,107,.16), inset 0 1px 0 rgba(255,255,255,.16)}}
@keyframes rkRankFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.rk-live-dot-dynamic{width:9px;height:9px;border-radius:999px;background:#4CD987;display:inline-block;animation:rkLiveBreathe 2.35s ease-in-out infinite;flex-shrink:0}
.rk-live-pill-dynamic{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:rgba(23,107,66,.075);border:1px solid rgba(23,107,66,.12);font-size:11px;color:#176B42;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.62)}
.rk-gilt-rank-card{position:relative;overflow:hidden;border:1px solid rgba(243,212,107,.42)!important;background:rgba(255,255,255,.105)!important;animation:rkGiltEdge 3.8s ease-in-out infinite,rkRankFloat 4.4s ease-in-out infinite}
.rk-gilt-rank-card:after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 0%,rgba(243,212,107,.13) 44%,transparent 60%);transform:translateX(-120%);animation:rkGoldSweep 5.2s ease-in-out infinite;pointer-events:none}
.rk-social-lb-shell{overflow:hidden;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.075);box-shadow:0 10px 28px rgba(26,20,16,.048),inset 0 1px 0 rgba(255,255,255,.78)}
.rk-social-lb-head{width:100%;border:none;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);cursor:pointer;text-align:left;padding:17px 16px;display:flex;gap:12px;align-items:flex-start;justify-content:space-between}
.rk-social-lb-panel{background:linear-gradient(180deg,#FFFDF8 0%,#F5EFE3 100%);border-top:1px solid rgba(26,20,16,.07);padding:13px 12px 14px}
.rk-social-lb-feature{border-radius:18px;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11);color:#fff;border:1px solid rgba(201,168,76,.18);box-shadow:0 12px 30px rgba(6,43,24,.16),inset 0 1px 0 rgba(255,255,255,.08);padding:14px;position:relative;overflow:hidden;margin-bottom:10px}
.rk-social-lb-feature:after{content:'🀄';position:absolute;right:-12px;bottom:-22px;font-size:86px;opacity:.05;transform:rotate(-8deg);pointer-events:none}
.rk-social-player-row{display:flex;align-items:center;gap:11px;padding:11px 10px;border-radius:16px;background:rgba(255,255,255,.72);border:1px solid rgba(26,20,16,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.78);margin-top:8px}
.rk-social-avatar{width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;font-family:'Fraunces',Georgia,serif;color:#176B42;background:linear-gradient(145deg,#FFFDF8,#F1E7D6);border:1px solid rgba(160,120,40,.18);flex-shrink:0}
.rk-social-rank{width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;background:rgba(26,20,16,.055);color:#6B6157;flex-shrink:0}
.rk-social-rank-top{background:rgba(201,168,76,.17);color:#8A6820;border:1px solid rgba(201,168,76,.22)}
.rk-hand-rail{display:flex;gap:9px;overflow-x:auto;padding:2px 0 10px;margin:8px -18px 10px 0;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.rk-hand-rail::-webkit-scrollbar{display:none}
.rk-hand-rail-card{min-width:132px;scroll-snap-align:start;border-radius:18px;border:1px solid rgba(26,20,16,.075);background:linear-gradient(145deg,#FFFDF8,#F7F0E5);padding:12px 11px;text-align:left;box-shadow:0 5px 16px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.76);cursor:pointer}
.rk-hand-rail-card-active{border-color:rgba(23,107,66,.32)!important;background:linear-gradient(145deg,#F3FBF6,#F8F1E6)!important;box-shadow:0 8px 22px rgba(23,107,66,.08),inset 0 1px 0 rgba(255,255,255,.8)!important}
.rk-browser-mode-card{border-radius:21px;padding:16px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(23,107,66,.10);box-shadow:0 8px 24px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.78);text-align:center;margin:12px 0}
.rk-browser-filter-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;margin:8px 0 10px;-webkit-overflow-scrolling:touch}.rk-browser-filter-row::-webkit-scrollbar{display:none}
.rk-browser-filter-chip{white-space:nowrap;border-radius:999px;border:1px solid rgba(26,20,16,.08);background:linear-gradient(180deg,#FFFDF8,#F1E9DB);color:#6B6157;padding:8px 11px;font-size:11px;font-weight:900;cursor:pointer}.rk-browser-filter-chip-active{color:#176B42!important;border-color:rgba(23,107,66,.28)!important;background:rgba(23,107,66,.08)!important}





/* ─── vNext CLUBHOUSE CONNECTION + ORGANIZER SCAN CARD ───────────────────── */
.rk-clubhouse-stack > div:first-child .rk-quiet-board,
.rk-clubhouse-stack > div:first-child#global-leaderboard{
  border-radius:22px 22px 0 0!important;
}
.rk-clubhouse-stack > div:first-child .rk-quiet-board-head,
.rk-clubhouse-stack > div:first-child .rk-quiet-head-closed,
.rk-clubhouse-stack > div:first-child .rk-quiet-head-open{
  border-radius:22px 22px 0 0!important;
}
.rk-clubhouse-stack > div:first-child .rk-quiet-head-closed:after{
  left:0!important;
  right:0!important;
  background:linear-gradient(90deg,rgba(26,20,16,.055),rgba(160,120,40,.18),rgba(26,20,16,.055))!important;
}
.rk-clubhouse-stack > div:first-child .rk-quiet-board-panel{
  border-radius:0!important;
}
.rk-organizer-card{
  margin:18px 0 12px;
  background:linear-gradient(145deg,#F4FBF7 0%,#EAF5EF 100%);
  padding:18px;
  border:1.5px solid rgba(23,107,66,.14);
  border-radius:20px;
  box-shadow:0 8px 24px rgba(23,107,66,.07),inset 0 1px 0 rgba(255,255,255,.72);
}
.rk-organizer-benefits{
  display:grid;
  gap:8px;
  margin:14px 0 16px;
}
.rk-organizer-benefit{
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 11px;
  border-radius:15px;
  background:rgba(255,255,255,.66);
  border:1px solid rgba(23,107,66,.08);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7);
}
.rk-organizer-benefit-dot{
  width:8px;
  height:8px;
  border-radius:999px;
  background:#176B42;
  box-shadow:0 0 0 4px rgba(23,107,66,.08);
  flex-shrink:0;
}
.rk-organizer-benefit-text{
  font-size:12px;
  line-height:1.35;
  color:#1A1410;
  font-weight:850;
}



/* ─── vNext HOMEPAGE BREATHING ROOM + DARKER CLUB GREEN ─────────────────── */
.rk-home-section{margin-bottom:24px!important}
.rk-home-section-lg{margin-bottom:30px!important}
.rk-clubhouse-stack{margin-top:4px!important;margin-bottom:28px!important}
.rk-learn-shell{margin-top:32px!important;margin-bottom:18px!important}
.rk-organizer-card{margin:26px 0 22px!important;padding:22px!important;border-radius:24px!important}
.rk-organizer-benefits{grid-template-columns:1fr 1fr!important;gap:9px!important;margin:16px 0 18px!important}
.rk-organizer-benefit{justify-content:center;padding:12px 10px!important;border-radius:16px!important}
.rk-organizer-benefit-text{text-align:center;font-size:11.5px!important;line-height:1.2!important}
@media(max-width:390px){.rk-organizer-benefits{grid-template-columns:1fr!important}.rk-organizer-card{padding:20px!important}}
.rk-lux-card-dark,.rk-premium-hero,.rk-browser-hero,.rk-improve-hero,.rk-quiet-leader,.rk-social-room-card,.rk-social-lb-feature,.rk-recap-hero,.rk-tutorial-stage{
  background:linear-gradient(150deg,#041F12 0%,#07331E 46%,#0A4328 70%,#03170D 100%)!important;
}
.rk-global-board-home,
.rk-clubhouse-stack > div:first-child,
.rk-clubhouse-stack > div:first-child .rk-quiet-board,
.rk-clubhouse-stack > div:first-child#global-leaderboard{
  border-radius:22px 22px 0 0!important;
}
.rk-global-board-home .rk-quiet-board-head,
.rk-clubhouse-stack > div:first-child .rk-quiet-board-head{
  border-radius:22px 22px 0 0!important;
}
.rk-global-board-home .rk-quiet-board-panel,
.rk-clubhouse-stack > div:first-child .rk-quiet-board-panel{
  border-radius:0!important;
}
.rk-global-board-home .rk-quiet-head-open,
.rk-clubhouse-stack > div:first-child .rk-quiet-head-open{
  border-radius:22px 22px 0 0!important;
}
.rk-global-board-home:has(.rk-quiet-board-panel){border-radius:22px 22px 0 0!important}
.rk-quiet-board-panel{padding-top:16px!important;padding-bottom:18px!important}
.rk-quiet-leader{background:linear-gradient(150deg,#041F12 0%,#07331E 46%,#0A4328 70%,#03170D 100%)!important}

/* ─── vNext SOCIAL PREVIEW BOARDS + IMPROVE GAME OVERHAUL ───────────────── */
@keyframes rkTablePulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(76,217,135,.28),0 0 12px rgba(76,217,135,.46)}50%{transform:scale(1.08);box-shadow:0 0 0 8px rgba(76,217,135,0),0 0 18px rgba(76,217,135,.62)}}
@keyframes rkSocialSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes rkGiltBreath{0%,100%{border-color:rgba(243,212,107,.34);box-shadow:0 0 0 rgba(243,212,107,0),0 7px 20px rgba(26,20,16,.04)}50%{border-color:rgba(243,212,107,.74);box-shadow:0 0 24px rgba(243,212,107,.18),0 10px 26px rgba(26,20,16,.055)}}
@keyframes rkTinyFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.rk-social-preview-board{position:relative;overflow:hidden;border-radius:24px;background:linear-gradient(145deg,#FFFDF8 0%,#F7F0E5 100%);border:1px solid rgba(26,20,16,.078);box-shadow:0 12px 34px rgba(26,20,16,.052),inset 0 1px 0 rgba(255,255,255,.8)}
.rk-social-preview-board:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.64),transparent 36%);pointer-events:none}
.rk-social-preview-head{position:relative;width:100%;border:none;background:transparent;cursor:pointer;text-align:left;padding:18px 16px 16px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.rk-social-kicker-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:9px}
.rk-social-kicker{font-size:9px;letter-spacing:2.25px;text-transform:uppercase;font-weight:950;color:#176B42}
.rk-social-kicker-blue{color:#2460A8}
.rk-social-live-pill{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:5px 9px;background:rgba(23,107,66,.075);border:1px solid rgba(23,107,66,.12);font-size:10px;font-weight:950;color:#176B42;line-height:1}
.rk-social-live-dot{width:8px;height:8px;border-radius:99px;background:#4CD987;animation:rkTablePulse 2.25s ease-in-out infinite;flex-shrink:0}
.rk-social-preview-title{font-family:'Fraunces',Georgia,serif;font-size:21px;line-height:1.03;font-weight:950;letter-spacing:-.5px;color:#1A1410;margin:0 0 11px}
.rk-social-pill-row{display:flex;gap:7px;flex-wrap:wrap}
.rk-social-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 10px;background:rgba(23,107,66,.065);border:1px solid rgba(23,107,66,.10);font-size:11px;font-weight:900;color:#176B42;line-height:1;white-space:nowrap}
.rk-social-pill-blue{background:rgba(36,96,168,.08);border-color:rgba(36,96,168,.13);color:#2460A8}
.rk-social-pill-gold{background:rgba(201,168,76,.13);border-color:rgba(201,168,76,.20);color:#8A6820}
.rk-social-chevron{width:34px;height:34px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(26,20,16,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.78);font-size:12px;font-weight:900;flex-shrink:0}
.rk-social-preview-panel{position:relative;border-top:1px solid rgba(26,20,16,.07);padding:13px 12px 14px;background:linear-gradient(180deg,#FFFDF8 0%,#F4EEE2 100%);animation:rkSocialSlide .24s ease both}
.rk-social-room-card{position:relative;overflow:hidden;border-radius:20px;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11);color:#fff;border:1px solid rgba(201,168,76,.20);box-shadow:0 14px 34px rgba(6,43,24,.18),inset 0 1px 0 rgba(255,255,255,.09);padding:15px;margin-bottom:10px}
.rk-social-room-card:after{content:'🀄';position:absolute;right:-10px;bottom:-24px;font-size:92px;opacity:.05;transform:rotate(-8deg);pointer-events:none}
.rk-social-room-kicker{font-size:9px;letter-spacing:2.4px;text-transform:uppercase;font-weight:950;color:rgba(243,212,107,.84);margin-bottom:8px}
.rk-social-room-main{position:relative;z-index:1;display:flex;align-items:center;gap:12px}
.rk-social-room-avatar{width:44px;height:44px;border-radius:16px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(243,212,107,.28);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',Georgia,serif;font-size:17px;font-weight:950;color:#8A6820;box-shadow:0 4px 12px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.76);flex-shrink:0}
.rk-social-player-list{display:grid;gap:8px}
.rk-social-player-card{display:flex;align-items:center;gap:10px;padding:11px 10px;border-radius:17px;background:rgba(255,255,255,.76);border:1px solid rgba(26,20,16,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.rk-social-player-card-you{background:linear-gradient(145deg,rgba(23,107,66,.095),rgba(255,255,255,.72));border-color:rgba(23,107,66,.18)}
.rk-social-position{width:28px;height:28px;border-radius:999px;background:rgba(26,20,16,.055);color:#6B6157;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:950;flex-shrink:0}
.rk-social-position-top{background:rgba(201,168,76,.17);color:#8A6820;border:1px solid rgba(201,168,76,.24)}
.rk-social-avatar-stack{display:flex;align-items:center;margin-left:2px}
.rk-social-stack-avatar{width:24px;height:24px;border-radius:999px;border:2px solid #FFFDF8;margin-left:-7px;background:linear-gradient(145deg,#E9DDC9,#FFFDF8);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:950;color:#176B42}
.rk-social-board-cta{width:100%;border:none;background:transparent;color:#176B42;font-size:12px;font-weight:950;cursor:pointer;padding:5px 0 10px}
.rk-improve-hero{position:relative;overflow:hidden;border-radius:26px;padding:22px 18px;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11);border:1px solid rgba(201,168,76,.20);box-shadow:0 18px 46px rgba(6,43,24,.21),inset 0 1px 0 rgba(255,255,255,.09);color:#fff;text-align:center;margin:0 0 14px}
.rk-improve-hero:after{content:'🀄';position:absolute;right:-18px;bottom:-28px;font-size:118px;opacity:.045;transform:rotate(-8deg)}
.rk-improve-path-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:15px;position:relative;z-index:1}
.rk-improve-path-chip{border-radius:15px;padding:10px 5px 9px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);text-align:center;min-width:0;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.rk-improve-path-chip strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:15px;line-height:1.05;font-weight:950;color:#F3D46B;margin-bottom:6px;letter-spacing:-.35px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.rk-improve-path-chip span{display:block;font-size:7px;letter-spacing:1.15px;text-transform:uppercase;font-weight:950;color:rgba(255,255,255,.54);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.rk-improve-path-chip-primary strong{font-size:18px;letter-spacing:-.65px}
.rk-improve-path-chip-label strong{font-size:14px;line-height:1.08}
.rk-improve-path-chip-label span{font-size:6.8px;letter-spacing:1px}
@media(max-width:390px){.rk-improve-path-row{gap:6px}.rk-improve-path-chip{padding:9px 4px 8px;border-radius:14px}.rk-improve-path-chip strong{font-size:13px}.rk-improve-path-chip-primary strong{font-size:17px}.rk-improve-path-chip span{font-size:6.5px;letter-spacing:.9px}}
.rk-improve-coach-card{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.075);box-shadow:0 8px 26px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78);padding:16px;margin-bottom:12px;text-align:left}
.rk-improve-coach-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.58),transparent 34%);pointer-events:none}
.rk-improve-action{position:relative;display:flex;align-items:center;gap:13px;width:100%;border-radius:18px;border:1px solid rgba(23,107,66,.12);background:linear-gradient(145deg,#FFFDF8,#F7F0E5);box-shadow:0 6px 20px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.78);padding:14px;cursor:pointer;text-align:left}
.rk-improve-action-dark{background:linear-gradient(135deg,#0D4A2E,#062B18);border-color:rgba(201,168,76,.20);box-shadow:0 12px 28px rgba(6,43,24,.18),inset 0 1px 0 rgba(255,255,255,.10);color:#fff}
.rk-improve-icon{width:44px;height:44px;border-radius:15px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(26,20,16,.08);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.78)}
.rk-home-improve-card{position:relative;overflow:hidden;border:1px solid rgba(201,168,76,.22)!important;background:linear-gradient(145deg,#FFFDF8,#F6F0E5)!important;box-shadow:0 7px 20px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)!important}
.rk-home-improve-card:after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 0%,rgba(201,168,76,.10) 45%,transparent 62%);transform:translateX(-120%);animation:rkGoldSweep 5.4s ease-in-out infinite;pointer-events:none}
.rk-home-improve-card .rk-home-improve-icon{animation:rkTinyFloat 3.7s ease-in-out infinite}


/* ─── vNext DAILY SCORECARD: POST-IMPROVE POLISH ─────────────────────────── */
@keyframes rkReviewGlow{0%,100%{box-shadow:0 9px 26px rgba(26,20,16,.045),0 0 0 rgba(201,168,76,0)}50%{box-shadow:0 12px 34px rgba(26,20,16,.06),0 0 24px rgba(201,168,76,.11)}}
@keyframes rkCoachNudge{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.rk-review-flow{display:flex;flex-direction:column;gap:12px;margin:2px 0 14px}
.rk-review-style-card{position:relative;overflow:hidden;border-radius:24px!important;padding:20px 18px!important;background:linear-gradient(145deg,#F4FBF7,#FFFDF8 62%,#F7F0E5)!important;border:1px solid rgba(23,107,66,.16)!important;box-shadow:0 10px 30px rgba(26,20,16,.05),inset 0 1px 0 rgba(255,255,255,.82)!important;text-align:center!important}
.rk-review-style-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top,rgba(255,255,255,.72),transparent 44%);pointer-events:none}
.rk-review-style-orb{width:54px;height:54px;border-radius:18px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(201,168,76,.22);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:22px;box-shadow:0 8px 18px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.84);animation:rkCoachNudge 4.4s ease-in-out infinite}
.rk-review-style-title{font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1.04;font-weight:950;letter-spacing:-.55px;color:#1A1410;margin:0}
.rk-review-style-note{font-size:14px;line-height:1.62;color:rgba(26,20,16,.62);font-weight:650;max-width:32ch;margin:9px auto 0}
.rk-review-rank-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:2px 0 12px}
.rk-review-rank-card{position:relative;overflow:hidden;border-radius:21px;padding:16px 11px 14px;text-align:center;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.075);box-shadow:0 8px 24px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78);min-width:0;animation:rkReviewGlow 5.2s ease-in-out infinite}
.rk-review-rank-card:after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,transparent 0%,rgba(201,168,76,.09) 46%,transparent 62%);transform:translateX(-120%);animation:rkGoldSweep 5.6s ease-in-out infinite;pointer-events:none}
.rk-review-rank-kicker{font-size:8px;letter-spacing:2px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.46);margin-bottom:7px}
.rk-review-rank-value{font-family:'Fraunces',Georgia,serif;font-size:30px;line-height:.92;font-weight:950;letter-spacing:-1px;color:#176B42}
.rk-review-rank-sub{font-size:10px;font-weight:900;color:#6B6157;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-review-share-card{position:relative;overflow:hidden;border-radius:23px;background:linear-gradient(145deg,#FFFDF8,#F6EFE3);border:1px solid rgba(201,168,76,.18);box-shadow:0 9px 28px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78);padding:14px;margin-bottom:14px}
.rk-review-share-head{display:flex;align-items:center;gap:12px;text-align:left;margin-bottom:12px}
.rk-review-share-icon{width:46px;height:46px;border-radius:16px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(201,168,76,.22);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 5px 13px rgba(26,20,16,.05)}
.rk-review-share-title{font-family:'Fraunces',Georgia,serif;font-size:18px;line-height:1.08;font-weight:950;letter-spacing:-.35px;color:#1A1410}
.rk-review-share-copy{font-size:12px;line-height:1.45;color:rgba(26,20,16,.58);font-weight:650;margin-top:3px}
.rk-review-share-preview{font-family:'Nunito','Segoe UI',sans-serif;font-size:12px;color:#6B6157;background:rgba(26,20,16,.035);border:1px solid rgba(26,20,16,.045);border-radius:16px;padding:11px 12px;margin-bottom:11px;text-align:center;line-height:1.75;font-weight:700}
.rk-review-social-note{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;font-size:11px;color:#176B42;font-weight:900}
.rk-review-social-note .rk-social-live-dot{width:7px;height:7px}
.rk-review-foldout-label{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 10px;background:rgba(23,107,66,.07);border:1px solid rgba(23,107,66,.10);font-size:10px;font-weight:950;color:#176B42;margin:2px auto 12px}
.rk-review-bottom-home{margin-top:16px;display:grid;grid-template-columns:1fr;gap:10px}
@media(max-width:390px){.rk-review-rank-row{gap:8px}.rk-review-rank-card{padding:14px 8px}.rk-review-rank-value{font-size:27px}.rk-review-style-title{font-size:22px}.rk-review-share-preview{font-size:11px}}



/* ─── vNext QUIET SOCIAL LEADERBOARDS + SIGNUP RETURN ───────────────────── */
.rk-quiet-board{position:relative;overflow:hidden;border-radius:24px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.078);box-shadow:0 12px 32px rgba(26,20,16,.046),inset 0 1px 0 rgba(255,255,255,.82)}
.rk-quiet-board:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.64),transparent 34%);pointer-events:none}
.rk-quiet-board-head{position:relative;width:100%;border:none;background:transparent;padding:18px 16px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;text-align:left;cursor:pointer}
.rk-quiet-board-panel{border-top:1px solid rgba(26,20,16,.07);background:linear-gradient(180deg,#FFFDF8,#F5EFE4);padding:12px;animation:rkSocialSlide .22s ease both}
.rk-quiet-kicker{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;font-size:9px;letter-spacing:2.25px;text-transform:uppercase;font-weight:950;color:#176B42}
.rk-quiet-title{font-family:'Fraunces',Georgia,serif;font-size:22px;line-height:1.03;font-weight:950;letter-spacing:-.55px;color:#1A1410;margin:0 0 10px}
.rk-quiet-pill-row{display:flex;gap:7px;flex-wrap:wrap}
.rk-quiet-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:7px 10px;background:rgba(23,107,66,.065);border:1px solid rgba(23,107,66,.10);font-size:11px;font-weight:900;color:#176B42;line-height:1;white-space:nowrap}
.rk-quiet-pill-blue{background:rgba(36,96,168,.08);border-color:rgba(36,96,168,.13);color:#2460A8}
.rk-quiet-pill-gold{background:rgba(201,168,76,.13);border-color:rgba(201,168,76,.20);color:#8A6820}
.rk-quiet-live{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:5px 10px;background:rgba(23,107,66,.075);border:1px solid rgba(23,107,66,.12);font-size:10px;font-weight:950;color:#176B42;line-height:1;letter-spacing:0;text-transform:none}
.rk-quiet-live-dot{width:8px;height:8px;border-radius:999px;background:#4CD987;animation:rkTablePulse 2.25s ease-in-out infinite;flex-shrink:0}
.rk-quiet-chevron{width:34px;height:34px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(26,20,16,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.78);font-size:12px;font-weight:900;flex-shrink:0;color:#176B42}
.rk-quiet-leader{display:flex;align-items:center;gap:13px;border-radius:18px;background:linear-gradient(150deg,#062B18,#0D4A2E 58%,#051F11);border:1px solid rgba(201,168,76,.18);box-shadow:0 12px 28px rgba(6,43,24,.16),inset 0 1px 0 rgba(255,255,255,.08);color:#fff;padding:14px;margin-bottom:10px;position:relative;overflow:hidden}
.rk-quiet-leader:after{content:'🀄';position:absolute;right:-8px;bottom:-24px;font-size:82px;opacity:.045;transform:rotate(-8deg);pointer-events:none}
.rk-quiet-badge{width:42px;height:42px;border-radius:16px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(243,212,107,.28);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',Georgia,serif;font-size:17px;font-weight:950;color:#8A6820;box-shadow:0 4px 12px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.76);flex-shrink:0}
.rk-quiet-row-list{display:grid;gap:8px}
.rk-quiet-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px 12px;border-radius:17px;background:rgba(255,255,255,.78);border:1px solid rgba(26,20,16,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.rk-quiet-row-you{background:linear-gradient(145deg,rgba(23,107,66,.095),rgba(255,255,255,.76));border-color:rgba(23,107,66,.16)}
.rk-quiet-rank{width:30px;height:30px;border-radius:999px;background:rgba(26,20,16,.055);color:#6B6157;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:950;flex-shrink:0}
.rk-quiet-rank-top{background:rgba(201,168,76,.17);color:#8A6820;border:1px solid rgba(201,168,76,.24)}
.rk-quiet-name{font-family:'Fraunces',Georgia,serif;font-size:15px;font-weight:900;color:#1A1410;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.08}
.rk-quiet-sub{font-size:10.5px;color:#6B6157;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-quiet-score{font-family:'Fraunces',Georgia,serif;font-size:24px;font-weight:950;line-height:1;color:#176B42}
.rk-quiet-footer{margin-top:11px;padding-top:11px;border-top:1px solid rgba(26,20,16,.08);text-align:center}
.rk-quiet-link{border:none;background:transparent;color:#176B42;font-size:12px;font-weight:950;cursor:pointer;padding:4px 0 8px}
.rk-email-home{margin-top:14px!important;margin-bottom:20px!important;border-radius:22px!important;padding:18px!important;background:linear-gradient(145deg,#FFFDF8,#F4EFE3)!important;border:1px solid rgba(23,107,66,.14)!important;box-shadow:0 9px 28px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.82)!important;text-align:center!important}
.rk-email-home input{text-align:left!important}
@media(max-width:390px){.rk-quiet-title{font-size:20px}.rk-quiet-board-head{padding:16px 14px}.rk-quiet-pill-row{gap:6px}.rk-quiet-pill{font-size:10.5px;padding:6px 9px}.rk-quiet-leader{padding:13px}.rk-quiet-row{grid-template-columns:30px minmax(0,1fr) auto;padding:10px}.rk-quiet-score{font-size:22px}}



/* ─── vNext CLOSED LEADERBOARDS + SIGNUP ALIGNMENT ───────────────────────── */
.rk-email-home{text-align:left!important}
.rk-email-home p{text-align:left!important;margin-left:0!important;margin-right:0!important}
.rk-email-home input{text-align:left!important}
.rk-quiet-board{border-radius:24px!important;background:linear-gradient(145deg,#FFFDF8 0%,#F6EFE4 100%)!important;border:1px solid rgba(26,20,16,.075)!important;box-shadow:0 10px 28px rgba(26,20,16,.042),inset 0 1px 0 rgba(255,255,255,.82)!important}
.rk-quiet-board-head{padding:15px 15px!important;align-items:center!important;background:linear-gradient(145deg,#FFFDF8 0%,#F7F0E5 100%)!important;min-height:104px}
.rk-quiet-board-head:active{transform:scale(.995)}
.rk-quiet-head-closed{position:relative;overflow:hidden}
.rk-quiet-head-closed:after{content:'';position:absolute;left:16px;right:16px;bottom:0;height:1px;background:linear-gradient(90deg,transparent,rgba(160,120,40,.18),transparent);pointer-events:none}
.rk-quiet-head-open{border-bottom:1px solid rgba(26,20,16,.07)!important}
.rk-quiet-topline{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.rk-quiet-mini-icon{width:32px;height:32px;border-radius:12px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(26,20,16,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.86),0 4px 12px rgba(26,20,16,.04);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.rk-quiet-title{font-size:20px!important;margin:0!important;letter-spacing:-.45px!important}
.rk-quiet-preview-line{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:9px}
.rk-quiet-preview-pill{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:6px 9px;background:rgba(26,20,16,.045);border:1px solid rgba(26,20,16,.055);font-size:10.5px;font-weight:900;color:#6B6157;line-height:1;white-space:nowrap}
.rk-quiet-preview-pill-green{background:rgba(23,107,66,.075);border-color:rgba(23,107,66,.11);color:#176B42}
.rk-quiet-preview-pill-blue{background:rgba(36,96,168,.075);border-color:rgba(36,96,168,.12);color:#2460A8}
.rk-quiet-preview-pill-gold{background:rgba(201,168,76,.13);border-color:rgba(201,168,76,.18);color:#8A6820}
.rk-quiet-live{padding:4px 9px!important;font-size:9.5px!important}
.rk-quiet-chevron{width:36px!important;height:36px!important;border-radius:15px!important;background:linear-gradient(145deg,#FFFDF8,#F0E7D8)!important;color:#176B42!important;transition:transform .18s ease,box-shadow .18s ease}
.rk-quiet-chevron:hover{box-shadow:0 6px 14px rgba(26,20,16,.06),inset 0 1px 0 rgba(255,255,255,.84)}
@media(max-width:390px){.rk-quiet-board-head{padding:14px 13px!important;min-height:98px}.rk-quiet-title{font-size:19px!important}.rk-quiet-preview-line{gap:5px}.rk-quiet-preview-pill{font-size:10px;padding:6px 8px}.rk-quiet-mini-icon{width:30px;height:30px}}

@media (prefers-reduced-motion: reduce){.rk-hero-live,.rk-iq-hero,.rk-soft-glow,.rk-count-live,.rk-streak-copy,.rk-float,.rk-pulse,.rk-live-dot,.rk-sweep:after{animation:none!important}}

/* ─── vNext CONNECTED LEADERBOARD + HOMEPAGE TYPE TUNING ───────────────── */
.rk-global-board-home.rk-global-board-open,
.rk-clubhouse-stack > div:first-child .rk-global-board-home.rk-global-board-open,
.rk-clubhouse-stack > div:first-child .rk-quiet-board.rk-global-board-open{
  border-radius:22px 22px 0 0!important;
  margin-bottom:0!important;
}
.rk-global-board-home.rk-global-board-open .rk-quiet-board-panel{
  border-radius:0!important;
  border-bottom-left-radius:0!important;
  border-bottom-right-radius:0!important;
}
.rk-global-board-home.rk-global-board-open .rk-quiet-head-open,
.rk-global-board-home.rk-global-board-open .rk-quiet-board-head{
  border-radius:22px 22px 0 0!important;
}
.rk-global-board-home.rk-global-board-open + *,
.rk-clubhouse-stack > div:first-child + *{
  margin-top:0!important;
}
.rk-clubhouse-stack{gap:0!important}
.rk-quiet-title{font-size:19px!important;line-height:1.02!important;letter-spacing:-.42px!important}
.rk-quiet-kicker{font-size:8.5px!important;letter-spacing:2.05px!important}
.rk-quiet-preview-pill{font-size:10px!important;padding:6px 8px!important}
.rk-quiet-row{padding:10px 11px!important}
.rk-quiet-name{font-size:14.25px!important}
.rk-quiet-score{font-size:22px!important}
.rk-quiet-leader{padding:13px!important;border-radius:17px!important}
.rk-quiet-badge{width:40px!important;height:40px!important;border-radius:15px!important}
@media(max-width:390px){
  .rk-quiet-title{font-size:18px!important}
  .rk-quiet-board-head{min-height:92px!important;padding:13px 12px!important}
  .rk-quiet-preview-pill{font-size:9.5px!important;padding:5px 7px!important}
  .rk-quiet-mini-icon{width:28px!important;height:28px!important;font-size:14px!important}
  .rk-quiet-chevron{width:34px!important;height:34px!important}
}

/* ─── vNext CLUB ORGANIZER PREMIUM V3 ───────────────────────────────────── */
.rk-organizer-premium{
  position:relative;
  overflow:hidden;
  background:
    radial-gradient(circle at 88% 10%,rgba(201,168,76,.12),transparent 30%),
    linear-gradient(145deg,#F7FCF9 0%,#EAF5EF 100%)!important;
  border:1.5px solid rgba(23,107,66,.16)!important;
  box-shadow:0 12px 34px rgba(23,107,66,.075),inset 0 1px 0 rgba(255,255,255,.78)!important;
}
.rk-organizer-premium:after{
  content:'🀄';position:absolute;right:-14px;bottom:-24px;font-size:96px;opacity:.035;transform:rotate(-8deg);pointer-events:none;
}
.rk-organizer-topline{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;position:relative;z-index:1}
.rk-organizer-topline span:first-child{font-size:9px;color:#176B42;letter-spacing:2.15px;font-weight:950}
.rk-organizer-pill{display:inline-flex;align-items:center;border-radius:999px;padding:5px 9px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.20);color:#8A6820;font-size:10px!important;font-weight:900;letter-spacing:0!important;white-space:nowrap}
.rk-organizer-proof-row{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px;position:relative;z-index:1}
.rk-organizer-proof-row span{display:inline-flex;border-radius:999px;padding:6px 9px;background:rgba(255,255,255,.66);border:1px solid rgba(23,107,66,.09);color:#176B42;font-size:10.5px;font-weight:900;line-height:1;white-space:nowrap}
.rk-organizer-benefits-rich{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin:13px 0 16px!important;position:relative;z-index:1}
.rk-organizer-benefit-rich{justify-content:flex-start!important;text-align:left!important;padding:10px 11px!important;background:rgba(255,255,255,.72)!important}
.rk-organizer-benefit-icon{width:30px;height:30px;border-radius:12px;background:linear-gradient(145deg,#FFFDF8,#EEE4D2);border:1px solid rgba(26,20,16,.07);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.rk-organizer-benefit-sub{display:block;font-size:10.8px;line-height:1.35;color:rgba(26,20,16,.58);font-weight:700;margin-top:2px}
.rk-organizer-benefit-rich .rk-organizer-benefit-text{display:block;text-align:left!important;font-size:12.25px!important;line-height:1.18!important;font-weight:900!important;color:#1A1410!important}
@media(max-width:390px){
  .rk-organizer-proof-row span{font-size:10px;padding:6px 8px}
  .rk-organizer-benefit-rich{padding:10px!important}
}


/* ─── vNext LEADERBOARD SPACING + TYPE REFINEMENT ────────────────────────── */
.rk-clubhouse-stack{
  display:flex!important;
  flex-direction:column!important;
  gap:0!important;
  border-radius:22px!important;
  overflow:hidden!important;
}
.rk-clubhouse-stack > div{
  margin:0!important;
}
.rk-clubhouse-stack > div + div{
  border-top:1px solid rgba(26,20,16,.075)!important;
}
.rk-quiet-board{
  margin:0!important;
  border-radius:0!important;
  box-shadow:none!important;
}
.rk-clubhouse-stack > div:first-child .rk-quiet-board,
.rk-clubhouse-stack > div:first-child .rk-global-board-home,
.rk-global-board-home{
  border-radius:22px 22px 0 0!important;
}
.rk-clubhouse-stack > div:last-child .rk-quiet-board{
  border-radius:0 0 22px 22px!important;
}
.rk-global-board-home.rk-global-board-open,
.rk-global-board-home.rk-global-board-open .rk-quiet-board,
.rk-global-board-home.rk-global-board-open .rk-quiet-board-head,
.rk-global-board-home.rk-global-board-open .rk-quiet-head-open,
.rk-global-board-home.rk-global-board-open .rk-quiet-board-panel,
.rk-clubhouse-stack > div:first-child .rk-quiet-board.rk-global-board-open,
.rk-clubhouse-stack > div:first-child .rk-global-board-open,
.rk-clubhouse-stack > div:first-child .rk-global-board-open .rk-quiet-board-panel{
  border-bottom-left-radius:0!important;
  border-bottom-right-radius:0!important;
}
.rk-global-board-home.rk-global-board-open .rk-quiet-board-panel,
.rk-clubhouse-stack > div:first-child .rk-quiet-board-panel{
  margin-bottom:0!important;
  border-bottom:none!important;
}
.rk-quiet-board-head{
  min-height:96px!important;
  padding:16px 15px!important;
  line-height:1.24!important;
}
.rk-quiet-topline{
  margin-bottom:7px!important;
  gap:8px!important;
}
.rk-quiet-title{
  font-size:18px!important;
  line-height:1.04!important;
  letter-spacing:-.36px!important;
  margin:0 0 8px!important;
}
.rk-quiet-kicker{
  line-height:1.2!important;
}
.rk-quiet-preview-line{
  margin-top:8px!important;
  gap:7px!important;
  line-height:1.2!important;
}
.rk-quiet-preview-pill{
  line-height:1!important;
}
.rk-quiet-board-head p,
.rk-quiet-board-head span,
.rk-quiet-board-head div{
  line-height:1.25;
}
.rk-quiet-chevron{
  width:34px!important;
  height:34px!important;
  border-radius:14px!important;
}
.rk-quiet-board-panel{
  padding:14px 12px 16px!important;
}
.rk-quiet-leader{
  margin-bottom:9px!important;
}
.rk-quiet-row-list{
  gap:8px!important;
}
.rk-quiet-footer{
  margin-top:10px!important;
  padding-top:10px!important;
}
@media(max-width:390px){
  .rk-quiet-board-head{min-height:88px!important;padding:14px 12px!important;}
  .rk-quiet-title{font-size:17px!important;line-height:1.05!important;margin-bottom:7px!important;}
  .rk-quiet-preview-line{gap:5px!important;margin-top:7px!important;}
  .rk-quiet-chevron{width:32px!important;height:32px!important;}
}

/* ─── vNext DESKTOP RESPONSIVE + PREMIUM PLAY BUTTON ─────────────────────── */
@keyframes rkPlayInvite{0%,100%{transform:translateY(-8px) scale(1);box-shadow:0 18px 38px rgba(0,0,0,.25),0 0 0 1px rgba(243,212,107,.25),0 0 0 0 rgba(243,212,107,0),inset 0 1px 0 rgba(255,255,255,.9),inset 0 -10px 20px rgba(160,120,40,.10)}50%{transform:translateY(-10px) scale(1.025);box-shadow:0 22px 44px rgba(0,0,0,.29),0 0 0 1px rgba(243,212,107,.38),0 0 0 8px rgba(243,212,107,.055),inset 0 1px 0 rgba(255,255,255,.92),inset 0 -10px 20px rgba(160,120,40,.12)}}
@keyframes rkPlayRing{0%,100%{opacity:.68;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
.rk-play-button-premium{
  width:84px!important;
  height:84px!important;
  border-radius:999px!important;
  background:radial-gradient(circle at 38% 28%,#FFFFFF 0%,#FFFDF8 34%,#EFE3CF 100%)!important;
  border:2px solid rgba(26,20,16,.22)!important;
  box-shadow:0 18px 38px rgba(0,0,0,.25),0 0 0 1px rgba(243,212,107,.25),inset 0 1px 0 rgba(255,255,255,.9),inset 0 -10px 20px rgba(160,120,40,.10)!important;
  animation:rkPlayInvite 4.2s ease-in-out infinite!important;
}
.rk-play-button-premium:before{
  content:"";
  position:absolute;
  inset:8px;
  border-radius:999px;
  border:1.5px solid rgba(201,168,76,.42);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 0 18px rgba(201,168,76,.10);
  animation:rkPlayRing 3.2s ease-in-out infinite;
  pointer-events:none;
}
.rk-play-button-premium:after{
  content:"PLAY";
  position:absolute;
  bottom:13px;
  left:0;
  right:0;
  text-align:center;
  font-size:6.5px;
  line-height:1;
  letter-spacing:1.6px;
  font-weight:950;
  color:rgba(26,20,16,.54);
  z-index:2;
}
.rk-daily-hero-card:hover .rk-play-button-premium{animation-play-state:paused!important;transform:translateY(-12px) scale(1.045)!important;box-shadow:0 26px 54px rgba(0,0,0,.31),0 0 0 1px rgba(243,212,107,.48),0 0 24px rgba(243,212,107,.18),inset 0 1px 0 rgba(255,255,255,.94),inset 0 -10px 20px rgba(160,120,40,.13)!important;}
.rk-play-triangle{border-left-color:#11100E!important;filter:drop-shadow(0 1px 0 rgba(255,255,255,.42)) drop-shadow(0 3px 5px rgba(0,0,0,.10))!important;margin-top:-7px!important;}
.rk-daily-hero-card:active .rk-play-button-premium{transform:translateY(-6px) scale(.97)!important;}

@media(min-width:900px){
  .rk-outer{padding:32px 24px 52px!important;background:radial-gradient(circle at top,#FFFDF8 0%,#F8F4EE 42%,#EFE7DA 100%)!important;}
  .rk-app{width:min(1180px,calc(100vw - 48px))!important;max-width:1180px!important;border-radius:28px!important;overflow:hidden!important;border:1px solid rgba(26,20,16,.08)!important;box-shadow:0 24px 90px rgba(26,20,16,.14),0 0 0 1px rgba(255,255,255,.72) inset!important;background:linear-gradient(180deg,#F8F4EE 0%,#F4EDDF 100%)!important;}
  .rk-pg{padding:30px 34px 64px!important;}
  .rk-home-responsive-shell{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(360px,.88fr);gap:28px;align-items:start;}
  .rk-home-main-col,.rk-home-side-col{min-width:0;}
  .rk-home-side-col{position:sticky;top:24px;align-self:start;}
  .rk-daily-hero-card{min-height:430px!important;border-radius:30px!important;margin-bottom:28px!important;}
  .rk-daily-hero-card>div:last-child{padding:30px 30px 26px!important;}
  .rk-daily-hero-card .rk-play-button-premium{width:104px!important;height:104px!important;}
  .rk-daily-hero-card .rk-play-triangle{border-top-width:16px!important;border-bottom-width:16px!important;border-left-width:25px!important;}
  .rk-learn-shell{margin-top:22px!important;}
}
@media(min-width:1180px){
  .rk-home-responsive-shell{grid-template-columns:minmax(0,1.18fr) 410px;gap:34px;}
  .rk-pg{padding-left:42px!important;padding-right:42px!important;}
}
@media(min-width:900px){
  .rk-pg:not(:has(.rk-home-responsive-shell)){max-width:760px!important;margin:0 auto!important;width:100%!important;}
}


/* ─── vNext DESKTOP STARTUP RESPONSIVE + FOOTER + CTA POLISH ────────────── */
@keyframes rkPlayPressMe{0%,100%{transform:translateY(-8px) scale(1);box-shadow:0 18px 38px rgba(0,0,0,.28),0 0 0 1px rgba(243,212,107,.38),0 0 0 0 rgba(243,212,107,0),inset 0 2px 0 rgba(255,255,255,.95),inset 0 -12px 22px rgba(160,120,40,.16)}50%{transform:translateY(-11px) scale(1.028);box-shadow:0 24px 52px rgba(0,0,0,.34),0 0 0 1px rgba(243,212,107,.62),0 0 0 10px rgba(243,212,107,.06),0 0 24px rgba(243,212,107,.16),inset 0 2px 0 rgba(255,255,255,.96),inset 0 -12px 24px rgba(160,120,40,.20)}}
@keyframes rkPlayArrowNudge{0%,100%{transform:translateX(0)}50%{transform:translateX(2px)}}
.rk-play-button-premium{
  width:92px!important;
  height:92px!important;
  background:radial-gradient(circle at 36% 26%,#FFFFFF 0%,#FFFDF8 34%,#F1E5CF 73%,#E7D4B3 100%)!important;
  border:2px solid rgba(26,20,16,.30)!important;
  box-shadow:0 18px 38px rgba(0,0,0,.28),0 0 0 1px rgba(243,212,107,.38),inset 0 2px 0 rgba(255,255,255,.95),inset 0 -12px 22px rgba(160,120,40,.16)!important;
  animation:rkPlayPressMe 3.8s ease-in-out infinite!important;
}
.rk-play-button-premium:before{inset:9px!important;border:2px solid rgba(201,168,76,.48)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 0 22px rgba(201,168,76,.14)!important}
.rk-play-button-premium:after{bottom:14px!important;font-size:7px!important;letter-spacing:1.8px!important;color:rgba(26,20,16,.62)!important}
.rk-play-triangle{animation:rkPlayArrowNudge 2.4s ease-in-out infinite!important;border-left-color:#11100E!important;margin-top:-7px!important}
.rk-daily-hero-card:hover .rk-play-button-premium{transform:translateY(-12px) scale(1.055)!important;box-shadow:0 28px 60px rgba(0,0,0,.36),0 0 0 1px rgba(243,212,107,.70),0 0 30px rgba(243,212,107,.20),inset 0 2px 0 rgba(255,255,255,.98),inset 0 -12px 24px rgba(160,120,40,.22)!important}
.rk-daily-hero-card:hover .rk-play-triangle{animation-play-state:paused!important}
.rk-learn-head .rk-quiet-chevron{margin-left:auto}
.rk-learn-item{line-height:1.25!important}
.rk-learn-item-title{display:block;font-family:'Fraunces',Georgia,serif;font-size:15px;font-weight:900;color:#1A1410;line-height:1.06;letter-spacing:-.2px}
.rk-learn-item-sub{display:block;font-size:11px;color:#6B6157;line-height:1.35;margin-top:5px;font-weight:650}
.rk-desktop-only{display:none!important}
.rk-footer{width:100%;text-align:center;padding:34px 0 84px;margin-top:20px;opacity:.88}
.rk-desktop-insight-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 16px}
.rk-web-data-card{background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.075);border-radius:20px;box-shadow:0 8px 26px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78);padding:16px;overflow:hidden;position:relative}
.rk-web-data-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.58),transparent 38%);pointer-events:none}
.rk-web-data-kicker{font-size:8px;letter-spacing:2.25px;text-transform:uppercase;font-weight:950;color:#176B42;margin-bottom:7px;position:relative}
.rk-web-data-title{font-family:'Fraunces',Georgia,serif;font-size:19px;line-height:1.05;font-weight:950;letter-spacing:-.45px;color:#1A1410;margin:0 0 7px;position:relative}
.rk-web-data-copy{font-size:12px;line-height:1.55;color:#6B6157;font-weight:650;margin:0;position:relative}
.rk-web-metric-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:18px 0 0}
.rk-web-metric{border-radius:18px;padding:14px 12px;background:rgba(255,255,255,.72);border:1px solid rgba(26,20,16,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.8);text-align:center}
.rk-web-metric strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:25px;line-height:1;color:#176B42;letter-spacing:-.9px;margin-bottom:7px}
.rk-web-metric span{font-size:8px;letter-spacing:1.7px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.50)}
.rk-web-footer-band{display:none}

@media(min-width:900px){
  .rk-desktop-only{display:block!important}
  .rk-outer{padding:0!important;background:radial-gradient(circle at 50% -120px,#FFFDF8 0%,#F8F4EE 42%,#EFE7DA 100%)!important}
  .rk-app{width:100%!important;max-width:none!important;min-height:100vh!important;border-radius:0!important;margin-top:0!important;border:none!important;box-shadow:none!important;background:linear-gradient(180deg,#F8F4EE 0%,#F3EBDC 100%)!important}
  .rk-pg{max-width:1240px!important;margin:0 auto!important;padding:34px 42px 0!important}
  .rk-home-responsive-shell{grid-template-columns:minmax(0,1.12fr) minmax(380px,.88fr)!important;gap:34px!important;align-items:start!important}
  .rk-home-main-col{display:flex;flex-direction:column;gap:0;min-width:0}
  .rk-home-side-col{position:sticky;top:28px;align-self:start;min-width:0}
  .rk-daily-hero-card{min-height:456px!important;border-radius:32px!important;margin-bottom:30px!important}
  .rk-daily-hero-card>div:last-child{padding:34px 34px 30px!important}
  .rk-daily-hero-card .rk-play-button-premium{width:118px!important;height:118px!important;right:46px!important}
  .rk-daily-hero-card .rk-play-triangle{border-top-width:18px!important;border-bottom-width:18px!important;border-left-width:29px!important;margin-top:-8px!important}
  .rk-home-desktop-panel{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:-10px;margin-bottom:22px}
  .rk-home-desktop-wide{grid-column:1/-1}
  .rk-learn-item{min-height:76px!important;padding:16px!important;gap:14px!important}
  .rk-learn-item-title{font-size:16px!important;line-height:1.05!important}
  .rk-learn-item-sub{font-size:12px!important;line-height:1.38!important;margin-top:6px!important}
  .rk-footer{display:block!important;max-width:none!important;width:100vw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important;margin-top:44px!important;padding:36px 42px 44px!important;background:linear-gradient(180deg,#EFE7DA 0%,#E8DECE 100%);border-top:1px solid rgba(26,20,16,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.66)}
  .rk-footer-inner{max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr auto;align-items:center;gap:22px;text-align:left}
  .rk-footer-actions{justify-content:flex-end!important;margin-top:0!important}
  .rk-web-footer-band{display:block;margin-top:20px}
}
@media(min-width:1180px){
  .rk-home-responsive-shell{grid-template-columns:minmax(0,1.22fr) 430px!important;gap:40px!important}
  .rk-pg{padding-left:54px!important;padding-right:54px!important}
}
@media(max-width:899px){
  .rk-footer-inner{display:block;text-align:center}
}


/* ─── vNext DESKTOP DAILY HERO POLISH ─────────────────────────────────────
   Makes the web/tablet Daily Rackle card feel designed for wide screens,
   not just a stretched mobile card.
*/
@media(min-width:900px){
  .rk-daily-hero-card{
    min-height:410px!important;
    border-radius:34px!important;
    margin-bottom:32px!important;
    box-shadow:
      0 28px 80px rgba(3,23,13,.26),
      0 0 0 1px rgba(201,168,76,.16),
      inset 0 1px 0 rgba(255,255,255,.08)!important;
  }

  .rk-daily-hero-card > div:last-child{
    min-height:410px!important;
    padding:34px 48px 36px!important;
    display:grid!important;
    grid-template-rows:auto 1fr auto auto!important;
    gap:0!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(1){
    margin-bottom:22px!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(1) > div:first-child{
    padding:7px 14px!important;
    border-color:rgba(255,255,255,.24)!important;
    background:rgba(255,255,255,.14)!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(1) > div:last-child{
    font-size:11px!important;
    letter-spacing:.2px!important;
    color:rgba(255,255,255,.78)!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(2){
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 320px!important;
    align-items:center!important;
    gap:56px!important;
    min-height:174px!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child{
    max-width:520px!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:first-child{
    font-size:42px!important;
    line-height:.98!important;
    letter-spacing:-1.35px!important;
    margin-bottom:18px!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:nth-child(2){
    font-size:17px!important;
    line-height:1.55!important;
    max-width:440px!important;
    color:rgba(255,255,255,.82)!important;
  }

  .rk-daily-hero-card .rk-play-button-premium{
    justify-self:center!important;
    align-self:center!important;
    width:138px!important;
    height:138px!important;
    transform:none!important;
    margin-top:0!important;
    background:
      radial-gradient(circle at 34% 26%,#FFFFFF 0%,#FFFDF8 31%,#F3E7D0 67%,#DECAA6 100%)!important;
    border:2.5px solid rgba(26,20,16,.34)!important;
    box-shadow:
      0 30px 70px rgba(0,0,0,.33),
      0 0 0 1px rgba(243,212,107,.55),
      0 0 44px rgba(243,212,107,.14),
      inset 0 3px 0 rgba(255,255,255,.96),
      inset 0 -14px 26px rgba(160,120,40,.20)!important;
  }

  .rk-daily-hero-card .rk-play-button-premium:before{
    inset:12px!important;
    border:2px solid rgba(201,168,76,.58)!important;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.86),
      0 0 24px rgba(201,168,76,.18)!important;
  }

  .rk-daily-hero-card .rk-play-button-premium:after{
    bottom:20px!important;
    font-size:8px!important;
    letter-spacing:2.1px!important;
    color:rgba(26,20,16,.58)!important;
  }

  .rk-daily-hero-card .rk-play-triangle{
    border-top-width:20px!important;
    border-bottom-width:20px!important;
    border-left-width:32px!important;
    margin-left:8px!important;
    margin-top:-9px!important;
  }

  .rk-daily-hero-card:hover .rk-play-button-premium{
    transform:translateY(-3px) scale(1.025)!important;
    box-shadow:
      0 34px 78px rgba(0,0,0,.37),
      0 0 0 1px rgba(243,212,107,.74),
      0 0 56px rgba(243,212,107,.22),
      inset 0 3px 0 rgba(255,255,255,.98),
      inset 0 -14px 28px rgba(160,120,40,.22)!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(3){
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    gap:16px!important;
    margin-top:34px!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(3) > div{
    min-height:88px!important;
    border-radius:18px!important;
    padding:18px 20px!important;
    background:rgba(255,255,255,.105)!important;
    border:1px solid rgba(255,255,255,.18)!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 10px 22px rgba(0,0,0,.06)!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(3) > div > div:first-child{
    font-size:28px!important;
    letter-spacing:-.8px!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(3) > div > div:last-child{
    font-size:9px!important;
    letter-spacing:1.7px!important;
    margin-top:10px!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(4){
    margin-top:18px!important;
    padding:16px 20px!important;
    border-radius:19px!important;
    background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(23,107,66,.16))!important;
    border:1px solid rgba(224,194,99,.38)!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;
  }

  .rk-daily-hero-card > div:last-child > div:nth-child(4) > div:first-child > div:last-child{
    font-size:17px!important;
    line-height:1.2!important;
  }
}

@media(min-width:1200px){
  .rk-daily-hero-card{
    min-height:430px!important;
  }
  .rk-daily-hero-card > div:last-child{
    min-height:430px!important;
    padding:38px 58px 40px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2){
    grid-template-columns:minmax(0,1fr) 360px!important;
    gap:70px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:first-child{
    font-size:48px!important;
    letter-spacing:-1.6px!important;
  }
  .rk-daily-hero-card .rk-play-button-premium{
    width:150px!important;
    height:150px!important;
  }
  .rk-daily-hero-card .rk-play-triangle{
    border-top-width:22px!important;
    border-bottom-width:22px!important;
    border-left-width:35px!important;
  }
}

@media(min-width:900px) and (max-width:1080px){
  .rk-daily-hero-card > div:last-child{
    padding:30px 36px 34px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2){
    grid-template-columns:minmax(0,1fr) 230px!important;
    gap:32px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:first-child{
    font-size:36px!important;
  }
  .rk-daily-hero-card .rk-play-button-premium{
    width:124px!important;
    height:124px!important;
  }
}


/* ─── vNext WEB HERO BALANCE + LEADERBOARD RHYTHM PATCH ──────────────────
   Fixes wide/tablet Daily Rackle hero, relaxes leaderboard spacing,
   and swaps text triangles for Rackle chevrons.
*/
.rk-chevron-mark{
  width:10px;
  height:10px;
  border-right:2px solid currentColor;
  border-bottom:2px solid currentColor;
  transform:rotate(45deg) translateY(-1px);
  transition:transform .18s ease;
  display:block;
}
.rk-chevron-mark-open{
  transform:rotate(225deg) translateY(-1px);
}
.rk-quiet-chevron{font-size:0!important;}

.rk-quiet-board-head{
  padding:22px 18px!important;
  min-height:unset!important;
  align-items:center!important;
}
.rk-quiet-topline{margin-bottom:10px!important;}
.rk-quiet-title{
  line-height:1.14!important;
  margin-bottom:10px!important;
}
.rk-quiet-preview-line{
  margin-top:10px!important;
  gap:8px!important;
  row-gap:8px!important;
}
.rk-quiet-board-panel{
  padding:18px 16px 20px!important;
}
.rk-quiet-leader{
  margin-bottom:14px!important;
}
.rk-quiet-row-list{gap:11px!important;}
.rk-quiet-row{
  padding:13px 14px!important;
  gap:12px!important;
}
.rk-quiet-name{line-height:1.18!important;}
.rk-quiet-sub{
  margin-top:5px!important;
  line-height:1.35!important;
}
.rk-clubhouse-stack > div:not(:last-child){
  border-bottom:1px solid rgba(26,20,16,.09)!important;
}

@media(min-width:900px){
  .rk-daily-hero-card{
    min-height:500px!important;
    max-width:100%!important;
    border-radius:34px!important;
    overflow:hidden!important;
  }
  .rk-daily-hero-card > div:last-child{
    min-height:500px!important;
    padding:40px 54px 42px!important;
    display:grid!important;
    grid-template-rows:auto minmax(0,1fr) auto auto!important;
    gap:0!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(1){
    margin-bottom:26px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2){
    display:grid!important;
    grid-template-columns:minmax(360px, .88fr) minmax(260px, .72fr)!important;
    align-items:center!important;
    gap:42px!important;
    min-height:190px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child{
    max-width:520px!important;
    min-width:0!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:first-child{
    font-size:clamp(44px,4.1vw,66px)!important;
    line-height:.96!important;
    letter-spacing:-1.7px!important;
    margin-bottom:18px!important;
    max-width:10.5ch!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:nth-child(2){
    font-size:18px!important;
    line-height:1.45!important;
    max-width:30ch!important;
    color:rgba(255,255,255,.82)!important;
  }
  .rk-daily-hero-card .rk-play-button-premium{
    justify-self:center!important;
    align-self:center!important;
    width:132px!important;
    height:132px!important;
    right:auto!important;
    top:auto!important;
    transform:none!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(3){
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    gap:14px!important;
    margin-top:34px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(3) > div{
    min-height:84px!important;
    padding:17px 18px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(4){
    margin-top:18px!important;
    padding:18px 20px!important;
  }
  .rk-home-responsive-shell{
    grid-template-columns:minmax(0,1.1fr) minmax(370px,.9fr)!important;
    gap:40px!important;
  }
}

@media(min-width:1180px){
  .rk-daily-hero-card{min-height:520px!important;}
  .rk-daily-hero-card > div:last-child{
    min-height:520px!important;
    padding:46px 64px 46px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2){
    grid-template-columns:minmax(420px,.95fr) minmax(320px,.7fr)!important;
    gap:54px!important;
  }
  .rk-daily-hero-card .rk-play-button-premium{
    width:148px!important;
    height:148px!important;
  }
}

@media(min-width:900px) and (max-width:1080px){
  .rk-daily-hero-card{min-height:470px!important;}
  .rk-daily-hero-card > div:last-child{
    min-height:470px!important;
    padding:34px 38px 38px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2){
    grid-template-columns:minmax(320px,.95fr) minmax(210px,.65fr)!important;
    gap:30px!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:first-child{
    font-size:40px!important;
    max-width:10.25ch!important;
  }
  .rk-daily-hero-card > div:last-child > div:nth-child(2) > div:first-child > div:nth-child(2){
    font-size:16px!important;
  }
  .rk-daily-hero-card .rk-play-button-premium{
    width:112px!important;
    height:112px!important;
  }
}

@media(max-width:899px){
  .rk-quiet-board-head{padding:18px 15px!important;}
  .rk-quiet-board-panel{padding:16px 14px 18px!important;}
  .rk-quiet-row{padding:12px 12px!important;}
}


/* ─── vNext WEB HERO RENDER FIX + LEADERBOARD SPACING ───────────────────── */
@media(min-width:900px){
  .rk-daily-hero-card{
    min-height:auto!important;
    border-radius:36px!important;
    overflow:hidden!important;
    max-width:100%!important;
    box-shadow:0 26px 86px rgba(3,23,13,.25),0 0 0 1px rgba(201,168,76,.16),inset 0 1px 0 rgba(255,255,255,.08)!important;
  }
  .rk-daily-hero-inner{
    min-height:auto!important;
    padding:50px 62px 48px!important;
    display:grid!important;
    grid-template-columns:minmax(0,1.28fr) minmax(240px,.72fr)!important;
    grid-template-areas:
      "top top"
      "copy play"
      "stats stats"
      "tomorrow tomorrow"!important;
    column-gap:64px!important;
    row-gap:30px!important;
    align-items:center!important;
  }
  .rk-daily-hero-top{grid-area:top!important;margin:0!important;align-items:center!important;}
  .rk-daily-hero-main{grid-area:copy / copy / play / play!important;display:contents!important;}
  .rk-daily-hero-copy{grid-area:copy!important;max-width:760px!important;min-width:0!important;}
  .rk-daily-hero-title{font-size:clamp(52px,5.1vw,76px)!important;line-height:.94!important;letter-spacing:-2px!important;max-width:none!important;margin:0 0 24px!important;text-wrap:balance!important;}
  .rk-daily-hero-title br{display:none!important;}
  .rk-daily-hero-title span{display:block!important;}
  .rk-daily-hero-subcopy{font-size:19px!important;line-height:1.52!important;max-width:46ch!important;color:rgba(255,255,255,.84)!important;}
  .rk-daily-hero-card .rk-play-button-premium{grid-area:play!important;justify-self:center!important;align-self:center!important;position:relative!important;right:auto!important;top:auto!important;width:146px!important;height:146px!important;transform:none!important;margin:0!important;}
  .rk-daily-hero-card .rk-play-button-premium:after{bottom:20px!important;}
  .rk-daily-hero-card .rk-play-triangle{border-top-width:21px!important;border-bottom-width:21px!important;border-left-width:34px!important;margin-left:9px!important;margin-top:-9px!important;}
  .rk-daily-hero-stats{grid-area:stats!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:18px!important;margin:2px 0 0!important;}
  .rk-daily-hero-stat{min-height:96px!important;border-radius:20px!important;padding:20px 22px!important;background:rgba(255,255,255,.11)!important;border:1px solid rgba(255,255,255,.18)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 10px 24px rgba(0,0,0,.07)!important;}
  .rk-daily-hero-stat > div:first-child{font-size:31px!important;line-height:1!important;}
  .rk-daily-hero-stat > div:last-child{font-size:9px!important;line-height:1.25!important;margin-top:12px!important;letter-spacing:1.8px!important;}
  .rk-daily-hero-tomorrow{grid-area:tomorrow!important;margin:0!important;padding:20px 24px!important;border-radius:22px!important;}
  .rk-daily-hero-tomorrow > div:first-child > div:last-child{font-size:19px!important;line-height:1.22!important;white-space:normal!important;}
}
@media(min-width:900px) and (max-width:1120px){
  .rk-daily-hero-inner{padding:42px 44px 42px!important;grid-template-columns:minmax(0,1fr) minmax(190px,.55fr)!important;column-gap:38px!important;row-gap:26px!important;}
  .rk-daily-hero-title{font-size:clamp(44px,5.2vw,58px)!important;letter-spacing:-1.5px!important;}
  .rk-daily-hero-subcopy{font-size:17px!important;max-width:38ch!important;}
  .rk-daily-hero-card .rk-play-button-premium{width:124px!important;height:124px!important;}
  .rk-daily-hero-card .rk-play-triangle{border-top-width:18px!important;border-bottom-width:18px!important;border-left-width:29px!important;}
  .rk-daily-hero-stat{min-height:86px!important;padding:17px 18px!important;}
}
@media(min-width:1280px){
  .rk-daily-hero-inner{padding:58px 74px 54px!important;column-gap:78px!important;}
  .rk-daily-hero-title{font-size:80px!important;}
  .rk-daily-hero-card .rk-play-button-premium{width:156px!important;height:156px!important;}
}

/* Leaderboard rhythm: easier scan, less cramped */
.rk-quiet-board-head{padding:26px 22px!important;}
.rk-quiet-topline{margin-bottom:13px!important;gap:10px!important;}
.rk-quiet-kicker{line-height:1.35!important;}
.rk-quiet-title{line-height:1.16!important;margin-bottom:12px!important;}
.rk-quiet-preview-line{gap:10px!important;row-gap:10px!important;margin-top:12px!important;}
.rk-quiet-preview-pill{line-height:1.1!important;padding:8px 12px!important;}
.rk-quiet-board-panel{padding:22px 20px 24px!important;}
.rk-quiet-leader{margin-bottom:16px!important;padding:18px!important;}
.rk-quiet-row-list{gap:12px!important;}
.rk-quiet-row{padding:15px 16px!important;gap:14px!important;}
.rk-quiet-name{line-height:1.18!important;}
.rk-quiet-sub{line-height:1.4!important;margin-top:6px!important;}
.rk-quiet-chevron{font-size:0!important;}
.rk-quiet-chevron > .rk-chevron-mark{margin:auto!important;}


/* ─── vNext FINAL HERO + LEADERBOARD VIEW FIXES ─────────────────────────── */
.rk-quiet-desc{
  font-size:12px;
  line-height:1.45;
  color:rgba(26,20,16,.58);
  font-weight:700;
  margin:-4px 0 11px;
}
.rk-quiet-board-head{padding:20px 18px!important;}
.rk-quiet-topline{margin-bottom:8px!important;gap:8px!important;align-items:center!important;}
.rk-quiet-mini-icon{width:30px!important;height:30px!important;font-size:14px!important;}
.rk-quiet-kicker{line-height:1.18!important;}
.rk-quiet-title{line-height:1.08!important;margin-bottom:7px!important;}
.rk-quiet-preview-line{margin-top:7px!important;gap:7px!important;row-gap:7px!important;}
.rk-quiet-board-panel{padding:18px 16px 20px!important;}
.rk-quiet-row-list{gap:10px!important;}
.rk-quiet-row{padding:13px 14px!important;}

/* Mobile: remove PLAY text and flatten the button slightly */
@media(max-width:899px){
  .rk-play-button-premium{
    width:76px!important;
    height:76px!important;
    transform:translateY(-4px)!important;
    border-width:1.5px!important;
    box-shadow:0 10px 22px rgba(0,0,0,.20),0 0 0 1px rgba(243,212,107,.24),inset 0 1px 0 rgba(255,255,255,.90),inset 0 -5px 12px rgba(160,120,40,.08)!important;
    animation:none!important;
  }
  .rk-play-button-premium:before{inset:7px!important;border-width:1px!important;animation:none!important;}
  .rk-play-button-premium:after{content:none!important;display:none!important;}
  .rk-play-triangle{margin-top:0!important;border-top-width:12px!important;border-bottom-width:12px!important;border-left-width:19px!important;animation:none!important;}
}

/* Web/tablet: force a balanced hero and keep play visible */
@media(min-width:900px){
  .rk-daily-hero-card{
    min-height:auto!important;
    max-width:1100px!important;
    margin-left:auto!important;
    margin-right:auto!important;
    border-radius:34px!important;
  }
  .rk-daily-hero-inner{
    min-height:520px!important;
    padding:56px 64px 52px!important;
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 260px!important;
    grid-template-areas:
      "top top"
      "copy play"
      "stats stats"
      "tomorrow tomorrow"!important;
    column-gap:58px!important;
    row-gap:28px!important;
    align-items:center!important;
  }
  .rk-daily-hero-top{grid-area:top!important;margin:0!important;}
  .rk-daily-hero-main{display:contents!important;}
  .rk-daily-hero-copy{grid-area:copy!important;max-width:660px!important;display:block!important;}
  .rk-daily-hero-title{
    font-size:clamp(48px,5vw,72px)!important;
    line-height:.96!important;
    letter-spacing:-1.8px!important;
    margin:0 0 22px!important;
    max-width:760px!important;
  }
  .rk-daily-hero-title br{display:none!important;}
  .rk-daily-hero-title span{display:block!important;}
  .rk-daily-hero-subcopy{
    font-size:18px!important;
    line-height:1.52!important;
    max-width:34ch!important;
  }
  .rk-daily-hero-card .rk-play-button-premium{
    grid-area:play!important;
    display:flex!important;
    visibility:visible!important;
    opacity:1!important;
    justify-self:center!important;
    align-self:center!important;
    position:relative!important;
    right:auto!important;
    top:auto!important;
    width:132px!important;
    height:132px!important;
    transform:none!important;
    margin:0!important;
    z-index:8!important;
  }
  .rk-daily-hero-card .rk-play-button-premium:after{content:none!important;display:none!important;}
  .rk-daily-hero-card .rk-play-triangle{
    border-top-width:20px!important;
    border-bottom-width:20px!important;
    border-left-width:32px!important;
    margin-left:8px!important;
    margin-top:0!important;
  }
  .rk-daily-hero-stats{
    grid-area:stats!important;
    display:grid!important;
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    gap:18px!important;
    margin:4px 0 0!important;
  }
  .rk-daily-hero-stat{min-height:92px!important;border-radius:20px!important;padding:18px 22px!important;}
  .rk-daily-hero-tomorrow{grid-area:tomorrow!important;margin:0!important;padding:18px 24px!important;border-radius:22px!important;}
}
@media(min-width:900px) and (max-width:1080px){
  .rk-daily-hero-inner{grid-template-columns:minmax(0,1fr) 210px!important;padding:44px 44px 42px!important;column-gap:34px!important;min-height:470px!important;}
  .rk-daily-hero-title{font-size:clamp(42px,5vw,56px)!important;}
  .rk-daily-hero-subcopy{font-size:16px!important;}
  .rk-daily-hero-card .rk-play-button-premium{width:112px!important;height:112px!important;}
  .rk-daily-hero-card .rk-play-triangle{border-top-width:17px!important;border-bottom-width:17px!important;border-left-width:27px!important;}
}




/* ─── vNext HERO SPACING + SOCIAL RETENTION POLISH ───────────────────────── */
.rk-home-ritual-hero{
  padding-top:32px!important;
  padding-bottom:30px!important;
}
.rk-home-ritual-hero .rk-hero-tile{
  margin-bottom:12px!important;
}
.rk-home-ritual-hero .rk-hero-logo{
  margin-bottom:13px!important;
}
.rk-home-ritual-hero .rk-hero-subtitle{
  margin-top:0!important;
  margin-bottom:18px!important;
  line-height:1.32!important;
}
.rk-home-ritual-hero .rk-hero-status{
  margin-top:0!important;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.rk-home-ritual-hero .rk-hero-status p{
  line-height:1.5!important;
}
.rk-social-presence-wrap{
  margin-top:8px!important;
  margin-bottom:26px!important;
}
.rk-club-active-pill{
  min-height:36px!important;
  padding:9px 15px!important;
  border-radius:999px!important;
  background:linear-gradient(180deg,rgba(23,107,66,.075),rgba(23,107,66,.045))!important;
  border:1px solid rgba(23,107,66,.16)!important;
  box-shadow:0 5px 16px rgba(23,107,66,.06),inset 0 1px 0 rgba(255,255,255,.68)!important;
}
.rk-club-active-pill span:last-child{
  font-size:12px!important;
  line-height:1.2!important;
  letter-spacing:.05px!important;
}
.rk-live-dot-dynamic{
  width:9px!important;
  height:9px!important;
}
@media(max-width:420px){
  .rk-home-ritual-hero{padding-top:28px!important;padding-bottom:26px!important;}
  .rk-home-ritual-hero .rk-hero-tile{margin-bottom:11px!important;}
  .rk-home-ritual-hero .rk-hero-logo{margin-bottom:12px!important;}
  .rk-home-ritual-hero .rk-hero-subtitle{margin-bottom:17px!important;}
  .rk-social-presence-wrap{margin-top:7px!important;margin-bottom:24px!important;}
}

/* Make the completed-score card breathe better below the hero */
.rk-home-ritual-hero + .rk-social-presence-wrap + .rk-home-section-lg,
.rk-social-presence-wrap + .rk-home-section-lg{
  margin-top:6px!important;
}


/* ─── vNext FOOTER + CLOSED LEADERBOARD + HERO PILL TUNE ─────────────────── */
.rk-footer > .rk-footer-inner > div:first-child > div[aria-hidden="true"]{
  margin-left:auto!important;
  margin-right:auto!important;
}
@media(min-width:900px){
  .rk-footer-inner > div:first-child > div[aria-hidden="true"]{
    margin-left:auto!important;
    margin-right:auto!important;
  }
}

/* tighten the hero-to-club-active transition without making it cramped */
.rk-home-ritual-hero{
  padding-bottom:14px!important;
}
.rk-home-ritual-hero .rk-hero-status{
  margin-top:8px!important;
}
.rk-home-ritual-hero .rk-hero-status p:last-child{
  margin-bottom:0!important;
}
.rk-social-presence-wrap{
  margin-top:-4px!important;
  margin-bottom:20px!important;
}
.rk-club-active-pill{
  transform:translateY(-1px);
}

/* closed leaderboard preview cards: cleaner, more premium, less heavy */
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-board-head{
  min-height:94px!important;
  padding:16px 16px!important;
  background:
    radial-gradient(circle at top left,rgba(255,255,255,.72),transparent 40%),
    linear-gradient(145deg,#FFFDF8 0%,#F5EEE3 100%)!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-head-closed:after{
  left:18px!important;
  right:18px!important;
  bottom:0!important;
  background:linear-gradient(90deg,transparent,rgba(160,120,40,.22),transparent)!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-topline{
  margin-bottom:7px!important;
  gap:9px!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-mini-icon{
  width:38px!important;
  height:38px!important;
  border-radius:14px!important;
  background:linear-gradient(145deg,#FFFDF8,#ECE2D2)!important;
  box-shadow:0 5px 14px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.88)!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-kicker{
  margin-bottom:0!important;
  line-height:1.2!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-title{
  font-size:20px!important;
  line-height:1.04!important;
  margin-top:2px!important;
  margin-bottom:8px!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-preview-line{
  margin-top:8px!important;
  gap:7px!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-preview-pill{
  padding:6px 9px!important;
  font-size:10.25px!important;
  border-color:rgba(26,20,16,.055)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.65)!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-chevron{
  width:40px!important;
  height:40px!important;
  border-radius:16px!important;
  box-shadow:0 5px 14px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.82)!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open):hover .rk-quiet-chevron{
  transform:translateY(-1px);
}
@media(max-width:420px){
  .rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-board-head{
    min-height:88px!important;
    padding:14px 14px!important;
  }
  .rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-title{
    font-size:19px!important;
  }
  .rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-mini-icon{
    width:34px!important;
    height:34px!important;
  }
  .rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-chevron{
    width:38px!important;
    height:38px!important;
  }
}


/* ─── vNext FINAL MICRO SPACING PATCH ───────────────────────────────────── */
/* Hero: keep the two status lines tight and conversational */
.rk-home-ritual-hero .rk-hero-status{
  margin-top:8px!important;
}
.rk-home-ritual-hero .rk-hero-status p{
  margin:0!important;
  line-height:1.42!important;
}
.rk-home-ritual-hero .rk-hero-status p + p{
  margin-top:0!important;
}

/* Closed leaderboard headers: small clean gap between title and descriptor */
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-title,
.rk-quiet-board:not(.rk-global-board-open) .rk-quiet-title{
  margin-bottom:5px!important;
}
.rk-clubhouse-stack .rk-quiet-board:not(.rk-global-board-open) .rk-quiet-desc,
.rk-quiet-board:not(.rk-global-board-open) .rk-quiet-desc{
  margin:0 0 10px!important;
  font-weight:500!important;
  color:rgba(26,20,16,.50)!important;
  line-height:1.42!important;
  letter-spacing:0!important;
}

/* Specific descriptor copy should feel lighter than the title */
.rk-quiet-desc{
  font-weight:500!important;
  color:rgba(26,20,16,.50)!important;
}

/* ─── VIRAL SCORECARD FINAL POLISH: CLUB ROOM + SHARE-FIRST FLOW ───────── */
.rk-score-social-room{
  min-height:74px!important;
  padding:14px 15px!important;
  align-items:center!important;
  margin:0 0 12px!important;
  border-radius:22px!important;
  background:linear-gradient(145deg,#FFFDF8 0%,#F4EFE3 100%)!important;
  border:1px solid rgba(23,107,66,.13)!important;
  box-shadow:0 9px 26px rgba(26,20,16,.05),inset 0 1px 0 rgba(255,255,255,.82)!important;
}
.rk-score-social-room:hover{transform:translateY(-1px);box-shadow:0 13px 30px rgba(26,20,16,.065),inset 0 1px 0 rgba(255,255,255,.86)!important}
.rk-score-social-left{align-items:center!important;gap:11px!important;min-width:0!important;flex:1!important}
.rk-score-social-left > span:last-child{display:flex!important;flex-direction:column!important;align-items:flex-start!important;min-width:0!important;gap:3px!important}
.rk-score-social-icon{width:44px!important;height:44px!important;border-radius:16px!important;font-size:19px!important;background:rgba(23,107,66,.075)!important;border-color:rgba(23,107,66,.12)!important}
.rk-score-social-title{display:block!important;font-family:'Fraunces',Georgia,serif!important;font-size:18px!important;line-height:1.02!important;font-weight:950!important;color:#1A1410!important;letter-spacing:-.25px!important;margin:0!important;white-space:normal!important}
.rk-score-social-copy{display:block!important;margin:0!important;font-size:12px!important;line-height:1.28!important;color:rgba(26,20,16,.58)!important;font-weight:800!important;white-space:normal!important;overflow:hidden!important;text-overflow:ellipsis!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;max-width:230px!important;text-align:left!important}
.rk-score-avatar-stack{padding-left:10px!important;margin-left:auto!important}
.rk-score-avatar-dot{width:26px!important;height:26px!important;border-width:2px!important;box-shadow:0 3px 10px rgba(26,20,16,.09)!important}
.rk-score-share-card{position:relative;overflow:hidden;border:1px solid rgba(201,168,76,.22)!important;border-radius:24px!important;padding:14px!important;background:linear-gradient(145deg,#FFFDF8 0%,#F4EFE3 100%)!important;box-shadow:0 10px 30px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.82)!important;margin-bottom:12px!important}
.rk-score-share-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top left,rgba(255,255,255,.62),transparent 34%);pointer-events:none}
.rk-score-share-card > *{position:relative;z-index:1}
.rk-score-rack-card{margin-top:0!important}
.rk-score-action-grid{margin-top:2px!important}
.rk-score-action-grid button:first-child{color:#176B42!important}
@media(max-width:390px){
  .rk-score-social-copy{max-width:170px!important;font-size:11.5px!important}
  .rk-score-social-title{font-size:17px!important}
  .rk-score-avatar-dot{width:24px!important;height:24px!important}
  .rk-score-social-room{padding:13px!important}
}

/* Homepage: lighter first impression, keep social proof but reduce clutter */
@media(max-width:599px){
  .rk-home-main-col{gap:0!important}
  .rk-clubhouse-stack{margin-top:22px!important}
  .rk-organizer-card,.rk-email-home{display:none!important}
  .rk-learn-shell{margin-top:22px!important}
}

/* ─── vNext LEARN + CLUBHOUSE SIMPLIFICATION ─────────────────────────────── */
.rk-learn-shell{margin-top:28px!important;margin-bottom:18px!important}
.rk-learn-head{min-height:74px!important;padding:15px 16px!important;border-radius:22px!important}
.rk-learn-head[aria-expanded="true"]{border-radius:22px 22px 0 0!important}
.rk-learn-panel{padding:12px!important;border-radius:0 0 22px 22px!important;background:linear-gradient(180deg,#FFFDF8,#F7F0E5)!important}
.rk-learn-grid{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
.rk-learn-item{min-height:64px!important;padding:12px 13px!important;border-radius:17px!important;gap:12px!important;background:linear-gradient(145deg,#FFFDF8,#F8F1E6)!important}
.rk-learn-item-title{display:block!important;font-family:'Fraunces',Georgia,serif!important;font-size:15px!important;line-height:1.08!important;font-weight:950!important;color:#1A1410!important;letter-spacing:-.18px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.rk-learn-item-sub{display:block!important;font-size:11px!important;line-height:1.35!important;color:#6B6157!important;font-weight:700!important;margin-top:3px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.rk-learn-icon-simple{width:40px!important;height:40px!important;border-radius:14px!important;background:linear-gradient(145deg,#FFFDF8,#EEE4D2)!important;border:1px solid rgba(26,20,16,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 4px 12px rgba(26,20,16,.04)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:18px!important;flex-shrink:0!important}
.rk-learn-arrow-simple{width:28px!important;height:28px!important;border-radius:999px!important;display:flex!important;align-items:center!important;justify-content:center!important;background:rgba(23,107,66,.06)!important;border:1px solid rgba(23,107,66,.08)!important;color:#176B42!important;font-size:14px!important;font-weight:950!important;flex-shrink:0!important}

.rk-clubhouse-stack{border-radius:24px!important;box-shadow:0 10px 28px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.82)!important;background:linear-gradient(145deg,#FFFDF8,#F7F0E5)!important;border:1px solid rgba(26,20,16,.07)!important;overflow:hidden!important}
.rk-clubhouse-stack > div + div{border-top:1px solid rgba(26,20,16,.055)!important}
.rk-clubhouse-stack .rk-quiet-board{background:transparent!important;border:none!important;box-shadow:none!important;border-radius:0!important}
.rk-clubhouse-stack > div:first-child .rk-quiet-board{border-radius:24px 24px 0 0!important}
.rk-clubhouse-stack > div:last-child{border-radius:0 0 24px 24px!important;overflow:hidden!important}
.rk-quiet-board-head{min-height:auto!important;padding:16px!important;align-items:center!important;background:transparent!important}
.rk-quiet-head-closed:after{display:none!important}
.rk-quiet-topline{margin-bottom:7px!important;gap:7px!important}
.rk-quiet-mini-icon{width:31px!important;height:31px!important;border-radius:12px!important;font-size:15px!important}
.rk-quiet-kicker{font-size:8.5px!important;letter-spacing:2.1px!important;margin:0!important;line-height:1.05!important}
.rk-quiet-title{font-size:18px!important;line-height:1.05!important;margin:0!important;letter-spacing:-.38px!important}
.rk-quiet-desc{font-size:11.5px!important;line-height:1.35!important;margin-top:4px!important;color:rgba(107,97,87,.86)!important;font-weight:650!important}
.rk-quiet-preview-line{margin-top:10px!important;gap:6px!important}
.rk-quiet-preview-pill{font-size:10px!important;padding:6px 8px!important;line-height:1!important}
.rk-quiet-chevron{width:34px!important;height:34px!important;border-radius:14px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.78),0 4px 12px rgba(26,20,16,.035)!important}
.rk-quiet-board-panel{padding:12px!important;background:linear-gradient(180deg,#FFFDF8 0%,#F5EFE4 100%)!important;border-top:1px solid rgba(26,20,16,.055)!important}
.rk-quiet-leader{padding:12px!important;border-radius:17px!important;margin-bottom:9px!important;gap:11px!important}
.rk-quiet-badge{width:38px!important;height:38px!important;border-radius:14px!important;font-size:16px!important}
.rk-quiet-row-list{gap:7px!important}
.rk-quiet-row{grid-template-columns:28px minmax(0,1fr) auto!important;padding:9px 10px!important;border-radius:15px!important;gap:9px!important}
.rk-quiet-rank{width:27px!important;height:27px!important;font-size:10.5px!important}
.rk-quiet-name{font-size:13.5px!important;line-height:1.05!important}
.rk-quiet-sub{font-size:10px!important;margin-top:3px!important}
.rk-quiet-score{font-size:21px!important}
.rk-quiet-footer{margin-top:9px!important;padding-top:10px!important}
.rk-quiet-link{font-size:12px!important;padding:3px 0 7px!important}
.rk-inline-code-row{background:rgba(255,255,255,.52)!important}
.rk-inline-code-button{width:100%!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:14px 16px!important;background:transparent!important;border:none!important;cursor:pointer!important;text-align:left!important}
.rk-inline-code-copy{font-size:11px!important;color:#6B6157!important;margin-top:3px!important;line-height:1.32!important;font-weight:650!important}
@media(max-width:390px){
  .rk-quiet-board-head{padding:14px 13px!important}
  .rk-quiet-title{font-size:17px!important}
  .rk-quiet-preview-pill{font-size:9.5px!important;padding:5px 7px!important}
  .rk-learn-item-title{font-size:14px!important}
  .rk-learn-item-sub{font-size:10.5px!important}
}



/* ─── vNext CLUBHOUSE v3: premium social moat ───────────────────────────── */
.rk-clubhouse-v3{margin:30px 0 28px;position:relative}
.rk-clubhouse-v3-divider{display:flex;align-items:center;gap:12px;margin:6px 0 14px}
.rk-clubhouse-v3-divider:before,.rk-clubhouse-v3-divider:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(160,120,40,.28))}
.rk-clubhouse-v3-divider:after{background:linear-gradient(90deg,rgba(160,120,40,.28),transparent)}
.rk-clubhouse-v3-label{display:inline-flex;align-items:center;gap:7px;padding:7px 15px;border-radius:999px;background:linear-gradient(145deg,#F5EFE4,#EDE3D3);border:1px solid rgba(160,120,40,.20);box-shadow:inset 0 1px 0 rgba(255,255,255,.72);font-size:9px;letter-spacing:2.45px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.58);white-space:nowrap}
.rk-clubhouse-v3-hero{position:relative;overflow:hidden;border-radius:28px;background:linear-gradient(150deg,#041F12 0%,#062B18 44%,#0A4328 76%,#03170D 100%);border:1px solid rgba(243,212,107,.20);box-shadow:0 18px 46px rgba(6,43,24,.19),inset 0 1px 0 rgba(255,255,255,.10);padding:20px 18px;color:#fff;margin-bottom:12px}
.rk-clubhouse-v3-hero:after{content:'🀄';position:absolute;right:-18px;bottom:-30px;font-size:124px;opacity:.04;transform:rotate(-8deg);pointer-events:none}
.rk-clubhouse-v3-hero-top{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
.rk-clubhouse-v3-kicker{font-size:9px;letter-spacing:2.55px;text-transform:uppercase;font-weight:950;color:rgba(243,212,107,.80);margin-bottom:8px}
.rk-clubhouse-v3-title{font-family:'Fraunces',Georgia,serif;font-size:26px;line-height:1.02;font-weight:950;letter-spacing:-.78px;color:#fff;margin:0 0 7px}
.rk-clubhouse-v3-copy{font-size:12.5px;line-height:1.55;color:rgba(255,255,255,.70);font-weight:760;max-width:39ch;margin:0}
.rk-clubhouse-v3-live{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:8px 12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#F3D46B;font-size:10.5px;font-weight:950;white-space:nowrap;flex-shrink:0}
.rk-clubhouse-v3-live-dot{width:8px;height:8px;border-radius:999px;background:#4CD987;box-shadow:0 0 0 4px rgba(76,217,135,.12),0 0 14px rgba(76,217,135,.55);animation:rkLiveBreathe 2.35s ease-in-out infinite;display:inline-block}
.rk-clubhouse-v3-score-strip{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}
.rk-clubhouse-v3-stat{border-radius:18px;padding:13px 11px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);min-width:0}
.rk-clubhouse-v3-stat strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:22px;line-height:1;font-weight:950;color:#F3D46B;letter-spacing:-.45px;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-clubhouse-v3-stat span{display:block;font-size:8px;letter-spacing:1.55px;text-transform:uppercase;font-weight:950;color:rgba(255,255,255,.56);line-height:1.2}
.rk-clubhouse-v3-actions{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:9px}
.rk-clubhouse-v3-action{min-height:44px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.075);color:#fff;font-size:12px;font-weight:950;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:inset 0 1px 0 rgba(255,255,255,.10);transition:transform .16s ease,background .16s ease,border-color .16s ease}
.rk-clubhouse-v3-action:hover{transform:translateY(-1px);background:rgba(255,255,255,.11);border-color:rgba(243,212,107,.28)}
.rk-clubhouse-v3-action-primary{background:linear-gradient(145deg,rgba(243,212,107,.18),rgba(255,255,255,.07));color:#F3D46B;border-color:rgba(243,212,107,.26)}
.rk-clubhouse-v3-stack{border-radius:28px;overflow:hidden;background:linear-gradient(145deg,#FFFDF8,#F5EFE4);border:1px solid rgba(26,20,16,.075);box-shadow:0 14px 36px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.82);margin-bottom:16px}
.rk-clubhouse-v3-stack > div + div{border-top:1px solid rgba(26,20,16,.065)}
.rk-clubhouse-v3-stack .rk-quiet-board,.rk-clubhouse-v3-stack .rk-social-preview-board,.rk-clubhouse-v3-stack .rk-leaderboard-card{border:none!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;margin:0!important}
.rk-clubhouse-v3-stack .rk-quiet-board-head{padding:18px 18px!important;min-height:118px!important;background:linear-gradient(145deg,#FFFDF8 0%,#F6EFE4 100%)!important;border:none!important}
.rk-clubhouse-v3-stack .rk-quiet-head-open{background:linear-gradient(145deg,#FFFDF8,#F1E8D9)!important}
.rk-clubhouse-v3-stack .rk-quiet-topline{margin-bottom:8px!important;gap:10px!important;align-items:center!important}
.rk-clubhouse-v3-stack .rk-quiet-mini-icon{width:42px!important;height:42px!important;border-radius:16px!important;background:linear-gradient(145deg,#FFFDF8,#ECE1CF)!important;border:1px solid rgba(160,120,40,.14)!important;box-shadow:0 6px 16px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.86)!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:18px!important}
.rk-clubhouse-v3-stack .rk-quiet-kicker{font-size:9px!important;letter-spacing:2.35px!important;line-height:1.15!important;margin:0!important;color:#176B42!important;display:flex!important;align-items:center!important;gap:9px!important;flex-wrap:wrap!important}
.rk-clubhouse-v3-stack .rk-quiet-title{font-size:22px!important;line-height:1.03!important;margin:4px 0 7px!important;letter-spacing:-.45px!important;max-width:260px!important}
.rk-clubhouse-v3-stack .rk-quiet-desc{font-size:12.5px!important;line-height:1.45!important;color:rgba(26,20,16,.58)!important;font-weight:700!important;max-width:38ch!important}
.rk-clubhouse-v3-stack .rk-quiet-preview-line{display:flex!important;gap:7px!important;flex-wrap:wrap!important;margin-top:12px!important}
.rk-clubhouse-v3-stack .rk-quiet-preview-pill{padding:7px 11px!important;border-radius:999px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
.rk-clubhouse-v3-stack .rk-quiet-chevron{width:48px!important;height:48px!important;border-radius:17px!important;background:linear-gradient(145deg,#FFFDF8,#EFE6D8)!important;border:1px solid rgba(26,20,16,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.78)!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important}
.rk-clubhouse-v3-stack .rk-quiet-board-panel{padding:14px!important;background:linear-gradient(180deg,#FFFDF8 0%,#F3EBDE 100%)!important;border:none!important;border-top:1px solid rgba(26,20,16,.065)!important;border-radius:0!important;box-shadow:none!important}
.rk-clubhouse-v3-stack .rk-quiet-leader{border-radius:22px!important;margin-bottom:12px!important;padding:16px!important;background:linear-gradient(150deg,#041F12,#07331E 55%,#03170D)!important;border:1px solid rgba(243,212,107,.18)!important;box-shadow:0 10px 26px rgba(6,43,24,.14),inset 0 1px 0 rgba(255,255,255,.08)!important}
.rk-clubhouse-v3-stack .rk-quiet-row-list{display:grid!important;gap:8px!important}
.rk-clubhouse-v3-stack .rk-quiet-row{border-radius:18px!important;background:rgba(255,255,255,.76)!important;border:1px solid rgba(26,20,16,.055)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.78)!important;padding:11px!important}
.rk-clubhouse-v3-stack .rk-quiet-row-you{background:linear-gradient(145deg,#F4FBF7,#FFFDF8)!important;border-color:rgba(23,107,66,.16)!important}
.rk-clubhouse-v3-stack .rk-quiet-footer{padding-top:13px!important;margin-top:12px!important;border-top:1px solid rgba(26,20,16,.075)!important;text-align:center!important}
.rk-clubhouse-v3-organizer{position:relative;overflow:hidden;border-radius:26px;background:linear-gradient(145deg,#F4FBF7,#EAF5EF);border:1.5px solid rgba(23,107,66,.14);box-shadow:0 12px 30px rgba(23,107,66,.07),inset 0 1px 0 rgba(255,255,255,.80);padding:20px;margin:16px 0 20px}
.rk-clubhouse-v3-organizer:after{content:'🏛️';position:absolute;right:-8px;bottom:-22px;font-size:104px;opacity:.055;transform:rotate(-6deg);pointer-events:none}
.rk-clubhouse-v3-organizer-head{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}
.rk-clubhouse-v3-organizer-kicker{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;font-weight:950;color:#176B42}
.rk-clubhouse-v3-organizer-pill{border-radius:999px;padding:7px 11px;background:rgba(201,168,76,.13);border:1px solid rgba(201,168,76,.20);color:#8A6820;font-size:10.5px;font-weight:950;white-space:nowrap}
.rk-clubhouse-v3-organizer-title{position:relative;z-index:1;font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1.02;font-weight:950;letter-spacing:-.65px;color:#1A1410;margin:0 0 9px}
.rk-clubhouse-v3-organizer-copy{position:relative;z-index:1;font-size:12.5px;line-height:1.55;color:#6B6157;font-weight:750;max-width:40ch;margin:0 0 14px}
.rk-clubhouse-v3-benefits{position:relative;z-index:1;display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:15px}
.rk-clubhouse-v3-benefit{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:17px;background:rgba(255,255,255,.72);border:1px solid rgba(23,107,66,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.78);font-size:12.5px;line-height:1.25;color:#1A1410;font-weight:900}
.rk-clubhouse-v3-benefit:before{content:"";width:9px;height:9px;border-radius:999px;background:#176B42;box-shadow:0 0 0 4px rgba(23,107,66,.08);flex-shrink:0}
.rk-clubhouse-v3-organizer-actions{position:relative;z-index:1;display:grid;grid-template-columns:1.45fr .85fr;gap:9px}
.rk-clubhouse-v3-primary,.rk-clubhouse-v3-secondary{display:flex;align-items:center;justify-content:center;border-radius:16px;padding:13px 10px;font-family:'Fraunces',Georgia,serif;font-size:14px;font-weight:950;text-decoration:none;cursor:pointer}
.rk-clubhouse-v3-primary{border:1px solid rgba(255,255,255,.16);background:linear-gradient(135deg,#176B42,#0F5432);color:#fff;box-shadow:0 10px 22px rgba(23,107,66,.16),inset 0 1px 0 rgba(255,255,255,.16)}
.rk-clubhouse-v3-secondary{border:1px solid rgba(23,107,66,.18);background:rgba(255,255,255,.78);color:#176B42}
@media(min-width:760px){.rk-clubhouse-v3-hero{padding:24px 24px}.rk-clubhouse-v3-title{font-size:31px}.rk-clubhouse-v3-stack .rk-quiet-board-head{min-height:126px!important;padding:22px 24px!important}.rk-clubhouse-v3-stack .rk-quiet-title{font-size:25px!important;max-width:none!important}.rk-clubhouse-v3-benefits{grid-template-columns:repeat(3,minmax(0,1fr))}.rk-clubhouse-v3-benefit{align-items:flex-start;min-height:58px}.rk-clubhouse-v3-organizer{padding:24px}}
@media(max-width:390px){.rk-clubhouse-v3-hero-top{flex-direction:column}.rk-clubhouse-v3-title{font-size:24px}.rk-clubhouse-v3-score-strip{grid-template-columns:1fr 1fr}.rk-clubhouse-v3-stat:last-child{grid-column:1/-1}.rk-clubhouse-v3-actions,.rk-clubhouse-v3-organizer-actions{grid-template-columns:1fr}.rk-clubhouse-v3-stack .rk-quiet-board-head{min-height:112px!important;padding:16px!important}.rk-clubhouse-v3-stack .rk-quiet-title{font-size:20px!important}.rk-clubhouse-v3-stack .rk-quiet-desc{max-width:28ch!important}}


/* ─── vNext HOMEPAGE HERO COMPRESSION + BREATHING ROOM ─────────────────────
   Goal: keep the premium identity, but stop the hero from eating the first screen.
   The page should get players to Today’s Rackle faster. */
.rk-home-ritual-hero{
  padding-top:18px!important;
  padding-bottom:14px!important;
  max-width:760px;
  margin-left:auto!important;
  margin-right:auto!important;
}
.rk-home-ritual-hero .rk-hero-tile{
  font-size:30px!important;
  margin-bottom:8px!important;
  filter:drop-shadow(0 4px 8px rgba(26,20,16,.08));
}
.rk-home-ritual-hero .rk-hero-logo{
  font-size:46px!important;
  line-height:.92!important;
  margin-bottom:8px!important;
  letter-spacing:-2.4px!important;
}
.rk-home-ritual-hero .rk-hero-subtitle{
  font-size:14.5px!important;
  line-height:1.25!important;
  margin-bottom:10px!important;
}
.rk-home-ritual-hero .rk-hero-status{
  margin-top:0!important;
  gap:1px!important;
}
.rk-home-ritual-hero .rk-hero-status p{
  font-size:12.5px!important;
  line-height:1.34!important;
}
.rk-home-ritual-hero .rk-hero-status p:last-child{
  font-weight:850!important;
}
.rk-daily-divider-row{
  margin:0 0 18px!important;
}
.rk-daily-divider-row .rk-daily-cta{
  min-height:46px!important;
  padding:7px 17px!important;
  border-radius:18px!important;
}
.rk-daily-divider-row .rk-daily-cta span:last-child{
  font-size:9.5px!important;
  letter-spacing:2.15px!important;
}
.rk-social-presence-wrap{
  margin-top:2px!important;
  margin-bottom:17px!important;
}
@media(max-width:420px){
  .rk-home-ritual-hero{padding-top:15px!important;padding-bottom:12px!important;}
  .rk-home-ritual-hero .rk-hero-tile{font-size:28px!important;margin-bottom:7px!important;}
  .rk-home-ritual-hero .rk-hero-logo{font-size:43px!important;margin-bottom:7px!important;}
  .rk-home-ritual-hero .rk-hero-subtitle{font-size:14px!important;margin-bottom:9px!important;}
  .rk-daily-divider-row{margin-bottom:16px!important;}
}
@media(min-width:900px){
  .rk-home-ritual-hero{
    padding-top:14px!important;
    padding-bottom:12px!important;
  }
  .rk-home-ritual-hero .rk-hero-tile{font-size:29px!important;}
  .rk-home-ritual-hero .rk-hero-logo{font-size:48px!important;}
  .rk-daily-divider-row{margin-bottom:20px!important;}
}



/* ─── vNext CLUBHOUSE v4: country club score rooms ─────────────────────── */
.rk-clubhouse-v4{margin:26px 0 28px;position:relative}
.rk-clubhouse-v4-divider{display:flex;align-items:center;gap:12px;margin:4px 0 14px}
.rk-clubhouse-v4-divider:before,.rk-clubhouse-v4-divider:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(160,120,40,.24))}
.rk-clubhouse-v4-divider:after{background:linear-gradient(90deg,rgba(160,120,40,.24),transparent)}
.rk-clubhouse-v4-label{display:inline-flex;align-items:center;gap:7px;padding:7px 15px;border-radius:999px;background:linear-gradient(145deg,#F5EFE4,#EDE3D3);border:1px solid rgba(160,120,40,.20);box-shadow:inset 0 1px 0 rgba(255,255,255,.72);font-size:9px;letter-spacing:2.5px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.56);white-space:nowrap}
.rk-clubhouse-v4-suite{border-radius:28px;overflow:hidden;background:linear-gradient(145deg,#FFFDF8 0%,#F6EFE4 100%);border:1px solid rgba(26,20,16,.08);box-shadow:0 14px 38px rgba(26,20,16,.06),inset 0 1px 0 rgba(255,255,255,.82)}
.rk-clubhouse-v4-overview{position:relative;overflow:hidden;display:grid;grid-template-columns:1.05fr 1fr;gap:14px;align-items:stretch;padding:18px;background:linear-gradient(135deg,#FFFDF8 0%,#F2EBDC 56%,#EEF6F1 100%);border-bottom:1px solid rgba(26,20,16,.07)}
.rk-clubhouse-v4-overview:after{content:'🀄';position:absolute;right:-10px;bottom:-24px;font-size:108px;opacity:.045;transform:rotate(-9deg);pointer-events:none}
.rk-clubhouse-v4-copyblock{position:relative;z-index:1;min-width:0}
.rk-clubhouse-v4-kicker{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:2.2px;text-transform:uppercase;font-weight:950;color:#176B42;margin-bottom:9px;line-height:1.1}
.rk-clubhouse-v4-live-dot{width:8px;height:8px;border-radius:999px;background:#4CD987;box-shadow:0 0 0 4px rgba(76,217,135,.13),0 0 14px rgba(76,217,135,.52);animation:rkLiveBreathe 2.4s ease-in-out infinite;display:inline-block;flex-shrink:0}
.rk-clubhouse-v4-title{font-family:'Fraunces',Georgia,serif;font-size:25px;line-height:1.02;font-weight:950;letter-spacing:-.65px;color:#1A1410;margin:0 0 6px}
.rk-clubhouse-v4-copy{font-size:12.5px;line-height:1.48;color:rgba(26,20,16,.62);font-weight:760;margin:0;max-width:30ch}
.rk-clubhouse-v4-room-grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:9px;min-width:0}
.rk-clubhouse-v4-room{position:relative;overflow:hidden;text-align:left;border-radius:20px;padding:13px 13px 12px;min-height:104px;cursor:pointer;border:1px solid rgba(23,107,66,.13);background:rgba(255,255,255,.72);box-shadow:0 5px 16px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.82);transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.rk-clubhouse-v4-room:hover{transform:translateY(-1px);border-color:rgba(23,107,66,.22);box-shadow:0 9px 24px rgba(26,20,16,.06),inset 0 1px 0 rgba(255,255,255,.86)}
.rk-clubhouse-v4-room-primary{background:linear-gradient(145deg,#FCF8EA,#FFFDF8);border-color:rgba(160,120,40,.18)}
.rk-clubhouse-v4-room-top{display:block;font-size:8px;letter-spacing:1.85px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.42);margin-bottom:9px}
.rk-clubhouse-v4-room strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:25px;line-height:1;font-weight:950;letter-spacing:-.7px;color:#176B42;margin-bottom:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-clubhouse-v4-room-primary strong{color:#A07828}
.rk-clubhouse-v4-room span:last-child{display:block;font-size:10.5px;line-height:1.25;color:#6B6157;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-clubhouse-v4-boards{background:linear-gradient(180deg,#FFFDF8,#F6EFE4)}
.rk-clubhouse-v4-boards > div + div{border-top:1px solid rgba(26,20,16,.065)}
.rk-clubhouse-v4-boards .rk-quiet-board,.rk-clubhouse-v4-boards .rk-social-preview-board,.rk-clubhouse-v4-boards .rk-leaderboard-card{border:none!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;margin:0!important}
.rk-clubhouse-v4-boards .rk-quiet-board-head{min-height:auto!important;padding:18px 18px!important;background:transparent!important;border:none!important}
.rk-clubhouse-v4-boards .rk-quiet-title{font-size:21px!important;line-height:1.04!important;margin:4px 0 7px!important;letter-spacing:-.45px!important}
.rk-clubhouse-v4-boards .rk-quiet-desc{font-size:12.25px!important;line-height:1.42!important;color:rgba(26,20,16,.58)!important;font-weight:700!important;max-width:34ch!important}
.rk-clubhouse-v4-boards .rk-quiet-preview-line{display:flex!important;gap:7px!important;flex-wrap:wrap!important;margin-top:12px!important}
.rk-clubhouse-v4-boards .rk-quiet-preview-pill{padding:7px 11px!important;border-radius:999px!important;font-size:11px!important;font-weight:950!important;line-height:1!important}
.rk-clubhouse-v4-boards .rk-quiet-chevron{width:46px!important;height:46px!important;border-radius:16px!important;background:linear-gradient(145deg,#FFFDF8,#EFE6D8)!important;border:1px solid rgba(26,20,16,.08)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.78)!important}
.rk-clubhouse-v4-boards .rk-quiet-board-panel{padding:14px!important;background:linear-gradient(180deg,#FFFDF8 0%,#F3EBDE 100%)!important;border:none!important;border-top:1px solid rgba(26,20,16,.065)!important;border-radius:0!important;box-shadow:none!important}
.rk-clubhouse-v4-boards .rk-quiet-leader{border-radius:22px!important;margin-bottom:12px!important;padding:16px!important;background:linear-gradient(150deg,#041F12,#07331E 55%,#03170D)!important;border:1px solid rgba(243,212,107,.18)!important;box-shadow:0 10px 26px rgba(6,43,24,.14),inset 0 1px 0 rgba(255,255,255,.08)!important}
.rk-clubhouse-v4-boards .rk-quiet-row-list{display:grid!important;gap:8px!important}.rk-clubhouse-v4-boards .rk-quiet-row{border-radius:18px!important;background:rgba(255,255,255,.76)!important;border:1px solid rgba(26,20,16,.055)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.78)!important;padding:11px!important}
.rk-clubhouse-v4-boards .rk-quiet-row-you{background:linear-gradient(145deg,#F4FBF7,#FFFDF8)!important;border-color:rgba(23,107,66,.16)!important}
.rk-clubhouse-v4-boards .rk-quiet-footer{padding-top:13px!important;margin-top:12px!important;border-top:1px solid rgba(26,20,16,.075)!important;text-align:center!important}
.rk-clubhouse-v4-organizer{position:relative;overflow:hidden;border-radius:24px;background:linear-gradient(145deg,#F4FBF7,#FFFDF8);border:1px solid rgba(23,107,66,.13);box-shadow:0 10px 26px rgba(23,107,66,.055),inset 0 1px 0 rgba(255,255,255,.80);padding:18px;margin:16px 0 20px}
.rk-clubhouse-v4-organizer-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.rk-clubhouse-v4-organizer-head span{font-size:9px;letter-spacing:2.45px;text-transform:uppercase;font-weight:950;color:#176B42}.rk-clubhouse-v4-organizer-head b{border-radius:999px;padding:6px 10px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.18);color:#8A6820;font-size:10px;font-weight:950;white-space:nowrap}
.rk-clubhouse-v4-organizer h3{font-family:'Fraunces',Georgia,serif;font-size:23px;line-height:1.02;font-weight:950;letter-spacing:-.6px;color:#1A1410;margin:0 0 8px}.rk-clubhouse-v4-organizer p{font-size:12.5px;line-height:1.5;color:#6B6157;font-weight:750;margin:0 0 13px;max-width:40ch}.rk-clubhouse-v4-organizer-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}.rk-clubhouse-v4-organizer-row span{border-radius:999px;padding:7px 10px;background:rgba(23,107,66,.06);border:1px solid rgba(23,107,66,.08);color:#176B42;font-size:10.5px;font-weight:900}.rk-clubhouse-v4-organizer-actions{display:grid;grid-template-columns:1.45fr .85fr;gap:9px}.rk-clubhouse-v4-organizer-actions a,.rk-clubhouse-v4-organizer-actions button{display:flex;align-items:center;justify-content:center;border-radius:16px;padding:13px 10px;font-family:'Fraunces',Georgia,serif;font-size:14px;font-weight:950;text-decoration:none;cursor:pointer}.rk-clubhouse-v4-organizer-actions a{border:1px solid rgba(255,255,255,.16);background:linear-gradient(135deg,#176B42,#0F5432);color:#fff;box-shadow:0 10px 22px rgba(23,107,66,.16),inset 0 1px 0 rgba(255,255,255,.16)}.rk-clubhouse-v4-organizer-actions button{border:1px solid rgba(23,107,66,.18);background:rgba(255,255,255,.78);color:#176B42}
@media(min-width:760px){.rk-clubhouse-v4-overview{grid-template-columns:1fr 1.1fr;padding:22px}.rk-clubhouse-v4-title{font-size:29px}.rk-clubhouse-v4-room{min-height:110px}.rk-clubhouse-v4-boards .rk-quiet-board-head{padding:20px 22px!important}.rk-clubhouse-v4-boards .rk-quiet-title{font-size:24px!important}.rk-clubhouse-v4-organizer{padding:22px}.rk-clubhouse-v4-organizer-row{gap:9px}}
@media(max-width:430px){.rk-clubhouse-v4{margin-top:22px}.rk-clubhouse-v4-overview{grid-template-columns:1fr;padding:16px;gap:13px}.rk-clubhouse-v4-title{font-size:23px}.rk-clubhouse-v4-copy{max-width:100%}.rk-clubhouse-v4-room-grid{grid-template-columns:1fr 1fr}.rk-clubhouse-v4-room{min-height:96px;padding:12px}.rk-clubhouse-v4-boards .rk-quiet-board-head{padding:16px!important}.rk-clubhouse-v4-boards .rk-quiet-title{font-size:20px!important}.rk-clubhouse-v4-organizer-actions{grid-template-columns:1fr}.rk-clubhouse-v4-organizer-row span{font-size:10px}}
@media(max-width:360px){.rk-clubhouse-v4-room-grid{grid-template-columns:1fr}.rk-clubhouse-v4-room{min-height:auto}.rk-clubhouse-v4-boards .rk-quiet-preview-line{gap:5px!important}.rk-clubhouse-v4-boards .rk-quiet-preview-pill{font-size:10px!important;padding:6px 9px!important}}

/* ─── vNext VIRAL LEADERBOARD + SHARE LOOP OVERHAUL ───────────────────── */
.rk-room-page{background:radial-gradient(circle at 50% -80px,rgba(255,255,255,.68),transparent 250px),linear-gradient(180deg,#F8F4EE,#F3ECDf);min-height:100vh}
.rk-room-hero{position:relative;overflow:hidden;border-radius:26px;background:linear-gradient(150deg,#041F12 0%,#07331E 48%,#0A4328 72%,#03170D 100%);border:1px solid rgba(243,212,107,.20);box-shadow:0 18px 46px rgba(6,43,24,.22),inset 0 1px 0 rgba(255,255,255,.10);padding:22px 18px;color:#fff;margin-bottom:14px}
.rk-room-hero:after{content:'🀄';position:absolute;right:-18px;bottom:-24px;font-size:118px;opacity:.045;transform:rotate(-8deg);pointer-events:none}
.rk-room-kicker{font-size:9px;letter-spacing:2.6px;text-transform:uppercase;font-weight:950;color:rgba(243,212,107,.86);margin-bottom:8px}
.rk-room-title{font-family:'Fraunces',Georgia,serif;font-size:28px;line-height:1.02;font-weight:950;letter-spacing:-.9px;color:#fff;margin:0 0 7px}
.rk-room-copy{font-size:13px;line-height:1.55;color:rgba(255,255,255,.70);font-weight:750;max-width:34ch;margin:0 0 16px}
.rk-room-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;position:relative;z-index:1}
.rk-room-metric{border-radius:18px;padding:13px 10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
.rk-room-metric strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1;font-weight:950;color:#F3D46B;letter-spacing:-.6px;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-room-metric span{display:block;font-size:8px;letter-spacing:1.55px;text-transform:uppercase;font-weight:950;color:rgba(255,255,255,.58);line-height:1.2}
.rk-room-leader{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;border-radius:22px;padding:15px;background:linear-gradient(150deg,#041F12,#07331E 52%,#03170D);border:1px solid rgba(243,212,107,.20);box-shadow:0 10px 30px rgba(6,43,24,.18),inset 0 1px 0 rgba(255,255,255,.08);color:#fff;margin-bottom:12px;position:relative;overflow:hidden}
.rk-room-leader:after{content:'🀄';position:absolute;right:-12px;bottom:-24px;font-size:92px;opacity:.045;transform:rotate(-8deg)}
.rk-room-rank-badge{width:50px;height:50px;border-radius:18px;background:linear-gradient(145deg,#FFF8E9,#E9DFC8);border:1px solid rgba(243,212,107,.30);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',Georgia,serif;font-size:20px;font-weight:950;color:#8A6820;box-shadow:inset 0 1px 0 rgba(255,255,255,.8);position:relative;z-index:1;flex-shrink:0}
.rk-room-leader-name{font-family:'Fraunces',Georgia,serif;font-size:22px;line-height:1.05;font-weight:950;letter-spacing:-.55px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:relative;z-index:1}
.rk-room-leader-sub{font-size:12px;line-height:1.35;color:rgba(255,255,255,.66);font-weight:750;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:relative;z-index:1}
.rk-room-score{font-family:'Fraunces',Georgia,serif;font-size:44px;line-height:1;font-weight:950;color:#F3D46B;letter-spacing:-1px;position:relative;z-index:1}
.rk-room-you{border-radius:22px;padding:14px;background:linear-gradient(145deg,#FFFDF8,#F3EFE6);border:1px solid rgba(23,107,66,.12);box-shadow:0 7px 22px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.82);display:flex;align-items:center;gap:12px;justify-content:space-between;margin-bottom:12px}
.rk-room-you-main{display:flex;align-items:center;gap:11px;min-width:0;text-align:left}
.rk-room-you-icon{width:42px;height:42px;border-radius:16px;background:rgba(23,107,66,.08);border:1px solid rgba(23,107,66,.10);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.rk-room-you-title{font-family:'Fraunces',Georgia,serif;font-size:17px;line-height:1.05;font-weight:950;color:#1A1410;letter-spacing:-.35px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-room-you-copy{font-size:12px;color:#6B6157;font-weight:750;margin-top:4px;line-height:1.35}
.rk-room-row-list{display:grid;gap:8px;margin-bottom:12px}
.rk-room-row{display:grid;grid-template-columns:40px 1fr auto;align-items:center;gap:10px;border-radius:18px;padding:12px 13px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.07);box-shadow:0 4px 14px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.76)}
.rk-room-row-me{background:linear-gradient(145deg,#F1FAF5,#FFFDF8);border-color:rgba(23,107,66,.16)}
.rk-room-row-rank{width:34px;height:34px;border-radius:999px;background:rgba(26,20,16,.055);display:flex;align-items:center;justify-content:center;font-family:'Fraunces',Georgia,serif;font-size:13px;font-weight:950;color:#6B6157}
.rk-room-row-top{background:rgba(243,212,107,.16);color:#8A6820;border:1px solid rgba(243,212,107,.24)}
.rk-room-row-name{font-family:'Fraunces',Georgia,serif;font-size:15px;line-height:1.08;font-weight:950;color:#1A1410;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-room-row-sub{font-size:11px;line-height:1.35;color:#6B6157;font-weight:750;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk-room-row-score{font-family:'Fraunces',Georgia,serif;font-size:24px;line-height:1;font-weight:950;color:#176B42;letter-spacing:-.6px}
.rk-room-row-score-mid{color:#A07828}.rk-room-row-score-low{color:#B02A2A}
.rk-room-activity{border-radius:22px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.07);box-shadow:0 6px 20px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.78);padding:14px;margin-bottom:12px}
.rk-room-activity-title{font-size:9px;letter-spacing:2.2px;text-transform:uppercase;font-weight:950;color:#176B42;margin-bottom:10px}
.rk-room-feed{display:grid;gap:8px}
.rk-room-feed-item{display:flex;align-items:center;gap:9px;font-size:12px;line-height:1.4;color:#6B6157;font-weight:780}
.rk-room-feed-dot{width:8px;height:8px;border-radius:999px;background:#4CD987;box-shadow:0 0 0 4px rgba(76,217,135,.10);flex-shrink:0}
.rk-room-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px}
.rk-room-btn{border-radius:16px;border:1px solid rgba(23,107,66,.14);background:linear-gradient(180deg,#FFFDF8,#F1E9DB);padding:13px 10px;font-size:12px;font-weight:950;color:#176B42;cursor:pointer;box-shadow:0 4px 14px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.75)}
.rk-room-btn-primary{background:linear-gradient(135deg,#176B42,#0F5432);color:#fff;border-color:rgba(255,255,255,.16);box-shadow:0 8px 18px rgba(23,107,66,.16),inset 0 1px 0 rgba(255,255,255,.16)}
.rk-score-ultra-simple .rk-iq-hero{padding:24px 18px 20px!important;margin-bottom:10px!important}
.rk-score-ultra-simple .rk-iq-score{font-size:82px!important}
.rk-score-ultra-simple .rk-score-rack-card{padding:12px!important}
.rk-invite-card{border-radius:22px;padding:15px;background:linear-gradient(145deg,#F4FBF7,#FFFDF8);border:1px solid rgba(23,107,66,.13);box-shadow:0 7px 22px rgba(23,107,66,.055),inset 0 1px 0 rgba(255,255,255,.82);margin-bottom:12px}
@media(max-width:390px){.rk-room-title{font-size:25px}.rk-room-metrics{grid-template-columns:1fr 1fr}.rk-room-metric:last-child{grid-column:1/-1}.rk-room-actions{grid-template-columns:1fr}.rk-room-score{font-size:38px}.rk-room-hero{padding:20px 16px}.rk-room-leader{grid-template-columns:44px 1fr auto}.rk-room-rank-badge{width:44px;height:44px;border-radius:16px}}


/* ─── vNext STARTUP GAME LANDING PAGE ───────────────────────────────────── */
.rk-home-landing-flow{display:flex;flex-direction:column;gap:16px;max-width:860px;margin:0 auto;width:100%}
.rk-startup-hero{padding:18px 0 12px;text-align:center}
.rk-startup-logo{font-family:'Fraunces',Georgia,serif;font-size:46px;line-height:.92;font-weight:950;letter-spacing:-2.4px;color:#1A1410;margin:0 0 8px}
.rk-startup-subtitle{font-family:'Fraunces',Georgia,serif;font-size:15px;font-style:italic;font-weight:800;color:#176B42;margin:0 0 14px;letter-spacing:.15px}
.rk-startup-line{font-size:14px;line-height:1.42;color:#6B6157;font-weight:780;margin:0}
.rk-startup-line strong{display:block;color:#1A1410;font-weight:950;margin-top:1px}
.rk-primary-daily-card{position:relative;overflow:hidden;border-radius:24px;background:linear-gradient(150deg,#041F12 0%,#07331E 50%,#052615 100%);border:1px solid rgba(243,212,107,.22);box-shadow:0 18px 44px rgba(6,43,24,.22),inset 0 1px 0 rgba(255,255,255,.1);padding:18px;color:#fff;cursor:pointer;text-align:left;transition:transform .16s ease,box-shadow .16s ease}
.rk-primary-daily-card:active{transform:scale(.992)}
.rk-primary-daily-card:after{content:'🀄';position:absolute;right:-16px;bottom:-26px;font-size:108px;opacity:.045;transform:rotate(-9deg);pointer-events:none}
.rk-primary-daily-top{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.rk-primary-daily-pill{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.15);font-size:9px;letter-spacing:2px;text-transform:uppercase;font-weight:950;color:rgba(255,255,255,.82)}
.rk-primary-daily-play{position:relative;z-index:1;width:58px;height:58px;border-radius:999px;border:2px solid rgba(26,20,16,.18);background:linear-gradient(145deg,#FFFDF8,#F0E7D8);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.86);flex-shrink:0}
.rk-primary-daily-play:before{content:'';width:0;height:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:17px solid #111;margin-left:4px}
.rk-primary-daily-title{position:relative;z-index:1;font-family:'Fraunces',Georgia,serif;font-size:26px;line-height:1.02;font-weight:950;letter-spacing:-.7px;margin:0 0 8px;color:#fff}
.rk-primary-daily-title span{color:#F3D46B}.rk-primary-daily-copy{position:relative;z-index:1;font-size:12.5px;line-height:1.45;color:rgba(255,255,255,.72);font-weight:780;margin:0}
.rk-rack-preview-card{border-radius:22px;background:linear-gradient(145deg,#FFFDF8,#F6EFE4);border:1px solid rgba(26,20,16,.075);box-shadow:0 8px 24px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.82);padding:14px;margin-top:10px}
.rk-preview-tiles{display:flex;justify-content:center;gap:7px;margin:2px 0 12px;overflow:hidden}
.rk-preview-tile{width:34px;height:44px;border-radius:10px;background:linear-gradient(145deg,#FFFDF8,#EFE7D8);border:1px solid rgba(26,20,16,.08);box-shadow:0 4px 10px rgba(26,20,16,.06),inset 0 1px 0 rgba(255,255,255,.88);position:relative;filter:blur(.25px)}
.rk-preview-tile:after{content:'?';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',Georgia,serif;font-weight:950;color:rgba(26,20,16,.25);font-size:18px}
.rk-preview-copy{text-align:center;font-size:12px;line-height:1.45;color:#6B6157;font-weight:800}.rk-preview-copy b{color:#176B42}
.rk-home-split{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rk-home-action-card{border-radius:20px;padding:14px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.075);box-shadow:0 6px 20px rgba(26,20,16,.04),inset 0 1px 0 rgba(255,255,255,.78);text-align:left;cursor:pointer;min-height:108px}.rk-home-action-card strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:18px;line-height:1.05;color:#1A1410;margin:7px 0 5px}.rk-home-action-card span{display:block;font-size:12px;line-height:1.35;color:#6B6157;font-weight:750}
.rk-rooms-card{border-radius:26px;padding:18px;background:linear-gradient(145deg,#FFFDF8,#F3EFE6);border:1px solid rgba(26,20,16,.08);box-shadow:0 12px 32px rgba(26,20,16,.055),inset 0 1px 0 rgba(255,255,255,.82)}
.rk-rooms-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.rk-rooms-kicker{font-size:9px;letter-spacing:2.4px;text-transform:uppercase;font-weight:950;color:#176B42;margin-bottom:7px}.rk-rooms-title{font-family:'Fraunces',Georgia,serif;font-size:25px;line-height:1.02;font-weight:950;letter-spacing:-.7px;color:#1A1410;margin:0 0 6px}.rk-rooms-copy{font-size:12.5px;line-height:1.45;color:#6B6157;font-weight:750;margin:0;max-width:38ch}
.rk-rooms-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:14px 0}.rk-room-mini{border-radius:18px;padding:12px 10px;background:rgba(255,255,255,.72);border:1px solid rgba(23,107,66,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.82);min-width:0}.rk-room-mini strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:21px;line-height:1;font-weight:950;color:#176B42;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rk-room-mini span{display:block;font-size:8px;letter-spacing:1.55px;text-transform:uppercase;font-weight:950;color:rgba(26,20,16,.46);line-height:1.2}.rk-room-mini.gold strong{color:#A07828}
.rk-rooms-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.rk-rooms-actions button{border-radius:16px;padding:13px 10px;border:1px solid rgba(23,107,66,.14);background:linear-gradient(180deg,#FFFDF8,#F1E9DB);color:#176B42;font-weight:950;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.75)}.rk-rooms-actions button:first-child{background:linear-gradient(135deg,#176B42,#0F5432);color:#fff;border-color:rgba(255,255,255,.16)}
.rk-share-preview-card{border-radius:24px;padding:18px;background:linear-gradient(145deg,#FFF9ED,#F7EFE0);border:1px solid rgba(160,120,40,.16);box-shadow:0 10px 26px rgba(160,120,40,.06),inset 0 1px 0 rgba(255,255,255,.8)}.rk-share-preview-title{font-family:'Fraunces',Georgia,serif;font-size:22px;line-height:1.05;font-weight:950;color:#1A1410;margin:0 0 6px}.rk-share-preview-copy{font-size:12.5px;line-height:1.5;color:#6B6157;font-weight:750;margin:0 0 14px}.rk-share-artifact{border-radius:18px;background:#FFFDF8;border:1px solid rgba(26,20,16,.07);padding:14px;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.82);margin-bottom:12px}.rk-share-artifact strong{display:block;font-family:'Fraunces',Georgia,serif;font-size:18px;color:#1A1410;margin-bottom:5px}.rk-share-artifact span{display:block;font-size:12px;color:#6B6157;font-weight:850;line-height:1.55}.rk-share-grid{letter-spacing:3px;font-size:18px;margin-top:8px}
.rk-how-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.rk-how-card{border-radius:18px;padding:14px 12px;background:linear-gradient(145deg,#FFFDF8,#F7F0E5);border:1px solid rgba(26,20,16,.07);box-shadow:0 5px 18px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.78)}.rk-how-card b{display:block;font-family:'Fraunces',Georgia,serif;font-size:15px;line-height:1.1;color:#1A1410;margin:7px 0 5px}.rk-how-card span{font-size:11.5px;line-height:1.35;color:#6B6157;font-weight:750}
.rk-activity-strip{display:flex;align-items:center;gap:8px;overflow:hidden;border-radius:999px;padding:9px 12px;background:rgba(23,107,66,.06);border:1px solid rgba(23,107,66,.09);color:#176B42;font-size:11.5px;font-weight:900;white-space:nowrap}.rk-activity-dot{width:8px;height:8px;border-radius:999px;background:#4CD987;box-shadow:0 0 0 4px rgba(76,217,135,.10);flex-shrink:0}
.rk-learn-simple-title{font-family:'Fraunces',Georgia,serif;font-size:21px;line-height:1.05;font-weight:950;color:#1A1410;margin:0 0 12px}.rk-learn-simple-grid{display:grid;gap:9px}.rk-learn-simple-grid .rk-learn-item:nth-child(n+4){display:none!important}
@media(min-width:760px){.rk-home-landing-flow{max-width:1040px}.rk-startup-logo{font-size:58px}.rk-startup-subtitle{font-size:18px}.rk-startup-line{font-size:16px}.rk-primary-daily-card{display:grid;grid-template-columns:1fr auto;align-items:center;padding:24px}.rk-primary-daily-title{font-size:34px}.rk-primary-daily-play{width:78px;height:78px}.rk-primary-daily-play:before{border-top-width:14px;border-bottom-width:14px;border-left-width:22px}.rk-rack-preview-card{padding:16px}.rk-preview-tile{width:42px;height:54px}.rk-rooms-card{padding:22px}.rk-rooms-title{font-size:30px}.rk-share-preview-card{display:grid;grid-template-columns:1fr 260px;gap:18px;align-items:center}.rk-share-artifact{margin-bottom:0}.rk-how-strip{gap:12px}}
@media(max-width:430px){.rk-startup-hero{padding-top:10px}.rk-startup-logo{font-size:42px}.rk-home-split,.rk-rooms-actions{grid-template-columns:1fr}.rk-rooms-grid{grid-template-columns:1fr 1fr}.rk-room-mini:last-child{grid-column:1/-1}.rk-how-strip{grid-template-columns:1fr}.rk-preview-tiles{gap:5px}.rk-preview-tile{width:31px;height:42px}}

`;


const S={
  outer:{background:"#F8F4EE",minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"flex-start"},
  app:{fontFamily:F.b,background:C.bg,minHeight:"100vh",color:C.ink,width:"100%",maxWidth:560,borderLeft:`1px solid ${C.bdr}`,borderRight:`1px solid ${C.bdr}`,overflowX:"hidden"},
  pg:{padding:"14px 18px",paddingBottom:52},
  pill:{background:"linear-gradient(180deg,#F2EBDD,#E9E0CF)",borderRadius:14,padding:"8px 8px",textAlign:"center",border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"inset 0 1px 0 rgba(255,255,255,.65),0 2px 8px rgba(26,20,16,.025)"},
  card:{background:"linear-gradient(145deg,#FFFDF8,#F8F1E6)",border:`1px solid rgba(26,20,16,.085)`,borderRadius:18,padding:16,marginBottom:14,boxShadow:"0 6px 22px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.72)"},
  dot:{width:22,height:22,borderRadius:11,background:C.jade+"10",border:`1.5px solid ${C.jade}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.jade,flexShrink:0,boxShadow:"inset 0 1px 0 rgba(255,255,255,.75)"},
  passBtn:{width:"100%",padding:"14px 0",borderRadius:14,border:"1px solid rgba(255,255,255,.14)",cursor:"pointer",background:`linear-gradient(135deg,${C.cinn},#8A2020)`,color:"#fff",fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:.6,minHeight:50,boxShadow:"0 8px 18px rgba(176,42,42,.16),inset 0 1px 0 rgba(255,255,255,.16)"},
  greenBtn:{padding:"13px 0",background:`linear-gradient(135deg,${C.jade},#0F5432)`,color:"#fff",border:"1px solid rgba(255,255,255,.16)",borderRadius:14,fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:.4,cursor:"pointer",minHeight:50,boxShadow:"0 8px 18px rgba(23,107,66,.18),inset 0 1px 0 rgba(255,255,255,.18)"},
  oBtn:{padding:"11px 0",background:"linear-gradient(180deg,#F2EBDD,#E9E0CF)",color:C.ink,border:`1px solid rgba(23,107,66,.12)`,borderRadius:14,fontSize:13,cursor:"pointer",minHeight:46,fontWeight:700,boxShadow:"0 3px 10px rgba(0,0,0,.035),inset 0 1px 0 rgba(255,255,255,.65)"},
  back:{background:"rgba(23,107,66,.06)",border:`1px solid rgba(23,107,66,.08)`,borderRadius:999,color:C.jade,fontSize:12,cursor:"pointer",fontWeight:800,padding:"7px 11px",minHeight:34,display:"flex",alignItems:"center",boxShadow:"inset 0 1px 0 rgba(255,255,255,.55)"},
  sortBtn:{background:"linear-gradient(180deg,#FFFDF8,#F1E9DB)",border:`1px solid ${C.bdr}`,borderRadius:10,padding:"5px 10px",fontSize:9,color:C.mut,cursor:"pointer",fontWeight:800,minHeight:32,boxShadow:"inset 0 1px 0 rgba(255,255,255,.7),0 2px 6px rgba(26,20,16,.025)"},
  shareCard:{background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",border:`1.5px solid ${C.jade}18`,borderRadius:18,padding:"16px 20px",textAlign:"center",marginTop:8,boxShadow:"0 6px 22px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.72)"},
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

// ─── SHARE CARD IMAGE, visible card + save button ───────────────────────────
function ShareCardImage({iq,dayNum,section,streak,mode,passInsights}){
  const [saving,setSaving]=useState(false);
  const [done,setDone]=useState(false);
  const cardRef=useRef(null);
  const profile=getProfile();
  const activeClubCode=getClubCode();
  const club=activeClubCode?CLUBS[activeClubCode]:null;
  const playerName=profile?.nickname||null;

  // Text-only pass indicators, emoji are unreliable in html2canvas
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
            title:`Daily Rackle #${dayNum} · ${iq.totalScore}`,
            text:`${iq.level} · playrackle.com`,
          });
          setDone(true);setTimeout(()=>setDone(false),3000);
          setSaving(false);return;
        }catch(e){}
      }
      // Desktop fallback, download
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
      {/* ── VISIBLE CARD, captured directly by html2canvas ── */}
      <div ref={cardRef} style={{
        background:"#061F12",
        borderRadius:14,
        overflow:"hidden",
        padding:"18px 16px 14px",
        fontFamily:SANS,
        color:"#fff",
        position:"relative",
      }}>

        {/* Subtle tile watermark, pure CSS, no image */}
        <div aria-hidden style={{position:"absolute",right:12,bottom:10,fontSize:64,opacity:0.04,lineHeight:1,userSelect:"none",pointerEvents:"none"}}>🀄</div>

        {/* ── TOP ROW, logo + day badge ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          {/* Logo: tile glyph + wordmark */}
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:28,height:28,borderRadius:6,background:"#1B7D4E",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:15,lineHeight:1}}>🀄</span>
            </div>
            <div>
              <div style={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:"#fff",letterSpacing:-0.3,lineHeight:1}}>Rackle</div>
              <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",letterSpacing:1.5,fontFamily:SANS,fontWeight:700,marginTop:1}}>RACKLE SCORE</div>
            </div>
          </div>
          {/* Day badge */}
          {mode==="daily"&&<div style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"3px 10px"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:2,fontWeight:700,fontFamily:SANS}}>DAY #{dayNum}</span>
          </div>}
        </div>

        {/* ── IQ SCORE + LEVEL ── */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:18,marginBottom:8}}>
          <div style={{fontFamily:SERIF,fontSize:56,fontWeight:700,color:lvlCol,lineHeight:1,letterSpacing:-2}}>{iq.totalScore}</div>
          <div style={{paddingBottom:6}}>
            <div style={{fontFamily:SERIF,fontSize:14,fontWeight:700,color:"#fff",lineHeight:1.2}}>{iq.level}</div>
            {iq.styleName&&<div style={{fontSize:9,color:"rgba(255,255,255,0.5)",fontFamily:SANS,marginTop:3}}>{iq.styleName}</div>}
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

        {/* ── FOOTER, club + clickable URL ── */}
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

      {/* Emoji row shown below for copy, doesn't go into canvas */}
      {passEmoji&&<div style={{textAlign:"center",marginTop:6,fontSize:12,letterSpacing:2,color:C.mut}}>{passEmoji}</div>}
    </div>
  );
}

// ─── CARD SEASON BANNER, shown once when new NMJL card year detected ─────────
// ─── URL PARAM HELPERS, for club deep-links ─────────────────────────────────
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
function fT(s){if(!s&&s!==0)return"";return`${Math.floor(s/60)}:${(s%60<10?"0":"")+(s%60)}`;}
function tAria(t){if(t.t==="j")return"Joker tile";if(t.t==="f")return"Flower tile";if(t.t==="w")return`${t.v} Wind tile`;if(t.t==="d")return`${tS(t)} Dragon tile`;return`${t.n} ${SN[t.s]} tile`;}
function tLabel(t){if(t.t==="j")return"Joker";if(t.t==="f")return"Flower";if(t.t==="w")return`${t.v} Wind`;if(t.t==="d")return`${tS(t)} Dragon`;return`${t.n} ${SN[t.s]}`;}

// ─── SECTION DEFINITIONS ─────────────────────────────────────────────────────
// 2026 NMJL Card, validated against all 3 card images.
// Scoring philosophy derived from hand-count analysis per section:
//   2026: 4 hands | 2468: 8 hands | ALN: 3 hands | QUINTS: 3 hands
//   CR: 8 hands   | 13579: 9 hands  | W/D: 8 hands | 369: 6 hands | S&P: 6 hands
// Key 2026-card tile weights (frequency across all hands):
//   6 → highest (appears in 2026, 2468, 369, W/D concealed), NEVER pass a 6
//   Flowers → appear in majority of hands across all numeric sections
//   1 → lowest utility (fewest hands), 9 → low utility (only 13579, CR)
//   Soap/0 → only 2026 section; very specific but free to any suit
//   Winds → appear only in 13579 (NN/SS) and W/D; pass from all other sections
function cg(h,fn){const v=h.filter(fn),jk=h.filter(t=>t.t==="j").length,c={};v.forEach(t=>{const k=`${t.t}-${t.s||""}-${t.n||""}-${t.v||""}`;c[k]=(c[k]||0)+1;});const ct=Object.values(c);let kg=0,pg=0,pr=0;ct.forEach(n=>{if(n>=4)kg++;else if(n>=3)pg++;else if(n>=2)pr++;});return{v:v.length,jk,kg,pg,pr};}

// Consecutive Run scoring, window-based group depth.
// The 2026 CR hands are NOT about long runs of singles. They are about
// having pungs/kongs/pairs of numbers that fall within a tight 3-5 number window.
// e.g. 111 222 3333 4444 → window [1,2,3,4], groups: 3+3+4+4 = 14 tiles, very deep.
// e.g. 11 222 33 444 5555 → window [1,2,3,4,5], groups: 2+3+2+3+4 = 14 tiles, 5-wide.
// Scorer: find the best N-wide window where GROUPED tiles is maximised.
// Singles (lone tiles) give 0 group credit, CR needs pungs/kongs, not lone stragglers.
// Steeper width penalties (5-wide=2, 4-wide=1) vs old (1.5/0.5) to tighten requirement.
function crWindowScore(h){
  // CR hands are SAME-SUIT sequences. Score per suit, take the best.
  // Pooling across suits is wrong, 3Bam + 3Crk + 3Dot is NOT a CR group.
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
        // Singles (cnt===1) give 0, CR needs actual groups (pairs/pungs/kongs)
        const groupDepth=wNums.reduce((sum,n)=>{
          const cnt=Math.min(gc[n]||0,4);
          return sum+(cnt>=4?4:cnt>=3?3:cnt>=2?2:0);
        },0);
        const groupCount=wNums.filter(n=>(gc[n]||0)>=2).length;
        // Steeper width penalties, 3-wide has the most hand options
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
{id:"2026",name:"2026",color:"#B54E7A",icon:"📅",desc:"Year tiles, 2s, 0 (Soap), 6s",hold:"2s, 6s, Soap (White Dragon), highest priority. Red & Green Dragons. Flowers only if you have 2+",pass:"All odd numbers (1,3,5,7,9), 4s, 8s, Winds only if building the NEWS hand",combos:"6 appears in all 4 hands, it is your most critical tile. Soap (White Dragon) is uniquely valuable here: it is suit-wild, meaning it counts as any suit's 0. Red and Green Dragons also appear. Flowers only appear in 1 of 4 hands, don't hold a lone Flower for this section.",joker:null,hands:4,
  ck:h=>{
    const twos=h.filter(t=>t.t==="s"&&t.n===2).length;
    const sixes=h.filter(t=>t.t==="s"&&t.n===6).length;
    // Both anchors required, missing either is a strong signal against 2026
    if(!twos||!sixes)return 0.01;
    const soap=h.filter(t=>t.t==="d"&&t.v==="Soap").length;
    const anyDragon=h.filter(t=>t.t==="d").length;
    const flowers=h.filter(t=>t.t==="f").length;
    const winds=h.filter(t=>t.t==="w").length;
    const jk=h.filter(t=>t.t==="j").length;
    const offNums=h.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length;
    // Group quality for 2s and 6s, scale with count
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
{id:"2468",name:"2468",color:"#B83232",icon:"🔴",desc:"Even numbers, 2, 4, 6, 8",hold:"2s, 4s, 6s, 8s, Flowers, Jokers, any Dragon",pass:"All odds (1,3,5,7,9), North/South Winds",combos:"6 is in 7 of 8 hands, never pass it. 2 is next most common (7/8), then 8 (6/8), then 4 (6/8). The last hand (FF 246 888 246 888) is concealed, no jokers allowed.",joker:null,hands:8,
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
    // Group depth in even tiles, singles give 0 credit
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
{id:"369",name:"369",color:"#B84A72",icon:"💗",desc:"Multiples of 3, 3, 6, 9",hold:"3s, 6s, 9s, any Dragon, Flowers only if you have 2+ (appear in 3/6 hands)",pass:"1s, 2s, 4s, 5s, 7s, 8s, lone Flowers, Winds (unless building NEWS hand)",combos:"6 is in every single 369 hand, the most locked-in anchor on the entire card. Never pass a 6 if you're considering this section. Dragons appear in 2 hands. The final hand (FF 333 666 999 369) is fully concealed, no exposures allowed.",joker:null,hands:6,
  ck:h=>{
    const threes=h.filter(t=>t.t==="s"&&t.n===3).length;
    const sixes=h.filter(t=>t.t==="s"&&t.n===6).length;
    const nines=h.filter(t=>t.t==="s"&&t.n===9).length;
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    const winds=h.filter(t=>t.t==="w").length;
    const jk=h.filter(t=>t.t==="j").length;
    const offNums=h.filter(t=>t.t==="s"&&![3,6,9].includes(t.n)).length;
    // Group depth for 369 tiles, singles give 0 credit
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
{id:"13579",name:"13579",color:"#D48A2A",icon:"🟠",desc:"Odd numbers, 1, 3, 5, 7, 9",hold:"5s and 3s (top priority), 1s, 7s, 9s, N/S Winds, Flowers, Dragons",pass:"All evens, E/W Winds",combos:"5 and 3 are the most-used odds, appear in 9 of 10 hands. North and South Winds appear in 2 hands (pass East/West freely). Dragons appear in 4 hands, worth holding a pair. Two hands use Dragon kongs: one needs a MATCHING Dragon, one needs an OPPOSITE Dragon. Flowers appear in 4 of 10 hands.",joker:null,hands:10,
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
    // Group depth in odd tiles, singles give 0 credit
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
// Key insight: CR is about GROUP DEPTH within a 3-5 number window, NOT run length.
// 111 222 3333 4444 (4-wide window, kongs+pungs) beats 1 2 3 4 5 6 7 (7 singles).
// The FFFFFF sextette appears in hand 6, flowers are critical here.
// One hand (FFF 11 22 333 DDDD) uses a Dragon kong, any dragon.
// Concealed hand: 1 22 333 1 22 333 44.
{id:"cr",name:"Consec. Run",color:"#1B7D4E",icon:"🟢",desc:"Sequential numbers, pungs & kongs in a 3-5 number window",hold:"Groups (pungs/kongs) of consecutive numbers, all Flowers, Jokers",pass:"Isolated singles outside your run window, all Winds, scattered numbers",combos:"You need pungs or kongs of 3-4 consecutive numbers, not a long string of singles. One hand uses 6 Flowers as a group. One hand uses a Dragon kong, the Dragon must match the MIDDLE number of your run.",joker:null,hands:8,
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
    // Normalise window score, max realistic score ~32 with 13 tiles
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
{id:"wd",name:"Winds & Dragons",color:"#5C5247",icon:"🌀",desc:"Winds, Dragons, and specific number kongs",hold:"All Winds, all Dragons, Jokers, number kongs of 1-4 if you have 4+ of one value",pass:"Most number tiles, Flowers (appear in only 2 of 8 hands, don't hold a lone Flower)",combos:"Winds appear in 7 of 8 hands, they are your most important tiles here. Dragons appear in 5 of 8. Two hands use kongs of like numbers (1s or 2s), so 4-of-a-kind number tiles can fit. Flowers appear in only 2 hands, only hold them if you're stacking multiple.",joker:null,hands:8,
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
    // Honor group depth, singles give 0 credit
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
{id:"aln",name:"Like Numbers",color:"#2460A8",icon:"🔵",desc:"All one number, kongs & pairs of the same number",hold:"4+ of one number, Flowers, Jokers, Dragons",pass:"All other numbers, spread is your enemy. Pass any number that isn't your target immediately",combos:"Pick your number by round 1 and commit hard, spreading across two numbers kills your score. Flowers are critical: one hand uses a sextette of 6 Flowers (1111 FFFFFF 1111). Dragons appear in 2 of 3 hands. You need 8-12 tiles of a single number, so Jokers are essential.",joker:null,hands:3,
  ck:h=>{
    const nc={};h.filter(t=>t.t==="s").forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
    const vals=Object.values(nc);
    const best=vals.length?Math.max(...vals):0;
    const spread=vals.length;
    const flowers=h.filter(t=>t.t==="f").length;
    const dragons=h.filter(t=>t.t==="d").length;
    const jk=h.filter(t=>t.t==="j").length;
    const winds=h.filter(t=>t.t==="w").length;
    // Concentration scoring, must have deep stacks of ONE number
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
// Key: Only 3 hands. Quints require 5 of a single tile, impossible without 2+ Jokers.
// Two Jokers are the MINIMUM entry requirement. Without them, abandon immediately.
{id:"q",name:"Quints",color:"#7B5CB0",icon:"🟣",desc:"Five of a kind, requires 2+ Jokers",hold:"Jokers (mandatory, need 2+), 3-4 of any tile, Flowers",pass:"Everything else if you don't have 2 Jokers, pivot immediately",combos:"Without 2 Jokers, this section is unreachable, abandon it in round 1. With 2+ Jokers and 3-4 of a specific tile, commit to stacking that tile. Flowers appear in hand 2 (FF 11111 22 33333). The third hand requires the OPPOSITE Dragon (not matching), hold both dragon types if you have them.",joker:null,hands:3,
  ck:h=>{
    const jk=h.filter(t=>t.t==="j").length;
    // Without 2 jokers, quints are nearly impossible, hard floor
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

// ── Singles & Pairs (6 hands), CONCEALED ONLY, NO JOKERS ───────────────────
// Hands: NN EE WW SS 1D 1D 1D | 2 4 66 88 2 4 66 88 88 |
//        FF 3369 3669 3699 | 11 22 33 44 55 66 77 (1 suit, any 7 consec.) |
//        11 357 99 11 357 99 | FF 2026 2026 2026
// CONCEALED_ONLY: no exposures. JOKERS_PROHIBITED: jokers cannot be used in singles or pairs.
// Key: All pairs and singles. Flowers appear in 3/6 hands. Specific number pairs.
// The 7-consecutive hand (11 22 33 44 55 66 77) is very specific.
{id:"sp",name:"Singles & Pairs",color:"#2E9485",icon:"🩵",desc:"Only singles and pairs, fully concealed, no Jokers",hold:"Pairs (especially 2026 tiles, 369 tiles, consecutive same-suit pairs), Flowers",pass:"Triples and quads, any group of 3+ is structurally wrong here",combos:"Fully concealed, no exposures allowed. Jokers are completely useless (cannot be a single or in a pair) and cannot be passed in the Charleston, so you're stuck with any you're dealt. Build pairs of matching tiles across all three suits. Flowers count as natural pairs (FF together). One hand uses 7 consecutive same-suit pairs, if you see a run of paired numbers in one suit, protect them.",joker:"Jokers CANNOT be used in Singles & Pairs, not as a single, not in a pair. They have zero value here and cannot be passed away during the Charleston. If you're dealt Jokers and commit to S&P, you're playing shorthanded, factor this in before choosing this section.",hands:6,
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
    // Triples are structurally wrong, hard penalty
    const triplePenalty=triples*0.10;
    // Pairs are the primary signal, boosted scale
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

// Section metadata for IQ scoring, calibrated to 2026 NMJL card hand analysis
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
// CONSTRAINT ENFORCEMENT, all card parentheticals are now modeled:
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

function mkHand(label,sec,value,concealed,fit,constraint=""){return{label,sec,value,concealed,fit,constraint};}

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
  // American Mahjong dragon matching: Bam→Green, Crak→Red, Dot→Soap.
  // Soap is also the printed zero for 2026, but it should not act as a
  // matching dragon for Bam/Crak lines.
  if(suit==="bam") return dragons(rack,"Grn");
  if(suit==="crak")return dragons(rack,"Red");
  return dragons(rack,"Soap");
}
function oppDragon(rack,suit){
  if(suit==="bam") return dragons(rack,"Red")+dragons(rack,"Soap");
  if(suit==="crak")return dragons(rack,"Grn")+dragons(rack,"Soap");
  return dragons(rack,"Red")+dragons(rack,"Grn");
}

// Score how many "slots" of a group a rack can fill (with joker assist for pungs/kongs)
function groupFit(have,jokerPool,need){
  const natural=Math.min(have,need);
  const rem=need-natural;
  const jk=Math.min(rem,jokerPool);
  return{natural,jk,total:natural+jk,complete:natural+jk>=need};
}

// Score a hand's fit: returns 0-1 (fraction of hand slots filled by rack)
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

  // 222 000 2222 6666, Any 2 Suits
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

  // 2026 DDD 2222 DDD, Any 2 Suits w Matching Dragons, Kong 2 or 6
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
        // "2026" singles: need one 2, one Soap(0), one 2, one 6, all noJoker
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

  // FFF 2026 222 6666, Any 3 Suits
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
      ],jk,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // 22 00 222 666 NEWS, Any 2 Suits
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

  // 222 444 6666 8888, Any 1 or 2 Suits
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

  // FF 2222 44 66 8888, Any 2 Suits
  // Flowers(2) + kong 2 + pair 4 + pair 6 + kong 8, pairs are noJoker
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

  // EE 22 444 666 88 WW, Any 1 Suit, East and West Only
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

  // 2222 DDD 8888 DDD, Any 2 Suits w Matching Dragons, These Nos. Only (2 and 8)
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

  // FFF 22 44 666 8888, Any 1 Suit
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

  // 2468 2222 D 2222 D, Any 3 Suits, Like Kongs 2,4,6 or 8 w Matching Dragon
  // Singles of 2,4,6,8 (each from any suit), then two groups: kong of same number + matching dragon single
  // "Kong 2,4,6 or 8" = the repeated kong number is one of these evens
  mkHand("2468 2222 D 2222 D","2468",25,false,r=>{
    const jk=jokers(r);
    let best=0;
    for(const kongNum of [2,4,6,8]){
      // Singles 2,4,6,8 from any suits (cross-suit OK for singles row)
      const t2=countNum(r,2),t4=countNum(r,4),t6=countNum(r,6),t8=countNum(r,8);
      const kongTile=kongNum===2?t2:kongNum===4?t4:kongNum===6?t6:t8;
      // Matching dragon, try each suit for the kong group
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

  // FFF 2468 FFF 2222, Any 2 Suits, Kong 2,4,6 or 8
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

  // FF 246 888 246 888, Any 2 Suits, CONCEALED
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

  // 333 666 6666 9999, Any 2 or 3 Suits
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

  // 33 66 333 666 9999, Any 3 Suits
  mkHand("33 66 333 666 9999","369",25,false,r=>{
    const jk=jokers(r);
    const t3=countNum(r,3),t6=countNum(r,6),t9=countNum(r,9);
    return handFitScore([
      {have:t3,need:2,noJoker:true},{have:t6,need:2,noJoker:true},
      {have:t3,need:3},{have:t6,need:3},{have:t9,need:4}
    ],jk,14);
  }),

  // FFF 33 666 99 DDDD, 1 Suit w Matching or Opp Dragon
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

  // 33 66 666 999 NEWS, Any 2 Suits
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

  // FF 3369 3333 3333, Any 3 Suits, Pair 3,6, or 9, Kongs Match Pair
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

  // FF 333 666 999 369, Any 2 Suits, CONCEALED
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

  // 11 333 55 777 9999, Any 1 or 3 Suits
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

  // 111 333 3333 5555 -or- 555 777 7777 9999, Any 2 Suits
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

  // NN 1111 33 5555 SS -or- NN 5555 77 9999 SS, Any 1 Suit, North and South Only
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

  // 113579 1111 1111, Any 3 Suits, Pair Any Odd No., Kongs Match Pair
  // Singles: 1,1,3,5,7,9; then two kongs of the same odd number (matching pair)
  // 113579 1111 1111, Any 3 Suits, Pair Any Odd No., Kongs Match Pair
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
        ],jk,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FFF 11 33 555 DDDD -or- FFF 55 77 999 DDDD, Any 1 Suit w Matching Dragon
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

  // 11 33 111 333 5555 -or- 55 77 555 777 9999, Any 3 Suits
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

  // 1111 33 55 77 9999, Any 1 or 2 Suits
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

  // FF 11 33 55 111 111 -or- FF 55 77 99 555 555, Any 3 Suits, These Nos. Only, CONCEALED
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
        ],0,14);
        if(sc>best)best=sc;
      }
    }
    return best;
  }),

  // FF 135 777 999 DDD, Any 1 Suit w Opp Dragon, CONCEALED
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

  // 11 222 33 444 5555, Any 1 Suit, These Nos. Only
  mkHand("11 222 33 444 5555","cr",25,false,r=>{
    const jk=jokers(r);
    return Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:countNumSuit(r,1,s),need:2,noJoker:true},{have:countNumSuit(r,2,s),need:3},
      {have:countNumSuit(r,3,s),need:2,noJoker:true},{have:countNumSuit(r,4,s),need:3},{have:countNumSuit(r,5,s),need:4}
    ],jk,14)));
  }),

  // 55 666 77 888 9999, Any 1 Suit, These Nos. Only
  mkHand("55 666 77 888 9999","cr",25,false,r=>{
    const jk=jokers(r);
    return Math.max(...ALL_SUITS.map(s=>handFitScore([
      {have:countNumSuit(r,5,s),need:2,noJoker:true},{have:countNumSuit(r,6,s),need:3},
      {have:countNumSuit(r,7,s),need:2,noJoker:true},{have:countNumSuit(r,8,s),need:3},{have:countNumSuit(r,9,s),need:4}
    ],jk,14)));
  }),

  // FFF 1111 234 5555, Any 1 or 2 Suits, Any 5 Consec Nos.
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

  // 11 22 111 222 3333, Any 1 or 3 Suits, Any 3 Consec Nos.
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

  // 111 222 3333 4444, Any 1 or 2 Suits, Any 4 Consec Nos.
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

  // FFF 11 22 333 DDDD, 1 or 2 Suits, Any Run, Dragons Match Middle No.
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

  // 1111 FFFFFF 2222, Any 1 Suit, Any 2 Consec Nos.
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

  // FF 1111 2222 3333, Any 1 or 3 Suits, Any 3 Consec Nos.
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

  // 1 22 333 1 22 333 44, Any 3 Suits, Any 4 Consec Nos., CONCEALED
  mkHand("1 22 333 1 22 333 44","cr",35,true,r=>{
    let best=0;
    for(let start=1;start<=6;start++){
      const [a,b,c,d]=[start,start+1,start+2,start+3];
      // Use pooled (any 3 suits) tile counts, concealed, no jokers
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

  // NNNN EEE WWW SSSS -or- NNN EEEE WWWW SSS, Any Winds
  // Card shows this as ONE hand with two valid wind distributions. Both forms scored.
  mkHand("NNNN EEE WWW SSSS","wd",25,false,r=>{
    const jk=jokers(r);
    const n=winds(r,"N"),e=winds(r,"E"),w=winds(r,"W"),s=winds(r,"S");
    const formA=handFitScore([{have:n,need:4},{have:e,need:3},{have:w,need:3},{have:s,need:4}],jk,14);
    const formB=handFitScore([{have:n,need:3},{have:e,need:4},{have:w,need:4},{have:s,need:3}],jk,14);
    return Math.max(formA,formB);
  }),

  // 1234 DDD DDD DDDD, Any 4 Consec Nos. in Any 1 Suit, Any 3 Dragons
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

  // NNN 1111 1111 SSS, Any Like Odd Nos. in Any 2 Suits
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

  // EEE 2222 2222 WWW, Any Like Even Nos. in Any 2 Suits
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

  // FFF NNNN FFF DDDD, Any Wind, Any Dragon
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

  // 1 N 2 EE 3 WWW 4 SSSS, Any 1 Suit, These Nos. Only
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

  // FF NNNN SSSS DD DD -or- FF EEEE WWWW DD DD, Any 2 Dragons
  // Two flowers + kong of one wind pair + two pairs of ANY two dragon types (can be same or different)
  mkHand("FF NNNN SSSS DD DD","wd",25,false,r=>{
    const jk=jokers(r);const fl=flowers(r);
    const n=winds(r,"N"),s=winds(r,"S"),e=winds(r,"E"),w=winds(r,"W");
    let best=0;
    const drTypes=["Red","Grn","Soap"];
    // Try both wind variants (N+S or E+W)
    for(const [wa,wb] of [[n,s],[e,w]]){
      // "Any 2 Dragons", two pairs; try all ordered combos of dragon types
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

  // NN EEE 2026 WWW SS, 2026 Any 1 Suit, CONCEALED
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

  // 1111 FFFFFF 1111, Any 2 Suits
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

  // 1111 D 111 D 1111 D, Any 3 Suits w Matching Dragon
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
      // We need 3 dragon singles total, one matching each suit group (noJoker)
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

  // FF 1111 11 1111 DD, Any 3 Suits w Any Dragon
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

  // 11111 1111 11111, Any 3 Suits, Any Like Nos.
  // Quint (5) in suit A, Kong (4) in suit B, Quint (5) in suit C, same number
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

  // FF 11111 22 33333, Any 1 Suit, Any 3 Consec Nos.
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

  // 11111 44444 DDDD, Any 2 Nos. in Any 1 Suit w Opp Dragon
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
  // SINGLES & PAIRS SECTION, CONCEALED, NO JOKERS
  // ════════════════════════════════════════════════════════════════

  // NN EE WW SS 1D 1D 1D, Any 3 Suits, Any Like No. w Matching Dragon
  mkHand("NN EE WW SS 1D 1D 1D","sp",50,true,r=>{
    let best=0;
    const n=winds(r,"N"),e=winds(r,"E"),w=winds(r,"W"),s=winds(r,"S");
    for(let num=1;num<=9;num++){
      // "Matching Dragon", try each suit for the number tiles
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

  // 2 4 66 88 2 4 66 88 88, Any 3 Suits, These Nos. Only
  // All tiles are singles or pairs from 2,4,6,8 spread across 3 suits
  mkHand("2 4 66 88 2 4 66 88 88","sp",50,true,r=>{
    const t2=countNum(r,2),t4=countNum(r,4),t6=countNum(r,6),t8=countNum(r,8);
    return handFitScore([
      {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},
      {have:t6,need:2,noJoker:true},{have:t8,need:2,noJoker:true},
      {have:t2,need:1,noJoker:true},{have:t4,need:1,noJoker:true},
      {have:t6,need:2,noJoker:true},{have:t8,need:2,noJoker:true},
      {have:t8,need:2,noJoker:true}
    ],0,14);
  }),

  // FF 3369 3669 3699, Any 3 Suits
  mkHand("FF 3369 3669 3699","sp",50,true,r=>{
    const fl=flowers(r),t3=countNum(r,3),t6=countNum(r,6),t9=countNum(r,9);
    return handFitScore([
      {have:fl,need:2,noJoker:true},
      {have:t3,need:2,noJoker:true},{have:t6,need:1,noJoker:true},{have:t9,need:1,noJoker:true},
      {have:t3,need:1,noJoker:true},{have:t6,need:2,noJoker:true},{have:t9,need:1,noJoker:true},
      {have:t3,need:1,noJoker:true},{have:t6,need:1,noJoker:true},{have:t9,need:2,noJoker:true}
    ],0,14);
  }),

  // 11 22 33 44 55 66 77, Any 1 Suit, Any 7 Consec Nos.
  mkHand("11 22 33 44 55 66 77","sp",50,true,r=>{
    let best=0;
    for(const s of ALL_SUITS)for(let start=1;start<=3;start++){
      const tiles=[0,1,2,3,4,5,6].map(i=>countNumSuit(r,start+i,s));
      const sc=handFitScore(tiles.map(have=>({have,need:2,noJoker:true})),0,14);
      if(sc>best)best=sc;
    }
    return best;
  }),

  // 11 357 99 11 357 99, Any 2 Suits
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

  // FF 2026 2026 2026, Any 3 Suits
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

// ── HAND CONSTRAINTS, card-accurate suit/rule annotations for the Hand Browser ──
// Injected after catalog so the fit functions remain clean.
const HAND_CONSTRAINTS={
  // 2026
  "222 000 2222 6666":    "Any 2 Suits",
  "2026 DDD 2222 DDD":    "Any 2 Suits w Matching Dragons · Kong 2 or 6",
  "FFF 2026 222 6666":    "Any 3 Suits",
  "22 00 222 666 NEWS":   "Any 2 Suits",
  // 2468
  "222 444 6666 8888":    "Any 1 or 2 Suits",
  "FF 2222 44 66 8888":   "Any 2 Suits",
  "EE 22 444 666 88 WW":  "Any 1 Suit · East and West Only",
  "2222 DDD 8888 DDD":    "Any 2 Suits w Matching Dragons · These Nos. Only",
  "FFF 22 44 666 8888":   "Any 1 Suit",
  "2468 2222 D 2222 D":   "Any 3 Suits · Like Kongs 2,4,6 or 8 w Matching Dragon",
  "FFF 2468 FFF 2222":    "Any 2 Suits · Kong 2, 4, 6 or 8",
  "FF 246 888 246 888":   "Any 2 Suits",
  // 369
  "333 666 6666 9999":    "Any 2 or 3 Suits",
  "33 66 333 666 9999":   "Any 3 Suits",
  "FFF 33 666 99 DDDD":   "1 Suit w Matching or Opp. Dragon",
  "33 66 666 999 NEWS":   "Any 2 Suits",
  "FF 3369 3333 3333":    "Any 3 Suits · Pair 3, 6 or 9 · Kongs Match Pair",
  "FF 333 666 999 369":   "Any 2 Suits",
  // 13579
  "11 333 55 777 9999":   "Any 1 or 3 Suits",
  "111 333 3333 5555":    "Any 2 Suits",
  "NN 1111 33 5555 SS":   "Any 1 Suit · North and South Only",
  "113579 1111 1111":     "Any 3 Suits · Pair Any Odd No. · Kongs Match Pair",
  "FFF 11 33 555 DDDD":   "Any 1 Suit w Matching Dragon",
  "11 33 111 333 5555":   "Any 3 Suits",
  "1111 33 55 77 9999":   "Any 1 or 2 Suits",
  "FF 11 33 55 111 111":  "Any 3 Suits · These Nos. Only",
  "FF 135 777 999 DDD":   "Any 1 Suit w Opp. Dragon",
  // Consecutive Run
  "11 222 33 444 5555":   "Any 1 Suit · These Nos. Only",
  "55 666 77 888 9999":   "Any 1 Suit · These Nos. Only",
  "FFF 1111 234 5555":    "Any 1 or 2 Suits · Any 5 Consec. Nos.",
  "11 22 111 222 3333":   "Any 1 or 3 Suits · Any 3 Consec. Nos.",
  "111 222 3333 4444":    "Any 1 or 2 Suits · Any 4 Consec. Nos.",
  "FFF 11 22 333 DDDD":   "1 or 2 Suits · Any Run · Dragons Match Middle No.",
  "1111 FFFFFF 2222":     "Any 1 Suit · Any 2 Consec. Nos.",
  "FF 1111 2222 3333":    "Any 1 or 3 Suits · Any 3 Consec. Nos.",
  "1 22 333 1 22 333 44": "Any 3 Suits · Any 4 Consec. Nos.",
  // Winds & Dragons
  "NNNN EEE WWW SSSS":    "Any Winds (2 forms: NNNN EEE WWW SSSS or NNN EEEE WWWW SSS)",
  "1234 DDD DDD DDDD":    "Any 4 Consec. Nos. in Any 1 Suit · Any 3 Dragons",
  "NNN 1111 1111 SSS":    "Any Like Odd Nos. in Any 2 Suits",
  "EEE 2222 2222 WWW":    "Any Like Even Nos. in Any 2 Suits",
  "FFF NNNN FFF DDDD":    "Any Wind · Any Dragon",
  "1 N 2 EE 3 WWW 4 SSSS":"Any 1 Suit · These Nos. Only",
  "FF NNNN SSSS DD DD":   "Any 2 Dragons (N+S or E+W winds)",
  "NN EEE 2026 WWW SS":   "2026 · Any 1 Suit",
  // Any Like Numbers
  "1111 FFFFFF 1111":     "Any 2 Suits · Any Like Nos.",
  "1111 D 111 D 1111 D":  "Any 3 Suits w Matching Dragon · Any Like Nos.",
  "FF 1111 11 1111 DD":   "Any 3 Suits w Any Dragon · Any Like Nos.",
  // Quints
  "11111 1111 11111":     "Any 3 Suits · Any Like Nos.",
  "FF 11111 22 33333":    "Any 1 Suit · Any 3 Consec. Nos.",
  "11111 44444 DDDD":     "Any 2 Nos. in Any 1 Suit w Opp. Dragon",
  // Singles & Pairs
  "NN EE WW SS 1D 1D 1D": "Any 3 Suits · Any Like No. w Matching Dragon",
  "2 4 66 88 2 4 66 88 88":"Any 3 Suits · These Nos. Only",
  "FF 3369 3669 3699":    "Any 3 Suits",
  "11 22 33 44 55 66 77": "Any 1 Suit · Any 7 Consec. Nos.",
  "11 357 99 11 357 99":  "Any 2 Suits",
  "FF 2026 2026 2026":    "Any 3 Suits",
};
// Patch constraint onto every hand object
HAND_CATALOG.forEach(h=>{if(HAND_CONSTRAINTS[h.label])h.constraint=HAND_CONSTRAINTS[h.label];});
function recommendSpecificHands(rack,sectionId){
  if(!rack||!sectionId)return[];
  const hands=HAND_CATALOG.filter(h=>h.sec===sectionId);
  const scored=hands.map(h=>{
    const cov=computeHonestCoverage(rack,h);
    return{...h,fitScore:cov.pct/100,coveragePct:cov.pct,credibility:cov.credibility,isCredible:cov.isCredible,variantLabel:cov.variantLabel,labelForDisplay:cov.labelForDisplay,coveragePlan:cov.plan,groupNuance:cov.groupNuance,tone:cov.tone,coachLine:cov.coachLine};
  }).sort((a,b)=>(b.credibility-a.credibility)||(b.coveragePct-a.coveragePct));
  return scored.filter(h=>h.isCredible).slice(0,3);
}

// ─── HAND FAMILIES ───────────────────────────────────────────────────────────
// Groups sections into strategic families for the scorecard "Best Hand Family" block.
// Each section belongs to exactly one family. Family determines coaching language.
const HAND_FAMILIES={
  "Power":  {label:"Power Hand",emoji:"💪",color:"#7B5CB0",bg:"#F4EFFC",border:"#C4A8E8",
    desc:"Built on jokers and set stacking. Your strength is raw tile depth, pungs and kongs.",
    sections:["q","aln"]},
  "Run":    {label:"Consecutive Run",emoji:"🟢",color:"#1B7D4E",bg:"#EDF7F1",border:"#8FC9A8",
    desc:"Built on connected number sequences. Pungs and kongs within a tight 3-4 number window.",
    sections:["cr"]},
  "Number Pattern":{label:"Number Pattern",emoji:"🔢",color:"#B83232",bg:"#FEF0F0",border:"#E8A8A8",
    desc:"Built on a specific number family, odds, evens, or multiples of 3.",
    sections:["13579","2468","369"]},
  "Year":   {label:"Year Hand (2026)",emoji:"📅",color:"#B54E7A",bg:"#FDF0F6",border:"#E8A8CC",
    desc:"Built on 2s, 6s, and Soap. Highly specific, needs both anchors from the start.",
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
// Produces 1-2 specific, tile-grounded paths for the scorecard.
// Uses the actual finalRack tile counts, never generic advice.
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

  // CR window analysis, find the best 4-wide window
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
      why=[jokers>=2?`${jokers} jokers let you build a quint around any tile you stack.`:"You're short on jokers, quints require 2+.",bestNum&&bestNum[1]>=3?`${bestNum[1]}× ${bestNum[0]} is already near-quint depth, stack it.`:"Identify your deepest tile group and commit to it now."];
      keep=jokers>=2?["All Jokers",bestNum?`${bestNum[0]}s (your deepest group)`:"Your best tile group","Flowers"]:[`Need ${2-jokers} more joker(s) to make Quints viable`];
      pivot="If you don't draw another joker in the first 2 turns, pivot to Any Like Numbers.";
    } else if(id==="aln"){
      anchor=bestNum?`${bestNum[1]}× ${bestNum[0]}`:"Your deepest number";
      why=[bestNum?`${bestNum[1]} of ${bestNum[0]} is your current best stack, ALN needs 8-12 of one number.`:"Identify one number to commit to immediately.",jokers>=1?`${jokers} joker${jokers>1?"s":""} help fill out kongs quickly.`:"No jokers, you'll need to draw your number consistently.",flowers>=2?`${flowers} flowers cover the sextette hand (1111 FFFFFF 1111).`:""];
      why=why.filter(Boolean);
      keep=[bestNum?`All ${bestNum[0]}s`:"Your target number","All Jokers","All Flowers"];
      pivot="If another player keeps drawing your number, shift to Any Like Numbers with the next best stack.";
    } else if(id==="cr"){
      const w=crWindow;
      anchor=w?`${w.suit[0].toUpperCase()}${w.suit.slice(1)} ${w.nums[0]}-${w.nums[3]} window`:"Best consecutive window";
      why=[w?`Your ${w.suit} suit has the strongest consecutive grouping (depth ${w.depth}), that's your CR window.`:"No deep window yet, look for 3-4 numbers with multiple tiles in one suit.",flowers>=2?`${flowers} flowers help, one CR hand uses a flower sextette.`:"",jokers>=1?`${jokers} joker${jokers>1?"s":""} can plug gaps in your window.`:""];
      why=why.filter(Boolean);
      keep=w?[`All ${w.suit} tiles in the ${w.nums[0]}-${w.nums[3]} range`,"All Flowers","All Jokers"]:["Identify your 4-number window before next discard","All Jokers","All Flowers"];
      pivot="If your window stays shallow after 2 draws, pivot to 2468 or 13579 depending on your number parity.";
    } else if(id==="2468"){
      const sixStr=sixes>0?`${sixes}× 6`:"missing 6s";
      const total=evens.reduce((s,e)=>s+e.c,0);
      anchor=`${total} even tiles, ${sixStr} (your anchor)`;
      const deepest=[...evens].sort((a,b)=>b.c-a.c)[0];
      why=[sixes>=2?`${sixes} sixes are a strong anchor, 6 appears in 7 of 8 hands.`:"You need 6s, they appear in 7 of 8 hands. Draw priority.",deepest&&deepest.c>=2?`${deepest.c}× ${deepest.n} is your next deepest group, build on it.`:"Start pairing your even numbers.",flowers>=2?`${flowers} flowers support this section well.`:""];
      why=why.filter(Boolean);
      keep=[sixes>0?"All 6s (never pass)":null,evens.filter(e=>e.c>=2).map(e=>`${e.n}s (${e.c} tiles)`),"All Flowers","All Jokers"].flat().filter(Boolean);
      pivot="If evens stay thin after 3 draws, check if 369 fits better, 6s serve both sections.";
    } else if(id==="369"){
      const total=t369.reduce((s,e)=>s+e.c,0);
      anchor=`${total} tiles of 3/6/9${sixes>0?`, ${sixes}× 6 (anchor)`:""} `;
      why=[sixes>=1?`${sixes} six${sixes>1?"es":""}, 6 is in 100% of 369 hands. It's your core.`:"Missing 6s, they appear in every 369 hand. Draw priority.",t369.filter(e=>e.c>=2).length>0?`You have pairs in ${t369.filter(e=>e.c>=2).map(e=>e.n).join("/")}, protect them.`:"Stack 3s and 9s to pair with your 6s.",flowers>=2?`${flowers} flowers support this section.`:""];
      why=why.filter(Boolean);
      keep=["All 6s (never pass)","All 3s and 9s","All Flowers","All Jokers"].filter(Boolean);
      pivot="If you hold both 6s and 2s, 2468 is your backup, they share the same anchor.";
    } else if(id==="13579"){
      const total=odds.reduce((s,e)=>s+e.c,0);
      const threes=numCounts[3]||0,fives=numCounts[5]||0;
      anchor=`${total} odd tiles, ${threes>0?`${threes}× 3`:""}${fives>0?`, ${fives}× 5`:""}`;
      why=[threes>=2||fives>=2?`${threes}× 3 and ${fives}× 5, these appear in 9 of 10 hands. Core anchors.`:"Prioritize drawing 3s and 5s, they appear in 9 of 10 hands.",odds.filter(e=>e.c>=2).length>0?`Pairs in ${odds.filter(e=>e.c>=2).map(e=>e.n).join("/")}, protect these.`:"Build pairs in your odd numbers before the game starts.",winds.length>=2?`${winds.length} winds present, some 13579 hands use N/S winds.`:""];
      why=why.filter(Boolean);
      keep=["All 3s and 5s (top priority)","All other odds","All Flowers","All Jokers"];
      pivot="If odds stay thin, check if 369 works, 3s and 9s cross both sections.";
    } else if(id==="2026"){
      anchor=`${twos}× 2, ${sixes}× 6${soap>0?`, ${soap}× Soap`:""}`;
      why=[twos>=1&&sixes>=1?`${twos}× 2 and ${sixes}× 6, both appear in all 4 hands. Core anchors established.`:twos>=1?`You have ${twos}× 2 but need 6s, both are required in every hand.`:`You have ${sixes}× 6 but need 2s, both are required in every hand.`,soap>=1?`${soap} Soap, suit-wild, covers any 0 position. Very strong for this section.`:"Draw Soap (White Dragon), it's suit-flexible and appears in 3 of 4 hands.",dragons.length>1?`${dragons.length} dragons support the hand options further.`:""];
      why=why.filter(Boolean);
      keep=["All 2s","All 6s","Soap (White Dragon)","All Dragons","All Jokers"];
      pivot="If you can't find 6s in the first 3 draws, pivot to 2468, your 2s still contribute.";
    } else if(id==="wd"){
      const honorCount=winds.length+dragons.length;
      anchor=`${winds.length} Winds + ${dragons.length} Dragons (${honorCount} honors)`;
      const windGroups=pairsOf(t=>t.t==="w");
      why=[honorCount>=6?`${honorCount} honor tiles is a deep W&D rack, keep passing number tiles.`:`${honorCount} honors, W&D needs 7+. Pass all number tiles without hesitation.`,windGroups.length>0?`Pairs in ${windGroups.map(g=>g.key).join("/")} Wind, protect these.`:"Stack your most common wind for the best grouping.",dragons.length>=2?`${dragons.length} dragons add flexibility across the 5 hands that use them.`:""];
      why=why.filter(Boolean);
      keep=["All Winds","All Dragons","All Jokers"];
      pivot="If honor tiles stop coming, pivot to Any Like Numbers using any number groups you've kept.";
    } else if(id==="sp"){
      const prs=pairsOf(t=>t.t!=="j");
      anchor=`${prs.length} natural pair${prs.length!==1?"s":""} + ${flowers>=2?`${Math.floor(flowers/2)} flower pair${Math.floor(flowers/2)>1?"s":""}`:""}`;
      why=[prs.length>=4?`${prs.length} natural pairs, that's strong S&P territory. Protect every pair.`:prs.length>=2?`${prs.length} pairs so far, keep building. S&P needs 6-7 pairs to win.`:"Very few pairs, S&P needs 6-7. Consider whether another section fits better.",jokers>0?`${jokers} joker${jokers>1?"s":""} are dead weight in S&P, you can't pass them and they can't be pairs. Factor this in.`:"No jokers, that's perfect for S&P.",flowers>=2?`${flowers} flowers count as natural pairs here.`:""];
      why=why.filter(Boolean);
      keep=["All natural pairs (never break)","Flowers (count as pairs)"];
      pivot=jokers>0?`With ${jokers} joker${jokers>1?"s":""} stuck in your hand, consider switching, jokers cannot form pairs and cannot be passed.`:"If you can't get to 6 pairs by mid-game, pivot to any section where jokers help.";
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
  // If a specific hand was chosen, score direction using honest suit-specific coverage ,
  // the same calculation shown in the HandTargetPreview display. This prevents fit()
  // from inflating direction scores by picking best-case suit permutations.
  if(chosenHandObj){
    const{held,total,pct}=computeHonestCoverage(finalRack,chosenHandObj);
    const directionScore=Math.round((pct/100)*40);
    const scored=`Scored against ${chosenHandObj.label}: ${held} of ${total} tiles covered (${pct}%).`;
    const directionExplanation=
      pct>=85?`${scored} Your rack is almost complete for this hand.`:
      pct>=65?`${scored} Solid foundation, a few key tiles still needed.`:
      pct>=45?`${scored} Partial match. More tiles needed to commit to this hand.`:
      pct>=25?`${scored} Low coverage. This hand needed a different tile distribution.`:
      `${scored} Very low coverage. The tiles held don't support this hand well.`;
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
    const suitNames={bam:"Bam",crak:"Crk",dot:"Dot"};const suitStr=ws.suit?` (${suitNames[ws.suit]||ws.suit})`:"";const wStr=ws.windowNums&&ws.windowNums.length?` within [${ws.windowNums[0]}-${ws.windowNums[ws.windowNums.length-1]}]${suitStr}`:"";
    directionExplanation=gd>=12?`Strong group depth${wStr}, pungs and kongs locked in a tight window.`:gd>=7?`Decent group depth${wStr}. Keep consolidating within your number window.`:gd>=4?`Some grouped tiles${wStr}, but you need pungs/kongs, singles don't win CR hands.`:`Shallow structure. CR rewards pungs & kongs of 3-4 consecutive numbers, not long single runs.`;

  } else if(sectionId==="wd"){
    // Winds in 7/8 hands, Dragons in 5/8. Numbers 1-4 are valid as kongs (3 hands). 5-9 never valid.
    // NORMALIZATION: W&D develops later than number sections, early honor counts of 6-8 are
    // strategically strong even though raw tile totals look lower than consecutive sections.
    // The curve is calibrated so that 7+ honors (a genuinely committed W&D rack) scores 28+,
    // matching what 7-8 odds would score in 13579 at equivalent commitment depth.
    const winds=finalRack.filter(t=>t.t==="w").length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    const honors=winds+dragons;
    const validNums=finalRack.filter(t=>t.t==="s"&&[1,2,3,4].includes(t.n)).length;
    const badNums=finalRack.filter(t=>t.t==="s"&&![1,2,3,4].includes(t.n)).length;
    // Wind group quality, grouped winds are far more valuable than singles
    const wc={};finalRack.filter(t=>t.t==="w").forEach(t=>{wc[t.v]=(wc[t.v]||0)+1;});
    const windGroupBonus=Object.values(wc).reduce((a,n)=>a+(n>=4?5:n>=3?3:n>=2?1:0),0);
    // Raised wind score curve, winds are the backbone (7 of 8 hands)
    const windScore=winds>=7?20:winds>=6?17:winds>=5?14:winds>=4?11:winds>=3?7:winds>=2?4:winds*1;
    // Dragon score, dragons appear in 5/8 hands, meaningful structural support
    const dragonScore=dragons>=5?10:dragons>=4?8:dragons>=3?6:dragons>=2?3:dragons*1;
    const numKongBonus=validNums>=4?5:validNums>=2?2:0;
    // Joker support, W&D hands use jokers for honor kongs
    const jkBonus=jk>=2?3:jk>=1?1:0;
    const flBonus=fl>=2?2:fl>=1?1:0;
    // Normalized: 7 honors (committed W&D rack) now reliably scores 28-32 before penalties
    directionScore=Math.min(40,Math.max(2,windScore+dragonScore+windGroupBonus+numKongBonus+jkBonus+flBonus-(badNums*4)));
    directionExplanation=honors>=10?`${winds} Winds + ${dragons} Dragons, a deep honor rack. W&D is your lane.`:honors>=8?`${honors} honor tiles is a committed W&D foundation. Keep passing number tiles.`:honors>=6?`${honors} honors, solid start. W&D needs 7+ to fully commit; keep drawing winds.`:honors>=4?`${honors} honors is a start, but W&D needs 7+. Pass all 5-9 tiles aggressively.`:`Only ${honors} honor tiles. Pass all number tiles and wait for winds.`;

  } else if(sectionId==="aln"){
    // ALN: all 3 hands are kongs of one number + flowers/dragons. Concentration is everything.
    // NORMALIZATION: ALN requires patience, 3-4 of a number early IS strong commitment for this
    // section, even though it looks thin compared to 7-8 odd tiles in 13579. The curve is
    // calibrated so that 4+ of one number scores 22+ (matching 13579 at 7 odds) and 3 of a number
    // scores 14+ (matching 13579 at 5 odds), reflecting the tighter tile-frequency expectations.
    const nc={};finalRack.filter(t=>t.t==="s").forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
    const vals=Object.values(nc),mx=vals.length?Math.max(...vals):0,spread=Object.keys(nc).length;
    // Flowers act as tile-fillers in hand 1 (1111 FFFFFF 1111), count them as supporting
    const flBonus=fl>=4?6:fl>=2?3:fl>=1?1:0;
    const jkBonus=jk>=2?4:jk>=1?2:0;
    // Raised curve: 4 of a number is genuinely committed for ALN (only 4 copies of each tile exist)
    const baseScore=mx>=7?38:mx>=6?32:mx>=5?26:mx>=4?20:mx>=3?13:mx>=2?6:mx*2;
    const spreadPenalty=Math.max(0,spread-1)*4; // spreading across numbers is fatal, slightly softened
    directionScore=Math.min(40,Math.max(2,baseScore+flBonus+jkBonus-spreadPenalty));
    directionExplanation=mx>=6?`${mx} of one number, excellent consolidation. That's ALN territory.`:mx>=4?`${mx} of a number is a strong nucleus for ALN, only 4 natural copies exist. Pass everything else ruthlessly.`:mx>=3?`${mx} of a number, committed start. ALN needs 8-12 total (with jokers) of one number.`:`Only ${mx} of any single number. Pick one number immediately and consolidate hard.`;

  } else if(sectionId==="sp"){
    // S&P: all 6 hands are singles and pairs. Count flowers correctly (each flower = 1 tile, pairs if 2+).
    // iqCountGroups maps all flowers to key "f", so 2 flowers = count 2 = 1 pair. That's correct.
    const grps=iqCountGroups(finalRack);
    const allVals=Object.values(grps);
    const pairs=allVals.filter(v=>v===2).length;
    const triples=allVals.filter(v=>v>=3).length;
    const jkCount=finalRack.filter(t=>t.t==="j").length;
    // Jokers count as triples structurally, they can't be singles or pairs, so they break the pattern
    directionScore=pairs>=6&&triples===0&&jkCount===0?40:pairs>=5&&triples===0?34:pairs>=4&&triples===0?26:pairs>=3&&triples<=1?18:pairs>=2?10:pairs*4;
    directionExplanation=pairs>=6&&jkCount===0?`${pairs} pairs, no triples, no jokers, textbook S&P structure.`:pairs>=4?`${pairs} pairs is strong. Avoid any triples and get rid of those jokers.`:pairs>=2?`${pairs} pairs is a start. You need 6+ pairs to win, build more.`:`Only ${pairs} pairs. Singles & Pairs needs 6 clean pairs to complete.`;

  } else if(sectionId==="q"){
    // Quints: 5 of one tile. Max natural is 4 (one of each suit), always needs 1+ joker per quint.
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
    directionExplanation=jk>=2&&mx>=3?`${jk} jokers and ${mx} of a tile, well positioned for a quint.`:jk>=2?`${jk} jokers is the entry requirement, now build tile depth (need 3-4 of one tile).`:jk>=1?`Only ${jk} joker. Quints needs at least 2, this section is risky without more.`:"No jokers. Quints is unreachable without at least 2 jokers.";

  } else if(sectionId==="2026"){
    // 2026: count 2s, 6s, Soap, and dragons, this section's "strong tiles" span tile types.
    // Treat Soap + any Dragon as supporting since they appear in 3/4 hands.
    const twos=finalRack.filter(t=>t.t==="s"&&t.n===2).length;
    const sixes=finalRack.filter(t=>t.t==="s"&&t.n===6).length;
    const soap=finalRack.filter(t=>t.t==="d"&&t.v==="Soap").length;
    const otherDragons=finalRack.filter(t=>t.t==="d"&&t.v!=="Soap").length;
    const winds=finalRack.filter(t=>t.t==="w").length;
    const offNums=finalRack.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length;
    // 6 is in all 4 hands, 2 is in all 4 hands, both required
    const sixScore=sixes>=3?16:sixes>=2?12:sixes>=1?6:0;
    const twoScore=twos>=3?12:twos>=2?8:twos>=1?4:0;
    const soapBonus=soap>=1?5:0;
    const dragonBonus=otherDragons>=2?3:otherDragons>=1?1:0;
    const windBonus=winds>=3?3:winds>=2?1:0; // NEWS hand needs all 4 winds
    const flBonus=fl>=1?2:0;
    const offPenalty=Math.min(offNums*4,20);
    directionScore=Math.min(40,Math.max(2,sixScore+twoScore+soapBonus+dragonBonus+windBonus+flBonus-offPenalty));
    const coreStr=sixes>0&&twos>0?`${twos} Twos + ${sixes} Sixes, the 2026 core is there.`:sixes>0?`${sixes} Sixes but missing 2s, you need both for every 2026 hand.`:`${twos} Twos but missing 6s, 6 appears in all 4 hands, it's critical.`;
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
    directionExplanation=totalEvens>=8?`${totalEvens} even tiles across ${distinctEvens} values, strong 2468 rack.`:totalEvens>=5?`${totalEvens} even tiles. Focus on deepening groups, not spreading across more values.`:totalEvens>=3?`${totalEvens} even tiles, viable but needs more depth. Pass odds aggressively.`:`Only ${totalEvens} even tiles. Pass all odd tiles immediately.`;

  } else if(sectionId==="369"){
    // 369: 3, 6, 9 only. 6 in 100% of hands, most critical tile on the entire card for this section.
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
    directionExplanation=sixes===0?`No 6s, 6 appears in every 369 hand. This section needs 6s urgently.`:total>=8?`${total} tiles across 3/6/9, strong structure.`:total>=5?`${total} tiles of 3/6/9. Keep building and pass non-multiples of 3 first.`:`Only ${total} tiles of 3/6/9, pass all other numbers immediately.`;

  } else if(sectionId==="13579"){
    // 13579: 10 hands, 5 and 3 in 9/10, N+S winds in 2 hands, flowers in 4/10, dragons in 4/10.
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
    directionExplanation=totalOdds>=8?`${totalOdds} odd tiles, a committed 13579 rack.`:totalOdds>=5?`${totalOdds} odd tiles. Focus on 5s and 3s, they appear in every hand.`:totalOdds>=3?`${totalOdds} odds, pass all even tiles immediately.`:`Only ${totalOdds} odd tiles. 13579 needs 8+ odds to be competitive.`;
  }

  return{directionScore:Math.max(0,Math.min(40,Math.round(directionScore))),directionExplanation};
}

function iqTileStrength(finalRack,sectionId,chosenHandObj){
  // If a specific hand was chosen, use honest coverage (same as display) not fit().
  if(chosenHandObj){
    const{pct}=computeHonestCoverage(finalRack,chosenHandObj);
    const raw=pct>=90?25:pct>=80?22:pct>=70?18:pct>=60?14:pct>=50?11:pct>=40?8:pct>=25?5:Math.round((pct/100)*20);
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
    // S&P, CONCEALED, NO JOKERS. Pairs only (no pungs/kongs). Flowers count as pairs.
    // 6 hands: need 6 pairs + 1 single OR 7 pairs (depending on hand).
    // Flowers: iqCountGroups maps all flowers to "f", so 2 flowers = pair. Correct.
    const jkCount=finalRack.filter(t=>t.t==="j").length;
    raw+=pairs>=7?25:pairs>=6?22:pairs>=5?17:pairs>=4?12:pairs>=3?7:pairs>=2?4:pairs*1;
    raw-=(pungs+kongs)*8; // pungs/kongs structurally break S&P
    raw-=jkCount*8;       // jokers cannot be singles or pairs, poison
    raw=Math.max(0,raw);

  } else if(sectionId==="cr"){
    // CR, window depth is the primary signal
    const ws=crWindowScore(finalRack);
    const gd=ws.groupDepth||0;
    const dp=ws.distinctPresent||0;
    raw+=gd>=12?22:gd>=9?17:gd>=7?13:gd>=5?9:gd>=3?5:gd*1;
    raw+=dp>=4?3:dp>=3?1:0;
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=4?5:fl>=2?3:fl>=1?1:0; // sextette hand
    raw-=finalRack.filter(t=>t.t==="w").length*2;

  } else if(sectionId==="wd"){
    // W/D, winds and dragons. Number kongs of 1-4 are valid (3 hands). 5-9 never valid.
    // NORMALIZATION: Honor groups are harder to build than number groups (only 4 of each wind exist).
    // A wind pung scores equivalently to an even-number pung in 2468. A kong is proportionally rewarded.
    // Calibrated so 2 wind pungs + 1 dragon pair = 18-20 (matching 2468 at equivalent group depth).
    const wds_winds=finalRack.filter(t=>t.t==="w").length;
    const wds_dragons=finalRack.filter(t=>t.t==="d").length;
    const honors=wds_winds+wds_dragons;
    const validNums=finalRack.filter(t=>t.t==="s"&&[1,2,3,4].includes(t.n)).length;
    const badNums=finalRack.filter(t=>t.t==="s"&&![1,2,3,4].includes(t.n)).length;
    // Wind groups: raised curves, winds are backbone of 7/8 hands
    const wc={};finalRack.filter(t=>t.t==="w").forEach(t=>{wc[t.v]=(wc[t.v]||0)+1;});
    const dc={};finalRack.filter(t=>t.t==="d").forEach(t=>{dc[t.v]=(dc[t.v]||0)+1;});
    const windGroupScore=Object.values(wc).reduce((a,n)=>a+(n>=4?9:n>=3?7:n>=2?4:1),0);
    const dragonGroupScore=Object.values(dc).reduce((a,n)=>a+(n>=4?7:n>=3?5:n>=2?3:0),0);
    raw+=windGroupScore+dragonGroupScore;
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=fl>=2?2:fl>=1?1:0;
    raw+=validNums>=4?4:validNums>=2?2:0; // valid number kong bonus
    raw-=badNums*3;
    // Honor density floor, a clean honor rack should never be unfairly penalized
    if(honors>=8&&badNums===0)raw=Math.max(raw,14);
    else if(honors>=6&&badNums<=1)raw=Math.max(raw,10);

  } else if(sectionId==="aln"){
    // ALN, all 3 hands use kongs of ONE number. Flowers fill one hand (sextette).
    // Need 8-12 tiles of the same number (with joker help). Spreading = fatal.
    // NORMALIZATION: Only 4 natural copies of any number exist. Having 4 of one number is
    // maximum natural depth, equivalent to having a full pung/kong in other sections.
    // Calibrated so 4-of-a-number scores 14+ (matching 13579 at 7 total odds).
    const nc={};finalRack.filter(t=>t.t==="s").forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
    const vals2=Object.values(nc);
    const mx=vals2.length?Math.max(...vals2):0;
    const spread=Object.keys(nc).length;
    // Raised curve: 4 of a number = near-maximal natural concentration for ALN
    raw+=mx>=8?24:mx>=6?19:mx>=5?15:mx>=4?11:mx>=3?7:mx>=2?3:mx*1;
    raw+=fl>=4?6:fl>=2?3:fl>=1?1:0; // flowers fill the sextette hand
    raw+=jk>=2?4:jk>=1?2:0;
    raw+=finalRack.filter(t=>t.t==="d").length>=1?1:0; // dragons appear in 2/3 hands
    raw-=Math.max(0,spread-1)*4; // spreading is fatal; slightly softened from 5 to reflect realistic early racks

  } else if(sectionId==="q"){
    // Quints, 3 hands. 2 jokers minimum. Stack one tile type deep.
    // Hand 3 (11111 44444 DDDD) uses a dragon kong, dragons have minor value.
    const c={};finalRack.filter(t=>t.t==="s").forEach(t=>{const k=`${t.s}|${t.n}`;c[k]=(c[k]||0)+1;});
    const mx=Object.values(c).length?Math.max(...Object.values(c)):0;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    if(jk<2){raw=jk*3;}  // hard floor, quints without 2 jokers is nearly impossible
    else{
      raw+=jk>=3?14:12;  // 2 jokers = entry, 3 = great
      raw+=mx>=4?10:mx>=3?7:mx>=2?4:0;
      raw+=dragons>=3?2:0; // dragon kong in hand 3
      raw+=fl>=2?2:0;      // FF in hand 2
    }

  } else if(sectionId==="2026"){
    // 2026, 4 hands. Count 2s, 6s, Soap, other dragons, winds (NEWS hand), flowers.
    const twos=finalRack.filter(t=>t.t==="s"&&t.n===2).length;
    const sixes=finalRack.filter(t=>t.t==="s"&&t.n===6).length;
    const soap=finalRack.filter(t=>t.t==="d"&&t.v==="Soap").length;
    const otherD=finalRack.filter(t=>t.t==="d"&&t.v!=="Soap").length;
    const winds=finalRack.filter(t=>t.t==="w").length;
    const offNums=finalRack.filter(t=>t.t==="s"&&![2,6].includes(t.n)).length;
    // Group quality for 2s and 6s, kongs and pungs are used in all hands
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
    // 2468, 8 hands. 6 in 7/8, 2+8 in 7/8, 4 in 6/8. Flowers in 5/8. Dragons in 4/8.
    // E+W winds in 1 hand only. Last hand (FF 246 888 246 888) is concealed, pairs.
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
    // 369, 6 hands. 6 in all 6. 3+9 in 5/6. Flowers in 3/6. Dragons in 2/6.
    // Last hand concealed. NEWS hand needs all 4 winds.
    const threes=finalRack.filter(t=>t.t==="s"&&t.n===3).length;
    const sixes=finalRack.filter(t=>t.t==="s"&&t.n===6).length;
    const nines=finalRack.filter(t=>t.t==="s"&&t.n===9).length;
    const offNums=finalRack.filter(t=>t.t==="s"&&![3,6,9].includes(t.n)).length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    const winds=finalRack.filter(t=>t.t==="w").length;
    // Group quality, kongs and pungs of 3/6/9
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
    // 13579, 9 hands. 5+3 in 9/9. N+S winds in 2/10. Flowers in 4/10. Dragons in 4/10.
    // 1, 7, 9 each appear in ~4/10 hands. E+W winds never used.
    const oc={};finalRack.filter(t=>t.t==="s"&&t.n%2===1).forEach(t=>{oc[t.n]=(oc[t.n]||0)+1;});
    const totalOdds=Object.values(oc).reduce((a,b)=>a+b,0);
    const distinctOdds=Object.keys(oc).length;
    const evens=finalRack.filter(t=>t.t==="s"&&t.n%2===0).length;
    const ns=finalRack.filter(t=>t.t==="w"&&(t.v==="N"||t.v==="S")).length;
    const ew=finalRack.filter(t=>t.t==="w"&&(t.v==="E"||t.v==="W")).length;
    const dragons=finalRack.filter(t=>t.t==="d").length;
    // Group depth in odd tiles, weight 5 and 3 higher (appear in 9/10 hands)
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

  // FIX 1: AVAILABILITY-AWARE, measure weak clearance rate
  const totalWeakInStart=startingRack.filter(t=>isWeakTile(t)).length;
  const allPassed=passedTilesByRound.flatMap(p=>p.out||[]);
  const totalWeakPassed=allPassed.filter(t=>isWeakTile(t)).length;
  const weakClearRate=totalWeakInStart>0?totalWeakPassed/totalWeakInStart:1;

  // FIX 2: BLIND PASS LENIENCY, halve the strong-tile penalty on blind passes
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
    // Blind pass: strong-tile penalty halved, less information available
    const strongPenalty=isBlind?2:4;
    let roundScore=10+(weakPassed*3)-(strongPassed*strongPenalty)+(neutralPassed*1);
    roundScore=Math.max(0,Math.min(15,roundScore));
    totalRoundScore+=roundScore;

    let quality="neutral",insight="";
    if(strongPassed>0&&weakPassed===0){
      quality="weak";
      insight=isBlind
        ?`Passed ${strongPassed} useful tile${strongPassed>1?"s":""}, a tough spot on a blind pass.`
        :`Passed ${strongPassed} tile${strongPassed>1?"s":""} your section wanted to keep.`;
    } else if(weakPassed>0&&strongPassed===0){
      quality="strong";
      insight=`Passed ${weakPassed} off-direction tile${weakPassed>1?"s":""}, clean${isBlind?" blind":""} round.`;
    } else if(strongPassed>0&&weakPassed>0){
      quality="mixed";
      insight=isBlind?"Mixed blind pass, gave away a useful tile but cleared some weak ones too.":"Mixed round, passed some useful tiles alongside the weaker ones.";
    } else{
      quality="neutral";
      insight=`Neutral${isBlind?" blind":""} pass, tiles were neither clearly strong nor weak for your section.`;
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
  raw-=brokenPairsTotal*2;
  raw=Math.max(0,Math.min(25,raw));

  // OUTCOME VALIDATION FLOOR, if direction and tile strength are both high,
  // the final rack proves the passes were correct regardless of what was passed.
  // A player who ends with 90%+ direction and tile strength made good decisions.
  // We don't penalise process when the outcome is objectively strong.
  // This is injected here using the raw scores from the calling context via closure, 
  // but since we don't have them here, we apply the floor post-hoc in calculateCharlestonIQ.

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
  // Sweet spot: 10-25s per pass. Below 6s = reflexive. Above 35s = second-guessing.
  const slowPasses_=passTimes.filter(s=>s>35).length;
  const fastPasses_=passTimes.filter(s=>s<6).length;
  if(avg>=10&&avg<=25){
    timingScore=10;
    if(hasMixedBag){
      timingInsight=`Good overall pace (avg ${Math.round(avg)}s). ${slowPasses_} pass${slowPasses_>1?"es were":"was"} slow, trust your first read on those.`;
    } else {
      timingInsight=`Excellent pace, avg ${Math.round(avg)}s per pass. Deliberate without second-guessing. Right in the zone.`;
    }
  } else if(avg>25&&avg<=35){
    timingScore=8;
    if(slowPasses_>=2){
      timingInsight=`${slowPasses_} passes took over 35s, once you see a clear discard, commit to it.`;
    } else {
      timingInsight=`A touch deliberate (avg ${Math.round(avg)}s), but not by much. Try committing to your section read by pass 1.`;
    }
  } else if(avg>35&&avg<=50){
    timingScore=6;
    timingInsight=slowPasses_>=2
      ?`${slowPasses_} passes took a long time. Name your target section before touching any tiles, it speeds up every decision after that.`
      :"Taking longer than ideal. Lock in your section before the first pass and the rest follows faster.";
  } else if(avg>50){
    timingScore=Math.max(2,Math.round(4-((avg-50)/25)));
    timingInsight="Very long pauses between passes. Commit to a section before you start, once you know what you're building, the right tiles become obvious.";
  } else if(avg>=6&&avg<10){
    timingScore=8;
    timingInsight=`Slightly quick (avg ${Math.round(avg)}s), a few more seconds per pass lets you catch a better option before committing.`;
  } else if(avg>=3&&avg<6){
    timingScore=5;
    timingInsight=fastPasses_>=2
      ?`${fastPasses_} passes went very fast. Each one shapes your whole hand, give yourself at least 10 seconds.`
      :"Moving a bit fast. Give yourself a breath before each pass, your instincts are good, but a moment to confirm helps.";
  } else {
    timingScore=2;
    timingInsight="Passing reflexively, slow down and read the rack before each discard. Speed doesn't score points here.";
  }

  return{timingScore:Math.max(2,Math.min(10,timingScore)),timingInsight};
}

const IQ_TIERS=[
  {
    min:95,max:100,range:"95-100",level:"Mahjong Master",color:C.jade,bg:C.jade+"12",
    notes:[
      "You saw everything. Clean reads and total control.",
      "Elite Charleston. You dictated the rack from start to finish.",
      "Nothing got past you, perfect instincts today."
    ]
  },
  {
    min:90,max:94,range:"90-94",level:"Table Controller",color:C.jade,bg:C.jade+"10",
    notes:[
      "You controlled the flow of the Charleston.",
      "Strong reads with confident direction throughout.",
      "You stayed ahead of the rack all game."
    ]
  },
  {
    min:85,max:89,range:"85-89",level:"Sharp Player",color:C.jade,bg:C.jade+"08",
    notes:[
      "Strong reads with confident passing.",
      "Clean Charleston with one small edge to unlock.",
      "You kept strong options alive throughout."
    ]
  },
  {
    min:80,max:84,range:"80-84",level:"Confident Reader",color:C.jade,bg:C.jade+"06",
    notes:[
      "You played with confidence and direction.",
      "Good instincts, now tighten a few passes.",
      "You saw the board clearly most of the way."
    ]
  },
  {
    min:75,max:79,range:"75-79",level:"Table Ready",color:"#2460A8",bg:"#2460A810",
    notes:[
      "You’re ready for the table, just refine execution.",
      "Good instincts with room to sharpen.",
      "Solid direction throughout the Charleston."
    ]
  },
  {
    min:70,max:74,range:"70-74",level:"Steady Player",color:"#2460A8",bg:"#2460A808",
    notes:[
      "You stayed steady with improving reads.",
      "A few cleaner decisions unlock more.",
      "You’re building strong habits."
    ]
  },
  {
    min:65,max:69,range:"65-69",level:"Finding Your Flow",color:C.gold,bg:C.gold+"10",
    notes:[
      "Your instincts are forming, trust them earlier.",
      "You had strong ideas, commit with more confidence.",
      "You’re starting to see the shape."
    ]
  },
  {
    min:60,max:64,range:"60-64",level:"Building Rhythm",color:C.gold,bg:C.gold+"08",
    notes:[
      "You’re finding rhythm, stay flexible a bit longer.",
      "The reads are coming together.",
      "You’re close to cleaner passing."
    ]
  },
  {
    min:55,max:59,range:"55-59",level:"Reading the Rack",color:C.gold,bg:C.gold+"06",
    notes:[
      "You’re starting to read the rack better.",
      "Try narrowing your direction earlier.",
      "The instincts are building."
    ]
  },
  {
    min:50,max:54,range:"50-54",level:"Warming Up",color:C.cinn,bg:C.cinn+"10",
    notes:[
      "You’re getting into the flow of the Charleston.",
      "Focus on simplifying early decisions.",
      "You’re building your base."
    ]
  },
  {
    min:0,max:49,range:"<50",level:"Feeling the Rack",color:C.cinn,bg:C.cinn+"08",
    notes:[
      "Start by picking a direction early.",
      "Let the rack guide your decisions.",
      "Try not to hold every option."
    ]
  }
];

const IQ_STYLES=[
  {
    key:"aggressive",name:"Aggressive ⚡",
    notes:[
      "You chased upside and committed early.",
      "Bold passing with high reward potential.",
      "You pushed the rack forward aggressively."
    ]
  },
  {
    key:"flexible",name:"Flexible ♻️",
    notes:[
      "You kept multiple paths alive.",
      "Strong optionality throughout.",
      "You adapted well to the rack."
    ]
  },
  {
    key:"disciplined",name:"Disciplined 🎯",
    notes:[
      "You stayed focused on your direction.",
      "Clean, controlled decision-making.",
      "You avoided unnecessary pivots."
    ]
  },
  {
    key:"adaptive",name:"Adaptive 🔄",
    notes:[
      "You adjusted your plan as the rack evolved.",
      "Strong mid-Charleston pivots.",
      "You responded well to new information."
    ]
  },
  {
    key:"defensive",name:"Defensive 🛡️",
    notes:[
      "You protected your options carefully.",
      "You avoided risky commitments.",
      "You played a safe, controlled Charleston."
    ]
  },
  {
    key:"fastReader",name:"Fast Reader ⚡",
    notes:[
      "You saw direction early and acted quickly.",
      "Quick decisions with strong instincts.",
      "You didn’t hesitate."
    ]
  },
  {
    key:"latePivot",name:"Late Pivot 🔁",
    notes:[
      "You changed direction late in the Charleston.",
      "Strong recovery after early uncertainty.",
      "You found your line late."
    ]
  },
  {
    key:"chaos",name:"Chaos Charleston 🎲",
    notes:[
      "You explored multiple directions throughout.",
      "Unpredictable but creative play.",
      "You kept the rack wide open."
    ]
  },
  {
    key:"smoothPasser",name:"Smooth Passer 🌊",
    notes:[
      "Your passing felt clean and natural.",
      "You moved through decisions fluidly.",
      "Strong rhythm throughout the Charleston."
    ]
  }
];

function pickNote(notes,seed=0){
  if(!notes||!notes.length)return"";
  return notes[Math.abs(Math.round(seed))%notes.length];
}

function getIQTier(score){
  const safeScore=Math.max(0,Math.min(100,Math.round(score||0)));
  return IQ_TIERS.find(t=>safeScore>=t.min&&safeScore<=t.max)||IQ_TIERS[IQ_TIERS.length-1];
}

function getIQStyle(score,directionScore,tileStrengthScore,passQualityScore,timingScore){
  const dr=directionScore/40,tr=tileStrengthScore/25,pr=passQualityScore/25,tmr=timingScore/10;
  const find=k=>IQ_STYLES.find(s=>s.key===k)||IQ_STYLES.find(s=>s.key==="adaptive");

  // Style = how the player played, not whether they played well.
  // Keep this light, social, and identity-driven.
  let style;
  if(dr>=0.82&&tr>=0.62&&pr<0.78)style=find("aggressive");
  else if(pr>=0.86&&dr>=0.72)style=find("disciplined");
  else if(tmr>=0.85&&dr>=0.72)style=find("fastReader");
  else if(pr>=0.82)style=find("smoothPasser");
  else if(dr>=0.55&&dr<0.78&&tr>=0.68)style=find("flexible");
  else if(dr<0.55&&tr>=0.62)style=find("latePivot");
  else if(dr<0.50&&pr>=0.62)style=find("defensive");
  else if(dr<0.48&&pr<0.55)style=find("chaos");
  else style=find("adaptive");

  return{...style,note:pickNote(style.notes,score+directionScore+passQualityScore)};
}

function withIQStyle(iq){
  if(!iq)return iq;
  if(iq.styleName&&iq.styleNote)return iq;
  const style=getIQStyle(
    iq.totalScore||0,
    iq.directionScore||0,
    iq.tileStrengthScore||0,
    iq.passQualityScore||0,
    iq.timingScore||0
  );
  return{...iq,style,styleName:style?.name,styleNote:style?.note};
}

function iqScoreLevel(score,directionScore,tileStrengthScore,passQualityScore,timingScore){
  const tier=getIQTier(score);
  const level=tier.level;
  const levelExplanation=pickNote(tier.notes,score+directionScore+tileStrengthScore+passQualityScore+timingScore);
  return{level,levelExplanation,tier};
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

  // Key mistake round, which pass gave away the most useful tiles
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

  // Depth gap for CR, window depth based
  let runGap=0;
  if(sectionId==="cr"){const ws=crWindowScore(finalRack);runGap=Math.max(0,Math.round(7-(ws.groupDepth||0)));}

  const distanceCount=Math.min(missingStrongTiles.length,3)+Math.min(offDirectionTiles.length,2)+runGap+brokenPairs.length;

  let explanation="Your final rack was well-optimised for your target direction.";
  if(runGap>4)explanation="Your number tiles didn't consolidate into groups, CR needs pungs and kongs within a 3-4 number window, not singles.";
  else if(runGap>0)explanation="You had the right number window but needed deeper groups, aim for pungs/kongs rather than singles.";
  else if(brokenPairs.length>0)explanation=`You broke ${brokenPairs.length} pair${brokenPairs.length>1?"s":""} (${brokenPairs.join(", ")}) during the Charleston.`;
  else if(missingStrongTiles.length>0)explanation=`Your rack was missing ${missingStrongTiles.slice(0,2).join(" and ")}, key tiles for this section.`;
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
  if(directionScore>=35)strengths.push("Clean early read. You knew where the rack wanted to go.");
  if(tileStrengthScore>=20)strengths.push("Strong final shape. Your tiles connected well.");
  if(passQualityScore>=20)strengths.push("Clean passing through the Charleston.");
  if(timingScore>=9)strengths.push("Good pace. You trusted the rack without rushing.");

  if(directionScore<20)weaknesses.push("Your rack stayed a little too wide.");
  if(tileStrengthScore<=10)weaknesses.push("Your final rack needed more connected tiles.");
  if(passQualityScore<=12)weaknesses.push("A few risky passes gave away useful tiles.");
  // Section-specific pair feedback, in S&P, breaking triples into pairs is good
  if(brokenPairsCount>0&&sectionId!=="sp"){
    weaknesses.push(`Broke ${brokenPairsCount} pair${brokenPairsCount>1?"s":""} during the Charleston, protect your pairs.`);
  }
  if(timingScore<=5)weaknesses.push("Your pace got uneven. Take a breath, read the rack, then pass.");

  const uniqueStr=[...new Set(strengths)].slice(0,2);
  const uniqueWk=[...new Set(weaknesses)].slice(0,2);

  let coachNote="";
  let tryNextTime="";

  // Section-specific coach notes
  if(sectionId==="sp"){
    if(directionScore<20&&passQualityScore<=12)coachNote="S&P is fully concealed, you can't expose tiles. Focus on building pairs and getting rid of jokers and triples early.";
    else if(passQualityScore<=12)coachNote="You were playing S&P, but passed tiles that would have been good pairs. For S&P: hold pairs, pass jokers, pass triples.";
    else if(directionScore<20)coachNote="Your rack had too many singles. S&P needs 6+ clean pairs to win, consolidate toward fewer, deeper pairs.";
    else coachNote="S&P is a discipline game. Keep holding pairs, keep releasing jokers, and you'll complete it.";
  } else if(sectionId==="q"){
    if(directionScore<20)coachNote="Quints without 2 jokers is nearly impossible. Identify joker count in deal, if you have fewer than 2, pivot immediately.";
    else coachNote="With 2 jokers, focus entirely on stacking 3-4 of one specific tile. Spread is your enemy in Quints.";
  } else if(sectionId==="cr"){
    if(directionScore<20)coachNote="Consecutive Run isn't about long strings of singles, it's pungs and kongs within a 3-4 number window. Identify your window by pass 1.";
    else if(tileStrengthScore<=10)coachNote="You had the right window, but not enough group depth. Pass tiles outside the window ruthlessly to deepen groups within it.";
    else coachNote="Good CR instincts. Next level: pick the tightest window possible (3-wide > 5-wide) for more hand options.";
  } else if(sectionId==="wd"){
    if(directionScore<20)coachNote="W&D needs 7+ honor tiles. Pass all number tiles in round 1 unless you have a complete kong of 1-4.";
    else coachNote="Winds are your backbone, 7 of 8 hands use them. Stack same-wind groups before dragons.";
  } else if(sectionId==="2026"){
    if(directionScore<20)coachNote="2026 needs both 2s and 6s, they appear in all 4 hands. Soap (White Dragon) is wild-suit zero. These three tiles are your filter.";
    else coachNote="Strong 2026 read. Soap (White Dragon) makes it easier, it plays as any suit, so hold it whenever you're building this section.";
  } else if(directionScore<20&&passQualityScore<=12){
    coachNote="Your passing and direction both need attention. The key habit: identify your strongest group before your very first pass, then protect it ruthlessly.";
  } else if(passQualityScore<=12){
    coachNote="You were pointing in the right direction, but your passing decisions cost you. Focus on what leaves your hand, not just what stays.";
  } else if(directionScore<20){
    coachNote="Your passing was disciplined, but the rack didn't commit to a clear path. Try to name your section by the second pass and filter from there.";
  } else if(brokenPairsCount>0){
    coachNote="Watch your pairs. A pair broken early often can't be rebuilt, they're structural anchors for most hands.";
  } else {
    coachNote="Push higher by paying attention to your middle tiles, the ones that could serve two sections. Committing early to one path unlocks a sharper Charleston.";
  }

  // Section-specific tryNextTime tips
  const secTips={
    "2026":"Hold every 2, 6, and Soap you see. In round 1, pass all odd numbers except via a Soap or Dragon connection.",
    "2468":"Pass odds immediately in round 1. Your 6s are the anchor, never pass a 6 in any round.",
    "369":"6 is in every 369 hand, never pass it. Round 1: pass everything except 3s, 6s, 9s, jokers, and flowers.",
    "13579":"5 and 3 appear in every 13579 hand, prioritize them above all other odds. Pass all even tiles in round 1 without hesitation.",
    "cr":"Identify your 3-4 number window by your first pass. Then pass every tile outside that window, even if it hurts.",
    "wd":"Pass every number tile round 1 unless you have 4 of one number (1-4 only). Winds first, then dragons.",
    "aln":"Pick your number immediately. Pass everything else, every round, until you have 8+ of that one number.",
    "q":"Count jokers first. If you have 2+, pick your target tile and stack it. If fewer than 2, pivot to another section.",
    "sp":"Pass jokers immediately, they're worthless here. Hold every pair. Break no pairs to chase anything.",
  };
  const scores=[
    {name:"direction",ratio:directionScore/40,tip:secTips[sectionId]||"Before your first pass, identify the section your rack most favors. Everything else follows from that read."},
    {name:"tiles",ratio:tileStrengthScore/25,tip:"Before passing any tile, ask: does it support my main group, a pair, or a window? If no to all three, it goes."},
    {name:"passes",ratio:passQualityScore/25,tip:"Before each pass, check: does this tile connect to anything I'm keeping? Tiles that connect to nothing are the ones to pass."},
    {name:"timing",ratio:timingScore/10,tip:"Aim for 10-25 seconds per pass, the real-world average is about 17s. Enough to read the rack without second-guessing your first instinct."},
  ];
  const worst=scores.sort((a,b)=>a.ratio-b.ratio)[0];
  tryNextTime=worst.tip;

  return{strengths:uniqueStr,weaknesses:uniqueWk,coachNote,tryNextTime};
}



// ─── vNext EXPERT CHARLESTON ANALYSIS ENGINE ───────────────────────────────
// Human-first NMJL Charleston evaluator. This layer reads the whole rack,
// suits, grouping, overlap, and realistic section viability. It intentionally
// avoids raw hand-count inflation and treats the Charleston as directional,
// not final-hand certainty.
const RK_SEC_NAMES={
  "2026":"2026","2468":"Even Numbers","369":"369","13579":"Odd Numbers",
  "cr":"Consecutive Run","wd":"Winds & Dragons","aln":"Like Numbers","q":"Quints","sp":"Singles & Pairs"
};
const RK_SUIT_NAMES={bam:"Bam",crak:"Crak",dot:"Dot"};

function rkTileKey(t){
  if(!t)return"?";
  if(t.t==="s")return`${t.s}-${t.n}`;
  if(t.t==="w")return`W-${t.v}`;
  if(t.t==="d")return`D-${t.v}`;
  if(t.t==="f")return"Flower";
  if(t.t==="j")return"Joker";
  return`${t.t}-${t.v||t.n||""}`;
}
function rkTileLabelFromKey(k){
  if(!k)return"";
  if(k.startsWith("bam-"))return`${k.split("-")[1]} Bam`;
  if(k.startsWith("crak-"))return`${k.split("-")[1]} Crak`;
  if(k.startsWith("dot-"))return`${k.split("-")[1]} Dot`;
  if(k.startsWith("W-"))return`${k.slice(2)} Wind`;
  if(k.startsWith("D-"))return`${k.slice(2)} Dragon`;
  return k;
}
function rkClamp(n,min=0,max=100){return Math.max(min,Math.min(max,Math.round(n)));}
function rkPlural(n,s){return `${n} ${s}${n===1?"":"s"}`;}
function rkToneForScore(score){return score>=75?"High":score>=55?"Medium":score>=38?"Low":"Thin";}

function rkAnalyzeTileStructure(rack=[]){
  const nums=rack.filter(t=>t.t==="s");
  const winds=rack.filter(t=>t.t==="w");
  const dragons=rack.filter(t=>t.t==="d");
  const flowers=rack.filter(t=>t.t==="f").length;
  const jokers=rack.filter(t=>t.t==="j").length;
  const counts={};
  rack.forEach(t=>{const k=rkTileKey(t);counts[k]=(counts[k]||0)+1;});
  const groups=Object.entries(counts).map(([key,count])=>({key,count,label:rkTileLabelFromKey(key)}));
  const pairs=groups.filter(g=>g.count===2&&!g.key.startsWith("Joker"));
  const pungs=groups.filter(g=>g.count===3&&!g.key.startsWith("Joker"));
  const kongs=groups.filter(g=>g.count>=4&&!g.key.startsWith("Joker"));
  const duplicates=groups.filter(g=>g.count>=2&&!g.key.startsWith("Joker"));
  const suitCounts={bam:0,crak:0,dot:0};
  nums.forEach(t=>{suitCounts[t.s]=(suitCounts[t.s]||0)+1;});
  const suitEntries=Object.entries(suitCounts).sort((a,b)=>b[1]-a[1]);
  const strongestSuit=suitEntries[0]?.[0]||null;
  const weakestSuit=suitEntries[2]?.[0]||null;

  const bySuit={bam:[],crak:[],dot:[]};
  nums.forEach(t=>bySuit[t.s].push(t.n));
  const suitWindows=[];
  Object.entries(bySuit).forEach(([suit,arr])=>{
    const c={};arr.forEach(n=>{c[n]=(c[n]||0)+1;});
    const unique=[...new Set(arr)].sort((a,b)=>a-b);
    let bestRun=[];
    let cur=[];
    unique.forEach((n,i)=>{
      if(i===0||n===unique[i-1]+1)cur.push(n);
      else{if(cur.length>bestRun.length)bestRun=cur;cur=[n];}
    });
    if(cur.length>bestRun.length)bestRun=cur;
    let bestWindow=null;
    for(let start=1;start<=7;start++){
      const window=[start,start+1,start+2];
      const depth=window.reduce((a,n)=>a+(c[n]||0),0);
      const dup=window.reduce((a,n)=>a+((c[n]||0)>=2?1:0),0);
      const score=depth+dup*1.5;
      if(!bestWindow||score>bestWindow.score)bestWindow={suit,nums:window,depth,dup,score};
    }
    suitWindows.push({suit,counts:c,unique,bestRun,bestWindow});
  });
  const bestWindow=suitWindows.map(x=>x.bestWindow).filter(Boolean).sort((a,b)=>b.score-a.score)[0]||null;
  const connectedSequences=[];
  suitWindows.forEach(sw=>{
    if(sw.bestRun.length>=2)connectedSequences.push({suit:sw.suit,nums:sw.bestRun,depth:sw.bestRun.reduce((a,n)=>a+(sw.counts[n]||0),0)});
  });

  const sameNumberCounts={};
  nums.forEach(t=>{sameNumberCounts[t.n]=(sameNumberCounts[t.n]||0)+1;});
  const bestSameNumber=Object.entries(sameNumberCounts).sort((a,b)=>b[1]-a[1])[0]||null;

  const isolated=[];
  nums.forEach(t=>{
    const k=rkTileKey(t);
    if((counts[k]||0)>1)return;
    const hasNeighbor=nums.some(o=>o.s===t.s&&Math.abs(o.n-t.n)===1);
    const hasSameNum=nums.some(o=>o!==t&&o.n===t.n);
    if(!hasNeighbor&&!hasSameNum)isolated.push(t);
  });
  winds.concat(dragons).forEach(t=>{if((counts[rkTileKey(t)]||0)===1)isolated.push(t);});

  const honorTotal=winds.length+dragons.length;
  const groupedHonor=groups.filter(g=>(g.key.startsWith("W-")||g.key.startsWith("D-"))&&g.count>=2).length;
  const numberedTerminalSingles=nums.filter(t=>(t.n===1||t.n===9)&&(counts[rkTileKey(t)]||0)===1).length;

  const tileEfficiency=rkClamp(
    20+
    duplicates.length*7+pairs.length*5+pungs.length*10+kongs.length*14+
    connectedSequences.reduce((a,s)=>a+(s.nums.length>=4?13:s.nums.length>=3?9:s.nums.length>=2?4:0),0)+
    (bestWindow?Math.min(bestWindow.score*5,18):0)+
    jokers*4+flowers*2-
    isolated.length*5-numberedTerminalSingles*3-(honorTotal>=3&&groupedHonor===0?8:0)
  );
  const suitDiscipline=rkClamp(nums.length?(
    25+
    (suitEntries[0][1]/Math.max(nums.length,1))*45+
    (suitEntries[1][1]>=2?10:0)-
    (suitEntries[2][1]>=2?12:0)-
    isolated.length*2
  ):35);
  const growthPotential=rkClamp(
    18+
    pairs.length*8+pungs.length*7+kongs.length*5+
    connectedSequences.length*7+
    (bestWindow?bestWindow.depth*4:0)+
    jokers*7+flowers*3-
    isolated.length*4
  );

  return{
    nums,winds,dragons,flowers,jokers,counts,groups,pairs,pungs,kongs,duplicates,
    suitCounts,suitEntries,strongestSuit,weakestSuit,bestWindow,connectedSequences,
    sameNumberCounts,bestSameNumber,isolated,honorTotal,groupedHonor,
    tileEfficiency,suitDiscipline,growthPotential
  };
}

function rkSectionRawSignals(struct,secId){
  const nc=struct.sameNumberCounts||{};
  const odd=(nc[1]||0)+(nc[3]||0)+(nc[5]||0)+(nc[7]||0)+(nc[9]||0);
  const even=(nc[2]||0)+(nc[4]||0)+(nc[6]||0)+(nc[8]||0);
  const n369=(nc[3]||0)+(nc[6]||0)+(nc[9]||0);
  const soap=(struct.dragons||[]).filter(t=>t.v==="Soap").length;
  const twos=nc[2]||0,sixes=nc[6]||0;
  const bestSame=Number(struct.bestSameNumber?.[1]||0);
  const bestRunLen=(struct.connectedSequences||[]).reduce((m,s)=>Math.max(m,s.nums.length),0);
  const pairCount=struct.pairs.length;
  const maxDup=Math.max(0,...Object.values(struct.counts||{}));
  const hasConsecDepth=struct.bestWindow&&struct.bestWindow.depth>=4;
  const signals={
    "cr":bestRunLen*12+(hasConsecDepth?22:0)+struct.pairs.length*5+struct.pungs.length*8,
    "2468":even*8+(nc[6]||0)*7+struct.pairs.filter(p=>/[2468] /.test(p.label)).length*5,
    "369":n369*10+(nc[6]||0)*8+((nc[3]||0)>=2?5:0)+((nc[9]||0)>=2?5:0),
    "13579":odd*7+(nc[3]||0)*5+(nc[5]||0)*5+((nc[7]||0)>=2?4:0),
    "2026":twos*11+sixes*11+soap*12+((twos&&sixes)?10:0),
    "wd":struct.honorTotal*9+struct.groupedHonor*12-(struct.nums.length>=7?10:0),
    "aln":bestSame*18+(bestSame>=3?18:bestSame>=2?8:0),
    "q":struct.jokers*20+maxDup*12+(maxDup>=3?18:0),
    "sp":pairCount*14+(struct.jokers===0?10:-18)-(struct.pungs.length+struct.kongs.length)*6,
  };
  return rkClamp(signals[secId]||0);
}

function rkBestHandForSection(rack,secId){
  const hands=(HAND_CATALOG||[]).filter(h=>h.sec===secId);
  if(!hands.length)return null;
  return hands.map(h=>{
    let cov=null;
    try{cov=computeHonestCoverage(rack,h);}catch(e){cov={pct:Math.round((h.fit?.(rack)||0)*100),credibility:0,isCredible:true,groupNuance:"",plan:null};}
    const credibility=typeof cov.credibility==="number"?cov.credibility:cov.pct;
    return{hand:h,cov,pct:cov.pct||0,credibility,isCredible:cov.isCredible!==false};
  }).sort((a,b)=>(b.credibility-a.credibility)||(b.pct-a.pct))[0];
}

function rkEvaluateSection(struct,rack,sec){
  const secId=sec.id;
  const best=rkBestHandForSection(rack,secId);
  const coverage=best?.pct||Math.round((sec.ck?.(rack)||0)*100)||0;
  const signal=rkSectionRawSignals(struct,secId);
  let realism=(coverage*.48)+(signal*.52);
  const reasons=[];
  const needs=[];
  const support=[];

  if(struct.bestWindow&&secId==="cr")support.push(`${RK_SUIT_NAMES[struct.bestWindow.suit]} ${struct.bestWindow.nums[0]}-${struct.bestWindow.nums[2]} window`);
  if(secId==="2468")support.push(`${(struct.sameNumberCounts[2]||0)+(struct.sameNumberCounts[4]||0)+(struct.sameNumberCounts[6]||0)+(struct.sameNumberCounts[8]||0)} even tiles`);
  if(secId==="369")support.push(`${(struct.sameNumberCounts[3]||0)+(struct.sameNumberCounts[6]||0)+(struct.sameNumberCounts[9]||0)} tiles across 3/6/9`);
  if(secId==="13579")support.push(`${(struct.sameNumberCounts[1]||0)+(struct.sameNumberCounts[3]||0)+(struct.sameNumberCounts[5]||0)+(struct.sameNumberCounts[7]||0)+(struct.sameNumberCounts[9]||0)} odd tiles`);
  if(secId==="2026")support.push(`${struct.sameNumberCounts[2]||0} twos · ${struct.sameNumberCounts[6]||0} sixes · ${struct.dragons.filter(t=>t.v==="Soap").length} Soap`);
  if(secId==="wd")support.push(`${struct.honorTotal} honors${struct.groupedHonor?` · ${struct.groupedHonor} grouped`:""}`);
  if(secId==="aln"&&struct.bestSameNumber)support.push(`${struct.bestSameNumber[1]} tiles around ${struct.bestSameNumber[0]}s`);
  if(secId==="q")support.push(`${struct.jokers} jokers · deepest natural group ${Math.max(0,...Object.values(struct.counts||{}))}`);
  if(secId==="sp")support.push(`${struct.pairs.length} natural pairs · ${struct.jokers} jokers`);

  // Human realism caps. These prevent fake optimism from raw technical coverage.
  if(secId==="q"&&struct.jokers<2&&Math.max(0,...Object.values(struct.counts||{}))<3){realism=Math.min(realism,34);needs.push("at least two jokers or real natural depth");}
  if(secId==="wd"&&struct.honorTotal<5&&struct.groupedHonor===0){realism=Math.min(realism,38);needs.push("more honors before this is real");}
  if(secId==="sp"&&(struct.pairs.length<3||struct.jokers>0)){realism=Math.min(realism,struct.pairs.length>=2?45:32);needs.push(struct.jokers>0?"jokers are dead in S&P":"more natural pairs");}
  if(secId==="aln"&&Number(struct.bestSameNumber?.[1]||0)<2){realism=Math.min(realism,35);needs.push("a clearer number anchor");}
  if(secId==="cr"&&!(struct.bestWindow&&struct.bestWindow.depth>=4)&&struct.connectedSequences.length===0){realism=Math.min(realism,36);needs.push("a tighter 3-number window");}
  if(secId==="2026"&&!((struct.sameNumberCounts[2]||0)&&(struct.sameNumberCounts[6]||0))){realism=Math.min(realism,44);needs.push("both 2s and 6s before committing");}
  if(secId==="369"&&(struct.sameNumberCounts[6]||0)===0){realism=Math.min(realism,48);needs.push("6s, the section anchor");}
  if(secId==="2468"&&(struct.sameNumberCounts[6]||0)===0&&((struct.sameNumberCounts[2]||0)+(struct.sameNumberCounts[4]||0)+(struct.sameNumberCounts[8]||0))<4){realism=Math.min(realism,45);needs.push("deeper even grouping");}
  if(secId==="13579"&&((struct.sameNumberCounts[3]||0)+(struct.sameNumberCounts[5]||0))<2&&struct.pairs.length<2){realism=Math.min(realism,46);needs.push("3s, 5s, or real pair density");}

  if(best?.cov?.groupNuance)reasons.push(best.cov.groupNuance);
  if(best?.cov?.plan?.needed?.length)needs.push(...best.cov.plan.needed.slice(0,2));

  const status=realism>=68?"realistically playable":realism>=48?"alive":realism>=34?"technically possible":"thin";
  const confidence=realism>=74?"High":realism>=56?"Medium":realism>=40?"Low":"Very low";
  return{
    id:secId,name:RK_SEC_NAMES[secId]||sec.name||secId,icon:sec.icon||"",score:rkClamp(realism),coverage,signal,status,confidence,
    bestHand:best?.hand||null,bestCoverage:best?.cov||null,support:support.filter(Boolean),needs:[...new Set(needs.filter(Boolean))],reasons
  };
}

function rkCoreOverlap(struct,liveSections){
  let overlap=0;
  const ids=liveSections.map(s=>s.id);
  const nc=struct.sameNumberCounts;
  if(ids.includes("cr")&&(ids.includes("2468")||ids.includes("369")||ids.includes("13579")))overlap+=14;
  if((nc[6]||0)>=1&&ids.includes("2468")&&ids.includes("369"))overlap+=14;
  if((nc[2]||0)>=1&&ids.includes("2026")&&ids.includes("2468"))overlap+=12;
  if((nc[3]||0)>=1&&ids.includes("369")&&ids.includes("13579"))overlap+=10;
  if((nc[5]||0)>=1&&ids.includes("13579")&&ids.includes("aln"))overlap+=8;
  if(struct.pairs.length>=3&&ids.includes("sp"))overlap+=8;
  if(struct.bestWindow?.depth>=5)overlap+=8;
  return rkClamp(overlap,0,40);
}

function rkShapeLabel(score){
  if(score>=88)return "Elite Shape";
  if(score>=75)return "Strong Shape";
  if(score>=58)return "Growing Shape";
  if(score>=43)return "Loose Shape";
  if(score>=28)return "Fragile Shape";
  return "Broken Shape";
}
function rkDirectionLabelFromWindow(w){
  if(!w)return null;
  const a=w.nums[0],b=w.nums[2];
  const band=b<=4?"low":a>=6?"high":"middle";
  return `${band} consecutive momentum in ${RK_SUIT_NAMES[w.suit]}`;
}
function rkReadableNumberCluster(nc,nums,label){
  const total=nums.reduce((a,n)=>a+(nc[n]||0),0);
  const dense=nums.filter(n=>(nc[n]||0)>=2);
  if(total<4)return null;
  if(dense.length)return `${label} shape with duplication around ${dense.join("/")}s`;
  return `${label} shape, but still spread`;
}
function rkMaxNaturalGroup(struct){return Math.max(0,...Object.values(struct.counts||{}).filter(Boolean));}
function rkBuildLiveDirections(struct,sectionReads=[]){
  const nc=struct.sameNumberCounts||{};
  const dirs=[];
  const add=(text,score=50)=>{if(text&&!dirs.some(d=>d.label===text))dirs.push({label:text,score});};
  if(struct.bestWindow?.depth>=3)add(rkDirectionLabelFromWindow(struct.bestWindow),struct.bestWindow.depth>=5?78:62);
  const odd=rkReadableNumberCluster(nc,[1,3,5,7,9],"odd-number");
  const even=rkReadableNumberCluster(nc,[2,4,6,8],"even-number");
  const n369=rkReadableNumberCluster(nc,[3,6,9],"3-6-9");
  if(even)add(even,(nc[2]||0)+(nc[4]||0)+(nc[6]||0)+(nc[8]||0)>=6?72:56);
  if(odd)add(odd,(nc[1]||0)+(nc[3]||0)+(nc[5]||0)+(nc[7]||0)+(nc[9]||0)>=6?72:56);
  if(n369)add(n369,(nc[3]||0)+(nc[6]||0)+(nc[9]||0)>=5?68:52);
  if(struct.pairs.length>=3)add("pair-heavy shape",70);
  else if(struct.pairs.length>=2)add("early pair pressure",56);
  if(Number(struct.bestSameNumber?.[1]||0)>=3)add(`same-number pressure around ${struct.bestSameNumber[0]}s`,70);
  if(struct.jokers>=2&&rkMaxNaturalGroup(struct)>=2)add("growing quint ceiling",62);
  else if(rkMaxNaturalGroup(struct)>=3)add("natural group strength",64);
  if(struct.honorTotal>=5&&struct.groupedHonor>=1)add("honor-based Winds/Dragons support",66);
  const twos=nc[2]||0,sixes=nc[6]||0,soap=(struct.dragons||[]).filter(t=>t.v==="Soap").length;
  if(twos+sixes+soap>=4&&twos&&sixes)add("2026-style number pressure",60);
  sectionReads.slice(0,4).forEach(s=>{
    if(s.score>=58){
      const map={cr:"consecutive run pressure",2468:"clean even-number flow",369:"3-6-9 lane",13579:"odd-number lane",aln:"like-number lane",q:"quint possibility",sp:"singles-and-pairs texture",wd:"winds/dragons texture",2026:"2026 texture"};
      add(map[s.id]||s.name,s.score);
    }
  });
  return dirs.sort((a,b)=>b.score-a.score).slice(0,5);
}
function rkCoreSignal(struct){
  const nc=struct.sameNumberCounts||{};
  const dominantSuit=struct.strongestSuit?RK_SUIT_NAMES[struct.strongestSuit]:null;
  const bestSuitCount=struct.suitEntries?.[0]?.[1]||0;
  const maxGroup=rkMaxNaturalGroup(struct);
  const bestSame=Number(struct.bestSameNumber?.[1]||0);
  if(struct.bestWindow?.depth>=5)return `The ${RK_SUIT_NAMES[struct.bestWindow.suit]} ${struct.bestWindow.nums[0]}-${struct.bestWindow.nums[2]} window was carrying the rack.`;
  if(struct.pungs.length)return `${struct.pungs[0].label} gave the rack real group strength.`;
  if(bestSuitCount>=6)return `${dominantSuit} concentration gave the rack its cleanest identity.`;
  if(struct.pairs.length>=3)return `The pair density was the strongest clue in the rack.`;
  if(bestSame>=3)return `The repeated ${struct.bestSameNumber[0]}s created the clearest same-number pressure.`;
  if(struct.bestWindow?.depth>=3)return `The ${RK_SUIT_NAMES[struct.bestWindow.suit]} number window gave the rack its best momentum.`;
  const odd=(nc[1]||0)+(nc[3]||0)+(nc[5]||0)+(nc[7]||0)+(nc[9]||0);
  const even=(nc[2]||0)+(nc[4]||0)+(nc[6]||0)+(nc[8]||0);
  if(even>=5)return `The even tiles were starting to create direction.`;
  if(odd>=5)return `The odd tiles were starting to create direction.`;
  if(struct.pairs.length>=2)return `Two natural pairs gave the rack something to protect.`;
  if(maxGroup>=2)return `The rack had a small grouping clue, but it was still early.`;
  return `The rack had clues, but no true engine yet.`;
}
function rkStrategicTension(struct,top,liveDirections){
  const issues=[];
  const bestSuit=struct.suitEntries?.[0]?.[1]||0;
  const midSuit=struct.suitEntries?.[1]?.[1]||0;
  const lowSuit=struct.suitEntries?.[2]?.[1]||0;
  const maxGroup=rkMaxNaturalGroup(struct);
  if(struct.isolated.length>=5)issues.push(`The rack was too fragmented. Too many tiles were not pairing, connecting, or sharing a lane.`);
  else if(struct.isolated.length>=3)issues.push(`The shape was alive, but several isolated tiles were slowing the read.`);
  if(struct.pairs.length<2&&maxGroup<3)issues.push(`There was not enough duplication yet to fully trust the direction.`);
  if(bestSuit<5&&midSuit>=3&&lowSuit>=2)issues.push(`The suits were still splitting, which made the rack feel wider than it felt strong.`);
  if(struct.honorTotal>=3&&struct.groupedHonor===0)issues.push(`Loose honors created friction unless Winds and Dragons became real quickly.`);
  const terminalSingles=struct.nums.filter(t=>(t.n===1||t.n===9)&&(struct.counts[rkTileKey(t)]||0)===1).length;
  if(terminalSingles>=2)issues.push(`The terminal singles were stretched. They needed support or they would become discard pressure.`);
  if(top?.id==="q"&&struct.jokers<2)issues.push(`Quints was a thin idea without enough joker help or natural depth.`);
  if(top?.id==="sp"&&struct.jokers>0)issues.push(`Singles and Pairs carried hidden friction because jokers cannot help that section.`);
  if(!issues.length&&liveDirections.length>=3)issues.push(`The main tension was timing. The rack had options, but choosing too early could cut off the best pivot.`);
  if(!issues.length)issues.push(`The rack was playable, but it still needed one cleaner pickup before it deserved full trust.`);
  return issues.slice(0,3);
}

function rkRackPersonality(struct,shapeQuality,commitmentState,liveDirections,sectionReads=[]){
  const bestSuit=struct.suitEntries?.[0]?.[1]||0;
  const secondSuit=struct.suitEntries?.[1]?.[1]||0;
  const thirdSuit=struct.suitEntries?.[2]?.[1]||0;
  const maxGroup=rkMaxNaturalGroup(struct);
  const top=sectionReads?.[0]?.score||0;
  const second=sectionReads?.[1]?.score||0;
  const gap=top-second;
  const directionCount=liveDirections?.length||0;
  const hasRun=(struct.bestWindow?.depth||0)>=4;
  const hasDenseRun=(struct.bestWindow?.depth||0)>=5;
  const pairCount=struct.pairs?.length||0;
  const isolation=struct.isolated?.length||0;
  const looseHonors=struct.honorTotal>=3&&struct.groupedHonor===0;

  if(shapeQuality==="Broken Shape")return "Broken Shape";
  if(directionCount>=4&&pairCount<2&&maxGroup<3)return "False Flex";
  if(bestSuit<5&&secondSuit>=3&&thirdSuit>=2)return "Split Rack";
  if(pairCount>=4)return "Pair Engine";
  if(pairCount>=3&&commitmentState!=="Committed")return "Quiet Momentum";
  if(hasDenseRun&&bestSuit>=5)return "Clean Builder";
  if(hasRun&&directionCount>=3)return "Slippery Rack";
  if(isolation>=5)return "Noisy Rack";
  if(isolation>=4&&top<58)return "Drift Rack";
  if(maxGroup>=3&&isolation>=3)return "Fragile Core";
  if(directionCount>=3&&gap<8)return "Double Lane Rack";
  if(commitmentState==="Leaning"&&gap>=10&&shapeQuality==="Growing Shape")return "Delayed Commit";
  if(pairCount<2&&maxGroup<3&&top>=48)return "Thin Rack";
  if(looseHonors&&directionCount>=2)return "Shape Trap";
  if(bestSuit>=7&&maxGroup>=2)return "Dense Rack";
  if(top>=62&&gap>=14&&shapeQuality!=="Fragile Shape")return "Stubborn Rack";
  if(shapeQuality==="Fragile Shape")return "Fragile Core";
  if(shapeQuality==="Loose Shape")return directionCount>=3?"Wide Rack":"Loose Rack";
  if(shapeQuality==="Growing Shape")return "Slow Burn";
  if(shapeQuality==="Strong Shape")return "Clean Builder";
  return "Watching Rack";
}
function rkRackPersonalityCopy(personality){
  const map={
    "False Flex":"Looks flexible at first, but the density is not fully backing it up yet.",
    "Split Rack":"Two lanes are competing, and neither has fully earned control.",
    "Pair Engine":"The rack is being powered by pairs more than by a finished lane.",
    "Quiet Momentum":"The rack is improving quietly through small duplication and shared tiles.",
    "Clean Builder":"The shape is growing naturally without asking you to force much.",
    "Slippery Rack":"The rack can still move, but the next pass matters because it can drift fast.",
    "Noisy Rack":"Too many tiles are talking at once. The rack needs cleaner priorities.",
    "Drift Rack":"The rack is alive, but it has not chosen a real identity yet.",
    "Fragile Core":"There is one real clue, but the support around it is still thin.",
    "Double Lane Rack":"Two believable directions remain live through overlapping tiles.",
    "Delayed Commit":"The rack is close to choosing, but it needs one more clean signal.",
    "Thin Rack":"The idea exists, but the structure is still light.",
    "Shape Trap":"The rack looks tempting, but some tiles may be creating false comfort.",
    "Dense Rack":"The rack has real weight through concentration and grouping.",
    "Stubborn Rack":"The rack keeps pointing back to the same lane.",
    "Wide Rack":"The rack has options, but not all of them are equally real.",
    "Loose Rack":"There are clues, but the structure is still more open than strong.",
    "Slow Burn":"The rack is not loud yet, but it has healthy long-term growth.",
    "Watching Rack":"The right move is to observe one more beat before forcing a read.",
    "Broken Shape":"The rack needs a reset more than it needs a target."
  };
  return map[personality]||"The rack has a personality, but it still needs one clearer signal.";
}
function rkWhyShapeWorked(struct,liveDirections,shapeQuality){
  const lines=[];
  if(struct.bestWindow?.depth>=4)lines.push(`The shape had natural flow because the ${RK_SUIT_NAMES[struct.bestWindow.suit]} ${struct.bestWindow.nums[0]}-${struct.bestWindow.nums[2]} window connected without forcing.`);
  if(struct.pairs.length>=2)lines.push(`${rkPlural(struct.pairs.length,"natural pair")} gave the rack density, not just loose possibility.`);
  if(struct.suitEntries?.[0]?.[1]>=5)lines.push(`${RK_SUIT_NAMES[struct.strongestSuit]} gave the rack concentration, which reduces future discard pain.`);
  if(liveDirections.length>=3)lines.push(`Several directions shared the same core tiles, so the rack could stay loose without becoming muddy.`);
  if(struct.pungs.length)lines.push(`The existing pung strength gave the rack a real engine.`);
  if(struct.jokers>=2)lines.push(`The jokers raised the ceiling for open-hand lanes, but the natural shape still mattered most.`);
  if(!lines.length&&shapeQuality==="Loose Shape")lines.push(`The rack had some live ideas, but the value was still spread rather than concentrated.`);
  if(!lines.length)lines.push(`The rack had early clues, but not enough clean shape to claim momentum yet.`);
  return lines.slice(0,3);
}
function rkShapeQualityScore(struct,sectionReads){
  const bestSuit=struct.suitEntries?.[0]?.[1]||0;
  const secondSuit=struct.suitEntries?.[1]?.[1]||0;
  const thirdSuit=struct.suitEntries?.[2]?.[1]||0;
  const bestRunLen=(struct.connectedSequences||[]).reduce((m,s)=>Math.max(m,s.nums.length),0);
  const maxGroup=rkMaxNaturalGroup(struct);
  const top=sectionReads?.[0]?.score||0;
  return rkClamp(
    18+
    struct.pairs.length*7+
    struct.pungs.length*13+
    struct.kongs.length*16+
    (maxGroup>=4?16:maxGroup>=3?11:maxGroup>=2?5:0)+
    (struct.bestWindow?Math.min(struct.bestWindow.depth*5+struct.bestWindow.dup*4,26):0)+
    (bestRunLen>=4?16:bestRunLen>=3?10:bestRunLen>=2?5:0)+
    (bestSuit>=7?16:bestSuit>=6?12:bestSuit>=5?8:bestSuit>=4?4:0)+
    (secondSuit>=3&&thirdSuit>=3?-10:0)+
    Math.min(top*.10,8)+
    struct.jokers*3-
    struct.isolated.length*5-
    (struct.honorTotal>=3&&struct.groupedHonor===0?7:0)
  );
}
function rkCommitmentClarityScore(struct,top,second,liveDirections){
  const gap=top&&second?top.score-second.score:top?.score||0;
  const density=struct.pairs.length*6+struct.pungs.length*10+(struct.bestWindow?.depth||0)*4+(struct.suitEntries?.[0]?.[1]||0)*2;
  const overSpread=liveDirections.length>=4?8:0;
  return rkClamp(20+(top?.score||0)*.38+gap*.65+density*.35-overSpread-struct.isolated.length*3);
}
function rkCommitmentState(iq,shapeScore,commitmentClarity,top,second,liveDirections,struct){
  const gap=top&&second?top.score-second.score:top?.score||0;
  const hasDensity=struct.pairs.length>=2||struct.pungs.length>=1||(struct.bestWindow?.depth||0)>=5||(struct.suitEntries?.[0]?.[1]||0)>=6;
  if(iq>=82&&shapeScore>=76&&commitmentClarity>=72&&gap>=14&&hasDensity)return "Committed";
  if((top?.score||0)>=58&&gap>=8&&shapeScore>=52)return "Leaning";
  if(liveDirections.length>=3&&gap<18&&shapeScore>=45)return "Flexible";
  if(shapeScore>=30||(top?.score||0)>=38||struct.pairs.length>=2||struct.bestWindow?.depth>=3)return "Watching";
  return "Resetting";
}
function rkCoachingInsight(commitmentState,shapeQuality,struct,top){
  if(commitmentState==="Committed")return `The rack has earned a lane. Commit, but do not chase loose edges that do not feed the engine.`;
  if(commitmentState==="Leaning")return `You are close to choosing a lane. One clean pickup probably commits this rack.`;
  if(commitmentState==="Flexible")return `Stay loose. Protect the shared core tiles and let the next draw choose the lane.`;
  if(commitmentState==="Resetting")return `Reset the read. Keep only tiles that pair, connect, or build a clear window.`;
  if(struct.bestWindow?.depth>=3)return `The clues are real, but this still wants patience before commitment.`;
  if(struct.pairs.length>=2)return `Protect the pairs, but do not turn them into a final plan too early.`;
  return `Watch one more turn before forcing an idea.`;
}

function rkEvaluateCharlestonEngine({finalRack,startingRack=[],passedTilesByRound=[],sectionId,chosenHand,allSections=[]}){
  const rack=finalRack||[];
  const struct=rkAnalyzeTileStructure(rack);
  const sectionReads=(SECS||[]).map(sec=>rkEvaluateSection(struct,rack,sec)).sort((a,b)=>b.score-a.score);
  const top=sectionReads[0]||null;
  const second=sectionReads[1]||null;
  const liveSections=sectionReads.filter(s=>s.score>=40&&s.status!=="thin");
  const liveDirections=rkBuildLiveDirections(struct,sectionReads);
  const overlap=rkCoreOverlap(struct,liveSections);

  const shapeScore=rkShapeQualityScore(struct,sectionReads);
  const shapeQuality=rkShapeLabel(shapeScore);
  const tileEfficiency=struct.tileEfficiency;
  const commitmentClarity=rkCommitmentClarityScore(struct,top,second,liveDirections);
  const flexibility=rkClamp(24+Math.min(liveDirections.length*9,30)+overlap+struct.jokers*3-struct.isolated.length*5-(top&&second?Math.max(0,top.score-second.score-22):0));
  const growthPotential=struct.growthPotential;
  const momentumStrength=rkClamp((liveDirections[0]?.score||0)*.36+shapeScore*.24+overlap*.55+(struct.bestWindow?.depth||0)*4+struct.pairs.length*4+struct.pungs.length*8-struct.isolated.length*4);
  const commitmentTiming=rkClamp(commitmentClarity*.70+(liveDirections.length>=3?10:0)-(struct.isolated.length>=5?12:0));
  const rackleIQScore=rkClamp(shapeScore*.35+tileEfficiency*.25+momentumStrength*.20+commitmentTiming*.10+flexibility*.10);
  const commitmentState=rkCommitmentState(rackleIQScore,shapeScore,commitmentClarity,top,second,liveDirections,struct);
  const rackPersonality=rkRackPersonality(struct,shapeQuality,commitmentState,liveDirections,sectionReads);
  const rackPersonalityCopy=rkRackPersonalityCopy(rackPersonality);

  const coreSignal=rkCoreSignal(struct);
  const whyTheRackWorked=rkWhyShapeWorked(struct,liveDirections,shapeQuality);
  const strategicTension=rkStrategicTension(struct,top,liveDirections);
  const coachingInsight=rkCoachingInsight(commitmentState,shapeQuality,struct,top);

  const bestDirection=liveDirections[0]?.label||top?.name||"Still watching";
  const directionScore=rkClamp(commitmentClarity*.4,0,40);
  const tileStrengthScore=rkClamp(tileEfficiency*.25,0,25);
  const passQualityScore=rkClamp((shapeScore*.55+flexibility*.45)*.25,0,25);
  const timingScore=rkClamp(growthPotential*.10,0,10);
  const dominantSuit=struct.strongestSuit?RK_SUIT_NAMES[struct.strongestSuit]:"No clear suit";

  const bestPaths=liveDirections.slice(0,4).map(d=>({
    section:d.label,
    hand:null,
    confidence:d.score>=70?"High":d.score>=56?"Medium":"Low",
    support:[coreSignal],
    needs:strategicTension.slice(0,2),
    overlapStrength:d.score>=70?"Strong":d.score>=56?"Medium":"Thin",
    status:d.score>=68?"realistically playable":d.score>=48?"alive":"technically possible",
    score:d.score,
  }));

  return{
    rackPersonality,
    rackPersonalityCopy,
    rackleIQScore,
    shapeQuality,
    commitmentState,
    commitmentStatus:commitmentState,
    bestDirection,
    coreSignal,
    whyTheRackWorked,
    whyItWorks:whyTheRackWorked,
    strategicTension,
    dangerAreas:strategicTension,
    liveDirections:liveDirections.map(d=>d.label),
    liveSections:liveDirections.map(d=>({name:d.label,confidence:d.score>=70?"High":d.score>=56?"Medium":"Low",status:d.score>=68?"realistically playable":d.score>=48?"alive":"watching",score:d.score})),
    coachingInsight,
    patternStrengths:[coreSignal,...whyTheRackWorked].slice(0,4),
    bestPaths,
    tileStructure:{
      strongestSuit:dominantSuit,weakestSuit:struct.weakestSuit?RK_SUIT_NAMES[struct.weakestSuit]:null,
      pairs:struct.pairs.map(g=>g.label),pungs:struct.pungs.map(g=>g.label),kongs:struct.kongs.map(g=>g.label),
      connectedSequences:struct.connectedSequences.map(s=>`${RK_SUIT_NAMES[s.suit]} ${s.nums.join("-")}`),
      isolatedCount:struct.isolated.length,jokers:struct.jokers,flowers:struct.flowers
    },
    componentScores:{shapeQuality:shapeScore,tileEfficiency,momentumStrength,commitmentTiming,commitmentClarity,flexibility,growthPotential,directionScore,tileStrengthScore,passQualityScore,timingScore},
    topSection:top,chosenSection:sectionReads.find(s=>s.id===sectionId)||top,sectionReads
  };
}
function StrategicCharlestonReadCard({iq}){
  const r=iq?.strategicRead;
  if(!r)return null;
  const state=r.commitmentState||r.commitmentStatus;
  const statusColor={"Committed":C.jade,"Leaning":C.gold,"Flexible":"#2460A8","Watching":C.mut,"Resetting":C.cinn,"Strong Commit":C.jade,"Maybe":C.mut,"Bail Out":C.cinn}[state]||C.mut;
  const shapeColor={"Elite Shape":C.jade,"Strong Shape":C.jade,"Growing Shape":C.gold,"Loose Shape":"#2460A8","Fragile Shape":C.cinn,"Broken Shape":C.cinn}[r.shapeQuality]||C.mut;
  return(
    <div className="rk-score-card" style={{padding:18,textAlign:"left",marginBottom:12}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:13}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:9,letterSpacing:2.2,fontWeight:950,color:C.jade,textTransform:"uppercase",marginBottom:5}}>Mahjong Intuition v2</div>
          <div style={{fontFamily:F.d,fontSize:20,fontWeight:950,lineHeight:1.08,color:C.ink}}>What your rack is trying to become</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.45,marginTop:5}}>Shape, momentum, timing, and rack personality before a final hand call.</div>
        </div>
        <div style={{display:"grid",gap:6,justifyItems:"end",flexShrink:0}}>
          <div style={{borderRadius:999,padding:"7px 10px",background:shapeColor+"12",border:`1px solid ${shapeColor}22`,color:shapeColor,fontSize:10,fontWeight:950,whiteSpace:"nowrap"}}>{r.shapeQuality||"Shape Read"}</div>
          <div style={{borderRadius:999,padding:"7px 10px",background:statusColor+"12",border:`1px solid ${statusColor}22`,color:statusColor,fontSize:10,fontWeight:950,whiteSpace:"nowrap"}}>{state}</div>
        </div>
      </div>

      <div style={{borderRadius:18,padding:"14px 14px",background:"linear-gradient(145deg,#FFFDF8,#F7F0E5)",border:`1px solid ${C.gold}1F`,boxShadow:"inset 0 1px 0 rgba(255,255,255,.76)",marginBottom:10}}>
        <div style={{fontSize:9,letterSpacing:2,fontWeight:950,color:C.gold,textTransform:"uppercase",marginBottom:5}}>Rack Personality</div>
        <div style={{fontFamily:F.d,fontSize:19,lineHeight:1.08,color:C.ink,fontWeight:950,marginBottom:5}}>{r.rackPersonality||"Watching Rack"}</div>
        <div style={{fontSize:12,lineHeight:1.5,color:"rgba(26,20,16,.68)",fontWeight:700}}>{r.rackPersonalityCopy||"The rack needs one clearer signal before it deserves a hard commitment."}</div>
      </div>

      <div style={{borderRadius:18,padding:"13px 14px",background:"linear-gradient(145deg,#FFFDF8,#F7F0E5)",border:`1px solid ${C.jade}12`,boxShadow:"inset 0 1px 0 rgba(255,255,255,.76)",marginBottom:12}}>
        <div style={{fontSize:9,letterSpacing:2,fontWeight:950,color:C.jade,textTransform:"uppercase",marginBottom:4}}>Core Signal</div>
        <div style={{fontSize:13,lineHeight:1.55,color:C.ink,fontWeight:850}}>{r.coreSignal||r.bestDirection}</div>
      </div>

      <div style={{display:"grid",gap:11}}>
        <div>
          <div style={{fontSize:10,fontWeight:950,color:C.ink,marginBottom:5}}>Why it had value</div>
          {(r.whyTheRackWorked||r.whyItWorks||[]).slice(0,3).map((x,i)=><div key={i} style={{fontSize:12,lineHeight:1.55,color:"rgba(26,20,16,.72)",fontWeight:700}}>• {x}</div>)}
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:950,color:C.ink,marginBottom:5}}>Strategic tension</div>
          {(r.strategicTension||r.dangerAreas||[]).slice(0,2).map((x,i)=><div key={i} style={{fontSize:12,lineHeight:1.55,color:"rgba(26,20,16,.68)",fontWeight:650}}>• {x}</div>)}
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:950,color:C.ink,marginBottom:7}}>Live directions</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {(r.liveDirections||[]).slice(0,4).map((x,i)=><span key={i} className="rk-soft-pill" style={{fontSize:10,padding:"6px 9px"}}>{x}</span>)}
          </div>
        </div>
        <div style={{borderTop:`1px solid ${C.bdr}80`,paddingTop:10,fontSize:13,lineHeight:1.55,color:C.ink,fontWeight:850,textAlign:"center"}}>{r.coachingInsight}</div>
      </div>
    </div>
  );
}
function calculateCharlestonIQ(gameState,puzzleId,isDaily,dayNum){
  const{startingRack,finalRack,passedTilesByRound,totalTime,sectionId,chosenHand}=gameState;
  if(!startingRack||!finalRack||!sectionId)return null;

  // Resolve the specific chosen hand from the catalog.
  // If the player only picked a section (chosenHand is null), infer the best-fit
  // specific hand from the catalog against the final rack. This makes all scoring
  // suit-aware and hand-specific rather than falling back to section-level heuristics.
  const explicitHandObj=chosenHand
    ?HAND_CATALOG.find(h=>h.sec===sectionId&&h.label===chosenHand)
    :null;
  const inferredHandObj=!explicitHandObj
    ?recommendSpecificHands(finalRack,sectionId)[0]||null
    :null;
  const chosenHandObj=explicitHandObj||inferredHandObj;
  // Flag whether the hand was inferred vs explicitly chosen, used for explanation text
  const handWasInferred=!explicitHandObj&&!!inferredHandObj;

  const roundCount=Math.max((passedTilesByRound||[]).length,1);

  // ── DIRECTION SCORE: now based on fit against the specific hand ──────────────
  let{directionScore,directionExplanation}=iqDirection(finalRack,sectionId,chosenHandObj);

  // ── TILE STRENGTH: also hand-aware ───────────────────────────────────────────
  let{tileStrengthScore}=iqTileStrength(finalRack,sectionId,chosenHandObj);

  // ── PASS QUALITY: hand-aware strong/weak tile determination ──────────────────
  let{passQualityScore,passInsights,brokenPairsCount}=iqPassQuality(passedTilesByRound,startingRack,finalRack,sectionId,chosenHandObj);
  let{timingScore,timingInsight}=iqTiming(totalTime||0,roundCount,passedTilesByRound);

  // ── OUTCOME VALIDATION FLOOR ─────────────────────────────────────────────────
  // Outcome validation floor: if direction AND tile strength are both high (now using honest
  // coverage, not fit()), the final rack genuinely proves the passes were reasonable.
  // A player who ends up with 80%+ real coverage did something right in the Charleston.
  const dirRatio=directionScore/40;
  const tileRatio=tileStrengthScore/25;
  const outcomeStrength=(dirRatio+tileRatio)/2;
  // Floor only kicks in above 0.75 to avoid inflating scores on mediocre racks
  const passFloor=outcomeStrength>=0.88?18:outcomeStrength>=0.80?15:outcomeStrength>=0.75?10:0;
  if(passQualityScore<passFloor)passQualityScore=passFloor;

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
    directionScore=Math.min(40,directionScore+3);
    tileStrengthScore=Math.min(25,tileStrengthScore+(tileStrengthScore<20?4:0));
  } else if(retentionRate>=0.7&&dealStrong>=5){
    directionScore=Math.min(40,directionScore+1);
    tileStrengthScore=Math.min(25,tileStrengthScore+(tileStrengthScore<18?2:0));
  }
  // Poor deal floors, a player shouldn't be punished for bad luck
  // NORMALIZATION: W&D and ALN floors are raised because random deals almost never
  // produce 7+ honors or 4+ of one number naturally. A player who correctly identifies
  // and commits to these sections on a lean deal deserves protection from the floor too.
  const isHardSection=["wd","aln","q"].includes(sectionId);
  const dirFloor=dealStrong<=2?(isHardSection?24:22):(isHardSection?20:18);
  const tileFloor=dealStrong<=2?(isHardSection?14:13):(isHardSection?12:11);
  if(dealStrong<=2){
    directionScore=Math.max(directionScore,dirFloor);
    tileStrengthScore=Math.max(tileStrengthScore,tileFloor);
  } else if(dealStrong<=4){
    directionScore=Math.max(directionScore,isHardSection?20:18);
    tileStrengthScore=Math.max(tileStrengthScore,isHardSection?12:11);
  }

  // ── SECTION DOMINANCE BONUS ─────────────────────────────────────────────────
  // NORMALIZATION: W&D and ALN have inherently lower ck() raw scores because their tile
  // frequency is rarer in a random rack. To avoid penalizing players who correctly chose
  // a hard section, we compare dominance relative to section-adjusted thresholds, not
  // absolute multipliers. A W&D rack where W&D clearly leads other sections is rewarded
  // even if its absolute ck() score is lower than what 2468/13579 would produce.
  const allSectionScores=SECS.map(s=>s.ck(finalRack));
  const chosenIdx=SECS.findIndex(s=>s.id===sectionId);
  const chosenScore=chosenIdx>=0?allSectionScores[chosenIdx]:0;
  const otherScores=allSectionScores.filter((_,i)=>i!==chosenIdx);
  const bestOther=otherScores.length?Math.max(...otherScores):0;
  // Section difficulty multiplier, harder sections need a lower dominance threshold to earn the bonus
  // W&D and ALN require tighter commitment and have lower natural ck() ceilings, so the bar is lower
  const sectionDifficultyThreshold={"wd":1.6,"aln":1.6,"q":1.4,"sp":1.8}[sectionId]||2.5;
  const sectionDominanceCap={"wd":2.0,"aln":2.0,"q":1.8,"sp":2.2}[sectionId]||3.5;
  if(chosenScore>=0.08&&chosenScore>=bestOther*sectionDifficultyThreshold){
    directionScore=Math.min(40,directionScore+3);
    directionExplanation+=" Your rack clearly committed to this section, that's decisive.";
  } else if(chosenScore>=0.05&&chosenScore>=bestOther*Math.min(sectionDominanceCap,sectionDifficultyThreshold*0.85)){
    directionScore=Math.min(40,directionScore+1);
  } else if(chosenScore>=0.2&&chosenScore>=bestOther*2.5){
    // Legacy threshold for easy flexible sections, unchanged
    directionScore=Math.min(40,directionScore+2);
    directionExplanation+=" Your rack had nowhere else to go, that's a decisive deal.";
  } else if(chosenScore>=0.2&&chosenScore>=bestOther*1.8){
    directionScore=Math.min(40,directionScore+1);
  }

  // ── EXPERT CHARLESTON AUDIT ───────────────────────────────────────────────
  // Re-score through the human Charleston engine: whole-rack structure, suits,
  // grouped strength, live section realism, pivot value, and overcommitment risk.
  const strategicRead=rkEvaluateCharlestonEngine({
    finalRack,startingRack,passedTilesByRound,sectionId,chosenHand,allSections:SECS.map(s=>({...s,score:s.ck(finalRack)}))
  });
  if(strategicRead?.componentScores){
    directionScore=strategicRead.componentScores.directionScore;
    tileStrengthScore=strategicRead.componentScores.tileStrengthScore;
    passQualityScore=Math.max(0,Math.min(25,Math.round((passQualityScore*0.45)+(strategicRead.componentScores.passQualityScore*0.55))));
    timingScore=strategicRead.componentScores.timingScore;
    directionExplanation=`${strategicRead.rackPersonality||strategicRead.commitmentStatus}: ${strategicRead.bestDirection}. ${strategicRead.whyItWorks?.[0]||"Whole-rack structure reviewed."}`;
  }

  const totalScore=strategicRead?.rackleIQScore ?? Math.max(0,Math.min(100,directionScore+tileStrengthScore+passQualityScore+timingScore));
  const{level,levelExplanation,tier}=iqScoreLevel(totalScore,directionScore,tileStrengthScore,passQualityScore,timingScore);
  const style=getIQStyle(totalScore,directionScore,tileStrengthScore,passQualityScore,timingScore);

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
    ?[`🀄 Daily Rackle #${dn}`,`${totalScore} · ${level}`,passEmoji?`Passes: ${passEmoji}`:"","Think you can beat it?","playrackle.com"].filter(Boolean).join("\n\n")
    :[`🀄 Rackle Practice`,`${totalScore} · ${level}`,passEmoji?`Passes: ${passEmoji}`:"","Play the daily Charleston challenge!","playrackle.com"].filter(Boolean).join("\n\n");

  // When the hand was inferred, prefix the explanation so the player understands the basis.
  // The directionExplanation already includes "Scored against X: N of M tiles covered (P%)."
  // so we just flag that this was inferred, not player-chosen.
  if(handWasInferred&&chosenHandObj){
    directionExplanation=`Best-fit hand (inferred): ${chosenHandObj.label}. `+directionExplanation;
  }

  return{
    puzzleId,totalScore,level,levelExplanation,tier,style,styleName:style?.name,styleNote:style?.note,
    directionScore,tileStrengthScore,passQualityScore,timingScore,
    directionExplanation,
    scoredHandLabel:chosenHandObj?.label||null,
    handWasInferred,
    distanceToOptimal:{...dist},
    strengths,weaknesses,
    tileInsights:tileIns,
    passInsights,
    timingInsight,
    strategicRead,
    commitmentStatus:strategicRead?.commitmentStatus,
    bestDirection:strategicRead?.bestDirection,
    liveSections:strategicRead?.liveSections,
    coachingInsight:strategicRead?.coachingInsight,
    coachNote:strategicRead?.coachingInsight||coachNote,
    tryNextTime:strategicRead?.coachingInsight||tryNextTime,
    totalTime,shareText,
  };
}

// ─── SECTION HELPERS ─────────────────────────────────────────────────────────
function ev(h){return SECS.map(s=>({...s,score:s.ck(h)})).sort((a,b)=>b.score-a.score);}
function adv(hand,cid){
  const e=ev(hand),ch=e.find(s=>s.id===cid),top=e[0],alts=e.filter(s=>s.id!==cid&&s.score>0.03).slice(0,2);
  let v="Not optimal",em="😬";
  // NORMALIZATION: W&D and ALN have inherently lower ck() scores on random racks.
  // A player choosing W&D with 0.10 score vs a top of 0.15 is in a very different position
  // than a player choosing 13579 at 0.10 vs a top of 0.15, because W&D's ceiling is lower.
  // Adjusted thresholds give harder sections more leniency before calling a choice risky.
  const hardSection=["wd","aln","q"].includes(cid);
  const strongThreshold=hardSection?0.70:0.85;  // ratio of chosen vs top to count as "strong"
  const playableThreshold=hardSection?0.35:0.55; // ratio below which it's risky
  if(ch&&ch.score>=0.01){
    if(ch.id===top.id||ch.score>=top.score*strongThreshold){v="Strong choice";em="💪";}
    else if(ch.score>=top.score*playableThreshold){v="Playable but risky";em="🤔";}
  }
  const p=ch?(ch.score*100).toFixed(0):"0";
  const topPct=(top.score*100).toFixed(0);
  let r;
  if(v==="Strong choice"){r=`${p}% fit, your tiles aligned well with ${ch?.name}. Solid passing instincts.`;}
  else if(v==="Playable but risky"){r=`${p}% fit for ${ch?.name}, but your tiles leaned more toward ${top.name} (${topPct}%). A pivot earlier could have paid off.`;}
  else{r=`Only ${p}% fit for ${ch?.name}. Your tiles were a much better match for ${top.name} (${topPct}%), worth practicing that read.`;}
  return{verdict:v,emoji:em,reason:r,alts,top,chosen:ch};
}

// ─── STORAGE & STATE ─────────────────────────────────────────────────────────
const mem={};
const ST={
  get(k,d){try{const v=JSON.parse(localStorage.getItem("rk-"+k));return v!==null?v:d;}catch{return mem[k]!==undefined?mem[k]:d;}},
  set(k,v){try{localStorage.setItem("rk-"+k,JSON.stringify(v));}catch(e){mem[k]=v;if(e.name==="QuotaExceededError")console.warn("localStorage full");}}
};

const SESSION_KEY="rk_session_v1";
const SESSION_DAYS=30;
const SESSION_AUTH_VERSION="v1";
function rkNow(){return Date.now();}
function rkSessionExpiry(){return rkNow()+SESSION_DAYS*24*60*60*1000;}
function rkReadSession(){
  const session=ST.get("session_v1",null)||ST.get("session",null);
  if(!session||!session.expiresAt)return null;
  if(Number(session.expiresAt)<=rkNow())return null;
  if(session.authVersion&&session.authVersion!==SESSION_AUTH_VERSION)return null;
  return session;
}
function rkWriteSession(profile={}){
  const playerId=String(profile.playerId||profile.player_id||ST.get("playerId","")||"").trim();
  const email=String(profile.email||"").trim().toLowerCase();
  if(!playerId||!email)return null;
  const session={
    playerId,
    email,
    nickname:profile.nickname||profile.name||"",
    club:profile.clubCode||profile.club_code||ST.get("clubCode",null)||null,
    avatar:profile.avatarUrl||profile.avatar_url||null,
    streak:Number(profile.streak||ST.get("str",0)||0),
    expiresAt:rkSessionExpiry(),
    authVersion:SESSION_AUTH_VERSION,
  };
  ST.set("session_v1",session);
  ST.set("isAuthenticated",true);
  ST.set("authPlayerId",playerId);
  return session;
}
function rkClearSession(){ST.set("session_v1",null);ST.set("isAuthenticated",false);ST.set("authPlayerId",null);}
function rkHasValidSession(){return !!rkReadSession();}
async function rkHydrateSessionFromSupabase(){
  const session=rkReadSession();
  if(!session?.email)return null;
  const remote=await fetchProfileByEmail(session.email);
  if(!remote)return null;
  const hydrated=await hydrateRemoteAccount(remote,{replaceLocal:true});
  if(hydrated?.profile)rkWriteSession(hydrated.profile);
  return hydrated;
}
function rkLogout(){rkClearSession();ST.set("profile",null);ST.set("authPlayerId",null);}

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
  {days:155,badge:"🏛️",title:"Club Fixture",desc:"155-day streak"},
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

const RATS=["Mahjong Master","Table Controller","Sharp Player","Table Ready","Reading the Rack","Feeling the Rack"];
const REMO=["🌟","🏆","💪","👏","👍","🎲"];
const RCOL=["#1B7D4E","#1B7D4E","#2460A8","#2460A8","#B08A35","#B83232"];
function gri(s){return s>=0.4?0:s>=0.3?1:s>=0.2?2:s>=0.12?3:s>=0.05?4:5;}
const F1C=[{dir:"Right",icon:"👉",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Left",icon:"👈",req:0,blind:true,max:3}];
const S2C=[{dir:"Left",icon:"👈",req:3,blind:false},{dir:"Over",icon:"↕️",req:3,blind:false},{dir:"Right",icon:"👉",req:0,blind:true,max:3}];

function addHist(e){
  const h=ST.get("hist",[]);
  h.push({...e,ts:Date.now()});
  ST.set("hist",h.slice(-100));
  const pid=currentLeaderboardPlayerId?.()||ST.get("playerId",null);
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
const SB_URL="https://kkyhrwryhebpnbbffmfq.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreWhyd3J5aGVicG5iYmZmbWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1OTM0MjAsImV4cCI6MjA5MzE2OTQyMH0.h_aEOEGfhh8h9iPGwkwzOzh6H7BCAefM6g20gW6IhWE";
const SB_HEADERS={"Content-Type":"application/json","apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`};
// ─── CLUBS, fetched from Supabase, falls back to seed ───────────────────────
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

// ─── STATS SYNC, push game history to Supabase ───────────────────────────────
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
      `${SB_URL}/rest/v1/game_history?player_id=eq.${encodeURIComponent(playerId)}&order=played_at.desc&limit=100`,
      {headers:SB_HEADERS}
    );
    if(!res.ok)return null;
    const rows=await res.json();
    return rows.map(r=>({
      ts:new Date(r.played_at).getTime(),
      mode:r.mode,sid:r.section_id,
      iqScore:r.iq_score,rating:r.rating,
      time:r.time_secs,gi:0,
      daySeed:r.day_seed||null,day_seed:r.day_seed||null,
    }));
  }catch{return null;}
}

function rkScoreFromResult(result){return Number(result?.iq?.totalScore??result?.iqScore??result?.totalScore??0)||0;}
function rkRatingFromResult(result){return result?.iq?.level||result?.rating||result?.level||null;}
function rkTimeFromResult(result){return Number(result?.time??result?.totalTime??result?.time_secs??0)||0;}
function rkDailyResultToLocal(row){
  if(!row)return null;
  const scorecard=row.scorecard_json&&typeof row.scorecard_json==="object"?row.scorecard_json:{};
  const base={
    ...scorecard,
    mode:"daily",
    daySeed:row.day_seed,
    day_seed:row.day_seed,
    ts:new Date(row.updated_at||row.created_at||Date.now()).getTime(),
  };
  if(!base.iq)base.iq={};
  if(row.iq_score&&!base.iq.totalScore)base.iq.totalScore=row.iq_score;
  if(row.rating&&!base.iq.level)base.iq.level=row.rating;
  if(row.time_secs&&!base.time)base.time=row.time_secs;
  return base;
}
async function upsertDailyResult(result,streakValue=ST.get("str",0)){
  const pid=currentLeaderboardPlayerId?.()||rkProfilePlayerId()||rkStoredPlayerId();
  if(!pid||!result)return false;
  const daySeed=result.daySeed||result.day_seed||getDailySeed();
  const body={
    player_id:pid,
    day_seed:daySeed,
    iq_score:rkScoreFromResult(result)||null,
    rating:rkRatingFromResult(result),
    time_secs:rkTimeFromResult(result)||null,
    streak:streakValue||ST.get("str",0)||0,
    club_code:rkCurrentClubCode?.()||getClubCode?.()||null,
    rack_json:result?.rack||result?.finalRack||result?.hand||null,
    scorecard_json:result,
    updated_at:new Date().toISOString(),
  };
  try{
    const res=await fetch(`${SB_URL}/rest/v1/daily_results`,{
      method:"POST",
      headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify(body),
    });
    if(!res.ok){
      console.warn("Daily result sync failed",res.status,await res.text().catch(()=>""));
      return false;
    }
    return true;
  }catch(err){console.warn("Daily result sync error",err);return false;}
}
async function pullDailyResult(playerId,daySeed=getDailySeed()){
  if(!playerId)return null;
  try{
    const res=await fetch(`${SB_URL}/rest/v1/daily_results?player_id=eq.${encodeURIComponent(playerId)}&day_seed=eq.${daySeed}&select=*&limit=1`,{headers:SB_HEADERS});
    if(!res.ok)return null;
    const rows=await res.json();
    return rkDailyResultToLocal(rows?.[0]);
  }catch{return null;}
}
function rkApplyRemoteProfileToStorage(remote){
  if(!remote?.playerId)return null;
  const restored={
    nickname:remote.nickname||remote.name||"",
    clubCode:remote.clubCode||remote.club_code||"",
    avatarUrl:remote.avatarUrl||remote.avatar_url||"",
    email:(remote.email||"").trim().toLowerCase(),
    playerId:remote.playerId||remote.player_id,
    streak:Number(remote.streak||0),
    roundsPlayed:Number(remote.roundsPlayed||remote.rounds_played||0),
    bestIQ:remote.bestIQ||remote.best_iq||null,
    passwordHash:remote.passwordHash||remote.password_hash||null,
  };
  setProfile(restored);
  ST.set("playerId",restored.playerId);
  ST.set("authPlayerId",restored.playerId);
  ST.set("isAuthenticated",!!restored.email);
  ST.set("lastSyncAt",Date.now());
  ST.set("str",restored.streak||0);
  ST.set("rnd",restored.roundsPlayed||0);
  if(restored.clubCode)setClubCode(restored.clubCode);
  else ST.set("clubCode",null);
  if(restored.nickname)setClubName(restored.nickname);
  if(restored.passwordHash)setStoredHash(restored.passwordHash);
  rkWriteSession(restored);
  return restored;
}
async function hydrateRemoteAccount(remote,{replaceLocal=true}={}){
  if(!remote?.playerId)return null;
  const restored=rkApplyRemoteProfileToStorage(remote);
  const [remoteHist,remoteDaily]=await Promise.all([
    pullGameHistory(remote.playerId),
    pullDailyResult(remote.playerId,getDailySeed()),
  ]);
  if(remoteHist){
    const localHist=replaceLocal?[]:(ST.get("hist",[])||[]);
    const byKey=new Map();
    [...localHist,...remoteHist].forEach((e,i)=>{
      const key=[e.mode||"free",e.daySeed||e.day_seed||"",e.ts||i,e.iqScore||""].join("|");
      byKey.set(key,e);
    });
    ST.set("hist",[...byKey.values()].sort((a,b)=>(a.ts||0)-(b.ts||0)).slice(-100));
  }
  if(remoteDaily){
    ST.set("dd",remoteDaily.daySeed||remoteDaily.day_seed||getDailySeed());
    ST.set("dres",remoteDaily);
    ST.set("hadFirstDaily",true);
  }
  return{profile:restored,history:remoteHist||[],dailyResult:remoteDaily};
}
async function rkHydrateStoredProfileFromSupabase(){
  const session=rkReadSession();
  const local=getProfile();
  const email=String(session?.email||local?.email||"").trim().toLowerCase();
  if(!email)return null;
  const remote=await fetchProfileByEmail(email);
  if(!remote)return null;
  const hydrated=await hydrateRemoteAccount(remote,{replaceLocal:true});
  if(hydrated?.profile)rkWriteSession(hydrated.profile);
  return hydrated;
}

function isClubDisplayName(name){
  const clean=String(name||"").trim().toLowerCase();
  if(!clean)return false;
  return Object.values(CLUBS||{}).some(c=>String(c?.name||"").trim().toLowerCase()===clean);
}
function getPlayerDisplayName(){
  const profile=ST.get("profile",null);
  const nick=String(profile?.nickname||profile?.name||"").trim();
  if(nick&&!isClubDisplayName(nick))return nick;
  const stored=ST.get("clubName",null);
  if(stored&&!isClubDisplayName(stored))return stored;
  return null;
}
function getClubName(){
  // Historical key: this stores the player's display name, not the club name.
  return getPlayerDisplayName();
}
function getAffiliatedClubName(code=getClubCode()){
  const cleanCode=String(code||"").trim();
  const club=cleanCode&&CLUBS?.[cleanCode];
  if(club?.name)return club.name;
  const profile=ST.get("profile",null)||{};
  const possible=String(profile?.clubName||profile?.club_name||profile?.club||"").trim();
  if(possible&&!isClubDisplayName(possible)){
    // Only use a stored free-text club label when it is not actually the player name.
    const playerName=getPlayerDisplayName();
    if(!playerName||rkNormText(possible)!==rkNormText(playerName))return possible;
  }
  return cleanCode&&cleanCode!=="__global__"?`Club ${cleanCode}`:null;
}
function setClubName(n){
  if(n&&isClubDisplayName(n))return;
  ST.set("clubName",n);
}
function getClubCode(){
  const stored=ST.get("clubCode",null);
  if(stored)return stored;
  const profile=ST.get("profile",null);
  if(profile?.clubCode){ST.set("clubCode",profile.clubCode);return profile.clubCode;}
  if(profile?.club_code){ST.set("clubCode",profile.club_code);return profile.club_code;}
  return null;
}
function setClubCode(c){ST.set("clubCode",c);}
function hashLeaderboardSeed(seed){
  const str=String(seed||"rackler");
  let h=0;
  for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;
  return 100+(h%900);
}
function rkNormText(v){return String(v||"").trim().toLowerCase();}
function rkDayBounds(){
  const start=new Date();
  start.setHours(0,0,0,0);
  const end=new Date(start);
  end.setDate(end.getDate()+1);
  return{start:start.toISOString(),end:end.toISOString()};
}
function rkRawProfile(){return ST.get("profile",null)||{};}
function rkProfilePlayerId(profile=rkRawProfile()){
  return String(profile?.playerId||profile?.player_id||"").trim();
}
function rkStoredPlayerId(){return String(ST.get("playerId","")||"").trim();}
function rkLocalPlayerIds(){
  return Array.from(new Set([rkProfilePlayerId(),rkStoredPlayerId()].filter(Boolean)));
}
function currentLeaderboardPlayerId(){
  const fromProfile=rkProfilePlayerId();
  if(fromProfile){ST.set("playerId",fromProfile);return fromProfile;}
  return getOrCreatePlayerId();
}
function rkSeedFromRow(row,index=0){
  return [row?.id,row?.player_id,row?.name,row?.club_code,row?.day_seed,row?.iq_score,row?.time_secs,row?.updated_at,row?.created_at,row?.played_at,index]
    .filter(v=>v!==undefined&&v!==null&&String(v).trim()!=="")
    .join("|");
}
function rkLooksGeneratedPlayerName(name){return /^player\s*\d+$/i.test(String(name||"").trim());}
function rkSafePlayerName(name,seed,index=0){
  const raw=String(name||"").trim();
  if(raw&&!isClubDisplayName(raw))return raw;
  return `Player ${hashLeaderboardSeed(seed||index)}`;
}
function rkLocalDisplayName(){
  const profile=rkRawProfile();
  const nick=String(profile?.nickname||profile?.name||"").trim();
  if(nick&&!isClubDisplayName(nick))return nick;
  const stored=String(ST.get("clubName","")||"").trim();
  if(stored&&!isClubDisplayName(stored))return stored;
  return null;
}
function rkCurrentDisplayName(){
  return rkLocalDisplayName()||getPlayerDisplayName?.()||getOrCreateAnonymousName();
}
function rkCurrentClubCode(){
  const p=rkRawProfile();
  return p?.club_code||p?.clubCode||getClubCode()||null;
}
function rkEntryMatchesCurrentPlayer(entry,scoreHint=null){
  if(!entry)return false;
  const ids=rkLocalPlayerIds();
  const entryId=String(entry.playerId||entry.player_id||"").trim();
  if(entryId&&ids.includes(entryId))return true;
  const currentName=rkCurrentDisplayName();
  const entryName=String(entry.name||entry.player_name||entry.nickname||"").trim();
  if(currentName&&entryName&&rkNormText(currentName)===rkNormText(entryName))return true;

  // Legacy anonymous row fallback: generated player name, same club, same score.
  // If scoreHint is not provided, use today's latest local Daily score.
  const localDailyScore=Number(scoreHint??rkLatestLocalDailyScore()?.iqScore??0);
  if(rkLooksGeneratedPlayerName(entryName)&&localDailyScore>0){
    const entryScore=Number(entry.iqScore??entry.iq_score??entry.score??0);
    const entryCode=String(entry.clubCode||entry.club_code||"__global__");
    const localCode=String(rkCurrentClubCode()||"__global__");
    const clubMatches=entryCode===localCode||(entryCode==="__global__"&&!rkCurrentClubCode());
    if(clubMatches&&Number.isFinite(entryScore)&&entryScore===localDailyScore)return true;
  }
  return false;
}
function rkNormalizeCurrentEntry(entry,scoreHint=null){
  if(!entry)return entry;
  if(!rkEntryMatchesCurrentPlayer(entry,scoreHint))return entry;
  return{
    ...entry,
    name:rkCurrentDisplayName(),
    playerId:currentLeaderboardPlayerId(),
    player_id:currentLeaderboardPlayerId(),
    clubCode:rkCurrentClubCode()||entry.clubCode||entry.club_code||null,
    club_code:rkCurrentClubCode()||entry.clubCode||entry.club_code||null,
  };
}
function rkSortLeaderboardEntries(entries=[]){
  return [...(entries||[])]
    .filter(e=>e&&Number.isFinite(Number(e.iqScore??e.iq_score??0))&&Number(e.iqScore??e.iq_score??0)>0)
    .sort((a,b)=>(Number(b.iqScore??b.iq_score)||0)-(Number(a.iqScore??a.iq_score)||0)||((Number(a.time??a.time_secs)||99999)-(Number(b.time??b.time_secs)||99999)));
}
function rkMergeCurrentScore(entries=[],score,time=0,streak=0,clubCode=null){
  const scoreNum=Number(score||0);
  let found=false;
  const normalized=(entries||[]).map(e=>{
    if(rkEntryMatchesCurrentPlayer(e,scoreNum)){
      found=true;
      const current=rkNormalizeCurrentEntry(e,scoreNum);
      return{...current,iqScore:Number(current.iqScore??current.iq_score??scoreNum)||scoreNum,time:Number(current.time??current.time_secs??time)||time,streak:Number(current.streak??streak)||streak,clubCode:clubCode||current.clubCode||current.club_code||null};
    }
    return e;
  });
  if(scoreNum>0&&!found){
    normalized.push({name:rkCurrentDisplayName(),iqScore:scoreNum,time:time||0,streak:streak||0,ts:Date.now(),playerId:currentLeaderboardPlayerId(),clubCode:clubCode||rkCurrentClubCode()||null,optimistic:true});
  }
  const best=new Map();
  rkSortLeaderboardEntries(normalized).forEach((e,i)=>{
    const key=rkEntryMatchesCurrentPlayer(e,scoreNum)?`current:${currentLeaderboardPlayerId()}`:(e.playerId?`player:${e.playerId}`:e.name?`name:${rkNormText(e.name)}`:`guest:${i}`);
    if(!best.has(key))best.set(key,e);
  });
  return rkSortLeaderboardEntries([...best.values()]);
}
function rkRankOfCurrent(entries=[],scoreHint=null){
  const idx=(entries||[]).findIndex(e=>rkEntryMatchesCurrentPlayer(e,scoreHint));
  if(idx>=0)return idx+1;
  const score=Number(scoreHint||0);
  if(score>0)return (entries||[]).filter(e=>Number(e.iqScore??e.iq_score??0)>score).length+1;
  return null;
}
function rkFirstNonEmpty(...values){
  for(const value of values){
    const clean=String(value||"").trim();
    if(clean)return clean;
  }
  return "";
}
function rkProfileName(profile,index=0){
  const name=rkFirstNonEmpty(
    profile?.nickname,
    profile?.name,
    profile?.full_name,
    profile?.display_name,
    profile?.username,
    profile?.email?String(profile.email).split("@")[0]:""
  );
  return rkSafePlayerName(name,profile?.player_id||profile?.playerId,index);
}
function rkProfilesById(rows=[]){
  const map=new Map();
  (rows||[]).forEach((p,i)=>{
    const id=String(p?.player_id||p?.playerId||"").trim();
    if(!id)return;
    const nickname=rkProfileName(p,i);
    map.set(id,{
      ...p,
      player_id:id,
      nickname,
      name:nickname,
      club_code:p?.club_code||p?.clubCode||null
    });
  });
  // Always inject the local profile so the current player never becomes Player ### on their own device.
  const localProfile=rkRawProfile();
  const localId=rkProfilePlayerId(localProfile)||rkStoredPlayerId();
  const localName=rkLocalDisplayName();
  if(localId&&localName){
    map.set(localId,{...localProfile,player_id:localId,nickname:localName,name:localName,club_code:localProfile?.club_code||localProfile?.clubCode||getClubCode()||null,streak:localProfile?.streak||0});
  }
  return map;
}
function rkPostgrestTextIn(values=[]){
  return values
    .map(v=>String(v||"").trim())
    .filter(Boolean)
    .map(v=>`"${v.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}"`)
    .join(",");
}
async function fetchProfilesByIds(ids=[]){
  const clean=Array.from(new Set((ids||[]).map(v=>String(v||"").trim()).filter(Boolean)));
  if(!clean.length)return[];
  const profileSelect="player_id,nickname,club_code,streak";
  // Keep this separate so we can safely use richer profile schemas later without breaking older tables.
  const richProfileSelect="player_id,nickname,name,full_name,display_name,username,email,club_code,streak";
  try{
    const out=[];
    for(let i=0;i<clean.length;i+=60){
      const group=clean.slice(i,i+60);
      const chunk=rkPostgrestTextIn(group);
      let res=await fetch(`${SB_URL}/rest/v1/profiles?player_id=in.(${chunk})&select=${richProfileSelect}&limit=500`,{headers:SB_HEADERS});
      if(!res.ok){
        res=await fetch(`${SB_URL}/rest/v1/profiles?player_id=in.(${chunk})&select=${profileSelect}&limit=500`,{headers:SB_HEADERS});
      }
      if(res.ok){
        out.push(...await res.json());
      }else{
        // Fallback to one-at-a-time lookups. This protects the leaderboard if PostgREST
        // text IN syntax behaves differently across environments.
        for(const id of group){
          let one=await fetch(`${SB_URL}/rest/v1/profiles?player_id=eq.${encodeURIComponent(id)}&select=${richProfileSelect}&limit=1`,{headers:SB_HEADERS});
          if(!one.ok)one=await fetch(`${SB_URL}/rest/v1/profiles?player_id=eq.${encodeURIComponent(id)}&select=${profileSelect}&limit=1`,{headers:SB_HEADERS});
          if(one.ok)out.push(...await one.json());
        }
      }
    }
    return out;
  }catch(err){console.warn("Profile lookup failed:",err);return[];}
}
async function fetchProfilesForClub(code){
  if(!code)return[];
  try{
    const profileSelect="player_id,nickname,club_code,streak";
    const richProfileSelect="player_id,nickname,name,full_name,display_name,username,email,club_code,streak";
    let res=await fetch(`${SB_URL}/rest/v1/profiles?club_code=eq.${encodeURIComponent(code)}&select=${richProfileSelect}&limit=500`,{headers:SB_HEADERS});
    if(!res.ok)res=await fetch(`${SB_URL}/rest/v1/profiles?club_code=eq.${encodeURIComponent(code)}&select=${profileSelect}&limit=500`,{headers:SB_HEADERS});
    if(!res.ok)return[];
    const rows=await res.json();
    const localProfile=rkRawProfile();
    const localId=rkProfilePlayerId(localProfile)||rkStoredPlayerId();
    const localName=rkLocalDisplayName();
    const localCode=localProfile?.club_code||localProfile?.clubCode||getClubCode();
    if(localId&&localName&&String(localCode||"")===String(code)&&!rows.some(r=>String(r.player_id)===localId)){
      rows.push({player_id:localId,nickname:localName,club_code:code,streak:localProfile?.streak||0});
    }
    return rows;
  }catch{return[];}
}
async function fetchLeaderboardRowsForSeed(seed=getDailySeed(),limit=1000){
  const urls=[`${SB_URL}/rest/v1/leaderboard?day_seed=eq.${seed}&order=iq_score.desc&limit=${limit}`];
  if(seed===getDailySeed()){
    const {start,end}=rkDayBounds();
    urls.push(`${SB_URL}/rest/v1/leaderboard?updated_at=gte.${encodeURIComponent(start)}&updated_at=lt.${encodeURIComponent(end)}&order=iq_score.desc&limit=${limit}`);
    urls.push(`${SB_URL}/rest/v1/leaderboard?created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&order=iq_score.desc&limit=${limit}`);
  }
  const out=[];
  for(const url of urls){
    try{
      const res=await fetch(url,{headers:SB_HEADERS});
      if(res.ok){
        const rows=await res.json();
        if(Array.isArray(rows))out.push(...rows);
      }
    }catch{}
  }
  return out;
}
async function fetchTodayGameHistoryRows(seed=getDailySeed()){
  const urls=[`${SB_URL}/rest/v1/game_history?day_seed=eq.${seed}&mode=eq.daily&select=player_id,iq_score,time_secs,played_at,day_seed,mode&order=iq_score.desc&limit=1000`];
  if(seed===getDailySeed()){
    const {start,end}=rkDayBounds();
    urls.push(`${SB_URL}/rest/v1/game_history?played_at=gte.${encodeURIComponent(start)}&played_at=lt.${encodeURIComponent(end)}&mode=eq.daily&select=player_id,iq_score,time_secs,played_at,day_seed,mode&order=iq_score.desc&limit=1000`);
  }
  const out=[];
  for(const url of urls){
    try{
      const res=await fetch(url,{headers:SB_HEADERS});
      if(res.ok){
        const rows=await res.json();
        if(Array.isArray(rows))out.push(...rows);
      }
    }catch{}
  }
  return out;
}
function historyRowsToLeaderboardRows(historyRows=[],profileRows=[]){
  const profiles=rkProfilesById(profileRows);
  return (historyRows||[])
    .filter(h=>h&&h.player_id&&Number(h.iq_score||0)>0)
    .map((h,index)=>{
      const pid=String(h.player_id||"").trim();
      const profile=profiles.get(pid);
      return{
        id:`history-${pid}-${h.day_seed||getDailySeed()}-${index}`,
        player_id:pid,
        name:rkSafePlayerName(profile?.nickname,pid,index),
        club_code:profile?.club_code||"__global__",
        day_seed:h.day_seed||getDailySeed(),
        iq_score:Number(h.iq_score||0),
        time_secs:Number(h.time_secs||0),
        streak:Number(profile?.streak||0),
        updated_at:h.played_at||new Date().toISOString(),
        _source:"game_history",
      };
    });
}

function rkRepairLeaderboardRowsWithHistory(leaderboardRows=[],historyRows=[],profileRows=[]){
  const profiles=rkProfilesById(profileRows);
  const candidates=(historyRows||[])
    .map((h,index)=>{
      const pid=String(h?.player_id||"").trim();
      const profile=pid?profiles.get(pid):null;
      const name=rkSafePlayerName(profile?.nickname||profile?.name,pid,index);
      const score=Number(h?.iq_score||0);
      if(!pid||!score||!name||rkLooksGeneratedPlayerName(name)||isClubDisplayName(name))return null;
      return{
        player_id:pid,
        name,
        club_code:profile?.club_code||"__global__",
        iq_score:score,
        time_secs:Number(h?.time_secs||0)||0,
        updated_at:h?.played_at||null,
      };
    })
    .filter(Boolean);

  if(!candidates.length)return leaderboardRows||[];

  return (leaderboardRows||[]).map((row,index)=>{
    const rawName=String(row?.name||"").trim();
    const alreadyGood=rawName&&!rkLooksGeneratedPlayerName(rawName)&&!isClubDisplayName(rawName);
    const hasPlayerId=String(row?.player_id||"").trim();
    if(alreadyGood&&hasPlayerId)return row;

    const rowScore=Number(row?.iq_score??row?.iqScore??0);
    const rowTime=Number(row?.time_secs??row?.time??0)||0;
    const rowCode=String(row?.club_code||"__global__");

    const match=candidates.find(c=>{
      if(Number(c.iq_score)!==rowScore)return false;
      const clubOk=!rowCode||rowCode==="__global__"||rowCode===String(c.club_code||"__global__");
      if(!clubOk)return false;
      if(!rowTime||!c.time_secs)return true;
      return Math.abs(Number(rowTime)-Number(c.time_secs))<=3;
    });

    if(!match)return row;
    return{
      ...row,
      player_id:row.player_id||match.player_id,
      name:alreadyGood?rawName:match.name,
      club_code:row.club_code||match.club_code||"__global__",
      _repairedFromHistory:true,
    };
  });
}
function rkLatestLocalDailyScore(){
  const seed=getDailySeed();
  const hist=ST.get("hist",[])||[];
  for(let i=hist.length-1;i>=0;i--){
    const e=hist[i]||{};
    if(e.mode!=="daily")continue;
    const d=new Date(e.ts||Date.now());
    const s=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    if(s===seed&&Number(e.iqScore||0)>0)return{iqScore:Number(e.iqScore||0),time:Number(e.time||0)};
  }
  return null;
}
function rkIsLikelyCurrentLocalRow(row){
  const localName=rkLocalDisplayName();
  const pid=String(row?.player_id||row?.playerId||"").trim();
  const localIds=rkLocalPlayerIds();
  if(pid&&localIds.includes(pid))return true;
  const raw=String(row?.name||row?.player_name||row?.nickname||"").trim();
  if(localName&&raw&&rkNormText(raw)===rkNormText(localName))return true;

  // Repair legacy rows created before the profile identity fix.
  // Older rows can have a stale player_id and a generated name like "Player 701".
  // If the row matches today's local daily score and club, treat it as the current player
  // so the UI can show the real profile name and calculate rank correctly.
  if(!rkLooksGeneratedPlayerName(raw))return false;
  const code=String(row?.club_code||"__global__");
  const localCode=String(getClubCode()||"__global__");
  if(code&&code!==localCode&&!(code==="__global__"&&!getClubCode()))return false;
  const daily=rkLatestLocalDailyScore();
  if(!daily)return false;
  const score=Number(row?.iq_score??row?.iqScore??row?.score??0);
  return Number.isFinite(score)&&score===Number(daily.iqScore||0);
}
function normalizeLeaderboardRow(row,index=0,profileMap=null){
  if(!row)return null;
  let playerId=String(row.player_id||row.playerId||"").trim();
  const localIds=rkLocalPlayerIds();
  const isLocal=(playerId&&localIds.includes(playerId))||rkIsLikelyCurrentLocalRow(row);
  if(isLocal)playerId=currentLeaderboardPlayerId();
  const profile=playerId&&profileMap?.get?profileMap.get(playerId):null;
  const rawName=String(row.name||row.player_name||row.nickname||"").trim();
  const localName=rkLocalDisplayName();
  const displayName=isLocal&&localName
    ?localName
    :profile?.nickname&&!isClubDisplayName(profile.nickname)
      ?profile.nickname
      :rkSafePlayerName(rawName,playerId||rkSeedFromRow(row,index),index);
  const score=Number(row.iq_score??row.iqScore??row.score??0);
  if(!Number.isFinite(score)||score<=0)return null;
  const rowCode=row.club_code===null||row.club_code===undefined?null:String(row.club_code);
  const clubCode=(isLocal&&(rkRawProfile()?.club_code||rkRawProfile()?.clubCode||getClubCode()))||profile?.club_code||rowCode||"__global__";
  const updated=row.updated_at||row.played_at||row.created_at||new Date().toISOString();
  let key;
  if(isLocal)key=`local:${currentLeaderboardPlayerId()}`;
  else if(playerId)key=`player:${playerId}`;
  else if(rawName&&!isClubDisplayName(rawName)&&!rkLooksGeneratedPlayerName(rawName))key=`name:${rkNormText(rawName)}`;
  else if(row.id)key=`row:${row.id}`;
  else key=`guest:${hashLeaderboardSeed(rkSeedFromRow(row,index))}`;
  return{
    ...row,
    name:displayName,
    player_id:playerId||null,
    club_code:clubCode,
    iq_score:score,
    time_secs:Number(row.time_secs??row.time??0)||0,
    streak:Number(profile?.streak??row.streak??0)||0,
    updated_at:updated,
    _dedupeKey:key,
  };
}
function cleanLeaderboardRows(rows=[],profileRows=[]){
  const profileMap=rkProfilesById(profileRows);
  const best=new Map();
  (rows||[]).forEach((row,index)=>{
    const r=normalizeLeaderboardRow(row,index,profileMap);
    if(!r)return;
    const prev=best.get(r._dedupeKey);
    const score=Number(r.iq_score||0),prevScore=Number(prev?.iq_score||0);
    const time=Number(r.time_secs||99999),prevTime=Number(prev?.time_secs||99999);
    const ts=new Date(r.updated_at||r.played_at||0).getTime()||0;
    const prevTs=new Date(prev?.updated_at||prev?.played_at||0).getTime()||0;
    if(!prev||score>prevScore||(score===prevScore&&time<prevTime)||(score===prevScore&&time===prevTime&&ts>prevTs))best.set(r._dedupeKey,r);
  });
  return[...best.values()].sort((a,b)=>Number(b.iq_score||0)-Number(a.iq_score||0)||(Number(a.time_secs||99999)-Number(b.time_secs||99999)));
}
function rkRowToEntry(r){
  return{
    name:r.name,
    iqScore:Number(r.iq_score||0),
    time:Number(r.time_secs||0),
    streak:Number(r.streak||0),
    ts:new Date(r.updated_at||r.played_at||0).getTime()||0,
    playerId:r.player_id||null,
    clubCode:r.club_code==="__global__"?null:(r.club_code||null),
    created_at:r.created_at||r.updated_at||r.played_at||null,
  };
}
function normalizeLeaderboardEntries(rows=[],profileRows=[]){return cleanLeaderboardRows(rows,profileRows).map(rkRowToEntry);}
function rowBelongsToClub(row,code,profileMap=null){
  if(!row||!code)return false;
  const rowCode=String(row.club_code||"").trim();
  if(rowCode===String(code))return true;
  const pid=String(row.player_id||row.playerId||"").trim();
  if(pid&&profileMap?.get?.(pid)?.club_code===code)return true;
  if(rkIsLikelyCurrentLocalRow(row)&&String(getClubCode()||"")===String(code))return true;
  return false;
}
async function buildTodayRows(){
  const seed=getDailySeed();
  const [leaderboardRows,historyRows]=await Promise.all([
    fetchLeaderboardRowsForSeed(seed,1200),
    fetchTodayGameHistoryRows(seed),
  ]);
  const ids=Array.from(new Set([...(leaderboardRows||[]).map(r=>r.player_id),...(historyRows||[]).map(r=>r.player_id),...rkLocalPlayerIds()].filter(Boolean)));
  const profiles=await fetchProfilesByIds(ids);
  const repairedLeaderboardRows=rkRepairLeaderboardRowsWithHistory(leaderboardRows,historyRows,profiles);
  const historyAsRows=historyRowsToLeaderboardRows(historyRows,profiles);
  return{rows:[...(repairedLeaderboardRows||[]),...historyAsRows],profiles};
}
async function fetchGlobalEntries(){
  try{
    const {rows,profiles}=await buildTodayRows();
    return normalizeLeaderboardEntries(rows,profiles);
  }catch(err){console.warn("[GlobalLB] fetch error:",err);return[];}
}
async function fetchLBEntries(code){
  if(!code)return[];
  try{
    const [{rows,profiles},clubProfiles]=await Promise.all([buildTodayRows(),fetchProfilesForClub(code)]);
    const allProfiles=[...(profiles||[]),...(clubProfiles||[])];
    const profileMap=rkProfilesById(allProfiles);
    const clubRows=(rows||[]).filter(r=>rowBelongsToClub(r,code,profileMap));
    return normalizeLeaderboardEntries(clubRows,allProfiles);
  }catch(err){console.warn("Club leaderboard fetch error:",err);return[];}
}
async function fetchPeriodEntries(code,period){
  if(!code)return[];
  const view=`leaderboard_${period}`;
  try{
    const [allRes,clubProfiles]=await Promise.all([
      fetch(`${SB_URL}/rest/v1/${view}?order=iq_score.desc&limit=1000`,{headers:SB_HEADERS}),
      fetchProfilesForClub(code),
    ]);
    const allRows=allRes.ok?await allRes.json():[];
    const ids=Array.from(new Set([...(allRows||[]).map(r=>r.player_id),...rkLocalPlayerIds()].filter(Boolean)));
    const profiles=await fetchProfilesByIds(ids);
    const profileMap=rkProfilesById([...(profiles||[]),...(clubProfiles||[])]);
    const rows=(allRows||[]).filter(r=>rowBelongsToClub(r,code,profileMap));
    return normalizeLeaderboardEntries(rows,[...(profiles||[]),...(clubProfiles||[])]);
  }catch(err){console.warn("Period leaderboard fetch error:",err);return[];}
}
async function fetchYesterdayEntries(code){
  if(!code)return[];
  const d=new Date();d.setDate(d.getDate()-1);
  const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  try{
    const [leaderboardRows,historyRows,clubProfiles]=await Promise.all([
      fetchLeaderboardRowsForSeed(seed,1200),
      fetchTodayGameHistoryRows(seed),
      fetchProfilesForClub(code),
    ]);
    const ids=Array.from(new Set([...(leaderboardRows||[]).map(r=>r.player_id),...(historyRows||[]).map(r=>r.player_id),...rkLocalPlayerIds()].filter(Boolean)));
    const profiles=await fetchProfilesByIds(ids);
    const allProfiles=[...(profiles||[]),...(clubProfiles||[])];
    const profileMap=rkProfilesById(allProfiles);
    const rows=[...(leaderboardRows||[]),...historyRowsToLeaderboardRows(historyRows,allProfiles)].filter(r=>rowBelongsToClub(r,code,profileMap));
    return normalizeLeaderboardEntries(rows,allProfiles);
  }catch(err){console.warn("Yesterday leaderboard fetch error:",err);return[];}
}
async function fetchDailyStats(){
  const rows=await fetchGlobalEntries();
  return{count:rows.length,total:rows.length,topScore:rows[0]?.iqScore||null,max:rows[0]?.iqScore||null,rows};
}
async function deleteExistingOwnLeaderboardRows(body){
  const pid=String(body?.player_id||"").trim();
  if(!pid||!body?.club_code||!body?.day_seed)return;
  try{
    await fetch(`${SB_URL}/rest/v1/leaderboard?club_code=eq.${encodeURIComponent(body.club_code)}&day_seed=eq.${body.day_seed}&player_id=eq.${encodeURIComponent(pid)}`,{method:"DELETE",headers:SB_HEADERS});
  }catch{}
}
async function postLeaderboardRow(body){
  try{
    const clean={...body};
    clean.player_id=clean.player_id||currentLeaderboardPlayerId();
    clean.name=rkSafePlayerName(rkLocalDisplayName()||clean.name,clean.player_id);
    if(clean.name&&isClubDisplayName(clean.name)){
      clean.name=rkSafePlayerName(rkLocalDisplayName(),clean.player_id);
    }
    clean.updated_at=clean.updated_at||new Date().toISOString();
    await deleteExistingOwnLeaderboardRows(clean);
    const res=await fetch(`${SB_URL}/rest/v1/leaderboard`,{
      method:"POST",
      headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify(clean),
    });
    if(res.ok||res.status===201||res.status===204)return true;
    const text=await res.text().catch(()=>"");
    if(clean.player_id&&/player_id|schema cache|column/i.test(text)){
      const fallback={...clean};delete fallback.player_id;
      fallback.name=rkSafePlayerName(fallback.name||rkLocalDisplayName(),rkSeedFromRow(fallback));
      const retry=await fetch(`${SB_URL}/rest/v1/leaderboard`,{method:"POST",headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(fallback)});
      return retry.ok||retry.status===201||retry.status===204;
    }
    console.warn("Leaderboard post failed:",res.status,text);
    return false;
  }catch(err){console.warn("Leaderboard post error:",err);return false;}
}
async function upsertLBEntry(code,name,iqScore,time,streak,playerIdOverride=null){
  if(!code||!iqScore)return false;
  const pid=playerIdOverride||currentLeaderboardPlayerId();
  const profile=rkRawProfile();
  return postLeaderboardRow({
    club_code:code,
    day_seed:getDailySeed(),
    player_id:pid,
    name:rkSafePlayerName(rkLocalDisplayName()||name,pid),
    iq_score:iqScore,
    time_secs:time||0,
    streak:streak??profile?.streak??0,
    updated_at:new Date().toISOString(),
  });
}
async function upsertGlobalEntry(name,iqScore,time,streak,clubCode,playerIdOverride=null){
  if(!iqScore)return false;
  const pid=playerIdOverride||currentLeaderboardPlayerId();
  return postLeaderboardRow({
    club_code:clubCode||"__global__",
    day_seed:getDailySeed(),
    player_id:pid,
    name:rkSafePlayerName(rkLocalDisplayName()||name,pid),
    iq_score:iqScore,
    time_secs:time||0,
    streak:streak||0,
    updated_at:new Date().toISOString(),
  });
}
async function deleteLBEntry(code,name){
  try{
    const pid=currentLeaderboardPlayerId();
    if(pid)await fetch(`${SB_URL}/rest/v1/leaderboard?club_code=eq.${encodeURIComponent(code)}&day_seed=eq.${getDailySeed()}&player_id=eq.${encodeURIComponent(pid)}`,{method:"DELETE",headers:SB_HEADERS});
    if(name)await fetch(`${SB_URL}/rest/v1/leaderboard?club_code=eq.${encodeURIComponent(code)}&day_seed=eq.${getDailySeed()}&name=eq.${encodeURIComponent(name)}`,{method:"DELETE",headers:SB_HEADERS});
  }catch{}
}
function getOrCreateAnonymousName(){
  let n=ST.get("anonName",null);
  if(!n){n=`Player ${100+Math.floor(Math.random()*900)}`;ST.set("anonName",n);}
  return n;
}
function getClubShareKey(code){return `${getDailySeed()}-${code||"global"}`;}
function getLocalClubShareCount(code){
  const key=getClubShareKey(code);const map=ST.get("clubShareEvents",{});const ids=Array.isArray(map[key])?map[key]:[];return new Set(ids).size;
}
function markLocalClubShare(code,playerId){
  if(!code||!playerId)return 0;
  const key=getClubShareKey(code);const map=ST.get("clubShareEvents",{});const current=Array.isArray(map[key])?map[key]:[];
  const next=Array.from(new Set([...current,playerId]));ST.set("clubShareEvents",{...map,[key]:next});return next.length;
}
async function fetchClubShareCount(code){
  if(!code)return 0;
  const local=getLocalClubShareCount(code);
  try{
    const res=await fetch(`${SB_URL}/rest/v1/club_share_events?club_code=eq.${encodeURIComponent(code)}&day_seed=eq.${getDailySeed()}&select=player_id`,{headers:SB_HEADERS});
    if(!res.ok)return local;
    const rows=await res.json();
    return Math.max(local,new Set((rows||[]).map(r=>r.player_id).filter(Boolean)).size);
  }catch{return local;}
}
async function recordClubShare(code,playerName){
  if(!code)return 0;
  const playerId=getOrCreatePlayerId();
  const local=markLocalClubShare(code,playerId);
  try{
    await fetch(`${SB_URL}/rest/v1/club_share_events`,{method:"POST",headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({club_code:code,day_seed:getDailySeed(),player_id:playerId,player_name:playerName||"Rackler",shared_at:new Date().toISOString()})});
  }catch{}
  return Math.max(local,await fetchClubShareCount(code));
}
function pluralizeClubMembers(n,verb){
  const safe=Math.max(0,Number(n)||0);
  if(safe===0)return verb==="played"?"Be the first club score today":"No club shares yet";
  return `${safe} club member${safe===1?"":"s"} ${verb} today`;
}

// ─── PROFILE SYSTEM ───────────────────────────────────────────────────────────

async function rkPatchRowsForIdentityMigration({fromPlayerId,toPlayerId,name,clubCode}){
  const fromId=String(fromPlayerId||"").trim();
  const toId=String(toPlayerId||"").trim();
  const displayName=String(name||"").trim();
  if(!toId||!displayName)return false;
  const patchBody={
    player_id:toId,
    name:displayName,
    updated_at:new Date().toISOString(),
  };
  if(clubCode)patchBody.club_code=clubCode;
  const daySeed=getDailySeed();
  const urls=[];
  if(fromId&&fromId!==toId){
    urls.push(`${SB_URL}/rest/v1/leaderboard?player_id=eq.${encodeURIComponent(fromId)}`);
    urls.push(`${SB_URL}/rest/v1/game_history?player_id=eq.${encodeURIComponent(fromId)}`);
  }
  // Also repair today's legacy generated rows that match this device's Daily score.
  const localDaily=rkLatestLocalDailyScore?.();
  if(localDaily?.iqScore){
    const code=clubCode||getClubCode?.()||"__global__";
    urls.push(`${SB_URL}/rest/v1/leaderboard?day_seed=eq.${daySeed}&club_code=eq.${encodeURIComponent(code)}&iq_score=eq.${Number(localDaily.iqScore)}`);
    if(code!=="__global__")urls.push(`${SB_URL}/rest/v1/leaderboard?day_seed=eq.${daySeed}&club_code=eq.__global__&iq_score=eq.${Number(localDaily.iqScore)}`);
  }
  let ok=false;
  for(const url of Array.from(new Set(urls))){
    try{
      const body=url.includes('/game_history?')
        ? {player_id:toId}
        : patchBody;
      const res=await fetch(url,{method:"PATCH",headers:{...SB_HEADERS,"Prefer":"return=minimal"},body:JSON.stringify(body)});
      if(res.ok||res.status===204)ok=true;
    }catch(err){console.warn("Identity migration patch failed:",err);}
  }
  return ok;
}

async function rkAdoptRemoteProfile(remote,previousLocalId=null){
  if(!remote?.playerId)return null;
  const restored=rkApplyRemoteProfileToStorage(remote);
  await rkPatchRowsForIdentityMigration({
    fromPlayerId:previousLocalId,
    toPlayerId:remote.playerId,
    name:restored.nickname,
    clubCode:restored.clubCode||getClubCode?.()||null,
  });
  return restored;
}

async function rkSyncLocalProfileToSupabase(reason="app_load"){
  const profile=rkRawProfile();
  const name=String(profile?.nickname||profile?.name||"").trim();
  if(!name||isClubDisplayName(name))return false;

  const previousLocalId=rkStoredPlayerId();
  const pid=rkProfilePlayerId(profile)||previousLocalId||createGuestPlayerId();
  const clubCode=profile?.clubCode||profile?.club_code||getClubCode()||null;
  const syncedProfile={
    ...profile,
    playerId:pid,
    nickname:name,
    email:profile?.email?String(profile.email).trim().toLowerCase():profile?.email,
    clubCode:clubCode||"",
    streak:profile?.streak??ST.get("str",0)??0,
    roundsPlayed:profile?.roundsPlayed??ST.get("rnd",0)??0,
    bestIQ:profile?.bestIQ??getBestIQ?.()?.score??null,
  };

  setProfile(syncedProfile);
  ST.set("playerId",pid);
  if(clubCode)setClubCode(clubCode);
  setClubName(name);

  const ok=await upsertProfile(syncedProfile);
  await rkPatchRowsForIdentityMigration({
    fromPlayerId:previousLocalId&&previousLocalId!==pid?previousLocalId:null,
    toPlayerId:pid,
    name,
    clubCode,
  });
  return ok;
}

function getProfile(){return ST.get("profile",null);}
function setProfile(p){ST.set("profile",p);}

// Upsert profile to Supabase, single source of truth for all profile writes
async function upsertProfile(profile){
  try{
    const body={
      player_id:profile.playerId,
      nickname:profile.nickname||profile.name||rkLocalDisplayName()||null,
      club_code:profile.clubCode||profile.club_code||getClubCode()||null,
      streak:profile.streak||0,
      rounds_played:profile.roundsPlayed||0,
      best_iq:profile.bestIQ||null,
      updated_at:new Date().toISOString(),
    };
    if(profile.passwordHash!==undefined)body.password_hash=profile.passwordHash;
    if(profile.avatarUrl!==undefined)body.avatar_url=profile.avatarUrl;
    if(profile.email!==undefined)body.email=String(profile.email||"").trim().toLowerCase();
    const res=await fetch(`${SB_URL}/rest/v1/profiles`,{
      method:"POST",
      headers:{...SB_HEADERS,"Prefer":"resolution=merge-duplicates"},
      body:JSON.stringify(body),
    });
    return res.ok||res.status===201;
  }catch{return false;}
}

// Generate a stable guest ID only when the app is truly in guest mode.
// Registered users should be hydrated from Supabase first.
function createGuestPlayerId(){
  let id=ST.get("playerId",null);
  if(!id){id="G"+Math.random().toString(36).slice(2,10).toUpperCase();ST.set("playerId",id);}
  return id;
}
function getOrCreatePlayerId(){
  const profile=rkRawProfile?.()||{};
  const registeredId=rkProfilePlayerId?.(profile)||ST.get("authPlayerId",null);
  if(registeredId){ST.set("playerId",registeredId);return registeredId;}
  return createGuestPlayerId();
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

function mapRemoteProfileRow(r){
  if(!r)return null;
  return{
    playerId:r.player_id,nickname:r.nickname,clubCode:r.club_code||"",
    avatarUrl:r.avatar_url||"",email:r.email||"",
    streak:r.streak||0,roundsPlayed:r.rounds_played||0,
    bestIQ:r.best_iq||null,passwordHash:r.password_hash||null,
  };
}

// Fetch full profile row by email, used for cross-device login.
// Uses case-insensitive lookup so saved emails like Ash@Email.com still work.
async function fetchProfileByEmail(email){
  try{
    const clean=(email||"").trim();
    if(!clean)return null;
    const encoded=encodeURIComponent(clean);
    const lower=encodeURIComponent(clean.toLowerCase());
    const queries=[
      `${SB_URL}/rest/v1/profiles?email=eq.${encoded}&select=*&limit=1`,
      `${SB_URL}/rest/v1/profiles?email=eq.${lower}&select=*&limit=1`,
      `${SB_URL}/rest/v1/profiles?email=ilike.${encoded}&select=*&limit=1`,
    ];
    for(const url of queries){
      const res=await fetch(url,{headers:SB_HEADERS});
      if(!res.ok)continue;
      const rows=await res.json();
      if(rows&&rows.length)return mapRemoteProfileRow(rows[0]);
    }
    return null;
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
    if(hasProfile||rkHasValidSession())return"view";
    const goto=sessionStorage.getItem("rk-goto");
    if(goto==="signin"){sessionStorage.removeItem("rk-goto");return"signin";}
    return"setup";
  });
  const [authHydrating,setAuthHydrating]=useState(()=>rkHasValidSession()&&!hasProfile);
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

  useEffect(()=>{
    let alive=true;
    if(!authHydrating)return()=>{alive=false};
    (async()=>{
      const hydrated=await rkHydrateSessionFromSupabase().catch(()=>null);
      if(!alive)return;
      if(hydrated?.profile){
        setProfileState(hydrated.profile);
        setMode("view");
        setUnlocked(true);
      }
      setAuthHydrating(false);
    })();
    return()=>{alive=false};
  },[authHydrating]);

  if(authHydrating){
    return(
      <div className="rk-pg" style={{...S.pg,paddingTop:18}}>
        <RackleHeader onBack={home} setScreen={setScreen}/>
        <div className="rk-premium-card" style={{padding:22,textAlign:"center"}}>
          <div style={{width:46,height:46,borderRadius:18,margin:"0 auto 12px",background:"rgba(23,107,66,.08)",border:"1px solid rgba(23,107,66,.10)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:20,fontWeight:950,color:C.ink,letterSpacing:-.4}}>Welcome back</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.55,marginTop:6,fontWeight:750}}>Restoring your Rackle account...</div>
        </div>
      </div>
    );
  }

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
    const cleanEmail=(profile.email||"").trim().toLowerCase();
    setSaving(true);
    const previousLocalId=ST.get("playerId",null);
    const existingRemote=cleanEmail?await fetchProfileByEmail(cleanEmail):null;
    const currentProfileId=rkProfilePlayerId(profile)||rkProfilePlayerId(existingProfile)||previousLocalId||null;
    if(existingRemote?.playerId&&currentProfileId&&existingRemote.playerId!==currentProfileId){
      setSaving(false);
      setPwErr("That email already has a Rackle account. Log in instead.");
      setMode("signin");
      return;
    }
    if(existingRemote?.playerId&&!currentProfileId){
      setSaving(false);
      setPwErr("That email already has a Rackle account. Log in instead.");
      setMode("signin");
      return;
    }
    const pid=existingRemote?.playerId||currentProfileId||createGuestPlayerId();
    let pwHash=getStoredHash()||existingRemote?.passwordHash||null;
    if(pw){pwHash=await hashPassword(pw);setStoredHash(pwHash);}
    const p={...profile,playerId:pid,nickname:composedName,email:cleanEmail,streak,roundsPlayed:rounds,bestIQ:bestIQ?.score||null};
    setProfile(p);setProfileState(p);
    if(p.clubCode)setClubCode(p.clubCode);else setClubCode(null);
    if(p.nickname)setClubName(p.nickname);
    await upsertProfile({...p,passwordHash:pwHash});
    rkWriteSession({...p,passwordHash:pwHash});
    await rkPatchRowsForIdentityMigration({fromPlayerId:previousLocalId&&previousLocalId!==pid?previousLocalId:null,toPlayerId:p.playerId,name:p.nickname,clubCode:p.clubCode||null});
    setSaving(false);setMode("view");setUnlocked(true);
  };

  const tryLogin=async()=>{
    setPwErr("");
    const pid=rkProfilePlayerId(profile)||rkStoredPlayerId();
    const hash=await hashPassword(pwInput);
    let localHash=getStoredHash();
    if(!localHash&&pid){localHash=await fetchPasswordHash(pid);if(localHash)setStoredHash(localHash);}
    if(hash===localHash){setUnlocked(true);setMode("view");setPwInput("");}
    else{setPwErr("Incorrect password. Try again.");}
  };

  const signIn=async()=>{
    setLoginErr("");
    if(!loginEmail.trim()||!loginPw){setLoginErr("Please enter your email and password.");return;}
    setLoginLoading(true);
    const cleanEmail=loginEmail.trim().toLowerCase();
    let remote=await fetchProfileByEmail(cleanEmail);
    const hash=await hashPassword(loginPw);

    // Same-device fallback for profiles created before email syncing was added.
    // If the local profile email matches and the password hash matches, let the player in.
    const localProfile=getProfile();
    const localHash=getStoredHash();
    if(!remote&&localProfile?.email?.trim().toLowerCase()===cleanEmail&&localHash&&hash===localHash){
      setUnlocked(true);setMode("view");setLoginEmail("");setLoginPw("");setLoginLoading(false);return;
    }

    if(!remote){setLoginErr("No account found with that email. Check the spelling or create a profile first.");setLoginLoading(false);return;}
    if(!remote.passwordHash){setLoginErr("This profile needs a password reset before you can log in on this device.");setLoginLoading(false);return;}
    if(hash!==remote.passwordHash){setLoginErr("Incorrect password. Try again.");setLoginLoading(false);return;}
    // Restore profile locally and migrate any anonymous/local rows to the registered identity.
    const previousLocalId=ST.get("playerId",null);
    const restored=await rkAdoptRemoteProfile(remote,previousLocalId);
    const hydrated=await hydrateRemoteAccount(remote,{replaceLocal:true});
    setProfileState(hydrated?.profile||restored);
    rkWriteSession(hydrated?.profile||restored||remote);
    setStoredHash(remote.passwordHash);
    window.dispatchEvent(new Event("rackle:remoteHydrated"));
    setUnlocked(true);setMode("view");
    setLoginEmail("");setLoginPw("");
    setLoginLoading(false);
  };

  const handlePhotoChange=async(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>5*1024*1024){setPwErr("Photo must be under 5 MB.");return;}
    setUploadingPhoto(true);
    const pid=rkProfilePlayerId(profile)||rkStoredPlayerId()||createGuestPlayerId();
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
    const text=`🀄 Play Rackle with me, the daily Charleston workout for American Mahjong!\n\nJoin ${club?club.name:"our club"} on the leaderboard:\n${url}${code?"\n\nYour club is pre-filled, just tap and join!":""}`;
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
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Email <span style={{color:C.mut,fontWeight:400}}>(private, for account recovery)</span></div>
            <input type="email" value={profile.email||""} onChange={e=>setProfileState(p=>({...p,email:e.target.value}))} placeholder="your@email.com" style={{...inputStyle,border:`1.5px solid ${profile.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)?C.cinn:C.bdr}`}}/>
            {profile.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)&&<div style={{fontSize:10,color:C.cinn,marginTop:4}}>Enter a valid email address.</div>}
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:C.mut,fontWeight:600,marginBottom:5}}>Your Club</div>
            <select value={profile.clubCode} onChange={e=>setProfileState(p=>({...p,clubCode:e.target.value}))} style={{...inputStyle}}>
              <option value="">No club yet</option>
              {Object.entries(CLUBS).map(([code,club])=>(<option key={code} value={code}>{club.name}, {club.location}</option>))}
            </select>
          </div>
          <div style={{height:1,background:C.bdr,margin:"14px 0"}}/>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>SET A PASSWORD</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.5,marginBottom:10}}>At least 6 characters. Stored securely, lets you log in on any device.</div>
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

  // ── SIGN IN, existing account, new device ────────────────────────────────
  if(mode==="signin"){
    const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail);
    return(
      <div style={S.pg} className="rk-pg">
        <RackleHeader onBack={home} setScreen={setScreen}/>
        <div style={{textAlign:"center",padding:"24px 0 16px"}}>
          <div style={{fontSize:36,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,marginBottom:6}}>Welcome back, Rackler</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.6}}>Pick up where you left off, your streak, score history, and club ranking are waiting.</div>
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
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>BEST SCORE</div>
          </div></>}
          {avgIQ&&<><div style={{width:1,background:"rgba(255,255,255,0.08)"}}/>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.gilt}}>{avgIQ}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginTop:2}}>AVG SCORE</div>
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
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>AVG SCORE</div>
          </div>}
          {bestIQ&&<div className="rk-recap-metric" style={{color:C.gold}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.gold}}>{bestIQ.score}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>BEST SCORE</div>
          </div>}
          <div className="rk-recap-metric" style={{color:C.cinn}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.cinn}}>{streak}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>STREAK</div>
          </div>
        </div>
        <button onClick={()=>setScreen("stats")} style={{width:"100%",background:"none",border:`1px solid ${C.bdr}`,borderRadius:10,padding:"8px 12px",fontSize:12,color:C.jade,cursor:"pointer",fontWeight:600,textAlign:"center"}}>View Full Stats & Progress →</button>
      </div>}

      <div style={{...S.card,marginBottom:8,background:C.jade+"06",borderColor:C.jade+"25"}}>
        <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:8}}>INVITE FRIENDS TO RACKLE</div>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.6,marginBottom:10}}>
          {profile.clubCode?<>Challenge your club, share code <strong>{profile.clubCode}</strong> and get everyone on the leaderboard.</>:"Share Rackle with your mahjong friends and build your club community."}
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
          <span style={{fontSize:13,fontWeight:700,color:C.ink}}>{profile.email||","}</span>
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

// Personal best score, scans history for highest iqScore
function getBestIQ(){
  const h=getHist();
  if(!h.length)return null;
  const entries=h.filter(e=>e.iqScore!=null);
  if(!entries.length)return null;
  const best=entries.reduce((a,b)=>b.iqScore>a.iqScore?b:a);
  const daysAgo=Math.floor((Date.now()-best.ts)/86400000);
  return{score:best.iqScore,daysAgo,ts:best.ts};
}

// Nudge, shown after noon if daily not done and user has played before
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
  const isJoker=t.t==="j";
  const isFlower=t.t==="f";
  const sz=large?{w:44,h:64,fs:19,fs2:8}:{w:37,h:54,fs:16,fs2:7};
  const baseBg=isJoker
    ?"linear-gradient(180deg,#FFF7E8,#EFE1C4)"
    :isNew
      ?"linear-gradient(180deg,#FFF9E8,#F4E8C9)"
      :"linear-gradient(180deg,#FFFDF8,#F4EFE5)";
  const selectedBg=isJoker
    ?"linear-gradient(180deg,#FFF4D8,#E8D09A)"
    :"linear-gradient(180deg,#FFFFFB,#F6F0E4)";
  const borderCol=sel?"rgba(27,125,78,.42)":isNew?"rgba(160,120,40,.34)":"rgba(26,20,16,.10)";
  const shadow=sel
    ?"0 7px 14px rgba(0,0,0,.12), 0 1px 0 rgba(255,255,255,.85) inset"
    :isNew
      ?"0 4px 10px rgba(160,120,40,.12), 0 1px 0 rgba(255,255,255,.85) inset"
      :"0 2px 5px rgba(26,20,16,.07), 0 1px 0 rgba(255,255,255,.85) inset";
  return(
  <div className="rk-mahjong-tile" onClick={onClick} role={onClick?"checkbox":undefined} aria-checked={onClick?sel:undefined}
    aria-label={onClick?`${sel?"Deselect":"Select"} ${tAria(t)}`:tAria(t)} tabIndex={onClick?0:undefined}
    onKeyDown={onClick?(e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();onClick();}})  :undefined}
    style={{width:sz.w,height:sz.h,borderRadius:10,cursor:onClick?"pointer":"default",userSelect:"none",
      background:sel?selectedBg:baseBg,
      border:`1px solid ${borderCol}`,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,position:"relative",overflow:"hidden",
      boxShadow:shadow,
      transform:sel?"translateY(-2px)":"translateY(0)",transition:"transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease",
      opacity:dim?0.38:1,outline:"none"}}>
    <span aria-hidden="true" style={{fontSize:sz.fs,fontWeight:900,color:isJoker?C.gold:c,lineHeight:1,fontFamily:F.d,letterSpacing:isJoker?-0.7:-0.3}}>{tL(t)}</span>
    <span aria-hidden="true" style={{fontSize:sz.fs2,color:isJoker?C.gold:c,opacity:isFlower?0.62:0.54,fontWeight:800,marginTop:2,letterSpacing:.4,textTransform:"uppercase"}}>{tS(t)}</span>
    {isJoker&&<div aria-hidden="true" style={{position:"absolute",inset:3,borderRadius:8,border:`1px solid ${C.gold}18`,pointerEvents:"none"}}/>}
    {isNew&&<div aria-hidden="true" style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:3,background:C.gold,boxShadow:`0 0 0 2px ${C.gold}12`}}/>}
    {sel&&<div aria-hidden="true" style={{position:"absolute",bottom:0,left:8,right:8,height:2,borderRadius:2,background:C.jade,opacity:.85}}/>}
  </div>);}

function RackSurface({children,style}){
  return(
    <div className="rk-rack-surface" style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",maxWidth:"100%",overflowX:"hidden",background:"linear-gradient(145deg,rgba(255,255,255,.50),rgba(237,231,218,.42))",border:`1px solid rgba(26,20,16,.075)`,borderRadius:20,padding:11,boxShadow:"inset 0 1px 0 rgba(255,255,255,.78),0 3px 13px rgba(26,20,16,.03)",...style}}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COACHING ENGINE, rack narrative, flexibility, expert read, identity
// Pure computation, no API, derived entirely from existing rack data.
// ═══════════════════════════════════════════════════════════════════════════

// ── 1. WHAT YOUR RACK WAS BECOMING ─────────────────────────────────────────
// Returns an array of structural narrative bullets describing the rack's shape.
function computeRackBecoming(finalRack, startingRack, chosenSec, passLog){
  const bullets=[];
  if(!finalRack||!finalRack.length)return bullets;

  const jk=finalRack.filter(t=>t.t==="j").length;
  const fl=finalRack.filter(t=>t.t==="f").length;
  const windCount=finalRack.filter(t=>t.t==="w").length;
  const dragonCount=finalRack.filter(t=>t.t==="d").length;
  const honorTotal=windCount+dragonCount;
  const numTiles=finalRack.filter(t=>t.t==="s").length;

  // Honor tile weight, check FIRST so W&D racks don't get a spurious suit label
  if(honorTotal>=6)bullets.push("Honor-heavy rack, Winds & Dragons direction was becoming very clear");
  else if(windCount>=4)bullets.push("Wind concentration, strong pull toward Winds & Dragons");
  else if(windCount>=3&&dragonCount>=2)bullets.push("Honor tiles building, W&D section momentum was forming");
  else if(honorTotal>=4)bullets.push("Meaningful honor presence, W&D worth considering");

  // Suit concentration, only meaningful when number tiles dominate the rack
  if(numTiles>=6){
    const sc={bam:0,crak:0,dot:0};
    finalRack.filter(t=>t.t==="s").forEach(t=>{sc[t.s]++;});
    const dominant=Object.entries(sc).sort((a,b)=>b[1]-a[1])[0];
    const dominantName={bam:"Bamboo",crak:"Character",dot:"Circle"}[dominant[0]];
    if(dominant[1]/numTiles>=0.6)bullets.push(`${dominantName}-heavy structure, your tiles were pulling toward one suit`);
    else if(dominant[1]/numTiles>=0.45)bullets.push(`Leaning ${dominantName}, some suit concentration forming, not yet locked in`);
  }

  // Number character, odd vs even
  const odds=finalRack.filter(t=>t.t==="s"&&t.n%2===1).length;
  const evens=finalRack.filter(t=>t.t==="s"&&t.n%2===0).length;
  if(odds+evens>=5){
    const ratio=odds/(odds+evens);
    if(ratio>=0.75)bullets.push("Odd-heavy rack, strong instinct toward odd-number sections");
    else if(ratio<=0.28)bullets.push("Even-heavy rack, pointing toward 2468 or multiples-of-3 territory");
    else if(odds+evens>=7)bullets.push("Mixed number parity, rack still had flexibility across odd and even sections");
  }

  // Pair/pung/kong structure
  const groups={};
  finalRack.forEach(t=>{
    const k=t.t==="s"?`s-${t.s}-${t.n}`:t.t==="w"?`w-${t.v}`:t.t==="d"?`d-${t.v}`:`f`;
    groups[k]=(groups[k]||0)+1;
  });
  const pairs=Object.values(groups).filter(v=>v===2).length;
  const pungs=Object.values(groups).filter(v=>v===3).length;
  const kongs=Object.values(groups).filter(v=>v>=4).length;
  if(kongs>=2)bullets.push("Deep group concentration, two or more kongs forming");
  else if(pungs>=2)bullets.push("Pung-rich structure, multiple groups of three building");
  else if(pairs>=4)bullets.push("Pair-based flexibility, rack was becoming pair-dense");
  else if(pairs>=2&&numTiles>=6)bullets.push("Early pair structure, good foundation, still wide open");

  // Joker situation
  if(jk>=3)bullets.push("Three jokers, exceptional wild-tile support for any open hand");
  else if(jk===2)bullets.push("Two jokers, strong support for pung or kong completion");
  else if(jk===1)bullets.push("One joker in hand, useful but commit carefully on where to use it");
  else if(chosenSec!=="sp"&&bullets.length<3)bullets.push("No jokers, rack needed natural group depth to compete");

  // Flowers
  if(fl>=3)bullets.push("Flower-rich deal, multiple sections could absorb them");
  else if(fl>=2)bullets.push("Two flowers, solid support for flower-inclusive hands");

  // CR window signal
  if(chosenSec==="cr"||(numTiles>=8&&!chosenSec)){
    const cw=crWindowScore(finalRack);
    if((cw.groupDepth||0)>=8)bullets.push("Consecutive Run depth, tight number window forming with multiple groups");
    else if((cw.groupDepth||0)>=4)bullets.push("Early run structure, a window was starting to form in your numbers");
  }

  // S&P signal
  if((chosenSec==="sp"||pairs>=5)&&jk===0&&pairs>=5){
    bullets.push("Pair-only potential, a Soap & Pairs path was visible");
  }

  return bullets.slice(0,5);
}

// ── 2. FLEXIBILITY SCORE ────────────────────────────────────────────────────
// Measures optionality preservation. Returns {label, color, desc, livePaths, score 0-100}.
function computeFlexibility(finalRack, allSections, passLog, startingRack){
  if(!finalRack||!allSections)return{label:"Unknown",color:C.mut,desc:"",livePaths:0,score:50};

  // Count sections with meaningful fit (>5% is a live path)
  const livePaths=allSections.filter(s=>s.score>0.05).length;
  const strongPaths=allSections.filter(s=>s.score>0.15).length;
  const topScore=allSections[0]?.score||0;
  const secondScore=allSections[1]?.score||0;
  const concentration=topScore>0?topScore/(topScore+secondScore+0.001):0;

  // Broken pairs reduce flexibility
  const bp=(passLog||[]).reduce((acc,p)=>{
    // count how many starting pairs were broken during passing
    return acc;
  },0);

  // Compute raw flexibility score
  let score=0;
  score+=Math.min(livePaths*12,40);      // live paths (max 40)
  score+=Math.min(strongPaths*10,30);    // strong paths (max 30)
  score+=concentration<0.6?20:concentration<0.75?12:concentration<0.9?5:0; // openness bonus
  // Pass quality modifies flexibility, passing strong tiles collapses options
  const weakPasses=(passLog||[]).filter(p=>(p.out||[]).some(t=>t.t==="j")).length;
  score-=weakPasses*8;
  score=Math.max(0,Math.min(100,Math.round(score)));

  let label,color,desc;
  if(score>=80){
    label="Elite";color=C.jade;
    desc="You preserved multiple live paths through the Charleston. Your rack can still evolve in several directions.";
  } else if(score>=60){
    label="Strong";color="#2460A8";
    desc="Your rack stayed adaptable while building structure. You have a clear direction but haven't closed off alternatives yet.";
  } else if(score>=38){
    label="Narrowing";color=C.gold;
    desc="Your passes committed you earlier than most players would prefer. Still playable, but pivoting now costs tiles.";
  } else {
    label="Locked-In";color=C.cinn;
    desc="Your rack became highly dependent on one outcome. Strong commitment has its place, but watch for the moments you overcommit.";
  }

  return{label,color,desc,livePaths,strongPaths,score};
}

// ── 3. EXPERT READ ──────────────────────────────────────────────────────────
// Full strategic Charleston evaluator.
// Returns rich structured read: primaryDirection, secondaryPaths, pivotPotential,
// flexibility, commitment, structuralStrength, deadnessRisk, observations[], expertInsight.
function computeExpertRead(finalRack, chosenSec, allSections, passLog, iq){
  if(iq?.strategicRead){
    const r=iq.strategicRead;
    const topName=r.bestDirection||"Still open";
    return{
      primaryDirection:`${r.commitmentStatus}: ${topName}. ${(r.whyItWorks||[])[0]||"Whole-rack structure reviewed."}`,
      secondaryPaths:(r.bestPaths||[]).slice(1,4).map(p=>`${p.section} · ${p.confidence} confidence. Support: ${(p.support||[]).join(", ")||"thin"}. Needs: ${(p.needs||[]).join(", ")||"more grouped strength"}.`),
      pivotPotential:r.componentScores?.flexibility>=70?"Strong":r.componentScores?.flexibility>=48?"Moderate":"Weak",
      flexibility:rkToneForScore(r.componentScores?.flexibility||0),
      commitment:r.commitmentStatus,
      structuralStrength:rkToneForScore(r.componentScores?.tileEfficiency||0),
      deadnessRisk:(r.dangerAreas||[]).some(x=>/miracle|disconnected|too thin|dead/i.test(x))?"Medium":"Low",
      observations:[...(r.whyItWorks||[]),...(r.patternStrengths||[])].slice(0,5),
      expertInsight:r.coachingInsight,
      sectionFitLabel:r.topSection?.status||"alive",
      sectionFitConfidence:r.topSection?.confidence||"Medium",
      chosenPct:r.chosenSection?.score||0,
      topPct:r.topSection?.score||0,
      sectionMatch:r.chosenSection?.id===r.topSection?.id,
      topSec:r.topSection,
      risk:(r.dangerAreas||[]).length?"Medium":"Low",
      bullets:[],
    };
  }
  if(!finalRack||!chosenSec)return null;

  // ── TILE INVENTORY ──────────────────────────────────────────────────────────
  const jk=finalRack.filter(t=>t.t==="j").length;
  const fl=finalRack.filter(t=>t.t==="f").length;
  const numTiles=finalRack.filter(t=>t.t==="s");
  const windTiles=finalRack.filter(t=>t.t==="w");
  const dragTiles=finalRack.filter(t=>t.t==="d");
  const allPassed=(passLog||[]).flatMap(p=>p.out||[]);
  const passedJokers=allPassed.filter(t=>t.t==="j").length;
  const passedFlowers=allPassed.filter(t=>t.t==="f").length;

  // Number counts per value and per suit
  const nc={};numTiles.forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
  const sc={bam:0,crak:0,dot:0};numTiles.forEach(t=>{sc[t.s]++;});
  const suitCounts=Object.entries(sc).sort((a,b)=>b[1]-a[1]);
  const dominantSuit=suitCounts[0]?.[0];
  const dominantSuitCount=suitCounts[0]?.[1]||0;
  const secondSuitCount=suitCounts[1]?.[1]||0;
  const thirdSuitCount=suitCounts[2]?.[1]||0;
  const totalNums=numTiles.length;
  const suitName={bam:"Bamboo",crak:"Character",dot:"Circle"};

  // Group analysis
  const groups={};
  finalRack.forEach(t=>{
    const k=t.t==="s"?`s-${t.s}-${t.n}`:t.t==="w"?`w-${t.v}`:t.t==="d"?`d-${t.v}`:`f`;
    groups[k]=(groups[k]||0)+1;
  });
  const pairKeys=Object.keys(groups).filter(k=>groups[k]===2);
  const pungKeys=Object.keys(groups).filter(k=>groups[k]===3);
  const kongKeys=Object.keys(groups).filter(k=>groups[k]>=4);
  const pairs=pairKeys.length;
  const pungs=pungKeys.length;
  const kongs=kongKeys.length;
  const isolatedTiles=Object.keys(groups).filter(k=>groups[k]===1&&!k.startsWith("f")).length;

  // Odd / even balance
  const odds=numTiles.filter(t=>t.n%2===1).length;
  const evens=numTiles.filter(t=>t.n%2===0).length;

  // Wind grouping
  const wc={};windTiles.forEach(t=>{wc[t.v]=(wc[t.v]||0)+1;});
  const windPairs=Object.values(wc).filter(v=>v>=2).length;
  const windPungs=Object.values(wc).filter(v=>v>=3).length;
  const honorTotal=windTiles.length+dragTiles.length;

  // Section scores
  const sortedSecs=(allSections||[]).slice().sort((a,b)=>b.score-a.score);
  const topSec=sortedSecs[0];
  const chosenFit=allSections?.find(s=>s.id===chosenSec);
  const chosenPct=Math.round((chosenFit?.score||0)*100);
  const topPct=Math.round((topSec?.score||0)*100);
  const sectionMatch=chosenSec===topSec?.id;
  const livePaths=(allSections||[]).filter(s=>s.score>0.08).length;
  const strongPaths=(allSections||[]).filter(s=>s.score>0.16).length;
  const secondSec=sortedSecs[1];
  const thirdSec=sortedSecs[2];

  // IQ ratios
  const dirRatio=(iq?.directionScore||0)/40;
  const passRatio=(iq?.passQualityScore||0)/25;
  const tileRatio=(iq?.tileStrengthScore||0)/25;

  // ── FLEXIBILITY ─────────────────────────────────────────────────────────────
  // High = rack has real optionality; Low = trapped in one direction
  let flexScore=0;
  flexScore+=Math.min(strongPaths*15,40);
  flexScore+=livePaths>=5?20:livePaths>=3?12:livePaths>=2?6:0;
  // Concentration penalty, one section dominating collapses options
  const topConcentration=topPct>0?(topPct/(topPct+(sortedSecs[1]?.score||0.001)*100)):0;
  flexScore+=topConcentration<0.55?20:topConcentration<0.7?10:topConcentration<0.85?4:0;
  // Jokers add flexibility to any open hand
  flexScore+=jk>=2?8:jk===1?3:0;
  // Too many isolates hurt flexibility
  flexScore-=Math.min(isolatedTiles*4,16);
  flexScore=Math.max(0,Math.min(100,flexScore));

  const flexibility=flexScore>=68?"High":flexScore>=38?"Medium":"Low";

  // ── COMMITMENT ──────────────────────────────────────────────────────────────
  // High = rack is deeply locked to one section; Low = still wide open
  let commitScore=0;
  commitScore+=dirRatio*50;
  // Single-suit dominance = commitment
  if(totalNums>=5){
    const suitRatio=dominantSuitCount/totalNums;
    commitScore+=suitRatio>=0.8?20:suitRatio>=0.65?12:suitRatio>=0.5?6:0;
  }
  // Deep groups = commitment
  commitScore+=kongs*12+pungs*8+pairs*3;
  // Heavily odd or even = committed to a parity
  if(odds+evens>=6){
    const parityRatio=Math.max(odds,evens)/(odds+evens);
    commitScore+=parityRatio>=0.85?12:parityRatio>=0.7?6:0;
  }
  commitScore=Math.max(0,Math.min(100,commitScore));
  const commitment=commitScore>=68?"High":commitScore>=38?"Medium":"Low";

  // ── PIVOT POTENTIAL ─────────────────────────────────────────────────────────
  // Strong = still easy to switch directions; Weak = too locked
  let pivotScore=0;
  pivotScore+=strongPaths>=3?35:strongPaths>=2?22:strongPaths>=1?10:0;
  pivotScore+=livePaths>=5?25:livePaths>=3?15:0;
  pivotScore+=jk>=2?15:jk===1?7:0;
  // If the second-best section is within 12pts of chosen, pivot is easy
  const secPct=Math.round((secondSec?.score||0)*100);
  pivotScore+=secondSec&&Math.abs(secPct-chosenPct)<=12?15:secondSec&&Math.abs(secPct-chosenPct)<=20?8:0;
  // Pungs/kongs of tiles not in chosen section make pivoting harder
  const deadGroupPenalty=kongs*10+pungs*5;
  pivotScore-=Math.min(deadGroupPenalty,25);
  pivotScore=Math.max(0,Math.min(100,pivotScore));
  const pivotPotential=pivotScore>=62?"Strong":pivotScore>=35?"Moderate":"Weak";

  // ── STRUCTURAL STRENGTH ──────────────────────────────────────────────────────
  // Developing = early groups forming; Strong = committed depth
  let structScore=0;
  structScore+=kongs*20+pungs*12+pairs*6;
  structScore+=jk>=3?15:jk>=2?10:jk>=1?4:0;
  structScore+=fl>=2?8:fl>=1?3:0;
  structScore-=isolatedTiles*4;
  structScore=Math.max(0,Math.min(100,structScore));
  const structuralStrength=structScore>=55?"Strong":structScore>=22?"Developing":"Weak";

  // ── DEADNESS RISK ────────────────────────────────────────────────────────────
  // High = rack depends on low-probability tiles arriving; Low = many paths still live
  let deadScore=0;
  // Heavily committed with low fit = depends on future tiles not yet drawn
  if(chosenPct<40&&commitment==="High")deadScore+=35;
  else if(chosenPct<50&&commitment==="High")deadScore+=20;
  // Few pivots left
  if(pivotPotential==="Weak")deadScore+=25;
  else if(pivotPotential==="Moderate")deadScore+=10;
  // Many isolated tiles = need specific draws
  deadScore+=Math.min(isolatedTiles*5,20);
  // Few jokers in high-commitment rack = every needed tile must come naturally
  if(commitment==="High"&&jk===0)deadScore+=15;
  // No live secondary paths
  if(strongPaths<=1)deadScore+=15;
  deadScore=Math.max(0,Math.min(100,deadScore));
  const deadnessRisk=deadScore>=55?"High":deadScore>=28?"Medium":"Low";

  // ── PRIMARY DIRECTION ────────────────────────────────────────────────────────
  const secNames={"2026":"2026","2468":"Even Numbers (2468)","369":"369","13579":"Odd Numbers (13579)","cr":"Consecutive Runs","wd":"Winds & Dragons","aln":"Any Like Numbers","q":"Quints","sp":"Singles & Pairs"};
  const chosenName=secNames[chosenSec]||chosenSec;
  const chosenIcon=SECS?.find(s=>s.id===chosenSec)?.icon||"";

  // Build a substantive primary direction description
  let primaryDirection="";
  if(chosenSec==="13579"){
    const has3=nc[3]||0,has5=nc[5]||0,has7=nc[7]||0;
    const anchor=has5>=2?"5s as anchor":(has3>=2?"3s as anchor":(has7>=2?"7s as anchor":"building odd structure"));
    primaryDirection=`Odd number build centered on ${anchor}. ${strongPaths>=3?"Multiple viable 13579 hand patterns remain live, don't commit to a single hand yet.":"Narrow the field by deepening pungs rather than spreading across all five odd values."}`;
  } else if(chosenSec==="2468"){
    const has6=nc[6]||0,has2=nc[2]||0,has8=nc[8]||0;
    primaryDirection=`Even structure${has6>=2?" with 6 as primary anchor, correctly prioritized":" still forming, 6 appears in 7 of 8 hands and must be the first pung you build"}. ${has2>=2||has8>=2?"Secondary pairs are developing on time.":"Deepen your even-number groups before the tiles you need become unavailable."}`;
  } else if(chosenSec==="369"){
    const has6=nc[6]||0,has3=nc[3]||0,has9=nc[9]||0;
    primaryDirection=`369 build, ${has6>=2?"6 pung forming (correctly anchored)":"6 not yet paired, this is the most critical tile in the section"}. ${has3>=2||has9>=2?"Co-anchors forming.":"Pass everything outside 3-6-9 without hesitation."}`;
  } else if(chosenSec==="2026"){
    const has2=nc[2]||0,has6=nc[6]||0,soap=dragTiles.filter(t=>t.v==="Soap").length;
    primaryDirection=`2026 structure${has2>=2&&has6>=2?", both anchors present, strong position":(has2>=1||has6>=1)?", partial anchors; need depth in both 2s and 6s":", anchors missing; this section needs significant tile improvement"}. ${soap>=1?"Soap (White Dragon) in hand, the critical wildcard is protected.":"Hunt for Soap, it appears in 3 of 4 hands."}`;
  } else if(chosenSec==="cr"){
    const runLen=iqLongestRun(finalRack);
    primaryDirection=`Consecutive Run build, ${runLen>=4?"a ${runLen}-wide window is forming":runLen>=2?"partial run continuity, window needs tightening":"no clear window yet"}. Depth within a 3-4 number window is more valuable than a wide spread of singles.`;
  } else if(chosenSec==="wd"){
    primaryDirection=`Winds & Dragons, ${honorTotal>=7?"strong honor concentration, committed to this section":honorTotal>=5?"credible foundation, pass all 5-9 tiles immediately":honorTotal>=3?"early honor presence, needs significant development":"very thin honor count; aggressive passing of number tiles required"}. ${windPungs>=1?"Wind pung already forming, excellent.":"Stack one wind value before chasing variety."}`;
  } else if(chosenSec==="aln"){
    const topNum=Object.entries(nc).sort((a,b)=>b[1]-a[1])[0];
    primaryDirection=`Any Like Numbers, ${topNum&&topNum[1]>=3?`${topNum[0]}s are your number (${topNum[1]} in hand, good depth)`:topNum&&topNum[1]>=2?`${topNum[0]}s leading, but need more depth, pass everything else ruthlessly`:"number not yet identified, choose your deepest tile and commit completely"}. ALN rewards extreme focus; every off-number is a liability.`;
  } else if(chosenSec==="q"){
    primaryDirection=`Quints, ${jk>=3?"three jokers gives exceptional ceiling":jk>=2?"two jokers means the section is accessible":jk===1?"only one joker, you need a second before fully committing":"no jokers means Quints is unavailable; start planning your exit now"}. ${kongs>=1||pungs>=1?"Natural depth forming alongside jokers, stack it.":"Need 3-4 natural copies of a tile to pair with jokers."}`;
  } else if(chosenSec==="sp"){
    primaryDirection=`Singles & Pairs, ${jk===0?"correctly joker-free for a concealed hand":jk>0?`${jk} joker${jk>1?"s":""} remaining, pass them, they cannot be used here`:""}. ${pairs>=4?"Strong pair density, this rack is building well for S&P":pairs>=2?"pairs forming, need 6 total for completion":"pair count is low, focus every draw decision on matching tiles"}. No exposures allowed.`;
  } else {
    primaryDirection=`${chosenName}, ${chosenPct}% structural fit after the Charleston.`;
  }

  // ── SECONDARY PATHS ─────────────────────────────────────────────────────────
  const secondaryPaths=[];
  sortedSecs.slice(0,4).forEach(s=>{
    if(s.id===chosenSec)return;
    const pct=Math.round(s.score*100);
    if(pct<8)return;
    const why={
      "13579":"odd-number tile concentration supports this direction",
      "2468":"even-number depth gives this section real viability",
      "369":"the 6s and paired 3s or 9s support 369 alignment",
      "2026":"2s and 6s already in hand give this section structure",
      "cr":"number continuity could support a run-based pivot",
      "wd":"honor tile count keeps W&D as a viable alternative",
      "aln":"tile depth in one number value points toward ALN",
      "q":"joker count makes a Quints pivot theoretically available",
      "sp":"pair density keeps S&P as a live escape route",
    }[s.id]||`${pct}% fit keeps this alive`;
    secondaryPaths.push(`${s.icon||""} ${secNames[s.id]||s.id} (${pct}% fit), ${why}`);
  });

  // ── KEY OBSERVATIONS ─────────────────────────────────────────────────────────
  const observations=[];

  // Suit usage
  if(totalNums>=5){
    const suitRatio=dominantSuitCount/totalNums;
    if(suitRatio>=0.75)observations.push(`Suit concentration: ${Math.round(suitRatio*100)}% of number tiles are ${suitName[dominantSuit]||dominantSuit}, natural pull toward single-suit hands. Strong efficiency for section hands that allow one suit.`);
    else if(suitRatio>=0.5)observations.push(`Suit lean toward ${suitName[dominantSuit]||dominantSuit} (${dominantSuitCount} of ${totalNums} number tiles) with real secondary presence in the other suits, multi-suit hands remain very viable.`);
    else observations.push(`Suit spread is balanced across all three suits, this rack has cross-suit flexibility but will need to consolidate for most final hands.`);
  }

  // Group concentration
  if(kongs>=2)observations.push(`Two or more kong-depth groups, exceptional concentration. The rack is structurally locked but positioned to complete quickly.`);
  else if(kongs>=1)observations.push(`Kong-depth group forming, that tile is effectively claimed. Build the rest of the rack around this anchor.`);
  else if(pungs>=2)observations.push(`Multiple pungs building, strong group structure without over-commitment. Flexibility is higher than the depth suggests.`);
  else if(pungs>=1)observations.push(`One pung established, a useful anchor. The remaining tiles still allow directional adjustment.`);
  else if(pairs>=3)observations.push(`Pair-dense rack (${pairs} pairs) without pungs, useful for S&P or as a base for further development, but depth is needed to win most other sections.`);
  else if(pairs>=1)observations.push(`Early pair structure forming. Pairs are the building blocks, protect them and look to deepen into pungs.`);

  // Joker insight
  if(jk>=3)observations.push(`Three jokers, rare and powerful. This rack can complete almost any open hand. Don't over-specify your target; let the draw refine the direction.`);
  else if(jk===2)observations.push(`Two jokers support any open pung or kong. Keep the rack structure simple, jokers fill the gaps you leave.`);
  else if(jk===1)observations.push(`One joker provides a single flexible wildcard. Assign it mentally to your hardest-to-complete group and protect that direction.`);
  else if(chosenSec!=="sp")observations.push(`No jokers, every group must be completed naturally. The rack needs higher tile concentration to compensate.`);

  // Isolated tile risk
  if(isolatedTiles>=5)observations.push(`${isolatedTiles} isolated tiles (singletons without a matching pair) create vulnerability, too many specific draws are needed to salvage them. Consider narrowing focus.`);
  else if(isolatedTiles>=3)observations.push(`${isolatedTiles} isolated tiles. These need to either find pairs through draws or leave via future passes, watch which direction the rack is moving.`);
  else if(isolatedTiles<=1&&totalNums>=6)observations.push(`Low isolated tile count, almost every number tile in the rack has structural company. Efficient.`);

  // Flower note
  if(fl>=3)observations.push(`Three Flowers, above-average flower count supports the majority of hands that use them. High-value hold.`);
  else if(fl>=2)observations.push(`Two Flowers provide solid support for flower-inclusive hands across most sections.`);
  else if(fl===0&&chosenSec!=="wd"&&chosenSec!=="sp")observations.push(`No Flowers, many winning hands use at least one. This is not critical yet but worth noting.`);

  // Pass quality note
  if(passedJokers>0)observations.push(`Joker${passedJokers>1?"s":""} passed during the Charleston, almost always the wrong move. Jokers are the most flexible tile on the board.`);
  if(passRatio>=0.8)observations.push(`Pass execution was strong, the right tiles left the rack on time.`);
  else if(passRatio<=0.4)observations.push(`Pass decisions cost this rack structure, tiles the section needed were allowed to leave.`);

  // ── EXPERT INSIGHT ───────────────────────────────────────────────────────────
  let expertInsight="";
  const sn=secNames[chosenSec]||chosenSec;

  // Build contextual insight from the most important 2-4 signals
  const signals=[];

  // Signal 1: group depth signal
  if(kongs>=1&&pungs>=1)signals.push(`a kong and a pung already anchoring the rack`);
  else if(pungs>=2)signals.push(`two pungs giving the rack real structural depth`);
  else if(pairs>=3&&pungs===0)signals.push(`${pairs} pairs without pungs, good base but needing deeper group development`);
  else if(isolatedTiles>=4)signals.push(`too many singleton tiles requiring specific draws`);

  // Signal 2: flexibility signal
  if(flexibility==="High"&&commitment==="Low")signals.push(`strong optionality across ${strongPaths} live section paths`);
  else if(flexibility==="Low"&&commitment==="High")signals.push(`a rack that's committed early, the upside is speed, the risk is deadness if key tiles don't arrive`);
  else if(pivotPotential==="Strong")signals.push(`real pivot options still available if the primary direction stalls`);

  // Signal 3: joker signal
  if(jk>=2)signals.push(`${jk} jokers providing significant wildcard ceiling`);
  else if(jk===0&&commitment==="High")signals.push(`no joker support in a committed rack, natural tile draws become critical`);

  // Signal 4: suit signal
  if(totalNums>=5&&dominantSuitCount/totalNums>=0.7)signals.push(`strong ${suitName[dominantSuit]||dominantSuit} concentration building natural suit efficiency`);
  else if(totalNums>=6&&thirdSuitCount>=2)signals.push(`tiles spread across three suits, which reduces single-suit hand depth`);

  // Compose the insight from signals
  if(signals.length>=2){
    expertInsight=`This rack comes out of the Charleston with ${signals.slice(0,2).join(" and ")}. `;
    if(signals[2])expertInsight+=`${signals[2].charAt(0).toUpperCase()+signals[2].slice(1)}. `;
    // Add section-specific closer
    const closers={
      "13579":"The section has enough hand variety that staying flexible a few more draws is the right play, don't lock onto one specific 13579 hand until a second pung forms.",
      "2468":"Six is the non-negotiable anchor in this section, every decision from here should protect it first.",
      "369":"369 is the most unforgiving section for tile discipline, if it isn't 3, 6, or 9, it should be leaving the rack.",
      "2026":"This section has only four hands, so tile specificity matters more than in larger sections, know which hand you're building toward.",
      "cr":"Consecutive Run rewards depth over width, a tight 3-4 number window with pungs is worth more than six different numbers with singles.",
      "wd":"Honor tiles compound slowly, patience through the early draws is part of the W&D strategy.",
      "aln":"ALN is won by extreme focus; the rack that commits earliest and passes most ruthlessly usually finishes first.",
      "q":"Quints is the highest-ceiling, narrowest-path section on the card, know your exit point if the second joker doesn't arrive.",
      "sp":"S&P is entirely concealed with no joker help, so every draw decision reduces to one question: does this tile match something I'm holding?",
    };
    expertInsight+=(closers[chosenSec]||`The Charleston ended at a reasonable position, the next few draws will clarify which specific hand within ${sn} is the right target.`);
  } else {
    // Fallback for sparse racks
    expertInsight=`The rack exited the Charleston with ${flexibility.toLowerCase()} flexibility and ${commitment.toLowerCase()} commitment to ${sn}. `;
    expertInsight+=deadnessRisk==="High"?"Deadness risk is elevated, pivot options should be identified now before tiles become unavailable.":
      deadnessRisk==="Medium"?"A few more draws will clarify whether the primary direction is viable or a pivot is needed.":
      "The structure is sound and multiple paths remain live, let the draws lead the final hand decision.";
  }

  // Section fit for display
  const sectionFitLabel=chosenPct>=65?"Strong alignment"
    :chosenPct>=45?"Moderate alignment"
    :chosenPct>=28?"Partial alignment"
    :"Weak alignment";
  const sectionFitConfidence=chosenPct>=65?"High"
    :chosenPct>=45?"Medium"
    :chosenPct>=28?"Low"
    :"Very low";

  return{
    primaryDirection,
    secondaryPaths,
    pivotPotential,
    flexibility,
    commitment,
    structuralStrength,
    deadnessRisk,
    observations:observations.filter(Boolean).slice(0,5),
    expertInsight,
    sectionFitLabel,
    sectionFitConfidence,
    chosenPct,
    topPct,
    sectionMatch,
    topSec,
    // legacy compat
    risk:deadnessRisk==="High"?"High":deadnessRisk==="Medium"?"Medium":"Low",
    bullets:[],
  };
}

// ── 4. MAHJONG IDENTITY ─────────────────────────────────────────────────────
// Returns {archetype, tagline} based on play pattern.
function computeMahjongIdentity(iq, chosenSec, passLog, finalRack){
  if(!iq)return null;
  const dr=iq.directionScore/40;
  const pr=iq.passQualityScore/25;
  const tr=iq.tileStrengthScore/25;
  const tmr=iq.timingScore/10;
  const jk=(finalRack||[]).filter(t=>t.t==="j").length;
  const fl=(finalRack||[]).filter(t=>t.t==="f").length;
  const allPassed=(passLog||[]).flatMap(p=>p.out||[]);
  const passedJokers=allPassed.filter(t=>t.t==="j").length;

  // Identity matrix
  if(dr>=0.85&&pr>=0.8)return{archetype:"The Disciplined Builder",tagline:"You knew your direction and your passes protected it. That's expert instinct."};
  if(dr>=0.8&&tmr>=0.85)return{archetype:"The Sharp Reader",tagline:"Quick decisions, clear direction. You read the rack and trusted your first instinct."};
  if(dr>=0.75&&tr>=0.8)return{archetype:"The Structure Seeker",tagline:"You built depth and held the right tiles. Tile discipline at its best."};
  if(pr>=0.85&&tr>=0.75)return{archetype:"The Clean Passer",tagline:"Your pass quality was exceptional. You gave away exactly what you should have."};
  if(jk>=3&&pr>=0.7)return{archetype:"The Joker Keeper",tagline:"You held your wildcards and built around them. High-ceiling play."};
  if(dr>=0.7&&pr<0.5)return{archetype:"The Committed Player",tagline:"Strong direction, but your passes didn't always protect the plan. Two sides of the same coin."};
  if(dr<0.5&&pr>=0.75)return{archetype:"The Careful Passer",tagline:"Disciplined discards, but the section read was still forming. Trust your instincts earlier."};
  if(tmr<=0.4&&dr>=0.7)return{archetype:"The Methodical Planner",tagline:"You took your time and committed to a direction. Slow and intentional, that's a style."};
  if(passedJokers>0)return{archetype:"The Risk-Taker",tagline:"Passing a joker takes nerve. Sometimes it pays off, was this one of those times?"};
  if(fl>=3&&tr>=0.6)return{archetype:"The Flower Collector",tagline:"Your flowers added real structural support. You recognized their value."};
  if(chosenSec==="sp")return{archetype:"The Pair Builder",tagline:"S&P is the disciplined path. Pairs only, no jokers, all instinct."};
  if(chosenSec==="q")return{archetype:"The High Roller",tagline:"Quints or nothing. You swung for the fence, no shame in that."};
  if(dr<0.5&&pr<0.5)return{archetype:"The Exploratory Player",tagline:"This rack kept you guessing. Sometimes the best round is the one that teaches you something."};
  return{archetype:"The Adaptive Player",tagline:"You adjusted as the rack evolved. Flexibility is an underrated skill in Mahjong."};
}

// ── COACHING UI COMPONENTS ──────────────────────────────────────────────────

function StartingDealCard({startingRack,chosenHandObj}){
  const [open,setOpen]=useState(false);
  if(!startingRack||!startingRack.length)return null;
  const startCoverage=chosenHandObj?Math.round(chosenHandObj.fit(startingRack)*100):null;
  return(
    <div style={{...S.card,marginBottom:10,padding:0,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div>
          <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700}}>YOUR STARTING DEAL</div>
          <div style={{fontSize:12,fontWeight:700,color:C.ink,marginTop:1}}>
            What you were originally dealt
            {startCoverage!=null&&<span style={{fontSize:11,fontWeight:400,color:C.mut}}> · {startCoverage}% coverage before passing</span>}
          </div>
        </div>
        <span style={{fontSize:12,color:C.mut}}>{open?"▾":"▸"}</span>
      </button>
      {open&&<div style={{borderTop:`1px solid ${C.bdr}`,padding:"10px 14px"}} className="rk-in">
        <div style={{marginBottom:8}}><SortableRack hand={startingRack}/></div>
        {startCoverage!=null&&chosenHandObj&&(
          <div style={{fontSize:11,color:C.ink,lineHeight:1.6,background:C.bg2,borderRadius:8,padding:"8px 10px"}}>
            {startCoverage>=60
              ?`Your starting deal already covered ${startCoverage}% of ${chosenHandObj.label}, strong raw material. The Charleston was about protecting it.`
              :startCoverage>=35
              ?`Your deal gave you ${startCoverage}% of ${chosenHandObj.label} to start, a workable foundation. Each pass had a job to do.`
              :`Only ${startCoverage}% starting coverage for ${chosenHandObj.label}, a tough deal. The Charleston had to do a lot of work.`
            }
          </div>
        )}
      </div>}
    </div>
  );
}

function PassesCard({passNarrative}){
  const [open,setOpen]=useState(false);
  if(!passNarrative||!passNarrative.length)return null;
  return(
    <div style={{...S.card,marginBottom:10,padding:0,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div>
          <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700}}>YOUR PASSES</div>
          <div style={{fontSize:12,fontWeight:700,color:C.ink,marginTop:1}}>Per-pass breakdown</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",gap:4}}>{passNarrative.map((p,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:10,height:10,borderRadius:5,background:p.qualColor}}/>
            </div>
          ))}</div>
          <span style={{fontSize:12,color:C.mut}}>{open?"▾":"▸"}</span>
        </div>
      </button>
      {open&&<div style={{borderTop:`1px solid ${C.bdr}`}} className="rk-in">
        <div style={{display:"flex",flexDirection:"column",gap:6,padding:"10px 14px"}}>
          {passNarrative.map((p,i)=>(
            <div key={i} style={{borderRadius:12,background:p.qualBg,border:`1px solid ${p.qualColor}25`,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderBottom:p.tiles.length>0||p.insight?`1px solid ${p.qualColor}15`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:11,background:p.qualColor+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:p.qualColor,flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{p.roundName||`Pass ${i+1}`}</span>
                  {p.blind&&<span style={{fontSize:8,fontWeight:700,color:C.mut,background:C.bg2,borderRadius:10,padding:"1px 6px"}}>BLIND</span>}
                </div>
                <span style={{fontSize:9,fontWeight:700,color:p.qualColor,letterSpacing:0.5}}>{p.qualLabel}</span>
              </div>
              {p.tiles.length>0&&(
                <div style={{padding:"8px 12px",borderBottom:p.insight?`1px solid ${p.qualColor}15`:"none"}}>
                  <div style={{fontSize:8,color:C.mut,fontWeight:600,marginBottom:5,letterSpacing:0.5}}>YOU PASSED</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{p.tiles.map((t,j)=><Ti key={j} t={t}/>)}</div>
                </div>
              )}
              {p.insight&&<div style={{padding:"8px 12px"}}><p style={{fontSize:11,color:C.ink,margin:0,lineHeight:1.6}}>{p.insight}</p></div>}
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}

function AltHandsCard({hand,resolvedHandLabel,chosenSec,chosenSecObj,sortedSecs,primaryCoveragePct}){
  // Score all hands in the chosen section by honest coverage
  const sectionHands=HAND_CATALOG.filter(h=>h.sec===chosenSec)
    .map(h=>{const cov=computeHonestCoverage(hand,h);return{...h,coveragePct:cov.pct,credibility:cov.credibility,isCredible:cov.isCredible,variantLabel:cov.variantLabel,labelForDisplay:cov.labelForDisplay,coveragePlan:cov.plan,groupNuance:cov.groupNuance,tone:cov.tone,coachLine:cov.coachLine};})
    .sort((a,b)=>(b.credibility-a.credibility)||(b.coveragePct-a.coveragePct));

  // Top 3 alternates in the same section (excluding the primary scored hand)
  const altSectionHands=sectionHands
    .filter(h=>(h.labelForDisplay||h.variantLabel||h.label)!==resolvedHandLabel&&h.label!==resolvedHandLabel&&h.isCredible!==false&&h.coveragePct>=45)
    .slice(0,2);

  // Best hand from other sections to reach 4 total alts
  const remaining=Math.max(0,4-altSectionHands.length);
  const altSecHands=[];
  for(const sec of sortedSecs){
    if(sec.id===chosenSec)continue;
    if(altSecHands.length>=remaining)break;
    const best=HAND_CATALOG.filter(h=>h.sec===sec.id)
      .map(h=>{const cov=computeHonestCoverage(hand,h);return{...h,coveragePct:cov.pct,credibility:cov.credibility,isCredible:cov.isCredible,variantLabel:cov.variantLabel,labelForDisplay:cov.labelForDisplay,coveragePlan:cov.plan,groupNuance:cov.groupNuance,tone:cov.tone,coachLine:cov.coachLine,secObj:sec};})
      .sort((a,b)=>(b.credibility-a.credibility)||(b.coveragePct-a.coveragePct))[0];
    if(best&&best.isCredible!==false&&best.coveragePct>=48)altSecHands.push(best);
  }

  const lanes=[
    ...altSectionHands.map(h=>({handObj:h,secId:chosenSec,secObj:chosenSecObj,kicker:"Same family",copy:"A real alternate, not the main lane."})),
    ...altSecHands.map(h=>({handObj:h,secId:h.sec,secObj:h.secObj,kicker:"Different read",copy:"Another credible direction this rack showed."})),
  ];

  if(!lanes.length){
    return(
      <div style={{...S.card,marginBottom:8,padding:"14px 16px",textAlign:"center",background:"linear-gradient(145deg,#FFFDF8,#F7F0E5)"}}>
        <div style={{fontSize:9,color:C.jade,letterSpacing:2,fontWeight:900,textTransform:"uppercase",marginBottom:5}}>Other Paths</div>
        <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,marginBottom:4}}>No stronger alternate.</div>
        <div style={{fontSize:12,color:C.mut,lineHeight:1.55,maxWidth:300,margin:"0 auto"}}>Good read. This rack did not show another credible 2026-card path, so the best lesson is to keep protecting the lane you found.</div>
      </div>
    );
  }

  return(
    <div style={{marginBottom:8,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 2px 7px"}}>
        <div style={{fontSize:10,color:C.mut,fontWeight:800,letterSpacing:0.6}}>Other paths this rack was showing</div>
        {lanes.length>1&&<div style={{fontSize:10,color:C.jade,fontWeight:800}}>Swipe</div>}
      </div>
      <div style={{
        display:"flex",gap:10,overflowX:"auto",overflowY:"hidden",
        WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory",
        padding:"0 2px 8px",margin:"0 -2px",
        scrollbarWidth:"none",
      }}>
        {lanes.map((lane,i)=>(
          <div key={`${lane.handObj.labelForDisplay||lane.handObj.variantLabel||lane.handObj.label}-${lane.secId}-${i}`} style={{
            flex:"0 0 88%",maxWidth:360,scrollSnapAlign:"start",
            background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:16,
            boxShadow:"0 2px 10px rgba(0,0,0,0.045)",overflow:"hidden",
          }}>
            <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${C.bdr}`,background:"linear-gradient(145deg,#FFFFFF,#FFFCF7)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:5}}>
                <div style={{fontSize:8,color:lane.secObj?.color||C.mut,letterSpacing:1.7,fontWeight:900,textTransform:"uppercase"}}>
                  {lane.secObj?.icon} {lane.kicker}
                </div>
                <CoverageChip pct={lane.handObj.coveragePct} plan={lane.handObj.coveragePlan} credibility={lane.handObj.credibility}/>
              </div>
              <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,lineHeight:1.15,letterSpacing:-0.2}}>{lane.handObj.labelForDisplay||lane.handObj.variantLabel||lane.handObj.label}</div>
              <div style={{fontSize:10.5,color:C.mut,lineHeight:1.45,marginTop:4}}>{lane.copy}</div>
            </div>
            <div style={{padding:10,overflow:"hidden"}}>
              <RackVsHandOverlay hand={hand} handObj={lane.handObj} passLog={[]} sectionId={lane.secId} handWasInferred={false} secObj={lane.secObj}/>
            </div>
          </div>
        ))}
      </div>
      {lanes.length>1&&(
        <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:1}}>
          {lanes.map((_,i)=><span key={i} style={{width:5,height:5,borderRadius:3,background:i===0?C.jade:C.bdr,display:"block"}}/>) }
        </div>
      )}
    </div>
  );
}

function coverageTone(pct){
  if(pct>=78)return{label:"Clean path",short:"Live",color:C.jade,desc:"This path had real shape."};
  if(pct>=64)return{label:"Worth keeping",short:"Live",color:C.gold,desc:"Worth keeping alive, with a little more group strength."};
  if(pct>=43)return{label:"Shape starting",short:"Maybe",color:C.gold,desc:"Good clue, but not one to force yet."};
  return{label:"Table lesson",short:"Learn",color:C.mut,desc:"Useful to notice, but too far away to chase."};
}

function CoverageChip({pct,plan,credibility}){
  const tone=plan?rkCoachPathTone(plan):coverageTone(pct);
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:5,background:tone.color+"10",border:`1px solid ${tone.color}26`,borderRadius:999,padding:"4px 9px"}}>
      <div style={{width:6,height:6,borderRadius:3,background:tone.color}}/>
      <span style={{fontSize:10,fontWeight:900,color:tone.color,letterSpacing:0.1}}>{tone.short}</span>
    </div>
  );
}

function readTone(value,max){
  const r=value/max;
  if(r>=0.82)return{label:"Strong",color:C.jade};
  if(r>=0.62)return{label:"Solid",color:C.gold};
  if(r>=0.42)return{label:"Watch",color:C.gold};
  return{label:"Tighten",color:C.cinn};
}

function tableTalkCards(iq){
  const dir=iq.directionScore||0;
  const pass=iq.passQualityScore||0;
  const tile=iq.tileStrengthScore||0;
  const time=iq.timingScore||0;
  const cards=[];

  cards.push({
    icon:"👀",
    title:"The read",
    tone:readTone(dir,40),
    text:dir>=32?"You found the lane early and mostly trusted it. That is the hard part."
      :dir>=24?"There was a good read here. Next time, trust the first clean lane a little sooner."
      :dir>=16?"This rack was chatty. Pick the clearest direction, then let the extra noise go."
      :"This was one of those racks that asks you to slow down first. Find one lane before you start protecting tiles."
  });

  cards.push({
    icon:"🤲",
    title:"The passes",
    tone:readTone(pass,25),
    text:pass>=20?"Nice passing. You let go of the floaters and protected the good stuff."
      :pass>=15?"Mostly clean. One or two tiles probably made the rack work harder than it needed to."
      :pass>=10?"A couple of passes stung. Before the next pass, ask: would I be annoyed to draw this back?"
      :"The Charleston got a little slippery here. Protect the tiles that are actually doing work."
  });

  cards.push({
    icon:"🀄",
    title:"The rack",
    tone:readTone(tile,25),
    text:tile>=20?"You had something to work with. The rack gave you real material."
      :tile>=15?"The rack had a shape, but it needed one more useful connection."
      :tile>=10?"There were pieces here, just not enough of them talking to each other yet."
      :"Tough rack. This was less about finding perfect and more about making the least messy choice."
  });

  cards.push({
    icon:"⏱",
    title:"The rhythm",
    tone:readTone(time,10),
    text:time>=8?"Good rhythm. Quick enough to stay sharp, calm enough to see the rack."
      :time>=6?"Your pace was fine. A little more trust in your first read would help."
      :time>=4?"You paused in the spots most players pause. Once a tile is clearly outside the plan, let it go."
      :"This round needed a breath. Read the rack, choose the lane, then pass."
  });

  return cards;
}

function TableTalkRead({iq}){
  const cards=tableTalkCards(iq);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
      {cards.map((c,i)=>(
        <div key={c.title} style={{background:"#fff",border:`1px solid ${c.tone.color}20`,borderRadius:14,padding:"12px 14px",boxShadow:"0 1px 5px rgba(0,0,0,0.035)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <div style={{width:30,height:30,borderRadius:10,background:c.tone.color+"10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{c.icon}</div>
            <div className="rk-daily-hero-copy" style={{flex:1,minWidth:0}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.7,fontWeight:900,textTransform:"uppercase"}}>{c.title}</div>
              <div style={{fontSize:12,fontWeight:900,color:C.ink,lineHeight:1.25,marginTop:1}}>{c.tone.label}</div>
            </div>
          </div>
          <div style={{fontSize:12,color:C.ink,lineHeight:1.55}}>{c.text}</div>
        </div>
      ))}
    </div>
  );
}

function RackBecomingCard({finalRack, startingRack, chosenSec, passLog}){
  const bullets=computeRackBecoming(finalRack,startingRack,chosenSec,passLog);
  if(!bullets.length)return null;
  return(
    <div style={{...S.card,marginBottom:8,background:"linear-gradient(145deg,#F9F6F0,#F5F0E8)",borderColor:C.gold+"30"}}>
      <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:10}}>WHAT YOUR RACK WAS BECOMING</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {bullets.map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <div style={{width:5,height:5,borderRadius:3,background:C.gold,flexShrink:0,marginTop:5}}/>
            <span style={{fontSize:12,color:C.ink,lineHeight:1.55,flex:1}}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RackViewer({hand,startingRack}){
  const [open,setOpen]=useState(false);
  const [tab,setTab]=useState("final");
  const hasStarting=startingRack&&startingRack.length>0;
  if(!hand||!hand.length)return null;
  return(
    <div style={{...S.card,marginBottom:8,padding:0,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>🀄</span>
          <div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700}}>YOUR TILES</div>
            <div style={{fontSize:12,fontWeight:700,color:C.ink,marginTop:1}}>Starting rack & final rack</div>
          </div>
        </div>
        <span style={{fontSize:12,color:C.mut}}>{open?"▾":"▸"}</span>
      </button>
      {open&&<div className="rk-in" style={{borderTop:`1px solid ${C.bdr}`}}>
        <div style={{display:"flex",borderBottom:`1px solid ${C.bdr}`}}>
          {[{k:"final",label:"Final Rack",disabled:false},{k:"starting",label:"Starting Deal",disabled:!hasStarting}].map(({k,label,disabled})=>(
            <button key={k} onClick={()=>!disabled&&setTab(k)} style={{flex:1,padding:"9px 0",background:"none",border:"none",borderBottom:`2px solid ${tab===k?C.jade:"transparent"}`,cursor:disabled?"default":"pointer",fontSize:11,fontWeight:tab===k?700:500,color:tab===k?C.jade:disabled?"#C0BAB0":C.mut,transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{padding:"12px 14px"}}>
          {tab==="final"&&<>
            <div style={{fontSize:9,color:C.mut,marginBottom:8}}>Your rack after the Charleston, what you scored on.</div>
            <SortableRack hand={hand}/>
          </>}
          {tab==="starting"&&hasStarting&&<>
            <div style={{fontSize:9,color:C.mut,marginBottom:8}}>The 13 tiles you were dealt before any passes.</div>
            <SortableRack hand={startingRack}/>
          </>}
          {tab==="starting"&&!hasStarting&&<div style={{fontSize:11,color:C.mut,textAlign:"center",padding:"16px 0"}}>Starting rack not available, play a new game to see your deal.</div>}
        </div>
      </div>}
    </div>
  );
}

function HandTargetPreview({hand,scoredHandObj,chosenSec,chosenSecObj,iq,onCoachMode}){
  const [open,setOpen]=useState(true);
  if(!scoredHandObj||!hand||!hand.length)return null;
  const previewPlan=buildCoveragePlan(hand,scoredHandObj,[]);
  const groups=previewPlan.groups;
  const cardColors=previewPlan.cardColors||[];
  const{held,total,pct}=previewPlan;
  const displayHandLabel=previewPlan.labelForDisplay||previewPlan.variantLabel||scoredHandObj.label;
  const tone=coverageTone(pct);
  const tableLine=pct>=65?"This was one of the cleanest lanes your rack was showing."
    :pct>=40?"This line stayed alive. A few more connected tiles would make it much stronger."
    :pct>=20?"There was a path here, but it needed help from the wall."
    :"This was a reach. Useful to notice, but not a lane to force.";
  return(
    <div style={{...S.card,marginBottom:8,padding:0,overflow:"hidden",background:"#fff"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"13px 14px",background:"linear-gradient(145deg,#FFFFFF,#FFFCF7)",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:8,color:chosenSecObj?.color||C.jade,letterSpacing:2,fontWeight:900,marginBottom:4}}>YOUR BEST PATH</div>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:C.ink,letterSpacing:-0.2,marginBottom:3}}>{displayHandLabel}</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.35}}>{tableLine}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0,marginLeft:10}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:5,background:tone.color+"10",border:`1px solid ${tone.color}25`,borderRadius:999,padding:"5px 9px"}}>
            <span style={{width:6,height:6,borderRadius:3,background:tone.color,display:"block"}}/>
            <span style={{fontSize:10,fontWeight:900,color:tone.color,whiteSpace:"nowrap"}}>{tone.short}</span>
          </div>
          <span style={{fontSize:12,color:C.mut}}>{open?"▾":"▸"}</span>
        </div>
      </button>
      {open&&<div className="rk-in" style={{borderTop:`1px solid ${C.bdr}`}}>
        <div style={{padding:"11px 14px",background:"#FFFCF7",borderBottom:`1px solid ${C.bdr}`}}>
          <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:900,marginBottom:7}}>PATTERN TO NOTICE</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-end"}}>
            {groups.map((g,i)=><HandGroupChips key={i} group={g} cardColor={cardColors[i]}/>) }
          </div>
        </div>
        <div style={{padding:"12px 14px"}}>
          <div style={{fontSize:12,color:C.ink,lineHeight:1.6,marginBottom:onCoachMode?10:0}}>{tone.desc} You had {held} key tile{held===1?"":"s"} showing against this shape.</div>
          {onCoachMode&&<button onClick={onCoachMode} style={{width:"100%",background:C.jade+"08",border:`1px solid ${C.jade}20`,borderRadius:12,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:9,textAlign:"left"}}>
            <span style={{fontSize:15}}>🎓</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:900,color:C.jade,lineHeight:1.3}}>Improve This Rack</div>
              <div style={{fontSize:10,color:C.mut,lineHeight:1.35}}>Replay your Charleston →</div>
            </div>
          </button>}
        </div>
      </div>}
    </div>
  );
}

function FlexibilityCard({finalRack, allSections, passLog, startingRack}){
  const f=computeFlexibility(finalRack,allSections,passLog,startingRack);
  if(!f)return null;
  const barW=`${f.score}%`;
  return(
    <div style={{...S.card,marginBottom:8,padding:0,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${f.color}14,${f.color}06)`,borderBottom:`1px solid ${f.color}20`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div style={{fontSize:9,color:f.color,letterSpacing:2,fontWeight:700}}>FLEXIBILITY SCORE</div>
          <div style={{display:"flex",alignItems:"baseline",gap:3}}>
            <span style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:f.color,lineHeight:1}}>{f.label}</span>
          </div>
        </div>
        <div style={{height:5,borderRadius:3,background:f.color+"20",overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",borderRadius:3,background:f.color,width:barW,transition:"width 0.8s ease"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:f.color}}>{f.livePaths}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1,fontWeight:700,marginTop:1}}>LIVE PATHS</div>
          </div>
          <div style={{width:1,background:f.color+"20"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontFamily:F.d,fontSize:16,fontWeight:900,color:f.color}}>{f.strongPaths}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1,fontWeight:700,marginTop:1}}>STRONG PATHS</div>
          </div>
        </div>
      </div>
      <div style={{padding:"10px 14px"}}>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.55,margin:0}}>{f.desc}</p>
      </div>
    </div>
  );
}

function ExpertReadCard({finalRack, chosenSec, allSections, passLog, iq}){
  const [open,setOpen]=useState(false);
  const read=computeExpertRead(finalRack,chosenSec,allSections,passLog,iq);
  if(!read)return null;

  const flexColor={High:C.jade,Medium:C.gold,Low:C.cinn};
  const commitColor={High:C.cinn,Medium:C.gold,Low:C.jade};
  const pivotColor={Strong:C.jade,Moderate:C.gold,Weak:C.cinn};
  const structColor={Strong:C.jade,Developing:C.gold,Weak:C.cinn};
  const deadColor={Low:C.jade,Medium:C.gold,High:C.cinn};

  const Chip=({label,value,colorMap})=>(
    <div style={{flex:1,padding:"9px 6px",textAlign:"center"}}>
      <div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>{label}</div>
      <div style={{fontSize:11,fontWeight:800,color:colorMap[value]||C.mut}}>{value}</div>
    </div>
  );

  return(
    <div style={{...S.card,marginBottom:8,padding:0,overflow:"hidden"}}>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#0F2016,#1B3A28)",padding:"11px 14px"}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:2,fontWeight:700,marginBottom:2}}>EXPERT READ</div>
        <div style={{fontFamily:F.d,fontSize:14,fontWeight:800,color:"#fff",lineHeight:1.2}}>Strategic rack evaluation</div>
      </div>

      {/* ── SECTION FIT + PRIMARY DIRECTION ── */}
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>SECTION FIT</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:800,color:read.sectionFitConfidence==="High"?C.jade:read.sectionFitConfidence==="Medium"?C.gold:C.cinn}}>
            {read.chosenPct}%
          </div>
          <div style={{fontSize:11,color:C.ink,fontWeight:600}}>{read.sectionFitLabel}</div>
          {!read.sectionMatch&&read.topSec&&(
            <div style={{fontSize:10,color:C.mut,marginLeft:"auto"}}>
              Best fit: {read.topSec.icon} {read.topSec.name} ({read.topPct}%)
            </div>
          )}
        </div>

        <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:4}}>PRIMARY DIRECTION</div>
        <p style={{margin:0,fontSize:12,color:C.ink,lineHeight:1.6}}>{read.primaryDirection}</p>
      </div>

      {/* ── 5-METRIC ROW ── */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.bdr}`,borderTop:`1px solid ${C.bdr}`}}>
        {[
          {label:"FLEX",value:read.flexibility,colorMap:flexColor},
          {label:"COMMIT",value:read.commitment,colorMap:commitColor},
          {label:"PIVOT",value:read.pivotPotential,colorMap:pivotColor},
          {label:"STRUCT",value:read.structuralStrength,colorMap:structColor},
          {label:"DEAD RISK",value:read.deadnessRisk,colorMap:deadColor},
        ].map((m,i,arr)=>(
          <div key={i} style={{flex:1,padding:"9px 4px",textAlign:"center",borderRight:i<arr.length-1?`1px solid ${C.bdr}`:"none"}}>
            <div style={{fontSize:6.5,color:C.mut,letterSpacing:1.2,fontWeight:700,marginBottom:3}}>{m.label}</div>
            <div style={{fontSize:10,fontWeight:800,color:m.colorMap[m.value]||C.mut}}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* ── EXPERT INSIGHT (always visible) ── */}
      <div style={{padding:"12px 14px",background:C.sage,borderBottom:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:8,color:C.sageB,letterSpacing:1.5,fontWeight:700,marginBottom:5}}>EXPERT INSIGHT</div>
        <p style={{margin:0,fontSize:12,color:C.ink,lineHeight:1.65,fontStyle:"italic"}}>{read.expertInsight}</p>
      </div>

      {/* ── EXPAND / COLLAPSE for secondary paths + observations ── */}
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"9px 14px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:open?`1px solid ${C.bdr}`:"none"}}>
        <span style={{fontSize:10,color:C.jade,fontWeight:700,letterSpacing:0.5}}>{open?"Hide details":"More detail, secondary paths & observations"}</span>
        <span style={{fontSize:11,color:C.mut}}>{open?"▾":"▸"}</span>
      </button>

      {open&&(
        <div className="rk-in">
          {/* Secondary paths */}
          {read.secondaryPaths.length>0&&(
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.bdr}`}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>SECONDARY PATHS</div>
              {read.secondaryPaths.map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:i<read.secondaryPaths.length-1?6:0}}>
                  <span style={{fontSize:10,color:C.gold,fontWeight:900,flexShrink:0,marginTop:1}}>◈</span>
                  <span style={{fontSize:11,color:C.ink,lineHeight:1.55,flex:1}}>{p}</span>
                </div>
              ))}
            </div>
          )}

          {/* Key observations */}
          {read.observations.length>0&&(
            <div style={{padding:"10px 14px"}}>
              <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>KEY OBSERVATIONS</div>
              {read.observations.map((o,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:i<read.observations.length-1?6:0}}>
                  <span style={{fontSize:10,color:C.jade,fontWeight:900,flexShrink:0,marginTop:1}}>›</span>
                  <span style={{fontSize:11,color:C.ink,lineHeight:1.55,flex:1}}>{o}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MahjongIdentityCard({iq, chosenSec, passLog, finalRack}){
  const id=computeMahjongIdentity(iq,chosenSec,passLog,finalRack);
  if(!id)return null;
  return(
    <div style={{...S.card,marginBottom:8,padding:"14px 16px",textAlign:"center",background:"linear-gradient(145deg,#FFFFF5,#F4EFE3)",borderColor:C.gold+"30"}}>
      <div style={{fontSize:8,color:C.gold,letterSpacing:2.5,fontWeight:700,marginBottom:8}}>YOUR STYLE THIS ROUND</div>
      <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,lineHeight:1.2,marginBottom:6}}>{id.archetype}</div>
      <div style={{width:32,height:1,background:`linear-gradient(90deg,transparent,${C.gold}60,transparent)`,margin:"0 auto 8px"}}/>
      <p style={{fontSize:12,color:C.mut,lineHeight:1.6,margin:0,maxWidth:280,marginLeft:"auto",marginRight:"auto"}}>{id.tagline}</p>
    </div>
  );
}

// IQ HERO, shared dark jade gradient hero card used in scorecard + home
function IQHero({iq,isDaily,dayNum,section,totalTime,chosenSec,allSections,isHome=false}){
  if(!iq)return null;
  iq=withIQStyle(iq);
  const [displayScore,setDisplayScore]=useState(0);
  const [isPB,setIsPB]=useState(false);
  useEffect(()=>{
    const hist=getHist().filter(e=>e.iqScore!=null);
    const prevBest=hist.length>1?Math.max(...hist.slice(0,-1).map(e=>e.iqScore)):0;
    if(iq.totalScore>prevBest&&hist.length>0)setIsPB(true);
    const target=iq.totalScore;
    const duration=760;
    const steps=38;
    const interval=duration/steps;
    let step=0;
    const timer=setInterval(()=>{
      step++;
      const progress=step/steps;
      const eased=1-Math.pow(1-progress,3);
      setDisplayScore(Math.round(eased*target));
      if(step>=steps){clearInterval(timer);setDisplayScore(target);}
    },interval);
    return()=>clearInterval(timer);
  },[iq.totalScore]);

  const bestFitId=allSections?[...allSections].sort((a,b)=>b.score-a.score)[0]?.id:null;
  const matched=chosenSec&&bestFitId&&chosenSec===bestFitId;
  const coachLine=iq.levelExplanation||"A cleaner Charleston read, with one clear next move.";
  const cue=iq.totalScore>=85?"Clubhouse read":iq.totalScore>=72?"Strong table sense":iq.totalScore>=60?"Good learning rack":"Review rack";

  return(
    <div className="rk-iq-hero rk-sweep" style={isHome?{padding:"32px 22px 28px",borderRadius:28}:undefined}>
      <div className="rk-iq-glow" />
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginBottom:12}}>
        <span className="rk-live-spark" />
        <div className="rk-iq-label" style={{margin:0}}>{isDaily?`Daily Rackle · #${dayNum}`:"Practice Rackle"}</div>
      </div>
      <div className="rk-iq-score" style={isHome?{fontSize:88}:undefined}>{displayScore}</div>
      <div className="rk-iq-rule" />
      {isPB&&<div className="rk-pop rk-iq-style-pill" style={{marginBottom:12}}>🏆 New personal best</div>}
      <div className="rk-iq-sub">{iq.level}</div>
      {iq.styleName&&<div className="rk-iq-style-pill">{iq.styleName}</div>}
      <div className="rk-iq-summary">{coachLine}</div>
      {isHome&&(
        <div className="rk-home-score-cta">
          <span>{cue}</span>
          {section&&<span>{section}{chosenSec&&bestFitId?matched?" ✓":" · review":null}</span>}
          {totalTime>0&&<span>{fT(totalTime)}</span>}
        </div>
      )}
      {!isHome&&<div className="rk-iq-meta">
        {section&&<span>{section}{chosenSec&&bestFitId?matched?" ✓":" · review":null}</span>}
        {section&&totalTime>0&&<span>•</span>}
        {totalTime>0&&<span>{fT(totalTime)}</span>}
        {!section&&<span>{matched?"Best section read":"Section to review"}</span>}
      </div>}
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
  viral:{bg:"linear-gradient(135deg,#0D5B37,#064223)",shadow:"rgba(6,66,35,0.26)",color:"#fff",border:`1px solid rgba(243,212,107,.32)`},
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
      <button onClick={share} className="rk-share-card" style={{width:"100%",borderRadius:variant==="viral"?18:14,
        background:v.bg,border:v.border||"none",
        cursor:"pointer",display:"flex",alignItems:"center",gap:variant==="viral"?12:10,padding:variant==="viral"?"15px 16px":"11px 14px",
        textAlign:"left",boxShadow:variant==="viral"?`0 12px 26px ${v.shadow}, inset 0 1px 0 rgba(255,255,255,.16)`:`0 3px 12px ${v.shadow}`,transition:"opacity 0.15s"}}>
        <div style={{width:variant==="viral"?42:32,height:variant==="viral"?42:32,borderRadius:variant==="viral"?14:8,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:variant==="viral"?19:15,flexShrink:0}}>{copied?"✓":"📲"}</div>
        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:2}}>
          <div style={{fontFamily:F.d,fontSize:variant==="viral"?17:14,fontWeight:900,color:titleColor,lineHeight:1.1,letterSpacing:variant==="viral"?-.25:0}}>{copied?"Copied to clipboard!":label||"Challenge Your Club"}</div>
          <div style={{fontSize:variant==="viral"?12:11,color:subColor,lineHeight:1.35,fontWeight:variant==="viral"?750:400}}>{copied?"Paste it into your group chat":sublabel||"Tap to copy · Drop it in your group chat"}</div>
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
  const titleMap={
    "Direction Quality":"Direction",
    "Tile Strength":"Tile Read",
    "Pass Quality":"Passing",
    "Timing Score":"Flow",
    "Direction":"Direction",
    "Tile Read":"Tile Read",
    "Passing":"Passing",
    "Flow":"Flow",
  };
  const cleanLabel=titleMap[label]||label;
  const pct=Math.round(score/max*100);
  const coach=pct>=80?"Strong control":pct>=55?"Good foundation":"Needs attention";
  return(
    <div className="rk-breakdown-row">
      <div className="rk-breakdown-left">
        <div className="rk-breakdown-title">{cleanLabel}</div>
        <div className="rk-breakdown-sub">{note||coach}</div>
      </div>
      <div className="rk-breakdown-pill">{score}<span style={{opacity:.55,fontWeight:700}}>/{max}</span></div>
    </div>
  );
}

// CHIP
function Chip({label,type}){
  const muted=type==="neutral";
  return <span className={`rk-soft-pill ${muted?"rk-soft-pill-muted":""}`} style={{margin:"2px 3px"}}>{label}</span>;
}

// ─── SPECIFIC HAND RECOMMENDER CARD ─────────────────────────────────────────
function SpecificHandCard({finalRack,sectionId,defaultOpen=false,label:overrideLabel,pinnedHandLabel,showFit=true}){
  const [open,setOpen]=useState(defaultOpen);
  const [fitVisible,setFitVisible]=useState(showFit);
  if(!finalRack||!sectionId)return null;
  // Get all scored hands for section, sorted by fit
  const allHands=HAND_CATALOG.filter(h=>h.sec===sectionId)
    .map(h=>{const cov=computeHonestCoverage(finalRack,h);return{...h,fitScore:cov.pct/100,coveragePct:cov.pct,credibility:cov.credibility,isCredible:cov.isCredible,variantLabel:cov.variantLabel,labelForDisplay:cov.labelForDisplay,coveragePlan:cov.plan,groupNuance:cov.groupNuance,tone:cov.tone,coachLine:cov.coachLine};})
    .sort((a,b)=>(b.credibility-a.credibility)||(b.coveragePct-a.coveragePct));
  // If a pinned hand is specified, put it first
  let hands=allHands;
  if(pinnedHandLabel){
    const pinned=allHands.find(h=>h.label===pinnedHandLabel);
    const rest=allHands.filter(h=>h.label!==pinnedHandLabel).filter(h=>h.isCredible).slice(0,2);
    hands=pinned?[pinned,...rest]:allHands.filter(h=>h.isCredible).slice(0,3);
  } else {
    hands=allHands.filter(h=>h.isCredible).slice(0,3);
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
        {/* Fit toggle, only shown in free play (showFit=false by default) */}
        {!showFit&&(
          <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg2}}>
            <span style={{fontSize:10,color:C.mut,fontWeight:600}}>Rack fit scores hidden, free play</span>
            <button onClick={()=>setFitVisible(v=>!v)} style={{fontSize:10,fontWeight:700,color:fitVisible?C.cinn:C.jade,background:"none",border:`1px solid ${fitVisible?C.cinn+"40":C.jade+"40"}`,borderRadius:20,padding:"3px 10px",cursor:"pointer"}}>
              {fitVisible?"Hide scores":"Reveal scores"}
            </button>
          </div>
        )}
        {hands.map((hand,i)=>{
          const pct=Math.round((hand.coveragePct??hand.fitScore*100));
          const tone=hand.coveragePlan?rkCoachPathTone(hand.coveragePlan):coverageTone(pct);
          const barColor=tone.color;
          const verdict=`${tone.label}. ${hand.coachLine||tone.desc}`;
          const verdictColor=tone.color;

          // Tile analysis
          const jk=jokers(finalRack);
          const fl=flowers(finalRack);
          const numCounts={};
          finalRack.filter(t=>t.t==="s").forEach(t=>{numCounts[t.n]=(numCounts[t.n]||0)+1;});
          const wCounts={};finalRack.filter(t=>t.t==="w").forEach(t=>{wCounts[t.v]=(wCounts[t.v]||0)+1;});
          const dCounts={};finalRack.filter(t=>t.t==="d").forEach(t=>{dCounts[t.v]=(dCounts[t.v]||0)+1;});
          const label=hand.labelForDisplay||hand.variantLabel||hand.label;
          const numRefs=[...new Set((label.match(/\d+/g)||[]).map(Number).filter(n=>n>=1&&n<=9))];
          const strengths=[];const gaps=[];

          if(jk>=2&&!hand.concealed)strengths.push(`${jk} jokers, can fill any gap`);
          else if(jk===1&&!hand.concealed)strengths.push(`1 joker, use it on your weakest group`);
          if(hand.concealed&&jk>0)gaps.push(`Concealed hand, jokers can't be used`);

          numRefs.forEach(n=>{
            const have=numCounts[n]||0;
            const appearances=(label.match(new RegExp(n,'g'))||[]).length;
            const approxNeed=Math.min(appearances,4);
            if(have>=approxNeed&&have>=2)strengths.push(`${have}× ${n} ✓`);
            else if(have>0&&have<approxNeed)gaps.push(`Need ${approxNeed-have} more ${n}s (have ${have})`);
            else if(have===0&&approxNeed>=2)gaps.push(`Missing ${n}s, critical for this hand`);
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
            ?"Hold everything, this rack is nearly there."
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
                  {fitVisible&&<div style={{fontSize:11,color:verdictColor,fontWeight:600}}>{verdict}</div>}
                </div>
                {fitVisible?(
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:barColor,lineHeight:1}}>{pct}<span style={{fontSize:10,fontWeight:400,color:C.mut}}>%</span></div>
                    <div style={{fontSize:9,color:C.mut}}>rack fit</div>
                  </div>
                ):(
                  <div style={{flexShrink:0,width:36,height:36,borderRadius:10,background:C.bg2,border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:16}}>?</span>
                  </div>
                )}
              </div>

              {/* Fit bar, hidden in practice until revealed */}
              {fitVisible&&(
                <div style={{height:5,borderRadius:3,background:C.bdr,overflow:"hidden",marginBottom:12}}>
                  <div className="rk-bar" style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${barColor},${barColor}CC)`,width:`${pct}%`,"--w":`${pct}%`}}/>
                </div>
              )}
              {!fitVisible&&<div style={{height:5,borderRadius:3,background:C.bdr,marginBottom:12,opacity:0.3}}/>}

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

// ─── SHARED SECTION DIVIDER ───────────────────────────────────────────────────
function SectionDivider({label}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 10px"}}>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.bdr},transparent)`}}/>
      <span style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,flexShrink:0}}>{label}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.bdr})`}}/>
    </div>
  );
}

// ─── SORTABLE RACK, final rack display with sort button ──────────────────────
function SortableRack({hand:initialHand}){
  const [rack,setRack]=useState(initialHand);
  const [sorted,setSorted]=useState(false);
  const toggle=()=>{
    if(sorted){setRack(initialHand);setSorted(false);}
    else{setRack(sortHand(initialHand));setSorted(true);}
  };
  return(
    <div className="rk-lux-card" style={{...S.card,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:9,color:C.mut,letterSpacing:1.2,fontWeight:500}}>Final rack</div>
        <button onClick={toggle} className="rk-leaderboard-card" style={{...S.sortBtn,color:sorted?C.jade:C.mut,borderColor:sorted?C.jade+"40":C.bdr,background:sorted?C.jade+"08":"none"}}>{sorted?"Sorted":"Sort"}</button>
      </div>
      <RackSurface>{rack.map((t,i)=><Ti key={i} t={t}/>)}</RackSurface>
    </div>
  );
}

// ─── COLLAPSIBLE SECTION HEADER, tap to expand/collapse ──────────────────────
function sectionTitleCase(text){
  if(!text)return text;
  return String(text).split(" ").map(word=>{
    if(!word)return word;
    return word.charAt(0).toUpperCase()+word.slice(1);
  }).join(" ");
}
function sectionDescCase(text){
  if(!text)return text;
  return String(text)
    .replace(/best path/gi,"Best path")
    .replace(/practice recommendations/gi,"Recommendations")
    .replace(/coach mode/g,"Coach Mode");
}

function CollapsibleSection({label,desc,open,onToggle,children,badge,icon}){
  const headerLabel=sectionTitleCase(label);
  const headerDesc=sectionDescCase(desc);
  return(
    <div style={{marginTop:11,marginBottom:0}}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width:"100%",cursor:"pointer",textAlign:"left",
          display:"flex",alignItems:"center",gap:11,
          padding:"15px 15px",
          borderRadius:20,
          background:open?"linear-gradient(145deg,#FFFDF8,#F6F1E7)":"linear-gradient(145deg,#FFFDF8,#F8F3EA)",
          border:`1px solid ${open?C.jade+"32":"#E7DFD2"}`,
          boxShadow:open
            ?"0 10px 26px rgba(23,107,66,0.075), 0 1px 0 rgba(255,255,255,0.9) inset"
            :"0 6px 18px rgba(26,20,16,0.035), 0 1px 0 rgba(255,255,255,0.9) inset",
          transition:"all 0.18s ease",
          position:"relative",
          overflow:"hidden",
        }}
      >
        <div style={{position:"absolute",left:0,right:0,top:0,height:2,background:open?`linear-gradient(90deg,${C.jade},${C.gilt})`:`linear-gradient(90deg,${C.bdr},transparent)`,opacity:open?0.85:0.35}}/>

        {icon&&(
          <div style={{
            width:36,height:36,borderRadius:12,flexShrink:0,
            background:open?"linear-gradient(145deg,#FDF9F1,#F4EFE6)":"#F8F4EE",
            border:`1px solid ${open?C.jade+"22":"#E8E0D2"}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,lineHeight:1,
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 5px rgba(0,0,0,0.04)",
          }}>{icon}</div>
        )}

        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2,flexWrap:"wrap"}}>
            <div style={{
              fontSize:15,fontWeight:900,fontFamily:F.d,
              color:C.ink,lineHeight:1.06,letterSpacing:-0.2,
            }}>{headerLabel}</div>
            {badge&&(
              <span style={{
                fontSize:9,fontWeight:900,fontFamily:F.b,flexShrink:0,
                color:open?C.jade:C.mut,
                background:open?C.jade+"10":"#F3EEE6",
                borderRadius:999,padding:"4px 8px",lineHeight:1,
                border:`1px solid ${open?C.jade+"20":"#E5DED2"}`,
              }}>{badge}</span>
            )}
          </div>
          {desc&&(
            <div style={{
              fontSize:11,marginTop:2,lineHeight:1.35,
              color:C.mut,fontWeight:500,letterSpacing:0.01,
            }}>{headerDesc}</div>
          )}
        </div>

        <div style={{
          width:30,height:30,borderRadius:11,flexShrink:0,
          background:open?C.jade+"10":"#F3EEE6",
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"background 0.2s, transform 0.25s ease",
          transform:open?"rotate(180deg)":"rotate(0deg)",
          border:`1px solid ${open?C.jade+"18":"#E8E0D2"}`,
        }}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke={open?C.jade:C.mut} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      {open&&<div className="rk-in" style={{marginTop:7}}>{children}</div>}
    </div>
  );
}


function ImproveGameHero({iq,chosenSecObj,bestFitSec,onPractice,onCoachMode,setScreen}){
  if(!iq)return null;
  const sectionName=chosenSecObj?.name||bestFitSec?.name||"your best lane";
  const passScore=iq.passQualityScore ?? 0;
  const tileScore=iq.tileStrengthScore ?? 0;
  const dirScore=iq.directionScore ?? 0;
  const mainTip = dirScore < 24
    ? "Start with the section your rack is already whispering."
    : passScore < 15
    ? "Your next jump comes from cleaner passes."
    : tileScore < 17
    ? "Protect the groups before chasing loose connections."
    : "You had a strong read. Now sharpen the next decision.";
  return(
    <div className="rk-improve-hero rk-sweep">
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontSize:9,letterSpacing:2.7,fontWeight:950,color:"rgba(243,212,107,.82)",textTransform:"uppercase",marginBottom:8}}>Improve Your Game</div>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:950,lineHeight:1.05,letterSpacing:-.65,marginBottom:8}}>Your next better read starts here.</div>
        <div style={{fontSize:13,lineHeight:1.55,color:"rgba(255,255,255,.72)",maxWidth:300,margin:"0 auto"}}>{mainTip}</div>
        <div className="rk-improve-path-row">
          <div className="rk-improve-path-chip rk-improve-path-chip-primary"><strong>{iq.totalScore}</strong><span>Rackle IQ</span></div>
          <div className="rk-improve-path-chip rk-improve-path-chip-label" title={sectionName}><strong>{sectionName}</strong><span>Best lane</span></div>
          <div className="rk-improve-path-chip rk-improve-path-chip-label"><strong>{iq.level?.split(" ")?.[0]||"Ready"}</strong><span>Today’s read</span></div>
        </div>
        <div style={{display:"flex",gap:9,marginTop:14}}>
          {onCoachMode&&<button onClick={onCoachMode} className="rk-primary-btn" style={{flex:1,borderRadius:15,padding:"12px 10px",color:"#fff",fontSize:13,fontWeight:950,fontFamily:F.d,cursor:"pointer"}}>Open Coach →</button>}
          {onPractice&&<button onClick={onPractice} style={{flex:1,borderRadius:15,padding:"12px 10px",background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.16)",color:"#fff",fontSize:13,fontWeight:950,fontFamily:F.d,cursor:"pointer"}}>Replay rack →</button>}
        </div>
      </div>
    </div>
  );
}

function DailyIQScorecard({iq,hand,startingRack,passLog,dayNum,section,chosenSec,chosenHand,allSections,onHome,onPractice,onCoachMode,setScreen}){
  const [dailyStats,setDailyStats]=useState(null);
  const [globalEntries,setGlobalEntries]=useState([]);
  const [clubEntries,setClubEntries]=useState([]);
  const [showDetails,setShowDetails]=useState(false);
  if(!iq)return null;

  useEffect(()=>{
    fetchDailyStats().then(s=>{if(s)setDailyStats(s);}).catch(()=>{});
    fetchGlobalEntries().then(rows=>{if(rows)setGlobalEntries(rows);}).catch(()=>{});
    const clubCode=getClubCode();
    if(clubCode)fetchLBEntries(clubCode).then(rows=>{if(rows)setClubEntries(rows);}).catch(()=>{});
  },[]);

  const score=Number(iq.totalScore||0);
  const time=Number(iq.timeSecs||iq.time_secs||0);
  const clubCode=getClubCode();
  const playerName=getPlayerDisplayName()||rkCurrentDisplayName?.()||"";
  const affiliatedClubName=getAffiliatedClubName(clubCode);
  const globalRows=rkMergeCurrentScore(globalEntries,score,time,iq.streak||0,clubCode);
  const clubRows=clubCode?rkMergeCurrentScore(clubEntries,score,time,iq.streak||0,clubCode):[];
  const globalRank=rkRankOfCurrent(globalRows,score);
  const clubRank=clubCode?rkRankOfCurrent(clubRows,score):null;
  const globalTotal=globalRows.length||dailyStats?.total||dailyStats?.count||null;
  const clubTotal=clubCode?clubRows.length:null;
  const rankLine=globalRank&&globalTotal?`#${globalRank} of ${globalTotal} today${clubRank&&clubTotal?` · #${clubRank} in ${affiliatedClubName||"your club"}`:""}`:clubRank&&clubTotal?`#${clubRank} of ${clubTotal} in ${affiliatedClubName||"your club"}`:"";
  const roomCount=Number(globalTotal||globalRows.length||0);
  const roomLabel=roomCount===1?"1 player played today":`${roomCount||1} players played today`;
  const clubShortName=affiliatedClubName?affiliatedClubName.replace(/\s+Mahjong Club$/i,""):"";
  const clubRoomLabel=affiliatedClubName?`${clubShortName||affiliatedClubName} is chasing ${score}`:"Your group can chase this";
  const socialAvatarCount=Math.min(3,Math.max(1,roomCount||clubTotal||1));

  const passEmoji=(iq.passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");
  const passDots=(iq.passInsights||[]).slice(0,3);
  const quickRead=(()=>{
    if(score>=85)return "Great read. Hard to chase.";
    if(score>=70)return "Strong read. Share it.";
    if(score>=55)return "Playable. Stay in it.";
    if(score>=40)return "Scrappy, but alive.";
    return "Tough rack. Try again.";
  })();
  const scoreLabel=score>=85?"Excellent":score>=70?"Strong":score>=55?"Playable":score>=40?"Scrappy":"Tough";
  const scoreAccent=score>=85?C.gold:score>=70?C.jade:score>=55?"#2460A8":score>=40?C.gold:C.cinn;
  const shareName=(playerName||"I").trim();
  const shareClubLine=affiliatedClubName
    ? `${clubRank?`#${clubRank} in `:""}${affiliatedClubName}`
    : globalRank?`#${globalRank} on today’s Rackle board`:"";
  const shareText=[
    `Rackle #${dayNum}`,
    `${shareName}: ${score} · ${scoreLabel}`,
    globalRank?`Global #${globalRank}${globalTotal?` of ${globalTotal}`:""}`:"",
    shareClubLine,
    passEmoji?`Passes ${passEmoji}`:"",
    `Beat ${score}: playrackle.com`
  ].filter(Boolean).join("\n");
  const viralPrompt=affiliatedClubName?`Can ${affiliatedClubName} beat ${score} before midnight?`:`Can your group beat ${score} before midnight?`;
  const scoredHandLabel=iq.scoredHandLabel||chosenHand||null;
  const scoredHandObj=scoredHandLabel?HAND_CATALOG.find(h=>h.sec===chosenSec&&h.label===scoredHandLabel):null;

  const Metric=({label,value,sub,accent=C.ink,onClick})=>{
    const Tag=onClick?"button":"div";
    return(
      <Tag onClick={onClick} style={{
        border:`1px solid rgba(26,20,16,.075)`,borderRadius:18,
        background:"linear-gradient(145deg,#FFFDF8,#F7F0E5)",
        boxShadow:"0 5px 16px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.78)",
        padding:"13px 10px",textAlign:"center",fontFamily:F.b,cursor:onClick?"pointer":"default",
        width:"100%",appearance:"none"
      }}>
        <div style={{fontSize:8,letterSpacing:1.6,textTransform:"uppercase",fontWeight:950,color:"rgba(26,20,16,.45)",marginBottom:5}}>{label}</div>
        <div style={{fontFamily:F.d,fontSize:22,lineHeight:1,fontWeight:950,color:accent,letterSpacing:-.7}}>{value}</div>
        {sub&&<div style={{fontSize:10,lineHeight:1.25,color:C.mut,fontWeight:750,marginTop:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</div>}
      </Tag>
    );
  };

  return(
    <div className="rk-score-shell rk-score-ultra-simple" style={{paddingBottom:32}}>
      <div style={{textAlign:"center",margin:"8px 0 16px"}}>
        <div style={{fontSize:9,letterSpacing:2.4,textTransform:"uppercase",fontWeight:950,color:C.jade,marginBottom:6}}>Daily Rackle #{dayNum}</div>
        <div style={{fontFamily:F.d,fontSize:28,lineHeight:1.02,fontWeight:950,color:C.ink,letterSpacing:-.8}}>Scorecard</div>
      </div>

      <div className="rk-iq-hero rk-sweep" style={{padding:"28px 22px 22px",borderRadius:28,marginBottom:14}}>
        <div className="rk-iq-glow"/>
        <div style={{position:"relative",zIndex:2,textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:2.8,textTransform:"uppercase",fontWeight:950,color:"rgba(255,255,255,.52)",marginBottom:10}}>Rackle IQ</div>
          <div style={{fontFamily:F.d,fontSize:88,lineHeight:.86,fontWeight:950,letterSpacing:-4,color:"#F3D46B",marginBottom:14}}>{score}</div>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,border:`1px solid rgba(243,212,107,.38)`,background:"rgba(255,255,255,.08)",borderRadius:999,padding:"7px 14px",color:"#F3D46B",fontSize:12,fontWeight:950,marginBottom:14}}>
            <span>{scoreLabel}</span>
            <span style={{opacity:.5}}>·</span>
            <span>{iq.level}</span>
          </div>
          <div style={{fontSize:14,lineHeight:1.45,color:"rgba(255,255,255,.78)",fontWeight:750,maxWidth:290,margin:"0 auto"}}>{quickRead}</div>
          {rankLine&&<div style={{fontSize:11,lineHeight:1.35,color:"rgba(255,255,255,.58)",fontWeight:800,marginTop:12}}>{rankLine}</div>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,marginBottom:12}}>
        <Metric label="Global" value={globalRank?`#${globalRank}`:"—"} sub={globalTotal?`of ${globalTotal}`:"loading"} accent={globalRank===1?C.gold:C.jade} onClick={()=>setScreen&&setScreen("globalLeaderboard")}/>
        <Metric label="Club" value={clubRank?`#${clubRank}`:"—"} sub={affiliatedClubName||"join"} accent={clubRank===1?C.gold:C.jade} onClick={()=>setScreen&&setScreen(clubCode?"leaderboard":"clubs")}/>
        <Metric label="Time" value={time?`${time}s`:"—"} sub="finished" accent={C.ink}/>
      </div>

      <button onClick={()=>setScreen&&setScreen(clubCode?"leaderboard":"globalLeaderboard")} className="rk-score-social-room" style={{width:"100%",appearance:"none",fontFamily:F.b,cursor:"pointer"}}>
        <span className="rk-score-social-left">
          <span className="rk-score-social-icon">{clubCode?"🏛️":"🌎"}</span>
          <span style={{minWidth:0}}>
            <span className="rk-score-social-title">{clubCode?"Club Room":"Today’s Room"}</span>
            <span className="rk-score-social-copy">{clubCode?clubRoomLabel:roomLabel}</span>
          </span>
        </span>
        <span className="rk-score-avatar-stack" aria-hidden="true">
          {Array.from({length:socialAvatarCount}).map((_,i)=><span key={i} className="rk-score-avatar-dot" style={i%2?{background:"linear-gradient(145deg,#176B42,#DDEBDF)"}:undefined}/>) }
        </span>
      </button>

      <div className="rk-score-share-card">
        <div style={{display:"flex",alignItems:"center",gap:10,margin:"0 2px 10px",textAlign:"left"}}>
          <span style={{width:38,height:38,borderRadius:14,display:"inline-flex",alignItems:"center",justifyContent:"center",background:"rgba(23,107,66,.08)",border:`1px solid rgba(23,107,66,.10)`,fontSize:18}}>📲</span>
          <span style={{minWidth:0}}>
            <span style={{display:"block",fontFamily:F.d,fontSize:18,lineHeight:1.04,fontWeight:950,color:C.ink,letterSpacing:-.3}}>Send it to the table</span>
            <span style={{display:"block",fontSize:12,lineHeight:1.35,color:C.mut,fontWeight:800,marginTop:4}}>{viralPrompt}</span>
          </span>
        </div>
        <ShareButton text={shareText} label={affiliatedClubName?"Share to my club":"Share your score"} sublabel={affiliatedClubName?`Drop it in ${affiliatedClubName}`:"Drop it in your group chat"} variant="viral"/>
      </div>

      <div className="rk-score-rack-card" style={{borderRadius:22,padding:14,background:"linear-gradient(145deg,#FFFDF8,#F7F0E5)",border:`1px solid rgba(26,20,16,.075)`,boxShadow:"0 8px 24px rgba(26,20,16,.045),inset 0 1px 0 rgba(255,255,255,.78)",marginBottom:12,textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12}}>
          <div style={{textAlign:"left"}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:950,color:C.ink,lineHeight:1.08}}>Your rack</div>
            <div style={{fontSize:11,color:C.mut,fontWeight:750,marginTop:3}}>Final Charleston shape</div>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {passDots.length?passDots.map((p,i)=>{
              const col=p.quality==="strong"?C.jade:p.quality==="weak"?C.cinn:C.gold;
              return <span key={i} title={`Pass ${i+1}`} style={{width:9,height:9,borderRadius:999,background:col,boxShadow:`0 0 0 4px ${col}16`}}/>;
            }):<span style={{fontSize:10,color:C.mut,fontWeight:800}}>No passes</span>}
          </div>
        </div>
        <SortableRack hand={hand}/>
      </div>

      <div className="rk-score-action-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
        <button onClick={()=>setScreen&&setScreen("globalLeaderboard")} className="rk-secondary-btn" style={{borderRadius:16,padding:"13px 10px",border:`1px solid rgba(23,107,66,.13)`,fontSize:12,fontWeight:950,color:C.jade,cursor:"pointer"}}>Global Board</button>
        <button onClick={()=>setScreen&&setScreen(clubCode?"leaderboard":"clubs")} className="rk-secondary-btn" style={{borderRadius:16,padding:"13px 10px",border:`1px solid rgba(23,107,66,.13)`,fontSize:12,fontWeight:950,color:C.ink,cursor:"pointer"}}>{clubCode?"Club Room":"Join Club"}</button>
        <button onClick={onPractice} className="rk-secondary-btn" style={{borderRadius:16,padding:"13px 10px",border:`1px solid rgba(23,107,66,.13)`,fontSize:12,fontWeight:950,color:C.jade,cursor:"pointer"}}>Play Again</button>
        {onCoachMode?<button onClick={onCoachMode} className="rk-secondary-btn" style={{borderRadius:16,padding:"13px 10px",border:`1px solid rgba(23,107,66,.13)`,fontSize:12,fontWeight:950,color:C.ink,cursor:"pointer"}}>Quick Coach</button>:<button onClick={onHome} className="rk-secondary-btn" style={{borderRadius:16,padding:"13px 10px",border:`1px solid rgba(23,107,66,.13)`,fontSize:12,fontWeight:950,color:C.ink,cursor:"pointer"}}>Home</button>}
      </div>

      <button onClick={()=>setShowDetails(v=>!v)} style={{width:"100%",border:`1px solid rgba(26,20,16,.075)`,borderRadius:16,background:"rgba(255,255,255,.55)",padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:F.b,cursor:"pointer",marginBottom:showDetails?10:16}}>
        <span style={{fontSize:12,fontWeight:950,color:C.ink}}>Rack detail</span>
        <span style={{fontSize:12,color:C.mut,fontWeight:950}}>{showDetails?"⌃":"⌄"}</span>
      </button>
      {showDetails&&(
        <div className="rk-score-card" style={{padding:14,marginBottom:16,textAlign:"center"}}>
          <HandTargetPreview hand={hand} scoredHandObj={scoredHandObj} chosenSec={chosenSec} chosenSecObj={chosenSec&&SECS.find(s=>s.id===chosenSec)} iq={iq} onCoachMode={onCoachMode}/>
        </div>
      )}

      <div className="rk-review-bottom-home" style={{display:"grid",gap:10}}>
        <MidnightCountdown dn={dayNum}/>
        <button onClick={onHome} style={{
          width:"100%",border:`1px solid ${C.bdr}`,borderRadius:16,
          background:"linear-gradient(180deg,#FFFDF8,#F1E9DB)",color:C.mut,
          fontSize:13,fontWeight:900,cursor:"pointer",padding:"13px 0",letterSpacing:.2,
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          boxShadow:"0 5px 16px rgba(26,20,16,.035),inset 0 1px 0 rgba(255,255,255,.75)"
        }}>
          <span style={{fontSize:12,opacity:.65}}>←</span> Back to clubhouse
        </button>
      </div>
    </div>
  );
}

// ─── PRACTICE SCORECARD, collapsible sections, matching daily vibe ───────────
function PracticeIQScorecard({iq,hand,passLog,section,chosenSec,allSections,onHome,onDealAgain}){
  if(!iq)return null;
  const scoreColor=(v,max)=>v/max>=0.8?C.jade:v/max>=0.55?C.gold:C.cinn;
  const chosenSecObj=chosenSec&&SECS.find(s=>s.id===chosenSec);
  const scoredHandLabel=iq.scoredHandLabel||null;
  const scoredHandObj=scoredHandLabel?HAND_CATALOG.find(h=>h.sec===chosenSec&&h.label===scoredHandLabel):null;
  const sortedSecsP=allSections?[...allSections].sort((a,b)=>b.score-a.score):[];

  const [openSec,setOpenSec]=useState({hand:false,alts:false,score:false,passes:false});
  const toggle=(k)=>setOpenSec(s=>({...s,[k]:!s[k]}));

  // Pass quality dots for badge
  const passDots=(iq.passInsights||[]).map(p=>({strong:"🟢",weak:"🔴",mixed:"🟡",neutral:"⚪"}[p.quality]||"⚪")).join("");

  return(
    <div className="rk-score-shell">
      <div className="rk-editorial-header">
        <div className="rk-editorial-kicker">Practice</div>
        <div className="rk-editorial-title">Practice Scorecard</div>
        <div className="rk-editorial-copy">A fast read on your rack, confidence, and next best move.</div>
      </div>
      <div className="rk-score-divider" />
      {/* IQ Hero */}
      <div style={{marginBottom:10}}>
        <IQHero iq={iq} isDaily={false} section={section} totalTime={iq.totalTime||0} chosenSec={chosenSec} allSections={allSections}/>
      </div>

      <StrategicCharlestonReadCard iq={iq}/>

      {/* YOUR HAND, rack only, closed */}
      <CollapsibleSection label="Your Hand" desc="Final rack · Best path" icon="🀄" open={openSec.hand} onToggle={()=>toggle("hand")}>
        {hand&&hand.length>0&&<SortableRack hand={hand}/>}
        {scoredHandObj&&<HandTargetPreview hand={hand} scoredHandObj={scoredHandObj} chosenSec={chosenSec} chosenSecObj={chosenSecObj} iq={iq} onCoachMode={null}/>}
      </CollapsibleSection>

      {/* OTHER HANDS, closed */}
      {hand&&hand.length>0&&chosenSec&&(()=>{
        const primPct=scoredHandObj?computeHonestCoverage(hand,scoredHandObj).pct:0;
        return(
          <CollapsibleSection label="Other Paths" desc="A few roads you could have taken" icon="🔀" open={openSec.alts} onToggle={()=>toggle("alts")}>
            <AltHandsCard hand={hand} resolvedHandLabel={scoredHandObj?.label||null} chosenSec={chosenSec} chosenSecObj={chosenSecObj} sortedSecs={sortedSecsP} primaryCoveragePct={primPct}/>
          </CollapsibleSection>
        );
      })()}

      {/* YOUR PASSES, closed, dots badge */}
      {iq.passInsights&&iq.passInsights.length>0&&(
        <CollapsibleSection label="Your Passes" desc="The passes that shaped the Charleston" icon="🔄" open={openSec.passes} onToggle={()=>toggle("passes")} badge={passDots||undefined}>
          <div className="rk-score-card" style={{marginBottom:8,padding:0,overflow:"hidden"}}>
            {iq.passInsights.map((p,i)=>{
              const qBg={strong:"#EDF5F0",weak:"#FEF0F0",mixed:"#FBF3E2",neutral:"#fff"};
              const qColor={strong:C.jade,weak:C.cinn,mixed:C.amberB,neutral:C.mut};
              const qLabel={strong:"Clean pass",weak:"Risky pass",mixed:"Mixed pass",neutral:"Neutral"};
              return(
                <div key={i} style={{background:qBg[p.quality]||"#fff",borderTop:i>0?`1px solid ${C.bdr}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",borderBottom:p.passedTiles?.length?`1px solid ${C.bdr}40`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:20,height:20,borderRadius:10,background:(qColor[p.quality]||C.mut)+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:qColor[p.quality]||C.mut,flexShrink:0}}>{i+1}</div>
                      <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{p.roundName||`Pass ${i+1}`}</span>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:qColor[p.quality]||C.mut,background:(qColor[p.quality]||C.mut)+"15",borderRadius:20,padding:"2px 8px"}}>{qLabel[p.quality]||""}</span>
                  </div>
                  {p.passedTiles&&p.passedTiles.length>0&&(
                    <div style={{padding:"7px 14px",borderBottom:`1px solid ${C.bdr}40`}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{p.passedTiles.map((t,j)=><Ti key={j} t={t}/>)}</div>
                    </div>
                  )}
                  <div style={{padding:"7px 14px"}}>
                    <p style={{fontSize:11,color:C.ink,margin:0,lineHeight:1.55}}>{p.insight}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}


      {/* Actions */}
      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={onHome} style={{
          flex:1,border:`1px solid ${C.bdr}`,borderRadius:12,
          background:"transparent",color:C.mut,
          fontSize:12,fontWeight:700,cursor:"pointer",
          padding:"11px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        }}>
          <span style={{opacity:0.6}}>←</span> Home
        </button>
        <button onClick={onDealAgain} style={{
          flex:2,padding:"13px 0",
          background:`linear-gradient(135deg,${C.jade},#0F5535)`,
          color:"#fff",border:"none",borderRadius:12,
          fontSize:14,fontFamily:F.d,fontWeight:800,letterSpacing:0.5,
          cursor:"pointer",boxShadow:`0 4px 16px rgba(27,125,78,0.3)`,
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:48,
        }}>
          <span>🀄</span><span>Deal Again</span>
        </button>
      </div>
      <Footer/>
    </div>
  );
}
// ─── RACK VS HAND OVERLAY ─────────────────────────────────────────────────────
// The centrepiece of Coach Mode. Shows the target hand tile-by-tile, with each
// slot annotated: ✓ held, ✗ passed in round N, ○ never had it.
// Also surfaces the "gap sentence", the precise tiles that stood between the
// player and completing this hand.
function RackVsHandOverlay({hand, handObj, passLog, sectionId, handWasInferred, secObj}){
  if(!handObj||!hand)return null;

  const plan=buildCoveragePlan(hand,handObj,passLog||[]);
  const groups=plan.groups;
  const cardColors=plan.cardColors;
  const displayHandLabel=plan.labelForDisplay||plan.variantLabel||handObj.label;
  const groupStatus=plan.groupStatus;

  // Compute summary numbers from the best abstract-suit mapping.
  // This prevents alternate paths from looking like they only match one tile
  // when the hand can legally be played in another suit.
  const totalSlots=plan.total;
  const totalHeld=plan.held;
  const totalGap=Math.max(0,totalSlots-totalHeld);
  const pct=plan.pct;
  const pathTone=rkCoachPathTone(plan);
  const criticalPasses=groupStatus.filter(s=>s.gap>0&&s.passedMatching.length>0);

  // Gap sentence
  const gapParts=[];
  groupStatus.forEach(s=>{
    if(s.gap<=0)return;
    const tileName=s.g.isFlower?"Flower":s.g.isSoap?"Soap":s.g.isWind?`${s.g.tile} Wind`:s.g.isDragon?"Dragon":`${s.g.tile}`;
    const resolved=s.resolvedSuit?` (${RACKLE_SUIT_LABELS[s.resolvedSuit]})`:(s.cc==="K"?" (any suit)":"");
    gapParts.push(`${s.gap} more ${tileName}${resolved}`);
  });
  const gapSentence=gapParts.length===0
    ?"Your rack covered every group in this hand, exceptional."
    :`You needed ${gapParts.slice(0,3).join(", ")} to complete this hand.`;

  // Critical pass sentence
  const critPassSentence=criticalPasses.length>0
    ?`${criticalPasses.map(s=>{
        const tileName=s.g.isFlower?"Flower":s.g.isSoap?"Soap":s.g.isWind?`${s.g.tile} Wind`:s.g.isDragon?"Dragon":`${s.g.tile}`;
        return`${s.passedMatching.length}× ${tileName} (${s.passedRounds.join(", ")})`;
      }).slice(0,2).join(" and ")}, tiles this hand needed, left your rack during passing.`
    :null;

  const barCol=pct>=80?C.jade:pct>=55?C.gold:C.cinn;

  // Render an individual tile slot
  const SlotTile=({status,slotIdx})=>{
    const{g,cc,totalHeld,need,gap,passedMatching,passedRounds,resolvedSuit}=status;
    // Which slots in this group are filled vs empty?
    const isFilled=slotIdx<totalHeld;
    const isJoker=slotIdx>=status.naturalHeld&&slotIdx<totalHeld; // joker-filled slot
    const wasPassed=!isFilled&&passedMatching.length>0;

    const col=isFilled
      ?(cc?CARD_COL[cc]||CARD_COL.K:g.isFlower?CARD_COL.F:g.isSoap?CARD_COL.S:g.isWind?CARD_COL.W:g.isDragon?CARD_COL.D:CARD_COL.K)
      :wasPassed?C.cinn+"99":"#C0BAB0";

    const bg=isFilled
      ?(cc==="G"?"#EDF5F0":cc==="R"?"#FEF0F0":cc==="K"?"#F4F1EC":g.isFlower?"#F5EFF8":g.isSoap?"#F3F2F0":g.isWind?"#EEEAE5":g.isDragon?"#FEF0F0":"#F0EDE8")
      :wasPassed?"#FFF0F0":"#F5F3F0";

    const label=isJoker?"🃏":
      g.isFlower?"🌸":
      g.isSoap?"白":
      g.isWind?g.tile:
      g.isDragon?"龍":
      g.tile;

    const sub=isFilled
      ?(isJoker?"Joker":resolvedSuit?RACKLE_SUIT_LABELS[resolvedSuit]:cc==="G"?"Bam":cc==="R"?"Crak":cc==="K"?"Any":g.isFlower?"✓":g.isWind?"✓":g.isDragon?"✓":"✓")
      :wasPassed?`P${(passedRounds[0]||"").charAt(0)||"?"}`:",";

    return(
      <div style={{
        width:26,height:36,borderRadius:5,flexShrink:0,
        background:bg,
        border:`1.5px solid ${isFilled?col+"50":wasPassed?C.cinn+"40":"#D8D2CC"}`,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        opacity:isFilled?1:0.75,
        boxShadow:isFilled?`0 1px 4px ${col}18`:"none",
      }}>
        <span style={{fontSize:g.isFlower?12:11,fontWeight:800,color:isFilled?col:wasPassed?C.cinn:"#B0AAA0",lineHeight:1}}>{isFilled||wasPassed?label:"·"}</span>
        <span style={{fontSize:5.5,fontWeight:700,color:isFilled?col+"CC":wasPassed?C.cinn+"AA":"#C0BAB0",marginTop:1,letterSpacing:0.2}}>{sub}</span>
      </div>
    );
  };

  return(
    <div style={{...S.card,marginBottom:10,padding:0,overflow:"hidden"}}>

      {/* Header */}
      <div style={{padding:"10px 14px",background:handWasInferred?C.amber:C.sage,borderBottom:`1px solid ${handWasInferred?C.amberB+"30":C.sageB+"20"}`}}>
        <div style={{fontSize:8,color:handWasInferred?C.amberB:C.sageB,letterSpacing:2,fontWeight:700,marginBottom:3}}>
          {handWasInferred?"BEST-FIT HAND, INFERRED":"YOUR TARGET HAND"}
        </div>
        <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,letterSpacing:-0.3,marginBottom:2}}>
          {displayHandLabel}
        </div>
        <div style={{fontSize:10,color:C.mut}}>{handObj.constraint||secObj?.name} · {handObj.concealed?"Concealed":"Open"} · {handObj.value} pts</div>
      </div>

      {/* Inferred note */}
      {handWasInferred&&(
        <div style={{padding:"8px 14px",background:"#FBF3E2",borderBottom:`1px solid ${C.amberB}20`}}>
          <p style={{fontSize:11,color:C.amberB,margin:0,lineHeight:1.5}}>You picked <strong>{secObj?.name}</strong>, this was your strongest hand within it. Picking a specific hand next time unlocks suit-level scoring.</p>
        </div>
      )}

      {/* Human path read */}
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.bdr}`,background:"#FFFCF7"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:7}}>
          <span style={{fontSize:9,color:C.mut,letterSpacing:1.5,fontWeight:900}}>PATH READ</span>
          <span style={{fontSize:10,fontWeight:900,color:pathTone.color,background:pathTone.color+"12",border:`1px solid ${pathTone.color}22`,borderRadius:999,padding:"4px 9px"}}>{pathTone.label}</span>
        </div>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.55,marginBottom:8}}>{pathTone.desc} You were holding {totalHeld} useful tile{totalHeld===1?"":"s"} for this shape and still needed {totalGap}.</div>
        <div style={{fontSize:12,color:C.mut,lineHeight:1.55,marginBottom:8,fontWeight:700}}>{rkShortCoachLine(plan)}</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:8,height:8,borderRadius:4,background:C.jade}}/>
            <span style={{fontSize:9,color:C.mut,fontWeight:600}}>held</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:8,height:8,borderRadius:4,background:C.cinn}}/>
            <span style={{fontSize:9,color:C.mut,fontWeight:600}}>still needed</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:8,height:8,borderRadius:4,border:`1.5px solid #C0BAB0`,background:"#F5F3F0"}}/>
            <span style={{fontSize:9,color:C.mut,fontWeight:600}}>not seen</span>
          </div>
          {criticalPasses.length>0&&<div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:8,height:8,borderRadius:4,background:C.cinn+"60",border:`1.5px solid ${C.cinn}50`}}/>
            <span style={{fontSize:9,color:C.mut,fontWeight:600}}>passed away</span>
          </div>}
        </div>
      </div>

      {/* Tile-by-tile overlay, each group with its slots */}
      <div style={{padding:"12px 14px",background:C.bg2,overflowX:"hidden"}}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginBottom:8}}>HAND SHAPE</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end",width:"100%",maxWidth:"100%"}}>
          {groupStatus.map((status,gi)=>(
            <div key={gi} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{display:"flex",gap:2}}>
                {Array.from({length:status.need}).map((_,slotIdx)=>(
                  <SlotTile key={slotIdx} status={status} slotIdx={slotIdx}/>
                ))}
              </div>
              {/* Group type label */}
              <div style={{fontSize:7,color:C.mut,fontWeight:600,textAlign:"center",lineHeight:1.2}}>
                {GROUP_TYPES[status.g.type]?.name||status.g.type}
                {status.gap===0&&<span style={{color:C.jade}}> ✓</span>}
                {status.gap>0&&status.passedMatching.length>0&&<span style={{color:C.cinn}}> ✗</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gap analysis */}
      <div style={{padding:"10px 14px"}}>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.6,margin:"0 0 6px",fontWeight:500}}>{gapSentence}</p>
        {critPassSentence&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:8,background:"#FEF0F0",borderRadius:8,padding:"8px 10px",marginTop:6,border:`1px solid ${C.cinn}20`}}>
            <span style={{fontSize:14,flexShrink:0}}>⚠️</span>
            <p style={{fontSize:11,color:C.ink,margin:0,lineHeight:1.55}}><strong>Passed away:</strong> {critPassSentence}</p>
          </div>
        )}
        {totalGap===0&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:8,background:"#EDF5F0",borderRadius:8,padding:"8px 10px",marginTop:6,border:`1px solid ${C.jade}20`}}>
            <span style={{fontSize:14,flexShrink:0}}>🏆</span>
            <p style={{fontSize:11,color:C.ink,margin:0,lineHeight:1.55}}>Your final rack covered every tile group in this hand. That's a completable hand, exceptional Charleston.</p>
          </div>
        )}
      </div>
    </div>
  );
}


function NarrativeFeedback(){
  const [vote,setVote]=useState(null);
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,paddingTop:10,borderTop:`1px solid ${C.bdr}`}}>
      <span style={{fontSize:10,color:C.mut,flex:1}}>Was this useful?</span>
      <button onClick={()=>setVote("up")} style={{background:vote==="up"?C.jade+"15":"none",border:`1px solid ${vote==="up"?C.jade+"40":C.bdr}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:14,transition:"all 0.15s"}}>👍</button>
      <button onClick={()=>setVote("down")} style={{background:vote==="down"?"#FEF0F0":"none",border:`1px solid ${vote==="down"?C.cinn+"40":C.bdr}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:14,transition:"all 0.15s"}}>👎</button>
      {vote&&<span style={{fontSize:10,color:vote==="up"?C.jade:C.mut,fontWeight:600}}>{vote==="up"?"Thanks!":"Got it, we'll keep improving."}</span>}
    </div>
  );
}

// ─── COACH ADVICE ENGINE, deterministic, tile-specific coaching ──────────────
// Generates a structured coaching read from actual rack data.
// No API call, runs instantly, works offline, free for all players.
function computeCoachAdvice(hand, passLog, chosenSec, allSections, iq, chosenHandObj){
  if(!hand||!hand.length||!chosenSec)return null;

  const meta=SECTION_META[chosenSec]||{};
  const secObj=SECS.find(s=>s.id===chosenSec);
  const sortedSecs=(allSections||[]).slice().sort((a,b)=>b.score-a.score);
  const bestFitSec=sortedSecs[0];
  const sectionMatch=bestFitSec?.id===chosenSec;
  const allPassed=(passLog||[]).flatMap(p=>p.out||[]);

  // ── Tile inventory ─────────────────────────────────────────────────────────
  const jk=hand.filter(t=>t.t==="j").length;
  const fl=hand.filter(t=>t.t==="f").length;
  const numTiles=hand.filter(t=>t.t==="s");
  const windTiles=hand.filter(t=>t.t==="w");
  const dragTiles=hand.filter(t=>t.t==="d");

  // Number counts per value
  const nc={};numTiles.forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
  // Number counts per suit
  const sc={bam:0,crak:0,dot:0};numTiles.forEach(t=>{sc[t.s]++;});
  const dominantSuit=Object.entries(sc).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const dominantSuitName={bam:"Bamboo",crak:"Character",dot:"Circle"}[dominantSuit]||"";
  const dominantSuitCount=sc[dominantSuit]||0;
  const totalNums=numTiles.length;

  // Groups
  const pairs=Object.values(nc).filter(c=>c===2).length;
  const pungs=Object.values(nc).filter(c=>c===3).length;
  const kongs=Object.values(nc).filter(c=>c>=4).length;
  const maxOfOne=Math.max(0,...Object.values(nc));
  const maxNum=Object.entries(nc).find(([n,c])=>c===maxOfOne)?.[0];

  // Pass analysis
  const passedJokers=allPassed.filter(t=>t.t==="j");
  const passedFlowers=allPassed.filter(t=>t.t==="f");
  const passedStrong=allPassed.filter(t=>{
    if(meta.strongNums?.includes(t.n))return true;
    if(meta.strongTypes?.includes(t.t))return true;
    if(t.t==="j")return true;
    return false;
  });

  // Scored hand coverage
  const handFit=chosenHandObj?Math.round(chosenHandObj.fit(hand)*100):null;

  // ── BUILD THE ADVICE ───────────────────────────────────────────────────────
  const advice={
    rackRead:"",     // what the rack is telling you
    primaryLane:"",  // main direction
    altLane:"",      // secondary option
    foundation:[],   // tiles/groups doing the work
    weakness:[],     // tiles/patterns holding the rack back
    keyTile:"",      // the one tile that changes everything
    passRead:"",     // pass quality commentary
    takeaway:"",     // single closing idea
  };

  // ── RACK READ, section-specific ──────────────────────────────────────────
  if(chosenSec==="2026"){
    const twos=nc[2]||0,sixes=nc[6]||0,soap=dragTiles.filter(t=>t.v==="Soap").length;
    const reDrags=dragTiles.filter(t=>t.v==="Red").length+dragTiles.filter(t=>t.v==="Grn").length;
    advice.rackRead=twos>=2&&sixes>=2
      ?`Good 2026 foundation, you've got ${twos} Twos and ${sixes} Sixes which are both required in every hand. ${soap>=1?"Soap is locked in, that's your wildcard tile.":"You're missing Soap, which appears in three of the four hands."}${jk>=1?" "+jk+" Joker"+(jk>1?"s":"")+" gives you real flexibility here.":""}`
      :twos>=1||sixes>=1
      ?("Partial 2026 structure, you have "+(twos>0?(twos+" Two"+(twos>1?"s":"")):"no Twos")+" and "+(sixes>0?(sixes+" Six"+(sixes>1?"s":"")):"no Sixes")+". Both numbers appear in every 2026 hand, so you need depth in both."+(soap>=1?" Soap is a genuine bonus here.":""))
      :`Thin 2026 foundation, both 2s and 6s are required for every hand in this section and you're short on both. The section needs a different tile distribution to really take hold.`;
    advice.primaryLane=`Build pungs of 2s and 6s${soap>=1?" with Soap as your wildcard":" and hunt for Soap (White Dragon)"}. Your best 2026 hand is the one that deepens the groups you already have.`;
    advice.altLane=reDrags>=1||sixes>=2?`The ${sixes>=3?"DD 2222 DDD":"DD 2222 DD"} style hands use two Dragon pungs, if you're picking up Red or Green Dragons alongside your 2s, that path opens up.`:"";
    advice.foundation=twos>=2?[`${twos}× Twos (anchor)`]:sixes>=2?[`${sixes}× Sixes (anchor)`]:[];
    if(soap>=1)advice.foundation.push("Soap (critical wildcard)");
    if(jk>=1)advice.foundation.push(`${jk} Joker${jk>1?"s":""}`);
    advice.weakness=twos===0?["No Twos, required in every hand"]:sixes===0?["No Sixes, required in every hand"]:[];
    advice.keyTile=twos<2?`Another ${2-twos} Two${2-twos>1?"s":""}, they're in every hand and you need a pung at minimum.`:sixes<3?`A third Six to form a pung, that's where the hand locks.`:`More 2s and 6s to deepen from pairs into pungs and kongs.`;
  }
  else if(chosenSec==="2468"){
    const evens=[2,4,6,8].map(n=>({n,c:nc[n]||0}));
    const strongEvens=evens.filter(e=>e.c>=2);
    const sixCount=nc[6]||0,twoCount=nc[2]||0,eightCount=nc[8]||0;
    advice.rackRead=sixCount>=2
      ?`Your Sixes are a proper anchor, 6 appears in seven of the eight 2468 hands, more than any other even number. You have ${strongEvens.length} even number${strongEvens.length!==1?"s":""} with at least a pair: ${strongEvens.map(e=>`${e.c}× ${e.n}`).join(", ")}. ${dominantSuitCount>=4?`The ${dominantSuitName} concentration is starting to focus your suit direction.`:""}`
      :`6 appears in 7 of 8 hands in this section and you currently have ${sixCount===0?"none":"only one"}, that's the number to hunt. Your strongest evens right now are ${strongEvens.length>0?strongEvens.map(e=>`${e.c}× ${e.n}`).join(", "):"still forming"}.`;
    advice.primaryLane=`Push depth on your strongest even tiles, starting with 6. ${twoCount>=2&&eightCount>=2?"2s and 8s paired with your 6s opens several hands, keep tightening the structure.":"Build toward pungs and kongs of 2, 6, and 8, those three appear most frequently."}`;
    advice.altLane=fl>=2?`With ${fl} Flowers you can access the FFF 22 44 666 8888 hand, a strong option if you keep drawing Flowers.`:"";
    advice.foundation=evens.filter(e=>e.c>=2).map(e=>`${e.c}× ${e.n}s`);
    if(fl>=2)advice.foundation.push(`${fl} Flowers`);
    advice.weakness=evens.filter(e=>e.c<=1&&e.n===6).length>0?["Only 1 Six (appears in 7/8 hands)"]:evens.filter(e=>e.c===0).map(e=>`No ${e.n}s`);
    advice.keyTile=sixCount<2?`A second 6, it's in seven of the eight hands and you need a pair at minimum.`:eightCount<2&&twoCount<2?`Another 2 or 8, you need pungs of both for the strongest hands.`:`A third 6 to form a pung, that unlocks the most powerful 2468 hands.`;
  }
  else if(chosenSec==="369"){
    const threes=nc[3]||0,sixes=nc[6]||0,nines=nc[9]||0;
    const total369=threes+sixes+nines;
    advice.rackRead=sixes===0
      ?`Six appears in every single 369 hand, it's the non-negotiable anchor, and you don't have one. You have ${threes} Three${threes!==1?"s":""} and ${nines} Nine${nines!==1?"s":""} to work with, but you must find 6s.`
      :total369>=6
      ?`Strong 369 core, ${threes} Threes, ${sixes} Sixes, ${nines} Nines gives you ${total369} anchor tiles total. You're building real depth here. ${dominantSuitCount>=4?`The ${dominantSuitName} lean is starting to define your suit.`:""}`
      :`${total369} anchor tiles (3s, 6s, 9s), viable but needs more depth. The section rewards having pungs and kongs of all three numbers.`;
    advice.primaryLane=`Deepen your 6s first, they're required everywhere. Then build equal depth in 3s and 9s. Single-suit structures are easier to complete than multi-suit.`;
    advice.altLane=fl>=2?`${fl} Flowers opens the FFF hand paths in 369, hold them.`:"";
    advice.foundation=[sixes>=2?`${sixes}× Sixes (anchor)`:null,threes>=2?`${threes}× Threes`:null,nines>=2?`${nines}× Nines`:null].filter(Boolean);
    advice.weakness=sixes===0?["No Sixes, required in every 369 hand"]:[];
    if(threes===0)advice.weakness.push("No Threes, appears in 5 of 6 hands");
    if(nines===0)advice.weakness.push("No Nines, appears in 5 of 6 hands");
    advice.keyTile=sixes<2?`A second 6, it's in every hand and you need at least a pair.`:threes<2||nines<2?`Another ${threes<2?"3":"9"}, you need pungs of all three numbers in the strongest hands.`:`More group depth, pungs and kongs of 3, 6, and 9 close this section out.`;
  }
  else if(chosenSec==="13579"){
    const odds=[1,3,5,7,9].map(n=>({n,c:nc[n]||0}));
    const fiveCount=nc[5]||0,threeCount=nc[3]||0;
    const strongOdds=odds.filter(o=>o.c>=2);
    const totalOdds=odds.reduce((a,o)=>a+o.c,0);
    const nsWinds=windTiles.filter(t=>t.v==="N"||t.v==="S").length;
    advice.rackRead=totalOdds>=7
      ?`Committed 13579 rack, ${totalOdds} odd tiles with ${strongOdds.length} grouped values. ${fiveCount>=2&&threeCount>=2?"5s and 3s are both in every hand, your two anchor values are set.":fiveCount>=2?"5s anchored well, 3s appear alongside them in every hand, so that's the next priority.":threeCount>=2?"3s anchored, 5s appear in every hand too, hunt them next.":"Keep building toward pairs and pungs of 5 and 3, those appear in all 9 hands."}`
      :`${totalOdds} odd tiles, the core is forming. 5 appears in every 13579 hand and 3 is close behind. Everything even can go.`;
    advice.primaryLane=`5 and 3 are in every hand, build pungs of those first. ${nsWinds>=1?`N/S Winds are an asset here, one hand uses them.`:"Other winds can be passed unless you're building the wind hand."}`;
    advice.altLane=fl>=2?`Flowers appear in 4 of 9 hands, worth holding if you have two or more.`:"";
    advice.foundation=strongOdds.map(o=>`${o.c}× ${o.n}s`);
    if(nsWinds>=2)advice.foundation.push(`${nsWinds}× N/S Winds`);
    advice.weakness=odds.filter(o=>o.n===5&&o.c===0).length>0?["No Fives, in every 13579 hand"]:[];
    if(odds.find(o=>o.n===3&&o.c===0))advice.weakness.push("No Threes, in 9 of 9 hands");
    advice.keyTile=fiveCount<2?`A second 5, it's in every hand, you need at least a pair.`:threeCount<2?`Another 3, pairs and pungs of 3 and 5 are the spine of this section.`:`Depth on your best odd number, go from pair to pung, pung to kong.`;
  }
  else if(chosenSec==="cr"){
    const cw=crWindowScore(hand);
    const window=cw.windowNums||[];
    const suitName={bam:"Bamboo",crak:"Character",dot:"Circle"}[cw.suit]||"";
    advice.rackRead=cw.groupDepth>=8
      ?`Strong Consecutive Run structure, your best window is ${window.join("-")} in ${suitName}, with ${cw.groupDepth} tiles of depth across ${cw.groupCount} grouped numbers. This is a completable CR rack.`
      :cw.groupDepth>=4
      ?`A CR window is forming in ${suitName||"your number tiles"} around ${window.length>0?window.join("-"):"a 3-4 number range"}. You need pungs and kongs inside that window, singles don't score.`
      :`Still early for Consecutive Run. The section needs 3-4 consecutive numbers all as pungs or kongs, scattered singles across different values won't get there.`;
    advice.primaryLane=window.length>0?`Stay tight to your ${window.join("-")} window in ${suitName}. Every tile outside that window is a pass.`:"Identify your best 3-4 number window in one suit and pass everything outside it, including the other suits.";
    advice.altLane=fl>=2?`The Flower sextette hand in CR uses 6 Flowers, if they keep coming, that path opens.`:"";
    advice.foundation=cw.groupDepth>=4?[`${window.join("-")} window in ${suitName} (${cw.groupDepth} tiles deep)`]:[`${totalNums} number tiles forming`];
    advice.weakness=cw.groupCount<2?["Fewer than 2 grouped numbers in window, need pungs not singles"]:[`${Object.entries(nc).filter(([n,c])=>c===1&&window.map(Number).includes(Number(n))).length} lone tiles inside the window eating up space`];
    advice.keyTile=window.length>0?`Another tile in your ${window[0]}-${window[window.length-1]} window in ${suitName}, ideally one that forms a pung rather than a lone single.`:`A pung of any number in your target window, that's when the window becomes real.`;
  }
  else if(chosenSec==="wd"){
    const wc={};windTiles.forEach(t=>{wc[t.v]=(wc[t.v]||0)+1;});
    const dc={};dragTiles.forEach(t=>{dc[t.v]=(dc[t.v]||0)+1;});
    const honorTotal=windTiles.length+dragTiles.length;
    const strongWinds=Object.entries(wc).filter(([,c])=>c>=2).map(([v,c])=>`${c}× ${v}`);
    const strongDrags=Object.entries(dc).filter(([,c])=>c>=2).map(([v,c])=>`${c}× ${v==="Soap"?"Soap":v==="Red"?"Red Dragon":"Green Dragon"}`);
    advice.rackRead=honorTotal>=8
      ?`Deep honor rack, ${windTiles.length} Winds and ${dragTiles.length} Dragons gives you ${honorTotal} honor tiles total. ${strongWinds.length>0?`You have pairs of ${strongWinds.join(" and ")}, that's real structure.`:""} W&D is your committed path.`
      :honorTotal>=5
      ?`${honorTotal} honor tiles, a credible W&D foundation. You need 9-10 to really commit. Pass all numbers 5 and above immediately and wait for more winds.`
      :`Only ${honorTotal} honor tiles. W&D is a high-commitment section, you need winds and dragons, nothing else. Pass every number tile aggressively.`;
    advice.primaryLane=strongWinds.length>0?`Build on your ${strongWinds.join(" and ")} pairs, concentrate on one or two wind values rather than spreading across all four.`:"Pick your strongest wind value and collect it exclusively, depth beats variety in W&D.";
    advice.altLane=numTiles.some(t=>t.n<=4)&&honorTotal>=4?`Some W&D hands use small numbers (1-4) in kongs, if you're drawing 1s or 2s alongside honors, that path opens.`:"";
    advice.foundation=[...strongWinds,...strongDrags];
    advice.weakness=numTiles.filter(t=>t.n>=5).length>0?[`${numTiles.filter(t=>t.n>=5).length} high number tile${numTiles.filter(t=>t.n>=5).length>1?"s":""} to pass, W&D doesn't want them`]:honorTotal<5?["Not enough honor tiles yet to commit"]:[];
    advice.keyTile=strongWinds.length===0?`A pung of any wind value, that becomes your first anchor.`:`A third ${Object.entries(wc).sort((a,b)=>b[1]-a[1])[0]?.[0]||"wind"} Wind to form a pung, once you have two pungs of honors, the hand takes shape.`;
  }
  else if(chosenSec==="aln"){
    const numCounts=Object.entries(nc).sort((a,b)=>b[1]-a[1]);
    const topNum=numCounts[0]||[null,0];
    const depth=Number(topNum[1]);
    advice.rackRead=depth>=4
      ?`Strong ALN foundation, ${depth} tiles of ${topNum[0]}. You've identified your number. Now you need 8-12 total copies (with jokers) of that same value across your suit slots. Everything else passes.`
      :depth>=3
      ?`${depth} tiles of ${topNum[0]}, a clear ALN nucleus. You've made your number choice. The section rewards extreme focus: pass every tile that isn't ${topNum[0]}.`
      :`The number isn't locked yet. You have ${depth===0?"no clear leader":topNum[0]+" with only "+depth+" tiles"}, you need to pick one number immediately and pass everything else without hesitation.`;
    advice.primaryLane=topNum[0]?`Build exclusively on ${topNum[0]}s, every hand in ALN uses the same number throughout. Once you commit, pass anything that isn't ${topNum[0]}, ${topNum[0]}, ${topNum[0]}.`:"Pick your number now, look at your deepest tile count and commit to it.";
    advice.altLane=fl>=2?`The Flower sextette exists in ALN. If you're drawing Flowers consistently, you could pivot to the Flower hand.`:"";
    advice.foundation=depth>=2?[`${depth}× ${topNum[0]}s (your number)`]:[`${numCounts[0]?numCounts[0][0]+"s forming":""}`];
    if(jk>=1)advice.foundation.push(`${jk} Joker${jk>1?"s":""} (fills gaps)`);
    advice.weakness=numTiles.filter(t=>t.n!==Number(topNum[0])).length>0?[`${numTiles.filter(t=>t.n!==Number(topNum[0])).length} off-number tiles diluting the rack`]:[];
    advice.keyTile=depth<4?`More ${topNum[0]}s, you need 8-12 total to fill the hand patterns. The sooner you deepen this number, the better.`:`A sixth or seventh ${topNum[0]}, you need to fill every slot with this number and jokers.`;
  }
  else if(chosenSec==="q"){
    advice.rackRead=jk>=3
      ?`Three Jokers, exceptional quint potential. You have the wildcards; now you need 3-4 natural copies of one tile to build around them.`
      :jk>=2
      ?`Two Jokers, the entry requirement for Quints. Now concentrate on one tile value: you need 3-4 natural copies to pair with your Jokers for a pung or kong.`
      :jk===1
      ?`Only one Joker. Quints needs at least two, without a second Joker arriving, this section is unreachable. Consider having an exit plan.`
      :`No Jokers. Quints is genuinely not available without at least two. If you're committed to this section, you need two Jokers to arrive, that's the entry ticket.`;
    advice.primaryLane=jk>=2?`Stack your deepest tile value, get 3-4 naturals of one tile plus your Jokers. That becomes your quint group. Pass everything else.`:"Wait for a second Joker before committing fully. Until then, keep your options open.";
    advice.altLane="";
    advice.foundation=jk>=2?[`${jk} Jokers (required)`]:[];
    if(maxOfOne>=2)advice.foundation.push(`${maxOfOne}× ${maxNum}s (tile to stack)`);
    advice.weakness=jk<2?[`Only ${jk} Joker${jk!==1?"s":""}, need 2 minimum to play Quints`]:[];
    advice.keyTile=jk<2?`A second Joker, without it, Quints isn't on the table.`:maxOfOne<3?`Three naturals of ${maxNum} to pair with your Jokers, that's when the quint becomes real.`:`More of the tile you're stacking, you need 5 in one slot.`;
  }
  else if(chosenSec==="sp"){
    const pairCount=pairs+pungs+kongs; // every group is usable
    const passedJk=passedJokers.length;
    advice.rackRead=passedJk>0
      ?`You passed ${passedJk} Joker${passedJk>1?"s":""}, that's exactly right for Singles & Pairs. Jokers are useless here and you made the correct call. ${pairCount>=3?`You have ${pairCount} paired groups forming, solid structure.`:"Keep building pairs across all values."}`
      :jk>0
      ?`You still have ${jk} Joker${jk>1?"s":""} in the rack. S&P is concealed, Jokers cannot be used here. Pass them in your next opportunity.`
      :`Clean rack for S&P, no Jokers cluttering a concealed hand. ${pairCount>=3?`${pairCount} pairs forming, you need 6+ to finish.`:pairCount>=1?`${pairCount} pair${pairCount!==1?"s":""} so far, keep building. You need 7 total slots of pairs and singles.`:"Pairs are still forming, protect any matching tiles you're drawing."}`;
    advice.primaryLane=`Build 6 pairs, every pass decision is simple: does this tile match something I have? If not, it goes. Never break a pair you have.`;
    advice.altLane="";
    advice.foundation=pairs>=2?[`${pairs} pair${pairs!==1?"s":""} in hand`]:["Building pair structure"];
    if(fl>=1)advice.foundation.push(`${fl} Flower${fl>1?"s":""} (counts toward S&P hands)`);
    advice.weakness=jk>0?[`${jk} Joker${jk>1?"s":""}, cannot be used in S&P, pass them now`]:pairCount<2?["Fewer than 2 pairs, need to find matching tiles"]:[];
    advice.keyTile=pairCount<4?`Any tile that pairs with something you already hold, S&P lives and dies on pair density.`:`A sixth pair to lock the hand, you're building toward the finish.`;
  }

  // ── PASS READ, honest assessment of the passes ───────────────────────────
  const passReadParts=[];
  if(passedJokers.length>0)passReadParts.push(`Passing ${passedJokers.length} Joker${passedJokers.length>1?"s":""} ${chosenSec==="sp"?"was the right call for S&P, Jokers can't be used here":"is almost never the right move, Jokers are too flexible to give away"}.`);
  if(passedFlowers.length>0&&chosenSec!=="wd")passReadParts.push(`${passedFlowers.length} Flower${passedFlowers.length>1?"s":""} went out, Flowers appear in the majority of winning hands across most sections. Hold them unless you're certain they don't fit.`);
  if(iq.passQualityScore>=20)passReadParts.push(`Your passes were disciplined, you gave away the right tiles and protected your section.`);
  else if(iq.passQualityScore<=10)passReadParts.push(`The passes hurt this rack more than they helped, several tiles that this section needed left in the Charleston.`);
  if(!sectionMatch&&bestFitSec){
    const bestPct=Math.round((sortedSecs[0]?.score||0)*100);
    const chosenPct=Math.round((allSections?.find(s=>s.id===chosenSec)?.score||0)*100);
    const gap=bestPct-chosenPct;
    if(gap>=15)passReadParts.push(`Your tile distribution was pulling toward ${bestFitSec.name} (${bestPct}% fit vs ${chosenPct}% for ${secObj?.name}), worth noting next time you see a similar deal.`);
  }
  advice.passRead=passReadParts.slice(0,2).join(" ")||"Pass quality was reasonable given the deal.";

  // ── TAKEAWAY, one closing coaching idea ──────────────────────────────────
  const takeaways={
    "2026":"The 2026 section lives on 2s and 6s, if you ever have a pung of both, the hand is 60% complete before you've touched anything else.",
    "2468":"Six is the universal even tile. Before every pass, ask: is this a 6? If yes, it stays. Everything else is negotiable.",
    "369":"This section rewards extreme specificity, 3s, 6s, and 9s only. Anything else passing through your hand should leave immediately.",
    "13579":"5 and 3 are in every hand. Build pungs of those two numbers first, then fill the rest, that's the 13579 algorithm.",
    "cr":"Consecutive Run is about depth, not width. Three pungs of three consecutive numbers beats nine singles of nine different numbers every time.",
    "wd":"W&D is won by concentration, pick two wind values and stack them. Spreading across all four winds gets you nowhere.",
    "aln":"One number. Every slot. No exceptions. ALN is the most focused section on the card, that's the whole strategy.",
    "q":"Quints requires two Jokers to enter and extreme tile depth to win. Know your exit point if the Jokers don't come.",
    "sp":"S&P is the most disciplined section on the card. Every tile you hold should be part of a pair. If it isn't paired, it's a liability.",
  };
  advice.takeaway=takeaways[chosenSec]||"Know your section anchor tile and protect it above everything else.";

  return advice;
}

function humanCoachText(text){
  if(!text)return text;
  return String(text)
    .replace(/Your tile distribution was pulling toward ([^(]+) \([^)]*\), worth noting next time you see a similar deal\./g,"Your rack was quietly pointing toward $1. Next time, notice that pull a little earlier.")
    .replace(/Pass tiles not in this hand\. Priority: keep ([^.]+)\./g,"Keep $1 and let the floaters go.")
    .replace(/Pass tiles not in this hand\./g,"Let go of the tiles that are not helping your lane.")
    .replace(/This section rewards extreme specificity/g,"This section rewards a very clear lane")
    .replace(/that's the .* algorithm\./gi,"that is the simple table rule.")
    .replace(/unreachable/gi,"a very long shot")
    .replace(/entry requirement/gi,"starting point")
    .replace(/liability/gi,"usually trouble")
    .replace(/tile distribution/gi,"rack")
    .replace(/pung/g,"group")
    .replace(/kongs/g,"big groups")
    .replace(/kong/g,"big group")
    .replace(/,/g,".");
}

// ─── COACH ADVICE CARD, renders the computed advice ─────────────────────────
function CoachAdvice({hand,passLog,chosenSec,allSections,iq,chosenHandObj}){
  const advice=computeCoachAdvice(hand,passLog,chosenSec,allSections,iq,chosenHandObj);
  if(!advice)return null;

  const Item=({icon,label,text,color})=>(
    <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
      <div style={{width:28,height:28,borderRadius:8,background:(color||C.jade)+"12",border:`1px solid ${color||C.jade}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginTop:1}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:8,color:color||C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>{label}</div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:0}}>{humanCoachText(text)}</p>
      </div>
    </div>
  );

  return(
    <div style={{...S.card,marginBottom:10,padding:0,overflow:"hidden"}}>
      <div style={{padding:"10px 14px 8px",borderBottom:`1px solid ${C.bdr}`}}>
        <div style={{fontSize:8,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:1}}>YOUR RACKLE COACH</div>
        <div style={{fontSize:12,fontWeight:700,color:C.ink}}>A simple read for your next Charleston</div>
      </div>
      <div style={{padding:"12px 14px"}}>

        {/* Rack read */}
        <div style={{background:C.bg2,borderRadius:10,padding:"10px 12px",marginBottom:12,borderLeft:`3px solid ${C.jade}`}}>
          <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:0}}>{humanCoachText(advice.rackRead)}</p>
        </div>

        {/* Primary & alt lanes */}
        <Item icon="🎯" label="WHAT I’D TRY" text={advice.primaryLane}/>
        {advice.altLane&&<Item icon="↗️" label="ANOTHER WAY TO SEE IT" text={advice.altLane} color={C.gold}/>}

        {/* Foundation & weakness */}
        {advice.foundation.length>0&&(
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {advice.foundation.map((f,i)=>(
              <span key={i} style={{fontSize:10,fontWeight:700,background:"#EDF5F0",color:C.jade,border:`1px solid ${C.jade}25`,borderRadius:20,padding:"3px 10px"}}>{f}</span>
            ))}
          </div>
        )}
        {advice.weakness.length>0&&(
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {advice.weakness.map((w,i)=>(
              <span key={i} style={{fontSize:10,fontWeight:700,background:"#FEF0F0",color:C.cinn,border:`1px solid ${C.cinn}25`,borderRadius:20,padding:"3px 10px"}}>⚠ {w}</span>
            ))}
          </div>
        )}

        {/* Key tile */}
        <Item icon="🔑" label="TILE TO WATCH" text={advice.keyTile} color={C.amberB}/>

        {/* Pass read */}
        {advice.passRead&&<Item icon="🔄" label="PASS CHAT" text={advice.passRead} color={C.mut}/>}

        {/* Takeaway */}
        <div style={{marginTop:4,padding:"10px 12px",background:`linear-gradient(135deg,${C.jade}08,${C.jade}04)`,borderRadius:10,border:`1.5px solid ${C.jade}20`}}>
          <div style={{fontSize:8,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:4}}>NEXT TIME AT THE TABLE</div>
          <p style={{fontSize:12,color:C.ink,lineHeight:1.65,margin:0,fontWeight:500}}>{humanCoachText(advice.takeaway)}</p>
        </div>

      </div>
    </div>
  );
}



// ─── COACH MODE SCREEN, narrative-first deep analysis ───────────────────────
function CoachModeScreen({iq,hand,startingRack,passLog,dayNum,section,chosenSec,chosenHand,allSections,onBack,setScreen}){
  const [sfOpen,setSfOpen]=useState(false);
  if(!iq)return null;

  const chosenSecObj=chosenSec&&SECS.find(s=>s.id===chosenSec);
  const resolvedHandLabel=chosenHand||(iq?.scoredHandLabel||null);
  const chosenHandObj=resolvedHandLabel?HAND_CATALOG.find(h=>h.sec===chosenSec&&h.label===resolvedHandLabel):null;
  const sortedSecs=allSections?[...allSections].sort((a,b)=>b.score-a.score):[];
  const bestFitSec=sortedSecs[0];
  const chosenFit=chosenSec&&allSections?allSections.find(s=>s.id===chosenSec):null;
  const chosenPct=chosenFit?Math.round(chosenFit.score*100):null;
  const bestPct=bestFitSec?Math.round(bestFitSec.score*100):null;
  const sectionMatch=chosenSec===bestFitSec?.id;
  const scoreColor=(v,max)=>v/max>=0.8?C.jade:v/max>=0.55?C.gold:C.cinn;

  // ── VERDICT, one honest sentence about this round ──────────────────────────
  const verdictText=(()=>{
    const total=iq.totalScore;
    const dir=iq.directionScore/40;
    const pass=iq.passQualityScore/25;
    const tile=iq.tileStrengthScore/25;
    const handName=chosenHandObj?.label||chosenSecObj?.name||"your section";
    if(total>=88)return`Excellent Charleston. Your direction was clear from the start and your passes protected it, this is what disciplined play looks like.`;
    if(total>=75&&dir>=0.8)return`Strong read on ${chosenSecObj?.name||"your section"}. Your section instinct was right, the passes kept the structure intact.`;
    if(total>=75&&pass>=0.8)return`Your passing was the standout this round, you gave away the right tiles consistently. The direction just needed to sharpen a bit earlier.`;
    if(total>=65&&dir>=0.7&&pass<0.55)return`You saw the right section but gave away tiles that would have made it. Direction was there, the passing cost you.`;
    if(total>=65&&pass>=0.7&&dir<0.55)return`Disciplined passing without a clear target is only half the equation. Your discard instincts are good, commit to a section earlier.`;
    if(total>=55&&!sectionMatch)return`Your tiles were pulling toward ${bestFitSec?.name||"another section"}, but you went a different direction. Not wrong, just a pivot opportunity worth noting.`;
    if(total>=55)return`A workable Charleston. The structure was there in pieces, the goal next time is locking in earlier so each pass has a job to do.`;
    if(dir<0.4&&pass<0.4)return`This round, the direction and passes weren't speaking the same language. Before your first pass: name your section, then ask "does this tile help it?"`;
    if(dir<0.4)return`The passes were reasonable, but without a clear section target the rack drifted. Lock in your direction by the first pass and everything else follows.`;
    return`The fundamentals are there. Pick your section before you touch a single tile, that one habit makes every pass decision automatic.`;
  })();

  // ── WHAT HAPPENED TO YOUR PASSES, narrative per round ──────────────────────
  const passNarrative=(iq.passInsights||[]).map((p,i)=>{
    const qualColor={strong:C.jade,weak:C.cinn,mixed:C.gold,neutral:C.mut};
    const qualBg={strong:"#EDF5F0",weak:"#FEF0F0",mixed:"#FBF3E2",neutral:C.bg2};
    const qualLabel={strong:"Clean pass",weak:"Risky pass",mixed:"Mixed pass",neutral:"Neutral pass"};
    const tiles=p.passedTiles||[];
    return{...p,qualColor:qualColor[p.quality]||C.mut,qualBg:qualBg[p.quality]||C.bg2,qualLabel:qualLabel[p.quality]||"Pass",tiles,roundNum:i+1};
  });

  // ── WHAT AN EXPERT WOULD NOTICE, specific to actual tiles ──────────────────
  const expertNotes=(()=>{
    const notes=[];
    const jk=(hand||[]).filter(t=>t.t==="j").length;
    const fl=(hand||[]).filter(t=>t.t==="f").length;
    const allPassed=(passLog||[]).flatMap(p=>p.out||[]);
    const passedJokers=allPassed.filter(t=>t.t==="j");
    const passedFlowers=allPassed.filter(t=>t.t==="f");

    // Joker handling
    if(passedJokers.length>0){
      notes.push({icon:"⚠️",text:`You passed ${passedJokers.length} joker${passedJokers.length>1?"s":""}, jokers are almost never worth giving away. They're the most flexible tile on the board.`,type:"warn"});
    } else if(jk>=2){
      notes.push({icon:"✓",text:`${jk} jokers held, that's the right call. Jokers don't get passed unless you have no choice.`,type:"good"});
    }

    // Flower handling
    if(passedFlowers.length>0&&chosenSec!=="wd"){
      notes.push({icon:"⚠️",text:`You passed ${passedFlowers.length} flower${passedFlowers.length>1?"s":""}. Flowers appear in the majority of winning hands, hold them unless you're certain they don't fit.`,type:"warn"});
    } else if(fl>=2){
      notes.push({icon:"✓",text:`${fl} flowers in your final rack. These are structural support for most sections, well held.`,type:"good"});
    }

    // Hand-specific tile gaps
    if(chosenHandObj){
      const label=chosenHandObj.label;
      const neededNums=[...new Set((label.match(/\d/g)||[]).map(Number).filter(n=>n>=1&&n<=9))];
      const nc={};(hand||[]).filter(t=>t.t==="s").forEach(t=>{nc[t.n]=(nc[t.n]||0)+1;});
      const missingAnchors=neededNums.filter(n=>!nc[n]);
      if(missingAnchors.length>0){
        notes.push({icon:"🎯",text:`Your final rack was missing ${missingAnchors.slice(0,2).map(n=>`${n}s`).join(" and ")}, tiles that appear in this hand. ${missingAnchors.length===1?"That single group":"Those groups"} would have made the difference.`,type:"gap"});
      }
      // Suit concentration check
      const suitCounts={bam:0,crak:0,dot:0};
      (hand||[]).filter(t=>t.t==="s").forEach(t=>{suitCounts[t.s]++;});
      const dominantSuit=Object.entries(suitCounts).sort((a,b)=>b[1]-a[1])[0];
      const total3=Object.values(suitCounts).reduce((a,b)=>a+b,0);
      if(dominantSuit&&dominantSuit[1]/total3>=0.65&&total3>=5){
        const suitName={bam:"Bamboo",crak:"Character",dot:"Circle"}[dominantSuit[0]];
        notes.push({icon:"🃏",text:`Your number tiles were heavily concentrated in ${suitName}, which helps with single-suit hands but can reduce flexibility in multi-suit hands like this one.`,type:"info"});
      }
    }

    // Section direction accuracy
    if(!sectionMatch&&bestFitSec&&chosenPct!=null&&bestPct!=null){
      const gap=bestPct-chosenPct;
      if(gap>=20){
        notes.push({icon:"↗️",text:`${bestFitSec.icon} ${bestFitSec.name} had a ${gap}% stronger section fit. An expert player would have spotted the pull toward that section by the second pass.`,type:"pivot"});
      } else if(gap>=10){
        notes.push({icon:"↗️",text:`${bestFitSec.icon} ${bestFitSec.name} was a slightly stronger fit (${gap}% gap). Both sections were viable, this was a judgment call, not a clear miss.`,type:"info"});
      }
    }

    // Pass timing
    if(iq.timingInsight){
      notes.push({icon:"⏱",text:iq.timingInsight,type:"timing"});
    }

    return notes.slice(0,5);
  })();

  // ── ONE THING, the single most impactful habit change ─────────────────────
  const oneThing=(()=>{
    const dir=iq.directionScore/40;
    const pass=iq.passQualityScore/25;
    const tile=iq.tileStrengthScore/25;
    const tm=iq.timingScore/10;
    // Find the weakest dimension
    const dims=[
      {k:"dir",r:dir,tip:`Before your next game: look at your starting rack and say out loud which section you're going to play. Then make every pass answer to that decision.`},
      {k:"pass",r:pass,tip:`Before each pass, ask one question: "Does this tile connect to what I'm keeping?" If no, it goes. If yes, it stays. That's the whole decision.`},
      {k:"tile",r:tile,tip:`Focus on group depth over coverage. Three tiles of the same thing beats one of everything. Pairs and pungs are worth more than variety.`},
      {k:"tm",r:tm,tip:`Aim for 10-20 seconds per pass. Enough to read the rack, not enough to second-guess a good first instinct. Set a mental clock.`},
    ].sort((a,b)=>a.r-b.r);
    return dims[0].tip;
  })();

  const noteTypeStyle={
    good:{bg:"#EDF5F0",border:`1px solid ${C.jade}25`,iconCol:C.jade},
    warn:{bg:"#FEF0F0",border:"1px solid #B8323225",iconCol:C.cinn},
    gap:{bg:"#FBF3E2",border:`1px solid ${C.gold}30`,iconCol:C.gold},
    info:{bg:C.bg2,border:`1px solid ${C.bdr}`,iconCol:C.mut},
    pivot:{bg:"#EDF5F0",border:`1px solid ${C.jade}25`,iconCol:C.jade},
    timing:{bg:C.bg2,border:`1px solid ${C.bdr}`,iconCol:C.mut},
  };

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={onBack} setScreen={setScreen}/>

      {/* Header */}
      <div style={{marginBottom:14,marginTop:4,textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:2}}>Table Talk</div>
        <div style={{fontSize:11,color:C.mut}}>Day #{dayNum} · {chosenSecObj?.name||section}</div>
      </div>

      {/* ① VERDICT */}
      <SectionDivider label="THE VERDICT"/>
      <div style={{borderRadius:14,background:"#fff",border:`1.5px solid ${C.bdr}`,padding:"16px 18px",marginBottom:10,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:8,color:C.jade,letterSpacing:2.5,fontWeight:700,marginBottom:8}}>THE VERDICT</div>
        <p style={{fontSize:13,color:C.ink,lineHeight:1.7,margin:"0 0 14px",fontStyle:"italic"}}>{verdictText}</p>
        {/* IQ sub-scores inline */}
        <div style={{display:"flex",gap:4}}>
          {[{label:"DIR",v:iq.directionScore,max:40},{label:"PASS",v:iq.passQualityScore,max:25},{label:"TILE",v:iq.tileStrengthScore,max:25},{label:"TIME",v:iq.timingScore,max:10}].map(({label,v,max})=>{
            const pct=v/max;
            const col=pct>=0.8?C.jade:pct>=0.55?C.gold:C.cinn;
            const bg=pct>=0.8?"#EDF5F0":pct>=0.55?"#FBF3E2":"#FEF0F0";
            return(
              <div key={label} style={{flex:1,background:bg,borderRadius:10,padding:"9px 4px",textAlign:"center"}}>
                <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:col,lineHeight:1}}>{v}</div>
                <div style={{fontSize:6,color:col,opacity:0.7,letterSpacing:1.5,fontWeight:700,marginTop:3}}>{label}</div>
                <div style={{fontSize:6,color:C.mut}}>/{max}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ①½ COACH ADVICE */}
      <SectionDivider label="COACH ADVICE"/>
      <CoachAdvice hand={hand} passLog={passLog} chosenSec={chosenSec} allSections={allSections} iq={iq} chosenHandObj={chosenHandObj}/>

      {/* ② RACK VS HAND */}
      {chosenHandObj&&<SectionDivider label="YOUR RACK VS THE HAND"/>}
      {chosenHandObj&&(
        <RackVsHandOverlay
          hand={hand}
          handObj={chosenHandObj}
          passLog={passLog}
          sectionId={chosenSec}
          handWasInferred={iq.handWasInferred}
          secObj={chosenSecObj}
        />
      )}

      {/* ③ YOUR STARTING DEAL */}
      <SectionDivider label="PASS ANALYSIS"/>
      <StartingDealCard startingRack={startingRack} chosenHandObj={chosenHandObj}/>

      {/* ④ YOUR PASSES */}
      <PassesCard passNarrative={passNarrative}/>

      {/* ⑤ ALTERNATIVE HANDS */}
      {hand&&hand.length>0&&chosenSec&&(()=>{
        const primPct=chosenHandObj?computeHonestCoverage(hand,chosenHandObj).pct:0;
        return <AltHandsCard hand={hand} resolvedHandLabel={resolvedHandLabel} chosenSec={chosenSec} chosenSecObj={chosenSecObj} sortedSecs={sortedSecs} primaryCoveragePct={primPct}/>;
      })()}

      {/* ⑥ EXPERT EYE ───────────────────────────────────────────────────────── */}
      {expertNotes.length>0&&(
        <div style={{...S.card,marginBottom:10,padding:0,overflow:"hidden"}}>
          <div style={{padding:"10px 14px 8px",borderBottom:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:8,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:1}}>EXPERT EYE</div>
            <div style={{fontSize:12,fontWeight:700,color:C.ink}}>What a strong player would notice</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {expertNotes.map((n,i)=>{
              const s=noteTypeStyle[n.type]||noteTypeStyle.info;
              return(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",background:i%2===0?"#fff":C.bg2,borderBottom:i<expertNotes.length-1?`1px solid ${C.bdr}`:"none"}}>
                  <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{n.icon}</span>
                  <span style={{fontSize:11,color:C.ink,lineHeight:1.6,flex:1}}>{n.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ⑧ ONE THING */}
      <SectionDivider label="ONE THING TO TAKE AWAY"/>
      <div style={{borderRadius:14,background:`linear-gradient(145deg,${C.jade}06,${C.jade}02)`,border:`1.5px solid ${C.jade}20`,padding:"15px 16px",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${C.jade},#115C38)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>💡</div>
          <div style={{fontSize:8,color:C.jade,letterSpacing:2.5,fontWeight:700}}>ONE THING TO TAKE INTO YOUR NEXT GAME</div>
        </div>
        <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:0,fontWeight:500}}>{oneThing}</p>
      </div>

      {/* ⑨ SECTION LANDSCAPE */}
      {allSections&&allSections.length>0&&<SectionDivider label="REFERENCE"/>}
      {allSections&&allSections.length>0&&(
        <div style={{...S.card,marginBottom:10,padding:0,overflow:"hidden"}}>
          <button onClick={()=>setSfOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
            <div>
              <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700}}>SECTION LANDSCAPE</div>
              <div style={{fontSize:12,fontWeight:700,color:C.ink,marginTop:1}}>How all sections ranked against your final rack</div>
            </div>
            <span style={{fontSize:12,color:C.mut}}>{sfOpen?"▾":"▸"}</span>
          </button>
          {sfOpen&&<div style={{borderTop:`1px solid ${C.bdr}`,padding:"10px 14px"}} className="rk-in">
            {!sectionMatch&&<div style={{fontSize:11,color:C.amberB,lineHeight:1.5,background:C.amber,borderRadius:8,padding:"7px 10px",marginBottom:10}}>
              Your tiles had a stronger natural fit in {bestFitSec?.icon} <strong>{bestFitSec?.name}</strong> ({bestPct}%) than {chosenSecObj?.name} ({chosenPct}%). Worth knowing what the rack was pulling toward.
            </div>}
            {sortedSecs.slice(0,6).map((s,i)=>{
              const isChosen=s.id===chosenSec;const isTop=i===0;
              const pct=Math.round(s.score*100);
              const barCol=isChosen?C.jade:isTop&&!isChosen?C.gold:C.bdr;
              return(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<5?8:0}}>
                  <span style={{fontSize:13,flexShrink:0,width:20}}>{s.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
                      <span style={{fontSize:11,fontWeight:isChosen?700:400,color:isChosen?C.ink:C.mut}}>
                        {s.name}{isChosen?" ← your pick":isTop&&!isChosen?" ← best fit":""}
                      </span>
                      <span style={{fontSize:11,fontWeight:700,color:isChosen?C.jade:C.mut,fontFamily:F.d}}>{pct}%</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:C.bdr,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:2,width:`${pct}%`,background:barCol,transition:"width 0.6s ease"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
        </div>
      )}

      <button onClick={onBack} style={{...S.oBtn,width:"100%",marginTop:4}}>← Back to Scorecard</button>
      <Footer/>
    </div>
  );
}

// IQScorecard router, daily gets simplified, practice gets tabbed
function IQScorecard({iq,hand,startingRack,passLog,isDaily,dayNum,section,chosenSec,chosenHand,allSections,onHome,onDealAgain,onPractice,setScreen}){
  const [coachMode,setCoachMode]=useState(false);
  const scrollTop=()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;};
  const enterCoach=()=>{scrollTop();setCoachMode(true);};
  const exitCoach=()=>{scrollTop();setCoachMode(false);};
  if(isDaily&&coachMode)return(
    <CoachModeScreen iq={iq} hand={hand} startingRack={startingRack} passLog={passLog} dayNum={dayNum} section={section} chosenSec={chosenSec} chosenHand={chosenHand} allSections={allSections} onBack={exitCoach} setScreen={setScreen}/>
  );
  if(isDaily)return <DailyIQScorecard iq={iq} hand={hand} startingRack={startingRack} passLog={passLog} dayNum={dayNum} section={section} chosenSec={chosenSec} chosenHand={chosenHand} allSections={allSections} onHome={onHome} onPractice={onPractice} onCoachMode={enterCoach}/>;
  return <PracticeIQScorecard iq={iq} hand={hand} passLog={passLog} section={section} chosenSec={chosenSec} allSections={allSections} onHome={onHome} onDealAgain={onDealAgain}/>;
}

// ─── STANDALONE SCORECARD SCREEN ─────────────────────────────────────────────
function ScorecardScreen({res,home,dayNum,onPractice,setScreen}){
  const [coachMode,setCoachMode]=useState(false);
  const scrollTop=()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;};
  const enterCoach=()=>{scrollTop();setCoachMode(true);};
  const exitCoach=()=>{scrollTop();setCoachMode(false);};
  if(!res||!res.iq)return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{textAlign:"center",padding:"40px 0",color:C.mut}}>No scorecard data available.</div>
    </div>
  );
  if(coachMode)return(
    <CoachModeScreen
      iq={res.iq} hand={res.finalRack||[]} startingRack={res.startingRack||[]} passLog={res.passLog||[]}
      dayNum={dayNum} section={res.section} chosenSec={res.chosenSec}
      chosenHand={res.chosenHand||null}
      allSections={res.allSections||[]} onBack={exitCoach} setScreen={setScreen}
    />
  );
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <DailyIQScorecard iq={res.iq} hand={res.finalRack||[]} startingRack={res.startingRack||[]} passLog={res.passLog||[]} dayNum={dayNum} section={res.section} chosenSec={res.chosenSec} chosenHand={res.chosenHand} allSections={res.allSections||[]} onHome={home} onPractice={onPractice} onCoachMode={enterCoach} setScreen={setScreen}/>
      <Footer/>
    </div>
  );
}

// ─── TUTORIAL STEPS ───────────────────────────────────────────────────────────
const TUTORIAL_STEPS=[
  {title:"Welcome to Rackle! 🀄",body:"Rackle trains your Charleston strategy for American Mahjong (NMJL 2026 card).",detail:"The Charleston is the tile-passing ritual before play. Better passing = better hands. Quick to learn, let's go.",icon:"🀄",tip:null},
  {title:"Your Rack",body:"You're dealt 13 tiles. Each tile belongs to a category: Bam, Crak, Dot, Winds, Dragons, Flowers, or Jokers.",detail:"The goal is to end the Charleston with tiles that align to and can be flexible within a section.",icon:"🎴",tip:null,showTiles:true},
  {title:"The Charleston",body:"You pass tiles in 3 rounds, Right (3 tiles), Over (3 tiles), Left (0-3 tiles, blind).",detail:"'Blind' means you pass before seeing what you receive. Pass your worst tiles. Keep your best.",icon:"👉",tip:"Jokers can NEVER be passed. And why would you want to? They're too valuable!"},
  {title:"Pick Your Section",body:"After passing, choose which hand category you were leaning toward, like 2468, 369, or Consecutive Run.",detail:"Rackle gives you a quick rack read so you can see what worked and what to try next.",icon:"🎯",tip:"The 2026 Card in-game guide shows tips for each section."},
  {title:"Get Rated",body:"Your Rackle score gives you a quick read on how your Charleston felt today.",detail:"Get a simple rack read, see what stood out, and share with your Mahj group.",icon:"🏆",tip:"Play the Daily for a fresh deal every day shared by all players."},
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
        <div style={{fontSize:11,color:C.mut}}>Score {toast.iqScore} is on the board</div>
      </div>
      <button onClick={onDismiss} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer",padding:0,lineHeight:1,flexShrink:0}}>✕</button>
    </div>
  );
}


function RackleBootSplash(){
  return(
    <div className="rk-boot-splash">
      <div style={{position:"relative",zIndex:1}}>
        <div className="rk-boot-tile">🀄</div>
        <div className="rk-boot-logo">Rackle</div>
        <div className="rk-boot-copy">Setting the table...</div>
        <div className="rk-boot-shimmer" />
      </div>
    </div>
  );
}

function PremiumClubMenu({open,onClose,setScreen,go,showSettings,streak=0,dRes=null}){
  if(!open)return null;
  const profile=getProfile();
  const hasProfile=!!(profile?.nickname||profile?.email||rkHasValidSession());
  const nickname=(profile?.nickname||rkReadSession()?.nickname||"Guest Player").trim();
  const firstName=nickname.split(" ")[0]||"Guest";
  const clubName=getAffiliatedClubName(profile?.clubCode||profile?.club_code||getClubCode())||"No club yet";
  const score=Number(dRes?.iq?.totalScore||rkLatestLocalDailyScore?.()?.iqScore||0)||null;
  const todayCount=Number(ST.get("rk_menu_today_count",0)||0)||"—";
  const clubsActive=Number(Object.keys(CLUBS||{}).length||0)||"—";
  const shares=Number(ST.get("rk_total_shares",0)||0)||"—";
  const goTo=(screen)=>{onClose?.();setScreen?.(screen);};
  const goPlay=(mode)=>{onClose?.();go?.(mode);};
  const shareRackle=async()=>{
    const text="🀄 Rackle\nThe daily mahjong workout.\nPlay with your club: playrackle.com";
    try{if(navigator.share)await navigator.share({title:"Rackle",text});else await navigator.clipboard.writeText(text);}catch{}
    onClose?.();
  };
  const logout=()=>{rkLogout();onClose?.();setScreen?.("home");window.dispatchEvent(new Event("rackle:remoteHydrated"));};
  const Row=({icon,title,sub,onClick,cta=false,section="account"})=>(
    <button className={`rk-menu-row rk-menu-${section}${cta?" rk-menu-cta":""}`} onClick={onClick}>
      <span className="rk-menu-row-icon" aria-hidden="true"><span className="rk-menu-emoji">{icon}</span></span>
      <span style={{flex:1,minWidth:0}}><strong>{title}</strong>{sub&&<span>{sub}</span>}</span>
      <span style={{fontSize:14,color:cta?"#fff":"#8A6820",fontWeight:950,lineHeight:1}}>›</span>
    </button>
  );
  return(
    <>
      <div className="rk-menu-backdrop" onClick={onClose}/>
      <aside className="rk-menu-drawer" role="dialog" aria-modal="true" aria-label="Rackle Clubhouse menu">
        <div className="rk-menu-hero">
          <button className="rk-menu-close" onClick={onClose} aria-label="Close menu">×</button>
          <div className="rk-menu-avatar">{(nickname||"R").charAt(0).toUpperCase()}</div>
          <div className="rk-menu-name">{hasProfile?nickname:"Rackle Clubhouse"}</div>
          <div className="rk-menu-club"><span className="rk-live-dot-dynamic" style={{width:7,height:7,display:"inline-block",marginRight:7,verticalAlign:"middle"}}/> {hasProfile?clubName:"Save your streak and join your club"}</div>
          <div className="rk-menu-badges">
            <span className="rk-menu-badge"><span className="rk-menu-inline-emoji">🔥</span>{Number(streak||profile?.streak||0)}-day streak</span>
            <span className="rk-menu-badge"><span className="rk-menu-inline-emoji">🧠</span>{score?`${score} IQ today`:"Daily ready"}</span>
          </div>
        </div>
        <div className="rk-menu-live-strip">
          <div className="rk-menu-live-stat"><strong>{todayCount}</strong><span><i className="rk-live-dot-dynamic" style={{width:6,height:6}}/> players</span></div>
          <div className="rk-menu-live-stat"><strong>{clubsActive}</strong><span><i className="rk-live-dot-dynamic" style={{width:6,height:6}}/> clubs</span></div>
          <div className="rk-menu-live-stat"><strong>{shares}</strong><span><i className="rk-live-dot-dynamic" style={{width:6,height:6}}/> shares</span></div>
        </div>
        <div className="rk-menu-scroll">
          {!hasProfile&&(
            <div className="rk-menu-section">
              <Row icon="🔐" title="Log In" sub="Save your streak. Track your Mahjong IQ." section="account" onClick={()=>{sessionStorage.setItem("rk-goto","signin");goTo("profile");}} cta/>
              <Row icon="✨" title="Create Account" sub="Join your club and keep your scores." section="account" onClick={()=>goTo("profile")}/>
            </div>
          )}
          <div className="rk-menu-section">
            <div className="rk-menu-section-title">Play</div>
            <Row icon="🀄" title="Play Daily" sub="One rack. One score. Beat the room." section="play" onClick={()=>goPlay("daily")}/>
            <Row icon="🎯" title="Practice Mode" sub="Train another Charleston read." section="play" onClick={()=>goPlay("free")}/>
            <Row icon="👥" title="Club Room" sub="See your table and club board." section="community" onClick={()=>goTo(getClubCode()?"leaderboard":"clubs")}/>
            <Row icon="🏆" title="Global Leaderboard" sub="See who owns today’s rack." section="community" onClick={()=>goTo("globalLeaderboard")}/>
          </div>
          <div className="rk-menu-section">
            <div className="rk-menu-section-title">Improve</div>
            <Row icon="📊" title="Stats" sub="Your streak, scores, and progress." section="learn" onClick={()=>goTo("stats")}/>
            <Row icon="🃏" title="2026 Card Browser" sub="Scan the card faster." section="learn" onClick={()=>goTo("handbrowser")}/>
            <Row icon="📚" title="Learn Mahjong" sub="Tutorials, glossary, and basics." section="learn" onClick={()=>goTo("tutorial")}/>
            <Row icon="🧭" title="How To Play" sub="Quick Rackle walkthrough." section="learn" onClick={()=>goTo("howto")}/>
          </div>
          <div className="rk-menu-section">
            <div className="rk-menu-section-title">Account</div>
            {hasProfile?(
              <>
                <Row icon="👤" title="Profile" sub={firstName?`Signed in as ${firstName}`:"Your Rackle account"} section="account" onClick={()=>goTo("profile")}/>
                <Row icon="⚙️" title="Settings" sub="Sound, motion, and preferences." section="account" onClick={()=>{onClose?.();showSettings?showSettings():setScreen?.("settings");}}/>
                <Row icon="↩️" title="Logout" sub="This device only." section="account" onClick={logout}/>
              </>
            ):(
              <Row icon="🔐" title="Log In" sub="Resume your Rackle account." section="account" onClick={()=>{sessionStorage.setItem("rk-goto","signin");goTo("profile");}}/>
            )}
          </div>
          <div className="rk-menu-section">
            <div className="rk-menu-section-title">Share</div>
            <Row icon="🏛️" title="Invite Your Club" sub="Bring your mahjong group in." section="share" onClick={()=>goTo("clubs")}/>
            <Row icon="📨" title="Share Rackle" sub="Send it to the table." section="share" onClick={shareRackle}/>
          </div>
        </div>
        <div className="rk-menu-footer">Built for the modern mahjong table.</div>
      </aside>
    </>
  );
}

function RackleHeader({onBack,setScreen}){
  const [menuOpen,setMenuOpen]=useState(false);
  const profile=getProfile();
  const hasProfile=!!(profile&&profile.nickname);
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",marginBottom:22,paddingTop:12,paddingBottom:14,borderBottom:`1px solid rgba(160,120,40,.16)`}}>
      <button onClick={onBack} style={S.back} aria-label="Back to home">← Back</button>
      <div style={{textAlign:"center",position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,letterSpacing:-0.5,lineHeight:1}}>Rackle</div>
        <div style={{fontFamily:F.d,fontSize:10,color:C.jade,fontWeight:600,fontStyle:"italic",letterSpacing:0.5,marginTop:1}}>The Daily Mahjong Workout.</div>
      </div>
      <div style={{position:"relative"}}>
        <button onClick={()=>setMenuOpen(o=>!o)} aria-label="Menu"
          style={{background:menuOpen?"linear-gradient(180deg,#F2EBDD,#E9E0CF)":"rgba(23,107,66,.05)",border:`1px solid ${menuOpen?C.bdr:"rgba(23,107,66,.08)"}`,borderRadius:11,padding:"7px 10px",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"inset 0 1px 0 rgba(255,255,255,.65)"}}>
          <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
          <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
          <span style={{display:"block",width:16,height:1.5,background:C.ink,borderRadius:1}}/>
        </button>
        {menuOpen&&(
          <div className="rk-in rk-menu-surface" style={{position:"absolute",top:"100%",right:0,zIndex:50,background:"linear-gradient(145deg,#FFFDF8,#F6EFE4)",border:`1px solid rgba(26,20,16,.10)`,borderRadius:16,boxShadow:"0 16px 44px rgba(26,20,16,.13),inset 0 1px 0 rgba(255,255,255,.76)",minWidth:152,maxWidth:180,marginTop:8,overflow:"hidden"}}>
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
    <div className="rk-footer">
      <div className="rk-footer-inner">
        <div>
          <div aria-hidden="true" style={{width:40,height:1,background:C.bdr,margin:"0 auto 16px"}}/>
          <div style={{fontSize:12,color:C.jade,fontFamily:F.d,fontStyle:"italic"}}>The Daily Mahjong Workout 🀄</div>
          <div style={{fontSize:11,color:C.mut,marginTop:8,lineHeight:1.6}}>Made for the American Mahjong community</div>
          <div style={{marginTop:12}}><a href="https://playrackle.com" target="_blank" rel="noopener noreferrer" style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,letterSpacing:-0.3,textDecoration:"none"}}>Rackle</a></div>
          <div style={{fontSize:10,color:C.mut,marginTop:14,opacity:0.7}}>© {new Date().getFullYear()} <a href="https://playrackle.com" target="_blank" rel="noopener noreferrer" style={{color:C.mut,textDecoration:"none"}}>playrackle.com</a> · All rights reserved</div>
        </div>
        <div className="rk-footer-actions" style={{marginTop:10,display:"flex",justifyContent:"center",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <a href="https://instagram.com/playrackle" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.ink,textDecoration:"none",fontWeight:600,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 14px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5.5" stroke={C.ink} strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="4.5" stroke={C.ink} strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1" fill={C.ink}/></svg>
            @playrackle
          </a>
          <a href="mailto:hello@playrackle.com" style={{display:"flex",alignItems:"center",fontSize:12,color:C.ink,textDecoration:"none",fontWeight:600,background:C.bg2,border:`1px solid ${C.bdr}`,borderRadius:20,padding:"5px 14px"}}>Contact</a>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function Settings({home,settings,setSettings,showTutorial,setScreen}){
  const [confirmClear,setConfirmClear]=useState(false);
  const clearHistory=()=>{
    const code=getClubCode();const name=getClubName();
    if(code&&name)deleteLBEntry(code,name);
    ST.set("hist",[]);ST.set("str",0);ST.set("rnd",0);ST.set("ld",null);ST.set("dd",null);ST.set("dres",null);
    ST.set("tutorialDismissed",false);ST.set("hadFirstDaily",false);ST.set("tutDone",false);
    ST.set("clubCode",null);ST.set("clubName",null);ST.set("profile",null);
    setConfirmClear(false);window.location.reload();
  };
  const Row=({label,sub,children})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.bdr}`}}><div><div style={{fontSize:13,fontWeight:600,color:C.ink}}>{label}</div>{sub&&<div style={{fontSize:11,color:C.mut,marginTop:2}}>{sub}</div>}</div>{children}</div>);
  const Toggle=({val,onChange,label})=>(<button role="switch" aria-checked={val} aria-label={label} onClick={()=>onChange(!val)} style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:val?C.jade:"#D5CFC5",position:"relative",transition:"background 0.2s",flexShrink:0}}><span aria-hidden="true" style={{position:"absolute",top:2,left:val?22:2,width:20,height:20,borderRadius:10,background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></button>);
  const upd=(k,v)=>{const n={...settings,[k]:v};setSettings(n);ST.set("settings",n);};
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{marginBottom:20,marginTop:4,textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:900,color:C.ink,letterSpacing:-0.55,marginBottom:5,lineHeight:1.05}}>Settings</div>
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
  const [step,setStep]=useState(0);
  const [selected,setSelected]=useState(null);
  const st=TUTORIAL_STEPS[step];
  const isLast=step===TUTORIAL_STEPS.length-1;
  const sampleTiles=[{t:"s",s:"bam",n:6},{t:"s",s:"crak",n:2},{t:"d",v:"Soap"},{t:"j"},{t:"f"},{t:"w",v:"N"},{t:"s",s:"dot",n:9}];
  const choices=[
    {title:"Keep the anchors",body:"Protect tiles that point to real NMJL lines.",good:true},
    {title:"Chase every single",body:"Connected singles look nice, but groups win hands.",good:false},
    {title:"Watch pairs become pungs",body:"Pairs are your early signal. Pungs make the path real.",good:true},
  ];
  const progress=Math.round(((step+1)/TUTORIAL_STEPS.length)*100);
  const next=()=>{setSelected(null);setStep(s=>Math.min(TUTORIAL_STEPS.length-1,s+1));};
  const back=()=>{setSelected(null);setStep(s=>Math.max(0,s-1));};
  return(
    <div style={S.pg} className="rk-pg rk-tutorial-shell">
      {onBack&&<RackleHeader onBack={onBack} setScreen={setScreen}/>}      
      <div className="rk-tutorial-stage rk-sweep">
        <div style={{position:"relative",zIndex:2}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.16)",borderRadius:999,padding:"7px 12px",marginBottom:18}}>
            <span className="rk-live-spark" />
            <span style={{fontSize:9,letterSpacing:2.4,fontWeight:900,color:"rgba(255,255,255,.78)"}}>RACKLE TRAINING · {progress}%</span>
          </div>
          <div className="rk-float" style={{fontSize:38,marginBottom:8}}>{st.icon}</div>
          <h2 style={{fontFamily:F.d,fontSize:26,color:"#fff",margin:"0 0 10px",fontWeight:900,letterSpacing:-0.8,lineHeight:1.02}}>{st.title}</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,.78)",lineHeight:1.65,margin:"0 auto",fontWeight:650,maxWidth:330}}>{st.body}</p>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"center",gap:5,margin:"0 0 16px"}}>
        {TUTORIAL_STEPS.map((_,i)=>(<div key={i} style={{width:i===step?24:7,height:7,borderRadius:99,background:i===step?C.jade:i<step?C.jade+"55":C.bdr,transition:"all .25s"}}/>))}
      </div>

      <div className="rk-premium-card" style={{padding:16,marginBottom:14}}>
        <div style={{fontSize:9,letterSpacing:2.1,fontWeight:900,color:C.jade,marginBottom:10}}>TRY THE READ</div>
        {st.showTiles&&(<RackSurface>{sampleTiles.map((t,i)=>(<div key={i}><Ti t={t} sel={selected===`tile-${i}`} onClick={()=>setSelected(`tile-${i}`)}/>{selected===`tile-${i}`&&<div className="rk-in" style={{textAlign:"center",fontSize:10,color:tC(t),fontWeight:800,marginTop:3}}>{tAria(t)}</div>}</div>))}</RackSurface>)}
        {!st.showTiles&&<p className="rk-premium-copy" style={{marginBottom:2}}>{st.detail}</p>}
      </div>

      <div className="rk-premium-stack" style={{marginBottom:14}}>
        {choices.map((c,i)=>(
          <button key={i} className="rk-tutorial-choice" onClick={()=>setSelected(`choice-${i}`)} style={selected===`choice-${i}`?{borderColor:c.good?C.jade+"55":C.gold+"55",background:c.good?"linear-gradient(145deg,#F3FBF6,#FFFDF8)":"linear-gradient(145deg,#FFF8EA,#FFFDF8)"}:undefined}>
            <div className="rk-premium-icon" style={{width:40,height:40,borderRadius:14,fontSize:17}}>{selected===`choice-${i}`?(c.good?"✓":"•"):"✦"}</div>
            <div style={{flex:1}}><strong>{c.title}</strong><br/><span>{c.body}</span></div>
          </button>
        ))}
      </div>

      {st.tip&&<div className="rk-premium-card" style={{padding:14,marginBottom:14,background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",borderColor:C.gold+"30"}}><div style={{fontSize:12,color:C.gold,fontWeight:900,lineHeight:1.55}}>Coach tip: {st.tip}</div></div>}

      <div style={{display:"flex",gap:8,marginTop:8}}>
        {step>0&&<button onClick={back} style={{...S.oBtn,flex:1}}>← Back</button>}
        {!isLast?<button onClick={next} style={{...S.greenBtn,flex:1}}>Next lesson →</button>:<button onClick={onDone} style={{...S.greenBtn,flex:1}}>Start Playing →</button>}
      </div>
      <div style={{textAlign:"center",marginTop:12}}><button onClick={onBack||onDone} style={{background:"none",border:"none",color:C.mut,fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Skip tutorial</button></div>
      <Footer/>
    </div>
  );
}
// ─── CARD GUIDE ──────────────────────────────────────────────────────────────
// Full 2026 NMJL card reference: section strategy + every actual hand rendered.
// Three views: Section List → Section Detail (strategy + hands) → Hand detail
// Plus: search, filter by value/concealed, anchor tile quick-ref.
function CardGuideScreen({home,setScreen}){
  const [view,setView]=useState("sections"); // "sections" | "section" | "search"
  const [activeSec,setActiveSec]=useState(null);
  const [search,setSearch]=useState("");
  const [filterConcealed,setFilterConcealed]=useState(false);
  const [filterValue,setFilterValue]=useState(null); // null | 25 | 30 | 35 | 40 | 50+

  const secObj=activeSec?SECS.find(s=>s.id===activeSec):null;

  // All hands for the active view
  const visibleHands=(()=>{
    let h=HAND_CATALOG;
    if(view==="section"&&activeSec) h=h.filter(x=>x.sec===activeSec);
    if(view==="search"&&search.trim()) h=h.filter(x=>x.label.toLowerCase().includes(search.toLowerCase())||SECS.find(s=>s.id===x.sec)?.name.toLowerCase().includes(search.toLowerCase()));
    if(filterConcealed) h=h.filter(x=>x.concealed);
    if(filterValue) h=h.filter(x=>filterValue===50?x.value>=50:x.value===filterValue);
    return h;
  })();

  // Anchor tile quick-ref data
  const ANCHORS={
    "2026":{tiles:["2","6","Soap"],note:"2s and 6s appear in every hand. Soap (White Dragon) in 3 of 4."},
    "2468":{tiles:["6","2","8","4"],note:"6 appears in 7 of 8 hands, the non-negotiable anchor."},
    "369":{tiles:["6","3","9"],note:"6 is in 100% of hands. 3 and 9 in 5 of 6."},
    "13579":{tiles:["5","3","1","7","9"],note:"5 and 3 appear in 9 of 10 hands, prioritize these first."},
    "cr":{tiles:["Run","Depth"],note:"No single anchor number. Identify your 3-4 number window early."},
    "wd":{tiles:["Winds","Dragons"],note:"Winds in 7 of 8 hands. Dragons in 5 of 8."},
    "aln":{tiles:["One #","×14"],note:"Pick one number value and fill every tile slot with it."},
    "q":{tiles:["🃏🃏","Nat ×3"],note:"Requires 2+ Jokers. 3-4 natural copies of one tile to stack."},
    "sp":{tiles:["Pairs","No 🃏"],note:"Concealed only. Jokers cannot be used, pass them immediately."},
  };

  const goSection=(id)=>{setActiveSec(id);setView("section");window.scrollTo(0,0);};
  const goBack=()=>{if(view==="section"){setView("sections");setActiveSec(null);}else if(view==="search"){setView("sections");setSearch("");}else{home();}};

  // ── SECTION LIST VIEW ─────────────────────────────────────────────────────
  if(view==="sections"){return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{marginBottom:14,marginTop:4}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>2026 Card Reference</div>
        <p style={{fontSize:12,color:C.mut,margin:"0 0 12px",lineHeight:1.6}}>Every section, every hand. Your in-game cheat sheet.</p>
        {/* Search bar */}
        <div style={{position:"relative",marginBottom:14}}>
          <input value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value.trim())setView("search");}}
            placeholder="Search hands by tile pattern…"
            style={{width:"100%",padding:"10px 14px 10px 36px",borderRadius:12,border:`1.5px solid ${C.bdr}`,fontSize:13,fontFamily:F.b,color:C.ink,outline:"none",background:"#FFFDF8",boxShadow:"inset 0 1px 0 rgba(255,255,255,.8),0 2px 8px rgba(26,20,16,.025)"}}/>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,pointerEvents:"none"}}>🔍</span>
        </div>
      </div>

      {/* Section cards */}
      {SECS.map(s=>{
        const hands=HAND_CATALOG.filter(h=>h.sec===s.id);
        const maxVal=Math.max(...hands.map(h=>h.value));
        const hasConcealed=hands.some(h=>h.concealed);
        const anchor=ANCHORS[s.id];
        return(
          <button key={s.id} onClick={()=>goSection(s.id)}
            className="rk-row-card" style={{display:"block",width:"100%",textAlign:"left",background:"linear-gradient(145deg,#FFFDF8,#F7F0E5)",border:`1px solid rgba(26,20,16,.075)`,borderRadius:16,marginBottom:10,padding:"14px 16px",cursor:"pointer",transition:"transform .16s ease,box-shadow .16s ease,border-color .16s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <div style={{width:44,height:44,borderRadius:12,background:s.color+"14",border:`1px solid ${s.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:800,color:C.ink,marginBottom:2}}>{s.name}</div>
                <div style={{fontSize:11,color:C.mut,lineHeight:1.3}}>{s.desc}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                <span style={{fontSize:10,fontWeight:700,color:C.mut}}>{hands.length} hands</span>
                {hasConcealed&&<span style={{fontSize:8,fontWeight:700,background:"#2460A815",color:"#2460A8",borderRadius:6,padding:"2px 5px"}}>has concealed</span>}
              </div>
            </div>
            {/* Anchor tile chips */}
            {anchor&&<div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:8,color:C.mut,fontWeight:700,letterSpacing:1,flexShrink:0}}>ANCHOR:</span>
              {anchor.tiles.map((tile,i)=>(
                <span key={i} style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:8,background:s.color+"14",color:s.color,border:`1px solid ${s.color}25`}}>{tile}</span>
              ))}
            </div>}
            {/* Hold / pass mini-row */}
            <div style={{display:"flex",gap:6}}>
              <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"6px 8px",border:`1px solid ${C.jade}15`}}>
                <div style={{fontSize:7,color:C.jade,fontWeight:700,letterSpacing:1.5,marginBottom:2}}>✓ HOLD</div>
                <div style={{fontSize:10,color:C.ink,lineHeight:1.5}}>{s.hold}</div>
              </div>
              <div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"6px 8px",border:`1px solid ${C.cinn}15`}}>
                <div style={{fontSize:7,color:C.cinn,fontWeight:700,letterSpacing:1.5,marginBottom:2}}>✗ PASS</div>
                <div style={{fontSize:10,color:C.ink,lineHeight:1.5}}>{s.pass}</div>
              </div>
            </div>
            <div style={{marginTop:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:10,color:C.mut}}>Max value: <b style={{color:C.ink}}>{maxVal}pts</b></span>
              <span style={{fontSize:11,color:s.color,fontWeight:700}}>See all {hands.length} hands →</span>
            </div>
          </button>
        );
      })}

      {/* Dragon matching guide */}
      <div style={{...S.card,marginTop:4,background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",borderColor:C.gold+"30"}}>
        <div style={{fontSize:8,color:C.gold,letterSpacing:2,fontWeight:700,marginBottom:8}}>🐉 DRAGON MATCHING GUIDE</div>
        {[
          {suit:"Bam",dragon:"Green Dragon",suitCol:SC.bam,dragonCol:"#1B7D4E",tiles:[{t:"s",s:"bam",n:5},{t:"d",v:"Grn"}]},
          {suit:"Crak",dragon:"Red Dragon",suitCol:SC.crak,dragonCol:"#B83232",tiles:[{t:"s",s:"crak",n:5},{t:"d",v:"Red"}]},
          {suit:"Dot",dragon:"Soap / White Dragon",suitCol:SC.dot,dragonCol:"#6B6560",tiles:[{t:"s",s:"dot",n:5},{t:"d",v:"Soap"}]},
        ].map(row=>(
          <div key={row.suit} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 8px",background:"#fff",borderRadius:8,marginBottom:6}}>
            <div style={{display:"flex",gap:5}}>{row.tiles.map((t,i)=><Ti key={i} t={t}/>)}</div>
            <div style={{flex:1}}>
              <span style={{fontSize:11,fontWeight:700,color:row.suitCol}}>{row.suit}</span>
              <span style={{fontSize:10,color:C.mut}}> → </span>
              <span style={{fontSize:11,fontWeight:700,color:row.dragonCol}}>{row.dragon}</span>
            </div>
          </div>
        ))}
        <div style={{fontSize:10,color:C.mut,lineHeight:1.6,marginTop:4}}>"Matching Dragon" = use the dragon that matches your suit color. "Opposite Dragon" = use the non-matching one.</div>
      </div>
      <Footer/>
    </div>
  );}

  // ── SEARCH RESULTS VIEW ───────────────────────────────────────────────────
  if(view==="search"){return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={()=>{setView("sections");setSearch("");}} setScreen={setScreen}/>
      <div style={{marginBottom:12,marginTop:4}}>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:8}}>Search Results</div>
        <div style={{position:"relative",marginBottom:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} autoFocus
            placeholder="Search hands…"
            style={{width:"100%",padding:"10px 14px 10px 36px",borderRadius:12,border:`1.5px solid ${C.jade}40`,fontSize:13,fontFamily:F.b,color:C.ink,outline:"none",background:"#fff"}}/>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span>
        </div>
        <div style={{fontSize:11,color:C.mut,marginBottom:8}}>{visibleHands.length} result{visibleHands.length!==1?"s":""}</div>
      </div>
      {visibleHands.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.mut,fontSize:13}}>No hands matched "{search}"</div>}
      {visibleHands.map((h,i)=><HandRenderer key={i} hand={h}/>)}
      <Footer/>
    </div>
  );}

  // ── SECTION DETAIL VIEW ───────────────────────────────────────────────────
  const secHands=HAND_CATALOG.filter(h=>h.sec===activeSec);
  const anchor=ANCHORS[activeSec]||{};
  const vals=[...new Set(secHands.map(h=>h.value))].sort((a,b)=>a-b);

  let filtered=secHands;
  if(filterConcealed) filtered=filtered.filter(h=>h.concealed);
  if(filterValue) filtered=filtered.filter(h=>filterValue===50?h.value>=50:h.value===filterValue);

  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={()=>{setView("sections");setActiveSec(null);setFilterConcealed(false);setFilterValue(null);}} setScreen={setScreen}/>

      {/* Section header */}
      <div style={{marginBottom:14,marginTop:4}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <div style={{width:44,height:44,borderRadius:12,background:secObj?.color+"14",border:`1px solid ${secObj?.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{secObj?.icon}</div>
          <div>
            <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,letterSpacing:-0.5}}>{secObj?.name}</div>
            <div style={{fontSize:11,color:C.mut}}>{secHands.length} hands · {secObj?.desc}</div>
          </div>
        </div>
      </div>

      {/* Anchor tile row */}
      {anchor.tiles&&(
        <div style={{...S.card,marginBottom:8,padding:"10px 14px",background:`${secObj?.color}08`,borderColor:`${secObj?.color}25`}}>
          <div style={{fontSize:8,color:secObj?.color,letterSpacing:1.5,fontWeight:700,marginBottom:6}}>⚓ ANCHOR TILES</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
            {anchor.tiles.map((tile,i)=>(
              <span key={i} style={{fontSize:12,fontWeight:800,padding:"4px 10px",borderRadius:10,background:"#fff",color:secObj?.color,border:`1px solid ${secObj?.color}30`}}>{tile}</span>
            ))}
          </div>
          <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{anchor.note}</div>
        </div>
      )}

      {/* Hold / Pass / Strategy accordion */}
      <SectionStrategyCard sec={secObj}/>

      {/* Filter row */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>
        <span style={{fontSize:9,color:C.mut,fontWeight:700,letterSpacing:1}}>FILTER:</span>
        <button onClick={()=>setFilterConcealed(f=>!f)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${filterConcealed?"#2460A8":C.bdr}`,background:filterConcealed?"#2460A812":"#fff",fontSize:10,fontWeight:filterConcealed?700:400,color:filterConcealed?"#2460A8":C.mut,cursor:"pointer"}}>
          🔒 Concealed
        </button>
        {vals.map(v=>(
          <button key={v} onClick={()=>setFilterValue(filterValue===v?null:v)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${filterValue===v?C.gold:C.bdr}`,background:filterValue===v?C.gold+"12":"#fff",fontSize:10,fontWeight:filterValue===v?700:400,color:filterValue===v?C.gold:C.mut,cursor:"pointer"}}>
            {v}pts
          </button>
        ))}
        {(filterConcealed||filterValue)&&(
          <button onClick={()=>{setFilterConcealed(false);setFilterValue(null);}} style={{padding:"4px 8px",borderRadius:20,border:`1px solid ${C.cinn}40`,background:C.cinn+"08",fontSize:10,color:C.cinn,cursor:"pointer",fontWeight:600}}>Clear</button>
        )}
      </div>

      {/* Hand count */}
      <div style={{fontSize:11,color:C.mut,marginBottom:8}}>
        {filtered.length < secHands.length?`${filtered.length} of ${secHands.length} hands`:`All ${secHands.length} hands`}
        {filtered.length===0&&", no hands match these filters"}
      </div>

      {/* Hands */}
      {filtered.map((h,i)=><HandRenderer key={i} hand={h} defaultOpen={secHands.length<=3}/>)}

      {/* Joker note for section */}
      {secObj?.joker&&(
        <div style={{...S.card,marginTop:4,background:"#FFF9E6",borderColor:C.gold+"30"}}>
          <div style={{fontSize:8,color:C.gold,letterSpacing:1.5,fontWeight:700,marginBottom:5}}>🃏 JOKER TIPS FOR {secObj.name.toUpperCase()}</div>
          <div style={{fontSize:11,color:C.ink,lineHeight:1.65}}>{secObj.joker}</div>
        </div>
      )}
      <Footer/>
    </div>
  );
}

// Section strategy accordion, hold / pass / combos in a compact collapsible
function SectionStrategyCard({sec}){
  const [open,setOpen]=useState(false);
  if(!sec)return null;
  return(
    <div style={{...S.card,marginBottom:8,padding:0,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"11px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{fontSize:12,fontWeight:700,color:C.ink}}>Strategy & Charleston Tips</div>
        <span style={{fontSize:11,color:C.mut}}>{open?"▾":"▸"}</span>
      </button>
      {open&&(
        <div className="rk-in" style={{borderTop:`1px solid ${C.bdr}`}}>
          <div style={{display:"flex",gap:8,padding:"10px 14px"}}>
            <div style={{flex:1,background:C.jade+"08",borderRadius:8,padding:"8px 10px",border:`1px solid ${C.jade}15`}}>
              <div style={{fontSize:7,color:C.jade,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>✓ HOLD</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{sec.hold}</div>
            </div>
            <div style={{flex:1,background:C.cinn+"06",borderRadius:8,padding:"8px 10px",border:`1px solid ${C.cinn}15`}}>
              <div style={{fontSize:7,color:C.cinn,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>✗ PASS</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.6}}>{sec.pass}</div>
            </div>
          </div>
          <div style={{padding:"0 14px 10px"}}>
            <div style={{background:C.gold+"08",borderRadius:8,padding:"8px 10px",border:`1px solid ${C.gold}15`}}>
              <div style={{fontSize:7,color:C.gold,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>💡 STRATEGY</div>
              <div style={{fontSize:11,color:C.ink,lineHeight:1.65}}>{sec.combos}</div>
            </div>
          </div>
        </div>
      )}
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
    ["The best players are the ones who come back.", "Come back."],
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
    ["One more day. One more shot.", "Same hand for every player, including the ones trying to beat you."],
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
          {urgent?"⚠ LAST CHANCE":"TOMORROW'S RACKLE"}
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
        :<div/>
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
    <div className="rk-email-home" style={{...S.card,background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",borderColor:C.jade+"25",marginBottom:8,textAlign:"left"}}>
      <div style={{fontSize:10,color:C.jade,letterSpacing:1.5,fontWeight:800,marginBottom:6,textAlign:"left"}}>STAY IN THE LOOP</div>
      {done?(<div style={{textAlign:"center",padding:"8px 0"}}><div style={{fontSize:18,marginBottom:4}}>🀄</div><div style={{fontSize:13,fontWeight:700,color:C.jade}}>You're on the list!</div><div style={{fontSize:11,color:C.mut,marginTop:3}}>We'll let you know when we drop updates.</div></div>):(
        <>
          <p style={{fontSize:12,color:C.mut,margin:"0 0 10px",lineHeight:1.5,textAlign:"left"}}>Get notified about new features, updates, and more.</p>
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

// ─── INLINE CODE ENTRY, "I have a code" pill on homepage ───────────────────
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
    <div className="rk-inline-code-row" style={{borderTop:`1px solid ${C.bdr}`,background:C.bg}}>
      <button className="rk-inline-code-button" onClick={()=>setOpen(o=>!o)}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.jade+"15",border:`1px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🔑</div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:C.jade,fontFamily:F.d,letterSpacing:-0.05}}>I have a club code</div>
            <div className="rk-inline-code-copy">Join your club board</div>
          </div>
        </div>
        <span style={{fontSize:12,color:C.jade,opacity:0.7,transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block"}}>▾</span>
      </button>
      {open&&(
        <div className="rk-in rk-connected-panel" style={{padding:"0 14px 14px"}}>
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

function ClubCodeEntry({setScreen,clubEntries=[],currentScore=0,currentRank=null,clubPlayers=0}){
  const [open,setOpen]=useState(false);
  const [codeOpen,setCodeOpen]=useState(false);
  const [code,setCode]=useState("");
  const [err,setErr]=useState("");
  const [clubStats,setClubStats]=useState(null);

  const profile=getProfile();
  const hasProfile=!!(profile&&profile.nickname);
  const savedCode=hasProfile?getClubCode():null;
  const savedClub=savedCode?CLUBS[savedCode]:null;
  const myName=rkCurrentDisplayName();

  useEffect(()=>{
    if(!savedCode)return;
    fetchLBEntries(savedCode).then(rows=>{
      const safeRows=rkSortLeaderboardEntries(Array.isArray(rows)?rows:[]).map(e=>rkNormalizeCurrentEntry(e));
      const myRank=rkRankOfCurrent(safeRows,currentScore||null);
      const top=safeRows[0];
      setClubStats({total:safeRows.length,topName:top?.name,topIQ:top?.iqScore,myRank:myRank||null,rows:safeRows});
    });
  },[savedCode,currentScore]);

  const join=()=>{
    const trimmed=code.trim();
    if(!trimmed){setErr("Enter a 4-digit club code.");return;}
    if(!CLUBS[trimmed]){setErr("Code not recognised. Check with your club organiser.");return;}
    setClubCode(trimmed);setErr("");setCode("");setScreen("leaderboard");
  };

  const addClubEmail="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20";
  const realClubEntries=Array.isArray(clubEntries)?clubEntries.filter(e=>Number.isFinite(Number(e.iqScore))):[];
  const allRows=rkSortLeaderboardEntries((clubStats?.rows&&clubStats.rows.length?clubStats.rows:realClubEntries).map(e=>rkNormalizeCurrentEntry(e,currentScore)));
  const rows=allRows.slice(0,3);
  const leader=allRows[0]||null;
  const liveCount=allRows.length;
  const myRank=currentRank||clubStats?.myRank||rkRankOfCurrent(allRows,currentScore)||null;
  const topScore=leader?.iqScore||clubStats?.topIQ||null;
  const roomCopy=myRank===1?"You lead your club today.":myRank?`You are #${myRank} in the room.`:"Post your Daily to enter the room.";

  return(
    <div style={{marginBottom:0}}>
      <button onClick={()=>savedClub?setOpen(o=>!o):setScreen("clubs")} className={`rk-quiet-board-head ${open?"rk-quiet-head-open":"rk-quiet-head-closed"}`} style={{borderTop:`1px solid ${C.bdr}`}} aria-expanded={open}>
        <div style={{flex:1,minWidth:0}}>
          <div className="rk-quiet-topline">
            <span className="rk-quiet-mini-icon">{savedClub?"🗝️":"🏛️"}</span>
            <div className="rk-quiet-kicker" style={{marginBottom:0}}>
              <span>{savedClub?"Your club · Today":"Join your club"}</span>
              {savedClub&&<span className="rk-quiet-live"><span className="rk-quiet-live-dot"/>Active</span>}
            </div>
          </div>
          <div className="rk-quiet-title">{savedClub?savedClub.name:"Club Leaderboard"}</div>
          <div className="rk-quiet-desc">Your table’s daily score room.</div>
          {savedClub?(
            <div className="rk-quiet-preview-line">
              <span className="rk-quiet-preview-pill rk-quiet-preview-pill-green">{liveCount} live</span>
              {topScore&&<span className="rk-quiet-preview-pill rk-quiet-preview-pill-gold">{topScore} leads</span>}
              {myRank&&<span className="rk-quiet-preview-pill rk-quiet-preview-pill-blue">You #{myRank}</span>}
            </div>
          ):(<div style={{fontSize:12,color:C.mut,lineHeight:1.55}}>Bring your table online with one shared club board.</div>)}
        </div>
        <span className="rk-quiet-chevron" aria-hidden="true"><span className={`rk-chevron-mark ${open?"rk-chevron-mark-open":""}`} /></span>
      </button>

      {open&&<div className="rk-quiet-board-panel">
        {savedClub?(
          <>
            {leader&&<div className="rk-quiet-leader">
              <div className="rk-quiet-badge">1</div>
              <div style={{flex:1,minWidth:0,position:"relative",zIndex:1}}>
                <div style={{fontSize:9,letterSpacing:2.2,textTransform:"uppercase",fontWeight:950,color:"rgba(243,212,107,.86)",marginBottom:5}}>Club table leader</div>
                <div style={{fontFamily:F.d,fontSize:20,fontWeight:950,lineHeight:1.05,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{leader.name}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.72)",marginTop:3}}>{roomCopy}</div>
              </div>
              <div style={{fontFamily:F.d,fontSize:36,fontWeight:950,color:"#F3D46B",lineHeight:1,position:"relative",zIndex:1}}>{leader.iqScore}</div>
            </div>}
            <div className="rk-quiet-row-list">
              {rows.map((e,i)=>{
                const isMe=rkEntryMatchesCurrentPlayer(e);
                return(
                  <div key={i} className={`rk-quiet-row ${isMe?"rk-quiet-row-you":""}`}>
                    <div className={i===0?"rk-quiet-rank rk-quiet-rank-top":"rk-quiet-rank"}>{i+1}</div>
                    <div style={{minWidth:0}}>
                      <div className="rk-quiet-name" style={{color:isMe?C.jade:C.ink}}>{e.name}{isMe?" · you":""}</div>
                      <div className="rk-quiet-sub">{e.streak>1?`${e.streak}d streak`:"Club score posted"}</div>
                    </div>
                    <div className="rk-quiet-score" style={{color:e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn}}>{e.iqScore}</div>
                  </div>
                );
              })}
            </div>
            <div className="rk-quiet-footer">
              <button onClick={()=>setScreen("leaderboard")} className="rk-quiet-link">Open full club board →</button>
            </div>
          </>
        ):(
          <>
            <div className="rk-browser-mode-card" style={{marginTop:0}}>
              <div style={{fontFamily:F.d,fontSize:18,fontWeight:950,color:C.ink,marginBottom:6}}>Bring your table online</div>
              <div style={{fontSize:12,color:C.mut,lineHeight:1.6}}>One shared rack. One club board. A reason to come back before the next game.</div>
            </div>
            <button onClick={()=>setScreen("clubs")} className="rk-primary-btn" style={{width:"100%",padding:"12px 0",borderRadius:14,color:"#fff",fontSize:14,fontWeight:950,cursor:"pointer",fontFamily:F.d,marginBottom:8}}>Browse Club Directory →</button>
            <button onClick={()=>{setCodeOpen(o=>!o);setErr("");setCode("");}} className="rk-secondary-btn" style={{width:"100%",padding:"11px 0",borderRadius:14,color:C.jade,fontSize:13,fontWeight:950,cursor:"pointer",fontFamily:F.b,marginBottom:codeOpen?8:0}}>{codeOpen?"Cancel":"I have a code"}</button>
            {codeOpen&&<div className="rk-in" style={{display:"flex",flexDirection:"column",gap:7}}>
              <div style={{display:"flex",justifyContent:"center",gap:7}}>
                <input value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,"").slice(0,4));setErr("");}} onKeyDown={e=>e.key==="Enter"&&join()} placeholder="----" maxLength={4} autoFocus className="rk-soft-input" style={{width:94,padding:"10px 12px",fontSize:17,fontFamily:F.d,fontWeight:950,color:C.ink,outline:"none",textAlign:"center",letterSpacing:4}}/>
                <button onClick={join} className="rk-primary-btn" style={{padding:"10px 18px",borderRadius:12,color:"#fff",fontSize:12,fontWeight:950,cursor:"pointer",whiteSpace:"nowrap"}}>Join →</button>
              </div>
              {err&&<div style={{fontSize:11,color:C.cinn,textAlign:"center"}}>{err}</div>}
            </div>}
          </>
        )}
        <div style={{textAlign:"center",paddingTop:10,borderTop:`1px solid ${C.bdr}`,marginTop:10}}><a href={addClubEmail} style={{fontSize:11,color:C.jade,textDecoration:"none",fontWeight:900}}>+ Bring your club onto Rackle →</a></div>
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
  const myName=rkCurrentDisplayName();
  const dn=getDayNum();

  useEffect(()=>{
    setLoading(true);
    fetchGlobalEntries().then(rows=>{setEntries(rows||[]);setLoading(false);setFetched(true);});
  },[]);

  const toggle=()=>{
    if(!open&&!fetched){setLoading(true);fetchGlobalEntries().then(rows=>{setEntries(rows||[]);setLoading(false);setFetched(true);});}
    setOpen(o=>!o);
  };
  const refresh=()=>{setLoading(true);fetchGlobalEntries().then(rows=>{setEntries(rows||[]);setLoading(false);setFetched(true);});};

  const allEntries=rkSortLeaderboardEntries((entries||[]).map(e=>rkNormalizeCurrentEntry(e)));
  const rows=allEntries.slice(0,3);
  const leader=allEntries[0]||null;
  const myRank=rkRankOfCurrent(allEntries,null)||0;
  const myEntry=myRank>0?allEntries[myRank-1]:null;
  const gap=myEntry&&leader?Math.max(0,(Number(leader.iqScore)||0)-(Number(myEntry.iqScore)||0)):null;
  const hasData=allEntries.length>0;
  const liveCopy=hasData?`${allEntries.length} players in the room`:"Same rack. One room. First score sets the table.";

  return(
    <div id="global-leaderboard" className={`rk-quiet-board rk-global-board-home ${open?"rk-global-board-open":""}`} style={{marginBottom:0,borderRadius:open?"22px 22px 0 0":"22px 22px 0 0"}}>
      <button onClick={toggle} className={`rk-quiet-board-head ${open?"rk-quiet-head-open":"rk-quiet-head-closed"}`} aria-expanded={open}>
        <div style={{flex:1,minWidth:0}}>
          <div className="rk-quiet-topline">
            <span className="rk-quiet-mini-icon">🌍</span>
            <div className="rk-quiet-kicker" style={{color:"#2460A8",marginBottom:0}}>
              <span>Global · Day #{dn}</span>
              {hasData&&<span className="rk-quiet-live"><span className="rk-quiet-live-dot"/>Live room</span>}
            </div>
          </div>
          <div className="rk-quiet-title">Rackle Leaderboard</div>
          <div className="rk-quiet-desc">See who owns today’s rack before the board resets.</div>
          {hasData?(
            <div className="rk-quiet-preview-line">
              <span className="rk-quiet-preview-pill rk-quiet-preview-pill-blue">{allEntries.length} players</span>
              {leader&&<span className="rk-quiet-preview-pill rk-quiet-preview-pill-gold">{leader.iqScore} leads</span>}
              {myRank>0?<span className="rk-quiet-preview-pill rk-quiet-preview-pill-green">You #{myRank}</span>:<span className="rk-quiet-preview-pill rk-quiet-preview-pill-gold">Play to rank</span>}
            </div>
          ):(<div style={{fontSize:12,color:C.mut,lineHeight:1.55}}>{loading?"Loading the room…":liveCopy}</div>)}
        </div>
        <span className="rk-quiet-chevron" style={{color:"#2460A8"}} aria-hidden="true"><span className={`rk-chevron-mark ${open?"rk-chevron-mark-open":""}`} /></span>
      </button>

      {open&&<div className="rk-quiet-board-panel">
        {loading?(
          <div style={{textAlign:"center",padding:"22px 14px"}}><div style={{fontSize:22,opacity:.28,marginBottom:6}}>⏳</div><div style={{fontSize:12,color:C.mut}}>Loading global scores…</div></div>
        ):rows.length===0?(
          <div style={{textAlign:"center",padding:"24px 14px"}}>
            <div style={{fontSize:28,marginBottom:8}}>🀄</div>
            <div style={{fontFamily:F.d,fontSize:17,fontWeight:950,color:C.ink,marginBottom:5}}>Board’s empty. Take the room.</div>
            <div style={{fontSize:12,color:C.mut,lineHeight:1.6,marginBottom:12}}>Play today’s Daily and set the number everyone else has to chase.</div>
            <button onClick={refresh} className="rk-small-toggle">↻ Refresh</button>
          </div>
        ):(
          <>
            {leader&&<div className="rk-quiet-leader">
              <div className="rk-quiet-badge">1</div>
              <div style={{flex:1,minWidth:0,position:"relative",zIndex:1}}>
                <div style={{fontSize:9,letterSpacing:2.2,textTransform:"uppercase",fontWeight:950,color:"rgba(243,212,107,.86)",marginBottom:5}}>Today’s table leader</div>
                <div style={{fontFamily:F.d,fontSize:20,fontWeight:950,lineHeight:1.05,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{leader.name}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.72)",marginTop:3}}>{myEntry?`${gap} points ahead of you`:liveCopy}</div>
              </div>
              <div style={{fontFamily:F.d,fontSize:36,fontWeight:950,color:"#F3D46B",lineHeight:1,position:"relative",zIndex:1}}>{leader.iqScore}</div>
            </div>}
            <div className="rk-quiet-row-list">
              {rows.map((e,i)=>{
                const isMe=rkEntryMatchesCurrentPlayer(e);
                const clubLabel=e.clubCode&&CLUBS[e.clubCode]?CLUBS[e.clubCode].name:"Rackle player";
                return(
                  <div key={i} className={`rk-quiet-row ${isMe?"rk-quiet-row-you":""}`}>
                    <div className={i===0?"rk-quiet-rank rk-quiet-rank-top":"rk-quiet-rank"}>{i+1}</div>
                    <div style={{minWidth:0}}>
                      <div className="rk-quiet-name" style={{color:isMe?"#2460A8":C.ink}}>{e.name}{isMe?" · you":""}</div>
                      <div className="rk-quiet-sub">{clubLabel}{e.streak>1?` · ${e.streak}d streak`:""}</div>
                    </div>
                    <div className="rk-quiet-score" style={{color:e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn}}>{e.iqScore}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div className="rk-quiet-footer">
          {setScreen&&<button onClick={()=>setScreen("globalLeaderboard")} className="rk-quiet-link">Open full room →</button>}
          <div style={{fontSize:10.5,color:C.mut,lineHeight:1.45}}>Play the Daily to appear · Board resets tonight</div>
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
      <div style={{fontSize:11,color:C.mut,lineHeight:1.6}}>{period==="yesterday"?"Looks like nobody played yesterday, don't let that happen today.":"Be the first to post a score for this period."}</div>
    </div>
  );

  const cols=showTime
    ?{template:"28px 1fr 44px 44px 36px",headers:["#","Name","Score","Time","🔥"]}
    :{template:"28px 1fr 52px 36px",headers:["#","Name","Score","🔥"]};

  return(
    <>
      <div style={{display:"grid",gridTemplateColumns:cols.template,gap:0,padding:"8px 14px",background:C.bg2,borderBottom:`1px solid ${C.bdr}`}}>
        {cols.headers.map((h,i)=>(
          <div key={i} style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,textAlign:i>1?"center":"left"}}>{h}</div>
        ))}
      </div>
      {entries.map((e,i)=>{
        const isMe=rkEntryMatchesCurrentPlayer(e);
        const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
        return(
          <div key={i} style={{display:"grid",gridTemplateColumns:cols.template,gap:0,padding:"11px 14px",background:isMe?C.jade+"06":"#fff",borderBottom:i<entries.length-1?`1px solid ${C.bdr}`:"none",alignItems:"center"}}>
            <div style={{fontSize:13}}>{medal||<span style={{fontFamily:F.d,fontSize:12,fontWeight:700,color:C.mut}}>{i+1}</span>}</div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:isMe?800:600,color:isMe?C.jade:C.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}{isMe?" (you)":""}</div>
            <div style={{textAlign:"center"}}><span style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:e.iqScore>=80?C.jade:e.iqScore>=60?C.gold:C.cinn}}>{e.iqScore}</span></div>
            {showTime&&<div style={{textAlign:"center",fontSize:11,color:C.mut,fontFamily:F.d,fontWeight:600}}>{e.time?fT(e.time):","}</div>}
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
              <div style={{fontFamily:F.d,fontSize:24,fontWeight:900,color:C.ink,letterSpacing:-0.55,marginBottom:5,lineHeight:1.05}}>{club.name}</div>
              <div style={{fontSize:12,color:C.mut,marginBottom:12}}>{club.location}</div>
              {/* Share link */}
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.sage,borderRadius:10,padding:"7px 12px",border:`1px solid ${C.sageB}20`}}>
                <span style={{fontSize:11,color:C.sageB,fontWeight:600}}>{clubUrl(selected)}</span>
                <button onClick={()=>navigator.clipboard?.writeText(`https://${clubUrl(selected)}`)} style={{background:"none",border:`1px solid ${C.sageB}40`,borderRadius:6,padding:"3px 8px",fontSize:10,color:C.sageB,fontWeight:700,cursor:"pointer"}}>Copy</button>
              </div>
            </div>

            {/* Leaderboard, public, no code needed */}
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
                  <div style={{fontSize:11,color:C.mut,marginTop:4}}>Be the first, play today's Daily Rackle and post your score.</div>
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
                          <div style={{fontFamily:F.d,fontSize:15,fontWeight:800,color:C.jade}}>Score {e.iqScore}</div>
                          {e.streak>1&&<div style={{fontSize:9,color:C.gold,fontWeight:700}}>🔥 {e.streak} day streak</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Code entry, only needed to post a score */}
            {!isMember&&(
              <div style={{...S.card,marginBottom:12,padding:"14px"}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>POST YOUR SCORE</div>
                <div style={{fontSize:12,color:C.mut,marginBottom:10,lineHeight:1.5}}>Enter your club's 4-digit code to join and post your Rackle score to the leaderboard.</div>
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
            <a href="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20" style={{fontSize:13,color:C.jade,fontWeight:700,textDecoration:"none"}}>+ Bring your club onto Rackle →</a>
          </div>
        </>
      )}
      <Footer/>
    </div>
  );
}



// ─── VIRAL ROOM HELPERS ─────────────────────────────────────────────────────
function rkScoreTone(score){
  const s=Number(score||0);
  if(s>=75)return "";
  if(s>=55)return "rk-room-row-score-mid";
  return "rk-room-row-score-low";
}
function rkEntrySub(e,{fallbackClub="Rackle player"}={}){
  const clubName=e?.clubCode&&CLUBS[e.clubCode]?CLUBS[e.clubCode].name:null;
  const bits=[];
  if(clubName)bits.push(clubName);
  else if(fallbackClub)bits.push(fallbackClub);
  if(Number(e?.streak||0)>1)bits.push(`${e.streak}d streak`);
  if(Number(e?.time||0)>0)bits.push(fT(e.time));
  return bits.filter(Boolean).join(" · ");
}
function rkBuildActivity(entries=[],label="room",myRank=null){
  const leader=entries[0];
  const feed=[];
  if(leader)feed.push(`${leader.name} owns the ${label} with ${leader.iqScore}.`);
  if(myRank===1)feed.push(`You are holding the top spot.`);
  else if(myRank&&leader)feed.push(`You are ${Math.max(0,(Number(leader.iqScore)||0)-(Number(entries[myRank-1]?.iqScore)||0))} points behind the lead.`);
  if(entries.length>1)feed.push(`${entries.length} players have posted today.`);
  if(entries.find(e=>Number(e.streak||0)>=5))feed.push(`A streak is alive in the room.`);
  if(feed.length<3)feed.push(`Board resets tonight.`);
  return feed.slice(0,3);
}
function RoomMetric({value,label}){
  return <div className="rk-room-metric"><strong>{value}</strong><span>{label}</span></div>;
}
function RoomLeader({leader,myEntry,count,label="table"}){
  if(!leader)return null;
  const gap=myEntry?Math.max(0,(Number(leader.iqScore)||0)-(Number(myEntry.iqScore)||0)):null;
  return <div className="rk-room-leader">
    <div className="rk-room-rank-badge">1</div>
    <div style={{minWidth:0,position:"relative",zIndex:1}}>
      <div style={{fontSize:9,letterSpacing:2.2,textTransform:"uppercase",fontWeight:950,color:"rgba(243,212,107,.86)",marginBottom:5}}>Today’s {label} leader</div>
      <div className="rk-room-leader-name">{leader.name}</div>
      <div className="rk-room-leader-sub">{myEntry?`${gap} points ahead of you`:`${count} player${count===1?"":"s"} posted today`}</div>
    </div>
    <div className="rk-room-score">{leader.iqScore}</div>
  </div>;
}
function RoomRows({entries=[],scoreHint=null,emptyTitle="No scores yet",emptyCopy="Play today’s rack and claim the room."}){
  if(!entries.length)return <div className="rk-premium-card" style={{padding:24,textAlign:"center",marginBottom:12}}>
    <div style={{fontSize:30,marginBottom:8}}>🀄</div>
    <div style={{fontFamily:F.d,fontSize:20,fontWeight:950,color:C.ink,marginBottom:5}}>{emptyTitle}</div>
    <div style={{fontSize:13,color:C.mut,lineHeight:1.55}}>{emptyCopy}</div>
  </div>;
  return <div className="rk-room-row-list">
    {entries.slice(0,30).map((e,i)=>{
      const isMe=rkEntryMatchesCurrentPlayer(e,scoreHint);
      return <div key={`${e.playerId||e.player_id||e.name}-${i}`} className={`rk-room-row ${isMe?"rk-room-row-me":""}`}>
        <div className={`rk-room-row-rank ${i<3?"rk-room-row-top":""}`}>{i+1}</div>
        <div style={{minWidth:0}}>
          <div className="rk-room-row-name">{e.name}{isMe?" · you":""}</div>
          <div className="rk-room-row-sub">{rkEntrySub(e)}</div>
        </div>
        <div className={`rk-room-row-score ${rkScoreTone(e.iqScore)}`}>{e.iqScore}</div>
      </div>;
    })}
  </div>;
}
function RoomActivity({items=[]}){
  return <div className="rk-room-activity">
    <div className="rk-room-activity-title">Live table notes</div>
    <div className="rk-room-feed">{items.map((item,i)=><div className="rk-room-feed-item" key={i}><span className="rk-room-feed-dot"/><span>{item}</span></div>)}</div>
  </div>;
}
function shareRoomText({title,score,rank,clubCode,clubName}){
  const name=rkCurrentDisplayName();
  return [
    title,
    score?`${name}: ${score}`:"",
    rank?`Rank #${rank}`:"",
    clubName?`${clubName}${clubCode?` · code ${clubCode}`:""}`:"",
    "Play today: playrackle.com"
  ].filter(Boolean).join("\n");
}
async function rkCopyOrShare(text,title="Rackle"){
  try{if(navigator.share)await navigator.share({title,text});else await navigator.clipboard.writeText(text);return true;}catch(e){try{await navigator.clipboard.writeText(text);return true;}catch(_){return false;}}
}

// ─── GLOBAL RACKLE LEADERBOARD SCREEN ───────────────────────────────────────
function GlobalLeaderboardScreen({home,dRes,streak,setScreen}){
  const dn=getDayNum();
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [copied,setCopied]=useState(false);
  const iq=withIQStyle(dRes?.iq);
  const score=Number(iq?.totalScore||0);
  const time=Number(dRes?.time||iq?.totalTime||0);
  const load=useCallback(async()=>{
    setLoading(true);
    const rows=await fetchGlobalEntries();
    const merged=rkMergeCurrentScore(rows||[],score||null,time,streak||0);
    setEntries(rkSortLeaderboardEntries(merged.map(e=>rkNormalizeCurrentEntry(e,score))));
    setLoading(false);
  },[score,time,streak]);
  useEffect(()=>{load();},[load]);

  const myRank=rkRankOfCurrent(entries,score)||null;
  const leader=entries[0]||null;
  const myEntry=myRank?entries[myRank-1]:null;
  const activity=rkBuildActivity(entries,"global room",myRank);
  const shareText=shareRoomText({title:`Rackle Global Room · Day #${dn}`,score,rank:myRank});

  return <div style={S.pg} className="rk-pg rk-room-page">
    <RackleHeader onBack={home} setScreen={setScreen}/>
    <div className="rk-room-hero">
      <div className="rk-room-kicker">Global room · Day #{dn}</div>
      <h1 className="rk-room-title">Today’s Rackle Room</h1>
      <p className="rk-room-copy">Every score from today’s rack. Check the lead, find your place, then make the table chase.</p>
      <div className="rk-room-metrics">
        <RoomMetric value={entries.length||"—"} label="players"/>
        <RoomMetric value={leader?.iqScore||"—"} label="score to beat"/>
        <RoomMetric value={myRank?`#${myRank}`:"—"} label="your rank"/>
      </div>
    </div>
    {loading?<div className="rk-premium-card" style={{padding:28,textAlign:"center",marginBottom:12}}>Loading the room…</div>:<>
      <RoomLeader leader={leader} myEntry={myEntry} count={entries.length} label="table"/>
      {score>0&&<div className="rk-room-you">
        <div className="rk-room-you-main"><div className="rk-room-you-icon">🎯</div><div style={{minWidth:0}}><div className="rk-room-you-title">You are {myRank?`#${myRank}`:"on the board"}</div><div className="rk-room-you-copy">{leader&&myEntry&&myRank!==1?`Beat ${leader.iqScore} to take the room.`:myRank===1?"You own today’s rack.":"Play the Daily to rank."}</div></div></div>
        <div className={`rk-room-row-score ${rkScoreTone(score)}`}>{score}</div>
      </div>}
      <RoomRows entries={entries} scoreHint={score} emptyTitle="No scores yet" emptyCopy="Play the Daily and set today’s number."/>
      <RoomActivity items={activity}/>
    </>}
    <div className="rk-room-actions">
      <button className="rk-room-btn rk-room-btn-primary" onClick={async()=>{const ok=await rkCopyOrShare(shareText,"Rackle Global Room");setCopied(ok);setTimeout(()=>setCopied(false),1400);}}>{copied?"Copied":"Share room"}</button>
      <button className="rk-room-btn" onClick={load}>Refresh</button>
      <button className="rk-room-btn" onClick={()=>setScreen&&setScreen(getClubCode()?"leaderboard":"clubs")}>{getClubCode()?"Club Room":"Find Club"}</button>
      <button className="rk-room-btn" onClick={home}>Home</button>
    </div>
    <Footer/>
  </div>;
}

function LeaderboardScreen({home,dRes,streak,setScreen}){
  const code=getClubCode();
  const club=code?CLUBS[code]:null;
  const dn=getDayNum();
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(true);
  const [posting,setPosting]=useState(false);
  const [copied,setCopied]=useState(false);
  const [nameInput,setNameInput]=useState(rkCurrentDisplayName()||"");
  const iq=withIQStyle(dRes?.iq);
  const score=Number(iq?.totalScore||0);
  const time=Number(dRes?.time||iq?.totalTime||0);

  const load=useCallback(async()=>{
    if(!code)return;
    setLoading(true);
    const rows=await fetchLBEntries(code);
    const merged=rkMergeCurrentScore(rows||[],score||null,time,streak||0,code);
    setEntries(rkSortLeaderboardEntries(merged.map(e=>rkNormalizeCurrentEntry(e,score))));
    setLoading(false);
  },[code,score,time,streak]);
  useEffect(()=>{load();},[load]);

  if(!club)return <div style={S.pg} className="rk-pg rk-room-page">
    <RackleHeader onBack={home} setScreen={setScreen}/>
    <div className="rk-room-hero"><div className="rk-room-kicker">Club room</div><h1 className="rk-room-title">Find your table</h1><p className="rk-room-copy">Join a club room to compare scores with the people you actually play with.</p></div>
    <button onClick={()=>setScreen("clubs")} className="rk-room-btn rk-room-btn-primary" style={{width:"100%",marginBottom:12}}>Find Your Club</button>
    <Footer/>
  </div>;

  const myRank=rkRankOfCurrent(entries,score)||null;
  const leader=entries[0]||null;
  const myEntry=myRank?entries[myRank-1]:null;
  const activity=rkBuildActivity(entries,"club room",myRank);
  const inviteText=`Join ${club.name} on Rackle. Same daily Charleston. Private club leaderboard.\nClub code: ${code}\nplayrackle.com`;
  const shareText=shareRoomText({title:`${club.name} · Rackle Day #${dn}`,score,rank:myRank,clubCode:code,clubName:club.name});
  const posted=entries.some(e=>rkEntryMatchesCurrentPlayer(e,score));

  const postScore=async()=>{
    if(!score||!nameInput.trim())return;
    setPosting(true);
    const ok=await upsertLBEntry(code,nameInput.trim(),score,time,streak,currentLeaderboardPlayerId());
    if(ok)await load();
    setPosting(false);
  };

  return <div style={S.pg} className="rk-pg rk-room-page">
    <RackleHeader onBack={home} setScreen={setScreen}/>
    <div className="rk-room-hero">
      <div className="rk-room-kicker">Your club · Day #{dn}</div>
      <h1 className="rk-room-title">{club.name}</h1>
      <p className="rk-room-copy">Your table’s daily score room. Post once, share once, and make the group chat chase.</p>
      <div className="rk-room-metrics">
        <RoomMetric value={entries.length||"—"} label="club scores"/>
        <RoomMetric value={leader?.iqScore||"—"} label="score to beat"/>
        <RoomMetric value={myRank?`#${myRank}`:"—"} label="your rank"/>
      </div>
    </div>
    {loading?<div className="rk-premium-card" style={{padding:28,textAlign:"center",marginBottom:12}}>Loading club room…</div>:<>
      <RoomLeader leader={leader} myEntry={myEntry} count={entries.length} label="club"/>
      {score>0&&<div className="rk-room-you">
        <div className="rk-room-you-main"><div className="rk-room-you-icon">🏛️</div><div style={{minWidth:0}}><div className="rk-room-you-title">{posted?`You are ${myRank?`#${myRank}`:"posted"}`:"Post today’s score"}</div><div className="rk-room-you-copy">{posted?myRank===1?"You lead the club today.":`Chase ${leader?.iqScore||score} before midnight.`:"Add your score to the club board."}</div></div></div>
        <div className={`rk-room-row-score ${rkScoreTone(score)}`}>{score}</div>
      </div>}
      {score>0&&!posted&&<div className="rk-invite-card">
        <div style={{fontSize:9,letterSpacing:2.2,textTransform:"uppercase",fontWeight:950,color:C.jade,marginBottom:8}}>Name on board</div>
        <div style={{display:"flex",gap:8}}><input value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="Your name" style={{flex:1,minWidth:0,border:`1px solid rgba(26,20,16,.10)`,borderRadius:14,padding:"12px 13px",fontFamily:F.b,fontSize:13,background:"#FFFDF8",outline:"none"}}/><button onClick={postScore} disabled={posting||!nameInput.trim()} className="rk-room-btn rk-room-btn-primary" style={{padding:"0 16px"}}>{posting?"…":"Post"}</button></div>
      </div>}
      <RoomRows entries={entries} scoreHint={score} emptyTitle="No club scores yet" emptyCopy="Post today’s score and make your table chase."/>
      <RoomActivity items={activity}/>
    </>}
    <div className="rk-invite-card">
      <div style={{display:"flex",alignItems:"center",gap:11,textAlign:"left",marginBottom:12}}><div className="rk-room-you-icon">🔑</div><div><div className="rk-room-you-title">Invite the table</div><div className="rk-room-you-copy">Private code: <strong>{code}</strong></div></div></div>
      <div className="rk-room-actions" style={{marginBottom:0}}>
        <button className="rk-room-btn rk-room-btn-primary" onClick={async()=>{const ok=await rkCopyOrShare(inviteText,`Join ${club.name}`);setCopied(ok);setTimeout(()=>setCopied(false),1400);}}>{copied?"Copied":"Copy invite"}</button>
        <button className="rk-room-btn" onClick={async()=>{const ok=await rkCopyOrShare(shareText,club.name);setCopied(ok);setTimeout(()=>setCopied(false),1400);}}>Share score</button>
      </div>
    </div>
    <div className="rk-room-actions">
      <button className="rk-room-btn" onClick={()=>setScreen&&setScreen("globalLeaderboard")}>Global Room</button>
      <button className="rk-room-btn" onClick={load}>Refresh</button>
      <button className="rk-room-btn" onClick={()=>setScreen&&setScreen("clubs")}>Change Club</button>
      <button className="rk-room-btn" onClick={home}>Home</button>
    </div>
    <Footer/>
  </div>;
}

// ─── STATS PILL, collapsed by default, tap to expand ────────────────────────
function Statspill({streak,rounds,bestIQ,streakBadge}){
  const [open,setOpen]=useState(false);
  const visibleStreak=streak>0?streak:0;
  const hasAny=visibleStreak>0||rounds>0||bestIQ;

  // Compact status pill, day 1 should feel earned, not oversized.
  const icon=visibleStreak>0?(streakBadge?streakBadge.badge:"🔥"):bestIQ?"⭐":"🎲";
  const value=visibleStreak>0?`${visibleStreak}d`:bestIQ?bestIQ.score:rounds;
  const label=visibleStreak>0?"streak":bestIQ?"best":"rounds";
  const color=visibleStreak>0?C.cinn:bestIQ?C.gold:C.mut;
  const bg=visibleStreak>0?`linear-gradient(135deg,${C.cinn}10,#FFF8F0)`:bestIQ?`linear-gradient(135deg,${C.gold}12,#FFF9ED)`:C.bg2;
  const border=visibleStreak>0?`1px solid ${C.cinn}26`:bestIQ?`1px solid ${C.gold}24`:`1px solid ${C.bdr}`;

  if(!hasAny)return null;

  return(
    <div>
      {/* Collapsed pill */}
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,background:bg,border,borderRadius:999,padding:"3px 9px 3px 7px",cursor:"pointer",boxShadow:visibleStreak>0?`0 3px 10px ${C.cinn}10`:"none",minHeight:28}}>
        <span style={{width:18,height:18,borderRadius:99,background:visibleStreak>0?C.cinn+"12":bestIQ?C.gold+"12":"rgba(0,0,0,0.04)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>{icon}</span>
        <span style={{fontFamily:F.d,fontSize:11,fontWeight:900,color,lineHeight:1}}>{value}</span>
        <span style={{fontSize:10,color,fontWeight:800,opacity:0.75,lineHeight:1}}>{label}</span>
        <span style={{fontSize:8,color,opacity:0.55,marginLeft:0}}>{open?"▴":"▾"}</span>
      </button>

      {/* Expanded panel */}
      {open&&<div className="rk-in" style={{marginTop:6,background:"#fff",border:`1px solid ${C.bdr}`,borderRadius:14,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,0.06)",minWidth:180}}>
        {visibleStreak>0&&<div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:8,borderBottom:rounds>0||bestIQ?`1px solid ${C.bdr}`:"none",marginBottom:rounds>0||bestIQ?8:0}}>
          <span style={{fontSize:16}}>{streakBadge?streakBadge.badge:"📅"}</span>
          <div>
            <div style={{fontFamily:F.d,fontSize:13,fontWeight:800,color:C.cinn,lineHeight:1}}>{visibleStreak}-day streak{streakBadge?` · ${streakBadge.title}`:""}</div>
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

// ─── IQ SPARKLINE, last 7 scored games ──────────────────────────────────────
// ─── STREAK + SPARKLINE CARD, collapsible, merged ───────────────────────────
function getStreakNudge(streak,pct,daysLeft,nextBadge,bestIQ,clubName){
  const seed=(getDayNum()+streak)%7;
  const closePool=daysLeft===1?[
    `One more day, ${nextBadge?.title} is yours.`,
    `Tomorrow it's official. Don't break now.`,
    `You're one tile away from glory.`,
  ]:daysLeft<=2?[
    `${nextBadge?.title} is right there. Keep showing up.`,
    `Almost, don't let the tiles cool off now.`,
    `Two days. You've got this.`,
  ]:[];
  const highPctPool=pct>=70?[
    `You're in the home stretch, most players quit before this point.`,
    `Consistency is its own skill. You're proving it.`,
    `${clubName?`${clubName} is watching. `:""}Keep the streak alive.`,
  ]:[];
  const bestIQPool=bestIQ&&bestIQ.score>=80?[
    `Strong score, strong streak, you're playing serious Mahj.`,
    `Your tiles know what they're doing. Keep it up.`,
  ]:bestIQ&&bestIQ.score>=60?[
    `Your game is improving, the streak is how you get there.`,
    `Daily practice is how your rack reads get sharper.`,
  ]:[];
  const generalPool=[
    `Every day you play, your Charleston gets sharper.`,
    `Consistency beats talent. You're building it.`,
    `${clubName?`The ${clubName} leaderboard respects a streak.`:"The leaderboard respects a streak."}`,
    `Most players never make it past ${streak} days. You have.`,
    `Show up tomorrow and the tiles will follow.`,
    `Streaks compound. So does Rackle Score.`,
    `The best players aren't more talented, they just play every day.`,
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

      {/* Header row, always visible, tappable */}
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
            <div style={{fontSize:11,color:C.mut,marginBottom:6}}>You've unlocked every badge, keep the streak alive! 💎</div>
          )}

          {/* Sparkline, only if enough history */}
          {hasSparkline&&(
            <div style={{margin:"10px -14px -12px",background:"#fff",borderTop:`1px solid ${C.bdr}`,padding:"10px 14px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700}}>LAST {scores.length} GAMES</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:9,color:C.mut}}>avg <strong style={{color:C.ink}}>{avg}</strong></span>
                  <span style={{fontSize:9,fontWeight:700,color:trendCol}}>{delta!==0?(delta>0?`+${delta}`:`${delta}`):","}</span>
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
                  {improving?"Trending up, keep the momentum.":"Consistency wins. Keep showing up daily."}
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
    {label:"LIVE",text:"Same rack today. Every player gets one read."},
    {label:"TIP",text:"Jokers can never be passed. Hold them and build around them."},
    {label:"TIP",text:"Flowers appear in most winning hands. Don't throw them away early."},
    {label:"TIP",text:"6s are your most versatile tile, they appear in ~40% of hands."},
    {label:"TIP",text:"1s are the least useful tiles on the 2026 card. Pass them first."},
    {label:"TIP",text:"A blind left pass protects tiles you've committed to. Use it wisely."},
    {label:"TIP",text:"Your Rackle score is built from your read, passes, tile shape, and pace."},
    {label:"TIP",text:"Soap acts as a wild tile in the 2026 section only."},
    {label:"TIP",text:"Free Play is unlimited. Build instincts before the daily resets."},
    {label:"DID YOU KNOW",text:"Rackle scores every pass individually, not just your final rack."},
    {label:"CLUBHOUSE",text:"Your club board resets tonight. Give them a score to chase."},
    {label:"DID YOU KNOW",text:"Your Rackle Coach gives simple tips for the next Charleston."},
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


function getTimeUntilMidnightLabel(){
  const now=new Date(),midnight=new Date();
  midnight.setHours(24,0,0,0);
  const diff=Math.max(0,midnight-now);
  const hh=Math.floor(diff/3600000),mm=Math.floor((diff%3600000)/60000);
  return `${hh}h ${mm.toString().padStart(2,"0")}m`;
}

function TodayRackleHeroCard({dn,onPlay,ds,club,clubPlayers,bestIQ,ydIQ,weekDelta,streak=0}){
  const [reset,setReset]=useState(getTimeUntilMidnightLabel());
  useEffect(()=>{const iv=setInterval(()=>setReset(getTimeUntilMidnightLabel()),30000);return()=>clearInterval(iv);},[]);
  const liveCount=ds?.total||0;
  const topScore=ds?.max||ds?.topScore||ds?.highest||null;
  const currentStreak=Math.max(0,streak||0);
  const tomorrowHints=[
    "Tomorrow rewards cleaner reads.",
    "Tomorrow may split the room.",
    "Pairs could matter tomorrow.",
    "Tomorrow favors flexible passes.",
    "Dragons may be worth watching.",
  ];
  const tomorrowHint=tomorrowHints[dn%tomorrowHints.length];

  const statCards=[
    {label:"live today",value:liveCount||"Open",tone:"gold"},
    topScore?{label:club?"club mark":"score to chase",value:topScore,tone:"white"}:null,
    {label:currentStreak>0?"streak":"starts here",value:currentStreak>0?`${currentStreak}d`:"Day 1",tone:"white"},
  ].filter(Boolean);

  return(
    <button onClick={onPlay} aria-label={`Play Daily Rackle challenge number ${dn}`} className="rk-in rk-daily-hero-card rk-hero-live rk-hero-bright rk-tap-card rk-sweep" style={{
      width:"100%",border:"none",cursor:"pointer",textAlign:"left",borderRadius:22,overflow:"hidden",padding:0,
      background:`linear-gradient(150deg,#041F12 0%,#07331E 42%,#0B4A2C 68%,#03170D 100%)`,
      color:"#fff",boxShadow:"0 18px 50px rgba(3,23,13,0.38),0 0 0 1px rgba(201,168,76,.14)",marginBottom:28,position:"relative"
    }}>
      <div aria-hidden style={{position:"absolute",inset:0,background:"radial-gradient(circle at 76% 18%,rgba(229,204,123,.16),transparent 30%),radial-gradient(circle at 18% 86%,rgba(76,217,135,.08),transparent 32%),linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,0))",pointerEvents:"none"}}/>
      <div aria-hidden style={{position:"absolute",right:-24,top:-28,fontSize:140,opacity:0.042,lineHeight:1,transform:"rotate(12deg)",pointerEvents:"none"}}>🀄</div>
      <div aria-hidden style={{position:"absolute",left:-36,bottom:-30,fontSize:110,opacity:0.032,lineHeight:1,transform:"rotate(-10deg)",pointerEvents:"none"}}>🀄</div>

      <div className="rk-daily-hero-inner" style={{position:"relative",padding:"20px 18px 17px"}}>
        <div className="rk-daily-hero-top" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:16}}>
          <div className="rk-soft-glow" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.13)",border:"1px solid rgba(255,255,255,0.20)",borderRadius:999,padding:"6px 12px",boxShadow:"inset 0 1px 0 rgba(255,255,255,.12)"}}>
            <span className="rk-live-orb" style={{width:9,height:9,borderRadius:99,background:"#4CD987",display:"inline-block",boxShadow:"0 0 10px rgba(76,217,135,.55)"}}/>
            <span style={{fontSize:9,letterSpacing:2,fontWeight:900,color:"rgba(255,255,255,0.84)"}}>DAILY RACKLE · #{dn}</span>
            <span style={{fontSize:7,letterSpacing:1.5,fontWeight:900,color:"#082D1A",background:"#4CD987",borderRadius:999,padding:"3px 6px",lineHeight:1}}>LIVE</span>
          </div>
          <div style={{fontSize:9.5,color:"rgba(255,255,255,0.72)",fontWeight:900}}>new rack in {reset}</div>
        </div>

        <div className="rk-daily-hero-main" style={{display:"flex",alignItems:"center",gap:16}}>
          <div className="rk-daily-hero-copy" style={{flex:1,minWidth:0}}>
            <div className="rk-daily-hero-title" style={{fontFamily:F.d,fontSize:24,fontWeight:900,letterSpacing:-0.75,lineHeight:1.02,marginBottom:11,textShadow:"0 1px 0 rgba(0,0,0,.08)"}}>
              Read the rack.<br/><span style={{color:"#E0C263"}}>Claim the table.</span>
            </div>
            <div className="rk-daily-hero-subcopy" style={{fontSize:11.5,color:"rgba(255,255,255,0.78)",lineHeight:1.55,maxWidth:250}}>
              Same daily Charleston. One score to beat.
            </div>
          </div>

          {/* Premium play button */}
          <div
            className="rk-play-button-premium rk-tap-card rk-sweep"
            aria-hidden="true"
            style={{
              width:78,
              height:78,
              borderRadius:"50%",
              background:"linear-gradient(145deg,#FFFDF8 0%,#F0E7D8 100%)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              boxShadow:"0 16px 34px rgba(0,0,0,0.24), 0 0 0 1px rgba(243,212,107,.20), inset 0 1px 0 rgba(255,255,255,.86), inset 0 -8px 18px rgba(160,120,40,.08)",
              border:"2px solid rgba(26,20,16,.18)",
              cursor:"pointer",
              zIndex:3,
              flexShrink:0,
              transform:"translateY(-8px)",
              transition:"transform .18s ease, box-shadow .18s ease, border-color .18s ease",
              position:"relative",
            }}
          >
            <div
              style={{
                position:"absolute",
                inset:6,
                borderRadius:"50%",
                border:"1px solid rgba(201,168,76,.30)",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,.62)",
                pointerEvents:"none",
              }}
            />
            <div
              className="rk-play-triangle"
              style={{
                width:0,
                height:0,
                borderTop:"13px solid transparent",
                borderBottom:"13px solid transparent",
                borderLeft:"20px solid #1A1410",
                marginLeft:5,
                filter:"drop-shadow(0 1px 0 rgba(255,255,255,.38))",
                position:"relative",
                zIndex:1,
              }}
            />
          </div>
        </div>

        <div className="rk-daily-hero-stats" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginTop:18}}>
          {statCards.map((c,i)=>(
            <div key={i} className="rk-count-live rk-daily-hero-stat" style={{background:"rgba(255,255,255,0.105)",border:"1px solid rgba(255,255,255,0.16)",borderRadius:12,padding:"10px 10px",minHeight:60,boxShadow:"inset 0 1px 0 rgba(255,255,255,.08)"}}>
              <div style={{fontFamily:F.d,fontSize:17,fontWeight:900,color:c.tone==="gold"?"#E0C263":"#fff",lineHeight:1}}>{c.value}</div>
              <div style={{fontSize:7.5,color:"rgba(255,255,255,0.58)",letterSpacing:1.05,fontWeight:800,marginTop:5,textTransform:"uppercase",whiteSpace:"nowrap"}}>{c.label}</div>
            </div>
          ))}
        </div>

        <div className="rk-daily-hero-tomorrow" style={{marginTop:9,background:"linear-gradient(135deg,rgba(201,168,76,0.16),rgba(76,217,135,0.08))",border:"1px solid rgba(224,194,99,0.34)",borderRadius:14,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
              <span style={{width:7,height:7,borderRadius:99,background:"#E0C263",display:"inline-block",flexShrink:0,boxShadow:"0 0 10px rgba(224,194,99,.35)"}}/>
              <div style={{fontSize:8,color:"rgba(255,255,255,0.62)",fontWeight:900,letterSpacing:1.5}}>TOMORROW</div>
            </div>
            <div style={{fontFamily:F.d,fontSize:13.5,fontWeight:900,color:"#fff",lineHeight:1.16,letterSpacing:-0.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tomorrowHint}</div>
          </div>
          <span style={{color:"rgba(255,255,255,.52)",fontSize:16,flexShrink:0}}>›</span>
        </div>
      </div>
    </button>
  );
}

function ClubPulseCard({club,clubPlayers,clubEntries=[],currentScore=0,currentRank=null,setScreen}){
  if(!club)return null;
  const realEntries=Array.isArray(clubEntries)?clubEntries.filter(e=>Number.isFinite(Number(e.iqScore))):[];
  const topEntry=realEntries[0]||null;
  const actualCount=realEntries.length;
  const lines=[
    `${actualCount||1} ${(actualCount||1)===1?"club player has":"club players have"} posted today`,
    topEntry?`${topEntry.name||"Club leader"} is setting the pace with ${topEntry.iqScore}`:(currentScore?`Your ${currentScore} is on the club board.`:"Your club board is waiting for the first score."),
    currentRank===1?"You're the score your club is chasing.":currentRank?`You're #${currentRank} in your club today.`:"Post your Daily to enter the club race.",
  ];
  return(
    <div style={{background:"#fff",border:`1px solid ${C.jade}18`,borderRadius:14,padding:14,marginBottom:10,boxShadow:"0 2px 12px rgba(0,0,0,0.03)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10}}>
        <div>
          <div style={{fontSize:8,color:C.jade,letterSpacing:2,fontWeight:900,marginBottom:3}}>TODAY AT YOUR CLUB</div>
          <div style={{fontFamily:F.d,fontSize:17,fontWeight:900,color:C.ink,lineHeight:1.15}}>{club.name}</div>
        </div>
        <button onClick={()=>setScreen("leaderboard")} style={{background:C.jade+"10",border:`1px solid ${C.jade}25`,borderRadius:999,padding:"7px 11px",fontSize:10,fontWeight:800,color:C.jade,cursor:"pointer"}}>View ranks</button>
      </div>
      <div style={{display:"grid",gap:7}}>
        {lines.map((line,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:i===0?C.jade:C.mut,lineHeight:1.35}}>
            <span style={{width:18,height:18,borderRadius:9,background:i===0?C.jade+"14":C.bg2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>{["●","↗","🏆"][i]}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TomorrowPreviewCard(){
  const [timeLeft,setTimeLeft]=useState({hh:"00",mm:"00",ss:"00",urgent:false});
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    const tick=()=>{
      const now=new Date();
      const midnight=new Date();
      midnight.setHours(24,0,0,0);
      const diff=Math.max(0,midnight-now);
      const hh=Math.floor(diff/3600000);
      const mm=Math.floor((diff%3600000)/60000);
      const ss=Math.floor((diff%60000)/1000);
      const pad=n=>n.toString().padStart(2,"0");
      setTimeLeft({hh:pad(hh),mm:pad(mm),ss:pad(ss),urgent:hh<2});
    };
    tick();
    const iv=setInterval(tick,1000);
    return()=>clearInterval(iv);
  },[]);

  const tomorrowSeed=()=>{
    const d=new Date();
    d.setDate(d.getDate()+1);
    return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  };

  const getTomorrowHint=()=>{
    const rack=seededShuffle(buildDeck(),tomorrowSeed()).slice(0,14);
    const jokers=rack.filter(t=>t.t==="j").length;
    const flowers=rack.filter(t=>t.t==="f").length;
    const honors=rack.filter(t=>t.t==="w"||t.t==="d").length;
    const evens=rack.filter(t=>t.t==="s"&&t.n%2===0).length;
    const odds=rack.filter(t=>t.t==="s"&&t.n%2===1).length;
    const sixes=rack.filter(t=>t.t==="s"&&t.n===6).length;
    const counts={};
    rack.forEach(t=>{
      const key=t.t==="s"?`${t.s}-${t.n}`:t.t==="w"?`w-${t.v}`:t.t==="d"?`d-${t.v}`:t.t;
      counts[key]=(counts[key]||0)+1;
    });
    const pairs=Object.values(counts).filter(v=>v>=2).length;

    if(jokers>=2)return "Jokers may make tomorrow interesting.";
    if(flowers>=3)return "Flowers may be worth watching tomorrow.";
    if(sixes>=2)return "Sixes may matter more than usual.";
    if(honors>=5)return "Honors may pull the rack tomorrow.";
    if(pairs>=3)return "Pairs may tell the story tomorrow.";
    if(evens>=6)return "Even tiles may get the first look.";
    if(odds>=6)return "Odd tiles may get the first look.";
    return "Tomorrow may reward a flexible first pass.";
  };

  const urgency=timeLeft.urgent;
  const compactTime=`${timeLeft.hh}:${timeLeft.mm}:${timeLeft.ss}`;
  const hint=getTomorrowHint();
  const headline=urgency?"Last call before the next rack.":"Tomorrow’s rack is already waiting.";
  const subline=urgency
    ?"One more look before the club board resets."
    :"Come back tomorrow and see where your club lands.";

  return(
    <div className="rk-in" style={{background:`linear-gradient(145deg,#fff,${C.jade}06 62%,${C.gold}08)`,border:`1px solid ${urgency?C.cinn+"24":C.jade+"1E"}`,borderRadius:17,marginBottom:18,boxShadow:"0 4px 18px rgba(0,0,0,0.035)",position:"relative",overflow:"hidden"}}>
      <div aria-hidden style={{position:"absolute",right:-14,bottom:-18,fontSize:70,opacity:0.04,lineHeight:1}}>🀄</div>
      <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} style={{width:"100%",background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:"14px 14px 13px",display:"flex",alignItems:"center",gap:12,position:"relative"}}>
        <div style={{width:38,height:38,borderRadius:13,background:urgency?C.cinn+"0D":C.jade+"0D",border:`1px solid ${urgency?C.cinn+"20":C.jade+"20"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.d,fontSize:18,fontWeight:900,color:urgency?C.cinn:C.jade,flexShrink:0}}>✦</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:8,color:urgency?C.cinn:C.jade,letterSpacing:1.7,fontWeight:900,marginBottom:4}}>TOMORROW'S RACKLE</div>
          <div style={{fontFamily:F.d,fontSize:14,fontWeight:900,color:C.ink,lineHeight:1.12,letterSpacing:-0.22,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{headline}</div>
          <div style={{fontSize:11,color:C.mut,lineHeight:1.4}}>{String(hint).replace(/^Hint:\s*/i,"")}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:999,background:open?C.jade+"12":"transparent",flexShrink:0}}>
          <div style={{fontSize:16,color:C.jade,fontWeight:900,lineHeight:1,transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.18s ease"}}>›</div>
        </div>
      </button>

      {open&&<div className="rk-in" style={{position:"relative",padding:"0 14px 14px"}}>
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.bdr},transparent)`,marginBottom:12}}/>
        <div style={{fontSize:12,color:C.ink,lineHeight:1.45,fontWeight:750,marginBottom:10,textAlign:"center"}}>{subline}</div>
        <div style={{background:`linear-gradient(145deg,${C.jade}0B,#fff)`,border:`1px solid ${urgency?C.cinn+"1A":C.jade+"16"}`,borderRadius:14,padding:"10px",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.8)",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
            <div style={{fontSize:8,color:urgency?C.cinn:C.jade,letterSpacing:1.4,fontWeight:900}}>NEW RACK IN</div>
            
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,width:"100%"}}>
            {[{v:timeLeft.hh,l:"hrs"},{v:timeLeft.mm,l:"min"},{v:timeLeft.ss,l:"sec"}].map((part)=>(
              <div key={part.l} style={{textAlign:"center",background:"rgba(255,255,255,0.72)",border:`1px solid ${urgency?C.cinn+"16":C.jade+"14"}`,borderRadius:12,padding:"8px 4px 7px",minWidth:0}}>
                <div style={{fontFamily:F.d,fontSize:25,fontWeight:900,color:urgency?C.cinn:C.jade,lineHeight:1,letterSpacing:-0.8}}>{part.v}</div>
                <div style={{fontSize:7,color:C.mut,letterSpacing:1.1,fontWeight:800,marginTop:4,textTransform:"uppercase"}}>{part.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:C.gold+"0D",border:`1px solid ${C.gold}18`,borderRadius:13,padding:"9px 10px"}}>
          <span style={{fontSize:13,flexShrink:0}}>👀</span>
          <span style={{fontSize:11,color:C.ink,lineHeight:1.45,fontWeight:650}}>Tomorrow watch: {hint}</span>
        </div>
      </div>}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({streak,rounds,dDone,dRes,showHelp,setShowHelp,go,showStats,showSettings,showTutorial,showCardGuide,settings,showScorecard,setScreen}){
  const dn=getDayNum(),yd=getYesterday();
  const iq=withIQStyle(dRes?.iq);
  const bestIQ=getBestIQ();
  const profile=getProfile();
  // Single source for club membership. Some returning users have clubCode in local storage,
  // while older profiles only have it on the profile object. getClubCode() normalizes both.
  const activeClubCode=getClubCode();
  const club=activeClubCode?CLUBS[activeClubCode]:null;
  const nudge=shouldShowNudge(dDone);
  const [nudgeDismissed,setNudgeDismissed]=useState(ST.get("nudgeDismissed",null)===getDailySeed());
  const [leOpen,setLeOpen]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [shareCopied,setShareCopied]=useState(false);
  const [clubSharesToday,setClubSharesToday]=useState(0);
  const [clubPlayers,setClubPlayers]=useState(null);
  const [homeClubEntries,setHomeClubEntries]=useState([]);
  const [ds,setDs]=useState(null);
  const dismissNudge=()=>{ST.set("nudgeDismissed",getDailySeed());setNudgeDismissed(true);};

  useEffect(()=>{
    fetchDailyStats().then(s=>{if(s&&s.total>=1)setDs(s);});
    const code=activeClubCode||getClubCode();
    if(code){
      fetchLBEntries(code).then(rows=>{
        if(rows){
          setHomeClubEntries(rows);
          if(rows.length>0)setClubPlayers(rows.length);
        }
      });
      fetchClubShareCount(code).then(count=>setClubSharesToday(count||0));
    }
  },[activeClubCode]);

  const ydIQ=yd?.iq?.totalScore||null;
  const todayPlayers=Math.max(ds?.total||0,0);
  const topToday=Math.max(ds?.topScore||ds?.max||0,iq?.totalScore||0);
  const bestScore=Number.isFinite(Number(bestIQ?.score ?? bestIQ))?Number(bestIQ?.score ?? bestIQ):0;
  const currentScore=Number.isFinite(Number(iq?.totalScore))?Number(iq.totalScore):0;
  const currentName=rkCurrentDisplayName();
  const hasClubScore=!!(club&&dDone&&currentScore>0);
  const displayHomeClubEntries=club
    ?rkMergeCurrentScore(homeClubEntries,currentScore,iq?.totalTime||dRes?.time||0,streak,activeClubCode)
    :[];
  const shownClubRank=hasClubScore?rkRankOfCurrent(displayHomeClubEntries,currentScore):null;
  const homeClubTotal=club?displayHomeClubEntries.length:null;
  const liveClubPlayedToday=club?(homeClubTotal||0):0;
  const liveClubSharesToday=club?Math.max(clubSharesToday||0,getLocalClubShareCount(activeClubCode)):0;
  const clubActivityText=club
    ?(liveClubSharesToday>0
      ?`${liveClubPlayedToday||1} played · ${liveClubSharesToday} shared`
      :pluralizeClubMembers(liveClubPlayedToday,"played"))
    :"Invite your club today";
  const clubAvatarCount=club?Math.min(3,Math.max(liveClubPlayedToday||liveClubSharesToday||1,1)):1;
  const pb=Math.max(bestScore,currentScore,100);
  const firstName=profile?.nickname?profile.nickname.split(" ")[0]:"";
  const streakMessages=[
    "Your club is chasing.",
    "The table is watching.",
    club?`${club.name} is coming for your rank.`:"Apex is coming for your rank.",
    "Don't lose the room tomorrow.",
    "Your streak is becoming dangerous.",
    "Keep climbing before someone catches you.",
    "The leaderboard is tightening.",
    "You're becoming hard to beat.",
  ];
  const streakMood=streakMessages[(dn+Math.max(streak,0))%streakMessages.length];
  const streakTitle=streak>1?`${streak}-day streak${firstName?`, ${firstName}`:""}. ${streakMood}`:streak===1?"Tomorrow’s rack is already waiting.":"Start your streak with today's Rackle.";
  const streakSub=streak>1?"Come back before the table catches you.":streak===1?"Come back and climb your club board.":"One daily read. One score to chase.";

  const tomorrowHints=[
    "Tomorrow favors disciplined passes.",
    "Concealed players may thrive tomorrow.",
    "Tomorrow rewards patient Charleston play.",
    "Dragons could matter more than expected.",
    "Greedy passes may get punished tomorrow.",
    "Pairs may matter more than they look.",
    "Tomorrow rewards cleaner reads.",
    "Fast commits may struggle tomorrow.",
  ];
  const tomorrowHint=tomorrowHints[dn%tomorrowHints.length];
  const socialPresenceFeed=[
    `${todayPlayers} players finished today`,
    club&&shownClubRank&&shownClubRank>1?`${shownClubRank-1} ${club.name} players are ahead of you`:null,
    topToday?`${topToday} leads the table`:null,
    "Someone just posted a strong read",
    "Most players missed one pivot today",
    club?`${club.name} is active today`:"The club board is active today",
  ].filter(Boolean);
  const socialPresenceLine=club?`${club.name} is active today`:socialPresenceFeed[dn%socialPresenceFeed.length];
  const hasPlayedBefore=(getHist().length>0)||rounds>0||dDone||streak>0;
  const isFirstTime=!hasPlayedBefore;

  const levelLine=iq?.totalScore>=90?"Elite read. Your club will notice.":iq?.totalScore>=80?"Strong read. Make them chase it.":iq?.totalScore>=70?"Solid read. One better pass moves you up.":iq?.totalScore>=60?"You're warming up. The next rack is where it clicks.":"Tough rack. Come back sharper tomorrow.";
  const brightScoreColor="#F3D46B";
  const goGlobalRank=(e)=>{
    e?.stopPropagation?.();
    setScreen("home");
    setTimeout(()=>document.getElementById("global-leaderboard")?.scrollIntoView({behavior:"smooth",block:"center"}),60);
  };
  const goClubRank=(e)=>{
    e?.stopPropagation?.();
    setScreen(getClubCode()?"leaderboard":"clubs");
  };

  const copyShare=async()=>{
    const passEmoji=(iq?.passInsights||[]).map(p=>p.quality==="strong"?"🟢":p.quality==="weak"?"🔴":"🟡").join("");
    const myName=(currentName||"I").trim();
    const scoreLine=iq?`${myName} scored ${iq.totalScore}`:dRes?`${myName} played today's Rackle`:"I played today's Rackle";
    const clubLine=club?`${club.name} · beat me before midnight`:"Can you beat me before midnight?";
    const text=[`🀄 Rackle #${dn}`,scoreLine,iq?`${iq.level}`:"",clubLine,"playrackle.com"].filter(Boolean).join("\n");
    const markShared=async()=>{
      if(!activeClubCode)return;
      const count=await recordClubShare(activeClubCode,currentName);
      setClubSharesToday(count||1);
    };
    try{
      if(navigator.share){await navigator.share({title:`Daily Rackle #${dn}`,text});}
      else{await navigator.clipboard.writeText(text);}
      await markShared();
      setShareCopied(true);setTimeout(()=>setShareCopied(false),1600);
    }catch(e){
      try{
        await navigator.clipboard.writeText(text);
        await markShared();
        setShareCopied(true);setTimeout(()=>setShareCopied(false),1600);
      }catch{}
    }
  };

  const MiniStat=({value,label,accent})=>{
    const safeValue=(typeof value==="number"&&!Number.isFinite(value))?",":(value==="NaN"||value==null?",":value);
    return(
      <div className="rk-gilt-rank-card" style={{flex:1,minWidth:0,border:`1px solid rgba(243,212,107,.42)`,background:"rgba(255,255,255,0.105)",borderRadius:15,padding:"12px 12px",backdropFilter:"blur(8px)"}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:accent||"#F3D46B",lineHeight:1,letterSpacing:-0.8}}>{safeValue}</div>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.68)",letterSpacing:2,fontWeight:900,marginTop:6}}>{label}</div>
      </div>
    );
  };

  const Menu=()=>{
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,marginBottom:2,position:"relative"}}>
        {streak>0?(
          <button onClick={()=>setScreen("profile")} aria-label="View streak" style={{display:"inline-flex",alignItems:"center",gap:6,border:`1px solid ${C.gold}30`,background:`linear-gradient(135deg,#FFF9EA,${C.cinn}08)`,color:C.cinn,borderRadius:999,padding:"5px 9px 5px 7px",fontSize:11,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 14px ${C.cinn}10`,minHeight:30}}>
            <span style={{width:19,height:19,borderRadius:99,display:"inline-flex",alignItems:"center",justifyContent:"center",background:C.cinn+"12",fontSize:10,lineHeight:1}}>🔥</span>
            <span style={{fontFamily:F.d,fontSize:12,fontWeight:900,lineHeight:1}}>{streak}d</span>
            <span style={{fontSize:9,fontWeight:900,letterSpacing:0.5,textTransform:"uppercase",opacity:0.72}}>streak</span>
            <span style={{fontSize:9,color:C.gold,marginLeft:1}}>›</span>
          </button>
        ):<div/>}
        <button onClick={()=>setMenuOpen(o=>!o)} aria-label="Menu" style={{width:42,height:42,background:menuOpen?"linear-gradient(180deg,#F2EBDD,#E9E0CF)":"rgba(23,107,66,.06)",border:`1px solid ${menuOpen?C.bdr:"rgba(23,107,66,.10)"}`,borderRadius:15,cursor:"pointer",display:"flex",flexDirection:"column",gap:4,alignItems:"center",justifyContent:"center",boxShadow:"inset 0 1px 0 rgba(255,255,255,.66),0 4px 14px rgba(26,20,16,.035)"}}>
          <span style={{display:"block",width:17,height:1.7,background:C.ink,borderRadius:2}}/>
          <span style={{display:"block",width:17,height:1.7,background:C.ink,borderRadius:2}}/>
          <span style={{display:"block",width:17,height:1.7,background:C.ink,borderRadius:2}}/>
        </button>
        <PremiumClubMenu open={menuOpen} onClose={()=>setMenuOpen(false)} setScreen={setScreen} go={go} showSettings={showSettings} streak={streak} dRes={dRes}/>
      </div>
    );
  };

  const Hero=()=>{
    const headline=dDone?["You played today.","Share it with your club."]:isFirstTime?["Play one Charleston.","Get your score. Share it with your club."]:["Play one Charleston.","Beat your club today."];
    return(
      <div className="rk-startup-hero">
        <div className="rk-float rk-hero-tile" style={{fontSize:28,marginBottom:7,lineHeight:1}}>🀄</div>
        <h1 className="rk-startup-logo">Rackle</h1>
        <p className="rk-startup-subtitle">The Daily Mahjong Workout</p>
        <p className="rk-startup-line">{headline[0]}<strong>{headline[1]}</strong></p>
      </div>
    );
  };

  const TodayRackPreview=()=>{
    const posted=Number(todayPlayers||0);
    return(
      <div className="rk-rack-preview-card" aria-label="Today's rack preview">
        <div className="rk-preview-tiles" aria-hidden="true">
          {Array.from({length:8}).map((_,i)=><span key={i} className="rk-preview-tile" />)}
        </div>
        <div className="rk-preview-copy"><b>Play to reveal today’s rack</b><br/>{posted||2} {(posted||2)===1?"player has":"players already"} posted</div>
      </div>
    );
  };

  const StartDaily=()=> (
    <div>
      <button onClick={()=>go("daily")} className="rk-primary-daily-card" aria-label={`Play Daily Rackle number ${dn}`}>
        <div>
          <div className="rk-primary-daily-top">
            <span className="rk-primary-daily-pill"><span className="rk-live-dot-dynamic"/> Daily Rackle · #{dn}</span>
          </div>
          <h2 className="rk-primary-daily-title">Today’s Rackle<br/><span>Play now.</span></h2>
          <p className="rk-primary-daily-copy">Same rack. Every player. One daily score.</p>
        </div>
        <span className="rk-primary-daily-play" aria-hidden="true" />
      </button>
      <TodayRackPreview/>
    </div>
  );

  const CompletedDaily=()=> (
    <div className="rk-home-section-lg" style={{borderRadius:24,overflow:"hidden",marginBottom:24,background:"#fff",boxShadow:"0 10px 32px rgba(0,0,0,0.08)",border:`1px solid ${C.bdr}`}}>
      <div className="rk-streak-card" style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10,background:"linear-gradient(180deg,#FFFDF8 0%,#F7F1E7 100%)",borderBottom:`1px solid ${C.jade}10`}}>
        <div style={{width:31,height:31,borderRadius:11,background:C.gold+"16",border:`1px solid ${C.gold}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🔥</div>
        <div className="rk-streak-copy" style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:900,color:C.ink,lineHeight:1.25,letterSpacing:-0.1}}>{streakTitle}</div>
          <div style={{fontSize:10.5,color:C.jade,marginTop:2,lineHeight:1.3,fontStyle:"italic",fontWeight:750}}>{streakSub}</div>
        </div>
      </div>
      <div role="button" tabIndex={0} onClick={showScorecard} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" ")showScorecard();}} style={{width:"100%",border:"none",background:`linear-gradient(150deg,${C.hero1},${C.hero2} 58%,${C.hero3})`,cursor:"pointer",padding:"30px 20px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div aria-hidden style={{position:"absolute",right:-12,bottom:-20,fontSize:116,opacity:0.04}}>🀄</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:3.5,fontWeight:900,marginBottom:12}}>DAILY RACKLE · #{dn}</div>
        <div className="rk-pop" style={{fontFamily:F.d,fontSize:76,fontWeight:900,color:brightScoreColor,letterSpacing:-3.6,lineHeight:0.92}}>{iq?.totalScore||dRes?.rating||"✓"}</div>
        <div style={{width:56,height:2,background:`linear-gradient(90deg,transparent,${brightScoreColor},transparent)`,margin:"18px auto 16px",borderRadius:2}}/>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:900,color:"#fff",lineHeight:1.08,marginBottom:iq?.styleName?14:12}}>{iq?.level||"Daily complete"}</div>
        {iq?.styleName&&<div style={{display:"inline-flex",alignItems:"center",gap:5,border:`1px solid ${brightScoreColor}66`,background:"rgba(255,255,255,.08)",borderRadius:999,padding:"7px 14px",fontSize:11,fontWeight:900,color:"#EED89B",backdropFilter:"blur(10px)",marginBottom:16}}>{iq.styleName}</div>}
        <div style={{fontSize:13,color:"rgba(255,255,255,0.76)",lineHeight:1.5,maxWidth:280,margin:"0 auto"}}>{levelLine}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:24,textAlign:"left"}}>
          <button onClick={goGlobalRank} style={{border:"none",padding:0,background:"transparent",cursor:"pointer",textAlign:"left"}} aria-label="View global leaderboard">
            <MiniStat value={`#${Math.min(todayPlayers,Math.max(1,todayPlayers-1))}`} label="GLOBAL RANK" accent={brightScoreColor}/>
          </button>
          <button onClick={goClubRank} style={{border:"none",padding:0,background:"transparent",cursor:"pointer",textAlign:"left"}} aria-label={club?"View club leaderboard":"Browse club directory"}>
            <MiniStat value={club?(shownClubRank?`#${shownClubRank}`:(hasClubScore?"live":"club")):"join"} label="CLUB RANK" accent={shownClubRank===1?brightScoreColor:undefined}/>
          </button>
        </div>
      </div>
      <div style={{padding:16,display:"grid",gap:12}}>
        <button onClick={copyShare} className={`rk-share-card ${shareCopied?"rk-copied-state":""}`} style={{width:"100%",border:`1px solid ${C.gold}25`,background:`linear-gradient(135deg,#FFF9ED,#F7EFE0)`,borderRadius:14,padding:"14px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",boxShadow:"0 4px 14px rgba(0,0,0,.025)"}}>
          <div className="rk-share-icon" style={{width:48,height:48,borderRadius:14,background:C.gold+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📲</div>
          <div style={{flex:1}}><div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,lineHeight:1.1,letterSpacing:-0.2}}>{shareCopied?"Copied for your club":"Challenge Your Club"}</div><div style={{fontSize:11,color:C.mut,marginTop:3}}>{shareCopied?"Drop it in your group chat":"Tap to copy · Drop it in your group chat"}</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>{clubAvatarCount>0&&<span className="rk-mini-avatars">{Array.from({length:clubAvatarCount}).map((_,i)=><span key={i} className="rk-mini-avatar" style={i%2?{background:C.jade+"44"}:undefined}/>)}</span>}<span style={{fontSize:10.5,color:C.mut,fontWeight:700}}>{clubActivityText}</span></div></div>
          <span style={{fontSize:18,color:C.gold}}>›</span>
        </button>
        <button onClick={showScorecard} className="rk-home-improve-card" style={{width:"100%",borderRadius:14,padding:"13px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",position:"relative"}}>
          <div className="rk-home-improve-icon" style={{width:39,height:39,borderRadius:12,background:C.jade+"13",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎓</div>
          <div style={{flex:1,position:"relative",zIndex:1}}><div style={{fontFamily:F.d,fontSize:15,fontWeight:950,color:C.ink,lineHeight:1.1,letterSpacing:-0.2}}>Improve Your Game</div><div style={{fontSize:11,color:C.mut,marginTop:3}}>Coach view · Better reads · Next rack</div></div>
          <span style={{fontSize:18,color:C.gold,position:"relative",zIndex:1}}>›</span>
        </button>
      </div>
    </div>
  );

  const TomorrowTease=()=> {
    const resetLabel=getTimeUntilMidnightLabel();
    return(
      <div aria-label="Tomorrow's Rackle preview" className="rk-home-section" style={{width:"100%",margin:"0 0 18px",border:`1px solid rgba(0,0,0,.06)`,background:"linear-gradient(180deg,#FFFDF8 0%,#F6F1E7 100%)",borderRadius:18,padding:"17px 18px",display:"flex",alignItems:"center",gap:14,cursor:"default",textAlign:"left",boxShadow:"0 4px 16px rgba(0,0,0,0.026)",position:"relative",overflow:"hidden"}}>
        <div aria-hidden style={{position:"absolute",right:-10,bottom:-18,fontSize:72,opacity:0.035,lineHeight:1}}>🀄</div>
        <div style={{width:42,height:42,borderRadius:14,background:C.jade+"10",border:`1px solid ${C.jade}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✦</div>
        <div style={{flex:1,minWidth:0,position:"relative"}}>
          <div style={{fontSize:9,color:C.jade,letterSpacing:2.1,fontWeight:900,marginBottom:5}}>TOMORROW'S RACKLE</div>
          <div style={{fontFamily:F.d,fontSize:17,fontWeight:900,color:C.ink,lineHeight:1.1,letterSpacing:-0.2,marginBottom:5}}>New rack in {resetLabel}</div>
          <div style={{fontSize:12,color:C.mut,lineHeight:1.45}}>{String(tomorrowHint).replace(/^Hint:\s*/i,"")}</div>
        </div>
      </div>
    );
  };


  const SocialPresence=()=> (
    <div className="rk-social-presence-wrap" style={{display:"flex",justifyContent:"center",margin:"6px 0 24px"}}>
      <div className="rk-live-pill-dynamic rk-club-active-pill">
        <span className="rk-live-dot-dynamic"/>
        <span>{socialPresenceLine}</span>
      </div>
    </div>
  );

  const PracticeCard=()=> (
    <div className="rk-home-split" aria-label="Play options">
      <button onClick={()=>go(dDone?"free":"daily")} className="rk-home-action-card">
        <span style={{fontSize:20}}>🀄</span>
        <strong>{dDone?"Replay a rack":"Play the Daily"}</strong>
        <span>{dDone?"New deal. Sharpen one read.":"One Charleston. One score."}</span>
      </button>
      <button onClick={()=>go("free")} className="rk-home-action-card">
        <span style={{fontSize:20}}>🎓</span>
        <strong>Practice Mode</strong>
        <span>Unlimited racks. No pressure.</span>
      </button>
    </div>
  );

  const ActivityStrip=()=>{
    const items=[
      currentScore?`${currentName} posted ${currentScore}`:null,
      `${todayPlayers||2} players played today`,
      club?`${club.name} is live`:"Club rooms are live",
      "Board resets tonight",
    ].filter(Boolean);
    return <div className="rk-activity-strip"><span className="rk-activity-dot"/>{items[dn%items.length]}</div>;
  };

  const SharePreview=()=>{
    const score=currentScore||topToday||78;
    const globalRank=currentScore?`#${Math.max(1,rkRankOfCurrent([],currentScore)||1)}`:"#1";
    const clubRank=shownClubRank?`#${shownClubRank}`:(club?"#1":"Join a club");
    return(
      <section className="rk-share-preview-card" aria-label="Share your score preview">
        <div>
          <h2 className="rk-share-preview-title">Make the group chat talk.</h2>
          <p className="rk-share-preview-copy">Post your score, defend your rank, and make your table chase.</p>
          <button onClick={copyShare} className="rk-room-btn rk-room-btn-primary" style={{width:"100%"}}>{shareCopied?"Copied":"Copy share card"}</button>
        </div>
        <div className="rk-share-artifact">
          <strong>Rackle #{dn}</strong>
          <span>Score: {score}</span>
          <span>Global: {globalRank}</span>
          <span>Club: {clubRank}</span>
          <div className="rk-share-grid">🀄🟩🟩🟨⬜</div>
        </div>
      </section>
    );
  };

  const HowItWorks=()=> (
    <section aria-label="How Rackle works">
      <div className="rk-learn-simple-title">How it works</div>
      <div className="rk-how-strip">
        <div className="rk-how-card"><span style={{fontSize:20}}>🀄</span><b>Play the rack</b><span>Read the Charleston.</span></div>
        <div className="rk-how-card"><span style={{fontSize:20}}>🏆</span><b>Get your score</b><span>See how clean your passes were.</span></div>
        <div className="rk-how-card"><span style={{fontSize:20}}>🏛️</span><b>Climb your club</b><span>Compare with your mahjong group.</span></div>
      </div>
    </section>
  );





  const DesktopInsightDeck=()=>{
    const todayScore=iq?.totalScore||"—";
    const hist=getHist().filter(e=>e.iqScore!=null);
    const dailyAvgRows=hist.filter(e=>e.mode==="daily").slice(-7);
    const practiceAvgRows=hist.filter(e=>e.mode!=="daily").slice(-7);
    const avgDaily=dailyAvgRows.length?Math.round(dailyAvgRows.reduce((a,e)=>a+e.iqScore,0)/dailyAvgRows.length):"—";
    const avgPractice=practiceAvgRows.length?Math.round(practiceAvgRows.reduce((a,e)=>a+e.iqScore,0)/practiceAvgRows.length):"—";
    return(
      <div className="rk-desktop-only rk-home-desktop-panel">
        <div className="rk-web-data-card">
          <div className="rk-web-data-kicker">Daily read</div>
          <h3 className="rk-web-data-title">Today’s table pressure</h3>
          <p className="rk-web-data-copy">Same Charleston for every player. Your read, rank, and score become the room’s benchmark.</p>
          <div className="rk-web-metric-row" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}>
            <div className="rk-web-metric"><strong>{todayScore}</strong><span>Your IQ</span></div>
            <div className="rk-web-metric"><strong>{topToday}</strong><span>Lead score</span></div>
          </div>
        </div>
        <div className="rk-web-data-card">
          <div className="rk-web-data-kicker">Practice room</div>
          <h3 className="rk-web-data-title">Build the next read</h3>
          <p className="rk-web-data-copy">Free Play lets you test sections, replay the Charleston, and learn without risking the Daily board.</p>
          <div className="rk-web-metric-row" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}>
            <div className="rk-web-metric"><strong>{avgDaily}</strong><span>Daily avg</span></div>
            <div className="rk-web-metric"><strong>{avgPractice}</strong><span>Practice avg</span></div>
          </div>
        </div>
        <div className="rk-web-data-card rk-home-desktop-wide">
          <div className="rk-web-data-kicker">Rackle intelligence</div>
          <h3 className="rk-web-data-title">Track the signals that make better Charleston players.</h3>
          <p className="rk-web-data-copy">Rackle turns each rack into a simple coaching loop: section direction, passing quality, tile strength, timing, and club rank.</p>
          <div className="rk-web-metric-row">
            <div className="rk-web-metric"><strong>{todayPlayers}</strong><span>Players live</span></div>
            <div className="rk-web-metric"><strong>{shownClubRank?`#${shownClubRank}`:"—"}</strong><span>Club rank</span></div>
            <div className="rk-web-metric"><strong>{streak||0}d</strong><span>Streak</span></div>
            <div className="rk-web-metric"><strong>{bestScore||"—"}</strong><span>Best IQ</span></div>
          </div>
        </div>
      </div>
    );
  };

  const Community=()=> {
    const clubhouseName=activeClubCode?((club&&club.name)||(CLUBS[activeClubCode]?.name)||"Your club"):"Join your club";
    const globalCount=Number(todayPlayers||0);
    const clubCount=Number(clubPlayers||displayHomeClubEntries?.length||0);
    const leadLabel=topToday&&topToday!=="—"?topToday:"—";
    const openGlobal=()=>setScreen("globalLeaderboard");
    const openClub=()=>activeClubCode?setScreen("leaderboard"):setScreen("clubs");
    return(
      <section className="rk-rooms-card" aria-label="Today's rooms">
        <div className="rk-rooms-head">
          <div>
            <div className="rk-rooms-kicker"><span className="rk-live-dot-dynamic"/> Today’s Rooms</div>
            <h2 className="rk-rooms-title">See who owns today’s rack.</h2>
            <p className="rk-rooms-copy">Check the board before it resets.</p>
          </div>
        </div>
        <div className="rk-rooms-grid">
          <div className="rk-room-mini"><strong>{globalCount||2}</strong><span>Global room</span></div>
          <div className="rk-room-mini"><strong>{activeClubCode?(clubCount||1):"Join"}</strong><span>{activeClubCode?clubhouseName:"Club room"}</span></div>
          <div className="rk-room-mini gold"><strong>{leadLabel||78}</strong><span>Score to beat</span></div>
        </div>
        <div className="rk-rooms-actions">
          <button onClick={openGlobal}>Open Global Room</button>
          <button onClick={openClub}>{activeClubCode?"Open Club Room":"Find Your Club"}</button>
        </div>
        {!activeClubCode&&(
          <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(26,20,16,.07)",display:"grid",gap:9}}>
            <div style={{fontSize:12,color:C.mut,lineHeight:1.45,fontWeight:750}}>Create a private board for your mahjong group.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <a href="mailto:hello@playrackle.com?subject=Start%20my%20Rackle%20club%20leaderboard&body=Club%20name%3A%20%0ALocation%3A%20%0AApprox%20members%3A%20" className="rk-room-btn rk-room-btn-primary" style={{textAlign:"center",textDecoration:"none"}}>Start my club</a>
              <button onClick={()=>setScreen("clubs")} className="rk-room-btn">Join</button>
            </div>
          </div>
        )}
      </section>
    );
  };

  const Learn=()=> (
    <section className="rk-learn-shell">
      <div className="rk-learn-simple-title">Improve your next read</div>
      <div className="rk-learn-simple-grid">
        {[
          ["📖","How to Play","Quick rules and Charleston basics",()=>setScreen("howto")],
          ["📋","2026 Hand Browser","Scan hands by section",()=>setScreen("handbrowser")],
          ["🎓","Practice Mode","Try unlimited racks",()=>go("free")],
        ].map(([icon,title,sub,fn])=>(
          <button key={title} className="rk-learn-item" onClick={fn}>
            <span className="rk-learn-icon-simple">{icon}</span>
            <span style={{flex:1,minWidth:0}}><span className="rk-learn-item-title">{title}</span><span className="rk-learn-item-sub">{sub}</span></span>
            <span className="rk-learn-arrow-simple">›</span>
          </button>
        ))}
      </div>
    </section>
  );



  return(
    <>
      <div style={{...S.pg,padding:"0 18px 56px"}} className="rk-pg">
        {nudge&&!nudgeDismissed&&!dDone&&(
          <div className="rk-in" style={{display:"flex",alignItems:"center",gap:11,background:`linear-gradient(135deg,${C.jade}12,${C.jade}06)`,border:`1px solid ${C.jade}24`,borderRadius:18,padding:"12px 14px",marginBottom:8,marginTop:10}}>
            <span style={{fontSize:20,flexShrink:0}}>⏰</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:900,color:C.jade,fontFamily:F.d}}>Don't miss today's Daily</div><div style={{fontSize:11,color:C.mut,marginTop:2}}>Same rack. Every player. Your club board is still moving.</div></div>
            <button onClick={dismissNudge} style={{background:"none",border:"none",color:C.mut,fontSize:16,cursor:"pointer",padding:"2px 4px",lineHeight:1}}>✕</button>
          </div>
        )}
        <Menu/>
        <Hero/>
        <div className="rk-home-landing-flow">
          <ActivityStrip/>
          {!dDone&&<StartDaily/>}
          {dDone&&<CompletedDaily/>}
          {dDone&&<TomorrowTease/>}
          <PracticeCard/>
          <Community/>
          <SharePreview/>
          <HowItWorks/>
          <Learn/>
          <EmailSignup/>
          <div className="rk-home-desktop-insights"><DesktopInsightDeck/></div>
        </div>
        <Footer/>
      </div>
    </>
  );
}

function Pill({i,v,l,hl}){return(<div style={{...S.pill,flex:1,background:hl?"#FFF5F0":C.bg2}} aria-label={`${l}: ${v}`}><span aria-hidden="true" style={{fontSize:12}}>{i}</span><div><div style={{fontSize:15,fontFamily:F.d,fontWeight:800,color:hl?C.cinn:C.ink}}>{v}</div><div style={{fontSize:7,color:C.mut,letterSpacing:1.5,fontWeight:700}}>{l}</div></div></div>);}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats({home,onShowScorecard,onRecap,dRes,setScreen}){
  const [spOpen,setSpOpen]=useState(true);
  const [ckOpen,setCkOpen]=useState(false);
  const dn=getDayNum();
  const iq=withIQStyle(dRes?.iq);
  const allHist=getHist().filter(e=>e.iqScore!=null);
  const hasData=allHist.length>0;
  const dailyHist=allHist.filter(e=>e.mode==="daily");
  const practiceHist=allHist.filter(e=>e.mode!=="daily");
  const last10=allHist.slice(-10);
  const streak=ST.get("str",0);
  const bestIQ=allHist.length?Math.max(...allHist.map(e=>e.iqScore)):0;
  const dailyAvg=dailyHist.length?Math.round(dailyHist.reduce((a,e)=>a+e.iqScore,0)/dailyHist.length):null;
  const practiceAvg=practiceHist.length?Math.round(practiceHist.reduce((a,e)=>a+e.iqScore,0)/practiceHist.length):null;

  const secData={};
  SECS.forEach(s=>{secData[s.id]={id:s.id,name:s.name,icon:s.icon,color:s.color,count:0,totalIQ:0,bestIQ:0,avgIQ:0};});
  allHist.forEach(e=>{
    const sid=e.chosenSec||e.sid;
    if(sid&&secData[sid]){secData[sid].count++;secData[sid].totalIQ+=e.iqScore;if(e.iqScore>secData[sid].bestIQ)secData[sid].bestIQ=e.iqScore;}
  });
  Object.values(secData).forEach(s=>{if(s.count>0)s.avgIQ=Math.round(s.totalIQ/s.count);});
  const triedSections=Object.values(secData).filter(s=>s.count>0).sort((a,b)=>b.avgIQ-a.avgIQ);
  const untriedSections=Object.values(secData).filter(s=>s.count===0);

  const iqHist=allHist.filter(e=>e.iq).slice(-10);
  const avgDir=iqHist.length?Math.round(iqHist.reduce((a,e)=>a+(e.iq.directionScore||0),0)/iqHist.length):null;
  const avgPass=iqHist.length?Math.round(iqHist.reduce((a,e)=>a+(e.iq.passQualityScore||0),0)/iqHist.length):null;
  const avgTile=iqHist.length?Math.round(iqHist.reduce((a,e)=>a+(e.iq.tileStrengthScore||0),0)/iqHist.length):null;
  let focusLabel=null;
  if(avgDir!=null&&avgPass!=null&&avgTile!=null){
    const pcts={Direction:avgDir/40,Passing:avgPass/25,["Tile Read"]:avgTile/25};
    focusLabel=Object.entries(pcts).sort((a,b)=>a[1]-b[1])[0][0];
  }
  const focusTips={Direction:"Pick your strongest section earlier and let the first pass support that read.",Passing:"Before each pass, ask whether the tile still helps your best two sections.",["Tile Read"]:"Prioritize pairs and pungs over loose connected singles."};

  const bestHandFits={};
  allHist.filter(e=>e.allSections&&e.allSections.length).forEach(e=>{
    e.allSections.forEach(s=>{if(!bestHandFits[s.id]||s.score>bestHandFits[s.id].score)bestHandFits[s.id]={score:s.score,ts:e.ts,iqScore:e.iqScore};});
  });

  return(
    <div style={S.pg} className="rk-pg rk-stats-page">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div className="rk-premium-hero rk-sweep" style={{marginTop:14,marginBottom:16}}>
        <div style={{position:"relative",zIndex:2}}>
          <div style={{fontSize:9,letterSpacing:2.8,fontWeight:900,color:"rgba(255,255,255,.58)",marginBottom:10}}>YOUR RACKLE FORM</div>
          <div style={{fontFamily:F.d,fontSize:32,fontWeight:900,letterSpacing:-1.1,lineHeight:1.02,marginBottom:8}}>How your read is building</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.72)",lineHeight:1.6,maxWidth:320,margin:"0 auto"}}>Track your daily instinct, your strongest sections, and the next small move that makes you better.</div>
        </div>
      </div>

      {iq&&<div style={{marginBottom:16}}>
        <IQHero iq={iq} isDaily dayNum={dn} section={dRes.section} totalTime={iq.totalTime||0} chosenSec={dRes.chosenSec} allSections={dRes.allSections} isHome/>
        <button onClick={onShowScorecard} className="rk-premium-row" style={{width:"100%",border:"1px solid rgba(23,107,66,.12)",cursor:"pointer",marginTop:10,textAlign:"left"}}>
          <div className="rk-premium-icon">📋</div>
          <div style={{flex:1,minWidth:0,textAlign:"left"}}><div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,lineHeight:1.1}}>Open today’s full read</div><div style={{fontSize:12,color:C.mut,lineHeight:1.45,marginTop:3}}>See the rack shape, best path, and what to watch next.</div></div>
          <span style={{fontSize:16,color:C.jade,fontWeight:900}}>›</span>
        </button>
      </div>}

      {!hasData?(
        <div className="rk-premium-card" style={{padding:28,textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:8}}>🀄</div>
          <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,marginBottom:6}}>No games yet</div>
          <p className="rk-premium-copy">Play a Daily or Practice round and Rackle will start building your form report.</p>
        </div>
      ):(<>
        <div className="rk-stat-grid-premium">
          <div className="rk-stat-metric"><strong style={{color:C.ink}}>{allHist.length}</strong><span>Racks read</span></div>
          <div className="rk-stat-metric"><strong style={{color:C.jade}}>{bestIQ}</strong><span>Best score</span></div>
          <div className="rk-stat-metric"><strong style={{color:C.gold}}>{streak||0}d</strong><span>Streak</span></div>
        </div>

        {last10.length>=2&&(()=>{
          const scores=last10.map(e=>e.iqScore);
          const minS=Math.min(...scores,40),maxS=Math.max(...scores,100),range=Math.max(maxS-minS,20);
          const W=300,H=82,padX=10,padY=8;
          const pts=scores.map((s,i)=>({x:padX+(i/(scores.length-1))*(W-padX*2),y:H-padY-((s-minS)/range)*(H-padY*2),score:s,mode:last10[i].mode}));
          const path=pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
          const fill=`${path} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
          const last=scores[scores.length-1],prev=scores[scores.length-2];
          const trend=last>prev?"Climbing":last<prev?"Cooling":"Steady";
          const trendCol=last>prev?C.jade:last<prev?C.cinn:C.gold;
          return <div className="rk-premium-card" style={{padding:16,marginBottom:16}}>
            <div className="rk-premium-kicker">Score history</div>
            <h3 className="rk-premium-title" style={{fontSize:20,margin:"5px 0 4px"}}>{trend}</h3>
            <p className="rk-premium-copy" style={{fontSize:12}}>Last {scores.length} racks. Daily avg {dailyAvg??"—"}. Practice avg {practiceAvg??"—"}.</p>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",overflow:"visible",marginTop:14}}>
              <defs><linearGradient id="rkStatsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.jade} stopOpacity="0.16"/><stop offset="100%" stopColor={C.jade} stopOpacity="0"/></linearGradient></defs>
              <path d={fill} fill="url(#rkStatsFill)"/><path d={path} fill="none" stroke={C.jade} strokeWidth="2.4" strokeLinecap="round"/>
              {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?5:3.5} fill={p.mode==="daily"?C.jade:C.gold} stroke="#FFFDF8" strokeWidth="2"/>)}
              <text x={pts[pts.length-1].x} y={Math.max(10,pts[pts.length-1].y-10)} textAnchor="middle" fontSize="9" fontWeight="900" fill={trendCol}>{last}</text>
            </svg>
          </div>;
        })()}

        {avgDir!=null&&<div className="rk-premium-card" style={{padding:16,marginBottom:16}}>
          <div className="rk-premium-kicker">Your game</div>
          <h3 className="rk-premium-title" style={{fontSize:20,margin:"5px 0 12px"}}>What to sharpen next</h3>
          <div className="rk-premium-stack">
            {[{label:"Direction",score:avgDir,max:40,desc:"Choosing a lane"},{label:"Passing",score:avgPass,max:25,desc:"Letting go cleanly"},{label:"Tile Read",score:avgTile,max:25,desc:"Pairs, pungs, and shape"}].map(sub=>{
              const pct=Math.round(sub.score/sub.max*100);const col=pct>=75?C.jade:pct>=55?"#2460A8":pct>=40?C.gold:C.cinn;
              return <div key={sub.label} className="rk-premium-row" style={{padding:13}}>
                <div style={{textAlign:"left",flex:1}}><div style={{fontWeight:900,color:C.ink,fontSize:14}}>{sub.label}</div><div style={{fontSize:12,color:C.mut,marginTop:2}}>{sub.desc}</div></div>
                <div style={{minWidth:70,textAlign:"right"}}><div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:col}}>{sub.score}</div><div style={{height:5,background:C.bdr,borderRadius:99,overflow:"hidden",marginTop:5}}><div style={{height:"100%",width:`${pct}%`,background:col}}/></div></div>
              </div>;
            })}
          </div>
          {focusLabel&&<div style={{marginTop:14,padding:14,borderRadius:18,background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",border:`1px solid ${C.gold}24`}}><div className="rk-premium-kicker" style={{color:C.gold}}>Coach focus</div><div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,marginTop:4}}>{focusLabel}</div><p className="rk-premium-copy" style={{fontSize:12,marginTop:5}}>{focusTips[focusLabel]}</p></div>}
        </div>}

        <div className="rk-premium-card" style={{padding:0,marginBottom:16,overflow:"hidden"}}>
          <button onClick={()=>setSpOpen(o=>!o)} style={{width:"100%",border:"none",background:"transparent",cursor:"pointer",padding:16,textAlign:"center"}}>
            <div className="rk-premium-kicker">Section form</div><h3 className="rk-premium-title" style={{fontSize:20,margin:"5px 0 4px"}}>Where you are strongest</h3><p className="rk-premium-copy" style={{fontSize:12}}>{triedSections.length} sections played. {untriedSections.length} still waiting.</p>
          </button>
          {spOpen&&<div className="rk-premium-stack rk-in" style={{padding:"0 16px 16px"}}>
            {triedSections.slice(0,6).map(s=><div key={s.id} className="rk-premium-row" style={{padding:13}}><div className="rk-premium-icon" style={{width:38,height:38,borderRadius:14,fontSize:17,background:s.color+"12",color:s.color}}>{s.icon}</div><div style={{flex:1,textAlign:"left"}}><div style={{fontFamily:F.d,fontWeight:900,color:C.ink,fontSize:15}}>{s.name}</div><div style={{fontSize:11,color:C.mut}}>{s.count} rack{s.count!==1?"s":""} · best {s.bestIQ}</div></div><div className="rk-premium-pill" style={{color:s.color,background:s.color+"10",borderColor:s.color+"22"}}>{s.avgIQ}</div></div>)}
            {untriedSections.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",paddingTop:2}}>{untriedSections.slice(0,9).map(s=><span key={s.id} className="rk-premium-pill">{s.icon} {s.name}</span>)}</div>}
          </div>}
        </div>

        <div className="rk-premium-card" style={{padding:0,overflow:"hidden"}}>
          <button onClick={()=>setCkOpen(o=>!o)} style={{width:"100%",border:"none",background:"transparent",cursor:"pointer",padding:16,textAlign:"center"}}>
            <div className="rk-premium-kicker">Learning path</div><h3 className="rk-premium-title" style={{fontSize:20,margin:"5px 0 4px"}}>Keep building the daily habit</h3><p className="rk-premium-copy" style={{fontSize:12}}>A few focused reps beats a long report.</p>
          </button>
          {ckOpen&&<div className="rk-premium-stack rk-in" style={{padding:"0 16px 16px"}}>
            <button onClick={()=>setScreen("tutorial")} className="rk-premium-row" style={{border:"1px solid rgba(23,107,66,.12)",cursor:"pointer"}}><div className="rk-premium-icon">🎓</div><div style={{textAlign:"left",flex:1}}><div style={{fontFamily:F.d,fontSize:15,fontWeight:900}}>Replay tutorial</div><div style={{fontSize:12,color:C.mut}}>Refresh the Rackle rhythm.</div></div><span>›</span></button>
            <button onClick={()=>setScreen("handbrowser")} className="rk-premium-row" style={{border:"1px solid rgba(23,107,66,.12)",cursor:"pointer"}}><div className="rk-premium-icon">📚</div><div style={{textAlign:"left",flex:1}}><div style={{fontFamily:F.d,fontSize:15,fontWeight:900}}>Browse hands</div><div style={{fontSize:12,color:C.mut}}>Scan the 2026 card by section.</div></div><span>›</span></button>
            {onRecap&&<button onClick={onRecap} className="rk-premium-row" style={{border:"1px solid rgba(23,107,66,.12)",cursor:"pointer"}}><div className="rk-premium-icon">📈</div><div style={{textAlign:"left",flex:1}}><div style={{fontFamily:F.d,fontSize:15,fontWeight:900}}>Weekly recap</div><div style={{fontSize:12,color:C.mut}}>See the bigger pattern.</div></div><span>›</span></button>}
          </div>}
        </div>
      </>)}
      <Footer/>
    </div>
  );
}
function ReadyOverlay({mode,dayNum,onReady,onHome}){
  const challengeIQ=getUrlParam("challenge");
  const challengeDay=getUrlParam("day");
  const isChallenge=mode==="daily"&&challengeIQ&&challengeDay===String(dayNum);
  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50,padding:"0 20px",background:"rgba(250,247,241,0.75)",backdropFilter:"blur(6px)"}}>
      <div className="rk-in rk-modal-surface" style={{width:"100%",maxWidth:400,background:"linear-gradient(145deg,#FFFDF8,#F7F0E5)",borderRadius:24,border:`1px solid rgba(26,20,16,.09)`,boxShadow:"0 22px 70px rgba(26,20,16,.14),inset 0 1px 0 rgba(255,255,255,.75)",overflow:"hidden"}}>
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
  const [chosenSec,setChosenSec]=useState(null);const chosenSecRef=useRef(null);const setChosenSecBoth=(v)=>{chosenSecRef.current=v;setChosenSec(v);};const [chosenHand,setChosenHand]=useState(null);const [showRef,setShowRef]=useState(false);const [showFitHints,setShowFitHints]=useState(false);
  const [showHint,setShowHint]=useState(false);const [hintExp,setHintExp]=useState(null);
  const [cn,setCn]=useState(1);const [pi,setPi]=useState(0);
  const [st,setSt]=useState(null);const [el,setEl]=useState(0);const [td,setTd]=useState(false);
  const [showLeave,setShowLeave]=useState(false);
  const [iqResult,setIqResult]=useState(null);
  const iqResultRef=useRef(null);
  const setIqResultBoth=(v)=>{iqResultRef.current=v;setIqResult(v);};
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

  // ── OPPONENT SIMULATION ──────────────────────────────────────────────────────
  // Pool is the undealt deck with jokers removed. We pick tiles from it as if an opponent
  // is passing back, but never include Jokers because Jokers cannot be passed in Charleston.
  // The opponent's "section" rotates per Charleston so the mix feels natural.
  const oppSectionRef=useRef(null);
  if(!oppSectionRef.current){
    // Pick a random opposing section at game start, determines their discard bias
    const oppSecs=["2468","cr","13579","369","wd","sp","aln","2026"];
    oppSectionRef.current=oppSecs[Math.floor(Math.random()*oppSecs.length)];
  }

  // Score a pool tile as "discard likelihood" for the opponent, higher = more likely to pass it
  const oppDiscardScore=(t,oppSec)=>{
    // Jokers never enter the pool (filtered out on deal)
    if(t.t==="j")return 0;
    // Common discards: tiles that don't fit opponent's section
    const weakFor={
      "2468":(t)=>t.t==="s"&&t.n%2===1,
      "13579":(t)=>t.t==="s"&&t.n%2===0,
      "369":(t)=>t.t==="s"&&![3,6,9].includes(t.n),
      "cr":(t)=>t.t==="w",
      "wd":(t)=>t.t==="s"&&t.n>4,
      "aln":(t)=>t.t==="s",
      "2026":(t)=>t.t==="s"&&![2,6].includes(t.n),
      "sp":(t)=>t.t==="j",
    };
    const isWeak=weakFor[oppSec]?weakFor[oppSec](t):false;
    // Flowers and high-value tiles are less likely to be passed
    if(t.t==="f")return 2;
    if(isWeak)return 10+Math.random()*5;
    return 3+Math.random()*4;
  };

  // Pick incoming Charleston tiles from the simulated opponent.
  // American Mahjong rule: Jokers are NEVER passed in the Charleston.
  // Keep this centralized so Daily, Free Play, blind passes, and Courtesy Pass all obey it.
  const getIncomingTiles=(count)=>{
    const safePool=(pool||[]).filter(t=>t&&t.t!=="j");
    const scored=safePool
      .map((t,idx)=>({t,idx,score:oppDiscardScore(t,oppSectionRef.current)}))
      .sort((a,b)=>b.score-a.score);

    const picked=scored.slice(0,count);
    const pickedIdx=new Set(picked.map(x=>x.idx));
    const incoming=picked.map(x=>x.t).filter(t=>t&&t.t!=="j");
    const newPool=safePool.filter((_,i)=>!pickedIdx.has(i));

    return{incoming,newPool};
  };

  const doSwap=(count)=>{
    haptic(40);
    const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);
    const rem=hand.filter((_,i)=>!sel.includes(i));

    // Pick incoming tiles from pool. Jokers are excluded by rule.
    const {incoming,newPool}=getIncomingTiles(count);
    setPool(newPool);

    const comb=[...rem,...incoming];const ni=[];for(let i=rem.length;i<comb.length;i++)ni.push(i);
    const roundName=cn===1
      ?(pi===0?"Pass Right":pi===1?"Pass Over":"Pass Left (Blind)")
      :(pi===0?"2nd Charleston · Pass Left":pi===1?"2nd Charleston · Pass Over":"2nd Charleston · Pass Right (Blind)");
    const nowEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);
    const passEl=nowEl-lastPassElRef.current;lastPassElRef.current=nowEl;
    setPassLog(pl=>[...pl,{label:roundName,roundName,out:pt,in:incoming,blind:cp.blind,secs:passEl}]);
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

    const iq=calculateCharlestonIQ({
      startingRack,finalRack:hand,passedTilesByRound:passLog,
      totalTime:totalEl,sectionId:chosenSec,chosenHand,
    },getDailySeed(),isD,dn);
    setIqResultBoth(iq);

    const result={
      rating:RATS[gi],emoji:REMO[gi],section:`${top.icon} ${top.name}`,sid:top.id,
      score:top.score,time:totalEl,gi,iqScore:iq?iq.totalScore:null,iq,
      finalRack:hand,startingRack,passLog,chosenSec,chosenHand,allSections:ev(hand),
    };
    try{onDone(result);}catch(e){}
    window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
    setPhase("result");
  };

  const restart=()=>{
    window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
    const d=shuffle(buildDeck());const dealt=d.slice(0,13);
    setHand(dealt);setStartingRack(dealt);setPool(d.slice(13).filter(t=>t.t!=="j"));
    setSel([]);setPassed([]);setPassLog([]);setNewIdx([]);setCn(1);setPi(0);setChosenSecBoth(null);setChosenHand(null);
    setShowRef(false);setShowHint(false);setHintExp(null);setIqResultBoth(null);
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
            <RackSurface>
              {hand.map((t,i)=>{const isFlipped=flipped.includes(i);return isFlipped?<div key={i} className="rk-flip"><Ti t={t} large={large}/></div>:<div key={i} style={{width:large?44:37,height:large?64:54,borderRadius:10,background:`linear-gradient(160deg,${C.jade}E6,#10492C)`,border:`1px solid ${C.jade}55`,flexShrink:0,boxShadow:`0 4px 10px rgba(27,125,78,0.18), 0 1px 0 rgba(255,255,255,.12) inset`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,opacity:0.18}}>🀄</span></div>;})}
            </RackSurface>
          </div>
          <div style={{textAlign:"center",fontSize:13,color:C.mut,fontWeight:700,margin:"5px 0",opacity:0.25}}>0 of 3 selected</div>
          <button disabled style={{...S.passBtn,opacity:0.2}}>🔄 Pass 0 Right</button>
        </>
      )}

      {phase.startsWith("score-")&&null}

      {phase==="result"&&(iqResult||iqResultRef.current)&&(
        <div className="rk-in">
          <RackleHeader onBack={home}/>
          <IQScorecard
            iq={iqResult||iqResultRef.current}
            hand={hand}
            startingRack={startingRack}
            passLog={passLog}
            isDaily={mode==="daily"}
            dayNum={dn}
            section={`${ev(hand)[0].icon} ${ev(hand)[0].name}`}
            chosenSec={chosenSec||chosenSecRef.current}
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
      {phase==="askCourtesy"&&<Ask icon="🤝" title="Courtesy Pass?" desc="Pass 1-3 tiles across." hand={hand} timer={getDisplayTime()} onSort={()=>setHand(sortHand(hand))} onNo={()=>{stopTimer();setSel([]);setNewIdx([]);setPhase("chooseHand");}} onYes={()=>{setSel([]);setNewIdx([]);setPhase("courtesy");}} large={large}/>}

      {phase==="courtesy"&&(
        <>
          <RackleHeader onBack={()=>setShowLeave(true)}/>
          {getDisplayTime()&&<div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span></div>}
          <h2 style={{fontFamily:F.d,fontSize:17,color:C.ink,margin:"0 0 2px",textAlign:"center"}}>Courtesy Pass</h2>
          <p style={{fontSize:12,color:C.mut,textAlign:"center",marginBottom:10}}>Select 1-3 tiles to pass across</p>
          {jw&&<JW/>}
          <div style={S.card}><RH hand={hand} onSort={()=>setHand(sortHand(hand))}/>
            <RackSurface>{hand.map((t,i)=><Ti key={i} t={t} sel={sel.includes(i)} dim={t.t==="j"} onClick={()=>cTog(i)} large={large}/>)}</RackSurface></div>
          <div aria-live="polite" style={{textAlign:"center",fontSize:13,color:sel.length>0?C.jade:C.mut,fontWeight:700,margin:"4px 0"}}>{sel.length}/3 selected</div>
          <button onClick={()=>{haptic(40);if(sel.length<1){setSel([]);setNewIdx([]);stopTimer();setPhase("chooseHand");return;}const pt=sel.map(i=>hand[i]);setPassed(p=>[...p,...pt]);const rem=hand.filter((_,i)=>!sel.includes(i));const {incoming:inc,newPool}=getIncomingTiles(sel.length);setPool(newPool);setHand([...rem,...inc]);const cpNowEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);const cpPassEl=cpNowEl-lastPassElRef.current;lastPassElRef.current=cpNowEl;setPassLog(pl=>[...pl,{label:"Courtesy Pass",roundName:"Courtesy Pass",out:pt,in:inc,blind:false,secs:cpPassEl}]);setSel([]);setNewIdx([]);stopTimer();setPhase("chooseHand");}} style={{...S.passBtn}}>{sel.length<1?"Skip →":`Pass ${sel.length} across →`}</button>
        </>
      )}

      {phase==="chooseHand"&&(
        <>
          <RackleHeader onBack={()=>setShowLeave(true)}/>
          {getDisplayTime()&&<div style={{textAlign:"center",marginBottom:4}}><span style={{fontSize:12,color:C.mut,fontFamily:F.d,fontWeight:700}}>⏱ {getDisplayTime()}</span></div>}
          <h2 style={{fontFamily:F.d,fontSize:18,color:C.ink,margin:"0 0 2px",textAlign:"center"}}>Which section are you going for?</h2>
          <p style={{fontSize:12,color:C.mut,marginBottom:10,textAlign:"center"}}>Pick the section you played toward.</p>
          <Rack hand={hand} label="YOUR FINAL RACK" showSort onSort={()=>setHand(sortHand(hand))} large={large}/>
          <button onClick={()=>setShowRef(!showRef)} aria-expanded={showRef} style={{...S.card,width:"100%",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,background:showRef?C.gold+"06":"#fff"}}>
            <span style={{fontSize:12,fontWeight:600,color:showRef?C.gold:C.ink}}>📖 {showRef?"Hide":"Show"} 2026 Card Guide</span><span aria-hidden="true" style={{color:C.mut}}>{showRef?"▾":"▸"}</span>
          </button>
          {showRef&&<CG onClose={()=>setShowRef(false)}/>}
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:6}}>TAP TO SCORE YOUR ROUND</div>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
            {SECS.map((s)=>(
              <button key={s.id} onClick={()=>{
                haptic(20);
                setTd(true);
                const e=ev(hand),top=e[0],gi=gri(top.score);
                const totalEl=Math.floor((elRef.current+(stRef.current?Date.now()-stRef.current:0))/1000);
                const dn2=getDayNum();
                const isD=mode==="daily";
                const sr=startingRack&&startingRack.length>0?startingRack:hand;
                const iq=calculateCharlestonIQ({startingRack:sr,finalRack:hand,passedTilesByRound:passLog,totalTime:totalEl,sectionId:s.id,chosenHand:null},getDailySeed(),isD,dn2);
                chosenSecRef.current=s.id;
                iqResultRef.current=iq;
                setChosenSec(s.id);
                setChosenHand(null);
                setIqResult(iq);
                const result={rating:RATS[gi],emoji:REMO[gi],section:`${top.icon} ${top.name}`,sid:top.id,score:top.score,time:totalEl,gi,iqScore:iq?iq.totalScore:null,iq,finalRack:hand,startingRack:sr,passLog,chosenSec:s.id,chosenHand:null,allSections:ev(hand)};
                setTimeout(()=>{try{onDone(result);}catch(_){}},0);
                window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
                setPhase("result");
              }}
                style={{cursor:"pointer",display:"flex",alignItems:"center",gap:0,borderRadius:12,overflow:"hidden",border:`1.5px solid ${C.bdr}`,background:"#fff",textAlign:"left",padding:0,transition:"all 0.15s"}}>
                <div style={{width:4,alignSelf:"stretch",flexShrink:0,background:s.color+"40"}}/>
                <div style={{width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,margin:"0 2px"}}>{s.icon}</div>
                <div style={{flex:1,minWidth:0,padding:"10px 8px 10px 4px"}}>
                  <div style={{fontSize:13,fontWeight:800,color:C.ink,lineHeight:1.2,marginBottom:2}}>{s.name}</div>
                  <div style={{fontSize:10,color:C.mut,lineHeight:1.3}}>{s.desc}</div>
                </div>
                <div style={{width:28,height:28,borderRadius:14,background:`linear-gradient(135deg,${s.color},${s.color}CC)`,display:"flex",alignItems:"center",justifyContent:"center",marginRight:10,flexShrink:0}}>
                  <span style={{fontSize:12,color:"#fff",fontWeight:900}}>→</span>
                </div>
              </button>
            ))}
          </div>
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
            <p role="status" aria-live="polite" style={{fontSize:12,color:hasNew?C.jade:C.mut,fontWeight:hasNew?600:400}}>{hasNew?`← ${newIdx.length} tile${newIdx.length!==1?"s":""} in from ${cp.dir==="Right"?"your left":cp.dir==="Left"?"your right":cp.dir==="Over"?"across the table":"your neighbor"}`:isBlind?`Select 0-${cp.max||3} tiles to pass`:`Select exactly ${cp.req} tiles to pass`}</p>
          </div>
          {jw&&<JW/>}
          <div style={S.card}>
            <RH hand={hand} onSort={()=>setHand(sortHand(hand))} showRef={showRef} onRef={()=>setShowRef(!showRef)}/>
            <RackSurface>{hand.map((t,i)=><Ti key={i} t={t} sel={sel.includes(i)} isNew={newIdx.includes(i)} dim={t.t==="j"&&!hasNew} onClick={!hasNew?()=>toggle(i):undefined} large={large}/>)}</RackSurface>
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
                            {!viable&&<div style={{fontSize:10,color:C.cinn,marginTop:4,fontStyle:"italic"}}>Low fit, your rack doesn't lean this way yet.</div>}
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
function JW(){return(<div role="alert" className="rk-in" style={{padding:"6px 10px",background:C.cinn+"08",borderRadius:8,border:`1px solid ${C.cinn}15`,textAlign:"center",marginBottom:6}}><span style={{fontSize:11,color:C.cinn,fontWeight:600}}>🃏 Jokers cannot be passed, they're too valuable!</span></div>);}
function RH({hand,onSort,showRef,onRef}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK ({hand.length} tiles)</span><div style={{display:"flex",gap:4}}><button onClick={onSort} style={S.sortBtn}>Sort</button>{onRef&&<button onClick={onRef} aria-expanded={showRef} style={{...S.sortBtn,background:showRef?C.jade+"10":"none",color:showRef?C.jade:C.mut,borderColor:showRef?C.jade+"30":C.bdr}}>📖 2026 Card</button>}</div></div>);}
function Rack({hand,label,showSort,onSort,large}){return(<div className="rk-lux-card" style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>{label}</span>{showSort&&<button onClick={onSort} style={S.sortBtn}>Sort</button>}</div><RackSurface>{hand.map((t,i)=><Ti key={i} t={t} large={large}/>)}</RackSurface></div>);}
function CG({onClose}){
  const [exp,setExp]=useState(null);
  return(<div style={{...S.card,background:"linear-gradient(145deg,#FFFFF8,#F7F0E5)",borderColor:C.gold+"30",maxHeight:380,overflowY:"auto"}} className="rk-in rk-lux-card" role="region" aria-label="2026 Card Guide">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,position:"sticky",top:0,background:"#FFFFF8",paddingBottom:3,zIndex:1}}><span style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:700}}>📖 2026 CARD GUIDE</span><button onClick={onClose} style={{background:"none",border:"none",color:C.mut,fontSize:14,cursor:"pointer"}}>✕</button></div>
    {SECS.map(s=>{const o=exp===s.id;return(
      <div key={s.id} style={{borderBottom:`1px solid ${C.bdr}`}}>
        <button onClick={()=>setExp(o?null:s.id)} aria-expanded={o} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"8px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span aria-hidden="true" style={{fontSize:13}}>{s.icon}</span><div><span style={{fontSize:12,fontWeight:700,color:C.ink}}>{s.name}</span><span style={{fontSize:10,color:C.mut,marginLeft:6}}>, {s.desc}</span></div></div>
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
function normalizeRecapEntry(e){
  if(!e)return null;
  const iqScore=e.iqScore??e.iq?.totalScore??null;
  const ts=e.ts||e.played_at||e.created_at||Date.now();
  const daySeed=e.daySeed||e.day_seed||null;
  const mode=e.mode||(daySeed?"daily":null);
  return{...e,iqScore,ts,daySeed,mode};
}

function getWeeklyHist(){
  const hist=(getHist()||[]).map(normalizeRecapEntry).filter(Boolean);
  const todaySeed=getDailySeed();
  const dres=normalizeRecapEntry(ST.get("dres",null));
  const todayDone=ST.get("dd",null)===todaySeed;
  if(todayDone&&dres&&dres.iqScore!=null){
    const dailyToday={...dres,mode:"daily",daySeed:todaySeed,day_seed:todaySeed,ts:dres.ts||Date.now()};
    const already=hist.some(e=>
      (e.mode==="daily"||e.daySeed===todaySeed||e.day_seed===todaySeed) &&
      (e.daySeed===todaySeed||e.day_seed===todaySeed||sameLocalDay(e.ts,Date.now())) &&
      Number(e.iqScore)===Number(dailyToday.iqScore)
    );
    if(!already)hist.push(dailyToday);
  }
  return hist;
}

function sameLocalDay(a,b){
  const da=new Date(a),db=new Date(b);
  return da.getFullYear()===db.getFullYear()&&da.getMonth()===db.getMonth()&&da.getDate()===db.getDate();
}

function isDailyEntry(e){
  const todaySeed=getDailySeed();
  return e?.mode==="daily"||e?.daySeed!=null||e?.day_seed!=null||(ST.get("dd",null)===todaySeed&&ST.get("dres",null)&&sameLocalDay(e?.ts||0,Date.now())&&Number(e?.iqScore)===Number((ST.get("dres",null)?.iqScore??ST.get("dres",null)?.iq?.totalScore)));
}

function getWeeklyRecapData(){
  const now=new Date();
  const dayOfWeek=now.getDay(); // 0=Sun
  const weekStart=new Date(now);
  weekStart.setDate(now.getDate()-dayOfWeek);
  weekStart.setHours(0,0,0,0);
  const h=getWeeklyHist().filter(e=>e.iqScore!=null&&e.ts>=weekStart.getTime());
  if(!h.length)return null;
  const dailyH=h.filter(isDailyEntry);
  const avgIQ=Math.round(h.reduce((a,e)=>a+Number(e.iqScore||0),0)/h.length);
  const bestEntry=h.reduce((a,b)=>Number(b.iqScore)>Number(a.iqScore)?b:a,h[0]);
  const daysPlayed=new Set(h.map(e=>{const d=new Date(e.ts);return`${d.getMonth()}-${d.getDate()}`;})).size;
  // Section most played this week
  const secCounts={};h.filter(e=>e.sid).forEach(e=>{secCounts[e.sid]=(secCounts[e.sid]||0)+1;});
  const topSecId=Object.keys(secCounts).sort((a,b)=>secCounts[b]-secCounts[a])[0]||null;
  const topSec=topSecId?SECS.find(s=>s.id===topSecId):null;
  // Trend vs prior week
  const prevWeekStart=new Date(weekStart);prevWeekStart.setDate(weekStart.getDate()-7);
  const prevH=getWeeklyHist().filter(e=>e.iqScore!=null&&e.ts>=prevWeekStart.getTime()&&e.ts<weekStart.getTime());
  const prevAvg=prevH.length?Math.round(prevH.reduce((a,e)=>a+Number(e.iqScore||0),0)/prevH.length):null;
  const delta=prevAvg!=null?avgIQ-prevAvg:null;
  const dailyDaysPlayed=new Set(dailyH.map(e=>{const d=new Date(e.ts);return`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;})).size;
  return{h,dailyH,avgIQ,bestEntry,daysPlayed,topSec,delta,prevAvg,weekRounds:h.length,dailyDaysPlayed};
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
  // Week-in-progress banner, shown any day except Sunday
  const weekInProgress=!isSunday;

  const {avgIQ,bestEntry,daysPlayed,topSec,delta,weekRounds,dailyH,dailyDaysPlayed}=data;
  const lvlTier=getIQTier(avgIQ);
  const lvl={label:lvlTier.level,color:lvlTier.color};

  const shareText=`🀄 My Rackle week:\n${avgIQ} avg score · ${daysPlayed}/7 days · ${weekRounds} hands\n${lvl.label}${topSec?` · Fave: ${topSec.icon} ${topSec.name}`:""}\nplayrackle.com`;

  return(
    <div style={S.pg} className="rk-pg rk-recap-shell">
      <RackleHeader onBack={home} setScreen={setScreen}/>

      {/* Hero */}
      <div className="rk-recap-hero" style={{borderRadius:20,background:`linear-gradient(160deg,${C.hero1},${C.hero2},${C.hero3})`,padding:"24px 20px 20px",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.2)",marginBottom:12}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:3,fontWeight:700,marginBottom:10}}>YOUR WEEK IN RACKLE</div>
        {profile?.nickname&&<div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:8}}>{profile.nickname}</div>}
        <div style={{fontFamily:F.d,fontSize:56,fontWeight:900,color:C.gilt,lineHeight:1,letterSpacing:-2,marginBottom:4}}>{avgIQ}</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,fontWeight:700,marginBottom:6}}>AVG RACKLE SCORE</div>
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
      <div className="rk-recap-card" style={{...S.card,marginBottom:10,padding:16}}>
        <div style={{fontSize:9,color:C.jade,letterSpacing:2.4,fontWeight:900,marginBottom:12}}>THIS WEEK'S HIGHLIGHTS</div>
        {topSec&&<div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:10,marginBottom:10,borderBottom:`1px solid ${C.bdr}`}}>
          <div style={{width:36,height:36,borderRadius:10,background:topSec.color+"12",border:`1px solid ${topSec.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{topSec.icon}</div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.ink}}>Most played: {topSec.name}</div>
            <div style={{fontSize:10,color:C.mut,marginTop:1}}>Your go-to section this week</div>
          </div>
        </div>}
        <div className="rk-recap-metric-row">
          <div className="rk-recap-metric" style={{color:C.jade}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.jade}}>{dailyDaysPlayed||dailyH.length}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>DAILIES</div>
          </div>
          <div className="rk-recap-metric" style={{color:C.gold}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.gold}}>{bestEntry.iqScore}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>BEST SCORE</div>
          </div>
          <div className="rk-recap-metric" style={{color:C.cinn}}>
            <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.cinn}}>{daysPlayed}</div>
            <div style={{fontSize:8,color:C.mut,letterSpacing:1.5,fontWeight:700,marginTop:2}}>DAYS PLAYED</div>
          </div>
        </div>
      </div>

      {/* Delta message */}
      {delta!=null&&<div className="rk-recap-card" style={{...S.card,marginBottom:10,background:delta>=0?C.jade+"06":C.cinn+"06",borderColor:delta>=0?C.jade+"25":C.cinn+"25"}}>
        <div style={{fontSize:12,color:delta>=0?C.jade:C.cinn,fontWeight:700,lineHeight:1.6}}>
          {delta>=0
            ?`↑ Up ${delta} IQ points from last week, you're improving. Keep the streak going.`
            :`↓ Down ${Math.abs(delta)} IQ points from last week. More practice sessions will turn this around.`}
        </div>
      </div>}

      {/* Share */}
      <div className="rk-recap-card" style={{...S.card,marginBottom:12,padding:16}}>
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


// ════════════════════════════════════════════════════════════════════════════
// HAND ANATOMY DATA, plain-English breakdown of every group type
// ════════════════════════════════════════════════════════════════════════════
const GROUP_TYPES={
  "pair":  {name:"Pair",     count:2, jokerOk:false, desc:"2 identical tiles. Natural only, no jokers."},
  "pung":  {name:"Pung",     count:3, jokerOk:true,  desc:"3 identical tiles. 1-2 jokers allowed."},
  "kong":  {name:"Kong",     count:4, jokerOk:true,  desc:"4 identical tiles. Up to 3 jokers allowed."},
  "quint": {name:"Quint",    count:5, jokerOk:true,  desc:"5 identical tiles. Needs at least 1 joker."},
  "single":{name:"Single",   count:1, jokerOk:false, desc:"1 tile standing alone. Natural only."},
  "sextet":{name:"Sextet",   count:6, jokerOk:true,  desc:"6 identical tiles (e.g. 6 Flowers)."},
};

// Decode a hand label string into structured groups for visual display
// e.g. "FF 2222 44 66 8888" → [{type:"pair",tile:"F"},{type:"kong",tile:"2"},...]
function decodeHandLabelLegacy(label, sectionId){
  const groups=[];
  // Tokenize by whitespace
  const tokens=label.trim().split(/\s+/);
  for(const tok of tokens){
    if(!tok)continue;
    // Special: NEWS = 4 wind singles
    if(tok==="NEWS"){
      groups.push({type:"single",tile:"N",count:1,isWind:true});
      groups.push({type:"single",tile:"E",count:1,isWind:true});
      groups.push({type:"single",tile:"W",count:1,isWind:true});
      groups.push({type:"single",tile:"S",count:1,isWind:true});
      continue;
    }
    // Winds: NN, EE, EEE, EEEE, SS, etc.
    if(/^[NEWS]+$/.test(tok)){
      const windChar=tok[0];
      const cnt=tok.length;
      const t=cnt===2?"pair":cnt===3?"pung":cnt===4?"kong":"single";
      groups.push({type:t,tile:windChar,count:cnt,isWind:true});
      continue;
    }
    // Dragons: DDD, DDDD, D (matching or opposite, mark as dragon)
    if(/^D+$/.test(tok)){
      const cnt=tok.length;
      const t=cnt===1?"single":cnt===2?"pair":cnt===3?"pung":"kong";
      groups.push({type:t,tile:"D",count:cnt,isDragon:true});
      continue;
    }
    // Flowers: F, FF, FFF, FFFF, FFFFFF
    if(/^F+$/.test(tok)){
      const cnt=tok.length;
      const t=cnt===1?"single":cnt===2?"pair":cnt===3?"pung":cnt===4?"kong":cnt===5?"quint":"sextet";
      groups.push({type:t,tile:"F",count:cnt,isFlower:true});
      continue;
    }
    // Soap/Zero: 0, 00, 000 (Soap = White Dragon)
    if(/^0+$/.test(tok)){
      const cnt=tok.length;
      const t=cnt===1?"single":cnt===2?"pair":cnt===3?"pung":"kong";
      groups.push({type:t,tile:"0",count:cnt,isSoap:true});
      continue;
    }
    // Number tiles: sequences like "2026", "135", "246" = singles of each digit
    // or repeated digits like "2222" = kong of 2
    // Detect: if all chars are the same digit → grouped
    if(/^\d+$/.test(tok)){
      const digits=[...tok].map(Number);
      const allSame=digits.every(d=>d===digits[0]);
      if(allSame){
        const cnt=digits.length;
        const t=cnt===1?"single":cnt===2?"pair":cnt===3?"pung":cnt===4?"kong":cnt===5?"quint":"sextet";
        groups.push({type:t,tile:String(digits[0]),count:cnt,isNum:true});
      } else {
        // Each digit is a single
        for(const d of digits){
          groups.push({type:"single",tile:String(d),count:1,isNum:true});
        }
      }
      continue;
    }
  }
  return groups;
}

// ── CARD COLOR SYSTEM ─────────────────────────────────────────────────────────
// The NMJL card uses a 3-color system to show which suit group each tile belongs to:
//   GREEN  = Suit A (Bam-style)  → #176B42
//   RED    = Suit B (Crak-style) → #B83232
//   BLACK  = Suit C / any / winds / dragons / neutral → #1A1410
//   FLOWER = warm purple-green (always)
//   SOAP   = grey-white (always)
// Each hand has a `cardColors` array, one color code per token in the label.
// "G"=green, "R"=red, "K"=black(any), "F"=flower, "S"=soap, "W"=wind, "D"=dragon
const CARD_COL={
  G:"#176B42",  // green suit
  R:"#B83232",  // red suit
  K:"#1A1410",  // black / any suit / neutral
  F:"#7B5CB0",  // flowers (purple-ish like the card)
  S:"#6B6560",  // soap / white dragon
  W:"#4A3F35",  // winds
  D:"#8A1A1A",  // dragons (deep red)
};

// Per-hand card color sequences, one entry per whitespace token in the label.
// Matches exactly the color printing on the 2026 NMJL card.
const HAND_CARD_COLORS={
  // ── 2026 ──────────────────────────────────────────────────────────────────
  "222 000 2222 6666":        ["G","S","G","R"],   // green 2s, soap, green 2s, red 6s
  "2026 DDD 2222 DDD":        ["G","G","R","R"],   // 2026 singles green, DDD green, 2222 red, DDD red
  "FFF 2026 222 6666":        ["F","G","G","R"],   // flowers, 2026 green, 222 green, 6666 red
  "22 00 222 666 NEWS":       ["G","S","G","R","W"], // pairs green, soap, pung green, pung red, winds
  // ── 2468 ──────────────────────────────────────────────────────────────────
  "222 444 6666 8888":        ["K","K","R","G"],   // black/any, black, red 6s, green 8s
  "FF 2222 44 66 8888":       ["F","G","K","K","R"],
  "EE 22 444 666 88 WW":      ["W","K","G","R","K","W"],
  "2222 DDD 8888 DDD":        ["G","D","R","D"],
  "FFF 22 44 666 8888":       ["F","K","K","G","R"],
  "2468 2222 D 2222 D":       ["K","G","D","R","D"],  // singles any, kong green, dragon, kong red, dragon
  "FFF 2468 FFF 2222":        ["F","K","F","G"],
  "FF 246 888 246 888":       ["F","G","R","G","R"],
  // ── 369 ──────────────────────────────────────────────────────────────────
  "333 666 6666 9999":        ["G","G","R","K"],
  "33 66 333 666 9999":       ["G","G","K","R","G"],
  "FFF 33 666 99 DDDD":       ["F","G","G","G","D"],
  "33 66 666 999 NEWS":       ["G","G","R","R","W"],
  "FF 3369 3333 3333":        ["F","G","G","R"],
  "FF 333 666 999 369":       ["F","G","R","G","K"],
  // ── 13579 ─────────────────────────────────────────────────────────────────
  "11 333 55 777 9999":       ["K","G","K","R","G"],
  "111 333 3333 5555":        ["G","G","R","R"],
  "NN 1111 33 5555 SS":       ["W","G","G","R","W"],
  "113579 1111 1111":         ["K","G","R"],         // singles any, kong green, kong red
  "FFF 11 33 555 DDDD":       ["F","G","G","R","D"],
  "11 33 111 333 5555":       ["G","G","G","R","G"],
  "1111 33 55 77 9999":       ["G","K","K","K","R"],
  "FF 11 33 55 111 111":      ["F","G","G","G","G","R"],
  "FF 135 777 999 DDD":       ["F","G","R","G","D"],
  // ── CONSECUTIVE RUN ───────────────────────────────────────────────────────
  "11 222 33 444 5555":       ["G","G","G","G","G"],   // all one suit = all green
  "55 666 77 888 9999":       ["R","R","R","R","R"],   // all one suit = all red
  "FFF 1111 234 5555":        ["F","G","G","G","G"],
  "11 22 111 222 3333":       ["G","G","G","G","R"],
  "111 222 3333 4444":        ["G","G","R","R"],
  "FFF 11 22 333 DDDD":       ["F","G","G","R","D"],
  "1111 FFFFFF 2222":         ["G","F","R"],
  "FF 1111 2222 3333":        ["F","G","R","G"],
  "1 22 333 1 22 333 44":     ["G","G","G","R","R","R","K"],
  // ── WINDS & DRAGONS ───────────────────────────────────────────────────────
  "NNNN EEE WWW SSSS":        ["W","W","W","W"],
  "1234 DDD DDD DDDD":        ["K","G","R","D"],
  "NNN 1111 1111 SSS":        ["W","G","R","W"],
  "EEE 2222 2222 WWW":        ["W","G","R","W"],
  "FFF NNNN FFF DDDD":        ["F","W","F","D"],
  "1 N 2 EE 3 WWW 4 SSSS":    ["K","W","K","W","K","W","K","W"],
  "FF NNNN SSSS DD DD":       ["F","W","W","D","D"],
  "NN EEE 2026 WWW SS":       ["W","W","K","W","W"],
  // ── ANY LIKE NUMBERS ──────────────────────────────────────────────────────
  "1111 FFFFFF 1111":         ["G","F","R"],
  "1111 D 111 D 1111 D":      ["G","D","R","D","G","D"],  // per-suit groups with matching dragon
  "FF 1111 11 1111 DD":       ["F","G","K","R","D"],
  // ── QUINTS ────────────────────────────────────────────────────────────────
  "11111 1111 11111":         ["G","R","K"],
  "FF 11111 22 33333":        ["F","G","G","R"],
  "11111 44444 DDDD":         ["G","R","D"],
  // ── SINGLES & PAIRS ───────────────────────────────────────────────────────
  "NN EE WW SS 1D 1D 1D":     ["W","W","W","W","G","G","R"],  // winds, then 3×(num+dragon singles)
  "2 4 66 88 2 4 66 88 88":   ["G","G","G","G","R","R","R","R","K"],
  "FF 3369 3669 3699":        ["F","G","G","R","R","K"],
  "11 22 33 44 55 66 77":     ["G","G","G","G","G","G","G"],  // all one suit
  "11 357 99 11 357 99":      ["G","G","G","R","R","R"],
  "FF 2026 2026 2026":        ["F","G","G","R"],
};

// Render a single decoded group as tile chips, card-accurate color coding
// ── HONEST COVERAGE, same tile-pull logic used by HandTargetPreview display ──
// Returns {held, total, pct} using the literal decoded label + card colors.
// This is the ground-truth "how many of the 14 hand tiles does this rack actually hold?"
// Unlike fit() which picks best-case suit permutations, this is suit-specific and strict.
const RACKLE_REAL_SUITS=["bam","crak","dot"];
const RACKLE_SUIT_LABELS={bam:"Bam",crak:"Crak",dot:"Dot"};
const RACKLE_CODE_TO_DEFAULT_SUIT={G:"bam",R:"crak",B:"dot"};
function shouldMapBlackAsSuit(handObj,groups,cardColors){
  const numericK=groups.some((g,i)=>g.isNum&&cardColors[i]==="K");
  if(!numericK)return false;
  const constraint=String(handObj?.constraint||HAND_CONSTRAINTS?.[handObj?.label]||"");
  const numericCodes=[...new Set(groups.map((g,i)=>g.isNum?cardColors[i]:null).filter(Boolean))];
  return constraint.includes("Any 3 Suits")||numericCodes.filter(c=>["G","R","K"].includes(c)).length>=3;
}
function suitMappingOptions(codes){
  if(!codes.length)return[{}];
  const out=[];
  const walk=(idx,used,map)=>{
    if(idx>=codes.length){out.push({...map});return;}
    const code=codes[idx];
    for(const suit of RACKLE_REAL_SUITS){
      if(used.has(suit))continue;
      map[code]=suit;
      used.add(suit);
      walk(idx+1,used,map);
      used.delete(suit);
      delete map[code];
    }
  };
  walk(0,new Set(),{});
  return out.length?out:[{}];
}
function makeGroupPredicateLegacy(g,cc,suitMap){
  return (t)=>{
    if(g.isFlower)return t.t==="f";
    if(g.isSoap)return t.t==="d"&&t.v==="Soap";
    if(g.isDragon)return t.t==="d";
    if(g.isWind)return t.t==="w"&&(g.tile?t.v===g.tile:true);
    if(g.isNum){
      const nm=t.t==="s"&&t.n===Number(g.tile);
      if(!nm)return false;
      const mapped=suitMap?.[cc];
      if(mapped)return t.s===mapped;
      if(cc==="G"||cc==="R"||cc==="B")return t.s===RACKLE_CODE_TO_DEFAULT_SUIT[cc];
      return true;
    }
    return false;
  };
}
function buildCoveragePlanLegacy(rack,handObj,passLog=[]){
  if(!rack||!handObj)return{held:0,total:0,pct:0,groups:[],groupStatus:[],suitMap:{},cardColors:[]};
  const groups=decodeHandLabel(handObj.label,handObj.sec);
  const cardColors=HAND_CARD_COLORS[handObj.label]||[];
  const mapK=shouldMapBlackAsSuit(handObj,groups,cardColors);
  const codes=[...new Set(groups.map((g,i)=>{
    const cc=cardColors[i];
    if(!g.isNum)return null;
    if(cc==="G"||cc==="R"||cc==="B")return cc;
    if(cc==="K"&&mapK)return cc;
    return null;
  }).filter(Boolean))];
  const allPassed=(passLog||[]).flatMap((p,idx)=>(p.out||p.passedTiles||[]).map(t=>({...t,roundName:p.label||p.roundName||`Pass ${idx+1}`,roundIdx:idx})));
  let best=null;
  for(const suitMap of suitMappingOptions(codes)){
    const rackPool=[...rack];
    const pull=(pred,need)=>{
      let f=0;const r=[];
      for(const t of rackPool){if(f<need&&pred(t))f++;else r.push(t);}
      rackPool.length=0;rackPool.push(...r);
      return f;
    };
    const groupStatus=[];
    let held=0,total=0;
    groups.forEach((g,gi)=>{
      const cc=cardColors[gi];
      const pred=makeGroupPredicate(g,cc,suitMap);
      const need=g.count;
      total+=need;
      const naturalHeld=pull(pred,need);
      const jokerHeld=(!handObj.concealed&&g.type!=="single"&&g.type!=="pair")
        ?pull(t=>t.t==="j",need-naturalHeld):0;
      const totalHeld=naturalHeld+jokerHeld;
      held+=totalHeld;
      const gap=need-totalHeld;
      const passedMatching=allPassed.filter(t=>pred(t));
      const passedRounds=[...new Set(passedMatching.map(t=>t.roundName))];
      groupStatus.push({g,gi,cc,need,totalHeld,naturalHeld,jokerHeld,gap,passedMatching,passedRounds,resolvedSuit:suitMap?.[cc]||null});
    });
    const pct=total>0?Math.round(held/total*100):0;
    const score=held*1000+pct;
    if(!best||score>best.score)best={score,held,total,pct,groups,groupStatus,suitMap:{...suitMap},cardColors};
  }
  return best||{held:0,total:0,pct:0,groups,groupStatus:[],suitMap:{},cardColors};
}
function computeHonestCoverage(rack, handObj){
  const plan=buildCoveragePlan(rack,handObj,[]);
  const tone=rkCoachPathTone(plan);
  return{held:plan.held,total:plan.total,pct:plan.pct,credibility:rkPlanCredibility(plan),isCredible:rkIsCrediblePath(plan),suitMap:plan.suitMap,variantLabel:plan.variantLabel,labelForDisplay:plan.labelForDisplay,groupNuance:rkGroupNuance(plan),tone,coachLine:rkShortCoachLine(plan),plan};
}




// ─── 2026 CHARLESTON RESOLVER UPGRADE ───────────────────────────────────────
// This resolver makes the engine evaluate the whole rack against every NMJL hand
// variant using the parenthetical rules on the card: Any 1/2/3 suits, matching
// dragon, opposite dragon, Soap-as-zero, concealed/no-joker, and natural-only
// pairs/singles. It is intentionally used by both Daily and Practice scorecards.
function rkGroupTypeForCount(cnt){return cnt===1?"single":cnt===2?"pair":cnt===3?"pung":cnt===4?"kong":cnt===5?"quint":"sextet";}
function rkPushDecoded(groups, props, tokenIndex){groups.push({...props,tokenIndex});}
function decodeHandLabel(label, sectionId){
  const groups=[];
  const tokens=String(label||"").trim().split(/\s+/).filter(Boolean);
  tokens.forEach((tok,tokenIndex)=>{
    if(tok==="NEWS"){
      ["N","E","W","S"].forEach(w=>rkPushDecoded(groups,{type:"single",tile:w,count:1,isWind:true},tokenIndex));
      return;
    }
    // Mixed tokens like 1D, 2026, 113579, 3369 need to preserve grouped repeats.
    // 0 is always Soap/White Dragon in card strings, not a numbered suit tile.
    const parts=String(tok).match(/(\d)\1*|D+|F+|[NEWS]+/g)||[];
    parts.forEach(part=>{
      if(/^[NEWS]+$/.test(part)){
        const w=part[0],cnt=part.length;
        rkPushDecoded(groups,{type:rkGroupTypeForCount(cnt),tile:w,count:cnt,isWind:true},tokenIndex);
        return;
      }
      if(/^D+$/.test(part)){
        const cnt=part.length;
        rkPushDecoded(groups,{type:rkGroupTypeForCount(cnt),tile:"D",count:cnt,isDragon:true},tokenIndex);
        return;
      }
      if(/^F+$/.test(part)){
        const cnt=part.length;
        rkPushDecoded(groups,{type:rkGroupTypeForCount(cnt),tile:"F",count:cnt,isFlower:true},tokenIndex);
        return;
      }
      if(/^0+$/.test(part)){
        const cnt=part.length;
        rkPushDecoded(groups,{type:rkGroupTypeForCount(cnt),tile:"0",count:cnt,isSoap:true},tokenIndex);
        return;
      }
      if(/^\d+$/.test(part)){
        const d=part[0],cnt=part.length;
        if(d==="0")rkPushDecoded(groups,{type:rkGroupTypeForCount(cnt),tile:"0",count:cnt,isSoap:true},tokenIndex);
        else rkPushDecoded(groups,{type:rkGroupTypeForCount(cnt),tile:d,count:cnt,isNum:true},tokenIndex);
      }
    });
  });
  return groups;
}
function rkCardColorsForGroups(handObj,groups){
  const base=HAND_CARD_COLORS[handObj?.label]||[];
  return groups.map((g,i)=>base[g.tokenIndex]||base[i]||"K");
}
function rkConstraintText(handObj){return String(handObj?.constraint||HAND_CONSTRAINTS?.[handObj?.label]||"");}
function rkNumericCodes(groups,colors){
  return [...new Set(groups.map((g,i)=>g.isNum&&["G","R","K","B"].includes(colors[i])?colors[i]:null).filter(Boolean))];
}
function rkAllowedSuitCountsFromConstraint(txt){
  const t=String(txt||"");
  if(/Any\s+1\s+or\s+2\s+Suits/i.test(t))return new Set([1,2]);
  if(/Any\s+2\s+or\s+3\s+Suits/i.test(t))return new Set([2,3]);
  if(/Any\s+1\s+or\s+3\s+Suits/i.test(t))return new Set([1,3]);
  if(/Any\s+1\s+Suit/i.test(t))return new Set([1]);
  if(/Any\s+2\s+Suits/i.test(t))return new Set([2]);
  if(/Any\s+3\s+Suits/i.test(t))return new Set([3]);
  if(/1\s+or\s+2\s+Suits/i.test(t))return new Set([1,2]);
  if(/2\s+or\s+3\s+Suits/i.test(t))return new Set([2,3]);
  return new Set([1,2,3]);
}
function rkSuitMappingOptions(codes,handObj){
  if(!codes.length)return[{}];
  const txt=rkConstraintText(handObj);
  const allowed=rkAllowedSuitCountsFromConstraint(txt);
  const out=[];
  const walk=(idx,map)=>{
    if(idx>=codes.length){
      const used=new Set(Object.values(map));
      // The NMJL parentheses matter. If a line says Any 3 Suits, do not let a
      // 1-suit rack masquerade as that line. If it says Any 1 or 2, allow only
      // those counts. This is the credibility guardrail for Rackle.
      if(allowed.has(used.size))out.push({...map});
      return;
    }
    const code=codes[idx];
    for(const suit of RACKLE_REAL_SUITS){
      map[code]=suit;
      walk(idx+1,map);
      delete map[code];
    }
  };
  walk(0,{});
  return out.length?out:[{}];
}
function rkDragonForSuit(suit){return suit==="bam"?"Grn":suit==="crak"?"Red":"Soap";}
function rkDragonMatchesTile(t,suit){return t.t==="d"&&t.v===rkDragonForSuit(suit);}
function rkDragonOpposesTile(t,suit){return t.t==="d"&&t.v!==rkDragonForSuit(suit);}
function rkResolvedSuitForGroupIndex(groups,colors,idx,suitMap){
  const scan=(dir)=>{
    for(let i=idx+dir;i>=0&&i<groups.length;i+=dir){
      if(!groups[i].isNum)continue;
      const cc=colors[i];
      if(suitMap?.[cc])return suitMap[cc];
      if(cc==="G"||cc==="R"||cc==="B")return RACKLE_CODE_TO_DEFAULT_SUIT[cc];
      if(cc==="K")return null;
    }
    return null;
  };
  return scan(-1)||scan(1)||null;
}
function rkDragonMode(handObj){
  const txt=rkConstraintText(handObj);
  if(/Opp\.?\s*Dragon|Opposite Dragon/i.test(txt))return"opp";
  if(/Matching\s+or\s+Opp/i.test(txt))return"any";
  if(/Any\s+Dragon|Any\s+2\s+Dragons|Any\s+3\s+Dragons/i.test(txt))return"any";
  if(/Matching\s+Dragon/i.test(txt))return"match";
  return"any";
}
function makeGroupPredicate(g,cc,suitMap,groups=[],idx=0,colors=[],handObj=null){
  return (t)=>{
    if(g.isFlower)return t.t==="f";
    if(g.isSoap)return t.t==="d"&&t.v==="Soap";
    if(g.isWind)return t.t==="w"&&(g.tile?t.v===g.tile:true);
    if(g.isDragon){
      const mode=rkDragonMode(handObj);
      const refSuit=rkResolvedSuitForGroupIndex(groups,colors,idx,suitMap);
      if(!refSuit||mode==="any")return t.t==="d";
      if(mode==="opp")return rkDragonOpposesTile(t,refSuit);
      return rkDragonMatchesTile(t,refSuit);
    }
    if(g.isNum){
      if(!(t.t==="s"&&t.n===Number(g.tile)))return false;
      const mapped=suitMap?.[cc];
      if(mapped)return t.s===mapped;
      if(cc==="G"||cc==="R"||cc==="B")return t.s===RACKLE_CODE_TO_DEFAULT_SUIT[cc];
      return true;
    }
    return false;
  };
}
function rkSamePhysicalTile(a,b){
  return a===b;
}

// ─── VARIANT EXPANSION: turn each printed NMJL line into all playable number variants ───
// The printed card uses placeholder numbers in many lines (Any 3 Consecutive Nos.,
// Any Like Nos., Pair 3/6/9, Kong 2/4/6/8). The old resolver read those
// labels too literally. This expansion lets the engine evaluate the whole rack
// against the actual playable variants before choosing a path.
function rkDigitsInLabel(label){return [...new Set(String(label||"").match(/[1-9]/g)||[])].map(Number).sort((a,b)=>a-b);}
function rkReplaceDigits(label,map){return String(label||"").replace(/[1-9]/g,d=>String(map[Number(d)]??d));}
function rkRepeatDigit(n,count){return String(n).repeat(count);}
function rkUniqueVariants(labels){
  const seen=new Set();
  return labels.filter(l=>{const k=String(l).replace(/\s+/g," ").trim();if(seen.has(k))return false;seen.add(k);return true;});
}
function rkConsecutiveVariantLabels(base,len){
  const digits=rkDigitsInLabel(base);
  if(!digits.length||!len)return[];
  // Map the distinct printed digits in order onto a moving consecutive window.
  // Example: 111 222 3333 4444 + Any 4 Consec => 111/222/3333/4444 through 666/777/8888/9999.
  const out=[];
  for(let start=1;start<=10-len;start++){
    const map={};
    digits.forEach((d,i)=>{map[d]=start+Math.min(i,len-1);});
    out.push(rkReplaceDigits(base,map));
  }
  return out;
}
function rkLikeNumberVariantLabels(base,nums){
  const digits=rkDigitsInLabel(base);
  if(!digits.length)return[];
  const out=[];
  nums.forEach(n=>{
    const map={};
    digits.forEach(d=>{map[d]=n;});
    out.push(rkReplaceDigits(base,map));
  });
  return out;
}
function rkExpandHandVariants(handObj){
  if(!handObj)return[];
  const base=String(handObj.baseLabel||handObj.label||"").trim();
  const txt=rkConstraintText(handObj);
  const out=[base];

  // Consecutive-number hands. Do not move fixed "These Nos. Only" lines.
  const consec=txt.match(/Any\s+(\d+)\s+Consec/i);
  if(consec && !/These\s+Nos\.\s+Only/i.test(txt)){
    out.push(...rkConsecutiveVariantLabels(base,parseInt(consec[1],10)));
  }

  // Any Like Numbers families.
  if(/Any\s+Like\s+Odd\s+Nos/i.test(txt))out.push(...rkLikeNumberVariantLabels(base,[1,3,5,7,9]));
  else if(/Any\s+Like\s+Even\s+Nos/i.test(txt))out.push(...rkLikeNumberVariantLabels(base,[2,4,6,8]));
  else if(/Any\s+Like\s+Nos|Any\s+Like\s+No\b/i.test(txt))out.push(...rkLikeNumberVariantLabels(base,[1,2,3,4,5,6,7,8,9]));

  // Exact card bracket variants that are not captured by the generic text.
  if(base==="2468 2222 D 2222 D"){
    [2,4,6,8].forEach(n=>out.push(`2468 ${rkRepeatDigit(n,4)} D ${rkRepeatDigit(n,4)} D`));
  }
  if(base==="FFF 2468 FFF 2222"){
    [2,4,6,8].forEach(n=>out.push(`FFF 2468 FFF ${rkRepeatDigit(n,4)}`));
  }
  if(base==="FF 3369 3333 3333"){
    [3,6,9].forEach(n=>{
      const others=[3,6,9].filter(x=>x!==n);
      out.push(`FF ${n}${n}${others.join("")} ${rkRepeatDigit(n,4)} ${rkRepeatDigit(n,4)}`);
    });
  }
  if(base==="113579 1111 1111"){
    [1,3,5,7,9].forEach(n=>{
      const others=[1,3,5,7,9].filter(x=>x!==n);
      out.push(`${n}${n}${others.join("")} ${rkRepeatDigit(n,4)} ${rkRepeatDigit(n,4)}`);
    });
  }
  if(base==="11111 44444 DDDD"){
    for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)if(a!==b)out.push(`${rkRepeatDigit(a,5)} ${rkRepeatDigit(b,5)} DDDD`);
  }
  if(base==="NN EE WW SS 1D 1D 1D"){
    for(let n=1;n<=9;n++)out.push(`NN EE WW SS ${n}D ${n}D ${n}D`);
  }

  // Attach metadata without mutating the catalog object.
  return rkUniqueVariants(out).map(label=>({
    ...handObj,
    baseLabel:base,
    variantLabel:label,
    labelForDisplay:label,
  }));
}

function rkGroupNuance(plan){
  const statuses=plan?.groupStatus||[];
  const nonSingles=statuses.filter(s=>s.g?.type!=="single");
  const completedGroups=statuses.filter(s=>s.gap<=0).length;
  const completedNonSingles=nonSingles.filter(s=>s.gap<=0).length;
  const completedPairs=nonSingles.filter(s=>s.gap<=0&&s.g?.type==="pair").length;
  const completedBigGroups=nonSingles.filter(s=>s.gap<=0&&["pung","kong","quint","sextet"].includes(s.g?.type)).length;
  const partialGroups=nonSingles.filter(s=>s.gap>0&&s.totalHeld>0).length;
  const promisingGroups=nonSingles.filter(s=>s.totalHeld>=2).length;
  const singleSlots=statuses.filter(s=>s.g?.type==="single");
  const heldSingles=singleSlots.filter(s=>s.totalHeld>0).length;
  const deadGroups=statuses.filter(s=>s.totalHeld<=0).length;
  const naturalOnlyGap=statuses.filter(s=>!s.jokerAllowed).reduce((a,s)=>a+Math.max(0,s.gap||0),0);
  const hardGap=statuses.filter(s=>s.g?.type==="single"||s.g?.type==="pair"||!s.jokerAllowed).reduce((a,s)=>a+Math.max(0,s.gap||0),0);
  const held=plan?.held||0;
  const total=plan?.total||0;
  const pct=plan?.pct||0;
  const groupedHeld=nonSingles.reduce((a,s)=>a+(s.totalHeld||0),0);
  const singleHeld=singleSlots.reduce((a,s)=>a+(s.totalHeld||0),0);
  const groupedRatio=held?groupedHeld/held:0;
  const suitSpread=new Set(statuses.filter(s=>s.g?.isNum&&s.totalHeld>0).map(s=>s.resolvedSuit).filter(Boolean)).size;
  const isCR=plan?.sectionId==="cr"||/Consec/i.test(plan?.constraint||"");
  const lacksGroupStrength=(pct>=45&&completedBigGroups===0&&completedPairs<2)||(pct>=50&&completedNonSingles<2&&promisingGroups<2);
  const earlyShape=(pct>=42&&held>=5&&!lacksGroupStrength);
  const strongShape=(pct>=62&&completedNonSingles>=2&&(completedBigGroups>=1||promisingGroups>=3));
  const liveShape=(pct>=70&&completedNonSingles>=2&&completedBigGroups>=1);
  return {completedGroups,completedNonSingles,completedPairs,completedBigGroups,partialGroups,promisingGroups,heldSingles,deadGroups,naturalOnlyGap,hardGap,groupedHeld,singleHeld,groupedRatio,suitSpread,isCR,lacksGroupStrength,earlyShape,strongShape,liveShape,held,total,pct};
}
function rkCoverageScore(plan){
  if(!plan||!plan.total)return 0;
  const n=rkGroupNuance(plan);
  const statuses=plan.groupStatus||[];
  // Prefer racks with real pair/pung/kong shape over racks that merely touch many singles.
  // This prevents a loose 1-2-3-4 spread from being called a live Consecutive Run hand.
  const completedHard=statuses.filter(s=>s.gap<=0&&(s.g.type==="single"||s.g.type==="pair"||!s.jokerAllowed)).length;
  let score=(plan.pct||0)*1000;
  score+=n.completedNonSingles*1150;
  score+=n.completedBigGroups*1550;
  score+=n.promisingGroups*420;
  score+=completedHard*250;
  score+=n.groupedHeld*85;
  score+=n.suitSpread*90;
  score-=n.naturalOnlyGap*320;
  score-=n.deadGroups*240;
  score-=n.singleHeld*35;
  if(n.lacksGroupStrength)score-=1800;
  if(n.isCR&&n.completedNonSingles<2)score-=1200;
  return score;
}
function rkPlanCredibility(plan){
  if(!plan||!plan.total)return 0;
  const n=rkGroupNuance(plan);
  let score=plan.pct||0;
  score+=n.completedNonSingles*8;
  score+=n.completedBigGroups*10;
  score+=n.promisingGroups*4;
  score+=Math.min(n.groupedHeld*1.4,14);
  score-=n.deadGroups*3;
  score-=n.naturalOnlyGap*2.5;
  score-=n.singleHeld>n.groupedHeld?8:0;
  if(n.lacksGroupStrength)score-=18;
  if(n.isCR&&n.completedNonSingles<2)score-=14;
  return Math.max(0,Math.min(100,Math.round(score)));
}
function rkIsCrediblePath(plan,{primary=false}={}){
  if(!plan||!plan.total)return false;
  const n=rkGroupNuance(plan);
  const minPct=primary?34:48;
  if(n.pct<minPct)return false;
  if(n.held<6&&!primary)return false;
  // For learning, a starting shape can be shown, but not as a strong alternate.
  if(!primary&&n.lacksGroupStrength&&n.pct<64)return false;
  if(!primary&&n.completedNonSingles<2&&n.pct<68)return false;
  if(n.completedGroups<1&&n.pct<58)return false;
  if(n.naturalOnlyGap>=7&&n.pct<66)return false;
  return true;
}
function rkCoachPathTone(plan,primary=false){
  const cred=rkPlanCredibility(plan);
  const n=rkGroupNuance(plan);
  if(n.liveShape&&cred>=74)return{label:"Clean path",short:"Live",color:C.jade,desc:"This was a real lane. You had useful tiles and enough group strength to keep building."};
  if(n.strongShape&&cred>=60)return{label:"Worth keeping",short:"Live",color:C.gold,desc:"This line stayed alive. A few more connected tiles would make it much stronger."};
  if(n.earlyShape||n.lacksGroupStrength)return{label:primary?"Shape starting":"Soft maybe",short:"Maybe",color:C.gold,desc:"Good instincts. The shape was starting, but it needed more pair, pung, or kong strength before forcing it."};
  if(cred>=42)return{label:primary?"Learning read":"Soft maybe",short:"Maybe",color:C.gold,desc:"There was a useful clue here, but it needed more help before chasing it."};
  return{label:"Table lesson",short:"Learn",color:C.mut,desc:"Useful to notice, but too far away to chase hard from this rack."};
}
function rkShortCoachLine(plan){
  const n=rkGroupNuance(plan);
  if(n.liveShape)return"Nice read. You had real group strength, not just connected tiles.";
  if(n.strongShape)return"Worth keeping alive. Your groups were starting to do real work.";
  if(n.lacksGroupStrength)return"You saw the right neighborhood. Next time, wait for pairs to become pungs before committing.";
  if(n.completedNonSingles>=1)return"A real clue was there. Keep watching for the next matching tile.";
  return"Good table lesson. The rack hinted at this line, but it was not ready yet.";
}
function buildCoveragePlan(rack,handObj,passLog=[]){
  if(!rack||!handObj)return{held:0,total:0,pct:0,groups:[],groupStatus:[],suitMap:{},cardColors:[],variantLabel:handObj?.label};
  const allPassed=(passLog||[]).flatMap((p,idx)=>(p.out||p.passedTiles||[]).map(t=>({...t,roundName:p.label||p.roundName||`Pass ${idx+1}`,roundIdx:idx})));
  let best=null;

  for(const variantObj of rkExpandHandVariants(handObj)){
    const groups=decodeHandLabel(variantObj.variantLabel||variantObj.label,variantObj.sec);
    const cardColors=rkCardColorsForGroups(variantObj,groups);
    const codes=rkNumericCodes(groups,cardColors);

    for(const suitMap of rkSuitMappingOptions(codes,variantObj)){
      const rackPool=[...(rack||[])];
      const pull=(pred,need)=>{
        let f=0;const r=[];
        for(const t of rackPool){if(f<need&&pred(t)){f++;}else r.push(t);}
        rackPool.length=0;rackPool.push(...r);
        return f;
      };
      const groupStatus=[];
      let held=0,total=0,completedGroups=0;
      groups.forEach((g,gi)=>{
        const cc=cardColors[gi]||"K";
        const pred=makeGroupPredicate(g,cc,suitMap,groups,gi,cardColors,variantObj);
        const need=g.count;
        total+=need;
        const naturalHeld=pull(pred,need);
        const jokerAllowed=!variantObj.concealed&&g.type!=="single"&&g.type!=="pair";
        const jokerHeld=jokerAllowed?pull(t=>t.t==="j",need-naturalHeld):0;
        const totalHeld=naturalHeld+jokerHeld;
        held+=totalHeld;
        const gap=need-totalHeld;
        if(gap<=0)completedGroups++;
        const passedMatching=allPassed.filter(t=>pred(t));
        const passedRounds=[...new Set(passedMatching.map(t=>t.roundName))];
        groupStatus.push({g,gi,cc,need,totalHeld,naturalHeld,jokerHeld,gap,passedMatching,passedRounds,resolvedSuit:suitMap?.[cc]||null,jokerAllowed});
      });
      const pct=total>0?Math.round(held/total*100):0;
      const candidate={
        held,total,pct,groups,groupStatus,
        suitMap:{...suitMap},cardColors,
        sectionId:variantObj.sec||handObj.sec,
        constraint:rkConstraintText(variantObj)||rkConstraintText(handObj),
        concealed:!!variantObj.concealed,
        variantLabel:variantObj.variantLabel||variantObj.label,
        baseLabel:variantObj.baseLabel||handObj.label,
        labelForDisplay:variantObj.variantLabel||variantObj.label,
        completedGroups,
      };
      candidate.groupNuance=rkGroupNuance(candidate);
      candidate.score=rkCoverageScore(candidate);
      if(!best||candidate.score>best.score)best=candidate;
    }
  }
  return best||{held:0,total:0,pct:0,groups:[],groupStatus:[],suitMap:{},cardColors:[],variantLabel:handObj.label,labelForDisplay:handObj.label};
}
function rkEnhancedHandFit(rack,handObj){
  const plan=buildCoveragePlan(rack,handObj,[]);
  if(!plan.total)return 0;
  // Coverage is the main signal. Completed groups add expert preference without
  // hiding the fact that a hand still needs natural singles/pairs.
  const completed=plan.groupStatus.filter(s=>s.gap<=0).length;
  const groupBonus=Math.min(completed*0.012,0.08);
  return Math.min(1,(plan.held/plan.total)+groupBonus);
}
if(typeof HAND_CATALOG!=="undefined"&&!HAND_CATALOG.__rackle2026ResolverInstalled){
  HAND_CATALOG.forEach(h=>{
    const legacy=h.fit;
    h.legacyFit=legacy;
    h.fitDetail=(rack)=>buildCoveragePlan(rack,h,[]);
    // Use the card-variant resolver as the source of truth. Legacy fit can be
    // useful for debugging, but it was too broad for suit variants and dragons.
    h.fit=(rack)=>rkEnhancedHandFit(rack,h);
  });
  HAND_CATALOG.__rackle2026ResolverInstalled=true;
}

function HandGroupChips({group, cardColor}){
  // Map color code to actual color
  const col=
    group.isFlower?CARD_COL.F:
    group.isSoap?CARD_COL.S:
    group.isWind?CARD_COL.W:
    group.isDragon?CARD_COL.D:
    cardColor?CARD_COL[cardColor]||CARD_COL.K:CARD_COL.K;

  // Background tint per color
  const bgTint=
    group.isFlower?"#F4EFFC":
    group.isSoap?"#F5F3F0":
    group.isWind?"#F0EDE8":
    group.isDragon?"#FEF0F0":
    cardColor==="G"?"#EDF5F0":
    cardColor==="R"?"#FEF0F0":
    "#F8F5F0";

  const label=
    group.isFlower?"🌸":
    group.isWind?group.tile:
    group.isSoap?"白":
    group.isDragon?"龍":
    group.tile;

  const sub=
    group.isFlower?"Flower":
    group.isWind?{N:"North",E:"East",W:"West",S:"South"}[group.tile]||"Wind":
    group.isSoap?"Soap":
    group.isDragon?"Dragon":
    cardColor==="G"?"Bam":cardColor==="R"?"Crak":cardColor==="K"?"Any":"";

  const tiles=Array.from({length:group.count});
  const typeLabel=GROUP_TYPES[group.type]?.name||group.type;
  const jokerNote=GROUP_TYPES[group.type]?.jokerOk&&group.count>=3?" ✓":""

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{display:"flex",gap:2}}>
        {tiles.map((_,i)=>(
          <div key={i} style={{
            width:26,height:36,borderRadius:5,
            background:`linear-gradient(160deg,#fff,${bgTint})`,
            border:`1.5px solid ${col}35`,
            boxShadow:`0 1px 3px ${col}15`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,
          }}>
            <span style={{fontSize:group.isFlower?14:12,fontWeight:800,color:col,lineHeight:1}}>{label}</span>
            {sub&&<span style={{fontSize:5.5,color:col,opacity:0.6,fontWeight:700,marginTop:1,letterSpacing:0.2}}>{sub}</span>}
          </div>
        ))}
      </div>
      <div style={{fontSize:7.5,color:C.mut,fontWeight:600,textAlign:"center",lineHeight:1.2}}>{typeLabel}{jokerNote}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VISUAL HAND RENDERER, shows a completed hand as tiles + plain-English breakdown
// ════════════════════════════════════════════════════════════════════════════
function HandRenderer({hand, defaultOpen=false}){
  const [open,setOpen]=useState(defaultOpen);
  const sec=SECS.find(s=>s.id===hand.sec);
  const groups=decodeHandLabel(hand.label,hand.sec);
  const totalTiles=groups.reduce((a,g)=>a+g.count,0);

  // Card color sequence for this hand
  const cardColors=HAND_CARD_COLORS[hand.label]||[];

  // Build plain-English breakdown
  const breakdown=groups.map((g,gi)=>{
    const cnt=g.count;
    const typeInfo=GROUP_TYPES[g.type]||{name:g.type,jokerOk:false,desc:""};
    const cc=cardColors[gi];
    const suitName=cc==="G"?"Bam":cc==="R"?"Crak":cc==="K"?"any suit":"";
    let tileDesc="";
    if(g.isFlower) tileDesc=`${cnt===6?"Sextet of":cnt===3?"Pung of":cnt===2?"Pair of":"Kong of"} Flowers`;
    else if(g.isSoap) tileDesc=`${typeInfo.name} of Soap (White Dragon / 0)`;
    else if(g.isDragon) tileDesc=`${typeInfo.name} of Dragons (matching suit)`;
    else if(g.isWind) tileDesc=cnt===1?`${g.tile} Wind (single)`:`${typeInfo.name} of ${g.tile} Winds`;
    else if(g.isNum&&g.type==="single") tileDesc=`${g.tile}, single tile, no joker${suitName?" ("+suitName+")":""}`;
    else if(g.isNum) tileDesc=`${typeInfo.name} of ${g.tile}s${suitName?" ("+suitName+")":""}${typeInfo.jokerOk?", jokers ok":", natural only"}`;
    return{...g,tileDesc,typeInfo,cardColor:cc};
  });

  // Colored label, mirrors the card's color coding in the collapsed header
  const coloredLabel=groups.map((g,gi)=>{
    const cc=cardColors[gi];
    const col=cc?CARD_COL[cc]||C.ink:
      g.isFlower?CARD_COL.F:g.isSoap?CARD_COL.S:g.isWind?CARD_COL.W:g.isDragon?CARD_COL.D:C.ink;
    const text=g.isFlower?"F".repeat(g.count):
      g.isSoap?"0".repeat(g.count):
      g.isWind?g.tile.repeat(g.count):
      g.isDragon?"D".repeat(g.count):
      g.tile.repeat(g.count);
    return{text,col,gi};
  });

  return(
    <div className={open?"rk-hand-card rk-hand-card-open":"rk-hand-card"}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"13px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{flex:1,minWidth:0}}>
          {/* Colored label matching card color scheme */}
          <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",marginBottom:2}}>
            <span style={{fontFamily:F.d,fontSize:13,fontWeight:800,letterSpacing:-0.3}}>
              {coloredLabel.map((t,i)=>(
                <span key={i} style={{color:t.col}}>{t.text}{i<coloredLabel.length-1?" ":""}</span>
              ))}
            </span>
            {hand.concealed&&<span style={{fontSize:8,fontWeight:700,background:"#2460A815",color:"#2460A8",borderRadius:8,padding:"2px 6px",flexShrink:0}}>CONCEALED</span>}
            <span style={{fontSize:8,fontWeight:700,background:C.bg2,color:C.mut,borderRadius:8,padding:"2px 6px",flexShrink:0}}>{hand.concealed?"C":"×"}{hand.value}</span>
          </div>
          <div style={{fontSize:10,color:C.mut,lineHeight:1.45}}>{sec?.name} · {hand.constraint?hand.constraint.split(" · ")[0]:`${totalTiles} tiles`}</div>
        </div>
        <span style={{fontSize:11,color:C.mut,flexShrink:0,marginLeft:8}}>{open?"▾":"▸"}</span>
      </button>

      {open&&<div className="rk-in" style={{borderTop:`1px solid ${C.bdr}`}}>
        {/* Suit/rule constraint banner */}
        {hand.constraint&&(
          <div style={{padding:"7px 14px",background:`linear-gradient(135deg,${sec?.color||C.jade}10,${sec?.color||C.jade}06)`,borderBottom:`1px solid ${sec?.color||C.jade}18`,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,flexShrink:0}}>📋</span>
            <span style={{fontSize:11,fontWeight:600,color:sec?.color||C.jade}}>{hand.constraint}</span>
          </div>
        )}

        {/* Color key */}
        {cardColors.some(c=>c==="G"||c==="R")&&(
          <div style={{padding:"5px 14px",background:"#FDFAF6",borderBottom:`1px solid ${C.bdr}`,display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:9,color:C.mut,fontWeight:600,letterSpacing:0.5}}>COLOR KEY:</span>
            {cardColors.includes("G")&&<span style={{fontSize:9,fontWeight:700,color:CARD_COL.G}}>■ Green = Suit A (e.g. Bam)</span>}
            {cardColors.includes("R")&&<span style={{fontSize:9,fontWeight:700,color:CARD_COL.R}}>■ Red = Suit B (e.g. Crak)</span>}
            {cardColors.includes("K")&&<span style={{fontSize:9,fontWeight:700,color:C.mut}}>■ Black = Any suit</span>}
          </div>
        )}

        {/* Visual tile display */}
        <div style={{padding:"12px 14px",background:C.bg2,overflowX:"hidden"}}>
          <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>COMPLETED HAND</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
            {groups.map((g,i)=>(
              <HandGroupChips key={i} group={g} cardColor={cardColors[i]}/>
            ))}
          </div>
        </div>

        {/* Plain-English breakdown */}
        <div style={{padding:"10px 14px"}}>
          <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>WHAT YOU NEED</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {breakdown.map((g,i)=>{
              const cc=g.cardColor;
              const dotCol=cc?CARD_COL[cc]||C.jade:g.isFlower?CARD_COL.F:g.isDragon?CARD_COL.D:g.isWind?CARD_COL.W:C.jade;
              return(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 8px",background:C.bg2,borderRadius:8}}>
                  <div style={{width:20,height:20,borderRadius:10,background:dotCol+"20",border:`1px solid ${dotCol}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:dotCol,flexShrink:0,marginTop:1}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.ink,lineHeight:1.3}}>{g.tileDesc}</div>
                    <div style={{fontSize:10,color:C.mut,lineHeight:1.4,marginTop:1}}>{g.typeInfo.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Concealed warning */}
          {hand.concealed&&<div style={{marginTop:8,background:"#2460A808",borderRadius:8,padding:"8px 10px",border:`1px solid #2460A820`}}>
            <div style={{fontSize:9,color:"#2460A8",letterSpacing:1.5,fontWeight:700,marginBottom:3}}>🔒 CONCEALED HAND</div>
            <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>You can never claim a discarded tile for this hand, every tile must be drawn from the wall. Plan for a longer game and never expose any group.</div>
          </div>}

          {/* Joker guidance */}
          {!hand.concealed&&<div style={{marginTop:8,background:C.jade+"06",borderRadius:8,padding:"8px 10px"}}>
            <div style={{fontSize:9,color:C.jade,letterSpacing:1.5,fontWeight:700,marginBottom:3}}>🃏 JOKER RULES FOR THIS HAND</div>
            <div style={{fontSize:11,color:C.ink,lineHeight:1.5}}>
              {breakdown.filter(g=>g.typeInfo.jokerOk).length>0
                ?`Jokers can substitute in: ${breakdown.filter(g=>g.typeInfo.jokerOk).map(g=>g.tileDesc.split(" ,")[0]).slice(0,3).join(", ")}. Jokers can NEVER go in pairs or singles.`
                :"This hand has no joker-eligible groups, all tiles must be natural."}
            </div>
          </div>}
        </div>
      </div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GLOSSARY SCREEN, plain-English mahjong terms with tile examples
// ════════════════════════════════════════════════════════════════════════════
const GLOSSARY_TERMS=[
  {term:"Pung",emoji:"🀄",short:"3 identical tiles",detail:"Three of the same tile. You can use 1-2 jokers to complete a pung. Example: three 6-Bam tiles, or two 6-Bam + one Joker.",tiles:[{t:"s",s:"bam",n:6},{t:"s",s:"bam",n:6},{t:"s",s:"bam",n:6}]},
  {term:"Kong",emoji:"🀄",short:"4 identical tiles",detail:"Four of the same tile. You can use up to 3 jokers. Kong hands score higher than pungs. Example: four 8-Crak, or three 8-Crak + one Joker.",tiles:[{t:"s",s:"crak",n:8},{t:"s",s:"crak",n:8},{t:"s",s:"crak",n:8},{t:"s",s:"crak",n:8}]},
  {term:"Pair",emoji:"🩵",short:"2 identical tiles, natural only",detail:"Two of the same tile. Pairs can NEVER include jokers, both tiles must be real, matching tiles. This is the most important joker rule to remember.",tiles:[{t:"s",s:"dot",n:4},{t:"s",s:"dot",n:4}]},
  {term:"Quint",emoji:"🟣",short:"5 identical tiles, needs jokers",detail:"Five of the same tile. There are only 4 of any number tile in the deck, so you always need at least 1 joker. Quint hands are powerful but require 2+ jokers to build.",tiles:[{t:"s",s:"bam",n:3},{t:"s",s:"bam",n:3},{t:"s",s:"bam",n:3},{t:"s",s:"bam",n:3},{t:"j"}]},
  {term:"Sextet",emoji:"🌸",short:"6 identical tiles",detail:"Six of the same tile, usually Flowers. The Flower sextette (six Flowers in a row) is one of the most satisfying hands in the game. Requires jokers to complete.",tiles:[{t:"f"},{t:"f"},{t:"f"},{t:"f"},{t:"f"},{t:"f"}]},
  {term:"Single",emoji:"1️⃣",short:"1 tile standing alone",detail:"A single tile by itself, not grouped. Singles appear in specific hand patterns like '2026' where you need exactly one 2, one Soap, one 2, and one 6. No jokers allowed.",tiles:[{t:"s",s:"crak",n:2},{t:"d",v:"Soap"},{t:"s",s:"bam",n:2},{t:"s",s:"dot",n:6}]},
  {term:"Joker",emoji:"🃏",short:"Wild tile, but not in pairs",detail:"A joker can substitute for any tile in a pung, kong, quint, or sextet, but NEVER in a pair or single. You cannot pass jokers during the Charleston. In Singles & Pairs, jokers are completely useless.",tiles:[{t:"j"},{t:"j"}]},
  {term:"Flower",emoji:"🌸",short:"Special tile, interchangeable",detail:"All 8 Flower tiles are identical and interchangeable. They can form pairs, pungs, kongs, and sextettes. Flowers appear in the majority of NMJL sections, they're almost always worth holding.",tiles:[{t:"f"},{t:"f"},{t:"f"}]},
  {term:"Soap",emoji:"白",short:"White Dragon = 0 in year hands",detail:"The White Dragon (called 'Soap') acts as zero in year hands (2026 section). It's suit-wild, it counts in any suit. Outside the year section it has no special value, but in 2026 hands it's critical.",tiles:[{t:"d",v:"Soap"},{t:"d",v:"Soap"},{t:"d",v:"Soap"}]},
  {term:"Matching Dragon",emoji:"🐉",short:"Dragon color that matches your suit",detail:"Each suit has a matching dragon: Bam → Green Dragon, Crak → Red Dragon, Dot → Soap (White Dragon). When a hand says 'matching dragon,' you must use the dragon that corresponds to your number tile suit.",tiles:[{t:"s",s:"bam",n:5},{t:"d",v:"Grn"},{t:"d",v:"Grn"},{t:"d",v:"Grn"}]},
  {term:"Concealed",emoji:"🔒",short:"Must draw all tiles, no calling",detail:"A concealed hand cannot claim any discarded tile. You must draw every tile yourself from the wall. Never expose any group. These hands often score more points but are harder to complete.",tiles:[]},
  {term:"Open",emoji:"🔓",short:"Can claim discarded tiles",detail:"An open hand lets you call a tile someone else discards to complete a pung or kong. You then expose that group face-up. Most hands on the card are open.",tiles:[]},
  {term:"Charleston",emoji:"🔄",short:"The pre-game tile exchange",detail:"Before play begins, players pass tiles to each other in three rounds: right, across, left. Then optionally a second Charleston, then an optional courtesy pass. Rackle trains this phase.",tiles:[]},
  {term:"NEWS",emoji:"🌀",short:"All four winds in one hand",detail:"N-E-W-S means one each of North, East, West, and South wind tiles. Appears in several hands across sections. You need exactly one of each, jokers cannot substitute.",tiles:[{t:"w",v:"N"},{t:"w",v:"E"},{t:"w",v:"W"},{t:"w",v:"S"}]},
];

function GlossaryScreen({home,setScreen}){
  const [search,setSearch]=useState("");
  const [open,setOpen]=useState(null);
  const filtered=search.trim()===""?GLOSSARY_TERMS:GLOSSARY_TERMS.filter(t=>t.term.toLowerCase().includes(search.toLowerCase())||t.short.toLowerCase().includes(search.toLowerCase()));
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{marginBottom:14,marginTop:4}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>Mahjong Glossary</div>
        <p style={{fontSize:12,color:C.mut,margin:"0 0 12px",lineHeight:1.6}}>Plain-English definitions of every term you'll see on the card.</p>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search terms…" style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${C.bdr}`,fontSize:13,fontFamily:F.b,color:C.ink,outline:"none",background:"#fff"}}/>
      </div>

      {filtered.map((term,i)=>{
        const isOpen=open===term.term;
        return(
          <div key={term.term} style={{background:"#FDFAF6",border:`1px solid ${isOpen?C.jade+"40":C.bdr}`,borderRadius:14,overflow:"hidden",marginBottom:6,transition:"border-color 0.15s"}}>
            <button onClick={()=>setOpen(isOpen?null:term.term)} aria-expanded={isOpen}
              style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:38,height:38,borderRadius:10,background:C.jade+"10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{term.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:800,color:isOpen?C.jade:C.ink,transition:"color 0.15s"}}>{term.term}</div>
                <div style={{fontSize:11,color:C.mut,marginTop:1,lineHeight:1.3}}>{term.short}</div>
              </div>
              <span style={{fontSize:12,color:C.mut,flexShrink:0}}>{isOpen?"▾":"▸"}</span>
            </button>
            {isOpen&&<div className="rk-in" style={{borderTop:`1px solid ${C.jade}20`,background:`${C.jade}04`,padding:"10px 14px"}}>
              <p style={{fontSize:12,color:C.ink,lineHeight:1.7,margin:"0 0 10px"}}>{term.detail}</p>
              {term.tiles.length>0&&(
                <div>
                  <div style={{fontSize:8,color:C.jade,letterSpacing:2,fontWeight:700,marginBottom:6}}>EXAMPLE</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{term.tiles.map((t,j)=><Ti key={j} t={t} large={false}/>)}</div>
                </div>
              )}
            </div>}
          </div>
        );
      })}
      <Footer/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION QUIZ MODE, show 13 tiles, pick the best section
// ════════════════════════════════════════════════════════════════════════════
function SectionQuizScreen({home,setScreen}){
  const ROUNDS=5;
  const [phase,setPhase]=useState("intro"); // intro | question | revealed | done
  const [qIdx,setQIdx]=useState(0);
  const [rack,setRack]=useState([]);
  const [scores,setScores]=useState([]); // [{correct,chosen,best,pct}]
  const [chosen,setChosen]=useState(null);
  const [revealed,setRevealed]=useState(false);
  const [streak,setStreakQ]=useState(0);

  const generateRack=()=>{
    const d=shuffle(buildDeck());
    return d.slice(0,13);
  };

  const startGame=()=>{
    setQIdx(0);setScores([]);setChosen(null);setRevealed(false);setPhase("question");setRack(generateRack());
  };

  const nextQuestion=()=>{
    if(qIdx+1>=ROUNDS){setPhase("done");return;}
    setQIdx(q=>q+1);setChosen(null);setRevealed(false);setRack(generateRack());
  };

  const pick=(secId)=>{
    if(chosen)return;
    setChosen(secId);
    // Score all sections
    const secScores=SECS.map(s=>({...s,score:s.ck(rack)})).sort((a,b)=>b.score-a.score);
    const best=secScores[0];
    const chosenScore=secScores.find(s=>s.id===secId);
    const isCorrect=secId===best.id||((chosenScore?.score||0)>=best.score*0.9);
    setScores(prev=>[...prev,{correct:isCorrect,chosen:secId,best:best.id,chosenScore:chosenScore?.score||0,bestScore:best.score,allScores:secScores}]);
    if(isCorrect)setStreakQ(s=>s+1); else setStreakQ(0);
    setRevealed(true);
  };

  const secScoresForRack=rack.length?SECS.map(s=>({...s,score:s.ck(rack)})).sort((a,b)=>b.score-a.score):[];
  const best=secScoresForRack[0];
  const lastResult=scores[scores.length-1];
  const correctCount=scores.filter(s=>s.correct).length;
  const totalAnswered=scores.length;

  if(phase==="intro") return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{textAlign:"center",padding:"32px 0 24px"}}>
        <div style={{fontSize:48,marginBottom:12}}>🧠</div>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:8}}>Section Quiz</div>
        <div style={{fontSize:13,color:C.mut,lineHeight:1.7,maxWidth:280,margin:"0 auto 24px"}}>You'll see a random rack of 13 tiles. Pick the section your tiles fit best. {ROUNDS} rounds, see how sharp your read is.</div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:24,flexWrap:"wrap"}}>
          {[{icon:"👁",label:"Read the rack"},{icon:"🎯",label:"Pick your section"},{icon:"📊",label:"See the fit scores"}].map((s,i)=>(
            <div key={i} style={{textAlign:"center",width:90}}>
              <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:10,color:C.mut,fontWeight:600,lineHeight:1.3}}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={startGame} style={{...S.greenBtn,padding:"13px 40px",display:"inline-block"}}>Start Quiz →</button>
      </div>
      <Footer/>
    </div>
  );

  if(phase==="done") return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div style={{textAlign:"center",padding:"28px 0 20px"}}>
        <div style={{fontSize:48,marginBottom:10}}>{correctCount>=4?"🏆":correctCount>=3?"🎯":correctCount>=2?"👍":"📚"}</div>
        <div style={{fontFamily:F.d,fontSize:24,fontWeight:900,color:C.ink,letterSpacing:-0.5,marginBottom:4}}>{correctCount}/{ROUNDS} correct</div>
        <div style={{fontSize:13,color:C.mut,marginBottom:20}}>{correctCount>=4?"Sharp read, your section instincts are strong.":correctCount>=3?"Good eye. A little more practice and you'll be automatic.":correctCount>=2?"Getting there. Focus on what tiles each section needs.":"Keep studying, the pattern recognition comes with reps."}</div>
      </div>
      {/* Round-by-round review */}
      <div style={{...S.card,marginBottom:12}}>
        <div style={{fontSize:8,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:10}}>ROUND REVIEW</div>
        {scores.map((s,i)=>{
          const bestSec=SECS.find(sec=>sec.id===s.best);
          const chosenSec=SECS.find(sec=>sec.id===s.chosen);
          return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<scores.length-1?`1px solid ${C.bdr}`:"none"}}>
              <span style={{fontSize:16,flexShrink:0}}>{s.correct?"✅":"❌"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:C.ink}}>Round {i+1}: You picked {chosenSec?.icon} {chosenSec?.name}</div>
                {!s.correct&&<div style={{fontSize:10,color:C.cinn,marginTop:1}}>Best fit: {bestSec?.icon} {bestSec?.name} ({Math.round(s.bestScore*100)}%)</div>}
                {s.correct&&<div style={{fontSize:10,color:C.jade,marginTop:1}}>Correct, {Math.round(s.chosenScore*100)}% fit</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={startGame} style={{...S.greenBtn,flex:2}}>Play Again →</button>
        <button onClick={home} style={{...S.oBtn,flex:1}}>Home</button>
      </div>
      <Footer/>
    </div>
  );

  // question / revealed phase
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      {/* Progress */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:10,color:C.mut,fontWeight:700}}>Round {qIdx+1} of {ROUNDS}</span>
        <span style={{fontSize:10,fontWeight:700,color:C.jade}}>{correctCount} correct</span>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:12}}>
        {Array.from({length:ROUNDS}).map((_,i)=>(
          <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<totalAnswered?(scores[i]?.correct?C.jade:C.cinn):i===qIdx?C.gold:C.bdr}}/>
        ))}
      </div>

      {/* The rack */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:8,color:C.mut,letterSpacing:2.5,fontWeight:700}}>YOUR RACK (13 TILES)</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",maxWidth:"100%",overflowX:"hidden"}}>
          {sortHand(rack).map((t,i)=><Ti key={i} t={t} large={false}/>)}
        </div>
      </div>

      {/* Section picker */}
      {!revealed&&(
        <div style={{marginBottom:8}}>
          <div style={{fontSize:9,color:C.mut,letterSpacing:2,fontWeight:700,marginBottom:8}}>WHICH SECTION FITS BEST?</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {SECS.map(s=>(
              <button key={s.id} onClick={()=>pick(s.id)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:12,border:`1.5px solid ${C.bdr}`,background:"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                <span style={{fontSize:18,flexShrink:0}}>{s.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.ink,lineHeight:1.2}}>{s.name}</div>
                  <div style={{fontSize:9,color:C.mut,lineHeight:1.2,marginTop:1}}>{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reveal */}
      {revealed&&lastResult&&(()=>{
        const isCorrect=lastResult.correct;
        const bestSec=SECS.find(s=>s.id===lastResult.best);
        const chosenSec=SECS.find(s=>s.id===lastResult.chosen);
        return(
          <div className="rk-in">
            <div style={{...S.card,marginBottom:8,borderColor:isCorrect?C.jade+"40":C.cinn+"40",background:isCorrect?C.jade+"06":C.cinn+"06"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:24}}>{isCorrect?"✅":"❌"}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:isCorrect?C.jade:C.cinn}}>{isCorrect?"Correct!":"Not quite"}</div>
                  <div style={{fontSize:11,color:C.mut}}>
                    {isCorrect?`${chosenSec?.name} was the best fit.`:`Best fit: ${bestSec?.icon} ${bestSec?.name} (${Math.round(lastResult.bestScore*100)}%)`}
                  </div>
                </div>
              </div>
              {/* All section scores */}
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {lastResult.allScores.slice(0,5).map((s,i)=>{
                  const pct=Math.round(s.score*100);
                  const isChosen=s.id===lastResult.chosen;
                  const isBest=i===0;
                  return(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontSize:12,flexShrink:0}}>{s.icon}</span>
                      <span style={{fontSize:10,fontWeight:isChosen||isBest?700:400,color:isChosen?C.jade:C.ink,minWidth:80,flexShrink:0}}>{s.name}</span>
                      <div style={{flex:1,height:4,borderRadius:2,background:C.bg2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,borderRadius:2,background:isBest?C.jade:isChosen?C.cinn:C.bdr}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:isBest||isChosen?700:400,color:isBest?C.jade:isChosen?C.cinn:C.mut,minWidth:28,textAlign:"right",fontFamily:F.d}}>{pct}%</span>
                      {isChosen&&!isBest&&<span style={{fontSize:8,color:C.cinn,fontWeight:700}}>←you</span>}
                      {isBest&&<span style={{fontSize:8,color:C.jade,fontWeight:700}}>best</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={nextQuestion} style={{...S.greenBtn,width:"100%"}}>
              {qIdx+1>=ROUNDS?"See Results →":"Next Rack →"}
            </button>
          </div>
        );
      })()}
      <Footer/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// HOW TO PLAY SCREEN, quick friendly rules + Rackle ritual
// ════════════════════════════════════════════════════════════════════════════
function HowToPlayScreen({home,setScreen}){
  const steps=[
    {t:"Read your rack",d:"Look for groups first: pairs, pungs, kongs, Flowers, Dragons, and connected numbers. A run of singles can be interesting, but groups make a hand real."},
    {t:"Pass with purpose",d:"During the Charleston, pass tiles that do not support your strongest lane. Never pass Jokers. Be careful with 6s, Flowers, and strong pairs."},
    {t:"Score the final rack",d:"Rackle reviews your last rack against the 2026 card and shows your best path, soft maybes, and what you could watch for next time."},
    {t:"Learn one thing",d:"The goal is not perfection. The goal is one better read every day, so your table instincts keep improving."},
  ];
  const ruleCards=[
    ["🃏","Jokers","Can help pungs, kongs, quints, and sextets. Never pairs or singles."],
    ["🔒","Concealed","You must draw every tile yourself. No calling discards."],
    ["🐉","Dragons","Bam matches Green. Crak matches Red. Dot matches Soap."],
    ["🧠","Rackle read","Live means real group strength. Soft maybe means the shape is starting."],
  ];
  return(
    <div style={S.pg} className="rk-pg">
      <RackleHeader onBack={home} setScreen={setScreen}/>
      <div className="rk-browser-hero">
        <div style={{fontSize:9,letterSpacing:2.6,fontWeight:900,color:"rgba(243,212,107,.86)",marginBottom:8}}>HOW TO PLAY</div>
        <div style={{fontFamily:F.d,fontSize:28,fontWeight:900,lineHeight:1.02,letterSpacing:-.7,marginBottom:10}}>Your daily Charleston workout</div>
        <div style={{fontSize:13,lineHeight:1.65,color:"rgba(255,255,255,.72)",maxWidth:360}}>Train the part of American Mahjong that shapes the whole game: what to keep, what to pass, and when a hand is really forming.</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
        {steps.map((x,i)=>(
          <div key={x.t} className="rk-howto-step">
            <div className="rk-howto-num">{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:F.d,fontSize:18,fontWeight:900,color:C.ink,letterSpacing:-.25,marginBottom:4}}>{x.t}</div>
              <div style={{fontSize:13,lineHeight:1.65,color:C.mut}}>{x.d}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {ruleCards.map(([icon,title,copy])=>(
          <div key={title} className="rk-lux-card" style={{padding:14,borderRadius:18}}>
            <div style={{fontSize:22,marginBottom:7}}>{icon}</div>
            <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,marginBottom:4}}>{title}</div>
            <div style={{fontSize:11,lineHeight:1.55,color:C.mut}}>{copy}</div>
          </div>
        ))}
      </div>
      <div className="rk-lux-card" style={{padding:16,borderRadius:20,marginBottom:16}}>
        <div style={{fontSize:9,letterSpacing:2,fontWeight:900,color:C.jade,marginBottom:7}}>BEST WAY TO USE RACKLE</div>
        <div style={{fontFamily:F.d,fontSize:20,fontWeight:900,color:C.ink,marginBottom:7}}>Play once. Notice one thing.</div>
        <div style={{fontSize:13,lineHeight:1.65,color:C.mut}}>After each rack, focus on one coaching note. Did you protect a pair? Did you chase singles too early? Did you pass away your best section? That small feedback loop is the game.</div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setScreen("tutorial")} style={{...S.greenBtn,flex:1}}>Start Tutorial</button>
        <button onClick={()=>setScreen("handbrowser")} style={{...S.oBtn,flex:1}}>Browse Hands</button>
      </div>
      <Footer/>
    </div>
  );
}

// HAND BROWSER, visual catalog of every hand on the 2026 card
// (replaces/extends CardGuideScreen with per-hand visual rendering)
// ════════════════════════════════════════════════════════════════════════════
function HandBrowserScreen({home,setScreen}){
  const [activeSec,setActiveSec]=useState(null);
  const [search,setSearch]=useState("");
  const [onlyConcealed,setOnlyConcealed]=useState(false);
  const [compact,setCompact]=useState(true);
  const [visibleLimit,setVisibleLimit]=useState(8);

  const q=search.trim().toLowerCase();
  const allHands=HAND_CATALOG.filter(h=>{
    const sec=SECS.find(s=>s.id===h.sec);
    const matches=!q||h.label.toLowerCase().includes(q)||sec?.name.toLowerCase().includes(q)||(h.constraint||"").toLowerCase().includes(q);
    const secOk=!activeSec||h.sec===activeSec;
    const concealedOk=!onlyConcealed||h.concealed;
    return matches&&secOk&&concealedOk;
  });
  const sec=activeSec?SECS.find(s=>s.id===activeSec):null;
  const sectionCounts=SECS.map(s=>({sec:s,count:HAND_CATALOG.filter(h=>h.sec===s.id).length,concealed:HAND_CATALOG.filter(h=>h.sec===s.id&&h.concealed).length}));
  const shouldShowHands=!!(activeSec||search||onlyConcealed);
  const visibleHands=shouldShowHands?allHands.slice(0,visibleLimit):[];

  useEffect(()=>{setVisibleLimit(8);},[activeSec,search,onlyConcealed]);

  return(
    <div style={S.pg} className="rk-pg rk-mobile-safe">
      <RackleHeader onBack={home} setScreen={setScreen}/>

      <div className="rk-browser-hero rk-sweep">
        <div style={{fontSize:9,letterSpacing:2.8,fontWeight:900,color:"rgba(243,212,107,.86)",marginBottom:8}}>2026 NMJL CARD</div>
        <div style={{fontFamily:F.d,fontSize:30,fontWeight:900,lineHeight:1.02,letterSpacing:-.8,marginBottom:8}}>{sec?sec.name:"Hand Browser"}</div>
        <div style={{fontSize:13,lineHeight:1.58,color:"rgba(255,255,255,.74)",maxWidth:360,margin:"0 auto"}}>
          {sec?`${allHands.length} hands in ${sec.name}. Scan the shape first, then open the details.`:"Pick a section. Search when you know the tile, dragon, or rule."}
        </div>
        <input className="rk-browser-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search 2468, dragons, concealed, any 2 suits…" />
      </div>

      <div className="rk-browser-sticky">
        <div className="rk-hand-rail">
          {sectionCounts.map(({sec:s,count,concealed})=>(
            <button key={s.id} className={activeSec===s.id?"rk-hand-rail-card rk-hand-rail-card-active":"rk-hand-rail-card"} onClick={()=>setActiveSec(activeSec===s.id?null:s.id)}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <span style={{fontSize:10,fontWeight:900,color:s.color,background:s.color+"10",border:`1px solid ${s.color}18`,borderRadius:999,padding:"4px 8px"}}>{count}</span>
              </div>
              <div style={{fontFamily:F.d,fontSize:15,fontWeight:900,color:C.ink,lineHeight:1.05}}>{s.name}</div>
              <div style={{fontSize:10.5,color:C.mut,marginTop:4,lineHeight:1.35}}>{concealed?`${concealed} concealed · `:""}{s.hands||count} options</div>
            </button>
          ))}
        </div>
        <div className="rk-browser-filter-row">
          <button className={onlyConcealed?"rk-browser-filter-chip rk-browser-filter-chip-active":"rk-browser-filter-chip"} onClick={()=>setOnlyConcealed(v=>!v)}>🔒 Concealed</button>
          <button className={!compact?"rk-browser-filter-chip rk-browser-filter-chip-active":"rk-browser-filter-chip"} onClick={()=>setCompact(v=>!v)}>{compact?"Compact cards":"Expanded cards"}</button>
          {(activeSec||search||onlyConcealed)&&<button className="rk-browser-filter-chip" onClick={()=>{setActiveSec(null);setSearch("");setOnlyConcealed(false);}}>Clear</button>}
        </div>
      </div>

      {!shouldShowHands&&(
        <div className="rk-browser-mode-card">
          <div style={{fontSize:26,marginBottom:8}}>📋</div>
          <div style={{fontFamily:F.d,fontSize:21,fontWeight:900,color:C.ink,marginBottom:6}}>Study one section at a time</div>
          <div style={{fontSize:13,lineHeight:1.6,color:C.mut,maxWidth:330,margin:"0 auto 14px"}}>The card is easier when it feels less like a wall. Start with a section above, then scan the hands like flashcards.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <button className="rk-browser-filter-chip" onClick={()=>setActiveSec("cr")}>Start with Runs</button>
            <button className="rk-browser-filter-chip" onClick={()=>setActiveSec("2468")}>Study 2468</button>
          </div>
        </div>
      )}

      {allHands.length===0&&shouldShowHands&&(
        <div className="rk-lux-card" style={{padding:22,textAlign:"center",borderRadius:20,color:C.mut}}>No hands found. Try “dragon”, “consecutive”, “any 2 suits”, or a number like “2468”.</div>
      )}

      {shouldShowHands&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,margin:"10px 0 12px"}}>
          <div className="rk-hand-count-pill">{allHands.length} matching hands</div>
          <div style={{fontSize:11,color:C.mut,fontWeight:800}}>Showing {Math.min(visibleLimit,allHands.length)}</div>
        </div>
      )}

      {visibleHands.map((hand,i)=>(<HandRenderer key={`${hand.sec}-${hand.label}-${i}`} hand={hand} defaultOpen={!compact&&i<4}/>))}
      {shouldShowHands&&allHands.length>visibleLimit&&(<button className="rk-browser-load" onClick={()=>setVisibleLimit(v=>v+8)}>Show {Math.min(8,allHands.length-visibleLimit)} more hands →</button>)}
      {shouldShowHands&&visibleLimit>8&&allHands.length<=visibleLimit&&(<button className="rk-browser-load" onClick={()=>setVisibleLimit(8)}>Collapse list ↑</button>)}

      <div className="rk-lux-card" style={{marginTop:14,padding:16,borderRadius:20,background:"linear-gradient(145deg,#FFFFF8,#F4EFE3)",borderColor:C.gold+"30"}}>
        <div style={{fontSize:9,color:C.gold,letterSpacing:2,fontWeight:900,marginBottom:10,textAlign:"center"}}>🐉 DRAGON MATCHING GUIDE</div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {[
            {suit:"Bam",dragon:"Green Dragon",suitCol:SC.bam,dragonCol:"#1B7D4E",tiles:[{t:"s",s:"bam",n:5},{t:"d",v:"Grn"}]},
            {suit:"Crak",dragon:"Red Dragon",suitCol:SC.crak,dragonCol:"#B83232",tiles:[{t:"s",s:"crak",n:5},{t:"d",v:"Red"}]},
            {suit:"Dot",dragon:"Soap / White",suitCol:SC.dot,dragonCol:"#6B6560",tiles:[{t:"s",s:"dot",n:5},{t:"d",v:"Soap"}]},
          ].map(row=>(
            <div key={row.suit} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 10px",background:"#fff",borderRadius:13,border:`1px solid ${C.bdr}`}}>
              <div style={{display:"flex",gap:4}}>{row.tiles.map((t,i)=><Ti key={i} t={t} large={false}/>)}</div>
              <div style={{flex:1}}><span style={{fontSize:12,fontWeight:900,color:row.suitCol}}>{row.suit}</span><span style={{fontSize:11,color:C.mut}}> matches </span><span style={{fontSize:12,fontWeight:900,color:row.dragonCol}}>{row.dragon}</span></div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PERSISTENT QUICK-CARD BUTTON, floating tab always visible during live game
// (rendered inside AppShell so it overlays every screen)
// ════════════════════════════════════════════════════════════════════════════
function QuickCardButton({setScreen,screen,goBack}){
  const showOn=["home","play","stats","scorecard","lookup","handbrowser","howto","glossary","quiz"];
  if(!showOn.includes(screen))return null;
  return(
    <div style={{position:"fixed",bottom:20,right:16,zIndex:80}}>
      <button onClick={()=>screen==="handbrowser"?goBack():setScreen("handbrowser")}
        aria-label="Quick card reference"
        style={{width:48,height:48,borderRadius:24,background:screen==="handbrowser"?C.jade:"linear-gradient(135deg,#0F2016,#1B3A28)",border:`2px solid ${C.jade}50`,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s"}}>
        <span style={{fontSize:22}}>{screen==="handbrowser"?"✕":"🀄"}</span>
      </button>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function Rackle(){
  const [screen,setScreenRaw]=useState("home");
  const prevScreenRef=useRef("home");
  const setScreen=(s)=>{
    window.scrollTo(0,0);
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    prevScreenRef.current=screen;
    setScreenRaw(s);
  };
  const goBack=()=>setScreen(prevScreenRef.current||"home");
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
  const [isHydrated,setIsHydrated]=useState(false);
  const [appReady,setAppReady]=useState(false);
  const isFirstDaily=!ST.get("hadFirstDaily",false);

  // Fetch clubs and hydrate registered profile from Supabase on load.
  // Supabase is the source of truth. localStorage is only a cache.
  useEffect(()=>{
    fetchClubs();
    let cancelled=false;
    const refresh=()=>{
      setStreak(ST.get("str",0));
      setRounds(ST.get("rnd",0));
      setDDone(ST.get("dd",null)===getDailySeed());
      setDRes(ST.get("dres",null));
    };
    window.addEventListener("rackle:remoteHydrated",refresh);
    (async()=>{
      try{
        const hydrated=await rkHydrateStoredProfileFromSupabase().catch(err=>{console.warn("Remote profile hydrate failed",err);return null;});
        if(cancelled)return;
        if(hydrated?.profile){
          setStreak(hydrated.profile.streak||0);
          setRounds(hydrated.profile.roundsPlayed||0);
          if(hydrated.dailyResult){
            setDDone(true);
            setDRes(hydrated.dailyResult);
          }else{
            setDDone(ST.get("dd",null)===getDailySeed());
            setDRes(ST.get("dres",null));
          }
        }else if(getProfile()?.nickname){
          rkSyncLocalProfileToSupabase("app_load").catch(err=>console.warn("Profile sync failed",err));
        }
        const path=window.location.pathname;
        const clubMatch=path.match(/\/clubs\/(.+)/);
        if(clubMatch)setScreen("clubs");
      }finally{
        if(!cancelled){setIsHydrated(true);setAppReady(true);}
      }
    })();
    return()=>{cancelled=true;window.removeEventListener("rackle:remoteHydrated",refresh);};
  },[]);

  const onDone=(result)=>{
    // Always stamp the current play mode on completed results.
    // Older builds saved Daily results without `mode`, which made Weekly Recap show 0 dailies.
    const completedResult={...result,mode,ts:Date.now()};
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
      const localProfileBeforePost=getProfile();
      if(localProfileBeforePost?.nickname){
        rkSyncLocalProfileToSupabase("daily_before_post").catch(err=>console.warn("Profile pre-post sync failed",err));
      }
      const dailyResult={...completedResult,mode:"daily",daySeed:today,day_seed:today};
      setDDone(true);ST.set("dd",today);setDRes(dailyResult);ST.set("dres",dailyResult);
      upsertDailyResult(dailyResult,newStreak).catch(err=>console.warn("Daily result sync failed",err));
      if(isFirstDaily){ST.set("hadFirstDaily",true);}
      // Auto-post to club leaderboard if player has a club + name
      const autoCode=getClubCode();
      const profileName=getProfile()?.nickname||getProfile()?.name||null;
      const autoName=rkCurrentDisplayName?.()||getClubName()||profileName||getOrCreateAnonymousName();
      if(autoCode&&autoName&&dailyResult?.iq?.totalScore){
        upsertLBEntry(autoCode,autoName,dailyResult.iq.totalScore,dailyResult.time||0,newStreak,currentLeaderboardPlayerId()).then(ok=>{
          if(ok)setClubPostToast({clubName:CLUBS[autoCode]?.name||"your club",iqScore:dailyResult.iq.totalScore});
        });
      }
      // Auto-post to GLOBAL leaderboard, always, even without an account
      if(dailyResult?.iq?.totalScore){
        upsertGlobalEntry(autoName,dailyResult.iq.totalScore,dailyResult.time||0,newStreak,autoCode||null,currentLeaderboardPlayerId());
      }
      completedResult.mode="daily";
      completedResult.daySeed=today;
      completedResult.day_seed=today;
    }
    addHist(completedResult);
    // Auto-sync profile if it exists
    const prof=getProfile();
    if(prof&&prof.nickname){
      const pid=currentLeaderboardPlayerId();
      const bestIQNow=getBestIQ();
      upsertProfile({...prof,playerId:pid,nickname:prof.nickname||prof.name||rkCurrentDisplayName(),clubCode:prof.clubCode||prof.club_code||getClubCode()||"",streak:newStreak,roundsPlayed:ST.get("rnd",0),bestIQ:bestIQNow?.score||null});
    }
  };

  const go=(m)=>{setMode(m);setScreen("play");};

  if(!appReady){
    return(
      <AppShell>
        <RackleBootSplash/>
      </AppShell>
    );
  }

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
              <div style={{fontSize:12,color:C.mut,lineHeight:1.6,marginBottom:14}}>See your avg score, best hand, consistency, and how you compare to last week.</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{dismissWeeklyRecap();setShowWeeklyNudge(false);setScreen("recap");}} style={{...S.greenBtn,flex:2}}>View My Recap →</button>
                <button onClick={()=>{dismissWeeklyRecap();setShowWeeklyNudge(false);}} style={{...S.oBtn,flex:1}}>Later</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <>
        <QuickCardButton setScreen={setScreen} screen={screen} goBack={goBack}/>
        {screen==="home"&&<Home {...{streak,rounds,dDone,dRes,showHelp,setShowHelp,go,settings,setScreen}} showStats={()=>setScreen("stats")} showSettings={()=>setScreen("settings")} showTutorial={()=>setScreen("tutorial")} showCardGuide={()=>setScreen("cardguide")} showScorecard={()=>setScreen("scorecard")}/>}
        {screen==="tutorial"&&<Tutorial onDone={()=>{ST.set("tutDone",true);setScreen("home");}} onBack={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="cardguide"&&<CardGuideScreen home={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="howto"&&<HowToPlayScreen home={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="play"&&<Game mode={mode} home={()=>setScreen("home")} onDone={onDone} settings={settings} setScreen={setScreen}/>}
        {screen==="stats"&&<Stats home={()=>setScreen("home")} onShowScorecard={()=>setScreen("scorecard")} onRecap={()=>setScreen("recap")} dRes={dRes} setScreen={setScreen}/>}
        {screen==="settings"&&<Settings home={()=>setScreen("home")} settings={settings} setSettings={setSettings} showTutorial={()=>setScreen("tutorial")} setScreen={setScreen}/>}
        {screen==="scorecard"&&<ScorecardScreen res={dRes} home={()=>setScreen("home")} dayNum={getDayNum()} onPractice={()=>go("free")} setScreen={setScreen}/>}
        {screen==="leaderboard"&&<LeaderboardScreen home={()=>setScreen("home")} dRes={dRes} streak={streak} setScreen={setScreen}/>}
        {screen==="globalLeaderboard"&&<GlobalLeaderboardScreen home={()=>setScreen("home")} dRes={dRes} streak={streak} setScreen={setScreen}/>}
        {screen==="clubs"&&<ClubDirectoryScreen home={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="profile"&&<ProfileScreen home={()=>setScreen("home")} streak={streak} rounds={rounds} dRes={dRes} setScreen={setScreen}/>}
        {screen==="recap"&&<WeeklyRecapScreen home={()=>setScreen("home")} go={go} dDone={dDone} setScreen={setScreen}/>}
        {screen==="glossary"&&<GlossaryScreen home={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="quiz"&&<SectionQuizScreen home={()=>setScreen("home")} setScreen={setScreen}/>}
        {screen==="handbrowser"&&<HandBrowserScreen home={goBack} setScreen={setScreen}/>}
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
