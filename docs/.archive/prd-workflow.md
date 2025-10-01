# PRD Workflow System

A complete system for planning, documenting, and implementing features using AI-generated Product Requirements Documents (PRDs).

---

## 🎯 Overview

The PRD workflow enables you to:
1. **Generate smart, adaptive PRDs** that scale to task complexity
2. **Track PRD status** through labeled GitHub issues
3. **Automate implementation** with Claude-powered workflows

---

## 📋 Workflow Steps

### 1. Generate PRD

#### **Option A: Local Generation** (Default)

```bash
/prd Add dark mode toggle
```

**Result:** PRD saved to `context/active/PRD-{topic}.md`

#### **Option B: GitHub Issue**

```bash
/prd Migrate Jest to Vitest --issue
```

**Result:**
- PRD saved to `context/active/PRD-{topic}.md`
- GitHub issue created with PRD content
- Issue labeled with `prd` and `prd:draft`

#### **Option C: Manual Issue Creation**

1. Create issue using PRD template
2. Fill in problem statement and context
3. Comment: `@claude generate prd`

**Result:**
- Claude generates adaptive PRD
- Saves to `context/active/PRD-{issue-number}-{topic}.md`
- Updates issue with PRD link
- Changes label to `prd:ready`

---

### 2. Review PRD

**Review the generated PRD:**
- Complexity tier appropriate? (Tier 1/2/3)
- All necessary sections included?
- Implementation phases make sense?
- Success criteria clear?

**If changes needed:**
- Edit PRD file directly in `context/active/`
- Update issue with changes
- Keep label as `prd:draft` until ready

**When ready:**
- Change label from `prd:draft` to `prd:ready`

---

### 3. Implement PRD

**On the PRD issue, comment:**

```
@claude implement
```

**What happens:**
1. ✅ Workflow creates implementation branch: `prd-{number}-{topic}`
2. ✅ Label changes to `prd:implementing`
3. ✅ Claude reads PRD from file or issue
4. ✅ Implements according to PRD phases
5. ✅ Tracks progress with TodoWrite
6. ✅ Runs tests after changes
7. ✅ Creates draft PR when complete
8. ✅ Links PR to issue

---

### 4. Review & Merge

1. **Review the draft PR**
2. **Request changes if needed**
3. **Mark PR ready when approved**
4. **Merge PR**
5. **Close issue** (label auto-updates to `prd:completed`)

---

## 🏷️ Label System & Automation Control

**CRITICAL:** Labels control when automation triggers. Understanding this is essential.

### **Label States**

| Label | Meaning | Automation | `@claude implement` |
|-------|---------|------------|---------------------|
| `prd` | Core identifier | Required base | Required (with prd:ready) |
| `prd:draft` | Planning/review | 🚫 **BLOCKED** | ❌ Will NOT work |
| `prd:ready` | Approved | ✅ **ENABLED** | ✅ WILL work |
| `prd:implementing` | In progress | ⚙️ **RUNNING** | Already running |
| `prd:completed` | Done | ✋ **FINISHED** | Not applicable |
| `prd:blocked` | Needs attention | ⏸️ **PAUSED** | Will not work |

### **The Approval Gate**

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│  prd:draft  │──────▶│ Human Review │──────▶│   prd:ready     │
│  (Created)  │       │  & Approve   │       │ (Auto-enabled)  │
└─────────────┘       └──────────────┘       └─────────────────┘
      ▲                                               │
      │                                               ▼
      │                                    ┌──────────────────────┐
      │                                    │ @claude implement    │
      │                                    │ NOW WORKS            │
      │                                    └──────────────────────┘
      │
      └── Cannot skip this step! Manual approval required.
```

### **Why This Matters**

**Safety:** Prevents accidental implementation of incomplete or incorrect PRDs.

**Examples:**

```bash
# ❌ This will NOT work:
# 1. Create issue with prd:draft
# 2. Comment: @claude implement
# Result: Workflow won't trigger (missing prd:ready)

