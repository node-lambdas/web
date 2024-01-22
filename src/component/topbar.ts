import './selector.js';
import { dispatch, select } from '../store.js';
import { customElement } from '../decorators.js';
import { html } from './component.js';

const t = html`<div class="flex h-12 justify-end items-center p-3 border-b space-x-2">
  <div class="flex-grow text-sm font-medium" :innerText="fnName"></div>
  <div class="flex items-center p-2 bg-gray-100 rounded">
    <js-selector class="w-64"></js-selector>
    <span class="w-0 h-4 mx-2 block border-l border-gray-400"></span>
    <button class="w-6 h-6" @click="onCreate()"><span class="material-icons">add</span></button>
  </div>

  <button
    @click="onSignIn()"
    class="flex items-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 p-2"
  >
    <span class="material-icons">person</span>
    <span class="sr-only">Sign In</span>
  </button>
</div>`;

@customElement('js-topbar')
export class Topbar extends HTMLElement {
  private fn: any;

  fnName = select((s) => s.currentFunction?.name || '');

  connectedCallback() {
    this.append(t(this));
  }

  onCreate() {
    dispatch('create');
  }

  onSignIn() {
    dispatch('signin');
  }

  disconnectedCallback() {}
}
