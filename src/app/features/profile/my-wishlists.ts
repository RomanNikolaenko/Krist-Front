import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistStore } from '../../core/wishlist-store';
import { ProductCard } from '../../shared/ui/product-card';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-my-wishlists',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard, T],
  styles: `
    :host { display: block; }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2.125rem 1.5rem;
    }

    .empty { display: flex; flex-direction: column; align-items: flex-start; gap: 0.875rem; padding: 2.5rem 0; }

    @container panel (max-width: 44rem) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @container panel (max-width: 30rem) { .grid { gap: 1.375rem 0.875rem; } }
    @container panel (max-width: 27rem) { .grid { grid-template-columns: 1fr; gap: 2rem; } }
  `,
  template: `
    @if (wishlist.products().length) {
      <div class="grid">
        @for (product of wishlist.products(); track product.id) {
          <app-product-card [product]="product" variant="wishlist" (remove)="wishlist.remove($event)" />
        }
      </div>
    } @else {
      <div class="empty">
        <h3>{{ 'wish.emptyTitle' | t }}</h3>
        <p class="muted">{{ 'wish.emptyText' | t }}</p>
        <a class="btn btn--primary" routerLink="/shop">{{ 'wish.browse' | t }}</a>
      </div>
    }
  `,
})
export class MyWishlists {
  protected readonly wishlist = inject(WishlistStore);
}
