import { parse, materialize, normalize } from '@homebots/parse-html';
import { dispatch, react, watch } from '../store/store.js';
import { isRef } from '../state.js';

const AsyncFn = Object.getPrototypeOf(async () => {}).constructor;

export const bind = (scope, el, { name, value }) => {
  if (name.startsWith('@')) {
    const fn = Function('scope', '$event', `with (scope) { return (${value}) }`);
    el.addEventListener(name.slice(1), (e) => fn(scope, e));
  }

  if (name.startsWith('^')) {
    const event = name.slice(1);
    let fn;
    if (value.includes(':')) {
      const [left, right] = value.trim().split(':');
      const _fn = Function('scope', 'dispatch', `with (scope) { dispatch("${left}", ${right}) }`);
      fn = () => _fn(scope, dispatch);
    } else {
      fn = () => dispatch(value.trim());
    }

    el.addEventListener(event, fn);
    return;
  }

  if (name.startsWith(':')) {
    const fn = Function('scope', `with (scope) { return (${value}) }`);
    const property = name.slice(1);
    const initial = fn(scope);

    if (isRef(initial)) {
      el[property] = initial.value;
      return watch(initial, (v) => (el[property] = v));
    }

    const apply = (value) => value.catch((e) => e).then((v) => (el[property] = v));
    const fnAsync = AsyncFn('scope', `with (scope) { return await (${value}) }`);
    apply(fnAsync(scope));
    react(() => apply(fnAsync(scope)));
  }
};

export const html = (text: string | TemplateStringsArray) => {
  const tree = normalize(parse(text[0] || String(text)));

  return (scope: any): DocumentFragment =>
    materialize(tree, (el, node) => {
      if (node.type === 'element') {
        node.attributes.forEach((attr) => bind(scope, el, attr));
      }
    });
};
