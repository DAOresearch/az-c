/**
 * Core types for the Visual Test AI Evaluation System
 */

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
};

export type CaptureResult = {
	screenshots: ScreenshotMetadata[];
	outputDir: string;
	captureDate: string;
	totalComponents: number;
	totalScenarios: number;
};
