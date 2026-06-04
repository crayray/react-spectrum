---
name: test-new-s2-component
description: >-
  Test a new React Spectrum S2 component in the monorepo — state (react-stately via
  RAC), accessibility, style macro styling, co-located stories and tests. Use when
  adding or reviewing packages/@react-spectrum/s2/src, test/, or stories/.
---

# Testing a new React Spectrum S2 component

Use this guide when adding or reviewing a **new** component under `packages/@react-spectrum/s2`. No build step is required to use this file — open it in the editor or `@demo/skills.md` in Cursor.

“Styled” means **S2 + the `style` macro** (Spectrum tokens), not third-party CSS-in-JS.

## Before you write tests

1. **Read component-specific rules** — Check `.cursor/rules/` (e.g. `rating-component.mdc`).
2. **Confirm layering** — Behavior via **React Aria Components**; state through RAC (react-stately inside). Import `react-stately/*` only when the component needs explicit state/types.
3. **Co-locate files** for each new `src/ComponentName.tsx`:
   - `stories/ComponentName.stories.tsx` — one story per visual state
   - `test/ComponentName.test.tsx` — behavior and a11y
   - Optional `test/ComponentName.browser.test.tsx` only when JSDOM is insufficient

## Choose a test strategy

| Component shape | Prove state | Interactions |
|-----------------|-------------|--------------|
| RAC field/control | `value` / `defaultValue` / `onChange`, `isDisabled`, `isInvalid` | RTL; pattern tester if available |
| Selection group | Controlled selection; disabled options | `createTester('RadioGroup' \| 'CheckboxGroup' \| 'ListBox', …)` |
| Collection | Every item has `id`; `onSelectionChange` keys | `'GridList'`, `'Table'`, `'Tree'`, `'Menu'`, `'Select'`, `'ComboBox'` |
| Overlay | Open/close, dismiss | `'Dialog'` + `overlayType` |
| Presentational | Render output, ref | RTL only |
| Custom (e.g. Rating) | Documented a11y model | e.g. `'RadioGroup'` per component rule |

Pattern names are **ARIA patterns**, not S2 export names. If no tester fits, use RTL + `userEvent` / `fireEvent.keyDown` — do not skip keyboard/a11y tests.

More on testers: `packages/dev/s2-docs/skills/react-spectrum-s2/test-utils-guidance.md`

## Test file scaffold

```tsx
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
});
```

Wrap with `<Provider locale="ar-AE">` when locale/RTL matters. Pass `direction` into `createTester` for RTL keyboard tests (see `RadioGroup.test.tsx`).

## Required test categories

Mirror `SelectBoxGroup.test.tsx` / `RadioGroup.test.tsx`:

- **Uncontrolled** — `defaultValue` / `defaultSelectedKeys`, interaction updates UI
- **Controlled** — props + callbacks receive correct values/keys; no duplicate RAC state
- **Disabled / invalid** — `isDisabled`, `isInvalid` + `errorMessage` where applicable
- **Accessibility** — role, accessible name, collection `aria-label`, read-only modes, keyboard
- **Edge cases** — empty/single item, dynamic `items`, ref if exposed

## Pattern testers (monorepo)

```tsx
let tester = testUtilUser.createTester('RadioGroup', {
  root: getByRole('radiogroup'),
  direction: 'ltr'
});
await tester.triggerRadio({radio: 0, interactionType: 'keyboard'});
```

Use manual RTL for menus without triggers, in-row actions, exact focus order, and dismiss behavior.

## Styling

- **Stories** + `yarn start:s2` for visual states
- **Macro typecheck** / `yarn lint` for invalid tokens
- **No raw colors** in `src/**/*.tsx` (style macro only)
- At least one test driving a state change when behavior depends on `styles({isSelected, …})`

## Verify

```bash
yarn test packages/@react-spectrum/s2/test/MyComponent.test.tsx
yarn lint
yarn start:s2
```

## Checklist

- [ ] Stories cover visual states
- [ ] Tests: uncontrolled, controlled, disabled/invalid, a11y, edges
- [ ] Pattern tester or manual keyboard tests
- [ ] Collection `id` / `textValue` where required
- [ ] Component `.cursor/rules` covered
- [ ] `yarn test` + `yarn lint` pass

## More context (optional)

- `.cursor/rules/s2-component-authoring.mdc`
- `packages/dev/s2-docs/skills/react-spectrum-s2/implementation-guidance.md`
- `CONTRIBUTING.md` (visual vs unit tests)
