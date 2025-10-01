/**
 * Report Generator - Creates static HTML reports for visual tests using DaisyUI
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ComponentSummary, TestSummary } from "../evaluation/Collector";
import type { EvaluationResult } from "../evaluation/types";

export type ReportConfig = {
	title: string;
	includeScreenshots: boolean;
	includeMetadata: boolean;
	includeAICommentary: boolean;
	theme: "light" | "dark";
};

export type GenerateReportOptions = {
	summary: TestSummary;
	componentResults: Map<string, ComponentSummary>;
	screenshotDir: string;
	config?: Partial<ReportConfig>;
	screenshotBasePath?: string;
};

export type IReportGenerator = {
	/**
	 * Generates HTML report from test results
	 */
	generateReport(options: GenerateReportOptions): Promise<string>;

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

export class ReportGenerator implements IReportGenerator {
	private readonly config: ReportConfig;

	constructor(config?: Partial<ReportConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	generateReport(options: GenerateReportOptions): Promise<string> {
		const finalConfig = { ...this.config, ...options.config };
		const components = Array.from(options.componentResults.values());

		return Promise.resolve(
			this.buildHTML(
				options.summary,
				components,
				options.screenshotDir,
				finalConfig,
				options.screenshotBasePath
			)
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
		config: ReportConfig,
		screenshotBasePath = "screenshots/"
	): string {
		const summarySection = this.buildSummarySection(summary);
		const componentSections = components
			.map((comp) =>
				this.buildComponentSection(
					comp,
					screenshotDir,
					config,
					screenshotBasePath
				)
			)
			.join("\n");

		const dataTheme = config.theme === "dark" ? "dark" : "light";

		return `<!DOCTYPE html>
<html lang="en" data-theme="${dataTheme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(config.title)}</title>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-base-100 text-base-content p-4 md:p-6">
  <div class="max-w-screen-xl mx-auto space-y-6">
    <div class="navbar bg-base-200 rounded-box shadow">
      <div class="flex-1">
        <span class="text-xl font-semibold">${this.escapeHtml(config.title)}</span>
      </div>
      <div class="flex-none">
        <span class="badge badge-neutral">Generated ${new Date(summary.timestamp).toLocaleString()}</span>
      </div>
    </div>

    ${summarySection}

    ${componentSections}

    <footer class="footer footer-center text-base-content/70 mt-8">
      <aside>
        <p>Powered by Claude Agent SDK · DaisyUI</p>
      </aside>
    </footer>
  </div>

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

		let passBadge = "badge-error";
		if (summary.passRate >= PASS_RATE_EXCELLENT) {
			passBadge = "badge-success";
		} else if (summary.passRate >= PASS_RATE_GOOD) {
			passBadge = "badge-warning";
		}

		return `
    <div class="stats stats-vertical lg:stats-horizontal w-full shadow bg-base-200 rounded-box">
      <div class="stat">
        <div class="stat-title">Pass Rate</div>
        <div class="stat-value">${passRate}%</div>
        <div class="stat-desc"><span class="badge ${passBadge}">${summary.passed}/${summary.totalTests} passed</span></div>
      </div>

      <div class="stat">
        <div class="stat-title">Avg Confidence</div>
        <div class="stat-value">${avgConfidence}%</div>
        <div class="stat-desc">AI evaluation confidence</div>
      </div>

      <div class="stat">
        <div class="stat-title">Duration</div>
        <div class="stat-value">${duration}s</div>
        <div class="stat-desc">Total execution time</div>
      </div>

      <div class="stat">
        <div class="stat-title">Failed Tests</div>
        <div class="stat-value ${summary.failed > 0 ? "text-error" : ""}">${summary.failed}</div>
        <div class="stat-desc">${summary.failed > 0 ? "Requires attention" : "All tests passed"}</div>
      </div>
    </div>`;
	}

	private buildComponentSection(
		component: ComponentSummary,
		_screenshotDir: string,
		config: ReportConfig,
		screenshotBasePath: string
	): string {
		const passRate = (
			(component.passed / component.scenarios) *
			PERCENTAGE_MULTIPLIER
		).toFixed(0);

		const badgeClass = component.failed === 0 ? "badge-success" : "badge-error";

		const rows = this.buildScenarioTableRows(
			component.componentName,
			component.results,
			config,
			screenshotBasePath
		);

		return `
    <section class="card bg-base-200 border border-base-300">
      <div class="card-body">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-base-300 pb-4">
          <h2 class="card-title">${this.escapeHtml(component.componentName)}</h2>
          <div>
            <span class="badge ${badgeClass}">${component.passed}/${component.scenarios} passed (${passRate}%)</span>
          </div>
        </div>

        <div class="overflow-x-auto mt-4">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Status</th>
                <th>Confidence</th>
                <th class="text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    </section>`;
	}

	private buildScenarioTableRows(
		componentName: string,
		results: EvaluationResult[],
		config: ReportConfig,
		screenshotBasePath: string
	): string {
		const slug = componentName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		return results
			.map((result, idx) => {
				const rowId = `details-${slug}-${idx}`;
				const mainRow = this.buildMainRow(result, rowId, slug);
				const detailsRow = this.buildDetailsRow(
					result,
					rowId,
					slug,
					config,
					screenshotBasePath
				);
				return mainRow + detailsRow;
			})
			.join("\n");
	}

	private buildMainRow(
		result: EvaluationResult,
		rowId: string,
		slug: string
	): string {
		const statusColor = result.passed ? "success" : "error";
		const statusText = result.passed ? "PASSED" : "FAILED";
		const statusIcon = result.passed ? "✓" : "✗";
		const confidence = (result.confidence * PERCENTAGE_MULTIPLIER).toFixed(0);

		return `
              <tr
                class="group hover:bg-base-200/40 cursor-pointer outline outline-0 hover:outline-1 hover:outline-base-300/60 transition-colors"
                data-toggle-target="${rowId}"
                data-accordion-group="${slug}"
                aria-controls="${rowId}"
                aria-expanded="false"
                role="button"
                tabindex="0"
              >
                <td class="whitespace-nowrap">${this.escapeHtml(result.scenarioName)}</td>
                <td class="whitespace-nowrap"><span class="badge badge-${statusColor}">${statusIcon} ${statusText}</span></td>
                <td class="whitespace-nowrap">${confidence}%</td>
                <td class="text-right">
                  <button class="btn btn-sm btn-ghost" data-toggle-target="${rowId}" data-accordion-group="${slug}">Details</button>
                </td>
              </tr>`;
	}

	private buildDetailsRow(
		result: EvaluationResult,
		rowId: string,
		slug: string,
		config: ReportConfig,
		screenshotBasePath: string
	): string {
		const screenshotFilename = path.basename(result.filePath);
		const relativeScreenshotPath = `${screenshotBasePath}${screenshotFilename}`;

		const screenshotHtml = config.includeScreenshots
			? `
                        <figure class="bg-base-100 p-3 rounded-box border border-base-300">
                          <img src="${this.escapeHtml(relativeScreenshotPath)}" alt="${this.escapeHtml(
														result.scenarioName
													)}" class="rounded border border-base-300 max-w-full h-auto" loading="lazy" />
                        </figure>
                        `
			: "";

		const observationsHtml = this.buildObservationsHtml(result);

		return `
              <tr id="${rowId}" class="hidden details-row" data-accordion-group="${slug}">
                <td colspan="4" class="bg-base-100">
                  <div class="collapse collapse-open bg-base-200 border border-base-300 rounded-box">
                    <div class="collapse-title text-md font-medium">Detailed Result</div>
                    <div class="collapse-content">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${screenshotHtml}
                        <div class="space-y-3">
                          <div>
                            <strong>AI Analysis</strong>
                            <p class="opacity-80 mt-1">${this.escapeHtml(result.reasoning)}</p>
                          </div>
                          ${observationsHtml}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>`;
	}

	private buildObservationsHtml(result: EvaluationResult): string {
		const parts: string[] = [];

		if (result.observations.elementsFound.length > 0) {
			parts.push(`
                          <div>
                            <strong>Elements Found</strong>
                            <ul class="list-disc ml-5 mt-1">
                              ${result.observations.elementsFound
																.map((el) => `<li>${this.escapeHtml(el)}</li>`)
																.join("")}
                            </ul>
                          </div>`);
		}

		if (result.observations.textContent.length > 0) {
			parts.push(`
                          <div>
                            <strong>Text Content</strong>
                            <ul class="list-disc ml-5 mt-1">
                              ${result.observations.textContent
																.map((t) => `<li>${this.escapeHtml(t)}</li>`)
																.join("")}
                            </ul>
                          </div>`);
		}

		if (result.observations.layoutDescription) {
			parts.push(`
                          <div>
                            <strong>Layout</strong>
                            <p class="opacity-80 mt-1">${this.escapeHtml(
															result.observations.layoutDescription
														)}</p>
                          </div>`);
		}

		if (result.observations.colorScheme.length > 0) {
			parts.push(`
                          <div>
                            <strong>Color Scheme</strong>
                            <div class="flex flex-wrap gap-2 mt-2">
                              ${result.observations.colorScheme
																.map(
																	(color) =>
																		`<span class="tooltip" data-tip="${this.escapeHtml(
																			color
																		)}"><span class="w-10 h-10 rounded border border-base-300 inline-block" style="background-color: ${this.escapeHtml(
																			color
																		)}"></span></span>`
																)
																.join("")}
                            </div>
                          </div>`);
		}

		if (result.suggestions && result.suggestions.length > 0) {
			parts.push(`
                          <div class="alert alert-warning">
                            <div><span class="font-semibold">Suggestions</span></div>
                          </div>
                          <ul class="list-disc ml-5">
                            ${result.suggestions
															.map((s) => `<li>${this.escapeHtml(s)}</li>`)
															.join("")}
                          </ul>`);
		}

		return parts.join("\n");
	}

	// Removed getStyles; DaisyUI CDN provides styles.

	private getScripts(): string {
		return `
// Interactivity for table accordions (row + button, keyboard-friendly)
document.addEventListener('DOMContentLoaded', () => {
  console.log('Visual Test Report (DaisyUI) loaded');

  function closeGroup(group) {
    document.querySelectorAll('tr.details-row[data-accordion-group="' + group + '"]')
      .forEach((el) => el.classList.add('hidden'));
    document.querySelectorAll('[data-accordion-group="' + group + '"][data-toggle-target]')
      .forEach((el) => el.setAttribute('aria-expanded', 'false'));
  }

  function toggle(el) {
    const targetId = el.getAttribute('data-toggle-target');
    const group = el.getAttribute('data-accordion-group');
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;
    const wasHidden = target.classList.contains('hidden');
    if (group) closeGroup(group);
    if (wasHidden) {
      target.classList.remove('hidden');
      el.setAttribute('aria-expanded', 'true');
    } else {
      target.classList.add('hidden');
      el.setAttribute('aria-expanded', 'false');
    }
  }

  // Rows: toggle on click/Enter/Space but ignore clicks on inner button
  document.querySelectorAll('tr[data-toggle-target]')
    .forEach((row) => {
      row.addEventListener('click', (ev) => {
        var t = ev.target;
        if (t && t.nodeType === 1 && typeof t.closest === 'function' && t.closest('button')) return;
        toggle(row);
      });
      row.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggle(row);
        }
      });
    });

  // Buttons: toggle and stop propagation so the row doesn't also toggle
  document.querySelectorAll('button[data-toggle-target]')
    .forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        toggle(btn);
      });
    });
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
