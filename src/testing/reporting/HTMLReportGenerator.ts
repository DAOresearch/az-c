/**
 * HTML Report Generator - Creates static HTML reports for visual tests
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
	ComponentSummary,
	TestSummary,
} from "../evaluation/TestResultCollector";
import type { EvaluationResult } from "../evaluation/types";

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
		config?: Partial<ReportConfig>
	): Promise<string>;

	/**
	 * Saves report to file
	 */
	saveReport(html: string, outputPath: string): Promise<void>;

	/**
	 * Generates report assets (CSS, JS) - for future use
	 */
	generateAssets(outputDir: string): Promise<void>;
};

const DEFAULT_CONFIG: ReportConfig = {
	title: "Visual Test Report",
	includeScreenshots: true,
	includeMetadata: true,
	includeAICommentary: true,
	theme: "dark",
};

const PERCENTAGE_MULTIPLIER = 100;
const MILLISECONDS_TO_SECONDS = 1000;
const PASS_RATE_EXCELLENT = 0.9;
const PASS_RATE_GOOD = 0.7;

export class HTMLReportGenerator implements IHTMLReportGenerator {
	private readonly config: ReportConfig;

	constructor(config?: Partial<ReportConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	generateReport(
		summary: TestSummary,
		componentResults: Map<string, ComponentSummary>,
		screenshotDir: string,
		config?: Partial<ReportConfig>
	): Promise<string> {
		const finalConfig = { ...this.config, ...config };
		const components = Array.from(componentResults.values());

		return Promise.resolve(
			this.buildHTML(summary, components, screenshotDir, finalConfig)
		);
	}

	async saveReport(html: string, outputPath: string): Promise<void> {
		const dir = path.dirname(outputPath);
		await mkdir(dir, { recursive: true });
		await writeFile(outputPath, html, "utf-8");
	}

	async generateAssets(outputDir: string): Promise<void> {
		// Future: Generate separate CSS/JS files
		await mkdir(outputDir, { recursive: true });
	}

	private buildHTML(
		summary: TestSummary,
		components: ComponentSummary[],
		screenshotDir: string,
		config: ReportConfig
	): string {
		const styles = this.getStyles(config.theme);
		const summarySection = this.buildSummarySection(summary);
		const componentSections = components
			.map((comp) => this.buildComponentSection(comp, screenshotDir, config))
			.join("\n");

		return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(config.title)}</title>
  <style>${styles}</style>
</head>
<body>
  <header>
    <h1>${this.escapeHtml(config.title)}</h1>
    ${summarySection}
  </header>

  <main>
    ${componentSections}
  </main>

  <footer>
    <p>Generated on ${new Date(summary.timestamp).toLocaleString()}</p>
    <p>Powered by Claude Agent SDK</p>
  </footer>

  <script>${this.getScripts()}</script>
</body>
</html>`;
	}

	private buildSummarySection(summary: TestSummary): string {
		const passRate = (summary.passRate * PERCENTAGE_MULTIPLIER).toFixed(1);
		const avgConfidence = (
			summary.averageConfidence * PERCENTAGE_MULTIPLIER
		).toFixed(1);
		const duration = (summary.duration / MILLISECONDS_TO_SECONDS).toFixed(2);

		let summaryCardClass = "error";
		if (summary.passRate >= PASS_RATE_EXCELLENT) {
			summaryCardClass = "success";
		} else if (summary.passRate >= PASS_RATE_GOOD) {
			summaryCardClass = "warning";
		}

		return `
    <div class="summary">
      <div class="summary-card ${summaryCardClass}">
        <div class="summary-title">Pass Rate</div>
        <div class="summary-value">${passRate}%</div>
        <div class="summary-detail">${summary.passed}/${summary.totalTests} tests passed</div>
      </div>

      <div class="summary-card">
        <div class="summary-title">Average Confidence</div>
        <div class="summary-value">${avgConfidence}%</div>
        <div class="summary-detail">AI evaluation confidence</div>
      </div>

      <div class="summary-card">
        <div class="summary-title">Duration</div>
        <div class="summary-value">${duration}s</div>
        <div class="summary-detail">Total execution time</div>
      </div>

      <div class="summary-card ${summary.failed > 0 ? "error" : ""}">
        <div class="summary-title">Failed Tests</div>
        <div class="summary-value">${summary.failed}</div>
        <div class="summary-detail">${summary.failed > 0 ? "Requires attention" : "All tests passed"}</div>
      </div>
    </div>`;
	}

	private buildComponentSection(
		component: ComponentSummary,
		screenshotDir: string,
		config: ReportConfig
	): string {
		const scenarioCards = component.results
			.map((result) => this.buildScenarioCard(result, screenshotDir, config))
			.join("\n");

		const passRate = (
			(component.passed / component.scenarios) *
			PERCENTAGE_MULTIPLIER
		).toFixed(0);

		return `
    <section class="component-section">
      <div class="component-header">
        <h2>${this.escapeHtml(component.componentName)}</h2>
        <div class="component-stats">
          <span class="badge ${component.failed === 0 ? "badge-success" : "badge-error"}">
            ${component.passed}/${component.scenarios} passed (${passRate}%)
          </span>
        </div>
      </div>

      <div class="scenarios">
        ${scenarioCards}
      </div>
    </section>`;
	}

	private buildScenarioCard(
		result: EvaluationResult,
		_screenshotDir: string,
		config: ReportConfig
	): string {
		const statusClass = result.passed ? "passed" : "failed";
		const statusIcon = result.passed ? "✓" : "✗";
		const confidence = (result.confidence * PERCENTAGE_MULTIPLIER).toFixed(0);

		// Get screenshot path from result
		const relativeScreenshotPath = `../${result.filePath}`;

		return `
      <div class="scenario-card ${statusClass}">
        ${
					config.includeScreenshots
						? `
          <div class="screenshot-container">
            <img src="${this.escapeHtml(relativeScreenshotPath)}"
                 alt="${this.escapeHtml(result.scenarioName)}"
                 loading="lazy">
          </div>
        `
						: ""
				}

        <div class="scenario-details">
          <div class="scenario-header">
            <h3>${this.escapeHtml(result.scenarioName)}</h3>
            <div class="verdict ${statusClass}">
              ${statusIcon} ${result.passed ? "PASSED" : "FAILED"}
            </div>
          </div>

          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidence}%"></div>
            <span class="confidence-text">Confidence: ${confidence}%</span>
          </div>

