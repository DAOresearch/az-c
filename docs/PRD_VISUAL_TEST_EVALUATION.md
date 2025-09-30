# Product Requirements Document
# Visual Test AI Evaluation System

**Version**: 1.0.0
**Date**: September 30, 2025
**Status**: Draft
**Option Selected**: Batch Evaluation Pipeline

---

## Executive Summary

This PRD defines the requirements for extending the existing visual testing system with AI-powered evaluation capabilities. The system will use the Claude Agent SDK to evaluate component screenshots against defined expectations and generate comprehensive HTML reports with pass/fail verdicts and AI commentary.

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Visual Test AI Evaluation Pipeline              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   Capture    │───▶│   Evaluate   │───▶│   Generate   │         │
│  │ (Existing)   │    │   (New)      │    │   Report     │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│                                                                      │
│  Screenshots/         AI Analysis         HTML Output               │
│  Metadata            Pass/Fail           + Artifacts                │
│                      Commentary                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Components

### Existing Components (No Modification Required)

| Component | Location | Purpose | Key Functions |
|-----------|----------|---------|---------------|
| `visualTestRunner.ts` | `/src/testing/` | Captures screenshots | `runVisualTests()` |
| `screenshot.ts` | `/src/testing/` | Terminal automation | `captureTerminalScreenshot()` |
| `componentHarness.tsx` | `/src/testing/` | Component rendering | `runHarness()` |
| `AgentService.ts` | `/src/services/` | Claude SDK interface | `startQuery()` |
| `*.setup.ts` | `/src/components/*/` | Scenario configs | Config exports |

### New Components Required

| Component | Location | Purpose | Dependencies |
|-----------|----------|---------|--------------|
| `VisualTestEvaluator` | `/src/testing/evaluation/` | AI evaluation orchestration | AgentService |
| `TestResultCollector` | `/src/testing/evaluation/` | Result aggregation | - |
| `HTMLReportGenerator` | `/src/testing/reporting/` | HTML generation | TestResults |
| `EvaluationPrompts` | `/src/testing/prompts/` | AI prompt templates | - |
| `visualTestPipeline.ts` | `/src/testing/` | Main orchestrator | All above |

---

## Phase 1: Data Collection & Metadata Enhancement

### Objective
Enhance screenshot capture to include metadata required for evaluation.

### Requirements

#### 1.1 Screenshot Metadata Structure
```typescript
// Location: src/testing/types.ts (NEW FILE)

export type ScreenshotMetadata = {
  componentName: string;
  scenarioName: string;
  description: string;
  expectation: string;
  params: Record<string, unknown>;
  filePath: string;
  timestamp: number;
  dimensions: {
    width: number;
    height: number;
  };
};

export type CaptureResult = {
  screenshots: ScreenshotMetadata[];
  outputDir: string;
  captureDate: string;
  totalComponents: number;
  totalScenarios: number;
};
```

#### 1.2 Metadata Persistence
```typescript
// Location: src/testing/visualTestRunner.ts (MODIFY)
// Add after line 109 (screenshot capture success)

function saveMetadata(metadata: ScreenshotMetadata[]): void;
// Saves to: screenshots/metadata.json
```

### UML - Phase 1 Data Flow
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Setup      │─────▶│   Runner     │─────▶│  Screenshot  │
│   Files      │      │              │      │   + Meta     │
└──────────────┘      └──────────────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │metadata.json │
                      └──────────────┘
```

### Acceptance Criteria
- [ ] All screenshots have associated metadata
- [ ] Metadata includes all scenario information
- [ ] Metadata persists to `screenshots/metadata.json`

---

## Phase 2: AI Evaluation Service

### Objective
Create service to evaluate screenshots using Claude's multimodal capabilities.

### Requirements

#### 2.1 Evaluation Service Interface
```typescript
// Location: src/testing/evaluation/VisualTestEvaluator.ts (NEW FILE)

