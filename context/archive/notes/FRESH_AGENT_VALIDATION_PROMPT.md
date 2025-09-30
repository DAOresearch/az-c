# Fresh Agent Validation Prompt

Copy and paste this prompt to a fresh Claude Code agent with no context:

---

## Prompt

Hello! I need you to validate that the Visual Test AI Evaluation System is working correctly. This system was just implemented and needs end-to-end testing.

### Background

The system captures terminal UI component screenshots, evaluates them using Claude's multimodal AI, and generates HTML reports with pass/fail verdicts and AI commentary. It's a complete 7-phase pipeline:

1. **Metadata Capture** - Screenshots + metadata
2. **AI Evaluation** - Claude evaluates screenshots
3. **Prompt Engineering** - Structured prompts for evaluation
4. **Result Collection** - Aggregates results
5. **HTML Reports** - Beautiful reports with AI commentary
6. **Pipeline Orchestration** - Ties everything together
7. **CLI Integration** - Easy-to-use commands

### Your Task

Follow the validation guide at `docs/VALIDATION_GUIDE.md` to test the system. Specifically:

#### Step 1: Code Quality Checks ✅
Run these commands and report results:
```bash
bun run typecheck
bun run lint
```

Expected: Both should pass with zero errors.

#### Step 2: Import Resolution
Verify all new modules can be imported:
```bash
bun --eval "import('./src/testing/visualTestPipeline.ts').then(() => console.log('✓ Pipeline OK'))"
bun --eval "import('./src/testing/evaluation/VisualTestEvaluator.ts').then(() => console.log('✓ Evaluator OK'))"
bun --eval "import('./src/testing/reporting/HTMLReportGenerator.ts').then(() => console.log('✓ Generator OK'))"
```

Expected: All imports should resolve successfully.

#### Step 3: Screenshot Capture Test
Run the capture phase:
```bash
bun src/testing/visualTestRunner.ts
```

Then verify:
```bash
test -f screenshots/metadata.json && echo "✓ Metadata exists"
ls -1 screenshots/*.png | wc -l  # Should show number of screenshots
```

Expected: Screenshots directory created with metadata.json and PNG files.

#### Step 4: CLI Help
```bash
bun src/testing/cli/visualTest.ts --help
```

Expected: Help text displays with all options.

#### Step 5: Full Pipeline Test (Skip AI Evaluation for Now)

First, let's test the pipeline structure without API calls. Check that the pipeline file loads:
```bash
bun --eval "import { runVisualTestPipeline } from './src/testing/visualTestPipeline.ts'; console.log('✓ Pipeline exports correctly')"
```

#### Step 6: File Structure Check

Verify all required files exist:
```bash
# Core files
test -f src/testing/types.ts && echo "✓ types.ts"
test -f src/testing/visualTestPipeline.ts && echo "✓ visualTestPipeline.ts"

# Evaluation
test -f src/testing/evaluation/VisualTestEvaluator.ts && echo "✓ VisualTestEvaluator.ts"
test -f src/testing/evaluation/TestResultCollector.ts && echo "✓ TestResultCollector.ts"
test -f src/testing/evaluation/types.ts && echo "✓ evaluation/types.ts"

# Prompts
test -f src/testing/prompts/PromptBuilder.ts && echo "✓ PromptBuilder.ts"
test -f src/testing/prompts/templates.ts && echo "✓ templates.ts"

# Reporting
test -f src/testing/reporting/HTMLReportGenerator.ts && echo "✓ HTMLReportGenerator.ts"

# CLI
test -f src/testing/cli/visualTest.ts && echo "✓ visualTest.ts"

# Check package.json scripts
grep "test:visual" package.json && echo "✓ package.json scripts added"
```

Expected: All files exist and are in the correct locations.

#### Step 7: Read Key Implementation Files

Read and summarize these files to verify they're implemented correctly:

