import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { ReactNode } from "react";
import type { IMessageRenderer } from "@/types/messages";

/**
 * Renderer for messages containing tool calls
 * Single Responsibility: Only handles rendering tool call messages
 * Liskov Substitution: Can be substituted for any IMessageRenderer
 */
export class ToolCallMessageRenderer implements IMessageRenderer {
	canRender(message: SDKMessage): boolean {
		if (message.type !== "assistant") {
			return false;
		}

		// Check if message contains any tool calls
		return message.message.content.some(
			(block: { type: string }) => block.type === "tool_use"
		);
	}

	render(message: SDKMessage, index: number): ReactNode {
		if (message.type !== "assistant") {
			return <box />;
		}

		const toolCalls = message.message.content.filter(
			(block: { type: string }) => block.type === "tool_use"
		);

		return (
			<box
				key={`msg-${index}`}
				style={{
					marginBottom: 2,
					flexDirection: "column",
				}}
			>
				<text fg="#999999">Assistant:</text>

				{/* Render each tool call simply */}
				{toolCalls.map((toolCall: { type: string; name: string }) => {
					if (toolCall.type !== "tool_use") return null;

					return (
						<text key={`tool-${toolCall.name}`}>[Using {toolCall.name}]</text>
					);
				})}
			</box>
		);
	}
}
