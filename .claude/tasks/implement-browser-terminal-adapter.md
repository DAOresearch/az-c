# Task: Implement Browser-Based Terminal Screenshot Adapter

## Context

You are working on an AI-evaluated terminal screenshot testing framework for React components. Currently, terminal screenshots are captured using macOS Terminal.app via AppleScript, which only works on macOS and requires system permissions.

**Your mission**: Implement a cross-platform browser-based terminal adapter using headless browser automation to replace platform-specific screenshot capture.

## Current Architecture

### Adapter Pattern
The codebase uses an adapter pattern for terminal capture:

```
src/testing/capture/
├── adapters/
│   ├── types.ts          # Interface definition
│   ├── macos.ts          # Current implementation (AppleScript)
│   └── browser.ts        # YOUR TASK: Implement this stub
└── terminal.ts           # Facade that auto-selects adapter
```

### Interface Contract
Every adapter must implement `TerminalCaptureAdapter`:

```typescript
type TerminalCaptureAdapter = {
  capture(options: TerminalCaptureOptions): Promise<void>;
  isSupported(): boolean;
  getName(): string;
};

type TerminalCaptureOptions = {
  cmd: string;        // Command to run (e.g., "bun src/component.spec.tsx")
  out: string;        // Output path for screenshot
  width?: number;     // Window width (default: 900)
  height?: number;    // Window height (default: 600)
  settleMs?: number;  // Wait time before screenshot (default: 2500ms)
};
```

### How Adapters Are Selected
The `terminal.ts` facade tries adapters in order:
1. `MacOSTerminalAdapter` (checks `process.platform === "darwin"`)
2. `BrowserTerminalAdapter` ← **YOU ARE IMPLEMENTING THIS**

The first adapter where `isSupported()` returns `true` is used.

## Technical Approach

### Stack Choice: Playwright
Use **Playwright** (not Puppeteer) for these reasons:
- Better TypeScript support
- Built-in cross-browser testing
- More reliable wait mechanisms
- Better documentation
- Automatic browser installation

### Architecture Overview
```
BrowserTerminalAdapter
  ↓
Playwright (headless Chromium)
  ↓
HTML page with xterm.js
  ↓
node-pty (pseudo-terminal)
  ↓
Command execution + screenshot
```

### Required Dependencies
Add to `package.json` devDependencies:
```json
{
  "playwright": "^1.48.0",
  "@types/node": "^22.0.0",
  "xterm": "^5.5.0",
  "xterm-addon-fit": "^0.10.0",
  "node-pty": "^1.0.0"
}
```

## Implementation Requirements

### 1. HTML Terminal Template
Create: `src/testing/capture/adapters/terminal-template.html`

This file should:
- Load xterm.js and xterm-addon-fit from CDN
- Create a full-viewport terminal instance
- Expose `window.terminal` with methods:
  - `init(cols, rows)` - Initialize terminal
  - `write(data)` - Write data to terminal
  - `clear()` - Clear terminal
- Style the terminal with proper dark theme matching existing screenshots
- Use monospace font (e.g., "Monaco", "Menlo", "Courier New")

**Critical**: The terminal must be full-screen with no margins/padding to match native terminal appearance.

### 2. PTY Integration Module
Create: `src/testing/capture/adapters/pty-helper.ts`

This module should:
- Export a function: `runCommand(cmd: string): Promise<{ output: string; exitCode: number }>`
- Use `node-pty` to spawn a pseudo-terminal
- Capture all output (stdout + stderr)
- Handle command completion detection
- Support timeout (default: 30 seconds)
- Clean up PTY process properly

**Edge Cases**:
- Commands that don't exit (e.g., servers) - timeout required
- ANSI escape codes - preserve them for terminal rendering
- Large output - buffer efficiently
- Process cleanup on errors

### 3. BrowserTerminalAdapter Implementation
Update: `src/testing/capture/adapters/browser.ts`

#### Key Methods

**`isSupported(): boolean`**
- Return `true` (browser-based is always supported)
- No platform checks needed

**`getName(): string`**
- Return `"Browser Terminal (Playwright)"`

**`capture(options: TerminalCaptureOptions): Promise<void>`**
- Launch Playwright browser (chromium)
- Set viewport to `options.width` × `options.height`
- Load the HTML terminal template (use `file://` protocol)
- Execute command via PTY helper
- Stream output to browser terminal via `page.evaluate()`
- Wait for `settleMs` after command completes
- Take screenshot to `options.out`
- Close browser

#### Critical Implementation Details

**Browser Lifecycle**:
```typescript
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  // ... work ...
} finally {
  await browser.close(); // ALWAYS cleanup
}
```

**Streaming Output to Terminal**:
```typescript
// In PTY helper, emit events
ptyProcess.on('data', (data) => {
  await page.evaluate((text) => {
    window.terminal.write(text);
  }, data);
});
```

