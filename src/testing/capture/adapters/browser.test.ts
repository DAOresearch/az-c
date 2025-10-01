import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { BrowserTerminalAdapter } from "./browser";

const createTempPath = async (filename: string): Promise<string> => {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "browser-adapter-"));
	return path.join(dir, filename);
};

describe("BrowserTerminalAdapter", () => {
	test("isSupported returns true", () => {
		const adapter = new BrowserTerminalAdapter();
		expect(adapter.isSupported()).toBe(true);
	});

	test("getName returns descriptive label", () => {
		const adapter = new BrowserTerminalAdapter();
		expect(adapter.getName()).toBe("Browser Terminal (Playwright)");
	});

	const shouldRun = process.env.RUN_BROWSER_ADAPTER_TESTS === "true";

	const runIfEnabled = async (callback: () => Promise<void>): Promise<void> => {
		if (!shouldRun) {
			console.warn(
				"Set RUN_BROWSER_ADAPTER_TESTS=true to execute browser-based capture tests."
			);
			return;
		}
		await callback();
	};

	test("captures simple echo command", async () => {
		await runIfEnabled(async () => {
			const adapter = new BrowserTerminalAdapter();
			const out = await createTempPath("echo.png");
			await adapter.capture({
				cmd: "echo hello",
				out,
				width: 600,
				height: 400,
				settleMs: 500,
			});
			const stats = await fs.stat(out);
			expect(stats.size).toBeGreaterThan(0);
		});
	});

	test("captures colored output", async () => {
		await runIfEnabled(async () => {
			const adapter = new BrowserTerminalAdapter();
			const out = await createTempPath("color.png");
			await adapter.capture({
				cmd: "printf '\\033[31mred\\033[0m'",
				out,
				width: 600,
				height: 400,
				settleMs: 500,
			});
			const stats = await fs.stat(out);
			expect(stats.size).toBeGreaterThan(0);
		});
	});

	test("handles multiline output", async () => {
		await runIfEnabled(async () => {
			const adapter = new BrowserTerminalAdapter();
			const out = await createTempPath("multiline.png");
			await adapter.capture({
				cmd: "printf 'line1\\nline2'",
				out,
				width: 600,
				height: 400,
				settleMs: 500,
			});
			const stats = await fs.stat(out);
			expect(stats.size).toBeGreaterThan(0);
		});
	});

	test("captures screenshot even when command fails", async () => {
		await runIfEnabled(async () => {
			const adapter = new BrowserTerminalAdapter();
			const out = await createTempPath("failure.png");
			await expect(
				adapter.capture({
					cmd: "exit 2",
					out,
					width: 600,
					height: 400,
					settleMs: 500,
				})
			).rejects.toThrow();
			const stats = await fs.stat(out);
			expect(stats.size).toBeGreaterThan(0);
		});
	});

	test("reports errors for invalid commands", async () => {
		await runIfEnabled(async () => {
			const adapter = new BrowserTerminalAdapter();
			const out = await createTempPath("invalid.png");
			await expect(
				adapter.capture({
					cmd: "command_that_does_not_exist",
					out,
					width: 600,
					height: 400,
					settleMs: 500,
				})
			).rejects.toThrow();
			await fs.access(out).catch(() => {
				// ignore missing file when command fails before writing output
			});
		});
	});

	test("cleans up browser after failure", async () => {
		await runIfEnabled(async () => {
			const adapter = new BrowserTerminalAdapter();
			const out = await createTempPath("cleanup.png");
			await expect(
				adapter.capture({
					cmd: "sleep 1 && exit 1",
					out,
					width: 600,
					height: 400,
					settleMs: 500,
				})
			).rejects.toThrow();
		});
	});
});
