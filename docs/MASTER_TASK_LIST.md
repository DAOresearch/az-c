# 📋 MASTER TASK LIST - HUMAN-IN-THE-LOOP IMPLEMENTATION
## Aztec Agent Chat - Refactoring with Manual Testing

---

## 🎯 OVERVIEW

This document provides a step-by-step task list for implementing the changes from the Codebase Audit. Each task includes:

- ✅ **Atomic changes** - Small, reversible modifications
- 🧪 **Human test scenarios** - Detailed testing instructions for you
- ⏸️ **Explicit pause points** - Agent waits for your feedback
- 🔄 **Rollback commands** - Quick recovery if something breaks
- 📊 **Progress tracking** - Clear success/failure criteria

---

## 🚦 HOW TO USE THIS DOCUMENT

### Agent's Role:
1. Implement one subtask at a time
2. Commit changes to git
3. Provide detailed test instructions
4. **WAIT** for your test results
5. Proceed only after ✅ PASS

### Your Role:
1. Read the test scenario
2. Run the app (`bun run dev`)
3. Follow test steps exactly
4. Observe behavior
5. Report back: "✅ PASS" or "❌ FAIL: [what happened]"

### If Test Fails:
```bash
# Rollback the change
git checkout HEAD -- <file>

# Or reset to last commit
git reset --hard HEAD

# Report the failure to agent with details
```

---

## 📊 PROGRESS TRACKER

### Phase 1: Critical Fixes ✅ (4/4 complete)
- ✅ Task 1.1: Fix Input Blocking Bug (3/3 subtasks)
- ✅ Task 1.2: Move Session Management to Service (4/4 subtasks)
- ✅ Task 1.3: Remove Redundant State (2/2 subtasks)
- ✅ Task 1.4: Display User Messages in Chat (1/1 subtasks)

### Phase 2: Architecture Improvements ⬜ (0/3 complete)
- ⬜ Task 2.1: Add Tool Result Support (0/4 subtasks)
- ⬜ Task 2.2: Create Theme System (0/3 subtasks)
- ⬜ Task 2.3: Delete Dead Code (0/1 subtasks)

### Phase 3: Component Refactoring ⬜ (0/3 complete)
- ⬜ Task 3.1: Create Atomic Components (0/5 subtasks)
- ⬜ Task 3.2: Refactor ChatContainer (0/3 subtasks)
- ⬜ Task 3.3: Improve Type Safety (0/3 subtasks)

**Total Progress: 10/28 subtasks complete**

---

# PHASE 1: CRITICAL FIXES

## ⚠️ Pre-Phase Checklist
- [ ] Current branch: `main` (or create feature branch)
- [ ] No uncommitted changes: `git status` shows clean
- [ ] App currently working: `bun run dev` starts successfully
- [ ] Can send at least one message and receive response

---

## 🔴 TASK 1.1: Fix Input Blocking Bug

**Problem**: After sending first message and receiving response, input field becomes unresponsive for second message.

**Root Cause**: Creating new async iterator on every loop iteration, old iterator still blocking inside SDK.

**Files Affected**: `src/hooks/useAgentQuery.ts`

**Estimated Time**: 1 hour

---

### Subtask 1.1.1: Backup Current State ⬜

**What I'll Do**:
- Create git commit of current working state
- Tag it as `pre-refactor-backup`

**Commands**:
```bash
git add .
git commit -m "Backup: Working state before Phase 1 refactor"
git tag pre-refactor-backup
```

**🧪 HUMAN TEST SCENARIO**:

**Test Steps**:
1. Run: `git log --oneline -1`
2. Verify commit message shows "Backup: Working state..."
3. Run: `git tag`
4. Verify `pre-refactor-backup` tag exists

**✅ Success Criteria**:
- Commit created
- Tag visible in `git tag` output

**❌ Failure Signs**:
- Git errors
- No commit/tag created

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 1.1.2: Simplify processQuery - Remove While Loop ⬜

**What I'll Do**:
- Remove the `while(true)` loop from `processQuery` function
- Remove `processQueryIteration` helper function
- Flatten to single-pass processing
- Keep iterator creation in place (will fix next)

**File**: `src/hooks/useAgentQuery.ts`

**Changes**:
```typescript
// BEFORE (lines 97-120):
const processQuery = async (initialSessionId?: string) => {
  let currentSessionId = initialSessionId;

  while (true) {
    try {
      const queryEnded = await processQueryIteration(currentSessionId);
      if (queryEnded) {
        currentSessionId = sessionIdRef.current;
      }
    } catch (err) {
      // ...
      break;
    }
  }
};

// AFTER:
const processQuery = async () => {
  const messageIterator = streamingInput.getAsyncIterator();

  try {
    const queryIterator = agentService.startQuery(messageIterator);

    for await (const message of queryIterator) {
      setMessages(prev => [...prev, message]);

      // Capture session ID
      if (message.type === "system" && message.subtype === "init") {
        sessionIdRef.current = message.session_id;
      }

      // Handle result
      if (message.type === "result") {
        setIsRunning(false);
        isStartedRef.current = false;
        hasEndedRef.current = true;
      }
    }
  } catch (err) {
    logger.error("Agent query error:", err);
    setError(err instanceof Error ? err : new Error(String(err)));
    setIsRunning(false);
    isStartedRef.current = false;
  }
};
```

