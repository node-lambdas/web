import { customElement } from './decorators.js';
import { dispatch, select, watch } from '../store.js';
import { html } from './component.js';

const t = html`
  <div class="flex items-center p-2">
    <button class="w-6 h-6" ^click="create"><span class="material-icons">add</span></button>
    <select class="bg-transparent font-small w-full p-3" :hidden="noFunctions"></select>
    <button class="w-6 h-6" ^click="editname" :hidden="noFunctionSelected">
      <span class="material-icons">edit</span>
    </button>
    <span class="w-0 h-4 mx-2 border-l border-gray-400" :hidden="noFunctions"></span>
  </div>
`;

@customElement('js-selector')
export class Selector extends HTMLElement {
  options = select((s) => s.functionList);
  noFunctions = select((s) => !s.functionList?.length);
  noFunctionSelected = select((s) => !s.currentFunction?.id);
  selected = select((s) => s.currentFunction?.id || '');

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

  updateOptions() {
    const s = this.querySelector('select') as HTMLSelectElement;
    const mappedOptions = this.options.value!.map((f) => ({ label: f.name, value: f }));
    const options = [
      { label: `${this.getAttribute('placeholder') || 'Select an option'}`, value: { id: '' } },
      ...mappedOptions,
    ];

    s.innerHTML = '';

    options.map((option) => {
      const o = document.createElement('option');
      o.innerText = option.label;
      o.selected = this.selected.value === option.value.id;
      s.append(o);
    });
  }
}