export type EvaluationResult = {
  componentName: string;
  scenarioName: string;
  passed: boolean;
  confidence: number;  // 0-1 scale
  reasoning: string;
  observations: {
    elementsFound: string[];
    textContent: string[];
    layoutDescription: string;
    colorScheme: string[];
  };
  suggestions?: string[];
  timestamp: number;
};

export type IVisualTestEvaluator = {
  /**
   * Evaluates a single screenshot against expectations
   * Uses existing AgentService for Claude communication
   */
  evaluateScreenshot(
    metadata: ScreenshotMetadata,
    screenshotPath: string
  ): Promise<EvaluationResult>;

  /**
   * Batch evaluates all screenshots in a directory
   */
  evaluateBatch(
    metadataPath: string,
    screenshotDir: string
  ): Promise<EvaluationResult[]>;

  /**
   * Sets custom evaluation criteria
   */
  setEvaluationCriteria(criteria: EvaluationCriteria): void;
};
```

#### 2.2 Evaluation Criteria
```typescript
// Location: src/testing/evaluation/types.ts (NEW FILE)

export type EvaluationCriteria = {
  strictness: "lenient" | "moderate" | "strict";
  checkTextContent: boolean;
  checkLayout: boolean;
  checkColors: boolean;
  customRules?: string[];
};
```

#### 2.3 Integration with AgentService
```typescript
// Location: src/testing/evaluation/VisualTestEvaluator.ts

class VisualTestEvaluator implements IVisualTestEvaluator {
  constructor(
    private agentService: IAgentService,  // Existing service
    private config?: EvaluationConfig
  ) {}
}
```

### UML - Evaluation Service Architecture
```
┌─────────────────────────────────────────────────┐
│           VisualTestEvaluator                   │
├─────────────────────────────────────────────────┤
│ - agentService: IAgentService                   │
│ - criteria: EvaluationCriteria                  │
│ - promptBuilder: PromptBuilder                  │
├─────────────────────────────────────────────────┤
│ + evaluateScreenshot(): Promise<Result>         │
│ + evaluateBatch(): Promise<Result[]>            │
│ + setEvaluationCriteria(): void                 │
└─────────────────────────────────────────────────┘
                    │ uses
                    ▼
┌─────────────────────────────────────────────────┐
│              AgentService                       │
│         (Existing - No changes)                 │
├─────────────────────────────────────────────────┤
│ + startQuery(): AsyncIterable<SDKMessage>       │
└─────────────────────────────────────────────────┘
```

### Acceptance Criteria
- [ ] Service evaluates single screenshots
- [ ] Service handles batch evaluation
- [ ] Integrates with existing AgentService
- [ ] Returns structured evaluation results

---

## Phase 3: Prompt Engineering System

### Objective
Create reusable, testable prompt templates for consistent AI evaluation.

### Requirements

#### 3.1 Prompt Builder Interface
```typescript
// Location: src/testing/prompts/PromptBuilder.ts (NEW FILE)

export type IPromptBuilder = {
  /**
   * Builds evaluation prompt for a screenshot
   */
  buildEvaluationPrompt(
    metadata: ScreenshotMetadata,
    criteria: EvaluationCriteria
  ): string;

  /**
   * Builds comparison prompt for regression testing
   */
  buildComparisonPrompt(
    baseline: ScreenshotMetadata,
    current: ScreenshotMetadata
  ): string;

  /**
   * Builds summary prompt for multiple results
   */
  buildSummaryPrompt(
    results: EvaluationResult[]
  ): string;
};
```

#### 3.2 Prompt Templates
```typescript
// Location: src/testing/prompts/templates.ts (NEW FILE)

