# Claude Code TUI

An interactive terminal user interface for Claude Code built with OpenTUI and the Claude Agent SDK.

## Features

- 🎨 Rich terminal UI with ASCII art header
- 💬 Interactive chat interface with streaming support
- 🔧 Real-time tool use display (Read, Edit, Bash, etc.)
- 📊 Token usage and cost tracking
- ⌨️  Keyboard navigation and shortcuts
- 🎯 Session management

## Installation

```bash
bun install
```

## Requirements

- Bun runtime
- Claude API key (set via `ANTHROPIC_API_KEY` environment variable)

## Usage

Start the TUI:

```bash
bun run dev
```

### Keyboard Shortcuts

- **Enter** - Send your prompt to Claude
- **Tab** - Switch focus between input field and message history
- **Esc** - Exit the application
- **Ctrl+L** - Clear conversation history

## Architecture

### Streaming Input Architecture

The TUI uses the Claude Agent SDK's streaming input mode, which allows:
- Multiple prompts in a single session
- Real-time message sending without restarting
- Continuous conversation flow
- Interruption support (future)

### Components

```
App.tsx                    # Main application with SDK integration
├── Header.tsx            # ASCII title + session info
├── MessageView.tsx       # Scrollable message list
│   └── MessageItem.tsx   # Individual message renderer
├── StatusBar.tsx         # Session stats (tokens, cost, duration)
├── InputBox.tsx          # Prompt input field
└── HelpBar.tsx           # Keyboard shortcuts

hooks/
└── useStreamingInput.ts  # Async generator for streaming input

types/
└── index.ts             # TypeScript types and interfaces

utils/
└── formatMessage.ts     # Message formatting utilities
```

### Message Flow

1. User types prompt and presses Enter
2. `sendMessage()` queues the message in the streaming input
3. SDK processes the message and returns events
4. Messages are displayed in real-time as they arrive
5. Stats updated when result message received

## Configuration

The app uses the following SDK options:

```typescript
{
  permissionMode: "bypassPermissions",  // No permission prompts
  systemPrompt: {
    type: "preset",
    preset: "claude_code"               // Use Claude Code system prompt
  }
}
```

## Development

Check TypeScript types:
```bash
bunx tsc --noEmit
```

## Message Types

The UI handles these SDK message types:

- **SDKSystemMessage** - Session initialization
- **SDKUserMessage** - User prompts
- **SDKAssistantMessage** - Claude's responses and tool uses
- **SDKResultMessage** - Final stats and completion

## Future Enhancements

- [ ] Streaming partial messages (real-time text streaming)
- [ ] Permission prompt UI (interactive approval)
- [ ] Session resumption
- [ ] Tool activity animations
- [ ] Conversation save/load
- [ ] Configuration UI (model selection, etc.)
- [ ] Message search and filtering
- [ ] Tool result display
- [ ] Better error recovery

## License

MIT
