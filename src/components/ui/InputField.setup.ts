import type { InputFieldProps } from "./InputField";

// Type-safe scenario configuration
export type InputFieldScenario = {
	scenarioName: string;
	description: string;
	expectation: string;
	params: InputFieldProps;
};

// No-op function for test scenarios
// biome-ignore lint/suspicious/noEmptyBlockStatements: Test setup requires no-op callback
const noop = (_value: string) => {};

const config = {
	scenarios: [
		{
			scenarioName: "idle-state",
			description: "Input field in idle state with placeholder text",
			expectation:
				"Displays a full-width horizontal line in gray at the top, followed by the text 'Type a message...' in gray on a dark background, then another full-width horizontal line in gray at the bottom. No prompt character, no vertical borders, simple minimalist layout.",
			params: {
				value: "",
				placeholder: "Type a message...",
				onChange: noop,
				onSubmit: noop,
				disabled: false,
				focused: false,
			},
		},
		{
			scenarioName: "focused-state",
			description: "Input field in focused state with blue border",
			expectation:
				"Displays a full-width horizontal line in blue at the top, followed by a white 'i' character and 'Type here' text in gray on a dark background, then another full-width horizontal line in blue at the bottom. The cursor indicator is visible, no vertical borders.",
			params: {
				value: "",
				placeholder: "Type here",
				onChange: noop,
				onSubmit: noop,
				disabled: false,
				focused: true,
			},
		},
		{
			scenarioName: "with-text",
			description: "Input field with user-entered text",
			expectation:
				"Displays a full-width horizontal line in gray at the top, followed by the text 'hello world' in white on a dark background (no prompt character, no placeholder visible), then another full-width horizontal line in gray at the bottom. Simple minimalist layout.",
			params: {
				value: "hello world",
				placeholder: "Type a message...",
				onChange: noop,
				onSubmit: noop,
				disabled: false,
				focused: false,
			},
		},
		{
			scenarioName: "disabled-state",
			description: "Input field in disabled state",
			expectation:
				"Displays a full-width horizontal line in gray at the top, followed by the text 'Processing...' in gray on a dark background (no prefix character, no prompt), then another full-width horizontal line in gray at the bottom. Appears non-interactive with muted styling.",
			params: {
				value: "",
				placeholder: "Type a message...",
				onChange: noop,
				onSubmit: noop,
				disabled: true,
				focused: false,
			},
		},
		{
			scenarioName: "error-state",
			description: "Input field showing error message",
			expectation:
				"Displays a full-width horizontal line in red at the top, followed by the text 'Type a message...' in gray on a dark background (no prompt character), then another full-width horizontal line in red at the bottom. The red lines indicate error state. No error message text is displayed below.",
			params: {
				value: "",
				placeholder: "Type a message...",
				onChange: noop,
				onSubmit: noop,
				disabled: false,
				focused: false,
				error: "Invalid input",
			},
		},
	],
} as const satisfies { scenarios: InputFieldScenario[] };

export default config;
