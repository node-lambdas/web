import { ChangeDetector, ChangeDetectorRef, Child, Component, Inject } from '@homebots/elements';
import { pipe, RunOptions } from '@node-lambdas/client';
import template from './app.component.htm';

@Component({
  tag: 'x-app',
  template,
  shadowDom: false,
})
export class AppComponent extends HTMLElement {
  @Child('[data-id="stdin"]') stdinRef: HTMLTextAreaElement;
  @Inject(ChangeDetectorRef) cd: ChangeDetector;

  steps: RunOptions[];
  stdout: string = '';
  stderr: string = '';

  onInit() {
    this.stdinRef.value = JSON.stringify({ number: 42 });

    const steps: RunOptions[] = [{}];
    if (location.search) {
      steps[0].name = location.search.slice(1);
    }

    this.steps = steps;
  }

  reset() {
    this.steps = [];
  }

  addStep() {
    this.steps = this.steps.concat([{}]);
  }

  removeStep(index: number) {
    this.steps = this.steps.filter((_, i) => index !== i);
  }

  get valid() {
    return this.steps.every((current) => !!current.name || current.local);
  }

  get stdin() {
    return new Blob([this.stdinRef.value]);
  }

  async run() {
    try {
      this.stdout = await (await pipe(this.stdin, ...this.steps)).text();
      this.stderr = null;
    } catch (error) {
      this.stderr = String(error);
    }

    this.cd.markAsDirtyAndCheck();
  }
}
