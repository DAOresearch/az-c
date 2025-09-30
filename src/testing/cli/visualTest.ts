#!/usr/bin/env bun

/**
 * CLI Entry Point for Visual Test Pipeline
 */

import { testLogger } from "@/services/logger";
import type { PipelineConfig } from "../visualTestPipeline";
import { runVisualTestPipeline } from "../visualTestPipeline";

/**
 * Parse command-line arguments
 */
function parseArgs(): PipelineConfig {
	const args = process.argv.slice(2);
	const config: PipelineConfig = {};
	const processedIndices = new Set<number>();

	for (const [i, arg] of args.entries()) {
		if (processedIndices.has(i)) continue;

		switch (arg) {
			case "--skip-capture":
				config.skipScreenshots = true;
				break;

			case "--output":
			case "-o": {
				const nextIndex = i + 1;
				processedIndices.add(nextIndex);
				config.outputDir = args[nextIndex];
				break;
			}

			case "--screenshot-dir":
			case "-s": {
				const nextIndex = i + 1;
				processedIndices.add(nextIndex);
				config.screenshotDir = args[nextIndex];
				break;
			}

			case "--strict":
				config.evaluationCriteria = {
					strictness: "strict",
					checkTextContent: true,
					checkLayout: true,
					checkColors: true,
				};
				break;

			case "--moderate":
				config.evaluationCriteria = {
					strictness: "moderate",
					checkTextContent: true,
					checkLayout: true,
					checkColors: false,
				};
				break;

			case "--lenient":
				config.evaluationCriteria = {
					strictness: "lenient",
					checkTextContent: true,
					checkLayout: false,
					checkColors: false,
				};
				break;

			case "--theme":
			case "-t": {
				const nextIndex = i + 1;
				processedIndices.add(nextIndex);
				const theme = args[nextIndex] as "light" | "dark";
				config.reportConfig = {
					...config.reportConfig,
					theme,
				};
				break;
			}

			case "--keep-history": {
				const nextIndex = i + 1;
				processedIndices.add(nextIndex);
				const value = args[nextIndex];
				if (value) {
					config.keepHistory = Number.parseInt(value, 10);
				}
				break;
			}

			case "--run-name":
			case "-n": {
				const nextIndex = i + 1;
				processedIndices.add(nextIndex);
				const value = args[nextIndex];
				if (value) {
					config.runName = value;
				}
				break;
			}

			case "--skip-cleanup":
				config.skipCleanup = true;
				break;

			case "--help":
			case "-h":
				printHelp();
				process.exit(0);
				break;

			default:
				if (arg.startsWith("-")) {
					testLogger.warn(`Unknown option: ${arg}`);
				}
				break;
		}
	}

	return config;
}

/**
 * Print CLI help
 */
function printHelp(): void {
	const helpText = `
Visual Test AI Evaluation Pipeline

Usage:
  bun test:visual [options]

Options:
  --skip-capture          Use existing screenshots instead of capturing new ones
  -o, --output <dir>      Output directory for reports (default: reports)
  -s, --screenshot-dir <dir>  Screenshot directory (default: screenshots)
  --strict                Use strict evaluation criteria (checks text, layout, colors)
  --moderate              Use moderate evaluation criteria (checks text, layout)
  --lenient               Use lenient evaluation criteria (checks text only)
  -t, --theme <theme>     Report theme: light or dark (default: dark)
  --keep-history <n>      Number of test runs to keep (default: 10)
  -n, --run-name <name>   Named run (preserved indefinitely)
  --skip-cleanup          Skip cleanup of old runs
  -h, --help              Show this help message

Examples:
  # Run complete pipeline
  bun test:visual

  # Skip capture and evaluate existing screenshots
  bun test:visual --skip-capture

  # Use strict evaluation with custom output
  bun test:visual --strict --output ./my-reports

  # Evaluate with light theme
  bun test:visual --theme light

  # Named run that won't be cleaned up
  bun test:visual --run-name "before-refactor"

  # Keep last 20 runs instead of default 10
  bun test:visual --keep-history 20
`;

	testLogger.info(helpText);
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
	try {
		const config = parseArgs();

		const result = await runVisualTestPipeline(config);

		if (result.success) {
			testLogger.info(
				`\n✅ All tests passed! View report at: ${result.reportPath}`
			);
			process.exit(0);
		}

		testLogger.warn(
			`\n⚠️  Some tests failed. View report at: ${result.reportPath}`
		);
		process.exit(1);
	} catch (error) {
		testLogger.error("Fatal error:", error);
		process.exit(1);
	}
}

// Run CLI
main();
