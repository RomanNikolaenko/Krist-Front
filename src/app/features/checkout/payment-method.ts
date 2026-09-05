import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountStore, PaymentMethod } from '../../core/account-store';
import { CardBrand } from '../../core/models';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { OrderSummary } from '../../shared/ui/order-summary';
import { T } from '../../shared/t.pipe';

/**
 * Prototype payment step — nothing is submitted anywhere; the card fields
 * exist only to reproduce the mockup's layout.
 */
@Component({
  selector: 'app-payment-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CheckoutSteps, OrderSummary, T],
  styles: `
    :host { display: block; }

    .layout { display: grid; grid-template-columns: 1fr 22.5rem; gap: 3.75rem; align-items: start; }

    h2 { font-size: var(--fs-body); font-weight: 600; margin-bottom: 1.375rem; }

    .option { border-bottom: 0.0625rem solid var(--c-line); padding-block: 1.25rem; }
    .option:first-of-type { padding-top: 0; }

    .option__label {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      font-size: var(--fs-body);
      font-weight: 600;
      color: var(--c-heading);
      cursor: pointer;
    }

    .card-form {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
      max-width: 43.75rem;
      margin-top: 1.375rem;
    }

    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.125rem; }

    .add-card { align-self: flex-start; padding-inline: 3.75rem; }

    .continue { margin-top: 1.75rem; padding-inline: 3.75rem; }

    @container page (max-width: 64rem) { .layout { grid-template-columns: minmax(0, 1fr) 18.75rem; gap: 2rem; } }
    @container page (max-width: 50rem) { .layout { grid-template-columns: minmax(0, 1fr); } }
    @container page (max-width: 32rem) { .pair { grid-template-columns: 1fr; } }
  `,
  template: `
    <div class="container page">
      <h1 class="page__title">{{ 'pay.title' | t }}</h1>

      <div class="layout">
        <div>
          <app-checkout-steps current="payment" />

          <h2>{{ 'pay.select' | t }}</h2>

          @for (option of options; track option.key) {
            <div class="option">
              <label class="option__label check check--radio">
                <input type="radio" name="payment" [value]="option.key"
                       [checked]="account.payment() === option.key"
                       (change)="account.selectPayment(option.key)" />
                <span>{{ option.labelKey | t }}</span>
              </label>

              @if (option.key === 'card' && account.payment() === 'card') {
                <form class="card-form" [formGroup]="form" (ngSubmit)="addCard()">
                  <label class="field">
                    <span class="field__label">{{ 'pay.cardNumber' | t }}</span>
                    <input class="control" type="text" formControlName="number" placeholder="0000 0000 0000 0000"
                           inputmode="numeric" autocomplete="off" [class.is-invalid]="invalid('number')" />
                    @if (invalid('number')) { <span class="field__error">{{ 'pay.cardNumberInvalid' | t }}</span> }
                  </label>

                  <label class="field">
                    <span class="field__label">{{ 'pay.cardName' | t }}</span>
                    <input class="control" type="text" formControlName="holder" [placeholder]="'pay.cardNamePlaceholder' | t"
                           [class.is-invalid]="invalid('holder')" />
                    @if (invalid('holder')) { <span class="field__error">{{ 'pay.cardNameRequired' | t }}</span> }
                  </label>

                  <div class="pair">
                    <label class="field">
                      <span class="field__label">{{ 'pay.expiry' | t }}</span>
                      <input class="control" type="text" formControlName="expiry" placeholder="MM/YY"
                             [class.is-invalid]="invalid('expiry')" />
                      @if (invalid('expiry')) { <span class="field__error">{{ 'pay.expiryInvalid' | t }}</span> }
                    </label>

                    <label class="field">
                      <span class="field__label">{{ 'pay.cvv' | t }}</span>
                      <input class="control" type="password" formControlName="cvv" placeholder="•••"
                             inputmode="numeric" autocomplete="off" [class.is-invalid]="invalid('cvv')" />
                      @if (invalid('cvv')) { <span class="field__error">{{ 'pay.cvvInvalid' | t }}</span> }
                    </label>
                  </div>

                  <button type="submit" class="btn btn--primary add-card">{{ 'pay.addCard' | t }}</button>
                </form>
              }
            </div>
          }

          <button type="button" class="btn btn--primary continue" (click)="continue()">{{ 'pay.continue' | t }}</button>
        </div>

        <app-order-summary />
      </div>
    </div>
  `,
})
export class PaymentMethodPage {
  protected readonly account = inject(AccountStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly options: { key: PaymentMethod; labelKey: string }[] = [
    { key: 'card', labelKey: 'pay.card' },
    { key: 'gpay', labelKey: 'pay.gpay' },
    { key: 'paypal', labelKey: 'pay.paypal' },
    { key: 'cod', labelKey: 'pay.cod' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.pattern(/^[\d\sX]{16,19}$/)]],
    holder: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected addCard(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { number, holder, expiry } = this.form.getRawValue();
    const brand: CardBrand = number.trim().startsWith('5') ? 'mastercard' : 'visa';
    this.account.addCard({
      label: brand === 'mastercard' ? 'Master Card' : 'Visa Card',
      number: mask(number),
      holder,
      expiry,
      brand,
    });
    this.form.reset();
  }

  protected continue(): void {
    this.router.navigate(['/checkout/review']);
  }
}

/** Keeps only the first four and last four digits — nothing sensitive is stored. */
function mask(number: string): string {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 8) return number;
  return `${digits.slice(0, 4)} ${digits.slice(4, 6)}XX XXXX ${digits.slice(-4)}`;
}
