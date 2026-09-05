import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../core/cart-store';
import { T } from '../t.pipe';

@Component({
  selector: 'app-order-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule, T],
  styles: `
    .card {
      border: 0.0625rem solid var(--c-line);
      background: var(--c-panel);
      padding: 1.5rem;
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      font-size: var(--fs-body);
      color: var(--c-heading);
    }
    .row--strong { font-weight: 600; }
    hr { border: none; border-top: 0.0625rem solid var(--c-line); margin: 1rem 0; }
    .label { font-size: var(--fs-xs); color: var(--c-muted); margin-bottom: 0.375rem; }
    .coupon { display: flex; margin-bottom: 1rem; }
    .coupon input {
      flex: 1 1 8rem;
      min-width: 0;
      border: 0.0625rem solid var(--c-line-strong);
      border-right: none;
      padding: 0.8125rem 1rem;
      font: inherit;
      color: var(--c-heading);
      &:focus { outline: none; }
      &::placeholder { color: var(--c-placeholder); }
    }
    .coupon button {
      flex: 0 0 auto;
      min-height: 3rem;
      border: none;
      background: var(--c-ink);
      color: var(--c-on-ink);
      padding: 0 1.625rem;
      font-size: var(--fs-body);
      &:hover { background: var(--c-ink-hover); }
    }
    .error { color: var(--c-danger); font-size: var(--fs-xs); margin: -0.625rem 0 0.875rem; }
    .discount { color: var(--c-success); }
    .actions { margin-top: 1.25rem; }
    .actions:empty { display: none; }

    /* declared last so it overrides the base rules above, not the other way round */
    @container page (max-width: 24rem) {
      .card { padding: 1.125rem; }
      .coupon { flex-wrap: wrap; }
      .coupon input { flex-basis: 100%; border-right: 0.0625rem solid var(--c-line-strong); }
      .coupon button { width: 100%; }
    }
  `,
  template: `
    <div class="card">
      <div class="row row--strong">
        <span>{{ 'summary.subtotal' | t }}</span>
        <span>{{ cart.subtotal() | currency: 'USD' }}</span>
      </div>

      <hr />

      <p class="label">{{ 'summary.discountLabel' | t }}</p>
      <div class="coupon">
        <input type="text" [(ngModel)]="code" placeholder="FLAT50" [attr.aria-label]="'summary.codeLabel' | t" />
        <button type="button" (click)="apply()">{{ 'summary.apply' | t }}</button>
      </div>
      @if (failed()) { <p class="error">{{ 'summary.invalidCode' | t }}</p> }

      @if (cart.discount(); as off) {
        <div class="row discount">
          <span>{{ 'summary.discount' | t: { code: cart.appliedCode() ?? '' } }}</span>
          <span>-{{ off | currency: 'USD' }}</span>
        </div>
      }

      <div class="row">
        <span>{{ 'summary.delivery' | t }}</span>
        <span>{{ cart.deliveryCharge() | currency: 'USD' }}</span>
      </div>

      <hr />

      <div class="row row--strong">
        <span>{{ 'summary.grandTotal' | t }}</span>
        <span>{{ cart.total() | currency: 'USD' }}</span>
      </div>

      <div class="actions"><ng-content /></div>
    </div>
  `,
})
export class OrderSummary {
  protected readonly cart = inject(CartStore);
  protected code = this.cart.appliedCode() ?? '';
  protected readonly failed = signal(false);

  protected apply(): void {
    this.failed.set(!this.cart.applyCode(this.code));
  }
}
