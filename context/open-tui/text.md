```typescript
import { render } from "../../opentui/packages/react/src";

function App() {
	return (
		<text>
			Color Showcase{"\n"}
			<span fg="red">Red text</span> <span fg="green">Green text</span>{" "}
			<span fg="blue">Blue text</span> <span fg="yellow">Yellow text</span>
			{"\n"}
			<span fg="magenta">Magenta</span> <span fg="cyan">Cyan</span>{" "}
			<span fg="white">White</span>
			{"\n"}
			Background colors:{"\n"}
			<span bg="yellow" fg="red">
				Red on Yellow
			</span>{" "}
			<span bg="green" fg="blue">
				Blue on Green
			</span>{" "}
			<span bg="magenta" fg="white">
				White on Magenta
			</span>
			{"\n"}
			<span bg="blue" fg="yellow">
				Yellow on Blue
			</span>{" "}
			<span bg="red" fg="green">
				Green on Red
			</span>{" "}
			<span bg="black" fg="cyan">
				Cyan on Black
			</span>
			{"\n"}
			Bright colors:{"\n"}
			<span fg="brightRed">Bright Red</span>{" "}
			<span fg="brightGreen">Bright Green</span>{" "}
			<span fg="brightBlue">Bright Blue</span>
			{"\n"}
			<span fg="brightYellow">Bright Yellow</span>{" "}
			<span fg="brightMagenta">Bright Magenta</span>{" "}
			<span fg="brightCyan">Bright Cyan</span>
			{"\n"}
			Text Formatting:{"\n"}
			<strong>Strong/Bold text</strong> - <em>Emphasized/Italic text</em> -{" "}
			<u>Underlined text</u>
			{"\n"}
			<b fg="yellow">Bold yellow</b> - <i fg="green">Italic green</i> -{" "}
			<u fg="magenta">Underlined magenta</u>
			{"\n"}
			Complex nesting:{"\n"}
			<strong fg="red">
				Bold red with <em fg="blue">italic blue nested</em> inside
			</strong>
			{"\n"}
			<em>
				Italic with <u fg="cyan">underlined cyan</u> and{" "}
				<strong fg="yellow">bold yellow</strong>
			</em>
			{"\n"}
			<span bg="black" fg="white">
				Background with <strong fg="brightRed">bold bright red</strong> and{" "}
				<u fg="brightGreen">underlined bright green</u>
			</span>
			{"\n"}
		</text>
	);
}

render(<App />);

```
