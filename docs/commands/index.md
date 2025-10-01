# Slash Commands

az-c includes powerful slash commands for development workflows.

## Available Commands

### /prd - Generate Product Requirement Documents

Generates structured PRDs adapted to task complexity.

```bash
/prd <topic-description> [--issue] [--auto]
```

**Learn more:** [PRD Command](./prd)

### /tdd-component - TDD Component Development

Generate and iteratively improve components using Test-Driven Development until all tests pass.

```bash
/tdd-component <component-name> [continue]
```

**Learn more:** [TDD Component](./tdd-component)

### /review-pr - Review Pull Requests

Review a pull request with AI analysis.

```bash
/review-pr [pr-number]
```

**Learn more:** [Review PR](./review-pr)

### /label-issue - Label GitHub Issues

Apply appropriate labels to GitHub issues.

```bash
/label-issue [issue-number]
```

**Learn more:** [Label Issue](./label-issue)

## Using Slash Commands

Slash commands are markdown files in `.claude/commands/` that define prompts and workflows.

### In the TUI

Type the command directly:

```
> /prd Implement dark mode toggle
```

### In GitHub

Use in issue comments or PR descriptions:

```markdown
@claude /review-pr
```

## Creating Custom Commands

1. Create a markdown file in `.claude/commands/`
2. Define the command trigger and prompt
3. Document usage

Example:

```markdown
# /my-command

Description of what the command does.

## Usage

/my-command <argument>

## Prompt Template

Your prompt template here...
```

## Next Steps

- **[PRD Command](./prd)** - Generate product requirement documents
- **[TDD Component](./tdd-component)** - Test-driven development workflow
- **[Contributing](/contributing/)** - Create your own commands
