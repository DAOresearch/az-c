---
description: Generate smart PRD adapted to task complexity
argument-hint: <topic-description> [--issue] [--auto]
allowed-tools: Read, Write, Glob, Grep, Bash, Task, WebFetch, WebSearch
model: claude-sonnet-4-5-20250929
thinking:
  enabled: true
  budget: tokens
---

> USE *ULTRATHINK* MODE!

<complexity_framework>
## Complexity Tiers

### Tier 1: SIMPLE (200-400 lines)
**Characteristics:**
- Single component or utility
- No external dependencies
- No migration or refactor
- Isolated change

**Examples:**
- Add a button component
- Create utility function
- Add type definition
- Simple UI enhancement

**Required Sections:** 1 (Executive Summary), 10 (Success Criteria)
**Optional Sections:** 6 (Implementation - if multi-step), 7 (Types - if TypeScript), 12 (File Structure)

---

### Tier 2: MODERATE (400-800 lines)
**Characteristics:**
- Multiple files/components (2-5)
- Some dependencies affected
- Minor refactor or feature
- Moderate risk

**Examples:**
- Feature with multiple components
- API integration
- State management addition
- Hook library implementation

**Required Sections:** 1, 2, 3, 6, 10
**Conditional Sections:** 1.5 (if DX improvement), 4 (if complex flow), 5 (if refactoring), 7 (if types), 9 (if risks), 12, 14

---

### Tier 3: COMPLEX (800-1500+ lines)
**Characteristics:**
- Architecture change
- System-wide migration
- Breaking changes
- High risk/impact

**Examples:**
- Testing framework migration
- Authentication system
- GraphQL migration
- Major refactor

**Required Sections:** ALL 21 sections (comprehensive coverage)
**Target:** Complete architectural specification with all details

---

## Section Selection Matrix

| Section | Tier 1 | Tier 2 | Tier 3 | Include When |
|---------|--------|--------|--------|--------------|
| 1. Executive Summary | ✅ | ✅ | ✅ | Always |
| 1.5. Developer Experience Philosophy | 🔶 | 🔶 | ✅ | DX bottleneck being solved |
| 2. Current System Analysis | ❌ | ✅ | ✅ | Modifying existing code |
| 3. Proposed Architecture | 🔶 | ✅ | ✅ | New architecture/patterns |
| 4. New Data Flow | ❌ | 🔶 | ✅ | Complex interactions |
| 5. Migration Pattern | ❌ | 🔶 | ✅ | Migration or refactor |
| 6. Implementation Phases | 🔶 | ✅ | ✅ | Multi-step work |
| 7. Type Definitions | 🔶 | 🔶 | ✅ | TypeScript types involved |
| 8. Class Diagrams | ❌ | 🔶 | ✅ | OOP or complex relationships |
| 9. Risks & Mitigations | 🔶 | ✅ | ✅ | Non-trivial risks |
| 10. Success Criteria | ✅ | ✅ | ✅ | Always |
| 11. Open Questions & Decisions | 🔶 | 🔶 | ✅ | Important decisions made |
| 12. File Structure | 🔶 | 🔶 | ✅ | New files being created |
| 13. Dependencies Changes | ❌ | 🔶 | ✅ | Package changes |
| 14. Backwards Compatibility | ❌ | 🔶 | ✅ | Breaking changes possible |
| 15. Performance Benchmarks | ❌ | 🔶 | ✅ | Performance critical |
| 16. Rollback Plan | ❌ | 🔶 | ✅ | High-risk changes |
| 17-21. Appendices | ❌ | 🔶 | ✅ | Tier 3 or very useful |

**Legend:** ✅ Always Include | 🔶 Include if Relevant | ❌ Usually Skip
</complexity_framework>

# Generate Smart, Adaptive PRD

You are a product architect creating an implementation-ready Product Requirements Document (PRD) for: **$1**

## Execution Mode Detection

**Determine mode based on context:**

1. **Check for `--auto` flag in `$1`:**
   - If present → **NON-INTERACTIVE MODE**
   - If absent → **INTERACTIVE MODE** (default)

2. **Check execution context:**
   - If running in GitHub Actions/CI/CD → **NON-INTERACTIVE MODE**
   - If running locally via `/prd` → **INTERACTIVE MODE** (default)

**Mode Behaviors:**

