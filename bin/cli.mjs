#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, "..", "templates");

const command = process.argv[2];

const HELP = `
opsx-one — One-command OpenSpec lifecycle for VS Code Copilot Chat

Usage:
  npx opsx-one init                         Set up opsx-one in the current project
  npx opsx-one update                       Replace opsx-one files in the current project
  npx github:gisketch/opsx-one init        Run directly from GitHub in the current project
  npx github:gisketch/opsx-one update      Run update directly from GitHub in the current project
  npx opsx-one init --force                 Overwrite existing files
  npx opsx-one help                         Show this help message

What init does:
  1. Copies .github/agents/opsx-one.agent.md   (the custom agent)
  2. Copies .github/prompts/opsx-one.prompt.md  (slash command fallback)
  3. Creates .github/copilot-instructions.md    (workspace context)
     - If one already exists, appends OpenSpec section instead of overwriting

Update behavior:
  - update always replaces:
    .github/agents/opsx-one.agent.md
    .github/prompts/opsx-one.prompt.md
    .github/copilot-instructions.md

Prerequisites:
  - OpenSpec CLI: npm install -g @fission-ai/openspec@latest
  - Initialize OpenSpec: openspec init --tools github-copilot --force
  - VS Code with GitHub Copilot extension
`;

function setup({ force, mode }) {
  const cwd = process.cwd();

  const agentsDir = join(cwd, ".github", "agents");
  const agentDest = join(agentsDir, "opsx-one.agent.md");

  const promptsDir = join(cwd, ".github", "prompts");
  const promptDest = join(promptsDir, "opsx-one.prompt.md");

  const instructionsDest = join(cwd, ".github", "copilot-instructions.md");

  const operation = mode === "update" ? "update" : "init";
  console.log(`\n  opsx-one ${operation}\n`);

  mkdirSync(agentsDir, { recursive: true });
  mkdirSync(promptsDir, { recursive: true });

  if (existsSync(agentDest) && !force) {
    console.log("  ⚠ .github/agents/opsx-one.agent.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "opsx-one.agent.md"), agentDest);
    console.log("  ✓ .github/agents/opsx-one.agent.md");
  }

  if (existsSync(promptDest) && !force) {
    console.log("  ⚠ .github/prompts/opsx-one.prompt.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "opsx-one.prompt.md"), promptDest);
    console.log("  ✓ .github/prompts/opsx-one.prompt.md");
  }

  const instructionsTemplate = readFileSync(join(TEMPLATES_DIR, "copilot-instructions.md"), "utf-8");

  const overwriteInstructions = mode === "update";

  if (existsSync(instructionsDest)) {
    if (overwriteInstructions) {
      writeFileSync(instructionsDest, instructionsTemplate);
      console.log("  ✓ .github/copilot-instructions.md (overwritten)");
    } else {
    const existing = readFileSync(instructionsDest, "utf-8");
    if (existing.includes("opsx-one") || existing.includes("OpenSpec")) {
      if (!force) {
        console.log("  ⚠ .github/copilot-instructions.md already contains OpenSpec context (use --force to overwrite)");
      } else {
        writeFileSync(instructionsDest, instructionsTemplate);
        console.log("  ✓ .github/copilot-instructions.md (overwritten)");
      }
    } else {
      const appended = existing.trimEnd() + "\n\n" + instructionsTemplate;
      writeFileSync(instructionsDest, appended);
      console.log("  ✓ .github/copilot-instructions.md (appended OpenSpec section)");
    }
    }
  } else {
    writeFileSync(instructionsDest, instructionsTemplate);
    console.log("  ✓ .github/copilot-instructions.md");
  }

  const modeMessage = mode === "update"
    ? "  Done! OPSX One files were updated in this project."
    : "  Done! Reload VS Code (Developer: Reload Window) to activate.";

  console.log(`
${modeMessage}

  Reload VS Code (Developer: Reload Window) to activate.

  Usage (Agent — recommended):
    Select "OPSX One" from the agent picker dropdown in Chat

  Usage (Slash command fallback):
    Open Copilot Chat → type /opsx-one

  Prerequisites (if not done already):
    npm install -g @fission-ai/openspec@latest
    openspec init --tools github-copilot --force
`);
}

function init() {
  const force = process.argv.includes("--force");
  setup({ force, mode: "init" });
}

function update() {
  setup({ force: true, mode: "update" });
}

switch (command) {
  case "init":
    init();
    break;
  case "update":
    update();
    break;
  case "help":
  case "--help":
  case "-h":
  case undefined:
    console.log(HELP);
    break;
  default:
    console.error(`  Unknown command: ${command}\n  Run 'npx opsx-one help' for usage.`);
    process.exit(1);
}
