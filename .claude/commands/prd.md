---
description: Generate comprehensive PRD for architecture/implementation projects
argument-hint: <topic-description>
allowed-tools: Read, Write, Glob, Grep, Bash, Task, WebFetch, WebSearch
---

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

<prd_best_practices>
1. **File References**: Always use format `path/to/file.ts:start-end` for precise references
2. **ASCII Diagrams**: Use box drawing for architecture visualizations
3. **Mermaid Diagrams**: Use for sequence flows and complex interactions
4. **Developer Focus**: Always include "Developer Experience Philosophy" section
5. **Phased Approach**: 5 phases with clear safety gates
6. **Comprehensive**: 1500-2500 lines typical
7. **Appendices**: Include complete file listings, commands, benchmarks
8. **Decision Log**: Document all Q&A and architectural decisions
</prd_best_practices>
</prd_templates>

# Generate Comprehensive PRD

You are a product architect creating a detailed Product Requirements Document (PRD) for: **$1**

## Your Task

Create an ultra-comprehensive PRD  following the exact structure patterns from existing PRDs in `context/active/`. The PRD should be implementation-ready for an LLM agent with zero ambiguity.

**Why this matters**: PRDs serve as complete architectural specifications that enable autonomous implementation. They must be thorough enough that an LLM agent can implement the entire system without additional clarification.

## Process

### Step 1: Deep Research Phase

First, ultra-think and research the codebase:

1. **Understand the request**: Parse `$1` to identify:
   - What is being built/changed?
   - What problem does it solve?
   - What are the key components involved?

2. **Current state analysis** (use Task tool for deep research):
   - Search for existing files related to the topic
   - Read current implementations
   - Identify dependencies and affected components
   - Document current architecture with file references (file.ts:10-50)

3. **Research best practices**:
   - WebSearch for latest patterns in the domain
   - WebFetch relevant documentation
   - Identify proven architectural approaches

### Step 2: Structure Planning

Determine the PRD structure:
- Will this be a migration (old → new)?
- Will this be net-new functionality?
- What are the risk areas?
- How many implementation phases needed?

### Step 3: Generate Comprehensive PRD

Create the PRD following the template structure above, including:

**Required Sections** (in order):
1. Header with metadata
2. Executive Summary (with Key Goals, Strategy, Safety Gates)
3. Developer Experience Philosophy ⭐
4. Current System Analysis (with file references, diagrams)
5. Proposed Architecture (with ASCII diagrams, type definitions)
6. Data Flow (with Mermaid sequence diagrams)
7. Migration Pattern (Before/After examples)
8. Implementation Phases (5 phases with tasks)
9. Type Definitions (complete TypeScript)
10. Class Diagrams (ASCII)
11. Risks & Mitigations (table format)
12. Success Criteria (Functional, Non-Functional, Documentation)
13. Open Questions & Decisions (Q&A format)
14. File Structure (directory tree)
15. Dependencies Changes (Add/Remove)
16. Backwards Compatibility
17. Performance Benchmarks (table)
18. Rollback Plan
19. Appendix A: Complete File Listing
20. Appendix B: Quick Reference Commands
21. Conclusion

**Special Requirements**:
- Use file references: `path/file.ts:10-50` format
- Include 3-5 Mermaid sequence diagrams
- Include 2-3 ASCII architecture diagrams
- Include before/after code examples
- Include complete type definitions
- Include migration checklists
- Include performance benchmarks
- Total length: 1500-2500 lines

### Step 4: Save to context/active/

Save the PRD to: `context/active/PRD-{kebab-case-topic}.md`

Use kebab-case for the filename (e.g., `PRD-vitest-migration.md`, `PRD-opentui-adapter.md`)

## Success Criteria

- [ ] PRD is 1500-2500 lines (comprehensive)
- [ ] All 21 sections included
- [ ] File references use `file.ts:10-50` format
- [ ] 3-5 Mermaid diagrams included
- [ ] 2-3 ASCII diagrams included
- [ ] Before/After code examples included
- [ ] Complete type definitions included
- [ ] 5 implementation phases with tasks
- [ ] Risk table with mitigations
- [ ] Performance benchmark table
- [ ] Complete file listings in appendix
- [ ] Saved to `context/active/PRD-{topic}.md`

<examples>
<example index="1">
<scenario>User requests PRD for new testing adapter</scenario>

<input>
/prd OpenTUI browser-based terminal adapter for E2E testing
</input>

<research_process>
1. Search for existing adapters: `Grep "adapter" src/testing/`
2. Read current implementation: `Read src/testing/capture/adapters/types.ts`
3. Identify dependencies: Check package.json for Playwright, node-pty
4. Research OpenTUI: WebFetch OpenTUI testing docs
5. Analyze test patterns: Read existing test files
</research_process>

<expected_output>
# PRD: OpenTUI Native Test Adapter with Animation Support

**Version**: 1.0
**Status**: Draft for Implementation
**Author**: AI Architect
**Target Audience**: LLM Implementation Agent

---

## 1. Executive Summary

Replace platform-specific terminal capture adapters with pure TypeScript solution using `@opentui/core/testing`...

[... 2000 lines of detailed PRD ...]

### 2.1 Existing Architecture Overview

**File References:**
- Adapter Interface: `src/testing/capture/adapters/types.ts:1-38`
- macOS Adapter: `src/testing/capture/adapters/macos.ts:1-118`

