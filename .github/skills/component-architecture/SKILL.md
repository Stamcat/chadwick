---
name: component-architecture
description: 'Folder structure, atomic design levels, barrel-file policy, export wiring, prop design, and documentation requirements for building components inside the chadwick library itself. Use when adding a new component, or changing an existing component''s folder layout, exports, or public API.'
---

# Chadwick Component Architecture

Applies to code under `src/components/`, `src/styles/`, and `src/lib/` — i.e. chadwick's own
source, not a consuming app's code. See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for how this
relates to the consuming-app (`AGENTS.md`) and Figma Make (`guidelines/`) rulesets.

## shadcn first, custom only when it can't cover the need

- Before building a new component from scratch, check whether `shadcn` already has one that
  covers it (`npx shadcn@latest add <component>` to pull its `base-nova` source, same way
  `Button` was originally sourced). Adapt the shadcn source into this repo's own conventions
  (folder-per-component layout below, `cn()` import path) rather than writing the markup/behavior
  from zero — unlike its sibling `@stamcat/chadman`, this library keeps shadcn's own Tailwind +
  `class-variance-authority` output largely as-is, since both use Tailwind.
- If shadcn has no component for the need, or its version doesn't support a required feature/prop,
  **stop and ask the user before writing a custom implementation** — don't silently fall back to a
  hand-rolled component. State specifically what's missing (e.g. "shadcn's `Foo` has no `bar`
  variant") so the user can decide whether to accept a partial shadcn adaptation, request a custom
  build anyway, or wait for upstream support.
- This only governs where a new component's implementation starts from. Once adapted, it must
  still follow every convention below (folder layout, named exports, barrel wiring, `cva`-based
  variants, documentation checklist).

## Atomic design levels in chadwick

Chadwick uses an atomic design hierarchy. Every new component must be classified into one of these
before it's built — the level drives its folder location:

| Level | Definition | Lives in |
| --- | --- | --- |
| Quarks | Sub-atomic design values: color, typography, spacing | NOT a component folder — these are the design tokens in `src/styles/tokens.css`, already covered by [styling](../styling/SKILL.md). Don't create a "quark" component for a raw token. |
| Atoms | Common UI elements not specific to any product (button, input, checkbox, dropdown) | `src/components/atoms/{Name}/` |
| Molecules | Low-complexity common UI elements implementing one or more atoms (date picker, carousel, accordion, modal, tooltip) | `src/components/molecules/{Name}/` |
| Organisms | Medium–high complexity common UI elements with advanced functionality, built from one or more molecules and multiple atoms (charts, tables, data visualization) | `src/components/organisms/{Name}/` |

Only atoms exist today (`Button`). Molecules/organisms (and any future product-scoped
templates/pages tier) will get their own conventions added here once the first one is actually
built — don't pre-build folders or tooling for levels that have no components yet.

`Button` lives at `src/components/atoms/Button/` and is the reference layout for new atoms.

Folder naming: any multi-word subfolder name under `src/components/` or `src/stories/` uses
camelCase, not kebab-case. This applies to this library's own source tree only — it does NOT
govern `.github/skills/` folder names, which stay kebab-case (a separate, pre-existing convention
for skill directories, left as-is).

## Folder-per-component

- Each component gets its own folder under its level's directory (see table above), PascalCase,
  matching the component name — no shared `ui/` catch-all folder.
- A component folder holds, at minimum: `{Name}.tsx`, `AGENTS.md`. See
  `src/components/atoms/Button/` for the reference layout. Unlike `@stamcat/chadman`, there is no
  separate stylesheet file per component — Tailwind utility classes live inline in the `cva()` call
  in `{Name}.tsx` itself.
- Use named exports only (`export { Button }` / `export type { ButtonProps, ... }`), never a
  default export — matches the consuming-app rule in the root `AGENTS.md`, and keeps tree-shaking
  and subpath-export generation (below) working.
- Component names must be unique across the ENTIRE library, not just within a level — the public
  import path is always `@stamcat/chadwick/{Name}` with no atomic-level segment (see Wiring section
  below), so two components at different levels sharing a name would collide in the published
  `exports` map. Check across all of `src/components/` before naming a new component.

## Wiring a new component into the build

- Add the component to the barrel at `src/components/index.ts`
  (`export { Foo } from "./atoms/Foo/Foo";` or the matching level folder). This is the ONLY wiring
  step required — do not touch `exports.ts` or `vite.config.ts` for a plain new component.
- `scripts/buildPackage.ts`'s `getComponentExports()` regex-scans that barrel file at build time,
  reading each export's actual module path (not just its name), to auto-generate the matching
  `./{Name}` subpath entry in `dist/package.json`'s `exports` map — the published import path is
  always flat (`@stamcat/chadwick/{Name}`), regardless of how deeply the component is nested
  (`atoms/Button/Button`), which is why component names must be unique library-wide (see
  Folder-per-component above). `inlineComponentGuidelines()` separately walks every folder under
  `src/components/` looking for an `AGENTS.md` and copies it into
  `dist/guidelines/components/{name}.md`, keyed by that folder's own name. Get the barrel export
  line and the folder name right and the rest follows automatically.
- Only reach for a dedicated top-level `EXPORTS` key in `exports.ts` (its own Vite lib entry) when
  adding an entire new *subsystem* that isn't a visual component rendered from the component barrel
  (e.g. a provider, a hook library). A new Button/Card/Input-style component never needs this.

## Props

- Base the component's prop type on the underlying primitive's own prop type (e.g.
  `ButtonPrimitive.Props` from `@base-ui/react/button`) and extend it with only the new
  variant/size-shaped props the component adds (typically via `VariantProps<typeof xVariants>`
  from `class-variance-authority`) — don't redeclare native/primitive props by hand.
- Prefer a Base UI primitive over hand-rolled markup when one exists for the element you're
  building; it already handles the keyboard/focus/ARIA behavior documented in
  [accessibility](../accessibility/SKILL.md).
