import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export function getMessageTypeLabel(message: SDKMessage): string {
	switch (message.type) {
		case "user":
			return "👤 User";
		case "assistant":
			return "🤖 Assistant";
		case "system":
			return "⚙️  System";
		case "result":
			return "✅ Result";
		default:
			return "Message";
	}
}

export function formatCost(usd: number): string {
	return `$${usd.toFixed(4)}`;
}

export function formatTokens(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K`;
	}
	return count.toString();
}

export function formatDuration(ms: number): string {
	if (ms < 1000) {
		return `${ms}ms`;
	}
	return `${(ms / 1000).toFixed(1)}s`;
}

export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 3)}...`;
}

export function formatToolInput(input: unknown): string {
	try {
		return JSON.stringify(input, null, 2);
	} catch {
		return String(input);
	}
}
