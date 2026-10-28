# Checklist chấm điểm — Ứng dụng quản lý thư viện

Thang điểm theo đề: tổng 10 điểm. Các mục dưới đây map trực tiếp tới source để giảng viên có thể kiểm tra.

| Câu | Điểm | Yêu cầu / nơi kiểm tra | Bằng chứng |
| --- | ---: | --- | --- |
| 1. Danh sách | 1,5 | [BookListScreen](../LibraryApp/src/screens/BookListScreen.tsx), [BookCard](../LibraryApp/src/components/BookCard.tsx), [seed](../LibraryApp/src/data/seedBooks.ts) | Đã kiểm tra Android: 5 đầu sách, tổng đang mượn 4, card và nhãn Hết sách đỏ; [ảnh](evidence/01-list.png). |
| 2. Thêm / sửa | 1,5 | [BookFormScreen](../LibraryApp/src/screens/BookFormScreen.tsx), [validation](../LibraryApp/src/domain/books.ts) | Đã thêm/sửa trên emulator; preload, lỗi bắt buộc/năm/số lượng và quantity < borrowed đều được kiểm tra; có test domain/screen. |
| 3. Xoá | 1,0 | [BookListScreen](../LibraryApp/src/screens/BookListScreen.tsx), [deleteBook](../LibraryApp/src/domain/books.ts) | Đã thử nhấn giữ, chặn sách đang mượn, Huỷ giữ nguyên và xác nhận mới xoá trên emulator; có test nghiệp vụ/screen. |
| 4. Chi tiết, mượn/trả | 1,5 | [BookDetailScreen](../LibraryApp/src/screens/BookDetailScreen.tsx), [domain](../LibraryApp/src/domain/books.ts) | Đã xem chi tiết, mượn đến hết và trả đến 0, kiểm tra nút disabled trên emulator; test boundary/domain/screen. |
| 5. Tìm kiếm / lọc | 1,5 | [BookListScreen](../LibraryApp/src/screens/BookListScreen.tsx), [filterBooks](../LibraryApp/src/domain/books.ts) | `HAWKING` + Khoa học có kết quả; đổi Giáo trình rỗng, xoá bộ lọc khôi phục; native và domain test đạt. |
| 6. AsyncStorage | 1,0 | [bookStorage](../LibraryApp/src/data/bookStorage.ts), [LibraryProvider](../LibraryApp/src/state/LibraryContext.tsx) | Force-stop/mở lại giữ sách thêm/sửa/borrowed; dữ liệu xoá và `[]` vẫn giữ, không reseed. Lỗi read/write/retry kiểm tra bằng integration tests. |
| 7. Giao diện | 2,0 | [theme](../LibraryApp/src/theme/index.ts), [components](../LibraryApp/src/components/), [screens](../LibraryApp/src/screens/) | Đã xem bố cục 360×800dp, card/shadow, lỗi đỏ, kho rỗng, keyboard số và safe area. [Ô số lượng + nút lưu nằm trên IME](evidence/18-keyboard-fixed.png). |
| **Tổng** | **10,0** | [Đề bài](../DE_BAI.md) | Không cam kết điểm; việc chấm cuối cùng thuộc giảng viên. |

## Phân biệt phạm vi xác minh

- **Automated:** **31/31 test, 6 suite**, TypeScript và ESLint đạt. Chạy bằng `powershell -ExecutionPolicy Bypass -File scripts/check-submission.ps1` từ thư mục gốc; [log](evidence/submission-check.txt).
- **Native:** Android `assembleDebug` thành công với JDK 21.0.6, Node 24.15.0, Gradle 8.14.1, React Native 0.80.3, compile SDK 35, NDK 27.1; CLI cài/mở ứng dụng trên Pixel_9 API 36. Build và launch không tự chứng minh mọi tương tác UI.
- **Visual và interaction QA:** các luồng trong [QA_NATIVE.md](QA_NATIVE.md) đạt trên Pixel_9 API 36, viewport 360×800dp. Chưa xác minh iOS, thiết bị thật và mọi cỡ chữ/viewport.
- **Persistence qua vòng đời ứng dụng thật:** đã kiểm tra force-stop/mở lại với dữ liệu thêm/sửa/mượn/xoá và kho rỗng.

## Điểm dễ bị trừ

- Đề yêu cầu không crash khi thao tác; chạy từng flow và xác minh lỗi bất thường trên thiết bị.
- Năm phải từ 1900 đến năm hiện tại; quantity là số nguyên dương; không giảm quantity xuống dưới số đang mượn.
- Mọi thao tác xoá phải xác nhận; sách đang có lượt mượn không thể xoá.
- Search và filter phải cùng có hiệu lực; disabled mượn/trả phải đúng biên.
- Thể loại dữ liệu chỉ gồm bốn loại trong đề; “Tất cả” chỉ là lựa chọn lọc.
- App phải được tạo/chạy bằng React Native CLI; iOS chỉ xác minh được trên macOS/Xcode.
