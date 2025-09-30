#!/usr/bin/env bun

import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { logger } from "@/services/logger";
import { captureTerminalScreenshot } from "./screenshot";

const SCREENSHOTS_DIR = "screenshots";

type ComponentSetup = {
	scenarios: Array<{
		scenarioName: string;
		description: string;
		expectation: string;
		params: Record<string, unknown>;
	}>;
};

/**
 * Visual test runner that discovers component setup files,
 * runs each scenario in a new Terminal window, and captures screenshots.
 */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: needed for claude
async function runVisualTests(options?: { pattern?: string }) {
	const runnerLogger = logger.child({ name: "VisualTestRunner" });

	// Ensure screenshots directory exists
	await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

	// Find all component setup files
	const pattern = options?.pattern || "src/components/**/*.setup.ts";
	const setupFiles = await glob(pattern, {
		cwd: process.cwd(),
		absolute: true,
	});

	if (setupFiles.length === 0) {
		runnerLogger.warn(`No setup files found matching ${pattern}`);
		return;
	}

	runnerLogger.info(`Found ${setupFiles.length} component(s) to test`);

	let totalScenarios = 0;
	let successCount = 0;
	let failureCount = 0;

	// Process each component
	for (const setupFile of setupFiles) {
		// Derive spec file path from setup file
		const specFile = setupFile.replace(".setup.ts", ".spec.tsx");
		const componentDir = path.dirname(setupFile);
		const componentName = path.basename(componentDir);

		// Check if spec file exists
		try {
			await fs.access(specFile);
		} catch {
			runnerLogger.warn(`No spec file found for ${componentName}, skipping`);
			continue;
		}

		// Import the setup file to get scenarios
		let config: ComponentSetup;
		try {
			const module = await import(setupFile);
			config = module.default;
		} catch (error) {
			runnerLogger.error(`Failed to import setup for ${componentName}`, error);
			continue;
		}

		if (!config.scenarios || config.scenarios.length === 0) {
			runnerLogger.warn(`No scenarios defined for ${componentName}`);
			continue;
		}

		runnerLogger.info(
			`Testing ${componentName} (${config.scenarios.length} scenarios)`
		);

		// Run each scenario
		for (let i = 0; i < config.scenarios.length; i++) {
			const scenario = config.scenarios[i];
			if (!scenario) {
				runnerLogger.error(`No scenario found for ${componentName}`);
				continue;
			}
			totalScenarios++;

			// Generate screenshot filename
			const screenshotName = `${componentName}-${scenario.scenarioName
				.toLowerCase()
				.replace(/\s+/g, "-")}.png`;
			const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);

			runnerLogger.info(`  Running: ${scenario.scenarioName}`);

			try {
				// Run the spec file with the scenario index
				await captureTerminalScreenshot({
					cmd: `SCENARIO_INDEX=${i} bun ${specFile}`,
					out: screenshotPath,
					width: Number.parseInt(process.env.TERMINAL_WIDTH || "900", 10),
					height: Number.parseInt(process.env.TERMINAL_HEIGHT || "600", 10),
					settleMs: Number.parseInt(process.env.SCREENSHOT_DELAY || "2000", 10),
				});

				runnerLogger.info(`  ✓ Screenshot saved: ${screenshotName}`);
				successCount++;
			} catch (error) {
				runnerLogger.error(`  ✗ Failed: ${scenario.scenarioName}`, error);
				failureCount++;
			}
		}
	}

	// Summary
	const REPEAT_COUNT = 50;
	runnerLogger.info("─".repeat(REPEAT_COUNT));
	runnerLogger.info("Test Summary:");
	runnerLogger.info("─".repeat(REPEAT_COUNT));
	runnerLogger.info(`  Total scenarios: ${totalScenarios}`);
	runnerLogger.info(`  Successful: ${successCount}`);
	runnerLogger.info("─".repeat(REPEAT_COUNT));
	runnerLogger.info(`  Failed: ${failureCount}`);
	runnerLogger.info("─".repeat(REPEAT_COUNT));
	runnerLogger.info(`  Screenshots saved in: ${SCREENSHOTS_DIR}/`);
	runnerLogger.info("─".repeat(REPEAT_COUNT));

	if (failureCount > 0) {
		process.exit(1);
	}
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);
	const patternIndex = args.indexOf("--pattern");
	const pattern = patternIndex >= 0 ? args[patternIndex + 1] : undefined;

	runVisualTests({ pattern }).catch((err) => {
		logger.error("Visual test runner failed", err);
		process.exit(1);
	});
}

export { runVisualTests };
