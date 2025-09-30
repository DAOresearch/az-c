/**
 * Terminal capture adapter interface
 */

export type TerminalCaptureOptions = {
	/** The command to run in the terminal */
	cmd: string;
	/** Output filename for the screenshot */
	out: string;
	/** Window width in pixels */
	width?: number;
	/** Window height in pixels */
	height?: number;
	/** Time to wait for rendering in milliseconds */
	settleMs?: number;
};

/**
 * Interface for terminal capture adapters
 * Allows swapping between macOS Terminal.app and browser-based implementations
 */
export type TerminalCaptureAdapter = {
	/**
	 * Captures a terminal screenshot by running a command
	 */
	capture(options: TerminalCaptureOptions): Promise<void>;

	/**
	 * Returns true if this adapter is supported on current platform
	 */
	isSupported(): boolean;

	/**
	 * Returns the adapter name for logging
	 */
	getName(): string;
};
