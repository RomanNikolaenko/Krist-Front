import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
import { T } from '../../shared/t.pipe';

/** Success state: the reset screen sits blurred behind a confirmation card. */
@Component({
  selector: 'app-password-changed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, T],
  styles: `
    :host { display: block; }

    .stage { position: relative; min-height: 100vh; display: grid; place-items: center; }

    .behind {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      filter: blur(0.4375rem);
      pointer-events: none;
    }

    .behind img { width: 100%; height: 100%; object-fit: cover; }

    .ghost {
      background: var(--c-surface-alt);
      display: grid;
      place-items: center;
      padding: 3.75rem;
    }

    .ghost__inner { width: 100%; max-width: 27.8125rem; display: flex; flex-direction: column; gap: 1.375rem; }
    .ghost__bar { height: 1.125rem; background: rgba(60, 66, 66, .12); border-radius: var(--r-sm); }
    .ghost__bar--sm { width: 55%; }
    .ghost__field { height: 3.25rem; border: 0.0625rem solid rgba(60, 66, 66, .2); border-radius: var(--r-md); }
    .ghost__btn { height: 3.25rem; background: var(--c-ink); border-radius: var(--r-md); opacity: .85; }

    .card {
      position: relative;
      z-index: 1;
      background: var(--c-panel);
      width: min(26.875rem, calc(100vw - 2.5rem));
      padding: 2.5rem 2rem 2rem;
      text-align: center;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.625rem;
    }

    .ring {
      width: 5.5rem; height: 5.5rem;
      border-radius: 50%;
      background: var(--c-surface);
      display: grid; place-items: center;
      margin-bottom: 0.75rem;
    }

    .dot {
      width: 3.875rem; height: 3.875rem;
      border-radius: 50%;
      background: var(--c-ink);
      color: var(--c-on-ink);
      display: grid; place-items: center;
    }

    h1 { font-size: 1.375rem; font-weight: 600; }
    p { font-size: var(--fs-sm); color: var(--c-body); margin-bottom: 0.875rem; }
    .btn { width: 100%; padding-block: 0.9375rem; }

    @media (max-width: 56.25rem) {
      .behind { grid-template-columns: 1fr; }
      .ghost { display: none; }
    }
  `,
  template: `
    <div class="stage">
      <div class="behind" aria-hidden="true">
        <img src="https://picsum.photos/seed/krist-otp/900/1200" alt="" width="900" height="1200" />
        <div class="ghost">
          <div class="ghost__inner">
            <span class="ghost__bar"></span>
            <span class="ghost__bar ghost__bar--sm"></span>
            <span class="ghost__field"></span>
            <span class="ghost__field"></span>
            <span class="ghost__btn"></span>
          </div>
        </div>
      </div>

      <div class="card" role="status">
        <span class="ring"><span class="dot"><app-icon [name]="'check'" [size]="24" /></span></span>
        <h1>{{ 'auth.changedTitle' | t }}</h1>
        <p>{{ 'auth.changedText' | t }}</p>
        <a class="btn btn--primary" routerLink="/login">{{ 'auth.backToLogin' | t }}</a>
      </div>
    </div>
  `,
})
export class PasswordChanged {}
