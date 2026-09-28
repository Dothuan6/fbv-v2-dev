/* =========================================================
   FBV v3 Prototype — APP SHELL (Reader)
   Appbar · Tab bar 5 mục · Sidebar desktop · Component dùng chung
   ========================================================= */
(function () {
  const F = window.FBV; const I = F.icon;
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  F.$ = $; F.$$ = $$;

  const TABS = [
    ['home', 'reader/index.html', 'Trang chủ', 'home'],
    ['library', 'reader/bookmarks.html', 'Thư viện', 'read'],
    ['market', 'reader/market.html', 'Thị trường', 'market'],
    ['chat', 'reader/inquiries.html', 'Phản biện', 'chat'],
    ['activity', 'reader/notifications.html', 'Hoạt động', 'bell']
  ];

  F.back = (fallback) => {
    const ref = document.referrer; const same = ref && ref.indexOf(location.host) > -1 && ref !== location.href;
    if (same && history.length > 1) history.back(); else F.go(fallback || 'reader/index.html');
  };

  const counts = () => {
    const me = F.me(); const db = F.db();
    return {
      chat: me ? db.inquiries.filter((q) => q.reader === me.id && q.readerUnread).length : 0,
      activity: me ? db.notifications.filter((n) => n.user === me.id && !n.read).length : 0
    };
  };

  /* opts: tab, bar ('root'|'back'|'close'|'none'), title, back, right, left, notab, aside, rootTitle */
  F.shell = (opts = {}) => {
    const me = F.me(); const cnt = counts(); const s = F.session();
    document.body.classList.add('rd');
    if (opts.notab) document.body.classList.add('no-tab');
    const sideItems = [
      ['home', 'reader/index.html', 'Trang chủ', 'home'],
      ['search', 'reader/search.html', 'Tìm kiếm', 'search'],
      ['library', 'reader/bookmarks.html', 'Thư viện', 'read'],
      ['market', 'reader/market.html', 'Thị trường', 'market'],
      ['macro', 'reader/macro.html', 'Vĩ mô & Tiền tệ', 'globe'],
      ['chat', 'reader/inquiries.html', 'Phản biện 1:1', 'chat'],
      ['activity', 'reader/notifications.html', 'Hoạt động', 'bell'],
      ['me', me ? 'reader/account.html' : 'reader/login.html', 'Hồ sơ', 'user']
    ];
    const act = opts.side || opts.tab;
    const side = `<nav class="side" aria-label="Điều hướng chính">${F.brand(F.url('reader/index.html'))}
      ${sideItems.map((n) => `<a class="sn ${act === n[0] ? 'on' : ''}" href="${F.url(n[1])}" title="${n[2]}">${I(n[3])}<span>${n[2]}</span>${cnt[n[0]] ? `<span class="dot-badge">${cnt[n[0]]}</span>` : ''}</a>`).join('')}
      <div class="sp"></div>
      ${!me ? `<a class="btn btn-primary cta" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập</a>` : s.phase2 && !F.hasSub() ? `<a class="btn btn-primary cta" href="${F.url('reader/pricing.html')}">${I('crown')}Nâng cấp Premium</a>` : ''}
      ${me ? `<a class="side-me" href="${F.url('reader/settings.html')}" title="Cài đặt">${F.avatar(me, 'sm')}<span class="t"><b>${F.esc(me.name)}</b><span>Cài đặt</span></span></a>` : ''}</nav>`;

    let bar = '';
    const bt = opts.bar || 'root';
    if (bt === 'root') {
      bar = `<header class="appbar" id="ab"><div class="ab-l">${F.brand(F.url('reader/index.html'))}<span class="ab-t left d-only">${F.esc(opts.rootTitle || opts.title || '')}</span></div><div class="ab-t"></div><div class="ab-r">${opts.right || ''}<a class="icon-btn hide-d" href="${F.url('reader/search.html')}" aria-label="Tìm kiếm">${I('search')}</a>${me ? `<a class="av-btn hide-d" href="${F.url('reader/account.html')}" aria-label="Hồ sơ của bạn">${F.avatar(me, 'sm')}</a>` : `<a class="txt-btn acc hide-d" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập</a>`}</div></header>`;
    } else if (bt !== 'none') {
      const left = opts.left != null ? opts.left : bt === 'close' ? `<button class="icon-btn" id="abBack" aria-label="Đóng">${I('x')}</button>` : `<button class="icon-btn" id="abBack" aria-label="Quay lại">${I('chevL')}</button>`;
      bar = `<header class="appbar" id="ab"><div class="ab-l">${left}</div><div class="ab-t" id="abTitle">${opts.title ? F.esc(opts.title) : ''}</div><div class="ab-r" id="abRight">${opts.right || ''}</div></header>`;
    }

    const tabbar = `<nav class="tabbar" aria-label="Thanh điều hướng">${TABS.map((t) => `<a href="${F.url(t[1])}" class="${opts.tab === t[0] ? 'on' : ''}">${I(t[3])}<span>${t[2]}</span>${cnt[t[0]] ? `<span class="dot-badge">${cnt[t[0]]}</span>` : ''}</a>`).join('')}</nav>`;

    const app = document.getElementById('app'); app.className = 'app';
    app.innerHTML = side + `<div class="main"><div class="${opts.aside ? 'wrap2' : ''}"><div class="col">${bar}<div id="view"></div></div>${opts.aside ? `<aside class="aside" id="aside">${opts.aside}</aside>` : ''}</div></div>` + tabbar;
    const back = $('#abBack'); if (back) back.onclick = () => (opts.onBack ? opts.onBack() : F.back(opts.back));
    const ab = $('#ab'); if (ab) { const on = () => ab.classList.toggle('scrolled', window.scrollY > 4); window.addEventListener('scroll', on, { passive: true }); on(); }
    if (opts.title) document.title = opts.title.replace(/<[^>]+>/g, '') + ' · FBV';
    F.demoBar('reader');
    return $('#view');
  };
  F.setTitle = (t) => { const el = $('#abTitle'); if (el) el.textContent = t; };
  F.setRight = (h) => { const el = $('#abRight'); if (el) el.innerHTML = h; return el; };

  /* ---------------- Guest gate ---------------- */
  F.gate = (icon, title, text) => F.empty(icon, title, text, `<a class="btn btn-primary" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập / Đăng ký</a>`);

  /* ---------------- Follow / bookmark / share (delegated) ---------------- */
  F.isFollow = (eid) => { const me = F.me(); return !!me && me.follows.includes(eid); };
  F.isSaved = (rid) => { const me = F.me(); return !!me && me.bookmarks.includes(rid); };
  F.followBtn = (e, cls = 'btn btn-sm') => { const on = F.isFollow(e.id); return `<button class="${cls} ${on ? 'btn-gray' : 'btn-primary'}" data-follow="${e.id}">${on ? 'Đang theo dõi' : 'Theo dõi'}</button>`; };
  F.toggleFollow = (eid) => {
    if (!F.requireAuth('Đăng nhập để theo dõi chuyên gia và nhận thông báo khi có báo cáo mới.')) return null;
    const me = F.me(); const i = me.follows.indexOf(eid); if (i > -1) me.follows.splice(i, 1); else me.follows.push(eid); F.save();
    const on = i < 0; F.toast(on ? 'Đã theo dõi ' + F.expert(eid).name : 'Đã bỏ theo dõi', on ? 'success' : 'info'); return on;
  };
  F.toggleSave = (rid) => {
    if (!F.requireAuth('Đăng nhập để lưu báo cáo và đọc lại trên mọi thiết bị.')) return null;
    const me = F.me(); const i = me.bookmarks.indexOf(rid); if (i > -1) me.bookmarks.splice(i, 1); else me.bookmarks.unshift(rid); F.save();
    const on = i < 0; F.toast(on ? 'Đã lưu vào Thư viện' : 'Đã bỏ lưu', on ? 'success' : 'info'); return on;
  };
  F.shareSheet = (title, url) => F.modal({
    title: 'Chia sẻ báo cáo',
    body: `<div class="stack"><p class="muted small clamp2">${F.esc(title)}</p><div class="row"><input class="input grow" id="shu" value="${F.esc(url)}" readonly aria-label="Liên kết"><button class="btn btn-primary" id="cpy">${I('copy')}Sao chép</button></div>
      <div class="chips">${['Facebook', 'LinkedIn', 'Zalo', 'Email', 'Tin nhắn'].map((n) => `<button class="chip" data-n="${n}">${n}</button>`).join('')}</div>
      <p class="hint">Liên kết mở trang web báo cáo (có ảnh xem trước). Trên điện thoại đã cài app, liên kết mở thẳng trong ứng dụng FBV.</p></div>`,
    onOpen: (el) => { $('#cpy', el).onclick = () => { try { navigator.clipboard.writeText(url); } catch (e) {} F.toast('Đã sao chép liên kết'); }; $$('[data-n]', el).forEach((b) => (b.onclick = () => F.toast('Mô phỏng: chia sẻ qua ' + b.dataset.n, 'info'))); }
  });
  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-follow]');
    if (f) { e.preventDefault(); e.stopPropagation(); const on = F.toggleFollow(f.dataset.follow); if (on === null) return; $$(`[data-follow="${f.dataset.follow}"]`).forEach((b) => { if (b.classList.contains('follow')) { b.textContent = on ? 'Đang theo dõi' : 'Theo dõi'; b.classList.toggle('on', on); } else { b.textContent = on ? 'Đang theo dõi' : 'Theo dõi'; b.classList.toggle('btn-primary', !on); b.classList.toggle('btn-gray', on); } }); return; }
    const b = e.target.closest('[data-bm]');
    if (b) { e.preventDefault(); e.stopPropagation(); const on = F.toggleSave(b.dataset.bm); if (on === null) return; $$(`[data-bm="${b.dataset.bm}"]`).forEach((x) => { x.classList.toggle('on', on); const sv = x.querySelector('svg'); if (sv) sv.outerHTML = I(on ? 'bookmarkFill' : 'bookmark'); x.setAttribute('aria-label', on ? 'Bỏ lưu' : 'Lưu'); }); return; }
    const sh = e.target.closest('[data-share]');
    if (sh) { e.preventDefault(); e.stopPropagation(); const r = F.report(sh.dataset.share); F.shareSheet(r.title, location.origin + location.pathname.replace(/[^/]*$/, '') + (F.root() ? '' : 'reader/') + 'report.html?id=' + r.id); }
  });

  /* ---------------- Cards ---------------- */
  F.post = (r, opts = {}) => {
    const e = F.expert(r.author); const saved = F.isSaved(r.id); const fol = F.isFollow(e.id); const q = F.inqCount(r.id);
    return `<article class="post">
      <a class="post-link" href="${F.url('reader/report.html?id=' + r.id)}" aria-label="${F.esc(r.title)}"></a>
      <div class="post-h"><a href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'md')}</a><div class="who"><a class="nm" href="${F.url('reader/expert.html?id=' + e.id)}"><span class="t">${F.esc(e.name)}</span>${F.vb(e)}</a><div class="mt"><span>${F.short(r.publishedAt)}</span><span>·</span><span class="stream">${F.STREAM_S[r.stream]}</span>${opts.nofollow ? '' : `<span>·</span><button class="follow ${fol ? 'on' : ''}" data-follow="${e.id}">${fol ? 'Đang theo dõi' : 'Theo dõi'}</button>`}</div></div></div>
      <h3 class="post-t">${F.esc(r.title)}</h3>
      <p class="post-d clamp3">${F.esc(r.dek)}</p>
      ${opts.nocover ? '' : `<div class="post-cv">${F.cover(r)}<div class="ov">${r.premium && F.session().phase2 ? `<span class="tag prem">${I('crown', 'i-xs')}Premium</span>` : ''}${r.pdf ? `<span class="tag">${I('pdf', 'i-xs')}PDF</span>` : ''}<span class="tag">${r.readTime} phút đọc</span></div></div>`}
      <div class="post-a"><span title="Lượt đọc">${I('eye')}${F.compact(r.views || 0)}</span><a href="${F.url('reader/report.html?id=' + r.id + '#phan-bien')}" title="Phản biện">${I('chat')}${q}</a><span class="sp"></span><button class="${saved ? 'on' : ''}" data-bm="${r.id}" aria-label="${saved ? 'Bỏ lưu' : 'Lưu'}">${I(saved ? 'bookmarkFill' : 'bookmark')}</button><button data-share="${r.id}" aria-label="Chia sẻ">${I('share')}</button></div>
    </article>`;
  };
  F.postCompact = (r, opts = {}) => {
    const e = F.expert(r.author);
    return `<a class="post compact" href="${F.url('reader/report.html?id=' + r.id)}"><div class="pc-body"><div class="pc-top">${F.avatar(e, 'xs')}<span class="ellipsis">${F.esc(e.name)}</span>${F.vb(e)}</div><h3 class="post-t clamp3">${F.esc(r.title)}</h3><div class="pc-meta"><span class="stream">${F.STREAM_S[r.stream]}</span><span>·</span><span>${opts.date === 'ago' ? F.ago(r.publishedAt) : F.short(r.publishedAt)}</span><span>·</span><span>${r.readTime} phút</span>${r.premium && F.session().phase2 ? `<span class="tag prem">${I('crown', 'i-xs')}Premium</span>` : ''}${r.pdf ? `<span class="tag">PDF</span>` : ''}${opts.extra || ''}</div></div><div class="pc-cv">${F.cover(r)}</div></a>`;
  };
  F.mcard = (ind) => { const ch = F.chg(ind); return `<a class="mcard" href="${F.url('reader/indicator.html?id=' + ind.id)}"><span class="n ellipsis">${F.esc(shortName(ind))}</span><span class="v num">${F.fmtVal(ind)}</span><span class="c num ${ch.d}">${F.arrow(ch.c)} ${F.chgText(ind)}</span><span class="sp">${F.sparkOf(ind)}</span></a>`; };
  const shortName = (ind) => ind.name.replace(' (NHTM bán ra)', '').replace('Vàng thế giới (XAU/USD)', 'Vàng (XAU/USD)').replace('LS liên ngân hàng qua đêm', 'LS qua đêm').replace('Chỉ số ', '');
  F.shortName = shortName;
  F.irow = (ind, opts = {}) => { const ch = F.chg(ind); const macro = ind.group === 'macro'; return `<a class="irow ${opts.nosp ? 'nosp' : ''}" href="${F.url('reader/indicator.html?id=' + ind.id)}"><span class="n">${F.esc(opts.short ? shortName(ind) : ind.name)}<small>${macro ? F.esc(ind.period) : F.esc(ind.freq)}</small></span>${opts.nosp ? '' : `<span class="sp">${F.sparkOf(ind)}</span>`}<span class="v num">${F.fmtVal(ind)}<small class="${ch.d}">${F.arrow(ch.c)} ${F.chgText(ind)}</small></span></a>`; };
  F.erow = (e, opts = {}) => `<a class="erow" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'md')}<div class="t"><b><span class="ellipsis">${F.esc(e.name)}</span>${F.vb(e)}</b><small class="ellipsis">${F.esc(e.title)}</small>${opts.bio ? `<p class="clamp2">${F.esc(e.bio)}</p>` : ''}</div>${opts.nobtn ? '' : F.followBtn(e, 'btn btn-xs')}</a>`;
  F.ecard = (e) => `<a class="ecard" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'lg')}<b>${F.esc(e.name)} ${F.vb(e)}</b><small class="clamp2">${F.esc(e.title)}</small>${F.followBtn(e, 'btn btn-xs')}</a>`;

  /* ---------------- Disclaimer ---------------- */
  F.disclaimer = () => `<div class="disclaimer">${I('info')}<span><b>Tuyên bố miễn trừ trách nhiệm:</b> Nội dung mang tính nghiên cứu, học thuật và thông tin, không phải khuyến nghị mua, bán hay nắm giữ bất kỳ tài sản tài chính nào. Quan điểm thuộc về tác giả tại thời điểm công bố. Dữ liệu thị trường có độ trễ tối thiểu 15 phút. <a class="link" href="${F.url('reader/disclaimer.html')}">Xem đầy đủ</a></span></div>`;
  F.footLinks = () => `<div class="foot-links"><a href="${F.url('reader/terms.html')}">Điều khoản (EULA)</a><a href="${F.url('reader/privacy.html')}">Bảo mật</a><a href="${F.url('reader/disclaimer.html')}">Miễn trừ trách nhiệm</a><a href="${F.url('cms/index.html')}">CMS</a><span>© 2026 FBV · Prototype</span></div>`;
})();
