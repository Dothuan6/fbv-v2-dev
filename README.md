# FBV v2 — Web App Prototype

Prototype click-through (HTML/CSS/JS thuần, không cần build) cho **Web Reader** (độc giả) và **CMS Web Portal** (chuyên gia, thẩm định, biên tập, quản trị) của FBV v2.
Toàn bộ số liệu là **minh họa**. Trạng thái demo được lưu trong `localStorage` của trình duyệt.

## Giao diện

- **Web Reader + Phase 2: mobile-first (app style)** — gốc là app điện thoại: appbar, tab bar đáy (Nghiên cứu · Thị trường · Phản biện · Tôi), bottom sheet, thanh thao tác đáy khi đọc báo cáo, khung chat phản biện.
  Mở rộng dần: **≥ 768px** thanh rail icon bên trái · **≥ 1024px** sidebar đầy đủ + bố cục 2 cột.
- **CMS**: giao diện quản trị desktop (responsive cơ bản).

## Chạy thử trên máy

Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy một web server tĩnh:

```bash
# Python
python -m http.server 8080
# hoặc Node
npx serve .
```

Rồi truy cập http://localhost:8080

## Cách dùng

- `index.html` — **Hub**: danh mục màn hình (R01–R23, P01–P04, C01–C14) và 8 luồng demo F1–F8.
- **Thanh Demo** (góc phải dưới): đổi vai trò Khách / Độc giả / Chuyên gia / Thẩm định viên / Biên tập / Quản trị, bật **Mô phỏng Phase 2** (Paywall), **Reset demo**.
- Tài khoản demo: `minhanh@example.com` (có sẵn dữ liệu) — mã OTP: 6 chữ số bất kỳ.

## Cấu trúc

```
index.html            Hub danh mục màn hình
404.html              Trang lỗi (Netlify)
reader/               25 màn hình độc giả + Phase 2
cms/                  12 màn hình CMS
assets/css/app.css    Design tokens + component dùng chung (Hub, CMS)
assets/css/reader.css App UI mobile-first cho Web Reader
assets/js/shell.js    App shell Reader (appbar, tab bar, rail) + component mobile
assets/js/data.js     Dữ liệu giả (báo cáo, chuyên gia, chỉ số, phản biện…)
assets/js/core.js     Store, layout, component, thanh Demo
assets/js/charts.js   Biểu đồ SVG (line, bar, sparkline) — không phụ thuộc thư viện
assets/js/reader.js   Feed, báo cáo, thị trường, chỉ số
assets/js/account.js  Đăng nhập, tài khoản, phản biện, pháp lý, Phase 2, Hub
assets/js/cms.js      CMS: dashboard, soạn thảo, AI Linking, thẩm định, xuất bản, kiểm duyệt
assets/media/         favicon, PDF mẫu
netlify.toml          Cấu hình deploy Netlify
```

## Đưa lên GitHub

```bash
cd FBV-v2/prototype
git init
git add .
git commit -m "FBV v2 web prototype"
git branch -M main
git remote add origin https://github.com/<tai-khoan>/fbv-v2-prototype.git
git push -u origin main
```

## Deploy Netlify

**Cách 1 — nối GitHub:** Netlify → *Add new site* → *Import an existing project* → chọn repo →
Build command: *(để trống)* · Publish directory: `.` → *Deploy*.

**Cách 2 — kéo thả:** vào https://app.netlify.com/drop và kéo cả thư mục `prototype` vào.

**Cách 3 — CLI:**
```bash
npm i -g netlify-cli
netlify deploy --dir . --prod
```

> `netlify.toml` đã cấu hình publish thư mục gốc, header bảo mật cơ bản và `noindex` để prototype không bị Google lập chỉ mục.

## Ghi chú kỹ thuật

- Font Be Vietnam Pro + Noto Serif tải từ Google Fonts; khi offline tự dùng font hệ thống.
- "Vertex AI" trong prototype được mô phỏng bằng khớp từ khóa theo **Danh mục chỉ số** (CMS → Danh mục chỉ số → từ khóa).
- Thanh toán, OTP, SSO Google/Apple đều là mô phỏng, không kết nối dịch vụ thật.
