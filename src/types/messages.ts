import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { ReactNode } from "react";

/**
 * Constants for different message types we support
 * Open/Closed Principle: Easy to extend without modifying existing code
 */
export const MESSAGE_TYPE = {
	TEXT: "text",
	TOOL_CALL: "tool_call",
	SYSTEM: "system",
	RESULT: "result",
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

/**
 * Base type for all message renderers
 * Liskov Substitution Principle: All implementations can be substituted
 * Interface Segregation Principle: Minimal required interface
 */
export type IMessageRenderer = {
	/**
	 * Check if this renderer can handle the given message
	 */
	canRender(message: SDKMessage): boolean;

	/**
	 * Render the message (returns JSX)
	 */
	render(message: SDKMessage, index: number): ReactNode;
};

/**
 * Text content extracted from messages
 */
export type TextContent = {
	type: "text";
	text: string;
};

/**
 * Tool call content extracted from messages
 */
export type ToolCallContent = {
	type: "tool_use";
	id: string;
	name: string;
	input: unknown;
};

/**
 * Union type for content we extract from messages
 */
export type MessageContent = TextContent | ToolCallContent;

/**
 * Parsed message with type and content
 */
export type ParsedMessage = {
	id: string;
	type: MessageType;
	role: "user" | "assistant" | "system";
	content: MessageContent[];
	timestamp: number;
	rawMessage: SDKMessage;
};
