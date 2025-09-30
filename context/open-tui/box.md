```typescript
import { render } from "@opentui/react";

export const App = () => (
	<>
		<box flexDirection="column">
			<text attributes={1} content="Box Examples" />
			<box border>
				<text content="1. Standard Box" />
			</box>
			<box border title="Title">
				<text content="2. Box with Title" />
			</box>
			<box backgroundColor="blue" border>
				<text content="3. Box with Background Color" />
			</box>
			<box border padding={1}>
				<text content="4. Box with Padding" />
			</box>
			<box border margin={1}>
				<text content="5. Box with Margin" />
			</box>
			<box alignItems="center" border>
				<text content="6. Centered Text" />
			</box>
			<box border height={5} justifyContent="center">
				<text content="7. Justified Center" />
			</box>
			<box backgroundColor="red" border title="Nested Boxes">
				<box backgroundColor="blue" border>
					<text content="8. Nested Box" />
				</box>
			</box>
		</box>
	</>
);

render(<App />);

```
