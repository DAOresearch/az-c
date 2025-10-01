/**
 * Core types for the Visual Test AI Evaluation System
 */

export type ScenarioAnimationConfig = {
	duration: number;
	screenshots: number;
};

export type ScreenshotMetadata = {
	componentName: string;
	scenarioName: string;
	description: string;
	expectation: string;
	params: Record<string, unknown>;
	filePath: string;
	timestamp: number;
	dimensions: {
		width: number;
		height: number;
	};
	animation?: {
		duration: number;
		frameCount: number;
		frameIndex: number;
		timestamp: number;
	};
};

export type ComponentScenario<
	TParams extends Record<string, unknown> = Record<string, unknown>,
> = {
	scenarioName: string;
	description: string;
	expectation: string;
	params: TParams;
	animation?: ScenarioAnimationConfig;
};

export type CaptureResult = {
	screenshots: ScreenshotMetadata[];
	outputDir: string;
	captureDate: string;
	totalComponents: number;
	totalScenarios: number;
};
