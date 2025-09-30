# PRD: Testing System Architecture Refactoring

**Status:** Draft
**Created:** 2025-09-30
**Priority:** P1 - High
**Effort:** Medium (~3 hours)

---

## Overview

Refactor the testing system to:
1. **Remove misleading "Visual" prefix** from all files and types
2. **Reorganize into feature-based modules** for better maintainability
3. **Create terminal capture facade** to abstract platform-specific implementation
4. **Prepare for future browser-based terminal** rendering

---

## Problem Statement

### Current Issues

❌ **Misleading "Visual" naming**
- `VisualTestPipeline`, `VisualTestRunner`, `visualTestLogger`
- Suggests visual regression testing (Playwright/Percy style)
- Actually does: AI-evaluated terminal screenshot testing

❌ **Confusing file names**
- `visualTestRunner` → Doesn't run tests, captures screenshots
- `componentHarness` → Not a harness, just renders React components
- `screenshot.ts` → Unclear that it's macOS Terminal-specific

❌ **Flat structure with no clear organization**
```
src/testing/
├── visualTestPipeline.ts
├── visualTestRunner.ts
├── visualTestLogger.ts
├── componentHarness.tsx
├── screenshot.ts
├── helpers.ts (1 function)
└── evaluation/, prompts/, reporting/ (nested)
```

❌ **Platform-specific code not abstracted**
- `screenshot.ts` hardcoded to macOS Terminal.app
- Will be replaced with browser-based terminal
- No facade/adapter pattern for easy swapping

---

## Proposed Solution

### 1. New Naming Convention

**Remove redundant prefixes:**
- ✅ `pipeline.ts` (not TestPipeline - context is clear)
- ✅ `logger.ts` (not visualTestLogger)
- ✅ `evaluator.ts` (not VisualTestEvaluator)
- ✅ `collector.ts` (not TestResultCollector)
- ✅ `cli.ts` (not visualTest.ts)

**More descriptive names:**
- ✅ `capture/runner.ts` (what it actually does)
- ✅ `capture/renderer.tsx` (React component renderer)
- ✅ `capture/terminal.ts` (terminal screenshots)

### 2. New Directory Structure (Feature-First)

```
src/testing/
├── index.ts                             # Public API exports
├── cli.ts                               # CLI entry point (was cli/visualTest.ts)
├── pipeline.ts                          # Main orchestrator (was visualTestPipeline.ts)
├── logger.ts                            # Console logging (was visualTestLogger.ts)
├── types.ts                             # Shared types
│
├── config/
│   └── paths.ts                         # Path configuration (no change)
│
├── capture/                             # Screenshot capture module
│   ├── index.ts                         # Barrel exports
│   ├── runner.ts                        # Discovery & orchestration (was visualTestRunner.ts)
│   ├── renderer.tsx                     # React renderer (was componentHarness.tsx)
│   ├── terminal.ts                      # Terminal capture facade (was screenshot.ts)
│   ├── adapters/
│   │   ├── types.ts                     # Adapter interface
│   │   ├── macos.ts                     # MacOS Terminal.app adapter
│   │   └── browser.ts                   # Future: Browser-based terminal (stub)
│   └── types.ts                         # Capture-specific types
│
├── evaluation/                          # AI evaluation module
│   ├── index.ts                         # Barrel exports
│   ├── evaluator.ts                     # AI evaluator (was VisualTestEvaluator.ts)
│   ├── collector.ts                     # Result collector (was TestResultCollector.ts)
│   ├── types.ts                         # Evaluation types (no change)
│   └── prompts/
│       ├── builder.ts                   # Prompt builder (was PromptBuilder.ts)
│       └── templates.ts                 # Prompt templates (no change)
│
└── reporting/                           # HTML reports module
    ├── index.ts                         # Barrel exports
    ├── generator.ts                     # HTML generator (was HTMLReportGenerator.ts)
    ├── manager.ts                       # History manager (was ReportManager.ts)
    └── types.ts                         # Report types (new)
```

**Key changes:**
- Core files (`pipeline.ts`, `logger.ts`, `cli.ts`) at root for visibility
- Feature modules (`capture/`, `evaluation/`, `reporting/`) self-contained
- Each module has `index.ts` barrel for clean imports
- `helpers.ts` deleted (merge `validateScenario` into runner)
- Terminal capture gets `adapters/` subfolder for facade pattern

### 3. Terminal Capture Facade Pattern

**Adapter Interface:**

