---
name: codebase-compass
description: Convert any unknown codebase into a structured, navigable knowledge system and interactive HTML dashboard. Use when the user asks to understand, map, document, or explore a repository, its architecture, flows, security, data layer, tests, deployment, etc. This skill is READ-ONLY and must never modify the source code being analyzed.
---

# Codebase-Compass

Codebase-Compass is an agent skill that converts an unknown codebase into a **structured, navigable knowledge system** plus an **interactive HTML dashboard**, while maintaining strict traceability back to real source files.

## Important: READ-ONLY mode

This skill is **strictly read-only** with respect to the repository under analysis. You may:

- Read source files.
- Search, grep, and explore.
- Generate new files under `codebase-compass/`.
- Update `codebase-compass/00-codebase-view/manifest.json`.

You must **NOT**:

- Edit, delete, rename, or move any existing source file.
- Change `package.json`, configuration files, tests, or any other project file.
- Run destructive commands (e.g., `rm`, `git reset`, `npm uninstall`).

All outputs go into the `codebase-compass/` directory at the project root.

## When to use

Use this skill when the user wants to:

- Understand how a codebase works.
- Map architecture, modules, or dependencies.
- Document flows (request, data, async jobs, auth, error handling, etc.).
- Explore security, database, caching, deployment, CI/CD, observability, or performance.
- Generate an HTML dashboard for browsing the system.

## Trigger commands

- `/codebase-compass <topic>` — analyze a single domain/topic.
- `/codebase-compass-all` — analyze the full predefined catalog.

## Topic catalog

Topics are numbered for deterministic sort order in folders and the sidebar. The numeric prefix (`NN`) is always used for directory names, markdown files, HTML sections, and manifest keys.

- `00-codebase-view` — browsable dashboard shell (always first)
- `01-system-overview` — high-level system purpose and structure
- `02-folder-structure` — directory layout and conventions
- `03-bootstrapping` — application startup and initialization
- `04-entrypoints` — CLI, HTTP, job, and event entry points
- `05-module-map` — modules and their responsibilities
- `06-dependency-graph` — internal and external dependencies
- `07-domain-model` — core domain entities and relationships
- `08-business-rules` — business rules and invariants
- `09-feature-breakdown` — major features and how they are implemented
- `10-request-flow` — HTTP request lifecycle
- `11-data-flow` — data movement and transformation
- `12-api-overview` — API surface (REST, GraphQL, RPC, etc.)
- `13-validation` — input validation
- `14-error-handling` — error handling patterns
- `15-logging` — logging system
- `16-async-jobs` — background/async job processing
- `17-database-schema` — database/schema layer
- `18-repositories` — repository/data access patterns
- `19-transactions` — transaction management
- `20-caching` — caching strategy
- `21-security` — security controls and concerns
- `22-auth` — authentication
- `23-authorization` — authorization
- `24-secrets` — secrets management
- `25-threat-model` — threat model
- `26-external-integrations` — third-party integrations
- `27-testing` — test structure and conventions
- `28-deployment` — deployment configuration
- `29-ci-cd` — CI/CD pipelines
- `30-observability` — metrics, tracing, monitoring
- `31-performance` — performance patterns and concerns

## Output structure

All generated artifacts live under `codebase-compass/`. Topic folders use the numbered prefix `NN-` for deterministic sort order:

```text
codebase-compass/
  00-codebase-view/
    index.html
    styles.css
    script.js
    manifest.json
    sections/
      NN-topic.html
  NN-topic/
    NN-topic.md
```

The skill also ships with a canonical `assets/` directory next to `SKILL.md` containing:
- `dashboard.css` — the full dashboard stylesheet with light/dark theme support.
- `index.html` — the base dashboard shell template.

When creating the dashboard shell, copy these assets into `codebase-compass/00-codebase-view/` instead of generating them inline.

If `00-codebase-view/index.html`, `styles.css`, or `script.js` do not exist, create them with a dependency-free dashboard shell that includes a fixed sidebar and custom scrollbar styling (see Step 7).

## Execution pipeline (deterministic)

Every invocation must follow these steps.

### Step 1 — Determine the topic

From the user message, extract the topic deterministically:

