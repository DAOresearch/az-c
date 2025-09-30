# Message Rendering Architecture

## Current Strategy

### Architecture Pattern: Chain of Responsibility

The message rendering system uses the **Chain of Responsibility** pattern combined with **SOLID principles** to create a flexible, extensible rendering pipeline.

```
MessageList (Consumer)
    ↓
MessageRenderer (Dispatcher)
    ↓
getRenderer() (Chain Coordinator)
    ↓
[ToolCallRenderer, TextRenderer, SystemRenderer] (Handler Chain)
```

### Core Components

#### 1. IMessageRenderer Interface
**Location:** `src/types/messages.ts:19-29`

Defines the contract for all message renderers:
```typescript
interface IMessageRenderer {
  canRender(message: SDKMessage): boolean;
  render(message: SDKMessage, index: number): JSX.Element;
}
```

**SOLID Principles:**
- **Interface Segregation Principle:** Minimal interface with only essential methods
- **Liskov Substitution Principle:** All implementations are fully substitutable

#### 2. MessageRenderer (Dispatcher)
**Location:** `src/components/messages/MessageRenderer.tsx`

Central dispatcher that:
- Accepts any `SDKMessage` type
- Delegates to appropriate renderer via `getRenderer()`
- Provides fallback for unknown message types
- Returns rendered JSX component

**SOLID Principles:**
- **Single Responsibility:** Only responsible for delegation
- **Open/Closed Principle:** Add renderers without modifying this component

#### 3. Renderer Registry
**Location:** `src/components/messages/MessageRenderer.tsx:12-16`

```typescript
const renderers: IMessageRenderer[] = [
  new ToolCallMessageRenderer(),
  new TextMessageRenderer(),
  new SystemMessageRenderer(),
];
```

**Features:**
- Order matters: First matching renderer wins
- `registerRenderer()` allows runtime extension
- `getRenderer()` performs chain lookup

### Current Renderer Implementations

#### 1. ToolCallMessageRenderer
**Location:** `src/components/messages/ToolCallMessageRenderer.tsx`

**Handles:** Assistant messages containing `tool_use` blocks

**Detection Logic:**
```typescript
canRender(message: SDKMessage): boolean {
  return message.type === "assistant"
    && message.message.content.some(block => block.type === "tool_use");
}
```

**Rendering:**
- Displays "Assistant:" label
- Shows `[Using {toolName}]` for each tool call
- Includes unused `formatInput()` helper (truncates to 200 chars)

**Priority:** 1st (handles tool calls before text renderer)

#### 2. TextMessageRenderer
**Location:** `src/components/messages/TextMessageRenderer.tsx`

**Handles:**
- All user messages
- Assistant messages with only text content (no tool calls)

**Detection Logic:**
```typescript
canRender(message: SDKMessage): boolean {
  if (message.type === "assistant") {
    return message.message.content.every(block => block.type === "text");
  }
  if (message.type === "user") {
    return true;
  }
  return false;
}
```

**Rendering:**
- Extracts text from content blocks
- Handles both array and string content
- Displays role label ("You" or "Assistant")
- Shows "(empty message)" for empty content

**Priority:** 2nd (catches text-only messages)

#### 3. SystemMessageRenderer
**Location:** `src/components/messages/SystemMessageRenderer.tsx`

**Handles:** System and result messages

**Detection Logic:**
```typescript
canRender(message: SDKMessage): boolean {
  return message.type === "system" || message.type === "result";
}
```

**Rendering Behavior:**
- **System Init Messages:** Skipped (returns empty box)
- **Success Results:** Skipped (completion markers only)
- **Error Results:** Displayed in red
- **Compact Boundary:** Not explicitly handled (returns empty box)

**Priority:** 3rd (catch-all for system messages)

## SDK Message Types Coverage

### Fully Supported ✅

| Message Type | Subtype | Renderer | Status |
|--------------|---------|----------|--------|
| `assistant` | text only | TextMessageRenderer | ✅ Complete |
| `assistant` | with tool_use | ToolCallMessageRenderer | ✅ Basic |
| `user` | - | TextMessageRenderer | ✅ Complete |
| `system` | init | SystemMessageRenderer | ✅ Hidden |
| `result` | success | SystemMessageRenderer | ✅ Hidden |
| `result` | error_* | SystemMessageRenderer | ✅ Basic |

### Partially Supported ⚠️

