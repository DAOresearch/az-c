import { useState } from "react";

/**
 * Reusable input field component
 * Single Responsibility: Handle user text input
 * Interface Segregation: Simple, focused interface
 */
export interface InputFieldProps {
	placeholder?: string;
	onSubmit: (value: string) => void;
	disabled?: boolean;
}

export function InputField({
	placeholder = "Type a message...",
	onSubmit,
	disabled = false,
}: InputFieldProps) {
	const [value, setValue] = useState("");

	const handleSubmit = (submittedValue: string) => {
		if (!submittedValue.trim() || disabled) return;

		onSubmit(submittedValue.trim());
		setValue(""); // Clear input after submit
	};

	return (
		<box
			style={{
				borderTop: true,
				borderBottom: true,
				borderLeft: false,
				borderRight: false,
				borderColor: disabled ? "#666666" : "#4A90E2",
				height: 3,
				padding: 0,
			}}
		>
			<input
				focused={!disabled}
				onInput={setValue}
				onSubmit={handleSubmit}
				placeholder={disabled ? "Processing..." : placeholder}
				value={value}
			/>
		</box>
	);
}
