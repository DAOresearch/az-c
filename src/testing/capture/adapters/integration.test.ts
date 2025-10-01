import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { captureTerminal, resetAdapter } from "../terminal";

const shouldRun = process.env.RUN_BROWSER_ADAPTER_TESTS === "true";

describe("Browser adapter integration", () => {
	afterEach(() => {
		resetAdapter();
	});

	test("captures component spec screenshot", async () => {
		if (!shouldRun) {
			console.warn(
				"Set RUN_BROWSER_ADAPTER_TESTS=true to execute browser adapter integration test."
			);
			return;
		}

		const dir = await fs.mkdtemp(
			path.join(os.tmpdir(), "browser-adapter-integration-")
		);
		const out = path.join(dir, "integration.png");

		await captureTerminal({
			cmd: "echo integration-test",
			out,
			width: 800,
			height: 480,
			settleMs: 500,
		});

		const stats = await fs.stat(out);
		expect(stats.size).toBeGreaterThan(0);
	});
});
