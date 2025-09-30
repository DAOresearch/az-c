/**
 * Prompt templates for AI evaluation
 */

export const EVALUATION_PROMPT_TEMPLATE = `Evaluate this terminal UI component screenshot.

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
{customRules}

Respond in JSON format:
{
  "passed": boolean,
  "confidence": number,
  "reasoning": string,
  "observations": {
    "elementsFound": string[],
    "textContent": string[],
    "layoutDescription": string,
    "colorScheme": string[]
  },
  "suggestions": string[]
}`;

export const COMPARISON_PROMPT_TEMPLATE = `Compare these two terminal UI component screenshots for regression testing.

Baseline Component: {baselineComponentName}
Baseline Scenario: {baselineScenarioName}
Baseline Expectation: {baselineExpectation}

Current Component: {currentComponentName}
Current Scenario: {currentScenarioName}
Current Expectation: {currentExpectation}

Please analyze both screenshots and identify:
1. Visual differences
2. Layout changes
3. Color scheme variations
4. Text content changes
5. Whether the changes are acceptable or represent regressions

Respond in JSON format:
{
  "isRegression": boolean,
  "confidence": number,
  "differences": string[],
  "reasoning": string,
  "impact": "none" | "minor" | "major" | "critical"
}`;

export const SUMMARY_PROMPT_TEMPLATE = `Summarize these visual test evaluation results.

Total Tests: {totalTests}
Passed: {passed}
Failed: {failed}
Pass Rate: {passRate}%
Average Confidence: {averageConfidence}

Failed Tests:
{failedTests}

Please provide:
1. Overall assessment of the test suite
2. Common failure patterns
3. Critical issues requiring immediate attention
4. Recommendations for improvement

Respond in JSON format:
{
  "overallStatus": "excellent" | "good" | "needs-attention" | "critical",
  "commonPatterns": string[],
  "criticalIssues": string[],
  "recommendations": string[]
}`;
