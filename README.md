# Vault Sync Core

Canonical synchronization layer for distributed AI systems.

## Purpose

Provides:

* Shared memory
* Revision tracking
* Conflict detection
* Session logging
* Snapshot support
* Rollback support

## Platforms

* ChatGPT
* Claude
* Copilot
* Future clients

## Architecture

Repository acts as the source of truth.

State updates use revision tracking.

Sessions are append-only.

Conflicts generate merge proposals.

## Current Version

Protocol v2.0
