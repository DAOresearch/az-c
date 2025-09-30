# Testing System

> AI-Evaluated Terminal Screenshot Testing for React Components

## Quick Start

```bash
# Run complete pipeline
bun run test

# Capture only
bun run test:capture

# Evaluate existing screenshots
bun run test:evaluate
```

## Component Test Schema

### Setup File Format

Every `.setup.ts` file must export a default object matching this schema:

```typescript
type ComponentSetup = {
  scenarios: Array<{
    scenarioName: string;        // Required: Unique identifier
    description: string;         // Required: Human-readable summary
    expectation: string;         // Required: AI evaluation criteria ⚠️
    params: Record<string, unknown>; // Required: Props for component
  }>;
};
```

### Field Requirements

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| `scenarioName` | ✅ Yes | PascalCase string | "Default State" |
| `description` | ✅ Yes | Sentence | "Component with default props" |
| `expectation` | ✅ Yes | Specific criteria | "Shows 'Welcome' text centered" |
| `params` | ✅ Yes | Object (can be empty) | `{ message: "Hello" }` |

### Writing Good Expectations

The `expectation` field is **critical** - it defines success criteria for AI evaluation.

✅ **Good Expectations** (specific, testable):
- "Banner displays 'Welcome' text centered with blue background"
- "Error message appears in red below the input field"
- "Loading spinner rotates clockwise, completes in 1 second"

❌ **Bad Expectations** (vague, untestable):
- `""` (empty - will fail)
- "Looks good" (subjective)
- "Default state" (ambiguous)

### Validation Rules

- ✅ Non-empty string (minimum 20 characters recommended)
- ✅ Describes visible elements (text, colors, layout)
- ✅ Specific enough for AI to verify
- ❌ Empty strings rejected
- ❌ Generic phrases ("looks good", "works") flagged

## Writing Effective Expectations

### The 3 Elements of Good Expectations

1. **What** - What should be visible?
   - Text content, images, icons
   - Interactive elements (buttons, inputs)

2. **Where** - Where should it appear?
   - Position (centered, top-right, below input)
   - Layout (stacked vertically, side-by-side)

3. **How** - What should it look like?
   - Colors (blue background, red text)
   - Size (24px font, 200px wide)
   - Style (bold, italic, rounded corners)

### Examples by Specificity

**Too Vague** (AI will guess):
- "Component appears"
- "Looks correct"
- "Default styling"

**Better** (AI can verify):
- "Banner component is visible"
- "Text is blue"
- "Button is on the right"

**Best** (AI confidently evaluates):
- "Banner displays 'Welcome' text centered horizontally with blue (#0066CC) background and white text in 18px font"
- "Red error message 'Invalid email' appears immediately below email input field with 8px spacing"
- "Loading spinner (24px diameter) rotates clockwise centered in button, replacing text 'Submit'"

### Testing Edge Cases

Include expectations for:
- **Empty states**: "Shows message 'No items found' when list is empty"
- **Error states**: "Displays red border and error icon when validation fails"
- **Loading states**: "Shows skeleton placeholder (gray boxes) while data loads"
- **Disabled states**: "Button appears grayed out with 50% opacity when disabled"

## Directory Structure

### Output Files

All test outputs are stored under `.dev/reports/`:

```
.dev/
└── reports/
    ├── screenshots/                # Latest screenshots (working directory)
    │   ├── banner-component-default.png
    │   └── metadata.json
    ├── index.html                  # Latest report
    ├── results.json                # Latest results
    ├── runs.json                   # Run history manifest
    └── runs/                       # Versioned test runs (self-contained)
        ├── 20250930_195819/
        │   ├── index.html          # Report for this specific run
        │   ├── results.json        # Results for this specific run
        │   └── screenshots/        # Screenshots for this specific run
        │       ├── banner-component-default.png
        │       └── metadata.json
        └── 20250930_200314/
            ├── index.html
            ├── results.json
            └── screenshots/
                ├── banner-component-default.png
                └── metadata.json
```

**Why this structure?**

✅ **Self-contained runs** - Each versioned run includes everything needed to view that test session
✅ **Historical accuracy** - Old reports always display their original screenshots
✅ **Fast re-evaluation** - Use `--skip-capture` with latest screenshots in `.dev/reports/screenshots/`
✅ **No overwrites** - New test runs don't corrupt old reports
✅ **Co-located artifacts** - All test outputs live together under `.dev/reports/`

