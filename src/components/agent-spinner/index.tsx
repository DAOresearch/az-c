import { useEffect, useMemo, useState } from "react";
import { useTimeline } from "@/hooks/useTimeLine";

export type AgentSpinnerProps = {
	tokensUsed?: number;
	tokensMax?: number;
};

// Spinner frames and timing
const SPINNER_FRAMES = [
	"⠋",
	"⠙",
	"⠹",
	"⠸",
	"⠼",
	"⠴",
	"⠦",
	"⠧",
	"⠇",
	"⠏",
] as const;
const SPINNER_INTERVAL_MS = 80;

// Adjectives (20 quirky options)
const ADJECTIVES = [
	"vibing",
	"percolating",
	"pontificating",
	"ruminating",
	"cogitating",
	"marinating",
	"noodling",
	"tinkering",
	"brewing",
	"simmering",
	"fermenting",
	"gestating",
	"incubating",
	"mulling",
	"contemplating",
	"deliberating",
	"musing",
	"pondering",
	"surfing",
	"hussalin",
] as const;

// Color thresholds
const COLOR_GREEN = "#50C878";
const COLOR_ORANGE = "#E07A5F";
const COLOR_RED = "#E74C3C";
const PERCENTAGE_HIGH = 80;
const PERCENTAGE_MEDIUM = 50;

// Bar configuration
const MAX_BAR_WIDTH = 20;
const PERCENTAGE_MULTIPLIER = 100;

// Number formatting
const THOUSAND = 1000;
const DECIMAL_PLACES_NONE = 0;
const DECIMAL_PLACES_ONE = 1;

// Animation
const ANIMATION_DURATION_MS = 400;
const FALLBACK_TIMEOUT_MS = 450;

// Layout
const ADJECTIVE_WIDTH = 16;
const PADDING_CHAR = ".";

// Helpers
const renderBar = (width: number): string => {
	const clamped = Math.max(0, Math.min(MAX_BAR_WIDTH, width));
	const filled = Math.round(clamped);
	const empty = MAX_BAR_WIDTH - filled;
	return "█".repeat(filled) + "░".repeat(empty);
};

const getBarColor = (percentage: number): string => {
	if (percentage > PERCENTAGE_HIGH) return COLOR_RED;
	if (percentage > PERCENTAGE_MEDIUM) return COLOR_ORANGE;
	return COLOR_GREEN;
};

const formatTokens = (used: number, max: number): string => {
	const formatNumber = (n: number): string => {
		if (n >= THOUSAND) {
			const k = n / THOUSAND;
			const str = Number.isInteger(k)
				? k.toFixed(DECIMAL_PLACES_NONE)
				: k.toFixed(DECIMAL_PLACES_ONE);
			return `${str}k`;
		}
		return n.toString();
	};
	const percentage = Math.round((used / max) * PERCENTAGE_MULTIPLIER);
	return `${formatNumber(used)}/${formatNumber(max)} tokens (${percentage}%)`;
};

export const AgentSpinner = ({ tokensUsed, tokensMax }: AgentSpinnerProps) => {
	// Spinner animation
	const [spinnerIndex, setSpinnerIndex] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setSpinnerIndex((prev) => (prev + 1) % SPINNER_FRAMES.length);
		}, SPINNER_INTERVAL_MS);
		return () => clearInterval(interval);
	}, []);

	// Random adjective chosen once on mount
	const adjective = useMemo(() => {
		const idx = Math.floor(Math.random() * ADJECTIVES.length);
		return ADJECTIVES[idx] ?? ADJECTIVES[0];
	}, []);
	const paddedAdjective = useMemo(
		() => adjective.padEnd(ADJECTIVE_WIDTH, PADDING_CHAR),
		[adjective]
	);

	// Display state (animated)
	const [displayedTokens, setDisplayedTokens] = useState<number>(
		tokensUsed ?? 0
	);
	const [displayedBarWidth, setDisplayedBarWidth] = useState<number>(() => {
		if (tokensUsed && tokensMax) {
			const percentage = (tokensUsed / tokensMax) * PERCENTAGE_MULTIPLIER;
			return (percentage / PERCENTAGE_MULTIPLIER) * MAX_BAR_WIDTH;
		}
		return 0;
	});

	// Timeline for synchronized animations
	const timeline = useTimeline({
		duration: ANIMATION_DURATION_MS,
		loop: false,
	});

	// Animate when props change (synchronized counter + bar)
	useEffect(() => {
		if (!(tokensUsed && tokensMax)) return;

		const clampedUsed = Math.max(0, Math.min(tokensUsed, tokensMax));
		const newPercentage = (clampedUsed / tokensMax) * PERCENTAGE_MULTIPLIER;
		const newBarWidth = (newPercentage / PERCENTAGE_MULTIPLIER) * MAX_BAR_WIDTH;

		timeline.resetItems();

		// The onUpdate value type isn't exported; use a safe assertion.
		type UpdatePayload = {
			targets: Array<{ tokens: number; barWidth: number }>;
		};

		timeline.add(
			{ tokens: displayedTokens, barWidth: displayedBarWidth },
			{
				tokens: clampedUsed,
				barWidth: newBarWidth,
				duration: ANIMATION_DURATION_MS,
				ease: "outQuad",
				onUpdate: (values: unknown) => {
					const v = values as UpdatePayload;
					const t = v.targets[0];
					if (t) {
						setDisplayedTokens(Math.round(t.tokens));
						setDisplayedBarWidth(t.barWidth);
					}
				},
			},
			0
		);

		// Fallback to final state in capture/CI if timeline ticks are suppressed
		const fallback = setTimeout(() => {
			setDisplayedTokens(clampedUsed);
			setDisplayedBarWidth(newBarWidth);
		}, FALLBACK_TIMEOUT_MS);

		return () => clearTimeout(fallback);
	}, [tokensUsed, tokensMax, timeline, displayedTokens, displayedBarWidth]);

	// Fallback: no token data
	if (!(tokensUsed && tokensMax)) {
		return <text>{`${SPINNER_FRAMES[spinnerIndex]} ${paddedAdjective}`}</text>;
	}

	// Current animated percentage and color
	const currentPercentage =
		tokensMax > 0 ? (displayedTokens / tokensMax) * PERCENTAGE_MULTIPLIER : 0;
	const fg = getBarColor(currentPercentage);

	// Fixed-width layout: 2 + 16 + 22 + variable
	const bar = renderBar(displayedBarWidth);
	const tokensText = formatTokens(displayedTokens, tokensMax);
	const content = `${SPINNER_FRAMES[spinnerIndex]} ${paddedAdjective}  [${bar}]  ${tokensText}`;

	return <text fg={fg}>{content}</text>;
};
