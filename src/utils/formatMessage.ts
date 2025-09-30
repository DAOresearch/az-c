import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

// Constants for formatting
const COST_DECIMAL_PLACES = 4;
const THOUSAND = 1000;
const TOKEN_DECIMAL_PLACES = 1;
const MS_PER_SECOND = 1000;
const DURATION_DECIMAL_PLACES = 1;
const ELLIPSIS_LENGTH = 3;

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
	return `$${usd.toFixed(COST_DECIMAL_PLACES)}`;
}

export function formatTokens(count: number): string {
	if (count >= THOUSAND) {
		return `${(count / THOUSAND).toFixed(TOKEN_DECIMAL_PLACES)}K`;
	}
	return count.toString();
}

export function formatDuration(ms: number): string {
	if (ms < MS_PER_SECOND) {
		return `${ms}ms`;
	}
	return `${(ms / MS_PER_SECOND).toFixed(DURATION_DECIMAL_PLACES)}s`;
}

export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - ELLIPSIS_LENGTH)}...`;
}

export function formatToolInput(input: unknown): string {
	try {
		return JSON.stringify(input, null, 2);
	} catch {
		return String(input);
	}
}
