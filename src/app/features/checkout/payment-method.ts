import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { AuthService } from '../../core/auth/auth.service';
import { CheckoutStore } from '../../core/checkout-store';
import { CardBrand, PaymentMethod } from '../../core/models';
import { CardBrandMark } from '../../shared/ui/card-brand';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { OrderSummary } from '../../shared/ui/order-summary';
import { T } from '../../shared/t.pipe';

/**
 * Prototype payment step — nothing is charged anywhere. The number typed here
 * is read once to work out the brand and the last four digits and is then
 * dropped: a real checkout hands the card to a processor and keeps the token it
 * gets back, and a number this application never holds is one it cannot leak.
 */
@Component({
  selector: 'app-payment-method',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardBrandMark, CheckoutSteps, OrderSummary, T],
  styleUrl: './payment-method.scss',
  templateUrl: './payment-method.html',
})
export class PaymentMethodPage {
  protected readonly account = inject(AccountStore);
  private readonly checkout = inject(CheckoutStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly options: { key: PaymentMethod; labelKey: string }[] = [
    { key: 'card', labelKey: 'pay.card' },
    { key: 'gpay', labelKey: 'pay.gpay' },
    { key: 'paypal', labelKey: 'pay.paypal' },
    { key: 'cod', labelKey: 'pay.cod' },
  ];

  protected readonly method = signal<PaymentMethod>(this.checkout.payment()?.method ?? 'card');

  /** Saved cards need an account behind them, and an account that has some. */
  protected readonly canPickSaved = computed(
    () => this.auth.isAuthenticated() && this.account.cards().length > 0,
  );

  protected readonly pickedCard = signal<string | null>(this.checkout.payment()?.cardId ?? null);

  /**
   * Set by the card form for somebody with nowhere to save one. It is what the
   * review screen will name, and it is never a number — four digits and a
   * brand.
   */
  private readonly typedCard = signal<{ last4: string; brand: CardBrand } | null>(null);

  /** Only the card route needs a card; the other three are the whole answer. */
  protected readonly ready = computed(
    () => this.method() !== 'card' || this.pickedCard() !== null || this.typedCard() !== null,
  );

  protected readonly form = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.pattern(/^[\d\sX]{16,19}$/)]],
    holder: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  constructor() {
    /*
     * The list arrives after the first render, so the default card is chosen
     * when it turns up rather than read once from an empty list.
     */
    effect(() => {
      const cards = this.account.cards();
      if (!cards.length) return;

      if (!cards.some((card) => card.id === this.pickedCard())) {
        this.pickedCard.set(this.account.defaultCard()?.id ?? null);
      }
    });
  }

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  protected pickCard(id: string): void {
    this.pickedCard.set(id);
    // One card, not two: a saved one chosen replaces one typed a moment ago.
    this.typedCard.set(null);
  }

  protected async addCard(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { number, holder, expiry } = this.form.getRawValue();
    const digits = number.replace(/\D/g, '');
    const brand: CardBrand = digits.startsWith('5') ? 'MASTERCARD' : 'VISA';
    const last4 = digits.slice(-4);
    const [month, year] = expiry.split('/');

    const draft = {
      label: brand === 'MASTERCARD' ? 'Master Card' : 'Visa Card',
      holder,
      brand,
      last4,
      expiryMonth: Number(month),
      expiryYear: 2000 + Number(year),
      isDefault: false,
    };

    if (this.auth.isAuthenticated()) {
      // Kept in the account, so the next order can pick it from the list.
      const created = await this.account.addCard(draft);
      this.pickedCard.set(created.id);
      this.typedCard.set(null);
    } else {
      this.pickedCard.set(null);
      this.typedCard.set({ last4, brand });
    }

    this.form.reset();
  }

  protected continue(): void {
    if (!this.ready()) return;

    const saved = this.account.cards().find((card) => card.id === this.pickedCard());
    const last4 = saved?.last4 ?? this.typedCard()?.last4 ?? null;

    this.checkout.payBy({
      method: this.method(),
      cardId: this.method() === 'card' ? this.pickedCard() : null,
      last4: this.method() === 'card' ? last4 : null,
    });

    void this.router.navigate(['/checkout/review']);
  }
}
