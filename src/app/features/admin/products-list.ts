import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApi, AdminProduct } from '../../core/admin.api';
import { Icon } from '../../shared/ui/icon';
import { Modal } from '../../shared/ui/modal';
import { Pagination } from '../../shared/ui/pagination';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, Icon, Modal, Pagination, T],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class AdminProductsList {
  private readonly api = inject(AdminApi);

  protected readonly items = signal<AdminProduct[]>([]);
  protected readonly pages = signal(1);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  /** The product the confirmation is about, or null when it is shut. */
  protected readonly confirming = signal<AdminProduct | null>(null);

  constructor() {
    effect(() => {
      const page = this.page();
      const q = this.query();
      void this.load(q, page);
    });
  }

  /** Departments and what sits inside them, split into their own columns. */
  protected departmentsOf(product: AdminProduct): string {
    return product.categories
      .filter((category) => category.parentKey === null)
      .map((category) => category.name)
      .join(', ');
  }

  protected subcategoriesOf(product: AdminProduct): string {
    return product.categories
      .filter((category) => category.parentKey !== null)
      .map((category) => category.name)
      .join(', ');
  }

  /** The colours as this admin reads them, not as the catalogue stores them. */
  protected colorsOf(product: AdminProduct): string {
    return product.colors.map((color) => color.label).join(', ');
  }

  protected search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  protected setPage(page: number): void {
    this.page.set(page);
  }

  protected async remove(): Promise<void> {
    const product = this.confirming();
    if (!product) return;

    this.confirming.set(null);
    try {
      await this.api.deleteProduct(product.id);
      await this.load(this.query(), this.page());
    } catch {
      this.error.set('admin.deleteFailed');
    }
  }

  private async load(q: string, page: number): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const result = await this.api.products({ q, page });
      this.items.set(result.items);
      this.total.set(result.total);
      this.pages.set(result.pages);
    } catch {
      this.error.set('admin.loadFailed');
    } finally {
      this.loading.set(false);
    }
  }
}
