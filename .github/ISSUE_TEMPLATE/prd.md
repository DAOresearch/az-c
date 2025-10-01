---
name: "📋 Product Requirements Document (PRD)"
about: Create a PRD for a new feature, refactor, or migration
title: "PRD: "
labels: ["prd", "prd:draft"]
assignees: ""
---

## 📝 PRD Request

**What do you want to build?**
<!-- Describe the feature, refactor, or migration in 1-2 sentences -->



## 🎯 Problem Statement

**What problem does this solve?**
<!-- Explain the pain point or bottleneck this addresses -->



## 💭 Context

**Any relevant background?**
<!-- Link to related issues, docs, or discussions -->



---

## 🏷️ Label Workflow (IMPORTANT!)

**This issue starts with:** `prd:draft`

```
prd:draft → You review PRD → Change to prd:ready → @claude implement works
```

### Label States:

| Label | What it means | Can `@claude implement`? |
|-------|---------------|-------------------------|
| `prd:draft` | Being written/reviewed | ❌ NO - Automation blocked |
| `prd:ready` | Approved, ready to go | ✅ YES - Automation enabled |
| `prd:implementing` | Work in progress | ⚙️ Already running |
| `prd:completed` | Done! | ✋ Finished |
| `prd:blocked` | Stuck on something | ⏸️ Paused |

**Safety Gate:** You MUST manually change `prd:draft` → `prd:ready` to enable implementation.

---

## 🤖 Generate Full PRD

To generate a comprehensive PRD for this issue, comment:

```
@claude generate prd
```

Claude will:
1. Assess complexity (Tier 1-3)
2. Research the codebase
3. Generate adaptive PRD (200-1500+ lines)
4. Save to `PRDs/{issue-number}-{topic}.md`
5. Update this issue with the PRD link

**⚠️ IMPORTANT:** After reviewing the PRD, you must **manually change** the label from `prd:draft` → `prd:ready` to enable implementation. This safety gate prevents accidental implementation of draft PRDs.

---

## 📊 Complexity Estimate

<!-- Will be filled by Claude after PRD generation -->

- **Tier**: TBD
- **Files Affected**: TBD
- **Risk Level**: TBD
- **Estimated Time**: TBD

---

## ✅ Implementation

Once the PRD is ready and reviewed, comment:

```
@claude implement
```

This will:
- Create implementation branch
- Begin work with progress tracking
- Create draft PR when complete
