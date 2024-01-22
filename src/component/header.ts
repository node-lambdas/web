import { dispatch } from '../store';
import { html } from './component';

const t = html`
  <header class="flex h-12 items-center px-4 border-b">
    <a href="#" @click="onReload()">
      <img class="w-6 h-6 rounded" src="https://avatars.githubusercontent.com/u/69599650?s=24&v=4" alt="" />
    </a>
    <span class="text-sm flex-grow ml-2 font-bold">jsfn.run</span>
    <button class="w-6 h-6" @click="onAddFile()"><span class="material-icons">add</span></button>
  </header>
`;

export class Header extends HTMLElement {
  connectedCallback() {
    this.append(t(this));
  }

  onAddFile() {
    dispatch('addfile', prompt('File name'));
  }

  onReload() {
    dispatch('updatefilelist');
    dispatch('updatefunctionlist');
  }
}

customElements.define('js-header', Header);
