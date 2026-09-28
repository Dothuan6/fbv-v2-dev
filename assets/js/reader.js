/* =========================================================
   FBV v3 Prototype — READER
   R01 Research Feed · R02 Tìm kiếm & lọc · R03 Trình đọc báo cáo (+ Paywall P2)
   R04 PDF Viewer · R05 Gửi phản biện (sheet) · R06 Hồ sơ chuyên gia · R07 Thư viện
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = F.$, $$ = F.$$; const I = F.icon;

  /* ---------- Blocks renderer (dùng chung Reader + CMS preview) ---------- */
  F.renderBlocks = (r, opts = {}) => {
    const links = opts.widgets === false ? [] : F.linksOfReport(r.id);
    const blocks = r.body.slice(opts.from || 0, opts.to == null ? r.body.length : opts.to);
    return blocks.map((b, k) => {
      const i = k + (opts.from || 0); let h = '';
      if (b.t === 'p') h = `<p data-b="${i}" id="p${i}">${F.esc(b.x)}</p>`;
      else if (b.t === 'h') h = `<h2 data-b="${i}">${F.esc(b.x)}</h2>`;
      else if (b.t === 'quote') h = `<blockquote data-b="${i}">${F.esc(b.x)}</blockquote>`;
      else if (b.t === 'table') h = `<div class="tbl" data-b="${i}"><div class="fig-t">${F.esc(b.cap)}</div><div class="sx"><table><thead><tr>${b.head.map((x, j) => `<th class="${j ? 'r' : ''}">${F.esc(x)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((row) => `<tr>${row.map((x, j) => `<td class="${j ? 'r' : ''}">${F.esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="src">Nguồn: ${F.esc(b.src)}</div></div>`;
      else if (b.t === 'fig') h = `<figure data-b="${i}"><div class="fig-t">${F.esc(b.title)}</div><div class="fig-chart" data-fig="${i}"></div><figcaption>Nguồn: ${F.esc(b.src)}</figcaption></figure>`;
      return h + links.filter((l) => l.a === i).map((l) => F.indWidget(F.ind(l.i), l)).join('');
    }).join('');
  };
  F.mountFigures = (r, root) => $$('.fig-chart', root).forEach((el) => { const b = r.body[+el.dataset.fig]; F.chart.bar(el, { labels: b.data.map((d) => d[0]), values: b.data.map((d) => d[1]), dec: b.data.some((d) => d[1] % 1) ? 2 : 0, showValues: true, axis: false, height: 210, highlightLast: true, suffix: b.unit === '%' ? '%' : ' ' + b.unit, label: b.title }); });
  F.indWidget = (ind, l) => {
    const ch = F.chg(ind); const macro = ind.group === 'macro';
    return `<a class="iw" href="${F.url('reader/indicator.html?id=' + ind.id + '&from=' + l.r)}"><span class="ic">${I(macro ? 'bars' : 'chart')}</span>
      <span class="t"><span class="ai">${I('sparkles')}${l.s === 'manual' ? 'Chỉ số liên quan · Biên tập viên thêm' : 'Chỉ số liên quan · Vertex AI gợi ý, đã kiểm duyệt'}</span><span class="nm" style="display:block">${F.esc(ind.name)}${macro ? ` <span class="faint" style="font-weight:500">· ${F.esc(ind.period)}</span>` : ''}</span>
      <span class="vv"><span class="num">${F.fmtVal(ind)}</span><span class="chg-pill ${ch.d} num">${F.arrow(ch.c)} ${F.chgText(ind)}</span></span></span>
      <span class="sp">${macro ? F.chart.sparkBars(ind.series.values) : ((v) => F.chart.spark(v, F.dir(v[v.length - 1] - v[0])))(F.series(ind, '1M').values)}</span></a>`;
  };

  /* ---------- Quota & gửi phản biện ---------- */
  const quotaInfo = () => {
    const me = F.me(); const lim = F.db().config.quotaPerMonth; const unlimited = F.hasSub();
    const used = me ? F.db().inquiries.filter((q) => q.reader === me.id && Date.now() - new Date(q.createdAt) < 30 * 864e5).length : 0;
    return { used, lim, left: Math.max(lim - used, 0), unlimited };
  };
  F.quotaInfo = quotaInfo;
  F.quotaBar = () => { const q = quotaInfo(); return q.unlimited ? `<div class="quota">${I('crown', 'i-sm accent')}<span>Premium: phản biện 1:1 không giới hạn</span></div>` : `<div class="quota"><span>Đã dùng <b class="num">${q.used}/${q.lim}</b> lượt (30 ngày)</span><span class="bar"><i style="width:${Math.min(100, (q.used / q.lim) * 100)}%"></i></span></div>`; };

  F.openInquiry = (r, quote, block) => {
    if (!F.requireAuth('Đăng nhập để gửi câu hỏi phản biện riêng tới chuyên gia tác giả.')) return;
    const me = F.me(); const e = F.expert(r.author);
    if (me.blocked.includes(e.id)) { F.toast('Bạn đã chặn chuyên gia này. Bỏ chặn trong Cài đặt → Quyền riêng tư.', 'error'); return; }
    const q = quotaInfo();
    if (!q.unlimited && q.left <= 0) {
      F.modal({ title: 'Đã dùng hết lượt phản biện', body: `<div class="stack"><p class="muted">Tài khoản miễn phí được mở tối đa ${q.lim} phiên phản biện trong 30 ngày để chuyên gia có đủ thời gian phản hồi chất lượng.</p>${F.session().phase2 ? `<div class="note accent">${I('crown')}<span>Hội viên <b>Premium</b> được phản biện 1:1 không giới hạn và tham gia buổi trao đổi kín định kỳ cùng chuyên gia.</span></div>` : ''}</div>`,
        actions: F.session().phase2 ? [{ label: 'Để sau' }, { label: 'Xem gói Premium', cls: 'btn-primary', onClick: () => F.go('reader/pricing.html') }] : [{ label: 'Đã hiểu', cls: 'btn-primary' }] });
      return;
    }
    F.modal({
      title: 'Gửi phản biện', size: 'lg',
      body: `<div class="stack"><div class="quote-card">“${F.esc(quote)}”<small>Trích từ: ${F.esc(r.title)}</small></div>
        <div class="row">${F.avatar(e, 'sm')}<span class="small">Gửi riêng tới <b>${F.esc(e.name)}</b> ${F.vb(e)}</span></div>
        <div class="field"><label for="iq">Câu hỏi / lập luận phản biện</label><textarea class="textarea" id="iq" maxlength="1500" placeholder="Nêu rõ điểm muốn làm rõ hoặc phản biện, kèm lập luận/số liệu nếu có…"></textarea><div class="row between"><span class="hint">Tối thiểu 20 ký tự · Trao đổi học thuật, không yêu cầu khuyến nghị mua/bán.</span><span class="hint num" id="iqc">0/1500</span></div><span class="err hidden" id="iqe">Vui lòng nhập tối thiểu 20 ký tự.</span></div>
        ${F.quotaBar()}
        <div class="note">${I('lock')}<span>Phiên 1:1 là <b>riêng tư</b>, không hiển thị công khai. Chuyên gia thường phản hồi trong <b>${F.db().config.slaHours} giờ</b>. Bạn có thể báo cáo vi phạm hoặc chặn bất kỳ lúc nào.</span></div></div>`,
      actions: [{ label: 'Hủy' }, { label: `${I('send')} Gửi`, cls: 'btn-primary', onClick: (close, el) => {
        const v = $('#iq', el).value.trim(); if (v.length < 20) { $('#iqe', el).classList.remove('hidden'); $('#iq', el).classList.add('invalid'); return false; }
        const db = F.db(); const now = new Date().toISOString(); const id = F.uid('q');
        db.inquiries.unshift({ id, r: r.id, reader: me.id, expert: e.id, status: 'new', block, createdAt: now, slaDue: new Date(Date.now() + db.config.slaHours * 36e5).toISOString(), readerUnread: false, expertUnread: true, quote, messages: [{ by: me.id, at: now, x: v }] });
        F.save(); close();
        F.modal({ title: 'Đã gửi phản biện', body: `<div class="empty" style="padding:12px 0"><div class="ico" style="background:var(--success-soft);color:var(--success)">${I('check')}</div><h3>Câu hỏi đã tới ${F.esc(e.name)}</h3><p>Bạn sẽ nhận thông báo trong tab Hoạt động khi chuyên gia phản hồi.</p></div>`, actions: [{ label: 'Tiếp tục đọc' }, { label: 'Mở cuộc trao đổi', cls: 'btn-primary', onClick: () => F.go('reader/inquiry.html?id=' + id) }] });
        return false;
      } }],
      onOpen: (el) => { const ta = $('#iq', el); ta.addEventListener('input', () => { $('#iqc', el).textContent = ta.value.length + '/1500'; if (ta.value.trim().length >= 20) { $('#iqe', el).classList.add('hidden'); ta.classList.remove('invalid'); } }); }
    });
  };

  /* ---------- Aside (desktop) ---------- */
  const asideHome = () => `<div class="group-title">Thị trường</div><div class="panel" style="padding:4px 16px">${['VNINDEX', 'VN30', 'USDVND', 'GOLD', 'ON_RATE'].map((id) => F.irow(F.ind(id), { short: true, nosp: true })).join('')}</div><div class="delay-note" style="padding:8px 4px 0">${I('clock')}Trễ 15 phút · Số liệu minh họa</div>
    <div class="group-title mt-24">Chuyên gia FBV</div><div class="panel" style="padding:4px 16px">${F.db().experts.filter((e) => e.verified).slice(0, 4).map((e) => F.erow(e, { nobtn: true })).join('')}</div>${F.footLinks()}`;

  /* ================= R01 · Research Feed ================= */
  pages.home = () => {
    const v = F.shell({ tab: 'home', bar: 'root', rootTitle: 'Trang chủ', aside: asideHome() });
    const me = F.me(); let s = F.param('s') || 'all';
    const tabs = [['all', 'Tất cả'], ['fintech', 'Fintech'], ['macro', 'Kinh tế Vĩ mô'], ['micro', 'Kinh tế Vi mô']].concat(me ? [['following', 'Đang theo dõi']] : []);
    v.innerHTML = `<div class="utabs sticky" id="st" role="tablist"></div><div id="feed"></div>`;
    const draw = () => {
      $('#st').innerHTML = tabs.map((t) => `<button role="tab" class="${s === t[0] ? 'on' : ''}" data-s="${t[0]}">${t[1]}</button>`).join('');
      $$('#st [data-s]').forEach((b) => (b.onclick = () => { s = b.dataset.s; history.replaceState(null, '', '?s=' + s); draw(); window.scrollTo({ top: 0 }); }));
      let list = F.published();
      if (['fintech', 'macro', 'micro'].includes(s)) list = list.filter((r) => r.stream === s);
      if (s === 'following') list = list.filter((r) => me.follows.includes(r.author));
      const mk = ['VNINDEX', 'VN30', 'HNX', 'UPCOM', 'USDVND', 'GOLD', 'BRENT', 'ON_RATE'];
      let html = '';
      if (s === 'all') {
        if (!me) html += `<div style="padding:12px var(--gutter) 4px"><div class="note accent">${I('user')}<span class="grow">Bạn đang ở <b>chế độ Khách</b>: xem báo cáo và biểu đồ thị trường tự do. Đăng nhập để lưu bài, theo dõi chuyên gia và gửi phản biện.</span></div></div>`;
        html += `<div class="sec"><h2>Thị trường hôm nay</h2><a href="${F.url('reader/market.html')}">Xem tất cả</a></div><div class="mstrip">${mk.map((id) => F.mcard(F.ind(id))).join('')}</div><div class="delay-note">${I('clock')}Dữ liệu trễ 15 phút · minh họa</div><div class="divider" style="margin-top:14px"></div>`;
      }
      if (!list.length) html += s === 'following' ? F.empty('users', 'Chưa có bài từ chuyên gia bạn theo dõi', 'Theo dõi chuyên gia để thấy báo cáo mới của họ tại đây.', `<a class="btn btn-primary" href="${F.url('reader/search.html')}">Khám phá chuyên gia</a>`) : F.empty('file', 'Chưa có báo cáo', 'Luồng này chưa có báo cáo mới.');
      list.forEach((r, i) => {
        html += F.post(r);
        if (i === 2 && s === 'all') html += `<div class="sec"><h2>Chuyên gia FBV</h2><p>Verified by FBV</p></div><div class="ecards">${F.db().experts.map(F.ecard).join('')}</div><div class="divider" style="margin-top:14px"></div>`;
      });
      $('#feed').innerHTML = html;
    };
    draw();
  };

  /* ================= R02 · Tìm kiếm & bộ lọc ================= */
  const norm = (x) => String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  F.norm = norm;
  pages.search = () => {
    const v = F.shell({ tab: null, side: 'search', bar: 'back', left: '', notab: false, title: '' });
    const ab = $('#ab'); ab.innerHTML = `<label class="search-field">${I('search')}<input id="q" type="search" placeholder="Tìm báo cáo, chuyên gia, chỉ số…" autocomplete="off" value="${F.esc(F.param('q') || '')}"></label><button class="txt-btn acc" id="cancel">Hủy</button>`;
    ab.style.gap = '8px'; ab.style.padding = '0 12px 0 16px';
    $('#cancel').onclick = () => F.back('reader/index.html');
    document.title = 'Tìm kiếm · FBV';
    let stream = F.param('s') || ''; let author = F.param('a') || ''; let sort = 'new'; let pdf = false;
    const recentKey = 'fbv-recent'; const recent = () => { try { return JSON.parse(localStorage.getItem(recentKey) || '[]'); } catch (e) { return []; } };
    const pushRecent = (t) => { if (!t) return; try { const r = recent().filter((x) => x !== t); r.unshift(t); localStorage.setItem(recentKey, JSON.stringify(r.slice(0, 6))); } catch (e) {} };
    v.innerHTML = `<div class="chips" style="padding:10px var(--gutter) 6px" id="flt"></div><div id="res"></div>`;
    const drawF = () => {
      const a = author ? F.expert(author) : null;
      $('#flt').innerHTML = [['', 'Tất cả'], ['fintech', 'Fintech'], ['macro', 'Vĩ mô'], ['micro', 'Vi mô']].map((x) => `<button class="chip ${stream === x[0] ? 'on' : ''}" data-st="${x[0]}">${x[1]}</button>`).join('') +
        `<button class="chip ${a ? 'on' : ''}" id="fa">${I('user')}${a ? F.esc(a.short) : 'Tác giả'}${I('chevD', 'i-xs')}</button><button class="chip ${sort !== 'new' ? 'on' : ''}" id="fs">${I('sliders')}${{ new: 'Mới nhất', views: 'Đọc nhiều', rel: 'Liên quan' }[sort]}</button><button class="chip ${pdf ? 'on' : ''}" id="fp">${I('pdf')}Có PDF</button>`;
      $$('[data-st]').forEach((b) => (b.onclick = () => { stream = b.dataset.st; drawF(); drawR(); }));
      $('#fp').onclick = () => { pdf = !pdf; drawF(); drawR(); };
      $('#fa').onclick = () => F.modal({ title: 'Lọc theo tác giả', body: `<div class="menu-list"><button data-au="">${I('users')}<span class="grow">Mọi tác giả</span>${!author ? I('check', 'i-sm accent') : ''}</button>${F.db().experts.map((e) => `<button data-au="${e.id}">${F.avatar(e, 'sm')}<span class="grow">${F.esc(e.name)} ${F.vb(e)}</span>${author === e.id ? I('check', 'i-sm accent') : ''}</button>`).join('')}</div>`, onOpen: (el, close) => $$('[data-au]', el).forEach((b) => (b.onclick = () => { author = b.dataset.au; close(); drawF(); drawR(); })) });
      $('#fs').onclick = () => F.modal({ title: 'Sắp xếp', body: `<div class="menu-list">${[['new', 'Mới nhất'], ['views', 'Đọc nhiều nhất'], ['rel', 'Liên quan nhất']].map((x) => `<button data-so="${x[0]}"><span class="grow">${x[1]}</span>${sort === x[0] ? I('check', 'i-sm accent') : ''}</button>`).join('')}</div>`, onOpen: (el, close) => $$('[data-so]', el).forEach((b) => (b.onclick = () => { sort = b.dataset.so; close(); drawF(); drawR(); })) });
    };
    const drawR = () => {
      const q = $('#q').value.trim(); const nq = norm(q);
      const filtered = !!(stream || author || pdf);
      if (!q && !filtered) {
        const rc = recent(); const tags = ['Lãi suất', 'Tỷ giá', 'Lạm phát', 'FDI', 'Ngân hàng số', 'Khối ngoại', 'Thanh toán số', 'Logistics'];
        $('#res').innerHTML = `${rc.length ? `<div class="sec"><h2>Tìm kiếm gần đây</h2><a href="#" id="clr">Xóa</a></div><div>${rc.map((t) => `<button class="lrow" style="width:100%;text-align:left" data-t="${F.esc(t)}">${I('history', 'i faint')}<span class="t"><b>${F.esc(t)}</b></span>${I('arrowUR', 'i-sm faint')}</button>`).join('')}</div>` : ''}
          <div class="sec"><h2>Chủ đề phổ biến</h2></div><div class="chips" style="padding:4px var(--gutter);flex-wrap:wrap">${tags.map((t) => `<button class="chip" data-t="${t}">${t}</button>`).join('')}</div>
          <div class="sec"><h2>Chuyên gia</h2></div>${F.db().experts.map((e) => F.erow(e)).join('')}`;
        $$('[data-t]').forEach((b) => (b.onclick = () => { $('#q').value = b.dataset.t; pushRecent(b.dataset.t); drawR(); }));
        const clr = $('#clr'); if (clr) clr.onclick = (e) => { e.preventDefault(); try { localStorage.removeItem(recentKey); } catch (x) {} drawR(); };
        return;
      }
      const score = (r) => { if (!nq) return 1; const e = F.expert(r.author); let s = 0; const hay = [[r.title, 5], [r.dek, 2], [r.tags.join(' '), 4], [e.name, 3], [r.summary.join(' '), 1], [r.body.map((b) => b.x || '').join(' '), 1]]; nq.split(/\s+/).forEach((w) => hay.forEach(([t, wgt]) => { if (norm(t).includes(w)) s += wgt; })); return s; };
      let list = F.published().filter((r) => (!stream || r.stream === stream) && (!author || r.author === author) && (!pdf || r.pdf)).map((r) => ({ r, s: score(r) })).filter((x) => x.s > 0);
      list.sort((a, b) => (sort === 'views' ? b.r.views - a.r.views : sort === 'rel' ? b.s - a.s : new Date(b.r.publishedAt) - new Date(a.r.publishedAt)));
      const ex = nq ? F.db().experts.filter((e) => norm(e.name + ' ' + e.title).includes(nq)) : [];
      const inds = nq ? F.db().indicators.filter((i) => norm(i.name + ' ' + i.id + ' ' + i.syn.join(' ')).includes(nq)).slice(0, 4) : [];
      $('#res').innerHTML = `${ex.length ? `<div class="sec"><h2>Chuyên gia</h2></div>${ex.map((e) => F.erow(e)).join('')}` : ''}
        ${inds.length ? `<div class="sec"><h2>Chỉ số</h2></div><div style="padding:4px var(--gutter)"><div class="group">${inds.map((i) => F.irow(i)).join('')}</div></div>` : ''}
        <div class="sec"><h2>Báo cáo</h2><p>${list.length} kết quả</p></div>${list.length ? list.map((x) => F.postCompact(x.r)).join('') : F.empty('search', 'Không tìm thấy báo cáo', 'Thử từ khóa khác hoặc bỏ bớt bộ lọc.')}`;
    };
    let t; $('#q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(drawR, 150); });
    $('#q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { pushRecent($('#q').value.trim()); $('#q').blur(); } });
    drawF(); drawR();
    if (!F.param('q') && window.innerWidth >= 768) $('#q').focus();
  };

  /* ================= R03 · Trình đọc báo cáo ================= */
  pages.report = () => {
    const r = F.report(F.param('id')) || F.published()[0]; const e = F.expert(r.author); const me = F.me();
    const nid = F.param('n'); if (nid && me) { const n = F.db().notifications.find((x) => x.id === nid); if (n) { n.read = true; F.save(); } }
    if (me) { me.history = [r.id].concat(me.history.filter((x) => x !== r.id)).slice(0, 30); F.save(); }
    const saved = F.isSaved(r.id); const locked = F.isLocked(r);
    const v = F.shell({ bar: 'back', back: 'reader/index.html', notab: true, title: '', right: `<button class="icon-btn ${saved ? 'on' : ''}" data-bm="${r.id}" aria-label="${saved ? 'Bỏ lưu' : 'Lưu'}">${I(saved ? 'bookmarkFill' : 'bookmark')}</button><button class="icon-btn" data-share="${r.id}" aria-label="Chia sẻ">${I('share')}</button><button class="icon-btn" id="more" aria-label="Tùy chọn">${I('more')}</button>` });
    document.title = r.title + ' · FBV';
    document.body.style.setProperty('--dock', '64px');
    const links = F.linksOfReport(r.id); const related = F.published().filter((x) => x.id !== r.id && x.stream === r.stream).slice(0, 3);
    const myQ = me ? F.db().inquiries.filter((q) => q.reader === me.id && q.r === r.id) : [];
    const cut = Math.min(2, r.body.length);
    v.innerHTML = `<div class="toc-prog" id="prog"></div><article class="article">
      <div class="art-k"><span class="stream">${F.STREAM[r.stream]}</span>${r.premium && F.session().phase2 ? `<span class="tag prem">${I('crown', 'i-xs')}Premium</span>` : ''}${r.pdf ? `<span class="tag">${I('pdf', 'i-xs')}Có bản PDF</span>` : ''}</div>
      <h1 class="art-t">${F.esc(r.title)}</h1><p class="art-d">${F.esc(r.dek)}</p>
      <div class="art-by"><a href="${F.url('reader/expert.html?id=' + e.id)}">${F.avatar(e, 'md')}</a><div class="t"><a href="${F.url('reader/expert.html?id=' + e.id)}"><b>${F.esc(e.name)} ${F.vb(e)}</b></a><small>${F.dateLong(r.publishedAt)} · ${r.readTime} phút đọc</small></div>${F.followBtn(e, 'btn btn-xs')}</div>
      <div class="art-acts"><span>${I('eye')}${F.compact(r.views)}</span><a href="#phan-bien">${I('chat')}${F.inqCount(r.id)}</a><span class="sp"></span>${r.pdf ? `<a href="${F.url('reader/report-pdf.html?id=' + r.id)}" aria-label="Mở PDF">${I('pdf')}</a>` : ''}<button class="${saved ? 'on' : ''}" data-bm="${r.id}" aria-label="${saved ? 'Bỏ lưu' : 'Lưu'}">${I(saved ? 'bookmarkFill' : 'bookmark')}</button><button data-share="${r.id}" aria-label="Chia sẻ">${I('share')}</button></div>
      <div class="summary"><h4>Tóm tắt điều hành</h4><ul>${r.summary.map((x) => `<li>${F.esc(x)}</li>`).join('')}</ul></div>
      ${locked ? `<div class="paywall"><div class="prose fade">${F.renderBlocks(r, { to: cut + 2, widgets: false })}</div>
        <div class="pw-card"><div class="ic">${I('lock')}</div><h3>Nội dung chuyên sâu dành cho hội viên Premium</h3><p>Bạn đang xem bản tóm tắt. Nâng cấp để đọc toàn văn, bảng số liệu, bản PDF và phản biện 1:1 không giới hạn.</p>
          <div class="stack"><a class="btn btn-primary btn-pill btn-block" href="${F.url('reader/pricing.html?r=' + r.id)}">Nâng cấp Premium</a><a class="btn btn-gray btn-block" href="${F.url('reader/checkout.html?plan=single&r=' + r.id)}">Mở khóa riêng báo cáo này · ${F.num(79000)}đ</a><button class="btn-text" id="restore" style="margin:4px auto 0">Khôi phục giao dịch</button></div></div></div>`
        : `<div class="prose" id="prose">${F.renderBlocks(r)}</div>`}
      <div class="tags-row">${r.tags.map((t) => `<a class="chip" href="${F.url('reader/search.html?q=' + encodeURIComponent(t))}">${F.esc(t)}</a>`).join('')}</div>
      ${F.disclaimer()}
      ${links.length ? `<div class="sec" style="padding-left:0;padding-right:0"><h2>Chỉ số trong bài</h2><p>${I('sparkles', 'i-xs')}</p></div><div class="group">${links.map((l) => F.irow(F.ind(l.i))).join('')}</div><p class="hint mt-8">Liên kết do Google Vertex AI gợi ý tại thời điểm xuất bản và được biên tập viên FBV kiểm duyệt.</p>` : ''}
      <div id="phan-bien" class="sec" style="padding-left:0;padding-right:0"><h2>Phản biện 1:1</h2></div>
      <div class="panel"><div class="row top"><span class="ib" style="width:36px;height:36px;border-radius:10px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;flex:none">${I('quote', 'i-sm')}</span><div class="grow"><b>Bôi đen một đoạn hoặc số liệu bất kỳ</b><p class="muted small mt-4">để gửi câu hỏi phản biện riêng tới ${F.esc(e.name)}. Trao đổi kín, không công khai.</p></div></div>
        ${myQ.length ? `<div class="menu-list mt-12">${myQ.map((q) => `<a href="${F.url('reader/inquiry.html?id=' + q.id)}">${I('chat')}<span class="grow ellipsis">“${F.esc(q.quote)}”</span>${F.iStatusBadge(q.status)}</a>`).join('')}</div>` : ''}
        <button class="btn btn-gray btn-block mt-12" id="askAll">${I('edit')}Đặt câu hỏi về toàn bài</button></div>
      <div class="sec" style="padding-left:0;padding-right:0"><h2>Về tác giả</h2></div>
      <div class="panel" style="padding:0">${F.erow(e, { bio: true })}</div>
      ${related.length ? `<div class="sec" style="padding-left:0;padding-right:0"><h2>Đọc tiếp trong ${F.STREAM_S[r.stream]}</h2></div><div style="margin:0 calc(-1 * var(--gutter))">${related.map((x) => F.postCompact(x)).join('')}</div>` : ''}
    </article>
    <div class="actbar"><div class="inner"><button class="btn btn-primary" id="askBtn">${I('quote')}<span class="lbl">Trích dẫn & phản biện</span></button>${r.pdf ? `<a class="icon-btn" href="${F.url('reader/report-pdf.html?id=' + r.id)}" aria-label="Xem PDF">${I('pdf')}</a>` : ''}<button class="icon-btn ${saved ? 'on' : ''}" data-bm="${r.id}" id="bm" aria-label="${saved ? 'Bỏ lưu' : 'Lưu'}">${I(saved ? 'bookmarkFill' : 'bookmark')}</button><button class="icon-btn" data-share="${r.id}" aria-label="Chia sẻ">${I('share')}</button></div></div>`;
    if (!locked) F.mountFigures(r, $('#prose'));
    const rs = $('#restore'); if (rs) rs.onclick = () => { F.toast('Không tìm thấy giao dịch trước đó cho tài khoản này', 'info'); };
    const askWhole = () => { if (locked) { F.go('reader/pricing.html?r=' + r.id); return; } F.openInquiry(r, r.summary[0], 0); };
    $('#askAll').onclick = askWhole;
    $('#askBtn').onclick = () => { const sel = String(window.getSelection() || '').trim(); if (sel.length > 8 && !locked) { const b = selBlock(); F.openInquiry(r, sel.slice(0, 400), b); } else if (locked) F.go('reader/pricing.html?r=' + r.id); else F.toast('Bôi đen một đoạn trong bài để trích dẫn, hoặc dùng “Đặt câu hỏi về toàn bài”.', 'info'); };
    $('#more').onclick = () => F.menu([
      r.pdf ? { icon: 'pdf', label: 'Mở bản PDF', onClick: () => F.go('reader/report-pdf.html?id=' + r.id) } : null,
      { icon: 'link', label: 'Sao chép liên kết', onClick: () => { try { navigator.clipboard.writeText(location.href); } catch (x) {} F.toast('Đã sao chép liên kết'); } },
      { icon: 'user', label: 'Xem hồ sơ tác giả', onClick: () => F.go('reader/expert.html?id=' + e.id) },
      { icon: 'flag', label: 'Báo cáo nội dung', danger: true, onClick: () => F.toast('Đã gửi phản ánh tới ban biên tập FBV', 'info') }
    ].filter(Boolean));
    // Tiến độ đọc
    const prog = $('#prog'); const onS = () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); prog.style.width = Math.min(100, p * 100) + '%'; };
    window.addEventListener('scroll', onS, { passive: true });
    // Bôi đen → trích dẫn
    const selBlock = () => { const s = window.getSelection(); if (!s.rangeCount) return 0; const n = s.getRangeAt(0).startContainer; const el = (n.nodeType === 1 ? n : n.parentElement).closest('[data-b]'); return el ? +el.dataset.b : 0; };
    let pop = null; const hide = () => { if (pop) { pop.remove(); pop = null; } };
    const show = () => {
      const s = window.getSelection(); const txt = String(s || '').trim(); const prose = $('#prose');
      if (!prose || !s.rangeCount || txt.length < 8 || !prose.contains(s.anchorNode)) { hide(); return; }
      hide(); pop = document.createElement('div'); pop.className = 'sel-pop';
      pop.innerHTML = `<button data-q>${I('quote')}Trích dẫn & phản biện</button><button data-c>${I('copy')}Sao chép</button>`;
      if (window.innerWidth < 768) { pop.classList.add('fixed'); document.body.appendChild(pop); }
      else { const rc = s.getRangeAt(0).getBoundingClientRect(); pop.style.left = rc.left + rc.width / 2 + window.scrollX + 'px'; pop.style.top = rc.top + window.scrollY - 10 + 'px'; document.body.appendChild(pop); }
      pop.addEventListener('mousedown', (x) => x.preventDefault());
      $('[data-q]', pop).onclick = () => { const b = selBlock(); hide(); F.openInquiry(r, txt.slice(0, 400), b); };
      $('[data-c]', pop).onclick = () => { try { navigator.clipboard.writeText(txt); } catch (x) {} hide(); F.toast('Đã sao chép trích dẫn'); };
    };
    document.addEventListener('mouseup', () => setTimeout(show, 10));
    document.addEventListener('selectionchange', () => { if (window.innerWidth < 768) { clearTimeout(pages._st); pages._st = setTimeout(show, 250); } });
    document.addEventListener('mousedown', (x) => { if (pop && !pop.contains(x.target)) hide(); });
    if (location.hash === '#phan-bien') setTimeout(() => $('#phan-bien').scrollIntoView(), 50);
  };

  /* ================= R04 · Native PDF Viewer ================= */
  pages.reportPdf = () => {
    const r = F.report(F.param('id')) || F.published()[0];
    const v = F.shell({ bar: 'back', back: 'reader/report.html?id=' + r.id, notab: true, title: 'Bản PDF', right: F.isLocked(r) ? '' : `<a class="icon-btn" href="${F.url('assets/media/sample-report.pdf')}" download="FBV-${r.id}.pdf" aria-label="Tải xuống">${I('download')}</a><button class="icon-btn" data-share="${r.id}" aria-label="Chia sẻ">${I('share')}</button>` });
    if (F.isLocked(r)) { v.innerHTML = F.empty('lock', 'Bản PDF dành cho hội viên Premium', 'Nâng cấp để đọc và tải bản PDF đầy đủ của báo cáo.', `<a class="btn btn-primary" href="${F.url('reader/pricing.html?r=' + r.id)}">Xem gói Premium</a>`); return; }
    let z = 100;
    v.innerHTML = `<div class="pdfv"><div class="pdf-tools"><span class="grow ellipsis"><b style="color:var(--text)">${F.esc(r.title)}</b></span><button class="icon-btn sm" id="zo" aria-label="Thu nhỏ">${I('zoomOut')}</button><span class="num" id="zv" style="min-width:44px;text-align:center">100%</span><button class="icon-btn sm" id="zi" aria-label="Phóng to">${I('zoomIn')}</button></div>
      <div class="pdf-frame"><object id="pdfo" data="${F.url('assets/media/sample-report.pdf')}#zoom=100" type="application/pdf"><div class="pdf-fallback">${F.empty('pdf', 'Trình duyệt không hiển thị PDF nhúng', 'Trên ứng dụng di động, PDF mở bằng trình xem gốc (Native PDF Viewer) với cử chỉ phóng to, tìm kiếm và mục lục.', `<a class="btn btn-primary" href="${F.url('assets/media/sample-report.pdf')}" target="_blank">Mở PDF</a>`)}</div></object></div></div>`;
    const setZ = (d) => { z = Math.max(50, Math.min(200, z + d)); $('#zv').textContent = z + '%'; const o = $('#pdfo'); const n = o.cloneNode(true); n.data = F.url('assets/media/sample-report.pdf') + '#zoom=' + z; o.replaceWith(n); };
    $('#zo').onclick = () => setZ(-25); $('#zi').onclick = () => setZ(25);
  };

  /* ================= R06 · Hồ sơ chuyên gia ================= */
  pages.expert = () => {
    const e = F.expert(F.param('id')) || F.db().experts[0]; const me = F.me();
    const list = F.reportsOf(e.id); const answered = F.db().inquiries.filter((q) => q.expert === e.id && ['answered', 'closed'].includes(q.status)).length + (e.verified ? 40 : 3);
    const v = F.shell({ bar: 'back', back: 'reader/index.html', title: '', right: `<button class="icon-btn" id="more" aria-label="Tùy chọn">${I('more')}</button>` });
    document.title = e.name + ' · FBV';
    let tab = 'posts';
    v.innerHTML = `<div class="prof"><div class="prof-top"><div class="t"><h1>${F.esc(e.name)}</h1><div class="h">${F.esc(e.title)}</div></div>${F.avatar(e, 'xl')}</div>
      <div class="meta">${e.verified ? `<span class="verified-pill">${F.vb(e)}Verified by FBV</span>` : `<span class="tag warn">${I('clock', 'i-xs')}Đang chờ FBV thẩm định</span>`}<span>${F.esc(e.org)}</span></div>
      <p class="bio">${F.esc(e.bio)}</p>
      <div class="stats-row"><div><b class="num">${list.length}</b><span>Báo cáo</span></div><div><b class="num">${F.compact(F.followers(e.id))}</b><span>Người theo dõi</span></div><div><b class="num">${answered}</b><span>Phản biện đã trả lời</span></div></div>
      <div class="btns">${F.followBtn(e, 'btn')}<button class="btn btn-gray" id="shareP">${I('share')}Chia sẻ</button></div></div>
      <div class="utabs mt-16" id="tb"></div><div id="tv"></div>`;
    const draw = () => {
      $('#tb').innerHTML = [['posts', 'Báo cáo', list.length], ['about', 'Giới thiệu']].map((t) => `<button class="${tab === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]}${t[2] != null ? `<span class="cnt">${t[2]}</span>` : ''}</button>`).join('');
      $$('#tb [data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
      $('#tv').innerHTML = tab === 'posts' ? (list.length ? list.map((r) => F.postCompact(r)).join('') : F.empty('file', 'Chưa có báo cáo', 'Chuyên gia chưa xuất bản báo cáo nào.'))
        : `<div class="page mt-16"><div class="groups"><div><div class="group-title">Thông tin</div><div class="group plain">
          <div class="gi noicon"><span class="gl">Lĩnh vực</span><span class="gv">${e.fields.map((f) => F.STREAM_S[f]).join(', ')}</span></div>
          <div class="gi noicon"><span class="gl">Đơn vị</span><span class="gv">${F.esc(e.org)}</span></div>
          <div class="gi noicon"><span class="gl">Chức danh</span><span class="gv">${F.esc(e.title)}</span></div></div></div>
          <div><div class="group-title">Chứng thực</div><div class="note ${e.verified ? 'accent' : 'warn'}">${I(e.verified ? 'shieldCheck' : 'clock')}<span>${e.verified ? '<b>Verified by FBV</b> — Danh tính, học vị và kinh nghiệm chuyên môn đã được Hội đồng FBV Review thẩm định. Mọi báo cáo của chuyên gia đều qua quy trình thẩm định học thuật 3 bước.' : 'Hồ sơ đang được Hội đồng FBV Review thẩm định. Huy hiệu sẽ hiển thị sau khi hoàn tất.'}</span></div></div></div></div>`;
    };
    draw();
    $('#shareP').onclick = () => F.shareSheet(e.name, location.href);
    $('#more').onclick = () => F.menu([
      { icon: 'link', label: 'Sao chép liên kết hồ sơ', onClick: () => { try { navigator.clipboard.writeText(location.href); } catch (x) {} F.toast('Đã sao chép liên kết'); } },
      { icon: 'ban', label: me && me.blocked.includes(e.id) ? 'Bỏ chặn chuyên gia' : 'Chặn chuyên gia', danger: true, onClick: () => { if (!F.requireAuth()) return; const b = me.blocked; const i = b.indexOf(e.id); if (i > -1) { b.splice(i, 1); F.toast('Đã bỏ chặn'); } else { b.push(e.id); F.toast('Đã chặn. Bạn sẽ không nhận tin nhắn từ chuyên gia này.', 'info'); } F.save(); } }
    ]);
  };

  /* ================= R07 · Thư viện (Đã lưu · Đang theo dõi · Đã đọc) ================= */
  pages.bookmarks = () => {
    const v = F.shell({ tab: 'library', bar: 'root', rootTitle: '' });
    const me = F.me();
    v.innerHTML = `<h1 class="large-title">Thư viện</h1><div id="lib"></div>`;
    if (!me) { $('#lib').innerHTML = F.gate('bookmark', 'Lưu báo cáo để đọc sau', 'Đăng nhập để lưu báo cáo, theo dõi chuyên gia và đồng bộ lịch sử đọc trên mọi thiết bị.'); return; }
    let tab = F.param('t') || 'saved';
    const draw = () => {
      const saved = me.bookmarks.map(F.report).filter(Boolean); const fol = me.follows.map(F.expert).filter(Boolean); const hist = me.history.map(F.report).filter(Boolean);
      $('#lib').innerHTML = `<div class="utabs" id="tb">${[['saved', 'Đã lưu', saved.length], ['following', 'Đang theo dõi', fol.length], ['history', 'Đã đọc', hist.length]].map((t) => `<button class="${tab === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]}<span class="cnt">${t[2]}</span></button>`).join('')}</div><div id="tv"></div>`;
      $$('#tb [data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; history.replaceState(null, '', '?t=' + tab); draw(); }));
      const tv = $('#tv');
      if (tab === 'saved') tv.innerHTML = saved.length ? saved.map((r) => F.postCompact(r)).join('') : F.empty('bookmark', 'Chưa có báo cáo đã lưu', 'Nhấn biểu tượng lưu trên báo cáo để đọc lại sau.', `<a class="btn btn-primary" href="${F.url('reader/index.html')}">Khám phá báo cáo</a>`);
      else if (tab === 'following') tv.innerHTML = (fol.length ? fol.map((e) => F.erow(e)).join('') : F.empty('users', 'Bạn chưa theo dõi chuyên gia nào', 'Theo dõi để nhận thông báo khi chuyên gia xuất bản báo cáo mới.')) + `<div class="sec"><h2>Gợi ý cho bạn</h2></div>${F.db().experts.filter((e) => !me.follows.includes(e.id)).map((e) => F.erow(e)).join('')}`;
      else tv.innerHTML = hist.length ? hist.map((r) => F.postCompact(r, { date: 'ago' })).join('') + `<div class="page mt-16"><button class="btn btn-gray btn-block" id="clh">Xóa lịch sử đọc</button></div>` : F.empty('history', 'Chưa có lịch sử đọc', 'Các báo cáo bạn mở sẽ xuất hiện tại đây.');
      const c = $('#clh'); if (c) c.onclick = () => F.confirm('Xóa lịch sử đọc?', 'Danh sách báo cáo đã đọc sẽ bị xóa khỏi tài khoản.', 'Xóa', 'btn-danger', () => { me.history = []; F.save(); draw(); F.toast('Đã xóa lịch sử đọc'); });
    };
    draw();
  };
})();
