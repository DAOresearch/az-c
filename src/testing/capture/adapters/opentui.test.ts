import { describe, expect, test } from "bun:test";
import { OpenTUITestAdapter } from "./opentui";

describe("OpenTUITestAdapter", () => {
	test("logs descriptive error when spec import fails", async () => {
		const logs: Array<{ message: string; meta?: Record<string, unknown> }> = [];
		const adapter = new OpenTUITestAdapter({
			importModule: () => Promise.reject(new Error("module not found")),
			render: () => Promise.resolve(),
			createLogger: () => ({
				error(message, meta) {
					logs.push({ message, meta });
				},
				warn() {
					// no-op for tests
				},
			}),
		});

		const specPath = "/path/to/component.spec.tsx";
		const scenarioIndex = 3;

		await expect(
			adapter.capture({
				specPath,
				scenarioIndex,
			})
		).rejects.toThrow("module not found");

		expect(logs).toHaveLength(1);
		expect(logs[0]?.message).toContain(specPath);
		expect(logs[0]?.message).toContain(String(scenarioIndex));
		expect(logs[0]?.meta?.specPath).toBe(specPath);
		expect(logs[0]?.meta?.scenarioIndex).toBe(scenarioIndex);
		expect(logs[0]?.meta?.error).toBe("module not found");
	});

	test("captureAnimation uses same error handling", async () => {
		const logs: Array<{ message: string; meta?: Record<string, unknown> }> = [];
		const adapter = new OpenTUITestAdapter({
			importModule: () => Promise.reject(new Error("boom")),
			render: () => Promise.resolve(),
			createLogger: () => ({
				error(message, meta) {
					logs.push({ message, meta });
				},
				warn() {
					// no-op for tests
				},
			}),
		});

		const specPath = "/path/to/component.spec.tsx";
		const scenarioIndex = 1;

		await expect(
			adapter.captureAnimation({
				specPath,
				scenarioIndex,
				animation: {
					duration: 400,
					screenshots: 5,
				},
			})
		).rejects.toThrow("boom");

		expect(logs).toHaveLength(1);
		expect(logs[0]?.message).toContain(specPath);
		expect(logs[0]?.message).toContain(String(scenarioIndex));
	});
});
