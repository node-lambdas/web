import { child, customElement } from '../decorators';
import { dispatch, select } from '../store';
import { html } from './component';

const t = html`<div class="flex flex-col h-screen w-full">
  <div class="flex flex-1 overflow-hidden">
    <aside class="w-64 border-r overflow-y-auto">
      <js-header></js-header>
      <js-filelist :list="fileList"></js-filelist>
    </aside>
    <main class="flex-1 flex flex-col items-stretch shadow-lg">
      <js-topbar></js-topbar>
      <div class="w-full flex-grow text-sm flex flex-col">
        <js-editortoolbar></js-editortoolbar>
        <js-editor @change="onChange($event)" class="flex-grow"></js-editor>
      </div>
    </main>
  </div>
</div>`;

@customElement('js-app')
export class App extends HTMLElement {
  @child('js-editor') edRef;

  fileList = select((s) => s.fileList);
  fileName = select((s) => s.currentFile?.meta?.name || '');

  constructor() {
    super();
  }

  onChange(event) {
    dispatch('updatecontent', event.target.value);
  }

  connectedCallback() {
    this.append(t(this));
  }

  disconnectedCallback() {}
}
