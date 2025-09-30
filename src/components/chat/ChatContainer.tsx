import { useEffect, useMemo } from "react";
import { useAgentQuery } from "../../hooks/useAgentQuery";
import { useStreamingInput } from "../../hooks/useStreamingInput";
import { AgentService } from "../../services/AgentService";
import type { IAgentService } from "../../types/services";
import { InputField } from "../ui/InputField";
import { MessageList } from "./MessageList";

/**
 * Main chat container component
 * Single Responsibility: Coordinate chat UI and agent interaction
 * Dependency Inversion: Depends on IAgentService abstraction
 */
export interface ChatContainerProps {
	agentService?: IAgentService;
	title?: string;
}

export function ChatContainer({ agentService }: ChatContainerProps) {
	// Use provided service or create default
	const service = useMemo(
		() => agentService || new AgentService(),
		[agentService]
	);

	// Initialize streaming input controller
	const streamingInput = useStreamingInput();

	// Initialize agent query hook
	const { messages, isRunning, error, start } = useAgentQuery(
		service,
		streamingInput
	);

	// Auto-start the agent query on mount
	useEffect(() => {
		start();
	}, [start]);

	// Handle user message submission
	const handleSubmit = (message: string) => {
		if (!message.trim()) return;
		streamingInput.sendMessage(message);
	};

	return (
		<box
			style={{
				flexDirection: "column",
				height: "100%",
			}}
		>
			{/* Message list - fills screen */}
			<box style={{ flexGrow: 1 }}>
				<MessageList messages={messages} />
			</box>

			{/* Input field - only top/bottom borders */}
			<InputField
				disabled={!isRunning && messages.length > 0}
				onSubmit={handleSubmit}
				placeholder="Type your message and press Enter..."
			/>
		</box>
	);
}
