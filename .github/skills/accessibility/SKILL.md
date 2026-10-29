---
name: accessibility
description: 'Accessibility conventions for building components inside the chadwick library itself — semantic structure, keyboard/focus, ARIA, color contrast, and how to verify with Storybook''s a11y addon. Use when creating or changing any component under src/components/.'
---

# Chadwick Accessibility (library-internal)

Applies to chadwick's own component source. Chadwick has no upstream design system to defer
accessible primitives to — it IS that shared primitive layer for every consuming app, so every
component built here must be accessible by construction, not left for a consuming app to patch
over later.

## Prefer a Base UI primitive over hand-rolled markup

- Before writing custom interactive markup, check whether `@base-ui/react` already ships a
  primitive for it (`@base-ui/react/button`, etc.) — it already implements correct semantic
  element choice, keyboard operability, and ARIA state wiring. Only hand-roll markup for parts
  Base UI has no primitive for.
- Keep the primitive's native element (e.g. render as a real `<button>`), don't force it to render
  as a generic element via an `as`/`render` override unless there's a concrete reason — the native
  element is what gives keyboard/role support for free.

## Icon-only sizes need a documented `aria-label` requirement

- Any size variant with no visible text content (e.g. `icon`, `icon-xs`, `icon-sm`, `icon-lg`) must
  be called out in that component's `AGENTS.md` as requiring `aria-label` (or
  `aria-labelledby`) from the consumer — include an example showing it. Never ship an icon-only
  size without that documented, and never assume the consumer will think to add it unprompted.

## Focus visibility

- Never suppress a primitive's default focus-visible outline/ring without supplying an equivalent
  replacement in the same change.
- A focus style must be visible against every variant's own background — check it against each
  variant, not just the default one, since a ring/outline color that works on a light background
  can disappear on a tinted/dark variant.

## Color contrast — verify, don't guess

- Any new background/foreground utility pairing introduced by a new variant must meet WCAG AA
  (4.5:1 normal text, 3:1 large text/UI components). Don't reason about this from the token names
  alone — use Storybook's `@storybook/addon-a11y` panel (already configured in this repo) against
  the new/changed story and confirm zero contrast violations before considering the variant done.
- Once verified, record the background/text token pairing in the component's `AGENTS.md` (see the
  `variant` → token table in `src/components/atoms/Button/AGENTS.md`) so a future change to that
  variant doesn't accidentally swap in an unverified pairing.

## Don't convey state by color alone

- A variant meant to signal a status (e.g. `destructive`) must not be the ONLY signal — pairing a
  tinted background/text color with the component's own label/icon content (supplied by the
  consumer) is sufficient; don't add a redundant icon inside the component itself just to satisfy
  this, since the consumer controls the children.

## Verifying a change

Run `npm run storybook`, open the story for the new/changed component/variant, and check the
Accessibility panel reports no violations — do this for every variant and size combination touched
by the change, not just the default story.

## Enforcement

| Rule | Enforced by |
| --- | --- |
| Baseline keyboard/ARIA behavior | inherited from `@base-ui/react` primitives |
| Contrast violations | `@storybook/addon-a11y` panel (manual check, run before merging) |

Icon-only `aria-label` documentation, focus-visible replacement styles, and the "verify before
documenting a token pairing" step aren't machine-enforced — check for them in review.
