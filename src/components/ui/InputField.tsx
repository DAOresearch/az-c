import { useState } from "react";
import { INPUT_FIELD_TOKENS } from "./tokens";

/**
 * Reusable input field component
 * Single Responsibility: Handle user text input
 * Interface Segregation: Simple, focused interface
 */
export type InputFieldProps = {
	placeholder?: string;
	onSubmit: (value: string) => void;
	disabled?: boolean;
	value?: string;
	onChange?: (value: string) => void;
	focused?: boolean;
	error?: string;
};

export function InputField({
	placeholder = INPUT_FIELD_TOKENS.messages.defaultPlaceholder,
	onSubmit,
	disabled = false,
	value: controlledValue,
	onChange,
	focused: focusedProp,
	error,
}: InputFieldProps) {
	const [internalValue, setInternalValue] = useState("");

	// Use controlled value if provided, otherwise use internal state
	const value = controlledValue ?? internalValue;
	const isControlled = controlledValue !== undefined;

	const handleInput = (newValue: string) => {
		if (isControlled && onChange) {
			onChange(newValue);
		} else {
			setInternalValue(newValue);
		}
	};

	const handleSubmit = (submittedValue: string) => {
		if (!submittedValue.trim() || disabled) return;

		onSubmit(submittedValue.trim());

		// Clear input after submit only if uncontrolled
		if (!isControlled) {
			setInternalValue("");
		}
	};

	// Determine border color based on state
	let borderColor: string = INPUT_FIELD_TOKENS.colors.border.default;
	if (error) {
		borderColor = INPUT_FIELD_TOKENS.colors.border.error;
	} else if (disabled) {
		borderColor = INPUT_FIELD_TOKENS.colors.border.disabled;
	} else if (focusedProp) {
		borderColor = INPUT_FIELD_TOKENS.colors.border.focused;
	}

	// Determine focus state
	const shouldFocus = focusedProp ?? !disabled;

	return (
		<box
			style={{
				border: ["top", "bottom"],
				borderColor,
				height: INPUT_FIELD_TOKENS.layout.height,
				padding: INPUT_FIELD_TOKENS.layout.padding,
			}}
		>
			<input
				focused={shouldFocus}
				onInput={handleInput}
				onSubmit={handleSubmit}
				placeholder={
					disabled ? INPUT_FIELD_TOKENS.messages.disabled : placeholder
				}
				value={value}
			/>
		</box>
	);
}
