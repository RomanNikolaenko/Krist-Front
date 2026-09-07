import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Catalog } from '../../core/catalog';
import { CartStore } from '../../core/cart-store';
import { WishlistStore } from '../../core/wishlist-store';
import { AuthService } from '../../core/auth/auth.service';
import { injectMediaUrl } from '../../core/media';
import { ReviewsApi } from '../../core/reviews.api';
import { ColorName, SizeName } from '../../core/models';
import { Breadcrumbs } from '../../shared/ui/breadcrumbs';
import { Icon } from '../../shared/ui/icon';
import { StarRating } from '../../shared/ui/star-rating';
import { QtyStepper } from '../../shared/ui/qty-stepper';
import { ProductCard } from '../../shared/ui/product-card';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { I18n } from '../../core/i18n/i18n';
import { D } from '../../shared/d.pipe';
import { T } from '../../shared/t.pipe';

/** The shape the API filter answers with when it refuses a request. */
interface ApiError {
  message?: string | string[];
}

// Kept in step with WriteReviewDto on the server.
const TITLE_MIN = 3;
const BODY_MIN = 10;

type Tab = 'descriptions' | 'additional' | 'reviews';

@Component({
  selector: 'app-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    D,
    FormsModule,
    RouterLink,
    Breadcrumbs,
    Icon,
    StarRating,
    QtyStepper,
    ProductCard,
    FeatureStrip,
    T,
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class ProductPage {
  private readonly catalog = inject(Catalog);
  private readonly cart = inject(CartStore);
  private readonly router = inject(Router);
  private readonly reviewsApi = inject(ReviewsApi);
  private readonly i18n = inject(I18n);

  /** Uploaded avatars are paths on the API host, not on this one. */
  protected readonly media = injectMediaUrl();
  protected readonly auth = inject(AuthService);
  protected readonly wishlist = inject(WishlistStore);

  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  private readonly productResource = this.catalog.productResource(this.slug);
  private readonly relatedResource = this.catalog.relatedResource(this.slug);
  private readonly reviewsResource = this.reviewsApi.forProduct(this.slug);

  protected readonly product = this.productResource.value;
  protected readonly related = this.relatedResource.value;
  protected readonly reviews = this.reviewsResource.value;
  protected readonly loading = this.productResource.isLoading;

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

  protected readonly ratingOptions = [1, 2, 3, 4, 5];
  protected readonly draft = { rating: 0, title: '', body: '' };
  protected readonly submitting = signal(false);
  protected readonly reviewError = signal('');

  /** Falls back to the first option so "Add to Cart" always has a variant. */
  protected readonly chosenSize = computed<SizeName | null>(
    () => this.size() ?? this.product()?.sizes[0] ?? null,
  );
  protected readonly chosenColor = computed<ColorName | null>(
    () => this.color() ?? this.product()?.colors[0] ?? null,
  );

  /**
   * The colours this product comes in, each with the swatch the catalogue says
   * it should be painted with. Both halves come from the server: an
   * administrator can add a colour, and nothing here has to be told about it.
   */
  protected readonly availableSwatches = computed(() => {
    const product = this.product();
    if (!product) return [];

    return this.catalog.facets
      .value()
      .colors.filter((color) => product.colors.includes(color.name))
      .map((color) => ({ name: color.name, token: color.hex }));
  });

  /** The review this person has already written, if any — the form edits it. */
  protected readonly myReview = computed(() => this.reviews().find((review) => review.mine));

  protected pick(index: number): void {
    this.activeImage.set(index);
  }

  protected addToCart(): void {
    const product = this.product();
    const size = this.chosenSize();
    if (!product || !size) return;

    this.cart.add(product, size, this.chosenColor(), this.qty());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2200);
  }

  protected buyNow(): void {
    this.addToCart();
    void this.router.navigate(['/cart']);
  }

  protected toggleWishlist(): void {
    const product = this.product();
    if (product) void this.wishlist.toggle(product.id);
  }

  /**
   * Posting replaces whatever this person said before — the server allows one
   * review each — and both the list and the product are re-read afterwards,
   * because the rating on the page is an average this has just changed.
   */
  protected async submitReview(): Promise<void> {
    if (this.submitting()) return;

    this.reviewError.set('');

    const title = this.draft.title.trim();
    const body = this.draft.body.trim();

    /*
     * The same three rules the API enforces, checked here so the person is told
     * which one they missed rather than watching a request fail. Kept in step
     * with `WriteReviewDto` deliberately: the server is still the one that
     * decides, this only saves a round trip and says so in their language.
     */
    if (!this.draft.rating) {
      this.reviewError.set(this.i18n.translate('product.reviewNeedsRating'));
      return;
    }
    if (title.length < TITLE_MIN) {
      this.reviewError.set(this.i18n.translate('product.reviewNeedsTitle'));
      return;
    }
    if (body.length < BODY_MIN) {
      this.reviewError.set(this.i18n.translate('product.reviewNeedsBody'));
      return;
    }

    this.submitting.set(true);
    try {
      await this.reviewsApi.write(this.slug(), { rating: this.draft.rating, title, body });

      this.draft.rating = 0;
      this.draft.title = '';
      this.draft.body = '';

      this.reviewsResource.reload();
      this.productResource.reload();
    } catch (error) {
      this.reviewError.set(this.messageFor(error));
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * Prefers what the server actually said.
   *
   * A rejected review comes back naming the field and the rule it broke, and
   * repeating "try again" over that is worse than useless — trying again with
   * the same text fails in exactly the same way. The generic line is kept for
   * the failures that really are worth retrying: a dropped connection, a 500.
   */
  private messageFor(error: unknown): string {
    const detail = error instanceof HttpErrorResponse ? (error.error as ApiError | null) : null;
    const message = detail?.message;

    if (typeof message === 'string' && message) return message;
    if (Array.isArray(message) && message.length) return message[0];

    return this.i18n.translate('product.reviewFailed');
  }

  protected async toggleLike(id: string, liked: boolean): Promise<void> {
    await this.reviewsApi.setLike(id, !liked);
    this.reviewsResource.reload();
  }

  protected async removeReview(id: string): Promise<void> {
    await this.reviewsApi.remove(id);
    this.reviewsResource.reload();
    this.productResource.reload();
  }
}
