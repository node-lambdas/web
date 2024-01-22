export class Header extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <header class="flex h-12 items-center px-4 border-b">
      <a href="#" id="homeBtn"
        ><img class="w-6 h-6 rounded" src="https://avatars.githubusercontent.com/u/69599650?s=24&v=4" alt="" />
      </a>
      <span class="text-sm flex-grow ml-2 font-bold">jsfn.run</span>
      <button class="w-6 h-6"><span class="material-icons">add</span></button>
    </header>
    `;
  }
}

customElements.define('js-header', Header);
