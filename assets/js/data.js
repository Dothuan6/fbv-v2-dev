/* =========================================================
   FBV v2 Prototype — DỮ LIỆU GIẢ (MOCK DATA)
   Toàn bộ số liệu chỉ mang tính MINH HỌA, không phải dữ liệu thật.
   Thời gian được tính tương đối so với lần mở prototype đầu tiên.
   ========================================================= */
(function () {
  const H = 3600e3, D = 24 * H;
  const ago = (ms) => new Date(Date.now() - ms).toISOString();
  const later = (ms) => new Date(Date.now() + ms).toISOString();

  const experts = [
    { id: 'e1', name: 'TS. Trần Quốc Bảo', short: 'Trần Quốc Bảo', title: 'Chuyên gia Kinh tế vĩ mô', org: 'Viện Nghiên cứu FBV', fields: ['macro'], verified: true, color: '#1877F2',
      bio: 'Hơn 15 năm nghiên cứu chính sách tiền tệ và ổn định tài chính. Từng tham gia nhóm tư vấn chính sách cho các tổ chức phát triển khu vực châu Á. Tiến sĩ Kinh tế học, Đại học Quốc gia Úc.' },
    { id: 'e2', name: 'ThS. Nguyễn Thu Hà', short: 'Nguyễn Thu Hà', title: 'Chuyên gia Fintech & Ngân hàng số', org: 'FBV Fintech Lab', fields: ['fintech'], verified: true, color: '#7C3AED',
      bio: 'Nghiên cứu mô hình ngân hàng số, thanh toán điện tử và khung pháp lý thử nghiệm (sandbox). 10 năm kinh nghiệm tư vấn chuyển đổi số cho tổ chức tín dụng.' },
    { id: 'e3', name: 'PGS.TS. Lê Văn Khánh', short: 'Lê Văn Khánh', title: 'Chuyên gia Tài chính doanh nghiệp', org: 'Trường Kinh tế — Đại học Quốc gia', fields: ['micro'], verified: true, color: '#059669',
      bio: 'Giảng dạy và nghiên cứu tài chính doanh nghiệp, cấu trúc chi phí và năng suất ngành sản xuất. Tác giả nhiều công trình về chuỗi cung ứng Việt Nam.' },
    { id: 'e4', name: 'TS. Phạm Minh Châu', short: 'Phạm Minh Châu', title: 'Chuyên gia Thị trường vốn', org: 'Viện Nghiên cứu FBV', fields: ['micro', 'macro'], verified: true, color: '#DC2626',
      bio: 'Chuyên sâu về cấu trúc thị trường chứng khoán, hành vi nhà đầu tư và dòng vốn quốc tế. Nguyên trưởng nhóm phân tích định lượng tại một tổ chức tài chính.' },
    { id: 'e5', name: 'ThS. Đỗ Hải Yến', short: 'Đỗ Hải Yến', title: 'Chuyên gia Giá cả & Lạm phát', org: 'FBV Macro Desk', fields: ['macro'], verified: true, color: '#D97706',
      bio: 'Theo dõi và mô hình hóa lạm phát, giá năng lượng và hàng hóa cơ bản. Thạc sĩ Kinh tế lượng.' },
    { id: 'e6', name: 'TS. Vũ Đức Long', short: 'Vũ Đức Long', title: 'Chuyên gia Thương mại & FDI', org: 'Viện Nghiên cứu FBV', fields: ['macro', 'micro'], verified: false, color: '#0891B2',
      bio: 'Nghiên cứu đầu tư trực tiếp nước ngoài, dịch chuyển chuỗi cung ứng và cán cân thương mại. Hồ sơ đang chờ FBV thẩm định huy hiệu.' }
  ];

  const staff = [
    { id: 's1', name: 'TS. Hoàng Lan Phương', role: 'reviewer', title: 'Thẩm định viên học thuật — FBV Review' },
    { id: 's2', name: 'Phạm Thu Trang', role: 'editor', title: 'Biên tập viên xuất bản' },
    { id: 's3', name: 'Quản trị FBV', role: 'admin', title: 'Quản trị hệ thống' }
  ];

  const users = [
    { id: 'u1', name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', interests: ['macro', 'fintech'], joined: ago(62 * D), consent: true, onboarded: true, bookmarks: ['r5', 'r8', 'r10'], follows: ['e1'], blocked: [], status: 'active' },
    { id: 'u2', name: 'Lê Quang Huy', email: 'quanghuy@example.com', interests: ['macro'], joined: ago(40 * D), consent: true, onboarded: true, bookmarks: [], follows: [], blocked: [], status: 'active' },
    { id: 'u3', name: 'Trần Bảo Ngọc', email: 'baongoc@example.com', interests: ['fintech'], joined: ago(33 * D), consent: true, onboarded: true, bookmarks: [], follows: [], blocked: [], status: 'active' },
    { id: 'u4', name: 'Phan Đức Thịnh', email: 'ducthinh@example.com', interests: ['micro', 'macro'], joined: ago(21 * D), consent: true, onboarded: true, bookmarks: [], follows: [], blocked: [], status: 'active' },
    { id: 'u5', name: 'Võ Hà My', email: 'hamy@example.com', interests: ['fintech', 'micro'], joined: ago(15 * D), consent: true, onboarded: true, bookmarks: [], follows: [], blocked: [], status: 'active' },
    { id: 'u6', name: 'Đặng Tuấn Kiệt', email: 'tuankiet@example.com', interests: ['micro'], joined: ago(9 * D), consent: true, onboarded: true, bookmarks: [], follows: [], blocked: [], status: 'active' }
  ];

  /* ---------------- Chỉ số ---------------- */
  const m12 = ['T9/25', 'T10/25', 'T11/25', 'T12/25', 'T1/26', 'T2/26', 'T3/26', 'T4/26', 'T5/26', 'T6/26', 'T7/26', 'T8/26'];
  const indicators = [
    { id: 'VNINDEX', name: 'VN-Index', group: 'equity', unit: 'điểm', dec: 2, value: 1652.18, prev: 1643.76, vol: .011, source: 'HOSE (qua nhà cung cấp dữ liệu)', freq: 'Trong ngày · trễ 15 phút', syn: ['vnindex', 'chỉ số chứng khoán', 'thị trường cổ phiếu', 'HOSE'] },
    { id: 'VN30', name: 'VN30', group: 'equity', unit: 'điểm', dec: 2, value: 1781.40, prev: 1770.35, vol: .012, source: 'HOSE (qua nhà cung cấp dữ liệu)', freq: 'Trong ngày · trễ 15 phút', syn: ['vn30', 'bluechip', 'vốn hóa lớn', 'cổ phiếu ngân hàng'] },
    { id: 'HNX', name: 'HNX-Index', group: 'equity', unit: 'điểm', dec: 2, value: 268.35, prev: 269.09, vol: .010, source: 'HNX (qua nhà cung cấp dữ liệu)', freq: 'Trong ngày · trễ 15 phút', syn: ['hnx', 'sàn Hà Nội'] },
    { id: 'UPCOM', name: 'UPCoM-Index', group: 'equity', unit: 'điểm', dec: 2, value: 108.92, prev: 108.71, vol: .007, source: 'HNX (qua nhà cung cấp dữ liệu)', freq: 'Trong ngày · trễ 15 phút', syn: ['upcom'] },
    { id: 'POLICY_RATE', name: 'Lãi suất tái cấp vốn', group: 'rate', unit: '%', dec: 2, value: 4.50, prev: 4.50, vol: 0, source: 'Ngân hàng Nhà nước', freq: 'Khi có điều chỉnh', syn: ['lãi suất điều hành', 'tái cấp vốn', 'chính sách tiền tệ'] },
    { id: 'ON_RATE', name: 'LS liên ngân hàng qua đêm', group: 'rate', unit: '%', dec: 2, value: 4.12, prev: 4.05, vol: .03, source: 'Ngân hàng Nhà nước', freq: 'Hằng ngày', syn: ['liên ngân hàng', 'qua đêm', 'thanh khoản hệ thống', 'overnight'] },
    { id: 'IB_1W', name: 'LS liên ngân hàng 1 tuần', group: 'rate', unit: '%', dec: 2, value: 4.35, prev: 4.38, vol: .025, source: 'Ngân hàng Nhà nước', freq: 'Hằng ngày', syn: ['liên ngân hàng 1 tuần'] },
    { id: 'DEP_12M', name: 'LS tiền gửi 12 tháng (bình quân)', group: 'rate', unit: '%', dec: 2, value: 5.10, prev: 5.08, vol: .004, source: 'Tổng hợp biểu lãi suất NHTM', freq: 'Hằng tuần', syn: ['lãi suất tiền gửi', 'huy động', 'chi phí vốn'] },
    { id: 'USDVND', name: 'Tỷ giá USD/VND (NHTM bán ra)', group: 'fx', unit: 'đồng', dec: 0, value: 26385, prev: 26410, vol: .002, source: 'Bình quân NHTM lớn', freq: 'Hằng ngày', syn: ['tỷ giá', 'usd/vnd', 'đồng việt nam', 'ngoại hối'] },
    { id: 'DXY', name: 'Chỉ số DXY', group: 'fx', unit: 'điểm', dec: 2, value: 98.62, prev: 98.91, vol: .004, source: 'ICE (qua nhà cung cấp dữ liệu)', freq: 'Trong ngày', syn: ['dxy', 'đồng đô la', 'usd index'] },
    { id: 'GOLD', name: 'Vàng thế giới (XAU/USD)', group: 'commodity', unit: 'USD/oz', dec: 1, value: 3882.4, prev: 3861.0, vol: .008, source: 'Giá giao ngay quốc tế', freq: 'Trong ngày', syn: ['giá vàng', 'xau', 'kim loại quý'] },
    { id: 'BRENT', name: 'Dầu Brent', group: 'commodity', unit: 'USD/thùng', dec: 2, value: 68.42, prev: 69.10, vol: .015, source: 'ICE Futures', freq: 'Trong ngày', syn: ['dầu thô', 'brent', 'giá năng lượng'] },
    { id: 'WTI', name: 'Dầu WTI', group: 'commodity', unit: 'USD/thùng', dec: 2, value: 64.75, prev: 65.30, vol: .015, source: 'NYMEX', freq: 'Trong ngày', syn: ['wti', 'dầu thô mỹ'] },
    { id: 'GDP', name: 'Tăng trưởng GDP', group: 'macro', unit: '% so cùng kỳ', dec: 2, value: 7.12, prev: 6.93, period: 'Quý II/2026', prevLabel: 'Quý I/2026', source: 'Cục Thống kê', freq: 'Hằng quý', syn: ['gdp', 'tăng trưởng kinh tế', 'sản lượng'],
      series: { labels: ['Q3/24', 'Q4/24', 'Q1/25', 'Q2/25', 'Q3/25', 'Q4/25', 'Q1/26', 'Q2/26'], values: [7.4, 7.55, 6.93, 7.96, 8.2, 7.9, 6.93, 7.12] } },
    { id: 'CPI', name: 'Lạm phát CPI', group: 'macro', unit: '% so cùng kỳ', dec: 2, value: 3.42, prev: 3.28, period: 'Tháng 8/2026', prevLabel: 'Tháng 7/2026', source: 'Cục Thống kê', freq: 'Hằng tháng', syn: ['cpi', 'lạm phát', 'giá tiêu dùng'],
      series: { labels: m12, values: [3.2, 3.25, 3.1, 3.05, 3.15, 3.3, 3.12, 3.18, 3.22, 3.35, 3.28, 3.42] } },
    { id: 'FDI', name: 'Vốn FDI giải ngân (lũy kế)', group: 'macro', unit: 'tỷ USD', dec: 1, value: 15.2, prev: 14.1, period: '8 tháng/2026', prevLabel: 'Cùng kỳ 2025', source: 'Cục Đầu tư nước ngoài', freq: 'Hằng tháng', syn: ['fdi', 'đầu tư nước ngoài', 'dịch chuyển chuỗi cung ứng'],
      series: { labels: m12, values: [1.9, 2.0, 2.1, 3.0, 1.5, 1.4, 2.0, 1.9, 2.0, 2.2, 2.0, 2.2] } },
    { id: 'IIP', name: 'Chỉ số sản xuất công nghiệp (IIP)', group: 'macro', unit: '% so cùng kỳ', dec: 1, value: 9.8, prev: 8.9, period: 'Tháng 8/2026', prevLabel: 'Tháng 7/2026', source: 'Cục Thống kê', freq: 'Hằng tháng', syn: ['iip', 'sản xuất công nghiệp', 'chế biến chế tạo'],
      series: { labels: m12, values: [10.6, 8.9, 9.2, 9.5, 4.1, 13.5, 8.4, 8.8, 9.1, 9.4, 8.9, 9.8] } },
    { id: 'TRADE_BAL', name: 'Cán cân thương mại (lũy kế)', group: 'macro', unit: 'tỷ USD', dec: 1, value: 12.6, prev: 11.4, period: '8 tháng/2026', prevLabel: 'Cùng kỳ 2025', source: 'Cục Hải quan', freq: 'Hằng tháng', syn: ['cán cân thương mại', 'xuất khẩu', 'nhập khẩu', 'thặng dư'],
      series: { labels: m12, values: [1.8, 2.1, 1.3, -0.4, 3.1, -1.2, 1.6, 0.8, 1.9, 2.3, 1.7, 2.4] } },
    { id: 'CREDIT', name: 'Tăng trưởng tín dụng (từ đầu năm)', group: 'macro', unit: '%', dec: 2, value: 9.2, prev: 8.1, period: 'Đến 31/8/2026', prevLabel: 'Đến 31/7/2026', source: 'Ngân hàng Nhà nước', freq: 'Hằng tháng', syn: ['tín dụng', 'cho vay', 'dư nợ'],
      series: { labels: m12, values: [9.6, 10.9, 12.5, 15.1, 0.4, 1.5, 3.2, 4.3, 5.6, 7.1, 8.1, 9.2] } }
  ];

  const market = {
    breadth: {
      HOSE: { up: 212, down: 156, flat: 64, ceil: 9, floor: 3 },
      HNX: { up: 88, down: 71, flat: 52, ceil: 6, floor: 2 },
      UPCOM: { up: 190, down: 150, flat: 240, ceil: 14, floor: 8 }
    },
    liquidity: { HOSE: 21480, HNX: 1620, UPCOM: 980 }, // tỷ đồng
    foreign: {
      labels: ['12/9', '15/9', '16/9', '17/9', '18/9', '19/9', '22/9', '23/9', '24/9', '25/9'],
      values: [-412, -186, 95, -620, -233, 148, -75, -390, 210, -158] // tỷ đồng, mua ròng (+) / bán ròng (−)
    },
    foreignToday: { buy: 1840, sell: 1998 },
    updatedAt: ago(15 * 60e3)
  };

  /* ---------------- Báo cáo ---------------- */
  const P = (x) => ({ t: 'p', x });
  const Hh = (x) => ({ t: 'h', x });
  const reports = [
    { id: 'r1', stream: 'fintech', status: 'published', author: 'e2', premium: false, readTime: 9, cover: 1, pdf: true,
      title: 'Thanh toán không tiền mặt tại Việt Nam: quy mô, động lực và giới hạn tăng trưởng',
      dek: 'Tăng trưởng giao dịch số đã vượt kỳ vọng, nhưng chênh lệch giữa đô thị và nông thôn cùng chi phí chấp nhận thanh toán của hộ kinh doanh đang trở thành nút thắt mới.',
      summary: ['Giá trị giao dịch qua QR và chuyển khoản tức thời tiếp tục tăng hai chữ số mỗi năm.', 'Động lực chính đến từ miễn phí chuyển khoản và chuẩn hóa mã QR liên ngân hàng.', 'Giới hạn tăng trưởng nằm ở nhóm hộ kinh doanh nhỏ và khu vực nông thôn.'],
      tags: ['Thanh toán số', 'QR', 'Hộ kinh doanh'], publishedAt: ago(2 * D + 3 * H), views: 4820,
      body: [
        P('Trong ba năm gần đây, thanh toán không tiền mặt tại Việt Nam chuyển từ giai đoạn "khuyến khích" sang giai đoạn "mặc định" ở nhiều nhóm dân cư đô thị. Mã QR liên ngân hàng và chuyển khoản tức thời miễn phí đã hạ chi phí giao dịch xuống gần bằng không đối với người tiêu dùng.'),
        P('Tuy nhiên, tốc độ tăng trưởng đo bằng số lượng giao dịch che khuất một thực tế: giá trị bình quân mỗi giao dịch giảm dần, cho thấy phần tăng thêm chủ yếu đến từ các khoản chi tiêu nhỏ, thường nhật — vốn trước đây dùng tiền mặt.'),
        Hh('Ba động lực chính'),
        P('Thứ nhất, chuẩn hóa mã QR giúp người bán chỉ cần một mã duy nhất cho mọi ngân hàng. Thứ hai, chính sách miễn phí chuyển khoản tạo hiệu ứng mạng lưới nhanh. Thứ ba, yêu cầu xác thực sinh trắc học làm tăng niềm tin của người dùng lớn tuổi.'),
        { t: 'fig', title: 'Tăng trưởng số lượng giao dịch qua QR (so cùng kỳ, %)', unit: '%', data: [['2022', 38], ['2023', 61], ['2024', 72], ['2025', 55], ['6T/2026', 41]], src: 'Tổng hợp của FBV — số liệu minh họa' },
        P('Giới hạn tăng trưởng hiện nằm ở hộ kinh doanh nhỏ: khi doanh thu qua tài khoản trở nên minh bạch, một bộ phận hộ kinh doanh có xu hướng quay lại tiền mặt. Đây là vấn đề thiết kế chính sách thuế nhiều hơn là vấn đề công nghệ.'),
        P('Nghiên cứu đề xuất theo dõi đồng thời chỉ số giá trị giao dịch bình quân và tỷ lệ hộ kinh doanh duy trì tài khoản hoạt động, thay vì chỉ dựa trên tổng số giao dịch.')
      ] },
    { id: 'r2', stream: 'fintech', status: 'published', author: 'e2', premium: false, readTime: 7, cover: 2, pdf: false,
      title: 'Sandbox Fintech: khung thử nghiệm có kiểm soát và bài học từ khu vực',
      dek: 'So sánh cơ chế thử nghiệm có kiểm soát của Singapore, Thái Lan và Việt Nam — điều gì giúp một sandbox tạo ra sản phẩm thật thay vì chỉ là thủ tục?',
      summary: ['Sandbox hiệu quả cần tiêu chí "tốt nghiệp" rõ ràng.', 'Thời gian thử nghiệm quá ngắn khiến doanh nghiệp khó thu thập đủ dữ liệu.', 'Cơ chế chia sẻ dữ liệu giữa các cơ quan quản lý là điểm yếu chung.'],
      tags: ['Sandbox', 'Pháp lý', 'Khu vực'], publishedAt: ago(5 * D), views: 2110,
      body: [
        P('Khung thử nghiệm có kiểm soát (regulatory sandbox) cho phép doanh nghiệp công nghệ tài chính thử nghiệm sản phẩm với số lượng khách hàng giới hạn, dưới sự giám sát của cơ quan quản lý. Mục tiêu là rút ngắn khoảng cách giữa đổi mới và quy định.'),
        Hh('Bài học từ khu vực'),
        { t: 'table', cap: 'So sánh đặc điểm khung thử nghiệm (tóm lược)', head: ['Tiêu chí', 'Singapore', 'Thái Lan', 'Việt Nam'], rows: [['Thời gian thử nghiệm', '6–12 tháng', '12 tháng', '2 năm'], ['Tiêu chí tốt nghiệp', 'Rõ ràng', 'Tương đối', 'Đang hoàn thiện'], ['Số lĩnh vực', 'Mở', '4 lĩnh vực', '6 lĩnh vực'], ['Cơ chế gia hạn', 'Có', 'Có', 'Có']], src: 'Tổng hợp của FBV — minh họa' },
        P('Điểm chung của các sandbox hiệu quả là tiêu chí tốt nghiệp rõ ràng: doanh nghiệp biết trước chỉ số nào cần đạt để được cấp phép chính thức. Ngược lại, sandbox thiếu tiêu chí này dễ trở thành một bước thủ tục kéo dài.'),
        P('Với Việt Nam, khuyến nghị tập trung vào cơ chế chia sẻ dữ liệu giám sát giữa các cơ quan và công bố định kỳ kết quả thử nghiệm để thị trường cùng học hỏi.')
      ] },
    { id: 'r3', stream: 'fintech', status: 'published', author: 'e2', premium: true, readTime: 12, cover: 3, pdf: true,
      title: 'Ngân hàng số và biên lãi ròng: tác động của chi phí vốn',
      dek: 'Tiền gửi không kỳ hạn giá rẻ từng là lợi thế của ngân hàng số. Khi lãi suất huy động nhích lên, lợi thế này đang được định giá lại như thế nào?',
      summary: ['Tỷ lệ CASA cao giúp ngân hàng số duy trì biên lãi ròng tốt hơn trung bình ngành.', 'Chi phí vốn tăng làm thu hẹp khoảng cách này khoảng 20–30 điểm cơ bản.', 'Chi phí thu hút khách hàng (CAC) trở thành biến số quyết định.'],
      tags: ['Ngân hàng số', 'NIM', 'CASA'], publishedAt: ago(6 * D), views: 3590,
      body: [
        P('Mô hình ngân hàng số dựa trên giả định rằng chi phí vận hành thấp và nguồn tiền gửi không kỳ hạn (CASA) dồi dào sẽ tạo ra biên lãi ròng (NIM) cao hơn ngân hàng truyền thống. Giả định này đúng trong môi trường lãi suất thấp.'),
        P('Khi lãi suất liên ngân hàng và lãi suất huy động nhích lên, người gửi tiền nhạy cảm hơn với chênh lệch lãi suất và chuyển một phần số dư sang tiền gửi có kỳ hạn. Tỷ lệ CASA vì thế giảm, kéo chi phí vốn bình quân tăng.'),
        Hh('Mô phỏng tác động'),
        P('Mô phỏng trên dữ liệu minh họa cho thấy mỗi 50 điểm cơ bản tăng của lãi suất tiền gửi 12 tháng làm NIM của nhóm ngân hàng số giảm khoảng 20–30 điểm cơ bản, lớn hơn mức giảm của nhóm ngân hàng truyền thống.'),
        { t: 'table', cap: 'Độ nhạy NIM theo kịch bản chi phí vốn (minh họa)', head: ['Kịch bản', 'LS tiền gửi 12T', 'NIM ngân hàng số', 'NIM trung bình ngành'], rows: [['Cơ sở', '5,10%', '4,2%', '3,4%'], ['Tăng nhẹ', '5,60%', '3,95%', '3,3%'], ['Tăng mạnh', '6,10%', '3,7%', '3,15%']], src: 'Mô hình FBV — số liệu minh họa' },
        P('Biến số quyết định trong giai đoạn tới là chi phí thu hút khách hàng: ngân hàng nào giữ được người dùng bằng trải nghiệm thay vì bằng lãi suất sẽ bảo vệ được biên lợi nhuận.')
      ] },
    { id: 'r4', stream: 'fintech', status: 'published', author: 'e4', premium: false, readTime: 8, cover: 4, pdf: false,
      title: 'Tài sản mã hóa và khung pháp lý: các kịch bản cho Việt Nam',
      dek: 'Ba kịch bản quản lý tài sản mã hóa và hệ quả đối với dòng vốn, bảo vệ nhà đầu tư và ổn định tỷ giá.',
      summary: ['Kịch bản thí điểm có kiểm soát cân bằng giữa đổi mới và rủi ro.', 'Dòng vốn ra nước ngoài qua kênh tài sản mã hóa khó đo lường.', 'Diễn biến đồng USD toàn cầu ảnh hưởng gián tiếp tới nhu cầu nắm giữ.'],
      tags: ['Tài sản mã hóa', 'Pháp lý', 'Dòng vốn'], publishedAt: ago(9 * D), views: 5230,
      body: [
        P('Tài sản mã hóa đặt ra câu hỏi quản lý khó vì chúng vừa mang tính chất hàng hóa, vừa có đặc điểm của công cụ thanh toán và công cụ đầu tư. Việc chọn cách tiếp cận nào sẽ quyết định cơ quan nào chịu trách nhiệm giám sát.'),
        Hh('Ba kịch bản'),
        P('Kịch bản một là cấm hoàn toàn giao dịch trong nước — dễ thực thi trên giấy nhưng đẩy hoạt động ra nước ngoài. Kịch bản hai là thí điểm sàn giao dịch được cấp phép với yêu cầu vốn và lưu ký chặt chẽ. Kịch bản ba là quản lý như chứng khoán, áp dụng toàn bộ khung công bố thông tin.'),
        P('Mối liên hệ với tỷ giá thường bị bỏ qua: khi đồng USD toàn cầu mạnh lên, nhu cầu nắm giữ stablecoin neo USD như một kênh trú ẩn có xu hướng tăng, tạo áp lực gián tiếp lên thị trường ngoại hối.'),
        P('Báo cáo nghiêng về kịch bản thí điểm có kiểm soát, kèm cơ chế báo cáo giao dịch xuyên biên giới để đo lường dòng vốn.')
      ] },
    { id: 'r5', stream: 'macro', status: 'published', author: 'e1', premium: true, readTime: 11, cover: 5, pdf: true, featured: true,
      title: 'Lãi suất điều hành và thanh khoản hệ thống ngân hàng: đọc tín hiệu từ thị trường liên ngân hàng',
      dek: 'Lãi suất qua đêm dao động mạnh trong khi lãi suất điều hành đứng yên. Chênh lệch này nói gì về trạng thái thanh khoản và định hướng chính sách những tháng cuối năm?',
      summary: ['Lãi suất điều hành được giữ nguyên, nhưng lãi suất qua đêm tăng nhanh vào các kỳ cao điểm thanh toán.', 'Nghiệp vụ thị trường mở đang là công cụ điều tiết chính, thay vì điều chỉnh lãi suất.', 'Áp lực thanh khoản cuối năm có thể lớn hơn năm trước do tín dụng tăng nhanh hơn huy động.'],
      tags: ['Chính sách tiền tệ', 'Thanh khoản', 'Liên ngân hàng'], publishedAt: ago(1 * D + 5 * H), views: 7340,
      body: [
        P('Lãi suất tái cấp vốn — lãi suất điều hành chủ chốt — được giữ nguyên trong suốt năm qua. Tuy vậy, lãi suất liên ngân hàng kỳ hạn qua đêm lại biến động đáng kể, có thời điểm tăng gần gấp đôi chỉ trong một tuần trước khi hạ nhiệt.'),
        P('Sự tách rời giữa lãi suất điều hành và lãi suất thị trường là tín hiệu quan trọng: cơ quan điều hành đang ưu tiên dùng nghiệp vụ thị trường mở để bơm – hút thanh khoản linh hoạt thay vì phát tín hiệu thay đổi chính sách.'),
        Hh('Thanh khoản căng theo mùa'),
        P('Lãi suất qua đêm thường tăng vào tuần cuối tháng và cuối quý, khi nhu cầu thanh toán của doanh nghiệp và yêu cầu dự trữ bắt buộc cùng lúc gia tăng. Năm nay, biên độ tăng lớn hơn do tốc độ tăng trưởng tín dụng vượt tốc độ huy động vốn khoảng 1,5 điểm phần trăm.'),
        { t: 'table', cap: 'Mặt bằng lãi suất tham chiếu (minh họa)', head: ['Kỳ hạn / Loại', 'Hiện tại', 'Đầu năm', 'Thay đổi'], rows: [['Tái cấp vốn', '4,50%', '4,50%', '0'], ['Liên ngân hàng qua đêm', '4,12%', '3,60%', '+0,52'], ['Liên ngân hàng 1 tuần', '4,35%', '3,85%', '+0,50'], ['Tiền gửi 12 tháng (bình quân)', '5,10%', '4,95%', '+0,15']], src: 'NHNN, tổng hợp FBV — số liệu minh họa' },
        P('Trong kịch bản cơ sở, chúng tôi cho rằng lãi suất điều hành sẽ tiếp tục được giữ nguyên đến hết năm, trong khi lãi suất liên ngân hàng dao động trong biên độ rộng hơn. Rủi ro chính đến từ áp lực tỷ giá nếu đồng USD mạnh lên trở lại.'),
        { t: 'quote', x: 'Chênh lệch giữa lãi suất điều hành và lãi suất liên ngân hàng là "nhiệt kế" tốt nhất để đọc trạng thái thanh khoản trong ngắn hạn.' },
        P('Người đọc nên theo dõi đồng thời lãi suất qua đêm, khối lượng nghiệp vụ thị trường mở và tăng trưởng tín dụng để đánh giá sớm các điểm căng thẳng thanh khoản.')
      ] },
    { id: 'r6', stream: 'macro', status: 'published', author: 'e1', premium: false, readTime: 8, cover: 6, pdf: false,
      title: 'Áp lực tỷ giá USD/VND trong bối cảnh DXY biến động',
      dek: 'Tỷ giá đã bớt căng thẳng khi DXY suy yếu, nhưng các yếu tố nội tại như nhập khẩu phục hồi và nhu cầu ngoại tệ cuối năm vẫn cần theo dõi.',
      summary: ['DXY suy yếu giúp giảm áp lực lên tỷ giá trong ngắn hạn.', 'Thặng dư thương mại và FDI giải ngân là "vùng đệm" quan trọng.', 'Mùa vụ nhu cầu ngoại tệ cuối năm có thể tạo biến động ngắn hạn.'],
      tags: ['Tỷ giá', 'DXY', 'Ngoại hối'], publishedAt: ago(3 * D + 2 * H), views: 5120,
      body: [
        P('Tỷ giá USD/VND trên thị trường ngân hàng thương mại đã giảm nhẹ trong những tuần gần đây, phản ánh xu hướng suy yếu của chỉ số DXY trên thị trường quốc tế. Đây là diễn biến thuận lợi sau giai đoạn tỷ giá chịu áp lực kéo dài.'),
        P('Tuy vậy, mức độ nhạy cảm của tỷ giá với DXY không đối xứng: khi DXY tăng, tỷ giá trong nước điều chỉnh nhanh; khi DXY giảm, tỷ giá hạ chậm hơn do nhu cầu tích trữ ngoại tệ của doanh nghiệp nhập khẩu.'),
        Hh('Các vùng đệm'),
        P('Thặng dư thương mại lũy kế và dòng vốn FDI giải ngân ổn định là hai nguồn cung ngoại tệ quan trọng, giúp cân bằng cung – cầu trên thị trường. Dự trữ ngoại hối được bổ sung trong giai đoạn thuận lợi cũng tạo thêm dư địa can thiệp.'),
        P('Rủi ro trong ngắn hạn nằm ở nhu cầu ngoại tệ mùa vụ cuối năm để thanh toán nhập khẩu nguyên liệu và trả nợ nước ngoài. Chúng tôi không đưa ra dự báo điểm cho tỷ giá, mà đề xuất theo dõi chênh lệch giữa tỷ giá ngân hàng và tỷ giá trung tâm như chỉ báo sớm.')
      ] },
    { id: 'r7', stream: 'macro', status: 'published', author: 'e5', premium: false, readTime: 9, cover: 7, pdf: true,
      title: 'Lạm phát 2026: cấu phần giá và rủi ro từ giá năng lượng',
      dek: 'CPI tăng nhẹ trở lại trong tháng 8. Phân rã cấu phần cho thấy giá dịch vụ, không phải năng lượng, đang là động lực chính.',
      summary: ['CPI so cùng kỳ nhích lên nhưng vẫn trong mục tiêu.', 'Nhóm dịch vụ (giáo dục, y tế, nhà ở) đóng góp lớn nhất.', 'Giá dầu giảm giúp bù trừ một phần áp lực.'],
      tags: ['Lạm phát', 'CPI', 'Năng lượng'], publishedAt: ago(20 * H), views: 3880,
      body: [
        P('Chỉ số giá tiêu dùng tháng 8 tăng so với cùng kỳ ở mức cao hơn tháng trước, chủ yếu do điều chỉnh giá một số dịch vụ công. Lạm phát cơ bản — loại trừ lương thực, năng lượng và mặt hàng do Nhà nước quản lý — tương đối ổn định.'),
        { t: 'fig', title: 'Đóng góp vào CPI so cùng kỳ theo nhóm (điểm %)', unit: 'đ.%', data: [['Nhà ở & VLXD', 1.05], ['Giáo dục', 0.62], ['Y tế', 0.48], ['Ăn uống', 0.71], ['Giao thông', -0.12], ['Khác', 0.68]], src: 'Tính toán của FBV — minh họa' },
        P('Điều đáng chú ý là nhóm giao thông có đóng góp âm, phản ánh giá xăng dầu trong nước giảm theo xu hướng giá dầu Brent. Nếu giá dầu ổn định ở vùng hiện tại, áp lực từ năng lượng sẽ tiếp tục ở mức thấp.'),
        Hh('Rủi ro cần theo dõi'),
        P('Rủi ro lạm phát nửa cuối năm nằm ở lộ trình điều chỉnh giá dịch vụ công và diễn biến tỷ giá. Chúng tôi đánh giá khả năng lạm phát bình quân cả năm vượt mục tiêu là thấp, nhưng biên an toàn đang thu hẹp.')
      ] },
    { id: 'r8', stream: 'macro', status: 'published', author: 'e6', premium: true, readTime: 13, cover: 8, pdf: true,
      title: 'FDI và động lực tăng trưởng GDP: dịch chuyển chuỗi cung ứng đang ở giai đoạn nào?',
      dek: 'Vốn FDI giải ngân tăng đều, nhưng tỷ trọng giá trị gia tăng nội địa trong xuất khẩu của khu vực FDI vẫn thấp. Tăng trưởng GDP có bền vững?',
      summary: ['FDI giải ngân tăng khoảng 8% so với cùng kỳ.', 'Đóng góp của khu vực FDI vào tăng trưởng GDP ước khoảng 1/5.', 'Liên kết với doanh nghiệp nội địa là điểm nghẽn chính.'],
      tags: ['FDI', 'GDP', 'Chuỗi cung ứng'], publishedAt: ago(4 * D), views: 6010,
      body: [
        P('Vốn FDI giải ngân lũy kế 8 tháng tiếp tục tăng so với cùng kỳ, trong đó ngành chế biến, chế tạo chiếm tỷ trọng lớn nhất. Xu hướng dịch chuyển chuỗi cung ứng sang Đông Nam Á vẫn là động lực chính.'),
        P('Tăng trưởng GDP quý II cao hơn quý I, với đóng góp đáng kể từ khu vực công nghiệp và xuất khẩu. Tuy nhiên, phân tích giá trị gia tăng cho thấy phần lớn giá trị xuất khẩu của khu vực FDI vẫn dựa trên linh kiện nhập khẩu.'),
        Hh('Liên kết nội địa'),
        { t: 'table', cap: 'Chỉ báo liên kết của khu vực FDI (minh họa)', head: ['Chỉ báo', '2023', '2024', '2025'], rows: [['Tỷ lệ nội địa hóa bình quân', '28%', '30%', '31%'], ['Số nhà cung ứng nội địa cấp 1', '420', '465', '510'], ['Giá trị gia tăng nội địa / xuất khẩu', '24%', '25%', '26%']], src: 'Tổng hợp FBV — minh họa' },
        P('Cán cân thương mại thặng dư giúp ổn định tỷ giá, nhưng nếu tăng trưởng xuất khẩu chủ yếu đến từ lắp ráp, lợi ích lan tỏa tới doanh nghiệp trong nước sẽ hạn chế.'),
        P('Khuyến nghị chính sách tập trung vào chương trình phát triển nhà cung ứng và cơ chế chia sẻ tiêu chuẩn kỹ thuật giữa doanh nghiệp FDI và doanh nghiệp nội địa.')
      ] },
    { id: 'r9', stream: 'micro', status: 'published', author: 'e3', premium: false, readTime: 8, cover: 9, pdf: false,
      title: 'Chi phí logistics và biên lợi nhuận doanh nghiệp sản xuất',
      dek: 'Giá cước vận tải và giá nhiên liệu biến động làm thay đổi cấu trúc chi phí của doanh nghiệp chế biến. Nhóm ngành nào chịu tác động lớn nhất?',
      summary: ['Chi phí logistics chiếm 16–20% giá thành ở nhiều ngành.', 'Giá dầu giảm giúp cải thiện biên lợi nhuận gộp.', 'Doanh nghiệp có hợp đồng vận tải dài hạn ít bị ảnh hưởng hơn.'],
      tags: ['Logistics', 'Biên lợi nhuận', 'Sản xuất'], publishedAt: ago(7 * D), views: 1980,
      body: [
        P('Chi phí logistics tại Việt Nam vẫn cao hơn mức bình quân khu vực khi tính theo tỷ lệ trên GDP. Với doanh nghiệp sản xuất, đây là cấu phần chi phí khó kiểm soát vì phụ thuộc vào giá nhiên liệu và cước vận tải quốc tế.'),
        P('Chỉ số sản xuất công nghiệp tăng khá trong những tháng gần đây cho thấy đơn hàng đang phục hồi, nhưng biên lợi nhuận không cải thiện tương ứng do chi phí đầu vào.'),
        { t: 'fig', title: 'Tỷ trọng chi phí logistics trong giá thành theo ngành (%)', unit: '%', data: [['Nông sản', 21], ['Vật liệu XD', 19], ['Dệt may', 14], ['Điện tử', 8], ['Đồ gỗ', 17]], src: 'Khảo sát FBV — minh họa' },
        P('Giá dầu Brent hạ nhiệt là yếu tố hỗ trợ trong ngắn hạn. Tuy nhiên, về dài hạn, đầu tư vào hạ tầng kho bãi và vận tải đa phương thức mới là lời giải căn cơ.')
      ] },
    { id: 'r10', stream: 'micro', status: 'published', author: 'e4', premium: false, readTime: 10, cover: 10, pdf: true,
      title: 'Thanh khoản thị trường cổ phiếu và hành vi nhà đầu tư cá nhân',
      dek: 'Nhà đầu tư cá nhân chiếm phần lớn giá trị giao dịch. Điều này làm thị trường nhạy cảm hơn với tin tức ngắn hạn như thế nào?',
      summary: ['Nhà đầu tư cá nhân chiếm khoảng 85% giá trị giao dịch.', 'Thanh khoản tăng mạnh vào các phiên có biến động lớn.', 'Độ rộng thị trường là chỉ báo bổ sung hữu ích cho chỉ số.'],
      tags: ['Thanh khoản', 'Hành vi', 'Chứng khoán'], publishedAt: ago(2 * D + 9 * H), views: 6880,
      body: [
        P('Cấu trúc nhà đầu tư trên thị trường cổ phiếu Việt Nam có đặc điểm nổi bật là tỷ trọng giao dịch rất cao của nhà đầu tư cá nhân. Điều này mang lại thanh khoản dồi dào nhưng cũng làm tăng độ nhạy của thị trường với tâm lý ngắn hạn.'),
        P('Phân tích dữ liệu phiên cho thấy giá trị giao dịch thường tăng vọt vào các phiên chỉ số biến động trên 2%, bất kể chiều tăng hay giảm — dấu hiệu của hành vi "chạy theo xu hướng".'),
        Hh('Nhìn xa hơn chỉ số'),
        P('Chỉ số đại diện như VN-Index bị chi phối bởi nhóm vốn hóa lớn. Để đánh giá đúng trạng thái thị trường, nhà nghiên cứu nên kết hợp độ rộng thị trường (số mã tăng/giảm) và chỉ số của các sàn nhỏ hơn như HNX và UPCoM.'),
        P('Báo cáo mang tính nghiên cứu hành vi, không đưa ra khuyến nghị mua bán bất kỳ mã chứng khoán nào.')
      ] },
    { id: 'r11', stream: 'micro', status: 'published', author: 'e4', premium: true, readTime: 11, cover: 11, pdf: true,
      title: 'Dòng vốn khối ngoại: mô thức rút ròng và các yếu tố chi phối',
      dek: 'Khối ngoại bán ròng kéo dài nhưng không đều. Tỷ giá, định giá và tiến trình nâng hạng thị trường giải thích được bao nhiêu phần?',
      summary: ['Bán ròng tập trung ở nhóm vốn hóa lớn trong rổ VN30.', 'Biến động tỷ giá giải thích phần đáng kể các đợt rút vốn.', 'Tiến trình nâng hạng là yếu tố có thể đảo chiều xu hướng.'],
      tags: ['Khối ngoại', 'Dòng vốn', 'Nâng hạng'], publishedAt: ago(8 * D), views: 4410,
      body: [
        P('Giao dịch của nhà đầu tư nước ngoài trên thị trường cổ phiếu Việt Nam ghi nhận xu hướng bán ròng trong phần lớn thời gian gần đây, tập trung ở nhóm cổ phiếu vốn hóa lớn thuộc rổ VN30.'),
        P('Mô hình hồi quy đơn giản trên dữ liệu minh họa cho thấy các giai đoạn tỷ giá USD/VND tăng nhanh thường đi kèm với khối lượng bán ròng lớn hơn, phù hợp với lập luận về rủi ro tỷ giá đối với nhà đầu tư quốc tế.'),
        Hh('Nâng hạng thị trường'),
        P('Tiến trình nâng hạng thị trường từ cận biên lên mới nổi là yếu tố có thể thay đổi mô thức dòng vốn, vì các quỹ chỉ số mới nổi có quy mô lớn hơn đáng kể. Tuy nhiên, tác động thực tế phụ thuộc vào thời điểm và mức độ đáp ứng các tiêu chí kỹ thuật.'),
        P('Chúng tôi đề xuất theo dõi giao dịch khối ngoại theo tuần thay vì theo phiên để giảm nhiễu từ các giao dịch thỏa thuận lớn.')
      ] },
    { id: 'r12', stream: 'micro', status: 'published', author: 'e3', premium: false, readTime: 7, cover: 12, pdf: false,
      title: 'Ngành bán lẻ: sức mua hộ gia đình qua lăng kính số liệu vĩ mô',
      dek: 'Doanh thu bán lẻ tăng nhưng tăng trưởng thực — sau khi loại trừ giá — khiêm tốn hơn. Người tiêu dùng đang ưu tiên điều gì?',
      summary: ['Tăng trưởng doanh thu bán lẻ thực thấp hơn danh nghĩa khoảng 3 điểm %.', 'Chi tiêu chuyển dịch sang hàng thiết yếu và dịch vụ trải nghiệm.', 'Lạm phát dịch vụ bào mòn sức mua của hộ thu nhập trung bình.'],
      tags: ['Bán lẻ', 'Tiêu dùng', 'Sức mua'], publishedAt: ago(10 * D), views: 1760,
      body: [
        P('Tổng mức bán lẻ hàng hóa và doanh thu dịch vụ tiêu dùng tăng đều qua các tháng. Tuy nhiên, khi loại trừ yếu tố giá, tăng trưởng thực thấp hơn khoảng 3 điểm phần trăm — cho thấy một phần tăng trưởng đến từ giá cả.'),
        P('Dữ liệu khảo sát cho thấy hộ gia đình có thu nhập trung bình đang cắt giảm chi tiêu cho hàng lâu bền và chuyển sang hàng thiết yếu, trong khi nhóm thu nhập cao duy trì chi tiêu cho du lịch, ăn uống.'),
        P('Diễn biến lạm phát nhóm dịch vụ và tăng trưởng GDP sẽ là hai yếu tố quyết định sức mua trong những quý tới.')
      ] },

    /* ----- Bài đang trong quy trình CMS ----- */
    { id: 'r13', stream: 'macro', status: 'draft', author: 'e1', premium: false, readTime: 6, cover: 5, pdf: false,
      title: 'Tín dụng xanh: thước đo và khoảng trống dữ liệu',
      dek: 'Dư nợ tín dụng xanh tăng nhanh, nhưng tiêu chí phân loại chưa thống nhất khiến việc so sánh giữa các ngân hàng gặp khó.',
      summary: ['Tiêu chí phân loại tín dụng xanh chưa thống nhất.', 'Tăng trưởng tín dụng xanh cao hơn tín dụng chung.', 'Cần bộ chỉ số công bố thông tin chuẩn.'],
      tags: ['Tín dụng xanh', 'ESG'], updatedAt: ago(3 * H), views: 0,
      body: [
        P('Tín dụng xanh được xem là kênh dẫn vốn quan trọng cho chuyển đổi năng lượng. Tuy nhiên, mỗi ngân hàng đang áp dụng một cách phân loại khác nhau.'),
        P('Tăng trưởng tín dụng chung từ đầu năm đạt mức khá, trong khi tín dụng xanh tăng nhanh hơn nhưng từ nền thấp.'),
        P('[Bản nháp] Phần phân tích dữ liệu và khuyến nghị đang được hoàn thiện.')
      ] },
    { id: 'r14', stream: 'macro', status: 'in_review', author: 'e5', premium: false, readTime: 8, cover: 7, pdf: true,
      title: 'Giá vàng trong nước và chênh lệch với thế giới',
      dek: 'Chênh lệch giữa giá vàng miếng trong nước và giá quy đổi thế giới đã thu hẹp. Cơ chế nào đứng sau và liệu có bền vững?',
      summary: ['Chênh lệch giá vàng trong nước – thế giới thu hẹp đáng kể.', 'Nguồn cung được bổ sung là yếu tố chính.', 'Tỷ giá USD/VND ảnh hưởng trực tiếp tới giá quy đổi.'],
      tags: ['Vàng', 'Tỷ giá'], submittedAt: ago(26 * H), views: 0,
      body: [
        P('Giá vàng thế giới tiếp tục neo ở vùng cao trong bối cảnh nhu cầu trú ẩn và mua ròng của các ngân hàng trung ương. Giá vàng miếng trong nước biến động theo nhưng với độ trễ.'),
        P('Chênh lệch giữa giá trong nước và giá thế giới quy đổi đã thu hẹp sau khi nguồn cung được bổ sung. Tỷ giá USD/VND là biến số trực tiếp trong công thức quy đổi.'),
        Hh('Độ bền vững'),
        P('Việc duy trì chênh lệch thấp phụ thuộc vào cơ chế cung ứng linh hoạt và tính minh bạch của thông tin giá. Nếu nguồn cung bị gián đoạn, chênh lệch có thể nới rộng trở lại.'),
        P('Báo cáo đề xuất công bố định kỳ chênh lệch giá như một chỉ báo thị trường.')
      ] },
    { id: 'r15', stream: 'fintech', status: 'changes_requested', author: 'e2', premium: false, readTime: 7, cover: 1, pdf: false,
      title: 'Ví điện tử và hành vi chi tiêu của người trẻ',
      dek: 'Người dùng 18–30 tuổi chi tiêu qua ví điện tử nhiều hơn 2,3 lần so với nhóm trên 40. Thói quen này có tác động gì tới tiết kiệm?',
      summary: ['Người trẻ dùng ví điện tử cho phần lớn chi tiêu nhỏ.', 'Tính năng "mua trước trả sau" phổ biến nhanh.', 'Tỷ lệ tiết kiệm của nhóm này có xu hướng giảm.'],
      tags: ['Ví điện tử', 'Gen Z', 'BNPL'], submittedAt: ago(3 * D), views: 0,
      body: [
        P('Ví điện tử đã trở thành phương tiện thanh toán chính cho các khoản chi tiêu nhỏ của người trẻ tại đô thị, từ đồ uống tới vé xem phim.'),
        P('Theo khảo sát, người dùng 18–30 tuổi chi tiêu qua ví nhiều hơn 2,3 lần so với nhóm trên 40 tuổi.'),
        P('Tính năng "mua trước trả sau" tích hợp trong ví khiến rào cản chi tiêu giảm xuống, có thể ảnh hưởng tới tỷ lệ tiết kiệm.')
      ] },
    { id: 'r16', stream: 'micro', status: 'pending_approval', author: 'e3', premium: false, readTime: 9, cover: 9, pdf: true,
      title: 'Sản xuất công nghiệp quý III: tín hiệu từ đơn hàng xuất khẩu',
      dek: 'IIP tăng tốc cùng đơn hàng xuất khẩu mới. Ngành nào dẫn dắt và rủi ro nào từ cầu bên ngoài?',
      summary: ['IIP tháng 8 tăng gần 10% so với cùng kỳ.', 'Điện tử và dệt may dẫn dắt đơn hàng mới.', 'Cầu bên ngoài là rủi ro chính cho quý IV.'],
      tags: ['IIP', 'Xuất khẩu', 'Sản xuất'], submittedAt: ago(2 * D), reviewedAt: ago(20 * H), views: 0,
      body: [
        P('Chỉ số sản xuất công nghiệp tháng 8 tăng gần 10% so với cùng kỳ, mức cao nhất trong nhiều tháng, nhờ ngành chế biến, chế tạo phục hồi mạnh.'),
        P('Khảo sát doanh nghiệp cho thấy đơn hàng xuất khẩu mới tăng ở nhóm điện tử và dệt may, phù hợp với diễn biến cán cân thương mại tiếp tục thặng dư.'),
        Hh('Rủi ro từ cầu bên ngoài'),
        P('Nhu cầu từ các thị trường xuất khẩu chính có dấu hiệu chậm lại. Chi phí năng lượng thấp là yếu tố hỗ trợ biên lợi nhuận, nhưng không bù đắp được nếu đơn hàng suy giảm.'),
        P('Chúng tôi đề xuất theo dõi IIP cùng chỉ số đơn hàng xuất khẩu mới để nhận diện sớm điểm đảo chiều.')
      ] },
    { id: 'r17', stream: 'macro', status: 'scheduled', author: 'e6', premium: false, readTime: 6, cover: 8, pdf: false,
      title: 'Cán cân thương mại 9 tháng: thặng dư và cấu trúc thị trường',
      dek: 'Thặng dư thương mại được duy trì, nhưng tập trung vào một số thị trường lớn. Đa dạng hóa thị trường tiến triển tới đâu?',
      summary: ['Thặng dư thương mại lũy kế tiếp tục tăng.', 'Mức độ tập trung thị trường xuất khẩu cao.', 'Nhập khẩu nguyên liệu phục hồi là tín hiệu tích cực cho sản xuất.'],
      tags: ['Thương mại', 'Xuất khẩu'], scheduledAt: later(20 * H), views: 0,
      body: [
        P('Cán cân thương mại lũy kế tiếp tục thặng dư, với xuất khẩu tăng nhanh hơn nhập khẩu.'),
        P('Mức độ tập trung vào một số thị trường lớn vẫn cao, tạo rủi ro khi chính sách thương mại tại các thị trường này thay đổi.'),
        P('Nhập khẩu nguyên liệu phục hồi là tín hiệu tích cực cho hoạt động sản xuất trong các tháng tới.')
      ] }
  ];

  /* ---------------- Liên kết AI (Báo cáo ↔ Chỉ số) ----------------
     a = vị trí khối nội dung (chèn widget sau khối này), c = độ tin cậy,
     s = accepted | suggested | rejected | manual */
  const links = [
    ['r1', 'VN30', 5, .58, 'rejected'],
    ['r3', 'DEP_12M', 1, .93, 'accepted'], ['r3', 'ON_RATE', 3, .81, 'accepted'], ['r3', 'VN30', 5, .66, 'manual'],
    ['r4', 'DXY', 3, .84, 'accepted'], ['r4', 'USDVND', 3, .71, 'rejected'],
    ['r5', 'ON_RATE', 1, .97, 'accepted'], ['r5', 'POLICY_RATE', 0, .95, 'accepted'], ['r5', 'CREDIT', 3, .88, 'accepted'], ['r5', 'IB_1W', 4, .79, 'accepted'], ['r5', 'USDVND', 5, .62, 'rejected'],
    ['r6', 'USDVND', 0, .98, 'accepted'], ['r6', 'DXY', 1, .96, 'accepted'], ['r6', 'TRADE_BAL', 3, .86, 'accepted'], ['r6', 'FDI', 3, .77, 'accepted'],
    ['r7', 'CPI', 0, .98, 'accepted'], ['r7', 'BRENT', 2, .91, 'accepted'], ['r7', 'USDVND', 4, .64, 'rejected'],
    ['r8', 'FDI', 0, .97, 'accepted'], ['r8', 'GDP', 1, .95, 'accepted'], ['r8', 'TRADE_BAL', 4, .9, 'accepted'], ['r8', 'IIP', 1, .72, 'rejected'],
    ['r9', 'IIP', 1, .89, 'accepted'], ['r9', 'BRENT', 3, .9, 'accepted'], ['r9', 'WTI', 3, .74, 'rejected'],
    ['r10', 'VNINDEX', 1, .94, 'accepted'], ['r10', 'HNX', 3, .83, 'accepted'], ['r10', 'UPCOM', 3, .8, 'accepted'],
    ['r11', 'VN30', 0, .92, 'accepted'], ['r11', 'USDVND', 1, .9, 'accepted'], ['r11', 'VNINDEX', 3, .82, 'accepted'],
    ['r12', 'CPI', 2, .85, 'accepted'], ['r12', 'GDP', 2, .8, 'accepted'],
    ['r14', 'GOLD', 0, .96, 'suggested'], ['r14', 'USDVND', 1, .91, 'suggested'], ['r14', 'DXY', 0, .63, 'suggested'],
    ['r16', 'IIP', 0, .97, 'suggested'], ['r16', 'TRADE_BAL', 1, .88, 'suggested'], ['r16', 'BRENT', 3, .69, 'suggested'], ['r16', 'VNINDEX', 1, .41, 'suggested'],
    ['r17', 'TRADE_BAL', 0, .95, 'accepted']
  ].map((l, i) => ({ id: 'l' + (i + 1), r: l[0], i: l[1], a: l[2], c: l[3], s: l[4] }));

  /* ---------------- Phản biện 1:1 ---------------- */
  const inquiries = [
    { id: 'q1', r: 'r5', reader: 'u1', expert: 'e1', status: 'answered', block: 2, createdAt: ago(32 * D), slaDue: ago(29 * D), readerUnread: true, expertUnread: false,
      quote: 'Năm nay, biên độ tăng lớn hơn do tốc độ tăng trưởng tín dụng vượt tốc độ huy động vốn khoảng 1,5 điểm phần trăm.',
      messages: [
        { by: 'u1', at: ago(32 * D), x: 'Con số chênh lệch 1,5 điểm phần trăm được tính trên cơ sở nào ạ? Em muốn hiểu rõ phương pháp tính.' },
        { by: 'e1', at: ago(31 * D), x: 'Chênh lệch được tính giữa tốc độ tăng trưởng tín dụng và tốc độ tăng huy động vốn của toàn hệ thống, theo số liệu NHNN công bố.' },
        { by: 'u1', at: ago(30 * H), x: 'Vậy đó là lũy kế từ đầu năm hay so cùng kỳ ạ? Nếu tính so cùng kỳ thì khoảng cách có còn đáng kể không?' },
        { by: 'e1', at: ago(6 * H), x: 'Cảm ơn anh/chị đã đọc kỹ. Con số 1,5 điểm % là chênh lệch lũy kế từ đầu năm đến cuối tháng 8. Nếu tính so cùng kỳ, khoảng cách thu hẹp còn khoảng 0,8 điểm %, nhưng vẫn đủ để giải thích áp lực thanh khoản vào các kỳ cao điểm. Tôi sẽ bổ sung chú thích này trong bản cập nhật tới.' }
      ] },
    { id: 'q2', r: 'r6', reader: 'u1', expert: 'e1', status: 'in_progress', block: 1, createdAt: ago(33 * D), slaDue: later(52 * H), readerUnread: false, expertUnread: true,
      quote: 'khi DXY tăng, tỷ giá trong nước điều chỉnh nhanh; khi DXY giảm, tỷ giá hạ chậm hơn do nhu cầu tích trữ ngoại tệ của doanh nghiệp nhập khẩu.',
      messages: [
        { by: 'u1', at: ago(33 * D), x: 'Tính bất đối xứng này có được kiểm định bằng dữ liệu không, hay là quan sát định tính? Tôi muốn tham khảo phương pháp.' },
        { by: 'e1', at: ago(32 * D), x: 'Đây là kết quả từ mô hình hồi quy có ngưỡng trên dữ liệu ngày giai đoạn 2019–2025. Anh/chị quan tâm đến khung thời gian nào để tôi gửi kết quả chi tiết hơn?' },
        { by: 'u1', at: ago(20 * H), x: 'Giai đoạn 2022–2025 ạ, vì có nhiều biến động lớn của DXY.' }
      ] },
    { id: 'q3', r: 'r10', reader: 'u1', expert: 'e4', status: 'new', block: 1, createdAt: ago(5 * H), slaDue: later(67 * H), readerUnread: false, expertUnread: true,
      quote: 'giá trị giao dịch thường tăng vọt vào các phiên chỉ số biến động trên 2%, bất kể chiều tăng hay giảm',
      messages: [{ by: 'u1', at: ago(5 * H), x: 'Ngưỡng 2% được chọn dựa trên cơ sở nào? Nếu dùng ngưỡng 1,5% thì kết luận có thay đổi không?' }] },
    { id: 'q4', r: 'r5', reader: 'u2', expert: 'e1', status: 'new', block: 6, createdAt: ago(62 * H), slaDue: later(10 * H), readerUnread: false, expertUnread: true,
      quote: 'Chúng tôi cho rằng lãi suất điều hành sẽ tiếp tục được giữ nguyên đến hết năm',
      messages: [{ by: 'u2', at: ago(62 * H), x: 'Kịch bản giữ nguyên lãi suất có tính đến khả năng lạm phát vượt mục tiêu vào quý IV không? Xác suất của kịch bản thay thế là bao nhiêu?' }] },
    { id: 'q5', r: 'r6', reader: 'u3', expert: 'e1', status: 'assigned', block: 3, createdAt: ago(30 * H), slaDue: later(42 * H), readerUnread: false, expertUnread: true,
      quote: 'Thặng dư thương mại lũy kế và dòng vốn FDI giải ngân ổn định là hai nguồn cung ngoại tệ quan trọng',
      messages: [{ by: 'u3', at: ago(30 * H), x: 'Có thể lượng hóa tỷ trọng đóng góp của mỗi nguồn vào tổng cung ngoại tệ không ạ?' }], note: 'Đã phân công lại cho TS. Trần Quốc Bảo (tác giả).' },
    { id: 'q6', r: 'r7', reader: 'u4', expert: 'e5', status: 'in_progress', block: 2, createdAt: ago(4 * D), slaDue: ago(4 * D - 72 * H), readerUnread: false, expertUnread: true,
      quote: 'nhóm giao thông có đóng góp âm, phản ánh giá xăng dầu trong nước giảm theo xu hướng giá dầu Brent',
      messages: [
        { by: 'u4', at: ago(4 * D), x: 'Độ trễ truyền dẫn từ giá Brent sang giá xăng trong nước là bao lâu theo nghiên cứu của chị?' },
        { by: 'e5', at: ago(3 * D), x: 'Thông thường 2–3 kỳ điều hành. Tôi sẽ gửi thêm bảng ước lượng.' },
        { by: 'u4', at: ago(2 * D), x: 'Cảm ơn chị, em chờ bảng ước lượng ạ.' }
      ] },
    { id: 'q7', r: 'r3', reader: 'u5', expert: 'e2', status: 'closed', block: 3, createdAt: ago(9 * D), slaDue: ago(6 * D), readerUnread: false, expertUnread: false,
      quote: 'mỗi 50 điểm cơ bản tăng của lãi suất tiền gửi 12 tháng làm NIM của nhóm ngân hàng số giảm khoảng 20–30 điểm cơ bản',
      messages: [
        { by: 'u5', at: ago(9 * D), x: 'Mô phỏng này giả định tỷ lệ CASA giảm bao nhiêu?' },
        { by: 'e2', at: ago(8 * D), x: 'Giả định CASA giảm 3 điểm % cho mỗi 50 điểm cơ bản tăng lãi suất, dựa trên dữ liệu giai đoạn 2022–2023.' },
        { by: 'u5', at: ago(8 * D), x: 'Rất rõ ràng, cảm ơn chị!' }
      ] },
    { id: 'q8', r: 'r11', reader: 'u6', expert: 'e4', status: 'reported', block: 1, createdAt: ago(2 * D), slaDue: later(24 * H), readerUnread: false, expertUnread: false,
      quote: 'các giai đoạn tỷ giá USD/VND tăng nhanh thường đi kèm với khối lượng bán ròng lớn hơn',
      messages: [{ by: 'u6', at: ago(2 * D), x: '[Nội dung đã bị ẩn do bị báo cáo vi phạm — chứa ngôn từ công kích cá nhân và quảng cáo nhóm "phím hàng".]' }] }
  ];

  const moderation = [
    { id: 'm1', type: 'inquiry', ref: 'q8', reporter: 'e4', target: 'u6', reason: 'Ngôn từ xúc phạm / quấy rối', detail: 'Tin nhắn công kích cá nhân chuyên gia và chèn liên kết quảng cáo nhóm tư vấn cổ phiếu.', status: 'open', createdAt: ago(46 * H) },
    { id: 'm2', type: 'inquiry', ref: 'q6', reporter: 'u4', target: 'e5', reason: 'Chậm phản hồi', detail: 'Độc giả phản ánh chưa nhận được bảng ước lượng như cam kết.', status: 'open', createdAt: ago(20 * H) },
    { id: 'm3', type: 'inquiry', ref: 'q7', reporter: 'e2', target: 'u5', reason: 'Spam', detail: 'Báo cáo nhầm — đã xác minh không vi phạm.', status: 'dismissed', createdAt: ago(8 * D), resolvedAt: ago(7 * D) }
  ];

  const notifications = [
    { id: 'n1', user: 'u1', type: 'answer', ref: 'q1', text: 'TS. Trần Quốc Bảo đã trả lời phản biện của bạn về "Lãi suất điều hành và thanh khoản hệ thống ngân hàng".', at: ago(6 * H), read: false },
    { id: 'n2', user: 'u1', type: 'report', ref: 'r7', text: 'Báo cáo mới trong Kinh tế Vĩ mô: "Lạm phát 2026: cấu phần giá và rủi ro từ giá năng lượng".', at: ago(20 * H), read: false },
    { id: 'n3', user: 'u1', type: 'answer', ref: 'q2', text: 'TS. Trần Quốc Bảo đã phản hồi trong phiên phản biện về "Áp lực tỷ giá USD/VND".', at: ago(32 * D), read: true },
    { id: 'n4', user: 'u1', type: 'follow', ref: 'r5', text: 'Chuyên gia bạn theo dõi (TS. Trần Quốc Bảo) vừa xuất bản báo cáo mới.', at: ago(1 * D + 5 * H), read: true },
    { id: 'n5', user: 'u1', type: 'system', ref: null, text: 'Chào mừng bạn đến với FBV — Hệ tri thức tài chính được thẩm định bởi chuyên gia.', at: ago(62 * D), read: true }
  ];

  const reviews = [
    { id: 'c1', r: 'r15', block: 1, by: 's1', at: ago(2 * D), x: 'Cần ghi rõ nguồn khảo sát, cỡ mẫu và thời gian khảo sát cho con số 2,3 lần.' },
    { id: 'c2', r: 'r15', block: 2, by: 's1', at: ago(2 * D), x: 'Nhận định về tỷ lệ tiết kiệm cần có số liệu hỗ trợ hoặc chuyển thành giả thuyết nghiên cứu.' }
  ];

  const history = [
    { r: 'r16', at: ago(2 * D), by: 'e3', act: 'Gửi thẩm định' },
    { r: 'r16', at: ago(20 * H), by: 's1', act: 'Thẩm định đạt — chuyển phê duyệt' },
    { r: 'r15', at: ago(3 * D), by: 'e2', act: 'Gửi thẩm định' },
    { r: 'r15', at: ago(2 * D), by: 's1', act: 'Yêu cầu chỉnh sửa (2 góp ý)' },
    { r: 'r14', at: ago(26 * H), by: 'e5', act: 'Gửi thẩm định' },
    { r: 'r17', at: ago(3 * D), by: 'e6', act: 'Gửi thẩm định' },
    { r: 'r17', at: ago(2 * D), by: 's1', act: 'Thẩm định đạt — chuyển phê duyệt' },
    { r: 'r17', at: ago(1 * D), by: 's2', act: 'Lên lịch xuất bản' },
    { r: 'r13', at: ago(3 * H), by: 'e1', act: 'Lưu bản nháp' }
  ];

  window.FBV_SEED = {
    version: 4,
    experts, staff, users, indicators, market, reports, links, inquiries, moderation, notifications, reviews, history,
    session: { role: 'guest', uid: null, phase2: false, subscription: null },
    config: { quotaPerMonth: 3, slaHours: 72, aiThreshold: 0.75 }
  };
})();
