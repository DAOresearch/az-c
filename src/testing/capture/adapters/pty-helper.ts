import type { IPty } from "node-pty";
import { spawn } from "node-pty";

export const DEFAULT_TIMEOUT_MS = 30_000;

export type RunCommandOptions = {
	cols?: number;
	rows?: number;
	timeoutMs?: number;
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	onData?: (data: string) => void | Promise<void>;
};

export type RunCommandResult = {
	output: string;
	exitCode: number;
};

const getShell = (): { bin: string; args: string[] } => {
	if (process.platform === "win32") {
		const shell = process.env.ComSpec ?? "powershell.exe";
		if (shell.toLowerCase().includes("powershell")) {
			return { bin: shell, args: ["-NoLogo", "-NoProfile", "-Command"] };
		}
		return { bin: shell, args: ["/d", "/c"] };
	}

	const shell = process.env.SHELL ?? "/bin/bash";
	return { bin: shell, args: ["-l", "-c"] };
};

const truncateOutput = (text: string, max = 2000): string => {
	if (text.length <= max) {
		return text;
	}
	return `${text.slice(0, max)}\n… truncated (${text.length - max} bytes omitted)`;
};

const toMessage = (value: unknown, fallback: string): string => {
	if (value instanceof Error) {
		return value.message;
	}
	if (typeof value === "string") {
		return value;
	}
	return fallback;
};

const handleData = async (
	chunk: string,
	onData?: RunCommandOptions["onData"]
): Promise<void> => {
	if (!onData) {
		return;
	}
	try {
		await onData(chunk);
	} catch {
		// Ignore handler errors to avoid breaking capture pipeline
	}
};

const disposePty = (pty: IPty): void => {
	try {
		pty.kill();
	} catch {
		// Ignore errors on cleanup
	}
};

/**
 * Runs a command inside a pseudo-terminal and returns the full output.
 * Output is streamed via the optional onData callback.
 */
export const runCommand = async (
	cmd: string,
	options: RunCommandOptions = {}
): Promise<RunCommandResult> => {
	const {
		cols = 120,
		rows = 40,
		timeoutMs = DEFAULT_TIMEOUT_MS,
		cwd = process.cwd(),
		env = process.env,
		onData,
	} = options;

	if (!cmd.trim()) {
		throw new Error("Command cannot be empty");
	}

	const { bin, args } = getShell();
	const spawnArgs = [...args, cmd];

	let pty: IPty;
	try {
		pty = spawn(bin, spawnArgs, {
			name: "xterm-color",
			cols,
			rows,
			cwd,
			env,
		});
	} catch (error) {
		const message = toMessage(error, "Unknown PTY spawn error");
		throw new Error(`Failed to launch PTY for '${cmd}': ${message}`);
	}

	let output = "";
	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
	let finished = false;

	return await new Promise<RunCommandResult>((resolve, reject) => {
		let dataSubscription: ReturnType<typeof pty.onData> | undefined;
		let exitSubscription: ReturnType<typeof pty.onExit> | undefined;

		const close = (): void => {
			if (timeoutHandle) {
				clearTimeout(timeoutHandle);
				timeoutHandle = undefined;
			}
			dataSubscription?.dispose();
			exitSubscription?.dispose();
			disposePty(pty);
		};

		const resolveSafely = (exitCode: number): void => {
			if (finished) {
				return;
			}
			finished = true;
			close();
			resolve({
				output,
				exitCode,
			});
		};

		const rejectSafely = (error: Error): void => {
			if (finished) {
				return;
			}
			finished = true;
			close();
			reject(error);
		};

		dataSubscription = pty.onData(async (chunk: string) => {
			output += chunk;
			await handleData(chunk, onData);
		});

		exitSubscription = pty.onExit(({ exitCode }) => {
			resolveSafely(exitCode ?? 0);
		});

		timeoutHandle = setTimeout(() => {
			const partial = truncateOutput(output);
			rejectSafely(
				new Error(
					`Command timed out after ${timeoutMs}ms: ${cmd}\nPartial output:\n${partial}`
				)
			);
		}, timeoutMs);
	});
};
