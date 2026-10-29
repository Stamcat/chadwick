---
name: code-comments
description: 'Inline code comment discipline for chadwick''s own source — when a comment is warranted, how long it may be, and where longer rationale belongs instead. Use whenever writing or reviewing a comment in any src/ or scripts/ file.'
---

# Code comments (library-internal)

Applies to chadwick's own source (`src/`, `scripts/`). Default to **zero** inline comments — code
should read clearly enough on its own that most lines need none.

## When a comment is warranted

Only add one to explain something genuinely non-obvious that the code itself can't show — e.g. a
workaround for a browser/library quirk, or a constraint that isn't visible from the surrounding
code. Never add a comment that just restates what the next line does.

## Length limit

One line, hard cap. If the reasoning needs more than that:

- Put the full explanation in the nearest `AGENTS.md` (component-level) or the relevant skill's
  `SKILL.md` (repo-wide convention) instead.
- Leave only a short pointer in the code, e.g. `// see AGENTS.md`.

This keeps implementation files scannable while still making the full rationale discoverable to
the next person (or agent) who needs it.
