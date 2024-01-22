import { customElement } from '../decorators';
import { dispatch, onSetupAuth, onSetupStore, select } from '../store';
import { html } from './component';

const t = html`<div class="flex flex-col h-screen w-full">
  <div class="flex flex-1 overflow-hidden">
    <aside class="w-72 border-r overflow-y-auto">
      <js-header></js-header>
      <js-filelist></js-filelist>
    </aside>
    <main class="flex-1 flex flex-col items-stretch shadow-lg">
      <js-topbar></js-topbar>
      <div class="w-full flex-grow text-sm flex flex-col">
        <js-editortoolbar :hidden="noFileOpen"></js-editortoolbar>
        <js-editor :hidden="noFileOpen" class="flex-grow"></js-editor>
      </div>
    </main>
  </div>
</div>`;

@customElement('js-app')
export class App extends HTMLElement {
  noFileOpen = select((s) => !s.currentFile?.meta?.id);

  async onStart() {
    await onSetupAuth();
    await onSetupStore();

    dispatch('updatefilelist');
    dispatch('updatefunctionlist');
  }

  connectedCallback() {
    this.append(t(this));
    this.onStart();
  }

  disconnectedCallback() {}
}
