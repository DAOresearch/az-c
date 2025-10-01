# Claude Agent SDK Project Style Guidelines

## TypeScript Style Guidelines

### 1. Prefer Types Over Interfaces
Use type aliases instead of interfaces for better consistency and flexibility.

```typescript
// ✅ Good
export type User = {
  id: string;
  name: string;
};

// ❌ Avoid
export interface User {
  id: string;
  name: string;
}
```

### 2. Use Constants Instead of Enums
Replace TypeScript enums with const objects and derive types from them.

```typescript
// ✅ Good
export const MESSAGE_TYPE = {
  TEXT: "text",
  TOOL_CALL: "tool_call",
  SYSTEM: "system",
  RESULT: "result",
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];

// ❌ Avoid
export enum MessageType {
  TEXT = "text",
  TOOL_CALL = "tool_call",
  SYSTEM = "system",
  RESULT = "result",
}
```

### 3. Snake Case for External API Properties
When interfacing with external libraries (like Claude Agent SDK), maintain their naming conventions.

```typescript
// ✅ Good - matches SDK expectations
const message: SDKUserMessage = {
  type: "user",
  session_id: sessionIdRef.current,  // snake_case for SDK
  parent_tool_use_id: null,
};

// Internal code can use camelCase
const sessionIdRef = useRef<string>("");
```

## React Hook Best Practices

### 1. Cleanup Effects Should Run Only on Unmount
Avoid including dependencies that cause unnecessary cleanup runs.

```typescript
// ✅ Good - runs only on unmount
useEffect(
  () => () => {
    cleanup();
  },
  []  // Empty dependency array
);

// ❌ Avoid - runs on every render if cleanup changes
useEffect(
  () => () => {
    cleanup();
  },
  [cleanup]
);
```

### 2. Memoize Callbacks Appropriately
Use `useCallback` for functions passed as props or used in dependencies.

```typescript
// ✅ Good
const sendMessage = useCallback((content: string) => {
  // implementation
}, []);  // Include actual dependencies if needed
```

## Async Iterator Patterns

### 1. Producer-Consumer Pattern
Implement clean producer-consumer patterns with proper queueing.

```typescript
// ✅ Good - Clear separation of concerns
const queueRef = useRef<Message[]>([]);
const resolversRef = useRef<(() => void)[]>([]);

// Producer adds to queue
const produce = (item: Message) => {
  queueRef.current.push(item);
  notifyConsumer();
};

// Consumer waits when queue is empty
const consume = async () => {
  if (queueRef.current.length > 0) {
    return queueRef.current.shift();
  }
  await waitForNext();
  return queueRef.current.shift();
};
```

### 2. Async Iterable Implementation
Properly implement the AsyncIterable protocol for streaming data.

```typescript
// ✅ Good
const getAsyncIterator = (): AsyncIterable<T> => {
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          // Fast path: return immediately if available
          // Slow path: wait for data
          // Return { done, value }
        }
      };
    }
  };
};
```

## Session Management

### 1. Capture Session ID from System Messages
Store session IDs from the SDK's first system message.

```typescript
// ✅ Good
if (message.type === "system" && message.subtype === "init") {
  streamingInput.setSessionId(message.session_id);
}
```

### 2. Maintain Session Context
Use the captured session ID for all subsequent user messages.

```typescript
// ✅ Good
const message: SDKUserMessage = {
  type: "user",
  session_id: sessionIdRef.current,  // Use stored session ID
  // ... rest of message
};
```

## Code Organization

### 1. Extract Helper Functions Appropriately
Balance between extraction and inline code based on React hook rules.

```typescript
// ✅ Good - Helper inside callback to access refs
const getAsyncIterator = useCallback(() => {
  const dequeueMessage = () => {
    // Can access refs here
    return queueRef.current.shift();
  };
  // ...
}, []);
```

### 2. Use Type Guards and Assertions
Properly narrow types when needed.

```typescript
// ✅ Good
return { done: false as const, value: message };
// TypeScript knows done is literally false, not boolean
```

## Documentation

### 1. Use JSDoc for Complex Patterns
Document complex async patterns and hook behaviors.

```typescript
/**
 * Hook for managing streaming user input with async iteration support.
 *
 * Implements a producer-consumer pattern where:
 * - Producer: sendMessage() can be called anytime to queue messages
 * - Consumer: getAsyncIterator() yields messages as they arrive
 */
```

### 2. Inline Comments for Non-Obvious Logic
Explain waiting mechanisms and queue management.

```typescript
// FAST PATH: If messages are already queued, return immediately
// WAIT PATH: No messages available, so we need to wait
```

## Biome Configuration Adjustments

For this project, we've disabled certain linting rules that conflict with external library requirements:

```jsonc
{
  "linter": {
    "rules": {
      "style": {
        "useBlockStatements": "off",
        "useNamingConvention": "off",      // Allow snake_case for SDK
        "useFilenamingConvention": "off"   // Allow camelCase filenames
      }
    }
  }
}
```

## Common Patterns

### 1. Ref Pattern for Hook State
Use refs for values that shouldn't trigger re-renders.

```typescript
const valueRef = useRef<T>(initialValue);
// Access: valueRef.current
// Update: valueRef.current = newValue
```

### 2. Promise Resolver Pattern
Store promise resolvers for async coordination.

```typescript
const resolversRef = useRef<(() => void)[]>([]);

// Wait for signal
await new Promise<void>((resolve) => {
  resolversRef.current.push(resolve);
});

// Send signal
const resolve = resolversRef.current.shift();
resolve?.();
```

## Testing Considerations

1. Mock async iterators properly in tests
2. Test queue edge cases (empty, full, concurrent access)
3. Verify session ID propagation
4. Test cleanup on unmount

## Performance Guidelines

1. Avoid creating new function instances unnecessarily
2. Use empty dependency arrays for one-time setup effects
3. Memoize expensive computations
4. Keep queue operations O(1) where possible