/* =========================================================
   FBV v3.2 — G1 TRỢ LÝ NGHIÊN CỨU AI (Phase 2+ · Beta)
   Hỏi đáp chỉ dựa trên bài nghiên cứu đã được FBV thẩm định (RAG) · luôn trích nguồn · kèm miễn trừ
   Prototype: truy xuất theo từ khóa trên dữ liệu mẫu, câu trả lời mô phỏng.
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = F.$, $$ = F.$$; const I = F.icon; const esc = F.esc;
  const FREE_PER_DAY = 5;
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const STOP = new Set('la gi cua va cac nhung mot trong cho voi ve khi thi nay do sao the nao bao nhieu co khong duoc den tu theo nhu hay hoi bai nghien cuu toi em anh chi'.split(' '));
  const GLOSS = {
    nim: ['NIM (biên lãi ròng)', 'Chênh lệch giữa thu nhập lãi và chi phí lãi so với tổng tài sản sinh lãi bình quân của ngân hàng. NIM phản ánh khả năng sinh lời từ hoạt động tín dụng cốt lõi.'],
    casa: ['CASA', 'Tỷ lệ tiền gửi không kỳ hạn trên tổng tiền gửi. CASA cao giúp ngân hàng có nguồn vốn giá rẻ, từ đó cải thiện NIM.'],
    omo: ['OMO (nghiệp vụ thị trường mở)', 'Công cụ Ngân hàng Nhà nước dùng để mua/bán giấy tờ có giá ngắn hạn với các tổ chức tín dụng nhằm điều tiết thanh khoản hệ thống.'],
    dxy: ['DXY (chỉ số đô la Mỹ)', 'Chỉ số đo sức mạnh của USD so với rổ 6 đồng tiền chủ chốt (EUR, JPY, GBP, CAD, SEK, CHF).'],
    cpi: ['CPI (chỉ số giá tiêu dùng)', 'Chỉ số đo biến động giá của rổ hàng hóa, dịch vụ tiêu dùng tiêu biểu; dùng để tính lạm phát.'],
    fdi: ['FDI (đầu tư trực tiếp nước ngoài)', 'Vốn nhà đầu tư nước ngoài đưa vào để thành lập hoặc nắm quyền kiểm soát doanh nghiệp. Cần phân biệt vốn đăng ký và vốn giải ngân.'],
    iip: ['IIP (chỉ số sản xuất công nghiệp)', 'Chỉ số phản ánh biến động khối lượng sản xuất của ngành công nghiệp so với kỳ gốc.'],
    wacc: ['WACC (chi phí vốn bình quân gia quyền)', 'Chi phí bình quân của nợ vay (sau thuế) và vốn chủ sở hữu, gia quyền theo cơ cấu vốn. Dùng làm suất chiết khấu khi định giá.'],
    beta: ['Beta', 'Hệ số đo độ nhạy của lợi suất một cổ phiếu so với thị trường. Beta > 1 nghĩa là biến động mạnh hơn thị trường.'],
    'qua dem': ['Lãi suất qua đêm', 'Lãi suất cho vay kỳ hạn 1 ngày trên thị trường liên ngân hàng — thước đo nhanh nhất về thanh khoản hệ thống.'],
    vn30: ['VN30', 'Rổ 30 cổ phiếu vốn hóa và thanh khoản lớn nhất trên HOSE, dùng làm tài sản cơ sở của hợp đồng tương lai chỉ số.'],
    'khoi ngoai': ['Khối ngoại', 'Nhà đầu tư nước ngoài. “Mua/bán ròng” là chênh lệch giữa giá trị mua và bán của nhóm này trong phiên.']
  };
  const ADVICE = /(nen mua|nen ban|mua hay ban|co nen dau tu|khuyen nghi mua|khuyen nghi ban|co phieu nao|ma nao|diem mua|chot loi|cat lo|all in)/;
  const textOf = (r) => [r.title, r.dek, ...(r.summary || []), ...(r.tags || []), ...(r.body || []).filter((b) => b.t === 'p' || b.t === 'h').map((b) => b.x)].join(' ');
  const retrieve = (q, only) => {
    const toks = norm(q).split(/[^a-z0-9%]+/).filter((t) => t.length > 1 && !STOP.has(t));
    const pool = only ? [only] : F.published();
    return pool.map((r) => { const tx = norm(textOf(r)); const ti = norm(r.title + ' ' + (r.tags || []).join(' ')); let s = 0; toks.forEach((t) => { if (ti.includes(t)) s += 3; if (tx.includes(t)) s += 1; }); return { r, s }; }).filter((x) => x.s > 1).sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.r);
  };
  const answer = (q, ctxR) => {
    const n = norm(q);
    if (ADVICE.test(n)) return { refuse: true, html: `<p>Trợ lý nghiên cứu <b>không đưa ra khuyến nghị mua, bán hay nắm giữ</b> bất kỳ tài sản tài chính nào. Tôi có thể tóm tắt phân tích, giải thích số liệu và phương pháp trong các bài nghiên cứu đã được FBV thẩm định để bạn tự đánh giá.</p>`, src: retrieve(q, null).slice(0, 2) };
    const g = Object.keys(GLOSS).find((k) => n.includes(k));
    if (g && /(la gi|nghia la|giai thich|khai niem|dinh nghia)/.test(n)) { const src = retrieve(GLOSS[g][0] + ' ' + g, null).slice(0, 2); return { html: `<p><b>${GLOSS[g][0]}</b>: ${GLOSS[g][1]}</p>${src.length ? `<p>Khái niệm này được phân tích trong ${src.map((r, i) => `<a class="cite" href="${F.url('reader/report.html?id=' + r.id)}">[${i + 1}]</a>`).join(' ')}.</p>` : ''}`, src }; }
    const r0 = ctxR && /(tom tat|y chinh|noi dung chinh|ket luan|bai nay)/.test(n) ? ctxR : null;
    if (r0) return { html: `<p>Tóm tắt <b>${esc(r0.title)}</b> <a class="cite" href="${F.url('reader/report.html?id=' + r0.id)}">[1]</a>:</p><ul>${(r0.summary || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul><p class="small muted">Tác giả: ${esc(F.expert(r0.author).name)} · đã qua FBV Review.</p>`, src: [r0] };
    const src = retrieve(q, ctxR && /(bai nay|trong bai)/.test(n) ? ctxR : null);
    if (!src.length) return { none: true, html: `<p>Chưa có bài nghiên cứu đã thẩm định nào trên FBV đề cập rõ tới nội dung này, nên tôi không trả lời để tránh thông tin thiếu kiểm chứng.</p><p class="small muted">Bạn có thể tìm kiếm với từ khóa khác hoặc gửi câu hỏi phản biện tới chuyên gia trong bài nghiên cứu liên quan.</p>`, src: [] };
    return { html: `<p>Theo các bài nghiên cứu đã được FBV thẩm định:</p><ul>${src.map((r, i) => `<li>${esc((r.summary || [r.dek])[0])} <a class="cite" href="${F.url('reader/report.html?id=' + r.id)}">[${i + 1}]</a></li>`).join('')}</ul>${src[1] ? `<p>${esc((src[0].summary || [])[1] || '')} <a class="cite" href="${F.url('reader/report.html?id=' + src[0].id)}">[1]</a></p>` : ''}`, src };
  };

  /* ================= R15 · Trợ lý nghiên cứu ================= */
  pages.assistant = () => {
    const me = F.me(); const s = F.session(); const ctxR = F.report(F.param('r'));
    const v = F.shell({ side: 'assistant', bar: 'back', back: ctxR ? 'reader/report.html?id=' + ctxR.id : 'reader/workspace.html', notab: true, title: '', right: `<button class="icon-btn" id="anew" aria-label="Cuộc trò chuyện mới">${I('edit')}</button>` });
    $('#abTitle').innerHTML = `<span class="ab2"><b>Trợ lý nghiên cứu <span class="tag accent" style="font-size:10px;padding:1px 6px">Beta</span></b><small>Chỉ dựa trên bài đã thẩm định</small></span>`;
    if (!me) { v.innerHTML = F.gate('sparkles', 'Trợ lý nghiên cứu FBV', 'Đăng nhập để hỏi đáp, tóm tắt bài và giải thích thuật ngữ — mọi câu trả lời đều trích nguồn từ bài nghiên cứu đã được FBV thẩm định.'); $('#anew').remove(); return; }
    me.ai = me.ai || []; const today = new Date().toDateString();
    const used = () => me.ai.filter((m) => m.role === 'u' && new Date(m.at).toDateString() === today).length;
    const unlimited = () => F.hasSub();
    const sugg = ctxR ? ['Tóm tắt ý chính của bài này', 'Giải thích thuật ngữ ' + ((ctxR.tags || [])[0] || 'NIM') + ' là gì?', 'Bài này dùng dữ liệu và phương pháp nào?'] : ['Tóm tắt nghiên cứu về lãi suất và thanh khoản', 'NIM là gì?', 'Áp lực tỷ giá USD/VND đến từ đâu?', 'Lạm phát 2026 chịu ảnh hưởng bởi yếu tố nào?'];
    v.innerHTML = `${s.phase2 ? '' : `<div class="page"><div class="note warn mt-8">${I('alert')}<span>Tính năng <b>Phase 2+ · Beta</b> (mô phỏng). Câu trả lời được tạo từ dữ liệu mẫu.</span></div></div>`}
      ${ctxR ? `<div class="page"><a class="ctx-card mt-8" href="${F.url('reader/report.html?id=' + ctxR.id)}">${I('file', 'i-sm')}<span class="grow"><small>Đang hỏi về bài nghiên cứu</small><b class="ellipsis">${esc(ctxR.title)}</b></span></a></div>` : ''}
      <div class="thread ai-thread" id="th"></div><div id="cmp"></div>`;
    const draw = () => {
      const th = $('#th');
      if (!me.ai.length) { th.innerHTML = `<div class="ai-hero">${F.logoMark('logo-mark')}<h2 class="serif">Hỏi về nghiên cứu của FBV</h2><p class="muted">Tóm tắt bài, giải thích thuật ngữ, tìm luận điểm — mọi câu trả lời đều kèm nguồn là bài nghiên cứu đã được chuyên gia viết và FBV Review thẩm định.</p><div class="ai-sugg">${sugg.map((x) => `<button type="button" class="chip" data-sg="${esc(x)}">${esc(x)}</button>`).join('')}</div><div class="note mt-16" style="text-align:left">${I('shield')}<span>Trợ lý không đưa ra khuyến nghị mua/bán, không truy cập dữ liệu cá nhân của bạn và không dùng nội dung phản biện riêng tư.</span></div></div>`; }
      else th.innerHTML = me.ai.map((m, i) => m.role === 'u' ? `<div class="msg me"><div class="mc"><div class="bub" style="cursor:default">${esc(m.x)}</div></div></div>`
        : `<div class="ai-msg" id="a${i}">${F.logoMark('logo-mark sm')}<div class="grow"><div class="ai-body">${m.html}</div>${(m.src || []).length ? `<div class="ai-src"><span class="small faint">Nguồn</span>${m.src.map((id, k) => { const r = F.report(id); return r ? `<a class="src-chip" href="${F.url('reader/report.html?id=' + r.id)}"><b>${k + 1}</b><span class="ellipsis">${esc(r.title)}</span>${F.vb(F.expert(r.author))}</a>` : ''; }).join('')}</div>` : ''}
          <div class="ai-foot"><span class="small faint">${I('info', 'i-xs')} Thông tin tham khảo, không phải khuyến nghị đầu tư.</span><span class="grow"></span><button type="button" class="icon-btn sm ${m.fb === 1 ? 'on' : ''}" data-fb="${i}:1" aria-label="Hữu ích">👍</button><button type="button" class="icon-btn sm ${m.fb === -1 ? 'on' : ''}" data-fb="${i}:-1" aria-label="Chưa đúng">👎</button><button type="button" class="icon-btn sm" data-cp="${i}" aria-label="Sao chép">${I('copy')}</button><button type="button" class="icon-btn sm" data-sv="${i}" aria-label="Lưu vào Nhật ký">${I('stickyNote')}</button></div></div></div>`).join('');
      $$('[data-sg]').forEach((b) => (b.onclick = () => ask(b.dataset.sg)));
      $$('[data-fb]').forEach((b) => (b.onclick = () => { const [i, k] = b.dataset.fb.split(':').map(Number); me.ai[i].fb = me.ai[i].fb === k ? 0 : k; F.save(); draw(); F.toast(k > 0 ? 'Cảm ơn phản hồi của bạn' : 'Đã ghi nhận — đội ngũ FBV sẽ xem xét câu trả lời này', 'info'); }));
      $$('[data-cp]').forEach((b) => (b.onclick = () => { const t = document.createElement('div'); t.innerHTML = me.ai[+b.dataset.cp].html; try { navigator.clipboard.writeText(t.innerText); } catch (e) {} F.toast('Đã sao chép'); }));
      $$('[data-sv]').forEach((b) => (b.onclick = () => { const m = me.ai[+b.dataset.sv]; const q = me.ai[+b.dataset.sv - 1]; const t = document.createElement('div'); t.innerHTML = m.html; me.notes = me.notes || []; me.notes.push({ id: F.uid('nt'), x: 'Trợ lý AI — ' + (q ? q.x : '') + '\n' + t.innerText.trim(), at: new Date().toISOString(), r: (m.src || [])[0] }); F.save(); F.toast('Đã lưu vào Nhật ký nghiên cứu'); }));
    };
    const ask = (x) => {
      x = String(x || '').trim(); if (x.length < 2) return;
      if (!unlimited() && used() >= FREE_PER_DAY) { F.modal({ title: 'Đã hết lượt hôm nay', body: `<p class="muted">Tài khoản miễn phí có ${FREE_PER_DAY} câu hỏi/ngày. Hội viên Premium dùng Trợ lý nghiên cứu không giới hạn.</p>`, actions: [{ label: 'Để sau' }, { label: 'Xem gói Premium', cls: 'btn-primary', onClick: () => F.go('reader/pricing.html') }] }); return; }
      me.ai.push({ role: 'u', x, at: new Date().toISOString() }); F.save(); draw();
      $('#th').insertAdjacentHTML('beforeend', `<div class="ai-msg typing" id="typing">${F.logoMark('logo-mark sm')}<div class="grow"><div class="ai-body muted small"><span class="spinner sm"></span> Đang tìm trong ${F.published().length} bài nghiên cứu đã thẩm định…</div></div></div>`);
      window.scrollTo(0, document.body.scrollHeight);
      setTimeout(() => { const a = answer(x, ctxR); me.ai.push({ role: 'a', html: a.html, src: a.src.map((r) => r.id), at: new Date().toISOString() }); F.save(); draw(); updQuota(); const last = $('#a' + (me.ai.length - 1)); if (last) last.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 900);
    };
    $('#cmp').innerHTML = `<div class="composer" id="cmpBox"><div class="inner col" style="flex-direction:column;align-items:stretch;gap:4px"><div class="row-in" style="display:flex;gap:8px;align-items:flex-end"><textarea id="tx" rows="1" placeholder="Hỏi về nghiên cứu, thuật ngữ…" maxlength="500" aria-label="Câu hỏi"></textarea><button type="button" class="send" id="snd" disabled aria-label="Gửi">${I('send')}</button></div><div class="small faint center" id="aq"></div></div></div>`;
    const updQuota = () => { $('#aq').textContent = unlimited() ? 'Premium · không giới hạn câu hỏi' : `Còn ${Math.max(0, FREE_PER_DAY - used())}/${FREE_PER_DAY} câu hỏi hôm nay · Trợ lý có thể sai, hãy kiểm tra nguồn`; };
    const tx = $('#tx');
    tx.oninput = () => { tx.style.height = 'auto'; tx.style.height = Math.min(120, tx.scrollHeight) + 'px'; $('#snd').disabled = tx.value.trim().length < 2; };
    tx.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#snd').click(); } };
    $('#snd').onclick = () => { const x = tx.value; tx.value = ''; tx.style.height = ''; $('#snd').disabled = true; ask(x); };
    $('#anew').onclick = () => { if (!me.ai.length) return; F.confirm('Bắt đầu cuộc trò chuyện mới?', 'Lịch sử hỏi đáp hiện tại sẽ được xóa khỏi thiết bị và tài khoản của bạn.', 'Bắt đầu mới', 'btn-primary', () => { me.ai = []; F.save(); draw(); }); };
    updQuota(); document.body.style.setProperty('--dock', $('#cmpBox').offsetHeight + 'px'); draw();
    if (F.param('q')) ask(F.param('q'));
    else window.scrollTo(0, document.body.scrollHeight);
  };
})();
