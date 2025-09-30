import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { useEffect, useRef, useState } from "react";
import type { IAgentService } from "../types/services";
import type { StreamingInputController } from "./useStreamingInput";

/**
 * Hook to manage Claude Agent SDK query lifecycle
 * Single Responsibility: Manages agent query state and lifecycle
 */
export interface UseAgentQueryResult {
	messages: SDKMessage[];
	isRunning: boolean;
	error: Error | null;
	start: () => void;
	stop: () => void;
}

export function useAgentQuery(
	agentService: IAgentService,
	streamingInput: StreamingInputController
): UseAgentQueryResult {
	const [messages, setMessages] = useState<SDKMessage[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const isStartedRef = useRef(false);

	const start = () => {
		if (isStartedRef.current) return;
		isStartedRef.current = true;
		setIsRunning(true);
		setError(null);

		// Start processing in background
		processQuery();
	};

	const stop = () => {
		agentService.stop();
		setIsRunning(false);
		isStartedRef.current = false;
	};

	const processQuery = async () => {
		try {
			// Get async iterator from streaming input
			const messageIterator = streamingInput.getAsyncIterator();

			// Start agent query with streaming input
			const queryIterator = agentService.startQuery(messageIterator);

			// Process each message from the agent
			for await (const message of queryIterator) {
				setMessages((prev) => [...prev, message]);

				// Stop if result message received
				if (message.type === "result") {
					setIsRunning(false);
					isStartedRef.current = false;
					break;
				}
			}
		} catch (err) {
			console.error("Agent query error:", err);
			setError(err instanceof Error ? err : new Error(String(err)));
			setIsRunning(false);
			isStartedRef.current = false;
		}
	};

	// Cleanup on unmount
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
