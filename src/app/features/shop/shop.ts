import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Catalog } from '../../core/catalog';
import { ShopFilters, SortKey } from '../../core/models';
import { Accordion } from '../../shared/ui/accordion';
import { Breadcrumbs } from '../../shared/ui/breadcrumbs';
import { Icon } from '../../shared/ui/icon';
import { Pagination } from '../../shared/ui/pagination';
import { ProductCard } from '../../shared/ui/product-card';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { CurrencyPipe } from '@angular/common';
import { I18n } from '../../core/i18n/i18n';
import { Select, SelectOption } from '../../shared/ui/select';
import { T } from '../../shared/t.pipe';

/** The three fixed panels; every other key is a department's own accordion. */
type PanelKey = 'price' | 'color' | 'size';

const SORTS = new Set<string>(['latest', 'price-asc', 'price-desc', 'rating']);

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Accordion,
    Breadcrumbs,
    Icon,
    Pagination,
    ProductCard,
    FeatureStrip,
    CurrencyPipe,
    Select,
    T,
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop {
  private readonly catalog = inject(Catalog);
  private readonly i18n = inject(I18n);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /**
   * The filters live in the URL, and nowhere else.
   *
   * That is what makes a link filter: the menu can point at
   * `/shop?categories=Watches` and the shop opens narrowed, with no arrangement
   * between the two beyond the address itself. It also makes the state
   * shareable, bookmarkable and survivable across a reload — which the server
   * always assumed, and the browser never did.
   *
   * A computed rather than a signal, so there is one direction of flow: every
   * control navigates, and the URL decides what is on screen.
   */
  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly filters = computed<ShopFilters>(() => {
    const params = this.params();
    const list = (key: string): string[] =>
      params
        .get(key)
        ?.split(',')
        .map((value) => value.trim())
        .filter(Boolean) ?? [];

    return {
      q: params.get('q') ?? '',
      categories: list('categories'),
      colors: list('colors'),
      sizes: list('sizes'),
      minPrice: this.price(params.get('minPrice'), this.floor()),
      maxPrice: this.price(params.get('maxPrice'), this.ceiling()),
      sort: SORTS.has(params.get('sort') ?? '') ? (params.get('sort') as SortKey) : 'latest',
      page: Math.max(1, Math.trunc(Number(params.get('page'))) || 1),
    };
  });

  /** A price from the URL, or the end of the slider when it names none. */
  private price(raw: string | null, fallback: number): number {
    if (raw === null) return fallback;

    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  /**
   * The list comes from the server, and the resource re-fetches whenever the
   * filters signal changes — there is no subscription to keep in step.
   */
  private readonly page = this.catalog.searchResource(this.filters);
  protected readonly result = this.page.value;
  protected readonly loading = this.page.isLoading;
  protected readonly failed = computed(() => this.page.error() !== undefined);

  /** Facet counts and the price range, both derived from the catalogue. */
  private readonly facets = this.catalog.facets.value;

  /** The ends of the price slider: the cheapest and dearest things in the shop. */
  protected readonly floor = computed(() => this.facets().minPrice);
  protected readonly ceiling = computed(() => this.facets().maxPrice);

  protected readonly categories = computed(() => this.facets().categories);
  // The swatch travels with the colour now, so the shop no longer keeps its
  // own table of what each one looks like.
  protected readonly colors = computed(() =>
    this.facets().colors.map((color) => ({ ...color, token: color.hex })),
  );
  protected readonly sizes = computed(() => this.facets().sizes);

  /**
   * Where the filled part of the track starts and ends, as percentages, so the
   * bar between the two thumbs can be drawn without measuring anything.
   */
  private readonly span = computed(() => Math.max(1, this.ceiling() - this.floor()));
  protected readonly fillLeft = computed(
    () => ((this.filters().minPrice - this.floor()) / this.span()) * 100,
  );
  protected readonly fillRight = computed(
    () => 100 - ((this.filters().maxPrice - this.floor()) / this.span()) * 100,
  );

  /**
   * Where the reader is, read back out of the filters.
   *
   * Only a single narrowed category earns a trail: two departments at once is
   * a set, not a place, and "Shop / Men, Women" would be claiming a position
   * in a hierarchy that the reader is not standing in. A subcategory brings
   * its department along, so "Men Shoes" reads Shop / Men / Shoes.
   */
  protected readonly crumbs = computed(() => {
    const home = { label: this.i18n.translate('nav.shop'), link: '/shop' };
    const chosen = this.filters().categories;
    const tree = this.facets().categories;

    const leaves = chosen.filter((key) => !tree.some((department) => department.key === key));

    // A subcategory on its own, with the department it sits in.
    if (leaves.length === 1) {
      const parent = tree.find((department) =>
        department.children.some((entry) => entry.key === leaves[0]),
      );
      const child = parent?.children.find((entry) => entry.key === leaves[0]);

      if (parent) {
        return [
          home,
          {
            label: parent.name,
            link: '/shop',
            queryParams: { categories: parent.key },
          },
          { label: child?.name ?? leaves[0] },
        ];
      }
    }

    // A whole department, and nothing narrower inside it.
    const departments = chosen.filter((key) => tree.some((department) => department.key === key));

    if (departments.length === 1 && leaves.length === 0) {
      const department = tree.find((entry) => entry.key === departments[0]);

      return [home, { label: department?.name ?? departments[0] }];
    }

    return [home, { label: this.i18n.translate('shop.allProducts') }];
  });

  protected readonly sortOptions = computed<SelectOption[]>(() => [
    { value: 'latest', label: this.i18n.translate('shop.sortLatest') },
    { value: 'price-asc', label: this.i18n.translate('shop.sortPriceAsc') },
    { value: 'price-desc', label: this.i18n.translate('shop.sortPriceDesc') },
    { value: 'rating', label: this.i18n.translate('shop.sortRating') },
  ]);

  protected readonly view = signal<'grid' | 'list'>('grid');
  protected readonly filtersOpen = signal(false);

  protected readonly panels = signal<Record<PanelKey, boolean>>({
    price: true,
    color: true,
    size: true,
  });

  /**
   * Which department accordions are open.
   *
   * Closed by default, apart from any whose contents are in play: arriving
   * on a link that filters to "Men Shoes" should show that box already
   * ticked rather than hidden one click away.
   */
  private readonly openPanels = signal<Record<string, boolean>>({});

  protected isPanelOpen(key: string): boolean {
    const explicit = this.openPanels()[key];
    if (explicit !== undefined) return explicit;

    const category = this.facets().categories.find((c) => c.key === key);
    if (!category) return false;

    const chosen = this.filters().categories;
    return chosen.includes(key) || category.children.some((child) => chosen.includes(child.key));
  }

  protected readonly activeCount = computed(() => {
    const f = this.filters();
    const narrowed =
      this.ceiling() > 0 && (f.minPrice > this.floor() || f.maxPrice < this.ceiling());

    return (
      (f.q.trim() ? 1 : 0) +
      f.categories.length +
      f.colors.length +
      f.sizes.length +
      (narrowed ? 1 : 0)
    );
  });

  protected togglePanel(key: PanelKey | string): void {
    if (key === 'price' || key === 'color' || key === 'size') {
      this.panels.update((p) => ({ ...p, [key]: !p[key] }));
      return;
    }

    this.openPanels.update((p) => ({ ...p, [key]: !this.isPanelOpen(key) }));
  }

  /**
   * Whether a department is selected whole.
   *
   * That is one value in the filter — the department's own key — rather than
   * every child listed out. It has to be: a product can sit in a department
   * without being in any subcategory of it, and ticking every child would
   * quietly drop that product from the results.
   */
  protected isWholeDepartment(key: string): boolean {
    return this.filters().categories.includes(key);
  }

  /** A subcategory is ticked in its own right, or because the whole lot is. */
  protected isSubcategoryOn(departmentKey: string, childKey: string): boolean {
    const chosen = this.filters().categories;

    return chosen.includes(departmentKey) || chosen.includes(childKey);
  }

  /**
   * The department box behaves as a select-all: turning it on ticks every
   * child, turning it off clears them. The children it implies are dropped
   * from the filter rather than listed beside it, so the two can never
   * contradict each other.
   */
  protected toggleDepartment(key: string): void {
    const department = this.facets().categories.find((row) => row.key === key);
    const children = new Set(department?.children.map((child) => child.key) ?? []);
    const rest = this.filters().categories.filter((value) => value !== key && !children.has(value));

    this.apply({ categories: this.isWholeDepartment(key) ? rest : [...rest, key] });
  }

  /**
   * Unticking one part of a department leaves the rest of it ticked.
   *
   * The department key stands in for all of its children, so removing one
   * means writing the others out in full and dropping the shorthand. Selecting
   * the last missing one collapses back to the shorthand, which is what makes
   * the "everything here" box light up again on its own.
   */
  protected toggleSubcategory(departmentKey: string, childKey: string): void {
    const chosen = this.filters().categories;
    const department = this.facets().categories.find((row) => row.key === departmentKey);
    const children = department?.children.map((child) => child.key) ?? [];

    if (chosen.includes(departmentKey)) {
      const rest = children.filter((key) => key !== childKey);
      const others = chosen.filter((key) => key !== departmentKey);

      this.apply({ categories: [...others, ...rest] });
      return;
    }

    const next = toggle(chosen, childKey);
    const picked = children.filter((key) => next.includes(key));

    // Every child chosen one by one is the same thing as the department.
    if (children.length && picked.length === children.length) {
      this.apply({ categories: [...next.filter((key) => !children.includes(key)), departmentKey] });
      return;
    }

    this.apply({ categories: next });
  }

  /**
   * Lets the model own the checkbox, not the click.
   *
   * A native tick writes to the DOM before Angular hears about it. When the
   * answer afterwards is the same as the binding already held — unticking one
   * child of a ticked department leaves that child ticked in the model — the
   * binding sees no change, writes nothing, and the box silently keeps the
   * state the browser gave it. Putting it back first means the binding is
   * always the thing that decides.
   */
  protected onSubcategoryChange(event: Event, departmentKey: string, childKey: string): void {
    (event.target as HTMLInputElement).checked = this.isSubcategoryOn(departmentKey, childKey);
    this.toggleSubcategory(departmentKey, childKey);
  }

  protected onDepartmentChange(event: Event, key: string): void {
    (event.target as HTMLInputElement).checked = this.isWholeDepartment(key);
    this.toggleDepartment(key);
  }
  /** Everything else that filters by a category key: menu links, breadcrumbs. */
  protected toggleCategory(name: string): void {
    this.apply({ categories: toggle(this.filters().categories, name) });
  }

  protected toggleColor(name: string): void {
    this.apply({ colors: toggle(this.filters().colors, name) });
  }

  protected toggleSize(name: string): void {
    this.apply({ sizes: toggle(this.filters().sizes, name) });
  }

  /**
   * The two thumbs cannot cross.
   *
   * Each end is clamped against the other rather than swapped: a drag that ran
   * past its neighbour should stop there, not turn the range inside out under
   * the pointer.
   */
  protected setMinPrice(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.apply({ minPrice: Math.min(value, this.filters().maxPrice) });
  }

  protected setMaxPrice(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.apply({ maxPrice: Math.max(value, this.filters().minPrice) });
  }

  /** Asks the same question again after a failure. */
  protected retry(): void {
    this.page.reload();
  }

  /** Clears the term without touching the rest of the filters. */
  protected clearSearch(): void {
    this.apply({ q: '' });
  }

  protected setSort(sort: string): void {
    this.apply({ sort: sort as SortKey });
  }

  protected setPage(page: number): void {
    this.apply({ page }, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected reset(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  /**
   * Writes a change back to the address bar, which is what re-renders.
   *
   * Anything at its default is left out, so the URL says what was actually
   * chosen rather than spelling out the whole form — and a link somebody
   * copies carries their filters and nothing else.
   *
   * `replaceUrl` because ticking a checkbox is not a place in history: Back
   * should leave the shop, not walk through every box that was ever ticked.
   */
  private apply(patch: Partial<ShopFilters>, page = 1): void {
    const next: ShopFilters = { ...this.filters(), ...patch, page };

    const queryParams: Params = {
      q: next.q.trim() ? next.q.trim() : null,
      categories: next.categories.length ? next.categories.join(',') : null,
      colors: next.colors.length ? next.colors.join(',') : null,
      sizes: next.sizes.length ? next.sizes.join(',') : null,
      minPrice: next.minPrice > this.floor() ? next.minPrice : null,
      maxPrice: next.maxPrice < this.ceiling() ? next.maxPrice : null,
      sort: next.sort === 'latest' ? null : next.sort,
      page: next.page > 1 ? next.page : null,
    };

    void this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
