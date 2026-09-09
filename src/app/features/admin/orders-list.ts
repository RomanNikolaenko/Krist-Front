import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  ADMIN_ORDER_STATUSES,
  AdminApi,
  AdminOrder,
  AdminOrderLine,
  AdminOrderStatus,
} from '../../core/admin.api';
import { AuthService } from '../../core/auth/auth.service';
import { OrderStatus } from '../../core/models';
import { D } from '../../shared/d.pipe';
import { Icon } from '../../shared/ui/icon';
import { Pagination } from '../../shared/ui/pagination';
import { apiMessage } from '../../core/api-error';
import { T } from '../../shared/t.pipe';

/**
 * The order book.
 *
 * One row per order rather than per line: somebody packing a parcel moves the
 * whole thing along, and the four statuses they set are the shop's — cancelling
 * belongs to the customer, so it is not offered here and lines already
 * cancelled are left alone by whatever is chosen.
 */
@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, D, Icon, Pagination, T],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class AdminOrdersList {
  private readonly api = inject(AdminApi);
  private readonly auth = inject(AuthService);

  /**
   * Support may read the order book and not change it. The server enforces
   * that; this decides whether a select is put in front of them at all.
   */
  protected readonly canWrite = computed(() => this.auth.has('orders.write'));

  protected readonly statuses = ADMIN_ORDER_STATUSES;
  /** What the filter offers: the four, plus the one only a customer can set. */
  protected readonly filterStatuses: OrderStatus[] = [...ADMIN_ORDER_STATUSES, 'CANCELLED'];

  protected readonly items = signal<AdminOrder[]>([]);
  protected readonly pages = signal(1);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly query = signal('');
  protected readonly status = signal<OrderStatus | ''>('');
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  /** The order whose select is mid-flight, so its row can say so. */
  protected readonly saving = signal<string | null>(null);

  constructor() {
    effect(() => {
      const page = this.page();
      const q = this.query();
      const status = this.status();
      void this.load(q, status, page);
    });
  }

  protected search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  protected filter(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as OrderStatus | '');
    this.page.set(1);
  }

  protected setPage(page: number): void {
    this.page.set(page);
  }

  /** What the lines of an order add up to, for the column that lists them. */
  protected itemCount(order: AdminOrder): number {
    return order.lines.reduce((sum, line) => sum + line.qty, 0);
  }

  /** "Jacket · L · Black × 2", with the colour left out when there is none. */
  protected lineLabel(line: AdminOrderLine): string {
    const variant = [line.size, line.colorLabel].filter(Boolean).join(' · ');

    return `${line.name} · ${variant} × ${line.qty}`;
  }

  protected async setStatus(order: AdminOrder, event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const status = select.value as AdminOrderStatus;

    this.saving.set(order.id);
    this.error.set('');

    try {
      const updated = await this.api.setOrderStatus(order.id, status);
      this.items.update((list) => list.map((row) => (row.id === order.id ? updated : row)));
    } catch (error) {
      // The select already shows the new value; the server disagreed, so put it
      // back rather than leaving the screen claiming something that is not so.
      select.value = order.status ?? '';
      this.error.set(apiMessage(error, 'admin.ordersFailed'));
    } finally {
      this.saving.set(null);
    }
  }

  private async load(q: string, status: OrderStatus | '', page: number): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const result = await this.api.orders({ q, status, page });
      this.items.set(result.items);
      this.pages.set(result.pages);
      this.total.set(result.total);
    } catch (error) {
      this.error.set(apiMessage(error, 'admin.ordersFailed'));
    } finally {
      this.loading.set(false);
    }
  }
}
