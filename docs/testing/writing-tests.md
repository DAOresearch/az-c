# Writing Tests

Learn how to write visual tests for TUI components in az-c.

## Test Structure

Every component test consists of two files:

1. **`component.setup.ts`** - Test scenarios and expectations
2. **`component.spec.tsx`** - Component rendering logic

## Step 1: Define Test Scenarios

Create `component.setup.ts`:

```typescript
import type { TestScenario } from "@/testing/types";

export const scenarios: TestScenario[] = [
  {
    name: "default",
    description: "Component in default state",
    expectation: "What you expect to see in the screenshot",
    params: {},
  },
  {
    name: "with-props",
    description: "Component with specific props",
    expectation: "Expected visual output",
    params: {
      prop1: "value1",
      prop2: true,
    },
  },
];
```

### Scenario Properties

- **name**: Unique identifier for the scenario
- **description**: Human-readable description
- **expectation**: What the AI should validate
- **params**: Props to pass to the component

### Writing Good Expectations

**✅ Good expectations:**

```typescript
expectation: "Input field with horizontal borders (top/bottom), blue focus border, cursor visible"
expectation: "Spinner with orange color (#E07A5F), 'Levitating…' text, metadata showing elapsed time"
expectation: "Todo list with tree structure, checkboxes, completed items with strikethrough"
```

**❌ Bad expectations:**

```typescript
expectation: "Component renders"  // Too vague
expectation: "Looks correct"      // Not specific
expectation: "border: 1px solid #4A90E2"  // Too implementation-focused
```

**Guidelines:**
- Describe visual appearance, not implementation
- Include colors (hex codes) for validation
- Mention key structural elements (borders, text, icons)
- Specify expected text content
- Note interactive states (focused, disabled, etc.)

## Step 2: Create Component Spec

Create `component.spec.tsx`:

```typescript
import { renderComponent } from "@/testing/capture";
import type { TestScenario } from "@/testing/types";
import { YourComponent } from "./YourComponent";

export default function render(scenario: TestScenario) {
  return renderComponent(
    <YourComponent {...scenario.params} />
  );
}
```

### The `renderComponent` Function

`renderComponent` handles:
- Terminal setup (size, PTY)
- React rendering
- Waiting for stability
- Screenshot capture

**Options:**

```typescript
renderComponent(
  <YourComponent />,
  {
    width: 80,        // Terminal width in columns
    height: 24,       // Terminal height in rows
    delay: 1000,      // Wait time before capture (ms)
  }
);
```

## Step 3: Run Tests

```bash
# Run complete pipeline
bun run test

# Capture only (fast iteration)
bun run test:capture

# Evaluate existing screenshots
bun run test --skip-capture
```

## Example: InputField Test

### setup.ts

```typescript
import type { TestScenario } from "@/testing/types";

export const scenarios: TestScenario[] = [
  {
    name: "idle",
    description: "Input field in idle state",
    expectation: "Input field with horizontal borders only (top and bottom), no side borders. Shows '> Type here' prompt.",
    params: {
      placeholder: "Type here",
    },
  },
  {
    name: "focused",
    description: "Input field focused with blue border",
    expectation: "Input field with horizontal borders only (top and bottom), border color is blue (#4A90E2), cursor visible after prompt.",
    params: {
      placeholder: "Type here",
      autoFocus: true,
    },
  },
  {
    name: "disabled",
    description: "Input field disabled",
    expectation: "Input field with gray borders (#666666), 'x' prefix instead of '>', disabled visual state.",
    params: {
      placeholder: "Processing...",
      disabled: true,
    },
  },
];
```

### spec.tsx

```typescript
import { renderComponent } from "@/testing/capture";
import type { TestScenario } from "@/testing/types";
import { InputField } from "./InputField";

export default function render(scenario: TestScenario) {
  return renderComponent(
    <InputField
      onSubmit={() => {}}
      {...scenario.params}
    />
  );
}
```

## Example: AgentSpinner Test

### setup.ts

```typescript
import type { TestScenario } from "@/testing/types";

export const scenarios: TestScenario[] = [
  {
    name: "thinking",
    description: "Simple thinking state",
    expectation: "Spinner icon '∴' in orange color (#E07A5F), followed by 'Thinking…' text",
    params: {
      state: "thinking",
    },
  },
  {
    name: "levitating",
    description: "Levitating with metadata",
    expectation: "Spinner icon '∴' in orange (#E07A5F), 'Levitating…' text, metadata in gray showing '(esc to interrupt · 130s · ↓ 6.7k tokens)'",
    params: {
      state: "levitating",
      metadata: {
        elapsed: 130,
        tokens: 6700,
      },
    },
  },
];
```

