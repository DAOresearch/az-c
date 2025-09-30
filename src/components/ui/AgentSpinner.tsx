import { useEffect, useRef, useState } from "react";

// Animation timing constants
const TYPEWRITER_DELAY_MS = 80;
const SPINNER_ROTATION_DELAY_MS = 80;

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

// Helper function to get a random phrase
const getRandomPhrase = (): string => {
	const index = Math.floor(Math.random() * workingPhrases.length);
	return workingPhrases[index] ?? workingPhrases[0]; // Fallback to first phrase if somehow undefined
};

export const AgentSpinner = () => {
	const [phrase] = useState<string>(getRandomPhrase());
	const [displayText, setDisplayText] = useState("");
	const [spinnerIndex, setSpinnerIndex] = useState(0);
	const hasTypedRef = useRef(false);

	// Typewriter effect - only runs once
	useEffect(() => {
		if (hasTypedRef.current) return;

		let charIndex = 0;
		const typeNextChar = () => {
			if (charIndex <= phrase.length) {
				setDisplayText(phrase.slice(0, charIndex));
				charIndex++;
				setTimeout(typeNextChar, TYPEWRITER_DELAY_MS);
			} else {
				hasTypedRef.current = true;
			}
		};
		typeNextChar();
	}, [phrase]);

	// Spinner animation
	useEffect(() => {
		const interval = setInterval(() => {
			setSpinnerIndex((prev) => (prev + 1) % spinners.length);
		}, SPINNER_ROTATION_DELAY_MS);
		return () => clearInterval(interval);
	}, []);

	return (
		<text
			content={`${spinners[spinnerIndex]} ${displayText}...`}
			fg="#50C878" // Using assistant green color
		/>
	);
};
