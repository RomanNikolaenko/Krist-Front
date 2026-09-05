import { computed, inject, Injectable } from '@angular/core';
import { Catalog } from './catalog';
import { Product } from './models';
import { persistentSignal } from './storage';

const SEED = [2, 3, 4, 11, 12, 13, 14, 15, 16];

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly catalog = inject(Catalog);
  private readonly ids = persistentSignal<number[]>('krist.wishlist', SEED);

  readonly productIds = this.ids.asReadonly();
  readonly count = computed(() => this.ids().length);

  readonly products = computed<Product[]>(() =>
    this.ids()
      .map((id) => this.catalog.byId(id))
      .filter((p): p is Product => !!p),
  );

  has(id: number): boolean {
    return this.ids().includes(id);
  }

  toggle(id: number): void {
    this.ids.update((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  remove(id: number): void {
    this.ids.update((list) => list.filter((x) => x !== id));
  }
}
