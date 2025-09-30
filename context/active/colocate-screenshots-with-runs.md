# Task: Co-locate Screenshots with Test Runs

## Problem Statement

Currently, screenshots and reports are stored separately:

```
.dev/
├── screenshots/                    # ❌ Flat, no versioning
│   ├── banner-default.png
│   └── metadata.json
└── reports/
    ├── index.html                  # Latest report
    ├── results.json
    ├── runs.json                   # Manifest
    └── runs/                       # ✅ Versioned runs
        ├── 20250930_195819/
        │   ├── index.html
        │   └── results.json
        └── 20250930_200314/
            ├── index.html
            └── results.json
```

**Issue**: When a new test run captures screenshots, it overwrites `.dev/screenshots/`, causing old versioned reports to reference incorrect/missing screenshots.

## Desired Solution

Co-locate screenshots with their corresponding test runs:

```
.dev/
├── screenshots/                    # Latest (for quick re-evaluation)
│   ├── banner-default.png
│   └── metadata.json
└── reports/
    ├── index.html                  # Latest report
    ├── results.json
    ├── runs.json
    └── runs/
        ├── 20250930_195819/
        │   ├── index.html
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

## Implementation Requirements

### 1. Update Pipeline Flow

**Current flow:**
1. Capture screenshots → `.dev/screenshots/`
2. Evaluate screenshots from `.dev/screenshots/`
3. Generate reports → `.dev/reports/runs/{runId}/`
4. Copy reports to `.dev/reports/` (latest)

**New flow:**
1. Capture screenshots → `.dev/screenshots/` (latest, for quick access)
2. Evaluate screenshots from `.dev/screenshots/`
3. Generate reports → `.dev/reports/runs/{runId}/`
4. **Copy screenshots** → `.dev/reports/runs/{runId}/screenshots/`
5. Copy reports to `.dev/reports/` (latest)

### 2. Files to Modify

#### `src/testing/pipeline.ts`

Add screenshot copying after report generation:

```typescript
// Phase 6: Save Outputs
logger.phase("💾", "Phase 6: Save Outputs");

// ... existing code to create runDir ...

// NEW: Copy screenshots to versioned run directory
const versionedScreenshotsDir = path.join(runDir, "screenshots");
await copyScreenshotsToRun(captureResult.outputDir, versionedScreenshotsDir);
logger.step("Screenshots archived to versioned run", { completed: true });

// ... rest of existing code ...
```

Add helper function:

```typescript
/**
 * Copies screenshots and metadata to versioned run directory
 */
async function copyScreenshotsToRun(
  sourceDir: string,
  targetDir: string
): Promise<void> {
  const { mkdir, readdir, copyFile } = await import("node:fs/promises");

  // Create target directory
  await mkdir(targetDir, { recursive: true });

  // Copy all files from source to target
  const files = await readdir(sourceDir);
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    await copyFile(sourcePath, targetPath);
  }
}
```

#### `src/testing/reporting/HTMLReportGenerator.ts`

Update screenshot path references to be relative to the run directory:

```typescript
// Current (line ~208):
const relativeScreenshotPath = `../${result.filePath}`;

// New: Screenshots are now co-located in same run directory
const screenshotFilename = path.basename(result.filePath);
const relativeScreenshotPath = `screenshots/${screenshotFilename}`;
```

### 3. Update Configuration

Add to `src/testing/config/paths.ts`:

```typescript
export const DIRS = {
  runs: "runs",
  screenshots: "screenshots", // NEW: For co-located screenshots in runs
} as const;
```

### 4. Update CLI Help Text

Update `src/testing/cli.ts` help text to clarify screenshot behavior:

```typescript
  --skip-capture          Use existing screenshots from .dev/screenshots/
  -s, --screenshot-dir <dir>  Screenshot directory (default: .dev/screenshots)
                          Note: Screenshots are automatically archived with each run
```

### 5. Update README

Update `src/testing/README.md` with new structure:

#### Section: "File Structure"

```markdown
## File Structure

### Output Directories

