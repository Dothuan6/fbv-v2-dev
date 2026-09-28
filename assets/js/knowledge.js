/* =========================================================
   FBV v2 — MÔ HÌNH HỆ TRI THỨC (dữ liệu giả)
   Lĩnh vực → Chủ đề → Tài liệu / Khái niệm / Chỉ số
   Bổ sung vào FBV_SEED: domains, topics, concepts + metadata tri thức cho tài liệu.
   Toàn bộ nội dung là MINH HỌA.
   ========================================================= */
(function () {
  const S = window.FBV_SEED; const D = 864e5;
  const ago = (ms) => new Date(Date.now() - ms).toISOString();
  S.version = 6;

  S.domains = [
    { id: 'macro', name: 'Kinh tế Vĩ mô', short: 'Vĩ mô', icon: 'globe', color: '#0369A1', tint: '#E0F2FE', desc: 'Chính sách tiền tệ, tỷ giá, lạm phát, tăng trưởng và thương mại quốc tế.' },
    { id: 'fintech', name: 'Fintech', short: 'Fintech', icon: 'cpu', color: '#4F46E5', tint: '#EEF2FF', desc: 'Thanh toán số, ngân hàng số, khung pháp lý thử nghiệm và tài sản mã hóa.' },
    { id: 'micro', name: 'Kinh tế Vi mô', short: 'Vi mô', icon: 'building', color: '#047857', tint: '#ECFDF5', desc: 'Thị trường vốn, hành vi nhà đầu tư, doanh nghiệp, chuỗi cung ứng và tiêu dùng.' }
  ];

  /* ---------------- Chủ đề ---------------- */
  S.topics = [
    { id: 't_monetary', domain: 'macro', name: 'Chính sách tiền tệ & Lãi suất', icon: 'coins',
      summary: 'Cách Ngân hàng Nhà nước điều hành lãi suất và thanh khoản, và cách các tín hiệu này lan truyền tới lãi suất thị trường, tín dụng và giá tài sản. Chủ đề tập trung vào khoảng cách giữa lãi suất điều hành và lãi suất liên ngân hàng như một “nhiệt kế” thanh khoản.',
      points: [{ x: 'Lãi suất điều hành được giữ ổn định; nghiệp vụ thị trường mở là công cụ điều tiết thanh khoản chính.', r: 'r5' }, { x: 'Lãi suất qua đêm tăng mạnh theo mùa vụ (cuối tháng, cuối quý) khi tín dụng tăng nhanh hơn huy động.', r: 'r5' }, { x: 'Chi phí vốn tăng làm thu hẹp lợi thế biên lãi ròng của nhóm ngân hàng số.', r: 'r3' }],
      indicators: ['POLICY_RATE', 'ON_RATE', 'IB_1W', 'DEP_12M', 'CREDIT'], concepts: ['c_policy_rate', 'c_interbank', 'c_omo', 'c_liquidity', 'c_bps'], related: ['t_fx', 't_credit', 't_inflation'], experts: ['e1', 'e5'] },
    { id: 't_fx', domain: 'macro', name: 'Tỷ giá & Cán cân thanh toán', icon: 'globe',
      summary: 'Diễn biến tỷ giá USD/VND trong mối liên hệ với đồng USD toàn cầu (DXY), cung – cầu ngoại tệ trong nước và các vùng đệm như thặng dư thương mại, FDI và dự trữ ngoại hối.',
      points: [{ x: 'Tỷ giá trong nước phản ứng bất đối xứng với DXY: tăng nhanh khi DXY tăng, giảm chậm khi DXY giảm.', r: 'r6' }, { x: 'Thặng dư thương mại và FDI giải ngân là hai nguồn cung ngoại tệ quan trọng nhất.', r: 'r6' }, { x: 'Biến động tỷ giá giải thích phần đáng kể các đợt bán ròng của khối ngoại.', r: 'r11' }],
      indicators: ['USDVND', 'DXY', 'TRADE_BAL', 'FDI'], concepts: ['c_dxy', 'c_fx_reserve', 'c_trade_balance', 'c_stablecoin'], related: ['t_monetary', 't_trade', 't_capital'], experts: ['e1', 'e6'] },
    { id: 't_inflation', domain: 'macro', name: 'Lạm phát & Giá cả', icon: 'chart',
      summary: 'Phân rã cấu phần của chỉ số giá tiêu dùng, vai trò của giá năng lượng, giá dịch vụ công và tác động của lạm phát lên sức mua hộ gia đình.',
      points: [{ x: 'Nhóm dịch vụ (nhà ở, giáo dục, y tế) đang là động lực chính của CPI, không phải năng lượng.', r: 'r7' }, { x: 'Giá dầu giảm giúp nhóm giao thông đóng góp âm vào CPI.', r: 'r7' }, { x: 'Tăng trưởng bán lẻ thực thấp hơn danh nghĩa khoảng 3 điểm phần trăm do yếu tố giá.', r: 'r12' }],
      indicators: ['CPI', 'BRENT', 'WTI'], concepts: ['c_cpi', 'c_core_inflation', 'c_real_growth'], related: ['t_monetary', 't_consumer'], experts: ['e5'] },
    { id: 't_growth', domain: 'macro', name: 'Tăng trưởng & FDI', icon: 'bars',
      summary: 'Động lực tăng trưởng GDP, vai trò của khu vực FDI và mức độ lan tỏa sang doanh nghiệp nội địa trong bối cảnh dịch chuyển chuỗi cung ứng.',
      points: [{ x: 'FDI giải ngân tăng khoảng 8% so với cùng kỳ, tập trung vào chế biến, chế tạo.', r: 'r8' }, { x: 'Giá trị gia tăng nội địa trong xuất khẩu của khu vực FDI vẫn thấp (khoảng 1/4).', r: 'r8' }],
      indicators: ['GDP', 'FDI', 'IIP'], concepts: ['c_fdi', 'c_gdp', 'c_value_added'], related: ['t_trade', 't_industry'], experts: ['e6'] },
    { id: 't_trade', domain: 'macro', name: 'Thương mại quốc tế', icon: 'layers',
      summary: 'Cán cân thương mại, mức độ tập trung thị trường xuất khẩu và mối liên hệ giữa đơn hàng xuất khẩu với sản xuất công nghiệp trong nước.',
      points: [{ x: 'Thặng dư thương mại được duy trì nhưng tập trung vào một số thị trường lớn.', r: 'r8' }, { x: 'Thặng dư giúp ổn định tỷ giá, song lợi ích lan tỏa hạn chế nếu xuất khẩu chủ yếu là lắp ráp.', r: 'r8' }],
      indicators: ['TRADE_BAL', 'IIP', 'USDVND'], concepts: ['c_trade_balance', 'c_value_added'], related: ['t_growth', 't_fx', 't_industry'], experts: ['e6'] },
    { id: 't_credit', domain: 'macro', name: 'Tín dụng & Hệ thống ngân hàng', icon: 'building',
      summary: 'Tăng trưởng tín dụng, cơ cấu nguồn vốn của ngân hàng và các thước đo mới như tín dụng xanh.',
      points: [{ x: 'Tín dụng tăng nhanh hơn huy động là nguồn gốc của áp lực thanh khoản cuối năm.', r: 'r5' }, { x: 'Tỷ lệ CASA cao giúp ngân hàng số duy trì biên lãi ròng tốt hơn trung bình ngành.', r: 'r3' }],
      indicators: ['CREDIT', 'DEP_12M', 'VN30'], concepts: ['c_nim', 'c_casa', 'c_liquidity'], related: ['t_monetary', 't_digitalbank'], experts: ['e1', 'e2'] },
    { id: 't_payment', domain: 'fintech', name: 'Thanh toán số', icon: 'card',
      summary: 'Quy mô và động lực của thanh toán không tiền mặt tại Việt Nam, vai trò của QR liên ngân hàng, và các giới hạn tăng trưởng ở hộ kinh doanh nhỏ và khu vực nông thôn.',
      points: [{ x: 'Chuẩn hóa QR liên ngân hàng và miễn phí chuyển khoản tạo hiệu ứng mạng lưới nhanh.', r: 'r1' }, { x: 'Giá trị bình quân mỗi giao dịch giảm dần — tăng trưởng đến từ chi tiêu nhỏ, thường nhật.', r: 'r1' }, { x: 'Giới hạn tăng trưởng nằm ở hộ kinh doanh nhỏ, là vấn đề chính sách thuế nhiều hơn công nghệ.', r: 'r1' }],
      indicators: ['CPI'], concepts: ['c_qr', 'c_bnpl'], related: ['t_digitalbank', 't_consumer'], experts: ['e2'] },
    { id: 't_digitalbank', domain: 'fintech', name: 'Ngân hàng số', icon: 'phone',
      summary: 'Mô hình kinh doanh ngân hàng số, cấu trúc nguồn vốn giá rẻ (CASA), chi phí thu hút khách hàng và độ nhạy của biên lãi ròng với chi phí vốn.',
      points: [{ x: 'Mỗi 50 điểm cơ bản tăng lãi suất tiền gửi làm NIM ngân hàng số giảm khoảng 20–30 điểm cơ bản.', r: 'r3' }, { x: 'Chi phí thu hút khách hàng (CAC) là biến số quyết định giai đoạn tới.', r: 'r3' }],
      indicators: ['DEP_12M', 'ON_RATE', 'VN30'], concepts: ['c_nim', 'c_casa', 'c_bps'], related: ['t_credit', 't_payment', 't_monetary'], experts: ['e2'] },
    { id: 't_regtech', domain: 'fintech', name: 'Pháp lý & Khung thử nghiệm', icon: 'shield',
      summary: 'Khung thử nghiệm có kiểm soát (sandbox) cho fintech, tiêu chí “tốt nghiệp” và bài học từ khu vực.',
      points: [{ x: 'Sandbox hiệu quả cần tiêu chí tốt nghiệp rõ ràng và cơ chế chia sẻ dữ liệu giám sát.', r: 'r2' }, { x: 'Thí điểm có kiểm soát là kịch bản cân bằng nhất cho tài sản mã hóa.', r: 'r4' }],
      indicators: [], concepts: ['c_sandbox'], related: ['t_crypto', 't_payment'], experts: ['e2', 'e4'] },
    { id: 't_crypto', domain: 'fintech', name: 'Tài sản mã hóa', icon: 'cpu',
      summary: 'Các kịch bản quản lý tài sản mã hóa và hệ quả đối với dòng vốn, bảo vệ nhà đầu tư và tỷ giá.',
      points: [{ x: 'Khi USD mạnh lên, nhu cầu nắm giữ stablecoin neo USD tăng, tạo áp lực gián tiếp lên thị trường ngoại hối.', r: 'r4' }],
      indicators: ['DXY', 'USDVND'], concepts: ['c_stablecoin', 'c_sandbox'], related: ['t_regtech', 't_fx'], experts: ['e4'] },
    { id: 't_capital', domain: 'micro', name: 'Thị trường vốn & Nhà đầu tư', icon: 'chart',
      summary: 'Cấu trúc nhà đầu tư trên thị trường cổ phiếu, thanh khoản, hành vi nhà đầu tư cá nhân và mô thức dòng vốn khối ngoại.',
      points: [{ x: 'Nhà đầu tư cá nhân chiếm khoảng 85% giá trị giao dịch, làm thị trường nhạy với tâm lý ngắn hạn.', r: 'r10' }, { x: 'Độ rộng thị trường là chỉ báo bổ sung cần thiết cho chỉ số đại diện.', r: 'r10' }, { x: 'Tiến trình nâng hạng thị trường có thể đảo chiều xu hướng rút vốn của khối ngoại.', r: 'r11' }],
      indicators: ['VNINDEX', 'VN30', 'HNX', 'UPCOM'], concepts: ['c_breadth', 'c_foreign_flow', 'c_upgrade', 'c_liquidity'], related: ['t_fx', 't_credit'], experts: ['e4'] },
    { id: 't_industry', domain: 'micro', name: 'Doanh nghiệp & Chuỗi cung ứng', icon: 'building',
      summary: 'Cấu trúc chi phí, chi phí logistics, biên lợi nhuận của doanh nghiệp sản xuất và tín hiệu từ đơn hàng xuất khẩu.',
      points: [{ x: 'Chi phí logistics chiếm 16–20% giá thành ở nhiều ngành sản xuất.', r: 'r9' }, { x: 'Giá dầu hạ nhiệt hỗ trợ biên lợi nhuận ngắn hạn; lời giải dài hạn là hạ tầng vận tải đa phương thức.', r: 'r9' }],
      indicators: ['IIP', 'BRENT', 'TRADE_BAL'], concepts: ['c_logistics', 'c_iip', 'c_value_added'], related: ['t_growth', 't_trade'], experts: ['e3'] },
    { id: 't_consumer', domain: 'micro', name: 'Tiêu dùng & Bán lẻ', icon: 'wallet',
      summary: 'Sức mua hộ gia đình qua số liệu bán lẻ, lạm phát dịch vụ và xu hướng chuyển dịch chi tiêu.',
      points: [{ x: 'Chi tiêu chuyển dịch sang hàng thiết yếu và dịch vụ trải nghiệm.', r: 'r12' }, { x: 'Lạm phát dịch vụ bào mòn sức mua của hộ thu nhập trung bình.', r: 'r12' }],
      indicators: ['CPI', 'GDP'], concepts: ['c_real_growth', 'c_cpi', 'c_bnpl'], related: ['t_inflation', 't_payment'], experts: ['e3'] }
  ];

  /* ---------------- Khái niệm / Thuật ngữ ---------------- */
  const C = (id, term, aka, short, long, extra = {}) => Object.assign({ id, term, aka, short, long }, extra);
  S.concepts = [
    C('c_policy_rate', 'Lãi suất điều hành', 'Policy rate', 'Mức lãi suất do ngân hàng trung ương công bố để định hướng mặt bằng lãi suất của nền kinh tế.', 'Ở Việt Nam, lãi suất tái cấp vốn và lãi suất tái chiết khấu là hai lãi suất điều hành chủ chốt. Thay đổi lãi suất điều hành là tín hiệu chính sách mạnh; trong ngắn hạn, cơ quan điều hành thường ưu tiên công cụ thanh khoản để giữ ổn định.', { patterns: ['lãi suất điều hành', 'tái cấp vốn'], indicators: ['POLICY_RATE'], example: 'Lãi suất tái cấp vốn giữ ở 4,50% suốt năm trong khi lãi suất qua đêm dao động mạnh.' }),
    C('c_interbank', 'Thị trường liên ngân hàng', 'Interbank market', 'Nơi các ngân hàng vay – cho vay vốn ngắn hạn lẫn nhau, phản ánh trạng thái thanh khoản của hệ thống.', 'Lãi suất liên ngân hàng kỳ hạn qua đêm và 1 tuần là thước đo nhạy nhất về cung – cầu vốn ngắn hạn. Chênh lệch giữa lãi suất liên ngân hàng và lãi suất điều hành cho biết thanh khoản đang dư thừa hay căng thẳng.', { patterns: ['liên ngân hàng'], indicators: ['ON_RATE', 'IB_1W'] }),
    C('c_omo', 'Nghiệp vụ thị trường mở', 'Open Market Operations — OMO', 'Hoạt động mua – bán giấy tờ có giá của ngân hàng trung ương để bơm hoặc hút thanh khoản.', 'Khi thanh khoản căng, ngân hàng trung ương mua giấy tờ có giá (bơm tiền); khi dư thừa, phát hành tín phiếu (hút tiền). Đây là công cụ linh hoạt, không phát tín hiệu thay đổi chính sách như điều chỉnh lãi suất điều hành.', { patterns: ['nghiệp vụ thị trường mở'], indicators: ['ON_RATE'] }),
    C('c_liquidity', 'Thanh khoản hệ thống', 'System liquidity', 'Mức độ sẵn có của vốn khả dụng trong hệ thống ngân hàng để đáp ứng nhu cầu thanh toán và cho vay.', 'Thanh khoản hệ thống chịu ảnh hưởng của tăng trưởng tín dụng so với huy động, dự trữ bắt buộc, thanh toán thuế và nghiệp vụ thị trường mở. Chỉ báo quan sát nhanh nhất là lãi suất liên ngân hàng qua đêm.', { patterns: ['thanh khoản'], indicators: ['ON_RATE', 'CREDIT'] }),
    C('c_bps', 'Điểm cơ bản', 'Basis point — bps', 'Đơn vị đo thay đổi lãi suất, 1 điểm cơ bản = 0,01 điểm phần trăm.', 'Dùng để mô tả chính xác các thay đổi nhỏ của lãi suất và biên lợi nhuận. Ví dụ lãi suất tăng từ 5,10% lên 5,60% là tăng 50 điểm cơ bản.', { patterns: ['điểm cơ bản'], formula: '1 bps = 0,01% ; 100 bps = 1 điểm phần trăm' }),
    C('c_nim', 'Biên lãi ròng', 'Net Interest Margin — NIM', 'Chênh lệch giữa thu nhập lãi và chi phí lãi, chia cho tổng tài sản sinh lãi bình quân.', 'NIM phản ánh khả năng sinh lời cốt lõi của ngân hàng từ hoạt động tín dụng. NIM chịu tác động của chi phí vốn (lãi suất huy động, tỷ lệ CASA) và lợi suất cho vay.', { patterns: ['biên lãi ròng', 'NIM'], formula: 'NIM = (Thu nhập lãi − Chi phí lãi) / Tài sản sinh lãi bình quân', indicators: ['DEP_12M'] }),
    C('c_casa', 'Tiền gửi không kỳ hạn', 'CASA', 'Tiền gửi thanh toán và tiết kiệm không kỳ hạn — nguồn vốn chi phí thấp của ngân hàng.', 'Tỷ lệ CASA cao giúp ngân hàng giảm chi phí vốn bình quân. Khi lãi suất có kỳ hạn tăng, người gửi có xu hướng chuyển tiền sang kỳ hạn, làm CASA giảm.', { patterns: ['CASA', 'không kỳ hạn'], indicators: ['DEP_12M'] }),
    C('c_dxy', 'Chỉ số DXY', 'US Dollar Index', 'Chỉ số đo sức mạnh của đồng USD so với rổ 6 đồng tiền chủ chốt.', 'DXY tăng nghĩa là USD mạnh lên trên thị trường quốc tế, thường tạo áp lực mất giá lên đồng tiền của các nền kinh tế mới nổi, trong đó có VND.', { patterns: ['DXY'], indicators: ['DXY', 'USDVND'] }),
    C('c_fx_reserve', 'Dự trữ ngoại hối', 'FX reserves', 'Tài sản ngoại tệ do ngân hàng trung ương nắm giữ để can thiệp thị trường và đảm bảo thanh toán quốc tế.', 'Quy mô dự trữ ngoại hối (thường đo bằng số tuần nhập khẩu) quyết định dư địa can thiệp ổn định tỷ giá khi có cú sốc bên ngoài.', { patterns: ['dự trữ ngoại hối'], indicators: ['USDVND'] }),
    C('c_trade_balance', 'Cán cân thương mại', 'Trade balance', 'Chênh lệch giữa giá trị xuất khẩu và nhập khẩu hàng hóa trong một kỳ.', 'Thặng dư thương mại tạo nguồn cung ngoại tệ, hỗ trợ ổn định tỷ giá. Tuy nhiên chất lượng thặng dư phụ thuộc vào giá trị gia tăng nội địa trong xuất khẩu.', { patterns: ['cán cân thương mại', 'thặng dư thương mại'], indicators: ['TRADE_BAL'], formula: 'Cán cân thương mại = Xuất khẩu − Nhập khẩu' }),
    C('c_cpi', 'Chỉ số giá tiêu dùng', 'Consumer Price Index — CPI', 'Thước đo biến động giá của rổ hàng hóa, dịch vụ tiêu dùng đại diện.', 'Tốc độ tăng CPI so với cùng kỳ là thước đo lạm phát phổ biến nhất. Rổ CPI của Việt Nam gồm 11 nhóm hàng với quyền số khác nhau.', { patterns: ['CPI', 'chỉ số giá tiêu dùng'], indicators: ['CPI'] }),
    C('c_core_inflation', 'Lạm phát cơ bản', 'Core inflation', 'Lạm phát sau khi loại trừ lương thực, năng lượng và mặt hàng do Nhà nước quản lý giá.', 'Lạm phát cơ bản phản ánh xu hướng giá dài hạn và áp lực cầu, ít chịu ảnh hưởng của cú sốc cung ngắn hạn — là căn cứ quan trọng cho chính sách tiền tệ.', { patterns: ['lạm phát cơ bản'], indicators: ['CPI'] }),
    C('c_real_growth', 'Tăng trưởng thực', 'Real growth', 'Tăng trưởng sau khi loại trừ yếu tố giá (lạm phát).', 'So sánh tăng trưởng danh nghĩa và tăng trưởng thực cho biết bao nhiêu phần tăng thêm đến từ khối lượng thật và bao nhiêu từ giá cả.', { patterns: ['tăng trưởng thực', 'loại trừ yếu tố giá'], formula: 'Tăng trưởng thực ≈ Tăng trưởng danh nghĩa − Lạm phát', indicators: ['CPI', 'GDP'] }),
    C('c_fdi', 'Đầu tư trực tiếp nước ngoài', 'FDI', 'Vốn nhà đầu tư nước ngoài đầu tư dài hạn, có quyền kiểm soát doanh nghiệp tại Việt Nam.', 'Cần phân biệt FDI đăng ký và FDI giải ngân: giải ngân phản ánh dòng vốn thực vào nền kinh tế và là nguồn cung ngoại tệ ổn định.', { patterns: ['FDI'], indicators: ['FDI'] }),
    C('c_gdp', 'Tổng sản phẩm quốc nội', 'GDP', 'Tổng giá trị hàng hóa, dịch vụ cuối cùng được tạo ra trong nền kinh tế trong một kỳ.', 'Tăng trưởng GDP so với cùng kỳ theo quý là chỉ tiêu tổng hợp về sức khỏe nền kinh tế; cần xem cùng cơ cấu đóng góp theo ngành và theo khu vực.', { patterns: ['GDP'], indicators: ['GDP'] }),
    C('c_value_added', 'Giá trị gia tăng nội địa', 'Domestic value added', 'Phần giá trị do các yếu tố sản xuất trong nước tạo ra trong sản phẩm xuất khẩu.', 'Tỷ lệ giá trị gia tăng nội địa thấp cho thấy xuất khẩu phụ thuộc vào linh kiện nhập khẩu, lợi ích lan tỏa tới doanh nghiệp trong nước hạn chế.', { patterns: ['giá trị gia tăng'], indicators: ['TRADE_BAL'] }),
    C('c_iip', 'Chỉ số sản xuất công nghiệp', 'IIP', 'Thước đo biến động khối lượng sản xuất của ngành công nghiệp.', 'IIP được công bố hằng tháng, là chỉ báo sớm về hoạt động sản xuất; nên theo dõi cùng đơn hàng xuất khẩu mới.', { patterns: ['sản xuất công nghiệp', 'IIP'], indicators: ['IIP'] }),
    C('c_logistics', 'Chi phí logistics', 'Logistics cost', 'Chi phí vận tải, kho bãi, xử lý hàng hóa trên toàn chuỗi cung ứng.', 'Chi phí logistics trên GDP của Việt Nam cao hơn bình quân khu vực; là cấu phần khó kiểm soát vì phụ thuộc giá nhiên liệu và cước vận tải quốc tế.', { patterns: ['chi phí logistics', 'logistics'], indicators: ['BRENT'] }),
    C('c_qr', 'Thanh toán QR liên ngân hàng', 'Interbank QR', 'Chuẩn mã QR dùng chung cho mọi ngân hàng và ví, cho phép chuyển khoản tức thời bằng một mã.', 'Chuẩn hóa QR giúp người bán chỉ cần một mã cho mọi ngân hàng, giảm chi phí chấp nhận thanh toán và thúc đẩy thanh toán không tiền mặt.', { patterns: ['mã QR', 'QR liên ngân hàng'] }),
    C('c_bnpl', 'Mua trước trả sau', 'Buy Now Pay Later — BNPL', 'Hình thức tín dụng tiêu dùng ngắn hạn cho phép thanh toán sau hoặc trả góp không lãi.', 'BNPL giảm rào cản chi tiêu nhưng có thể làm tăng rủi ro nợ của người trẻ nếu thiếu cơ chế đánh giá khả năng trả nợ.', { patterns: ['mua trước trả sau'] }),
    C('c_sandbox', 'Khung thử nghiệm có kiểm soát', 'Regulatory sandbox', 'Cơ chế cho phép doanh nghiệp thử nghiệm sản phẩm tài chính mới với phạm vi giới hạn dưới sự giám sát.', 'Sandbox hiệu quả cần tiêu chí tham gia, tiêu chí “tốt nghiệp”, thời hạn và cơ chế bảo vệ khách hàng rõ ràng.', { patterns: ['sandbox', 'thử nghiệm có kiểm soát'] }),
    C('c_stablecoin', 'Stablecoin', 'Đồng tiền ổn định', 'Tài sản mã hóa được neo giá theo một tài sản tham chiếu, thường là USD.', 'Stablecoin neo USD có thể trở thành kênh trú ẩn hoặc chuyển vốn xuyên biên giới khó đo lường, ảnh hưởng gián tiếp tới thị trường ngoại hối.', { patterns: ['stablecoin'], indicators: ['DXY'] }),
    C('c_breadth', 'Độ rộng thị trường', 'Market breadth', 'Tương quan số mã tăng giá, giảm giá và đứng giá trong một phiên.', 'Độ rộng giúp đánh giá xu hướng có lan tỏa hay chỉ do một nhóm vốn hóa lớn dẫn dắt chỉ số.', { patterns: ['độ rộng thị trường'], indicators: ['VNINDEX', 'HNX', 'UPCOM'] }),
    C('c_foreign_flow', 'Giao dịch khối ngoại', 'Foreign flows', 'Giá trị mua – bán của nhà đầu tư nước ngoài; chênh lệch là mua ròng hoặc bán ròng.', 'Nên theo dõi theo tuần thay vì theo phiên để giảm nhiễu từ giao dịch thỏa thuận lớn.', { patterns: ['khối ngoại', 'bán ròng'], indicators: ['VNINDEX', 'VN30'] }),
    C('c_upgrade', 'Nâng hạng thị trường', 'Market reclassification', 'Việc thị trường được tổ chức xếp hạng chuyển từ nhóm cận biên lên nhóm mới nổi.', 'Nâng hạng giúp thị trường thuộc danh mục của các quỹ chỉ số mới nổi có quy mô lớn hơn, nhưng tác động phụ thuộc thời điểm và mức độ đáp ứng tiêu chí kỹ thuật.', { patterns: ['nâng hạng'], indicators: ['VNINDEX'] })
  ];
  // Gắn chủ đề ngược cho khái niệm
  S.concepts.forEach((c) => { c.topics = S.topics.filter((t) => t.concepts.includes(c.id)).map((t) => t.id); c.indicators = c.indicators || []; });

  /* ---------------- Metadata tri thức cho tài liệu ---------------- */
  const META = {
    r1: { topics: ['t_payment'], level: 'foundation', version: '1.1', code: 'FIN-001' },
    r2: { topics: ['t_regtech'], level: 'foundation', version: '1.0', code: 'FIN-002' },
    r3: { topics: ['t_digitalbank', 't_credit', 't_monetary'], level: 'advanced', version: '1.2', code: 'FIN-003' },
    r4: { topics: ['t_crypto', 't_regtech', 't_fx'], level: 'analysis', version: '1.0', code: 'FIN-004' },
    r5: { topics: ['t_monetary', 't_credit'], level: 'analysis', version: '1.1', code: 'MAC-005' },
    r6: { topics: ['t_fx', 't_trade'], level: 'foundation', version: '1.0', code: 'MAC-006' },
    r7: { topics: ['t_inflation'], level: 'foundation', version: '1.0', code: 'MAC-007' },
    r8: { topics: ['t_growth', 't_trade'], level: 'advanced', version: '1.3', code: 'MAC-008' },
    r9: { topics: ['t_industry'], level: 'analysis', version: '1.0', code: 'MIC-009' },
    r10: { topics: ['t_capital'], level: 'foundation', version: '1.1', code: 'MIC-010' },
    r11: { topics: ['t_capital', 't_fx'], level: 'advanced', version: '1.0', code: 'MIC-011' },
    r12: { topics: ['t_consumer', 't_inflation'], level: 'analysis', version: '1.0', code: 'MIC-012' },
    r13: { topics: ['t_credit'], level: 'analysis', version: '0.1', code: 'MAC-013' },
    r14: { topics: ['t_fx'], level: 'analysis', version: '0.9', code: 'MAC-014' },
    r15: { topics: ['t_payment'], level: 'foundation', version: '0.9', code: 'FIN-015' },
    r16: { topics: ['t_industry', 't_trade'], level: 'analysis', version: '1.0', code: 'MIC-016' },
    r17: { topics: ['t_trade'], level: 'foundation', version: '1.0', code: 'MAC-017' }
  };
  const SRC = {
    macro: ['Ngân hàng Nhà nước Việt Nam — Thông cáo điều hành chính sách tiền tệ', 'Cục Thống kê — Tình hình kinh tế – xã hội hằng tháng', 'Tổng hợp & mô hình của FBV Research (số liệu minh họa)'],
    fintech: ['Báo cáo thanh toán điện tử — tổng hợp từ các tổ chức trung gian thanh toán', 'Tài liệu khung pháp lý fintech khu vực ASEAN', 'Khảo sát người dùng của FBV Fintech Lab (số liệu minh họa)'],
    micro: ['Dữ liệu giao dịch HOSE/HNX qua nhà cung cấp dữ liệu', 'Báo cáo tài chính doanh nghiệp niêm yết', 'Khảo sát doanh nghiệp của FBV Research (số liệu minh họa)']
  };
  S.reports.forEach((r) => {
    const m = META[r.id] || {}; Object.assign(r, { topics: m.topics || [], level: m.level || 'analysis', version: m.version || '1.0', docCode: 'FBV-' + (m.code || r.id.toUpperCase()), reviewer: 's1', sources: SRC[r.stream] });
    if (r.publishedAt && r.version !== '1.0') r.revisedAt = new Date(new Date(r.publishedAt).getTime() + 0.4 * D).toISOString();
    r.changelog = r.publishedAt ? [{ v: '1.0', at: r.publishedAt, x: 'Xuất bản lần đầu sau thẩm định học thuật.' }].concat(r.version !== '1.0' ? [{ v: r.version, at: r.revisedAt, x: 'Bổ sung chú thích số liệu và làm rõ phương pháp theo phản biện của độc giả.' }] : []) : [];
  });
  S.users.forEach((u) => { u.followTopics = u.id === 'u1' ? ['t_monetary', 't_fx'] : []; u.savedConcepts = u.id === 'u1' ? ['c_nim', 'c_dxy'] : []; u.highlights = u.id === 'u1' ? [{ id: 'h1', r: 'r5', block: 1, text: 'Sự tách rời giữa lãi suất điều hành và lãi suất thị trường là tín hiệu quan trọng', note: 'Dùng làm ví dụ khi giải thích OMO cho team.', at: ago(3 * D) }] : []; u.lastRead = u.id === 'u1' ? { r: 'r6', at: ago(20 * 3600e3), pct: 45 } : null; });
})();
