# Writing Tests

Learn how to write comprehensive tests for TUI components using az-c's testing infrastructure.

## Test Structure

Each component test consists of three files:

```
src/components/{component}/
├── {component}.tsx           # Component implementation
├── {component}.setup.ts      # Test scenarios
└── {component}.spec.tsx      # Test expectations
```

## Step-by-Step Guide

### 1. Create Component

First, implement your component following the design system:

```typescript
// src/components/my-widget/my-widget.tsx
import { Box, Text } from "@opentui/react";
import type { FC } from "react";

type MyWidgetProps = {
  title: string;
  status: "idle" | "loading" | "error";
};

export const MyWidget: FC<MyWidgetProps> = ({ title, status }) => {
  return (
    <Box flexDirection="column" gap={1}>
      <Text color="#FFFFFF">{title}</Text>
      <Text color={getStatusColor(status)}>
        {getStatusText(status)}
      </Text>
    </Box>
  );
};

function getStatusColor(status: MyWidgetProps["status"]): string {
  switch (status) {
    case "loading":
      return "#4A90E2";
    case "error":
      return "#E74C3C";
    default:
      return "#50C878";
  }
}

function getStatusText(status: MyWidgetProps["status"]): string {
  switch (status) {
    case "loading":
      return "Loading...";
    case "error":
      return "Error occurred";
    default:
      return "Ready";
  }
}
```

### 2. Define Test Scenarios

Create a setup file with test scenarios:

```typescript
// src/components/my-widget/my-widget.setup.ts
import type { TestScenario } from "../../testing/types";

export const scenarios: TestScenario[] = [
  {
    name: "idle-state",
    description: "Widget in idle state",
    component: "MyWidget",
    props: {
      title: "My Widget",
      status: "idle",
    },
  },
  {
    name: "loading-state",
    description: "Widget while loading",
    component: "MyWidget",
    props: {
      title: "My Widget",
      status: "loading",
    },
  },
  {
    name: "error-state",
    description: "Widget showing error",
    component: "MyWidget",
    props: {
      title: "My Widget",
      status: "error",
    },
  },
];
```

### 3. Write Test Expectations

Create a spec file with expectations:

```typescript
// src/components/my-widget/my-widget.spec.tsx
import { describe, it } from "bun:test";
import { renderComponent } from "../../testing/capture";
import { scenarios } from "./my-widget.setup";

describe("MyWidget", () => {
  for (const scenario of scenarios) {
    it(scenario.name, async () => {
      await renderComponent({
        ...scenario,
        expectation: getExpectation(scenario.name),
      });
    });
  }
});

function getExpectation(name: string): string {
  const expectations: Record<string, string> = {
    "idle-state":
      "Widget displaying 'My Widget' title in white, with 'Ready' status in green (#50C878)",
    "loading-state":
      "Widget displaying 'My Widget' title in white, with 'Loading...' status in blue (#4A90E2)",
    "error-state":
      "Widget displaying 'My Widget' title in white, with 'Error occurred' status in red (#E74C3C)",
  };
  return expectations[name] || "";
}
```

### 4. Run Tests

Capture screenshots and evaluate:

```bash
# Full test run
bun run test

# Or just your component
bun run test:capture --pattern src/components/my-widget/my-widget.setup.ts
```

### 5. Review Results

Check the HTML report:

```bash
open .dev/reports/my-widget-report.html
```

Look for:
- ✅ Confidence scores above 85%
- ✅ AI reasoning matches expectations
- ✅ Screenshots show correct visual state

## Writing Good Expectations

### Be Specific

Include details about:
- **Colors** - Use hex codes from design system
- **Text Content** - What text should appear
- **Layout** - Positioning and spacing
- **States** - Visual indicators of state

```typescript
// ✅ Good - Specific and measurable
"Input field with horizontal borders (top: #4A90E2, bottom: #4A90E2),
 displaying placeholder '> Type here' in muted color (#999999),
 cursor visible at end of text"

// ❌ Too vague
"Input field looks focused"
```

### Reference Design System

Link expectations to design system tokens:

```typescript
"Status text in color.text.success (#50C878) when status is 'ready'"
```

### Cover Edge Cases

Test boundary conditions:

```typescript
scenarios: [
  { name: "empty-input", props: { value: "" } },
  { name: "long-input", props: { value: "x".repeat(100) } },
  { name: "unicode-input", props: { value: "🎨✨🚀" } },
]
```

## Testing Component States

### Interactive States

Test all interaction states:

```typescript
scenarios: [
  { name: "idle", props: { disabled: false, focused: false } },
  { name: "focused", props: { disabled: false, focused: true } },
  { name: "disabled", props: { disabled: true, focused: false } },
  { name: "hover", props: { disabled: false, hovered: true } },
]
```

### Loading States

Use delays for loading animations:

```typescript
scenarios: [
  {
    name: "loading-initial",
    description: "Loading spinner just started",
    component: "LoadingWidget",
    props: { loading: true },
    delay: 0, // Capture immediately
  },
  {
    name: "loading-animated",
    description: "Loading spinner mid-animation",
    component: "LoadingWidget",
    props: { loading: true },
    delay: 500, // Capture after animation starts
  },
];
```

Then run with delay:

