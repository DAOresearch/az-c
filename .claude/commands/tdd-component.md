---
description: Generate and iteratively improve TDD React components until all tests pass
argument-hint: <component-name> [continue]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

<context>
<opentui_core>
## OpenTUI React Primitives

### Core Components
- `<box>` - Layout container with flexbox: `<box style={{ flexDirection: "column", padding: 1 }}>`
- `<text>` - Text display: `<text style={{ color: "#FFFFFF" }}>Content</text>` or `<text content="Content" />`
  - Child elements: `<span>`, `<strong>`, `<em>`, `<u>`, `<b>`, `<i>`
- `<input>` - Text input: `<input value={value} onInput={onChange} focused={isFocused} />`
- `<scrollbox>` - Scrollable container with customizable scrollbar
- `<ascii-font>` - ASCII art text: `<ascii-font font="Slant" text="Title" />`
- `<select>` - Dropdown selection: `<select options={[]} onChange={handler} focused />`

### Box Properties
```typescript
<box
  style={{
    // Layout
    flexDirection: "row" | "column",
    justifyContent: "flex-start" | "center" | "flex-end" | "space-between",
    alignItems: "flex-start" | "center" | "flex-end",

    // Spacing
    padding: number | { top?, right?, bottom?, left? },
    margin: number | { top?, right?, bottom?, left? },

    // Appearance
    border: boolean,
    borderStyle: "single" | "double" | "rounded" | "heavy",
    borderColor: string,
    backgroundColor: string,
    width: number | "100%",
    height: number,
  }}
  title="Optional Title"
>
```

### Text Properties
```typescript
import { TextAttributes } from "@opentui/core";

<text
  content="Text content"
  style={{
    fg: "#FFFFFF",  // foreground color
    bg: "#000000",  // background color
    attributes: TextAttributes.BOLD | TextAttributes.ITALIC,
  }}
/>

// Available TextAttributes:
// TextAttributes.BOLD
// TextAttributes.ITALIC
// TextAttributes.DIM
// TextAttributes.UNDERLINE
// TextAttributes.BLINK
// TextAttributes.REVERSE
// TextAttributes.HIDDEN
// TextAttributes.STRIKETHROUGH
```

### Input Properties
```typescript
<input
  value={value}
  onInput={(value: string) => void}
  onSubmit={() => void}
  placeholder="Enter text..."
  focused={boolean}
  style={{
    focusedBackgroundColor: "#000000",
    fg: "#FFFFFF",
  }}
/>
```

### Text Child Elements
```typescript
<text>
  Regular text
  <span fg="red" bg="blue">Colored span</span>
  <strong>Bold text</strong> or <b>Bold shorthand</b>
  <em>Italic text</em> or <i>Italic shorthand</i>
  <u>Underlined text</u>
  <span fg="brightRed">Bright colors available</span>
</text>
```

### Select Properties
```typescript
<select
  focused={boolean}
  onChange={(value, option) => void}
  options={[
    { name: "Display", description: "Details", value: "val" }
  ]}
  showScrollIndicator={boolean}
  style={{ flexGrow: 1 }}
/>
```

### Scrollbox Structure
```typescript
<scrollbox
  focused
  style={{
    rootOptions: { backgroundColor: "#24283b" },
    wrapperOptions: { backgroundColor: "#1f2335" },
    viewportOptions: { backgroundColor: "#1a1b26" },
    contentOptions: { backgroundColor: "#16161e" },
    scrollbarOptions: {
      showArrows: true,
      trackOptions: {
        foregroundColor: "#7aa2f7",
        backgroundColor: "#414868",
      },
    },
  }}
>
```

## OpenTUI Hooks

- `useKeyboard((key) => {})` - Handle keyboard input
- `useRenderer()` - Access renderer for debug overlay, console
- `useTimeline({ duration, loop })` - Animation timeline

## OpenTUI extend() Pattern

When creating complex custom components, use the extend pattern:

