import { parse, materialize, normalize } from '@homebots/parse-html';
import { dispatch, react, watch } from '../store/store.js';
import { isRef } from '../vendor/state.js';

const AsyncFn = Object.getPrototypeOf(async () => {}).constructor;
type DetachFn = () => void;

function createScopeProxy(scope) {
  return new Proxy(scope, {
    get(target, p) {
      const value = target[p];

      if (isRef(value)) {
        return value.value;
      }

      return value;
    },
  });
}

function addEventListener(scope: any, el: HTMLElement, name: string, value: string) {
  const fn = Function('scope', '$event', `with (scope) { return (${value}) }`);
  el.addEventListener(name.slice(1), (e) => fn(scope, e));
}

function attachDispatcher(scope: any, el: HTMLElement, name: string, value: string) {
  const event = name.slice(1);
  const action = value.trim();

  if (value.includes(':')) {
    const [left, right] = action.split(':');
    const _fn = Function('scope', 'dispatch', `with (scope) { dispatch("${left}", ${right}) }`);
    const fn = () => _fn(scope, dispatch);
    el.addEventListener(event, fn);
  } else {
    el.addEventListener(event, () => dispatch(action as any));
  }
}

function bindProperty(scope: any, el: HTMLElement, name: string, value: string) {
  const fn = Function('scope', `with (scope) { return (${value}) }`);
  const property = name.slice(1);
  const initial = fn(scope);

  if (isRef(initial)) {
    el[property] = initial.value;
    watch(initial, (v) => (el[property] = v));
    return;
  }

  const apply = (value) => value.catch(() => '[error]').then((v) => (el[property] = v));
  const fnAsync = AsyncFn('scope', `with (scope) { return await (${value}) }`);
  const scopeProxy = createScopeProxy(scope);

  apply(fnAsync(scopeProxy));
  return react(() => apply(fnAsync(scopeProxy)));
}

export type HtmlBindings = [DocumentFragment, DetachFn];
export type TemplateFn = (scope: any) => HtmlBindings;

export const html = (text: string | TemplateStringsArray): TemplateFn => {
  const tree = normalize(parse(text[0] || String(text)));

  return (scope: any): HtmlBindings => {
    const detachHandlers: any[] = [];

    return [
      materialize(tree, (_el, node) => {
        const el = _el as HTMLElement;
        if (node.type !== 'element') {
          return;
        }

        for (const attr of node.attributes) {
          const { name, value } = attr;

          if (name.startsWith('@')) {
            addEventListener(scope, el, name, value);
            return;
          }

          if (name.startsWith('^')) {
            attachDispatcher(scope, el, name, value);
            return;
          }

          if (name.startsWith(':')) {
            const detach = bindProperty(scope, el, name, value);
            detachHandlers.push(detach);
          }
        }
      }),
      () => detachHandlers.forEach((f) => f()),
    ];
  };
};
