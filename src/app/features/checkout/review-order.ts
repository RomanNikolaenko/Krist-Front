import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { CartStore } from '../../core/cart-store';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { OrderSummary } from '../../shared/ui/order-summary';
import { Icon } from '../../shared/ui/icon';
import { Modal } from '../../shared/ui/modal';
import { I18n } from '../../core/i18n/i18n';
import { T } from '../../shared/t.pipe';



@Component({
  selector: 'app-review-order',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink, CheckoutSteps, OrderSummary, Icon, Modal, T],
  styleUrl: './review-order.scss',
  templateUrl: './review-order.html',
})
export class ReviewOrder {
  protected readonly cart = inject(CartStore);
  protected readonly account = inject(AccountStore);
  private readonly router = inject(Router);

  protected readonly confirmed = signal(false);
  protected readonly eta = new Date(Date.now() + 5 * 86_400_000);

  private readonly i18n = inject(I18n);

  protected readonly paymentLabel = computed(() => {
    const method = this.account.payment();
    if (method !== 'card') return this.i18n.translate(`payLabel.${method}`);
    const last4 = this.account.cards()[0]?.number.slice(-2) ?? '89';
    return this.i18n.translate('payLabel.card', { last4: `.... .... .... ..${last4}` });
  });

  protected placeOrder(): void {
    this.confirmed.set(true);
  }

  protected viewOrder(): void {
    this.confirmed.set(false);
    this.cart.clear();
    this.router.navigate(['/profile/orders']);
  }

  protected goHome(): void {
    this.confirmed.set(false);
    this.cart.clear();
    this.router.navigate(['/']);
  }
}
