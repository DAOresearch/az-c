# Message Rendering Analysis & Implementation Plan

## Current Architecture Analysis

### 1. Design Patterns Used

#### Chain of Responsibility Pattern
- **Implementation**: `MessageRenderer.tsx` uses an array of renderers
- **Benefits**:
  - Each renderer decides if it can handle a message
  - Easy to add new renderers without modifying existing code
  - Follows Open/Closed Principle

#### Strategy Pattern
- **Implementation**: Each renderer implements `IMessageRenderer` interface
- **Benefits**:
  - Encapsulates rendering algorithms
  - Runtime selection of rendering strategy
  - Follows Liskov Substitution Principle

### 2. Code Quality Assessment

#### Strengths
✅ **SOLID Principles Adherence**
- Single Responsibility: Each renderer handles one message type
- Open/Closed: New renderers can be added via `registerRenderer()`
- Liskov Substitution: All renderers implement `IMessageRenderer`
- Interface Segregation: Minimal interface with just `canRender()` and `render()`

✅ **TypeScript Usage**
- Strong typing with SDKMessage types
- Interface-based design
- Type guards in renderers

✅ **Clean Code**
- Clear naming conventions
- Small, focused methods
- Good documentation comments

#### Areas for Improvement
⚠️ **Missing Features**
- No streaming message support (`SDKPartialAssistantMessage`)
- No compact boundary support (`SDKCompactBoundaryMessage`)
- Limited result message rendering (only errors shown)
- Tool call rendering is oversimplified

⚠️ **Code Issues**
- Unused `formatInput()` method in ToolCallMessageRenderer
- No error boundaries for renderer failures
- Missing key prop warnings prevention
- No memoization for expensive renders

⚠️ **Accessibility**
- No ARIA labels
- No keyboard navigation support
- Missing screen reader announcements

## Gap Analysis

### Currently Supported Message Types
1. ✅ `SDKAssistantMessage` - Basic support
2. ✅ `SDKUserMessage` - Full support
3. ✅ `SDKSystemMessage` - Partial (only init)
4. ✅ `SDKResultMessage` - Partial (only errors)

### Missing Message Types
1. ❌ `SDKUserMessageReplay` - Not handled
2. ❌ `SDKPartialAssistantMessage` - No streaming support
3. ❌ `SDKCompactBoundaryMessage` - Not rendered

### Missing Features
- No tool result rendering
- No cost/usage display
- No duration metrics
- No permission denial notifications
- No MCP server status display
- No streaming animation

## Incremental Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal**: Establish robust base architecture

#### 1.1 Create Base Renderer Class
```typescript
// src/components/messages/BaseMessageRenderer.ts
abstract class BaseMessageRenderer implements IMessageRenderer {
  abstract canRender(message: SDKMessage): boolean;
  abstract render(message: SDKMessage, index: number): JSX.Element;

  protected renderError(error: Error): JSX.Element {
    // Common error rendering
  }

  protected formatTimestamp(timestamp: number): string {
    // Common timestamp formatting
  }
}
```

#### 1.2 Add Error Boundary
```typescript
// src/components/messages/MessageErrorBoundary.tsx
class MessageErrorBoundary extends React.Component {
  // Catch and display renderer errors gracefully
}
```

#### 1.3 Create Message Utils
```typescript
// src/utils/messageUtils.ts
- extractTextContent(message: SDKMessage): string[]
- getMessageRole(message: SDKMessage): string
- isStreamingMessage(message: SDKMessage): boolean
- getMessageTimestamp(message: SDKMessage): number
```

### Phase 2: Complete Basic Renderers (Week 1-2)
**Goal**: Full coverage of basic message types

#### 2.1 Enhanced Assistant Message Renderer
- Render text content properly
- Show tool calls with details
- Display thinking/reasoning blocks
- Handle mixed content (text + tools)

#### 2.2 User Message Replay Renderer
```typescript
// src/components/messages/UserReplayRenderer.tsx
class UserReplayRenderer extends BaseMessageRenderer {
  // Show replay indicator
  // Preserve original UUID
  // Different styling for replays
}
```

#### 2.3 Enhanced Result Message Renderer
```typescript
// src/components/messages/ResultMessageRenderer.tsx
- Show success/error states
- Display duration metrics
- Show cost information
- Display usage statistics
- Show permission denials
```

