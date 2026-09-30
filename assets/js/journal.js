/* =========================================================
   FBV v3.2 — F1 NHẬT KÝ NGHIÊN CỨU (tham khảo "Nhật ký làm việc" của FBV.ONE)
   Ghi chú · trích dẫn · tệp · ảnh · liên kết — gắn bài nghiên cứu / chỉ số, tìm kiếm, đồng bộ nhiều thiết bị
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = F.$, $$ = F.$$; const I = F.icon; const esc = F.esc;
  const C = () => F._chat;
  const KIND = [['all', 'Tất cả'], ['pin', 'Đã ghim'], ['quote', 'Trích dẫn'], ['file', 'Tệp'], ['image', 'Ảnh'], ['link', 'Liên kết']];
  const has = (n, k) => (k === 'all' ? true : k === 'pin' ? !!n.pinned : k === 'quote' ? !!n.quote : k === 'link' ? /https?:\/\//.test(n.x || '') : (n.files || []).some((f) => f.kind === k));
  const refChips = (n) => { const r = n.r ? F.report(n.r) : null; const ind = n.ind ? F.ind(n.ind) : null;
    return (r ? `<a class="jn-ref" href="${F.url('reader/report.html?id=' + r.id)}">${I('file', 'i-xs')}<span class="ellipsis">${esc(r.title)}</span></a>` : '') + (ind ? `<a class="jn-ref" href="${F.url('reader/indicator.html?id=' + ind.id)}">${I('chart', 'i-xs')}<span>${esc(ind.name)} · <b class="num">${F.fmtVal(ind)}</b></span></a>` : ''); };

  /* Xem nhanh trong Không gian làm việc */
  F.journalPreview = (list) => (list.length ? `<div class="stack">${list.map((n) => `<a class="panel ws-note jn-mini" href="${F.url('reader/journal.html#j-' + n.id)}">${n.quote ? `<div class="quote-card" style="background:var(--bg-elev-2)">“${esc(n.quote)}”</div>` : ''}${n.x ? `<p class="clamp2 ${n.quote ? 'mt-8' : ''}">${esc(n.x)}</p>` : ''}${(n.files || []).length ? `<div class="small muted mt-4">${I('paperclip', 'i-xs')} ${(n.files || []).map((f) => esc(f.name)).join(', ')}</div>` : ''}<div class="row between mt-8 small faint"><span class="ellipsis">${n.r && F.report(n.r) ? esc(F.report(n.r).title) : n.ind && F.ind(n.ind) ? esc(F.ind(n.ind).name) : 'Ghi chú tự do'}</span><span style="flex:none">${F.ago(n.at)}</span></div></a>`).join('')}</div>`
    : `<div class="panel muted small">Bôi đen một đoạn trong bài nghiên cứu và chọn “Ghi chú”, hoặc mở Nhật ký để lưu ý tưởng, tệp và ảnh.</div>`);

  /* ================= W03 · Nhật ký nghiên cứu ================= */
  pages.journal = () => {
    const me = F.me();
    const v = F.shell({ tab: 'workspace', side: 'workspace', bar: 'back', back: 'reader/workspace.html', notab: true, title: 'Nhật ký nghiên cứu', right: `<button class="icon-btn" id="jm" aria-label="Kho tệp & liên kết">${I('layers')}</button>` });
    if (!me) { v.innerHTML = F.gate('stickyNote', 'Nhật ký nghiên cứu', 'Đăng nhập để lưu ghi chú, trích dẫn, tệp và ảnh — đồng bộ trên mọi thiết bị.'); $('#jm').remove(); return; }
    me.notes = me.notes || [];
    let f = 'all'; let term = ''; let link = null;
    v.innerHTML = `<div class="page"><div class="row between wrap" style="gap:8px;padding-top:8px"><span class="sync-pill">${I('cloud', 'i-xs')}Đã đồng bộ · điện thoại, máy tính bảng, web</span><span class="small faint" id="jc"></span></div>
      <div class="search-field mt-12">${I('search', 'i-sm')}<input type="search" id="jq" placeholder="Tìm trong nhật ký…" autocomplete="off" aria-label="Tìm trong nhật ký"></div>
      <div class="chips mt-12" id="jf"></div></div><div class="page jn-list" id="jl"></div><div id="cmp"></div>`;
    const notesAsc = () => me.notes.slice().sort((a, b) => new Date(a.at) - new Date(b.at));
    const draw = (scroll) => {
      const all = notesAsc();
      const list = all.filter((n) => has(n, f) && (!term || [n.x, n.quote, ...(n.files || []).map((x) => x.name), n.r && F.report(n.r) ? F.report(n.r).title : '', n.ind && F.ind(n.ind) ? F.ind(n.ind).name : ''].join(' ').toLowerCase().includes(term)));
      $('#jc').textContent = me.notes.length + ' mục';
      $('#jf').innerHTML = KIND.map((k) => `<button class="chip ${f === k[0] ? 'on' : ''}" data-f="${k[0]}">${k[1]}</button>`).join('');
      $$('#jf [data-f]').forEach((b) => (b.onclick = () => { f = b.dataset.f; draw(true); }));
      let day = ''; const idx = (n) => me.notes.indexOf(n);
      $('#jl').innerHTML = list.length ? list.map((n) => { const d = new Date(n.at).toDateString(); const sep = d !== day ? `<div class="day-sep"><span>${C().dayLabel(n.at)}</span></div>` : ''; day = d; const i = idx(n);
        return sep + `<article class="jn ${n.pinned ? 'pinned' : ''}" id="j-${n.id}"><div class="jn-h"><span class="small faint">${C().time(n.at)}</span>${n.pinned ? `<span class="tag accent">${I('pin', 'i-xs')}Đã ghim</span>` : ''}<span class="grow"></span><button type="button" class="icon-btn sm" data-jmore="${n.id}" aria-label="Tùy chọn">${I('more')}</button></div>
          ${n.quote ? `<div class="quote-card">“${C().fmtText(n.quote, term)}”</div>` : ''}${n.x ? `<p class="jn-x">${C().fmtText(n.x, term)}</p>` : ''}
          ${(n.files || []).length ? `<div class="atts mt-8">${n.files.map((x, k) => F.attHtml(x, i, k)).join('')}</div>` : ''}
          ${n.r || n.ind ? `<div class="jn-refs">${refChips(n)}</div>` : ''}</article>`; }).join('')
        : term || f !== 'all' ? F.empty('search', 'Không có mục phù hợp', 'Thử từ khóa hoặc bộ lọc khác.') : F.empty('stickyNote', 'Nhật ký trống', 'Ghi lại ý tưởng, số liệu cần kiểm chứng, tệp và ảnh. Mọi mục chỉ mình bạn xem.');
      F.bindAtts($('#jl'), me.notes);
      $$('[data-jmore]').forEach((b) => (b.onclick = () => entryMenu(me.notes.find((x) => x.id === b.dataset.jmore))));
      if (scroll) window.scrollTo(0, document.body.scrollHeight);
    };
    const entryMenu = (n) => F.menu([
      { icon: 'edit', label: 'Sửa nội dung', onClick: () => F.modal({ title: 'Sửa ghi chú', body: `<div class="field"><textarea class="textarea" id="ex" maxlength="2000">${esc(n.x || '')}</textarea></div>`, actions: [{ label: 'Hủy' }, { label: 'Lưu', cls: 'btn-primary', onClick: (c, el) => { n.x = $('#ex', el).value.trim(); n.edited = new Date().toISOString(); F.save(); draw(); F.toast('Đã lưu thay đổi'); } }] }) },
      { icon: 'pin', label: n.pinned ? 'Bỏ ghim' : 'Ghim mục này', onClick: () => { n.pinned = !n.pinned; F.save(); draw(); } },
      n.x ? { icon: 'copy', label: 'Sao chép', onClick: () => { try { navigator.clipboard.writeText(n.x); } catch (e) {} F.toast('Đã sao chép'); } } : null,
      { icon: 'trash', label: 'Xóa khỏi nhật ký', danger: true, onClick: () => F.confirm('Xóa mục này?', 'Mục sẽ bị xóa trên mọi thiết bị đã đồng bộ.', 'Xóa', 'btn-danger', () => { me.notes = me.notes.filter((x) => x !== n); F.save(); draw(); F.toast('Đã xóa', 'info'); }) }
    ].filter(Boolean), 'Mục nhật ký');
    // Ô soạn: dùng chung với chat (đính kèm tệp/ảnh) + gắn bài nghiên cứu / chỉ số
    $('#cmp').innerHTML = C().composerHtml('Ghi lại ý tưởng…');
    $('#att').insertAdjacentHTML('afterend', `<button type="button" class="c-att" id="jlink" aria-label="Gắn bài nghiên cứu hoặc chỉ số">${I('tag')}</button>`);
    $('#rbar').insertAdjacentHTML('beforebegin', `<div class="reply-bar" id="lbar" hidden></div>`);
    const drawLink = () => { const lb = $('#lbar'); if (!link) { lb.hidden = true; lb.innerHTML = ''; } else { lb.hidden = false; lb.innerHTML = `${I(link.r ? 'file' : 'chart', 'i-sm')}<div class="grow"><b>Gắn với ${link.r ? 'bài nghiên cứu' : 'chỉ số'}</b><span class="ellipsis">${esc(link.r ? F.report(link.r).title : F.ind(link.ind).name)}</span></div><button type="button" class="icon-btn sm" id="lbx" aria-label="Bỏ gắn">${I('x')}</button>`; $('#lbx').onclick = () => { link = null; drawLink(); }; } C().dock(); };
    $('#jlink').onclick = () => { let t = 'r';
      F.modal({ title: 'Gắn với…', body: `<div class="seg full" id="lt"></div><div class="search-field mt-12">${I('search', 'i-sm')}<input type="search" id="lq" placeholder="Tìm…" autocomplete="off"></div><div class="group mt-12" id="ll" style="max-height:46vh;overflow:auto"></div>`, onOpen: (el, close) => {
        const dl = () => { const q = ($('#lq', el).value || '').toLowerCase();
          $('#lt', el).innerHTML = `<button class="${t === 'r' ? 'on' : ''}" data-t="r">Bài nghiên cứu</button><button class="${t === 'i' ? 'on' : ''}" data-t="i">Chỉ số</button>`;
          $$('[data-t]', el).forEach((b) => (b.onclick = () => { t = b.dataset.t; dl(); }));
          const items = t === 'r' ? F.published().filter((r) => r.title.toLowerCase().includes(q)).slice(0, 12).map((r) => `<button class="gi" data-pk="r:${r.id}">${I('file')}<span class="gl" style="font-weight:500">${esc(r.title)}<small>${esc(F.expert(r.author).name)}</small></span></button>`) : F.db().indicators.filter((i) => i.name.toLowerCase().includes(q)).map((i) => `<button class="gi" data-pk="i:${i.id}">${I('chart')}<span class="gl" style="font-weight:500">${esc(i.name)}<small>${F.fmtVal(i)}</small></span></button>`);
          $('#ll', el).innerHTML = items.join('') || '<div class="gi noicon"><span class="gl muted">Không có kết quả</span></div>';
          $$('[data-pk]', el).forEach((b) => (b.onclick = () => { const [k, id] = b.dataset.pk.split(':'); link = k === 'r' ? { r: id } : { ind: id }; close(); drawLink(); }));
        };
        $('#lq', el).oninput = dl; dl(); } }); };
    C().bindComposer({ msgs: [], meId: me.id, onSend: (m) => { const n = { id: F.uid('nt'), x: m.x, at: m.at }; if (m.files) n.files = m.files; if (link) Object.assign(n, link); me.notes.push(n); F.save(); link = null; drawLink(); f = 'all'; draw(true); F.toast('Đã lưu vào nhật ký'); } });
    $('#jq').oninput = () => { term = $('#jq').value.trim().toLowerCase(); draw(); };
    $('#jm').onclick = () => C().mediaSheet(me.notes.map((n) => Object.assign({ by: me.id }, n)), me.id, [], 'Kho tệp & liên kết');
    draw();
    const h = location.hash && $(location.hash); if (h) { h.scrollIntoView({ block: 'center' }); h.classList.add('flash'); setTimeout(() => h.classList.remove('flash'), 1600); } else window.scrollTo(0, document.body.scrollHeight);
  };
})();
