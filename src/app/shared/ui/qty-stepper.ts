import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-qty-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styles: `
    :host { display: inline-flex; }
    .box {
      display: inline-flex;
      align-items: center;
      border: 0.0625rem solid var(--c-line-strong);
      border-radius: var(--r-md);
      overflow: hidden;
    }
    button {
      border: none;
      background: transparent;
      color: var(--c-heading);
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      &:hover:not(:disabled) { background: var(--c-surface); }
      &:disabled { color: var(--c-placeholder); cursor: not-allowed; }
    }
    .value {
      min-width: 1.75rem;
      text-align: center;
      font-size: var(--fs-body);
      color: var(--c-heading);
      user-select: none;
    }
    :host(.sm) button { width: 3rem; height: 3rem; }
  `,
  template: `
    <div class="box">
      <button type="button" (click)="step(-1)" [disabled]="value() <= min()" [attr.aria-label]="'qty.decrease' | t">
        <app-icon [name]="'minus'" [size]="24" />
      </button>
      <span class="value">{{ value() }}</span>
      <button type="button" (click)="step(1)" [disabled]="value() >= max()" [attr.aria-label]="'qty.increase' | t">
        <app-icon [name]="'plus'" [size]="24" />
      </button>
    </div>
  `,
})
export class QtyStepper {
  readonly value = input(1);
  readonly min = input(1);
  readonly max = input(99);
  readonly valueChange = output<number>();

  protected step(delta: number): void {
    const next = Math.min(this.max(), Math.max(this.min(), this.value() + delta));
    if (next !== this.value()) this.valueChange.emit(next);
  }
}
