# LibraryApp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Hoàn thiện ứng dụng React Native CLI quản lý thư viện, bám đầy đủ thang điểm đề số 1.

**Architecture:** Ứng dụng offline gồm domain thuần, AsyncStorage repository, React context và native stack ba màn hình. UI native dùng theme và component chung; kiểm tra domain lẫn giao diện trước khi giao bài.

**Tech Stack:** React Native 0.80.3, TypeScript, React Navigation 7, react-native-screens 4.14.1, react-native-safe-area-context 5.5.2, AsyncStorage 2.2.0, Jest.

**Spec:** `docs/THIET_KE.md` và `DE_BAI.md`.

## Global Constraints

- Project tại `LibraryApp/`, tạo bằng React Native Community CLI, không Expo, không UI library, không backend.
- Tất cả implementer dùng gpt-6-luna, không tự spawn subagent; báo root nếu thiếu ngữ cảnh.
- Runtime dependency chỉ React/RN và danh sách đề cho phép. Giữ template native iOS/Android, package-lock.
- Book có id/title/author/category/year/quantity/borrowed đúng đề; year 1900..năm hiện tại, quantity nguyên >0, borrowed nguyên 0..quantity.
- Mọi xoá phải Alert xác nhận, borrowed>0 chặn bằng Alert; FlatList; Stack Navigation; chung form thêm/sửa.
- Bốn category: Giáo trình, Tiểu thuyết, Khoa học, Thiếu nhi. “Tất cả” là filter, không phải category dữ liệu.
- AsyncStorage seed tối thiểu 5 sách chỉ khi chưa có dữ liệu, giữ danh sách rỗng, không tự ghi đè sau read failure.
- Theme file dùng chung, StyleSheet.create, pressed/disabled/empty/error states, keyboard-safe và safe area.
- Ghi report kiểm tra thật; không báo build/UI pass khi chưa chạy. Không push hoặc sửa file ngoài workspace.
- Root giữ tích hợp, môi trường Android và cuối cùng push repo `https://github.com/LinhTN11/LTW_Gi-a_K-.git` theo uỷ quyền người dùng.

---

### Task 1: CLI scaffold, domain và persistence

**Files:** Create `LibraryApp/` từ CLI; `src/types/book.ts`, `src/domain/books.ts`, `src/data/seedBooks.ts`, `src/data/bookStorage.ts`, `src/state/LibraryContext.tsx`, `__tests__/books.test.ts`, `__tests__/bookStorage.test.ts`. Tạm giữ App template để task này tự chạy được.

**Interfaces:**
- `CATEGORIES` readonly tuple bốn thể loại, `Category`, `Book`, `BookInput` với year/quantity dạng string, `BookErrors` theo key field.
- `validateBook(input: BookInput, borrowed?: number): BookErrors`.
- `filterBooks(books: Book[], query: string, category: Category | 'Tất cả'): Book[]`.
- `createBook(input: BookInput): Book`, `updateBook(book: Book, input: BookInput): Book`, `borrowBook(book: Book): Book`, `returnBook(book: Book): Book`, `deleteBook(books: Book[], id: string): Book[]`; invalid mutation throws Error với thông báo tiếng Việt.
- `LibraryProvider`, `useLibrary()` trả `{books, loading, error, saving, addBook(input): Book, editBook(id,input): void, removeBook(id): void, lendBook(id): void, receiveBook(id): void, retry(): void}`. Methods synchronous domain + queued async persistence; error string|null hiển thị được; retry tải lại nếu hydration lỗi hoặc lưu lại nếu write lỗi. Dùng functional/current state để thao tác nhanh không stale.
- Export storage helpers để test seed-once, JSON validation, empty preservation và thứ tự ghi.

- [ ] **Step 1: Scaffold chính thức và pin dependencies**

