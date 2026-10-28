# Kịch bản demo (5–7 phút)

Chuẩn bị emulator đã cài app. Seed ban đầu có năm sách đủ bốn thể loại, có sách hết và sách đang mượn.

| Thời gian | Thao tác | Điều cần chỉ ra |
| --- | --- | --- |
| 0:00–0:45 | Mở app, xem danh sách và thống kê | 5 đầu sách, tổng cuốn đang mượn, nhãn “Hết sách”. |
| 0:45–1:30 | Tìm `TÔ HOÀI`, chọn thể loại Thiếu nhi; thử đổi sang Khoa học | Search không phân biệt hoa thường, điều kiện search và category kết hợp. |
| 1:30–2:30 | Mở “Nhà giả kim”, cho mượn rồi nhận trả | Chi tiết, số lượng còn, các thống kê cập nhật. |
| 2:30–3:15 | Mở sách đã hết và sách chưa mượn | “Cho mượn” bị disabled khi hết; “Nhận trả” bị disabled khi borrowed bằng 0. |
| 3:15–4:30 | Thêm sách với tên/tác giả bỏ trống; sửa lại dữ liệu hợp lệ | Lỗi hiện ngay dưới ô; cùng một form hỗ trợ tạo và sửa. |
| 4:30–5:30 | Nhấn giữ sách đang mượn, sau đó nhấn giữ sách đủ điều kiện và chọn Huỷ; thử lại rồi xác nhận Xoá | Sách đang mượn bị chặn; thao tác xoá chỉ xảy ra sau xác nhận. |
| 5:30–6:30 | Thoát/mở lại app, kiểm tra danh sách còn lại | Persistence đã kiểm tra bằng force-stop/mở lại trên emulator; giữ cả danh sách rỗng sau khi xoá hết, không seed lại. [Bằng chứng](QA_NATIVE.md). |

## Các trường hợp nên chuẩn bị khi giảng viên hỏi

- Năm trống, chữ, số thập phân, nhỏ hơn 1900 hoặc lớn hơn năm hiện tại.
- Số lượng bằng 0, số thập phân, hoặc thấp hơn số bản đang được mượn.
- Nhấn “Nhận trả” khi borrowed bằng 0; nhấn “Cho mượn” khi không còn bản.
- Xoá sách đang có lượt mượn và huỷ hộp thoại xác nhận.
- Kết hợp từ khoá không khớp với thể loại đang chọn.
- Tắt mạng: dữ liệu cục bộ vẫn có thể sử dụng. Với storage failure, dùng nút thử lại; không có thao tác reset dữ liệu tự động.
