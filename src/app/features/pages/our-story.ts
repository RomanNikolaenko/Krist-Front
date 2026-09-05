import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STORY_STATS, STORY_VALUES } from '../../core/data/content';
import { Icon, IconName } from '../../shared/ui/icon';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-our-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, FeatureStrip, T],
  styles: `
    :host { display: block; }

    .lead {
      max-width: 44rem;
      font-size: 1.125rem;
      color: var(--c-body);
      margin-bottom: 2.5rem;
      text-wrap: balance;
    }

    .hero {
      aspect-ratio: 21 / 9;
      overflow: hidden;
      background: var(--c-surface);
      margin-bottom: 4rem;

      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .mission {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 3.75rem;
      align-items: start;
      margin-bottom: 4.5rem;

      h2 { font-size: var(--fs-h2); }
      p { color: var(--c-body); }
    }

    .values { margin-bottom: 4.5rem; }
    .values h2 { margin-bottom: 2rem; }

    .values__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.5rem;
    }

    .value {
      border: 0.0625rem solid var(--c-line);
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;

      app-icon { color: var(--c-heading); margin-bottom: 0.5rem; }
      h3 { font-size: var(--fs-h3); font-weight: 600; text-wrap: balance; }
      p { font-size: var(--fs-sm); color: var(--c-body); text-wrap: balance; }
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1.5rem;
      background: var(--c-surface-alt);
      padding: 3rem 2.5rem;
      margin-bottom: 4.5rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      strong { font-size: 2.5rem; font-weight: 600; color: var(--c-heading); line-height: 1.1; }
      span { font-size: var(--fs-sm); color: var(--c-body); }
    }

    .cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      padding-bottom: 3rem;

      h2 { font-size: var(--fs-h2); }
    }

    @container page (max-width: 52rem) {
      .mission { grid-template-columns: 1fr; gap: 1.5rem; }
      .values__grid { grid-template-columns: 1fr; }
      .stats { grid-template-columns: repeat(2, 1fr); padding: 2rem 1.5rem; }
      .hero { aspect-ratio: 3 / 2; margin-bottom: 2.5rem; }
    }
  `,
  template: `
    <div class="container page">
      <h1 class="page__title">{{ 'story.title' | t }}</h1>
      <p class="lead">{{ 'story.lead' | t }}</p>

      <div class="hero">
        <img src="https://picsum.photos/seed/krist-story/1400/600" [alt]="'story.heroAlt' | t" width="1400" height="600" />
      </div>

      <section class="mission">
        <h2>{{ 'story.missionTitle' | t }}</h2>
        <p>{{ 'story.missionText' | t }}</p>
      </section>

      <section class="values">
        <h2>{{ 'story.valuesTitle' | t }}</h2>
        <div class="values__grid">
          @for (value of values; track value.titleKey) {
            <article class="value">
              <app-icon [name]="value.icon" [size]="24" />
              <h3>{{ value.titleKey | t }}</h3>
              <p>{{ value.textKey | t }}</p>
            </article>
          }
        </div>
      </section>

      <div class="stats">
        @for (stat of stats; track stat.labelKey) {
          <div class="stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.labelKey | t }}</span>
          </div>
        }
      </div>

      <section class="cta">
        <h2>{{ 'story.ctaTitle' | t }}</h2>
        <a class="btn btn--primary" routerLink="/shop">
          {{ 'story.cta' | t }}
          <app-icon [name]="'arrow-right'" [size]="24" />
        </a>
      </section>

      <app-feature-strip />
    </div>
  `,
})
export class OurStory {
  protected readonly values = STORY_VALUES as { icon: IconName; titleKey: string; textKey: string }[];
  protected readonly stats = STORY_STATS;
}
