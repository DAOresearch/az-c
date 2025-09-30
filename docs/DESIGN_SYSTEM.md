# AZ-C Terminal Design System

The AZ-C design system establishes consistent styling, interaction patterns, and component states for the terminal-based chat experience. It adapts familiar web and React best practices to a minimal terminal user interface so that teams can build and extend features predictably.

## 1. Design Principles
- Predictability first: every visual and interactive element behaves the same way regardless of context.
- Progressive disclosure: show only the information the user needs, layer additional detail when requested.
- Perceptible state: every component exposes idle, loading, success, and error states where applicable.
- Separation of concerns: shared styling lives in reusable props or helper components, keeping React components focused and testable.
- Respect the terminal: rely on typography, spacing, and color tokens instead of rich graphics.

## 2. Foundations

### 2.1 Color Tokens
| Token | Hex | Usage |
| --- | --- | --- |
| `color.bg.primary` | `#0F1115` | Default background for root containers and scroll areas |
| `color.bg.surface` | `#1A1D23` | Panels, message cards, and inputs |
| `color.border.focus` | `#4A90E2` | Focus ring + active borders |
| `color.border.muted` | `#3A3D45` | Dividers, inactive borders |
| `color.border.disabled` | `#666666` | Disabled input border |
| `color.text.primary` | `#FFFFFF` | Primary copy |
| `color.text.muted` | `#999999` | Metadata, labels |
| `color.text.success` | `#50C878` | Positive feedback, spinner |
| `color.text.error` | `#E74C3C` | Errors, destructive messaging |
| `color.accent.scrolltrack` | `#414868` | Scroll track background |

> Implementation note: add these tokens to a central `theme.ts` (future task) and reference them in components instead of hard-coded values.

### 2.2 Typography
- Typefamily: monospace (default terminal font). Avoid mixed width characters in static labels.
- Hierarchy: use prefix labels (e.g., `Assistant:`) and uppercase banners instead of font size changes.
- Emphasis: rely on color tokens or subtle casing, not bold/italic (varies by terminal support).

### 2.3 Spacing Scale (in terminal cells)
| Token | Value | Usage |
| --- | --- | --- |
| `space.0` | 0 | Tight alignment inside inline text |
| `space.1` | 1 | Default gap between inline elements |
| `space.2` | 2 | Standard padding around message blocks |
| `space.3` | 3 | Input field vertical spacing |
| `space.4` | 4 | Section separators, modal padding |

### 2.4 Layout
- Root layout uses a single column flex container with `flexGrow` for scrollable areas.
- Limit overall width to preserve readability (`maxWidth` equivalent of ~80 characters).
- Keep banner height fixed (do not grow with content) to avoid pushing chat history off-screen.

### 2.5 Interaction Patterns
- Every actionable component exposes `disabled` and `loading` props.
- Async work always surfaces a spinner or textual progress message.
- Errors resolve through inline messaging first, not modal resets.
- Keyboard is the primary input; ensure focusable order follows visual order.

## 3. Component Inventory & Wireframes

Each component section includes responsibilities, required props, states, and ASCII wireframes to communicate layout. Wireframes depict approximate spacing and labels, not literal copy.

### 3.1 App Shell
- **Role**: High-level layout container in `App.tsx` that arranges the banner and chat area.
- **Props**: none; pulls shared theme + router context when needed.
- **States**: default only; child components express actual variability.

```
+--------------------------------------------------------------+
| Banner (full width, fixed height)                           |
+--------------------------------------------------------------+
| ChatContainer (flex-grow: 1)                                |
+--------------------------------------------------------------+
| Footer status or shortcuts (optional, 1 line)               |
+--------------------------------------------------------------+
```

### 3.2 Banner
- **Role**: Present brand identity and optional helper text.
- **Props**: `title`, `subtitle`, optional `actions` for quick commands.
- **States**: default; reduced (when space-constrained).

```
Default
+--------------------------------------------------------------+
| OpenTUI                         What will you build?         |
+--------------------------------------------------------------+

Condensed
+--------------------------------------------------------------+
| OpenTUI                                                      |
+--------------------------------------------------------------+
```

