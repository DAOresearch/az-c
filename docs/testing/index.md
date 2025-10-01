# Testing Infrastructure

az-c includes a comprehensive testing infrastructure designed specifically for terminal user interface (TUI) applications.

## Why Custom Testing?

TUI applications present unique testing challenges:

### Traditional Approaches Fall Short

- **Unit Tests** - Can't validate visual output or terminal rendering
- **Integration Tests** - Don't capture what users actually see
- **Manual Testing** - Time-consuming, inconsistent, not repeatable
- **Snapshot Tests** - Text-based snapshots don't capture visual appearance

### Our Solution

az-c uses **screenshot-based testing with AI evaluation**:

1. **Capture** - Take screenshots of terminal output using Playwright
2. **Evaluate** - Use Claude Vision to analyze against expectations
3. **Report** - Generate comprehensive HTML reports with confidence scores
4. **Track** - Compare results across test runs

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Test Pipeline                         │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Screenshot  │  │      AI      │  │   Report     │
│   Capture    │─▶│  Evaluation  │─▶│  Generation  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
  .dev/screenshots   Confidence Score   .dev/reports
    (PNG files)      (0-100 with        (HTML + JSON)
                      reasoning)
```

### 1. Screenshot Capture

**Location**: `src/testing/capture/`

Uses Playwright to capture terminal screenshots:

- **Terminal Emulation** - Runs components in real terminal environment
- **Browser Capture** - Playwright captures visual output
- **Component Setup** - Each component defines test scenarios

**Key Files:**
- `capture/runner.ts` - Main capture orchestrator
- `capture/terminal.ts` - Terminal session management
- `capture/adapters/browser.ts` - Playwright integration

**Process:**
1. Load component setup file (`component.setup.ts`)
2. Render component in terminal emulator
3. Wait for specified delay (animations, loading states)
4. Capture screenshot with Playwright
5. Save to `.dev/screenshots/{component}/{scenario}.png`

### 2. AI Evaluation

**Location**: `src/testing/evaluation/`

Uses Claude Vision to evaluate screenshots against expectations:

- **Visual Analysis** - Claude analyzes the actual screenshot
- **Expectation Matching** - Compares against written expectations
- **Confidence Scoring** - Returns 0-100 score with detailed reasoning
- **Pattern Recognition** - Identifies UI elements, colors, spacing

**Key Files:**
- `evaluation/Evaluator.ts` - Claude Vision integration
- `evaluation/Collector.ts` - Collects test results
- `evaluation/prompts/PromptBuilder.ts` - Constructs evaluation prompts

**Evaluation Process:**
1. Read screenshot and expectation
2. Build evaluation prompt with context
3. Send to Claude Vision API
4. Parse response (confidence score + reasoning)
5. Store result with metadata

**Evaluation Prompt Template:**
```typescript
You are evaluating a terminal UI screenshot against an expectation.

EXPECTATION:
{expectation from test}

SCREENSHOT:
[Claude Vision analyzes the image]

Provide:
1. Confidence score (0-100)
2. Reasoning for the score
3. What matches and what doesn't
```

### 3. Report Generation

**Location**: `src/testing/reporting/`

Generates comprehensive HTML reports:

- **Visual Results** - Side-by-side screenshot display
- **Confidence Scores** - Color-coded score indicators
- **AI Reasoning** - Full evaluation reasoning
- **Historical Tracking** - Compare across runs
- **Pass/Fail Status** - Clear test outcomes

**Key Files:**
- `reporting/ReportGenerator.ts` - HTML generation
- `reporting/ReportManager.ts` - Report orchestration
- `reporting/index.ts` - Public API

**Report Contents:**
- Summary statistics (total, passed, failed, avg confidence)
- Per-scenario results with screenshots
- AI evaluation reasoning
- Timestamp and metadata
- Links to screenshot files

### 4. Historical Tracking

**Location**: `.dev/reports/history.json`

Tracks test results over time:

```json
{
  "runs": [
    {
      "timestamp": "2025-10-01T12:00:00Z",
      "component": "input-box",
      "scenarios": [
        {
          "name": "idle-state",
          "confidence": 95,
          "passed": true
        }
      ]
    }
  ]
}
```

## Running Tests

### Full Test Suite

Capture screenshots and evaluate:

```bash
bun run test
```

### Screenshot Capture Only

Useful for updating baselines:

```bash
bun run test:capture
```

### Evaluation Only

Skip screenshot capture, evaluate existing:

```bash
bun run test:evaluate
```

### Specific Component

Test a single component:

```bash
bun run test:capture --pattern src/components/input-box/input-box.setup.ts
```

### With Delay

Wait before capturing (for animations):

```bash
SCREENSHOT_DELAY=5000 bun run test:capture:spinner
```

## Test Organization

Each component follows this structure:

```
src/components/{component}/
├── {component}.tsx           # Component implementation
├── {component}.setup.ts      # Test scenarios
└── {component}.spec.tsx      # Test expectations
```

### Setup File (`component.setup.ts`)

Defines test scenarios:

```typescript
import type { TestScenario } from "../../testing/types";

