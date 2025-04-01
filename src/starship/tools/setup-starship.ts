import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createTool } from "../../utils/tool-helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const promptPath = join(__dirname, "texts", "setup-starship.md");

// Fallback text in case file reading fails
const fallbackText = `# Starship MCP Tool - Automated Setup Guide
Please refer to the documentation for setup instructions.`;

export const setupStarshipTool = createTool(async () => {
  let text: string;

  try {
    text = readFileSync(promptPath, "utf-8");
  } catch (error) {
    text = fallbackText;
  }

  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
});
