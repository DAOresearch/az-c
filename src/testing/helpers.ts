import type { Senario } from "@/components/banner/banner.setup";
import { logger } from "@/services/logger";

export const validateScenario = (scenario: Senario | undefined): Senario => {
	if (!scenario) {
		logger.error("No scenario found");
		process.exit(1);
	}
	return scenario;
};
