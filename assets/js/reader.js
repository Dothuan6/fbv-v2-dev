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
    const used = new Set(); const tx = (x) => (opts.terms && F.linkTerms ? F.linkTerms(F.esc(x), used) : F.esc(x));
    return blocks.map((b, k) => {
      const i = k + (opts.from || 0); let h = '';
      if (b.t === 'p') h = `<p data-b="${i}" id="p${i}">${tx(b.x)}</p>`;
      else if (b.t === 'h') h = `<h2 data-b="${i}" id="h${i}">${F.esc(b.x)}</h2>`;
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
        ${F.kbIndicatorLinks ? F.kbIndicatorLinks(ind) : ''}
        <section><div class="sec-head"><h2>Tài liệu phân tích</h2><span class="badge" style="background:var(--primary-50);color:var(--primary-700)">${I('sparkles').replace('<svg', '<svg style="width:13px;height:13px"')} Vertex AI</span></div>
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
