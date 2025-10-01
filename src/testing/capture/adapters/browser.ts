import fs from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { type Browser, chromium, type Page } from "playwright";
import { logger } from "@/services/logger";
import type { RunCommandResult } from "./pty-helper";
import { runCommand } from "./pty-helper";
import type { TerminalCaptureAdapter, TerminalCaptureOptions } from "./types";

type TerminalDimensions = {
	cols: number;
	rows: number;
};

const TEMPLATE_PATH = join(
	dirname(fileURLToPath(import.meta.url)),
	"terminal-template.html"
);
const TEMPLATE_URL = pathToFileURL(TEMPLATE_PATH).href;

const toErrorMessage = (value: unknown, fallback: string): string => {
	if (value instanceof Error) {
		return value.message;
	}
	if (typeof value === "string") {
		return value;
	}
	return fallback;
};

const waitForTerminalReady = async (page: Page): Promise<void> => {
	await page.waitForFunction(() => {
		const win = globalThis as unknown as {
			terminal?: { write: (data: string) => void };
		};
		return Boolean(win.terminal);
	});
};

const getTerminalDimensions = async (page: Page): Promise<TerminalDimensions> =>
	await page.evaluate(() => {
		type TerminalBridge = {
			measure: () => TerminalDimensions;
		};
		const win = globalThis as unknown as { terminal?: TerminalBridge };
		if (!win.terminal) {
			throw new Error("Terminal bridge not initialised");
		}
		const dimensions = win.terminal.measure();
		if (!dimensions) {
			throw new Error("Failed to measure terminal dimensions");
		}
		return dimensions;
	});

const clearTerminal = async (page: Page): Promise<void> => {
	await page.evaluate(() => {
		type TerminalBridge = {
			clear: () => void;
		};
		const win = globalThis as unknown as { terminal?: TerminalBridge };
		win.terminal?.clear();
	});
};

const initTerminal = async (
	page: Page,
	dimensions: TerminalDimensions
): Promise<void> => {
	await page.evaluate(({ cols, rows }) => {
		type TerminalBridge = {
			init: (cols?: number, rows?: number) => void;
		};
		const win = globalThis as unknown as { terminal?: TerminalBridge };
		win.terminal?.init(cols, rows);
	}, dimensions);
};

const writeToTerminal = async (page: Page, text: string): Promise<void> => {
	await page.evaluate((chunk) => {
		type TerminalBridge = {
			write: (data: string) => void;
		};
		const win = globalThis as unknown as { terminal?: TerminalBridge };
		win.terminal?.write(chunk);
	}, text);
};

const launchBrowser = async (): Promise<Browser> => {
	try {
		return await chromium.launch({ headless: true });
	} catch (error) {
		const message = toErrorMessage(error, "Unknown error");
		throw new Error(
			`Failed to launch Playwright browser: ${message}.\n` +
				"Hint: Run 'bunx playwright install chromium' to install the required browser."
		);
	}
};

const openTerminalPage = async (
	browser: Browser,
	width: number,
	height: number
): Promise<Page> => {
	const page = await browser.newPage();
	await page.setViewportSize({ width, height });

	const response = await page.goto(TEMPLATE_URL);
	if (!response) {
		throw new Error(`Failed to load terminal template from ${TEMPLATE_PATH}.`);
	}
	if (!response.ok()) {
		throw new Error(
			`Failed to load terminal template from ${TEMPLATE_PATH}. HTTP status: ${response.status()}`
		);
	}

	await waitForTerminalReady(page);
	return page;
};

const prepareTerminal = async (page: Page): Promise<TerminalDimensions> => {
	const dimensions = await getTerminalDimensions(page);
	await clearTerminal(page);
	await initTerminal(page, dimensions);
	return dimensions;
};

const captureScreenshotImage = async (
	page: Page,
	out: string,
	settleMs: number
): Promise<void> => {
	await fs.mkdir(dirname(out), { recursive: true });
	await page.waitForTimeout(settleMs);
	await page.screenshot({ path: out, fullPage: false });
};

const streamCommandOutput = async (
	page: Page,
	cmd: string,
	dimensions: TerminalDimensions
): Promise<RunCommandResult> =>
	await runCommand(cmd, {
		cols: dimensions.cols,
		rows: dimensions.rows,
		onData: async (chunk) => {
			await writeToTerminal(page, chunk);
		},
	});

export class BrowserTerminalAdapter implements TerminalCaptureAdapter {
	isSupported(): boolean {
		return true;
	}

	getName(): string {
		return "Browser Terminal (Playwright)";
	}

	async capture(options: TerminalCaptureOptions): Promise<void> {
		const { cmd, out, width = 900, height = 600, settleMs = 2500 } = options;

		logger.info(`Capturing terminal: ${cmd}`);

		let browser: Browser | undefined;
		let page: Page | undefined;
		let screenshotSaved = false;

		try {
			browser = await launchBrowser();
			page = await openTerminalPage(browser, width, height);
			const dimensions = await prepareTerminal(page);
			const result = await streamCommandOutput(page, cmd, dimensions);

			await captureScreenshotImage(page, out, settleMs);
			screenshotSaved = true;

			if (result.exitCode !== 0) {
				throw new Error(
					`Command exited with status ${result.exitCode}. Screenshot saved to ${out}.\nCheck the screenshot for captured output.`
				);
			}

			logger.info(`Screenshot saved: ${out}`);
		} catch (error) {
			if (page && !screenshotSaved) {
				try {
					await captureScreenshotImage(page, out, settleMs);
					screenshotSaved = true;
				} catch (screenshotError) {
					const message = toErrorMessage(
						screenshotError,
						"Unknown screenshot error"
					);
					logger.error(`Failed to capture fallback screenshot: ${message}`);
				}
			}

			const message = toErrorMessage(error, "Unknown capture error");
			logger.error(`Failed to capture: ${message}`);
			throw new Error(`Browser terminal capture failed: ${message}`);
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}
}
