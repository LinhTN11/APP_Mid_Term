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
