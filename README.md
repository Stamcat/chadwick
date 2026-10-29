# chadwick

A lightweight, atomic-design component library built on [shadcn/ui](https://ui.shadcn.com) and Tailwind CSS. Published as `@stamcat/chadwick`.

Currently ships one component, `Button`, displayed and documented in Storybook.

## Development

```bash
npm install
npm run storybook
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full set of conventions for contributing to this repo's own source, and [`AGENTS.md`](./AGENTS.md) for how a consuming application should use the published package.

## Scripts

- `npm run storybook` — serves Storybook at `localhost:6006`.
- `npm run build-storybook` — type-checks, then builds static Storybook.
- `npm run type-check` — `tsc --noEmit`.
- `npm run lint` — `oxlint`.
- `npm run build` — builds the publishable package into `dist/`.
- `npm run parity:shadcn` — reports which shadcn/ui registry components are/aren't implemented here yet.