Implementation detail: keep ASCII art optional; when unavailable, use the condensed variant.

### 3.3 ChatContainer
- **Role**: Orchestrate chat session, message list, and input.
- **Props**: `agentService`, `title`, `initialMessages?`, `onSubmitOverride?`.
- **States**: default, agent working, error fallback.

```
Default
+--------------------------------------------------------------+
| [MessageList]                                                |
|                                                              |
+--------------------------------------------------------------+
| > Type your message and press Enter...                       |
+--------------------------------------------------------------+

Agent Working
+--------------------------------------------------------------+
| [MessageList]                                                |
|   Assistant: ...                                             |
|   (spinner shown below last message)                         |
+--------------------------------------------------------------+
| > Type your message and press Enter...                       |
+--------------------------------------------------------------+

Error Fallback
+--------------------------------------------------------------+
| ! Unable to reach agent. Try again shortly.                  |
| [Retry] (optional action row)                                |
+--------------------------------------------------------------+
| > Type your message and press Enter... (disabled)            |
+--------------------------------------------------------------+
```

### 3.4 MessageList
- **Role**: Render chronological chat history inside a scrollbox.
- **Props**: `messages`, `isAgentWorking`, `height`, `showTimestamp?`.
- **States**: empty, populated, populated + spinner.

```
Empty
+--------------------------------------------------------------+
| Start by typing a message below...                           |
+--------------------------------------------------------------+

Populated
+--------------------------------------------------------------+
| You: Show me package.json                                    |
| ------------------------------------------------------------ |
| Assistant: Sure, running tool...                             |
| [Using filesystem_reader]                                    |
+--------------------------------------------------------------+

Populated + Spinner
+--------------------------------------------------------------+
| You: Describe project structure                              |
| ------------------------------------------------------------ |
| Assistant:                                                   |
| [spinner] brewing some magic...                                      |
+--------------------------------------------------------------+
```

Ensure scrollbars use `color.border.focus` (thumb) and `color.accent.scrolltrack` (track) for consistency.

### 3.5 Message Renderers
Break down renderer responsibilities so each message can be themed consistently.

#### 3.5.1 User Message
- **Label**: `You:` in `color.text.muted`.
- **Body**: Raw text in `color.text.primary`.

```
You:
Show me package.json
```

#### 3.5.2 Assistant Text Message
- **Label**: `Assistant:`.
- **Body**: Render markdown-light (bullet lists, code fences trimmed to ASCII).
- **States**: default, streaming (partial response), error.

```
Default
Assistant:
Here is a summary of package.json...

Streaming (render partial buffer)
Assistant:
Here is a summary of pack
...
```

#### 3.5.3 Tool Call Message
- **Label**: `Assistant:`.
- **Body**: One line per tool call using `[Using {toolName}]` format.
- **Future enhancement**: show parameters and status badges.

```
Assistant:
[Using filesystem_reader]
[Waiting for tool result]
```

#### 3.5.4 System / Result Message
- **Label**: hidden (system tone).
- **Body**: Error prefix `Error:` with `color.text.error`. Success messages remain silent to reduce noise.

```
Error: timeout while reading tool output
```

### 3.6 Tool Result Panel (planned)
Even though results are currently inline, a dedicated layout will keep things consistent when Task 2.1 lands.

```
Default (collapsed)
+--------------------------------------------------------------+
| Tool Result: filesystem_reader                               |
| Status: Pending                                              |
+--------------------------------------------------------------+

Success
+--------------------------------------------------------------+
| Tool Result: filesystem_reader   Status: Success             |
| ------------------------------------------------------------ |
| {truncated output with "press r to expand" helper}          |
+--------------------------------------------------------------+

Error
+--------------------------------------------------------------+
| Tool Result: filesystem_reader   Status: Error               |
| ------------------------------------------------------------ |
| timeout while reading file                                    |
| [Retry] [View logs]                                           |
+--------------------------------------------------------------+
```

### 3.7 InputField
- **Props**: `placeholder`, `onSubmit`, `disabled`, `defaultValue?`, `onChange?` (for controlled use cases).
- **States**: idle, focused, disabled, validation error.
- **Visual Reference**: `context/active/component_screenshots/user-input-command.png`

