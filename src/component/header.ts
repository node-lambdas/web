import { getDownloadUrl } from 'https://bin.homebots.io/index.mjs';
import { customElement } from './decorators.js';
import { select } from '../store.js';
import { html } from './component.js';

const t = html`
  <header class="flex h-12 items-center px-4 border-b">
    <a href="#" ^click="reload">
      <img class="w-6 h-6 rounded" src="https://avatars.githubusercontent.com/u/69599650?s=24&v=4" alt="" />
    </a>
    <div class="flex items-center text-sm flex-grow ml-2">
      <span class="font-bold" :innerText="fnName"></span>
      <span class="text-gray-700">.jsfn.run</span>
    </div>

    <a
      class="w-4 h-4"
      title="Copy download link"
      :hidden="!downloadUrl.value"
      :href="downloadUrl"
      @click="onLinkCopy($event)"
    >
      <img src="/copy.svg" />
    </a>
  </header>
`;

@customElement('js-header')
export class Header extends HTMLElement {
  fnName = select((s) => s.currentFunction?.name || '');
  downloadUrl = select((s) => (s.binId ? getDownloadUrl(s.binId) : ''));

  connectedCallback() {
    this.append(t(this));
  }

  onLinkCopy(e) {
    e.preventDefault();
    navigator.clipboard.writeText(this.downloadUrl.value);
  }
}
