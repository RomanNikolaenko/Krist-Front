import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../../shared/ui/logo';
import { T } from '../../shared/t.pipe';

/** Split screen shared by every auth frame: artwork left, form right. */
@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo, T],
  styles: `
    :host { display: block; }

    .split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      /* exactly one viewport tall, so a short form never makes the page scroll */
      height: 100dvh;
    }

    .art {
      position: relative;
      background: var(--c-surface);
      overflow: hidden;
    }

    .art img { width: 100%; height: 100%; object-fit: cover; }

    .art__logo {
      position: absolute;
      top: 3rem;
      left: 3rem;
      z-index: 1;
      /* the artwork can be light or dark, so the mark carries its own contrast */
      color: var(--c-fixed-white);
      filter: drop-shadow(0 0.0625rem 0.125rem rgba(0, 0, 0, .45))
              drop-shadow(0 0.5rem 1.5rem rgba(0, 0, 0, .35));
    }

    .panel {
      display: grid;
      place-items: center;
      padding: 3.75rem 2.5rem;
      background: var(--c-page);
      overflow-y: auto;
    }

    .inner { width: 100%; max-width: 27.8125rem; }

    @media (max-width: 56.25rem) {
      .split { grid-template-columns: 1fr; height: auto; min-height: 100dvh; }
      .art { height: 15rem; }
      .art__logo { top: 1.5rem; left: 1.5rem; }
      .panel { padding: 2.5rem 1.5rem 3.75rem; }
    }
  `,
  template: `
    <div class="split">
      <div class="art">
        @if (showLogo()) {
          <a class="art__logo" routerLink="/" [attr.aria-label]="'header.brandHome' | t"><app-logo class="light" /></a>
        }
        <img [src]="image()" alt="" width="900" height="1200" />
      </div>

      <div class="panel">
        <div class="inner"><ng-content /></div>
      </div>
    </div>
  `,
})
export class AuthLayout {
  readonly image = input.required<string>();
  readonly showLogo = input(false);
}