```typescript
import { BoxRenderable, OptimizedBuffer, RGBA, type BoxOptions, type RenderContext } from "@opentui/core"
import { extend, render } from "@opentui/react"

class CustomComponent extends BoxRenderable {
  public label: string = "Component"

  constructor(ctx: RenderContext, options: BoxOptions & { label: string }) {
    super(ctx, options)
    this.height = 3
    this.width = 24
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)
    const centerX = this.x + Math.floor(this.width / 2 - this.label.length / 2)
    const centerY = this.y + Math.floor(this.height / 2)
    buffer.drawText(this.label, centerX, centerY, RGBA.fromInts(255, 255, 255, 255))
  }
}

// TypeScript module augmentation for type safety
declare module "@opentui/react" {
  interface OpenTUIComponents {
    customComponent: typeof CustomComponent
  }
}

// Register the component
extend({ customComponent: CustomComponent })

// Use in JSX
function App() {
  return <customComponent label="Hello!" />
}
```

### When to Use extend()
**Use extend when:**
- Need custom OpenTUI rendering behavior
- Creating reusable components with complex internal logic
- Implementing custom drawing (borders, decorations)
- Need direct buffer access for performance

**Use composition when:**
- Simple combination of existing primitives
- No custom rendering needed
- One-off layouts
</opentui_core>

<testing_framework>
## TDD Component Testing Schema

### Setup File Structure
Every component needs a `.setup.ts` file:

```typescript
export type ComponentScenario = {
  scenarioName: string;      // Unique identifier
  description: string;       // Human-readable summary
  expectation: string;       // AI evaluation criteria (CRITICAL!)
  params: ComponentProps;    // Props to pass to component
};

export default {
  scenarios: [
    // Minimum 3 scenarios covering main states
  ]
} as const;
```

### Writing Effective Expectations
The 3 Elements: What + Where + How = Good Expectation

**Specificity Examples:**
```typescript
// ❌ Too vague - AI confidence ~60%
expectation: "Shows input field"

// ⚠️ Better - AI confidence ~75%
expectation: "Shows input field with placeholder"

// ✅ Best - AI confidence >90%
expectation: "Displays input field with gray '#999999' placeholder text 'Enter command...' surrounded by horizontal borders using '━' top and '─' bottom"
```

### Spec File Pattern
```typescript
import { renderComponent } from "@/testing/capture";
import { Component } from "./index";
import config from "./Component.setup";

const scenarioIndex = parseInt(process.env.SCENARIO_INDEX ?? "0");
const scenario = config.scenarios[scenarioIndex];

renderComponent({
  scenarioName: scenario.scenarioName,
  description: scenario.expectation,
  render: () => <Component {...scenario.params} />,
});
```

### TDD Workflow
1. **Write test setup** with scenarios covering all states
2. **Create spec file** using renderComponent
3. **Run test** with `bun test:capture` (will fail)
4. **Implement component** following design specs
5. **Run test again** with `bun test:evaluate`
6. **Refactor** with confidence

### Required File Structure
```
src/components/{category}/{ComponentName}/
├── index.tsx                      # Component implementation
├── {ComponentName}.setup.ts       # Test scenarios (WRITE FIRST!)
├── {ComponentName}.spec.tsx       # Test harness
└── README.md                      # Documentation
```

Categories: `ui/`, `feedback/`, `display/`, `task/`, `layout/`

### Test Execution Commands

```bash
# Run tests for a specific component
bun test:capture src/components/{category}/{ComponentName}.spec.tsx

# Run all tests
bun test:capture

# Evaluate AI confidence on captured screenshots
bun test:evaluate

# View test results
cat .dev/reports/results.json | jq '.'
```

### Understanding Test Results

The `results.json` structure:
```json
{
  "summary": {
    "totalTests": 5,
    "passed": 3,
    "failed": 2,
    "passRate": 0.6,
    "averageConfidence": 0.85
  },
  "components": [{
    "componentName": "ui",
    "scenarios": [{
      "scenarioName": "idle-state",
      "passed": false,
      "confidence": 0.75,
      "reasoning": "The component shows X but expected Y",
      "suggestions": ["Add placeholder text", "Fix border color"],
      "observations": {
        "elementsFound": ["what AI saw"],
        "textContent": ["actual text"],
        "colorScheme": ["actual colors"]
      }
    }]
  }]
}
```
</testing_framework>

<design_system>
## Design Tokens (ALWAYS USE - NEVER HARDCODE)

