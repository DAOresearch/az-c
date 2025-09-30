/**
 * Test Result Collector - Aggregates evaluation results
 */

import type { EvaluationResult } from "./types";

export type TestSummary = {
	totalTests: number;
	passed: number;
	failed: number;
	passRate: number;
	averageConfidence: number;
	duration: number;
	timestamp: number;
};

export type ComponentSummary = {
	componentName: string;
	scenarios: number;
	passed: number;
	failed: number;
	results: EvaluationResult[];
};

export type ITestResultCollector = {
	/**
	 * Adds evaluation result to collection
	 */
	addResult(result: EvaluationResult): void;

	/**
	 * Gets results for specific component
	 */
	getComponentResults(componentName: string): ComponentSummary | undefined;

	/**
	 * Gets overall test summary
	 */
	getSummary(): TestSummary;

	/**
	 * Gets all results grouped by component
	 */
	getAllResults(): Map<string, ComponentSummary>;

	/**
	 * Exports results to JSON
	 */
	exportToJSON(): string;
};

export class Collector implements ITestResultCollector {
	private readonly resultsByComponent = new Map<string, EvaluationResult[]>();
	private readonly startTime: number;

	constructor() {
		this.startTime = Date.now();
	}

	addResult(result: EvaluationResult): void {
		const existing = this.resultsByComponent.get(result.componentName) || [];
		existing.push(result);
		this.resultsByComponent.set(result.componentName, existing);
	}

	getComponentResults(componentName: string): ComponentSummary | undefined {
		const results = this.resultsByComponent.get(componentName);
		if (!results) return;

		return {
			componentName,
			scenarios: results.length,
			passed: results.filter((r) => r.passed).length,
			failed: results.filter((r) => !r.passed).length,
			results,
		};
	}

	getSummary(): TestSummary {
		const allResults = Array.from(this.resultsByComponent.values()).flat();
		const totalTests = allResults.length;
		const passed = allResults.filter((r) => r.passed).length;
		const failed = totalTests - passed;
		const passRate = totalTests > 0 ? passed / totalTests : 0;
		const averageConfidence =
			totalTests > 0
				? allResults.reduce((sum, r) => sum + r.confidence, 0) / totalTests
				: 0;

		return {
			totalTests,
			passed,
			failed,
			passRate,
			averageConfidence,
			duration: Date.now() - this.startTime,
			timestamp: Date.now(),
		};
	}

	getAllResults(): Map<string, ComponentSummary> {
		const summaries = new Map<string, ComponentSummary>();

		for (const componentName of this.resultsByComponent.keys()) {
			const summary = this.getComponentResults(componentName);
			if (summary) {
				summaries.set(componentName, summary);
			}
		}

		return summaries;
	}

	exportToJSON(): string {
		const summary = this.getSummary();
		const componentResults = Array.from(this.getAllResults().values());

		return JSON.stringify(
			{
				summary,
				components: componentResults,
			},
			null,
			2
		);
	}
}
