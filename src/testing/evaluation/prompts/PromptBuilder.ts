/**
 * Prompt builder for AI evaluation
 */

import type { ScreenshotMetadata } from "../../types";
import type { EvaluationCriteria, EvaluationResult } from "../types";
import {
	COMPARISON_PROMPT_TEMPLATE,
	EVALUATION_PROMPT_TEMPLATE,
	SUMMARY_PROMPT_TEMPLATE,
} from "./templates";

export type IPromptBuilder = {
	/**
	 * Builds evaluation prompt for a screenshot
	 */
	buildEvaluationPrompt(
		metadata: ScreenshotMetadata,
		criteria: EvaluationCriteria
	): string;

	/**
	 * Builds comparison prompt for regression testing
	 */
	buildComparisonPrompt(
		baseline: ScreenshotMetadata,
		current: ScreenshotMetadata
	): string;

	/**
	 * Builds summary prompt for multiple results
	 */
	buildSummaryPrompt(results: EvaluationResult[]): string;
};

/**
 * Interpolates template variables with provided data
 */
function interpolate(
	template: string,
	data: Record<string, string | number | boolean>
): string {
	let result = template;
	for (const [key, value] of Object.entries(data)) {
		const placeholder = `{${key}}`;
		result = result.replaceAll(placeholder, String(value));
	}
	return result;
}

export class PromptBuilder implements IPromptBuilder {
	buildEvaluationPrompt(
		metadata: ScreenshotMetadata,
		criteria: EvaluationCriteria
	): string {
		const customRulesText =
			criteria.customRules && criteria.customRules.length > 0
				? `\nCustom Rules:\n${criteria.customRules.map((rule) => `- ${rule}`).join("\n")}`
				: "";

		return interpolate(EVALUATION_PROMPT_TEMPLATE, {
			componentName: metadata.componentName,
			scenarioName: metadata.scenarioName,
			description: metadata.description,
			expectation: metadata.expectation,
			strictness: criteria.strictness,
			checkTextContent: criteria.checkTextContent,
			checkLayout: criteria.checkLayout,
			checkColors: criteria.checkColors,
			customRules: customRulesText,
		});
	}

	buildComparisonPrompt(
		baseline: ScreenshotMetadata,
		current: ScreenshotMetadata
	): string {
		return interpolate(COMPARISON_PROMPT_TEMPLATE, {
			baselineComponentName: baseline.componentName,
			baselineScenarioName: baseline.scenarioName,
			baselineExpectation: baseline.expectation,
			currentComponentName: current.componentName,
			currentScenarioName: current.scenarioName,
			currentExpectation: current.expectation,
		});
	}

	buildSummaryPrompt(results: EvaluationResult[]): string {
		const PERCENT_MULTIPLIER = 100;
		const REASONING_PREVIEW_LENGTH = 100;
		const DECIMAL_PLACES = 1;

		const totalTests = results.length;
		const passed = results.filter((r) => r.passed).length;
		const failed = totalTests - passed;
		const passRate =
			totalTests > 0 ? (passed / totalTests) * PERCENT_MULTIPLIER : 0;
		const averageConfidence =
			totalTests > 0
				? results.reduce((sum, r) => sum + r.confidence, 0) / totalTests
				: 0;

		const failedTests = results
			.filter((r) => !r.passed)
			.map(
				(r) =>
					`- ${r.componentName}/${r.scenarioName}: ${r.reasoning.slice(0, REASONING_PREVIEW_LENGTH)}...`
			)
			.join("\n");

		return interpolate(SUMMARY_PROMPT_TEMPLATE, {
			totalTests,
			passed,
			failed,
			passRate: passRate.toFixed(DECIMAL_PLACES),
			averageConfidence: (averageConfidence * PERCENT_MULTIPLIER).toFixed(
				DECIMAL_PLACES
			),
			failedTests: failedTests || "None",
		});
	}
}
