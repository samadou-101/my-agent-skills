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
- Update `codebase-compass/codebase-view/manifest.json`.

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

Supported topics:

- `overview` — high-level system purpose and structure
- `folder-structure` — directory layout and conventions
- `module-map` — modules and their responsibilities
- `dependency-graph` — internal and external dependencies
- `bootstrapping` — application startup and initialization
- `entrypoints` — CLI, HTTP, job, and event entry points
- `request-flow` — HTTP request lifecycle
- `data-flow` — data movement and transformation
- `async-jobs` — background/async job processing
- `logging` — logging system
- `error-handling` — error handling patterns
- `validation` — input validation
- `testing` — test structure and conventions
- `security` — security controls and concerns
- `auth` — authentication
- `authorization` — authorization
- `secrets` — secrets management
- `threat-model` — threat model
- `database-schema` — database/schema layer
- `repositories` — repository/data access patterns
- `transactions` — transaction management
- `caching` — caching strategy
- `api-overview` — API surface (REST, GraphQL, RPC, etc.)
- `external-integrations` — third-party integrations
- `deployment` — deployment configuration
- `ci-cd` — CI/CD pipelines
- `observability` — metrics, tracing, monitoring
- `performance` — performance patterns and concerns
- `domain-model` — core domain entities and relationships
- `business-rules` — business rules and invariants
- `feature-breakdown` — major features and how they are implemented

## Output structure

All generated artifacts live under `codebase-compass/`:

```text
codebase-compass/
  <topic>/
    <topic>.md
  codebase-view/
    index.html
    styles.css
    script.js
    manifest.json
    sections/
      <topic>.html
```

If `codebase-view/index.html`, `styles.css`, or `script.js` do not exist, create them with a simple, dependency-free dashboard shell.

## Execution pipeline (deterministic)

Every invocation must follow these steps.

### Step 1 — Determine the topic

From the user message, extract the topic deterministically:

- If the message starts with `/codebase-compass `, the topic is the next whitespace-separated word (e.g., `/codebase-compass logging` → `logging`).
- If the message does not start with `/codebase-compass `, the topic is the first whitespace-separated word of the message.
- Treat the extracted topic as case-insensitive, but use the canonical lowercase form from the catalog for file paths and manifest entries.
- For `/codebase-compass-all`, do not extract a single topic; iterate over the full catalog instead.

If the topic is missing, empty, unknown, or not in the supported catalog below, respond with the supported catalog and ask the user to pick one. Do not proceed without a valid topic.

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

Write `codebase-compass/<topic>/<topic>.md`.

Required sections:

1. **Concept** — what this subsystem does in the codebase.
2. **Flow** — step-by-step explanation of how it works.
3. **Real code references** — clickable links to actual source files.
   - Format examples:
     - [`boot.js`](../src/boot.js)
     - [`boot.js`](../src/boot.js):458-619
     - [`bootGhost`](../src/boot.js):458-619
4. **Cross-references** — links to related Compass topics, e.g. `/logging`, `/auth`, `/request-flow`.
5. **Risks / edge cases** — what can go wrong (optional but important).

Rules:

- Every claim must be traceable to real source code.
- No abstract explanation without a source link.
- Use relative paths from `codebase-compass/<topic>/<topic>.md` back to the source file.

### Step 5 — Generate the visualization file

Write `codebase-compass/codebase-view/sections/<topic>.html`.

Requirements:

- Present a simplified, navigation-friendly version of the markdown content.
- Include the title and a short summary.
- List key code references as clickable links.
- Add a “Related topics” list linking to other sections.
- Keep styling inline or use the shared `styles.css`.
- Do not add external dependencies; keep it plain HTML/CSS/JS.

### Step 6 — Update the registry

Read `codebase-compass/codebase-view/manifest.json`. If it does not exist, create it.

Add or update the entry for the topic:

```json
{
  "<topic>": {
    "title": "<Human-readable title>",
    "md": "../<topic>/<topic>.md",
    "html": "sections/<topic>.html"
  }
}
```

Write the updated manifest back.

### Step 7 — Ensure dashboard shell files exist

If missing, create:

- `codebase-compass/codebase-view/index.html` — dashboard shell with sidebar navigation and section loader.
- `codebase-compass/codebase-view/styles.css` — minimal styles.
- `codebase-compass/codebase-view/script.js` — reads `manifest.json`, injects sections, handles navigation.

These are purely representational and derived from the knowledge layer.

### Step 8 — Report completion

Tell the user:

- Which topic(s) were analyzed.
- Path to the generated markdown file(s).
- Path to the generated HTML section(s).
- How to open the dashboard (`codebase-compass/codebase-view/index.html`).
- Any important caveats or files that could not be analyzed.

## Traceability rules (critical)

> Every claim MUST be traceable to real source code.

- Use file references in this form: [`symbolName`](../path/to/file.js):start-end
- Prefer function-level linking.
- Multiple references are allowed and encouraged in flows.
- Do not invent references. If you cannot find evidence, state that explicitly.

## Cross-reference conventions

Link to other Compass topics using absolute topic paths:

- `/logging`
- `/auth`
- `/request-flow`
- `/database-schema`

In HTML sections, convert these to relative section links: `./sections/logging.html`.

## Example reference formats

```text
Before any request is served, initialization happens in
[`boot.js`](../src/boot.js):458-619 (`bootGhost`).
```

```text
Routes are registered in [`routes.js`](../src/routes.js):12-34.
```

## Risk handling

- If a topic does not apply to the repo (e.g., no caching layer), still generate a brief `<topic>.md` explaining that no evidence was found and listing files you checked.
- If you cannot determine line ranges, use file-level links and explain why.
- Never hallucinate code references.
