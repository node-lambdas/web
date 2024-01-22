import { child, property } from './decorators';
import { onSave } from './store';

export class EditorToolbar extends HTMLElement {
  @property() filename: string;
  @child('#filename') nameRef: HTMLElement;

  render() {
    this.nameRef.innerText = this.filename;
  }

  connectedCallback() {
    this.innerHTML = `
    <div class="flex w-full bg-gray-100 p-2">
      <span class="font-bold text-sm text-gray-600 truncate flex-grow" id="filename"></span>
      <button
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-gray-400 bg-blue-500 text-white hover:bg-blue-600 px-3 py-1"
        id="saveBtn"
      >
        Save
      </button>
    </div>`;

    this.querySelector('#saveBtn')?.addEventListener('click', onSave);
  }
}

customElements.define('js-editortoolbar', EditorToolbar);
