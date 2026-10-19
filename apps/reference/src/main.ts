import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';
import { auth, createDemoAuthProvider, i18n, initPlatform, settings } from '@tauri-desk/dashboard';

// One-time bootstrap, before the UI mounts.
await initPlatform();
auth.configure(createDemoAuthProvider());
await Promise.all([
  settings.bootstrap({ onReady: (s) => i18n.setLocale(s.locale) }),
  auth.restore()
]);

const app = mount(App, { target: document.getElementById('app')! });

export default app;