```typescript
// capture/adapters/types.ts

export type TerminalCaptureOptions = {
  cmd: string;           // Command to run
  out: string;           // Output screenshot path
  width?: number;        // Window width
  height?: number;       // Window height
  settleMs?: number;     // Time to wait before capture
};

export type TerminalCaptureAdapter = {
  /**
   * Captures a terminal screenshot by running a command
   */
  capture(options: TerminalCaptureOptions): Promise<void>;

  /**
   * Returns true if this adapter is supported on current platform
   */
  isSupported(): boolean;

  /**
   * Returns the adapter name for logging
   */
  getName(): string;
};
```

**MacOS Adapter:**

```typescript
// capture/adapters/macos.ts

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TerminalCaptureAdapter, TerminalCaptureOptions } from "./types";

const execFileP = promisify(execFile);

export class MacOSTerminalAdapter implements TerminalCaptureAdapter {
  isSupported(): boolean {
    return process.platform === "darwin";
  }

  getName(): string {
    return "MacOS Terminal.app";
  }

  async capture(options: TerminalCaptureOptions): Promise<void> {
    // Current implementation from screenshot.ts
    // ... AppleScript logic ...
  }
}
```

**Browser Adapter (Future):**

```typescript
// capture/adapters/browser.ts

import type { TerminalCaptureAdapter, TerminalCaptureOptions } from "./types";

export class BrowserTerminalAdapter implements TerminalCaptureAdapter {
  isSupported(): boolean {
    // Always supported (runs in browser context)
    return true;
  }

  getName(): string {
    return "Browser Terminal";
  }

  async capture(options: TerminalCaptureOptions): Promise<void> {
    // TODO: Future implementation
    // - Launch headless browser (Playwright/Puppeteer)
    // - Render xterm.js or similar
    // - Run command in PTY
    // - Take screenshot
    throw new Error("BrowserTerminalAdapter not yet implemented");
  }
}
```

**Facade (Public API):**

```typescript
// capture/terminal.ts

import { logger } from "@/services/logger";
import { BrowserTerminalAdapter } from "./adapters/browser";
import { MacOSTerminalAdapter } from "./adapters/macos";
import type { TerminalCaptureAdapter, TerminalCaptureOptions } from "./adapters/types";

/**
 * Factory function to get the appropriate terminal capture adapter
 */
function getAdapter(): TerminalCaptureAdapter {
  // Try adapters in order of preference
  const adapters = [
    new MacOSTerminalAdapter(),
    new BrowserTerminalAdapter(),
  ];

  for (const adapter of adapters) {
    if (adapter.isSupported()) {
      logger.info(`Using terminal adapter: ${adapter.getName()}`);
      return adapter;
    }
  }

  throw new Error("No supported terminal capture adapter found for this platform");
}

// Singleton instance
let adapterInstance: TerminalCaptureAdapter | null = null;

/**
 * Captures a terminal screenshot using platform-appropriate adapter
 *
 * @example
 * await captureTerminal({
 *   cmd: "bun src/components/banner/banner.spec.tsx",
 *   out: "screenshots/banner.png",
 *   width: 900,
 *   height: 600,
 * });
 */
export async function captureTerminal(
  options: TerminalCaptureOptions
): Promise<void> {
  if (!adapterInstance) {
    adapterInstance = getAdapter();
  }

  return adapterInstance.capture(options);
}

/**
 * Reset adapter (useful for testing)
 */
export function resetAdapter(): void {
  adapterInstance = null;
}
```

---

## Technical Specification

### Phase 1: Rename Core Files (No Structure Change)

**Files to rename:**

| Current | New | Changes Needed |
|---------|-----|----------------|
| `src/testing/visualTestLogger.ts` | `src/testing/logger.ts` | Export name: `logger` (not `visualTestLogger`) |
| `src/testing/visualTestPipeline.ts` | `src/testing/pipeline.ts` | Function: `runPipeline()` (not `runVisualTestPipeline()`) |
| `src/testing/cli/visualTest.ts` | `src/testing/cli.ts` | Help text updates |
| `src/testing/componentHarness.tsx` | `src/testing/renderer.tsx` | Function: `renderComponent()` (not `runHarness()`) |
| `src/testing/screenshot.ts` | `src/testing/terminal.ts` | Function: `captureTerminal()` (not `captureTerminalScreenshot()`) |
| `src/testing/visualTestRunner.ts` | `src/testing/runner.ts` | Function: `runCapture()` (not `runVisualTests()`) |
| `src/testing/evaluation/VisualTestEvaluator.ts` | `src/testing/evaluation/Evaluator.ts` | Class: `Evaluator` (not `VisualTestEvaluator`) |
| `src/testing/evaluation/TestResultCollector.ts` | `src/testing/evaluation/Collector.ts` | Class: `Collector` (not `TestResultCollector`) |

