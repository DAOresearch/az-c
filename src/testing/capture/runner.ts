#!/usr/bin/env bun

import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { logger } from "@/services/logger";
import { FILES, PATHS } from "@/testing/config/paths";
import type {
	CaptureResult,
	ComponentScenario,
	ScenarioAnimationConfig,
	ScreenshotMetadata,
} from "../types";
import { captureTerminal, captureTerminalAnimation } from "./terminal";

const SCREENSHOTS_DIR = PATHS.screenshots;

type ComponentSetup = {
	scenarios: ComponentScenario[];
};

/**
 * Saves screenshot metadata to a JSON file
 */
async function saveMetadata(
	metadata: ScreenshotMetadata[],
	outputDir: string
): Promise<void> {
	const metadataPath = path.join(outputDir, FILES.metadata);
	await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Test runner that discovers component setup files,
 * runs each scenario in a new Terminal window, and captures screenshots.
 */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: needed for claude
async function runCapture(options?: {
	pattern?: string;
}): Promise<CaptureResult> {
	const runnerLogger = logger.child({ name: "CaptureRunner" });

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
		return {
			screenshots: [],
			outputDir: SCREENSHOTS_DIR,
			captureDate: new Date().toISOString(),
			totalComponents: 0,
			totalScenarios: 0,
		};
	}

	runnerLogger.info(`Found ${setupFiles.length} component(s) to test`);

	let totalScenarios = 0;
	let successCount = 0;
	let failureCount = 0;
	const allMetadata: ScreenshotMetadata[] = [];

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
			const scenarioSlug = scenario.scenarioName
				.toLowerCase()
				.replace(/\s+/g, "-");
			const baseFilename = `${componentName}-${scenarioSlug}`;
			const screenshotPath = path.join(SCREENSHOTS_DIR, `${baseFilename}.png`);

			runnerLogger.info(`  Running: ${scenario.scenarioName}`);

			try {
				const width = Number.parseInt(process.env.TERMINAL_WIDTH || "900", 10);
				const height = Number.parseInt(
					process.env.TERMINAL_HEIGHT || "600",
					10
				);
				const settleMs = Number.parseInt(
					process.env.SCREENSHOT_DELAY || "2000",
					10
				);

				const animationConfig: ScenarioAnimationConfig | undefined =
					scenario.animation;

				if (
					animationConfig &&
					Number.isFinite(animationConfig.duration) &&
					animationConfig.screenshots > 0
				) {
					await captureTerminalAnimation({
						cmd: `SCENARIO_INDEX=${i} bun ${specFile}`,
						out: `${path.join(SCREENSHOTS_DIR, `${baseFilename}_frame_0.png`)}`,
						width,
						height,
						settleMs,
						baseFilename: path.join(SCREENSHOTS_DIR, baseFilename),
						animation: animationConfig,
					});

					for (
						let frameIndex = 0;
						frameIndex < animationConfig.screenshots;
						frameIndex++
					) {
						const framePath = path.join(
							SCREENSHOTS_DIR,
							`${baseFilename}_frame_${frameIndex}.png`
						);
						const stats = await fs.stat(framePath);

						const metadata: ScreenshotMetadata = {
							componentName,
							scenarioName: scenario.scenarioName,
							description: scenario.description,
							expectation: scenario.expectation,
							params: scenario.params,
							filePath: framePath,
							timestamp: stats.mtime.getTime(),
							dimensions: { width, height },
							animation: {
								duration: animationConfig.duration,
								frameCount: animationConfig.screenshots,
								frameIndex,
								timestamp:
									(animationConfig.duration /
										Math.max(animationConfig.screenshots - 1, 1)) *
									frameIndex,
							},
						};

						allMetadata.push(metadata);
					}

					runnerLogger.info(
						`  ✓ Captured animation frames: ${animationConfig.screenshots}`
					);
				} else {
					await captureTerminal({
						cmd: `SCENARIO_INDEX=${i} bun ${specFile}`,
						out: screenshotPath,
						width,
						height,
						settleMs,
					});

					const stats = await fs.stat(screenshotPath);

					const metadata: ScreenshotMetadata = {
						componentName,
						scenarioName: scenario.scenarioName,
						description: scenario.description,
						expectation: scenario.expectation,
						params: scenario.params,
						filePath: screenshotPath,
						timestamp: stats.mtime.getTime(),
						dimensions: { width, height },
					};

					allMetadata.push(metadata);

					runnerLogger.info(`  ✓ Screenshot saved: ${baseFilename}.png`);
				}

				successCount++;
			} catch (error) {
				runnerLogger.error(`  ✗ Failed: ${scenario.scenarioName}`, error);
				failureCount++;
			}
		}
	}

	// Save metadata
	await saveMetadata(allMetadata, SCREENSHOTS_DIR);

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
	runnerLogger.info(`  Metadata saved: ${SCREENSHOTS_DIR}/metadata.json`);
	runnerLogger.info("─".repeat(REPEAT_COUNT));

	if (failureCount > 0) {
		process.exit(1);
	}

	// Return capture result
	const captureDate = new Date().toISOString();
	return {
		screenshots: allMetadata,
		outputDir: SCREENSHOTS_DIR,
		captureDate,
		totalComponents: setupFiles.length,
		totalScenarios,
	};
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);
	const patternIndex = args.indexOf("--pattern");
	const pattern = patternIndex >= 0 ? args[patternIndex + 1] : undefined;

	runCapture({ pattern }).catch((err) => {
		logger.error("Test runner failed", err);
		process.exit(1);
	});
}

export { runCapture };
