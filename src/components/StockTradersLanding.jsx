import { useEffect, useRef } from "react";

/*
  StockTraders AI — Landing Page (React component)
  ----------------------------------------------------------------
  Ghi chú chuyển đổi từ bản HTML/JS thuần sang React:
  - CSS gốc được giữ nguyên 100%, nhúng qua thẻ <style>.
  - Phần layout tĩnh (nav, hero, proof, features, pricing, form, footer, admin
    panel) được giữ nguyên dưới dạng HTML string và render bằng
    dangerouslySetInnerHTML — cách này giúp bê nguyên design phức tạp (nhiều
    style inline) sang React mà không phải converts thủ công từng dòng,
    tránh phát sinh lỗi khi chuyển style="..." string -> style={{}} object.
  - Phần tương tác (countdown, scroll-reveal, xoay vòng tròn dò sóng, form
    đăng ký, admin panel quản lý khách đăng ký) được viết lại thành các hàm
    JS thật trong component, gắn vào window.* để các thuộc tính onclick="..."
    nằm trong HTML string ở trên có thể gọi tới (giữ đúng hành vi bản gốc).

  LƯU Ý VỀ LƯU TRỮ DỮ LIỆU:
  Form đăng ký gửi dữ liệu về API /api/leads. Server Node lưu dữ liệu
  vào SQLite tại info.db. Admin panel ẩn vẫn mở bằng dòng
  © 2026 StockTraders ở footer và mã PIN bên dưới.


  Mã PIN admin demo: 260726 (đổi biến ADMIN_PIN bên dưới trước khi dùng thật;
  đây chỉ là rào chắn phía client, không phải bảo mật thực sự).
*/

