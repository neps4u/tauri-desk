# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

Add a changeset for any user-facing change to a published package
(`@tauri-desk/dashboard`, `@tauri-desk/create-app`):

```bash
pnpm changeset
```

Then commit the generated markdown file. When the change lands on `main`, the
release workflow opens a "Version Packages" PR; merging it publishes to npm.
