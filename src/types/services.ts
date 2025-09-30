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
	 * @returns Async iterable of SDK messages
	 */
	startQuery(
		messageIterator: AsyncIterable<SDKUserMessage>
	): AsyncIterable<SDKMessage>;

	/**
	 * Stop the current query if running
	 */
	stop(): void;

	/**
	 * Get the current session ID if one exists
	 * @returns Session ID or null if no active session
	 */
	getSessionId(): string | null;

	/**
	 * Check if there is an active session
	 * @returns True if session exists, false otherwise
	 */
	hasActiveSession(): boolean;
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