const CSS = `
/* ── RESET & TOKENS ── */
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0A0D14;--surf:#111520;--elev:#171D2E;--bdr:#242E42;
  --t1:#F0F4FF;--t2:#A8B8D0;--t3:#5C7090;--t4:#3A4A60;
  --G:#3DD68C;--Gs:rgba(61,214,140,.12);--Gb:rgba(61,214,140,.30);
  --MU:#1A8A4A;
  --B:#7C3AED;--Bs:rgba(124,58,237,.13);--Bb:rgba(124,58,237,.30);
  --A:#FF9F0A;--As:rgba(255,159,10,.12);--Ab:rgba(255,159,10,.28);
  --R:#FF2D55;--Rs:rgba(255,45,85,.10);--Rb:rgba(255,45,85,.25);
  --gold:#F59E0B;
}
html{scroll-behavior:smooth}
body{
  font-family:'Inter',-apple-system,sans-serif;
  background:var(--bg);color:var(--t1);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
.mono{font-family:'JetBrains Mono',monospace}

/* ── NAV ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  height:60px;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;
  background:rgba(10,13,20,.85);
  backdrop-filter:blur(16px);
  border-bottom:.5px solid var(--bdr);
  transition:background .3s;
}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-ic{
  width:34px;height:34px;border-radius:9px;
  background:linear-gradient(135deg,#7C3AED,#4F46E5);
  display:flex;align-items:center;justify-content:center;
}
.nav-brand{font-size:15px;font-weight:800;letter-spacing:-.3px}
.nav-brand span{color:var(--B)}
.nav-cta{
  background:var(--G);border:none;border-radius:9px;
  padding:9px 20px;font-size:13px;font-weight:700;
  color:#0A0D14;cursor:pointer;
  display:flex;align-items:center;gap:6px;
  transition:opacity .15s;
}
.nav-cta:hover{opacity:.88}
.discount-pill{
  background:rgba(245,158,11,.15);border:.5px solid rgba(245,158,11,.4);
  border-radius:20px;padding:5px 14px;
  font-size:12px;font-weight:700;color:var(--gold);
  display:flex;align-items:center;gap:6px;
}

/* ── HERO ── */
.hero{
  min-height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:100px 24px 60px;
  position:relative;overflow:hidden;text-align:center;
}
.hero-glow{
  position:absolute;top:-200px;left:50%;transform:translateX(-50%);
  width:900px;height:600px;
  background:radial-gradient(ellipse at center,rgba(124,58,237,.18) 0%,transparent 65%);
  pointer-events:none;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  background:var(--Bs);border:.5px solid var(--Bb);
  border-radius:20px;padding:6px 16px;
  font-size:12px;font-weight:700;color:var(--B);
  margin-bottom:28px;
  animation:fadeUp .6s ease both;
}
.ldot{width:6px;height:6px;border-radius:50%;background:var(--G);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.hero h1{
  font-size:clamp(36px,6vw,76px);font-weight:900;
  line-height:1.08;letter-spacing:-2px;
  margin-bottom:18px;
  animation:fadeUp .6s .1s ease both;
}
.hero h1 em{
  font-style:normal;
  background:linear-gradient(135deg,var(--G),#5EE7A0,var(--G));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-size:200% auto;
  animation:shine 3s linear infinite;
}
@keyframes shine{0%{background-position:0%}100%{background-position:200%}}
.hero-sub{
  font-size:clamp(15px,2vw,19px);color:var(--t2);
  max-width:580px;line-height:1.65;margin:0 auto 38px;
  animation:fadeUp .6s .2s ease both;
}
.hero-ctas{
  display:flex;align-items:center;gap:14px;justify-content:center;flex-wrap:wrap;
  margin-bottom:56px;
  animation:fadeUp .6s .3s ease both;
}
.btn-primary{
  background:var(--G);border:none;border-radius:12px;
  padding:14px 30px;font-size:15px;font-weight:800;
  color:#0A0D14;cursor:pointer;
  display:flex;align-items:center;gap:8px;
  box-shadow:0 8px 32px rgba(61,214,140,.3);
  transition:all .15s;
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(61,214,140,.4)}
.btn-secondary{
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:12px;padding:14px 28px;font-size:15px;font-weight:600;
  color:var(--t2);cursor:pointer;transition:all .15s;
}
.btn-secondary:hover{border-color:var(--t3);color:var(--t1)}

/* ── HERO DONUT ── */
.hero-visual{
  animation:fadeUp .6s .4s ease both;
  position:relative;display:inline-block;
  margin-top:28px;
}
.donut-wrap{
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:20px;padding:28px 36px;
  display:flex;align-items:center;gap:32px;
  box-shadow:0 24px 80px rgba(0,0,0,.5);
}
.donut-meta{font-size:11px;color:var(--t3);margin-bottom:20px;font-weight:600}
.donut-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-width:180px}
.ds-item{border-radius:10px;padding:10px 12px;border:.5px solid}
.ds-lbl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.ds-num{font-size:24px;font-weight:800;line-height:1;font-family:'JetBrains Mono',monospace}
.ds-pct{font-size:10px;margin-top:2px;opacity:.8}
.ds-G{background:var(--Gs);border-color:var(--Gb);color:var(--G)}
.ds-MU{background:rgba(26,138,74,.18);border-color:rgba(26,138,74,.45);color:var(--MU);box-shadow:0 4px 16px rgba(26,138,74,.3)}
.ds-A{background:var(--As);border-color:var(--Ab);color:var(--A)}
.ds-R{background:var(--Rs);border-color:var(--Rb);color:var(--R)}
.ai-badge{
  position:absolute;top:-12px;right:-10px;z-index:5;
  background:linear-gradient(135deg,#7C3AED,#4F46E5);
  border-radius:10px;padding:8px 13px;
  font-size:11px;font-weight:700;color:#fff;
  white-space:nowrap;
  box-shadow:0 4px 20px rgba(124,58,237,.5);
}

/* ── COUNTDOWN ── */
.countdown-section{
  background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(61,214,140,.05));
  border-top:.5px solid var(--bdr);border-bottom:.5px solid var(--bdr);
  padding:32px 24px;text-align:center;
}
.countdown-label{font-size:12px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px}
.countdown{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.cd-unit{text-align:center}
.cd-num{
  font-family:'JetBrains Mono',monospace;
  font-size:clamp(28px,5vw,48px);font-weight:700;
  color:var(--t1);line-height:1;
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:10px;padding:10px 18px;
  min-width:72px;display:block;
}
.cd-lbl{font-size:10px;color:var(--t4);margin-top:6px;font-weight:600;text-transform:uppercase;letter-spacing:.08em}
.cd-sep{font-size:32px;font-weight:800;color:var(--B);padding-bottom:24px;line-height:1}
.launch-note{font-size:13px;color:var(--t3);margin-top:16px}
.launch-note strong{color:var(--G)}

/* ── SECTION COMMON ── */
section{padding:80px 24px;max-width:1140px;margin:0 auto}
.section-eyebrow{
  font-size:11px;font-weight:700;color:var(--B);
  text-transform:uppercase;letter-spacing:.12em;
  margin-bottom:12px;
}
.section-title{
  font-size:clamp(26px,4vw,44px);font-weight:800;
  letter-spacing:-.5px;line-height:1.15;
  margin-bottom:16px;
}
.section-sub{font-size:16px;color:var(--t2);line-height:1.65;max-width:560px}

/* ── DATA MOAT ── */
.data-moat{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:14px;margin-top:48px;
}
.dm-card{
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:14px;padding:22px;
  position:relative;overflow:hidden;
}
.dm-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
}
.dm-card.c-G::before{background:var(--G)}
.dm-card.c-B::before{background:var(--B)}
.dm-card.c-A::before{background:var(--A)}
.dm-card.c-R::before{background:var(--R)}
.dm-num{
  font-family:'JetBrains Mono',monospace;
  font-size:42px;font-weight:700;line-height:1;
  margin-bottom:4px;
}
.dm-card.c-G .dm-num{color:var(--G)}
.dm-card.c-B .dm-num{color:var(--B)}
.dm-card.c-A .dm-num{color:var(--A)}
.dm-card.c-R .dm-num{color:var(--R)}
.dm-unit{font-size:13px;font-weight:700;color:var(--t3);margin-bottom:10px}
.dm-desc{font-size:13px;color:var(--t2);line-height:1.55}

/* ── FEATURES ── */
.features-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
  gap:14px;margin-top:48px;
}
.feat-card{
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:14px;padding:24px;
  transition:border-color .2s,transform .2s;
}
.feat-card:hover{border-color:var(--B);transform:translateY(-3px)}
.feat-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;margin-bottom:16px;
}
.feat-title{font-size:15px;font-weight:700;margin-bottom:8px}
.feat-desc{font-size:13px;color:var(--t2);line-height:1.65}
.feat-tag{
  display:inline-block;margin-top:12px;
  font-size:10px;font-weight:700;
  padding:3px 10px;border-radius:20px;
}

/* ── PROOF / CHÂN SÓNG ── */
.proof{
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:20px;overflow:hidden;margin-top:48px;
}
.proof-header{
  background:linear-gradient(135deg,rgba(61,214,140,.07),rgba(124,58,237,.07));
  padding:20px 28px;border-bottom:.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
}
.proof-title{font-size:15px;font-weight:700}
.proof-subtitle{font-size:12px;color:var(--t3);margin-top:2px}
.proof-table{width:100%;border-collapse:collapse;font-size:13px}
.proof-table th{
  padding:10px 20px;text-align:left;
  font-size:10px;font-weight:700;color:var(--t3);
  text-transform:uppercase;letter-spacing:.07em;
  background:var(--elev);border-bottom:.5px solid var(--bdr);
}
.proof-table td{padding:13px 20px;border-bottom:.5px solid rgba(36,46,66,.5);color:var(--t2)}
.proof-table tr:last-child td{border-bottom:none}
.proof-table tr:hover td{background:rgba(255,255,255,.02)}
.td-date{color:var(--t1);font-weight:600;font-family:'JetBrains Mono',monospace}
.td-pts{color:var(--G);font-weight:800;font-family:'JetBrains Mono',monospace;font-size:14px}
.td-pct{color:var(--G);font-weight:700;font-family:'JetBrains Mono',monospace}
.tag-wave{
  display:inline-block;padding:3px 10px;border-radius:6px;
  font-size:11px;font-weight:700;
}
.tag-big{background:var(--Gs);color:var(--G);border:.5px solid var(--Gb)}
.tag-med{background:var(--Bs);color:var(--B);border:.5px solid var(--Bb)}
.rel-badge{
  display:inline-flex;align-items:center;gap:5px;
  font-size:12px;font-weight:700;color:var(--G);
}
.rb-bar{
  width:50px;height:4px;background:var(--bdr);
  border-radius:2px;overflow:hidden;display:inline-block;vertical-align:middle;margin-left:5px
}
.rb-fill{height:100%;border-radius:2px;background:var(--G)}

/* ── HIGHLIGHT EVENT ── */
.event-card{
  background:linear-gradient(135deg,#0D1F12,#0A1A1F);
  border:.5px solid var(--Gb);border-radius:16px;
  padding:28px;margin-top:20px;
  display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;
}
.event-badge{
  background:var(--G);color:#0A0D14;
  font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;
  padding:4px 10px;border-radius:4px;display:inline-block;margin-bottom:10px;
}
.event-title{font-size:18px;font-weight:800;color:var(--G);margin-bottom:6px}
.event-body{font-size:13px;color:var(--t2);line-height:1.65}
.event-stats{display:flex;gap:20px;flex-wrap:wrap}
.es-item{text-align:center}
.es-num{font-size:28px;font-weight:800;font-family:'JetBrains Mono',monospace}
.es-lbl{font-size:10px;color:var(--t3);margin-top:3px;text-transform:uppercase;letter-spacing:.06em}

/* ── PRICING ── */
.pricing-wrap{
  display:grid;grid-template-columns:1fr 1fr;gap:20px;
  margin-top:48px;max-width:780px;margin-left:auto;margin-right:auto;
}
.price-card{
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:18px;padding:28px;
  position:relative;overflow:hidden;
}
.price-card.featured{
  background:linear-gradient(135deg,#1A0E40,#0E1630);
  border-color:var(--Bb);
  box-shadow:0 0 0 1px rgba(124,58,237,.2),0 24px 60px rgba(124,58,237,.15);
}
.price-label{font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.featured .price-label{color:var(--B)}
.price-orig{
  font-size:15px;font-weight:500;color:var(--t4);
  text-decoration:line-through;margin-bottom:4px;
  font-family:'JetBrains Mono',monospace;
}
.price-val{
  font-size:36px;font-weight:800;line-height:1;
  font-family:'JetBrains Mono',monospace;
  margin-bottom:4px;
}
.featured .price-val{color:var(--G)}
.price-period{font-size:12px;color:var(--t3);margin-bottom:20px}
.price-saving{
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(245,158,11,.12);border:.5px solid rgba(245,158,11,.3);
  border-radius:6px;padding:5px 11px;
  font-size:12px;font-weight:700;color:var(--gold);
  margin-bottom:20px;
}
.price-features{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.pf{display:flex;align-items:flex-start;gap:9px;font-size:13px;color:var(--t2);line-height:1.5}
.pf i{color:var(--G);margin-top:2px;flex-shrink:0;font-size:14px}
.featured .pf{color:#C4B5FD}
.featured .pf i{color:var(--G)}
.price-btn{
  width:100%;border:none;border-radius:10px;
  padding:13px;font-size:14px;font-weight:800;
  cursor:pointer;transition:all .15s;
}
.price-btn-primary{
  background:var(--G);color:#0A0D14;
  box-shadow:0 6px 24px rgba(61,214,140,.3);
}
.price-btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.price-btn-secondary{
  background:var(--elev);color:var(--t2);border:.5px solid var(--bdr);
}
.featured-badge{
  position:absolute;top:18px;right:18px;
  background:var(--B);color:#fff;
  font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;
  padding:4px 10px;border-radius:20px;
}
.bonus-card{
  background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;
  padding:20px 24px;margin-top:16px;
  display:flex;align-items:flex-start;gap:16px;
  max-width:780px;margin-left:auto;margin-right:auto;
}
.bonus-ic{
  width:44px;height:44px;border-radius:10px;
  background:var(--Bs);display:flex;align-items:center;justify-content:center;
  color:var(--B);font-size:22px;flex-shrink:0;
}
.bonus-title{font-size:14px;font-weight:700;margin-bottom:5px}
.bonus-desc{font-size:13px;color:var(--t2);line-height:1.55}

/* ── FORM ── */
.form-section{
  background:linear-gradient(135deg,rgba(124,58,237,.07),rgba(10,13,20,0));
  border-top:.5px solid var(--bdr);
}
.form-wrap{
  max-width:520px;margin:0 auto;
  padding:80px 24px;text-align:center;
}
.form-box{
  background:var(--surf);border:.5px solid var(--bdr);
  border-radius:18px;padding:32px;margin-top:36px;text-align:left;
}
.form-row{margin-bottom:16px}
.form-label{font-size:12px;font-weight:600;color:var(--t3);margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:.06em}
.form-input{
  width:100%;background:var(--elev);border:.5px solid var(--bdr);
  border-radius:9px;padding:11px 14px;
  font-size:14px;color:var(--t1);outline:none;
  font-family:'Inter',sans-serif;transition:border-color .15s;
}
.form-input:focus{border-color:var(--B)}
.form-input::placeholder{color:var(--t4)}
.form-select{
  width:100%;background:var(--elev);border:.5px solid var(--bdr);
  border-radius:9px;padding:11px 14px;
  font-size:14px;color:var(--t1);outline:none;
  font-family:'Inter',sans-serif;cursor:pointer;
  appearance:none;
}
.form-submit{
  width:100%;background:var(--G);border:none;
  border-radius:10px;padding:14px;
  font-size:15px;font-weight:800;color:#0A0D14;
  cursor:pointer;transition:all .15s;margin-top:6px;
  display:flex;align-items:center;justify-content:center;gap:8px;
}
.form-submit:hover{opacity:.9;transform:translateY(-1px)}
.form-note{font-size:11px;color:var(--t4);margin-top:14px;text-align:center;line-height:1.6}
.form-note a{color:var(--B);text-decoration:none}

/* ── FOOTER ── */
footer{
  border-top:.5px solid var(--bdr);
  padding:28px 40px;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;
  font-size:12px;color:var(--t4);
}
.footer-brand{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--t3)}

/* ── ANIMATIONS ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes spinDonut{from{stroke-dashoffset:calc(var(--dashlen) * -0.0)}to{stroke-dashoffset:calc(var(--dashlen) * -1.0)}}

/* ── SCROLL REVEAL ── */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .55s ease,transform .55s ease}
.reveal.vis{opacity:1;transform:none}

/* ── RESPONSIVE ── */
@media(max-width:700px){
  nav{padding:0 20px}
  .pricing-wrap{grid-template-columns:1fr}
  .event-card{grid-template-columns:1fr}
  .hero-visual{margin-top:40px}
  .ai-badge{top:-16px;right:8px;font-size:10px;padding:6px 10px}
  .donut-wrap{flex-direction:column;padding:22px}
  .proof-table{font-size:12px}
  .proof-table th,.proof-table td{padding:10px 14px}
}
`;

