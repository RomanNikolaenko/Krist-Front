import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { CartStore } from '../../core/cart-store';
import { WishlistStore } from '../../core/wishlist-store';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, Icon, T],
  host: { '[class.card--list]': "layout() === 'list'" },
  styleUrl: './product-card.scss',
  templateUrl: './product-card.html',
})
export class ProductCard {
  protected readonly wishlist = inject(WishlistStore);
  private readonly cart = inject(CartStore);

  readonly product = input.required<Product>();
  readonly variant = input<'grid' | 'wishlist'>('grid');
  readonly layout = input<'grid' | 'list'>('grid');
  readonly remove = output<number>();

  protected addToCart(): void {
    const p = this.product();
    this.cart.add(p, p.sizes[0], p.colors[0] ?? null, 1);
    if (this.variant() === 'wishlist') this.remove.emit(p.id);
  }
}
