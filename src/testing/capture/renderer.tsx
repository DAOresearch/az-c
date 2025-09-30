import { render } from "@opentui/react";
import type { ReactNode } from "react";
import { testLogger } from "@/services/logger";

export type RenderScenario = {
	scenarioName: string;
	description: string;
	render: () => ReactNode;
};

/**
 * Minimal renderer to display a single scenario at a time.
 * Logs instructions then mounts the provided React element using @opentui/react.
 */
export function renderComponent({
	scenarioName,
	description,
	render: mount,
}: RenderScenario) {
	const logger = testLogger.child({ name: scenarioName });

	logger.info({ Scenario: scenarioName });
	logger.info({ Expectation: description });

	render(mount());
}
