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
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      height: 1.75rem;
      padding-inline: 0.5rem;
      border-radius: 0.1875rem;
      background: var(--c-fixed-white);
    }

    svg {
      display: block;
      height: 0.75rem;
      width: auto;
    }

    .word {
      font-family: var(--font);
      font-weight: 700;
      letter-spacing: .02em;
    }
  `,
  template: `
    @switch (brand()) {
      @case ('visa') {
        <svg viewBox="0 0 40 16" role="img" aria-label="Visa">
          <text class="word" x="20" y="13" font-size="14" font-style="italic"
                text-anchor="middle" fill="#1a1f71">VISA</text>
        </svg>
      }

      @case ('mastercard') {
        <svg viewBox="0 0 28 16" role="img" aria-label="Mastercard">
          <circle cx="10" cy="8" r="7" fill="#eb001b" />
          <circle cx="18" cy="8" r="7" fill="#f79e1b" fill-opacity=".85" />
        </svg>
      }

      @case ('gpay') {
        <svg viewBox="0 0 46 16" role="img" aria-label="Google Pay">
          <!-- the Google G: a ring broken at the right, closed by the crossbar -->
          <path fill="#4285f4"
                d="M15.4 7.1H8.2v2.6h4.3a4.4 4.4 0 1 1-1.2-4.4L13.2 3.4A7.4 7.4 0 1 0 8.2 15.4c4.3 0 7.3-3 7.3-7.3 0-.4 0-.7-.1-1Z" />
          <text class="word" x="19" y="13" font-size="13" fill="#5f6368">Pay</text>
        </svg>
      }

      @case ('amex') {
        <svg viewBox="0 0 44 16" role="img" aria-label="American Express">
          <rect width="44" height="16" rx="2" fill="#2e77bc" />
          <text class="word" x="22" y="12" font-size="10" text-anchor="middle"
                fill="#ffffff">AMEX</text>
        </svg>
      }

      @case ('paypal') {
        <svg viewBox="0 0 48 16" role="img" aria-label="PayPal">
          <text class="word" x="0" y="13" font-size="14" font-style="italic" fill="#003087">Pay</text>
          <text class="word" x="24" y="13" font-size="14" font-style="italic" fill="#009cde">Pal</text>
        </svg>
      }
    }
  `,
})
export class PaymentMark {
  readonly brand = input.required<PaymentBrand>();
}
