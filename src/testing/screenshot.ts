import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "@/services/logger";

const execFileP = promisify(execFile);

export type TerminalScreenshotOptions = {
	/** The command to run in the terminal */
	cmd: string;
	/** Output filename for the screenshot */
	out?: string;
	/** Window width in pixels */
	width?: number;
	/** Window height in pixels */
	height?: number;
	/** Window x position */
	x?: number;
	/** Window y position */
	y?: number;
	/** Time to wait for rendering in milliseconds */
	settleMs?: number;
};

/**
 * Runs a command in Terminal.app, resizes the window, grabs its AXWindowID,
 * screenshots that exact window with `screencapture`, then closes it.
 *
 * Requirements (first run will prompt):
 * - Screen Recording permission (for `screencapture`)
 * - Accessibility permission (for System Events to read AXWindowID)
 */
export async function captureTerminalScreenshot(
	options: TerminalScreenshotOptions
): Promise<void> {
	const {
		cmd,
		out = "terminal.png",
		width = 900,
		height = 600,
		x = 40,
		y = 40,
		settleMs = 2500,
	} = options;

	// 1) Create a new Terminal window, run the command, size/position it
	const osa = dedent(`
		on run argv
			set theCmd to item 1 of argv
			set pxX to (item 2 of argv) as integer
			set pxY to (item 3 of argv) as integer
			set pxW to (item 4 of argv) as integer
			set pxH to (item 5 of argv) as integer
			tell application "Terminal"
				do script theCmd
				delay 0.5
				activate
				set theWin to front window
				set bounds of theWin to {pxX, pxY, pxX + pxW, pxY + pxH}
			end tell
			return "ok"
		end run
	`);

	try {
		const args: string[] = [
			"-e",
			osa,
			cmd,
			String(x),
			String(y),
			String(width),
			String(height),
		];
		await execFileP("osascript", args);

		// 2) Give the app a beat to render, then capture the front window
		await new Promise((res) => setTimeout(res, settleMs));

		// Get window bounds to capture the exact region
		const getBounds = dedent(`
			tell application "Terminal"
				get bounds of front window
			end tell
		`);

		const { stdout: boundsStr } = await execFileP("osascript", [
			"-e",
			getBounds,
		]);
		const bounds = boundsStr.trim().split(", ").map(Number);
		const [x1, y1, x2, y2] = bounds;
		if (!(x1 && y1 && x2 && y2)) {
			throw new Error("Failed to get window bounds");
		}

		await execFileP("/usr/sbin/screencapture", [
			"-x",
			"-R",
			`${x1},${y1},${x2 - x1},${y2 - y1}`,
			out,
		]);

		logger.info(`Saved ${out}`);
	} finally {
		// 3) Force close the window we opened (best-effort)
		// First kill the process, then close the window
		const osaClose = dedent(`
			tell application "Terminal"
				try
					-- Send Control-C to kill the running process
					tell application "System Events"
						keystroke "c" using control down
					end tell
					delay 0.2
					-- Now close the window without saving
					close (front window) saving no
				end try
			end tell
		`);
		await execFileP("osascript", ["-e", osaClose]).catch(() => {
			logger.error("Failed to close terminal window");
		});
	}
}

// CLI wrapper when run directly
// if (import.meta.url === `file://${process.argv[1]}`) {
// 	const [, , cmd, out, width, height, x, y, settleMs] = process.argv;

// 	if (!cmd) {
// 		logger.error(
// 			"Usage: bun y.ts '<command>' [out.png] [width] [height] [x] [y] [settleMs]"
// 		);
// 		process.exit(1);
// 	}

// 	captureTerminalScreenshot({
// 		cmd,
// 		out,
// 		width: width ? Number(width) : undefined,
// 		height: height ? Number(height) : undefined,
// 		x: x ? Number(x) : undefined,
// 		y: y ? Number(y) : undefined,
// 		settleMs: settleMs ? Number(settleMs) : undefined,
// 	}).catch((err) => {
// 		logger.error(err);
// 		process.exit(1);
// 	});
// }

/**
 * Dedents a template literal string by removing leading tabs from each line
 */
function dedent(str: string): string {
	const REGEXP = /^\t+/gm;
	return str.replace(REGEXP, "").trim();
}
