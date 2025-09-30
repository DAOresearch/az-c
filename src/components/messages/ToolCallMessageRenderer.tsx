import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { IMessageRenderer } from "../../types/messages";

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
		return message.message.content.some((block) => block.type === "tool_use");
	}

	render(message: SDKMessage, index: number): JSX.Element {
		if (message.type !== "assistant") {
			return <box />;
		}

		const toolCalls = message.message.content.filter(
			(block) => block.type === "tool_use"
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
				{toolCalls.map((toolCall, idx) => {
					if (toolCall.type !== "tool_use") return null;

					return <text key={`tool-${idx}`}>[Using {toolCall.name}]</text>;
				})}
			</box>
		);
	}

	/**
	 * Format tool input for display
	 * Truncates long inputs and formats JSON
	 */
	private formatInput(input: unknown): string {
		try {
			const json = JSON.stringify(input, null, 2);
			// Limit to 200 characters
			if (json.length > 200) {
				return json.slice(0, 200) + "...";
			}
			return json;
		} catch {
			return String(input);
		}
	}
}
