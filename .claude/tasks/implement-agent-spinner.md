# Task: Implement AgentSpinner Component with Smooth Animations

## Context

You are implementing a terminal UI spinner component that displays agent activity with:
- Animated braille spinner
- Random quirky adjective
- Token usage counter (smoothly animated)
- Progress bar (smoothly animated, color-coded)

**Current State:** Component structure exists but needs full implementation following SOLID principles and atomic design patterns.

## Files Structure

```
src/components/agent-spinner/
├── index.tsx                    # Component implementation (NEEDS WORK)
├── agent-spinner.setup.ts       # ✅ Test scenarios defined (6 scenarios)
├── agent-spinner.spec.tsx       # ✅ Test spec ready
└── README.md                    # ✅ Complete specification
```

## Critical Requirements

### 1. SOLID Principles

**Single Responsibility:**
- Component has ONE job: Display agent status with smooth visual feedback
- Does NOT manage token state
- Does NOT trigger actions or side effects
- Pure presentation component

**Open/Closed:**
- Open for extension via props (`tokensUsed`, `tokensMax`)
- Closed for modification (core animation logic unchanged)
- Color thresholds configurable via constants

**Interface Segregation:**
- Minimal props interface (both optional)
- No unnecessary dependencies
- Clean prop contract

**Dependency Inversion:**
- Depends on prop types, not concrete implementations
- Uses OpenTUI abstractions (`useTimeline`, `<text>`)

### 2. Atomic Design

**Classification: MOLECULE**

Combines these ATOMS:
- `<text>` element for rendering
- `useTimeline` hook for animations
- `useState` for internal state
- `useEffect` for prop watching

**Composition Pattern:**
```
AgentSpinner (MOLECULE)
├── Spinner animation (ATOM: interval-based)
├── Adjective display (ATOM: static text)
├── Progress bar (ATOM: animated width)
└── Token counter (ATOM: animated number)
```

## Implementation Requirements

### Props Interface

```typescript
export type AgentSpinnerProps = {
  tokensUsed?: number;    // Current tokens (triggers animation when changed)
  tokensMax?: number;     // Maximum tokens (typically 200k)
};
```

### Visual Layout (Fixed-Width Columns)

```
⠋ vibing.........  [████████░░░░░░░░░░░░]  10.2k/200k tokens (5%)
│  │                │                        │
│  └─ 16 chars      └─ 22 chars              └─ Variable (right-aligned)
└─ 2 chars
```

### Animation Requirements

**CRITICAL: Smooth Animations**

When `tokensUsed` prop changes (new message arrives), the component must:

1. **NOT** jump from old → new value
2. **MUST** animate smoothly over 400ms
3. **MUST** synchronize token counter and progress bar animations

**Implementation Pattern:**

```typescript
// Internal state - what we DISPLAY
const [displayedTokens, setDisplayedTokens] = useState(tokensUsed ?? 0);
const [displayedBarWidth, setDisplayedBarWidth] = useState(0);

// Timeline for synchronized animations
const timeline = useTimeline({ duration: 400, loop: false });

// Watch for prop changes
useEffect(() => {
  if (!tokensUsed || !tokensMax) return;

  // Calculate new values
  const newPercentage = (tokensUsed / tokensMax) * 100;
  const newBarWidth = (newPercentage / 100) * 20; // 20 chars

  // Clear any existing animations
  timeline.clear();

  // Animate BOTH values together (synchronized!)
  timeline.add(
    { tokens: displayedTokens, barWidth: displayedBarWidth },
    {
      tokens: tokensUsed,
      barWidth: newBarWidth,
      duration: 400,
      ease: "easeOutQuad",
      onUpdate: (values) => {
        setDisplayedTokens(Math.round(values.targets[0].tokens));
        setDisplayedBarWidth(values.targets[0].barWidth);
      },
    },
    0
  );
}, [tokensUsed, tokensMax]);
```

### Spinner Animation

Use **simple setInterval** (not useTimeline):

```typescript
const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const [spinnerIndex, setSpinnerIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setSpinnerIndex(prev => (prev + 1) % spinners.length);
  }, 80);
  return () => clearInterval(interval);
}, []);
```

### Adjective Selection

20 quirky adjectives, randomly selected on mount:

```typescript
const adjectives = [
  "vibing", "percolating", "pontificating", "ruminating",
  "cogitating", "marinating", "noodling", "tinkering",
  "brewing", "simmering", "fermenting", "gestating",
  "incubating", "mulling", "contemplating", "deliberating",
  "musing", "pondering", "surfing", "hussalin"
];

const [adjective] = useState(() => {
  const randomIndex = Math.floor(Math.random() * adjectives.length);
  return adjectives[randomIndex];
});

// Pad to exactly 16 characters
const paddedAdjective = adjective.padEnd(16, '.');
```

### Progress Bar Rendering

```typescript
const renderBar = (width: number): string => {
  const filled = Math.round(width); // 0-20
  const empty = 20 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
};

const getBarColor = (percentage: number): string => {
  if (percentage > 80) return "#E74C3C";  // Red
  if (percentage > 50) return "#E07A5F";  // Orange
  return "#50C878";                        // Green
};
```

