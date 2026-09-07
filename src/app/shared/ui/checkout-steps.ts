import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon, IconName } from './icon';
import { T } from '../t.pipe';

export type CheckoutStep = 'address' | 'payment' | 'review';

const STEPS: { key: CheckoutStep; labelKey: string; icon: IconName }[] = [
  { key: 'address', labelKey: 'steps.address', icon: 'home' },
  { key: 'payment', labelKey: 'steps.payment', icon: 'card' },
  { key: 'review', labelKey: 'steps.review', icon: 'clipboard' },
];

/**
 * Where the order is in the checkout — a read-out, not a way to move.
 *
 * It used to link to each step, which let anybody open the review screen
 * without having said where the order goes. The route guard turns those away
 * now, and a link that bounces you back is worse than no link: the steps behind
 * you are marked done, the ones ahead are simply not reachable yet, and the way
 * forward is the button at the bottom of the screen you are on.
 */
@Component({
  selector: 'app-checkout-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styleUrl: './checkout-steps.scss',
  templateUrl: './checkout-steps.html',
})
export class CheckoutSteps {
  readonly current = input.required<CheckoutStep>();
  protected readonly steps = STEPS;

  /**
   * Everything before the current step is done — the guard is what makes that
   * true, since this screen cannot be open unless the earlier answers exist.
   */
  protected readonly index = computed(() => STEPS.findIndex((s) => s.key === this.current()));
}