**Delete files:**
- `src/testing/helpers.ts` → Merge `validateScenario()` into runner

### Phase 2: Create Terminal Adapter System

1. **Create adapter interface:**
   ```bash
   src/testing/capture/adapters/types.ts
   ```

2. **Extract macOS implementation:**
   ```bash
   src/testing/capture/adapters/macos.ts
   ```

3. **Create browser stub:**
   ```bash
   src/testing/capture/adapters/browser.ts
   ```

4. **Create facade:**
   ```bash
   src/testing/capture/terminal.ts
   ```

### Phase 3: Reorganize into Modules

1. **Create module directories:**
   ```bash
   mkdir -p src/testing/{capture,evaluation,reporting}
   ```

2. **Move files:**
   ```bash
   # Capture module
   mv src/testing/runner.ts src/testing/capture/
   mv src/testing/renderer.tsx src/testing/capture/
   mv src/testing/terminal.ts src/testing/capture/

   # Evaluation module (already in place, just rename)
   mv src/testing/evaluation/Evaluator.ts src/testing/evaluation/evaluator.ts
   mv src/testing/evaluation/Collector.ts src/testing/evaluation/collector.ts
   mv src/testing/evaluation/prompts/PromptBuilder.ts src/testing/evaluation/prompts/builder.ts

   # Reporting module (lowercase)
   mv src/testing/reporting/HTMLReportGenerator.ts src/testing/reporting/generator.ts
   mv src/testing/reporting/ReportManager.ts src/testing/reporting/manager.ts
   ```

3. **Create barrel exports:**
   ```typescript
   // src/testing/capture/index.ts
   export { runCapture } from "./runner";
   export { renderComponent } from "./renderer";
   export { captureTerminal, resetAdapter } from "./terminal";
   export type * from "./types";

   // src/testing/evaluation/index.ts
   export { Evaluator } from "./evaluator";
   export { Collector } from "./collector";
   export type * from "./types";

   // src/testing/reporting/index.ts
   export { HTMLReportGenerator } from "./generator";
   export { ReportManager } from "./manager";
   export type * from "./types";
   ```

### Phase 4: Update Imports

**Before:**
```typescript
import { visualTestLogger } from "@/testing/visualTestLogger";
import { runVisualTests } from "@/testing/visualTestRunner";
import { VisualTestEvaluator } from "@/testing/evaluation/VisualTestEvaluator";
import { TestResultCollector } from "@/testing/evaluation/TestResultCollector";
import { HTMLReportGenerator } from "@/testing/reporting/HTMLReportGenerator";
```

**After:**
```typescript
import { logger } from "@/testing/logger";
import { runCapture } from "@/testing/capture";
import { Evaluator, Collector } from "@/testing/evaluation";
import { HTMLReportGenerator } from "@/testing/reporting";
```

### Phase 5: Update package.json Scripts

```json
{
  "scripts": {
    "test": "bun src/testing/cli.ts",
    "test:capture": "bun src/testing/capture/runner.ts",
    "test:evaluate": "bun src/testing/cli.ts --skip-capture"
  }
}
```

**Previous:**
```json
{
  "scripts": {
    "test:visual": "bun src/testing/cli/visualTest.ts",
    "test:visual:capture": "bun src/testing/visualTestRunner.ts",
    "test:visual:evaluate": "bun src/testing/cli/visualTest.ts --skip-capture"
  }
}
```

---

## Benefits

### ✅ Clearer Naming
- **Before**: `VisualTestEvaluator` (what does "Visual" mean?)
- **After**: `Evaluator` (context is clear from module path)

### ✅ Better Organization
- **Before**: 16 files in flat structure
- **After**: 3 feature modules with clear boundaries

### ✅ Easier Imports
- **Before**: `@/testing/evaluation/VisualTestEvaluator`
- **After**: `@/testing/evaluation` (barrel exports)

### ✅ Platform Independence (via Facade)
- **Before**: MacOS-only, hardcoded
- **After**: Adapter pattern, easy to swap implementations