### How Screenshot Management Works

When you run `bun test`, the pipeline:

1. **Capture Phase**: Saves screenshots to `.dev/reports/screenshots/` (latest)
2. **Evaluation Phase**: Reads from `.dev/reports/screenshots/` and generates results
3. **Reporting Phase**: Generates HTML reports with paths pointing to `screenshots/`
4. **Archival Phase**: Copies screenshots to `.dev/reports/runs/{runId}/screenshots/`

**Result**: Both latest and versioned reports work correctly using the same relative paths!

### Screenshot Paths in Reports

The HTML reports use **relative paths** to reference screenshots:

- **Latest report** (`.dev/reports/index.html`):
  ```html
  <img src="screenshots/banner-default.png">
  ```
  → Resolves to `.dev/reports/screenshots/banner-default.png`

- **Versioned report** (`.dev/reports/runs/20250930_195819/index.html`):
  ```html
  <img src="screenshots/banner-default.png">
  ```
  → Resolves to `.dev/reports/runs/20250930_195819/screenshots/banner-default.png`

Both use identical HTML - the difference is WHERE the report is saved.

## Architecture

```
src/testing/
├── cli.ts                   # CLI entry point
├── pipeline.ts              # Main orchestrator
├── logger.ts                # Console output
├── types.ts                 # Shared types
│
├── capture/                 # Screenshot capture module
│   ├── runner.ts           # Discovery & orchestration
│   ├── renderer.tsx        # React component renderer
│   ├── terminal.ts         # Terminal capture facade
│   └── adapters/           # Platform-specific implementations
│       ├── types.ts        # Adapter interface
│       ├── macos.ts        # macOS Terminal.app
│       └── browser.ts      # Future: Browser-based (stub)
│
├── evaluation/             # AI evaluation module
│   ├── Evaluator.ts       # AI evaluator
│   ├── Collector.ts       # Result collector
│   ├── types.ts           # Evaluation types
│   └── prompts/           # Prompt templates
│       ├── PromptBuilder.ts
│       └── templates.ts
│
└── reporting/              # HTML reports module
    ├── HTMLReportGenerator.ts
    ├── ReportManager.ts
    └── types.ts
```

## Test-Driven Development Workflow

### The TDD Cycle with Terminal Screenshot Testing

```
┌─────────────────────────────────────────────┐
│  1. Write Test (setup + spec)              │
│     ↓                                       │
│  2. Run Test (`bun test`)                  │
│     ↓                                       │
│  3. See Failure (component doesn't exist)  │
│     ↓                                       │
│  4. Implement Component (minimum code)     │
│     ↓                                       │
│  5. Run Test Again                         │
│     ↓                                       │
│  6. See Success ✅                          │
│     ↓                                       │
│  7. Refactor (tests prevent regression)    │
└─────────────────────────────────────────────┘
```

### Quick Start: Your First TDD Component

**Goal**: Create a `Counter` component test-first.

**Step 1: Create Component Directory**

```bash
mkdir -p src/components/counter
```

**Step 2: Define Test Scenarios** (`src/components/counter/counter.setup.ts`)

```typescript
export default {
  scenarios: [
    {
      scenarioName: "Initial State",
      description: "Counter starts at zero",
      expectation: "Display shows 'Count: 0' with increment (+) and decrement (-) buttons side by side below",
      params: { initialCount: 0 },
    },
    {
      scenarioName: "Custom Initial Count",
      description: "Counter starts at specified value",
      expectation: "Display shows 'Count: 5' with increment and decrement buttons",
      params: { initialCount: 5 },
    },
  ],
} as const;
```

**Step 3: Create Spec** (`src/components/counter/counter.spec.tsx`)

```typescript
import { renderComponent } from "@/testing/capture";
import { logger } from "@/services/logger";
import config from "./counter.setup";
import { Counter } from "./index";

const scenarioIndex = Number.parseInt(process.env.SCENARIO_INDEX || "0", 10);
const scenario = config.scenarios[scenarioIndex];

if (!scenario) {
  logger.error(`No scenario found at index ${scenarioIndex}`);
  process.exit(1);
}

renderComponent({
  scenarioName: scenario.scenarioName,
  description: scenario.description,
  render: () => <Counter {...scenario.params} />,
});
```

