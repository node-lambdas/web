import { isRef, ref } from '../vendor/state.js';
import { HtmlBindings } from './component.js';

export const Init = Symbol('@@init');
export const Destroy = Symbol('@@destroy');

export class EventEmitter<T = any> {
  constructor(private t: HTMLElement, private e: string) {}

  emit(detail: T) {
    this.t.dispatchEvent(new CustomEvent(this.e, { detail }));
  }
}

export function emitter(name?: string) {
  return (target, property) => {
    Object.defineProperty(target.prototype, property, {
      get() {
        return new EventEmitter(this, name || property);
      },
    });
  };
}

export function property(defaultValue: any = null) {
  return (target, property) => {
    const t = '_' + property;
    Object.defineProperty(target.constructor.prototype || target.prototype, property, {
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

export function child(selector: string) {
  return (target, property) => {
    Object.defineProperty(target.constructor.prototype || target.prototype, property, {
      set() {
        return true;
      },
      get() {
        return this.querySelector(selector);
      },
    });
  };
}

export function customElement(tag: string, template?: (scope) => HtmlBindings) {
  return (Target: any, _t: any) => {
    const connect = Target.prototype.connectedCallback;
    const disconnect = Target.prototype.disconnectedCallback;

    Target.prototype.connectedCallback = function () {
      if (this.isConnected) {
        if (template) {
          const [el, detach] = template(this);
          this.append(el);
          this._bindings = ref();
          this._bindings.detach = detach;
        }

        // Target[Init].forEach((fn) => (typeof fn === 'function' ? fn(this) : fn[0](this, fn[1])));
      }

      connect && connect.call(this);
    };

    Target.prototype.disconnectedCallback = function () {
      if (this.isConnected) {
        return;
      }

      disconnect && disconnect.call(this);

      Object.values(this).forEach((v) => isRef(v) && v.detach());
    };

    Promise.resolve().then(() => customElements.define(tag, Target));
  };
}
