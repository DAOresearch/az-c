# Claude Code Harness

The Claude Code Harness is a programmatic API layer for automating interactions with Claude Code.

::: warning Work in Progress
The Harness is currently under development. This documentation describes the planned architecture and API.
:::

## What is the Harness?

The Harness provides a programmatic interface for:

- **Session Management** - Create and manage Claude sessions via API
- **Tool Monitoring** - Track tool execution and results
- **Event Streaming** - Subscribe to Claude events in real-time
- **Integration Testing** - Automate testing of Claude interactions
- **Workflow Automation** - Build automated workflows on top of Claude Code

## Architecture

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│    (TUI, CLI, Custom Clients)           │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Claude Code Harness (API)          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Session Management             │ │
│  │  - Create sessions                 │ │
│  │  - Send messages                   │ │
│  │  - Track state                     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Tool Monitoring                │ │
│  │  - Tool execution events           │ │
│  │  - Result tracking                 │ │
│  │  - Performance metrics             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Event Streaming                │ │
│  │  - Real-time events                │ │
│  │  - Message updates                 │ │
│  │  - State changes                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       Claude Agent SDK                   │
│    (Official Anthropic SDK)             │
└─────────────────────────────────────────┘
```

## Planned API

### Session Management

```typescript
import { createHarness } from "@az-c/harness";

// Create a harness instance
const harness = createHarness({
  apiKey: process.env.ANTHROPIC_API_KEY,
  systemPrompt: "claude_code",
});

// Create a new session
const session = await harness.createSession({
  id: "test-session-1",
  workingDirectory: "/path/to/project",
});

// Send a message
const response = await session.sendMessage({
  content: "What files are in this directory?",
});

// Get session state
const state = session.getState();
console.log("Messages:", state.messages.length);
console.log("Tokens used:", state.tokenUsage);
```

### Event Streaming

```typescript
// Subscribe to events
session.on("message", (message) => {
  console.log("New message:", message);
});

session.on("tool_use", (tool) => {
  console.log("Tool called:", tool.name);
});

session.on("tool_result", (result) => {
  console.log("Tool result:", result);
});

session.on("error", (error) => {
  console.error("Error:", error);
});

// Wait for completion
await session.waitForCompletion();
```

### Tool Monitoring

```typescript
// Get tool execution history
const tools = session.getToolHistory();

for (const tool of tools) {
  console.log({
    name: tool.name,
    duration: tool.duration,
    success: tool.success,
    result: tool.result,
  });
}

// Get specific tool calls
const readCalls = session.getToolCalls({ name: "Read" });
console.log("Read operations:", readCalls.length);
```

### Integration Testing

```typescript
import { describe, it, expect } from "bun:test";
import { createHarness } from "@az-c/harness";

describe("Claude Code Integration", () => {
  it("should read files correctly", async () => {
    const harness = createHarness();
    const session = await harness.createSession();

    const response = await session.sendMessage({
      content: "Read package.json",
    });

    // Assert tool was called
    const readCalls = session.getToolCalls({ name: "Read" });
    expect(readCalls.length).toBeGreaterThan(0);
    expect(readCalls[0].args.file_path).toContain("package.json");

    // Assert response mentions package.json
    expect(response.content).toContain("package.json");

    await session.close();
  });

  it("should handle errors gracefully", async () => {
    const harness = createHarness();
    const session = await harness.createSession();

    const response = await session.sendMessage({
      content: "Read nonexistent-file.txt",
    });

    // Should mention file not found
    expect(response.content.toLowerCase()).toContain("not found");

    await session.close();
  });
});
```

### Workflow Automation

```typescript
// Automate a code review workflow
async function automatedCodeReview(filePath: string) {
  const harness = createHarness();
  const session = await harness.createSession();

  // Step 1: Read the file
  await session.sendMessage({
    content: `Read ${filePath}`,
  });

  // Step 2: Request review
  const review = await session.sendMessage({
    content: "Review this code for bugs and improvements",
  });

  // Step 3: Extract recommendations
  const recommendations = parseReview(review.content);

  // Step 4: Generate report
  const report = {
    file: filePath,
    timestamp: new Date(),
    recommendations,
    toolsUsed: session.getToolHistory().length,
    tokensUsed: session.getState().tokenUsage,
  };

  await session.close();
  return report;
}
```

## Use Cases

### 1. Automated Testing

Test Claude interactions programmatically:

```typescript
// Test that Claude can navigate a codebase
it("should understand project structure", async () => {
  const session = await harness.createSession();

  await session.sendMessage({
    content: "What is the main entry point of this project?",
  });

  const readCalls = session.getToolCalls({ name: "Read" });
  const grepCalls = session.getToolCalls({ name: "Grep" });

  // Verify Claude explored the codebase
  expect(readCalls.length + grepCalls.length).toBeGreaterThan(0);
});
```

### 2. Performance Monitoring

Track Claude performance:

```typescript
const session = await harness.createSession();

