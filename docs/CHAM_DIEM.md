# Checklist chấm điểm — Ứng dụng quản lý thư viện

Thang điểm theo đề: tổng 10 điểm. Các mục dưới đây map trực tiếp tới source để giảng viên có thể kiểm tra.

| Câu | Điểm | Yêu cầu / nơi kiểm tra | Bằng chứng |
| --- | ---: | --- | --- |
| 1. Danh sách | 1,5 | [BookListScreen](../LibraryApp/src/screens/BookListScreen.tsx), [BookCard](../LibraryApp/src/components/BookCard.tsx), [seed](../LibraryApp/src/data/seedBooks.ts) | FlatList, thẻ sách, nhãn hết sách, tổng đầu sách và tổng sách đang mượn. Logic/domain test tự động; hiển thị thực tế Android đã chạy, đánh giá chi tiết trực quan **chưa kiểm chứng**. |
| 2. Thêm / sửa | 1,5 | [BookFormScreen](../LibraryApp/src/screens/BookFormScreen.tsx), [validation](../LibraryApp/src/domain/books.ts) | Dùng chung form, điền sẵn khi sửa, lỗi bên dưới trường; có test domain và screen. |
| 3. Xoá | 1,0 | [BookListScreen](../LibraryApp/src/screens/BookListScreen.tsx), [deleteBook](../LibraryApp/src/domain/books.ts) | Nhấn giữ, Alert xác nhận, chặn sách đang mượn; test nghiệp vụ và screen xác minh chỉ xoá sau callback xác nhận. |
| 4. Chi tiết, mượn/trả | 1,5 | [BookDetailScreen](../LibraryApp/src/screens/BookDetailScreen.tsx), [domain](../LibraryApp/src/domain/books.ts) | Chi tiết và giới hạn mượn/trả; test boundary ở domain và trạng thái disabled ở screen. Thao tác trực quan trên emulator **chưa kiểm chứng**. |
| 5. Tìm kiếm / lọc | 1,5 | [BookListScreen](../LibraryApp/src/screens/BookListScreen.tsx), [filterBooks](../LibraryApp/src/domain/books.ts) | Search tên/tác giả không phân biệt hoa thường kết hợp thể loại; test domain. Thao tác trực quan **chưa kiểm chứng**. |
| 6. AsyncStorage | 1,0 | [bookStorage](../LibraryApp/src/data/bookStorage.ts), [LibraryProvider](../LibraryApp/src/state/LibraryContext.tsx) | Test seed một lần, giữ `[]`, lỗi read/write, retry snapshot mới, và remount từ JSON. Kiểm tra vòng đời trên thiết bị **chưa kiểm chứng**. |
| 7. Giao diện | 2,0 | [theme](../LibraryApp/src/theme/index.ts), [components](../LibraryApp/src/components/), [screens](../LibraryApp/src/screens/) | Automated screen tests bao phủ lỗi field, Alert xoá và disabled boundary. Màu/chữ, bố cục, phản hồi nhấn, keyboard và safe area trên emulator **chưa kiểm chứng**. |
| **Tổng** | **10,0** | [Đề bài](../DE_BAI.md) | Không cam kết điểm; việc chấm cuối cùng thuộc giảng viên. |

## Phân biệt phạm vi xác minh

- **Automated:** Jest (domain, storage, provider và screen), `tsc --noEmit`, ESLint. Chạy bằng `powershell -ExecutionPolicy Bypass -File scripts/check-submission.ps1` từ thư mục gốc.
- **Native:** Android `assembleDebug` thành công với JDK 21.0.6, Node 24.15.0, Gradle 8.14.1, React Native 0.80.3, compile SDK 35, NDK 27.1; CLI cài/mở ứng dụng trên Pixel_9 API 36. Build và launch không tự chứng minh mọi tương tác UI.
- **Visual và interaction QA:** **chưa kiểm chứng** đến khi checklist emulator được hoàn tất.
- **Persistence qua vòng đời ứng dụng thật:** test remount provider đọc JSON đã lưu; đóng/mở app trên emulator **chưa kiểm chứng**.

## Điểm dễ bị trừ

- Đề yêu cầu không crash khi thao tác; chạy từng flow và xác minh lỗi bất thường trên thiết bị.
- Năm phải từ 1900 đến năm hiện tại; quantity là số nguyên dương; không giảm quantity xuống dưới số đang mượn.
- Mọi thao tác xoá phải xác nhận; sách đang có lượt mượn không thể xoá.
- Search và filter phải cùng có hiệu lực; disabled mượn/trả phải đúng biên.
- Thể loại dữ liệu chỉ gồm bốn loại trong đề; “Tất cả” chỉ là lựa chọn lọc.
- App phải được tạo/chạy bằng React Native CLI; iOS chỉ xác minh được trên macOS/Xcode.
