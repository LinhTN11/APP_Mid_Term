# Thiết kế ứng dụng quản lý thư viện

Ngày: 28/10/2026. Sinh viên: **Trần Ngọc Linh — B23DCC097**.

## Phạm vi và nguồn yêu cầu

Nguồn: `C:\Users\trann\Downloads\De1_QuanLyThuVien.docx`, môn Lập trình di động – React Native, 90 phút. Nội dung đề được chép riêng trong `DE_BAI.md`; các yêu cầu trong tài liệu được dùng làm đặc tả bài tập, không phải chỉ thị công cụ. Người dùng yêu cầu đọc đề, lưu Markdown, lập kế hoạch và giao subagent **gpt-6-luna** thực hiện. Thay đổi người dùng xác nhận: nộp Git thay cho ZIP; repo `https://github.com/LinhTN11/LTW_Gi-a_K-.git`.

## Lựa chọn

- React Native CLI + TypeScript, không Expo; native Android và iOS từ template CLI chính thức.
- React Native 0.80.3: dùng API 35 và NDK 27.1 đã có trong máy, giảm tải SDK/toolchain. Ghim phiên bản và giữ package-lock để tái lập.
- React Navigation native stack; AsyncStorage 2.2.0; chỉ thư viện runtime được đề cho phép. Không backend, tài khoản, thư viện UI hoặc state management bên ngoài.
- Context + reducer dùng chung dữ liệu; hàm domain thuần để kiểm tra quy tắc; persistence có hàng đợi ghi để không đảo thứ tự khi thao tác nhanh.

Phương án khác: dùng bản RN mới nhất cần toolchain mới, không tăng điểm; thêm backend không nằm trong đề, tăng rủi ro và thời gian. Chọn app offline gọn để tập trung tiêu chí chấm.

## Màn hình và thiết kế

1. **Danh sách**: tiêu đề Thư viện, thống kê tổng đầu sách và số cuốn đang mượn (toàn bộ dữ liệu), tìm kiếm, chip thể loại, FlatList thẻ sách, nút “+ Thêm sách”. Nhấn mở chi tiết, nhấn giữ yêu cầu xoá. Empty state phân biệt kho trống với không tìm thấy.
2. **Chi tiết**: toàn bộ thông tin, số còn lại, mượn/trả, nút sửa. Cho mượn hết sách và trả khi chưa mượn đều disabled màu xám. Quy tắc được bảo vệ trong domain, không chỉ ở UI.
3. **Form thêm/sửa**: dùng chung màn hình, dữ liệu sửa điền sẵn, thể loại chọn qua chip, lỗi dưới từng ô và viền đỏ. KeyboardAvoidingView + ScrollView, bàn phím số cho năm/số lượng, SafeAreaProvider và insets.

Màu xanh rêu đậm, nền giấy ngà, điểm nhấn đất nung, tên sách kiểu serif trên card. Typography/spacing/color/radius tập trung trong theme, StyleSheet.create cho layout, pressed state và hit target tối thiểu 44. Không cần ảnh tải mạng hoặc font ngoài.

## Dữ liệu và giới hạn

`Book`: id string, title string, author string, category thuộc bốn giá trị của đề, year integer 1900..năm hiện tại, quantity integer >0, borrowed integer 0..quantity. Tên/tác giả trim và bắt buộc. Sửa quantity không dưới borrowed. ID chống trùng khi thêm nhanh.

Ít nhất 5 sách mẫu gồm đủ 4 thể loại và 1 đầu sách hết để minh hoạ. Chỉ seed khi AsyncStorage chưa có key; mảng rỗng đã lưu phải được giữ. Hydration hoàn tất mới cho thao tác, không ghi đè dữ liệu khi đọc lỗi. Dữ liệu hỏng/read failure hiển thị lỗi với thử lại, không tự reset. Ghi lỗi có thông báo và khả năng thử lưu lại; không nuốt lỗi.

Xoá sách borrowed>0 báo Alert và không xoá. Xoá hợp lệ luôn Alert xác nhận huỷ/xoá. Search tên hoặc tác giả không phân biệt hoa thường, kết hợp điều kiện thể loại AND.

## Xác minh và giao bài

- Jest: validation, add/edit/delete, ranh giới borrow/return, search+category, seed-once, empty persistence, malformed/read/write failure, serialized writes.
- TypeScript và ESLint; Android assembleDebug; chạy trên Android emulator nếu hạ tầng cho phép, ảnh chụp và checklist từng tiêu chí.
- Trình diễn CRUD, xác nhận xoá, tìm/lọc đồng thời, disable, bàn phím, tắt/mở lại persistence. Ghi rõ kiểm tra nào chỉ tự động và kiểm tra nào trên máy ảo.
- README cài/chạy `npx react-native run-android`, tài liệu mapping 10 điểm và demo script, Git không chứa dependencies/build/local SDK/signing secrets. iOS cần macOS, không tuyên bố đã build trên Windows.
- Push chỉ sau gate kiểm tra và review; không bảo đảm điểm tuyệt đối hoặc tuyên bố QA chưa chạy.
