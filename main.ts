import './src/app.js';
import './src/header.js';
import './src/editor.js';
import './src/editor-toolbar.js';
import './src/filelist.js';
import './src/topbar.js';

import { onSetupAuth, onSetupStore } from './src/store.js';

window.addEventListener('DOMContentLoaded', async () => {
  await onSetupAuth();
  await onSetupStore();
});
