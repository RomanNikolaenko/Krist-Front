import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-qty-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styleUrl: './qty-stepper.scss',
  templateUrl: './qty-stepper.html',
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
