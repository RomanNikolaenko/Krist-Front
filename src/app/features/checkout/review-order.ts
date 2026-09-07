import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { AuthService } from '../../core/auth/auth.service';
import { CartStore } from '../../core/cart-store';
import { CheckoutStore } from '../../core/checkout-store';
import { OrdersApi } from '../../core/orders.api';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { OrderSummary } from '../../shared/ui/order-summary';
import { Icon } from '../../shared/ui/icon';
import { Modal } from '../../shared/ui/modal';
import { I18n } from '../../core/i18n/i18n';
import { D } from '../../shared/d.pipe';
import { T } from '../../shared/t.pipe';

interface ApiError {
  message?: string | string[];
}

@Component({
  selector: 'app-review-order',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink, CheckoutSteps, OrderSummary, Icon, Modal, D, T],
  styleUrl: './review-order.scss',
  templateUrl: './review-order.html',
})
export class ReviewOrder {
  protected readonly cart = inject(CartStore);
  protected readonly checkout = inject(CheckoutStore);
  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountStore);
  private readonly orders = inject(OrdersApi);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);

  protected readonly confirmed = signal(false);
  protected readonly placing = signal(false);
  protected readonly failure = signal('');
  protected readonly eta = new Date(Date.now() + 5 * 86_400_000);

  protected readonly paymentLabel = computed(() => {
    const payment = this.checkout.payment();
    if (!payment) return this.i18n.translate('review.noPayment');
    if (payment.method !== 'card') return this.i18n.translate(`payLabel.${payment.method}`);

    // The four digits are all this ever knew about the card.
    return this.i18n.translate('payLabel.card', { last4: `•••• ${payment.last4 ?? ''}`.trim() });
  });

  /**
   * Places the order for real.
   *
   * This screen used to open the confirmation dialog and stop there, which is
   * why "My orders" stayed empty after every checkout: nothing was ever sent.
   * The lines carry what and how many and no prices — the server reads those
   * from the catalogue, so a total edited in the browser is not a total anybody
   * gets charged.
   */
  protected async placeOrder(): Promise<void> {
    if (this.placing() || !this.cart.items().length) return;

    this.placing.set(true);
    this.failure.set('');

    try {
      const addressId = await this.addressForOrder();

      await this.orders.place(
        this.cart.items().map((item) => ({
          productId: item.productId,
          size: item.size,
          ...(item.color ? { color: item.color } : {}),
          qty: item.qty,
        })),
        addressId ?? undefined,
        this.cart.appliedCode() ?? undefined,
      );

      /*
       * Spent the moment the server has it, not when the dialog is dismissed.
       * Reloading with the dialog open used to leave a full basket on a page
       * whose order had already been placed — and pressing the button again
       * placed a second one.
       */
      this.cart.clear();
      this.checkout.reset();
      this.confirmed.set(true);
    } catch (error) {
      this.failure.set(this.messageFor(error));
    } finally {
      this.placing.set(false);
    }
  }

  /**
   * An order points at a saved address, so one typed as a guest has to become
   * one first — by this point they have signed in, which is what makes that
   * possible.
   */
  private async addressForOrder(): Promise<string | null> {
    const address = this.checkout.address();
    if (!address) return null;
    if (address.id) return address.id;

    const { id, ...draft } = address;
    const created = await this.account.addAddress(draft);
    this.checkout.deliverTo({ ...created });

    return created.id;
  }

  private messageFor(error: unknown): string {
    const detail = error instanceof HttpErrorResponse ? (error.error as ApiError | null) : null;
    const message = detail?.message;

    if (typeof message === 'string' && message) return message;
    if (Array.isArray(message) && message.length) return message[0];

    return this.i18n.translate('review.orderFailed');
  }

  protected viewOrder(): void {
    this.confirmed.set(false);
    void this.router.navigate(['/profile/orders']);
  }

  protected goHome(): void {
    this.confirmed.set(false);
    void this.router.navigate(['/']);
  }
}
