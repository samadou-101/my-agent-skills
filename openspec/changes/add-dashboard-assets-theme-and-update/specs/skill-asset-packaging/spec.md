## ADDED Requirements

### Requirement: Skill bundles dashboard assets
The `codebase-compass` skill SHALL include an `assets/` directory next to `SKILL.md` containing:
- `dashboard.css` — the canonical dashboard stylesheet.
- `index.html` — the base dashboard shell template.

#### Scenario: Assets exist in skill distribution
- **WHEN** the skill is built with `npm run build`
- **THEN** `dist/<agent>/skills/codebase-compass/assets/dashboard.css` and `dist/<agent>/skills/codebase-compass/assets/index.html` exist for every supported agent

### Requirement: SKILL.md references the assets
`SKILL.md` SHALL instruct the executing agent to copy `assets/dashboard.css` and `assets/index.html` into `codebase-compass/00-codebase-view/` instead of generating them inline.

#### Scenario: Dashboard creation uses assets
- **WHEN** the agent creates the dashboard shell for a topic
- **THEN** `codebase-compass/00-codebase-view/styles.css` and `index.html` are populated from the skill's `assets/` directory

### Requirement: Assets are included in the npm package
The published `codebase-compass` package SHALL include the dashboard assets so that `npx codebase-compass install` and `npx codebase-compass update` can copy them into installed skills.

#### Scenario: npm package contains assets
- **WHEN** `npm pack` is run after `npm run build`
- **THEN** the tarball contains `dist/<agent>/skills/codebase-compass/assets/dashboard.css` and `dist/<agent>/skills/codebase-compass/assets/index.html` for every supported agent
