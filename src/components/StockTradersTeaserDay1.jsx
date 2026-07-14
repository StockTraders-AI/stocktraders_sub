import { useEffect, useRef } from "react";

/*
  StockTraders AI - Teaser Day 1.
  Layout/CSS goc giu nguyen theo file mau. Form dang ky gui du lieu ve
  /api/tri-an-leads, server Node luu vao SQLite info.db bang tri_an_leads.
  Admin panel an mo bang footer va dung ADMIN_PIN ben duoi.
*/

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0A0D14;--surf:#111520;--elev:#171D2E;--bdr:#242E42;
  --t1:#F0F4FF;--t2:#A8B8D0;--t3:#5C7090;--t4:#3A4A60;
  --G:#3DD68C;--Gs:rgba(61,214,140,.12);--Gb:rgba(61,214,140,.30);
  --MU:#1A8A4A;
  --B:#7C3AED;--Bs:rgba(124,58,237,.13);--Bb:rgba(124,58,237,.30);
  --A:#FF9F0A;--As:rgba(255,159,10,.12);--Ab:rgba(255,159,10,.28);
  --R:#FF2D55;--Rs:rgba(255,45,85,.10);--Rb:rgba(255,45,85,.25);
}
html{scroll-behavior:smooth}
body{
  background:var(--bg);color:var(--t1);
  font-family:'Inter',sans-serif;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
body::before{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(600px 400px at 15% 0%, rgba(124,58,237,.14), transparent 60%),
    radial-gradient(500px 350px at 85% 10%, rgba(61,214,140,.10), transparent 60%);
}
.mono{font-family:'JetBrains Mono',monospace}
a{color:inherit;text-decoration:none}

/* Ã¢â€â‚¬Ã¢â€â‚¬ NAV Ã¢â€â‚¬Ã¢â€â‚¬ */
nav{
  position:relative;z-index:5;
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 48px;max-width:1240px;margin:0 auto;
}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-ic{
  width:34px;height:34px;border-radius:9px;
  background:linear-gradient(135deg,#7C3AED,#4F46E5);
  display:flex;align-items:center;justify-content:center;
}
.nav-brand{font-size:15px;font-weight:800;letter-spacing:-.3px}
.nav-brand span{color:var(--B)}
.nav-pill{
  display:flex;align-items:center;gap:7px;
  background:var(--Bs);border:.5px solid var(--Bb);color:#C4B5FD;
  padding:7px 14px;border-radius:20px;font-size:12px;font-weight:700;
  letter-spacing:.3px;
}
.nav-pill .dot{width:6px;height:6px;border-radius:50%;background:var(--B);animation:pulse 1.8s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

/* Ã¢â€â‚¬Ã¢â€â‚¬ HERO Ã¢â€â‚¬Ã¢â€â‚¬ */
.hero{
  position:relative;z-index:2;
  max-width:760px;margin:0 auto;padding:64px 24px 40px;
  text-align:center;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:7px;
  background:var(--Gs);border:.5px solid var(--Gb);color:var(--G);
  padding:7px 16px;border-radius:20px;font-size:12px;font-weight:700;
  letter-spacing:.5px;margin-bottom:24px;
  animation:fadeUp .6s ease both;
}
.hero h1{
  font-size:44px;font-weight:900;letter-spacing:-1.2px;line-height:1.15;
  margin-bottom:20px;
  animation:fadeUp .6s .1s ease both;
}
.hero h1 .grad{
  background:linear-gradient(90deg,#C4B5FD,#3DD68C);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.hero-sub{
  font-size:16.5px;color:var(--t2);line-height:1.7;max-width:560px;margin:0 auto 36px;
  animation:fadeUp .6s .2s ease both;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* Countdown */
.countdown-box{
  display:inline-flex;gap:10px;background:var(--surf);border:.5px solid var(--bdr);
  border-radius:16px;padding:20px 26px;margin-bottom:14px;
  animation:fadeUp .6s .3s ease both;
}
.cd-unit{display:flex;flex-direction:column;align-items:center;min-width:56px}
.cd-num{font-family:'JetBrains Mono',monospace;font-size:30px;font-weight:700;color:var(--t1)}
.cd-lbl{font-size:10px;color:var(--t3);letter-spacing:.5px;margin-top:2px;text-transform:uppercase}
.cd-sep{font-size:26px;color:var(--t4);align-self:center;padding-bottom:14px}
.hero-date{font-size:12.5px;color:var(--t3);margin-bottom:40px;animation:fadeUp .6s .35s ease both}
.hero-date strong{color:var(--t1)}

/* Sneak-peek visual (blurred donut) */
.peek-wrap{
  position:relative;display:inline-block;margin-bottom:8px;
  animation:fadeUp .6s .4s ease both;
}
.peek-card{
  background:var(--surf);border:.5px solid var(--bdr);border-radius:20px;
  padding:26px 40px;filter:blur(4.5px);opacity:.55;user-select:none;pointer-events:none;
}
.peek-lock{
  position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
}
.peek-lock-ic{
  width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#7C3AED,#4F46E5);
  display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(124,58,237,.4);
}
.peek-lock-txt{font-size:12.5px;color:var(--t1);font-weight:700;background:var(--bg);padding:5px 12px;border-radius:8px;border:.5px solid var(--bdr)}

/* Ã¢â€â‚¬Ã¢â€â‚¬ SECTION shared Ã¢â€â‚¬Ã¢â€â‚¬ */
section{position:relative;z-index:2;max-width:1080px;margin:0 auto;padding:70px 24px}
.section-eyebrow{
  font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--B);
  text-align:center;margin-bottom:12px;
}
.section-title{font-size:30px;font-weight:800;letter-spacing:-.6px;text-align:center;margin-bottom:14px}
.section-sub{font-size:15px;color:var(--t2);text-align:center;max-width:540px;margin:0 auto 44px;line-height:1.7}

/* Ã¢â€â‚¬Ã¢â€â‚¬ TEASE GRID Ã¢â€â‚¬Ã¢â€â‚¬ */
.tease-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.tease-card{
  position:relative;background:var(--surf);border:.5px solid var(--bdr);border-radius:18px;
  padding:26px;overflow:hidden;
}
.tease-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.tease-ic{
  width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.tease-name{font-size:15.5px;font-weight:700;color:var(--t1)}
.tease-tag{
  display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;
  color:var(--t3);letter-spacing:.3px;text-transform:uppercase;margin-top:2px;
}
.tease-hook{font-size:13.5px;color:var(--t2);line-height:1.6;margin-bottom:16px}

/* skeleton mock visuals, blurred */
.skel-wrap{position:relative;height:92px;border-radius:12px;overflow:hidden;background:var(--elev)}
.skel-inner{position:absolute;inset:0;filter:blur(3.5px);opacity:.6;padding:12px}
.skel-bar{height:8px;border-radius:4px;background:linear-gradient(90deg,var(--bdr),var(--t4));margin-bottom:8px}
.skel-lock-overlay{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:rgba(10,13,20,.25);
}
.skel-lock-overlay i{font-size:20px;color:var(--t2)}

/* Ã¢â€â‚¬Ã¢â€â‚¬ PROOF STRIP Ã¢â€â‚¬Ã¢â€â‚¬ */
.proof-strip{
  display:flex;justify-content:center;gap:0;flex-wrap:wrap;
  background:var(--surf);border:.5px solid var(--bdr);border-radius:18px;
  padding:26px 20px;
}
.proof-item{text-align:center;padding:0 32px;position:relative}
.proof-item:not(:last-child)::after{
  content:'';position:absolute;right:0;top:8px;bottom:8px;width:1px;background:var(--bdr);
}
.proof-num{font-size:26px;font-weight:800;font-family:'JetBrains Mono',monospace}
.proof-lbl{font-size:11.5px;color:var(--t3);margin-top:5px;max-width:140px}
.proof-note{text-align:center;font-size:12px;color:var(--t4);margin-top:16px}

/* Ã¢â€â‚¬Ã¢â€â‚¬ SIGNUP Ã¢â€â‚¬Ã¢â€â‚¬ */
.signup-box{
  max-width:440px;margin:0 auto;background:var(--surf);border:.5px solid var(--bdr);
  border-radius:20px;padding:32px;
}
.form-row{margin-bottom:14px}
.form-label{font-size:11px;font-weight:700;letter-spacing:.5px;color:var(--t3);text-transform:uppercase;display:block;margin-bottom:7px}
.form-input{
  width:100%;background:var(--elev);border:.5px solid var(--bdr);border-radius:10px;
  padding:12px 14px;color:var(--t1);font-size:14px;font-family:inherit;
}
.form-input::placeholder{color:var(--t4)}
.form-input:focus{outline:none;border-color:var(--B)}
.signup-btn{
  width:100%;background:linear-gradient(90deg,var(--G),#2FC77E);color:#04140B;
  border:none;border-radius:10px;padding:14px;font-size:14.5px;font-weight:800;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
  margin-top:6px;
}
.signup-btn:hover{opacity:.92}
.signup-note{font-size:11.5px;color:var(--t4);text-align:center;margin-top:14px;line-height:1.6}

/* Ã¢â€â‚¬Ã¢â€â‚¬ FOOTER Ã¢â€â‚¬Ã¢â€â‚¬ */
footer{
  position:relative;z-index:2;max-width:1080px;margin:0 auto;padding:36px 24px 50px;
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;
  border-top:.5px solid var(--bdr);font-size:12px;color:var(--t4);
}

@media(max-width:720px){
  nav{padding:16px 20px}
  .hero{padding:44px 18px 20px}
  .hero h1{font-size:30px}
  .countdown-box{gap:6px;padding:16px 14px}
  .cd-unit{min-width:42px}
  .cd-num{font-size:22px}
  .cd-sep{font-size:18px;padding-bottom:10px}
  .peek-card{padding:18px 20px}
  section{padding:50px 18px}
  .tease-grid{grid-template-columns:1fr}
  .proof-item{padding:10px 18px}
  .proof-item::after{display:none}
  footer{flex-direction:column;text-align:center}
}

/* bÃ¡Â»â€¢ sung riÃƒÂªng cho ngÃƒÂ y 1 */
.thanks-card{
  max-width:640px;margin:28px auto 0;text-align:left;
  background:linear-gradient(135deg,#0B2313,#0A1A2F);border:.5px solid var(--Gb);
  border-radius:18px;padding:26px 28px;display:flex;gap:16px;align-items:flex-start;
}
.thanks-ic{
  width:42px;height:42px;border-radius:11px;background:var(--G);color:#04140B;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;
}
.thanks-title{font-size:15px;font-weight:800;color:var(--t1);margin-bottom:6px}
.thanks-body{font-size:13.5px;color:var(--t2);line-height:1.7}
.timeline-row{
  display:flex;gap:20px;align-items:flex-start;max-width:640px;margin:0 auto 18px;text-align:left;
}
.timeline-dot{
  width:12px;height:12px;border-radius:50%;background:var(--B);margin-top:5px;flex-shrink:0;
  box-shadow:0 0 0 4px var(--Bs);
}
.timeline-year{font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--B);font-size:13px;margin-bottom:3px}
.timeline-txt{font-size:13.5px;color:var(--t2);line-height:1.6}
`;

const BODY_HTML = `

<nav>
  <div class="nav-logo">
    <div class="nav-ic"><svg width="19" height="17" viewBox="0 0 230 200" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M200.55,88.45c-5.85,0-10.73,0-14.65,0V55.43h-5.59v33.02c-4.27,0-7.44,0-10.26,0v0h-2.83v69.72c14.44-11.38,25.23-27.56,30.35-45.74C199.65,106.04,200.55,94.97,200.55,88.45z"/><path fill="#fff" d="M115.23,55.43V22.28h-5.59v33.14h-13.6v40.74l-0.21,79.39c6.85,1.54,16.41,1.63,16.41,1.63c5.02,0,11.31-0.54,16.37-1.47l0.22-79.54V55.43H115.23z"/><path fill="#fff" d="M151.02,110.37V77.02h-5.59v33.35h-13.6v44.28v20.4c10.99-2.49,21.93-7.03,32.79-14.97v-5.43v-44.28H151.02z"/><path fill="#fff" d="M79.39,77.02V44.44h-5.6l-0.07,32.58H60.2v51.56v31.25c9.04,6.84,21.26,12.58,32.76,15.12l0.02-46.37V77.02H79.39z"/><path fill="#fff" d="M43.63,33.45V0.51h-5.59v32.93h-13.6v36.24v14.26v9.01c1.31,25.93,13.82,49.22,32.79,64.53v-87.8V33.45H43.63z"/><path fill="#fff" d="M112.61,180.69c-50.58,0-91.65-40.71-92.26-91.15h0v-0.18c-0.01-0.32-0.03-0.64-0.03-0.96c0-0.32,0.02-0.63,0.03-0.96v-54C9.21,50.63,2.71,66.39,2.71,88.4c0,60.69,49.2,109.9,109.9,109.9c60.7,0,109.9-49.21,109.9-109.9h-17.6C204.91,139.37,163.58,180.69,112.61,180.69z"/></svg></div>
    <div class="nav-brand">StockTraders<span> AI</span></div>
  </div>
  <div class="nav-pill"><span class="dot"></span> CÃƒâ€™N 18 NGÃƒâ‚¬Y</div>
</nav>

<div class="hero">
  <div class="hero-eyebrow"><i class="ti ti-heart" style="font-size:13px"></i> TrÃ†Â°Ã¡Â»â€ºc hÃ¡ÂºÂ¿t, mÃ¡Â»â„¢t lÃ¡Â»Âi cÃ¡ÂºÂ£m Ã†Â¡n</div>
  <h1>CÃ¡ÂºÂ£m Ã†Â¡n vÃƒÂ¬ Ã„â€˜ÃƒÂ£ tin tÃ†Â°Ã¡Â»Å¸ng<br><span class="grad">tÃ¡Â»Â« nhÃ¡Â»Â¯ng ngÃƒÂ y Ã„â€˜Ã¡ÂºÂ§u</span>.</h1>
  <p class="hero-sub">
    TrÃ†Â°Ã¡Â»â€ºc khi hÃƒÂ© lÃ¡Â»â„¢ bÃ¡ÂºÂ¥t cÃ¡Â»Â© Ã„â€˜iÃ¡Â»Âu gÃƒÂ¬ mÃ¡Â»â€ºi, chÃƒÂºng tÃƒÂ´i muÃ¡Â»â€˜n dÃƒÂ nh trÃ¡Â»Ân ngÃƒÂ y Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn nÃƒÂ y Ã„â€˜Ã¡Â»Æ’ nÃƒÂ³i lÃ¡Â»Âi cÃ¡ÂºÂ£m Ã†Â¡n Ã¢â‚¬â€ tÃ¡Â»â€ºi tÃ¡Â»Â«ng khÃƒÂ¡ch hÃƒÂ ng Ã„â€˜ÃƒÂ£ vÃƒÂ  Ã„â€˜ang tin dÃƒÂ¹ng StockTraders AI qua nhiÃ¡Â»Âu phiÃƒÂªn bÃ¡ÂºÂ£n App Premium.
  </p>

  <div class="thanks-card">
    <div class="thanks-ic"><i class="ti ti-gift"></i></div>
    <div>
      <div class="thanks-title">Ã°Å¸Å½Â MÃ¡Â»â„¢t lÃ¡Â»Âi tri ÃƒÂ¢n, khÃƒÂ´ng phÃ¡ÂºÂ£i mÃ¡Â»â„¢t lÃ¡Â»Âi quÃ¡ÂºÂ£ng cÃƒÂ¡o</div>
      <div class="thanks-body">
        ToÃƒÂ n bÃ¡Â»â„¢ khÃƒÂ¡ch hÃƒÂ ng Ã„â€˜ang sÃ¡Â»Â­ dÃ¡Â»Â¥ng <strong style="color:var(--t1)">App bÃ¡ÂºÂ£n Premium</strong> sÃ¡ÂºÂ½ Ã„â€˜Ã†Â°Ã¡Â»Â£c <strong style="color:var(--G)">mÃ¡Â»Å¸ khoÃƒÂ¡ miÃ¡Â»â€¦n phÃƒÂ­ Web Dashboard</strong> ngay khi web chÃƒÂ­nh thÃ¡Â»Â©c ra mÃ¡ÂºÂ¯t 02/08/2026 Ã¢â‚¬â€ dÃƒÂ¹ng chung tÃƒÂ i khoÃ¡ÂºÂ£n, khÃƒÂ´ng cÃ¡ÂºÂ§n Ã„â€˜Ã„Æ’ng kÃƒÂ½ lÃ¡ÂºÂ¡i, khÃƒÂ´ng phÃƒÂ¡t sinh thÃƒÂªm chi phÃƒÂ­. Ã„ÂÃƒÂ¢y lÃƒÂ  cÃƒÂ¡ch chÃƒÂºng tÃƒÂ´i nÃƒÂ³i lÃ¡Â»Âi cÃ¡ÂºÂ£m Ã†Â¡n tÃ¡Â»â€ºi nhÃ¡Â»Â¯ng ngÃ†Â°Ã¡Â»Âi Ã„â€˜ÃƒÂ£ tin tÃ†Â°Ã¡Â»Å¸ng chÃƒÂºng tÃƒÂ´i trÃ†Â°Ã¡Â»â€ºc cÃ¡ÂºÂ£ khi chÃƒÂºng tÃƒÂ´i cÃƒÂ³ gÃƒÂ¬ Ã„â€˜Ã¡Â»Æ’ chÃ¡Â»Â©ng minh.
      </div>
    </div>
  </div>

  <div class="countdown-box" style="margin-top:32px">
    <div class="cd-unit"><span class="cd-num" id="cd-d">00</span><div class="cd-lbl">NgÃƒÂ y</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-h">00</span><div class="cd-lbl">GiÃ¡Â»Â</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-m">00</span><div class="cd-lbl">PhÃƒÂºt</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-s">00</span><div class="cd-lbl">GiÃƒÂ¢y</div></div>
  </div>
  <div class="hero-date">MÃ¡Â»Å¸ khoÃƒÂ¡ lÃƒÂºc <strong>00:00 Ã‚Â· 02/08/2026</strong></div>
</div>
<section style="padding-top:0">
  <div class="section-eyebrow">HÃƒÂ nh trÃƒÂ¬nh chÃ†Â°a tÃ¡Â»Â«ng dÃ¡Â»Â«ng lÃ¡ÂºÂ¡i</div>
  <div class="section-title">TÃ¡Â»Â« 2013 Ã„â€˜Ã¡ÂºÂ¿n lÃ¡ÂºÂ§n nÃƒÂ¢ng cÃ¡ÂºÂ¥p<br>lÃ¡Â»â€ºn nhÃ¡ÂºÂ¥t tÃ¡Â»Â« trÃ†Â°Ã¡Â»â€ºc tÃ¡Â»â€ºi nay</div>
  <p class="section-sub">StockTraders AI khÃƒÂ´ng xuÃ¡ÂºÂ¥t hiÃ¡Â»â€¡n trong mÃ¡Â»â„¢t sÃ¡Â»â€ºm mÃ¡Â»â„¢t chiÃ¡Â»Âu. Ã„ÂÃƒÂ¢y lÃƒÂ  kÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ cÃ¡Â»Â§a hÃ†Â¡n mÃ¡Â»â„¢t thÃ¡ÂºÂ­p kÃ¡Â»Â· nghiÃƒÂªn cÃ¡Â»Â©u, thÃ¡Â»Â­ nghiÃ¡Â»â€¡m vÃƒÂ  nÃƒÂ¢ng cÃ¡ÂºÂ¥p liÃƒÂªn tÃ¡Â»Â¥c Ã¢â‚¬â€ vÃƒÂ¬ vÃ¡Â»â€ºi chÃƒÂºng tÃƒÂ´i, nghiÃƒÂªn cÃ¡Â»Â©u vÃƒÂ  cÃ¡ÂºÂ£i tiÃ¡ÂºÂ¿n hÃ¡Â»â€¡ thÃ¡Â»â€˜ng luÃƒÂ´n lÃƒÂ  Ã†Â°u tiÃƒÂªn hÃƒÂ ng Ã„â€˜Ã¡ÂºÂ§u, khÃƒÂ´ng phÃ¡ÂºÂ£i viÃ¡Â»â€¡c lÃƒÂ m thÃƒÂªm.</p>

  <div style="max-width:640px;margin:32px auto 0">
    <div class="timeline-row">
      <div class="timeline-dot"></div>
      <div><div class="timeline-year">2013</div><div class="timeline-txt">StockTraders AI bÃ¡ÂºÂ¯t Ã„â€˜Ã¡ÂºÂ§u hÃƒÂ nh trÃƒÂ¬nh Ã„â€˜Ã¡Â»â€œng hÃƒÂ nh cÃƒÂ¹ng nhÃƒÂ  Ã„â€˜Ã¡ÂºÂ§u tÃ†Â° ViÃ¡Â»â€¡t Nam Ã¢â‚¬â€ khi khÃƒÂ¡i niÃ¡Â»â€¡m "dÃƒÂ²ng tiÃ¡Â»Ân thÃƒÂ´ng minh" cÃƒÂ²n rÃ¡ÂºÂ¥t mÃ¡Â»â€ºi.</div></div>
    </div>
    <div class="timeline-row">
      <div class="timeline-dot"></div>
      <div><div class="timeline-year">2013 Ã¢â‚¬â€ 2025</div><div class="timeline-txt">NhiÃ¡Â»Âu lÃ¡ÂºÂ§n nÃƒÂ¢ng cÃ¡ÂºÂ¥p DÃƒÂ² sÃƒÂ³ng thÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng vÃƒÂ  cÃƒÂ´ng nghÃ¡Â»â€¡ Ã¢â‚¬â€ tÃ¡Â»Â« nhÃ¡Â»Â¯ng phiÃƒÂªn bÃ¡ÂºÂ£n Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn cho tÃ¡Â»â€ºi hÃ¡Â»â€¡ thÃ¡Â»â€˜ng SMDT vÃƒÂ  AI Advisor hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i.</div></div>
    </div>
    <div class="timeline-row">
      <div class="timeline-dot" style="background:var(--G);box-shadow:0 0 0 4px var(--Gs)"></div>
      <div><div class="timeline-year">02/08/2026</div><div class="timeline-txt"><strong style="color:var(--t1)">LÃ¡ÂºÂ§n nÃƒÂ¢ng cÃ¡ÂºÂ¥p lÃ¡Â»â€ºn nhÃ¡ÂºÂ¥t trong lÃ¡Â»â€¹ch sÃ¡Â»Â­ vÃ¡ÂºÂ­n hÃƒÂ nh</strong> Ã¢â‚¬â€ Web Dashboard, PhÃƒÂ¢n tÃƒÂ­ch danh mÃ¡Â»Â¥c AI, LÃ¡Â»â„¢ trÃƒÂ¬nh dÃ¡ÂºÂ«n sÃƒÂ³ng vÃƒÂ  nhiÃ¡Â»Âu Ã„â€˜iÃ¡Â»Âu nÃ¡Â»Â¯a sÃ¡ÂºÂ½ chÃƒÂ­nh thÃ¡Â»Â©c ra mÃ¡ÂºÂ¯t.</div></div>
    </div>
  </div>
</section><section style="padding-top:0">
  <div class="section-eyebrow">KhÃƒÂ´ng phÃ¡ÂºÂ£i Ã„â€˜iÃ¡Â»Âu gÃƒÂ¬ Ã„â€˜ÃƒÂ³ mÃ¡Â»â€ºi</div>
  <div class="section-title">4 chÃƒÂ¢n sÃƒÂ³ng lÃ¡Â»â€¹ch sÃ¡Â»Â­,<br>cÃƒÂ¹ng mÃ¡Â»â„¢t DÃƒÂ² sÃƒÂ³ng thÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng</div>
  <p class="section-sub">"DÃƒÂ² sÃƒÂ³ng thÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng" khÃƒÂ´ng phÃ¡ÂºÂ£i khÃƒÂ¡i niÃ¡Â»â€¡m StockTraders AI mÃ¡Â»â€ºi nghÃ„Â© ra gÃ¡ÂºÂ§n Ã„â€˜ÃƒÂ¢y. NhÃƒÂ¬n lÃ¡ÂºÂ¡i 4 giai Ã„â€˜oÃ¡ÂºÂ¡n khÃƒÂ³ khÃ„Æ’n nhÃ¡ÂºÂ¥t cÃ¡Â»Â§a thÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng ViÃ¡Â»â€¡t Nam Ã¢â‚¬â€ tÃ¡Â»Â« khÃ¡Â»Â§ng hoÃ¡ÂºÂ£ng Ã„â€˜Ã¡Â»â€¹a chÃƒÂ­nh trÃ¡Â»â€¹, Ã„â€˜Ã¡ÂºÂ¡i dÃ¡Â»â€¹ch, khÃ¡Â»Â§ng hoÃ¡ÂºÂ£ng trÃƒÂ¡i phiÃ¡ÂºÂ¿u, cho tÃ¡Â»â€ºi nhÃ¡Â»â€¹p giÃ¡ÂºÂ£m gÃ¡ÂºÂ§n nhÃ¡ÂºÂ¥t Ã¢â‚¬â€ cÃƒÂ¹ng mÃ¡Â»â„¢t quy luÃ¡ÂºÂ­t luÃƒÂ´n lÃ¡ÂºÂ·p lÃ¡ÂºÂ¡i: hoÃ¡ÂºÂ£ng loÃ¡ÂºÂ¡n tÃ¡Â»â„¢t Ã„â€˜Ã¡Â»â„¢ chÃƒÂ­nh lÃƒÂ  nÃ†Â¡i chÃƒÂ¢n sÃƒÂ³ng hÃƒÂ¬nh thÃƒÂ nh.</p>

  <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;margin-top:8px">

    <!-- HD981 2014 -->
    <div style="background:var(--surf);border:.5px solid var(--bdr);border-radius:16px;padding:22px;width:260px;text-align:center">
      <div style="font-size:12.5px;font-weight:700;color:var(--t3);letter-spacing:.3px;margin-bottom:14px">HD981 Ã‚Â· 05/2014</div>
      <svg width="120" height="120" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--G)" stroke-width="16" stroke-dasharray="187 415" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--MU)" stroke-width="16" stroke-dasharray="104 415" stroke-dashoffset="-187" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--A)" stroke-width="16" stroke-dasharray="83 415" stroke-dashoffset="-291" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--R)" stroke-width="16" stroke-dasharray="41 415" stroke-dashoffset="-374" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <text x="80" y="76" text-anchor="middle" font-size="20" font-weight="800" fill="var(--t1)" font-family="JetBrains Mono">513,06</text>
        <text x="80" y="94" text-anchor="middle" font-size="10" fill="var(--t3)" font-family="Inter">Ã„â€˜ÃƒÂ¡y 13/05</text>
      </svg>
      <div style="font-size:12px;color:var(--t2);line-height:1.6;margin-top:10px">VN-Index mÃ¡ÂºÂ¥t <strong style="color:var(--t1)">-8,2%</strong> trong 5 phiÃƒÂªn, rÃ¡Â»â€œi Ã„â€˜Ã¡ÂºÂ£o chiÃ¡Â»Âu tÃ„Æ’ng ngay sau Ã„â€˜ÃƒÂ¡y.</div>
    </div>

    <!-- Covid 2020 -->
    <div style="background:var(--surf);border:.5px solid var(--bdr);border-radius:16px;padding:22px;width:260px;text-align:center">
      <div style="font-size:12.5px;font-weight:700;color:var(--t3);letter-spacing:.3px;margin-bottom:14px">COVID-19 Ã‚Â· 03/2020</div>
      <svg width="120" height="120" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--G)" stroke-width="16" stroke-dasharray="207 415" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--MU)" stroke-width="16" stroke-dasharray="125 415" stroke-dashoffset="-207" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--A)" stroke-width="16" stroke-dasharray="62 415" stroke-dashoffset="-332" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--R)" stroke-width="16" stroke-dasharray="21 415" stroke-dashoffset="-394" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <text x="80" y="76" text-anchor="middle" font-size="20" font-weight="800" fill="var(--t1)" font-family="JetBrains Mono">652,47</text>
        <text x="80" y="94" text-anchor="middle" font-size="10" fill="var(--t3)" font-family="Inter">Ã„â€˜ÃƒÂ¡y 24/03</text>
      </svg>
      <div style="font-size:12px;color:var(--t2);line-height:1.6;margin-top:10px">TÃ¡Â»Â« Ã„â€˜ÃƒÂ¡y hoÃ¡ÂºÂ£ng loÃ¡ÂºÂ¡n, VN-Index tÃ„Æ’ng <strong style="color:var(--G)">+67%</strong> chÃ¡Â»â€° trong 9 thÃƒÂ¡ng.</div>
    </div>

    <!-- 09/04/2025 -->
    <div style="background:var(--surf);border:.5px solid var(--Gb);border-radius:16px;padding:22px;width:260px;text-align:center">
      <div style="font-size:12.5px;font-weight:700;color:var(--G);letter-spacing:.3px;margin-bottom:14px">09/04/2025 Ã‚Â· DÃ¡Â»Â¯ liÃ¡Â»â€¡u thÃ¡ÂºÂ­t</div>
      <svg width="120" height="120" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--G)" stroke-width="16" stroke-dasharray="241 415" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--MU)" stroke-width="16" stroke-dasharray="17 415" stroke-dashoffset="-241" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--A)" stroke-width="16" stroke-dasharray="124 415" stroke-dashoffset="-258" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--R)" stroke-width="16" stroke-dasharray="33 415" stroke-dashoffset="-382" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <text x="80" y="76" text-anchor="middle" font-size="18" font-weight="800" fill="var(--t1)" font-family="JetBrains Mono">1.073,81</text>
        <text x="80" y="94" text-anchor="middle" font-size="10" fill="var(--t3)" font-family="Inter">Ã„â€˜ÃƒÂ¡y 09/04</text>
      </svg>
      <div style="font-size:12px;color:var(--t2);line-height:1.6;margin-top:10px"><strong style="color:var(--t1)">231 mÃƒÂ£ ChÃ¡Â»Â mua</strong> tÃ„Æ’ng Ã„â€˜Ã¡Â»â„¢t biÃ¡ÂºÂ¿n Ã¢â‚¬â€ sau Ã„â€˜ÃƒÂ³ VN-Index tÃ„Æ’ng <strong style="color:var(--G)">+844 Ã„â€˜iÃ¡Â»Æ’m (+79%)</strong> trong gÃ¡ÂºÂ§n 1 nÃ„Æ’m.</div>
    </div>

    <!-- VÃ¡ÂºÂ¡n ThÃ¡Â»â€¹nh PhÃƒÂ¡t 2022 -->
    <div style="background:var(--surf);border:.5px solid var(--bdr);border-radius:16px;padding:22px;width:260px;text-align:center">
      <div style="font-size:12.5px;font-weight:700;color:var(--t3);letter-spacing:.3px;margin-bottom:14px">VÃ¡ÂºÂ N THÃ¡Â»Å NH PHÃƒÂT Ã‚Â· 11/2022</div>
      <svg width="120" height="120" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--G)" stroke-width="16" stroke-dasharray="182 415" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--MU)" stroke-width="16" stroke-dasharray="116 415" stroke-dashoffset="-182" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--A)" stroke-width="16" stroke-dasharray="79 415" stroke-dashoffset="-298" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <circle cx="80" cy="80" r="66" fill="none" stroke="var(--R)" stroke-width="16" stroke-dasharray="38 415" stroke-dashoffset="-377" stroke-linecap="butt" transform="rotate(-90 80 80)"/>
        <text x="80" y="76" text-anchor="middle" font-size="20" font-weight="800" fill="var(--t1)" font-family="JetBrains Mono">873,78</text>
        <text x="80" y="94" text-anchor="middle" font-size="10" fill="var(--t3)" font-family="Inter">Ã„â€˜ÃƒÂ¡y 16/11</text>
      </svg>
      <div style="font-size:12px;color:var(--t2);line-height:1.6;margin-top:10px">Ã„ÂÃƒÂ¡y khÃ¡Â»Â§ng hoÃ¡ÂºÂ£ng trÃƒÂ¡i phiÃ¡ÂºÂ¿u bÃ¡ÂºÂ¥t Ã„â€˜Ã¡Â»â„¢ng sÃ¡ÂºÂ£n Ã¢â‚¬â€ Ã„â€˜iÃ¡Â»Æ’m khÃ¡Â»Å¸i Ã„â€˜Ã¡ÂºÂ§u chu kÃ¡Â»Â³ hÃ¡Â»â€œi phÃ¡Â»Â¥c sau Ã„â€˜ÃƒÂ³.</div>
    </div>

  </div>

  <!-- Legend 4 mÃƒÂ u -->
  <div style="display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:22px;font-size:12px;color:var(--t3)">
    <div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:var(--G)"></span>ChÃ¡Â»Â mua</div>
    <div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:var(--MU)"></span>Mua</div>
    <div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:var(--A)"></span>ChÃ¡Â»Â bÃƒÂ¡n</div>
    <div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:var(--R)"></span>BÃƒÂ¡n</div>
  </div>

  <div class="thanks-card" style="margin-top:28px;background:linear-gradient(135deg,#1A1233,#0A1A2F);border-color:var(--Bb)">
    <div class="thanks-ic" style="background:linear-gradient(135deg,#7C3AED,#4F46E5);color:#fff"><i class="ti ti-award"></i></div>
    <div>
      <div class="thanks-title">Ã°Å¸Ââ€  4 cuÃ¡Â»â„¢c khÃ¡Â»Â§ng hoÃ¡ÂºÂ£ng. 4 lÃ¡ÂºÂ§n dÃƒÂ²ng tiÃ¡Â»Ân Ã„â€˜Ã†Â°Ã¡Â»Â£c nhÃ¡ÂºÂ­n diÃ¡Â»â€¡n Ã„â€˜ÃƒÂºng lÃƒÂºc.</div>
      <div class="thanks-body">
        TÃ¡Â»Â« giÃƒÂ n khoan HD981 (2014), Ã„â€˜Ã¡ÂºÂ¡i dÃ¡Â»â€¹ch Covid-19 (2020), khÃ¡Â»Â§ng hoÃ¡ÂºÂ£ng trÃƒÂ¡i phiÃ¡ÂºÂ¿u VÃ¡ÂºÂ¡n ThÃ¡Â»â€¹nh PhÃƒÂ¡t (2022), Ã„â€˜Ã¡ÂºÂ¿n chÃƒÂ¢n sÃƒÂ³ng lÃ¡Â»â€¹ch sÃ¡Â»Â­ 09/04/2025 Ã¢â‚¬â€ mÃ¡Â»â€”i lÃ¡ÂºÂ§n thÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng tÃ†Â°Ã¡Â»Å¸ng chÃ¡Â»Â«ng sÃ¡Â»Â¥p Ã„â€˜Ã¡Â»â€¢, Ã„â€˜ÃƒÂ³ lÃ¡ÂºÂ¡i chÃƒÂ­nh lÃƒÂ  lÃƒÂºc <strong style="color:var(--t1)">DÃƒÂ² sÃƒÂ³ng thÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng</strong> chÃ¡Â»Â©ng minh giÃƒÂ¡ trÃ¡Â»â€¹ cÃ¡Â»Â§a mÃƒÂ¬nh. Ã„ÂÃƒÂ¢y khÃƒÂ´ng phÃ¡ÂºÂ£i sÃ¡Â»Â± trÃƒÂ¹ng hÃ¡Â»Â£p. Ã„ÂÃƒÂ¢y lÃƒÂ  kÃ¡ÂºÂ¿t quÃ¡ÂºÂ£ cÃ¡Â»Â§a hÃ†Â¡n mÃ¡Â»â„¢t thÃ¡ÂºÂ­p kÃ¡Â»Â· nghiÃƒÂªn cÃ¡Â»Â©u khÃƒÂ´ng ngÃ¡Â»Â«ng nghÃ¡Â»â€° Ã¢â‚¬â€ cÃƒÂ¹ng mÃ¡Â»â„¢t triÃ¡ÂºÂ¿t lÃƒÂ½, Ã„â€˜Ã†Â°Ã¡Â»Â£c kiÃ¡Â»Æ’m chÃ¡Â»Â©ng qua mÃ¡Â»Âi chu kÃ¡Â»Â³ khÃƒÂ³ khÃ„Æ’n nhÃ¡ÂºÂ¥t cÃ¡Â»Â§a thÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng ViÃ¡Â»â€¡t Nam.
      </div>
    </div>
  </div>
