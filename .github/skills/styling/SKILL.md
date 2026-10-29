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

## Tailwind utilities + `class-variance-authority`, composed with `cn()`

- Components express variants/sizes as Tailwind utility-class strings passed to a single `cva()`
  call (see `Button.tsx`), not a separate stylesheet file and not inline `style` objects for
  anything expressible as a utility class.
- Merge a component's own classes with a caller-supplied `className` using `cn()` from
  `@/lib/utils` (re-exported from the `cn` package — clsx + tailwind-merge semantics). Never
  concatenate class strings by hand (`` `${base} ${className}` ``) — `cn()` resolves conflicting
  utilities (e.g. a caller's `bg-*` overriding the variant's own `bg-*`) correctly; naive
  concatenation doesn't.
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
