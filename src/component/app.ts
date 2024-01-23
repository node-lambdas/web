import { customElement } from './decorators.js';
import { dispatch, onSetupAuth, onSetupStore, select } from '../store.js';
import { html } from './component.js';

const t = html`<div class="flex h-screen w-screen">
  <aside class="w-72 border-r overflow-y-auto">
    <js-header></js-header>
    <js-filelist :hidden="noFunctionSelected"></js-filelist>
  </aside>
  <main class="flex-1 flex flex-col items-stretch shadow-lg">
    <js-topbar></js-topbar>
    <div class="w-full flex-grow text-sm flex flex-col">
      <js-editortoolbar :hidden="noFileOpen"></js-editortoolbar>
      <js-editor :hidden="noFileOpen" class="flex-grow overflow-y-auto"></js-editor>
    </div>
  </main>
</div>`;

@customElement('js-app')
export class App extends HTMLElement {
  noFileOpen = select((s) => !s.currentFile?.meta?.id);
  noFunctionSelected = select((s) => !s.currentFunction.id);

  async onStart() {
    await onSetupAuth();
    await onSetupStore();
    dispatch('reload');
  }

  connectedCallback() {
    this.append(t(this));
    this.onStart();
  }

  disconnectedCallback() {}
}
