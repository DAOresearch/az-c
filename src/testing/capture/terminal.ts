/**
 * Terminal capture facade
 * Provides a simple API that automatically selects the appropriate adapter
 */

import { logger } from "@/services/logger";
import { BrowserTerminalAdapter } from "./adapters/browser";
import { MacOSTerminalAdapter } from "./adapters/macos";
import type {
	TerminalCaptureAdapter,
	TerminalCaptureOptions,
} from "./adapters/types";

/**
 * Factory function to get the appropriate terminal capture adapter
 */
function getAdapter(): TerminalCaptureAdapter {
	// Try adapters in order of preference
	const adapters = [new MacOSTerminalAdapter(), new BrowserTerminalAdapter()];

	for (const adapter of adapters) {
		if (adapter.isSupported()) {
			logger.info(`Using terminal adapter: ${adapter.getName()}`);
			return adapter;
		}
	}

	throw new Error(
		"No supported terminal capture adapter found for this platform"
	);
}

// Singleton instance
let adapterInstance: TerminalCaptureAdapter | null = null;

/**
 * Captures a terminal screenshot using platform-appropriate adapter
 *
 * @example
 * await captureTerminal({
 *   cmd: "bun src/components/banner/banner.spec.tsx",
 *   out: "screenshots/banner.png",
 *   width: 900,
 *   height: 600,
 * });
 */
export function captureTerminal(
	options: TerminalCaptureOptions
): Promise<void> {
	if (!adapterInstance) {
		adapterInstance = getAdapter();
	}

	return adapterInstance.capture(options);
}

/**
 * Reset adapter (useful for testing)
 */
export function resetAdapter(): void {
	adapterInstance = null;
}

// Re-export types for convenience
export type {
	TerminalCaptureAdapter,
	TerminalCaptureOptions,
} from "./adapters/types";
