/* =========================================================
   FBV v2 — HỆ TRI THỨC (Knowledge Base) · Web Reader
   Khám phá · Chủ đề (danh mục + bản đồ) · Trang chủ đề · Tài liệu tri thức
   Khái niệm · Từ điển · Tra cứu · Sổ tay (đánh dấu, ghi chú) · Chuyên gia
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = () => document.getElementById('app');
  const I = F.icon; const sm = (svg, s = 16) => svg.replace('<svg', `<svg style="width:${s}px;height:${s}px;flex:none"`);
  const db = () => F.db();
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  /* ---------- Lookups ---------- */
  F.domain = (id) => db().domains.find((d) => d.id === id);
  F.topic = (id) => db().topics.find((t) => t.id === id);
  F.concept = (id) => db().concepts.find((c) => c.id === id);
  F.LEVEL = { foundation: { n: 1, label: 'Nền tảng', desc: 'Khái niệm, bối cảnh và số liệu cơ bản' }, analysis: { n: 2, label: 'Phân tích', desc: 'Phân rã động lực, so sánh và đánh giá' }, advanced: { n: 3, label: 'Chuyên sâu', desc: 'Mô hình, kịch bản và hàm ý chính sách' } };
  F.docsOfTopic = (tid) => F.published().filter((r) => (r.topics || []).includes(tid)).sort((a, b) => F.LEVEL[a.level].n - F.LEVEL[b.level].n);
  F.topicStats = (t) => ({ docs: F.docsOfTopic(t.id).length, concepts: t.concepts.length, inds: t.indicators.length });
  F.levelBadge = (lv) => `<span class="lv lv-${lv}">${'●'.repeat(F.LEVEL[lv].n)}${'○'.repeat(3 - F.LEVEL[lv].n)} ${F.LEVEL[lv].label}</span>`;
  F.updated = (r) => r.revisedAt || r.publishedAt;
  const reportText = (r) => r.body.map((b) => b.x || b.cap || b.title || '').join(' ');
  const patRe = (p) => new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), p === p.toUpperCase() ? 'u' : 'iu');
  F.conceptsInReport = (r) => { const t = reportText(r) + ' ' + r.title; return db().concepts.filter((c) => (c.patterns || []).some((p) => patRe(p).test(t))); };
  F.reportsOfConcept = (c) => F.published().filter((r) => (c.patterns || []).some((p) => patRe(p).test(reportText(r) + ' ' + r.title)));

  /* ---------- Tự động liên kết thuật ngữ trong văn bản ---------- */
  F.linkTerms = (html, used) => {
    const list = [];
    db().concepts.forEach((c) => (c.patterns || []).forEach((p) => list.push({ c, p })));
    list.sort((a, b) => b.p.length - a.p.length);
    const parts = html.split(/(<[^>]+>)/);
    let inTerm = false;
    return parts.map((seg) => {
      if (seg.startsWith('<')) { if (/^<button[^>]*class="term"/.test(seg)) inTerm = true; if (seg === '</button>') inTerm = false; return seg; }
      if (inTerm || !seg) return seg;
      let out = seg;
      for (const { c, p } of list) {
        if (used.has(c.id)) continue;
        const pieces = out.split(/(<button[^>]*>.*?<\/button>)/);
        let done = false;
        out = pieces.map((pc) => { if (done || pc.startsWith('<button')) return pc; const re = patRe(p); if (re.test(pc)) { done = true; return pc.replace(re, (m) => `<button type="button" class="term" data-c="${c.id}" title="${F.esc(c.short)}">${m}</button>`); } return pc; }).join('');
        if (done) used.add(c.id);
      }
      return out;
    }).join('');
  };

  /* ---------- Components ---------- */
  F.docRow = (r, opts = {}) => {
    const e = F.expert(r.author); const d = F.domain(r.stream);
    return `<a class="doc-row" href="${F.url('reader/report.html?id=' + r.id)}"><span class="doc-ico" style="background:${d.tint};color:${d.color}">${I('note')}</span>
      <span class="doc-main"><span class="doc-kicker">${r.docCode}${opts.noLevel ? '' : ' · ' + F.levelBadge(r.level)}${r.premium && F.session().phase2 ? ' · <span class="badge premium">Premium</span>' : ''}</span>
      <b class="doc-title">${F.esc(r.title)}</b>${opts.claim === false ? '' : `<span class="doc-claim">${F.esc(r.summary[0])}</span>`}
      <span class="doc-meta"><span>${F.esc(e.short)}</span>${e.verified ? sm(F.verifiedIcon(), 13) : ''}<span>· v${r.version}</span><span>· Cập nhật ${F.date(F.updated(r))}</span></span></span>${sm(I('chevR'), 18)}</a>`;
  };
  F.reportRow = (r, opts = {}) => F.docRow(r, opts);
  F.topicCard = (t, opts = {}) => {
    const d = F.domain(t.domain); const s = F.topicStats(t);
    return `<a class="topic-card" href="${F.url('reader/topic.html?id=' + t.id)}" style="--dc:${d.color};--dt:${d.tint}"><span class="tc-ico">${I(t.icon)}</span><span class="tc-body"><span class="tc-dom">${d.short}</span><b>${F.esc(t.name)}</b>${opts.summary ? `<span class="tc-sum">${F.esc(t.summary)}</span>` : ''}<span class="tc-stats">${s.docs} tài liệu · ${s.concepts} khái niệm · ${s.inds} chỉ số</span></span></a>`;
  };
  F.topicChip = (t) => { const d = F.domain(t.domain); return `<a class="t-chip" href="${F.url('reader/topic.html?id=' + t.id)}" style="--dc:${d.color};--dt:${d.tint}">${sm(I(t.icon), 14)}${F.esc(t.name)}</a>`; };
  F.conceptChip = (c) => `<a class="c-chip" href="${F.url('reader/concept.html?id=' + c.id)}">${F.esc(c.term)}</a>`;
  F.conceptRow = (c) => `<a class="c-row" href="${F.url('reader/concept.html?id=' + c.id)}"><span class="c-ico">Aa</span><span class="grow" style="min-width:0"><b>${F.esc(c.term)}</b>${c.aka ? ` <span class="muted small">· ${F.esc(c.aka)}</span>` : ''}<span class="c-def">${F.esc(c.short)}</span></span>${sm(I('chevR'), 18)}</a>`;
  F.statTiles = () => { const D = db(); return `<div class="kb-stats"><a href="${F.url('reader/topics.html')}"><b class="num">${D.topics.length}</b><span>Chủ đề</span></a><a href="${F.url('reader/glossary.html')}"><b class="num">${D.concepts.length}</b><span>Khái niệm</span></a><a href="${F.url('reader/search.html?type=doc')}"><b class="num">${F.published().length}</b><span>Tài liệu thẩm định</span></a><a href="${F.url('reader/market.html')}"><b class="num">${D.indicators.length}</b><span>Chỉ số</span></a></div>`; };
  F.kbIndicatorLinks = (ind) => {
    const cs = db().concepts.filter((c) => (c.indicators || []).includes(ind.id)); const ts = db().topics.filter((t) => t.indicators.includes(ind.id));
    if (!cs.length && !ts.length) return '';
    return `<div class="card"><div class="card-head"><h3>Tri thức liên quan</h3></div>${ts.length ? `<div class="xs muted mb-8">Thuộc chủ đề</div><div class="chips mb-12">${ts.map(F.topicChip).join('')}</div>` : ''}${cs.length ? `<div class="xs muted mb-8">Khái niệm giải thích chỉ số</div><div class="chips">${cs.map(F.conceptChip).join('')}</div>` : ''}</div>`;
  };

  /* Bottom sheet giải thích thuật ngữ */
  F.termSheet = (id) => {
    const c = F.concept(id); if (!c) return;
    const me = F.me(); const saved = me && me.savedConcepts.includes(c.id);
    F.modal({ title: F.esc(c.term), body: `<div class="stack">${c.aka ? `<span class="small muted">${F.esc(c.aka)}</span>` : ''}<div class="def-box">${F.esc(c.short)}</div><p class="sub" style="font-size:14.5px">${F.esc(c.long)}</p>${c.formula ? `<div class="formula">${F.esc(c.formula)}</div>` : ''}${c.topics.length ? `<div class="chips">${c.topics.map((t) => F.topicChip(F.topic(t))).join('')}</div>` : ''}</div>`,
      actions: [{ label: saved ? `${I('check')}Đã lưu` : `${I('bookmark')}Lưu vào Sổ tay`, onClick: () => { if (!F.requireAuth('Đăng nhập để lưu khái niệm vào Sổ tay tri thức.')) return false; const m = F.me(); if (!m.savedConcepts.includes(c.id)) { m.savedConcepts.unshift(c.id); F.save(); F.toast('Đã lưu vào Sổ tay'); } } }, { label: 'Xem đầy đủ', cls: 'btn-primary', onClick: () => F.go('reader/concept.html?id=' + c.id) }] });
  };
  document.addEventListener('click', (e) => { const t = e.target.closest('.term'); if (t) { e.preventDefault(); F.termSheet(t.dataset.c); } });

  /* ---------- Bản đồ tri thức (SVG) ---------- */
  F.kbGraph = (opts = {}) => {
    const W = 1010, H = 660; const D = db(); const pos = {};
    const centers = { macro: [330, 330], fintech: [720, 170], micro: [720, 470] };
    const R = { macro: 185, fintech: 130, micro: 130 };
    const ANG = { macro: [-110, -150, 170, 135, 95, -70], fintech: [-160, -60, -15, 40], micro: [150, 30, 90] };
    D.domains.forEach((d) => { pos[d.id] = centers[d.id]; D.topics.filter((t) => t.domain === d.id).forEach((t, i) => { const deg = (ANG[d.id][i] != null ? ANG[d.id][i] : i * 50); const a = (deg * Math.PI) / 180; pos[t.id] = [centers[d.id][0] + Math.cos(a) * R[d.id], centers[d.id][1] + Math.sin(a) * R[d.id]]; }); });
    const seen = new Set(); let rel = '';
    D.topics.forEach((t) => t.related.forEach((o) => { const k = [t.id, o].sort().join('|'); if (seen.has(k) || !pos[o]) return; seen.add(k); const [x1, y1] = pos[t.id], [x2, y2] = pos[o]; const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12, my = (y1 + y2) / 2 - (x2 - x1) * 0.12; rel += `<path class="g-rel" data-a="${t.id}" data-b="${o}" d="M${x1},${y1} Q${mx},${my} ${x2},${y2}"/>`; }));
    const spokes = D.topics.map((t) => `<line class="g-spoke" x1="${pos[t.domain][0]}" y1="${pos[t.domain][1]}" x2="${pos[t.id][0]}" y2="${pos[t.id][1]}" stroke="${F.domain(t.domain).color}"/>`).join('');
    const doms = D.domains.map((d) => `<g class="g-dom"><circle cx="${pos[d.id][0]}" cy="${pos[d.id][1]}" r="46" fill="${d.tint}" stroke="${d.color}" stroke-width="2"/><text x="${pos[d.id][0]}" y="${pos[d.id][1] + 5}" text-anchor="middle" fill="${d.color}" font-weight="800" font-size="15">${d.short}</text></g>`).join('');
    const tps = D.topics.map((t) => { const [x, y] = pos[t.id]; const d = F.domain(t.domain); const s = F.topicStats(t); const r = 9 + s.docs * 2.2; const left = x < pos[t.domain][0] - 20; const words = t.name.split(' '); const mid = Math.ceil(words.length / 2); const l1 = words.slice(0, mid).join(' '), l2 = words.slice(mid).join(' ');
      return `<a href="${F.url('reader/topic.html?id=' + t.id)}" class="g-topic" data-t="${t.id}"><circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${d.color}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="${Math.max(r - 6, 3)}" fill="${d.color}" opacity=".85"/><text x="${left ? x - r - 8 : x + r + 8}" y="${y - 2}" text-anchor="${left ? 'end' : 'start'}" class="g-lbl">${F.esc(l1)}</text><text x="${left ? x - r - 8 : x + r + 8}" y="${y + 14}" text-anchor="${left ? 'end' : 'start'}" class="g-lbl">${F.esc(l2)}</text></a>`; }).join('');
    return `<svg class="kb-graph ${opts.mini ? 'mini' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bản đồ tri thức: lĩnh vực, chủ đề và liên kết giữa các chủ đề"><g>${rel}</g><g>${spokes}</g>${doms}${tps}</svg>`;
  };
  const bindGraph = (root) => { $$('.g-topic', root).forEach((g) => { const id = g.dataset.t; g.addEventListener('mouseenter', () => { root.classList.add('hl'); $$(`.g-rel[data-a="${id}"],.g-rel[data-b="${id}"]`, root).forEach((p) => p.classList.add('on')); g.classList.add('on'); }); g.addEventListener('mouseleave', () => { root.classList.remove('hl'); $$('.on', root).forEach((p) => p.classList.remove('on')); }); }); };

  /* ================= Khám phá (Home) ================= */
  pages.home = () => {
    F.readerShell('explore');
    const me = F.me(); const D = db();
    const popular = ['c_policy_rate', 'c_nim', 'c_dxy', 'c_cpi', 'c_fdi', 'c_breadth'].map(F.concept);
    const updates = F.published().map((r) => ({ r, at: F.updated(r), kind: r.revisedAt ? 'rev' : 'new' })).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
    const lr = me && me.lastRead && F.report(me.lastRead.r);
    const follow = me ? me.followTopics.map(F.topic).filter(Boolean) : [];
    app().innerHTML = `<div class="page"><div class="home-grid"><div style="min-width:0">
      <section class="kb-hero-home"><span class="kicker">Hệ tri thức FBV</span><h1>Tri thức kinh tế – tài chính đã được thẩm định</h1><p>Tra cứu theo chủ đề, khái niệm và chỉ số — mỗi tài liệu được chuyên gia viết, FBV Review thẩm định và liên kết với dữ liệu.</p>
        <a class="kb-search" href="${F.url('reader/search.html')}">${I('search')}<span>Tra cứu chủ đề, khái niệm, chỉ số…</span></a>
        <div class="chips mt-12">${popular.map((c) => `<a class="c-chip light" href="${F.url('reader/concept.html?id=' + c.id)}">${F.esc(c.term)}</a>`).join('')}</div></section>
      ${F.statTiles()}
      ${lr ? `<section class="sec"><a class="continue" href="${F.url('reader/report.html?id=' + lr.id)}"><span class="doc-ico" style="background:${F.domain(lr.stream).tint};color:${F.domain(lr.stream).color}">${I('book')}</span><span class="grow" style="min-width:0"><span class="xs muted">Tiếp tục đọc · ${lr.docCode}</span><b>${F.esc(lr.title)}</b><span class="prog"><i style="width:${me.lastRead.pct}%"></i></span></span><span class="small muted num">${me.lastRead.pct}%</span></a></section>` : ''}
      ${follow.length ? `<section class="sec">${F.secHead('Chủ đề bạn theo dõi', 'reader/bookmarks.html?t=topics', 'Sổ tay')}<div class="hscroll">${follow.map((t) => F.topicCard(t)).join('')}</div></section>` : ''}
      <section class="sec">${F.secHead('Lĩnh vực tri thức', 'reader/topics.html', 'Tất cả chủ đề')}<div class="dom-list">${D.domains.map((d) => { const ts = D.topics.filter((t) => t.domain === d.id); return `<div class="dom-card" style="--dc:${d.color};--dt:${d.tint}"><a class="dom-head" href="${F.url('reader/topics.html#' + d.id)}"><span class="dom-ico">${I(d.icon)}</span><span class="grow"><b>${d.name}</b><span>${d.desc}</span></span>${sm(I('chevR'), 18)}</a><div class="dom-topics">${ts.map((t) => `<a href="${F.url('reader/topic.html?id=' + t.id)}">${sm(I(t.icon), 15)}<span>${F.esc(t.name)}</span><span class="n">${F.docsOfTopic(t.id).length}</span></a>`).join('')}</div></div>`; }).join('')}</div></section>
      <section class="sec">${F.secHead('Vừa cập nhật trong hệ tri thức')}<div class="list-card">${updates.map((u) => `<a class="upd-row" href="${F.url('reader/report.html?id=' + u.r.id)}"><span class="upd-dot ${u.kind}">${sm(I(u.kind === 'rev' ? 'history' : 'plus'), 14)}</span><span class="grow" style="min-width:0"><span class="xs muted">${u.kind === 'rev' ? 'Cập nhật phiên bản ' + u.r.version : 'Tài liệu mới'} · ${(u.r.topics || []).map((t) => F.topic(t).name).slice(0, 2).join(', ')}</span><b>${F.esc(u.r.title)}</b></span><span class="xs muted" style="flex:none">${F.date(u.at)}</span></a>`).join('')}</div></section>
    </div>
    <aside class="stack-lg kb-aside">
      <a class="card map-card" href="${F.url('reader/topics.html?view=map')}"><div class="card-head"><h3>Bản đồ tri thức</h3><span class="small" style="color:var(--primary)">Mở bản đồ ›</span></div>${F.kbGraph({ mini: true })}<p class="xs muted mt-8">${D.topics.length} chủ đề thuộc ${D.domains.length} lĩnh vực, nối với nhau qua các liên hệ nhân quả.</p></a>
      <div class="card"><div class="card-head"><h3>Chỉ số trọng yếu</h3><a href="${F.url('reader/market.html')}">Dữ liệu</a></div><div class="mini-list">${['VNINDEX', 'ON_RATE', 'USDVND', 'CPI', 'GDP'].map((id) => F.miniRow(F.ind(id))).join('')}</div>${F.srcNote('Trễ 15 phút · Minh họa')}</div>
      <div class="card"><div class="card-head"><h3>Chuyên gia thẩm định</h3></div><div class="stack">${D.experts.filter((e) => e.verified).slice(0, 4).map((e) => `<a class="expert-chip" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e)}<span class="grow"><span class="nm">${F.esc(e.name)}</span><span class="tt" style="display:block">${F.esc(e.title)}</span></span></a>`).join('')}</div></div>
      ${me ? '' : `<div class="cta-card"><h3>Xây sổ tay tri thức của bạn</h3><p>Lưu tài liệu, đánh dấu đoạn quan trọng, theo dõi chủ đề và hỏi trực tiếp tác giả.</p><a class="btn btn-primary btn-block" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Tạo tài khoản miễn phí</a></div>`}
    </aside></div></div>`;
  };

  /* ================= Chủ đề (danh mục + bản đồ) ================= */
  pages.topics = () => {
    F.readerShell('topics');
    const D = db(); let view = F.param('view') === 'map' ? 'map' : 'list';
    const render = () => {
      app().innerHTML = `<div class="page"><p class="sub mb-12" style="max-width:720px">Hệ tri thức được tổ chức theo <b>Lĩnh vực → Chủ đề</b>. Mỗi chủ đề gom các tài liệu theo lộ trình đọc, khái niệm cốt lõi và chỉ số cần theo dõi.</p>
        <nav class="seg-full" style="max-width:420px"><button class="${view === 'list' ? 'active' : ''}" data-v="list">${sm(I('listUl'), 16)} Danh mục</button><button class="${view === 'map' ? 'active' : ''}" data-v="map">${sm(I('share'), 16)} Bản đồ tri thức</button></nav>
        ${view === 'list' ? D.domains.map((d) => { const ts = D.topics.filter((t) => t.domain === d.id); return `<section class="sec" id="${d.id}"><div class="dom-title" style="--dc:${d.color};--dt:${d.tint}"><span class="dom-ico">${I(d.icon)}</span><div><h2>${d.name}</h2><p class="small sub">${d.desc}</p></div></div><div class="topic-grid">${ts.map((t) => F.topicCard(t, { summary: true })).join('')}</div></section>`; }).join('')
          : `<div class="card graph-wrap" id="gw"><div class="graph-scroll">${F.kbGraph()}</div><div class="legend mt-12"><span><i style="background:var(--text-3);border-radius:50%"></i>Nút lớn: lĩnh vực</span><span><i style="background:#fff;border:2px solid var(--text-3);border-radius:50%"></i>Nút nhỏ: chủ đề (to hơn = nhiều tài liệu)</span><span><i style="background:none;border-top:2px dashed var(--text-3);height:0;border-radius:0;width:16px"></i>Chủ đề có liên hệ</span></div><p class="hint mt-8">Chạm vào một chủ đề để mở trang chủ đề. ${innerWidth < 768 ? 'Vuốt ngang để xem toàn bộ bản đồ.' : 'Rê chuột để xem các liên hệ.'}</p></div>`}
        <section class="sec"><a class="card row between" href="${F.url('reader/glossary.html')}" style="color:inherit"><span class="row"><span class="c-ico">Aa</span><span><b>Từ điển thuật ngữ</b><span class="small sub" style="display:block">${D.concepts.length} khái niệm được giải thích, liên kết với chủ đề và chỉ số</span></span></span>${sm(I('chevR'), 18)}</a></section></div>`;
      $$('[data-v]').forEach((b) => (b.onclick = () => { view = b.dataset.v; history.replaceState(null, '', view === 'map' ? '?view=map' : location.pathname); render(); }));
      const gw = $('#gw'); if (gw) bindGraph(gw);
      if (location.hash && view === 'list') { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80); }
    };
    render();
  };

  /* ================= Trang chủ đề ================= */
  pages.topic = () => {
    F.readerShell('topics');
    const t = F.topic(F.param('id') || 't_monetary');
    if (!t) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('layers', 'Không tìm thấy chủ đề', 'Chủ đề không tồn tại hoặc đã được gộp.', `<a class="btn btn-primary" href="${F.url('reader/topics.html')}">Danh mục chủ đề</a>`)}</div></div>`; return; }
    const d = F.domain(t.domain); const me = F.me(); const docs = F.docsOfTopic(t.id); const s = F.topicStats(t);
    const following = me && me.followTopics.includes(t.id);
    const last = docs.length ? docs.map(F.updated).sort().pop() : null;
    F.setTitle(t.name);
    const acts = F.setActions(`<button class="icon-btn" id="shT" aria-label="Chia sẻ">${I('share')}</button>`);
    const levels = ['foundation', 'analysis', 'advanced'].map((lv) => ({ lv, list: docs.filter((r) => r.level === lv) })).filter((x) => x.list.length);
    const nav = [['tong-quan', 'Tổng quan'], ['lo-trinh', 'Lộ trình đọc'], ['khai-niem', 'Khái niệm'], ['chi-so', 'Chỉ số'], ['lien-quan', 'Liên quan']];
    app().innerHTML = `<div class="page"><div class="read-grid"><div style="min-width:0">
      <header class="kb-head" style="--dc:${d.color};--dt:${d.tint}"><a class="kicker" href="${F.url('reader/topics.html#' + d.id)}">${sm(I(d.icon), 15)}${d.name}</a><div class="row" style="gap:12px;align-items:flex-start"><span class="tc-ico big">${I(t.icon)}</span><h1 class="kb-title">${F.esc(t.name)}</h1></div>
        <p class="kb-lead">${F.esc(t.summary)}</p>
        <div class="kb-facts"><span>${I('note')}${s.docs} tài liệu</span><span>${I('book')}${s.concepts} khái niệm</span><span>${I('chart')}${s.inds} chỉ số</span>${last ? `<span>${I('history')}Cập nhật ${F.date(last)}</span>` : ''}</div>
        <button class="btn ${following ? 'btn-secondary' : 'btn-primary'} mt-16" id="fl">${following ? `${I('check')}Đang theo dõi chủ đề` : `${I('plus')}Theo dõi chủ đề`}</button></header>
      <nav class="chipbar kb-anchors" aria-label="Mục trong chủ đề">${nav.map((n) => `<a class="chip" href="#${n[0]}">${n[1]}</a>`).join('')}</nav>
      <section class="sec" id="tong-quan">${F.secHead('Luận điểm chính')}<ol class="claims">${t.points.map((p) => { const r = F.report(p.r); return `<li><span>${F.esc(p.x)}</span><a class="src" href="${F.url('reader/report.html?id=' + r.id)}">${sm(I('note'), 13)} ${r.docCode} · ${F.esc(r.title)}</a></li>`; }).join('')}</ol><p class="hint">Luận điểm được biên tập viên tổng hợp từ các tài liệu đã thẩm định trong chủ đề.</p></section>
      <section class="sec" id="lo-trinh">${F.secHead('Lộ trình đọc')}${levels.length ? levels.map((x, k) => `<div class="path-step"><div class="ps-head"><span class="ps-n">${k + 1}</span><span><b>${F.LEVEL[x.lv].label}</b><span class="xs muted" style="display:block">${F.LEVEL[x.lv].desc}</span></span></div><div class="list-card">${x.list.map((r) => F.docRow(r, { noLevel: true })).join('')}</div></div>`).join('') : `<div class="card">${F.empty('note', 'Chưa có tài liệu', 'Chủ đề đang được xây dựng nội dung.')}</div>`}</section>
      <section class="sec" id="khai-niem">${F.secHead('Khái niệm cốt lõi', 'reader/glossary.html', 'Từ điển')}<div class="list-card flush">${t.concepts.map(F.concept).filter(Boolean).map(F.conceptRow).join('')}</div></section>
      <section class="sec" id="chi-so">${F.secHead('Chỉ số theo dõi', 'reader/market.html', 'Dữ liệu')}${t.indicators.length ? `<div class="hscroll">${t.indicators.map((id) => F.idxChip(F.ind(id))).join('')}</div>` : '<p class="small muted">Chủ đề định tính, chưa gắn chỉ số định lượng.</p>'}</section>
      <section class="sec" id="lien-quan">${F.secHead('Chủ đề liên quan')}<div class="hscroll">${t.related.map(F.topic).filter(Boolean).map((x) => F.topicCard(x)).join('')}</div></section>
    </div>
    <aside class="aside-desk"><div class="card"><div class="card-head"><h3>Trong chủ đề này</h3></div><nav class="toc">${nav.map((n) => `<a href="#${n[0]}">${n[1]}</a>`).join('')}</nav></div>
      <div class="card"><div class="card-head"><h3>Chuyên gia phụ trách</h3></div><div class="stack">${t.experts.map(F.expert).map((e) => `<a class="expert-chip" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e)}<span class="grow"><span class="nm">${F.esc(e.name)}</span> ${F.verifiedTag(e, '')}<span class="tt" style="display:block">${F.esc(e.title)}</span></span></a>`).join('')}</div></div></aside></div>
      <section class="sec m-only-block">${F.secHead('Chuyên gia phụ trách')}<div class="hscroll">${t.experts.map(F.expert).map(F.expMini).join('')}</div></section></div>`;
    $('#fl').onclick = () => { if (!F.requireAuth('Đăng nhập để theo dõi chủ đề và nhận thông báo khi có tri thức mới.')) return; const m = F.me(); const i = m.followTopics.indexOf(t.id); if (i >= 0) m.followTopics.splice(i, 1); else m.followTopics.unshift(t.id); F.save(); F.toast(i >= 0 ? 'Đã bỏ theo dõi chủ đề' : 'Đã theo dõi chủ đề — xem trong Sổ tay'); setTimeout(() => location.reload(), 450); };
    $('#shT', acts).onclick = () => F.shareModal(t.name, location.href);
  };

  /* ================= Tài liệu tri thức ================= */
  pages.report = () => {
    F.readerShell('topics');
    const r = F.report(F.param('id') || 'r5');
    if (!r || r.status !== 'published') { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('file', 'Tài liệu không tồn tại hoặc đã được gỡ', 'Tài liệu có thể đã được lưu trữ hoặc chưa xuất bản.', `<a class="btn btn-primary" href="${F.url('reader/topics.html')}">Danh mục chủ đề</a>`)}</div></div>`; return; }
    const nid = F.param('n'); if (nid) { const n = db().notifications.find((x) => x.id === nid); if (n) { n.read = true; F.save(); } }
    const e = F.expert(r.author); const d = F.domain(r.stream); const me = F.me(); const locked = F.isLocked(r);
    const saved = me && me.bookmarks.includes(r.id); const links = F.linksOfReport(r.id);
    const tps = (r.topics || []).map(F.topic).filter(Boolean); const cps = F.conceptsInReport(r);
    const related = F.published().filter((x) => x.id !== r.id && ((x.topics || []).some((t) => r.topics.includes(t)))).slice(0, 4);
    const heads = r.body.map((b, i) => (b.t === 'h' ? [i, b.x] : null)).filter(Boolean);
    const toc = [['kd', 'Luận điểm chính'], ...heads.map((h) => ['h' + h[0], h[1]]), ['nguon', 'Nguồn tham khảo'], ['trich-dan', 'Trích dẫn tài liệu'], ['lien-quan', 'Tri thức liên quan']];
    const cite = `${e.short} (${new Date(r.publishedAt).getFullYear()}). ${r.title}. FBV Research, ${r.docCode}, phiên bản ${r.version}.`;
    F.setTitle(r.docCode);
    const acts = F.setActions(`<button class="icon-btn" id="shTop" aria-label="Chia sẻ">${I('share')}</button>`);
    r.views = (r.views || 0) + 1; F.save();
    app().innerHTML = `<div class="page"><div class="read-grid"><article style="min-width:0">
      <header class="kb-head" style="--dc:${d.color};--dt:${d.tint}"><div class="crumbs-kb"><a href="${F.url('reader/topics.html#' + d.id)}">${d.name}</a>${tps.map((t) => `<span>›</span><a href="${F.url('reader/topic.html?id=' + t.id)}">${F.esc(t.name)}</a>`).join('')}</div>
        <div class="doc-kicker mt-12">${r.docCode} · ${F.levelBadge(r.level)} · Phiên bản ${r.version}${r.premium ? ' ' + F.premiumBadge() : ''}</div>
        <h1 class="kb-title">${F.esc(r.title)}</h1><p class="kb-lead">${F.esc(r.dek)}</p>
        <dl class="meta-dl"><div><dt>Tác giả</dt><dd><a href="${F.url('reader/expert.html?id=' + e.id)}">${F.esc(e.name)}</a> ${F.verifiedTag(e, '')}</dd></div><div><dt>Thẩm định</dt><dd>${F.esc(F.person(r.reviewer).name)} · FBV Review</dd></div><div><dt>Cập nhật</dt><dd>${F.date(F.updated(r))}${r.revisedAt ? ` · xuất bản ${F.date(r.publishedAt)}` : ''}</dd></div><div><dt>Đọc</dt><dd>${r.readTime} phút${r.pdf ? ` · <a href="${F.url('reader/report-pdf.html?id=' + r.id)}">Bản PDF</a>` : ''}</dd></div></dl></header>
      <details class="toc-m" ${innerWidth >= 1024 ? '' : ''}><summary>${sm(I('listUl'), 16)} Mục lục</summary><nav class="toc">${toc.map((x) => `<a href="#${x[0]}">${F.esc(x[1])}</a>`).join('')}</nav></details>
      <div class="exec-summary kd" id="kd"><h4>Luận điểm chính</h4><ol>${r.summary.map((x) => `<li>${F.esc(x)}</li>`).join('')}</ol></div>
      ${locked ? `<div class="paywall"><div class="article">${F.renderBlocks(r, { to: 1, widgets: false, terms: true })}</div><div class="article blurred" aria-hidden="true">${F.renderBlocks(r, { from: 1, to: 4, widgets: false })}</div>
        <div class="paywall-cta"><div class="lock">${I('lock')}</div><h3>Phần phân tích chuyên sâu dành cho hội viên Premium</h3><p>Mở khóa toàn văn, bảng số liệu, bản PDF và phản biện 1:1 không giới hạn.</p><div class="stack" style="gap:8px"><a class="btn btn-primary btn-block" href="${F.url('reader/pricing.html?r=' + r.id)}">${I('crown')}Xem gói Premium</a><a class="btn btn-secondary btn-block" href="${F.url('reader/checkout.html?plan=single&r=' + r.id)}">Mua lẻ tài liệu này</a></div>${me ? '' : `<p class="small mt-12">Đã là hội viên? <a href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập</a></p>`}</div></div>`
      : `<div class="article" id="art">${F.renderBlocks(r, { terms: true })}</div><p class="hint mt-8">${sm(I('info'), 13)} Thuật ngữ gạch chân có giải thích — chạm để xem. Bôi đen một đoạn để <b>đánh dấu</b>, ghi chú hoặc hỏi tác giả.</p>`}
      ${cps.length ? `<section class="sec" id="khai-niem">${F.secHead('Khái niệm trong tài liệu')}<div class="chips">${cps.map(F.conceptChip).join('')}</div></section>` : ''}
      <section class="sec" id="nguon">${F.secHead('Nguồn tham khảo')}<ol class="src-list">${r.sources.map((x) => `<li>${F.esc(x)}</li>`).join('')}</ol></section>
      <section class="sec" id="trich-dan">${F.secHead('Trích dẫn tài liệu')}<div class="cite"><code id="citeTx">${F.esc(cite)}</code><button class="btn btn-secondary btn-sm" id="cpCite">${I('copy')}Sao chép</button></div></section>
      <section class="sec" id="phien-ban">${F.secHead('Lịch sử phiên bản')}<div class="timeline">${r.changelog.slice().reverse().map((c) => `<div class="tl-item"><span class="tl-dot">${I('history')}</span><div><div class="tt"><b>v${c.v}</b> · ${F.esc(c.x)}</div><div class="tm">${F.date(c.at)}</div></div></div>`).join('')}</div></section>
      <section class="sec" id="lien-quan">${F.secHead('Tri thức liên quan')}${tps.length ? `<div class="chips mb-16">${tps.map(F.topicChip).join('')}</div>` : ''}${links.length ? `<div class="hscroll mb-16">${links.filter((l, i, a) => a.findIndex((x) => x.i === l.i) === i).map((l) => F.idxChip(F.ind(l.i))).join('')}</div>` : ''}${related.length ? `<div class="xs muted mb-8">Tài liệu cùng chủ đề</div><div class="list-card">${related.map((x) => F.docRow(x, { claim: false })).join('')}</div>` : ''}</section>
      <div class="disclaimer"><b>Tuyên bố miễn trừ trách nhiệm.</b> Tài liệu phục vụ mục đích nghiên cứu, học thuật; không phải lời mời hay khuyến nghị mua, bán, nắm giữ tài sản tài chính. Quan điểm thuộc về tác giả tại thời điểm công bố. Số liệu trong prototype là minh họa. <a href="${F.url('reader/disclaimer.html')}">Xem đầy đủ</a></div>
      <div class="actionbar" role="toolbar" aria-label="Thao tác với tài liệu"><button class="btn btn-primary grow" id="askBtn">${I('message')}Hỏi tác giả</button>${r.pdf ? `<a class="icon-btn" href="${F.url('reader/report-pdf.html?id=' + r.id)}" aria-label="Bản PDF" title="Bản PDF">${I('file')}</a>` : ''}<button class="icon-btn ${saved ? 'on' : ''}" id="bm" aria-label="${saved ? 'Bỏ lưu' : 'Lưu vào Sổ tay'}" title="${saved ? 'Bỏ lưu' : 'Lưu vào Sổ tay'}">${I(saved ? 'bookmarkFill' : 'bookmark')}</button><button class="icon-btn" id="sh" aria-label="Chia sẻ" title="Chia sẻ">${I('share')}</button></div>
    </article>
    <aside class="aside-desk"><div class="card"><div class="card-head"><h3>Mục lục</h3></div><nav class="toc" id="tocD">${toc.map((x) => `<a href="#${x[0]}">${F.esc(x[1])}</a>`).join('')}</nav></div>
      <div class="card"><div class="card-head"><h3>Tác giả</h3></div><a class="expert-chip" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'md')}<span><span class="nm">${F.esc(e.name)}</span><span class="tt" style="display:block">${F.esc(e.org)}</span></span></a>${me ? `<div class="mt-16">${F.quotaBar()}</div>` : ''}</div></aside></div></div>`;
    F.readProgress();
    if (!locked) { F.mountFigures(r, $('#art')); setupSelection(r); const h = location.hash.match(/^#p(\d+)$/); if (h) { const p = document.getElementById('p' + h[1]); if (p) { p.classList.add('hl-target'); setTimeout(() => p.scrollIntoView({ block: 'center' }), 100); setTimeout(() => p.classList.remove('hl-target'), 3500); } } markHighlights(r); }
    // TOC active + tiến độ đọc
    const tocLinks = $$('#tocD a'); const secs = toc.map((x) => document.getElementById(x[0])).filter(Boolean);
    let tmr; addEventListener('scroll', () => { const y = scrollY + 140; let cur = secs[0]; secs.forEach((s) => { if (s.offsetTop <= y) cur = s; }); tocLinks.forEach((a) => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
      clearTimeout(tmr); tmr = setTimeout(() => { const m = F.me(); if (!m) return; const max = document.documentElement.scrollHeight - innerHeight; m.lastRead = { r: r.id, at: new Date().toISOString(), pct: Math.max(1, Math.min(100, Math.round((scrollY / Math.max(max, 1)) * 100))) }; F.save(); }, 400); }, { passive: true });
    $$('.toc-m a').forEach((a) => a.addEventListener('click', () => a.closest('details').removeAttribute('open')));
    const bm = $('#bm');
    bm.onclick = () => { if (!F.requireAuth('Đăng nhập để lưu tài liệu vào Sổ tay tri thức.')) return; const m = F.me(); const i = m.bookmarks.indexOf(r.id); if (i >= 0) m.bookmarks.splice(i, 1); else m.bookmarks.unshift(r.id); F.save(); const on = i < 0; bm.innerHTML = I(on ? 'bookmarkFill' : 'bookmark'); bm.classList.toggle('on', on); F.toast(on ? 'Đã lưu vào Sổ tay tri thức' : 'Đã bỏ lưu'); };
    const share = () => { const url = location.origin + location.pathname + '?id=' + r.id; if (navigator.share && matchMedia('(pointer:coarse)').matches) navigator.share({ title: r.title, url }).catch(() => {}); else F.shareModal(r.title, url); };
    $('#sh').onclick = share; $('#shTop', acts).onclick = share;
    $('#cpCite').onclick = () => { try { navigator.clipboard.writeText(cite); } catch (x) {} F.toast('Đã sao chép trích dẫn'); };
    $('#askBtn').onclick = () => { if (locked) { F.toast('Mở khóa tài liệu để gửi phản biện về nội dung chuyên sâu.', 'info'); return; } const first = r.body.findIndex((b) => b.t === 'p'); F.openInquiry(r, r.summary[0], first); };
  };

  function markHighlights(r) {
    const me = F.me(); if (!me) return;
    me.highlights.filter((h) => h.r === r.id).forEach((h) => { const p = document.getElementById('p' + h.block); if (!p) return; const i = p.innerHTML.indexOf(F.esc(h.text)); if (i >= 0) p.innerHTML = p.innerHTML.slice(0, i) + `<mark class="hl" title="${F.esc(h.note || 'Đoạn đã đánh dấu')}">${F.esc(h.text)}</mark>` + p.innerHTML.slice(i + F.esc(h.text).length); else p.classList.add('has-hl'); });
  }

  function setupSelection(r) {
    const art = $('#art'); let pop = null; const touch = matchMedia('(pointer:coarse)').matches;
    const clear = () => { if (pop) { pop.remove(); pop = null; } };
    const check = () => {
      const sel = window.getSelection(); const txt = sel ? sel.toString().trim().replace(/\s+/g, ' ') : '';
      if (!txt || txt.length < 12 || !sel.rangeCount) { clear(); return; }
      const range = sel.getRangeAt(0); const node = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
      if (!art.contains(node)) { clear(); return; }
      const blk = node.closest('[data-b]') || range.startContainer.parentElement.closest('[data-b]'); const bi = blk ? +blk.dataset.b : 0;
      const quote = txt.length > 400 ? txt.slice(0, 400) + '…' : txt;
      clear(); pop = document.createElement('div');
      const btns = `<button data-h>${I('edit')}Đánh dấu</button><button data-q>${I('quote')}Hỏi tác giả</button><button data-c class="hide-m">${I('copy')}Sao chép</button>`;
      if (touch) { pop.className = 'sel-fab sel-pop-m'; pop.innerHTML = btns; document.body.appendChild(pop); }
      else { pop.className = 'sel-pop'; pop.innerHTML = btns; const rc = range.getBoundingClientRect(); pop.style.left = rc.left + rc.width / 2 + window.scrollX + 'px'; pop.style.top = rc.top + window.scrollY - 10 + 'px'; document.body.appendChild(pop); }
      pop.addEventListener('mousedown', (e) => e.preventDefault());
      $('[data-q]', pop).onclick = () => { clear(); F.openInquiry(r, quote, bi); };
      $('[data-h]', pop).onclick = () => { clear(); if (!F.requireAuth('Đăng nhập để đánh dấu và ghi chú vào Sổ tay tri thức.')) return;
        F.modal({ title: 'Đánh dấu vào Sổ tay', body: `<div class="stack"><div class="quote-block">“${F.esc(quote)}”<span class="qsrc">${r.docCode} · ${F.esc(r.title)}</span></div><div class="field"><label for="hn">Ghi chú của bạn (không bắt buộc)</label><textarea class="textarea" id="hn" style="min-height:90px" placeholder="Vì sao đoạn này quan trọng với bạn?"></textarea></div></div>`,
          actions: [{ label: 'Hủy' }, { label: 'Lưu đánh dấu', cls: 'btn-primary', onClick: (c, el) => { const m = F.me(); m.highlights.unshift({ id: F.uid('h'), r: r.id, block: bi, text: quote, note: $('#hn', el).value.trim(), at: new Date().toISOString() }); F.save(); F.toast('Đã lưu vào Sổ tay › Đánh dấu'); } }] }); };
      const c = $('[data-c]', pop); if (c) c.onclick = () => { try { navigator.clipboard.writeText(`“${quote}” — ${F.expert(r.author).short}, ${r.docCode}, FBV Research`); } catch (e) {} F.toast('Đã sao chép kèm nguồn trích dẫn'); clear(); };
    };
    document.addEventListener('mouseup', () => setTimeout(check, 10));
    document.addEventListener('selectionchange', () => { if (touch) { clearTimeout(window.__st); window.__st = setTimeout(check, 350); } });
    document.addEventListener('mousedown', (e) => { if (pop && !pop.contains(e.target)) clear(); });
    window.addEventListener('scroll', () => { if (pop && !touch) clear(); }, { passive: true });
  }

  /* ================= Khái niệm ================= */
  pages.concept = () => {
    F.readerShell('topics');
    const c = F.concept(F.param('id') || 'c_nim');
    if (!c) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('book', 'Không tìm thấy khái niệm', 'Khái niệm không tồn tại.', `<a class="btn btn-primary" href="${F.url('reader/glossary.html')}">Từ điển</a>`)}</div></div>`; return; }
    const me = F.me(); const saved = me && me.savedConcepts.includes(c.id);
    const docs = F.reportsOfConcept(c);
    const snippet = (r) => { for (const b of r.body) { const x = b.x || ''; for (const p of c.patterns || []) { const m = x.match(patRe(p)); if (m) { const i = m.index; const s = Math.max(0, i - 60); return (s ? '…' : '') + F.esc(x.slice(s, i)) + `<mark>${F.esc(m[0])}</mark>` + F.esc(x.slice(i + m[0].length, i + m[0].length + 80)) + '…'; } } } return F.esc(r.summary[0]); };
    F.setTitle(c.term);
    app().innerHTML = `<div class="page narrow"><header class="kb-head"><a class="kicker" href="${F.url('reader/glossary.html')}">${sm(I('book'), 15)}Từ điển thuật ngữ</a><h1 class="kb-title">${F.esc(c.term)}</h1>${c.aka ? `<p class="sub">${F.esc(c.aka)}</p>` : ''}
        <div class="def-box mt-16">${F.esc(c.short)}</div>
        <button class="btn ${saved ? 'btn-secondary' : 'btn-soft'} mt-16" id="sv">${saved ? `${I('check')}Đã lưu vào Sổ tay` : `${I('bookmark')}Lưu vào Sổ tay`}</button></header>
      <section class="sec">${F.secHead('Diễn giải')}<p class="kb-body">${F.esc(c.long)}</p>${c.formula ? `<div class="formula mt-12">${F.esc(c.formula)}</div>` : ''}${c.example ? `<div class="alert info mt-12">${sm(I('info'), 18)}<span><b>Ví dụ:</b> ${F.esc(c.example)}</span></div>` : ''}</section>
      ${c.topics.length ? `<section class="sec">${F.secHead('Thuộc chủ đề')}<div class="chips">${c.topics.map((t) => F.topicChip(F.topic(t))).join('')}</div></section>` : ''}
      ${c.indicators.length ? `<section class="sec">${F.secHead('Chỉ số đo lường')}<div class="list-card">${c.indicators.map((id) => F.miniRow(F.ind(id))).join('')}</div></section>` : ''}
      <section class="sec">${F.secHead('Xuất hiện trong tài liệu')}${docs.length ? `<div class="list-card flush">${docs.map((r) => `<a class="mention" href="${F.url('reader/report.html?id=' + r.id)}"><span class="xs muted">${r.docCode} · ${F.levelBadge(r.level)}</span><b>${F.esc(r.title)}</b><span class="snip">${snippet(r)}</span></a>`).join('')}</div>` : `<div class="card">${F.empty('note', 'Chưa có tài liệu nhắc tới', 'Khái niệm này chưa xuất hiện trong tài liệu đã xuất bản.')}</div>`}</section>
      ${(() => { const rel = db().concepts.filter((x) => x.id !== c.id && x.topics.some((t) => c.topics.includes(t))).slice(0, 8); return rel.length ? `<section class="sec">${F.secHead('Khái niệm liên quan')}<div class="chips">${rel.map(F.conceptChip).join('')}</div></section>` : ''; })()}</div>`;
    $('#sv').onclick = () => { if (!F.requireAuth('Đăng nhập để lưu khái niệm vào Sổ tay tri thức.')) return; const m = F.me(); const i = m.savedConcepts.indexOf(c.id); if (i >= 0) m.savedConcepts.splice(i, 1); else m.savedConcepts.unshift(c.id); F.save(); F.toast(i >= 0 ? 'Đã bỏ lưu' : 'Đã lưu vào Sổ tay'); setTimeout(() => location.reload(), 400); };
  };

  /* ================= Từ điển thuật ngữ ================= */
  pages.glossary = () => {
    F.readerShell('topics');
    const all = db().concepts.slice().sort((a, b) => a.term.localeCompare(b.term, 'vi'));
    const L = (c) => norm(c.term)[0].toUpperCase();
    const letters = [...new Set(all.map(L))];
    app().innerHTML = `<div class="page narrow"><p class="sub mb-12">${all.length} khái niệm kinh tế – tài chính, được giải thích ngắn gọn và liên kết với chủ đề, chỉ số và tài liệu.</p>
      <div class="search-box mb-12">${I('search')}<input class="input" id="gq" type="search" placeholder="Tìm thuật ngữ (vd: NIM, lạm phát, DXY)…" aria-label="Tìm thuật ngữ" style="height:48px;border-radius:14px;background:#fff"></div>
      <nav class="az" id="az">${letters.map((l) => `<a href="#L-${l}">${l}</a>`).join('')}</nav><div id="gl"></div></div>`;
    const draw = (q) => {
      const list = all.filter((c) => !q || norm(c.term + ' ' + (c.aka || '') + ' ' + c.short).includes(norm(q)));
      const groups = [...new Set(list.map(L))];
      $('#gl').innerHTML = list.length ? groups.map((g) => `<section class="sec" id="L-${g}"><div class="az-h">${g}</div><div class="list-card flush">${list.filter((c) => L(c) === g).map(F.conceptRow).join('')}</div></section>`).join('') : `<div class="card">${F.empty('search', 'Không tìm thấy thuật ngữ', 'Thử từ khóa khác hoặc tra cứu toàn hệ tri thức.', `<a class="btn btn-secondary" href="${F.url('reader/search.html')}">Tra cứu toàn bộ</a>`)}</div>`;
    };
    $('#gq').addEventListener('input', (e) => draw(e.target.value)); draw('');
  };

  /* ================= Tra cứu ================= */
  pages.search = () => {
    F.readerShell('explore');
    const D = db(); const st = { q: F.param('q') || '', type: F.param('type') || 'all' };
    const types = [['all', 'Tất cả'], ['topic', 'Chủ đề'], ['concept', 'Khái niệm'], ['ind', 'Chỉ số'], ['doc', 'Tài liệu']];
    app().innerHTML = `<div class="page narrow"><div class="search-box mb-12">${I('search')}<input class="input" id="q" type="search" placeholder="Tra cứu chủ đề, khái niệm, chỉ số, tài liệu…" value="${F.esc(st.q)}" autocomplete="off" aria-label="Từ khóa" style="height:50px;border-radius:14px;background:#fff"></div>
      <nav class="chipbar" style="position:static;margin:0 -16px 12px;padding:0 16px" id="ty">${types.map((t) => `<button class="chip ${st.type === t[0] ? 'active' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</nav><div id="res"></div></div>`;
    const run = () => {
      const q = norm(st.q.trim()); const has = (s) => !q || norm(s).includes(q);
      const R = {
        topic: D.topics.filter((t) => has(t.name + ' ' + t.summary)),
        concept: D.concepts.filter((c) => has(c.term + ' ' + (c.aka || '') + ' ' + c.short + ' ' + (c.patterns || []).join(' '))),
        ind: D.indicators.filter((i) => has(i.name + ' ' + i.id + ' ' + i.syn.join(' '))),
        doc: F.published().filter((r) => has([r.title, r.dek, r.docCode, r.summary.join(' '), (r.tags || []).join(' '), F.expert(r.author).name, r.body.map((b) => b.x || '').join(' ')].join(' ')))
      };
      if (!q && st.type === 'all') {
        $('#res').innerHTML = `<section class="sec">${F.secHead('Chủ đề nổi bật', 'reader/topics.html', 'Tất cả')}<div class="chips">${D.topics.slice(0, 8).map(F.topicChip).join('')}</div></section><section class="sec">${F.secHead('Khái niệm hay tra cứu', 'reader/glossary.html', 'Từ điển')}<div class="chips">${D.concepts.slice(0, 10).map(F.conceptChip).join('')}</div></section><section class="sec">${F.secHead('Chỉ số')}<div class="hscroll">${['VNINDEX', 'ON_RATE', 'USDVND', 'CPI', 'GDP'].map((id) => F.idxChip(F.ind(id))).join('')}</div></section>`;
        return;
      }
      const sec = (k, title, html, n) => (st.type === 'all' || st.type === k) && n ? `<section class="sec"><div class="sec-head"><h2>${title} <span class="muted small">${n}</span></h2>${st.type === 'all' && n > 3 ? `<a href="#" data-more="${k}">Xem tất cả</a>` : ''}</div>${html}</section>` : '';
      const lim = (a) => (st.type === 'all' ? a.slice(0, 3) : a);
      const total = R.topic.length + R.concept.length + R.ind.length + R.doc.length;
      $('#res').innerHTML = (st.type === 'all' ? total : R[st.type].length) ? sec('topic', 'Chủ đề', `<div class="topic-grid">${lim(R.topic).map((t) => F.topicCard(t)).join('')}</div>`, R.topic.length) + sec('concept', 'Khái niệm', `<div class="list-card flush">${lim(R.concept).map(F.conceptRow).join('')}</div>`, R.concept.length) + sec('ind', 'Chỉ số', `<div class="list-card">${lim(R.ind).map(F.miniRow).join('')}</div>`, R.ind.length) + sec('doc', 'Tài liệu', `<div class="list-card">${lim(R.doc).map((r) => F.docRow(r)).join('')}</div>`, R.doc.length)
        : `<div class="card">${F.empty('search', 'Không tìm thấy kết quả', 'Thử từ khóa khác, ví dụ “lãi suất”, “NIM”, “FDI” hoặc tên chỉ số.', '')}</div>`;
      $$('[data-more]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); st.type = a.dataset.more; $$('#ty .chip').forEach((x) => x.classList.toggle('active', x.dataset.t === st.type)); run(); }));
    };
    let t; $('#q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value; run(); }, 180); });
    $$('#ty .chip').forEach((b) => (b.onclick = () => { st.type = b.dataset.t; $$('#ty .chip').forEach((x) => x.classList.toggle('active', x === b)); run(); }));
    run(); if (innerWidth >= 768) $('#q').focus();
  };

  /* ================= Sổ tay tri thức ================= */
  pages.bookmarks = () => {
    if (!F.isMember()) { F.readerShell('me'); app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('bookmark', 'Sổ tay tri thức', 'Đăng nhập để lưu tài liệu, đánh dấu đoạn quan trọng, lưu khái niệm và theo dõi chủ đề.', `<a class="btn btn-primary" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập / Đăng ký</a>`)}</div></div>`; return; }
    F.readerShell('me');
    const me = F.me(); let tab = F.param('t') || 'docs';
    const render = () => {
      const docs = me.bookmarks.map(F.report).filter((r) => r && r.status === 'published');
      const cs = me.savedConcepts.map(F.concept).filter(Boolean); const ts = me.followTopics.map(F.topic).filter(Boolean);
      const tabs = [['docs', 'Tài liệu', docs.length], ['hl', 'Đánh dấu', me.highlights.length], ['concepts', 'Khái niệm', cs.length], ['topics', 'Chủ đề', ts.length]];
      let body = '';
      if (tab === 'docs') body = docs.length ? `<div class="list-card">${docs.map((r) => `<div class="rel">${F.docRow(r, { claim: false })}<button class="rm-x" data-rm="${r.id}" aria-label="Bỏ lưu">${sm(I('x'), 16)}</button></div>`).join('')}</div>` : F.empty('note', 'Chưa lưu tài liệu nào', 'Nhấn biểu tượng lưu trên tài liệu để thêm vào sổ tay.', `<a class="btn btn-primary" href="${F.url('reader/topics.html')}">Khám phá chủ đề</a>`);
      if (tab === 'hl') body = me.highlights.length ? `<div class="stack">${me.highlights.map((h) => { const r = F.report(h.r); return `<div class="card hl-card"><div class="quote-block">“${F.esc(h.text)}”<span class="qsrc"><a href="${F.url('reader/report.html?id=' + r.id + '#p' + h.block)}">${r.docCode} · ${F.esc(r.title)}</a></span></div>${h.note ? `<p class="small mt-12">${sm(I('edit'), 14)} ${F.esc(h.note)}</p>` : ''}<div class="row between mt-12"><span class="xs muted">${F.date(h.at)}</span><button class="btn btn-ghost btn-xs" data-dh="${h.id}">${sm(I('trash'), 14)}Xóa</button></div></div>`; }).join('')}</div>` : F.empty('edit', 'Chưa có đánh dấu', 'Khi đọc tài liệu, bôi đen một đoạn và chọn “Đánh dấu” để lưu kèm ghi chú.', '');
      if (tab === 'concepts') body = cs.length ? `<div class="list-card flush">${cs.map(F.conceptRow).join('')}</div>` : F.empty('book', 'Chưa lưu khái niệm', 'Chạm vào thuật ngữ gạch chân trong tài liệu và chọn “Lưu vào Sổ tay”.', `<a class="btn btn-primary" href="${F.url('reader/glossary.html')}">Mở từ điển</a>`);
      if (tab === 'topics') body = ts.length ? `<div class="topic-grid">${ts.map((t) => F.topicCard(t, { summary: true })).join('')}</div>` : F.empty('layers', 'Chưa theo dõi chủ đề', 'Theo dõi chủ đề để nhận thông báo khi có tri thức mới.', `<a class="btn btn-primary" href="${F.url('reader/topics.html')}">Danh mục chủ đề</a>`);
      app().innerHTML = `<div class="page narrow"><nav class="chipbar">${tabs.map((t) => `<button class="chip ${tab === t[0] ? 'active' : ''}" data-t="${t[0]}">${t[1]} · ${t[2]}</button>`).join('')}</nav>${body.startsWith('<div class="empty') ? `<div class="card">${body}</div>` : body}</div>`;
      $$('[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; history.replaceState(null, '', '?t=' + tab); render(); }));
      $$('[data-rm]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); me.bookmarks = me.bookmarks.filter((x) => x !== b.dataset.rm); F.save(); F.toast('Đã bỏ lưu'); render(); }));
      $$('[data-dh]').forEach((b) => (b.onclick = () => { me.highlights = me.highlights.filter((x) => x.id !== b.dataset.dh); F.save(); F.toast('Đã xóa đánh dấu'); render(); }));
    };
    render();
  };

  /* ================= Chuyên gia ================= */
  pages.expert = () => {
    F.readerShell('explore');
    const e = F.expert(F.param('id') || 'e1');
    if (!e) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('user', 'Không tìm thấy chuyên gia', 'Hồ sơ chuyên gia không tồn tại.', '')}</div></div>`; return; }
    F.setTitle(e.short);
    const me = F.me(); const list = F.published().filter((r) => r.author === e.id);
    const tps = db().topics.filter((t) => t.experts.includes(e.id));
    const answered = db().inquiries.filter((q) => q.expert === e.id && ['answered', 'closed'].includes(q.status)).length;
    const following = me && me.follows.includes(e.id);
    const byTopic = {}; list.forEach((r) => { const k = (r.topics || [])[0] || 'khac'; (byTopic[k] = byTopic[k] || []).push(r); });
    app().innerHTML = `<div class="page narrow"><div class="card center" style="padding:24px 18px"><div style="display:flex;justify-content:center">${F.avatar(e, 'lg')}</div>
      <h1 class="kb-title mt-12" style="font-size:24px">${F.esc(e.name)}</h1><div class="mt-8">${e.verified ? F.verifiedTag(e) : '<span class="badge s-in_review">Đang chờ thẩm định huy hiệu</span>'}</div>
      <p class="sub small mt-8">${F.esc(e.title)} · ${F.esc(e.org)}</p>
      <div class="me-stats" style="margin-top:16px"><a href="#tl"><b class="num">${list.length}</b><span>Tài liệu</span></a><a href="#cm"><b class="num">${tps.length}</b><span>Chủ đề</span></a><a><b class="num">${answered}</b><span>Phản biện đã trả lời</span></a></div>
      <button class="btn ${following ? 'btn-secondary' : 'btn-primary'} btn-block mt-16" id="fl">${following ? `${I('check')}Đang theo dõi` : `${I('plus')}Theo dõi chuyên gia`}</button></div>
      <section class="sec"><div class="card"><h3 class="mb-8">Giới thiệu</h3><p class="sub" style="font-size:14.5px">${F.esc(e.bio)}</p>${e.verified ? `<div class="alert info mt-12">${F.verifiedIcon().replace('<svg', '<svg style="width:20px;height:20px;flex:none"')}<span><b>Verified by FBV:</b> học vị, đơn vị công tác và lĩnh vực chuyên môn đã được Hội đồng FBV thẩm định.</span></div>` : ''}</div></section>
      ${tps.length ? `<section class="sec" id="cm">${F.secHead('Chủ đề phụ trách')}<div class="chips">${tps.map(F.topicChip).join('')}</div></section>` : ''}
      <section class="sec" id="tl">${F.secHead('Tài liệu theo chủ đề')}${list.length ? Object.entries(byTopic).map(([k, rs]) => `<div class="xs muted mb-8 mt-12" style="font-weight:700;text-transform:uppercase;letter-spacing:.4px">${F.topic(k) ? F.esc(F.topic(k).name) : 'Khác'}</div><div class="list-card">${rs.map((r) => F.docRow(r, { claim: false })).join('')}</div>`).join('') : `<div class="card">${F.empty('note', 'Chưa có tài liệu', 'Chuyên gia chưa xuất bản tài liệu nào.')}</div>`}</section></div>`;
    $('#fl').onclick = () => { if (!F.requireAuth('Đăng nhập để theo dõi chuyên gia.')) return; const m = F.me(); const i = m.follows.indexOf(e.id); if (i >= 0) m.follows.splice(i, 1); else m.follows.push(e.id); F.save(); F.toast(i >= 0 ? 'Đã bỏ theo dõi' : 'Đã theo dõi ' + e.name); setTimeout(() => location.reload(), 450); };
  };
})();
