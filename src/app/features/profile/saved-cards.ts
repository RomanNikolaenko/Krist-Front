import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccountStore } from '../../core/account-store';
import { Icon } from '../../shared/ui/icon';
import { CardBrandMark } from '../../shared/ui/card-brand';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-saved-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, CardBrandMark, T],
  styles: `
    :host { display: block; }

    .add {
      width: 100%;
      max-width: 20rem;
      margin-bottom: 1.625rem;
    }

    .card {
      display: grid;
      grid-template-columns: 3.625rem minmax(0, 1fr) auto;
      align-items: center;
      gap: 1.25rem;
      padding-block: 1.25rem;
      border-bottom: 0.0625rem solid var(--c-line);
    }
    .card:last-of-type { border-bottom: none; }

    .label { font-size: 1.125rem; font-weight: 600; color: var(--c-heading); }
    .number { font-size: var(--fs-body); color: var(--c-body); margin-top: 0.125rem; }

    .empty { padding: 1.875rem 0; }

    @container panel (max-width: 30rem) {
      .card { grid-template-columns: 3.625rem minmax(0, 1fr); row-gap: 0.75rem; }
      .action { grid-column: 2; justify-self: start; }
    }
  `,
  template: `
    <a class="btn btn--primary add" routerLink="/checkout/payment">
      <app-icon [name]="'plus'" [size]="24" />
      {{ 'cards.addNew' | t }}
    </a>

    @for (card of account.cards(); track card.id) {
      <div class="card">
        <app-card-brand [brand]="card.brand" />

        <div>
          <p class="label">{{ card.label }}</p>
          <p class="number">{{ card.number }}</p>
        </div>

        <button type="button" class="action action--danger" (click)="account.removeCard(card.id)"
                [attr.aria-label]="'cards.deleteLabel' | t: { label: card.label }">
          <app-icon [name]="'trash'" [size]="24" /> {{ 'cards.delete' | t }}
        </button>
      </div>
    }

    @if (!account.cards().length) {
      <p class="muted empty">{{ 'cards.none' | t }}</p>
    }
  `,
})
export class SavedCards {
  protected readonly account = inject(AccountStore);
}
