# Sổ Thu Chi – Ứng dụng quản lý chi tiêu cá nhân

Web app gọn nhẹ, chạy hoàn toàn trên trình duyệt (không cần cài đặt, không cần server). Dữ liệu được lưu ngay trên máy của bạn (localStorage).

## Cách dùng
- Mở file `index.html` bằng trình duyệt (Chrome, Edge, Safari, Firefox) là dùng được, kể cả khi không có mạng.
- Hoặc chạy server tĩnh: `python3 -m http.server` rồi vào http://localhost:8000
- Lần đầu dùng: **Cài đặt → Nạp dữ liệu mẫu** để xem thử thống kê.
- Phím tắt: nhấn **N** để thêm giao dịch nhanh, **Esc** để đóng.

## Tính năng
| Màn hình | Nội dung |
|---|---|
| **Tổng quan** | Tổng tài sản (tiền mặt + đang đầu tư), thu/chi/đầu tư/tiền mặt còn lại tháng này, danh mục đầu tư, tỷ lệ tiết kiệm, so sánh với tháng trước, biểu đồ 6 tháng, cơ cấu chi tiêu, cảnh báo ngân sách, giao dịch gần đây |
| **Giao dịch** | Sổ ghi chép nhóm theo ngày; tìm kiếm, lọc theo loại (thu / chi / đầu tư) / danh mục / khoảng ngày; bấm vào dòng để sửa, xóa |
| **Thống kê** | Theo **Ngày / Tuần / Tháng / Quý / Năm**, chuyển kỳ trước/sau; tổng thu, tổng chi, đầu tư, tiền mặt còn lại, chi trung bình/ngày, % thay đổi so với kỳ trước; biểu đồ cột diễn biến và biểu đồ tròn + bảng xếp hạng theo danh mục |
| **Dòng tiền** | Kế hoạch dòng tiền cho từng tháng (mặc định tháng tới). Dòng tiền tới hạn nhận: Lương, Hoa hồng từ bán hàng (công ty), Hoa hồng quản lý (công ty), Hoa hồng khác 1, Hoa hồng khác 2, Thu nhập khác, Khoản về khác 1, Khoản về khác 2. Công nợ phải thu: Khoản 1–5 (đặt tên người / đơn vị nợ, có ngày hẹn trả); là danh sách tiền người khác còn nợ, hiện ở mọi tháng cho tới khi thu được, chỉ tính vào chênh lệch của tháng có ngày hẹn trả. Chi ra: Trả ngân hàng, Thanh toán tiền mua BĐS, Khoản chi khác 1–3 (các khoản "khác" đổi tên được). Mỗi dòng có số tiền, ngày dự kiến, ghi chú và nút **Ghi vào sổ** tạo giao dịch thật (bấm lại để hoàn tác). Có tổng, chênh lệch, tiền mặt dự kiến và nút sao chép kế hoạch tháng trước |
| **Ngân sách** | Đặt hạn mức tháng cho từng khoản chi, thanh tiến độ màu xanh / vàng (≥80%) / đỏ (vượt), tự cảnh báo khi nhập khoản chi vượt hạn mức |
| **Cài đặt** | Xuất Excel (.xlsx) theo khoảng thời gian, gồm các sheet Tổng quan, Giao dịch, Theo hạng mục, Theo tháng, Ngân sách, Dòng tiền dự kiến (nút ⬇️ Excel ở Thống kê xuất nhanh kỳ đang xem); sao lưu / khôi phục (.json), dữ liệu mẫu, xóa dữ liệu, giao diện sáng/tối |

### 11 khoản thu nhập
Lương · Thưởng · Kinh doanh · Lãi đầu tư / Cổ tức · Lãi tiết kiệm · Cho thuê tài sản · Làm thêm / Freelance · Hoa hồng từ bán hàng · Hoa hồng quản lý · Được tặng / Lì xì · Thu nhập khác

Ngoài ra có mục **Vốn có sẵn / Số dư đầu kỳ** (khi nhập khoản thu) cho tiền có từ trước khi dùng app: cộng vào tiền mặt và tài sản nhưng không tính là thu nhập, nên không làm sai tỷ lệ tiết kiệm.

