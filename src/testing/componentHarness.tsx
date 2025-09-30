import { render } from "@opentui/react";
import type { ReactNode } from "react";
import { testLogger } from "@/services/logger";

export type HarnessScenario = {
	scenarioName: string;
	description: string;
	render: () => ReactNode;
};

/**
 * Minimal harness to render a single scenario at a time.
 * Logs instructions then mounts the provided React element using @opentui/react.
 */
export function runHarness({
	scenarioName,
	description,
	render: mount,
}: HarnessScenario) {
	const logger = testLogger.child({ name: scenarioName });

	logger.info({ Scenario: scenarioName });
	logger.info({ Expectation: description });

	render(mount());
}
