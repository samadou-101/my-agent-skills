const fs = require('fs');
const path = require('path');
const { pickAgent } = require('./prompt');

const AGENTS = [
  {
    key: 'opencode',
    label: 'opencode',
    marker: '.opencode',
    sourceSkillDir: path.join(__dirname, '..', 'dist', 'opencode', 'skills', 'codebase-compass'),
    targetSkillDir: (root) => path.join(root, '.opencode', 'skills', 'codebase-compass'),
  },
  {
    key: 'claude',
    label: 'Claude Code',
    marker: '.claude',
    sourceSkillDir: path.join(__dirname, '..', 'dist', 'claude', 'skills', 'codebase-compass'),
    targetSkillDir: (root) => path.join(root, '.claude', 'skills', 'codebase-compass'),
  },
  {
    key: 'codex',
    label: 'Codex',
    marker: '.codex',
    sourceSkillDir: path.join(__dirname, '..', 'dist', 'codex', 'skills', 'codebase-compass'),
    targetSkillDir: (root) => path.join(root, '.codex', 'skills', 'codebase-compass'),
  },
  {
    key: 'agents',
    label: 'Open agents / .agents',
    marker: '.agents',
    sourceSkillDir: path.join(__dirname, '..', 'dist', 'agents', 'skills', 'codebase-compass'),
    targetSkillDir: (root) => path.join(root, '.agents', 'skills', 'codebase-compass'),
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(source, target) {
  ensureDir(path.dirname(target));
  fs.cpSync(source, target, { recursive: true, force: true });
}

function copyIfChanged(source, target) {
  if (!fs.existsSync(source)) {
    return false;
  }
  const sourceContent = fs.readFileSync(source);
  if (fs.existsSync(target)) {
    const targetContent = fs.readFileSync(target);
    if (Buffer.compare(sourceContent, targetContent) === 0) {
      return false;
    }
  }
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, sourceContent);
  return true;
}

function detectAgents(targetRoot) {
  return AGENTS.filter((agent) => fs.existsSync(path.join(targetRoot, agent.marker)));
}

function readJson(filePath, defaultValue = {}) {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${filePath}: ${error.message}`);
  }
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function buildMergedOpencodeConfig(targetRoot) {
  const sourcePath = path.join(__dirname, '..', 'dist', 'opencode', 'opencode.json');
  const targetPath = path.join(targetRoot, '.opencode', 'opencode.json');

  if (!fs.existsSync(sourcePath)) {
    throw new Error('Distribution opencode.json not found. Run `npm run build` first.');
  }

  const sourceConfig = readJson(sourcePath);
  const targetConfig = readJson(targetPath, { $schema: 'https://opencode.ai/config.json' });

  targetConfig.command = targetConfig.command || {};
  if (sourceConfig.command) {
    for (const [key, value] of Object.entries(sourceConfig.command)) {
      targetConfig.command[key] = value;
    }
  }

  targetConfig.skills = targetConfig.skills || {};
  targetConfig.skills.paths = targetConfig.skills.paths || [];
  const localSkillsPath = '.opencode/skills';
  if (!targetConfig.skills.paths.includes(localSkillsPath)) {
    targetConfig.skills.paths.push(localSkillsPath);
  }

  return { targetPath, targetConfig };
}

function mergeOpencodeConfig(targetRoot) {
  const { targetPath, targetConfig } = buildMergedOpencodeConfig(targetRoot);
  writeJson(targetPath, targetConfig);
  console.log(`  Merged commands into ${path.relative(targetRoot, targetPath)}`);
}

function mergeOpencodeConfigIfChanged(targetRoot) {
  const { targetPath, targetConfig } = buildMergedOpencodeConfig(targetRoot);
  const newContent = JSON.stringify(targetConfig, null, 2) + '\n';
  if (fs.existsSync(targetPath)) {
    const currentContent = fs.readFileSync(targetPath, 'utf8');
    if (currentContent === newContent) {
      console.log(`  ${path.relative(targetRoot, targetPath)} already up to date`);
      return false;
    }
  }
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, newContent, 'utf8');
  console.log(`  Updated ${path.relative(targetRoot, targetPath)}`);
  return true;
}

async function installAgent(targetRoot, agent) {
  if (!fs.existsSync(agent.sourceSkillDir)) {
    throw new Error(
      `Distribution files for ${agent.label} not found at ${agent.sourceSkillDir}. Run \`npm run build\` first.`
    );
  }

  const targetSkillDir = agent.targetSkillDir(targetRoot);
  copyRecursive(agent.sourceSkillDir, targetSkillDir);
  console.log(`  Installed skill to ${path.relative(targetRoot, targetSkillDir)}`);

  if (agent.key === 'opencode') {
    mergeOpencodeConfig(targetRoot);
  }
}

