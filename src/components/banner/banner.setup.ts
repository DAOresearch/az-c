const config = {
	scenarios: [
		{
			scenarioName: "Component default",
			description: "Default state with placeholder children",
			expectation: "",
			params: {
				message: "What will you build?",
			},
		},
	],
} as const;

export type BannerScenario = (typeof config.scenarios)[number];
export type Senario = {
	scenarioName: string;
	description: string;
	expectation: string;
	params: Record<string, unknown>;
};

export default config;
