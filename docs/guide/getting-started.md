# Getting Started

Get up and running with az-c in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Bun runtime** - [Install Bun](https://bun.sh/)
- **Claude API key** - Get one from [Anthropic Console](https://console.anthropic.com/)
- **Terminal** - Any modern terminal with Unicode support

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/DAOresearch/az-c.git
cd az-c
```

### 2. Install Dependencies

```bash
bun install
```

This will install all required dependencies including:
- `@anthropic-ai/claude-agent-sdk` - Claude Agent SDK
- `@opentui/react` - Terminal UI framework
- `react` - React for component composition
- Testing tools (Playwright, Vitest)

### 3. Set Up API Key

Create a `.env` file in the project root:

```bash
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
```

Or export it in your shell:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

## Running az-c

### Start the TUI

```bash
bun run dev
```

This will start the terminal user interface with hot module reloading.

### First Interaction

Once the TUI starts, you'll see:

```
┌─────────────────────────────────────────┐
│           az-c - Claude Code            │
│        Hackable Terminal Client         │
└─────────────────────────────────────────┘

> Type your message and press Enter...
```

Try your first prompt:

```
Hello! Can you tell me about this project?
```

### Keyboard Shortcuts

- **Enter** - Send your prompt to Claude
- **Tab** - Switch focus between input and message history
- **Esc** - Exit the application
- **Ctrl+L** - Clear conversation history

## Next Steps

### Explore the TUI

- Send messages and watch Claude respond with streaming text
- Observe tool calls as Claude uses tools like Read, Edit, Bash
- Monitor token usage in the status bar

### Customize az-c

- **[Configuration Guide](./configuration)** - Configure system prompt, permissions, etc.
- **[Application Guide](/application/)** - Understand the architecture
- **[Component Development](/application/components)** - Build custom components

### Run Tests

```bash
# Run the complete test pipeline
bun run test

# Capture screenshots only
bun run test:capture

# Evaluate existing screenshots
bun run test:evaluate
```

Learn more in the **[Testing Infrastructure](/testing/)** section.

### Use Slash Commands

az-c includes powerful slash commands for development workflows:

```bash
# Generate a PRD for a feature
/prd Implement dark mode toggle

# Create a component with TDD workflow
/tdd-component Button

# Review a pull request
/review-pr 123
```

See **[Slash Commands](/commands/)** for details.

## Development Commands

```bash
# Start development mode (hot reload)
bun run dev

# Type checking
bun run typecheck

# Linting (Biome + Ultracite)
bun run lint

# Run all checks (lint + typecheck)
bun run check

# Run tests
bun run test

# Build documentation site
bun run docs:build

# Preview documentation
bun run docs:preview
```

## Troubleshooting

### API Key Not Found

If you see "ANTHROPIC_API_KEY not set", ensure:
1. You created `.env` with your API key
2. Or exported `ANTHROPIC_API_KEY` in your shell
3. Restart the terminal/shell after setting the key

### Terminal Display Issues

If you see broken characters or rendering issues:
1. Ensure your terminal supports Unicode
2. Try a different terminal (iTerm2, Alacritty, Windows Terminal)
3. Check your terminal's font supports Unicode box-drawing characters

### Import Errors

If you see import errors:
1. Run `bun install` again
2. Delete `node_modules` and run `bun install`
3. Ensure you're using Bun (not npm/yarn)

## Getting Help

- **[Documentation](/application/)** - Read the guides
- **[GitHub Issues](https://github.com/DAOresearch/az-c/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/DAOresearch/az-c/discussions)** - Ask questions

---

Ready to dive deeper? Check out the **[Application Guide](/application/)** to understand how az-c works under the hood.
