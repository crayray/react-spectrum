# Testing a new React Spectrum S2 component

Use this guide when adding or reviewing a **new** component under `packages/@react-spectrum/s2` in the react-spectrum monorepo. It complements [Testing with React Spectrum S2](test-utils-guidance.md) (consumer-focused API testers) and [implementation guidance](implementation-guidance.md) (build and composition).

“Styled” here means **S2 components and the `style` macro** (Spectrum tokens), not third-party CSS-in-JS libraries.

## Before you write tests

1. **Read component-specific rules** — Check `.cursor/rules/` for a rule matching the component (e.g. `rating-component.mdc`). Accessibility model and API choices are not always inferable from similar components.
2. **Confirm the layering** — New S2 components should sit on **React Aria Components** for behavior and ARIA. State usually flows through RAC (which uses react-stately internally). Only import from `react-stately/*` directly when the component needs explicit state or types (collections, controlled tabs, toasts, virtualizer layout, etc.).
3. **Co-locate files** — For every new `src/ComponentName.tsx`:
   - `stories/ComponentName.stories.tsx` — one story per meaningful visual state (props, variants, invalid, disabled, sizes).
   - `test/ComponentName.test.tsx` — behavior and accessibility (this guide).
   - Optional `test/ComponentName.browser.test.tsx` only when JSDOM cannot exercise the behavior (some overlays/menus); follow existing `.browser.test.tsx` peers.

## Choose a test strategy

| Component shape | Prove state (“stately contract”) | Interactions |
|-----------------|----------------------------------|--------------|
| Wraps a RAC field or control (TextField, Switch, …) | `value` / `defaultValue` / `onChange`, `isDisabled`, `isInvalid`, `isRequired` | RTL + roles; testers if a pattern exists |
| Selection group (RadioGroup, CheckboxGroup, SelectBoxGroup, …) | Controlled `selectedKeys` or single selection; disabled options | `createTester('RadioGroup' \| 'CheckboxGroup' \| 'ListBox', …)` |
| Collection (ListView, TableView, TreeView, Menu, Picker, ComboBox, …) | Every item has `id`; `onSelectionChange` keys; `items` / render function | Matching pattern: `'GridList'`, `'Table'`, `'Tree'`, `'Menu'`, `'Select'`, `'ComboBox'` |
| Overlay (Dialog, Popover) | Open/close state, dismiss behavior | `'Dialog'` with correct `overlayType` |
| Mostly presentational (LabeledValue, Meter display-only paths) | Rendering, formatting, ref | RTL queries; no pattern tester |
| Custom primitive composition | Same as underlying ARIA pattern (e.g. Rating → `'RadioGroup'`) | Test the **documented** a11y model, not an convenient alternative |

Pattern names are **ARIA patterns**, not S2 export names. See the table in [test-utils-guidance.md](test-utils-guidance.md).

If no pattern tester fits, use `@testing-library/react` and `userEvent` / `fireEvent.keyDown` for keyboard and focus behavior. Do not skip keyboard/a11y tests only because a tester is missing.

## Test file scaffold

Place tests in `packages/@react-spectrum/s2/test/`. Import from `../src/…`, not from the package barrel.

```tsx
/*
 * Copyright … Adobe …
 */

// Mock when live region announcements affect assertions (common for selection/focus).
jest.mock('react-aria/src/live-announcer/LiveAnnouncer');

import {pointerMap, render, User} from '@react-spectrum/test-utils-internal';
import {Provider} from '../src/Provider';
import {MyComponent} from '../src/MyComponent';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  let testUtilUser = new User();
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  // … tests …
});
```

Use `Provider` when locale, text direction, or scale affects behavior:

```tsx
render(
  <Provider locale="ar-AE">
    <MyComponent aria-label="…" />
  </Provider>
);
```

For RTL keyboard tests, pass `direction: 'rtl' | 'ltr'` into `createTester` when supported (see `RadioGroup.test.tsx`).

## Required test categories

Structure `describe` blocks so reviewers can see coverage. Mirror strong peers such as `SelectBoxGroup.test.tsx` and `RadioGroup.test.tsx`.

### Uncontrolled behavior

- `defaultValue` / `defaultSelectedKeys` establishes initial UI state.
- User interaction updates the UI without external state.

