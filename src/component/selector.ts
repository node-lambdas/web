import { customElement } from '../decorators';
import { react, select } from '../store';

@customElement('js-selector')
export class Selector extends HTMLElement {
  options = select((s) => s.functionList.map((f) => ({ label: f.name, value: f })));

  onSelect(value) {
    this.dispatchEvent(new CustomEvent('select', { detail: value }));
  }

  connectedCallback() {
    this.innerHTML = `<select class="bg-transparent w-full"></select>`;
    const selector = this.querySelector('select') as HTMLSelectElement;

    selector.onchange = () => {
      const index = selector.selectedIndex;
      if (index === 0) return;
      this.onSelect(this.options[index - 1].value);
    };

    react(() => this.render());
  }

  render() {
    const s = this.querySelector('select') as HTMLSelectElement;
    const options = [{ label: '-- select --', value: null }, ...this.options.value!];

    s.innerHTML = '';

    options.map((option) => {
      const o = document.createElement('option');
      o.innerText = option.label;
      s.append(o);
    });
  }
}
