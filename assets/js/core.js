/* =========================================================
   FBV v2 Prototype — CORE
   Store (localStorage) · Utils · Icons · Layout · Components · Demo bar
   ========================================================= */
(function () {
  const FBV = (window.FBV = window.FBV || {});
  const KEY = 'fbv-v2-proto-db';

  /* ---------------- Store ---------------- */
  let DB = null;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.version === window.FBV_SEED.version) return d;
      }
    } catch (e) { /* private mode */ }
    return JSON.parse(JSON.stringify(window.FBV_SEED));
  }
  FBV.db = () => (DB || (DB = load()));
  FBV.save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} };
  FBV.reset = () => { try { localStorage.removeItem(KEY); } catch (e) {} DB = null; };
  FBV.uid = (p) => p + Math.random().toString(36).slice(2, 8);

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

  /* ---------------- Session ---------------- */
  FBV.session = () => FBV.db().session;
  FBV.me = () => { const s = FBV.session(); return s.uid ? FBV.user(s.uid) : null; };
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
  FBV.num = (v, d = 0) => { const k = d; nf[k] = nf[k] || new Intl.NumberFormat('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d }); return nf[k].format(v); };
  FBV.signed = (v, d = 2) => (v > 0 ? '+' : v < 0 ? '−' : '') + FBV.num(Math.abs(v), d);
  FBV.dir = (v) => (v > 0.0000001 ? 'up' : v < -0.0000001 ? 'down' : 'ref');
  FBV.arrow = (v) => (v > 0.0000001 ? '▲' : v < -0.0000001 ? '▼' : '■');
  FBV.chg = (ind) => { const c = ind.value - ind.prev; const p = ind.prev ? (c / ind.prev) * 100 : 0; return { c, p, d: FBV.dir(c) }; };
  FBV.date = (iso, withTime) => { const d = new Date(iso); const s = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); return withTime ? s + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : s; };
  FBV.ago = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 0) { const h = Math.round(-s / 3600); return h < 24 ? 'sau ' + h + ' giờ' : 'sau ' + Math.round(h / 24) + ' ngày'; }
    if (s < 60) return 'vừa xong'; if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước'; if (s < 86400 * 30) return Math.floor(s / 86400) + ' ngày trước';
    return FBV.date(iso);
  };
  FBV.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  FBV.initials = (name) => { const p = String(name).replace(/^(PGS\.TS\.|TS\.|ThS\.)\s*/, '').trim().split(/\s+/); return (((p[p.length - 2] || '')[0] || '') + ((p[p.length - 1] || '')[0] || '')).toUpperCase(); };
  FBV.fmtVal = (ind, v) => FBV.num(v == null ? ind.value : v, ind.dec) + (ind.unit === '%' || ind.unit.startsWith('%') ? '%' : '');
  FBV.unitLabel = (ind) => (ind.unit === '%' ? '' : ind.unit.startsWith('%') ? ind.unit.replace('%', '').trim() : ind.unit);
  FBV.STREAM = { fintech: 'Fintech', macro: 'Kinh tế Vĩ mô', micro: 'Kinh tế Vi mô' };
  FBV.STATUS = { draft: 'Nháp', in_review: 'Chờ thẩm định', changes_requested: 'Yêu cầu chỉnh sửa', pending_approval: 'Chờ phê duyệt', scheduled: 'Đã lên lịch', published: 'Đã xuất bản', archived: 'Lưu trữ' };
  FBV.ISTATUS = { new: 'Mới', assigned: 'Đã phân công', in_progress: 'Đang trao đổi', answered: 'Đã trả lời', closed: 'Đã đóng', reported: 'Bị báo cáo' };
  FBV.GROUP = { equity: 'Chứng khoán', rate: 'Lãi suất', fx: 'Tỷ giá & Tiền tệ', commodity: 'Hàng hóa', macro: 'Vĩ mô định kỳ' };

  /* ---------------- Icons (stroke 2, 24 grid) ---------------- */
  const P = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0"/><path d="M17 4a4 4 0 0 1 0 8"/><path d="M23 21a8 8 0 0 0-5-7.4"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    bookmarkFill: '<path fill="currentColor" d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
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
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    shieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    crown: '<path d="m2 18 2-12 5 5 3-7 3 7 5-5 2 12z"/><path d="M4 21h16"/>',
    refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
    more: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
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
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    play: '<path d="m5 3 14 9-14 9z"/>',
    note: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>'
  };
  FBV.icon = (n, cls) => `<svg ${cls ? `class="${cls}"` : ''} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
  FBV.verifiedIcon = () => '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M12 1.5l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z"/><path d="m8 12 3 3 5-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  FBV.googleIcon = () => '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';
  FBV.appleIcon = () => '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6 1.3-.1 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.5a10 10 0 0 0 1.4-2.8c-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>';

  FBV.brandMark = () => { const g = 'bmg' + Math.random().toString(36).slice(2, 7); return `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1FB6D6"/><stop offset=".35" stop-color="#16A085"/><stop offset=".7" stop-color="#F5A623"/><stop offset="1" stop-color="#7B2FF7"/></linearGradient></defs><circle cx="20" cy="20" r="18" fill="none" stroke="url(#${g})" stroke-width="3.2"/><path d="M9 26c4-9 8-12 11-12s7 3 11 12" fill="none" stroke="url(#${g})" stroke-width="2.4" stroke-linecap="round"/><path d="M9 14c4 9 8 12 11 12s7-3 11-12" fill="none" stroke="url(#${g})" stroke-width="2.4" stroke-linecap="round" opacity=".55"/><circle cx="20" cy="20" r="5.2" fill="#F5A623"/></svg>` };
  FBV.brand = (href, sub = 'Hệ tri thức') => `<a class="brand" href="${href}">${FBV.brandMark()}<span>FBV<small>${sub}</small></span></a>`;

  /* ---------------- Cover art (deterministic) ---------------- */
  const PAL = { fintech: ['#1E1B4B', '#4338CA', '#818CF8'], macro: ['#0C2A4A', '#0369A1', '#38BDF8'], micro: ['#052E2B', '#047857', '#34D399'] };
  FBV.cover = (r) => {
    const [a, b, c] = PAL[r.stream] || PAL.macro; const n = r.cover || 1; const id = 'cv' + r.id + Math.random().toString(36).slice(2, 5);
    let seed = n * 9301 + 49297; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let pts = ''; let y = 130 - rnd() * 20;
    for (let x = 0; x <= 320; x += 20) { y = Math.max(40, Math.min(200, y + (rnd() - .48) * 34)); pts += `${x},${y.toFixed(1)} `; }
    const bars = Array.from({ length: 9 }, (_, i) => { const h = 20 + rnd() * 70; return `<rect x="${24 + i * 32}" y="${240 - h}" width="14" height="${h}" rx="3" fill="${c}" opacity="${.18 + rnd() * .2}"/>`; }).join('');
    const circ = `<circle cx="${200 + rnd() * 90}" cy="${40 + rnd() * 50}" r="${34 + rnd() * 30}" fill="${c}" opacity=".16"/>`;
    return `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="320" height="240" fill="url(#${id})"/>${circ}${bars}<g stroke="#fff" stroke-opacity=".08">${[60, 110, 160, 210].map((yy) => `<line x1="0" x2="320" y1="${yy}" y2="${yy}"/>`).join('')}</g><polyline points="${pts}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity=".9"/><polyline points="${pts} 320,240 0,240" fill="#fff" opacity=".06"/></svg>`;
  };

  /* ---------------- Toast & Modal ---------------- */
  FBV.toast = (msg, type = 'success') => {
    let w = document.querySelector('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); document.body.appendChild(w); }
    const t = document.createElement('div'); t.className = 'toast ' + type;
    t.innerHTML = FBV.icon(type === 'error' ? 'alert' : type === 'info' ? 'info' : 'checkCircle') + `<span>${msg}</span>`;
    w.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2600);
  };
  FBV.modal = ({ title, body, actions = [], size = '', onOpen, dismissable = true }) => {
    const bd = document.createElement('div'); bd.className = 'modal-backdrop';
    bd.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true" aria-label="${FBV.esc(title)}"><div class="modal-head"><h3>${title}</h3>${dismissable ? `<button class="icon-btn" data-x aria-label="Đóng">${FBV.icon('x')}</button>` : ''}</div><div class="modal-body">${body}</div>${actions.length ? `<div class="modal-foot">${actions.map((a, i) => `<button class="btn ${a.cls || 'btn-secondary'}" data-a="${i}">${a.label}</button>`).join('')}</div>` : ''}</div>`;
    const close = () => { bd.remove(); document.removeEventListener('keydown', esc); };
    const esc = (e) => { if (e.key === 'Escape' && dismissable) close(); };
    document.addEventListener('keydown', esc);
    bd.addEventListener('click', (e) => { if (e.target === bd && dismissable) close(); });
    bd.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    bd.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => { const a = actions[+b.dataset.a]; if (a.onClick) { if (a.onClick(close, bd) !== false) close(); } else close(); }));
    document.body.appendChild(bd);
    const f = bd.querySelector('input,textarea,select'); if (f) setTimeout(() => f.focus(), 50);
    if (onOpen) onOpen(bd, close);
    return { el: bd, close };
  };
  FBV.confirm = (title, text, okLabel, okCls, onOk) => FBV.modal({ title, body: `<p class="sub">${text}</p>`, actions: [{ label: 'Hủy' }, { label: okLabel, cls: okCls || 'btn-primary', onClick: onOk }] });

  /* ---------------- Login wall ---------------- */
  FBV.requireAuth = (why) => {
    if (FBV.isMember()) return true;
    FBV.modal({
      title: 'Đăng nhập để tiếp tục',
      body: `<div class="stack"><div class="row"><div class="avatar md" style="background:var(--primary-50);color:var(--primary)">${FBV.icon('lock')}</div><p class="sub grow">${why || 'Tính năng này dành cho thành viên FBV.'}</p></div><div class="alert info">${FBV.icon('info')}<span>Bạn vẫn có thể đọc báo cáo và xem dữ liệu thị trường ở chế độ Khách mà không cần đăng nhập.</span></div></div>`,
      actions: [{ label: 'Để sau' }, { label: 'Đăng nhập / Đăng ký', cls: 'btn-primary', onClick: () => { FBV.go('reader/login.html?next=' + encodeURIComponent(FBV.here())); } }]
    });
    return false;
  };

  /* ---------------- Components ---------------- */
  FBV.streamBadge = (s) => `<span class="badge stream-${s}">${FBV.STREAM[s]}</span>`;
  FBV.statusBadge = (s) => `<span class="badge s-${s}"><span class="bdot"></span>${FBV.STATUS[s]}</span>`;
  FBV.iStatusBadge = (s) => `<span class="badge i-${s}"><span class="bdot"></span>${FBV.ISTATUS[s]}</span>`;
  FBV.premiumBadge = () => (FBV.session().phase2 ? `<span class="badge premium">${FBV.icon('crown').replace('<svg', '<svg style="width:12px;height:12px"')} Premium</span>` : '');
  FBV.avatar = (p, size = '') => `<span class="avatar ${size}" style="${p.color ? `background:${p.color}1A;color:${p.color}` : ''}">${FBV.esc(FBV.initials(p.name))}</span>`;
  FBV.verifiedTag = (e, text = 'Verified by FBV') => (e && e.verified ? `<span class="verified" title="Chuyên gia đã được FBV thẩm định">${FBV.verifiedIcon()}${text}</span>` : '');
  FBV.expertChip = (e) => `<a class="expert-chip" href="${FBV.url('reader/expert.html?id=' + e.id)}">${FBV.avatar(e, 'sm')}<span><span class="nm">${FBV.esc(e.name)}</span> ${FBV.verifiedTag(e, '')}</span></a>`;

  FBV.reportCard = (r) => {
    const e = FBV.expert(r.author);
    return `<a class="rcard" href="${FBV.url('reader/report.html?id=' + r.id)}">
      <div><div class="row wrap" style="gap:6px">${FBV.streamBadge(r.stream)}${r.premium ? FBV.premiumBadge() : ''}${r.pdf ? `<span class="badge">${FBV.icon('file').replace('<svg', '<svg style="width:12px;height:12px"')} PDF</span>` : ''}</div>
      <h3>${FBV.esc(r.title)}</h3><p>${FBV.esc(r.dek)}</p>
      <div class="meta">${FBV.avatar(e, 'sm')}<span style="color:var(--text-2);font-weight:500">${FBV.esc(e.name)}</span>${e.verified ? FBV.verifiedIcon().replace('<svg', '<svg style="width:15px;height:15px"') : ''}<span class="sep"></span><span>${FBV.ago(r.publishedAt)}</span><span class="sep"></span><span>${r.readTime} phút đọc</span></div></div>
      <div class="cover">${FBV.cover(r)}</div></a>`;
  };

  FBV.indCard = (ind, opts = {}) => {
    const ch = FBV.chg(ind); const isMacro = ind.group === 'macro';
    const spark = isMacro ? FBV.chart.sparkBars(ind.series.values) : FBV.chart.spark(FBV.series(ind, '1D').values, ch.d);
    return `<a class="ind-card ${opts.active ? 'active' : ''}" href="${opts.href || FBV.url('reader/indicator.html?id=' + ind.id)}" ${opts.data ? `data-ind="${ind.id}"` : ''}>
      <span class="name">${FBV.esc(ind.name)}</span>
      <span class="row between"><span class="val num">${FBV.fmtVal(ind)}</span><span class="chg-pill ${ch.d} num">${FBV.arrow(ch.c)} ${isMacro ? FBV.signed(ch.c, ind.dec) + ' đ.%' : FBV.signed(ch.p, 2) + '%'}</span></span>
      <span class="period">${isMacro ? FBV.esc(ind.period) + ' · kỳ trước ' + FBV.num(ind.prev, ind.dec) : FBV.esc(FBV.unitLabel(ind)) + (FBV.unitLabel(ind) ? ' · ' : '') + FBV.signed(ch.c, ind.dec)}</span>
      <div class="spark">${spark}</div></a>`;
  };

  FBV.miniRow = (ind) => {
    const ch = FBV.chg(ind);
    return `<a class="mini-row" href="${FBV.url('reader/indicator.html?id=' + ind.id)}"><span class="n">${FBV.esc(ind.name)}<small>${ind.group === 'macro' ? FBV.esc(ind.period) : FBV.esc(FBV.GROUP[ind.group])}</small></span>${ind.group === 'macro' ? '' : `<span class="sp">${FBV.chart.spark(FBV.series(ind, '1D').values, ch.d)}</span>`}<span class="v num">${FBV.fmtVal(ind)}<small class="${ch.d}">${FBV.arrow(ch.c)} ${ind.group === 'macro' ? FBV.signed(ch.c, ind.dec) : FBV.signed(ch.p, 2) + '%'}</small></span></a>`;
  };

  FBV.srcNote = (text) => `<div class="src-note">${FBV.icon('info')}<span>${text}</span></div>`;
  FBV.empty = (icon, title, text, action) => `<div class="empty"><div class="ico">${FBV.icon(icon)}</div><h3>${title}</h3><p>${text}</p>${action || ''}</div>`;

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

  /* ---------------- Layout: Reader ---------------- */
  FBV.readerShell = (active, opts = {}) => {
    const me = FBV.me(); const db = FBV.db();
    const unread = me ? db.notifications.filter((n) => n.user === me.id && !n.read).length : 0;
    const inqUnread = me ? db.inquiries.filter((q) => q.reader === me.id && q.readerUnread).length : 0;
    const nav = [['research', 'reader/index.html', 'Nghiên cứu', 'book'], ['market', 'reader/market.html', 'Thị trường', 'chart'], ['macro', 'reader/macro.html', 'Vĩ mô & Tiền tệ', 'globe'], ['inquiries', 'reader/inquiries.html', 'Phản biện', 'message']];
    const header = document.createElement('header'); header.className = 'topbar';
    header.innerHTML = `<div class="container">${FBV.brand(FBV.url('reader/index.html'))}
      <nav class="nav" aria-label="Điều hướng chính">${nav.map((n) => `<a href="${FBV.url(n[1])}" class="${active === n[0] ? 'active' : ''}">${n[2]}${n[0] === 'inquiries' && inqUnread ? ` <span class="badge i-new" style="height:18px;padding:0 6px">${inqUnread}</span>` : ''}</a>`).join('')}</nav>
      <div class="top-actions">
        <a class="icon-btn" href="${FBV.url('reader/search.html')}" aria-label="Tìm kiếm">${FBV.icon('search')}</a>
        ${me ? `<div class="rel"><button class="icon-btn" id="bellBtn" aria-label="Thông báo">${FBV.icon('bell')}${unread ? `<span class="dot-badge">${unread}</span>` : ''}</button></div>
        <div class="rel"><button class="avatar-btn" id="meBtn" aria-label="Tài khoản">${FBV.avatar(me)}</button></div>`
        : `<a class="btn btn-primary btn-sm" href="${FBV.url('reader/login.html?next=' + encodeURIComponent(FBV.here()))}">Đăng nhập</a>`}
      </div></div>`;
    document.body.prepend(header);
    if (opts.ticker !== false) header.after(FBV.tickerEl());

    // Bottom nav (mobile)
    const bn = document.createElement('nav'); bn.className = 'bottom-nav'; bn.setAttribute('aria-label', 'Điều hướng');
    const acc = me ? ['account', 'reader/account.html', 'Tài khoản', 'user'] : ['account', 'reader/login.html', 'Đăng nhập', 'user'];
    bn.innerHTML = [nav[0], nav[1], nav[3], acc].map((n) => `<a href="${FBV.url(n[1])}" class="${active === n[0] || (n[0] === 'market' && active === 'macro') ? 'active' : ''}">${FBV.icon(n[3])}<span>${n[0] === 'research' ? 'Nghiên cứu' : n[2]}</span></a>`).join('');
    document.body.appendChild(bn);

    // Footer
    const f = document.createElement('footer'); f.className = 'footer';
    f.innerHTML = `<div class="container"><div class="stack" style="gap:8px">${FBV.brand(FBV.url('reader/index.html'))}<p class="fd">Nội dung trên FBV mang tính chất nghiên cứu, học thuật và thông tin, không phải là khuyến nghị đầu tư. Dữ liệu thị trường có độ trễ tối thiểu 15 phút. <b>Toàn bộ số liệu trong prototype là minh họa.</b></p></div>
      <nav><a href="${FBV.url('reader/terms.html')}">Điều khoản sử dụng (EULA)</a><a href="${FBV.url('reader/privacy.html')}">Chính sách bảo mật</a><a href="${FBV.url('reader/disclaimer.html')}">Miễn trừ trách nhiệm</a><a href="${FBV.url('reader/pricing.html')}">Gói hội viên</a><a href="${FBV.url('cms/index.html')}">CMS</a></nav></div>`;
    document.body.appendChild(f);

    // Dropdowns
    const bell = header.querySelector('#bellBtn');
    if (bell) bell.addEventListener('click', (e) => { e.stopPropagation(); FBV.dropdown(bell, FBV.notiDropdown()); });
    const meBtn = header.querySelector('#meBtn');
    if (meBtn) meBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      FBV.dropdown(meBtn, `<div class="dd-head"><b>${FBV.esc(me.name)}</b><div class="xs muted">${FBV.esc(me.email)}</div>${FBV.hasSub() ? `<span class="badge premium mt-8">${FBV.icon('crown').replace('<svg', '<svg style="width:12px;height:12px"')} Premium</span>` : ''}</div><hr>
        <a href="${FBV.url('reader/account.html')}">${FBV.icon('user')}Hồ sơ cá nhân</a><a href="${FBV.url('reader/bookmarks.html')}">${FBV.icon('bookmark')}Bài đã lưu</a><a href="${FBV.url('reader/inquiries.html')}">${FBV.icon('message')}Phản biện của tôi</a><a href="${FBV.url('reader/notifications.html')}">${FBV.icon('bell')}Thông báo</a>${FBV.session().phase2 ? `<a href="${FBV.url('reader/subscription.html')}">${FBV.icon('crown')}Gói của tôi</a>` : ''}<a href="${FBV.url('reader/settings.html')}">${FBV.icon('settings')}Cài đặt & Quyền riêng tư</a><hr>
        <button id="ddLogout">${FBV.icon('logout')}Đăng xuất</button>`);
      document.getElementById('ddLogout').addEventListener('click', () => { FBV.logout(); FBV.toast('Đã đăng xuất'); setTimeout(() => FBV.go('reader/index.html'), 400); });
    });
    FBV.demoBar('reader');
  };

  FBV.notiDropdown = () => {
    const me = FBV.me(); const list = FBV.db().notifications.filter((n) => n.user === me.id).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 4);
    return `<div class="dd-head row between"><b>Thông báo</b><a class="small" href="${FBV.url('reader/notifications.html')}">Xem tất cả</a></div><div style="width:340px;max-width:80vw">${list.length ? list.map(FBV.notiItem).join('') : '<p class="muted small" style="padding:12px">Chưa có thông báo.</p>'}</div>`;
  };
  FBV.notiLink = (n) => (n.type === 'answer' ? FBV.url('reader/inquiry.html?id=' + n.ref + '&n=' + n.id) : n.ref ? FBV.url('reader/report.html?id=' + n.ref + '&n=' + n.id) : FBV.url('reader/notifications.html'));
  FBV.notiItem = (n) => { const ic = { answer: 'message', report: 'file', follow: 'user', system: 'info' }[n.type] || 'bell'; return `<a class="noti ${n.read ? '' : 'unread'}" href="${FBV.notiLink(n)}"><span class="ic">${FBV.icon(ic)}</span><span class="grow"><span class="tx">${FBV.esc(n.text)}</span><span class="tm" style="display:block">${FBV.ago(n.at)}</span></span>${n.read ? '' : '<span class="unread-dot" style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex:none;margin-top:6px"></span>'}</a>`; };

  FBV.dropdown = (anchor, html) => {
    document.querySelectorAll('.dropdown').forEach((d) => d.remove());
    const d = document.createElement('div'); d.className = 'dropdown'; d.innerHTML = html; anchor.parentElement.appendChild(d);
    const off = (e) => { if (!d.contains(e.target)) { d.remove(); document.removeEventListener('click', off); } };
    setTimeout(() => document.addEventListener('click', off), 0);
  };

  FBV.tickerEl = () => {
    const el = document.createElement('div'); el.className = 'ticker';
    const ids = ['VNINDEX', 'VN30', 'HNX', 'UPCOM', 'USDVND', 'DXY', 'GOLD', 'BRENT', 'ON_RATE'];
    el.innerHTML = `<div class="container">${ids.map((id) => { const i = FBV.ind(id); const c = FBV.chg(i); return `<a class="tick" href="${FBV.url('reader/indicator.html?id=' + id)}"><span>${i.name.replace(' (NHTM bán ra)', '').replace('Vàng thế giới ', 'Vàng ').replace('LS liên ngân hàng qua đêm', 'LS qua đêm')}</span><b class="num">${FBV.fmtVal(i)}</b><span class="${c.d} num">${FBV.arrow(c.c)} ${FBV.signed(c.p, 2)}%</span></a>`; }).join('')}<span class="delay">Trễ 15 phút · Dữ liệu minh họa</span></div>`;
    return el;
  };

  /* ---------------- Layout: CMS ---------------- */
  FBV.cmsShell = (active, crumbs) => {
    const me = FBV.cmsMe(); const db = FBV.db(); const role = me.role;
    const cnt = {
      reports: db.reports.filter((r) => (role === 'reviewer' && r.status === 'in_review') || (role === 'editor' && r.status === 'pending_approval') || (role === 'expert' && r.author === me.id && r.status === 'changes_requested') || (role === 'admin' && ['in_review', 'pending_approval'].includes(r.status))).length,
      inquiries: db.inquiries.filter((q) => (role === 'expert' ? q.expert === me.id : true) && ['new', 'assigned', 'in_progress'].includes(q.status)).length,
      moderation: db.moderation.filter((m) => m.status === 'open').length
    };
    const items = [
      ['g', 'Tổng quan'], ['dashboard', 'cms/index.html', 'Dashboard', 'grid'],
      ['g', 'Nội dung'], ['reports', 'cms/reports.html', role === 'expert' ? 'Báo cáo của tôi' : 'Báo cáo', 'file', cnt.reports], ['editor', 'cms/editor.html', 'Soạn báo cáo mới', 'edit', 0, !FBV.can('report.create')],
      ['g', 'Tương tác'], ['inquiries', 'cms/inquiries.html', 'Phản biện 1:1', 'message', cnt.inquiries], ['moderation', 'cms/moderation.html', 'Kiểm duyệt vi phạm', 'flag', cnt.moderation, !['admin', 'editor'].includes(role)],
      ['g', 'Dữ liệu & Hệ thống'], ['experts', 'cms/experts.html', 'Chuyên gia', 'shieldCheck'], ['indicators', 'cms/indicators.html', 'Danh mục chỉ số', 'database'], ['users', 'cms/users.html', 'Người dùng', 'users', 0, role !== 'admin']
    ];
    const side = `<aside class="cms-side">${FBV.brand(FBV.url('cms/index.html'), 'CMS Portal')}${items.map((it) => it[0] === 'g' ? `<div class="grp">${it[1]}</div>` : it[5] ? '' : `<a href="${FBV.url(it[1])}" class="${active === it[0] ? 'active' : ''}">${FBV.icon(it[3])}<span>${it[2]}</span>${it[4] ? `<span class="cnt">${it[4]}</span>` : ''}</a>`).join('')}
      <div class="me">${FBV.avatar(me, 'sm')}<div class="grow"><b>${FBV.esc(me.name)}</b><span>${FBV.ROLE_LABEL[role]}</span></div><a href="${FBV.url('cms/login.html?logout=1')}" title="Đăng xuất" style="color:#8FA3C0">${FBV.icon('logout').replace('<svg', '<svg style="width:18px;height:18px"')}</a></div></aside>`;
    const main = document.getElementById('app');
    const wrap = document.createElement('div'); wrap.className = 'cms';
    wrap.innerHTML = side + `<div class="cms-main"><div class="cms-mobile-note">${FBV.icon('monitor').replace('<svg', '<svg style="width:18px;height:18px;flex:none"')}<span>CMS được tối ưu cho máy tính. Trên điện thoại chỉ nên dùng để xem và trả lời nhanh.</span></div><div class="cms-top"><div class="crumbs">${(crumbs || []).map((c, i, a) => (i < a.length - 1 ? `<a href="${FBV.url(c[1])}">${c[0]}</a><span>/</span>` : `<b>${c[0]}</b>`)).join('')}</div><div class="top-actions"><a class="btn btn-ghost btn-sm hide-m" href="${FBV.url('reader/index.html')}" target="_blank">${FBV.icon('external')}Xem trang độc giả</a><span class="badge" style="background:var(--navy);color:#fff">${FBV.ROLE_LABEL[role]}</span></div></div><div class="cms-content" id="cmsContent"></div></div>`;
    main.replaceWith(wrap); wrap.id = 'app';
    FBV.demoBar('cms');
    return document.getElementById('cmsContent');
  };

  /* ---------------- Demo bar (Role switcher) ---------------- */
  FBV.demoBar = (app) => {
    const s = FBV.session();
    const cur = app === 'cms' ? s.cmsRole : s.uid ? 'member' : 'guest';
    const bar = document.createElement('div'); bar.className = 'demo-bar';
    const open = sessionStorage.getItem('fbv-demo-open') === '1';
    bar.innerHTML = `<button class="demo-toggle" aria-expanded="${open}"><span class="dot"></span><span class="lbl">Demo ·</span> ${FBV.ROLE_LABEL[cur] || 'Chọn vai trò'}</button>
      <div class="demo-panel ${open ? '' : 'hidden'}">
        <h5>Xem với vai trò</h5>
        <div class="roles">${['guest', 'member', 'expert', 'reviewer', 'editor', 'admin'].map((r) => `<button data-role="${r}" class="${r === cur ? 'on' : ''}">${FBV.ROLE_LABEL[r]}</button>`).join('')}</div>
        <div class="line"><span>Mô phỏng Phase 2 (Paywall)</span><label class="switch"><input type="checkbox" id="p2" ${s.phase2 ? 'checked' : ''}><span></span></label></div>
        <div class="foot"><a href="${FBV.url('index.html')}">← Danh mục màn hình</a><button class="lnk" id="dReset">Reset demo</button></div>
      </div>`;
    document.body.appendChild(bar);
    const panel = bar.querySelector('.demo-panel');
    bar.querySelector('.demo-toggle').addEventListener('click', () => { panel.classList.toggle('hidden'); sessionStorage.setItem('fbv-demo-open', panel.classList.contains('hidden') ? '0' : '1'); });
    bar.querySelectorAll('[data-role]').forEach((b) => b.addEventListener('click', () => {
      const r = b.dataset.role;
      if (r === 'guest') { s.uid = null; FBV.save(); if (app === 'cms') FBV.go('reader/index.html'); else location.reload(); return; }
      if (r === 'member') { const u = FBV.user('u1'); u.consent = true; u.onboarded = true; s.uid = 'u1'; FBV.save(); if (app === 'cms') FBV.go('reader/index.html'); else location.reload(); return; }
      s.cmsRole = r; FBV.save(); if (app === 'cms') location.reload(); else FBV.go('cms/index.html');
    }));
    bar.querySelector('#p2').addEventListener('change', (e) => { s.phase2 = e.target.checked; if (!s.phase2) s.subscription = null; FBV.save(); location.reload(); });
    bar.querySelector('#dReset').addEventListener('click', () => { FBV.reset(); sessionStorage.clear(); FBV.toast('Đã khôi phục dữ liệu demo'); setTimeout(() => location.reload(), 500); });
  };

  /* ---------------- Boot ---------------- */
  FBV.pages = FBV.pages || {};
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page; const fn = FBV.pages[page];
    if (FBV.param('p2') === '1' && !FBV.session().phase2) { FBV.session().phase2 = true; FBV.save(); }
    try { if (fn) fn(); } catch (e) { console.error(e); document.getElementById('app').innerHTML = `<div class="container page"><div class="alert danger">${FBV.icon('alert')}<span>Lỗi hiển thị prototype: ${FBV.esc(e.message)}</span></div></div>`; }
  });
})();
