import {
	query,
	type SDKMessage,
	type SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import type { AgentServiceConfig, IAgentService } from "@/types/services";
import { logger } from "./logger";

/**
 * Concrete implementation of IAgentService using Claude Agent SDK
 * Single Responsibility: Only handles communication with Claude Agent SDK
 */
export class AgentService implements IAgentService {
	private abortController: AbortController | null = null;
	private readonly config: AgentServiceConfig;
	private sessionId: string | null = null;

	constructor(config: AgentServiceConfig = {}) {
		this.config = {
			model: "claude-sonnet-4-5-20250929",
			maxTurns: 10,
			allowedTools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
			...config,
		};
	}

	async *startQuery(
		messageIterator: AsyncIterable<SDKUserMessage>
	): AsyncIterable<SDKMessage> {
		// Create new abort controller for this query
		this.abortController = new AbortController();

		try {
			// Use Claude Agent SDK query function with streaming input
			const queryIterator = query({
				prompt: messageIterator,
				options: {
					model: this.config.model,
					maxTurns: this.config.maxTurns,
					allowedTools: this.config.allowedTools,
					cwd: this.config.cwd,
					abortController: this.abortController,
					permissionMode: "bypassPermissions",
					// Auto-resume with captured session ID
					...(this.sessionId && { resume: this.sessionId }),
				},
			});

			// Yield each message from the query
			for await (const message of queryIterator) {
				// Capture session ID from init messages
				if (message.type === "system" && message.subtype === "init") {
					this.sessionId = message.session_id;
					logger.info(`Session captured by service: ${this.sessionId}`);
				}

				yield message;
			}
		} catch (error) {
			logger.error("Agent query error:", error);
			throw error;
		} finally {
			this.abortController = null;
		}
	}

	getSessionId(): string | null {
		return this.sessionId;
	}

	hasActiveSession(): boolean {
		return this.sessionId !== null;
	}

	stop(): void {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}
	}
}
