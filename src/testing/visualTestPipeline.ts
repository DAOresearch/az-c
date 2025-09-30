/**
 * Visual Test Pipeline - Orchestrates complete visual testing workflow
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { AgentService } from "@/services/AgentService";
import { testLogger } from "@/services/logger";
import type { TestSummary } from "./evaluation/TestResultCollector";
import { TestResultCollector } from "./evaluation/TestResultCollector";
import type { EvaluationCriteria } from "./evaluation/types";
import { VisualTestEvaluator } from "./evaluation/VisualTestEvaluator";
import type { ReportConfig } from "./reporting/HTMLReportGenerator";
import { HTMLReportGenerator } from "./reporting/HTMLReportGenerator";
import type { CaptureResult } from "./types";
import { runVisualTests } from "./visualTestRunner";

export type PipelineConfig = {
	screenshotDir?: string;
	outputDir?: string;
	evaluationCriteria?: EvaluationCriteria;
	reportConfig?: Partial<ReportConfig>;
	skipScreenshots?: boolean; // Use existing screenshots
};

export type PipelineResult = {
	success: boolean;
	summary: TestSummary;
	reportPath: string;
	errors?: Error[];
};

const DEFAULT_SCREENSHOT_DIR = "screenshots";
const DEFAULT_OUTPUT_DIR = "reports";
const PASS_RATE_THRESHOLD = 0.9;
const PERCENTAGE_MULTIPLIER = 100;
const MILLISECONDS_TO_SECONDS = 1000;

/**
 * Main pipeline function that orchestrates the complete visual testing workflow
 */
export async function runVisualTestPipeline(
	config?: PipelineConfig
): Promise<PipelineResult> {
	const errors: Error[] = [];

	try {
		testLogger.info("🚀 Starting Visual Test Pipeline...\n");

		// Phase 1: Capture or load existing screenshots
		testLogger.info("📸 Phase 1: Screenshot Capture");
		const captureResult = await handleScreenshotPhase(config);
		testLogger.info(
			`   ✓ Captured ${captureResult.totalScenarios} screenshots from ${captureResult.totalComponents} components\n`
		);

		// Phase 2: Initialize services
		testLogger.info("🔧 Phase 2: Service Initialization");
		const agentService = new AgentService();
		const evaluator = new VisualTestEvaluator(
			agentService,
			config?.evaluationCriteria
				? { criteria: config.evaluationCriteria }
				: undefined
		);
		const collector = new TestResultCollector();
		const generator = new HTMLReportGenerator(config?.reportConfig);
		testLogger.info("   ✓ Services initialized\n");

		// Phase 3: Evaluate all screenshots
		testLogger.info("🤖 Phase 3: AI Evaluation");
		const metadataPath = path.join(captureResult.outputDir, "metadata.json");
		testLogger.info(
			`   Evaluating screenshots from: ${captureResult.outputDir}`
		);

		const results = await evaluator.evaluateBatch(
			metadataPath,
			captureResult.outputDir
		);
		testLogger.info(`   ✓ Evaluated ${results.length} screenshots\n`);

		// Phase 4: Collect results
		testLogger.info("📊 Phase 4: Result Collection");
		for (const result of results) {
			collector.addResult(result);
		}
		const summary = collector.getSummary();
		testLogger.info(
			`   ✓ Pass Rate: ${(summary.passRate * PERCENTAGE_MULTIPLIER).toFixed(1)}%`
		);
		testLogger.info(
			`   ✓ Average Confidence: ${(summary.averageConfidence * PERCENTAGE_MULTIPLIER).toFixed(1)}%\n`
		);

		// Phase 5: Generate HTML report
		testLogger.info("📄 Phase 5: Report Generation");
		const html = await generator.generateReport(
			summary,
			collector.getAllResults(),
			captureResult.outputDir,
			config?.reportConfig
		);

		// Phase 6: Save outputs
		testLogger.info("💾 Phase 6: Save Outputs");
		const outputDir = config?.outputDir || DEFAULT_OUTPUT_DIR;
		const reportPath = path.join(outputDir, "index.html");

		await generator.saveReport(html, reportPath);
		testLogger.info(`   ✓ Report saved to: ${reportPath}`);

		// Save JSON results
		const jsonPath = path.join(outputDir, "results.json");
		const { writeFile } = await import("node:fs/promises");
		await writeFile(jsonPath, collector.exportToJSON(), "utf-8");
		testLogger.info(`   ✓ JSON results saved to: ${jsonPath}\n`);

		// Final summary
		const success = summary.passRate >= PASS_RATE_THRESHOLD;
		testLogger.info(
			success
				? "✅ Pipeline completed successfully!"
				: "⚠️  Pipeline completed with failures"
		);
		testLogger.info(`   Tests Passed: ${summary.passed}/${summary.totalTests}`);
		testLogger.info(
			`   Duration: ${(summary.duration / MILLISECONDS_TO_SECONDS).toFixed(2)}s`
		);

		return {
			success,
			summary,
			reportPath,
			errors: errors.length > 0 ? errors : undefined,
		};
	} catch (error) {
		testLogger.error("❌ Pipeline failed:", error);
		errors.push(error instanceof Error ? error : new Error(String(error)));

		throw error;
	}
}

/**
 * Handles screenshot capture or loading existing screenshots
 */
function handleScreenshotPhase(
	config?: PipelineConfig
): Promise<CaptureResult> {
	if (config?.skipScreenshots) {
		testLogger.info("   Skipping capture, loading existing screenshots...");
		return loadExistingScreenshots(
			config.screenshotDir || DEFAULT_SCREENSHOT_DIR
		);
	}

	testLogger.info("   Capturing new screenshots...");
	return runVisualTests();
}

/**
 * Loads existing screenshots and metadata
 */
async function loadExistingScreenshots(
	screenshotDir: string
): Promise<CaptureResult> {
	const metadataPath = path.join(screenshotDir, "metadata.json");

	try {
		const metadataContent = await readFile(metadataPath, "utf-8");
		const metadata = JSON.parse(metadataContent);

		// If the metadata is already a CaptureResult, return it
		if (metadata.screenshots && metadata.outputDir) {
			return metadata as CaptureResult;
		}

		// Otherwise, construct CaptureResult from metadata array
		const componentNames = new Set(
			metadata.map((m: { componentName: string }) => m.componentName)
		);

		return {
			screenshots: metadata,
			outputDir: screenshotDir,
			captureDate: new Date().toISOString(),
			totalComponents: componentNames.size,
			totalScenarios: metadata.length,
		};
	} catch (error) {
		throw new Error(
			`Failed to load existing screenshots from ${metadataPath}: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