#### Border Specification (Terminal UX Optimization)
- **Border placement**: TOP and BOTTOM only (horizontal lines)
- **No side borders**: Enables easy text selection and copy/paste
- **Border character**: `─` (box-drawing horizontal, U+2500)
- **Border colors**:
  - Idle: `#4a4a4a` (color.border.inactive)
  - Focused: `#4A90E2` (color.border.focus)
  - Disabled: `#666666` (color.border.disabled)

```
Idle (horizontal borders only)
─────────────────────────────────────────────
> Type your message and press Enter...
─────────────────────────────────────────────

Focused (border color changes to blue)
─────────────────────────────────────────────
> Type your message and press Enter|
─────────────────────────────────────────────

Disabled
─────────────────────────────────────────────
x Processing...
─────────────────────────────────────────────

Error
─────────────────────────────────────────────
! Message cannot be empty
─────────────────────────────────────────────
```

**Implementation Note**: The absence of vertical borders (left/right) is intentional. This allows users to easily select text without the cursor catching on border characters, improving the terminal copy/paste experience.

### 3.8 AgentSpinner
- **Props**: `state: SpinnerState`, `onInterrupt?`, `metadata?`
- **States**: thinking, levitating
- **Visual Reference**: `context/active/component_screenshots/levitating-spinner-status.png`, `thinking-status-messages.png`

#### State Specifications

**Thinking State** (simple, fast operations):
```
∴ Thinking…

Excellent! The subagent provided a comprehensive analysis.
```

**Levitating State** (long-running operations with metadata):
```
∴ Levitating… (esc to interrupt · 130s · ↓ 6.7k tokens)
```

#### Visual Tokens
- Spinner icon: `∴` (braille pattern, or use braille animation frames)
- Active color: `#E07A5F` (orange/rust) - indicates agent is working
- Metadata color: `#999999` (text.secondary)
- Message color: `#FFFFFF` (primary) or `#999999` (secondary)

#### Metadata Format
- Pattern: `(action hint · {elapsed}s · ↓ {tokens}k tokens)`
- Components:
  - Action hint: `esc to interrupt` (user control)
  - Elapsed time: Updates every second
  - Token usage: `↓ {N}k tokens` (downward arrow indicates consumption)

#### Implementation Details
- Spinner frames: Braille characters for smooth animation (4-8 frames, 120ms interval)
- ASCII fallback: Use `∴` or `.` if terminal lacks braille support
- Width limit: Full metadata line should not exceed 80 characters
- Auto-collapse: Switch to thinking state if operation completes quickly (<3s)

### 3.9 TodoList
- **Role**: Display hierarchical task list with progress tracking
- **Props**: `tasks: TodoItem[]`, `title`, `onToggle?`, `collapsible`, `hints?`
- **States**: tasks can be pending, in_progress, or completed
- **Visual Reference**: `context/active/component_screenshots/todo-task-list-with-analysis.png`

#### Tree Structure Format
```
✱ Analyzing testing infrastructure implementation… (esc to interrupt · ctrl+t to hide todos)
  ├─ ☒ Identify all documentation files (CLAUDE.md, README.md, .md files)
  ├─ ☐ Analyze testing infrastructure implementation files
  ├─ ☐ Cross-reference documentation against actual implementation
  ├─ ☐ Evaluate TDD workflow readiness and documentation gaps
  └─ ☐ Compile recommendations for documentation updates and restructuring
```

#### Character Set
- Root bullet: `✱` (U+2731, eight-pointed star)
- Tree branch: `├─` (intermediate items), `└─` (last item)
- Checkbox unchecked: `☐` (U+2610)
- Checkbox checked: `☒` (U+2612)

#### Color Tokens
- Title/root: `#E07A5F` (orange/rust) - active task indicator
- Completed text: `#666666` with strikethrough decoration
- Pending text: `#FFFFFF` (primary)
- In-progress text: `#4A90E2` (blue) - optional state indicator
- Metadata/hints: `#999999` (secondary)

