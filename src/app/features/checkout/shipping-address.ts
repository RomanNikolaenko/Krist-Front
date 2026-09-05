import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { Address } from '../../core/models';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { OrderSummary } from '../../shared/ui/order-summary';
import { AddressForm, AddressDraft } from '../../shared/ui/address-form';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-shipping-address',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckoutSteps, OrderSummary, AddressForm, Icon, T],
  styleUrl: './shipping-address.scss',
  templateUrl: './shipping-address.html',
})
export class ShippingAddress {
  protected readonly account = inject(AccountStore);
  private readonly router = inject(Router);

  protected line(a: Address): string {
    return `${a.line1} ${a.area}, ${a.state} ${a.pin}`;
  }

  protected add(draft: AddressDraft): void {
    this.account.addAddress(draft);
  }

  protected deliverHere(): void {
    this.router.navigate(['/checkout/payment']);
  }
}
