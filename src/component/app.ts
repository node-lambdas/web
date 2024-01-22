import { customElement } from '../decorators';
import { dispatch, select } from '../store';
import { html } from './component';

const t = html`<div class="flex flex-col h-screen w-full">
  <div class="flex flex-1 overflow-hidden">
    <aside class="w-64 border-r overflow-y-auto">
      <js-header></js-header>
      <js-filelist></js-filelist>
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
  constructor() {
    super();
  }

  onChange(event) {
    dispatch('updatecontent', event.target.value);
  }

  connectedCallback() {
    this.append(t(this));
    dispatch('updatefilelist');
    dispatch('updatefunctionlist');
  }

  disconnectedCallback() {}
}
