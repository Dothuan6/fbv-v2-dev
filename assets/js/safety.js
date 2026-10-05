/* =========================================================
   FBV v3.3 — AN TOÀN NỘI DUNG & QUYỀN HỆ THỐNG (theo tiêu chí App Store)
   Lọc nội dung (1.2) · Báo cáo dùng chung (1.2) · Chặn thành viên phòng
   Xin quyền thông báo có giải thích (4.5.4) · Ẩn xem trước push · Quyền micro/camera/ảnh (5.1.1)
   Đồng ý AI bên thứ ba (5.1.2) · Kiểm duyệt ảnh tải lên
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {});
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const I = F.icon; const esc = F.esc; const now = () => new Date().toISOString();
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  /* ---------------- Lọc nội dung trước khi đăng (mô phỏng bộ lọc phía máy chủ) ---------------- */
  const RULES = [
    ['Ngôn từ xúc phạm', /\b(dm|dkm|vcl|vl|do ngu|ngu vai|oc cho|khon nan|mat day|thang cho|con cho)\b/],
    ['Quảng cáo / lôi kéo đầu tư', /(phim hang|nhom zalo|room vip|cam ket loi nhuan|lai \d+% moi (ngay|tuan|thang)|bao lo|keo telegram|t\.me\/|zalo\.me\/)/],
    ['Khuyến nghị mua/bán trái quy định', /(mua ngay ma|ban ngay ma|all in ma|mua gap|ban gap|chac chan tang|chac chan lai)/],
    ['Thông tin liên hệ cá nhân', /(\b0\d{9,10}\b|\+84\d{9,10})/]
  ];
  F.filterText = (x) => { const n = norm(x); return RULES.filter((r) => r[1].test(n)).map((r) => r[0]); };
  // Trả về true nếu bị chặn (đã hiện thông báo)
  F.blockedText = (x, where) => {
    const hits = F.filterText(x); if (!hits.length) return false;
    F.modal({ title: 'Nội dung chưa thể gửi', body: `<div class="stack"><div class="note warn">${I('shield')}<span>Bộ lọc của FBV phát hiện: <b>${hits.join(', ')}</b>.</span></div><p class="muted small">${where || 'Nội dung'} cần tuân thủ Quy tắc cộng đồng: không xúc phạm, không quảng cáo/lôi kéo, không khuyến nghị mua/bán, không để lộ thông tin liên hệ cá nhân. Vui lòng chỉnh sửa rồi gửi lại.</p><a class="link small" href="${F.url('reader/terms.html')}">Xem Điều khoản & Quy tắc cộng đồng</a></div>`, actions: [{ label: 'Chỉnh sửa', cls: 'btn-primary' }] });
    return true;
  };
  // Kiểm duyệt ảnh/tệp tải lên (mô phỏng): tên tệp gợi ý nội dung không phù hợp → từ chối
  F.blockedFile = (name) => /(nsfw|18\+|xxx|nude|sex|gore|bao[-_ ]?luc)/.test(norm(name));

  /* ---------------- Báo cáo dùng chung (tin nhắn, phiên, hồ sơ, phòng, cuộc gọi, ảnh bìa) ---------------- */
  const REASONS = { default: ['Ngôn từ xúc phạm / quấy rối', 'Spam hoặc quảng cáo', 'Khuyến nghị mua/bán trái quy định', 'Thông tin sai lệch có chủ đích', 'Khác'], profile: ['Mạo danh / thông tin hồ sơ sai', 'Ảnh hoặc nội dung phản cảm', 'Quảng cáo, thông tin liên hệ trên hồ sơ', 'Bằng cấp/chứng chỉ đáng ngờ', 'Khác'], call: ['Hành vi quấy rối trong cuộc gọi', 'Nội dung phản cảm', 'Lôi kéo đầu tư / bán hàng', 'Ghi âm, ghi hình trái phép', 'Khác'] };
  F.reportSheet = ({ type, ref, target, what, title, block, after }) => {
    if (!F.requireAuth('Đăng nhập để gửi báo cáo tới đội kiểm duyệt FBV.')) return;
    const me = F.me(); const list = REASONS[type] || REASONS.default;
    F.modal({ title: title || 'Báo cáo vi phạm', body: `<div class="stack">${what ? `<div class="msg-peek">${esc(what).slice(0, 200)}</div>` : ''}<div class="group">${list.map((x, i) => `<label class="gi noicon"><span class="gl" style="font-weight:500">${x}</span><input type="radio" name="rr" value="${x}" ${i ? '' : 'checked'}></label>`).join('')}</div><div class="field"><label for="rpd">Mô tả thêm (không bắt buộc)</label><textarea class="textarea" id="rpd" style="min-height:70px" maxlength="500"></textarea></div>${block ? `<label class="checkbox"><input type="checkbox" id="rpb" checked>${block}</label>` : ''}<p class="hint">Đội kiểm duyệt FBV xử lý trong 24 giờ: gỡ nội dung và khóa tài khoản vi phạm. Người bị báo cáo không biết ai đã báo cáo.</p></div>`,
      actions: [{ label: 'Hủy' }, { label: 'Gửi báo cáo', cls: 'btn-danger', onClick: (c, el) => {
        F.db().moderation.unshift({ id: F.uid('m'), type, ref, reporter: me.id, target, reason: $('input[name=rr]:checked', el).value, detail: ($('#rpd', el).value.trim() || (what ? 'Nội dung: “' + String(what).slice(0, 180) + '”' : '—')), status: 'open', createdAt: now() });
        const blk = $('#rpb', el) && $('#rpb', el).checked; if (blk && target && !me.blocked.includes(target)) me.blocked.push(target);
        F.save(); F.toast('Đã gửi báo cáo · FBV sẽ xử lý trong 24 giờ'); after && after(blk);
      } }] });
  };

  /* ---------------- Hộp thoại quyền hệ thống (mô phỏng iOS) ---------------- */
  const PERM = {
    push: ['“FBV” muốn gửi thông báo cho bạn', 'Thông báo có thể gồm cảnh báo, âm thanh và biểu tượng. Bạn có thể đổi trong Cài đặt.'],
    mic: ['“FBV” muốn truy cập Micrô', 'FBV dùng micrô để bạn nói trong cuộc gọi đã hẹn với chuyên gia. FBV không ghi âm.'],
    cam: ['“FBV” muốn truy cập Camera', 'FBV dùng camera cho cuộc gọi video đã hẹn và để chụp ảnh đại diện. FBV không ghi hình.']
  };
  F.perm = (k) => (F.session().perm || {})[k];
  F.sysPermission = (k, cb) => {
    const s = F.session(); s.perm = s.perm || {};
    if (s.perm[k]) { cb && cb(s.perm[k] === 'granted'); return; }
    const bd = document.createElement('div'); bd.className = 'ios-alert-bd';
    bd.innerHTML = `<div class="ios-alert" role="alertdialog" aria-modal="true" aria-label="${PERM[k][0]}"><h4>${PERM[k][0]}</h4><p>${PERM[k][1]}</p><div class="ios-btns"><button type="button" data-p="denied">Không cho phép</button><button type="button" data-p="granted"><b>Cho phép</b></button></div><span class="ios-note">Mô phỏng hộp thoại hệ thống iOS</span></div>`;
    document.body.appendChild(bd);
    $$('[data-p]', bd).forEach((b) => (b.onclick = () => { s.perm[k] = b.dataset.p; F.save(); bd.remove(); cb && cb(b.dataset.p === 'granted'); }));
  };
  // Xin quyền thông báo: giải thích lợi ích trước, rồi mới hiện hộp thoại hệ thống (4.5.4)
  F.pushPrompt = (why, after) => {
    if (!F.isMember() || F.perm('push')) { after && after(F.perm('push') === 'granted'); return; }
    F.modal({ title: 'Bật thông báo?', body: `<div class="stack"><div class="empty" style="padding:4px 0"><div class="ico">${I('bell')}</div><p>${why || 'Nhận thông báo khi chuyên gia trả lời phản biện của bạn.'}</p></div><div class="group plain">${[['chat', 'Phản hồi phản biện', 'Khi chuyên gia trả lời bạn'], ['file', 'Bài nghiên cứu mới', 'Từ chuyên gia và lĩnh vực bạn theo dõi'], ['calendar', 'Lịch gọi & buổi trao đổi', 'Nhắc trước giờ hẹn (Premium)']].map((x) => `<div class="gi">${I(x[0])}<span class="gl" style="font-weight:600">${x[1]}<small>${x[2]}</small></span></div>`).join('')}</div><p class="hint">Không bắt buộc — bạn vẫn dùng đầy đủ FBV khi không bật. FBV không gửi quảng cáo nếu bạn chưa đồng ý riêng. Đổi bất cứ lúc nào trong Cài đặt → Thông báo.</p></div>`,
      actions: [{ label: 'Để sau', onClick: () => { after && after(false); } }, { label: 'Tiếp tục', cls: 'btn-primary', onClick: () => { setTimeout(() => F.sysPermission('push', (ok) => { F.toast(ok ? 'Đã bật thông báo' : 'Bạn đã từ chối thông báo · có thể bật lại trong Cài đặt', ok ? 'success' : 'info'); after && after(ok); }), 150); } }] });
  };

  /* ---------------- A07 · Cài đặt → Thông báo (trạng thái quyền, ẩn xem trước, tiếp thị có đồng ý riêng) ---------------- */
  const notifSheet = () => {
    const me = F.me(); const p = me.prefs; if (p.preview == null) p.preview = true; if (p.promo == null) p.promo = false;
    const st = F.perm('push');
    const row = (k, t, d) => `<label class="gi noicon"><span class="gl">${t}<small>${d}</small></span><span class="switch"><input type="checkbox" data-k="${k}" ${p[k] ? 'checked' : ''}><span></span></span></label>`;
    const sample = () => `<div class="push-sample"><span class="pi">${F.logoMark('logo-mark sm')}</span><div class="grow"><div class="row between"><b>FBV</b><small>bây giờ</small></div><div class="pt">${p.preview ? '<b>TS. Trần Quốc Bảo</b> · Con số 1,5 điểm % là chênh lệch lũy kế từ đầu năm…' : 'Bạn có 1 phản hồi phản biện mới'}</div></div></div>`;
    F.modal({ title: 'Thông báo', body: `<div class="note ${st === 'granted' ? 'ok' : st === 'denied' ? 'warn' : ''} mb-12" id="pst"></div>
      <div class="group-title">Thông báo đẩy</div><div class="group">${row('answer', 'Phản hồi phản biện', 'Khi chuyên gia trả lời bạn')}${row('follow', 'Chuyên gia theo dõi', 'Khi có bài nghiên cứu mới')}${row('report', 'Bài nghiên cứu theo lĩnh vực', 'Luồng bạn quan tâm')}</div>
      <div class="group-title mt-16">Quyền riêng tư trên màn hình khóa</div><div class="group">${row('preview', 'Hiện nội dung xem trước', 'Tắt để thông báo không lộ nội dung tin nhắn')}</div><div id="psm" class="mt-8"></div>
      <div class="group-title mt-16">Email & tiếp thị (cần bạn đồng ý riêng)</div><div class="group">${row('digest', 'Bản tin tuần', 'Tổng hợp nghiên cứu nổi bật')}${row('email', 'Email phản biện', 'Sao chép thông báo qua email')}${row('promo', 'Ưu đãi & gói hội viên', 'Thông báo khuyến mãi — mặc định tắt')}</div>`,
      onOpen: (el) => {
        const drawSt = () => { const s2 = F.perm('push'); $('#pst', el).className = 'note mb-12 ' + (s2 === 'granted' ? 'ok' : s2 === 'denied' ? 'warn' : ''); $('#pst', el).innerHTML = s2 === 'granted' ? `${I('checkCircle')}<span>Thông báo hệ thống: <b>Đã bật</b>.</span>` : s2 === 'denied' ? `${I('bellOff')}<span class="grow">Thông báo hệ thống: <b>Đang tắt</b>. Bật trong Cài đặt của iOS.</span><button class="btn btn-gray btn-xs" id="pos">Mở Cài đặt</button>` : `${I('bell')}<span class="grow">Bạn chưa bật thông báo hệ thống.</span><button class="btn btn-primary btn-xs" id="pon">Bật</button>`;
          const on = $('#pon', el); if (on) on.onclick = () => F.pushPrompt('', drawSt); const os = $('#pos', el); if (os) os.onclick = () => { F.session().perm.push = null; F.save(); F.toast('Mô phỏng: mở Cài đặt iOS → FBV → Thông báo', 'info'); drawSt(); }; };
        drawSt(); $('#psm', el).innerHTML = sample();
        $$('[data-k]', el).forEach((c) => (c.onchange = () => { p[c.dataset.k] = c.checked; F.save(); if (c.dataset.k === 'preview') $('#psm', el).innerHTML = sample(); }));
      } });
  };
  F.notifSheet = notifSheet;
  const wrap = (name, fn) => { const o = pages[name]; if (o) pages[name] = () => { o(); try { fn(); } catch (e) { console.error(e); } }; };
  wrap('settings', () => { const b = $('#ntf'); if (b) b.onclick = notifSheet; });
  // Hoạt động: gợi ý bật thông báo (đúng ngữ cảnh, bỏ qua được)
  wrap('notifications', () => { const me = F.me(); const nv = $('#nv'); if (!me || !nv || F.perm('push') || F.session().pushSkip) return;
    nv.insertAdjacentHTML('beforebegin', `<div class="page" id="pshB"><div class="note accent">${I('bell')}<span class="grow"><b>Bật thông báo</b><br>Biết ngay khi chuyên gia trả lời phản biện của bạn.</span><button class="btn btn-primary btn-xs" id="pshOn">Bật</button><button class="icon-btn sm" id="pshX" aria-label="Bỏ qua">${I('x')}</button></div></div>`);
    $('#pshOn').onclick = () => F.pushPrompt('', () => { if (F.perm('push')) $('#pshB').remove(); });
    $('#pshX').onclick = () => { F.session().pushSkip = true; F.save(); $('#pshB').remove(); }; });

  /* ---------------- B-12 · Đồng ý gửi câu hỏi cho AI bên thứ ba (5.1.2(i)) ---------------- */
  F.AI_PROVIDER = 'Google Cloud Vertex AI (Gemini)';
  F.aiConsent = (cb) => {
    const me = F.me(); if (me.aiConsent) { cb(); return; }
    F.modal({ title: 'Trước khi dùng Trợ lý nghiên cứu', dismissable: false, body: `<div class="stack"><p class="muted">Để trả lời, FBV gửi <b>câu hỏi của bạn</b> tới dịch vụ AI bên thứ ba:</p><div class="group plain kv">${[['Nhà cung cấp', F.AI_PROVIDER], ['Dữ liệu được gửi', 'Nội dung câu hỏi'], ['Không gửi', 'Tên, email, phản biện riêng tư'], ['Mục đích', 'Tạo câu trả lời từ bài đã thẩm định']].map((x) => `<div class="gi noicon"><span class="gl">${x[0]}</span><span class="gv">${x[1]}</span></div>`).join('')}</div><div class="note">${I('shield')}<span>Nhà cung cấp không dùng câu hỏi của bạn để huấn luyện mô hình. Bạn có thể rút lại đồng ý trong Cài đặt → Quyền riêng tư. Câu trả lời do AI tạo có thể sai — luôn kiểm tra nguồn.</span></div><a class="link small" href="${F.url('reader/privacy.html')}">Chính sách bảo mật</a></div>`,
      actions: [{ label: 'Không đồng ý', onClick: () => { F.toast('Bạn chưa đồng ý nên Trợ lý chưa thể trả lời', 'info'); } }, { label: 'Đồng ý & tiếp tục', cls: 'btn-primary', onClick: () => { me.aiConsent = now(); F.save(); cb(); } }] });
  };

  /* ---------------- A-06 · Ảnh đại diện: bộ chọn hệ thống & quyền camera ---------------- */
  wrap('profileEdit', () => {
    const cam = $('#cam'); if (cam) cam.onclick = () => F.menu([
      { icon: 'camera', label: 'Chụp ảnh', onClick: () => F.sysPermission('cam', (ok) => F.toast(ok ? 'Mô phỏng: mở camera' : 'Chưa có quyền camera · bạn vẫn có thể chọn ảnh từ thư viện', ok ? 'info' : 'error')) },
      { icon: 'image', label: 'Chọn từ thư viện', onClick: () => F.toast('Mô phỏng: mở bộ chọn ảnh của hệ thống (không cần cấp quyền thư viện)', 'info') },
      { icon: 'trash', label: 'Xóa ảnh hiện tại', danger: true, onClick: () => F.toast('Đã xóa ảnh đại diện', 'info') }], 'Ảnh đại diện');
    const sv = $('#sv'); if (sv) { const old = sv.onclick; sv.onclick = (e) => { if (F.blockedText([$('#nm').value, $('#hd').value, $('#bio').value].join(' '), 'Tên hiển thị và phần giới thiệu')) return; old && old(e); }; }
  });
  // Quyền riêng tư: rút đồng ý AI
  wrap('settings', () => { const prv = $('#prv'); const me = F.me(); if (!prv || !me) return; const old = prv.onclick;
    prv.onclick = () => { old(); const g = document.querySelector('.backdrop:last-of-type .sheet-body .group'); if (!g) return;
      g.insertAdjacentHTML('beforeend', `<label class="gi">${I('bot')}<span class="gl">Trợ lý AI bên thứ ba<small>${me.aiConsent ? 'Đã đồng ý gửi câu hỏi tới ' + F.AI_PROVIDER : 'Chưa đồng ý'}</small></span><span class="switch"><input type="checkbox" id="aic" ${me.aiConsent ? 'checked' : ''}><span></span></span></label>`);
      const c = g.querySelector('#aic'); c.onchange = () => { if (c.checked) { c.checked = false; document.querySelector('.backdrop:last-of-type [data-x]').click(); F.aiConsent(() => F.toast('Đã đồng ý dùng Trợ lý AI')); } else { me.aiConsent = null; me.ai = []; F.save(); F.toast('Đã rút đồng ý và xóa lịch sử hỏi đáp', 'info'); } }; }; });
})();
