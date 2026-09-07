import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Order, OrderLine } from '../../core/models';
import { OrdersApi } from '../../core/orders.api';
import { ProfileToolbar } from './profile-toolbar';
import { T } from '../../shared/t.pipe';

/** One line of one order, carrying enough of its parent to be shown alone. */
export interface OrderRow extends OrderLine {
  /** The order this line belongs to, so the row can link to it. */
  orderId: string;
  number: string;
  placedAt: string;
}

@Component({
  selector: 'app-my-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, T],
  styleUrl: './my-orders.scss',
  templateUrl: './my-orders.html',
})
export class MyOrders {
  private readonly toolbar = inject(ProfileToolbar);
  private readonly api = inject(OrdersApi);
  private readonly auth = inject(AuthService);

  private readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly query = this.toolbar.search;

  /**
   * The screen lists lines, not orders: one parcel of a three-item order can be
   * delivered while the rest is still being picked, and the status belongs to
   * the line. Each row carries its order number so it can still be identified.
   */
  protected readonly rows = computed<OrderRow[]>(() =>
    this.orders().flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderId: order.id,
        number: order.number,
        placedAt: order.placedAt,
      })),
    ),
  );

  protected readonly visible = computed(() => {
    const term = this.query().trim().toLowerCase();
    const statuses = this.toolbar.statuses();

    return this.rows().filter((row) => {
      if (term && !row.name.toLowerCase().includes(term)) return false;
      if (statuses.length && !statuses.includes(row.status)) return false;
      return true;
    });
  });

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) return;
      void this.load();
    });
  }

  /** Cancels one line. Only a line still being processed offers the button. */
  protected async cancel(row: OrderRow): Promise<void> {
    await this.api.cancelLine(row.id);
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.orders.set(await this.api.list());
    } finally {
      this.loading.set(false);
    }
  }
}
