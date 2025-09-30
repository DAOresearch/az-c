import type {
	SDKMessage,
	SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";

export type AppState = {
	messages: SDKMessage[];
	input: string;
	isProcessing: boolean;
	sessionInfo: SessionInfo | null;
	stats: Stats;
	focusMode: "input" | "messages";
	userMessageQueue: (() => SDKUserMessage)[];
};

export type SessionInfo = {
	sessionId: string;
	model: string;
	permissionMode: string;
	cwd: string;
	tools: string[];
};

export type Stats = {
	tokens: number;
	cost: number;
	duration: number;
	turns: number;
};

export type ToolExecution = {
	id: string;
	name: string;
	startTime: number;
	input: unknown;
};

export const COLORS = {
	user: "#4A90E2",
	assistant: "#50C878",
	system: "#FFD700",
	error: "#E74C3C",
	tool: "#9B59B6",
	border: "#4a4a4a",
	dim: "#999999",
};
