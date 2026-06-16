#!/usr/bin/env node

const { runInstall, runUpdate } = require('../src/install');

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
Codebase-Compass — installable agent skill

Usage:
  npx codebase-compass install    Install the skill into the current project
  npx codebase-compass update     Update the skill files and refresh dashboard styles

The install command detects agent configuration (.opencode, .claude, .codex, or .agents)
and copies the skill into the appropriate directory.
If no agent config is detected, it defaults to .agents/skills/.

The update command refreshes SKILL.md and assets in the installed skill directory,
and merges opencode commands if applicable. Dashboard styles are also refreshed.
Other generated output is not modified.
`);
}

async function main() {
  if (command === 'install') {
    await runInstall();
  } else if (command === 'update') {
    await runUpdate();
  } else {
    showHelp();
    process.exit(command ? 1 : 0);
  }
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