export const EVALUATION_PROMPT_TEMPLATE = `
Evaluate this terminal UI component screenshot.

Component: {componentName}
Scenario: {scenarioName}
Description: {description}
Expected Outcome: {expectation}

Please analyze the screenshot and provide:
1. Whether it matches the expectation (pass/fail)
2. Confidence level (0-1)
3. Detailed reasoning
4. Elements you observed
5. Any suggestions for improvement

Evaluation Criteria:
- Strictness: {strictness}
- Check Text: {checkTextContent}
- Check Layout: {checkLayout}
- Check Colors: {checkColors}
`;
```

### UML - Prompt System Class Diagram
```
┌─────────────────────────────────────────────────┐
│              PromptBuilder                      │
├─────────────────────────────────────────────────┤
│ - templates: Map<string, string>                │
│ - criteria: EvaluationCriteria                  │
├─────────────────────────────────────────────────┤
│ + buildEvaluationPrompt(): string               │
│ + buildComparisonPrompt(): string               │
│ + buildSummaryPrompt(): string                  │
│ - interpolate(template, data): string           │
└─────────────────────────────────────────────────┘
                    ▲
                    │ uses
┌─────────────────────────────────────────────────┐
│           PromptTemplates                       │
├─────────────────────────────────────────────────┤
│ + EVALUATION_PROMPT: string                     │
│ + COMPARISON_PROMPT: string                     │
│ + SUMMARY_PROMPT: string                        │
└─────────────────────────────────────────────────┘
```

### Acceptance Criteria
- [ ] Reusable prompt templates
- [ ] Variable interpolation system
- [ ] Support for different evaluation modes
- [ ] Testable prompt generation

---

## Phase 4: Result Collection & Aggregation

### Objective
Collect and aggregate evaluation results for reporting.

### Requirements

#### 4.1 Result Collector Interface
```typescript
// Location: src/testing/evaluation/TestResultCollector.ts (NEW FILE)

export type TestSummary = {
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  averageConfidence: number;
  duration: number;
  timestamp: number;
};

export type ComponentSummary = {
  componentName: string;
  scenarios: number;
  passed: number;
  failed: number;
  results: EvaluationResult[];
};

export type ITestResultCollector = {
  /**
   * Adds evaluation result to collection
   */
  addResult(result: EvaluationResult): void;

  /**
   * Gets results for specific component
   */
  getComponentResults(componentName: string): ComponentSummary;

  /**
   * Gets overall test summary
   */
  getSummary(): TestSummary;

  /**
   * Gets all results grouped by component
   */
  getAllResults(): Map<string, ComponentSummary>;

  /**
   * Exports results to JSON
   */
  exportToJSON(): string;
};
```

### UML - Result Collection Flow
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Evaluator   │─────▶│   Collector  │─────▶│   Summary    │
│              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
     Result                 │                      │
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐      ┌──────────────┐
                    │  Component   │      │    Test      │
                    │   Summary    │      │   Summary    │
                    └──────────────┘      └──────────────┘
```

### Acceptance Criteria
- [ ] Collects all evaluation results
- [ ] Groups results by component
- [ ] Calculates summary statistics
- [ ] Exports to JSON format

---

## Phase 5: HTML Report Generation

### Objective
Generate comprehensive, static HTML reports with all test results.

### Requirements

#### 5.1 Report Generator Interface
```typescript
// Location: src/testing/reporting/HTMLReportGenerator.ts (NEW FILE)

export type ReportConfig = {
  title: string;
  includeScreenshots: boolean;
  includeMetadata: boolean;
  includeAICommentary: boolean;
  theme: "light" | "dark";
};

export type IHTMLReportGenerator = {
  /**
   * Generates HTML report from test results
   */
  generateReport(
    summary: TestSummary,
    componentResults: Map<string, ComponentSummary>,
    screenshotDir: string,
    config?: ReportConfig
  ): Promise<string>;

  /**
   * Saves report to file
   */
  saveReport(
    html: string,
    outputPath: string
  ): Promise<void>;

  /**
   * Generates report assets (CSS, JS)
   */
  generateAssets(outputDir: string): Promise<void>;
};
```

