/* =========================================================
   FBV v3.2 — CHAT PHẢN BIỆN NÂNG CAO · GỌI THEO LỊCH · PHÒNG TRAO ĐỔI KÍN
   (tính năng tham khảo từ hệ thống chat FBV.ONE, đã được duyệt)
   A1 Trả lời trích dẫn · A2 Phản hồi học thuật · A3 Sao chép · A4 Thu hồi 5 phút / Xóa phía tôi
   A5 Đính kèm file & ảnh · A6 Tài liệu trong phiên · A7 Mốc ngày & tin nhắn mới · A8 Tắt thông báo
   A9 Tìm kiếm · A13 Ẩn lịch sử phía người dùng · B1 Gọi thoại/video theo lịch hẹn (Phase 2)
   C1 Phòng trao đổi kín theo buổi (Phase 2)
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = F.$, $$ = F.$$; const I = F.icon; const esc = F.esc;
  const now = () => new Date().toISOString();
  const MIN = 60 * 1000;
  const RECALL_MIN = 5;
  const RX = [['useful', '👍', 'Hữu ích'], ['clear', '✔', 'Đã rõ'], ['ask', '❓', 'Cần làm rõ']];
  const LIM = { file: 10 * 1024 * 1024, image: 5 * 1024 * 1024 };
  const EXT = { file: ['pdf', 'xlsx', 'xls', 'csv', 'docx', 'doc', 'pptx'], image: ['png', 'jpg', 'jpeg', 'webp'] };
  F.CHAT = { RX, RECALL_MIN, LIM, EXT };

  /* Demo: ?prem=1 → bật Phase 2 + gói Premium + đăng ký sẵn 2 buổi trao đổi */
  if (F.param('prem') === '1') {
    const s = F.session(); s.phase2 = true;
    if (!s.subscription) s.subscription = { plan: 'yearly', store: 'apple', since: now(), renew: new Date(Date.now() + 365 * 864e5).toISOString(), autoRenew: true };
    s.rsvp = Array.from(new Set([...(s.rsvp || []), 'ss0', 'ss1'])); F.save();
  }

  /* ---------------- Tiện ích ---------------- */
  const fmtSize = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
  const extOf = (n) => (String(n).split('.').pop() || '').toLowerCase();
  const time = (at) => new Date(at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dayLabel = (at) => { const d = new Date(at); const t = new Date(); const y = new Date(Date.now() - 864e5); const same = (a, b) => a.toDateString() === b.toDateString(); return same(d, t) ? 'Hôm nay' : same(d, y) ? 'Hôm qua' : d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }); };
  const whenLabel = (at) => { const d = new Date(at); return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ' · ' + time(at); };
  const dur = (s) => { const m = Math.floor(s / 60); const x = s % 60; return (m ? m + ' phút ' : '') + x + ' giây'; };
  const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:)])/g;
  const fmtText = (x, term) => {
    let h = esc(x).replace(URL_RE, '<a class="link" href="$1" target="_blank" rel="noopener">$1</a>');
    if (term) { const re = new RegExp('(' + reEsc(esc(term)) + ')', 'gi'); h = h.split(/(<[^>]+>)/).map((p) => (p.startsWith('<') ? p : p.replace(re, '<mark>$1</mark>'))).join(''); }
    return h;
  };
  F.fmtSize = fmtSize; F.extOf = extOf;
  F.isMuted = (o) => !!(o && o.mutedUntil && (o.mutedUntil === 'forever' || new Date(o.mutedUntil) > Date.now()));
  const copy = (x) => { const ok = () => F.toast('Đã sao chép'); try { navigator.clipboard.writeText(x).then(ok, ok); } catch (e) { ok(); } };
  const thumb = (file) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, 480 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); try { res(c.toDataURL('image/jpeg', 0.72)); } catch (e) { rej(e); } }; img.onerror = rej; img.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); });
  const imgPh = (seed) => { let h = 0; for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const bars = Array.from({ length: 9 }, (_, k) => 30 + ((h >> k) % 7) * 12); return `<svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="240" height="150" fill="#0A2E5C"/>${bars.map((b, k) => `<rect x="${16 + k * 24}" y="${130 - b}" width="14" height="${b}" rx="3" fill="${k === 8 ? '#FECB00' : '#1BACCE'}" opacity="${k === 8 ? 1 : 0.75}"/>`).join('')}<line x1="10" x2="230" y1="130" y2="130" stroke="#fff" stroke-opacity=".25"/></svg>`; };

  /* ---------------- Tệp đính kèm (A5) ---------------- */
  F.attHtml = (f, mi, k) => (f.kind === 'image'
    ? `<button type="button" class="att-img" data-att="${mi}:${k}" aria-label="Xem ảnh ${esc(f.name)}">${f.data ? `<img src="${f.data}" alt="">` : imgPh(f.name)}</button>`
    : `<button type="button" class="att-file" data-att="${mi}:${k}"><span class="fi">${esc(extOf(f.name).toUpperCase().slice(0, 4))}</span><span class="t"><b>${esc(f.name)}</b><small>${fmtSize(f.size)} · ${I('shieldCheck', 'i-xs')}Đã quét an toàn</small></span>${I('download', 'i-sm')}</button>`);
  const openAtt = (f) => {
    if (f.kind === 'image') F.modal({ title: esc(f.name), size: 'wide', body: `<div class="lightbox">${f.data ? `<img src="${f.data}" alt="${esc(f.name)}">` : imgPh(f.name)}</div><p class="hint mt-8">${fmtSize(f.size)} · Đã quét virus an toàn · Chỉ hiển thị với thành viên của phiên</p>`, actions: [{ label: 'Đóng' }, { label: 'Tải xuống', cls: 'btn-primary', onClick: () => F.toast('Mô phỏng: đã tải ' + f.name) }] });
    else F.toast('Mô phỏng: tải xuống ' + f.name + ' (' + fmtSize(f.size) + ')', 'info');
  };
  const bindAtts = (root, msgs) => $$('[data-att]', root).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const [mi, k] = b.dataset.att.split(':').map(Number); const f = msgs[mi] && (msgs[mi].files || [])[k]; if (f) openAtt(f); }));

  /* ---------------- Hiển thị luồng tin nhắn ---------------- */
  const preview = (m) => (m.recalled ? 'Tin nhắn đã được thu hồi' : m.x || (m.files || []).map((f) => (f.kind === 'image' ? '[Ảnh] ' : '[Tệp] ') + f.name).join(', '));
  F.msgPreview = preview;
  const rxRow = (m, i, ctx) => {
    const cnt = {}; Object.values(m.rx || {}).forEach((k) => (cnt[k] = (cnt[k] || 0) + 1));
    const mineK = (m.rx || {})[ctx.meId];
    const ks = RX.filter((r) => cnt[r[0]]); if (!ks.length) return '';
    return `<div class="rx-row">${ks.map((r) => `<button type="button" class="rx ${mineK === r[0] ? 'on' : ''}" data-rx="${i}" data-k="${r[0]}" title="${r[2]}">${r[1]} ${r[2]}${cnt[r[0]] > 1 ? ` <b>${cnt[r[0]]}</b>` : ''}</button>`).join('')}</div>`;
  };
  const msgHtml = (m, i, ctx) => {
    const mine = m.by === ctx.meId; const p = F.person(m.by);
    const name = ctx.showName && !mine ? `<div class="mn">${esc(p.name)}${ctx.roleOf ? ctx.roleOf(m.by) : ''}</div>` : '';
    let body;
    if (m.removed) body = `<div class="bub recalled">${I('shield', 'i-xs')}Tin nhắn đã bị điều phối viên gỡ do vi phạm quy tắc</div>`;
    else if (m.recalled) body = `<div class="bub recalled">${I('undo', 'i-xs')}${mine ? 'Bạn đã thu hồi một tin nhắn' : 'Tin nhắn đã được thu hồi'}</div>`;
    else {
      const hid = m.x && m.x.startsWith('[Nội dung đã bị ẩn');
      const t = m.re != null ? ctx.msgs[m.re] : null;
      const rq = t ? `<span class="rq" data-jump="${m.re}"><b>${esc(t.by === ctx.meId ? 'Bạn' : F.person(t.by).name)}</b><span>${esc(preview(t))}</span></span>` : '';
      const files = (m.files || []).map((f, k) => F.attHtml(f, i, k)).join('');
      body = `<div class="bub ${hid ? 'hid' : ''} ${files ? 'has-att' : ''}" data-mi="${i}" tabindex="0" role="button" aria-haspopup="dialog">${rq}${m.x ? `<div class="bt">${fmtText(m.x, ctx.term)}</div>` : ''}${files ? `<div class="atts">${files}</div>` : ''}</div>`;
    }
    return `<div class="msg ${mine ? 'me' : 'them'}" id="m${i}">${mine ? '' : F.avatar(p, 'sm')}<div class="mc">${name}${body}${m.recalled || m.removed ? '' : rxRow(m, i, ctx)}<div class="tm">${time(m.at)}</div></div></div>`;
  };
  const callCard = (c, ctx) => {
    const ic = c.kind === 'video' ? 'video' : 'phoneCall'; const kl = c.kind === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại';
    const st = new Date(c.at).getTime(); const end = st + (c.len || 30) * MIN;
    if (c.status === 'scheduled' && Date.now() > end) c.status = 'missed';
    if (c.status === 'done') return `<div class="call-card"><span class="ci">${I(ic)}</span><div class="grow"><b>${kl} theo lịch hẹn</b><small>${dur(c.dur)} · ${time(c.at)}${c.note ? ' · ' + esc(c.note) : ''}</small></div>${ctx.canBook ? `<button class="btn btn-gray btn-xs" data-rebook="${c.kind}">Đặt lịch lại</button>` : ''}</div>`;
    if (c.status === 'declined') return `<div class="call-card off"><span class="ci">${I('x')}</span><div class="grow"><b>Chuyên gia chưa nhận lịch ${kl.toLowerCase()}</b><small>${whenLabel(c.at)}${c.reason ? '<br>Lý do: ' + esc(c.reason) : ''}</small></div>${ctx.canBook ? `<button class="btn btn-gray btn-xs" data-rebook="${c.kind}">Đặt lịch khác</button>` : ''}</div>`;
    if (c.status === 'scheduled' && c.proposed) return `<div class="call-card sched prop"><span class="ci">${I('calendar')}</span><div class="grow"><b>Chuyên gia đề xuất giờ khác</b><small><s>${whenLabel(c.at)}</s> → <b class="hl">${whenLabel(c.proposed)}</b>${c.reason ? '<br>' + esc(c.reason) : ''}</small></div><button class="btn btn-primary btn-xs" data-cok="${c.id}">Đồng ý</button><button class="icon-btn sm" data-cx="${c.id}" aria-label="Hủy lịch">${I('x')}</button></div>`;
    if (c.status === 'missed' || c.status === 'cancelled') return `<div class="call-card off"><span class="ci">${I(c.status === 'missed' ? 'phoneOff' : 'x')}</span><div class="grow"><b>${c.status === 'missed' ? 'Đã lỡ ' + kl.toLowerCase() + ' đã hẹn' : 'Đã hủy lịch ' + kl.toLowerCase()}</b><small>${whenLabel(c.at)}</small></div>${ctx.canBook ? `<button class="btn btn-gray btn-xs" data-rebook="${c.kind}">Đặt lịch lại</button>` : ''}</div>`;
    const open = Date.now() >= st - 10 * MIN && Date.now() <= end;
    return `<div class="call-card sched ${open ? 'live' : ''}"><span class="ci">${I(ic)}</span><div class="grow"><b>${open ? kl + ' đang mở' : 'Lịch ' + kl.toLowerCase()} · ${c.len || 30} phút</b><small>${whenLabel(c.at)}${c.confirmed === false ? ' · Chờ chuyên gia xác nhận' : ' · Đã xác nhận'}${c.note ? '<br>' + esc(c.note) : ''}</small></div>${open ? `<a class="btn btn-primary btn-xs" href="${F.url('reader/call.html?q=' + ctx.qid + '&c=' + c.id)}">${I(ic, 'i-xs')}Tham gia</a>` : `<button class="icon-btn sm" data-ccal="${c.id}" aria-label="Thêm vào lịch">${I('calendar')}</button><button class="icon-btn sm" data-cx="${c.id}" aria-label="Hủy lịch">${I('x')}</button>`}</div>`;
  };
  // items: [{k:'m', m, i} | {k:'call', c, at}]
  const threadHtml = (items, ctx) => {
    let lastDay = ''; let out = ''; let shown = false;
    items.forEach((it) => {
      const d = new Date(it.at).toDateString();
      if (d !== lastDay) { out += `<div class="day-sep"><span>${dayLabel(it.at)}</span></div>`; lastDay = d; }
      if (it.k === 'call') { out += callCard(it.c, ctx); return; }
      if (!shown && ctx.seen != null && it.i >= ctx.seen && it.m.by !== ctx.meId) { out += `<div class="new-sep" id="newSep"><span>Tin nhắn mới</span></div>`; shown = true; }
      out += msgHtml(it.m, it.i, ctx);
    });
    return out;
  };
  const msgItems = (msgs, meId, hideBefore, blocked) => msgs.map((m, i) => ({ k: 'm', m, i, at: m.at })).filter((it) => !(it.m.hideFor || []).includes(meId) && !(hideBefore && new Date(it.at) <= new Date(hideBefore)) && !(blocked && blocked.includes(it.m.by)));

  /* ---------------- Menu tin nhắn (A1–A4) ---------------- */
  const msgMenu = (i, ctx) => {
    const m = ctx.msgs[i]; if (!m || m.recalled || m.removed) return;
    const mine = m.by === ctx.meId; const age = (Date.now() - new Date(m.at)) / MIN; const canRecall = mine && age <= RECALL_MIN;
    const items = [
      ctx.canWrite ? { icon: 'reply', label: 'Trả lời', on: () => ctx.onReply(i) } : null,
      m.x ? { icon: 'copy', label: 'Sao chép', on: () => copy(m.x) } : null,
      canRecall ? { icon: 'undo', label: `Thu hồi với mọi người · còn ${Math.max(1, Math.ceil(RECALL_MIN - age))} phút`, on: () => { m.recalled = true; m.recalledAt = now(); F.save(); ctx.redraw(); F.toast('Đã thu hồi tin nhắn'); } } : null,
      { icon: 'eyeOff', label: 'Xóa phía tôi', danger: true, on: () => { m.hideFor = (m.hideFor || []).concat(ctx.meId); F.save(); ctx.redraw(); F.toast('Đã xóa tin nhắn ở phía bạn', 'info'); } },
      !mine && ctx.onReport ? { icon: 'flag', label: 'Báo cáo tin nhắn', danger: true, on: () => ctx.onReport(m) } : null,
      !mine && ctx.onBlockUser && ctx.canBlock(m.by) ? { icon: 'ban', label: 'Chặn ' + (F.person(m.by).short || F.person(m.by).name), danger: true, on: () => ctx.onBlockUser(m.by) } : null
    ].filter(Boolean);
    const pick = !mine && ctx.canWrite ? `<div class="rx-pick">${RX.map((r) => `<button type="button" class="${(m.rx || {})[ctx.meId] === r[0] ? 'on' : ''}" data-pk="${r[0]}"><span class="e">${r[1]}</span><span>${r[2]}</span></button>`).join('')}</div>` : '';
    F.modal({ title: 'Tin nhắn', body: `<div class="msg-peek">${esc(preview(m)).slice(0, 160)}</div>${pick}<div class="menu-list">${items.map((it, k) => `<button data-mm="${k}" class="${it.danger ? 'danger' : ''}">${I(it.icon)}<span>${it.label}</span></button>`).join('')}</div>${mine && !canRecall ? `<p class="hint mt-8">Chỉ thu hồi được trong ${RECALL_MIN} phút sau khi gửi. “Xóa phía tôi” chỉ ẩn trên thiết bị của bạn — FBV vẫn lưu nội dung để phục vụ kiểm duyệt.</p>` : mine ? `<p class="hint mt-8">Tin nhắn thu hồi vẫn được lưu trong nhật ký kiểm duyệt của FBV.</p>` : ''}`,
      onOpen: (el, close) => {
        $$('[data-mm]', el).forEach((b) => (b.onclick = () => { close(); items[+b.dataset.mm].on(); }));
        $$('[data-pk]', el).forEach((b) => (b.onclick = () => { m.rx = m.rx || {}; if (m.rx[ctx.meId] === b.dataset.pk) delete m.rx[ctx.meId]; else m.rx[ctx.meId] = b.dataset.pk; F.save(); close(); ctx.redraw(); }));
      } });
  };
  const bindThread = (root, ctx) => {
    $$('[data-mi]', root).forEach((b) => { b.onclick = (e) => { if (e.target.closest('a,[data-att],[data-jump]')) return; msgMenu(+b.dataset.mi, ctx); }; b.onkeydown = (e) => { if (e.key === 'Enter') msgMenu(+b.dataset.mi, ctx); }; });
    $$('[data-rx]', root).forEach((b) => (b.onclick = () => { if (!ctx.canWrite) return; const m = ctx.msgs[+b.dataset.rx]; if (m.by === ctx.meId) return; m.rx = m.rx || {}; if (m.rx[ctx.meId] === b.dataset.k) delete m.rx[ctx.meId]; else m.rx[ctx.meId] = b.dataset.k; F.save(); ctx.redraw(); }));
    $$('[data-jump]', root).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const t = $('#m' + b.dataset.jump); if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1400); } else F.toast('Tin nhắn gốc đã bị ẩn', 'info'); }));
    bindAtts(root, ctx.msgs);
  };

  /* ---------------- Ô soạn tin (A1 trả lời · A5 đính kèm) ---------------- */
  const composerHtml = (ph) => `<div class="composer cx" id="cmpBox"><div class="inner col"><div class="reply-bar" id="rbar" hidden></div><div class="pend" id="pend" hidden></div>
    <div class="row-in"><button type="button" class="c-att" id="att" aria-label="Đính kèm tệp hoặc ảnh">${I('paperclip')}</button><textarea id="tx" rows="1" placeholder="${ph}" maxlength="1500" aria-label="Nội dung"></textarea><button type="button" class="send" id="snd" disabled aria-label="Gửi">${I('send')}</button></div>
    <input type="file" id="fin" hidden aria-label="Chọn tệp đính kèm"></div></div>`;
  const dock = () => { const c = $('#cmpBox') || $('.composer-closed'); document.body.style.setProperty('--dock', (c ? c.offsetHeight : 0) + 'px'); };
  const bindComposer = (ctx) => {
    const tx = $('#tx'); if (!tx) return null; let reply = null; const pend = [];
    const upd = () => { $('#snd').disabled = pend.some((p) => p.scan === 'pending') || !(tx.value.trim().length >= 2 || pend.length); dock(); };
    const drawReply = () => { const rb = $('#rbar'); if (reply == null) { rb.hidden = true; rb.innerHTML = ''; } else { const m = ctx.msgs[reply]; rb.hidden = false; rb.innerHTML = `${I('reply', 'i-sm')}<div class="grow"><b>Trả lời ${esc(m.by === ctx.meId ? 'chính bạn' : F.person(m.by).name)}</b><span class="ellipsis">${esc(preview(m))}</span></div><button type="button" class="icon-btn sm" id="rbx" aria-label="Hủy trả lời">${I('x')}</button>`; $('#rbx').onclick = () => { reply = null; drawReply(); }; } upd(); };
    const drawPend = () => { const p = $('#pend'); p.hidden = !pend.length; p.innerHTML = pend.map((f, k) => `<span class="pchip ${f.scan}">${f.kind === 'image' ? (f.data ? `<img src="${f.data}" alt="">` : I('image', 'i-xs')) : I('file', 'i-xs')}<span class="ellipsis">${esc(f.name)}</span><small>${f.scan === 'pending' ? (f.kind === 'image' ? 'Đang kiểm duyệt ảnh…' : 'Đang quét virus…') : fmtSize(f.size)}</small><button type="button" data-rk="${k}" aria-label="Bỏ tệp">${I('x', 'i-xs')}</button></span>`).join(''); $$('[data-rk]', p).forEach((b) => (b.onclick = () => { pend.splice(+b.dataset.rk, 1); drawPend(); })); upd(); };
    tx.addEventListener('input', () => { tx.style.height = 'auto'; tx.style.height = Math.min(140, tx.scrollHeight) + 'px'; upd(); });
    tx.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && window.innerWidth >= 768) { e.preventDefault(); if (!$('#snd').disabled) $('#snd').click(); } });
    const fin = $('#fin');
    const pick = (kind) => { fin.accept = EXT[kind].map((x) => '.' + x).join(','); fin.dataset.kind = kind; fin.value = ''; fin.click(); };
    $('#att').onclick = () => F.menu([{ icon: 'file', label: 'Tài liệu · PDF, Excel, Word, CSV (≤ 10 MB)', onClick: () => pick('file') }, { icon: 'image', label: 'Ảnh · PNG, JPG (≤ 5 MB)', onClick: () => pick('image') }], 'Đính kèm');
    fin.onchange = () => {
      const f = fin.files[0]; if (!f) return; const ext = extOf(f.name);
      const kind = fin.dataset.kind || (EXT.image.includes(ext) ? 'image' : 'file');
      if (!EXT[kind].includes(ext)) { F.toast('Định dạng .' + ext + ' không được hỗ trợ', 'error'); return; }
      if (f.size > LIM[kind]) { F.toast('Tệp vượt quá ' + (kind === 'image' ? '5' : '10') + ' MB', 'error'); return; }
      if (pend.length >= 5) { F.toast('Tối đa 5 tệp mỗi tin nhắn', 'error'); return; }
      if (!ctx.noFilter && F.blockedFile && F.blockedFile(f.name)) { F.modal({ title: 'Tệp không qua kiểm duyệt', body: `<div class="note warn">${I('shield')}<span>Hệ thống kiểm duyệt tự động phát hiện tệp có thể chứa nội dung không phù hợp nên chưa cho gửi. Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ Hỗ trợ.</span></div>`, actions: [{ label: 'Đã hiểu', cls: 'btn-primary' }] }); return; }
      const item = { name: f.name, size: f.size, kind, scan: 'pending' }; pend.push(item); drawPend();
      const done = () => setTimeout(() => { item.scan = 'ok'; drawPend(); }, 800);
      if (kind === 'image') thumb(f).then((d) => { item.data = d; done(); }, done); else done();
    };
    $('#snd').onclick = () => {
      const x = tx.value.trim(); if (x.length < 2 && !pend.length) return;
      if (!ctx.noFilter && x && F.blockedText && F.blockedText(x, 'Tin nhắn')) return;
      const m = { by: ctx.meId, at: now(), x };
      if (reply != null) m.re = reply;
      if (pend.length) m.files = pend.map((f) => ({ name: f.name, size: f.size, kind: f.kind, scan: 'ok', data: f.data }));
      tx.value = ''; tx.style.height = ''; reply = null; pend.length = 0; drawReply(); drawPend();
      ctx.onSend(m);
    };
    dock();
    return { setReply: (i) => { reply = i; drawReply(); tx.focus(); } };
  };

  /* ---------------- Tìm trong phiên (A9) ---------------- */
  const searchBar = (ctx) => {
    const sb = $('#sb'); sb.hidden = false; let cur = 0;
    sb.innerHTML = `<div class="inner">${I('search', 'i-sm')}<input id="sq" type="search" placeholder="${ctx.searchPh || 'Tìm trong phiên'}" aria-label="Tìm trong phiên" autocomplete="off"><span class="small faint num" id="sc"></span><button type="button" class="icon-btn sm" id="sup" aria-label="Kết quả trước">${I('chevU')}</button><button type="button" class="icon-btn sm" id="sdn" aria-label="Kết quả sau">${I('chevD')}</button><button type="button" class="txt-btn" id="sx">Xong</button></div>`;
    const go = () => { const ms = $$('#th mark'); $('#sc').textContent = ctx.term ? (ms.length ? cur + 1 + '/' + ms.length : '0 kết quả') : ''; ms.forEach((x, k) => x.classList.toggle('cur', k === cur)); if (ms[cur]) ms[cur].scrollIntoView({ block: 'center' }); };
    $('#sq').oninput = () => { ctx.term = $('#sq').value.trim(); ctx.redraw(true); const ms = $$('#th mark'); cur = Math.max(0, ms.length - 1); go(); };
    $('#sup').onclick = () => { const n = $$('#th mark').length; if (n) { cur = (cur - 1 + n) % n; go(); } };
    $('#sdn').onclick = () => { const n = $$('#th mark').length; if (n) { cur = (cur + 1) % n; go(); } };
    $('#sx').onclick = () => { ctx.term = ''; sb.hidden = true; sb.innerHTML = ''; ctx.redraw(true); };
    setTimeout(() => $('#sq').focus(), 30);
  };

  /* ---------------- Tài liệu trong phiên (A6) ---------------- */
  const mediaSheet = (msgs, meId, extraLinks, title) => {
    const vis = msgs.map((m, i) => ({ m, i })).filter((x) => !x.m.recalled && !(x.m.hideFor || []).includes(meId));
    const imgs = []; const files = []; const links = (extraLinks || []).slice();
    vis.forEach(({ m, i }) => { (m.files || []).forEach((f, k) => (f.kind === 'image' ? imgs : files).push({ f, i, k, m })); (m.x || '').replace(URL_RE, (u) => { links.push({ u, m }); return u; }); });
    let tab = 'img';
    F.modal({ title: title || 'Tài liệu trong phiên', size: 'wide', body: `<div class="seg full" id="mt"></div><div id="mb" class="mt-12"></div>`, onOpen: (el) => {
      const draw = () => {
        $('#mt', el).innerHTML = [['img', 'Ảnh', imgs.length], ['file', 'File', files.length], ['link', 'Liên kết', links.length]].map((t) => `<button class="${tab === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]} · ${t[2]}</button>`).join('');
        $$('[data-t]', el).forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
        const mb = $('#mb', el);
        if (tab === 'img') mb.innerHTML = imgs.length ? `<div class="media-grid">${imgs.map((x) => `<button type="button" class="att-img" data-att="${x.i}:${x.k}">${x.f.data ? `<img src="${x.f.data}" alt="">` : imgPh(x.f.name)}</button>`).join('')}</div>` : F.empty('image', 'Chưa có ảnh', 'Ảnh gửi trong phiên sẽ xuất hiện tại đây.');
        else if (tab === 'file') mb.innerHTML = files.length ? `<div class="stack">${files.map((x) => F.attHtml(x.f, x.i, x.k).replace('</b>', `</b><small class="by">${esc(F.person(x.m.by).name)} · ${F.date(x.m.at)}</small>`)).join('')}</div>` : F.empty('file', 'Chưa có tệp', 'Tài liệu PDF, Excel… gửi trong phiên sẽ xuất hiện tại đây.');
        else mb.innerHTML = links.length ? `<div class="group">${links.map((x) => `<a class="gi" href="${x.href || x.u}" ${x.href ? '' : 'target="_blank" rel="noopener"'}>${I(x.icon || 'link')}<span class="gl" style="font-weight:500;word-break:break-all">${esc(x.label || x.u)}<small>${x.m ? esc(F.person(x.m.by).name) + ' · ' + F.date(x.m.at) : 'Bài nghiên cứu gốc'}</small></span>${I('chevR', 'chev')}</a>`).join('')}</div>` : F.empty('link', 'Chưa có liên kết', 'Liên kết chia sẻ trong phiên sẽ xuất hiện tại đây.');
        bindAtts(mb, msgs);
      };
      draw();
    } });
  };

  /* ---------------- Tắt thông báo (A8) ---------------- */
  const muteSheet = (o, after) => {
    const muted = F.isMuted(o);
    F.modal({ title: 'Thông báo của phiên này', body: `${muted ? `<div class="note mb-12">${I('bellOff')}<span>Đang tắt thông báo${o.mutedUntil === 'forever' ? ' cho đến khi bạn bật lại' : ' đến ' + F.date(o.mutedUntil, true)}.</span></div>` : ''}<div class="group">${[['1', 'Trong 1 giờ'], ['8', 'Trong 8 giờ'], ['24', 'Trong 24 giờ'], ['forever', 'Cho đến khi bật lại']].map((x) => `<button class="gi noicon" data-mu="${x[0]}"><span class="gl" style="font-weight:500">${x[1]}</span>${I('chevR', 'chev')}</button>`).join('')}</div><p class="hint mt-8">Chỉ ảnh hưởng tới phiên này. Bạn vẫn thấy chấm chưa đọc trong danh sách.</p>`,
      actions: muted ? [{ label: 'Bật lại thông báo', cls: 'btn-primary', onClick: () => { o.mutedUntil = null; F.save(); F.toast('Đã bật lại thông báo'); after(); } }] : [],
      onOpen: (el, close) => $$('[data-mu]', el).forEach((b) => (b.onclick = () => { o.mutedUntil = b.dataset.mu === 'forever' ? 'forever' : new Date(Date.now() + +b.dataset.mu * 36e5).toISOString(); F.save(); close(); F.toast('Đã tắt thông báo phiên này', 'info'); after(); })) });
  };

  /* ---------------- Báo cáo 1 tin nhắn ---------------- */
  const reportMsg = (refType, ref, m) => (F.reportSheet ? F.reportSheet({ type: refType, ref, target: m.by, what: preview(m), title: 'Báo cáo tin nhắn' }) : 0);
  const reportMsgOld = (refType, ref, m) => F.modal({ title: 'Báo cáo tin nhắn', body: `<div class="msg-peek">${esc(preview(m)).slice(0, 200)}</div><div class="group">${['Ngôn từ xúc phạm / quấy rối', 'Spam hoặc quảng cáo', 'Khuyến nghị mua/bán trái quy định', 'Khác'].map((x, i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${x}</span><input type="radio" name="rm" value="${x}" ${i ? '' : 'checked'}></label>`).join('')}</div>`,
    actions: [{ label: 'Hủy' }, { label: 'Gửi báo cáo', cls: 'btn-danger', onClick: (c, el) => { F.db().moderation.unshift({ id: F.uid('m'), type: refType, ref, reporter: F.me().id, target: m.by, reason: $('input[name=rm]:checked', el).value, detail: 'Tin nhắn: “' + preview(m).slice(0, 180) + '”', status: 'open', createdAt: now() }); F.save(); F.toast('Đã gửi báo cáo tới đội kiểm duyệt FBV'); } }] });

  /* ---------------- Đặt lịch gọi 1:1 (B1 · Phase 2 · Premium) ---------------- */
  const slots = () => { const d = (days, h, m) => { const x = new Date(); x.setDate(x.getDate() + days); x.setHours(h, m || 0, 0, 0); return x; }; return [d(1, 20), d(2, 9), d(3, 20, 30), d(5, 14)]; };
  const bookCall = (q, e, after, kind0) => {
    if (!F.hasSub()) { F.modal({ title: 'Gọi 1:1 theo lịch hẹn', body: `<div class="stack"><div class="empty" style="padding:4px 0"><div class="ico">${I('phoneCall')}</div><h3>Đặc quyền Premium</h3><p>Hội viên Premium có thể đặt lịch gọi thoại hoặc video 15–30 phút với chuyên gia để trao đổi sâu về bài nghiên cứu.</p></div><div class="note">${I('info')}<span>FBV không hỗ trợ gọi tự do. Cuộc gọi chỉ mở trong khung giờ đã hẹn và chuyên gia xác nhận.</span></div></div>`, actions: [{ label: 'Xem gói Premium', onClick: () => F.go('reader/pricing.html') }, { label: 'Dùng thử Premium (demo)', cls: 'btn-primary', onClick: () => { const ss = F.session(); ss.subscription = { plan: 'yearly', store: 'apple', since: now(), renew: new Date(Date.now() + 365 * 864e5).toISOString(), autoRenew: true }; F.save(); F.toast('Đã bật Premium (demo)'); setTimeout(() => bookCall(q, e, after, kind0), 300); } }] }); return; }
    let kind = kind0 || 'video';
    F.modal({ title: 'Đặt lịch gọi với ' + esc(e.short || e.name), body: `<div class="stack"><div class="seg full" id="bk">${[['video', 'Video'], ['voice', 'Thoại']].map((k) => `<button type="button" data-k="${k[0]}" class="${kind === k[0] ? 'on' : ''}">${I(k[0] === 'video' ? 'video' : 'phoneCall', 'i-xs')} ${k[1]}</button>`).join('')}</div>
      <div><div class="group-title">Khung giờ chuyên gia công bố</div><div class="group">${slots().map((s, i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${s.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}<small>${time(s)} – ${time(new Date(+s + 30 * MIN))}</small></span><input type="radio" name="sl" value="${s.toISOString()}" ${i ? '' : 'checked'}></label>`).join('')}</div></div>
      <div class="field"><label for="bl">Thời lượng</label><select class="select" id="bl"><option value="15">15 phút</option><option value="30" selected>30 phút</option></select></div>
      <div class="field"><label for="bn">Nội dung muốn trao đổi</label><textarea class="textarea" id="bn" maxlength="300" style="min-height:70px" placeholder="VD: Trao đổi phương pháp ước lượng trong bài…"></textarea></div>
      <p class="hint">Cuộc gọi chỉ mở trong khung giờ đã hẹn · không ghi âm/ghi hình · tuân thủ Quy tắc cộng đồng. Hủy trước 12 giờ không tính lượt.</p></div>`,
      onOpen: (el) => $$('#bk [data-k]', el).forEach((b) => (b.onclick = () => { kind = b.dataset.k; $$('#bk [data-k]', el).forEach((x) => x.classList.toggle('on', x === b)); })),
      actions: [{ label: 'Hủy' }, { label: 'Gửi yêu cầu đặt lịch', cls: 'btn-primary', onClick: (c, el) => { q.calls = q.calls || []; q.calls.push({ id: F.uid('c'), kind, by: F.me().id, at: $('input[name=sl]:checked', el).value, len: +$('#bl', el).value, status: 'scheduled', confirmed: false, note: $('#bn', el).value.trim() }); q.expertUnread = true; F.save(); F.toast('Đã gửi yêu cầu — chuyên gia xác nhận trong 24 giờ'); after(); } }] });
  };

  /* ================= R13 · Phiên trao đổi 1:1 (nâng cấp) ================= */
  pages.inquiry = () => {
    const me = F.me(); const q = F.inquiry(F.param('id'));
    if (!me) { const v = F.shell({ bar: 'back', back: 'reader/inquiries.html', title: 'Phản biện' }); v.innerHTML = F.gate('chat', 'Đăng nhập để xem phiên trao đổi', 'Phiên phản biện 1:1 chỉ hiển thị với bạn và chuyên gia.'); return; }
    if (!q || q.reader !== me.id) { const v = F.shell({ bar: 'back', back: 'reader/inquiries.html', title: 'Phản biện' }); v.innerHTML = F.empty('chat', 'Không tìm thấy phiên', 'Phiên không tồn tại hoặc không thuộc tài khoản của bạn.'); return; }
    const nid = F.param('n'); if (nid) { const n = F.db().notifications.find((x) => x.id === nid); if (n) n.read = true; }
    const seen0 = q.readerSeen != null ? q.readerSeen : q.messages.length;
    const newCount = q.messages.slice(seen0).filter((m) => m.by !== me.id && !m.recalled).length;
    q.readerUnread = false; q.readerSeen = q.messages.length; q.hideBefore = q.hideBefore || {}; F.save();
    const e = F.expert(q.expert); const r = F.report(q.r); const p2 = F.session().phase2;
    const blocked = () => me.blocked.includes(e.id);
    const v = F.shell({ side: 'chat', bar: 'back', back: 'reader/inquiries.html', notab: true, title: '', right: `<button class="icon-btn" id="book" aria-label="Đặt lịch gọi">${I('phoneCall')}</button><button class="icon-btn" id="media" aria-label="Tài liệu trong phiên">${I('layers')}</button><button class="icon-btn" id="more" aria-label="Tùy chọn">${I('more')}</button>` });
    const head = () => { $('#abTitle').innerHTML = `<a class="row" style="justify-content:center;gap:8px;min-width:0" href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'sm')}<span class="ellipsis" style="font-size:16px">${esc(e.name)}</span>${F.vb(e)}${F.isMuted(q) ? `<span class="faint" title="Đã tắt thông báo">${I('bellOff', 'i-xs')}</span>` : ''}</a>`; };
    head(); document.title = 'Phản biện · ' + e.name + ' · FBV';
    v.innerHTML = `<div class="srch-bar" id="sb" hidden></div><div class="thread-quote"><a class="quote-card" href="${F.url('reader/report.html?id=' + r.id)}" style="display:block">“${esc(q.quote)}”<small>${esc(r.title)}</small></a><div class="row between mt-8 small faint"><span>${F.iStatusBadge(q.status)}</span><span>Mở ${F.date(q.createdAt)}${['new', 'assigned', 'in_progress'].includes(q.status) ? ' · phản hồi trong ' + F.db().config.slaHours + ' giờ' : ''}</span></div></div>
      <div id="hn"></div><div class="thread" id="th"></div><div id="cmp"></div><button type="button" class="jump-new" id="jn" hidden>${I('arrowDown', 'i-sm')}<span></span></button>`;
    let comp = null;
    const ctx = { msgs: q.messages, meId: me.id, qid: q.id, term: '', seen: newCount ? seen0 : null, canBook: p2, canWrite: true,
      onReply: (i) => comp && comp.setReply(i),
      onReport: (m) => reportMsg('inquiry', q.id, m),
      onSend: (m) => { q.messages.push(m); q.readerSeen = q.messages.length; if (q.status === 'answered') q.status = 'in_progress'; q.expertUnread = true; F.save(); ctx.seen = null; ctx.redraw(); window.scrollTo(0, document.body.scrollHeight); F.toast('Đã gửi tới ' + e.name); },
      redraw: (keep) => draw(keep) };
    const composer = () => {
      const closed = ['closed', 'reported'].includes(q.status) || blocked(); ctx.canWrite = !closed;
      $('#cmp').innerHTML = closed ? `<div class="composer-closed">${blocked() ? 'Bạn đã chặn chuyên gia này. Bỏ chặn trong Cài đặt → Quyền riêng tư.' : q.status === 'reported' ? 'Phiên đang được FBV xem xét do có báo cáo vi phạm.' : 'Phiên đã đóng. Bạn có thể mở phiên mới từ bài nghiên cứu.'}</div>` : composerHtml('Viết phản hồi học thuật…');
      comp = closed ? null : bindComposer(ctx); dock();
    };
    const draw = (keep) => {
      const y = window.scrollY; const hb = q.hideBefore[me.id];
      ctx.canWrite = !(['closed', 'reported'].includes(q.status) || blocked());
      const items = msgItems(q.messages, me.id, hb).concat(p2 ? (q.calls || []).map((c) => ({ k: 'call', c, at: c.at })) : []).sort((a, b) => new Date(a.at) - new Date(b.at));
      $('#hn').innerHTML = hb ? `<div class="hist-note">${I('eyeOff', 'i-xs')}Lịch sử trước ${F.date(hb, true)} đã được ẩn phía bạn. <button type="button" class="btn-text small" id="unh">Hiện lại</button></div>` : '';
      const th = $('#th'); th.innerHTML = items.length ? threadHtml(items, ctx) : `<div class="empty" style="padding:24px 0"><p>Chưa có tin nhắn mới.</p></div>`;
      bindThread(th, ctx);
      $$('[data-rebook]', th).forEach((b) => (b.onclick = () => bookCall(q, e, () => draw(), b.dataset.rebook)));
      $$('[data-cx]', th).forEach((b) => (b.onclick = () => F.confirm('Hủy lịch gọi?', 'Chuyên gia sẽ nhận được thông báo hủy. Hủy trước 12 giờ không tính lượt.', 'Hủy lịch', 'btn-danger', () => { const c = q.calls.find((x) => x.id === b.dataset.cx); c.status = 'cancelled'; F.save(); draw(); F.toast('Đã hủy lịch gọi', 'info'); })));
      $$('[data-cok]', th).forEach((b) => (b.onclick = () => { const c = q.calls.find((x) => x.id === b.dataset.cok); c.at = c.proposed; c.proposed = null; c.reason = ''; c.confirmed = true; q.expertUnread = true; F.save(); draw(); F.toast('Đã đồng ý giờ mới · lịch gọi đã được xác nhận'); }));
      $$('[data-ccal]', th).forEach((b) => (b.onclick = () => F.toast('Mô phỏng: đã thêm vào Lịch của thiết bị (tệp .ics)')));
      const unh = $('#unh'); if (unh) unh.onclick = () => { delete q.hideBefore[me.id]; F.save(); draw(); };
      if (keep) window.scrollTo(0, y);
    };
    composer(); draw();
    // A7 · cuộn tới "Tin nhắn mới" và nút nhảy xuống cuối
    const sep = $('#newSep');
    if (sep) sep.scrollIntoView({ block: 'center' }); else window.scrollTo(0, document.body.scrollHeight);
    const jn = $('#jn'); $('span', jn).textContent = newCount ? newCount + ' tin nhắn mới' : 'Xuống cuối';
    const onScroll = () => { const far = document.body.scrollHeight - (window.scrollY + window.innerHeight) > 260; jn.hidden = !far; };
    window.addEventListener('scroll', onScroll, { passive: true }); setTimeout(onScroll, 50);
    jn.onclick = () => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); ctx.seen = null; };
    const p2Gate = () => F.modal({ title: 'Gọi 1:1 theo lịch hẹn', body: `<div class="stack"><div class="empty" style="padding:4px 0"><div class="ico">${I('phoneCall')}</div><h3>Tính năng Phase 2</h3><p>Hội viên Premium đặt lịch gọi thoại/video 15–30 phút với chuyên gia. Không gọi tự do — cuộc gọi chỉ mở trong khung giờ đã hẹn.</p></div></div>`, actions: [{ label: 'Để sau' }, { label: 'Bật mô phỏng Phase 2', cls: 'btn-primary', onClick: () => { F.session().phase2 = true; F.save(); location.reload(); } }] });
    const openBook = () => (p2 ? bookCall(q, e, () => draw()) : p2Gate());
    $('#book').onclick = openBook;
    $('#media').onclick = () => mediaSheet(q.messages, me.id, [{ href: F.url('reader/report.html?id=' + r.id), label: r.title, icon: 'file' }]);
    $('#more').onclick = () => F.menu([
      { icon: 'search', label: 'Tìm trong phiên', onClick: () => searchBar(ctx) },
      { icon: 'layers', label: 'Ảnh, file & liên kết trong phiên', onClick: () => $('#media').click() },
      { icon: F.isMuted(q) ? 'bell' : 'bellOff', label: F.isMuted(q) ? 'Bật lại thông báo' : 'Tắt thông báo phiên này', onClick: () => muteSheet(q, () => { head(); }) },
      { icon: 'phoneCall', label: 'Đặt lịch gọi với chuyên gia (Premium)', onClick: openBook },
      { icon: 'file', label: 'Xem bài nghiên cứu gốc', onClick: () => F.go('reader/report.html?id=' + r.id + (q.block != null ? '#p' + q.block : '')) },
      ...(['closed', 'reported'].includes(q.status) ? [] : [{ icon: 'checkCircle', label: 'Đóng phiên (đã được giải đáp)', onClick: () => { q.status = 'closed'; F.save(); composer(); draw(); F.toast('Đã đóng phiên. Cảm ơn bạn!'); } }]),
      { icon: 'eyeOff', label: q.hideBefore[me.id] ? 'Hiện lại lịch sử đã ẩn' : 'Ẩn lịch sử trò chuyện', onClick: () => { if (q.hideBefore[me.id]) { delete q.hideBefore[me.id]; F.save(); draw(); return; } F.confirm('Ẩn lịch sử trò chuyện?', 'Toàn bộ tin nhắn hiện có sẽ được ẩn trên tài khoản của bạn. Chuyên gia vẫn thấy lịch sử, và FBV vẫn lưu trữ để phục vụ kiểm duyệt theo chính sách cộng đồng.', 'Ẩn lịch sử', 'btn-danger', () => { q.hideBefore[me.id] = now(); F.save(); draw(); F.toast('Đã ẩn lịch sử phía bạn', 'info'); }); } },
      { icon: 'flag', label: 'Báo cáo vi phạm', danger: true, onClick: () => F.reportSheet({ type: 'inquiry', ref: q.id, target: e.id, what: 'Toàn bộ phiên #' + q.id.toUpperCase() + ' với ' + e.name, block: 'Chặn chuyên gia này', after: () => { composer(); draw(); } }) },
      { icon: 'ban', label: blocked() ? 'Bỏ chặn chuyên gia' : 'Chặn chuyên gia', danger: true, onClick: () => { if (blocked()) { me.blocked = me.blocked.filter((x) => x !== e.id); F.save(); composer(); draw(); F.toast('Đã bỏ chặn'); } else F.confirm('Chặn ' + e.name + '?', 'Bạn sẽ không nhận tin nhắn từ chuyên gia này và không thể gửi phản biện mới tới họ. Có thể bỏ chặn trong Cài đặt.', 'Chặn', 'btn-danger', () => { me.blocked.push(e.id); F.save(); composer(); draw(); F.toast('Đã chặn chuyên gia', 'info'); }); } }
    ], 'Phiên phản biện');
  };

  /* ================= R12 · Danh sách phản biện (tìm kiếm · tắt thông báo · phòng kín) ================= */
  const inqRow = (q, term) => { const e = F.expert(q.expert); const r = F.report(q.r); const vis = q.messages.filter((m) => !(m.hideFor || []).includes(q.reader)); const last = vis[vis.length - 1] || q.messages[q.messages.length - 1]; const mine = last.by === q.reader;
    const hit = term ? q.messages.find((m) => (m.x || '').toLowerCase().includes(term)) : null;
    return `<a class="lrow ${q.readerUnread ? 'unread' : ''}" href="${F.url('reader/inquiry.html?id=' + q.id)}">${F.avatar(e, 'md')}<div class="t"><b><span class="ellipsis">${esc(e.name)}</span>${F.vb(e)}${F.isMuted(q) ? `<span class="faint">${I('bellOff', 'i-xs')}</span>` : ''}</b><div class="pv">${hit ? fmtText(hit.x.slice(0, 120), term) : (mine ? 'Bạn: ' : '') + esc(preview(last))}</div><small class="ellipsis">${F.iStatusBadge(q.status)} <span style="margin-left:4px">${esc(r ? r.title : '')}</span></small></div><div class="rt"><span>${F.short(last.at)}</span>${q.readerUnread ? `<span class="udot ${F.isMuted(q) ? 'muted' : ''}"></span>` : ''}</div></a>`; };
  F.inqRow = inqRow;
  const myRooms = () => { const s = F.session(); const me = F.me(); if (!s.phase2 || !me) return []; return (F.db().rooms || []).filter((rm) => (s.rsvp || []).includes(rm.session) || rm.members.includes(me.id)); };
  const roomRow = (rm) => { const ss = F.db().sessions.find((x) => x.id === rm.session); const e = F.expert(rm.owner); const last = rm.messages[rm.messages.length - 1];
    return `<a class="lrow" href="${F.url('reader/room.html?id=' + rm.id)}"><span class="av md room-av">${I('users')}</span><div class="t"><b><span class="ellipsis">${esc(ss.t)}</span></b><div class="pv">${esc(F.person(last.by).short || F.person(last.by).name)}: ${esc(preview(last))}</div><small class="ellipsis">${liveTag(ss)}<span style="margin-left:4px">Trưởng phòng: ${esc(e.name)}</span></small></div><div class="rt"><span>${F.short(last.at)}</span>${F.isMuted(rm) ? I('bellOff', 'i-xs') : ''}</div></a>`; };
  const liveTag = (ss) => { const st = new Date(ss.at).getTime(); const end = st + ss.len * MIN; return Date.now() >= st && Date.now() <= end ? '<span class="tag bad"><span class="d"></span>Đang diễn ra</span>' : Date.now() < st ? `<span class="tag info">${F.date(ss.at)}</span>` : '<span class="tag">Đã kết thúc</span>'; };
  pages.inquiries = () => {
    const v = F.shell({ tab: 'chat', bar: 'root', rootTitle: '' }); const me = F.me();
    v.innerHTML = `<h1 class="large-title">Phản biện</h1><div id="iv"></div>`;
    if (!me) { $('#iv').innerHTML = F.gate('chat', 'Trao đổi học thuật 1:1 kín', 'Bôi đen đoạn văn hoặc số liệu trong bài nghiên cứu để gửi câu hỏi phản biện riêng tới chuyên gia tác giả. Không công khai trên mạng xã hội.'); return; }
    let f = F.param('f') || 'open'; let term = '';
    $('#iv').innerHTML = `<div class="page"><div class="search-field">${I('search', 'i-sm')}<input type="search" id="iq" placeholder="Tìm theo chuyên gia, bài nghiên cứu, nội dung…" aria-label="Tìm phản biện" autocomplete="off"></div><div class="panel mt-12">${F.quotaBar()}</div><div id="rmBox"></div>
      <div class="seg full mt-16" id="seg"></div></div><div class="chat-list mt-8" id="cl"></div>
      <div class="page mt-16"><div class="note">${I('lock')}<span>Phiên 1:1 riêng tư giữa bạn và chuyên gia. Chạm vào tin nhắn để trả lời, sao chép, phản hồi hoặc báo cáo. Mỗi phiên có <b>Báo cáo vi phạm</b> và <b>Chặn</b>.</span></div></div>`;
    const rms = myRooms();
    $('#rmBox').innerHTML = F.session().phase2 ? (rms.length ? `<div class="group-title mt-16">Phòng trao đổi kín</div><div class="chat-list card-list">${rms.map(roomRow).join('')}</div>` : `<a class="note accent mt-12" href="${F.url('reader/sessions.html')}">${I('video')}<span class="grow"><b>Buổi trao đổi kín cùng chuyên gia</b><br>Đặc quyền Premium · mỗi buổi có phòng trao đổi riêng</span>${I('chevR', 'i-sm')}</a>`) : '';
    const draw = () => {
      const all = F.db().inquiries.filter((q) => q.reader === me.id).sort((a, b) => new Date(b.messages[b.messages.length - 1].at) - new Date(a.messages[a.messages.length - 1].at));
      const match = (q) => { if (!term) return true; const e = F.expert(q.expert); const r = F.report(q.r); return [e.name, r ? r.title : '', q.quote, ...q.messages.filter((m) => !m.recalled).map((m) => m.x || '')].join(' ').toLowerCase().includes(term); };
      const isOpen = (q) => ['new', 'assigned', 'in_progress', 'answered'].includes(q.status);
      const open = all.filter((q) => isOpen(q) && match(q)); const done = all.filter((q) => !isOpen(q) && match(q));
      const list = f === 'open' ? open : done;
      $('#seg').innerHTML = `<button class="${f === 'open' ? 'on' : ''}" data-f="open">Đang mở · ${open.length}</button><button class="${f === 'done' ? 'on' : ''}" data-f="done">Đã đóng · ${done.length}</button>`;
      $$('#seg [data-f]').forEach((b) => (b.onclick = () => { f = b.dataset.f; draw(); }));
      $('#cl').innerHTML = list.length ? list.map((q) => inqRow(q, term)).join('') : term ? F.empty('search', 'Không tìm thấy', 'Không có phiên nào khớp “' + esc(term) + '”.') : F.empty('chat', f === 'open' ? 'Chưa có phiên đang mở' : 'Chưa có phiên đã đóng', 'Mở một bài nghiên cứu, bôi đen đoạn cần hỏi và chọn “Trích dẫn & phản biện”.', `<a class="btn btn-primary" href="${F.url('reader/index.html')}">Đọc bài nghiên cứu</a>`);
    };
    $('#iq').oninput = () => { term = $('#iq').value.trim().toLowerCase(); draw(); };
    draw();
  };

  /* ================= P04 · Buổi trao đổi kín (dùng dữ liệu chung + phòng) ================= */
  pages.sessions = () => {
    const me = F.me(); const s = F.session(); s.rsvp = s.rsvp || [];
    const v = F.shell({ side: 'chat', bar: 'back', back: 'reader/inquiries.html', title: '' });
    const all = F.db().sessions.slice().sort((a, b) => new Date(a.at) - new Date(b.at));
    const isEnd = (x) => Date.now() > new Date(x.at).getTime() + x.len * MIN;
    const up = all.filter((x) => !isEnd(x) && !x.cancelled); const past = [{ e: 'e5', at: new Date(Date.now() - 12 * 864e5).toISOString(), t: 'Lạm phát 2026: đọc cấu phần CPI' }, { e: 'e3', at: new Date(Date.now() - 40 * 864e5).toISOString(), t: 'Chi phí logistics và biên lợi nhuận doanh nghiệp' }];
    const prem = F.hasSub();
    v.innerHTML = `<div class="page" style="padding-bottom:24px">${s.phase2 ? '' : `<div class="note warn mb-16">${I('alert')}<span class="grow">Màn hình <b>Phase 2</b> (mô phỏng).</span><button class="btn btn-gray btn-xs" id="p2on">Bật</button></div>`}<div class="auth-hero" style="padding-top:0"><span class="tag prem">${I('crown', 'i-xs')}Đặc quyền Premium</span><h1 class="mt-12">Buổi trao đổi kín cùng chuyên gia</h1><p>Phiên video 60 phút, tối đa 20–25 hội viên, không ghi hình công khai. Mỗi buổi có một <b>phòng trao đổi kín</b> để gửi câu hỏi trước và nhận tài liệu sau buổi.</p></div>
      ${prem ? '' : `<div class="note accent mb-16">${I('lock')}<span class="grow">Dành cho hội viên Premium. <a class="link" href="${F.url('reader/pricing.html')}">Nâng cấp</a> để đăng ký tham gia.</span></div>`}
      <div class="group-title">Sắp diễn ra</div><div class="stack">${up.map((x) => { const e = F.expert(x.e); const d = new Date(x.at); const on = s.rsvp.includes(x.id); const st = d.getTime(); const live = Date.now() >= st - 10 * MIN && Date.now() <= st + x.len * MIN;
        return `<div class="session-card ${live ? 'live' : ''}"><div class="when"><div class="cal"><span>Th${d.getMonth() + 1}</span><b>${d.getDate()}</b></div><div class="grow"><div class="small muted">${live ? '<span class="tag bad"><span class="d"></span>Đang diễn ra</span> ' : ''}${d.toLocaleDateString('vi-VN', { weekday: 'long' })} · ${time(d)} – ${time(new Date(st + x.len * MIN))} · Video</div><h3 class="mt-4">${esc(x.t)}</h3></div></div>
          <div class="row">${F.avatar(e, 'sm')}<span class="small grow"><b>${esc(e.name)}</b> ${F.vb(e)}</span><span class="small faint">Còn ${Math.max(0, x.seats - x.taken - (on ? 1 : 0))}/${x.seats} chỗ</span></div>
          ${prem ? (on ? `<div class="row" style="gap:8px">${live ? `<a class="btn btn-primary grow" href="${F.url('reader/call.html?s=' + x.id)}">${I('video')}Tham gia ngay</a>` : ''}<a class="btn btn-gray grow" href="${F.url('reader/room.html?id=' + x.id)}">${I('users')}Phòng trao đổi</a><button class="btn btn-ghost btn-sm" data-rs="${x.id}">Hủy</button></div>` : `<button class="btn btn-primary btn-block" data-rs="${x.id}">Đăng ký tham gia</button>`) : `<a class="btn btn-gray btn-block" href="${F.url('reader/pricing.html')}">${I('lock')}Nâng cấp để đăng ký</a>`}</div>`; }).join('')}</div>
      <div class="group-title mt-24">Đã diễn ra</div><div class="group">${past.map((x) => { const e = F.expert(x.e); return `<button class="gi" data-past>${F.avatar(e, 'sm')}<span class="gl">${esc(x.t)}<small>${esc(e.name)} · ${F.date(x.at)}</small></span>${I('chevR', 'chev')}</button>`; }).join('')}</div>
      <p class="hint mt-16">Phòng trao đổi kín do Quản trị FBV tạo tự động cho mỗi buổi; chuyên gia là Trưởng phòng, điều phối viên FBV hỗ trợ. Phòng chuyển sang chỉ đọc 7 ngày sau buổi.</p></div>`;
    const p2 = $('#p2on'); if (p2) p2.onclick = () => { s.phase2 = true; F.save(); location.reload(); };
    $$('[data-rs]').forEach((b) => (b.onclick = () => { if (!me) { F.requireAuth(); return; } const id = b.dataset.rs; const i = s.rsvp.indexOf(id); const rm = (F.db().rooms || []).find((x) => x.session === id);
      if (i > -1) { s.rsvp.splice(i, 1); if (rm) rm.members = rm.members.filter((x) => x !== me.id); F.toast('Đã hủy đăng ký', 'info'); } else { s.rsvp.push(id); if (rm && !rm.members.includes(me.id)) rm.members.push(me.id); F.toast('Đã đăng ký · bạn đã được thêm vào phòng trao đổi kín'); } F.save(); pages.sessions(); }));
    $$('[data-past]').forEach((b) => (b.onclick = () => F.modal({ title: 'Tóm tắt buổi trao đổi', body: `<p class="muted">${prem ? 'Biên bản tóm tắt nội dung chính, câu hỏi của hội viên và tài liệu tham khảo do chuyên gia chia sẻ (mô phỏng).' : 'Tóm tắt các buổi đã diễn ra dành cho hội viên Premium.'}</p>`, actions: [{ label: 'Đóng', cls: 'btn-primary' }] })));
  };

  /* ================= P05 · Phòng trao đổi kín (C1) ================= */
  pages.room = () => {
    const me = F.me(); const D = F.db(); const rm = (D.rooms || []).find((x) => x.id === F.param('id')); const s = F.session();
    const v = F.shell({ side: 'chat', bar: 'back', back: 'reader/sessions.html', notab: true, title: 'Phòng trao đổi kín', right: `<button class="icon-btn" id="rmem" aria-label="Thành viên">${I('users')}</button><button class="icon-btn" id="more" aria-label="Tùy chọn">${I('more')}</button>` });
    if (!me) { v.innerHTML = F.gate('users', 'Phòng trao đổi kín', 'Đăng nhập bằng tài khoản Premium đã đăng ký buổi trao đổi để vào phòng.'); return; }
    if (!rm) { v.innerHTML = F.empty('users', 'Không tìm thấy phòng', 'Phòng không tồn tại hoặc đã bị Quản trị FBV đóng.'); return; }
    const ss = D.sessions.find((x) => x.id === rm.session); const owner = F.expert(rm.owner);
    const allowed = s.phase2 && F.hasSub() && ((s.rsvp || []).includes(ss.id) || rm.members.includes(me.id));
    if (!allowed) { $('#rmem').remove(); $('#more').remove(); v.innerHTML = `<div class="page">${F.empty('lock', 'Phòng dành cho hội viên đã đăng ký', 'Phòng trao đổi kín chỉ gồm chuyên gia, điều phối viên FBV và hội viên Premium đã đăng ký buổi “' + esc(ss.t) + '”.', `<a class="btn btn-primary btn-pill" href="${F.url(F.hasSub() ? 'reader/sessions.html' : 'reader/pricing.html')}">${F.hasSub() ? 'Đăng ký buổi trao đổi' : 'Nâng cấp Premium'}</a>`)}</div>`; return; }
    if (!rm.members.includes(me.id)) { rm.members.push(me.id); F.save(); }
    const st = new Date(ss.at).getTime(); const end = st + ss.len * MIN; const live = Date.now() >= st - 10 * MIN && Date.now() <= end; const ro = Date.now() > end + 7 * 864e5;
    const seen0 = (rm.seen || {})[me.id] != null ? rm.seen[me.id] : rm.messages.length; const newCount = rm.messages.slice(seen0).filter((m) => m.by !== me.id).length;
    rm.seen = rm.seen || {}; rm.seen[me.id] = rm.messages.length; F.save();
    const roleOf = (id) => (id === rm.owner ? '<span class="role-b own">Trưởng phòng</span>' : id === rm.mod ? '<span class="role-b mod">Điều phối FBV</span>' : F.staff(id) ? '<span class="role-b mod">FBV</span>' : '');
    $('#abTitle').innerHTML = `<span class="ab2"><b class="ellipsis">${esc(ss.t)}</b><small>${rm.members.length} thành viên${F.isMuted(rm) ? ' · đã tắt thông báo' : ''}</small></span>`;
    v.innerHTML = `<div class="srch-bar" id="sb" hidden></div><div class="page"><div class="room-pin"><div class="row"><div class="cal"><span>Th${new Date(st).getMonth() + 1}</span><b>${new Date(st).getDate()}</b></div><div class="grow"><div class="small muted">${liveTag(ss)} ${time(ss.at)} – ${time(new Date(end))} · Video · ${F.avatar(owner, 'xs')} ${esc(owner.name)}</div></div></div>
      <p class="small mt-8">${I('pin', 'i-xs')} ${esc(rm.pinned)}</p>${live ? `<a class="btn btn-primary btn-block mt-12" href="${F.url('reader/call.html?s=' + ss.id)}">${I('video')}Tham gia buổi gọi video</a>` : ''}</div></div>
      <div class="thread" id="th"></div><div id="cmp"></div><button type="button" class="jump-new" id="jn" hidden>${I('arrowDown', 'i-sm')}<span></span></button>`;
    let comp = null;
    const muted = (rm.muted || []).includes(me.id);
    const ctx = { msgs: rm.messages, meId: me.id, term: '', seen: newCount ? seen0 : null, showName: true, roleOf, canWrite: !ro && !muted, searchPh: 'Tìm trong phòng',
      canBlock: (id) => !F.staff(id) && id !== rm.owner, onBlockUser: (id) => F.confirm('Chặn ' + F.person(id).name + '?', 'Bạn sẽ không thấy tin nhắn của thành viên này trong phòng. Có thể bỏ chặn trong Cài đặt → Quyền riêng tư.', 'Chặn', 'btn-danger', () => { if (!me.blocked.includes(id)) me.blocked.push(id); F.save(); draw(); F.toast('Đã chặn thành viên', 'info'); }),
      onReply: (i) => comp && comp.setReply(i), onReport: (m) => reportMsg('room', rm.id, m),
      onSend: (m) => { rm.messages.push(m); rm.seen[me.id] = rm.messages.length; F.save(); ctx.seen = null; draw(); window.scrollTo(0, document.body.scrollHeight); },
      redraw: (keep) => draw(keep) };
    const draw = (keep) => { const y = window.scrollY; const th = $('#th'); th.innerHTML = threadHtml(msgItems(rm.messages, me.id, null, me.blocked), ctx); bindThread(th, ctx); if (keep) window.scrollTo(0, y); };
    $('#cmp').innerHTML = ro ? `<div class="composer-closed">Phòng đã chuyển sang chỉ đọc (7 ngày sau buổi trao đổi).</div>` : muted ? `<div class="composer-closed">${I('micOff', 'i-xs')} Điều phối viên đã tạm tắt quyền gửi tin của bạn trong phòng này. Liên hệ Hỗ trợ nếu cần.</div>` : composerHtml('Trao đổi trong phòng…');
    comp = ro || muted ? null : bindComposer(ctx); dock(); draw();
    const sep = $('#newSep'); if (sep) sep.scrollIntoView({ block: 'center' }); else window.scrollTo(0, document.body.scrollHeight);
    const jn = $('#jn'); $('span', jn).textContent = newCount ? newCount + ' tin nhắn mới' : 'Xuống cuối';
    const onScroll = () => { jn.hidden = document.body.scrollHeight - (window.scrollY + window.innerHeight) <= 260; };
    window.addEventListener('scroll', onScroll, { passive: true }); setTimeout(onScroll, 50);
    jn.onclick = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    const members = () => F.modal({ title: 'Thành viên · ' + rm.members.length, body: `<div class="group">${rm.members.map((id) => { const p = F.person(id); return `<div class="gi">${F.avatar(p, 'sm')}<span class="gl">${esc(p.name)}${id === me.id ? ' (bạn)' : ''}<small>${id === rm.owner ? 'Chuyên gia chủ trì' : id === rm.mod ? 'Điều phối viên FBV' : 'Hội viên Premium'}</small></span>${roleOf(id)}</div>`; }).join('')}</div><p class="hint mt-8">Phòng do Quản trị FBV tạo tự động cho buổi trao đổi. Chỉ Quản trị thêm/bớt thành viên; hội viên được thêm khi đăng ký buổi.</p>` });
    $('#rmem').onclick = members;
    $('#more').onclick = () => F.menu([
      { icon: 'users', label: 'Thành viên', onClick: members },
      { icon: 'search', label: 'Tìm trong phòng', onClick: () => searchBar(ctx) },
      { icon: 'layers', label: 'Ảnh, file & liên kết', onClick: () => mediaSheet(rm.messages, me.id, [], 'Tài liệu trong phòng') },
      { icon: F.isMuted(rm) ? 'bell' : 'bellOff', label: F.isMuted(rm) ? 'Bật lại thông báo' : 'Tắt thông báo phòng', onClick: () => muteSheet(rm, () => location.reload()) },
      { icon: 'logout', label: 'Rời phòng (hủy đăng ký buổi)', danger: true, onClick: () => F.confirm('Rời phòng?', 'Bạn sẽ hủy đăng ký buổi trao đổi và không nhận tin nhắn trong phòng nữa.', 'Rời phòng', 'btn-danger', () => { rm.members = rm.members.filter((x) => x !== me.id); s.rsvp = (s.rsvp || []).filter((x) => x !== ss.id); F.save(); F.go('reader/sessions.html'); }) },
      { icon: 'flag', label: 'Báo cáo phòng', danger: true, onClick: () => F.reportSheet({ type: 'room', ref: rm.id, target: rm.owner, what: 'Phòng “' + ss.t + '”' }) }
    ], 'Phòng trao đổi kín');
  };

  /* ================= P06 · Cuộc gọi theo lịch hẹn (B1) ================= */
  pages.call = () => {
    document.body.classList.add('rd', 'no-tab', 'call-body');
    const app = document.getElementById('app'); const me = F.me(); const D = F.db();
    const back = (p) => F.go(p);
    let title, sub, peers, kind = 'video', st, len, onEnd, backUrl, host, modMuted = false, callRef = null;
    const sid = F.param('s'); const q = F.inquiry(F.param('q'));
    if (!me) { app.className = 'call-screen'; app.innerHTML = `<div class="call-lobby">${F.gate('video', 'Đăng nhập để tham gia', 'Cuộc gọi chỉ dành cho thành viên đã đặt lịch.')}</div>`; return; }
    if (sid) {
      const ss = D.sessions.find((x) => x.id === sid); const rm = D.rooms.find((x) => x.session === sid);
      if (!ss || !F.hasSub() || !(F.session().rsvp || []).includes(sid)) { app.className = 'call-screen'; app.innerHTML = `<div class="call-lobby">${F.empty('lock', 'Không thể tham gia', 'Buổi trao đổi chỉ dành cho hội viên Premium đã đăng ký.', `<a class="btn btn-primary" href="${F.url('reader/sessions.html')}">Xem buổi trao đổi</a>`)}</div>`; return; }
      modMuted = !!(rm && (rm.muted || []).includes(me.id)); callRef = { type: 'call', ref: sid, target: ss.e, what: 'Buổi trao đổi “' + ss.t + '”' };
      host = F.expert(ss.e); title = ss.t; sub = 'Buổi trao đổi kín · ' + (rm ? rm.members.length : ss.taken) + ' thành viên'; st = new Date(ss.at).getTime(); len = ss.len;
      peers = (rm ? rm.members : [ss.e]).filter((x) => x !== me.id).slice(0, 7).map(F.person); backUrl = 'reader/room.html?id=' + (rm ? rm.id : sid);
      onEnd = () => { F.toast('Đã rời buổi trao đổi'); setTimeout(() => back(backUrl), 400); };
    } else if (q && (q.reader === me.id || (me.expertId && q.expert === me.expertId))) {
      const asExp = q.reader !== me.id;
      const c = (q.calls || []).find((x) => x.id === F.param('c')); if (!c) { F.go('reader/inquiry.html?id=' + q.id); return; }
      host = F.expert(q.expert); kind = c.kind; title = (kind === 'video' ? 'Gọi video' : 'Gọi thoại') + ' với ' + (asExp ? F.user(q.reader).name : host.name); sub = 'Phản biện 1:1 · ' + (c.note || 'Theo lịch hẹn'); st = new Date(c.at).getTime(); len = c.len || 30;
      callRef = { type: 'call', ref: q.id, target: asExp ? q.reader : q.expert, what: 'Cuộc gọi 1:1 trong phiên #' + q.id.toUpperCase(), block: asExp ? '' : 'Chặn chuyên gia này' };
      peers = [asExp ? F.user(q.reader) : host]; backUrl = asExp ? 'reader/workspace.html?t=expert' : 'reader/inquiry.html?id=' + q.id;
      if (asExp && c.confirmed === false) { app.className = 'call-screen'; app.innerHTML = `<div class="call-lobby">${F.empty('calendar', 'Lịch chưa được xác nhận', 'Hãy xác nhận lịch gọi trước khi tham gia.', `<a class="btn btn-primary" href="${F.url(backUrl)}">Về Không gian làm việc</a>`)}</div>`; return; }
      onEnd = (sec) => { c.status = 'done'; c.dur = Math.max(1, sec); F.save(); F.toast('Cuộc gọi đã kết thúc · ' + dur(c.dur)); setTimeout(() => back(backUrl), 500); };
    } else { F.go('reader/inquiries.html'); return; }
    const open = Date.now() >= st - 10 * MIN && Date.now() <= st + len * MIN;
    let mic = true, cam = kind === 'video', hand = false, t0 = 0, timer = null;
    app.className = 'call-screen';
    const lobby = () => {
      app.innerHTML = `<div class="call-top"><button class="icon-btn" id="cb" aria-label="Quay lại">${I('chevL')}</button><div class="grow"><b class="ellipsis">${esc(title)}</b><small>${esc(sub)}</small></div></div>
        <div class="call-lobby"><div class="tile me big ${cam ? 'cam' : ''}">${cam ? `<span class="cam-ph">${I('user')}</span>` : F.avatar(me, 'xl')}<span class="nm">Bạn${mic ? '' : ' · tắt mic'}</span></div>
          <div class="call-ctl"><button type="button" class="${mic ? '' : 'off'}" id="lm" aria-label="Micro">${I(mic ? 'mic' : 'micOff')}</button>${kind === 'video' ? `<button type="button" class="${cam ? '' : 'off'}" id="lc" aria-label="Camera">${I(cam ? 'video' : 'videoOff')}</button>` : ''}</div>
          <div class="call-when">${I('calendar', 'i-xs')} ${whenLabel(new Date(st).toISOString())} · ${len} phút</div>
          <button class="btn btn-primary btn-pill" id="join" ${open ? '' : 'disabled'} style="min-width:220px">${open ? 'Tham gia' : 'Mở lúc ' + time(new Date(st - 10 * MIN).toISOString())}</button>
          <p class="hint center" style="max-width:360px">${I('lock', 'i-xs')} Chỉ mở trong khung giờ đã hẹn · Không ghi âm, ghi hình · Không khuyến nghị mua/bán tài sản tài chính.</p></div>`;
      $('#cb').onclick = () => back(backUrl);
      $('#lm').onclick = () => { mic = !mic; lobby(); }; const lc = $('#lc'); if (lc) lc.onclick = () => { cam = !cam; lobby(); };
      $('#join').onclick = () => { if (!open) return; const go = () => { t0 = Date.now(); inCall(); timer = setInterval(tick, 1000); };
        F.sysPermission('mic', (okM) => { if (!okM) { mic = false; F.toast('Chưa có quyền micrô · bạn tham gia ở chế độ chỉ nghe', 'info'); } if (kind === 'video') F.sysPermission('cam', (okC) => { if (!okC) cam = false; go(); }); else go(); }); };
    };
    const tick = () => { const el = $('#ct'); if (!el) return; const s = Math.floor((Date.now() - t0) / 1000); el.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
    const inCall = () => {
      if (modMuted) mic = false;
      const tiles = peers.map((p, k) => `<div class="tile ${k === 0 ? 'speak' : ''} ${kind === 'video' && k % 3 !== 2 ? 'cam' : ''}">${kind === 'video' && k % 3 !== 2 ? `<span class="cam-ph">${F.avatar(p, 'lg')}</span>` : F.avatar(p, 'lg')}<span class="nm">${esc(p.short || p.name)}${p.id === host.id ? ' · Chủ trì' : ''}</span></div>`).join('');
      app.innerHTML = `<div class="call-top"><span class="rec-off">${I('lock', 'i-xs')}Không ghi âm</span><div class="grow center"><b class="ellipsis">${esc(title)}</b><small id="ct">00:00</small></div><span style="width:40px"></span></div>
        <div class="tiles n${Math.min(peers.length + 1, 8)}">${tiles}<div class="tile me ${cam ? 'cam' : ''}">${cam ? `<span class="cam-ph">${I('user')}</span>` : F.avatar(me, 'lg')}<span class="nm">Bạn${mic ? '' : ` ${I('micOff', 'i-xs')}`}${hand ? ' ✋' : ''}</span></div></div>
        <div class="call-ctl bottom"><button type="button" class="${mic ? '' : 'off'}" id="cm" aria-label="Micro">${I(mic ? 'mic' : 'micOff')}</button>${kind === 'video' ? `<button type="button" class="${cam ? '' : 'off'}" id="cc" aria-label="Camera">${I(cam ? 'video' : 'videoOff')}</button>` : `<button type="button" id="spk" aria-label="Loa">${I('volume')}</button>`}${sid ? `<button type="button" class="${hand ? 'on' : ''}" id="hd" aria-label="Giơ tay">${I('hand')}</button><a href="${F.url(backUrl)}" aria-label="Mở phòng trao đổi" id="ch">${I('chat')}</a>` : ''}<button type="button" id="crp" aria-label="Báo cáo vi phạm">${I('flag')}</button><button type="button" class="end" id="end" aria-label="Kết thúc">${I('phoneOff')}</button></div>${modMuted ? `<div class="call-banner">${I('micOff', 'i-xs')}Điều phối viên đã tắt micrô của bạn</div>` : ''}`;
      tick();
      $('#cm').onclick = () => { if (modMuted) { F.toast('Điều phối viên đã tắt micrô của bạn', 'info'); return; } if (!mic && F.perm('mic') === 'denied') { F.toast('Chưa có quyền micrô · bật trong Cài đặt iOS', 'error'); return; } mic = !mic; inCall(); };
      $('#crp').onclick = () => F.reportSheet(Object.assign({ title: 'Báo cáo trong cuộc gọi' }, callRef)); const cc = $('#cc'); if (cc) cc.onclick = () => { cam = !cam; inCall(); };
      const spk = $('#spk'); if (spk) spk.onclick = () => F.toast('Đã chuyển sang loa ngoài', 'info');
      const hd = $('#hd'); if (hd) hd.onclick = () => { hand = !hand; inCall(); if (hand) F.toast('Bạn đã giơ tay · điều phối viên sẽ mời bạn phát biểu', 'info'); };
      $('#end').onclick = () => { clearInterval(timer); onEnd(Math.floor((Date.now() - t0) / 1000)); };
    };
    document.title = title + ' · FBV';
    lobby();
  };


  /* ================= X1 · Chuyên gia xác nhận / đổi giờ / từ chối lịch gọi ================= */
  const notifyReader = (q, text) => { F.db().notifications.unshift({ id: F.uid('n'), user: q.reader, type: 'answer', ref: q.id, text, at: now(), read: false }); q.readerUnread = true; };
  F.callDecide = (q, c, act, after) => {
    const e = F.expert(q.expert); const kl = c.kind === 'video' ? 'gọi video' : 'gọi thoại';
    if (act === 'confirm') { c.confirmed = true; c.proposed = null; notifyReader(q, `${e.name} đã xác nhận lịch ${kl} lúc ${whenLabel(c.at)}.`); F.save(); F.toast('Đã xác nhận lịch gọi · độc giả đã được thông báo'); after && after(); return; }
    if (act === 'propose') {
      F.modal({ title: 'Đề xuất giờ khác', body: `<div class="stack"><div class="group">${slots().map((s, i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${s.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}<small>${time(s)}</small></span><input type="radio" name="ps" value="${s.toISOString()}" ${i ? '' : 'checked'}></label>`).join('')}</div><div class="field"><label for="pr">Lời nhắn cho độc giả (không bắt buộc)</label><input class="input" id="pr" maxlength="160" placeholder="VD: Tối thứ Năm tôi có lịch hội thảo…"></div></div>`,
        actions: [{ label: 'Hủy' }, { label: 'Gửi đề xuất', cls: 'btn-primary', onClick: (cl, el) => { c.proposed = $('input[name=ps]:checked', el).value; c.reason = $('#pr', el).value.trim(); c.confirmed = false; notifyReader(q, `${e.name} đề xuất đổi lịch ${kl} sang ${whenLabel(c.proposed)}.`); F.save(); F.toast('Đã gửi đề xuất giờ mới'); after && after(); } }] });
      return;
    }
    if (act === 'decline') {
      F.modal({ title: 'Từ chối lịch gọi', body: `<div class="group">${['Không phù hợp lịch làm việc', 'Câu hỏi nên trao đổi bằng văn bản', 'Nội dung ngoài phạm vi chuyên môn', 'Lý do khác'].map((x, i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${x}</span><input type="radio" name="dr" value="${x}" ${i ? '' : 'checked'}></label>`).join('')}</div><p class="hint mt-8">Độc giả nhận thông báo kèm lý do và không bị trừ lượt.</p>`,
        actions: [{ label: 'Hủy' }, { label: 'Từ chối', cls: 'btn-danger', onClick: (cl, el) => { c.status = 'declined'; c.reason = $('input[name=dr]:checked', el).value; notifyReader(q, `${e.name} chưa nhận lịch ${kl} (${whenLabel(c.at)}): ${c.reason}.`); F.save(); F.toast('Đã từ chối lịch gọi', 'info'); after && after(); } }] });
    }
  };
  F.callStatusTag = (c) => (c.status === 'declined' ? '<span class="tag bad">Đã từ chối</span>' : c.status === 'done' ? '<span class="tag">Đã gọi</span>' : c.status === 'missed' ? '<span class="tag bad">Đã lỡ</span>' : c.status === 'cancelled' ? '<span class="tag">Độc giả hủy</span>' : c.proposed ? '<span class="tag info">Chờ độc giả đồng ý giờ mới</span>' : c.confirmed === false ? '<span class="tag warn">Chờ xác nhận</span>' : '<span class="tag ok">Đã xác nhận</span>');
  F.expertCalls = (eid) => { const out = []; F.db().inquiries.filter((q) => q.expert === eid).forEach((q) => (q.calls || []).forEach((c) => { const end = new Date(c.at).getTime() + (c.len || 30) * MIN; if (c.status === 'scheduled' && Date.now() > end) c.status = 'missed'; out.push({ q, c }); })); return out.sort((a, b) => new Date(a.c.at) - new Date(b.c.at)); };
  F.callActionsHtml = (q, c, link) => { const st = new Date(c.at).getTime(); const open = Date.now() >= st - 10 * MIN && Date.now() <= st + (c.len || 30) * MIN;
    if (c.status !== 'scheduled') return '';
    if (c.confirmed === false && !c.proposed) return `<button class="btn btn-primary btn-xs" data-cact="confirm" data-q="${q.id}" data-c="${c.id}">Xác nhận</button><button class="btn btn-gray btn-xs" data-cact="propose" data-q="${q.id}" data-c="${c.id}">Đổi giờ</button><button class="btn btn-gray btn-xs" data-cact="decline" data-q="${q.id}" data-c="${c.id}">Từ chối</button>`;
    if (c.proposed) return '';
    return open && link ? `<a class="btn btn-primary btn-xs" href="${F.url('reader/call.html?q=' + q.id + '&c=' + c.id)}">Tham gia</a>` : `<button class="btn btn-gray btn-xs" data-cact="propose" data-q="${q.id}" data-c="${c.id}">Đổi giờ</button>`; };
  F.bindCallActions = (root, after) => $$('[data-cact]', root).forEach((b) => (b.onclick = (ev) => { ev.preventDefault(); const q = F.inquiry(b.dataset.q); const c = q.calls.find((x) => x.id === b.dataset.c); F.callDecide(q, c, b.dataset.cact, after); }));
  F.expertCallsSection = (ex) => {
    const all = F.expertCalls(ex.id); const up = all.filter((x) => x.c.status === 'scheduled'); const pend = up.filter((x) => x.c.confirmed === false && !x.c.proposed).length;
    if (!all.length) return '';
    return `<div class="sec" style="padding-left:0;padding-right:0"><h2>Lịch gọi 1:1 ${pend ? `<span class="tag warn" style="vertical-align:middle">${pend} chờ xác nhận</span>` : ''}</h2></div>
      <div class="group">${(up.length ? up : all.slice(-2)).map(({ q, c }) => { const u = F.user(q.reader); return `<div class="gi call-row">${F.avatar(u, 'sm')}<span class="gl" style="font-weight:600">${esc(u.name)}<small>${I(c.kind === 'video' ? 'video' : 'phoneCall', 'i-xs')} ${whenLabel(c.proposed || c.at)} · ${c.len || 30} phút${c.note ? ' · ' + esc(c.note) : ''}</small><span class="row wrap mt-4" style="gap:6px">${F.callStatusTag(c)}${F.callActionsHtml(q, c, true)}</span></span></div>`; }).join('')}</div>
      <p class="hint mt-8">Độc giả Premium đặt lịch theo khung giờ bạn công bố. Xác nhận trong 24 giờ; đổi giờ cần độc giả đồng ý.</p>`;
  };

  /* ---------------- CMS: hiển thị tin nhắn (thu hồi · trả lời · tệp) ---------------- */
  F.cmsMsgBody = (m, q, role) => {
    const t = m.re != null ? q.messages[m.re] : null;
    const rq = t ? `<div class="rq"><b>${esc(F.person(t.by).name)}</b><span>${esc(preview(t)).slice(0, 120)}</span></div>` : '';
    const files = (m.files || []).map((f, k) => F.attHtml(f, q.messages.indexOf(m), k)).join('');
    if (m.recalled) return role === 'expert' ? '<i class="muted">Tin nhắn đã được thu hồi</i>' : `<span class="badge warn">Đã thu hồi ${m.recalledAt ? F.ago(m.recalledAt) : ''}</span> <span class="muted">Nội dung gốc (chỉ Quản trị/Biên tập xem):</span><br>${esc(m.x)}`;
    const rx = Object.values(m.rx || {}); const rxs = rx.length ? `<div class="small faint mt-4">${RX.filter((r) => rx.includes(r[0])).map((r) => r[1] + ' ' + r[2]).join(' · ')}</div>` : '';
    return rq + esc(m.x || '') + (files ? `<div class="atts">${files}</div>` : '') + rxs;
  };
  F.bindAtts = bindAtts;
  F._chat = { composerHtml, bindComposer, fmtText, dock, mediaSheet, dayLabel, time, imgPh, openAtt };
})();