# ✅ This WILL work:
# 1. Create issue with prd:draft
# 2. Review PRD
# 3. Change label to prd:ready
# 4. Comment: @claude implement
# Result: Workflow triggers successfully
```

### **Label Transitions (Who Changes What)**

| From | To | How | Who |
|------|-----|-----|-----|
| `prd:draft` | `prd:ready` | Manual label change | **You (Human)** |
| `prd:ready` | `prd:implementing` | Auto on `@claude implement` | **Workflow** |
| `prd:implementing` | `prd:completed` | Auto when PR merges | **Workflow** |
| Any | `prd:blocked` | Manual label add | **You (Human)** |
| `prd:blocked` | Previous state | Manual label remove | **You (Human)** |

### **Common Scenarios**

**Scenario 1: Standard Flow**
```
1. /prd Dark mode --issue
2. Issue created with prd:draft
3. You review PRD
4. You change to prd:ready  ← CRITICAL STEP
5. @claude implement
6. Auto-implements
```

**Scenario 2: Forgot to Change Label**
```
1. /prd Feature X --issue
2. Issue has prd:draft
3. @claude implement  ← Won't work!
4. Nothing happens
5. You realize: need prd:ready
6. Change label
7. @claude implement  ← Now works!
```

**Scenario 3: Need to Block**
```
1. Implementation running (prd:implementing)
2. You discover blocker
3. Add prd:blocked label
4. Automation pauses
5. Resolve blocker
6. Remove prd:blocked
7. Resume work
```

---

## 🎚️ Complexity Tiers

The `/prd` command automatically assesses complexity:

### **Tier 1: Simple** (200-400 lines)
- Single component or utility
- No dependencies
- Low risk
- **Example:** Add logout button

**Sections:** Executive Summary, Success Criteria, (optional: Implementation, Types)

---

### **Tier 2: Moderate** (400-800 lines)
- Multiple files (2-5)
- Some dependencies
- Medium risk
- **Example:** Dark mode toggle with persistence

**Sections:** Executive Summary, Current System, Architecture, Implementation Phases, Success Criteria, (conditional: DX Philosophy, Data Flow, Types, Risks, File Structure)

---

### **Tier 3: Complex** (800-1500+ lines)
- System-wide changes
- Many files (5+)
- High risk
- Breaking changes
- **Example:** Jest to Vitest migration

**Sections:** ALL 21 sections with full detail, multiple diagrams, complete appendices

---

## 🔧 Commands

### `/prd <topic>`
**Interactive mode** (default for local use)
- Presents tier assessment → waits for approval
- Generates PRD → shows summary → asks for confirmation
- Allows iterative refinement
- Saves only when you confirm
- **Use when:** You want to review and refine the PRD

### `/prd <topic> --auto`
**Non-interactive mode**
- Auto-generates and saves immediately
- No prompts or confirmations
- **Use when:** You trust the auto-generation or running in scripts

### `/prd <topic> --issue`
Generate PRD and create GitHub issue (interactive mode)
- All benefits of interactive mode
- Plus creates tracked GitHub issue
- Issue starts with `prd:draft` label

### `/prd <topic> --issue --auto`
Generate PRD and create issue automatically
- No interaction, auto-saves
- Creates issue with `prd:draft`
- **Use when:** Batch creating PRD issues

### `@claude generate prd`
Generate PRD from issue template (in issue comments)
- **Always non-interactive** (runs in CI/CD)
- Auto-generates and updates issue
- Changes label to `prd:ready`

### `@claude implement`
Implement PRD from issue (in issue comments)
- **Always non-interactive** (runs in CI/CD)
- Requires `prd` + `prd:ready` labels
- Creates branch and implements automatically

---

## 🎭 Interactive vs Non-Interactive Mode

### **Interactive Mode** (Default for Local Use)

**When it runs:**
- Local `/prd` command (without `--auto`)
- You want to review and refine

**Flow:**
```
1. You: /prd Add dark mode toggle
2. Claude: Assesses → "I think this is Tier 2. Correct?"
3. You: "Yes, but add a section on performance"
4. Claude: Generates with extra section
5. Claude: "PRD ready! ~600 lines. Satisfied?"
6. You: "Show me the implementation section"
7. Claude: [Shows section]
8. You: "Perfect, save it"
9. Claude: Saves to context/active/
```

**Benefits:**
- ✅ Review tier before generation
- ✅ Customize sections
- ✅ Refine iteratively
- ✅ Approve before saving
- ✅ Full control

---

### **Non-Interactive Mode** (Auto-Generate)

**When it runs:**
- Local `/prd` with `--auto` flag
- GitHub Actions workflows
- `@claude generate prd` in issues

**Flow:**
```
1. You: /prd Add dark mode toggle --auto
2. Claude: Assesses Tier 2 → generates → saves
3. Done! (no prompts)
```

**Benefits:**
- ⚡ Fast - no waiting
- 🤖 Automated - good for CI/CD
- 📦 Batch processing

---

### **Which Mode to Use?**

| Scenario | Mode | Command |
|----------|------|---------|
| First time creating PRD for feature | **Interactive** | `/prd <topic>` |
| You want to customize sections | **Interactive** | `/prd <topic>` |
| Quick PRD, trust auto-generation | **Non-Interactive** | `/prd <topic> --auto` |
| Batch creating multiple PRDs | **Non-Interactive** | `/prd <topic> --auto` |
| Creating from GitHub issue | **Non-Interactive** | `@claude generate prd` |
| Running in automation/scripts | **Non-Interactive** | Use `--auto` flag |

---

## 📁 File Structure

```
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── prd.md                          # PRD issue template
│   └── workflows/
│       ├── claude.yml                      # Handles @claude mentions (existing)
│       └── prd-implement.yml               # PRD implementation automation (new)
│
├── .claude/
│   └── commands/
│       └── prd.md                          # /prd slash command (improved)
│
├── context/
│   └── active/
│       ├── PRD-{topic}.md                  # Generated PRDs
│       └── PRD-{issue-number}-{topic}.md   # Issue-linked PRDs
│
└── docs/
    └── prd-workflow.md                     # This documentation