| Mode | Tier Approval | PRD Confirmation | Auto-Save |
|------|---------------|------------------|-----------|
| **Interactive** | ✋ Wait for user | ✋ Wait for user | ❌ Only when approved |
| **Non-Interactive** | ✅ Auto-proceed | ✅ Auto-proceed | ✅ Immediate |

---

## Your Task

Create a **complexity-adaptive PRD** that scales its depth to match the task's actual complexity. The PRD should be implementation-ready for an LLM agent with zero ambiguity.

**Why this matters**: PRDs serve as architectural specifications that enable autonomous implementation. Simple tasks need concise guidance; complex migrations need comprehensive detail. Match the depth to the complexity.

**Interaction style:**
- **Interactive mode:** Present assessments and wait for user feedback
- **Non-interactive mode:** Generate and save automatically without prompts

## Process

### Step 1: Assess Complexity & Get Approval

**First, determine the complexity tier by analyzing:**

1. **Scope Analysis**:
   - How many files/components will be affected?
   - Is this isolated or system-wide?
   - Net-new vs modification vs migration?

2. **Risk Assessment**:
   - Breaking changes involved?
   - External dependencies affected?
   - Backwards compatibility concerns?

3. **Complexity Indicators**:
   - Single file → Likely Tier 1
   - 2-5 files, some refactor → Likely Tier 2
   - Migration, architecture change, >5 files → Likely Tier 3

**Output the tier assessment in this format:**

```
## 📊 Complexity Assessment for: {Topic}

**Assessed Tier:** {Tier Number} ({Tier Name})

**Reasoning:**
- Scope: {X files/components affected}
- Risk: {Low/Medium/High} - {Why}
- Dependencies: {List any}
- Type: {Net-new/Refactor/Migration}

**Sections to Include:**
- {Section 1}
- {Section 2}
- {Section 3}
... (based on tier)

**Estimated PRD Length:** ~{X} lines
**Estimated Implementation Time:** {Time estimate}
```

**IF INTERACTIVE MODE:**

**STOP and ask the user:**

```
Does this tier assessment look correct?

Options:
- "yes" or "looks good" → Proceed with generation
- "no, make it Tier X" → Adjust tier
- "add section Y" → Include additional section
- "remove section Z" → Exclude a section
- "tell me more about X" → Explain assessment
```

**Wait for user response before proceeding to Step 2.**

**IF NON-INTERACTIVE MODE (CI/CD):**
- Proceed directly to Step 2 with assessed tier

---

## Learning by Example

Before proceeding to research and generation, review these examples showing all three tiers in action:

<examples>
<example index="1">
<scenario>Tier 1: Simple component addition</scenario>

<input>
/prd Add a LogoutButton component to the navigation bar
</input>

<complexity_assessment>
**Tier 1 (Simple)**
- Scope: Single component file
- Risk: Low - isolated UI component
- Dependencies: None - uses existing auth context
- Files affected: 1 (LogoutButton.tsx)
</complexity_assessment>

<expected_output>
# PRD: LogoutButton Component

**Version**: 1.0
**Status**: Draft for Implementation
**Complexity**: Tier 1 (Simple)

---

## 1. Executive Summary

Add a LogoutButton component to the navigation bar that calls the existing logout function from AuthContext.

### Key Goals

- ✅ Create reusable LogoutButton component
- ✅ Integrate with existing AuthContext
- ✅ Match current design system

---

## 6. Implementation

**File**: `src/components/LogoutButton.tsx`

```typescript
export const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className="btn-secondary">
      Logout
    </button>
  );
};
```

**Steps**:
1. Create component file
2. Import useAuth hook
3. Add button with logout handler
4. Export component
5. Import in Navigation.tsx

---

## 10. Success Criteria

- ✅ LogoutButton component created
- ✅ Calls logout from AuthContext
- ✅ Matches design system styling
- ✅ Accessible (keyboard + screen reader)

---

**Length**: ~250 lines | **Estimated Time**: 30 minutes
</expected_output>

<reasoning>
Tier 1 because:
- Single file
- No architecture changes
- Uses existing patterns
- Low risk
- Simple implementation

PRD is concise (~250 lines) with only essential sections.
</reasoning>
</example>

<example index="2">
<scenario>Tier 2: Moderate feature with multiple components</scenario>

