# FBV — Web App Prototype v3

Prototype click-through (HTML/CSS/JS thuần, không cần build) cho **ứng dụng độc giả FBV** (MVP v1.0 + Phase 2) và **CMS Web Portal**.
Toàn bộ số liệu là **minh họa**. Trạng thái demo được lưu trong `localStorage` của trình duyệt.

## Ngôn ngữ thiết kế (theo bộ màn mẫu trên Figma)

- App đọc báo cáo tối giản, **nền navy mặc định** (có giao diện Sáng / Theo hệ thống trong Cài đặt → Giao diện).
- **Logo FBV.ONE** (PNG nền trong suốt): `assets/media/logo.png`, `logo-mark.png`, `favicon.png`, `apple-touch-icon.png`.
- **Bảng màu lấy từ logo**: Navy `#00254F` (nền) · Vàng `#FECB00` (nút chính, điểm nhấn) · Cyan `#1BACCE` / Xanh `#0D86B8` (thông tin, Verified) · Cam `#FE8C10` (cảnh báo) · Tím `#6C06C8` (Premium, chữ “.ONE”, liên kết ở giao diện Sáng).
- **Tiêu đề serif** (Spectral), chữ giao diện Inter.
- **Tab bar 5 mục**: Trang chủ · Làm việc · Thị trường · Phản biện · Hoạt động; avatar góc phải mở Hồ sơ.
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

## Cập nhật v3.2 (30/09/2026) — tính năng tham khảo từ chat FBV.ONE (đã duyệt)

- **Chat phản biện nâng cao** (`reader/inquiry.html`): trả lời trích dẫn, phản hồi học thuật (👍 Hữu ích · ✔ Đã rõ · ❓ Cần làm rõ), sao chép, thu hồi trong 5 phút / xóa phía tôi (nội dung gốc vẫn lưu cho kiểm duyệt — xem trong CMS), đính kèm file & ảnh có quét virus, panel Ảnh · File · Liên kết, vạch “Tin nhắn mới”, tắt thông báo từng phiên, tìm kiếm trong danh sách và trong phiên, ẩn lịch sử phía người dùng.
- **Phase 2 · Gọi theo lịch hẹn** (`reader/call.html`): đặt lịch gọi thoại/video 1:1 (Premium) và tham gia video buổi trao đổi kín — không gọi tự do, không ghi âm.
- **Phase 2 · Phòng trao đổi kín** (`reader/room.html`): mỗi buổi trao đổi có 1 phòng nhóm do Admin tạo; chuyên gia là Trưởng phòng, biên tập viên là Điều phối FBV.
- **Nhật ký nghiên cứu** (`reader/journal.html`): ghi chú, trích dẫn, tệp, ảnh, liên kết; gắn bài/chỉ số; lọc, tìm, ghim; đồng bộ nhiều thiết bị.
- **Trợ lý nghiên cứu AI** (`reader/assistant.html`, Phase 2+ Beta): chỉ trả lời từ bài đã thẩm định, luôn trích nguồn, từ chối khuyến nghị mua/bán.
- **Mã QR** hồ sơ chuyên gia & bài nghiên cứu · **Ảnh bìa** hồ sơ chuyên gia · **Phông/cỡ chữ trình đọc** · **Giao diện English** (Cài đặt → Ngôn ngữ).
- Tham số demo mới: `?prem=1` (bật Phase 2 + Premium + đăng ký sẵn buổi trao đổi đang diễn ra).
- Tài liệu: `FBV-v2\outputs\FBV_v3.2_TinhNang_Chat_FBVONE.md`.

## Cập nhật v3.2.1 (01/10/2026)

- **Lịch gọi phía chuyên gia:** xác nhận / đổi giờ / từ chối lịch gọi 1:1 trong Workspace chuyên gia và CMS; độc giả đồng ý giờ mới ngay trong phiên.
- **CMS Buổi trao đổi kín** (`cms/sessions.html`, `cms/session.html`): Quản trị tạo/sửa/hủy buổi, phòng kín tạo tự động, thêm/bớt thành viên, gửi thông báo vào phòng.
- **CMS trả lời phản biện:** trả lời trích dẫn, phản hồi học thuật, sao chép, đính kèm file/ảnh.
- Số hiệu chứng chỉ được che một phần trên hồ sơ công khai.

## Cập nhật v3.3 (05/10/2026) — bổ sung theo tiêu chí App Store

