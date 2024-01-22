import { EventDelegate } from 'es-eventdelegate';
import { EventEmitter, customElement, emitter, property } from '../decorators.js';
import { FileEntry } from '../types';
import { react } from '../store.js';
import { html } from './component.js';

const line = html`<a
  :id="file?.meta?.id"
  href="#"
  class="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1"
>
  <span class="icon icon-file"></span>
  <span class="file-link truncate text-sm font-medium" :innerText="file?.meta?.name || file?.meta?.id"></span>
</a>`;

@customElement('js-filelist')
export class FileList extends HTMLElement {
  @emitter() private select: EventEmitter<FileEntry>;

  connectedCallback() {
    const d = new EventDelegate(this);
    d.add('click', 'a', (event) => this.onSelect(event));

    this.innerHTML = `<nav class="py-4 space-y-1"></nav>`;
    const nav = this.firstChild as HTMLElement;

    react((s) => {
      nav.innerHTML = '';
      s.fileList.map((file) => nav.append(line(file)));
    });
  }

  onSelect(event) {
    console.log(event);
    this.select.emit(event);
  }
}
