export const DEV_ROOT = ".dev";

export const PATHS = {
	screenshots: `${DEV_ROOT}/screenshots`,
	reports: `${DEV_ROOT}/reports`,
	logs: `${DEV_ROOT}/logs`,
} as const;

export type PathKey = keyof typeof PATHS;
