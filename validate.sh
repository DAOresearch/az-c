#!/bin/bash

# Visual Test AI Evaluation System - Quick Validation Script
# Run this to quickly validate the implementation

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     Visual Test AI Evaluation System - Validation Suite           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

function test_step() {
    echo -n "Testing: $1... "
}

function pass() {
    echo -e "${GREEN}✓ PASS${NC}"
    ((pass_count++))
}

function fail() {
    echo -e "${RED}✗ FAIL${NC}"
    if [ ! -z "$1" ]; then
        echo "  Error: $1"
    fi
    ((fail_count++))
}

function warn() {
    echo -e "${YELLOW}⚠ WARN${NC}"
    if [ ! -z "$1" ]; then
        echo "  Warning: $1"
    fi
}

# Test 1: TypeScript Type Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: TypeScript Type Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Running 'bun run typecheck'"

if bun run typecheck > /tmp/typecheck.log 2>&1; then
    pass
else
    fail "TypeScript errors found. Check /tmp/typecheck.log"
fi
echo ""

# Test 2: Linting
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Code Linting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_step "Running 'bun run lint'"

if bun run lint > /tmp/lint.log 2>&1; then
    pass
else
    fail "Linting errors found. Check /tmp/lint.log"
fi
echo ""

# Test 3: File Structure
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: File Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

files=(
    "src/testing/types.ts:Core types"
    "src/testing/visualTestPipeline.ts:Pipeline orchestrator"
    "src/testing/evaluation/VisualTestEvaluator.ts:AI evaluator"
    "src/testing/evaluation/TestResultCollector.ts:Result collector"
    "src/testing/evaluation/types.ts:Evaluation types"
    "src/testing/prompts/PromptBuilder.ts:Prompt builder"
    "src/testing/prompts/templates.ts:Prompt templates"
    "src/testing/reporting/HTMLReportGenerator.ts:HTML generator"
    "src/testing/cli/visualTest.ts:CLI entry point"
)

for file_info in "${files[@]}"; do
    IFS=':' read -r file desc <<< "$file_info"
    test_step "$desc"
    if [ -f "$file" ]; then
        pass
    else
        fail "File not found: $file"
    fi
done
echo ""

# Test 4: Package.json Scripts
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Package.json Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

scripts=(
    "test:visual"
    "test:visual:capture"
    "test:visual:evaluate"
)

for script in "${scripts[@]}"; do
    test_step "Script '$script'"
    if grep -q "\"$script\"" package.json; then
        pass
    else
        fail "Script not found in package.json"
    fi
done
echo ""

# Test 5: Import Resolution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Module Import Resolution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_step "Pipeline module"
if bun --eval "import('./src/testing/visualTestPipeline.ts').then(() => process.exit(0)).catch(() => process.exit(1))" > /dev/null 2>&1; then
    pass
else
    fail "Cannot import visualTestPipeline.ts"
fi

test_step "Evaluator module"
if bun --eval "import('./src/testing/evaluation/VisualTestEvaluator.ts').then(() => process.exit(0)).catch(() => process.exit(1))" > /dev/null 2>&1; then
    pass
else
    fail "Cannot import VisualTestEvaluator.ts"
fi

test_step "Generator module"
if bun --eval "import('./src/testing/reporting/HTMLReportGenerator.ts').then(() => process.exit(0)).catch(() => process.exit(1))" > /dev/null 2>&1; then
    pass
else
    fail "Cannot import HTMLReportGenerator.ts"
fi

test_step "CLI module"
if bun --eval "import('./src/testing/cli/visualTest.ts').then(() => process.exit(0)).catch(() => process.exit(1))" > /dev/null 2>&1; then
    pass
else
    fail "Cannot import visualTest.ts"
fi
echo ""

# Test 6: CLI Help
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: CLI Functionality"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_step "CLI help command"
if bun src/testing/cli/visualTest.ts --help > /tmp/cli-help.log 2>&1; then
    if grep -q "Visual Test AI Evaluation Pipeline" /tmp/cli-help.log; then
        pass
    else
        fail "Help text doesn't contain expected content"
    fi
else
    fail "CLI --help command failed"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

total=$((pass_count + fail_count))
pass_percent=$((pass_count * 100 / total))

echo "Total Tests: $total"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$fail_count${NC}"
echo "Pass Rate: $pass_percent%"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ALL TESTS PASSED - System is ready for use!                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: bun test:visual:capture  (to capture screenshots)"
    echo "  2. Run: bun test:visual --skip-capture --lenient  (to test evaluation)"
    echo "  3. Open: reports/index.html  (to view the report)"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ SOME TESTS FAILED - Review errors above                         ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Check the log files:"
    echo "  - /tmp/typecheck.log"
    echo "  - /tmp/lint.log"
    echo "  - /tmp/cli-help.log"
    exit 1
fi
