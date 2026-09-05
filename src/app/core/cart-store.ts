import { computed, Injectable } from '@angular/core';
import { CartItem, ColorName, Product, SizeName } from './models';
import { DELIVERY_CHARGE, DISCOUNT_CODES } from './data/content';
import { persistentSignal } from './storage';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly state = persistentSignal<CartItem[]>('krist.cart', []);
  private readonly code = persistentSignal<string | null>('krist.discount', null);

  readonly items = this.state.asReadonly();
  readonly appliedCode = this.code.asReadonly();

  readonly count = computed(() => this.state().reduce((n, i) => n + i.qty, 0));
  readonly subtotal = computed(() => this.state().reduce((n, i) => n + i.price * i.qty, 0));

  readonly discount = computed(() => {
    const code = this.code();
    if (!code) return 0;
    const off = DISCOUNT_CODES[code] ?? 0;
    return Math.min(off, this.subtotal());
  });

  readonly deliveryCharge = computed(() => (this.state().length ? DELIVERY_CHARGE : 0));

  readonly total = computed(() => this.subtotal() - this.discount() + this.deliveryCharge());

  add(product: Product, size: SizeName, color: ColorName | null, qty = 1): void {
    const id = `${product.id}-${size}-${color ?? 'default'}`;
    const existing = this.state().find((i) => i.id === id);

    if (existing) {
      this.setQty(id, existing.qty + qty);
      return;
    }

    this.state.update((items) => [
      ...items,
      {
        id,
        productId: product.id,
        brand: product.brand,
        name: product.name,
        image: product.images[0],
        price: product.price,
        size,
        color,
        qty,
      },
    ]);
  }

  setQty(id: string, qty: number): void {
    if (qty < 1) {
      this.remove(id);
      return;
    }
    this.state.update((items) => items.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  remove(id: string): void {
    this.state.update((items) => items.filter((i) => i.id !== id));
  }

  clear(): void {
    this.state.set([]);
    this.code.set(null);
  }

  /** Returns false when the code is not recognised, so the UI can show an error. */
  applyCode(raw: string): boolean {
    const code = raw.trim().toUpperCase();
    if (!(code in DISCOUNT_CODES)) return false;
    this.code.set(code);
    return true;
  }

  clearCode(): void {
    this.code.set(null);
  }
}
