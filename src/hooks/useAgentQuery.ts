import type {
	SDKMessage,
	SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/services/logger";
import type { IAgentService } from "@/types/services";
import type { StreamingInputController } from "./useStreamingInput";

/**
 * Hook to manage Claude Agent SDK query lifecycle
 * Single Responsibility: Manages agent query state and lifecycle
 */
export type UseAgentQueryResult = {
	messages: SDKMessage[];
	isRunning: boolean;
	error: Error | null;
	start: () => void;
	stop: () => void;
};

export function useAgentQuery(
	agentService: IAgentService,
	streamingInput: StreamingInputController
): UseAgentQueryResult {
	const [messages, setMessages] = useState<SDKMessage[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const messageIteratorRef = useRef<AsyncIterable<SDKUserMessage> | null>(null);

	const handleMessage = useCallback((message: SDKMessage) => {
		setMessages((prev) => [...prev, message]);

		// Handle result messages
		if (message.type === "result") {
			setIsRunning(false);
			logger.info("Query completed. Session can be resumed for next message.");
		}
	}, []);

	const processQuery = useCallback(async () => {
		if (!messageIteratorRef.current) {
			throw new Error("Message iterator not initialized");
		}

		const messageIterator = messageIteratorRef.current;

		try {
			// Start agent query with streaming input - service handles session internally
			const queryIterator = agentService.startQuery(messageIterator);

			// Process each message from the agent
			for await (const message of queryIterator) {
				handleMessage(message);
			}
		} catch (err) {
			logger.error("Agent query error:", err);
			setError(err instanceof Error ? err : new Error(String(err)));
			setIsRunning(false);
		}
	}, [agentService, handleMessage]);

	const start = useCallback(() => {
		// Allow restart if query not currently running
		if (isRunning) {
			logger.info("Query already running, ignoring start");
			return;
		}

		setIsRunning(true);
		setError(null);

		// Log session state
		const hasSession = agentService.hasActiveSession();
		const sessionId = agentService.getSessionId();
		logger.info(
			`Starting query - Has session: ${hasSession}, ID: ${sessionId}`
		);

		// Create iterator once on first start
		if (!messageIteratorRef.current) {
			messageIteratorRef.current = streamingInput.getAsyncIterator();
		}

		processQuery();
	}, [isRunning, agentService, streamingInput, processQuery]);

	const stop = useCallback(() => {
		agentService.stop();
		setIsRunning(false);
	}, [agentService]);

	// Cleanup on unmount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <cleanup on unmount>
	useEffect(
		() => () => {
			stop();
		},
		[]
	);

	return {
		messages,
		isRunning,
		error,
		start,
		stop,
	};
}
