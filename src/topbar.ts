import './selector.js';
import { listen, onCreateFunction, onSignIn } from './store.js';

export class Topbar extends HTMLElement {
  private fn: any;

  connectedCallback() {
    this.innerHTML = `
    <div class="flex h-12 justify-end items-center p-3 border-b space-x-2">
      <div class="flex-grow text-sm font-medium" id="fnName"></div>
      <div class="flex items-center p-2 bg-gray-100 rounded">
        <js-selector class="w-64"></js-selector>
        <span class="w-0 h-4 mx-2 block border-l border-gray-400"></span>
        <button class="w-6 h-6" id="fnAdd"><span class="material-icons">add</span></button>
      </div>

      <button id="signInBtn" class="flex items-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 p-2">
        <span class="material-icons">person</span>
        <span class="sr-only">Sign In</span>
      </button>
    </div>`;

    const selector = this.querySelector('js-selector') as any;
    const fnName = this.querySelector('#fnName') as any;
    const fnAdd = this.querySelector('#fnAdd') as any;
    const signInBtn = this.querySelector('#signInBtn') as any;

    this.fn = listen((state) => {
      selector.options = state.functionList;
      fnName.innerText = state.currentFunction?.name || '';
    });

    fnAdd.onclick = onCreateFunction;
    signInBtn.onclick = onSignIn;
  }

  disconnectedCallback() {
    this.fn();
  }
}

customElements.define('js-topbar', Topbar);
