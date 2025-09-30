# Component Development Consolidation Plan

## Visual Specifications Extracted from Screenshots

### 1. InputField Component (`user-input-command.png`)

**Visual Requirements:**
- Prompt prefix: `> ` (gray color)
- Border style: **TOP and BOTTOM borders only** (no left/right sides)
- Border color: Subtle gray (#4a4a4a when inactive, #4A90E2 when focused)
- Background: Dark terminal background (#1A1D23)
- Text color: White (#FFFFFF)
- Padding: 1 cell vertical, 2 cells horizontal (inside content area)

**Rationale:**
- No side borders = easier to select and copy text
- Horizontal lines provide visual separation without interfering with selection
- Matches terminal aesthetic

**Example:**
```
─────────────────────────────────────────────
> write a prd to the context folder
─────────────────────────────────────────────
```

---

### 2. AgentSpinner Component (`levitating-spinner-status.png`, `thinking-status-messages.png`)

**Visual Requirements:**

**Levitating State:**
- Format: `∴ Levitating… (esc to interrupt · {time}s · ↓ {tokens}k tokens)`
- Color: Orange/rust (#E07A5F or similar)
- Spinner: `∴` character (braille-style animation frames)
- Metadata: Gray (#999999)
- Shows: elapsed time, token usage, interrupt hint

**Thinking State:**
- Format: `∴ Thinking…`
- Style: Italic gray text
- Simpler, no metadata during quick operations
- May show sub-messages below (see screenshot)

**Implementation:**
```typescript
type SpinnerState =
  | { type: "thinking"; message?: string }
  | { type: "levitating"; elapsed: number; tokens: number };
```

**Color Tokens:**
- Active spinner: `#E07A5F` (orange/rust)
- Success: `#50C878` (green)
- Metadata: `#999999` (gray)

---

### 3. TodoList Component (`todo-task-list-with-analysis.png`)

**Visual Requirements:**

**Format:**
```
✱ Analyzing testing infrastructure implementation… (esc to interrupt · ctrl+t to hide todos)
  ├─ ☒ Identify all documentation files (CLAUDE.md, README.md, .md files)
  ├─ ☐ Analyze testing infrastructure implementation files
  ├─ ☐ Cross-reference documentation against actual implementation
  ├─ ☐ Evaluate TDD workflow readiness and documentation gaps
  └─ ☐ Compile recommendations for documentation updates and restructuring
```

**States:**
- Completed: `☒` (strikethrough text)
- Pending: `☐` (normal text)
- In Progress: `☐` with indicator (spinner or colored text)

**Tree Structure:**
- Root: `✱` symbol
- Branch: `├─` for items, `└─` for last item
- Indentation: 2 spaces per level

**Colors:**
- Header: Orange/rust (#E07A5F)
- Completed: Gray strikethrough (#666666)
- Pending: White (#FFFFFF)
- Metadata: Gray (#999999)

**Interactive Hints:**
- `(esc to interrupt · ctrl+t to hide todos)` in gray

---

### 4. Collapsible Task Component (`task-deep-analysis-collapsed.png`)

**Visual Requirements:**

**Format:**
```
● Task(Deep analysis of testing implementation)
  └─ Read 24 lines (ctrl+o to expand)
      "scripts": {
        "lint": "bun x biome check --write",
        "typecheck": "bun x tsc --noEmit",
      … +8 lines (ctrl+o to expand)
      +25 more tool uses
```

**States:**
- Collapsed: Shows summary + expand hint
- Expanded: Full content (not shown in screenshot)

**Visual Elements:**
- Bullet: `●` (filled circle)
- Title: `Task(...)` format
- Tree branch: `└─`
- Truncation: `… +N lines (ctrl+o to expand)`
- Metadata: `+N more tool uses`

**Colors:**
- Bullet: Light gray (#CCCCCC)
- Title: White (#FFFFFF)
- Metadata: Gray (#999999)
- Hint text: Gray (#666666)

---

### 5. Message Rendering (`readme-analysis-response.png`)

**Visual Requirements:**

**Tool Call Format:**
```
● Read(src/testing/README.md)
  └─ Read 406 lines (ctrl+o to expand)
```

**Response Format:**
```
● Yes, the README needs significant updates! It's missing documentation for the new screenshot co-location feature
  and has outdated information. Let me identify what needs updating:

Issues Found:

1. No directory structure documentation – Users don't know where files are saved
2. Outdated API Reference – generateReport() signature changed to use options object
...
```

**Key Patterns:**
- Tool calls: Collapsed by default with expand hint
- Agent responses: Full text, structured with headers
- Bullets: `●` for main items
- Numbered lists: Standard markdown `1. 2. 3.`
- Emphasis: No bold/italic (terminal constraints), use structure instead

---

## Updated Component Priority List

### Phase A: Foundation (Day 1)
**Based on screenshots, build these first:**

1. **InputField** (user-input-command.png)
   - Horizontal borders only ✱
   - Focus states
   - Placeholder text
   - Testing: Verify copy/paste works easily

2. **AgentSpinner** (levitating-spinner-status.png, thinking-status-messages.png)
   - Levitating state with metadata ✱
   - Thinking state (simple)
   - Color transitions
   - Testing: Verify all states render correctly

3. **Banner** (claude-code-header-user-prompt.png)
   - ASCII art robot icon
   - Version + model info
   - Working directory path
   - Testing: Verify layout at different widths

### Phase B: Task Management (Day 2)
**Build the todo/task system visible in screenshots:**

4. **TodoList** (todo-task-list-with-analysis.png)
   - Tree structure rendering ✱
   - Checkbox states (pending/completed)
   - Strikethrough for completed
   - Interactive hints
   - Testing: Verify tree alignment, state changes

5. **CollapsibleTask** (task-deep-analysis-collapsed.png)
   - Collapsed state with summary ✱
   - Expand/collapse interaction
   - Tool use metadata
   - Line count truncation
   - Testing: Verify expand/collapse, truncation logic

### Phase C: Message Display (Day 3)
**Build chat message renderers:**

6. **ToolCallMessage** (bash-find-testing-files.png, readme-analysis-response.png)
   - Collapsible by default
   - Tool name + args preview
   - Expand hint
   - Testing: Verify collapse/expand, argument display

7. **AssistantMessage** (readme-analysis-response.png)
   - Structured text rendering
   - Numbered lists
   - Headers/sections
   - Testing: Verify markdown-like formatting

8. **UserMessage** (claude-code-header-user-prompt.png)
   - Simple text display
   - Color coding (blue for user)
   - Testing: Verify text wrapping

### Phase D: Layout & Integration (Day 4)

9. **MessageList**
   - Scrollable container
   - Message spacing
   - Auto-scroll behavior
   - Testing: Verify scroll performance with 100+ messages

10. **ChatContainer**
    - Layout: banner + messages + input
    - State management
    - Testing: End-to-end flow

---

## Design System Updates Needed

### Section 3.7: InputField (UPDATE)

```
### 3.7 InputField
- **Role**: Accept user text input with terminal-friendly selection
- **Props**: `placeholder`, `onSubmit`, `disabled`, `value`, `onChange`
- **States**: idle, focused, disabled

#### Visual Specification (from user-input-command.png):
- Border: TOP and BOTTOM only (horizontal lines)
- No left/right borders (enables easy text selection)
- Border chars: `─` (box-drawing character)
- Border color: `#4a4a4a` (idle), `#4A90E2` (focused), `#666666` (disabled)
- Prompt: `> ` prefix in gray (#999999)

Wireframe:
─────────────────────────────────────────────
> Type your message here
─────────────────────────────────────────────

Focused (border color changes):
═════════════════════════════════════════════
> Type your message here|
═════════════════════════════════════════════
```

### Section 3.8: AgentSpinner (UPDATE)

```
### 3.8 AgentSpinner
- **Role**: Indicate agent activity with context
- **Props**: `state: SpinnerState`, `onInterrupt?`
- **States**: thinking, levitating

#### Visual Specification (from screenshots):

**Thinking State:**
∴ Thinking…

Excellent! The subagent provided a comprehensive analysis.

**Levitating State:**
∴ Levitating… (esc to interrupt · 130s · ↓ 6.7k tokens)

#### Color Tokens:
- Spinner icon: `#E07A5F` (orange/rust)
- Metadata: `#999999` (gray)
- Message text: `#FFFFFF` or `#999999` depending on emphasis

#### Implementation:
- Spinner frames: Use `∴` or braille characters
- Animate: 4-8 frames, 120ms interval
- Metadata format: `(action hint · {elapsed}s · ↓ {tokens}k tokens)`
```

### NEW: Section 3.9: TodoList

```
### 3.9 TodoList
- **Role**: Display hierarchical task list with progress
- **Props**: `tasks: TodoItem[]`, `title`, `onToggle?`, `collapsible`
- **States**: expanded, collapsed (per task)

#### Visual Specification (from todo-task-list-with-analysis.png):

Format:
✱ Task title… (esc to interrupt · ctrl+t to hide todos)
  ├─ ☒ Completed task (strikethrough)
  ├─ ☐ Pending task
  ├─ ☐ Another pending task
  └─ ☐ Last task

#### Character Set:
- Root bullet: `✱` (#E07A5F)
- Branch: `├─` (intermediate), `└─` (last)
- Checkbox unchecked: `☐`
- Checkbox checked: `☒`

#### Colors:
- Title: `#E07A5F` (orange/rust)
- Completed: `#666666` with strikethrough
- Pending: `#FFFFFF`
- Metadata: `#999999`

#### Tree Spacing:
- Root indent: 0
- Child indent: 2 spaces
- Branch characters: 2 chars + space
```

### NEW: Section 3.10: CollapsibleTask

```
### 3.10 CollapsibleTask
- **Role**: Display tool usage or task detail with expand/collapse
- **Props**: `title`, `content`, `metadata?`, `defaultExpanded`
- **States**: collapsed, expanded

#### Visual Specification (from task-deep-analysis-collapsed.png):

Collapsed:
● Task(Deep analysis of testing implementation)
  └─ Read 24 lines (ctrl+o to expand)
      … +8 lines (ctrl+o to expand)
      +25 more tool uses

Expanded:
● Task(Deep analysis of testing implementation)
  └─ Read 24 lines
      {full content here}
      {more content}
      +25 more tool uses

#### Colors:
- Bullet: `#CCCCCC` (light gray)
- Title: `#FFFFFF`
- Metadata: `#999999`
- Truncation hint: `#666666`
```

---

## Implementation Order with Screenshot Validation

### Week 1: Foundation
**Goal: Get core UI right with screenshot comparison**

Day 1-2: InputField + AgentSpinner
- Build components per visual specs above
- Create `.setup.ts` with states from screenshots
- Run `bun test` to generate screenshots
- **Manually compare** with reference screenshots
- Iterate until match

Day 3: TodoList
- Implement tree rendering
- Test checkbox states
- Validate alignment and spacing

Day 4: CollapsibleTask
- Implement collapse/expand
- Test truncation logic
- Validate metadata display

### Week 2: Integration
Day 5-6: Message renderers (use Task component)
Day 7: ChatContainer integration
Day 8: Polish and fix any mismatches

---

## Screenshot Reference Mapping

| Component | Reference Screenshot | Key Features |
|-----------|---------------------|--------------|
| InputField | `user-input-command.png` | Horizontal borders only |
| AgentSpinner (levitating) | `levitating-spinner-status.png` | Metadata display |
| AgentSpinner (thinking) | `thinking-status-messages.png` | Simple state |
| TodoList | `todo-task-list-with-analysis.png` | Tree structure, checkboxes |
| CollapsibleTask | `task-deep-analysis-collapsed.png` | Truncation, expand hints |
| ToolCall | `bash-find-testing-files.png` | Collapsed tool display |
| AssistantMessage | `readme-analysis-response.png` | Structured text |
| Banner | `claude-code-header-user-prompt.png` | Header layout |

---

## Action Items (Prioritized)

### Immediate (Today):
1. ✅ Update DESIGN_SYSTEM.md with screenshot-based specs
2. ☐ Move old task lists to `context/archive/notes/`
3. ☐ Create `visual-reference.md` linking screenshots to components
4. ☐ Update COMPONENT_TASK_LIST.md with new priorities

### This Week:
5. ☐ Start with InputField (highest priority - affects UX)
6. ☐ Build AgentSpinner (second priority - visible constantly)
7. ☐ Implement TodoList (third priority - task tracking)

### Next Week:
8. ☐ CollapsibleTask + message renderers
9. ☐ Integration and polish
10. ☐ Archive implementation-plan.md and MASTER_TASK_LIST.md

---

## Success Criteria

**Each component is "done" when:**
1. ✅ Visual match with reference screenshot (>90% AI confidence)
2. ✅ All states tested (idle, active, disabled, error)
3. ✅ Design system compliance verified
4. ✅ Screenshot test passes in `bun test`
5. ✅ Component README updated with visual examples

---

_Generated: 2025-09-30_
_Based on: 8 reference screenshots + existing design system_
