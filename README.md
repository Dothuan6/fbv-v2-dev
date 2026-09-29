# FBV — Web App Prototype v3

Prototype click-through (HTML/CSS/JS thuần, không cần build) cho **ứng dụng độc giả FBV** (MVP v1.0 + Phase 2) và **CMS Web Portal**.
Toàn bộ số liệu là **minh họa**. Trạng thái demo được lưu trong `localStorage` của trình duyệt.

## Ngôn ngữ thiết kế (theo bộ màn mẫu trên Figma)

- App đọc báo cáo tối giản, **nền navy mặc định** (có giao diện Sáng / Theo hệ thống trong Cài đặt → Giao diện).
- **Logo FBV.ONE** (PNG nền trong suốt): `assets/media/logo.png`, `logo-mark.png`, `favicon.png`, `apple-touch-icon.png`.
- **Bảng màu lấy từ logo**: Navy `#00254F` (nền) · Vàng `#FECB00` (nút chính, điểm nhấn) · Cyan `#1BACCE` / Xanh `#0D86B8` (thông tin, Verified) · Cam `#FE8C10` (cảnh báo) · Tím `#6C06C8` (Premium, chữ “.ONE”, liên kết ở giao diện Sáng).
- **Tiêu đề serif** (Spectral), chữ giao diện Inter.
- **Tab bar 5 mục**: Trang chủ · Thư viện · Thị trường · Phản biện · Hoạt động; avatar góc phải mở Hồ sơ.
- **Danh sách nhóm bo góc** (grouped list) cho Cài đặt / Tài khoản; hồ sơ kiểu "tên lớn + avatar phải + nút Chỉnh sửa + tab gạch chân".
- Nút tròn **＋** cam để theo dõi khi onboarding, nút CTA dạng viên thuốc ở đáy màn hình.
- Mobile-first, mở rộng dần: **≥ 768px** thanh icon bên trái · **≥ 1100px** sidebar đầy đủ · **≥ 1280px** cột phụ (thị trường, chuyên gia).

## Cập nhật v3.1 (29/09/2026)

- **Phân loại tài khoản:** Tài khoản thường / Chuyên gia. Người dùng nộp hồ sơ chuyên gia trên app (`reader/expert-apply.html`: thông tin, học vị, chứng chỉ, kinh nghiệm, cam kết) → FBV Review xác minh → Admin duyệt trong CMS (`cms/applications.html`, `cms/application.html`).
- **Bài nghiên cứu:** đổi tên "Báo cáo/Bài viết" → "Bài nghiên cứu" (giữ "Báo cáo vi phạm").
- **AI nhận diện & gắn tag + tham số:** trang bài chia **Phần 1 nội dung → Phần 2 biểu đồ & dữ liệu**, không chèn biểu đồ giữa đoạn. CMS chỉnh tham số biểu đồ (Đường/Cột, 1D–1Y/12 kỳ).
- **Không gian làm việc** (`reader/workspace.html`, tab "Làm việc"): độc giả (theo dõi, ghim biểu đồ, ghi chú) · chuyên gia (bài nghiên cứu, hộp phản biện, hồ sơ).
- **Nguồn dữ liệu:** chỉ số ghi nguồn "thu thập qua vnstock"; CMS Danh mục chỉ số có cột mapping hàm/nguồn/tần suất/đồng bộ.
- Tham số URL demo: `?as=member|expert|u5` (đăng nhập nhanh), `?role=admin|editor|reviewer|expert` (vai trò CMS), `?p2=1` (Phase 2).
- Tài liệu phân tích & kế hoạch: `FBV-v2\outputs\FBV_v3.1_PhanTich_KeHoach.md`.

## Phạm vi tính năng