1. `src/testing/visualTestPipeline.ts` - Should orchestrate all 6 phases
2. `src/testing/reporting/HTMLReportGenerator.ts` - Should generate HTML with inline CSS
3. `src/testing/cli/visualTest.ts` - Should parse CLI arguments

Check for:
- ✅ Proper imports (no errors)
- ✅ TypeScript types used correctly
- ✅ Uses `testLogger` instead of `console.log`
- ✅ Error handling present
- ✅ Clear function documentation

#### Step 8: Code Review

Look for any obvious issues:
- Missing error handling
- Hardcoded values that should be constants
- Incorrect type usage
- Missing validation
- Console.log statements (should use testLogger)

### Optional: Full Pipeline Test (Requires API Key)

If you have access to Anthropic API:

```bash
# Capture screenshots first
bun test:visual:capture

# Run full pipeline with lenient evaluation
bun test:visual --skip-capture --lenient

# Check outputs
test -f reports/index.html && echo "✓ HTML report created"
test -f reports/results.json && echo "✓ JSON results created"
```

### Deliverables

Please provide:

1. **Test Results Summary**
   - Which tests passed ✅
   - Which tests failed ❌
   - Any errors encountered

2. **Code Quality Assessment**
   - TypeScript errors: X errors found
   - Linting errors: X errors found
   - Import issues: List any

3. **Implementation Review**
   - Are all 7 phases implemented? (Yes/No)
   - Is the code well-structured? (Yes/No)
   - Are types used correctly? (Yes/No)
   - Is error handling adequate? (Yes/No)

4. **Issues Found**
   - List any bugs, issues, or concerns
   - Rate severity: Critical / High / Medium / Low

5. **Recommendation**
   - ✅ Ready for production
   - ⚠️ Ready with minor fixes
   - ❌ Not ready - needs significant work

### Reference Documentation

- Full validation guide: `docs/VALIDATION_GUIDE.md`
- Implementation report: `docs/IMPLEMENTATION_REPORT.md`
- Original PRD: `docs/PRD_VISUAL_TEST_EVALUATION.md`

### Questions to Answer

1. Do all TypeScript types check out?
2. Does the code pass linting?
3. Can all modules be imported without errors?
4. Do the CLI commands work?
5. Is the file structure correct?
6. Are there any obvious bugs in the implementation?
7. Does the pipeline orchestration make sense?
8. Is the HTML report generator properly implemented?

---

## Quick Validation Script

You can also run this comprehensive check:

```bash
#!/bin/bash
echo "=== Visual Test System Validation ==="
echo ""

echo "1. Type Check..."
bun run typecheck 2>&1 | tail -1

echo ""
echo "2. Lint Check..."
bun run lint 2>&1 | tail -1

echo ""
echo "3. File Structure..."
test -f src/testing/visualTestPipeline.ts && echo "✓ Pipeline" || echo "✗ Pipeline MISSING"
test -f src/testing/evaluation/VisualTestEvaluator.ts && echo "✓ Evaluator" || echo "✗ Evaluator MISSING"
test -f src/testing/reporting/HTMLReportGenerator.ts && echo "✓ Generator" || echo "✗ Generator MISSING"
test -f src/testing/cli/visualTest.ts && echo "✓ CLI" || echo "✗ CLI MISSING"

echo ""
echo "4. Import Check..."
bun --eval "import('./src/testing/visualTestPipeline.ts').then(() => console.log('✓ Imports OK')).catch(e => console.log('✗ Import Error:', e.message))"

echo ""
echo "5. Package Scripts..."
grep -q "test:visual" package.json && echo "✓ Scripts added" || echo "✗ Scripts MISSING"

echo ""
echo "=== Validation Complete ==="
```

Save this as `validate.sh`, make it executable (`chmod +x validate.sh`), and run it (`./validate.sh`).

---

**Start with the quick validation script, then proceed with the detailed tests. Report your findings!**
