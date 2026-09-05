import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styles: `
    :host { display: inline-flex; align-items: center; gap: 0.375rem; }
    .stars { display: inline-flex; gap: 0.125rem; color: var(--c-star); }
    .stars .off { color: var(--c-line); }
    .meta { font-size: var(--fs-sm); color: var(--c-muted); }
  `,
  template: `
    <!-- role="img" so the label is allowed here: aria-label is prohibited on a bare span -->
    <span class="stars" role="img" [attr.aria-label]="'product.stars' | t: { count: value() }">
      @for (i of stars(); track i) {
        <app-icon [name]="i <= value() ? 'star-filled' : 'star'" [size]="size()"
                  [class.off]="i > value()" />
      }
    </span>
    @if (label(); as text) { <span class="meta">{{ text }}</span> }
  `,
})
export class StarRating {
  readonly value = input(0);
  readonly size = input(16);
  readonly label = input('');

  protected readonly stars = computed(() => [1, 2, 3, 4, 5]);
}