          <div class="reasoning">
            <strong>AI Analysis:</strong>
            <p>${this.escapeHtml(result.reasoning)}</p>
          </div>

          ${
						config.includeAICommentary
							? `
            <details class="observations">
              <summary>Detailed Observations</summary>
              <div class="observations-content">
                ${
									result.observations.elementsFound.length > 0
										? `
                  <div class="observation-group">
                    <strong>Elements Found:</strong>
                    <ul>
                      ${result.observations.elementsFound.map((el) => `<li>${this.escapeHtml(el)}</li>`).join("")}
                    </ul>
                  </div>
                `
										: ""
								}

                ${
									result.observations.textContent.length > 0
										? `
                  <div class="observation-group">
                    <strong>Text Content:</strong>
                    <ul>
                      ${result.observations.textContent.map((text) => `<li>${this.escapeHtml(text)}</li>`).join("")}
                    </ul>
                  </div>
                `
										: ""
								}

                ${
									result.observations.layoutDescription
										? `
                  <div class="observation-group">
                    <strong>Layout:</strong>
                    <p>${this.escapeHtml(result.observations.layoutDescription)}</p>
                  </div>
                `
										: ""
								}

                ${
									result.observations.colorScheme.length > 0
										? `
                  <div class="observation-group">
                    <strong>Color Scheme:</strong>
                    <div class="color-chips">
                      ${result.observations.colorScheme
												.map(
													(color) =>
														`<span class="color-chip" style="background-color: ${this.escapeHtml(color)}" title="${this.escapeHtml(color)}"></span>`
												)
												.join("")}
                    </div>
                  </div>
                `
										: ""
								}
              </div>
            </details>
          `
							: ""
					}