function mirrorDir(sourceDir, targetDir) {
  let copied = 0;
  let skipped = 0;
  let removed = 0;

  if (!fs.existsSync(sourceDir)) {
    return { copied, skipped, removed };
  }

  ensureDir(targetDir);

  const sourceEntries = fs.readdirSync(sourceDir, { withFileTypes: true });
  const sourceNames = new Set();

  for (const entry of sourceEntries) {
    const srcPath = path.join(sourceDir, entry.name);
    const tgtPath = path.join(targetDir, entry.name);
    sourceNames.add(entry.name);

    if (entry.isDirectory()) {
      const sub = mirrorDir(srcPath, tgtPath);
      copied += sub.copied;
      skipped += sub.skipped;
      removed += sub.removed;
    } else {
      if (copyIfChanged(srcPath, tgtPath)) {
        copied++;
      } else {
        skipped++;
      }
    }
  }

  if (fs.existsSync(targetDir)) {
    const targetEntries = fs.readdirSync(targetDir, { withFileTypes: true });
    for (const entry of targetEntries) {
      if (!sourceNames.has(entry.name)) {
        const tgtPath = path.join(targetDir, entry.name);
        fs.rmSync(tgtPath, { recursive: true, force: true });
        removed++;
      }
    }
  }

  return { copied, skipped, removed };
}

async function updateAgent(targetRoot, agent) {
  if (!fs.existsSync(agent.sourceSkillDir)) {
    throw new Error(
      `Distribution files for ${agent.label} not found at ${agent.sourceSkillDir}. Run \`npm run build\` first.`
    );
  }

  const targetSkillDir = agent.targetSkillDir(targetRoot);

  const sourceSkillMd = path.join(agent.sourceSkillDir, 'SKILL.md');
  const targetSkillMd = path.join(targetSkillDir, 'SKILL.md');
  if (copyIfChanged(sourceSkillMd, targetSkillMd)) {
    console.log(`  Updated SKILL.md`);
  } else {
    console.log(`  SKILL.md unchanged`);
  }

  const sourceAssets = path.join(agent.sourceSkillDir, 'assets');
  const targetAssets = path.join(targetSkillDir, 'assets');
  if (fs.existsSync(sourceAssets)) {
    const stats = mirrorDir(sourceAssets, targetAssets);
    if (stats.copied > 0) console.log(`  Copied ${stats.copied} asset(s)`);
    if (stats.removed > 0) console.log(`  Removed ${stats.removed} stale asset(s)`);
    if (stats.copied === 0 && stats.removed === 0) console.log(`  Assets unchanged`);
  } else if (fs.existsSync(targetAssets)) {
    fs.rmSync(targetAssets, { recursive: true, force: true });
    console.log(`  Removed assets directory (no longer in source)`);
  }

  if (agent.key === 'opencode') {
    mergeOpencodeConfigIfChanged(targetRoot);
  }

  const dashboardStyles = path.join(targetRoot, 'codebase-compass', '00-codebase-view', 'styles.css');
  const sourceDashboardCss = path.join(agent.sourceSkillDir, 'assets', 'dashboard.css');
  if (fs.existsSync(dashboardStyles) && fs.existsSync(sourceDashboardCss)) {
    if (copyIfChanged(sourceDashboardCss, dashboardStyles)) {
      console.log(`  Updated codebase-compass/00-codebase-view/styles.css`);
    } else {
      console.log(`  Dashboard styles unchanged`);
    }
  }
}

async function runInstall(targetRoot = process.cwd()) {
  console.log(`Installing Codebase-Compass into ${targetRoot}\n`);

  const detected = detectAgents(targetRoot);
  let selectedAgent;

  if (detected.length === 0) {
    selectedAgent = AGENTS.find((a) => a.key === 'agents');
    console.log('No agent configuration detected. Defaulting to .agents.\n');
  } else if (detected.length === 1) {
    selectedAgent = detected[0];
    console.log(`Detected ${selectedAgent.label} configuration.\n`);
  } else {
    selectedAgent = await pickAgent(detected);
    console.log('');
  }

  await installAgent(targetRoot, selectedAgent);

  console.log(`\nCodebase-Compass installed for ${selectedAgent.label}.`);
  console.log('Usage: /codebase-compass <topic> or /codebase-compass-all');
}

async function runUpdate(targetRoot = process.cwd()) {
  console.log(`Updating Codebase-Compass in ${targetRoot}\n`);

  const detected = detectAgents(targetRoot);
  let selectedAgent;

  if (detected.length === 0) {
    selectedAgent = AGENTS.find((a) => a.key === 'agents');
    console.log('No agent configuration detected. Defaulting to .agents.\n');
  } else if (detected.length === 1) {
    selectedAgent = detected[0];
    console.log(`Detected ${selectedAgent.label} configuration.\n`);
  } else {
    selectedAgent = await pickAgent(detected);
    console.log('');
  }

  await updateAgent(targetRoot, selectedAgent);

  console.log(`\nCodebase-Compass updated for ${selectedAgent.label}.`);
  console.log('Dashboard styles were refreshed if present. Other output was not modified.');
}

module.exports = {
  runInstall,
  runUpdate,
  AGENTS,
  detectAgents,
  installAgent,
  updateAgent,
  copyIfChanged,
  mirrorDir,
  mergeOpencodeConfig,
  mergeOpencodeConfigIfChanged,
  buildMergedOpencodeConfig,
};
