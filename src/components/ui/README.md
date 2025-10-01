# InputField Component

## Purpose
Terminal-style text input component with horizontal-only borders, designed for CLI/TUI applications. Features a clean, minimal design that facilitates easy text selection and copy/paste operations by avoiding vertical borders.

## Visual Reference
See `context/active/component_screenshots/user-input-command.png` for the production design reference.

## Props

```typescript
export type InputFieldProps = {
  value?: string;           // Current input value (controlled)
  placeholder?: string;      // Placeholder text when empty
  onChange?: (value: string) => void;  // Called on input change
  onSubmit?: (value: string) => void;  // Called on Enter key
  disabled?: boolean;        // Disabled state
  focused?: boolean;         // Focus state (for border color)
  error?: string;           // Error message to display
}
```

## States

### 1. Idle State (default)
- Gray borders (`#3A3D45`)
- `>` prompt in gray
- Placeholder text in gray when empty

### 2. Focused State
- Blue borders (`#4A90E2`)
- Same `>` prompt
- Active cursor position

### 3. Disabled State
- Darker gray borders (`#666666`)
- `x` prefix instead of `>`
- Shows "Processing..." text
- No user interaction

### 4. Error State
- Red borders (`#E74C3C`)
- Error message displayed below
- `!` prefix on error text

### 5. With Text
- Shows user-entered text in white
- Placeholder hidden
- Normal gray borders when not focused

## Design Rationale (SOLID Principles)

### Single Responsibility Principle
InputField has ONE job: handle text input and display. It doesn't validate, fetch data, or manage complex state.

### Open/Closed Principle
- **Open for extension**: Via props (placeholder, error, disabled states)
- **Closed for modification**: Core behavior remains unchanged

### Interface Segregation
Minimal required props - all props are optional except the core functionality (onChange/onSubmit).

### Dependency Inversion
Component depends on prop type abstractions (`InputFieldProps`), not concrete implementations.

## Atomic Design Classification
**MOLECULE** - Combines atomic OpenTUI primitives:
- `<box>` for layout container
- `<text>` for borders and display
- `<input>` for actual input handling (hidden)

## Implementation Notes

### Why Text Display Instead of Native Input?
The component displays text elements rather than relying solely on the native `<input>` because:
1. Better control over placeholder styling
2. Consistent rendering across terminal environments
3. Precise visual feedback for different states
4. The actual `<input>` is hidden but still captures keyboard input

### Border Characters
Uses Unicode box-drawing character `─` (U+2500) for horizontal lines, providing clean, consistent borders across terminals.

### Color Tokens
All colors are defined as constants following the design system:
```typescript
const COLORS = {
  border: {
    focus: "#4A90E2",
    muted: "#3A3D45",
    disabled: "#666666",
    error: "#E74C3C",
  },
  text: {
    primary: "#FFFFFF",
    muted: "#999999",
  },
  bg: {
    surface: "#1A1D23",
  },
};
```

## Test Scenarios

1. **idle-state**: Default appearance with placeholder
2. **focused-state**: Blue borders when focused
3. **with-text**: Display of user-entered text
4. **disabled-state**: Non-interactive processing state
5. **error-state**: Error message display

## Usage Example

```tsx
import { InputField } from "@/components/ui/InputField";

function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSubmit = (value: string) => {
    console.log("Sending:", value);
    setMessage(""); // Clear after send
  };

  return (
    <InputField
      value={message}
      placeholder="Type a message..."
      onChange={setMessage}
      onSubmit={handleSubmit}
      focused={true}
    />
  );
}
```

## Manual QA Steps

1. **Test Focus State**
   - Tab to component or click on it
   - Verify borders turn blue (#4A90E2)
   - Confirm cursor appears

2. **Test Text Input**
   - Type text
   - Verify placeholder disappears
   - Confirm text appears in white

3. **Test Submit**
   - Press Enter with text
   - Verify onSubmit fires
   - Confirm field clears (if configured)

4. **Test Disabled State**
   - Set `disabled={true}`
   - Verify `x` prefix appears
   - Confirm no input accepted

5. **Test Error Display**
   - Set `error="Invalid input"`
   - Verify red borders
   - Confirm error message below

## Test Results

Last test run: 2025-09-30 23:29:09
- **Pass rate: 100% (6/6 tests passing)**
- **Average AI confidence: 92.5%**
- All scenarios passing with >90% confidence:
  - idle-state: ✅ 92% confidence
  - focused-state: ✅ 92% confidence
  - with-text: ✅ 92% confidence
  - disabled-state: ✅ 92% confidence
  - error-state: ✅ 92% confidence
- See `.dev/reports/` for detailed results

## Known Limitations

1. The actual `<input>` element is hidden - this may affect some accessibility tools
2. Copy/paste operations work best when the component is focused
3. Terminal width affects border display (fixed at 50 characters)

## Future Enhancements

- [ ] Variable border width based on terminal size
- [ ] Support for input masks (e.g., password)
- [ ] Multiline input variant
- [ ] Auto-complete suggestions