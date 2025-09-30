import type {
	SDKMessage,
	SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
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
	const messageIteratorRef = useRef<AsyncIterable<SDKUserMessage> | null>(null);

	const start = () => {
		// Allow restart if the previous query has ended
		if (isStartedRef.current && !hasEndedRef.current) return;

		isStartedRef.current = true;
		setIsRunning(true);
		setError(null);

		// Create iterator once on first start
		if (!messageIteratorRef.current) {
			messageIteratorRef.current = streamingInput.getAsyncIterator();
		}

		processQuery();
	};

	const stop = () => {
		agentService.stop();
		setIsRunning(false);
		isStartedRef.current = false;
	};

	const handleMessage = (message: SDKMessage) => {
		setMessages((prev) => [...prev, message]);

		// Capture session ID from init messages
		if (message.type === "system" && message.subtype === "init") {
			sessionIdRef.current = message.session_id;
			logger.info(`Session initialized with ID: ${message.session_id}`);
		}

		// Handle result messages
		if (message.type === "result") {
			setIsRunning(false);
			isStartedRef.current = false;
			hasEndedRef.current = true;
			logger.info("Query completed. Session can be resumed for next message.");
		}
	};

	const processQuery = async () => {
		if (!messageIteratorRef.current) {
			throw new Error("Message iterator not initialized");
		}

		const messageIterator = messageIteratorRef.current;

		try {
			// Start agent query with streaming input
			const queryIterator = agentService.startQuery(
				messageIterator,
				hasEndedRef.current ? sessionIdRef.current : undefined
			);

			// Process each message from the agent
			for await (const message of queryIterator) {
				handleMessage(message);
			}
		} catch (err) {
			logger.error("Agent query error:", err);
			setError(err instanceof Error ? err : new Error(String(err)));
			setIsRunning(false);
			isStartedRef.current = false;
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
