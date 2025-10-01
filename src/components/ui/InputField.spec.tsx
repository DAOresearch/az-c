import { logger } from "@/services/logger";
import { renderComponent } from "@/testing/capture";
import { InputField } from "./InputField";
import config from "./InputField.setup";

// Get scenario index from environment variable
const scenarioIndex = Number.parseInt(process.env.SCENARIO_INDEX || "0", 10);
const scenario = config.scenarios[scenarioIndex];

if (!scenario) {
	logger.error(`No scenario found at index ${scenarioIndex}`);
	logger.info(`Available scenarios: ${config.scenarios.length}`);
	process.exit(1);
}

// Run the renderer with the selected scenario
const { scenarioName, expectation, params } = scenario;

renderComponent({
	scenarioName,
	description: expectation,
	render: () => <InputField {...params} />,
});
