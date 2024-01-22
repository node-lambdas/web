import { customElement, property } from '../decorators';

@customElement('js-selector')
export class Selector extends HTMLElement {
  @property([]) options;

  onSelect(value) {
    this.dispatchEvent(new CustomEvent('select', { detail: value }));
  }

  connectedCallback() {
    this.innerHTML = `<select class="bg-transparent w-full"></select>`;
    const s = this.querySelector('select') as HTMLSelectElement;

    s.onchange = () => {
      const index = Number(s.options[s.selectedIndex + 1].value);
      this.onSelect(this.options[index].value);
    };
  }

  render() {
    const s = this.querySelector('select') as HTMLSelectElement;
    const options = [{ label: '-- select --' }].concat(this.options);
    s.innerHTML = options.map((option, index) => `<option value="${index}">${option.label}</option>`).join('');
  }
}
