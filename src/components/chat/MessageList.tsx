import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { MessageRenderer } from "../messages/MessageRenderer";

/**
 * Component to display list of messages
 * Single Responsibility: Display messages in a scrollable container
 */
export type MessageListProps = {
	messages: SDKMessage[];
	height?: number | `${number}%`;
};

export function MessageList({ messages, height = "100%" }: MessageListProps) {
	if (messages.length === 0) {
		return (
			<box
				style={{
					height,
					padding: 2,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<text fg="#999999">Start by typing a message below...</text>
			</box>
		);
	}

	return (
		<scrollbox
			focused
			style={{
				rootOptions: {
					height,
				},
				wrapperOptions: {},
				viewportOptions: {},
				contentOptions: {
					padding: 1,
				},
				scrollbarOptions: {
					showArrows: false,
					trackOptions: {
						foregroundColor: "#4A90E2",
						backgroundColor: "#414868",
					},
				},
			}}
		>
			{messages.map((message, index) => (
				<MessageRenderer
					index={index}
					key={`msg-${index}-${message.session_id}`}
					message={message}
				/>
			))}
		</scrollbox>
	);
}
