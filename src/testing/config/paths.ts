export const DEV_ROOT = ".dev";

export const PATHS = {
	screenshots: `${DEV_ROOT}/screenshots`,
	reports: `${DEV_ROOT}/reports`,
	logs: `${DEV_ROOT}/logs`,
} as const;

export type PathKey = keyof typeof PATHS;

// File and directory names (relative)
export const FILES = {
	metadata: "metadata.json",
	reportIndex: "index.html",
	reportResults: "results.json",
	runsManifest: "runs.json",
} as const;

export const DIRS = {
	runs: "runs",
} as const;
