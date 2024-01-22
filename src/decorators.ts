export class EventEmitter<T = any> {
  constructor(private t: HTMLElement, private e: string) {}

  emit(detail: T) {
    this.t.dispatchEvent(new CustomEvent(this.e, { detail }));
  }
}

export function emitter(name?: string) {
  return (target, property) => {
    Object.defineProperty(target, property, {
      get() {
        return new EventEmitter(this, name || property);
      },
    });
  };
}

export function property(defaultValue: any = null) {
  return (target, property) => {
    const t = '_' + property;
    Object.defineProperty(target, property, {
      get() {
        return this[t] || defaultValue;
      },
      set(v) {
        if (v === undefined && this[v] !== v) {
          this[v] = v;
        } else {
          this[t] = v !== undefined ? v : defaultValue;
        }

        this.render();
      },
    });
  };
}

export function child(selector) {
  return (target, property) => {
    Object.defineProperty(target, property, {
      set() {
        return true;
      },
      get() {
        return this.querySelector(selector);
      },
    });
  };
}
