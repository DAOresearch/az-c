/**
 * macOS Terminal.app adapter for terminal screenshot capture
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "@/services/logger";
import type { TerminalCaptureAdapter, TerminalCaptureOptions } from "./types";

const execFileP = promisify(execFile);

/**
 * Dedents a template literal string by removing leading tabs from each line
 */
function dedent(str: string): string {
	const REGEXP = /^\t+/gm;
	return str.replace(REGEXP, "").trim();
}

/**
 * macOS Terminal.app adapter
 * Uses AppleScript to control Terminal.app and screencapture to grab screenshots
 */
export class MacOSTerminalAdapter implements TerminalCaptureAdapter {
	isSupported(): boolean {
		return process.platform === "darwin";
	}

	getName(): string {
		return "macOS Terminal.app";
	}

	async capture(options: TerminalCaptureOptions): Promise<void> {
		const { cmd, out, width = 900, height = 600, settleMs = 2500 } = options;

		const x = 40;
		const y = 40;

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
}