**Git Commit**:
```bash
git add src/hooks/useAgentQuery.ts
git commit -m "refactor: Simplify processQuery - remove while loop"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Wait for app to load
2. Type message: "hello"
3. Press Enter
4. Wait for agent to respond
5. Observe response appears
6. Type second message: "test"
7. **CRITICAL**: Check if you can type

**✅ Success Criteria**:
- App starts without errors
- First message sends successfully
- Agent responds
- **Input may still be frozen** (expected - not fixed yet)
- No crashes or errors

**❌ Failure Signs**:
- App won't start
- Errors in console
- First message doesn't send
- App crashes during response

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 1.1.3: Move Iterator Creation Outside Loop ⬜

**What I'll Do**:
- Move `getAsyncIterator()` call to `start()` function
- Store iterator in ref to reuse across restarts
- Remove iterator creation from `processQuery`

**File**: `src/hooks/useAgentQuery.ts`

**Changes**:
```typescript
// Add new ref at top
const messageIteratorRef = useRef<AsyncIterable<SDKUserMessage> | null>(null);

// Update start function
const start = () => {
  if (isStartedRef.current && !hasEndedRef.current) return;

  isStartedRef.current = true;
  setIsRunning(true);
  setError(null);

  // Create iterator once on first start
  if (!messageIteratorRef.current) {
    messageIteratorRef.current = streamingInput.getAsyncIterator();
  }

  processQuery();
};

// Update processQuery to use ref
const processQuery = async () => {
  if (!messageIteratorRef.current) {
    throw new Error("Message iterator not initialized");
  }

  const messageIterator = messageIteratorRef.current;

  try {
    const queryIterator = agentService.startQuery(
      messageIterator,
      hasEndedRef.current ? sessionIdRef.current : undefined
    );

    // ... rest unchanged
  }
};
```

**Git Commit**:
```bash
git add src/hooks/useAgentQuery.ts
git commit -m "fix: Move async iterator creation outside loop - fixes input blocking"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Type message: "hello"
2. Press Enter
3. Wait for full response to complete
4. **CRITICAL TEST**: Try typing second message: "how are you"
5. Verify you can type each character
6. Press Enter to send
7. Wait for second response
8. Try typing third message: "goodbye"
9. Verify input still responsive

**✅ Success Criteria**:
- ✅ First message sends and responds
- ✅ **Input field accepts typing after first response**
- ✅ Second message sends and responds
- ✅ Third message can be typed
- ✅ No errors in logs

**❌ Failure Signs**:
- ❌ Input frozen after first response
- ❌ Can't type second message
- ❌ App crashes
- ❌ Errors in console/logs

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS - Input now responsive!" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR CRITICAL TEST RESULT**

---

## 🔴 TASK 1.2: Move Session Management to Service

**Problem**: React hook managing SDK state (session ID). Violates dependency inversion principle.

**Solution**: Move session tracking to `AgentService` where it belongs.

**Files Affected**:
- `src/types/services.ts`
- `src/services/AgentService.ts`
- `src/hooks/useAgentQuery.ts`

**Estimated Time**: 2 hours

---

### Subtask 1.2.1: Update IAgentService Interface ⬜

**What I'll Do**:
- Add session management methods to `IAgentService` interface
- Add type documentation

**File**: `src/types/services.ts`

**Changes**:
```typescript
export type IAgentService = {
  startQuery(
    messageIterator: AsyncIterable<SDKUserMessage>,
    sessionId?: string
  ): AsyncIterable<SDKMessage>;

  stop(): void;

  // NEW: Session management
  getSessionId(): string | null;
  hasActiveSession(): boolean;
};
```

**Git Commit**:
```bash
git add src/types/services.ts
git commit -m "feat: Add session management methods to IAgentService interface"
```

**🧪 HUMAN TEST SCENARIO**:

**Test Steps**:
1. Run: `bun run build` or `npx tsc --noEmit`
2. Check for TypeScript errors

**✅ Success Criteria**:
- No TypeScript errors
- Build succeeds
- Interface updated

**❌ Failure Signs**:
- TypeScript compilation errors
- Build fails

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [error message]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 1.2.2: Implement Session Management in AgentService ⬜

**What I'll Do**:
- Add `sessionId` private field to `AgentService`
- Implement `getSessionId()` method
- Implement `hasActiveSession()` method
- Capture session ID from system messages inside service
- Auto-resume with captured session ID

**File**: `src/services/AgentService.ts`

