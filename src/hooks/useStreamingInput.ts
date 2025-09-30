import type { SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import { useCallback, useRef } from "react";

export interface StreamingInputController {
	sendMessage: (content: string) => void;
	getAsyncIterator: () => AsyncIterable<SDKUserMessage>;
}

export function useStreamingInput(): StreamingInputController {
	const queueRef = useRef<Array<SDKUserMessage>>([]);
	const resolversRef = useRef<Array<() => void>>([]);
	const doneRef = useRef(false);

	const sendMessage = useCallback((content: string) => {
		if (doneRef.current) return;

		const message: SDKUserMessage = {
			type: "user",
			session_id: "",
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

		queueRef.current.push(message);

		// Resolve any waiting promise
		if (resolversRef.current.length > 0) {
			const resolve = resolversRef.current.shift();
			resolve?.();
		}
	}, []);

	const getAsyncIterator = useCallback((): AsyncIterable<SDKUserMessage> => {
		return {
			[Symbol.asyncIterator]() {
				return {
					async next() {
						// If we have messages in queue, return the next one
						if (queueRef.current.length > 0) {
							const message = queueRef.current.shift()!;
							return {
								done: false,
								value: message,
							};
						}

						// Wait for a new message to be added
						await new Promise<void>((resolve) => {
							resolversRef.current.push(resolve);
						});

						// Check again after promise resolves
						if (queueRef.current.length > 0) {
							const message = queueRef.current.shift()!;
							return {
								done: false,
								value: message,
							};
						}

						// Should not reach here, but safety
						return { done: true, value: undefined };
					},
				};
			},
		};
	}, []);

	return {
		sendMessage,
		getAsyncIterator,
	};
}
