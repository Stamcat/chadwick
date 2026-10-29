# Project Setup

## Required CSS imports

Components ship their styles as a side effect of importing them — no separate stylesheet import is needed for a component itself, and your app does not need Tailwind installed for these styles to apply:

```tsx
import { Button } from "@stamcat/chadwick/Button";
```

Design tokens (CSS custom properties for color and shape) are a separate import and must be included once, globally, before any component is rendered:

```ts
import "@stamcat/chadwick/styles/tokens";
```

## Design tokens

All colors and shape values are unitless-free CSS custom properties (already valid CSS values, e.g. `oklch(...)`, `0.625rem`) — use `var(--token-name)` directly in any custom CSS you write, with no multiplication or unit conversion needed.

Semantic tokens (prefer these over anything else):
- Surfaces: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`
- Actions: `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`
- Status: `--destructive`
- Form/interactive: `--border`, `--input`, `--ring`
- Shape: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`
- Type: `--font-sans`, `--font-heading`

Dark mode is a `.dark` class applied to an ancestor element (typically `<html>` or `<body>`); it redefines the same custom properties, so components never need dark-mode-specific styling of their own.

## Style mapping (read this before styling anything)

Chadwick uses Tailwind CSS v4 internally, but a component's variants/sizes each compile down to a single custom CSS class (e.g. `btn--default`), not a chain of individual utility classes on the element — so a token like `--primary` still backs the `default` variant's background, but you won't see `bg-primary` in the rendered markup. Use the tables below when you need to style around a component from the outside.

### Styling model

This applies to every component in the catalog, not just the one you're currently reading about:

- A component's `className` prop is merged with its own built-in classes via `cn()` (clsx + tailwind-merge semantics), but because the component's own classes are custom (not plain Tailwind utilities), tailwind-merge cannot dedupe a conflicting utility you pass against them — passing `bg-*` in `className` will NOT reliably override the variant's background.
- Always prefer switching a component's own `variant`/`size` prop over trying to style around it with `className` — see that component's `AGENTS.md` for its full variant/token table. A `className` override should only be used for layout concerns (margin, flex placement) that the component doesn't already own.
- Never hardcode a color/radius value (hex, rgb, raw px) anywhere — use the semantic Tailwind utilities below in your own custom CSS, picking by intent, not by what looks closest.

**Backgrounds:**

| Utility / token | When to reach for it |
|---|---|
| `bg-background` / `--background` | Page/app background |
| `bg-card` / `--card` | Elevated surfaces — cards, panels, popovers (pair with `text-card-foreground`) |
| `bg-primary` / `--primary` | Primary action fills (filled buttons) |
| `bg-secondary` / `--secondary` | Secondary/supporting action fills |
| `bg-muted` / `--muted` | Low-emphasis fills, hover backgrounds on neutral elements |
| `bg-accent` / `--accent` | Hover/active background for ghost or outline elements |
| `bg-destructive` / `--destructive` | Destructive actions — tint with Tailwind's opacity modifier (`bg-destructive/10`) rather than using it as a solid background (see `Button.tsx`'s `destructive` variant) |

**Text:**

| Utility / token | When to reach for it |
|---|---|
| `text-foreground` / `--foreground` | Default body text on `bg-background` |
| `text-primary-foreground` / `--primary-foreground` | Text/icons on top of a `bg-primary` fill |
| `text-secondary-foreground` / `--secondary-foreground` | Text/icons on top of a `bg-secondary` fill |
| `text-muted-foreground` / `--muted-foreground` | De-emphasized text (captions, placeholders) |
| `text-accent-foreground` / `--accent-foreground` | Text/icons on top of a `bg-accent` fill |
| `text-destructive` / `--destructive` | Destructive text (used directly as text color, not paired with a `-foreground` token) |

**Borders & focus rings:**

| Utility / token | When to reach for it |
|---|---|
| `border-border` / `--border` | Default element borders (outline buttons, inputs, dividers) |
| `border-input` / `--input` | Form control borders specifically, where it should differ from `--border` |
| `ring-ring` / `--ring` | Focus-visible outlines/rings |

**Shape:** pick the smallest radius utility that isn't visually too subtle for the element's size — `rounded-sm`/`rounded-md` for small controls, `rounded-lg` for default-sized containers, `rounded-xl` and above only for large, prominent surfaces.

## Rules

- Do not hardcode hex/rgb colors or border-radius pixel values — use the semantic utilities above.
- Always pair a background utility with its matching `-foreground` text utility (e.g. `bg-primary` with `text-primary-foreground`), not an arbitrary other text token.
- Never guess a token's purpose from its name alone — consult the style mapping tables above.
- Do not reach into `@stamcat/chadwick/src/styles/...` directly; the only documented style entry point is `@stamcat/chadwick/styles/tokens`.
