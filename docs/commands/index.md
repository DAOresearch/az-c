# Commands Reference

az-c includes custom slash commands for common development workflows.

## Available Commands

Commands are defined in `.claude/commands/` and can be invoked in Claude Code conversations.

### `/tdd-component`

Generate and iteratively improve TDD React components until all tests pass.

**Usage:**
```
/tdd-component <component-name> [continue]
```

**Features:**
- Creates component, tests, and setup files
- Runs tests and fixes failures
- Iterates until all tests pass
- Follows design system guidelines

**Example:**
```
/tdd-component button
```

This generates:
- `src/components/button/button.tsx`
- `src/components/button/button.spec.tsx`
- `src/components/button/button.setup.ts`

Then runs tests and fixes any failures.

---

### `/prd`

Generate smart PRD adapted to task complexity.

**Usage:**
```
/prd <topic-description> [--issue] [--auto]
```

**Options:**
- `--issue` - Create GitHub issue from PRD
- `--auto` - Auto-implement after PRD generation

**Example:**
```
/prd Add dark mode support --issue
```

Generates a comprehensive PRD and creates a GitHub issue.

---

### `/review-pr`

Review a pull request.

**Usage:**
```
/review-pr [pr-number]
```

**Features:**
- Analyzes PR changes
- Checks for bugs and issues
- Suggests improvements
- Reviews tests

**Example:**
```
/review-pr 42
```

---

### `/label-issue`

Apply labels to GitHub issues.

**Usage:**
```
/label-issue [issue-number]
```

**Features:**
- Analyzes issue content
- Suggests appropriate labels
- Applies labels to issue

**Example:**
```
/label-issue 15
```

---

## Custom Commands

You can create your own commands by adding markdown files to `.claude/commands/`.

### Command File Structure

```markdown
<!-- .claude/commands/my-command.md -->

You are an expert at [task description].

Your job is to [what the command does].

Follow these steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

[Additional instructions...]
```

### Example: Code Review Command

```markdown
<!-- .claude/commands/quick-review.md -->

You are an expert code reviewer.

Review the current changes in the repository for:
- Code quality issues
- Potential bugs
- Style violations
- Missing tests

Provide a concise summary with actionable feedback.
```

**Usage:**
```
/quick-review
```

## Command Development

### Best Practices

1. **Clear Instructions** - Be specific about what the command should do
2. **Step-by-Step** - Break complex tasks into steps
3. **Examples** - Include examples when helpful
4. **Error Handling** - Describe how to handle errors
5. **Testing** - Test commands before committing

### Testing Commands

Test commands in Claude Code:

```
/your-command test-input
```

Verify:
- ✅ Command executes correctly
- ✅ Output matches expectations
- ✅ Error cases handled
- ✅ Documentation is clear

## Next Steps

- [Application Guide →](/application/) - Understand az-c architecture
- [Contributing →](/contributing/) - Contribute new commands
- [GitHub Repository](https://github.com/DAOresearch/az-c) - View source code
