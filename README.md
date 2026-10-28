# Ứng dụng quản lý thư viện

**Sinh viên:** Trần Ngọc Linh — **MSSV:** B23DCC097  
**Lớp:** chưa được cung cấp.

Ứng dụng React Native CLI quản lý sách offline. Dữ liệu được lưu trên thiết bị bằng AsyncStorage; không cần tài khoản, backend hay kết nối mạng.

## Môi trường và chạy Android

Toolchain đã dùng để kiểm tra bản Android trong workspace: Node.js 24.15.0, JDK 21.0.6, Gradle 8.14.1, React Native 0.80.3, Android compile SDK 35 và NDK 27.1. Cần cài Android SDK Platform 35 cùng NDK 27.1 trong Android Studio SDK Manager, đồng thời cấu hình `ANDROID_HOME`/`ANDROID_SDK_ROOT` và PATH cho platform-tools.

```powershell
cd LibraryApp
npm ci
npx react-native run-android
```

Nếu CLI không tự chạy Metro, mở hai terminal tại `LibraryApp`:

```powershell
# Terminal 1
npm start
```

```powershell
# Terminal 2
npx react-native run-android
```

Từ thư mục gốc của repository, chạy `powershell -ExecutionPolicy Bypass -File .\scripts\check-submission.ps1` để kiểm tra file đã track, Jest, TypeScript và ESLint. Script chỉ đọc trạng thái Git và chạy các lệnh kiểm tra.

Máy này có Java IDE Gradle importer bị tắt trong `.vscode/settings.json`: importer đang dùng Java 25, không tương thích với Gradle 8.14.1. Dùng JDK 17/21 trong Android Studio hoặc chạy Gradle qua CLI; không nâng Gradle lên 9 để vượt qua importer.

iOS chỉ có thể build/chạy trên macOS đã cài Xcode và CocoaPods:

```sh
cd LibraryApp
npm ci
cd ios
bundle install
bundle exec pod install
cd ..
npx react-native run-ios
```

## Ghi chú audit dependency

Toolchain audit ghi nhận 15 findings: 8 mức low, 6 moderate và 1 high. Finding high là `image-size@1.2.1` được dùng qua Metro. Bản patched v2 đổi callable API, vì vậy không ép override sang v2 một cách mù quáng: việc đó có thể làm hỏng consumer. Cần xác minh tương thích và cách nâng cấp ở upstream trước khi thay đổi dependency; finding này được ghi nhận là giới hạn còn lại.

## Tính năng

- Danh sách sách mẫu (5 đầu sách, đủ bốn thể loại) chỉ được tạo khi AsyncStorage chưa có key. Kho đã lưu `[]` được giữ nguyên.
- Tìm theo tên/tác giả và lọc thể loại đồng thời; xem số lượng còn, mượn và trả sách.
- Thêm, sửa, xoá có xác nhận; không thể xoá sách đang có người mượn.
- Dữ liệu lưu cục bộ. Nếu đọc lỗi, ứng dụng giữ thao tác ở trạng thái an toàn và cho tải lại. Nếu ghi lỗi, lỗi được hiển thị và có thể thử lưu snapshot mới nhất.

## Cấu trúc mã nguồn

| Thư mục/file | Vai trò |
| --- | --- |
| `LibraryApp/src/types/` | Kiểu sách và thể loại |
| `LibraryApp/src/domain/` | Quy tắc nghiệp vụ, validation và lọc thuần |
| `LibraryApp/src/data/` | Seed và repository AsyncStorage |
| `LibraryApp/src/state/` | Context state và ref dùng chung để cập nhật đồng bộ |
| `LibraryApp/src/screens/` | Danh sách, chi tiết, form thêm/sửa |
| `LibraryApp/src/components/` và `theme/` | Component giao diện và token thiết kế |
| `LibraryApp/__tests__/` | Test domain, storage, provider tích hợp và screen |

## Bảng tiêu chí và hồ sơ kiểm tra

Bảng chấm bảy câu, điểm và đường dẫn source: [docs/CHAM_DIEM.md](docs/CHAM_DIEM.md). Kịch bản trình diễn 5–7 phút: [docs/DEMO.md](docs/DEMO.md).

### Bằng chứng hiện có

- **Automated:** Jest, TypeScript, ESLint được chạy bằng `scripts/check-submission.ps1`; kết quả lần chạy bàn giao ghi ở `docs/CHAM_DIEM.md`.
- **Native build/runtime:** Android `assembleDebug` đã build thành công. Ứng dụng đã cài và mở trên emulator Pixel_9 API 36 bằng React Native CLI.
- **Kiểm tra trực quan và thao tác native:** đang được rà soát; các bước chưa hoàn tất được đánh dấu **chưa kiểm chứng** trong checklist.
- **Persistence trên thiết bị sau khi đóng/mở ứng dụng:** automated test xác minh payload/remount trong tiến trình test; kiểm tra vòng đời thật trên thiết bị **chưa kiểm chứng**.

Bài được bàn giao bằng Git theo yêu cầu cập nhật của người dùng thay cho ZIP trong đề gốc.