**Step 4: Run Test (Will Fail)**

```bash
bun test

# Output:
# ❌ Counter / Initial State - FAILED
# Reasoning: Component not implemented yet
```

**Step 5: Implement Component** (`src/components/counter/index.tsx`)

```typescript
export type CounterProps = {
  initialCount: number;
};

export function Counter({ initialCount }: CounterProps) {
  return (
    <div>
      <div>Count: {initialCount}</div>
      <div>
        <button>(+)</button>
        <button>(-)</button>
      </div>
    </div>
  );
}
```

**Step 6: Run Test Again (Should Pass)**

```bash
bun test

# Output:
# ✅ Counter / Initial State - PASSED (95% confidence)
# ✅ Counter / Custom Initial Count - PASSED (96% confidence)
```

**Step 7: Refactor with Confidence**

Now you can refactor layout, styling, or structure - tests prevent regressions!

### TDD Best Practices

1. **Start with simplest scenario** - Default/initial state first
2. **Write specific expectations** - See "Writing Good Expectations" guide
3. **One expectation per scenario** - Keep tests focused
4. **Run tests frequently** - Quick feedback loop (<30 seconds)
5. **Refactor after green** - Tests catch breaking changes
6. **Add edge cases incrementally** - Empty, error, loading states

### TDD Anti-Patterns to Avoid

❌ **Writing vague expectations**
- Bad: "Component looks correct"
- Good: "Shows 'Welcome' text centered with blue background"

❌ **Testing implementation details**
- Bad: "Uses useState hook"
- Good: "Counter increments when + button clicked"

❌ **Skipping test phase**
- Write test first, even if component exists!
- Tests document expected behavior

❌ **Testing too much at once**
- Start with default state
- Add edge cases one by one

## Core Concepts

### 1. Capture Phase

The capture phase discovers component test files and generates terminal screenshots:

1. **Discovery**: Finds all `*.setup.ts` files in `src/components/`
2. **Execution**: Runs corresponding `*.spec.tsx` files for each scenario
3. **Screenshot**: Captures terminal output using platform-specific adapter
4. **Metadata**: Saves screenshot metadata to `metadata.json`

**Terminal Adapters:**

- **Current**: `MacOSTerminalAdapter` - Uses AppleScript to control Terminal.app
- **Future**: `BrowserTerminalAdapter` - Will use headless browser + xterm.js (cross-platform)

The facade pattern (`terminal.ts`) automatically selects the appropriate adapter based on platform.

### 2. Evaluation Phase

Screenshots are evaluated using Claude AI:

1. **Load**: Reads screenshots and metadata
2. **Prompt**: Builds evaluation prompts with expected behavior
3. **Evaluate**: Sends screenshot + prompt to Claude
4. **Parse**: Extracts pass/fail verdict, confidence, and observations
5. **Collect**: Aggregates results by component

**Evaluation Criteria:**

- `--strict`: Checks text, layout, and colors
- `--moderate`: Checks text and layout (default)
- `--lenient`: Checks text only

#### Understanding Confidence Scores

Every evaluation includes a **confidence score** (0-100%) indicating how certain the AI is about its verdict.

**Score Ranges:**

| Range | Meaning | Action |
|-------|---------|--------|
| **90-100%** | Very confident | Trust the verdict |
| **70-89%** | Good confidence | Verdict likely correct, review if failed |
| **50-69%** | Medium confidence | Manual review recommended |
| **0-49%** | Low confidence | Always verify manually |

**What Affects Confidence?**

High Confidence (90%+):
- ✅ Clear, sharp screenshot
- ✅ Specific expectation ("Shows 'Welcome' text centered")
- ✅ Simple layout, obvious pass/fail
- ✅ No ambiguity in requirements

Low Confidence (<70%):
- ❌ Blurry or cropped screenshot
- ❌ Vague expectation ("Looks good")
- ❌ Complex layout with many elements
- ❌ Ambiguous requirements

**Improving Confidence:**

1. **Write specific expectations**:
   - Bad: "Banner appears" → ~60% confidence
   - Good: "Banner shows 'Welcome' centered with blue background" → ~95% confidence

