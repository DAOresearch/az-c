import type {
	SDKMessage,
	SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";

export interface AppState {
	messages: SDKMessage[];
	input: string;
	isProcessing: boolean;
	sessionInfo: SessionInfo | null;
	stats: Stats;
	focusMode: "input" | "messages";
	userMessageQueue: Array<() => SDKUserMessage>;
}

export interface SessionInfo {
	sessionId: string;
	model: string;
	permissionMode: string;
	cwd: string;
	tools: string[];
}

export interface Stats {
	tokens: number;
	cost: number;
	duration: number;
	turns: number;
}

export interface ToolExecution {
	id: string;
	name: string;
	startTime: number;
	input: unknown;
}

export const COLORS = {
	user: "#4A90E2",
	assistant: "#50C878",
	system: "#FFD700",
	error: "#E74C3C",
	tool: "#9B59B6",
	border: "#4a4a4a",
	dim: "#999999",
};