### Colors
```typescript
const COLORS = {
  bg: {
    primary: "#0F1115",    // Root containers
    surface: "#1A1D23",    // Panels, cards
  },
  border: {
    focus: "#4A90E2",      // Active/focused
    muted: "#3A3D45",      // Inactive
    disabled: "#666666",   // Disabled
  },
  text: {
    primary: "#FFFFFF",    // Main content
    muted: "#999999",      // Labels, metadata
    success: "#50C878",    // Positive feedback
    error: "#E74C3C",      // Errors
  },
  accent: {
    scrolltrack: "#414868",
    spinner: "#E07A5F",    // Orange/rust
  }
};
```

### Spacing Scale (terminal cells)
- 0: No space
- 1: Default gap
- 2: Standard padding
- 3: Input spacing
- 4: Section separators

## SOLID Principles for OpenTUI Components

### Single Responsibility Principle (SRP)
Each component should have ONE clear job:
- InputField: ONLY handles text input
- TodoList: ONLY displays task hierarchy
- AgentSpinner: ONLY shows loading state

```typescript
// ✅ GOOD: Single responsibility
export function InputField({ value, onChange }) {
  // Only manages input state and display
}

// ❌ BAD: Multiple responsibilities
export function InputFieldWithValidation({ value, onChange, validate, submit, fetch }) {
  // Does too much: input, validation, submission, fetching
}
```

### Open/Closed Principle (OCP)
Components should be:
- OPEN for extension via props/composition
- CLOSED for modification of core behavior

```typescript
// ✅ GOOD: Extensible via props
<InputField
  placeholder="Custom placeholder"
  borderStyle="double"  // Extends appearance
  onSubmit={handler}    // Extends behavior
/>

// ❌ BAD: Requires modifying component source for new features
```

### Liskov Substitution (LSP)
Components with similar interfaces should be interchangeable:
```typescript
// All input-like components should accept these core props
interface InputLike {
  value: string;
  onChange: (value: string) => void;
  focused: boolean;
}
```

### Interface Segregation (ISP)
Don't force components to depend on props they don't use:
```typescript
// ✅ GOOD: Minimal required props
type SpinnerProps = {
  state: "thinking" | "levitating";
  metadata?: SpinnerMetadata; // Optional
}

// ❌ BAD: Too many required props
type SpinnerProps = {
  state: string;
  color: string;      // Always required even if default
  size: number;       // Always required even if default
  animation: string;  // Always required even if default
}
```

### Dependency Inversion (DIP)
Depend on abstractions (types), not concretions:
```typescript
// ✅ GOOD: Depends on type abstraction
type TodoTask = {
  id: string;
  text: string;
  status: "pending" | "in_progress" | "completed";
};

export function TodoList({ tasks }: { tasks: TodoTask[] }) {
  // Component depends on interface, not implementation
}
```

## Atomic Design for OpenTUI

### Atoms (Indivisible)
Single-purpose primitives that cannot be broken down:
- `<input>` - Raw input primitive
- `<text>` - Raw text display
- `<box>` - Layout primitive

### Molecules (Simple Combinations)
Atoms combined for specific purpose:
```typescript
// InputField = box + text (borders) + input
function InputField() {
  return (
    <box>
      <text content="━━━━" />
      <input />
      <text content="────" />
    </box>
  );
}
```

### Organisms (Complex Components)
Molecules combined with business logic:
```typescript
// TodoList = multiple molecules with logic
function TodoList({ tasks }) {
  // Combines tree rendering, checkboxes, state management
}
```

### Templates (Page Structures)
Full layouts combining organisms:
```typescript
// ChatContainer = MessageList + InputField + AgentSpinner
function ChatContainer() {
  // Complete chat interface
}
```

### When to Use extend() vs Composition

**Use Composition (Molecules)** when:
- Combining 2-3 primitives
- No custom rendering logic needed
- Standard layout patterns

**Use extend() (Custom Organisms)** when:
- Need direct buffer access
- Complex rendering (tree structures, animations)
- Performance-critical rendering
- Custom drawing (borders, decorations)

