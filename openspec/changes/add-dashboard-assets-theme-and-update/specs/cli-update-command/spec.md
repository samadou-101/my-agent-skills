## ADDED Requirements

### Requirement: CLI exposes an update command
The `codebase-compass` CLI SHALL accept a subcommand named `update` in addition to `install`.

#### Scenario: Running update
- **WHEN** a user runs `npx codebase-compass update`
- **THEN** the CLI executes the update workflow

#### Scenario: Unknown command still shows help
- **WHEN** a user runs `npx codebase-compass unknown`
- **THEN** the CLI prints help and exits with a non-zero status

### Requirement: Update detects agent configurations
The update command SHALL detect agent configuration directories (`.opencode`, `.claude`, `.codex`, `.agents`) and prompt when multiple are present, defaulting to `.agents` when none are found.

#### Scenario: Single agent detected
- **WHEN** the target project contains exactly one supported agent config
- **THEN** update proceeds for that agent without prompting

#### Scenario: Multiple agents detected
- **WHEN** the target project contains more than one supported agent config
- **THEN** update prompts the user to choose one

### Requirement: Update copies SKILL.md only if changed
The update command SHALL compare the source `SKILL.md` with the installed `SKILL.md` and copy only when their content differs.

#### Scenario: SKILL.md unchanged
- **WHEN** the installed `SKILL.md` is identical to the source
- **THEN** update skips copying `SKILL.md` and reports it as unchanged

#### Scenario: SKILL.md changed
- **WHEN** the installed `SKILL.md` differs from the source
- **THEN** update overwrites the installed `SKILL.md` with the source version

### Requirement: Update mirrors assets only if changed
The update command SHALL mirror the source `assets/` directory into the installed skill directory, copying only files whose content differs and removing installed assets that no longer exist in the source.

#### Scenario: Asset unchanged
- **WHEN** an installed asset is identical to the source
- **THEN** update skips that asset and reports it as unchanged

#### Scenario: New asset added
- **WHEN** the source contains an asset not present in the installed skill
- **THEN** update copies the new asset into the installed skill

#### Scenario: Asset removed from source
- **WHEN** an asset exists in the installed skill but not in the source
- **THEN** update removes the asset from the installed skill

### Requirement: Update refreshes opencode configuration only if changed
For opencode, the update command SHALL merge command blocks and `skills.paths` into `.opencode/opencode.json` only when the merged result differs from the current file.

#### Scenario: opencode.json already up to date
- **WHEN** the target `.opencode/opencode.json` already contains the expected commands and skills path
- **THEN** update skips writing the file

#### Scenario: opencode.json missing a command
- **WHEN** the target `.opencode/opencode.json` is missing a codebase-compass command
- **THEN** update merges the missing command and writes the file

### Requirement: Update refreshes dashboard shell in generated output
The update command SHALL copy `assets/dashboard.css` and `assets/index.html` into `codebase-compass/00-codebase-view/` in the target project when that directory exists, keeping the dashboard shell in sync with the skill. All other files under `codebase-compass/` shall not be modified.

#### Scenario: Generated dashboard exists
- **WHEN** the target project contains a `codebase-compass/00-codebase-view/` directory
- **THEN** running `npx codebase-compass update` copies `assets/dashboard.css` and `assets/index.html` into `codebase-compass/00-codebase-view/` if they differ

#### Scenario: No generated dashboard
- **WHEN** the target project does not contain `codebase-compass/00-codebase-view/`
- **THEN** running `npx codebase-compass update` does not create any files under `codebase-compass/`