**Changes**:
```typescript
export class AgentService implements IAgentService {
  private abortController: AbortController | null = null;
  private readonly config: AgentServiceConfig;
  private sessionId: string | null = null; // NEW

  // ... constructor unchanged

  async *startQuery(
    messageIterator: AsyncIterable<SDKUserMessage>,
    sessionId?: string
  ): AsyncIterable<SDKMessage> {
    this.abortController = new AbortController();

    try {
      const queryIterator = query({
        prompt: messageIterator,
        options: {
          model: this.config.model,
          maxTurns: this.config.maxTurns,
          allowedTools: this.config.allowedTools,
          cwd: this.config.cwd,
          abortController: this.abortController,
          permissionMode: "bypassPermissions",
          // Auto-resume if we have a session ID
          ...(this.sessionId && { resume: this.sessionId }),
        },
      });

      for await (const message of queryIterator) {
        // Capture session ID from init messages
        if (message.type === "system" && message.subtype === "init") {
          this.sessionId = message.session_id;
          logger.info(`Session captured by service: ${this.sessionId}`);
        }

        yield message;
      }
    } catch (error) {
      logger.error("Agent query error:", error);
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  // NEW methods
  getSessionId(): string | null {
    return this.sessionId;
  }

  hasActiveSession(): boolean {
    return this.sessionId !== null;
  }

  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
```

**Git Commit**:
```bash
git add src/services/AgentService.ts
git commit -m "feat: Implement session management in AgentService"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Type and send message: "test"
2. Wait for response
3. Check `combined.log` file for: "Session captured by service: [session-id]"
4. Type and send second message: "hello"
5. Wait for response
6. Verify both messages work

**✅ Success Criteria**:
- App starts without errors
- Messages send and receive responses
- Log shows "Session captured by service"
- No regressions in functionality

**❌ Failure Signs**:
- App crashes
- Messages don't send
- No session ID in logs
- TypeScript errors

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 1.2.3: Remove Session Tracking from useAgentQuery ⬜

**What I'll Do**:
- Remove `sessionIdRef` from hook
- Remove session capture logic from hook
- Remove session handling from message processing
- Simplify resume logic

**File**: `src/hooks/useAgentQuery.ts`

**Changes**:
```typescript
// REMOVE this line:
const sessionIdRef = useRef<string>("");

// UPDATE processQuery:
const processQuery = async () => {
  if (!messageIteratorRef.current) {
    throw new Error("Message iterator not initialized");
  }

  const messageIterator = messageIteratorRef.current;

  try {
    // Remove sessionId parameter - service handles it internally now
    const queryIterator = agentService.startQuery(messageIterator);

    for await (const message of queryIterator) {
      setMessages(prev => [...prev, message]);

      // REMOVE session capture - service does this now
      // if (message.type === "system" && message.subtype === "init") {
      //   sessionIdRef.current = message.session_id;
      // }

      if (message.type === "result") {
        setIsRunning(false);
        isStartedRef.current = false;
        hasEndedRef.current = true;
      }
    }
  } catch (err) {
    logger.error("Agent query error:", err);
    setError(err instanceof Error ? err : new Error(String(err)));
    setIsRunning(false);
    isStartedRef.current = false;
  }
};
```

**Git Commit**:
```bash
git add src/hooks/useAgentQuery.ts
git commit -m "refactor: Remove session tracking from hook - service owns it now"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Send message: "first message"
2. Wait for response
3. Send message: "second message"
4. Wait for response
5. Send message: "third message"
6. Wait for response
7. Verify session continuity (agent remembers context)

**✅ Success Criteria**:
- All messages send successfully
- Agent responds to all messages
- Session persists (context maintained)
- Input remains responsive
- No errors

**❌ Failure Signs**:
- Session lost between messages
- Agent forgets context
- App crashes
- Messages fail to send

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 1.2.4: Verify Session Management ⬜

**What I'll Do**:
- Add debug logging to verify service owns session
- Test that session persists across messages

**File**: `src/hooks/useAgentQuery.ts`

**Changes**:
```typescript
const start = () => {
  if (isStartedRef.current && !hasEndedRef.current) return;

  isStartedRef.current = true;
  setIsRunning(true);
  setError(null);

  // Log session state
  const hasSession = agentService.hasActiveSession();
  const sessionId = agentService.getSessionId();
  logger.info(`Starting query - Has session: ${hasSession}, ID: ${sessionId}`);

  if (!messageIteratorRef.current) {
    messageIteratorRef.current = streamingInput.getAsyncIterator();
  }

  processQuery();
};
```

**Git Commit**:
```bash
git add src/hooks/useAgentQuery.ts
git commit -m "chore: Add session management verification logging"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
# Clear old logs
rm combined.log error.log

# Start app
bun run dev
```

**Test Steps**:
1. Send message: "hello"
2. Wait for response
3. Check `combined.log` for:
   - First: "Starting query - Has session: false, ID: null"
   - Then: "Session captured by service: [some-id]"
4. Send second message: "test"
5. Check `combined.log` for:
   - "Starting query - Has session: true, ID: [same-id]"
6. Verify session ID is the same for both

**✅ Success Criteria**:
- First message: hasSession = false
- After first message: session captured
- Second message: hasSession = true with same ID
- Session persists across messages

**❌ Failure Signs**:
- Session ID changes between messages
- hasSession always false
- No session captured logs

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS - Session managed by service!" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

## 🔴 TASK 1.3: Remove Redundant State

**Problem**: Multiple refs tracking similar state (`hasEndedRef`, `isStartedRef`). Creates complexity and potential inconsistency.

