#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, "..", "templates");

const command = process.argv[2];

const HELP = `
opsx-one — One-command OpenSpec lifecycle for VS Code Copilot Chat

Usage:
  npx opsx-one init                         Set up opsx-one in the current project
  npx opsx-one update                       Replace opsx-one files in the current project
  npx opsx-one starter-kit                  Clone the OPSX One Starter Kit
  npx github:gisketch/opsx-one init        Run directly from GitHub in the current project
  npx github:gisketch/opsx-one update      Run update directly from GitHub in the current project
  npx github:gisketch/opsx-one starter-kit Clone the OPSX One Starter Kit directly from GitHub
  npx opsx-one init --force                 Overwrite existing files
  npx opsx-one help                         Show this help message

What init does:
  1. Copies .github/agents/opsx-one.agent.md   (the custom agent)
  2. Copies .github/agents/agent-one.agent.md   (global task cycle agent)
  3. Copies .github/agents/brainstorm-one.agent.md (brainstorm agent)
  4. Copies .github/agents/designer-one.agent.md (iterative design-to-code agent)
  5. Copies .github/agents/opsx-designer-one.agent.md (OpenSpec + Designer loop agent)
  6. Copies .github/agents/opsx-one-init.agent.md    (new project bootstrap agent)
  7. Copies .github/agents/opsx-one-retrofit.agent.md (existing project retrofit agent)
  8. Copies .github/prompts/opsx-one.prompt.md  (slash command fallback)
  9. Creates .github/copilot-instructions.md    (workspace context)
     - If one already exists, appends OpenSpec section instead of overwriting

Update behavior:
  - update always replaces:
    .github/agents/opsx-one.agent.md
    .github/agents/agent-one.agent.md
    .github/agents/brainstorm-one.agent.md
    .github/agents/designer-one.agent.md
    .github/agents/opsx-designer-one.agent.md
    .github/agents/opsx-one-init.agent.md
    .github/agents/opsx-one-retrofit.agent.md
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
  const agentOneDest = join(agentsDir, "agent-one.agent.md");
  const brainstormOneDest = join(agentsDir, "brainstorm-one.agent.md");
  const designerOneDest = join(agentsDir, "designer-one.agent.md");
  const opsxDesignerOneDest = join(agentsDir, "opsx-designer-one.agent.md");
  const initOneDest = join(agentsDir, "opsx-one-init.agent.md");
  const retrofitOneDest = join(agentsDir, "opsx-one-retrofit.agent.md");

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

  if (existsSync(agentOneDest) && !force) {
    console.log("  ⚠ .github/agents/agent-one.agent.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "agent-one.agent.md"), agentOneDest);
    console.log("  ✓ .github/agents/agent-one.agent.md");
  }

  if (existsSync(brainstormOneDest) && !force) {
    console.log("  ⚠ .github/agents/brainstorm-one.agent.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "brainstorm-one.agent.md"), brainstormOneDest);
    console.log("  ✓ .github/agents/brainstorm-one.agent.md");
  }

  if (existsSync(designerOneDest) && !force) {
    console.log("  ⚠ .github/agents/designer-one.agent.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "designer-one.agent.md"), designerOneDest);
    console.log("  ✓ .github/agents/designer-one.agent.md");
  }

  if (existsSync(opsxDesignerOneDest) && !force) {
    console.log("  ⚠ .github/agents/opsx-designer-one.agent.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "opsx-designer-one.agent.md"), opsxDesignerOneDest);
    console.log("  ✓ .github/agents/opsx-designer-one.agent.md");
  }

  if (existsSync(initOneDest) && !force) {
    console.log("  ⚠ .github/agents/opsx-one-init.agent.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "opsx-one-init.agent.md"), initOneDest);
    console.log("  ✓ .github/agents/opsx-one-init.agent.md");
  }

  if (existsSync(retrofitOneDest) && !force) {
    console.log("  ⚠ .github/agents/opsx-one-retrofit.agent.md already exists (use --force to overwrite)");
  } else {
    copyFileSync(join(TEMPLATES_DIR, "opsx-one-retrofit.agent.md"), retrofitOneDest);
    console.log("  ✓ .github/agents/opsx-one-retrofit.agent.md");
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

function starterKit() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("> Name: default (starter-kit) ", (answer) => {
    const projectName = answer.trim() || "starter-kit";
    const targetDir = resolve(process.cwd(), projectName);

    if (existsSync(targetDir)) {
      console.error(`\n  Error: Directory '${projectName}' already exists.`);
      rl.close();
      process.exit(1);
    }

    console.log(`\n  Cloning gisketch/opsx-one-starter-kit into ${projectName}...`);
    try {
      execSync(`git clone https://github.com/gisketch/opsx-one-starter-kit.git ${projectName}`, { stdio: "inherit" });
      
      console.log(`  Setting up fresh git repository...`);
      const gitDir = join(targetDir, ".git");
      if (existsSync(gitDir)) {
        rmSync(gitDir, { recursive: true, force: true });
      }
      
      execSync(`git init`, { cwd: targetDir, stdio: "ignore" });
      
      // Update package.json name
      const pkgPath = join(targetDir, "package.json");
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        pkg.name = projectName;
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      }

      console.log(`\n  Done! Your starter kit is ready.`);
      console.log(`\n  Next steps:`);
      console.log(`    cd ${projectName}`);
      console.log(`    bun install`);
      console.log(`    cp .env.example .env`);
      console.log(`    bunx prisma migrate dev --name init`);
      console.log(`    bun dev`);
      console.log(`\n  Then open VS Code Copilot Chat and type /opsx-one-starter to begin!`);
    } catch (err) {
      console.error(`\n  Failed to clone starter kit. Ensure git is installed and you have internet access.`);
    }
    rl.close();
  });
}

switch (command) {
  case "init":
    init();
    break;
  case "update":
    update();
    break;
  case "starter-kit":
    starterKit();
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
