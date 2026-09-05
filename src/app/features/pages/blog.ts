import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BLOG_POSTS } from '../../core/data/content';
import { Icon } from '../../shared/ui/icon';
import { FeatureStrip } from '../../shared/ui/feature-strip';
import { T } from '../../shared/t.pipe';

@Component({
  selector: 'app-blog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, FeatureStrip, T],
  styles: `
    :host { display: block; }

    .lead {
      max-width: 40rem;
      font-size: 1.125rem;
      color: var(--c-body);
      margin-bottom: 2.5rem;
      text-wrap: balance;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2.5rem 1.5rem;
      margin-bottom: 2rem;
    }

    .post { display: flex; flex-direction: column; }

    .post__media {
      display: block;
      aspect-ratio: 3 / 2;
      overflow: hidden;
      background: var(--c-surface);
      margin-bottom: 1rem;

      img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
    }

    .post:hover .post__media img { transform: scale(1.04); }

    .post__meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: var(--fs-xs);
      color: var(--c-muted);
      margin-bottom: 0.5rem;
    }

    .post__tag {
      background: var(--c-surface);
      color: var(--c-heading);
      padding: 0.1875rem 0.625rem;
      border-radius: var(--r-sm);
    }

    .post__title {
      font-size: var(--fs-h3);
      font-weight: 600;
      color: var(--c-heading);
      margin-bottom: 0.5rem;
      text-wrap: balance;
    }

    .post__excerpt {
      font-size: var(--fs-sm);
      color: var(--c-body);
      margin-bottom: 1rem;
      flex: 1;
    }

    .post__more {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      align-self: flex-start;
      font-size: var(--fs-sm);
      font-weight: 600;
      color: var(--c-heading);
      border-bottom: 0.0625rem solid var(--c-line-strong);
      padding-bottom: 0.125rem;

      &:hover { gap: 0.75rem; }
      app-icon { transition: transform .18s ease; }
    }

    @container page (max-width: 52rem) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @container page (max-width: 30rem) { .grid { grid-template-columns: 1fr; } }
  `,
  template: `
    <div class="container page">
      <h1 class="page__title">{{ 'blog.title' | t }}</h1>
      <p class="lead">{{ 'blog.lead' | t }}</p>

      <div class="grid">
        @for (post of posts; track post.slug) {
          <article class="post">
            <a class="post__media" href="#" [attr.aria-label]="post.title">
              <img [src]="post.image" alt="" width="900" height="600" loading="lazy" />
            </a>

            <p class="post__meta">
              <span class="post__tag">{{ post.tag }}</span>
              <span>{{ post.date }}</span>
              <span>&middot;</span>
              <span>{{ 'blog.minRead' | t: { count: post.minutes } }}</span>
            </p>

            <h2 class="post__title">{{ post.title }}</h2>
            <p class="post__excerpt">{{ post.excerpt }}</p>

            <a class="post__more" href="#">
              {{ 'blog.readMore' | t }}
              <app-icon [name]="'arrow-right'" [size]="24" />
            </a>
          </article>
        }
      </div>

      <app-feature-strip />
    </div>
  `,
})
export class Blog {
  protected readonly posts = BLOG_POSTS;
}
