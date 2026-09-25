/* =========================================================
   FBV v2 Prototype — READER (phần 2)
   Auth (R10–R14) · Tài khoản (R15–R22) · Pháp lý (R23) · Phase 2 (P02–P04)
   Hub danh mục màn hình · 404
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = () => document.getElementById('app');
  const I = F.icon;
  const nextUrl = () => { const n = F.param('next'); return n && !/^(https?:)?\/\//.test(n) ? n : 'reader/index.html'; };
  const goNext = () => F.go(nextUrl());
  const qNext = () => (F.param('next') ? '?next=' + encodeURIComponent(F.param('next')) : '');
  const afterLogin = (u) => { F.login(u.id); if (!u.consent) F.go('reader/consent.html' + qNext()); else if (!u.onboarded) F.go('reader/onboarding.html' + qNext()); else { sessionStorage.setItem('fbv-flash', 'Đăng nhập thành công. Chào ' + u.name.split(' ').pop() + '!'); goNext(); } };
  const flash = () => { const m = sessionStorage.getItem('fbv-flash'); if (m) { sessionStorage.removeItem('fbv-flash'); setTimeout(() => F.toast(m), 200); } };
  document.addEventListener('DOMContentLoaded', flash);

  const authLayout = (inner) => `<div class="auth-wrap"><div class="auth-side"><h2>Tri thức tài chính được thẩm định bởi chuyên gia.</h2><p>Báo cáo chuyên sâu về Fintech, Kinh tế Vĩ mô và Vi mô — liên kết trực tiếp với dữ liệu thị trường và không gian phản biện học thuật 1:1.</p>
    <ul><li>${I('shieldCheck')}Tác giả được chứng thực “Verified by FBV”</li><li>${I('chart')}Dữ liệu chứng khoán & vĩ mô cập nhật định kỳ</li><li>${I('sparkles')}Báo cáo ↔ chỉ số liên kết thông minh</li><li>${I('message')}Trao đổi riêng tư, không công khai mạng xã hội</li></ul></div><div class="auth-main"><div class="auth-card"><div class="auth-logo">${F.brandMark()}</div>${inner}</div></div></div>`;

  /* ================= R10 · Đăng nhập ================= */
  pages.login = () => {
    if (F.isMember()) { goNext(); return; }
    F.readerShell('');
    app().innerHTML = authLayout(`<h1>Chào mừng đến với FBV</h1><p class="lead">Nhập email để nhận mã đăng nhập một lần (OTP). Chưa có tài khoản? Chúng tôi sẽ tạo mới cho bạn.</p>
      <form id="f" class="stack" novalidate><div class="field"><label for="em">Email</label><input class="input" id="em" type="email" inputmode="email" autocomplete="email" placeholder="ban@vidu.com" style="height:52px"><span class="error-text hidden" id="eme">Email không hợp lệ.</span></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit">Nhận mã OTP</button></form>
      <div class="divider">hoặc</div>
      <div class="stack" style="gap:10px"><button class="btn btn-apple btn-lg btn-block" id="ap">${F.appleIcon()}Đăng nhập với Apple</button><button class="btn btn-social btn-lg btn-block" id="gg">${F.googleIcon()}Tiếp tục với Google</button></div>
      <a class="btn btn-ghost btn-block mt-12" href="${F.url(nextUrl())}">Tiếp tục với tư cách Khách</a>
      <div class="demo-hint mt-16"><b>Demo:</b> nhập <b>minhanh@example.com</b> (tài khoản có sẵn) hoặc email bất kỳ để thử luồng đăng ký mới. “Google” đăng nhập tài khoản demo; “Apple” mô phỏng người dùng mới ẩn email.</div>
      <p class="hint mt-16 center">Bằng việc tiếp tục, bạn đồng ý với <a href="${F.url('reader/terms.html')}" target="_blank">Điều khoản sử dụng</a> và <a href="${F.url('reader/privacy.html')}" target="_blank">Chính sách bảo mật</a>.</p>`);
    $('#f').onsubmit = (e) => { e.preventDefault(); const v = $('#em').value.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { $('#eme').classList.remove('hidden'); $('#em').classList.add('invalid'); return; } sessionStorage.setItem('fbv-otp-email', v); F.go('reader/otp.html' + qNext()); };
    $('#em').oninput = () => { $('#eme').classList.add('hidden'); $('#em').classList.remove('invalid'); };
    const sso = (prov) => { const m = F.modal({ title: 'Đang kết nối ' + prov + '…', dismissable: false, body: `<div class="ai-loading"><div class="spinner"></div><span>Mô phỏng cửa sổ xác thực ${prov}</span></div>` });
      setTimeout(() => { m.close(); const db = F.db(); let u;
        if (prov === 'Google') u = F.user('u1');
        else { u = { id: F.uid('u'), name: 'Người dùng Apple', email: 'x7k2p9@privaterelay.appleid.com', interests: [], joined: new Date().toISOString(), consent: false, onboarded: false, bookmarks: [], follows: [], blocked: [], status: 'active', provider: 'apple' }; db.users.push(u); F.save(); }
        afterLogin(u); }, 1200); };
    $('#gg').onclick = () => sso('Google'); $('#ap').onclick = () => sso('Apple');
  };

  /* ================= R11 · OTP ================= */
  pages.otp = () => {
    F.readerShell('');
    const email = sessionStorage.getItem('fbv-otp-email');
    if (!email) { F.go('reader/login.html' + qNext()); return; }
    app().innerHTML = authLayout(`<h1>Nhập mã xác thực</h1><p class="lead">Mã 6 chữ số đã được gửi tới <b>${F.esc(email)}</b>. Mã có hiệu lực trong 5 phút.</p>
      <div class="otp" id="otp">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" maxlength="1" aria-label="Chữ số ${i + 1}" autocomplete="${i ? 'off' : 'one-time-code'}">`).join('')}</div><span class="error-text hidden mt-8" id="oe" style="display:block">Vui lòng nhập đủ 6 chữ số.</span>
      <button class="btn btn-primary btn-lg btn-block mt-24" id="vf">Xác nhận</button>
      <p class="center small mt-16" id="rs"></p>
      <p class="center small mt-8"><a href="${F.url('reader/login.html' + qNext())}">Đổi email</a></p>
      <div class="demo-hint mt-16"><b>Demo:</b> nhập 6 chữ số bất kỳ, ví dụ <b>123456</b>.</div>`);
    const cells = $$('#otp input');
    cells.forEach((c, i) => {
      c.addEventListener('input', () => { c.value = c.value.replace(/\D/g, '').slice(-1); if (c.value && i < 5) cells[i + 1].focus(); $('#oe').classList.add('hidden'); if (cells.every((x) => x.value)) verify(); });
      c.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !c.value && i > 0) cells[i - 1].focus(); });
      c.addEventListener('paste', (e) => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (t.length) { e.preventDefault(); t.split('').forEach((d, j) => (cells[j].value = d)); cells[Math.min(t.length, 5)].focus(); if (t.length === 6) verify(); } });
    });
    cells[0].focus();
    let left = 60; const tick = () => { $('#rs').innerHTML = left > 0 ? `Gửi lại mã sau <b class="num">${left}s</b>` : `<a href="#" id="rsa">Gửi lại mã</a>`; const a = $('#rsa'); if (a) a.onclick = (e) => { e.preventDefault(); left = 60; F.toast('Đã gửi lại mã tới ' + email); tick(); }; if (left-- > 0) setTimeout(tick, 1000); }; tick();
    let busy = false;
    const verify = () => {
      if (busy) return; if (!cells.every((x) => x.value)) { $('#oe').classList.remove('hidden'); return; }
      busy = true; $('#vf').innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;border-color:rgba(255,255,255,.4);border-top-color:#fff"></span>';
      setTimeout(() => { const db = F.db(); let u = db.users.find((x) => x.email === email && x.status !== 'deleted');
        if (!u) { const nm = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()); u = { id: F.uid('u'), name: nm, email, interests: [], joined: new Date().toISOString(), consent: false, onboarded: false, bookmarks: [], follows: [], blocked: [], status: 'active' }; db.users.push(u); F.save(); }
        if (u.status === 'locked') { busy = false; $('#vf').textContent = 'Xác nhận'; F.modal({ title: 'Tài khoản đã bị khóa', body: '<p class="sub">Tài khoản vi phạm Điều khoản sử dụng. Liên hệ support@fbv.example nếu bạn cho rằng đây là nhầm lẫn.</p>', actions: [{ label: 'Đã hiểu', cls: 'btn-primary' }] }); return; }
        sessionStorage.removeItem('fbv-otp-email'); afterLogin(u); }, 700);
    };
    $('#vf').onclick = verify;
  };

  /* ================= R12 · Đồng ý điều khoản ================= */
  pages.consent = () => {
    const me = F.me(); if (!me) { F.go('reader/login.html'); return; }
    F.readerShell('');
    app().innerHTML = authLayout(`<h1>Trước khi bắt đầu</h1><p class="lead">FBV là cộng đồng học thuật. Vui lòng xác nhận các điều khoản dưới đây.</p>
      <div class="set-list">
        <label class="set-item checkbox" style="cursor:pointer"><input type="checkbox" id="c1"><span>Tôi đồng ý với <a href="${F.url('reader/terms.html')}" target="_blank">Điều khoản sử dụng (EULA)</a> và <a href="${F.url('reader/privacy.html')}" target="_blank">Chính sách bảo mật</a>. <b>(bắt buộc)</b></span></label>
        <label class="set-item checkbox" style="cursor:pointer"><input type="checkbox" id="c2"><span>Tôi hiểu nội dung trên FBV mang tính nghiên cứu, <b>không phải khuyến nghị đầu tư</b>. <b>(bắt buộc)</b></span></label>
        <label class="set-item checkbox" style="cursor:pointer"><input type="checkbox" id="c3"><span>Nhận bản tin nghiên cứu hằng tuần qua email.</span></label></div>
      <div class="alert warn mt-16">${I('alert')}<span>FBV <b>không dung thứ</b> nội dung xúc phạm, quấy rối, spam hoặc lôi kéo đầu tư trong các phiên phản biện. Tài khoản vi phạm có thể bị khóa.</span></div>
      <div class="ctabar"><button class="btn btn-primary btn-lg btn-block" id="go" disabled>Đồng ý và tiếp tục</button></div>`);
    const upd = () => { $('#go').disabled = !($('#c1').checked && $('#c2').checked); };
    ['#c1', '#c2'].forEach((s) => ($(s).onchange = upd));
    $('#go').onclick = () => { me.consent = true; me.newsletter = $('#c3').checked; me.consentAt = new Date().toISOString(); F.save(); F.go(me.onboarded ? nextUrl() : 'reader/onboarding.html' + qNext()); };
  };

  /* ================= R13 · Onboarding ================= */
  pages.onboarding = () => {
    const me = F.me(); if (!me) { F.go('reader/login.html'); return; }
    F.readerShell('');
    F.setActions(`<button class="btn btn-ghost btn-sm" id="sk">Bỏ qua</button>`);
    const T = [['fintech', 'Fintech', 'Ngân hàng số, thanh toán, tài sản mã hóa, pháp lý công nghệ tài chính', 'cpu', '#EEF2FF', '#4338CA'], ['macro', 'Kinh tế Vĩ mô', 'Lãi suất, tỷ giá, lạm phát, tăng trưởng, chính sách tiền tệ', 'globe', '#E0F2FE', '#0369A1'], ['micro', 'Kinh tế Vi mô', 'Doanh nghiệp, ngành, thị trường vốn, hành vi nhà đầu tư', 'building', '#ECFDF5', '#047857']];
    const sel = new Set(me.interests);
    app().innerHTML = `<div class="page narrow" style="max-width:820px"><p class="small muted">Bước cuối · Cá nhân hóa</p><h1 class="mt-8">Bạn quan tâm lĩnh vực nào?</h1><p class="sub mt-8 mb-24">Chọn ít nhất một chủ đề để FBV ưu tiên báo cáo phù hợp. Có thể đổi bất cứ lúc nào trong mục Tôi.</p>
      <div class="topic-grid">${T.map((t) => `<button class="topic ${sel.has(t[0]) ? 'on' : ''}" data-t="${t[0]}" aria-pressed="${sel.has(t[0])}"><span class="ti" style="background:${t[4]};color:${t[5]};flex:none">${I(t[3])}</span><span class="tx"><b>${t[1]}</b><span>${t[2]}</span></span></button>`).join('')}</div>
      <div class="ctabar"><button class="btn btn-primary btn-lg btn-block" id="go" ${sel.size ? '' : 'disabled'}>Bắt đầu khám phá ${I('arrowR')}</button></div></div>`;
    $$('.topic').forEach((b) => (b.onclick = () => { const t = b.dataset.t; sel.has(t) ? sel.delete(t) : sel.add(t); b.classList.toggle('on'); b.setAttribute('aria-pressed', sel.has(t)); $('#go').disabled = !sel.size; }));
    const done = () => { me.interests = [...sel]; me.onboarded = true; F.save(); sessionStorage.setItem('fbv-flash', 'Chào mừng bạn đến với FBV!'); goNext(); };
    $('#go').onclick = done; $('#sk').onclick = done;
  };

  /* ---------- Member-only guard ---------- */
  const needMember = (active) => {
    if (F.isMember()) return true;
    F.readerShell(active || '');
    app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('lock', 'Vui lòng đăng nhập', 'Trang này dành cho thành viên FBV. Đăng nhập để tiếp tục.', `<a class="btn btn-primary" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập / Đăng ký</a>`)}</div></div>`;
    return false;
  };
  const accLayout = (active, inner) => `<div class="page narrow">${inner}</div>`;
  const chev = () => I('chevR', 'chev');

  /* ================= R15 · Tôi (Account hub) ================= */
  pages.account = () => {
    F.readerShell('me');
    const me = F.me(); const db = F.db(); const s = F.session();
    const legalList = `<div class="glabel">Pháp lý & Hỗ trợ</div><div class="set-list">
      <a class="set-item" href="${F.url('reader/terms.html')}"><span class="si">${I('note')}</span><span class="grow">Điều khoản sử dụng (EULA)</span>${chev()}</a>
      <a class="set-item" href="${F.url('reader/privacy.html')}"><span class="si">${I('shield')}</span><span class="grow">Chính sách bảo mật</span>${chev()}</a>
      <a class="set-item" href="${F.url('reader/disclaimer.html')}"><span class="si">${I('info')}</span><span class="grow">Miễn trừ trách nhiệm đầu tư</span>${chev()}</a>
      <div class="set-item"><span class="si">${I('mail')}</span><span class="grow">Liên hệ hỗ trợ<div class="xs muted">support@fbv.example</div></span></div></div>`;
    if (!me) {
      app().innerHTML = accLayout('', `<div class="me-card"><span class="avatar lg" style="background:var(--field);color:var(--text-3)">${I('user').replace('<svg', '<svg style="width:40px;height:40px"')}</span><div class="grow"><b>Khách</b><span class="small sub">Đăng nhập để lưu bài, theo dõi chuyên gia và gửi phản biện.</span></div></div>
        <a class="btn btn-primary btn-lg btn-block mt-12" href="${F.url('reader/login.html?next=' + encodeURIComponent('reader/account.html'))}">Đăng nhập / Đăng ký</a>
        ${s.phase2 ? `<div class="glabel">Hội viên</div><div class="set-list"><a class="set-item" href="${F.url('reader/pricing.html')}"><span class="si" style="background:#FEF3C7;color:#B45309">${I('crown')}</span><span class="grow">FBV Premium</span>${chev()}</a></div>` : ''}
        ${legalList}`);
      return;
    }
    const nInq = db.inquiries.filter((q) => q.reader === me.id && !me.blocked.includes(q.expert)).length; const unread = db.notifications.filter((n) => n.user === me.id && !n.read).length;
    app().innerHTML = accLayout('', `<div class="me-card">${F.avatar(me, 'lg')}<div class="grow" style="min-width:0"><b>${F.esc(me.name)}</b><span class="small sub" style="display:block;overflow:hidden;text-overflow:ellipsis">${F.esc(me.email)}</span>${F.hasSub() ? '<span class="badge premium mt-8">Premium</span>' : `<span class="xs muted">Thành viên từ ${F.date(me.joined)}</span>`}</div><button class="icon-btn" id="edit" aria-label="Chỉnh sửa hồ sơ">${I('edit')}</button></div>
      <div class="me-stats"><a href="${F.url('reader/bookmarks.html')}"><b class="num">${me.bookmarks.length}</b><span>Đã lưu</span></a><a href="${F.url('reader/inquiries.html')}"><b class="num">${nInq}</b><span>Phản biện</span></a><a href="#fol"><b class="num">${me.follows.length}</b><span>Theo dõi</span></a></div>
      <div class="glabel">Hoạt động</div><div class="set-list">
        <a class="set-item" href="${F.url('reader/bookmarks.html')}"><span class="si">${I('bookmark')}</span><span class="grow">Bài đã lưu</span>${chev()}</a>
        <a class="set-item" href="${F.url('reader/inquiries.html')}"><span class="si">${I('message')}</span><span class="grow">Phản biện của tôi</span><span class="val">${F.quotaInfo().unlimited ? 'Không giới hạn' : F.quotaInfo().used + '/' + F.quotaInfo().lim + ' lượt'}</span>${chev()}</a>
        <a class="set-item" href="${F.url('reader/notifications.html')}"><span class="si">${I('bell')}</span><span class="grow">Thông báo</span>${unread ? `<span class="badge i-new">${unread} mới</span>` : ''}${chev()}</a></div>
      <div class="glabel">Tài khoản</div><div class="set-list">
        <button class="set-item" id="ints"><span class="si">${I('layers')}</span><span class="grow">Lĩnh vực quan tâm</span><span class="val">${me.interests.map((x) => ({ fintech: 'Fintech', macro: 'Vĩ mô', micro: 'Vi mô' }[x])).join(', ') || 'Chưa chọn'}</span>${chev()}</button>
        ${s.phase2 ? `<a class="set-item" href="${F.url(F.hasSub() ? 'reader/subscription.html' : 'reader/pricing.html')}"><span class="si" style="background:#FEF3C7;color:#B45309">${I('crown')}</span><span class="grow">${F.hasSub() ? 'Gói của tôi' : 'Nâng cấp Premium'}</span>${chev()}</a>` : ''}
        <a class="set-item" href="${F.url('reader/settings.html')}"><span class="si">${I('settings')}</span><span class="grow">Cài đặt & Quyền riêng tư</span>${chev()}</a></div>
      <div id="fol">${me.follows.length ? `<div class="glabel">Chuyên gia đang theo dõi</div><div class="hscroll">${me.follows.map(F.expert).filter(Boolean).map(F.expMini).join('')}</div>` : ''}</div>
      ${legalList}
      <div class="set-list mt-24"><button class="set-item" id="lo" style="justify-content:center;color:var(--danger);font-weight:600">${I('logout').replace('<svg', '<svg style="width:18px;height:18px"')}Đăng xuất</button></div>`);
    const editSheet = (focusInts) => {
      const sel = new Set(me.interests);
      F.modal({ title: focusInts ? 'Lĩnh vực quan tâm' : 'Chỉnh sửa hồ sơ', body: `<div class="stack">${focusInts ? '' : `<div class="field"><label for="nm">Họ và tên</label><input class="input" id="nm" value="${F.esc(me.name)}" maxlength="60"></div><div class="field"><label>Email</label><input class="input" value="${F.esc(me.email)}" disabled><span class="hint">Dùng để đăng nhập bằng mã OTP. Liên hệ hỗ trợ để thay đổi.</span></div>`}
        <div class="field"><span class="label">Lĩnh vực quan tâm</span><div class="chips" id="ic">${[['fintech', 'Fintech'], ['macro', 'Kinh tế Vĩ mô'], ['micro', 'Kinh tế Vi mô']].map((t) => `<button type="button" class="chip check ${sel.has(t[0]) ? 'active' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div></div>
        ${focusInts ? '' : `<div class="field"><span class="label">Tài khoản liên kết</span><div class="stack" style="gap:8px"><div class="file-pill">${F.appleIcon().replace('<svg', '<svg style="width:20px;height:20px"')}<span class="grow">Apple</span><span class="small ${me.provider === 'apple' ? 'up' : 'muted'}">${me.provider === 'apple' ? 'Đã liên kết' : 'Chưa liên kết'}</span></div><div class="file-pill">${F.googleIcon().replace('<svg', '<svg style="width:20px;height:20px"')}<span class="grow">Google</span><span class="small ${me.id === 'u1' ? 'up' : 'muted'}">${me.id === 'u1' ? 'Đã liên kết' : 'Chưa liên kết'}</span></div></div></div>`}</div>`,
        actions: [{ label: 'Hủy' }, { label: 'Lưu', cls: 'btn-primary', onClick: (c, el) => { const n = $('#nm', el); if (n && n.value.trim().length < 2) { F.toast('Vui lòng nhập họ tên hợp lệ', 'error'); return false; } if (!sel.size) { F.toast('Chọn ít nhất một lĩnh vực', 'error'); return false; } if (n) me.name = n.value.trim(); me.interests = [...sel]; F.save(); sessionStorage.setItem('fbv-flash', 'Đã lưu thay đổi'); location.reload(); } }],
        onOpen: (el) => $$('#ic .chip', el).forEach((b) => (b.onclick = () => { const t = b.dataset.t; sel.has(t) ? sel.delete(t) : sel.add(t); b.classList.toggle('active'); })) });
    };
    $('#edit').onclick = () => editSheet(false); $('#ints').onclick = () => editSheet(true);
    $('#lo').onclick = () => { F.logout(); sessionStorage.setItem('fbv-flash', 'Đã đăng xuất'); F.go('reader/index.html'); };
  };

  /* ================= R16 · Bài đã lưu ================= */
  pages.bookmarks = () => {
    if (!needMember()) return; F.readerShell('me');
    const me = F.me(); const list = me.bookmarks.map(F.report).filter((r) => r && r.status === 'published');
    F.setTitle(`Bài đã lưu (${list.length})`);
    app().innerHTML = accLayout('', list.length ? `<p class="small muted mb-12">Đồng bộ trên web và ứng dụng. Nhấn “Bỏ lưu” để xóa khỏi danh sách.</p><div class="list-card" id="bl">${list.map((r) => `<div class="rel" data-r="${r.id}">${F.reportRow(r, { dek: false })}<button class="btn btn-secondary btn-xs" data-rm="${r.id}" style="position:absolute;left:0;bottom:12px" title="Bỏ lưu">${I('x').replace('<svg', '<svg style="width:14px;height:14px"')}Bỏ lưu</button></div>`).join('')}</div>`
      : `<div class="card">${F.empty('bookmark', 'Chưa có bài nào được lưu', 'Nhấn biểu tượng lưu trên báo cáo để đọc lại sau.', `<a class="btn btn-primary" href="${F.url('reader/index.html')}">Khám phá báo cáo</a>`)}</div>`);
    $$('#bl .rrow').forEach((a) => { a.style.paddingBottom = '52px'; });
    $$('[data-rm]').forEach((b) => (b.onclick = () => { const id = b.dataset.rm; me.bookmarks = me.bookmarks.filter((x) => x !== id); F.save(); b.parentElement.remove(); F.toast('Đã bỏ lưu'); F.setTitle(`Bài đã lưu (${me.bookmarks.length})`); if (!me.bookmarks.length) location.reload(); }));
  };

  /* ================= R17 · Hộp phản biện ================= */
  pages.inquiries = () => {
    if (!F.isMember()) {
      F.readerShell('inquiries');
      app().innerHTML = `<div class="page narrow"><div class="card center" style="padding:28px 20px"><div class="empty" style="padding:8px"><div class="ico">${I('message')}</div><h3>Trao đổi riêng 1:1 với tác giả</h3><p>Khi đọc báo cáo, bôi đen một đoạn văn hoặc số liệu rồi chọn “Trích dẫn & Hỏi chuyên gia”. Mọi trao đổi đều riêng tư, không công khai.</p><a class="btn btn-primary" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập để bắt đầu</a></div></div></div>`;
      return;
    }
    F.readerShell('inquiries');
    const me = F.me(); const tab = F.param('t') || 'all';
    const mine = F.db().inquiries.filter((q) => q.reader === me.id && !me.blocked.includes(q.expert));
    const groups = { all: mine, open: mine.filter((q) => ['new', 'assigned', 'in_progress'].includes(q.status)), answered: mine.filter((q) => q.status === 'answered'), closed: mine.filter((q) => ['closed', 'reported'].includes(q.status)) };
    const list = groups[tab].slice().sort((a, b) => new Date(b.messages[b.messages.length - 1].at) - new Date(a.messages[a.messages.length - 1].at));
    app().innerHTML = accLayout('', `<div class="card tight mb-16">${F.quotaBar()}</div>
      <nav class="chipbar">${[['all', 'Tất cả'], ['open', 'Đang mở'], ['answered', 'Đã trả lời'], ['closed', 'Đã đóng']].map((t) => `<a class="chip ${tab === t[0] ? 'active' : ''}" href="?t=${t[0]}">${t[1]} · ${groups[t[0]].length}</a>`).join('')}</nav>
      ${list.length ? `<div class="list-card flush">${list.map((q) => { const r = F.report(q.r); const e = F.expert(q.expert); const last = q.messages[q.messages.length - 1]; return `<a class="inq-row" href="${F.url('reader/inquiry.html?id=' + q.id)}">${F.avatar(e, 'md')}<div style="min-width:0"><div class="row between" style="gap:8px;align-items:baseline"><b class="small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${F.esc(e.name)}</b><span class="xs muted" style="flex:none">${F.ago(last.at)}</span></div><div class="t">${F.esc(r.title)}</div><div class="last ${q.readerUnread ? 'unread' : ''}">${last.by === me.id ? 'Bạn: ' : ''}${F.esc(last.x)}</div></div><div class="ir-side">${F.iStatusBadge(q.status)}${q.readerUnread ? '<span class="unread-dot" title="Có phản hồi mới"></span>' : ''}</div></a>`; }).join('')}</div>`
      : `<div class="card">${F.empty('message', tab === 'all' ? 'Bạn chưa có phiên phản biện nào' : 'Không có phiên nào trong mục này', 'Trong khi đọc báo cáo, hãy bôi đen một đoạn văn hoặc số liệu rồi chọn “Trích dẫn & Hỏi chuyên gia” để bắt đầu trao đổi riêng với tác giả.', `<a class="btn btn-primary" href="${F.url('reader/report.html?id=r5')}">Thử với một báo cáo</a>`)}</div>`}`);
  };

  /* ================= R18 · Chi tiết phiên phản biện (chat) ================= */
  pages.inquiry = () => {
    if (!needMember('inquiries')) return; F.readerShell('inquiries');
    const me = F.me(); const q = F.inquiry(F.param('id') || 'q1');
    if (!q || q.reader !== me.id) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('message', 'Không tìm thấy phiên trao đổi', 'Phiên không tồn tại hoặc bạn không có quyền truy cập.', `<a class="btn btn-primary" href="${F.url('reader/inquiries.html')}">Về hộp phản biện</a>`)}</div></div>`; return; }
    const nid = F.param('n'); if (nid) { const n = F.db().notifications.find((x) => x.id === nid); if (n) n.read = true; }
    q.readerUnread = false; F.save();
    const r = F.report(q.r); const e = F.expert(q.expert); const blocked = me.blocked.includes(e.id);
    F.setTitle(e.name);
    const acts = F.setActions(`<div class="rel"><button class="icon-btn" id="mn" aria-label="Tùy chọn">${I('more')}</button></div>`);
    const canReply = () => !['closed', 'reported'].includes(q.status) && !blocked;
    const sla = new Date(q.slaDue); const overdue = sla < Date.now() && ['new', 'assigned', 'in_progress'].includes(q.status);
    const render = () => {
      app().innerHTML = `<div class="page narrow">
        <div class="chat-quote"><div class="row between" style="gap:8px;margin-bottom:6px"><a class="small" style="font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" href="${F.url('reader/report.html?id=' + r.id + '#p' + q.block)}">${I('file').replace('<svg', '<svg style="width:14px;height:14px;display:inline;vertical-align:-2px"')} ${F.esc(r.title)}</a>${F.iStatusBadge(q.status)}</div><div class="quote-block collapsed" id="qb" title="Nhấn để mở rộng">“${F.esc(q.quote)}”</div></div>
        ${['new', 'assigned', 'in_progress'].includes(q.status) ? `<div class="sla ${overdue ? 'late' : 'ok'} mb-16" style="justify-content:center;width:100%">${I('clock')}${overdue ? 'Đã quá thời gian phản hồi dự kiến — FBV đang nhắc chuyên gia' : 'Phản hồi dự kiến trước ' + F.date(q.slaDue, true)}</div>` : ''}
        <div class="thread">${q.messages.map((m) => { const mine = m.by === me.id; const p = F.person(m.by); return `<div class="msg ${mine ? 'mine' : ''}">${mine ? '' : F.avatar(p, 'sm')}<div style="min-width:0"><div class="mh">${mine ? '' : `<b>${F.esc(p.name)}</b>${p.verified ? F.verifiedIcon().replace('<svg', '<svg style="width:14px;height:14px"') : ''}`}<span>${F.ago(m.at)}</span></div><div class="bubble">${F.esc(m.x)}</div></div></div>`; }).join('')}
          ${q.status === 'closed' ? '<div class="msg system"><div class="bubble">— Phiên trao đổi đã được đóng —</div></div>' : ''}${q.status === 'reported' ? '<div class="msg system"><div class="bubble">— Phiên đang được FBV xem xét do có báo cáo vi phạm —</div></div>' : ''}</div>
        <p class="hint center mt-16">${I('lock').replace('<svg', '<svg style="width:12px;height:12px;display:inline;vertical-align:-1px"')} Trao đổi riêng tư giữa bạn và chuyên gia. FBV chỉ xem xét khi có báo cáo vi phạm.</p></div>
        <div class="dock">${blocked ? `<div class="alert danger" style="max-width:900px;margin:0 auto">${I('ban')}<span>Bạn đã chặn chuyên gia này. <a href="${F.url('reader/settings.html')}">Quản lý danh sách chặn</a></span></div>` : canReply() ? `<div class="composer"><textarea id="rp" rows="1" placeholder="Nhắn tới ${F.esc(e.short)}…" aria-label="Nội dung phản hồi"></textarea><button class="btn btn-primary" id="sd" aria-label="Gửi">${I('send')}</button></div>` : `<div class="perm-note" style="max-width:900px;margin:0 auto">${I('info')}<span>Phiên này không nhận thêm phản hồi. Bạn có thể mở phiên mới từ báo cáo.</span></div>`}</div>`;
      $('#qb').onclick = () => $('#qb').classList.toggle('collapsed');
      const sd = $('#sd'); if (sd) { const ta = $('#rp'); ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; }); ta.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) sd.click(); });
        sd.onclick = () => { const v = ta.value.trim(); if (v.length < 2) return; q.messages.push({ by: me.id, at: new Date().toISOString(), x: v }); if (q.status === 'answered') q.status = 'in_progress'; q.expertUnread = true; F.save(); render(); window.scrollTo(0, document.body.scrollHeight); }; }
      window.scrollTo(0, document.body.scrollHeight);
    };
    $('#mn', acts).onclick = (ev) => { ev.stopPropagation(); F.dropdown($('#mn'), `<a href="${F.url('reader/report.html?id=' + r.id)}">${I('file')}Mở báo cáo</a><a href="${F.url('reader/expert.html?id=' + e.id)}">${I('user')}Hồ sơ chuyên gia</a><hr><button id="mRep">${I('flag')}Báo cáo vi phạm</button><button id="mBlk" style="color:var(--danger)">${I('ban')}${blocked ? 'Bỏ chặn chuyên gia' : 'Chặn chuyên gia này'}</button>${['answered', 'in_progress', 'new', 'assigned'].includes(q.status) ? `<hr><button id="mCls">${I('checkCircle')}Đóng phiên (đã được giải đáp)</button>` : ''}`);
      $('#mRep').onclick = reportModal; $('#mBlk').onclick = blockModal; const c = $('#mCls'); if (c) c.onclick = () => F.confirm('Đóng phiên trao đổi?', 'Bạn sẽ không gửi thêm phản hồi trong phiên này. Có thể mở phiên mới từ báo cáo.', 'Đóng phiên', 'btn-primary', () => { q.status = 'closed'; F.save(); F.toast('Đã đóng phiên'); render(); }); };
    const reportModal = () => F.modal({ title: 'Báo cáo vi phạm', body: `<p class="sub small mb-12">Báo cáo được gửi tới đội ngũ kiểm duyệt FBV và xử lý trong vòng 24 giờ. Người bị báo cáo không biết danh tính của bạn.</p><div class="radio-list">${['Spam hoặc quảng cáo', 'Ngôn từ xúc phạm / quấy rối', 'Thông tin sai lệch', 'Lôi kéo đầu tư / tư vấn trái phép', 'Khác'].map((x, i) => `<label><input type="radio" name="rr" value="${x}" ${i ? '' : 'checked'}>${x}</label>`).join('')}</div><div class="field mt-12"><label for="rd">Mô tả thêm (không bắt buộc)</label><textarea class="textarea" id="rd" style="min-height:80px"></textarea></div>`,
      actions: [{ label: 'Hủy' }, { label: 'Gửi báo cáo', cls: 'btn-danger', onClick: (c, el) => { const reason = $('input[name=rr]:checked', el).value; F.db().moderation.unshift({ id: F.uid('m'), type: 'inquiry', ref: q.id, reporter: me.id, target: e.id, reason, detail: $('#rd', el).value.trim() || '—', status: 'open', createdAt: new Date().toISOString() }); F.save(); F.toast('Đã gửi báo cáo. Cảm ơn bạn đã giúp cộng đồng an toàn hơn.'); } }] });
    const blockModal = () => {
      if (blocked) { me.blocked = me.blocked.filter((x) => x !== e.id); F.save(); F.toast('Đã bỏ chặn ' + e.name); location.reload(); return; }
      F.confirm('Chặn ' + F.esc(e.name) + '?', 'Bạn sẽ không nhận tin nhắn từ chuyên gia này và các phiên liên quan sẽ bị ẩn. Có thể bỏ chặn trong Cài đặt.', 'Chặn', 'btn-danger', () => { me.blocked.push(e.id); F.save(); sessionStorage.setItem('fbv-flash', 'Đã chặn ' + e.name); F.go('reader/inquiries.html'); });
    };
    render();
  };

  /* ================= R20 · Thông báo ================= */
  pages.notifications = () => {
    if (!needMember()) return; F.readerShell('me');
    const me = F.me(); const list = F.db().notifications.filter((n) => n.user === me.id).sort((a, b) => new Date(b.at) - new Date(a.at));
    if (list.some((n) => !n.read)) F.setActions(`<button class="btn btn-ghost btn-sm" id="ra">Đọc tất cả</button>`);
    app().innerHTML = accLayout('', `${list.length ? `<div class="list-card flush">${list.map(F.notiItem).join('')}</div>` : `<div class="card">${F.empty('bell', 'Chưa có thông báo', 'Bạn sẽ nhận thông báo khi chuyên gia trả lời phản biện hoặc có báo cáo mới theo lĩnh vực quan tâm.')}</div>`}
      <p class="hint mt-12">Trên ứng dụng: Push Notification (FCM/APNs). Trên web: thông báo trong ứng dụng và Web Push (nếu cho phép).</p>`);
    const ra = $('#ra'); if (ra) ra.onclick = () => { list.forEach((n) => (n.read = true)); F.save(); location.reload(); };
  };

  /* ================= R21 · Cài đặt & Quyền riêng tư ================= */
  pages.settings = () => {
    if (!needMember()) return; F.readerShell('me');
    const me = F.me(); const bl = me.blocked.map(F.person);
    app().innerHTML = accLayout('', `<div class="glabel" style="margin-top:0">Quyền riêng tư</div><div class="set-list">
        <div class="set-item" style="align-items:flex-start"><span class="si">${I('ban')}</span><div class="grow"><b>Danh sách đã chặn</b><div class="small muted">${bl.length ? bl.length + ' chuyên gia' : 'Bạn chưa chặn ai'}</div>${bl.map((p) => `<div class="row mt-8">${F.avatar(p, 'sm')}<span class="grow small">${F.esc(p.name)}</span><button class="btn btn-secondary btn-xs" data-ub="${p.id}">Bỏ chặn</button></div>`).join('')}</div></div>
        <label class="set-item" style="cursor:pointer"><span class="si">${I('mail')}</span><div class="grow"><b>Bản tin email hằng tuần</b><div class="small muted">Tóm tắt báo cáo mới theo lĩnh vực quan tâm</div></div><span class="switch"><input type="checkbox" id="nl" ${me.newsletter ? 'checked' : ''}><span></span></span></label>
        <label class="set-item" style="cursor:pointer"><span class="si">${I('bell')}</span><div class="grow"><b>Thông báo khi chuyên gia trả lời</b><div class="small muted">In-app & Push</div></div><span class="switch"><input type="checkbox" checked><span></span></span></label></div>
      <div class="glabel">Pháp lý</div><div class="set-list">
        <a class="set-item" href="${F.url('reader/terms.html')}"><span class="si">${I('note')}</span><span class="grow">Điều khoản sử dụng (EULA)</span>${chev()}</a>
        <a class="set-item" href="${F.url('reader/privacy.html')}"><span class="si">${I('shield')}</span><span class="grow">Chính sách bảo mật</span>${chev()}</a>
        <a class="set-item" href="${F.url('reader/disclaimer.html')}"><span class="si">${I('info')}</span><span class="grow">Miễn trừ trách nhiệm đầu tư</span>${chev()}</a></div>
      <div class="glabel">Tài khoản</div><div class="set-list">
        <button class="set-item" id="lo"><span class="si">${I('logout')}</span><span class="grow">Đăng xuất</span></button>
        <a class="set-item danger" href="${F.url('reader/delete-account.html')}"><span class="si">${I('trash')}</span><span class="grow"><b>Xóa tài khoản</b><div class="small" style="color:var(--text-3)">Xóa vĩnh viễn tài khoản và dữ liệu cá nhân</div></span>${chev()}</a></div>`);
    $$('[data-ub]').forEach((b) => (b.onclick = () => { me.blocked = me.blocked.filter((x) => x !== b.dataset.ub); F.save(); F.toast('Đã bỏ chặn'); setTimeout(() => location.reload(), 400); }));
    $('#nl').onchange = (e) => { me.newsletter = e.target.checked; F.save(); F.toast(e.target.checked ? 'Đã bật bản tin' : 'Đã tắt bản tin'); };
    $('#lo').onclick = () => { F.logout(); sessionStorage.setItem('fbv-flash', 'Đã đăng xuất'); F.go('reader/index.html'); };
  };

  /* ================= R22 · Xóa tài khoản ================= */
  pages.deleteAccount = () => {
    if (!needMember()) return; F.readerShell('me');
    const me = F.me(); const nInq = F.db().inquiries.filter((q) => q.reader === me.id).length;
    app().innerHTML = `<div class="page narrow"><div class="card" id="dc" style="padding:22px 18px">
      <div class="avatar md mb-16" style="background:var(--mkt-down-bg);color:var(--danger)">${I('trash')}</div><h1 style="font-size:22px">Xóa tài khoản vĩnh viễn</h1><p class="sub mt-8">Tài khoản <b style="word-break:break-all">${F.esc(me.email)}</b> và dữ liệu sau sẽ bị xóa, <b>không thể khôi phục</b>:</p>
      <ul class="stack mt-16" style="list-style:none;gap:10px">${[['user', 'Hồ sơ cá nhân và lĩnh vực quan tâm'], ['bookmark', me.bookmarks.length + ' bài đã lưu'], ['message', nInq + ' phiên phản biện (nội dung của bạn được ẩn danh hóa để giữ mạch trao đổi của chuyên gia)'], ['bell', 'Thông báo và lịch sử đọc']].map((x) => `<li class="row" style="align-items:flex-start">${I(x[0]).replace('<svg', '<svg style="width:18px;height:18px;flex:none;color:var(--text-3);margin-top:2px"')}<span class="small">${x[1]}</span></li>`).join('')}</ul>
      ${F.hasSub() ? `<div class="alert warn mt-16">${I('alert')}<span>Bạn đang có gói Premium. Nếu mua qua App Store/Google Play, hãy hủy gia hạn trong cài đặt của cửa hàng.</span></div>` : ''}
      <div class="alert info mt-16">${I('info')}<span>Nếu bạn đăng nhập bằng Apple, FBV sẽ thu hồi token “Sign in with Apple” khi xóa tài khoản.</span></div>
      <div class="field mt-24"><label for="rs">Lý do (không bắt buộc)</label><select class="select" id="rs"><option>— Chọn lý do —</option><option>Không còn nhu cầu sử dụng</option><option>Lo ngại về quyền riêng tư</option><option>Nội dung chưa phù hợp</option><option>Khác</option></select></div>
      <div class="field mt-16"><label for="cf">Nhập <b>XÓA</b> để xác nhận</label><input class="input" id="cf" autocomplete="off" placeholder="XÓA"></div>
      <div class="stack mt-24" style="gap:8px"><button class="btn btn-danger btn-lg btn-block" id="del" disabled>${I('trash')}Xóa tài khoản</button><a class="btn btn-ghost btn-block" href="${F.url('reader/settings.html')}">Hủy</a></div></div></div>`;
    $('#cf').oninput = (e) => { $('#del').disabled = e.target.value.trim().toUpperCase() !== 'XÓA'; };
    $('#del').onclick = () => {
      const db = F.db(); db.inquiries.filter((q) => q.reader === me.id).forEach((q) => { q.status = 'closed'; q.messages.forEach((m) => { if (m.by === me.id) m.anon = true; }); });
      db.notifications = db.notifications.filter((n) => n.user !== me.id);
      Object.assign(me, { status: 'deleted', name: 'Tài khoản đã xóa', email: 'deleted-' + me.id, bookmarks: [], follows: [], interests: [] });
      F.session().uid = null; F.session().subscription = null; F.save();
      $('#dc').innerHTML = `<div class="center stack" style="align-items:center;padding:20px 0"><div class="avatar lg" style="background:#DCFCE7;color:#15803D">${I('checkCircle').replace('<svg', '<svg style="width:40px;height:40px"')}</div><h2>Tài khoản đã được xóa</h2><p class="sub">Dữ liệu cá nhân của bạn đã được xóa khỏi hệ thống. Cảm ơn bạn đã đồng hành cùng FBV.</p><a class="btn btn-primary" href="${F.url('reader/index.html')}">Về trang chủ</a></div>`;
    };
  };

  /* ================= R23 · Trang pháp lý ================= */
  const legal = (title, updated, sections) => { F.readerShell('me'); app().innerHTML = `<div class="page narrow"><div class="doc"><h1>${title}</h1><p class="small muted">Cập nhật lần cuối: ${updated} · <b>Bản mẫu cho prototype — cần pháp chế FBV hoàn thiện</b></p>${sections.map((s) => `<h2>${s[0]}</h2>${s[1]}`).join('')}</div></div>`; };
  pages.terms = () => legal('Điều khoản sử dụng (EULA)', '01/09/2026', [
    ['1. Phạm vi áp dụng', '<p>Điều khoản này điều chỉnh việc bạn truy cập và sử dụng ứng dụng, website FBV (“Dịch vụ”). Bằng việc tạo tài khoản, bạn đồng ý tuân thủ Điều khoản.</p>'],
    ['2. Tài khoản', '<p>Bạn chịu trách nhiệm bảo mật email đăng nhập. Mỗi người chỉ sử dụng một tài khoản. Bạn có thể xóa tài khoản bất kỳ lúc nào trong mục Cài đặt.</p>'],
    ['3. Nội dung người dùng & không dung thứ vi phạm', '<p>Trong không gian phản biện 1:1, bạn cam kết <b>không</b> đăng tải nội dung:</p><ul><li>Xúc phạm, quấy rối, phân biệt đối xử, đe dọa;</li><li>Spam, quảng cáo, lôi kéo tham gia nhóm “phím hàng”, tư vấn đầu tư trái phép;</li><li>Thông tin sai lệch nhằm thao túng thị trường;</li><li>Vi phạm quyền sở hữu trí tuệ hoặc quyền riêng tư của người khác.</li></ul><p>FBV <b>không dung thứ</b> nội dung phản cảm hoặc hành vi lạm dụng. Người dùng có thể Báo cáo và Chặn; FBV xử lý báo cáo trong vòng 24 giờ, gỡ nội dung và khóa tài khoản vi phạm.</p>'],
    ['4. Sở hữu trí tuệ', '<p>Báo cáo, biểu đồ, dữ liệu tổng hợp thuộc quyền sở hữu của FBV và/hoặc tác giả. Bạn được trích dẫn có ghi nguồn cho mục đích cá nhân, học thuật; không sao chép, phân phối lại cho mục đích thương mại.</p>'],
    ['5. Không phải khuyến nghị đầu tư', '<p>Nội dung trên FBV chỉ mang tính nghiên cứu, thông tin. Xem thêm <a href="disclaimer.html">Tuyên bố miễn trừ trách nhiệm</a>.</p>'],
    ['6. Gói trả phí (Phase 2)', '<p>Gói hội viên tự động gia hạn cho đến khi bạn hủy. Giao dịch trên iOS/Android thực hiện qua App Store/Google Play; trên web qua cổng thanh toán được cấp phép.</p>'],
    ['7. Liên hệ', '<p>Mọi thắc mắc vui lòng gửi về support@fbv.example.</p>']]);
  pages.privacy = () => legal('Chính sách bảo mật', '01/09/2026', [
    ['1. Dữ liệu chúng tôi thu thập', '<ul><li>Thông tin tài khoản: email, họ tên, danh mục quan tâm;</li><li>Dữ liệu sử dụng: báo cáo đã đọc, bài đã lưu, nội dung phản biện;</li><li>Dữ liệu kỹ thuật: loại thiết bị, token thông báo.</li></ul>'],
    ['2. Mục đích sử dụng', '<p>Cung cấp và cá nhân hóa Dịch vụ, gửi thông báo, kiểm duyệt nội dung vi phạm và cải thiện sản phẩm. FBV <b>không bán</b> dữ liệu cá nhân.</p>'],
    ['3. Xử lý bởi AI', '<p>Nội dung báo cáo (không phải dữ liệu cá nhân) được xử lý bởi Google Vertex AI để gợi ý chỉ số liên quan tại thời điểm xuất bản.</p>'],
    ['4. Quyền của bạn', '<p>Bạn có quyền truy cập, chỉnh sửa, xóa dữ liệu và <b>xóa tài khoản trực tiếp trong ứng dụng</b> (Cài đặt → Xóa tài khoản).</p>'],
    ['5. Lưu trữ & bảo mật', '<p>Dữ liệu được mã hóa khi truyền và lưu trữ trên hạ tầng Google Cloud. Dữ liệu của tài khoản đã xóa được loại bỏ trong vòng 30 ngày, trừ khi pháp luật yêu cầu lưu giữ.</p>']]);
  pages.disclaimer = () => legal('Tuyên bố miễn trừ trách nhiệm đầu tư', '01/09/2026', [
    ['Nội dung không phải khuyến nghị đầu tư', '<p>Các báo cáo, phân tích, dữ liệu và trao đổi trên FBV được cung cấp cho mục đích nghiên cứu, học thuật và thông tin. Nội dung không cấu thành lời mời, chào mua, khuyến nghị mua, bán hoặc nắm giữ bất kỳ chứng khoán, tài sản tài chính nào.</p>'],
    ['Dữ liệu thị trường', '<p>Dữ liệu chỉ số chứng khoán có độ trễ tối thiểu 15 phút; dữ liệu vĩ mô được cập nhật theo kỳ công bố của cơ quan có thẩm quyền. FBV không bảo đảm tính đầy đủ, chính xác tuyệt đối của dữ liệu từ bên thứ ba.</p>'],
    ['Quan điểm của tác giả', '<p>Quan điểm trong báo cáo thuộc về tác giả tại thời điểm công bố và có thể thay đổi mà không cần thông báo. Người đọc tự chịu trách nhiệm với quyết định của mình và nên tham khảo ý kiến tổ chức tư vấn được cấp phép.</p>']]);

  const PLANS = { monthly: { name: 'Tháng', price: 199000, per: '/tháng', note: 'Linh hoạt, hủy bất cứ lúc nào' }, quarterly: { name: 'Quý', price: 549000, per: '/quý', note: 'Tiết kiệm 8%' }, yearly: { name: 'Năm', price: 1990000, per: '/năm', note: 'Tiết kiệm 17% · Phổ biến nhất', best: true }, single: { name: 'Mua lẻ báo cáo', price: 79000, per: '/báo cáo', note: 'Mở khóa vĩnh viễn 1 báo cáo đặc biệt' } };
  F.PLANS = PLANS;
  const p2Banner = () => (F.session().phase2 ? '' : `<div class="alert warn mb-24">${I('alert')}<span class="grow">Đây là màn hình <b>Phase 2 (mô phỏng)</b>. Bật “Mô phỏng Phase 2” trên thanh Demo để thấy Paywall trên báo cáo Premium.</span><button class="btn btn-sm btn-secondary" id="p2on">Bật ngay</button></div>`);
  const bindP2 = () => { const b = $('#p2on'); if (b) b.onclick = () => { F.session().phase2 = true; F.save(); location.reload(); }; };
  /* ================= P02 · Bảng giá (mobile-first) ================= */
  pages.pricing = () => {
    F.readerShell('me');
    const rid = F.param('r'); const r = rid && F.report(rid); let sel = 'yearly';
    const feat = ['Toàn văn mọi báo cáo Premium & bản PDF', 'Phản biện 1:1 không giới hạn', 'Buổi trao đổi kín định kỳ cùng chuyên gia', 'Đồng bộ quyền lợi trên web & ứng dụng'];
    app().innerHTML = `<div class="page">${p2Banner()}<div class="cta-card mb-24" style="text-align:center;padding:26px 20px"><span class="badge premium">${I('crown').replace('<svg', '<svg style="width:12px;height:12px"')} FBV Premium</span><h1 class="mt-12" style="color:#fff;font-size:24px">Nâng cấp trải nghiệm nghiên cứu</h1><p style="max-width:560px;margin:8px auto 0">${r ? `Mở khóa “${F.esc(r.title)}” và toàn bộ thư viện báo cáo chuyên sâu.` : 'Truy cập toàn bộ báo cáo chuyên sâu và trao đổi trực tiếp không giới hạn với chuyên gia FBV.'}</p></div>
      <div class="plans" id="pl" role="radiogroup" aria-label="Chọn gói">${Object.entries(PLANS).map(([k, p]) => `<button class="plan ${k === sel ? 'on' : ''}" data-p="${k}" role="radio" aria-checked="${k === sel}">${p.best ? '<span class="ribbon">Phổ biến nhất</span>' : ''}<span class="row between" style="width:100%"><b style="font-size:16px">${p.name}</b><span class="price num">${F.num(p.price)}đ<small>${p.per}</small></span></span><span class="small muted">${p.note}</span><ul>${(k === 'single' ? ['Toàn văn & PDF của 1 báo cáo', '1 phiên phản biện ưu tiên với tác giả'] : feat).map((f) => `<li>${I('check')}${f}</li>`).join('')}</ul></button>`).join('')}</div>
      <section class="sec">${F.secHead('So sánh quyền lợi')}<div class="table-wrap"><table class="table compare"><thead><tr><th>Quyền lợi</th><th>Miễn phí</th><th>Premium</th></tr></thead><tbody>
      ${[['Đọc báo cáo tiêu chuẩn', 1, 1], ['Tóm tắt điều hành báo cáo Premium', 1, 1], ['Toàn văn & PDF báo cáo Premium', 0, 1], ['Dữ liệu thị trường & vĩ mô', 1, 1], ['Phản biện 1:1', '3 / 30 ngày', 'Không giới hạn'], ['Buổi trao đổi kín định kỳ', 0, 1]].map((x) => `<tr><td>${x[0]}</td>${[x[1], x[2]].map((v) => `<td>${v === 1 ? I('check') : v === 0 ? '<span class="muted">—</span>' : `<span class="small">${v}</span>`}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="hint mt-12">Trên web: thanh toán qua cổng nội địa. Trên iOS/Android: Apple In-App Purchase / Google Play Billing. Quyền lợi đồng bộ theo tài khoản FBV.</p></section>
      <div class="ctabar"><div class="ct-row"><div class="grow"><span class="xs muted">Gói đã chọn</span><div><b class="num" id="pp">${F.num(PLANS[sel].price)}đ</b> <span class="small muted" id="pper">${PLANS[sel].per}</span></div></div><button class="btn btn-primary btn-lg" id="buy" style="min-width:160px">Tiếp tục</button></div></div></div>`;
    bindP2();
    $$('#pl .plan').forEach((b) => (b.onclick = () => { sel = b.dataset.p; $$('#pl .plan').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); $('#pp').textContent = F.num(PLANS[sel].price) + 'đ'; $('#pper').textContent = PLANS[sel].per; }));
    $('#buy').onclick = () => { if (sel === 'single' && !rid) { F.toast('Hãy chọn “Mua lẻ báo cáo này” từ một báo cáo Premium', 'info'); return; } F.go('reader/checkout.html?plan=' + sel + (rid ? '&r=' + rid : '')); };
  };

  /* ================= P03 · Thanh toán (mock) ================= */
  pages.checkout = () => {
    if (!needMember()) return; F.readerShell('me');
    const plan = PLANS[F.param('plan')] ? F.param('plan') : 'yearly'; const p = PLANS[plan]; const r = F.report(F.param('r') || '');
    const vat = Math.round(p.price / 11);
    app().innerHTML = `<div class="page narrow" id="co">${p2Banner()}
      <div class="card mb-16"><div class="row between"><div><span class="xs muted">Gói</span><h3>FBV Premium — ${p.name}</h3>${r && plan === 'single' ? `<div class="xs muted mt-8">${F.esc(r.title)}</div>` : ''}</div><a class="small" href="${F.url('reader/pricing.html' + (r ? '?r=' + r.id : ''))}">Đổi gói</a></div>
        <div class="stack small mt-16"><div class="row between"><span class="muted">Giá</span><span class="num">${F.num(p.price)}đ</span></div><div class="row between"><span class="muted">Trong đó VAT (10%)</span><span class="num">${F.num(vat)}đ</span></div>${plan !== 'single' ? '<div class="row between"><span class="muted">Gia hạn</span><span>Tự động, hủy bất cứ lúc nào</span></div>' : ''}</div></div>
      <div class="glabel" style="margin-top:0">Phương thức thanh toán</div>
      <div class="radio-list" id="pm">${[['vnpay', 'VNPay QR', 'Quét mã bằng ứng dụng ngân hàng', 'grid'], ['momo', 'Ví MoMo', 'Thanh toán qua ví điện tử', 'wallet'], ['card', 'Thẻ quốc tế', 'Visa, Mastercard, JCB', 'card'], ['bank', 'Chuyển khoản ngân hàng', 'Kích hoạt sau đối soát (≤ 2 giờ)', 'building']].map((m, i) => `<label style="background:#fff"><input type="radio" name="pm" value="${m[0]}" ${i ? '' : 'checked'}><span class="avatar sm" style="background:var(--field);color:var(--text-2)">${I(m[3]).replace('<svg', '<svg style="width:16px;height:16px"')}</span><span class="grow"><b>${m[1]}</b><span class="xs muted" style="display:block">${m[2]}</span></span></label>`).join('')}</div>
      <div class="field mt-16"><label for="inv">Xuất hóa đơn doanh nghiệp (không bắt buộc)</label><input class="input" id="inv" placeholder="Mã số thuế" style="background:#fff"></div>
      <div class="perm-note mt-16">${I('lock')}<span>Prototype không kết nối cổng thanh toán thật và không thu thập thông tin thẻ.</span></div>
      <div class="ctabar"><div class="ct-row"><div class="grow"><span class="xs muted">Tổng thanh toán</span><div><b class="num">${F.num(p.price)}đ</b></div></div><button class="btn btn-primary btn-lg" id="pay" style="min-width:160px">Thanh toán</button></div><button class="btn btn-ghost btn-sm" id="fail">Mô phỏng thanh toán thất bại</button></div></div>`;
    bindP2();
    const result = (ok) => {
      const m = F.modal({ title: 'Đang xử lý thanh toán…', dismissable: false, body: `<div class="ai-loading"><div class="spinner"></div><span>Đang chờ xác nhận từ cổng thanh toán</span></div>` });
      setTimeout(() => { m.close(); const s = F.session();
        if (ok) { if (plan === 'single') { s.unlocked = s.unlocked || []; if (r) s.unlocked.push(r.id); } else { const days = plan === 'monthly' ? 30 : plan === 'quarterly' ? 91 : 365; s.subscription = { plan, start: new Date().toISOString(), renew: new Date(Date.now() + days * 864e5).toISOString(), method: $('input[name=pm]:checked').value, price: p.price }; } s.phase2 = true; F.save(); }
        document.body.classList.remove('has-cta');
        $('#co').innerHTML = ok ? `<div class="card center" style="padding:36px 20px"><div class="avatar lg" style="background:#DCFCE7;color:#15803D;margin:0 auto">${I('checkCircle').replace('<svg', '<svg style="width:40px;height:40px"')}</div><h2 class="mt-16">Thanh toán thành công</h2><p class="sub mt-8">${plan === 'single' ? 'Báo cáo đã được mở khóa vĩnh viễn cho tài khoản của bạn.' : 'Chào mừng bạn đến với FBV Premium! Quyền lợi đã kích hoạt trên web và ứng dụng.'}</p><div class="stack mt-24" style="gap:8px">${r ? `<a class="btn btn-primary btn-block" href="${F.url('reader/report.html?id=' + r.id)}">Đọc báo cáo ngay</a>` : `<a class="btn btn-primary btn-block" href="${F.url('reader/index.html')}">Khám phá báo cáo</a>`}${plan !== 'single' ? `<a class="btn btn-secondary btn-block" href="${F.url('reader/subscription.html')}">Xem gói của tôi</a>` : ''}</div></div>`
          : `<div class="card center" style="padding:36px 20px"><div class="avatar lg" style="background:var(--mkt-down-bg);color:var(--danger);margin:0 auto">${I('xCircle').replace('<svg', '<svg style="width:40px;height:40px"')}</div><h2 class="mt-16">Thanh toán chưa thành công</h2><p class="sub mt-8">Giao dịch bị hủy hoặc hết thời gian chờ. Bạn chưa bị trừ tiền.</p><div class="stack mt-24" style="gap:8px"><a class="btn btn-primary btn-block" href="">Thử lại</a><a class="btn btn-secondary btn-block" href="${F.url('reader/pricing.html')}">Chọn gói khác</a></div></div>`;
      }, 1400);
    };
    $('#pay').onclick = () => result(true); $('#fail').onclick = () => result(false);
  };

  /* ================= P04 · Gói của tôi ================= */
  pages.subscription = () => {
    if (!needMember()) return; F.readerShell('me');
    const s = F.session(); const sub = s.subscription;
    app().innerHTML = accLayout('', `${p2Banner()}${sub ? `<div class="cta-card mb-16"><span class="badge premium">${I('crown').replace('<svg', '<svg style="width:12px;height:12px"')} Premium</span><h2 style="color:#fff" class="mt-8">Gói ${PLANS[sub.plan].name}</h2><div class="num mt-8" style="font-size:24px;font-weight:700">${F.num(sub.price)}đ<span style="font-size:13px;font-weight:500;color:#B8C7DD">${PLANS[sub.plan].per}</span></div><p class="small" style="margin-bottom:0">${sub.cancelled ? 'Đã hủy gia hạn · hiệu lực đến ' : 'Tự động gia hạn ngày '}${F.date(sub.renew)}</p></div>
      <div class="glabel">Lịch sử giao dịch</div><div class="set-list"><div class="set-item"><span class="si">${I('card')}</span><span class="grow"><b>FBV Premium — Gói ${PLANS[sub.plan].name}</b><div class="xs muted">${F.date(sub.start)} · ${{ vnpay: 'VNPay QR', momo: 'Ví MoMo', card: 'Thẻ quốc tế', bank: 'Chuyển khoản' }[sub.method] || 'Web'}</div></span><b class="num small">${F.num(sub.price)}đ</b></div></div>
      <div class="set-list mt-16">${sub.cancelled ? '' : `<button class="set-item" id="cc" style="color:var(--danger)"><span class="si">${I('xCircle')}</span><span class="grow">Hủy gia hạn</span></button>`}<button class="set-item" id="rst"><span class="si">${I('refresh')}</span><span class="grow">Khôi phục giao dịch</span></button></div>`
      : `<div class="card">${F.empty('crown', 'Bạn đang dùng gói Miễn phí', 'Nâng cấp Premium để đọc toàn văn báo cáo chuyên sâu và phản biện 1:1 không giới hạn.', `<a class="btn btn-primary" href="${F.url('reader/pricing.html')}">Xem các gói</a>`)}</div><div class="set-list mt-16"><button class="set-item" id="rst"><span class="si">${I('refresh')}</span><span class="grow">Khôi phục giao dịch</span></button></div>`}`);
    bindP2();
    const cc = $('#cc'); if (cc) cc.onclick = () => F.confirm('Hủy gia hạn tự động?', 'Bạn vẫn dùng Premium đến hết ngày ' + F.date(sub.renew) + '. Sau đó tài khoản chuyển về gói Miễn phí.', 'Hủy gia hạn', 'btn-danger', () => { sub.cancelled = true; F.save(); F.toast('Đã hủy gia hạn'); setTimeout(() => location.reload(), 400); });
    const rs = $('#rst'); if (rs) rs.onclick = () => F.modal({ title: 'Khôi phục giao dịch', body: `<p class="sub">Tính năng <b>Restore Purchases</b> dành cho ứng dụng iOS/Android: đồng bộ lại các giao dịch đã mua qua App Store hoặc Google Play với tài khoản FBV.</p><p class="sub mt-12">Trên web, quyền lợi được đồng bộ tự động theo tài khoản — không cần khôi phục thủ công.</p>`, actions: [{ label: 'Đã hiểu', cls: 'btn-primary' }] });
  };

  /* ================= HUB · Danh mục màn hình ================= */
  pages.hub = () => {
    const S = [
      ['Web Reader — Độc giả', [['R01', 'reader/index.html', 'Trang chủ – Research Feed', '3 luồng Fintech / Vĩ mô / Vi mô'], ['R02', 'reader/search.html', 'Tìm kiếm & Bộ lọc', 'Từ khóa, chủ đề, tác giả, thời gian'], ['R03', 'reader/report.html?id=r5', 'Chi tiết báo cáo', 'Rich-text, widget chỉ số, bôi đen để phản biện'], ['R04', 'reader/report-pdf.html?id=r5', 'Trình xem PDF', 'Tài liệu dài kỳ'], ['R06', 'reader/expert.html?id=e1', 'Hồ sơ chuyên gia', 'Verified by FBV'], ['R07', 'reader/market.html', 'Thị trường chứng khoán', 'VN-Index, VN30, HNX, UPCoM, độ rộng, khối ngoại'], ['R08', 'reader/macro.html', 'Vĩ mô & Tiền tệ', 'Lãi suất, tỷ giá, vàng, dầu, GDP, CPI…'], ['R09', 'reader/indicator.html?id=VNINDEX', 'Chi tiết chỉ số', 'Biểu đồ 1D/1W/1M/1Y + báo cáo liên quan'], ['R10', 'reader/login.html', 'Đăng nhập', 'Email OTP, Apple, Google, Khách'], ['R11', 'reader/otp.html', 'Nhập OTP', 'Cần nhập email ở R10 trước'], ['R12', 'reader/consent.html', 'Đồng ý điều khoản', 'EULA, Privacy, Disclaimer'], ['R13', 'reader/onboarding.html', 'Chọn danh mục quan tâm', 'Cá nhân hóa bảng tin'], ['R15', 'reader/account.html', 'Hồ sơ cá nhân', 'Cần vai trò Độc giả'], ['R16', 'reader/bookmarks.html', 'Bài đã lưu', ''], ['R17', 'reader/inquiries.html', 'Hộp phản biện', 'Danh sách phiên 1:1'], ['R18', 'reader/inquiry.html?id=q1', 'Chi tiết phiên phản biện', 'Report / Block / Đóng phiên'], ['R20', 'reader/notifications.html', 'Thông báo', ''], ['R21', 'reader/settings.html', 'Cài đặt & Quyền riêng tư', 'Danh sách chặn, pháp lý'], ['R22', 'reader/delete-account.html', 'Xóa tài khoản', 'Tuân thủ App Store 5.1.1(v)'], ['R23', 'reader/terms.html', 'Điều khoản (EULA)', 'Kèm Privacy, Disclaimer']]],
      ['Phase 2 — Thương mại hóa (mô phỏng)', [['P01', 'reader/report.html?id=r5&p2=1', 'Paywall & Teaser', 'Bật “Mô phỏng Phase 2” trên thanh Demo'], ['P02', 'reader/pricing.html', 'Bảng giá hội viên', 'Tháng / Quý / Năm / Mua lẻ'], ['P03', 'reader/checkout.html?plan=yearly', 'Thanh toán web', 'Cổng nội địa (mock)'], ['P04', 'reader/subscription.html', 'Gói của tôi', 'Hủy gia hạn, Khôi phục giao dịch']]],
      ['CMS Web Portal — Quản trị & Xuất bản', [['C01', 'cms/login.html', 'Đăng nhập CMS', 'Chọn vai trò demo'], ['C02', 'cms/index.html', 'Dashboard', 'Pipeline bài, phản biện, SLA'], ['C03', 'cms/reports.html', 'Danh sách báo cáo', 'Lọc theo trạng thái'], ['C04', 'cms/editor.html?id=r13', 'Soạn thảo báo cáo', 'Upload PDF, gửi thẩm định'], ['C05', 'cms/publish.html?id=r16', 'Panel AI Liên kết', 'Gợi ý Vertex AI, chấp nhận / bỏ / thêm'], ['C06', 'cms/review.html?id=r14', 'Thẩm định học thuật', 'Góp ý theo đoạn, checklist'], ['C07', 'cms/publish.html?id=r16', 'Phê duyệt & Xuất bản', 'Xem trước web/mobile, lên lịch'], ['C09', 'cms/inquiries.html', 'Hàng đợi phản biện', 'SLA, phân công'], ['C10', 'cms/inquiry.html?id=q4', 'Chi tiết phiên (CMS)', 'Trả lời, ghi chú nội bộ'], ['C11', 'cms/moderation.html', 'Kiểm duyệt vi phạm', 'Xử lý Report'], ['C12', 'cms/experts.html', 'Quản lý chuyên gia', 'Huy hiệu Verified'], ['C13', 'cms/indicators.html', 'Danh mục chỉ số', 'Master data cho AI'], ['C14', 'cms/users.html', 'Người dùng', 'Khóa / mở khóa']]]
    ];
    const FL = [['F1', 'Khách khám phá → đăng nhập', 'reader/index.html', ['Vai trò: Khách', 'Mở báo cáo → bấm Lưu → Login Wall', 'Nhập email mới → OTP → Đồng ý điều khoản → Chọn danh mục', 'Quay lại bài viết, bấm Lưu']], ['F2', 'Báo cáo → Chỉ số', 'reader/report.html?id=r5', ['Đọc báo cáo lãi suất điều hành', 'Bấm widget “LS liên ngân hàng qua đêm” trong bài', 'Xem biểu đồ & chỉ số']], ['F3', 'Chỉ số → Báo cáo', 'reader/market.html', ['Chọn VN-Index, đổi khung 1M', 'Mục “Phân tích từ FBV” → mở báo cáo']], ['F4', 'Quote & Inquire', 'reader/report.html?id=r6', ['Vai trò: Độc giả', 'Bôi đen một câu → “Trích dẫn & Hỏi chuyên gia”', 'Đổi vai Chuyên gia → CMS Phản biện → trả lời', 'Đổi vai Độc giả → chuông thông báo → đọc trả lời']], ['F5', 'Báo cáo vi phạm & Chặn', 'reader/inquiry.html?id=q2', ['Menu ⋯ → Báo cáo vi phạm → Chặn', 'Đổi vai Quản trị → CMS Kiểm duyệt']], ['F6', 'Xuất bản có AI Linking', 'cms/reports.html', ['Chuyên gia: soạn/gửi thẩm định', 'Thẩm định viên: yêu cầu sửa hoặc chuyển duyệt', 'Biên tập: duyệt gợi ý AI → Xuất bản']], ['F7', 'Xóa tài khoản', 'reader/settings.html', ['Vai trò: Độc giả', 'Cài đặt → Xóa tài khoản → nhập XÓA']], ['F8', 'Paywall (Phase 2)', 'reader/report.html?id=r5', ['Bật Mô phỏng Phase 2', 'Báo cáo Premium bị làm mờ → Xem gói → Thanh toán', 'Toàn văn được mở khóa']]];
    if (F.param('p2')) { F.session().phase2 = true; F.save(); }
    app().innerHTML = `<header class="topbar"><div class="container">${F.brand('index.html', 'Prototype v2')}<div class="top-actions"><a class="btn btn-secondary btn-sm" href="cms/index.html">CMS Portal</a><a class="btn btn-primary btn-sm" href="reader/index.html">Mở Web Reader ${I('arrowR')}</a></div></div></header>
      <section class="hub-hero"><div class="container"><span class="badge" style="background:rgba(255,255,255,.12);color:#fff">Prototype HTML/CSS/JS · Dữ liệu minh họa</span><h1 class="mt-12">FBV v2 — Web App Prototype</h1><p>Prototype click-through cho Web Reader (độc giả) và CMS Web Portal (biên tập, thẩm định, chuyên gia). Dùng <b>thanh Demo</b> ở góc phải dưới để đổi vai trò, bật mô phỏng Phase 2 hoặc reset dữ liệu. Mọi thao tác được lưu cục bộ trên trình duyệt của bạn.</p>
        <div class="row wrap mt-24"><a class="btn btn-primary btn-lg" href="reader/index.html">${I('book')}Trải nghiệm Web Reader</a><a class="btn btn-lg" style="background:rgba(255,255,255,.12);color:#fff" href="cms/login.html">${I('layers')}Vào CMS Portal</a></div></div></section>
      <div class="container page"><h2 class="mb-16">Luồng demo chính</h2><div class="hub-grid mb-32">${FL.map((f) => `<div class="flow"><h4><span class="fid">${f[0]}</span>${f[1]}</h4><ol>${f[3].map((x) => `<li>${x}</li>`).join('')}</ol><a class="btn btn-soft btn-sm mt-12" href="${f[2]}">Bắt đầu ${I('arrowR')}</a></div>`).join('')}</div>
      ${S.map((g) => `<h2 class="mb-16">${g[0]}</h2><div class="hub-grid mb-32">${g[1].map((x) => `<a class="hub-link" href="${x[1]}"><span class="id">${x[0]}</span><span><b>${x[2]}</b><span>${x[3]}</span></span></a>`).join('')}</div>`).join('')}
      <div class="alert info">${I('info')}<span>Các thành phần dùng chung không có trang riêng: R05 (Modal gửi phản biện), R14 (Login Wall), R19 (Modal Report/Block), R24 (trạng thái rỗng/lỗi/404) — xuất hiện trong luồng tương ứng.</span></div></div>`;
    F.demoBar('reader');
  };

  /* ================= 404 ================= */
  pages.notfound = () => {
    document.body.dataset.root = '/';
    app().innerHTML = `<header class="topbar"><div class="container">${F.brand('/reader/index.html')}</div></header><div class="container page">${F.empty('search', 'Không tìm thấy trang', 'Đường dẫn không tồn tại hoặc đã được thay đổi.', '<a class="btn btn-primary" href="/reader/index.html">Về trang Nghiên cứu</a> <a class="btn btn-secondary" href="/">Danh mục màn hình</a>')}</div>`;
  };
})();