**Screenshot Timing**:
```typescript
// Wait for command to complete
await ptyHelper.waitForExit();

// Additional settle time for rendering
await page.waitForTimeout(options.settleMs || 2500);

// Capture
await page.screenshot({
  path: options.out,
  fullPage: false // Capture viewport only
});
```

### 4. Error Handling

**Required Error Handling**:
- Browser launch failures → throw descriptive error
- PTY spawn failures → throw descriptive error
- Command timeouts → include partial output in error
- Screenshot failures → throw with path info
- Template file not found → throw clear error

**Example**:
```typescript
try {
  await browser.launch();
} catch (error) {
  throw new Error(
    `Failed to launch Playwright browser: ${error.message}\n` +
    `Hint: Run 'bunx playwright install chromium'`
  );
}
```

### 5. Logging Integration
Use existing logger:
```typescript
import { logger } from "@/services/logger";

logger.info(`Capturing terminal: ${options.cmd}`);
logger.info(`Screenshot saved: ${options.out}`);
logger.error(`Failed to capture: ${error.message}`);
```

## Testing Requirements

### Unit Tests
Create: `src/testing/capture/adapters/browser.test.ts`

**Test cases**:
1. `isSupported()` returns true
2. `getName()` returns expected string
3. Simple command capture (e.g., `echo "hello"`)
4. Command with ANSI colors (e.g., `bun --version`)
5. Multi-line output
6. Command that exits with non-zero code
7. Screenshot file is created
8. Screenshot dimensions match options
9. Error handling for invalid commands
10. Browser cleanup on errors

### Integration Test
Create: `src/testing/capture/adapters/integration.test.ts`

**End-to-end test**:
- Capture screenshot of a real component spec
- Verify screenshot file exists
- Verify screenshot is valid PNG
- Compare file size (should be >10KB)
- Verify no hanging processes

### Manual Verification
After implementation:
1. Run: `bun test:capture`
2. Check `.dev/reports/screenshots/` for new screenshots
3. Verify screenshots look identical to macOS Terminal.app ones
4. Run on Linux/Windows if possible to verify cross-platform

## Code Style Requirements

### TypeScript Guidelines (from CLAUDE.md)
- Use `type` instead of `interface`
- Use constants instead of enums
- Prefer arrow functions
- Use async/await, not callbacks
- Explicit error handling with try/catch
- No `any` types - use `unknown` if needed

### Example Patterns
```typescript
// ✅ Good
type Config = {
  timeout: number;
};

export const DEFAULT_TIMEOUT = 30000;

const runCommand = async (cmd: string): Promise<string> => {
  try {
    return await ptyHelper.exec(cmd);
  } catch (error) {
    throw new Error(`Command failed: ${error.message}`);
  }
};

// ❌ Bad
interface Config {
  timeout: number;
}

enum Timeout {
  DEFAULT = 30000
}

function runCommand(cmd: string, callback: Function) {
  ptyHelper.exec(cmd, (err: any, result: any) => {
    callback(err, result);
  });
}
```

## Common Pitfalls to Avoid

### 1. Race Conditions
❌ **Wrong**: Taking screenshot before output renders
```typescript
await ptyProcess.execute();
await page.screenshot(); // Too fast!
```

✅ **Correct**: Wait for command completion + settle time
```typescript
await ptyProcess.waitForExit();
await page.waitForTimeout(settleMs);
await page.screenshot();
```

### 2. Resource Leaks
❌ **Wrong**: Not closing browser on errors
```typescript
const browser = await chromium.launch();
await doWork(); // Throws error
await browser.close(); // Never reached!
```

✅ **Correct**: Use try/finally
```typescript
const browser = await chromium.launch();
try {
  await doWork();
} finally {
  await browser.close();
}
```

### 3. Path Resolution
❌ **Wrong**: Relative paths break in different contexts
```typescript
const html = './terminal.html'; // Breaks!
```

✅ **Correct**: Use `import.meta.url` or `__dirname`
```typescript
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, 'terminal-template.html');
```

### 4. ANSI Code Handling
❌ **Wrong**: Stripping ANSI codes
```typescript
const clean = output.replace(/\x1b\[[0-9;]*m/g, ''); // Loses colors!
```

✅ **Correct**: Preserve ANSI codes for xterm.js
```typescript
// xterm.js handles ANSI codes automatically
terminal.write(rawOutput); // Keep ANSI codes
```

### 5. Terminal Sizing
❌ **Wrong**: Hardcoded terminal dimensions
```typescript
terminal.resize(80, 24); // Doesn't match screenshot!
```

✅ **Correct**: Calculate from viewport
```typescript
const cols = Math.floor(width / CHAR_WIDTH);
const rows = Math.floor(height / LINE_HEIGHT);
terminal.resize(cols, rows);
```

## Acceptance Criteria

