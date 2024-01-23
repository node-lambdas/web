import MarkdownIt from 'markdown-it';
import { customElement } from './decorators';
import { html } from './component';
import { select, watch } from '../store/store.js';

const t = html` <div class="p-4 prose" :innerHTML="contents"></div> `;

@customElement('js-preview')
export class ReadmePreview extends HTMLElement {
  contents = '';
  file = select((s) => s.fileList.find((f) => f.meta?.name === 'readme.md'));

  connectedCallback() {
    this.append(t(this));
    const markdown = new MarkdownIt('default');

    watch(this.file, (v) => {
      const md = v?.contents || '';

      if (md) {
        this.contents = markdown.render(md);
      }
    });
  }
}
