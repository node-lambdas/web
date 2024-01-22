import { Store } from 'https://store.homebots.io/index.mjs';
import { listFiles, readMetadata, readFile, writeFile, createBin } from 'https://bin.homebots.io/index.mjs';
import {
  getProfile,
  getProperty,
  setProperty,
  signIn,
  signOut,
  events as authEvents,
} from 'https://auth.jsfn.run/index.mjs';
import { FileEntry, FunctionEntry } from './types';

const initialState = {
  fileList: [] as FileEntry[],
  functionList: [] as FunctionEntry[],
  currentFunction: {} as FunctionEntry,
  binId: '',
  storeId: '',
  profileId: '',
  currentFile: null as FileEntry | null,
};

const state = new Proxy(initialState, {
  get(target, p) {
    return target[p];
  },
  set(target, p, value) {
    target[p] = value;
    events.dispatchEvent(new CustomEvent('change', { detail: { ...target } }));
    return true;
  },
});

let events = new EventTarget();

export function listen(fn) {
  return events.addEventListener('change', fn);
}

export function getResourceStore() {
  return Store.get(state.storeId);
}

export async function onCreateFunction() {
  const id = crypto.randomUUID();
  const name = prompt('Function name');

  if (!name) return;

  const { binId } = await createBin();
  const fn = { id, binId, name };

  await getResourceStore().getResource('fn').set(id, fn);
  onSelectFunction(fn);
}

export async function onSelectFunction(fn) {
  state.binId = fn.binId;
  onUpdateFileList();
}

async function getFileList() {
  const list: FileEntry[] = [];
  const fileIds = await listFiles(state.binId);

  for (const fileId of fileIds) {
    const meta = await readMetadata(state.binId, fileId);
    const file = { meta, contents: '' };
    list.push(file);
    const contents = await readFile(state.binId, fileId);
    file.contents = await contents.text();
  }

  return list;
}

async function onUpdateAuth() {
  try {
    const p = await getProfile();
    state.profileId = p.id;
  } catch {
    state.profileId = '';
  }
}

export function onSave() {
  if (state.currentFile?.meta?.id) {
    writeFile(state.binId, state.currentFile.meta.id, state.currentFile.contents);
  }
}

export function onEditorValueChange(value) {
  state.currentFile = {
    meta: state.currentFile?.meta,
    contents: value,
  };
}

export async function onUpdateFileList() {
  state.fileList = await getFileList();
}

export async function onUpdateFunctionList() {
  state.functionList = await getResourceStore().getResource('fn').list();
}

export async function onSetupAuth() {
  onUpdateAuth();

  authEvents.addEventListener('signin', onUpdateAuth);
  authEvents.addEventListener('signout', onUpdateAuth);

  try {
    return await getProfile();
  } catch {
    return new Promise((resolve) => {
      authEvents.addEventListener('signin', (e) => resolve(e.detail));
    });
  }
}

export async function onSetupStore() {
  let storeId = await getProperty('jsfn:storeId');

  if (!storeId) {
    storeId = await Store.create();
    await setProperty('jsfn:storeId', storeId);
  }

  state.storeId = storeId;
}

export async function onSignIn() {
  try {
    await getProfile();
    return signOut();
  } catch {
    signIn(true);
  }
}

export function onSelectFile(file) {
  state.currentFile = file;
  // filename.innerText = file.meta.name;
  // codeMirror.setValue(file.contents);
  // saveBtn.disabled = true;
}
