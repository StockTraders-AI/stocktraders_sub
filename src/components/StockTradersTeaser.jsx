import { useEffect, useRef } from "react";

/*
  StockTraders AI — Teaser "Sắp ra mắt" (React component)
  ----------------------------------------------------------------
  Cùng cách chuyển đổi như bản landing bán hàng chính:
  - CSS gốc giữ nguyên 100%, nhúng qua <style>.
  - Layout tĩnh (nav, hero, tease grid, proof strip, signup, footer, admin
    panel) giữ nguyên dưới dạng HTML string, render qua dangerouslySetInnerHTML.
  - Phần tương tác (đếm ngược, form đăng ký nhận thông báo, admin panel) là
    hàm JS thật trong component, gắn ra window.* để onclick="..." trong HTML
    tĩnh gọi được.

  Form đăng ký gửi dữ liệu về API /api/teaser-leads. Server Node lưu dữ liệu
  vào SQLite tại info.db, bảng teaser_leads. Admin panel ẩn vẫn mở bằng dòng
  © 2026 StockTraders ở footer và mã PIN bên dưới.


  Dữ liệu teaser được tách riêng với danh sách khách đăng ký mua ở component StockTradersLanding.

  Mã PIN admin demo: 260726 (đổi biến ADMIN_PIN bên dưới trước khi dùng thật).
*/

const CSS = `
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

/* ── NAV ── */
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

/* ── HERO ── */
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

/* ── SECTION shared ── */
section{position:relative;z-index:2;max-width:1080px;margin:0 auto;padding:70px 24px}
.section-eyebrow{
  font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--B);
  text-align:center;margin-bottom:12px;
}
.section-title{font-size:30px;font-weight:800;letter-spacing:-.6px;text-align:center;margin-bottom:14px}
.section-sub{font-size:15px;color:var(--t2);text-align:center;max-width:540px;margin:0 auto 44px;line-height:1.7}

/* ── TEASE GRID ── */
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

/* ── PROOF STRIP ── */
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

/* ── SIGNUP ── */
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

/* ── FOOTER ── */
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
`;

