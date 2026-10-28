# Task 2 report — Library UI and navigation

## Implemented

- `LibraryApp/App.tsx`: SafeAreaProvider, LibraryProvider, themed native-stack navigation for list/detail/form.
- `LibraryApp/src/theme/index.ts` and shared components: ivory/forest/terracotta palette, spacing/radii/shadow, accessible pressed/disabled controls, book cards, field errors, category chips, storage retry banner.
- `LibraryApp/src/screens/BookListScreen.tsx`: FlatList, combined search/category filter, whole-library stats, empty/loading/storage-error states, retry, guarded long-press delete confirmation, stable QA IDs.
- `LibraryApp/src/screens/BookDetailScreen.tsx`: route-id lookup, book inventory detail, guarded lend/return and edit actions, missing-book state.
- `LibraryApp/src/screens/BookFormScreen.tsx`: shared add/edit flow, preload by id, field validation, numeric keyboards, keyboard avoidance, safe-area insets, compact numeric fields.
- `LibraryApp/src/navigation/types.ts`: requested RootStackParamList.
- `LibraryApp/src/data/seedBooks.ts`: replaced miscategorized “Đắc nhân tâm” with “Nhà giả kim” / Paulo Coelho / 1988.
- Jest smoke setup mocks native navigation/storage boundaries; focused component checks cover book card identity, category selection, disabled action and visible validation error.

## Verification

| Command | Result |
| --- | --- |
| `npx.cmd tsc --noEmit` | Passed, exit 0 |
| `npm.cmd run lint` | Passed, exit 0 |
| `npm.cmd test -- --runInBand` | Passed: 4 suites, 18 tests |
| `git diff --check` | Passed, no whitespace errors reported |

No visual/emulator QA is claimed here; root is running Android build and device QA separately. No API, dependency, or native build-setting changes were made by this task.

## Review follow-up — accessibility and test clarity

- Added the validation message to the native `TextInput.accessibilityHint`, preserving any hint provided by the caller. No unsupported invalid-state prop was added.
- Strengthened the UI test to inspect the rendered native `TextInput`: `StyleSheet.flatten(input.props.style).borderColor === colors.danger`, plus the error text in `accessibilityHint`.
- Verification: `npm.cmd test -- --runInBand __tests__/ui.test.tsx` passed (1 suite, 3 tests); `npx.cmd tsc --noEmit` passed (exit 0); `npm.cmd run lint` passed (exit 0).

## Keyboard and IME crash follow-up

- API 36 / 360×800dp evidence showed the focused quantity input at y=522dp while the numeric keyboard began around y=500dp; the ScrollView still occupied the full screen. The Android KAV had no behavior, so `adjustResize` alone did not shrink the content viewport under the edge-to-edge target.
- The form now uses `KeyboardAvoidingView` with `behavior="height"` on Android and retains `padding` on iOS. It measures the actual outer SafeAreaView screen origin with native `measureInWindow` and passes that y coordinate as `keyboardVerticalOffset`; this includes the rendered native-stack header and top inset without a hard-coded header size or added dependency, and updates when the root layout changes.
- The save path calls React Native `Keyboard.dismiss()` before leaving. If visible, it waits for `keyboardDidHide` with a bounded 500ms fallback; if already hidden, it still blurs via `Keyboard.dismiss()` and defers navigation to the next event-loop turn. Synchronous duplicate-submit and disabled-state guards prevent duplicate adds. Pending event/timer work is removed on unmount.
- Workflow tests cover measured header offset, iOS/Android KAV behavior, visible-keyboard hide-before-navigation, already-hidden keyboard dismissal, and duplicate-submit protection.
- Verification: `npm.cmd test -- --runInBand` passed (6 suites, 29 tests); `npx.cmd tsc --noEmit` passed (exit 0); `npm.cmd run lint` passed (exit 0). Android rebuild / API 36 keyboard and crash reproduction are pending root native QA; no runtime visual result is claimed here.
