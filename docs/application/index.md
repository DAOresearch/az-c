# What is az-c?

**az-c** (Aztec-Agent) is a hackable Claude Code client - a Terminal User Interface (TUI) for interacting with Claude Code that gives you full control over customization, testing, and automation.

## Philosophy

az-c is built on three core principles:

### 🎯 Hackability

Unlike traditional CLI tools, az-c is designed to be customized and extended:

- **React Components** - Modern component architecture with clear separation of concerns
- **OpenTUI Framework** - Flexible TUI framework with rich component primitives
- **Design System** - Comprehensive guidelines for consistent component development
- **Clear APIs** - Well-documented hooks and services for extending functionality

Want to add a custom component? Change the UI layout? Add new features? az-c makes it straightforward.

### 🧪 Testing

TUI applications are notoriously difficult to test. az-c solves this with a custom testing infrastructure:

- **Screenshot Testing** - Capture visual states of TUI components
- **AI Evaluation** - Claude Vision analyzes screenshots against expectations
- **Historical Tracking** - Compare results across test runs
- **Comprehensive Reports** - HTML reports with confidence scores and visual diffs

See [Testing Infrastructure →](/testing/) for details.

### 🤖 Automation

az-c includes a Claude Code harness for programmatic interactions:

- **Programmatic Sessions** - Create and manage Claude sessions via API
- **Tool Monitoring** - Track tool execution and results
- **Integration Testing** - Test Claude interactions automatically
- **Workflow Automation** - Build automated workflows on top of Claude Code

See [Harness Documentation →](/harness/) for details.

## Architecture

az-c is organized into distinct layers:

```
┌─────────────────────────────────────────┐
│         Terminal User Interface          │
│  (OpenTUI + React Components)           │
├─────────────────────────────────────────┤
│         Application Layer                │
│  (Hooks, Services, State Management)    │
├─────────────────────────────────────────┤
│      Claude Agent SDK Integration        │
│  (Streaming Input, Tool Execution)      │
├─────────────────────────────────────────┤
│       Testing Infrastructure             │
│  (Screenshot Capture, AI Evaluation)    │
├─────────────────────────────────────────┤
│       Claude Code Harness                │
│  (Programmatic API, Automation)         │
└─────────────────────────────────────────┘
```

### Layer Details

#### 1. Terminal User Interface

