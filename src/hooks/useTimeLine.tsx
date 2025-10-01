import { createTimeline, engine, type TimelineOptions } from "@opentui/core";
import { useEffect, useMemo } from "react";

export const useTimeline = (options: TimelineOptions = {}) => {
	// Create a single Timeline instance for the component's lifetime
	// biome-ignore lint/correctness/useExhaustiveDependencies: options is intentionally omitted to create a stable timeline instance that persists for the component's lifetime
	const timeline = useMemo(() => createTimeline(options), []);

	// Destructure autoplay to include in dependencies
	const { autoplay = true } = options;

	useEffect(() => {
		// Autoplay by default unless explicitly disabled
		if (autoplay) {
			timeline.play();
		}

		engine.register(timeline);

		return () => {
			timeline.pause();
			engine.unregister(timeline);
		};
	}, [timeline, autoplay]);

	return timeline;
};
