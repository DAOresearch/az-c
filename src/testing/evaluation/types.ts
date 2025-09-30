/**
 * Types for AI evaluation system
 */

import type { ScreenshotMetadata } from "../types";

export type EvaluationCriteria = {
	strictness: "lenient" | "moderate" | "strict";
	checkTextContent: boolean;
	checkLayout: boolean;
	checkColors: boolean;
	customRules?: string[];
};

export type EvaluationResult = {
	componentName: string;
	scenarioName: string;
	filePath: string; // Path to screenshot file
	passed: boolean;
	confidence: number; // 0-1 scale
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

export type EvaluationConfig = {
	criteria?: EvaluationCriteria;
};
