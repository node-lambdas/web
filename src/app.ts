import { listen, onEditorValueChange } from './store';

export class App extends HTMLElement {
  fileListRef;
  toolbarRef;
  editorRef;

  private stateRef: any;

  constructor() {
    super();

    this.innerHTML = `
    <div class="flex flex-col h-screen w-full">
      <div class="flex flex-1 overflow-hidden">
        <aside class="w-64 border-r overflow-y-auto">
          <js-header></js-header>
          <js-filelist></js-filelist>
        </aside>
        <main class="flex-1 flex flex-col items-stretch shadow-lg">
          <js-topbar></js-topbar>
          <div class="w-full flex-grow text-sm flex flex-col">
            <js-editortoolbar></js-editortoolbar>
            <js-editor class="flex-grow"></js-editor>
          </div>
        </main>
      </div>
    </div>
    `;

    this.stateRef = listen((event) => {
      const state = event.detail;
      console.log('s', state);
      this.fileListRef.list = state.fileList;
      this.toolbarRef.filename = state.currentFile?.meta?.name;
    });

    this.fileListRef = this.querySelector('js-filelist');
    this.toolbarRef = this.querySelector('js-editortoolbar');
    this.editorRef = this.querySelector('js-editor');
  }

  connectedCallback() {
    this.editorRef.addEventListener('change', () => onEditorValueChange(this.editorRef.value));
  }

  disconnectedCallback() {
    this.stateRef();
  }
}

customElements.define('js-app', App);