### Controlled behavior

- Wrapper holds state; changing props updates the UI.
- Callbacks (`onChange`, `onSelectionChange`, …) receive the expected values/keys.
- Do not duplicate RAC state in parallel local state unless the component intentionally mirrors it.

### Disabled and invalid

- `isDisabled` prevents interaction and reflects in ARIA where applicable.
- `isInvalid` + `errorMessage` (form fields) surface errors; group-level disabled keys for collections.

### Accessibility

- Correct **role** and **accessible name** (`aria-label`, `aria-labelledby`, or visible `label` prop on fields).
- For collections: container has `aria-label` or `aria-labelledby`.
- Read-only modes: use the documented role (e.g. `role="img"` with summary `aria-label`, not interactive children).
- Keyboard: arrow/home/end behavior when the component spec requires it; use explicit `fireEvent.keyDown` when testing edge cases the tester abstracts away.

### Edge cases

- Empty collection, single item, all disabled, dynamic `items`, ref/imperative handle if exposed.

## Using `@react-spectrum/test-utils-internal`

In this monorepo, S2 package tests import from `@react-spectrum/test-utils-internal` (and sometimes `@react-aria/test-utils` for `User`). External apps use `@react-spectrum/test-utils`.

```tsx
let tester = testUtilUser.createTester('RadioGroup', {
  root: getByRole('radiogroup'),
  direction: 'ltr'
});
await tester.triggerRadio({radio: 0, interactionType: 'keyboard'});
```

Prefer tester methods for selection, open/close, and row/column queries. Use manual RTL when:

- Testing menus/dialogs without a trigger, or actions inside table/tree rows.
- Asserting exact focus order or modifier keys.
- Dismiss behavior (`Escape`, outside click) where the tester does not assert side effects.

See [test-utils-guidance.md](test-utils-guidance.md) for per-pattern methods and limitations.

## Proving S2 styling integration

Jest does not snapshot Spectrum CSS. Styling is validated by:

1. **Stories** — Cover each variant/size/state; run `yarn start:s2` and spot-check.
2. **Macro typecheck** — Invalid tokens or non-static macro values fail at build/typecheck time.
3. **Repo hooks** — No raw color literals in `packages/@react-spectrum/s2/src/**/*.tsx` (use `style` macro + tokens only).
4. **Conditional styles** — If the component uses render-prop or `styles({isSelected, …})` patterns, add at least one test that drives a state change and asserts a stable DOM/ARIA outcome (not pixel values).

Do not add tests that only duplicate the implementation of the style macro.

## Internationalization

If the component shows user-facing strings, they must come from `intl/*.json`, not hardcoded literals. Tests may use English formatter output; add cases when formatting depends on `Provider` locale.

## Running verification

From the repo root:

```bash
# Run tests for one file (jest picks up the monorepo config)
yarn test packages/@react-spectrum/s2/test/MyComponent.test.tsx

# Broader package check when needed
yarn test --testPathPattern="@react-spectrum/s2"

# Lint (includes oxlint) and types
yarn lint
```

Also:

- `yarn start:s2` — Storybook for visual states.
- Fix console warnings in stories (missing `textValue`, `aria-label`, etc.).

Do not report the task complete until the targeted tests pass and lint is clean for the touched files.

## Checklist (copy for PR / agent report)

- [ ] `stories/ComponentName.stories.tsx` — visual states covered
- [ ] `test/ComponentName.test.tsx` — uncontrolled, controlled, disabled/invalid, a11y, edges
- [ ] Pattern tester used when applicable; manual keyboard tests where testers hide bugs
- [ ] Collection `id` / `textValue` conventions satisfied
- [ ] Component-specific `.cursor/rules` behavior covered
- [ ] `yarn test` (scoped) and `yarn lint` pass
- [ ] Remaining gaps listed (browser test needed, DnD, long-press, etc.)

## Related references

- [Creating Custom Components](creating-custom-components.md) — building on RAC + style macro
- [Testing with React Spectrum S2](test-utils-guidance.md) — pattern testers and APIs
- [implementation-guidance.md](implementation-guidance.md) — imports, collections, forms, verify-before-done
- CONTRIBUTING.md — visual vs unit test expectations
- Per-component testing docs under `references/testing/` when published (linked from test-utils-guidance)
