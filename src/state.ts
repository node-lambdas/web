class Ref<RefValue> {
  private _value: RefValue | undefined;
  detach: () => void;

  constructor(initial?: RefValue) {
    this._value = initial;
  }

  set value(v: RefValue | undefined) {
    this._value = v;
  }

  get value() {
    return this._value;
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
  const state = new Proxy(initialState, {
    get(target, p) {
      return target[p];
    },

    set(target, p, value) {
      target[p] = value;
      events.dispatchEvent(new CustomEvent(stateChangeEvent, { detail: { ...target } }));
      return true;
    },
  });

  let events = new EventTarget();

  function set<K extends keyof T>(key: K, value: T[K]) {
    state[key] = value;
  }

  function get<K extends keyof T>(key: K): T[K] {
    return state[key];
  }

  function react(fn: (state: T) => any) {
    const handler = (e: any) => fn(e.detail);
    events.addEventListener(stateChangeEvent, handler);
    return () => events.removeEventListener(stateChangeEvent, handler);
  }

  function listen<V>(action: string, fn: (payload: V) => void) {
    const handler = (e: any) => fn(e.detail);
    events.addEventListener(action, handler);
    return () => events.removeEventListener(action, handler);
  }

  function dispatch(action: A, payload: any = null) {
    events.dispatchEvent(new CustomEvent(action, { detail: payload }));
    console.log(state);
  }

  function select<V>(selector: (state: T) => V): Ref<V> {
    const ref = new Ref(selector(state));
    ref.detach = react((state: T) => (ref.value = selector(state)));
    return ref;
  }

  Object.entries(actions).forEach(([action, handler]) => listen(action, handler as any));

  return { react, listen, select, dispatch, set, get };
}
