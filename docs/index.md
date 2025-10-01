---
layout: home

hero:
  name: "az-c"
  text: "Hackable Claude Code Client"
  tagline: A Terminal User Interface (TUI) for Claude Code that prioritizes hackability, testing, and automation
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: What is az-c?
      link: /application/
    - theme: alt
      text: View on GitHub
      link: https://github.com/DAOresearch/az-c

features:
  - icon: 🎨
    title: Rich Terminal UI
    details: Beautiful TUI with ASCII art, streaming support, and real-time tool use display built with OpenTUI

  - icon: 🧪
    title: Custom Testing Infrastructure
    details: Purpose-built testing system for TUI components with screenshot testing and AI-powered evaluation

  - icon: 🤖
    title: Claude Code Harness
    details: Programmatic API for automating Claude Code interactions and building advanced workflows

  - icon: 🎯
    title: Hackable & Extensible
    details: Clean architecture with documented patterns, making it easy to customize and extend

  - icon: 📊
    title: Token Tracking
    details: Built-in usage monitoring with cost tracking and session management

  - icon: ⚡
    title: Fast Development
    details: Hot module reloading, TypeScript, and modern tooling powered by Bun
---

## Quick Start

```bash
# Install dependencies
bun install

# Start the TUI
bun run dev
```

## What Makes az-c Special?

**az-c** is not just another Claude Code client - it's a **hackable platform** for building intelligent terminal applications. Built with modern tools and comprehensive testing infrastructure, it demonstrates how to:

- Build complex TUI applications with OpenTUI and React
- Test visual terminal applications with screenshot testing
- Automate AI workflows with a programmatic harness
- Maintain code quality with TypeScript, Biome, and Ultracite

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    az-c Architecture                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  TUI Layer (OpenTUI + React)                            │
│  ├─ Components (Banner, Chat, Input, Spinner)          │
│  └─ Hooks (StreamingInput, TokenUsage, TimeLine)       │
│                                                          │
│  Application Layer                                       │
│  ├─ AgentService (Claude Agent SDK)                    │
│  └─ Message Processing & State Management              │
│                                                          │
│  Testing Infrastructure                                  │
│  ├─ Screenshot Capture (Playwright + node-pty)         │
│  ├─ AI Evaluation (Claude API)                         │
│  └─ Report Generation (HTML Reports)                   │
│                                                          │
│  Harness Layer (Programmatic API)                       │
│  └─ Automated Testing & Workflow Automation            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Features in Detail

### 🎨 Terminal UI

- Rich ASCII art header with session information
- Streaming message display with syntax highlighting
- Real-time tool execution visualization
- Keyboard-driven navigation (Tab, Enter, Esc)
- Token usage and cost tracking in status bar

### 🧪 Testing Infrastructure

Our custom testing system is designed specifically for TUI applications:

- **Screenshot Capture**: Automated visual testing using Playwright and node-pty
- **AI Evaluation**: Claude analyzes screenshots against expectations
- **Confidence Scoring**: Get detailed feedback on visual compliance
- **Historical Tracking**: Keep versioned test results for regression detection

### 🤖 Harness

The Claude Code harness provides a programmatic interface for:

- Automated testing of agent interactions
- Building complex workflows and automation
- Integration testing with real Claude API
- Custom agent behavior implementation

## Next Steps

<div class="vp-doc">

- **[Getting Started](/guide/getting-started)** - Install and run az-c in minutes
- **[Application Guide](/application/)** - Understand the architecture and design
- **[Testing Infrastructure](/testing/)** - Learn about our custom testing system
- **[Harness Documentation](/harness/)** - Use the programmatic API
- **[Slash Commands](/commands/)** - Discover powerful automation commands

</div>
