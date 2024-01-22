import CodeMirror from '../../assets/codemirror.js';
import { property } from '../decorators.js';
import { dispatch } from '../store.js';

class Editor extends HTMLElement {
  private editor: any = null;
  private handler: any = null;

  @property('') value: string;

  get valueInternal() {
    return this.editor?.getValue();
  }

  set valueInternal(v) {
    this.editor?.setValue(v);
  }

  render() {
    this.editor.setValue(this.value);
  }

  connectedCallback() {
    if (this.isConnected) {
      const editor: any = new CodeMirror(this, { lineNumbers: true });
      this.editor = editor;

      editor.getWrapperElement().style.fontSize = '12px';
      editor.on('change', () => {
        dispatch('updatecontent', this.valueInternal);
        // this.dispatchEvent(new CustomEvent('change', { detail: this.valueInternal }));
      });
      this.editor.refresh();
      this.handler = window.addEventListener('resize', () => this.editor.refresh());
    }
  }

  disconnectedCallback() {
    if (!this.isConnected && this.handler) {
      this.handler();
      this.handler = null;
    }
  }
}

customElements.define('js-editor', Editor);
