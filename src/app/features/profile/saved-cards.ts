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
  styleUrl: './saved-cards.scss',
  templateUrl: './saved-cards.html',
})
export class SavedCards {
  protected readonly account = inject(AccountStore);
}
