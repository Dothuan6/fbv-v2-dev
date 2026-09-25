/* =========================================================
   FBV v2 Prototype — READER (phần 1)
   R01 Feed · R02 Tìm kiếm · R03 Báo cáo · R04 PDF · R05 Phản biện (modal)
   R06 Chuyên gia · R07 Thị trường · R08 Vĩ mô · R09 Chi tiết chỉ số
   Giao diện mobile-first (app shell trong shell.js)
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = () => document.getElementById('app');
  const I = F.icon;

  /* ---------- Shared: blocks renderer ---------- */
  F.renderBlocks = (r, opts = {}) => {
    const links = opts.widgets === false ? [] : F.linksOfReport(r.id);
    const blocks = r.body.slice(opts.from || 0, opts.to == null ? r.body.length : opts.to);
    return blocks.map((b, k) => {
      const i = k + (opts.from || 0); let h = '';
      if (b.t === 'p') h = `<p data-b="${i}" id="p${i}">${F.esc(b.x)}</p>`;
      else if (b.t === 'h') h = `<h2 data-b="${i}">${F.esc(b.x)}</h2>`;
      else if (b.t === 'quote') h = `<blockquote data-b="${i}">${F.esc(b.x)}</blockquote>`;
      else if (b.t === 'table') h = `<div class="tbl-wrap" data-b="${i}"><div class="fig-title" style="font-family:var(--font-ui);font-size:14.5px;font-weight:700;margin-bottom:8px">${F.esc(b.cap)}</div><table><thead><tr>${b.head.map((x, j) => `<th class="${j ? 'r' : ''}">${F.esc(x)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((row) => `<tr>${row.map((x, j) => `<td class="${j ? 'r' : ''}">${F.esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table><figcaption style="font-family:var(--font-ui);font-size:13px;color:var(--text-3);margin-top:8px">Nguồn: ${F.esc(b.src)}</figcaption></div>`;
      else if (b.t === 'fig') h = `<figure data-b="${i}"><div class="fig-title">${F.esc(b.title)}</div><div class="fig-chart" data-fig="${i}"></div><figcaption>Nguồn: ${F.esc(b.src)}</figcaption></figure>`;
      const ws = links.filter((l) => l.a === i);
      return h + ws.map((l) => F.indWidget(F.ind(l.i), l)).join('');
    }).join('');
  };
  F.mountFigures = (r, root) => $$('.fig-chart', root).forEach((el) => { const b = r.body[+el.dataset.fig]; F.chart.bar(el, { labels: b.data.map((d) => d[0]), values: b.data.map((d) => d[1]), dec: b.data.some((d) => d[1] % 1) ? 2 : 0, showValues: true, axis: false, height: 220, color: '#7BA7E8', highlightLast: true, suffix: b.unit === '%' ? '%' : ' ' + b.unit, label: b.title }); });
  F.indWidget = (ind, l) => {
    const ch = F.chg(ind); const macro = ind.group === 'macro';
    return `<a class="ind-widget" href="${F.url('reader/indicator.html?id=' + ind.id + '&from=' + l.r)}"><span class="w-ico">${I(macro ? 'bars' : 'chart')}</span>
      <span style="min-width:0"><span class="ai-tag">${I('sparkles')} Chỉ số liên quan · ${l.s === 'manual' ? 'Biên tập viên thêm' : 'Gợi ý bởi AI, đã kiểm duyệt'}</span><span class="w-name" style="display:block">${F.esc(ind.name)}${macro ? ` <span class="muted small" style="font-weight:400">· ${F.esc(ind.period)}</span>` : ''}</span>
      <span class="row" style="gap:10px"><span class="w-val num">${F.fmtVal(ind)}</span><span class="chg-pill ${ch.d} num">${F.arrow(ch.c)} ${macro ? F.signed(ch.c, ind.dec) + ' đ.%' : F.signed(ch.p, 2) + '%'}</span></span></span>
      <span class="w-spark">${macro ? F.chart.sparkBars(ind.series.values) : ((v) => F.chart.spark(v, F.dir(v[v.length - 1] - v[0])))(F.series(ind, '1M').values)}</span></a>`;
  };

  /* ================= R03 · Chi tiết báo cáo ================= */
  const quotaInfo = () => {
    const me = F.me(); const lim = F.db().config.quotaPerMonth; const unlimited = F.hasSub();
    const used = me ? F.db().inquiries.filter((q) => q.reader === me.id && Date.now() - new Date(q.createdAt) < 30 * 864e5).length : 0;
    return { used, lim, left: Math.max(lim - used, 0), unlimited };
  };
  F.quotaInfo = quotaInfo;
  F.quotaBar = () => { const q = quotaInfo(); return q.unlimited ? `<div class="quota">${I('crown').replace('<svg', '<svg style="width:16px;height:16px;color:#B45309"')}<span>Hội viên Premium: phản biện không giới hạn</span></div>` : `<div class="quota"><span>Đã dùng <b class="num">${q.used}/${q.lim}</b> lượt phản biện (30 ngày)</span><span class="bar"><i style="width:${Math.min(100, (q.used / q.lim) * 100)}%"></i></span></div>`; };

  F.openInquiry = (r, quote, block) => {
    if (!F.requireAuth('Đăng nhập để gửi câu hỏi phản biện riêng tới tác giả báo cáo.')) return;
    const me = F.me(); const e = F.expert(r.author);
    if (me.blocked.includes(e.id)) { F.toast('Bạn đã chặn chuyên gia này. Bỏ chặn trong Cài đặt để tiếp tục.', 'error'); return; }
    const q = quotaInfo();
    if (!q.unlimited && q.left <= 0) {
      F.modal({ title: 'Bạn đã dùng hết lượt phản biện', body: `<p class="sub">Tài khoản miễn phí được gửi tối đa ${q.lim} phiên phản biện trong 30 ngày để đảm bảo chuyên gia có đủ thời gian phản hồi chất lượng.</p>${F.session().phase2 ? `<div class="alert info mt-16">${I('crown')}<span>Hội viên Premium được mở rộng phản biện 1:1 không giới hạn và tham gia các buổi trao đổi kín định kỳ.</span></div>` : ''}`,
        actions: F.session().phase2 ? [{ label: 'Để sau' }, { label: 'Xem gói Premium', cls: 'btn-primary', onClick: () => F.go('reader/pricing.html') }] : [{ label: 'Đã hiểu', cls: 'btn-primary' }] });
      return;
    }
    F.modal({
      title: 'Gửi câu hỏi phản biện', size: 'lg',
      body: `<div class="stack"><div class="quote-block">“${F.esc(quote)}”<span class="qsrc">Trích từ: ${F.esc(r.title)}</span></div>
        <div class="row">${F.avatar(e, 'sm')}<span class="small">Gửi riêng tới <b>${F.esc(e.name)}</b> ${F.verifiedTag(e, '')}</span></div>
        <div class="field"><label for="iq">Câu hỏi / phản biện của bạn</label><textarea class="textarea" id="iq" maxlength="1500" placeholder="Nêu rõ điểm bạn muốn làm rõ hoặc phản biện, kèm lập luận/số liệu nếu có…"></textarea><div class="row between"><span class="hint">Tối thiểu 20 ký tự · Trao đổi học thuật, không yêu cầu khuyến nghị mua/bán.</span><span class="hint num" id="iqc">0/1500</span></div><span class="error-text hidden" id="iqe">Vui lòng nhập tối thiểu 20 ký tự.</span></div>
        ${F.quotaBar()}
        <div class="perm-note">${I('lock')}<span>Phiên trao đổi 1:1 là <b>riêng tư</b>, không hiển thị công khai. Chuyên gia thường phản hồi trong <b>${F.db().config.slaHours} giờ</b>. Bạn có thể báo cáo vi phạm hoặc chặn bất kỳ lúc nào.</span></div></div>`,
      actions: [{ label: 'Hủy' }, { label: `${I('send')} Gửi phản biện`, cls: 'btn-primary', onClick: (close, el) => {
        const v = $('#iq', el).value.trim(); if (v.length < 20) { $('#iqe', el).classList.remove('hidden'); $('#iq', el).classList.add('invalid'); return false; }
        const db = F.db(); const now = new Date().toISOString(); const id = F.uid('q');
        db.inquiries.unshift({ id, r: r.id, reader: me.id, expert: e.id, status: 'new', block, createdAt: now, slaDue: new Date(Date.now() + db.config.slaHours * 36e5).toISOString(), readerUnread: false, expertUnread: true, quote, messages: [{ by: me.id, at: now, x: v }] });
        F.save(); close();
        F.modal({ title: 'Đã gửi phản biện', body: `<div class="center stack" style="align-items:center"><div class="avatar lg" style="background:#DCFCE7;color:#15803D">${I('checkCircle').replace('<svg', '<svg style="width:40px;height:40px"')}</div><p class="sub">Câu hỏi của bạn đã được gửi tới <b>${F.esc(e.name)}</b>. Bạn sẽ nhận thông báo khi chuyên gia phản hồi.</p></div>`, actions: [{ label: 'Tiếp tục đọc' }, { label: 'Xem phiên trao đổi', cls: 'btn-primary', onClick: () => F.go('reader/inquiry.html?id=' + id) }] });
        return false;
      } }],
      onOpen: (el) => { const ta = $('#iq', el); ta.addEventListener('input', () => { $('#iqc', el).textContent = ta.value.length + '/1500'; if (ta.value.trim().length >= 20) { $('#iqe', el).classList.add('hidden'); ta.classList.remove('invalid'); } }); }
    });
  };

  F.shareModal = (title, url) => F.modal({ title: 'Chia sẻ báo cáo', body: `<div class="stack"><p class="sub small">${F.esc(title)}</p><div class="row"><input class="input grow" id="shu" value="${F.esc(url)}" readonly><button class="btn btn-primary" id="cpy">${I('copy')}Sao chép</button></div><div class="row wrap" style="gap:8px">${['Facebook', 'LinkedIn', 'Zalo', 'Email'].map((n) => `<button class="chip" data-n="${n}">${n}</button>`).join('')}</div><p class="hint">Liên kết mở trang web báo cáo (có ảnh xem trước). Trên điện thoại đã cài app, liên kết sẽ mở thẳng trong ứng dụng FBV.</p></div>`,
    onOpen: (el) => { $('#cpy', el).onclick = () => { try { navigator.clipboard.writeText(url); } catch (e) {} F.toast('Đã sao chép liên kết'); }; $$('[data-n]', el).forEach((b) => (b.onclick = () => F.toast('Mô phỏng: mở chia sẻ qua ' + b.dataset.n, 'info'))); } });

  /* ================= R01 · Trang chủ – Research Feed (mobile-first) ================= */
  pages.home = () => {
    F.readerShell('research');
    const me = F.me(); const s = F.param('s') || (me ? 'foryou' : 'all');
    let list = F.published();
    if (s === 'foryou' && me) list = list.slice().sort((a, b) => (me.interests.includes(b.stream) ? 1 : 0) - (me.interests.includes(a.stream) ? 1 : 0));
    else if (s !== 'all' && s !== 'foryou') list = list.filter((r) => r.stream === s);
    const featured = s === 'all' || s === 'foryou' ? [list.find((r) => r.featured) || list[0]].concat(list.filter((r) => !r.featured).slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 2)).filter(Boolean) : [];
    const rest = list.filter((r) => !featured.includes(r));
    const tabs = [...(me ? [['foryou', 'Dành cho bạn']] : []), ['all', 'Tất cả'], ['fintech', 'Fintech'], ['macro', 'Kinh tế Vĩ mô'], ['micro', 'Kinh tế Vi mô']];
    app().innerHTML = `<div class="page"><div class="home-grid"><div style="min-width:0">
      <nav class="chipbar" aria-label="Luồng nghiên cứu">${tabs.map((t) => `<a class="chip ${s === t[0] ? 'active' : ''}" href="?s=${t[0]}" ${s === t[0] ? 'aria-current="page"' : ''}>${t[1]}</a>`).join('')}</nav>
      ${me ? '' : ''}
      <section class="sec"><div class="hscroll" aria-label="Chỉ số thị trường">${['VNINDEX', 'VN30', 'USDVND', 'ON_RATE', 'GOLD', 'CPI'].map((id) => F.idxChip(F.ind(id))).join('')}</div><div class="src-note" style="margin-top:6px">${I('info')}<span>Trễ 15 phút · Dữ liệu minh họa</span></div></section>
      ${featured.length ? `<section class="sec">${F.secHead('Tiêu điểm')}<div class="hscroll grid-d">${featured.map((r, i) => F.heroCard(r, i === 0)).join('')}</div></section>` : ''}
      <section class="sec">${F.secHead(s === 'foryou' ? 'Dành cho bạn' : s === 'all' ? 'Mới nhất' : F.STREAM[s])}<div class="list-card" id="feed"></div><div class="center mt-16" id="moreWrap"></div></section>
      ${me ? '' : `<section class="sec"><div class="cta-card"><h3>Trao đổi trực tiếp với chuyên gia</h3><p>Tạo tài khoản miễn phí để lưu báo cáo và gửi câu hỏi phản biện riêng tới tác giả.</p><a class="btn btn-primary btn-block" href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Tạo tài khoản miễn phí</a></div></section>`}
      <section class="sec">${F.secHead('Chuyên gia FBV')}<div class="hscroll">${F.db().experts.filter((e) => e.verified).map(F.expMini).join('')}</div></section>
    </div>
    <aside class="aside-desk"><div class="card"><div class="card-head"><h3>Chỉ số hôm nay</h3><a href="${F.url('reader/market.html')}">Thị trường</a></div><div class="mini-list">${['VNINDEX', 'VN30', 'HNX', 'USDVND', 'ON_RATE', 'BRENT'].map((id) => F.miniRow(F.ind(id))).join('')}</div>${F.srcNote('Trễ 15 phút · Dữ liệu minh họa')}</div>
      ${me ? `<div class="card"><div class="card-head"><h3>Phản biện của bạn</h3><a href="${F.url('reader/inquiries.html')}">Xem</a></div>${F.quotaBar()}</div>` : ''}</aside></div></div>`;
    let shown = 0; const PAGE = 6;
    const more = () => { $('#feed').insertAdjacentHTML('beforeend', rest.slice(shown, shown + PAGE).map((r) => F.reportRow(r)).join('')); shown += PAGE; $('#moreWrap').innerHTML = shown < rest.length ? `<button class="btn btn-secondary" id="moreBtn">Xem thêm báo cáo</button>` : rest.length > PAGE ? '<p class="muted small">Bạn đã xem hết báo cáo trong mục này.</p>' : ''; const b = $('#moreBtn'); if (b) b.onclick = more; };
    if (!rest.length) $('#feed').outerHTML = `<div class="card">${F.empty('file', 'Chưa có báo cáo', 'Mục này chưa có báo cáo được xuất bản.')}</div>`; else more();
  };

  /* ================= R02 · Tìm kiếm & Bộ lọc ================= */
  pages.search = () => {
    F.readerShell('research');
    const db = F.db(); const st = { q: F.param('q') || '', stream: F.param('s') || '', author: '', time: '', pdf: false };
    app().innerHTML = `<div class="page narrow"><div class="search-box mb-12">${I('search')}<input class="input" id="q" type="search" placeholder="Tìm báo cáo, chủ đề, chỉ số…" value="${F.esc(st.q)}" autocomplete="off" aria-label="Từ khóa" style="height:48px;border-radius:14px;background:#fff"></div>
      <div class="chipbar" style="position:static;margin:0 -16px 12px;padding:0 16px" id="streams">${[['', 'Tất cả'], ['fintech', 'Fintech'], ['macro', 'Vĩ mô'], ['micro', 'Vi mô']].map((c) => `<button class="chip ${st.stream === c[0] ? 'active' : ''}" data-s="${c[0]}">${c[1]}</button>`).join('')}<button class="chip" id="flt">${I('filter').replace('<svg', '<svg style="width:15px;height:15px"')}Bộ lọc<span id="fc"></span></button></div>
      <div id="indHits"></div><div class="row between mb-8"><span class="sub small" id="count"></span></div><div id="res"></div></div>`;
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
    const run = () => {
      const q = norm(st.q.trim());
      let list = F.published().filter((r) => (!st.stream || r.stream === st.stream) && (!st.author || r.author === st.author) && (!st.pdf || r.pdf) && (!st.time || Date.now() - new Date(r.publishedAt) < st.time * 864e5));
      if (q) list = list.filter((r) => norm([r.title, r.dek, r.tags.join(' '), F.expert(r.author).name, r.body.map((b) => b.x || '').join(' ')].join(' ')).includes(q));
      const inds = q ? db.indicators.filter((i) => norm(i.name + ' ' + i.syn.join(' ')).includes(q)).slice(0, 6) : [];
      const n = (st.author ? 1 : 0) + (st.time ? 1 : 0) + (st.pdf ? 1 : 0); $('#fc').textContent = n ? ` · ${n}` : ''; $('#flt').classList.toggle('active', !!n);
      $('#indHits').innerHTML = inds.length ? `${F.secHead('Chỉ số phù hợp')}<div class="hscroll mb-16">${inds.map(F.idxChip).join('')}</div>` : '';
      $('#count').textContent = `${list.length} báo cáo${q ? ` cho “${st.q.trim()}”` : ''}`;
      $('#res').innerHTML = list.length ? `<div class="list-card">${list.map((r) => F.reportRow(r)).join('')}</div>` : `<div class="card">${F.empty('search', 'Không tìm thấy báo cáo phù hợp', 'Thử từ khóa khác, bỏ bớt bộ lọc hoặc tìm theo tên chỉ số như “CPI”, “tỷ giá”.', `<button class="btn btn-secondary" id="clr">Xóa bộ lọc</button>`)}</div>`;
      const c = $('#clr'); if (c) c.onclick = () => { Object.assign(st, { q: '', stream: '', author: '', time: '', pdf: false }); $('#q').value = ''; $$('#streams [data-s]').forEach((x) => x.classList.toggle('active', x.dataset.s === '')); run(); };
    };
    let t; $('#q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { st.q = e.target.value; run(); }, 200); });
    $$('#streams [data-s]').forEach((b) => b.addEventListener('click', () => { st.stream = b.dataset.s; $$('#streams [data-s]').forEach((x) => x.classList.toggle('active', x === b)); run(); }));
    $('#flt').onclick = () => F.modal({ title: 'Bộ lọc', body: `<div class="stack"><div class="field"><label for="fa">Tác giả</label><select class="select" id="fa"><option value="">Mọi tác giả</option>${db.experts.map((e) => `<option value="${e.id}" ${st.author === e.id ? 'selected' : ''}>${F.esc(e.name)}</option>`).join('')}</select></div>
      <div class="field"><span class="label">Thời gian</span><div class="seg stretch" id="ft">${[['', 'Tất cả'], ['3', '3 ngày'], ['7', '7 ngày'], ['30', '30 ngày']].map((x) => `<button type="button" data-v="${x[0]}" class="${String(st.time || '') === x[0] ? 'active' : ''}">${x[1]}</button>`).join('')}</div></div>
      <label class="row between" style="padding:6px 0"><span>Chỉ báo cáo có bản PDF</span><span class="switch"><input type="checkbox" id="fp" ${st.pdf ? 'checked' : ''}><span></span></span></label></div>`,
      actions: [{ label: 'Đặt lại', onClick: () => { st.author = ''; st.time = ''; st.pdf = false; run(); } }, { label: 'Áp dụng', cls: 'btn-primary', onClick: (c, el) => { st.author = $('#fa', el).value; const a = $('#ft .active', el); st.time = a && a.dataset.v ? +a.dataset.v : ''; st.pdf = $('#fp', el).checked; run(); } }],
      onOpen: (el) => $$('#ft button', el).forEach((b) => (b.onclick = () => $$('#ft button', el).forEach((x) => x.classList.toggle('active', x === b)))) });
    run(); if (innerWidth >= 768) $('#q').focus();
  };

  /* ================= R03 · Chi tiết báo cáo ================= */
  pages.report = () => {
    F.readerShell('research');
    const r = F.report(F.param('id') || 'r5');
    if (!r || r.status !== 'published') { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('file', 'Báo cáo không tồn tại hoặc đã được gỡ', 'Báo cáo có thể đã được lưu trữ hoặc chưa được xuất bản.', `<a class="btn btn-primary" href="${F.url('reader/index.html')}">Về trang Nghiên cứu</a>`)}</div></div>`; return; }
    const nid = F.param('n'); if (nid) { const n = F.db().notifications.find((x) => x.id === nid); if (n) { n.read = true; F.save(); } }
    const e = F.expert(r.author); const me = F.me(); const locked = F.isLocked(r);
    const saved = me && me.bookmarks.includes(r.id); const links = F.linksOfReport(r.id);
    const related = F.published().filter((x) => x.id !== r.id && (x.stream === r.stream || F.linksOfReport(x.id).some((l) => links.some((m) => m.i === l.i)))).slice(0, 3);
    r.views = (r.views || 0) + 1; F.save();
    F.setTitle(F.STREAM[r.stream]);
    const acts = F.setActions(`<button class="icon-btn" id="shTop" aria-label="Chia sẻ">${I('share')}</button>`);
    app().innerHTML = `<div class="page"><div class="read-grid"><article style="min-width:0">
      <div class="art-cover">${F.cover(r)}</div>
      <div class="article-head"><div class="row wrap small" style="gap:6px">${F.streamBadge(r.stream)}${r.premium ? F.premiumBadge() : ''}${r.tags.map((t) => `<span class="badge">${F.esc(t)}</span>`).join('')}</div>
        <h1>${F.esc(r.title)}</h1><p class="dek">${F.esc(r.dek)}</p></div>
      <div class="byline" style="max-width:720px"><a class="row" style="color:inherit;gap:12px;flex:1;min-width:0" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'md')}<div style="min-width:0"><b>${F.esc(e.name)}</b> ${F.verifiedTag(e)}<div class="xs muted">${F.date(r.publishedAt)} · ${r.readTime} phút đọc · ${F.num(r.views)} lượt đọc</div></div></a></div>
      <div class="exec-summary" style="max-width:720px"><h4>Tóm tắt điều hành</h4><ul>${r.summary.map((x) => `<li>${F.esc(x)}</li>`).join('')}</ul></div>
      ${locked ? `<div class="paywall" style="max-width:720px"><div class="article">${F.renderBlocks(r, { to: 1, widgets: false })}</div><div class="article blurred" aria-hidden="true">${F.renderBlocks(r, { from: 1, to: 4, widgets: false })}</div>
        <div class="paywall-cta"><div class="lock">${I('lock')}</div><h3>Phần phân tích chuyên sâu dành cho hội viên Premium</h3><p>Mở khóa toàn văn, bảng số liệu, bản PDF và phản biện 1:1 không giới hạn.</p><div class="stack" style="gap:8px"><a class="btn btn-primary btn-block" href="${F.url('reader/pricing.html?r=' + r.id)}">${I('crown')}Xem gói Premium</a><a class="btn btn-secondary btn-block" href="${F.url('reader/checkout.html?plan=single&r=' + r.id)}">Mua lẻ báo cáo này</a></div>${me ? '' : `<p class="small mt-12">Đã là hội viên? <a href="${F.url('reader/login.html?next=' + encodeURIComponent(F.here()))}">Đăng nhập</a></p>`}</div></div>`
      : `<div class="article" id="art">${F.renderBlocks(r)}</div>
      <div class="alert info mt-16" style="max-width:720px">${I('quote')}<span><b>Mẹo:</b> bôi đen (nhấn giữ trên điện thoại) một đoạn văn hoặc số liệu để gửi câu hỏi phản biện riêng tới tác giả.</span></div>`}
      <div class="disclaimer"><b>Tuyên bố miễn trừ trách nhiệm.</b> Báo cáo được thực hiện cho mục đích nghiên cứu và thông tin, không phải là lời mời, khuyến nghị mua, bán hay nắm giữ bất kỳ tài sản tài chính nào. Quan điểm thuộc về tác giả tại thời điểm công bố. Số liệu trong prototype là minh họa. <a href="${F.url('reader/disclaimer.html')}">Xem đầy đủ</a></div>
      ${links.length ? `<section class="sec" style="max-width:720px">${F.secHead('Chỉ số trong bài')}<div class="hscroll">${links.filter((l, i, a) => a.findIndex((x) => x.i === l.i) === i).map((l) => F.idxChip(F.ind(l.i))).join('')}</div><div class="src-note">${I('sparkles')}<span>Liên kết tự động bởi Vertex AI khi xuất bản, đã được biên tập viên kiểm duyệt.</span></div></section>` : ''}
      ${related.length ? `<section class="sec" style="max-width:720px">${F.secHead('Báo cáo liên quan')}<div class="list-card">${related.map((x) => F.reportRow(x, { dek: false })).join('')}</div></section>` : ''}
      <div class="actionbar" role="toolbar" aria-label="Thao tác với báo cáo">
        <button class="btn btn-primary grow" id="askBtn">${I('message')}Hỏi tác giả</button>
        ${r.pdf ? `<a class="icon-btn" href="${F.url('reader/report-pdf.html?id=' + r.id)}" aria-label="Bản PDF" title="Bản PDF">${I('file')}</a>` : ''}
        <button class="icon-btn ${saved ? 'on' : ''}" id="bm" aria-label="${saved ? 'Bỏ lưu' : 'Lưu bài'}" title="${saved ? 'Bỏ lưu' : 'Lưu bài'}">${I(saved ? 'bookmarkFill' : 'bookmark')}</button>
        <button class="icon-btn" id="sh" aria-label="Chia sẻ" title="Chia sẻ">${I('share')}</button></div>
    </article>
    <aside class="aside-desk">
      <div class="card"><div class="card-head"><h3>Về tác giả</h3></div><a class="expert-chip" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'md')}<span><span class="nm">${F.esc(e.name)}</span><span class="tt" style="display:block">${F.esc(e.org)}</span></span></a><p class="small sub mt-12">${F.esc(e.bio.slice(0, 150))}…</p>${me ? `<div class="mt-16">${F.quotaBar()}</div>` : ''}</div>
      ${links.length ? `<div class="card"><div class="card-head"><h3>Chỉ số trong bài</h3></div><div class="mini-list">${links.filter((l, i, a) => a.findIndex((x) => x.i === l.i) === i).map((l) => F.miniRow(F.ind(l.i))).join('')}</div></div>` : ''}
    </aside></div></div>`;
    F.readProgress();
    if (!locked) {
      F.mountFigures(r, $('#art'));
      const h = location.hash.match(/^#p(\d+)$/); if (h) { const p = document.getElementById('p' + h[1]); if (p) { p.classList.add('hl-target'); setTimeout(() => p.scrollIntoView({ block: 'center' }), 100); setTimeout(() => p.classList.remove('hl-target'), 3500); } }
      setupSelection(r);
    }
    const bm = $('#bm');
    bm.onclick = () => { if (!F.requireAuth('Đăng nhập để lưu báo cáo và đọc lại trên mọi thiết bị.')) return; const m = F.me(); const i = m.bookmarks.indexOf(r.id); if (i >= 0) m.bookmarks.splice(i, 1); else m.bookmarks.unshift(r.id); F.save(); const on = i < 0; bm.innerHTML = I(on ? 'bookmarkFill' : 'bookmark'); bm.classList.toggle('on', on); F.toast(on ? 'Đã lưu vào Bài đã lưu' : 'Đã bỏ lưu'); };
    const share = () => { const url = location.origin + location.pathname + '?id=' + r.id; if (navigator.share && matchMedia('(pointer:coarse)').matches) navigator.share({ title: r.title, url }).catch(() => {}); else F.shareModal(r.title, url); };
    $('#sh').onclick = share; $('#shTop', acts).onclick = share;
    $('#askBtn').onclick = () => { if (locked) { F.toast('Mở khóa báo cáo để gửi phản biện về nội dung chuyên sâu.', 'info'); return; } const first = r.body.findIndex((b) => b.t === 'p'); F.openInquiry(r, r.summary[0], first); };
  };

  function setupSelection(r) {
    const art = $('#art'); let pop = null; const touch = matchMedia('(pointer:coarse)').matches;
    const clear = () => { if (pop) { pop.remove(); pop = null; } };
    const check = () => {
      const sel = window.getSelection(); const txt = sel ? sel.toString().trim().replace(/\s+/g, ' ') : '';
      if (!txt || txt.length < 12 || !sel.rangeCount) { clear(); return; }
      const range = sel.getRangeAt(0); const node = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
      if (!art.contains(node)) { clear(); return; }
      const blk = (node.closest('[data-b]') || range.startContainer.parentElement.closest('[data-b]')); const bi = blk ? +blk.dataset.b : 0;
      const quote = txt.length > 400 ? txt.slice(0, 400) + '…' : txt;
      clear(); pop = document.createElement('div');
      pop.innerHTML = `<button data-q>${I('quote')}Trích dẫn & Hỏi chuyên gia</button><button data-c class="hide-m">${I('copy')}Sao chép</button>`;
      if (touch) { pop.className = 'sel-fab'; pop.innerHTML = `<button class="btn btn-navy" data-q style="box-shadow:var(--shadow-3)">${I('quote')}Trích dẫn & Hỏi chuyên gia</button>`; document.body.appendChild(pop); }
      else { pop.className = 'sel-pop'; const rc = range.getBoundingClientRect(); pop.style.left = rc.left + rc.width / 2 + window.scrollX + 'px'; pop.style.top = rc.top + window.scrollY - 10 + 'px'; document.body.appendChild(pop); }
      pop.addEventListener('mousedown', (e) => e.preventDefault());
      $('[data-q]', pop).onclick = () => { clear(); F.openInquiry(r, quote, bi); };
      const c = $('[data-c]', pop); if (c) c.onclick = () => { try { navigator.clipboard.writeText(quote + ' — ' + r.title + ' (FBV)'); } catch (e) {} F.toast('Đã sao chép trích dẫn kèm nguồn'); clear(); };
    };
    document.addEventListener('mouseup', () => setTimeout(check, 10));
    document.addEventListener('selectionchange', () => { if (touch) { clearTimeout(window.__st); window.__st = setTimeout(check, 350); } });
    document.addEventListener('mousedown', (e) => { if (pop && !pop.contains(e.target)) clear(); });
    window.addEventListener('scroll', () => { if (pop && !touch) clear(); }, { passive: true });
  }


  /* ================= R04 · Trình xem PDF ================= */
  pages.reportPdf = () => {
    F.readerShell('research');
    const r = F.report(F.param('id') || 'r5');
    if (!r || r.status !== 'published' || !r.pdf) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('file', 'Không có bản PDF', 'Báo cáo này chưa có bản PDF đính kèm.', `<a class="btn btn-primary" href="${F.url('reader/index.html')}">Về trang Nghiên cứu</a>`)}</div></div>`; return; }
    if (F.isLocked(r)) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('lock', 'Bản PDF dành cho hội viên Premium', 'Nâng cấp để tải và đọc bản PDF đầy đủ của báo cáo.', `<a class="btn btn-primary" href="${F.url('reader/pricing.html?r=' + r.id)}">Xem gói Premium</a>`)}</div></div>`; return; }
    F.setTitle(r.title);
    F.setActions(`<a class="icon-btn" href="${F.url('assets/media/sample-report.pdf')}" download aria-label="Tải xuống">${I('download')}</a>`);
    let zoom = 100;
    app().innerHTML = `<div class="page" style="padding-top:12px"><div class="row between mb-12" style="gap:8px"><span class="xs muted" style="min-width:0">PDF · 5 trang · 77 KB · ${F.esc(F.expert(r.author).name)}</span><div class="row" style="gap:0;flex:none"><button class="icon-btn" id="zo" aria-label="Thu nhỏ">${I('zoomOut')}</button><span class="small num" id="zv" style="width:44px;text-align:center">100%</span><button class="icon-btn" id="zi" aria-label="Phóng to">${I('zoomIn')}</button></div></div>
      <div class="card" style="padding:0;overflow:hidden;background:#525659"><div id="pdfWrap" style="height:calc(100vh - 180px);min-height:420px;overflow:auto"><iframe title="Bản PDF báo cáo" src="${F.url('assets/media/sample-report.pdf')}#toolbar=0&view=FitH" style="width:100%;height:100%;border:0;background:#fff"></iframe></div></div>
      <p class="hint mt-12">Prototype nhúng trình xem PDF sẵn có của trình duyệt. Bản chính thức dùng pdf.js (web) và Native PDF Viewer (iOS/Android), có watermark theo tài khoản người đọc.</p></div>`;
    const set = () => { $('#zv').textContent = zoom + '%'; $('#pdfWrap iframe').style.width = zoom + '%'; $('#pdfWrap iframe').style.height = zoom + '%'; };
    $('#zi').onclick = () => { zoom = Math.min(200, zoom + 25); set(); }; $('#zo').onclick = () => { zoom = Math.max(50, zoom - 25); set(); };
  };

  /* ================= R06 · Hồ sơ chuyên gia ================= */
  pages.expert = () => {
    F.readerShell('research');
    const e = F.expert(F.param('id') || 'e1');
    if (!e) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('user', 'Không tìm thấy chuyên gia', 'Hồ sơ chuyên gia không tồn tại.', '')}</div></div>`; return; }
    F.setTitle(e.short);
    const me = F.me(); const list = F.published().filter((r) => r.author === e.id);
    const answered = F.db().inquiries.filter((q) => q.expert === e.id && ['answered', 'closed'].includes(q.status)).length;
    const following = me && me.follows.includes(e.id);
    app().innerHTML = `<div class="page narrow"><div class="card center" style="padding:24px 18px">
      <div style="display:flex;justify-content:center">${F.avatar(e, 'lg')}</div>
      <h1 class="mt-12" style="font-size:23px">${F.esc(e.name)}</h1><div class="mt-8">${e.verified ? F.verifiedTag(e) : '<span class="badge s-in_review">Đang chờ thẩm định huy hiệu</span>'}</div>
      <p class="sub small mt-8">${F.esc(e.title)} · ${F.esc(e.org)}</p><div class="chips mt-12" style="justify-content:center">${e.fields.map((f) => F.streamBadge(f)).join('')}</div>
      <div class="me-stats" style="margin-top:16px"><a href="#bai"><b class="num">${list.length}</b><span>Báo cáo</span></a><a><b class="num">${F.num(list.reduce((s, r) => s + (r.views || 0), 0))}</b><span>Lượt đọc</span></a><a><b class="num">${answered}</b><span>Đã trả lời</span></a></div>
      <button class="btn ${following ? 'btn-secondary' : 'btn-primary'} btn-block mt-16" id="fl">${following ? `${I('check')}Đang theo dõi` : `${I('plus')}Theo dõi`}</button><p class="hint mt-8">Nhận thông báo khi có báo cáo mới</p></div>
      <section class="sec"><div class="card"><h3 class="mb-8">Giới thiệu</h3><p class="sub" style="font-size:14.5px">${F.esc(e.bio)}</p>${e.verified ? `<div class="alert info mt-12">${F.verifiedIcon().replace('<svg', '<svg style="width:20px;height:20px;flex:none"')}<span><b>Verified by FBV:</b> học vị, đơn vị công tác và lĩnh vực chuyên môn đã được Hội đồng FBV thẩm định.</span></div>` : ''}</div></section>
      <section class="sec" id="bai">${F.secHead('Báo cáo của ' + F.esc(e.short))}${list.length ? `<div class="list-card">${list.map((r) => F.reportRow(r)).join('')}</div>` : `<div class="card">${F.empty('file', 'Chưa có báo cáo', 'Chuyên gia chưa xuất bản báo cáo nào.')}</div>`}</section></div>`;
    $('#fl').onclick = () => { if (!F.requireAuth('Đăng nhập để theo dõi chuyên gia và nhận thông báo báo cáo mới.')) return; const m = F.me(); const i = m.follows.indexOf(e.id); if (i >= 0) m.follows.splice(i, 1); else m.follows.push(e.id); F.save(); F.toast(i >= 0 ? 'Đã bỏ theo dõi' : 'Đã theo dõi ' + e.name); setTimeout(() => location.reload(), 500); };
  };

  const marketSeg = (cur) => `<nav class="seg-full" aria-label="Thị trường"><a href="${F.url('reader/market.html')}" class="${cur === 'market' ? 'active' : ''}">Chứng khoán</a><a href="${F.url('reader/macro.html')}" class="${cur === 'macro' ? 'active' : ''}">Vĩ mô & Tiền tệ</a></nav>`;

  /* ================= R07 · Thị trường chứng khoán ================= */
  pages.market = () => {
    F.readerShell('market');
    const mk = F.db().market; let cur = F.param('i') || 'VNINDEX'; let range = '1D'; let ex = 'HOSE';
    const upd = new Date(mk.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    app().innerHTML = `<div class="page">${marketSeg('market')}<p class="small muted mb-12">Cập nhật ${upd} · Trễ 15 phút · Số liệu minh họa</p>
      <div class="hscroll grid-d4 mb-16" id="idx">${['VNINDEX', 'VN30', 'HNX', 'UPCOM'].map((id) => F.indCard(F.ind(id), { data: true, active: id === cur, href: '#' })).join('')}</div>
      <div class="home-grid"><div class="stack-lg" style="min-width:0">
        <div class="card"><div class="row between wrap" style="gap:8px"><div class="row" style="gap:8px"><h3 id="cName"></h3><a class="small" id="cLink">Chi tiết ›</a></div></div><div class="row mt-8 wrap" style="gap:10px"><span class="big-val num" id="cVal"></span><span class="chg-pill num" id="cChg"></span></div>
          <div class="seg stretch mt-12 mb-8" id="rng">${['1D', '1W', '1M', '1Y'].map((x) => `<button class="${x === range ? 'active' : ''}" data-r="${x}">${x}</button>`).join('')}</div><div id="mainChart"></div>${F.srcNote('Nguồn: HOSE/HNX qua nhà cung cấp dữ liệu · Trễ 15 phút · Minh họa')}</div>
        <div class="card"><div class="card-head"><h3>Độ rộng thị trường</h3></div><div class="seg stretch mb-16" id="exs">${['HOSE', 'HNX', 'UPCOM'].map((x) => `<button class="${x === ex ? 'active' : ''}" data-x="${x}">${x === 'UPCOM' ? 'UPCoM' : x}</button>`).join('')}</div><div id="br"></div></div>
        <div class="card"><div class="card-head"><h3>Khối ngoại (HOSE)</h3><span class="small muted">tỷ đồng</span></div>
          <div class="me-stats" style="margin:0 0 14px"><a><span>Mua</span><b class="num">${F.num(mk.foreignToday.buy)}</b></a><a><span>Bán</span><b class="num">${F.num(mk.foreignToday.sell)}</b></a><a><span>Ròng</span><b class="num ${F.dir(mk.foreignToday.buy - mk.foreignToday.sell)}">${F.signed(mk.foreignToday.buy - mk.foreignToday.sell, 0)}</b></a></div>
          <div class="section-title" style="margin-bottom:4px">Giá trị ròng 10 phiên</div><div id="ffChart"></div><div class="legend mt-8"><span><i style="background:var(--mkt-up)"></i>Mua ròng</span><span><i style="background:var(--mkt-down)"></i>Bán ròng</span></div></div>
      </div>
      <div class="stack-lg"><div class="card"><div class="card-head"><h3>Phân tích từ FBV</h3></div><div id="rel"></div><div class="src-note">${I('sparkles')}<span>Báo cáo phân tích biến động của chỉ số đang chọn — liên kết bởi Vertex AI.</span></div></div></div></div></div>`;
    const draw = () => {
      const ind = F.ind(cur); const s = F.series(ind, range);
      const base = range === '1D' ? ind.prev : s.values[0]; const c = ind.value - base; const p = (c / base) * 100; const d = F.dir(c);
      $('#cName').textContent = ind.name; $('#cLink').href = F.url('reader/indicator.html?id=' + ind.id);
      $('#cVal').textContent = F.fmtVal(ind); $('#cChg').className = 'chg-pill num ' + d; $('#cChg').textContent = `${F.arrow(c)} ${F.signed(c, 2)} (${F.signed(p, 2)}%)`;
      F.chart.line($('#mainChart'), { labels: s.labels, values: s.values, dec: 2, ref: range === '1D' ? ind.prev : null, height: innerWidth < 768 ? 230 : 300, label: ind.name });
      const rel = F.reportsOfInd(cur);
      $('#rel').innerHTML = rel.length ? `<div class="mini-list">${rel.map((r) => `<a class="mini-row" href="${F.url('reader/report.html?id=' + r.id)}"><span class="n">${F.esc(r.title)}<small>${F.esc(F.expert(r.author).name)} · ${F.ago(r.publishedAt)}</small></span>${I('chevR').replace('<svg', '<svg style="width:18px;height:18px;flex:none;color:var(--text-3)"')}</a>`).join('')}</div>` : `<p class="small muted">Chưa có báo cáo liên kết với ${F.esc(ind.name)}.</p>`;
      $$('#idx .ind-card').forEach((a) => a.classList.toggle('active', a.dataset.ind === cur));
    };
    const drawBr = () => {
      const b = mk.breadth[ex]; const tot = b.up + b.down + b.flat;
      $('#br').innerHTML = `<div class="breadth" role="img" aria-label="Tăng ${b.up}, giảm ${b.down}, đứng giá ${b.flat}"><span style="width:${(b.up / tot) * 100}%;background:var(--mkt-up)"></span><span style="width:${(b.flat / tot) * 100}%;background:var(--mkt-ref)"></span><span style="width:${(b.down / tot) * 100}%;background:var(--mkt-down)"></span></div>
        <div class="breadth-legend"><span class="up num">▲ Tăng <b>${b.up}</b></span><span class="ref num">■ Đứng <b>${b.flat}</b></span><span class="down num">▼ Giảm <b>${b.down}</b></span></div>
        <div class="row mt-12 wrap" style="gap:16px"><span class="small num" style="color:var(--mkt-ceil)">● Trần <b>${b.ceil}</b></span><span class="small num" style="color:var(--mkt-floor)">● Sàn <b>${b.floor}</b></span><span class="small sub">GTGD <b class="num">${F.num(mk.liquidity[ex])}</b> tỷ đ</span></div>`;
    };
    $$('#idx .ind-card').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); cur = a.dataset.ind; history.replaceState(null, '', '?i=' + cur); draw(); }));
    $$('#rng button').forEach((b) => b.addEventListener('click', () => { range = b.dataset.r; $$('#rng button').forEach((x) => x.classList.toggle('active', x === b)); draw(); }));
    $$('#exs button').forEach((b) => b.addEventListener('click', () => { ex = b.dataset.x; $$('#exs button').forEach((x) => x.classList.toggle('active', x === b)); drawBr(); }));
    F.chart.bar($('#ffChart'), { labels: mk.foreign.labels, values: mk.foreign.values, dec: 0, mode: 'posneg', height: 190, signed: true, suffix: ' tỷ đ', label: 'Giá trị mua/bán ròng khối ngoại' });
    draw(); drawBr();
  };

  /* ================= R08 · Vĩ mô & Tiền tệ ================= */
  pages.macro = () => {
    F.readerShell('market');
    const rates = ['POLICY_RATE', 'ON_RATE', 'IB_1W', 'DEP_12M'].map(F.ind);
    const rowPlain = (i) => { const c = F.chg(i); return `<a class="mini-row" href="${F.url('reader/indicator.html?id=' + i.id)}"><span class="n">${F.esc(i.name)}<small>${F.esc(i.freq)}</small></span><span class="v num">${F.fmtVal(i)}<small class="${c.d}">${F.arrow(c.c)} ${F.signed(c.c, 2)} đ.%</small></span></a>`; };
    app().innerHTML = `<div class="page">${marketSeg('macro')}
      <div class="home-grid"><div style="min-width:0">
        <div class="card"><div class="card-head"><h3>LS qua đêm — 1 tháng</h3><a href="${F.url('reader/indicator.html?id=ON_RATE')}">Chi tiết</a></div><div id="onChart"></div>${F.srcNote('Nét đứt: lãi suất tái cấp vốn. Nguồn: NHNN — minh họa.')}</div>
        <section class="sec">${F.secHead('Tỷ giá & Hàng hóa')}<div class="list-card">${['USDVND', 'DXY', 'GOLD', 'BRENT', 'WTI'].map((id) => F.miniRow(F.ind(id))).join('')}</div></section>
        <section class="sec">${F.secHead('Chỉ tiêu kinh tế định kỳ')}<div class="ind-grid">${['GDP', 'CPI', 'FDI', 'IIP', 'TRADE_BAL', 'CREDIT'].map((id) => F.indCard(F.ind(id))).join('')}</div></section>
      </div>
      <div><section class="sec" style="margin-top:0">${F.secHead('Lãi suất')}<div class="list-card">${rates.map(rowPlain).join('')}</div></section></div></div>
      ${F.srcNote('Nguồn: NHNN, Cục Thống kê, Cục Hải quan, nhà cung cấp dữ liệu quốc tế · Số liệu minh họa.')}</div>`;
    const grid = $('.home-grid'); if (innerWidth < 1024) { const aside = grid.children[1]; grid.children[0].insertBefore(aside.firstElementChild, grid.children[0].children[1]); aside.remove(); $('.home-grid > div > section').style.marginTop = '24px'; }
    const on = F.ind('ON_RATE'); const s = F.series(on, '1M');
    F.chart.line($('#onChart'), { labels: s.labels, values: s.values, dec: 2, ref: F.ind('POLICY_RATE').value, refLabel: 'Tái cấp vốn', suffix: '%', height: innerWidth < 768 ? 210 : 260, color: '#1877F2', label: 'Lãi suất qua đêm' });
  };

  /* ================= R09 · Chi tiết chỉ số ================= */
  pages.indicator = () => {
    F.readerShell('market');
    const ind = F.ind(F.param('id') || 'VNINDEX');
    if (!ind) { app().innerHTML = `<div class="page narrow"><div class="card">${F.empty('chart', 'Không tìm thấy chỉ số', 'Mã chỉ số không tồn tại.', '')}</div></div>`; return; }
    const isEq = ind.group === 'equity'; const macro = ind.group === 'macro'; const ch = F.chg(ind); let range = isEq ? '1D' : '1M';
    F.setTitle(ind.name);
    const rel = F.reportsOfInd(ind.id); const peers = F.db().indicators.filter((x) => x.group === ind.group && x.id !== ind.id).slice(0, 5);
    app().innerHTML = `<div class="page"><div class="home-grid"><div class="stack-lg" style="min-width:0"><div class="card">
        <div class="row wrap" style="gap:8px"><span class="badge">${F.GROUP[ind.group]}</span><span class="xs muted">${ind.id}</span></div>
        <h1 class="mt-8" style="font-size:22px">${F.esc(ind.name)}</h1>
        <div class="row mt-8 wrap" style="gap:10px"><span class="big-val num">${F.fmtVal(ind)}</span><span class="small muted">${F.esc(F.unitLabel(ind))}</span></div>
        <div class="row mt-8 wrap" style="gap:8px"><span class="chg-pill num ${ch.d}" id="chgP"></span><span class="xs muted">${macro ? F.esc(ind.period) + ' · so với ' + F.esc(ind.prevLabel) : F.esc(ind.freq)}</span></div>
        ${macro ? '' : `<div class="seg stretch mt-16" id="rng">${['1D', '1W', '1M', '1Y'].map((x) => `<button class="${x === range ? 'active' : ''}" data-r="${x}">${x}</button>`).join('')}</div>`}
        <div id="ch" class="mt-12"></div>${F.srcNote('Nguồn: ' + F.esc(ind.source) + ' · Minh họa')}</div>
        <div class="card"><div class="card-head"><h3>Thống kê</h3></div><div class="ind-grid" id="stats"></div></div>
        <section><div class="sec-head"><h2>Phân tích từ FBV</h2><span class="badge" style="background:var(--primary-50);color:var(--primary-700)">${I('sparkles').replace('<svg', '<svg style="width:13px;height:13px"')} Vertex AI</span></div>
          ${rel.length ? `<div class="list-card">${rel.map((r) => F.reportRow(r, { dek: false })).join('')}</div>` : `<div class="card">${F.empty('file', 'Chưa có phân tích', 'Chưa có báo cáo nào của FBV được liên kết với chỉ số này.')}</div>`}
          <div class="src-note">${I('info')}<span>Vertex AI đề xuất liên kết giữa nội dung báo cáo và danh mục chỉ số khi xuất bản; biên tập viên kiểm duyệt trước khi hiển thị.</span></div></section>
      </div>
      <div class="stack-lg"><div class="card"><div class="card-head"><h3>Thông tin chỉ số</h3></div><div class="stack small"><div class="row between"><span class="muted">Mã</span><b>${ind.id}</b></div><div class="row between"><span class="muted">Đơn vị</span><span>${F.esc(ind.unit)}</span></div><div class="row between" style="gap:12px"><span class="muted">Tần suất</span><span style="text-align:right">${F.esc(ind.freq)}</span></div><div class="row between" style="gap:12px"><span class="muted">Nguồn</span><span style="text-align:right">${F.esc(ind.source)}</span></div></div></div>
        ${peers.length ? `<div class="card"><div class="card-head"><h3>Cùng nhóm</h3></div><div class="mini-list">${peers.map(F.miniRow).join('')}</div></div>` : ''}</div></div></div>`;
    const stat = (x) => `<div class="card tight" style="border-radius:12px;background:var(--surface-2)"><div class="xs muted">${x[0]}</div><div class="num" style="font-weight:700;font-size:17px">${x[1]}</div></div>`;
    const draw = () => {
      const h = innerWidth < 768 ? 230 : 300;
      if (macro) {
        const s = ind.series; F.chart.bar($('#ch'), { labels: s.labels, values: s.values, dec: ind.dec, highlightLast: true, color: '#9DBEEB', height: h, suffix: ind.unit.startsWith('%') ? '%' : ' ' + ind.unit, label: ind.name, mode: s.values.some((v) => v < 0) ? 'posneg' : '' });
        const v = s.values; const avg = v.reduce((a, b) => a + b, 0) / v.length;
        $('#chgP').textContent = `${F.arrow(ch.c)} ${F.signed(ch.c, ind.dec)} so với kỳ trước`;
        $('#stats').innerHTML = [['Kỳ gần nhất', F.num(ind.value, ind.dec)], ['Kỳ trước', F.num(ind.prev, ind.dec)], ['TB ' + v.length + ' kỳ', F.num(avg, ind.dec)], ['Cao nhất', F.num(Math.max(...v), ind.dec)], ['Thấp nhất', F.num(Math.min(...v), ind.dec)]].map(stat).join('');
      } else {
        const s = F.series(ind, range); const base = range === '1D' ? ind.prev : s.values[0]; const c = ind.value - base; const d = F.dir(c);
        $('#chgP').className = 'chg-pill num ' + d; $('#chgP').textContent = `${F.arrow(c)} ${F.signed(c, ind.dec)} (${F.signed((c / base) * 100, 2)}%) · ${range}`;
        F.chart.line($('#ch'), { labels: s.labels, values: s.values, dec: Math.max(ind.dec, ind.group === 'rate' ? 2 : ind.dec), ref: range === '1D' ? ind.prev : null, height: h, suffix: ind.unit === '%' ? '%' : '', label: ind.name });
        const v = s.values; const y1 = F.series(ind, '1Y').values;
        $('#stats').innerHTML = [[range === '1D' ? 'Tham chiếu' : 'Đầu kỳ', F.num(base, ind.dec)], ['Cao nhất ' + range, F.num(Math.max(...v), ind.dec)], ['Thấp nhất ' + range, F.num(Math.min(...v), ind.dec)], ['Thay đổi 1 năm', F.signed(((ind.value - y1[0]) / y1[0]) * 100, 2) + '%'], ['Cao nhất 52 tuần', F.num(Math.max(...y1), ind.dec)]].map(stat).join('');
      }
    };
    $$('#rng button').forEach((b) => b.addEventListener('click', () => { range = b.dataset.r; $$('#rng button').forEach((x) => x.classList.toggle('active', x === b)); draw(); }));
    draw();
  };
})();
