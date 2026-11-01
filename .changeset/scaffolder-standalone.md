---
'@tauri-desk/create-app': patch
---

Scaffolded apps work outside the monorepo: self-contained `tsconfig.json`, `vite build` instead of a workspace-relative build script, a `.gitignore`, and input validation for app names, bundle identifiers, scopes, and product names so quoted/backslash characters can't generate invalid JSON or TOML.
