import type { AgentSpinnerProps } from "./index";

// Type-safe scenario configuration
export type AgentSpinnerScenario = {
	scenarioName: string;
	description: string;
	expectation: string;
	params: AgentSpinnerProps;
};

const config = {
	scenarios: [
		{
			scenarioName: "low-usage",
			description: "Low token usage with green bar",
			expectation:
				"Shows animated spinner, random adjective padded to 16 chars with dots, green progress bar at ~5% filled, and '10.2k/200k tokens (5%)' right-aligned.",
			params: {
				tokensUsed: 10_200,
				tokensMax: 200_000,
			},
		},
		{
			scenarioName: "medium-usage",
			description: "Medium token usage with green bar",
			expectation:
				"Shows animated spinner, random adjective, green progress bar at ~50% filled, and '100k/200k tokens (50%)' displayed.",
			params: {
				tokensUsed: 100_000,
				tokensMax: 200_000,
			},
		},
		{
			scenarioName: "high-usage-warning",
			description: "High token usage with yellow/orange bar",
			expectation:
				"Shows animated spinner, random adjective, yellow/orange progress bar at ~70% filled, and '140k/200k tokens (70%)' displayed.",
			params: {
				tokensUsed: 140_000,
				tokensMax: 200_000,
			},
		},
		{
			scenarioName: "very-high-usage",
			description: "Very high token usage with red bar",
			expectation:
				"Shows animated spinner, random adjective, red progress bar at ~90% filled, and '180k/200k tokens (90%)' displayed.",
			params: {
				tokensUsed: 180_000,
				tokensMax: 200_000,
			},
		},
		{
			scenarioName: "near-limit",
			description: "Near token limit with red bar",
			expectation:
				"Shows animated spinner, random adjective, red progress bar at ~98% filled, and '196k/200k tokens (98%)' displayed.",
			params: {
				tokensUsed: 196_000,
				tokensMax: 200_000,
			},
		},
		{
			scenarioName: "no-token-data",
			description: "Fallback state with no token information",
			expectation:
				"Shows only animated spinner and random adjective padded to 16 chars. No progress bar or token counts displayed.",
			params: {
				tokensUsed: undefined,
				tokensMax: undefined,
			},
		},
	],
} as const satisfies { scenarios: AgentSpinnerScenario[] };

export default config;