Built with [OpenTUI](https://github.com/opentui/opentui) and React:

- **Components** - Reusable UI components (Header, MessageView, InputBox, etc.)
- **Design System** - Color tokens, spacing, typography guidelines
- **Interactions** - Keyboard navigation, focus management
- **Rendering** - Terminal rendering with Unicode support

Key components:
- `App.tsx` - Main application container
- `MessageView.tsx` - Scrollable message list
- `InputBox.tsx` - User input field
- `StatusBar.tsx` - Session statistics

#### 2. Application Layer

Business logic and state management:

- **Hooks** - React hooks for common patterns (`useStreamingInput`, `useAgentQuery`)
- **Services** - Reusable services for API calls, storage, etc.
- **Types** - TypeScript definitions for type safety
- **Utilities** - Helper functions for formatting, parsing, etc.

#### 3. Claude Agent SDK

Integration with [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk):

- **Streaming Input** - AsyncIterable pattern for continuous conversation
- **Tool Execution** - Real-time tool use (Read, Edit, Bash, etc.)
- **Session Management** - Track session IDs and context
- **Message Handling** - Process SDK messages (system, user, assistant, result)

See `src/hooks/useStreamingInput.ts` for implementation details.

#### 4. Testing Infrastructure

Custom testing layer for TUI validation:

- **Screenshot Capture** - Playwright-based screenshot capture
- **AI Evaluation** - Claude Vision evaluates against expectations
- **Report Generation** - HTML reports with visual analysis
- **Historical Tracking** - Compare results across runs

See [Testing Infrastructure →](/testing/) for complete documentation.

#### 5. Claude Code Harness

Programmatic API layer (planned):

- **Session API** - Create and manage sessions programmatically
- **Tool Monitoring** - Track tool execution and results
- **Event Streaming** - Subscribe to Claude events
- **Testing Support** - Integration testing utilities

See [Harness Documentation →](/harness/) for details.

## Technology Stack

### Core

- **Runtime** - [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Language** - TypeScript 5+ for type safety
- **UI Framework** - [OpenTUI](https://github.com/opentui/opentui) + React 19

### Claude Integration

- **SDK** - [@anthropic-ai/claude-agent-sdk](https://github.com/anthropics/claude-agent-sdk)
- **API** - Claude 3.7 Sonnet (via Anthropic API)

### Testing

- **Test Runner** - Custom Vitest-based runner
- **Screenshot Capture** - [Playwright](https://playwright.dev/)
- **AI Evaluation** - Claude Vision (via Anthropic API)

### Development Tools

- **Linting** - [Ultracite](https://github.com/ultracite/ultracite) (Biome-based)
- **Type Checking** - TypeScript compiler
- **Documentation** - [VitePress](https://vitepress.dev/)

## Design Principles

### 1. Predictability First

Every visual and interactive element behaves consistently regardless of context.

### 2. Progressive Disclosure

Show only the information the user needs, layer additional detail when requested.

### 3. Perceptible State

Every component exposes idle, loading, success, and error states where applicable.

### 4. Separation of Concerns

Shared styling lives in reusable props or helper components, keeping React components focused and testable.

### 5. Respect the Terminal

Rely on typography, spacing, and color tokens instead of rich graphics. Work within terminal constraints.

## Component Architecture

### Message Flow

```
User Input
    ↓
StreamingInput (produces messages)
    ↓
Claude Agent SDK (processes)
    ↓
Event Stream (system, user, assistant, result)
    ↓
MessageView (renders)
    ↓
Terminal Output
```

### State Management

az-c uses React's built-in state management:

- **useState** - Component-local state
- **useRef** - Values that don't trigger re-renders (queues, resolvers)
- **useCallback** - Memoized callbacks for stable references
- **useEffect** - Side effects and cleanup

No external state management library needed.

### Async Patterns

The streaming input uses a producer-consumer pattern:

```typescript
// Producer: User types message
const sendMessage = (content: string) => {
  queueRef.current.push(content);
  notifyWaiters();
};

// Consumer: SDK pulls messages
const getAsyncIterator = (): AsyncIterable<Message> => {
  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift(); // Fast path
        } else {
          await waitForMessage(); // Slow path
        }
      }
    },
  };
};
```

See `src/hooks/useStreamingInput.ts` for full implementation.

## File Structure

```
az-c/
├── src/
│   ├── index.tsx                 # Entry point
│   ├── components/               # React components
│   │   ├── App.tsx              # Main container
│   │   ├── Header.tsx           # Title banner
│   │   ├── MessageView.tsx      # Message list
│   │   ├── InputBox.tsx         # User input
│   │   ├── StatusBar.tsx        # Session stats
│   │   └── HelpBar.tsx          # Shortcuts
│   ├── hooks/                    # React hooks
│   │   └── useStreamingInput.ts # Async input
│   ├── types/                    # TypeScript types
│   │   └── index.ts             # Type definitions
│   ├── utils/                    # Utilities
│   │   └── formatMessage.ts     # Formatting
│   └── testing/                  # Test infrastructure
│       ├── cli.ts               # Test runner
│       ├── capture/             # Screenshot capture
│       ├── evaluation/          # AI evaluation
│       └── reporting/           # Report generation
├── docs/                         # VitePress documentation
├── package.json
└── README.md
```

## Next Steps

- [Design System →](/application/design-system) - Component specifications
- [Testing Infrastructure →](/testing/) - Learn the testing approach
- [Getting Started →](/guide/getting-started) - Install and run az-c
- [Contributing →](/contributing/) - Contribute to the project

## Use Cases

### For Developers

- **Customizable Claude Client** - Build your own Claude interface
- **TUI Learning** - Learn OpenTUI and React patterns
- **Testing Example** - See TUI testing in action

### For Teams

- **Shared Tool** - Consistent Claude experience across team
- **Custom Workflows** - Add team-specific features
- **Integration Testing** - Automate Claude interactions

### For Researchers

- **Claude Experiments** - Test Claude behaviors programmatically
- **UI Research** - Study terminal interface patterns
- **Testing Research** - Explore AI-powered testing approaches
