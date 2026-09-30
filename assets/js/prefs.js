/* =========================================================
   FBV v3.2 — TÙY CHỌN CÁ NHÂN & CHIA SẺ
   I1 Phông/cỡ chữ trình đọc · I2 Ngôn ngữ giao diện (Tiếng Việt / English)
   D2 Mã QR chia sẻ hồ sơ chuyên gia / bài nghiên cứu · H1 Ảnh bìa hồ sơ chuyên gia
   ========================================================= */
(function () {
  const F = window.FBV; const $ = F.$, $$ = F.$$; const I = F.icon; const esc = F.esc;
  const ls = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* ---------------- I1 · Trình đọc ---------------- */
  const SIZES = [[16, 'Nhỏ'], [18, 'Vừa'], [19, 'Mặc định'], [21, 'Lớn'], [23, 'Rất lớn']];
  const FONTS = [['serif', 'Spectral (có chân)', 'var(--serif)'], ['sans', 'Inter (không chân)', 'var(--font)']];
  F.readerPrefs = () => { try { return Object.assign({ font: 'serif', size: 2 }, JSON.parse(ls.get('fbv-reader', '{}'))); } catch (e) { return { font: 'serif', size: 2 }; } };
  const applyReader = () => { const p = F.readerPrefs(); const h = document.documentElement; h.style.setProperty('--rd-fs', SIZES[p.size][0] + 'px'); h.dataset.rfont = p.font; };
  applyReader();
  F.readerSheet = () => {
    let p = F.readerPrefs();
    F.modal({ title: 'Phông & cỡ chữ trình đọc', body: `<div class="stack"><div class="seg full" id="rf">${FONTS.map((f) => `<button type="button" data-f="${f[0]}" class="${p.font === f[0] ? 'on' : ''}" style="font-family:${f[2]}">${f[1]}</button>`).join('')}</div>
      <div class="row" style="gap:12px"><button type="button" class="icon-btn" id="rs-" aria-label="Giảm cỡ chữ" style="font-size:14px;font-weight:700">A−</button><input type="range" min="0" max="${SIZES.length - 1}" step="1" id="rsz" value="${p.size}" class="grow" aria-label="Cỡ chữ"><button type="button" class="icon-btn" id="rs+" aria-label="Tăng cỡ chữ" style="font-size:19px;font-weight:700">A+</button></div>
      <div class="small faint center" id="rsl"></div>
      <div class="rd-preview prose" id="rpv" style="margin-top:0">Chênh lệch giữa tăng trưởng tín dụng và huy động vốn là một chỉ báo sớm cho áp lực thanh khoản của hệ thống ngân hàng.</div>
      <p class="hint">Áp dụng cho trình đọc bài nghiên cứu trên thiết bị này.</p></div>`,
      actions: [{ label: 'Khôi phục mặc định', onClick: () => { ls.set('fbv-reader', '{}'); applyReader(); F.toast('Đã khôi phục mặc định'); } }, { label: 'Xong', cls: 'btn-primary' }],
      onOpen: (el) => {
        const upd = () => { ls.set('fbv-reader', JSON.stringify(p)); applyReader(); $('#rsl', el).textContent = SIZES[p.size][1] + ' · ' + SIZES[p.size][0] + 'px'; $('#rsz', el).value = p.size; $$('#rf [data-f]', el).forEach((b) => b.classList.toggle('on', b.dataset.f === p.font)); };
        $$('#rf [data-f]', el).forEach((b) => (b.onclick = () => { p.font = b.dataset.f; upd(); }));
        $('#rsz', el).oninput = () => { p.size = +$('#rsz', el).value; upd(); };
        $('#rs-', el).onclick = () => { p.size = Math.max(0, p.size - 1); upd(); };
        $('#rs\\+', el).onclick = () => { p.size = Math.min(SIZES.length - 1, p.size + 1); upd(); };
        upd();
      } });
  };
  F.readerLabel = () => { const p = F.readerPrefs(); return (p.font === 'serif' ? 'Spectral' : 'Inter') + ' · ' + SIZES[p.size][0] + 'px'; };

  /* ---------------- I2 · Ngôn ngữ giao diện ---------------- */
  F.lang = () => ls.get('fbv-lang', 'vi');
  const EN = {
    'Trang chủ': 'Home', 'Làm việc': 'Workspace', 'Thị trường': 'Markets', 'Phản biện': 'Inquiries', 'Hoạt động': 'Activity', 'Tìm kiếm': 'Search',
    'Làm việc của tôi': 'My workspace', 'Thư viện': 'Library', 'Vĩ mô & Tiền tệ': 'Macro & Monetary', 'Phản biện 1:1': '1:1 Inquiries', 'Hồ sơ': 'Profile',
    'Cài đặt': 'Settings', 'Đăng nhập': 'Sign in', 'Đăng nhập / Đăng ký': 'Sign in / Sign up', 'Nâng cấp Premium': 'Upgrade to Premium', 'Trợ lý AI': 'AI assistant', 'Trợ lý nghiên cứu': 'Research assistant',
    'Không gian làm việc': 'Workspace', 'Đã lưu': 'Saved', 'Lịch sử đọc': 'Reading history', 'Bộ nhớ & tải xuống': 'Storage & downloads', 'Tài khoản': 'Account',
    'Giao diện': 'Appearance', 'Thông báo': 'Notifications', 'Gói hội viên': 'Membership', 'Nội dung quan tâm': 'Interests', 'Ngôn ngữ': 'Language', 'Quyền riêng tư': 'Privacy',
    'Hỗ trợ': 'Support', 'Góp ý': 'Feedback', 'Điều khoản & chính sách': 'Terms & policies', 'Đăng xuất': 'Sign out', 'Trình đọc': 'Reader', 'Nhật ký nghiên cứu': 'Research journal',
    'Đăng ký chuyên gia': 'Become an expert', 'Hồ sơ chuyên gia': 'Expert profile', 'Tối': 'Dark', 'Sáng': 'Light', 'Theo hệ thống': 'System', 'Miễn phí': 'Free',
    'Tiếng Việt': 'Vietnamese', 'Chỉnh sửa hồ sơ': 'Edit profile', 'Chia sẻ': 'Share', 'Theo dõi': 'Follow', 'Đang theo dõi': 'Following', 'Bài nghiên cứu': 'Research', 'Giới thiệu': 'About',
    'Danh mục theo dõi': 'Watchlist', 'Biểu đồ đã ghim': 'Pinned charts', 'Thư viện & hoạt động': 'Library & activity', 'Chuyên gia': 'Expert', 'Cá nhân': 'Personal',
    'Phòng trao đổi kín': 'Private rooms', 'Tất cả': 'All', 'Sắp diễn ra': 'Upcoming', 'Đã diễn ra': 'Past', 'Xong': 'Done', 'Hủy': 'Cancel', 'Lưu': 'Save', 'Đóng': 'Close', 'Gửi': 'Send',
    'Dành cho bạn': 'For you', 'Mới nhất': 'Latest', 'Vĩ mô': 'Macro', 'Vi mô': 'Micro', 'Fintech': 'Fintech', 'Tùy chọn': 'Options'
  };
  const tr = (root) => {
    if (F.lang() !== 'en') return;
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && !n.parentElement.closest('.prose,.bub,.post,.quote-card,textarea,script,style,[data-notr]') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach((n) => { const t = n.nodeValue.trim(); if (t && EN[t]) n.nodeValue = n.nodeValue.replace(t, EN[t]); });
  };
  F.translate = tr;
  document.addEventListener('DOMContentLoaded', () => {
    if (F.lang() !== 'en') return;
    document.documentElement.lang = 'en'; tr(document.body);
    let pend = false; new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; tr(document.body); }); }).observe(document.body, { childList: true, subtree: true });
  });
  F.langSheet = () => F.modal({ title: 'Ngôn ngữ / Language', body: `<div class="group">${[['vi', 'Tiếng Việt', 'Mặc định'], ['en', 'English', 'Giao diện tiếng Anh · bản xem trước']].map((l) => `<label class="gi noicon" data-notr><span class="gl">${l[1]}<small>${l[2]}</small></span><input type="radio" name="lg" value="${l[0]}" ${F.lang() === l[0] ? 'checked' : ''}></label>`).join('')}</div><p class="hint mt-8" data-notr>Chỉ đổi ngôn ngữ giao diện (menu, nút, tiêu đề). Nội dung bài nghiên cứu, dữ liệu và trao đổi phản biện giữ nguyên ngôn ngữ gốc của tác giả.</p>`,
    onOpen: (el, close) => $$('input[name=lg]', el).forEach((r) => (r.onchange = () => { ls.set('fbv-lang', r.value); close(); F.toast(r.value === 'en' ? 'Interface language: English' : 'Đã chuyển sang Tiếng Việt'); setTimeout(() => location.reload(), 400); })) });

  /* ---------------- D2 · Mã QR chia sẻ ---------------- */
  const absUrl = (p) => new URL(F.url(p), location.href).href;
  F.qrSvg = (text, cell) => { if (!window.qrcode) return ''; const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: cell || 5, margin: (cell || 5) * 2, scalable: true, title: 'Mã QR' }); };
  F.qrSheet = ({ kind, title, sub, path, person }) => {
    const url = absUrl(path);
    F.modal({ title: kind === 'expert' ? 'Mã QR hồ sơ chuyên gia' : 'Mã QR bài nghiên cứu', body: `<div class="qr-card"><div class="qr-head">${person ? F.avatar(person, 'md') : F.logoMark('logo-mark')}<div class="grow"><b>${esc(title)}</b><small>${esc(sub || '')}</small></div></div><div class="qr-box" id="qrb">${F.qrSvg(url, 5)}</div><div class="qr-foot">${F.logoMark('logo-mark sm')}<span>Quét bằng camera điện thoại để mở trên FBV</span></div></div><div class="qr-url small faint mt-8">${esc(url)}</div><p class="hint mt-8">Dùng khi thuyết trình, hội thảo hoặc in trên tài liệu. Người chưa cài app sẽ mở bản web.</p>`,
      actions: [{ label: 'Sao chép liên kết', onClick: () => { try { navigator.clipboard.writeText(url); } catch (e) {} F.toast('Đã sao chép liên kết'); return false; } }, { label: 'Lưu ảnh QR', cls: 'btn-primary', onClick: () => { const svg = $('#qrb svg'); if (!svg) return; const b = new Blob([svg.outerHTML.replace('<svg ', '<svg style="background:#fff" ')], { type: 'image/svg+xml' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'fbv-qr-' + (kind || 'link') + '.svg'; document.body.appendChild(a); a.click(); a.remove(); F.toast('Đã lưu ảnh mã QR'); return false; } }] });
  };
  F.qrExpert = (e) => F.qrSheet({ kind: 'expert', title: e.name, sub: e.title + (e.verified ? ' · Verified by FBV' : ''), path: 'reader/expert.html?id=' + e.id, person: e });
  F.qrReport = (r) => F.qrSheet({ kind: 'report', title: r.title, sub: F.expert(r.author).name + ' · ' + F.STREAM_S[r.stream], path: 'reader/report.html?id=' + r.id });

  /* ---------------- H1 · Ảnh bìa hồ sơ chuyên gia ---------------- */
  const COVERS = { navy: ['#00254F', '#0D86B8'], purple: ['#3B0A73', '#6C06C8'], gold: ['#7A5A00', '#FE8C10'], cyan: ['#0B5E75', '#1BACCE'], ink: ['#0B1426', '#2A3A55'] };
  F.COVERS = COVERS;
  const coverBg = (c) => (c && c.startsWith && c.startsWith('data:') ? `url(${c}) center/cover` : `linear-gradient(120deg, ${(COVERS[c] || COVERS.navy)[0]}, ${(COVERS[c] || COVERS.navy)[1]})`);
  const pattern = `<svg viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,120 60,110 120,118 180,92 240,98 300,70 360,78 420,52 480,60 540,34 600,40" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2.5"/><polyline points="0,140 80,132 160,136 240,120 320,124 400,104 480,110 600,90" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2"/></svg>`;
  F.coverBanner = (e, edit) => `<div class="prof-cover" style="background:${coverBg(e.cover)}">${e.cover && String(e.cover).startsWith('data:') ? '' : pattern}${edit ? `<button type="button" class="cover-edit" id="cvEdit" aria-label="Đổi ảnh bìa">${I('camera', 'i-sm')}Ảnh bìa</button>` : ''}</div>`;
  const shrink = (file, max) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / img.width); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.7)); }; img.onerror = rej; img.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); });
  F.coverSheet = (e, after) => F.modal({ title: 'Ảnh bìa hồ sơ chuyên gia', body: `<div class="cover-grid">${Object.keys(COVERS).map((k) => `<button type="button" class="cv ${e.cover === k ? 'on' : ''}" data-cv="${k}" style="background:${coverBg(k)}" aria-label="Mẫu ${k}"></button>`).join('')}</div>
    <label class="upload-box mt-12" for="cvf">${I('upload')}<span><b>Tải ảnh lên</b><small>JPG/PNG · tỷ lệ 3:1 · tối đa 5 MB</small></span></label><input type="file" id="cvf" accept=".jpg,.jpeg,.png,.webp" hidden>
    <p class="hint mt-8">Ảnh bìa hiển thị trên hồ sơ công khai. Không dùng ảnh chứa thông tin liên hệ, quảng cáo hoặc logo tổ chức khác khi chưa được phép — FBV có thể gỡ ảnh vi phạm.</p>`,
    onOpen: (el, close) => {
      $$('[data-cv]', el).forEach((b) => (b.onclick = () => { e.cover = b.dataset.cv; F.save(); close(); F.toast('Đã cập nhật ảnh bìa'); after && after(); }));
      $('#cvf', el).onchange = () => { const f = $('#cvf', el).files[0]; if (!f) return; if (f.size > 5 * 1024 * 1024) { F.toast('Ảnh vượt quá 5 MB', 'error'); return; } shrink(f, 900).then((d) => { e.cover = d; F.save(); close(); F.toast('Đã tải ảnh bìa lên'); after && after(); }, () => F.toast('Không đọc được ảnh', 'error')); };
    } });
})();