### Must Have ✅
- [ ] `BrowserTerminalAdapter` implements `TerminalCaptureAdapter` interface
- [ ] `isSupported()` returns `true`
- [ ] `capture()` successfully executes commands and saves screenshots
- [ ] Screenshots match dimensions specified in options
- [ ] Commands with ANSI colors render correctly
- [ ] Multi-line output renders correctly
- [ ] Browser cleanup happens even on errors
- [ ] Error messages are descriptive and actionable
- [ ] All TypeScript compiles with no errors (`bun check`)
- [ ] No linting errors (`bun run lint`)
- [ ] Integration with existing test pipeline works
- [ ] Works on macOS (primary platform)

### Should Have 🎯
- [ ] Unit tests with >80% coverage
- [ ] Integration test passes
- [ ] PTY helper has proper timeout handling
- [ ] Command output is streamed (not buffered entirely)
- [ ] Screenshot quality matches macOS Terminal.app
- [ ] Performance comparable to macOS adapter (<10s per screenshot)

### Nice to Have 💎
- [ ] Works on Linux and Windows
- [ ] Configurable terminal theme
- [ ] Support for custom fonts
- [ ] Screenshot optimization (compression)
- [ ] Parallel screenshot capture support

## Success Verification Checklist

After implementation, verify:

1. **Installation**:
   ```bash
   bun install
   bunx playwright install chromium
   ```

2. **Type Check**:
   ```bash
   bun check
   # Should pass with no errors
   ```

3. **Run Tests**:
   ```bash
   bun test src/testing/capture/adapters/browser.test.ts
   # All tests should pass
   ```

4. **Integration Test**:
   ```bash
   bun test:capture
   # Should generate screenshots in .dev/reports/screenshots/
   ```

5. **Visual Inspection**:
   - Open generated screenshots
   - Compare with macOS Terminal.app screenshots
   - Verify text is sharp and readable
   - Verify colors match (dark background, light text)
   - Verify no artifacts or rendering glitches

6. **Adapter Selection**:
   - On macOS: should still use MacOSTerminalAdapter by default
   - Force browser adapter: temporarily make `MacOSTerminalAdapter.isSupported()` return `false`
   - Verify tests still pass with browser adapter

## Implementation Plan (Suggested Order)

### Phase 1: Setup (30 minutes)
1. Install dependencies (playwright, xterm, node-pty)
2. Create terminal-template.html with basic xterm.js setup
3. Test loading HTML in Playwright manually

### Phase 2: PTY Integration (1 hour)
1. Create pty-helper.ts
2. Implement basic command execution
3. Test with simple commands (echo, ls)
4. Add timeout handling
5. Add error handling

### Phase 3: Browser Adapter (2 hours)
1. Implement `isSupported()` and `getName()`
2. Implement browser launch and page setup
3. Load HTML template
4. Connect PTY output to terminal
5. Implement screenshot capture
6. Add proper cleanup

### Phase 4: Testing (1 hour)
1. Write unit tests
2. Write integration test
3. Fix any issues found
4. Manual verification

### Phase 5: Polish (30 minutes)
1. Add comprehensive error messages
2. Add logging
3. Update documentation
4. Final code review against requirements

**Total estimated time**: 5 hours

## Resources and References

### Documentation
- Playwright: https://playwright.dev/docs/api/class-playwright
- xterm.js: https://xtermjs.org/docs/
- node-pty: https://github.com/microsoft/node-pty
- ANSI escape codes: https://en.wikipedia.org/wiki/ANSI_escape_code

### Example Code Patterns
Look at `src/testing/capture/adapters/macos.ts` for:
- How to structure the adapter class
- Error handling patterns
- Logging patterns
- Options handling

### Testing Patterns
Look at existing test files in `src/testing/` for:
- Test structure
- Assertion patterns
- Mock patterns

## Questions and Clarifications

If you encounter ambiguity:

1. **Terminal appearance**: Match existing macOS screenshots exactly
2. **Performance**: Prioritize reliability over speed (5-10s per screenshot is fine)
3. **Cross-platform**: Focus on macOS first, Linux/Windows as bonus
4. **Fonts**: Use system monospace fonts (Monaco, Menlo, Consolas)
5. **Colors**: Match xterm.js default dark theme
6. **Edge cases**: Fail fast with clear errors rather than producing bad screenshots

## Final Notes

- **Autonomy**: You have full autonomy to make implementation decisions within these requirements
- **Best Practices**: Follow TypeScript and React best practices from CLAUDE.md
- **Code Quality**: Prioritize readability and maintainability over cleverness
- **Testing**: Write tests that would catch regressions
- **Documentation**: Add JSDoc comments to exported functions
- **Commit Messages**: Use conventional commits (e.g., "feat: implement browser terminal adapter")

**When you're done**: Run `bun check && bun test` and verify all checks pass before submitting.

Good luck! 🚀