- If the message starts with `/codebase-compass `, the topic is the next whitespace-separated word (e.g., `/codebase-compass logging` → `logging`).
- If the message does not start with `/codebase-compass `, the topic is the first whitespace-separated word of the message.
- Treat the extracted topic as case-insensitive.
- **Map the extracted slug to its numbered form.** The user provides the short slug (e.g., `logging`, `overview`); the agent uses the `NN-topic` form from the catalog for all file paths (e.g., `15-logging`, `01-system-overview`).
- For `/codebase-compass-all`, do not extract a single topic; iterate over the full catalog and use each numbered entry.

If the topic is missing, empty, unknown, or not in the supported catalog, respond with the supported catalog and ask the user to pick one. Do not proceed without a valid topic.

### Step 2 — Explore the repository

Read-only exploration only.

1. Identify the project type and language:
   - Look for `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `composer.json`, `Gemfile`, etc.
   - Read `README.md` if it exists.
2. Find files relevant to the topic:
   - Use `glob` and `grep` to locate controllers, services, middleware, models, repositories, config files, entry points, tests, CI files, Docker files, etc.
   - Look for framework-specific signals (e.g., Express routes, NestJS decorators, Django views, Rails controllers, Spring annotations).
3. Build a focused file list. Do not read the entire repo.

### Step 3 — Analyze and extract evidence

For each relevant file:

1. Read the file.
2. Identify key functions, classes, methods, routes, variables, and configuration keys.
3. Record exact file paths and line ranges for every claim you will make.
4. Trace flows across multiple files when needed.

Always prefer function-level or line-range references over bare file links.

### Step 4 — Generate the knowledge file

Write `codebase-compass/<NN-topic>/<NN-topic>.md` (where `NN-topic` is the numbered form from the catalog).

Required sections (each topic should read like a polished, easy-to-scan mini system report):

1. **Concept** — what this subsystem is, what problem it solves, and where it sits in the system.
2. **Responsibility Boundaries** — what this module owns and explicitly does **not** own; scope and boundaries to prevent confusion with adjacent subsystems.
3. **Architecture Overview** — main components, layers, and internal modules (e.g., controller/service/repository).
4. **Flow** — step-by-step runtime behavior: entry points, sequence of operations, decision branches, and async behavior.
5. **Code References** — fully grounded, clickable links to actual source files.
   - **Every file reference MUST be a clickable markdown link** that opens the file when clicked.
   - Prefer function-level or line-range references.
   - Format examples:
      - [`boot.js`](../../src/boot.js)
      - [`boot.js`](../../src/boot.js):458-619
      - [`bootGhost`](../../src/boot.js):458-619
   - Line numbers must be placed **after** the link (not part of the URL) so the link still opens the file.
   - Include call chains where they clarify the flow.
6. **Data / State Model** — inputs, outputs, transformations, in-memory state, and database interactions handled by this subsystem.
7. **Dependencies & Cross-References** — modules this subsystem depends on, modules that depend on it, external libraries involved, and coupling level. Link to related Compass topics, e.g. `/logging`, `/auth`, `/request-flow`.
8. **Edge Cases / Failure Modes** — what breaks it, race conditions, missing-data scenarios, retry behavior, and fallback logic.

#### Formatting and clarity guidelines

- Use clear, descriptive Markdown headings and a consistent hierarchy (`# Title`, `## Section`, `### Sub-section`).
- Start each major section with a one-paragraph summary before diving into details.
- Use tables for:
  - Component summaries (name, purpose, file reference).
  - Configuration keys, environment variables, or options.
  - Comparison of similar mechanisms (e.g., auth strategies, error types).
  - Input/output mappings or request/response fields.
