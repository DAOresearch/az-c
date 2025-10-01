import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { useMemo } from "react";

export type TokenUsage = {
	tokensUsed: number;
	tokensMax: number;
};

/**
 * Hook to calculate total token usage from SDK messages
 * Extracts usage data from result messages and determines context window
 */
export const useTokenUsage = (messages: SDKMessage[]): TokenUsage | null => {
	return useMemo(() => {
		// Find the most recent result message with usage data
		for (let i = messages.length - 1; i >= 0; i--) {
			const msg = messages[i];
			if (msg?.type === "result" && msg.modelUsage) {
				// Calculate total tokens from all models
				let totalInputTokens = 0;
				let totalOutputTokens = 0;
				let contextWindow = 200_000; // Default fallback

				for (const modelUsage of Object.values(msg.modelUsage)) {
					totalInputTokens += modelUsage.inputTokens;
					totalOutputTokens += modelUsage.outputTokens;
					// Use the largest context window found
					if (modelUsage.contextWindow > contextWindow) {
						contextWindow = modelUsage.contextWindow;
					}
				}

				return {
					tokensUsed: totalInputTokens + totalOutputTokens,
					tokensMax: contextWindow,
				};
			}
		}

		// No usage data found
		return null;
	}, [messages]);
};