### Phase 3: Advanced Features (Week 2)
**Goal**: Streaming and performance

#### 3.1 Streaming Message Renderer
```typescript
// src/components/messages/StreamingMessageRenderer.tsx
class StreamingMessageRenderer extends BaseMessageRenderer {
  // Handle partial content
  // Show typing indicator
  // Progressive rendering
  // Smooth transitions
}
```

#### 3.2 Compact Boundary Renderer
```typescript
// src/components/messages/CompactBoundaryRenderer.tsx
class CompactBoundaryRenderer extends BaseMessageRenderer {
  // Show compaction indicator
  // Display token savings
  // Collapsible view
}
```

#### 3.3 Performance Optimizations
- Add React.memo to all renderers
- Implement virtualization for long conversations
- Add message caching
- Lazy load heavy components

### Phase 4: Enhanced Tool Support (Week 2-3)
**Goal**: Rich tool interaction display

#### 4.1 Tool Use Renderer
```typescript
// src/components/messages/ToolUseRenderer.tsx
- Show tool icon/badge
- Display input parameters
- Collapsible JSON viewer
- Copy button for inputs
```

#### 4.2 Tool Result Renderer
```typescript
// src/components/messages/ToolResultRenderer.tsx
- Display tool outputs
- Error states
- Duration metrics
- Retry indicators
```

### Phase 5: Polish & Accessibility (Week 3)
**Goal**: Production-ready UI

#### 5.1 Accessibility Features
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements
- Focus management

#### 5.2 Visual Enhancements
- Syntax highlighting for code blocks
- Markdown rendering
- Copy buttons for code
- Timestamp displays
- Avatar/role indicators

#### 5.3 Interactive Features
- Message actions (copy, retry, edit)
- Expand/collapse long messages
- Search within messages
- Filter by message type

### Phase 6: Testing & Documentation (Week 3-4)
**Goal**: Maintainable codebase

#### 6.1 Unit Tests
- Test each renderer individually
- Test message type detection
- Test error boundaries
- Test utils functions

#### 6.2 Integration Tests
- Test renderer chain
- Test streaming updates
- Test performance with large datasets

#### 6.3 Documentation
- API documentation
- Usage examples
- Renderer extension guide
- Performance guidelines

## Implementation Priority

### Critical (P0) - Week 1
1. BaseMessageRenderer abstract class
2. Error boundary implementation
3. Complete UserMessageReplay renderer
4. Fix existing renderer bugs

### Important (P1) - Week 1-2
1. Enhanced ResultMessage renderer
2. StreamingMessage renderer
3. Message utilities
4. Basic accessibility

### Nice to Have (P2) - Week 2-3
1. CompactBoundary renderer
2. Enhanced tool renderers
3. Performance optimizations
4. Visual polish

### Future (P3) - Week 3+
1. Advanced interactions
2. Search/filter
3. Export functionality
4. Theming support

## Success Metrics
- ✅ 100% message type coverage
- ✅ Zero runtime errors
- ✅ <100ms render time per message
- ✅ WCAG 2.1 AA compliance
- ✅ 90%+ test coverage
- ✅ TypeScript strict mode compliance

## File Structure
```
src/
├── components/
│   └── messages/
│       ├── base/
│       │   ├── BaseMessageRenderer.ts
│       │   └── MessageErrorBoundary.tsx
│       ├── renderers/
│       │   ├── AssistantMessageRenderer.tsx
│       │   ├── UserMessageRenderer.tsx
│       │   ├── UserReplayRenderer.tsx
│       │   ├── ResultMessageRenderer.tsx
│       │   ├── SystemMessageRenderer.tsx
│       │   ├── StreamingMessageRenderer.tsx
│       │   ├── CompactBoundaryRenderer.tsx
│       │   ├── ToolUseRenderer.tsx
│       │   └── ToolResultRenderer.tsx
│       ├── MessageRenderer.tsx
│       └── index.ts
├── utils/
│   └── messageUtils.ts
└── types/
    └── messages.ts
```

## Next Steps
1. Review and approve this plan
2. Create feature branches for each phase
3. Begin with Phase 1 implementation
4. Set up CI/CD for testing
5. Create Storybook stories for each renderer