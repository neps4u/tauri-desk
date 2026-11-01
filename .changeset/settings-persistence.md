---
'@tauri-desk/dashboard': patch
---

Settings persistence fixes:
- No longer rewrites `settings.json` on every launch — saves only when a setting actually changes.
- A failed load no longer gets silently overwritten with defaults; the error status is preserved until the user changes something.
- Pending saves are flushed before the window closes (Tauri `onCloseRequested`) or the tab goes to the background (browser `visibilitychange`), so changes made seconds before quitting are no longer lost.
