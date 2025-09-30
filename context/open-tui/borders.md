```typescript
import { render } from "@opentui/react";

export const App = () => (
	<>
		<box flexDirection="row">
			<box border borderStyle="single">
				<text content="Single" />
			</box>
			<box border borderStyle="double">
				<text content="Double" />
			</box>
			<box border borderStyle="rounded">
				<text content="Rounded" />
			</box>
			<box border borderStyle="heavy">
				<text content="Heavy" />
			</box>
		</box>
	</>
);

render(<App />);

```
