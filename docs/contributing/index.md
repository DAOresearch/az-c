# Contributing

Thank you for your interest in contributing to az-c!

## Getting Started

1. **Fork and Clone**

```bash
git clone https://github.com/your-username/az-c.git
cd az-c
```

2. **Install Dependencies**

```bash
bun install
```

3. **Run Tests**

```bash
bun run test
```

4. **Start Development**

```bash
bun run dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow the [Code Style Guide](/contributing/code-style)
- Write tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Lint and type check
bun run check

# Run tests
bun run test

# Test specific component
bun run test:capture --pattern src/components/your-component/
```

### 4. Commit Changes

We use conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update README"
git commit -m "test: add tests for feature"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `style`: Formatting
- `chore`: Maintenance

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## What to Contribute

### 🐛 Bug Fixes

Found a bug? Please:
1. Check if an issue exists
2. If not, create one with reproduction steps
3. Submit a PR with the fix

### ✨ New Features

Want to add a feature?
1. Open an issue to discuss
2. Wait for feedback/approval
3. Implement with tests
4. Submit PR

### 📝 Documentation

Documentation improvements are always welcome:
- Fix typos
- Clarify explanations
- Add examples
- Improve organization

### 🧪 Tests

Help improve test coverage:
- Add tests for untested components
- Improve test expectations
- Add edge case tests

### 🎨 Components

Create new components:
1. Follow [Design System](/application/design-system)
2. Write tests (setup + spec)
3. Update design system docs
4. Add to component inventory

## Code Review Process

### What We Look For

1. **Code Quality**
   - Follows style guide
   - Clear and readable
   - Well-documented

2. **Tests**
   - Tests pass
   - Good coverage
   - Clear expectations

3. **Documentation**
   - Updated as needed
   - Examples included
   - Clear explanations

4. **Design System**
   - Follows guidelines
   - Uses design tokens
   - Consistent with existing components

### Review Timeline

- Small fixes: 1-2 days
- New features: 3-5 days
- Large changes: 1-2 weeks

### Getting Faster Reviews

- Keep PRs focused and small
- Write clear descriptions
- Include screenshots for UI changes
- Respond to feedback promptly

## Project Structure

```
az-c/
├── src/
│   ├── components/          # React components
│   ├── hooks/               # React hooks
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   └── testing/             # Test infrastructure
├── docs/                    # Documentation
├── .claude/commands/        # Slash commands
└── context/                 # Development artifacts
```

## Code Style

See [Code Style Guide →](/contributing/code-style) for detailed guidelines.

**Key Points:**
- Use types over interfaces
- Use constants instead of enums
- Follow React hooks best practices
- Use async iterator patterns
- Document complex logic

## Testing Requirements

All new components require tests:

1. **Setup File** - Define test scenarios
2. **Spec File** - Define expectations
3. **Screenshot Tests** - Visual validation

See [Writing Tests →](/testing/writing-tests) for details.

### Test Coverage Goals

- New components: 100% coverage
- Bug fixes: Add regression tests
- Features: Test happy path + edge cases

## Design System Compliance

All components must follow the [Design System](/application/design-system):

- Use color tokens from design system
- Follow spacing guidelines
- Test all component states
- Document in design system

## Documentation Requirements

### For New Features

- Update relevant documentation
- Add code examples
- Include screenshots if UI-related

### For Bug Fixes

- Update docs if behavior changed
- Add troubleshooting notes

### For New Components

- Add to component inventory
- Document props and states
- Include visual references
- Add usage examples

## Release Process

We use semantic versioning:

- **Major** (x.0.0) - Breaking changes
- **Minor** (0.x.0) - New features
- **Patch** (0.0.x) - Bug fixes

Releases are created by maintainers.

## Community

### Getting Help

- [GitHub Issues](https://github.com/DAOresearch/az-c/issues) - Report bugs
- [Discussions](https://github.com/DAOresearch/az-c/discussions) - Ask questions

### Code of Conduct

Be respectful and constructive:
- Welcome newcomers
- Help others learn
- Accept feedback gracefully
- Keep discussions focused

## Recognition

Contributors are recognized in:
- Release notes
- Contributors list
- GitHub insights

Thank you for contributing! 🎉

## Next Steps

- [Code Style Guide →](/contributing/code-style)
- [Writing Tests →](/testing/writing-tests)
- [Design System →](/application/design-system)
- [GitHub Repository](https://github.com/DAOresearch/az-c)
