/* =========================================================
   FBV v3.1 — KHÔNG GIAN LÀM VIỆC (theo vai trò) · ĐĂNG KÝ CHUYÊN GIA
   W01 Không gian làm việc · A10 Đăng ký chuyên gia (nộp hồ sơ → Admin duyệt)
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = F.$, $$ = F.$$; const I = F.icon;
  const now = () => new Date().toISOString();
  const openCms = (path) => { F.session().cmsRole = 'expert'; F.save(); F.go(path); };
  document.addEventListener('click', (e) => { const a = e.target.closest('[data-cms]'); if (a) { e.preventDefault(); openCms(a.dataset.cms); } });

  /* ---------- Ghi chú (dùng trong bài nghiên cứu) ---------- */
  F.addNote = (r, quote, after) => {
    if (!F.requireAuth('Đăng nhập để lưu ghi chú nghiên cứu vào Không gian làm việc.')) return;
    F.modal({ title: 'Thêm ghi chú', body: `<div class="stack">${quote ? `<div class="quote-card">“${F.esc(quote)}”<small>${F.esc(r.title)}</small></div>` : `<p class="muted small">${F.esc(r.title)}</p>`}<div class="field"><label for="ntx">Ghi chú của bạn</label><textarea class="textarea" id="ntx" maxlength="1000" placeholder="Ý tưởng, câu hỏi, việc cần kiểm chứng…"></textarea></div><p class="hint">Ghi chú chỉ mình bạn xem, lưu trong Nhật ký nghiên cứu và đồng bộ trên mọi thiết bị.</p></div>`,
      actions: [{ label: 'Hủy' }, { label: 'Lưu ghi chú', cls: 'btn-primary', onClick: (c, el) => { const x = $('#ntx', el).value.trim(); if (!x) { $('#ntx', el).classList.add('invalid'); return false; } F.me().notes.unshift({ id: F.uid('nt'), r: r.id, quote: quote || '', x, at: now() }); F.save(); F.toast('Đã lưu vào Nhật ký nghiên cứu'); after && after(); } }] });
  };
  /* ---------- Theo dõi / ghim chỉ số ---------- */
  F.toggleWatch = (id) => { if (!F.requireAuth('Đăng nhập để theo dõi chỉ số trong Không gian làm việc.')) return null; const w = F.me().watch; const i = w.indexOf(id); if (i > -1) w.splice(i, 1); else w.push(id); F.save(); F.toast(i > -1 ? 'Đã bỏ theo dõi' : 'Đã thêm vào danh mục theo dõi', i > -1 ? 'info' : 'success'); return i < 0; };
  F.togglePin = (id, range) => { if (!F.requireAuth('Đăng nhập để ghim biểu đồ vào Không gian làm việc.')) return null; const p = F.me().pins; const i = p.findIndex((x) => x.i === id); if (i > -1) p.splice(i, 1); else p.unshift({ i: id, r: range || (F.ind(id).group === 'macro' ? '' : '1M') }); F.save(); F.toast(i > -1 ? 'Đã bỏ ghim' : 'Đã ghim biểu đồ vào Không gian làm việc', i > -1 ? 'info' : 'success'); return i < 0; };

  const kpi = (icon, label, val, sub, cls) => `<div class="mtile"><span class="n row" style="min-height:0;gap:6px">${I(icon, 'i-xs')}${label}</span><span class="v num ${cls || ''}">${val}</span><span class="p">${sub}</span></div>`;
  const secH = (t, right) => `<div class="sec" style="padding-left:0;padding-right:0"><h2>${t}</h2>${right || ''}</div>`;

  /* ================= W01 · Không gian làm việc ================= */
  pages.workspace = () => {
    const v = F.shell({ tab: 'workspace', bar: 'root', rootTitle: '' }); const me = F.me();
    v.innerHTML = `<h1 class="large-title">Không gian làm việc</h1><div id="wv"></div>`;
    if (!me) { $('#wv').innerHTML = F.gate('briefcase', 'Không gian làm việc của bạn', 'Theo dõi chỉ số, ghim biểu đồ, lưu ghi chú nghiên cứu và quản lý bài nghiên cứu (với chuyên gia) — tất cả ở một nơi.'); return; }
    const isExp = me.type === 'expert'; const ex = F.myExpert();
    let tab = F.param('t') || (isExp ? 'expert' : 'me');
    const draw = () => {
      const head = `<div class="page"><div class="ws-id">${F.avatar(me, 'md')}<div class="grow"><b>${F.esc(me.name)}</b><div class="row wrap" style="gap:6px;margin-top:4px">${isExp ? `<span class="verified-pill">${F.vb(ex)}Chuyên gia · Verified by FBV</span>` : `<span class="tag">${I('user', 'i-xs')}Tài khoản thường</span>`}${F.hasSub() ? `<span class="tag prem">${I('crown', 'i-xs')}Premium</span>` : ''}</div></div></div></div>`;
      const tabs = isExp ? `<div class="utabs mt-12" id="tb">${[['expert', 'Chuyên gia'], ['me', 'Cá nhân']].map((t) => `<button class="${tab === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>` : '';
      $('#wv').innerHTML = head + tabs + `<div class="page" id="wb"></div>`;
      $$('#tb [data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; history.replaceState(null, '', '?t=' + tab); draw(); }));
      if (isExp && tab === 'expert') expertWs(ex); else personalWs();
    };
    /* ---- Chuyên gia ---- */
    const expertWs = (ex) => {
      const D = F.db(); const mine = D.reports.filter((r) => r.author === ex.id); const pub = mine.filter((r) => r.status === 'published');
      const inq = D.inquiries.filter((q) => q.expert === ex.id && ['new', 'assigned', 'in_progress'].includes(q.status)).sort((a, b) => new Date(a.slaDue) - new Date(b.slaDue));
      const late = inq.filter((q) => new Date(q.slaDue) < Date.now()).length;
      const views = pub.reduce((s, r) => s + (r.views || 0), 0);
      const ST = [['all', 'Tất cả'], ['draft', 'Nháp'], ['review', 'Đang duyệt'], ['changes_requested', 'Cần sửa'], ['published', 'Đã xuất bản']];
      let f = 'all';
      const creds = (ex.degrees || []).length + (ex.certs || []).length; const verified = [...(ex.degrees || []), ...(ex.certs || [])].filter((x) => x.verified).length;
      const html = () => {
        const list = mine.filter((r) => f === 'all' || (f === 'review' ? ['in_review', 'pending_approval', 'scheduled'].includes(r.status) : r.status === f)).sort((a, b) => new Date(b.updatedAt || b.submittedAt || b.publishedAt || 0) - new Date(a.updatedAt || a.submittedAt || a.publishedAt || 0));
        $('#wb').innerHTML = `<div class="mgrid mt-16" style="grid-template-columns:1fr 1fr">${kpi('file', 'Bài đã xuất bản', pub.length, mine.length - pub.length + ' bài đang xử lý')}${kpi('eye', 'Lượt đọc', F.compact(views), 'Tổng các bài đã xuất bản')}${kpi('users', 'Người theo dõi', F.compact(F.followers(ex.id)), '+38 trong 30 ngày')}${kpi('chat', 'Phản biện chờ trả lời', inq.length, late ? late + ' phiên quá SLA 72 giờ' : 'Đúng hạn', late ? 'down' : '')}</div>
          ${secH('Bài nghiên cứu của tôi', `<a href="#" data-cms="cms/editor.html">${I('plus', 'i-xs')} Viết bài mới</a>`)}
          <div class="chips" id="sf">${ST.map((x) => `<button class="chip ${f === x[0] ? 'on' : ''}" data-f="${x[0]}">${x[1]}</button>`).join('')}</div>
          <div class="group mt-12">${list.length ? list.map((r) => { const href = r.status === 'published' ? F.url('reader/report.html?id=' + r.id) : '#'; return `<a class="gi noicon" href="${href}" ${r.status === 'published' ? '' : `data-cms="cms/editor.html?id=${r.id}"`}><span class="gl" style="font-weight:600">${F.esc(r.title || '(Chưa có tiêu đề)')}<small>${F.STREAM_S[r.stream]} · ${r.status === 'published' ? F.compact(r.views) + ' lượt đọc · ' + F.ago(r.publishedAt) : 'Cập nhật ' + F.ago(r.updatedAt || r.submittedAt || now())}</small></span>${F.statusBadge(r.status)}</a>`; }).join('') : `<div class="gi noicon"><span class="gl muted" style="font-weight:500">Không có bài ở trạng thái này.</span></div>`}</div>
          <p class="hint mt-8">Soạn thảo và gửi thẩm định trên CMS web (tối ưu cho máy tính). Quy trình: Soạn thảo → FBV Review → Phê duyệt xuất bản.</p>
          ${secH('Hộp phản biện', `<a href="#" data-cms="cms/inquiries.html">Mở tất cả</a>`)}
          <div class="group">${inq.length ? inq.slice(0, 4).map((q) => { const h = (new Date(q.slaDue) - Date.now()) / 36e5; const u = F.user(q.reader); return `<a class="gi" href="#" data-cms="cms/inquiry.html?id=${q.id}">${F.avatar(u, 'sm')}<span class="gl" style="font-weight:600">${F.esc(u.name)}<small class="ellipsis">“${F.esc(q.quote)}”</small></span><span class="tag ${h < 0 ? 'bad' : h < 24 ? 'warn' : 'ok'}">${h < 0 ? 'Quá ' + Math.ceil(-h) + 'h' : 'Còn ' + Math.ceil(h) + 'h'}</span></a>`; }).join('') : `<div class="gi noicon"><span class="gl muted" style="font-weight:500">Không có phiên nào chờ trả lời.</span></div>`}</div>
          ${secH('Hồ sơ chuyên gia')}
          <div class="panel"><div class="row"><span class="grow"><b>Hồ sơ hoàn thiện ${Math.round((verified / Math.max(1, creds)) * 100)}%</b><div class="small muted mt-4">${(ex.degrees || []).length} học vị · ${(ex.certs || []).length} chứng chỉ · ${verified}/${creds} đã xác minh</div></span>${ex.verified ? `<span class="verified-pill">${F.vb(ex)}Verified</span>` : '<span class="tag warn">Chờ xác minh</span>'}</div>
            <div class="quota mt-12"><span class="bar"><i style="width:${Math.round((verified / Math.max(1, creds)) * 100)}%"></i></span></div>
            <div class="row mt-12" style="gap:8px"><a class="btn btn-gray btn-sm grow" href="${F.url('reader/expert.html?id=' + ex.id)}">Xem hồ sơ công khai</a><a class="btn btn-gray btn-sm grow" href="${F.url('reader/expert-apply.html?mode=update')}">Bổ sung chứng chỉ</a><button class="btn btn-gray btn-sm btn-icon" id="wqr" aria-label="Mã QR hồ sơ">${I('qr')}</button></div></div>`;
        $$('#sf [data-f]').forEach((b) => (b.onclick = () => { f = b.dataset.f; html(); }));
        const wq = $('#wqr'); if (wq) wq.onclick = () => F.qrExpert(ex);
      };
      html();
    };
    /* ---- Cá nhân (mọi tài khoản) ---- */
    const personalWs = () => {
      const app = F.myApplication();
      const watch = me.watch.map(F.ind).filter(Boolean); const notes = me.notes; const openQ = F.db().inquiries.filter((q) => q.reader === me.id && ['new', 'assigned', 'in_progress', 'answered'].includes(q.status)).length;
      $('#wb').innerHTML = `${me.type === 'expert' ? '' : app ? `<a class="note ${app.status === 'need_info' ? 'warn' : app.status === 'rejected' ? 'bad' : 'accent'} mt-16" href="${F.url('reader/expert-apply.html')}">${I('award')}<span class="grow"><b>Hồ sơ chuyên gia: ${F.APP_STATUS[app.status]}</b><br>${app.status === 'need_info' ? 'FBV cần bạn bổ sung hồ sơ.' : 'Nộp ' + F.ago(app.createdAt) + ' · Xem tiến độ thẩm định'}</span>${I('chevR', 'i-sm')}</a>`
          : `<a class="ws-cta mt-16" href="${F.url('reader/expert-apply.html')}"><span class="ic">${I('award')}</span><span class="grow"><b>Trở thành chuyên gia FBV</b><small>Nộp hồ sơ, bằng cấp và chứng chỉ để xuất bản bài nghiên cứu và nhận huy hiệu Verified by FBV.</small></span>${I('chevR', 'i-sm')}</a>`}
        ${secH('Danh mục theo dõi', `<a href="#" id="ew">Sửa</a>`)}
        ${watch.length ? `<div class="group">${watch.map((i) => F.irow(i, { short: true })).join('')}</div>` : `<div class="panel muted small">Chưa theo dõi chỉ số nào. Bấm “Sửa” hoặc nút “Theo dõi” trên trang chỉ số.</div>`}
        <div class="delay-note" style="padding:8px 4px 0">${I('clock')}Dữ liệu thu thập qua vnstock · trễ tối thiểu 15 phút</div>
        ${secH('Biểu đồ đã ghim', `<a href="#" id="ap">${I('plus', 'i-xs')} Ghim</a>`)}
        <div class="stack" id="pins">${me.pins.length ? me.pins.map((p, k) => { const i = F.ind(p.i); const ch = F.chg(i); return `<div class="cc"><div class="cc-h"><span class="cc-t grow">${F.esc(i.name)}</span><button class="icon-btn sm" data-up="${k}" aria-label="Bỏ ghim">${I('x')}</button></div><div class="cc-v"><b class="num">${F.fmtVal(i)}</b><span class="chg-pill ${ch.d} num">${F.arrow(ch.c)} ${F.chgText(i)}</span></div>${i.group === 'macro' ? '' : `<div class="seg mt-8" data-pr="${k}">${['1D', '1W', '1M', '1Y'].map((x) => `<button class="${p.r === x ? 'on' : ''}" data-r="${x}">${x}</button>`).join('')}</div>`}<div class="cc-chart" data-pin="${k}"></div></div>`; }).join('') : `<div class="panel muted small">Ghim biểu đồ từ trang chỉ số để xem nhanh tại đây.</div>`}</div>
        ${secH('Nhật ký nghiên cứu', `<a href="${F.url('reader/journal.html')}">Mở nhật ký · ${notes.length}</a>`)}
        ${F.journalPreview ? F.journalPreview(notes.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 3)) : ''}
        ${secH('Thư viện & hoạt động')}
        <div class="group"><a class="gi" href="${F.url('reader/bookmarks.html')}">${I('bookmark')}<span class="gl">Bài nghiên cứu đã lưu</span><span class="gv">${me.bookmarks.length}</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/bookmarks.html?t=following')}">${I('users')}<span class="gl">Chuyên gia đang theo dõi</span><span class="gv">${me.follows.length}</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/bookmarks.html?t=history')}">${I('history')}<span class="gl">Đã đọc</span><span class="gv">${me.history.length}</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/inquiries.html')}">${I('chat')}<span class="gl">Phản biện đang mở</span><span class="gv">${openQ}</span>${I('chevR', 'chev')}</a><a class="gi" href="${F.url('reader/assistant.html')}">${I('sparkles')}<span class="gl">Trợ lý nghiên cứu</span><span class="gv">Beta</span>${I('chevR', 'chev')}</a></div>`;
      $$('[data-pin]').forEach((el) => { const p = me.pins[+el.dataset.pin]; const i = F.ind(p.i); if (i.group === 'macro') F.chart.bar(el, { labels: i.series.labels, values: i.series.values, dec: i.dec, height: 150, highlightLast: true, mode: i.series.values.some((x) => x < 0) ? 'posneg' : '', label: i.name }); else { const s = F.series(i, p.r || '1M'); F.chart.line(el, { labels: s.labels, values: s.values, dec: i.dec, height: 150, ref: p.r === '1D' ? i.prev : null, label: i.name }); } });
      $$('[data-pr]').forEach((g) => $$('[data-r]', g).forEach((b) => (b.onclick = () => { me.pins[+g.dataset.pr].r = b.dataset.r; F.save(); personalWs(); })));
      $$('[data-up]').forEach((b) => (b.onclick = () => { me.pins.splice(+b.dataset.up, 1); F.save(); personalWs(); F.toast('Đã bỏ ghim', 'info'); }));
      $$('[data-dn]').forEach((b) => (b.onclick = () => F.confirm('Xóa ghi chú?', 'Ghi chú sẽ bị xóa khỏi Nhật ký nghiên cứu.', 'Xóa', 'btn-danger', () => { me.notes = me.notes.filter((n) => n.id !== b.dataset.dn); F.save(); personalWs(); })));
      const pick = (title, sel, onSave, multi) => F.modal({ title, body: `<div class="group">${F.db().indicators.map((i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${F.esc(i.name)}<small>${F.GROUP[i.group]}</small></span><input type="${multi ? 'checkbox' : 'radio'}" name="pk" value="${i.id}" ${sel.includes(i.id) ? 'checked' : ''}></label>`).join('')}</div>`, actions: [{ label: 'Hủy' }, { label: 'Lưu', cls: 'btn-primary', onClick: (c, el) => { onSave($$('input[name=pk]:checked', el).map((x) => x.value)); } }] });
      $('#ew').onclick = (e) => { e.preventDefault(); pick('Danh mục theo dõi', me.watch, (ids) => { me.watch = ids; F.save(); personalWs(); F.toast('Đã cập nhật danh mục theo dõi'); }, true); };
      $('#ap').onclick = (e) => { e.preventDefault(); pick('Ghim biểu đồ', [], (ids) => { if (ids[0] && !me.pins.some((p) => p.i === ids[0])) { me.pins.unshift({ i: ids[0], r: F.ind(ids[0]).group === 'macro' ? '' : '1M' }); F.save(); personalWs(); F.toast('Đã ghim biểu đồ'); } }, false); };
    };
    draw();
  };

  /* ================= A10 · Đăng ký chuyên gia ================= */
  const DEG = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Phó Giáo sư', 'Giáo sư'];
  const CERTS = ['CFA', 'ACCA', 'CPA', 'FRM', 'CFP', 'CMA', 'CCHN chứng khoán (UBCKNN)', 'CCHN thẩm định giá'];
  const STEPS = ['Thông tin', 'Học vị', 'Chứng chỉ', 'Kinh nghiệm', 'Cam kết'];
  pages.expertApply = () => {
    const me = F.me();
    const v = F.shell({ side: 'workspace', bar: 'back', back: 'reader/workspace.html', notab: true, title: 'Đăng ký chuyên gia' });
    if (!me) { v.innerHTML = F.gate('award', 'Đăng ký trở thành chuyên gia', 'Đăng nhập bằng tài khoản thường, sau đó nộp hồ sơ để FBV thẩm định.'); return; }
    const D = F.db(); D.applications = D.applications || [];
    let app = F.myApplication(); const mode = F.param('mode');
    if (me.type === 'expert' && mode !== 'update') { v.innerHTML = `<div class="page">${F.empty('award', 'Bạn đã là chuyên gia FBV', 'Tài khoản của bạn đã được xác minh. Quản lý bài nghiên cứu và phản biện trong Không gian làm việc.', `<a class="btn btn-primary" href="${F.url('reader/workspace.html')}">Mở Không gian làm việc</a>`)}</div>`; return; }
    if (me.type === 'expert' && mode === 'update') { v.innerHTML = `<div class="page stack" style="padding-top:12px"><div class="note accent">${I('info')}<span>Bổ sung học vị/chứng chỉ mới sẽ được FBV Review xác minh trước khi hiển thị trên hồ sơ công khai.</span></div><button class="btn btn-primary btn-block" id="up">${I('upload')}Tải lên chứng chỉ mới (mô phỏng)</button></div>`; $('#up').onclick = () => F.toast('Đã gửi chứng chỉ mới để xác minh'); return; }
    // Màn trạng thái
    if (app && app.status !== 'draft' && F.param('edit') !== '1') {
      const steps = [['submitted', 'Đã nộp hồ sơ'], ['reviewing', 'FBV Review thẩm định'], ['approved', 'Cấp vai trò chuyên gia & Verified']];
      const idx = { submitted: 0, reviewing: 1, need_info: 1, approved: 2, rejected: 1 }[app.status];
      v.innerHTML = `<div class="page stack lg" style="padding-top:8px"><div class="ob-head" style="padding:0">${F.logoMark()}<h1>Hồ sơ chuyên gia</h1><p>Trạng thái: <b style="color:var(--text)">${F.APP_STATUS[app.status]}</b> · nộp ${F.ago(app.createdAt)}</p></div>
        ${app.status === 'need_info' ? `<div class="note warn">${I('alert')}<span><b>FBV cần bổ sung:</b> ${F.esc(app.note || '')}</span></div>` : app.status === 'rejected' ? `<div class="note bad">${I('xCircle')}<span><b>Hồ sơ chưa được duyệt:</b> ${F.esc(app.note || '')}</span></div>` : app.status === 'approved' ? `<div class="note ok">${I('checkCircle')}<span>Hồ sơ đã được duyệt. Tài khoản của bạn đã chuyển thành <b>Chuyên gia</b>.</span></div>` : `<div class="note accent">${I('clock')}<span>Thời gian thẩm định dự kiến 3–5 ngày làm việc. FBV có thể liên hệ đơn vị cấp bằng/chứng chỉ để xác minh.</span></div>`}
        <div class="timeline-v">${steps.map((s, k) => `<div class="tv ${k <= idx ? 'on' : ''}"><span class="d">${k < idx || app.status === 'approved' ? I('check') : k + 1}</span><div><b>${s[1]}</b>${k === idx && app.status !== 'approved' ? `<small>${F.APP_STATUS[app.status]}</small>` : ''}</div></div>`).join('')}</div>
        <div><div class="group-title">Tóm tắt hồ sơ</div><div class="group plain"><div class="gi noicon"><span class="gl">Chức danh</span><span class="gv">${F.esc(app.title)}</span></div><div class="gi noicon"><span class="gl">Đơn vị</span><span class="gv">${F.esc(app.org)}</span></div><div class="gi noicon"><span class="gl">Học vị</span><span class="gv">${app.degrees.length}</span></div><div class="gi noicon"><span class="gl">Chứng chỉ</span><span class="gv">${app.certs.length}</span></div></div></div>
        <div><div class="group-title">Lịch sử</div><div class="group plain">${app.log.map((l) => `<div class="gi noicon"><span class="gl" style="font-weight:500">${F.esc(l.x)}</span><span class="gv">${F.date(l.at, true)}</span></div>`).join('')}</div></div>
        ${['need_info', 'rejected'].includes(app.status) ? `<a class="btn btn-primary btn-pill btn-block" href="${F.url('reader/expert-apply.html?edit=1')}">${app.status === 'need_info' ? 'Bổ sung hồ sơ' : 'Nộp lại hồ sơ'}</a>` : app.status === 'approved' ? `<a class="btn btn-primary btn-pill btn-block" href="${F.url('reader/workspace.html')}">Mở Không gian làm việc</a>` : ''}</div>`;
      return;
    }
    // Form nhiều bước
    const f = app ? JSON.parse(JSON.stringify(app)) : { id: F.uid('ap'), uid: me.id, name: me.name, email: me.email, phone: '', title: '', org: '', fields: me.interests.slice(), bio: '', degrees: [], certs: [], exp: [], links: [], sample: '', coi: false, status: 'draft', createdAt: now(), log: [] };
    let step = 0;
    const saveDraft = () => { const i = D.applications.findIndex((a) => a.id === f.id); const keep = app && app.status !== 'draft' ? app.status : 'draft'; const rec = Object.assign({}, f, { status: keep }); if (i > -1) D.applications[i] = rec; else D.applications.push(rec); app = rec; F.save(); };
    const draw = () => {
      let body = '';
      if (step === 0) body = `<div class="stack"><div class="field"><label for="a_nm">Họ tên & học hàm (hiển thị công khai)</label><input class="input" id="a_nm" value="${F.esc(f.name)}" placeholder="VD: TS. Nguyễn Văn A"></div>
        <div class="field"><label for="a_tt">Chức danh chuyên môn</label><input class="input" id="a_tt" value="${F.esc(f.title)}" placeholder="VD: Chuyên gia phân tích ngành Ngân hàng"></div>
        <div class="field"><label for="a_og">Đơn vị công tác</label><input class="input" id="a_og" value="${F.esc(f.org)}" placeholder="Trường/viện/doanh nghiệp"></div>
        <div class="field"><label for="a_ph">Số điện thoại liên hệ</label><input class="input" id="a_ph" inputmode="tel" value="${F.esc(f.phone)}"></div>
        <div class="field"><label>Email</label><input class="input" value="${F.esc(f.email)}" readonly></div>
        <div class="field"><span class="label">Lĩnh vực chuyên môn</span><div class="chips" style="flex-wrap:wrap">${Object.entries(F.STREAM).map(([k, n]) => `<button class="chip ${f.fields.includes(k) ? 'on' : ''}" data-fd="${k}">${n}</button>`).join('')}</div></div></div>`;
      else if (step === 1) body = `<p class="muted small mb-12">Khai báo học vị cao nhất và các bằng liên quan. Tải bản scan/ảnh chụp để FBV xác minh.</p>${listBox(f.degrees, (d) => `<b>${F.esc(d.name)}</b><small>${F.esc(d.school)} · ${d.year}${d.file ? ' · ' + F.esc(d.file) : ''}</small>`, 'deg')}<button class="btn btn-gray btn-block mt-12" id="addDeg">${I('plus')}Thêm học vị / bằng cấp</button>`;
      else if (step === 2) body = `<p class="muted small mb-12">Chứng chỉ hành nghề hoặc chuyên môn quốc tế (professional qualification). Không bắt buộc nhưng giúp hồ sơ được duyệt nhanh hơn.</p>${listBox(f.certs, (d) => `<b>${F.esc(d.name)}</b><small>${F.esc(d.issuer)} · Số ${F.esc(d.no || '—')} · ${d.year}</small>`, 'cert')}<button class="btn btn-gray btn-block mt-12" id="addCert">${I('plus')}Thêm chứng chỉ</button>`;
      else if (step === 3) body = `<div class="stack">${listBox(f.exp, (d) => `<b>${F.esc(d.role)}</b><small>${F.esc(d.org)} · ${F.esc(d.time)}</small>`, 'exp')}<button class="btn btn-gray btn-block" id="addExp">${I('plus')}Thêm kinh nghiệm</button>
        <div class="field"><div class="row between"><label for="a_bio" class="label">Giới thiệu chuyên môn</label><span class="hint num" id="bc">${f.bio.length}/600</span></div><textarea class="textarea" id="a_bio" maxlength="600" placeholder="Lĩnh vực nghiên cứu, công trình tiêu biểu…">${F.esc(f.bio)}</textarea></div>
        <div class="field"><label for="a_ln">Liên kết (LinkedIn, Google Scholar, trang cá nhân)</label><input class="input" id="a_ln" value="${F.esc(f.links.join(', '))}" placeholder="Phân cách bằng dấu phẩy"></div>
        <div class="field"><span class="label">Bài nghiên cứu mẫu</span><label class="upload-box">${I('upload')}<span>${f.sample ? F.esc(f.sample) : 'Tải lên 1 bài nghiên cứu/bài báo tiêu biểu (PDF, ≤ 20 MB)'}</span><input type="file" id="a_sm" accept="application/pdf"></label></div></div>`;
      else body = `<div class="stack"><div class="group plain"><div class="gi noicon"><span class="gl">Họ tên</span><span class="gv">${F.esc(f.name)}</span></div><div class="gi noicon"><span class="gl">Chức danh</span><span class="gv">${F.esc(f.title || '—')}</span></div><div class="gi noicon"><span class="gl">Đơn vị</span><span class="gv">${F.esc(f.org || '—')}</span></div><div class="gi noicon"><span class="gl">Lĩnh vực</span><span class="gv">${f.fields.map((x) => F.STREAM_S[x]).join(', ')}</span></div><div class="gi noicon"><span class="gl">Học vị · Chứng chỉ · Kinh nghiệm</span><span class="gv">${f.degrees.length} · ${f.certs.length} · ${f.exp.length}</span></div></div>
        <div class="group" style="padding:4px 0">${[['k1', 'Thông tin tôi cung cấp là trung thực; tôi đồng ý để FBV xác minh với đơn vị cấp bằng/chứng chỉ.'], ['k2', 'Tôi công khai mọi xung đột lợi ích liên quan đến nội dung nghiên cứu.'], ['k3', 'Tôi không đưa ra khuyến nghị mua/bán tài sản cụ thể trên FBV.'], ['k4', 'Tôi đồng ý với Quy chế chuyên gia và quy trình thẩm định học thuật FBV Review.']].map((k) => `<label class="gi noicon"><input type="checkbox" id="${k[0]}"><span class="gl" style="font-weight:500">${k[1]}</span></label>`).join('')}</div></div>`;
      v.innerHTML = `<div class="steps" style="padding-top:8px">${STEPS.map((s, k) => `<i class="${k <= step ? 'on' : ''}"></i>`).join('')}</div><div class="page" style="padding-top:14px;padding-bottom:150px"><div class="small faint">Bước ${step + 1}/${STEPS.length}</div><h2 class="serif" style="font-size:26px;margin:4px 0 16px">${['Thông tin chuyên gia', 'Học vị & bằng cấp', 'Chứng chỉ chuyên môn', 'Kinh nghiệm & công trình', 'Cam kết & gửi hồ sơ'][step]}</h2>${app && app.status === 'need_info' ? `<div class="note warn mb-16">${I('alert')}<span>${F.esc(app.note)}</span></div>` : ''}${body}</div>
        <div class="bottom-cta"><div class="inner"><button class="btn btn-primary btn-pill btn-block" id="nx">${step < STEPS.length - 1 ? 'Tiếp tục' : 'Gửi hồ sơ để thẩm định'}</button>${step ? '<button class="btn btn-ghost btn-block" id="pv">Quay lại</button>' : ''}</div></div>`;
      bind();
    };
    const listBox = (arr, row, key) => (arr.length ? `<div class="group">${arr.map((d, k) => `<div class="gi">${I(key === 'deg' ? 'cap' : key === 'cert' ? 'award' : 'briefcase')}<span class="gl">${row(d)}</span><button class="icon-btn sm" data-rm="${key}:${k}" aria-label="Xóa">${I('trash')}</button></div>`).join('')}</div>` : `<div class="panel muted small">Chưa có mục nào.</div>`);
    const collect = () => {
      if (step === 0) { f.name = $('#a_nm').value.trim(); f.title = $('#a_tt').value.trim(); f.org = $('#a_og').value.trim(); f.phone = $('#a_ph').value.trim(); }
      if (step === 3) { f.bio = $('#a_bio').value.trim(); f.links = $('#a_ln').value.split(',').map((x) => x.trim()).filter(Boolean); }
    };
    const validate = () => {
      if (step === 0) { if (f.name.length < 4 || f.title.length < 4 || f.org.length < 2) { F.toast('Vui lòng nhập họ tên, chức danh và đơn vị công tác', 'error'); return false; } if (!f.fields.length) { F.toast('Chọn ít nhất 1 lĩnh vực chuyên môn', 'error'); return false; } }
      if (step === 1 && !f.degrees.length) { F.toast('Cần ít nhất 1 học vị/bằng cấp kèm minh chứng', 'error'); return false; }
      if (step === 3 && f.bio.length < 40) { F.toast('Giới thiệu chuyên môn tối thiểu 40 ký tự', 'error'); return false; }
      if (step === 4 && !['k1', 'k2', 'k3', 'k4'].every((k) => $('#' + k).checked)) { F.toast('Vui lòng xác nhận đủ 4 cam kết', 'error'); return false; }
      return true;
    };
    const itemSheet = (kind) => {
      const deg = kind === 'deg', cert = kind === 'cert';
      const body = deg ? `<div class="stack"><div class="field"><label>Bậc học</label><select class="select" id="i_lv">${DEG.map((x) => `<option>${x}</option>`).join('')}</select></div><div class="field"><label>Chuyên ngành</label><input class="input" id="i_mj" placeholder="VD: Kinh tế học"></div><div class="field"><label>Trường / cơ sở đào tạo</label><input class="input" id="i_sc"></div><div class="field"><label>Năm tốt nghiệp</label><input class="input" id="i_yr" inputmode="numeric" placeholder="2015"></div><label class="upload-box">${I('upload')}<span id="i_fn">Tải bản scan bằng (PDF/JPG)</span><input type="file" id="i_f"></label></div>`
        : cert ? `<div class="stack"><div class="field"><label>Chứng chỉ</label><div class="chips" style="flex-wrap:wrap">${CERTS.map((x) => `<button class="chip" data-cc="${x}">${x}</button>`).join('')}</div><input class="input mt-8" id="i_nm" placeholder="Hoặc nhập tên chứng chỉ khác"></div><div class="field"><label>Tổ chức cấp</label><input class="input" id="i_is" placeholder="VD: CFA Institute"></div><div class="row" style="gap:10px"><div class="field grow"><label>Số hiệu</label><input class="input" id="i_no"></div><div class="field" style="width:110px"><label>Năm cấp</label><input class="input" id="i_yr" inputmode="numeric"></div></div><label class="upload-box">${I('upload')}<span id="i_fn">Tải minh chứng (chứng chỉ / thư xác nhận)</span><input type="file" id="i_f"></label></div>`
        : `<div class="stack"><div class="field"><label>Đơn vị</label><input class="input" id="i_og"></div><div class="field"><label>Vị trí</label><input class="input" id="i_rl"></div><div class="field"><label>Thời gian</label><input class="input" id="i_tm" placeholder="VD: 2019 – nay"></div></div>`;
      F.modal({ title: deg ? 'Thêm học vị' : cert ? 'Thêm chứng chỉ' : 'Thêm kinh nghiệm', body, onOpen: (el) => { $$('[data-cc]', el).forEach((b) => (b.onclick = () => { $('#i_nm', el).value = b.dataset.cc; $$('[data-cc]', el).forEach((x) => x.classList.toggle('on', x === b)); })); const fi = $('#i_f', el); if (fi) fi.onchange = () => { $('#i_fn', el).textContent = fi.files[0] ? fi.files[0].name : 'minh-chung.pdf'; }; },
        actions: [{ label: 'Hủy' }, { label: 'Thêm', cls: 'btn-primary', onClick: (c, el) => {
          const val = (id) => ($('#' + id, el) ? $('#' + id, el).value.trim() : ''); const file = $('#i_f', el) && $('#i_f', el).files[0] ? $('#i_f', el).files[0].name : 'minh-chung.pdf';
          if (deg) { if (!val('i_mj') || !val('i_sc')) { F.toast('Nhập chuyên ngành và trường', 'error'); return false; } f.degrees.push({ name: val('i_lv') + ' ' + val('i_mj'), school: val('i_sc'), year: val('i_yr') || '—', file }); }
          else if (cert) { if (!val('i_nm')) { F.toast('Chọn hoặc nhập tên chứng chỉ', 'error'); return false; } f.certs.push({ name: val('i_nm'), issuer: val('i_is') || '—', no: val('i_no'), year: val('i_yr') || '—', file }); }
          else { if (!val('i_og') || !val('i_rl')) { F.toast('Nhập đơn vị và vị trí', 'error'); return false; } f.exp.push({ org: val('i_og'), role: val('i_rl'), time: val('i_tm') || '—' }); }
          saveDraft(); draw();
        } }] });
    };
    const bind = () => {
      $$('[data-fd]').forEach((b) => (b.onclick = () => { collect(); const k = b.dataset.fd; f.fields = f.fields.includes(k) ? f.fields.filter((x) => x !== k) : f.fields.concat(k); draw(); }));
      $$('[data-rm]').forEach((b) => (b.onclick = () => { const [k, i] = b.dataset.rm.split(':'); ({ deg: f.degrees, cert: f.certs, exp: f.exp })[k].splice(+i, 1); saveDraft(); draw(); }));
      [['addDeg', 'deg'], ['addCert', 'cert'], ['addExp', 'exp']].forEach(([id, k]) => { const b = $('#' + id); if (b) b.onclick = () => { collect(); itemSheet(k); }; });
      const bio = $('#a_bio'); if (bio) bio.oninput = () => { $('#bc').textContent = bio.value.length + '/600'; };
      const sm = $('#a_sm'); if (sm) sm.onchange = () => { f.sample = sm.files[0] ? sm.files[0].name : 'bai-mau.pdf'; draw(); };
      const pv = $('#pv'); if (pv) pv.onclick = () => { collect(); step--; draw(); window.scrollTo(0, 0); };
      $('#nx').onclick = () => {
        collect(); if (!validate()) return;
        if (step < STEPS.length - 1) { saveDraft(); step++; draw(); window.scrollTo(0, 0); return; }
        f.coi = true; const resub = app && ['need_info', 'rejected'].includes(app.status);
        const rec = Object.assign({}, f, { status: 'submitted', createdAt: resub ? app.createdAt : now(), log: (app && app.log ? app.log : []).concat([{ at: now(), x: resub ? 'Bổ sung / nộp lại hồ sơ' : 'Nộp hồ sơ' }]) });
        const i = D.applications.findIndex((a) => a.id === f.id); if (i > -1) D.applications[i] = rec; else D.applications.push(rec); F.save();
        F.modal({ title: 'Đã gửi hồ sơ', dismissable: false, body: `<div class="empty" style="padding:8px 0"><div class="ico" style="background:var(--success-soft);color:var(--success)">${I('check')}</div><h3>FBV đã nhận hồ sơ của bạn</h3><p>Hội đồng FBV Review sẽ thẩm định trong 3–5 ngày làm việc. Kết quả được gửi qua thông báo và email.</p></div>`, actions: [{ label: 'Xem trạng thái', cls: 'btn-primary', onClick: () => F.go('reader/expert-apply.html') }] });
      };
    };
    draw();
  };
})();
