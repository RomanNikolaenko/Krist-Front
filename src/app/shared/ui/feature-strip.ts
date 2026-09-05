import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FEATURES } from '../../core/data/content';
import { Icon, IconName } from './icon';
import { T } from '../t.pipe';

@Component({
  selector: 'app-feature-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, T],
  styles: `
    :host { display: block; }

    .features {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.5rem;
      padding-block: 2.5rem;
    }

    .features__item {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      padding: 1.25rem;
      border: 0.0625rem solid var(--c-line);
      color: var(--c-heading);
    }

    .features__icon { color: var(--c-heading); margin-bottom: 0.5rem; }

    .features__title {
      font-size: var(--fs-h3);
      font-weight: 600;
      /* keeps a two-word title from leaving one word alone on a line */
      text-wrap: balance;
    }

    .features__text {
      font-size: var(--fs-sm);
      color: var(--c-body);
      text-wrap: balance;
    }

    @container page (max-width: 56rem) {
      .features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @container page (max-width: 30rem) {
      .features { grid-template-columns: 1fr; gap: 1rem; }
      .features__item { padding: 1.25rem; }
    }
  `,
  template: `
    <div class="features">
      @for (feature of features; track feature.titleKey) {
        <article class="features__item">
          <app-icon class="features__icon" [name]="feature.icon" [size]="24" />
          <h3 class="features__title">{{ feature.titleKey | t }}</h3>
          <p class="features__text">{{ feature.textKey | t }}</p>
        </article>
      }
    </div>
  `,
})
export class FeatureStrip {
  protected readonly features = FEATURES as { icon: IconName; titleKey: string; textKey: string }[];
}
