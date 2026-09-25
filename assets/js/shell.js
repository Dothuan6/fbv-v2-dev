/* =========================================================
   FBV v2 — READER APP SHELL (mobile-first)
   Appbar + Tab bar (mobile) · Rail (tablet) · Sidebar (desktop)
   Ghi đè FBV.readerShell của core.js cho các trang Reader.
   ========================================================= */
(function () {
  const F = window.FBV; const I = F.icon;
  const $ = (s, r = document) => r.querySelector(s);

  /* Cấu hình từng trang: tab đang chọn, tiêu đề, nút quay lại, dock */
  const META = {
    home: { tab: 'research', root: true, title: 'Nghiên cứu', brand: true },
    market: { tab: 'market', root: true, title: 'Thị trường' },
    macro: { tab: 'market', root: true, title: 'Thị trường', rail: 'macro' },
    inquiries: { tab: 'inquiries', root: true, title: 'Phản biện' },
    account: { tab: 'me', root: true, title: 'Tôi' },
    search: { tab: 'research', title: 'Tìm kiếm', back: 'reader/index.html', noSearch: true },
    report: { tab: 'research', title: '', back: 'reader/index.html', dock: 'report' },
    reportPdf: { tab: 'research', title: 'Bản PDF', back: 'reader/index.html', noTab: true },
    expert: { tab: 'research', title: 'Chuyên gia', back: 'reader/index.html' },
    indicator: { tab: 'market', title: 'Chỉ số', back: 'reader/market.html' },
    inquiry: { tab: 'inquiries', title: 'Phiên phản biện', back: 'reader/inquiries.html', dock: 'chat' },
    notifications: { tab: 'me', title: 'Thông báo', back: 'reader/account.html', rail: 'notifications' },
    bookmarks: { tab: 'me', title: 'Bài đã lưu', back: 'reader/account.html', rail: 'bookmarks' },
    settings: { tab: 'me', title: 'Cài đặt & Quyền riêng tư', back: 'reader/account.html' },
    deleteAccount: { tab: 'me', title: 'Xóa tài khoản', back: 'reader/settings.html', noTab: true },
    terms: { tab: 'me', title: 'Điều khoản sử dụng', back: 'reader/account.html' },
    privacy: { tab: 'me', title: 'Chính sách bảo mật', back: 'reader/account.html' },
    disclaimer: { tab: 'me', title: 'Miễn trừ trách nhiệm', back: 'reader/account.html' },
    pricing: { tab: 'me', title: 'FBV Premium', back: 'reader/index.html', dock: 'cta' },
    checkout: { tab: 'me', title: 'Thanh toán', back: 'reader/pricing.html', dock: 'cta' },
    subscription: { tab: 'me', title: 'Gói của tôi', back: 'reader/account.html' },
    login: { auth: true, title: '', back: 'reader/index.html' },
    otp: { auth: true, title: 'Xác thực', back: 'reader/login.html' },
    consent: { auth: true, title: 'Điều khoản', back: null, dock: 'cta' },
    onboarding: { auth: true, title: 'Cá nhân hóa', back: null, dock: 'cta' }
  };
  F.PAGE_META = META;

  F.back = (fallback) => {
    try { if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { history.back(); return; } } catch (e) {}
    F.go(fallback || 'reader/index.html');
  };

  F.readerShell = (active, opts = {}) => {
    const page = document.body.dataset.page;
    const m = Object.assign({ tab: active || 'research' }, META[page] || {}, opts);
    const me = F.me(); const db = F.db(); const b = document.body;
    const unread = me ? db.notifications.filter((n) => n.user === me.id && !n.read).length : 0;
    const inqUnread = me ? db.inquiries.filter((q) => q.reader === me.id && q.readerUnread).length : 0;
    b.classList.add('rd');
    if (m.auth) b.classList.add('auth-mode', 'no-rail');
    if (m.dock === 'report') b.classList.add('has-dock', 'report-mode');
    else if (m.dock === 'chat') b.classList.add('has-dock');
    else if (m.dock === 'cta') b.classList.add('has-cta');
    else if (!m.noTab && !m.auth) b.classList.add('has-tabbar');

    /* ----- Rail / sidebar (≥768) ----- */
    const railActive = m.rail || m.tab;
    const ri = (key, href, label, icon, badge) => `<a class="r-item ${railActive === key ? 'active' : ''}" href="${F.url(href)}" title="${label}">${I(icon)}<span>${label}</span>${badge ? `<span class="r-badge">${badge}</span>` : ''}</a>`;
    const rail = document.createElement('aside'); rail.className = 'rail'; rail.setAttribute('aria-label', 'Điều hướng');
    rail.innerHTML = `<a class="r-brand" href="${F.url('reader/index.html')}">${F.brandMark()}<span>FBV<small>Hệ tri thức</small></span></a>
      ${ri('research', 'reader/index.html', 'Nghiên cứu', 'book')}${ri('market', 'reader/market.html', 'Thị trường', 'chart')}${ri('macro', 'reader/macro.html', 'Vĩ mô', 'globe')}${ri('inquiries', 'reader/inquiries.html', 'Phản biện', 'message', inqUnread)}
      <div class="r-sep"></div>${me ? ri('bookmarks', 'reader/bookmarks.html', 'Đã lưu', 'bookmark') + ri('notifications', 'reader/notifications.html', 'Thông báo', 'bell', unread) : ''}${ri('me', 'reader/account.html', me ? 'Tôi' : 'Tài khoản', 'user')}
      <div class="r-foot">${F.session().phase2 && !F.hasSub() ? `<a class="btn btn-soft btn-sm" href="${F.url('reader/pricing.html')}" title="FBV Premium">${I('crown')}<span class="r-label">Nâng cấp Premium</span></a>` : ''}
      ${me ? '' : `<a class="btn btn-primary btn-sm" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}" title="Đăng nhập">${I('user')}<span class="r-label">Đăng nhập</span></a>`}</div>`;

    /* ----- App bar ----- */
    const bar = document.createElement('header'); bar.className = 'appbar';
    const backBtn = m.back !== undefined && !m.root ? (m.back === null ? '' : `<button class="icon-btn ab-back" id="abBack" aria-label="Quay lại">${I('arrowL')}</button>`) : '';
    const left = m.root
      ? (m.brand ? `<a class="ab-brand m-only" href="${F.url('reader/index.html')}">${F.brandMark()}FBV</a><span class="ab-title big d-only">${m.title}</span>` : `<span class="ab-title big">${m.title}</span>`)
      : `${backBtn}<span class="ab-title" id="abTitle">${F.esc(m.title || '')}</span>`;
    const search = m.root ? `<div class="ab-search search-box">${I('search')}<input class="input" id="abSearch" type="search" placeholder="Tìm báo cáo, chủ đề, chỉ số…" aria-label="Tìm kiếm"></div>` : '';
    bar.innerHTML = `${left}${m.root && m.brand ? '<span class="ab-spacer m-only"></span>' : ''}${search}${m.root ? '<span class="ab-spacer d-only"></span>' : ''}
      <div class="ab-actions" id="abActions"></div>
      <div class="ab-actions">${m.root && !m.noSearch && !m.auth ? `<a class="icon-btn ${m.root ? 'lt-desk' : ''}" href="${F.url('reader/search.html')}" aria-label="Tìm kiếm">${I('search')}</a>` : ''}
      ${m.auth ? '' : me ? `<div class="rel ${m.root ? '' : 'd-only'}"><button class="icon-btn" id="bellBtn" aria-label="Thông báo">${I('bell')}${unread ? `<span class="dot-badge">${unread}</span>` : ''}</button></div><div class="rel d-only"><button class="avatar-btn" id="meBtn" aria-label="Tài khoản">${F.avatar(me)}</button></div>`
        : `<a class="btn btn-primary btn-sm login-btn ${m.root ? '' : 'd-only'}" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập</a>`}</div>`;

    /* ----- Tab bar (mobile) ----- */
    const tb = document.createElement('nav'); tb.className = 'tabbar'; tb.setAttribute('aria-label', 'Điều hướng chính');
    const tabs = [['research', 'reader/index.html', 'Nghiên cứu', 'book'], ['market', 'reader/market.html', 'Thị trường', 'chart'], ['inquiries', 'reader/inquiries.html', 'Phản biện', 'message', inqUnread], ['me', 'reader/account.html', 'Tôi', 'user', unread]];
    tb.innerHTML = tabs.map((t) => `<a href="${F.url(t[1])}" class="${m.tab === t[0] ? 'active' : ''}" ${m.tab === t[0] ? 'aria-current="page"' : ''}>${I(t[3])}<span>${t[2]}</span>${t[4] ? `<span class="t-badge">${t[4]}</span>` : ''}</a>`).join('');

    /* ----- Footer (≥768) ----- */
    const f = document.createElement('footer'); f.className = 'footer';
    f.innerHTML = `<div class="container"><div class="row wrap between" style="align-items:flex-start;gap:16px"><p class="fd small muted" style="max-width:620px;line-height:1.6">Nội dung trên FBV mang tính nghiên cứu, học thuật, không phải khuyến nghị đầu tư. Dữ liệu thị trường trễ tối thiểu 15 phút. <b>Toàn bộ số liệu trong prototype là minh họa.</b></p>
      <nav class="row wrap small" style="gap:14px"><a href="${F.url('reader/terms.html')}">Điều khoản (EULA)</a><a href="${F.url('reader/privacy.html')}">Bảo mật</a><a href="${F.url('reader/disclaimer.html')}">Miễn trừ trách nhiệm</a><a href="${F.url('reader/pricing.html')}">Gói hội viên</a><a href="${F.url('cms/index.html')}">CMS</a></nav></div></div>`;

    /* ----- Assemble ----- */
    const main = document.getElementById('app');
    const col = document.createElement('div'); col.className = 'app-col';
    main.parentNode.insertBefore(col, main);
    col.appendChild(bar); col.appendChild(main); if (!m.auth) col.appendChild(f);
    if (!m.auth) document.body.insertBefore(rail, col);
    if (b.classList.contains('has-tabbar')) document.body.appendChild(tb);

    /* ----- Behaviours ----- */
    const bk = $('#abBack'); if (bk) bk.onclick = () => F.back(m.back);
    const s = $('#abSearch'); if (s) s.addEventListener('keydown', (e) => { if (e.key === 'Enter') F.go('reader/search.html?q=' + encodeURIComponent(s.value.trim())); });
    const bell = $('#bellBtn');
    if (bell) bell.addEventListener('click', (e) => { e.stopPropagation(); if (innerWidth < 768) { F.go('reader/notifications.html'); return; } F.dropdown(bell, F.notiDropdown()); });
    const meBtn = $('#meBtn');
    if (meBtn) meBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      F.dropdown(meBtn, `<div class="dd-head"><b>${F.esc(me.name)}</b><div class="xs muted">${F.esc(me.email)}</div>${F.hasSub() ? `<span class="badge premium mt-8">Premium</span>` : ''}</div><hr>
        <a href="${F.url('reader/account.html')}">${I('user')}Trang cá nhân</a><a href="${F.url('reader/bookmarks.html')}">${I('bookmark')}Bài đã lưu</a><a href="${F.url('reader/inquiries.html')}">${I('message')}Phản biện của tôi</a>${F.session().phase2 ? `<a href="${F.url('reader/subscription.html')}">${I('crown')}Gói của tôi</a>` : ''}<a href="${F.url('reader/settings.html')}">${I('settings')}Cài đặt & Quyền riêng tư</a><hr><button id="ddLogout">${I('logout')}Đăng xuất</button>`);
      $('#ddLogout').addEventListener('click', () => { F.logout(); sessionStorage.setItem('fbv-flash', 'Đã đăng xuất'); F.go('reader/index.html'); });
    });
    F.demoBar('reader');
  };

  F.setTitle = (t) => { const el = $('#abTitle'); if (el) el.textContent = t; };
  F.setActions = (html) => { const el = $('#abActions'); if (el) el.innerHTML = html; return el; };
  F.readProgress = () => {
    const bar = document.createElement('div'); bar.className = 'readbar'; document.body.appendChild(bar);
    const upd = () => { const h = document.documentElement; const max = h.scrollHeight - innerHeight; bar.style.width = (max > 0 ? Math.min(100, (scrollY / max) * 100) : 0) + '%'; };
    addEventListener('scroll', upd, { passive: true }); upd();
  };

  /* ---------- Reader components (mobile-first) ---------- */
  const sm = (svg, s = 14) => svg.replace('<svg', `<svg style="width:${s}px;height:${s}px;flex:none"`);
  F.reportRow = (r, opts = {}) => {
    const e = F.expert(r.author);
    return `<a class="rrow" href="${F.url('reader/report.html?id=' + r.id)}"><div style="min-width:0"><div class="rr-top">${F.streamBadge(r.stream)}${r.premium ? F.premiumBadge() : ''}${r.pdf ? `<span class="badge">${sm(I('file'), 12)}PDF</span>` : ''}</div>
      <h3>${F.esc(r.title)}</h3>${opts.dek === false ? '' : `<p class="rr-dek">${F.esc(r.dek)}</p>`}
      <div class="rr-meta"><b>${F.esc(e.short)}</b>${e.verified ? sm(F.verifiedIcon()) : ''}<span>·</span><span>${F.ago(r.publishedAt)}</span><span>·</span><span>${r.readTime} phút</span></div></div>
      <div class="thumb">${F.cover(r)}</div></a>`;
  };
  F.heroCard = (r, dark) => {
    const e = F.expert(r.author);
    return `<a class="hero ${dark ? 'dark' : ''}" href="${F.url('reader/report.html?id=' + r.id)}"><div class="cover">${F.cover(r)}</div><div class="hb"><div class="row wrap" style="gap:6px">${F.streamBadge(r.stream)}${r.premium ? F.premiumBadge() : ''}</div><h3>${F.esc(r.title)}</h3><div class="rr-meta">${F.avatar(e, 'sm')}<b>${F.esc(e.short)}</b>${e.verified ? sm(F.verifiedIcon()) : ''}<span>· ${F.ago(r.publishedAt)}</span></div></div></a>`;
  };
  F.idxChip = (ind) => {
    const c = F.chg(ind); const macro = ind.group === 'macro';
    return `<a class="idx-chip" href="${F.url('reader/indicator.html?id=' + ind.id)}"><span class="n">${F.esc(ind.name.replace(' (NHTM bán ra)', '').replace('Vàng thế giới ', 'Vàng ').replace('LS liên ngân hàng qua đêm', 'LS qua đêm'))}</span><span class="v num">${F.fmtVal(ind)}</span><span class="c num ${c.d}">${F.arrow(c.c)} ${macro ? F.signed(c.c, ind.dec) + ' đ.%' : F.signed(c.p, 2) + '%'}</span>${macro ? '' : `<span class="sp">${F.chart.spark(F.series(ind, '1D').values, c.d)}</span>`}</a>`;
  };
  F.secHead = (title, href, link = 'Xem tất cả') => `<div class="sec-head"><h2>${title}</h2>${href ? `<a href="${F.url(href)}">${link}</a>` : ''}</div>`;
  F.expMini = (e) => `<a class="exp-mini" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'md')}<span class="nm">${F.esc(e.name)} ${e.verified ? sm(F.verifiedIcon(), 13) : ''}</span><span class="tt">${F.esc(e.title)}</span></a>`;
})();
