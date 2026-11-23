# Landing page Hải Vân Bay

Một trang duy nhất (`index.html`, không thư viện, không ảnh nặng) giới thiệu dự án Vinhomes Hải Vân Bay,
kèm hệ thống lưu khách hàng về Google Sheet:

| Khi nào | Lưu gì | Tab trong Sheet |
|---|---|---|
| Khách **mở trang** | Thời gian, mã phiên, mã trình duyệt (nhận ra khách quay lại), lượt xem thứ mấy, mã KH và tên trong link cá nhân, nguồn / chiến dịch (UTM), trang dẫn tới, thiết bị, hệ điều hành, trình duyệt, ngôn ngữ, múi giờ | `LuotXem` |
| Khách **rời trang** | Thời gian xem (giây), độ cuộn tối đa, các mục đã xem, các nút đã bấm (gọi, Zalo, xem giá…) — cập nhật vào đúng dòng ở trên | `LuotXem` |
| Khách **gửi form** | Họ tên, SĐT, email, nhu cầu, sản phẩm, ngân sách, giờ tiện liên hệ, lời nhắn + nguồn và số lượt đã xem; đồng thời **gửi email báo** cho bạn | `DangKy` |

> Trang web không tự biết tên / số điện thoại của người xem. Để biết **ai** đang xem, gửi cho mỗi khách một
> **link cá nhân**: `https://<trang-cua-ban>/?kh=KH001&ten=Nguyen%20Van%20A&utm_source=zalo&utm_campaign=voucher-t11`.
> Khi khách đó mở link, dòng trong `LuotXem` có mã và tên của họ, và bạn nhận email "Khách … vừa mở trang".

## Cài đặt (khoảng 5 phút, làm một lần)

1. Mở Google Sheet **"Hải Vân Bay – Khách hàng từ Landing Page"** (đã tạo sẵn trong Drive, có 2 tab `DangKy` và `LuotXem`).
2. **Tiện ích mở rộng → Apps Script**. Xóa code mẫu, dán toàn bộ nội dung `apps-script/Code.gs`, bấm Lưu.
   (Muốn nhận email ở địa chỉ khác thì điền `NOTIFY_EMAIL` ở đầu file.)
3. Chọn hàm `setup` → **Chạy** → cấp quyền (Google sẽ hỏi quyền Sheet và gửi email).
4. **Triển khai → Tùy chọn triển khai mới → Loại: Ứng dụng web**
   - Thực thi với tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   → **Triển khai**, sao chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`).
5. Mở `index.html`, tìm khối `CONFIG` ở cuối file và điền:
   - `endpoint`: URL vừa sao chép
   - `phone`, `zalo`, `advisor`: số điện thoại / Zalo / tên của bạn
6. Đưa trang lên mạng (chọn một):
   - **Netlify Drop**: kéo thả thư mục `hai-van-bay` vào https://app.netlify.com/drop → có link ngay.
   - **GitHub Pages / Vercel / Cloudflare Pages**: trỏ tới thư mục `hai-van-bay`.
   - Hosting riêng: chép `index.html` lên là chạy.
7. Mở trang thử một lần, gửi thử form → kiểm tra 2 tab trong Sheet có dòng mới và hộp thư có email.

Khi sửa `Code.gs` sau này: **Triển khai → Quản lý triển khai → Sửa → Phiên bản mới** (giữ nguyên URL).

## Chỉnh nội dung
- Toàn bộ nội dung nằm trong `index.html`; số liệu dự án ở các mục `#tong-quan`, `#vi-tri`, `#san-pham`, `#chinh-sach`.
- Thông tin giá / chính sách thay đổi theo từng đợt của Chủ đầu tư: cập nhật lại trước khi gửi link cho khách.
- Trang ghi rõ đây là trang của chuyên viên tư vấn, không phải website chính thức của Chủ đầu tư; giữ dòng này.

## Dữ liệu cá nhân
Trang có thông báo thu thập dữ liệu (theo Nghị định 13/2023/NĐ-CP) ở chân trang và ô đồng ý trong form.
Không thu thập địa chỉ IP hay vị trí. Chỉ dùng dữ liệu để tư vấn dự án; xóa khi khách yêu cầu.
