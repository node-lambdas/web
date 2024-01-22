import { customElement } from '../decorators';
import { dispatch, react, select, watch } from '../store';
import { html } from './component';

const t = html`
  <div class="flex items-center p-2">
    <select class="bg-transparent font-small w-full p-3"></select>
    <span class="w-0 h-4 mx-2 block border-l border-gray-400"></span>
    <button class="w-6 h-6" @click="onCreate()"><span class="material-icons">add</span></button>
  </div>
`;

@customElement('js-selector')
export class Selector extends HTMLElement {
  options = select((s) => s.functionList);

  connectedCallback() {
    this.append(t(this));
    const selector = this.querySelector('select') as HTMLSelectElement;

    selector.onchange = () => {
      const index = selector.selectedIndex;
      const options = this.options.value || [];

      if (index > 0) {
        const v = options[index - 1];
        dispatch('selectfunction', v);
      }
    };

    watch(this.options, () => this.updateOptions());
  }

  onCreate() {
    dispatch('create');
  }

  updateOptions() {
    const s = this.querySelector('select') as HTMLSelectElement;
    const mappedOptions = this.options.value!.map((f) => ({ label: f.name, value: f }));
    const options = [{ label: '-- select --', value: null }, ...mappedOptions];

    s.innerHTML = '';

    options.map((option) => {
      const o = document.createElement('option');
      o.innerText = option.label;
      s.append(o);
    });
  }
}
