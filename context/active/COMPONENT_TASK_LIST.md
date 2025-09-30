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
- Screenshot test setup (`.setup.ts` + `.spec.tsx`) with visual expectations.
- README sections: Purpose, Props, States, Visual Reference, Test Scenarios, Manual QA Steps.

**Priority Order**: Based on screenshot analysis and UX impact (see `context/active/CONSOLIDATION_PLAN.md`)

### Phase A: Foundation Components (Day 1-2) - CRITICAL UX
Build these first - they define the core interaction experience and have screenshot references.

- [ ] `components/ui/InputField` ⭐ HIGHEST PRIORITY
  - Visual Reference: `context/active/component_screenshots/user-input-command.png`
  - States: idle, focused, disabled, error
  - Key Spec: **Horizontal borders only (top/bottom, no sides)** for easy copy/paste
  - Scenarios: `InputField idle`, `InputField focused`, `InputField disabled`, `InputField error`
  - Test Expectation: "Input field with horizontal borders only (─────), no side borders. Prompt '>' in gray, border color changes to blue (#4A90E2) when focused."

- [ ] `components/ui/AgentSpinner` ⭐ HIGH PRIORITY
  - Visual Reference: `context/active/component_screenshots/levitating-spinner-status.png`, `thinking-status-messages.png`
  - States: thinking, levitating (with metadata)
  - Key Spec: **Two distinct states** - simple thinking vs metadata-rich levitating
  - Scenarios: `AgentSpinner thinking`, `AgentSpinner levitating`
  - Test Expectation: "Thinking state shows '∴ Thinking…' in orange/rust. Levitating state shows '∴ Levitating… (esc to interrupt · 130s · ↓ 6.7k tokens)' with metadata in gray."

- [ ] `components/banner/Banner`
  - Visual Reference: `context/active/component_screenshots/claude-code-header-user-prompt.png`
  - States: default (with ASCII art), condensed
  - Scenarios: `Banner default`, `Banner condensed`
  - Test Expectation: "Banner displays ASCII robot icon, 'Claude Code v2.0.1', model info 'Sonnet 4.5 · Claude API', and working directory path."

### Phase B: Task Management Components (Day 3) - NEW from Screenshots
Build the todo/task display system visible in reference screenshots.

- [ ] `components/ui/TodoList` ⭐ NEW COMPONENT
  - Visual Reference: `context/active/component_screenshots/todo-task-list-with-analysis.png`
  - States: with pending tasks, with completed tasks, mixed states
  - Key Spec: **Tree structure with ├─ └─**, checkboxes ☐/☒, strikethrough for completed
  - Scenarios: `TodoList pending`, `TodoList completed`, `TodoList mixed`
  - Test Expectation: "TodoList shows '✱' root bullet in orange, tree branches using ├─ and └─, checkboxes ☐ (pending) and ☒ (completed with strikethrough), all aligned properly."

- [ ] `components/ui/CollapsibleTask` ⭐ NEW COMPONENT
  - Visual Reference: `context/active/component_screenshots/task-deep-analysis-collapsed.png`
  - States: collapsed, expanded
  - Key Spec: **Truncation with '… +N lines' hint**, metadata display
  - Scenarios: `CollapsibleTask collapsed`, `CollapsibleTask expanded`
  - Test Expectation: "Task shows '●' bullet in light gray, title in white, collapsed content preview with '… +8 lines (ctrl+o to expand)', metadata '+25 more tool uses' in gray."

### Phase C: Message Renderers (Day 4-5)
Leverage CollapsibleTask component for tool display.

- [ ] `components/messages/ToolCallMessage`
  - Visual Reference: `context/active/component_screenshots/bash-find-testing-files.png`, `readme-analysis-response.png`
  - States: collapsed (default), expanded, with metadata
  - Uses: `CollapsibleTask` component
  - Scenarios: `ToolCall collapsed`, `ToolCall expanded`, `ToolCall with args`
  - Test Expectation: "Tool call shown as collapsible task, e.g. '● Read(src/testing/README.md)' with '└─ Read 406 lines (ctrl+o to expand)'"