**Solution**: Use `isRunning` as single source of truth.

**Files Affected**: `src/hooks/useAgentQuery.ts`

**Estimated Time**: 30 minutes

---

### Subtask 1.3.1: Remove hasEndedRef ⬜

**What I'll Do**:
- Remove `hasEndedRef` ref declaration
- Remove all usages of `hasEndedRef`
- Simplify result handling

**File**: `src/hooks/useAgentQuery.ts`

**Changes**:
```typescript
// REMOVE this line:
const hasEndedRef = useRef(false);

// UPDATE start function:
const start = () => {
  // Simplified check - just use isStartedRef for now
  if (isStartedRef.current) return;

  isStartedRef.current = true;
  setIsRunning(true);
  setError(null);

  const hasSession = agentService.hasActiveSession();
  const sessionId = agentService.getSessionId();
  logger.info(`Starting query - Has session: ${hasSession}, ID: ${sessionId}`);

  if (!messageIteratorRef.current) {
    messageIteratorRef.current = streamingInput.getAsyncIterator();
  }

  processQuery();
};

// UPDATE processQuery - remove hasEndedRef:
for await (const message of queryIterator) {
  setMessages(prev => [...prev, message]);

  if (message.type === "result") {
    setIsRunning(false);
    isStartedRef.current = false;
    // REMOVED: hasEndedRef.current = true;
  }
}
```

**Git Commit**:
```bash
git add src/hooks/useAgentQuery.ts
git commit -m "refactor: Remove hasEndedRef - simplify state management"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Send message: "test 1"
2. Wait for complete response
3. Send message: "test 2"
4. Wait for complete response
5. Send message: "test 3"
6. Verify all work correctly

**✅ Success Criteria**:
- All messages send successfully
- Responses received for all
- Can restart query after completion
- No state inconsistencies

**❌ Failure Signs**:
- Can't send second message
- Query won't restart
- State errors

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 1.3.2: Remove isStartedRef and Use isRunning ⬜

**What I'll Do**:
- Remove `isStartedRef` ref
- Use `isRunning` state directly via callback
- Simplify start logic

**File**: `src/hooks/useAgentQuery.ts`

**Changes**:
```typescript
// REMOVE this line:
const isStartedRef = useRef(false);

// UPDATE start function to use callback and check isRunning:
const start = useCallback(() => {
  if (isRunning) {
    logger.info("Query already running, ignoring start");
    return;
  }

  setIsRunning(true);
  setError(null);

  const hasSession = agentService.hasActiveSession();
  const sessionId = agentService.getSessionId();
  logger.info(`Starting query - Has session: ${hasSession}, ID: ${sessionId}`);

  if (!messageIteratorRef.current) {
    messageIteratorRef.current = streamingInput.getAsyncIterator();
  }

  processQuery();
}, [isRunning, agentService, streamingInput]);

// UPDATE processQuery:
for await (const message of queryIterator) {
  setMessages(prev => [...prev, message]);

  if (message.type === "result") {
    setIsRunning(false);
    // REMOVED: isStartedRef.current = false;
  }
}

// UPDATE stop function:
const stop = useCallback(() => {
  agentService.stop();
  setIsRunning(false);
  // REMOVED: isStartedRef.current = false;
}, [agentService]);
```

**Git Commit**:
```bash
git add src/hooks/useAgentQuery.ts
git commit -m "refactor: Remove isStartedRef - use isRunning as single source of truth"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Send message: "hello"
2. **While agent is responding**, try to send another message: "test"
3. Wait for first response to complete
4. Check if second message was queued and sent
5. Send third message after completion: "final"
6. Verify all three messages processed correctly

**✅ Success Criteria**:
- First message sends and responds
- Can queue second message while first processing
- Third message works after completion
- No duplicate processing
- State transitions clean

**❌ Failure Signs**:
- Multiple queries run simultaneously
- State confusion
- Messages lost
- Can't restart after completion

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

## 🔴 TASK 1.4: Display User Messages in Chat

**Problem**: User messages are not displayed in the chat UI. Only assistant messages show up, making the conversation one-sided and confusing.

**Root Cause**: The SDK's `queryIterator` only yields messages FROM the agent (assistant, system, result). User messages flow INTO the SDK but are never yielded back out. The `useAgentQuery` hook only adds messages from the query iterator to state.

**Files Affected**: `src/components/chat/ChatContainer.tsx`, `src/hooks/useAgentQuery.ts`

**Estimated Time**: 15 minutes

---

### Subtask 1.4.1: Add User Messages to Chat ⬜

**What I'll Do**:
- Expose a method from `useAgentQuery` to manually add user messages
- Call this method from `ChatContainer` when user submits a message
- Display user messages with optimistic UI update

**File Changes**:

**1. Update `src/hooks/useAgentQuery.ts`**:
```typescript
// Add method to manually add user message to display
const addUserMessage = useCallback((content: string) => {
  const userMessage: SDKMessage = {
    type: "user",
    session_id: agentService.getSessionId() || "",
    message: {
      role: "user",
      content: [{ type: "text", text: content }],
    },
    parent_tool_use_id: null,
  };
  setMessages((prev) => [...prev, userMessage]);
}, [agentService]);

// Return in hook result
return {
  messages,
  isRunning,
  error,
  start,
  stop,
  addUserMessage, // NEW
};
```

