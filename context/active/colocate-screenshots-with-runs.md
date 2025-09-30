# Task: Co-locate Screenshots with Test Runs + Fix Screenshot Paths

## Critical Bug Found

**Current screenshot path logic is broken!**

`HTMLReportGenerator.ts` line 208:
```typescript
const relativeScreenshotPath = `../${result.filePath}`;
```

If `result.filePath` is `.dev/screenshots/banner.png`, then from `.dev/reports/index.html`:
- Path becomes: `../.dev/screenshots/banner.png`
- Resolves to: `.dev/.dev/screenshots/banner.png` ❌ **BROKEN!**

## Problem Statement

**Issue 1: Screenshot paths in HTML reports are incorrect**
**Issue 2: Screenshots aren't versioned with test runs**
**Issue 3: Screenshots are stored outside the reports directory (wrong architecture)**

Current structure:
```
.dev/
├── screenshots/                    # ❌ Wrong location - should be inside reports/
│   ├── banner-default.png
│   └── metadata.json
└── reports/
    ├── index.html                  # ❌ Broken image links
    ├── results.json
    ├── runs.json
    └── runs/
        ├── 20250930_195819/
        │   ├── index.html          # ❌ Broken image links + references wrong screenshots
        │   └── results.json
        └── 20250930_200314/
            ├── index.html
            └── results.json
```

**What happens:**
1. Run 1: Screenshots saved to `.dev/screenshots/` → Report at `.dev/reports/runs/20250930_195819/`
2. Run 2: **OVERWRITES** `.dev/screenshots/` → Report at `.dev/reports/runs/20250930_200314/`
3. Run 1's report now references Run 2's screenshots! 💥

## Desired Solution

```
.dev/
└── reports/
    ├── screenshots/                # ✅ Latest screenshots co-located in reports
    │   ├── banner-default.png
    │   └── metadata.json
    ├── index.html                  # ✅ Correct links: screenshots/banner.png
    ├── results.json
    ├── runs.json
    └── runs/
        ├── 20250930_195819/
        │   ├── index.html          # ✅ Correct links: screenshots/banner.png
        │   ├── results.json
        │   └── screenshots/        # ✅ Co-located screenshots
        │       ├── banner-default.png
        │       └── metadata.json
        └── 20250930_200314/
            ├── index.html
            ├── results.json
            └── screenshots/
                ├── banner-default.png
                └── metadata.json
```

## Implementation Plan

### Phase 1: Update Path Configuration

#### File: `src/testing/config/paths.ts`

**Change screenshot path from `.dev/screenshots` to `.dev/reports/screenshots`:**

```typescript
export const PATHS = {
  screenshots: `${DEV_ROOT}/reports/screenshots`,  // CHANGED: was ${DEV_ROOT}/screenshots
  reports: `${DEV_ROOT}/reports`,
  logs: `${DEV_ROOT}/logs`,
} as const;
```

This single change will update ALL references throughout the codebase.

### Phase 2: Simplify Screenshot Paths in HTMLReportGenerator

**Problem**: Current code uses wrong relative path calculation.

**Current code** (`HTMLReportGenerator.ts` line 208):
```typescript
const relativeScreenshotPath = `../${result.filePath}`;
// result.filePath = ".dev/screenshots/banner.png"
// Output: "../.dev/screenshots/banner.png" ❌ WRONG!
```

**Solution**: Since screenshots are now co-located inside reports, path calculation is simpler.

#### File: `src/testing/reporting/HTMLReportGenerator.ts`

**Step 1**: Update `generateReport()` signature:

```typescript
async generateReport(
  summary: TestSummary,
  componentResults: Map<string, ComponentSummary>,
  screenshotDir: string,
  config?: Partial<ReportConfig>,
  screenshotBasePath?: string  // NEW: Relative path to screenshots from HTML location
): Promise<string>
```

**Step 2**: Pass `screenshotBasePath` to helper method:

```typescript
private buildScenarioCard(
  result: EvaluationResult,
  _screenshotDir: string,
  config: ReportConfig,
  screenshotBasePath: string = "screenshots/"  // NEW: Default path relative to report
): string
```

