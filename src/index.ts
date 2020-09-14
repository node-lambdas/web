import { bootstrap, ChangeDetectorRef, ReactiveChangeDetector } from '@homebots/elements';
export { AppComponent } from './app/app.component';
export { StepComponent } from './step/step.component';

function debounceTime(fn: Function, time: number) {
  let timer: number;
  return function (...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(fn, time, ...args);
  };
}
function debounce(time = 100) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;
    descriptor = { ...descriptor, value: debounceTime(fn, time) };
    Object.defineProperty(target, name, descriptor);
  };
}

class CheckTreeDetector extends ReactiveChangeDetector {
  fork(target: any) {
    return new CheckTreeDetector(target || this.target, this);
  }

  @debounce()
  checkTree() {
    let t: CheckTreeDetector = this;

    while (t.parent) {
      t.markForCheck();
      t = t.parent as CheckTreeDetector;
    }

    t._checkTree();
  }

  markForCheck() {
    this.state = 'dirty';
  }

  _checkTree() {
    this.check();
    this.children.forEach((cd: CheckTreeDetector) => cd._checkTree());
  }
}

bootstrap({
  providers: [{ type: ChangeDetectorRef, useClass: CheckTreeDetector }],
});
