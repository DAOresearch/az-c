```typescript
import { type ASCIIFontName, measureText } from "@opentui/core";
import { render } from "@opentui/react";
import { useState } from "react";

export const App = () => {
	const text = "ASCII";
	const [font, setFont] = useState<ASCIIFontName>("tiny");

	const { width, height } = measureText({
		text,
		font,
	});

	return (
		<box style={{ paddingLeft: 1, paddingRight: 1 }}>
			<box
				style={{
					height: 8,
					marginBottom: 1,
					border: true,
				}}
			>
				<select
					focused
					onChange={(_, option) => setFont(option?.value)}
					options={[
						{
							name: "Tiny",
							description: "Tiny font",
							value: "tiny",
						},
						{
							name: "Block",
							description: "Block font",
							value: "block",
						},
						{
							name: "Slick",
							description: "Slick font",
							value: "slick",
						},
						{
							name: "Shade",
							description: "Shade font",
							value: "shade",
						},
					]}
					showScrollIndicator
					style={{ flexGrow: 1 }}
				/>
			</box>

			<ascii-font font={font} style={{ width, height }} text={text} />
		</box>
	);
};

render(<App />);

```