**Step 3**: Update screenshot path calculation (line ~208):

```typescript
// OLD:
const relativeScreenshotPath = `../${result.filePath}`;

// NEW:
const screenshotFilename = path.basename(result.filePath);
const relativeScreenshotPath = `${screenshotBasePath}${screenshotFilename}`;
```

**Step 4**: Update method call to pass screenshotBasePath through:

Find where `buildScenarioCard()` is called (around line 175-180) and add parameter:

```typescript
// In generateReport(), when building scenario cards:
const scenarioCards = results
  .map((result) =>
    this.buildScenarioCard(
      result,
      screenshotDir,
      mergedConfig,
      screenshotBasePath || "screenshots/"  // Pass through
    )
  )
  .join("\n");
```

### Phase 3: Update Pipeline to Copy Screenshots and Generate Correct HTML

#### File: `src/testing/pipeline.ts`

**Step 1**: Import path utilities at top (if not already present):

```typescript
import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
```

**Step 2**: Add screenshot copying helper function (add after `openReportInBrowser()`):

```typescript
/**
 * Copies all files from source directory to target directory
 */
async function copyDirectory(
  sourceDir: string,
  targetDir: string
): Promise<void> {
  await mkdir(targetDir, { recursive: true });
  const files = await readdir(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    await copyFile(sourcePath, targetPath);
  }
}
```

**Step 3**: Update Phase 5 (report generation) - around line 109:

```typescript
// Phase 5: Generate HTML report
logger.phase("📄", "Phase 5: Report Generation");

// Generate LATEST report with screenshots at screenshots/
const latestHtml = await generator.generateReport(
  summary,
  collector.getAllResults(),
  captureResult.outputDir,
  config?.reportConfig,
  "screenshots/"  // NEW: Screenshots are in same directory as report
);

// Generate VERSIONED report with screenshots at screenshots/
const versionedHtml = await generator.generateReport(
  summary,
  collector.getAllResults(),
  captureResult.outputDir,
  config?.reportConfig,
  "screenshots/"  // NEW: Same path - screenshots are always co-located with reports
);
```

**Step 4**: Update Phase 6 (save outputs) - around line 118:

```typescript
// Phase 6: Save outputs (with versioning)
logger.phase("💾", "Phase 6: Save Outputs");
const outputDir = config?.outputDir || DEFAULT_OUTPUT_DIR;

// Initialize ReportManager
const reportManager = new ReportManager({
  baseDir: outputDir,
  keepHistory: config?.keepHistory,
});

// Create new versioned run
const { runId, runDir, latestDir } = await reportManager.createRun(
  config?.runName
);
logger.step(`Run ID: ${runId}`, { completed: true });

// Save to latest (always at root)
const latestReportPath = path.join(latestDir, FILES.reportIndex);
const latestJsonPath = path.join(latestDir, FILES.reportResults);

await generator.saveReport(latestHtml, latestReportPath);
logger.step(`Latest report saved to: ${latestReportPath}`, {
  completed: true,
});

await writeFile(latestJsonPath, collector.exportToJSON(), "utf-8");
logger.step(`Latest JSON saved to: ${latestJsonPath}`, {
  completed: true,
});

// Save to versioned run directory
const versionedReportPath = path.join(runDir, FILES.reportIndex);
const versionedJsonPath = path.join(runDir, FILES.reportResults);

await generator.saveReport(versionedHtml, versionedReportPath);
await writeFile(versionedJsonPath, collector.exportToJSON(), "utf-8");
logger.step(`Versioned report saved to: ${runDir}`, {
  completed: true,
});

// NEW: Copy screenshots to versioned run directory
const versionedScreenshotsDir = path.join(runDir, DIRS.screenshots);
await copyDirectory(captureResult.outputDir, versionedScreenshotsDir);
logger.step(`Screenshots archived to: ${versionedScreenshotsDir}`, {
  completed: true,
});

// ... rest of Phase 6 continues unchanged ...
```

### Phase 4: Update CLI Help Text

