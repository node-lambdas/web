import { dispatch } from '../store';
import { html } from './component.js';

const t = html`<div class="flex w-full border-b p-2 space-x-4">
  <button
    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-gray-400 bg-blue-500 text-white hover:bg-blue-600 px-3 py-1"
    @click="onSave()"
  >
    Save
  </button>
  <span class="font-bold text-sm text-gray-600 truncate flex-grow" :innerText="filename"></span>
</div>`;

export class EditorToolbar extends HTMLElement {
  connectedCallback() {
    this.append(t(this));
  }

  onSave() {
    dispatch('save');
  }
}

customElements.define('js-editortoolbar', EditorToolbar);
