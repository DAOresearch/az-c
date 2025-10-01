# What is az-c?

**az-c** is a hackable Claude Code client - a Terminal User Interface (TUI) for interacting with Claude Code that emphasizes customization, testing, and automation.

## Overview

az-c demonstrates how to build a production-quality TUI application using modern tools:

- **OpenTUI** - React-based terminal UI framework
- **Claude Agent SDK** - Official SDK for Claude interactions
- **TypeScript** - Type-safe development
- **Custom Testing** - Purpose-built TUI testing infrastructure

## Why Build a Custom Client?

### 1. Hackability First

Unlike closed clients, az-c is designed to be modified:

- **Open Architecture** - Clean separation of concerns
- **Documented Patterns** - Every pattern explained
- **Extensible Design** - Easy to add new features
- **Type Safety** - TypeScript ensures confidence

### 2. Testing Infrastructure

Most TUI applications lack proper testing. az-c includes:

- **Screenshot Testing** - Visual regression testing
- **AI Evaluation** - Claude analyzes screenshots
- **Automated Pipeline** - Complete CI/CD integration
- **Historical Tracking** - Version control for tests

### 3. Programmatic API

The Claude Code Harness provides:

- **Automation** - Programmatic agent interactions
- **Integration Testing** - Test real workflows
- **Custom Workflows** - Build advanced pipelines
- **Batch Operations** - Automate repetitive tasks

## Core Philosophy

### Hackability

Every component should be easy to understand, modify, and extend. We achieve this through:

- **Small Components** - Single responsibility
- **Clear Interfaces** - Well-defined props and types
- **Minimal Magic** - Explicit over implicit
- **Documentation** - Every pattern documented

### Testing

Quality requires testing. We provide:

- **Unit Tests** - Component behavior
- **Screenshot Tests** - Visual compliance
- **Integration Tests** - End-to-end workflows
- **AI Evaluation** - Automated visual review

### Automation

Repetitive tasks should be automated:

- **Slash Commands** - Quick workflows
- **GitHub Actions** - CI/CD automation
- **Harness API** - Programmatic control
- **PRD Workflow** - Structured development

## Architecture Layers

### 1. TUI Layer

Built with OpenTUI and React:

```
src/
├── components/
│   ├── banner/           # Header component
│   ├── chat/             # Chat interface
│   ├── agent-spinner/    # Loading states
│   ├── messages/         # Message renderers
│   └── ui/               # Input, buttons, etc.
└── App.tsx              # Main application
```

**Key Features:**
- React components for terminal
- Streaming message support
- Keyboard navigation
- Real-time updates

### 2. Application Layer

Business logic and state:

```
src/
├── services/
│   └── AgentService.ts   # Claude SDK wrapper
├── hooks/
│   ├── useStreamingInput.ts  # Message streaming
│   ├── useTokenUsage.ts      # Usage tracking
│   └── useTimeLine.ts        # Session timing
└── types/
    └── index.ts          # Type definitions
```

**Key Features:**
- AgentService abstracts SDK
- Hooks manage state
- Type-safe interfaces
- Clean separation

### 3. Testing Layer

Custom testing infrastructure:

```
src/testing/
├── capture/              # Screenshot capture
│   ├── adapters/        # Platform adapters
│   └── runner.ts        # Test runner
├── evaluation/          # AI evaluation
│   ├── Evaluator.ts
│   └── Collector.ts
├── reporting/           # HTML reports
└── pipeline.ts          # Orchestration
```

**Key Features:**
- Playwright + node-pty
- AI-powered evaluation
- HTML report generation
- Historical tracking

### 4. Harness Layer

Programmatic API:

```
src/harness/             # (Future)
├── ClaudeHarness.ts
├── SessionManager.ts
└── WorkflowRunner.ts
```

**Key Features:**
- Programmatic agent control
- Workflow automation
- Integration testing
- Batch operations

## Design Principles

### 1. Separation of Concerns

Each layer has a clear responsibility:

- **UI** - Presentation only
- **Hooks** - State management
- **Services** - Business logic
- **Types** - Data structures

### 2. Type Safety

TypeScript everywhere:

```typescript
export type Message = {
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
};
```

### 3. Testability

Every component is testable:

```typescript
// Component
export const InputField = ({ onSubmit, disabled }: Props) => {
  // ...
};

// Test
describe("InputField", () => {
  it("renders with border", async () => {
    // ...
  });
});
```

### 4. Documentation

Code is documented at multiple levels:

- **Architecture** - This guide
- **Components** - Design system
- **Patterns** - Style guide
- **API** - Type definitions

## Key Features

### Rich Terminal UI

- ASCII art header
- Streaming messages
- Tool execution display
- Keyboard shortcuts
- Status bar with metrics

### Streaming Architecture

Uses Claude Agent SDK's streaming input mode:

```typescript
const iterator = useStreamingInput();

for await (const message of iterator) {
  processMessage(message);
}
```

### Token Tracking

Real-time usage monitoring:

```typescript
const { totalTokens, cost, duration } = useTokenUsage();
```

### Session Management

Persistent session IDs:

```typescript
if (message.type === "system" && message.subtype === "init") {
  setSessionId(message.session_id);
}
```

## Technology Stack

### Core Dependencies

- **[@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)** - Claude Agent SDK
- **[@opentui/react](https://www.npmjs.com/package/@opentui/react)** - Terminal UI framework
- **[react](https://react.dev/)** - Component composition
- **[bun](https://bun.sh/)** - Runtime and package manager

### Testing Dependencies

- **[playwright](https://playwright.dev/)** - Browser automation
- **[node-pty](https://github.com/microsoft/node-pty)** - PTY management
- **[winston](https://github.com/winstonjs/winston)** - Logging

### Development Tools

- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Biome](https://biomejs.dev/)** - Linting and formatting
- **[Ultracite](https://github.com/wearesho-team/ultracite)** - Code quality

## Comparison with Other Clients

| Feature | az-c | Standard Clients |
|---------|------|------------------|
| **Open Source** | ✅ Yes | ❌ Usually closed |
| **Hackable** | ✅ Documented patterns | ❌ Limited |
| **Testing** | ✅ Custom infrastructure | ❌ Minimal |
| **Automation** | ✅ Harness API | ❌ Manual only |
| **Terminal UI** | ✅ Rich TUI | ⚠️ Basic CLI |
| **Type Safety** | ✅ Full TypeScript | ⚠️ Varies |

## Use Cases

### 1. Development Tool

Use az-c as your primary Claude Code interface:
- Rich terminal experience
- Keyboard-driven workflow
- Token tracking
- Session management

### 2. Learning Platform

Study how to build TUI applications:
- Complete example
- Documented patterns
- Testing infrastructure
- Production-ready code

### 3. Testing Framework

Test your own agent applications:
- Screenshot testing
- AI evaluation
- Integration testing
- Workflow automation

### 4. Automation Platform

Build custom workflows:
- Harness API
- Slash commands
- GitHub Actions
- PRD workflow

## Next Steps

- **[Architecture](./architecture)** - Deep dive into system design
- **[Customization](./customization)** - Modify az-c for your needs
- **[Component Development](./components)** - Build new components
- **[Design System](./design-system)** - Visual specification

---

Ready to understand the architecture? Continue to **[Architecture](./architecture)**.
