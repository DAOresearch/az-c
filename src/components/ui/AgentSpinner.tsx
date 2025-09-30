import { useEffect, useState } from "react";

// Animation timing constants
const TYPEWRITER_DELAY_MS = 80;
const PHRASE_DISPLAY_DURATION_MS = 2000;
const SPINNER_ROTATION_DELAY_MS = 80;
const COLOR_CYCLE_DELAY_MS = 500;

const workingPhrases = [
	"cooking up something good",
	"vibing with the code",
	"shocking the system",
	"jiving with the bits",
	"brewing some magic",
	"stirring the pot",
	"mixing the ingredients",
	"sprinkling some pixels",
	"seasoning the data",
	"baking fresh bytes",
	"whisking up solutions",
	"simmering nicely",
	"marinating ideas",
	"grilling the logic",
	"toasting to success",
	"blending smoothly",
	"chopping through tasks",
	"sautéing swiftly",
	"roasting the bugs",
	"frosting the cake",
] as const;

const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
const colors = [
	"#00FF00",
	"#00FFFF",
	"#FF00FF",
	"#FFFF00",
	"#FF6B6B",
	"#4ECDC4",
	"#95E1D3",
] as const;

// Helper function to get a random phrase
const getRandomPhrase = (): string => {
	const index = Math.floor(Math.random() * workingPhrases.length);
	return workingPhrases[index] ?? workingPhrases[0]; // Fallback to first phrase if somehow undefined
};

export const AgentSpinner = () => {
	const [phrase, setPhrase] = useState<string>(getRandomPhrase());
	const [displayText, setDisplayText] = useState("");
	const [spinnerIndex, setSpinnerIndex] = useState(0);
	const [colorIndex, setColorIndex] = useState(0);
	const [charIndex, setCharIndex] = useState(0);

	// Typewriter effect
	useEffect(() => {
		if (charIndex < phrase.length) {
			const timeout = setTimeout(() => {
				setDisplayText(phrase.slice(0, charIndex + 1));
				setCharIndex(charIndex + 1);
			}, TYPEWRITER_DELAY_MS);
			return () => clearTimeout(timeout);
		}
		// When done typing, wait a bit then pick a new phrase
		const timeout = setTimeout(() => {
			const newPhrase = getRandomPhrase();
			setPhrase(newPhrase);
			setDisplayText("");
			setCharIndex(0);
		}, PHRASE_DISPLAY_DURATION_MS);
		return () => clearTimeout(timeout);
	}, [charIndex, phrase]);

	// Spinner animation
	useEffect(() => {
		const interval = setInterval(() => {
			setSpinnerIndex((prev) => (prev + 1) % spinners.length);
		}, SPINNER_ROTATION_DELAY_MS);
		return () => clearInterval(interval);
	}, []);

	// Color cycling
	useEffect(() => {
		const interval = setInterval(() => {
			setColorIndex((prev) => (prev + 1) % colors.length);
		}, COLOR_CYCLE_DELAY_MS);
		return () => clearInterval(interval);
	}, []);

	return (
		<text
			content={`${spinners[spinnerIndex]} ${displayText}...`}
			fg={colors[colorIndex]}
		/>
	);
};
