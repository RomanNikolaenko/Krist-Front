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
  styleUrl: './my-orders.scss',
  templateUrl: './my-orders.html',
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
