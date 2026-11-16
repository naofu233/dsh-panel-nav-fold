# dsh-panel-nav-fold

A collapsible **Panel Navigation** header for the DeepSeek Harness sidebar. It folds the global panel rows (Plugins, Scheduled tasks, More, and any registered panels) together with every plugin sidebar entry into one row, and expands them in place on click.

Unlike popover or “More menu” variants, expanding restores the native panel rows exactly where they were. It does not change panel pinning, does not open a menu, and does not touch host files.

## Screenshots

Folded (default):

![Folded sidebar](assets/screenshot-1.png)

Expanded:

![Expanded panel navigation](assets/screenshot-2.png)

## What it does

- Adds a full-width **Panel Navigation** row below New Session and above the first plugin sidebar entry.
- Folded by default: hides the native `nav[aria-label="全局面板"]` / `nav[aria-label="Global panels"]` panel list and every sidebar entry that follows the `data-dsh-part="sidebar-entry"` convention.
- Click the row to expand; click again to fold. The state is stored in `localStorage` under `dsh.panel-nav-fold.folded`.
- When the whole sidebar is collapsed to its 56px rail, the row becomes a 36×36 icon-only control.
- Removes the empty band the shell reserves above and below the panel list, so the Workspaces section follows the group with normal spacing.
- Self-heals after React re-renders through a `MutationObserver`.

## Install

From the DSH plugin market (dshmarket), or directly from GitHub:

```sh
dsh plugin --profile <profile> add github:naofu233/dsh-panel-nav-fold
```

Replace `<profile>` with the profile in use (for the desktop app this is usually `tauri` or `desktop`). Then restart or reload as the plugin manager asks.

For local development, use **Plugins → Add plugin** and choose this directory.

## Compatibility

- Tested with DeepSeek Harness `0.2.2-rc.2` and `0.2.2-rc.3` (2026-11 shell update) on Windows, in both the Tauri desktop app and the web UI.
- `package.json` declares `engines.dsh: ^0.2.2-rc.2`.
- This is a DOM/CSS-level enhancement, not an official shell extension point. It reads the current sidebar structure (`nav[aria-label="全局面板"]`, `[data-dsh-part="sidebar-entry"]`, and the shell's `_panelList` / `_scrollArea` module classes). A future shell change can break placement or folding; the row itself stays visible and the plugin can be disabled safely.
- It does not modify host files or other plugins.

## Privacy

- No network requests, no telemetry, no credentials, and no workspace or session data is read or transmitted.
- The only persisted state is the fold flag in `localStorage` (`dsh.panel-nav-fold.folded`).
- All rendering happens locally in the page.

## Uninstall

Disable or remove the plugin in **Plugins**. The `localStorage` key can be cleared manually; leaving it is harmless.

## Files

- `client.js` — client half: the row, state, self-healing, and styles.
- `index.js` — host half (no host behavior).
- `cordis.patch.yml` — bundle patch.
- `locale/` — plugin-manager title and description.
- `screenshots.json` — market screenshots.
- `icon.svg` — plugin icon.

## License

MIT
