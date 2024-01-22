import { EventDelegate } from 'es-eventdelegate';
import { EventEmitter, emitter, property } from '../decorators';
import { FileEntry } from '../types';
import { select } from '../store';

export class FileList extends HTMLElement {
  @property([]) private list: FileEntry[];
  @emitter() private select: EventEmitter<FileEntry>;

  fileList = select((s) => s.fileList);

  connectedCallback() {
    const d = new EventDelegate(this);
    d.add('click', 'a', (event) => this.onSelect(event));
  }

  onSelect(event) {
    console.log(event);
    this.select.emit(event);
  }

  render() {
    this.innerHTML =
      `<nav class="py-4 space-y-1">` +
      this.list
        .map(
          (file) => `<a data-id="${
            file?.meta?.id
          }" href="#" class="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1">
        <span class="icon icon-file"></span>
        <span class="file-link truncate text-sm font-medium">${file?.meta?.name || file?.meta?.id}</span>
      </a>`,
        )
        .join('') +
      `</nav>`;
  }
}

customElements.define('js-filelist', FileList);
