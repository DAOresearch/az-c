/**
 * Capture module - Screenshot capture functionality
 */

export type { RenderScenario } from "./renderer";
export { renderComponent, setRenderComponentHook } from "./renderer";
export { runCapture } from "./runner";
export type {
	TerminalCaptureAdapter,
	TerminalCaptureOptions,
} from "./terminal";
export { captureTerminal, resetAdapter } from "./terminal";
