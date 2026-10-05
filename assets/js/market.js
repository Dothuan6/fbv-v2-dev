/* =========================================================
   FBV v3 Prototype — MACRO & MARKET HUB
   R08 Thị trường chứng khoán · R09 Vĩ mô & Tiền tệ · R10 Chi tiết chỉ số (+ bài nghiên cứu liên quan AI)
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = F.$, $$ = F.$$; const I = F.icon;
  const hubTabs = (on) => `<div class="utabs"><a class="${on === 'eq' ? 'on' : ''}" href="${F.url('reader/market.html')}">Chứng khoán</a><a class="${on === 'mac' ? 'on' : ''}" href="${F.url('reader/macro.html')}">Vĩ mô & Tiền tệ</a></div>`;
  const timeNote = () => { const t = new Date(F.db().market.updatedAt); return `Cập nhật ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')} · trễ 15 phút · thu thập qua vnstock (KBS/VCI) · số liệu minh họa`; };

  const quoteHead = (ind, label) => { const ch = F.chg(ind); const macro = ind.group === 'macro';
    return `<div class="quote-head"><div class="qn">${F.esc(label || ind.name)}</div><div class="qv num">${F.fmtVal(ind)}${F.unitLabel(ind) && !macro ? ` <span class="faint" style="font-size:15px;font-weight:600">${F.esc(F.unitLabel(ind))}</span>` : ''}</div>
      <div class="qc num ${ch.d}"><span>${F.arrow(ch.c)} ${F.signed(ch.c, ind.dec)}${macro ? ' đ.%' : ''}</span>${macro ? '' : `<span>(${F.signed(ch.p, 2)}%)</span>`}<span class="faint">${macro ? 'so với ' + F.esc(ind.prevLabel) : 'so với tham chiếu'}</span></div></div>`; };

  /* ================= R08 · Thị trường chứng khoán ================= */
  pages.market = () => {
    const v = F.shell({ tab: 'market', side: 'market', bar: 'root', rootTitle: '' });
    const M = F.db().market; let idx = F.param('i') || 'VNINDEX'; let range = '1D'; let ex = 'HOSE';
    v.innerHTML = `<h1 class="large-title">Thị trường</h1>${hubTabs('eq')}
      <div class="chips" style="padding:12px var(--gutter) 4px" id="ix"></div><div id="qh"></div><div class="range" id="rg"></div><div class="chart-box"><div id="ch"></div></div>
      <div class="delay-note mt-8">${I('clock')}<span>${timeNote()}</span></div>
      <div class="page mt-16"><div class="stat-grid" id="sg"></div></div>
      <div class="page mt-16"><div class="panel"><div class="panel-h"><h3>Độ rộng thị trường</h3><div class="seg" id="exs">${['HOSE', 'HNX', 'UPCOM'].map((x) => `<button data-x="${x}">${x === 'UPCOM' ? 'UPCoM' : x}</button>`).join('')}</div></div><div id="br"></div></div></div>
      <div class="page mt-16"><div class="panel"><div class="panel-h"><h3>Khối ngoại mua/bán ròng</h3><span>10 phiên · tỷ đồng</span></div><div id="fr"></div>
        <div class="stat-grid mt-12" style="background:var(--bg-elev-2)"><div><span>Mua hôm nay</span><b class="num">${F.num(M.foreignToday.buy)}</b></div><div><span>Bán hôm nay</span><b class="num">${F.num(M.foreignToday.sell)}</b></div><div><span>Ròng hôm nay</span><b class="num ${F.dir(M.foreignToday.buy - M.foreignToday.sell)}">${F.signed(M.foreignToday.buy - M.foreignToday.sell, 0)}</b></div><div><span>Ròng 10 phiên</span><b class="num ${F.dir(M.foreign.values.reduce((a, b) => a + b, 0))}">${F.signed(M.foreign.values.reduce((a, b) => a + b, 0), 0)}</b></div></div></div></div>
      <div class="sec"><h2>Phân tích liên quan</h2><p>${I('sparkles', 'i-xs accent')}</p></div><div id="rel"></div>
      <div class="page mt-16">${F.srcNote('Nguồn: HOSE, HNX · thu thập qua vnstock (KBS/VCI). Không phải khuyến nghị đầu tư.').replace('delay-note', 'delay-note" style="padding:0')}</div>`;
    const draw = () => {
      const ind = F.ind(idx); const s = F.series(ind, range); const vals = s.values;
      $('#ix').innerHTML = ['VNINDEX', 'VN30', 'HNX', 'UPCOM'].map((id) => { const i = F.ind(id); const c = F.chg(i); return `<button class="chip ${idx === id ? 'on' : ''}" data-i="${id}">${F.esc(F.shortName(i))} <span class="${idx === id ? '' : c.d}" style="font-weight:700">${F.signed(c.p, 2)}%</span></button>`; }).join('');
      $$('#ix [data-i]').forEach((b) => (b.onclick = () => { idx = b.dataset.i; history.replaceState(null, '', '?i=' + idx); draw(); }));
      $('#qh').innerHTML = quoteHead(ind);
      $('#rg').innerHTML = ['1D', '1W', '1M', '1Y'].map((x) => `<button class="${range === x ? 'on' : ''}" data-r="${x}">${x}</button>`).join('');
      $$('#rg [data-r]').forEach((b) => (b.onclick = () => { range = b.dataset.r; draw(); }));
      F.chart.line($('#ch'), { labels: s.labels, values: vals, dec: ind.dec, height: 230, ref: range === '1D' ? ind.prev : null, label: ind.name + ' ' + range });
      const liq = { VNINDEX: M.liquidity.HOSE, VN30: Math.round(M.liquidity.HOSE * .46), HNX: M.liquidity.HNX, UPCOM: M.liquidity.UPCOM }[idx];
      $('#sg').innerHTML = `<div><span>Tham chiếu</span><b class="num">${F.num(ind.prev, ind.dec)}</b></div><div><span>Thanh khoản</span><b class="num">${F.num(liq)} tỷ</b></div><div><span>Cao nhất (${range})</span><b class="num">${F.num(Math.max(...vals), ind.dec)}</b></div><div><span>Thấp nhất (${range})</span><b class="num">${F.num(Math.min(...vals), ind.dec)}</b></div>`;
      const rel = F.reportsOfInd(idx).concat(F.reportsOfInd('VNINDEX')).filter((r, i, a) => a.findIndex((x) => x.id === r.id) === i).slice(0, 3);
      $('#rel').innerHTML = rel.length ? rel.map((r) => F.postCompact(r)).join('') : `<p class="muted small page">Chưa có bài nghiên cứu liên quan.</p>`;
    };
    const drawB = () => {
      const b = M.breadth[ex]; const tot = b.up + b.down + b.flat;
      $$('#exs [data-x]').forEach((x) => { x.classList.toggle('on', x.dataset.x === ex); x.onclick = () => { ex = x.dataset.x; drawB(); }; });
      $('#br').innerHTML = `<div class="breadth"><i class="u" style="width:${(b.up / tot) * 100}%"></i><i class="f" style="width:${(b.flat / tot) * 100}%"></i><i class="d" style="width:${(b.down / tot) * 100}%"></i></div>
        <div class="legend"><span><i style="background:var(--up)"></i>Tăng <b class="num">${b.up}</b> <span class="faint">(trần ${b.ceil})</span></span><span><i style="background:var(--ref)"></i>Đứng giá <b class="num">${b.flat}</b></span><span><i style="background:var(--down)"></i>Giảm <b class="num">${b.down}</b> <span class="faint">(sàn ${b.floor})</span></span></div>`;
    };
    draw(); drawB();
    F.chart.bar($('#fr'), { labels: M.foreign.labels, values: M.foreign.values, mode: 'posneg', dec: 0, height: 180, signed: true, suffix: ' tỷ', label: 'Khối ngoại mua/bán ròng' });
  };

  /* ================= R09 · Vĩ mô & Tiền tệ ================= */
  pages.macro = () => {
    const v = F.shell({ tab: 'market', side: 'macro', bar: 'root', rootTitle: '' });
    const grp = (title, ids, note) => `<div><div class="group-title">${title}</div><div class="group">${ids.map((id) => F.irow(F.ind(id))).join('')}</div>${note ? `<div class="group-foot">${note}</div>` : ''}</div>`;
    const tile = (id) => { const i = F.ind(id); const c = F.chg(i); return `<a class="mtile" href="${F.url('reader/indicator.html?id=' + id)}"><span class="n">${F.esc(i.name)}</span><span class="v num">${F.num(i.value, i.dec)}<small>${F.esc(i.unit)}</small></span><span class="p"><span class="${c.d}" style="font-weight:700">${F.arrow(c.c)} ${F.signed(c.c, i.dec)}</span> · ${F.esc(i.period)}</span><span class="sp">${F.chart.sparkBars(i.series.values)}</span></a>`; };
    v.innerHTML = `<h1 class="large-title">Thị trường</h1>${hubTabs('mac')}
      <div class="page mt-16"><div class="panel"><div class="panel-h"><h3>Lãi suất liên ngân hàng qua đêm</h3><a class="link small" href="${F.url('reader/indicator.html?id=ON_RATE')}">Chi tiết</a></div>${quoteHead(F.ind('ON_RATE'), ' ').replace('class="quote-head"', 'class="quote-head" style="padding:0 0 6px"')}<div id="onc"></div></div></div>
      <div class="page mt-24"><div class="groups">
        ${grp('Lãi suất', ['POLICY_RATE', 'ON_RATE', 'IB_1W', 'DEP_12M'], 'Nguồn: Ngân hàng Nhà nước, tổng hợp biểu lãi suất NHTM.')}
        ${grp('Tỷ giá & Tiền tệ', ['USDVND', 'DXY'])}
        ${grp('Hàng hóa', ['GOLD', 'BRENT', 'WTI'])}
        <div><div class="group-title">Dữ liệu vĩ mô định kỳ</div><div class="mgrid">${['GDP', 'CPI', 'FDI', 'IIP', 'TRADE_BAL', 'CREDIT'].map(tile).join('')}</div><div class="group-foot">Nguồn: Cục Thống kê, Cục Đầu tư nước ngoài, Cục Hải quan, NHNN — cập nhật theo kỳ công bố, thu thập qua vnstock.</div></div>
      </div></div>`;
    F.chart.line($('#onc'), { labels: F.series(F.ind('ON_RATE'), '1M').labels, values: F.series(F.ind('ON_RATE'), '1M').values, dec: 2, height: 150, suffix: '%', label: 'Lãi suất qua đêm 1 tháng' });
  };

  /* ================= R10 · Chi tiết chỉ số ================= */
  pages.indicator = () => {
    const ind = F.ind(F.param('id')) || F.ind('VNINDEX'); const from = F.report(F.param('from'));
    const macro = ind.group === 'macro';
    const v = F.shell({ bar: 'back', back: from ? 'reader/report.html?id=' + from.id : macro || ['rate', 'fx', 'commodity'].includes(ind.group) ? 'reader/macro.html' : 'reader/market.html', title: F.shortName(ind), side: ind.group === 'equity' ? 'market' : 'macro', right: `<button class="icon-btn" id="shr" aria-label="Chia sẻ">${I('share')}</button>` });
    let range = macro ? null : '1M';
    const rel = F.reportsOfInd(ind.id);
    v.innerHTML = `${from ? `<div class="page" style="padding-top:4px"><a class="note accent" href="${F.url('reader/report.html?id=' + from.id)}">${I('arrowL')}<span class="grow">Từ bài nghiên cứu: <b>${F.esc(from.title)}</b></span></a></div>` : ''}
      <div style="padding:10px var(--gutter) 0"><span class="tag">${F.GROUP[ind.group]}</span></div>${quoteHead(ind)}
      <div class="ind-acts"><button class="btn btn-sm ${F.me() && F.me().watch.includes(ind.id) ? 'btn-soft on' : 'btn-gray'}" id="wt">${I(F.me() && F.me().watch.includes(ind.id) ? 'check' : 'plus')}Theo dõi</button><button class="btn btn-sm ${F.me() && F.me().pins.some((p) => p.i === ind.id) ? 'btn-soft on' : 'btn-gray'}" id="pn">${I('pin')}Ghim biểu đồ</button></div>
      ${macro ? '' : `<div class="range" id="rg"></div>`}<div class="chart-box"><div id="ch"></div></div>
      <div class="delay-note mt-8">${I('clock')}<span>${F.esc(ind.freq)} · ${ind.group === 'equity' ? 'trễ 15 phút · ' : ''}Nguồn: ${F.esc(ind.source)} · thu thập qua vnstock (${F.esc(ind.vn.src)}) · số liệu minh họa</span></div>
      ${ind.vn && !ind.vn.ok ? `<div class="page mt-8"><div class="note warn">${I('alert')}<span>Nguồn dữ liệu đang gián đoạn. Đang hiển thị <b>giá trị gần nhất</b> (đồng bộ ${F.ago(ind.vn.lastSync)}).</span></div></div>` : ''}
      <div style="padding:6px var(--gutter) 0"><button class="btn-text small" id="dsrc">${I('info', 'i-xs')} Nguồn & điều kiện sử dụng dữ liệu</button></div>
      <div class="page mt-16"><div class="stat-grid" id="sg"></div></div>
      <div class="sec"><h2>Bài nghiên cứu phân tích chỉ số này</h2><p>${rel.length} bài</p></div>
      <div style="padding:0 var(--gutter) 6px"><div class="row small muted">${I('sparkles', 'i-sm accent')}<span>Liên kết tự động bởi Vertex AI khi xuất bản, đã được biên tập viên kiểm duyệt.</span></div></div>
      ${rel.length ? rel.map((r) => F.postCompact(r)).join('') : F.empty('file', 'Chưa có bài nghiên cứu liên quan', 'FBV sẽ tự động gợi ý khi có bài nghiên cứu phân tích chỉ số này.')}
      <div class="page">${F.disclaimer()}</div>`;
    $('#dsrc').onclick = () => F.modal({ title: 'Nguồn dữ liệu', body: `<div class="group plain"><div class="gi noicon"><span class="gl">Đơn vị công bố</span><span class="gv">${F.esc(ind.source)}</span></div><div class="gi noicon"><span class="gl">Tần suất</span><span class="gv">${F.esc(ind.freq)}</span></div><div class="gi noicon"><span class="gl">Độ trễ</span><span class="gv">${ind.group === 'equity' ? 'Tối thiểu 15 phút' : 'Theo kỳ công bố'}</span></div><div class="gi noicon"><span class="gl">Cập nhật gần nhất</span><span class="gv">${F.date(ind.vn.lastSync, true)}</span></div></div><p class="hint mt-8">Dữ liệu chỉ để tham khảo cho mục đích nghiên cứu, không phải dữ liệu thời gian thực và không dùng để ra quyết định giao dịch. FBV hiển thị dữ liệu theo thỏa thuận với nhà cung cấp dữ liệu được cấp phép.</p>`, actions: [{ label: 'Đóng', cls: 'btn-primary' }] });
    const draw = () => {
      if (macro) {
        F.chart.bar($('#ch'), { labels: ind.series.labels, values: ind.series.values, dec: ind.dec, height: 230, highlightLast: true, mode: ind.series.values.some((x) => x < 0) ? 'posneg' : '', suffix: ind.unit.startsWith('%') ? '%' : ' ' + ind.unit, label: ind.name });
        $('#sg').innerHTML = `<div><span>Kỳ gần nhất</span><b>${F.esc(ind.period)}</b></div><div><span>Kỳ trước (${F.esc(ind.prevLabel)})</span><b class="num">${F.num(ind.prev, ind.dec)}</b></div><div><span>Tần suất</span><b>${F.esc(ind.freq)}</b></div><div><span>Nguồn</span><b>${F.esc(ind.source)}</b></div>`;
        return;
      }
      $('#rg').innerHTML = ['1D', '1W', '1M', '1Y'].map((x) => `<button class="${range === x ? 'on' : ''}" data-r="${x}">${x}</button>`).join('');
      $$('#rg [data-r]').forEach((b) => (b.onclick = () => { range = b.dataset.r; draw(); }));
      const s = F.series(ind, range);
      F.chart.line($('#ch'), { labels: s.labels, values: s.values, dec: ind.dec, height: 230, ref: range === '1D' ? ind.prev : null, suffix: ind.unit === '%' ? '%' : '', label: ind.name });
      $('#sg').innerHTML = `<div><span>Kỳ trước / tham chiếu</span><b class="num">${F.fmtVal(ind, ind.prev)}</b></div><div><span>Đơn vị</span><b>${F.esc(ind.unit)}</b></div><div><span>Cao nhất (${range})</span><b class="num">${F.num(Math.max(...s.values), ind.dec)}</b></div><div><span>Thấp nhất (${range})</span><b class="num">${F.num(Math.min(...s.values), ind.dec)}</b></div><div><span>Tần suất</span><b>${F.esc(ind.freq)}</b></div><div><span>Nguồn</span><b style="font-size:14px">${F.esc(ind.source)}</b></div>`;
    };
    draw();
    $('#shr').onclick = () => F.shareSheet(ind.name, location.href);
    $('#wt').onclick = () => { const on = F.toggleWatch(ind.id); if (on === null) return; const b = $('#wt'); b.className = 'btn btn-sm ' + (on ? 'btn-soft on' : 'btn-gray'); b.innerHTML = I(on ? 'check' : 'plus') + 'Theo dõi'; };
    $('#pn').onclick = () => { const on = F.togglePin(ind.id, range); if (on === null) return; $('#pn').className = 'btn btn-sm ' + (on ? 'btn-soft on' : 'btn-gray'); };
  };
})();
