import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './auth/api.config';
import { AuthService } from './auth/auth.service';
import { Product } from './models';
import { persistentSignal } from './storage';

/**
 * The wish list, which lives in two places on purpose.
 *
 * A shopper who has not signed in still gets to save things — asking someone to
 * register before they may keep a note of a jacket is how a shop loses them —
 * so their list sits in this browser. Once they sign in the server's list takes
 * over, and whatever they saved as a guest is folded into it first.
 *
 * The merge only ever adds. A list built on a phone must not wipe the one built
 * on a laptop just because the phone signed in second.
 */
@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);
  private readonly auth = inject(AuthService);

  /** v2: these used to be the numeric ids of a hard-coded catalogue. */
  private readonly guestIds = persistentSignal<string[]>('krist.wishlist', [], 2);
  private readonly serverIds = signal<string[]>([]);

  private readonly signedIn = computed(() => this.auth.isAuthenticated());

  readonly productIds = computed(() => (this.signedIn() ? this.serverIds() : this.guestIds()));
  readonly count = computed(() => this.productIds().length);

  private readonly items = signal<Product[]>([]);
  /** Whole products, for the wish list screen. Only meaningful when signed in. */
  readonly products = this.items.asReadonly();

  constructor() {
    effect(() => {
      if (!this.signedIn()) {
        // Signing out leaves the guest list alone; it is this browser's.
        untracked(() => this.items.set([]));
        return;
      }

      void untracked(() => this.adopt());
    });
  }

  has(productId: string): boolean {
    return this.productIds().includes(productId);
  }

  async toggle(productId: string): Promise<void> {
    if (this.has(productId)) {
      await this.remove(productId);
      return;
    }

    if (!this.signedIn()) {
      this.guestIds.update((list) => [...list, productId]);
      return;
    }

    const { productIds } = await firstValueFrom(
      this.http.post<{ productIds: string[] }>(`${this.api}/account/wishlist`, { productId }),
    );
    this.serverIds.set(productIds);
  }

  async remove(productId: string): Promise<void> {
    if (!this.signedIn()) {
      this.guestIds.update((list) => list.filter((id) => id !== productId));
      return;
    }

    const { productIds } = await firstValueFrom(
      this.http.delete<{ productIds: string[] }>(`${this.api}/account/wishlist/${productId}`),
    );
    this.serverIds.set(productIds);
    this.items.update((list) => list.filter((product) => product.id !== productId));
  }

  /** Re-reads the list from the server — after a sign-in, or a screen opening. */
  async refresh(): Promise<void> {
    if (!this.signedIn()) return;

    const products = await firstValueFrom(this.http.get<Product[]>(`${this.api}/account/wishlist`));
    this.items.set(products);
    this.serverIds.set(products.map((product) => product.id));
  }

  /**
   * Hands the guest list to the account and then forgets it locally, so the
   * next person to use this browser does not inherit it.
   */
  private async adopt(): Promise<void> {
    const pending = this.guestIds();

    if (pending.length) {
      const { productIds } = await firstValueFrom(
        this.http.post<{ productIds: string[] }>(`${this.api}/account/wishlist/merge`, {
          productIds: pending,
        }),
      );
      this.serverIds.set(productIds);
      this.guestIds.set([]);
    }

    await this.refresh();
  }
}
