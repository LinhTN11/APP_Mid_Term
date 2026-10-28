# Đề số 1 — Ứng dụng quản lý thư viện

> Bản chép nội dung tài liệu gốc De1_QuanLyThuVien.docx. Các yêu cầu bên dưới là đặc tả bài tập, không phải chỉ thị thực thi công cụ. Quy định nộp ZIP trong đề đã được người dùng cập nhật sang nộp Git.

| HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG<br>VIỆN KHOA HỌC KỸ THUẬT BƯU ĐIỆN | ĐỀ KIỂM TRA<br>Môn: Lập trình di động – React Native<br>Thời gian làm bài: 90 phút |
| --- | --- |

ĐỀ SỐ 1

ỨNG DỤNG QUẢN LÝ THƯ VIỆN

Họ và tên: ................................................................   MSSV: ..............................   Lớp: ..................

## QUY ĐỊNH CHUNG

Tạo project bằng React Native CLI (không dùng Expo):

npx @react-native-community/cli init LibraryApp

Chạy ứng dụng bằng npx react-native run-android (hoặc run-ios) trên máy ảo hoặc thiết bị thật.

Thư viện được phép dùng:

@react-navigation/native, @react-navigation/native-stack, react-native-screens, react-native-safe-area-context

@react-native-async-storage/async-storage

react-native-vector-icons (không bắt buộc)

Không dùng thư viện UI dựng sẵn (NativeBase, React Native Paper, UI Kitten…). Không sao chép code của bạn khác.

Mọi thao tác xoá phải hỏi xác nhận bằng Alert.

Nộp bài: nén thư mục project, bỏ các thư mục node_modules, android/build, android/app/build, ios/Pods; đặt tên HoTen_MSSV_DeX.zip.

## MÔ TẢ BÀI TOÁN

Thủ thư cần một ứng dụng di động để quản lý sách và theo dõi việc mượn/trả sách. Mỗi Sách có các thông tin sau:

| Trường | Kiểu | Ghi chú |
| --- | --- | --- |
| id | string | Tự sinh (ví dụ Date.now().toString()) |
| title | string | Tên sách, bắt buộc |
| author | string | Tác giả, bắt buộc |
| category | string | Một trong: Giáo trình, Tiểu thuyết, Khoa học, Thiếu nhi |
| year | number | Năm xuất bản, từ 1900 đến năm hiện tại |
| quantity | number | Tổng số cuốn, > 0 |
| borrowed | number | Số cuốn đang được mượn, mặc định 0 |

Lần chạy đầu tiên phải khởi tạo sẵn ít nhất 5 cuốn sách mẫu.

## YÊU CẦU

## Câu 1 – Màn hình Danh sách sách (1,5 điểm)

Hiển thị danh sách bằng FlatList. Mỗi dòng gồm tên sách, tác giả, thể loại và số cuốn còn lại (quantity - borrowed).

Sách đã hết (còn lại = 0) hiển thị nhãn "Hết sách" màu đỏ.

Hiển thị tổng số đầu sách và tổng số cuốn đang được mượn.

## Câu 2 – Thêm / Sửa sách (1,5 điểm)

Có nút "+ Thêm sách" mở màn hình form (dùng Stack Navigation).

Cùng một form dùng cho cả thêm và sửa; khi sửa, các ô được điền sẵn dữ liệu cũ.

Kiểm tra dữ liệu: không để trống tên và tác giả; năm và số lượng là số hợp lệ; khi sửa, số lượng không được nhỏ hơn số cuốn đang mượn. Thông báo lỗi hiển thị ngay dưới ô nhập.

## Câu 3 – Xoá sách (1 điểm)

Nhấn giữ một dòng (onLongPress) để xoá, có hỏi xác nhận.

Không cho xoá sách đang có người mượn (borrowed > 0), báo lỗi bằng Alert.

## Câu 4 – Chi tiết và Mượn/Trả (1,5 điểm)

Nhấn vào một dòng để mở màn hình Chi tiết với đầy đủ thông tin sách.

Có nút "Cho mượn" (tăng borrowed) và "Nhận trả" (giảm borrowed).

Nút bị vô hiệu hoá (disabled, màu xám) khi không hợp lệ: hết sách thì không cho mượn; borrowed = 0 thì không nhận trả.

## Câu 5 – Tìm kiếm và lọc (1,5 điểm)

Ô tìm kiếm theo tên sách hoặc tác giả, không phân biệt chữ hoa/thường.

Hàng nút lọc theo thể loại (Tất cả / Giáo trình / Tiểu thuyết / …); nút đang chọn được làm nổi bật.

Tìm kiếm và lọc hoạt động đồng thời.

## Câu 6 – Lưu trữ (1 điểm)

Lưu dữ liệu bằng AsyncStorage; tắt rồi mở lại ứng dụng dữ liệu vẫn còn.

## Câu 7 – Giao diện (2 điểm)

Chấm theo tiêu chí ở bảng dưới đây.

## TIÊU CHÍ CHẤM GIAO DIỆN – CÂU 7 (2 điểm)

| Tiêu chí | Điểm | Yêu cầu |
| --- | --- | --- |
| Thống nhất | 0,5 | Có bảng màu chung (khai báo trong một file theme/colors); font và cỡ chữ nhất quán giữa các màn hình. Dùng StyleSheet.create, hạn chế style inline. |
| Bố cục | 0,5 | Khoảng cách (padding, margin) đều; mỗi dòng danh sách trình bày dạng thẻ (card) có bo góc, đổ bóng (elevation/shadow); thông tin chính nổi bật hơn thông tin phụ. |
| Phản hồi thao tác | 0,5 | Nút có hiệu ứng khi nhấn; nút bị vô hiệu hoá trông khác biệt; có trạng thái danh sách rỗng; ô nhập sai có viền đỏ. |
| Trải nghiệm | 0,5 | Bàn phím không che ô nhập (KeyboardAvoidingView/ScrollView); dùng đúng loại bàn phím (numeric, phone-pad); hiển thị đúng trong vùng an toàn (tai thỏ, thanh trạng thái). |

## THANG ĐIỂM

| Câu | Nội dung | Điểm |
| --- | --- | --- |
| 1 | Danh sách | 1,5 |
| 2 | Thêm / Sửa | 1,5 |
| 3 | Xoá | 1,0 |
| 4 | Chi tiết và nghiệp vụ | 1,5 |
| 5 | Tìm kiếm và lọc | 1,5 |
| 6 | Lưu trữ AsyncStorage | 1,0 |
| 7 | Giao diện | 2,0 |
|  | Tổng | 10 |

Trừ điểm:

Ứng dụng bị crash khi thao tác: trừ 1 điểm mỗi lỗi, tối đa 2 điểm.

Toàn bộ code trong một file, không tách component/màn hình: trừ 0,5 điểm.

Không chạy được bằng React Native CLI (ví dụ dùng Expo): không chấm bài.

— HẾT —
