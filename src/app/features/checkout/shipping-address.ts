import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { AuthService } from '../../core/auth/auth.service';
import { CheckoutStore } from '../../core/checkout-store';
import { Address } from '../../core/models';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { OrderSummary } from '../../shared/ui/order-summary';
import { AddressForm, AddressDraft } from '../../shared/ui/address-form';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-shipping-address',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckoutSteps, OrderSummary, AddressForm, T],
  styleUrl: './shipping-address.scss',
  templateUrl: './shipping-address.html',
})
export class ShippingAddress {
  protected readonly account = inject(AccountStore);
  private readonly checkout = inject(CheckoutStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Saved addresses are somebody's, so they need an account behind them — and
   * an account with none of them has nothing to offer.
   */
  protected readonly canPickSaved = computed(
    () => this.auth.isAuthenticated() && this.account.addresses().length > 0,
  );

  /** Which one the radios are on. Not the answer yet: "Deliver here" is. */
  protected readonly picked = signal<string | null>(null);

  constructor() {
    /*
     * Land on something sensible: whatever this checkout already chose, else
     * the default address. The list arrives after the first render, so this
     * follows it rather than reading it once.
     */
    effect(() => {
      const list = this.account.addresses();
      if (!list.length) return;

      if (list.some((address) => address.id === this.picked())) return;

      /*
       * Matched against the list rather than trusted: an id this checkout chose
       * earlier can belong to an address since deleted, and pointing the radios
       * at one of those left "Deliver here" doing nothing at all.
       */
      const chosen =
        list.find((address) => address.id === this.checkout.address()?.id) ??
        this.account.defaultAddress();

      this.picked.set(chosen?.id ?? null);
    });
  }

  protected line(a: Address): string {
    return `${a.line1} ${a.area}, ${a.state} ${a.pin}`;
  }

  /** Answers the step with one of the saved addresses. */
  protected deliverHere(): void {
    const address = this.account.addresses().find((row) => row.id === this.picked());
    if (!address) return;

    this.checkout.deliverTo({ ...address });
    void this.router.navigate(['/checkout/payment']);
  }

  /**
   * Answers it with a freshly typed one. Signed in, it is saved to the account
   * as well, so the next order can pick it from the list; a guest's stays with
   * this checkout, which is the only place that could hold it.
   */
  protected async useNew(draft: AddressDraft): Promise<void> {
    if (this.auth.isAuthenticated()) {
      const created = await this.account.addAddress(draft);
      this.checkout.deliverTo({ ...created });
    } else {
      this.checkout.deliverTo({ ...draft, id: null });
    }

    void this.router.navigate(['/checkout/payment']);
  }
}