#### File: `src/testing/cli.ts`

Update help text (around line 137):

```typescript
Options:
  --skip-capture          Use existing screenshots from .dev/reports/screenshots/
  -o, --output <dir>      Output directory for reports (default: .dev/reports)
  -s, --screenshot-dir <dir>  Screenshot directory (default: .dev/reports/screenshots)
                          Note: Screenshots are automatically archived with each test run
  --strict                Use strict evaluation criteria (checks text, layout, colors)
  ...
```

### Phase 5: Update README Documentation

#### File: `src/testing/README.md`

**Add new section after "Quick Start":**

```markdown
## Directory Structure

### Output Files

```
.dev/
└── reports/
    ├── screenshots/                # Latest screenshots
    │   ├── banner-default.png
    │   └── metadata.json
    ├── index.html                  # Latest report
    ├── results.json                # Latest results
    ├── runs.json                   # Run history manifest
    └── runs/                       # Versioned test runs (self-contained)
        ├── 20250930_195819/
        │   ├── index.html          # Report for this specific run
        │   ├── results.json        # Results for this specific run
        │   └── screenshots/        # Screenshots for this specific run
        │       ├── banner-default.png
        │       └── metadata.json
        └── 20250930_200314/
            ├── index.html
            ├── results.json
            └── screenshots/
                ├── banner-default.png
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
3. **Reporting Phase**:
   - Generates latest report with paths pointing to `screenshots/`
   - Generates versioned report with paths pointing to `screenshots/`
4. **Archival Phase**: Copies screenshots to `.dev/reports/runs/{runId}/screenshots/`

**Result**: Both reports work correctly - both use the same relative path!

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
```

**Update existing "Troubleshooting" section, add:**

```markdown
### Screenshots Not Loading in Reports

**Symptom**: HTML report shows broken image icons instead of screenshots.

**Cause**: Incorrect relative paths (bug in previous version) or viewing old reports.

**Solution**:
1. Ensure you're using the latest version (with co-located screenshots)
2. Run tests to generate new reports:
   ```bash
   bun test
   ```
3. Old reports (before co-location feature) may have broken links - re-run tests to fix

### Old Reports Show Wrong Screenshots

**Symptom**: Viewing an old report but screenshots look different than expected.

**Cause**: In versions before screenshot co-location, all runs shared `.dev/screenshots/` which got overwritten.

**Solution**: Re-run tests to generate new versioned runs with co-located screenshots:
```bash
bun test
```

