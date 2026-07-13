# Task Board

File-based task tracking for mgrind. Each task is a markdown file with YAML frontmatter in `.tasks/items/`.

## Schema

```yaml
id: '001' # unique identifier
title: 'Short description'
status: 'todo' # todo | in_progress | review | done | blocked
assignee: null # null | "user" | "agent-name"
priority: 'medium' # low | medium | high
created: '2026-07-13'
updated: '2026-07-13'
depends_on: [] # task IDs this blocks on
needs_guidance: false # agent → user signal
tags: [] # categorization
```

## Status meanings

| Status        | Meaning               |
| ------------- | --------------------- |
| `todo`        | Not started           |
| `in_progress` | Being worked on       |
| `review`      | Ready for user review |
| `done`        | Completed             |
| `blocked`     | Waiting on something  |

## Workflow

1. **User** writes a brief description (1-2 sentences) as a task file
2. **Team leader agent** spawns a spec sub-agent → generates acceptance criteria → user approves
3. **Worktree agent** implements against ACs, writes progress to `## Progress`
4. If blocked → sets `needs_guidance: true`, describes blocker in `## Blockers`
5. **User** reviews, answers blockers, merges when done

## File ownership

Each task file is independent. Agents create/modify only their assigned task file.
