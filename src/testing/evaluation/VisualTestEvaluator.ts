/**
 * Visual Test Evaluator - Evaluates screenshots using AI
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import { logger } from "@/services/logger";
import type { IAgentService } from "@/types/services";
import { PromptBuilder } from "../prompts/PromptBuilder";
import type { ScreenshotMetadata } from "../types";
import type {
	EvaluationConfig,
	EvaluationCriteria,
	EvaluationResult,
	IVisualTestEvaluator,
} from "./types";

const DEFAULT_CRITERIA: EvaluationCriteria = {
	strictness: "moderate",
	checkTextContent: true,
	checkLayout: true,
	checkColors: true,
};

const JSON_EXTRACTION_REGEX = /\{[\s\S]*\}/;

export class VisualTestEvaluator implements IVisualTestEvaluator {
	private criteria: EvaluationCriteria;
	private readonly promptBuilder: PromptBuilder;
	private readonly evaluatorLogger = logger.child({
		name: "VisualTestEvaluator",
	});
	private readonly agentService: IAgentService;

	constructor(agentService: IAgentService, config?: EvaluationConfig) {
		this.agentService = agentService;
		this.criteria = config?.criteria ?? DEFAULT_CRITERIA;
		this.promptBuilder = new PromptBuilder();
	}

	setEvaluationCriteria(criteria: EvaluationCriteria): void {
		this.criteria = criteria;
	}

	private async collectResponseText(
		messageIterator: AsyncIterable<SDKUserMessage>
	): Promise<string> {
		let responseText = "";
		for await (const response of this.agentService.startQuery(
			messageIterator
		)) {
			if (response.type === "assistant") {
				for (const content of response.message.content) {
					if (content.type === "text") {
						responseText += content.text;
					}
				}
			}
		}
		return responseText;
	}

	private parseEvaluationResult(
		metadata: ScreenshotMetadata,
		responseText: string
	): EvaluationResult {
		// Parse JSON response
		const jsonMatch = responseText.match(JSON_EXTRACTION_REGEX);
		if (!jsonMatch) {
			throw new Error("No JSON found in response");
		}

		const result = JSON.parse(jsonMatch[0]) as {
			passed: boolean;
			confidence: number;
			reasoning: string;
			observations: {
				elementsFound: string[];
				textContent: string[];
				layoutDescription: string;
				colorScheme: string[];
			};
			suggestions?: string[];
		};

		return {
			componentName: metadata.componentName,
			scenarioName: metadata.scenarioName,
			passed: result.passed,
			confidence: result.confidence,
			reasoning: result.reasoning,
			observations: result.observations,
			suggestions: result.suggestions,
			timestamp: Date.now(),
		};
	}

	async evaluateScreenshot(
		metadata: ScreenshotMetadata,
		screenshotPath: string
	): Promise<EvaluationResult> {
		this.evaluatorLogger.info(
			`Evaluating ${metadata.componentName}/${metadata.scenarioName}`
		);

		try {
			// Read screenshot as base64
			const screenshotBuffer = await fs.readFile(screenshotPath);
			const screenshotBase64 = screenshotBuffer.toString("base64");

			// Build evaluation prompt
			const prompt = this.promptBuilder.buildEvaluationPrompt(
				metadata,
				this.criteria
			);

			// Create message with image
			const sessionId = this.agentService.getSessionId();
			const message: SDKUserMessage = {
				type: "user",
				session_id: sessionId || "",
				parent_tool_use_id: null,
				message: {
					role: "user",
					content: [
						{
							type: "image",
							source: {
								type: "base64",
								media_type: "image/png",
								data: screenshotBase64,
							},
						},
						{
							type: "text",
							text: prompt,
						},
					],
				},
			};

			// Create async iterator for message
			const messageIterator = {
				[Symbol.asyncIterator]() {
					let yielded = false;
					return {
						next() {
							if (yielded) {
								return Promise.resolve({
									done: true as const,
									value: undefined,
								});
							}
							yielded = true;
							return Promise.resolve({ done: false as const, value: message });
						},
					};
				},
			};

			// Send to agent and collect response
			const responseText = await this.collectResponseText(messageIterator);

			// Parse and return result
			return this.parseEvaluationResult(metadata, responseText);
		} catch (error) {
			this.evaluatorLogger.error(
				`Evaluation failed for ${metadata.componentName}/${metadata.scenarioName}`,
				error
			);

			// Return failed evaluation on error
			return {
				componentName: metadata.componentName,
				scenarioName: metadata.scenarioName,
				passed: false,
				confidence: 0,
				reasoning: `Evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
				observations: {
					elementsFound: [],
					textContent: [],
					layoutDescription: "Error during evaluation",
					colorScheme: [],
				},
				suggestions: ["Retry evaluation", "Check screenshot quality"],
				timestamp: Date.now(),
			};
		}
	}

	async evaluateBatch(
		metadataPath: string,
		screenshotDir: string
	): Promise<EvaluationResult[]> {
		this.evaluatorLogger.info("Starting batch evaluation");

		// Load metadata
		const metadataContent = await fs.readFile(metadataPath, "utf-8");
		const metadata: ScreenshotMetadata[] = JSON.parse(metadataContent);

		this.evaluatorLogger.info(
			`Loaded ${metadata.length} screenshots to evaluate`
		);

		// Evaluate each screenshot
		const results: EvaluationResult[] = [];
		for (const meta of metadata) {
			const screenshotPath = path.join(
				screenshotDir,
				path.basename(meta.filePath)
			);
			const result = await this.evaluateScreenshot(meta, screenshotPath);
			results.push(result);
		}

		this.evaluatorLogger.info(
			`Batch evaluation complete: ${results.length} results`
		);

		return results;
	}
}
