import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { engine as timelineEngine } from "@opentui/core";
import { createTestRenderer } from "@opentui/core/testing";
import { logger } from "@/services/logger";
import { setRenderComponentHook } from "@/testing/capture";
import { AnimationController } from "./animation-controller";
import { ANSIConverter } from "./ansi-converter";
import { ReactRenderer } from "./react-renderer";
import type {
	AnimationCaptureOptions,
	TerminalCaptureAdapter,
	TerminalCaptureOptions,
	TerminalTheme,
} from "./types";

const DEFAULT_THEME: TerminalTheme = {
	backgroundColor: "#000000",
	fontFamily: "'Berkeley Mono', 'Fira Code', 'SFMono-Regular', monospace",
	fontSize: 16,
	colors: {
		black: "#000000",
		red: "#ff5f56",
		green: "#27c93f",
		yellow: "#f5a623",
		blue: "#1c7cd6",
		magenta: "#ff6cc9",
		cyan: "#5fd2f7",
		white: "#f5f5f5",
		brightBlack: "#4a4a4a",
		brightRed: "#ff8f7e",
		brightGreen: "#7ef29d",
		brightYellow: "#ffcf6e",
		brightBlue: "#6fb3ff",
		brightMagenta: "#ff9aff",
		brightCyan: "#9cdbff",
		brightWhite: "#ffffff",
	},
};

const CAPTURE_COMMAND_REGEX = /^SCENARIO_INDEX=(\d+)\s+bun\s+(.+)$/;
const DEFAULT_TERMINAL_WIDTH = 900;
const DEFAULT_TERMINAL_HEIGHT = 600;

function parseCaptureCommand(cmd: string): {
	scenarioIndex: number;
	specPath: string;
} {
	const match = cmd.match(CAPTURE_COMMAND_REGEX);
	if (!match) {
		throw new Error(`Unsupported capture command: ${cmd}`);
	}

	const indexRaw = match[1];
	const specRaw = match[2];
	if (indexRaw === undefined || !specRaw) {
		throw new Error(`Invalid capture command: ${cmd}`);
	}

	const scenarioIndex = Number.parseInt(indexRaw, 10);
	const specPath = specRaw.trim();
	if (!Number.isFinite(scenarioIndex) || specPath.length === 0) {
		throw new Error(`Invalid capture command: ${cmd}`);
	}

	return { scenarioIndex, specPath };
}

async function ensureDirectory(filePath: string): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function delay(ms: number): Promise<void> {
	if (ms <= 0) {
		return;
	}

	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export class OpenTUITestAdapter implements TerminalCaptureAdapter {
	private readonly adapterLogger = logger.child({ name: "OpenTUITestAdapter" });
	private readonly converter = new ANSIConverter(DEFAULT_THEME);

	getName(): string {
		return "OpenTUI Test Adapter";
	}

	isSupported(): boolean {
		return true;
	}

	async capture(options: TerminalCaptureOptions): Promise<void> {
		const { scenarioIndex, specPath } = parseCaptureCommand(options.cmd);
		process.env.SCENARIO_INDEX = `${scenarioIndex}`;

		await ensureDirectory(options.out);
		this.adapterLogger.info(
			`Rendering scenario #${scenarioIndex} -> ${options.out}`
		);

		const width = options.width ?? DEFAULT_TERMINAL_WIDTH;
		const height = options.height ?? DEFAULT_TERMINAL_HEIGHT;
		const { renderer, renderOnce, captureCharFrame, resize } =
			await createTestRenderer({
				width,
				height,
			});
		resize(width, height);
		timelineEngine.attach(renderer);

		const reactRenderer = new ReactRenderer(renderer, renderOnce);

		setRenderComponentHook(async ({ render }) => {
			const element = render();
			await reactRenderer.mount(element);
		});

		try {
			const moduleUrl = pathToFileURL(specPath).href;
			await import(moduleUrl);

			await reactRenderer.renderFrame();
			await delay(options.settleMs ?? 0);
			const ansi = captureCharFrame();
			const svg = this.converter.toSVG(ansi);
			await this.converter.toPNG(svg, options.out);
		} finally {
			setRenderComponentHook(null);
			timelineEngine.detach();
		}
	}

	async captureAnimation(options: AnimationCaptureOptions): Promise<void> {
		const { scenarioIndex, specPath } = parseCaptureCommand(options.cmd);
		process.env.SCENARIO_INDEX = `${scenarioIndex}`;

		await ensureDirectory(`${options.baseFilename}_frame_0.png`);
		this.adapterLogger.info(
			`Rendering animation scenario #${scenarioIndex} -> ${options.baseFilename}`
		);

		const width = options.width ?? DEFAULT_TERMINAL_WIDTH;
		const height = options.height ?? DEFAULT_TERMINAL_HEIGHT;
		const { renderer, renderOnce, captureCharFrame, resize } =
			await createTestRenderer({
				width,
				height,
			});
		resize(width, height);
		timelineEngine.attach(renderer);

		const reactRenderer = new ReactRenderer(renderer, renderOnce);
		const animationController = new AnimationController(timelineEngine);

		setRenderComponentHook(async ({ render }) => {
			const element = render();
			await reactRenderer.mount(element);
		});

		try {
			const moduleUrl = pathToFileURL(specPath).href;
			await import(moduleUrl);

			await reactRenderer.renderFrame();
			await animationController.captureFrames(
				{
					duration: options.animation.duration,
					frameCount: options.animation.screenshots,
				},
				async (frameIndex) => {
					await reactRenderer.renderFrame();
					const ansi = captureCharFrame();
					const svg = this.converter.toSVG(ansi);
					await this.converter.toPNG(
						svg,
						`${options.baseFilename}_frame_${frameIndex}.png`
					);
				}
			);
		} finally {
			setRenderComponentHook(null);
			timelineEngine.detach();
		}
	}
}
