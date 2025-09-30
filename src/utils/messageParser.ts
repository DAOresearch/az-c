import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type {
	MessageContent,
	MessageType,
	ParsedMessage,
} from "../types/messages";

/**
 * Utility to parse SDK messages into our domain model
 * Single Responsibility: Only responsible for parsing messages
 */
export class MessageParser {
	private static messageCounter = 0;

	/**
	 * Parse an SDK message into our internal format
	 */
	static parse(message: SDKMessage): ParsedMessage | null {
		const id = `msg-${MessageParser.messageCounter++}`;
		const timestamp = Date.now();

		// Handle assistant messages
		if (message.type === "assistant") {
			const content: MessageContent[] = [];

			// Extract text and tool calls
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

			return {
				id,
				type: MessageParser.getMessageType(message),
				role: "assistant",
				content,
				timestamp,
				rawMessage: message,
			};
		}

		// Handle user messages
		if (message.type === "user") {
			const content: MessageContent[] = [];

			// Extract content from user message
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

			return {
				id,
				type: "text" as MessageType,
				role: "user",
				content,
				timestamp,
				rawMessage: message,
			};
		}

		// Handle system messages
		if (message.type === "system") {
			return {
				id,
				type: "system" as MessageType,
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

		// Handle result messages
		if (message.type === "result") {
			const resultText =
				message.subtype === "success"
					? `Completed: ${message.result}`
					: `Error: ${message.subtype}`;

			return {
				id,
				type: "result" as MessageType,
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

		// Skip partial messages
		return null;
	}

	/**
	 * Determine message type from SDK message
	 */
	private static getMessageType(message: SDKMessage): MessageType {
		if (message.type === "assistant") {
			// Check if has tool calls
			const hasToolCalls = message.message.content.some(
				(block) => block.type === "tool_use"
			);
			return hasToolCalls
				? ("tool_call" as MessageType)
				: ("text" as MessageType);
		}

		if (message.type === "system") {
			return "system" as MessageType;
		}

		if (message.type === "result") {
			return "result" as MessageType;
		}

		return "text" as MessageType;
	}
}