          ${
						result.suggestions && result.suggestions.length > 0
							? `
            <div class="suggestions">
              <strong>Suggestions:</strong>
              <ul>
                ${result.suggestions.map((s) => `<li>${this.escapeHtml(s)}</li>`).join("")}
              </ul>
            </div>
          `
							: ""
					}
        </div>
      </div>`;
	}

	private getStyles(theme: "light" | "dark"): string {
		const colors =
			theme === "dark"
				? {
						bg: "#1a1a1a",
						bgSecondary: "#2a2a2a",
						text: "#e0e0e0",
						textSecondary: "#a0a0a0",
						border: "#404040",
						success: "#4ade80",
						successBg: "#1a3a1a",
						error: "#f87171",
						errorBg: "#3a1a1a",
						warning: "#fbbf24",
						warningBg: "#3a2a1a",
						cardBg: "#252525",
					}
				: {
						bg: "#ffffff",
						bgSecondary: "#f5f5f5",
						text: "#1a1a1a",
						textSecondary: "#666666",
						border: "#e0e0e0",
						success: "#22c55e",
						successBg: "#f0fdf4",
						error: "#ef4444",
						errorBg: "#fef2f2",
						warning: "#f59e0b",
						warningBg: "#fffbeb",
						cardBg: "#ffffff",
					};

		return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: ${colors.bg};
  color: ${colors.text};
  line-height: 1.6;
  padding: 2rem;
}

header {
  max-width: 1200px;
  margin: 0 auto 3rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: ${colors.cardBg};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.summary-card.success {
  border-color: ${colors.success};
  background: ${colors.successBg};
}

.summary-card.error {
  border-color: ${colors.error};
  background: ${colors.errorBg};
}

.summary-card.warning {
  border-color: ${colors.warning};
  background: ${colors.warningBg};
}

.summary-title {
  font-size: 0.875rem;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.summary-detail {
  font-size: 0.875rem;
  color: ${colors.textSecondary};
}

main {
  max-width: 1200px;
  margin: 0 auto;
}

.component-section {
  background: ${colors.cardBg};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${colors.border};
}

.component-header h2 {
  font-size: 1.75rem;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-success {
  background: ${colors.successBg};
  color: ${colors.success};
  border: 1px solid ${colors.success};
}

.badge-error {
  background: ${colors.errorBg};
  color: ${colors.error};
  border: 1px solid ${colors.error};
}

.scenarios {
  display: grid;
  gap: 2rem;
}

.scenario-card {
  border: 2px solid ${colors.border};
  border-radius: 8px;
  overflow: hidden;
  background: ${colors.bgSecondary};
}

.scenario-card.passed {
  border-color: ${colors.success};
}

.scenario-card.failed {
  border-color: ${colors.error};
}

.screenshot-container {
  background: ${colors.bg};
  padding: 1rem;
  text-align: center;
}

.screenshot-container img {
  max-width: 100%;
  height: auto;
  border: 1px solid ${colors.border};
  border-radius: 4px;
}

.scenario-details {
  padding: 1.5rem;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.scenario-header h3 {
  font-size: 1.25rem;
}

.verdict {
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.verdict.passed {
  background: ${colors.successBg};
  color: ${colors.success};
}

.verdict.failed {
  background: ${colors.errorBg};
  color: ${colors.error};
}

.confidence-bar {
  position: relative;
  height: 32px;
  background: ${colors.border};
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, ${colors.success}, #10b981);
  transition: width 0.3s ease;
}

.confidence-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.text};
  mix-blend-mode: difference;
}

.reasoning {
  margin-bottom: 1rem;
}

.reasoning p {
  margin-top: 0.5rem;
  color: ${colors.textSecondary};
}

.observations {
  margin-top: 1rem;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  padding: 0;
}

.observations summary {
  padding: 1rem;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
  background: ${colors.bgSecondary};
}

.observations summary:hover {
  background: ${colors.border};
}

.observations-content {
  padding: 1rem;
}

.observation-group {
  margin-bottom: 1rem;
}

.observation-group:last-child {
  margin-bottom: 0;
}

.observation-group ul {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
}

.observation-group li {
  margin-bottom: 0.25rem;
}

.color-chips {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.color-chip {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid ${colors.border};
  cursor: help;
}

.suggestions {
  margin-top: 1rem;
  padding: 1rem;
  background: ${colors.warningBg};
  border: 1px solid ${colors.warning};
  border-radius: 4px;
}

.suggestions ul {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
}

footer {
  max-width: 1200px;
  margin: 3rem auto 0;
  text-align: center;
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  padding-top: 2rem;
  border-top: 1px solid ${colors.border};
}

footer p {
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  body {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .summary {
    grid-template-columns: 1fr;
  }

  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .scenario-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}`;
	}

	private getScripts(): string {
		return `
// Add interactive features
document.addEventListener('DOMContentLoaded', () => {
  // Add filter functionality (future enhancement)
  console.log('Visual Test Report loaded');

  // Add search functionality (future enhancement)
  // Add sorting functionality (future enhancement)
});`;
	}

	private escapeHtml(text: string): string {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return text.replace(/[&<>"']/g, (char) => map[char] || char);
	}
}