</section><!-- Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â SIGNUP Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â -->
<section id="signup">
  <div class="section-eyebrow">Ã„ÂÃ¡Â»Â«ng Ã„â€˜Ã¡Â»Æ’ bÃ¡Â»â€¹ bÃ¡Â»Â lÃ¡Â»Â¡</div>
  <div class="section-title">LÃƒÂ  ngÃ†Â°Ã¡Â»Âi Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn<br>Ã„â€˜Ã†Â°Ã¡Â»Â£c mÃ¡Â»Å¸ khoÃƒÂ¡</div>
  <p class="section-sub">Ã„ÂÃ¡Â»Æ’ lÃ¡ÂºÂ¡i thÃƒÂ´ng tin Ã¢â‚¬â€ khi cÃƒÂ¡nh cÃ¡Â»Â­a mÃ¡Â»Å¸ lÃƒÂºc 00:00 ngÃƒÂ y 02/08/2026, bÃ¡ÂºÂ¡n sÃ¡ÂºÂ½ lÃƒÂ  ngÃ†Â°Ã¡Â»Âi nhÃ¡ÂºÂ­n Ã„â€˜Ã†Â°Ã¡Â»Â£c thÃƒÂ´ng bÃƒÂ¡o trÃ†Â°Ã¡Â»â€ºc tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£.</p>

  <div class="signup-box">
    <div class="form-row">
      <label class="form-label">HÃ¡Â»Â vÃƒÂ  tÃƒÂªn</label>
      <input class="form-input" id="lead-name" type="text" placeholder="NguyÃ¡Â»â€¦n VÃ„Æ’n A">
    </div>
    <div class="form-row">
      <label class="form-label">SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i *</label>
      <input class="form-input" id="lead-phone" type="tel" placeholder="0901 234 567">
    </div>
    <div class="form-row">
      <label class="form-label">Email</label>
      <input class="form-input" id="lead-email" type="email" placeholder="email@example.com">
    </div>
    <div id="form-error" style="display:none;color:var(--R);font-size:12.5px;margin-bottom:6px"></div>
    <button class="signup-btn" id="form-submit-btn" onclick="handleSubmit(event)">
      <i class="ti ti-bell" style="font-size:15px"></i> BÃƒÂ¡o tÃƒÂ´i khi mÃ¡Â»Å¸ khoÃƒÂ¡
    </button>
    <div class="signup-note">
      ChÃƒÂºng tÃƒÂ´i chÃ¡Â»â€° gÃ¡Â»Â­i 1 thÃƒÂ´ng bÃƒÂ¡o duy nhÃ¡ÂºÂ¥t khi web chÃƒÂ­nh thÃ¡Â»Â©c ra mÃ¡ÂºÂ¯t.<br>KhÃƒÂ´ng chia sÃ¡ÂºÂ» thÃƒÂ´ng tin cÃ¡Â»Â§a bÃ¡ÂºÂ¡n vÃ¡Â»â€ºi bÃƒÂªn thÃ¡Â»Â© ba.
    </div>
  </div>
