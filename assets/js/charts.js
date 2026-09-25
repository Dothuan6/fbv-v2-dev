/* =========================================================
   FBV v2 Prototype — Biểu đồ SVG nhẹ (không phụ thuộc thư viện)
   line (crosshair + tooltip) · bar (tooltip từng cột) · sparkline
   ========================================================= */
(function () {
  const FBV = (window.FBV = window.FBV || {});
  const C = { up: '#15803D', down: '#DC2626', ref: '#B7860B', primary: '#1877F2', grid: '#E3E6EB', text: '#7F8896', surface: '#FFFFFF' };
  const colorOf = (d) => (d === 'up' ? C.up : d === 'down' ? C.down : C.primary);

  function niceTicks(min, max, count = 4) {
    if (min === max) { const p = Math.abs(min) * 0.01 || 1; min -= p; max += p; }
    const span = max - min; const step0 = span / count; const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count + .5) || mag * 10;
    const lo = Math.floor(min / step) * step; const hi = Math.ceil(max / step) * step; const t = [];
    for (let v = lo; v <= hi + step / 2; v += step) t.push(+v.toFixed(10));
    return t;
  }
  const decFor = (ticks, dec) => { const st = Math.abs((ticks[1] || 0) - (ticks[0] || 0)); if (Math.abs(st - Math.round(st)) < 1e-9 && st >= 1) return 0; return st >= 1 ? 1 : st >= 0.1 ? Math.max(1, Math.min(dec, 1)) : 2; };

  function observe(el, render) {
    let w = 0; render();
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 4) { w = el.clientWidth; render(); } }); ro.observe(el); w = el.clientWidth; }
  }

  /* ---------- Line / area ---------- */
  function line(el, o) {
    const h = o.height || 280; el.classList.add('chart'); el.style.height = h + 'px';
    const render = () => {
      const W = Math.max(el.clientWidth || 600, 260); const pad = { l: 6, r: 58, t: 14, b: 26 };
      const vals = o.values; const n = vals.length;
      const all = o.ref != null ? vals.concat([o.ref]) : vals;
      let mn = Math.min(...all), mx = Math.max(...all); const pd = (mx - mn) * .08 || Math.abs(mx) * .01 || 1; mn -= pd; mx += pd;
      const ticks = niceTicks(mn, mx, 4); const y0 = ticks[0], y1 = ticks[ticks.length - 1]; const td = decFor(ticks, o.dec);
      const X = (i) => pad.l + (i / Math.max(n - 1, 1)) * (W - pad.l - pad.r);
      const Y = (v) => pad.t + (1 - (v - y0) / (y1 - y0 || 1)) * (h - pad.t - pad.b);
      const dir = o.dir || (vals[n - 1] > (o.ref != null ? o.ref : vals[0]) ? 'up' : vals[n - 1] < (o.ref != null ? o.ref : vals[0]) ? 'down' : 'ref');
      const col = o.color || colorOf(dir); const gid = 'g' + Math.random().toString(36).slice(2, 7);
      const pts = vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
      const xIdx = []; const k = Math.min(5, n); for (let j = 0; j < k; j++) xIdx.push(Math.round((j / (k - 1 || 1)) * (n - 1)));
      el.innerHTML = `<svg viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="${FBV.esc(o.label || 'Biểu đồ')}">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".18"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
        <g class="grid">${ticks.map((t) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(t)}" y2="${Y(t)}"/>`).join('')}</g>
        <g class="axis">${ticks.map((t) => `<text x="${W - pad.r + 8}" y="${Y(t) + 4}">${FBV.num(t, td)}</text>`).join('')}${xIdx.map((i, j) => `<text x="${X(i)}" y="${h - 6}" text-anchor="${j === 0 ? 'start' : j === xIdx.length - 1 ? 'end' : 'middle'}">${FBV.esc(o.labels[i])}</text>`).join('')}</g>
        ${o.ref != null ? `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" stroke="${C.ref}" stroke-dasharray="4 4" stroke-width="1.2"/><text x="${W - pad.r - 4}" y="${Y(o.ref) - 5}" text-anchor="end" fill="${C.ref}" font-size="11" font-weight="600">${o.refLabel || 'Tham chiếu'} ${FBV.num(o.ref, o.dec)}</text>` : ''}
        <polygon points="${pts} ${X(n - 1)},${h - pad.b} ${X(0)},${h - pad.b}" fill="url(#${gid})"/>
        <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${X(n - 1)}" cy="${Y(vals[n - 1])}" r="4" fill="${col}" stroke="#fff" stroke-width="2"/>
        <g class="hov" style="display:none"><line class="cx" y1="${pad.t}" y2="${h - pad.b}" stroke="#94A3B8" stroke-width="1"/><circle class="cd" r="5" fill="${col}" stroke="#fff" stroke-width="2"/></g>
        <rect x="${pad.l}" y="0" width="${W - pad.l - pad.r}" height="${h}" fill="transparent" class="hit"/></svg><div class="tip"></div>`;
      const svg = el.querySelector('svg'), hov = el.querySelector('.hov'), tip = el.querySelector('.tip');
      const move = (e) => {
        const r = svg.getBoundingClientRect(); const x = (e.clientX - r.left) * (W / r.width);
        const i = Math.max(0, Math.min(n - 1, Math.round(((x - pad.l) / (W - pad.l - pad.r)) * (n - 1))));
        hov.style.display = ''; hov.querySelector('.cx').setAttribute('x1', X(i)); hov.querySelector('.cx').setAttribute('x2', X(i));
        hov.querySelector('.cd').setAttribute('cx', X(i)); hov.querySelector('.cd').setAttribute('cy', Y(vals[i]));
        const base = o.ref != null ? o.ref : vals[0]; const ch = vals[i] - base; const d = FBV.dir(ch);
        tip.innerHTML = `<div style="color:#93A6C2">${FBV.esc(o.labels[i])}</div><b class="num">${FBV.num(vals[i], o.dec)}${o.suffix || ''}</b> <span class="num" style="color:${d === 'up' ? '#4ADE80' : d === 'down' ? '#F87171' : '#FACC15'}">${FBV.arrow(ch)} ${FBV.signed(ch, o.dec)}</span>`;
        tip.style.left = Math.min(Math.max((X(i) / W) * r.width, 70), r.width - 70) + 'px'; tip.style.top = (Y(vals[i]) / h) * r.height - 12 + 'px'; tip.classList.add('show');
      };
      svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move);
      svg.addEventListener('pointerleave', () => { hov.style.display = 'none'; tip.classList.remove('show'); });
    };
    observe(el, render);
  }

  /* ---------- Bar (dọc, hỗ trợ âm/dương) ---------- */
  function barPath(x, yBase, yEnd, w, r) {
    const up = yEnd < yBase; const hgt = Math.abs(yBase - yEnd); r = Math.min(r, hgt, w / 2);
    if (hgt < .5) return `M${x},${yBase}h${w}`;
    return up ? `M${x},${yBase}V${yEnd + r}Q${x},${yEnd} ${x + r},${yEnd}H${x + w - r}Q${x + w},${yEnd} ${x + w},${yEnd + r}V${yBase}Z`
      : `M${x},${yBase}V${yEnd - r}Q${x},${yEnd} ${x + r},${yEnd}H${x + w - r}Q${x + w},${yEnd} ${x + w},${yEnd - r}V${yBase}Z`;
  }
  function bar(el, o) {
    const h = o.height || 240; el.classList.add('chart'); el.style.height = h + 'px';
    const render = () => {
      const W = Math.max(el.clientWidth || 600, 240); const pad = { l: 6, r: o.axis === false ? 6 : 50, t: o.showValues ? 22 : 12, b: 26 };
      const vals = o.values; const n = vals.length;
      let mn = Math.min(0, ...vals), mx = Math.max(0, ...vals);
      const ticks = niceTicks(mn, mx, 4); const y0 = ticks[0], y1 = ticks[ticks.length - 1]; const td = decFor(ticks, o.dec);
      const band = (W - pad.l - pad.r) / n; const bw = Math.max(4, Math.min(band * .62, 46));
      const Y = (v) => pad.t + (1 - (v - y0) / (y1 - y0 || 1)) * (h - pad.t - pad.b);
      const colFor = (v, i) => (o.mode === 'posneg' ? (v >= 0 ? C.up : C.down) : o.highlightLast && i === n - 1 ? C.primary : o.color || '#7BA7E8');
      el.innerHTML = `<svg viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="${FBV.esc(o.label || 'Biểu đồ cột')}">
        <g class="grid">${ticks.map((t) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(t)}" y2="${Y(t)}" ${t === 0 ? 'style="stroke:#94A3B8"' : ''}/>`).join('')}</g>
        ${o.axis === false ? '' : `<g class="axis">${ticks.map((t) => `<text x="${W - pad.r + 8}" y="${Y(t) + 4}">${FBV.num(t, td)}</text>`).join('')}</g>`}
        <g class="axis">${o.labels.map((l, i) => (i % Math.max(1, Math.ceil(n / Math.max(2, Math.floor((W - pad.l - pad.r) / 52)))) === 0 ? `<text x="${pad.l + band * i + band / 2}" y="${h - 6}" text-anchor="middle">${FBV.esc(l)}</text>` : '')).join('')}</g>
        ${vals.map((v, i) => { const x = pad.l + band * i + (band - bw) / 2; return `<path d="${barPath(x, Y(0), Y(v), bw, 4)}" fill="${colFor(v, i)}"/>${o.showValues ? `<text x="${x + bw / 2}" y="${v >= 0 ? Y(v) - 6 : Y(v) + 14}" text-anchor="middle" font-size="11.5" font-weight="600" fill="#4F5866" class="num">${FBV.num(v, o.dec)}</text>` : ''}<rect class="hb" data-i="${i}" x="${pad.l + band * i}" y="${pad.t}" width="${band}" height="${h - pad.t - pad.b}" fill="transparent"/>`; }).join('')}
      </svg><div class="tip"></div>`;
      const svg = el.querySelector('svg'), tip = el.querySelector('.tip');
      svg.querySelectorAll('.hb').forEach((rc) => {
        const show = () => { const i = +rc.dataset.i; const r = svg.getBoundingClientRect(); const v = vals[i];
          tip.innerHTML = `<div style="color:#93A6C2">${FBV.esc(o.labels[i])}</div><b class="num">${o.signed ? FBV.signed(v, o.dec) : FBV.num(v, o.dec)}${o.suffix || ''}</b>`;
          tip.style.left = Math.min(Math.max(((pad.l + band * i + band / 2) / W) * r.width, 60), r.width - 60) + 'px'; tip.style.top = (Math.min(Y(v), Y(0)) / h) * r.height - 8 + 'px'; tip.classList.add('show'); rc.setAttribute('fill', 'rgba(24,119,242,.06)'); };
        rc.addEventListener('pointerenter', show); rc.addEventListener('pointerdown', show);
        rc.addEventListener('pointerleave', () => { tip.classList.remove('show'); rc.setAttribute('fill', 'transparent'); });
      });
    };
    observe(el, render);
  }

  /* ---------- Sparklines ---------- */
  function spark(vals, dir) {
    const n = vals.length; const mn = Math.min(...vals), mx = Math.max(...vals); const sp = mx - mn || 1;
    const pts = vals.map((v, i) => `${((i / (n - 1)) * 100).toFixed(2)},${(28 - ((v - mn) / sp) * 26).toFixed(2)}`).join(' ');
    const col = colorOf(dir);
    return `<svg viewBox="0 0 100 30" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true"><polyline points="${pts} 100,30 0,30" fill="${col}" opacity=".08"/><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
  }
  function sparkBars(vals) {
    const n = vals.length; const mn = Math.min(0, ...vals), mx = Math.max(0, ...vals); const sp = mx - mn || 1; const bw = 100 / n;
    const Y = (v) => 30 - ((v - mn) / sp) * 28;
    return `<svg viewBox="0 0 100 30" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">${vals.map((v, i) => `<rect x="${i * bw + bw * .2}" width="${bw * .6}" y="${Math.min(Y(v), Y(0))}" height="${Math.max(Math.abs(Y(0) - Y(v)), .6)}" fill="${i === n - 1 ? C.primary : '#BBD3F5'}"/>`).join('')}</svg>`;
  }

  FBV.chart = { line, bar, spark, sparkBars };
})();
