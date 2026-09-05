import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from './icon';
import { T } from '../t.pipe';

export type CheckoutStep = 'address' | 'payment' | 'review';

const STEPS: { key: CheckoutStep; labelKey: string; icon: IconName; link: string }[] = [
  { key: 'address', labelKey: 'steps.address', icon: 'home', link: '/checkout/address' },
  { key: 'payment', labelKey: 'steps.payment', icon: 'card', link: '/checkout/payment' },
  { key: 'review', labelKey: 'steps.review', icon: 'clipboard', link: '/checkout/review' },
];

@Component({
  selector: 'app-checkout-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, T],
  styleUrl: './checkout-steps.scss',
  templateUrl: './checkout-steps.html',
})
export class CheckoutSteps {
  readonly current = input.required<CheckoutStep>();
  protected readonly steps = STEPS;

  protected index(): number {
    return STEPS.findIndex((s) => s.key === this.current());
  }
}