```typescript
// Composition: Simple molecule
function StatusBadge({ status }) {
  return (
    <box style={{ border: true }}>
      <text content={status} style={{ fg: getStatusColor(status) }} />
    </box>
  );
}

// extend(): Complex organism with custom rendering
class TreeRenderer extends BoxRenderable {
  protected renderSelf(buffer: OptimizedBuffer): void {
    // Direct buffer manipulation for tree branches
  }
}
```

### Component Specifications

#### InputField
- Horizontal borders ONLY (top: `━`, bottom: `─`)
- No side borders for easy text selection
- States: idle, focused, disabled, error
- Border colors change based on state

#### AgentSpinner
- Two states: thinking (dots), levitating (pulsing)
- Color: `#E07A5F` (orange/rust)
- Metadata format: `(esc to interrupt · 130s · ↓ 6.7k tokens)`

#### TodoList
- Tree structure: `├──`, `│`, `└──`
- Checkboxes: `[✓]` done, `[○]` pending, `[●]` in-progress
- Indentation shows hierarchy
- Active task highlighting

#### CollapsibleTask
- Truncate to 3-5 lines with `...` ellipsis
- `[+N more lines]` expand hint
- Toggle state management
</design_system>
</context>

## Your Task

Create a TDD React component and **iteratively improve it until ALL tests pass with >90% confidence**.

**Why this matters**: TDD with iterative refinement ensures components work correctly on first deployment. The test-fix loop catches visual and behavioral issues before they reach users.

**Expected output**:
- Test setup file with 3+ scenarios (>90% AI confidence potential)
- Test spec file properly configured
- Component implementation that passes ALL tests
- README documentation with test results
- 100% test pass rate before completion

## Process

### Phase 1: Initial Component Implementation

First, analyze the specification:
1. If $ARGUMENTS is "continue", read `.dev/reports/results.json` and continue fixing
2. If $ARGUMENTS is a component name, find its specification in design system
3. Quote the applicable design tokens from <design_system>
4. Quote the relevant OpenTUI patterns from <opentui_core>
5. **Apply SOLID Analysis**:
   - What is the SINGLE responsibility?
   - Is it an Atom, Molecule, or Organism?
   - Simple composition or needs extend()?

Then, implement initial TDD structure:
1. **Create test setup** - Write scenarios with highly specific expectations
2. **Create test spec** - Set up renderComponent harness
3. **Design component interface** - Apply Interface Segregation (minimal props)
4. **Implement component** - First attempt at meeting requirements
5. **Document** - Create initial README

### Phase 2: Test Execution Loop (CRITICAL)

**This is the most important phase - keep iterating until 100% pass rate!**

Use TodoWrite to track test scenario status:
```
[ ] idle-state scenario
[ ] focused-state scenario
[ ] with-text scenario
[ ] disabled-state scenario
[ ] error-state scenario
```

Repeat this loop until all tests pass:

1. **Run component tests**:
   ```bash
   # Capture screenshots for the component
   bun test:capture src/components/**/[ComponentName].spec.tsx

   # Evaluate with AI
   bun test:evaluate
   ```

2. **Analyze test results**:
   ```bash
   # Read the results
   cat .dev/reports/results.json
   ```
   - Find scenarios where `passed: false`
   - Quote the `reasoning` field to understand what went wrong
   - Quote the `suggestions` array for fixes
   - Note the `observations.colorScheme` for color mismatches

3. **Fix identified issues**:
   - **Color mismatches**: Update color tokens to match expectations
   - **Missing elements**: Add required text/borders/elements
   - **Wrong characters**: Fix border characters (─ vs ━)
   - **Spacing issues**: Adjust padding/margins
   - **State logic**: Fix conditional rendering

4. **Update TodoWrite** after each run:
   ```
   [✓] idle-state scenario (passed with 95% confidence)
   [✗] focused-state scenario (failed - wrong border color)
   ```

5. **Verify improvement**:
   - Re-run tests after each fix
   - Confirm pass rate is increasing
   - Target >90% confidence on all scenarios

### Phase 3: Final Verification

Once all tests pass:
1. Run final test suite to confirm 100% pass rate
2. Update README with final test results
3. Commit with descriptive message about what was fixed

<examples>
<example index="1">
<scenario>Creating InputField with OpenTUI primitives</scenario>

<input>
Component: InputField
Requirements: Horizontal borders only, placeholder, focus states
</input>