### ✅ Future-Proof
- Browser-based terminal adapter stub already in place
- No breaking changes when switching adapters
- All code depends on interface, not implementation

---

## Migration Strategy

### Step 1: Phase 1 - Rename Files (30 min)
- Rename all core files
- Update exports
- Update imports across codebase
- Run `bun run check` after each file

### Step 2: Phase 2 - Create Adapter System (45 min)
- Create `capture/adapters/` structure
- Extract MacOS code into adapter
- Create facade with factory
- Test terminal capture still works

### Step 3: Phase 3 - Reorganize Modules (30 min)
- Create module folders
- Move files into modules
- Create barrel exports (`index.ts`)

### Step 4: Phase 4 - Update Imports (30 min)
- Use `grep` to find all import statements
- Update to use barrel exports
- Run `bun run check` continuously

### Step 5: Phase 5 - Update Scripts (15 min)
- Update `package.json` scripts
- Update CLI help text if needed

### Step 6: Phase 6 - Create Documentation (30 min)
- Create comprehensive `src/testing/README.md`
- Delete old `/docs/VISUAL_TESTING_SYSTEM.md`
- Update main project README if it references testing system

**Total Time: ~3 hours**

---

## Testing Checklist

- [ ] `bun run check` passes (linting + types)
- [ ] `bun test` runs complete pipeline successfully
- [ ] `bun test:capture` captures screenshots correctly
- [ ] `bun test:evaluate` evaluates existing screenshots
- [ ] Reports generate and open in browser
- [ ] Logs display correctly with new logger name
- [ ] Terminal adapter auto-detects platform
- [ ] All imports resolve correctly
- [ ] No circular dependencies

---

## Rollback Plan

1. **Git branch protection:**
   ```bash
   git checkout -b refactor/testing-architecture
   ```

2. **Commit after each phase:**
   ```bash
   git commit -m "feat: Phase 1 - Rename core files"
   git commit -m "feat: Phase 2 - Create adapter system"
   # etc.
   ```

3. **If issues occur:**
   ```bash
   git reset --hard HEAD~1  # Undo last commit
   # Or full rollback:
   git checkout main
   git branch -D refactor/testing-architecture
   ```

---

## Breaking Changes

### Public API Changes

**Function Renames:**
| Old | New | Impact |
|-----|-----|--------|
| `runVisualTestPipeline()` | `runPipeline()` | Internal only |
| `runVisualTests()` | `runCapture()` | CLI scripts |
| `captureTerminalScreenshot()` | `captureTerminal()` | Internal only |
| `runHarness()` | `renderComponent()` | Component specs |

**Export Names:**
| Old | New | Impact |
|-----|-----|--------|
| `visualTestLogger` | `logger` | All files using logger |
| `VisualTestEvaluator` | `Evaluator` | Pipeline |
| `TestResultCollector` | `Collector` | Pipeline |

**Import Paths:**
| Old | New | Impact |
|-----|-----|--------|
| `@/testing/cli/visualTest` | `@/testing/cli` | package.json scripts |
| `@/testing/visualTestLogger` | `@/testing/logger` | All imports |
| `@/testing/evaluation/VisualTestEvaluator` | `@/testing/evaluation` | Pipeline imports |

### Component Spec Files

**Before:**
```typescript
import { runHarness } from "@/testing/componentHarness";

runHarness({
  scenarioName: "Default",
  description: "Shows default banner",
  render: () => <Banner />
});
```

**After:**
```typescript
import { renderComponent } from "@/testing/capture";

renderComponent({
  scenarioName: "Default",
  description: "Shows default banner",
  render: () => <Banner />
});
```

---

## Documentation Updates Needed

### Phase 6: Create Testing System README (30 min)

**Location:** `src/testing/README.md` (co-located with code)

**Old Documentation:**
- `/docs/VISUAL_TESTING_SYSTEM.md` - Outdated, refers to old names
- Should be **deleted** after migration

**New Documentation Structure:**