</section>

<footer>
  <div onclick="toggleAdmin()" style="cursor:default;user-select:none">Ã‚Â© 2026 StockTraders AI Ã‚Â· SÃ¡ÂºÂ¯p ra mÃ¡ÂºÂ¯t 02/08/2026</div>
  <div>DÃ¡Â»Â¯ liÃ¡Â»â€¡u vÃƒÂ  phÃƒÂ¢n tÃƒÂ­ch chÃ¡Â»â€° mang tÃƒÂ­nh chÃ¡ÂºÂ¥t tham khÃ¡ÂºÂ£o.</div>
</footer>

<!-- Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â ADMIN Ã¢â‚¬â€ QUÃ¡ÂºÂ¢N LÃƒÂ Ã„ÂÃ„â€šNG KÃƒÂ NHÃ¡ÂºÂ¬N THÃƒâ€NG BÃƒÂO (Ã¡ÂºÂ©n) Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â -->
<div id="admin-panel" style="display:none;max-width:920px;margin:0 auto;padding:0 24px 60px;position:relative;z-index:2">
  <div id="admin-login" style="display:none;max-width:340px;margin:16px auto 0;background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;padding:20px">
    <div style="font-size:13px;color:var(--t2);margin-bottom:10px">NhÃ¡ÂºÂ­p mÃƒÂ£ truy cÃ¡ÂºÂ­p Ã„â€˜Ã¡Â»Æ’ xem danh sÃƒÂ¡ch Ã„â€˜Ã„Æ’ng kÃƒÂ½</div>
    <input id="admin-pin" type="password" placeholder="MÃƒÂ£ PIN" style="width:100%;background:var(--elev);border:.5px solid var(--bdr);border-radius:8px;padding:10px 12px;color:var(--t1);font-size:14px;margin-bottom:10px" onkeydown="if(event.key==='Enter')adminLogin()">
    <button onclick="adminLogin()" style="width:100%;background:var(--B);color:#fff;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">Truy cÃ¡ÂºÂ­p</button>
    <div id="admin-login-err" style="display:none;color:var(--R);font-size:12px;margin-top:8px">Sai mÃƒÂ£ PIN, vui lÃƒÂ²ng thÃ¡Â»Â­ lÃ¡ÂºÂ¡i.</div>
  </div>

  <div id="admin-dash" style="display:none;margin-top:16px;background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;padding:20px;overflow-x:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
      <div style="font-size:15px;font-weight:700">Danh sÃƒÂ¡ch Ã„â€˜Ã„Æ’ng kÃƒÂ½ nhÃ¡ÂºÂ­n thÃƒÂ´ng bÃƒÂ¡o <span id="admin-count" style="color:var(--t3);font-weight:400">(0)</span></div>
      <div style="display:flex;gap:8px">
        <button onclick="loadLeads()" style="background:var(--elev);border:.5px solid var(--bdr);color:var(--t2);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer"><i class="ti ti-refresh" style="font-size:12px"></i> LÃƒÂ m mÃ¡Â»â€ºi</button>
        <button onclick="exportLeadsCSV()" style="background:var(--Gs);border:.5px solid var(--Gb);color:var(--G);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer"><i class="ti ti-download" style="font-size:12px"></i> XuÃ¡ÂºÂ¥t CSV</button>
        <button onclick="closeAdmin()" style="background:none;border:.5px solid var(--bdr);color:var(--t3);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer">Ã„ÂÃƒÂ³ng</button>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="text-align:left;color:var(--t3);border-bottom:.5px solid var(--bdr)">
          <th style="padding:8px 10px">ThÃ¡Â»Âi gian</th>
          <th style="padding:8px 10px">HÃ¡Â»Â tÃƒÂªn</th>
          <th style="padding:8px 10px">SÃ„ÂT</th>
          <th style="padding:8px 10px">Email</th>
          <th style="padding:8px 10px"></th>
        </tr>
      </thead>
      <tbody id="admin-tbody">
        <tr><td colspan="5" style="padding:20px 10px;color:var(--t4);text-align:center">Ã„Âang tÃ¡ÂºÂ£i...</td></tr>
      </tbody>
    </table>
  </div>
