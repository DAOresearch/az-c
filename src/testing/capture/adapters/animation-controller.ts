import { engine as timelineEngine } from "@opentui/core";

export type AnimationCaptureConfig = {
	duration: number;
	frameCount: number;
};

export type FrameCaptureHandler = (
	frameIndex: number,
	timestamp: number
) => Promise<void>;

export class AnimationController {
	private readonly engine: typeof timelineEngine;

	constructor(engine = timelineEngine) {
		this.engine = engine;
	}

	async captureFrames(
		config: AnimationCaptureConfig,
		captureFrame: FrameCaptureHandler
	): Promise<void> {
		const { duration, frameCount } = config;
		if (frameCount <= 0) {
			return;
		}

		const frameInterval =
			frameCount > 1 ? duration / (frameCount - 1) : duration;
		let currentTime = 0;

		for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
			const targetTime = frameInterval * frameIndex;
			const delta = targetTime - currentTime;
			if (delta > 0) {
				this.engine.update(delta);
				currentTime = targetTime;
			}

			await captureFrame(frameIndex, targetTime);
		}
	}
}
