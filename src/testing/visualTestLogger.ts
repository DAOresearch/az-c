/**
 * Visual Test Logger - Clean console output for visual testing pipeline
 * Uses Winston for structured logging with beautiful formatting
 */

import chalk from "chalk";
import winston from "winston";

// Constants for magic numbers
const TIME_STRING_END = 8;
const PERCENTAGE_MULTIPLIER = 100;
const SINGLE_DECIMAL = 1;
const PROGRESS_BAR_LENGTH = 20;
const DIVIDER_LENGTH = 40;
const INDENT_LEVEL_ONE = 1;
const DEFAULT_INDENT = 0;

// Type definitions for better type safety
type PhaseData = {
	emoji?: string;
	title: string;
};

type StepData = {
	message: string;
	completed?: boolean;
	failed?: boolean;
};

type TestData = {
	name: string;
	passed: boolean;
	confidence?: number;
};

type ProgressData = {
	current: number;
	total: number;
	message: string;
};

type StatsData = {
	title?: string;
	[key: string]: unknown;
};

type LogInfo = {
	level: string;
	message: string;
	timestamp?: string;
	phase?: PhaseData;
	step?: StepData;
	test?: TestData;
	progress?: ProgressData;
	stats?: StatsData;
	indent?: number;
};

// Helper functions extracted to reduce complexity
const formatTime = (timestamp?: string): string => {
	if (!timestamp) return "";
	const date = new Date(timestamp);
	return chalk.gray(`[${date.toTimeString().slice(0, TIME_STRING_END)}]`);
};

const createIndent = (depth: number): string => "  ".repeat(depth);

const formatPhase = (phase: PhaseData, timestamp?: string): string => {
	const emoji = phase.emoji || "📌";
	const title = chalk.bold(phase.title);
	return `\n${formatTime(timestamp)} ${emoji} ${title}`;
};

const formatStep = (step: StepData): string => {
	let prefix = chalk.cyan("➜");
	if (step.completed) {
		prefix = chalk.green("✓");
	} else if (step.failed) {
		prefix = chalk.red("✗");
	}
	return `${createIndent(INDENT_LEVEL_ONE)}${prefix} ${step.message}`;
};

const formatTest = (test: TestData): string => {
	const status = test.passed
		? chalk.bgGreen.black(" PASS ")
		: chalk.bgRed.white(" FAIL ");
	const confidence = test.confidence
		? chalk.gray(
				` (${(test.confidence * PERCENTAGE_MULTIPLIER).toFixed(SINGLE_DECIMAL)}% confidence)`
			)
		: "";
	return `${createIndent(INDENT_LEVEL_ONE)}${status} ${test.name}${confidence}`;
};

const formatProgress = (progress: ProgressData): string => {
	const { current, total, message: progressMsg } = progress;
	const percentage = Math.round((current / total) * PERCENTAGE_MULTIPLIER);
	const filled = Math.round((current / total) * PROGRESS_BAR_LENGTH);
	const bar = "█".repeat(filled) + "░".repeat(PROGRESS_BAR_LENGTH - filled);
	return `\r${createIndent(INDENT_LEVEL_ONE)}${chalk.cyan(bar)} ${percentage}% ${progressMsg}`;
};

const formatStats = (stats: StatsData, timestamp?: string): string => {
	const lines: string[] = [];
	lines.push(
		`\n${formatTime(timestamp)} ${chalk.bold(stats.title || "Summary")}`
	);
	lines.push(
		`${createIndent(INDENT_LEVEL_ONE)}${chalk.dim("─".repeat(DIVIDER_LENGTH))}`
	);

	for (const [key, value] of Object.entries(stats)) {
		if (key === "title") continue;
		const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
		const formattedValue =
			typeof value === "number" && key.includes("Rate")
				? `${(value * PERCENTAGE_MULTIPLIER).toFixed(SINGLE_DECIMAL)}%`
				: value;
		lines.push(
			`${createIndent(INDENT_LEVEL_ONE)}${formattedKey}: ${chalk.cyan(String(formattedValue))}`
		);
	}

	lines.push(
		`${createIndent(INDENT_LEVEL_ONE)}${chalk.dim("─".repeat(DIVIDER_LENGTH))}`
	);
	return lines.join("\n");
};

const colorMessage = (message: string, level: string): string => {
	switch (level) {
		case "error":
			return chalk.red(message);
		case "warn":
			return chalk.yellow(message);
		case "success":
			return chalk.green(message);
		default:
			return message;
	}
};

/**
 * Custom format for visual test pipeline output
 */
const visualTestFormat = winston.format.printf((info) => {
	const {
		level,
		message,
		timestamp,
		phase,
		step,
		test,
		progress,
		stats,
		indent = DEFAULT_INDENT,
	} = info as LogInfo;

	// Handle special formatting types
	if (phase) return formatPhase(phase, timestamp);
	if (step) return formatStep(step);
	if (test) return formatTest(test);
	if (progress) return formatProgress(progress);
	if (stats) return formatStats(stats, timestamp);

	// Regular messages with proper indentation
	const indentStr = createIndent(indent);
	const coloredMessage = colorMessage(message, level);

	// Add timestamp for root-level messages
	if (indent === DEFAULT_INDENT && timestamp) {
		return `${formatTime(timestamp)} ${indentStr}${coloredMessage}`;
	}

	return `${indentStr}${coloredMessage}`;
});

/**
 * Create the visual test logger instance
 */
const createVisualTestLogger = () => {
	const logger = winston.createLogger({
		level: "info",
		format: winston.format.combine(
			winston.format.timestamp(),
			visualTestFormat
		),
		transports: [
			new winston.transports.Console({
				stderrLevels: ["error"],
			}),
		],
		// Add custom levels
		levels: {
			error: 0,
			warn: 1,
			success: 2,
			info: 3,
			debug: 4,
		},
	});

	// Add custom methods for visual test specific logging
	const extendedLogger = Object.assign(logger, {
		/**
		 * Log a major phase of the pipeline
		 */
		phase: (emoji: string, title: string) => {
			logger.info("", { phase: { emoji, title } });
		},

		/**
		 * Log a step within a phase
		 */
		step: (
			message: string,
			options?: { completed?: boolean; failed?: boolean }
		) => {
			logger.info("", { step: { message, ...options } });
		},

		/**
		 * Log a test result
		 */
		testResult: (name: string, passed: boolean, confidence?: number) => {
			logger.info("", { test: { name, passed, confidence } });
		},

		/**
		 * Update progress (overwrites current line)
		 */
		progress: (current: number, total: number, progressMessage: string) => {
			// Clear line and write progress
			process.stdout.write("\r\x1b[K");
			logger.info("", {
				progress: { current, total, message: progressMessage },
			});
		},

		/**
		 * Log statistics summary
		 */
		summary: (title: string, summaryStats: Record<string, string | number>) => {
			logger.info("", { stats: { title, ...summaryStats } });
		},

		/**
		 * Log with specific indentation
		 */
		indent: (indentMessage: string, level = INDENT_LEVEL_ONE) => {
			logger.info(indentMessage, { indent: level });
		},

		/**
		 * Log success message (green)
		 */
		success: (successMessage: string) => {
			logger.log("success", successMessage);
		},

		/**
		 * Clear the current line (for progress updates)
		 */
		clearLine: () => {
			process.stdout.write("\r\x1b[K");
		},
	});

	return extendedLogger;
};

// Export singleton instance
export const visualTestLogger = createVisualTestLogger();

// Export type for proper typing
export type VisualTestLogger = ReturnType<typeof createVisualTestLogger>;