2. **Increase screenshot quality**:
   ```bash
   # Wait longer for rendering
   SCREENSHOT_DELAY=5000 bun test

   # Use larger terminal
   TERMINAL_WIDTH=1200 TERMINAL_HEIGHT=800 bun test
   ```

3. **Simplify tests**:
   - Test one thing per scenario
   - Avoid multiple assertions in one expectation

4. **Adjust strictness**:
   ```bash
   bun test --lenient    # Text only → higher confidence
   bun test --moderate   # Text + layout (default)
   bun test --strict     # Text + layout + colors → lower confidence
   ```

**Confidence in Reports:**

HTML reports display confidence as:
- **Color-coded bar**: Green gradient (fuller = higher confidence)
- **Percentage**: Hover over bar for exact score
- **Visual indicator**: Results sorted by confidence

Example:
```
✅ Banner / Default State - PASSED
   Confidence: ████████████████████ 95%

❌ Banner / Error State - FAILED
   Confidence: ██████████░░░░░░░░░░ 52%  ⚠️ Manual review recommended
```

### 3. Reporting Phase

Generates interactive HTML reports with co-located screenshots:

1. **Generate**: Creates HTML with screenshots, results, and AI commentary
2. **Save Latest**: Saves to `.dev/reports/index.html` (references `screenshots/`)
3. **Version**: Saves to versioned `runs/{runId}/` directory with same HTML
4. **Archive**: Copies screenshots to `runs/{runId}/screenshots/` for self-contained history
5. **History**: Manages run history (default: keep last 10 runs)
6. **Open**: Opens latest report in default browser

Each versioned run is completely self-contained with its own copy of screenshots, ensuring old reports always display correctly.

#### Run History Management

Every test run is tracked in a manifest file for historical analysis.

**Manifest Format**

Location: `.dev/reports/runs.json`

Structure:
```json
[
  {
    "runId": "20250930_195819",
    "timestamp": 1696089499000,
    "name": null,
    "totalTests": 5,
    "passed": 4,
    "failed": 1,
    "passRate": 0.8,
    "duration": 12345
  },
  {
    "runId": "20250930_200314",
    "timestamp": 1696089994000,
    "name": "pre-refactor",
    "totalTests": 5,
    "passed": 5,
    "failed": 0,
    "passRate": 1.0,
    "duration": 11234
  }
]
```

**Named Runs (Preserved Forever)**

Create a named run that won't be deleted during cleanup:

```bash
bun test --run-name "before-refactor"
bun test --run-name "release-v1.0"
bun test --run-name "baseline"
```

Use cases:
- Pre/post refactoring comparison
- Release baseline captures
- Important milestone tests
- Known-good reference screenshots

Named runs are **never deleted** during cleanup, even if you exceed `--keep-history` limit.

**Automatic Cleanup**

By default, the system keeps the **last 10 runs** (configurable):

```bash
# Keep last 20 runs
bun test --keep-history 20

# Keep last 5 runs
bun test --keep-history 5

# Skip cleanup entirely (disk space warning!)
bun test --skip-cleanup
```

What gets cleaned up:
- Versioned run directories (`.dev/reports/runs/YYYYMMDD_HHMMSS/`)
- Screenshots for old runs
- Metadata for old runs
- Entries in `runs.json` manifest

What's preserved:
- Named runs (always kept)
- Latest report (`.dev/reports/index.html`)
- Latest screenshots (`.dev/reports/screenshots/`)
- Manifest file itself

**Querying Run History (Programmatic)**

```typescript
import { ReportManager } from "@/testing/reporting";

const manager = new ReportManager({ baseDir: ".dev/reports" });

// List all runs
const history = await manager.listRuns();
console.log(`Total runs: ${history.length}`);

// Get specific run
const run = await manager.getRun("20250930_195819");
console.log(`Pass rate: ${run.passRate * 100}%`);

// Find named runs
const namedRuns = history.filter(run => run.name);
console.log(`Named runs: ${namedRuns.map(r => r.name).join(", ")}`);

// Get latest run
const [latest] = history.sort((a, b) => b.timestamp - a.timestamp);
console.log(`Latest: ${latest.runId}`);
```

