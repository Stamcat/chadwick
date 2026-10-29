---
name: styling
description: 'Tailwind CSS, class-variance-authority, and design-token conventions for styling components inside the chadwick library itself. Use when writing or editing any className/cva logic under src/. NOTE: these conventions are an initial baseline and will be expanded as the component set grows past Button — see CONTRIBUTING.md.'
---

# Chadwick Styling (library-internal)

Applies to chadwick's own source (`src/components/**`, `src/styles/**`). This is the opposite
audience from the root `AGENTS.md`'s styling rules, which tell a *consuming app* how to style
around a chadwick component from the outside — see [CONTRIBUTING.md](../../../CONTRIBUTING.md)
for how the rulesets relate.

**This skill is a starting baseline, not the final word.** Chadwick's sibling library
`@stamcat/chadman` uses Sass/BEM; chadwick deliberately uses Tailwind instead, and the finer
authoring rules (utility-class ordering, when an arbitrary value is acceptable, lint enforcement)
are intentionally left light until there's more than one component to generalize from. Update this
file as real patterns emerge, rather than guessing them up front.

## Single custom class per variant/size, authored with `@apply`

Components do NOT render with long inline Tailwind utility-class chains. Each component owns a
co-located `.css` file (e.g. `Button.tsx` + `Button.css`) that defines one base class plus one
class per `variant`/`size` value, each built from Tailwind utilities via `@apply` — `cva()` then
just picks which of those custom class names apply, instead of assembling raw utility strings:

```css
/* Button.css */
@reference "../../../index.css";

.btn {
    @apply inline-flex items-center justify-center rounded-lg ...;
}

.btn--default {
    @apply bg-primary text-primary-foreground hover:bg-primary/80;
}
```

```tsx
// Button.tsx
import "./Button.css";

const buttonVariants = cva("btn group/button", {
    variants: {
        variant: { default: "btn--default", /* ... */ },
    },
});
```

- The `@reference "../../../index.css";` line (pointing at `src/index.css`) is required at the top
  of every component stylesheet that uses `@apply` or `@theme` values — Tailwind v4 needs it to
  resolve the theme/utilities for a file that isn't the main CSS entry, without duplicating that
  entry's output into every component's bundle.
- Import the component's `.css` file directly from its `.tsx` file (`import "./Button.css";`) —
  `vite-plugin-lib-inject-css` (already wired in `vite.config.ts`) auto-injects it on import, same
  as before.
- A literal Tailwind utility class is still acceptable directly in a `cva()`/`className` string
  when it's a marker class with no own declarations that `@apply` can't preserve (e.g. `group/button`
  for `group-hover/button:` on children) — only visual, declaration-producing utilities belong in
  the `@apply`'d CSS class.
- Merge a component's own class names with a caller-supplied `className` using `cn()` from
  `@/lib/utils` (re-exported from the `cn` package — clsx + tailwind-merge semantics). Note that
  because a component's own classes are now custom (not individual Tailwind utilities),
  tailwind-merge cannot dedupe a conflicting utility a caller passes against them — overriding
  a variant's look from the outside is no longer supported via `className`; switch `variant`/`size`
  instead.
- `variant`/`size` (or any other variant-shaped prop) should be typed via
  `VariantProps<typeof xVariants>` from `class-variance-authority`, not a hand-written union
  that's kept in sync with the `cva()` call by hand.

## Design tokens, never literals

- Style with Tailwind utilities that resolve to the design tokens in `src/styles/tokens.css`
  (`bg-primary`, `text-primary-foreground`, `rounded-lg`, etc. — mapped onto those CSS variables by
  `src/index.css`'s `@theme inline` block) — never a literal hex/oklch color utility
  (`bg-[#fff]`) or a hardcoded arbitrary radius value.
- Always pair a background utility with its matching `-foreground` text utility, never an arbitrary
  other text token (same rule the consuming-app `AGENTS.md` gives consumers — it's just as true for
  the component's own classes).

## Don't add a class you don't need

- A utility class only earns its place when it changes something that isn't already covered by a
  base class in the `cva()` call. Don't add a wrapper `<div>` purely to have "somewhere to hang a
  style" — reach for the primitive's own `data-slot`/rendered element first.

## Enforcement

| Rule | Enforced by |
| --- | --- |
| Compiles without errors | `npm run build` (runs `vite build`, which processes Tailwind via `@tailwindcss/vite`) |
| No stray literal colors/arbitrary-value overrides, correct token usage | review (not yet machine-enforced) |
