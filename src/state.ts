class Ref<RefValue> {
  private _value: RefValue | undefined;
  private _obs: any[] = [];

  detach: () => void;

  constructor(initial?: RefValue) {
    this._value = initial;
  }

  set value(v: RefValue | undefined) {
    this._value = v;
    this._obs.forEach((f) => f(v));
  }

  get value() {
    return this._value;
  }

  observe(fn: (value: RefValue) => void) {
    this._obs.push(fn);
  }

  toString() {
    return String(this._value);
  }
}

export function isRef(v): v is Ref<any> {
  return v && v instanceof Ref;
}

export function useState<T extends object, A extends string>(initialState: T, actions: Record<A, Function>) {
  const stateChangeEvent = '@@statechange';
  const events = new EventTarget();
  const onStateChange = (detail: any) => events.dispatchEvent(new CustomEvent(stateChangeEvent, { detail }));

  const state = new Proxy(initialState, {
    get(target, p) {
      return target[p];
    },

    set(target, p, value) {
      target[p] = value;
      onStateChange({ ...target });
      return true;
    },
  });

  function set<K extends keyof T>(key: K, value: T[K]) {
    state[key] = value;
  }

  function get<K extends keyof T>(key: K): T[K] {
    return state[key];
  }

  function watch<V extends any>(input: Ref<V> | ((state: T) => V), observer: (v: V, p: V | undefined) => void) {
    let lastValue: V;

    if (isRef(input)) {
      lastValue = input.value!;
      observer(lastValue, undefined);
      input.observe((value) => {
        if (value !== lastValue) {
          observer(value, lastValue);
          lastValue = value;
        }
      });
      return;
    }

    lastValue = input(state);
    observer(lastValue, undefined);
    return react(() => {
      const v = input(state);
      if (v !== lastValue) {
        observer(v!, lastValue);
        lastValue = v;
      }
    });
  }

  function react(fn: (state: T) => any) {
    const handler = (e: any) => fn(e.detail);
    events.addEventListener(stateChangeEvent, handler);
    return () => events.removeEventListener(stateChangeEvent, handler);
  }

  async function dispatch(action: A, payload: any = null) {
    await actions[action](payload);
    onStateChange(state);
  }

  function select<V>(selector: (state: T) => V): Ref<V> {
    const ref = new Ref(selector(state));
    ref.detach = react((state: T) => (ref.value = selector(state)));
    return ref;
  }

  return { react, select, dispatch, set, get, watch };
}