- **An toàn nội dung (1.2):** bộ lọc từ ngữ/quảng cáo/khuyến nghị mua bán trước khi gửi (phản biện, chat, phòng, hồ sơ, câu hỏi AI, trả lời của chuyên gia); kiểm duyệt ảnh tải lên; báo cáo hồ sơ chuyên gia, báo cáo trong cuộc gọi; chặn thành viên trong phòng; điều phối viên tắt tiếng, mời ra, gỡ tin; CMS Kiểm duyệt xử lý mọi loại nội dung và cảnh báo quá 24 giờ.
- **Quyền hệ thống (4.5.4, 5.1.1):** giải thích trước khi xin quyền thông báo, hộp thoại quyền micrô/camera có mục đích rõ, ẩn nội dung xem trước của thông báo, thông báo tiếp thị có công tắc riêng (mặc định tắt).
- **Dữ liệu cá nhân (5.1.1, 5.1.2):** đồng ý gửi câu hỏi tới AI bên thứ ba (rút lại được), đồng ý xử lý dữ liệu hồ sơ chuyên gia + rút hồ sơ, ảnh bìa tải lên chờ FBV duyệt, chính sách bảo mật nêu thời hạn lưu.
- **Thuê bao (3.1.2):** khối thông tin thuê bao trên màn mua (giá theo gói, tự gia hạn, cách hủy) kèm link EULA và Chính sách bảo mật.
- **Dữ liệu thị trường:** cảnh báo khi nguồn gián đoạn (hiện giá trị gần nhất), màn "Nguồn & điều kiện sử dụng dữ liệu".
- **English:** dịch thêm ~200 chuỗi giao diện ở các màn chính.
- Tệp mới: `assets/js/safety.js`.

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

- `index.html` — **Hub**: danh mục màn hình (A01–A13, W01–W04, R01–R14, L01–L03, P00–P07, C01–C18) và 15 luồng demo F1–F15.
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
assets/js/safety.js     Lọc nội dung, báo cáo dùng chung, quyền hệ thống (thông báo/micrô/camera), đồng ý AI
assets/js/cms-v32.js    CMS v3.2.1–3.3: kiểm duyệt mọi loại nội dung, phiên phản biện (lịch gọi, trả lời kèm tệp), buổi trao đổi kín
assets/js/cms.js        CMS: dashboard, soạn thảo, thẩm định, AI linking, xuất bản, phản biện, kiểm duyệt
assets/js/workspace.js  Không gian làm việc, đăng ký chuyên gia, ghi chú/theo dõi/ghim
assets/js/chat.js       Chat phản biện nâng cao, gọi theo lịch, phòng trao đổi kín, buổi trao đổi
assets/js/journal.js    Nhật ký nghiên cứu
assets/js/assistant.js  Trợ lý nghiên cứu AI (mô phỏng RAG)
assets/js/prefs.js      Phông/cỡ chữ trình đọc, ngôn ngữ, mã QR, ảnh bìa
assets/js/vendor/qrcode.min.js  Thư viện tạo mã QR (qrcode-generator, MIT)
assets/js/hub.js        Hub + 404
netlify.toml            Cấu hình deploy Netlify
```

> Nâng cấp từ bản trước: có thể xóa các tệp cũ không còn dùng — `assets/css/app.css`, `assets/css/reader.css`, `assets/css/kb.css`, `assets/js/knowledge.js`, `assets/js/kb.js`. Các trang cũ `reader/topics|topic|concept|glossary.html`, `cms/topics|glossary.html` chỉ còn chuyển hướng về trang chủ.


## v3.3.1 — Giao diện English đầy đủ (E-10)

- `prefs.js`: từ điển EN mở rộng (~900 chuỗi + ~90 mẫu regex) phủ toàn bộ màn reader, sheet/modal, toast, placeholder, `aria-label`/`title`, điều khoản & chính sách, nội dung thông báo hệ thống.
- Bộ dịch tách đoạn theo ` · `, dịch ngày/tháng, thời lượng, đơn vị.
- Giữ nguyên ngôn ngữ gốc: nội dung bài nghiên cứu, tên/hồ sơ chuyên gia, tin nhắn, ghi chú, tên buổi trao đổi. CMS vẫn tiếng Việt.
- Xóa tài khoản: chấp nhận gõ `XÓA` hoặc `DELETE`.
