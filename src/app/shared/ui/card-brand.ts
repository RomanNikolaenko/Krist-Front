import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardBrand } from '../../core/models';

/**
 * Plain geometric stand-ins for the card-network marks — swap in the official
 * brand artwork if this ever ships to real users.
 */
@Component({
  selector: 'app-card-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      place-items: center;
      width: 3.625rem;
      height: 2.875rem;
      background: var(--c-brand-plate);
      flex: none;
    }
    svg { width: 2.375rem; height: 1.5rem; }
    .visa {
      font-family: var(--font);
      font-size: 0.8125rem;
      font-weight: 700;
      font-style: italic;
      letter-spacing: .04em;
      fill: #1a1f71;
    }
  `,
  template: `
    @switch (brand()) {
      @case ('mastercard') {
        <svg viewBox="0 0 38 24" aria-label="Mastercard">
          <circle cx="15" cy="12" r="9" fill="#eb001b" />
          <circle cx="23" cy="12" r="9" fill="#f79e1b" fill-opacity=".85" />
        </svg>
      }
      @case ('visa') {
        <svg viewBox="0 0 38 24" aria-label="Visa">
          <text class="visa" x="19" y="16" text-anchor="middle">VISA</text>
        </svg>
      }
    }
  `,
})
export class CardBrandMark {
  readonly brand = input.required<CardBrand>();
}
