# Testing System

> AI-Evaluated Terminal Screenshot Testing for React Components

## Quick Start

```bash
# Run complete pipeline
bun test

# Capture only
bun test:capture

# Evaluate existing screenshots
bun test:evaluate
```

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

### 3. Reporting Phase

Generates interactive HTML reports:

1. **Generate**: Creates HTML with screenshots, results, and AI commentary
2. **Version**: Saves to versioned `runs/` directory + latest `index.html`
3. **History**: Manages run history (default: keep last 10 runs)
4. **Open**: Opens report in default browser

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
const html = await generator.generateReport(summary, results, screenshotDir);
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
  --skip-capture          Use existing screenshots
  -o, --output <dir>      Output directory for reports
  -s, --screenshot-dir    Screenshot directory
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

### Evaluation Failures

Common issues:
- Screenshot quality too low
- Expected behavior too vague
- Network issues with Claude API

Run with `--skip-capture` to re-evaluate existing screenshots.

### Tests Failing Unexpectedly

Try different evaluation strictness:

```bash
bun test --lenient   # Check text only
bun test --moderate  # Check text + layout (default)
bun test --strict    # Check text + layout + colors
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
bun test
```

### Evaluate Existing Screenshots

```bash
bun test --skip-capture
```

### Strict Evaluation with Custom Output

```bash
bun test --strict --output ./my-reports
```

### Named Run (Preserved Indefinitely)

```bash
bun test --run-name "before-refactor"
```

### Keep Last 20 Runs

```bash
bun test --keep-history 20
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