const BODY_HTML = `

<!-- ══════════ NAV ══════════ -->
<nav>
  <div class="nav-logo">
    <div class="nav-ic"><svg width="19" height="17" viewBox="0 0 230 200" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M200.55,88.45c-5.85,0-10.73,0-14.65,0V55.43h-5.59v33.02c-4.27,0-7.44,0-10.26,0v0h-2.83v69.72c14.44-11.38,25.23-27.56,30.35-45.74C199.65,106.04,200.55,94.97,200.55,88.45z"/><path fill="#fff" d="M115.23,55.43V22.28h-5.59v33.14h-13.6v40.74l-0.21,79.39c6.85,1.54,16.41,1.63,16.41,1.63c5.02,0,11.31-0.54,16.37-1.47l0.22-79.54V55.43H115.23z"/><path fill="#fff" d="M151.02,110.37V77.02h-5.59v33.35h-13.6v44.28v20.4c10.99-2.49,21.93-7.03,32.79-14.97v-5.43v-44.28H151.02z"/><path fill="#fff" d="M79.39,77.02V44.44h-5.6l-0.07,32.58H60.2v51.56v31.25c9.04,6.84,21.26,12.58,32.76,15.12l0.02-46.37V77.02H79.39z"/><path fill="#fff" d="M43.63,33.45V0.51h-5.59v32.93h-13.6v36.24v14.26v9.01c1.31,25.93,13.82,49.22,32.79,64.53v-87.8V33.45H43.63z"/><path fill="#fff" d="M112.61,180.69c-50.58,0-91.65-40.71-92.26-91.15h0v-0.18c-0.01-0.32-0.03-0.64-0.03-0.96c0-0.32,0.02-0.63,0.03-0.96v-54C9.21,50.63,2.71,66.39,2.71,88.4c0,60.69,49.2,109.9,109.9,109.9c60.7,0,109.9-49.21,109.9-109.9h-17.6C204.91,139.37,163.58,180.69,112.61,180.69z"/></svg></div>
    <div class="nav-brand">StockTraders<span> AI</span></div>
  </div>
  <div class="discount-pill">
    <i class="ti ti-bolt" style="font-size:13px"></i>
    Ưu đãi 50% · Kích hoạt 02/08/2026
  </div>
  <button class="nav-cta" onclick="document.getElementById('register').scrollIntoView({behavior:'smooth'})">
    <i class="ti ti-bolt" style="font-size:14px"></i>Đăng ký ưu đãi
  </button>
</nav>

<!-- ══════════ HERO ══════════ -->
<section class="hero">
  <div class="hero-glow"></div>

  <div class="hero-eyebrow">
    <span class="ldot"></span>
    Đúng sóng · Đúng ngành · Đi trước dòng tiền
  </div>

  <h1>
    Hệ thống dò sóng<br>
    <em>chính xác nhất</em><br>
    thị trường chứng khoán Việt
  </h1>

  <p class="hero-sub">
    Nhận diện chân sóng sớm hơn thị trường. Dữ liệu dòng tiền ngành — SMDT — 402 mã cổ phiếu theo thời gian thực.
    Lịch sử <strong style="color:var(--t1)">10 năm</strong> để AI học, để bạn tin.
  </p>

  <div class="hero-ctas">
    <button class="btn-primary" onclick="document.getElementById('register').scrollIntoView({behavior:'smooth'})">
      <i class="ti ti-bolt" style="font-size:15px"></i>Đăng ký giảm 50% ngay
    </button>
    <button class="btn-secondary" onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})">
      Khám phá tính năng <i class="ti ti-arrow-down" style="font-size:14px"></i>
    </button>
  </div>

  <!-- Donut demo -->
  <div class="hero-visual">
    <div class="ai-badge"><i class="ti ti-sparkles" style="font-size:12px"></i> AI · Tin cậy 78%</div>
    <div class="donut-wrap">
      <div>
        <div class="donut-meta">Vòng tròn dò sóng · 402 mã · 19/06/2026</div>
        <svg width="160" height="160" viewBox="0 0 160 160" id="hero-donut">
          <circle cx="80" cy="80" r="62" fill="none" stroke="var(--bdr)" stroke-width="22"/>
          <!-- Chờ mua 40.5% -->
          <circle cx="80" cy="80" r="62" fill="none" stroke="var(--G)" stroke-width="22"
            stroke-dasharray="157.2 246.8" stroke-dashoffset="0" stroke-linecap="butt"
            style="transform:rotate(-90deg);transform-origin:80px 80px"/>
          <!-- Mua 8% -->
          <circle cx="80" cy="80" r="62" fill="none" stroke="#1A8A4A" stroke-width="22"
            stroke-dasharray="31.0 373.0" stroke-dashoffset="-157.2" stroke-linecap="butt"
            style="transform:rotate(-90deg);transform-origin:80px 80px"/>
          <!-- Chờ bán 30.6% -->
          <circle cx="80" cy="80" r="62" fill="none" stroke="var(--A)" stroke-width="22"
            stroke-dasharray="118.6 285.4" stroke-dashoffset="-188.2" stroke-linecap="butt"
            style="transform:rotate(-90deg);transform-origin:80px 80px"/>
          <!-- Bán 20.9% -->
          <circle cx="80" cy="80" r="62" fill="none" stroke="var(--R)" stroke-width="22"
            stroke-dasharray="81.1 322.9" stroke-dashoffset="-306.8" stroke-linecap="butt"
            style="transform:rotate(-90deg);transform-origin:80px 80px"/>
          <text x="80" y="88" text-anchor="middle" fill="var(--t1)" font-size="32" font-weight="800" font-family="JetBrains Mono,monospace">402</text>
        </svg>
      </div>
      <div class="donut-stats">
        <div class="ds-item ds-G"><div class="ds-lbl">Chờ mua</div><div class="ds-num">163</div><div class="ds-pct">40.5%</div></div>
        <div class="ds-item ds-MU"><div class="ds-lbl">Mua</div><div class="ds-num">32</div><div class="ds-pct">8.0%</div></div>
        <div class="ds-item ds-A"><div class="ds-lbl">Chờ bán</div><div class="ds-num">123</div><div class="ds-pct">30.6%</div></div>
        <div class="ds-item ds-R"><div class="ds-lbl">Bán</div><div class="ds-num">84</div><div class="ds-pct">20.9%</div></div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ COUNTDOWN ══════════ -->
<div class="countdown-section">
  <div class="countdown-label">Web StockTraders AI chính thức ra mắt 02/08/2026 — còn</div>
  <div class="countdown">
    <div class="cd-unit"><span class="cd-num" id="cd-d">20</span><div class="cd-lbl">Ngày</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-h">00</span><div class="cd-lbl">Giờ</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-m">00</span><div class="cd-lbl">Phút</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-s">00</span><div class="cd-lbl">Giây</div></div>
  </div>
  <div class="launch-note">Đăng ký ngay hôm nay — <strong>khoá ưu đãi 50%</strong> trước khi hết hạn</div>
</div>

<!-- ══════════ DATA NUMBERS ══════════ -->
<section class="reveal">
  <div class="section-eyebrow">Dữ liệu không đối thủ</div>
  <div class="section-title">Con số nói thay<br>lời quảng cáo</div>
  <p class="section-sub">Không có hệ thống nào trên thị trường Việt cung cấp chiều sâu lịch sử và độ bao phủ như StockTraders AI.</p>

  <div class="data-moat">
    <div class="dm-card c-G">
      <div class="dm-num">10</div>
      <div class="dm-unit">năm lịch sử chân sóng</div>
      <div class="dm-desc">Toàn bộ chu kỳ thị trường từ 2015 đến nay. AI học từ hàng trăm chân sóng thực tế để nhận diện mẫu hình.</div>
    </div>
    <div class="dm-card c-B">
      <div class="dm-num">5</div>
      <div class="dm-unit">năm dữ liệu SMDT & dòng tiền</div>
      <div class="dm-desc">Truy xuất lịch sử dòng tiền ngành, dòng tiền cổ phiếu, SMDT ngành & mã — 60 tháng đầy đủ.</div>
    </div>
    <div class="dm-card c-A">
      <div class="dm-num">402</div>
      <div class="dm-unit">cổ phiếu theo dõi</div>
      <div class="dm-desc">Toàn bộ HOSE + HNX, phân loại theo 49 ngành, cập nhật tín hiệu Chờ mua / Mua / Chờ bán / Bán mỗi phiên.</div>
    </div>
    <div class="dm-card c-R">
      <div class="dm-num">49</div>
      <div class="dm-unit">ngành được phân tích</div>
      <div class="dm-desc">6 ngành chủ lực + 43 ngành phụ. Radar dòng tiền liên ngành giúp phát hiện vốn đang luân chuyển đi đâu.</div>
    </div>
  </div>
</section>

<!-- ══════════ PROOF — LỊCH SỬ CHÂN SÓNG ══════════ -->
<section class="reveal">
  <div class="section-eyebrow">Bằng chứng thực tế</div>
  <div class="section-title">Hệ thống đã báo trước<br>mọi chân sóng lớn</div>
  <p class="section-sub">Tín hiệu Chờ mua xuất hiện đúng đáy, trước khi thị trường hồi phục — không chỉ ở VN-Index, mà còn ở từng ngành và từng mã qua Dòng tiền ngành, SMDT ngành và SMDT mã. Đây không phải backtest — đây là lịch sử thực tế hệ thống đã phát tín hiệu.</p>

  <!-- 6 dòng ngành chủ lực -->
  <div style="background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;padding:20px 24px;margin-top:24px">
    <div style="font-size:13px;font-weight:700;color:var(--t3);margin-bottom:12px">
      Phương pháp luận: dẫn sóng thị trường chỉ đến từ <span style="color:var(--A)">6 dòng ngành chủ lực</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:10px">
      <span style="padding:6px 14px;border-radius:20px;background:var(--Gs);color:var(--G);border:.5px solid var(--Gb);font-size:12.5px;font-weight:700">Chứng khoán</span>
      <span style="padding:6px 14px;border-radius:20px;background:var(--Bs);color:var(--B);border:.5px solid var(--Bb);font-size:12.5px;font-weight:700">Ngân hàng</span>
      <span style="padding:6px 14px;border-radius:20px;background:var(--As);color:var(--A);border:.5px solid var(--Ab);font-size:12.5px;font-weight:700">BĐS Dân cư</span>
      <span style="padding:6px 14px;border-radius:20px;background:var(--Gs);color:var(--G);border:.5px solid var(--Gb);font-size:12.5px;font-weight:700">Xây dựng</span>
      <span style="padding:6px 14px;border-radius:20px;background:var(--As);color:var(--A);border:.5px solid var(--Ab);font-size:12.5px;font-weight:700">Thép</span>
      <span style="padding:6px 14px;border-radius:20px;background:var(--Rs);color:var(--R);border:.5px solid var(--Rb);font-size:12.5px;font-weight:700">Sóng ngành Vin</span>
    </div>
    <div style="font-size:12.5px;color:var(--t2);line-height:1.6;margin-top:12px">
      Lộ trình dẫn sóng chỉ ghi nhận một ngành là "dẫn sóng" khi SMDT vượt ngưỡng 70% và thuộc 1 trong 6 dòng chủ lực này — loại bỏ nhiễu từ hàng trăm ngành phụ, giúp tập trung đúng vào dòng tiền lớn đang vận động.
    </div>
  </div>

  <!-- Highlight event: April 9 -->
  <div class="event-card" style="margin-top:16px">
    <div>
      <div class="event-badge">Sự kiện nổi bật · Đã xác minh</div>
      <div class="event-title">09/04/2025 — Hệ thống báo Chờ mua khi VN-Index tạo đáy 1.073,61 điểm</div>
      <div class="event-body">
        Hệ thống ghi nhận <strong style="color:var(--t1)">231 mã Chờ mua</strong> tăng đột biến, phát cảnh báo "Khả năng tạo đáy mới — giải ngân thăm dò 30%". Ngành <strong style="color:var(--t1)">Chứng khoán là ngành DUY NHẤT vượt ngưỡng SMDT 70%</strong> (đạt 71,87%) ngay tại đáy — dẫn đầu bởi <strong style="color:var(--t1)">VND (88,73%), HCM (86,15%), SSI (84,09%)</strong>. Sang phiên 10/04, 175 mã chuyển trạng thái Mua (gấp 17 lần), độ tin cậy sóng đạt 82%.
      </div>
      <div style="margin-top:14px;padding:12px 16px;background:var(--Gs);border:.5px solid var(--Gb);border-radius:10px;font-size:13px;color:var(--t1)">
        📈 Trong gần 1 năm sau đó, VN-Index đi từ <strong>1.073,61 → 1.918,46 điểm</strong> — tương đương <strong style="color:var(--G)">+844 điểm (+79%)</strong>, chu kỳ tăng giá lớn nhất thị trường Việt Nam hậu đại dịch.
      </div>
    </div>
    <div class="event-stats">
      <div class="es-item">
        <div class="es-num" style="color:var(--G)">231</div>
        <div class="es-lbl">Mã Chờ mua</div>
      </div>
      <div class="es-item">
        <div class="es-num" style="color:var(--A)">71,87%</div>
        <div class="es-lbl">SMDT Chứng khoán</div>
      </div>
      <div class="es-item">
        <div class="es-num" style="color:var(--B)">82%</div>
        <div class="es-lbl">Tin cậy</div>
      </div>
    </div>
  </div>

  <!-- Highlight event: Dòng tiền ngành 28/05 -->
  <div class="event-card" style="background:linear-gradient(135deg,#150B33,#0A1A2F);border-color:var(--Bb)">
    <div>
      <div class="event-badge" style="background:var(--B)">Case study · Dòng tiền ngành & SMDT</div>
      <div class="event-title" style="color:var(--B)">28/05 — Chứng khoán bắt đầu dẫn sóng với SMDT đạt 73,3%</div>
      <div class="event-body">
        Suốt cả tháng 6, <strong style="color:var(--t1)">Chứng khoán là dòng ngành duy nhất dẫn sóng</strong> trong 6 nhóm chủ lực — đó là lý do các mã vốn hoá nhỏ ngành CK như <strong style="color:var(--t1)">CTS, FTS, BVS, ORS, VND</strong> đồng loạt tăng phi mã đúng lúc thị trường chung còn nghi ngờ.
      </div>
    </div>
    <div class="event-stats">
      <div class="es-item">
        <div class="es-num" style="color:var(--B)">73,3%</div>
        <div class="es-lbl">SMDT ngành</div>
      </div>
      <div class="es-item">
        <div class="es-num" style="color:var(--B)">1/6</div>
        <div class="es-lbl">Dòng chủ lực</div>
      </div>
    </div>
  </div>

  <!-- Highlight event: Xây dựng 07/07 + 3 dòng dẫn sóng tháng 7 -->
  <div class="event-card" style="background:linear-gradient(135deg,#0B2313,#0A1A2F);border-color:var(--Gb)">
    <div>
      <div class="event-badge" style="background:var(--G);color:#04140B">Case study · Lộ trình dẫn sóng</div>
      <div class="event-title" style="color:var(--G)">07/07 — Xây dựng dẫn sóng trở lại với SMDT vọt lên 84,9%</div>
      <div class="event-body">
        Đây là lần thứ <strong style="color:var(--t1)">5 trong năm</strong> ngành Xây dựng vượt ngưỡng SMDT 70% (gần nhất trước đó là 08/05 với 71,9%). Sang tháng 7, thị trường ghi nhận <strong style="color:var(--t1)">3 dòng cùng lúc tham gia dẫn sóng</strong>: Vin, Chứng khoán và Xây dựng — dòng tiền đang luân chuyển liên tục giữa các nhóm ngành chủ lực.
      </div>
    </div>
    <div class="event-stats">
      <div class="es-item">
        <div class="es-num" style="color:var(--G)">84,9%</div>
        <div class="es-lbl">SMDT ngành</div>
      </div>
      <div class="es-item">
        <div class="es-num" style="color:var(--G)">3</div>
        <div class="es-lbl">Dòng dẫn sóng T7</div>
      </div>
    </div>
  </div>

  <!-- Highlight event: Sóng Dầu khí 2025 - mã mạnh đi trước ngành -->
  <div class="event-card" style="background:linear-gradient(135deg,#2B1607,#0A1A2F);border-color:var(--Ab)">
    <div>
      <div class="event-badge" style="background:var(--A);color:#2B1607">Case study · Mã mạnh đi trước ngành mạnh</div>
      <div class="event-title" style="color:var(--A)">Sóng Dầu khí cuối 2025 — BSR báo hiệu trước cả ngành 1 phiên</div>
      <div class="event-body">
        16/12/2025: SMDT cổ phiếu <strong style="color:var(--t1)">BSR vọt lên 87,51%</strong> — sớm hơn ngành đúng 1 phiên. Đến 17/12, SMDT ngành <strong style="color:var(--t1)">Sản xuất & Khai thác Dầu khí mới đạt 78,68%</strong>, chính thức xác nhận ngành mạnh. PLX theo sau, đạt chuẩn mã mạnh ngày 24/12 với SMDT 74,97%. Hệ thống gửi cảnh báo tận nơi: <em>"Cổ phiếu BSR có SMDT đạt 70%"</em> — trước khi đa số nhà đầu tư kịp để ý.
      </div>
    </div>
    <div class="event-stats">
      <div class="es-item">
        <div class="es-num" style="color:var(--A)">87,51%</div>
        <div class="es-lbl">SMDT BSR</div>
      </div>
      <div class="es-item">
        <div class="es-num" style="color:var(--A)">1 phiên</div>
        <div class="es-lbl">Đi trước ngành</div>
      </div>
    </div>
  </div>

  <!-- Pull-quote: dòng tiền bên trong vs vẻ ngoài chỉ số -->
  <div class="bonus-card" style="margin-top:16px;background:linear-gradient(135deg,#150B33,#0B0F2E);border-color:var(--Bb)">
    <div class="bonus-ic" style="background:var(--B);color:#fff"><i class="ti ti-sparkles"></i></div>
    <div>
      <div class="bonus-title">"Dòng tiền luôn đi trước giá. Ngành luôn đi trước chỉ số."</div>
      <div class="bonus-desc">Từ đáy <strong style="color:var(--t1)">1.780 điểm</strong>, chỉ trong hơn 1 tháng biến động, VN-Index đã có lúc tăng lên mốc <strong style="color:var(--G)">1.894 điểm</strong> — trong khi nhiều nhà đầu tư còn nghi ngờ vùng đáy, hệ thống đã ghi nhận nhiều ngành có SMDT vượt trên 70%, báo trước dòng tiền đang âm thầm tích luỹ.</div>
    </div>
  </div>

  <!-- Table lịch sử -->
  <div class="proof">
    <div class="proof-header">
      <div>
        <div class="proof-title"><i class="ti ti-history" style="margin-right:8px;color:var(--B)"></i>Lịch sử chân sóng tiêu biểu — 10 năm gần nhất</div>
        <div class="proof-subtitle">Chỉ hiển thị các chân sóng đã hoàn thành & được xác nhận. Dữ liệu đầy đủ sau khi kích hoạt 02/08/2026.</div>
      </div>
      <div style="font-size:11px;color:var(--t4);font-weight:600">Truy xuất 10 năm · Premium only</div>
    </div>
    <div style="overflow-x:auto">
      <table class="proof-table">
        <thead>
          <tr>
            <th>Ngày tạo đáy</th>
            <th>VN-Index đáy</th>
            <th>Độ tin cậy</th>
            <th>Điểm tăng</th>
            <th>Biến động</th>
            <th>Loại sóng</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="td-date">09/04/2025</td><td>1,073.61</td><td><span class="rel-badge">82%<span class="rb-bar"><span class="rb-fill" style="width:82%"></span></span></span></td><td class="td-pts">+844đ</td><td class="td-pct">+79%</td><td><span class="tag-wave tag-big">Sóng lớn</span></td></tr>
          <tr><td class="td-date">20/02/2026</td><td>1,202.57</td><td><span class="rel-badge">76%<span class="rb-bar"><span class="rb-fill" style="width:76%"></span></span></span></td><td class="td-pts">+251đ</td><td class="td-pct">+20.84%</td><td><span class="tag-wave tag-big">Sóng lớn</span></td></tr>
          <tr><td class="td-date">10/01/2026</td><td>1,158.23</td><td><span class="rel-badge">71%<span class="rb-bar"><span class="rb-fill" style="width:71%"></span></span></span></td><td class="td-pts">+185đ</td><td class="td-pct">+15.99%</td><td><span class="tag-wave tag-med">Sóng hồi</span></td></tr>
          <tr><td class="td-date">12/11/2025</td><td>1,198.47</td><td><span class="rel-badge">73%<span class="rb-bar"><span class="rb-fill" style="width:73%"></span></span></span></td><td class="td-pts">+182đ</td><td class="td-pct">+15.21%</td><td><span class="tag-wave tag-med">Sóng hồi</span></td></tr>
          <tr><td class="td-date">19/09/2025</td><td>1,265.11</td><td><span class="rel-badge">68%<span class="rb-bar"><span class="rb-fill" style="width:68%"></span></span></span></td><td class="td-pts">+215đ</td><td class="td-pct">+16.91%</td><td><span class="tag-wave tag-med">Sóng hồi</span></td></tr>
          <tr>
            <td colspan="6" style="text-align:center;padding:16px;color:var(--t4);font-size:12px">
              <i class="ti ti-lock" style="margin-right:6px"></i>
              +47 chân sóng khác từ 2015 — mở khóa với gói Premium
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- ══════════ FEATURES ══════════ -->
<section id="features" class="reveal">
  <div class="section-eyebrow">Tính năng</div>
  <div class="section-title">Bộ công cụ đầy đủ<br>cho nhà đầu tư chuyên nghiệp</div>

  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--Gs)"><i class="ti ti-wave-sine" style="color:var(--G)"></i></div>
      <div class="feat-title">Dò sóng thị trường AI</div>
      <div class="feat-desc">Vòng tròn 4 trạng thái — Chờ mua · Mua · Chờ bán · Bán — cập nhật mỗi phiên. Kèm chỉ số Độ tin cậy và Nhật ký tín hiệu tự động.</div>
      <div class="feat-tag" style="background:var(--Gs);color:var(--G);border:.5px solid var(--Gb)">Lịch sử 10 năm</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--Bs)"><i class="ti ti-building-community" style="color:var(--B)"></i></div>
      <div class="feat-title">Dòng tiền ngành & SMDT Ngành</div>
      <div class="feat-desc">Theo dõi tín hiệu Đổ vào / Nhen nhóm / Thoát ra / Thoát liên tiếp trên 49 ngành. Heatmap SMDT ngành truy xuất 5 năm.</div>
      <div class="feat-tag" style="background:var(--Bs);color:var(--B);border:.5px solid var(--Bb)">Lịch sử 5 năm</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--As)"><i class="ti ti-chart-line" style="color:var(--A)"></i></div>
      <div class="feat-title">Dòng tiền cổ phiếu & SMDT Mã</div>
      <div class="feat-desc">402 mã phân loại 4 nhóm dòng tiền. Heatmap SMDT từng mã theo ngày, lọc theo ngành, xuất Excel.</div>
      <div class="feat-tag" style="background:var(--As);color:var(--A);border:.5px solid var(--Ab)">Lịch sử 5 năm</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--Rs)"><i class="ti ti-star" style="color:var(--R)"></i></div>
      <div class="feat-title">Top cổ phiếu mạnh</div>
      <div class="feat-desc">Danh sách mã có SMDT ≥ 70%, đúng sóng đúng ngành. Cập nhật cuối phiên, tích hợp cảnh báo dòng tiền.</div>
      <div class="feat-tag" style="background:var(--Rs);color:var(--R);border:.5px solid var(--Rb)">Realtime</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:rgba(192,132,252,.1)"><i class="ti ti-sparkles" style="color:#C084FC"></i></div>
      <div class="feat-title">AI Advisor & Nhật ký tín hiệu</div>
      <div class="feat-desc">Khuyến nghị được tạo tự động từ AI mỗi phiên: nhận diện pha thị trường, gợi ý chiến lược giải ngân theo từng tình huống.</div>
      <div class="feat-tag" style="background:rgba(192,132,252,.1);color:#C084FC;border:.5px solid rgba(192,132,252,.3)">AI · Tự động</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--elev)"><i class="ti ti-device-mobile" style="color:var(--t2)"></i></div>
      <div class="feat-title">App mobile + Web dashboard</div>
      <div class="feat-desc">Trải nghiệm đồng nhất trên điện thoại và máy tính. Gói Premium dùng chung 1 tài khoản — đăng ký trên app là dùng được ngay bản Web Dashboard đầy đủ tính năng, không cần mua thêm gói riêng.</div>
      <div class="feat-tag" style="background:var(--Gs);color:var(--G);border:.5px solid var(--Gb)">1 tài khoản · App & Web</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--Bs)"><i class="ti ti-clipboard-check" style="color:var(--B)"></i></div>
      <div class="feat-title">Phân tích danh mục AI</div>
      <div class="feat-desc">Nhập tối đa 15 mã đang nắm giữ, chỉ sau <strong style="color:var(--t1)">30 giây</strong> AI chấm Điểm phù hợp /100 và phân loại 4 nhóm: Đúng sóng-Đúng ngành, Đúng sóng-Sai ngành, Đúng ngành-Sai sóng, Sai cả hai.</div>
      <div class="feat-tag" style="background:var(--Bs);color:var(--B);border:.5px solid var(--Bb)">AI chấm điểm /100</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon" style="background:var(--Gs)"><i class="ti ti-timeline" style="color:var(--G)"></i></div>
      <div class="feat-title">Lộ trình dẫn sóng ngành</div>
      <div class="feat-desc">Timeline trực quan theo tháng, đánh dấu mọi lần ngành vượt ngưỡng SMDT 70% và 100% — giúp nhận diện ngành nào đang dẫn dắt dòng tiền trước thị trường.</div>
      <div class="feat-tag" style="background:var(--Gs);color:var(--G);border:.5px solid var(--Gb)">Theo dõi 49 ngành</div>
    </div>
  </div>

  <!-- Dẫn chứng thật: Phân tích danh mục -->
  <div class="bonus-card" style="margin-top:14px">
    <div class="bonus-ic"><i class="ti ti-check"></i></div>
    <div>
      <div class="bonus-title">Ví dụ thực tế từ hệ thống</div>
      <div class="bonus-desc">Danh mục <strong style="color:var(--t1)">MSR · GAS · BSR · DIG · HDG</strong> được AI chấm <strong style="color:var(--G)">100/100 điểm phù hợp</strong> — 100% đúng sóng đúng ngành, nhận xét: "Danh mục mạnh, duy trì và theo dõi tín hiệu bán."</div>
    </div>
  </div>
</section>

<!-- ══════════ PRICING ══════════ -->
<section id="pricing" class="reveal" style="text-align:center">
  <div class="section-eyebrow">Ưu đãi ra mắt</div>
  <div class="section-title">Khoá giá ngay — trước 02/08/2026</div>
  <p class="section-sub" style="margin:0 auto 0">Đăng ký hôm nay để giữ mức giá ưu đãi. Hệ thống kích hoạt chính thức ngày 02/08/2026.</p>

  <div class="pricing-wrap">
    <!-- Gói thường -->
    <div class="price-card">
      <div class="price-label">Giá thông thường</div>
      <div class="price-val" style="color:var(--t3)">8.860.000</div>
      <div class="price-period">đồng / tháng</div>
      <div class="price-features">
        <div class="pf"><i class="ti ti-check"></i>Dò sóng thị trường</div>
        <div class="pf"><i class="ti ti-check"></i>Dòng tiền ngành & mã</div>
        <div class="pf"><i class="ti ti-check"></i>Bảng SMDT ngành & mã</div>
        <div class="pf" style="color:var(--t4)"><i class="ti ti-x" style="color:var(--t4)"></i>Lịch sử chân sóng 10 năm</div>
        <div class="pf" style="color:var(--t4)"><i class="ti ti-x" style="color:var(--t4)"></i>Dữ liệu 5 năm</div>
        <div class="pf" style="color:var(--t4)"><i class="ti ti-x" style="color:var(--t4)"></i>Truy cập Web Dashboard</div>
      </div>
      <button class="price-btn price-btn-secondary">Giá hiện tại</button>
    </div>

    <!-- Gói ưu đãi -->
    <div class="price-card featured">
      <div class="featured-badge">⚡ Ưu đãi</div>
      <div class="price-label">Đăng ký trước 02/08</div>
      <div class="price-orig">8.860.000 đ/tháng</div>
      <div class="price-val">4.430.000</div>
      <div class="price-period">đồng / tháng · Giảm 50%</div>
      <div class="price-saving"><i class="ti ti-tag" style="font-size:13px"></i>Tiết kiệm 4.430.000đ mỗi tháng</div>
      <div class="price-features">
        <div class="pf"><i class="ti ti-check"></i>Toàn bộ tính năng Premium</div>
        <div class="pf"><i class="ti ti-check"></i>Lịch sử chân sóng <strong>10 năm</strong></div>
        <div class="pf"><i class="ti ti-check"></i>Dữ liệu SMDT & dòng tiền <strong>5 năm</strong></div>
        <div class="pf"><i class="ti ti-check"></i>AI Advisor cá nhân hoá</div>
        <div class="pf"><i class="ti ti-check"></i>Cảnh báo dòng tiền realtime</div>
        <div class="pf"><i class="ti ti-check"></i>Web Dashboard đầy đủ <strong>đi kèm gói Premium</strong></div>
      </div>
      <button class="price-btn price-btn-primary" onclick="document.getElementById('register').scrollIntoView({behavior:'smooth'})">
        <i class="ti ti-bolt" style="font-size:14px"></i>Đăng ký ưu đãi ngay
      </button>
    </div>
  </div>

  <!-- Bonus note -->
  <div class="bonus-card" style="margin-top:16px">
    <div class="bonus-ic"><i class="ti ti-gift"></i></div>
    <div>
      <div class="bonus-title">💻 Web Dashboard đầy đủ tính năng — dùng chung tài khoản Premium</div>
      <div class="bonus-desc">Đăng ký gói Premium (trên app), tài khoản của bạn dùng được ngay bản Web Dashboard với đầy đủ 9 module phân tích — Dò sóng, SMDT, Dòng tiền ngành, Top cổ phiếu mạnh — tối ưu cho màn hình lớn. Đây là tính năng thuộc gói Premium, không phải bản dùng thử miễn phí; cần tài khoản Premium đang hoạt động để sử dụng. <strong style="color:var(--t1)">Web chính thức ra mắt ngày 02/08/2026.</strong></div>
    </div>
  </div>

  <div style="margin-top:16px;font-size:12px;color:var(--t4);line-height:1.7">
    * Phân tích và dữ liệu chỉ mang tính chất tham khảo, không phải khuyến nghị đầu tư.<br>
    Nhà đầu tư tự chịu trách nhiệm với quyết định của mình.
  </div>
</section>

<!-- ══════════ REGISTER FORM ══════════ -->
<div class="form-section" id="register">
  <div class="form-wrap">
    <div class="section-eyebrow" style="text-align:center">Đăng ký ưu đãi</div>
    <div class="section-title" style="font-size:clamp(22px,4vw,36px)">Khoá giá 50%<br>trước 02/08/2026</div>
    <p style="font-size:14px;color:var(--t3);margin-top:10px">Điền thông tin, đội ngũ sẽ liên hệ xác nhận và hướng dẫn kích hoạt.</p>

    <div class="form-box">
      <div class="form-row">
        <label class="form-label">Họ và tên *</label>
        <input class="form-input" id="lead-name" type="text" placeholder="Nguyễn Văn A">
      </div>
      <div class="form-row">
        <label class="form-label">Số điện thoại *</label>
        <input class="form-input" id="lead-phone" type="tel" placeholder="0901 234 567">
      </div>
      <div class="form-row">
        <label class="form-label">Email</label>
        <input class="form-input" id="lead-email" type="email" placeholder="email@example.com">
      </div>
      <div class="form-row">
        <label class="form-label">Kinh nghiệm đầu tư</label>
        <select class="form-select" id="lead-exp">
          <option value="">Chọn mức kinh nghiệm</option>
          <option>Dưới 1 năm</option>
          <option>1 – 3 năm</option>
          <option>3 – 5 năm</option>
          <option>Trên 5 năm</option>
        </select>
      </div>
      <div id="form-error" style="display:none;color:var(--R);font-size:12.5px;margin-bottom:10px"></div>
      <button class="form-submit" id="form-submit-btn" onclick="handleSubmit(event)">
        <i class="ti ti-bolt" style="font-size:15px"></i>
        Đăng ký nhận ưu đãi 50%
      </button>
      <div class="form-note">
        Bằng cách đăng ký, bạn đồng ý nhận thông tin về StockTraders AI.<br>
        Chúng tôi không chia sẻ thông tin của bạn với bên thứ ba.<br>
        <a href="#">Chính sách bảo mật</a>
      </div>
    </div>
  </div>
</div>

<!-- ══════════ ADMIN — QUẢN LÝ KHÁCH ĐĂNG KÝ (ẩn, kích hoạt từ footer) ══════════ -->
<div class="form-section" id="admin-panel" style="padding-top:0;display:none">
  <div class="form-wrap" style="max-width:920px">
    <div id="admin-login" style="display:none;max-width:340px;margin:16px auto 0;background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;padding:20px">
      <div style="font-size:13px;color:var(--t2);margin-bottom:10px">Nhập mã truy cập để xem danh sách khách đăng ký</div>
      <input id="admin-pin" type="password" placeholder="Mã PIN" style="width:100%;background:var(--elev);border:.5px solid var(--bdr);border-radius:8px;padding:10px 12px;color:var(--t1);font-size:14px;margin-bottom:10px" onkeydown="if(event.key==='Enter')adminLogin()">
      <button onclick="adminLogin()" style="width:100%;background:var(--B);color:#fff;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">Truy cập</button>
      <div id="admin-login-err" style="display:none;color:var(--R);font-size:12px;margin-top:8px">Sai mã PIN, vui lòng thử lại.</div>
    </div>

    <div id="admin-dash" style="display:none;margin-top:16px;background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;padding:20px;overflow-x:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div style="font-size:15px;font-weight:700">Danh sách khách đăng ký <span id="admin-count" style="color:var(--t3);font-weight:400">(0)</span></div>
        <div style="display:flex;gap:8px">
          <button onclick="loadLeads()" style="background:var(--elev);border:.5px solid var(--bdr);color:var(--t2);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer"><i class="ti ti-refresh" style="font-size:12px"></i> Làm mới</button>
          <button onclick="exportLeadsCSV()" style="background:var(--Gs);border:.5px solid var(--Gb);color:var(--G);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer"><i class="ti ti-download" style="font-size:12px"></i> Xuất CSV</button>
          <button onclick="closeAdmin()" style="background:none;border:.5px solid var(--bdr);color:var(--t3);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer">Đóng</button>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px" id="admin-table">
        <thead>
          <tr style="text-align:left;color:var(--t3);border-bottom:.5px solid var(--bdr)">
            <th style="padding:8px 10px">Thời gian</th>
            <th style="padding:8px 10px">Họ tên</th>
            <th style="padding:8px 10px">SĐT</th>
            <th style="padding:8px 10px">Email</th>
            <th style="padding:8px 10px">Kinh nghiệm</th>
            <th style="padding:8px 10px"></th>
          </tr>
        </thead>
        <tbody id="admin-tbody">
          <tr><td colspan="6" style="padding:20px 10px;color:var(--t4);text-align:center">Đang tải...</td></tr>
        </tbody>
      </table>
      <div style="margin-top:12px;font-size:11.5px;color:var(--t4)">
        * Dữ liệu lưu trong info.db. Bấm dòng © 2026 StockTraders ở footer và nhập PIN để xem danh sách.
      </div>
    </div>
  </div>
</div>

<!-- ══════════ FOOTER ══════════ -->
<footer>
  <div class="footer-brand">
    <div class="nav-ic" style="width:28px;height:28px;border-radius:7px"><svg width="15" height="13" viewBox="0 0 230 200" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M200.55,88.45c-5.85,0-10.73,0-14.65,0V55.43h-5.59v33.02c-4.27,0-7.44,0-10.26,0v0h-2.83v69.72c14.44-11.38,25.23-27.56,30.35-45.74C199.65,106.04,200.55,94.97,200.55,88.45z"/><path fill="#fff" d="M115.23,55.43V22.28h-5.59v33.14h-13.6v40.74l-0.21,79.39c6.85,1.54,16.41,1.63,16.41,1.63c5.02,0,11.31-0.54,16.37-1.47l0.22-79.54V55.43H115.23z"/><path fill="#fff" d="M151.02,110.37V77.02h-5.59v33.35h-13.6v44.28v20.4c10.99-2.49,21.93-7.03,32.79-14.97v-5.43v-44.28H151.02z"/><path fill="#fff" d="M79.39,77.02V44.44h-5.6l-0.07,32.58H60.2v51.56v31.25c9.04,6.84,21.26,12.58,32.76,15.12l0.02-46.37V77.02H79.39z"/><path fill="#fff" d="M43.63,33.45V0.51h-5.59v32.93h-13.6v36.24v14.26v9.01c1.31,25.93,13.82,49.22,32.79,64.53v-87.8V33.45H43.63z"/><path fill="#fff" d="M112.61,180.69c-50.58,0-91.65-40.71-92.26-91.15h0v-0.18c-0.01-0.32-0.03-0.64-0.03-0.96c0-0.32,0.02-0.63,0.03-0.96v-54C9.21,50.63,2.71,66.39,2.71,88.4c0,60.69,49.2,109.9,109.9,109.9c60.7,0,109.9-49.21,109.9-109.9h-17.6C204.91,139.37,163.58,180.69,112.61,180.69z"/></svg></div>
    StockTraders AI
  </div>
  <div onclick="toggleAdmin()" style="cursor:default;user-select:none">© 2026 StockTraders · Hoạt động từ 2013 · Dữ liệu HOSE + HNX</div>
  <div style="font-size:11px;color:var(--t4);max-width:380px;text-align:right;line-height:1.6">
    Dữ liệu và phân tích chỉ mang tính chất tham khảo. Không phải khuyến nghị đầu tư.
  </div>
</footer>

`;

