/**
 * Test Pipeline - Orchestrates complete testing workflow
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { AgentService } from "@/services/AgentService";
import { FILES, PATHS } from "@/testing/config/paths";
import { logger } from "@/testing/logger";
import { runCapture } from "./capture";
import {
	Collector,
	type EvaluationCriteria,
	Evaluator,
	type TestSummary,
} from "./evaluation";
import {
	HTMLReportGenerator,
	type ReportConfig,
	ReportManager,
} from "./reporting";
import type { CaptureResult } from "./types";

export type PipelineConfig = {
	screenshotDir?: string;
	outputDir?: string;
	evaluationCriteria?: EvaluationCriteria;
	reportConfig?: Partial<ReportConfig>;
	skipScreenshots?: boolean; // Use existing screenshots
	// History management
	keepHistory?: number; // Number of runs to keep (default: 10)
	runName?: string; // Optional named run (preserved indefinitely)
	skipCleanup?: boolean; // Skip cleanup of old runs
};

export type PipelineResult = {
	success: boolean;
	summary: TestSummary;
	reportPath: string;
	runId?: string; // Timestamp-based run ID
	errors?: Error[];
};

const DEFAULT_SCREENSHOT_DIR = PATHS.screenshots;
const DEFAULT_OUTPUT_DIR = PATHS.reports;
const PASS_RATE_THRESHOLD = 0.9;
const PERCENTAGE_MULTIPLIER = 100;
const MILLISECONDS_TO_SECONDS = 1000;

/**
 * Main pipeline function that orchestrates the complete testing workflow
 */
export async function runPipeline(
	config?: PipelineConfig
): Promise<PipelineResult> {
	const errors: Error[] = [];

	try {
		logger.phase("🚀", "Starting Test Pipeline");

		// Phase 1: Capture or load existing screenshots
		logger.phase("📸", "Phase 1: Screenshot Capture");
		const captureResult = await handleScreenshotPhase(config);
		logger.step(
			`Captured ${captureResult.totalScenarios} screenshots from ${captureResult.totalComponents} components`,
			{ completed: true }
		);

		// Phase 2: Initialize services
		logger.phase("🔧", "Phase 2: Service Initialization");
		const agentService = new AgentService();
		const evaluator = new Evaluator(
			agentService,
			config?.evaluationCriteria
				? { criteria: config.evaluationCriteria }
				: undefined
		);
		const collector = new Collector();
		const generator = new HTMLReportGenerator(config?.reportConfig);
		logger.step("Services initialized", { completed: true });

		// Phase 3: Evaluate all screenshots
		logger.phase("🤖", "Phase 3: AI Evaluation");
		const metadataPath = path.join(captureResult.outputDir, FILES.metadata);
		logger.step(`Evaluating screenshots from: ${captureResult.outputDir}`);

		const results = await evaluator.evaluateBatch(
			metadataPath,
			captureResult.outputDir
		);
		logger.step(`Evaluated ${results.length} screenshots`, {
			completed: true,
		});

		// Phase 4: Collect results
		logger.phase("📊", "Phase 4: Result Collection");
		for (const result of results) {
			collector.addResult(result);
		}
		const summary = collector.getSummary();
		logger.step(
			`Pass Rate: ${(summary.passRate * PERCENTAGE_MULTIPLIER).toFixed(1)}%`,
			{ completed: true }
		);
		logger.step(
			`Average Confidence: ${(summary.averageConfidence * PERCENTAGE_MULTIPLIER).toFixed(1)}%`,
			{ completed: true }
		);

		// Phase 5: Generate HTML report
		logger.phase("📄", "Phase 5: Report Generation");
		const html = await generator.generateReport(
			summary,
			collector.getAllResults(),
			captureResult.outputDir,
			config?.reportConfig
		);

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

		await generator.saveReport(html, latestReportPath);
		logger.step(`Latest report saved to: ${latestReportPath}`, {
			completed: true,
		});

		const { writeFile } = await import("node:fs/promises");
		await writeFile(latestJsonPath, collector.exportToJSON(), "utf-8");
		logger.step(`Latest JSON saved to: ${latestJsonPath}`, {
			completed: true,
		});

		// Save to versioned run directory
		const versionedReportPath = path.join(runDir, FILES.reportIndex);
		const versionedJsonPath = path.join(runDir, FILES.reportResults);

		await generator.saveReport(html, versionedReportPath);
		await writeFile(versionedJsonPath, collector.exportToJSON(), "utf-8");
		logger.step(`Versioned report saved to: ${runDir}`, {
			completed: true,
		});

		// Save run metadata
		await reportManager.saveRunMetadata({
			runId,
			timestamp: Date.now(),
			name: config?.runName,
			totalTests: summary.totalTests,
			passed: summary.passed,
			failed: summary.failed,
			passRate: summary.passRate,
			duration: summary.duration,
		});
		logger.step("Run metadata saved", { completed: true });

		// Cleanup old runs (unless explicitly skipped)
		if (!config?.skipCleanup) {
			await reportManager.cleanupOldRuns();
		}

		// Open report in browser
		logger.phase("🌐", "Phase 7: Opening Report");
		await openReportInBrowser(latestReportPath);
		logger.step("Report opened in browser", { completed: true });

		// Final summary
		const success = summary.passRate >= PASS_RATE_THRESHOLD;
		logger.summary(
			success
				? "✅ Pipeline completed successfully!"
				: "⚠️  Pipeline completed with failures",
			{
				"Tests Passed": `${summary.passed}/${summary.totalTests}`,
				Duration: `${(summary.duration / MILLISECONDS_TO_SECONDS).toFixed(2)}s`,
			}
		);

		return {
			success,
			summary,
			reportPath: latestReportPath,
			runId,
			errors: errors.length > 0 ? errors : undefined,
		};
	} catch (error) {
		logger.error("❌ Pipeline failed:", error);
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
		logger.step("Skipping capture, loading existing screenshots...");
		return loadExistingScreenshots(
			config.screenshotDir || DEFAULT_SCREENSHOT_DIR
		);
	}

	logger.step("Capturing new screenshots...");
	return runCapture();
}

/**
 * Loads existing screenshots and metadata
 */
async function loadExistingScreenshots(
	screenshotDir: string
): Promise<CaptureResult> {
	const metadataPath = path.join(screenshotDir, FILES.metadata);

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

/**
 * Opens the HTML report in the default browser
 */
async function openReportInBrowser(reportPath: string): Promise<void> {
	const { exec } = await import("node:child_process");
	const { promisify } = await import("node:util");
	const execAsync = promisify(exec);

	const platform = process.platform;
	let command: string;

	if (platform === "darwin") {
		// macOS
		command = `open "${reportPath}"`;
	} else if (platform === "win32") {
		// Windows
		command = `start "" "${reportPath}"`;
	} else {
		// Linux
		command = `xdg-open "${reportPath}"`;
	}

	try {
		await execAsync(command);
	} catch (error) {
		logger.warn(
			`Could not open browser automatically: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
