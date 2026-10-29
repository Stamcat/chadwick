# Button — Agent Usage Notes

Import:

```tsx
import { Button } from "@stamcat/chadwick/Button";
```

Props:

- Inherits all `@base-ui/react/button` `Button` props (which in turn inherit native `<button>` props).
- `variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"` (default: `"default"`)
- `size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"` (default: `"default"`)

Before passing `className`, read `setup.md`'s "Styling model" section (applies to every component, not just `Button`) — it explains the Tailwind-utility styling model this library uses and how `className` is merged.

Behavior notes:

- `type` defaults to `"button"` (inherited from the native element, not set explicitly by this component).
- `className` is merged with the component's own Tailwind classes via [`cn`](https://github.com/shadcn-ui/cn) (clsx + tailwind-merge semantics) — a conflicting utility you pass (e.g. a different `bg-*`) wins over the variant's own class, so prefer switching `variant`/`size` over overriding colors by hand.
- `default` is the solid primary look; `secondary` is a muted filled look; `outline` and `ghost` are low-emphasis, bordered vs. borderless; `destructive` is a tinted danger look; `link` is borderless and underlines on hover.
- Each `variant` already applies the correct design tokens internally (see `buttonVariants` in `Button.tsx`) — do not pass a `className` override to recolor a variant when a different variant already matches the intent:

  | `variant` | Background token | Text token |
  |---|---|---|
  | `default` | `--primary` (`bg-primary`) | `--primary-foreground` (`text-primary-foreground`) |
  | `secondary` | `--secondary` (`bg-secondary`) | `--secondary-foreground` (`text-secondary-foreground`) |
  | `outline` | `--background` (bordered with `--border`) | `--foreground` |
  | `ghost` | transparent (hover: `--muted`) | `--foreground` |
  | `destructive` | tinted `--destructive` | `--destructive` |
  | `link` | transparent | `--primary` |
- There is no dedicated icon/loading prop. Icons, spinners, and mixed content are passed as `children`; there's also no built-in loading state — show a spinner icon as a child and set `disabled` yourself.
- Only real disable is supported (`disabled={true}`); there's no style-only "looks disabled" class.
- Native button modes are supported (`type="button" | "submit" | "reset"`).
- Accessibility props such as `aria-label` pass through unchanged.
- **Icon-only sizes need a label.** `icon`, `icon-xs`, `icon-sm`, and `icon-lg` render with no room for visible text — always pass `aria-label` (or `aria-labelledby`) when using one of these sizes with icon-only children.

Example:

```tsx
<Button variant="default" onClick={onSave}>Save</Button>
```

Story-aligned usage examples:

```tsx
// Icon content
<Button variant="outline">
  New <Plus />
</Button>

// Loading content (no built-in loading state; disable it yourself)
<Button disabled>
  <Loader2 /> Please wait
</Button>

// Icon-only button needs an accessible label
<Button variant="destructive" size="icon" aria-label="Delete">
  <Trash2 />
</Button>

// Native submit behavior
<Button type="submit" aria-label="Save form">Save</Button>
```

Implementation note:

- Sizing/variant classes depend on the `--primary`/`--secondary`/`--destructive`/`--radius-md` design tokens defined globally in `src/index.css`'s `@theme inline` block; `Button.tsx` assumes they're already in scope (via `@stamcat/chadwick/styles/tokens` or the full `@stamcat/chadwick` stylesheet).
