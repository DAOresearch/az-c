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

export type AnimationConfig = {
	/** Total animation duration in milliseconds */
	duration: number;
	/** Number of frames to capture over the duration */
	screenshots: number;
};

export type AnimationCaptureOptions = TerminalCaptureOptions & {
	/** Base filename used to write animation frames */
	baseFilename: string;
	/** Animation capture configuration */
	animation: AnimationConfig;
};

export type TerminalTheme = {
	colors: Record<string, string>;
	fontSize: number;
	fontFamily: string;
	backgroundColor: string;
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
	 * Captures an animation sequence if supported by the adapter
	 */
	captureAnimation?(options: AnimationCaptureOptions): Promise<void>;

	/**
	 * Returns true if this adapter is supported on current platform
	 */
	isSupported(): boolean;

	/**
	 * Returns the adapter name for logging
	 */
	getName(): string;
};