- [ ] `components/messages/AssistantTextMessage`
  - Visual Reference: `context/active/component_screenshots/readme-analysis-response.png`
  - States: default, streaming (partial text), structured (with lists/headers)
  - Scenarios: `AssistantText default`, `AssistantText streaming`, `AssistantText structured`
  - Test Expectation: "Assistant message displays structured text with numbered lists (1. 2. 3.), headers, and bullet points. No bold/italic (terminal constraints)."

- [ ] `components/messages/UserMessage`
  - Visual Reference: `context/active/component_screenshots/claude-code-header-user-prompt.png`
  - States: single line, multi line
  - Scenarios: `UserMessage single line`, `UserMessage multi line`
  - Test Expectation: "User message shows '> ' prefix followed by message text, simple clean display without borders."

- [ ] `components/messages/SystemMessage`
  - States: error, info, warning
  - Scenario: `SystemMessage error`, `SystemMessage info`
  - Test Expectation: "Error messages in red (#E74C3C), info in gray, clear prefix indicators."

### Phase D: Layout & Integration (Day 6-7)

- [ ] `components/chat/MessageList`
  - States: empty, populated, populatedWithSpinner
  - Scenarios: `MessageList empty`, `MessageList populated`, `MessageList with spinner`
  - Test Expectation: "Scrollable message list with proper spacing (2 cell margin between messages), auto-scroll to bottom, scrollbar in accent color."

- [ ] `components/chat/ChatContainer`
  - States: default, agentWorking, error
  - Scenarios: `ChatContainer default`, `ChatContainer agent working`, `ChatContainer error`
  - Test Expectation: "Full layout with banner at top, scrollable message area, and input at bottom. Shows spinner when agent is working."

- [ ] `components/AppShell`
  - States: default
  - Scenario: default layout with banner placeholder, chat placeholder, optional footer
  - Test Expectation: "Fixed layout with banner (fixed height), chat area (flex-grow), optional status footer (1 line)."

### Phase E: Optional Components (As Needed)

- [ ] `components/layout/Stack`
  - States: vertical, spacing variations (aligns with design system spacing tokens)
  - Scenarios: `Stack default`, `Stack spacing-2`

- [ ] `components/chat/ToolResultPanel` (may be replaced by CollapsibleTask)
  - States: collapsed, success, error
  - Scenarios: `ToolResultPanel collapsed`, `ToolResultPanel success`, `ToolResultPanel error`

- [ ] `components/ui/StatusBanner`
  - States: connected, warning, error
  - Scenarios: `StatusBanner connected`, `StatusBanner warning`, `StatusBanner error`

## 6. Acceptance Criteria

### Per Component:
- [ ] Component folder created with README, component file, and test files
- [ ] `.setup.ts` file defines all scenarios with visual expectations from design system
- [ ] `.spec.tsx` file renders component using `renderComponent()` from testing harness
- [ ] Visual expectations reference actual screenshot if available in `context/active/component_screenshots/`
- [ ] Component uses color tokens and spacing from `docs/DESIGN_SYSTEM.md` §2
- [ ] All states from design system are implemented and testable

### Screenshot Testing:
- [ ] Run `bun test` to capture component screenshots
- [ ] AI evaluation achieves >90% confidence score
- [ ] Screenshots match visual reference (manual verification)
- [ ] Component README updated with test results and visual examples

### Code Quality:
- [ ] Follows TypeScript style guidelines from `CLAUDE.md` (types over interfaces, no enums)
- [ ] React hook best practices applied (proper dependencies, cleanup)
- [ ] Biome linting passes (`bun x biome check`)
- [ ] TypeScript compilation succeeds (`bun x tsc --noEmit`)

### Documentation:
- [ ] Component README includes: Purpose, Props, States, Visual Reference, Test Scenarios
- [ ] Progress tracked in this task list (check boxes)
- [ ] Any deviations from design system documented and justified

### Integration:
- [ ] Component exports added to appropriate index files
- [ ] Used in higher-level components or chat container
- [ ] No regressions in existing functionality