const BODY_HTML = `

<nav>
  <div class="nav-logo">
    <div class="nav-ic"><svg width="19" height="17" viewBox="0 0 230 200" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M200.55,88.45c-5.85,0-10.73,0-14.65,0V55.43h-5.59v33.02c-4.27,0-7.44,0-10.26,0v0h-2.83v69.72c14.44-11.38,25.23-27.56,30.35-45.74C199.65,106.04,200.55,94.97,200.55,88.45z"/><path fill="#fff" d="M115.23,55.43V22.28h-5.59v33.14h-13.6v40.74l-0.21,79.39c6.85,1.54,16.41,1.63,16.41,1.63c5.02,0,11.31-0.54,16.37-1.47l0.22-79.54V55.43H115.23z"/><path fill="#fff" d="M151.02,110.37V77.02h-5.59v33.35h-13.6v44.28v20.4c10.99-2.49,21.93-7.03,32.79-14.97v-5.43v-44.28H151.02z"/><path fill="#fff" d="M79.39,77.02V44.44h-5.6l-0.07,32.58H60.2v51.56v31.25c9.04,6.84,21.26,12.58,32.76,15.12l0.02-46.37V77.02H79.39z"/><path fill="#fff" d="M43.63,33.45V0.51h-5.59v32.93h-13.6v36.24v14.26v9.01c1.31,25.93,13.82,49.22,32.79,64.53v-87.8V33.45H43.63z"/><path fill="#fff" d="M112.61,180.69c-50.58,0-91.65-40.71-92.26-91.15h0v-0.18c-0.01-0.32-0.03-0.64-0.03-0.96c0-0.32,0.02-0.63,0.03-0.96v-54C9.21,50.63,2.71,66.39,2.71,88.4c0,60.69,49.2,109.9,109.9,109.9c60.7,0,109.9-49.21,109.9-109.9h-17.6C204.91,139.37,163.58,180.69,112.61,180.69z"/></svg></div>
    <div class="nav-brand">StockTraders<span> AI</span></div>
  </div>
  <div class="nav-pill"><span class="dot"></span> ĐANG XÂY DỰNG</div>
</nav>

<!-- ══════════ HERO ══════════ -->
<div class="hero">
  <div class="hero-eyebrow"><i class="ti ti-eye-off" style="font-size:13px"></i> Chưa ai được thấy — trừ bạn, sắp thôi</div>
  <h1>Có điều gì đó<br>đang được <span class="grad">xây dựng</span>.</h1>
  <p class="hero-sub">
    Không phải một bản cập nhật thông thường. Đây là cách StockTraders AI nhìn dòng tiền thị trường — được đưa lên một tầm hoàn toàn khác. Chúng tôi chưa sẵn sàng nói hết, nhưng bạn xứng đáng là người biết trước.
  </p>

  <div class="countdown-box">
    <div class="cd-unit"><span class="cd-num" id="cd-d">00</span><div class="cd-lbl">Ngày</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-h">00</span><div class="cd-lbl">Giờ</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-m">00</span><div class="cd-lbl">Phút</div></div>
    <div class="cd-sep">:</div>
    <div class="cd-unit"><span class="cd-num" id="cd-s">00</span><div class="cd-lbl">Giây</div></div>
  </div>
  <div class="hero-date">Mở khoá lúc <strong>00:00 · 02/08/2026</strong></div>

  <div class="peek-wrap">
    <div class="peek-card">
      <div style="display:flex;gap:28px;align-items:center">
        <svg width="120" height="120" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="66" fill="none" stroke="var(--bdr)" stroke-width="16"/>
          <circle cx="80" cy="80" r="66" fill="none" stroke="var(--G)" stroke-width="16" stroke-dasharray="180 415" stroke-linecap="round" transform="rotate(-90 80 80)"/>
          <circle cx="80" cy="80" r="66" fill="none" stroke="var(--B)" stroke-width="16" stroke-dasharray="90 415" stroke-dashoffset="-180" stroke-linecap="round" transform="rotate(-90 80 80)"/>
          <circle cx="80" cy="80" r="66" fill="none" stroke="var(--A)" stroke-width="16" stroke-dasharray="70 415" stroke-dashoffset="-270" stroke-linecap="round" transform="rotate(-90 80 80)"/>
          <text x="80" y="86" text-anchor="middle" font-size="30" font-weight="800" fill="var(--t1)" font-family="JetBrains Mono">?</text>
        </svg>
        <div style="text-align:left">
          <div class="skel-bar" style="width:140px"></div>
          <div class="skel-bar" style="width:100px"></div>
          <div class="skel-bar" style="width:120px"></div>
        </div>
      </div>
    </div>
    <div class="peek-lock">
      <div class="peek-lock-ic"><i class="ti ti-lock" style="color:#fff;font-size:20px"></i></div>
      <div class="peek-lock-txt">Sẽ mở khoá 02/08/2026</div>
    </div>
  </div>
</div>

<!-- ══════════ TEASE FEATURES ══════════ -->
<section>
  <div class="section-eyebrow">Hé lộ một phần</div>
  <div class="section-title">4 điều sắp thay đổi<br>cách bạn nhìn thị trường</div>
  <p class="section-sub">Mỗi thứ dưới đây đều đủ sức đổi cách bạn giao dịch. Gộp cả 4 lại — chúng tôi nghĩ bạn sẽ hiểu vì sao mình giữ kín đến giờ.</p>

  <div class="tease-grid">
    <div class="tease-card">
      <div class="tease-top">
        <div class="tease-ic" style="background:var(--Bs)"><i class="ti ti-device-desktop" style="color:var(--B);font-size:19px"></i></div>
        <div>
          <div class="tease-name">Điều #1 — Màn hình lớn</div>
          <div class="tease-tag">Lần đầu tiên</div>
        </div>
      </div>
      <div class="tease-hook">Mọi thứ bạn quen dùng trên điện thoại, giờ có một phiên bản mà chúng tôi tin bạn sẽ không muốn tắt tab.</div>
      <div class="skel-wrap">
        <div class="skel-inner">
          <div class="skel-bar" style="width:70%"></div>
          <div class="skel-bar" style="width:45%"></div>
          <div class="skel-bar" style="width:85%"></div>
          <div class="skel-bar" style="width:30%"></div>
        </div>
        <div class="skel-lock-overlay"><i class="ti ti-lock"></i></div>
      </div>
    </div>

    <div class="tease-card">
      <div class="tease-top">
        <div class="tease-ic" style="background:var(--Gs)"><i class="ti ti-clipboard-check" style="color:var(--G);font-size:19px"></i></div>
        <div>
          <div class="tease-name">Điều #2 — 30 giây sự thật</div>
          <div class="tease-tag">AI chấm điểm</div>
        </div>
      </div>
      <div class="tease-hook">Danh mục bạn đang cầm — đúng sóng hay đang lạc nhịp? Câu trả lời sẽ không còn mất hàng giờ để tự tìm.</div>
      <div class="skel-wrap">
        <div class="skel-inner" style="display:flex;align-items:center;justify-content:center">
          <svg width="60" height="60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bdr)" stroke-width="10"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--G)" stroke-width="10" stroke-dasharray="220 251" stroke-linecap="round" transform="rotate(-90 50 50)"/>
          </svg>
        </div>
        <div class="skel-lock-overlay"><i class="ti ti-lock"></i></div>
      </div>
    </div>

    <div class="tease-card">
      <div class="tease-top">
        <div class="tease-ic" style="background:var(--As)"><i class="ti ti-route" style="color:var(--A);font-size:19px"></i></div>
        <div>
          <div class="tease-name">Điều #3 — Dòng tiền không đứng yên</div>
          <div class="tease-tag">Theo dõi luân chuyển</div>
        </div>
      </div>
      <div class="tease-hook">Ngành này vừa dẫn sóng, ngành kia sắp tiếp quản. Nhìn thấy sự luân chuyển đó trước khi giá kịp phản ứng.</div>
      <div class="skel-wrap">
        <div class="skel-inner" style="display:flex;align-items:flex-end;gap:6px;padding:14px">
          <div style="width:14px;height:30%;background:var(--A);border-radius:3px 3px 0 0"></div>
          <div style="width:14px;height:55%;background:var(--G);border-radius:3px 3px 0 0"></div>
          <div style="width:14px;height:40%;background:var(--bdr);border-radius:3px 3px 0 0"></div>
          <div style="width:14px;height:75%;background:var(--B);border-radius:3px 3px 0 0"></div>
          <div style="width:14px;height:25%;background:var(--bdr);border-radius:3px 3px 0 0"></div>
        </div>
        <div class="skel-lock-overlay"><i class="ti ti-lock"></i></div>
      </div>
    </div>

    <div class="tease-card">
      <div class="tease-top">
        <div class="tease-ic" style="background:var(--Rs)"><i class="ti ti-bell-ringing" style="color:var(--R);font-size:19px"></i></div>
        <div>
          <div class="tease-name">Điều #4 — Tận nơi, đúng lúc</div>
          <div class="tease-tag">Không cần mở app</div>
        </div>
      </div>
      <div class="tease-hook">Khi dòng tiền lớn bắt đầu di chuyển, bạn sẽ là người biết trước — không phải người đọc tin sau cùng.</div>
      <div class="skel-wrap">
        <div class="skel-inner" style="padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <div style="width:22px;height:22px;border-radius:6px;background:var(--B)"></div>
            <div class="skel-bar" style="width:60%;margin:0"></div>
          </div>
          <div class="skel-bar" style="width:90%"></div>
          <div class="skel-bar" style="width:50%"></div>
        </div>
        <div class="skel-lock-overlay"><i class="ti ti-lock"></i></div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ PROOF TEASER ══════════ -->
<section style="padding-top:0">
  <div class="proof-strip">
    <div class="proof-item">
      <div class="proof-num" style="color:var(--G)">+844đ</div>
      <div class="proof-lbl">VN-Index tăng sau tín hiệu 09/04/2025</div>
    </div>
    <div class="proof-item">
      <div class="proof-num" style="color:var(--B)">231</div>
      <div class="proof-lbl">Mã Chờ mua được ghi nhận đúng tại đáy</div>
    </div>
    <div class="proof-item">
      <div class="proof-num" style="color:var(--A)">49</div>
      <div class="proof-lbl">Ngành được theo dõi dòng tiền mỗi ngày</div>
    </div>
    <div class="proof-item">
      <div class="proof-num" style="color:var(--t1)">3+ năm</div>
      <div class="proof-lbl">Vận hành cùng nhà đầu tư thực chiến</div>
    </div>
  </div>
  <div class="proof-note">Đây là những gì hệ thống hiện tại đã làm được. Phiên bản sắp ra mắt được xây để làm tốt hơn thế.</div>
</section>

<!-- ══════════ SIGNUP ══════════ -->
<section id="signup">
  <div class="section-eyebrow">Đừng để bị bỏ lỡ</div>
  <div class="section-title">Là người đầu tiên<br>được mở khoá</div>
  <p class="section-sub">Để lại thông tin — khi cánh cửa mở lúc 00:00 ngày 02/08/2026, bạn sẽ là người nhận được thông báo trước tất cả.</p>

  <div class="signup-box">
    <div class="form-row">
      <label class="form-label">Họ và tên</label>
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
    <div id="form-error" style="display:none;color:var(--R);font-size:12.5px;margin-bottom:6px"></div>
    <button class="signup-btn" id="form-submit-btn" onclick="handleSubmit(event)">
      <i class="ti ti-bell" style="font-size:15px"></i> Báo tôi khi mở khoá
    </button>
    <div class="signup-note">
      Chúng tôi chỉ gửi 1 thông báo duy nhất khi web chính thức ra mắt.<br>Không chia sẻ thông tin của bạn với bên thứ ba.
    </div>
  </div>
</section>

<footer>
  <div onclick="toggleAdmin()" style="cursor:default;user-select:none">© 2026 StockTraders AI · Sắp ra mắt 02/08/2026</div>
  <div>Dữ liệu và phân tích chỉ mang tính chất tham khảo.</div>
</footer>

<!-- ══════════ ADMIN — QUẢN LÝ ĐĂNG KÝ NHẬN THÔNG BÁO (ẩn) ══════════ -->
<div id="admin-panel" style="display:none;max-width:920px;margin:0 auto;padding:0 24px 60px;position:relative;z-index:2">
  <div id="admin-login" style="display:none;max-width:340px;margin:16px auto 0;background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;padding:20px">
    <div style="font-size:13px;color:var(--t2);margin-bottom:10px">Nhập mã truy cập để xem danh sách đăng ký</div>
    <input id="admin-pin" type="password" placeholder="Mã PIN" style="width:100%;background:var(--elev);border:.5px solid var(--bdr);border-radius:8px;padding:10px 12px;color:var(--t1);font-size:14px;margin-bottom:10px" onkeydown="if(event.key==='Enter')adminLogin()">
    <button onclick="adminLogin()" style="width:100%;background:var(--B);color:#fff;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:700;cursor:pointer">Truy cập</button>
    <div id="admin-login-err" style="display:none;color:var(--R);font-size:12px;margin-top:8px">Sai mã PIN, vui lòng thử lại.</div>
  </div>

  <div id="admin-dash" style="display:none;margin-top:16px;background:var(--surf);border:.5px solid var(--bdr);border-radius:14px;padding:20px;overflow-x:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
      <div style="font-size:15px;font-weight:700">Danh sách đăng ký nhận thông báo <span id="admin-count" style="color:var(--t3);font-weight:400">(0)</span></div>
      <div style="display:flex;gap:8px">
        <button onclick="loadLeads()" style="background:var(--elev);border:.5px solid var(--bdr);color:var(--t2);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer"><i class="ti ti-refresh" style="font-size:12px"></i> Làm mới</button>
        <button onclick="exportLeadsCSV()" style="background:var(--Gs);border:.5px solid var(--Gb);color:var(--G);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer"><i class="ti ti-download" style="font-size:12px"></i> Xuất CSV</button>
        <button onclick="closeAdmin()" style="background:none;border:.5px solid var(--bdr);color:var(--t3);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer">Đóng</button>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="text-align:left;color:var(--t3);border-bottom:.5px solid var(--bdr)">
          <th style="padding:8px 10px">Thời gian</th>
          <th style="padding:8px 10px">Họ tên</th>
          <th style="padding:8px 10px">SĐT</th>
          <th style="padding:8px 10px">Email</th>
          <th style="padding:8px 10px"></th>
        </tr>
      </thead>
      <tbody id="admin-tbody">
        <tr><td colspan="5" style="padding:20px 10px;color:var(--t4);text-align:center">Đang tải...</td></tr>
      </tbody>
    </table>
  </div>
</div>

`;

