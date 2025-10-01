# Claude Code Harness

The Claude Code Harness is a programmatic API for automating Claude Code interactions.

## What is the Harness?

The harness provides a programmatic interface to Claude Code, enabling:

- **Automated Testing** - Test agent interactions programmatically
- **Workflow Automation** - Build complex multi-step workflows
- **Integration Testing** - Test real agent behavior with Claude API
- **Batch Operations** - Process multiple tasks automatically

## Why a Harness?

### Manual vs Programmatic

**Manual Interaction:**
```
User: Read package.json
Claude: [Reads file, displays content]
User: Update version to 2.0.0
Claude: [Edits file]
```

**Programmatic Interaction:**
```typescript
const harness = new ClaudeHarness();

await harness.send("Read package.json");
await harness.expectTool("Read", { file_path: "package.json" });

await harness.send("Update version to 2.0.0");
await harness.expectTool("Edit", { file_path: "package.json" });
await harness.expectResponse(/version.*2\.0\.0/);
```

### Use Cases

1. **Integration Testing**
   - Test complete user workflows
   - Validate tool interactions
   - Ensure consistent behavior

2. **Workflow Automation**
   - Batch file operations
   - Automated refactoring
   - Documentation generation

3. **Quality Assurance**
   - Regression testing
   - Performance benchmarks
   - Consistency checks

4. **Research & Development**
   - Experiment with prompts
   - A/B testing strategies
   - Collect interaction data

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Claude Code Harness                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ClaudeHarness (Main API)                               │
│  ├─ send(message)          Send user messages          │
│  ├─ expectTool(name)       Assert tool usage           │
│  ├─ expectResponse(text)   Assert response content     │
│  └─ getHistory()           Get conversation history    │
│                                                          │
│  SessionManager                                          │
│  ├─ create()               Start new session           │
│  ├─ resume(id)             Resume existing session     │
│  └─ destroy(id)            End session                 │
│                                                          │
│  WorkflowRunner                                          │
│  ├─ loadWorkflow(yaml)     Load workflow definition    │
│  ├─ execute()              Run workflow steps          │
│  └─ validate()             Check workflow results      │
│                                                          │
│  Integration with AgentService                          │
│  └─ Uses Claude Agent SDK under the hood               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Current Status

::: warning PLANNED FEATURE
The harness is currently in **planning phase**. The testing infrastructure (screenshot testing, AI evaluation) demonstrates the foundation for programmatic control.

**Available Now:**
- AgentService (src/services/AgentService.ts)
- Streaming input hooks
- Message processing

**Coming Soon:**
- ClaudeHarness API
- Workflow definitions
- Integration test examples
:::

## Planned API

### Basic Usage

```typescript
import { ClaudeHarness } from "@/harness";

// Create harness instance
const harness = new ClaudeHarness({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Send message and wait for response
const response = await harness.send("Hello, Claude!");
console.log(response.text);

// Check tool usage
const toolCalls = harness.getToolCalls();
console.log(toolCalls); // Array of tool calls
```

### Assertions

```typescript
// Expect specific tool usage
await harness.send("Read package.json");
await harness.expectTool("Read", {
  file_path: "package.json",
});

// Expect response content
await harness.send("What is the version?");
await harness.expectResponse(/version.*\d+\.\d+\.\d+/);

// Expect multiple tools
await harness.send("Update all dependencies");
await harness.expectTools([
  { name: "Read", params: { file_path: "package.json" } },
  { name: "Edit", params: { file_path: "package.json" } },
]);
```

### Workflow Automation

```typescript
// Define workflow
const workflow = {
  name: "Update Dependencies",
  steps: [
    {
      action: "send",
      message: "Read package.json",
      expect: {
        tool: "Read",
        params: { file_path: "package.json" },
      },
    },
    {
      action: "send",
      message: "Update all dependencies to latest",
      expect: {
        tools: ["Read", "Edit"],
      },
    },
    {
      action: "send",
      message: "Run tests",
      expect: {
        tool: "Bash",
        params: { command: /bun (run )?test/ },
      },
    },
  ],
};

// Execute workflow
const result = await harness.executeWorkflow(workflow);
console.log(result.success); // true/false
console.log(result.steps);   // Step results
```

