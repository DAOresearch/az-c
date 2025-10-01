/**
 * Design tokens for InputField component
 * Centralized color and style constants
 */
export const INPUT_FIELD_TOKENS = {
	colors: {
		border: {
			default: "#3A3D45",
			focused: "#4A90E2",
			disabled: "#666666",
			error: "#E74C3C",
		},
		background: {
			default: "#1A1D23",
		},
		text: {
			default: "#FFFFFF",
			placeholder: "#999999",
		},
	},
	layout: {
		height: 3,
		padding: 0,
	},
	messages: {
		disabled: "Processing...",
		defaultPlaceholder: "Type a message...",
	},
} as const;
