import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './auth/api.config';
import { I18n } from './i18n/i18n';
import { ColorName, Order, SizeName } from './models';

export interface OrderLineDraft {
  productId: string;
  size: SizeName;
  color?: ColorName;
  qty: number;
}

/**
 * Placing an order sends what and how many — never a price.
 *
 * The server reads every price from the catalogue and works out the discount
 * from the code, so a total assembled in the browser cannot become the total
 * that is charged.
 */
@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);
  private readonly i18n = inject(I18n);

  /**
   * Asked for in the URL, like everywhere else that reads a translated name.
   * Without it the server falls back to Accept-Language — the browser's idea of
   * the reader's language rather than the one they chose in the app, which is
   * how an English page came to list a colour in Ukrainian.
   */
  private lang(): string {
    return `lang=${this.i18n.lang()}`;
  }

  list(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${this.api}/orders?${this.lang()}`));
  }

  /** One order in full. The server serves only the ones that are yours. */
  byId(id: string): Promise<Order> {
    return firstValueFrom(this.http.get<Order>(`${this.api}/orders/${id}?${this.lang()}`));
  }

  place(lines: OrderLineDraft[], addressId?: string, discountCode?: string): Promise<Order> {
    return firstValueFrom(
      this.http.post<Order>(`${this.api}/orders`, {
        lines,
        ...(addressId ? { addressId } : {}),
        ...(discountCode ? { discountCode } : {}),
      }),
    );
  }

  /** Cancels a single line of an order that has not shipped. */
  cancelLine(lineId: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.api}/orders/items/${lineId}/cancel`, {}));
  }
}