## Component Testing Guide

### Setup File (`banner.setup.ts`)

Define test scenarios for your component:

```typescript
export default {
  scenarios: [
    {
      scenarioName: "Default",
      description: "Shows default banner",
      expectation: "Banner displays with title and message",
      params: {
        title: "Welcome",
        message: "Hello, world!",
      },
    },
    {
      scenarioName: "Warning",
      description: "Shows warning banner",
      expectation: "Banner displays with warning styling",
      params: {
        title: "Warning",
        message: "Something went wrong",
        variant: "warning",
      },
    },
  ],
};
```

### Spec File (`banner.spec.tsx`)

Render the component for screenshot capture:

```typescript
import { logger } from "@/services/logger";
import { renderComponent } from "@/testing/capture";
import config from "./banner.setup";
import { Banner, type BannerProps } from "./index";

// Get scenario index from environment variable
const scenarioIndex = Number.parseInt(process.env.SCENARIO_INDEX || "0", 10);
const scenario = config.scenarios[scenarioIndex];

if (!scenario) {
  logger.error(`No scenario found at index ${scenarioIndex}`);
  process.exit(1);
}

// Render the component
renderComponent({
  scenarioName: scenario.scenarioName,
  description: scenario.description,
  render: () => <Banner {...(scenario.params as BannerProps)} />,
});
```

## API Reference

### Capture Module

```typescript
import { runCapture, renderComponent, captureTerminal } from "@/testing/capture";

// Run capture for all components
const result = await runCapture({ pattern: "src/components/**/*.setup.ts" });

// Render a single component
renderComponent({
  scenarioName: "Default",
  description: "Shows default state",
  render: () => <MyComponent />,
});

// Capture terminal screenshot
await captureTerminal({
  cmd: "bun src/components/banner/banner.spec.tsx",
  out: "screenshots/banner.png",
  width: 900,
  height: 600,
});
```

### Evaluation Module

```typescript
import { Evaluator, Collector } from "@/testing/evaluation";

const evaluator = new Evaluator(agentService, {
  criteria: {
    strictness: "moderate",
    checkTextContent: true,
    checkLayout: true,
    checkColors: false,
  },
});

const results = await evaluator.evaluateBatch("metadata.json", "screenshots");

const collector = new Collector();
for (const result of results) {
  collector.addResult(result);
}

const summary = collector.getSummary();
```

### Reporting Module

```typescript
import { HTMLReportGenerator, ReportManager } from "@/testing/reporting";

const generator = new HTMLReportGenerator({ theme: "dark" });

// Generate report with options object
const html = await generator.generateReport({
  summary,
  componentResults: results,
  screenshotDir,
  config: { theme: "dark" },
  screenshotBasePath: "screenshots/", // Relative path from report location
});

await generator.saveReport(html, "reports/index.html");

const manager = new ReportManager({ baseDir: "reports", keepHistory: 10 });
const { runId, runDir } = await manager.createRun("my-test-run");
await manager.saveRunMetadata({ runId, ...summary });
await manager.cleanupOldRuns();
```

## Configuration

### Environment Variables

```bash
TERMINAL_WIDTH=900         # Terminal width in pixels
TERMINAL_HEIGHT=600        # Terminal height in pixels
SCREENSHOT_DELAY=2000      # ms to wait before screenshot
SCENARIO_INDEX=0           # Which scenario to run (set by runner)
```

### CLI Options

```bash
bun test --help

Options:
  --skip-capture          Use existing screenshots from .dev/reports/screenshots/
  -o, --output <dir>      Output directory for reports (default: .dev/reports)
  -s, --screenshot-dir    Screenshot directory (default: .dev/reports/screenshots)
                          Note: Screenshots are automatically archived with each test run
  --strict                Strict evaluation (text + layout + colors)
  --moderate              Moderate evaluation (text + layout)
  --lenient               Lenient evaluation (text only)
  -t, --theme <theme>     Report theme: light or dark
  --keep-history <n>      Number of runs to keep (default: 10)
  -n, --run-name <name>   Named run (preserved indefinitely)
  --skip-cleanup          Skip cleanup of old runs
```

## Terminal Adapters

### Current: macOS Terminal.app

Uses AppleScript to automate Terminal.app:

1. Opens new Terminal window
2. Runs command and resizes window
3. Captures screenshot with `screencapture`
4. Closes window

**Requirements:**
- macOS
- Screen Recording permission (for `screencapture`)
- Accessibility permission (for AppleScript)

### Future: Browser-based Terminal

Planned cross-platform alternative using:

- Headless browser (Playwright/Puppeteer)
- xterm.js terminal emulator
- PTY for command execution

**Benefits:**
- Cross-platform (Windows, Linux, macOS)
- Consistent rendering
- No permission prompts
- Better control over appearance

**Implementation:**

See `src/testing/capture/adapters/browser.ts` (currently stub)

## Troubleshooting

### Permission Errors (macOS)

If you see permission prompts:

1. Grant Screen Recording permission to Terminal
2. Grant Accessibility permission for System Events

**System Settings → Privacy & Security → Screen Recording/Accessibility**

### Screenshots Not Captured

Check that:
- `*.setup.ts` and `*.spec.tsx` files exist
- Scenario definitions are valid
- Terminal window has time to render (`SCREENSHOT_DELAY`)

### Screenshots Not Loading in Reports

**Symptom**: HTML report shows broken image icons instead of screenshots.

**Cause**: Incorrect relative paths or viewing old reports from before screenshot co-location.

**Solution**:
1. Ensure you're using the latest version (with co-located screenshots)
2. Run tests to generate new reports:
   ```bash
   bun test
   ```
3. Old reports (before co-location feature) may have broken links - re-run tests to fix

**How to verify**: Check that versioned runs have a `screenshots/` directory:
```bash
ls .dev/reports/runs/20250930_195819/screenshots/
```

### Old Reports Show Wrong Screenshots

**Symptom**: Viewing an old report but screenshots look different than expected.

**Cause**: In versions before screenshot co-location, all runs shared `.dev/screenshots/` which got overwritten.

**Solution**: Re-run tests to generate new versioned runs with co-located screenshots:
```bash
bun test
```

After this, each run will be self-contained with its own screenshots. Old runs from before this feature cannot be recovered.

### Evaluation Failures

Common issues:
- Screenshot quality too low
- Expected behavior too vague
- Network issues with Claude API

Run with `--skip-capture` to re-evaluate existing screenshots.

#### Understanding Evaluation Errors

The evaluator **never throws exceptions** - it always returns a result, even on error:

```typescript
// On error, returns:
{
  passed: false,
  confidence: 0,
  reasoning: "Evaluation failed: [error message]",
  suggestions: ["Retry evaluation", "Check screenshot quality"],
}
```

This ensures:
- ✅ Pipeline never crashes mid-run
- ✅ Partial results saved (other tests continue)
- ✅ Error details in HTML report

**Common Error Scenarios:**

**Network Timeout:**
```
❌ Component / Scenario - FAILED
Reasoning: Evaluation failed: Network timeout after 30s
Confidence: 0%
```

Solution: Retry evaluation without re-capturing
```bash
bun test --skip-capture
```

**Invalid Screenshot:**
```
❌ Component / Scenario - FAILED
Reasoning: Evaluation failed: Could not read screenshot file
Confidence: 0%
```

Solution: Re-capture screenshot
```bash
rm .dev/reports/screenshots/component-scenario.png
bun test
```

**API Rate Limit:**
```
❌ Component / Scenario - FAILED
Reasoning: Evaluation failed: API rate limit exceeded
Confidence: 0%
```

Solution: Wait and retry, or reduce test batch size
```bash
# Test one component at a time with delays
bun test
```

**Debugging Failed Evaluations:**

1. **Check screenshot quality**:
   - Open `.dev/reports/screenshots/component-scenario.png`
   - Verify image is clear, complete, not cropped

2. **Review expectation**:
   - Is it specific enough?
   - Does it match what's in screenshot?
   - Try simplifying if too complex

3. **Try different strictness**:
   ```bash
   bun test --lenient    # Text only
   bun test --moderate   # Text + layout
   bun test --strict     # All checks
   ```

4. **Check confidence score**:
   - <50%: AI is guessing, review expectation
   - 50-70%: Borderline, may need clarification
   - >70%: Likely accurate, trust the verdict

