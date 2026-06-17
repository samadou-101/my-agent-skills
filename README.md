# Codebase-Compass

Convert any unknown codebase into a structured, navigable knowledge system and an interactive HTML dashboard — with every claim traced back to real source files.

Codebase-Compass is an installable agent skill for [opencode](https://opencode.ai), [Claude Code](https://claude.ai/code), [Codex](https://openai.com/codex), and Open Agents (`.agents`). Once installed in a project, it reads the repository in **read-only** mode and generates detailed topic cards plus a browsable dashboard under `codebase-compass/`.

## What gets generated

```text
codebase-compass/
  00-codebase-view/
    index.html                  # Browsable dashboard shell
    styles.css                  # Dashboard styles (copied from assets/dashboard.css)
    script.js                   # Dashboard logic (theme toggle, sorts sidebar by key)
    manifest.json               # Registry of topics
    sections/
      NN-topic.html             # Dashboard section
  NN-topic/
    NN-topic.md                 # Detailed knowledge card
```

## Installation

### Quick install (recommended)

Run the installer in the project you want to analyze:

```bash
npx codebase-compass install
```

The installer will:

- Detect which agent configuration already exists in the project (`.opencode`, `.claude`, `.codex`, or `.agents`).
- Ask you to pick one if multiple are detected.
- Install the Codebase-Compass skill into that agent's project-local skills directory.
- For opencode, merge the `/codebase-compass` and `/codebase-compass-all` command blocks into `.opencode/opencode.json`.

If no agent configuration is detected, it defaults to `.agents/skills/`.

After installation, restart your agent if needed.

### Update an existing installation

```bash
npx codebase-compass update
```

The update command refreshes `SKILL.md` and `assets/` in the installed skill directory without touching your generated `codebase-compass/` content. For opencode, it also merges command blocks into `.opencode/opencode.json` only when the result differs. Dashboard styles (`styles.css`) and `index.html` are automatically refreshed to match the latest assets.

### Manual install

#### Open agents / `.agents`

```bash
cp -r .agents/skills/codebase-compass ~/.agents/skills/
```

#### Claude Code

```bash
cp -r .claude/skills/codebase-compass ~/.claude/skills/
```

#### Codex

```bash
cp -r .codex/skills/codebase-compass ~/.codex/skills/
```

#### opencode

```bash
mkdir -p ~/.config/opencode/skills
cp -r .opencode/skills/codebase-compass ~/.config/opencode/skills/
```

Then copy the `command` section from `.opencode/opencode.json` into `~/.config/opencode/opencode.json` and restart opencode.

## Usage

Once installed, use the skill inside your agent:

- `/codebase-compass <topic>` — analyze one topic, e.g. `/codebase-compass request-flow`
- `/codebase-compass-all` — analyze the full catalog

## Dashboard theming

The generated dashboard supports light and dark themes:

- **Light mode** is the default on first load.
- Click the toggle button (☀️/🌙) in the sidebar header to switch themes.
- Your preference is persisted in `localStorage`.

Styles are maintained in the skill's `assets/dashboard.css` file using CSS custom properties. When the agent creates the dashboard, it copies this file into `codebase-compass/00-codebase-view/styles.css`.

## Topic catalog

| # | Topic | Description |
|---|-------|-------------|
| 01 | `system-overview` | High-level system purpose and structure |
| 02 | `folder-structure` | Directory layout and conventions |
| 03 | `bootstrapping` | Application startup and initialization |
| 04 | `entrypoints` | CLI, HTTP, job, and event entry points |
| 05 | `module-map` | Modules and their responsibilities |
| 06 | `dependency-graph` | Internal and external dependencies |
| 07 | `domain-model` | Core domain entities and relationships |
| 08 | `business-rules` | Business rules and invariants |
| 09 | `feature-breakdown` | Major features and how they are implemented |
| 10 | `request-flow` | HTTP request lifecycle |
| 11 | `data-flow` | Data movement and transformation |
| 12 | `api-overview` | API surface (REST, GraphQL, RPC, etc.) |
| 13 | `validation` | Input validation |
| 14 | `error-handling` | Error handling patterns |
| 15 | `logging` | Logging system |
| 16 | `async-jobs` | Background/async job processing |
| 17 | `database-schema` | Database/schema layer |
| 18 | `repositories` | Repository/data access patterns |
| 19 | `transactions` | Transaction management |
| 20 | `caching` | Caching strategy |
| 21 | `security` | Security controls and concerns |
| 22 | `auth` | Authentication |
| 23 | `authorization` | Authorization |
| 24 | `secrets` | Secrets management |
| 25 | `threat-model` | Threat model |
| 26 | `external-integrations` | Third-party integrations |
| 27 | `testing` | Test structure and conventions |
| 28 | `deployment` | Deployment configuration |
| 29 | `ci-cd` | CI/CD pipelines |
| 30 | `observability` | Metrics, tracing, monitoring |
| 31 | `performance` | Performance patterns and concerns |

## Important rules

- **Read-only analysis:** Codebase-Compass never modifies the source code being analyzed.
- **Traceability:** Every claim in the generated markdown links back to a real source file.
- **Safe output:** All generated files are written under the `codebase-compass/` directory.
- **Graceful handling:** If a topic does not apply to the repository, a short note is produced explaining what was checked.

## Development

```bash
# Build distribution files for all supported agents
npm run build

# Publish to npm
npm publish
```

## Requirements

- Node.js >= 18.0.0

## License

MIT
