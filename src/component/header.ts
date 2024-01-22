import { customElement } from '../decorators';
import { dispatch, select } from '../store';
import { html } from './component';

const t = html`
  <header class="flex h-12 items-center px-4 border-b">
    <a href="#" @click="onReload()">
      <img class="w-6 h-6 rounded" src="https://avatars.githubusercontent.com/u/69599650?s=24&v=4" alt="" />
    </a>
    <span class="flex items-center text-sm flex-grow ml-2">
      <span class="font-bold" :innerText="fnName"></span>
      <span class="text-gray-700">.jsfn.run</span>
    </span>
  </header>
`;

@customElement('js-header')
export class Header extends HTMLElement {
  fnName = select((s) => s.currentFunction.name || '');

  connectedCallback() {
    this.append(t(this));
  }

  onReload() {
    dispatch('updatefilelist');
    dispatch('updatefunctionlist');
  }
}
