import { httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { API_BASE_URL } from './auth/api.config';
import { I18n } from './i18n/i18n';
import { Facets, Product, ProductPage, ShopFilters, SortKey } from './models';

export const PAGE_SIZE = 16;

export const EMPTY_FACETS: Facets = {
  categories: [],
  colors: [],
  sizes: [],
  minPrice: 0,
  maxPrice: 0,
};

/** The swatch for a colour, taken from the row rather than a stylesheet. */
export const swatchOf = (facets: Facets, name: string): string =>
  facets.colors.find((color) => color.name === name)?.hex ?? 'transparent';

const EMPTY_PAGE: ProductPage = { items: [], total: 0, pages: 1, from: 0, to: 0 };

/**
 * Filters that narrow nothing.
 *
 * Both ends of the price range are filled in from the facets when they arrive,
 * so the slider spans what the catalogue actually costs rather than a pair of
 * numbers written down here. A zero ceiling means they have not landed yet.
 */
export const EMPTY_FILTERS: ShopFilters = {
  categories: [],
  colors: [],
  sizes: [],
  minPrice: 0,
  maxPrice: 0,
  sort: 'latest',
  page: 1,
};

/**
 * The catalogue, which now lives on the server.
 *
 * This used to be an array in the bundle and a set of synchronous lookups. It
 * is a set of resources instead: each one owns a URL derived from signals, so
 * changing a filter re-fetches without anybody wiring up a subscription, and
 * every screen gets `isLoading` and `error` for free.
 *
 * The factory methods are called from a component's field initialisers, which
 * is what ties each resource's lifetime to the screen that asked for it.
 */
@Injectable({ providedIn: 'root' })
export class Catalog {
  private readonly api = inject(API_BASE_URL);
  private readonly i18n = inject(I18n);

  /**
   * The language every catalogue request carries.
   *
   * Read inside each resource's URL factory rather than sent as a header, so
   * that switching language in settings re-runs the factory and re-fetches.
   * A header would change what the next request asks for without any of the
   * resources knowing they had become stale.
   */
  private lang(): string {
    return `lang=${this.i18n.lang()}`;
  }

  /** Loaded once and shared: the filter counts do not depend on the filters. */
  readonly facets = httpResource<Facets>(() => `${this.api}/products/facets`, {
    defaultValue: EMPTY_FACETS,
  });

  searchResource(filters: Signal<ShopFilters>) {
    return httpResource<ProductPage>(() => this.searchUrl(filters()), {
      defaultValue: EMPTY_PAGE,
    });
  }

  /** Undefined slug means no request — the route parameter has not resolved yet. */
  productResource(slug: Signal<string>) {
    return httpResource<Product>(() =>
      slug() ? `${this.api}/products/${encodeURIComponent(slug())}?${this.lang()}` : undefined,
    );
  }

  relatedResource(slug: Signal<string>, count = 4) {
    return httpResource<Product[]>(
      () =>
        slug()
          ? `${this.api}/products/${encodeURIComponent(slug())}/related?count=${count}&${this.lang()}`
          : undefined,
      { defaultValue: [] },
    );
  }

  bestsellersResource(count = 8) {
    return httpResource<Product[]>(
      () => `${this.api}/products/bestsellers?count=${count}&${this.lang()}`,
      {
        defaultValue: [],
      },
    );
  }

  private searchUrl(filters: ShopFilters): string {
    const query = new URLSearchParams();

    if (filters.categories.length) query.set('categories', filters.categories.join(','));
    if (filters.colors.length) query.set('colors', filters.colors.join(','));
    if (filters.sizes.length) query.set('sizes', filters.sizes.join(','));
    // The two ends travel together, and only once the facets have given them
    // real values: a zero ceiling would ask for everything under nothing.
    if (filters.maxPrice > 0) {
      query.set('minPrice', String(filters.minPrice));
      query.set('maxPrice', String(filters.maxPrice));
    }
    query.set('sort', filters.sort satisfies SortKey);
    query.set('page', String(filters.page));
    query.set('pageSize', String(PAGE_SIZE));
    query.set('lang', this.i18n.lang());

    return `${this.api}/products?${query.toString()}`;
  }
}
