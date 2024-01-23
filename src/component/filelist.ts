import { customElement } from './decorators.js';
import { dispatch, select, watch } from '../store.js';
import { html } from './component.js';

const t = html`
  <div class="flex items-center justify-between py-2 px-4 h-12 border-b border-gray-100">
    <h2 class="text-sm font-medium">Files</h2>
    <button class="w-6 h-6" ^click="addfile"><span class="material-icons">add</span></button>
  </div>
  <nav class="space-y-1 py-1"></nav>
`;

const line = html`<a
  href="#"
  ^click="selectfile:file"
  class="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-1"
>
  <span class="icon icon-file"></span>
  <span class="file-link truncate text-sm font-medium" :innerText="file?.meta?.name || file?.meta?.id"></span>
</a>`;

@customElement('js-filelist')
export class FileList extends HTMLElement {
  fileList = select((s) => s.fileList);

  connectedCallback() {
    this.append(t(this));
    const nav = this.querySelector('nav') as HTMLElement;

    watch(this.fileList, (list) => {
      nav.innerHTML = '';

      for (const file of list) {
        const f = line({ file, dispatch });

        nav.append(f);
      }
    });
  }
}