```markdown
# Testing System

> AI-Evaluated Terminal Screenshot Testing for React Components

## Quick Start

\`\`\`bash
# Run all tests
bun test

# Capture only
bun test:capture

# Evaluate existing screenshots
bun test:evaluate
\`\`\`

## Architecture

[Updated architecture diagram with new names]

## File Structure

src/testing/
├── pipeline.ts              # Main orchestrator
├── logger.ts                # Console output
├── cli.ts                   # CLI entry
├── capture/                 # Screenshot capture
│   ├── runner.ts
│   ├── renderer.tsx
│   └── terminal.ts (facade)
├── evaluation/              # AI evaluation
│   ├── evaluator.ts
│   ├── collector.ts
│   └── prompts/
└── reporting/               # HTML reports

## Core Concepts

### 1. Capture Phase
[How screenshot capture works with terminal adapter]

### 2. Evaluation Phase
[How AI evaluates screenshots]

### 3. Reporting Phase
[How HTML reports are generated]

## Terminal Adapters

Current: MacOS Terminal.app
Future: Browser-based terminal (xterm.js)

[Adapter interface documentation]

## Component Testing Guide

[How to write .setup.ts and .spec.tsx files]

## API Reference

[Updated API with new names]

## Configuration

[Environment variables, CLI flags, paths.ts]

## Troubleshooting

[Common issues and solutions]
\`\`\`

**Content Updates:**

1. **Replace all old names with new:**
   - `runVisualTests()` → `runCapture()`
   - `VisualTestEvaluator` → `Evaluator`
   - `visualTestLogger` → `logger`
   - `runHarness()` → `renderComponent()`
   - `captureTerminalScreenshot()` → `captureTerminal()`

2. **Add new sections:**
   - **Terminal Adapters** - Document facade pattern
   - **Module Organization** - Explain feature-first structure
   - **Import Patterns** - Show barrel export usage

3. **Update examples:**
   ```typescript
   // Before
   import { runHarness } from "@/testing/componentHarness";

   // After
   import { renderComponent } from "@/testing/capture";
   ```

4. **Add migration notes:**
   ```markdown
   ## Migration from v1.0

   | Old | New |
   |-----|-----|
   | `runVisualTests()` | `runCapture()` |
   | `@/testing/componentHarness` | `@/testing/capture` |
   | `visualTestLogger` | `logger` |
   ```

**Tasks:**

1. Create `src/testing/README.md` with updated content
2. Delete `/docs/VISUAL_TESTING_SYSTEM.md`
3. Update any references in main project README
4. Add link to testing README from main docs

---

## Future Enhancements (Out of Scope)

### Browser-Based Terminal Adapter

When implementing `BrowserTerminalAdapter`:

```typescript
// capture/adapters/browser.ts (future implementation)

import { chromium } from "playwright";
import type { TerminalCaptureAdapter, TerminalCaptureOptions } from "./types";

export class BrowserTerminalAdapter implements TerminalCaptureAdapter {
  async capture(options: TerminalCaptureOptions): Promise<void> {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set viewport
    await page.setViewportSize({
      width: options.width || 900,
      height: options.height || 600,
    });

    // Load xterm.js terminal
    await page.goto("http://localhost:3000/terminal");

    // Execute command in PTY
    await page.evaluate((cmd) => {
      window.terminal.exec(cmd);
    }, options.cmd);

    // Wait for settle
    await page.waitForTimeout(options.settleMs || 2000);

    // Screenshot
    await page.screenshot({ path: options.out });

    await browser.close();
  }
}
```

**Benefits:**
- ✅ Cross-platform (Windows, Linux, macOS)
- ✅ Consistent rendering across environments
- ✅ No AppleScript permission prompts
- ✅ Better control over terminal appearance

---

## Success Criteria

✅ All files renamed with clear, non-redundant names
✅ Code organized into feature modules (capture/evaluation/reporting)
✅ Terminal capture uses facade pattern with adapter interface
✅ MacOS adapter functional (current behavior preserved)
✅ Browser adapter stub in place for future implementation
✅ All imports updated to use barrel exports
✅ All tests pass
✅ No breaking changes for end users
✅ Clean `git diff` showing intentional changes only

---

## Open Questions

1. **Should we rename the system itself?**
   - Current: "Visual Test AI Evaluation System"
   - Options: "Terminal Screenshot Testing", "AI Component Testing"
   - Decision: **Keep current name in docs**, just fix code

2. **Keep "Test" in script names?**
   - `bun test` vs `bun test:pipeline`
   - Decision: **Use `bun test`** (standard convention)

3. **Should evaluation/prompts be at top level?**
   - Tightly coupled to evaluator
   - Decision: **Keep nested** for now, easy to extract later

---

## Related PRDs

- [Consolidate Build Artifacts](./consolidate-dev-artifacts.md) - Already completed

---

**Ready to implement?** Start with Phase 1 (rename files) to get quick wins.
