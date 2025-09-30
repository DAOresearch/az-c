/**
 * Browser-based terminal adapter (future implementation)
 * Will use headless browser + xterm.js for cross-platform screenshot capture
 */

import type { TerminalCaptureAdapter, TerminalCaptureOptions } from "./types";

/**
 * Browser-based terminal adapter (stub for future implementation)
 *
 * Future implementation will:
 * - Launch headless browser (Playwright/Puppeteer)
 * - Render xterm.js or similar terminal emulator
 * - Run command in PTY
 * - Take screenshot
 *
 * Benefits:
 * - Cross-platform (Windows, Linux, macOS)
 * - Consistent rendering across environments
 * - No AppleScript permission prompts
 * - Better control over terminal appearance
 */
export class BrowserTerminalAdapter implements TerminalCaptureAdapter {
	isSupported(): boolean {
		// Always supported (runs in browser context)
		// For now, disabled until implemented
		return false;
	}

	getName(): string {
		return "Browser Terminal (xterm.js)";
	}

	capture(options: TerminalCaptureOptions): Promise<void> {
		return Promise.reject(
			new Error(
				"BrowserTerminalAdapter not yet implemented. " +
					`Requested: ${options.cmd} -> ${options.out}`
			)
		);

		// TODO: Future implementation
		// const browser = await chromium.launch();
		// const page = await browser.newPage();
		// await page.setViewportSize({ width, height });
		// await page.goto("http://localhost:3000/terminal");
		// await page.evaluate((cmd) => window.terminal.exec(cmd), options.cmd);
		// await page.waitForTimeout(options.settleMs || 2000);
		// await page.screenshot({ path: options.out });
		// await browser.close();
	}
}
