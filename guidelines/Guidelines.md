# Chadwick Design System Guidelines

Chadwick is a small, atomic-design React component library built on shadcn/ui and Tailwind CSS. It ships CSS custom properties as design tokens and one component so far (`Button`).

This folder is a build artifact of the consuming-application ruleset (`AGENTS.md` at the repo root), generated for [Figma Make](https://help.figma.com/hc/en-us/articles/39241689698839-Get-started-with-Make-kits) specifically — it is not a separately maintained ruleset. If you're changing chadwick's own source rather than designing with it in a kit, see [`CONTRIBUTING.md`](../CONTRIBUTING.md) instead.

## Reading order

**MUST READ before writing any code:**
1. This file — overview and routing to the rest of the guidelines
2. `setup.md` — required CSS imports, design tokens, and dark mode
3. `components/overview.md` — the component catalog

**Read on-demand:**
- `components/{name}.md` — read BEFORE using that component. These files route to the component's own `AGENTS.md`, co-located with its source in the package (for example `src/components/atoms/Button/AGENTS.md`) — that `AGENTS.md` is the single source of truth for that component's props, behavior, and examples, so read it in full.

## Rules

- Always import components from their documented subpath (`@stamcat/chadwick/{Component}`, for example `@stamcat/chadwick/Button`). Never deep-import from `@stamcat/chadwick/src/...`.
- Do NOT write code using a component until you've read its `components/{name}.md` (which routes to its `AGENTS.md`).
- Do not invent props, variants, or sizes that aren't documented in the component's `AGENTS.md` — if something isn't covered there, it isn't supported.
- Use the design tokens from `setup.md` (CSS custom properties) instead of hardcoded colors, radii, or fonts.
- A bare native element (for example a plain `<button>`) receives no library styling — always use the component.
