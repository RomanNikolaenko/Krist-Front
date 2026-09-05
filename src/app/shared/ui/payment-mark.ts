import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PaymentBrand = 'visa' | 'mastercard' | 'gpay' | 'amex' | 'paypal';

/**
 * Geometric stand-ins for the payment marks in the footer — recognisable
 * shapes and brand colours, not the official artwork. Swap in the real files
 * before this ships to anyone; see the README.
 *
 * Each mark sits on its own white plate because these colours are fixed and
 * would not survive the dark theme on their own. The SVGs are drawn to a
 * common 16-unit height and keep their natural width, so the chips vary in
 * width the way the real badges do.
 */
@Component({
  selector: 'app-payment-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './payment-mark.scss',
  templateUrl: './payment-mark.html',
})
export class PaymentMark {
  readonly brand = input.required<PaymentBrand>();
}
