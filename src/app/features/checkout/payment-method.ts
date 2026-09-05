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
  styleUrl: './payment-method.scss',
  templateUrl: './payment-method.html',
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
