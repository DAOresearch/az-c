# AgentSpinner Component

## Purpose
Displays agent activity status with animated spinner, quirky adjective, and token usage indicator. Features smooth animations for token count updates and progress bar filling to provide engaging feedback during AI operations.

## Visual Reference
See `context/active/component_screenshots/levitating-spinner-status.png` for the production design reference.

## Props

```typescript
export type AgentSpinnerProps = {
  tokensUsed?: number;    // Current token count (animates smoothly on update)
  tokensMax?: number;     // Maximum token limit (typically 200k)
}
```

## Visual Layout

```
⠋ vibing.........  [████████░░░░░░░░░░░░]  10.2k/200k tokens (5%)
│  │                │                        │
│  │                │                        └─ Token info (right-aligned)
│  │                └─ Progress bar (20 chars, color-coded)
│  └─ Adjective (16 chars, padded with dots)
└─ Spinner (2 chars: animated braille + space)
```

## States

### 1. No Token Data (Fallback)
- Shows only spinner + adjective
- No progress bar or token counts
- Used when `tokensUsed` or `tokensMax` is undefined

### 2. Low Usage (<50%)
- **Green** progress bar (`#50C878`)
- Example: `10.2k/200k tokens (5%)`
- Indicates healthy token budget

### 3. Medium Usage (50-80%)
- **Yellow/Orange** progress bar (`#E07A5F`)
- Example: `140k/200k tokens (70%)`
- Warning: approaching limits

### 4. High Usage (>80%)
- **Red** progress bar (`#E74C3C`)
- Example: `180k/200k tokens (90%)`
- Critical: near token limit

## Animation Behavior

### Spinner Animation
- Uses **cli-spinners** library (`dots` pattern)
- 10 braille characters: `⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏`
- Rotates every 80ms via `setInterval`
- Continuous loop

### Token Counter Animation
**Critical**: When tokens update (e.g., 10.2k → 15.7k), the counter must **animate smoothly** upward, not jump in chunks.

**Data Flow:**
1. Parent component updates `tokensUsed` prop (new message arrives)
2. `useEffect` detects prop change
3. Animation starts from `displayedTokens` (old value) → `tokensUsed` (new value)
4. User sees smooth counting: `10.2k → 10.5k → 11.0k → ... → 15.7k`

**Implementation:** Use `useTimeline` from OpenTUI
- Duration: 400ms per update
- Easing: `"easeOutQuad"` for natural deceleration
- Internal state (`displayedTokens`) animates while prop (`tokensUsed`) changes instantly

### Progress Bar Animation
**Critical**: Bar must **fill smoothly** when percentage changes, not snap to new position.

**Implementation:** Use `useTimeline` for width animation
- **Synchronized** with token counter animation (same timeline)
- Duration: 400ms (matches counter)
- Easing: `"easeOutQuad"` (matches counter)
- Bar fills from left to right
- Color transitions happen instantly at threshold boundaries (50%, 80%)

### Adjective Display
- Selected randomly on component mount from 20 quirky options
- Padded to **exactly 16 characters** with dots (`...`)
- Fixed width prevents layout shifting
- Examples:
  - `"vibing........."`
  - `"percolating...."`
  - `"pontificating.."`

## Quirky Adjectives List

The component randomly selects from these 20 whimsical verbs:

1. vibing
2. percolating
3. pontificating
4. ruminating
5. cogitating
6. marinating
7. noodling
8. tinkering
9. brewing
10. simmering
11. fermenting
12. gestating
13. incubating
14. mulling
15. contemplating
16. deliberating
17. musing
18. pondering
19. surfing
20. hussalin

## Design Rationale (SOLID Principles)

### Single Responsibility Principle
AgentSpinner has ONE job: display agent status with smooth visual feedback. It doesn't manage token state or trigger actions.

### Open/Closed Principle
- **Open for extension**: Token thresholds and colors can be configured
- **Closed for modification**: Core animation and layout logic remains unchanged

### Interface Segregation
Minimal required props - both are optional, component gracefully handles missing data with fallback state.

### Dependency Inversion
Component depends on prop type abstractions (`AgentSpinnerProps`), not concrete token management implementations.

## Atomic Design Classification
**MOLECULE** - Combines atomic primitives:
- `<text>` elements for spinner, adjective, bar, and token info
- Animation hooks from OpenTUI (`useTimeline`)
- Layout controlled via fixed-width text formatting

## Implementation Notes

### Fixed-Width Columns
All elements use fixed character widths to prevent layout shifts:
- **Spinner**: 2 chars (braille + space)
- **Adjective**: 16 chars (padded with dots)
- **Progress Bar**: 22 chars (`[` + 20 fill chars + `]`)
- **Token Info**: Variable, right-aligned

### Token Formatting
- Under 1k: Show as integer (e.g., `856 tokens`)
- Over 1k: Show with one decimal and `k` suffix (e.g., `15.7k`)
- Format: `{used}k/{max}k tokens ({percentage}%)`

### Progress Bar Characters
- **Filled**: `█` (U+2588 Full Block)
- **Empty**: `░` (U+2591 Light Shade)
- **Width**: 20 characters (allows 5% granularity)

