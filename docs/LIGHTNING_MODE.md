# LIGHTNING MODE

## Purpose

Load shared state from the canonical repository and provide instant project context.

## Load Process

1. Fetch shared_state.json
2. Parse JSON
3. Read state
4. Read last three sessions
5. Display:
    * active_project
    * current_goal
    * priority_focus
    * last_decision
    * next_actions

## Conflict Detection

Before any write:

1. Fetch latest shared_state.json
2. Compare revision numbers
3. If revisions differ:
    * create merge proposal
    * append session
    * do not overwrite history

## Rules

* Sessions are append-only.
* Revision must increase on every write.
* Never delete session history.
* Repository is the canonical source of truth.

## Current Protocol

Distributed Sync Protocol v2.0