```bash
SCREENSHOT_DELAY=1000 bun run test:capture
```

### Error States

Test error display:

```typescript
scenarios: [
  {
    name: "error-validation",
    props: {
      error: "Invalid input",
      errorType: "validation",
    },
  },
  {
    name: "error-network",
    props: {
      error: "Connection failed",
      errorType: "network",
    },
  },
];
```

## Testing Complex Components

### Multi-part Components

Break down into focused scenarios:

```typescript
// Test MessageView component
scenarios: [
  {
    name: "empty-messages",
    description: "No messages in list",
    props: { messages: [] },
  },
  {
    name: "single-message",
    description: "One message displayed",
    props: {
      messages: [{ role: "user", content: "Hello" }],
    },
  },
  {
    name: "multiple-messages",
    description: "Conversation with multiple messages",
    props: {
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "How are you?" },
      ],
    },
  },
  {
    name: "scrollable-messages",
    description: "Many messages requiring scroll",
    props: {
      messages: Array.from({ length: 50 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i + 1}`,
      })),
    },
  },
];
```

### Components with Children

Test with various child content:

```typescript
scenarios: [
  {
    name: "with-text-child",
    props: {
      children: <Text>Simple text content</Text>,
    },
  },
  {
    name: "with-complex-children",
    props: {
      children: (
        <Box flexDirection="column">
          <Text>Title</Text>
          <Text color="#999999">Subtitle</Text>
        </Box>
      ),
    },
  },
];
```

## Testing Layouts

### Responsive Layouts

Test different widths:

```typescript
scenarios: [
  {
    name: "narrow-width",
    props: { width: 40 },
  },
  {
    name: "standard-width",
    props: { width: 80 },
  },
  {
    name: "wide-width",
    props: { width: 120 },
  },
];
```

### Alignment and Spacing

Verify spacing tokens:

```typescript
expectation: "Box with 2-cell gap between items (space.2),
              4-cell padding around content (space.4)"
```

## Debugging Tests

### Enable Debug Mode

```bash
DEBUG=1 bun run test
```

### Check Screenshots

View captured screenshots manually:

```bash
open .dev/screenshots/my-widget/
```

### Read AI Reasoning

The HTML report includes full AI reasoning:

```html
<!-- In report -->
<div class="reasoning">
  The screenshot shows the widget with:
  - Title "My Widget" in white (#FFFFFF) ✓
  - Status "Ready" in green, but the color appears slightly darker than expected #50C878
  - Overall layout matches expectation

  Confidence: 88% (good match with minor color variance)
</div>
```

### Adjust Expectations

If scores are low but screenshots look correct, adjust expectations:

```typescript
// Old expectation
"Status text in bright green (#50C878)"

// Adjusted after seeing actual rendering
"Status text in green color (approximately #50C878, terminal rendering may vary slightly)"
```

## Example: Complete Test

Here's a complete example testing an AgentSpinner component:

```typescript
// agent-spinner.setup.ts
import type { TestScenario } from "../../testing/types";

export const scenarios: TestScenario[] = [
  {
    name: "thinking-state",
    description: "Spinner in thinking state",
    component: "AgentSpinner",
    props: {
      state: "thinking",
      message: "Analyzing code...",
    },
  },
  {
    name: "levitating-state",
    description: "Spinner in levitating state with metadata",
    component: "AgentSpinner",
    props: {
      state: "levitating",
      message: "Running tests...",
      metadata: {
        elapsed: 45,
        tokens: 6700,
      },
    },
  },
];
```

```typescript
// agent-spinner.spec.tsx
import { describe, it } from "bun:test";
import { renderComponent } from "../../testing/capture";
import { scenarios } from "./agent-spinner.setup";

describe("AgentSpinner", () => {
  for (const scenario of scenarios) {
    it(scenario.name, async () => {
      await renderComponent({
        ...scenario,
        expectation: getExpectation(scenario.name),
      });
    });
  }
});

function getExpectation(name: string): string {
  switch (name) {
    case "thinking-state":
      return `Spinner showing ∴ symbol in orange (#E07A5F),
              followed by "Thinking…" text,
              with message "Analyzing code..." below in white`;
    case "levitating-state":
      return `Spinner showing ∴ symbol in orange (#E07A5F),
              followed by "Levitating…" text,
              with metadata "(esc to interrupt · 45s · ↓ 6.7k tokens)" in muted color (#999999),
              and message "Running tests..." below`;
    default:
      return "";
  }
}
```

Run the test:

```bash
SCREENSHOT_DELAY=2000 bun run test:capture --pattern src/components/agent-spinner/agent-spinner.setup.ts
```

## Best Practices Summary

1. **Test all states** - Idle, focused, disabled, loading, error
2. **Be specific** - Include colors, text, layout details
3. **Reference design system** - Use documented tokens
4. **Use delays** - For animations and loading states
5. **Check reports** - Read AI reasoning, not just scores
6. **Update baselines** - When designs intentionally change
7. **Cover edge cases** - Empty, long, unicode content
8. **Keep focused** - One scenario per state/variation

## Next Steps

- [Testing Infrastructure →](/testing/) - Understand the architecture
- [Design System →](/application/design-system) - Component specifications
- [Contributing →](/contributing/) - Contribute tests to the project