### 23 khoản chi tiêu
Nhà ở / Thuê nhà · Gia đình · Bố mẹ · Xăng xe ô tô · Phí xe ô tô · Điện thoại · Ăn uống & cà phê (ăn uống và cà phê hằng ngày) · Tiếp khách · Chi phí quà tặng, biếu khách hàng · Mua sắm cá nhân · Mua sắm cho con (đồ chơi, quần áo, đồ dùng học tập…) · Mua hàng TMĐT cá nhân · Sức khỏe / Y tế · Giáo dục / Học tập · Giải trí / Du lịch · Thể thao · Vệ sinh cá nhân (cắt tóc, gội đầu) · Phần mềm / App · Bảo hiểm · Trả nợ (gốc / lãi) · Trả tiền mua BĐS · Thuế TNCN · Chi phí khác

### 5 khoản trả nợ
Trả nợ ngân hàng (gốc) · Trả lãi vay · Thẻ tín dụng / Trả góp · Trả nợ cá nhân / người thân · Trả nợ khác

Trả nợ làm giảm tiền mặt nhưng **không tính là chi tiêu**, nên khoản trả lớn (ví dụ trả ngân hàng) không làm sai thống kê chi tiêu. Trong mục Dòng tiền, khoản "Trả ngân hàng" khi bấm Ghi vào sổ được ghi thành Trả nợ ngân hàng (gốc).

**Hoa hồng chưa nhận (theo căn)** (trong mục Dòng tiền): danh sách phần hoa hồng chưa về của từng căn, chia nhóm Ngoài công ty / Trong công ty – bán hàng / Trong công ty – quản lý. Chưa tính vào thu nhập và tiền mặt; bấm "Nhận tiền" khi tiền về (nhận một phần thì sửa số tiền) để ghi vào thu nhập và trừ phần còn lại. File Excel có sheet "Hoa hồng chưa nhận".

**Dư nợ phải trả** (trong mục Dòng tiền): nhập dư nợ hiện tại của từng khoản vay. Mỗi khoản Trả nợ gắn với khoản vay (chọn ở ô "Trừ vào khoản nợ" khi nhập) được trừ dần vào dư nợ; Trả lãi vay không trừ vào nợ gốc. Tổng quan hiện tổng dư nợ phải trả và tài sản ròng (tài sản − dư nợ); file Excel có sheet "Dư nợ phải trả".

### 5 khoản đầu tư
Chứng khoán / Cổ phiếu · Cryptos · Vàng / Bạc · Bất động sản · Gửi tiết kiệm

Mỗi giao dịch đầu tư là **Rót vốn** (chuyển tiền mặt vào đầu tư) hoặc **Rút vốn** (bán / tất toán về tiền mặt).
Đầu tư không bị tính là chi tiêu: tiền chỉ chuyển từ *tiền mặt* sang *tài sản đầu tư*.
- Tổng tài sản = Tổng thu + vốn có sẵn − Tổng chi − Trả nợ
- Tiền mặt = Tổng tài sản − (Rót vốn − Rút vốn)
- Lãi/cổ tức nhận được ghi ở khoản thu "Lãi đầu tư / Cổ tức" hoặc "Lãi tiết kiệm"

## Cấu trúc
```
index.html                 Giao diện
css/style.css              Kiểu dáng (responsive, sáng/tối)
js/app.js                  Toàn bộ logic
js/vendor/chart.umd.min.js Chart.js 4.4.1 (MIT) – vẽ biểu đồ
```

> Lưu ý: dữ liệu nằm trong trình duyệt đang dùng. Xóa dữ liệu trình duyệt sẽ mất dữ liệu – hãy dùng **Sao lưu** định kỳ.

## Bản web trên claude.ai
`python3 tools/build_artifact.py dist/so-thu-chi.html` gộp toàn bộ app thành một trang duy nhất để đăng lên claude.ai.
Khi mở trên claude.ai, dữ liệu được lưu vào kho riêng của tài khoản (chỉ người dùng đó xem được) và đồng bộ giữa các thiết bị;
khi mở `index.html` trực tiếp, dữ liệu vẫn lưu trong trình duyệt như trước.