## Advanced Patterns

### Testing Animations

For animated components, increase delay:

```bash
SCREENSHOT_DELAY=5000 bun run test:capture
```

Or in code:

```typescript
renderComponent(<Spinner />, {
  delay: 5000,  // Wait 5 seconds
});
```

### Testing Interactive State

Simulate user interactions:

```typescript
import { simulateKeypress } from "@/testing/capture";

export default async function render(scenario: TestScenario) {
  const { container } = renderComponent(<InputField />);

  // Simulate user typing
  await simulateKeypress(container, "H");
  await simulateKeypress(container, "i");

  return container;
}
```

### Testing with Context

Provide context for components:

```typescript
import { TestProvider } from "@/testing/providers";

export default function render(scenario: TestScenario) {
  return renderComponent(
    <TestProvider>
      <YourComponent {...scenario.params} />
    </TestProvider>
  );
}
```

### Multiple Components

Test component compositions:

```typescript
export default function render(scenario: TestScenario) {
  return renderComponent(
    <Box flexDirection="column">
      <Header />
      <YourComponent {...scenario.params} />
      <Footer />
    </Box>
  );
}
```

## Test Organization

Organize tests by component:

```
src/components/
├── ui/
│   ├── InputField/
│   │   ├── InputField.tsx
│   │   ├── InputField.setup.ts       # Test scenarios
│   │   └── InputField.spec.tsx       # Test spec
│   └── Button/
│       ├── Button.tsx
│       ├── Button.setup.ts
│       └── Button.spec.tsx
└── agent-spinner/
    ├── index.tsx
    ├── agent-spinner.setup.ts
    └── agent-spinner.spec.tsx
```

## Running Specific Tests

```bash
# Run tests for specific pattern
bun src/testing/capture/runner.ts --pattern "src/components/ui/InputField.setup.ts"

# Run all UI component tests
bun src/testing/capture/runner.ts --pattern "src/components/ui/**/*.setup.ts"
```

## Debugging Tests

### View Screenshots

Screenshots are saved to `.dev/reports/screenshots/`:

```
.dev/reports/screenshots/
├── InputField-idle.png
├── InputField-focused.png
└── InputField-disabled.png
```

### Check Evaluation Results

Open `.dev/reports/index.html` to see:
- Screenshot with annotations
- AI confidence score
- Pass/fail reasoning
- Expected vs actual

### Enable Debug Logging

```bash
DEBUG=1 bun run test
```

## Best Practices

### 1. Test Visual States

Cover all visual states:
- Default
- Focused
- Disabled
- Loading
- Error
- Success

### 2. Clear Expectations

Write specific expectations:

```typescript
// ✅ Good
expectation: "Border changes from gray (#3A3D45) to blue (#4A90E2), cursor appears after text"

// ❌ Too vague
expectation: "Component looks focused"
```

### 3. Realistic Scenarios

Use realistic data:

```typescript
// ✅ Good
params: {
  message: "Hello! Can you help me with this code?",
  timestamp: Date.now(),
}

// ❌ Unrealistic
params: {
  message: "test",
}
```

### 4. Test Edge Cases

Include boundary conditions:

```typescript
scenarios: [
  { name: "empty", params: { value: "" } },
  { name: "long-text", params: { value: "Very long text that might wrap..." } },
  { name: "special-chars", params: { value: "→ ✓ ● ├─" } },
]
```

### 5. Keep Tests Fast

- Minimize delay times
- Use `--skip-capture` during iteration
- Run specific tests during development

## Troubleshooting

### Screenshots Not Capturing

1. Check that component renders
2. Verify setup file exports `scenarios`
3. Ensure spec file has `default export`
4. Check `.dev/reports/screenshots/` exists

### Tests Failing Unexpectedly

1. Review screenshot in `.dev/reports/`
2. Check expectation specificity
3. Verify component props
4. Increase delay for animations

### Low Confidence Scores

1. Make expectations more specific
2. Check screenshot quality
3. Verify colors match design system
4. Review AI reasoning in report

## Next Steps

- **[Screenshot Testing](./screenshot-testing)** - Capture mechanics
- **[AI Evaluation](./ai-evaluation)** - How Claude evaluates
- **[Design System](/application/design-system)** - Visual specifications

---

Ready to understand screenshot capture? Continue to **[Screenshot Testing](./screenshot-testing)**.
