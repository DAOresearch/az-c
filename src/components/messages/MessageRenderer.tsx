import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { IMessageRenderer } from "../../types/messages";
import { SystemMessageRenderer } from "./SystemMessageRenderer";
import { TextMessageRenderer } from "./TextMessageRenderer";
import { ToolCallMessageRenderer } from "./ToolCallMessageRenderer";

/**
 * Message renderer factory using Chain of Responsibility pattern
 * Open/Closed Principle: Add new renderers without modifying this class
 * Single Responsibility: Only responsible for delegating to appropriate renderer
 */
export class MessageRendererFactory {
	private static renderers: IMessageRenderer[] = [
		new ToolCallMessageRenderer(),
		new TextMessageRenderer(),
		new SystemMessageRenderer(),
	];

	/**
	 * Get appropriate renderer for a message
	 * Returns first renderer that can handle the message
	 */
	static getRenderer(message: SDKMessage): IMessageRenderer | null {
		return (
			MessageRendererFactory.renderers.find((renderer) =>
				renderer.canRender(message)
			) || null
		);
	}

	/**
	 * Register a custom renderer
	 * Allows extension without modification (OCP)
	 */
	static registerRenderer(renderer: IMessageRenderer): void {
		MessageRendererFactory.renderers.unshift(renderer);
	}
}

/**
 * Main component for rendering any message type
 * Delegates to specific renderers based on message type
 */
export function MessageRenderer({
	message,
	index,
}: {
	message: SDKMessage;
	index: number;
}) {
	const renderer = MessageRendererFactory.getRenderer(message);

	if (!renderer) {
		return (
			<box style={{ padding: 1, marginBottom: 1 }}>
				<text fg="#E74C3C">Unknown message type</text>
			</box>
		);
	}

	return renderer.render(message, index);
}
