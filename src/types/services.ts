import type {
	SDKMessage,
	SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";

/**
 * Interface for agent service following Dependency Inversion Principle
 * High-level modules depend on this abstraction, not concrete implementations
 */
export interface IAgentService {
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
}

/**
 * Configuration options for the agent service
 */
export interface AgentServiceConfig {
	model?: string;
	maxTurns?: number;
	allowedTools?: string[];
	cwd?: string;
}
