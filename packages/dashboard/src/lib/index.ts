/* @tauri-desk/dashboard — public API */

// utilities
export { cn } from './utils/cn';

// platform
export { initPlatform, platform, type Platform } from './platform.svelte';

// theme
export * from './theme/theme.svelte';

// settings + persistence
export {
  settings,
  DEFAULT_LOCALE,
  SETTINGS_STORAGE_KEY,
  type DashboardSettings,
  type BootstrapOptions
} from './settings/settings.svelte';
export {
  createStorageAdapter,
  LocalStorageAdapter,
  MemoryAdapter,
  TauriStoreAdapter,
  type StorageAdapter
} from './settings/storage';

// layout
export { default as AppShell } from './layout/AppShell.svelte';
export { default as Sidebar } from './layout/Sidebar.svelte';
export { default as Topbar } from './layout/Topbar.svelte';
export { default as Titlebar } from './layout/Titlebar.svelte';
export { default as WindowControls } from './layout/WindowControls.svelte';
export { isActive, type Crumb, type NavConfig, type NavItem, type NavSection } from './layout/nav';

// components
export { default as Button } from './components/Button.svelte';
export { default as Card } from './components/Card.svelte';
export { default as SegmentedControl } from './components/SegmentedControl.svelte';

// features — i18n
export { i18n, t, DEFAULT_MESSAGES, type Messages } from './features/i18n/i18n.svelte';

// features — toasts (re-export svelte-sonner's toast API)
export { default as Toaster } from './features/toasts/Toaster.svelte';
export { toast } from 'svelte-sonner';

// features — notifications
export {
  ensureNotificationPermission,
  notify,
  type NotifyOptions
} from './features/notifications/notifications';

// features — auth
export {
  auth,
  createDemoAuthProvider,
  type AuthProvider,
  type AuthStatus,
  type AuthUser
} from './features/auth/auth.svelte';
export { default as LoginPage } from './features/auth/LoginPage.svelte';

// features — updater
export { updater, type UpdateStatus } from './features/updater/updater.svelte';

// features — command palette
export { default as CommandPalette } from './features/command/CommandPalette.svelte';
export { type CommandItem } from './features/command/command';

// features — settings pages
export { default as AppearanceSettings } from './features/settings/AppearanceSettings.svelte';
export { default as GeneralSettings } from './features/settings/GeneralSettings.svelte';
export { default as AboutSettings } from './features/settings/AboutSettings.svelte';