```

---

## 🎓 Examples

### Example 1: Simple Feature

```bash
# Generate PRD
/prd Add a logout button

# Review generated PRD (Tier 1, ~300 lines)
# Implement directly or create issue for tracking
```

**Result:** Concise PRD with core sections only

---

### Example 2: Moderate Feature with Issue Tracking

```bash
# Generate PRD and create issue
/prd Implement dark mode with theme persistence --issue

# Issue created with prd:draft label
# Review PRD, update to prd:ready when approved
# Comment: @claude implement
```

**Result:** Balanced PRD (~600 lines) with automated implementation

---

### Example 3: Complex Migration

```bash
# Create issue from template
# Fill in context about Jest → Vitest migration
# Comment: @claude generate prd

# Claude generates comprehensive Tier 3 PRD (~1200 lines)
# Review all 21 sections
# Update label to prd:ready
# Comment: @claude implement

# Claude implements in phases with progress tracking
# Creates draft PR
# Review and merge
```

**Result:** Full architectural spec with phased implementation

---

## 🔄 Integration with Existing Workflows

### Works With:
- ✅ `claude.yml` - Handles `@claude` mentions
- ✅ `claude-code-review.yml` - Reviews PRD implementation PRs
- ✅ `pr-review-comprehensive.yml` - Comprehensive PR review
- ✅ Project CLAUDE.md style guidelines

### New Workflows:
- ✅ `prd-implement.yml` - Automates PRD implementation

---

## 💡 Best Practices

### 1. **Match Complexity to Reality**
- Don't over-document simple tasks
- Be thorough for complex migrations
- Trust the tier assessment

### 2. **Use Issues for Tracking**
- Use `--issue` flag for features you want to track
- Labels provide visual status
- Easy to see what's in progress

### 3. **Review Before Implementing**
- Always review generated PRDs
- Adjust sections if needed
- Ensure success criteria are measurable

### 4. **Iterate on PRDs**
- PRDs are living documents
- Update as you learn more
- Keep in `context/active/` for reference

### 5. **Leverage Automation**
- Use `@claude implement` for automated implementation
- Progress tracking keeps everyone informed
- Draft PRs allow for review

---

## 🐛 Troubleshooting

### "PRD is too long for a simple task"
- The tier assessment should prevent this
- If it happens, regenerate with clearer task description
- You can manually edit to remove unnecessary sections

### "PRD is missing important sections"
- Check the complexity tier - may need to be higher
- Manually add sections using the templates in `/prd` command
- Update the PRD file in `context/active/`

### "Implementation is stuck"
- Check if issue has `prd:blocked` label
- Review Claude's comments on the issue
- May need human intervention for decisions

### "Labels not updating"
- Ensure workflows have correct permissions
- Check workflow runs in Actions tab
- May need to manually update labels

---

## 🚀 Quick Start

### **Interactive Mode** (Recommended for First-Time Use)

```bash
/prd Add export button to dashboard
```

**What happens:**
1. Claude assesses complexity → asks "Is Tier 1 correct?"
2. You confirm or adjust
3. Claude generates PRD → asks "Satisfied?"
4. You can refine or approve
5. Saves when you're happy

---

### **Fast Mode** (When You Trust Auto-Generation)

```bash
/prd Add export button to dashboard --auto
```

**What happens:**
1. Claude assesses, generates, saves
2. Done! (no interaction)

---

### **Tracked Feature with GitHub Issue**

```bash
/prd Add real-time notifications system --issue
```

**What happens:**
1. Interactive tier assessment and generation
2. Creates GitHub issue with PRD
3. Issue has `prd:draft` label
4. You review, change to `prd:ready`
5. Comment: `@claude implement`
6. Auto-implements!

---

### **Complex Migration from Issue**

```bash
# 1. Create issue using PRD template
# 2. Fill in context
# 3. Comment: @claude generate prd
```

**What happens:**
1. Claude auto-generates (non-interactive in CI/CD)
2. Saves comprehensive PRD
3. Updates issue with link
4. Sets `prd:ready` label
5. You can immediately: `@claude implement`

---

## 🔗 Related Documentation

- [Claude Code Docs](https://docs.claude.com/claude-code)
- [Slash Commands](../.claude/commands/prd.md)
- [Project Style Guide](../CLAUDE.md)

---

## 📊 Metrics

Track your PRD workflow effectiveness:
- PRDs generated per month
- Tier distribution (1/2/3)
- Implementation success rate
- Time from PRD → PR merge

---

**Need help?** Open an issue with the `question` label or comment on any PRD issue.
