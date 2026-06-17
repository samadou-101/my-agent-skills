# Codebase-Compass

Codebase-Compass converts any unknown codebase into a structured knowledge system and an interactive HTML dashboard, while keeping every claim traceable to real source files.

## What gets generated

- `codebase-compass/<NN-topic>/<NN-topic>.md` — detailed knowledge card (numbered for sort order)
- `codebase-compass/00-codebase-view/sections/<NN-topic>.html` — dashboard section
- `codebase-compass/00-codebase-view/manifest.json` — registry of topics
- `codebase-compass/00-codebase-view/index.html` — browsable dashboard shell
- `codebase-compass/00-codebase-view/styles.css` — dashboard styles (copied from `assets/dashboard.css`)
- `codebase-compass/00-codebase-view/script.js` — dashboard logic (sorts sidebar by key, theme toggle)

## Quick install (recommended)

Run the installer in the project you want to analyze:

```bash
npx codebase-compass install
```

The installer will:

- Detect which agent configuration already exists in the project (`.opencode`, `.claude`, `.codex`, or `.agents`).
- Ask you to pick one if multiple are detected.
- Install the Codebase-Compass skill into that agent's project-local skills directory.
- Merge the `/codebase-compass` and `/codebase-compass-all` command blocks into `.opencode/opencode.json` for opencode.

If no agent configuration is detected, the installer defaults to `.agents/skills/`.

After installation, restart your agent if needed.

## Update an existing installation

```bash
npx codebase-compass update
```

The update command will:

- Detect which agent configuration to update (same logic as `install`).
- Copy `SKILL.md` only if its content has changed.
- Mirror the `assets/` directory into the installed skill (add new, update changed, remove stale).
- For opencode, merge command blocks and `skills.paths` into `.opencode/opencode.json` only if the merged result differs.
- Refresh `codebase-compass/00-codebase-view/styles.css` and `index.html` with the latest assets if the dashboard directory exists. Other generated output is not modified.

## Dashboard theming

The dashboard ships with a light/dark theme toggle:

- **Light mode** is the default on first load.
- Click the toggle button (☀️/🌙) in the sidebar header to switch themes.
- Your preference is persisted in `localStorage`.

Styles are maintained in the skill's `assets/dashboard.css` file, which uses CSS custom properties for theming. When the agent creates the dashboard, it copies this file into `codebase-compass/00-codebase-view/styles.css`.

## Manual install

If you prefer to copy files manually, follow the instructions below.

### Open agents / `.agents`

```bash
cp -r .agents/skills/codebase-compass ~/.agents/skills/
```

### Claude Code

```bash
cp -r .claude/skills/codebase-compass ~/.claude/skills/
```

### Codex

```bash
cp -r .codex/skills/codebase-compass ~/.codex/skills/
```

### opencode

The skill and command config are already in `.opencode/`.

To use them globally, copy the skill folder and merge the command block into your global config:

```bash
mkdir -p ~/.config/opencode/skills
cp -r .opencode/skills/codebase-compass ~/.config/opencode/skills/
```

Then copy the `command` section from `.opencode/opencode.json` into `~/.config/opencode/opencode.json`.

**After editing opencode config, restart opencode** for the changes to take effect.

## Usage

- `/codebase-compass <topic>` — analyze one topic, e.g. `/codebase-compass request-flow`
- `/codebase-compass-all` — analyze the full catalog

## Important rules

- The skill is **read-only** with respect to the repository being analyzed.
- It only writes into the `codebase-compass/` output directory.
- Every claim in generated markdown must link back to real source files.
- If a topic does not apply to the repo, the skill still produces a short note explaining what was checked.