</div>


`;

export default function StockTradersTeaserDay1() {
  const rootRef = useRef(null);
  const leadsCacheRef = useRef([]);
  const adminUnlockedRef = useRef(false);

  useEffect(() => {
    /* Ã¢â€â‚¬Ã¢â€â‚¬ Load font & icon CDN (bÃ¡Â»Â qua nÃ¡ÂºÂ¿u app Ã„â€˜ÃƒÂ£ cÃƒÂ³) Ã¢â€â‚¬Ã¢â€â‚¬ */
    const linksToEnsure = [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/3.19.0/iconfont/tabler-icons.min.css",
      },
    ];
    const injected = [];
    linksToEnsure.forEach((l) => {
      if (!document.querySelector(`link[href="${l.href}"]`)) {
        const el = document.createElement("link");
        el.rel = l.rel;
        el.href = l.href;
        document.head.appendChild(el);
        injected.push(el);
      }
    });

    const ADMIN_PIN = "9983"; // demo PIN Ã¢â‚¬â€ Ã„â€˜Ã¡Â»â€¢i khi triÃ¡Â»Æ’n khai thÃ¡ÂºÂ­t
    const API_BASE = "/api/tri-an-leads";

    const requestJson = async (path = "", options = {}) => {
      const res = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `LÃ¡Â»â€”i kÃ¡ÂºÂ¿t nÃ¡Â»â€˜i API (${res.status})`);
      return data;
    };


    const escapeHtml = (s) =>
      String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c]));

    const renderLeads = (leads) => {
      const tbody = document.getElementById("admin-tbody");
      const countEl = document.getElementById("admin-count");
      if (!tbody || !countEl) return;
      countEl.textContent = "(" + leads.length + ")";
      if (leads.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" style="padding:20px 10px;color:var(--t4);text-align:center">ChÃ†Â°a cÃƒÂ³ ai Ã„â€˜Ã„Æ’ng kÃƒÂ½.</td></tr>';
        return;
      }
      tbody.innerHTML = leads
        .map((l) => {
          const d = new Date(l.ts);
          const dateStr = isNaN(d) ? "" : d.toLocaleString("vi-VN");
          return `<tr style="border-bottom:.5px solid var(--bdr)">
      <td style="padding:9px 10px;color:var(--t3);white-space:nowrap">${dateStr}</td>
      <td style="padding:9px 10px;color:var(--t1);font-weight:600">${escapeHtml(l.name || "Ã¢â‚¬â€")}</td>
      <td style="padding:9px 10px">${escapeHtml(l.phone || "")}</td>
      <td style="padding:9px 10px;color:var(--t2)">${escapeHtml(l.email || "Ã¢â‚¬â€")}</td>
      <td style="padding:9px 10px;text-align:right"><button onclick="deleteLead('${l.key}')" style="background:none;border:none;color:var(--R);cursor:pointer;font-size:12px"><i class="ti ti-trash"></i></button></td>
    </tr>`;
        })
        .join("");
    };

    const loadLeads = async () => {
      const tbody = document.getElementById("admin-tbody");
      if (!tbody) return;
      tbody.innerHTML =
        '<tr><td colspan="5" style="padding:20px 10px;color:var(--t4);text-align:center">Ã„Âang tÃ¡ÂºÂ£i...</td></tr>';
      try {
        const data = await requestJson();
        const leads = Array.isArray(data?.leads) ? data.leads : [];
        leadsCacheRef.current = leads;
        renderLeads(leads);
      } catch (err) {
        console.error("KhÃƒÂ´ng tÃ¡ÂºÂ£i Ã„â€˜Ã†Â°Ã¡Â»Â£c leads tÃ¡Â»Â« API:", err);
        tbody.innerHTML =
          '<tr><td colspan="5" style="padding:20px 10px;color:var(--R);text-align:center">KhÃƒÂ´ng kÃ¡ÂºÂ¿t nÃ¡Â»â€˜i Ã„â€˜Ã†Â°Ã¡Â»Â£c API lÃ†Â°u Ã„â€˜Ã„Æ’ng kÃƒÂ½.</td></tr>';
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("form-submit-btn");
      const errBox = document.getElementById("form-error");
      const name = document.getElementById("lead-name").value.trim();
      const phone = document.getElementById("lead-phone").value.trim();
      const email = document.getElementById("lead-email").value.trim();

      errBox.style.display = "none";
      if (!phone) {
        errBox.textContent = "Vui lÃƒÂ²ng nhÃ¡ÂºÂ­p SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i Ã„â€˜Ã¡Â»Æ’ nhÃ¡ÂºÂ­n thÃƒÂ´ng bÃƒÂ¡o.";
        errBox.style.display = "block";
        return;
      }

      btn.disabled = true;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = "Ã„Âang gÃ¡Â»Â­i...";

      try {
        const data = await requestJson("", {
          method: "POST",
          body: JSON.stringify({ name, phone, email }),
        });
        if (data?.lead) leadsCacheRef.current = [data.lead, ...leadsCacheRef.current];
      } catch (err) {
        console.error("LÃ†Â°u Ã„â€˜Ã„Æ’ng kÃƒÂ½ vÃƒÂ o API thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i:", err);
        errBox.textContent =
          "Ã¢Å¡Â Ã¯Â¸Â KhÃƒÂ´ng thÃ¡Â»Æ’ lÃ†Â°u Ã„â€˜Ã„Æ’ng kÃƒÂ½. Vui lÃƒÂ²ng kiÃ¡Â»Æ’m tra server Ã„â€˜ang chÃ¡ÂºÂ¡y.";
        errBox.style.display = "block";
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        return;
      }

      btn.innerHTML =
        '<i class="ti ti-check" style="font-size:15px"></i> Ã„ÂÃƒÂ£ Ã„â€˜Ã„Æ’ng kÃƒÂ½ Ã¢â‚¬â€ HÃ¡ÂºÂ¹n gÃ¡ÂºÂ·p bÃ¡ÂºÂ¡n 02/08!';
      btn.style.background = "var(--MU)";
      btn.style.color = "#fff";
      btn.style.cursor = "default";
    };

    const closeAdmin = () => {
      document.getElementById("admin-panel").style.display = "none";
      document.getElementById("admin-login").style.display = "none";
      document.getElementById("admin-dash").style.display = "none";
      document.getElementById("admin-pin").value = "";
    };

    const toggleAdmin = () => {
      const panel = document.getElementById("admin-panel");
      const login = document.getElementById("admin-login");
      const dash = document.getElementById("admin-dash");
      const isHidden = panel.style.display === "none";
      if (isHidden) {
        panel.style.display = "block";
        if (adminUnlockedRef.current) {
          dash.style.display = "block";
          loadLeads();
        } else {
          login.style.display = "block";
        }
        setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      } else {
        closeAdmin();
      }
    };

    const adminLogin = () => {
      const pin = document.getElementById("admin-pin").value.trim();
      const err = document.getElementById("admin-login-err");
      if (pin === ADMIN_PIN) {
        adminUnlockedRef.current = true;
        document.getElementById("admin-login").style.display = "none";
        document.getElementById("admin-dash").style.display = "block";
        err.style.display = "none";
        loadLeads();
      } else {
        err.style.display = "block";
      }
    };

    const deleteLead = async (key) => {
      if (!confirm("XoÃƒÂ¡ Ã„â€˜Ã„Æ’ng kÃƒÂ½ nÃƒÂ y?")) return;
      try {
        await requestJson("/" + encodeURIComponent(key), { method: "DELETE" });
        leadsCacheRef.current = leadsCacheRef.current.filter((l) => l.key !== key);
        renderLeads(leadsCacheRef.current);
      } catch (err) {
        console.error("KhÃƒÂ´ng xoÃƒÂ¡ Ã„â€˜Ã†Â°Ã¡Â»Â£c lead tÃ¡Â»Â« API:", err);
        alert("KhÃƒÂ´ng xoÃƒÂ¡ Ã„â€˜Ã†Â°Ã¡Â»Â£c, vui lÃƒÂ²ng kiÃ¡Â»Æ’m tra server rÃ¡Â»â€œi thÃ¡Â»Â­ lÃ¡ÂºÂ¡i.");
      }
    };

    const exportLeadsCSV = () => {
      const leads = leadsCacheRef.current;
      if (leads.length === 0) {
        alert("ChÃ†Â°a cÃƒÂ³ dÃ¡Â»Â¯ liÃ¡Â»â€¡u Ã„â€˜Ã¡Â»Æ’ xuÃ¡ÂºÂ¥t.");
        return;
      }
      const header = ["ThÃ¡Â»Âi gian", "HÃ¡Â»Â tÃƒÂªn", "SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i", "Email"];
      const rows = leads.map((l) => [
        new Date(l.ts).toLocaleString("vi-VN"),
        l.name || "",
        l.phone || "",
        l.email || "",
      ]);
      const csv = [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stocktraders_tri_an_leads_" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
    };

    /* GÃ¡ÂºÂ¯n ra window Ã„â€˜Ã¡Â»Æ’ cÃƒÂ¡c onclick="..." trong HTML tÃ„Â©nh gÃ¡Â»Âi Ã„â€˜Ã†Â°Ã¡Â»Â£c */
    window.handleSubmit = handleSubmit;
    window.toggleAdmin = toggleAdmin;
    window.adminLogin = adminLogin;
    window.closeAdmin = closeAdmin;
    window.loadLeads = loadLeads;
    window.deleteLead = deleteLead;
    window.exportLeadsCSV = exportLeadsCSV;

    /* Ã¢â€â‚¬Ã¢â€â‚¬ Countdown tÃ¡Â»â€ºi 02/08/2026 Ã¢â€â‚¬Ã¢â€â‚¬ */
    const updateCountdown = () => {
      const launch = new Date("2026-08-02T00:00:00+07:00");
      const now = new Date();
      const diff = launch - now;
      const dEl = document.getElementById("cd-d");
      const hEl = document.getElementById("cd-h");
      const mEl = document.getElementById("cd-m");
      const sEl = document.getElementById("cd-s");
      if (!dEl) return;
      if (diff <= 0) {
        dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = "00";
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      dEl.textContent = String(d).padStart(2, "0");
      hEl.textContent = String(h).padStart(2, "0");
      mEl.textContent = String(m).padStart(2, "0");
      sEl.textContent = String(s).padStart(2, "0");
    };
    updateCountdown();
    const countdownTimer = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(countdownTimer);
      delete window.handleSubmit;
      delete window.toggleAdmin;
      delete window.adminLogin;
      delete window.closeAdmin;
      delete window.loadLeads;
      delete window.deleteLead;
      delete window.exportLeadsCSV;
      injected.forEach((el) => el.remove());
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}
