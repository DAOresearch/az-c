# Component Folder Template

Each component lives in its own folder with three required files:

1. `<ComponentName>.tsx` - the exported React component.
2. `<ComponentName>.spec.tsx` - manual validation entry point that uses the harness.
3. `<ComponentName>.setup.ts`
3. `README.md` - usage, props, and design references.

## Checklist Before Implementing
- Review `docs/DESIGN_SYSTEM.md` for color, spacing, and copy rules.
- Capture the component wireframe and states inside the folder README.
- Confirm the component states map to the manual harness scenarios.

## Manual Validation Harness
- Tests import `runHarness` from `src/testing/componentHarness`.
- Each test renders the component in a single state and immediately invokes `runHarness`.
- Document the expected ASCII output in a docstring at the top of the test file.

Example harness file:

```ts
/**
 * Expected view:
 * - Banner: "InputField"
 * - Input shows placeholder "Type here"
 * - Border color uses color.border.focus from the design system
 */
import { runHarness } from "@/testing/componentHarness";
import { InputField } from "./InputField";

runHarness({
	scenarioName: "Input idle",
	description: "Idle input with placeholder text and active border",
	render: () => (
		<InputField
			placeholder="Type here"
			onSubmit={() => undefined}
		/>
	),
});
```

## README Expectations
- Summarize purpose and props.
- Link back to the design system sections it depends on.
- List harness scenarios and their intent.
- Include manual QA steps and known limitations.

## Adding New Components
1. Copy this template folder.
2. Rename files to match the component.
3. Update README metadata.
4. Add the component to the component task list document.
5. Run the test harness: `bun run tsx path/to/Component.test.tsx`.
