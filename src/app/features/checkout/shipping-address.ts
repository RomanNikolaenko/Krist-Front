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
  styles: `
    :host { display: block; }

    .layout { display: grid; grid-template-columns: 1fr 22.5rem; gap: 3.75rem; align-items: start; }

    h2 { font-size: var(--fs-body); font-weight: 600; }
    .lead { font-size: var(--fs-sm); color: var(--c-body); margin: 0.5rem 0 1.5rem; max-width: 62ch; }

    .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

    .card {
      border: 0.0625rem solid var(--c-line);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .card.is-on { border-color: var(--c-line-strong); }

    .card__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .card__name { font-size: var(--fs-body); font-weight: 600; color: var(--c-heading); }
    .card__lines { font-size: var(--fs-sm); color: var(--c-body); }
    .card__actions { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
    .card__actions .action { flex: 1; justify-content: center; }

    .deliver { margin: 1.75rem 0 2.25rem; padding-inline: 2.75rem; }

    hr { border: none; border-top: 0.0625rem solid var(--c-line); margin: 0 0 2rem; }

    .form-wrap { max-width: 42.5rem; }
    .form-wrap h2 { margin-bottom: 1.25rem; }

    @container page (max-width: 64rem) { .layout { grid-template-columns: minmax(0, 1fr) 18.75rem; gap: 2rem; } }
    @container page (max-width: 50rem) {
      .layout { grid-template-columns: 1fr; }
      .cards { grid-template-columns: 1fr; }
    }
  `,
  template: `
    <div class="container page">
      <h1 class="page__title">{{ 'ship.title' | t }}</h1>

      <div class="layout">
        <div>
          <app-checkout-steps current="address" />

          <h2>{{ 'ship.selectAddress' | t }}</h2>
          <p class="lead">
            {{ 'ship.lead' | t }}
          </p>

          <div class="cards">
            @for (address of account.addresses(); track address.id) {
              <div class="card" [class.is-on]="account.selectedAddress()?.id === address.id">
                <div class="card__head">
                  <span class="card__name">{{ address.name }}</span>
                  <label class="check">
                    <input type="checkbox" [checked]="account.selectedAddress()?.id === address.id"
                           (change)="account.selectAddress(address.id)"
                           [attr.aria-label]="'ship.deliverTo' | t: { name: address.name }" />
                  </label>
                </div>

                <p class="card__lines">{{ line(address) }}</p>

                <div class="card__actions">
                  <button type="button" class="action">
                    <app-icon [name]="'edit'" [size]="24" /> {{ 'addr.edit' | t }}
                  </button>
                  <button type="button" class="action action--danger" (click)="account.removeAddress(address.id)">
                    <app-icon [name]="'trash'" [size]="24" /> {{ 'addr.delete' | t }}
                  </button>
                </div>
              </div>
            }
          </div>

          <button type="button" class="btn btn--primary deliver" (click)="deliverHere()">{{ 'ship.deliverHere' | t }}</button>

          <hr />

          <div class="form-wrap">
            <h2>{{ 'ship.addNew' | t }}</h2>
            <app-address-form (saved)="add($event)" />
          </div>
        </div>

        <app-order-summary />
      </div>
    </div>
  `,
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