#### 5.2 Report Structure
```typescript
// Location: src/testing/reporting/templates.ts (NEW FILE)

export const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>{title}</title>
  <style>{styles}</style>
</head>
<body>
  <header>
    <h1>Visual Test Report</h1>
    <div class="summary">
      <span class="pass-rate">{passRate}% Pass</span>
      <span class="total">{total} Tests</span>
    </div>
  </header>

  <main>
    {componentSections}
  </main>

  <script>{scripts}</script>
</body>
</html>
`;

export const COMPONENT_SECTION_TEMPLATE = `
<section class="component">
  <h2>{componentName}</h2>
  <div class="scenarios">
    {scenarioCards}
  </div>
</section>
`;

export const SCENARIO_CARD_TEMPLATE = `
<div class="scenario-card {status}">
  <img src="{screenshotPath}" alt="{scenarioName}">
  <h3>{scenarioName}</h3>
  <div class="verdict">{passed}</div>
  <div class="confidence">Confidence: {confidence}%</div>
  <p class="reasoning">{reasoning}</p>
  <details>
    <summary>AI Observations</summary>
    {observations}
  </details>
</div>
`;
```

### UML - Report Generation Architecture
```
┌─────────────────────────────────────────────────┐
│           HTMLReportGenerator                   │
├─────────────────────────────────────────────────┤
│ - templateEngine: TemplateEngine                │
│ - assetBuilder: AssetBuilder                    │
├─────────────────────────────────────────────────┤
│ + generateReport(): Promise<string>             │
│ + saveReport(): Promise<void>                   │
│ + generateAssets(): Promise<void>               │
│ - renderComponent(): string                     │
│ - renderScenario(): string                      │
└─────────────────────────────────────────────────┘
                    │ uses
                    ▼
┌─────────────────────────────────────────────────┐
│              ReportTemplates                    │
├─────────────────────────────────────────────────┤
│ + HTML_TEMPLATE: string                         │
│ + COMPONENT_TEMPLATE: string                    │
│ + SCENARIO_TEMPLATE: string                     │
└─────────────────────────────────────────────────┘
```

### Acceptance Criteria
- [ ] Generates valid HTML5 document
- [ ] Includes all test results
- [ ] Embeds or links screenshots
- [ ] Responsive design
- [ ] Filterable/searchable results

---

## Phase 6: Pipeline Orchestration

### Objective
Create main orchestrator that ties all components together.

### Requirements

#### 6.1 Pipeline Interface
```typescript
// Location: src/testing/visualTestPipeline.ts (NEW FILE)

export type PipelineConfig = {
  screenshotDir?: string;
  outputDir?: string;
  evaluationCriteria?: EvaluationCriteria;
  reportConfig?: ReportConfig;
  skipScreenshots?: boolean;  // Use existing screenshots
};

export type PipelineResult = {
  success: boolean;
  summary: TestSummary;
  reportPath: string;
  errors?: Error[];
};

export async function runVisualTestPipeline(
  config?: PipelineConfig
): Promise<PipelineResult>;
```

#### 6.2 Pipeline Implementation Structure
```typescript
// Location: src/testing/visualTestPipeline.ts

