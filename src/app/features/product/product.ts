import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Catalog } from '../../core/catalog';
import { CartStore } from '../../core/cart-store';
import { WishlistStore } from '../../core/wishlist-store';
import { ColorName, Review, SizeName } from '../../core/models';
import { ALL_COLORS } from '../../core/data/products';
import { REVIEWS } from '../../core/data/content';
import { Breadcrumbs } from '../../shared/ui/breadcrumbs';
import { Icon } from '../../shared/ui/icon';
import { StarRating } from '../../shared/ui/star-rating';
import { QtyStepper } from '../../shared/ui/qty-stepper';
import { ProductCard } from '../../shared/ui/product-card';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';

type Tab = 'descriptions' | 'additional' | 'reviews';

@Component({
  selector: 'app-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe, FormsModule, Breadcrumbs, Icon, StarRating, QtyStepper, ProductCard, FeatureStrip, T,
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductPage {
  private readonly catalog = inject(Catalog);
  private readonly cart = inject(CartStore);
  private readonly router = inject(Router);

  protected readonly wishlist = inject(WishlistStore);
  protected readonly swatches = ALL_COLORS;

  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  protected readonly product = computed(() => this.catalog.bySlug(this.slug()));
  protected readonly related = computed(() => {
    const p = this.product();
    return p ? this.catalog.related(p, 4) : [];
  });

  private readonly i18n = inject(I18n);

  protected readonly crumbs = computed(() => [
    { label: this.i18n.translate('nav.home'), link: '/' },
    { label: this.i18n.translate('nav.shop'), link: '/shop' },
    { label: this.product()?.name ?? '' },
  ]);

  protected readonly activeImage = signal(0);
  protected readonly size = signal<SizeName | null>(null);
  protected readonly color = signal<ColorName | null>(null);
  protected readonly qty = signal(1);
  protected readonly tab = signal<Tab>('descriptions');
  protected readonly added = signal(false);

  protected readonly reviews: Review[] = REVIEWS;
  protected readonly ratingOptions = [1, 2, 3, 4, 5];

  protected readonly draft = { rating: 0, name: '', email: '', body: '' };
  protected readonly submitted = signal(false);

  /** Falls back to the first option so "Add to Cart" always has a variant. */
  protected readonly chosenSize = computed<SizeName | null>(
    () => this.size() ?? this.product()?.sizes[0] ?? null,
  );
  protected readonly chosenColor = computed<ColorName | null>(
    () => this.color() ?? this.product()?.colors[0] ?? null,
  );

  protected readonly availableSwatches = computed(() => {
    const p = this.product();
    return p ? this.swatches.filter((s) => p.colors.includes(s.name)) : [];
  });

  protected pick(index: number): void {
    this.activeImage.set(index);
  }

  protected addToCart(): void {
    const p = this.product();
    const size = this.chosenSize();
    if (!p || !size) return;
    this.cart.add(p, size, this.chosenColor(), this.qty());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2200);
  }

  protected buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  protected submitReview(): void {
    this.submitted.set(true);
  }
}