| Message Type | Subtype | Issue |
|--------------|---------|-------|
| `assistant` | tool_use | Only shows tool name, no details |
| `result` | error_max_turns | No specific handling |
| `result` | error_during_execution | No specific handling |

### Not Supported ❌

| Message Type | Impact |
|--------------|--------|
| `stream_event` (SDKPartialAssistantMessage) | No streaming display |
| `system.compact_boundary` | No visual indicator |
| `user` (SDKUserMessageReplay) | No replay indication |

## Code Quality Analysis

### Strengths

1. **SOLID Compliance**
   - ✅ Single Responsibility: Each renderer handles one message type
   - ✅ Open/Closed: New renderers can be added without modification
   - ✅ Liskov Substitution: All renderers are interchangeable
   - ✅ Interface Segregation: Minimal interface contract
   - ✅ Dependency Inversion: Depends on abstraction (IMessageRenderer)

2. **Design Patterns**
   - ✅ Chain of Responsibility for renderer selection
   - ✅ Strategy Pattern for different rendering behaviors
   - ✅ Registry Pattern for renderer management

3. **Type Safety**
   - ✅ Full TypeScript typing
   - ✅ SDK type integration
   - ✅ Type guards in `canRender()` methods

4. **Code Organization**
   - ✅ Clear file structure
   - ✅ Good documentation comments
   - ✅ Separation of concerns

### Issues & Violations

#### 1. Unused Code (Complexity Rule)
**Location:** `ToolCallMessageRenderer.tsx:52-63`

```typescript
private formatInput(input: unknown): string {
  // Method defined but never used
}
```
**Violation:** Don't write functions that aren't used
**Fix:** Remove or implement

#### 2. Empty Components
**Location:** `SystemMessageRenderer.tsx:18,29,35`

Returns empty `<box />` elements frequently.

**Violation:** Don't export empty modules that don't change anything
**Fix:** Return `null` or use proper React patterns

#### 3. Type Narrowing
**Location:** `ToolCallMessageRenderer.tsx:20-22`

```typescript
render(message: SDKMessage, index: number): JSX.Element {
  if (message.type !== "assistant") {
    return <box />;
  }
```

Already verified by `canRender()`, but must re-check for type narrowing.

**Not a violation** - TypeScript limitation, acceptable

#### 4. Magic Numbers
**Location:** `ToolCallMessageRenderer.tsx:56`

```typescript
if (json.length > 200) {
```

**Violation:** Should be named constant
**Fix:** `const MAX_INPUT_LENGTH = 200;`

#### 5. Array Index as Key (Potential)
**Location:** `MessageList.tsx:53`

```typescript
key={`msg-${index}-${message.session_id}`}
```

Uses index but combines with session_id - **acceptable pattern**

#### 6. Missing Error Boundaries
No error boundaries around message rendering.

**Violation:** Should handle rendering errors gracefully
**Fix:** Add error boundary component

### Missing Functionality

1. **Stream Events**
   - No renderer for `SDKPartialAssistantMessage`
   - No streaming indicator UI

2. **Rich Result Display**
   - Success results hidden entirely
   - Error results only show subtype
   - No usage stats, cost, or duration display

3. **Compact Boundary Indicators**
   - No visual separator for conversation compaction
   - Users won't know when history was summarized

4. **Tool Result Display**
   - No way to see tool outputs
   - Users see "[Using Tool]" but never see results

5. **User Message Replay**
   - No distinction between original and replayed messages
   - Could confuse users during context replay

6. **Permission Denials**
   - Result messages include `permission_denials` array
   - Never displayed to user

## Pattern Quality Assessment

### Rating: ⭐⭐⭐⭐ (4/5)

**Strengths:**
- Excellent architecture foundation
- Clean separation of concerns
- Easy to extend
- Type-safe

**Weaknesses:**
- Incomplete implementation
- Some unused code
- Missing error handling
- No loading/streaming states

### Recommendations

1. **Complete the Implementation**
   - Add missing renderer types
   - Remove or use unused code
   - Add error boundaries

2. **Enhance User Experience**
   - Show tool results
   - Display streaming states
   - Indicate system events visually

3. **Improve Code Quality**
   - Extract magic numbers
   - Add comprehensive tests
   - Document public APIs

4. **Performance Optimization**
   - Memoize renderers
   - Optimize re-renders
   - Consider virtualization for long message lists