### Session Management

```typescript
// Create new session
const session = await harness.createSession();

// Send messages in session
await session.send("Read package.json");
await session.send("What's the version?");

// Get session history
const history = session.getHistory();

// Resume session later
const resumed = await harness.resumeSession(session.id);

// Clean up
await session.destroy();
```

## Integration with Testing

The harness will integrate with the testing infrastructure:

```typescript
describe("Agent Workflows", () => {
  it("should read and update files", async () => {
    const harness = new ClaudeHarness();

    // Test workflow
    await harness.send("Read package.json");
    expect(harness.getToolCalls()).toContainTool("Read");

    await harness.send("Update version to 2.0.0");
    expect(harness.getToolCalls()).toContainTool("Edit");

    // Verify changes
    const pkg = JSON.parse(await fs.readFile("package.json", "utf-8"));
    expect(pkg.version).toBe("2.0.0");
  });
});
```

## Example: Integration Test

```typescript
import { ClaudeHarness } from "@/harness";

describe("Code Review Workflow", () => {
  let harness: ClaudeHarness;

  beforeEach(() => {
    harness = new ClaudeHarness();
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  it("reviews pull request", async () => {
    // Step 1: Ask Claude to review PR
    await harness.send("Review pull request #42");

    // Step 2: Verify tool usage
    await harness.expectTool("Bash", {
      command: /gh pr view 42/,
    });

    // Step 3: Verify response
    const response = await harness.getLastResponse();
    expect(response.text).toMatch(/review|feedback|suggestion/i);

    // Step 4: Check tool sequence
    const tools = harness.getToolCalls();
    expect(tools).toHaveLength(3); // gh pr view, read files, comment
  });
});
```

## Comparison with Manual Testing

| Aspect | Manual Testing | Harness Testing |
|--------|---------------|-----------------|
| **Speed** | Slow (human interaction) | Fast (automated) |
| **Consistency** | Varies | Deterministic |
| **Coverage** | Limited | Comprehensive |
| **Regression** | Manual re-testing | Automated |
| **Documentation** | Separate docs | Tests as docs |

## Building on AgentService

The harness will extend the existing `AgentService`:

```typescript
// Current: AgentService
const service = new AgentService({
  permissionMode: "bypassPermissions",
  systemPrompt: { type: "preset", preset: "claude_code" },
});

// Future: ClaudeHarness (wraps AgentService)
const harness = new ClaudeHarness({
  service: new AgentService({
    permissionMode: "bypassPermissions",
    systemPrompt: { type: "preset", preset: "claude_code" },
  }),
});
```

## Roadmap

### Phase 1: Core API (Current Sprint)
- [ ] ClaudeHarness class
- [ ] Basic send/receive
- [ ] Tool call assertions
- [ ] Response validation

### Phase 2: Session Management
- [ ] SessionManager
- [ ] Create/resume/destroy
- [ ] History tracking
- [ ] State persistence

### Phase 3: Workflow Engine
- [ ] WorkflowRunner
- [ ] YAML/JSON definitions
- [ ] Step execution
- [ ] Error handling

### Phase 4: Integration
- [ ] Test framework integration
- [ ] CI/CD automation
- [ ] Example workflows
- [ ] Documentation

## Contributing

Interested in building the harness? See:

- **[Architecture Discussion](https://github.com/DAOresearch/az-c/discussions)** - Design proposals
- **[Contributing Guide](/contributing/)** - Development setup
- **[API Reference](/api/)** - Type definitions

## Next Steps

- **[Usage & Examples](./usage)** - Code examples (coming soon)
- **[Programmatic Interactions](./programmatic)** - API details (coming soon)
- **[Testing Guide](/testing/)** - Integration with tests

---

Want to contribute to the harness? Join the discussion on [GitHub](https://github.com/DAOresearch/az-c/discussions).
