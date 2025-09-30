# Incremental Implementation Plan
## Rendering All SDK Message Types

## Overview

This plan outlines a step-by-step approach to implement complete rendering support for all SDK message types while maintaining code quality and following SOLID principles.

**Total Phases:** 5
**Estimated Complexity:** Medium
**Risk Level:** Low (incremental, backward-compatible)

---

## Phase 1: Code Quality Cleanup
**Goal:** Fix existing violations before adding new code
**Duration:** 1-2 hours
**Risk:** Low

### Tasks

#### 1.1 Remove Unused Code
- [ ] Delete `formatInput()` method from `ToolCallMessageRenderer` (or implement it)
- [ ] Document why if keeping for future use

**Files:**
- `src/components/messages/ToolCallMessageRenderer.tsx:52-63`

**Tests:**
- Verify no compilation errors
- Existing messages still render

---

#### 1.2 Extract Magic Numbers
- [ ] Create constants file for rendering configuration
- [ ] Replace magic number `200` with named constant

**Files:**
- Create: `src/constants/rendering.ts`
- Update: `src/components/messages/ToolCallMessageRenderer.tsx:56`

**Code:**
```typescript
// src/constants/rendering.ts
export const RENDERING_CONFIG = {
  MAX_TOOL_INPUT_LENGTH: 200,
  MAX_ERROR_MESSAGE_LENGTH: 500,
  TRUNCATION_SUFFIX: "...",
} as const;
```

---

#### 1.3 Replace Empty Box Returns
- [ ] Return `null` instead of `<box />` for skipped messages
- [ ] Update TypeScript return types to allow `null`

**Files:**
- `src/components/messages/SystemMessageRenderer.tsx`
- `src/components/messages/ToolCallMessageRenderer.tsx`
- `src/types/messages.ts` (update interface)

**Code:**
```typescript
// Update interface
export interface IMessageRenderer {
  canRender(message: SDKMessage): boolean;
  render(message: SDKMessage, index: number): JSX.Element | null;
}
```

**Tests:**
- Verify null elements don't break rendering
- Check MessageList handles null children

---

## Phase 2: Enhanced Existing Renderers
**Goal:** Improve current renderers before adding new ones
**Duration:** 2-3 hours
**Risk:** Low

### Tasks

#### 2.1 Enhance ToolCallMessageRenderer
- [ ] Display tool input details (formatted JSON)
- [ ] Add collapsible/expandable view for large inputs
- [ ] Use the `formatInput()` method or remove it

**Files:**
- `src/components/messages/ToolCallMessageRenderer.tsx`

**UI Design:**
```
Assistant:
[Using Read]
  file_path: /path/to/file.ts

[Using Bash]
  command: npm test
```

**Tests:**
- Long inputs truncate properly
- JSON formatting works
- Invalid JSON falls back to string

---

#### 2.2 Enhance SystemMessageRenderer - Result Messages
- [ ] Display success results with stats
- [ ] Show detailed error messages
- [ ] Display cost and usage information
- [ ] Show permission denials if any

**Files:**
- `src/components/messages/SystemMessageRenderer.tsx`

**UI Design:**
```
✓ Task completed in 2.3s
  API time: 1.8s
  Cost: $0.042
  Turns: 3

✗ Error: Maximum turns exceeded
  Duration: 45.2s
  Cost: $0.156
  Turns: 10/10
```

**Tests:**
- All result subtypes render correctly
- Cost formatting (2 decimal places)
- Duration formatting (ms, s, m)

---

#### 2.3 Add Compact Boundary Indicator
- [ ] Detect `system.compact_boundary` messages
- [ ] Display visual separator
- [ ] Show metadata (trigger, token count)

**Files:**
- `src/components/messages/SystemMessageRenderer.tsx`

**UI Design:**
```
─────────────────────────────────────
⚡ Conversation Compacted
  Trigger: automatic
  Tokens reduced: 45,203 → 8,491
─────────────────────────────────────
```

**Tests:**
- Manual and auto triggers display correctly
- Token numbers format with commas

---

## Phase 3: New Message Type Renderers
**Goal:** Add support for missing message types
**Duration:** 3-4 hours
**Risk:** Medium

### Tasks

#### 3.1 Create StreamEventRenderer
- [ ] Create new renderer class
- [ ] Handle `SDKPartialAssistantMessage` type
- [ ] Display streaming indicator
- [ ] Show partial text content

**Files:**
- Create: `src/components/messages/StreamEventRenderer.tsx`
- Update: `src/components/messages/MessageRenderer.tsx` (register)

