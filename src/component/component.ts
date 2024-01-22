import { parse, materialize, normalize } from '@homebots/parse-html';
import { dispatch, react, watch } from '../store';
import { isRef } from '../state';

const AsyncFn = Object.getPrototypeOf(async () => {}).constructor;

export const bind = (scope, el, { name, value }) => {
  if (name.startsWith('@')) {
    const fn = Function('scope', '$event', `with (scope) { return (${value}) }`);
    el.addEventListener(name.slice(1), (e) => fn(scope, e));
  }

  if (name.startsWith('^')) {
    const event = name.slice(1);
    el.addEventListener(event, () => dispatch(value.trim()));
    return;
  }

  if (name.startsWith(':')) {
    const fn = AsyncFn('scope', `with (scope) { return await (${value}) }`);
    const property = name.slice(1);
    const initial = fn(scope);

    if (isRef(initial)) {
      watch(initial, (v) => (el[property] = v));
      return;
    }

    react(async () => {
      let value = fn(scope);
      value.catch(() => '[error]').then((v) => (el[property] = isRef(v) ? v.value : v));
    });
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
