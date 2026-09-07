import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Order, OrderLine } from '../../core/models';
import { OrdersApi } from '../../core/orders.api';
import { Icon } from '../../shared/ui/icon';
import { D } from '../../shared/d.pipe';
import { T } from '../../shared/t.pipe';

/**
 * One order, whole.
 *
 * The list shows lines, because a three-item order can be half delivered and
 * the status belongs to the line. This is the other half of that: the order
 * those lines came from — what it cost, where it went, and when it was placed.
 */
@Component({
  selector: 'app-order-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, Icon, D, T],
  styleUrl: './order-detail.scss',
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly api = inject(OrdersApi);

  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    // Follows the id rather than reading it once, so /orders/a to /orders/b
    // reloads instead of showing the first one under the second one's URL.
    effect(() => {
      const id = this.id();
      if (id) void this.load(id);
    });
  }

  protected async cancel(line: OrderLine): Promise<void> {
    await this.api.cancelLine(line.id);
    await this.load(this.id());
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);

    try {
      this.order.set(await this.api.byId(id));
    } catch {
      // Somebody else's order and one that never existed look the same from
      // here, which is the point: the server does not say which.
      this.order.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
