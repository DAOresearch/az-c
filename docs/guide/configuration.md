# Configuration

Learn how to configure az-c for your needs.

## Environment Variables

### ANTHROPIC_API_KEY

**Required**: Yes
**Type**: String

Your Anthropic API key for accessing Claude.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or in `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### SCREENSHOT_DELAY

**Required**: No
**Type**: Number (milliseconds)
**Default**: 1000

Delay before capturing screenshots in tests. Useful for components with animations.

```bash
export SCREENSHOT_DELAY=5000  # Wait 5 seconds before capture
```

## SDK Configuration

The Claude Agent SDK is configured in `src/App.tsx`:

```typescript
const agentService = new AgentService({
  permissionMode: "bypassPermissions",  // No permission prompts
  systemPrompt: {
    type: "preset",
    preset: "claude_code"               // Use Claude Code system prompt
  }
});
```

### Permission Mode

Controls how Claude handles tool permissions:

- `"bypassPermissions"` - No prompts, all tools allowed (current default)
- `"requestPermissions"` - Prompt user for each tool use
- `"denyAll"` - Block all tool usage

Example:

```typescript
const agentService = new AgentService({
  permissionMode: "requestPermissions",  // Prompt for permissions
});
```

### System Prompt

Configure Claude's behavior:

**Preset (recommended):**
```typescript
systemPrompt: {
  type: "preset",
  preset: "claude_code"  // Use built-in Claude Code prompt
}
```

**Custom:**
```typescript
systemPrompt: {
  type: "custom",
  text: "You are a helpful coding assistant..."
}
```

## Testing Configuration

### Test Pipeline

Configure the test pipeline in `src/testing/pipeline.ts`:

```typescript
export type PipelineConfig = {
  screenshotDir?: string;           // Where screenshots are stored
  outputDir?: string;                // Where reports are generated
  evaluationCriteria?: {
    strictness: "strict" | "moderate" | "lenient";
    checkTextContent: boolean;
    checkLayout: boolean;
    checkColors: boolean;
  };
  skipScreenshots?: boolean;         // Use existing screenshots
  keepHistory?: number;              // Number of test runs to keep
  runName?: string;                  // Named run (preserved)
};
```

### CLI Options

```bash
# Strict evaluation (checks text, layout, colors)
bun run test --strict

# Moderate evaluation (checks text, layout only)
bun run test --moderate

# Lenient evaluation (checks text only)
bun run test --lenient

# Custom output directory
bun run test --output ./my-reports

# Named run (preserved indefinitely)
bun run test --run-name "before-refactor"

# Keep 20 runs instead of default 10
bun run test --keep-history 20
```

## Component Configuration

### Design Tokens

Colors and styles are defined in `docs/application/design-system.md`:

```typescript
export const COLORS = {
  bg: {
    primary: "#0F1115",
    surface: "#1A1D23",
  },
  border: {
    focus: "#4A90E2",
    muted: "#3A3D45",
  },
  text: {
    primary: "#FFFFFF",
    muted: "#999999",
    success: "#50C878",
    error: "#E74C3C",
  },
};
```

To customize, create a `theme.ts` file and import it in your components.

### Component Props

Most components accept standard configuration props:

```typescript
<InputField
  placeholder="Type here..."
  onSubmit={handleSubmit}
  disabled={isLoading}
/>

<AgentSpinner
  state="levitating"
  metadata={{
    elapsed: 130,
    tokens: 6700,
  }}
/>
```

## Slash Commands

Slash commands are configured in `.claude/commands/`:

```
.claude/commands/
├── prd.md                 # PRD generation
├── tdd-component.md       # TDD workflow
├── review-pr.md           # PR review
└── label-issue.md         # Issue labeling
```

Each command is a markdown file with:
- Trigger pattern (e.g., `/prd`, `/tdd-component`)
- Prompt template
- Configuration options

### Creating Custom Commands

1. Create a new `.md` file in `.claude/commands/`
2. Define the command trigger
3. Write the prompt template
4. Document usage in `docs/commands/`

Example `custom-command.md`:

```markdown
# /custom-command

Custom command description and usage.

## Usage

/custom-command <argument>

## Prompt

[Your prompt template here]
```

## Advanced Configuration

### Custom Agent Service

Extend `AgentService` for custom behavior:

```typescript
class CustomAgentService extends AgentService {
  constructor(options) {
    super({
      ...options,
      // Custom configuration
    });
  }

  // Override methods
  async processMessage(message) {
    // Custom processing
    return super.processMessage(message);
  }
}
```

### Custom Testing Adapters

Create custom screenshot adapters in `src/testing/capture/adapters/`:

```typescript
export type ScreenshotAdapter = {
  name: string;
  capture: (options: CaptureOptions) => Promise<Buffer>;
  cleanup?: () => Promise<void>;
};
```

See **[Testing Infrastructure](/testing/)** for details.

## Next Steps

- **[Application Guide](/application/)** - Understand the architecture
- **[Component Development](/application/components)** - Build components
- **[Testing Infrastructure](/testing/)** - Configure testing