<input>
/prd Implement dark mode toggle with theme persistence
</input>

<complexity_assessment>
**Tier 2 (Moderate)**
- Scope: 4 files (context, hook, toggle, theme types)
- Risk: Medium - affects all components via theming
- Dependencies: localStorage for persistence
- Files affected: 4 new files + updates to App.tsx
</complexity_assessment>

<expected_output>
# PRD: Dark Mode Toggle with Theme Persistence

**Version**: 1.0
**Status**: Draft for Implementation
**Complexity**: Tier 2 (Moderate)

---

## 1. Executive Summary

Add dark mode support with a toggle component and theme persistence via localStorage.

### Key Goals

- ✅ Create ThemeContext for app-wide theme state
- ✅ Implement DarkModeToggle component
- ✅ Persist theme preference in localStorage
- ✅ Apply theme to all components via CSS variables

---

## 2. Current System Analysis

**Current State:**
- No theming system exists
- Components use hardcoded light colors
- No theme persistence

**Files to Modify:**
- `src/App.tsx` - wrap with ThemeProvider

---

## 3. Proposed Architecture

```
┌──────────────────┐
│  ThemeContext    │
│  (light/dark)    │
└────────┬─────────┘
         │
    ┌────▼─────┐
    │ Provider │
    └────┬─────┘
         │
    ┌────▼────────────┐
    │  All Components │
    │  (read theme)   │
    └─────────────────┘
```

---

## 6. Implementation Phases

**Phase 1**: Create ThemeContext and types
**Phase 2**: Implement DarkModeToggle
**Phase 3**: Add localStorage persistence

---

## 7. Type Definitions

```typescript
// src/contexts/theme/types.ts
export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};
```

---

## 10. Success Criteria

- ✅ Theme persists across page reloads
- ✅ Toggle switches between light/dark
- ✅ All components respect theme
- ✅ Smooth transition animations

---

**Length**: ~600 lines | **Estimated Time**: 4 hours
</expected_output>

<reasoning>
Tier 2 because:
- Multiple files (4 new files)
- Affects multiple components
- Requires state management
- Medium risk (visual changes)
- Moderate complexity

PRD is balanced (~600 lines) with core + conditional sections.
</reasoning>
</example>

<example index="3">
<scenario>Tier 3: Complex migration with system-wide impact</scenario>

<input>
/prd Migrate from Jest to Vitest for all tests
</input>

<complexity_assessment>
**Tier 3 (Complex)**
- Scope: All test files (~50+ files), config, CI/CD
- Risk: High - testing infrastructure change
- Dependencies: Vitest, @testing-library adapters, coverage tools
- Files affected: 50+ test files, package.json, CI config, test utilities
- Breaking: Test syntax changes, coverage config changes
</complexity_assessment>

<expected_output>
# PRD: Jest to Vitest Migration

**Version**: 1.0
**Status**: Draft for Implementation
**Complexity**: Tier 3 (Complex - Migration)
**Author**: AI Architect
**Target Audience**: LLM Implementation Agent
**Strategy**: Phased Migration with Parallel Support

---

## 1. Executive Summary

Migrate from Jest to Vitest for faster test execution, better ESM support, and improved developer experience.

### Key Goals

- ✅ Migrate all tests from Jest to Vitest
- ✅ Improve test execution speed (target: 3x faster)
- ✅ Maintain 100% test coverage during migration
- ✅ Zero downtime - parallel Jest/Vitest support during transition
- ✅ Update CI/CD pipelines

### Implementation Strategy

1. **Phase 1**: Install Vitest, configure parallel setup
2. **Phase 2**: Migrate utility tests (low risk)
3. **Phase 3**: Migrate component tests (medium risk)
4. **Phase 4**: Migrate integration tests (high risk)
5. **Phase 5**: Remove Jest, finalize Vitest

**Critical Safety Gate**: All tests must pass in both Jest and Vitest before removing Jest.

---

## 1.5. Developer Experience Philosophy ⭐

**The Real Goal**: Faster feedback loops for developers

### The Bottleneck
- ❌ **NOT**: Jest is broken (it works fine)
- ✅ **YES**: Test execution is slow, slowing down development

### The Solution
Vitest runs 3x faster with native ESM and smart watch mode.

---

## 2. Current System Analysis

