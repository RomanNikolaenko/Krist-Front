import { Injectable, signal } from '@angular/core';
import { ColorName, Product, ShopFilters, SizeName, SortKey } from './models';
import { ALL_COLORS, ALL_SIZES, MAX_PRICE, PRODUCTS } from './data/products';

export const PAGE_SIZE = 16;

export interface ShopResult {
  items: Product[];
  total: number;
  pages: number;
  from: number;
  to: number;
}

export const EMPTY_FILTERS: ShopFilters = {
  categories: [],
  colors: [],
  sizes: [],
  maxPrice: MAX_PRICE,
  sort: 'latest',
  page: 1,
};

@Injectable({ providedIn: 'root' })
export class Catalog {
  private readonly all = signal<Product[]>(PRODUCTS);

  readonly products = this.all.asReadonly();

  bySlug(slug: string): Product | undefined {
    return this.all().find((p) => p.slug === slug);
  }

  byId(id: number): Product | undefined {
    return this.all().find((p) => p.id === id);
  }

  bestsellers(count = 8): Product[] {
    return [...this.all()].sort((a, b) => b.rating - a.rating).slice(0, count);
  }

  related(product: Product, count = 4): Product[] {
    const sameCategory = this.all().filter((p) => p.id !== product.id && p.category === product.category);
    const rest = this.all().filter((p) => p.id !== product.id && p.category !== product.category);
    return [...sameCategory, ...rest].slice(0, count);
  }

  /** Facet counts are derived from the catalogue, never hard-coded. */
  colorCounts(): { name: ColorName; token: string; count: number }[] {
    return ALL_COLORS.map((c) => ({
      ...c,
      count: this.all().filter((p) => p.colors.includes(c.name)).length,
    }));
  }

  sizeCounts(): { name: SizeName; count: number }[] {
    return ALL_SIZES.map((s) => ({
      name: s,
      count: this.all().filter((p) => p.sizes.includes(s)).length,
    }));
  }

  search(filters: ShopFilters): ShopResult {
    let items = this.all().filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.colors.length && !filters.colors.some((c) => p.colors.includes(c))) return false;
      if (filters.sizes.length && !filters.sizes.some((s) => p.sizes.includes(s))) return false;
      if (p.price > filters.maxPrice) return false;
      return true;
    });

    items = sortItems(items, filters.sort);

    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, filters.page), pages);
    const start = (page - 1) * PAGE_SIZE;
    const slice = items.slice(start, start + PAGE_SIZE);

    return {
      items: slice,
      total,
      pages,
      from: total === 0 ? 0 : start + 1,
      to: start + slice.length,
    };
  }
}

function sortItems(items: Product[], sort: SortKey): Product[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'latest':
    default:
      return copy.sort((a, b) => b.id - a.id);
  }
}
