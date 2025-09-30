# Component Visual Testing Architecture

## Overview

This project uses a visual regression testing system for React components rendered in the terminal using OpenTUI. Each component can define multiple scenarios that are automatically rendered and captured as screenshots.

## Component Structure

Each testable component follows this structure:

```
src/components/[component-name]/
├── index.tsx           # Component implementation
├── [name].setup.ts     # Scenario configuration
├── [name].spec.tsx     # Test harness entry point
└── README.md          # Component documentation
```

## File Responsibilities

### Setup File (`*.setup.ts`)

Defines all test scenarios for a component. Each scenario includes:

```typescript
const config = {
  scenarios: [
    {
      scenarioName: string,    // Unique name for the scenario
      description: string,     // What the scenario demonstrates
      expectation: string,     // What should be visible in the screenshot
      params: Record<string, unknown>  // Props to pass to the component
    }
  ]
} as const;
```

**Export Requirements:**
- Default export: The config object
- Type export: `Scenario` type for type safety

### Spec File (`*.spec.tsx`)

Entry point for rendering a specific scenario. The spec file:

1. Imports the component and setup config
2. Reads `SCENARIO_INDEX` from environment variables
3. Renders the component with the selected scenario's params
4. Keeps the process alive for screenshot capture

```typescript
import { runHarness } from "@/testing/componentHarness";
import { Component } from ".";
import config from "./component.setup";

const scenarioIndex = parseInt(process.env.SCENARIO_INDEX || "0");
const scenario = config.scenarios[scenarioIndex];

if (!scenario) {
  console.error(`No scenario at index ${scenarioIndex}`);
  process.exit(1);
}

runHarness({
  scenarioName: scenario.scenarioName,
  description: scenario.description,
  render: () => <Component {...scenario.params} />
});
```

## Test Runner Flow

The test runner (`src/testing/visualTestRunner.ts`) orchestrates the entire testing process:

1. **Discovery Phase**
   - Scans `src/components/**/*.setup.ts` files
   - Imports each setup to get scenario configurations

2. **Execution Phase**
   - For each component and scenario:
     - Sets `SCENARIO_INDEX` environment variable
     - Spawns a new Terminal window running the spec file
     - Waits for component to render
     - Captures screenshot using `screencapture`
     - Closes the Terminal window

3. **Output**
   - Screenshots saved to `screenshots/[component]-[scenario-name].png`
   - Console output shows progress and results

## Running Tests

### Single Component
```bash
SCENARIO_INDEX=0 bun src/components/banner/banner.spec.tsx
```

### All Components (via runner)
```bash
bun src/testing/visualTestRunner.ts
```

### Specific Component Pattern
```bash
bun src/testing/visualTestRunner.ts --pattern "banner/**"
```

## Adding a New Component Test

1. Create the component folder structure
2. Define scenarios in `[name].setup.ts`:
   ```typescript
   const config = {
     scenarios: [
       {
         scenarioName: "default",
         description: "Component in default state",
         expectation: "Shows default message",
         params: { message: "Hello World" }
       },
       {
         scenarioName: "error-state",
         description: "Component showing error",
         expectation: "Red text with error icon",
         params: { message: "Error!", isError: true }
       }
     ]
   } as const;

   export default config;
   ```

3. Create `[name].spec.tsx` following the pattern above
4. Run the test runner to generate screenshots

## Environment Variables

- `SCENARIO_INDEX`: Zero-based index of scenario to render (default: "0")
- `SCREENSHOT_DELAY`: Milliseconds to wait before capture (default: 2000)
- `TERMINAL_WIDTH`: Width of terminal window in pixels (default: 900)
- `TERMINAL_HEIGHT`: Height of terminal window in pixels (default: 600)

## Technical Details

### Screenshot Mechanism
Uses macOS native tools:
- `osascript` to control Terminal.app
- `screencapture` to capture window contents
- Requires Screen Recording and Accessibility permissions

### Component Harness
The `runHarness` function:
- Renders the React component using OpenTUI
- Logs scenario information for debugging
- Keeps the process alive with `setInterval`

### Type Safety
- Setup files export const assertions for literal types
- Spec files can derive types from setup configs
- Runner validates scenario existence at runtime

## Troubleshooting

### "No scenario at index X"
The `SCENARIO_INDEX` environment variable is set to a value that doesn't exist in the setup file.

### Screenshot not captured
- Check Screen Recording permission in System Settings
- Ensure Terminal.app has Accessibility permission
- Verify the component renders without errors

### Component doesn't render correctly
- Run the spec file directly to see console output
- Check that all required props are provided in setup
- Verify OpenTUI components are imported correctly

## Best Practices

1. **Meaningful Scenario Names**: Use descriptive names that explain the state being tested
2. **Complete Props**: Include all required props in scenario params
3. **Visual Expectations**: Document what should be visible in the `expectation` field
4. **Multiple Scenarios**: Test edge cases, error states, and different prop combinations
5. **Consistent Naming**: Follow the `[component].setup.ts` and `[component].spec.tsx` pattern

## Future Enhancements

- [ ] Visual diff comparisons with baseline images
- [ ] Parallel test execution for faster runs
- [ ] HTML report generation with all screenshots
- [ ] CI/CD integration for automated testing
- [ ] Cross-platform support beyond macOS