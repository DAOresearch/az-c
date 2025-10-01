import { useState } from "react";
import { InputField } from "./components/ui/InputField";

// Timing constants
const STATE_TIMEOUT_MS = 3000;

/**
 * Demo app to test InputField component functionality
 */
export function InputFieldDemo() {
	const [messages, setMessages] = useState<string[]>([]);
	const [value, setValue] = useState("");
	const [isDisabled, setIsDisabled] = useState(false);
	const [showError, setShowError] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const handleSubmit = (message: string) => {
		if (message.toLowerCase() === "error") {
			setShowError(true);
			setTimeout(() => setShowError(false), STATE_TIMEOUT_MS);
			return;
		}
		if (message.toLowerCase() === "disable") {
			setIsDisabled(true);
			setTimeout(() => setIsDisabled(false), STATE_TIMEOUT_MS);
			return;
		}
		if (message.toLowerCase() === "focus") {
			setIsFocused(true);
			setTimeout(() => setIsFocused(false), STATE_TIMEOUT_MS);
			return;
		}

		// Add message to list
		setMessages((prev) => [...prev, message]);
		// Clear value after submit
		setValue("");
	};

	const handleChange = (newValue: string) => {
		setValue(newValue);
		// Clear error when user types
		if (showError) setShowError(false);
	};

	// Determine current state
	const getStateLabel = () => {
		if (isDisabled) return "DISABLED";
		if (showError) return "ERROR";
		if (isFocused) return "FOCUSED";
		return "NORMAL";
	};

	const getStateColor = () => {
		if (isDisabled) return "#666666";
		if (showError) return "#E74C3C";
		if (isFocused) return "#4A90E2";
		return "#FFFFFF";
	};

	return (
		<box style={{ flexDirection: "column", height: "100%" }}>
			{/* Title */}
			<text
				content="InputField Component Test"
				style={{
					fg: "#4A90E2",
					marginBottom: 1,
				}}
			/>

			{/* Instructions */}
			<box style={{ flexDirection: "column", marginBottom: 2 }}>
				<text content="Commands:" style={{ fg: "#999999" }} />
				<text
					content="  • Type 'error' to see error state"
					style={{ fg: "#999999" }}
				/>
				<text
					content="  • Type 'disable' to see disabled state"
					style={{ fg: "#999999" }}
				/>
				<text
					content="  • Type 'focus' to see focused state"
					style={{ fg: "#999999" }}
				/>
				<text
					content="  • Type anything else to add to messages"
					style={{ fg: "#999999" }}
				/>
			</box>

			{/* Messages list */}
			<box style={{ flexDirection: "column", flexGrow: 1 }}>
				<text content="Messages:" style={{ fg: "#4A90E2", marginBottom: 1 }} />
				{messages.length === 0 ? (
					<text content="No messages yet..." style={{ fg: "#666666" }} />
				) : (
					messages.map((msg, i) => (
						<text
							content={`[${i + 1}] ${msg}`}
							key={`msg-${i}-${msg}`}
							style={{ fg: "#FFFFFF" }}
						/>
					))
				)}
			</box>

			{/* Current state display */}
			<box style={{ marginBottom: 2 }}>
				<text
					content={`State: ${getStateLabel()} | Value: "${value}"`}
					style={{ fg: getStateColor() }}
				/>
			</box>

			{/* InputField component */}
			<InputField
				disabled={isDisabled}
				error={showError ? "This is an error message!" : undefined}
				focused={isFocused}
				onChange={handleChange}
				onSubmit={handleSubmit}
				placeholder="Type a command or message..."
				value={value}
			/>
		</box>
	);
}
