import { isRef, ref } from '../vendor/state.js';
import { HtmlBindings } from './component.js';

export const Init = Symbol('@@init');
export const Destroy = Symbol('@@destroy');

function createEmitter(t: HTMLElement, e: string) {
  return {
    emit(detail: any) {
      t.dispatchEvent(new CustomEvent(e, { detail }));
    },
  };
}

export function emitter(name?: string) {
  return (target, property) => {
    Object.defineProperty(target.prototype, property, {
      get() {
        return createEmitter(this, name || property);
      },
    });
  };
}

export function child(selector: string) {
  return (target, property) => {
    Object.defineProperty(target.prototype, property, {
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
          this.__bindings = ref();
          this.__bindings.detach = detach;
        }
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