<implementation>
// InputField.setup.ts
export default {
  scenarios: [
    {
      scenarioName: "idle-state",
      description: "Input field with placeholder, unfocused",
      expectation: "Shows input with gray '#999999' placeholder 'Enter command...' between horizontal borders: top '━━━━' characters and bottom '────' characters, border color '#3A3D45'",
      params: { placeholder: "Enter command...", value: "", focused: false }
    },
    {
      scenarioName: "focused-state",
      description: "Input field focused with cursor",
      expectation: "Shows input with blinking cursor, blue '#4A90E2' horizontal borders (top '━━━━' and bottom '────'), white text color",
      params: { placeholder: "Enter command...", value: "", focused: true }
    },
    {
      scenarioName: "with-text",
      description: "Input field with user text",
      expectation: "Shows 'hello world' in white text between gray borders, no placeholder visible",
      params: { value: "hello world", focused: false }
    }
  ]
};

// index.tsx
import { box, text, input } from "@opentui/react";

export type InputFieldProps = {
  value?: string;
  placeholder?: string;
  focused?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  error?: string;
};

export function InputField({
  value = "",
  placeholder = "",
  focused = false,
  onChange,
  onSubmit,
  disabled = false,
  error
}: InputFieldProps) {
  const borderColor = disabled ? "#666666" :
                     focused ? "#4A90E2" :
                     error ? "#E74C3C" : "#3A3D45";

  return (
    <box style={{ flexDirection: "column", width: "100%" }}>
      <text content="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" style={{ fg: borderColor }} />
      <box style={{ paddingLeft: 1, paddingRight: 1 }}>
        <input
          value={value}
          placeholder={placeholder}
          focused={focused && !disabled}
          onInput={onChange}
          onSubmit={onSubmit}
          style={{
            fg: disabled ? "#666666" : "#FFFFFF",
            focusedBackgroundColor: "#0F1115"
          }}
        />
      </box>
      <text content="──────────────────────────────────────" style={{ fg: borderColor }} />
      {error && (
        <text content={`! ${error}`} style={{ fg: "#E74C3C", marginTop: 1 }} />
      )}
    </box>
  );
}
</implementation>

<reasoning>
SOLID Analysis:
- SRP: InputField has ONE job - capture text input
- OCP: Extensible via props (placeholder, error, disabled)
- ISP: Minimal required props, rest optional
- Atomic: MOLECULE (combines box + text + input atoms)
- Implementation: Simple composition, no extend() needed
</reasoning>
</example>

<example index="2">
<scenario>Creating TodoList with extend pattern for custom tree rendering</scenario>

<input>
Component: TodoList with tree structure and checkboxes
</input>

<implementation>
// TodoList.setup.ts
export default {
  scenarios: [
    {
      scenarioName: "flat-tasks",
      description: "List of tasks at same level",
      expectation: "Shows 3 tasks with tree branches '├──' for first two, '└──' for last, checkboxes '[○]' for pending, '[✓]' for completed",
      params: {
        tasks: [
          { id: "1", text: "Setup project", status: "completed" },
          { id: "2", text: "Write tests", status: "pending" },
          { id: "3", text: "Implement feature", status: "pending" }
        ]
      }
    },
    {
      scenarioName: "nested-tasks",
      description: "Hierarchical task structure",
      expectation: "Shows parent task with '├──', children indented 2 spaces with '│  ├──' branches, '[●]' for in-progress parent",
      params: {
        tasks: [
          { id: "1", text: "Build feature", status: "in_progress",
            children: [
              { id: "2", text: "Design API", status: "completed" },
              { id: "3", text: "Write code", status: "pending" }
            ]
          }
        ]
      }
    }
  ]
};

// index.tsx using extend pattern
import { BoxRenderable, OptimizedBuffer, RGBA } from "@opentui/core";
import { extend } from "@opentui/react";

