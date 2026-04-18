#!/usr/bin/env node

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { homedir } from "os";
import readline from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, "..", "templates");

const command = process.argv[2];

const BASES = [
  "opsx-one",
  "agent-one",
  "brainstorm-one",
  "designer-one",
  "opsx-designer-one",
  "opsx-one-init",
  "opsx-one-retrofit",
];

// Two installable lineups, one per runtime, each with normal + caveman twin.
const VSC_AGENTS = BASES.flatMap((b) => [`vsc-${b}.agent.md`, `vsc-${b}-caveman.agent.md`]);
const CLI_AGENTS = BASES.flatMap((b) => [`cli-${b}.agent.md`, `cli-${b}-caveman.agent.md`]);
const ALL_AGENTS = [...VSC_AGENTS, ...CLI_AGENTS];

const PROMPT_FILES = [
  "opsx-one.prompt.md",
  "opsx-one-caveman.prompt.md",
];

const HELP = `
opsx-one — One-command OpenSpec lifecycle for VS Code Copilot Chat & Copilot CLI

Usage:
  npx opsx-one init                         Set up opsx-one in the current project
                                            (installs BOTH "VSC ..." and "CLI ..." agent variants)
  npx opsx-one init --global                Install agents GLOBALLY in ~/.copilot/agents/
                                            (CLI variants only — Copilot CLI auto-loads them everywhere)
  npx opsx-one update                       Replace opsx-one files in the current project
  npx opsx-one update --global              Replace global agents in ~/.copilot/agents/
  npx opsx-one starter-kit                  Clone the OPSX One Starter Kit
  npx github:gisketch/opsx-one init         Run directly from GitHub
  npx opsx-one init --force                 Overwrite existing files
  npx opsx-one help                         Show this help message

What init does (project mode, default):
  Copies .github/agents/vsc-*.agent.md      ← pick these in VS Code Copilot Chat
  Copies .github/agents/cli-*.agent.md      ← pick these in Copilot CLI
  Copies .github/prompts/opsx-one*.prompt.md (slash command fallbacks)
  Creates/updates .github/copilot-instructions.md (workspace context)

  Both lineups ship every time — no --runtime flag needed. Just pick the
  agent matching where you are working. Each variant also has a caveman twin.

What init --global does (Copilot CLI only):
  Copies cli-*.agent.md into ~/.copilot/agents/ so they show up in /agent
  from EVERY repository. VSC variants are skipped (they only make sense
  inside a project's .github/agents/).
  Restart Copilot CLI to load them.

Caveman variants:
  Each agent ships with a "<Name> Caveman" twin that responds in caveman-speak,
  cutting ~75% of output tokens while keeping 100% technical accuracy.
  Pick them from the agent picker (e.g. "VSC OPSX One Caveman").

Prerequisites:
  - OpenSpec CLI: npm install -g @fission-ai/openspec@latest
  - Initialize OpenSpec: openspec init --tools github-copilot --force
  - VS Code with GitHub Copilot extension, OR Copilot CLI installed
`;

function relPath(p, base) {
  const b = base.endsWith("/") ? base : base + "/";
  return p.startsWith(b) ? p.slice(b.length) : p;
}

function copyTemplate({ srcFile, destFile, force, baseForLog }) {
  const display = baseForLog ? relPath(destFile, baseForLog) : destFile;
  if (existsSync(destFile) && !force) {
    console.log(`  ⚠ ${display} already exists (use --force to overwrite)`);
    return false;
  }
  mkdirSync(dirname(destFile), { recursive: true });
  copyFileSync(join(TEMPLATES_DIR, srcFile), destFile);
  console.log(`  ✓ ${display}`);
  return true;
}