**Code Structure:**
```typescript
export class StreamEventRenderer implements IMessageRenderer {
  canRender(message: SDKMessage): boolean {
    return message.type === "stream_event";
  }

  render(message: SDKMessage, index: number): JSX.Element | null {
    // Render streaming indicator + partial content
  }
}
```

**UI Design:**
```
Assistant: ▌ (streaming...)
This is partial text that is currently...
```

**Tests:**
- Stream events detected correctly
- Partial content displays
- Streaming indicator visible

---

#### 3.2 Create UserReplayRenderer
- [ ] Create renderer for replayed user messages
- [ ] Add visual indicator for replay vs original
- [ ] Maintain normal user message appearance with badge

**Files:**
- Create: `src/components/messages/UserReplayRenderer.tsx`
- Update: `src/components/messages/MessageRenderer.tsx` (register)

**UI Design:**
```
You: [REPLAYED]
Can you help me with this code?
```

**Tests:**
- Replay messages detected
- Badge displays correctly
- Content renders same as normal user messages

---

#### 3.3 Create ToolResultRenderer
- [ ] Create renderer for tool result messages
- [ ] Display tool output/response
- [ ] Link to parent tool call
- [ ] Handle errors vs success

**Note:** This requires detecting tool result blocks within messages

**Files:**
- Create: `src/components/messages/ToolResultRenderer.tsx`
- Update: `src/components/messages/MessageRenderer.tsx` (register)

**UI Design:**
```
[Read Result]
  Status: Success
  ─────────────────
  1 export function foo() {
  2   return "bar";
  3 }

[Bash Result]
  Status: Error (exit 1)
  ─────────────────
  npm ERR! missing script: invalid
```

**Tests:**
- Success and error results display
- Output formatted correctly
- Long outputs truncate/scroll

---

## Phase 4: Error Handling & Resilience
**Goal:** Make rendering robust and error-proof
**Duration:** 2-3 hours
**Risk:** Low

### Tasks

#### 4.1 Add Error Boundary Component
- [ ] Create React error boundary
- [ ] Wrap individual message renderers
- [ ] Display fallback UI on error
- [ ] Log errors for debugging

**Files:**
- Create: `src/components/messages/MessageErrorBoundary.tsx`
- Update: `src/components/messages/MessageRenderer.tsx` (wrap render)

**Code:**
```typescript
export class MessageErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Message render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <box>
          <text fg="#E74C3C">Failed to render message</text>
        </box>
      );
    }
    return this.props.children;
  }
}
```

**Tests:**
- Errors caught and displayed
- Other messages continue rendering
- Console logs error details

---

#### 4.2 Add Renderer Validation
- [ ] Validate message structure before rendering
- [ ] Handle missing/malformed data gracefully
- [ ] Add TypeScript type guards

**Files:**
- Create: `src/utils/messageValidation.ts`
- Update: All renderer files (add guards)

**Code:**
```typescript
export function isValidSDKMessage(message: unknown): message is SDKMessage {
  // Runtime type checking
}

export function hasRequiredFields(message: SDKMessage): boolean {
  // Check message has required properties
}
```

**Tests:**
- Invalid messages detected
- Malformed data doesn't crash
- Type guards work correctly

---

#### 4.3 Add Fallback Renderer
- [ ] Create default renderer for unknown types
- [ ] Display raw message data in dev mode
- [ ] Show helpful error in production

**Files:**
- Create: `src/components/messages/FallbackRenderer.tsx`
- Update: `src/components/messages/MessageRenderer.tsx` (use as default)

**Tests:**
- Unknown messages use fallback
- Dev mode shows debug info
- Production shows user-friendly message

---

## Phase 5: Testing & Documentation
**Goal:** Ensure quality and maintainability
**Duration:** 3-4 hours
**Risk:** Low

### Tasks

#### 5.1 Add Unit Tests
- [ ] Test each renderer's `canRender()` logic
- [ ] Test each renderer's output
- [ ] Test renderer registration
- [ ] Test chain of responsibility flow

**Files:**
- Create: `src/components/messages/__tests__/`
  - `TextMessageRenderer.test.tsx`
  - `ToolCallMessageRenderer.test.tsx`
  - `SystemMessageRenderer.test.tsx`
  - `StreamEventRenderer.test.tsx`
  - `UserReplayRenderer.test.tsx`
  - `ToolResultRenderer.test.tsx`
  - `MessageRenderer.test.tsx`

**Coverage Goal:** >80%

---

#### 5.2 Add Integration Tests
- [ ] Test full message list rendering
- [ ] Test mixed message types
- [ ] Test error scenarios
- [ ] Test performance with many messages

**Files:**
- Create: `src/components/chat/__tests__/MessageList.test.tsx`