**2. Update `src/components/chat/ChatContainer.tsx`**:
```typescript
// Get addUserMessage from hook
const { messages, isRunning, error, start, addUserMessage } = useAgentQuery(
  service,
  streamingInput
);

// Update handleSubmit
const handleSubmit = (message: string) => {
  if (!message.trim()) return;
  logger.info(`Submitting message: ${message}, isRunning: ${isRunning}`);

  // Add user message to UI immediately (optimistic update)
  addUserMessage(message);

  // Send to SDK
  streamingInput.sendMessage(message);

  // If the query isn't running, restart it
  if (!isRunning) {
    logger.info("Query not running, restarting...");
    start();
  }
};
```

**Git Commit**:
```bash
git add src/hooks/useAgentQuery.ts src/components/chat/ChatContainer.tsx
git commit -m "feat: Display user messages in chat UI

- Add addUserMessage method to useAgentQuery hook
- Optimistically add user message to UI when submitted
- Fixes one-sided conversation display issue"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Type message: "hello"
2. Press Enter
3. **VERIFY**: See "You: hello" appear immediately
4. Wait for assistant response
5. **VERIFY**: See "Assistant: [response]"
6. Type second message: "how are you"
7. Press Enter
8. **VERIFY**: See "You: how are you" appear
9. **VERIFY**: Both user and assistant messages visible

**✅ Success Criteria**:
- ✅ User messages appear immediately when sent
- ✅ Assistant messages appear when received
- ✅ Both roles visible in chat (You: and Assistant:)
- ✅ Conversation flow is clear and easy to follow

**❌ Failure Signs**:
- ❌ Only assistant messages visible
- ❌ User messages delayed or missing
- ❌ Duplicate user messages

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS - User messages visible!" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

## 🎉 PHASE 1 COMPLETE VERIFICATION

Before moving to Phase 2, let's verify all Phase 1 fixes:

**🧪 COMPREHENSIVE PHASE 1 TEST**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. ✅ Send message: "What is 2+2?"
2. ✅ Wait for response
3. ✅ **Verify input responsive** (main bug fix)
4. ✅ Send message: "What about 3+3?"
5. ✅ Verify context maintained (session management)
6. ✅ Send rapid messages: "test1", "test2", "test3"
7. ✅ Verify all process correctly (state management)
8. ✅ Check `combined.log` for session ID consistency
9. ✅ Check no errors in logs

**✅ Success Criteria**:
- ✅ Input never blocks (Issue #1 fixed)
- ✅ Session managed by service (Issue #2 fixed)
- ✅ Single state source (Issue #3 fixed)
- ✅ User messages displayed in chat (Issue #4 fixed)
- ✅ App stable and responsive
- ✅ No errors or crashes

**❌ If Any Failures**:
- Report which test failed
- We'll debug before Phase 2

**Report Back**: "✅ PHASE 1 COMPLETE - All tests pass!" or "❌ FAIL on test X: [details]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR PHASE 1 VERIFICATION**

---

# PHASE 2: ARCHITECTURE IMPROVEMENTS

## ⚠️ Pre-Phase 2 Checklist
- [ ] Phase 1 complete and verified
- [ ] All Phase 1 tests passing
- [ ] Git history clean
- [ ] No uncommitted changes

---

## 🟡 TASK 2.1: Add Tool Result Support

**Problem**: App shows tool calls but not tool results. Users can't see what tools actually returned.

**Solution**:
1. Add `ToolResultContent` type
2. Parse tool results from messages
3. Create `ToolResultRenderer` component
4. Register new renderer

**Files Affected**:
- `src/types/messages.ts`
- `src/utils/messageParser.ts`
- `src/components/messages/ToolResultRenderer.tsx` (NEW)
- `src/components/messages/MessageRenderer.tsx`

**Estimated Time**: 2 hours

---

### Subtask 2.1.1: Add ToolResultContent Type ⬜

**What I'll Do**:
- Add `ToolResultContent` type definition
- Update `MessageContent` union type

**File**: `src/types/messages.ts`

**Changes**:
```typescript
/**
 * Tool result content extracted from messages
 */
export type ToolResultContent = {
  type: "tool_result";
  tool_use_id: string;
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    source?: string; // Base64 for images
  }>;
  is_error?: boolean;
};

/**
 * Union type for content we extract from messages
 */
export type MessageContent =
  | TextContent
  | ToolCallContent
  | ToolResultContent; // ADD THIS
