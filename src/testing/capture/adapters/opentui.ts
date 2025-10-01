import { pathToFileURL } from "node:url";
import { render } from "@opentui/react";
import type { ReactNode } from "react";
import { testLogger } from "@/services/logger";

export type ScenarioDefinition = {
	/** Display name for the scenario */
	scenarioName: string;
	/** Description of the rendered scenario */
	description: string;
	/** React factory that returns the node to render */
	render: () => ReactNode;
	/** Optional cleanup invoked after rendering */
	cleanup?: () => void | Promise<void>;
};

export type ScenarioModule = {
	default: {
		scenarios: ScenarioDefinition[];
	};
};

export type CaptureOptions = {
	/** Absolute path to the component spec module */
	specPath: string;
	/** Index of the scenario within the spec module */
	scenarioIndex: number;
};

export type AnimationCaptureOptions = CaptureOptions & {
	animation: {
		duration: number;
		screenshots: number;
	};
};

type Logger = {
	error(message: string, meta?: Record<string, unknown>): void;
	warn(message: string, meta?: Record<string, unknown>): void;
};

type AdapterDependencies = {
	importModule: (specifier: string) => Promise<ScenarioModule>;
	render: typeof render;
	createLogger: (context: {
		specPath: string;
		scenarioIndex: number;
	}) => Logger;
};

const defaultDependencies: AdapterDependencies = {
	importModule: async (specifier) =>
		import(specifier) as Promise<ScenarioModule>,
	render,
	createLogger: ({ specPath, scenarioIndex }) =>
		testLogger.child({
			adapter: "OpenTUITestAdapter",
			specPath,
			scenarioIndex,
		}),
};

export class OpenTUITestAdapter {
	private readonly dependencies: AdapterDependencies;

	constructor(dependencies: Partial<AdapterDependencies> = {}) {
		this.dependencies = { ...defaultDependencies, ...dependencies };
	}

	async capture(options: CaptureOptions): Promise<void> {
		await this.withScenario(options);
	}

	async captureAnimation(options: AnimationCaptureOptions): Promise<void> {
		await this.withScenario(options);
	}

	private async withScenario<T>(
		{ specPath, scenarioIndex }: CaptureOptions,
		handler?: (scenario: ScenarioDefinition) => Promise<T> | T
	): Promise<T | undefined> {
		const logger = this.dependencies.createLogger({ specPath, scenarioIndex });
		let cleanup: (() => void | Promise<void>) | undefined;

		try {
			const module = await this.dependencies.importModule(
				this.toImportSpecifier(specPath)
			);
			const scenario = this.getScenario(module, scenarioIndex, specPath);
			const node = scenario.render();

			cleanup = scenario.cleanup;

			await this.dependencies.render(node);
			if (handler) {
				return await handler(scenario);
			}
			return;
		} catch (error) {
			const actualError =
				error instanceof Error ? error : new Error(String(error));

			logger.error(
				`Failed to import or render scenario ${scenarioIndex} from ${specPath}`,
				{
					specPath,
					scenarioIndex,
					error: actualError.message,
				}
			);

			throw actualError;
		} finally {
			if (cleanup) {
				try {
					await cleanup();
				} catch (cleanupError) {
					const actualCleanupError =
						cleanupError instanceof Error
							? cleanupError
							: new Error(String(cleanupError));
					logger.warn("Scenario cleanup failed", {
						specPath,
						scenarioIndex,
						error: actualCleanupError.message,
					});
				}
			}
		}
	}

	private toImportSpecifier(specPath: string): string {
		if (specPath.startsWith("file://")) {
			return specPath;
		}

		return pathToFileURL(specPath).href;
	}

	private getScenario(
		module: ScenarioModule,
		scenarioIndex: number,
		specPath: string
	): ScenarioDefinition {
		const scenarios = module?.default?.scenarios ?? [];
		const scenario = scenarios[scenarioIndex];

		if (!scenario) {
			throw new Error(
				`Scenario ${scenarioIndex} not found in spec ${specPath}`
			);
		}

		return scenario;
	}
}
