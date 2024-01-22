import './selector.js';
import { dispatch, select } from '../store.js';
import { customElement } from '../decorators.js';
import { html } from './component.js';

const t = html`<div class="flex h-12 items-center px-3 border-b space-x-2">
  <js-selector class="w-full border-r"></js-selector>
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

  connectedCallback() {
    this.append(t(this));
  }

  onSignIn() {
    dispatch('signin');
  }

  disconnectedCallback() {}
}
