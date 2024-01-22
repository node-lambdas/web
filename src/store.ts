import { Store } from 'https://store.homebots.io/index.mjs';
import {
  listFiles,
  writeMetadata,
  readMetadata,
  readFile,
  writeFile,
  createFile,
  createBin,
} from 'https://bin.homebots.io/index.mjs';
import {
  getProfile,
  getProperty,
  setProperty,
  signIn,
  signOut,
  isAuthenticated,
  events as authEvents,
} from 'https://auth.jsfn.run/index.mjs';

import { FileEntry, FunctionEntry } from './types';
import { useState } from './state.js';

const initialState = {
  fileList: [] as FileEntry[],
  functionList: [] as FunctionEntry[],
  currentFunction: {} as FunctionEntry,
  binId: '',
  storeId: '',
  profileId: '',
  currentFile: null as FileEntry | null,
};

const actions = {
  async create() {
    const id = crypto.randomUUID();
    const name = prompt('Function name');

    if (!name) return;

    const { binId } = await createBin();
    const fn = { id, binId, name };

    await getResourceStore().getResource('fn').set(id, fn);

    dispatch('select', fn);
  },

  select(fn: FunctionEntry) {
    set('binId', fn.binId);
    dispatch('updatefilelist');
  },

  async addfile(name: string) {
    if (!name) return;

    const binId = get('binId');
    if (!binId) return;

    const { fileId } = await createFile(binId);
    await writeMetadata(binId, fileId, { name });

    dispatch('updatefilelist');
  },

  async updatefilelist() {
    const list: FileEntry[] = [];
    const binId = get('binId');

    if (!binId) return;

    const fileIds = await listFiles(binId);

    for (const fileId of fileIds) {
      const meta = await readMetadata(binId, fileId);
      const file = { meta, contents: '' };
      list.push(file);
      const contents = await readFile(binId, fileId);
      file.contents = await contents.text();
    }

    set('fileList', list);
  },

  async updateauth() {
    try {
      const p = await getProfile();
      set('profileId', p.id);
    } catch {
      set('profileId', '');
    }
  },

  save() {
    const currentFile = get('currentFile');
    if (currentFile?.meta?.id) {
      writeFile(get('binId'), currentFile.meta.id, currentFile.contents);
    }
  },
  updatecontent(value) {
    const currentFile = get('currentFile');
    set('currentFile', {
      meta: currentFile?.meta,
      contents: value,
    });
  },
  async updatefunctionlist() {
    set('functionList', await getResourceStore().getResource('fn').list());
  },

  async signin() {
    try {
      const isAuth = await isAuthenticated();
      if (!isAuth) {
        signIn(true);
      }
    } catch {}
  },

  async signout() {
    await signOut();
  },

  selectfile(file) {
    set('currentFile', file);
  },
};

const { set, get, react, listen, select, dispatch } = useState(initialState, actions);

export { set, get, react, listen, select, dispatch };

export function getResourceStore() {
  return Store.get(get('storeId'));
}

export async function onSetupAuth() {
  const updateAuth = () => dispatch('updateauth');

  authEvents.addEventListener('signin', updateAuth);
  authEvents.addEventListener('signout', updateAuth);

  try {
    await isAuthenticated();
    updateAuth();
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

  set('storeId', storeId);
}
