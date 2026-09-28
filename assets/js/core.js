/* =========================================================
   FBV v3 Prototype — CORE
   Store (localStorage) · Theme · Utils · Icons · Components · Sheet/Toast · Demo
   ========================================================= */
(function () {
  const FBV = (window.FBV = window.FBV || {});
  const KEY = 'fbv-v3-proto-db';
  window.FBV_SEED.version = 7;

  /* ---------------- Store ---------------- */
  let DB = null;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); if (d && d.version === window.FBV_SEED.version) return d; }
    } catch (e) { /* private mode */ }
    return JSON.parse(JSON.stringify(window.FBV_SEED));
  }
  FBV.db = () => (DB || (DB = load()));
  FBV.save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} };
  FBV.reset = () => { try { localStorage.removeItem(KEY); } catch (e) {} DB = null; };
  FBV.uid = (p) => p + Math.random().toString(36).slice(2, 8);

  /* ---------------- Theme ---------------- */
  FBV.theme = () => { try { return localStorage.getItem('fbv-theme') || 'dark'; } catch (e) { return 'dark'; } };
  FBV.applyTheme = (t) => {
    t = t || FBV.theme();
    const eff = t === 'system' ? (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
    document.documentElement.dataset.theme = eff;
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = eff === 'light' ? '#FFFFFF' : '#001A3A';
  };
  FBV.setTheme = (t) => { try { localStorage.setItem('fbv-theme', t); } catch (e) {} FBV.applyTheme(t); };
  FBV.cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  FBV.applyTheme();

  /* ---------------- Paths ---------------- */
  FBV.root = () => document.body.dataset.root || '';
  FBV.url = (p) => FBV.root() + p;
  FBV.go = (p) => { location.href = FBV.url(p); };
  FBV.param = (k) => new URLSearchParams(location.search).get(k);
  FBV.here = () => { const r = FBV.root(); const parts = location.pathname.split('/'); const n = (r.match(/\.\.\//g) || []).length; return parts.slice(parts.length - 1 - n).join('/') + location.search; };

  /* ---------------- Lookups ---------------- */
  const by = (arr, id) => arr.find((x) => x.id === id);
  FBV.report = (id) => by(FBV.db().reports, id);
  FBV.expert = (id) => by(FBV.db().experts, id);
  FBV.user = (id) => by(FBV.db().users, id);
  FBV.staff = (id) => by(FBV.db().staff, id);
  FBV.ind = (id) => by(FBV.db().indicators, id);
  FBV.inquiry = (id) => by(FBV.db().inquiries, id);
  FBV.person = (id) => FBV.expert(id) || FBV.user(id) || FBV.staff(id) || { id, name: 'Không xác định' };
  FBV.published = () => FBV.db().reports.filter((r) => r.status === 'published').sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  FBV.linksOfReport = (rid, all) => FBV.db().links.filter((l) => l.r === rid && (all || l.s === 'accepted' || l.s === 'manual'));
  FBV.reportsOfInd = (iid) => {
    const ids = FBV.db().links.filter((l) => l.i === iid && (l.s === 'accepted' || l.s === 'manual')).map((l) => l.r);
    return FBV.published().filter((r) => ids.includes(r.id));
  };
  FBV.reportsOf = (eid) => FBV.published().filter((r) => r.author === eid);
  FBV.followers = (eid) => { const base = { e1: 2840, e2: 1960, e3: 1210, e4: 2310, e5: 870, e6: 420 }[eid] || 300; return base + FBV.db().users.filter((u) => (u.follows || []).includes(eid)).length; };
  FBV.inqCount = (rid) => FBV.db().inquiries.filter((q) => q.r === rid).length;

  /* ---------------- Session ---------------- */
  FBV.session = () => FBV.db().session;
  FBV.me = () => {
    const s = FBV.session(); const u = s.uid ? FBV.user(s.uid) : null;
    if (u) { ['bookmarks', 'follows', 'blocked', 'interests', 'history'].forEach((k) => { if (!Array.isArray(u[k])) u[k] = []; }); if (!u.handle) u.handle = u.email.split('@')[0]; if (u.bio == null) u.bio = ''; if (!u.prefs) u.prefs = { answer: true, report: true, follow: true, email: false, digest: true }; }
    return u;
  };
  FBV.isMember = () => !!FBV.me();
  const CMS_ID = { expert: 'e1', reviewer: 's1', editor: 's2', admin: 's3' };
  FBV.ROLE_LABEL = { guest: 'Khách', member: 'Độc giả', expert: 'Chuyên gia', reviewer: 'Thẩm định viên', editor: 'Biên tập / Xuất bản', admin: 'Quản trị' };
  FBV.cmsRole = () => FBV.session().cmsRole || null;
  FBV.cmsMe = () => { const r = FBV.cmsRole(); if (!r) return null; const p = FBV.person(CMS_ID[r]); return Object.assign({}, p, { role: r }); };
  FBV.login = (uid) => { FBV.session().uid = uid; FBV.save(); };
  FBV.logout = () => { FBV.session().uid = null; FBV.save(); };
  FBV.hasSub = () => !!FBV.session().subscription;
  FBV.isLocked = (r) => FBV.session().phase2 && r.premium && !FBV.hasSub() && !(FBV.session().unlocked || []).includes(r.id);

  FBV.can = (action, obj) => {
    const role = FBV.cmsRole(); const me = FBV.cmsMe();
    if (!role) return false;
    const own = obj && obj.author === (me && me.id);
    switch (action) {
      case 'report.create': return ['expert', 'editor', 'admin'].includes(role);
      case 'report.edit': return (role === 'expert' && own && ['draft', 'changes_requested'].includes(obj.status)) || (['editor', 'admin'].includes(role) && obj.status !== 'archived');
      case 'report.submit': return role === 'expert' && own && ['draft', 'changes_requested'].includes(obj.status);
      case 'report.review': return ['reviewer', 'admin'].includes(role) && obj.status === 'in_review';
      case 'report.publish': return ['editor', 'admin'].includes(role) && ['pending_approval', 'scheduled'].includes(obj.status);
      case 'report.archive': return ['editor', 'admin'].includes(role) && obj.status === 'published';
      case 'ai.adjust': return ['editor', 'admin'].includes(role);
      case 'inquiry.reply': return (role === 'expert' && obj && obj.expert === me.id) || role === 'editor';
      case 'inquiry.assign': return ['editor', 'admin'].includes(role);
      case 'inquiry.note': return ['editor', 'admin', 'reviewer'].includes(role);
      case 'moderate': return role === 'admin';
      case 'experts.manage': return role === 'admin';
      case 'indicators.manage': return role === 'admin';
      case 'users.view': return role === 'admin';
      default: return false;
    }
  };

  /* ---------------- Format ---------------- */
  const nf = {};
  FBV.num = (v, d = 0) => { nf[d] = nf[d] || new Intl.NumberFormat('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d }); return nf[d].format(v); };
  FBV.compact = (v) => (v >= 1000 ? FBV.num(v / 1000, v >= 10000 ? 0 : 1) + 'K' : String(v));
  FBV.signed = (v, d = 2) => (v > 0 ? '+' : v < 0 ? '−' : '') + FBV.num(Math.abs(v), d);
  FBV.dir = (v) => (v > 0.0000001 ? 'up' : v < -0.0000001 ? 'down' : 'ref');
  FBV.arrow = (v) => (v > 0.0000001 ? '▲' : v < -0.0000001 ? '▼' : '■');
  FBV.chg = (ind) => { const c = ind.value - ind.prev; const p = ind.prev ? (c / ind.prev) * 100 : 0; return { c, p, d: FBV.dir(c) }; };
  FBV.date = (iso, withTime) => { const d = new Date(iso); const s = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); return withTime ? s + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : s; };
  FBV.dateLong = (iso) => new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
  FBV.ago = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 0) { const h = Math.round(-s / 3600); return h < 24 ? 'sau ' + h + ' giờ' : 'sau ' + Math.round(h / 24) + ' ngày'; }
    if (s < 60) return 'vừa xong'; if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước'; if (s < 86400 * 30) return Math.floor(s / 86400) + ' ngày trước';
    return FBV.date(iso);
  };
  FBV.short = (iso) => { const s = (Date.now() - new Date(iso)) / 1000; if (s < 3600) return Math.max(1, Math.floor(s / 60)) + ' ph'; if (s < 86400) return Math.floor(s / 3600) + ' giờ'; if (s < 86400 * 7) return Math.floor(s / 86400) + ' ngày'; const d = new Date(iso); return d.getDate() + ' Th' + (d.getMonth() + 1); };
  FBV.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  FBV.initials = (name) => { const p = String(name).replace(/^(PGS\.TS\.|TS\.|ThS\.)\s*/, '').trim().split(/\s+/); return (((p[p.length - 2] || '')[0] || '') + ((p[p.length - 1] || '')[0] || '')).toUpperCase(); };
  FBV.fmtVal = (ind, v) => FBV.num(v == null ? ind.value : v, ind.dec) + (ind.unit === '%' || ind.unit.startsWith('%') ? '%' : '');
  FBV.unitLabel = (ind) => (ind.unit === '%' ? '' : ind.unit.startsWith('%') ? ind.unit.replace('%', '').trim() : ind.unit);
  FBV.chgText = (ind) => { const ch = FBV.chg(ind); return ind.group === 'macro' ? FBV.signed(ch.c, ind.dec) + ' đ.%' : FBV.signed(ch.p, 2) + '%'; };
  FBV.STREAM = { fintech: 'Fintech', macro: 'Kinh tế Vĩ mô', micro: 'Kinh tế Vi mô' };
  FBV.STREAM_S = { fintech: 'Fintech', macro: 'Vĩ mô', micro: 'Vi mô' };
  FBV.STATUS = { draft: 'Nháp', in_review: 'Chờ thẩm định', changes_requested: 'Yêu cầu chỉnh sửa', pending_approval: 'Chờ phê duyệt', scheduled: 'Đã lên lịch', published: 'Đã xuất bản', archived: 'Lưu trữ' };
  FBV.ISTATUS = { new: 'Mới', assigned: 'Đã phân công', in_progress: 'Đang trao đổi', answered: 'Đã trả lời', closed: 'Đã đóng', reported: 'Bị báo cáo' };
  FBV.GROUP = { equity: 'Chứng khoán', rate: 'Lãi suất', fx: 'Tỷ giá & Tiền tệ', commodity: 'Hàng hóa', macro: 'Vĩ mô định kỳ' };

  /* ---------------- Icons (outline, 24 grid) ---------------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    read: '<path d="M2 5.5C4.5 4 8 4 12 6c4-2 7.5-2 10-.5V19c-2.5-1.5-6-1.5-10 .5-4-2-7.5-2-10-.5z"/><path d="M12 6v13.5"/>',
    market: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 6-6"/><path d="M16 7h4v4"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12z"/>',
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M1.5 21a7.5 7.5 0 0 1 15 0"/><path d="M16.5 4a4 4 0 0 1 0 8"/><path d="M22.5 21a7.5 7.5 0 0 0-4.5-6.9"/>',
    bookmark: '<path d="M18 21 12 17l-6 4V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5z"/>',
    bookmarkFill: '<path fill="currentColor" d="M18 21 12 17l-6 4V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5z"/>',
    share: '<path d="M12 3v13"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 17v-4h1.5a1.2 1.2 0 0 1 0 2.5H8M13 13v4h1a2 2 0 0 0 0-4zM17.5 13H16v4M16 15h1.3"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 4 3 5-7"/>',
    bars: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    quote: '<path d="M3 21c3 0 7-1 7-8V5H3v7h4c0 4-2 5-4 5zM14 21c3 0 7-1 7-8V5h-7v7h4c0 4-2 5-4 5z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevD: '<path d="m6 9 6 6 6-6"/>',
    arrowL: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowUR: '<path d="M7 17 17 7M8 7h9v9"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1.2"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    power: '<path d="M18.4 6.6a9 9 0 1 1-12.8 0"/><path d="M12 2v10"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    crown: '<path d="m2 18 2-12 5 5 3-7 3 7 5-5 2 12z"/><path d="M4 21h16"/>',
    refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    moreV: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    bold: '<path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/>',
    italic: '<path d="M19 4h-9M14 20H5M15 4 9 20"/>',
    listUl: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
    history: '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>',
    wallet: '<path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h4"/>',
    play: '<path d="m6 3 14 9-14 9z"/>',
    note: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    palette: '<circle cx="12" cy="12" r="10"/><circle cx="7.5" cy="10.5" r="1.2"/><circle cx="11" cy="7" r="1.2"/><circle cx="15.5" cy="8.5" r="1.2"/><path d="M12 22a3 3 0 0 1 0-6h2a4 4 0 0 0 4-4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    feedback: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.4A8.5 8.5 0 1 1 21 12z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
    storage: '<circle cx="12" cy="12" r="10"/><path d="M12 7v7M9 11l3 3 3-3M8 17h8"/>',
    translate: '<path d="M4 5h9M8.5 3v2M11 5c-.7 3.8-3.2 7-6.5 8.5M6 8.5c1 2.2 2.7 4 5 5"/><path d="m13 21 4-10 4 10M14.5 17.5h5"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    oil: '<path d="M12 2.7s6 6.6 6 11.3a6 6 0 0 1-12 0c0-4.7 6-11.3 6-11.3z"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21 8 9l4-6 4 6z"/>'
  };
  FBV.icon = (n, cls) => `<svg class="${cls || 'i'}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
  FBV.verifiedIcon = () => '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1BACCE" d="M12 1.5l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z"/><path d="m8 12 3 3 5-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  FBV.vb = (e) => (e && e.verified ? `<span class="vbadge" title="Verified by FBV">${FBV.verifiedIcon()}</span>` : '');
  FBV.googleIcon = () => '<svg class="gi-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';
  FBV.appleIcon = () => '<svg class="gi-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6 1.3-.1 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.5a10 10 0 0 0 1.4-2.8c-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>';

  /* ---------------- Brand ---------------- */
  FBV.logoMark = (cls = 'logo-mark') => `<img class="${cls}" src="${FBV.url('assets/media/logo-mark.png')}" alt="FBV.ONE" width="32" height="32">`;
  FBV.logoFull = (cls = 'logo-full') => `<div class="${cls}"><img src="${FBV.url('assets/media/logo.png')}" alt="" width="72" height="72"><span class="wm">FBV<span class="one">.ONE</span></span></div>`;
  FBV.brand = (href, sub) => `<a class="logo" href="${href}" aria-label="FBV.ONE">${FBV.logoMark()}<span>FBV<span class="one">.ONE</span>${sub ? `<small>${sub}</small>` : ''}</span></a>`;

  /* ---------------- Cover art (deterministic) ---------------- */
  const PAL = { fintech: ['#1A0840', '#4A0D96', '#B98CFF'], macro: ['#00254F', '#0D6A9C', '#1BACCE'], micro: ['#062A3A', '#0B6E7A', '#5FE0C8'] };
  FBV.cover = (r) => {
    const [a, b, c] = PAL[r.stream] || PAL.macro; const n = r.cover || 1; const id = 'cv' + r.id + Math.random().toString(36).slice(2, 5);
    let seed = n * 9301 + 49297; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let pts = ''; let y = 130 - rnd() * 20;
    for (let x = 0; x <= 320; x += 20) { y = Math.max(40, Math.min(190, y + (rnd() - .48) * 34)); pts += `${x},${y.toFixed(1)} `; }
    const bars = Array.from({ length: 9 }, (_, i) => { const h = 20 + rnd() * 70; return `<rect x="${24 + i * 32}" y="${240 - h}" width="14" height="${h}" rx="3" fill="${c}" opacity="${.14 + rnd() * .16}"/>`; }).join('');
    const circ = `<circle cx="${200 + rnd() * 90}" cy="${40 + rnd() * 50}" r="${34 + rnd() * 30}" fill="#FECB00" opacity=".28"/>`;
    return `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="320" height="240" fill="url(#${id})"/>${circ}${bars}<g stroke="#fff" stroke-opacity=".07">${[60, 110, 160, 210].map((yy) => `<line x1="0" x2="320" y1="${yy}" y2="${yy}"/>`).join('')}</g><polyline points="${pts}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity=".92"/><polyline points="${pts} 320,240 0,240" fill="#fff" opacity=".05"/></svg>`;
  };

  /* ---------------- Avatars & badges ---------------- */
  const AVC = ['#1BACCE', '#6C06C8', '#FE8C10', '#0D86B8', '#D9A400', '#1F9E74', '#C2338A'];
  const hueOf = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return AVC[h % AVC.length]; };
  FBV.avatar = (p, size = '') => {
    if (!p) return `<span class="av ${size}">?</span>`;
    const me = FBV.session().uid && p.id === FBV.session().uid;
    if (me) return `<span class="av me ${size}" aria-label="${FBV.esc(p.name)}"></span>`;
    const c = p.color || hueOf(p.id || p.name);
    return `<span class="av ${size}" style="background:linear-gradient(145deg,${c},${c}B3)">${FBV.esc(FBV.initials(p.name))}</span>`;
  };
  FBV.verifiedTag = (e, text = 'Verified by FBV') => (e && e.verified ? (text ? `<span class="verified-pill">${FBV.vb(e)}${text}</span>` : FBV.vb(e)) : '');
  FBV.streamBadge = (s) => `<span class="tag accent">${FBV.STREAM[s]}</span>`;
  const SC = { draft: '', in_review: 'info', changes_requested: 'warn', pending_approval: 'accent', scheduled: 'info', published: 'ok', archived: '' };
  const IC = { new: 'accent', assigned: 'info', in_progress: 'warn', answered: 'ok', closed: '', reported: 'bad' };
  FBV.statusBadge = (s) => `<span class="tag ${SC[s] || ''}"><span class="d"></span>${FBV.STATUS[s]}</span>`;
  FBV.iStatusBadge = (s) => `<span class="tag ${IC[s] || ''}"><span class="d"></span>${FBV.ISTATUS[s]}</span>`;
  FBV.premiumBadge = () => (FBV.session().phase2 ? `<span class="tag prem">${FBV.icon('crown', 'i-xs')}Premium</span>` : '');
  FBV.empty = (icon, title, text, action) => `<div class="empty"><div class="ico">${FBV.icon(icon)}</div><h3>${title}</h3><p>${text}</p>${action || ''}</div>`;
  FBV.srcNote = (text) => `<div class="delay-note">${FBV.icon('info')}<span>${text}</span></div>`;

  /* ---------------- Toast ---------------- */
  FBV.toast = (msg, type = 'success') => {
    let w = document.querySelector('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); document.body.appendChild(w); }
    const t = document.createElement('div'); t.className = 'toast ' + type;
    t.innerHTML = FBV.icon(type === 'error' ? 'alert' : type === 'info' ? 'info' : 'checkCircle') + `<span>${msg}</span>`;
    w.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2600);
  };

  /* ---------------- Sheet / Modal (bottom sheet trên mobile, hộp thoại trên desktop) ---------------- */
  FBV.modal = ({ title, body, actions = [], size = '', onOpen, dismissable = true, stack = false }) => {
    const bd = document.createElement('div'); bd.className = 'backdrop';
    bd.innerHTML = `<div class="sheet ${size === 'lg' || size === 'wide' ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${FBV.esc(String(title).replace(/<[^>]+>/g, ''))}"><div class="grab"></div><div class="sheet-head"><h3>${title}</h3>${dismissable ? `<button class="icon-btn sm" data-x aria-label="Đóng">${FBV.icon('x')}</button>` : ''}</div><div class="sheet-body">${body}</div>${actions.length ? `<div class="sheet-foot" style="${stack ? 'flex-direction:column-reverse' : ''}">${actions.map((a, i) => `<button class="btn ${a.cls || 'btn-gray'}" data-a="${i}">${a.label}</button>`).join('')}</div>` : ''}</div>`;
    const close = () => { bd.remove(); document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
    const esc = (e) => { if (e.key === 'Escape' && dismissable) close(); };
    document.addEventListener('keydown', esc);
    bd.addEventListener('click', (e) => { if (e.target === bd && dismissable) close(); });
    bd.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    bd.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => { const a = actions[+b.dataset.a]; if (a.onClick) { if (a.onClick(close, bd) !== false) close(); } else close(); }));
    document.body.appendChild(bd); document.body.style.overflow = 'hidden';
    const f = bd.querySelector('input:not([readonly]),textarea'); if (f && window.innerWidth >= 768) setTimeout(() => f.focus(), 60);
    if (onOpen) onOpen(bd, close);
    return { el: bd, close };
  };
  FBV.confirm = (title, text, okLabel, okCls, onOk) => FBV.modal({ title, body: `<p class="muted">${text}</p>`, actions: [{ label: 'Hủy' }, { label: okLabel, cls: okCls || 'btn-primary', onClick: onOk }] });
  FBV.menu = (items, title) => FBV.modal({ title: title || 'Tùy chọn', body: `<div class="menu-list">${items.map((it, i) => `<button data-m="${i}" class="${it.danger ? 'danger' : ''}">${FBV.icon(it.icon)}<span>${it.label}</span></button>`).join('')}</div>`, onOpen: (el, close) => el.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { close(); items[+b.dataset.m].onClick(); })) });

  /* ---------------- Login wall ---------------- */
  FBV.requireAuth = (why) => {
    if (FBV.isMember()) return true;
    FBV.modal({
      title: 'Đăng nhập để tiếp tục',
      body: `<div class="stack"><p class="muted">${why || 'Tính năng này dành cho thành viên FBV.'}</p><div class="note">${FBV.icon('info')}<span>Ở chế độ Khách, bạn vẫn xem được danh mục báo cáo và biểu đồ thị trường mà không cần đăng nhập.</span></div></div>`,
      actions: [{ label: 'Để sau' }, { label: 'Đăng nhập', cls: 'btn-primary', onClick: () => { FBV.go('reader/login.html?next=' + encodeURIComponent(FBV.here())); } }]
    });
    return false;
  };

  /* ---------------- Series generator (deterministic) ---------------- */
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const prng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const cache = {};
  FBV.series = (ind, range) => {
    const k = ind.id + range + ind.value; if (cache[k]) return cache[k];
    if (ind.group === 'macro') return (cache[k] = { labels: ind.series.labels, values: ind.series.values });
    const rnd = prng(hash(k)); const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const equity = ind.group === 'equity'; const now = new Date();
    let labels = [];
    if (range === '1D') {
      if (equity) { for (let m = 9 * 60 + 15; m <= 11 * 60 + 30; m += 5) labels.push(m); for (let m = 13 * 60; m <= 14 * 60 + 45; m += 5) labels.push(m); labels = labels.map((m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); }
      else labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');
    } else {
      const n = range === '1W' ? 5 : range === '1M' ? 22 : 52; const step = range === '1Y' ? 7 : 1; const d = new Date(now); const out = [];
      while (out.length < n) { if (step === 7 || (d.getDay() !== 0 && d.getDay() !== 6)) out.unshift(d.getDate() + '/' + (d.getMonth() + 1) + (range === '1Y' ? '/' + String(d.getFullYear()).slice(2) : '')); d.setDate(d.getDate() - step); }
      if (range === '1W') { labels = []; out.forEach((l) => { ['10:00', '11:00', '13:30', '14:30'].forEach((t) => labels.push(l + ' ' + t)); }); } else labels = out;
    }
    const n = labels.length; const scale = { '1D': .12, '1W': .18, '1M': .32, '1Y': .75 }[range];
    const sd = ind.value * ind.vol * scale;
    const w = [0]; for (let i = 1; i < n; i++) w.push(w[i - 1] + gauss() * sd);
    const start = range === '1D' ? ind.prev : ind.value * (1 + (rnd() - .5) * ind.vol * { '1W': 2, '1M': 5, '1Y': 14 }[range]);
    const values = ind.vol === 0 ? labels.map(() => ind.value) : w.map((x, i) => +(start + x + (i / (n - 1)) * ((ind.value - start) - w[n - 1])).toFixed(Math.max(ind.dec, 2)));
    return (cache[k] = { labels, values });
  };

  /* ---------------- Demo (role switcher) ---------------- */
  FBV.demoBar = (app) => {
    const s = FBV.session();
    const cur = app === 'cms' ? s.cmsRole : s.uid ? 'member' : 'guest';
    document.querySelectorAll('.demo').forEach((d) => d.remove());
    const wrap = document.createElement('div'); wrap.className = 'demo';
    let open = false; try { open = sessionStorage.getItem('fbv-demo-open') === '1'; } catch (e) {}
    wrap.innerHTML = `<div class="demo-panel ${open ? '' : 'hidden'}"><h5>Xem với vai trò</h5>
        <div class="roles">${['guest', 'member', 'expert', 'reviewer', 'editor', 'admin'].map((r) => `<button data-role="${r}" class="${r === cur ? 'on' : ''}">${FBV.ROLE_LABEL[r]}</button>`).join('')}</div>
        <div class="line"><span>Mô phỏng Phase 2 (thuê bao)</span><label class="switch"><input type="checkbox" id="p2" ${s.phase2 ? 'checked' : ''}><span></span></label></div>
        <div class="line"><span>Giao diện sáng</span><label class="switch"><input type="checkbox" id="thm" ${FBV.theme() === 'light' ? 'checked' : ''}><span></span></label></div>
        <div class="foot"><a href="${FBV.url('index.html')}">Danh mục màn hình</a><button id="dReset">Reset demo</button><button id="dClose" aria-label="Đóng">Đóng</button></div></div>
      <button class="demo-btn" aria-expanded="${open}" aria-label="Demo: đổi vai trò"><span class="dt"></span><span class="dl">Demo</span><span class="dr"> · ${FBV.ROLE_LABEL[cur] || 'Chọn vai trò'}</span></button>`;
    document.body.appendChild(wrap);
    const panel = wrap.querySelector('.demo-panel');
    wrap.querySelector('.demo-btn').addEventListener('click', () => { panel.classList.toggle('hidden'); try { sessionStorage.setItem('fbv-demo-open', panel.classList.contains('hidden') ? '0' : '1'); } catch (e) {} });
    wrap.querySelector('#dClose').addEventListener('click', () => { panel.classList.add('hidden'); try { sessionStorage.setItem('fbv-demo-open', '0'); } catch (e) {} });
    wrap.querySelectorAll('[data-role]').forEach((b) => b.addEventListener('click', () => {
      const r = b.dataset.role;
      if (r === 'guest') { s.uid = null; FBV.save(); if (app === 'cms') FBV.go('reader/index.html'); else location.reload(); return; }
      if (r === 'member') { const u = FBV.user('u1'); u.consent = true; u.onboarded = true; s.uid = 'u1'; FBV.save(); if (app === 'cms') FBV.go('reader/index.html'); else location.reload(); return; }
      s.cmsRole = r; FBV.save(); if (app === 'cms') location.reload(); else FBV.go('cms/index.html');
    }));
    wrap.querySelector('#p2').addEventListener('change', (e) => { s.phase2 = e.target.checked; if (!s.phase2) s.subscription = null; FBV.save(); location.reload(); });
    wrap.querySelector('#thm').addEventListener('change', (e) => { FBV.setTheme(e.target.checked ? 'light' : 'dark'); location.reload(); });
    wrap.querySelector('#dReset').addEventListener('click', () => { FBV.reset(); try { sessionStorage.clear(); } catch (e) {} FBV.toast('Đã khôi phục dữ liệu demo'); setTimeout(() => location.reload(), 500); });
  };

  /* ---------------- Boot ---------------- */
  FBV.pages = FBV.pages || {};
  document.addEventListener('DOMContentLoaded', () => {
    FBV.applyTheme();
    const page = document.body.dataset.page; const fn = FBV.pages[page];
    if (FBV.param('p2') === '1' && !FBV.session().phase2) { FBV.session().phase2 = true; FBV.save(); }
    try { if (fn) fn(); } catch (e) { console.error(e); const a = document.getElementById('app') || document.body; a.insertAdjacentHTML('afterbegin', `<div class="note bad" style="margin:16px">${FBV.icon('alert')}<span>Lỗi hiển thị prototype: ${FBV.esc(e.message)}</span></div>`); }
  });
})();