```

**Git Commit**:
```bash
git add src/types/messages.ts
git commit -m "feat: Add ToolResultContent type for tool execution results"
```

**🧪 HUMAN TEST SCENARIO**:

**Test Steps**:
1. Run: `npx tsc --noEmit`
2. Verify no TypeScript errors
3. Run: `bun run dev`
4. Verify app still starts

**✅ Success Criteria**:
- No TypeScript errors
- App starts normally
- No runtime errors

**❌ Failure Signs**:
- TypeScript compilation errors
- App won't start

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [error]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 2.1.2: Parse Tool Results in messageParser ⬜

**What I'll Do**:
- Update `extractAssistantContent` to handle `tool_result` blocks
- Parse tool result structure

**File**: `src/utils/messageParser.ts`

**Changes**:
```typescript
function extractAssistantContent(message: SDKMessage): MessageContent[] {
  const content: MessageContent[] = [];

  if (message.type !== "assistant") return content;

  for (const block of message.message.content) {
    if (block.type === "text") {
      content.push({
        type: "text",
        text: block.text,
      });
    } else if (block.type === "tool_use") {
      content.push({
        type: "tool_use",
        id: block.id,
        name: block.name,
        input: block.input,
      });
    } else if (block.type === "tool_result") {
      // NEW: Parse tool results
      content.push({
        type: "tool_result",
        tool_use_id: block.tool_use_id,
        content: block.content,
        is_error: block.is_error,
      });
    }
  }

  return content;
}
```

**Git Commit**:
```bash
git add src/utils/messageParser.ts
git commit -m "feat: Parse tool_result blocks from assistant messages"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Send message that triggers tool use: "List files in the current directory"
2. Wait for response
3. Observe tool calls shown (existing behavior)
4. Check `combined.log` for tool_result blocks (if any)
5. Verify app doesn't crash

**✅ Success Criteria**:
- App still works
- Tool calls shown (existing feature)
- No errors parsing messages
- App stable

**❌ Failure Signs**:
- App crashes when tool results received
- Parsing errors in logs
- Messages not displayed

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 2.1.3: Create ToolResultRenderer Component ⬜

**What I'll Do**:
- Create new `ToolResultRenderer.tsx` file
- Implement `IMessageRenderer` interface
- Render tool results with formatting

**File**: `src/components/messages/ToolResultRenderer.tsx` (NEW)

**Changes**:
```typescript
import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { ReactNode } from "react";
import type { IMessageRenderer } from "@/types/messages";

/**
 * Renderer for tool result messages
 * Single Responsibility: Only handles rendering tool execution results
 * Liskov Substitution: Can be substituted for any IMessageRenderer
 */
export class ToolResultRenderer implements IMessageRenderer {
  canRender(message: SDKMessage): boolean {
    if (message.type !== "assistant") {
      return false;
    }

    // Check if message contains any tool results
    return message.message.content.some(
      (block: { type: string }) => block.type === "tool_result"
    );
  }

  render(message: SDKMessage, index: number): ReactNode {
    if (message.type !== "assistant") {
      return <box />;
    }

    const toolResults = message.message.content.filter(
      (block: { type: string }) => block.type === "tool_result"
    );

    return (
      <box
        key={`msg-${index}`}
        style={{
          marginBottom: 2,
          flexDirection: "column",
        }}
      >
        <text fg="#999999">Tool Results:</text>

        {toolResults.map((result: {
          type: string;
          tool_use_id: string;
          content: Array<{ type: string; text?: string }>;
          is_error?: boolean;
        }) => {
          if (result.type !== "tool_result") return null;

          const textContent = result.content
            .filter(c => c.type === "text")
            .map(c => c.text)
            .join("\n");

          const color = result.is_error ? "#E74C3C" : "#50C878";

          return (
            <box key={result.tool_use_id} style={{ flexDirection: "column", marginTop: 1 }}>
              <text fg={color}>
                {result.is_error ? "❌ Error" : "✓ Success"}
              </text>
              <text>{textContent || "(no output)"}</text>
            </box>
          );
        })}
      </box>
    );
  }
}
```

**Git Commit**:
```bash
git add src/components/messages/ToolResultRenderer.tsx
git commit -m "feat: Create ToolResultRenderer component"
```

**🧪 HUMAN TEST SCENARIO**:

**Test Steps**:
1. Run: `npx tsc --noEmit`
2. Verify no TypeScript errors
3. Component not yet used - just checking it compiles

**✅ Success Criteria**:
- No TypeScript errors
- File created successfully

**❌ Failure Signs**:
- TypeScript errors
- Import errors

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [error]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 2.1.4: Register ToolResultRenderer ⬜

**What I'll Do**:
- Import `ToolResultRenderer`
- Add to renderer registry
- Place before `ToolCallRenderer` (priority order)

**File**: `src/components/messages/MessageRenderer.tsx`

**Changes**:
```typescript
import { SystemMessageRenderer } from "./SystemMessageRenderer";
import { TextMessageRenderer } from "./TextMessageRenderer";
import { ToolCallMessageRenderer } from "./ToolCallMessageRenderer";
import { ToolResultRenderer } from "./ToolResultRenderer"; // NEW

/**
 * Message renderer registry using Chain of Responsibility pattern
 */
const renderers: IMessageRenderer[] = [
  new ToolResultRenderer(), // NEW - Check results first
  new ToolCallMessageRenderer(),
  new TextMessageRenderer(),
  new SystemMessageRenderer(),
];
```

