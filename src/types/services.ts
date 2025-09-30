import type {
	SDKMessage,
	SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";

/**
 * Type for agent service following Dependency Inversion Principle
 * High-level modules depend on this abstraction, not concrete implementations
 */
export type IAgentService = {
	/**
	 * Start the agent query with streaming input
	 * @param messageIterator - Async iterable of user messages
	 * @param sessionId - Optional session ID to resume
	 * @returns Async iterable of SDK messages
	 */
	startQuery(
		messageIterator: AsyncIterable<SDKUserMessage>,
		sessionId?: string
	): AsyncIterable<SDKMessage>;

	/**
	 * Stop the current query if running
	 */
	stop(): void;
};

/**
 * Configuration options for the agent service
 */
export type AgentServiceConfig = {
	model?: string;
	maxTurns?: number;
	allowedTools?: string[];
	cwd?: string;
};