class TodoListComponent extends BoxRenderable {
  public tasks: TodoTask[] = [];

  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer);

    let y = this.y;
    this.renderTasks(buffer, this.tasks, 0, y);
  }

  private renderTasks(buffer: OptimizedBuffer, tasks: TodoTask[], indent: number, startY: number): number {
    let currentY = startY;

    tasks.forEach((task, index) => {
      const isLast = index === tasks.length - 1;
      const branch = isLast ? "└──" : "├──";
      const checkbox = this.getCheckbox(task.status);
      const textColor = task.status === "completed" ?
        RGBA.fromInts(102, 102, 102, 255) :
        RGBA.fromInts(255, 255, 255, 255);

      // Draw tree branch
      buffer.drawText(" ".repeat(indent) + branch, this.x, currentY, RGBA.fromInts(153, 153, 153, 255));

      // Draw checkbox and text
      buffer.drawText(` ${checkbox} ${task.text}`, this.x + indent + 3, currentY, textColor);

      currentY++;

      // Render children if any
      if (task.children) {
        currentY = this.renderTasks(buffer, task.children, indent + 2, currentY);
      }
    });

    return currentY;
  }

  private getCheckbox(status: string): string {
    switch(status) {
      case "completed": return "[✓]";
      case "in_progress": return "[●]";
      default: return "[○]";
    }
  }
}

declare module "@opentui/react" {
  interface OpenTUIComponents {
    todoList: typeof TodoListComponent
  }
}

extend({ todoList: TodoListComponent });

export function TodoList({ tasks }: { tasks: TodoTask[] }) {
  return <todoList tasks={tasks} />;
}
</implementation>

<reasoning>
SOLID Analysis:
- SRP: TodoList has ONE job - display task hierarchy with status
- DIP: Depends on TodoTask type abstraction
- LSP: Could be swapped with other list renderers
- Atomic: ORGANISM (complex component with business logic)
- Implementation: extend() needed for precise tree character placement
</reasoning>
</example>

<example index="3">
<scenario>Creating AgentSpinner with animation states</scenario>

<input>
Component: AgentSpinner with thinking and levitating states
</input>

<implementation>
// AgentSpinner.setup.ts
export default {
  scenarios: [
    {
      scenarioName: "thinking-state",
      description: "Simple thinking animation",
      expectation: "Shows '∴ Thinking...' text in orange '#E07A5F' color with animated dots",
      params: { state: "thinking" }
    },
    {
      scenarioName: "levitating-with-metadata",
      description: "Long operation with metadata",
      expectation: "Shows '∴ Levitating... (esc to interrupt · 45s · ↓ 2.3k tokens)' with orange spinner, gray metadata",
      params: {
        state: "levitating",
        metadata: { elapsed: 45, tokens: 2300, canInterrupt: true }
      }
    }
  ]
};

// index.tsx - Simple composition
import { useState, useEffect } from "react";

export function AgentSpinner({ state, metadata }) {
  const [frame, setFrame] = useState(0);
  const frames = ["∷",, "∵", "∶", ".","∶", "∴", "∷"];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const metaText = metadata ?
    ` (${metadata.canInterrupt ? 'esc to interrupt · ' : ''}${metadata.elapsed}s · ↓ ${(metadata.tokens/1000).toFixed(1)}k tokens)` : '';

  return (
    <box style={{ flexDirection: "row" }}>
      <text content={frames[frame]} style={{ fg: "#E07A5F" }} />
      <text content={` ${state === 'thinking' ? 'Thinking' : 'Levitating'}...`} style={{ fg: "#E07A5F" }} />
      {metaText && <text content={metaText} style={{ fg: "#999999" }} />}
    </box>
  );
}
</implementation>

<reasoning>
SOLID Analysis:
- SRP: AgentSpinner has ONE job - show loading/processing state
- OCP: Extensible via metadata prop for additional info
- ISP: Only two required props (state), metadata optional
- Atomic: MOLECULE (simple combination of text atoms with animation)
- Implementation: Composition sufficient, no extend() needed
</reasoning>
</example>
<example index="4">
<scenario>Fixing test failures based on AI feedback</scenario>

<test_failure>
{
  "scenarioName": "idle-state",
  "passed": false,
  "confidence": 0.75,
  "reasoning": "The placeholder text 'Type a message...' is not visible. Only shows '>' prompt.",
  "suggestions": [
    "Add placeholder text display after the prompt",
    "Ensure placeholder uses gray color #999999"
  ]
}
</test_failure>

<fix_applied>
// Before - missing placeholder display
<box>
  <text content=">" style={{ fg: "#999999" }} />
  <input placeholder={placeholder} />
