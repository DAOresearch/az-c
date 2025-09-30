import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { IMessageRenderer } from "../../types/messages";

/**
 * Renderer for text-only messages
 * Single Responsibility: Only handles rendering text messages
 * Liskov Substitution: Can be substituted for any IMessageRenderer
 */
export class TextMessageRenderer implements IMessageRenderer {
	canRender(message: SDKMessage): boolean {
		if (message.type === "assistant") {
			// Check if message has only text content (no tool calls)
			return message.message.content.every((block) => block.type === "text");
		}
		if (message.type === "user") {
			return true;
		}
		return false;
	}

	render(message: SDKMessage, index: number): JSX.Element {
		let text = "";
		let role = "";

		if (message.type === "assistant") {
			role = "Assistant";
			// Extract text from content blocks
			text = message.message.content
				.filter((block) => block.type === "text")
				.map((block) => block.text)
				.join("\n");
		} else if (message.type === "user") {
			role = "You";
			// Handle both string and array content
			if (Array.isArray(message.message.content)) {
				text = message.message.content
					.filter((block) => block.type === "text")
					.map((block) => block.text)
					.join("\n");
			} else {
				text = String(message.message.content);
			}
		}

		return (
			<box
				key={`msg-${index}`}
				style={{
					marginBottom: 2,
					flexDirection: "column",
				}}
			>
				<text fg="#999999">{role}:</text>
				<text>{text || "(empty message)"}</text>
			</box>
		);
	}
}
