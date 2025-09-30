import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { useEffect, useRef, useState } from "react";
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
	const isStartedRef = useRef(false);
	const sessionIdRef = useRef<string>("");
	const hasEndedRef = useRef(false);

	const start = () => {
		// Allow restart if the previous query has ended
		if (isStartedRef.current && !hasEndedRef.current) return;

		isStartedRef.current = true;
		setIsRunning(true);
		setError(null);

		// Start processing in background
		// Use resume if we have a session ID and the previous query has ended
		const resumeSessionId = hasEndedRef.current
			? sessionIdRef.current
			: undefined;
		processQuery(resumeSessionId);
	};

	const stop = () => {
		agentService.stop();
		setIsRunning(false);
		isStartedRef.current = false;
	};

	// Handle system init messages
	const handleSystemInit = (message: SDKMessage) => {
		if (message.type === "system" && message.subtype === "init") {
			logger.info(`Session initialized with ID: ${message.session_id}`);
			sessionIdRef.current = message.session_id;
		}
	};

	// Handle result messages
	const handleResult = (message: SDKMessage): boolean => {
		if (message.type === "result") {
			setIsRunning(false);
			isStartedRef.current = false;
			hasEndedRef.current = true;
			logger.info("Query completed. Session can be resumed for next message.");
			return true;
		}
		return false;
	};

	// Process a single query iteration
	const processQueryIteration = async (sessionId?: string) => {
		// Get async iterator from streaming input (shares the same queue)
		const messageIterator = streamingInput.getAsyncIterator();

		// Log if we're resuming
		if (sessionId) {
			logger.info(`Resuming session: ${sessionId}`);
		}

		// Start agent query with streaming input (and optional resume)
		const queryIterator = agentService.startQuery(messageIterator, sessionId);

		// Process each message from the agent
		for await (const message of queryIterator) {
			setMessages((prev) => [...prev, message]);
			handleSystemInit(message);

			if (handleResult(message)) {
				return true; // Query ended
			}
		}
		return false; // Query didn't end normally
	};

	const processQuery = async (initialSessionId?: string) => {
		let currentSessionId = initialSessionId;

		// Keep running continuously to process messages
		while (true) {
			try {
				const queryEnded = await processQueryIteration(currentSessionId);

				if (queryEnded) {
					// Use captured session ID for next iteration
					currentSessionId = sessionIdRef.current;
					logger.info(
						"Query ended, will resume with session ID on next message"
					);
				}
			} catch (err) {
				logger.error("Agent query error:", err);
				setError(err instanceof Error ? err : new Error(String(err)));
				setIsRunning(false);
				isStartedRef.current = false;
				break; // Exit while loop on error
			}
		}
	};

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