**MVP v1.0**
1. Tài khoản & xác thực: Chế độ Khách, Email + OTP, Sign in with Apple / Google, điều khoản (EULA), onboarding chọn lĩnh vực (Fintech · Vĩ mô · Vi mô) và chuyên gia, hồ sơ, chỉnh sửa hồ sơ, cài đặt, **Xóa tài khoản trong app**.
2. Nghiên cứu & trình đọc: Research Feed 3 luồng, trình đọc rich-text (bảng, biểu đồ), Native PDF Viewer, hồ sơ chuyên gia **Verified by FBV**, tìm kiếm + lọc chủ đề/tác giả, lưu (Thư viện), chia sẻ, disclaimer tự động cuối bài.
3. Chỉ số vĩ mô & thị trường: VN-Index, VN30, HNX, UPCoM (1D/1W/1M/1Y, trễ 15 phút), độ rộng thị trường, khối ngoại mua/bán ròng; lãi suất, tỷ giá USD/VND, DXY, vàng, dầu; GDP, CPI, FDI, IIP, cán cân thương mại, tín dụng.
4. Liên kết ngữ cảnh Vertex AI: widget chỉ số trong bài ↔ danh sách báo cáo phân tích trên trang chỉ số.
5. Phản biện 1:1 kín: bôi đen đoạn văn/số liệu → gửi câu hỏi tới tác giả; hộp trao đổi riêng tư có **Báo cáo vi phạm** và **Chặn**.
6. CMS: quy trình 3 bước Soạn thảo → Thẩm định (FBV Review) → Phê duyệt xuất bản; duyệt gợi ý AI; điều phối phản biện theo SLA; kiểm duyệt vi phạm.

**Phase 2**: gói Tháng / Quý / Năm / mua lẻ báo cáo (Apple IAP · Google Play Billing mô phỏng), Khôi phục giao dịch, quản lý gói, Paywall + Teaser (tóm tắt điều hành), phản biện không giới hạn, buổi trao đổi kín định kỳ.

## Chạy thử

Mở `index.html` bằng trình duyệt, hoặc chạy web server tĩnh:

```bash
python -m http.server 8080   # hoặc: npx serve .
```

- `index.html` — **Hub**: danh mục màn hình (A01–A11, W01–W02, R01–R13, L01–L03, P00–P04, C01–C16) và 10 luồng demo F1–F10.
- **Nút Demo** (chấm vàng ở mép phải; trên desktop ở góc phải dưới): đổi vai trò Khách / Độc giả / Chuyên gia / Thẩm định viên / Biên tập / Quản trị, bật **Phase 2**, đổi giao diện sáng/tối, **Reset demo**.
- Tài khoản demo: `minhanh@example.com` — mã OTP: 6 chữ số bất kỳ.
- Thêm `?p2=1` vào URL bất kỳ để bật Phase 2.

## Cấu trúc

```
index.html              Hub danh mục màn hình
404.html                Trang lỗi (Netlify)
reader/                 Màn hình ứng dụng độc giả + Phase 2
cms/                    Màn hình CMS Web Portal
assets/css/fbv.css      Design system (tokens dark/light, component, app shell)
assets/css/cms.css      Bố cục & component CMS
assets/js/data.js       Dữ liệu giả (báo cáo, chuyên gia, chỉ số, phản biện…)
assets/js/core.js       Store, theme, icon, sheet/toast, nút Demo
assets/js/charts.js     Biểu đồ SVG (line, bar, sparkline) theo theme
assets/js/shell.js      App shell (appbar, tab bar, sidebar) + card dùng chung
assets/js/reader.js     Feed, tìm kiếm, trình đọc, PDF, chuyên gia, thư viện
assets/js/market.js     Thị trường, vĩ mô & tiền tệ, chi tiết chỉ số
assets/js/account.js    Đăng nhập, hồ sơ, cài đặt, phản biện, hoạt động, pháp lý, Phase 2
assets/js/cms.js        CMS: dashboard, soạn thảo, thẩm định, AI linking, xuất bản, phản biện, kiểm duyệt
assets/js/workspace.js  Không gian làm việc, đăng ký chuyên gia, ghi chú/theo dõi/ghim
assets/js/hub.js        Hub + 404
netlify.toml            Cấu hình deploy Netlify
```

> Nâng cấp từ bản trước: có thể xóa các tệp cũ không còn dùng — `assets/css/app.css`, `assets/css/reader.css`, `assets/css/kb.css`, `assets/js/knowledge.js`, `assets/js/kb.js`. Các trang cũ `reader/topics|topic|concept|glossary.html`, `cms/topics|glossary.html` chỉ còn chuyển hướng về trang chủ.