</box>

// After - explicitly showing placeholder
<box>
  <text content=">" style={{ fg: "#999999" }} />
  {!value && (
    <text content={placeholder} style={{ fg: "#999999" }} />
  )}
</box>
</fix_applied>

<reasoning>
The AI couldn't see the placeholder because the native input element might not render it visibly in terminal. Solution: explicitly render placeholder as text element.
</reasoning>
</example>

<example index="5">
<scenario>Iterative test tracking with TodoWrite</scenario>

<initial_todo>
todos: [
  { content: "idle-state test", status: "pending" },
  { content: "focused-state test", status: "pending" },
  { content: "with-text test", status: "pending" },
  { content: "disabled-state test", status: "pending" },
  { content: "error-state test", status: "pending" }
]
</initial_todo>

<after_first_run>
todos: [
  { content: "idle-state test - PASSED 92%", status: "completed" },
  { content: "focused-state test - FAILED wrong border color", status: "in_progress" },
  { content: "with-text test - PASSED 95%", status: "completed" },
  { content: "disabled-state test - FAILED missing x prefix", status: "pending" },
  { content: "error-state test - FAILED border not red", status: "pending" }
]
</after_first_run>

<final_status>
todos: [
  { content: "idle-state test - PASSED 92%", status: "completed" },
  { content: "focused-state test - PASSED 94%", status: "completed" },
  { content: "with-text test - PASSED 95%", status: "completed" },
  { content: "disabled-state test - PASSED 91%", status: "completed" },
  { content: "error-state test - PASSED 93%", status: "completed" }
]
</final_status>
</example>
</examples>

## Success Criteria

- [ ] **Test Coverage**:
  - [ ] All test scenarios pass with >90% confidence
  - [ ] 100% pass rate achieved before completion
  - [ ] Results documented in README
- [ ] **SOLID Compliance**:
  - [ ] Component has SINGLE clear responsibility
  - [ ] Open for extension via props, closed for modification
  - [ ] Minimal required props (Interface Segregation)
  - [ ] Depends on type abstractions not implementations
- [ ] **Atomic Classification**:
  - [ ] Correctly identified as Atom/Molecule/Organism
  - [ ] Composition used for simple Molecules
  - [ ] extend() used only for complex Organisms
- [ ] **Testing**:
  - [ ] Test scenarios have expectations with >90% AI confidence potential
  - [ ] All component states covered
- [ ] **Implementation Quality**:
  - [ ] Component uses OpenTUI primitives correctly
  - [ ] Design tokens used consistently (no hardcoded colors)
  - [ ] TypeScript types are comprehensive
- [ ] **Documentation**:
  - [ ] File structure matches required pattern
  - [ ] README includes SOLID rationale and usage examples

## Troubleshooting Common Test Failures

### Issue: "Placeholder text not visible"
**Symptom**: AI reports missing placeholder despite `placeholder` prop being set
**Solution**: Render placeholder as explicit `<text>` element, not relying on native input

### Issue: "Wrong border color"
**Symptom**: Colors don't match expected hex values
**Solution**: Check you're using design tokens, not hardcoded values. Use exact hex from expectations.

### Issue: "Border characters incorrect"
**Symptom**: AI sees different Unicode characters than expected
**Solution**: Ensure using `─` (U+2500) for borders, not similar-looking characters

### Issue: "Missing prompt character"
**Symptom**: `>` or `x` prefix not showing
**Solution**: Render as separate `<text>` element before input/placeholder

### Issue: "Low confidence despite visual match"
**Symptom**: Component looks right but confidence <90%
**Solution**: Make expectations more specific - include exact character counts, positions, colors

## Command Usage

```bash
# Start new component
/tdd-component InputField

# Continue fixing failed tests
/tdd-component continue

# Start from specific component spec
/tdd-component ./specs/TodoList.md
```

## Important Notes

- **Don't skip the test loop**: The iterative process is critical for quality
- **Trust the AI feedback**: If it says something is wrong, fix it even if it "looks right"
- **Be specific in expectations**: Vague expectations lead to unreliable tests
- **Track progress**: Use TodoWrite to know which scenarios still need work
- **Aim for >90%**: Don't settle for lower confidence scores