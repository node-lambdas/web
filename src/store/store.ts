import { Store } from 'https://store.homebots.io/index.mjs';
import {
  listFiles,
  writeMetadata,
  readMetadata,
  readFile,
  writeFile,
  createFile,
  createBin,
  getDownloadUrl,
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

import { useState } from '../vendor/state.js';

export type FileEntry = {
  contents: string;
  meta?: Record<string, string>;
};

export type FunctionEntry = {
  id: string;
  binId: string;
  name: string;
};

const initialState = {
  fileList: [] as FileEntry[],
  functionList: [] as FunctionEntry[],
  currentFunction: {} as FunctionEntry | null,
  currentFile: null as FileEntry | null,
  binId: '',
  storeId: '',
  profileId: '',
};

const actions = {
  async create() {
    const id = crypto.randomUUID();
    const name = prompt('New function name');

    if (!name) return;

    const { binId } = await createBin();
    const fn = { id, binId, name };

    await getResourceStore().getResource('fn').set(id, fn);

    await dispatch('selectFunction', fn);
    await dispatch('addfile', 'index.mjs');

    const files = get('fileList');
    await dispatch('selectfile', files[0] || null);
  },

  async editname() {
    const fn = get('currentFunction');

    if (!fn) return;

    const name = prompt('Name', fn.name) || '';

    if (!name) return;

    const newValue = { ...fn, name };
    await getResourceStore().getResource('fn').set(fn.id, newValue);
    set('currentFunction', newValue);
    await dispatch('updatefunctionlist');
  },

  async addfile(name: string) {
    const binId = get('binId');
    if (!binId) {
      return;
    }

    if (!name) {
      name = prompt('Name for the new file', '') || '';
    }

    if (!name) {
      return;
    }

    const { fileId } = await createFile(binId);
    await writeMetadata(binId, fileId, { name });
    await dispatch('updateFileList');
  },

  async updateFileList() {
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

  async updateProfileId() {
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

  async selectFunction(fn: FunctionEntry) {
    set('binId', fn.binId);
    set('currentFile', null);
    set('currentFunction', fn);

    await dispatch('updateFileList');
  },

  async reload() {
    await dispatch('updateFileList');
    await dispatch('updatefunctionlist');
  },

  async deploy() {
    const binId = get('binId');
    const fn = get('currentFunction');

    if (!(binId && fn)) {
      return;
    }

    const name = fn.name;
    const source = getDownloadUrl(binId);
    const body = JSON.stringify({ source, name });
    const headers = {
      'content-type': 'application/json',
    };

    await fetch('https://cloud.jsfn.run', { method: 'POST', body, headers });
  },
};

const { set, get, react, watch, select, dispatch } = useState(initialState, actions);

export { set, get, react, watch, select, dispatch };

function getResourceStore() {
  return Store.get(get('storeId'));
}

export async function onSetupAuth() {
  authEvents.addEventListener('signout', () => dispatch('updateProfileId'));
  authEvents.addEventListener('signin', async () => {
    await dispatch('updateProfileId');
    await dispatch('reload');
  });

  try {
    await isAuthenticated();
    dispatch('updateProfileId');
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