5. **Manual verification**:
   - Open HTML report (`.dev/reports/index.html`)
   - View screenshot alongside evaluation
   - If AI is wrong, improve expectation specificity

### Tests Failing Unexpectedly

Try different evaluation strictness:

```bash
bun test --lenient   # Check text only
bun test --moderate  # Check text + layout (default)
bun test --strict    # Check text + layout + colors
```

## Performance Optimization

### Pipeline Performance

Typical run times:
- **Capture**: ~5-10 seconds per component scenario
- **Evaluation**: ~3-5 seconds per screenshot (AI processing)
- **Report Generation**: ~1-2 seconds
- **Total**: ~30-60 seconds for 5 components

### Optimization Strategies

**1. Skip Re-Capture During Development**

```bash
# First run: Capture screenshots
bun test

# Subsequent runs: Re-evaluate only
bun test --skip-capture

# Saves: ~10-20 seconds per run
```

**2. Adjust Screenshot Delay**

```bash
# Faster for static components (default: 2000ms)
SCREENSHOT_DELAY=1000 bun test

# Saves: ~1-2 seconds per screenshot
```

**3. Reduce Terminal Size (Simple UIs)**

```bash
# Smaller screenshots = faster rendering
TERMINAL_WIDTH=600 TERMINAL_HEIGHT=400 bun test

# Saves: ~0.5-1 second per screenshot
```

**4. Cleanup Old Runs Aggressively**

```bash
# Keep fewer runs (default: 10)
bun test --keep-history 3

# Saves: Disk space + cleanup time
```

### Disk Space Management

**Per Run Usage:**
- Screenshots: ~1-5 MB (depends on terminal size)
- HTML Report: ~20-50 KB
- Results JSON: ~10-20 KB
- **Total per run**: ~1-5 MB

**Historical Runs:**
- Default (10 runs): ~10-50 MB
- With 20 runs: ~20-100 MB
- Named runs: Add ~1-5 MB each (never deleted)

**Cleanup Strategy:**
```bash
# Manual cleanup (removes all except latest)
rm -rf .dev/reports/runs/*

# Or configure aggressive auto-cleanup
bun test --keep-history 3
```

## Migration from v1.0

| Old | New |
|-----|-----|
| `bun test:visual` | `bun test` |
| `bun test:visual:capture` | `bun test:capture` |
| `bun test:visual:evaluate` | `bun test:evaluate` |
| `runVisualTestPipeline()` | `runPipeline()` |
| `runVisualTests()` | `runCapture()` |
| `captureTerminalScreenshot()` | `captureTerminal()` |
| `runHarness()` | `renderComponent()` |
| `visualTestLogger` | `logger` |
| `VisualTestEvaluator` | `Evaluator` |
| `TestResultCollector` | `Collector` |
| `@/testing/componentHarness` | `@/testing/capture` |
| `@/testing/visualTestLogger` | `@/testing/logger` |
| `@/testing/evaluation/VisualTestEvaluator` | `@/testing/evaluation` |

## Examples

### Run Complete Pipeline

```bash
bun run test
```

### Evaluate Existing Screenshots

```bash
bun run test --skip-capture
```

### Strict Evaluation with Custom Output

```bash
bun run test --strict --output ./my-reports
```

### Named Run (Preserved Indefinitely)

```bash
bun run test --run-name "before-refactor"
```

### Keep Last 20 Runs

```bash
bun run test --keep-history 20
```

## Development

### Adding a New Adapter

1. Create `src/testing/capture/adapters/my-adapter.ts`
2. Implement `TerminalCaptureAdapter` interface
3. Add to adapter list in `src/testing/capture/terminal.ts`

```typescript
import { MyAdapter } from "./adapters/my-adapter";

function getAdapter(): TerminalCaptureAdapter {
  const adapters = [
    new MacOSTerminalAdapter(),
    new MyAdapter(), // Add here
    new BrowserTerminalAdapter(),
  ];
  // ...
}
```

### Testing Adapters

```typescript
import { captureTerminal, resetAdapter } from "@/testing/capture";

// Force adapter refresh
resetAdapter();

// Test capture
await captureTerminal({
  cmd: "echo 'Hello, world!'",
  out: "test.png",
});
```

---

**Ready to test?** Run `bun test` to get started!