#### Layout Rules
- Root indent: 0 spaces
- Child indent: 2 spaces from parent
- Branch chars: 2 characters + 1 space = 3 char width
- Checkbox: 1 character + 1 space
- Tree alignment: All text aligns at same column after checkboxes

#### Interactive Hints
- Format: `(action · ctrl+key to action)`
- Examples: `(esc to interrupt · ctrl+t to hide todos)`
- Always displayed in secondary color after title

### 3.10 CollapsibleTask
- **Role**: Display tool execution or detailed task info with expand/collapse
- **Props**: `title`, `content`, `metadata?`, `defaultExpanded`, `expandHint?`
- **States**: collapsed, expanded
- **Visual Reference**: `context/active/component_screenshots/task-deep-analysis-collapsed.png`

#### Collapsed State
```
● Task(Deep analysis of testing implementation)
  └─ Read 24 lines (ctrl+o to expand)
      "scripts": {
        "lint": "bun x biome check --write",
        "typecheck": "bun x tsc --noEmit",
      … +8 lines (ctrl+o to expand)
      +25 more tool uses
```

#### Expanded State
```
● Task(Deep analysis of testing implementation)
  └─ Read 24 lines
      {full content displayed here}
      {all lines visible}
      +25 more tool uses
```

#### Visual Tokens
- Bullet: `●` (U+25CF, filled circle) in `#CCCCCC` (light gray)
- Title: `Task(...)` format in `#FFFFFF`
- Tree branch: `└─` for content
- Truncation indicator: `… +N lines` in `#666666`
- Metadata: `+N more tool uses` in `#999999`

#### Truncation Rules
- Show first 3-5 lines of content when collapsed
- Add `… +N lines (ctrl+o to expand)` after preview
- Count and display additional metadata (tool uses, etc.)
- Preserve indentation in preview lines

#### Implementation Notes
- Default to collapsed for long content (>10 lines)
- Expand hint: `(ctrl+o to expand)` or configurable
- Metadata should be clickable/expandable separately
- Maintain tree structure alignment when expanded

### 3.11 Status Banner (optional footer)
- **Use case**: Display connection status, shortcut hints, or environment labels.

```
Connected - CTRL+C to exit - CTRL+L to clear
```

## 4. Content Standards
- Copy should be short, descriptive, and avoid jargon. Fewer than 60 characters per line to prevent wrapping issues on narrow terminals.
- Prefer sentence case for labels (`Tool Result`) and title case for persistent headers (`OpenTUI`).
- Time stamps use 24h format `HH:MM` if added later.

## 5. React Implementation Guidelines
- Keep presentation components pure. All side effects live in hooks (`useAgentQuery`, `useStreamingInput`).
- Co-locate component-specific styles in small `style` objects; extract to theme helpers when reused thrice.
- Memoize expensive renderers (`MessageRenderer`) with `React.memo` once props stabilise.
- Derive state (e.g., `isAgentWorking`) at the container level and pass down as explicit props to avoid prop drilling surprises.
- Introduce Storybook-like demo scripts (headless) to snapshot ASCII wireframes and ensure parity with this document.

## 6. Validation Checklist
- [ ] Colors only use tokens from §2.1.
- [ ] Components expose all states listed in §3.
- [ ] Input and spinner respect width and character limits.
- [ ] New components add wireframes back to this document.
- [ ] Component task list references this document for design alignment.
- [ ] Screenshot tests validate visual specifications (see `src/testing/README.md`).
- [ ] Visual references link to actual screenshots in `context/active/component_screenshots/`.

## 7. Screenshot Testing Integration
All components should be validated against their visual references using the AI-evaluated screenshot testing system:

1. Create `component.setup.ts` with scenarios matching design system states
2. Create `component.spec.tsx` that renders using `renderComponent()`
3. Run `bun test` to capture screenshots and evaluate against expectations
4. Ensure >90% AI confidence score for visual compliance
5. Reference: See `src/testing/README.md` for complete testing workflow

**Example Expectation (from InputField):**
```typescript
expectation: "Input field with horizontal borders only (top and bottom), no side borders. Shows '> Type here' prompt with blue border when focused."
```

---

_Last updated: 2025-09-30 (Screenshot specifications added)_
