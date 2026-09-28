/* =========================================================
   FBV v3 Prototype — HUB (danh mục màn hình) · 404
   ========================================================= */
(function () {
  const F = window.FBV; const pages = (F.pages = F.pages || {}); const I = F.icon;
  const G = [
    ['Tài khoản & Xác thực', 'user', [['A01', 'Đăng nhập / Đăng ký (Email, Apple, Google)', 'reader/login.html'], ['A02', 'Xác thực OTP', 'reader/otp.html?e=ban.moi@example.com'], ['A03', 'Đồng ý điều khoản (EULA)', 'reader/consent.html'], ['A04', 'Onboarding · Tùy chỉnh trải nghiệm', 'reader/onboarding.html'], ['A05', 'Hồ sơ cá nhân', 'reader/account.html'], ['A06', 'Chỉnh sửa hồ sơ', 'reader/profile-edit.html'], ['A07', 'Cài đặt', 'reader/settings.html'], ['A08', 'Tài khoản', 'reader/account-info.html'], ['A09', 'Xóa tài khoản', 'reader/delete-account.html']]],
    ['Nghiên cứu & Trình đọc', 'read', [['R01', 'Research Feed · 3 luồng (Chế độ Khách)', 'reader/index.html'], ['R02', 'Tìm kiếm & bộ lọc chủ đề / tác giả', 'reader/search.html'], ['R03', 'Trình đọc báo cáo + widget chỉ số AI', 'reader/report.html?id=r5'], ['R04', 'Native PDF Viewer', 'reader/report-pdf.html?id=r5'], ['R06', 'Hồ sơ chuyên gia · Verified by FBV', 'reader/expert.html?id=e1'], ['R07', 'Thư viện · Đã lưu / Theo dõi / Đã đọc', 'reader/bookmarks.html']]],
    ['Chỉ số Vĩ mô & Thị trường', 'market', [['R08', 'Thị trường chứng khoán (VN-Index, VN30, HNX, UPCoM)', 'reader/market.html'], ['R09', 'Vĩ mô & Tiền tệ (lãi suất, tỷ giá, hàng hóa, GDP, CPI…)', 'reader/macro.html'], ['R10', 'Chi tiết chỉ số → báo cáo liên quan (AI)', 'reader/indicator.html?id=ON_RATE']]],
    ['Phản biện 1:1 & Hoạt động', 'chat', [['R05', 'Trích dẫn & gửi phản biện (bôi đen trong bài)', 'reader/report.html?id=r6'], ['R12', 'Danh sách phản biện (Chat)', 'reader/inquiries.html'], ['R13', 'Phiên 1:1 kín · Báo cáo / Chặn', 'reader/inquiry.html?id=q1'], ['R11', 'Hoạt động (thông báo)', 'reader/notifications.html']]],
    ['Pháp lý', 'file', [['L01', 'Điều khoản sử dụng (EULA)', 'reader/terms.html'], ['L02', 'Chính sách bảo mật', 'reader/privacy.html'], ['L03', 'Miễn trừ trách nhiệm đầu tư', 'reader/disclaimer.html']]],
    ['Phase 2 · Thương mại hóa', 'crown', [['P00', 'Paywall & Teaser trên báo cáo Premium', 'reader/report.html?id=r5&p2=1'], ['P01', 'Gói hội viên (Tháng / Quý / Năm / Mua lẻ)', 'reader/pricing.html?p2=1'], ['P02', 'Thanh toán Apple IAP / Google Play Billing', 'reader/checkout.html?plan=yearly&p2=1'], ['P03', 'Quản lý gói · Khôi phục giao dịch', 'reader/subscription.html?p2=1'], ['P04', 'Buổi trao đổi kín cùng chuyên gia', 'reader/sessions.html?p2=1']]],
    ['CMS Web Portal', 'grid', [['C01', 'Đăng nhập CMS (chọn vai trò)', 'cms/login.html'], ['C02', 'Dashboard', 'cms/index.html'], ['C03', 'Danh sách báo cáo', 'cms/reports.html'], ['C04', 'Soạn thảo báo cáo', 'cms/editor.html?id=r13'], ['C06', 'Thẩm định học thuật (FBV Review)', 'cms/review.html?id=r14'], ['C05·C07', 'Duyệt liên kết AI & Xuất bản', 'cms/publish.html?id=r16'], ['C09', 'Hàng đợi phản biện 1:1', 'cms/inquiries.html'], ['C10', 'Chi tiết phiên phản biện', 'cms/inquiry.html?id=q4'], ['C11', 'Kiểm duyệt vi phạm', 'cms/moderation.html'], ['C12', 'Chuyên gia · huy hiệu Verified', 'cms/experts.html'], ['C13', 'Danh mục chỉ số (master data AI)', 'cms/indicators.html'], ['C14', 'Người dùng', 'cms/users.html']]]
  ];
  const FL = [
    ['F1', 'Khách → Đọc báo cáo → Đăng nhập để lưu', 'reader/index.html'],
    ['F2', 'Đăng ký mới: Email → OTP → Điều khoản → Onboarding', 'reader/login.html'],
    ['F3', 'Bôi đen trong bài → Gửi phản biện → Phiên 1:1', 'reader/report.html?id=r6'],
    ['F4', 'Báo cáo ↔ Chỉ số (Vertex AI Contextual Linking)', 'reader/indicator.html?id=CPI'],
    ['F5', 'CMS: Soạn → Thẩm định → Duyệt AI → Xuất bản', 'cms/login.html'],
    ['F6', 'CMS: Điều phối phản biện theo SLA & kiểm duyệt', 'cms/inquiries.html'],
    ['F7', 'Cài đặt → Tài khoản → Xóa tài khoản', 'reader/settings.html'],
    ['F8', 'Phase 2: Paywall → Gói → IAP → Premium → Khôi phục', 'reader/report.html?id=r3&p2=1']
  ];
  pages.hub = () => {
    document.body.classList.add('rd', 'no-tab');
    const a = document.getElementById('app'); a.className = 'hub';
    a.innerHTML = `<header class="hub-top">${F.brand('index.html', 'Prototype v3')}<div class="row"><a class="btn btn-gray btn-sm" href="cms/login.html">${I('grid')}CMS</a><a class="btn btn-primary btn-sm" href="reader/index.html">Mở ứng dụng</a></div></header>
      <section class="hub-hero">${F.logoFull()}<h1 class="mt-24">FBV — Nghiên cứu kinh tế – tài chính, thẩm định bởi chuyên gia</h1><p>Prototype click-through cho <b>MVP v1.0</b> (duyệt Store & cộng đồng học thuật) và <b>Phase 2</b> (thương mại hóa). Giao diện mobile-first theo phong cách app đọc tối giản, bảng màu lấy từ logo FBV.ONE: nền navy, điểm nhấn vàng, xanh cyan và tím, tiêu đề serif, danh sách nhóm bo góc. Số liệu là minh họa.</p>
        <div class="row wrap mt-16"><span class="tag">${I('phone', 'i-xs')}Mobile-first · mở rộng tablet/desktop</span><span class="tag">${I('moon', 'i-xs')}Navy mặc định · có Light</span><span class="tag">${I('users', 'i-xs')}Đổi vai trò bằng nút Demo</span></div></section>
      <section class="hub-sec"><h2>Luồng demo</h2><div class="hub-flows">${FL.map((f) => `<a class="hub-flow" href="${f[2]}"><span class="k">${f[0]}</span><span class="t">${f[1]}</span>${I('arrowR', 'i-sm')}</a>`).join('')}</div></section>
      <section class="hub-sec"><h2>Danh mục màn hình</h2><div class="hub-grid">${G.map((g) => `<div><div class="group-title row">${I(g[1], 'i-sm')}<span>${g[0]}</span></div><div class="group">${g[2].map((s) => `<a class="gi" href="${s[2]}"><span class="code">${s[0]}</span><span class="gl" style="font-weight:500">${s[1]}</span>${I('chevR', 'chev')}</a>`).join('')}</div></div>`).join('')}</div></section>
      <section class="hub-sec"><div class="note">${I('info')}<span>Tài khoản demo: <b>minhanh@example.com</b> — mã OTP: 6 chữ số bất kỳ. Nút <b>Demo</b> (chấm vàng ở mép phải màn hình) dùng để đổi vai trò Khách / Độc giả / Chuyên gia / Thẩm định viên / Biên tập / Quản trị, bật Phase 2, đổi giao diện sáng/tối và reset dữ liệu.</span></div>${F.footLinks().replace(/reader\//g, 'reader/').replace(/href="\.\.\//g, 'href="')}</section>`;
    F.demoBar('reader');
  };
  pages.notfound = () => {
    document.body.classList.add('rd', 'no-tab');
    const a = document.getElementById('app'); a.className = 'app';
    a.innerHTML = `<div style="max-width:480px;margin:0 auto;padding:80px 16px">${F.empty('search', 'Không tìm thấy trang', 'Liên kết có thể đã thay đổi hoặc báo cáo đã được gỡ.', `<a class="btn btn-primary" href="${F.url('reader/index.html')}">Về trang chủ</a>`)}</div>`;
  };
})();