```powershell
npx.cmd @react-native-community/cli@19.1.2 init LibraryApp --version 0.80.3 --skip-git-init
cd LibraryApp
npm.cmd install @react-navigation/native@7 @react-navigation/native-stack@7 react-native-screens@4.14.1 react-native-safe-area-context@5.5.2 @react-native-async-storage/async-storage@2.2.0
```

Xác minh version trên registry nếu exact không có; báo root trước khi đổi RN major/minor. Xoá template `@react-native/new-app-screen` runtime vì không trong danh sách đề, thay App tạm bằng Text/View thuần. Giữ template devDependencies. MainActivity xử lý saved state theo React Navigation để không crash khi activity recreation.

- [ ] **Step 2: Test domain trước implementation**

```ts
const input = {title: '  Dế Mèn  ', author: 'Tô Hoài', category: 'Thiếu nhi' as const, year: '1941', quantity: '3'};
expect(validateBook({...input, year: '1899'}).year).toBeTruthy();
expect(validateBook({...input, quantity: '2'}, 3).quantity).toBeTruthy();
expect(() => borrowBook({...createBook(input), borrowed: 3})).toThrow();
expect(filterBooks([createBook(input)], 'TÔ HOÀI', 'Thiếu nhi')).toHaveLength(1);
expect(filterBooks([createBook(input)], 'TÔ HOÀI', 'Khoa học')).toHaveLength(0);
```

Thêm test năm tương lai, rỗng/space, NaN, thập phân, borrowed=0 return, xoá đang mượn, ID không trùng, sửa giữ id/borrowed.

- [ ] **Step 3: Implement domain, seed, repository/context**

Không seed theo `books.length===0`; chỉ `getItem===null`. Reject corrupted JSON/schema và không gọi setItem khi đọc lỗi. Queue writes giữ thứ tự snapshot. Consumer không thao tác khi loading hoặc hydration chưa hợp lệ. Có retry và thông báo cho storage errors.

- [ ] **Step 4: Kiểm tra và commit**

```powershell
npm.cmd test -- --runInBand
npx.cmd tsc --noEmit
npm.cmd run lint
git add LibraryApp
git commit -m "feat: scaffold native library app and persistent book domain"
```

Report file cùng brief, ghi lệnh/exit/count, exports thực tế và các giới hạn. Root review spec+quality trước Task 2.

### Task 2: UI hoàn chỉnh, navigation và interaction

**Files:** `LibraryApp/App.tsx`, `src/theme/index.ts`, `src/navigation/types.ts`, `src/components/{AppButton,BookCard,FormField,CategoryChips,StorageBanner}.tsx`, `src/screens/{BookListScreen,BookDetailScreen,BookFormScreen}.tsx`, test UI/navigation phù hợp.

**Interfaces:** Consume Task 1 exports, không đổi domain contract. `RootStackParamList = {BookList: undefined; BookDetail: {bookId: string}; BookForm: {bookId?: string} | undefined}`. Native stack route id lookup, không truyền snapshot book gây stale.

- [ ] **Step 1: Đọc domain exports và tạo theme/components**

```ts
export const colors = {background:'#F5F2E9', surface:'#FFFFFF', primary:'#234B3A', accent:'#B55C3D', text:'#202C26', muted:'#66746C', border:'#DFE5DC', danger:'#B3261E', disabled:'#D6DAD5'};
export const spacing = {xs:4, sm:8, md:16, lg:24, xl:32};
```

Dùng hệ thống font native, serif cho tên sách nếu platform hỗ trợ; font/body có tiếng Việt. Tất cả control tiếng Việt, không emoji thay icon quan trọng, pressed state rõ, disabled xám. Card bo góc/shadow/elevation. testID/accessibilityLabel ổn định cho UI QA, tối thiểu `search-input`, `add-book-button`, `book-title-input`, `book-author-input`, `book-year-input`, `book-quantity-input`, `save-book-button`, `lend-book-button`, `return-book-button`, `edit-book-button`; card testID theo book.id.

- [ ] **Step 2: Navigation và list**