### Color Thresholds
```typescript
const getBarColor = (percentage: number): string => {
  if (percentage > 80) return "#E74C3C";  // Red
  if (percentage > 50) return "#E07A5F";  // Orange
  return "#50C878";                        // Green
};
```

### Animation Library Integration

**Use `useTimeline` from OpenTUI to synchronize token counter and progress bar animations.**

```typescript
import { useTimeline } from "@opentui/react";

export const AgentSpinner = ({ tokensUsed, tokensMax }: AgentSpinnerProps) => {
  // Internal state - what we DISPLAY (animates smoothly)
  const [displayedTokens, setDisplayedTokens] = useState(tokensUsed ?? 0);
  const [displayedBarWidth, setDisplayedBarWidth] = useState(0);

  // Timeline for synchronized animations
  const timeline = useTimeline({ duration: 400, loop: false });

  // Watch for prop changes
  useEffect(() => {
    if (!tokensUsed || !tokensMax) return;

    const newPercentage = (tokensUsed / tokensMax) * 100;
    const newBarWidth = (newPercentage / 100) * 20; // 20 chars max

    // Clear existing animations
    timeline.clear();

    // Animate BOTH tokens and bar together (synchronized!)
    timeline.add(
      { tokens: displayedTokens, barWidth: displayedBarWidth },
      {
        tokens: tokensUsed,
        barWidth: newBarWidth,
        duration: 400,
        ease: "easeOutQuad",
        onUpdate: (values) => {
          const { tokens, barWidth } = values.targets[0];
          setDisplayedTokens(Math.round(tokens));
          setDisplayedBarWidth(barWidth);
        },
      },
      0 // Start immediately
    );
  }, [tokensUsed, tokensMax]);

  // Render displayedTokens and displayedBarWidth (NOT the props directly)
  return (
    <text>
      {spinners[spinnerIndex]} {adjective} [{renderBar(displayedBarWidth)}] {formatTokens(displayedTokens, tokensMax)}
    </text>
  );
};
```

**Key Benefits:**
- ✅ Both animations perfectly synchronized (same duration, easing, timing)
- ✅ Automatic cleanup when component unmounts
- ✅ Handles interruptions gracefully (`timeline.clear()` if new update arrives mid-animation)
- ✅ Built-in easing functions (`easeOutQuad`) for polished feel

## Test Scenarios

1. **low-usage**: 5% usage (10.2k/200k) - Green bar
2. **medium-usage**: 50% usage (100k/200k) - Green bar
3. **high-usage-warning**: 70% usage (140k/200k) - Orange bar
4. **very-high-usage**: 90% usage (180k/200k) - Red bar
5. **near-limit**: 98% usage (196k/200k) - Red bar
6. **no-token-data**: Fallback state (no bar)

## Usage Example

```tsx
import { AgentSpinner } from "@/components/agent-spinner";

function AgentStatus({ session }) {
  return (
    <box>
      <AgentSpinner
        tokensUsed={session.tokensUsed}
        tokensMax={200000}
      />
    </box>
  );
}
```

## Manual QA Steps

1. **Test Spinner Animation**
   - Verify braille characters rotate smoothly
   - Confirm 80ms timing feels natural
   - Check continuous loop never stops

2. **Test Adjective Display**
   - Verify random selection on mount
   - Confirm exactly 16 characters wide
   - Check padding dots appear correctly

3. **Test Token Counter Animation**
   - Update `tokensUsed` prop (e.g., 10k → 50k)
   - **Verify smooth counting upward** (not chunky jumps)
   - Confirm ~400ms animation duration
   - Check formatting (decimals, k suffix)

4. **Test Progress Bar Animation**
   - Update tokens to change percentage
   - **Verify bar fills smoothly** (not snaps)
   - Confirm synchronized with counter
   - Check color changes at thresholds (50%, 80%)

5. **Test Color Thresholds**
   - Set tokens to 40k/200k → Green
   - Set tokens to 120k/200k → Orange
   - Set tokens to 180k/200k → Red
   - Verify immediate color updates

6. **Test Fallback State**
   - Set `tokensUsed={undefined}`
   - Verify only spinner + adjective shown
   - Confirm no errors or layout breaks

## Test Results

Status: ⏳ **Tests not yet run**

Run tests:
```bash
bun test:capture
```

## Known Limitations

1. Adjective is selected randomly on mount - doesn't change during component lifetime
2. Animation performance may vary on slower terminals
3. Fixed 200k token assumption - not configurable per session
4. Progress bar granularity limited to 5% increments (20 characters)

## Future Enhancements

- [ ] Configurable token max (not hardcoded 200k)
- [ ] Elapsed time display (e.g., "130s" like in screenshot)
- [ ] Interrupt hint display (e.g., "esc to interrupt")
- [ ] Pause/resume animation controls
- [ ] Custom adjective lists per context
- [ ] Accessibility: Screen reader announcements for milestone percentages
- [ ] Performance: Throttle animation updates for very frequent token changes
- [ ] Theme support: Light mode color variants
