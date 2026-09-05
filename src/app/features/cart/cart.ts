import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../core/cart-store';
import { Icon } from '../../shared/ui/icon';
import { QtyStepper } from '../../shared/ui/qty-stepper';
import { OrderSummary } from '../../shared/ui/order-summary';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, Icon, QtyStepper, OrderSummary, T],
  styles: `
    :host { display: block; }

    /*
     * The table is the constraint, not the column split: below about 700px its
     * five tracks squeeze the product name until it wraps letter by letter. So
     * the minimum is written into the grid itself, and the container queries
     * below drop to one column at exactly the width where it stops fitting.
     *
     * --table-min is 700px; the sums are spelled out at each breakpoint.
     */
    .layout {
      --table-min: 43.75rem;

      display: grid;
      grid-template-columns: minmax(var(--table-min), 1fr) 21.25rem;
      gap: 3.75rem;
      align-items: start;
    }

    .head, .row {
      display: grid;
      grid-template-columns: 1fr 6.875rem 8.125rem 6.875rem 2.5rem;
      align-items: center;
      gap: 1rem;
    }

    .head {
      font-size: var(--fs-body);
      color: var(--c-heading);
      padding-bottom: 1.125rem;
      border-bottom: 0.0625rem solid var(--c-line);
    }

    .row { padding-block: 1.375rem; border-bottom: 0.0625rem solid var(--c-line); }

    .item { display: flex; align-items: center; gap: 1.125rem; }

    .item { min-width: 0; }

    .item__name, .item__meta { overflow-wrap: anywhere; }

    .item img {
      width: 4.375rem;
      height: 5.25rem;
      object-fit: cover;
      background: var(--c-surface);
      flex: none;
    }

    .item__name { font-size: var(--fs-body); font-weight: 600; color: var(--c-heading); }
    .item__meta { font-size: var(--fs-sm); color: var(--c-body); }

    .money { font-size: var(--fs-body); color: var(--c-heading); }

    .drop {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border: none;
      background: none;
      color: var(--c-muted);
      padding: 0;
      justify-self: end;
      &:hover { color: var(--c-danger); }
    }

    .empty {
      text-align: center;
      padding: 4.375rem 0 5.625rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.875rem;
    }

    /*
     * Range syntax, so the thresholds are exclusive: at exactly 1100px the
     * design's own numbers (700 + 340 + 60) still add up and the wide rule
     * stays in force.
     */
    /* 700 + 340 + 60 stops fitting: pull the summary and the gap in */
    @container page (width < 68.75rem) {
      .layout { grid-template-columns: minmax(var(--table-min), 1fr) 18.75rem; gap: 2rem; }
    }

    /* 700 + 300 + 32 = 1032px — past here the summary goes under the table */
    @container page (width < 64.5rem) {
      .layout { grid-template-columns: minmax(0, 1fr); }
    }

    /*
     * The stacked row is meant to start at a 768px screen. The container is the
     * page gutter, which is the viewport less 2 x 1.25rem, so the number here is
     * 45.5rem rather than 48rem.
     */
    @container page (width <= 45.5rem) {
      .head { display: none; }
      .row {
        grid-template-columns: 1fr auto;
        grid-template-areas: 'item drop' 'qty money';
        row-gap: 0.875rem;
      }
      .row .item { grid-area: item; }
      .row .price { display: none; }
      .row app-qty-stepper { grid-area: qty; }
      .row .subtotal { grid-area: money; justify-self: end; }
      .row .drop { grid-area: drop; }
    }
  `,
  template: `
    <div class="container page">
      <h1 class="page__title">{{ 'cart.title' | t }}</h1>

      @if (cart.items().length) {
        <div class="layout">
          <div class="table">
            <div class="head">
              <span>{{ 'cart.products' | t }}</span>
              <span>{{ 'cart.price' | t }}</span>
              <span>{{ 'cart.quantity' | t }}</span>
              <span>{{ 'cart.subtotal' | t }}</span>
              <span></span>
            </div>

            @for (item of cart.items(); track item.id) {
              <div class="row">
                <div class="item">
                  <img [src]="item.image" [alt]="item.name" width="700" height="860" loading="lazy" />
                  <div>
                    <p class="item__name">{{ item.name }}</p>
                    <p class="item__meta">{{ 'cart.size' | t }}: {{ item.size }}</p>
                  </div>
                </div>

                <span class="money price">{{ item.price | currency: 'USD' }}</span>

                <app-qty-stepper class="sm" [value]="item.qty" (valueChange)="cart.setQty(item.id, $event)" />

                <span class="money subtotal">{{ item.price * item.qty | currency: 'USD' }}</span>

                <button type="button" class="drop" (click)="cart.remove(item.id)"
                        [attr.aria-label]="'cart.remove' | t: { name: item.name }">
                  <app-icon [name]="'close'" [size]="24" />
                </button>
              </div>
            }
          </div>

          <app-order-summary>
            <a class="btn btn--primary btn--block" routerLink="/checkout/address">{{ 'cart.proceed' | t }}</a>
          </app-order-summary>
        </div>
      } @else {
        <div class="empty">
          <h2>{{ 'cart.emptyTitle' | t }}</h2>
          <p class="muted">{{ 'cart.emptyText' | t }}</p>
          <a class="btn btn--primary" routerLink="/shop">{{ 'cart.continue' | t }}</a>
        </div>
      }
    </div>
  `,
})
export class Cart {
  protected readonly cart = inject(CartStore);
}