```
┌─────────────────────────────┐
│   captureTerminal()         │
└──────────┬──────────────────┘
           │
    ┌──────▼──────┐
    │  Adapters   │
    └─────────────┘
```

[... continues with all 21 sections ...]
</expected_output>

<reasoning>
PRD generated by:
1. Deep research of existing adapters
2. File references with line numbers
3. ASCII diagrams for architecture
4. Mermaid diagrams for sequences
5. Complete migration path
6. 5 implementation phases
7. Comprehensive appendices
Result: 2000+ line implementation-ready PRD
</reasoning>
</example>

<example index="2">
<scenario>User requests PRD for new feature</scenario>

<input>
/prd Implement authentication system with JWT tokens and refresh flow
</input>

<research_process>
1. Search for existing auth: `Grep "auth" src/`
2. Check if user models exist: `Glob "**/*user*.ts"`
3. Research JWT best practices: WebSearch "JWT refresh token security 2025"
4. Check dependencies: Read package.json
5. Identify API patterns: Read existing service files
</research_process>

<expected_output>
# PRD: JWT Authentication System with Refresh Token Flow

**Version**: 1.0
**Status**: Draft for Implementation
**Author**: AI Architect
**Target Audience**: LLM Implementation Agent
**Strategy**: Secure-by-Default with Token Rotation

---

## 1. Executive Summary

Implement a production-ready JWT authentication system with automatic refresh token rotation, secure httpOnly cookies, and comprehensive security controls.

### Key Goals

- ✅ Implement JWT access/refresh token flow
- ✅ Secure httpOnly cookie storage
- ✅ Automatic token rotation
- ✅ Rate limiting and brute force protection
- ✅ Comprehensive audit logging

### Implementation Strategy

1. **Phase 1**: Core JWT infrastructure (Week 1)
2. **Phase 2**: Refresh token flow (Week 1-2)
3. **Phase 3**: Security hardening (Week 2)
4. **Phase 4**: Monitoring & logging (Week 3)
5. **Phase 5**: Advanced features (Week 3+)

[... continues with full 21-section structure ...]

## 2. Current System Analysis

### 2.1 Existing Architecture

**File References:**
- No existing auth system found
- API patterns: `src/api/routes/*.ts:1-50`
- User models: Not found - must be created

[... continues ...]
</expected_output>

<reasoning>
PRD handles net-new feature by:
1. Researching current state (nothing exists)
2. Proposing complete architecture
3. Including security best practices
4. Comprehensive implementation plan
5. All 21 required sections
Result: Complete greenfield implementation PRD
</reasoning>
</example>

<example index="3">
<scenario>User requests PRD for migration/refactor</scenario>

<input>
/prd Migrate from REST API to GraphQL with type-safe resolvers
</input>

<research_process>
1. Find all REST endpoints: `Grep "app.get|app.post" src/`
2. Analyze request/response types: Read API type files
3. Research GraphQL patterns: WebFetch GraphQL best practices
4. Check schema patterns: Search for existing GraphQL code
5. Identify affected clients: Find all API consumers
</research_process>

<expected_output>
# PRD: REST to GraphQL Migration with Type-Safe Resolvers

**Version**: 1.0
**Status**: Draft for Implementation
**Author**: AI Architect
**Target Audience**: LLM Implementation Agent
**Strategy**: Incremental Migration with Dual Support

---

## 1. Executive Summary

Migrate from REST API to GraphQL while maintaining backwards compatibility during transition period...

### Key Goals

- ✅ Full type safety with generated types
- ✅ Zero downtime migration
- ✅ Maintain REST endpoints during transition
- ✅ Auto-generated documentation
- ✅ Optimized N+1 query resolution

[... includes Developer Experience Philosophy section ...]

## 1.5. Developer Experience Philosophy ⭐

**The Real Goal**: Simplify API development with type safety

### The Bottleneck
- ❌ **NOT**: API performance (REST is fine)
- ✅ **YES**: Developer productivity and type safety

### The Solution
GraphQL with auto-generated TypeScript types eliminates manual type definitions...

[... continues with all sections, showing Before/After examples ...]

## 5. Migration Pattern

### 5.1 Before (REST)

**File** (`api/users.ts`):
```typescript
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user); // No type safety!
});
```

### 5.2 After (GraphQL)

**File** (`graphql/resolvers/user.ts`):
```typescript
export const userResolver: Resolver<User> = {
  user: async (_parent, { id }, ctx) => {
    return ctx.db.users.findById(id); // Fully typed!
  }
};
```

[... continues with complete migration strategy ...]
</expected_output>

<reasoning>
Migration PRD includes:
1. Current REST architecture analysis
2. Proposed GraphQL architecture
3. Side-by-side Before/After comparisons
4. Dual-support migration strategy
5. Phased deprecation plan
6. Complete type definitions
Result: Zero-risk migration PRD
</reasoning>
</example>
</examples>

## Important Notes

- **Be ultra-comprehensive**: 1500-2500 lines minimum
- **Use Task tool**: For deep codebase research (don't do it manually)
- **File references**: Always include line numbers (file.ts:10-50)
- **Diagrams**: Both ASCII and Mermaid
- **Real code**: Before/After examples must be actual code patterns
- **Complete types**: Full TypeScript definitions
- **Safety first**: Always include rollback plans and safety gates

Start by using the Task tool to deeply research the codebase for: **$1**
