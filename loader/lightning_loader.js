/**
 * Lightning Loader
 * Fetches and validates canonical state from vault-sync-core repository
 * Provides instant project context for AI platforms
 */

/**
 * Fetches the canonical shared state from the repository
 * @returns {Promise<Object>} Parsed state object with loaded metadata
 * @throws {Error} Network failures, invalid JSON, or missing required fields
 */
export async function loadLightningMode() {
  const STATE_URL = "https://raw.githubusercontent.com/barbozafelipe14-art/vault-sync-core/initial-structure/state/shared_state.json";
  
  try {
    // Fetch the canonical state
    const response = await fetch(STATE_URL);
    
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    // Parse JSON safely
    let rawData;
    try {
      rawData = await response.json();
    } catch (parseError) {
      throw new Error(`Invalid JSON: ${parseError.message}`);
    }

    // Validate required fields
    const requiredFields = ["meta", "state", "sessions"];
    for (const field of requiredFields) {
      if (!rawData.hasOwnProperty(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate meta field structure
    if (!rawData.meta.hasOwnProperty("revision")) {
      throw new Error("Missing required field: meta.revision");
    }

    // Validate state field structure
    const requiredStateFields = ["active_project", "current_goal", "priority_focus", "last_decision", "next_actions"];
    for (const field of requiredStateFields) {
      if (!rawData.state.hasOwnProperty(field)) {
        throw new Error(`Missing required field: state.${field}`);
      }
    }

    // Extract recent sessions (last 3)
    const recentSessions = Array.isArray(rawData.sessions)
      ? rawData.sessions.slice(-3)
      : [];

    // Build return object
    return {
      loaded_at: new Date().toISOString(),
      revision: rawData.meta.revision,
      active_project: rawData.state.active_project,
      current_goal: rawData.state.current_goal,
      priority_focus: rawData.state.priority_focus,
      last_decision: rawData.state.last_decision,
      next_actions: rawData.state.next_actions,
      recent_sessions: recentSessions
    };

  } catch (error) {
    // Enhanced error handling with context
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network failure: Unable to connect to state repository. ${error.message}`);
    }
    
    throw error;
  }
}
