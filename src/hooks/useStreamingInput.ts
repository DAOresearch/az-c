import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import { useCallback, useRef } from "react";

export type StreamingInputController = {
	sendMessage: (content: string) => void;
	getAsyncIterator: () => AsyncIterable<SDKUserMessage>;
	setSessionId: (sessionId: string) => void;
};

/**
 * Hook for managing streaming user input with async iteration support.
 *
 * This implements a producer-consumer pattern where:
 * - Producer: sendMessage() can be called anytime to queue messages
 * - Consumer: getAsyncIterator() yields messages as they arrive
 *
 * The async iterator allows the Claude Agent SDK to pull messages on demand,
 * waiting for new messages when the queue is empty. This enables users to
 * send multiple messages while the agent is still processing previous ones.
 *
 * @example
 * ```typescript
 * const streamingInput = useStreamingInput();
 *
 * // Producer side: Send messages
 * streamingInput.sendMessage("Hello");
 * streamingInput.sendMessage("How are you?"); // Can queue while agent is running
 *
 * // Consumer side: Agent pulls messages
 * const iterator = streamingInput.getAsyncIterator();
 * for await (const message of iterator) {
 *   // Process each message as it arrives
 * }
 * ```
 */
export function useStreamingInput(): StreamingInputController {
	// Queue to store pending messages that haven't been consumed yet
	const queueRef = useRef<SDKUserMessage[]>([]);

	// Array of Promise resolvers waiting for new messages
	// When the queue is empty, consumers wait by creating a Promise
	// These resolvers are called when new messages arrive
	const resolversRef = useRef<(() => void)[]>([]);

	// Flag to indicate if this stream is closed/done
	const doneRef = useRef(false);

	// Session ID from the Claude Agent SDK - captured from first system message
	const sessionIdRef = useRef<string>("");

	/**
	 * Updates the session ID to use for future messages.
	 * Called when we receive the first system message from the SDK.
	 */
	const setSessionId = useCallback((sessionId: string) => {
		sessionIdRef.current = sessionId;
	}, []);

	/**
	 * Sends a new message to the queue.
	 * If a consumer is waiting, it immediately notifies them.
	 */
	const sendMessage = useCallback((content: string) => {
		if (doneRef.current) return;

		// Create user message with current session ID
		const message: SDKUserMessage = {
			type: "user",
			session_id: sessionIdRef.current,
			message: {
				role: "user",
				content: [
					{
						type: "text",
						text: content,
					},
				],
			},
			parent_tool_use_id: null,
		};

		// Add message to the queue
		queueRef.current.push(message);

		// If any consumer is waiting for a message, wake them up
		// This resolves the Promise they're awaiting on
		if (resolversRef.current.length > 0) {
			const resolve = resolversRef.current.shift();
			resolve?.();
		}
	}, []);

	/**
	 * Creates an async iterable that yields messages as they arrive.
	 * This is the consumer side of the producer-consumer pattern.
	 *
	 * The async iterator will:
	 * 1. Return queued messages immediately if available
	 * 2. Wait (block) for new messages when queue is empty
	 * 3. Allow for...await...of loops to consume messages
	 */
	const getAsyncIterator = useCallback((): AsyncIterable<SDKUserMessage> => {
		// Helper to dequeue a message - defined inside to avoid dependency issues
		const dequeueMessage = () => {
			if (queueRef.current.length > 0) {
				const message = queueRef.current.shift();
				if (message) {
					// Return iterator result with done: false to continue iteration
					return { done: false as const, value: message };
				}
			}
			return null;
		};

		// Return an object that implements the AsyncIterable protocol
		return {
			// Symbol.asyncIterator is the well-known symbol that makes this iterable
			[Symbol.asyncIterator]() {
				// Return the actual async iterator object
				return {
					// next() is called each time the consumer wants the next value
					async next() {
						// FAST PATH: If messages are already queued, return immediately
						const result = dequeueMessage();
						if (result) return result;

						// WAIT PATH: No messages available, so we need to wait
						// Create a Promise and store its resolver
						// This Promise will be resolved when sendMessage() is called
						await new Promise<void>((resolve) => {
							resolversRef.current.push(resolve);
						});

						// After being woken up, check the queue again
						// A message should be available now since we were notified
						const resultAfterWait = dequeueMessage();
						if (resultAfterWait) return resultAfterWait;

						// Safety fallback - shouldn't normally reach here
						// Returns done: true to end the iteration
						return { done: true as const, value: undefined };
					},
				};
			},
		};
	}, []);

	return {
		sendMessage,
		getAsyncIterator,
		setSessionId,
	};
}