**Git Commit**:
```bash
git add src/components/messages/MessageRenderer.tsx
git commit -m "feat: Register ToolResultRenderer in renderer chain"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Send message: "What's 2+2?"
2. Verify normal text response works
3. Send message: "Use the Read tool to read package.json"
4. Wait for response
5. **Look for**: "Tool Results:" section with checkmark
6. Verify tool output is displayed
7. Check formatting is readable

**✅ Success Criteria**:
- Regular messages still work
- Tool calls shown
- **Tool results now visible** with ✓ or ❌
- Output text displayed
- Formatting clean

**❌ Failure Signs**:
- Tool results not showing
- App crashes on tool use
- Formatting broken
- Errors in logs

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS - Tool results now visible!" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

## 🟡 TASK 2.2: Create Theme System

**Problem**: Colors hardcoded throughout components. Hard to maintain, no consistency.

**Solution**: Centralized theme with color constants.

**Files Affected**:
- `src/theme/colors.ts` (NEW)
- Update all components to use theme

**Estimated Time**: 1.5 hours

---

### Subtask 2.2.1: Create Theme Colors File ⬜

**What I'll Do**:
- Create `src/theme/` directory
- Create `colors.ts` with all color constants
- Export typed color object

**File**: `src/theme/colors.ts` (NEW)

**Changes**:
```typescript
/**
 * Centralized color theme for the application
 * Single source of truth for all colors
 */
export const colors = {
  primary: "#4A90E2",
  success: "#50C878",
  error: "#E74C3C",
  warning: "#FFD700",
  tool: "#9B59B6",

  text: {
    primary: "#FFFFFF",
    secondary: "#999999",
    dim: "#666666",
    label: "#999999",
  },

  border: {
    active: "#4A90E2",
    inactive: "#4a4a4a",
  },

  background: {
    scrollbar: "#414868",
  },

  role: {
    user: "#4A90E2",
    assistant: "#50C878",
    system: "#FFD700",
  },
} as const;

export type Colors = typeof colors;
```

**Git Commit**:
```bash
mkdir -p src/theme
git add src/theme/colors.ts
git commit -m "feat: Create centralized theme system with color constants"
```

**🧪 HUMAN TEST SCENARIO**:

**Test Steps**:
1. Run: `npx tsc --noEmit`
2. Verify no errors
3. File created in correct location

**✅ Success Criteria**:
- File created
- No TypeScript errors
- Types exported

**❌ Failure Signs**:
- TypeScript errors
- Import issues

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [error]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 2.2.2: Update InputField to Use Theme ⬜

**What I'll Do**:
- Import colors from theme
- Replace hardcoded color values

**File**: `src/components/ui/InputField.tsx`

**Changes**:
```typescript
import { useState } from "react";
import { colors } from "@/theme/colors"; // NEW

// ... component code ...

return (
  <box
    style={{
      borderColor: disabled ? colors.text.dim : colors.primary, // CHANGED
      height: 3,
      padding: 0,
    }}
  >
    <input
      focused={!disabled}
      onInput={setValue}
      onSubmit={handleSubmit}
      placeholder={disabled ? "Processing..." : placeholder}
      value={value}
    />
  </box>
);
```

**Git Commit**:
```bash
git add src/components/ui/InputField.tsx
git commit -m "refactor: Use theme colors in InputField"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Observe input field border color (should be blue)
2. Send a message
3. While processing, border should turn gray
4. After response, border should return to blue
5. Verify colors look correct

**✅ Success Criteria**:
- Input field renders correctly
- Border colors change appropriately
- No visual regressions

**❌ Failure Signs**:
- Colors wrong
- Border not showing
- App crashes

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

### Subtask 2.2.3: Update All Components to Use Theme ⬜

**What I'll Do**:
- Update MessageList
- Update AgentSpinner
- Update all message renderers
- Replace all hardcoded colors

**Files**: Multiple

**Changes Per File**:

`src/components/chat/MessageList.tsx`:
```typescript
import { colors } from "@/theme/colors";

// Line 34: Change "#999999" to colors.text.secondary
// Lines 55-56: Change colors to theme colors
```

`src/components/ui/AgentSpinner.tsx`:
```typescript
import { colors } from "@/theme/colors";

// Line 72: Change "#50C878" to colors.success
```

`src/components/messages/TextMessageRenderer.tsx`:
```typescript
import { colors } from "@/theme/colors";

// Line 56: Change "#999999" to colors.text.label
```

`src/components/messages/SystemMessageRenderer.tsx`:
```typescript
import { colors } from "@/theme/colors";

// Line 46: Change "#E74C3C" to colors.error
```

`src/components/messages/ToolResultRenderer.tsx`:
```typescript
import { colors } from "@/theme/colors";

// Update color variables to use colors.error and colors.success
```

**Git Commit**:
```bash
git add src/components/
git commit -m "refactor: Migrate all components to use centralized theme"
```

**🧪 HUMAN TEST SCENARIO**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. Send message: "hello"
2. Verify:
   - "You:" label is gray
   - "Assistant:" label is gray
   - Spinner is green
3. Send message that triggers tool: "Read package.json"
4. Verify tool result colors (green for success)
5. Check all UI elements look correct
6. No visual regressions

