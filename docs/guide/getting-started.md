# Installation & Quick Start

Get az-c up and running in minutes.

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

### 3. Set Up API Key

Create a `.env` file or set the environment variable:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Get your API key from the [Anthropic Console](https://console.anthropic.com/).

## Running az-c

### Development Mode

Start the TUI with auto-reload:

```bash
bun run dev
```

This starts the interactive terminal interface with the Claude Code system prompt.

### Keyboard Shortcuts

Once running, use these shortcuts:

- **Enter** - Send your prompt to Claude
- **Tab** - Switch focus between input field and message history
- **Esc** - Exit the application
- **Ctrl+L** - Clear conversation history

## First Session

After starting az-c, you'll see:

1. **ASCII Header** - Project title and branding
2. **Message Area** - Scrollable conversation history
3. **Input Box** - Type your prompts here
4. **Status Bar** - Session stats (tokens, cost, duration)
5. **Help Bar** - Keyboard shortcuts

### Example Interaction

Try these prompts to get started:

```
What files are in this project?
```

```
Show me the main App.tsx file
```

```
Explain the streaming input architecture
```

## Configuration Options

The app uses these SDK options by default:

```typescript
{
  permissionMode: "bypassPermissions",  // No permission prompts
  systemPrompt: {
    type: "preset",
    preset: "claude_code"               // Use Claude Code system prompt
  }
}
```

See [Configuration →](/guide/configuration) for customization options.

## Next Steps

- [Configuration Guide →](/guide/configuration) - Customize your setup
- [Application Architecture →](/application/) - Understand how az-c works
- [Writing Tests →](/testing/writing-tests) - Learn the testing approach

## Troubleshooting

### API Key Issues

If you see authentication errors:

1. Verify your API key is set: `echo $ANTHROPIC_API_KEY`
2. Check the key is valid in [Anthropic Console](https://console.anthropic.com/)
3. Ensure no extra spaces or quotes in the environment variable

### Terminal Display Issues

If Unicode characters don't render correctly:

1. Use a modern terminal emulator (iTerm2, Windows Terminal, etc.)
2. Ensure UTF-8 encoding is enabled
3. Try a different terminal font with good Unicode support

### Development Mode Not Reloading

If auto-reload isn't working:

1. Check you're using `bun run dev` (not `bun run src/index.tsx`)
2. Verify Bun is up to date: `bun --version`
3. Try clearing cache: `bun run clean:dev`

## Getting Help

- [GitHub Issues](https://github.com/DAOresearch/az-c/issues) - Report bugs
- [Discussions](https://github.com/DAOresearch/az-c/discussions) - Ask questions
- [Contributing Guide](/contributing/) - Contribute to the project
