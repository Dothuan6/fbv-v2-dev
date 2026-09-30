/* =========================================================
   FBV v3 Prototype — TÀI KHOẢN · PHẢN BIỆN · HOẠT ĐỘNG · PHÁP LÝ · PHASE 2
   A01 Đăng nhập · A02 OTP · A03 Điều khoản · A04 Onboarding · A05 Hồ sơ · A06 Sửa hồ sơ
   A07 Cài đặt · A08 Tài khoản · A09 Xóa tài khoản · R11 Hoạt động · R12 Phản biện · R13 Phiên 1:1
   L01–L03 Pháp lý · P01 Gói · P02 Thanh toán IAP · P03 Quản lý gói · P04 Trao đổi kín
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = F.$, $$ = F.$$; const I = F.icon;
  const app = () => document.getElementById('app');
  const nextUrl = () => F.param('next') || 'reader/index.html';
  const authPage = (html) => { document.body.classList.add('auth', 'no-tab'); const a = app(); a.className = 'app'; a.innerHTML = html; F.demoBar('reader'); };
  const authBar = (left, right = '') => `<header class="appbar"><div class="ab-l">${left}</div><div class="ab-t"></div><div class="ab-r">${right}</div></header>`;

  /* ================= A01 · Đăng nhập / Đăng ký ================= */
  pages.login = () => {
    if (F.me()) { F.go(nextUrl()); return; }
    authPage(`${authBar(`<a class="icon-btn" href="${F.url('reader/index.html')}" aria-label="Đóng">${I('x')}</a>`)}
      <div class="auth-wrap"><div class="auth-hero">${F.logoFull()}<h1>Nghiên cứu kinh tế – tài chính, thẩm định bởi chuyên gia</h1><p>Đăng nhập hoặc tạo tài khoản FBV để lưu bài nghiên cứu, theo dõi chuyên gia và gửi phản biện 1:1.</p></div>
      <div class="stack">
        <button class="btn btn-white btn-pill btn-block" data-sso="apple">${F.appleIcon()}Tiếp tục với Apple</button>
        <button class="btn btn-gray btn-pill btn-block" data-sso="google">${F.googleIcon()}Tiếp tục với Google</button>
        <div class="or">hoặc</div>
        <div class="field"><label for="em">Email</label><input class="input" id="em" type="email" inputmode="email" autocomplete="email" placeholder="ban@example.com"><span class="err hidden" id="eme">Email chưa hợp lệ.</span></div>
        <button class="btn btn-primary btn-pill btn-block" id="go">Tiếp tục với Email</button>
        <p class="hint center">Chúng tôi gửi mã OTP 6 chữ số — không cần mật khẩu. Tài khoản demo: <b>minhanh@example.com</b></p>
        <a class="btn btn-ghost btn-block" href="${F.url('reader/index.html')}">Tiếp tục ở chế độ Khách</a>
        <p class="legal-small">Khi tiếp tục, bạn đồng ý với <a href="${F.url('reader/terms.html')}">Điều khoản sử dụng (EULA)</a> và <a href="${F.url('reader/privacy.html')}">Chính sách bảo mật</a> của FBV.</p>
      </div></div>`);
    $('#go').onclick = () => {
      const v = $('#em').value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { $('#eme').classList.remove('hidden'); $('#em').classList.add('invalid'); return; }
      F.go('reader/otp.html?e=' + encodeURIComponent(v) + '&next=' + encodeURIComponent(nextUrl()));
    };
    $('#em').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#go').click(); });
    $$('[data-sso]').forEach((b) => (b.onclick = () => {
      const p = b.dataset.sso === 'apple' ? 'Apple' : 'Google';
      const m = F.modal({ title: 'Đăng nhập với ' + p, dismissable: false, body: `<div class="empty" style="padding:16px 0"><div class="spinner"></div><p class="mt-12">Đang xác thực với ${p}… (mô phỏng)</p></div>` });
      setTimeout(() => { m.close(); const u = F.user('u1'); u.consent = true; u.onboarded = true; u.provider = p; F.login('u1'); F.toast('Đã đăng nhập bằng ' + p); setTimeout(() => F.go(nextUrl()), 300); }, 1100);
    }));
  };

  /* ================= A02 · Xác thực OTP ================= */
  pages.otp = () => {
    const email = F.param('e') || 'minhanh@example.com';
    authPage(`${authBar(`<button class="icon-btn" id="bk" aria-label="Quay lại">${I('chevL')}</button>`)}
      <div class="auth-wrap"><div class="auth-hero"><h1>Nhập mã xác thực</h1><p>Mã 6 chữ số đã được gửi tới <b style="color:var(--text)">${F.esc(email)}</b>. Mã có hiệu lực trong 10 phút.</p></div>
      <div class="stack"><div class="otp" id="otp">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" maxlength="1" aria-label="Chữ số ${i + 1}" autocomplete="${i ? 'off' : 'one-time-code'}">`).join('')}</div>
        <span class="err hidden" id="oe">Vui lòng nhập đủ 6 chữ số.</span>
        <button class="btn btn-primary btn-pill btn-block" id="ok">Xác nhận</button>
        <div class="row between small"><span class="muted">Không nhận được mã?</span><button class="btn-text" id="rs" disabled style="opacity:.5">Gửi lại (30s)</button></div>
        <div class="note">${I('info')}<span>Prototype: nhập 6 chữ số bất kỳ.</span></div></div></div>`);
    $('#bk').onclick = () => F.back('reader/login.html');
    const ins = $$('#otp input');
    ins.forEach((inp, i) => {
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && ins[i + 1]) ins[i + 1].focus(); if (ins.every((x) => x.value)) $('#ok').click(); });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus(); });
      inp.addEventListener('paste', (e) => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (t.length) { e.preventDefault(); ins.forEach((x, j) => (x.value = t[j] || '')); } });
    });
    setTimeout(() => ins[0].focus(), 100);
    let s = 30; const rs = $('#rs'); const tk = setInterval(() => { s--; rs.textContent = s > 0 ? `Gửi lại (${s}s)` : 'Gửi lại mã'; if (s <= 0) { clearInterval(tk); rs.disabled = false; rs.style.opacity = 1; } }, 1000);
    rs.onclick = () => F.toast('Đã gửi lại mã tới ' + email);
    $('#ok').onclick = () => {
      if (!ins.every((x) => /\d/.test(x.value))) { $('#oe').classList.remove('hidden'); return; }
      const db = F.db(); let u = db.users.find((x) => x.email === email);
      if (!u) { u = { id: F.uid('u'), name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), email, interests: [], joined: new Date().toISOString(), consent: false, onboarded: false, bookmarks: [], follows: [], blocked: [], history: [], status: 'active', provider: 'Email' }; db.users.push(u); }
      F.login(u.id);
      if (!u.consent) F.go('reader/consent.html?next=' + encodeURIComponent(nextUrl()));
      else if (!u.onboarded) F.go('reader/onboarding.html?next=' + encodeURIComponent(nextUrl()));
      else { F.toast('Chào mừng trở lại, ' + u.name.split(' ').pop()); setTimeout(() => F.go(nextUrl()), 300); }
    };
  };

  /* ================= A03 · Đồng ý điều khoản ================= */
  pages.consent = () => {
    const me = F.me(); if (!me) { F.go('reader/login.html'); return; }
    authPage(`${authBar('')}
      <div class="auth-wrap" style="padding-bottom:140px"><div class="auth-hero">${F.logoMark()}<h1>Trước khi bắt đầu</h1><p>FBV là không gian nghiên cứu học thuật. Vui lòng xác nhận các điều khoản dưới đây.</p></div>
      <div class="group" style="padding:4px 0">
        <label class="gi"><input type="checkbox" id="c1"><span class="gl">Tôi đồng ý với Điều khoản sử dụng (EULA)<small><a class="link" href="${F.url('reader/terms.html')}">Đọc điều khoản</a> · Bắt buộc</small></span></label>
        <label class="gi"><input type="checkbox" id="c2"><span class="gl">Tôi đã đọc Chính sách bảo mật<small><a class="link" href="${F.url('reader/privacy.html')}">Đọc chính sách</a> · Bắt buộc</small></span></label>
        <label class="gi"><input type="checkbox" id="c3"><span class="gl">Tôi hiểu nội dung FBV không phải khuyến nghị đầu tư<small><a class="link" href="${F.url('reader/disclaimer.html')}">Miễn trừ trách nhiệm</a> · Bắt buộc</small></span></label>
        <label class="gi"><input type="checkbox" id="c4"><span class="gl">Nhận bản tin nghiên cứu qua email<small>Không bắt buộc · tắt bất kỳ lúc nào</small></span></label>
      </div><p class="hint mt-12">Bạn có thể xóa tài khoản trực tiếp trong ứng dụng: Cài đặt → Tài khoản → Xóa tài khoản.</p></div>
      <div class="bottom-cta"><div class="inner"><button class="btn btn-primary btn-pill btn-block" id="ok" disabled>Đồng ý và tiếp tục</button></div></div>`);
    const upd = () => { $('#ok').disabled = !['c1', 'c2', 'c3'].every((id) => $('#' + id).checked); };
    $$('input[type=checkbox]').forEach((c) => (c.onchange = upd));
    $('#ok').onclick = () => { me.consent = true; me.marketing = $('#c4').checked; F.save(); F.go('reader/onboarding.html?next=' + encodeURIComponent(nextUrl())); };
  };

  /* ================= A04 · Onboarding (Tùy chỉnh trải nghiệm) ================= */
  const STREAMS = [['fintech', 'Fintech', 'Ngân hàng số, thanh toán, tài sản mã hóa, sandbox', 'cpu', '#9B7BFF'], ['macro', 'Kinh tế Vĩ mô', 'Lãi suất, tỷ giá, lạm phát, GDP, FDI', 'globe', '#5AA9FF'], ['micro', 'Kinh tế Vi mô', 'Doanh nghiệp, ngành, thị trường vốn, hành vi', 'building', '#2FD06E']];
  pages.onboarding = () => {
    const me = F.me(); if (!me) { F.go('reader/login.html'); return; }
    let step = 1; const sel = new Set(me.interests); const fol = new Set(me.follows);
    const draw = () => {
      const steps = `<div class="steps">${[1, 2, 3].map((i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
      let body = '', cta = '';
      if (step === 1) {
        body = `<div class="ob-head">${F.logoMark()}<h1>Bạn quan tâm lĩnh vực nào?</h1><p>Chọn một hoặc nhiều luồng nghiên cứu. Bảng tin sẽ ưu tiên nội dung phù hợp.</p></div>
          ${STREAMS.map((s) => `<div class="ob-item"><span class="ob-ico" style="background:${s[4]}">${I(s[3])}</span><div class="t"><b>${s[1]}</b><p>${s[2]}</p></div><button class="plus-btn ${sel.has(s[0]) ? 'on' : ''}" data-s="${s[0]}" aria-label="${sel.has(s[0]) ? 'Bỏ chọn' : 'Chọn'} ${s[1]}">${I(sel.has(s[0]) ? 'check' : 'plus')}</button></div>`).join('')}`;
        cta = `<button class="btn btn-primary btn-pill btn-block" id="nx" ${sel.size ? '' : 'disabled'}>Tiếp tục</button>`;
      } else if (step === 2) {
        body = `<div class="ob-head">${F.logoMark()}<h1>Tùy chỉnh trải nghiệm</h1><p>Theo dõi chuyên gia để nhận bài nghiên cứu mới của họ.</p></div>
          ${F.db().experts.map((e) => `<div class="ob-item">${F.avatar(e, 'md')}<div class="t"><b><span class="ellipsis">${F.esc(e.name)}</span>${F.vb(e)}</b><small class="ellipsis">${F.esc(e.title)}</small><p class="clamp2">${F.esc(e.bio)}</p></div><button class="plus-btn ${fol.has(e.id) ? 'on' : ''}" data-e="${e.id}" aria-label="${fol.has(e.id) ? 'Bỏ theo dõi' : 'Theo dõi'} ${F.esc(e.name)}">${I(fol.has(e.id) ? 'check' : 'plus')}</button></div>`).join('')}`;
        cta = `<button class="btn btn-primary btn-pill btn-block" id="nx">${fol.size ? `Tiếp tục · theo dõi ${fol.size}` : 'Bỏ qua'}</button>`;
      } else {
        body = `<div class="ob-head" style="text-align:center;padding-top:40px"><div class="empty" style="padding:0 0 12px"><div class="ico" style="width:84px;height:84px;background:var(--accent-soft);color:var(--accent-text)">${I('bell')}</div></div><h1>Bật thông báo</h1><p>Nhận thông báo khi chuyên gia trả lời phản biện của bạn hoặc xuất bản bài nghiên cứu mới.</p></div>`;
        cta = `<button class="btn btn-primary btn-pill btn-block" id="nx">Bật thông báo</button><button class="btn btn-ghost btn-block" id="skip">Để sau</button>`;
      }
      authPage(`${authBar(step > 1 ? `<button class="icon-btn" id="bk" aria-label="Quay lại">${I('chevL')}</button>` : '', step < 3 ? `<button class="txt-btn" id="skipAll">Bỏ qua</button>` : '')}${steps}<div style="padding-bottom:150px;max-width:600px;margin:0 auto">${body}</div><div class="bottom-cta"><div class="inner">${cta}</div></div>`);
      const bk = $('#bk'); if (bk) bk.onclick = () => { step--; draw(); };
      $$('[data-s]').forEach((b) => (b.onclick = () => { const k = b.dataset.s; sel.has(k) ? sel.delete(k) : sel.add(k); draw(); }));
      $$('[data-e]').forEach((b) => (b.onclick = () => { const k = b.dataset.e; fol.has(k) ? fol.delete(k) : fol.add(k); draw(); }));
      const done = (notif) => { me.interests = Array.from(sel); me.follows = Array.from(fol); me.onboarded = true; me.prefs = Object.assign(me.prefs || {}, { answer: notif, report: notif, follow: notif }); F.save(); F.toast('Thiết lập xong! Chào mừng đến FBV'); setTimeout(() => F.go(nextUrl()), 300); };
      $('#nx').onclick = () => { if (step < 3) { step++; draw(); } else done(true); };
      const sk = $('#skip'); if (sk) sk.onclick = () => done(false);
      const sa = $('#skipAll'); if (sa) sa.onclick = () => done(false);
    };
    draw();
  };

  /* ================= A05 · Hồ sơ cá nhân ================= */
  pages.account = () => {
    const me = F.me();
    const v = F.shell({ side: 'me', bar: 'back', back: 'reader/index.html', title: '', right: `<a class="icon-btn" href="${F.url('reader/settings.html')}" aria-label="Cài đặt">${I('settings')}</a>` });
    if (!me) { v.innerHTML = F.gate('user', 'Hồ sơ của bạn', 'Đăng nhập để quản lý hồ sơ, lĩnh vực quan tâm và hoạt động đọc.'); return; }
    const fol = me.follows.map(F.expert).filter(Boolean); const myQ = F.db().inquiries.filter((q) => q.reader === me.id);
    let tab = F.param('t') || 'activity';
    v.innerHTML = `${me.type === 'expert' && F.myExpert() ? F.coverBanner(F.myExpert(), true) : ''}<div class="prof ${me.type === 'expert' ? 'has-cover' : ''}"><div class="prof-top"><div class="t"><h1>${F.esc(me.name)}</h1><div class="h">@${F.esc(me.handle)}</div></div>${F.avatar(me, 'xl')}</div>
      ${me.bio ? `<p class="bio">${F.esc(me.bio)}</p>` : ''}
      <div class="interest-row">${me.type === 'expert' ? `<a class="verified-pill" href="${F.url('reader/expert.html?id=' + me.expertId)}">${F.vb(F.myExpert())}Chuyên gia · Verified by FBV</a>` : `<span class="tag">${I('user', 'i-xs')}Tài khoản thường</span>`}${me.interests.length ? me.interests.map((s) => `<span class="tag accent">${F.STREAM[s]}</span>`).join('') : '<span class="tag">Chưa chọn lĩnh vực</span>'}${F.hasSub() ? `<span class="tag prem">${I('crown', 'i-xs')}Premium</span>` : ''}</div>
      <a class="meta" href="${F.url('reader/bookmarks.html?t=following')}">${fol.length ? `<span class="stk">${fol.slice(0, 3).map((e) => F.avatar(e, 'xs')).join('')}</span>` : ''}<span>Đang theo dõi <b style="color:var(--text)">${fol.length}</b> chuyên gia</span></a>
      <div class="btns"><a class="btn btn-gray" href="${F.url('reader/profile-edit.html')}">Chỉnh sửa hồ sơ</a><a class="btn btn-gray" href="${F.url('reader/workspace.html')}">${I('briefcase')}Làm việc</a></div>
      ${me.type !== 'expert' ? `<a class="ws-cta mt-16" href="${F.url('reader/expert-apply.html')}"><span class="ic">${I('award')}</span><span class="grow"><b>${F.myApplication() ? 'Hồ sơ chuyên gia: ' + F.APP_STATUS[F.myApplication().status] : 'Trở thành chuyên gia FBV'}</b><small>${F.myApplication() ? 'Xem tiến độ thẩm định hồ sơ' : 'Nộp hồ sơ, bằng cấp, chứng chỉ để FBV thẩm định'}</small></span>${I('chevR', 'i-sm')}</a>` : ''}</div>
      <div class="utabs mt-16" id="tb"></div><div id="tv"></div>`;
    const cvE = $('#cvEdit'); if (cvE) cvE.onclick = () => F.coverSheet(F.myExpert(), () => location.reload());
    const draw = () => {
      const hist = me.history.map(F.report).filter(Boolean); const saved = me.bookmarks.map(F.report).filter(Boolean);
      $('#tb').innerHTML = [['activity', 'Hoạt động'], ['inq', 'Phản biện'], ['saved', 'Đã lưu']].map((t) => `<button class="${tab === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('');
      $$('#tb [data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
      const tv = $('#tv');
      if (tab === 'activity') tv.innerHTML = hist.length ? `<div class="sec"><h2>Đã đọc gần đây</h2><a href="${F.url('reader/bookmarks.html?t=history')}">Xem tất cả</a></div>` + hist.slice(0, 5).map((r) => F.postCompact(r, { date: 'ago' })).join('') : F.empty('read', 'Chưa có hoạt động', 'Bài nghiên cứu bạn đọc và phản biện bạn gửi sẽ xuất hiện tại đây.');
      else if (tab === 'inq') tv.innerHTML = myQ.length ? `<div class="chat-list">${myQ.map(inqRow).join('')}</div>` : F.empty('chat', 'Chưa có phản biện', 'Bôi đen đoạn văn trong bài nghiên cứu để gửi câu hỏi tới chuyên gia.');
      else tv.innerHTML = saved.length ? saved.map((r) => F.postCompact(r)).join('') : F.empty('bookmark', 'Chưa lưu bài nghiên cứu nào', 'Nhấn biểu tượng lưu để đọc lại sau.');
    };
    draw();
  };

  /* ================= A06 · Chỉnh sửa hồ sơ ================= */
  pages.profileEdit = () => {
    const me = F.me(); if (!me) { F.go('reader/login.html?next=' + encodeURIComponent('reader/profile-edit.html')); return; }
    const v = F.shell({ side: 'me', bar: 'back', notab: true, title: 'Chỉnh sửa hồ sơ', left: `<button class="txt-btn" id="cc">Hủy</button>`, right: `<button class="txt-btn acc" id="sv" disabled>Lưu</button>` });
    v.innerHTML = `<div class="page stack lg" style="padding-top:8px">
      <div class="center"><div class="av-wrap" style="margin:8px auto 0">${F.avatar(me, 'xl').replace('av me xl', 'av me xl" style="--s:112px')}<button class="av-cam" id="cam" aria-label="Đổi ảnh đại diện">${I('camera')}</button></div></div>
      ${me.type === 'expert' && F.myExpert() ? `<div class="group"><button class="gi" id="gCv">${I('image')}<span class="gl">Ảnh bìa hồ sơ chuyên gia<small>Hiển thị trên hồ sơ công khai</small></span><span class="cv-mini" style="background:${F.COVERS[F.myExpert().cover] ? `linear-gradient(120deg,${F.COVERS[F.myExpert().cover][0]},${F.COVERS[F.myExpert().cover][1]})` : String(F.myExpert().cover || '').startsWith('data:') ? `url(${F.myExpert().cover}) center/cover` : 'var(--brand-grad)'}"></span>${I('chevR', 'chev')}</button></div>` : ''}
      <div class="field"><label for="nm">Họ và tên</label><input class="input" id="nm" value="${F.esc(me.name)}" maxlength="60"></div>
      <div class="field"><label for="hd">Tên hiển thị</label><div class="input-group"><span class="pre">fbv.vn/@</span><input class="input" id="hd" value="${F.esc(me.handle)}" maxlength="30"></div></div>
      <div class="field"><div class="row between"><label for="bio" class="label">Giới thiệu</label><span class="hint num" id="bc">${me.bio.length}/250</span></div><textarea class="textarea" id="bio" maxlength="250" placeholder="Giới thiệu ngắn về bạn…">${F.esc(me.bio)}</textarea></div>
      <div class="field"><label>Email</label><input class="input" value="${F.esc(me.email)}" readonly></div>
      <div class="group">
        <button class="gi" id="gInt">${I('sliders')}<span class="gl">Lĩnh vực quan tâm</span><span class="gv">${me.interests.length}</span>${I('chevR', 'chev')}</button>
        <a class="gi" href="${F.url('reader/bookmarks.html?t=following')}">${I('users')}<span class="gl">Chuyên gia theo dõi</span><span class="gv">${me.follows.length}</span>${I('chevR', 'chev')}</a>
        <button class="gi" id="gBlk">${I('ban')}<span class="gl">Chuyên gia đã chặn</span><span class="gv">${me.blocked.length}</span>${I('chevR', 'chev')}</button>
      </div></div>`;
    const dirty = () => { $('#sv').disabled = $('#nm').value.trim() === me.name && $('#hd').value.trim() === me.handle && $('#bio').value === me.bio; };
    ['nm', 'hd', 'bio'].forEach((id) => $('#' + id).addEventListener('input', () => { if (id === 'bio') $('#bc').textContent = $('#bio').value.length + '/250'; dirty(); }));
    $('#cc').onclick = () => F.back('reader/account.html');
    $('#sv').onclick = () => { const n = $('#nm').value.trim(); if (n.length < 2) { $('#nm').classList.add('invalid'); F.toast('Họ tên tối thiểu 2 ký tự', 'error'); return; } me.name = n; me.handle = $('#hd').value.trim().replace(/[^a-z0-9._]/gi, '') || me.handle; me.bio = $('#bio').value; F.save(); F.toast('Đã lưu hồ sơ'); setTimeout(() => F.go('reader/account.html'), 300); };
    $('#cam').onclick = () => F.menu([{ icon: 'camera', label: 'Chụp ảnh', onClick: () => F.toast('Mô phỏng: mở camera', 'info') }, { icon: 'image', label: 'Chọn từ thư viện', onClick: () => F.toast('Mô phỏng: mở thư viện ảnh', 'info') }, { icon: 'trash', label: 'Xóa ảnh hiện tại', danger: true, onClick: () => F.toast('Đã xóa ảnh đại diện', 'info') }], 'Ảnh đại diện');
    const gCv = $('#gCv'); if (gCv) gCv.onclick = () => F.coverSheet(F.myExpert(), () => location.reload());
    $('#gInt').onclick = () => interestSheet(() => location.reload());
    $('#gBlk').onclick = () => blockedSheet();
  };
  const interestSheet = (after) => { const me = F.me(); const sel = new Set(me.interests);
    F.modal({ title: 'Lĩnh vực quan tâm', body: `<p class="muted small mb-12">Chọn luồng nghiên cứu để cá nhân hóa bảng tin.</p><div class="group">${STREAMS.map((s) => `<label class="gi"><span class="ob-ico" style="width:36px;height:36px;border-radius:10px;background:${s[4]}">${I(s[3], 'i-sm')}</span><span class="gl">${s[1]}<small>${s[2]}</small></span><input type="checkbox" value="${s[0]}" ${sel.has(s[0]) ? 'checked' : ''}></label>`).join('')}</div>`,
      actions: [{ label: 'Hủy' }, { label: 'Lưu', cls: 'btn-primary', onClick: (c, el) => { me.interests = $$('input:checked', el).map((x) => x.value); F.save(); F.toast('Đã cập nhật lĩnh vực quan tâm'); after && after(); } }] }); };
  const blockedSheet = () => { const me = F.me(); const draw = (el) => { $('.sheet-body', el).innerHTML = me.blocked.length ? `<div class="group">${me.blocked.map((id) => { const e = F.expert(id) || F.person(id); return `<div class="gi">${F.avatar(e, 'sm')}<span class="gl">${F.esc(e.name)}</span><button class="btn btn-gray btn-xs" data-ub="${id}">Bỏ chặn</button></div>`; }).join('')}</div>` : `<div class="empty" style="padding:16px 0"><div class="ico">${I('ban')}</div><h3>Chưa chặn ai</h3><p>Bạn có thể chặn chuyên gia từ hồ sơ hoặc trong phiên phản biện.</p></div>`; $$('[data-ub]', el).forEach((b) => (b.onclick = () => { me.blocked = me.blocked.filter((x) => x !== b.dataset.ub); F.save(); F.toast('Đã bỏ chặn'); draw(el); })); };
    F.modal({ title: 'Đã chặn', body: '', onOpen: (el) => draw(el) }); };

  /* ================= A07 · Cài đặt ================= */
  pages.settings = () => {
    const me = F.me(); const s = F.session();
    const v = F.shell({ side: 'me', bar: 'close', back: me ? 'reader/account.html' : 'reader/index.html', notab: true, title: '' });
    const TH = { dark: 'Tối', light: 'Sáng', system: 'Theo hệ thống' };
    const ext = (icon, label, id) => `<button class="gi" id="${id}">${I(icon)}<span class="gl">${label}</span>${I('arrowUR', 'chev')}</button>`;
    v.innerHTML = `<h1 class="large-title">Cài đặt</h1><div class="page groups">
      ${me ? `<a class="group" href="${F.url('reader/profile-edit.html')}"><div class="gi">${F.avatar(me, 'md')}<span class="gl">${F.esc(me.name)}<small>${F.esc(me.email)}</small></span>${I('chevR', 'chev')}</div></a>
      <div class="group"><a class="gi" href="${F.url('reader/workspace.html')}">${I('briefcase')}<span class="gl">Không gian làm việc</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/journal.html')}">${I('stickyNote')}<span class="gl">Nhật ký nghiên cứu</span><span class="gv">${(me.notes || []).length}</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/assistant.html')}">${I('sparkles')}<span class="gl">Trợ lý nghiên cứu</span><span class="gv">Beta</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/expert-apply.html')}">${I('award')}<span class="gl">${me.type === 'expert' ? 'Hồ sơ chuyên gia' : 'Đăng ký chuyên gia'}</span><span class="gv">${me.type === 'expert' ? 'Đã xác minh' : F.myApplication() ? F.APP_STATUS[F.myApplication().status] : ''}</span>${I('chevR', 'chev')}</a></div>
      <div class="group"><a class="gi" href="${F.url('reader/bookmarks.html')}">${I('bookmark')}<span class="gl">Đã lưu</span><span class="gv">${me.bookmarks.length}</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/bookmarks.html?t=history')}">${I('archive')}<span class="gl">Lịch sử đọc</span>${I('chevR', 'chev')}</a><button class="gi" id="sto">${I('storage')}<span class="gl">Bộ nhớ & tải xuống</span><span class="gv">3,4 MB</span>${I('chevR', 'chev')}</button></div>`
      : `<div class="group"><a class="gi" href="${F.url('reader/login.html?next=' + encodeURIComponent('reader/settings.html'))}">${I('user')}<span class="gl">Đăng nhập / Đăng ký<small>Bạn đang ở chế độ Khách</small></span>${I('chevR', 'chev')}</a></div>`}
      <div class="group">${me ? `<a class="gi" href="${F.url('reader/account-info.html')}">${I('user')}<span class="gl">Tài khoản</span>${I('chevR', 'chev')}</a>` : ''}<button class="gi" id="thm">${I('palette')}<span class="gl">Giao diện</span><span class="gv">${TH[F.theme()]}</span>${I('chevR', 'chev')}</button><button class="gi" id="rdp">${I('textSize')}<span class="gl">Trình đọc</span><span class="gv">${F.readerLabel()}</span>${I('chevR', 'chev')}</button>${me ? `<button class="gi" id="ntf">${I('bell')}<span class="gl">Thông báo</span>${I('chevR', 'chev')}</button>` : ''}</div>
      ${me ? `<div class="group"><a class="gi" href="${F.url(s.phase2 ? 'reader/subscription.html' : 'reader/pricing.html')}">${I('card')}<span class="gl">Gói hội viên</span><span class="gv">${F.hasSub() ? 'Premium' : 'Miễn phí'}</span>${I('chevR', 'chev')}</a><button class="gi" id="int">${I('sliders')}<span class="gl">Nội dung quan tâm</span><span class="gv">${me.interests.map((x) => F.STREAM_S[x]).join(', ') || 'Chưa chọn'}</span>${I('chevR', 'chev')}</button><button class="gi" id="lng">${I('translate')}<span class="gl">Ngôn ngữ</span><span class="gv" data-notr>${F.lang() === 'en' ? 'English' : 'Tiếng Việt'}</span>${I('chevR', 'chev')}</button><button class="gi" id="prv">${I('shield')}<span class="gl">Quyền riêng tư</span>${I('chevR', 'chev')}</button></div>` : ''}
      <div class="group">${ext('help', 'Hỗ trợ', 'sup')}${ext('feedback', 'Góp ý', 'fbk')}<a class="gi" href="${F.url('reader/terms.html')}">${I('file')}<span class="gl">Điều khoản & chính sách</span>${I('chevR', 'chev')}</a></div>
      ${me ? `<div class="group"><button class="gi danger" id="out">${I('power')}<span class="gl">Đăng xuất</span></button></div>` : ''}
      <div class="small faint" style="padding:0 4px">Phiên bản 1.0.0 (Prototype) · Build 2026.09<div class="foot-links" style="margin-top:6px"><a href="${F.url('reader/terms.html')}">EULA</a><a href="${F.url('reader/privacy.html')}">Chính sách bảo mật</a><a href="${F.url('reader/disclaimer.html')}">Miễn trừ trách nhiệm</a></div></div>
    </div>`;
    $('#thm').onclick = () => F.modal({ title: 'Giao diện', body: `<div class="group">${[['dark', 'Tối', 'moon'], ['light', 'Sáng', 'sun'], ['system', 'Theo hệ thống', 'phone']].map((t) => `<label class="gi">${I(t[2])}<span class="gl">${t[1]}</span><input type="radio" name="th" value="${t[0]}" ${F.theme() === t[0] ? 'checked' : ''}></label>`).join('')}</div>`, onOpen: (el, close) => $$('input[name=th]', el).forEach((r) => (r.onchange = () => { F.setTheme(r.value); close(); location.reload(); })) });
    $('#rdp').onclick = () => F.readerSheet();
    $('#sup').onclick = () => F.toast('Mô phỏng: mở trung tâm hỗ trợ support.fbv.vn', 'info');
    $('#fbk').onclick = () => F.modal({ title: 'Góp ý cho FBV', body: `<div class="field"><label for="fb">Bạn muốn FBV cải thiện điều gì?</label><textarea class="textarea" id="fb" placeholder="Nội dung góp ý…"></textarea></div>`, actions: [{ label: 'Hủy' }, { label: 'Gửi', cls: 'btn-primary', onClick: () => F.toast('Cảm ơn góp ý của bạn!') }] });
    if (!me) return;
    $('#sto').onclick = () => F.modal({ title: 'Bộ nhớ & tải xuống', body: `<div class="group"><div class="gi noicon"><span class="gl">PDF đã tải</span><span class="gv">2 tệp · 3,1 MB</span></div><div class="gi noicon"><span class="gl">Bộ nhớ đệm</span><span class="gv">0,3 MB</span></div></div><p class="hint mt-8">Bài nghiên cứu PDF đã tải có thể đọc ngoại tuyến trong ứng dụng.</p>`, actions: [{ label: 'Đóng' }, { label: 'Xóa dữ liệu tải xuống', cls: 'btn-danger-soft', onClick: () => F.toast('Đã xóa dữ liệu tải xuống') }] });
    $('#ntf').onclick = () => { const p = me.prefs; const row = (k, t, d) => `<label class="gi noicon"><span class="gl">${t}<small>${d}</small></span><span class="switch"><input type="checkbox" data-k="${k}" ${p[k] ? 'checked' : ''}><span></span></span></label>`;
      F.modal({ title: 'Thông báo', body: `<div class="group-title">Thông báo đẩy</div><div class="group">${row('answer', 'Phản hồi phản biện', 'Khi chuyên gia trả lời bạn')}${row('follow', 'Chuyên gia theo dõi', 'Khi có bài nghiên cứu mới')}${row('report', 'Bài nghiên cứu theo lĩnh vực', 'Luồng bạn quan tâm')}</div><div class="group-title mt-16">Email</div><div class="group">${row('digest', 'Bản tin tuần', 'Tổng hợp nghiên cứu nổi bật')}${row('email', 'Email phản biện', 'Sao chép thông báo qua email')}</div>`, onOpen: (el) => $$('[data-k]', el).forEach((c) => (c.onchange = () => { p[c.dataset.k] = c.checked; F.save(); })) }); };
    $('#int').onclick = () => interestSheet(() => location.reload());
    $('#lng').onclick = () => F.langSheet();
    $('#prv').onclick = () => F.modal({ title: 'Quyền riêng tư', body: `<div class="group"><button class="gi" id="pb">${I('ban')}<span class="gl">Chuyên gia đã chặn</span><span class="gv">${me.blocked.length}</span>${I('chevR', 'chev')}</button><label class="gi">${I('sparkles')}<span class="gl">Cá nhân hóa bảng tin<small>Dựa trên lĩnh vực và lịch sử đọc</small></span><span class="switch"><input type="checkbox" checked><span></span></span></label><button class="gi" id="pe">${I('download')}<span class="gl">Tải xuống dữ liệu của tôi</span>${I('chevR', 'chev')}</button><a class="gi" href="${F.url('reader/privacy.html')}">${I('file')}<span class="gl">Chính sách bảo mật</span>${I('chevR', 'chev')}</a></div>`, onOpen: (el, close) => { $('#pb', el).onclick = () => { close(); blockedSheet(); }; $('#pe', el).onclick = () => F.toast('Đã gửi yêu cầu. Tệp dữ liệu sẽ được gửi qua email trong 48 giờ.'); } });
    $('#out').onclick = () => F.confirm('Đăng xuất?', 'Bạn có thể đăng nhập lại bất cứ lúc nào bằng email hoặc Apple/Google.', 'Đăng xuất', 'btn-danger', () => { F.logout(); F.toast('Đã đăng xuất'); setTimeout(() => F.go('reader/index.html'), 300); });
  };

  /* ================= A08 · Tài khoản ================= */
  pages.accountInfo = () => {
    const me = F.me(); if (!me) { F.go('reader/login.html?next=' + encodeURIComponent('reader/account-info.html')); return; }
    const v = F.shell({ side: 'me', bar: 'back', back: 'reader/settings.html', title: 'Tài khoản' });
    const prov = me.provider || 'Email';
    v.innerHTML = `<div class="page groups" style="padding-top:12px">
      <div class="group plain"><div class="gi noicon"><span class="gl">Loại tài khoản</span><span class="gv">${F.ACCT[me.type]}</span></div><div class="gi noicon"><span class="gl">Email</span><span class="gv">${F.esc(me.email)}</span></div><div class="gi noicon"><span class="gl">Đăng nhập bằng</span><span class="gv">${prov === 'Email' ? 'Email · OTP' : prov}</span></div><div class="gi noicon"><span class="gl">Ngày tham gia</span><span class="gv">${F.date(me.joined)}</span></div></div>
      <div><div class="group-title">Phương thức liên kết</div><div class="group"><div class="gi"><span style="width:22px;display:grid;place-items:center">${F.appleIcon()}</span><span class="gl">Apple</span>${prov === 'Apple' ? '<span class="gv">Đã liên kết</span>' : `<button class="btn btn-gray btn-xs" data-lk="Apple">Liên kết</button>`}</div><div class="gi"><span style="width:22px;display:grid;place-items:center">${F.googleIcon()}</span><span class="gl">Google</span>${prov === 'Google' ? '<span class="gv">Đã liên kết</span>' : `<button class="btn btn-gray btn-xs" data-lk="Google">Liên kết</button>`}</div></div></div>
      <div class="group"><a class="gi center danger" href="${F.url('reader/delete-account.html')}"><span class="gl">Xóa tài khoản</span></a></div>
      <p class="group-foot">Xóa tài khoản sẽ xóa vĩnh viễn hồ sơ, bài nghiên cứu đã lưu và lịch sử phản biện của bạn trong vòng 30 ngày.</p></div>`;
    $$('[data-lk]').forEach((b) => (b.onclick = () => { me.provider = b.dataset.lk; F.save(); F.toast('Đã liên kết ' + b.dataset.lk); setTimeout(() => location.reload(), 400); }));
  };

  /* ================= A09 · Xóa tài khoản ================= */
  pages.deleteAccount = () => {
    const me = F.me(); if (!me) { F.go('reader/login.html'); return; }
    const v = F.shell({ side: 'me', bar: 'back', back: 'reader/account-info.html', title: 'Xóa tài khoản', notab: true });
    v.innerHTML = `<div class="page stack lg" style="padding-top:12px">
      <div><div class="empty" style="padding:8px 0 0;align-items:flex-start;text-align:left"><div class="ico" style="background:var(--danger-soft);color:var(--danger)">${I('trash')}</div></div><h1 class="serif" style="font-size:28px;line-height:1.2">Xóa vĩnh viễn tài khoản?</h1><p class="muted mt-8">Thao tác không thể hoàn tác. Các dữ liệu sau sẽ bị xóa:</p></div>
      <div class="group plain">${['Hồ sơ, email và lĩnh vực quan tâm', 'Bài nghiên cứu đã lưu và lịch sử đọc', 'Toàn bộ phiên phản biện 1:1', 'Danh sách chuyên gia theo dõi'].map((x) => `<div class="gi noicon"><span class="gl" style="font-weight:500">${x}</span>${I('x', 'i-sm down')}</div>`).join('')}</div>
      ${F.hasSub() ? `<div class="note warn">${I('alert')}<span>Bạn đang có gói <b>Premium</b>. Xóa tài khoản không tự hủy gia hạn trên App Store / Google Play — hãy hủy gia hạn trong phần quản lý gói của cửa hàng.</span></div>` : ''}
      <div><div class="group-title">Lý do (không bắt buộc)</div><div class="group">${['Tôi không còn sử dụng', 'Nội dung chưa phù hợp', 'Lo ngại quyền riêng tư', 'Lý do khác'].map((x, i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${x}</span><input type="radio" name="rs" ${i ? '' : 'checked'}></label>`).join('')}</div></div>
      <div class="field"><label for="cf">Nhập <b style="color:var(--danger)">XÓA</b> để xác nhận</label><input class="input" id="cf" autocomplete="off" placeholder="XÓA"></div>
      <button class="btn btn-danger btn-pill btn-block" id="del" disabled>Xóa tài khoản vĩnh viễn</button>
      <a class="btn btn-ghost btn-block" href="${F.url('reader/account-info.html')}">Giữ tài khoản</a></div>`;
    $('#cf').oninput = () => { $('#del').disabled = $('#cf').value.trim().toUpperCase() !== 'XÓA'; };
    $('#del').onclick = () => {
      const db = F.db(); const id = me.id;
      db.users = db.users.filter((u) => u.id !== id); db.inquiries = db.inquiries.filter((q) => q.reader !== id); db.notifications = db.notifications.filter((n) => n.user !== id);
      F.session().uid = null; F.session().subscription = null; F.save();
      authPage(`<div class="auth-wrap" style="padding-top:80px"><div class="empty"><div class="ico" style="background:var(--success-soft);color:var(--success)">${I('check')}</div><h3>Tài khoản đã được xóa</h3><p>Dữ liệu của bạn sẽ được loại bỏ hoàn toàn khỏi hệ thống trong vòng 30 ngày. Cảm ơn bạn đã đồng hành cùng FBV.</p><a class="btn btn-primary" href="${F.url('reader/index.html')}">Về trang chủ</a></div></div>`);
    };
  };

  /* ================= R11 · Hoạt động (Thông báo) ================= */
  const notiLink = (n) => (n.type === 'answer' ? 'reader/inquiry.html?id=' + n.ref + '&n=' + n.id : n.ref ? 'reader/report.html?id=' + n.ref + '&n=' + n.id : 'reader/notifications.html');
  pages.notifications = () => {
    const v = F.shell({ tab: 'activity', bar: 'root', rootTitle: '' }); const me = F.me();
    v.innerHTML = `<h1 class="large-title">Hoạt động</h1><div id="nv"></div>`;
    if (!me) { $('#nv').innerHTML = F.gate('bell', 'Theo dõi mọi phản hồi', 'Đăng nhập để nhận thông báo khi chuyên gia trả lời phản biện hoặc xuất bản bài nghiên cứu mới.'); return; }
    let f = 'all';
    const draw = () => {
      const all = F.db().notifications.filter((n) => n.user === me.id).sort((a, b) => new Date(b.at) - new Date(a.at));
      const list = all.filter((n) => f === 'all' || (f === 'answer' && n.type === 'answer') || (f === 'report' && ['report', 'follow'].includes(n.type)) || (f === 'system' && n.type === 'system'));
      $('#nv').innerHTML = `<div class="row between" style="padding:0 var(--gutter) 8px"><div class="chips">${[['all', 'Tất cả'], ['answer', 'Phản biện'], ['report', 'Bài nghiên cứu mới'], ['system', 'Hệ thống']].map((x) => `<button class="chip ${f === x[0] ? 'on' : ''}" data-f="${x[0]}">${x[1]}</button>`).join('')}</div></div>
        ${all.some((n) => !n.read) ? `<div style="padding:0 var(--gutter) 6px;text-align:right"><button class="btn-text small" id="ra">Đánh dấu tất cả đã đọc</button></div>` : ''}
        ${list.length ? list.map((n) => { const q = n.type === 'answer' ? F.inquiry(n.ref) : null; const r = n.type !== 'answer' && n.ref ? F.report(n.ref) : null; const who = q ? F.expert(q.expert) : r ? F.expert(r.author) : null; const ic = { answer: 'chat', report: 'file', follow: 'user', system: 'info' }[n.type];
          return `<a class="act ${n.read ? '' : 'unread'}" href="${F.url(notiLink(n))}" data-n="${n.id}"><span class="ai">${who ? F.avatar(who, 'md') : F.logoMark('av md')}<span class="ib">${I(ic)}</span></span><span class="t">${F.esc(n.text)}<small>${F.ago(n.at)}</small></span>${n.read ? '' : '<span class="udot" style="margin-top:6px"></span>'}</a>`; }).join('') : F.empty('bell', 'Chưa có thông báo', 'Hoạt động mới sẽ xuất hiện tại đây.')}`;
      $$('[data-f]').forEach((b) => (b.onclick = () => { f = b.dataset.f; draw(); }));
      const ra = $('#ra'); if (ra) ra.onclick = () => { all.forEach((n) => (n.read = true)); F.save(); draw(); F.toast('Đã đánh dấu tất cả là đã đọc'); };
      $$('[data-n]').forEach((a) => a.addEventListener('click', () => { const n = all.find((x) => x.id === a.dataset.n); n.read = true; F.save(); }));
    };
    draw();
  };

  /* ================= R12 · Phản biện của tôi (Chat) ================= */
  const inqRow = (q) => { const e = F.expert(q.expert); const r = F.report(q.r); const last = q.messages[q.messages.length - 1]; const mine = last.by === q.reader;
    return `<a class="lrow ${q.readerUnread ? 'unread' : ''}" href="${F.url('reader/inquiry.html?id=' + q.id)}">${F.avatar(e, 'md')}<div class="t"><b><span class="ellipsis">${F.esc(e.name)}</span>${F.vb(e)}</b><div class="pv">${mine ? 'Bạn: ' : ''}${F.esc(last.x)}</div><small class="ellipsis">${F.iStatusBadge(q.status)} <span style="margin-left:4px">${F.esc(r ? r.title : '')}</span></small></div><div class="rt"><span>${F.short(last.at)}</span>${q.readerUnread ? '<span class="udot"></span>' : ''}</div></a>`; };
  pages.inquiries = () => {
    const v = F.shell({ tab: 'chat', bar: 'root', rootTitle: '' }); const me = F.me();
    v.innerHTML = `<h1 class="large-title">Phản biện</h1><div id="iv"></div>`;
    if (!me) { $('#iv').innerHTML = F.gate('chat', 'Trao đổi học thuật 1:1 kín', 'Bôi đen đoạn văn hoặc số liệu trong bài nghiên cứu để gửi câu hỏi phản biện riêng tới chuyên gia tác giả. Không công khai trên mạng xã hội.'); return; }
    let f = 'open';
    const draw = () => {
      const all = F.db().inquiries.filter((q) => q.reader === me.id).sort((a, b) => new Date(b.messages[b.messages.length - 1].at) - new Date(a.messages[a.messages.length - 1].at));
      const open = all.filter((q) => ['new', 'assigned', 'in_progress', 'answered'].includes(q.status)); const done = all.filter((q) => !['new', 'assigned', 'in_progress', 'answered'].includes(q.status));
      const list = f === 'open' ? open : done;
      $('#iv').innerHTML = `<div class="page"><div class="panel">${F.quotaBar()}</div>
          ${F.session().phase2 ? `<a class="note accent mt-12" href="${F.url('reader/sessions.html')}">${I('video')}<span class="grow"><b>Buổi trao đổi kín cùng chuyên gia</b><br>Đặc quyền Premium · lịch định kỳ hằng tháng</span>${I('chevR', 'i-sm')}</a>` : ''}
          <div class="seg full mt-16"><button class="${f === 'open' ? 'on' : ''}" data-f="open">Đang mở · ${open.length}</button><button class="${f === 'done' ? 'on' : ''}" data-f="done">Đã đóng · ${done.length}</button></div></div>
        <div class="chat-list mt-8">${list.length ? list.map(inqRow).join('') : F.empty('chat', f === 'open' ? 'Chưa có phiên đang mở' : 'Chưa có phiên đã đóng', 'Mở một bài nghiên cứu, bôi đen đoạn cần hỏi và chọn “Trích dẫn & phản biện”.', `<a class="btn btn-primary" href="${F.url('reader/index.html')}">Đọc bài nghiên cứu</a>`)}</div>
        <div class="page mt-16"><div class="note">${I('lock')}<span>Phiên 1:1 riêng tư giữa bạn và chuyên gia. Mỗi phiên có nút <b>Báo cáo vi phạm</b> và <b>Chặn</b> theo chính sách cộng đồng.</span></div></div>`;
      $$('[data-f]').forEach((b) => (b.onclick = () => { f = b.dataset.f; draw(); }));
    };
    draw();
  };

  /* ================= R13 · Phiên trao đổi 1:1 ================= */
  pages.inquiry = () => {
    const me = F.me(); const q = F.inquiry(F.param('id'));
    if (!me) { const v = F.shell({ bar: 'back', back: 'reader/inquiries.html', title: 'Phản biện' }); v.innerHTML = F.gate('chat', 'Đăng nhập để xem phiên trao đổi', 'Phiên phản biện 1:1 chỉ hiển thị với bạn và chuyên gia.'); return; }
    if (!q || q.reader !== me.id) { const v = F.shell({ bar: 'back', back: 'reader/inquiries.html', title: 'Phản biện' }); v.innerHTML = F.empty('chat', 'Không tìm thấy phiên', 'Phiên không tồn tại hoặc không thuộc tài khoản của bạn.'); return; }
    const nid = F.param('n'); if (nid) { const n = F.db().notifications.find((x) => x.id === nid); if (n) n.read = true; }
    q.readerUnread = false; F.save();
    const e = F.expert(q.expert); const r = F.report(q.r);
    const blocked = () => me.blocked.includes(e.id);
    const v = F.shell({ side: 'chat', bar: 'back', back: 'reader/inquiries.html', notab: true, title: '', right: `<button class="icon-btn" id="more" aria-label="Tùy chọn">${I('more')}</button>` });
    $('#abTitle').innerHTML = `<a class="row" style="justify-content:center;gap:8px" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'sm')}<span class="ellipsis" style="font-size:16px">${F.esc(e.name)}</span>${F.vb(e)}</a>`;
    document.title = 'Phản biện · ' + e.name + ' · FBV';
    const draw = () => {
      const closed = ['closed', 'reported'].includes(q.status) || blocked();
      document.body.style.setProperty('--dock', closed ? '56px' : '60px');
      let lastDay = '';
      v.innerHTML = `<div class="thread-quote"><a class="quote-card" href="${F.url('reader/report.html?id=' + r.id)}" style="display:block">“${F.esc(q.quote)}”<small>${F.esc(r.title)}</small></a><div class="row between mt-8 small faint"><span>${F.iStatusBadge(q.status)}</span><span>Mở ${F.date(q.createdAt)}${['new', 'assigned', 'in_progress'].includes(q.status) ? ' · phản hồi trong ' + F.db().config.slaHours + ' giờ' : ''}</span></div></div>
        <div class="thread">${q.messages.map((m) => { const d = F.date(m.at); const sep = d !== lastDay ? `<div class="day-sep">${d}</div>` : ''; lastDay = d; const mine = m.by === me.id; const hid = m.x.startsWith('[Nội dung đã bị ẩn');
          return sep + `<div class="msg ${mine ? 'me' : 'them'}">${mine ? '' : F.avatar(e, 'sm')}<div><div class="bub ${hid ? 'hid' : ''}">${F.esc(m.x)}</div><div class="tm">${new Date(m.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div></div></div>`; }).join('')}</div>
        ${closed ? `<div class="composer-closed">${blocked() ? 'Bạn đã chặn chuyên gia này. Bỏ chặn trong Cài đặt → Quyền riêng tư.' : q.status === 'reported' ? 'Phiên đang được FBV xem xét do có báo cáo vi phạm.' : 'Phiên đã đóng. Bạn có thể mở phiên mới từ bài nghiên cứu.'}</div>`
          : `<div class="composer"><div class="inner"><textarea id="tx" rows="1" placeholder="Viết phản hồi học thuật…" maxlength="1500" aria-label="Nội dung"></textarea><button class="send" id="snd" disabled aria-label="Gửi">${I('send')}</button></div></div>`}`;
      window.scrollTo(0, document.body.scrollHeight);
      const tx = $('#tx'); if (!tx) return;
      tx.addEventListener('input', () => { tx.style.height = 'auto'; tx.style.height = Math.min(140, tx.scrollHeight) + 'px'; $('#snd').disabled = tx.value.trim().length < 2; });
      $('#snd').onclick = () => { const x = tx.value.trim(); if (x.length < 2) return; q.messages.push({ by: me.id, at: new Date().toISOString(), x }); if (q.status === 'answered') q.status = 'in_progress'; q.expertUnread = true; F.save(); draw(); F.toast('Đã gửi tới ' + e.name); };
    };
    draw();
    $('#more').onclick = () => F.menu([
      { icon: 'file', label: 'Xem bài nghiên cứu gốc', onClick: () => F.go('reader/report.html?id=' + r.id + (q.block != null ? '#p' + q.block : '')) },
      ...(['closed', 'reported'].includes(q.status) ? [] : [{ icon: 'checkCircle', label: 'Đóng phiên (đã được giải đáp)', onClick: () => { q.status = 'closed'; F.save(); draw(); F.toast('Đã đóng phiên. Cảm ơn bạn!'); } }]),
      { icon: 'flag', label: 'Báo cáo vi phạm', danger: true, onClick: () => reportSheet(q, e, draw) },
      { icon: 'ban', label: blocked() ? 'Bỏ chặn chuyên gia' : 'Chặn chuyên gia', danger: true, onClick: () => { if (blocked()) { me.blocked = me.blocked.filter((x) => x !== e.id); F.save(); draw(); F.toast('Đã bỏ chặn'); } else F.confirm('Chặn ' + e.name + '?', 'Bạn sẽ không nhận tin nhắn từ chuyên gia này và không thể gửi phản biện mới tới họ. Có thể bỏ chặn trong Cài đặt.', 'Chặn', 'btn-danger', () => { me.blocked.push(e.id); F.save(); draw(); F.toast('Đã chặn chuyên gia', 'info'); }); } }
    ], 'Phiên phản biện');
  };
  const reportSheet = (q, e, after) => F.modal({ title: 'Báo cáo vi phạm', body: `<div class="stack"><p class="muted small">Báo cáo được gửi tới đội ngũ kiểm duyệt FBV và xử lý trong 24 giờ. ${F.esc(e.name)} sẽ không biết ai đã bài nghiên cứu.</p><div class="group">${['Ngôn từ xúc phạm / quấy rối', 'Spam hoặc quảng cáo', 'Thông tin sai lệch có chủ đích', 'Khuyến nghị mua/bán trái quy định', 'Khác'].map((x, i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${x}</span><input type="radio" name="rr" value="${x}" ${i ? '' : 'checked'}></label>`).join('')}</div><div class="field"><label for="rd">Mô tả thêm (không bắt buộc)</label><textarea class="textarea" id="rd" style="min-height:80px"></textarea></div><label class="checkbox"><input type="checkbox" id="rb">Chặn chuyên gia này</label></div>`,
    actions: [{ label: 'Hủy' }, { label: 'Gửi báo cáo', cls: 'btn-danger', onClick: (c, el) => { const me = F.me(); F.db().moderation.unshift({ id: F.uid('m'), type: 'inquiry', ref: q.id, reporter: me.id, target: e.id, reason: $('input[name=rr]:checked', el).value, detail: $('#rd', el).value || '—', status: 'open', createdAt: new Date().toISOString() }); if ($('#rb', el).checked && !me.blocked.includes(e.id)) me.blocked.push(e.id); F.save(); F.toast('Đã gửi báo cáo. Cảm ơn bạn!'); after && after(); } }] });

  /* ================= L01–L03 · Pháp lý ================= */
  const legal = (title, upd, secs) => { const v = F.shell({ bar: 'back', back: 'reader/settings.html', title: '' }); v.innerHTML = `<h1 class="large-title serif">${title}</h1><div class="legal"><p class="upd">Cập nhật ${upd} · Bản prototype</p>${secs.map((s) => `<h2>${s[0]}</h2>${s[1]}`).join('')}<div class="mt-24">${F.footLinks()}</div></div>`; document.title = title + ' · FBV'; };
  pages.terms = () => legal('Điều khoản sử dụng (EULA)', '01/09/2026', [
    ['1. Phạm vi dịch vụ', '<p>FBV cung cấp bài nghiên cứu kinh tế – tài chính, dữ liệu thị trường có độ trễ và không gian trao đổi học thuật 1:1 giữa độc giả và chuyên gia (“Dịch vụ”).</p>'],
    ['2. Tài khoản', '<p>Bạn có thể dùng Dịch vụ ở chế độ Khách hoặc đăng nhập bằng Email + OTP, Sign in with Apple, Google. Bạn chịu trách nhiệm bảo mật thiết bị và email của mình.</p>'],
    ['3. Nội dung do người dùng tạo', '<ul><li>Không đăng nội dung xúc phạm, quấy rối, spam, quảng cáo hoặc lôi kéo giao dịch;</li><li>FBV không dung thứ nội dung phản cảm hoặc hành vi lạm dụng: nội dung vi phạm bị gỡ và tài khoản vi phạm bị khóa trong vòng 24 giờ kể từ khi nhận bài nghiên cứu;</li><li>Mỗi phiên phản biện có chức năng Báo cáo vi phạm và Chặn người dùng.</li></ul>'],
    ['4. Sở hữu trí tuệ', '<p>Bài nghiên cứu, dữ liệu và thiết kế thuộc quyền sở hữu của FBV và tác giả. Không sao chép, phân phối lại cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.</p>'],
    ['5. Thuê bao (Phase 2)', '<p>Gói hội viên được thanh toán qua Apple In-App Purchase hoặc Google Play Billing, tự động gia hạn trừ khi hủy ít nhất 24 giờ trước kỳ gia hạn. Quản lý và hủy trong cài đặt tài khoản cửa hàng; dùng “Khôi phục giao dịch” khi đổi thiết bị.</p>'],
    ['6. Chấm dứt', '<p>Bạn có thể xóa tài khoản bất kỳ lúc nào trong ứng dụng (Cài đặt → Tài khoản → Xóa tài khoản).</p>']]);
  pages.privacy = () => legal('Chính sách bảo mật', '01/09/2026', [
    ['1. Dữ liệu thu thập', '<ul><li>Thông tin tài khoản: email, họ tên, lĩnh vực quan tâm;</li><li>Dữ liệu sử dụng: bài nghiên cứu đã đọc, đã lưu, nội dung phản biện;</li><li>Dữ liệu kỹ thuật: loại thiết bị, token thông báo.</li></ul>'],
    ['2. Mục đích', '<p>Cung cấp và cá nhân hóa Dịch vụ, gửi thông báo, kiểm duyệt nội dung vi phạm và cải thiện sản phẩm. FBV <b>không bán</b> dữ liệu cá nhân.</p>'],
    ['3. Xử lý bởi AI', '<p>Nội dung bài nghiên cứu (không phải dữ liệu cá nhân) được Google Vertex AI xử lý trên máy chủ tại thời điểm xuất bản để gợi ý chỉ số liên quan.</p>'],
    ['4. Quyền của bạn', '<p>Truy cập, chỉnh sửa, tải xuống, xóa dữ liệu và <b>xóa tài khoản trực tiếp trong ứng dụng</b>.</p>'],
    ['5. Lưu trữ & bảo mật', '<p>Dữ liệu được mã hóa khi truyền và lưu trữ trên Google Cloud. Dữ liệu của tài khoản đã xóa được loại bỏ trong vòng 30 ngày, trừ khi pháp luật yêu cầu lưu giữ.</p>']]);
  pages.disclaimer = () => legal('Miễn trừ trách nhiệm đầu tư', '01/09/2026', [
    ['Không phải khuyến nghị đầu tư', '<p>Bài nghiên cứu, phân tích, dữ liệu và trao đổi trên FBV phục vụ mục đích nghiên cứu, học thuật và thông tin; không cấu thành lời mời, chào mua, khuyến nghị mua, bán hoặc nắm giữ bất kỳ tài sản tài chính nào.</p>'],
    ['Dữ liệu thị trường', '<p>Dữ liệu chứng khoán có độ trễ tối thiểu 15 phút; dữ liệu vĩ mô cập nhật theo kỳ công bố của cơ quan có thẩm quyền. FBV không bảo đảm tính đầy đủ, chính xác tuyệt đối của dữ liệu bên thứ ba.</p>'],
    ['Quan điểm của tác giả', '<p>Quan điểm thuộc về tác giả tại thời điểm công bố và có thể thay đổi mà không cần thông báo. Người đọc tự chịu trách nhiệm với quyết định của mình.</p>']]);

  /* ================= PHASE 2 ================= */
  const PLANS = { monthly: { name: 'Tháng', price: 199000, per: '/tháng', note: 'Linh hoạt, hủy bất kỳ lúc nào' }, quarterly: { name: 'Quý', price: 549000, per: '/quý', note: 'Tiết kiệm 8%' }, yearly: { name: 'Năm', price: 1990000, per: '/năm', note: 'Tiết kiệm 17% · Phổ biến nhất', best: true }, single: { name: 'Mở khóa 1 bài nghiên cứu', price: 79000, per: '/bài nghiên cứu', note: 'Sở hữu vĩnh viễn một bài nghiên cứu đặc biệt' } };
  F.PLANS = PLANS;
  const p2Note = () => (F.session().phase2 ? '' : `<div class="note warn mb-16">${I('alert')}<span class="grow">Màn hình <b>Phase 2</b> (mô phỏng). Bật “Mô phỏng Phase 2” trên nút Demo để thấy Paywall trên bài nghiên cứu Premium.</span><button class="btn btn-gray btn-xs" id="p2on">Bật</button></div>`);
  const bindP2 = () => { const b = $('#p2on'); if (b) b.onclick = () => { F.session().phase2 = true; F.save(); location.reload(); }; };
  const restore = () => { const m = F.modal({ title: 'Khôi phục giao dịch', dismissable: false, body: `<div class="empty" style="padding:16px 0"><div class="spinner"></div><p class="mt-12">Đang kiểm tra giao dịch với App Store / Google Play…</p></div>` }); setTimeout(() => { m.close(); F.toast(F.hasSub() ? 'Gói Premium của bạn đang hoạt động' : 'Không tìm thấy giao dịch trước đó cho tài khoản này', 'info'); }, 1200); };
  F.restorePurchases = restore;
  const PERKS = [['unlock', 'Đọc toàn văn mọi bài nghiên cứu', 'Bảng số liệu, infographic và bản PDF chuyên sâu'], ['chat', 'Phản biện 1:1 không giới hạn', 'Không giới hạn số phiên trao đổi với chuyên gia'], ['video', 'Buổi trao đổi kín định kỳ', 'Gặp chuyên gia FBV trực tuyến hằng tháng'], ['download', 'Tải PDF đọc ngoại tuyến', 'Lưu trữ tài liệu dài kỳ trên thiết bị']];

  /* P01 · Gói hội viên */
  pages.pricing = () => {
    const r = F.report(F.param('r'));
    const v = F.shell({ side: 'me', bar: 'close', back: r ? 'reader/report.html?id=' + r.id : 'reader/settings.html', notab: true, title: '' });
    let plan = 'yearly';
    const keys = ['monthly', 'quarterly', 'yearly'].concat(r && r.premium ? ['single'] : []);
    v.innerHTML = `<div class="page" style="padding-bottom:170px">${p2Note()}<div class="auth-hero" style="padding-top:4px">${F.logoFull()}<h1>FBV Premium</h1><p>Toàn bộ nghiên cứu chuyên sâu và quyền tương tác cao cấp cùng chuyên gia đã được FBV thẩm định.</p></div>
      ${F.hasSub() ? `<div class="note ok mb-16">${I('checkCircle')}<span>Bạn đang dùng <b>Premium — ${PLANS[F.session().subscription.plan].name}</b>. <a class="link" href="${F.url('reader/subscription.html')}">Quản lý gói</a></span></div>` : ''}
      <div>${PERKS.map((p) => `<div class="perk"><span class="ic">${I(p[0])}</span><div><b>${p[1]}</b><small>${p[2]}</small></div></div>`).join('')}</div>
      <div class="group-title mt-24">Chọn gói</div><div class="stack" id="pl"></div>
      <p class="hint mt-16">Thanh toán qua Apple In-App Purchase hoặc Google Play Billing. Gói tự động gia hạn trừ khi hủy ít nhất 24 giờ trước kỳ gia hạn. <a class="link" href="${F.url('reader/terms.html')}">Điều khoản</a></p></div>
      <div class="bottom-cta"><div class="inner"><a class="btn btn-primary btn-pill btn-block" id="buy"></a><button class="btn btn-ghost btn-block" id="rst">Khôi phục giao dịch</button></div></div>`;
    bindP2();
    const draw = () => {
      $('#pl').innerHTML = keys.map((k) => { const p = PLANS[k]; return `<label class="plan ${plan === k ? 'on' : ''}"><input type="radio" name="pl" value="${k}" ${plan === k ? 'checked' : ''}><span class="rd"></span><span class="t"><b>${p.name}${p.best ? '<span class="tag accent">Phổ biến</span>' : ''}</b><small>${k === 'single' ? F.esc(r.title) : p.note}</small></span><span class="p num">${F.num(p.price)}đ<small>${p.per}</small></span></label>`; }).join('');
      $$('input[name=pl]').forEach((x) => (x.onchange = () => { plan = x.value; draw(); }));
      const p = PLANS[plan]; const b = $('#buy'); b.textContent = plan === 'single' ? `Mở khóa · ${F.num(p.price)}đ` : `Đăng ký · ${F.num(p.price)}đ${p.per}`; b.href = F.url('reader/checkout.html?plan=' + plan + (r ? '&r=' + r.id : ''));
    };
    draw();
    $('#buy').addEventListener('click', (e) => { if (!F.isMember()) { e.preventDefault(); F.requireAuth('Đăng nhập để đăng ký gói hội viên và đồng bộ quyền lợi trên mọi thiết bị.'); } });
    $('#rst').onclick = restore;
  };

  /* P02 · Thanh toán (mô phỏng IAP) */
  pages.checkout = () => {
    const plan = PLANS[F.param('plan')] ? F.param('plan') : 'yearly'; const p = PLANS[plan]; const r = F.report(F.param('r')); const me = F.me();
    const v = F.shell({ side: 'me', bar: 'close', back: 'reader/pricing.html' + (r ? '?r=' + r.id : ''), notab: true, title: 'Xác nhận thanh toán' });
    if (!me) { v.innerHTML = F.gate('card', 'Đăng nhập để thanh toán', 'Gói hội viên gắn với tài khoản FBV của bạn.'); return; }
    let store = /Android/i.test(navigator.userAgent) ? 'google' : 'apple';
    const renew = new Date(Date.now() + ({ monthly: 30, quarterly: 91, yearly: 365 }[plan] || 0) * 864e5);
    const draw = () => {
      v.innerHTML = `<div class="page stack lg" style="padding-top:8px">${p2Note()}<div class="seg full"><button class="${store === 'apple' ? 'on' : ''}" data-st="apple">App Store</button><button class="${store === 'google' ? 'on' : ''}" data-st="google">Google Play</button></div>
        <div class="iap"><div class="iap-h">${F.logoMark('logo-mark')}<div class="grow"><b>FBV Premium — ${p.name}</b><div class="small muted">FBV Research · ${store === 'apple' ? 'Đăng ký trong ứng dụng' : 'Google Play Billing'}</div></div></div>
          ${plan === 'single' && r ? `<div class="iap-row"><span>Bài nghiên cứu</span><b class="clamp2" style="text-align:right;max-width:60%">${F.esc(r.title)}</b></div>` : ''}
          <div class="iap-row"><span>Giá</span><b class="num">${F.num(p.price)}đ${p.per}</b></div>
          ${plan === 'single' ? '<div class="iap-row"><span>Loại</span><b>Mua một lần</b></div>' : `<div class="iap-row"><span>Gia hạn</span><b>Tự động · ${F.date(renew)}</b></div>`}
          <div class="iap-row" style="border-bottom:0"><span>Tài khoản</span><b>${F.esc(me.email)}</b></div></div>
        <button class="btn ${store === 'apple' ? 'btn-white' : 'btn-primary'} btn-pill btn-block" id="pay">${store === 'apple' ? `${F.appleIcon()}Xác nhận bằng Face ID` : 'Đăng ký với Google Play'}</button>
        <p class="hint center">Đây là màn hình mô phỏng — không có giao dịch thật. ${plan === 'single' ? '' : 'Hủy bất kỳ lúc nào trong cài đặt cửa hàng.'}</p></div>`;
      bindP2();
      $$('[data-st]').forEach((b) => (b.onclick = () => { store = b.dataset.st; draw(); }));
      $('#pay').onclick = () => {
        const m = F.modal({ title: 'Đang xử lý', dismissable: false, body: `<div class="empty" style="padding:16px 0"><div class="spinner"></div><p class="mt-12">Đang xác nhận với ${store === 'apple' ? 'App Store' : 'Google Play'}…</p></div>` });
        setTimeout(() => {
          m.close(); const s = F.session(); s.phase2 = true;
          if (plan === 'single') { s.unlocked = (s.unlocked || []).concat(r ? [r.id] : []); } else s.subscription = { plan, store, since: new Date().toISOString(), renew: renew.toISOString(), autoRenew: true };
          F.save();
          v.innerHTML = `<div class="page"><div class="empty" style="padding-top:48px"><div class="ico" style="width:72px;height:72px;background:var(--accent-soft);color:var(--accent-text)">${I(plan === 'single' ? 'unlock' : 'crown')}</div><h3 class="serif" style="font-size:24px">${plan === 'single' ? 'Đã mở khóa bài nghiên cứu' : 'Chào mừng đến FBV Premium'}</h3><p>${plan === 'single' ? 'Bài nghiên cứu đã được thêm vào tài khoản của bạn vĩnh viễn.' : 'Mọi bài nghiên cứu chuyên sâu, PDF và phản biện 1:1 không giới hạn đã được mở.'}</p><a class="btn btn-primary btn-pill" style="min-width:220px" href="${F.url(r ? 'reader/report.html?id=' + r.id : 'reader/index.html')}">${r ? 'Đọc bài nghiên cứu' : 'Bắt đầu đọc'}</a>${plan === 'single' ? '' : `<a class="btn btn-ghost" href="${F.url('reader/subscription.html')}">Quản lý gói</a>`}</div></div>`;
        }, 1400);
      };
    };
    draw();
  };

  /* P03 · Quản lý gói */
  pages.subscription = () => {
    const me = F.me(); const s = F.session();
    const v = F.shell({ side: 'me', bar: 'back', back: 'reader/settings.html', title: 'Gói hội viên' });
    if (!me) { v.innerHTML = F.gate('card', 'Đăng nhập để quản lý gói', 'Xem gói đang dùng, gia hạn và khôi phục giao dịch.'); return; }
    const sub = s.subscription; const un = (s.unlocked || []).map(F.report).filter(Boolean);
    v.innerHTML = `<div class="page groups" style="padding-top:12px">${p2Note()}
      ${sub ? `<div class="panel" style="padding:18px"><div class="row"><span class="ib" style="width:44px;height:44px;border-radius:12px;background:var(--accent);color:var(--on-accent);display:grid;place-items:center">${I('crown')}</span><div class="grow"><b style="font-size:17px">FBV Premium — ${PLANS[sub.plan].name}</b><div class="small muted">${sub.store === 'apple' ? 'App Store' : 'Google Play'} · ${F.num(PLANS[sub.plan].price)}đ${PLANS[sub.plan].per}</div></div></div>
          <div class="stat-grid mt-16" style="background:var(--bg-elev-2)"><div><span>Bắt đầu</span><b>${F.date(sub.since)}</b></div><div><span>${sub.autoRenew ? 'Gia hạn' : 'Hết hạn'}</span><b>${F.date(sub.renew)}</b></div></div></div>
        <div class="group"><a class="gi" href="${F.url('reader/pricing.html')}">${I('refresh')}<span class="gl">Đổi gói</span>${I('chevR', 'chev')}</a><button class="gi" id="store">${I('external')}<span class="gl">Quản lý trên ${sub.store === 'apple' ? 'App Store' : 'Google Play'}</span>${I('arrowUR', 'chev')}</button><button class="gi" id="rst">${I('restore')}<span class="gl">Khôi phục giao dịch</span>${I('chevR', 'chev')}</button><a class="gi" href="${F.url('reader/sessions.html')}">${I('video')}<span class="gl">Buổi trao đổi kín</span>${I('chevR', 'chev')}</a></div>
        ${sub.autoRenew ? `<div class="group"><button class="gi center danger" id="cancel"><span class="gl">Hủy gia hạn tự động</span></button></div>` : `<div class="note">${I('info')}<span>Đã tắt gia hạn. Quyền Premium duy trì đến ${F.date(sub.renew)}.</span></div>`}`
        : `<div class="panel center" style="padding:24px 18px"><div class="empty" style="padding:0"><div class="ico">${I('card')}</div><h3>Bạn đang dùng gói Miễn phí</h3><p>Đọc bài nghiên cứu tiêu chuẩn và ${F.db().config.quotaPerMonth} phiên phản biện mỗi 30 ngày.</p><a class="btn btn-primary btn-pill" href="${F.url('reader/pricing.html')}">Xem gói Premium</a></div></div><div class="group"><button class="gi" id="rst">${I('restore')}<span class="gl">Khôi phục giao dịch</span>${I('chevR', 'chev')}</button></div>`}
      ${un.length ? `<div><div class="group-title">Bài nghiên cứu đã mở khóa</div><div class="group">${un.map((r) => `<a class="gi" href="${F.url('reader/report.html?id=' + r.id)}">${I('unlock')}<span class="gl" style="font-weight:500">${F.esc(r.title)}</span>${I('chevR', 'chev')}</a>`).join('')}</div></div>` : ''}</div>`;
    bindP2();
    $('#rst').onclick = restore;
    const st = $('#store'); if (st) st.onclick = () => F.toast('Mô phỏng: mở trang quản lý đăng ký của cửa hàng', 'info');
    const c = $('#cancel'); if (c) c.onclick = () => F.confirm('Hủy gia hạn tự động?', 'Bạn vẫn giữ quyền Premium đến hết kỳ hiện tại (' + F.date(sub.renew) + ').', 'Hủy gia hạn', 'btn-danger', () => { sub.autoRenew = false; F.save(); location.reload(); });
  };

  /* P04 · Buổi trao đổi kín (High-touch) */
  pages.sessions = () => {
    const me = F.me(); const s = F.session();
    const v = F.shell({ side: 'chat', bar: 'back', back: 'reader/inquiries.html', title: '' });
    const D = 864e5; s.rsvp = s.rsvp || [];
    const list = [
      { id: 'ss1', e: 'e1', at: Date.now() + 6 * D, t: 'Chính sách tiền tệ quý IV: kịch bản lãi suất và thanh khoản', seats: 20, taken: 14 },
      { id: 'ss2', e: 'e2', at: Date.now() + 13 * D, t: 'Ngân hàng số sau sandbox: mô hình kinh doanh nào sẽ trụ lại?', seats: 20, taken: 9 },
      { id: 'ss3', e: 'e4', at: Date.now() + 20 * D, t: 'Dòng vốn khối ngoại và nâng hạng thị trường', seats: 25, taken: 21 }
    ];
    const past = [{ e: 'e5', at: Date.now() - 12 * D, t: 'Lạm phát 2026: đọc cấu phần CPI' }, { e: 'e3', at: Date.now() - 40 * D, t: 'Chi phí logistics và biên lợi nhuận doanh nghiệp' }];
    const prem = F.hasSub();
    v.innerHTML = `<div class="page" style="padding-bottom:24px">${p2Note()}<div class="auth-hero" style="padding-top:0"><span class="tag prem">${I('crown', 'i-xs')}Đặc quyền Premium</span><h1 class="mt-12">Buổi trao đổi kín cùng chuyên gia</h1><p>Phiên trực tuyến 60 phút, tối đa 20–25 hội viên, không ghi hình công khai. Đặt câu hỏi trước để chuyên gia chuẩn bị.</p></div>
      ${prem ? '' : `<div class="note accent mb-16">${I('lock')}<span class="grow">Dành cho hội viên Premium. <a class="link" href="${F.url('reader/pricing.html')}">Nâng cấp</a> để đăng ký tham gia.</span></div>`}
      <div class="group-title">Sắp diễn ra</div><div class="stack">${list.map((x) => { const e = F.expert(x.e); const d = new Date(x.at); const on = s.rsvp.includes(x.id);
        return `<div class="session-card"><div class="when"><div class="cal"><span>Th${d.getMonth() + 1}</span><b>${d.getDate()}</b></div><div class="grow"><div class="small muted">${d.toLocaleDateString('vi-VN', { weekday: 'long' })} · 20:00 – 21:00 · Trực tuyến</div><h3 class="mt-4">${F.esc(x.t)}</h3></div></div>
          <div class="row">${F.avatar(e, 'sm')}<span class="small grow"><b>${F.esc(e.name)}</b> ${F.vb(e)}</span><span class="small faint">Còn ${x.seats - x.taken - (on ? 1 : 0)}/${x.seats} chỗ</span></div>
          ${prem ? `<button class="btn ${on ? 'btn-gray' : 'btn-primary'} btn-block" data-rs="${x.id}">${on ? `${I('check')}Đã đăng ký · Hủy` : 'Đăng ký tham gia'}</button>` : `<a class="btn btn-gray btn-block" href="${F.url('reader/pricing.html')}">${I('lock')}Nâng cấp để đăng ký</a>`}</div>`; }).join('')}</div>
      <div class="group-title mt-24">Đã diễn ra</div><div class="group">${past.map((x) => { const e = F.expert(x.e); return `<button class="gi" data-past>${F.avatar(e, 'sm')}<span class="gl">${F.esc(x.t)}<small>${F.esc(e.name)} · ${F.date(new Date(x.at).toISOString())}</small></span>${I('chevR', 'chev')}</button>`; }).join('')}</div></div>`;
    bindP2();
    $$('[data-rs]').forEach((b) => (b.onclick = () => { if (!me) { F.requireAuth(); return; } const id = b.dataset.rs; const i = s.rsvp.indexOf(id); if (i > -1) { s.rsvp.splice(i, 1); F.toast('Đã hủy đăng ký', 'info'); } else { s.rsvp.push(id); F.toast('Đã đăng ký. Liên kết tham gia sẽ gửi qua thông báo trước 1 giờ.'); } F.save(); pages.sessions(); }));
    $$('[data-past]').forEach((b) => (b.onclick = () => F.modal({ title: 'Tóm tắt buổi trao đổi', body: `<p class="muted">${prem ? 'Biên bản tóm tắt nội dung chính, câu hỏi của hội viên và tài liệu tham khảo do chuyên gia chia sẻ (mô phỏng).' : 'Tóm tắt các buổi đã diễn ra dành cho hội viên Premium.'}</p>`, actions: [{ label: 'Đóng', cls: 'btn-primary' }] })));
  };
})();
