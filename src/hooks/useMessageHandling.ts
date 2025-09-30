import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { useMemo } from "react";
import type { ParsedMessage } from "../types/messages";
import { MessageParser } from "../utils/messageParser";

/**
 * Hook for managing message state and parsing
 * Single Responsibility: Handle message state transformations
 */
export interface UseMessageHandlingResult {
	parsedMessages: ParsedMessage[];
	messageCount: number;
	lastMessage: ParsedMessage | null;
}

export function useMessageHandling(
	messages: SDKMessage[]
): UseMessageHandlingResult {
	// Parse and filter messages
	const parsedMessages = useMemo(
		() =>
			messages
				.map((msg) => MessageParser.parse(msg))
				.filter((msg): msg is ParsedMessage => msg !== null),
		[messages]
	);

	const messageCount = parsedMessages.length;
	const lastMessage = parsedMessages[parsedMessages.length - 1] || null;

	return {
		parsedMessages,
		messageCount,
		lastMessage,
	};
}
