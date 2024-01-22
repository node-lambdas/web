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
      const index = Number(selector.options[selector.selectedIndex + 1].value);
      this.onSelect(this.options[index].value);
    };

    react(() => this.render());
  }

  render() {
    const s = this.querySelector('select') as HTMLSelectElement;
    const options = [{ label: '-- select --', value: null }, ...this.options.value!];

    s.innerHTML = '';

    options.map((option, index) => {
      const o = document.createElement('option');
      o.value = String(index);
      o.innerText = option.label;
      s.append(o);
    });
  }
}
