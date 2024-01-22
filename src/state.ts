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

type Watcher<T> = {
  previous: T | undefined;
  current: T | undefined;
};

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

  function watch<V extends any>(input: Ref<V> | ((state: T) => V), observer: (v: V, p: V | undefined) => void) {
    const tracker: Watcher<V> = {
      previous: undefined,
      current: undefined,
    };

    if (isRef(input)) {
      tracker.previous = input.value;
      input.observe((value) => {
        if (value !== tracker.previous) {
          observer(value, tracker.previous);
          tracker.previous = tracker.current;
          tracker.current = value;
        }
      });
      return;
    }

    tracker.previous = input(state);
    return react(() => {
      const v = input(state);
      if (v !== tracker.previous) {
        observer(v!, tracker.previous);
        tracker.previous = tracker.current;
        tracker.current = v;
      }
    });
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
  }

  function select<V>(selector: (state: T) => V): Ref<V> {
    const ref = new Ref(selector(state));
    ref.detach = react((state: T) => (ref.value = selector(state)));
    return ref;
  }

  Object.entries(actions).forEach(([action, handler]) => listen(action, handler as any));

  return { react, listen, select, dispatch, set, get, watch };
}
