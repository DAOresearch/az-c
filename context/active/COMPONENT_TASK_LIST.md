# Component Creation Task List

This document defines the workflow for building terminal UI components with manual validation harnesses. It references the design system (`docs/DESIGN_SYSTEM.md`) and the component harness (`src/testing/componentHarness.tsx`).

## 1. Source Material Snapshot
The reference folder `context/open-tui` will be removed after documentation is complete. The key patterns we rely on are recorded here:

- Rendering pattern (`basic.tsx`):
  ```ts
  import { render } from "@opentui/react";

  export const App = () => (
  	<box style={{ padding: 2, flexDirection: "column" }}>
  		<text content="Example" />
  	</box>
  );

  render(<App />);
  ```
- Scrollbox styling (`scroll.tsx`): nested `rootOptions`, `wrapperOptions`, `viewportOptions`, `contentOptions`, `scrollbarOptions` for precise theme control.
- Box variations (`box.tsx`): `border`, `title`, `padding`, `margin`, `alignItems`, `justifyContent` demonstrate layout primitives.

These snippets drive how we structure harness scenarios and component styling.

## 2. Harness Overview
- File: `src/testing/componentHarness.tsx`
- Exports `runHarness({ scenarioName, description, render })`.
- Logs scenario metadata to the console before mounting the React element with `@opentui/react`.
- Designed for one scenario per file to keep validation focused.

### Example Usage
```ts
/**
 * Expected view:
 * - Input field in idle state with focus border
 * - Placeholder copy: "Type here"
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

## 3. Component Folder Template
- Location: `templates/component`
- Contents:
  - `Component.tsx`: basic component shell exporting `<Component>` and `ComponentProps`.
  - `Component.test.tsx`: harness entry with required docstring describing the expected terminal output.
  - `README.md`: folder-level checklist linking back to the design system and harness instructions.
- Copy the folder, rename files to match the component, and update the docstring plus scenario metadata.

## 4. Manual Validation Process
1. Create or update the component files using the template.
2. Document the expected view in the test file docstring.
3. Run `bun run tsx path/to/Component.test.tsx` to mount the component in the terminal.
4. Compare the rendered output with the design system wireframes.
5. Capture findings or adjustments in the component README.

## 5. Task List
The following tasks build out the component library defined in `docs/DESIGN_SYSTEM.md`. Each task requires:
- Component folder with README, component file, and harness test.
- At least one harness scenario per listed state.
- README sections: Purpose, Props, States, Harness Scenarios, Manual QA Steps.

### Phase A: Layout Primitives
- [ ] `components/AppShell`
  - States: default
  - Scenario: default layout with banner placeholder, chat placeholder, optional footer
- [ ] `components/banner/Banner`
  - States: default, condensed
  - Scenarios: `Banner default`, `Banner condensed`
- [ ] `components/layout/Stack`
  - States: vertical, spacing variations (aligns with design system spacing tokens)
  - Scenarios: `Stack default`, `Stack spacing-2`

### Phase B: Chat Surfaces
- [ ] `components/chat/ChatContainer`
  - States: default, agentWorking, error
  - Scenarios: `ChatContainer default`, `ChatContainer agent working`, `ChatContainer error`
- [ ] `components/chat/MessageList`
  - States: empty, populated, populatedWithSpinner
  - Scenarios: `MessageList empty`, `MessageList populated`, `MessageList with spinner`
- [ ] `components/chat/ToolResultPanel`
  - States: collapsed, success, error
  - Scenarios: `ToolResultPanel collapsed`, `ToolResultPanel success`, `ToolResultPanel error`

### Phase C: Message Renderers
- [ ] `components/messages/UserMessage`
  - States: single line, multi line
  - Scenarios: `UserMessage single line`, `UserMessage multi line`
- [ ] `components/messages/AssistantTextMessage`
  - States: default, streaming (partial text), error fallback
  - Scenarios: `AssistantText default`, `AssistantText streaming`, `AssistantText error`
- [ ] `components/messages/ToolCallMessage`
  - States: single tool, multiple tools
  - Scenarios: `ToolCall single`, `ToolCall multiple`
- [ ] `components/messages/SystemMessage`
  - States: error
  - Scenario: `SystemMessage error`

### Phase D: Inputs and Feedback
- [ ] `components/ui/InputField`
  - States: idle, focused, disabled, error
  - Scenarios: `InputField idle`, `InputField focused`, `InputField disabled`, `InputField error`
- [ ] `components/ui/AgentSpinner`
  - States: default, deterministic, paused
  - Scenarios: `AgentSpinner default`, `AgentSpinner deterministic`, `AgentSpinner paused`
- [ ] `components/ui/StatusBanner`
  - States: connected, warning, error
  - Scenarios: `StatusBanner connected`, `StatusBanner warning`, `StatusBanner error`

## 6. Acceptance Criteria
- Harness docstrings clearly describe the expected ASCII output.
- Each scenario logs a helpful `scenarioName` and `description` before rendering.
- Components use tokens and guidance from `docs/DESIGN_SYSTEM.md`.
- Task owners update `docs/MASTER_TASK_LIST.md` progress when scenarios are complete.
- Context folder can be safely deleted once all tasks and documentation references are merged.
