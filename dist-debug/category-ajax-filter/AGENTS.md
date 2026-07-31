# CAF Free — Agent Notes

Free is **not** a Pro clone. Hub-and-spoke:

- **React** → edit Pro `react-builder/src`, then `build:free` / `release:free`
- **Free PHP** → edit this tree (sanitizers, entry, readme, non-allowlisted includes)
- **Allowlisted runtime** (Free Woo, etc.) → durable source is Pro `scripts/free-plugin/`

After a WP.org Free-only patch: if the file is sync-allowlisted, port it into Pro `free-plugin/` before the next `release:free` or the sync will overwrite it.

Rules: `.cursor/rules/caf-free-core.mdc`, `caf-free-php.mdc`, `caf-wporg-guidelines.mdc`.  
Pro: `caf-hub-spoke.mdc`, `caf-free-code-policy.mdc` (strict Pro removal; WP.org trialware).
