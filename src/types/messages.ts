import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

/**
 * Enum for different message types we support
 * Open/Closed Principle: Easy to extend without modifying existing code
 */
export enum MessageType {
	TEXT = "text",
	TOOL_CALL = "tool_call",
	SYSTEM = "system",
	RESULT = "result",
}

/**
 * Base interface for all message renderers
 * Liskov Substitution Principle: All implementations can be substituted
 * Interface Segregation Principle: Minimal required interface
 */
export interface IMessageRenderer {
	/**
	 * Check if this renderer can handle the given message
	 */
	canRender(message: SDKMessage): boolean;

	/**
	 * Render the message (returns JSX)
	 */
	render(message: SDKMessage, index: number): JSX.Element;
}

/**
 * Text content extracted from messages
 */
export interface TextContent {
	type: "text";
	text: string;
}

/**
 * Tool call content extracted from messages
 */
export interface ToolCallContent {
	type: "tool_use";
	id: string;
	name: string;
	input: unknown;
}

/**
 * Union type for content we extract from messages
 */
export type MessageContent = TextContent | ToolCallContent;

/**
 * Parsed message with type and content
 */
export interface ParsedMessage {
	id: string;
	type: MessageType;
	role: "user" | "assistant" | "system";
	content: MessageContent[];
	timestamp: number;
	rawMessage: SDKMessage;
}
