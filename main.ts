import './src/component/app.js';
import './src/component/header.js';
import './src/component/editor.js';
import './src/component/editor-toolbar.js';
import './src/component/filelist.js';
import './src/component/topbar.js';

import { onSetupAuth, onSetupStore } from './src/store.js';

window.addEventListener('DOMContentLoaded', async () => {
  await onSetupAuth();
  await onSetupStore();
});
