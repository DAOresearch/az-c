# Configuration

Learn how to customize az-c for your workflow.

## Environment Variables

### Required

#### `ANTHROPIC_API_KEY`

Your Claude API key from [Anthropic Console](https://console.anthropic.com/).

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

## SDK Configuration

The app is configured in `src/index.tsx` with these defaults:

```typescript
import { createAgent } from "@anthropic-ai/claude-agent-sdk";

const agent = createAgent({
  permissionMode: "bypassPermissions",
  systemPrompt: {
    type: "preset",
    preset: "claude_code",
  },
  // Additional options...
});
```

### Permission Mode

Controls how tool permissions are handled:

- `"bypassPermissions"` - No permission prompts (default)
- `"ask"` - Prompt for each tool use
- `"strict"` - Require explicit approval

To change:

```typescript
const agent = createAgent({
  permissionMode: "ask", // Change here
  // ...
});
```

### System Prompt

The system prompt defines Claude's behavior:

```typescript
systemPrompt: {
  type: "preset",
  preset: "claude_code",  // Use Claude Code preset
}
```

Or use a custom prompt:

```typescript
systemPrompt: {
  type: "custom",
  content: "You are a helpful assistant...",
}
```

## Testing Configuration

Configure testing behavior with environment variables:

### `SCREENSHOT_DELAY`

Delay (in milliseconds) before capturing screenshots:

```bash
SCREENSHOT_DELAY=5000 bun run test:capture
```

Useful for components with animations or loading states.

## Runtime Scripts

The project includes these npm scripts:

### Development

```bash
# Start with auto-reload
bun run dev
```

### Testing

```bash
# Run full test suite (capture + evaluate)
bun run test

# Capture screenshots only
bun run test:capture

# Evaluate existing screenshots
bun run test:evaluate

# Test specific component
SCREENSHOT_DELAY=5000 bun run test:capture:spinner
```

### Linting & Type Checking

```bash
# Format and lint
bun run lint

# Type check
bun run typecheck

# Both lint and type check
bun run check
```

### Documentation

```bash
# Serve docs locally
bun run docs:dev

# Build docs
bun run docs:build

# Preview built docs
bun run docs:preview
```

### Cleanup

```bash
# Clean development cache
bun run clean:dev

# Clean test artifacts
bun run clean:test
```

## Component Customization

All components use the design system from `docs/application/design-system.md`.

### Color Tokens

Defined in the design system:

```typescript
const colors = {
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

### Spacing Scale

Terminal cell-based spacing:

```typescript
const spacing = {
  0: 0, // Tight alignment
  1: 1, // Default gap
  2: 2, // Standard padding
  3: 3, // Input field spacing
  4: 4, // Section separators
};
```

See [Design System →](/application/design-system) for complete specifications.

## Advanced Configuration

### Custom Components

To add custom components:

1. Create component in `src/components/`
2. Follow design system guidelines
3. Add tests in `component.spec.tsx`
4. Update design system docs

### Custom Tools

To add custom Claude Code tools:

1. Define tool schema
2. Implement tool handler
3. Register with SDK
4. Test with harness

See [Harness Documentation →](/harness/) for programmatic tool testing.

## Next Steps

- [Application Architecture →](/application/) - Understand the codebase
- [Testing Infrastructure →](/testing/) - Learn the testing approach
- [Design System →](/application/design-system) - Component specifications
