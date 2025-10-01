# Testing Infrastructure Overview

az-c features a custom testing infrastructure designed specifically for Terminal User Interface (TUI) applications.

## Why Custom Testing?

### The Challenge

Testing TUI applications is fundamentally different from testing web or mobile apps:

1. **Visual Output** - Terminal rendering is visual, not DOM-based
2. **Platform Differences** - Rendering varies across terminals and platforms
3. **Interactive State** - Focus, input, and keyboard interactions
4. **Timing Issues** - Animations, streaming, and async operations

Traditional testing frameworks (Jest, Vitest, etc.) work well for logic but struggle with visual validation.

### Our Solution

We built a complete testing system that:

1. **Captures Screenshots** - Visual snapshots of terminal output
2. **AI Evaluation** - Claude analyzes screenshots against expectations
3. **Confidence Scoring** - Quantitative pass/fail with reasoning
4. **Historical Tracking** - Version control for visual regression
5. **HTML Reports** - Beautiful, browsable test results

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Testing Infrastructure                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Test Definition                                      │
│     ├─ component.setup.ts    (Test scenarios)          │
│     └─ component.spec.tsx    (Component render)        │
│                                                          │
│  2. Screenshot Capture                                   │
│     ├─ Playwright             (Browser automation)      │
│     ├─ node-pty               (PTY management)          │
│     └─ Platform Adapters      (macOS, Linux, Browser)   │
│                                                          │
│  3. AI Evaluation                                        │
│     ├─ Claude API             (Screenshot analysis)     │
│     ├─ Prompt Templates       (Evaluation criteria)     │
│     └─ Confidence Scoring     (Pass/fail decisions)     │
│                                                          │
│  4. Report Generation                                    │
│     ├─ HTML Reports           (Visual test results)     │
│     ├─ JSON Exports           (Programmatic access)     │
│     └─ Historical Tracking    (Versioned runs)          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Testing Workflow

### 1. Define Test Scenarios

Create a `component.setup.ts` file:

```typescript
import type { TestScenario } from "@/testing/types";

export const scenarios: TestScenario[] = [
  {
    name: "default",
    description: "Input field in default state",
    expectation: "Input field with horizontal borders (top/bottom), prompt text visible",
    params: {},
  },
  {
    name: "focused",
    description: "Input field focused with blue border",
    expectation: "Border color changes to blue (#4A90E2), cursor visible",
    params: { focused: true },
  },
];
```

### 2. Create Component Test

Create a `component.spec.tsx` file:

```typescript
import { renderComponent } from "@/testing/capture";
import { InputField } from "./InputField";

export default function render(scenario: TestScenario) {
  return renderComponent(
    <InputField
      placeholder="Type here"
      {...scenario.params}
    />
  );
}
```

### 3. Run Test Pipeline

```bash
# Complete pipeline: capture + evaluate + report
bun run test

# Capture only (skip evaluation)
bun run test:capture

# Evaluate only (skip capture)
bun run test --skip-capture
```

### 4. Review Results

Open `.dev/reports/index.html` to see:

- Pass/fail status for each scenario
- AI confidence scores
- Visual comparisons
- Detailed reasoning
- Historical trends

## Key Components

### Screenshot Capture

**Location:** `src/testing/capture/`

Captures terminal screenshots using:
- **Playwright** - Headless browser for rendering
- **node-pty** - PTY for terminal emulation
- **xterm.js** - Terminal rendering engine

**Adapters:**
- `browser.ts` - Playwright-based (default)
- `macos.ts` - macOS native screenshots (experimental)

### AI Evaluation

**Location:** `src/testing/evaluation/`

Uses Claude to evaluate screenshots:

```typescript
const result = await evaluator.evaluate({
  screenshotPath: "input-field-focused.png",
  expectation: "Border color changes to blue, cursor visible",
  componentName: "InputField",
  scenarioName: "focused",
});

// result.passed: boolean
// result.confidence: number (0-1)
// result.reasoning: string
```

### Report Generation

**Location:** `src/testing/reporting/`

Generates HTML reports with:
- Interactive UI
- Screenshot comparisons
- Confidence scores
- Historical data
- Pass/fail trends

### Test Pipeline

**Location:** `src/testing/pipeline.ts`

Orchestrates the complete workflow:

1. **Phase 1:** Capture screenshots
2. **Phase 2:** Initialize services (Claude API)
3. **Phase 3:** Evaluate all screenshots
4. **Phase 4:** Collect results
5. **Phase 5:** Generate HTML report
6. **Phase 6:** Save outputs (versioned)
7. **Phase 7:** Open report in browser

## Testing Philosophy

### 1. Visual Compliance

Tests validate visual output, not implementation:

```typescript
expectation: "Input field with blue border and cursor"
// NOT: "border color is #4A90E2"
```

### 2. Confidence Scoring

Pass/fail is based on AI confidence:

- **>= 90%** - Pass
- **< 90%** - Fail

This accounts for:
- Terminal rendering differences
- Font variations
- Minor visual differences

### 3. Historical Tracking

Keep versioned test runs:

```bash
.dev/reports/
├── index.html              # Latest report
├── results.json            # Latest results
├── screenshots/            # Latest screenshots
└── runs/
    ├── 20240115-143022/   # Timestamped run
    └── before-refactor/   # Named run
```

### 4. Maintainability

Tests should be:
- **Fast** - Capture + evaluate in seconds
- **Reliable** - Consistent results
- **Readable** - Clear expectations
- **Maintainable** - Easy to update

## Benefits

### For Developers

- **Visual Regression** - Catch UI breaks early
- **Documentation** - Screenshots document behavior
- **Confidence** - AI validates expectations
- **Fast Feedback** - Quick local testing

### For Teams

- **CI Integration** - Automated in GitHub Actions
- **Historical Data** - Track quality over time
- **Shared Understanding** - Visual specs
- **Quality Gates** - Block bad PRs

### For Projects

- **Living Documentation** - Tests show expected behavior
- **Refactoring Safety** - Validate visual consistency
- **Design System** - Enforce visual standards
- **Accessibility** - Validate text contrast, layout

## Comparison with Traditional Testing

| Aspect | Traditional Testing | az-c Testing |
|--------|-------------------|--------------|
| **Visual Validation** | ❌ Manual | ✅ Automated |
| **Terminal Support** | ❌ Limited | ✅ Purpose-built |
| **Pass/Fail** | ✅ Binary | ✅ Confidence score |
| **Reports** | ⚠️ Text logs | ✅ Visual HTML |
| **Historical Tracking** | ❌ None | ✅ Versioned |
| **AI Evaluation** | ❌ None | ✅ Claude analysis |

## Next Steps

- **[Custom Vitest Setup](./vitest-setup)** - How it works (PLANNED)
- **[Writing Tests](./writing-tests)** - Create your own tests
- **[Screenshot Testing](./screenshot-testing)** - Capture details
- **[AI Evaluation](./ai-evaluation)** - How Claude evaluates

---

Ready to write tests? Continue to **[Writing Tests](./writing-tests)**.
