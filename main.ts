import { Store } from 'https://store.homebots.io/index.mjs';
import { listFiles, readMetadata, readFile, writeFile, createBin } from 'https://bin.homebots.io/index.mjs';
import {
  getProfile,
  getProperty,
  setProperty,
  signIn,
  signOut,
  events as authEvents,
} from 'https://auth.homebots.io/index.mjs';

type FileEntry = { contents: string; meta: Record<string, string> };
type FunctionEntry = { id: string; binId: string; name: string };

window.addEventListener('DOMContentLoaded', async () => {
  let currentFile: FileEntry = { meta: {}, contents: '' };
  let binId = new URL(location.href).searchParams.get('id');
  let store;

  const codeMirror = await getEditor();
  const homeBtn = document.getElementById('homeBtn');
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const filename = document.getElementById('filename')!;
  const editor = document.getElementById('editor')!;
  const files = document.getElementById('files')!;
  const signInBtn = document.getElementById('signInBtn')!;
  const fnAdd = document.getElementById('fnAdd')!;
  const fnName = document.getElementById('fnName')!;

  async function getFileList() {
    const list: FileEntry[] = [];
    const fileIds = await listFiles(binId);

    for (const fileId of fileIds) {
      const meta = await readMetadata(binId, fileId);
      const file = { meta, contents: '' };
      list.push(file);
      const contents = await readFile(binId, fileId);
      file.contents = await contents.text();
    }

    return list;
  }

  async function getEditor() {
    const editor = document.getElementById('editor');
    const codeMirror = (window as any).CodeMirror(editor, { lineNumbers: true });

    codeMirror.getWrapperElement().style.fontSize = '12px';
    window.addEventListener('resize', () => codeMirror.refresh());
    setTimeout(() => codeMirror.refresh(), 1);

    return codeMirror;
  }

  async function updateAuth() {
    try {
      await getProfile();
      signInBtn.innerText = 'Sign out';
    } catch {
      signInBtn.innerText = 'Sign in';
    }
  }

  codeMirror.on('change', () => {
    saveBtn.disabled = false;
    currentFile.contents = codeMirror.getValue();
  });

  function onSave() {
    if (currentFile.meta?.id) {
      const value = codeMirror.getValue();
      writeFile(binId, currentFile.meta.id, value);
      currentFile.contents = value;
    }
  }

  function onSelectFile(file) {
    editor.style.visibility = 'visible';
    filename.innerText = file.meta.name;
    currentFile = file;
    codeMirror.setValue(file.contents);
    saveBtn.disabled = true;
  }

  async function updateFileList() {
    const list = await getFileList();
    const frag = document.createDocumentFragment();
    files.innerHTML = 'Loading...';

    for (const file of list) {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1';
      a.innerHTML = `<span class="icon icon-file"></span><span class="file-link truncate text-sm font-medium">${
        file.meta.name || file.meta.id
      }</span>`;
      a.onclick = (event) => {
        event.preventDefault();
        onSelectFile(file);
      };

      frag.append(a);
    }

    files.innerHTML = '';
    files.append(frag);
  }

  async function setupStore() {
    let storeId = await getProperty('jsfn:storeId');

    if (!storeId) {
      storeId = await Store.create();
      await setProperty('jsfn:storeId', storeId);
    }

    store = Store.get(storeId);
  }

  async function setupAuth() {
    updateAuth();

    authEvents.addEventListener('signin', updateAuth);
    authEvents.addEventListener('signout', updateAuth);

    return new Promise((resolve) => {
      authEvents.addEventListener('signin', (e) => resolve(e.detail));
    });
  }

  async function setupFunctionSelector(functions: FunctionEntry[]) {
    const fnSelector = document.getElementById('fnSelector') as HTMLSelectElement;

    fnSelector.options.length = 0;
    fnSelector.onchange = () => {
      const option = fnSelector.options[fnSelector.selectedIndex];
      const fn = functions.find((f) => f.id === option.value);

      if (fn) {
        onSelectFunction(fn);
      }

      fnSelector.selectedIndex = 0;
    };

    const emptyOption = document.createElement('option');
    emptyOption.innerText = 'Select a function';
    emptyOption.value = '';
    fnSelector.options.add(emptyOption);

    functions.map((fn) => {
      console.log(fn);
      const option = document.createElement('option');
      option.innerText = fn.name;
      option.value = fn.id;
      fnSelector.options.add(option);
    });
  }

  async function onSelectFunction(fn) {
    binId = fn.binId;
    fnName.innerText = fn.name;
    updateFileList();
  }

  async function onAddFunction() {
    const id = crypto.randomUUID();
    const name = prompt('Function name');

    if (!name) return;

    const { binId } = await createBin();
    const fn = {
      id,
      binId,
      name,
    };

    await store.getResource('fn').set(id, fn);
    onSelectFunction(fn);
  }

  async function main() {
    saveBtn.disabled = true;
    saveBtn.onclick = onSave;
    fnAdd.onclick = onAddFunction;
    homeBtn.onclick = updateFileList;

    signInBtn.onclick = async () => {
      try {
        await getProfile();
        return signOut();
      } catch {
        signIn(true);
      }
    };

    await setupAuth();
    await setupStore();

    const allFunctions = await store.getResource('fn').list();

    if (allFunctions.length) {
      onSelectFunction(allFunctions[0]);
    }

    setupFunctionSelector(allFunctions);
  }

  main();
});
