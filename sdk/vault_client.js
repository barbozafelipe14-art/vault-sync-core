/**
 * Vault Client
 * High-level API for safe append-only operations
 * Orchestrates validation, fetching, updating, and writing
 */

import { validateSession, validateState, validateRevision } from './validator.js';
import {
  fetchFile,
  writeFile,
  parseJSON,
  stringifyJSON
} from './github_client.js';

/**
 * VaultClient - Main interface for vault operations
 */
export class VaultClient {
  constructor(token, owner, repo, branch = 'initial-structure') {
    if (!token || !owner || !repo) {
      throw new Error('VaultClient requires token, owner, and repo');
    }

    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    this.statePath = 'state/shared_state.json';
  }

  /**
   * Loads current state from GitHub
   * @returns {Promise<Object>} { state, sha, revision }
   * @throws {Error} If fetch or parse fails
   */
  async loadState() {
    try {
      const { content, sha } = await fetchFile(
        this.token,
        this.owner,
        this.repo,
        this.statePath,
        this.branch
      );

      const state = parseJSON(content, 'shared_state.json');

      // Validate state structure
      validateState(state);

      return {
        state,
        sha,
        revision: state.meta.revision
      };
    } catch (error) {
      throw new Error(`Failed to load state: ${error.message}`);
    }
  }

  /**
   * Appends a new session to vault with full safety checks
   * @param {Object} session - Session to append
   * @param {Object} options - Optional metadata
   * @returns {Promise<Object>} { success: true, revision: new_revision, sha: new_sha }
   * @throws {Error} If validation fails, revision conflict, or write fails
   */
  async appendSession(session, options = {}) {
    // Step 1: Validate the session being appended
    try {
      validateSession(session);
    } catch (error) {
      throw new Error(`Invalid session: ${error.message}`);
    }

    // Step 2: Load current state from GitHub
    let { state, sha, revision } = await this.loadState();

    // Step 3: Check for revision conflicts
    // (If we loaded a different revision than we expected, another process wrote)
    if (options.expectedRevision !== undefined) {
      validateRevision(revision, options.expectedRevision);
    }

    // Step 4: Append session to state
    state.sessions.push(session);

    // Step 5: Update metadata
    state.meta.revision += 1;
    state.meta.last_updated_at = new Date().toISOString();

    // Step 6: Validate updated state
    try {
      validateState(state);
    } catch (error) {
      throw new Error(`State validation failed after append: ${error.message}`);
    }

    // Step 7: Write to GitHub (using SHA to prevent conflicts)
    try {
      const writeResult = await writeFile(
        this.token,
        this.owner,
        this.repo,
        this.statePath,
        stringifyJSON(state),
        sha,
        this.branch,
        options.message ||
          `Append session: ${session.id} (${session.platform})`
      );

      return {
        success: true,
        revision: state.meta.revision,
        sha: writeResult.sha,
        sessionId: session.id
      };
    } catch (error) {
      throw new Error(`Failed to write state: ${error.message}`);
    }
  }

  /**
   * Gets recent sessions (last N)
   * @param {number} count - Number of recent sessions to return
   * @returns {Promise<Array>} Array of sessions
   */
  async getRecentSessions(count = 5) {
    try {
      const { state } = await this.loadState();
      return state.sessions.slice(-count);
    } catch (error) {
      throw new Error(`Failed to get recent sessions: ${error.message}`);
    }
  }

  /**
   * Gets current state metadata
   * @returns {Promise<Object>} Current state meta object
   */
  async getStateMetadata() {
    try {
      const { state } = await this.loadState();
      return state.meta;
    } catch (error) {
      throw new Error(`Failed to get state metadata: ${error.message}`);
    }
  }

  /**
   * Gets all sessions
   * @returns {Promise<Array>} All sessions
   */
  async getAllSessions() {
    try {
      const { state } = await this.loadState();
      return state.sessions;
    } catch (error) {
      throw new Error(`Failed to get all sessions: ${error.message}`);
    }
  }
}

/**
 * Factory function for creating VaultClient instances
 * @param {string} token - GitHub token
 * @param {string} owner - Repo owner
 * @param {string} repo - Repo name
 * @param {string} branch - Branch name
 * @returns {VaultClient}
 */
export function createVaultClient(token, owner, repo, branch) {
  return new VaultClient(token, owner, repo, branch);
}