After this, each run will be self-contained with its own screenshots.
```

## Testing Checklist

### Before Starting

- [ ] Create git tag for rollback: `git tag -a pre-screenshot-colocation -m "Before co-locating screenshots"`
- [ ] Ensure working directory is clean: `git status`

### After Implementation

- [ ] **Code Quality**
  - [ ] Run `bun run check` - all linting and types pass
  - [ ] No TypeScript errors
  - [ ] No unused imports

- [ ] **Basic Functionality**
  - [ ] Run `bun test` - completes without errors
  - [ ] Check directory structure matches expected layout
  - [ ] `.dev/reports/screenshots/` contains latest screenshots
  - [ ] `.dev/reports/runs/{runId}/screenshots/` contains archived screenshots
  - [ ] Both directories have identical files

- [ ] **Latest Report**
  - [ ] Open `.dev/reports/index.html` in browser
  - [ ] All screenshots load correctly (no broken images)
  - [ ] Inspect HTML source - verify paths are `screenshots/banner-default.png`
  - [ ] Inspect browser dev tools - verify images load from correct paths

- [ ] **Versioned Report**
  - [ ] Open `.dev/reports/runs/{runId}/index.html` in browser
  - [ ] All screenshots load correctly
  - [ ] Inspect HTML source - verify paths are `screenshots/banner-default.png`
  - [ ] Screenshots are local to this directory

- [ ] **Multiple Runs**
  - [ ] Run `bun test` again (creates second run with new runId)
  - [ ] Verify new run created with new timestamp
  - [ ] Verify first run's screenshots unchanged
  - [ ] Open first run's report - screenshots still load correctly
  - [ ] Open second run's report - shows different screenshots
  - [ ] Verify both reports are independent and self-contained

- [ ] **Re-evaluation**
  - [ ] Run `bun test --skip-capture`
  - [ ] Uses existing `.dev/reports/screenshots/`
  - [ ] Still creates versioned run with co-located screenshots
  - [ ] New versioned report loads correctly

- [ ] **Run Cleanup**
  - [ ] Create 11+ test runs to trigger cleanup
  - [ ] Verify old runs deleted (default: keeps 10)
  - [ ] Verify old run directories completely removed (including screenshots)
  - [ ] Verify latest screenshots in `.dev/reports/screenshots/` still intact

- [ ] **Named Runs**
  - [ ] Run `bun test --run-name "important-test"`
  - [ ] Create 10+ additional runs
  - [ ] Verify named run preserved during cleanup
  - [ ] Named run's screenshots still intact

## Edge Cases to Test

- [ ] **Empty screenshot directory**: What if `.dev/reports/screenshots/` is empty?
- [ ] **Permission errors**: Can screenshots be copied successfully?
- [ ] **Large screenshots**: Does copying handle multi-MB screenshots?
- [ ] **Special characters in filenames**: Component names with spaces, symbols, etc.

## Success Criteria

✅ **Each versioned run is completely self-contained**
✅ **All screenshots load in both latest and versioned reports**
✅ **Old reports always display their original screenshots (no overwrites)**
✅ **`.dev/reports/screenshots/` serves as working directory for re-evaluation**
✅ **All test artifacts co-located under `.dev/reports/`**
✅ **No breaking changes to existing CLI commands**
✅ **README accurately documents new structure with screenshots**
✅ **HTML reports use correct relative paths (same for both latest and versioned)**
✅ **All tests pass with new structure**

## Performance Considerations

- **Disk space**: Each run stores ~1-5MB of screenshots. With 10 runs: ~10-50MB total (acceptable)
- **Copy time**: ~100ms per run to copy screenshots (negligible)
- **HTML generation**: Generates HTML twice per run but with identical logic (~20ms extra, negligible)

## Rollback Plan

If issues occur:
1. Git tag created: `pre-screenshot-colocation`
2. Rollback command: `git reset --hard pre-screenshot-colocation`
3. Changes isolated to 3 files (`paths.ts`, `pipeline.ts`, `HTMLReportGenerator.ts`) - easy to revert
4. No database migrations or external dependencies

## Important Notes

### Metadata.json Path Handling

The `metadata.json` file contains `filePath` fields with **original capture paths**:
```json
{
  "filePath": ".dev/reports/screenshots/banner-default.png"
}
```

**Do NOT modify these paths** when copying to versioned directories. Keep them as-is because:
- They're historical data (records what actually happened)
- HTML report handles path conversion (not metadata's responsibility)
- Allows re-evaluation with original paths if needed

### Why Generate HTML Twice?

Previously, the pipeline generated HTML once and saved it to both locations. This caused:
- Latest report had **wrong** screenshot paths
- Versioned report had **wrong** screenshot paths

By generating HTML twice with the SAME `screenshotBasePath` value (`"screenshots/"`):
- Latest report gets paths: `screenshots/banner.png` → resolves to `.dev/reports/screenshots/banner.png`
- Versioned report gets paths: `screenshots/banner.png` → resolves to `.dev/reports/runs/{runId}/screenshots/banner.png`

Both use identical HTML (including screenshot paths) - the difference is WHERE they're saved.

### Backward Compatibility

Reports generated before this change will have broken screenshot links because:
1. They reference `.dev/screenshots/` (which no longer exists after path change)
2. They use incorrect relative paths

**Solution**: Users should re-run tests to generate new reports. Old reports can be deleted or archived externally if needed.

---

**Estimated time**: 45-60 minutes

**Complexity**: Low-Medium - Path centralization makes changes simple; main work is updating HTML generator

**Risk**: Very Low - Single path constant change affects entire codebase consistently, easily reversible
