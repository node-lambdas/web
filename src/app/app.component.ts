import { Component } from '@homebots/elements';

@Component({
  tag: 'x-app',
  template: `<h1>Hello</h1>
    <slot></slot>`,
})
export class AppComponent extends HTMLElement {}
