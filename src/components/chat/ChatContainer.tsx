import { useEffect, useMemo } from "react";
import { useAgentQuery } from "@/hooks/useAgentQuery";
import { useStreamingInput } from "@/hooks/useStreamingInput";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { AgentService } from "@/services/AgentService";
import { logger } from "@/services/logger";
import type { IAgentService } from "@/types/services";
import { InputField } from "../ui/InputField";
import { MessageList } from "./MessageList";

/**
 * Main chat container component
 * Single Responsibility: Coordinate chat UI and agent interaction
 * Dependency Inversion: Depends on IAgentService abstraction
 */
export type ChatContainerProps = {
	agentService?: IAgentService;
	title?: string;
};

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

	// Track token usage from messages
	const tokenUsage = useTokenUsage(messages);

	if (error) logger.error(error);

	// Auto-start the agent query on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount
	useEffect(() => {
		start();
	}, []);

	// Handle user message submission
	const handleSubmit = (message: string) => {
		if (!message.trim()) return;
		logger.info(`Submitting message: ${message}, isRunning: ${isRunning}`);
		streamingInput.sendMessage(message);

		// If the query isn't running (e.g., after it ended), restart it
		if (!isRunning) {
			logger.info("Query not running, restarting...");
			start();
		}
	};

	// Check if agent is actively working
	// Show spinner when agent is running and waiting for response
	// But NOT when there are no messages (empty state)
	const lastMessage = messages.at(-1);
	const isWaitingForResponse =
		lastMessage?.type === "user" || lastMessage?.type === "system";
	const isAgentWorking =
		isRunning && messages.length > 0 && isWaitingForResponse;

	return (
		<box
			style={{
				flexDirection: "column",
				height: "100%",
			}}
		>
			{/* Message list - fills screen */}
			<box style={{ flexGrow: 1 }}>
				<MessageList
					isAgentWorking={isAgentWorking}
					messages={messages}
					tokensMax={tokenUsage?.tokensMax}
					tokensUsed={tokenUsage?.tokensUsed}
				/>
			</box>

			{/* Input field - only top/bottom borders */}
			<InputField
				disabled={false} // Always allow input
				onSubmit={handleSubmit}
				placeholder="Type your message and press Enter..."
			/>
		</box>
	);
}