export default function StockTradersLanding() {
  const rootRef = useRef(null);
  const leadsCacheRef = useRef([]);
  const adminUnlockedRef = useRef(false);

  useEffect(() => {
    /* ── Load font & icon CDN (bỏ qua nếu app đã có) ── */
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

    const ADMIN_PIN = "9983"; // demo PIN — đổi khi triển khai thật
    const API_BASE = "/api";

    const requestJson = async (path, options = {}) => {
      const res = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Lỗi kết nối API (${res.status})`);
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
          '<tr><td colspan="6" style="padding:20px 10px;color:var(--t4);text-align:center">Chưa có khách đăng ký nào.</td></tr>';
        return;
      }
      tbody.innerHTML = leads
        .map((l) => {
          const d = new Date(l.ts);
          const dateStr = isNaN(d) ? "" : d.toLocaleString("vi-VN");
          return `<tr style="border-bottom:.5px solid var(--bdr)">
      <td style="padding:9px 10px;color:var(--t3);white-space:nowrap">${dateStr}</td>
      <td style="padding:9px 10px;color:var(--t1);font-weight:600">${escapeHtml(l.name || "")}</td>
      <td style="padding:9px 10px">${escapeHtml(l.phone || "")}</td>
      <td style="padding:9px 10px;color:var(--t2)">${escapeHtml(l.email || "—")}</td>
      <td style="padding:9px 10px;color:var(--t2)">${escapeHtml(l.exp || "—")}</td>
      <td style="padding:9px 10px;text-align:right"><button onclick="deleteLead('${l.key}')" style="background:none;border:none;color:var(--R);cursor:pointer;font-size:12px"><i class="ti ti-trash"></i></button></td>
    </tr>`;
        })
        .join("");
    };

    const loadLeads = async () => {
      const tbody = document.getElementById("admin-tbody");
      if (!tbody) return;
      tbody.innerHTML =
        '<tr><td colspan="6" style="padding:20px 10px;color:var(--t4);text-align:center">Đang tải...</td></tr>';
      try {
        const data = await requestJson("/leads");
        const leads = Array.isArray(data?.leads) ? data.leads : [];
        leadsCacheRef.current = leads;
        renderLeads(leads);
      } catch (err) {
        console.error("Không tải được leads từ API:", err);
        tbody.innerHTML =
          '<tr><td colspan="6" style="padding:20px 10px;color:var(--R);text-align:center">Không kết nối được API lưu đăng ký.</td></tr>';
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("form-submit-btn");
      const errBox = document.getElementById("form-error");
      const name = document.getElementById("lead-name").value.trim();
      const phone = document.getElementById("lead-phone").value.trim();
      const email = document.getElementById("lead-email").value.trim();
      const exp = document.getElementById("lead-exp").value;

      errBox.style.display = "none";
      if (!name || !phone) {
        errBox.textContent = "Vui lòng nhập đầy đủ Họ tên và Số điện thoại.";
        errBox.style.display = "block";
        return;
      }

      btn.disabled = true;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = "Đang gửi...";

      try {
        const data = await requestJson("/leads", {
          method: "POST",
          body: JSON.stringify({ name, phone, email, exp }),
        });
        if (data?.lead) leadsCacheRef.current = [data.lead, ...leadsCacheRef.current];
      } catch (err) {
        console.error("Lưu đăng ký vào API thất bại:", err);
        errBox.textContent =
          "⚠️ Không thể lưu đăng ký. Vui lòng kiểm tra server đang chạy.";
        errBox.style.display = "block";
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        return;
      }

      btn.innerHTML =
        '<i class="ti ti-check" style="font-size:15px"></i> Đã nhận đăng ký — Đội ngũ sẽ liên hệ sớm!';
      btn.style.background = "var(--MU)";
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
      const pin = document.getElementById("admin-pin").value;
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
      if (!confirm("Xoá khách đăng ký này?")) return;
      try {
        await requestJson("/leads/" + encodeURIComponent(key), { method: "DELETE" });
        leadsCacheRef.current = leadsCacheRef.current.filter((l) => l.key !== key);
        renderLeads(leadsCacheRef.current);
      } catch (err) {
        console.error("Không xoá được lead từ API:", err);
        alert("Không xoá được, vui lòng kiểm tra server rồi thử lại.");
      }
    };

    const exportLeadsCSV = () => {
      const leads = leadsCacheRef.current;
      if (leads.length === 0) {
        alert("Chưa có dữ liệu để xuất.");
        return;
      }
      const header = ["Thời gian", "Họ tên", "Số điện thoại", "Email", "Kinh nghiệm"];
      const rows = leads.map((l) => [
        new Date(l.ts).toLocaleString("vi-VN"),
        l.name || "",
        l.phone || "",
        l.email || "",
        l.exp || "",
      ]);
      const csv = [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stocktraders_leads_" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
    };

    /* Gắn ra window để các onclick="..." trong HTML tĩnh gọi được */
    window.handleSubmit = handleSubmit;
    window.toggleAdmin = toggleAdmin;
    window.adminLogin = adminLogin;
    window.closeAdmin = closeAdmin;
    window.loadLeads = loadLeads;
    window.deleteLead = deleteLead;
    window.exportLeadsCSV = exportLeadsCSV;

    /* ── Countdown tới 02/08/2026 ── */
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

    /* ── Scroll reveal ── */
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("vis");
        });
      },
      { threshold: 0.12 }
    );
    const revealEls = rootRef.current
      ? rootRef.current.querySelectorAll(".reveal")
      : [];
    revealEls.forEach((el) => obs.observe(el));

    /* ── Vòng tròn dò sóng: xoay nhẹ + breathing pulse ── */
    const circles = document.querySelectorAll("#hero-donut circle:not(:first-child)");
    let angle = 0;
    const rotateInterval = setInterval(() => {
      angle += 0.08;
      circles.forEach((c) => {
        c.setAttribute(
          "style",
          `transform:rotate(${-90 + angle * 0.3}deg);transform-origin:80px 80px`
        );
      });
    }, 50);

    const wrap = document.querySelector(".donut-wrap");
    let scale = 1,
      dir = 0.0003;
    const breatheInterval = setInterval(() => {
      if (!wrap) return;
      scale += dir;
      if (scale > 1.008 || scale < 1) dir *= -1;
      wrap.style.transform = `scale(${scale})`;
    }, 30);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(rotateInterval);
      clearInterval(breatheInterval);
      obs.disconnect();
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
