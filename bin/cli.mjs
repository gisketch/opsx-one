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
  npx opsx-one init          Set up opsx-one in the current project
  npx opsx-one init --force  Overwrite existing files
  npx opsx-one help          Show this help message

What init does:
  1. Copies .github/prompts/opsx-one.prompt.md (the prompt)
  2. Creates .github/copilot-instructions.md (workspace context)
     - If one already exists, appends OpenSpec section instead of overwriting

Prerequisites:
  - OpenSpec CLI: npm install -g @fission-ai/openspec@latest
  - Initialize OpenSpec: openspec init --tools github-copilot --force
  - VS Code with GitHub Copilot extension
`;

function init() {
  const force = process.argv.includes("--force");
  const cwd = process.cwd();
  const promptsDir = join(cwd, ".github", "prompts");
  const promptDest = join(promptsDir, "opsx-one.prompt.md");
  const instructionsDest = join(cwd, ".github", "copilot-instructions.md");

  console.log("\n  opsx-one init\n");

  mkdirSync(promptsDir, { recursive: true });

  if (existsSync(promptDest) && !force) {
    console.log("  ⚠ .github/prompts/opsx-one.prompt.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "opsx-one.prompt.md"), promptDest);
    console.log("  ✓ .github/prompts/opsx-one.prompt.md");
  }

  const instructionsTemplate = readFileSync(join(TEMPLATES_DIR, "copilot-instructions.md"), "utf-8");

  if (existsSync(instructionsDest)) {
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
  } else {
    writeFileSync(instructionsDest, instructionsTemplate);
    console.log("  ✓ .github/copilot-instructions.md");
  }

  console.log(`
  Done! Reload VS Code (Developer: Reload Window) to activate.

  Usage:
    Open Copilot Chat → type /opsx-one

  Prerequisites (if not done already):
    npm install -g @fission-ai/openspec@latest
    openspec init --tools github-copilot --force
`);
}

switch (command) {
  case "init":
    init();
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