- Use diagrams whenever they make the flow or architecture easier to understand:
  - Prefer **Mermaid** diagrams (` ```mermaid `) for sequence diagrams, flowcharts, architecture diagrams, and ER diagrams.
  - Use ASCII diagrams only when Mermaid is not appropriate.
  - Keep diagrams focused; label nodes with real file or function names and link to code references nearby.
- Use bullet lists for steps, responsibilities, or enumerated items; keep list items concise.
- Use inline code for file names, function names, class names, variables, and config keys.
- Include a short "At a glance" table near the top summarizing key files, entry points, or technologies when useful.

Include these optional sections whenever relevant evidence exists:

9. **Security / Safety Considerations** — auth checks, injection risks, privilege boundaries, and sensitive operations.
10. **Performance Characteristics** — bottlenecks, expensive operations, caching behavior, and scaling concerns.
11. **Observability** — logs emitted, metrics, tracing points, and debugging hooks.

Rules:

- Every claim must be traceable to real source code.
- No abstract explanation without a source link.
- **All file references must be clickable markdown links** (`[text](relative-path)`). Bare inline code or plain-text paths are not allowed — they must be wrapped in link syntax so clicking opens the file.
- Use relative paths from `codebase-compass/<NN-topic>/<NN-topic>.md` back to the source file.

### Step 5 — Generate the visualization file

Write `codebase-compass/00-codebase-view/sections/<NN-topic>.html`.

Requirements:

- Present a simplified, navigation-friendly version of the markdown content.
- Reflect the key sections from the knowledge file: Concept, Boundaries, Architecture, Flow, Data/State, Dependencies, Edge Cases, and any relevant optional sections.
- Include the title and a short summary.
- List key code references as clickable links.
- Add a “Related topics” list linking to other sections.
- Keep styling inline or use the shared `styles.css`.
- Do not add external dependencies; keep it plain HTML/CSS/JS.

### Step 6 — Update the registry

Read `codebase-compass/00-codebase-view/manifest.json`. If it does not exist, create it.

Add or update the entry for the topic using the numbered form as the key:

```json
{
  "<NN-topic>": {
    "title": "<Human-readable title>",
    "md": "../<NN-topic>/<NN-topic>.md",
    "html": "sections/<NN-topic>.html"
  }
}
```

Write the updated manifest back. Entries are sorted by key in the sidebar, so the numeric prefix ensures correct order.

### Step 7 — Ensure dashboard shell files exist

If missing, create these files under `codebase-compass/00-codebase-view/`:

#### `index.html`

Copy `assets/index.html` from the skill into `codebase-compass/00-codebase-view/index.html`. Update the `<title>` to include the repository name. The sidebar header already contains a theme toggle button — replace the `#repo-title` text content with the repository or project name.

#### `styles.css`

Copy the skill's `assets/dashboard.css` file into `codebase-compass/00-codebase-view/styles.css`. This file provides the complete dashboard stylesheet with light and dark theme support via CSS custom properties, a purple accent palette, custom scrollbar styling, and all section styles. Do not generate styles inline — use the canonical asset.

#### `script.js`

Must:
1. Fetch `manifest.json`.
2. **Sort topic entries by key** (alphabetically, so the numeric prefix orders them correctly).
3. Render the sorted list in the sidebar.
4. On click, load the corresponding HTML section into the content area.
5. Highlight the active topic in the sidebar.
6. Implement theme toggle logic:
   - On load, read `localStorage.getItem('theme')` and set `document.documentElement.dataset.theme` accordingly (default to `"light"`).
   - When the `#theme-toggle` button is clicked, toggle between `"light"` and `"dark"`, update `document.documentElement.dataset.theme`, update the button label (☀️/🌙), and persist the choice to `localStorage`.

These files are purely representational and derived from the knowledge layer. Do not add external dependencies.

### Step 8 — Report completion

Tell the user:

- Which topic(s) were analyzed.
- Path to the generated markdown file(s).
- Path to the generated HTML section(s).
- How to open the dashboard (`codebase-compass/00-codebase-view/index.html`).
- Any important caveats or files that could not be analyzed.

## Traceability rules (critical)

> Every claim MUST be traceable to real source code.

- Use file references in this form: [`symbolName`](../../path/to/file.js):start-end
- **Every file reference MUST be a proper markdown link** (`[text](path)`), never plain text. This ensures clicking the link opens the file in the editor/OS.
- Prefer function-level linking.
- Multiple references are allowed and encouraged in flows.
- Do not invent references. If you cannot find evidence, state that explicitly.

## Cross-reference conventions

Link to other Compass topics using absolute topic paths:

- `/logging`
- `/auth`
- `/request-flow`
- `/database-schema`

In HTML sections, convert these to relative section links using the numbered form: `./sections/15-logging.html`.

## Example reference formats

```text
Before any request is served, initialization happens in
[`boot.js`](../../src/boot.js):458-619 (`bootGhost`).
```

```text
Routes are registered in [`routes.js`](../../src/routes.js):12-34.
```

## Risk handling

- If a topic does not apply to the repo (e.g., no caching layer), still generate a brief `<NN-topic>.md` explaining that no evidence was found and listing files you checked.
- If you cannot determine line ranges, use file-level links and explain why.
- Never hallucinate code references.
