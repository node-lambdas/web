import { property } from './decorators';

export class Selector extends HTMLElement {
  @property([]) options;

  constructor() {
    super();
    this.innerHTML = `<select class="bg-transparent w-full"></select>`;
    const s = this.querySelector('select') as HTMLSelectElement;
    s.onchange = () => {
      const index = Number(s.options[s.selectedIndex].value);
      this.dispatchEvent(new CustomEvent('select', { detail: this.options[index] }));
    };
  }

  connectedCallback() {}

  render() {
    const s = this.querySelector('select') as HTMLSelectElement;
    const options = [{ label: '-- select --' }].concat(this.options);
    s.innerHTML = options.map((option, index) => `<option value="${index}">${option.label}</option>`).join('');
  }
}

customElements.define('js-selector', Selector);