**✅ Success Criteria**:
- All colors consistent
- UI looks good
- No visual regressions
- Theme applied everywhere

**❌ Failure Signs**:
- Colors wrong
- Missing colors
- UI broken

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS - Theme applied!" or "❌ FAIL: [what happened]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

## 🟡 TASK 2.3: Delete Dead Code

**Problem**: Unused types in `src/types/index.ts` misleading developers.

**Solution**: Remove unused types, keep only what's used.

**Files Affected**: `src/types/index.ts`

**Estimated Time**: 15 minutes

---

### Subtask 2.3.1: Remove Unused Types ⬜

**What I'll Do**:
- Remove `AppState` type
- Remove `SessionInfo` type
- Remove `Stats` type
- Remove `ToolExecution` type
- Keep `COLORS` (but note it could move to theme)

**File**: `src/types/index.ts`

**Changes**:
```typescript
// Remove entire file if COLORS is moved to theme
// OR keep minimal exports if needed

// BEFORE: 46 lines
// AFTER: Consider deleting entire file or keeping only necessary exports
```

**Git Commit**:
```bash
git add src/types/index.ts
git commit -m "refactor: Remove unused type definitions (dead code)"
```

**🧪 HUMAN TEST SCENARIO**:

**Test Steps**:
1. Run: `npx tsc --noEmit`
2. Verify no TypeScript errors
3. Run: `bun run dev`
4. Verify app still works
5. Send test messages

**✅ Success Criteria**:
- No TypeScript errors
- App works normally
- No imports broken

**❌ Failure Signs**:
- TypeScript errors
- Import errors
- App won't build

**Rollback**:
```bash
git reset --hard HEAD~1
```

**Report Back**: "✅ PASS" or "❌ FAIL: [error]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR TEST RESULT**

---

## 🎉 PHASE 2 COMPLETE VERIFICATION

**🧪 COMPREHENSIVE PHASE 2 TEST**:

**Setup**:
```bash
bun run dev
```

**Test Steps**:
1. ✅ Send message: "Read package.json file"
2. ✅ Verify tool call shown
3. ✅ **Verify tool result visible** (NEW)
4. ✅ Check colors consistent throughout UI (NEW)
5. ✅ Send multiple tool-using messages
6. ✅ Verify all tool results display
7. ✅ Check no TypeScript errors
8. ✅ Verify no dead code warnings

**✅ Success Criteria**:
- ✅ Tool results visible (Issue #7 fixed)
- ✅ Centralized theme (Issue #6 fixed)
- ✅ No dead code (Issue #5 fixed)
- ✅ All Phase 1 fixes still working
- ✅ App stable

**Report Back**: "✅ PHASE 2 COMPLETE!" or "❌ FAIL: [details]"

---

⏸️ **AGENT PAUSES HERE - WAITING FOR PHASE 2 VERIFICATION**

---

# PHASE 3: COMPONENT REFACTORING

**Note**: Phase 3 is more extensive. Due to time constraints and complexity, I'll provide high-level task breakdown. These are "nice to have" improvements.

## 🟢 TASK 3.1: Create Atomic Components

**Subtasks**:
- 3.1.1: Create `atoms/Text.tsx` component
- 3.1.2: Create `atoms/Box.tsx` layout primitive
- 3.1.3: Create `atoms/Spinner.tsx` (extract from AgentSpinner)
- 3.1.4: Create `atoms/Stack.tsx` vertical layout
- 3.1.5: Migrate components to use atoms

**Test After Each**: Verify UI looks identical, no regressions

---

## 🟢 TASK 3.2: Refactor ChatContainer

**Subtasks**:
- 3.2.1: Move service creation to App.tsx
- 3.2.2: Make ChatContainer accept props
- 3.2.3: Extract derived state to custom hook

**Test After Each**: Verify chat functionality unchanged

---

## 🟢 TASK 3.3: Improve Type Safety

**Subtasks**:
- 3.3.1: Import SDK types for content blocks
- 3.3.2: Add type guards in renderers
- 3.3.3: Enable TypeScript strict mode

**Test After Each**: No TypeScript errors, app works

---

## 📝 FINAL NOTES

### Git Best Practices:
```bash
# View commit history
git log --oneline

# View changes
git diff

# Rollback last commit
git reset --hard HEAD~1

# Rollback to specific commit
git reset --hard <commit-hash>

# Create feature branch (recommended)
git checkout -b refactor/solid-improvements
```

### After All Phases Complete:
1. Run full test suite (if we add tests)
2. Check all logs for warnings/errors
3. Test all critical user flows
4. Create PR or merge to main
5. Tag release: `git tag v1.0.0-refactor`

---

## 📊 TOTAL PROGRESS TRACKER

```
Phase 1: [▓▓▓▓▓▓▓▓▓▓] 100% COMPLETE ✅
Phase 2: [▓▓▓▓▓▓▓▓░░]  80% COMPLETE ⏳
Phase 3: [░░░░░░░░░░]   0% NOT STARTED ⬜

Total: 27 subtasks
  ✅ Complete: 0
  ⏳ In Progress: 0
  ⬜ Not Started: 27
```

---

*End of Master Task List*