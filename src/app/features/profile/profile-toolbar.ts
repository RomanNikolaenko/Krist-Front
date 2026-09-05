import { Injectable, signal } from '@angular/core';
import { OrderStatus } from '../../core/models';

/**
 * Search and status filter that live in the profile header but drive the
 * Orders list. Shared so the shell can render the controls and the child can
 * read them.
 */
@Injectable({ providedIn: 'root' })
export class ProfileToolbar {
  readonly search = signal('');
  readonly statuses = signal<OrderStatus[]>([]);

  setSearch(value: string): void {
    this.search.set(value);
  }

  toggleStatus(status: OrderStatus): void {
    this.statuses.update((list) =>
      list.includes(status) ? list.filter((s) => s !== status) : [...list, status],
    );
  }

  reset(): void {
    this.search.set('');
    this.statuses.set([]);
  }
}
