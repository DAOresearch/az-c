import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { IMessageRenderer } from "../../types/messages";

/**
 * Renderer for system messages and results
 * Single Responsibility: Only handles rendering system messages
 * Liskov Substitution: Can be substituted for any IMessageRenderer
 */
export class SystemMessageRenderer implements IMessageRenderer {
	canRender(message: SDKMessage): boolean {
		return message.type === "system" || message.type === "result";
	}

	render(message: SDKMessage, index: number): JSX.Element {
		// Skip system init messages - they're noise
		if (message.type === "system" && message.subtype === "init") {
			return <box key={`msg-${index}`} />;
		}

		let text = "";

		if (message.type === "result") {
			// Only show error results
			if (message.subtype !== "success") {
				text = `Error: ${message.subtype}`;
			} else {
				// Skip success results - they're just completion markers
				return <box key={`msg-${index}`} />;
			}
		}

		// Skip if no text
		if (!text) {
			return <box key={`msg-${index}`} />;
		}

		return (
			<box
				key={`msg-${index}`}
				style={{
					marginBottom: 2,
					flexDirection: "column",
				}}
			>
				<text fg="#E74C3C">{text}</text>
			</box>
		);
	}
}
