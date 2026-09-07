import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistStore } from '../../core/wishlist-store';
import { ProductCard } from '../../shared/ui/product-card';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-my-wishlists',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard, T],
  styleUrl: './my-wishlists.scss',
  templateUrl: './my-wishlists.html',
})
export class MyWishlists {
  protected readonly wishlist = inject(WishlistStore);

  constructor() {
    /*
     * The store keeps two things: the ids, which every heart on every card
     * updates, and the products themselves, which only a fetch can produce.
     * Hearting something from the shop moves the first and not the second, so
     * this screen has to ask — otherwise it shows the list as it stood at
     * sign-in while the header counts the ones added since.
     */
    void this.wishlist.refresh();
  }
}