export default function StockTradersTeaser() {
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

    const ADMIN_PIN = "260726"; // demo PIN — đổi khi triển khai thật
    const API_BASE = "/api/teaser-leads";

    const requestJson = async (path = "", options = {}) => {
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
          '<tr><td colspan="5" style="padding:20px 10px;color:var(--t4);text-align:center">Chưa có ai đăng ký.</td></tr>';
        return;
      }
      tbody.innerHTML = leads
        .map((l) => {
          const d = new Date(l.ts);
          const dateStr = isNaN(d) ? "" : d.toLocaleString("vi-VN");
          return `<tr style="border-bottom:.5px solid var(--bdr)">
      <td style="padding:9px 10px;color:var(--t3);white-space:nowrap">${dateStr}</td>
      <td style="padding:9px 10px;color:var(--t1);font-weight:600">${escapeHtml(l.name || "—")}</td>
      <td style="padding:9px 10px">${escapeHtml(l.phone || "")}</td>
      <td style="padding:9px 10px;color:var(--t2)">${escapeHtml(l.email || "—")}</td>
      <td style="padding:9px 10px;text-align:right"><button onclick="deleteLead('${l.key}')" style="background:none;border:none;color:var(--R);cursor:pointer;font-size:12px"><i class="ti ti-trash"></i></button></td>
    </tr>`;
        })
        .join("");
    };

    const loadLeads = async () => {
      const tbody = document.getElementById("admin-tbody");
      if (!tbody) return;
      tbody.innerHTML =
        '<tr><td colspan="5" style="padding:20px 10px;color:var(--t4);text-align:center">Đang tải...</td></tr>';
      try {
        const data = await requestJson();
        const leads = Array.isArray(data?.leads) ? data.leads : [];
        leadsCacheRef.current = leads;
        renderLeads(leads);
      } catch (err) {
        console.error("Không tải được leads từ API:", err);
        tbody.innerHTML =
          '<tr><td colspan="5" style="padding:20px 10px;color:var(--R);text-align:center">Không kết nối được API lưu đăng ký.</td></tr>';
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
        errBox.textContent = "Vui lòng nhập Số điện thoại để nhận thông báo.";
        errBox.style.display = "block";
        return;
      }

      btn.disabled = true;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = "Đang gửi...";

      try {
        const data = await requestJson("", {
          method: "POST",
          body: JSON.stringify({ name, phone, email }),
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
        '<i class="ti ti-check" style="font-size:15px"></i> Đã đăng ký — Hẹn gặp bạn 02/08!';
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
      if (!confirm("Xoá đăng ký này?")) return;
      try {
        await requestJson("/" + encodeURIComponent(key), { method: "DELETE" });
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
      const header = ["Thời gian", "Họ tên", "Số điện thoại", "Email"];
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
      a.download = "stocktraders_teaser_leads_" + new Date().toISOString().slice(0, 10) + ".csv";
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
