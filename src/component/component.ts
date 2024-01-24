import { parse, materialize, normalize } from '@homebots/parse-html';
import { dispatch, react, watch } from '../store/store.js';
import { isRef } from '../vendor/state.js';

const AsyncFn = Object.getPrototypeOf(async () => {}).constructor;
const noop = Symbol();
type DetachFn = () => void;

export const bind = (scope: any, el: HTMLElement, { name, value }) => {
  if (name.startsWith('@')) {
    const fn = Function('scope', '$event', `with (scope) { return (${value}) }`);
    el.addEventListener(name.slice(1), (e) => fn(scope, e));
    return noop;
  }

  if (name.startsWith('^')) {
    const event = name.slice(1);
    const action = value.trim();

    if (value.includes(':')) {
      const [left, right] = action.split(':');
      const _fn = Function('scope', 'dispatch', `with (scope) { dispatch("${left}", ${right}) }`);
      const fn = () => _fn(scope, dispatch);
      el.addEventListener(event, fn);
    } else {
      el.addEventListener(event, () => dispatch(action));
    }

    return noop;
  }

  if (name.startsWith(':')) {
    const fn = Function('scope', `with (scope) { return (${value}) }`);
    const property = name.slice(1);
    const initial = fn(scope);

    if (isRef(initial)) {
      el[property] = initial.value;
      watch(initial, (v) => (el[property] = v));
      return noop;
    }

    const apply = (value) => value.catch(() => '[error]').then((v) => (el[property] = v));
    const fnAsync = AsyncFn('scope', `with (scope) { return await (${value}) }`);
    const scopeProxy = new Proxy(scope, {
      get(target, p) {
        const value = target[p];

        if (isRef(value)) {
          return value.value;
        }

        return value;
      },
    });
    apply(fnAsync(scopeProxy));
    return react(() => apply(fnAsync(scopeProxy)));
  }
};

export type HtmlBindings = [DocumentFragment, DetachFn];
export type TemplateFn = (scope: any) => HtmlBindings;

export const html = (text: string | TemplateStringsArray): TemplateFn => {
  const tree = normalize(parse(text[0] || String(text)));

  return (scope: any): HtmlBindings => {
    const all: any[] = [];

    return [
      materialize(tree, (el, node) => {
        if (node.type === 'element') {
          node.attributes.forEach((attr) => {
            const next = bind(scope, el as HTMLElement, attr);
            next === noop || all.push(next);
          });
        }
      }),
      () => all.forEach((f) => f()),
    ];
  };
};