### Token Formatting

```typescript
const formatTokens = (used: number, max: number): string => {
  const formatNumber = (n: number): string => {
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'k';
    }
    return n.toString();
  };

  const percentage = Math.round((used / max) * 100);
  return `${formatNumber(used)}/${formatNumber(max)} tokens (${percentage}%)`;
};
```

### Fallback State

When `tokensUsed` or `tokensMax` is undefined:

```typescript
if (!tokensUsed || !tokensMax) {
  return (
    <text content={`${spinners[spinnerIndex]} ${paddedAdjective}`} />
  );
}
```

## Test Scenarios (from agent-spinner.setup.ts)

1. **low-usage**: 10.2k/200k (5%) - Green bar
2. **medium-usage**: 100k/200k (50%) - Green bar
3. **high-usage-warning**: 140k/200k (70%) - Orange bar
4. **very-high-usage**: 180k/200k (90%) - Red bar
5. **near-limit**: 196k/200k (98%) - Red bar
6. **no-token-data**: Fallback (no bar)

## Implementation Checklist

- [ ] Import `useTimeline` from `@opentui/react`
- [ ] Define `AgentSpinnerProps` type (already exists)
- [ ] Create internal state: `displayedTokens`, `displayedBarWidth`, `spinnerIndex`, `adjective`
- [ ] Implement spinner animation (setInterval, 80ms)
- [ ] Implement token counter animation (useTimeline, 400ms, easeOutQuad)
- [ ] Implement progress bar animation (synchronized with counter)
- [ ] Implement fallback state (no token data)
- [ ] Implement fixed-width layout (2 + 16 + 22 + variable)
- [ ] Implement color-coded progress bar (green/orange/red thresholds)
- [ ] Implement token formatting (k suffix, decimals)
- [ ] Test with `bun test:capture`
- [ ] Verify smooth animations (not chunky)
- [ ] Verify synchronization (counter + bar move together)

## Code Quality Standards

### TypeScript
- No `any` types
- Explicit return types for helper functions
- Proper prop destructuring with types

### React
- Use `useCallback` for memoized helpers if needed
- Proper cleanup in `useEffect` (return cleanup functions)
- No unnecessary re-renders (check dependencies)

### OpenTUI
- Single `<text>` element for entire output
- Use `content` prop with template string
- Apply color via `fg` prop dynamically

## Success Criteria

### Functional
- ✅ Spinner rotates continuously
- ✅ Random adjective selected on mount
- ✅ Token counter animates smoothly when prop changes
- ✅ Progress bar fills smoothly (synchronized with counter)
- ✅ Colors change at thresholds (50%, 80%)
- ✅ Fallback state works (no crashes when no data)

### Visual
- ✅ Fixed-width layout (no shifting)
- ✅ Smooth animations (400ms duration)
- ✅ Proper color coding (green/orange/red)
- ✅ Token formatting correct (k suffix, decimals)

### Code Quality
- ✅ SOLID principles followed
- ✅ Atomic design pattern clear
- ✅ No TypeScript errors (`bun check`)
- ✅ No linting errors
- ✅ Proper cleanup (no memory leaks)

## Testing

Run tests:
```bash
bun test:capture
```

Verify:
1. All 6 scenarios render correctly
2. Animations are smooth (not chunky)
3. Bar and counter synchronized
4. Colors match expectations
5. Fixed-width layout maintained

## Reference Materials

- **README**: `src/components/agent-spinner/README.md` (complete spec)
- **Animation example**: `context/open-tui/animation.md` (useTimeline usage)
- **Counter example**: `context/open-tui/counter.md` (simple interval)
- **InputField example**: `src/components/ui/InputField.tsx` (similar component)

## Common Pitfalls

**❌ Don't:**
- Use `tokensUsed` prop directly in render (won't animate)
- Create new timeline on every render (memory leak)
- Forget to clear timeline before new animation
- Hard-code 200k max tokens in logic (use prop)
- Use different durations for counter and bar (unsynchronized)

**✅ Do:**
- Use internal state (`displayedTokens`) for rendering
- Create timeline once, reuse via `timeline.clear()`
- Synchronize animations with single `timeline.add()` call
- Calculate values dynamically from props
- Use same duration and easing for both animations

## Final Notes

This component demonstrates **composition over inheritance** (atomic design) and **separation of concerns** (SOLID). The animation logic is isolated, the presentation is declarative, and the component has a single, clear responsibility.

When done, commit with message:
```
feat: implement AgentSpinner with smooth synchronized animations

- Animated token counter using useTimeline
- Synchronized progress bar animation
- Color-coded thresholds (green/orange/red)
- Fixed-width layout prevents shifting
- Fallback state for missing data
- Random quirky adjective on mount
- 20 quirky adjectives list
- SOLID principles followed
- Atomic design pattern (molecule)

All 6 test scenarios passing
```

Good luck! 🚀
