import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardBrand } from '../../core/models';

/**
 * Plain geometric stand-ins for the card-network marks — swap in the official
 * brand artwork if this ever ships to real users.
 */
@Component({
  selector: 'app-card-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './card-brand.scss',
  templateUrl: './card-brand.html',
})
export class CardBrandMark {
  readonly brand = input.required<CardBrand>();
}