```tsx
<SafeAreaProvider><LibraryProvider><NavigationContainer><Stack.Navigator>{/* Ba Stack.Screen BookList, BookDetail, BookForm */}</Stack.Navigator></NavigationContainer></LibraryProvider></SafeAreaProvider>
```

FlatList + keyExtractor id + memo BookCard nếu hữu ích. Search tên/author case-insensitive AND category. Thống kê toàn dữ liệu. Nhãn đỏ “Hết sách” đúng còn=0. Có loading, retry storage error, empty message và clear filters. LongPress: borrowed>0 Alert lỗi; hợp lệ Alert cancel/destructive, chỉ removeBook trong callback confirm. Press mở detail. Nút thêm đúng chữ “+ Thêm sách”.

- [ ] **Step 3: Detail và form dùng chung**

Detail show title, author, category, year, quantity, borrowed, remaining, id nếu cần. Các nút “Cho mượn”, “Nhận trả” disable thật và màu xám tại ranh giới. Missing id hiển thị trạng thái an toàn/quay lại. Form preload edit; keyboard numeric năm/quantity, validation từng field và viền đỏ; không parseInt chấp nhận `2abc`. Sửa quantity<borrowed báo dưới field. KeyboardAvoidingView + ScrollView keyboardShouldPersistTaps. Category selector, SafeArea insets không double top padding. Save thành công goBack; storage failure xuất hiện banner trên các màn sau navigation.

- [ ] **Step 4: Kiểm tra và commit**

```powershell
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd test -- --runInBand
git add LibraryApp
git commit -m "feat: implement library screens and borrowing workflow"
```

Report paths + test results, không tự tuyên bố visual QA. Root chạy Android và reviewer kiểm tra spec+quality.

### Task 3: Integration tests, tài liệu chấm điểm và bàn giao Git

**Files:** `LibraryApp/__tests__/` integration/context/UI tests; `README.md`, `docs/CHAM_DIEM.md`, `docs/DEMO.md`, `scripts/check-submission.ps1`.

**Interfaces:** App và context thật từ tasks trước. Mock chỉ native dependencies/AsyncStorage; không thay domain hoặc context bằng mock để kết luận end-to-end. Không thay build settings để làm test pass giả.

- [ ] **Step 1: Kiểm tra integration có ý nghĩa**

```ts
// With AsyncStorage initially null: hydrate seeds -> add -> edit -> lend -> return -> remove.
// Check persistence payload and remount against saved JSON, including [].
// Simulate read rejection -> no setItem and safe retry.
// Simulate write rejection -> error visible, retry persists newest snapshot.
```

Kiểm tra context mutation nhanh không mất update, UI lỗi field, confirm delete và disabled boundary nếu test renderer hỗ trợ. Không viết test chỉ assert source text.

- [ ] **Step 2: README và checklist 10 điểm**

README có Trần Ngọc Linh – B23DCC097, setup Android (Node/JDK/SDK thực tế), `cd LibraryApp; npm ci; npx react-native run-android`, hai terminal Metro nếu cần, iOS chỉ hướng dẫn trên macOS. Giải thích structure, seed demo, kho offline, khôi phục lỗi storage. Bảng 7 câu đúng số điểm và liên kết source tương ứng. Tách automated/native visual/persistence evidence, chỗ chưa thực hiện ghi “chưa kiểm chứng”. Demo 5–7 phút từng flow và test case dễ bị trừ điểm. Git thay ZIP theo xác nhận người dùng, không invent lớp.

- [ ] **Step 3: Script gate và chạy**

```powershell
# check-submission.ps1: inspect git ls-files; fail if tracked node_modules, build, local.properties, Pods, .env/secrets.
npm.cmd test -- --runInBand
npx.cmd tsc --noEmit
npm.cmd run lint
```

Script chỉ đọc, không xoá dữ liệu. Build và QA emulator do root, ghi evidence thật root cung cấp sau. Report kiểm tra và commit `test: verify library workflows and document grading coverage`. Root review toàn repo, cập nhật kết quả và push origin sau gate.
