import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styleUrl: './star-rating.scss',
  templateUrl: './star-rating.html',
})
export class StarRating {
  readonly value = input(0);
  readonly size = input(16);
  readonly label = input('');

  protected readonly stars = computed(() => [1, 2, 3, 4, 5]);
}
