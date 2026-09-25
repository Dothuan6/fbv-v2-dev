/* =========================================================
   FBV v2 Prototype — CMS WEB PORTAL
   C01 Đăng nhập · C02 Dashboard · C03 Danh sách · C04 Soạn thảo · C05 AI Linking
   C06 Thẩm định · C07 Xuất bản · C09–C10 Phản biện · C11 Kiểm duyệt
   C12 Chuyên gia · C13 Danh mục chỉ số · C14 Người dùng
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const I = F.icon; const db = () => F.db();
  const now = () => new Date().toISOString();
  const guard = () => { if (!F.cmsRole()) { F.go('cms/login.html?next=' + encodeURIComponent(F.here())); return false; } return true; };
  const logH = (r, act) => { db().history.unshift({ r, at: now(), by: F.cmsMe().id, act }); };
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const slaEl = (q) => {
    if (!['new', 'assigned', 'in_progress'].includes(q.status)) return '<span class="muted small">—</span>';
    const h = (new Date(q.slaDue) - Date.now()) / 36e5;
    return h < 0 ? `<span class="sla late">${I('alert')}Quá ${Math.ceil(-h)} giờ</span>` : h < 24 ? `<span class="sla warn">${I('clock')}Còn ${Math.ceil(h)} giờ</span>` : `<span class="sla ok">${I('clock')}Còn ${Math.ceil(h)} giờ</span>`;
  };
  const openHref = (r) => F.can('report.review', r) ? 'cms/review.html?id=' + r.id : F.can('report.publish', r) ? 'cms/publish.html?id=' + r.id : F.can('report.edit', r) ? 'cms/editor.html?id=' + r.id : r.status === 'published' ? 'cms/publish.html?id=' + r.id : 'cms/editor.html?id=' + r.id;
  const actionLabel = (r) => F.can('report.review', r) ? 'Thẩm định' : F.can('report.publish', r) ? 'Duyệt & xuất bản' : F.can('report.edit', r) ? 'Chỉnh sửa' : 'Xem';

  /* ---------- AI suggestion (mô phỏng Vertex AI bằng khớp từ khóa theo danh mục chỉ số) ---------- */
  F.aiSuggest = (r) => {
    const out = [];
    db().indicators.forEach((ind) => {
      const keys = [ind.name].concat(ind.syn).map(norm);
      let best = -1, bestCount = 0, total = 0;
      r.body.forEach((b, i) => { const t = norm(b.x || b.cap || b.title || ''); const c = keys.reduce((s, k) => s + (k.length > 2 && t.includes(k) ? 1 : 0), 0); total += c; if (c > bestCount) { bestCount = c; best = i; } });
      const inTitle = keys.some((k) => k.length > 2 && norm(r.title + ' ' + r.tags.join(' ')).includes(k));
      if (total > 0 || inTitle) out.push({ i: ind.id, a: best < 0 ? 0 : best, c: Math.min(0.98, +(0.42 + total * 0.13 + (inTitle ? 0.2 : 0)).toFixed(2)) });
    });
    return out.sort((a, b) => b.c - a.c).slice(0, 6);
  };
  const runAI = (r) => {
    const keep = db().links.filter((l) => l.r === r.id && ['accepted', 'manual'].includes(l.s));
    db().links = db().links.filter((l) => l.r !== r.id || ['accepted', 'manual'].includes(l.s));
    F.aiSuggest(r).forEach((s) => { if (!keep.some((k) => k.i === s.i)) db().links.push({ id: F.uid('l'), r: r.id, i: s.i, a: s.a, c: s.c, s: 'suggested' }); });
    F.save();
  };

  /* ---------- AI Linking panel (C05) ---------- */
  const aiPanel = (host, r, onChange) => {
    const can = F.can('ai.adjust'); const th = db().config.aiThreshold;
    const render = (loading) => {
      const ls = db().links.filter((l) => l.r === r.id).sort((a, b) => (a.s === 'rejected') - (b.s === 'rejected') || b.c - a.c);
      host.innerHTML = `<div class="ai-panel"><div class="aph"><h3>${I('sparkles')}Liên kết ngữ cảnh — Vertex AI</h3><p>Gợi ý chỉ số liên quan từ nội dung bài. Ngưỡng tự chấp nhận: ≥ ${F.num(th, 2)}. ${can ? 'Biên tập viên duyệt trước khi xuất bản.' : 'Bạn chỉ có quyền xem.'}</p></div><div class="apb">
        ${loading ? `<div class="ai-loading"><div class="spinner"></div><span>Đang phân tích nội dung bằng Vertex AI…</span><span class="xs muted">Trích xuất thực thể · Đối chiếu danh mục chỉ số · Chấm điểm tin cậy</span></div>` : ls.length ? ls.map((l) => { const ind = F.ind(l.i); const b = r.body[l.a] || {}; const col = l.c >= th ? 'var(--mkt-up)' : l.c >= .6 ? 'var(--mkt-ref)' : 'var(--mkt-down)';
          return `<div class="sugg ${l.s}" data-l="${l.id}"><div class="sh"><span><b>${F.esc(ind.name)}</b><small>${F.GROUP[ind.group]} · ${F.fmtVal(ind)}</small></span>${l.s === 'accepted' ? '<span class="badge s-published">Đã chấp nhận</span>' : l.s === 'manual' ? '<span class="badge s-published">Thêm thủ công</span>' : l.s === 'rejected' ? '<span class="badge">Đã bỏ</span>' : '<span class="badge s-in_review">Chờ duyệt</span>'}</div>
            <div class="conf"><span>Tin cậy</span><span class="bar"><i style="width:${l.c * 100}%;background:${col}"></i></span><b class="num">${Math.round(l.c * 100)}%</b></div>
            <div class="anchor" data-anchor="${l.a}" title="Bấm để xem vị trí chèn">Chèn sau: “${F.esc((b.x || b.cap || b.title || '').slice(0, 120))}”</div>
            ${can ? `<div class="acts">${l.s === 'suggested' || l.s === 'rejected' ? `<button class="btn btn-success btn-xs" data-act="accept">${I('check')}Chấp nhận</button>` : ''}${l.s !== 'rejected' ? `<button class="btn btn-secondary btn-xs" data-act="reject">${I('x')}Bỏ</button>` : ''}</div>` : ''}</div>`; }).join('')
          : `<p class="small muted center" style="padding:16px">Chưa có gợi ý. ${can ? 'Bấm “Chạy phân tích” để Vertex AI đề xuất chỉ số liên quan.' : ''}</p>`}
        ${can ? `<div class="row wrap" style="gap:6px"><button class="btn btn-soft btn-sm" id="aiRun">${I('refresh')}Chạy phân tích</button><button class="btn btn-secondary btn-sm" id="aiAll">Chấp nhận tất cả ≥ ngưỡng</button><button class="btn btn-ghost btn-sm" id="aiAdd">${I('plus')}Thêm thủ công</button></div>` : ''}</div></div>`;
      if (loading) return;
      $$('[data-act]', host).forEach((b) => (b.onclick = () => { const l = db().links.find((x) => x.id === b.closest('[data-l]').dataset.l); l.s = b.dataset.act === 'accept' ? 'accepted' : 'rejected'; F.save(); render(); onChange && onChange(); }));
      $$('[data-anchor]', host).forEach((a) => (a.onclick = () => { const t = document.querySelector(`[data-b="${a.dataset.anchor}"]`); if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.classList.add('para-anchor'); setTimeout(() => t.classList.remove('para-anchor'), 1800); } }));
      const run = $('#aiRun', host); if (run) run.onclick = () => { render(true); setTimeout(() => { runAI(r); render(); onChange && onChange(); F.toast('Vertex AI đã cập nhật gợi ý'); }, 1500); };
      const all = $('#aiAll', host); if (all) all.onclick = () => { let n = 0; db().links.filter((l) => l.r === r.id && l.s === 'suggested' && l.c >= th).forEach((l) => { l.s = 'accepted'; n++; }); F.save(); render(); onChange && onChange(); F.toast(n ? `Đã chấp nhận ${n} gợi ý` : 'Không có gợi ý nào đạt ngưỡng', n ? 'success' : 'info'); };
      const add = $('#aiAdd', host); if (add) add.onclick = () => F.modal({ title: 'Thêm chỉ số thủ công', body: `<div class="stack"><div class="field"><label for="mi">Chỉ số</label><select class="select" id="mi">${db().indicators.map((i) => `<option value="${i.id}">${F.esc(i.name)} (${i.id})</option>`).join('')}</select></div><div class="field"><label for="mb">Chèn widget sau đoạn</label><select class="select" id="mb">${r.body.map((b, i) => `<option value="${i}">#${i + 1} · ${F.esc((b.x || b.cap || b.title || '').slice(0, 70))}</option>`).join('')}</select></div></div>`,
        actions: [{ label: 'Hủy' }, { label: 'Thêm', cls: 'btn-primary', onClick: (c, el) => { const iid = $('#mi', el).value; const ex = db().links.find((l) => l.r === r.id && l.i === iid); if (ex) { ex.s = 'manual'; ex.a = +$('#mb', el).value; } else db().links.push({ id: F.uid('l'), r: r.id, i: iid, a: +$('#mb', el).value, c: 1, s: 'manual' }); F.save(); render(); onChange && onChange(); F.toast('Đã thêm chỉ số'); } }] });
    };
    render();
  };

  /* ================= C01 · Đăng nhập CMS ================= */
  pages.cmsLogin = () => {
    const s = F.session(); if (F.param('logout')) { s.cmsRole = null; F.save(); }
    if (s.cmsRole && !F.param('logout')) { F.go('cms/index.html'); return; }
    let role = 'editor';
    const R = [['expert', 'Chuyên gia', 'TS. Trần Quốc Bảo — soạn bài, trả lời phản biện', 'edit'], ['reviewer', 'Thẩm định viên', 'TS. Hoàng Lan Phương — FBV Review', 'shieldCheck'], ['editor', 'Biên tập / Xuất bản', 'Phạm Thu Trang — duyệt AI, xuất bản, điều phối', 'layers'], ['admin', 'Quản trị', 'Quản trị hệ thống, kiểm duyệt vi phạm', 'settings']];
    document.getElementById('app').innerHTML = `<div class="auth-wrap" style="min-height:100vh"><div class="auth-side">${F.brand('../index.html', 'CMS Portal').replace('class="brand"', 'class="brand" style="color:#fff"')}<h2>Xuất bản tri thức có kiểm chứng.</h2><p>Quy trình 3 bước: Soạn thảo → Thẩm định học thuật (FBV Review) → Phê duyệt xuất bản, kèm liên kết ngữ cảnh tự động bởi Vertex AI.</p><ul><li>${I('edit')}Soạn thảo rich-text, đính kèm PDF</li><li>${I('shieldCheck')}Thẩm định theo checklist học thuật</li><li>${I('sparkles')}Duyệt gợi ý chỉ số từ AI</li><li>${I('message')}Điều phối phản biện 1:1 theo SLA</li></ul></div>
      <div class="auth-main"><div class="auth-card"><h1>Đăng nhập CMS</h1><p class="lead">Dành cho chuyên gia và nhân sự FBV.</p>
      <div class="stack"><div class="field"><label for="em">Email công việc</label><input class="input" id="em" value="bientap@fbv.example"></div><div class="field"><label for="pw">Mật khẩu</label><input class="input" id="pw" type="password" value="demo-password"></div>
      <div class="field"><span class="label">Vai trò demo</span><div class="radio-list" id="rl">${R.map((x) => `<label><input type="radio" name="rl" value="${x[0]}" ${x[0] === role ? 'checked' : ''}><span class="avatar sm" style="background:var(--field);color:var(--text-2)">${I(x[3]).replace('<svg', '<svg style="width:15px;height:15px"')}</span><span class="grow"><b>${x[1]}</b><span class="xs muted" style="display:block">${x[2]}</span></span></label>`).join('')}</div></div>
      <button class="btn btn-navy btn-lg btn-block" id="go">Đăng nhập</button><p class="hint center">Bản chính thức: SSO nội bộ + xác thực 2 lớp (2FA).</p><a class="btn btn-ghost btn-block" href="${F.url('index.html')}">← Danh mục màn hình</a></div></div></div></div>`;
    $$('input[name=rl]').forEach((i) => (i.onchange = () => { role = i.value; $('#em').value = { expert: 'tqbao@fbv.example', reviewer: 'hlphuong@fbv.example', editor: 'bientap@fbv.example', admin: 'admin@fbv.example' }[role]; }));
    $('#go').onclick = () => { s.cmsRole = role; F.save(); const n = F.param('next'); location.href = n ? F.url(n) : F.url('cms/index.html'); };
    F.demoBar('cms');
  };

  /* ================= C02 · Dashboard ================= */
  pages.cmsDashboard = () => {
    if (!guard()) return; const c = F.cmsShell('dashboard', [['Dashboard']]); const me = F.cmsMe(); const role = me.role; const D = db();
    const mineR = role === 'expert' ? D.reports.filter((r) => r.author === me.id) : D.reports;
    const mineQ = role === 'expert' ? D.inquiries.filter((q) => q.expert === me.id) : D.inquiries;
    const openQ = mineQ.filter((q) => ['new', 'assigned', 'in_progress'].includes(q.status)); const lateQ = openQ.filter((q) => new Date(q.slaDue) < Date.now());
    const todo = role === 'reviewer' ? mineR.filter((r) => r.status === 'in_review') : role === 'editor' ? mineR.filter((r) => r.status === 'pending_approval') : role === 'expert' ? mineR.filter((r) => ['draft', 'changes_requested'].includes(r.status)) : mineR.filter((r) => ['in_review', 'pending_approval'].includes(r.status));
    const st = ['draft', 'in_review', 'changes_requested', 'pending_approval', 'scheduled', 'published'];
    const views = Array.from({ length: 14 }, (_, i) => Math.round(1800 + Math.sin(i / 2) * 400 + i * 60 + (i % 3) * 120)); const vl = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5); return d.getDate() + '/' + (d.getMonth() + 1); });
    c.innerHTML = `<div class="page-head"><div><h1>Xin chào, ${role === 'admin' ? 'Quản trị viên' : F.esc(me.name.split(' ').pop())}</h1><p>${F.ROLE_LABEL[role]} · ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>${F.can('report.create') ? `<a class="btn btn-primary" href="${F.url('cms/editor.html')}">${I('plus')}Soạn báo cáo mới</a>` : ''}</div>
      <div class="kpis mb-24">
        <div class="kpi"><div class="k-l">${I('file')}${role === 'reviewer' ? 'Chờ bạn thẩm định' : role === 'editor' ? 'Chờ bạn phê duyệt' : role === 'expert' ? 'Bài cần bạn xử lý' : 'Bài đang trong quy trình'}</div><div class="k-v num">${todo.length}</div><div class="k-s">${todo.length ? 'Cũ nhất: ' + F.ago(todo[todo.length - 1].submittedAt || todo[todo.length - 1].updatedAt || now()) : 'Không có việc tồn đọng'}</div></div>
        <div class="kpi"><div class="k-l">${I('message')}Phản biện đang mở</div><div class="k-v num">${openQ.length}</div><div class="k-s">${openQ.filter((q) => q.status === 'new').length} phiên mới chưa phản hồi</div></div>
        <div class="kpi"><div class="k-l">${I('clock')}Quá SLA ${D.config.slaHours}h</div><div class="k-v num ${lateQ.length ? 'down' : ''}">${lateQ.length}</div><div class="k-s">${lateQ.length ? 'Cần nhắc chuyên gia' : 'Đúng hạn'}</div></div>
        <div class="kpi"><div class="k-l">${I('flag')}Báo cáo vi phạm mới</div><div class="k-v num">${D.moderation.filter((m) => m.status === 'open').length}</div><div class="k-s">Mục tiêu xử lý ≤ 24 giờ</div></div></div>
      <div class="card mb-24"><div class="card-head"><h3>Quy trình xuất bản</h3><a href="${F.url('cms/reports.html')}">Xem tất cả</a></div><div class="pipeline">${st.map((s) => `<a class="pipe" href="${F.url('cms/reports.html?st=' + s)}"><b class="num">${mineR.filter((r) => r.status === s).length}</b>${F.statusBadge(s)}</a>`).join('')}</div></div>
      <div class="layout-2"><div class="stack-lg">
        <div class="card"><div class="card-head"><h3>Việc cần làm</h3></div>${todo.length ? `<div class="table-wrap"><table class="table"><tbody>${todo.map((r) => `<tr><td><a class="t-title" href="${F.url(openHref(r))}">${F.esc(r.title)}</a><div class="xs muted">${F.esc(F.expert(r.author).name)} · ${F.STREAM[r.stream]}</div></td><td>${F.statusBadge(r.status)}</td><td class="r"><a class="btn btn-primary btn-xs" href="${F.url(openHref(r))}">${actionLabel(r)}</a></td></tr>`).join('')}</tbody></table></div>` : F.empty('checkCircle', 'Không có việc tồn đọng', 'Mọi báo cáo thuộc phạm vi của bạn đã được xử lý.')}</div>
        <div class="card"><div class="card-head"><h3>Phản biện sắp đến hạn</h3><a href="${F.url('cms/inquiries.html')}">Hàng đợi</a></div>${openQ.length ? `<div class="table-wrap"><table class="table"><tbody>${openQ.sort((a, b) => new Date(a.slaDue) - new Date(b.slaDue)).slice(0, 5).map((q) => `<tr><td><a class="t-title" href="${F.url('cms/inquiry.html?id=' + q.id)}">${F.esc(F.user(q.reader).name)}</a><div class="xs muted" style="max-width:360px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${F.esc(F.report(q.r).title)}</div></td><td>${F.iStatusBadge(q.status)}</td><td class="r">${slaEl(q)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Không có phiên nào đang mở.</p>'}</div>
        ${role !== 'expert' ? `<div class="card"><div class="card-head"><h3>Lượt đọc báo cáo — 14 ngày</h3><span class="small muted">Web + App</span></div><div id="vw"></div></div>` : ''}
      </div><aside class="card"><div class="card-head"><h3>Hoạt động gần đây</h3></div><div class="timeline">${D.history.slice().sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8).map((h) => { const r = F.report(h.r); return `<div class="tl-item"><span class="tl-dot">${I('history')}</span><div><div class="tt"><b>${F.esc(F.person(h.by).name)}</b> · ${F.esc(h.act)}</div><div class="xs sub" style="max-width:240px">${F.esc(r ? r.title : '')}</div><div class="tm">${F.ago(h.at)}</div></div></div>`; }).join('')}</div></aside></div>`;
    const vw = $('#vw'); if (vw) F.chart.bar(vw, { labels: vl, values: views, dec: 0, height: 200, highlightLast: true, color: '#9DBEEB', suffix: ' lượt', label: 'Lượt đọc 14 ngày' });
  };

  /* ================= C03 · Danh sách báo cáo ================= */
  pages.cmsReports = () => {
    if (!guard()) return; const me = F.cmsMe(); const c = F.cmsShell('reports', [['Dashboard', 'cms/index.html'], [me.role === 'expert' ? 'Báo cáo của tôi' : 'Báo cáo']]);
    const all = me.role === 'expert' ? db().reports.filter((r) => r.author === me.id) : db().reports;
    let st = F.param('st') || 'all'; let q = ''; let stream = '';
    const tabs = [['all', 'Tất cả'], ['draft', 'Nháp'], ['in_review', 'Chờ thẩm định'], ['changes_requested', 'Yêu cầu sửa'], ['pending_approval', 'Chờ phê duyệt'], ['scheduled', 'Đã lên lịch'], ['published', 'Đã xuất bản'], ['archived', 'Lưu trữ']];
    c.innerHTML = `<div class="page-head"><div><h1>${me.role === 'expert' ? 'Báo cáo của tôi' : 'Báo cáo'}</h1><p>Quy trình: Soạn thảo → Thẩm định học thuật → Phê duyệt xuất bản</p></div>${F.can('report.create') ? `<a class="btn btn-primary" href="${F.url('cms/editor.html')}">${I('plus')}Báo cáo mới</a>` : ''}</div>
      <div class="tabs mb-16" id="tb"></div><div class="toolbar"><div class="search-box" style="flex:1;min-width:220px;max-width:420px">${I('search')}<input class="input sm" id="q" placeholder="Tìm theo tiêu đề, tác giả…"></div><select class="select sm" id="sf" style="width:auto"><option value="">Mọi luồng</option><option value="fintech">Fintech</option><option value="macro">Kinh tế Vĩ mô</option><option value="micro">Kinh tế Vi mô</option></select></div><div id="tbl"></div>`;
    const draw = () => {
      $('#tb').innerHTML = tabs.map((t) => `<button class="tab ${st === t[0] ? 'active' : ''}" data-t="${t[0]}">${t[1]}<span class="count">${t[0] === 'all' ? all.length : all.filter((r) => r.status === t[0]).length}</span></button>`).join('');
      $$('#tb .tab').forEach((b) => (b.onclick = () => { st = b.dataset.t; draw(); }));
      const list = all.filter((r) => (st === 'all' || r.status === st) && (!stream || r.stream === stream) && (!q || norm(r.title + ' ' + F.expert(r.author).name).includes(norm(q)))).sort((a, b) => new Date(b.updatedAt || b.submittedAt || b.publishedAt || b.scheduledAt || 0) - new Date(a.updatedAt || a.submittedAt || a.publishedAt || a.scheduledAt || 0));
      $('#tbl').innerHTML = list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Tiêu đề</th><th>Luồng</th><th>Tác giả</th><th>Trạng thái</th><th>AI liên kết</th><th>Cập nhật</th><th class="r">Thao tác</th></tr></thead><tbody>${list.map((r) => { const ls = db().links.filter((l) => l.r === r.id); const acc = ls.filter((l) => ['accepted', 'manual'].includes(l.s)).length; const sug = ls.filter((l) => l.s === 'suggested').length; const t = r.publishedAt || r.scheduledAt || r.submittedAt || r.updatedAt;
        return `<tr><td style="max-width:380px"><a class="t-title" href="${F.url(openHref(r))}">${F.esc(r.title)}</a>${r.premium ? ' <span class="badge premium">Premium</span>' : ''}${r.pdf ? ' <span class="badge">PDF</span>' : ''}</td><td>${F.streamBadge(r.stream)}</td><td class="small">${F.esc(F.expert(r.author).short)}</td><td>${F.statusBadge(r.status)}</td><td class="small">${acc ? `<span class="up">${acc} đã duyệt</span>` : ''}${sug ? `${acc ? ' · ' : ''}<span class="ref">${sug} chờ duyệt</span>` : ''}${!acc && !sug ? '<span class="muted">—</span>' : ''}</td><td class="small muted" title="${t ? F.date(t, true) : ''}">${r.status === 'scheduled' ? 'Lên lịch ' + F.date(r.scheduledAt, true) : t ? F.ago(t) : '—'}</td>
          <td class="r" style="white-space:nowrap"><a class="btn ${['Thẩm định', 'Duyệt & xuất bản'].includes(actionLabel(r)) ? 'btn-primary' : 'btn-secondary'} btn-xs" href="${F.url(openHref(r))}">${actionLabel(r)}</a>${r.status === 'published' ? ` <a class="btn btn-ghost btn-xs" href="${F.url('reader/report.html?id=' + r.id)}" target="_blank" title="Xem trên web">${I('external')}</a>` : ''}</td></tr>`; }).join('')}</tbody></table></div>`
        : F.empty('file', 'Không có báo cáo', 'Không có báo cáo nào khớp bộ lọc hiện tại.');
    };
    $('#q').oninput = (e) => { q = e.target.value; draw(); }; $('#sf').onchange = (e) => { stream = e.target.value; draw(); };
    draw();
  };

  /* ---------- Shared: status card + history ---------- */
  const statusCard = (r) => { const hs = db().history.filter((h) => h.r === r.id).sort((a, b) => new Date(a.at) - new Date(b.at)); return `<div class="card"><div class="card-head"><h3>Trạng thái</h3>${F.statusBadge(r.status)}</div><div class="stack small"><div class="row between"><span class="muted">Tác giả</span><span>${F.esc(F.expert(r.author).name)}</span></div><div class="row between"><span class="muted">Luồng</span><span>${F.STREAM[r.stream]}</span></div>${r.publishedAt ? `<div class="row between"><span class="muted">Xuất bản</span><span>${F.date(r.publishedAt, true)}</span></div>` : ''}${r.scheduledAt && r.status === 'scheduled' ? `<div class="row between"><span class="muted">Lịch xuất bản</span><span>${F.date(r.scheduledAt, true)}</span></div>` : ''}</div>
    ${hs.length ? `<div class="section-title mt-16">Lịch sử</div><div class="timeline">${hs.map((h) => `<div class="tl-item"><span class="tl-dot">${I('history')}</span><div><div class="tt"><b>${F.esc(F.person(h.by).name)}</b> · ${F.esc(h.act)}</div><div class="tm">${F.date(h.at, true)}</div></div></div>`).join('')}</div>` : ''}</div>`; };
  const commentsCard = (r) => { const cs = db().reviews.filter((c) => c.r === r.id); return cs.length ? `<div class="card"><div class="card-head"><h3>Góp ý thẩm định</h3><span class="badge s-changes_requested">${cs.length}</span></div><div class="stack">${cs.map((c) => `<div class="comment"><div class="ch"><b>${F.esc(F.person(c.by).name)}</b><span>${F.ago(c.at)}</span></div>${r.body[c.block] ? `<div class="cq">“${F.esc((r.body[c.block].x || '').slice(0, 120))}”</div>` : ''}${F.esc(c.x)}</div>`).join('')}</div></div>` : ''; };

  /* ================= C04 · Soạn thảo ================= */
  pages.cmsEditor = () => {
    if (!guard()) return; const me = F.cmsMe();
    let r = F.report(F.param('id') || ''); const isNew = !r;
    if (isNew) {
      if (!F.can('report.create')) { const c = F.cmsShell('editor', [['Báo cáo', 'cms/reports.html'], ['Soạn mới']]); c.innerHTML = F.empty('lock', 'Bạn không có quyền tạo báo cáo', 'Vai trò hiện tại không được phép soạn báo cáo mới.', ''); return; }
      r = { id: F.uid('r'), stream: 'macro', status: 'draft', author: me.role === 'expert' ? me.id : 'e1', premium: false, readTime: 5, cover: 1 + Math.floor(Math.random() * 12), pdf: false, title: '', dek: '', summary: ['', '', ''], tags: [], updatedAt: now(), views: 0, body: [{ t: 'p', x: '' }] };
    }
    const editable = isNew || F.can('report.edit', r);
    const c = F.cmsShell(isNew ? 'editor' : 'reports', [['Báo cáo', 'cms/reports.html'], [isNew ? 'Soạn báo cáo mới' : 'Chỉnh sửa']]);
    const blockHtml = (b, i) => b.t === 'p' ? `<p data-b="${i}">${F.esc(b.x)}</p>` : b.t === 'h' ? `<h2 data-b="${i}">${F.esc(b.x)}</h2>` : b.t === 'quote' ? `<blockquote data-b="${i}">${F.esc(b.x)}</blockquote>` : `<div class="embed-note" contenteditable="false" data-keep="${i}" data-b="${i}">${I(b.t === 'table' ? 'table' : 'bars')}${b.t === 'table' ? 'Bảng' : 'Biểu đồ'}: ${F.esc(b.cap || b.title)} <span class="muted">(chỉnh trong trình biên tập bảng/biểu đồ)</span></div>`;
    c.innerHTML = `<div class="page-head"><div><div class="row" style="gap:10px">${F.statusBadge(r.status)}<span class="small muted">${isNew ? 'Bản nháp mới' : 'Cập nhật ' + F.ago(r.updatedAt || r.submittedAt || r.publishedAt || now())}</span></div><h1 class="mt-8" style="font-size:24px">${isNew ? 'Soạn báo cáo mới' : F.esc(r.title)}</h1></div>
      <div class="row wrap">${editable ? `<button class="btn btn-secondary" id="sv">${I('check')}Lưu nháp</button>` : ''}<button class="btn btn-ghost" id="pv">${I('eye')}Xem trước</button>${F.can('report.submit', r) || (isNew && me.role === 'expert') ? `<button class="btn btn-primary" id="sb">${I('send')}Gửi thẩm định</button>` : ''}${!isNew && F.can('report.publish', r) ? `<a class="btn btn-primary" href="${F.url('cms/publish.html?id=' + r.id)}">Đi tới phê duyệt</a>` : ''}</div></div>
      ${!editable ? `<div class="alert warn mb-16">${I('lock')}<span>Bạn đang xem ở chế độ chỉ đọc. ${r.status === 'in_review' ? 'Bài đang chờ thẩm định.' : r.status === 'pending_approval' ? 'Bài đang chờ phê duyệt xuất bản.' : 'Vai trò hiện tại không có quyền chỉnh sửa bài này.'}</span></div>` : ''}
      ${r.status === 'changes_requested' ? `<div class="alert danger mb-16">${I('alert')}<span>Thẩm định viên yêu cầu chỉnh sửa. Xem góp ý ở cột bên phải, cập nhật nội dung rồi gửi lại.</span></div>` : ''}
      <div class="editor-grid"><div class="stack-lg"><div class="card stack">
        <div class="field"><label for="tt">Tiêu đề báo cáo</label><input class="input" id="tt" value="${F.esc(r.title)}" placeholder="Tiêu đề rõ ràng, phản ánh câu hỏi nghiên cứu" ${editable ? '' : 'disabled'}><span class="error-text hidden" id="tte">Tiêu đề tối thiểu 10 ký tự.</span></div>
        <div class="field"><label for="dk">Mô tả ngắn (sapo)</label><textarea class="textarea" id="dk" style="min-height:70px" ${editable ? '' : 'disabled'}>${F.esc(r.dek)}</textarea></div>
        <div class="row wrap" style="gap:14px;align-items:flex-start"><div class="field" style="flex:1;min-width:180px"><label for="st">Luồng nghiên cứu</label><select class="select" id="st" ${editable ? '' : 'disabled'}>${Object.entries(F.STREAM).map(([k, v]) => `<option value="${k}" ${r.stream === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div class="field" style="flex:2;min-width:220px"><label for="tg">Thẻ chủ đề (phân cách bằng dấu phẩy)</label><input class="input" id="tg" value="${F.esc(r.tags.join(', '))}" ${editable ? '' : 'disabled'}></div></div>
        <div class="field"><label>Tóm tắt điều hành (Executive Summary) — 3 ý chính</label>${r.summary.map((s, i) => `<input class="input sm" data-sum="${i}" value="${F.esc(s)}" placeholder="Ý chính ${i + 1}" ${editable ? '' : 'disabled'}>`).join('')}<span class="hint">Hiển thị đầu bài và là phần xem trước (Teaser) khi áp dụng Paywall ở Phase 2.</span></div></div>
        <div><div class="rte-bar">${[['bold', 'bold', 'Đậm'], ['italic', 'italic', 'Nghiêng'], ['heading', 'h2', 'Tiêu đề mục'], ['quote', 'quote', 'Trích dẫn'], ['listUl', 'list', 'Danh sách']].map((b) => `<button type="button" data-cmd="${b[1]}" title="${b[2]}" ${editable ? '' : 'disabled'}>${I(b[0])}</button>`).join('')}<span class="sep"></span>${[['table', 'Chèn bảng số liệu'], ['bars', 'Chèn biểu đồ / infographic'], ['image', 'Chèn hình ảnh']].map((b) => `<button type="button" data-ins="${b[0]}" title="${b[1]}" ${editable ? '' : 'disabled'}>${I(b[0])}</button>`).join('')}</div>
        <div class="rte" id="rte" contenteditable="${editable}" spellcheck="false">${r.body.map(blockHtml).join('')}</div><div class="row between mt-8"><span class="hint">Tự động gắn Tuyên bố miễn trừ trách nhiệm đầu tư ở cuối bài khi xuất bản.</span><span class="hint num" id="wc"></span></div></div>
        <div class="card"><div class="card-head"><h3>Tài liệu PDF đính kèm</h3><span class="small muted">Tùy chọn · tối đa 30 MB</span></div><div id="pdfBox"></div></div>
      </div><aside class="stack-lg">${isNew ? '' : statusCard(r)}${commentsCard(r)}<div id="ai"></div></aside></div>`;
    const pdfBox = () => { $('#pdfBox').innerHTML = r.pdf ? `<div class="file-pill"><span class="fi">PDF</span><span class="grow"><b class="small">${F.esc((r.title || 'bao-cao').slice(0, 40))}.pdf</b><span class="xs muted" style="display:block">77 KB · 5 trang · đã quét virus</span></span>${editable ? `<button class="btn btn-ghost btn-xs" id="rmPdf">${I('trash')}Gỡ</button>` : ''}</div>` : editable ? `<label class="upload">${I('download').replace('<svg', '<svg style="width:22px;height:22px;margin:0 auto 6px"')}<b>Kéo thả hoặc bấm để tải lên tệp PDF</b><div class="xs muted mt-8">Trình đọc sẽ hiển thị bằng Native PDF Viewer trên app và pdf.js trên web</div><input type="file" accept="application/pdf" id="pdfIn" hidden></label>` : '<p class="small muted">Không có tệp đính kèm.</p>';
      const i = $('#pdfIn'); if (i) i.onchange = () => { r.pdf = true; pdfBox(); F.toast('Đã tải lên tệp PDF (mô phỏng)'); }; const rm = $('#rmPdf'); if (rm) rm.onclick = () => { r.pdf = false; pdfBox(); }; };
    pdfBox();
    const collect = () => {
      r.title = $('#tt').value.trim(); r.dek = $('#dk').value.trim(); r.stream = $('#st').value; r.tags = $('#tg').value.split(',').map((x) => x.trim()).filter(Boolean);
      r.summary = $$('[data-sum]').map((i) => i.value.trim());
      const old = r.body; const nb = [];
      Array.from($('#rte').childNodes).forEach((n) => {
        if (n.nodeType === 3) { if (n.textContent.trim()) nb.push({ t: 'p', x: n.textContent.trim() }); return; }
        if (n.dataset && n.dataset.keep != null) { nb.push(old[+n.dataset.keep]); return; }
        const tag = n.tagName; const x = n.textContent.trim(); if (!x) return;
        if (tag === 'H2' || tag === 'H3') nb.push({ t: 'h', x }); else if (tag === 'BLOCKQUOTE') nb.push({ t: 'quote', x }); else if (tag === 'UL' || tag === 'OL') Array.from(n.children).forEach((li) => li.textContent.trim() && nb.push({ t: 'p', x: '• ' + li.textContent.trim() })); else nb.push({ t: 'p', x });
      });
      r.body = nb.length ? nb : [{ t: 'p', x: '' }]; r.readTime = Math.max(3, Math.round(r.body.map((b) => b.x || '').join(' ').split(/\s+/).length / 180)); r.updatedAt = now();
    };
    const wc = () => { $('#wc').textContent = F.num($('#rte').innerText.trim().split(/\s+/).filter(Boolean).length) + ' từ'; }; wc();
    $('#rte').addEventListener('input', wc);
    $$('[data-cmd]').forEach((b) => (b.onclick = () => { $('#rte').focus(); const cmd = b.dataset.cmd; if (cmd === 'h2') document.execCommand('formatBlock', false, 'h2'); else if (cmd === 'quote') document.execCommand('formatBlock', false, 'blockquote'); else if (cmd === 'list') document.execCommand('insertUnorderedList'); else document.execCommand(cmd); }));
    $$('[data-ins]').forEach((b) => (b.onclick = () => F.toast('Mô phỏng: mở trình chèn ' + (b.dataset.ins === 'table' ? 'bảng số liệu' : b.dataset.ins === 'bars' ? 'biểu đồ / infographic' : 'hình ảnh'), 'info')));
    const persist = () => { collect(); if (isNew && !db().reports.includes(r)) { db().reports.push(r); } F.save(); };
    const validate = () => { let ok = true; if ($('#tt').value.trim().length < 10) { $('#tte').classList.remove('hidden'); $('#tt').classList.add('invalid'); ok = false; } const words = $('#rte').innerText.trim().split(/\s+/).filter(Boolean).length; if (words < 40) { F.toast('Nội dung cần tối thiểu 40 từ trước khi gửi thẩm định', 'error'); ok = false; } if ($$('[data-sum]').filter((i) => i.value.trim()).length < 2) { F.toast('Vui lòng nhập ít nhất 2 ý Tóm tắt điều hành', 'error'); ok = false; } return ok; };
    const sv = $('#sv'); if (sv) sv.onclick = () => { persist(); if (isNew) logH(r.id, 'Tạo bản nháp'); else logH(r.id, 'Lưu bản nháp'); F.save(); F.toast('Đã lưu nháp'); if (isNew) setTimeout(() => F.go('cms/editor.html?id=' + r.id), 500); };
    const sb = $('#sb'); if (sb) sb.onclick = () => { if (!validate()) return; F.confirm('Gửi bài tới FBV Review?', 'Sau khi gửi, bạn không thể chỉnh sửa cho đến khi thẩm định viên phản hồi. Vertex AI sẽ phân tích nội dung để gợi ý chỉ số liên quan.', 'Gửi thẩm định', 'btn-primary', () => { persist(); r.status = 'in_review'; r.submittedAt = now(); db().reviews = db().reviews.filter((x) => x.r !== r.id); logH(r.id, 'Gửi thẩm định'); runAI(r); F.save(); sessionStorage.setItem('fbv-cms-flash', 'Đã gửi thẩm định — AI đã tạo gợi ý liên kết chỉ số'); F.go('cms/reports.html'); }); };
    $('#pv').onclick = () => { collect(); F.modal({ title: 'Xem trước bài viết', size: 'lg', body: `<div class="article-head"><div>${F.streamBadge(r.stream)}</div><h1 style="font-size:26px">${F.esc(r.title || '(Chưa có tiêu đề)')}</h1><p class="dek" style="font-size:16px">${F.esc(r.dek)}</p></div><div class="exec-summary mt-16"><h4>Tóm tắt điều hành</h4><ul>${r.summary.filter(Boolean).map((s) => `<li>${F.esc(s)}</li>`).join('')}</ul></div><div class="article" style="font-size:16px">${F.renderBlocks(r)}</div><div class="disclaimer"><b>Tuyên bố miễn trừ trách nhiệm</b> được tự động gắn tại đây khi xuất bản.</div>` }); };
    const ai = $('#ai');
    if (F.can('ai.adjust') && !isNew) aiPanel(ai, r);
    else ai.innerHTML = `<div class="ai-panel"><div class="aph"><h3>${I('sparkles')}Liên kết ngữ cảnh — Vertex AI</h3><p>Chạy tự động khi bài được gửi thẩm định / xuất bản.</p></div><div class="apb small sub">${db().links.filter((l) => l.r === r.id && l.s !== 'rejected').length ? db().links.filter((l) => l.r === r.id && l.s !== 'rejected').map((l) => `<div class="row between"><span>${F.esc(F.ind(l.i).name)}</span><span class="badge ${l.s === 'suggested' ? 's-in_review' : 's-published'}">${l.s === 'suggested' ? 'Chờ biên tập duyệt' : 'Đã duyệt'}</span></div>`).join('') : 'Chưa có gợi ý cho bài này. Biên tập viên sẽ kiểm duyệt gợi ý của AI trước khi xuất bản.'}</div></div>`;
  };

  /* ================= C06 · Thẩm định học thuật ================= */
  pages.cmsReview = () => {
    if (!guard()) return; const r = F.report(F.param('id') || 'r14');
    const c = F.cmsShell('reports', [['Báo cáo', 'cms/reports.html'], ['Thẩm định học thuật']]);
    if (!r) { c.innerHTML = F.empty('file', 'Không tìm thấy báo cáo', '', ''); return; }
    const can = F.can('report.review', r); const e = F.expert(r.author);
    const CL = ['Nguồn số liệu được ghi rõ, có thể kiểm chứng', 'Phương pháp phân tích phù hợp với kết luận', 'Không chứa khuyến nghị mua/bán tài sản cụ thể', 'Tuân thủ pháp lý & có disclaimer phù hợp', 'Ngôn ngữ học thuật, trình bày mạch lạc'];
    const checked = new Set();
    const draw = () => {
      const cs = db().reviews.filter((x) => x.r === r.id);
      c.innerHTML = `<div class="page-head"><div><div class="row" style="gap:10px">${F.statusBadge(r.status)}<span class="small muted">Gửi ${F.ago(r.submittedAt || now())} bởi ${F.esc(e.name)}</span></div><h1 class="mt-8" style="font-size:24px">${F.esc(r.title)}</h1></div></div>
        ${can ? `<div class="alert info mb-16">${I('info')}<span>Bấm vào đoạn văn bất kỳ để thêm góp ý tại chỗ. Hoàn thành checklist để chuyển bài sang phê duyệt xuất bản.</span></div>` : `<div class="alert warn mb-16">${I('lock')}<span>Chỉ Thẩm định viên (hoặc Quản trị) mới thực hiện được thẩm định${r.status !== 'in_review' ? ' — bài hiện không ở trạng thái Chờ thẩm định' : ''}.</span></div>`}
        <div class="editor-grid"><div class="card" style="padding:28px 56px 28px 36px"><div class="article-head"><div class="row wrap" style="gap:6px">${F.streamBadge(r.stream)}${r.tags.map((t) => `<span class="badge">${F.esc(t)}</span>`).join('')}</div><h1 style="font-size:26px">${F.esc(r.title)}</h1><p class="dek" style="font-size:16px">${F.esc(r.dek)}</p></div>
          <div class="exec-summary mt-16"><h4>Tóm tắt điều hành</h4><ul>${r.summary.map((s) => `<li>${F.esc(s)}</li>`).join('')}</ul></div>
          <div class="article" style="font-size:16.5px">${r.body.map((b, i) => { const n = cs.filter((x) => x.block === i).length; const inner = b.t === 'p' ? F.esc(b.x) : b.t === 'h' ? `<b style="font-size:20px">${F.esc(b.x)}</b>` : b.t === 'quote' ? `<i>${F.esc(b.x)}</i>` : `<span class="small muted">[${b.t === 'table' ? 'Bảng' : 'Biểu đồ'}: ${F.esc(b.cap || b.title)}]</span>`; return `<div class="review-para ${n ? 'has-c' : ''}" data-b="${i}" ${can ? 'role="button" tabindex="0"' : ''}>${inner}${n ? `<span class="c-count">${n}</span>` : ''}</div>`; }).join('')}</div>
          ${r.pdf ? `<div class="file-pill mt-16"><span class="fi">PDF</span><span class="grow small">Tệp PDF đính kèm</span><a class="btn btn-ghost btn-xs" href="${F.url('assets/media/sample-report.pdf')}" target="_blank">${I('eye')}Mở</a></div>` : ''}</div>
        <aside class="stack-lg"><div class="card"><div class="card-head"><h3>Checklist thẩm định</h3><span class="small muted num" id="clc">${checked.size}/${CL.length}</span></div><div class="checklist">${CL.map((x, i) => `<label class="checkbox"><input type="checkbox" data-cl="${i}" ${checked.has(i) ? 'checked' : ''} ${can ? '' : 'disabled'}><span>${x}</span></label>`).join('')}</div></div>
          <div class="card"><div class="card-head"><h3>Góp ý</h3><span class="badge">${cs.length}</span></div>${cs.length ? `<div class="stack">${cs.map((x) => `<div class="comment"><div class="ch"><b>${F.esc(F.person(x.by).name)}</b><span>${F.ago(x.at)}${can ? ` · <a href="#" data-dc="${x.id}">Xóa</a>` : ''}</span></div>${r.body[x.block] ? `<div class="cq">Đoạn #${x.block + 1}: “${F.esc((r.body[x.block].x || '').slice(0, 90))}”</div>` : ''}${F.esc(x.x)}</div>`).join('')}</div>` : '<p class="small muted">Chưa có góp ý. Bấm vào đoạn văn để thêm.</p>'}${can ? `<button class="btn btn-ghost btn-sm mt-12" id="gc">${I('plus')}Góp ý chung</button>` : ''}</div>
          ${can ? `<div class="card stack"><h3>Kết luận thẩm định</h3><button class="btn btn-success btn-block" id="ok">${I('checkCircle')}Đạt — chuyển phê duyệt</button><button class="btn btn-danger-soft btn-block" id="rq">${I('edit')}Yêu cầu chỉnh sửa</button><p class="hint">“Đạt” yêu cầu hoàn thành checklist. “Yêu cầu chỉnh sửa” cần ít nhất 1 góp ý.</p></div>` : ''}
          <div class="card"><div class="card-head"><h3>Gợi ý AI (tham khảo)</h3></div><div class="stack small">${db().links.filter((l) => l.r === r.id).map((l) => `<div class="row between"><span>${F.esc(F.ind(l.i).name)}</span><span class="num muted">${Math.round(l.c * 100)}%</span></div>`).join('') || '<span class="muted">Không có</span>'}</div><p class="hint mt-12">Biên tập viên sẽ duyệt liên kết ở bước phê duyệt.</p></div></aside></div>`;
      if (!can) return;
      const addC = (block) => F.modal({ title: block == null ? 'Góp ý chung' : 'Góp ý cho đoạn #' + (block + 1), body: `${block != null ? `<div class="quote-block mb-12">${F.esc((r.body[block].x || r.body[block].cap || r.body[block].title || '').slice(0, 240))}</div>` : ''}<textarea class="textarea" id="cx" placeholder="Nhận xét, yêu cầu bổ sung nguồn, chỉnh sửa lập luận…"></textarea>`, actions: [{ label: 'Hủy' }, { label: 'Thêm góp ý', cls: 'btn-primary', onClick: (cl, el) => { const v = $('#cx', el).value.trim(); if (!v) return false; db().reviews.push({ id: F.uid('c'), r: r.id, block: block == null ? -1 : block, by: F.cmsMe().id, at: now(), x: v }); F.save(); draw(); } }] });
      $$('.review-para').forEach((p) => { p.onclick = () => addC(+p.dataset.b); p.onkeydown = (ev) => { if (ev.key === 'Enter') addC(+p.dataset.b); }; });
      $('#gc').onclick = () => addC(null);
      $$('[data-dc]').forEach((a) => (a.onclick = (ev) => { ev.preventDefault(); db().reviews = db().reviews.filter((x) => x.id !== a.dataset.dc); F.save(); draw(); }));
      $$('[data-cl]').forEach((i) => (i.onchange = () => { i.checked ? checked.add(+i.dataset.cl) : checked.delete(+i.dataset.cl); $('#clc').textContent = checked.size + '/' + CL.length; }));
      $('#ok').onclick = () => { if (checked.size < CL.length) { F.toast('Vui lòng hoàn thành đủ ' + CL.length + ' mục checklist', 'error'); return; } F.confirm('Xác nhận thẩm định đạt?', 'Bài sẽ chuyển tới Biên tập viên để duyệt liên kết AI và xuất bản.', 'Xác nhận', 'btn-success', () => { r.status = 'pending_approval'; r.reviewedAt = now(); logH(r.id, 'Thẩm định đạt — chuyển phê duyệt'); F.save(); sessionStorage.setItem('fbv-cms-flash', 'Đã chuyển bài sang phê duyệt'); F.go('cms/reports.html'); }); };
      $('#rq').onclick = () => { if (!db().reviews.filter((x) => x.r === r.id).length) { F.toast('Hãy thêm ít nhất 1 góp ý trước khi yêu cầu chỉnh sửa', 'error'); return; } F.confirm('Gửi yêu cầu chỉnh sửa?', 'Tác giả sẽ nhận thông báo kèm các góp ý của bạn.', 'Gửi yêu cầu', 'btn-danger', () => { r.status = 'changes_requested'; logH(r.id, `Yêu cầu chỉnh sửa (${db().reviews.filter((x) => x.r === r.id).length} góp ý)`); F.save(); sessionStorage.setItem('fbv-cms-flash', 'Đã gửi yêu cầu chỉnh sửa tới tác giả'); F.go('cms/reports.html'); }); };
    };
    draw();
  };

  /* ================= C07 · Phê duyệt & Xuất bản (kèm C05) ================= */
  pages.cmsPublish = () => {
    if (!guard()) return; const r = F.report(F.param('id') || 'r16');
    const c = F.cmsShell('reports', [['Báo cáo', 'cms/reports.html'], ['Phê duyệt & Xuất bản']]);
    if (!r) { c.innerHTML = F.empty('file', 'Không tìm thấy báo cáo', '', ''); return; }
    const can = F.can('report.publish', r); let dev = 'web';
    c.innerHTML = `<div class="page-head"><div><div class="row" style="gap:10px">${F.statusBadge(r.status)}<span class="small muted">${F.esc(F.expert(r.author).name)}</span></div><h1 class="mt-8" style="font-size:24px">${F.esc(r.title)}</h1></div><div class="seg" id="dv"><button class="active" data-d="web">${I('monitor').replace('<svg', '<svg style="width:15px;height:15px;display:inline;vertical-align:-3px"')} Web</button><button data-d="mobile">${I('phone').replace('<svg', '<svg style="width:15px;height:15px;display:inline;vertical-align:-3px"')} Mobile</button></div></div>
      ${!can ? `<div class="alert warn mb-16">${I('lock')}<span>${r.status === 'published' ? 'Bài đã được xuất bản. ' : ''}${F.can('ai.adjust') ? '' : 'Chỉ Biên tập viên / Quản trị được phê duyệt xuất bản và điều chỉnh liên kết AI.'}</span></div>` : ''}
      <div class="editor-grid"><div><div class="device-frame web" id="frame"><div class="preview-inner" id="pvw"></div></div></div>
      <aside class="stack-lg"><div id="ai"></div>
        ${can ? `<div class="card stack"><h3>Xuất bản</h3><div class="radio-list"><label><input type="radio" name="when" value="now" checked>Xuất bản ngay</label><label><input type="radio" name="when" value="later">Lên lịch</label></div><input class="input sm hidden" type="datetime-local" id="dt">
          <label class="checkbox"><input type="checkbox" id="nf" checked>Gửi thông báo tới độc giả quan tâm & người theo dõi tác giả</label>
          <label class="checkbox"><input type="checkbox" id="pm" ${r.premium ? 'checked' : ''}>Nội dung Premium (áp dụng Paywall ở Phase 2)</label>
          <div class="perm-note">${I('shieldCheck')}<span>Đã thẩm định bởi <b>${F.esc(F.person('s1').name)}</b>${r.reviewedAt ? ' · ' + F.ago(r.reviewedAt) : ''}. Disclaimer sẽ tự động gắn cuối bài.</span></div>
          <button class="btn btn-primary btn-block" id="pub">${I('send')}Xuất bản</button><button class="btn btn-ghost btn-sm btn-block" id="back">Trả lại thẩm định</button></div>` : ''}
        ${F.can('report.archive', r) ? `<div class="card stack"><h3>Bài đã xuất bản</h3><a class="btn btn-secondary btn-block" href="${F.url('reader/report.html?id=' + r.id)}" target="_blank">${I('external')}Xem trên web</a><button class="btn btn-danger-soft btn-block" id="arc">${I('trash')}Gỡ bài (lưu trữ)</button></div>` : ''}
        ${statusCard(r)}</aside></div>`;
    const preview = () => { const w = F.linksOfReport(r.id); $('#pvw').innerHTML = `<div class="article-head"><div class="row wrap" style="gap:6px">${F.streamBadge(r.stream)}${r.premium && F.session().phase2 ? '<span class="badge premium">Premium</span>' : ''}</div><h1 style="font-size:${dev === 'web' ? 28 : 22}px">${F.esc(r.title)}</h1><p class="dek" style="font-size:${dev === 'web' ? 17 : 15}px">${F.esc(r.dek)}</p></div><div class="byline">${F.avatar(F.expert(r.author), 'sm')}<span class="small"><b>${F.esc(F.expert(r.author).name)}</b> ${F.verifiedTag(F.expert(r.author), '')}</span></div><div class="exec-summary"><h4>Tóm tắt điều hành</h4><ul>${r.summary.map((s) => `<li>${F.esc(s)}</li>`).join('')}</ul></div><div class="article" id="pa" style="font-size:${dev === 'web' ? 17 : 15.5}px">${F.renderBlocks(r)}</div><div class="disclaimer"><b>Tuyên bố miễn trừ trách nhiệm.</b> Báo cáo được thực hiện cho mục đích nghiên cứu và thông tin, không phải khuyến nghị đầu tư…</div><p class="hint mt-12">${w.length} widget chỉ số sẽ được chèn vào bài.</p>`; F.mountFigures(r, $('#pa')); };
    $$('#dv button').forEach((b) => (b.onclick = () => { dev = b.dataset.d; $$('#dv button').forEach((x) => x.classList.toggle('active', x === b)); $('#frame').className = 'device-frame ' + (dev === 'web' ? 'web' : ''); preview(); }));
    preview(); aiPanel($('#ai'), r, preview);
    if (can) {
      $$('input[name=when]').forEach((i) => (i.onchange = () => { $('#dt').classList.toggle('hidden', i.value !== 'later' || !i.checked); if (i.value === 'later') { const d = new Date(Date.now() + 864e5); d.setMinutes(0); $('#dt').value = new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); } }));
      $('#pub').onclick = () => {
        const pend = db().links.filter((l) => l.r === r.id && l.s === 'suggested').length;
        const later = $('input[name=when]:checked').value === 'later';
        F.modal({ title: later ? 'Lên lịch xuất bản?' : 'Xuất bản báo cáo?', body: `<div class="stack"><p class="sub">${later ? 'Bài sẽ tự động xuất bản vào ' + F.date(new Date($('#dt').value).toISOString(), true) + '.' : 'Bài sẽ hiển thị ngay trên web và ứng dụng.'}</p>${pend ? `<div class="alert warn">${I('alert')}<span>Còn <b>${pend}</b> gợi ý AI chưa duyệt — sẽ không được chèn vào bài.</span></div>` : ''}<div class="small sub">${F.linksOfReport(r.id).length} widget chỉ số · ${$('#nf').checked ? 'Có gửi thông báo' : 'Không gửi thông báo'}</div></div>`,
          actions: [{ label: 'Hủy' }, { label: later ? 'Lên lịch' : 'Xuất bản', cls: 'btn-primary', onClick: () => {
            r.premium = $('#pm').checked;
            if (later) { r.status = 'scheduled'; r.scheduledAt = new Date($('#dt').value).toISOString(); logH(r.id, 'Lên lịch xuất bản'); }
            else { r.status = 'published'; r.publishedAt = now(); r.views = r.views || 0; logH(r.id, 'Xuất bản'); if ($('#nf').checked) db().users.filter((u) => u.status === 'active' && (u.interests.includes(r.stream) || u.follows.includes(r.author))).forEach((u) => db().notifications.push({ id: F.uid('n'), user: u.id, type: 'report', ref: r.id, text: `Báo cáo mới trong ${F.STREAM[r.stream]}: "${r.title}".`, at: now(), read: false })); }
            F.save();
            F.modal({ title: later ? 'Đã lên lịch' : 'Đã xuất bản', body: `<div class="center stack" style="align-items:center"><div class="avatar lg" style="background:#DCFCE7;color:#15803D">${I('checkCircle').replace('<svg', '<svg style="width:40px;height:40px"')}</div><p class="sub">${later ? 'Báo cáo sẽ được xuất bản theo lịch.' : 'Báo cáo đã hiển thị trên Research Feed và được liên kết với các chỉ số đã duyệt.'}</p></div>`, actions: [{ label: 'Về danh sách', onClick: () => F.go('cms/reports.html') }, ...(later ? [] : [{ label: 'Xem trên web', cls: 'btn-primary', onClick: () => F.go('reader/report.html?id=' + r.id) }])] });
          } }] });
      };
      $('#back').onclick = () => F.confirm('Trả lại thẩm định?', 'Bài sẽ quay về trạng thái Chờ thẩm định.', 'Trả lại', 'btn-secondary', () => { r.status = 'in_review'; logH(r.id, 'Trả lại thẩm định'); F.save(); F.go('cms/reports.html'); });
    }
    const arc = $('#arc'); if (arc) arc.onclick = () => F.confirm('Gỡ bài khỏi trang độc giả?', 'Bài sẽ chuyển vào Lưu trữ, liên kết cũ hiển thị thông báo “bài đã được gỡ”.', 'Gỡ bài', 'btn-danger', () => { r.status = 'archived'; logH(r.id, 'Gỡ bài (lưu trữ)'); F.save(); F.toast('Đã gỡ bài'); setTimeout(() => location.reload(), 400); });
  };

  /* ================= C09 · Hàng đợi phản biện ================= */
  pages.cmsInquiries = () => {
    if (!guard()) return; const me = F.cmsMe(); const c = F.cmsShell('inquiries', [['Dashboard', 'cms/index.html'], ['Phản biện 1:1']]);
    const all = me.role === 'expert' ? db().inquiries.filter((q) => q.expert === me.id) : db().inquiries;
    let tab = F.param('t') || 'todo'; let ex = '';
    const G = { todo: (q) => ['new', 'assigned', 'in_progress'].includes(q.status), late: (q) => ['new', 'assigned', 'in_progress'].includes(q.status) && new Date(q.slaDue) < Date.now(), answered: (q) => q.status === 'answered', closed: (q) => q.status === 'closed', reported: (q) => q.status === 'reported', all: () => true };
    c.innerHTML = `<div class="page-head"><div><h1>Phản biện 1:1</h1><p>SLA phản hồi: ${db().config.slaHours} giờ · Hạn mức độc giả miễn phí: ${db().config.quotaPerMonth} phiên/30 ngày</p></div></div><div class="tabs mb-16" id="tb"></div>${me.role !== 'expert' ? `<div class="toolbar"><select class="select sm" id="ex" style="width:auto"><option value="">Mọi chuyên gia</option>${db().experts.map((e) => `<option value="${e.id}">${F.esc(e.name)}</option>`).join('')}</select></div>` : ''}<div id="tbl"></div>`;
    const draw = () => {
      $('#tb').innerHTML = [['todo', 'Cần xử lý'], ['late', 'Quá SLA'], ['answered', 'Đã trả lời'], ['closed', 'Đã đóng'], ['reported', 'Bị báo cáo'], ['all', 'Tất cả']].map((t) => `<button class="tab ${tab === t[0] ? 'active' : ''}" data-t="${t[0]}">${t[1]}<span class="count">${all.filter(G[t[0]]).length}</span></button>`).join('');
      $$('#tb .tab').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
      const list = all.filter(G[tab]).filter((q) => !ex || q.expert === ex).sort((a, b) => new Date(a.slaDue) - new Date(b.slaDue));
      $('#tbl').innerHTML = list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Phiên</th><th>Độc giả</th><th>Trích dẫn / Báo cáo</th><th>Chuyên gia</th><th>Trạng thái</th><th>SLA</th><th class="r"></th></tr></thead><tbody>${list.map((q) => { const last = q.messages[q.messages.length - 1]; return `<tr><td class="small num"><b>#${q.id.toUpperCase()}</b>${q.expertUnread && me.role === 'expert' ? ' <span class="badge i-new">Mới</span>' : ''}<div class="xs muted">${F.ago(last.at)}</div></td><td class="small">${F.esc(F.user(q.reader).name)}</td><td style="max-width:360px"><div class="small" style="font-family:var(--font-read);font-style:italic;color:var(--text-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">“${F.esc(q.quote)}”</div><div class="xs muted mt-8" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${F.esc(F.report(q.r).title)}</div></td><td class="small">${F.esc(F.expert(q.expert).short)}</td><td>${F.iStatusBadge(q.status)}</td><td>${slaEl(q)}</td><td class="r"><a class="btn btn-secondary btn-xs" href="${F.url('cms/inquiry.html?id=' + q.id)}">Mở</a></td></tr>`; }).join('')}</tbody></table></div>` : F.empty('inbox', 'Không có phiên nào', 'Không có phiên phản biện trong mục này.');
    };
    const e = $('#ex'); if (e) e.onchange = (ev) => { ex = ev.target.value; draw(); };
    draw();
  };

  /* ================= C10 · Chi tiết phiên (CMS) ================= */
  pages.cmsInquiry = () => {
    if (!guard()) return; const me = F.cmsMe(); const q = F.inquiry(F.param('id') || 'q4');
    const c = F.cmsShell('inquiries', [['Phản biện 1:1', 'cms/inquiries.html'], ['#' + (q ? q.id.toUpperCase() : '')]]);
    if (!q || (me.role === 'expert' && q.expert !== me.id)) { c.innerHTML = F.empty('lock', 'Không có quyền truy cập', 'Phiên không tồn tại hoặc không thuộc phạm vi của bạn.', ''); return; }
    if (me.role === 'expert') { q.expertUnread = false; F.save(); }
    if (q.note && !q.notes) { q.notes = [{ by: 's2', at: q.createdAt, x: q.note }]; }
    q.notes = q.notes || [];
    const r = F.report(q.r); const rd = F.user(q.reader); let mode = F.can('inquiry.reply', q) ? 'reply' : 'note';
    const draw = () => {
      const canReply = F.can('inquiry.reply', q) && !['closed', 'reported'].includes(q.status); const canNote = F.can('inquiry.note', q) || me.role === 'expert';
      if (!canReply && mode === 'reply') mode = 'note';
      const items = q.messages.map((m) => ({ ...m, k: 'm' })).concat(q.notes.map((n) => ({ ...n, k: 'n' }))).sort((a, b) => new Date(a.at) - new Date(b.at));
      c.innerHTML = `<div class="page-head"><div><div class="row" style="gap:10px">${F.iStatusBadge(q.status)}${slaEl(q)}</div><h1 class="mt-8" style="font-size:22px">Phiên #${q.id.toUpperCase()} · ${F.esc(rd.name)}</h1></div></div>
        <div class="editor-grid"><div class="stack-lg"><div class="card"><div class="section-title">Trích dẫn từ báo cáo</div><div class="quote-block">“${F.esc(q.quote)}”<span class="qsrc"><a href="${F.url('reader/report.html?id=' + r.id + '#p' + q.block)}" target="_blank">${F.esc(r.title)} — đoạn #${q.block + 1} ↗</a></span></div></div>
          <div class="thread">${items.map((m) => { const p = F.person(m.by); const isReader = m.by === q.reader; return m.k === 'n' ? `<div class="msg note">${F.avatar(p, 'sm')}<div><div class="mh"><b>${F.esc(p.name)}</b><span class="badge" style="background:#FEF3C7;color:#92400E">Ghi chú nội bộ</span><span>${F.ago(m.at)}</span></div><div class="bubble">${F.esc(m.x)}</div></div></div>` : `<div class="msg ${isReader ? '' : 'mine'}">${F.avatar(p, 'sm')}<div><div class="mh"><b>${isReader ? F.esc(p.name) : F.esc(p.name) + (m.by === q.expert ? '' : ' (thay mặt FBV)')}</b><span>${F.ago(m.at)}</span></div><div class="bubble">${m.anon ? '<i class="muted">[Độc giả đã xóa tài khoản]</i>' : F.esc(m.x)}</div></div></div>`; }).join('')}</div>
          ${canReply || canNote ? `<div><div class="seg mb-8">${canReply ? `<button class="${mode === 'reply' ? 'active' : ''}" data-m="reply">Trả lời độc giả</button>` : ''}${canNote ? `<button class="${mode === 'note' ? 'active' : ''}" data-m="note">Ghi chú nội bộ</button>` : ''}</div><div class="composer" style="${mode === 'note' ? 'background:#FFFBEB;border-color:#F4D58D' : ''}"><textarea id="rp" rows="2" placeholder="${mode === 'reply' ? 'Phản hồi học thuật tới độc giả… (không đưa ra khuyến nghị mua/bán)' : 'Ghi chú chỉ hiển thị trong CMS…'}"></textarea><button class="btn ${mode === 'reply' ? 'btn-primary' : 'btn-navy'}" id="sd">${I('send')}${mode === 'reply' ? 'Gửi' : 'Lưu ghi chú'}</button></div>${mode === 'reply' ? `<p class="hint mt-8">Độc giả sẽ nhận thông báo in-app & push. Nội dung trả lời có thể được trích vào bản cập nhật báo cáo.</p>` : ''}</div>` : `<div class="perm-note">${I('lock')}<span>Vai trò hiện tại không được trả lời phiên này.</span></div>`}</div>
        <aside class="stack-lg"><div class="card"><div class="card-head"><h3>Thông tin phiên</h3></div><div class="stack small">
          <div class="row between"><span class="muted">Độc giả</span><span>${F.esc(rd.name)}</span></div><div class="row between"><span class="muted">Tham gia</span><span>${F.date(rd.joined)}</span></div><div class="row between"><span class="muted">Số phiên đã gửi</span><span class="num">${db().inquiries.filter((x) => x.reader === rd.id).length}</span></div>
          <div class="row between"><span class="muted">Mở lúc</span><span>${F.date(q.createdAt, true)}</span></div><div class="row between"><span class="muted">Hạn SLA</span><span>${F.date(q.slaDue, true)}</span></div>
          <div class="field mt-8"><label for="as">Chuyên gia phụ trách</label><select class="select sm" id="as" ${F.can('inquiry.assign') ? '' : 'disabled'}>${db().experts.map((e) => `<option value="${e.id}" ${e.id === q.expert ? 'selected' : ''}>${F.esc(e.name)}${e.id === r.author ? ' (tác giả)' : ''}</option>`).join('')}</select></div></div></div>
          <div class="card stack"><h3>Thao tác</h3>${!['closed'].includes(q.status) ? `<button class="btn btn-secondary btn-sm btn-block" id="cl">${I('checkCircle')}Đóng phiên</button>` : `<button class="btn btn-secondary btn-sm btn-block" id="ro">${I('refresh')}Mở lại phiên</button>`}${me.role === 'expert' ? `<button class="btn btn-danger-soft btn-sm btn-block" id="rpv">${I('flag')}Báo cáo vi phạm & chặn độc giả</button>` : ''}${F.can('inquiry.assign') && ['new', 'assigned', 'in_progress'].includes(q.status) ? `<button class="btn btn-ghost btn-sm btn-block" id="rm">${I('bell')}Nhắc chuyên gia</button>` : ''}</div></aside></div>`;
      $$('[data-m]').forEach((b) => (b.onclick = () => { mode = b.dataset.m; draw(); }));
      const sd = $('#sd'); if (sd) sd.onclick = () => { const v = $('#rp').value.trim(); if (!v) return;
        if (mode === 'reply') { q.messages.push({ by: me.role === 'expert' ? me.id : me.id, at: now(), x: v }); q.status = 'answered'; q.readerUnread = true; db().notifications.push({ id: F.uid('n'), user: q.reader, type: 'answer', ref: q.id, text: `${me.role === 'expert' ? me.name : 'FBV'} đã trả lời phản biện của bạn về "${r.title}".`, at: now(), read: false }); F.toast('Đã gửi trả lời — độc giả đã được thông báo'); }
        else { q.notes.push({ by: me.id, at: now(), x: v }); F.toast('Đã lưu ghi chú nội bộ'); }
        F.save(); draw(); };
      const as = $('#as'); if (as) as.onchange = () => { q.expert = as.value; if (q.status === 'new') q.status = 'assigned'; q.notes.push({ by: me.id, at: now(), x: 'Đã phân công cho ' + F.expert(as.value).name + '.' }); F.save(); F.toast('Đã phân công chuyên gia'); draw(); };
      const cl = $('#cl'); if (cl) cl.onclick = () => F.confirm('Đóng phiên?', 'Độc giả sẽ không gửi thêm phản hồi trong phiên này.', 'Đóng phiên', 'btn-primary', () => { q.status = 'closed'; F.save(); draw(); });
      const ro = $('#ro'); if (ro) ro.onclick = () => { q.status = 'in_progress'; F.save(); draw(); };
      const rm = $('#rm'); if (rm) rm.onclick = () => { q.notes.push({ by: me.id, at: now(), x: 'Đã gửi nhắc nhở tới chuyên gia qua email & push.' }); F.save(); F.toast('Đã nhắc chuyên gia'); draw(); };
      const rpv = $('#rpv'); if (rpv) rpv.onclick = () => F.modal({ title: 'Báo cáo vi phạm', body: `<div class="radio-list">${['Ngôn từ xúc phạm / quấy rối', 'Spam hoặc quảng cáo', 'Lôi kéo đầu tư trái phép', 'Khác'].map((x, i) => `<label><input type="radio" name="rr" value="${x}" ${i ? '' : 'checked'}>${x}</label>`).join('')}</div><label class="checkbox mt-12"><input type="checkbox" id="bk" checked>Chặn độc giả này (không nhận phiên mới)</label>`, actions: [{ label: 'Hủy' }, { label: 'Gửi báo cáo', cls: 'btn-danger', onClick: (cc, el) => { db().moderation.unshift({ id: F.uid('m'), type: 'inquiry', ref: q.id, reporter: me.id, target: q.reader, reason: $('input[name=rr]:checked', el).value, detail: 'Chuyên gia báo cáo từ CMS.', status: 'open', createdAt: now() }); q.status = 'reported'; F.save(); F.toast('Đã gửi báo cáo tới Quản trị'); draw(); } }] });
    };
    draw();
  };

  /* ================= C11 · Kiểm duyệt vi phạm ================= */
  pages.cmsModeration = () => {
    if (!guard()) return; const c = F.cmsShell('moderation', [['Dashboard', 'cms/index.html'], ['Kiểm duyệt vi phạm']]); let tab = 'open';
    const can = F.can('moderate');
    const draw = () => {
      const list = db().moderation.filter((m) => (tab === 'open' ? m.status === 'open' : m.status !== 'open'));
      c.innerHTML = `<div class="page-head"><div><h1>Kiểm duyệt vi phạm</h1><p>Mục tiêu xử lý mọi báo cáo trong 24 giờ (yêu cầu App Store Guideline 1.2 — nội dung người dùng tạo).</p></div></div>${can ? '' : `<div class="alert warn mb-16">${I('lock')}<span>Chỉ Quản trị được ra quyết định xử lý. Bạn đang ở chế độ xem.</span></div>`}
        <div class="tabs mb-16"><button class="tab ${tab === 'open' ? 'active' : ''}" data-t="open">Chờ xử lý<span class="count">${db().moderation.filter((m) => m.status === 'open').length}</span></button><button class="tab ${tab === 'done' ? 'active' : ''}" data-t="done">Đã xử lý<span class="count">${db().moderation.filter((m) => m.status !== 'open').length}</span></button></div>
        ${list.length ? `<div class="stack">${list.map((m) => { const q = F.inquiry(m.ref); const tg = F.person(m.target); return `<div class="card"><div class="row between wrap" style="align-items:flex-start"><div class="grow" style="min-width:260px"><div class="row wrap" style="gap:8px"><span class="badge i-reported">${F.esc(m.reason)}</span><span class="xs muted">${F.ago(m.createdAt)} · Phiên #${m.ref.toUpperCase()}</span>${m.status !== 'open' ? `<span class="badge">${{ dismissed: 'Đã bỏ qua', warned: 'Đã cảnh cáo & ẩn nội dung', locked: 'Đã khóa tài khoản' }[m.status]}</span>` : ''}</div>
          <p class="mt-12 small"><b>${F.esc(F.person(m.reporter).name)}</b> báo cáo <b>${F.esc(tg.name)}</b>${F.expert(m.target) ? ' (chuyên gia)' : ' (độc giả)'}</p><p class="small sub mt-8">${F.esc(m.detail)}</p>${q ? `<div class="quote-block mt-12" style="font-size:13.5px">${F.esc(q.messages[q.messages.length - 1].x.slice(0, 220))}<span class="qsrc"><a href="${F.url('cms/inquiry.html?id=' + q.id)}">Mở phiên trao đổi →</a></span></div>` : ''}</div>
          ${can && m.status === 'open' ? `<div class="stack" style="min-width:200px"><button class="btn btn-secondary btn-sm" data-a="dismissed" data-m="${m.id}">Bỏ qua (không vi phạm)</button><button class="btn btn-sm" style="background:#FEF3C7;color:#92400E" data-a="warned" data-m="${m.id}">Ẩn nội dung & cảnh cáo</button><button class="btn btn-danger btn-sm" data-a="locked" data-m="${m.id}">${I('ban')}Khóa tài khoản</button></div>` : ''}</div></div>`; }).join('')}</div>` : F.empty('shieldCheck', tab === 'open' ? 'Không có báo cáo chờ xử lý' : 'Chưa có báo cáo đã xử lý', 'Cộng đồng đang an toàn.')}`;
      $$('.tab[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
      $$('[data-a]').forEach((b) => (b.onclick = () => { const m = db().moderation.find((x) => x.id === b.dataset.m); const act = b.dataset.a; F.confirm({ dismissed: 'Bỏ qua báo cáo?', warned: 'Ẩn nội dung & cảnh cáo?', locked: 'Khóa tài khoản ' + F.esc(F.person(m.target).name) + '?' }[act], act === 'locked' ? 'Người dùng sẽ không thể đăng nhập và gửi phản biện. Hành động được ghi nhật ký.' : 'Hành động sẽ được ghi nhật ký kiểm duyệt.', 'Xác nhận', act === 'locked' ? 'btn-danger' : 'btn-primary', () => { m.status = act; m.resolvedAt = now(); const u = F.user(m.target); if (act === 'locked' && u) u.status = 'locked'; const q = F.inquiry(m.ref); if (q && act !== 'dismissed') q.status = 'closed'; F.save(); F.toast('Đã xử lý báo cáo'); draw(); }); }));
    };
    draw();
  };

  /* ================= C12 · Chuyên gia ================= */
  pages.cmsExperts = () => {
    if (!guard()) return; const c = F.cmsShell('experts', [['Dashboard', 'cms/index.html'], ['Chuyên gia']]); const can = F.can('experts.manage');
    const draw = () => { c.innerHTML = `<div class="page-head"><div><h1>Chuyên gia</h1><p>Hồ sơ tác giả và huy hiệu “Verified by FBV”.</p></div>${can ? `<button class="btn btn-primary" id="ad">${I('plus')}Mời chuyên gia</button>` : ''}</div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Chuyên gia</th><th>Lĩnh vực</th><th class="r">Bài đã xuất bản</th><th class="r">Phản biện đang mở</th><th class="r">Quá SLA</th><th>Verified by FBV</th><th></th></tr></thead><tbody>${db().experts.map((e) => { const open = db().inquiries.filter((q) => q.expert === e.id && ['new', 'assigned', 'in_progress'].includes(q.status)); return `<tr><td><div class="row">${F.avatar(e, 'sm')}<div><b>${F.esc(e.name)}</b><div class="xs muted">${F.esc(e.title)} · ${F.esc(e.org)}</div></div></div></td><td>${e.fields.map(F.streamBadge).join(' ')}</td><td class="r num">${F.published().filter((r) => r.author === e.id).length}</td><td class="r num">${open.length}</td><td class="r num ${open.some((q) => new Date(q.slaDue) < Date.now()) ? 'down' : ''}">${open.filter((q) => new Date(q.slaDue) < Date.now()).length}</td><td><label class="switch" title="${can ? 'Bật/tắt huy hiệu' : 'Chỉ Quản trị'}"><input type="checkbox" data-v="${e.id}" ${e.verified ? 'checked' : ''} ${can ? '' : 'disabled'}><span></span></label></td><td class="r"><a class="btn btn-ghost btn-xs" href="${F.url('reader/expert.html?id=' + e.id)}" target="_blank">${I('external')}</a></td></tr>`; }).join('')}</tbody></table></div>
      <p class="hint mt-12">Huy hiệu chỉ được cấp sau khi Hội đồng FBV xác minh học vị, đơn vị công tác và lĩnh vực chuyên môn.</p>`;
      $$('[data-v]').forEach((i) => (i.onchange = () => { F.expert(i.dataset.v).verified = i.checked; F.save(); F.toast(i.checked ? 'Đã cấp huy hiệu Verified' : 'Đã thu hồi huy hiệu'); }));
      const ad = $('#ad'); if (ad) ad.onclick = () => F.modal({ title: 'Mời chuyên gia', body: `<div class="stack"><div class="field"><label>Họ tên & học vị</label><input class="input" placeholder="VD: TS. Nguyễn Văn A"></div><div class="field"><label>Email</label><input class="input" placeholder="email@donvi.edu.vn"></div><div class="field"><label>Lĩnh vực</label><select class="select"><option>Fintech</option><option>Kinh tế Vĩ mô</option><option>Kinh tế Vi mô</option></select></div></div>`, actions: [{ label: 'Hủy' }, { label: 'Gửi lời mời', cls: 'btn-primary', onClick: () => F.toast('Đã gửi lời mời (mô phỏng)') }] });
    };
    draw();
  };

  /* ================= C13 · Danh mục chỉ số ================= */
  pages.cmsIndicators = () => {
    if (!guard()) return; const c = F.cmsShell('indicators', [['Dashboard', 'cms/index.html'], ['Danh mục chỉ số']]); const can = F.can('indicators.manage'); let q = ''; let g = '';
    c.innerHTML = `<div class="page-head"><div><h1>Danh mục chỉ số</h1><p>Master data để Vertex AI đối chiếu khi gợi ý liên kết Báo cáo ↔ Chỉ số. Từ khóa đồng nghĩa càng đầy đủ, gợi ý càng chính xác.</p></div>${can ? `<button class="btn btn-primary" id="ad">${I('plus')}Thêm chỉ số</button>` : ''}</div>
      <div class="toolbar"><div class="search-box" style="flex:1;min-width:220px;max-width:380px">${I('search')}<input class="input sm" id="q" placeholder="Tìm mã, tên, từ khóa…"></div><select class="select sm" id="g" style="width:auto"><option value="">Mọi nhóm</option>${Object.entries(F.GROUP).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div><div id="tbl"></div>`;
    const draw = () => { const list = db().indicators.filter((i) => (!g || i.group === g) && (!q || norm(i.id + ' ' + i.name + ' ' + i.syn.join(' ')).includes(norm(q))));
      $('#tbl').innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Mã</th><th>Tên chỉ số</th><th>Nhóm</th><th>Đơn vị</th><th>Tần suất</th><th>Nguồn</th><th>Từ khóa cho AI</th><th class="r">Bài liên kết</th><th></th></tr></thead><tbody>${list.map((i) => `<tr><td><b class="num">${i.id}</b></td><td>${F.esc(i.name)}</td><td class="small">${F.GROUP[i.group]}</td><td class="small">${F.esc(i.unit)}</td><td class="small">${F.esc(i.freq)}</td><td class="small muted">${F.esc(i.source)}</td><td style="max-width:280px"><div class="chips" style="gap:4px">${i.syn.map((s) => `<span class="badge">${F.esc(s)}</span>`).join('')}</div></td><td class="r num">${F.reportsOfInd(i.id).length}</td><td class="r">${can ? `<button class="btn btn-ghost btn-xs" data-e="${i.id}">${I('edit')}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
      $$('[data-e]').forEach((b) => (b.onclick = () => { const i = F.ind(b.dataset.e); F.modal({ title: 'Từ khóa cho ' + F.esc(i.name), body: `<div class="field"><label for="sy">Từ khóa đồng nghĩa (phân cách bằng dấu phẩy)</label><textarea class="textarea" id="sy">${F.esc(i.syn.join(', '))}</textarea><span class="hint">Được dùng để Vertex AI nhận diện chỉ số trong nội dung báo cáo.</span></div>`, actions: [{ label: 'Hủy' }, { label: 'Lưu', cls: 'btn-primary', onClick: (cc, el) => { i.syn = $('#sy', el).value.split(',').map((x) => x.trim()).filter(Boolean); F.save(); draw(); F.toast('Đã cập nhật từ khóa'); } }] }); }));
    };
    $('#q').oninput = (e) => { q = e.target.value; draw(); }; $('#g').onchange = (e) => { g = e.target.value; draw(); };
    const ad = $('#ad'); if (ad) ad.onclick = () => F.modal({ title: 'Thêm chỉ số', body: `<div class="stack"><div class="row" style="gap:10px"><div class="field" style="flex:1"><label>Mã</label><input class="input" placeholder="VD: PMI"></div><div class="field" style="flex:2"><label>Tên chỉ số</label><input class="input" placeholder="Chỉ số nhà quản trị mua hàng"></div></div><div class="field"><label>Nguồn dữ liệu / API</label><input class="input" placeholder="Nhà cung cấp dữ liệu"></div><div class="field"><label>Từ khóa đồng nghĩa</label><input class="input" placeholder="pmi, sản xuất, đơn hàng mới"></div></div>`, actions: [{ label: 'Hủy' }, { label: 'Thêm', cls: 'btn-primary', onClick: () => F.toast('Đã thêm chỉ số (mô phỏng)') }] });
    draw();
  };

  /* ================= C14 · Người dùng ================= */
  pages.cmsUsers = () => {
    if (!guard()) return; const c = F.cmsShell('users', [['Dashboard', 'cms/index.html'], ['Người dùng']]);
    if (!F.can('users.view')) { c.innerHTML = F.empty('lock', 'Chỉ dành cho Quản trị', 'Vai trò hiện tại không truy cập được danh sách người dùng.', ''); return; }
    const draw = () => { c.innerHTML = `<div class="page-head"><div><h1>Người dùng</h1><p>${db().users.filter((u) => u.status !== 'deleted').length} tài khoản độc giả</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Người dùng</th><th>Quan tâm</th><th>Tham gia</th><th class="r">Phản biện</th><th>Gói</th><th>Trạng thái</th><th></th></tr></thead><tbody>${db().users.map((u) => `<tr><td><div class="row">${F.avatar(u, 'sm')}<div><b>${F.esc(u.name)}</b><div class="xs muted">${F.esc(u.email)}</div></div></div></td><td>${u.interests.map(F.streamBadge).join(' ') || '<span class="muted small">—</span>'}</td><td class="small">${F.date(u.joined)}</td><td class="r num">${db().inquiries.filter((q) => q.reader === u.id).length}</td><td class="small">${u.id === F.session().uid && F.hasSub() ? '<span class="badge premium">Premium</span>' : 'Miễn phí'}</td><td>${u.status === 'active' ? '<span class="badge s-published">Hoạt động</span>' : u.status === 'locked' ? '<span class="badge i-reported">Đã khóa</span>' : '<span class="badge">Đã xóa</span>'}</td><td class="r">${u.status === 'active' ? `<button class="btn btn-ghost btn-xs" data-l="${u.id}">${I('ban')}Khóa</button>` : u.status === 'locked' ? `<button class="btn btn-ghost btn-xs" data-u="${u.id}">Mở khóa</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
      $$('[data-l]').forEach((b) => (b.onclick = () => F.confirm('Khóa tài khoản?', 'Người dùng sẽ không thể đăng nhập.', 'Khóa', 'btn-danger', () => { F.user(b.dataset.l).status = 'locked'; F.save(); draw(); })));
      $$('[data-u]').forEach((b) => (b.onclick = () => { F.user(b.dataset.u).status = 'active'; F.save(); draw(); F.toast('Đã mở khóa'); }));
    };
    draw();
  };

  document.addEventListener('DOMContentLoaded', () => { const m = sessionStorage.getItem('fbv-cms-flash'); if (m) { sessionStorage.removeItem('fbv-cms-flash'); setTimeout(() => F.toast(m), 250); } });
})();
