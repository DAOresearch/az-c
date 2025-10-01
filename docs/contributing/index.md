# Contributing to az-c

Thank you for your interest in contributing to az-c!

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
3. **Install dependencies:** `bun install`
4. **Create a branch:** `git checkout -b feature/your-feature`

## Development Workflow

### 1. Make Changes

Edit code following our [Code Style](./code-style) guide.

### 2. Run Checks

```bash
# Lint and format
bun run lint

# Type checking
bun run typecheck

# Run all checks
bun run check
```

### 3. Write Tests

Add tests for new features:

```typescript
// component.setup.ts
export const scenarios = [
  {
    name: "default",
    description: "Component in default state",
    expectation: "Visual expectation",
    params: {},
  },
];
```

Run tests:

```bash
bun run test
```

### 4. Commit Changes

Follow conventional commits:

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve input border rendering"
git commit -m "docs: update testing guide"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature
```

Then create a pull request on GitHub.

## Code Style

We use **Biome** and **Ultracite** for linting and formatting.

Key conventions:

- **Types over interfaces** - Use `type` instead of `interface`
- **Constants over enums** - Use const objects with `as const`
- **Snake case for SDK** - External APIs use snake_case
- **Cleanup effects** - Empty dependency arrays for unmount-only effects

**Read the full guide:** [Code Style](./code-style)

## Testing Requirements

All new components must include:

1. **Test scenarios** - `component.setup.ts`
2. **Test spec** - `component.spec.tsx`
3. **Visual validation** - Pass AI evaluation (>90% confidence)

**Learn more:** [Testing Infrastructure](/testing/)

## Documentation

Update documentation when:

- Adding new features
- Changing APIs
- Modifying behavior
- Adding examples

Documentation is in `docs/` and built with VitePress.

## PR Process

1. **CI checks** - All checks must pass
2. **Code review** - Maintainer reviews code
3. **Tests pass** - Visual tests must pass
4. **Documentation** - Docs updated if needed

## Community Guidelines

- Be respectful and constructive
- Help others learn
- Share knowledge
- Celebrate successes

## Questions?

- **[Discussions](https://github.com/DAOresearch/az-c/discussions)** - Ask questions
- **[Issues](https://github.com/DAOresearch/az-c/issues)** - Report bugs
- **[Documentation](/guide/)** - Read the docs

## Next Steps

- **[Code Style](./code-style)** - TypeScript conventions
- **[Testing Requirements](./testing-requirements)** - Test guidelines
- **[PR Process](./pr-process)** - Contribution workflow