export async function runVisualTestPipeline(
  config?: PipelineConfig
): Promise<PipelineResult> {
  // Phase 1: Capture (or load existing)
  const captureResult = config?.skipScreenshots
    ? await loadExistingScreenshots(config.screenshotDir)
    : await runVisualTests();

  // Phase 2: Initialize services
  const agentService = new AgentService();
  const evaluator = new VisualTestEvaluator(agentService);
  const collector = new TestResultCollector();

  // Phase 3: Evaluate all screenshots
  const results = await evaluator.evaluateBatch(
    captureResult.metadataPath,
    captureResult.screenshotDir
  );

  // Phase 4: Collect results
  results.forEach(r => collector.addResult(r));

  // Phase 5: Generate report
  const generator = new HTMLReportGenerator();
  const html = await generator.generateReport(
    collector.getSummary(),
    collector.getAllResults(),
    captureResult.screenshotDir
  );

  // Phase 6: Save outputs
  const reportPath = path.join(config?.outputDir || "reports", "index.html");
  await generator.saveReport(html, reportPath);

  return {
    success: collector.getSummary().passRate >= 90,
    summary: collector.getSummary(),
    reportPath,
  };
}
```

### UML - Complete Pipeline Flow
```
┌────────────────────────────────────────────────────────────────┐
│                     Visual Test Pipeline                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  START                                                         │
│    │                                                          │
│    ▼                                                          │
│  ┌──────────────┐                                            │
│  │  Capture     │──────────┐                                 │
│  │ Screenshots  │          │                                 │
│  └──────────────┘          ▼                                 │
│         │            ┌──────────────┐                        │
│         │            │   Metadata   │                        │
│         │            └──────────────┘                        │
│         │                   │                                │
│         ▼                   ▼                                │
│  ┌──────────────────────────────────┐                       │
│  │    VisualTestEvaluator          │                       │
│  │  ┌────────────────────────┐     │                       │
│  │  │   AgentService         │     │                       │
│  │  │  (Claude SDK)          │     │                       │
│  │  └────────────────────────┘     │                       │
│  └──────────────────────────────────┘                       │
│                │                                             │
│                ▼                                             │
│  ┌──────────────────────────────────┐                       │
│  │   TestResultCollector            │                       │
│  │  - Group by component            │                       │
│  │  - Calculate statistics          │                       │
│  └──────────────────────────────────┘                       │
│                │                                             │
│                ▼                                             │
│  ┌──────────────────────────────────┐                       │
│  │   HTMLReportGenerator            │                       │
│  │  - Generate HTML                 │                       │
│  │  - Embed screenshots             │                       │
│  │  - Include AI commentary         │                       │
│  └──────────────────────────────────┘                       │
│                │                                             │
│                ▼                                             │
│           report.html                                        │
│                                                              │
└────────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria
- [ ] Orchestrates complete pipeline
- [ ] Handles errors gracefully
- [ ] Configurable execution
- [ ] Returns comprehensive results

---

## CLI Integration

### Requirements

#### CLI Commands
```bash
# Run complete pipeline
bun test:visual

# Skip screenshot capture (use existing)
bun test:visual --skip-capture

# Custom output directory
bun test:visual --output ./test-reports

# Specific components
bun test:visual --pattern "button/**"

# Set strictness
bun test:visual --strict
```

#### Package.json Scripts
```json
// Location: package.json (MODIFY)
{
  "scripts": {
    "test:visual": "bun src/testing/cli/visualTest.ts",
    "test:visual:capture": "bun src/testing/visualTestRunner.ts",
    "test:visual:evaluate": "bun src/testing/cli/visualTest.ts --skip-capture",
    "test:visual:report": "bun src/testing/cli/visualTest.ts --report-only"
  }
}
```

---

## File Structure Summary

```
src/testing/
├── visualTestRunner.ts        (EXISTING - modify for metadata)
├── screenshot.ts              (EXISTING - no changes)
├── componentHarness.tsx       (EXISTING - no changes)
├── visualTestPipeline.ts      (NEW - main orchestrator)
├── types.ts                   (NEW - shared types)
├── evaluation/
│   ├── VisualTestEvaluator.ts (NEW)
│   ├── TestResultCollector.ts (NEW)
│   └── types.ts              (NEW)
├── prompts/
│   ├── PromptBuilder.ts      (NEW)
│   └── templates.ts          (NEW)
├── reporting/
│   ├── HTMLReportGenerator.ts (NEW)
│   ├── templates.ts          (NEW)
│   └── assets/
│       ├── styles.css        (NEW)
│       └── scripts.js        (NEW)
└── cli/
    └── visualTest.ts         (NEW - CLI entry point)

screenshots/                  (EXISTING - gitignored)
├── *.png                    (screenshots)
└── metadata.json            (NEW - test metadata)

reports/                     (NEW - gitignored)
├── index.html              (generated report)
├── results.json            (raw results)
└── assets/                 (CSS/JS)
```