export const scenarios: TestScenario[] = [
  {
    name: "idle-state",
    description: "Input box in idle state",
    component: "InputBox",
    props: {
      placeholder: "Type here...",
      disabled: false,
    },
  },
  {
    name: "focused-state",
    description: "Input box when focused",
    component: "InputBox",
    props: {
      placeholder: "Type here...",
      disabled: false,
      autoFocus: true,
    },
  },
];
```

### Spec File (`component.spec.tsx`)

Defines expectations:

```typescript
import { describe, it } from "bun:test";
import { renderComponent } from "../../testing/capture";
import { scenarios } from "./input-box.setup";

describe("InputBox", () => {
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
    case "idle-state":
      return "Input box with horizontal borders (top and bottom only), showing placeholder text in muted color";
    case "focused-state":
      return "Input box with blue horizontal borders, cursor visible, placeholder text";
    default:
      return "";
  }
}
```

## Confidence Scoring

Tests use AI confidence scores instead of binary pass/fail:

### Score Ranges

- **90-100** - Excellent match, passes
- **80-89** - Good match, likely passes
- **70-79** - Partial match, investigate
- **Below 70** - Poor match, fails

### Threshold

Default passing threshold: **85%**

Configure in `src/testing/config/paths.ts`:

```typescript
export const CONFIDENCE_THRESHOLD = 85;
```

## Output Files

### Screenshots

Location: `.dev/screenshots/{component}/{scenario}.png`

- PNG format
- Full terminal window capture
- Timestamped filenames

### Reports

Location: `.dev/reports/{component}-report.html`

- HTML format with embedded screenshots
- Interactive, self-contained
- Color-coded confidence scores

### History

Location: `.dev/reports/history.json`

- JSON format
- All test run results
- Queryable for trends

## Best Practices

### 1. Write Clear Expectations

Good expectations are specific and visual:

```typescript
// ✅ Good
expectation: "Input field with horizontal borders only (top and bottom), no side borders. Shows '> Type here' prompt with blue border when focused."

// ❌ Too vague
expectation: "Input field looks right"
```

### 2. Test Multiple States

Cover all component states:

```typescript
scenarios: [
  { name: "idle", /* ... */ },
  { name: "focused", /* ... */ },
  { name: "disabled", /* ... */ },
  { name: "error", /* ... */ },
]
```

### 3. Use Delays for Animations

Components with animations need time:

```bash
SCREENSHOT_DELAY=5000 bun run test:capture
```

### 4. Review AI Reasoning

Don't just look at scores - read the AI reasoning to understand why tests pass or fail.

### 5. Update Baselines

When designs change intentionally:

```bash
# Recapture screenshots
bun run test:capture

# Verify they look correct
open .dev/screenshots/

# Commit updated screenshots
git add .dev/screenshots/
git commit -m "Update screenshot baselines"
```

## Configuration

### Environment Variables

- `SCREENSHOT_DELAY` - Delay before capture (ms), default: 1000
- `ANTHROPIC_API_KEY` - Required for AI evaluation
- `DEBUG` - Enable debug logging

### Test Paths

Configured in `src/testing/config/paths.ts`:

```typescript
export const PATHS = {
  screenshots: ".dev/screenshots",
  reports: ".dev/reports",
  temp: ".dev/temp",
};
```

## Troubleshooting

### Screenshots Not Capturing

1. Check Playwright is installed: `bun add -D playwright`
2. Install browsers: `bunx playwright install`
3. Verify component setup file exists

### Low Confidence Scores

1. Review AI reasoning in report
2. Check expectation clarity
3. Verify screenshot shows expected state
4. Ensure sufficient delay for animations

### Evaluation Failures

1. Check `ANTHROPIC_API_KEY` is set
2. Verify API key has Vision API access
3. Check network connectivity
4. Review error logs in console

## Next Steps

- [Writing Tests →](/testing/writing-tests) - Learn how to write tests
- [Design System →](/application/design-system) - Component specifications
- [Contributing →](/contributing/) - Contribute to testing infrastructure

## Technical Details

### Why Playwright?

- **Cross-platform** - Works on macOS, Linux, Windows
- **Reliable** - Mature screenshot capture
- **Fast** - Headless browser mode
- **Well-maintained** - Active development

### Why Claude Vision?

- **Context Understanding** - Understands terminal UI patterns
- **Flexible** - Adapts to different component types
- **Reasoning** - Provides explanations, not just scores
- **Accurate** - High accuracy on visual comparisons

### Limitations

- **API Costs** - Claude Vision API calls cost money
- **Speed** - Slower than traditional tests (screenshots + API)
- **Non-deterministic** - AI scores may vary slightly
- **Visual Only** - Doesn't test functionality/behavior

Despite limitations, this approach provides the best balance of accuracy, maintainability, and developer experience for TUI testing.
