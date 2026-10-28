# Hồ sơ kiểm tra — LibraryApp

**Ngày:** 28/10/2026 (Asia/Saigon). **Sinh viên:** Trần Ngọc Linh — B23DCC097.

## Kết quả bàn giao

Kiểm tra trên mã ứng dụng tại `34f40d2` (phần giao diện kết thúc ở `6cbe6d2`):

- `powershell -ExecutionPolicy Bypass -File .\scripts\check-submission.ps1`: **exit 0**; **6 suite, 31/31 test**, TypeScript, ESLint và kiểm tra file Git đạt. [Log](evidence/submission-check.txt).
- Android `gradlew.bat assembleDebug -PreactNativeArchitectures=x86_64`: **BUILD SUCCESSFUL**, 153 task, lần đầu 18 phút 3 giây.
- `npx react-native run-android --no-packager --active-arch-only`: build/install/launch **exit 0**, cài thành công trên một thiết bị, 2 phút 26 giây.
- Các thao tác dưới đây chạy trên giao diện Android thật của emulator, dùng ADB/UiAutomator; root đã xem ảnh chụp. [Kết quả từng tình huống](evidence/native-results.json).
- Không có bản ghi `FATAL EXCEPTION` trong crash buffer sau lượt khởi động sạch dùng cho kiểm tra bản sửa. [Crash buffer sau kiểm tra](evidence/post-fix-crash.txt). Điều này chỉ áp dụng các luồng đã thử.

## Môi trường native

Windows 11, Node 24.15.0, JBR/JDK 21.0.6, Gradle wrapper 8.14.1, React Native CLI 19.1.2 / React Native 0.80.3, compile/target SDK 35, NDK 27.1.12297006. Emulator Pixel_9 chạy Android API 36 x86_64, WHPX; viewport kiểm tra **360 × 800 dp** (720 × 1600 px, density 320).

## Đối chiếu đề và bằng chứng

| Nhóm | Đã thực hiện trên emulator | Ảnh |
| --- | --- | --- |
| Danh sách | 5 đầu sách mẫu, tổng đang mượn 4, tên/tác giả/thể loại/số còn, nhãn đỏ Hết sách | [Danh sách](evidence/01-list.png) |
| Tìm kiếm/lọc | Tìm `HAWKING` vẫn thấy Stephen Hawking; chọn Khoa học có kết quả, đổi Giáo trình không có; xoá bộ lọc trả lại danh sách | [Kết hợp](evidence/02-combined-search.png), [không tìm thấy](evidence/03-empty-results.png) |
| Validation | Tên/tác giả trống có lỗi dưới ô và viền đỏ; năm 1899 và số lượng 0 bị chặn | [Bắt buộc](evidence/05-form-errors.png), [số không hợp lệ](evidence/06-numeric-errors.png) |
| Thêm/sửa | Tạo QA Library, sửa dùng form điền sẵn; quantity 1 khi borrowed 2 bị chặn; sửa tên QA Revised, quantity 3 vẫn giữ borrowed 2 | [Ràng buộc khi sửa](evidence/11-edit-borrowed-error.png) |
| Chi tiết, mượn/trả | Sách mới chưa mượn không nhận trả; cho mượn đến hết thì nút mượn disabled; nhận trả đến 0 thì nút trả disabled | Kết quả native JSON và test boundary |
| Xoá | Nhấn giữ sách borrowed > 0 hiện Alert chặn; sách hợp lệ hiện xác nhận; Huỷ giữ nguyên, Xoá mới thực hiện | [Bị chặn](evidence/14-delete-blocked.png), [xác nhận](evidence/16-delete-confirmation.png) |
| Persistence | Force-stop/mở lại giữ sách vừa thêm, tên vừa sửa, quantity 3 và borrowed 2; sách đã xoá không xuất hiện lại | [Sau mở lại](evidence/13-cold-relaunch-persisted.png) |
| Kho rỗng | Trả hết và xoá cả 5 sách mẫu bằng các Alert; kho rỗng có nút thêm; force-stop/mở lại vẫn rỗng, không seed lại | [Kho rỗng](evidence/19-empty-library.png), [mở lại](evidence/20-empty-library-relaunch.png) |
| Bàn phím/safe area | Numeric keyboard đúng loại, toàn bộ ô số lượng và nút lưu nhìn thấy phía trên bàn phím trên màn hình nhỏ | [Bàn phím](evidence/18-keyboard-fixed.png) |
| Điều hướng/focus | Lưu khi keyboard mở/đã ẩn; nút back trên header khi IME mở; hardware back sau ẩn IME đều trở về đúng màn hình | Kết quả native JSON, crash buffer sau sửa |

