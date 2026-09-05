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
  styles: `
    .track {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      position: relative;
      margin-bottom: 2.25rem;
    }
    .rule {
      position: absolute;
      top: 1.75rem;
      left: 1.25rem;
      right: 1.25rem;
      border-top: 0.0625rem dashed var(--c-muted);
    }
    .step {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      align-items: flex-start;
    }
    .step:last-child { align-items: flex-end; }
    .step:nth-child(3) { align-items: center; }
    .badge {
      width: 3.5rem; height: 3.5rem;
      display: grid; place-items: center;
      border-radius: var(--r-md);
      background: var(--c-surface);
      color: var(--c-muted);
      position: relative;
      z-index: 1;
    }
    .is-done .badge, .is-current .badge { background: var(--c-ink); color: var(--c-on-ink); }
    .label { font-size: var(--fs-sm); color: var(--c-heading); }
    @container page (max-width: 32rem) {
      .label { font-size: var(--fs-xs); }
    }
  `,
  template: `
    <div class="track">
      <span class="rule"></span>
      @for (s of steps; track s.key; let i = $index) {
        <div class="step" [class.is-current]="s.key === current()" [class.is-done]="i < index()">
          <a class="badge" [routerLink]="s.link" [attr.aria-current]="s.key === current() ? 'step' : null">
            <app-icon [name]="s.icon" [size]="24" />
          </a>
          <span class="label">{{ s.labelKey | t }}</span>
        </div>
      }
    </div>
  `,
})
export class CheckoutSteps {
  readonly current = input.required<CheckoutStep>();
  protected readonly steps = STEPS;

  protected index(): number {
    return STEPS.findIndex((s) => s.key === this.current());
  }
}