await session.sendMessage({
  content: "Analyze all TypeScript files for type errors",
});

const metrics = {
  totalDuration: session.getDuration(),
  toolCalls: session.getToolHistory().length,
  tokensUsed: session.getState().tokenUsage,
  averageToolDuration:
    session.getToolHistory().reduce((sum, t) => sum + t.duration, 0) /
    session.getToolHistory().length,
};

console.log("Performance metrics:", metrics);
```

### 3. Batch Operations

Process multiple files:

```typescript
const files = ["src/App.tsx", "src/utils.ts", "src/types.ts"];

for (const file of files) {
  const session = await harness.createSession();

  await session.sendMessage({
    content: `Add JSDoc comments to ${file}`,
  });

  // Verify changes were made
  const editCalls = session.getToolCalls({ name: "Edit" });
  console.log(`${file}: ${editCalls.length} edits`);

  await session.close();
}
```

### 4. CI/CD Integration

Automate code quality checks:

```typescript
// GitHub Actions example
async function runCodeQualityCheck() {
  const harness = createHarness();
  const session = await harness.createSession();

  const response = await session.sendMessage({
    content: "Check all TypeScript files for unused imports and variables",
  });

  const issues = parseIssues(response.content);

  if (issues.length > 0) {
    console.error("Code quality issues found:", issues);
    process.exit(1);
  }

  console.log("Code quality check passed");
  await session.close();
}
```

## Implementation Status

### ✅ Completed

- Claude Agent SDK integration
- Streaming input architecture
- Session management (basic)

### 🚧 In Progress

- Event streaming API
- Tool monitoring
- Testing utilities

### 📋 Planned

- Batch operations
- Performance monitoring
- Workflow templates
- Documentation and examples

## Contributing

The Harness is under active development. Contributions welcome!

Areas that need help:

1. **API Design** - Review and provide feedback on the API
2. **Testing** - Write integration tests
3. **Documentation** - Improve examples and guides
4. **Use Cases** - Share your automation needs

See [Contributing Guide](/contributing/) for details.

## Next Steps

- [Application Architecture →](/application/) - Understand the underlying system
- [Testing Infrastructure →](/testing/) - Learn about testing approach
- [GitHub Repository](https://github.com/DAOresearch/az-c) - View source code

## Technical Notes

### Why a Harness?

The Claude Agent SDK is designed for interactive use. The Harness adds:

- **Programmatic Control** - API for automation
- **Observability** - Track tool calls and performance
- **Testing Support** - Assert on Claude behavior
- **Workflow Building** - Chain operations together

### Design Goals

1. **Simple API** - Easy to use for common cases
2. **Type Safe** - Full TypeScript support
3. **Async First** - Built on async/await
4. **Observable** - Rich event system
5. **Testable** - Mock-friendly design

### Relationship to SDK

The Harness wraps the Claude Agent SDK:

```
Your Code → Harness → Claude Agent SDK → Claude API
```

Benefits:
- Higher-level abstractions
- Additional features (monitoring, testing)
- Backward compatible with SDK
- Can drop down to SDK when needed