function setupProject({ force, mode }) {
  const cwd = process.cwd();
  const agentsDir = join(cwd, ".github", "agents");
  const promptsDir = join(cwd, ".github", "prompts");
  const instructionsDest = join(cwd, ".github", "copilot-instructions.md");

  const operation = mode === "update" ? "update" : "init";
  console.log(`\n  opsx-one ${operation} (project mode — installing VSC + CLI variants)\n`);

  mkdirSync(agentsDir, { recursive: true });
  mkdirSync(promptsDir, { recursive: true });

  for (const file of ALL_AGENTS) {
    copyTemplate({
      srcFile: file,
      destFile: join(agentsDir, file),
      force,
      baseForLog: cwd,
    });
  }

  for (const file of PROMPT_FILES) {
    copyTemplate({
      srcFile: file,
      destFile: join(promptsDir, file),
      force,
      baseForLog: cwd,
    });
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
    : "  Done! Reload your editor / restart your CLI to activate.";

  console.log(`
${modeMessage}

  In VS Code Copilot Chat:
    Reload window → open agent picker → choose any "VSC ..." agent
    Caveman twins available too: "VSC OPSX One Caveman" etc. (~75% fewer tokens)

  In Copilot CLI:
    Restart \`copilot\` → run /agent → choose any "CLI ..." agent
    Or: copilot --agent cli-opsx-one --prompt "your task"
    Caveman: copilot --agent cli-opsx-one-caveman --prompt "your task"

  Slash command fallback (VS Code):
    /opsx-one        # full lifecycle
    /opsx-one-caveman # caveman lifecycle

  Prerequisites (if not done already):
    npm install -g @fission-ai/openspec@latest
    openspec init --tools github-copilot --force
`);
}

function setupGlobal({ force, mode }) {
  const home = homedir();
  const agentsDir = join(home, ".copilot", "agents");
  const operation = mode === "update" ? "update" : "init";
  const forceInstructions = process.argv.includes("--force-instructions");

  console.log(`\n  opsx-one ${operation} (global mode → ${agentsDir})\n  Installing CLI variants only (VSC variants only make sense inside a project).\n`);

  mkdirSync(agentsDir, { recursive: true });

  for (const file of CLI_AGENTS) {
    copyTemplate({
      srcFile: file,
      destFile: join(agentsDir, file),
      force,
      baseForLog: home,
    });
  }

  if (forceInstructions) {
    const instructionsDest = join(home, ".copilot", "copilot-instructions.md");
    const instructionsTemplate = readFileSync(join(TEMPLATES_DIR, "copilot-instructions.md"), "utf-8");
    if (existsSync(instructionsDest) && !force) {
      console.log(`  ⚠ ~/.copilot/copilot-instructions.md exists (use --force to overwrite)`);
    } else {
      writeFileSync(instructionsDest, instructionsTemplate);
      console.log(`  ✓ ~/.copilot/copilot-instructions.md`);
    }
  }

  console.log(`
  Done! OPSX CLI agents installed GLOBALLY for Copilot CLI.
  Available in EVERY repository — no per-project setup needed.

  Activation:
    Restart Copilot CLI (any running session) to load the new agents.

  Usage:
    copilot                                            # /agent → pick CLI OPSX One
    copilot --agent cli-opsx-one --prompt "task"
    copilot --agent cli-opsx-one-caveman --prompt "..." # ~75% fewer tokens

  Available agents (global):
${BASES.map((b) => `    cli-${b}, cli-${b}-caveman`).join("\n")}

  Prerequisites for OpenSpec workflows (per project):
    npm install -g @fission-ai/openspec@latest
    openspec init --tools github-copilot --force
`);
}

function setup({ force, mode, global }) {
  if (global) {
    setupGlobal({ force, mode });
  } else {
    setupProject({ force, mode });
  }
}

function init() {
  const force = process.argv.includes("--force");
  const global = process.argv.includes("--global");
  setup({ force, mode: "init", global });
}

function update() {
  const global = process.argv.includes("--global");
  setup({ force: true, mode: "update", global });
}

function copyDirSync(src, dest, exclude = []) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    if (exclude.includes(entry)) continue;
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath, exclude);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
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

    const starterKitDir = resolve(__dirname, "..", "starter-kit");

    if (!existsSync(starterKitDir)) {
      console.error(`\n  Error: Bundled starter-kit not found at ${starterKitDir}`);
      rl.close();
      process.exit(1);
    }

    console.log(`\n  Copying starter-kit into ${projectName}...`);
    try {
      const EXCLUDE = ["node_modules", ".next", ".git"];
      copyDirSync(starterKitDir, targetDir, EXCLUDE);

      // npm strips .gitignore during publish — restore from _gitignore
      const underscoreGitignore = join(targetDir, "_gitignore");
      const dotGitignore = join(targetDir, ".gitignore");
      if (existsSync(underscoreGitignore) && !existsSync(dotGitignore)) {
        copyFileSync(underscoreGitignore, dotGitignore);
      }
      if (existsSync(underscoreGitignore)) {
        unlinkSync(underscoreGitignore);
      }

      console.log(`  Initializing git repository...`);
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
      console.error(`\n  Failed to set up starter kit: ${err.message}`);
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