---

## Success Criteria

### Functional Requirements
- [ ] System captures screenshots with metadata
- [ ] AI evaluates all screenshots against expectations
- [ ] Results are collected and aggregated
- [ ] HTML report is generated with all results
- [ ] Pass/fail verdicts are accurate
- [ ] System handles errors gracefully

### Non-Functional Requirements
- [ ] Evaluation completes within 5 minutes for 50 screenshots
- [ ] HTML report loads in under 2 seconds
- [ ] Report is accessible (WCAG 2.1 AA)
- [ ] System uses existing AgentService without modification
- [ ] All new code follows project conventions

### Quality Metrics
- [ ] 90%+ accuracy in pass/fail determinations
- [ ] Zero false negatives for critical UI elements
- [ ] Detailed reasoning for all failures
- [ ] Actionable suggestions for improvements

---

## Dependencies

### External Dependencies
- Claude Agent SDK (existing)
- OpenTUI (existing)
- React (existing)

### Internal Dependencies
- AgentService (existing, no modifications)
- Logger service (existing)
- Visual test runner (existing, minor modifications)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI evaluation inconsistency | High | Implement confidence thresholds |
| Token usage costs | Medium | Batch evaluations, cache results |
| Screenshot quality issues | Medium | Validate dimensions, retry captures |
| Large report file sizes | Low | Optimize images, lazy loading |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Metadata | 2 hours | None |
| Phase 2: Evaluation Service | 4 hours | Phase 1, AgentService |
| Phase 3: Prompts | 2 hours | None |
| Phase 4: Result Collection | 2 hours | Phase 2 |
| Phase 5: HTML Generation | 3 hours | Phase 4 |
| Phase 6: Pipeline | 2 hours | All phases |
| Testing & Refinement | 3 hours | All phases |
| **Total** | **18 hours** | |

---

## Appendix: Sample Output

### Sample Evaluation Result
```json
{
  "componentName": "banner",
  "scenarioName": "default",
  "passed": true,
  "confidence": 0.95,
  "reasoning": "The screenshot shows 'OpenTUI' in ASCII art font centered on screen with 'What will you build?' text below it in gray, matching the expectation perfectly.",
  "observations": {
    "elementsFound": ["ascii-font", "text"],
    "textContent": ["OpenTUI", "What will you build?"],
    "layoutDescription": "Vertically and horizontally centered content",
    "colorScheme": ["#FFFFFF", "#808080", "#000000"]
  },
  "suggestions": [],
  "timestamp": 1696012800000
}
```

### Sample HTML Report Section
```html
<section class="component">
  <h2>Banner Component</h2>
  <div class="test-summary">
    <span class="badge success">1/1 Passed</span>
    <span class="confidence">95% Confidence</span>
  </div>
  <div class="scenario-card passed">
    <div class="screenshot-container">
      <img src="./screenshots/banner-default.png" alt="Banner default scenario">
    </div>
    <div class="details">
      <h3>Default State</h3>
      <div class="verdict passed">✓ PASSED</div>
      <p class="expectation">
        <strong>Expected:</strong> Shows OpenTUI logo with welcome message
      </p>
      <p class="reasoning">
        <strong>AI Analysis:</strong> The screenshot shows 'OpenTUI' in ASCII art font
        centered on screen with 'What will you build?' text below it in gray,
        matching the expectation perfectly.
      </p>
      <details>
        <summary>Detailed Observations</summary>
        <ul>
          <li>Elements: ascii-font, text</li>
          <li>Text found: "OpenTUI", "What will you build?"</li>
          <li>Layout: Vertically and horizontally centered</li>
          <li>Colors: White text on black background with gray subtitle</li>
        </ul>
      </details>
    </div>
  </div>
</section>
```

---

**END OF PRD**

*This document defines WHAT needs to be built, not HOW to build it. Implementation details should be determined during development while adhering to these requirements and interfaces.*