import { customElement } from '../decorators.js';
import { dispatch, select, watch } from '../store.js';
import { html } from './component.js';

const t = html`
  <div class="flex items-center justify-end p-2">
    <button class="w-6 h-6" @click="onAddFile()"><span class="material-icons">add</span></button>
  </div>
  <nav class="py-4 space-y-1"></nav>
`;

const line = html`<a
  href="#"
  @click="dispatch('selectfile', file)"
  class="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1"
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

  onAddFile() {
    dispatch('addfile', prompt('File name'));
  }
}
