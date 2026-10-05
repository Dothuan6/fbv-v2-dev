/* =========================================================
   FBV v3.2.1 — CMS bổ sung
   X1 Lịch gọi 1:1 (xác nhận / đổi giờ / từ chối) trong phiên phản biện
   X2 C17–C18 Buổi trao đổi kín & phòng kín (Admin tạo, quản lý thành viên)
   X3 Trả lời của chuyên gia ngang tính năng độc giả: trích dẫn, phản hồi học thuật, sao chép, đính kèm
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const I = F.icon; const db = () => F.db(); const esc = F.esc;
  const now = () => new Date().toISOString(); const MIN = 60 * 1000;
  const guard = () => { if (!F.cmsRole()) { F.go('cms/login.html?next=' + encodeURIComponent(F.here())); return false; } return true; };
  const slaEl = (q) => {
    if (!['new', 'assigned', 'in_progress'].includes(q.status)) return '<span class="muted small">—</span>';
    const h = (new Date(q.slaDue) - Date.now()) / 36e5;
    return h < 0 ? `<span class="sla late">${I('alert')}Quá ${Math.ceil(-h)} giờ</span>` : h < 24 ? `<span class="sla warn">${I('clock')}Còn ${Math.ceil(h)} giờ</span>` : `<span class="sla ok">${I('clock')}Còn ${Math.ceil(h)} giờ</span>`;
  };
  const time = (at) => new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const whenLabel = (at) => new Date(at).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ' · ' + time(at);
  const RX = (F.CHAT && F.CHAT.RX) || [['useful', '👍', 'Hữu ích'], ['clear', '✔', 'Đã rõ'], ['ask', '❓', 'Cần làm rõ']];
  const EXT = (F.CHAT && F.CHAT.EXT) || { file: ['pdf', 'xlsx', 'xls', 'csv', 'docx'], image: ['png', 'jpg', 'jpeg'] };
  const LIM = (F.CHAT && F.CHAT.LIM) || { file: 10485760, image: 5242880 };

  /* ================= C10 · Chi tiết phiên phản biện (X1 + X3) ================= */
  pages.cmsInquiry = () => {
    if (!guard()) return; const me = F.cmsMe(); const q = F.inquiry(F.param('id') || 'q4');
    const c = F.cmsShell('inquiries', [['Phản biện 1:1', 'cms/inquiries.html'], ['#' + (q ? q.id.toUpperCase() : '')]]);
    if (!q || (me.role === 'expert' && q.expert !== me.id)) { c.innerHTML = F.empty('lock', 'Không có quyền truy cập', 'Phiên không tồn tại hoặc không thuộc phạm vi của bạn.', ''); return; }
    if (me.role === 'expert') { q.expertUnread = false; F.save(); }
    if (q.note && !q.notes) q.notes = [{ by: 's2', at: q.createdAt, x: q.note }];
    q.notes = q.notes || [];
    const r = F.report(q.r); const rd = F.user(q.reader);
    let mode = F.can('inquiry.reply', q) ? 'reply' : 'note'; let reply = null; const pend = []; let draft = '';
    const msgActions = (m, i) => {
      if (m.recalled) return '';
      const isReader = m.by === q.reader; const canRx = me.role === 'expert' && isReader;
      const mine = (m.rx || {})[me.id];
      return `<div class="m-acts">${F.can('inquiry.reply', q) && !['closed', 'reported'].includes(q.status) ? `<button type="button" data-rp="${i}">${I('reply', 'i-xs')}Trả lời</button>` : ''}${m.x ? `<button type="button" data-cp="${i}">${I('copy', 'i-xs')}Sao chép</button>` : ''}${canRx ? RX.map((k) => `<button type="button" class="${mine === k[0] ? 'on' : ''}" data-rx="${i}" data-k="${k[0]}" title="${k[2]}">${k[1]} ${k[2]}</button>`).join('') : ''}</div>`;
    };
    const callsCard = () => {
      const calls = (q.calls || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
      if (!calls.length) return '';
      const canAct = (me.role === 'expert' && q.expert === me.id) || ['admin', 'editor'].includes(me.role);
      return `<div class="card"><div class="card-head"><h3>Lịch gọi 1:1</h3><span class="tag prem">Premium</span></div><div class="stack small">${calls.map((cl) => `<div class="call-adm"><div class="row" style="gap:8px">${I(cl.kind === 'video' ? 'video' : 'phoneCall', 'i-sm')}<b class="grow">${cl.kind === 'video' ? 'Video' : 'Thoại'} · ${cl.len || 30} phút</b>${F.callStatusTag(cl)}</div><div class="muted mt-4">${whenLabel(cl.at)}${cl.proposed ? ` → đề xuất ${whenLabel(cl.proposed)}` : ''}${cl.note ? '<br>“' + esc(cl.note) + '”' : ''}${cl.reason && cl.status === 'declined' ? '<br>Lý do từ chối: ' + esc(cl.reason) : ''}${cl.status === 'done' ? '<br>Thời lượng thực tế: ' + Math.round(cl.dur / 60) + ' phút' : ''}</div>${canAct ? `<div class="row wrap mt-8" style="gap:6px">${F.callActionsHtml(q, cl, me.role === 'expert')}</div>` : ''}</div>`).join('')}</div>
        <p class="hint mt-8">Không gọi tự do: cuộc gọi chỉ mở trong khung giờ đã xác nhận, không ghi âm. Chuyên gia xác nhận trong 24 giờ.</p></div>`;
    };
    const draw = () => {
      const canReply = F.can('inquiry.reply', q) && !['closed', 'reported'].includes(q.status); const canNote = F.can('inquiry.note', q) || me.role === 'expert';
      if (!canReply && mode === 'reply') mode = 'note';
      const items = q.messages.map((m, i) => ({ ...m, k: 'm', i })).concat(q.notes.map((n) => ({ ...n, k: 'n' }))).sort((a, b) => new Date(a.at) - new Date(b.at));
      const keepTx = $('#rp') ? $('#rp').value : draft;
      c.innerHTML = `<div class="page-head"><div><div class="row" style="gap:10px">${F.iStatusBadge(q.status)}${slaEl(q)}</div><h1 class="mt-8" style="font-size:22px">Phiên #${q.id.toUpperCase()} · ${esc(rd.name)}</h1></div></div>
        <div class="editor-grid"><div class="stack-lg"><div class="card"><div class="section-title">Trích dẫn từ bài nghiên cứu</div><div class="quote-block">“${esc(q.quote)}”<span class="qsrc"><a href="${F.url('reader/report.html?id=' + r.id + '#p' + q.block)}" target="_blank">${esc(r.title)} — đoạn #${q.block + 1} ↗</a></span></div></div>
          <div class="thread">${items.map((m) => { const p = F.person(m.by); const isReader = m.by === q.reader;
            if (m.k === 'n') return `<div class="msg note">${F.avatar(p, 'sm')}<div><div class="mh"><b>${esc(p.name)}</b><span class="badge warn">Ghi chú nội bộ</span><span>${F.ago(m.at)}</span></div><div class="bubble">${esc(m.x)}</div></div></div>`;
            return `<div class="msg ${isReader ? '' : 'mine'}" id="cm${m.i}">${F.avatar(p, 'sm')}<div><div class="mh"><b>${isReader ? esc(p.name) : esc(p.name) + (m.by === q.expert ? '' : ' (thay mặt FBV)')}</b><span>${F.ago(m.at)}</span></div><div class="bubble">${m.anon ? '<i class="muted">[Độc giả đã xóa tài khoản]</i>' : F.cmsMsgBody(m, q, me.role)}</div>${msgActions(m, m.i)}</div></div>`; }).join('')}</div>
          ${canReply || canNote ? `<div><div class="seg mb-8">${canReply ? `<button class="${mode === 'reply' ? 'active' : ''}" data-m="reply">Trả lời độc giả</button>` : ''}${canNote ? `<button class="${mode === 'note' ? 'active' : ''}" data-m="note">Ghi chú nội bộ</button>` : ''}</div>
            ${mode === 'reply' && reply != null ? `<div class="cms-reply">${I('reply', 'i-sm')}<div class="grow"><b>Trả lời ${esc(F.person(q.messages[reply].by).name)}</b><span>${esc(F.msgPreview(q.messages[reply])).slice(0, 140)}</span></div><button class="icon-btn sm" id="rpx" aria-label="Hủy trả lời">${I('x')}</button></div>` : ''}
            ${mode === 'reply' && pend.length ? `<div class="pend cms-pend">${pend.map((f, k) => `<span class="pchip ${f.scan}">${I(f.kind === 'image' ? 'image' : 'file', 'i-xs')}<span class="ellipsis">${esc(f.name)}</span><small>${f.scan === 'pending' ? 'Đang quét virus…' : F.fmtSize(f.size)}</small><button type="button" data-rk="${k}" aria-label="Bỏ tệp">${I('x', 'i-xs')}</button></span>`).join('')}</div>` : ''}
            <div class="composer" style="${mode === 'note' ? 'background:var(--warn-soft);border-color:var(--warn)' : ''}">${mode === 'reply' ? `<button class="icon-btn" id="att" aria-label="Đính kèm tệp hoặc ảnh" type="button">${I('paperclip')}</button><input type="file" id="fin" hidden>` : ''}<textarea id="rp" rows="2" placeholder="${mode === 'reply' ? 'Phản hồi học thuật tới độc giả… (không đưa ra khuyến nghị mua/bán)' : 'Ghi chú chỉ hiển thị trong CMS…'}">${esc(keepTx)}</textarea><button class="btn ${mode === 'reply' ? 'btn-primary' : 'btn-navy'}" id="sd" ${pend.some((f) => f.scan === 'pending') ? 'disabled' : ''}>${I('send')}${mode === 'reply' ? 'Gửi' : 'Lưu ghi chú'}</button></div>${mode === 'reply' ? `<p class="hint mt-8">Đính kèm PDF/Excel/Word ≤ 10 MB, ảnh ≤ 5 MB (quét virus trước khi gửi). Độc giả nhận thông báo in-app & push.</p>` : ''}</div>` : `<div class="perm-note">${I('lock')}<span>Vai trò hiện tại không được trả lời phiên này.</span></div>`}</div>
        <aside class="stack-lg"><div class="card"><div class="card-head"><h3>Thông tin phiên</h3></div><div class="stack small">
          <div class="row between"><span class="muted">Độc giả</span><span>${esc(rd.name)}</span></div><div class="row between"><span class="muted">Tham gia</span><span>${F.date(rd.joined)}</span></div><div class="row between"><span class="muted">Số phiên đã gửi</span><span class="num">${db().inquiries.filter((x) => x.reader === rd.id).length}</span></div>
          <div class="row between"><span class="muted">Mở lúc</span><span>${F.date(q.createdAt, true)}</span></div><div class="row between"><span class="muted">Hạn SLA</span><span>${F.date(q.slaDue, true)}</span></div>
          <div class="field mt-8"><label for="as">Chuyên gia phụ trách</label><select class="select sm" id="as" ${F.can('inquiry.assign') ? '' : 'disabled'}>${db().experts.map((e) => `<option value="${e.id}" ${e.id === q.expert ? 'selected' : ''}>${esc(e.name)}${e.id === r.author ? ' (tác giả)' : ''}</option>`).join('')}</select></div></div></div>
          ${callsCard()}
          <div class="card stack"><h3>Thao tác</h3>${!['closed'].includes(q.status) ? `<button class="btn btn-secondary btn-sm btn-block" id="cl">${I('checkCircle')}Đóng phiên</button>` : `<button class="btn btn-secondary btn-sm btn-block" id="ro">${I('refresh')}Mở lại phiên</button>`}${me.role === 'expert' ? `<button class="btn btn-danger-soft btn-sm btn-block" id="rpv">${I('flag')}Báo cáo vi phạm & chặn độc giả</button>` : ''}${F.can('inquiry.assign') && ['new', 'assigned', 'in_progress'].includes(q.status) ? `<button class="btn btn-ghost btn-sm btn-block" id="rm">${I('bell')}Nhắc chuyên gia</button>` : ''}</div></aside></div>`;
      $$('[data-m]').forEach((b) => (b.onclick = () => { draft = $('#rp') ? $('#rp').value : draft; mode = b.dataset.m; draw(); }));
      F.bindAtts(c, q.messages);
      F.bindCallActions(c, () => draw());
      $$('[data-rp]').forEach((b) => (b.onclick = () => { draft = $('#rp') ? $('#rp').value : ''; mode = 'reply'; reply = +b.dataset.rp; draw(); $('#rp').focus(); }));
      $$('[data-cp]').forEach((b) => (b.onclick = () => { try { navigator.clipboard.writeText(q.messages[+b.dataset.cp].x); } catch (e) {} F.toast('Đã sao chép'); }));
      $$('[data-rx]').forEach((b) => (b.onclick = () => { const m = q.messages[+b.dataset.rx]; m.rx = m.rx || {}; if (m.rx[me.id] === b.dataset.k) delete m.rx[me.id]; else m.rx[me.id] = b.dataset.k; q.readerUnread = true; F.save(); draft = $('#rp') ? $('#rp').value : ''; draw(); }));
      const rpx = $('#rpx'); if (rpx) rpx.onclick = () => { draft = $('#rp').value; reply = null; draw(); };
      $$('[data-rk]').forEach((b) => (b.onclick = () => { draft = $('#rp').value; pend.splice(+b.dataset.rk, 1); draw(); }));
      const att = $('#att'); if (att) att.onclick = () => F.menu([{ icon: 'file', label: 'Tài liệu · PDF, Excel, Word, CSV (≤ 10 MB)', onClick: () => pick('file') }, { icon: 'image', label: 'Ảnh · PNG, JPG (≤ 5 MB)', onClick: () => pick('image') }], 'Đính kèm');
      const fin = $('#fin');
      const pick = (kind) => { fin.accept = EXT[kind].map((x) => '.' + x).join(','); fin.dataset.kind = kind; fin.value = ''; fin.click(); };
      if (fin) fin.onchange = () => { const f = fin.files[0]; if (!f) return; const ext = F.extOf(f.name); const kind = fin.dataset.kind || (EXT.image.includes(ext) ? 'image' : 'file');
        if (!EXT[kind].includes(ext)) { F.toast('Định dạng .' + ext + ' không được hỗ trợ', 'error'); return; }
        if (f.size > LIM[kind]) { F.toast('Tệp vượt quá ' + (kind === 'image' ? '5' : '10') + ' MB', 'error'); return; }
        draft = $('#rp').value; const item = { name: f.name, size: f.size, kind, scan: 'pending' }; pend.push(item); draw();
        setTimeout(() => { item.scan = 'ok'; draft = $('#rp') ? $('#rp').value : draft; draw(); }, 800); };
      const sd = $('#sd'); if (sd) sd.onclick = () => { const v = $('#rp').value.trim(); if (!v && !(mode === 'reply' && pend.length)) return;
        if (mode === 'reply' && v && F.blockedText && F.blockedText(v, 'Nội dung trả lời')) return;
        if (mode === 'reply') { const m = { by: me.id, at: now(), x: v }; if (reply != null) m.re = reply; if (pend.length) m.files = pend.map((f) => ({ name: f.name, size: f.size, kind: f.kind, scan: 'ok' }));
          q.messages.push(m); q.status = 'answered'; q.readerUnread = true; db().notifications.push({ id: F.uid('n'), user: q.reader, type: 'answer', ref: q.id, text: `${me.role === 'expert' ? me.name : 'FBV'} đã trả lời phản biện của bạn về "${r.title}".`, at: now(), read: false }); F.toast('Đã gửi trả lời — độc giả đã được thông báo'); reply = null; pend.length = 0; }
        else { q.notes.push({ by: me.id, at: now(), x: v }); F.toast('Đã lưu ghi chú nội bộ'); }
        draft = ''; F.save(); draw(); };
      const as = $('#as'); if (as) as.onchange = () => { q.expert = as.value; if (q.status === 'new') q.status = 'assigned'; q.notes.push({ by: me.id, at: now(), x: 'Đã phân công cho ' + F.expert(as.value).name + '.' }); F.save(); F.toast('Đã phân công chuyên gia'); draw(); };
      const cl = $('#cl'); if (cl) cl.onclick = () => F.confirm('Đóng phiên?', 'Độc giả sẽ không gửi thêm phản hồi trong phiên này.', 'Đóng phiên', 'btn-primary', () => { q.status = 'closed'; F.save(); draw(); });
      const ro = $('#ro'); if (ro) ro.onclick = () => { q.status = 'in_progress'; F.save(); draw(); };
      const rm = $('#rm'); if (rm) rm.onclick = () => { q.notes.push({ by: me.id, at: now(), x: 'Đã gửi nhắc nhở tới chuyên gia qua email & push.' }); F.save(); F.toast('Đã nhắc chuyên gia'); draw(); };
      const rpv = $('#rpv'); if (rpv) rpv.onclick = () => F.modal({ title: 'Báo cáo vi phạm', body: `<div class="radio-list">${['Ngôn từ xúc phạm / quấy rối', 'Spam hoặc quảng cáo', 'Lôi kéo đầu tư trái phép', 'Khác'].map((x, i) => `<label><input type="radio" name="rr" value="${x}" ${i ? '' : 'checked'}>${x}</label>`).join('')}</div><label class="checkbox mt-12"><input type="checkbox" id="bk" checked>Chặn độc giả này (không nhận phiên mới)</label>`, actions: [{ label: 'Hủy' }, { label: 'Gửi báo cáo', cls: 'btn-danger', onClick: (cc, el) => { db().moderation.unshift({ id: F.uid('m'), type: 'inquiry', ref: q.id, reporter: me.id, target: q.reader, reason: $('input[name=rr]:checked', el).value, detail: 'Chuyên gia báo cáo từ CMS.', status: 'open', createdAt: now() }); q.status = 'reported'; F.save(); F.toast('Đã gửi báo cáo tới Quản trị'); draw(); } }] });
      const t = $('#rp'); if (t && keepTx) { t.selectionStart = t.selectionEnd = t.value.length; }
    };
    draw();
  };

  /* ================= C17 · Buổi trao đổi kín (X2) ================= */
  const sessStatus = (ss) => { const st = new Date(ss.at).getTime(); const end = st + ss.len * MIN; return ss.cancelled ? ['cancelled', '<span class="tag">Đã hủy</span>'] : Date.now() > end ? ['past', '<span class="tag">Đã kết thúc</span>'] : Date.now() >= st - 10 * MIN ? ['live', '<span class="tag bad"><span class="d"></span>Đang diễn ra</span>'] : ['up', '<span class="tag info"><span class="d"></span>Sắp diễn ra</span>']; };
  const roomOf = (ss) => (db().rooms || []).find((x) => x.session === ss.id);
  const canManage = () => F.cmsRole() === 'admin';
  const sessionForm = (ss, after) => {
    const exps = db().experts.filter((e) => e.verified); const d = ss ? new Date(ss.at) : (() => { const x = new Date(Date.now() + 7 * 864e5); x.setHours(20, 0, 0, 0); return x; })();
    const loc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    F.modal({ title: ss ? 'Sửa buổi trao đổi' : 'Tạo buổi trao đổi kín', size: 'wide', body: `<div class="stack"><div class="field"><label for="st">Chủ đề</label><input class="input" id="st" maxlength="120" value="${ss ? esc(ss.t) : ''}" placeholder="VD: Triển vọng lãi suất quý I/2027"></div>
      <div class="grid-2"><div class="field"><label for="se">Chuyên gia chủ trì (Trưởng phòng)</label><select class="select" id="se">${exps.map((e) => `<option value="${e.id}" ${ss && ss.e === e.id ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select></div><div class="field"><label for="sm">Điều phối viên FBV</label><select class="select" id="sm">${db().staff.map((p) => `<option value="${p.id}" ${(ss && roomOf(ss) ? roomOf(ss).mod : 's2') === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div></div>
      <div class="grid-2"><div class="field"><label for="sd">Thời gian bắt đầu</label><input class="input" type="datetime-local" id="sd" value="${loc}"></div><div class="field"><label for="sl">Thời lượng</label><select class="select" id="sl">${[45, 60, 90].map((m) => `<option value="${m}" ${(ss ? ss.len : 60) === m ? 'selected' : ''}>${m} phút</option>`).join('')}</select></div></div>
      <div class="grid-2"><div class="field"><label for="sc">Số chỗ tối đa</label><input class="input" type="number" id="sc" min="5" max="25" value="${ss ? ss.seats : 20}"></div><div class="field"><label for="sp">Chương trình (ghim trong phòng)</label><input class="input" id="sp" maxlength="240" value="${ss && roomOf(ss) ? esc(roomOf(ss).pinned) : ''}" placeholder="(1) … · (2) … · (3) Hỏi đáp"></div></div>
      <div class="perm-note">${I('info')}<span>Khi lưu, hệ thống <b>tự tạo phòng trao đổi kín</b> gồm chuyên gia (Trưởng phòng) và điều phối viên. Hội viên Premium được thêm vào phòng khi đăng ký buổi. Tối đa 25 người, không ghi hình.</span></div></div>`,
      actions: [{ label: 'Hủy' }, { label: ss ? 'Lưu thay đổi' : 'Tạo buổi & phòng', cls: 'btn-primary', onClick: (cl, el) => {
        const t = $('#st', el).value.trim(); if (t.length < 8) { $('#st', el).classList.add('invalid'); F.toast('Nhập chủ đề tối thiểu 8 ký tự', 'error'); return false; }
        const seats = Math.max(5, Math.min(25, +$('#sc', el).value || 20)); const at = new Date($('#sd', el).value).toISOString(); const e = $('#se', el).value; const mod = $('#sm', el).value; const pinned = $('#sp', el).value.trim() || 'Chương trình sẽ được cập nhật.';
        const D = db(); D.rooms = D.rooms || [];
        if (ss) { Object.assign(ss, { t, e, at, len: +$('#sl', el).value, seats }); const rm = roomOf(ss); if (rm) { if (rm.owner !== e) { rm.members = rm.members.filter((x) => x !== rm.owner); rm.owner = e; } if (rm.mod !== mod) { rm.members = rm.members.filter((x) => x !== rm.mod); rm.mod = mod; } [e, mod].forEach((x) => { if (!rm.members.includes(x)) rm.members.unshift(x); }); rm.pinned = pinned; } F.toast('Đã lưu buổi trao đổi'); }
        else { const id = F.uid('ss'); D.sessions.push({ id, e, at, len: +$('#sl', el).value, t, seats, taken: 0 }); D.rooms.push({ id, session: id, owner: e, mod, members: [e, mod], createdBy: F.cmsMe().id, createdAt: now(), pinned, messages: [{ by: mod, at: now(), x: 'Phòng trao đổi kín đã được tạo cho buổi “' + t + '”. Hội viên đăng ký sẽ được thêm vào phòng.' }] }); F.toast('Đã tạo buổi trao đổi và phòng kín'); }
        F.save(); after && after(); } }] });
  };
  pages.cmsSessions = () => {
    if (!guard()) return; const role = F.cmsRole(); const me = F.cmsMe(); const c = F.cmsShell('sessions', [['Dashboard', 'cms/index.html'], ['Buổi trao đổi kín']]);
    if (!['admin', 'editor', 'expert'].includes(role)) { c.innerHTML = F.empty('lock', 'Không có quyền truy cập', 'Chỉ Quản trị, Biên tập và chuyên gia chủ trì xem được buổi trao đổi kín.', ''); return; }
    let tab = 'up';
    const draw = () => {
      const all = db().sessions.filter((s) => role !== 'expert' || s.e === me.id).sort((a, b) => new Date(a.at) - new Date(b.at));
      const G = { up: (s) => ['up', 'live'].includes(sessStatus(s)[0]), past: (s) => sessStatus(s)[0] === 'past', cancelled: (s) => s.cancelled, all: () => true };
      const list = all.filter(G[tab]);
      c.innerHTML = `<div class="page-head"><div><h1>Buổi trao đổi kín</h1><p>Phase 2 · Đặc quyền Premium. Mỗi buổi có một phòng trao đổi kín do Quản trị tạo; chuyên gia là Trưởng phòng, điều phối viên FBV hỗ trợ.</p></div>${canManage() ? `<button class="btn btn-primary" id="new">${I('plus')}Tạo buổi trao đổi</button>` : ''}</div>
        <div class="tabs mb-16">${[['up', 'Sắp / đang diễn ra'], ['past', 'Đã kết thúc'], ['cancelled', 'Đã hủy'], ['all', 'Tất cả']].map((t) => `<button class="tab ${tab === t[0] ? 'active' : ''}" data-t="${t[0]}">${t[1]}<span class="count">${all.filter(G[t[0]]).length}</span></button>`).join('')}</div>
        ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Chủ đề</th><th>Chuyên gia</th><th>Thời gian</th><th class="r">Đăng ký</th><th class="r">Phòng</th><th>Trạng thái</th><th class="r"></th></tr></thead><tbody>${list.map((s) => { const e = F.expert(s.e); const rm = roomOf(s); return `<tr><td><a class="t-title" href="${F.url('cms/session.html?id=' + s.id)}">${esc(s.t)}</a></td><td class="small"><div class="row" style="gap:6px">${F.avatar(e, 'xs')}${esc(e.name)}</div></td><td class="small">${whenLabel(s.at)}<div class="xs muted">${s.len} phút</div></td><td class="r num">${s.taken + (rm ? rm.members.filter((x) => String(x).startsWith('u')).length : 0)}/${s.seats}</td><td class="r num">${rm ? rm.members.length + ' TV · ' + rm.messages.length + ' tin' : '—'}</td><td>${sessStatus(s)[1]}</td><td class="r"><a class="btn btn-secondary btn-xs" href="${F.url('cms/session.html?id=' + s.id)}">Quản lý</a></td></tr>`; }).join('')}</tbody></table></div>` : F.empty('video', 'Chưa có buổi trao đổi', canManage() ? 'Tạo buổi đầu tiên để mở phòng trao đổi kín cho hội viên Premium.' : 'Chưa có buổi nào trong mục này.', '')}`;
      $$('.tab[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
      const n = $('#new'); if (n) n.onclick = () => sessionForm(null, draw);
    };
    draw();
  };

  /* ================= C18 · Chi tiết buổi & quản lý phòng kín (X2) ================= */
  pages.cmsSession = () => {
    if (!guard()) return; const role = F.cmsRole(); const me = F.cmsMe(); const D = db();
    const ss = D.sessions.find((x) => x.id === F.param('id')) || D.sessions[0];
    const c = F.cmsShell('sessions', [['Buổi trao đổi kín', 'cms/sessions.html'], [ss ? ss.t : '']]);
    if (!ss || !['admin', 'editor', 'expert'].includes(role) || (role === 'expert' && ss.e !== me.id)) { c.innerHTML = F.empty('lock', 'Không có quyền truy cập', 'Buổi không tồn tại hoặc không thuộc phạm vi của bạn.', ''); return; }
    const canMod = role === 'admin' || role === 'editor' || (role === 'expert' && ss.e === me.id);
    const draw = () => {
      const rm = roomOf(ss); const e = F.expert(ss.e); const st = sessStatus(ss); if (rm) rm.muted = rm.muted || [];
      const roleL = (id) => (rm && id === rm.owner ? '<span class="role-b own">Trưởng phòng</span>' : rm && id === rm.mod ? '<span class="role-b mod">Điều phối FBV</span>' : F.staff(id) ? '<span class="role-b mod">FBV</span>' : '<span class="tag">Hội viên</span>');
      c.innerHTML = `<div class="page-head"><div><div class="row" style="gap:10px">${st[1]}<span class="tag prem">Premium</span></div><h1 class="mt-8" style="font-size:22px">${esc(ss.t)}</h1><p>${whenLabel(ss.at)} · ${ss.len} phút · ${esc(e.name)}</p></div>${canManage() && !ss.cancelled ? `<div class="row" style="gap:8px"><button class="btn btn-secondary" id="edit">${I('edit')}Sửa</button><button class="btn btn-danger-soft" id="cancel">${I('x')}Hủy buổi</button></div>` : ''}</div>
        <div class="editor-grid"><div class="stack-lg">
          <div class="card"><div class="card-head"><h3>Phòng trao đổi kín</h3>${rm ? `<a href="${F.url('reader/room.html?id=' + rm.id)}" target="_blank">Xem phía hội viên ↗</a>` : ''}</div>
            ${rm ? `<div class="section-title">Chương trình (ghim)</div><div class="quote-block" style="font-style:normal">${esc(rm.pinned)}</div>
            <div class="section-title mt-16">Tin nhắn gần đây · ${rm.messages.length}</div><div class="thread">${rm.messages.map((m, i) => ({ m, i })).slice(-6).map(({ m, i }) => { const p = F.person(m.by); return `<div class="msg ${m.by === rm.owner || m.by === rm.mod ? 'mine' : ''}">${F.avatar(p, 'sm')}<div><div class="mh"><b>${esc(p.name)}</b>${roleL(m.by)}<span>${F.ago(m.at)}</span></div><div class="bubble">${m.removed ? `<span class="badge warn">Đã gỡ</span> <span class="muted">${esc(m.x || '')}</span>` : F.cmsMsgBody(m, { messages: rm.messages }, role)}</div>${canMod && !m.removed && !F.staff(m.by) && m.by !== rm.owner ? `<div class="m-acts"><button type="button" data-del="${i}">${I('trash', 'i-xs')}Gỡ tin</button></div>` : ''}</div></div>`; }).join('')}</div>
            ${!ss.cancelled && st[0] !== 'past' ? `<div class="composer mt-12"><textarea id="ann" rows="2" placeholder="Gửi thông báo vào phòng (VD: nhắc giờ, tài liệu đọc trước)…"></textarea><button class="btn btn-primary" id="sendA">${I('send')}Gửi</button></div>` : `<div class="perm-note mt-12">${I('lock')}<span>${ss.cancelled ? 'Buổi đã hủy — phòng ở chế độ chỉ đọc.' : 'Phòng chuyển sang chỉ đọc 7 ngày sau buổi trao đổi.'}</span></div>`}`
              : `<div class="perm-note">${I('alert')}<span>Chưa có phòng cho buổi này.</span>${canManage() ? `<button class="btn btn-primary btn-sm" id="mkRoom">Tạo phòng</button>` : ''}</div>`}</div></div>
          <aside class="stack-lg"><div class="card"><div class="card-head"><h3>Thành viên · ${rm ? rm.members.length : 0}</h3><span class="small muted">${ss.seats} chỗ</span></div>
            ${rm ? `<div class="stack small">${rm.members.map((id) => { const p = F.person(id); const fixed = id === rm.owner || id === rm.mod; return `<div class="row" style="gap:8px">${F.avatar(p, 'xs')}<span class="grow ellipsis">${esc(p.name)}</span>${roleL(id)}${rm.muted.includes(id) ? '<span class="tag warn">Đang tắt tiếng</span>' : ''}${canMod && !fixed ? `<button class="icon-btn sm" data-mute="${id}" aria-label="${rm.muted.includes(id) ? 'Bật lại tiếng' : 'Tắt tiếng'}" title="${rm.muted.includes(id) ? 'Bật lại tiếng' : 'Tắt tiếng (chat & micrô)'}">${I(rm.muted.includes(id) ? 'mic' : 'micOff')}</button><button class="icon-btn sm" data-rmv="${id}" aria-label="Mời ra khỏi phòng" title="Mời ra khỏi phòng">${I('x')}</button>` : ''}</div>`; }).join('')}</div>${canMod ? '<p class="hint mt-8">Điều phối: tắt tiếng (không gửi tin, tắt micrô trong buổi gọi) hoặc mời thành viên ra khỏi phòng.</p>' : ''}
            ${canManage() && !ss.cancelled ? `<div class="field mt-12"><label for="addU">Thêm hội viên</label><div class="row" style="gap:8px"><select class="select sm grow" id="addU">${D.users.filter((u) => !rm.members.includes(u.id) && u.status !== 'banned').map((u) => `<option value="${u.id}">${esc(u.name)} · ${esc(u.email)}</option>`).join('')}</select><button class="btn btn-secondary btn-sm" id="addB">${I('plus')}Thêm</button></div><p class="hint mt-8">Chỉ Quản trị thêm/bớt thành viên. Hội viên Premium tự vào phòng khi đăng ký buổi.</p></div>` : `<p class="hint mt-8">${role === 'admin' ? '' : 'Chỉ Quản trị thêm/bớt thành viên.'}</p>`}` : ''}</div>
            <div class="card"><div class="card-head"><h3>Thông tin</h3></div><div class="stack small"><div class="row between"><span class="muted">Tạo bởi</span><span>${rm ? esc(F.person(rm.createdBy).name) : '—'}</span></div><div class="row between"><span class="muted">Tạo lúc</span><span>${rm ? F.date(rm.createdAt, true) : '—'}</span></div><div class="row between"><span class="muted">Gọi video</span><span>${st[0] === 'live' ? 'Đang mở' : 'Mở trước 10 phút'}</span></div><div class="row between"><span class="muted">Ghi hình</span><span>Không</span></div></div></div></aside></div>`;
      const ed = $('#edit'); if (ed) ed.onclick = () => sessionForm(ss, draw);
      const cc = $('#cancel'); if (cc) cc.onclick = () => F.confirm('Hủy buổi trao đổi?', 'Hội viên đã đăng ký sẽ nhận thông báo hủy; phòng chuyển sang chỉ đọc.', 'Hủy buổi', 'btn-danger', () => { ss.cancelled = true; const r2 = roomOf(ss); if (r2) r2.messages.push({ by: me.id, at: now(), x: 'Buổi trao đổi đã bị hủy. FBV sẽ thông báo lịch thay thế.' }); F.save(); F.toast('Đã hủy buổi trao đổi', 'info'); draw(); });
      const mk = $('#mkRoom'); if (mk) mk.onclick = () => { D.rooms.push({ id: ss.id, session: ss.id, owner: ss.e, mod: 's2', members: [ss.e, 's2'], createdBy: me.id, createdAt: now(), pinned: 'Chương trình sẽ được cập nhật.', messages: [] }); F.save(); draw(); };
      const sa = $('#sendA'); if (sa) sa.onclick = () => { const v = $('#ann').value.trim(); if (!v) return; rm.messages.push({ by: me.id, at: now(), x: v }); F.save(); F.toast('Đã gửi vào phòng'); draw(); };
      $$('[data-rmv]').forEach((b) => (b.onclick = () => F.confirm('Mời ra khỏi phòng?', 'Thành viên sẽ không xem được tin nhắn và không tham gia buổi gọi. Hành động được ghi nhật ký.', 'Mời ra', 'btn-danger', () => { rm.members = rm.members.filter((x) => x !== b.dataset.rmv); rm.muted = rm.muted.filter((x) => x !== b.dataset.rmv); F.save(); F.toast('Đã mời thành viên ra khỏi phòng', 'info'); draw(); })));
      $$('[data-mute]').forEach((b) => (b.onclick = () => { const id = b.dataset.mute; const on = rm.muted.includes(id); rm.muted = on ? rm.muted.filter((x) => x !== id) : rm.muted.concat(id); F.save(); F.toast(on ? 'Đã bật lại tiếng' : 'Đã tắt tiếng thành viên', 'info'); draw(); }));
      $$('[data-del]').forEach((b) => (b.onclick = () => F.confirm('Gỡ tin nhắn?', 'Thành viên trong phòng sẽ thấy “Tin nhắn đã bị điều phối viên gỡ”. Nội dung gốc vẫn lưu trong nhật ký kiểm duyệt.', 'Gỡ tin', 'btn-danger', () => { const m = rm.messages[+b.dataset.del]; m.removed = true; m.removedBy = me.id; F.save(); F.toast('Đã gỡ tin nhắn'); draw(); })));
      const ab = $('#addB'); if (ab) ab.onclick = () => { const id = $('#addU').value; if (!id) return; if (rm.members.length >= ss.seats + 2) { F.toast('Phòng đã đủ chỗ', 'error'); return; } rm.members.push(id); F.save(); F.toast('Đã thêm vào phòng'); draw(); };
    };
    draw();
  };
  /* ================= C11 · Kiểm duyệt vi phạm (mọi loại nội dung + duyệt ảnh bìa) ================= */
  const MT = { inquiry: 'Phiên phản biện', room: 'Phòng trao đổi kín', profile: 'Hồ sơ chuyên gia', call: 'Cuộc gọi', cover: 'Ảnh bìa hồ sơ', ai: 'Trợ lý AI' };
  const MS = { dismissed: 'Đã bỏ qua', warned: 'Đã cảnh cáo & ẩn nội dung', locked: 'Đã khóa tài khoản', approved: 'Đã duyệt ảnh', rejected: 'Đã từ chối ảnh' };
  pages.cmsModeration = () => {
    if (!guard()) return; const c = F.cmsShell('moderation', [['Dashboard', 'cms/index.html'], ['Kiểm duyệt vi phạm']]); let tab = 'open'; let ty = '';
    const can = F.can('moderate'); const me = F.cmsMe();
    const ctxOf = (m) => {
      const t = m.type || 'inquiry';
      if (t === 'inquiry' || (t === 'call' && F.inquiry(m.ref))) { const q = F.inquiry(m.ref); return q ? { label: 'Phiên #' + q.id.toUpperCase(), href: 'cms/inquiry.html?id=' + q.id, quote: F.msgPreview(q.messages[q.messages.length - 1]).slice(0, 220) } : { label: 'Phiên #' + String(m.ref).toUpperCase() }; }
      if (t === 'room' || t === 'call') { const ss = db().sessions.find((x) => x.id === m.ref); return { label: ss ? ss.t : 'Phòng ' + m.ref, href: ss ? 'cms/session.html?id=' + ss.id : null }; }
      if (t === 'profile' || t === 'cover') { const e = F.expert(m.ref); return { label: e ? e.name : m.ref, href: 'reader/expert.html?id=' + m.ref, ext: true, img: t === 'cover' && e ? e.coverPending : null }; }
      return { label: String(m.ref || '') };
    };
    const hours = (m) => (Date.now() - new Date(m.createdAt)) / 36e5;
    const draw = () => {
      const all = db().moderation; const open = all.filter((m) => m.status === 'open');
      const list = all.filter((m) => (tab === 'open' ? m.status === 'open' : m.status !== 'open')).filter((m) => !ty || (m.type || 'inquiry') === ty);
      const late = open.filter((m) => hours(m) > 24).length;
      c.innerHTML = `<div class="page-head"><div><h1>Kiểm duyệt vi phạm</h1><p>Mục tiêu xử lý mọi báo cáo trong 24 giờ: gỡ nội dung và khóa tài khoản vi phạm (App Store Guideline 1.2 — nội dung người dùng tạo).</p></div></div>${can ? '' : `<div class="alert warn mb-16">${I('lock')}<span>Chỉ Quản trị được ra quyết định xử lý. Bạn đang ở chế độ xem.</span></div>`}
        ${late ? `<div class="alert warn mb-16">${I('alert')}<span><b>${late} báo cáo đã quá 24 giờ</b> — cần xử lý ngay.</span></div>` : ''}
        <div class="row between wrap mb-16" style="gap:10px"><div class="tabs"><button class="tab ${tab === 'open' ? 'active' : ''}" data-t="open">Chờ xử lý<span class="count">${open.length}</span></button><button class="tab ${tab === 'done' ? 'active' : ''}" data-t="done">Đã xử lý<span class="count">${all.length - open.length}</span></button></div>
          <select class="select sm" id="ty" style="width:auto"><option value="">Mọi loại nội dung</option>${Object.entries(MT).map(([k, v]) => `<option value="${k}" ${ty === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        ${list.length ? `<div class="stack">${list.map((m) => { const t = m.type || 'inquiry'; const x = ctxOf(m); const tg = F.person(m.target); const h = hours(m);
          const acts = t === 'cover' ? `<button class="btn btn-primary btn-sm" data-a="approved" data-m="${m.id}">${I('check')}Duyệt ảnh bìa</button><button class="btn btn-danger btn-sm" data-a="rejected" data-m="${m.id}">Từ chối & gỡ ảnh</button>`
            : `<button class="btn btn-secondary btn-sm" data-a="dismissed" data-m="${m.id}">Bỏ qua (không vi phạm)</button><button class="btn btn-sm" style="background:var(--warn-soft);color:var(--warn)" data-a="warned" data-m="${m.id}">Ẩn nội dung & cảnh cáo</button><button class="btn btn-danger btn-sm" data-a="locked" data-m="${m.id}">${I('ban')}Khóa tài khoản</button>`;
          return `<div class="card"><div class="row between wrap" style="align-items:flex-start"><div class="grow" style="min-width:260px"><div class="row wrap" style="gap:8px"><span class="tag accent">${MT[t] || t}</span><span class="badge i-reported">${esc(m.reason)}</span><span class="xs ${m.status === 'open' && h > 24 ? 'sla late' : 'muted'}">${F.ago(m.createdAt)}${m.status === 'open' ? (h > 24 ? ' · quá hạn 24 giờ' : ' · còn ' + Math.max(1, Math.ceil(24 - h)) + ' giờ') : ''}</span>${m.status !== 'open' ? `<span class="badge">${MS[m.status] || m.status}</span>` : ''}</div>
            <p class="mt-12 small">${t === 'cover' ? `<b>${esc(tg.name)}</b> tải ảnh bìa mới, chờ duyệt trước khi hiển thị công khai.` : `<b>${esc(F.person(m.reporter).name)}</b> báo cáo <b>${esc(tg.name)}</b>${F.expert(m.target) ? ' (chuyên gia)' : F.staff(m.target) ? ' (FBV)' : ' (độc giả)'} · ${esc(x.label)}`}</p><p class="small sub mt-8">${esc(m.detail)}</p>
            ${x.img ? `<div class="mod-cover mt-12" style="background:url(${x.img}) center/cover"></div>` : ''}${x.quote ? `<div class="quote-block mt-12" style="font-size:13.5px">${esc(x.quote)}</div>` : ''}${x.href ? `<a class="link small mt-8" style="display:inline-block" href="${F.url(x.href)}" ${x.ext ? 'target="_blank"' : ''}>Mở ${(MT[t] || '').toLowerCase()} →</a>` : ''}</div>
            ${can && m.status === 'open' ? `<div class="stack" style="min-width:200px">${acts}</div>` : ''}</div></div>`; }).join('')}</div>` : F.empty('shieldCheck', tab === 'open' ? 'Không có báo cáo chờ xử lý' : 'Chưa có báo cáo đã xử lý', 'Cộng đồng đang an toàn.')}`;
      $$('.tab[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
      $('#ty').onchange = (e) => { ty = e.target.value; draw(); };
      $$('[data-a]').forEach((b) => (b.onclick = () => { const m = db().moderation.find((x) => x.id === b.dataset.m); const act = b.dataset.a; const e = F.expert(m.ref);
        const done = () => { m.status = act; m.resolvedAt = now(); m.resolvedBy = me.id;
          if (act === 'approved' && e) { e.cover = e.coverPending; e.coverPending = null; }
          if (act === 'rejected' && e) { e.coverPending = null; if (e.uid) db().notifications.unshift({ id: F.uid('n'), user: e.uid, type: 'system', ref: null, text: 'Ảnh bìa mới chưa đạt Quy tắc cộng đồng nên không được hiển thị. Vui lòng chọn ảnh khác.', at: now(), read: false }); }
          const u = F.user(m.target); if (act === 'locked' && u) u.status = 'locked';
          if (act !== 'dismissed' && (m.type || 'inquiry') === 'inquiry') { const q = F.inquiry(m.ref); if (q && act === 'locked') q.status = 'closed'; }
          if (m.reporter && F.user(m.reporter) && !['approved', 'rejected'].includes(act)) db().notifications.unshift({ id: F.uid('n'), user: m.reporter, type: 'system', ref: null, text: act === 'dismissed' ? 'FBV đã xem xét báo cáo của bạn và chưa thấy vi phạm. Cảm ơn bạn đã phản ánh.' : 'FBV đã xử lý báo cáo của bạn: nội dung vi phạm đã được gỡ' + (act === 'locked' ? ' và tài khoản vi phạm đã bị khóa.' : '.'), at: now(), read: false });
          F.save(); F.toast('Đã xử lý · ghi nhật ký kiểm duyệt'); draw(); };
        F.confirm({ dismissed: 'Bỏ qua báo cáo?', warned: 'Ẩn nội dung & cảnh cáo?', locked: 'Khóa tài khoản ' + esc(F.person(m.target).name) + '?', approved: 'Duyệt ảnh bìa?', rejected: 'Từ chối ảnh bìa?' }[act], act === 'locked' ? 'Người dùng sẽ không thể đăng nhập và gửi nội dung. Hành động được ghi nhật ký.' : act === 'approved' ? 'Ảnh sẽ hiển thị trên hồ sơ công khai của chuyên gia.' : 'Hành động sẽ được ghi nhật ký kiểm duyệt; người báo cáo được thông báo kết quả.', 'Xác nhận', ['locked', 'rejected'].includes(act) ? 'btn-danger' : 'btn-primary', done); }));
    };
    draw();
  };
})();
