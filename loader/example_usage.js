/**
 * Lightning Loader - Example Usage
 * Demonstrates loading and displaying canonical project state
 */

import { loadLightningMode } from "./lightning_loader.js";

/**
 * Example: Load and display Lightning Mode state
 */
async function main() {
  try {
    const state = await loadLightningMode();
    
    console.log("⚡ LIGHTNING MODE ACTIVE");
    console.log(state);
    
  } catch (error) {
    console.error("❌ Failed to load Lightning Mode:", error.message);
    process.exit(1);
  }
}

// Execute example
main();
