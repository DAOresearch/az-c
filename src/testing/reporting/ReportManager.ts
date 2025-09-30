/**
 * Report Manager - Handles versioning and cleanup of test reports
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { testLogger } from "@/services/logger";

export type RunMetadata = {
	runId: string; // Timestamp-based ID: YYYY-MM-DD_HHMMSS
	timestamp: number;
	name?: string; // Optional named run
	totalTests: number;
	passed: number;
	failed: number;
	passRate: number;
	duration: number;
};

export type ReportManagerConfig = {
	baseDir: string; // Base reports directory (default: "reports")
	keepHistory: number; // Number of runs to keep (default: 10)
	namedRuns?: string[]; // Named runs to preserve (don't count toward limit)
};

const DEFAULT_CONFIG: ReportManagerConfig = {
	baseDir: "reports",
	keepHistory: 10,
	namedRuns: [],
};

const RUNS_DIR = "runs";
const RUNS_MANIFEST = "runs.json";
const TIMESTAMP_FORMAT_LENGTH = 19;

/**
 * Manages report versioning, history, and cleanup
 */
export class ReportManager {
	private readonly config: ReportManagerConfig;

	constructor(config?: Partial<ReportManagerConfig>) {
		this.config = {
			...DEFAULT_CONFIG,
			...config,
			// Ensure keepHistory has a value (use default if undefined)
			keepHistory: config?.keepHistory ?? DEFAULT_CONFIG.keepHistory,
		};
	}

	/**
	 * Generates a timestamp-based run ID
	 */
	private generateRunId(name?: string): string {
		const now = new Date();
		const timestamp = now
			.toISOString()
			.slice(0, TIMESTAMP_FORMAT_LENGTH)
			.replace("T", "_")
			.replaceAll(":", "")
			.replaceAll("-", "");

		return name ? `${timestamp}_${name}` : timestamp;
	}

	/**
	 * Gets the directory path for a specific run
	 */
	getRunDir(runId: string): string {
		return path.join(this.config.baseDir, RUNS_DIR, runId);
	}

	/**
	 * Creates a new versioned report directory
	 */
	async createRun(
		name?: string
	): Promise<{ runId: string; runDir: string; latestDir: string }> {
		const runId = this.generateRunId(name);
		const runDir = this.getRunDir(runId);
		const latestDir = this.config.baseDir;

		// Create run directory
		await mkdir(runDir, { recursive: true });

		testLogger.info(`Created run directory: ${runDir}`);

		return { runId, runDir, latestDir };
	}

	/**
	 * Saves run metadata to manifest
	 */
	async saveRunMetadata(metadata: RunMetadata): Promise<void> {
		const manifestPath = path.join(this.config.baseDir, RUNS_MANIFEST);

		let manifest: RunMetadata[] = [];

		// Load existing manifest
		try {
			const content = await readFile(manifestPath, "utf-8");
			manifest = JSON.parse(content);
		} catch {
			// File doesn't exist yet, start fresh
		}

		// Add new run
		manifest.push(metadata);

		// Sort by timestamp (newest first)
		manifest.sort((a, b) => b.timestamp - a.timestamp);

		// Save updated manifest
		await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

		testLogger.info(`Updated runs manifest with run: ${metadata.runId}`);
	}

	/**
	 * Gets all run metadata from manifest
	 */
	async getRunHistory(): Promise<RunMetadata[]> {
		const manifestPath = path.join(this.config.baseDir, RUNS_MANIFEST);

		try {
			const content = await readFile(manifestPath, "utf-8");
			return JSON.parse(content);
		} catch {
			return [];
		}
	}

	/**
	 * Cleans up old runs, keeping only the most recent N runs
	 * Named runs are preserved regardless of age
	 */
	async cleanupOldRuns(): Promise<void> {
		const history = await this.getRunHistory();
		const runsDir = path.join(this.config.baseDir, RUNS_DIR);

		// Separate named runs from regular runs
		const namedRuns = history.filter((run) => run.name);
		const regularRuns = history.filter((run) => !run.name);

		// Determine which regular runs to delete
		const runsToDelete = regularRuns.slice(this.config.keepHistory);

		if (runsToDelete.length === 0) {
			testLogger.info("No old runs to clean up");
			return;
		}

		testLogger.info(
			`Cleaning up ${runsToDelete.length} old runs (keeping ${this.config.keepHistory})`
		);

		// Delete old run directories
		for (const run of runsToDelete) {
			const runDir = path.join(runsDir, run.runId);
			try {
				await rm(runDir, { recursive: true, force: true });
				testLogger.info(`Deleted old run: ${run.runId}`);
			} catch (error) {
				testLogger.warn(`Failed to delete run ${run.runId}:`, error);
			}
		}

		// Update manifest to remove deleted runs
		const updatedHistory = [
			...namedRuns,
			...regularRuns.slice(0, this.config.keepHistory),
		];
		updatedHistory.sort((a, b) => b.timestamp - a.timestamp);

		const manifestPath = path.join(this.config.baseDir, RUNS_MANIFEST);
		await writeFile(
			manifestPath,
			JSON.stringify(updatedHistory, null, 2),
			"utf-8"
		);

		testLogger.info("Cleanup complete");
	}

	/**
	 * Lists all available runs
	 */
	async listRuns(): Promise<RunMetadata[]> {
		return await this.getRunHistory();
	}

	/**
	 * Deletes a specific run by ID
	 */
	async deleteRun(runId: string): Promise<void> {
		const runDir = this.getRunDir(runId);

		// Delete directory
		await rm(runDir, { recursive: true, force: true });

		// Update manifest
		const history = await this.getRunHistory();
		const updatedHistory = history.filter((run) => run.runId !== runId);

		const manifestPath = path.join(this.config.baseDir, RUNS_MANIFEST);
		await writeFile(
			manifestPath,
			JSON.stringify(updatedHistory, null, 2),
			"utf-8"
		);

		testLogger.info(`Deleted run: ${runId}`);
	}

	/**
	 * Gets a specific run's directory
	 */
	async getRun(runId: string): Promise<string | null> {
		const runDir = this.getRunDir(runId);
		const runsDir = path.join(this.config.baseDir, RUNS_DIR);

		try {
			const runs = await readdir(runsDir);
			if (runs.includes(runId)) {
				return runDir;
			}
		} catch {
			// Runs directory doesn't exist
		}

		return null;
	}

	/**
	 * Copies latest report to versioned run directory
	 */
	async archiveCurrentRun(runId: string): Promise<void> {
		const latestHtml = path.join(this.config.baseDir, "index.html");
		const latestJson = path.join(this.config.baseDir, "results.json");

		const runDir = this.getRunDir(runId);
		const archivedHtml = path.join(runDir, "index.html");
		const archivedJson = path.join(runDir, "results.json");

		// Copy files
		try {
			const htmlContent = await readFile(latestHtml, "utf-8");
			await writeFile(archivedHtml, htmlContent, "utf-8");

			const jsonContent = await readFile(latestJson, "utf-8");
			await writeFile(archivedJson, jsonContent, "utf-8");

			testLogger.info(`Archived run to: ${runDir}`);
		} catch (error) {
			testLogger.error("Failed to archive run:", error);
			throw error;
		}
	}
}
