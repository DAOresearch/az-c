# PRD: Consolidate Build Artifacts into `.dev/` Directory

**Status:** Draft
**Created:** 2025-09-30
**Priority:** P1 - High
**Effort:** Small (~30 minutes)

---

## Overview

Reorganize all build artifacts, test outputs, and logs into a single `.dev/` directory to keep the project root clean and maintainable.

## Problem Statement

Currently, build artifacts are scattered across the project root:
- `reports/` - Visual test HTML reports
- `screenshots/` - Captured component screenshots
- `*.log` files - Winston log files (combined.log, error.log, test.log)

This creates:
- ❌ Cluttered project root directory
- ❌ Multiple .gitignore entries
- ❌ Harder to clean up test artifacts
- ❌ Poor developer experience

## Proposed Solution

### New Directory Structure

```
project-root/
├── src/
├── context/
└── .dev/                    # All development artifacts
    ├── reports/             # Visual test reports & runs
    ├── screenshots/         # Component screenshots
    └── logs/                # Winston log files
```

### Benefits

✅ **Clean project root** - Single .dev/ folder instead of multiple directories
✅ **Simpler .gitignore** - One entry: `.dev/`
✅ **Easy cleanup** - `rm -rf .dev` removes everything
✅ **Standard practice** - Follows patterns like .next, .cache, .turbo
✅ **Better organization** - Related artifacts grouped together

---

## Technical Specification

### 1. Directory Constants

Create centralized path configuration:

**File:** `src/testing/config/paths.ts` (new file)

```typescript
export const DEV_ROOT = ".dev";

export const PATHS = {
  screenshots: `${DEV_ROOT}/screenshots`,
  reports: `${DEV_ROOT}/reports`,
  logs: `${DEV_ROOT}/logs`,
} as const;

export type PathKey = keyof typeof PATHS;
```

### 2. Files to Update

#### **src/testing/visualTestPipeline.ts**

```typescript
// Before
const DEFAULT_SCREENSHOT_DIR = "screenshots";
const DEFAULT_OUTPUT_DIR = "reports";

// After
import { PATHS } from "./config/paths";

const DEFAULT_SCREENSHOT_DIR = PATHS.screenshots;
const DEFAULT_OUTPUT_DIR = PATHS.reports;
```

#### **src/services/logger.ts**

```typescript
// Before
new winston.transports.File({ filename: "combined.log", level: "info" }),
new winston.transports.File({ filename: "error.log", level: "error" }),

// After
import { PATHS } from "@/testing/config/paths";
import path from "node:path";

new winston.transports.File({
  filename: path.join(PATHS.logs, "combined.log"),
  level: "info"
}),
new winston.transports.File({
  filename: path.join(PATHS.logs, "error.log"),
  level: "error"
}),

// Also update testLogger file transport
new winston.transports.File({
  filename: path.join(PATHS.logs, "test.log"),
  level: "info"
}),
```

#### **src/testing/cli/visualTest.ts**

Update help text examples:

```typescript
Examples:
  # Run complete pipeline
  bun test:visual

  # Skip capture and evaluate existing screenshots
  bun test:visual --skip-capture

  # Use strict evaluation with custom output
  bun test:visual --strict --output ./.dev/my-reports
```

#### **.gitignore**

```gitignore
# Before
screenshots/
reports/

# After
.dev/
```

#### **package.json**

Add cleanup script:

```json
{
  "scripts": {
    "clean:dev": "rm -rf .dev",
    "clean:test": "rm -rf .dev/reports .dev/screenshots"
  }
}
```

### 3. Migration Script

**File:** `scripts/migrate-to-dev.sh` (new file)

```bash
#!/bin/bash
# Migration script to move existing artifacts to .dev/

echo "🔄 Migrating artifacts to .dev/ directory..."

# Create new structure
mkdir -p .dev/{reports,screenshots,logs}

# Move existing directories
if [ -d "reports" ]; then
  echo "  Moving reports/ → .dev/reports/"
  mv reports/* .dev/reports/ 2>/dev/null || true
  rm -rf reports
fi

if [ -d "screenshots" ]; then
  echo "  Moving screenshots/ → .dev/screenshots/"
  mv screenshots/* .dev/screenshots/ 2>/dev/null || true
  rm -rf screenshots
fi

# Move log files
if ls *.log 1> /dev/null 2>&1; then
  echo "  Moving *.log → .dev/logs/"
  mv *.log .dev/logs/ 2>/dev/null || true
fi

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Test pipeline: bun test:visual"
echo "  3. Commit changes: git add -A && git commit"
```

---

## Implementation Plan

### Phase 1: Setup (5 min)
1. ✅ Create PRD document
2. Create `src/testing/config/paths.ts`
3. Create `.dev/` directory structure
4. Create migration script

### Phase 2: Code Updates (15 min)
5. Update `src/testing/visualTestPipeline.ts`
6. Update `src/services/logger.ts`
7. Update `src/testing/cli/visualTest.ts` help text
8. Update `.gitignore`
9. Add cleanup scripts to `package.json`

### Phase 3: Migration & Testing (10 min)
10. Run migration script for existing artifacts
11. Test visual test pipeline: `bun test:visual`
12. Verify logs are written to `.dev/logs/`
13. Verify reports open correctly
14. Run type checking and linting

### Phase 4: Cleanup
14. Remove old empty directories
15. Commit all changes

---

## Testing Checklist

- [ ] `bun test:visual` completes successfully
- [ ] `bun test:visual --skip-capture` works with existing screenshots
- [ ] Reports are saved to `.dev/reports/`
- [ ] Screenshots are saved to `.dev/screenshots/`
- [ ] Logs are written to `.dev/logs/`
- [ ] HTML report links work correctly
- [ ] Run history is preserved in `.dev/reports/runs/`
- [ ] `bun run check` passes (linting + types)
- [ ] Custom output paths still work: `bun test:visual -o custom-dir`

---

## Rollback Plan

If issues occur:

1. **Revert code changes:**
   ```bash
   git restore .
   ```

2. **Move artifacts back:**
   ```bash
   mv .dev/reports/* reports/ 2>/dev/null || true
   mv .dev/screenshots/* screenshots/ 2>/dev/null || true
   mv .dev/logs/*.log . 2>/dev/null || true
   rm -rf .dev
   ```

3. **No data loss** - All artifacts are moved, not deleted

---

## Success Criteria

✅ All build artifacts consolidated in `.dev/`
✅ Project root is clean
✅ All tests pass
✅ Backwards compatible (CLI flags still work)
✅ Zero breaking changes for users
✅ Documentation updated

---

## Future Enhancements

1. **Add .dev/ viewer script**
   ```bash
   bun run dev:info  # Show .dev/ contents and sizes
   ```

2. **Auto-cleanup on CI**
   - Add to CI pipeline to clean .dev/ before tests

3. **Config file support**
   - Allow users to override DEV_ROOT via `.aztec.config.json`

---

## Related Issues

- Fixes: Cluttered project root
- Improves: Developer experience
- Enables: Easier cleanup and maintenance

---

## Questions & Decisions

**Q: Why `.dev/` instead of `.testing/`?**
A: Shorter, more generic (can include other dev artifacts in future)

**Q: Should we support custom .dev location?**
A: Not in v1. CLI flags for reports/screenshots are sufficient.

**Q: What about existing user setups?**
A: Migration script handles one-time move. CLI flags preserve backwards compat.

**Q: Should logs go in .dev too?**
A: Yes - they're development artifacts that shouldn't clutter root.
