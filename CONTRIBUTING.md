# Contributing to chadwick

This file is the canonical source of AI (and human) coding instructions for working on chadwick's
**own source** — i.e. you are editing code inside this repo (`src/`, `scripts/`, build config),
not writing an application that merely depends on `@stamcat/chadwick`.

## Three rulesets — know which one applies

This repo carries three distinct instruction sets, scoped by *who is reading them* and *which
files they're touching*. They're deliberately independent: a rule in one never implies the
opposite rule is wrong in another, because they describe different audiences.

| Ruleset | Audience | Canonical file | Applies to |
| --- | --- | --- | --- |
| Consuming application | A team building an app that installs `@stamcat/chadwick` as an npm dependency | [`AGENTS.md`](./AGENTS.md) | Code in some *other* repo that imports from `@stamcat/chadwick/*` |
| Figma Make | Figma Make, generating/editing designs from a kit that includes chadwick | [`guidelines/Guidelines.md`](./guidelines/Guidelines.md) | The `guidelines/` folder only — built from `AGENTS.md` files, never hand-duplicated |
| **Library contribution (this file)** | Anyone changing chadwick's own source | **`CONTRIBUTING.md`** (this file) + `.github/skills/*` | `src/`, `scripts/`, `vite.config.ts`, `exports.ts`, and other repo-internal files |

Why they can disagree: the consuming-app `AGENTS.md` tells a consumer, for example, "always import
components from their documented subpath" and "use the design tokens instead of hardcoded colors"
— rules about *consuming* the published package. This file and its skills tell a contributor how
the component that subpath resolves to is actually *built* (Tailwind utility composition via
`class-variance-authority`, the `cn()` merge helper, folder-per-component layout) — internal
implementation details a consuming app never needs to know and must never depend on.
Figma Make's `guidelines/` is narrower still: it's a build artifact of the consuming-app ruleset
(each `guidelines/components/{name}.md` is a router stub inlined with that component's `AGENTS.md`
at build time — see `scripts/buildPackage.ts`), not a separately maintained set of rules.

If you're unsure which ruleset a file falls under: if the change is inside this repo's `src/` (or
build tooling) implementing or restructuring a component, use this file's skills. If the change is
only to documentation describing how an external consumer should *use* a component (prop tables,
examples), that's the `AGENTS.md`/component `AGENTS.md` ruleset, even though you're still editing
files in this repo.

## Topic skills

Detailed conventions for contributing to chadwick's own source live under `.github/skills/` rather
than inline here, so this file stays a short index. Read the linked skill before touching the
corresponding area:

| Topic | Skill |
| --- | --- |
| Atomic design levels, folder structure, export wiring, prop design, shadcn-first sourcing, the size-variant pattern, documentation checklist | [component-architecture](.github/skills/component-architecture/SKILL.md) |
| Tailwind utility composition with `class-variance-authority`, the `cn()` merge helper, design tokens | [styling](.github/skills/styling/SKILL.md) |
| Semantic/keyboard/ARIA/contrast requirements, verifying with Storybook's a11y addon | [accessibility](.github/skills/accessibility/SKILL.md) |
| Inline code comment discipline — when one's warranted, length limit, where longer rationale belongs | [code-comments](.github/skills/code-comments/SKILL.md) |

When adding a new cross-cutting library-contribution convention, add a new skill folder rather
than growing this file.

## Commands

- `npm run type-check` — `tsc --noEmit` against the library source.
- `npm run lint` — `oxlint` (the only linter configured in this repo; no ESLint/Prettier).
- `npm run storybook` — serves stories at `localhost:6006`; use the Accessibility addon panel to
  verify any new/changed component per [accessibility](.github/skills/accessibility/SKILL.md).
- `npm run build-storybook` — runs `type-check:storybook` first, then builds static Storybook.
- `npm run build` — full package build (`tsc -p tsconfig-build.json && vite build && tsx
  buildPackage.ts`); run this before assuming a new component's subpath export/guideline-inlining
  wiring actually works.

## Dependencies

Every entry in `package.json`'s `dependencies`/`devDependencies`/`peerDependencies` is pinned to an
exact version — no `^`, `~`, or `latest`. Pin to the exact version actually installed (check
`node_modules/<pkg>/package.json` or `npm view <pkg> version` if unsure) when adding or upgrading a
package.

`package.json`'s `overrides`/`resolutions` blocks mirror `@stamcat/craftsman`'s (the sibling
project this repo's tooling is patterned after): they redirect a long list of small transitive
polyfill packages to their `@socketregistry/*` equivalents (hardened, Socket-audited replacements)
plus a few specific pins (`glob`, `js-yaml`, `postcss`, `sharp`, `source-map-js`) for known
advisories. Keep both repos' `overrides`/`resolutions` in sync when either adds/removes an entry.

Run `type-check`, `lint`, and (if touching a component) `build-storybook` before finishing any
library-contribution change.

## Tailwind — rules still being finalized

This library uses Tailwind CSS v4 (unlike its sibling `@stamcat/chadman`, which uses Sass/BEM).
The Tailwind-specific authoring conventions (exact utility-ordering rules, when a one-off
`style`/arbitrary-value override is acceptable vs. a new `cva` variant, linting for stray literal
colors) are intentionally light for now and will be filled in under
[styling](.github/skills/styling/SKILL.md) as the component set grows past `Button`. Until then,
follow `Button.tsx`'s existing pattern (a co-located `.css` file using `@apply`, selected from a
single `cva()` call, composed with `cn()`) for any new component.

## Editor setup for `@apply`/`@reference`/`@theme`

Component stylesheets (`src/components/**/*.css`) use Tailwind v4's `@apply`/`@reference`/`@theme`
at-rules, which VS Code's built-in CSS language server doesn't recognize on its own (it'll flag
them as "Unknown at rule"). This repo's `.vscode/settings.json` already fixes this for anyone who
opens the repo in VS Code with the recommended extensions installed (`bradlc.vscode-tailwindcss`,
prompted via `.vscode/extensions.json`) — it re-associates `*.css` files with the `tailwindcss`
language mode the extension provides, which understands these at-rules and adds class-name
autocomplete inside `@apply`. If you still see the warning, install that extension and reload the
window.
