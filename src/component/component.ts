import { parse, materialize, normalize } from '@homebots/parse-html';
import { react } from '../store';
import { isRef } from '../state';

const AsyncFn = Object.getPrototypeOf(async () => {}).constructor;

export const bind = (scope, el, { name, value }) => {
  if (name.startsWith('@')) {
    const fn = Function('scope', '$event', `with (scope) { return (${value}) }`);
    el.addEventListener(name.slice(1), (e) => fn(scope, e));
  }

  if (name.startsWith(':')) {
    const fn = AsyncFn('scope', `with (scope) { return await (${value}) }`);
    const property = name.slice(1);

    react(async () => {
      let p = fn(scope);

      p.catch(() => '[error]').then((v) => {
        if (isRef(v)) {
          el[property] = v.value;
        } else {
          el[property] = v;
        }
      });
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