Trong ảnh bàn phím cuối, ô số lượng có bounds `[368,590][688,690]` (đủ 100 px), nút lưu `[32,842][688,938]`, vùng IME bắt đầu ở y = 1002 px. Toạ độ kiểm tra lấy từ UiAutomator và `dumpsys window`.

## Phạm vi và giới hạn

- Kiểm thử read/write failure, retry snapshot mới nhất, JSON hỏng và thứ tự ghi dùng AsyncStorage mock tại ranh giới native; provider/domain và các màn hình trong integration test là mã thật. Chưa fault-inject lỗi thiết bị vật lý.
- iOS chưa build/chạy trên Windows; cần macOS/Xcode/CocoaPods. Chưa kiểm tra thiết bị thật, TalkBack, hoặc mọi kích thước/phông chữ hệ thống.
- APK kiểm tra là **debug x86_64** cho emulator, dùng Metro; không phải gói ký phát hành lên cửa hàng. Repo giữ native Android/iOS và lockfile để build bằng CLI.
- Audit ngày 28/10/2026 qua `npm audit --json`: 15 finding (8 low, 6 moderate, 1 high). [JSON gốc](evidence/npm-audit.json). High liên quan `image-size@1.2.1` qua Metro; không ép major v2 khi consumer Metro còn dùng callable API cũ. Chưa xử lý các cảnh báo toolchain này.
- Đã khôi phục dữ liệu seed trên emulator sau khi kết thúc tình huống kho rỗng, chỉ xoá dữ liệu QA do phiên này tạo.

## Các quyết định trong triển khai

| Quyết định | Cơ sở | Chi phí nếu cần thay đổi |
| --- | --- | --- |
| Ghim React Native 0.80.3 và toolchain CLI tương thích | SDK 35 / NDK 27.1 sẵn có, đáp ứng đề không Expo | Nâng phiên bản cần build và QA lại; cảnh báo dependency vẫn được ghi rõ |
| Nộp Git thay ZIP | Người dùng cung cấp repo và cập nhật yêu cầu của thầy | Có thể tạo archive nếu yêu cầu nộp thay đổi |
| Kiểm tra safe integer và trim dữ liệu đọc | Thống nhất với validation form, tránh phép tăng không chính xác | Dữ liệu đếm quá lớn bị từ chối và báo lỗi thay vì nạp im lặng |
| Dùng Context state + ref; kiểm thử phục hồi ở gói tích hợp | Tránh stale update khi thao tác nhanh; đã có test thật cho queue/retry/hydration | Nếu đổi kiến trúc, phải giữ các invariant và chạy lại integration tests |
| Tắt generic Java Gradle importer trong workspace | IDE Java 25 từng đổi wrapper trong khi RN dùng Gradle 8.14.1; log import báo không tương thích | Có thể bật lại khi cấu hình JDK phù hợp; Android Studio/CLI vẫn dùng được |
| Chỉnh bàn phím bằng insets thực và focus-scroll, chờ blur trước khi thoát form | QA API 36 tìm thấy lệch status bar và race focus khi chuyển màn hình | Cần kiểm tra lại trên phiên bản Android/iOS khác; không sửa framework nội bộ |

Các gói mã được Luna thi công và review theo từng nhiệm vụ; root giữ thiết kế, tích hợp, native QA và gate push. Hồ sơ này ghi bằng chứng kiểm tra, không thay thế điểm chấm của giảng viên.
