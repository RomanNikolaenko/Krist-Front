import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './auth/api.config';
import { I18n } from './i18n/i18n';
import { OrderStatus } from './models';

/** One language of a product. Blank fields fall back to the base language. */
export interface ProductTranslation {
  locale: string;
  name: string | null;
  description: string | null;
}
export interface AdminProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  /** Both levels, told apart by `parentKey`. */
  categories: { key: string; name: string; parentKey: string | null }[];
  /** One entry per locale; the base language lives in the fields above. */
  translations: ProductTranslation[];
  /** `name` goes back to the server; `label` is the one in the chosen language. */
  colors: { name: string; label: string }[];
  sizes: string[];
  inStock: boolean;
  images: string[];
  /** Shown before a delete, so nobody removes something people wrote about. */
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductPage {
  items: AdminProduct[];
  total: number;
  pages: number;
}

export interface ProductDraft {
  brand: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  categories: string[];
  /** One entry per locale; the base language lives in the fields above. */
  translations: ProductTranslation[];
  colors: string[];
  sizes: string[];
  inStock: boolean;
  images: { url: string }[];
}

/** The four an administrator may set. Cancelling stays the customer's. */
export const ADMIN_ORDER_STATUSES = [
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'RETURNED',
] as const satisfies readonly OrderStatus[];

export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export interface AdminOrderLine {
  id: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string | null;
  colorLabel: string | null;
  qty: number;
  status: OrderStatus;
}

export interface AdminOrder {
  id: string;
  number: string;
  placedAt: string;
  total: number;
  customer: { name: string; email: string };
  /** Flattened by the server. Null once the address has been deleted. */
  shipTo: string | null;
  /** Null when the lines disagree — half shipped is not a status. */
  status: OrderStatus | null;
  lines: AdminOrderLine[];
}

export interface AdminOrderPage {
  items: AdminOrder[];
  total: number;
  pages: number;
}

/** A taxonomy row's name in another language. */
export interface TaxonomyName {
  locale: string;
  name: string;
}

export interface AdminColor {
  id: string;
  name: string;
  slug: string;
  hex: string;
  position: number;
  /** The name in the language asked for; `name` is the base one. */
  label: string;
  translations: TaxonomyName[];
  _count: { products: number };
}

export interface AdminSize {
  id: string;
  name: string;
  slug: string;
  position: number;
  _count: { products: number };
}

export interface AdminCategory {
  id: string;
  key: string;
  name: string;
  slug: string;
  image: string | null;
  position: number;
  /** Null for a department; the department id for what sits inside one. */
  parentId: string | null;
  /** The name in the language asked for; `name` is the base one. */
  label: string;
  translations: TaxonomyName[];
  _count: { products: number };
}

/**
 * The catalogue, from the other side.
 *
 * Everything here needs `products.write`, which the route guard has already
 * checked by the time any of it is called — this layer only knows the URLs.
 */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);
  private readonly i18n = inject(I18n);

  /**
   * The admin panel is translated, so the names it lists are too.
   *
   * Appended per call rather than set as a header, for the same reason the
   * storefront does it: a language in the URL is a language the caller can see
   * it asked for.
   */
  private lang(): string {
    return `lang=${this.i18n.lang()}`;
  }

  products(query: { q?: string; page?: number }): Promise<AdminProductPage> {
    const params = new URLSearchParams({ lang: this.i18n.lang() });
    if (query.q?.trim()) params.set('q', query.q.trim());
    if (query.page) params.set('page', String(query.page));

    return firstValueFrom(
      this.http.get<AdminProductPage>(`${this.api}/admin/products?${params.toString()}`),
    );
  }

  orders(query: { q?: string; status?: OrderStatus | ''; page?: number }): Promise<AdminOrderPage> {
    const params = new URLSearchParams({ lang: this.i18n.lang() });
    if (query.q?.trim()) params.set('q', query.q.trim());
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', String(query.page));

    return firstValueFrom(
      this.http.get<AdminOrderPage>(`${this.api}/admin/orders?${params.toString()}`),
    );
  }

  /** Moves the whole order; the server leaves cancelled lines where they are. */
  setOrderStatus(id: string, status: AdminOrderStatus): Promise<AdminOrder> {
    return firstValueFrom(
      this.http.patch<AdminOrder>(`${this.api}/admin/orders/${id}/status?${this.lang()}`, {
        status,
      }),
    );
  }

  product(id: string): Promise<AdminProduct> {
    return firstValueFrom(this.http.get<AdminProduct>(`${this.api}/admin/products/${id}`));
  }

  createProduct(draft: ProductDraft): Promise<AdminProduct> {
    return firstValueFrom(this.http.post<AdminProduct>(`${this.api}/admin/products`, draft));
  }

  updateProduct(id: string, draft: Partial<ProductDraft>): Promise<AdminProduct> {
    return firstValueFrom(this.http.patch<AdminProduct>(`${this.api}/admin/products/${id}`, draft));
  }

  deleteProduct(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/admin/products/${id}`));
  }

  colors(): Promise<AdminColor[]> {
    return firstValueFrom(this.http.get<AdminColor[]>(`${this.api}/admin/colors?${this.lang()}`));
  }

  createColor(body: {
    name: string;
    hex: string;
    translations?: TaxonomyName[];
  }): Promise<AdminColor> {
    return firstValueFrom(this.http.post<AdminColor>(`${this.api}/admin/colors`, body));
  }

  updateColor(
    id: string,
    body: { name?: string; hex?: string; translations?: TaxonomyName[] },
  ): Promise<AdminColor> {
    return firstValueFrom(this.http.patch<AdminColor>(`${this.api}/admin/colors/${id}`, body));
  }

  deleteColor(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/admin/colors/${id}`));
  }

  sizes(): Promise<AdminSize[]> {
    return firstValueFrom(this.http.get<AdminSize[]>(`${this.api}/admin/sizes`));
  }

  createSize(body: { name: string; position?: number }): Promise<AdminSize> {
    return firstValueFrom(this.http.post<AdminSize>(`${this.api}/admin/sizes`, body));
  }

  updateSize(id: string, body: { name?: string; position?: number }): Promise<AdminSize> {
    return firstValueFrom(this.http.patch<AdminSize>(`${this.api}/admin/sizes/${id}`, body));
  }

  deleteSize(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/admin/sizes/${id}`));
  }

  categories(): Promise<AdminCategory[]> {
    return firstValueFrom(
      this.http.get<AdminCategory[]>(`${this.api}/admin/categories?${this.lang()}`),
    );
  }

  createCategory(body: {
    name: string;
    parentId?: string;
    translations?: TaxonomyName[];
  }): Promise<AdminCategory> {
    return firstValueFrom(this.http.post<AdminCategory>(`${this.api}/admin/categories`, body));
  }

  updateCategory(
    id: string,
    body: { name?: string; translations?: TaxonomyName[] },
  ): Promise<AdminCategory> {
    return firstValueFrom(
      this.http.patch<AdminCategory>(`${this.api}/admin/categories/${id}`, body),
    );
  }

  deleteCategory(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/admin/categories/${id}`));
  }
}
