import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { RouterLink } from '@angular/router';
import { OrderItem, OrderStatus } from '../../core/models';
import { ORDERS } from '../../core/data/content';

import { ProfileToolbar } from './profile-toolbar';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-my-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, T],
  styles: `
    :host { display: block; }

    .order { border-bottom: 0.0625rem solid var(--c-line); padding-bottom: 1.375rem; margin-bottom: 1.375rem; }
    .order:last-child { margin-bottom: 0; }

    .row {
      display: grid;
      /* the action column sizes to its content so longer locales don't wrap */
      grid-template-columns: 5rem minmax(0, 1fr) 7.5rem minmax(8rem, max-content);
      align-items: center;
      gap: 1.5rem;
    }

    .thumb {
      width: 5rem;
      height: 5.25rem;
      object-fit: cover;
      background: var(--c-surface);
    }

    .name { font-size: var(--fs-body); font-weight: 600; color: var(--c-heading); }
    .meta { font-size: var(--fs-sm); color: var(--c-body); }
    .price { font-size: var(--fs-body); font-weight: 600; color: var(--c-heading); }

    .actions { display: flex; flex-direction: column; gap: 0.75rem; }

    .actions button {
      border: 0.0625rem solid var(--c-line-strong);
      border-radius: var(--r-md);
      background: var(--c-panel);
      color: var(--c-heading);
      padding: 0.6875rem 1.125rem;
      font-size: var(--fs-sm);
      white-space: nowrap;
      &:hover { background: var(--c-surface); }
    }

    .actions .is-primary {
      background: var(--c-ink);
      border-color: var(--c-ink);
      color: var(--c-on-ink);
      &:hover { background: var(--c-ink-hover); }
    }

    .actions .is-cancel {
      background: var(--c-cancel);
      border-color: var(--c-cancel);
      color: var(--c-fixed-white);
      &:hover { filter: brightness(.95); }
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      margin-top: 1.125rem;
      font-size: var(--fs-sm);
      color: var(--c-heading);
    }

    .tag {
      padding: 0.25rem 0.75rem;
      border-radius: var(--r-sm);
      font-size: var(--fs-xs);
      background: var(--c-success-soft);
      color: var(--c-success);
    }
    .tag.is-process { background: var(--c-warn-soft); color: var(--c-warn); }
    .tag.is-cancelled { background: var(--c-danger-soft); color: var(--c-danger); }

    .empty { display: flex; flex-direction: column; align-items: flex-start; gap: 0.875rem; padding: 2.5rem 0; }

    @container panel (max-width: 44rem) {
      .row {
        grid-template-columns: 5rem minmax(0, 1fr);
        row-gap: 1rem;
      }
      .price { grid-column: 2; }
      .actions { grid-column: 1 / -1; flex-direction: row; }
      .actions button { flex: 1; }
    }
  `,
  template: `
    @for (order of visible(); track order.id) {
      <div class="order">
        <div class="row">
          <img class="thumb" [src]="order.image" [alt]="order.name" width="700" height="860" loading="lazy" />

          <div>
            <p class="name">{{ order.name }}</p>
            <p class="meta">{{ 'orders.size' | t }}: {{ order.size }}</p>
            <p class="meta">{{ 'orders.qty' | t }}: {{ order.qty }}</p>
          </div>

          <span class="price">{{ order.price | currency: 'USD' }}</span>

          <div class="actions">
            <button type="button">{{ 'orders.viewOrder' | t }}</button>
            @if (order.status === 'Delivered') {
              <button type="button" class="is-primary" [routerLink]="['/shop']">{{ 'orders.writeReview' | t }}</button>
            } @else if (order.status === 'In Process') {
              <button type="button" class="is-cancel" (click)="cancel(order.id)">{{ 'orders.cancelOrder' | t }}</button>
            }
          </div>
        </div>

        <p class="status">
          <span class="tag"
                [class.is-process]="order.status === 'In Process'"
                [class.is-cancelled]="order.status === 'Cancelled'">{{ 'status.' + order.status | t }}</span>
          {{ order.statusTextKey | t }}
        </p>
      </div>
    }

    @if (!visible().length) {
      <div class="empty">
        <h3>{{ (query() ? 'orders.noneSearch' : 'orders.noneTitle') | t }}</h3>
        <a class="btn btn--primary" routerLink="/shop">{{ 'orders.startShopping' | t }}</a>
      </div>
    }
  `,
})
export class MyOrders {
  private readonly toolbar = inject(ProfileToolbar);
  private readonly state = signal<OrderItem[]>(ORDERS);

  protected readonly query = this.toolbar.search;

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const statuses = this.toolbar.statuses();

    return this.state().filter((o) => {
      if (q && !o.name.toLowerCase().includes(q)) return false;
      if (statuses.length && !statuses.includes(o.status)) return false;
      return true;
    });
  });

  protected cancel(id: string): void {
    this.state.update((list) =>
      list.map((o) =>
        o.id === id
          ? { ...o, status: 'Cancelled' as OrderStatus, statusTextKey: 'statusText.cancelled' }
          : o,
      ),
    );
  }
}