**Tests:**
- Render 100+ messages
- Mix all message types
- Error boundary catches failures
- No memory leaks

---

#### 5.3 Update Documentation
- [ ] Document all renderer classes
- [ ] Add JSDoc comments
- [ ] Create usage examples
- [ ] Update README

**Files:**
- Update: All renderer files (JSDoc)
- Create: `docs/renderer-api.md`
- Update: `README.md`

---

#### 5.4 Create Developer Guide
- [ ] How to add new renderers
- [ ] Architecture explanation
- [ ] Testing guide
- [ ] Troubleshooting

**Files:**
- Create: `docs/developer-guide.md`

---

## Phase 6: Performance & Polish (Optional)
**Goal:** Optimize for large conversations
**Duration:** 2-3 hours
**Risk:** Low

### Tasks

#### 6.1 Add Message Virtualization
- [ ] Implement virtual scrolling for long lists
- [ ] Only render visible messages
- [ ] Maintain scroll position

**Files:**
- Update: `src/components/chat/MessageList.tsx`
- Add dependency: `react-window` or similar

---

#### 6.2 Memoize Renderers
- [ ] Use React.memo for expensive renders
- [ ] Memoize selector functions
- [ ] Optimize re-render triggers

**Files:**
- Update: All renderer files (add memo)
- Update: `src/components/messages/MessageRenderer.tsx`

---

#### 6.3 Add Loading States
- [ ] Show skeleton loaders for messages
- [ ] Add smooth transitions
- [ ] Improve perceived performance

**Files:**
- Create: `src/components/messages/MessageSkeleton.tsx`
- Update: Message renderers (add loading prop)

---

## Implementation Order

### Priority 1 (Must Have)
1. Phase 1: Code Quality Cleanup
2. Phase 2: Enhanced Existing Renderers
3. Phase 3: New Message Type Renderers
4. Phase 4: Error Handling

### Priority 2 (Should Have)
5. Phase 5: Testing & Documentation

### Priority 3 (Nice to Have)
6. Phase 6: Performance & Polish

---

## Testing Strategy

### Test Each Phase Independently
```bash
# After Phase 1
npm run check
npm run test:unit

# After Phase 2
npm run test:unit
npm run test:integration

# After Phase 3
npm run test:unit
npm run test:integration
npm run test:e2e

# After Phase 4
npm run test:error-handling

# After Phase 5
npm run test:coverage
```

### Manual Testing Checklist
- [ ] All message types render correctly
- [ ] No console errors or warnings
- [ ] Performance acceptable (100+ messages)
- [ ] Accessibility standards met
- [ ] Error states display properly
- [ ] Responsive design works

---

## Rollback Plan

Each phase is independent. If issues arise:

1. **Phase 1-2 Issues:** Revert individual commits
2. **Phase 3 Issues:** Remove new renderer from registry
3. **Phase 4 Issues:** Disable error boundaries temporarily
4. **Phase 5 Issues:** Tests don't affect runtime
5. **Phase 6 Issues:** Remove performance optimizations

---

## Success Metrics

### Code Quality
- [ ] 0 linting errors
- [ ] 0 TypeScript errors
- [ ] >80% test coverage
- [ ] All SOLID principles followed

### Functionality
- [ ] All SDK message types supported
- [ ] Error handling comprehensive
- [ ] Performance acceptable (< 100ms render time for 100 messages)

### User Experience
- [ ] Clear, readable message display
- [ ] Helpful error messages
- [ ] Smooth interactions
- [ ] Accessible to screen readers

---

## Dependencies

### New Dependencies (Optional)
- Error boundary utilities (React 16.8+)
- Virtualization library (Phase 6)
- Testing utilities (already have vitest)

### No Breaking Changes
- All changes backward compatible
- Existing code continues working
- Can implement incrementally

---

## Timeline Estimate

| Phase | Duration | Parallel? |
|-------|----------|-----------|
| Phase 1 | 1-2h | No |
| Phase 2 | 2-3h | Partially (after Phase 1) |
| Phase 3 | 3-4h | Yes (3 renderers in parallel) |
| Phase 4 | 2-3h | Partially (after Phase 3) |
| Phase 5 | 3-4h | Yes (tests in parallel) |
| Phase 6 | 2-3h | Yes (optional optimizations) |

**Total Sequential:** 13-19 hours
**Total Parallel (with 2 devs):** 8-12 hours

---

## Next Steps

1. Review this plan with team
2. Prioritize phases based on business needs
3. Create tickets/issues for each task
4. Assign Phase 1 tasks
5. Begin implementation

**Start with:** Phase 1.1 - Remove unused code