**File References:**
- Jest config: `jest.config.js:1-50`
- Test utilities: `src/test/utils.ts:1-200`
- 52 test files across src/**/*.test.ts

---

## 3. Proposed Architecture

[ASCII diagram showing Vitest architecture]

---

## 5. Migration Pattern

### 5.1 Before (Jest)

**File** (`src/utils/format.test.ts`):
```typescript
describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
  });
});
```

### 5.2 After (Vitest)

**File** (`src/utils/format.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
  });
});
```

[... ALL 21 sections included with full details ...]

---

**Length**: ~1200 lines | **Estimated Time**: 2-3 weeks
</expected_output>

<reasoning>
Tier 3 because:
- System-wide migration (50+ files)
- High risk (testing infrastructure)
- Breaking changes required
- Multiple phases needed
- CI/CD updates required

PRD is comprehensive (~1200 lines) with ALL 21 sections, multiple diagrams, complete appendices.
</reasoning>
</example>
</examples>

**Now that you've seen the patterns, proceed to research and generation:**

---

### Step 2: Deep Research Phase

Research the codebase using the Task tool:

1. **Understand the request**: Parse `$1` to identify:
   - What is being built/changed?
   - What problem does it solve?
   - What are the key components involved?

2. **Current state analysis**:
   - Search for existing files related to the topic
   - Read current implementations
   - Identify dependencies and affected components
   - Document current architecture with file references (file.ts:10-50)

3. **Research best practices** (if Tier 2-3):
   - WebSearch for latest patterns in the domain
   - WebFetch relevant documentation
   - Identify proven architectural approaches

---

### Step 3: Adaptive PRD Generation

Generate PRD sections based on the assessed tier:

**Determine sections to include:**
1. Consult the Section Selection Matrix (Lines 70-94)
2. Identify required sections (✅) for this tier
3. Evaluate conditional sections (🔶) for relevance
4. Skip non-applicable sections (❌)

**Generate content:**
1. Create sections in numerical order (1, 1.5, 2, 3...)
2. Follow format patterns from Appendix A (templates)
3. Apply tier-appropriate detail level:
   - **Tier 1**: Concise, focused (200-400 lines)
   - **Tier 2**: Balanced detail (400-800 lines)
   - **Tier 3**: Comprehensive (800-1500+ lines)

**Universal requirements:**
- Use file references: `path/file.ts:10-50` format
- Include code examples when helpful
- Provide clear, actionable guidance
- Focus on implementation-readiness

### Step 4: Review & Confirm (Interactive Only)

**IF INTERACTIVE MODE:**

After generating the PRD, present a summary to the user:

```
## ✅ PRD Generated!

**Title:** {PRD Title}
**Complexity:** Tier {X}
**Length:** ~{Y} lines
**Sections Included:** {Count}

### Quick Summary:
{2-3 sentence overview of what was generated}

### Key Sections:
- Executive Summary ✓
- {Other sections included}

### File Path:
Will be saved to: `PRDs/{issue-number}-{topic}.md`
{If --issue: "And GitHub issue will be created with this PRD"}

---

**Are you satisfied with this PRD?**

Options:
- "yes" or "save" → Save and finish
- "no" or "refine" → What would you like to change?
- "show me section X" → Display specific section
- "add more detail to Y" → Enhance a section
- "make it shorter/longer" → Adjust verbosity
- "change tier to X" → Regenerate with different tier
```

**Wait for user confirmation before saving.**

If user requests changes:
- Make the requested modifications
- Present updated summary again
- Ask for confirmation
- Repeat until user is satisfied

**IF NON-INTERACTIVE MODE:**
- Skip confirmation, proceed directly to save

---

## Label Workflow & Automation Control

**CRITICAL:** If using `--issue` flag, labels control when automation triggers.

### **Label States & Automation Rules**

```
┌─────────────────────────────────────────────────────────┐
│  prd:draft                                              │
│  ├─ Status: Being written/reviewed                      │
│  ├─ Automation: 🚫 BLOCKED                              │
│  ├─ @claude implement: ❌ Will NOT trigger              │
│  └─ Next: Manually change to prd:ready when approved    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼ (Manual approval)
┌─────────────────────────────────────────────────────────┐
│  prd:ready                                              │
│  ├─ Status: Approved, ready for implementation          │
│  ├─ Automation: ✅ ENABLED                              │
│  ├─ @claude implement: ✅ WILL trigger                  │
│  └─ Next: Auto-changes to prd:implementing when started │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼ (Auto-transition)
┌─────────────────────────────────────────────────────────┐
│  prd:implementing                                       │
│  ├─ Status: Currently being worked on                   │
│  ├─ Automation: ⚙️  RUNNING                             │
│  ├─ @claude implement: Already running                  │
│  └─ Next: Auto-changes to prd:completed when PR merged  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼ (Auto-transition on merge)
┌─────────────────────────────────────────────────────────┐
│  prd:completed                                          │
│  ├─ Status: Implementation done                         │
│  ├─ Automation: ✋ DONE                                  │
│  ├─ @claude implement: Not applicable                   │
│  └─ Final state - issue can be closed                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  prd:blocked (Special state - can be added anytime)     │
│  ├─ Status: Blocked on something                        │
│  ├─ Automation: ⏸️  PAUSED                              │
│  ├─ @claude implement: Will not trigger                 │
│  └─ Next: Remove label when unblocked, return to prev   │
└─────────────────────────────────────────────────────────┘
```

### **Critical Safety Gates**

1. **`@claude implement` requires BOTH:**
   - ✅ `prd` label (identifies as PRD issue)
   - ✅ `prd:ready` label (human approval gate)

   **Why:** Prevents accidental implementation of draft PRDs

2. **Manual approval required:**
   - PRDs start as `prd:draft`
   - Human must review and change to `prd:ready`
   - This is intentional - no auto-implementation without approval

3. **Blocking mechanism:**
   - Add `prd:blocked` to pause automation
   - Useful when decisions needed or dependencies missing
   - Remove when unblocked to resume

### **When You Generate a PRD**

**With `--issue` flag:**
```bash
/prd Implement dark mode --issue
```
- Creates issue with `prd` + `prd:draft` labels
- PRD saved to `context/active/`
- **Automation:** BLOCKED until you change to `prd:ready`

**From issue template:**
```
1. Create issue using PRD template
2. Comment: @claude generate prd
3. Claude generates PRD
4. Issue gets `prd:ready` label automatically
5. You can now: @claude implement
```

### **Label Transitions**

| From | To | Trigger | Who |
|------|-----|---------|-----|
| `prd:draft` | `prd:ready` | Manual label change | Human |
| `prd:ready` | `prd:implementing` | `@claude implement` comment | Workflow |
| `prd:implementing` | `prd:completed` | PR merged | Workflow |
| Any | `prd:blocked` | Manual label add | Human |
| `prd:blocked` | Previous state | Manual label remove | Human |

---

### Step 5: Save PRD

**Once approved (or in non-interactive mode):**

1. Determine if `--issue` flag is present in `$1`
2. Strip `--issue` from topic if present
3. Generate kebab-case filename: `PRD-{topic}.md`

**If NO `--issue` flag:**
- Save to: `PRDs/{issue-number}-{kebab-case-topic}.md`
- Confirm save location to user
- **IF INTERACTIVE:** Thank user and provide next steps

**If `--issue` flag present:**
- Save to: `PRDs/{issue-number}-{kebab-case-topic}.md` (for reference)
- Create GitHub issue by executing (use Bash tool with `gh` command):
  ```bash
  gh issue create \
    --title "PRD: {Topic Title}" \
    --body-file PRDs/{issue-number}-{topic}.md \
    --label "prd,prd:draft"
  ```
- Parse the issue number from output
- Report issue number and URL to user
- **IF INTERACTIVE:** Remind user to change label to `prd:ready` when ready to implement

---

## PRD Generation Best Practices

Apply these practices when generating PRD content:

1. **Complexity-Aware**: Assess tier first, then adapt depth accordingly
2. **File References**: Always use format `path/to/file.ts:start-end` for precise references
3. **ASCII Diagrams**: Use for architecture visualizations (when helpful)
4. **Mermaid Diagrams**: Use for sequence flows and complex interactions (Tier 2-3)
5. **Developer Focus**: Include "Developer Experience Philosophy" for Tier 2-3
6. **Phased Approach**: 1-5 phases based on complexity
7. **Adaptive Length**:
   - Tier 1: 200-400 lines (concise)
   - Tier 2: 400-800 lines (balanced)
   - Tier 3: 800-1500+ lines (comprehensive)
8. **Appendices**: Include for Tier 3, conditionally for Tier 2
9. **Decision Log**: Document important architectural decisions

---

## Success Criteria

**Universal (All Tiers):**
- [ ] Complexity tier declared and justified
- [ ] PRD saved to `PRDs/{issue-number}-{topic}.md`
- [ ] If `--issue` flag: GitHub issue created with prd labels
- [ ] File references use `file.ts:10-50` format
- [ ] Clear, actionable implementation guidance
- [ ] Success criteria are measurable

**Tier 1 Specific:**
- [ ] PRD is 200-400 lines (concise and focused)
- [ ] Core sections (1, 2, 10) included
- [ ] No unnecessary sections added

**Tier 2 Specific:**
- [ ] PRD is 400-800 lines (balanced depth)
- [ ] Core sections + relevant conditional sections
- [ ] At least 1 diagram if architecture involved
- [ ] Implementation phases are clear (2-3 phases)

**Tier 3 Specific:**
- [ ] PRD is 800-1500+ lines (comprehensive)
- [ ] All 21 sections included with full detail
- [ ] 3-5 Mermaid diagrams included
- [ ] 2-3 ASCII diagrams included
- [ ] Complete type definitions
- [ ] Detailed implementation phases (3-5 phases)
- [ ] Complete appendices with file listings

---

## Appendix A: PRD Section Templates

The following templates define the format for all 21 PRD sections. Reference these when generating content based on tier requirements.

<prd_templates>
<header_template>
# PRD: {Title}

**Version**: 1.0
**Status**: Draft for Implementation
**Author**: AI Architect
**Target Audience**: LLM Implementation Agent
**Strategy**: {Selected Approach}

---
</header_template>

<section_templates>
## 1. Executive Summary

{Brief description of what is being built/changed}

### Key Goals

- ✅ {Goal 1}
- ✅ {Goal 2}
- ✅ {Goal 3}

### Implementation Strategy

**Phased, Non-Breaking Approach:**

1. **Phase 1**: {Foundation work}
2. **Phase 2**: {Core implementation}
3. **Phase 3**: {Validation}
4. **Phase 4**: {Cleanup/Deprecation}
5. **Phase 5**: {Advanced features}

**Critical Safety Gate**: {What must be validated before proceeding}

---

## 1.5. Developer Experience Philosophy ⭐

**The Real Goal**: {What bottleneck are we solving?}

### The Bottleneck
- ❌ **NOT**: {What this is NOT about}
- ✅ **YES**: {What this IS about}

### The Solution
{How the proposed solution addresses the bottleneck}

---

## 2. Current System Analysis

### 2.1 Existing Architecture Overview

```
{ASCII diagram of current system}
```

### 2.2 Core Components (Current System)

#### Component 1
**File**: `path/to/file.ts:start-end`

```typescript
{Key type/function signature}
```

**Responsibilities**:
- {Responsibility 1}
- {Responsibility 2}

**Key Data Flow**:
```
{Flow diagram}
```

### 2.3 Current Data Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    {Mermaid diagram}
```

### 2.4 Key Files Reference

| Component | File Path | Lines | Responsibility |
|-----------|-----------|-------|----------------|
| {Name} | `path/file.ts` | 1-100 | {What it does} |

### 2.5 Pain Points (Why Change?)

| Issue | Impact | Proposed Solution |
|-------|--------|-------------------|
| **{Issue}** | {Impact} | {Solution} |

---

## 3. Proposed Architecture

### 3.1 Architecture Overview

```
{ASCII diagram of new system}
```

### 3.2 Component Design

#### Component 1: {Name}
**Purpose**: {What it does}

```typescript
// File: path/to/new-component.ts

{Type definition with inline comments}
```

**Responsibilities**:
- {Responsibility 1}
- {Responsibility 2}

---

## 4. New Data Flow

### 4.1 Sequence Diagram: {Phase Name}

```mermaid
sequenceDiagram
    {Detailed mermaid diagram}
```

---

## 5. Migration Pattern

### 5.1 Before (Current System)

**File** (`old-file.ts`):
```typescript
{Old code example}
```

### 5.2 After (New System)

**File** (`new-file.ts`):
```typescript
{New code example}
```

**That's it.** {Explanation of simplification}

**What happens during execution**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

### 5.3 Migration Checklist (Per Component)

**Recommended Path**:
- [ ] {Step 1}
- [ ] {Step 2}
- [ ] {Step 3}

**Estimated Time**: {Time estimate}

---

## 6. Implementation Phases (Detailed)

### Phase 1: {Name} (Week 1)

**Goal**: {What to achieve}

#### Tasks
1. **{Task 1}**
   ```bash
   {Command example}
   ```

2. **{Task 2}**
   - {Sub-task 1}
   - {Sub-task 2}

**Validation**:
- [ ] {Success criterion 1}
- [ ] {Success criterion 2}

---

## 7. Type Definitions

### 7.1 Core Types

**Philosophy**: {Design principle}

```typescript
// File: path/to/types.ts

{Complete type definitions with comments}
```

---

## 8. Class Diagrams

### 8.1 {Component} Architecture

```
{ASCII class diagram showing relationships}
```

---

## 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **{Risk}** | {HIGH/MEDIUM/LOW} | {Probability} | {Mitigation strategy} |

---

## 10. Success Criteria

### Functional Requirements
- ✅ {Requirement 1}
- ✅ {Requirement 2}

### Non-Functional Requirements
- ✅ **Performance**: {Metric}
- ✅ **Maintainability**: {Metric}
- ✅ **Developer Experience**: {Metric}

### Documentation Requirements
- ✅ {Doc requirement 1}
- ✅ {Doc requirement 2}

---

## 11. Open Questions & Decisions

### Q1: {Question}
**Decision**: ✅ {Decision}
- {Rationale 1}
- {Rationale 2}

---

## 12. File Structure

```
{Directory tree showing new file organization}
```

---

## 13. Dependencies Changes

### Add
```json
{
  "dependencies": {
    "{package}": "{version}"
  }
}
```

### Remove (Phase {N})
```json
{
  "dependencies": {
    // ❌ "{old-package}": "{version}"
  }
}
```

---

## 14. Backwards Compatibility

### During Migration (Phase 1-3)
- ✅ {What continues to work}
- ✅ {What continues to work}

### After Migration (Phase 4+)
- ❌ {What breaks}
- ✅ {What's preserved}

---

## 15. Performance Benchmarks

| Metric | Old System | New System | Improvement |
|--------|-----------|------------|-------------|
| **{Metric}** | {Value} | {Value} | **{Improvement}** |

**Why Faster?**
- ✅ {Reason 1}
- ✅ {Reason 2}

---

## 16. Rollback Plan

### Phase {N} Rollback
- {Steps to rollback}
- **Impact**: {Impact description}

---

## 17. Appendix A: Complete File Listing

### New Files to Create
```
{List of new files}
```

### Files to Delete (Phase {N})
```
{List of files to delete}
```

### Files to Keep (No Changes)
```
{List of files to keep}
```

---

## 18. Appendix B: Quick Reference Commands

### Old System
```bash
{Old commands}
```

### New System
```bash
{New commands}
```

---

## 19. Conclusion

{Summary paragraph}

**Critical Success Factor**: {Key success factor}

**Next Steps**:
1. {Next step 1}
2. {Next step 2}

---

**END OF PRD**

*Ready for implementation by LLM agent. All architectural decisions documented, sequences mapped, types defined.*
</section_templates>
</prd_templates>

---

## Important Notes

- **Assess complexity first**: Always determine tier before generating
- **Adapt to complexity**: Tier 1 is concise, Tier 3 is comprehensive
- **Use Task tool**: For codebase research (especially Tier 2-3)
- **File references**: Always use format `file.ts:10-50` when referencing code
- **Include diagrams when helpful**: ASCII for architecture, Mermaid for flows
- **Real code examples**: Use actual patterns from the codebase
- **Don't over-engineer**: Simple tasks don't need 21 sections
- **Be thorough when needed**: Complex migrations deserve full treatment
- **Label workflow matters**: If using `--issue`, understand label-based automation

**Start by:**
1. Assessing complexity tier for: **$1**
2. **IF INTERACTIVE:** Present tier to user and wait for approval
3. Using Task tool to research the codebase
4. Generating PRD adapted to the assessed tier
5. **IF INTERACTIVE:** Present summary and ask for confirmation before saving
6. If `--issue` flag present: Creating GitHub issue with appropriate labels
