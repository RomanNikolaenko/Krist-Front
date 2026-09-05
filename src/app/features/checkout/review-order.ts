import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { CartStore } from '../../core/cart-store';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { OrderSummary } from '../../shared/ui/order-summary';
import { Icon } from '../../shared/ui/icon';
import { Modal } from '../../shared/ui/modal';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';



@Component({
  selector: 'app-review-order',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, CheckoutSteps, OrderSummary, Icon, Modal, T],
  styles: `
    :host { display: block; }

    .layout { display: grid; grid-template-columns: 1fr 22.5rem; gap: 3.75rem; align-items: start; }

    .eta { font-size: 1.25rem; font-weight: 600; color: var(--c-heading); margin-bottom: 1.125rem; }
    .eta span { font-weight: 400; }

    .line {
      display: grid;
      grid-template-columns: 4.75rem 1fr;
      gap: 1.25rem;
      padding-block: 1.25rem;
      border-bottom: 0.0625rem solid var(--c-line);
    }

    .line img { width: 4.75rem; height: 5.75rem; object-fit: cover; background: var(--c-surface); }
    .line__name { font-size: var(--fs-body); font-weight: 600; color: var(--c-heading); }
    .line__meta { font-size: var(--fs-sm); color: var(--c-body); }

    .block { padding-block: 1.625rem; border-bottom: 0.0625rem solid var(--c-line); }

    .block__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }

    .edit {
      width: 3rem; height: 3rem;
      display: grid; place-items: center;
      border: none; border-radius: var(--r-md);
      background: var(--c-surface);
      color: var(--c-heading);
      &:hover { background: var(--c-line); }
    }

    .who { font-size: var(--fs-body); font-weight: 600; color: var(--c-heading); }
    .where { font-size: var(--fs-sm); color: var(--c-body); margin-top: 0.25rem; }

    .confirm { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .confirm__ring {
      width: 5.5rem; height: 5.5rem;
      border-radius: 50%;
      background: var(--c-surface);
      display: grid; place-items: center;
      margin-bottom: 0.875rem;
    }
    .confirm__dot {
      width: 3.875rem; height: 3.875rem;
      border-radius: 50%;
      background: var(--c-ink);
      color: var(--c-on-ink);
      display: grid; place-items: center;
    }
    .confirm h3 { font-size: 1.375rem; font-weight: 600; }
    .confirm p { font-size: var(--fs-sm); color: var(--c-body); margin-bottom: 0.75rem; }
    .confirm .btn { width: 100%; }
    .confirm__actions { display: flex; flex-direction: column; gap: 0.875rem; width: 100%; margin-top: 0.5rem; }

    @container page (max-width: 64rem) { .layout { grid-template-columns: minmax(0, 1fr) 18.75rem; gap: 2rem; } }
    @container page (max-width: 50rem) { .layout { grid-template-columns: minmax(0, 1fr); } }
  `,
  template: `
    <div class="container page">
      <h1 class="page__title">{{ 'review.title' | t }}</h1>

      <div class="layout">
        <div>
          <app-checkout-steps current="review" />

          <p class="eta">{{ 'review.eta' | t }} <span>{{ eta | date: 'd MMM y' }}</span></p>

          @for (item of cart.items(); track item.id) {
            <div class="line">
              <img [src]="item.image" [alt]="item.name" width="700" height="860" loading="lazy" />
              <div>
                <p class="line__name">{{ item.name }}</p>
                <p class="line__meta">{{ item.price | currency: 'USD' }}</p>
                <p class="line__meta">{{ 'cart.size' | t }}: {{ item.size }}</p>
              </div>
            </div>
          }

          @if (!cart.items().length) {
            <p class="muted">{{ 'review.emptyCart' | t }}</p>
          }

          <section class="block">
            <div class="block__head">
              <div>
                <h2>{{ 'review.shippingAddress' | t }}</h2>
                @if (account.selectedAddress(); as address) {
                  <p class="who">{{ address.name }}</p>
                  <p class="where">{{ address.line1 }} {{ address.area }}, {{ address.state }} {{ address.pin }}</p>
                } @else {
                  <p class="where">{{ 'review.noAddress' | t }}</p>
                }
              </div>
              <a class="edit" routerLink="/checkout/address" [attr.aria-label]="'review.editAddress' | t">
                <app-icon [name]="'edit'" [size]="24" />
              </a>
            </div>
          </section>

          <section class="block">
            <div class="block__head">
              <div>
                <h2>{{ 'review.paymentMethod' | t }}</h2>
                <p class="who">{{ paymentLabel() }}</p>
              </div>
              <a class="edit" routerLink="/checkout/payment" [attr.aria-label]="'review.editPayment' | t">
                <app-icon [name]="'edit'" [size]="24" />
              </a>
            </div>
          </section>
        </div>

        <app-order-summary>
          <button type="button" class="btn btn--primary btn--block" (click)="placeOrder()"
                  [disabled]="!cart.items().length">{{ 'review.placeOrder' | t }}</button>
        </app-order-summary>
      </div>
    </div>

    <app-modal [open]="confirmed()" [label]="'review.confirmedTitle' | t" (closed)="goHome()">
      <div class="confirm">
        <span class="confirm__ring"><span class="confirm__dot"><app-icon [name]="'bag'" [size]="24" /></span></span>
        <h3>{{ 'review.confirmedTitle' | t }}</h3>
        <p>{{ 'review.confirmedText' | t }}</p>
        <div class="confirm__actions">
          <button type="button" class="btn btn--primary" (click)="viewOrder()">{{ 'review.viewOrder' | t }}</button>
          <button type="button" class="btn btn--outline" (click)="goHome()">{{ 'review.backHome' | t }}</button>
        </div>
      </div>
    </app-modal>
  `,
})
export class ReviewOrder {
  protected readonly cart = inject(CartStore);
  protected readonly account = inject(AccountStore);
  private readonly router = inject(Router);

  protected readonly confirmed = signal(false);
  protected readonly eta = new Date(Date.now() + 5 * 86_400_000);

  private readonly i18n = inject(I18n);

  protected readonly paymentLabel = computed(() => {
    const method = this.account.payment();
    if (method !== 'card') return this.i18n.translate(`payLabel.${method}`);
    const last4 = this.account.cards()[0]?.number.slice(-2) ?? '89';
    return this.i18n.translate('payLabel.card', { last4: `.... .... .... ..${last4}` });
  });

  protected placeOrder(): void {
    this.confirmed.set(true);
  }

  protected viewOrder(): void {
    this.confirmed.set(false);
    this.cart.clear();
    this.router.navigate(['/profile/orders']);
  }

  protected goHome(): void {
    this.confirmed.set(false);
    this.cart.clear();
    this.router.navigate(['/']);
  }
}
