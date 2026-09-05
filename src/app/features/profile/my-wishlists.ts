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
}
