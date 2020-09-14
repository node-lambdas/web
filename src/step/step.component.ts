import { Component, EventEmitter, Input, Output } from '@homebots/elements';
import { RunOptions } from '@node-lambdas/client';
import template from './step.component.htm';

@Component({
  tag: 'x-step',
  template,
  shadowDom: false,
})
export class StepComponent extends HTMLElement {
  @Input() step: RunOptions;
  @Output('remove') onRemove: EventEmitter<null>;
  options: string[] = [''];

  readonly uid = String(~~Math.random() * 2);

  addOption() {
    this.options = this.options.concat(['']);
  }

  updateOption(index: number, value: string) {
    this.options[index] = value;
    this.step.options = this.options.filter(Boolean).reduce((options: any, pair: string) => {
      const [key, value] = pair.split('=');
      options[key] = value;
      return options;
    }, {});
  }
}
