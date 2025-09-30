import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type {
	MessageContent,
	MessageType,
	ParsedMessage,
} from "../types/messages";

/**
 * Counter for generating unique message IDs
 */
let messageCounter = 0;

/**
 * Extract content from assistant messages
 */
function extractAssistantContent(message: SDKMessage): MessageContent[] {
	const content: MessageContent[] = [];

	if (message.type !== "assistant") return content;

	for (const block of message.message.content) {
		if (block.type === "text") {
			content.push({
				type: "text",
				text: block.text,
			});
		} else if (block.type === "tool_use") {
			content.push({
				type: "tool_use",
				id: block.id,
				name: block.name,
				input: block.input,
			});
		}
	}

	return content;
}

/**
 * Extract content from user messages
 */
function extractUserContent(message: SDKMessage): MessageContent[] {
	const content: MessageContent[] = [];

	if (message.type !== "user") return content;

	if (Array.isArray(message.message.content)) {
		for (const block of message.message.content) {
			if (block.type === "text") {
				content.push({
					type: "text",
					text: block.text,
				});
			}
		}
	} else if (typeof message.message.content === "string") {
		content.push({
			type: "text",
			text: message.message.content,
		});
	}

	return content;
}

/**
 * Determine message type from SDK message
 */
function getMessageType(message: SDKMessage): MessageType {
	if (message.type === "assistant") {
		// Check if has tool calls
		const hasToolCalls = message.message.content.some(
			(block: { type: string }) => block.type === "tool_use"
		);
		return hasToolCalls ? "tool_call" : "text";
	}

	if (message.type === "system") {
		return "system";
	}

	if (message.type === "result") {
		return "result";
	}

	return "text";
}

/**
 * Parse an assistant message
 */
function parseAssistantMessage(
	message: SDKMessage,
	id: string,
	timestamp: number
): ParsedMessage {
	return {
		id,
		type: getMessageType(message),
		role: "assistant",
		content: extractAssistantContent(message),
		timestamp,
		rawMessage: message,
	};
}

/**
 * Parse a user message
 */
function parseUserMessage(
	message: SDKMessage,
	id: string,
	timestamp: number
): ParsedMessage {
	return {
		id,
		type: "text",
		role: "user",
		content: extractUserContent(message),
		timestamp,
		rawMessage: message,
	};
}

/**
 * Parse a system message
 */
function parseSystemMessage(
	message: SDKMessage,
	id: string,
	timestamp: number
): ParsedMessage {
	return {
		id,
		type: "system",
		role: "system",
		content: [
			{
				type: "text",
				text: `System initialized: ${message.session_id}`,
			},
		],
		timestamp,
		rawMessage: message,
	};
}

/**
 * Parse a result message
 */
function parseResultMessage(
	message: SDKMessage,
	id: string,
	timestamp: number
): ParsedMessage {
	// Type guard to ensure we have a result message
	if (message.type !== "result") {
		return {
			id,
			type: "result",
			role: "system",
			content: [
				{
					type: "text",
					text: "Result",
				},
			],
			timestamp,
			rawMessage: message,
		};
	}

	// Now TypeScript knows message has the result message properties
	let resultText: string;
	if (message.subtype === "success") {
		resultText = `Completed: ${message.result}`;
	} else {
		// error_max_turns or error_during_execution
		resultText = `Error: ${message.subtype.replace("error_", "").replace("_", " ")}`;
	}

	return {
		id,
		type: "result",
		role: "system",
		content: [
			{
				type: "text",
				text: resultText,
			},
		],
		timestamp,
		rawMessage: message,
	};
}

/**
 * Parse an SDK message into our internal format
 * Single Responsibility: Only responsible for parsing messages
 */
export function parseMessage(message: SDKMessage): ParsedMessage | null {
	const id = `msg-${messageCounter++}`;
	const timestamp = Date.now();

	switch (message.type) {
		case "assistant":
			return parseAssistantMessage(message, id, timestamp);
		case "user":
			return parseUserMessage(message, id, timestamp);
		case "system":
			return parseSystemMessage(message, id, timestamp);
		case "result":
			return parseResultMessage(message, id, timestamp);
		default:
			// Skip partial messages and unknown types
			return null;
	}
}