```
.dev/
├── screenshots/                    # Latest screenshots (for quick re-evaluation)
│   ├── banner-default.png
│   └── metadata.json
└── reports/
    ├── index.html                  # Latest report
    ├── results.json                # Latest results
    ├── runs.json                   # Run history manifest
    └── runs/                       # Versioned test runs
        ├── 20250930_195819/        # Each run is self-contained
        │   ├── index.html          # Report for this run
        │   ├── results.json        # Results for this run
        │   └── screenshots/        # Screenshots for this run
        │       ├── banner-default.png
        │       └── metadata.json
        └── 20250930_200314/
            └── ...
```

**Why this structure?**

- **Latest screenshots** (`.dev/screenshots/`) - Quick access for re-evaluation with `--skip-capture`
- **Versioned screenshots** (`.dev/reports/runs/{runId}/screenshots/`) - Preserved with each run so old reports always reference correct screenshots
- **Self-contained runs** - Each run directory contains everything needed to view that specific test session

### Screenshot Management

When you run `bun test`:

1. **Capture phase** saves screenshots to `.dev/screenshots/` (latest)
2. **Evaluation phase** reads from `.dev/screenshots/`
3. **Archival phase** copies screenshots to `.dev/reports/runs/{runId}/screenshots/`

This ensures:
- ✅ Fast re-evaluation with `--skip-capture` (uses latest)
- ✅ Historical runs preserve their original screenshots
- ✅ Reports always reference correct screenshots (relative path: `screenshots/banner.png`)
```

#### Section: "Troubleshooting"

Add new troubleshooting item:

```markdown
### Old Reports Show Wrong Screenshots

If you're viewing an old report and screenshots look different than expected:

**Cause**: You're viewing a report from before screenshot co-location was implemented.

**Solution**: Re-run tests to generate new versioned runs with co-located screenshots:

```bash
bun test  # Creates new run with screenshots included
```

Old reports (before this feature) will reference `.dev/screenshots/` which may have been overwritten by newer runs.
```

## Testing Checklist

After implementing these changes:

- [ ] Run `bun run check` - All linting and types pass
- [ ] Run `bun test` - Creates new run with co-located screenshots
- [ ] Verify directory structure:
  - [ ] `.dev/screenshots/` contains latest screenshots
  - [ ] `.dev/reports/runs/{runId}/screenshots/` contains archived screenshots
  - [ ] Both directories have `metadata.json`
- [ ] Open versioned report at `.dev/reports/runs/{runId}/index.html`
  - [ ] Screenshots load correctly
  - [ ] Inspect HTML - screenshot paths are `screenshots/banner-default.png` (relative)
- [ ] Run `bun test` again (second run)
  - [ ] New run created with new runId
  - [ ] Previous run's screenshots unchanged
  - [ ] Both reports load with correct screenshots
- [ ] Test `--skip-capture` flag:
  ```bash
  bun test --skip-capture
  ```
  - [ ] Uses existing `.dev/screenshots/`
  - [ ] Still archives screenshots to new run directory
- [ ] Check run cleanup (default: keeps 10 runs)
  - [ ] Old run directories deleted (including their screenshots)
  - [ ] Named runs preserved

## Success Criteria

✅ Each versioned run is **completely self-contained**
✅ Old reports always display their original screenshots
✅ `.dev/screenshots/` serves as "working directory" for quick re-evaluation
✅ No breaking changes to existing CLI commands
✅ README accurately documents new structure
✅ All tests pass with new structure

## Notes

- **Disk space**: Each run now stores its own screenshots (typically 1-5MB per run). With default history of 10 runs, this is ~10-50MB total, which is acceptable.
- **Performance**: Copying screenshots adds ~100ms per run (negligible).
- **Backward compatibility**: Old reports (before this change) will continue to reference `.dev/screenshots/`, but users can re-run tests to get new versioned runs.

## Rollback Plan

If issues occur:
1. Git tag created: `pre-screenshot-colocation`
2. Rollback command: `git reset --hard pre-screenshot-colocation`
3. The change is isolated to pipeline.ts and HTMLReportGenerator.ts - easy to revert

---

**Ready to implement?** This task should take approximately 45 minutes.
