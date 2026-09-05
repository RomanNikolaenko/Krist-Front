import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Catalog, EMPTY_FILTERS } from '../../core/catalog';
import { ColorName, ShopFilters, SizeName, SortKey } from '../../core/models';
import { EXPANDABLE_CATEGORIES, MAX_PRICE, PRODUCT_CATEGORIES } from '../../core/data/products';
import { Breadcrumbs } from '../../shared/ui/breadcrumbs';
import { Icon } from '../../shared/ui/icon';
import { Pagination } from '../../shared/ui/pagination';
import { ProductCard } from '../../shared/ui/product-card';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { CurrencyPipe } from '@angular/common';
import { I18n } from '../../core/i18n/i18n';
import { Select, SelectOption } from '../../shared/ui/select';
import { T } from '../../shared/t.pipe';


type PanelKey = 'categories' | 'price' | 'color' | 'size';

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumbs, Icon, Pagination, ProductCard, FeatureStrip, CurrencyPipe, Select, T],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop {
  private readonly catalog = inject(Catalog);

  protected readonly maxPrice = MAX_PRICE;
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly expandable = EXPANDABLE_CATEGORIES;
  protected readonly colors = this.catalog.colorCounts();
  protected readonly sizes = this.catalog.sizeCounts();

  private readonly i18n = inject(I18n);

  protected readonly crumbs = computed(() => [
    { label: this.i18n.translate('nav.shop'), link: '/shop' },
    { label: this.i18n.translate('shop.allProducts') },
  ]);

  protected readonly sortOptions = computed<SelectOption[]>(() => [
    { value: 'latest', label: this.i18n.translate('shop.sortLatest') },
    { value: 'price-asc', label: this.i18n.translate('shop.sortPriceAsc') },
    { value: 'price-desc', label: this.i18n.translate('shop.sortPriceDesc') },
    { value: 'rating', label: this.i18n.translate('shop.sortRating') },
  ]);

  protected readonly filters = signal<ShopFilters>({ ...EMPTY_FILTERS });
  protected readonly view = signal<'grid' | 'list'>('grid');
  protected readonly filtersOpen = signal(false);

  protected readonly panels = signal<Record<PanelKey, boolean>>({
    categories: true,
    price: true,
    color: true,
    size: true,
  });

  protected readonly result = computed(() => this.catalog.search(this.filters()));

  protected readonly activeCount = computed(() => {
    const f = this.filters();
    return f.categories.length + f.colors.length + f.sizes.length + (f.maxPrice < MAX_PRICE ? 1 : 0);
  });

  protected togglePanel(key: PanelKey): void {
    this.panels.update((p) => ({ ...p, [key]: !p[key] }));
  }

  protected toggleCategory(name: string): void {
    this.filters.update((f) => ({
      ...f,
      page: 1,
      categories: toggle(f.categories, name),
    }));
  }

  protected toggleColor(name: ColorName): void {
    this.filters.update((f) => ({ ...f, page: 1, colors: toggle(f.colors, name) }));
  }

  protected toggleSize(name: SizeName): void {
    this.filters.update((f) => ({ ...f, page: 1, sizes: toggle(f.sizes, name) }));
  }

  protected setPrice(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.filters.update((f) => ({ ...f, page: 1, maxPrice: value }));
  }

  protected setSort(sort: string): void {
    this.filters.update((f) => ({ ...f, page: 1, sort: sort as SortKey }));
  }

  protected setPage(page: number): void {
    this.filters.update((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected reset(): void {
    this.filters.set({ ...EMPTY_FILTERS });
  }
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
